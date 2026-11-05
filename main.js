const { app, BrowserWindow, shell, ipcMain, session } = require('electron');
const path = require('path');
const { registerDeleteToolIpc } = require('./delete-tool');

let mainWindow = null;

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

registerDeleteToolIpc(ipcMain, () => mainWindow);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1100,
    minHeight: 760,
    title: 'Array Studio',
    backgroundColor: '#F4F2EE',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
