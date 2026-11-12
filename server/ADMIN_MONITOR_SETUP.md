# MEERA Admin Entry Monitor — Integration checklist

## Status
- GitHub `index.html` now contains the user-side production-form snapshot sender and
  an Admin > Live User Entry Monitor panel.
- This sender is **OFF until** the existing authenticated Apps Script responds to
  `meeraMonitorCapabilities` with `{ok:true,monitorVersion:"M1"}`.
- The backend source `server/MEERA_MONITOR_V1.gs` is a template and has **not**
  been installed in LIVE Apps Script by a GitHub commit.
- Do not paste authentication tokens, GitHub personal access tokens or passwords in HTML.
  GitHub Pages is static hosting, not a secure entry collector.

## LIVE Apps Script setup (administrator)
1. Keep an export/copy of your LIVE `Code.gs` and current deployment.
2. In the same LIVE bound Apps Script project, add a new script file named
   `MEERA_MONITOR_V1` and paste the complete code from `server/MEERA_MONITOR_V1.gs`.
3. Open the LIVE `requireSession_` function. Compare its signature and
   return shape with `meeraMonitorIdentity_` in the new file.
   **Fail closed**, do not disable login verification. Ensure the returned
   user includes the real username and server-verified admin role.
4. Add these cases to the EXISTING routes, preserving all current actions:

   In `routeGet_(p)` (or the equivalent GET switch):
   ```js
   case 'meeraMonitorCapabilities':
     return meeraMonitorCapabilities_(p);
   case 'meeraMonitorRead':
     return meeraMonitorRead_(p);
   ```

   In `routePost_(body)` (or the equivalent POST switch):
   ```js
   case 'meeraMonitorPush':
     return meeraMonitorPush_(body);
   ```

5. Save Apps Script, deploy a NEW WEB APP VERSION using your existing
   production access/security settings, and make sure the HTML points to the
   correct /exec URL. Test in a copy first.
6. Log in as one TEST user, fill a production-entry form, wait around 6–25
   seconds for an editing snapshot, and queue a valid test entry.
7. Log in as Admin on a separate browser/device; open User Access >
   Admin — Live User Entry Monitor; tap Refresh. Check that draft and QUEUED
   statuses are **phone-reported**, not proof of PRODUCTION DATA save.
8. Check the new Google Sheet tab `ADMIN_ENTRY_MONITOR`. Verify no tokens
   or passwords are present. Verify user role filtering and status of a
   deliberately disconnected phone. Then test two simultaneous users.
9. Confirm real production save, backup, request ID idempotency, and automated
   recovery separately before replacing the old save writer.

## Facts/limits
- Only production-form fields are transmitted: machine, unit, box, date,
  shift, selected product, yarn code, rolls, gross/tare/net, request ID
  and client-side status.
- The monitor does NOT stream the whole phone screen or see other apps.
- Pending records held only in a turned-off phone cannot be read remotely.
- Browser POST uses no-cors, which gives no delivery acknowledgement. The
  Admin dashboard is populated only from authenticated server reads.
- Admin dashboard exports only the most recent available server monitor
  records (up to 500); this is NOT a full archival backup.
- The existing `PRODUCTION BACKUP` + `PRODUCTION DATA` remain the source of
  truth for confirmed entries. The monitor is operational visibility, not
  a replacement for the actual writer or server recovery.
- A GitHub push cannot itself deploy Apps Script or guarantee an Admin-first
  durable server write. For strict Inbox-before-Production ordering, change
  and test the main `saveEntry` server handler after reviewing its full code.
