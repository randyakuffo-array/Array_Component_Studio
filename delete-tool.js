const { dialog, net } = require('electron');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const REQUEST_TIMEOUT_MS = 15_000;

function envBaseUrl(environment) {
  return environment === 'production' ? 'https://array.io' : 'https://sandbox.array.io';
}

function resultsSuffix(environment) {
  return environment === 'production' ? 'prod' : 'sandbox';
}

function resultsPathFor(csvPath, outputDir, environment) {
  const stem = path.basename(csvPath, path.extname(csvPath));
  return path.join(outputDir, `${stem}_delete_results_${resultsSuffix(environment)}.csv`);
}

async function pickCsvFile(browserWindow) {
  const result = await dialog.showOpenDialog(browserWindow, {
    title: 'Select userId CSV',
    properties: ['openFile'],
    filters: [
      { name: 'CSV', extensions: ['csv', 'txt'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
}

async function pickOutputDir(browserWindow, defaultPath) {
  const result = await dialog.showOpenDialog(browserWindow, {
    title: 'Select output folder',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: defaultPath || undefined
  });
  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureResultsHeader(filePath) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) return;
  fs.writeFileSync(
    filePath,
    'userId,outcome,httpStatus,effectiveDate,detail,timestamp\n',
    'utf8'
  );
}

function appendResultRow(filePath, row) {
  ensureResultsHeader(filePath);
  const line = [
    csvEscape(row.userId),
    csvEscape(row.outcome),
    csvEscape(row.httpStatus ?? ''),
    csvEscape(row.effectiveDate ?? ''),
    csvEscape(row.detail ?? ''),
    csvEscape(row.timestamp || new Date().toISOString())
  ].join(',') + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n') {
      row.push(cell);
      if (!(row.length === 1 && row[0] === '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    if (ch === '\r') continue;
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
  }
  return rows;
}

function readResultsOutcomes(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const rows = parseCsv(readTextFile(filePath));
  if (!rows.length) return {};
  const header = rows[0].map(h => h.trim().toLowerCase());
  const userIdx = header.indexOf('userid');
  const outcomeIdx = header.indexOf('outcome');
  if (userIdx < 0 || outcomeIdx < 0) return {};
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    const userId = (rows[i][userIdx] || '').trim();
    const outcome = (rows[i][outcomeIdx] || '').trim().toUpperCase();
    if (!userId || !outcome) continue;
    map[userId] = outcome;
  }
  return map;
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), ms);
    })
  ]);
}

async function deleteUserOnce({ baseUrl, token, userId }) {
  const url = new URL(`/api/user/v4/${encodeURIComponent(userId)}`, baseUrl);
  url.searchParams.set('permanent', 'true');

  const response = await withTimeout(
    net.fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'x-credmo-client-token': token
      }
    }),
    REQUEST_TIMEOUT_MS
  );

  const status = response.status;
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch (_) {}

  let json = null;
  try {
    json = bodyText ? JSON.parse(bodyText) : null;
  } catch (_) {}

  return { status, bodyText, json };
}

function classifyDeleteResponse({ status, json, bodyText }) {
  if (status === 200) {
    return { outcome: 'DELETED', httpStatus: status, effectiveDate: '', detail: '' };
  }
  if (status === 409) {
    const effectiveDate =
      json?.effectiveDate ||
      json?.effective_date ||
      json?.data?.effectiveDate ||
      '';
    return {
      outcome: 'PENDING',
      httpStatus: status,
      effectiveDate: String(effectiveDate || ''),
      detail: typeof json?.message === 'string' ? json.message : 'Enrollments still active'
    };
  }
  if (status === 404) {
    return { outcome: 'NOT_FOUND', httpStatus: status, effectiveDate: '', detail: '' };
  }
  if (status === 403) {
    return {
      outcome: 'AUTH_FAIL',
      httpStatus: status,
      effectiveDate: '',
      detail: 'Wrong token or IP not whitelisted'
    };
  }
  if (status === 400) {
    return {
      outcome: 'BAD_REQUEST',
      httpStatus: status,
      effectiveDate: '',
      detail: typeof json?.message === 'string' ? json.message : (bodyText || '').slice(0, 200)
    };
  }
  return {
    outcome: 'NETWORK_ERROR',
    httpStatus: status || '',
    effectiveDate: '',
    detail: (bodyText || `HTTP ${status}`).slice(0, 200)
  };
}

async function deleteUserWithRetries({ baseUrl, token, userId }) {
  let lastTimeout = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = await deleteUserOnce({ baseUrl, token, userId });
      if (raw.status === 429) {
        if (attempt >= 2) {
          return {
            outcome: 'NETWORK_ERROR',
            httpStatus: 429,
            effectiveDate: '',
            detail: 'Rate limited after retries',
            timedOut: false
          };
        }
        await sleep([2000, 4000, 8000][attempt]);
        continue;
      }
      return { ...classifyDeleteResponse(raw), timedOut: false };
    } catch (err) {
      const timedOut = err?.code === 'TIMEOUT' || /timeout/i.test(err?.message || '');
      lastTimeout = err;
      if (timedOut && attempt < 2) continue;
      return {
        outcome: 'NETWORK_ERROR',
        httpStatus: '',
        effectiveDate: '',
        detail: timedOut ? 'Request timed out' : (err.message || String(err)),
        timedOut
      };
    }
  }
  return {
    outcome: 'NETWORK_ERROR',
    httpStatus: '',
    effectiveDate: '',
    detail: lastTimeout?.message || 'Request failed',
    timedOut: true
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerDeleteToolIpc(ipcMain, getWindow) {
  ipcMain.handle('acs:delete-pick-csv', async () => pickCsvFile(getWindow()));
  ipcMain.handle('acs:delete-pick-output-dir', async (_e, defaultPath) => pickOutputDir(getWindow(), defaultPath));
  ipcMain.handle('acs:delete-read-text', async (_e, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) throw new Error('File not found');
    return readTextFile(filePath);
  });
  ipcMain.handle('acs:delete-results-path', async (_e, { csvPath, outputDir, environment }) =>
    resultsPathFor(csvPath, outputDir, environment)
  );
  ipcMain.handle('acs:delete-read-results', async (_e, filePath) => readResultsOutcomes(filePath));
  ipcMain.handle('acs:delete-append-result', async (_e, { filePath, row }) => {
    appendResultRow(filePath, row);
    return { ok: true };
  });
  ipcMain.handle('acs:delete-user', async (_e, payload) => deleteUserWithRetries(payload));
  ipcMain.handle('acs:delete-env-token', async () => process.env.ARRAY_CLIENT_TOKEN || '');
  ipcMain.handle('acs:delete-show-item', async (_e, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      const { shell } = require('electron');
      shell.showItemInFolder(filePath);
    }
    return { ok: true };
  });
  ipcMain.handle('acs:delete-base-url', async (_e, environment) => envBaseUrl(environment));
}

module.exports = {
  registerDeleteToolIpc,
  envBaseUrl,
  resultsPathFor,
  parseCsv
};
