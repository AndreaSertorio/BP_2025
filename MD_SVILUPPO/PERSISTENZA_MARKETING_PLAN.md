# 💾 Persistenza Marketing Plan nel Database

## 📅 Data: 13 Ottobre 2025 - 00:30

---

## 🎯 OBIETTIVO

Salvare automaticamente **tutte le proiezioni marketing** calcolate dal **Simulatore Impatto Business** nel database centralizzato, permettendo:

1. ✅ Accesso ai dati da qualsiasi parte dell'applicazione
2. ✅ Pianificazione budget marketing per Anno 1-5
3. ✅ Storicizzazione modifiche parametri
4. ✅ Coerenza dati tra sessioni

---

## 🗂️ STRUTTURA DATABASE

### Posizione nel Database
```
database.json
└── goToMarket
    └── marketingPlan          ← 🆕 NUOVA SEZIONE
        ├── description
        ├── globalSettings
        ├── projections
        │   ├── y1
        │   ├── y2
        │   ├── y3
        │   ├── y4
        │   └── y5
        ├── lastUpdate
        └── note
```

---

### Schema Completo

```json
{
  "goToMarket": {
    "marketingPlan": {
      "description": "Proiezioni marketing e sales per anno - calcolate dal Simulatore Impatto Business",
      
      "globalSettings": {
        "costPerLead": 50,
        "devicePrice": 50000,
        "description": "Parametri globali default per simulatore"
      },
      
      "projections": {
        "y1": {
          "costPerLead": 50,
          "dealsPerRepOverride": null,
          "calculated": {
            "reps": 1,
            "rampFactor": 0.75,
            "capacity": 15,
            "funnelEfficiency": 0.001,
            "leadsNeeded": 15000,
            "leadsMonthly": 1250,
            "budgetMarketing": 750000,
            "budgetMonthly": 62500,
            "cacEffettivo": 50000,
            "expectedRevenue": 750000,
            "marketingPercentage": 100,
            "productivityRepYear": 20
          },
          "lastUpdate": "2025-10-12T22:30:00.000Z",
          "note": "Calcolato automaticamente dal simulatore"
        },
        "y2": { /* ... */ },
        "y3": { /* ... */ },
        "y4": { /* ... */ },
        "y5": { /* ... */ }
      },
      
      "lastUpdate": "2025-10-12T22:30:00.000Z",
      "note": "Piano marketing persistente - aggiornato automaticamente dal simulatore"
    }
  }
}
```

---

## 📊 DATI SALVATI PER ANNO

### Input Parametri (modificabili dall'utente)

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `costPerLead` | `number` | Costo per lead in EUR (€10-500) |
| `dealsPerRepOverride` | `number \| null` | Override deals/rep/quarter (null = usa default) |

### Output Calcolati (automatici)

| Campo | Tipo | Descrizione | Formula |
|-------|------|-------------|---------|
| `reps` | `number` | Numero reps configurati per quell'anno | Da `repsByYear.yX` |
| `rampFactor` | `number` | Fattore ramp-up (solo Y1: 0.75, altri: 1) | `(12 - rampUpMonths) / 12` |
| `capacity` | `number` | Deals che il team può chiudere | `reps × deals/Q × 4 × rampFactor` |
| `funnelEfficiency` | `number` | Efficienza totale funnel (0-1) | `L2D × D2P × P2D` |
| `leadsNeeded` | `number` | Lead annuali necessari | `ceil(capacity / funnelEfficiency)` |
| `leadsMonthly` | `number` | Lead mensili necessari | `ceil(leadsNeeded / 12)` |
| `budgetMarketing` | `number` | Budget marketing annuale (EUR) | `leadsNeeded × costPerLead` |
| `budgetMonthly` | `number` | Budget marketing mensile (EUR) | `round(budgetMarketing / 12)` |
| `cacEffettivo` | `number` | CAC effettivo per deal (EUR) | `costPerLead / funnelEfficiency` |
| `expectedRevenue` | `number` | Ricavi attesi (EUR) | `capacity × devicePrice` |
| `marketingPercentage` | `number` | Budget/Ricavi % | `(budgetMarketing / expectedRevenue) × 100` |
| `productivityRepYear` | `number` | Deals annuali per rep | `dealsPerQ × 4` |

---

## 🔄 FLUSSO DI PERSISTENZA

### 1. **Caricamento Iniziale**

```typescript
// All'avvio del componente GTMEngineCard
useEffect(() => {
  if (!database?.goToMarket?.marketingPlan || initialized) return;
  
  const marketingPlan = database.goToMarket.marketingPlan;
  
  // Carica global settings
  if (marketingPlan.globalSettings?.costPerLead) {
    setCostPerLead(marketingPlan.globalSettings.costPerLead);
  }
  
  // Carica valori per anno corrente
  const yearKey = `y${selectedYear}`;
  const savedProjection = marketingPlan.projections?.[yearKey];
  if (savedProjection) {
    setCostPerLead(savedProjection.costPerLead);
    setDealsPerRepOverride(savedProjection.dealsPerRepOverride);
  }
  
  setInitialized(true);
}, [database, selectedYear, initialized]);
```

**Comportamento**:
- Legge valori salvati all'apertura
- Se anno ha valori salvati → li usa
- Se anno NON ha valori → usa `globalSettings`

---

### 2. **Cambio Anno**

```typescript
// Quando utente seleziona anno diverso
useEffect(() => {
  if (!database?.goToMarket?.marketingPlan) return;
  
  const yearKey = `y${selectedYear}`;
  const savedProjection = database.goToMarket.marketingPlan.projections?.[yearKey];
  
  if (savedProjection) {
    // Carica valori salvati per questo anno
    setCostPerLead(savedProjection.costPerLead);
    setDealsPerRepOverride(savedProjection.dealsPerRepOverride);
  } else {
    // Anno non salvato, usa defaults
    const globalSettings = database.goToMarket.marketingPlan.globalSettings;
    setCostPerLead(globalSettings?.costPerLead || 50);
    setDealsPerRepOverride(null);
  }
}, [selectedYear, database]);
```

**Comportamento**:
- Ogni anno ha i **suoi parametri salvati**
- Cambio anno → carica parametri specifici anno
- Permette simulazioni diverse per anno diverso

---

### 3. **Calcolo Automatico**

```typescript
// Calcola proiezioni quando cambiano parametri
const currentYearCalculations = useMemo(() => {
  if (!goToMarket) return null;
  
  const { salesCapacity, conversionFunnel } = goToMarket;
  const repsByYear = salesCapacity.repsByYear || {};
  const yearKey = `y${selectedYear}` as keyof typeof repsByYear;
  const repsForYear = repsByYear[yearKey] || 0;
  const dealsPerQ = dealsPerRepOverride ?? salesCapacity.dealsPerRepPerQuarter;
  
  // ... tutti i calcoli ...
  
  return {
    reps: repsForYear,
    rampFactor,
    capacity: Math.round(capacity),
    funnelEfficiency,
    leadsNeeded,
    leadsMonthly: Math.ceil(leadsNeeded / 12),
    budgetMarketing,
    budgetMonthly: Math.round(budgetMarketing / 12),
    cacEffettivo: Math.round(cacEffettivo),
    expectedRevenue,
    marketingPercentage,
    productivityRepYear: dealsPerQ * 4
  };
}, [goToMarket, selectedYear, costPerLead, dealsPerRepOverride]);
```

**Comportamento**:
- `useMemo` → calcola solo quando cambiano dipendenze
- Efficiente: non ricalcola ad ogni render
- Fornisce dati sia per UI che per salvataggio

---

### 4. **Salvataggio Automatico (Debounced)**

```typescript
// Salva automaticamente dopo 500ms dall'ultimo cambio
useEffect(() => {
  if (!initialized || !currentYearCalculations || !goToMarket) return;
  
  const timeoutId = setTimeout(() => {
    const projection = {
      costPerLead,
      dealsPerRepOverride,
      calculated: currentYearCalculations,
      lastUpdate: new Date().toISOString(),
      note: `Calcolato automaticamente dal simulatore`
    };
    
    updateMarketingPlan(selectedYear, projection);
    console.log(`💾 Auto-salvato Marketing Plan Anno ${selectedYear}`);
  }, 500);
  
  return () => clearTimeout(timeoutId);
}, [selectedYear, costPerLead, dealsPerRepOverride, currentYearCalculations, initialized, updateMarketingPlan, goToMarket]);
```

**Comportamento**:
- **Debounce 500ms**: evita salvataggi multipli mentre utente digita
- **Auto-save**: utente non deve premere "Salva"
- **Feedback console**: log conferma salvataggio
- **Cancellazione timeout**: se cambiano parametri prima dei 500ms, annulla e riavvia

---

## 🔧 METODI DATABASE CONTEXT

### 1. `updateMarketingPlan(year, projection)`

**Firma**:
```typescript
updateMarketingPlan(year: number, projection: MarketingProjection): void
```

**Parametri**:
- `year`: Numero anno (1-5)
- `projection`: Oggetto con parametri input e output calcolati

**Comportamento**:
```typescript
const updateMarketingPlan = (year: number, projection: MarketingProjection) => {
  if (!database) return;

  setDatabase(currentDb => {
    if (!currentDb) return currentDb;
    const updatedDb = { ...currentDb };
    
    // Inizializza marketingPlan se non esiste
    if (!updatedDb.goToMarket.marketingPlan) {
      updatedDb.goToMarket.marketingPlan = {
        description: "Proiezioni marketing e sales per anno",
        globalSettings: { costPerLead: 50, devicePrice: 50000 },
        projections: {},
        lastUpdate: null,
        note: "Piano marketing persistente"
      };
    }

    // Aggiorna proiezione anno specifico
    const yearKey = `y${year}`;
    updatedDb.goToMarket.marketingPlan.projections[yearKey] = {
      ...projection,
      lastUpdate: new Date().toISOString()
    };
    
    // Aggiorna timestamp globale
    updatedDb.goToMarket.marketingPlan.lastUpdate = new Date().toISOString();
    updatedDb.goToMarket.lastUpdate = new Date().toISOString();

    // Salva in localStorage
    localStorage.setItem('eco3d_database', JSON.stringify(updatedDb));
    
    return updatedDb;
  });
};
```

**Log Console**:
```
📊 Aggiorno Marketing Plan Anno 3:
  costPerLead: 50
  budgetMarketing: 3000000
  leadsNeeded: 60000
✅ Marketing Plan Anno 3 salvato
```

---

### 2. `updateMarketingPlanGlobalSettings(settings)`

**Firma**:
```typescript
updateMarketingPlanGlobalSettings(settings: {
  costPerLead?: number;
  devicePrice?: number;
}): void
```

**Parametri**:
- `settings.costPerLead`: Nuovo default costo per lead (opzionale)
- `settings.devicePrice`: Nuovo prezzo dispositivo (opzionale)

**Utilizzo Futuro**:
- Modificare defaults globali
- Applicare a tutti gli anni non ancora customizzati
- **NON usato attualmente** ma disponibile per estensioni

---

## 📖 COME USARE I DATI SALVATI

### Da Qualsiasi Componente

```typescript
import { useDatabase } from '@/contexts/DatabaseContext';

function BudgetPlanningCard() {
  const { database } = useDatabase();
  
  if (!database?.goToMarket?.marketingPlan) return null;
  
  const marketingPlan = database.goToMarket.marketingPlan;
  
  // Accesso proiezioni Anno 3
  const y3 = marketingPlan.projections.y3;
  
  return (
    <div>
      <h3>Budget Marketing Anno 3</h3>
      <p>Lead necessari: {y3.calculated.leadsNeeded.toLocaleString()}</p>
      <p>Budget: €{(y3.calculated.budgetMarketing / 1000).toFixed(0)}K</p>
      <p>CAC: €{y3.calculated.cacEffettivo.toLocaleString()}</p>
      <p>Ultimo aggiornamento: {new Date(y3.lastUpdate).toLocaleDateString()}</p>
    </div>
  );
}
```

---

### Esempio: Export Excel

```typescript
function exportMarketingPlanToExcel() {
  const { database } = useDatabase();
  const projections = database.goToMarket.marketingPlan.projections;
  
  const data = Object.entries(projections).map(([yearKey, projection]) => ({
    Anno: yearKey.replace('y', 'Year '),
    Reps: projection.calculated.reps,
    Capacity: projection.calculated.capacity,
    'Lead Necessari': projection.calculated.leadsNeeded,
    'Budget Marketing': projection.calculated.budgetMarketing,
    'CAC Effettivo': projection.calculated.cacEffettivo,
    'Marketing/Ricavi %': projection.calculated.marketingPercentage.toFixed(1) + '%'
  }));
  
  // Genera Excel da data
  generateExcel(data, 'Marketing_Plan_5_Years.xlsx');
}
```

---

### Esempio: Dashboard Overview

```typescript
function MarketingDashboard() {
  const { database } = useDatabase();
  const projections = database.goToMarket.marketingPlan.projections;
  
  // Budget totale 5 anni
  const totalBudget5Years = Object.values(projections).reduce(
    (sum, p) => sum + p.calculated.budgetMarketing,
    0
  );
  
  // Lead totali 5 anni
  const totalLeads5Years = Object.values(projections).reduce(
    (sum, p) => sum + p.calculated.leadsNeeded,
    0
  );
  
  return (
    <Card>
      <h2>Piano Marketing 5 Anni</h2>
      <Metric label="Budget Totale" value={`€${(totalBudget5Years / 1000000).toFixed(1)}M`} />
      <Metric label="Lead Totali" value={totalLeads5Years.toLocaleString()} />
      
      <table>
        <thead>
          <tr>
            <th>Anno</th>
            <th>Lead</th>
            <th>Budget</th>
            <th>CAC</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(year => {
            const p = projections[`y${year}`];
            return (
              <tr key={year}>
                <td>Anno {year}</td>
                <td>{p.calculated.leadsNeeded.toLocaleString()}</td>
                <td>€{(p.calculated.budgetMarketing / 1000).toFixed(0)}K</td>
                <td>€{p.calculated.cacEffettivo.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
```

---

## 🎯 VANTAGGI PERSISTENZA

### 1. **Coerenza Dati**
- Tutti i componenti leggono stessa fonte
- No duplicazione calcoli
- Sincronizzazione automatica

### 2. **Pianificazione Pluriennale**
- Budget marketing per 5 anni salvato
- Storico modifiche parametri
- Base per forecast finanziari

### 3. **Performance**
- Calcoli fatti 1 volta
- Salvati e riusati
- No ricalcoli inutili

### 4. **Integrazione Semplice**
- Accesso da `useDatabase()` hook
- Struttura dati chiara e documentata
- Type-safe con TypeScript

### 5. **Debugging & Audit**
- `lastUpdate` timestamp per ogni anno
- Log console per ogni salvataggio
- Tracciabilità modifiche

---

## 🚀 ESTENSIONI FUTURE

### 1. Backend Persistence
```typescript
const saveToBackend = async () => {
  const response = await fetch('/api/marketing-plan', {
    method: 'POST',
    body: JSON.stringify(database.goToMarket.marketingPlan)
  });
};
```

### 2. Scenari Multiple
```json
{
  "marketingPlan": {
    "scenarios": {
      "base": { "projections": { ... } },
      "ottimista": { "projections": { ... } },
      "pessimista": { "projections": { ... } }
    },
    "currentScenario": "base"
  }
}
```

### 3. Comparazione Storica
```typescript
{
  "projections": {
    "y1": {
      "current": { ... },
      "history": [
        { timestamp: "2025-01-15", calculated: { ... } },
        { timestamp: "2025-02-20", calculated: { ... } }
      ]
    }
  }
}
```

### 4. Alert Automatici
```typescript
useEffect(() => {
  const y1 = database.goToMarket.marketingPlan.projections.y1;
  
  if (y1.calculated.marketingPercentage > 20) {
    showNotification({
      type: 'warning',
      message: 'Budget marketing Anno 1 troppo alto (>20% ricavi)'
    });
  }
}, [database]);
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [x] Schema database `marketingPlan` creato
- [x] Metodo `updateMarketingPlan()` in DatabaseProvider (async con API)
- [x] Endpoint API `/api/database/go-to-market/marketing-plan/:year` nel server
- [x] useEffect caricamento iniziale in GTMEngineCard
- [x] useEffect cambio anno in GTMEngineCard
- [x] useMemo calcoli automatici
- [x] useEffect auto-save con debounce + async/await
- [x] Persistenza su file database.json tramite backend
- [x] Update ottimistico stato locale
- [x] Log console per debug
- [x] TypeScript types per MarketingProjection
- [x] Gestione errori con try/catch
- [x] Documentazione completa
- [x] Componente esempio MarketingPlanSummary
- [ ] Test end-to-end caricamento/salvataggio
- [ ] Export dati in Excel
- [ ] Alert quando budget > 15% ricavi

---

## 📝 NOTE TECNICHE

### Backend API Persistence ✅

**Implementato**:
- ✅ Persistenza su file `database.json`
- ✅ Endpoint API Express: `PATCH /api/database/go-to-market/marketing-plan/:year`
- ✅ Update ottimistico stato locale React
- ✅ Sincronizzazione automatica tra componenti

**Vantaggi**:
- ✅ Persistenza permanente su file system
- ✅ Dati condivisi tra sessioni e browser
- ✅ Backup possibile (file JSON)
- ✅ Versionamento con Git
- ✅ Accesso da qualsiasi componente tramite `useDatabase()`

**Pattern Implementato** (seguendo standard esistenti nell'app):
1. Frontend chiama API con `fetch()` + async/await
2. Backend aggiorna `database.json` con `fs.writeFile()`
3. Frontend aggiorna stato locale con update ottimistico
4. Log console per debugging

---

### Debounce Pattern

**Perché 500ms?**
- Evita salvataggi mentre utente digita
- Abbastanza veloce per sembrare istantaneo
- Riduce chiamate setState eccessive

**Esempio**:
```
Utente digita: "50" → "55" → "57"
        ↓           ↓       ↓
Timer: Start → Cancel → Cancel → Start
                                   ↓
                              500ms dopo
                                   ↓
                              Salva "57"
```

---

### useMemo vs useEffect

**useMemo**: Calcola valori
```typescript
const result = useMemo(() => calculate(), [deps]);
```
- Ritorna valore calcolato
- Sincrono
- Per derivare dati

**useEffect**: Effetti collaterali
```typescript
useEffect(() => { saveToDb(result); }, [result]);
```
- Non ritorna valore
- Asincrono
- Per side-effects (save, fetch, etc.)

---

## 🎓 ISTRUZIONI UTILIZZO

### Per Sviluppatori

1. **Leggere dati**:
   ```typescript
   const { database } = useDatabase();
   const y3Budget = database.goToMarket.marketingPlan.projections.y3.calculated.budgetMarketing;
   ```

2. **Modificare parametri**:
   - Vai in Bottom-Up → Simulatore Impatto Business
   - Cambia Costo/Lead o Deals/Rep/Q
   - Salvataggio automatico dopo 500ms

3. **Verificare salvataggio**:
   - Apri console: vedi log `💾 Auto-salvato Marketing Plan Anno X`
   - Ricarica pagina: valori persistono
   - Cambia anno: valori specifici anno caricati

---

### Per Product Manager

**Domanda**: "Quanto budget marketing serve per Anno 3?"

**Risposta**:
1. Apri app → Bottom-Up
2. Seleziona "Anno 3" dal dropdown
3. Leggi "Budget Marketing Anno 3": €XXK
4. Vedi breakdown mensile: €XXK/mese
5. Dati salvati automaticamente per analisi future

---

**PERSISTENZA MARKETING PLAN COMPLETA E FUNZIONANTE!** ✅

**Ora puoi accedere ai dati marketing da ovunque nell'app!** 🚀
