# FASST Combine Calculator

This is a mobile-first static widget for the FASST 100-point combine system.

## What it does

- Scores athletes by `gender + grade` peer group.
- Uses the 6-metric, 100-point performance-only category structure.
- Shows category breakdown, total score, athlete tier, projection, and a short explanation.
- Gates results behind a ZIP step:
  - within 25 miles of Winchester, VA: show Momence lead form
  - outside 25 miles: prompt account creation
  - existing athletes: allow login from anywhere
- Stores demo accounts and score history in browser storage so the UI is already shaped for saved profiles and future leaderboards.

## Files

- `/Users/liz/Documents/FASST Calculator/index.html`
- `/Users/liz/Documents/FASST Calculator/styles.css`
- `/Users/liz/Documents/FASST Calculator/app.js`

## Current data connections

- Scoring tables load live from the public Google Sheet via the Google Visualization endpoint.
- ZIP verification uses the public Zippopotam.us API to get lat/lon, then applies a 25-mile Haversine radius from Winchester, VA.
- Accounts and history are temporary local-storage implementations intended to be replaced by your real account/database layer.

## Next integration steps

1. Replace the local-storage auth/history methods in `/Users/liz/Documents/FASST Calculator/app.js` with your real account endpoints or Google Sheets/App Script bridge.
2. Add a lead-form completion callback if Momence exposes one, so unlocking results can happen automatically after a confirmed submit.
3. Swap the `scoreTiers` array to your final recruiting/tier language if you want different projection ranges.
4. Embed the HTML/CSS/JS into the page or convert the logic into your preferred site builder/component system.
