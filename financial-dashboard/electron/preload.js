/**
 * ELECTRON PRELOAD SCRIPT
 * Bridge sicuro tra renderer process e main process
 * Espone API limitate al frontend per sicurezza
 */

const { contextBridge, ipcRenderer } = require('electron');

// Esponi API sicure al renderer process
contextBridge.exposeInMainWorld('electron', {
  // Informazioni sull'app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Flag per sapere se siamo in Electron
  isElectron: true,
  
  // Platform info
  platform: process.platform,
});

console.log('🔒 Electron Preload Script caricato');
