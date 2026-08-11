const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('acsNative', {
  clearHttpCache: () => ipcRenderer.invoke('acs:clear-http-cache'),
  clearStorageData: (options) => ipcRenderer.invoke('acs:clear-storage-data', options || {}),
  getFlowtestUrl: () => ipcRenderer.invoke('acs:get-flowtest-url')
});
