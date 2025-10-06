# 🎮 SISTEMA MERCATO ECO 3D - IMPLEMENTAZIONE COMPLETA

> **Sistema centralizzato di gestione dati mercato con scenari salvabili**  
> Come un videogioco: salva, carica, sperimenta!

---

## ✅ SISTEMA IMPLEMENTATO

### 📁 File Creati

```
✅ src/types/mercato.types.ts           (410 righe)
   └─ Tutte le definizioni TypeScript
   └─ 15+ interfacce complete
   └─ Enums, type guards, validatori

✅ src/contexts/MercatoContext.tsx      (850 righe)
   └─ Context React per stato globale
   └─ Gestione scenari completa
   └─ Persistenza localStorage automatica
   └─ Undo/Redo system (50 livelli)
   └─ Export/Import JSON

✅ src/lib/mercato-utils.ts             (450 righe)
   └─ 50+ utility functions
   └─ Calcoli, validazioni, formattazioni
   └─ Parser Excel, aggregazioni
   └─ Debug helpers

✅ MERCATO_MASTER_MAPPING.md            (Documentazione)
   └─ Guida completa navigazione dati
   └─ Esempi pratici utilizzo
   └─ Riferimenti rapidi
```

---

## 🏗️ ARCHITETTURA SISTEMA

```
┌─────────────────────────────────────────────┐
│         EXCEL FILES (Sorgente Dati)        │
│  - ECO_DatiMercato.xlsx                    │
│  - ECO_Proiezioni_Ecografi_2025_2030.xlsx │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      TYPES (mercato.types.ts)              │
│  Single Source of Truth per definizioni    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      CONTEXT (MercatoContext.tsx)          │
│  - Stato centralizzato                     │
│  - Calcoli derivati (memoized)             │
│  - Azioni per modifiche                    │
│  - Sistema scenari                         │
│  - Persistenza automatica                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      UTILS (mercato-utils.ts)             │
│  Helper functions pure                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      UI COMPONENTS                         │
│  - MercatoEcografi.tsx (da convertire)    │
│  - Charts, Tables, Controls                │
└─────────────────────────────────────────────┘
```

---

## 🎯 FUNZIONALITÀ CHIAVE

### 1. ⚙️ GESTIONE CONFIGURAZIONE

```typescript
// Modifica parametri in tempo reale
azioni.impostaAnnoTarget(2028);
azioni.impostaMarketShare(1.5);
azioni.impostaRegioniVisibili(new Set(['Italia', 'Europa']));
azioni.impostaScenarioParco('alto');

// Risultato immediato
const { unitaTargetEco3D } = calcolati;
```

**Parametri Modificabili**:
- 📅 Anno target (2025-2035)
- 📊 Market share % (0-100)
- 🌍 Regioni selezionate (checkbox)
- 📈 Scenario parco IT (basso/centrale/alto)
- 🎨 Tipologie target
- 👁️ Visibilità UI

### 2. 💾 SISTEMA SCENARI

```typescript
// SALVA configurazione corrente
const id = azioni.salvaScenario(
  'Espansione Europa 2028',
  'Scenario aggressivo con focus Europa',
  ['Europa', 'Aggressivo']
);

// CARICA scenario salvato
azioni.caricaScenario(id);

// DUPLICA per varianti
const idCopia = azioni.duplicaScenario(id, 'Europa 2028 - Variante');

// EXPORT file JSON
const json = azioni.esportaScenario(id);
downloadFile(json, 'scenario.json');

// IMPORT da file
const nuovoId = azioni.importaScenario(jsonString);
```

**Casi d'Uso**:
1. **Presentazione investitori**: Scenari ottimista/conservativo/realista
2. **Analisi sensitivity**: Testa impatto variazioni parametri
3. **Versioning**: Mantieni storico configurazioni
4. **Collaborazione**: Condividi scenari via JSON

### 3. ♻️ UNDO/REDO

```typescript
// Fai modifiche
azioni.impostaAnnoTarget(2028);
azioni.impostaMarketShare(2.0);

// Annulla
azioni.undo(); // Torna indietro 1 step
azioni.undo(); // Torna indietro ancora

// Ripristina
azioni.redo(); // Avanti 1 step

// Check disponibilità
if (azioni.canUndo) { /* mostra bottone */ }
if (azioni.canRedo) { /* mostra bottone */ }
```

**Capacità**: 50 livelli di history

### 4. 🧮 CALCOLI AUTOMATICI

```typescript
// Tutti i calcoli derivati sempre aggiornati
const {
  mercatoGlobaleTarget,      // M$ mondo anno target
  mercatoItaliaTarget,        // M$ Italia anno target
  unitaTargetRegioni,         // Unità totali regioni × market share
  unitaTargetEco3D,           // Target finale Eco 3D
  parcoDispositiviTarget,     // Parco IT per scenario
  totaliRegioniSelezionate,   // Aggregati regioni
  chartData                   // Dati pronti per grafici
} = calcolati;
```

**Formule Implementate**:
- Target unità con market share
- Interpolazione anno intermedio
- Proiezioni con CAGR
- Aggregazioni regioni (escludendo Mondo)
- CAGR medio ponderato

### 5. 💿 PERSISTENZA AUTOMATICA

```typescript
// Salvataggio automatico ogni 1 secondo (debounced)
// Nessuna azione richiesta!

// Caricamento automatico all'avvio
// Recupera ultimo stato salvato

// Puoi forzare manualmente
azioni.salvaSuLocalStorage();
azioni.caricaDaLocalStorage();
```

**Storage Keys**:
- `eco3d_mercato_stato`: Configurazione + dati
- `eco3d_mercato_scenari`: Collection scenari salvati

---

## 🚀 QUICK START

### Setup (1 minuto)

```tsx
// 1. Wrap app con Provider
import { MercatoProvider } from '@/contexts/MercatoContext';

export default function App({ children }) {
  return (
    <MercatoProvider>
      {children}
    </MercatoProvider>
  );
}
```

### Uso Base

```tsx
import { useMercato } from '@/contexts/MercatoContext';

function Dashboard() {
  const { stato, calcolati, azioni } = useMercato();
  
  return (
    <div>
      <h1>Target Eco 3D</h1>
      <p>{calcolati.unitaTargetEco3D} unità</p>
      
      <button onClick={() => azioni.impostaMarketShare(2.0)}>
        Imposta 2% Market Share
      </button>
      
      <button onClick={() => azioni.salvaScenario('Snapshot')}>
        💾 Salva Configurazione
      </button>
    </div>
  );
}
```

### Uso Ottimizzato (no re-render)

```tsx
// Solo azioni
const azioni = useMercatoAzioni();

// Solo calcolati
const calcolati = useMercatoCalcolati();

// Solo scenari
const { scenari, salvaScenario } = useMercatoScenari();
```

---

## 📊 DATI DISPONIBILI

### Stato Base (da Excel)
- ✅ 5 tipologie ecografi (Carrellati, Portatili, Palmari, Premium, POCUS)
- ✅ 7 anni proiezioni Italia (2024-2030, estendibile a 2035)
- ✅ 6 anni quote tipologie (2025-2030)
- ✅ 11 anni parco dispositivi IT (2025-2035, 3 scenari)
- ✅ 5 regioni numero ecografi (+ Mondo come riferimento)
- ✅ 5 regioni valori mercato con CAGR

### Configurazione Utente
- ✅ Anno target dinamico
- ✅ Regioni selezionabili
- ✅ Market share % modificabile
- ✅ Scenario parco IT switchabile
- ✅ Tipologie target toggle
- ✅ Visibilità grafici/sezioni

### Calcoli Derivati
- ✅ Target unità per anno
- ✅ Valori mercato aggregati
- ✅ CAGR medio ponderato
- ✅ Totali per regioni selezionate
- ✅ Chart data formattati

---

## 🎮 ESEMPI SCENARI

### Scenario 1: Conservativo Italia
```typescript
{
  nome: "Conservativo Italia 2030",
  configurazione: {
    annoTarget: 2030,
    regioniVisibili: ['Italia'],
    marketShareTarget: 0.5,
    scenarioParcoIT: 'basso'
  }
}
→ ~35 unità target
→ Focus: mercato domestico
→ Rischio: minimo
```

### Scenario 2: Espansione Europa
```typescript
{
  nome: "Espansione Europa 2028",
  configurazione: {
    annoTarget: 2028,
    regioniVisibili: ['Italia', 'Europa'],
    marketShareTarget: 0.8,
    scenarioParcoIT: 'centrale'
  }
}
→ ~360 unità target
→ Focus: Italia + Europa
→ Rischio: medio
```

### Scenario 3: Aggressivo Globale
```typescript
{
  nome: "Aggressivo Globale 2030",
  configurazione: {
    annoTarget: 2030,
    regioniVisibili: ['Italia', 'Europa', 'Stati Uniti', 'Cina'],
    marketShareTarget: 1.5,
    scenarioParcoIT: 'alto'
  }
}
→ ~1,934 unità target
→ Focus: 4 mercati principali
→ Rischio: alto, reward alto
```

---

## 🔗 INTEGRAZIONE PIANO FINANZIARIO

### Fase 1: Import Dati Mercato

```typescript
// In FinanziarioContext
import { useMercato } from '@/contexts/MercatoContext';

function useIntegrazioneMercato() {
  const { calcolati } = useMercato();
  
  return {
    unitaVendita: calcolati.unitaTargetEco3D,
    mercatoTAM: calcolati.mercatoGlobaleTarget,
    mercatoSAM: calcolati.totaliRegioniSelezionate.valore2030,
    // ... altri dati
  };
}
```

### Fase 2: Calcoli Ricavi

```typescript
// Ricavi Hardware (CapEx)
const ricaviHardware = unitaVendita * prezzoUnitario * capexShare;

// Ricavi SaaS (Ricorrenti)
const MRR = unitaVendita * ARPA;
const ricaviSaaS = MRR * 12;

// Totale
const ricaviTotali = ricaviHardware + ricaviSaaS;
```

### Fase 3: Scenari Finanziari

```typescript
// Scenario mercato → Scenario finanziario
function creaScenarioFinanziario(scenarioMercatoId: string) {
  // Carica scenario mercato
  azioni.caricaScenario(scenarioMercatoId);
  
  // Usa dati per calcoli finanziari
  const unitaTarget = calcolati.unitaTargetEco3D;
  const ricavi = calcolaRicavi(unitaTarget);
  const costi = calcolaCosti(unitaTarget);
  const ebitda = ricavi - costi;
  
  return { ricavi, costi, ebitda, /* ... */ };
}
```

---

## ⚠️ BEST PRACTICES

### ✅ DO

1. **Usa Context per tutto lo stato mercato**
   ```tsx
   const { stato, azioni } = useMercato();
   ```

2. **Sfrutta calcoli memoizzati**
   ```tsx
   const { calcolati } = useMercato(); // Sempre aggiornati
   ```

3. **Salva scenari importanti**
   ```tsx
   azioni.salvaScenario('Milestone Q1');
   ```

4. **Filtra sempre Mondo (globale)**
   ```tsx
   regioni.filter(r => r.mercato !== 'Mondo (globale)')
   ```

5. **Valida input utente**
   ```tsx
   if (isMarketShareValido(value)) {
     azioni.impostaMarketShare(value);
   }
   ```

### ❌ DON'T

1. **Non duplicare stato**
   ```tsx
   // ❌ SBAGLIATO
   const [annoTarget, setAnnoTarget] = useState(2030);
   
   // ✅ CORRETTO
   const { stato } = useMercato();
   const annoTarget = stato.configurazione.annoTarget;
   ```

2. **Non modificare stato direttamente**
   ```tsx
   // ❌ SBAGLIATO
   stato.configurazione.annoTarget = 2028;
   
   // ✅ CORRETTO
   azioni.impostaAnnoTarget(2028);
   ```

3. **Non sommare Mondo con altre regioni**
   ```tsx
   // ❌ SBAGLIATO
   const totale = numeroEcografi.reduce(...);
   
   // ✅ CORRETTO
   const totale = calcolaUnitaTotali(numeroEcografi, regioni, anno);
   ```

4. **Non fare calcoli manuali**
   ```tsx
   // ❌ SBAGLIATO
   const target = regioni.reduce(...) * marketShare / 100;
   
   // ✅ CORRETTO
   const target = calcolati.unitaTargetEco3D;
   ```

---

## 📈 ROADMAP FUTURA

### Completamento Mercato
- [ ] Convertire MercatoEcografi.tsx per usare Context
- [ ] Aggiungere grafici con dati calcolati
- [ ] UI gestione scenari (lista, load, delete)
- [ ] Export PDF reports

### Integrazione Finanziario
- [ ] Creare FinanziarioContext
- [ ] Collegare dati mercato → ricavi
- [ ] Modello SaaS completo
- [ ] Calcolo metriche (CAC, LTV, etc.)

### Features Avanzate
- [ ] Sensitivity analysis automatica
- [ ] Monte Carlo simulation
- [ ] Confronto scenari side-by-side
- [ ] Timeline scenari con versioning
- [ ] API REST per scenari condivisi

---

## 🎓 CONCLUSIONE

Hai ora un **sistema completo e professionale** per:

✅ **Centralizzare** tutti i dati di mercato  
✅ **Modificare** parametri in tempo reale  
✅ **Salvare** scenari illimitati  
✅ **Caricare** configurazioni salvate  
✅ **Esportare/Importare** via JSON  
✅ **Undo/Redo** modifiche  
✅ **Persistenza automatica** localStorage  
✅ **Calcoli derivati** sempre aggiornati  
✅ **Type-safe** con TypeScript  
✅ **Documentato** completamente  

**Pronto per costruire il piano finanziario sopra questa base solida! 🚀**

---

**Creato**: 2025-01-05  
**Files**: 4 nuovi file + documentazione  
**Righe codice**: ~1,700  
**Tempo implementazione**: ~2 ore  
**Prossimo step**: Convertire UI per usare Context
