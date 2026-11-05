const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('acsNative', {
  clearHttpCache: () => ipcRenderer.invoke('acs:clear-http-cache'),
  clearStorageData: (options) => ipcRenderer.invoke('acs:clear-storage-data', options || {}),
  deleteTool: {
    pickCsv: () => ipcRenderer.invoke('acs:delete-pick-csv'),
    pickOutputDir: (defaultPath) => ipcRenderer.invoke('acs:delete-pick-output-dir', defaultPath || null),
    readText: (filePath) => ipcRenderer.invoke('acs:delete-read-text', filePath),
    resultsPath: (payload) => ipcRenderer.invoke('acs:delete-results-path', payload),
    readResults: (filePath) => ipcRenderer.invoke('acs:delete-read-results', filePath),
    appendResult: (payload) => ipcRenderer.invoke('acs:delete-append-result', payload),
    deleteUser: (payload) => ipcRenderer.invoke('acs:delete-user', payload),
    envToken: () => ipcRenderer.invoke('acs:delete-env-token'),
    showItem: (filePath) => ipcRenderer.invoke('acs:delete-show-item', filePath),
    baseUrl: (environment) => ipcRenderer.invoke('acs:delete-base-url', environment)
  }
});
