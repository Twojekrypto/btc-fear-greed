#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);

if (!scriptMatch) {
    throw new Error('Inline dashboard script not found in index.html');
}

class MockClassList {
    constructor() {
        this.classes = new Set();
    }

    add(...tokens) {
        tokens.forEach(token => this.classes.add(token));
    }

    remove(...tokens) {
        tokens.forEach(token => this.classes.delete(token));
    }

    toggle(token) {
        if (this.classes.has(token)) {
            this.classes.delete(token);
            return false;
        }
        this.classes.add(token);
        return true;
    }

    contains(token) {
        return this.classes.has(token);
    }
}

class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.innerHTML = '';
        this.textContent = '';
        this.value = '';
        this.dataset = {};
        this.style = {};
        this.children = [];
        this.parentNode = null;
        this.classList = new MockClassList();
        this.listeners = new Map();
    }

    addEventListener(type, handler) {
        this.listeners.set(type, handler);
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    querySelector(selector) {
        if (selector === '.active') return null;
        if (selector === '.custom-tooltip' || selector === '.wp-tooltip') return null;
        return null;
    }

    querySelectorAll(selector) {
        if (selector === '.time-btn') return [];
        return [];
    }

    getContext() {
        return {};
    }

    getBoundingClientRect() {
        return { left: 0, top: 0, right: 960, bottom: 420, width: 960, height: 420 };
    }
}

function generateKlines(symbol, interval) {
    const result = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const stepMs = interval === '1w' ? dayMs * 7 : dayMs;
    const total = interval === '1w' ? 460 : 3050;
    const start = Date.UTC(2018, 0, 1);
    const base = symbol === 'BTCUSDT' ? 9000 : 700;

    for (let index = 0; index < total; index += 1) {
        const ts = start + index * stepMs;
        const trend = interval === '1w' ? index * (symbol === 'BTCUSDT' ? 135 : 9) : index * (symbol === 'BTCUSDT' ? 16 : 1.3);
        const cyclical = Math.sin(index / (interval === '1w' ? 4.3 : 16.5)) * (symbol === 'BTCUSDT' ? 2400 : 160);
        const close = Math.max(30, base + trend + cyclical);
        const open = close * (1 - 0.006);
        const high = close * 1.02;
        const low = close * 0.98;

        result.push([
            ts,
            open.toFixed(2),
            high.toFixed(2),
            low.toFixed(2),
            close.toFixed(2),
        ]);
    }

    return result;
}

function generateFngData() {
    const result = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const start = Date.UTC(2018, 0, 1);
    const total = 3050;

    for (let index = 0; index < total; index += 1) {
        const raw = 50 + Math.sin(index / 23) * 24 + Math.cos(index / 79) * 12;
        const value = Math.max(0, Math.min(100, Math.round(raw)));
        result.push({
            timestamp: Math.floor((start + index * dayMs) / 1000).toString(),
            value: String(value),
            value_classification: value < 25 ? 'Extreme Fear'
                : value < 45 ? 'Fear'
                    : value < 55 ? 'Neutral'
                        : value < 75 ? 'Greed'
                            : 'Extreme Greed',
        });
    }

    return result.reverse();
}

const datasets = {
    'BTCUSDT:1d': generateKlines('BTCUSDT', '1d'),
    'ETHUSDT:1d': generateKlines('ETHUSDT', '1d'),
    'BTCUSDT:1w': generateKlines('BTCUSDT', '1w'),
    'ETHUSDT:1w': generateKlines('ETHUSDT', '1w'),
};

const fngRows = generateFngData();

function parseUrl(url) {
    return new URL(url);
}

function buildBinanceResponse(url) {
    const parsed = parseUrl(url);
    const symbol = parsed.searchParams.get('symbol');
    const interval = parsed.searchParams.get('interval');
    const limit = Number(parsed.searchParams.get('limit') || 1000);
    const startTime = Number(parsed.searchParams.get('startTime') || 0);
    const key = `${symbol}:${interval}`;
    const series = datasets[key] || [];
    const filtered = series.filter(row => row[0] >= startTime).slice(0, limit);
    return filtered;
}

class MockResponse {
    constructor(body) {
        this.body = body;
        this.ok = true;
        this.status = 200;
    }

    async json() {
        return this.body;
    }
}

const elements = new Map();

function getElement(id) {
    if (!elements.has(id)) {
        const tagName = id.endsWith('Chart') || id.endsWith('chart') || id.includes('fngChart') ? 'canvas' : 'div';
        elements.set(id, new MockElement(id, tagName));
    }
    return elements.get(id);
}

const document = {
    getElementById(id) {
        return getElement(id);
    },
    createElement(tagName) {
        return new MockElement('', tagName);
    },
    querySelectorAll() {
        return [];
    },
};

const chartInstances = [];

class MockChart {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this.data = config.data || { datasets: [] };
        this.options = config.options || {};
        this.canvas = { parentNode: new MockElement('', 'div') };
        this.scales = {
            x: {
                getValueForPixel(pixel) {
                    const start = Date.UTC(2024, 0, 1);
                    return start + pixel * 24 * 60 * 60 * 1000;
                },
                time: {},
            },
            yRate: {
                getPixelForValue(value) {
                    return 400 - value * 3;
                },
            },
            yWp: {
                getPixelForValue(value) {
                    return 400 - value * 3;
                },
            },
        };
        chartInstances.push(this);
    }

    update() {
        return undefined;
    }

    destroy() {
        return undefined;
    }
}

const localStorageStore = new Map();

const windowObject = {
    document,
    localStorage: {
        getItem(key) {
            return localStorageStore.has(key) ? localStorageStore.get(key) : null;
        },
        setItem(key, value) {
            localStorageStore.set(key, value);
        },
    },
    getComputedStyle() {
        return { display: 'block' };
    },
};

global.window = windowObject;
global.document = document;
global.localStorage = windowObject.localStorage;
global.Chart = MockChart;
global.fetch = async function fetchMock(url) {
    if (url.includes('alternative.me')) {
        return new MockResponse({ data: fngRows });
    }
    if (url.includes('binance.com')) {
        return new MockResponse(buildBinanceResponse(url));
    }
    throw new Error(`Unhandled fetch URL in smoke test: ${url}`);
};
global.console = console;
global.setTimeout = (fn) => {
    fn();
    return 0;
};
global.clearTimeout = () => {};
global.Date = Date;

async function flushAsync(rounds = 6) {
    for (let index = 0; index < rounds; index += 1) {
        await new Promise(resolve => setImmediate(resolve));
    }
}

async function main() {
    const runner = new Function(scriptMatch[1]);
    runner();
    await flushAsync();

    const checks = [
        {
            name: 'BTC F&G quality panel rendered',
            pass: getElement('btc-qualityPanel').innerHTML.includes('Feeds') &&
                getElement('btc-qualityPanel').innerHTML.includes('Join Quality') &&
                getElement('btc-qualityPanel').innerHTML.includes('Range Sync'),
        },
        {
            name: 'ETH F&G quality panel rendered',
            pass: getElement('eth-qualityPanel').innerHTML.includes('Feeds') &&
                getElement('eth-qualityPanel').innerHTML.includes('Join Quality') &&
                getElement('eth-qualityPanel').innerHTML.includes('Range Sync'),
        },
        {
            name: 'BTC composite quality panel rendered',
            pass: getElement('btc-wp-qualityPanel').innerHTML.includes('Latest Score') &&
                getElement('btc-wp-qualityPanel').innerHTML.includes('Feeds') &&
                getElement('btc-wp-qualityPanel').innerHTML.includes('Range Health'),
        },
        {
            name: 'ETH composite quality panel rendered',
            pass: getElement('eth-wp-qualityPanel').innerHTML.includes('Latest Score') &&
                getElement('eth-wp-qualityPanel').innerHTML.includes('Feeds') &&
                getElement('eth-wp-qualityPanel').innerHTML.includes('Range Health'),
        },
        {
            name: 'Calibration statuses were populated',
            pass: !getElement('btc-wp-calibrationStatus').textContent.includes('Preparing') &&
                !getElement('eth-wp-calibrationStatus').textContent.includes('Preparing'),
        },
        {
            name: 'Calibration insights were rendered',
            pass: getElement('btc-wp-calibrationInsights').innerHTML.includes('Best 13W') &&
                getElement('eth-wp-calibrationInsights').innerHTML.includes('Reliable buckets'),
        },
        {
            name: 'Backtest placeholders were replaced',
            pass: !getElement('btc-fng-probBody').innerHTML.includes('Calculating') &&
                !getElement('eth-fng-probBody').innerHTML.includes('Calculating') &&
                !getElement('btc-wp-probBody').innerHTML.includes('Calculating') &&
                !getElement('eth-wp-probBody').innerHTML.includes('Calculating'),
        },
        {
            name: 'All loading overlays were hidden after init',
            pass: getElement('btc-loadingOverlay').style.display === 'none' &&
                getElement('eth-loadingOverlay').style.display === 'none' &&
                getElement('btc-wp-loadingOverlay').style.display === 'none' &&
                getElement('eth-wp-loadingOverlay').style.display === 'none',
        },
        {
            name: 'Charts were instantiated',
            pass: chartInstances.length >= 6,
        },
    ];

    const failed = checks.filter(check => !check.pass);

    checks.forEach(check => {
        console.log(`${check.pass ? 'PASS' : 'FAIL'} - ${check.name}`);
    });

    if (failed.length) {
        process.exitCode = 1;
        return;
    }

    console.log('\nSmoke test summary:');
    console.log(JSON.stringify({
        charts: chartInstances.length,
        btcFngStatus: getElement('btc-fng-probStatus').textContent,
        btcWpCalibration: getElement('btc-wp-calibrationStatus').textContent,
        ethWpCalibration: getElement('eth-wp-calibrationStatus').textContent,
    }, null, 2));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
