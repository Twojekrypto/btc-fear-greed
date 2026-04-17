const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chromeCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function findChromeBinary() {
  const found = chromeCandidates.find(candidate => existsSync(candidate));
  if (!found) {
    throw new Error('Chrome binary not found. Checked: ' + chromeCandidates.join(', '));
  }
  return found;
}

async function getJson(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === 39) throw error;
      await wait(250);
    }
  }
}

async function send(ws, id, method, params = {}) {
  ws.send(JSON.stringify({ id, method, params }));
  return await new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      ws.removeEventListener('message', onMessage);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    };
    ws.addEventListener('message', onMessage);
  });
}

function rectDiff(a, b, key) {
  return Math.abs((a?.[key] ?? 0) - (b?.[key] ?? 0));
}

function assertMetric(condition, message, failures) {
  if (!condition) failures.push(message);
}

async function main() {
  const chromePath = findChromeBinary();
  const repoRoot = path.resolve(__dirname, '..');
  const targetUrl = pathToFileURL(path.join(repoRoot, 'index.html')).href;
  const debugPort = 9233;

  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--remote-debugging-port=${debugPort}`,
      'about:blank',
    ],
    {
      stdio: 'ignore',
    }
  );

  try {
    const version = await getJson(`http://127.0.0.1:${debugPort}/json/version`);
    const rootWs = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      rootWs.addEventListener('open', resolve, { once: true });
      rootWs.addEventListener('error', reject, { once: true });
    });

    let rootId = 1;
    await send(rootWs, rootId++, 'Target.createTarget', { url: targetUrl });
    await wait(2000);

    const targets = await getJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find(target => target.url === targetUrl);
    if (!pageTarget) {
      throw new Error('Could not find chart audit target in Chrome DevTools list.');
    }

    const pageWs = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      pageWs.addEventListener('open', resolve, { once: true });
      pageWs.addEventListener('error', reject, { once: true });
    });

    let pageId = 1;
    await send(pageWs, pageId++, 'Page.enable');
    await send(pageWs, pageId++, 'Runtime.enable');
    await send(pageWs, pageId++, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 2200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send(pageWs, pageId++, 'Page.reload', { ignoreCache: true });
    await wait(9000);

    const expression = `(() => {
      const sel = s => document.querySelector(s);
      const rectObj = el => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
        };
      };
      return {
        viewportWidth: window.innerWidth,
        top: rectObj(sel('#btc-container .chart-panel-top')),
        insights: rectObj(sel('#btc-container .panel-insights')),
        toolbar: rectObj(sel('#btc-container .panel-toolbar')),
        infoRow: rectObj(sel('#btc-infoRow')),
        quality: rectObj(sel('#btc-qualityPanel')),
        legend: rectObj(sel('#btc-legend')),
        slider: rectObj(sel('#btc-container .fng-slider-container')),
        range: rectObj(sel('#btc-container .chart-range-navigator')),
        chart: rectObj(sel('#btc-chartWrapper')),
        cards: Array.from(document.querySelectorAll('#btc-qualityPanel .quality-card')).map((el, i) => ({ i, ...rectObj(el) })),
        legendItems: Array.from(document.querySelectorAll('#btc-legend .legend-item')).map((el, i) => ({ i, ...rectObj(el) })),
        computed: {
          topColumns: getComputedStyle(sel('#btc-container .chart-panel-top')).gridTemplateColumns,
          qualityColumns: getComputedStyle(sel('#btc-qualityPanel')).gridTemplateColumns,
          toolbarPadding: getComputedStyle(sel('#btc-container .panel-toolbar')).padding,
          insightsPaddingRight: getComputedStyle(sel('#btc-container .panel-insights')).paddingRight,
        }
      };
    })()`;

    const result = await send(pageWs, pageId++, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    const layout = result.result.value;
    console.log(JSON.stringify(layout, null, 2));

    const failures = [];
    assertMetric(layout.viewportWidth === 1440, `Expected desktop viewport 1440px, got ${layout.viewportWidth}px`, failures);
    assertMetric(rectDiff(layout.insights, layout.toolbar, 'top') <= 1, 'Insights and toolbar should start on the same top line.', failures);
    assertMetric(rectDiff(layout.insights, layout.toolbar, 'bottom') <= 1, 'Insights and toolbar should end on the same bottom line.', failures);
    assertMetric(rectDiff(layout.chart, layout.range, 'width') <= 1, 'Range navigator width should match chart width.', failures);
    assertMetric(rectDiff(layout.quality, layout.legend, 'top') <= 28, 'Legend row should align closely with the start of the quality row.', failures);

    const cardWidths = layout.cards.map(card => card.width);
    const cardHeights = layout.cards.map(card => card.height);
    assertMetric(Math.max(...cardWidths) - Math.min(...cardWidths) <= 1, 'Quality cards should keep a uniform width.', failures);
    assertMetric(Math.max(...cardHeights) - Math.min(...cardHeights) <= 4, 'Quality cards should keep a near-uniform height.', failures);

    if (failures.length) {
      console.error('\nLayout audit failed:');
      failures.forEach(failure => console.error('- ' + failure));
      process.exitCode = 1;
    } else {
      console.log('\nLayout audit passed.');
    }

    pageWs.close();
    rootWs.close();
  } finally {
    chrome.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
