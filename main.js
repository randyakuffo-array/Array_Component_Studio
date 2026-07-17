const { app, BrowserWindow, shell, ipcMain, session } = require('electron');
const path = require('path');

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    title: 'Array Component Studio',
    backgroundColor: '#05070b',
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
