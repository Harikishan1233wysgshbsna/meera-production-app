/**
 * Original LIVE DashboardFix.gs copied from user, 2026-11-13.
 * ARCHIVE / REFERENCE ONLY: do not add alongside the RC5 Production Data Sync.gs
 * without first removing the duplicate meeraV102UnitTodayEntries_ definition.
 */
function meeraV102UnitTodayEntries_(user) {
  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName('PRODUCTION DATA');

  if (!sheet) throw new Error('PRODUCTION DATA missing');

  const today = Utilities.formatDate(
    new Date(), 'Asia/Kolkata', 'yyyy-MM-dd'
  );

  const last = sheet.getLastRow();
  if (last < 2) return [];

  const start = Math.max(2, last - 499);
  const data = sheet.getRange(
    start, 1, last - start + 1, 15
  ).getDisplayValues();

  const admin = String(user.role || '').toLowerCase() === 'admin';
  const machines = (user.machines || []).map(Number);

  const rows = [];

  data.forEach(function(r) {
    let date = String(r[0] || '').trim();

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const p = date.split('/');
      date = p[2] + '-' + p[1] + '-' + p[0];
    }

    const machine = Number(r[2]);
    const unit = machine <= 74 ? 1 : 2;

    if (date !== today || !Number.isInteger(machine) ||
        machine < 1 || machine > 111) return;

    const canSeeUnit = admin || machines.some(function(m) {
      return (m <= 74 ? 1 : 2) === unit;
    });

    if (!canSeeUnit) return;

    rows.push({
      date: date,
      box: String(r[1] || ''),
      machine: String(machine),
      shift: String(r[3] || ''),
      product: String(r[4] || ''),
      rolls: Number(r[7]) || 0,
      gross: Number(r[8]) || 0,
      tare: Number(r[9]) || 0,
      net: Number(r[10]) || 0,
      unit: String(unit),
      user: String(r[14] || '').trim(),
      status: String(r[12] || '')
    });
  });

  return rows;
}
function testDashboardFix() {
  Logger.log("Dashboard function is working");
}
