# Database Inspector - Documentazione

## 📋 Overview

Il **Database Inspector** è un nuovo TAB dell'applicazione che fornisce una visualizzazione completa e interattiva di tutti i dati contenuti nel database centralizzato (`database.json`), **escludendo la sezione Budget** che è troppo volumosa per una visualizzazione efficace.

## 🎯 Obiettivi

1. **Controllo Qualità**: Verificare che il database funzioni correttamente
2. **Tracciabilità**: Capire quali dati servono a cosa e chi li utilizza
3. **Debugging**: Identificare rapidamente problemi nei dati
4. **Modifica Rapida**: Possibilità di modificare valori direttamente dall'interfaccia

## 🗂️ Sezioni del Database Visualizzate

### 1. **mercatoEcografie**
- **Contenuto**: Prestazioni ecografiche in Italia
- **Dati chiave**: 
  - 15 tipologie di prestazioni con codici (es. 88.71.4, 88.72.2)
  - Valori U, B, D, P per ogni prestazione
  - Percentuale Extra-SSN specifica per prestazione
  - Flag `aggredibile` per prestazioni target
- **Usato in**: 
  - `MercatoEcografie.tsx`
  - `MercatoEcografieRegionale.tsx`

### 2. **mercatoEcografi**
- **Contenuto**: Dati sul mercato degli ecografi
- **Sotto-sezioni**:
  - `tipologie`: Carrellati, Portatili, Palmari, Premium, POCUS
  - `numeroEcografi`: Proiezioni 2025-2035 per Italia, Europa, USA, Cina, Mondo
  - `valoreMercato`: Valori mercato in M€ con CAGR
  - `proiezioniItalia`: Stime da 4 fonti (Mordor, Research, GrandView, Cognitive)
  - `quoteTipologie`: Distribuzione percentuale tipologie anno per anno
  - `parcoIT`: Parco installato Italia (scenari basso/centrale/alto)
  - `configurazione`: Impostazioni mercato target
- **Usato in**:
  - `MercatoEcografi.tsx`
  - `TamSamSomDashboard.tsx`

### 3. **regioniMondiali**
- **Contenuto**: Moltiplicatori geografici
- **Dati**: USA, Europa, Cina, Globale
- **Parametri**: 
  - `moltiplicatoreVolume`
  - `moltiplicatoreValore`
  - `quotaItalia`
- **Usato in**: `MercatoEcografieRegionale.tsx`

### 4. **moltiplicatoriRegionali**
- **Contenuto**: Moltiplicatori alternativi per analisi regionali
- **Usato in**: `MercatoEcografieRegionale.tsx`

### 5. **contoEconomico**
- **Contenuto**: Dati finanziari completi
- **Sotto-sezioni**:
  - `ricavi`: Modello ricavi 2025-2029
  - `cogs`: Cost of Goods Sold
  - `opex`: Spese operative annuali
  - `ammortamenti`: Asset capitalizzati e quote annuali
  - `interessiFinanziari`: Debiti e convertible notes
  - `tasse`: Regime fiscale IRES + IRAP
  - `breakEvenAnalysis`: Analisi break-even operativo
  - `kpiMetriche`: Formule e target KPI
  - `scenari`: Base, Prudente, Ambizioso
- **Usato in**:
  - `IncomeStatementDashboard.tsx`
  - `FinancialStatements.tsx`

### 6. **metadata**
- **Contenuto**: Metadati e informazioni versione
- **Dati**:
  - `version`: Versione database
  - `lastUpdate`: Data ultimo aggiornamento
  - `createdBy`: Sistema creatore
  - `sourceFile`: File sorgente Excel
  - `sources`: Mappatura sorgenti dati
  - `validationRules`: Regole di validazione
- **Usato in**: Tutti i componenti

### 7. **materialiConsumabili**
- **Contenuto**: Placeholder per dati futuri
- **Stato**: Non implementato
- **Usato in**: Nessuno

## 🎨 Funzionalità Interfaccia

### Visualizzazione Gerarchica
- Struttura ad albero espandibile/collassabile
- Indicatori di tipo per ogni valore (object, array, string, number, boolean, null)
- Conteggio elementi per oggetti e array
- Colori distintivi per sezioni di primo livello

### Ricerca
- Campo di ricerca in tempo reale
- Filtraggio per chiavi o valori
- Highlight automatico risultati

### Modifica Dati
- Click su icona edit per modificare qualsiasi valore
- Editor JSON inline con validazione
- Salvataggio con conferma
- ⚠️ **IMPORTANTE**: Le modifiche sono temporanee (solo sessione corrente)

### Controlli
- **Espandi/Collassa**: Espande o collassa tutti i nodi
- **Mostra/Nascondi Info**: Toggle metadata utilizzo
- **Esporta**: Download database in formato JSON

### Metadata Utilizzo
Per ogni sezione di primo livello, mostra:
- 📍 **Usato in**: Lista componenti che leggono questi dati
- Numero di sotto-sezioni
- Versione e data aggiornamento

## 🔧 Implementazione Tecnica

### File Creati
1. **`/src/components/DatabaseInspector.tsx`**: Componente principale

### Modifiche File Esistenti
1. **`/src/components/MasterDashboard.tsx`**:
   - Import di `DatabaseInspector`
   - Aggiunta TAB "🗄️ Database"
   - Rendering componente

### Dipendenze UI
Utilizza componenti shadcn/ui esistenti:
- `Card`
- `Button`
- `Badge`
- `Input`
- Icone da `lucide-react`

## 📊 Statistiche Database

### Sezioni Principali
- **Totale sezioni**: 7 (escluso budget)
- **Sezione più grande**: `mercatoEcografi` (~800 righe JSON)
- **Sezione più usata**: `metadata` (tutti i componenti)

### Dimensioni
- **Budget escluso**: ~3800 righe (~80% del database)
- **Dati visualizzati**: ~1200 righe (~20% del database)
- **Formato**: JSON strutturato

## 🚀 Come Usare

### Accesso
1. Avvia l'applicazione: `npm run dev`
2. Vai al TAB **"🗄️ Database"** nella barra principale
3. L'interfaccia mostra automaticamente tutti i dati (escluso budget)

### Esplorare Dati
1. Click su ▶️ per espandere una sezione
2. Click su ▼ per collassare
3. Usa pulsanti "Espandi"/"Collassa" per azioni bulk

### Cercare Dati
1. Digita nel campo ricerca (es. "Extra-SSN", "2025", "USA")
2. I risultati vengono filtrati in tempo reale
3. Mostra solo sezioni che contengono il termine

### Modificare Dati
1. Click su icona ✏️ accanto al valore da modificare
2. Appare un editor JSON inline
3. Modifica il valore (mantieni formato JSON valido)
4. Click su ✅ per salvare o ❌ per annullare
5. ⚠️ La modifica è **temporanea**: valida solo per questa sessione

### Esportare Database
1. Click su pulsante "Esporta"
2. Scarica file JSON con timestamp
3. Usa per backup o analisi esterne

## ⚠️ Limitazioni e Note

### Modifiche Temporanee
Le modifiche effettuate tramite l'interfaccia:
- ✅ Sono immediate nell'interfaccia
- ✅ Si propagano agli altri componenti nella sessione
- ❌ NON sono salvate su disco
- ❌ Si perdono al refresh della pagina

### Come Rendere Permanenti le Modifiche
1. **Manualmente**: Modifica direttamente `database.json`
2. **Sistema di persistenza** (da implementare):
   - API endpoint per salvare modifiche
   - Backend per gestire aggiornamenti
   - Sistema di versioning

### Performance
- Budget escluso per performance (3800+ righe)
- Ricerca ottimizzata per dataset corrente
- Rendering lazy per grandi array

## 🔮 Sviluppi Futuri

### Funzionalità Pianificate
1. **Persistenza**: Save permanente delle modifiche
2. **History**: Cronologia modifiche con undo/redo
3. **Validazione**: Schema validation per prevenire errori
4. **Diff Viewer**: Confronto versioni database
5. **Export Selettivo**: Esporta solo sezioni specifiche
6. **Import**: Importa dati da file esterni
7. **Budget Viewer**: Visualizzazione ottimizzata per sezione Budget

### Integrazioni Future
- Collegamento con sistema di versioning Git
- Sincronizzazione con database esterno
- API per aggiornamenti programmatici
- Webhook per notifiche cambiamenti

## 📝 Best Practices

### Utilizzo
- ✅ Usa per debugging e verifiche rapide
- ✅ Esporta regolarmente per backup
- ✅ Verifica integrità dati prima di modifiche importanti
- ❌ Non fare modifiche massive senza backup
- ❌ Non usare per modifiche production (usa file JSON diretto)

### Sicurezza
- Il Database Inspector mostra tutti i dati sensibili
- Non esporre in ambiente production senza autenticazione
- Considera permessi di accesso differenziati

## 🐛 Troubleshooting

### Database non carica
- Verifica che `/data/database.json` esista e sia valido JSON
- Controlla console browser per errori
- Verifica path relativo nel fetch

### Modifiche non salvano
- È normale: modifiche sono temporanee per design
- Implementa sistema persistenza per salvataggio permanente

### Performance lente
- Riduci numero di nodi espansi
- Usa ricerca per filtrare
- Considera paginazione per sezioni molto grandi

## 📚 Riferimenti

- **File database**: `/src/data/database.json`
- **Componente**: `/src/components/DatabaseInspector.tsx`
- **Documentazione API**: (da creare)
- **Schema dati**: (da formalizzare)

---

**Versione**: 1.0.0  
**Data creazione**: 2025-10-11  
**Ultima modifica**: 2025-10-11  
**Autore**: Sistema Eco 3D Business Planning
