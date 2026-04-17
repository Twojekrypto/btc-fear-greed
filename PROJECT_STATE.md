# BTC Fear & Greed Dashboard — Project State

> Last updated: 2026-04-17
> Live: https://twojekrypto.github.io/btc-fear-greed/
> Repo: https://github.com/Twojekrypto/btc-fear-greed

---

## 📊 Current Features

### 1. BTC & ETH Price vs. Fear & Greed Charts
- Price line colored by official Alternative.me F&G sentiment (5 levels: Ext Fear → Ext Greed)
- Left Y-axis: price ($), right Y-axis: F&G value
- Sentiment legend toggles (click to show/hide levels)
- **F&G Range Slider** (0-100) — filters data, non-matching price dims to white
- Time selector: 1M, 3M, 6M, 1Y, 2Y, 5Y, ALL
- Custom date range picker (From/To)
- Click-and-drag zoom with reset button
- Historical Win Rate statistics tables are computed dynamically from fetched history (7D, 30D, 90D, 1Y)
- F&G zones aligned to source methodology: `0-24`, `25-44`, `45-54`, `55-74`, `75-100`
- ETH chart uses the same market-wide / BTC-centric Alternative.me feed as a sentiment overlay, not as an ETH-native official index

### 2. BTC & ETH Composite Score Charts
- **Composite heuristic score** combining 7 technical inputs on **weekly (1W) candles**:
  - RSI(14), MACD(12,26,9), Stochastic(14,3,3), WaveTrend(10,21)
  - Bollinger Bands %B(20,2), 50/200 MA Cross
  - Fear & Greed Index (sentiment)
- Price line colored by composite score (4 levels):
  - 🔴 Bearish (0-29) → 🟠 Cautious (30-49) → 🟡 Bullish (50-69) → 🟢 Strong Buy (70-100)
- Left Y-axis: price ($), right Y-axis: Composite Score (0-100)
- **Score Range Slider** (0-100) — dims non-matching data in white
- Display format: `Score 71 · Strong Buy · 100% coverage`
- Historical Win Rate statistics tables are computed dynamically from weekly history (1W, 4W, 13W, 52W)
- Historical tables show row-level and per-horizon sample sizes (`n`) for transparency
- Composite score reweights only the indicators available at a given timestamp
- Minimum model coverage threshold: `70%` of total weights before a weekly score is considered valid
- No future-looking normalization in MACD / WaveTrend transforms
- Browser-side cache stores fetched F&G and price history with network-fallback behavior
- Data-quality panel shows source mode (`live`, fresh cache, fallback cache), latest joined date, and usable-history depth
- Data-quality panel also shows the active visible range / zoom context for each chart
- Calibration snapshot charts show full-history score deciles versus realized 13W hit rate with sample bars
- Calibration section now includes quick insight chips (best bucket, weakest bucket, reliable bucket count, heuristic caveat)
- **(?)** info tooltips on all tables explaining time horizons

### 3. Indicator Weights (Win Probability Composite)
| Indicator | Category | Weight |
|---|---|---|
| Fear & Greed Index | Sentiment | 20% |
| RSI(14) | Momentum | 15% |
| MACD(12,26,9) | Trend | 15% |
| Stochastic(14,3,3) | Momentum | 10% |
| WaveTrend(10,21) | Trend | 15% |
| Bollinger %B(20,2) | Mean Reversion | 10% |
| 50/200 MA Cross | Long-term Trend | 15% |

### 4. UI/UX
- New hero / methodology panel at the top of the page clarifying official vs custom signals
- Dark theme with glassmorphism effects
- Mobile responsive (breakpoints: 640px, 380px)
- `overflow-x: hidden` prevents horizontal scroll
- Official-vs-custom methodology is explained directly in the UI
- Composite score UI no longer uses `%` on axis or legend ranges to avoid implying calibrated probability
- Data source quality is surfaced directly in the chart headers instead of being hidden in implementation details
- X-axis: shows years on ALL range, months on 2Y-5Y, weeks on 6M-1Y, days on 1M-3M

---

## 🏗️ Architecture

- **Single file**: `index.html` (~2809 lines)
- **APIs**: Binance (klines), Alternative.me (F&G)
- **Libraries**: Chart.js 4.4.4, chartjs-adapter-date-fns 3.0.0
- **Factory pattern**: `createFngChart(prefix, symbol, fngMapPromise)` and `createWinProbChart(prefix, symbol, fngMapPromise)`
- **Shared functions**: `fetchPrice(symbol, loadingEl, interval)`, `fetchFearAndGreed()`, indicator calculators, dynamic backtest table builders
- **Client-side caching**: `localStorage` cache with TTL and stale-cache fallback on fetch failure
- **Data-quality metadata**: in-memory fetch metadata store for source mode, cache age, row count, and last available date
- **Calibration view**: per-score-decile charts built from the same weekly history as the backtest tables
- **Smoke test**: `scripts/dashboard-smoke-test.js` runs the inline dashboard script against mocked DOM + mocked fetch data and checks that key panels/charts render
- **Project notes**: `lesson.md` (quick running notes), `lessons.md` (session memory), `.agent/workflows/deploy.md` (safe deploy checklist)
- **Deployment**: GitHub Pages (auto from master)

---

## 📝 Session History

1. ✅ Analyzed F&G levels for best buy/sell signals
2. ✅ Added win rate statistics tables (BTC + ETH)
3. ✅ Created composite Win Probability indicator (RSI + MACD + Stoch + WaveTrend + F&G)
4. ✅ Overlay WP colors on price chart (replaced separate indicator line)
5. ✅ Added Win% Range slider to both WP charts
6. ✅ Switched WP indicators to weekly (1W) candles for long-term signals
7. ✅ Fixed slider to dim (white) instead of hide non-matching data
8. ✅ Changed "Win: 70%" to "Score: 70" to avoid confusion with win rates
9. ✅ Removed all indicator names (RSI, MACD etc.) from public view
10. ✅ Added (?) info tooltips to statistics tables
11. ✅ Fixed X-axis to show years on ALL range (range=0 bug)
12. ✅ Added Bollinger Bands %B and 50/200 MA Cross (7 indicators total)
13. ✅ Comprehensive mobile responsive design
14. ✅ Refreshed UI to separate official Alternative.me F&G from custom weekly composite score
15. ✅ Replaced hardcoded probability tables with dynamic backtests computed from fetched data
16. ✅ Aligned F&G thresholds with official Alternative.me methodology
17. ✅ Removed future leak from indicator normalization and stopped zero-filling warm-up sections
18. ✅ Added score coverage reporting and 70% minimum model-coverage gate for weekly signals
19. ✅ Clarified that ETH uses a market-wide BTC-centric sentiment overlay rather than an official ETH-native F&G feed
20. ✅ Added local note files and safer deploy workflow docs
21. ✅ Added browser cache for fetched history with stale-cache fallback on network errors
22. ✅ Renamed user-facing “Win Probability” surfaces to “Composite Score” where the model is heuristic rather than calibrated
23. ✅ Added per-horizon sample counts inside historical backtest tables
24. ✅ Added per-chart data-quality panels showing source mode, cache age, joined date, and usable depth
25. ✅ Added full-history calibration snapshots for BTC and ETH composite score deciles
26. ✅ Added visible-range context directly into each chart quality panel
27. ✅ Added calibration insight chips summarizing best / weakest buckets and reliable sample depth
28. ✅ Added a local smoke-test script for the inline dashboard runtime
29. ✅ Replaced bulky range presets/date pickers with a compact brush navigator above each chart
30. ✅ Added a browser-side JS chart layout audit for premium desktop alignment checks

---

## 🔮 Possible Next Steps
- Add rolling / walk-forward backtest view instead of only aggregate bucket stats
- Consider precomputed JSON snapshots if browser-side cache still feels too heavy on first load
- Add browser smoke-test checklist after deploy for BTC/ETH data load and table integrity
- Add stricter calibration QA, for example flag score buckets with `n < 10` more aggressively
- Add browser E2E automation once a controllable browser path is available locally
