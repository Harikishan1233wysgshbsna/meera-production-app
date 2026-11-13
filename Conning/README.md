# Conning QC / Tracking

This folder is separate from the RC5 LIVE Production Entry HTML. The main root index.html and RC5 LIVE/index.html remain unchanged.

Source: user-supplied **Conning_QC admin.. v33( LAST update ).html** (its document title mentions v32).

## HTML connections found in source

- Production/entry workbook ID: `1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E`, GID `1166271357`. Source reads production boxes and CONNING TRACKING via GViz and uses backend for updates.
- Operator/master workbook ID: `1zYwq_HRmykcize2ZTBOiK-uBgq_yvta14ksMiKs1wi8`, GID `2121778426`. Used for operators.
- QR planning workbook ID: `1Zk_8vvbuGGeA6teAKykPDT80eg9Em99byOakBlBVMEE`, GID `1102952581`. Queries A/B/G to map metallic product data.
- Separate Conning backend: `https://script.google.com/macros/s/AKfycbyoci-RmI8tM7SSwjfC6qn4WsSgHmIaWaE-67Xc4FDEFmEbUBiXEd0irc--iSGd41V18w/exec`.

## Important

- The source also calls server routes for tracking, conning outputs, QC, users and QR batches. Exact writable backend tabs cannot be verified from frontend code alone.
- This copy preserves source behavior. Verify whether the separate Conning deployment is live before using any write buttons.
- It references relative `manifest.webmanifest`, `sw.js` and icon files; those are NOT included yet. Do not assume offline/PWA functions work until the assets are arranged.
- Do not rename the source app to the root `index.html` or point it at Production Entry's API without separately verifying compatibility.
