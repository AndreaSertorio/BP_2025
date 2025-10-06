# 📊 STATO SISTEMA ECO 3D - GENNAIO 2025

**Data Creazione:** 2025-01-06  
**Versione:** 2.0  
**Stato:** ✅ OPERATIVO (Parziale)

---

## 🎯 EXECUTIVE SUMMARY

Abbiamo implementato un **sistema centralizzato** per la gestione dei dati di mercato di Eco 3D, sostituendo il precedente sistema frammentato (PlayerPrefs, localStorage, Context multipli) con una **singola fonte di verità**: `database.json`.

### ✅ Cosa Funziona Ora

1. **Database Centralizzato** - `database.json` + Server API (porta 3001)
2. **Mercato Ecografie** - Completamente sincronizzato con sub-pagine regionali
3. **Pagina Riepilogo** - Monitoraggio sincronizzazione in tempo reale
4. **Sistema Regionali** - Italia, USA, Europa, Cina, Globale

### 🔄 Cosa Manca

1. **Mercato Ecografi** - Da integrare completamente con database centralizzato
2. **Piano Finanziario** - Da collegare ai dati di mercato

---

## 🏗️ ARCHITETTURA ATTUALE

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         DatabaseProvider (Context)              │    │
│  │  - Gestisce stato globale database.json        │    │
│  │  - Sincronizza modifiche con API               │    │
│  └────────────────────────────────────────────────┘    │
│                         ↕                               │
│  ┌─────────────┬──────────────┬──────────────────┐    │
│  │   Mercato   │   Mercato    │    Riepilogo     │    │
│  │  Ecografie  │  Ecografi    │                  │    │
│  │  (✅ SYNC)  │  (🔄 TODO)   │   (✅ SYNC)      │    │
│  └─────────────┴──────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP API
┌─────────────────────────────────────────────────────────┐
│              SERVER API (Express - Porta 3001)          │
│                                                          │
│  GET  /api/database           → Leggi tutto            │
│  PUT  /api/database           → Sovrascrivi tutto      │
│  PATCH /api/database/prestazione/:codice               │
│  POST /api/database/toggle-aggredibile/:codice         │
│  POST /api/database/regione/:regioneId                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         ↕ File I/O
┌─────────────────────────────────────────────────────────┐
│                    database.json                        │
│                                                          │
│  - mercatoEcografie (COMPLETO ✅)                       │
│    ├── italia                                           │
│    │   ├── prestazioni[15]                              │
│    │   ├── percentualeExtraSSN                          │
│    │   └── annoRiferimento                              │
│    └── moltiplicatoriRegionali (DEPRECATO)             │
│                                                          │
│  - regioniMondiali (NUOVO ✅)                           │
│    ├── usa                                              │
│    ├── europa                                           │
│    ├── cina                                             │
│    └── globale                                          │
│                                                          │
│  - mercatoEcografi (MANCANTE 🔄)                       │
│    └── TODO: Struttura da definire                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 STRUTTURA FILE PROGETTO

### File Principali

```
financial-dashboard/
├── src/
│   ├── data/
│   │   └── database.json                    ✅ Database centralizzato
│   │
│   ├── contexts/
│   │   ├── DatabaseProvider.tsx            ✅ Context principale
│   │   └── MercatoContext.tsx              🔄 Da rifattorizzare
│   │
│   ├── lib/
│   │   └── database-service.ts             ✅ Servizio calcoli
│   │
│   ├── components/
│   │   ├── MercatoEcografie.tsx           ✅ Pagina Italia (master)
│   │   ├── MercatoEcografieRegionale.tsx  ✅ Template regioni
│   │   ├── MercatoEcografi.tsx            🔄 Da sincronizzare
│   │   ├── MercatoRiepilogo.tsx           ✅ Dashboard riepilogo
│   │   └── MercatoWrapper.tsx             ✅ Tab container
│   │
│   └── types/
│       └── mercato.types.ts                🔄 Da integrare con DB
│
└── server.js                                ✅ API Express
```

---

## 📊 DATABASE.JSON - STRUTTURA COMPLETA

### Sezione: mercatoEcografie ✅

```json
{
  "mercatoEcografie": {
    "italia": {
      "annoRiferimento": 2024,
      "percentualeExtraSSN": 30,
      "prestazioni": [
        {
          "codice": "88.76.1",
          "nome": "Addome Completo",
          "U": 28437,
          "B": 342268,
          "D": 388559,
          "P": 562362,
          "percentualeExtraSSN": 50,
          "aggredibile": false,
          "note": "Prestazione target per Eco3D"
        }
        // ... altre 14 prestazioni
      ]
    }
  }
}
```

**Campi Modificabili:**
- `aggredibile` (boolean) - Toggle dalla UI Italia
- `percentualeExtraSSN` (number 0-100) - Input dalla UI Italia

**Campi Read-Only:**
- `U, B, D, P` - Dati storici da Excel
- `codice, nome` - Identificatori

### Sezione: regioniMondiali ✅

```json
{
  "regioniMondiali": {
    "usa": {
      "nome": "USA",
      "flag": "🇺🇸",
      "moltiplicatoreVolume": 9,
      "moltiplicatoreValore": 1.8,
      "quotaItalia": "17%",
      "note": "Mercato USA - volumi e valori più alti"
    },
    "europa": {
      "nome": "Europa",
      "flag": "🇪🇺",
      "moltiplicatoreVolume": 8,
      "moltiplicatoreValore": 1.2,
      "quotaItalia": "12%",
      "note": "Europa (escl. Italia) - mercato maturo"
    },
    "cina": {
      "nome": "Cina",
      "flag": "🇨🇳",
      "moltiplicatoreVolume": 12,
      "moltiplicatoreValore": 0.6,
      "quotaItalia": "4.5%",
      "note": "Cina - grandi volumi, prezzi più bassi"
    },
    "globale": {
      "nome": "Mondo",
      "flag": "🌍",
      "moltiplicatoreVolume": 56,
      "moltiplicatoreValore": 1,
      "quotaItalia": "2%",
      "note": "Mercato globale - stima aggregata"
    }
  }
}
```

**Campi Modificabili:**
- `moltiplicatoreVolume` - Slider nelle pagine regionali
- `moltiplicatoreValore` - Slider nelle pagine regionali

### Sezione: mercatoEcografi 🔄 (DA IMPLEMENTARE)

```json
{
  "mercatoEcografi": {
    "tipologie": [
      {
        "id": "carrellati",
        "nome": "Carrellati",
        "icon": "🏥",
        "quotaIT": 45,
        "valoreIT": 2800,
        "quotaGlobale": 40,
        "valoreGlobale": 15000,
        "cagrGlobale": "4.5%",
        "target": false,
        "visible": true
      },
      {
        "id": "palmari",
        "nome": "Palmari",
        "icon": "📱",
        "quotaIT": 15,
        "valoreIT": 450,
        "quotaGlobale": 20,
        "valoreGlobale": 8000,
        "cagrGlobale": "12.3%",
        "target": true,
        "visible": true
      }
      // ... altre tipologie
    ],
    "proiezioniItalia": [
      {
        "anno": 2025,
        "mordor": 520,
        "research": 510,
        "grandview": 530,
        "cognitive": 515,
        "media": 518.75,
        "mediana": 517.5
      }
      // ... 2026-2030
    ],
    "parcoIT": [
      {
        "anno": 2025,
        "basso": 45000,
        "centrale": 48000,
        "alto": 51000
      }
      // ... 2026-2035
    ],
    "numeroEcografi": [
      {
        "mercato": "Italia",
        "unita2025": 48000,
        "unita2030": 52000
      },
      {
        "mercato": "Europa",
        "unita2025": 360000,
        "unita2030": 400000
      }
      // ... altre regioni
    ],
    "valoreMercato": [
      {
        "mercato": "Italia",
        "valore2025": 520,
        "valore2030": 650,
        "cagr": 4.5
      }
      // ... altre regioni
    ],
    "configurazione": {
      "annoTarget": 2030,
      "marketShare": 1.0,
      "scenarioParco": "centrale",
      "regioniVisibili": ["Italia", "Europa", "Stati Uniti", "Cina"],
      "tipologieTarget": ["Palmari"]
    }
  }
}
```

---

## 🔄 FLUSSO DATI SINCRONIZZATO

### Scenario 1: Modifica Prestazione Aggredibile (Italia)

```
1. User clicca checkbox "Aggredibile" su Addome Completo
   ↓
2. MercatoEcografie.tsx → useDatabase().toggleAggredibile("88.76.1")
   ↓
3. DatabaseProvider → POST /api/database/toggle-aggredibile/88.76.1
   ↓
4. Server → database.json (aggredibile: true → false)
   ↓
5. Server → Response 200 OK
   ↓
6. DatabaseProvider → refreshData() → GET /api/database
   ↓
7. Tutti i componenti che usano useDatabase() si ri-renderizzano
   ↓
8. MercatoRiepilogo mostra nuovo valore mercato aggredibile ✅
```

### Scenario 2: Modifica Moltiplicatore Europa

```
1. User sposta slider Europa a 9×
   ↓
2. MercatoEcografieRegionale.tsx (Europa)
   → useDatabase().updateRegioneMoltiplicatori("europa", 9)
   ↓
3. DatabaseProvider → POST /api/database/regione/europa
   Body: { moltiplicatoreVolume: 9 }
   ↓
4. Server → database.json (regioniMondiali.europa.moltiplicatoreVolume: 9)
   ↓
5. Server → Response 200 OK
   ↓
6. DatabaseProvider → refreshData()
   ↓
7. MercatoRiepilogo card Europa: 246M (27M × 9) ✅
```

---

## 🎯 STATO IMPLEMENTAZIONE

### ✅ COMPLETATO

#### 1. Database Centralizzato
- [x] File `database.json` con struttura completa ecografie
- [x] Server API Express (porta 3001)
- [x] Endpoint CRUD per prestazioni
- [x] Endpoint per regioni mondiali
- [x] Persistenza su file

#### 2. DatabaseProvider
- [x] Context React globale
- [x] Hook `useDatabase()` 
- [x] Metodi CRUD type-safe
- [x] Auto-refresh dopo modifiche
- [x] Error handling

#### 3. DatabaseService
- [x] Calcoli totali Italia
- [x] Calcoli mercato aggredibile
- [x] Calcoli mercati regionali
- [x] Moltiplicatori dinamici da DB
- [x] Formattazione numeri

#### 4. Mercato Ecografie
- [x] Pagina Italia (master data)
- [x] Toggle aggredibile → DB
- [x] Modifica % Extra-SSN → DB
- [x] 15 prestazioni complete
- [x] Tabella interattiva

#### 5. Regioni Mondiali
- [x] Template `MercatoEcografieRegionale`
- [x] Pagine USA, Europa, Cina, Globale
- [x] Slider moltiplicatore volume → DB
- [x] Calcoli dinamici da Italia × moltiplicatore
- [x] Sincronizzazione nome regione ("Europa (UE)" → "europa")

#### 6. Pagina Riepilogo
- [x] Card Italia con totali
- [x] Card mercato aggredibile
- [x] Card regionali (USA, Europa, Cina, Globale)
- [x] Calcoli sincronizzati con DB
- [x] Tooltip informativi
- [x] Real-time updates

---

## 🔄 DA COMPLETARE

### 1. Mercato Ecografi - Sincronizzazione DB

**Stato Attuale:**
- ✅ Usa `MercatoContext` (PlayerPrefs-like con localStorage)
- ✅ Carica dati da Excel
- ❌ Non scrive su `database.json`

**Lavoro Necessario:**

#### Step 1: Definire Struttura DB
```typescript
// Aggiungere a database.json
interface MercatoEcografi {
  tipologie: TipologiaEcografo[];
  proiezioniItalia: ProiezioneItalia[];
  parcoIT: ParcoDispositivi[];
  numeroEcografi: NumeroEcografiRegione[];
  valoreMercato: ValoreMercatoRegione[];
  configurazione: ConfigurazioneEcografi;
}
```

#### Step 2: Migrare da MercatoContext a DatabaseProvider
- [ ] Spostare dati da `MercatoContext` → `database.json`
- [ ] Creare endpoint API per ecografi
- [ ] Aggiornare `MercatoEcografi.tsx` per usare `useDatabase()`
- [ ] Rimuovere localStorage, usare solo DB centralizzato

#### Step 3: Implementare CRUD
- [ ] POST `/api/database/ecografi/tipologia/:id` (toggle target/visible)
- [ ] PATCH `/api/database/ecografi/configurazione` (anno, market share, ecc.)
- [ ] GET con calcoli derivati (target units, ecc.)

#### Step 4: Testare Sincronizzazione
- [ ] Modifiche su Mercato Ecografi → riflesse in Riepilogo
- [ ] Persistenza tra sessioni
- [ ] Performance con ricalcoli complessi

---

## 📊 METRICHE CHIAVE

### Database
- **Prestazioni ecografiche:** 15
- **Regioni mondiali:** 4 (+ Italia come base)
- **Parametri modificabili:** ~20
- **Dimensione database.json:** ~15 KB

### API
- **Endpoint implementati:** 5
- **Porta server:** 3001
- **Formato dati:** JSON
- **Persistenza:** File system

### UI
- **Pagine principali:** 3 (Ecografie, Ecografi, Riepilogo)
- **Sub-pagine regionali:** 5 (Italia + 4 regioni)
- **Componenti interattivi:** ~30
- **Grafici:** 10+

---

## 🧪 TESTING

### Test Manuali Completati ✅

1. **Toggle Aggredibile**
   - ✅ Modifica si riflette in Riepilogo
   - ✅ Persistenza dopo refresh
   - ✅ Calcolo mercato aggredibile corretto

2. **Modifica % Extra-SSN**
   - ✅ Ricalcolo automatico Extra-SSN
   - ✅ Totale aggiornato
   - ✅ Persistenza

3. **Slider Moltiplicatori Regionali**
   - ✅ USA: Modifica moltiplicatore → Riepilogo aggiornato
   - ✅ Europa: Fix mapping nome → Sincronizzazione OK
   - ✅ Cina: Funzionante
   - ✅ Globale: Funzionante

4. **Refresh Pagina**
   - ✅ Dati persistiti correttamente
   - ✅ Nessuna perdita informazioni
   - ✅ Server serve dati aggiornati

### Test da Fare 🔄

1. **Mercato Ecografi**
   - [ ] Modifiche configurazione
   - [ ] Toggle tipologie target
   - [ ] Cambio scenario parco IT
   - [ ] Market share slider

2. **Performance**
   - [ ] Load time con database grande
   - [ ] Velocità ricalcoli
   - [ ] Rendering grafici

3. **Edge Cases**
   - [ ] Valori estremi (0, 100%, ecc.)
   - [ ] Server offline
   - [ ] Conflitti simultanei

---

## 🐛 PROBLEMI RISOLTI

### 1. Europa Non Si Sincronizzava ✅
**Problema:** Modifiche slider Europa non persistevano  
**Causa:** Mapping nome `"Europa (UE)"` → `"europa (ue)"` non corrispondeva a chiave DB `"europa"`  
**Soluzione:** Regex normalizzazione nome regione rimuove parentesi

### 2. Mercato Aggredibile Errato ✅
**Problema:** Calcolo usava `volumeSSN` invece di `volumeTotale`  
**Soluzione:** Corretto formula: `(aggredibili / totale) × volumeRegione`

### 3. Moltiplicatori Hardcoded ✅
**Problema:** Valori moltiplicatori fissi nel codice  
**Soluzione:** Lettura dinamica da `database.json → regioniMondiali`

---

## 📚 RIFERIMENTI

### File Documentazione Attuali

**DA MANTENERE:**
- `STATO_SISTEMA_2025.md` (questo file) - Riferimento principale
- `Guida.md` - Validazione formule piano finanziario
- `Strumenti_Calcoli_Fondamentali.md` - Formule base

**OBSOLETI (da archiviare):**
- Tutti i file su PlayerPrefs
- `SISTEMA_UNIFICATO_COMPLETATO.md` - Descrive vecchio sistema localStorage
- `ARCHITETTURA_DATABASE_CENTRALIZZATO.md` - Parzialmente superato
- `PIANO_MIGRAZIONE_DATABASE.md` - Migrazione completata
- Altri file su sistemi precedenti

### Codice Sorgente Principale

```
src/
├── contexts/DatabaseProvider.tsx       - Context principale
├── lib/database-service.ts             - Logica calcoli
├── components/MercatoRiepilogo.tsx     - Dashboard
├── components/MercatoEcografie.tsx     - Pagina Italia
├── components/MercatoEcografieRegionale.tsx - Template regioni
└── data/database.json                  - Database centralizzato
```

---

## 🚀 ROADMAP

### Fase 1: Completamento Mercato Ecografi (NEXT) 🎯

**Priorità:** ALTA  
**Tempo stimato:** 2-3 ore

1. Definire struttura `mercatoEcografi` in `database.json`
2. Creare endpoint API per ecografi
3. Migrare `MercatoEcografi.tsx` a `DatabaseProvider`
4. Testare sincronizzazione completa
5. Eliminare `MercatoContext` (deprecato)

### Fase 2: Piano Finanziario

**Priorità:** MEDIA  
**Tempo stimato:** 5-8 ore

1. Integrare dati mercato con proiezioni finanziarie
2. Collegare target unità Eco3D a ricavi
3. Scenari finanziari (Base, Prudente, Ottimistico)
4. Dashboard KPI finanziarie

### Fase 3: Features Avanzate

**Priorità:** BASSA  
**Tempo stimato:** 8-10 ore

1. Export/Import scenari completi
2. Confronto scenari side-by-side
3. Grafici avanzati e drill-down
4. Simulazione Monte Carlo

---

## 💡 BEST PRACTICES

### Sviluppo

1. **Single Source of Truth:** `database.json` è l'unica fonte
2. **Type Safety:** TypeScript per tutti i dati
3. **Immutabilità:** Non modificare mai `data` direttamente, usare azioni
4. **Memoization:** `useMemo` per calcoli pesanti

### Database

1. **Validazione:** Controllare sempre input utente
2. **Backup:** Fare commit git prima di modifiche strutturali
3. **Versioning:** Includere `version` in `database.json`
4. **Migration:** Gestire retrocompatibilità se struttura cambia

### UI/UX

1. **Feedback immediato:** Loading states per tutte le API calls
2. **Error handling:** Mostrare errori utente-friendly
3. **Tooltip:** Spiegare ogni metrica con tooltip
4. **Responsive:** Testare su mobile/tablet

---

## ✅ CHECKLIST SVILUPPATORE

Prima di considerare una feature "completa":

- [ ] Dati salvati in `database.json`
- [ ] Endpoint API creato e testato
- [ ] Component usa `useDatabase()`
- [ ] Modifiche riflesse in Riepilogo
- [ ] Persistenza dopo refresh verificata
- [ ] TypeScript types aggiornati
- [ ] Error handling implementato
- [ ] Loading states aggiunti
- [ ] Documentazione aggiornata
- [ ] Test manuali completati

---

## 🎓 CONCLUSIONI

Il sistema attuale è **solido e funzionante** per la parte Mercato Ecografie. La sincronizzazione tra tutte le pagine regionali e il Riepilogo funziona perfettamente.

**Prossimo obiettivo:** Portare lo stesso livello di sincronizzazione al Mercato Ecografi, eliminando definitivamente `MercatoContext` e completando la migrazione al database centralizzato.

Una volta completato questo step, avremo un sistema **completamente unificato** pronto per essere esteso con il Piano Finanziario e features avanzate.

---

**Creato:** 2025-01-06  
**Ultimo aggiornamento:** 2025-01-06  
**Autore:** Sistema di documentazione Eco 3D  
**Versione documento:** 1.0
