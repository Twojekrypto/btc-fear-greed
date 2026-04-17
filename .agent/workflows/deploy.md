---
description: Commit, push, and verify deployment on GitHub Pages
---

# Deploy to GitHub Pages

## Steps

// turbo
1. Check branch and git status:
   - `cd ~/Desktop/Draft/"BTC Fear" && git branch --show-current`
   - `cd ~/Desktop/Draft/"BTC Fear" && git status`

2. Stage only intended files and commit:
   - Avoid `git add -A`
   - Prefer explicit staging, for example:
     - `cd ~/Desktop/Draft/"BTC Fear" && git add index.html PROJECT_STATE.md lessons.md lesson.md .agent/workflows/deploy.md`
     - `cd ~/Desktop/Draft/"BTC Fear" && git commit -m "OPIS_ZMIANY"`

3. Push the working branch first:
   - `cd ~/Desktop/Draft/"BTC Fear" && git push origin $(git branch --show-current)`

4. If the change is approved for production, publish to `master`:
   - `cd ~/Desktop/Draft/"BTC Fear" && git switch master`
   - `cd ~/Desktop/Draft/"BTC Fear" && git pull --rebase origin master`
   - Merge or cherry-pick the reviewed commit from the feature branch
   - `cd ~/Desktop/Draft/"BTC Fear" && git push origin master`

// turbo
5. Wait for deployment: `sleep 60`

6. Verify in browser:
   - Open `https://twojekrypto.github.io/btc-fear-greed/?v=TIMESTAMP`
   - Check hero / methodology panel renders correctly
   - Check both BTC and ETH charts load correctly
   - Verify F&G tables render dynamic values instead of placeholders
   - Verify weekly score tables render and show coverage-aware labels
   - Confirm ETH copy still describes F&G as market-wide / BTC-centric context
