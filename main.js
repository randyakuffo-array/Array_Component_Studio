const { app, BrowserWindow, shell, ipcMain, session, net } = require('electron');
const path = require('path');
const fs = require('fs');

ipcMain.handle('acs:clear-http-cache', async () => {
  await session.defaultSession.clearCache();
  return { ok: true };
});

ipcMain.handle('acs:clear-storage-data', async (_event, options = {}) => {
  await session.defaultSession.clearStorageData({
    storages: options.storages || [
      'appcache',
      'cookies',
      'filesystem',
      'indexdb',
      'localstorage',
      'shadercache',
      'websql',
      'serviceworkers',
      'cachestorage'
    ]
  });
  return { ok: true };
});

function bundledFlowtestPath() {
  return path.join(__dirname, 'flowtest', 'index.html');
}

function probeDevFlowtest(timeoutMs = 400) {
  return new Promise(resolve => {
    try {
      const req = net.request({ method: 'GET', url: 'http://localhost:8443/' });
      const timer = setTimeout(() => {
        try { req.abort(); } catch (_) {}
        resolve(false);
      }, timeoutMs);
      req.on('response', () => {
        clearTimeout(timer);
        resolve(true);
      });
      req.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
      req.end();
    } catch (_) {
      resolve(false);
    }
  });
}

ipcMain.handle('acs:get-flowtest-url', async () => {
  const forceDev = process.env.ACS_FLOWTEST_DEV === '1';
  const hasBundled = fs.existsSync(bundledFlowtestPath());

  if (forceDev || await probeDevFlowtest()) {
    return { url: 'http://localhost:8443/', source: 'dev' };
  }
  if (hasBundled) {
    return { url: './flowtest/index.html', source: 'bundled' };
  }
  return { url: 'http://localhost:8443/', source: 'dev-fallback' };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    title: 'Array Component Studio',
    backgroundColor: '#1A1A1F',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
