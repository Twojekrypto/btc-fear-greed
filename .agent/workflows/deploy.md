---
description: Commit, push, and verify deployment on GitHub Pages
---

# Deploy to GitHub Pages

## Steps

// turbo
1. Check branch and git status:
   - `cd ~/Desktop/Draft/"BTC Fear" && git branch --show-current`
   - `cd ~/Desktop/Draft/"BTC Fear" && git status`

2. Run local smoke test before staging:
   - `cd ~/Desktop/Draft/"BTC Fear" && node scripts/dashboard-smoke-test.js`

3. Stage only intended files and commit:
   - Avoid `git add -A`
   - Prefer explicit staging, for example:
     - `cd ~/Desktop/Draft/"BTC Fear" && git add index.html scripts/dashboard-smoke-test.js PROJECT_STATE.md lessons.md lesson.md .agent/workflows/deploy.md`
     - `cd ~/Desktop/Draft/"BTC Fear" && git commit -m "OPIS_ZMIANY"`

4. Push the working branch first:
   - `cd ~/Desktop/Draft/"BTC Fear" && git push origin $(git branch --show-current)`

5. If the change is approved for production, publish to `master`:
   - `cd ~/Desktop/Draft/"BTC Fear" && git switch master`
   - `cd ~/Desktop/Draft/"BTC Fear" && git pull --rebase origin master`
   - Merge or cherry-pick the reviewed commit from the feature branch
   - `cd ~/Desktop/Draft/"BTC Fear" && git push origin master`

// turbo
6. Wait for deployment: `sleep 60`

7. Verify in browser:
   - Open `https://twojekrypto.github.io/btc-fear-greed/?v=TIMESTAMP`
   - Check hero / methodology panel renders correctly
   - Confirm tooltip / helper copy is in English when the product is meant to stay English-first
   - Check both BTC and ETH charts load correctly
   - Confirm composite charts no longer present score values as `%` on the axis or legend
   - Confirm each chart header shows data-quality cards with source mode and latest available date
   - Confirm each chart header also shows the visible range / zoom context
   - Confirm the sticky market snapshot and chart tabs render and switch correctly
   - Verify F&G tables render dynamic values instead of placeholders
   - Verify weekly score tables render, show coverage-aware labels and per-cell `n`
   - Verify both calibration snapshots render and that low-sample buckets are called out in the status copy
   - Verify calibration insight chips render below the chart
   - Reload once and confirm cache-aware loading does not break data integrity
   - Confirm ETH copy still describes F&G as market-wide / BTC-centric context
