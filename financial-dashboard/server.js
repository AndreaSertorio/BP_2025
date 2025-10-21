/**
 * SERVER BACKEND PER DATABASE.JSON
 * Espone API REST per leggere e scrivere il file database.json
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Import routes
const valuePropositionRoutes = require('./server-routes/valueProposition');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'src', 'data', 'database.json');
const DB_BACKUP_DIR = path.join(__dirname, 'src', 'data', 'backups');

// ============================================================================
// WRITE QUEUE - Previene race conditions e corruption del database
// ============================================================================
let writeQueue = Promise.resolve();
let isWriting = false;
const MIN_DB_SIZE = 100000; // 100KB - database valido deve essere almeno questo

/**
 * Serializza tutte le scritture attraverso una queue
 * Previene race conditions quando arrivano multiple PATCH simultanee
 */
function queueWrite(writeFunction) {
  writeQueue = writeQueue.then(writeFunction).catch(err => {
    console.error('❌ Errore nella write queue:', err);
    throw err;
  });
  return writeQueue;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentato limit per database grande

// Logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

/**
 * Sanitizza JSON rimuovendo SOLO parentesi graffe DUPLICATE alla fine
 * IMPORTANTE: Fix per bug ricorrente che aggiunge }   }  } DUPLICATE
 * NON rimuove parentesi valide necessarie per strutture nested
 */
function sanitizeJSON(jsonString) {
  // Rimuovi spazi/tab alla fine
  let cleaned = jsonString.trimEnd();
  
  // Pattern per trovare sequenze di } ripetute con spazi/newline tra loro
  // Esempio: }\n  }\n} o }  }  } o }\n}\n}
  // Cerca almeno 2 } consecutive (duplicate) separate da whitespace
  const duplicatePattern = /(\}\s*){2,}$/;
  
  // Se trova duplicate, rimuovile e lascia solo UNA }
  if (duplicatePattern.test(cleaned)) {
    // Rimuovi tutte le } finali duplicate
    cleaned = cleaned.replace(/(\}\s*)+$/, '');
    // Aggiungi UNA SOLA } finale
    cleaned = cleaned + '\n}';
  }
  
  return cleaned;
}

/**
 * Crea backup automatico del database prima di salvare
 */
async function createBackup() {
  try {
    // Crea directory backups se non esiste
    await fs.mkdir(DB_BACKUP_DIR, { recursive: true });
    
    // Leggi database corrente
    const currentDB = await fs.readFile(DB_PATH, 'utf-8');
    
    // Verifica dimensione minima (protezione contro file corrotti)
    if (currentDB.length < MIN_DB_SIZE) {
      console.warn(`⚠️ Database corrente troppo piccolo (${currentDB.length} bytes), skip backup`);
      return null;
    }
    
    // Nome backup con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(DB_BACKUP_DIR, `database_${timestamp}.json`);
    
    // Salva backup
    await fs.writeFile(backupPath, currentDB, 'utf-8');
    console.log(`💾 Backup creato: ${path.basename(backupPath)}`);
    
    return backupPath;
  } catch (error) {
    console.error('⚠️ Errore creazione backup (continuo comunque):', error.message);
    return null;
  }
}

/**
 * Salva database in modo sicuro con queue, validazione e backup
 * QUESTA È LA FUNZIONE CRITICA CHE PREVIENE LA CORRUPTION
 */
async function saveDatabaseSafe(database) {
  // Serializza TUTTE le scritture attraverso la queue
  return queueWrite(async () => {
    if (isWriting) {
      console.warn('⚠️ Scrittura già in corso, attendo...');
    }
    
    isWriting = true;
    
    try {
      // 1. VALIDAZIONE PRE-SCRITTURA
      if (!database || typeof database !== 'object') {
        throw new Error('Database invalido: deve essere un oggetto');
      }
      
      // Converti in JSON
      const jsonString = JSON.stringify(database, null, 2);
      
      // 2. VALIDAZIONE DIMENSIONE
      if (jsonString.length < MIN_DB_SIZE) {
        throw new Error(`Database troppo piccolo (${jsonString.length} bytes < ${MIN_DB_SIZE} bytes). Possibile corruption!`);
      }
      
      // 3. VALIDAZIONE JSON
      JSON.parse(jsonString); // Throw se JSON invalido
      
      // 4. BACKUP AUTOMATICO (solo se database corrente è valido)
      await createBackup();
      
      // 5. SCRITTURA ATOMICA
      // Scrivi prima in file temporaneo poi rinomina (atomic operation)
      const tempPath = DB_PATH + '.tmp';
      await fs.writeFile(tempPath, jsonString, 'utf-8');
      
      // Verifica che il file temporaneo sia stato scritto correttamente
      const writtenContent = await fs.readFile(tempPath, 'utf-8');
      if (writtenContent.length !== jsonString.length) {
        throw new Error('Scrittura file incompleta!');
      }
      
      // Rename atomico (questo è atomic su POSIX)
      await fs.rename(tempPath, DB_PATH);
      
      console.log(`✅ Database salvato: ${(jsonString.length / 1024).toFixed(1)} KB`);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ ERRORE CRITICO salvataggio database:', error.message);
      throw error;
    } finally {
      isWriting = false;
    }
  });
}

/**
 * GET /api/database
 * Legge l'intero database.json
 */
app.get('/api/database', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    res.json(database);
  } catch (error) {
    console.error('❌ Errore lettura database:', error);
    res.status(500).json({ error: 'Errore lettura database' });
  }
});

/**
 * PUT /api/database
 * Sovrascrive l'intero database.json
 */
app.put('/api/database', async (req, res) => {
  try {
    const newData = req.body;
    
    // Aggiorna lastUpdate
    newData.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Scrivi il file con formattazione (sanitizzato)
    await saveDatabaseSafe(newData);
    
    console.log('✅ Database salvato con successo');
    res.json({ success: true, message: 'Database aggiornato' });
  } catch (error) {
    console.error('❌ Errore scrittura database:', error);
    res.status(500).json({ error: 'Errore scrittura database' });
  }
});

/**
 * PATCH /api/database/prestazione/:codice
 * Aggiorna una singola prestazione
 */
app.patch('/api/database/prestazione/:codice', async (req, res) => {
  try {
    const { codice } = req.params;
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Trova prestazione
    const prestazioneIndex = database.mercatoEcografie.italia.prestazioni.findIndex(
      p => p.codice === codice
    );
    
    if (prestazioneIndex === -1) {
      return res.status(404).json({ error: `Prestazione ${codice} non trovata` });
    }
    
    // Aggiorna prestazione
    database.mercatoEcografie.italia.prestazioni[prestazioneIndex] = {
      ...database.mercatoEcografie.italia.prestazioni[prestazioneIndex],
      ...updates
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Prestazione ${codice} aggiornata:`, updates);
    res.json({ 
      success: true, 
      prestazione: database.mercatoEcografie.italia.prestazioni[prestazioneIndex] 
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento prestazione:', error);
    res.status(500).json({ error: 'Errore aggiornamento prestazione' });
  }
});

/**
 * POST /api/database/toggle-aggredibile/:codice
 * Toggle aggredibile per una prestazione
 */
app.post('/api/database/toggle-aggredibile/:codice', async (req, res) => {
  try {
    const { codice } = req.params;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Trova prestazione
    const prestazioneIndex = database.mercatoEcografie.italia.prestazioni.findIndex(
      p => p.codice === codice
    );
    
    if (prestazioneIndex === -1) {
      return res.status(404).json({ error: `Prestazione ${codice} non trovata` });
    }
    
    // Toggle
    database.mercatoEcografie.italia.prestazioni[prestazioneIndex].aggredibile = 
      !database.mercatoEcografie.italia.prestazioni[prestazioneIndex].aggredibile;
    
    const newValue = database.mercatoEcografie.italia.prestazioni[prestazioneIndex].aggredibile;
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Toggle aggredibile ${codice}: ${newValue}`);
    res.json({ 
      success: true, 
      aggredibile: newValue,
      prestazione: database.mercatoEcografie.italia.prestazioni[prestazioneIndex]
    });
  } catch (error) {
    console.error('❌ Errore toggle aggredibile:', error);
    res.status(500).json({ error: 'Errore toggle aggredibile' });
  }
});

/**
 * PATCH /api/database/percentuale/:codice
 * Aggiorna percentuale Extra-SSN
 */
app.patch('/api/database/percentuale/:codice', async (req, res) => {
  try {
    const { codice } = req.params;
    const { percentuale } = req.body;
    
    if (percentuale < 0 || percentuale > 100) {
      return res.status(400).json({ error: 'Percentuale deve essere 0-100' });
    }
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Trova prestazione
    const prestazioneIndex = database.mercatoEcografie.italia.prestazioni.findIndex(
      p => p.codice === codice
    );
    
    if (prestazioneIndex === -1) {
      return res.status(404).json({ error: `Prestazione ${codice} non trovata` });
    }
    
    // Aggiorna percentuale
    database.mercatoEcografie.italia.prestazioni[prestazioneIndex].percentualeExtraSSN = percentuale;
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Percentuale ${codice} aggiornata: ${percentuale}%`);
    res.json({ 
      success: true, 
      percentuale,
      prestazione: database.mercatoEcografie.italia.prestazioni[prestazioneIndex]
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento percentuale:', error);
    res.status(500).json({ error: 'Errore aggiornamento percentuale' });
  }
});

/**
 * GET /api/regioni
 * Leggi tutte le regioni mondiali
 */
app.get('/api/regioni', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    res.json(database.regioniMondiali || {});
  } catch (error) {
    console.error('❌ Errore lettura regioni:', error);
    res.status(500).json({ error: 'Errore lettura regioni' });
  }
});

/**
 * PATCH /api/regioni/:regioneId/moltiplicatore
 * Aggiorna moltiplicatore regionale
 */
app.patch('/api/regioni/:regioneId/moltiplicatore', async (req, res) => {
  try {
    const { regioneId } = req.params;
    const { moltiplicatoreVolume, moltiplicatoreValore } = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Verifica che la regione esista
    if (!database.regioniMondiali || !database.regioniMondiali[regioneId]) {
      return res.status(404).json({ error: `Regione ${regioneId} non trovata` });
    }
    
    // Aggiorna moltiplicatori
    if (moltiplicatoreVolume !== undefined) {
      database.regioniMondiali[regioneId].moltiplicatoreVolume = moltiplicatoreVolume;
    }
    if (moltiplicatoreValore !== undefined) {
      database.regioniMondiali[regioneId].moltiplicatoreValore = moltiplicatoreValore;
    }
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Moltiplicatori ${regioneId} aggiornati:`, {
      volume: moltiplicatoreVolume,
      valore: moltiplicatoreValore
    });
    
    res.json({ 
      success: true, 
      regione: database.regioniMondiali[regioneId]
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento moltiplicatori:', error);
    res.status(500).json({ error: 'Errore aggiornamento moltiplicatori' });
  }
});

/**
 * ============================================================================
 * MERCATO ECOGRAFI - ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/ecografi
 * Leggi dati mercato ecografi
 */
app.get('/api/ecografi', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    res.json(database.mercatoEcografi || {});
  } catch (error) {
    console.error('❌ Errore lettura mercato ecografi:', error);
    res.status(500).json({ error: 'Errore lettura mercato ecografi' });
  }
});

/**
 * PATCH /api/ecografi/configurazione
 * Aggiorna configurazione mercato ecografi
 */
app.patch('/api/ecografi/configurazione', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.mercatoEcografi) {
      return res.status(404).json({ error: 'Sezione mercatoEcografi non trovata' });
    }
    
    // Aggiorna configurazione
    database.mercatoEcografi.configurazione = {
      ...database.mercatoEcografi.configurazione,
      ...updates
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log('✅ Configurazione ecografi aggiornata:', updates);
    res.json({ 
      success: true, 
      configurazione: database.mercatoEcografi.configurazione
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento configurazione ecografi:', error);
    res.status(500).json({ error: 'Errore aggiornamento configurazione ecografi' });
  }
});

/**
 * POST /api/ecografi/toggle-tipologia/:id/:campo
 * Toggle visible o target per una tipologia
 * campo: 'visible' o 'target'
 */
app.post('/api/ecografi/toggle-tipologia/:id/:campo', async (req, res) => {
  try {
    const { id, campo } = req.params;
    
    if (!['visible', 'target'].includes(campo)) {
      return res.status(400).json({ error: 'Campo deve essere "visible" o "target"' });
    }
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Trova tipologia
    const tipologiaIndex = database.mercatoEcografi.tipologie.findIndex(
      t => t.id === id
    );
    
    if (tipologiaIndex === -1) {
      return res.status(404).json({ error: `Tipologia ${id} non trovata` });
    }
    
    // Toggle
    database.mercatoEcografi.tipologie[tipologiaIndex][campo] = 
      !database.mercatoEcografi.tipologie[tipologiaIndex][campo];
    
    const newValue = database.mercatoEcografi.tipologie[tipologiaIndex][campo];
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Toggle ${campo} tipologia ${id}: ${newValue}`);
    res.json({ 
      success: true, 
      [campo]: newValue,
      tipologia: database.mercatoEcografi.tipologie[tipologiaIndex]
    });
  } catch (error) {
    console.error('❌ Errore toggle tipologia:', error);
    res.status(500).json({ error: 'Errore toggle tipologia' });
  }
});

/**
 * PATCH /api/ecografi/tipologia/:id
 * Aggiorna una tipologia ecografo
 */
app.patch('/api/ecografi/tipologia/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Trova tipologia
    const tipologiaIndex = database.mercatoEcografi.tipologie.findIndex(
      t => t.id === id
    );
    
    if (tipologiaIndex === -1) {
      return res.status(404).json({ error: `Tipologia ${id} non trovata` });
    }
    
    // Aggiorna tipologia
    database.mercatoEcografi.tipologie[tipologiaIndex] = {
      ...database.mercatoEcografi.tipologie[tipologiaIndex],
      ...updates
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Tipologia ${id} aggiornata:`, updates);
    res.json({ 
      success: true, 
      tipologia: database.mercatoEcografi.tipologie[tipologiaIndex]
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento tipologia:', error);
    res.status(500).json({ error: 'Errore aggiornamento tipologia' });
  }
});

/**
 * PATCH /api/database/tam-sam-som/ecografie
 * Aggiorna configurazione TAM/SAM/SOM Ecografie
 */
app.patch('/api/database/tam-sam-som/ecografie', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza se non esiste
    if (!database.configurazioneTamSamSom) {
      database.configurazioneTamSamSom = {
        ecografie: {},
        ecografi: {}
      };
    }
    
    // Aggiorna configurazione ecografie
    database.configurazioneTamSamSom.ecografie = {
      ...database.configurazioneTamSamSom.ecografie,
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log('✅ Configurazione TAM/SAM/SOM Ecografie aggiornata');
    res.json({
      success: true,
      configurazione: database.configurazioneTamSamSom.ecografie
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografie:', error);
    res.status(500).json({ error: 'Errore aggiornamento configurazione' });
  }
});

/**
 * PATCH /api/database/tam-sam-som/ecografi
 * Aggiorna configurazione TAM/SAM/SOM Ecografi
 */
app.patch('/api/database/tam-sam-som/ecografi', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza se non esiste
    if (!database.configurazioneTamSamSom) {
      database.configurazioneTamSamSom = {
        ecografie: {},
        ecografi: {}
      };
    }
    
    // Aggiorna configurazione ecografi
    database.configurazioneTamSamSom.ecografi = {
      ...database.configurazioneTamSamSom.ecografi,
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log('✅ Configurazione TAM/SAM/SOM Ecografi aggiornata');
    res.json({
      success: true,
      configurazione: database.configurazioneTamSamSom.ecografi
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografi:', error);
    res.status(500).json({ error: 'Errore aggiornamento configurazione' });
  }
});

/**
 * PATCH /api/database/business-plan/progress
 * Aggiorna percentuale completamento sezione Business Plan
 */
app.patch('/api/database/business-plan/progress', async (req, res) => {
  try {
    const { sectionId, progress } = req.body;
    
    // Validazione
    if (!sectionId || typeof progress !== 'number') {
      return res.status(400).json({ error: 'sectionId e progress sono richiesti' });
    }
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'progress deve essere tra 0 e 100' });
    }
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.configurazioneTamSamSom) {
      database.configurazioneTamSamSom = {};
    }
    if (!database.configurazioneTamSamSom.businessPlan) {
      database.configurazioneTamSamSom.businessPlan = {
        sectionProgress: {},
        lastUpdate: new Date().toISOString()
      };
    }
    
    // Aggiorna progress
    database.configurazioneTamSamSom.businessPlan.sectionProgress[sectionId] = progress;
    database.configurazioneTamSamSom.businessPlan.lastUpdate = new Date().toISOString();
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    res.json({
      success: true,
      message: `Progress ${sectionId} aggiornato a ${progress}%`,
      data: database.configurazioneTamSamSom.businessPlan
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento progress Business Plan:', error);
    res.status(500).json({ error: 'Errore aggiornamento progress' });
  }
});

/**
 * PATCH /api/database/prezzi-regionalizzati/:regione/:codice
 * Aggiorna prezzo ecografia regionalizzato
 */
app.patch('/api/database/prezzi-regionalizzati/:regione/:codice', async (req, res) => {
  try {
    const { regione, codice } = req.params;
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Verifica che esista la regione
    if (!database.prezziEcografieRegionalizzati || !database.prezziEcografieRegionalizzati[regione]) {
      return res.status(404).json({ error: `Regione ${regione} non trovata` });
    }
    
    // Trova prezzo
    const prezzoIndex = database.prezziEcografieRegionalizzati[regione].findIndex(
      p => p.codice === codice
    );
    
    if (prezzoIndex === -1) {
      return res.status(404).json({ error: `Prezzo ${codice} non trovato nella regione ${regione}` });
    }
    
    // Aggiorna prezzo
    database.prezziEcografieRegionalizzati[regione][prezzoIndex] = {
      ...database.prezziEcografieRegionalizzati[regione][prezzoIndex],
      ...updates
    };
    
    // Aggiorna lastUpdate
    database.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salva (sanitizzato)
    await saveDatabaseSafe(database);
    
    console.log(`✅ Prezzo ${codice} (${regione}) aggiornato`);
    res.json({
      success: true,
      prezzo: database.prezziEcografieRegionalizzati[regione][prezzoIndex]
    });
  } catch (error) {
    console.error(`❌ Errore aggiornamento prezzo:`, error);
    res.status(500).json({ error: 'Errore aggiornamento prezzo' });
  }
});

/**
 * PATCH /api/database/revenue-model
 * Aggiorna Revenue Model completo
 */
app.patch('/api/database/revenue-model', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza revenueModel se non esiste
    if (!database.revenueModel) {
      database.revenueModel = {};
    }
    
    // Applica aggiornamenti
    database.revenueModel = {
      ...database.revenueModel,
      ...updates,
      metadata: {
        ...database.revenueModel.metadata,
        lastUpdate: new Date().toISOString()
      }
    };
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Revenue Model aggiornato');
    res.json({ success: true, revenueModel: database.revenueModel });
  } catch (error) {
    console.error('❌ Errore aggiornamento Revenue Model:', error);
    res.status(500).json({ error: 'Errore aggiornamento Revenue Model' });
  }
});

/**
 * PATCH /api/database/revenue-model/hardware
 * Aggiorna solo Hardware Revenue Model
 */
app.patch('/api/database/revenue-model/hardware', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.revenueModel) {
      database.revenueModel = {};
    }
    if (!database.revenueModel.hardware) {
      database.revenueModel.hardware = {};
    }
    
    // Applica aggiornamenti
    database.revenueModel.hardware = {
      ...database.revenueModel.hardware,
      ...updates
    };
    
    // Aggiorna metadata
    if (!database.revenueModel.metadata) {
      database.revenueModel.metadata = {};
    }
    database.revenueModel.metadata.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Hardware Revenue Model aggiornato');
    res.json({ success: true, hardware: database.revenueModel.hardware });
  } catch (error) {
    console.error('❌ Errore aggiornamento Hardware Revenue Model:', error);
    res.status(500).json({ error: 'Errore aggiornamento Hardware Revenue Model' });
  }
});

/**
 * PATCH /api/database/revenue-model/saas
 * Aggiorna solo SaaS Revenue Model
 */
app.patch('/api/database/revenue-model/saas', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('📥 Ricevuto update SaaS:', JSON.stringify(updates, null, 2));
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.revenueModel) {
      database.revenueModel = {};
    }
    if (!database.revenueModel.saas) {
      database.revenueModel.saas = {};
    }
    
    // Applica aggiornamenti (deep merge per pricing)
    database.revenueModel.saas = {
      ...database.revenueModel.saas,
      ...updates,
      pricing: {
        ...database.revenueModel.saas.pricing,
        ...updates.pricing,
        perDevice: {
          ...database.revenueModel.saas.pricing?.perDevice,
          ...updates.pricing?.perDevice
        },
        perScan: {
          ...database.revenueModel.saas.pricing?.perScan,
          ...updates.pricing?.perScan
        },
        tiered: {
          ...database.revenueModel.saas.pricing?.tiered,
          ...updates.pricing?.tiered
        }
      }
    };
    
    // Aggiorna metadata
    if (!database.revenueModel.metadata) {
      database.revenueModel.metadata = {};
    }
    database.revenueModel.metadata.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ SaaS Revenue Model aggiornato');
    res.json({ success: true, saas: database.revenueModel.saas });
  } catch (error) {
    console.error('❌ Errore aggiornamento SaaS Revenue Model:', error);
    res.status(500).json({ error: 'Errore aggiornamento SaaS Revenue Model' });
  }
});

/**
 * ============================================================================
 * GO-TO-MARKET - ENDPOINTS
 * ============================================================================
 */

/**
 * PATCH /api/database/go-to-market
 * Aggiorna configurazione Go-To-Market Engine
 */
app.patch('/api/database/go-to-market', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('📥 Ricevuto update Go-To-Market:', JSON.stringify(updates, null, 2));
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.goToMarket) {
      database.goToMarket = {
        enabled: true,
        salesCapacity: {},
        salesCycle: {},
        conversionFunnel: {},
        channelMix: {},
        adoptionCurve: {},
        scenarios: {}
      };
    }
    
    // ✅ MERGE CORRETTO - Update scalari, merge nested
    // NON fare spread di updates perché sovrascrive nested objects!
    
    // Update campi scalari (enabled, description, ecc.)
    const scalarKeys = ['enabled', 'description', 'note'];
    scalarKeys.forEach(key => {
      if (key in updates) {
        database.goToMarket[key] = updates[key];
      }
    });
    
    // Merge nested objects SOLO se presenti in updates
    if (updates.salesCapacity) {
      // 🔧 FIX: Deep merge repsByYear PRIMA, poi escludi dal merge principale
      const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
      
      // Merge campi scalari di salesCapacity
      database.goToMarket.salesCapacity = {
        ...database.goToMarket.salesCapacity,
        ...restSalesCapacity
      };
      
      // Deep merge incrementale per repsByYear (se presente)
      if (updatedRepsByYear) {
        database.goToMarket.salesCapacity.repsByYear = {
          ...database.goToMarket.salesCapacity.repsByYear,
          ...updatedRepsByYear
        };
      }
    }
    
    if (updates.salesCycle) {
      database.goToMarket.salesCycle = {
        ...database.goToMarket.salesCycle,
        ...updates.salesCycle
      };
      if (updates.salesCycle?.bySegment) {
        database.goToMarket.salesCycle.bySegment = {
          ...database.goToMarket.salesCycle.bySegment,
          ...updates.salesCycle.bySegment
        };
      }
    }
    
    if (updates.conversionFunnel) {
      database.goToMarket.conversionFunnel = {
        ...database.goToMarket.conversionFunnel,
        ...updates.conversionFunnel
      };
    }
    
    if (updates.channelMix) {
      database.goToMarket.channelMix = {
        ...database.goToMarket.channelMix,
        ...updates.channelMix
      };
    }
    
    if (updates.adoptionCurve) {
      database.goToMarket.adoptionCurve = {
        ...database.goToMarket.adoptionCurve,
        ...updates.adoptionCurve
      };
      
      // Merge region-specific solo se presenti
      ['italia', 'europa', 'usa', 'cina'].forEach(region => {
        if (updates.adoptionCurve?.[region]) {
          database.goToMarket.adoptionCurve[region] = {
            ...database.goToMarket.adoptionCurve[region],
            ...updates.adoptionCurve[region]
          };
        }
      });
    }
    
    if (updates.scenarios) {
      database.goToMarket.scenarios = {
        ...database.goToMarket.scenarios,
        ...updates.scenarios
      };
    }
    
    // Aggiorna metadata
    database.goToMarket.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Go-To-Market Engine aggiornato');
    res.json({ success: true, goToMarket: database.goToMarket });
  } catch (error) {
    console.error('❌ Errore aggiornamento Go-To-Market:', error);
    res.status(500).json({ error: 'Errore aggiornamento Go-To-Market' });
  }
});

/**
 * PATCH /api/database/go-to-market/marketing-plan/:year
 * Aggiorna proiezione marketing plan per un anno specifico
 */
app.patch('/api/database/go-to-market/marketing-plan/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const projection = req.body;
    
    console.log(`📊 Ricevuto update Marketing Plan Anno ${year}:`, {
      costPerLead: projection.costPerLead,
      budgetMarketing: projection.calculated?.budgetMarketing,
      leadsNeeded: projection.calculated?.leadsNeeded
    });
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.goToMarket) {
      return res.status(400).json({ error: 'Go-To-Market non configurato' });
    }
    
    if (!database.goToMarket.marketingPlan) {
      database.goToMarket.marketingPlan = {
        description: "Proiezioni marketing e sales per anno - calcolate dal Simulatore Impatto Business",
        globalSettings: {
          costPerLead: 50,
          devicePrice: 50000,
          description: "Parametri globali default per simulatore"
        },
        projections: {},
        lastUpdate: null,
        note: "Piano marketing persistente - aggiornato automaticamente dal simulatore"
      };
    }
    
    // Aggiorna proiezione per l'anno specifico
    const yearKey = `y${year}`;
    database.goToMarket.marketingPlan.projections[yearKey] = {
      ...projection,
      lastUpdate: new Date().toISOString()
    };
    
    // Aggiorna timestamp globale
    database.goToMarket.marketingPlan.lastUpdate = new Date().toISOString();
    database.goToMarket.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log(`✅ Marketing Plan Anno ${year} salvato`);
    res.json({ 
      success: true, 
      marketingPlan: database.goToMarket.marketingPlan.projections[yearKey]
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento Marketing Plan:', error);
    res.status(500).json({ error: 'Errore aggiornamento Marketing Plan' });
  }
});

/**
 * PATCH /api/database/go-to-market/calculated
 * Aggiorna sezione calculated - riconciliazione Top-Down vs Bottom-Up
 */
app.patch('/api/database/go-to-market/calculated', async (req, res) => {
  try {
    const calculated = req.body;
    
    console.log('📊 Ricevuto update GTM Calculated:', {
      realisticSales: calculated.realisticSales,
      constrainingFactors: calculated.constrainingFactor
    });
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Verifica esistenza goToMarket
    if (!database.goToMarket) {
      return res.status(400).json({ error: 'Go-To-Market non configurato' });
    }
    
    // Aggiorna sezione calculated
    database.goToMarket.calculated = {
      ...calculated,
      lastUpdate: new Date().toISOString()
    };
    
    // Aggiorna timestamp globale
    database.goToMarket.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ GTM Calculated aggiornato');
    res.json({ 
      success: true, 
      calculated: database.goToMarket.calculated 
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento GTM Calculated:', error);
    res.status(500).json({ error: 'Errore aggiornamento GTM Calculated' });
  }
});

/**
 * ============================================================================
 * STATO PATRIMONIALE - ENDPOINTS
 * ============================================================================
 */

/**
 * PATCH /api/database/stato-patrimoniale/working-capital
 * Aggiorna parametri Working Capital
 */
app.patch('/api/database/stato-patrimoniale/working-capital', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.statoPatrimoniale) {
      database.statoPatrimoniale = {};
    }
    if (!database.statoPatrimoniale.workingCapital) {
      database.statoPatrimoniale.workingCapital = {};
    }
    
    // Applica aggiornamenti
    database.statoPatrimoniale.workingCapital = {
      ...database.statoPatrimoniale.workingCapital,
      ...updates
    };
    
    // Aggiorna metadata
    if (!database.statoPatrimoniale.metadata) {
      database.statoPatrimoniale.metadata = {};
    }
    database.statoPatrimoniale.metadata.lastModified = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Working Capital parameters aggiornati:', updates);
    res.json({ success: true, workingCapital: database.statoPatrimoniale.workingCapital });
  } catch (error) {
    console.error('❌ Errore aggiornamento Working Capital:', error);
    res.status(500).json({ error: 'Errore aggiornamento Working Capital' });
  }
});

/**
 * PATCH /api/database/stato-patrimoniale/fixed-assets
 * Aggiorna parametri Fixed Assets
 */
app.patch('/api/database/stato-patrimoniale/fixed-assets', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Inizializza struttura se non esiste
    if (!database.statoPatrimoniale) {
      database.statoPatrimoniale = {};
    }
    if (!database.statoPatrimoniale.fixedAssets) {
      database.statoPatrimoniale.fixedAssets = {};
    }
    
    // Applica aggiornamenti
    database.statoPatrimoniale.fixedAssets = {
      ...database.statoPatrimoniale.fixedAssets,
      ...updates
    };
    
    // Aggiorna metadata
    if (!database.statoPatrimoniale.metadata) {
      database.statoPatrimoniale.metadata = {};
    }
    database.statoPatrimoniale.metadata.lastModified = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Fixed Assets parameters aggiornati:', updates);
    res.json({ success: true, fixedAssets: database.statoPatrimoniale.fixedAssets });
  } catch (error) {
    console.error('❌ Errore aggiornamento Fixed Assets:', error);
    res.status(500).json({ error: 'Errore aggiornamento Fixed Assets' });
  }
});

/**
 * PATCH /api/database/stato-patrimoniale/funding-round/:index
 * Aggiorna un funding round specifico
 */
app.patch('/api/database/stato-patrimoniale/funding-round/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    // Verifica struttura
    if (!database.statoPatrimoniale?.funding?.rounds) {
      return res.status(404).json({ error: 'Funding rounds non trovati' });
    }
    
    const roundIndex = parseInt(index);
    if (roundIndex < 0 || roundIndex >= database.statoPatrimoniale.funding.rounds.length) {
      return res.status(404).json({ error: 'Round index non valido' });
    }
    
    // Aggiorna round
    database.statoPatrimoniale.funding.rounds[roundIndex] = {
      ...database.statoPatrimoniale.funding.rounds[roundIndex],
      ...updates
    };
    
    // Aggiorna metadata
    if (!database.statoPatrimoniale.metadata) {
      database.statoPatrimoniale.metadata = {};
    }
    database.statoPatrimoniale.metadata.lastModified = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log(`✅ Funding round ${roundIndex} aggiornato:`, updates);
    res.json({ 
      success: true, 
      round: database.statoPatrimoniale.funding.rounds[roundIndex] 
    });
  } catch (error) {
    console.error('❌ Errore aggiornamento funding round:', error);
    res.status(500).json({ error: 'Errore aggiornamento funding round' });
  }
});

// ============================================================================
// TIMELINE API
// ============================================================================

/**
 * GET /api/timeline/tasks
 * Legge tutti i task della timeline
 */
app.get('/api/timeline/tasks', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    res.json(database.timeline.tasks || []);
  } catch (error) {
    console.error('❌ Errore lettura tasks:', error);
    res.status(500).json({ error: 'Errore lettura tasks' });
  }
});

/**
 * GET /api/timeline/categories
 * Legge tutte le categorie della timeline
 */
app.get('/api/timeline/categories', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    res.json(database.timeline.categories || []);
  } catch (error) {
    console.error('❌ Errore lettura categorie:', error);
    res.status(500).json({ error: 'Errore lettura categorie' });
  }
});

/**
 * POST /api/timeline/task
 * Crea un nuovo task
 */
app.post('/api/timeline/task', async (req, res) => {
  try {
    const newTask = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    // Genera ID se non fornito
    if (!newTask.id) {
      const maxId = database.timeline.tasks.reduce((max, task) => {
        const taskNum = parseInt(task.id.replace('task_', ''));
        return taskNum > max ? taskNum : max;
      }, 0);
      newTask.id = `task_${String(maxId + 1).padStart(3, '0')}`;
    }
    
    // Aggiungi task
    database.timeline.tasks.push(newTask);
    
    // Aggiorna metadata
    database.timeline.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Task creato:', newTask.id);
    res.json({ success: true, task: newTask });
  } catch (error) {
    console.error('❌ Errore creazione task:', error);
    res.status(500).json({ error: 'Errore creazione task' });
  }
});

/**
 * PATCH /api/timeline/task/:id
 * Aggiorna un task esistente
 */
app.patch('/api/timeline/task/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    // Trova task
    const taskIndex = database.timeline.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: `Task ${id} non trovato` });
    }
    
    // Aggiorna task
    database.timeline.tasks[taskIndex] = {
      ...database.timeline.tasks[taskIndex],
      ...updates,
      id // Preserva ID originale
    };
    
    // Aggiorna metadata
    database.timeline.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log(`✅ Task ${id} aggiornato:`, updates);
    res.json({ success: true, task: database.timeline.tasks[taskIndex] });
  } catch (error) {
    console.error('❌ Errore aggiornamento task:', error);
    res.status(500).json({ error: 'Errore aggiornamento task' });
  }
});

/**
 * DELETE /api/timeline/task/:id
 * Elimina un task
 */
app.delete('/api/timeline/task/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    // Filtra task
    const initialLength = database.timeline.tasks.length;
    database.timeline.tasks = database.timeline.tasks.filter(t => t.id !== id);
    
    if (database.timeline.tasks.length === initialLength) {
      return res.status(404).json({ error: `Task ${id} non trovato` });
    }
    
    // Rimuovi dependencies che puntano al task eliminato
    database.timeline.tasks.forEach(task => {
      if (task.dependencies && task.dependencies.includes(id)) {
        task.dependencies = task.dependencies.filter(dep => dep !== id);
      }
    });
    
    // Aggiorna metadata
    database.timeline.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log(`✅ Task ${id} eliminato`);
    res.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('❌ Errore eliminazione task:', error);
    res.status(500).json({ error: 'Errore eliminazione task' });
  }
});

/**
 * PATCH /api/timeline/filters
 * Aggiorna i filtri della timeline
 */
app.patch('/api/timeline/filters', async (req, res) => {
  try {
    const updates = req.body;
    
    // Leggi database
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const database = JSON.parse(data);
    
    if (!database.timeline) {
      return res.status(404).json({ error: 'Timeline non trovata nel database' });
    }
    
    // Aggiorna filtri
    database.timeline.filters = {
      ...database.timeline.filters,
      ...updates
    };
    
    // Aggiorna metadata
    database.timeline.lastUpdate = new Date().toISOString();
    
    // Salva
    await saveDatabaseSafe(database);
    
    console.log('✅ Filtri timeline aggiornati:', updates);
    res.json({ success: true, filters: database.timeline.filters });
  } catch (error) {
    console.error('❌ Errore aggiornamento filtri:', error);
    res.status(500).json({ error: 'Errore aggiornamento filtri' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
});

// Mount Value Proposition Routes
app.use('/api/value-proposition', valuePropositionRoutes);

// Avvia server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 SERVER DATABASE ECO 3D                                   ║
║                                                                ║
║   📡 Porta: ${PORT}                                              ║
║   📂 Database: ${path.basename(DB_PATH)}                      ║
║   🔗 URL: http://localhost:${PORT}                             ║
║                                                                ║
║   API ECOGRAFIE:                                               ║
║   GET    /api/database                  - Leggi database      ║
║   PUT    /api/database                  - Sovrascrivi tutto   ║
║   PATCH  /api/database/prestazione/:id  - Aggiorna prestazione║
║   POST   /api/database/toggle-aggredibile/:id - Toggle        ║
║   PATCH  /api/database/percentuale/:id  - Aggiorna %          ║
║   GET    /api/regioni                   - Leggi regioni       ║
║   PATCH  /api/regioni/:id/moltiplicatore - Moltiplicatori     ║
║                                                                ║
║   API ECOGRAFI:                                                ║
║   GET    /api/ecografi                  - Leggi ecografi      ║
║   PATCH  /api/ecografi/configurazione   - Config ecografi     ║
║   POST   /api/ecografi/toggle-tipologia/:id/:campo - Toggle   ║
║   PATCH  /api/ecografi/tipologia/:id    - Aggiorna tipologia  ║
║                                                                ║
║   API TAM/SAM/SOM:                                             ║
║   PATCH  /api/database/tam-sam-som/ecografie  - Config TAM/SAM║
║   PATCH  /api/database/tam-sam-som/ecografi   - Config TAM/SAM║
║   PATCH  /api/database/prezzi-regionalizzati/:regione/:cod    ║
║                                                                ║
║   API GO-TO-MARKET:                                            ║
║   PATCH  /api/database/go-to-market           - Config GTM    ║
║   PATCH  /api/database/go-to-market/marketing-plan/:year      ║
║   PATCH  /api/database/go-to-market/calculated - Reconciliation║
║                                                                ║
║   API STATO PATRIMONIALE:                                      ║
║   PATCH  /api/database/stato-patrimoniale/working-capital     ║
║   PATCH  /api/database/stato-patrimoniale/fixed-assets        ║
║   PATCH  /api/database/stato-patrimoniale/funding-round/:idx  ║
║                                                                ║
║   API TIMELINE:                                                ║
║   GET    /api/timeline/tasks            - Leggi tutti i task  ║
║   GET    /api/timeline/categories       - Leggi categorie     ║
║   POST   /api/timeline/task             - Crea nuovo task     ║
║   PATCH  /api/timeline/task/:id         - Aggiorna task       ║
║   DELETE /api/timeline/task/:id         - Elimina task        ║
║   PATCH  /api/timeline/filters          - Aggiorna filtri     ║
║                                                                ║
║   API VALUE PROPOSITION:                                       ║
║   PATCH  /api/value-proposition/customer-profile/job/:id      ║
║   PATCH  /api/value-proposition/customer-profile/pain/:id     ║
║   PATCH  /api/value-proposition/customer-profile/gain/:id     ║
║   PATCH  /api/value-proposition/value-map/feature/:id         ║
║   PATCH  /api/value-proposition/messaging/elevator-pitch      ║
║   PATCH  /api/value-proposition/messaging/positioning-statement║
║   POST   /api/value-proposition/messaging/competitive-message ║
║   PATCH  /api/value-proposition/messaging/competitive-message/:id║
║   DELETE /api/value-proposition/messaging/competitive-message/:id║
║   POST   /api/value-proposition/messaging/testimonial         ║
║   PATCH  /api/value-proposition/messaging/testimonial/:id     ║
║   DELETE /api/value-proposition/messaging/testimonial/:id     ║
║   POST   /api/value-proposition/messaging/objection           ║
║   PATCH  /api/value-proposition/messaging/objection/:id       ║
║   DELETE /api/value-proposition/messaging/objection/:id       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
