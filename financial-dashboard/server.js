/**
 * SERVER BACKEND PER DATABASE.JSON
 * Espone API REST per leggere e scrivere il file database.json
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'src', 'data', 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
    
    // Scrivi il file con formattazione
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(newData, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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
    
    // Salva
    await fs.writeFile(
      DB_PATH,
      JSON.stringify(database, null, 2),
      'utf-8'
    );
    
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
╚════════════════════════════════════════════════════════════════╝
  `);
});
