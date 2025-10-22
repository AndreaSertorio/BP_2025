/**
 * ELECTRON MAIN PROCESS
 * Gestisce la finestra principale e i server backend
 * NON modifica il funzionamento esistente dell'app
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Variabili globali
let mainWindow;
let serverProcess;
let nextProcess;

// Porte per i server (stesse dell'applicazione normale)
const API_PORT = 3001;
const NEXT_PORT = 3000;

/**
 * Avvia il server Express API
 */
function startAPIServer() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Avvio Server API Express...');
    
    const serverPath = path.join(__dirname, '..', 'server.js');
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: API_PORT.toString() }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server API] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server API Error] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Errore avvio Server API:', error);
      reject(error);
    });

    // Attendi 2 secondi per l'avvio
    setTimeout(() => {
      console.log('✅ Server API avviato');
      resolve();
    }, 2000);
  });
}

/**
 * Avvia Next.js in modalità production
 */
function startNextServer() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Avvio Next.js Server...');
    
    const nextPath = path.join(__dirname, '..');
    
    // In produzione usa "next start", in dev usa "next dev"
    const command = app.isPackaged ? 'start' : 'dev';
    
    nextProcess = spawn('npm', ['run', command], {
      cwd: nextPath,
      env: { ...process.env, PORT: NEXT_PORT.toString() },
      shell: true
    });

    nextProcess.stdout.on('data', (data) => {
      console.log(`[Next.js] ${data.toString().trim()}`);
    });

    nextProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      // Next.js manda info su stderr, non è sempre un errore
      if (!msg.includes('Attention') && !msg.includes('npm WARN')) {
        console.log(`[Next.js] ${msg}`);
      }
    });

    nextProcess.on('error', (error) => {
      console.error('❌ Errore avvio Next.js:', error);
      reject(error);
    });

    // Attendi 4 secondi per l'avvio
    setTimeout(() => {
      console.log('✅ Next.js avviato');
      resolve();
    }, 4000);
  });
}

/**
 * Crea la finestra principale Electron
 */
async function createWindow() {
  // Avvia i server prima di creare la finestra
  try {
    await startAPIServer();
    await startNextServer();
  } catch (error) {
    console.error('❌ Errore avvio server:', error);
    app.quit();
    return;
  }

  // Crea la finestra del browser
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Eco 3D - Financial Dashboard',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !app.isPackaged // DevTools solo in dev
    }
  });

  // Carica l'applicazione Next.js
  const appURL = `http://localhost:${NEXT_PORT}`;
  
  console.log(`📱 Caricamento applicazione da ${appURL}...`);
  
  // Attendi che Next.js sia pronto prima di caricare
  setTimeout(() => {
    mainWindow.loadURL(appURL);
  }, 2000);

  // Apri DevTools in modalità sviluppo
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Gestisci chiusura finestra
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log quando l'app è pronta
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Applicazione caricata con successo');
  });

  // Gestisci errori di caricamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`❌ Errore caricamento: ${errorCode} - ${errorDescription}`);
  });
}

/**
 * Chiudi tutti i processi server quando si chiude l'app
 */
function cleanup() {
  console.log('🧹 Chiusura server...');
  
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    console.log('✅ Server API chiuso');
  }
  
  if (nextProcess) {
    nextProcess.kill('SIGTERM');
    console.log('✅ Next.js chiuso');
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

// Quando Electron è pronto
app.whenReady().then(() => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          🚀 ECO 3D - ELECTRON MODE                    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  createWindow();

  // Su macOS ricrea la finestra quando si clicca sull'icona nel dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Esci quando tutte le finestre sono chiuse (eccetto su macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanup();
    app.quit();
  }
});

// Cleanup prima di uscire
app.on('before-quit', () => {
  cleanup();
});

// Gestisci crash
app.on('render-process-gone', (event, webContents, details) => {
  console.error('❌ Processo renderer crashato:', details);
});

// ============================================================================
// IPC HANDLERS (comunicazione tra renderer e main process)
// ============================================================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

console.log('📦 Electron Main Process caricato');
