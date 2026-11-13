/* RC5 LIVE WORKING-COPY SAFETY PATCH — 2026-11-13
 * GitHub-only source review: this is not the current deployed LIVE Apps Script.
 * Request IDs and box identities have whole-sheet server-side exact checks.
 * Distinct Request IDs may share a box; later rows are marked DUPLICATE.
 * Recovery confirms only matching request/owner/machine/box. Test performance under
 * concurrent load and deploy in TEST before considering LIVE.
 */
/*
 * V101 LIVE-CONFIGURED CANDIDATE — NOT VERIFIED OR DEPLOYED.
 * Created 2026-11-11 from user-supplied LIVE V100 backend.
 * Backup the current LIVE Apps Script project and spreadsheet separately before
 * any installation. No deployment has been performed by ChatGPT.
 * Frontend offline queue is NOT included in this server-side patch.
 */
/* MEERA PRODUCTION — SINGLE FILE BACKEND (VERIFIED SAVE, MERGED)
 * V101 LIVE-CONFIGURED: BACK UP LIVE SCRIPT AND SHEET BEFORE REPLACING Code.gs.
 * Remove conflicting duplicate functions only after making a full recoverable project copy.
 * Everything is merged inline: no override/monkey-patch chain any more.
 */
/*
  Production Data Entry - Google Apps Script backend
  -------------------------------------------------
  This backend provides:
    - username/password login with a one-time challenge
    - optional Microsoft 365 login through Microsoft Graph
    - server-side user/machine authorization
    - user administration for machines 1-111
    - protected product master and production-entry reads
    - protected production-entry writes (VERIFIED SAVE)
    - Doubler M/C 1-16 issue / receive
    - automatic reconciliation of interrupted saves

  IMPORTANT:
    1. Deploy as a Web app, executing as you, accessible to anyone with the link.
    2. Put the deployed /exec URL in the HTML file's API constant.
    3. Run runMeeraFixHealth() once after deploying to verify the layout.
    4. Run installMeeraReconcileTrigger() once to install the safety net.
*/

const CONFIG = {
  SPREADSHEET_ID: '1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E',
  ENTRY_SHEET_NAME: 'PRODUCTION DATA',
  MASTER_SPREADSHEET_ID: '1zYwq_HRmykcize2ZTBOiK-uBgq_yvta14ksMiKs1wi8',
  MASTER_SHEET_NAME: 'Master Sheet',
  VERIFIED_YARN_SPREADSHEET_ID: '1IkRhGMqRMtvTEGBrQo_lK0Wxark2-zdCmGLW9itk2AQ',
  VERIFIED_YARN_SHEET_NAME: 'New Master',
  OPERATOR_SHEET_NAME: 'CONNING PRO.',
  TRACKING_SPREADSHEET_ID: '1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E',
  TRACKING_SHEET_NAME: 'CONNING TRACKING',
  TRACKING_SHEET_GID: 1345174535,
  SUMMARY_SHEET_NAME: 'Summary',
  USERS_SHEET_NAME: 'USERS',
  SESSIONS_SHEET_NAME: 'SESSIONS',
  MACHINE_MIN: 1,
  MACHINE_MAX: 111,
  SESSION_HOURS: 12
};

const INITIAL_ADMIN_USERNAME = 'saurabh';
const INITIAL_ADMIN_PASSWORD = 'CHANGE_ME_BEFORE_RUN';

/* ---------------- Web-app entry points ---------------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'msCallback') return microsoftCallback_(p);
    const result = routeGet_(p);
    return output_(result, p.callback);
  } catch (err) {
    return output_({ ok: false, error: safeError_(err) }, p.callback);
  }
}

function doPost(e) {
  try {
    const body = parsePost_(e);
    const result = routePost_(body);
    return output_(result, body.callback);
  } catch (err) {
    console.error('MEERA V101 doPost failure: ' + safeError_(err));
    return output_({ ok: false, error: safeError_(err) });
  }
}

function routeGet_(p) {
  const action = String(p.action || '').trim();

  // VERIFIED SAVE: the same save is reachable over GET so the browser can
  // read a real JSON verdict through JSONP when a CORS POST is blocked.
  if (action === 'saveEntry') {
    const body = {};
    Object.keys(p).forEach(function (k) { if (k !== 'callback') body[k] = p[k]; });
    return saveEntry_(body);
  }
  if (action === 'doublerAvailableBoxes') {
    requireDoublerMachine_(p.token, p.machine || 1);
    return { ok: true, rows: doublerAvailableBoxes_() };
  }
  if (action === 'doublerOpenIssues') {
    return { ok: true, rows: getDoublerOpenIssues_(p.token, p.machine) };
  }
  if (action === 'meeraFixHealth') {
    requireAdmin_(p.token);
    return meeraFixHealth_();
  }

  if (action === 'getData') {
    var cacheHit = null;
    try { cacheHit = CacheService.getScriptCache().get('prod_rows_compact_v1'); } catch (e3) {}
    if (cacheHit) { try { return JSON.parse(cacheHit); } catch (e4) {} }
    var fresh = { ok: true, rows: getProductionRows_(), compact: true };
    try { CacheService.getScriptCache().put('prod_rows_compact_v1', JSON.stringify(fresh), 300); } catch (e5) {}
    return fresh;
  }

  if (!action) return getMasterData_();

  switch (action) {
    case 'fastLogin':
      return fastLogin_(String(p.username || ''), String(p.timeSlot || ''), String(p.proof || ''));
    case 'challenge':
      return createChallenge_(String(p.username || ''));
    case 'login':
      return login_(String(p.username || ''), String(p.challengeId || ''), String(p.proof || ''));
    case 'me':
      return { ok: true, user: publicUser_(requireSession_(p.token)) };
    case 'master':
      requireSession_(p.token);
      return { ok: true, data: getMasterData_() };
    case 'entries':
      return { ok: true, rows: String(requireSession_(p.token).role).toLowerCase() === 'admin' ? getEntries_(requireSession_(p.token)) : meeraV102UnitTodayEntries_(requireSession_(p.token)) };
    case 'unitTodayEntries':
      return { ok: true, dashboardVersion: 'V102.4', rows: meeraV102UnitTodayEntries_(requireSession_(p.token)) };
    case 'myDuplicateBoxesToday':
      return meeraRC5MyDuplicateBoxesToday_(requireSession_(p.token));
    case 'conningSources':
      return { ok: true, rows: getConningSources_(requireSession_(p.token)) };
    case 'materialIssues':
      return { ok: true, rows: getMaterialIssueRows_() };
    case 'materialStock':
      return { ok: true, rows: getMaterialStockRows_() };
    case 'traceCone':
      return traceCone_(p);
    case 'traceOptions':
      return traceOptions_();
    case 'seedMaterialStock':
      return seedMaterialStock_();
    case 'qrLookup':
      return qrLookup_(p);
    case 'planningLive':
      return getPlanningLive_();
    case 'metallicLots':
      return { ok: true, sections: getMetallicLots_() };
    case 'conningOutputs':
      return { ok: true, rows: getConningOutputs_(requireSession_(p.token)) };
    case 'carateStatus':
      return { ok: true, carate: getCarateStatus_(String(p.token || '').trim() ? requireSession_(p.token) : null, String(p.crateNo || p.carateNo || '')) };
    case 'qcPending':
      return { ok: true, rows: getQCOutputs_(requireQC_(p.token), true) };
    case 'qcFind':
      return { ok: true, row: findConningOutput_(requireQC_(p.token), String(p.code || p.outputId || p.crateNo || '')) };
    case 'users':
      requireAdmin_(p.token);
      return { ok: true, users: readUsers_().map(publicUser_) };
    case 'msStart':
      return microsoftStart_();
    case 'operators':
      return { ok: true, operators: getOperatorList_() };
    case 'tracking':
      return { ok: true, rows: getTrackingRows_() };
    case 'updateStatus':
      return updateProductionStatus_(String(p.box || ''), String(p.status || ''));
    case 'checkSaveStatus':
      return checkSaveStatus_(p);
    case 'adminPendingSummary':
      return meeraAdminPendingSummary_(p);
    case 'adminDailyStats':
      return meeraAdminDailyStats_(p);
  
    case 'bulkRecoveryStatus':
      return meeraBulkRecoveryStatus_(p);

    case 'health':
      return {
        ok: true,
        service: 'production-data-entry',
        time: new Date().toISOString(),
        version: MEERA_FIX_VERSION_
      };

    default:
      throw new Error('Unknown request.');
  }
}

function routePost_(body) {
  const action = String(body.action || '').trim();
  switch (action) {
    case 'saveEntry':
      return saveEntry_(body);
    case 'saveDoublerIssue':
      return saveDoublerIssue_(body);
    case 'createDoublerOutput':
      return createDoublerOutput_(body);
    case 'createConningOutput':
      return createConningOutput_(body);
    case 'saveMaterialIssue':
      return saveMaterialIssue_(body);
    case 'saveMaterialIssueBatch':
      return saveMaterialIssueBatch_(body);
    case 'setMaterialStock':
      return setMaterialStock_(body);
    case 'setMaterialStockBulk':
      return setMaterialStockBulk_(body);
    case 'saveQrBatch':
      return saveQrBatch_(body);
    case 'updateQC':
      return updateQC_(body);
    case 'saveTracking':
      return saveTracking_(body);
    case 'updateTracking':
      return updateTracking_(body);
    case 'updateProductionStatus':
      return updateProductionStatus_(String(body.box || (body.record && body.record.box) || ''), String(body.status || ''));
    case 'deleteTracking':
      return deleteTracking_(body);
    case 'saveUser':
      return saveUser_(body);
        case 'deleteUser':
      return deleteUser_(body);

    case 'bulkSyncOldEntries':
      return meeraBulkSyncOldEntries_(body);

    case 'adminRetryPending':
      return meeraAdminRetryPending_(body);

    case 'adminRegisterOfflineQueue':
      return meeraAdminRegisterOfflineQueue_(body);

    case 'adminReconcilePending':
      requireAdmin_(body.token);
      return meeraReconcileAllPending({
        maxRows: Number(body.maxRows) || 40
      });

    case 'logout':
      return logout_(body.token);

    default:
      throw new Error('Unknown write request.');
  }
}
function output_(value, callback) {
  const json = JSON.stringify(value);
  const cb = String(callback || '');
  if (cb && /^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function parsePost_(e) {
  if (e && e.postData && e.postData.contents) {
    const raw = String(e.postData.contents);
    try { return JSON.parse(raw); } catch (ignore) {}
  }
  if (e && e.parameter && e.parameter.payload) {
    try { return JSON.parse(String(e.parameter.payload)); } catch (ignore) {}
  }
  return (e && e.parameter) || {};
}

function safeError_(err) {
  return err && err.message ? err.message : String(err || 'Unknown error');
}

/* ---------------- Authentication ---------------- */
function createChallenge_(username) {
  const challengeId = Utilities.getUuid();
  const nonce = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('login:' + challengeId, nonce, 300);
  return { ok: true, challengeId: challengeId, nonce: nonce };
}

function fastLogin_(username, timeSlot, proof) {
  const cleanUsername = normalizeUsername_(username);
  const slot = Number(timeSlot);
  const currentSlot = Math.floor(Date.now() / 30000);
  if (!cleanUsername || !Number.isFinite(slot) || Math.abs(currentSlot - slot) > 2 || !proof) {
    throw new Error('Invalid username or password.');
  }
  const user = findUser_(cleanUsername);
  if (!user || !user.active) throw new Error('Invalid username or password.');
  const expected = sha256Hex_(String(user.passwordHash || '') + ':' + String(slot));
  if (!constantTimeEqual_(expected, proof)) throw new Error('Invalid username or password.');
  const token = issueSession_(user.username);
  return { ok: true, token: token, user: publicUser_(user) };
}

function login_(username, challengeId, proof) {
  const cleanUsername = normalizeUsername_(username);
  const nonce = CacheService.getScriptCache().get('login:' + challengeId);
  CacheService.getScriptCache().remove('login:' + challengeId);
  if (!nonce || !cleanUsername || !proof) throw new Error('Invalid username or password.');

  const user = findUser_(cleanUsername);
  if (!user || !user.active) throw new Error('Invalid username or password.');

  const expected = sha256Hex_(String(user.passwordHash || '') + nonce);
  if (!constantTimeEqual_(expected, proof)) throw new Error('Invalid username or password.');

  const token = issueSession_(user.username);
  return { ok: true, token: token, user: publicUser_(user) };
}

function issueSession_(username) {
  ensureSystemSheets_();
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SESSIONS_SHEET_NAME);
  const token = Utilities.getUuid() + '.' + Utilities.getUuid();
  const expires = new Date(Date.now() + CONFIG.SESSION_HOURS * 60 * 60 * 1000);
  sheet.appendRow([token, username, expires, new Date()]);
  return token;
}

/* Session lookup is cached for 60s. The old code read the whole SESSIONS and
   USERS tabs on EVERY request, which was a major cause of slow saves. */
function requireSession_(token) {
  const cleanToken = String(token || '');
  if (!cleanToken) throw new Error('Your session has expired. Please log in again.');
  const cache = CacheService.getScriptCache();
  const cacheKey = 'sess:' + sha256Hex_(cleanToken).slice(0, 40);
  try {
    const hit = cache.get(cacheKey);
    if (hit) {
      const cached = JSON.parse(hit);
      const fresh = findUser_(cached.username);
      if (fresh && fresh.active) return fresh;
    }
  } catch (ignore) {}

  ensureSystemSheets_();
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SESSIONS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    const rowToken = String(values[r][0] || '');
    if (rowToken !== cleanToken) continue;
    const expires = values[r][2] instanceof Date ? values[r][2] : new Date(values[r][2]);
    if (!expires || expires.getTime() <= Date.now()) {
      sheet.deleteRow(r + 1);
      throw new Error('Your session has expired. Please log in again.');
    }
    const user = findUser_(String(values[r][1] || ''));
    if (!user || !user.active) throw new Error('This account is inactive.');
    try { cache.put(cacheKey, JSON.stringify({ username: user.username }), 60); } catch (ignore) {}
    return user;
  }
  throw new Error('Your session is not valid. Please log in again.');
}

function requireAdmin_(token) {
  const user = requireSession_(token);
  if (String(user.role).toLowerCase() !== 'admin') throw new Error('Administrator access is required.');
  return user;
}

function requireQC_(token) {
  const user = requireSession_(token);
  const role = String(user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'qc') throw new Error('QC access is required.');
  return user;
}

function logout_(token) {
  const cleanToken = String(token || '');
  if (!cleanToken) return { ok: true };
  ensureSystemSheets_();
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SESSIONS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][0] || '') === cleanToken) sheet.deleteRow(r + 1);
  }
  try { CacheService.getScriptCache().remove('sess:' + sha256Hex_(cleanToken).slice(0, 40)); } catch (ignore) {}
  return { ok: true };
}

function constantTimeEqual_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}

function sha256Hex_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function (b) {
    const n = b < 0 ? b + 256 : b;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

/* ---------------- Users and machine access ---------------- */
const USER_HEADERS_ = ['Username', 'Name', 'Role', 'Active', 'Machines', 'PasswordHash', 'MicrosoftEmail', 'BoxPrefix', 'CreatedAt', 'UpdatedAt', 'RollTypes'];
const SESSION_HEADERS_ = ['Token', 'Username', 'ExpiresAt', 'CreatedAt'];

function ensureSystemSheets_() {
  const ss = getSpreadsheet_();
  let users = ss.getSheetByName(CONFIG.USERS_SHEET_NAME);
  if (!users) users = ss.insertSheet(CONFIG.USERS_SHEET_NAME);
  ensureHeaders_(users, USER_HEADERS_);

  let sessions = ss.getSheetByName(CONFIG.SESSIONS_SHEET_NAME);
  if (!sessions) sessions = ss.insertSheet(CONFIG.SESSIONS_SHEET_NAME);
  ensureHeaders_(sessions, SESSION_HEADERS_);
}

function setupSystem() {
  if (INITIAL_ADMIN_PASSWORD === 'CHANGE_ME_BEFORE_RUN') {
    throw new Error('Edit INITIAL_ADMIN_PASSWORD in the script before running setupSystem().');
  }
  ensureSystemSheets_();
  const username = normalizeUsername_(INITIAL_ADMIN_USERNAME);
  if (!findUser_(username)) resetAdminAccount();
  Logger.log('System ready. Login username: ' + username);
}

function resetAdminAccount() {
  if (INITIAL_ADMIN_PASSWORD === 'CHANGE_ME_BEFORE_RUN') {
    throw new Error('Edit INITIAL_ADMIN_PASSWORD in the script before running resetAdminAccount().');
  }
  ensureSystemSheets_();
  const username = normalizeUsername_(INITIAL_ADMIN_USERNAME);
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.USERS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const existing = findUser_(username);
  const now = new Date();
  if (existing) {
    const row = sheet.getRange(existing.rowNumber, 1, 1, Math.max(sheet.getLastColumn(), USER_HEADERS_.length)).getValues()[0];
    putCell_(row, map, 'username', username);
    putCell_(row, map, 'name', 'Saurabh');
    putCell_(row, map, 'role', 'admin');
    putCell_(row, map, 'active', true);
    putCell_(row, map, 'machines', machineRangeText_());
    putCell_(row, map, 'passwordhash', sha256Hex_(username + ':' + INITIAL_ADMIN_PASSWORD));
    putCell_(row, map, 'boxprefix', '');
    putCell_(row, map, 'rolltypes', '');
    putCell_(row, map, 'updatedat', now);
    sheet.getRange(existing.rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow([username, 'Saurabh', 'admin', true, machineRangeText_(), sha256Hex_(username + ':' + INITIAL_ADMIN_PASSWORD), '', '', now, now, '']);
  }
  Logger.log('Administrator reset: ' + username);
}

function readUsers_() {
  ensureSystemSheets_();
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.USERS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const map = headerMap_(values[0]);
  const users = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const username = normalizeUsername_(cell_(row, map, 'username'));
    if (!username) continue;
    users.push({
      rowNumber: r + 1,
      username: username,
      name: String(cell_(row, map, 'name') || username),
      role: String(cell_(row, map, 'role') || 'user').toLowerCase(),
      active: bool_(cell_(row, map, 'active')),
      machines: parseMachines_(cell_(row, map, 'machines')),
      passwordHash: String(cell_(row, map, 'passwordhash') || ''),
      microsoftEmail: String(cell_(row, map, 'microsoftemail') || '').toLowerCase(),
      boxPrefix: String(cell_(row, map, 'boxprefix') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3),
      rollTypes: parseRollTypes_(cell_(row, map, 'rolltypes')),
      createdAt: cell_(row, map, 'createdat'),
      updatedAt: cell_(row, map, 'updatedat')
    });
  }
  return users;
}

function findUser_(username) {
  const clean = normalizeUsername_(username);
  return readUsers_().find(function (u) { return u.username === clean; }) || null;
}

function publicUser_(user) {
  return {
    username: user.username,
    name: user.name,
    role: user.role,
    active: user.active,
    machines: user.role === 'admin' ? machineRange_() : user.machines,
    microsoftEmail: user.microsoftEmail || '',
    boxPrefix: user.boxPrefix || '',
    rollTypes: user.role === 'admin' ? ['A', 'B', 'C', 'D'] : (user.rollTypes || [])
  };
}

/* Doubler role merged into the single user writer. */
function saveUser_(body) {
  const admin = requireAdmin_(body.token);
  const data = body.user || {};
  const username = normalizeUsername_(data.username);
  if (!username) throw new Error('Username is required.');
  if (username === admin.username && data.active === false) throw new Error('You cannot deactivate your own account.');

  const sheet = getSpreadsheet_().getSheetByName(CONFIG.USERS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const existing = findUser_(username);
  const passwordHash = String(data.passwordHash || '') || (existing ? existing.passwordHash : '');
  if (!passwordHash) throw new Error('A password is required for a new user.');

  const requestedRole = String(data.role || 'user').toLowerCase();
  const role = ['admin', 'qc', 'doubler', 'user'].indexOf(requestedRole) >= 0 ? requestedRole : 'user';
  const active = data.active !== false && String(data.active).toLowerCase() !== 'false';
  const machines = parseMachines_(data.machines);
  const rollTypes = parseRollTypes_(data.rollTypes);
  const now = new Date();

  if (existing) {
    const row = sheet.getRange(existing.rowNumber, 1, 1, Math.max(sheet.getLastColumn(), USER_HEADERS_.length)).getValues()[0];
    putCell_(row, map, 'username', username);
    putCell_(row, map, 'name', String(data.name || username));
    putCell_(row, map, 'role', role);
    putCell_(row, map, 'active', active);
    putCell_(row, map, 'machines', machines.join(','));
    putCell_(row, map, 'passwordhash', passwordHash);
    putCell_(row, map, 'microsoftemail', String(data.microsoftEmail || '').toLowerCase());
    putCell_(row, map, 'boxprefix', String(data.boxPrefix || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3));
    putCell_(row, map, 'rolltypes', rollTypes.join(','));
    putCell_(row, map, 'updatedat', now);
    sheet.getRange(existing.rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    // Write by header position, not a hard-coded array, so a reordered USERS
    // tab can never scramble a new account.
    const width = Math.max(sheet.getLastColumn(), USER_HEADERS_.length);
    const row = new Array(width).fill('');
    putCell_(row, map, 'username', username);
    putCell_(row, map, 'name', String(data.name || username));
    putCell_(row, map, 'role', role);
    putCell_(row, map, 'active', active);
    putCell_(row, map, 'machines', machines.join(','));
    putCell_(row, map, 'passwordhash', passwordHash);
    putCell_(row, map, 'microsoftemail', String(data.microsoftEmail || '').toLowerCase());
    putCell_(row, map, 'boxprefix', String(data.boxPrefix || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3));
    putCell_(row, map, 'createdat', now);
    putCell_(row, map, 'updatedat', now);
    putCell_(row, map, 'rolltypes', rollTypes.join(','));
    sheet.appendRow(row);
  }
  return { ok: true, user: publicUser_(findUser_(username)) };
}

function deleteUser_(body) {
  const admin = requireAdmin_(body.token);
  const username = normalizeUsername_(body.username);
  if (!username || username === admin.username) throw new Error('You cannot delete your own account.');
  const user = findUser_(username);
  if (!user) return { ok: true };
  getSpreadsheet_().getSheetByName(CONFIG.USERS_SHEET_NAME).deleteRow(user.rowNumber);
  return { ok: true };
}

function normalizeUsername_(value) { return String(value || '').trim().toLowerCase(); }
function bool_(value) {
  if (typeof value === 'boolean') return value;
  const s = String(value == null ? '' : value).toLowerCase().trim();
  return !(s === 'false' || s === '0' || s === 'no' || s === 'inactive');
}
function machineRange_() {
  const out = [];
  for (let n = CONFIG.MACHINE_MIN; n <= CONFIG.MACHINE_MAX; n++) out.push(n);
  return out;
}
function machineRangeText_() { return CONFIG.MACHINE_MIN + '-' + CONFIG.MACHINE_MAX; }
const ROLL_TYPES_ = ['A', 'B', 'C', 'D'];
function parseRollTypes_(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[,;\s]+/);
  return source.map(function (item) { return String(item || '').trim().toUpperCase(); })
    .filter(function (item, index, array) { return ROLL_TYPES_.indexOf(item) >= 0 && array.indexOf(item) === index; });
}
function defaultRollTypesForMachine_(machine) {
  return Number(machine) >= 75 ? ['C', 'D'] : ['A', 'B'];
}
function allowedRollTypesForUser_(user, machine) {
  if (String(user && user.role || '').toLowerCase() === 'admin') return ROLL_TYPES_.slice();
  const explicit = parseRollTypes_(user && user.rollTypes);
  return explicit.length ? explicit : defaultRollTypesForMachine_(machine);
}
function rollTypeCode_(value) {
  const raw = String(value == null ? '' : value).trim().toUpperCase();
  if (ROLL_TYPES_.indexOf(raw) >= 0) return raw;
  const number = Number(value);
  if (number === 0.38) return 'A';
  if (number === 0.29) return 'B';
  if (number === 0.30) return 'C';
  if (number === 0.25) return 'D';
  return '';
}
function parseMachines_(value) {
  if (Array.isArray(value)) return value.map(Number).filter(validMachine_).filter(unique_).sort(numberSort_);
  const out = [];
  String(value || '').split(/[,;\s]+/).forEach(function (part) {
    if (!part) return;
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      let a = Number(range[1]), b = Number(range[2]); if (a > b) { const t = a; a = b; b = t; }
      for (let n = a; n <= b; n++) if (validMachine_(n)) out.push(n);
    } else {
      const n = Number(part); if (validMachine_(n)) out.push(n);
    }
  });
  return out.filter(unique_).sort(numberSort_);
}
function validMachine_(n) { return Number.isInteger(Number(n)) && Number(n) >= CONFIG.MACHINE_MIN && Number(n) <= CONFIG.MACHINE_MAX; }
function unique_(value, index, array) { return array.indexOf(value) === index; }
function numberSort_(a, b) { return a - b; }
/* ---------------- Master and entry data ---------------- */
function getSpreadsheet_() { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID); }
function getMasterSpreadsheet_() { return SpreadsheetApp.openById(CONFIG.MASTER_SPREADSHEET_ID); }

/* UI catalog: keep original product list, overlay only verified Yarn from
   independent Data sheet / New Master. This is NOT a save-time dependency.
   Unverified guesses and placeholders must never be sent as yarnCode.
   A missing/blank Yarn is allowed and does not block production saving.
   Cache cuts repeated cross-workbook reads; no cache is required for saveEntry.
*/
function meeraMasterKey_(name) {
  return String(name || '').trim().toUpperCase().replace(/\s+/g, ' ')
    .replace(/\s*[\[(]\s*([SZ])\s*[\])]\s*$/i, ' ($1)')
    .replace(/\s*-\s*([SZ])\s*$/i, ' ($1)').trim();
}
function meeraApprovedYarn_(value, status) {
  var y = String(value == null ? '' : value).trim();
  var st = String(status || '').trim().toUpperCase();
  if (!y || /UNVERIFIED|REVIEW|CONFLICT|INFERRED|VERIFY|NOT VERIFIED|\bTYPE\b/i.test(y)) return '';
  if (!/^(MASTER VERIFIED|MASTER \+ MANUAL VERIFIED|MANUAL FULL VERIFIED)$/.test(st)) return '';
  return y;
}
function getMasterData_() {
  var cache = CacheService.getScriptCache();
  try { var cached = cache.get('meera_master_verified_yarn_20261111_v1');
    if (cached) return JSON.parse(cached); } catch (ignore) {}
  // Original Material Movement Master remains the product catalog authority.
  var sheet = getMasterSpreadsheet_().getSheetByName(CONFIG.MASTER_SHEET_NAME);
  if (!sheet) throw new Error('Original Master Sheet not found.');
  var last = sheet.getLastRow();
  if (last < 2) return [];
  // Columns C:I include product and existing master Yarn.
  var values = sheet.getRange(2, 3, last - 1, 7).getDisplayValues();
  var overlay = {};
  // Read the separately reconciled Data sheet, not the original's stale Yarn.
  try {
    var updateSheet = SpreadsheetApp.openById(CONFIG.VERIFIED_YARN_SPREADSHEET_ID)
      .getSheetByName(CONFIG.VERIFIED_YARN_SHEET_NAME);
    if (updateSheet && updateSheet.getLastRow() > 1) {
      var verified = updateSheet.getRange(2, 1, updateSheet.getLastRow()-1, 9).getDisplayValues();
      verified.forEach(function(row) {
        var k = meeraMasterKey_(row[0]);
        var y = meeraApprovedYarn_(row[6], row[7]);
        if (k && y) overlay[k] = y;
      });
    }
  } catch (err) {
    // If updated Data sheet cannot be read, do not fail entry or catalog.
    // Fallback to original verified-looking Master value; admin should audit logs.
    console.warn('Verified Yarn overlay unavailable: ' + String(err));
  }
  var seen = {}, result = [];
  values.forEach(function(row) {
    var name = String(row[0] || '').trim(), k = meeraMasterKey_(name);
    if (!k) return;
    var original = String(row[6] || '').trim();
    // Never display placeholders, and never invent missing yarn.
    var fallback = /^\d+(?:\.\d+)?$/.test(original) ? '' :
      (/UNVERIFIED|REVIEW|CONFLICT|NOT VERIFIED/i.test(original) ? '' : original);
    var yarn = overlay[k] || fallback || '';
    if (seen[k] !== undefined) {
      if (!result[seen[k]].yarn && yarn) result[seen[k]].yarn = yarn;
    } else { seen[k] = result.length; result.push({name:name,yarn:yarn}); }
  });
  try { cache.put('meera_master_verified_yarn_20261111_v1', JSON.stringify(result), 60); } catch (ignore) {}
  return result;
}

const TRACKING_HEADERS_ = ['ID', 'Issue Date', 'Box', 'Operator', 'Product', 'Issue Qty (kg)', 'Receive Qty (kg)', 'Pending Qty (kg)', 'Status', 'Remarks', 'Created At', 'Updated At', 'Shift', 'Operator ID', 'Machine', 'No of Roll'];

function getTrackingSpreadsheet_() { return SpreadsheetApp.openById(CONFIG.TRACKING_SPREADSHEET_ID); }
function getTrackingSheet_() {
  const ss = getTrackingSpreadsheet_();
  const gid = Number(CONFIG.TRACKING_SHEET_GID);
  let sheet = ss.getSheets().filter(function (sh) { return sh.getSheetId() === gid; })[0];
  if (!sheet) sheet = ss.getSheetByName(CONFIG.TRACKING_SHEET_NAME);
  if (!sheet) throw new Error('CONNING TRACKING tab was not found in the entry spreadsheet.');
  ensureTrackingHeaders_(sheet);
  return sheet;
}
function ensureTrackingHeaders_(sheet) {
  const width = TRACKING_HEADERS_.length;
  const current = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  let changed = false;
  for (let i = 0; i < width; i++) {
    if (!String(current[i] || '').trim()) { current[i] = TRACKING_HEADERS_[i]; changed = true; }
  }
  if (changed) sheet.getRange(1, 1, 1, width).setValues([current]);
}
function getTrackingRows_() {
  const values = getTrackingSheet_().getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  return values.slice(1).filter(function (r) { return String(r[0] || '').trim() || String(r[2] || '').trim(); }).map(function (r) {
    return {
      id: String(r[0] || ''), date: String(r[1] || ''), box: String(r[2] || ''),
      operator: String(r[3] || ''), productName: String(r[4] || ''),
      issueWeight: Number(r[5]) || 0, returnWeight: Number(r[6]) || 0,
      pendingWeight: Number(r[7]) || 0, status: String(r[8] || 'Issued'),
      remarks: String(r[9] || ''), timestamp: String(r[10] || ''), lastUpdated: String(r[11] || ''),
      shift: String(r[12] || 'DAY'), operatorId: String(r[13] || ''),
      machine: String(r[14] || ''), rolls: String(r[15] || '')
    };
  });
}
function getOperatorList_() {
  const sheet = getMasterSpreadsheet_().getSheetByName(CONFIG.OPERATOR_SHEET_NAME);
  if (!sheet) return [];
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const values = sheet.getRange(2, 20, lastRow - 1, 2).getDisplayValues(); // T:U
  const out = [];
  values.forEach(function (row) {
    const code = String(row[0] || '').trim();
    const name = String(row[1] || '').trim();
    if (code || name) out.push({ code: code, name: name || code });
  });
  return out;
}
function getOperatorIdMap_() {
  const sheet = getMasterSpreadsheet_().getSheetByName(CONFIG.OPERATOR_SHEET_NAME);
  if (!sheet) throw new Error('Operator sheet not found: ' + CONFIG.OPERATOR_SHEET_NAME);
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const values = sheet.getRange(2, 20, lastRow - 1, 2).getDisplayValues(); // T:U
  const map = {};
  values.forEach(function (row) {
    const id = String(row[0] || '').trim();
    const name = String(row[1] || '').trim();
    if (name) map[name.toLowerCase()] = id;
  });
  return map;
}
function resolveOperatorId_(name) {
  const clean = String(name || '').trim().toLowerCase();
  if (!clean) return '';
  try { return getOperatorIdMap_()[clean] || ''; } catch (ignore) { return ''; }
}
function backfillOperatorIds_() {
  const sheet = getTrackingSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return 0;
  const map = getOperatorIdMap_();
  let updated = 0;
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const writes = [];
    for (let r = 1; r < values.length; r++) {
      const name = String(values[r][3] || '').trim();
      const current = String(values[r][13] || '').trim();
      const id = map[name.toLowerCase()] || '';
      if (!current && id) { writes.push([r + 1, id]); updated++; }
    }
    writes.forEach(function (w) { sheet.getRange(w[0], 14).setValue(w[1]); });
  } finally { lock.releaseLock(); }
  return updated;
}

function trackingRecord_(body) {
  const r = body.record || body;
  const issue = Number(r.issueWeight) || 0;
  const returned = Number(r.returnWeight) || 0;
  const id = String(r.id || Utilities.getUuid());
  const now = new Date();
  return {
    id: id, box: String(r.box || '').trim(), productName: String(r.productName || '').trim(),
    operator: String(r.operator || '').trim(),
    operatorId: String(r.operatorId || r.operatorCode || resolveOperatorId_(r.operator) || '').trim(),
    machine: String(r.machine || '').trim(), rolls: String(r.rolls || r.noOfRoll || '').trim(),
    date: String(r.date || '').trim(),
    shift: String(r.shift || 'DAY').toUpperCase() === 'NIGHT' ? 'NIGHT' : 'DAY',
    status: String(r.status || 'Issued'),
    issueWeight: issue, returnWeight: returned, pendingWeight: issue - returned,
    remarks: String(r.remarks || '').trim(),
    timestamp: String(r.timestamp || now.toISOString()), lastUpdated: now.toISOString()
  };
}
function trackingRow_(r) {
  return [r.id, r.date, r.box, r.operator, r.productName, r.issueWeight, r.returnWeight, r.pendingWeight, r.status, r.remarks, r.timestamp, r.lastUpdated, r.shift, r.operatorId, r.machine, r.rolls];
}
function saveTracking_(body) {
  const r = trackingRecord_(body);
  if (!r.box || !r.operator || !r.date || r.issueWeight <= 0) throw new Error('Box, operator, date, and issue weight are required.');
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { getTrackingSheet_().appendRow(trackingRow_(r)); } finally { lock.releaseLock(); }
  const sync = syncAfterTrackingWrite_(r);
  return { ok: true, id: r.id, record: r, sync: sync };
}

/* UPDATE-ONLY. A row deleted in CONNING TRACKING is never recreated by an old
   client replaying a cached ID. */
function updateTracking_(body) {
  const r = trackingRecord_(body);
  if (!r.id || !r.box || !r.operator || !r.date || r.issueWeight <= 0) throw new Error('Tracking record is incomplete.');
  const sheet = getTrackingSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  let updated = false;
  try {
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0] || '') === r.id) {
        sheet.getRange(i + 1, 1, 1, TRACKING_HEADERS_.length).setValues([trackingRow_(r)]);
        updated = true;
        break;
      }
    }
    // Keep the ledger sync INSIDE the lock so two writers cannot race.
    if (updated) {
      const sync = syncAfterTrackingWrite_(r);
      return { ok: true, updated: true, id: r.id, record: r, sync: sync };
    }
  } finally { lock.releaseLock(); }
  return { ok: true, updated: false, deleted: true, id: r.id,
    message: 'Tracking ID was not found. It was treated as deleted and was not recreated.' };
}

function deleteTracking_(body) {
  const id = String(body.id || ''); if (!id) throw new Error('Tracking ID is required.');
  const sheet = getTrackingSheet_(); const values = sheet.getDataRange().getDisplayValues();
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { for (let i = values.length - 1; i >= 1; i--) if (String(values[i][0] || '') === id) sheet.deleteRow(i + 1); }
  finally { lock.releaseLock(); }
  const sync = syncConningStatusAndSummary();
  return { ok: true, id: id, sync: sync };
}

function syncAfterTrackingWrite_(record) {
  const status = Number(record.returnWeight) >= Number(record.issueWeight) - 0.01
    ? 'Received from Conning' : 'Issue to Conning';
  let statusResult = null, summaryResult = null, warning = '';
  try { statusResult = updateProductionStatus_(record.box, status); }
  catch (err) { warning = 'Production status: ' + safeError_(err); }
  try { summaryResult = refreshSummary_(); }
  catch (err) { warning = (warning ? warning + ' ' : '') + 'Summary: ' + safeError_(err); }
  return { productionStatus: statusResult, summary: summaryResult, warning: warning };
}

function updateProductionStatus_(box, status) {
  const cleanBox = String(box || '').trim();
  const cleanStatus = String(status || '').trim();
  const allowed = ['Available for Conning', 'Issue to Conning', 'Received from Conning',
    'Issue to Doubler', 'Received from Doubler'];
  if (!cleanBox) throw new Error('Box is required for a production status update.');
  if (allowed.indexOf(cleanStatus) < 0) throw new Error('Invalid production status.');
  const updatedRows = writeProductionStatuses_({ [cleanBox]: cleanStatus });
  if (!updatedRows) throw new Error('Box ' + cleanBox + ' was not found in PRODUCTION DATA.');
  return { ok: true, box: cleanBox, status: cleanStatus, updatedRows: updatedRows };
}

/* Single bulk column write instead of one setValue() per matching row. */
function writeProductionStatuses_(statusMap) {
  const layout = ensureUnitColumn_();
  const sheet = layout.sheet;
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return 0;
  const headers = values[0].map(normalizeHeader_);
  const boxIndex = findHeader_(headers, ['box number', 'box']);
  const statusIndex = layout.statusIndex;
  if (boxIndex < 0) throw new Error('PRODUCTION DATA needs a BOX NUMBER column.');

  const keys = {};
  Object.keys(statusMap).forEach(function (k) { keys[String(k).trim().toUpperCase()] = statusMap[k]; });
  const column = values.slice(1).map(function (r) { return [r[statusIndex] == null ? '' : r[statusIndex]]; });
  let count = 0;
  for (let r = 0; r < column.length; r++) {
    const box = cleanBox_(values[r + 1][boxIndex]).toUpperCase();
    if (box && keys[box] !== undefined && String(column[r][0]||'').trim().toUpperCase() !== 'DUPLICATE') { column[r][0] = keys[box]; count++; }
  }
  if (!count) return 0;
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { sheet.getRange(2, statusIndex + 1, column.length, 1).setValues(column); }
  finally { lock.releaseLock(); }
  meeraFixInvalidateCache_();
  return count;
}

function syncConningStatusAndSummary() {
  const operatorIdsUpdated = backfillOperatorIds_();
  const rows = getTrackingRows_();
  const state = {};
  rows.forEach(function (r) {
    const box = String(r.box || '').trim();
    if (!box) return;
    const issue = Number(r.issueWeight) || 0;
    const returned = Number(r.returnWeight) || 0;
    const pending = Math.max(issue - returned, 0);
    if (!state[box]) state[box] = { pending: 0, fullyReceived: false };
    state[box].pending += pending;
    if (pending > 0.01) state[box].fullyReceived = false;
    else if (issue > 0 && returned >= issue - 0.01) state[box].fullyReceived = true;
  });
  const statusMap = {};
  Object.keys(state).forEach(function (box) {
    statusMap[box] = state[box].pending > 0.01 ? 'Issue to Conning'
      : (state[box].fullyReceived ? 'Received from Conning' : 'Available for Conning');
  });
  const updatedRows = writeProductionStatuses_(statusMap);
  const summary = refreshSummary_();
  return { ok: true, trackedBoxes: Object.keys(state).length, updatedRows: updatedRows, operatorIdsUpdated: operatorIdsUpdated, summaryRows: summary.rows };
}

function summaryDate_(value) {
  const s = String(value || '').trim();
  let m = s.match(/^(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? (s || 'Unknown') : Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function refreshSummary_() {
  const ss = getTrackingSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SUMMARY_SHEET_NAME);
  if (!sheet) throw new Error('Summary tab was not found.');
  const groups = {};
  getTrackingRows_().forEach(function (r) {
    const date = summaryDate_(r.date);
    const operatorId = String(r.operatorId || '').trim() || '(no id)';
    const operator = String(r.operator || '').trim() || '(unnamed)';
    const product = String(r.productName || '').trim() || '(unspecified)';
    const key = date + '\u0000' + operatorId + '\u0000' + operator + '\u0000' + product;
    if (!groups[key]) groups[key] = {
      date: date, operatorId: operatorId, operator: operator, product: product,
      issuedBoxes: {}, receivedBoxes: {}, pendingBoxes: {}, issue: 0, receive: 0, pending: 0
    };
    const g = groups[key];
    const box = String(r.box || '').trim();
    if (box) {
      g.issuedBoxes[box] = true;
      if (Number(r.returnWeight) > 0) g.receivedBoxes[box] = true;
      if (Math.max(Number(r.issueWeight) || 0, 0) - Math.max(Number(r.returnWeight) || 0, 0) > 0.01) g.pendingBoxes[box] = true;
    }
    g.issue += Number(r.issueWeight) || 0;
    g.receive += Number(r.returnWeight) || 0;
    g.pending += Math.max(Number(r.issueWeight) || 0, 0) - Math.max(Number(r.returnWeight) || 0, 0);
  });
  const rows = Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) {
    return b.date.localeCompare(a.date) || a.operatorId.localeCompare(b.operatorId) || a.operator.localeCompare(b.operator) || a.product.localeCompare(b.product);
  }).map(function (g) {
    return [g.date, g.operatorId, g.operator, g.product,
      Object.keys(g.issuedBoxes).length, g.issue,
      Object.keys(g.receivedBoxes).length, g.receive,
      Object.keys(g.pendingBoxes).length, Math.max(g.pending, 0)];
  });
  const headers = ['Date', 'Operator ID', 'Operator', 'Product', 'Issue Boxes', 'Issue Qty (kg)', 'Received Boxes', 'Received Qty (kg)', 'Pending Boxes', 'Pending Qty (kg)'];
  const oldLastRow = Math.max(sheet.getLastRow(), 1);
  const oldWidth = Math.max(sheet.getLastColumn(), headers.length);
  if (oldLastRow > 1) sheet.getRange(2, 1, oldLastRow - 1, oldWidth).clearContent();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return { ok: true, rows: rows.length, type: 'date-operator-product' };
}

function unitForMachine_(machine) {
  const number = Number(machine);
  return validMachine_(number) ? (number >= 75 ? 2 : 1) : '';
}

/* ==========================================================================
   FIXED LAYOUT GUARD
   PRODUCTION DATA: M=STATUS  N=Unit  O=Entered By  P=Month  Q=REQUEST ID
   The old Doubler override forced M=Unit / N=Status and overwrote every value
   in M, which broke every save and destroyed STATUS. This version owns only
   N and O, never renames a column holding different data, and backfills Unit
   only where it is blank instead of rewriting the whole column on every read.
   ========================================================================== */
var MEERA_FIX_VERSION_ = 'V102-MOBILE-UNIT-DASHBOARD-LOCKED-BACKUP-2026-11-11';
var MEERA_COL_STATUS_ = 12;   // M
var MEERA_COL_UNIT_ = 13;     // N
var MEERA_COL_ENTERED_ = 14;  // O
var MEERA_COL_MONTH_ = 15;    // P
var MEERA_COL_REQID_ = 16;    // Q

function ensureUnitColumn_() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) throw new Error('Entry sheet not found: ' + CONFIG.ENTRY_SHEET_NAME);
  const width = Math.max(sheet.getLastColumn(), MEERA_COL_REQID_ + 1);
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  let changed = false;

  function claim(index, label) {
    const current = String(headers[index] || '').trim();
    if (!current) { headers[index] = label; changed = true; return; }
    if (current.toLowerCase() !== label.toLowerCase()) {
      throw new Error('PRODUCTION DATA column ' + String.fromCharCode(65 + index) +
        ' must be "' + label + '" but contains "' + current +
        '". Run meeraRepairProductionLayout() after taking a backup. No data changed.');
    }
  }
  claim(MEERA_COL_UNIT_, 'Unit');
  claim(MEERA_COL_ENTERED_, 'Entered By');
  if (changed) sheet.getRange(1, 1, 1, width).setValues([headers]);

  const headerNames = headers.map(function (v) { return String(v || '').toLowerCase(); });
  const rowCount = Math.max(sheet.getLastRow() - 1, 0);
  const machineIndex = findHeader_(headerNames, ['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  if (machineIndex >= 0 && rowCount > 0) {
    const machines = sheet.getRange(2, machineIndex + 1, rowCount, 1).getValues();
    const units = sheet.getRange(2, MEERA_COL_UNIT_ + 1, rowCount, 1).getValues();
    let dirty = false;
    for (let i = 0; i < rowCount; i++) {
      if (String(units[i][0] || '').trim()) continue;
      const computed = unitForMachine_(machines[i][0]);
      if (computed !== '') { units[i][0] = computed; dirty = true; }
    }
    if (dirty) sheet.getRange(2, MEERA_COL_UNIT_ + 1, rowCount, 1).setValues(units);
  }
  return { sheet: sheet, headers: headers, headerNames: headerNames,
    unitIndex: MEERA_COL_UNIT_, enteredByIndex: MEERA_COL_ENTERED_, statusIndex: MEERA_COL_STATUS_ };
}

function backfillUnitColumn() {
  const result = ensureUnitColumn_();
  return { ok: true, statusColumn: 'M', unitColumn: 'N', enteredByColumn: 'O', rows: Math.max(result.sheet.getLastRow() - 1, 0) };
}

function getProductionRows_() {
  const unitColumn = ensureUnitColumn_();
  const values = unitColumn.sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
  const pick = function (cands) { const i = findHeader_(headers, cands); return i < 0 ? 0 : i; };
  const iDate = pick(['date']);
  const iBox = pick(['box number', 'box']);
  const iMachine = pick(['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  const iShift = pick(['shift']);
  const iProduct = pick(['product name', 'product']);
  const iYarn = pick(['yarn code', 'yarn']);
  const iRollTare = pick(['roll tare weight', 'roll type', 'roll wt']);
  const iRolls = pick(['no of roll', 'rolls', 'roll count']);
  const iGross = pick(['gross weight', 'gross']);
  const iNet = pick(['net weight', 'net']);
  const out = [];
  for (let r = values.length - 1; r >= 1; r--) {
    const row = values[r];
    out.push([row[iDate] || '', row[iBox] || '', row[iMachine] || '', row[iShift] || '',
      row[iProduct] || '', row[iYarn] || '', row[iRollTare] || '', row[iRolls] || '',
      row[iGross] || '', '', row[iNet] || '']);
  }
  return out;
}

function getEntries_(user) {
  const unitColumn = ensureUnitColumn_();
  const sheet = unitColumn.sheet;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
  const iDate = findHeader_(headers, ['date']);
  const iBox = findHeader_(headers, ['box number', 'box']);
  const iMachine = findHeader_(headers, ['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  const iUnit = unitColumn.unitIndex;
  const iShift = findHeader_(headers, ['shift']);
  const iProduct = findHeader_(headers, ['product name', 'product']);
  const iYarn = findHeader_(headers, ['yarn code', 'yarn']);
  const iRollType = findHeader_(headers, ['roll tare weight', 'roll type', 'roll wt']);
  const iRolls = findHeader_(headers, ['no of roll', 'rolls', 'roll count']);
  const iGross = findHeader_(headers, ['gross weight', 'gross']);
  const iTare = findHeader_(headers, ['tare weight', 'tare']);
  const iNet = findHeader_(headers, ['net weight', 'net']);
  const iUser = unitColumn.enteredByIndex;
  const iStatus = unitColumn.statusIndex;

  const result = [];
  let serial = 0;
  const restricted = user && user.role !== 'admin' && (user.machines || []).length
    ? user.machines.map(function (m) { return Number(m); }) : null;
  for (let r = values.length - 1; r >= 1; r--) {
    const row = values[r];
    const machineText = formatCell_(row[iMachine]);
    const machineNumber = Number(machineText);
    if (restricted && restricted.indexOf(machineNumber) < 0) continue;
    serial++;
    const rollType = formatCell_(row[iRollType]);
    const rolls = formatCell_(row[iRolls]);
    const rollW = Number(rollType) || rollWeight_(rollType);
    const gross = Number(row[iGross]) || 0;
    const tare = Number(row[iTare]) || Number(rolls) * rollW;
    const net = Number(row[iNet]) || Math.max(0, gross - tare);
    result.push({
      sr: serial, date: formatDateCell_(row[iDate]), shift: formatCell_(row[iShift]),
      type: 'Production', product: formatCell_(row[iProduct]), yarn: formatCell_(row[iYarn]),
      machine: machineText, unit: iUnit >= 0 ? formatCell_(row[iUnit]) : unitForMachine_(machineNumber),
      rollType: rollType, rolls: rolls, rollW: rollW, gross: gross, tare: tare, net: net,
      box: formatCell_(row[iBox]), status: iStatus >= 0 ? formatCell_(row[iStatus]) : '',
      user: iUser >= 0 ? formatCell_(row[iUser]) : ''
    });
  }
  return result;
}

/* V102: Unit-scope and today's date are enforced on the server, not just hidden in HTML.
   Reads only the Date column to identify today's rows. This is a DASHBOARD read,
   separate from interactive save's recent-15 index. */
function meeraV102DateKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value,Session.getScriptTimeZone(),'yyyy-MM-dd');
  var s=String(value||'').trim(),m=s.match(/^(\d{4})[-\/]([0-9]{1,2})[-\/]([0-9]{1,2})/);
  if(m)return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
  m=s.match(/^([0-9]{1,2})[-\/]([0-9]{1,2})[-\/](\d{4})/);
  if(m)return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  return '';
}
function meeraV102UnitTodayEntries_(user) {
  // V102.4 READ ONLY. FAST daily dashboard, not the 15-box save checker.
  const sh = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sh) throw new Error('PRODUCTION DATA missing');
  const admin = String(user.role || '').toLowerCase() === 'admin';
  const allowed = {};
  if (!admin) (user.machines || []).forEach(function(mc) {
    const unit = unitForMachine_(Number(mc));
    if (unit) allowed[String(unit)] = true;
  });
  if (!admin && !Object.keys(allowed).length) return [];
  const today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = [], batchSize = 100, maximum = 2500;
  let end = last, scanned = 0, foundToday = false;
  while (end > 1 && scanned < maximum) {
    const count = Math.min(batchSize, end - 1, maximum - scanned);
    const first = end - count + 1;
    // ONE request A:O, including Entered By; avoid per-row calls and extra user-column calls.
    const block = sh.getRange(first, 1, count, 15).getDisplayValues();
    let oldCount = 0;
    for (let i = block.length - 1; i >= 0; i--) {
      const r = block[i], date = meeraV102DateKey_(r[0]);
      if (date === today) {
        foundToday = true;
        const machine = Number(r[2]), unit = unitForMachine_(machine);
        if (!unit || (!admin && !allowed[String(unit)])) continue;
        rows.push({sr:first+i,date:today,box:String(r[1]||''),machine:String(r[2]||''),
          shift:String(r[3]||''),type:'Production',product:String(r[4]||''),
          yarn:String(r[5]||''),rollType:String(r[6]||''),rolls:r[7],gross:r[8],
          tare:r[9],net:r[10],status:String(r[12]||''),unit:String(unit),
          user:String(r[14]||'').trim()});
      } else if (date && date < today) oldCount++;
    }
    scanned += count;
    end = first - 1;
    // Older rows preceded today's rows in append order; no need to read all history.
    if (foundToday && oldCount === count) break;
  }
  console.log('V102.4 Daily dashboard: date=' + today + ', scanned=' + scanned + ', rows=' + rows.length);
  return rows;
}
function meeraV102DashboardDiagnostic_() {
  const sh=getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  const last=sh.getLastRow();
  const today=Utilities.formatDate(new Date(),'Asia/Kolkata','yyyy-MM-dd');
  const rows=last>=2?sh.getRange(Math.max(2,last-149),1,Math.min(150,last-1),11).getDisplayValues():[];
  const recentTodayRows=[];
  rows.forEach(function(r) {if (meeraV102DateKey_(r[0])===today) recentTodayRows.push({box:r[1],machine:r[2],net:r[10]});});
  const result={version:'V102.4-DASHBOARD-ONLY',sheetId:CONFIG.SPREADSHEET_ID,
    today:today,productionLastRow:last,tailRowsRead:rows.length,
    todayCount:recentTodayRows.length,recentTodayRows:recentTodayRows.slice(-20)};
  console.log(JSON.stringify(result));return result;
}

function saveEntry_(body) {
  const user = requireSession_(body.token);
  return meeraSaveEntryWithUser_(body, user);
}

/* Month is derived from the actual entry date, never the save time. */
function meeraMonthFromEntryDate_(raw) {
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'MMMM');
  }
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM');
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:T|\s|$)/);
  if (!m) {
    m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s|$)/);
    if (!m) throw new Error('Invalid entry date for Month: ' + s);
    m = [m[0], m[3], m[2], m[1]];
  }
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (year < 2000 || year > 2100 || dt.getUTCFullYear() !== year ||
      dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    throw new Error('Invalid entry date for Month: ' + s);
  }
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][month - 1];
}

/* ==========================================================================
   VERIFIED SAVE ENGINE
   Old flow: write BACKUP=PENDING, run 5 slow TextFinder searches, append,
   flush, search again, then flip to CONFIRMED. Any timeout orphaned the row.
   New flow: 3 bulk column reads, append, verify the appended row directly,
   flip to CONFIRMED. PRODUCTION DATA is the authority and the backup flag
   self-heals. Anything still interrupted is completed by the reconciler.
   ========================================================================== */
var MEERA_BACKUP_HEADERS_ = ['REQUEST ID', 'DATE', 'BOX NUMBER', 'MACHINE', 'UNIT',
  'USER', 'STATUS', 'PAYLOAD', 'BACKUP TIME', 'CONFIRMED TIME'];

function meeraFixInvalidateCache_() {
  try { CacheService.getScriptCache().remove('prod_rows_compact_v1'); } catch (ignore) {}
}

function meeraFixProductionIndex_() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) throw new Error('Production sheet missing.');
  const width = Math.max(sheet.getLastColumn(), MEERA_COL_REQID_ + 1);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  function need(index, label) {
    if (String(headers[index] || '').trim().toUpperCase() !== label) {
      throw new Error('STOP: column ' + String.fromCharCode(65 + index) + ' must be ' + label +
        '. Run meeraRepairProductionLayout(). No data changed.');
    }
  }
  need(MEERA_COL_STATUS_, 'STATUS');
  need(MEERA_COL_UNIT_, 'UNIT');
  need(MEERA_COL_ENTERED_, 'ENTERED BY');
  need(MEERA_COL_MONTH_, 'MONTH');
  need(MEERA_COL_REQID_, 'REQUEST ID');

  const names = headers.map(function (h) { return String(h || '').toLowerCase(); });
  const boxIndex = names.findIndex(function (h) { return h.indexOf('box') >= 0; });
  if (boxIndex < 0) throw new Error('BOX NUMBER column missing.');

  const lastRow = sheet.getLastRow();
  const byId = {}, byBox = {}, boxOf = {}, idOf = {};
  if (lastRow > 1) {
    const boxes = sheet.getRange(2, boxIndex + 1, lastRow - 1, 1).getDisplayValues();
    const ids = sheet.getRange(2, MEERA_COL_REQID_ + 1, lastRow - 1, 1).getDisplayValues();
    for (let i = 0; i < boxes.length; i++) {
      const rowNo = i + 2;
      const b = cleanBox_(boxes[i][0]).toUpperCase();
      const id = String(ids[i][0] || '').trim();
      boxOf[rowNo] = b; idOf[rowNo] = id;
      if (b) { (byBox[b] = byBox[b] || []).push(rowNo); }
      if (id) { (byId[id] = byId[id] || []).push(rowNo); }
    }
  }
  return { sheet: sheet, width: width, headers: headers, names: names, boxIndex: boxIndex,
    lastRow: lastRow, byId: byId, byBox: byBox, boxOf: boxOf, idOf: idOf };
}

/* V101 USER/UNIT RECENT-15 SAVE INDEX (LIVE CANDIDATE)
 * Only the newest 15 rows are materialized in Apps Script. Older Request IDs
 * and Boxes MUST still be checked using exact server-side TextFinder; checking
 * just the latest 15 would allow an old Box to be accidentally duplicated.
 * All identity operations happen inside the Save ScriptLock.
 */
var MEERA_FAST_TAIL_LIMIT_ = 15;
/* Each user/unit keeps only its last 15 committed/intended rows in Properties.
 * No production/backup full-column search is made during interactive saves.
 * Older records outside the 15-window cannot be globally duplicate-checked;
 * audit/reconciliation is explicitly separate from the save path.
 */
function meeraV101RecentKey_(username,unit) {
  return 'v101_recent_' + sha256Hex_(String(username||'').toLowerCase() + ':' + String(unit)).slice(0,32);
}
function meeraV101Recent_(username,unit) {
  var key=meeraV101RecentKey_(username,unit), props=PropertiesService.getScriptProperties();
  var raw=props.getProperty(key);
  if (raw) { try { var a=JSON.parse(raw); if (Array.isArray(a)) return a.slice(-15); } catch(e) {} }
  // One-time bounded seed, reading only the most recent 15 physical rows.
  var prod=getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  var back=getSpreadsheet_().getSheetByName('PRODUCTION BACKUP');
  var records={}, a=[], n=prod.getLastRow(), start=Math.max(2,n-14);
  if (n>=2) {
    var rows=prod.getRange(start,1,n-start+1,17).getDisplayValues();
    rows.forEach(function(r,i){
      if (String(r[14]||'').trim().toLowerCase() !== String(username||'').trim().toLowerCase() || Number(r[13])!==Number(unit)) return;
      var rid=String(r[16]||'').trim(), box=cleanBox_(r[1]).toUpperCase();
      if (rid && box) { records[rid]={id:rid,box:box,p:start+i,b:0}; a.push(records[rid]); }
    });
  }
  if (back) {
    n=back.getLastRow(); start=Math.max(2,n-14);
    if (n>=2) back.getRange(start,1,n-start+1,7).getDisplayValues().forEach(function(r,i){
      if (String(r[5]||'').trim().toLowerCase()!==String(username||'').trim().toLowerCase() || Number(r[4])!==Number(unit)) return;
      var rid=String(r[0]||'').trim(), box=cleanBox_(r[2]).toUpperCase();
      if (!rid || !box) return;
      if (records[rid]) records[rid].b=start+i;
      else { var x={id:rid,box:box,p:0,b:start+i};records[rid]=x;a.push(x); }
    });
  }
  a=a.slice(-15);
  props.setProperty(key,JSON.stringify(a));
  return a;
}
function meeraV101Remember_(username,unit,id,box,prodRow,backupRow) {
  var key=meeraV101RecentKey_(username,unit);
  var props=PropertiesService.getScriptProperties();
  var a=meeraV101Recent_(username,unit);
  var old=a.find(function(x){return x.id===id;});
  if (old) {
    if (old.box!==box) throw new Error('Recent Request ID / box mismatch.');
    if (prodRow) old.p=prodRow;
    if (backupRow) old.b=backupRow;
  } else a.push({id:id,box:box,p:prodRow||0,b:backupRow||0});
  props.setProperty(key,JSON.stringify(a.slice(-15)));
}
function meeraFastFindRows_(sheet,column,value,tailStart,tailRows,arrayIndex) {
  var clean=String(value||'').trim().toUpperCase(),out=[];
  if (!clean) return out;
  (tailRows||[]).forEach(function(r,i){
    if (String(r[arrayIndex]||'').trim().toUpperCase()===clean) out.push(tailStart+i);
  });
  return out;
}
/* RC5 REVIEW PATCH — exact, global identity check without loading all rows.
 * A recent-15 cache is only a speed hint, NEVER sufficient proof that an
 * older box/Request ID does not exist. TextFinder runs server-side. */
function meeraRC5ExactIdentityRows_(sheet, column, value) {
  var key=String(value==null?'':value).trim();
  if (!key || sheet.getLastRow()<2) return [];
  var range=sheet.getRange(2,column,sheet.getLastRow()-1,1);
  var found=range.createTextFinder(key).matchEntireCell(true).matchCase(false).findAll();
  return found.map(function(cell){return cell.getRow();});
}
function meeraFastProductionIndex_(requestId,box,user,unit) {
  var sheet=getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) throw new Error('Production sheet missing.');
  var width=Math.max(sheet.getLastColumn(),17), headers=sheet.getRange(1,1,1,width).getDisplayValues()[0];
  var required={12:'STATUS',13:'UNIT',14:'ENTERED BY',15:'MONTH',16:'REQUEST ID'};
  Object.keys(required).forEach(function(i){
    if (String(headers[Number(i)]||'').trim().toUpperCase()!==required[i]) throw new Error('Production layout mismatch: column '+(Number(i)+1));
  });
  var names=headers.map(function(h){return String(h||'').toLowerCase();});
  var boxIndex=names.findIndex(function(h){return h.indexOf('box')>=0;});
  if (boxIndex<0) throw new Error('BOX NUMBER column missing.');
  var last=sheet.getLastRow(), byId={},byBox={},boxOf={},idOf={},candidates={};
  var recent=user ? meeraV101Recent_(user.username,unit) : [];
  recent.forEach(function(v){if(v.p>=2 && v.p<=last)candidates[v.p]=true;});
  // Bounded fallback ONLY if the user/unit index has no production rows yet.
  if (!Object.keys(candidates).length) {
    var start=Math.max(2,last-14);
    for(var n=start;n<=last;n++) candidates[n]=true;
  }
  // Check ALL historic matching identities; recent-15 alone is not safe.
  var exactIdRows=meeraRC5ExactIdentityRows_(sheet,MEERA_COL_REQID_+1,requestId);
  var exactBoxRows=meeraRC5ExactIdentityRows_(sheet,boxIndex+1,box);
  exactIdRows.concat(exactBoxRows).forEach(function(n){candidates[n]=true;});
  var exactCandidates={};
  exactIdRows.concat(exactBoxRows).forEach(function(n){exactCandidates[n]=true;});
  Object.keys(candidates).forEach(function(k){
    var n=Number(k), r=sheet.getRange(n,1,1,width).getDisplayValues()[0];
    // Never hide a global ID/box conflict belonging to another operator/unit.
    var exactMatch=!!exactCandidates[n];
    if (user && !exactMatch && (String(r[MEERA_COL_ENTERED_]||'').trim().toLowerCase()!==String(user.username||'').toLowerCase() || Number(r[MEERA_COL_UNIT_])!==Number(unit))) return;
    var rid=String(r[MEERA_COL_REQID_]||'').trim(), b=cleanBox_(r[boxIndex]).toUpperCase();
    if (rid) { (byId[rid]=byId[rid]||[]).push(n);idOf[n]=rid; }
    if (b) { (byBox[b]=byBox[b]||[]).push(n);boxOf[n]=b; }
  });
  return {sheet:sheet,width:width,headers:headers,names:names,boxIndex:boxIndex,
    byId:byId,byBox:byBox,boxOf:boxOf,idOf:idOf,lastRow:last};
}
function meeraFastBackupIndex_(backup,requestId,box,user,unit) {
  var last=backup.getLastRow(),byId={},byBox={},statusOf={},rowOf={},candidates={};
  var recent=user ? meeraV101Recent_(user.username,unit) : [];
  recent.forEach(function(v){if(v.b>=2 && v.b<=last)candidates[v.b]=true;});
  if (!Object.keys(candidates).length) {
    var start=Math.max(2,last-14);
    for(var n=start;n<=last;n++) candidates[n]=true;
  }
  // Backup also must detect identities older than the 15-row cache.
  var exactIdRows=meeraRC5ExactIdentityRows_(backup,1,requestId);
  var exactBoxRows=meeraRC5ExactIdentityRows_(backup,3,box);
  exactIdRows.concat(exactBoxRows).forEach(function(n){candidates[n]=true;});
  var exactCandidates={};
  exactIdRows.concat(exactBoxRows).forEach(function(n){exactCandidates[n]=true;});
  Object.keys(candidates).forEach(function(k){
    var n=Number(k),r=backup.getRange(n,1,1,7).getDisplayValues()[0];
    var exactMatch=!!exactCandidates[n];
    if (user && !exactMatch && (String(r[5]||'').trim().toLowerCase()!==String(user.username||'').toLowerCase() || Number(r[4])!==Number(unit))) return;
    var rid=String(r[0]||'').trim(),b=cleanBox_(r[2]).toUpperCase();
    if (rid) {(byId[rid]=byId[rid]||[]).push(n);rowOf[rid]=n;}
    if (b) (byBox[b]=byBox[b]||[]).push(n);
    statusOf[n]=String(r[6]||'').trim().toUpperCase();
  });
  return {byId:byId,byBox:byBox,statusOf:statusOf,rowOf:rowOf,lastRow:last};
}
function meeraMinimalBackupPayload_(body) {
  var keys=['action','date','machine','rollTypeCode','rollType','productName',
    'productSource','yarnCode','box','shift','rollCount','grossW','tapeW','netW','requestId'];
  var out={action:'saveEntry'};
  keys.forEach(function(k){if(k!=='action' && body[k] !== undefined && body[k] !== null) out[k]=body[k];});
  return out;
}
function meeraFastTombstone_(ss, requestId, box) {
  var sheet=ss.getSheetByName('MEERA_DELETED_RECORDS');
  if (!sheet || sheet.getLastRow()<2) return false;
  var last=sheet.getLastRow(), st=Math.max(2,last-14);
  var tail=sheet.getRange(st,1,last-st+1,3).getDisplayValues();
  var ids=meeraFastFindRows_(sheet,2,requestId,st,tail,1),
      boxes=meeraFastFindRows_(sheet,3,box,st,tail,2);
  var candidates={};ids.concat(boxes).forEach(function(n){candidates[n]=1;});
  return Object.keys(candidates).some(function(n){
    var v=sheet.getRange(Number(n),1,1,3).getDisplayValues()[0];
    var deletedId=String(v[1]||'').trim();
    return String(v[0]||'').trim().toUpperCase()==='PRODUCTION DATA' &&
      (deletedId ? deletedId===requestId : cleanBox_(v[2]).toUpperCase()===box);
  });
}
function meeraFixBackupSheet_() {
  const ss = getSpreadsheet_();
  let backup = ss.getSheetByName('PRODUCTION BACKUP');
  if (!backup) backup = ss.insertSheet('PRODUCTION BACKUP');
  if (backup.getLastRow() === 0) backup.appendRow(MEERA_BACKUP_HEADERS_);
  const actual = backup.getRange(1, 1, 1, MEERA_BACKUP_HEADERS_.length).getDisplayValues()[0];
  for (let i = 0; i < MEERA_BACKUP_HEADERS_.length; i++) {
    if (String(actual[i] || '').trim().toUpperCase() !== MEERA_BACKUP_HEADERS_[i]) {
      throw new Error('PRODUCTION BACKUP headers incorrect. Administrator must review schema.');
    }
  }
  return backup;
}

function meeraFixBackupIndex_(backup) {
  const lastRow = backup.getLastRow();
  const byId = {}, byBox = {}, statusOf = {}, rowOf = {};
  if (lastRow > 1) {
    const values = backup.getRange(2, 1, lastRow - 1, 7).getDisplayValues();
    for (let i = 0; i < values.length; i++) {
      const rowNo = i + 2;
      const id = String(values[i][0] || '').trim();
      const b = cleanBox_(values[i][2]).toUpperCase();
      const st = String(values[i][6] || '').trim().toUpperCase();
      statusOf[rowNo] = st;
      if (id) { (byId[id] = byId[id] || []).push(rowNo); rowOf[id] = rowNo; }
      if (b) { (byBox[b] = byBox[b] || []).push(rowNo); }
    }
  }
  return { byId: byId, byBox: byBox, statusOf: statusOf, rowOf: rowOf, lastRow: lastRow };
}

function meeraFixConfirmBackup_(backup, index, requestId, rowNumber) {
  const target = rowNumber || index.rowOf[requestId];
  if (!target) throw new Error('BACKUP_MISSING: Cannot confirm without backup row.');
  if (String(backup.getRange(target,1).getDisplayValue()).trim() !== requestId)
    throw new Error('BACKUP_ID_MISMATCH: Request ID is not on target row.');
  backup.getRange(target,7).setValue('CONFIRMED');
  backup.getRange(target,10).setValue(new Date());
  SpreadsheetApp.flush();
  if (String(backup.getRange(target,7).getDisplayValue()).trim().toUpperCase() !== 'CONFIRMED')
    throw new Error('BACKUP_CONFIRM_FAILED: Status did not persist.');
  index.statusOf[target]='CONFIRMED';
  return target;
}

function meeraFixEnsureBackupRow_(backup, index, body, requestId, box, machine, unit, user, status) {
  const existing = index.byId[requestId] || [];
  if (existing.length > 1) throw new Error('Duplicate backup identity. Admin review required.');
  if (existing.length === 1) {
    const rowNo = existing[0];
    const old = backup.getRange(rowNo, 1, 1, 6).getDisplayValues()[0];
    if (cleanBox_(old[2]).toUpperCase() !== box || Number(old[3]) !== machine ||
        String(old[5] || '').trim().toLowerCase() !== String(user.username).trim().toLowerCase()) {
      throw new Error('Request ID belongs to a different entry.');
    }
    return rowNo;
  }
  // Distinct Request IDs are permitted for the same Box. A BOX must never
  // suppress a real request or prevent its PENDING backup intent being saved.
  const payload = Object.assign({}, body);
  delete payload.token;
  backup.appendRow([requestId, body.date || '', box, machine, unit, user.username,
    status, JSON.stringify(payload), new Date(), status === 'CONFIRMED' ? new Date() : '']);
  SpreadsheetApp.flush();
  const newRow = backup.getLastRow();
  if (String(backup.getRange(newRow,1).getDisplayValue()).trim() !== requestId)
    throw new Error('BACKUP_WRITE_FAILED: Request ID not found on new row.');
  index.byId[requestId] = [newRow];
  index.rowOf[requestId] = newRow;
  index.statusOf[newRow] = status;
  index.byBox[box] = (index.byBox[box] || []).concat([newRow]);
  return newRow;
}

function meeraFixBuildRow_(prod, body, ctx) {
  const row = new Array(prod.width).fill('');
  const w = ctx.weights;
  for (let c = 0; c < prod.width; c++) {
    const h = prod.names[c];
    if (c === MEERA_COL_REQID_) row[c] = ctx.requestId;
    else if (c === MEERA_COL_UNIT_) row[c] = ctx.unit;
    else if (c === MEERA_COL_ENTERED_) row[c] = ctx.user.username;
    else if (c === MEERA_COL_MONTH_ || h.trim() === 'month') row[c] = ctx.monthName;
    else if (c === MEERA_COL_STATUS_ || h.indexOf('status') >= 0) row[c] = ctx.reviewStatus || 'Available for Conning';
    else if (h.indexOf('date') >= 0) row[c] = body.date || formatDateCell_(new Date());
    else if (h.indexOf('box') >= 0) row[c] = ctx.box;
    else if (h.indexOf('m/c') >= 0 || h.indexOf('machine') >= 0 || h.indexOf('mc no') >= 0) row[c] = ctx.machine;
    else if (h.indexOf('unit') >= 0) row[c] = ctx.unit;
    else if (h.indexOf('shift') >= 0) row[c] = body.shift || '';
    else if (h.indexOf('product') >= 0) row[c] = ctx.product;
    else if (h.indexOf('yarn') >= 0) row[c] = body.yarnCode || '';
    else if (h.indexOf('roll tare') >= 0 || h === 'roll type' || h.indexOf('roll wt') >= 0) row[c] = w.rollW;
    else if (h.indexOf('no of roll') >= 0 || h === 'rolls' || h.indexOf('roll count') >= 0) row[c] = w.rolls;
    else if (h.indexOf('gross') >= 0) row[c] = w.gross;
    else if (h.indexOf('tare') >= 0 && h.indexOf('roll') < 0) row[c] = w.tare;
    else if (h.indexOf('net') >= 0) row[c] = w.net;
    else if (h.indexOf('time') >= 0) row[c] = new Date();
  }
  return row;
}

function meeraSaveEntryWithUser_(body, user) {
  const machine=Number(body.machine);
  if(!validMachine_(machine)) throw new Error('Select a valid machine so the record can be assigned to a unit.');
  if(String(user.role).toLowerCase() !== 'admin' && (user.machines||[]).indexOf(machine)<0)
    throw new Error('Machine not allowed for this user.');
  // V103: Operators can submit imperfect values; never invent missing weights.
  // Authentication, machine ownership, Request ID and duplicate protection remain mandatory.
  const reviewReasons=[];
  const product = String(body.productName || '').trim();
  if (!product) reviewReasons.push('Product missing');
  const box = String(body.box || '').trim().toUpperCase();
  if (!box) throw new Error('Box number required for unique identity. Entry is kept on device.');
  const unit = unitForMachine_(machine);
  const expectedPrefix = machine <= 74 ? 'A' : 'B';
  if (!new RegExp('^' + expectedPrefix + '[0-9]+$').test(box)) reviewReasons.push('Box format or unit mismatch');
  const rollTypeCode = rollTypeCode_(body.rollTypeCode || body.rollType);
  if (!rollTypeCode || allowedRollTypesForUser_(user, machine).indexOf(rollTypeCode) < 0) reviewReasons.push('Roll type missing/not permitted');
  const rawNumber = function(x){ const s=String(x==null?'':x).trim(); return s!=='' && Number.isFinite(Number(s))?Number(s):null; };
  const rolls=rawNumber(body.rollCount), gross=rawNumber(body.grossW),tare=rawNumber(body.tapeW),net=rawNumber(body.netW);
  if (rolls===null || !Number.isInteger(rolls) || rolls<=0) reviewReasons.push('Roll count invalid');
  if (gross===null || gross<=0) reviewReasons.push('Gross weight invalid');
  if (tare===null || tare<0) reviewReasons.push('Tare weight invalid');
  if (net===null || net<=0) reviewReasons.push('Net weight invalid');
  if(gross!==null && tare!==null && net!==null && Math.abs(gross-tare-net)>0.02) reviewReasons.push('Net weight mismatch');
  const weights={rollW:rawNumber(body.rollType),rolls:rolls===null?'':rolls,gross:gross===null?'':gross,tare:tare===null?'':tare,net:net===null?'':net};
  const requestId = String(body.requestId || '').trim();
  if (!/^[A-Za-z0-9-]{16,100}$/.test(requestId)) throw new Error('Valid Request ID is required to prevent duplicate saves.');
  // Validate the date BEFORE any write so a bad date can never create an
  // orphaned PENDING backup row.
  let monthName;
  try { monthName=meeraMonthFromEntryDate_(body.date); }
  catch(e) { reviewReasons.push('Invalid date'); monthName=''; }
  // Keep original operator input in the protected backup payload for review.
  body.reviewReasons=reviewReasons.slice();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getSpreadsheet_();
    if (meeraFastTombstone_(ss, requestId, box)) {
      throw new Error('Record permanently deleted by Admin. Do not retry automatically.');
    }
    const prod = meeraFastProductionIndex_(requestId, box, user, unit);
    const backup = meeraFixBackupSheet_();
    const bidx = meeraFastBackupIndex_(backup, requestId, box, user, unit);
    const idRows = prod.byId[requestId] || [];
    const boxRows = prod.byBox[box] || [];

    if (idRows.length > 1) {
      return { ok: false, status: 'REVIEW_REQUIRED', requestId: requestId, box: box,
        message: 'Repeated Request ID in PRODUCTION DATA. Admin review required.' };
    }

    // (a) Already saved under this Request ID: heal the backup and confirm.
    if (idRows.length === 1) {
      const confirmedRow = idRows[0];
      if (prod.boxOf[confirmedRow] !== box) {
        return { ok: false, status: 'REVIEW_REQUIRED', requestId: requestId, box: box,
          message: 'Request ID belongs to a different box. Admin review required.' };
      }
      // Existing save can be acknowledged only to its owner and with its machine.
      const existing = prod.sheet.getRange(confirmedRow, 1, 1, prod.width).getDisplayValues()[0];
      const oldOwner = String(existing[MEERA_COL_ENTERED_] || '').trim().toLowerCase();
      const machineIndex = findHeader_(prod.names, ['m/c no','m/c','machine no','machine','mc no']);
      if (oldOwner !== String(user.username || '').trim().toLowerCase() ||
          machineIndex < 0 || Number(existing[machineIndex]) !== machine) {
        return { ok: false, status: 'REVIEW_REQUIRED', requestId: requestId, box: box,
          message: 'Existing Request ID owner or machine mismatch. Admin review required.' };
      }
      const healedBackupRow = meeraFixEnsureBackupRow_(backup, bidx, body, requestId, box, machine, unit, user, 'CONFIRMED');
      meeraV101Remember_(user.username, unit, requestId, box, confirmedRow, healedBackupRow);
      meeraFixConfirmBackup_(backup, bidx, requestId);
      meeraFixInvalidateCache_();
      return { ok: true, status: 'CONFIRMED', duplicate: true, box: box, requestId: requestId,
        rowNumber: confirmedRow, row: confirmedRow, message: 'Previously saved entry verified.' };
    }

    // (b) A different Request ID for an existing Box is a REAL entry.
    // Save it, mark only the new production row DUPLICATE, and never re-append
    // retries with an existing Request ID. The backup is keyed by Request ID.
    const duplicateBox = boxRows.length > 0;

    // (c) Reserve the intent row (adopts an existing one for this ID).
    const backupRow = meeraFixEnsureBackupRow_(backup, bidx, meeraMinimalBackupPayload_(body), requestId, box, machine, unit, user, 'PENDING');
    meeraV101Remember_(user.username, unit, requestId, box, 0, backupRow);

    // (d) Append the production row.
    const row = meeraFixBuildRow_(prod, body, { requestId: requestId, box: box, machine: machine,
      unit: unit, product: product, monthName: monthName, weights: weights, user: user, reviewStatus: duplicateBox ? 'DUPLICATE' : (reviewReasons.length ? 'Needs Review' : 'Available for Conning') });
    prod.sheet.appendRow(row);
    SpreadsheetApp.flush();

    // (e) Verify by reading the appended row directly - no TextFinder.
    const newRowNumber = prod.sheet.getLastRow();
    const saved = prod.sheet.getRange(newRowNumber, 1, 1, prod.width).getDisplayValues()[0];
    if (String(saved[MEERA_COL_REQID_] || '').trim() !== requestId ||
        cleanBox_(saved[prod.boxIndex]).toUpperCase() !== box) {
      throw new Error('Save not confirmed. Keep this Request ID; auto-recovery will complete it.');
    }

    meeraV101Remember_(user.username, unit, requestId, box, newRowNumber, backupRow);
    // (f) Flip the intent row to CONFIRMED.
    meeraFixConfirmBackup_(backup, bidx, requestId, backupRow);
    meeraFixInvalidateCache_();
    return { ok: true, status: 'CONFIRMED', box: box, requestId: requestId,
      rowNumber: newRowNumber, row: newRowNumber, productionStatus:duplicateBox?'DUPLICATE':(reviewReasons.length?'Needs Review':'Available for Conning'), duplicateBox:duplicateBox, reviewRequired: duplicateBox || reviewReasons.length>0, warnings:reviewReasons, message: duplicateBox?'Entry saved; duplicate box flagged for review.':(reviewReasons.length?'Entry saved; correction required.':'Entry saved and verified.') };
  } finally {
    lock.releaseLock();
  }
}

/* PRODUCTION DATA is the authority. If the row exists the answer is CONFIRMED,
   and a backup flag left PENDING by an interrupted save repairs itself. */
function checkSaveStatus_(p) {
  const user = requireSession_(p.token);
  const requestId = String(p.requestId || '').trim();
  if (!requestId || requestId.length > 100) throw new Error('Valid Request ID required.');
  const isAdmin = String(user.role || '').toLowerCase() === 'admin';

  const prod = meeraFastProductionIndex_(requestId, String(p.box || '').trim().toUpperCase(), user, unitForMachine_(Number(p.machine)));
  const idRows = prod.byId[requestId] || [];
  if (idRows.length > 1) return { ok: true, requestId: requestId, status: 'REVIEW_REQUIRED' };

  if (idRows.length === 1) {
    const rowNo = idRows[0];
    const savedBox = prod.boxOf[rowNo];
    if (!isAdmin) {
      const owner = String(prod.sheet.getRange(rowNo, MEERA_COL_ENTERED_ + 1).getDisplayValue() || '').trim().toLowerCase();
      if (owner && owner !== String(user.username || '').trim().toLowerCase()) throw new Error('Access denied.');
    }
    try {
      const backup = meeraFixBackupSheet_();
      const bidx = meeraFastBackupIndex_(backup, requestId, savedBox, user, unitForMachine_(Number(p.machine)));
      if (!bidx.rowOf[requestId]) throw new Error('BACKUP_MISSING: Production exists but backup row not found.');
      meeraFixConfirmBackup_(backup, bidx, requestId);
    } catch (err) {
      console.error('V101 BACKUP STATUS ERROR '+requestId+': '+safeError_(err));
      return { ok:true, requestId:requestId, box:savedBox, row:rowNo, status:'BACKUP_REPAIR_REQUIRED', error:safeError_(err) };
    }
    return { ok: true, requestId: requestId, box: savedBox, row: rowNo, status: 'CONFIRMED' };
  }

  let box = String(p.box || '').trim().toUpperCase();
  const backup = getSpreadsheet_().getSheetByName('PRODUCTION BACKUP');
  const bidx = backup ? meeraFastBackupIndex_(backup, requestId, box, user, unitForMachine_(Number(p.machine))) : { byId: {}, byBox: {}, statusOf: {}, rowOf: {} };
  const intentRows = bidx.byId[requestId] || [];

  if (intentRows.length === 1) {
    const intentRow = intentRows[0];
    const record = backup.getRange(intentRow, 1, 1, 6).getDisplayValues()[0];
    if (!isAdmin && String(record[5] || '').trim().toLowerCase() !== String(user.username || '').trim().toLowerCase()) {
      throw new Error('Access denied.');
    }
    const intentBox = cleanBox_(record[2]).toUpperCase();
    if (String(bidx.statusOf[intentRow] || '').toUpperCase() === 'CONFIRMED') {
      return { ok: true, requestId: requestId, box: intentBox, status: 'REVIEW_REQUIRED' };
    }
    return { ok: true, requestId: requestId, box: intentBox, status: 'PENDING' };
  }

  if (!box) return { ok: true, requestId: requestId, status: 'NOT_FOUND' };
  const machine = Number(p.machine);
  if (!validMachine_(machine)) throw new Error('Invalid machine for status check.');
  if (!isAdmin && (user.machines || []).map(Number).indexOf(machine) < 0) {
    throw new Error('Machine not allowed for status check.');
  }
  // Box duplication is allowed: status checks are keyed by Request ID only.
  // A different Request ID must remain eligible for a save/retry.
  return { ok: true, requestId: requestId, box: box, status: 'NOT_FOUND' };
}

function rollWeight_(value) {
  const s = String(value || '').toLowerCase();
  if (s.indexOf('0.29') >= 0 || s.indexOf('b') === 0) return 0.29;
  if (s.indexOf('0.30') >= 0 || s.indexOf('0.3') >= 0 || s.indexOf('c') === 0) return 0.30;
  if (s.indexOf('0.25') >= 0 || s.indexOf('d') === 0) return 0.25;
  return 0.38;
}
/* ---------------- Conning Output and QC ---------------- */
const CONNING_OUTPUT_SHEET_NAME_ = 'CONNING STATUS';
const CONNING_OUTPUT_LEGACY_SHEET_NAME_ = 'CONNING OUTPUT';
const CONNING_OUTPUT_HEADERS_ = [
  'Output ID', 'Barcode', 'Crate/Carate No', 'Production Row', 'Source Box',
  'Product', 'Yarn', 'Covering M/C', 'Unit', 'Conning M/C', 'Output Qty (kg)', 'No. of Cones',
  'Conning Operator', 'Conning Operator ID', 'Production Entered By', 'Conning Date', 'Shift', 'Status', 'QC Result', 'QC By',
  'QC Date/Time', 'QC Remarks', 'Defect Department', 'Defect Type', 'Defect Photo', 'Defect Photo URL', 'Created At', 'Updated At'
];
const QC_RESULT_STATUS_ = { PASS: 'QC Accepted', HOLD: 'QC Hold', REJECT: 'QC Rejected', REWORK: 'Rework Required' };

function getConningOutputSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(CONNING_OUTPUT_SHEET_NAME_);
  if (!sheet) {
    const legacy = ss.getSheetByName(CONNING_OUTPUT_LEGACY_SHEET_NAME_);
    if (legacy) { legacy.setName(CONNING_OUTPUT_SHEET_NAME_); sheet = legacy; }
  }
  if (!sheet) sheet = ss.insertSheet(CONNING_OUTPUT_SHEET_NAME_);
  migrateConningOutputHeaders_(sheet);
  ensureHeaders_(sheet, CONNING_OUTPUT_HEADERS_);
  return sheet;
}
function migrateConningOutputHeaders_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) return;
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headers = range.getValues()[0];
  const normalized = headers.map(normalizeHeader_);
  const machineIndex = normalized.indexOf('machine');
  const coveringIndex = normalized.indexOf('covering m c');
  if (machineIndex >= 0 && coveringIndex < 0) sheet.getRange(1, machineIndex + 1).setValue('Covering M/C');
}
function setupConningStatus() {
  const sheet = getConningOutputSheet_();
  return { ok: true, sheetName: sheet.getName(), headers: CONNING_OUTPUT_HEADERS_ };
}
function outputCell_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    const index = map[normalizeHeader_(names[i])];
    if (index !== undefined) return row[index];
  }
  return '';
}
/* Doubler output fields merged directly - no wrapper function. */
function conningOutputObject_(row, rowNumber, map) {
  const coveringValue = outputCell_(row, map, ['covering m/c', 'machine']);
  const coveringMachine = Number(coveringValue);
  const out = {
    rowNumber: rowNumber,
    outputId: formatCell_(outputCell_(row, map, ['output id'])),
    barcode: formatCell_(outputCell_(row, map, ['barcode'])),
    crateNo: formatCell_(outputCell_(row, map, ['crate/carate no', 'crate no', 'carate no'])),
    productionRow: Number(outputCell_(row, map, ['production row'])) || 0,
    sourceBox: normalizeSourceBoxes_(formatCell_(outputCell_(row, map, ['source box']))),
    product: formatCell_(outputCell_(row, map, ['product'])),
    yarn: formatCell_(outputCell_(row, map, ['yarn'])),
    coveringMachine: Number.isFinite(coveringMachine) ? coveringMachine : formatCell_(coveringValue),
    machine: Number.isFinite(coveringMachine) ? coveringMachine : formatCell_(coveringValue),
    conningMachine: formatCell_(outputCell_(row, map, ['conning m/c', 'conning machine'])),
    unit: formatCell_(outputCell_(row, map, ['unit'])) || '',
    outputQty: Number(outputCell_(row, map, ['output qty (kg)', 'output qty', 'quantity'])) || 0,
    cones: Number(outputCell_(row, map, ['no of cones', 'cones', 'cone count'])) || 0,
    conningOperator: formatCell_(outputCell_(row, map, ['conning operator', 'operator'])),
    conningOperatorId: formatCell_(outputCell_(row, map, ['conning operator id', 'operator id'])),
    productionEnteredBy: formatCell_(outputCell_(row, map, ['production entered by', 'entered by'])),
    conningDate: formatCell_(outputCell_(row, map, ['conning date', 'date'])),
    shift: formatCell_(outputCell_(row, map, ['shift'])),
    status: formatCell_(outputCell_(row, map, ['status'])),
    qcResult: formatCell_(outputCell_(row, map, ['qc result'])),
    qcBy: formatCell_(outputCell_(row, map, ['qc by'])),
    qcDate: formatCell_(outputCell_(row, map, ['qc date/time', 'qc date'])),
    qcRemarks: formatCell_(outputCell_(row, map, ['qc remarks', 'remarks'])),
    defectDept: formatCell_(outputCell_(row, map, ['defect department'])),
    defectType: formatCell_(outputCell_(row, map, ['defect type'])),
    defectPhoto: formatCell_(outputCell_(row, map, ['defect photo url'])) || extractPhotoUrl_(formatCell_(outputCell_(row, map, ['defect photo']))),
    createdAt: formatCell_(outputCell_(row, map, ['created at'])),
    updatedAt: formatCell_(outputCell_(row, map, ['updated at'])),
    process: formatCell_(outputCell_(row, map, ['process'])) || 'CONNING',
    doublerMachine: formatCell_(outputCell_(row, map, ['doubler m/c', 'doubler machine'])),
    sourceIssueIds: formatCell_(outputCell_(row, map, ['source issue ids'])),
    receiveDate: formatCell_(outputCell_(row, map, ['receive date']))
  };
  if (String(out.process).toUpperCase() === 'DOUBLER') {
    out.machine = out.doublerMachine || out.machine;
    out.conningDate = out.receiveDate || out.conningDate;
  }
  return out;
}
function readAllConningOutputs_() {
  const sheet = getConningOutputSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const map = headerMap_(values[0]);
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    if (!String(outputCell_(values[r], map, ['output id']) || '').trim()) continue;
    rows.push(conningOutputObject_(values[r], r + 1, map));
  }
  return rows.reverse();
}
function getConningOutputs_(user) { return readAllConningOutputs_(); }
function getQCOutputs_(user, pendingOnly) {
  const rows = getConningOutputs_(user);
  if (!pendingOnly) return rows;
  return rows.filter(function (row) { return ['Ready for QC', 'QC Hold', 'Rework Required'].indexOf(row.status) >= 0; });
}
function productionSourceFromValues_(headers, row, rowNumber) {
  const coveringMachineIndex = findHeader_(headers, ['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  const coveringMachine = Number(row[coveringMachineIndex]);
  if (!validMachine_(coveringMachine)) return null;
  const unitIndex = findHeader_(headers, ['unit']);
  return {
    sourceRow: rowNumber, sourceId: 'PROD-' + rowNumber,
    date: formatDateCell_(row[findHeader_(headers, ['date'])]),
    box: cleanBox_(row[findHeader_(headers, ['box number', 'box'])]),
    coveringMachine: coveringMachine, machine: coveringMachine,
    unit: unitIndex >= 0 ? formatCell_(row[unitIndex]) || '' : '',
    shift: formatCell_(row[findHeader_(headers, ['shift'])]),
    product: formatCell_(row[findHeader_(headers, ['product name', 'product'])]),
    yarn: formatCell_(row[findHeader_(headers, ['yarn code', 'yarn'])]),
    rolls: formatCell_(row[findHeader_(headers, ['no of roll', 'rolls', 'roll count'])]),
    gross: formatCell_(row[findHeader_(headers, ['gross weight', 'gross'])]),
    net: formatCell_(row[findHeader_(headers, ['net weight', 'net'])]),
    status: formatCell_(row[findHeader_(headers, ['status'])]),
    enteredBy: formatCell_(row[findHeader_(headers, ['entered by', 'user', 'username'])])
  };
}
function productionSourceFromRow_(rowNumber) {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet || !Number.isInteger(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) return null;
  const values = sheet.getDataRange().getValues();
  if (values.length < rowNumber) return null;
  const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
  return productionSourceFromValues_(headers, values[rowNumber - 1], rowNumber);
}
function outputQuantityForProduct_(product, outputRows) {
  const clean = String(product || '').trim().toLowerCase();
  if (!clean) return 0;
  return (outputRows || readAllConningOutputs_()).reduce(function (total, row) {
    return total + (String(row.product || '').trim().toLowerCase() === clean ? Number(row.outputQty) || 0 : 0);
  }, 0);
}
function coveringMachinesForBoxes_(boxes) {
  const wanted = (boxes || []).map(function (b) { return cleanBox_(b).toLowerCase(); }).filter(Boolean);
  if (!wanted.length) return '';
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) return '';
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return '';
  const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
  const iBox = findHeader_(headers, ['box number', 'box']);
  const iMc = findHeader_(headers, ['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  if (iBox < 0 || iMc < 0) return '';
  const set = [];
  for (let r = 1; r < values.length; r++) {
    const box = cleanBox_(values[r][iBox]).toLowerCase();
    if (box && wanted.indexOf(box) >= 0) {
      const mc = String(values[r][iMc] || '').trim();
      if (mc && set.indexOf(mc) < 0) set.push(mc);
    }
  }
  return set.join(', ');
}
function selectedBoxesPendingTotal_(boxes) {
  const wanted = (boxes || []).map(function (b) { return cleanBox_(b).toLowerCase(); }).filter(Boolean);
  if (!wanted.length) return null;
  const rows = getTrackingRows_();
  let total = 0, found = 0;
  rows.forEach(function (row) {
    if (wanted.indexOf(cleanBox_(row.box).toLowerCase()) >= 0) {
      total += Math.max(Number(row.issueWeight) - Number(row.returnWeight), 0);
      found++;
    }
  });
  return found ? total : null;
}
function uniqueText_(items) {
  const seen = {};
  return (items || []).map(function (item) { return String(item == null ? '' : item).trim(); }).filter(function (item) {
    const key = item.toLowerCase();
    if (!item || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}
function aggregateConningSources_() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) throw new Error('Entry sheet not found: ' + CONFIG.ENTRY_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
  const groups = {};
  for (let r = values.length - 1; r >= 1; r--) {
    const source = productionSourceFromValues_(headers, values[r], r + 1);
    if (!source || !source.product) continue;
    const product = String(source.product).trim();
    const key = product.toLowerCase();
    if (!groups[key]) groups[key] = {
      sourceKey: 'PRODUCT:' + key, sourceRow: 0, sourceRows: [], sourceBoxes: [],
      date: source.date, box: '', product: product, yarns: [], coveringMachines: [],
      units: [], shifts: [], rolls: 0, gross: 0, net: 0, statuses: [], enteredBys: []
    };
    const group = groups[key];
    group.sourceRows.push(source.sourceRow);
    if (source.box) group.sourceBoxes.push(source.box);
    if (source.yarn) group.yarns.push(source.yarn);
    if (source.coveringMachine) group.coveringMachines.push(source.coveringMachine);
    if (source.unit) group.units.push(source.unit);
    if (source.shift) group.shifts.push(source.shift);
    if (source.status) group.statuses.push(source.status);
    if (source.enteredBy) group.enteredBys.push(source.enteredBy);
    group.rolls += Number(source.rolls) || 0;
    group.gross += Number(source.gross) || 0;
    group.net += Number(source.net) || 0;
  }
  const outputRows = readAllConningOutputs_();
  return Object.keys(groups).map(function (key) {
    const group = groups[key];
    const consumed = outputQuantityForProduct_(group.product, outputRows);
    return {
      sourceKey: group.sourceKey, sourceRow: group.sourceRows.length ? group.sourceRows[0] : 0,
      sourceRows: group.sourceRows, sourceBoxes: uniqueText_(group.sourceBoxes),
      sourceId: group.sourceKey, date: group.date, box: '', product: group.product,
      yarn: uniqueText_(group.yarns).join(', '),
      coveringMachine: uniqueText_(group.coveringMachines).join(', '),
      machine: uniqueText_(group.coveringMachines).join(', '),
      unit: uniqueText_(group.units).join(', '), shift: uniqueText_(group.shifts).join(', '),
      rolls: group.rolls, gross: group.gross, net: group.net, referenceNet: group.net,
      consumedQty: consumed, remainingNet: Math.max(group.net - consumed, 0),
      status: uniqueText_(group.statuses).join(', '), enteredBy: uniqueText_(group.enteredBys).join(', ')
    };
  }).sort(function (a, b) { return a.product.localeCompare(b.product); });
}
function getConningSources_(user) { return aggregateConningSources_(); }
function getAggregateConningSourceByProduct_(product) {
  const clean = String(product || '').trim().toLowerCase();
  if (!clean) return null;
  return aggregateConningSources_().find(function (row) {
    return String(row.product || '').trim().toLowerCase() === clean;
  }) || null;
}
function makeConningOutputId_() {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  return 'CON-' + date + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
}
function latestConningOutputForCarate_(carateNo) {
  const clean = String(carateNo || '').trim().toLowerCase();
  if (!clean) return null;
  const rows = readAllConningOutputs_();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i].crateNo || '').trim().toLowerCase() === clean) return rows[i];
  }
  return null;
}
function carateAvailable_(latest) {
  if (!latest) return true;
  return String(latest.status || '').trim() !== 'Ready for QC';
}
function getCarateStatus_(user, carateNo) {
  const clean = String(carateNo || '').trim();
  if (!clean) throw new Error('Scan or enter a carate barcode first.');
  const latest = latestConningOutputForCarate_(clean);
  return {
    carateNo: clean, available: carateAvailable_(latest),
    status: latest ? latest.status : 'Available',
    latestOutputId: latest ? latest.outputId : '', latestProduct: latest ? latest.product : '',
    latestUnit: latest ? latest.unit : '', latestQCDate: latest ? latest.qcDate : ''
  };
}
function appendConningOutputRow_(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = headerMap_(headers);
  const row = new Array(headers.length).fill('');
  function set(names, value) {
    for (let i = 0; i < names.length; i++) {
      const index = map[normalizeHeader_(names[i])];
      if (index !== undefined) { row[index] = value; return; }
    }
  }
  set(['output id'], data.outputId);
  set(['barcode'], data.barcode);
  set(['crate/carate no', 'crate no', 'carate no'], data.crateNo);
  set(['production row'], data.sourceRow);
  set(['source box'], data.sourceBox);
  set(['product'], data.product);
  set(['yarn'], data.yarn);
  set(['covering m/c', 'machine'], data.coveringMachine);
  set(['unit'], data.unit);
  set(['conning m/c', 'conning machine'], data.conningMachine);
  set(['output qty (kg)', 'output qty', 'quantity'], data.outputQty);
  set(['no of cones', 'cones', 'cone count'], data.cones);
  set(['conning operator', 'operator'], data.operator);
  set(['conning operator id', 'operator id'], data.conningOperatorId);
  set(['production entered by', 'entered by'], data.productionEnteredBy);
  set(['conning date'], data.conningDate);
  set(['shift'], data.shift);
  set(['status'], data.status);
  set(['created at'], data.createdAt);
  set(['updated at'], data.updatedAt);
  sheet.appendRow(row);
}
function createConningOutput_(body) {
  const user = String(body.token || '').trim() ? requireSession_(body.token)
    : { name: String(body.operatorName || '').trim() || 'Conning', username: 'conning', role: 'conning' };
  if (String(user.role || '').toLowerCase() === 'qc') throw new Error('QC users cannot create Conning output.');
  const sourceProduct = String(body.sourceProduct || body.productName || body.product || '').trim();
  const sourceRow = Number(body.sourceRow || body.productionRow);
  const source = sourceProduct ? getAggregateConningSourceByProduct_(sourceProduct) : productionSourceFromRow_(sourceRow);
  if (!source) throw new Error('Select a valid production product as the source.');
  const crateNo = String(body.crateNo || body.carateNo || '').trim();
  if (!crateNo) throw new Error('Scan or enter the crate/carate number.');
  const conningMachine = String(body.conningMachine || body.conningMc || '').trim();
  if (!conningMachine) throw new Error('Enter the Conning M/C number. It is separate from the covering machine.');
  const operatorId = String(body.operatorId || body.conningOperatorId || '').trim();
  if (!operatorId) throw new Error('Select the Conning operator ID.');
  const outputQty = Number(body.outputQty);
  if (!Number.isFinite(outputQty) || outputQty <= 0) throw new Error('Enter the actual material weight in the carate.');
  const cones = Number(body.cones || body.noOfCones || body.coneCount);
  if (!Number.isInteger(cones) || cones <= 0) throw new Error('Enter the number of cones in the carate.');
  const requestedSourceBoxes = Array.isArray(body.sourceBoxes) ? uniqueText_(body.sourceBoxes)
    : String(body.sourceBoxes || '').split(/[,;]+/).map(function (v) { return String(v || '').trim(); }).filter(Boolean);
  const selectedPending = selectedBoxesPendingTotal_(requestedSourceBoxes);
  if (selectedPending !== null && outputQty > selectedPending + 0.01) {
    throw new Error('Entered weight ' + outputQty.toFixed(2) + ' kg is greater than the pending weight of the selected boxes (' + selectedPending.toFixed(2) + ' kg).');
  }
  const coveringForBoxes = coveringMachinesForBoxes_(requestedSourceBoxes);
  const outputId = String(body.outputId || '').trim() || makeConningOutputId_();
  const rows = readAllConningOutputs_();
  if (rows.some(function (row) { return row.outputId === outputId; })) throw new Error('This output ID already exists.');
  const latestForCarate = latestConningOutputForCarate_(crateNo);
  if (!carateAvailable_(latestForCarate)) {
    throw new Error('Carate ' + crateNo + ' is currently ' + String(latestForCarate.status || 'in use') + '. It becomes available again after QC selects a result.');
  }
  const sheet = getConningOutputSheet_();
  const now = new Date();
  appendConningOutputRow_(sheet, {
    outputId: outputId, barcode: outputId, crateNo: crateNo,
    sourceRow: source.sourceRows ? source.sourceRows.join(',') : source.sourceRow,
    sourceBox: normalizeSourceBoxes_(requestedSourceBoxes.length ? requestedSourceBoxes : (source.sourceBoxes && source.sourceBoxes.length ? source.sourceBoxes : [source.box])),
    product: source.product, yarn: source.yarn,
    coveringMachine: coveringForBoxes || source.coveringMachine, unit: source.unit,
    conningMachine: conningMachine, outputQty: outputQty, cones: cones,
    operator: String(body.operatorName || '').trim() || (user.name || user.username),
    conningOperatorId: operatorId, productionEnteredBy: source.enteredBy || '',
    conningDate: body.conningDate || formatDateCell_(now), shift: body.shift || source.shift || 'DAY',
    status: 'Ready for QC', createdAt: now, updatedAt: now
  });
  return { ok: true, outputId: outputId, barcode: outputId, crateNo: crateNo, conningMachine: conningMachine, operatorId: operatorId, cones: cones, status: 'Ready for QC' };
}
function findConningOutput_(user, code) {
  const clean = String(code || '').trim().toLowerCase();
  if (!clean) throw new Error('Scan a crate barcode or enter a crate number.');
  const row = getConningOutputs_(user).find(function (item) {
    return [item.outputId, item.barcode, item.crateNo].some(function (value) {
      return String(value || '').toLowerCase() === clean;
    });
  });
  if (!row) throw new Error('No Conning output found for this barcode or crate number.');
  return row;
}
function updateQC_(body) {
  const user = requireQC_(body.token);
  const output = findConningOutput_(user, body.outputId || body.code || body.crateNo);
  const result = String(body.result || '').trim().toUpperCase();
  if (!QC_RESULT_STATUS_[result]) throw new Error('Choose Pass, Hold, Reject, or Rework.');
  const sheet = getConningOutputSheet_();
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const rowNumber = output.rowNumber;
  const set = function (names, value) {
    const index = names.map(normalizeHeader_).map(function (name) { return map[name]; }).find(function (i) { return i !== undefined; });
    if (index !== undefined) sheet.getRange(rowNumber, index + 1).setValue(value);
  };
  const now = new Date();
  set(['status'], QC_RESULT_STATUS_[result]);
  set(['qc result'], result);
  set(['qc by'], user.name || user.username);
  set(['qc date/time'], now);
  set(['qc remarks', 'remarks'], String(body.remarks || '').trim());
  set(['defect department'], String(body.defectDept || '').trim());
  set(['defect type'], String(body.defectType || '').trim());
  let photoUrl = '';
  if (String(body.defectPhoto || '').indexOf('data:image') === 0) {
    photoUrl = saveDefectPhoto_(String(body.defectPhoto), output.outputId);
    if (photoUrl) {
      const photoIndex = map[normalizeHeader_('defect photo')];
      if (photoIndex !== undefined) sheet.getRange(rowNumber, photoIndex + 1).setFormula('=IMAGE("' + photoUrl + '")');
      const urlIndex = map[normalizeHeader_('defect photo url')];
      if (urlIndex !== undefined) sheet.getRange(rowNumber, urlIndex + 1).setValue(photoUrl);
    }
  }
  set(['updated at'], now);
  return { ok: true, outputId: output.outputId, status: QC_RESULT_STATUS_[result], result: result,
    defectPhotoSaved: !!photoUrl,
    photoError: photoUrl ? '' : (String(body.defectPhoto || '').indexOf('data:image') === 0 ? ('Drive upload failed: ' + getLastPhotoError_() + ' - redeploy and approve Drive access.') : '') };
}
function extractPhotoUrl_(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/IMAGE\(\s*"([^"]+)"/i);
  return match ? match[1] : raw;
}
function setupDefectPhotos() {
  const folder = getDefectPhotoFolder_();
  return { ok: true, folder: folder.getName() };
}
function getDefectPhotoFolder_() {
  const existing = DriveApp.getFoldersByName('QC Defect Photos');
  return existing.hasNext() ? existing.next() : DriveApp.createFolder('QC Defect Photos');
}
let lastPhotoError_ = '';
function getLastPhotoError_() { return lastPhotoError_; }
function saveDefectPhoto_(dataUrl, outputId) {
  try {
    const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+\-]+);base64,(.+)$/);
    if (!match) return '';
    const ext = match[1] === 'image/png' ? '.png' : '.jpg';
    const blob = Utilities.newBlob(Utilities.base64Decode(match[2]), match[1],
      'Defect-' + String(outputId || 'QC') + '-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + ext);
    const file = getDefectPhotoFolder_().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://lh3.googleusercontent.com/d/' + file.getId();
  } catch (err) {
    lastPhotoError_ = String(err && err.message ? err.message : err);
    return '';
  }
}
function traceOptions_() {
  const outputs = readAllConningOutputs_();
  const prodSet = {}, opMap = {};
  outputs.forEach(function (o) {
    const prod = String(o.product || '').trim();
    if (prod) prodSet[normKey_(prod)] = prod;
    const id = String(o.conningOperatorId || '').trim();
    if (id) opMap[id] = { id: id, name: String(o.conningOperator || '').trim() };
  });
  return { ok: true,
    products: Object.keys(prodSet).map(function (k) { return prodSet[k]; }).sort(),
    operators: Object.keys(opMap).map(function (k) { return opMap[k]; }).sort(function (x, y) { return String(x.id).localeCompare(String(y.id)); }) };
}
function traceCone_(p) {
  const product = normKey_(p.product || '');
  const op = String(p.operatorId || '').trim().toLowerCase();
  const from = String(p.dateFrom || ''), to = String(p.dateTo || '');
  const outputs = readAllConningOutputs_().filter(function (o) {
    if (product && normKey_(o.product || '').indexOf(product) < 0) return false;
    if (op) {
      const oid = String(o.conningOperatorId || '').toLowerCase();
      const on = String(o.conningOperator || '').toLowerCase();
      if (oid !== op && on.indexOf(op) < 0 && oid.indexOf(op) < 0) return false;
    }
    const d = String(o.conningDate || '');
    if (from && d && d < from) return false;
    if (to && d && d > to) return false;
    return true;
  }).slice(0, 60);
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  const prodByBox = {};
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(function (v) { return String(v || '').toLowerCase(); });
    for (let r = 1; r < values.length; r++) {
      const src = productionSourceFromValues_(headers, values[r], r + 1);
      if (!src || !src.box) continue;
      const key = cleanBox_(src.box);
      if (key && !prodByBox[key]) prodByBox[key] = src;
    }
  }
  const issues = getMaterialIssueRows_();
  const rows = outputs.map(function (o) {
    const boxes = String(o.sourceBox || '').split(',').map(cleanBox_).filter(Boolean).map(function (b) {
      const src = prodByBox[b] || null;
      const mc = src ? String(src.coveringMachine || '') : '';
      const prodDate = src ? String(src.date || '') : '';
      const rel = issues.filter(function (i) {
        if (!mc || String(i.machine || '') !== mc) return false;
        if (prodDate && i.date && i.date > prodDate) return false;
        return true;
      }).slice(-3);
      return { box: b, coveringMachine: mc, prodDate: prodDate, yarn: src ? String(src.yarn || '') : '', materialIssues: rel };
    });
    return { crateNo: o.crateNo, product: o.product, conningOperator: o.conningOperator,
      conningOperatorId: o.conningOperatorId, conningMachine: o.conningMachine, conningDate: o.conningDate,
      status: o.status, qcBy: o.qcBy, defectDept: o.defectDept, defectType: o.defectType,
      cones: o.cones, outputQty: o.outputQty, boxes: boxes };
  });
  return { ok: true, rows: rows };
}
/* ---------------- Material Issue (covering machines) ---------------- */
const MATERIAL_ISSUE_SHEET_NAME_ = 'MATERIAL ISSUE';
const MATERIAL_STOCK_SHEET_NAME_ = 'MATERIAL STOCK';
const MATERIAL_STOCK_HEADERS_ = ['Material', 'Stock', 'Updated At'];
const MATERIAL_ISSUE_HEADERS_ = ['ID', 'Date', 'Shift', 'Machine', 'Product', 'Required Metallic', 'Issued Material', 'Stock Item', 'Lot No', 'Box No', 'Bobbins', 'Bobbin Weight g', 'Qty', 'Remarks', 'Issued By', 'Created At'];
function normKey_(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function getMaterialIssueSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(MATERIAL_ISSUE_SHEET_NAME_);
  if (!sheet) sheet = ss.insertSheet(MATERIAL_ISSUE_SHEET_NAME_);
  ensureHeaders_(sheet, MATERIAL_ISSUE_HEADERS_);
  return sheet;
}
function getMaterialStockSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(MATERIAL_STOCK_SHEET_NAME_);
  if (!sheet) sheet = ss.insertSheet(MATERIAL_STOCK_SHEET_NAME_);
  ensureHeaders_(sheet, MATERIAL_STOCK_HEADERS_);
  return sheet;
}
function getMaterialStockRows_() {
  const sheet = getSpreadsheet_().getSheetByName(MATERIAL_STOCK_SHEET_NAME_);
  if (!sheet || sheet.getLastRow() < 2 || sheetIsLotStructured_(sheet)) return [];
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    const material = formatCell_(values[r][map[normalizeHeader_('material')]]);
    if (!material) continue;
    rows.push({ material: material, stock: Number(values[r][map[normalizeHeader_('stock')]]) || 0, updatedAt: formatCell_(values[r][map[normalizeHeader_('updated at')]]) });
  }
  return rows.sort(function (a, b) { return a.material.localeCompare(b.material); });
}
function getPlanningLive_() {
  const cache = CacheService.getScriptCache();
  const CK = 'planning_live_v1';
  let hit = null;
  try { hit = cache.get(CK); } catch (e) {}
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  const ss = SpreadsheetApp.openById('1Zk_8vvbuGGeA6teAKykPDT80eg9Em99byOakBlBVMEE');
  const sheet = ss.getSheetByName('Production Planning');
  if (!sheet) throw new Error('Production Planning sheet not found.');
  const last = sheet.getLastRow();
  const values = last > 1 ? sheet.getRange(2, 1, last - 1, 7).getValues() : [];
  const rows = [];
  for (let r = 0; r < values.length; r++) {
    const m = Number(values[r][0]);
    const prod = formatCell_(values[r][1]);
    const met = formatCell_(values[r][6]);
    if (Number.isFinite(m) && m > 0 && prod) rows.push({ m: m, p: prod, g: met || '' });
  }
  const out = { ok: true, rows: rows };
  try { cache.put(CK, JSON.stringify(out), 300); } catch (e) {}
  return out;
}
function warmPlanningCache_() { try { getPlanningLive_(); } catch (e) {} }
const QR_SHEET_NAME_ = 'QR CODES';
const QR_HEADERS_ = ['Code', 'Box', 'Product', 'CoverMC', 'ConnMC', 'OpID', 'OpName', 'Metallic', 'Weight', 'Serial', 'Qty', 'IssueDate', 'CreatedAt'];
function getQrSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(QR_SHEET_NAME_);
  if (!sheet) sheet = ss.insertSheet(QR_SHEET_NAME_);
  ensureHeaders_(sheet, QR_HEADERS_);
  return sheet;
}
function saveQrBatch_(body) {
  const rows = (body && body.rows) || [];
  if (!rows.length) throw new Error('No QR rows.');
  const sheet = getQrSheet_();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const stamp = new Date();
    const grid = rows.map(function (r) {
      return [String(r.code || ''), String(r.box || ''), String(r.product || ''), String(r.coverMc || ''),
        String(r.connMc || ''), String(r.opId || ''), String(r.opName || ''), String(r.metallic || ''),
        String(r.weight || ''), String(r.serial || ''), String(r.qty || ''), String(r.issueDate || ''), stamp];
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, grid.length, QR_HEADERS_.length).setValues(grid);
  } finally { lock.releaseLock(); }
  return { ok: true, saved: rows.length };
}
function coveringTraceFor_(machine, product) {
  const rows = getMaterialIssueRows_();
  const nm = String(machine || '').trim();
  const np = normKey_(product);
  const scopeOut = { scope: 'product' };
  let matches = rows.filter(function (r) { return String(r.machine || '').trim() === nm && np && normKey_(r.product) === np; });
  if (!matches.length) {
    matches = rows.filter(function (r) { return String(r.machine || '').trim() === nm; });
    scopeOut.scope = matches.length ? 'machine' : 'none';
  }
  const pd = function (s) {
    const m = String(s || '').match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (!m) return 0;
    let y = Number(m[3]); if (y < 100) y += 2000;
    return new Date(y, Number(m[2]) - 1, Number(m[1])).getTime();
  };
  matches.sort(function (x, y) { return pd(y.date) - pd(x.date); });
  scopeOut.rows = matches.slice(0, 8).map(function (r) {
    return { date: r.date, shift: r.shift, machine: r.machine, product: r.product, stockItem: r.stockItem,
      lotNo: r.lotNo, boxNo: r.boxNo, bobbins: r.bobbins || 0, bobbinWt: r.bobbinWt || 0, qty: r.qty, user: r.user };
  });
  return scopeOut;
}
function qrLookup_(p) {
  const code = String(p.code || '').trim().toUpperCase();
  if (!code) return { ok: false, error: 'Enter a QR code.' };
  const sheet = getSpreadsheet_().getSheetByName(QR_SHEET_NAME_);
  if (!sheet || sheet.getLastRow() < 2) return { ok: false, error: 'No QR codes stored yet.' };
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][map[normalizeHeader_('code')]] || '').trim().toUpperCase() === code) {
      const result = { ok: true, row: {
        code: formatCell_(values[r][map[normalizeHeader_('code')]]),
        box: formatCell_(values[r][map[normalizeHeader_('box')]]),
        product: formatCell_(values[r][map[normalizeHeader_('product')]]),
        coverMc: formatCell_(values[r][map[normalizeHeader_('covermc')]]),
        connMc: formatCell_(values[r][map[normalizeHeader_('connmc')]]),
        opId: formatCell_(values[r][map[normalizeHeader_('opid')]]),
        opName: formatCell_(values[r][map[normalizeHeader_('opname')]]),
        metallic: formatCell_(values[r][map[normalizeHeader_('metallic')]]),
        weight: formatCell_(values[r][map[normalizeHeader_('weight')]]),
        serial: formatCell_(values[r][map[normalizeHeader_('serial')]]),
        qty: formatCell_(values[r][map[normalizeHeader_('qty')]]),
        issueDate: formatCell_(values[r][map[normalizeHeader_('issuedate')]])
      } };
      try { const tr = coveringTraceFor_(result.row.coverMc, result.row.product); result.coveringTrace = tr.rows; result.traceScope = tr.scope; }
      catch (e2) { result.coveringTrace = []; result.traceScope = 'none'; }
      return result;
    }
  }
  return { ok: false, error: 'Code ' + code + ' not found. It may belong to an older label batch.' };
}
const PLANNING_SPREADSHEET_ID_ = '1Zk_8vvbuGGeA6teAKykPDT80eg9Em99byOakBlBVMEE';
const PLANNING_TAB_NAME_ = 'Production Planning';
function seedMaterialStock_() {
  const ss = SpreadsheetApp.openById(PLANNING_SPREADSHEET_ID_);
  const plan = ss.getSheetByName(PLANNING_TAB_NAME_);
  if (!plan) throw new Error('Production Planning sheet not found.');
  const values = plan.getDataRange().getValues();
  const materials = {};
  for (let r = 1; r < values.length; r++) {
    const m = formatCell_(values[r][6]);
    if (m) materials[normKey_(m)] = m;
  }
  const list = Object.keys(materials).map(function (k) { return materials[k]; }).sort();
  if (!list.length) return { ok: true, added: 0, total: 0 };
  const sheet = getMaterialStockSheet_();
  const stockValues = sheet.getDataRange().getValues();
  const existing = {};
  for (let i = 1; i < stockValues.length; i++) {
    const em = formatCell_(stockValues[i][0]);
    if (em) existing[normKey_(em)] = true;
  }
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let added = 0;
  try {
    const newRows = [];
    list.forEach(function (mat) {
      if (!existing[normKey_(mat)]) { newRows.push([mat, 0, new Date()]); existing[normKey_(mat)] = true; added++; }
    });
    if (newRows.length) sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 3).setValues(newRows);
  } finally { lock.releaseLock(); }
  return { ok: true, added: added, total: list.length };
}
function setMaterialStockBulk_(body) {
  if (sheetIsLotStructured_(getSpreadsheet_().getSheetByName(MATERIAL_STOCK_SHEET_NAME_))) throw new Error('MATERIAL STOCK uses lot structure now — bulk single-value upload is disabled.');
  const rows = (body && body.rows) || [];
  if (!rows.length) throw new Error('No stock rows to upload.');
  const sheet = getMaterialStockSheet_();
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const iMat = map[normalizeHeader_('material')], iStock = map[normalizeHeader_('stock')], iUpd = map[normalizeHeader_('updated at')];
  const index = {};
  for (let r = 1; r < values.length; r++) {
    const m = formatCell_(values[r][iMat]);
    if (m) index[normKey_(m)] = r;
  }
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  let updated = 0, skipped = 0;
  try {
    rows.forEach(function (item) {
      const material = String(item.material || '').trim();
      const qty = Number(item.qty);
      if (!material || !Number.isFinite(qty) || qty < 0) { skipped++; return; }
      const key = normKey_(material);
      if (index[key] !== undefined) {
        sheet.getRange(index[key] + 1, iStock + 1).setValue(qty);
        sheet.getRange(index[key] + 1, iUpd + 1).setValue(new Date());
      } else {
        sheet.appendRow([material, qty, new Date()]);
        index[key] = -1;
      }
      updated++;
    });
  } finally { lock.releaseLock(); }
  return { ok: true, updated: updated, skipped: skipped };
}
function setMaterialStock_(body) {
  if (sheetIsLotStructured_(getSpreadsheet_().getSheetByName(MATERIAL_STOCK_SHEET_NAME_))) throw new Error('MATERIAL STOCK now uses the lot structure. Update rows there directly; single-value stock is disabled.');
  const material = String(body.material || '').trim();
  if (!material) throw new Error('Material name is required.');
  const qty = Number(body.qty);
  if (!Number.isFinite(qty) || qty < 0) throw new Error('Enter a stock quantity of 0 or more.');
  const mode = String(body.mode || 'set').toLowerCase() === 'add' ? 'add' : 'set';
  const sheet = getMaterialStockSheet_();
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const iMat = map[normalizeHeader_('material')], iStock = map[normalizeHeader_('stock')], iUpd = map[normalizeHeader_('updated at')];
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    for (let r = 1; r < values.length; r++) {
      if (normKey_(values[r][iMat]) === normKey_(material)) {
        const current = Number(values[r][iStock]) || 0;
        const next = mode === 'add' ? current + qty : qty;
        sheet.getRange(r + 1, iStock + 1).setValue(next);
        sheet.getRange(r + 1, iUpd + 1).setValue(new Date());
        return { ok: true, material: material, stock: next };
      }
    }
    sheet.appendRow([material, qty, new Date()]);
    return { ok: true, material: material, stock: qty };
  } finally { lock.releaseLock(); }
}
function deductMaterialStock_(material, qty) {
  if (sheetIsLotStructured_(getSpreadsheet_().getSheetByName(MATERIAL_STOCK_SHEET_NAME_))) throw new Error('MATERIAL STOCK uses lot structure now — issue with a selected Lot/Box instead.');
  const sheet = getMaterialStockSheet_();
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const iMat = map[normalizeHeader_('material')], iStock = map[normalizeHeader_('stock')], iUpd = map[normalizeHeader_('updated at')];
  for (let r = 1; r < values.length; r++) {
    if (normKey_(values[r][iMat]) === normKey_(material)) {
      const current = Number(values[r][iStock]) || 0;
      if (qty > current + 0.001) throw new Error('Not enough stock of ' + material + '. Available stock: ' + current);
      const next = Math.max(current - qty, 0);
      sheet.getRange(r + 1, iStock + 1).setValue(next);
      sheet.getRange(r + 1, iUpd + 1).setValue(new Date());
      return next;
    }
  }
  throw new Error('No stock record for ' + material + '. Add its stock first (Metallic Stock panel).');
}
let stockSheetCache_ = null;
function sheetIsLotStructured_(sh) {
  if (!sh || sh.getLastRow() < 1) return false;
  const head = sh.getRange(1, 1, 1, Math.min(sh.getLastColumn(), 12)).getDisplayValues()[0];
  const norm = head.map(function (h) { return normalizeHeader_(h); });
  return norm.some(function (h) { return h && h.indexOf('lotno') >= 0; }) && norm.some(function (h) { return h && h.indexOf('balnce') >= 0; });
}
function findStockSheet_() {
  if (stockSheetCache_) return stockSheetCache_;
  const ss = getSpreadsheet_();
  const preferred = ss.getSheetByName(MATERIAL_STOCK_SHEET_NAME_);
  if (sheetIsLotStructured_(preferred)) { stockSheetCache_ = preferred; return preferred; }
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheetIsLotStructured_(sheets[i])) { stockSheetCache_ = sheets[i]; return sheets[i]; }
  }
  return null;
}
function getMetallicLots_() {
  const sheet = findStockSheet_();
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const map = headerMap_(values[0]);
  const iDate = map[normalizeHeader_('date')], iBox = map[normalizeHeader_('boxno')], iCut = map[normalizeHeader_('cutting')],
    iLot = map[normalizeHeader_('lotno')], iChr = map[normalizeHeader_('lotchr')],
    iBal = map[normalizeHeader_('balnce netweight')] !== undefined ? map[normalizeHeader_('balnce netweight')] : map[normalizeHeader_('balnce')];
  const sections = [];
  let current = null;
  for (let r = 1; r < values.length; r++) {
    const a = String(values[r][0] || '').trim();
    const itemMatch = a.match(/^item\s*[:\-]?\s*(.+)$/i);
    if (itemMatch) { current = { item: itemMatch[1].trim(), lots: [] }; sections.push(current); continue; }
    const boxno = iBox !== undefined ? String(values[r][iBox] || '').trim() : '';
    const lotno = iLot !== undefined ? String(values[r][iLot] || '').trim() : '';
    const bal = iBal !== undefined ? Number(values[r][iBal]) || 0 : 0;
    if (!boxno && !lotno) continue;
    if (!current) { current = { item: 'UNCATEGORISED', lots: [] }; sections.push(current); }
    current.lots.push({ row: r + 1,
      date: iDate !== undefined ? String(values[r][iDate] || '').trim() : '',
      boxno: boxno, cutting: iCut !== undefined ? String(values[r][iCut] || '').trim() : '',
      lotno: lotno, lotchr: iChr !== undefined ? String(values[r][iChr] || '').trim() : '', balance: bal });
  }
  return sections;
}
function deductLot_(lot, qty) {
  const sheet = findStockSheet_();
  if (!sheet) throw new Error('Stock sheet with Lotno/Balnce columns not found.');
  const r = Number(lot.row);
  const values = sheet.getDataRange().getValues();
  if (!r || r < 2 || r > values.length) throw new Error('Invalid stock lot row.');
  const map = headerMap_(values[0]);
  let iBal = map[normalizeHeader_('balnce netweight')];
  if (iBal === undefined) iBal = map[normalizeHeader_('balnce')];
  const iBox = map[normalizeHeader_('boxno')];
  if (iBal === undefined) throw new Error('Balance column not found in stock sheet.');
  const current = Number(values[r - 1][iBal]) || 0;
  if (qty > current + 0.001) throw new Error('Not enough balance in Box ' + (iBox !== undefined ? values[r - 1][iBox] : lot.row) + '. Available: ' + current);
  const next = Math.max(current - qty, 0);
  sheet.getRange(r, iBal + 1).setValue(Number(next.toFixed(2)));
  return next;
}
function writeIssueRow_(obj) {
  const sheet = getMaterialIssueSheet_();
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const row = new Array(values[0].length).fill('');
  Object.keys(obj).forEach(function (k) {
    const idx = map[normalizeHeader_(k)];
    if (idx !== undefined && idx < row.length) row[idx] = obj[k];
  });
  sheet.appendRow(row);
}
function saveMaterialIssue_(body) {
  const machine = String(body.machine || '').trim();
  const product = String(body.product || '').trim();
  const required = String(body.requiredMaterial || '').trim();
  const material = String(body.material || '').trim();
  if (!machine || !product || !material) throw new Error('Machine, product and issued material are required.');
  if (!body.lot && required && normKey_(material) !== normKey_(required)) throw new Error('Different material cannot be issued to M/C ' + machine + '. Required for ' + product + ': ' + required);
  const qty = Number(body.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Enter an issue quantity above 0.');
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  let remaining = null, stockItem = '', lotNo = '', boxNo = '';
  try {
    if (body.lot && Number(body.lot.row)) {
      remaining = deductLot_(body.lot, qty);
      stockItem = String(body.lot.item || ''); lotNo = String(body.lot.lotno || ''); boxNo = String(body.lot.boxno || '');
    } else {
      remaining = deductMaterialStock_(material, qty);
      stockItem = material;
    }
    writeIssueRow_({
      id: String(body.id || Date.now()),
      date: String(body.date || formatDateCell_(new Date())),
      shift: String(body.shift || 'DAY'), machine: machine, product: product,
      'required metallic': required, 'issued material': material, 'stock item': stockItem,
      'lot no': lotNo, 'box no': boxNo,
      'bobbins': body.bobbins ? Number(body.bobbins) || '' : '',
      'bobbin weight g': body.bobbinWtG ? Number(body.bobbinWtG) || '' : '',
      qty: qty, remarks: String(body.remarks || ''), 'issued by': String(body.user || ''),
      'created at': new Date()
    });
  } finally { lock.releaseLock(); }
  return { ok: true, remainingStock: remaining };
}
function saveMaterialIssueBatch_(body) {
  const items = (body && body.items) || [];
  if (!items.length) throw new Error('No boxes to issue.');
  const machine = String(body.machine || '').trim();
  const product = String(body.product || '').trim();
  const required = String(body.requiredMaterial || '').trim();
  if (!machine || !product) throw new Error('Machine and product are required.');
  const shift = String(body.shift || 'DAY');
  const remarks = String(body.remarks || '');
  const user = String(body.user || '');
  const date = String(body.date || formatDateCell_(new Date()));
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const stock = findStockSheet_();
    if (!stock) throw new Error('Stock sheet with Lotno/Balnce columns not found.');
    const values = stock.getDataRange().getValues();
    const map = headerMap_(values[0]);
    let iBal = map[normalizeHeader_('balnce netweight')];
    if (iBal === undefined) iBal = map[normalizeHeader_('balnce')];
    if (iBal === undefined) throw new Error('Balance column not found in stock sheet.');
    const iBox = map[normalizeHeader_('boxno')];
    const results = [], updates = [];
    items.forEach(function (it) {
      const qty = Number(it.qty);
      if (!Number.isFinite(qty) || qty <= 0) throw new Error('Enter an issue quantity above 0.');
      const material = String(it.material || '').trim();
      if (!material) throw new Error('Issued material is required.');
      if (!it.lot || !Number(it.lot.row)) throw new Error('Lot/Box is required for issuing.');
      const r = Number(it.lot.row);
      if (r < 2 || r > values.length) throw new Error('Invalid stock lot row.');
      const current = Number(values[r - 1][iBal]) || 0;
      if (qty > current + 0.001) throw new Error('Not enough balance in Box ' + (iBox !== undefined ? values[r - 1][iBox] : r) + '. Available: ' + current);
      const next = Number(Math.max(current - qty, 0).toFixed(2));
      values[r - 1][iBal] = next;
      updates.push({ r: r, v: next });
      results.push({ box: String(it.lot.boxno || ''), lot: String(it.lot.lotno || ''), qty: qty, remaining: next });
    });
    updates.forEach(function (u) { stock.getRange(u.r, iBal + 1).setValue(u.v); });
    const sheet = getMaterialIssueSheet_();
    const head = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    const hmap = headerMap_(head);
    const cols = head.length;
    const stamp = Date.now();
    const newRows = items.map(function (it, idx) {
      const row = new Array(cols).fill('');
      const set = function (k, v) { const i = hmap[normalizeHeader_(k)]; if (i !== undefined && i < cols) row[i] = v; };
      set('id', String(stamp) + '_' + idx);
      set('date', date); set('shift', shift); set('machine', machine); set('product', product);
      set('required metallic', required);
      set('issued material', String(it.material || '').trim());
      set('stock item', String((it.lot && it.lot.item) || ''));
      set('lot no', String((it.lot && it.lot.lotno) || ''));
      set('box no', String((it.lot && it.lot.boxno) || ''));
      set('bobbins', it.bobbins ? Number(it.bobbins) || '' : '');
      set('bobbin weight g', it.bobbinWtG ? Number(it.bobbinWtG) || '' : '');
      set('qty', Number(it.qty)); set('remarks', remarks); set('issued by', user);
      set('created at', new Date());
      return row;
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, cols).setValues(newRows);
    return { ok: true, issued: newRows.length, results: results };
  } finally { lock.releaseLock(); }
}
function getMaterialIssueRows_() {
  const sheet = getSpreadsheet_().getSheetByName(MATERIAL_ISSUE_SHEET_NAME_);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const map = headerMap_(values[0]);
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    if (!String(values[r][map[normalizeHeader_('id')]] || '').trim()) continue;
    rows.push({
      id: formatCell_(values[r][map[normalizeHeader_('id')]]),
      date: formatDateCell_(values[r][map[normalizeHeader_('date')]]),
      shift: formatCell_(values[r][map[normalizeHeader_('shift')]]),
      machine: formatCell_(values[r][map[normalizeHeader_('machine')]]),
      product: formatCell_(values[r][map[normalizeHeader_('product')]]),
      requiredMaterial: formatCell_(values[r][map[normalizeHeader_('required metallic')]]),
      material: formatCell_(values[r][map[normalizeHeader_('issued material')]]),
      stockItem: formatCell_(values[r][map[normalizeHeader_('stock item')]]),
      lotNo: formatCell_(values[r][map[normalizeHeader_('lot no')]]),
      boxNo: formatCell_(values[r][map[normalizeHeader_('box no')]]),
      bobbins: Number(values[r][map[normalizeHeader_('bobbins')]]) || 0,
      bobbinWt: Number(values[r][map[normalizeHeader_('bobbin weight g')]]) || 0,
      qty: Number(values[r][map[normalizeHeader_('qty')]]) || 0,
      remarks: formatCell_(values[r][map[normalizeHeader_('remarks')]]),
      user: formatCell_(values[r][map[normalizeHeader_('issued by')]]),
      createdAt: formatCell_(values[r][map[normalizeHeader_('created at')]])
    });
  }
  return rows.reverse();
}

/* ---------------- Sheet helpers ---------------- */
function ensureHeaders_(sheet, requiredHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(normalizeHeader_);
  requiredHeaders.forEach(function (header) {
    if (current.indexOf(normalizeHeader_(header)) < 0) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      current.push(normalizeHeader_(header));
    }
  });
}
function headerMap_(headers) {
  const map = {};
  headers.forEach(function (value, index) { map[normalizeHeader_(value)] = index; });
  return map;
}
function normalizeHeader_(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function findHeader_(headers, candidates) {
  const normalized = headers.map(normalizeHeader_);
  const wanted = candidates.map(normalizeHeader_);
  for (let i = 0; i < normalized.length; i++) if (wanted.indexOf(normalized[i]) >= 0) return i;
  for (let i = 0; i < normalized.length; i++) {
    if (wanted.some(function (w) { return w && normalized[i].indexOf(w) >= 0; })) return i;
  }
  return -1;
}
function cell_(row, map, name) {
  const index = map[normalizeHeader_(name)];
  return index === undefined ? '' : row[index];
}
function putCell_(row, map, name, value) {
  const index = map[normalizeHeader_(name)];
  if (index !== undefined) row[index] = value;
}
function normalizeSourceBoxes_(value) {
  const parts = Array.isArray(value) ? value : String(value == null ? '' : value).split(/[,;|]+/);
  return parts.map(cleanBox_).filter(Boolean).join(', ');
}
function cleanBox_(value) {
  let box = String(value == null ? '' : value).trim();
  if (!box) return '';
  box = box.replace(/\.0+$/, '');
  box = box.replace(/,/g, '');
  return box.trim();
}
function formatCell_(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  return String(value).trim();
}
function formatDateCell_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(value == null ? '' : value).trim();
}

/* ---------------- Optional Microsoft 365 login ----------------
   Script Properties: MS_CLIENT_ID, MS_CLIENT_SECRET, MS_TENANT_ID,
   MS_REDIRECT_URI, FRONTEND_URL
----------------------------------------------------------------- */
function microsoftStart_() {
  const props = PropertiesService.getScriptProperties();
  const clientId = props.getProperty('MS_CLIENT_ID');
  const tenant = props.getProperty('MS_TENANT_ID') || 'organizations';
  const redirect = props.getProperty('MS_REDIRECT_URI') || (ScriptApp.getService().getUrl() + '?action=msCallback');
  const frontend = props.getProperty('FRONTEND_URL');
  if (!clientId || !frontend) throw new Error('Microsoft 365 login is not configured. Add MS_CLIENT_ID and FRONTEND_URL in Script Properties.');
  const state = Utilities.getUuid();
  CacheService.getScriptCache().put('msstate:' + state, frontend, 600);
  const query = { client_id: clientId, response_type: 'code', redirect_uri: redirect,
    response_mode: 'query', scope: 'openid profile email User.Read', state: state };
  const url = 'https://login.microsoftonline.com/' + encodeURIComponent(tenant) + '/oauth2/v2.0/authorize?' + toQuery_(query);
  return { ok: true, url: url };
}
function microsoftCallback_(p) {
  const props = PropertiesService.getScriptProperties();
  const frontend = CacheService.getScriptCache().get('msstate:' + String(p.state || '')) || props.getProperty('FRONTEND_URL');
  if (!frontend) return htmlMessage_('Microsoft login could not be completed: missing FRONTEND_URL.');
  if (p.error) return htmlMessage_('Microsoft login was cancelled or denied.');
  try {
    const tenant = props.getProperty('MS_TENANT_ID') || 'organizations';
    const redirect = props.getProperty('MS_REDIRECT_URI') || (ScriptApp.getService().getUrl() + '?action=msCallback');
    const tokenResponse = UrlFetchApp.fetch('https://login.microsoftonline.com/' + encodeURIComponent(tenant) + '/oauth2/v2.0/token', {
      method: 'post',
      payload: { client_id: props.getProperty('MS_CLIENT_ID'), client_secret: props.getProperty('MS_CLIENT_SECRET'),
        code: String(p.code || ''), redirect_uri: redirect, grant_type: 'authorization_code', scope: 'openid profile email User.Read' },
      muteHttpExceptions: true
    });
    const tokenData = JSON.parse(tokenResponse.getContentText());
    if (!tokenData.access_token) throw new Error('Microsoft token exchange failed.');
    const meResponse = UrlFetchApp.fetch('https://graph.microsoft.com/v1/me?$select=displayName,mail,userPrincipalName', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token }, muteHttpExceptions: true
    });
    const me = JSON.parse(meResponse.getContentText());
    const email = String(me.mail || me.userPrincipalName || '').toLowerCase();
    const user = readUsers_().find(function (u) { return u.microsoftEmail && u.microsoftEmail === email; });
    if (!user || !user.active) throw new Error('Your Microsoft account is not assigned access. Ask an administrator to add your email.');
    const session = issueSession_(user.username);
    return htmlRedirect_(frontend, session);
  } catch (err) {
    return htmlMessage_(safeError_(err));
  }
}
function toQuery_(object) {
  return Object.keys(object).map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]); }).join('&');
}
function htmlRedirect_(url, token) {
  const join = url.indexOf('?') >= 0 ? '&' : '?';
  const destination = url + join + 'sso=' + encodeURIComponent(token);
  return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width"><script>location.replace(' + JSON.stringify(destination) + ')</script><p>Completing sign-in…</p>');
}
function htmlMessage_(message) {
  return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width"><p style="font:16px system-ui;padding:24px">' + escapeHtmlServer_(message) + '</p>');
}
function escapeHtmlServer_(value) {
  return String(value).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]; });
}
function cleanExpiredSessions() {
  ensureSystemSheets_();
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SESSIONS_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r--) {
    const expires = values[r][2] instanceof Date ? values[r][2] : new Date(values[r][2]);
    if (!expires || expires.getTime() <= Date.now()) sheet.deleteRow(r + 1);
  }
  return { ok: true };
}
/* ========================== MEERA SAFE RELEASE MODULE ========================== */
const MEERA_RC_VERSION_ = MEERA_FIX_VERSION_;
const MEERA_PENDING_HEADERS_ = ['REQUEST ID','BOX','UNIT','USERNAME','SOURCE','LOCAL STATE','RECEIVED AT','LAST SEEN','DETAILS'];
const MEERA_DELETE_HEADERS_ = ['SOURCE SHEET','REQUEST ID','BOX','DELETED BY','DELETED AT','REASON'];
const MEERA_RECOVERY_HEADERS_ = ['TIME','ADMIN','ACTION','REQUEST ID','BOX','RESULT'];

function meeraEnsureExtraSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1,1,1,headers.length).setValues([headers]); }
  const values = sh.getRange(1,1,1,headers.length).getDisplayValues()[0];
  if (values.map(x=>String(x||'').trim().toUpperCase()).join('|') !== headers.map(x=>x.toUpperCase()).join('|')) {
    throw new Error(name + ' header mismatch. Do not overwrite existing sheet.');
  }
  return sh;
}
function meeraGetDeletionSheet_(ss) { return meeraEnsureExtraSheet_(ss,'MEERA_DELETED_RECORDS',MEERA_DELETE_HEADERS_); }
function meeraIsTombstoned_(ss, source, requestId, box) {
  const tab = ss.getSheetByName('MEERA_DELETED_RECORDS');
  if (!tab || tab.getLastRow() < 2) return false;
  const values = tab.getRange(2,1,tab.getLastRow()-1,3).getDisplayValues();
  return values.some(r => String(r[0]).trim().toUpperCase() === String(source).trim().toUpperCase() &&
    (String(r[1]||'').trim() ? String(r[1]).trim()===String(requestId||'').trim() :
     Boolean(box && String(r[2]).trim().toUpperCase()===String(box).trim().toUpperCase())));
}
function meeraValidateEntryWeights_(body, typeCode) {
  const rollWeights = { A: 0.38, B: 0.29, C: 0.30, D: 0.25 };
  const rollW = rollWeights[typeCode];
  if (!rollW) throw new Error('Invalid roll type.');
  function numberField(value, name, optional) {
    if (optional && (value === undefined || value === null || String(value).trim() === '' || String(value).trim().toLowerCase() === 'auto')) return null;
    if (value === undefined || value === null || String(value).trim() === '') throw new Error(name + ' required.');
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error(name + ' must be a positive finite number.');
    return n;
  }
  const rolls = numberField(body.rollCount, 'Roll Count');
  if (!Number.isInteger(rolls) || rolls < 1 || rolls > 5000) throw new Error('Invalid roll count.');
  const gross = numberField(body.grossW, 'Gross Weight');
  if (!(gross > 0) || gross > 100000) throw new Error('Invalid gross weight.');
  const expectedTare = Math.round(rolls * rollW * 1000) / 1000;
  const clientTare = numberField(body.tapeW, 'Tare Weight', true);
  if (clientTare !== null && Math.abs(clientTare - expectedTare) > 0.02) {
    throw new Error('Tare weight does not match roll tare × rolls. Admin review required.');
  }
  const tare = clientTare === null ? expectedTare : clientTare;
  if (!(gross > tare)) throw new Error('Gross weight must exceed tare weight.');
  const computed = Math.round((gross - tare) * 1000) / 1000;
  const clientNet = numberField(body.netW, 'Net Weight', true);
  if (clientNet !== null && Math.abs(clientNet - computed) > 0.02) {
    throw new Error('Net weight mismatch. Expected ' + computed.toFixed(3) + ' KG.');
  }
  return { rollW, rolls, gross, tare, net: computed };
}
function meeraLivePreflight_() {
  const ss = getSpreadsheet_();
  const prod = ss.getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!prod) throw new Error('PRODUCTION DATA missing.');
  const h = prod.getRange(1,1,1,Math.max(17, prod.getLastColumn())).getDisplayValues()[0];
  const req = String(h[16]||'').trim().toUpperCase();
  const box = h.findIndex(v => String(v).toLowerCase().includes('box'));
  if (req !== 'REQUEST ID') throw new Error('STOP: Column Q (17) must be REQUEST ID. Run meeraRepairProductionLayout().');
  if (box < 0) throw new Error('STOP: BOX NUMBER header missing.');
  const requiredFixed = { 12:'STATUS', 13:'UNIT', 14:'ENTERED BY', 15:'MONTH' };
  Object.keys(requiredFixed).forEach(function (k) {
    if (String(h[Number(k)]||'').trim().toUpperCase() !== requiredFixed[k])
      throw new Error('STOP: Column ' + String.fromCharCode(65+Number(k)) + ' must be ' + requiredFixed[k]);
  });
  const tracking = ss.getSheetByName(CONFIG.TRACKING_SHEET_NAME);
  if (!tracking) throw new Error('STOP: Conning tracking sheet missing.');
  return { ok:true, version:MEERA_RC_VERSION_, productionSheet:prod.getName(), headerQ:req,
    boxColumn:box+1, trackingSheet:tracking.getName(),
    trackingSharesWorkbook:String(CONFIG.TRACKING_SPREADSHEET_ID)===String(CONFIG.SPREADSHEET_ID),
    backupExists:!!ss.getSheetByName('PRODUCTION BACKUP'), rows:prod.getLastRow()-1,
    notice:'READ-ONLY: No sheets changed.' };
}
function meeraPendingInternal_() {
  const ss = getSpreadsheet_(), sh = ss.getSheetByName('PRODUCTION BACKUP');
  const out = [], seen = {}, prod = ss.getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  const prodIds = new Set();
  if (prod && prod.getLastRow() > 1 && String(prod.getRange(1,17).getDisplayValue()).trim().toUpperCase() === 'REQUEST ID') {
    prod.getRange(2,17,prod.getLastRow()-1,1).getDisplayValues().forEach(r => { if (r[0]) prodIds.add(String(r[0]).trim()); });
  }
  if (sh && sh.getLastRow() > 1) {
    const values = sh.getRange(2,1,sh.getLastRow()-1,Math.min(sh.getLastColumn(),10)).getDisplayValues();
    values.forEach((r,i) => {
      const id = String(r[0]||'').trim(), status = String(r[6]||'').trim().toUpperCase();
      if (!id) return;
      const hasProd = prodIds.has(id);
      if (status === 'CONFIRMED' && hasProd) return;
      const derived = status === 'CONFIRMED' && !hasProd ? 'REVIEW_CONFIRMED_BACKUP_MISSING_PRODUCTION'
        : hasProd ? 'REVIEW_PRODUCTION_PRESENT_BACKUP_' + (status||'UNKNOWN') : status || 'UNKNOWN';
      out.push({ requestId:id, date:String(r[1]||''), box:String(r[2]||''), machine:String(r[3]||''),
        unit:String(r[4]||''), username:String(r[5]||''), status:derived, source:'SERVER_BACKUP',
        backupRow:i+2, backupAt:String(r[8]||'') });
      seen[id] = 1;
    });
  }
  const offline = ss.getSheetByName('MEERA_OFFLINE_QUEUE_REPORT');
  if (offline && offline.getLastRow() > 1) {
    const rows = offline.getRange(2,1,offline.getLastRow()-1,MEERA_PENDING_HEADERS_.length).getDisplayValues();
    rows.forEach(r => {
      const id = String(r[0]||'').trim(); if (!id || seen[id] || prodIds.has(id)) return;
      out.push({ requestId:id, box:r[1], unit:r[2], username:r[3], status:r[5],
        source:'OFFLINE_REPORT_NOT_VERIFIED', reportedAt:r[7] });
      seen[id] = 1;
    });
  }
  return out;
}
function meeraAdminPendingSummary_(p) {
  requireAdmin_(p.token);
  const all = meeraPendingInternal_();
  const unit = String(p.unit||'').trim(), username = String(p.username||'').trim().toLowerCase();
  const filtered = all.filter(r => (!unit || String(r.unit) === unit) && (!username || String(r.username).toLowerCase() === username));
  const groups = {};
  filtered.forEach(r => {
    const key = String(r.unit||'?') + '|' + String(r.username||'?');
    if (!groups[key]) groups[key] = { unit:r.unit, username:r.username, count:0, serverBacked:0, offlineReported:0 };
    groups[key].count++;
    if (r.source === 'SERVER_BACKUP') groups[key].serverBacked++; else groups[key].offlineReported++;
  });
  const limit = Math.min(Math.max(Number(p.limit)||200,1),500);
  return { ok:true, version:MEERA_RC_VERSION_, count:filtered.length, byOperator:Object.values(groups),
    items:filtered.slice(0,limit), truncated:filtered.length > limit,
    caveat:'Only SERVER_BACKUP rows reached the server. Run adminReconcilePending to complete them.' };
}
function meeraAuditRecovery_(ss, admin, action, id, box, result) {
  const tab = meeraEnsureExtraSheet_(ss,'MEERA_RECOVERY_AUDIT',MEERA_RECOVERY_HEADERS_);
  tab.appendRow([new Date(), admin, action, id, box, result]);
}
function meeraAdminRetryPending_(body) {
  const admin = requireAdmin_(body.token);
  const id = String(body.requestId||'').trim();
  if (!/^[A-Za-z0-9-]{16,100}$/.test(id)) throw new Error('Request ID required.');
  const ss = getSpreadsheet_(), back = ss.getSheetByName('PRODUCTION BACKUP');
  if (!back || back.getLastRow() < 2) throw new Error('No server-side backup for this request.');
  const bidx = meeraFixBackupIndex_(back);
  const rows = bidx.byId[id] || [];
  if (rows.length !== 1) throw new Error('Request ID is missing or duplicated in backup; review required.');
  const record = back.getRange(rows[0],1,1,10).getDisplayValues()[0];
  const box = String(record[2]||'').trim().toUpperCase();
  const owner = String(record[5]||'').trim().toLowerCase();
  if (meeraIsTombstoned_(ss,'PRODUCTION DATA',id,box)) throw new Error('Deleted record; recovery prohibited.');
  let data;
  try { data = JSON.parse(record[7]); } catch (_) { throw new Error('Backup payload is not valid JSON.'); }
  if (String(data.requestId) !== id || String(data.box).trim().toUpperCase() !== box) throw new Error('Backup payload does not match request identity.');
  const user = findUser_(owner);
  if (!user || !user.active || String(data.machine) !== String(record[3])) throw new Error('Original user inactive or machine mismatch. Manual admin review required.');
  const result = meeraSaveEntryWithUser_(data, user);
  meeraAuditRecovery_(ss, admin.username, 'ADMIN_RETRY', id, box, String(result.status||'SAVED'));
  return { ok:true, result:result, requestId:id, box:box };
}
function meeraAdminRegisterOfflineQueue_(body) {
  const admin = requireAdmin_(body.token);
  const rows = body.entries;
  if (!Array.isArray(rows) || rows.length > 100) throw new Error('Up to 100 exported pending records per report.');
  const ss = getSpreadsheet_(), tab = meeraEnsureExtraSheet_(ss,'MEERA_OFFLINE_QUEUE_REPORT',MEERA_PENDING_HEADERS_);
  let count = 0;
  const existing = tab.getLastRow() > 1 ? new Set(tab.getRange(2,1,tab.getLastRow()-1,1).getDisplayValues().map(r=>r[0])) : new Set();
  const grid = [];
  rows.forEach(e => {
    const p = e.payload || e;
    const id = String(e.requestId || p.requestId || '').trim();
    if (!/^[A-Za-z0-9-]{16,100}$/.test(id) || existing.has(id)) return;
    const box = String(e.box || p.box || '').trim().toUpperCase();
    const unit = String(p.unit || ((box[0] === 'A') ? 1 : (box[0] === 'B' ? 2 : '')));
    const username = String(e.owner || body.username || '').trim().toLowerCase();
    if (!/^[AB]\d+$/.test(box) || ['1','2'].indexOf(unit) < 0 || !username) return;
    grid.push([id, box, unit, username, 'ADMIN_IMPORT', String(e.state||'UNVERIFIED'), new Date(), new Date(), String(e.lastError||'').slice(0,150)]);
    existing.add(id); count++;
  });
  if (grid.length) tab.getRange(tab.getLastRow()+1,1,grid.length,MEERA_PENDING_HEADERS_.length).setValues(grid);
  return { ok:true, registered:count, notice:'Only reports. Entries were NOT written to PRODUCTION DATA.' };
}
function meeraNormalizeFactoryDate_(v) {
  if (v instanceof Date && Number.isFinite(v.getTime())) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const s = String(v||'').trim();
  if (/^\d{4}-\d\d-\d\d/.test(s)) return s.slice(0,10);
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  return m ? m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0') : '';
}
function meeraAdminDailyStats_(p) {
  requireAdmin_(p.token);
  const date = String(p.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must be YYYY-MM-DD');
  const sh = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sh) throw new Error('PRODUCTION DATA missing');
  const data = sh.getDataRange().getValues();
  if (!data.length) return { ok:true, date, groups:[], totals:{ verified:0, netKg:0, legacyWithoutRequestId:0 } };
  const head = data[0];
  const dateCol = findHeader_(head,['date']), boxCol = findHeader_(head,['box number','box']);
  const unitCol = findHeader_(head,['unit']), userCol = findHeader_(head,['entered by','user']), netCol = findHeader_(head,['net weight','net']);
  const reqCol = 16;
  if ([dateCol,boxCol,netCol].some(x=>x<0) || String(head[reqCol]||'').trim().toUpperCase() !== 'REQUEST ID') throw new Error('Production mapping incomplete; run preflight.');
  const unitParam = String(p.unit||'').trim(), operator = String(p.username||'').trim().toLowerCase();
  const backup = getSpreadsheet_().getSheetByName('PRODUCTION BACKUP');
  const confirmedIds = new Set();
  if (backup && backup.getLastRow() > 1) {
    backup.getRange(2,1,backup.getLastRow()-1,7).getDisplayValues().forEach(r => {
      if (String(r[6]||'').trim().toUpperCase() === 'CONFIRMED' && r[0]) confirmedIds.add(String(r[0]).trim());
    });
  }
  const groups = {}, totals = { verified:0, netKg:0, legacyWithoutRequestId:0, unreconciled:0 };
  for (let i = 1; i < data.length; i++) {
    const r = data[i]; if (meeraNormalizeFactoryDate_(r[dateCol]) !== date) continue;
    const box = String(r[boxCol]||'').trim().toUpperCase(); if (!box) continue;
    const unit = String(unitCol >= 0 ? r[unitCol] : (box[0] === 'B' ? '2' : '1')).trim();
    const owner = String(userCol >= 0 ? r[userCol] : '').trim().toLowerCase();
    if (unitParam && unitParam !== unit) continue;
    if (operator && operator !== owner) continue;
    const key = unit + '|' + owner;
    if (!groups[key]) groups[key] = { unit, username:owner, verifiedEntries:0, netKg:0, legacyWithoutRequestId:0 };
    const id = String(r[reqCol]||'').trim();
    if (!id) { groups[key].legacyWithoutRequestId++; totals.legacyWithoutRequestId++; continue; }
    // The production row is the authority; the backup flag is secondary.
    const net = Number(r[netCol]);
    if (!Number.isFinite(net) || net < 0) continue;
    groups[key].verifiedEntries++; groups[key].netKg += net;
    totals.verified++; totals.netKg += net;
    if (!confirmedIds.has(id)) { groups[key].unreconciled = (groups[key].unreconciled||0) + 1; totals.unreconciled++; }
  }
  const pending = meeraPendingInternal_().filter(r => r.source === 'SERVER_BACKUP' && meeraNormalizeFactoryDate_(r.date) === date);
  pending.forEach(r => {
    const key = String(r.unit||'?') + '|' + String(r.username||'?').toLowerCase();
    if (!groups[key]) groups[key] = { unit:r.unit, username:r.username, verifiedEntries:0, netKg:0, legacyWithoutRequestId:0 };
    groups[key].serverPending = (groups[key].serverPending||0) + 1;
  });
  return { ok:true, date, groups:Object.values(groups), totals,
    caveat:'Verified = a production row with a Request ID. Unreconciled counts rows whose backup flag has not flipped yet; the reconciler repairs those automatically.' };
}
function runMeeraPreflight() {
  const result = meeraLivePreflight_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/* ==========================================================================
   AUTO-RECONCILE — completes every orphaned PENDING row from its payload
   ========================================================================== */
function meeraCountPending_() {
  const backup = getSpreadsheet_().getSheetByName('PRODUCTION BACKUP');
  if (!backup || backup.getLastRow() < 2) return 0;
  const statuses = backup.getRange(2,7,backup.getLastRow()-1,1).getDisplayValues();
  let n = 0;
  for (let i = 0; i < statuses.length; i++) {
    if (String(statuses[i][0]||'').trim().toUpperCase() !== 'CONFIRMED') n++;
  }
  return n;
}
function meeraReconcileAllPending(options) {
  const opts = options || {};
  const maxRows = Math.min(Number(opts.maxRows) || 40, 200);
  const budgetMs = Math.min(Number(opts.budgetMs) || 240000, 280000);
  const started = Date.now();
  const ss = getSpreadsheet_();
  const backup = ss.getSheetByName('PRODUCTION BACKUP');
  const summary = { ok:true, version:MEERA_FIX_VERSION_, scanned:0, confirmed:0, saved:0,
    duplicate:0, review:0, failed:0, details:[] };
  if (!backup || backup.getLastRow() < 2) { summary.remaining = 0; return summary; }

  const values = backup.getRange(2,1,backup.getLastRow()-1,10).getDisplayValues();
  let prod = meeraFixProductionIndex_();

  for (let i = 0; i < values.length; i++) {
    if (Date.now() - started > budgetMs || summary.scanned >= maxRows) break;
    const status = String(values[i][6]||'').trim().toUpperCase();
    const requestId = String(values[i][0]||'').trim();
    if (!requestId) continue;
    if (status === 'CONFIRMED' && (prod.byId[requestId]||[]).length === 1) continue;
    summary.scanned++;
    const box = cleanBox_(values[i][2]).toUpperCase();
    try {
      if (meeraIsTombstoned_(ss,'PRODUCTION DATA',requestId,box)) {
        summary.review++; summary.details.push({ requestId, box, result:'TOMBSTONED' }); continue;
      }
      // Different Request IDs may share the same Box. Only conflicting
      // repeated Request IDs require manual investigation.
      const existingById=prod.byId[requestId]||[];
      if (existingById.length>1) {
        summary.review++; summary.details.push({requestId,box,result:'DUPLICATE_REQUEST_ID'}); continue;
      }
      if (existingById.length===1) {
        const foundRow=existingById[0];
        if (prod.boxOf[foundRow]!==box) {
          summary.review++; summary.details.push({requestId,box,result:'BACKUP_BOX_MISMATCH'}); continue;
        }
        const existing=prod.sheet.getRange(foundRow,1,1,prod.width).getDisplayValues()[0];
        const mCol=findHeader_(prod.names,['m/c no','m/c','machine no','machine','mc no']);
        if (mCol<0 || Number(existing[mCol])!==Number(values[i][3]) ||
            String(existing[MEERA_COL_ENTERED_]||'').trim().toLowerCase()!==String(values[i][5]||'').trim().toLowerCase()) {
          summary.review++; summary.details.push({requestId,box,result:'BACKUP_OWNER_MACHINE_MISMATCH'}); continue;
        }
        meeraFixConfirmBackup_(backup, { rowOf:{}, statusOf:{} }, requestId, i+2);
        summary.confirmed++; summary.details.push({ requestId, box, result:'FLAG_REPAIRED' }); continue;
      }
      const data = JSON.parse(values[i][7]);
      if (String(data.requestId) !== requestId || cleanBox_(data.box).toUpperCase() !== box) {
        summary.review++; summary.details.push({ requestId, box, result:'PAYLOAD_MISMATCH' }); continue;
      }
      const owner = findUser_(String(values[i][5]||''));
      if (!owner || !owner.active) {
        summary.review++; summary.details.push({ requestId, box, result:'OWNER_INACTIVE' }); continue;
      }
      // The save engine takes its own lock, so none is held here.
      const result = meeraSaveEntryWithUser_(data, owner);
      const state = String(result.status||'').toUpperCase();
      if (state === 'CONFIRMED') {
        summary.saved++;
        if (result.duplicateBox) summary.duplicate++;
      } else summary.review++;
      summary.details.push({ requestId, box, result:state });
      meeraAuditRecovery_(ss,'AUTO_RECONCILE','RECONCILE',requestId,box,state);
      prod = meeraFixProductionIndex_();
    } catch (err) {
      summary.failed++;
      summary.details.push({ requestId, box, result:'ERROR', error:safeError_(err) });
    }
  }
  summary.remaining = meeraCountPending_();
  summary.elapsedMs = Date.now() - started;
  return summary;
}
function installMeeraReconcileTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'meeraReconcileTrigger_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('meeraReconcileTrigger_').timeBased().everyMinutes(5).create();
  return { ok:true, installed:'meeraReconcileTrigger_ every 5 minutes' };
}
function meeraReconcileTrigger_() {
  try { meeraReconcileAllPending({ maxRows:40, budgetMs:240000 }); } catch (ignore) {}
}
function runMeeraReconcileNow() {
  const result = meeraReconcileAllPending({ maxRows:100 });
  console.log(JSON.stringify(result, null, 2));
  return result;
}
function meeraFixHealth_() {
  const prod = meeraFixProductionIndex_();
  return { ok:true, version:MEERA_FIX_VERSION_,
    layout:{ M:prod.headers[MEERA_COL_STATUS_], N:prod.headers[MEERA_COL_UNIT_],
      O:prod.headers[MEERA_COL_ENTERED_], P:prod.headers[MEERA_COL_MONTH_], Q:prod.headers[MEERA_COL_REQID_] },
    productionRows:Math.max(prod.lastRow-1,0), pendingBackupRows:meeraCountPending_() };
}
function runMeeraFixHealth() {
  const result = meeraFixHealth_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/* One-time layout repair, only needed if the old Doubler file renamed M / N.
   Dry run by default. Take a spreadsheet backup before applying. */
function meeraRepairProductionLayout(apply) {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sheet) throw new Error('PRODUCTION DATA missing.');
  const width = Math.max(sheet.getLastColumn(), MEERA_COL_REQID_ + 1);
  const headers = sheet.getRange(1,1,1,width).getDisplayValues()[0];
  const wanted = {};
  wanted[MEERA_COL_STATUS_] = 'STATUS';
  wanted[MEERA_COL_UNIT_] = 'Unit';
  wanted[MEERA_COL_ENTERED_] = 'Entered By';
  wanted[MEERA_COL_MONTH_] = 'Month';
  wanted[MEERA_COL_REQID_] = 'REQUEST ID';
  const plan = [];
  Object.keys(wanted).forEach(function (k) {
    const i = Number(k), current = String(headers[i]||'').trim();
    if (current.toUpperCase() !== wanted[k].toUpperCase()) plan.push({ column:String.fromCharCode(65+i), from:current||'(blank)', to:wanted[k] });
  });
  if (!plan.length) return { ok:true, changed:false, message:'Layout already correct. Nothing to do.' };
  if (!apply) return { ok:true, changed:false, dryRun:true, plan:plan,
    note:'STATUS values in M were overwritten by the old Doubler override and will be rebuilt from CONNING TRACKING. Call meeraRepairProductionLayout(true) after a backup.' };

  Object.keys(wanted).forEach(function (k) { headers[Number(k)] = wanted[Number(k)]; });
  sheet.getRange(1,1,1,width).setValues([headers]);
  const rowCount = Math.max(sheet.getLastRow()-1, 0);
  if (rowCount > 0) {
    const names = headers.map(v => String(v||'').toLowerCase());
    const machineIndex = findHeader_(names,['m/c no','m/c','machine no','machine','mc no']);
    const machines = machineIndex >= 0 ? sheet.getRange(2,machineIndex+1,rowCount,1).getValues() : null;
    const state = {};
    getTrackingRows_().forEach(function (r) {
      const b = cleanBox_(r.box).toUpperCase(); if (!b) return;
      const pending = Math.max((Number(r.issueWeight)||0) - (Number(r.returnWeight)||0), 0);
      if (!state[b]) state[b] = { pending:0, received:false };
      state[b].pending += pending;
      if (pending <= 0.01 && Number(r.issueWeight) > 0) state[b].received = true;
    });
    const boxIndex = names.findIndex(h => h.indexOf('box') >= 0);
    const boxes = boxIndex >= 0 ? sheet.getRange(2,boxIndex+1,rowCount,1).getDisplayValues() : null;
    const statuses = [], units = [];
    for (let i = 0; i < rowCount; i++) {
      const b = boxes ? cleanBox_(boxes[i][0]).toUpperCase() : '';
      const s = state[b];
      statuses.push([s ? (s.pending > 0.01 ? 'Issue to Conning' : (s.received ? 'Received from Conning' : 'Available for Conning')) : 'Available for Conning']);
      units.push([machines ? (unitForMachine_(machines[i][0]) || '') : '']);
    }
    sheet.getRange(2,MEERA_COL_STATUS_+1,rowCount,1).setValues(statuses);
    sheet.getRange(2,MEERA_COL_UNIT_+1,rowCount,1).setValues(units);
  }
  meeraFixInvalidateCache_();
  return { ok:true, changed:true, applied:plan, rowsRebuilt:rowCount,
    next:'Run runMeeraFixHealth(), then runMeeraReconcileNow().' };
}
/* ==========================================================================
   DOUBLER MODULE — merged inline, layout-corrected
   The old extension forced M=Unit / N=Status and destroyed the STATUS column.
   Here every status read/write uses layout.statusIndex, which is M (12), the
   same column Code.gs owns. Nothing renames headers any more.
   ========================================================================== */
var DOUBLER_ISSUE_SHEET_NAME_ = 'DOUBLER ISSUE';
var DOUBLER_ISSUE_HEADERS_ = [
  'Issue ID', 'Issue Date', 'Shift', 'Doubler M/C', 'Box', 'Product',
  'Issue Qty (kg)', 'Received Qty (kg)', 'Pending Qty (kg)', 'Status',
  'Remarks', 'Issued By', 'Created At', 'Updated At'
];
var DOUBLER_OUTPUT_EXTRA_HEADERS_ = ['Process', 'Doubler M/C', 'Source Issue IDs', 'Receive Date'];
var DOUBLER_MACHINE_MIN_ = 1;
var DOUBLER_MACHINE_MAX_ = 16;

function doublerMachine_(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < DOUBLER_MACHINE_MIN_ || n > DOUBLER_MACHINE_MAX_) {
    throw new Error('Doubler M/C must be between 1 and 16.');
  }
  return n;
}
function requireDoubler_(token) {
  const user = requireSession_(token);
  const role = String(user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'doubler') throw new Error('Doubler access is required.');
  return user;
}
function doublerMachineAllowed_(user, machine) {
  if (String(user.role || '').toLowerCase() === 'admin') return true;
  const list = Array.isArray(user.machines) ? user.machines.map(Number) : [];
  return !list.length || list.indexOf(Number(machine)) >= 0;
}
function requireDoublerMachine_(token, machine) {
  const user = requireDoubler_(token);
  const mc = doublerMachine_(machine);
  if (!doublerMachineAllowed_(user, mc)) throw new Error('You are not allowed to use Doubler M/C ' + mc + '.');
  return { user: user, machine: mc };
}
function getDoublerIssueSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(DOUBLER_ISSUE_SHEET_NAME_);
  if (!sheet) sheet = ss.insertSheet(DOUBLER_ISSUE_SHEET_NAME_);
  ensureHeaders_(sheet, DOUBLER_ISSUE_HEADERS_);
  return sheet;
}
function ensureDoublerOutputHeaders_() {
  const sheet = getConningOutputSheet_();
  ensureHeaders_(sheet, DOUBLER_OUTPUT_EXTRA_HEADERS_);
  return sheet;
}
function doublerNumber_(value) { return Number(String(value == null ? '' : value).replace(/,/g, '')) || 0; }
function doublerDate_(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return formatDateCell_(new Date());
}
function doublerIssueObject_(row, rowNumber, map) {
  const issue = doublerNumber_(cell_(row, map, 'issue qty kg'));
  const received = doublerNumber_(cell_(row, map, 'received qty kg'));
  const pendingCell = doublerNumber_(cell_(row, map, 'pending qty kg'));
  const pending = Math.max(pendingCell || (issue - received), 0);
  return {
    rowNumber: rowNumber,
    issueId: String(cell_(row, map, 'issue id') || ''),
    issueDate: String(cell_(row, map, 'issue date') || ''),
    shift: String(cell_(row, map, 'shift') || 'DAY').toUpperCase() === 'NIGHT' ? 'NIGHT' : 'DAY',
    doublerMachine: String(cell_(row, map, 'doubler m c') || ''),
    box: cleanBox_(cell_(row, map, 'box')),
    product: String(cell_(row, map, 'product') || ''),
    issueQty: issue, receivedQty: received, pendingQty: pending,
    status: String(cell_(row, map, 'status') || (pending > 0.01 ? 'ISSUED' : 'RECEIVED')),
    remarks: String(cell_(row, map, 'remarks') || ''),
    issuedBy: String(cell_(row, map, 'issued by') || ''),
    createdAt: String(cell_(row, map, 'created at') || ''),
    updatedAt: String(cell_(row, map, 'updated at') || '')
  };
}
function getDoublerIssueRows_() {
  const sheet = getDoublerIssueSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const map = headerMap_(values[0]);
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    if (!String(cell_(values[r], map, 'issue id') || '').trim()) continue;
    rows.push(doublerIssueObject_(values[r], r + 1, map));
  }
  return rows;
}
function doublerProductionBoxes_() {
  const layout = ensureUnitColumn_();
  const values = layout.sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(normalizeHeader_);
  const iBox = findHeader_(headers, ['box number', 'box']);
  const iProduct = findHeader_(headers, ['product name', 'product']);
  const iNet = findHeader_(headers, ['net weight', 'net']);
  const iStatus = layout.statusIndex;   // M — the real STATUS column
  const iMachine = findHeader_(headers, ['m/c no', 'm/c', 'machine no', 'machine', 'mc no']);
  if (iBox < 0) throw new Error('PRODUCTION DATA needs a BOX NUMBER column.');
  const byBox = {};
  for (let r = values.length - 1; r >= 1; r--) {
    const box = cleanBox_(values[r][iBox]);
    if (!box || byBox[box.toLowerCase()]) continue;
    const net = iNet >= 0 ? doublerNumber_(values[r][iNet]) : 0;
    if (net <= 0) continue;
    byBox[box.toLowerCase()] = {
      box: box, product: iProduct >= 0 ? formatCell_(values[r][iProduct]) : '',
      net: net, availableQty: net,
      status: iStatus >= 0 ? formatCell_(values[r][iStatus]) : '',
      sourceMachine: iMachine >= 0 ? formatCell_(values[r][iMachine]) : '',
      rowNumber: r + 1
    };
  }
  return Object.keys(byBox).map(function (key) { return byBox[key]; });
}
function doublerConningPendingBoxes_() {
  const pending = {};
  getTrackingRows_().forEach(function (row) {
    const box = cleanBox_(row.box).toLowerCase();
    if (!box) return;
    pending[box] = (pending[box] || 0) + Math.max((Number(row.issueWeight) || 0) - (Number(row.returnWeight) || 0), 0);
  });
  return pending;
}
function doublerPendingByBox_() {
  const pending = {};
  getDoublerIssueRows_().forEach(function (row) {
    const box = cleanBox_(row.box).toLowerCase();
    if (!box) return;
    pending[box] = (pending[box] || 0) + Math.max(Number(row.pendingQty) || 0, 0);
  });
  return pending;
}
function doublerIsAvailableStatus_(status) {
  const s = String(status || '').trim().toLowerCase();
  return !s || s === 'available' || s === 'available for conning' || s === 'available for doubler';
}
function doublerAvailableBoxes_() {
  const conningPending = doublerConningPendingBoxes_();
  const doublerPending = doublerPendingByBox_();
  return doublerProductionBoxes_().filter(function (box) {
    const key = cleanBox_(box.box).toLowerCase();
    return doublerIsAvailableStatus_(box.status) && !(conningPending[key] > 0.01) && !(doublerPending[key] > 0.01);
  }).sort(function (a, b) { return String(a.box).localeCompare(String(b.box), undefined, { numeric: true }); });
}

/* Bulk column write. The caller already holds the script lock, so this must
   NOT take another one (Apps Script locks are not reentrant). */
function doublerSetProductionStatusesLocked_(statusMap) {
  const layout = ensureUnitColumn_();
  const sheet = layout.sheet;
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return 0;
  const headers = values[0].map(normalizeHeader_);
  const iBox = findHeader_(headers, ['box number', 'box']);
  if (iBox < 0) throw new Error('PRODUCTION DATA needs a BOX NUMBER column.');
  const keys = {};
  Object.keys(statusMap).forEach(function (k) { keys[String(k).trim().toUpperCase()] = statusMap[k]; });
  const column = values.slice(1).map(function (r) { return [r[layout.statusIndex] == null ? '' : r[layout.statusIndex]]; });
  let changed = 0;
  for (let r = 0; r < column.length; r++) {
    const box = cleanBox_(values[r + 1][iBox]).toUpperCase();
    if (box && keys[box] !== undefined) { column[r][0] = keys[box]; changed++; }
  }
  if (changed) sheet.getRange(2, layout.statusIndex + 1, column.length, 1).setValues(column);
  meeraFixInvalidateCache_();
  return changed;
}
function doublerMakeIssueId_() {
  return 'DBL-ISS-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') +
    '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
}
function saveDoublerIssue_(body) {
  const access = requireDoublerMachine_(body.token, body.machine);
  const date = doublerDate_(body.issueDate);
  const shift = String(body.shift || 'DAY').toUpperCase() === 'NIGHT' ? 'NIGHT' : 'DAY';
  const remarks = String(body.remarks || '').trim();
  const records = Array.isArray(body.records) ? body.records : [];
  if (!records.length) throw new Error('Select one or more available boxes.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const available = {};
    doublerAvailableBoxes_().forEach(function (box) { available[cleanBox_(box.box).toLowerCase()] = box; });
    const existing = {};
    getDoublerIssueRows_().forEach(function (row) { existing[row.issueId] = true; });
    const seen = {};
    const now = new Date();
    const rows = [];
    const statusMap = {};
    records.forEach(function (record) {
      const requestedMachine = doublerMachine_(record.doublerMachine || access.machine);
      if (requestedMachine !== access.machine) throw new Error('All issue rows must use Doubler M/C ' + access.machine + '.');
      const key = cleanBox_(record.box).toLowerCase();
      if (!key || seen[key]) throw new Error('Each selected box must be unique.');
      seen[key] = true;
      const source = available[key];
      if (!source) throw new Error('Box ' + String(record.box || '') + ' is no longer available for Doubler issue. Refresh the list and try again.');
      const qty = Number(record.issueQty);
      if (!Number.isFinite(qty) || qty <= 0 || qty > Number(source.availableQty) + 0.01) {
        throw new Error('Issue quantity for box ' + source.box + ' must be above 0 and up to ' + Number(source.availableQty).toFixed(2) + ' kg.');
      }
      const issueId = String(record.issueId || '').trim() || doublerMakeIssueId_();
      if (existing[issueId]) throw new Error('This Doubler issue was already saved. Refresh the screen before retrying.');
      existing[issueId] = true;
      rows.push([issueId, date, shift, access.machine, source.box, source.product, qty, 0, qty,
        'ISSUED', remarks, access.user.name || access.user.username, now, now]);
      statusMap[key] = 'Issue to Doubler';
    });
    const sheet = getDoublerIssueSheet_();
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, DOUBLER_ISSUE_HEADERS_.length).setValues(rows);
    doublerSetProductionStatusesLocked_(statusMap);
    const wanted = {};
    rows.forEach(function (x) { wanted[x[0]] = true; });
    return { ok: true, saved: rows.length, machine: access.machine,
      records: getDoublerIssueRows_().filter(function (row) { return wanted[row.issueId]; }) };
  } finally {
    lock.releaseLock();
  }
}
function getDoublerOpenIssues_(token, machine) {
  const access = requireDoublerMachine_(token, machine);
  return getDoublerIssueRows_().filter(function (row) {
    return Number(row.doublerMachine) === access.machine && Number(row.pendingQty) > 0.01;
  }).sort(function (a, b) { return a.rowNumber - b.rowNumber; });
}
function doublerAppendOutputLocked_(data) {
  const sheet = ensureDoublerOutputHeaders_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = headerMap_(headers);
  const row = new Array(headers.length).fill('');
  function set(names, value) {
    for (let i = 0; i < names.length; i++) {
      const index = map[normalizeHeader_(names[i])];
      if (index !== undefined) { row[index] = value; return; }
    }
  }
  set(['output id'], data.outputId);
  set(['barcode'], data.outputId);
  set(['crate/carate no', 'crate no', 'carate no'], data.crateNo);
  set(['source box'], data.sourceBoxes.join(', '));
  set(['product'], data.product);
  set(['yarn'], data.yarn);
  set(['covering m/c', 'machine'], data.sourceMachines);
  set(['unit'], data.unit);
  set(['output qty (kg)', 'output qty', 'quantity'], data.outputQty);
  set(['no of cones', 'cones', 'cone count'], data.cones);
  set(['conning date'], data.receiveDate);
  set(['shift'], data.shift);
  set(['status'], 'Ready for QC');
  set(['created at'], data.now);
  set(['updated at'], data.now);
  set(['process'], 'DOUBLER');
  set(['doubler m/c', 'doubler machine'], data.doublerMachine);
  set(['source issue ids'], data.sourceIssueIds.join(', '));
  set(['receive date'], data.receiveDate);
  sheet.appendRow(row);
}
function doublerOutputId_(date) {
  return 'DBL-' + String(date || '').replace(/-/g, '') + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
}
function createDoublerOutput_(body) {
  const access = requireDoublerMachine_(body.token, body.doublerMachine || body.machine);
  const crateNo = String(body.crateNo || body.carateNo || '').trim();
  const qty = Number(body.outputQty);
  const cones = Number(body.cones || body.noOfCones || body.coneCount);
  const date = doublerDate_(body.receiveDate || body.date);
  const shift = String(body.shift || 'DAY').toUpperCase() === 'NIGHT' ? 'NIGHT' : 'DAY';
  const issueIds = Array.isArray(body.sourceIssueIds) ? body.sourceIssueIds.map(String) : [];
  if (!crateNo) throw new Error('Scan or enter the output crate number.');
  if (!issueIds.length) throw new Error('Select one or more open Doubler issue boxes.');
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Enter the received output weight.');
  if (!Number.isInteger(cones) || cones <= 0) throw new Error('Enter the number of cones.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const prior = latestConningOutputForCarate_(crateNo);
    if (!carateAvailable_(prior)) throw new Error('Crate ' + crateNo + ' is currently waiting for QC and cannot be reused.');
    const outputId = String(body.outputId || '').trim() || doublerOutputId_(date);
    if (readAllConningOutputs_().some(function (row) { return row.outputId === outputId; })) {
      throw new Error('This Doubler output was already saved. Do not submit it again.');
    }
    const chosen = {};
    issueIds.forEach(function (id) { if (id) chosen[id] = true; });
    const issues = getDoublerIssueRows_().filter(function (row) { return chosen[row.issueId]; });
    if (issues.length !== Object.keys(chosen).length) throw new Error('One or more selected Doubler issue records could not be found. Refresh and try again.');
    issues.forEach(function (row) {
      if (Number(row.doublerMachine) !== access.machine) throw new Error('Box ' + row.box + ' was issued on Doubler M/C ' + row.doublerMachine + '. Receive it only against that same machine.');
      if (Number(row.pendingQty) <= 0.01) throw new Error('Box ' + row.box + ' has no pending Doubler quantity. Refresh and try again.');
    });
    const max = issues.reduce(function (sum, row) { return sum + Number(row.pendingQty); }, 0);
    if (qty > max + 0.01) throw new Error('Received weight ' + qty.toFixed(2) + ' kg is more than selected pending weight ' + max.toFixed(2) + ' kg.');

    const issueSheet = getDoublerIssueSheet_();
    const headerMap = headerMap_(issueSheet.getRange(1, 1, 1, issueSheet.getLastColumn()).getValues()[0]);
    let remaining = qty;
    const statusMap = {};
    const now = new Date();
    issues.forEach(function (row, index) {
      const pending = Number(row.pendingQty) || 0;
      const applied = index === issues.length - 1
        ? Math.min(pending, Math.max(remaining, 0))
        : Math.min(pending, Math.max(remaining, 0));
      const received = Number(row.receivedQty || 0) + applied;
      const after = Math.max((Number(row.issueQty) || 0) - received, 0);
      // A box that received nothing keeps its original ISSUED state instead of
      // being wrongly flipped to IN PROCESS.
      const state = after <= 0.01 ? 'RECEIVED' : (applied > 0 ? 'IN PROCESS' : String(row.status || 'ISSUED'));
      issueSheet.getRange(row.rowNumber, headerMap[normalizeHeader_('received qty kg')] + 1).setValue(received);
      issueSheet.getRange(row.rowNumber, headerMap[normalizeHeader_('pending qty kg')] + 1).setValue(after);
      issueSheet.getRange(row.rowNumber, headerMap[normalizeHeader_('status')] + 1).setValue(state);
      issueSheet.getRange(row.rowNumber, headerMap[normalizeHeader_('updated at')] + 1).setValue(now);
      statusMap[cleanBox_(row.box).toLowerCase()] = after <= 0.01 ? 'Received from Doubler' : 'Issue to Doubler';
      remaining -= applied;
    });
    doublerSetProductionStatusesLocked_(statusMap);

    const source = {};
    doublerProductionBoxes_().forEach(function (box) { source[cleanBox_(box.box).toLowerCase()] = box; });
    const sourceBoxes = issues.map(function (row) { return row.box; });
    const products = uniqueText_(issues.map(function (row) { return row.product; }));
    const machines = uniqueText_(sourceBoxes.map(function (box) {
      const s = source[cleanBox_(box).toLowerCase()];
      return s ? s.sourceMachine : '';
    }));
    const units = uniqueText_(machines.map(function (mc) { return unitForMachine_(mc); }));
    doublerAppendOutputLocked_({
      outputId: outputId, crateNo: crateNo, sourceBoxes: sourceBoxes,
      product: products.join(', '), yarn: '', sourceMachines: machines.join(', '),
      unit: units.join(', '), outputQty: qty, cones: cones, receiveDate: date, shift: shift,
      doublerMachine: access.machine, sourceIssueIds: issues.map(function (row) { return row.issueId; }), now: now
    });
    return { ok: true, outputId: outputId, crateNo: crateNo, process: 'DOUBLER',
      doublerMachine: String(access.machine), status: 'Ready for QC' };
  } finally {
    lock.releaseLock();
  }
}
function setupDoublerProduction() {
  const issueSheet = getDoublerIssueSheet_();
  const outputSheet = ensureDoublerOutputHeaders_();
  return { ok: true, issueSheet: issueSheet.getName(), outputSheet: outputSheet.getName(), machines: '1-16' };
}

/* ==========================================================================
   ONE-TIME SETUP — run this after deploying the new version.
   ========================================================================== */
function meeraSetupAfterDeploy() {
  const health = meeraFixHealth_();
  const trigger = installMeeraReconcileTrigger();
  const reconcile = meeraReconcileAllPending({ maxRows: 100 });
  const out = { ok: true, version: MEERA_FIX_VERSION_, health: health, trigger: trigger, reconcile: reconcile };
  console.log(JSON.stringify(out, null, 2));
  return out;
}

/* V101: Read-only diagnostics. Does not write production entries. */
function meeraV101Diagnostic() {
  var ss=getSpreadsheet_(), p=ss.getSheetByName('PRODUCTION DATA'), b=ss.getSheetByName('PRODUCTION BACKUP');
  var result={version:MEERA_FIX_VERSION_,target:CONFIG.SPREADSHEET_ID,
    productionRows:p?p.getLastRow()-1:null, backupRows:b?b.getLastRow()-1:null,
    fastWindow:MEERA_FAST_TAIL_LIMIT_, mode:'USER_UNIT_RECENT15',
    backupFirst:true, status:'READ_ONLY', note:'No full production scan in interactive save paths; scheduled reconciliation remains separate.'};
  console.log(JSON.stringify(result));
  return result;
}

/**
 * RC5 user dashboard: count today's production rows explicitly flagged DUPLICATE.
 * Read-only, scoped to the authenticated user's own production rows.
 * Separate from browser-local Duplicate audit. Uses the entry DATE in column A.
 */
function meeraRC5MyDuplicateBoxesToday_(user) {
  const sh = getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if (!sh) throw new Error('PRODUCTION DATA missing');
  const username = String(user.username || '').trim().toLowerCase();
  const today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  if (!username) throw new Error('Authenticated username missing');
  const last = sh.getLastRow();
  if (last < 2) return {ok:true, date:today, count:0, boxes:[], complete:true};
  let end = last, scanned = 0, count = 0, boxes = [];
  const maxRows = 5000, batchSize = 250;
  while (end >= 2 && scanned < maxRows) {
    const n = Math.min(batchSize, end - 1, maxRows - scanned);
    const first = end - n + 1;
    // Read only date, box, status and owner. Never scan payload or secret columns.
    const ab = sh.getRange(first, 1, n, 2).getDisplayValues();
    const statuses = sh.getRange(first, 13, n, 1).getDisplayValues();
    const owners = sh.getRange(first, 15, n, 1).getDisplayValues();
    for (let i = 0; i < n; i++) {
      if (meeraV102DateKey_(ab[i][0]) !== today) continue;
      if (String(statuses[i][0] || '').trim().toUpperCase() !== 'DUPLICATE') continue;
      if (String(owners[i][0] || '').trim().toLowerCase() !== username) continue;
      count++;
      if (boxes.length < 30) boxes.push(String(ab[i][1] || ''));
    }
    scanned += n;
    end = first - 1;
  }
  return {ok:true, date:today, count:count, boxes:boxes, complete:end<2};
}
