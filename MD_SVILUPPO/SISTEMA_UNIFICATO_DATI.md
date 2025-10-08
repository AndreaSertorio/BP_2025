# 📊 Sistema Unificato di Gestione Dati - Financial Dashboard Eco 3D

**Data:** 8 Ottobre 2025  
**Versione:** 1.0

---

## 🎯 Concetto Fondamentale: Single Source of Truth

Il sistema è basato su un'architettura **centralizzata** dove **tutti i dati risiedono in un unico file JSON**.

### 📍 Il Database Centrale

**File:** `/financial-dashboard/public/data/database.json`

Contiene TUTTI i dati dell'applicazione:
- Dati di mercato (SAM, TAM, proiezioni regionali)
- Budget dettagliato (categorie, voci, valori trimestrali)
- Configurazioni scenari finanziari
- Metriche di performance

**Vantaggi:**
- ✅ **Consistenza**: Tutti vedono sempre gli stessi dati
- ✅ **Sincronizzazione**: Modifiche visibili immediatamente ovunque
- ✅ **Backup facile**: Un solo file da salvare/versionare
- ✅ **No duplicazioni**: Nessun dato ridondante
- ✅ **Tracciabilità**: Git traccia ogni modifica

---

## 🏗️ Architettura del Sistema

```
┌─────────────────────────────────────────┐
│         DATABASE.JSON                    │
│    (Single Source of Truth)             │
│  {                                      │
│    "market": { ... },                  │
│    "budget": { ... },                  │
│  }                                      │
└──────────────┬──────────────────────────┘
               │
               ↓
      ┌────────────────┐
      │  API Routes    │
      └────────┬───────┘
               │
      ┌────────┴────────┐
      │                 │
      ↓                 ↓
┌──────────┐      ┌──────────┐
│  MERCATO │◄────►│  BUDGET  │
│          │      │          │
│ Legge    │      │ Legge    │
│ Visualizza│     │ Modifica │
└──────────┘      └──────────┘
   Stesso Database!
```

---

## 📈 TAB MERCATO - Analisi Ecografi

### 🎯 Funzionalità

Fornisce **analisi completa del mercato ecografico italiano** con:
- Dati regionali dettagliati (20 regioni)
- Proiezioni 2025-2035
- 3 grafici interattivi per regione
- Segmentazione per tipo struttura

### 📊 Struttura Dati

```json
{
  "market": {
    "ecografiData": {
      "national": {
        "totalEcografi": 12000,
        "ecografiPerAbitante": 0.2
      },
      "regions": [
        {
          "name": "Lombardia",
          "totalEcografi": 2156,
          "ospedaliPubblici": 1510,
          "clinichePrivate": 433,
          "studiMedici": 213
        }
      ],
      "projections": {
        "2025": { "value": 12000 },
        "2026": { "value": 12300 }
      }
    }
  }
}
```

### 🏛️ Organizzazione

**4 Tabs Regionali:**
- **Italia**: Vista nazionale aggregata
- **Nord**: Lombardia, Piemonte, Veneto, Emilia-Romagna, Liguria, Friuli
- **Centro**: Lazio, Toscana, Marche, Umbria, Abruzzo, Molise
- **Sud**: Campania, Puglia, Sicilia, Calabria, Basilicata, Sardegna

**3 Grafici per Regione:**
1. 📊 **Distribuzione Ecografi** - Bar Chart comparativo
2. 📈 **Proiezione 2025-2035** - Line Chart crescita
3. 🥧 **Segmentazione Tipo** - Pie Chart distribuzione %

**Features:**
- Dati READ-ONLY (non modificabili)
- Calcoli automatici (pro capite, percentuali)
- Sincronizzati con database centrale

---

## 💰 TAB BUDGET - Gestione Budget Aziendale

### 🎯 Funzionalità

Sistema **completo di gestione budget** con:
- Tabella editabile con valori trimestrali
- Pannello controlli unificato
- Calcolo automatico totali annuali
- Persistenza istantanea modifiche
- 2 grafici analitici

### 📊 Struttura Dati

```json
{
  "budget": {
    "periods": [
      { "id": "q1_25", "quarter": 1, "year": 2025 },
      { "id": "tot_25", "year": 2025, "type": "year_total" }
    ],
    
    "categories": [
      {
        "id": "cat_01",
        "name": "Costi del Personale",
        "subcategories": [
          {
            "id": "subcat_01_01",
            "name": "Amministrazione",
            "items": [
              {
                "id": "item_01_01_01",
                "description": "Stipendi fissi",
                "isEditable": true,
                "values": {
                  "q1_25": 25000,
                  "q2_25": 25000
                }
              }
            ]
          }
        ]
      }
    ],
    
    "allItems": [ /* array piatto */ ]
  }
}
```

### 🎛️ Pannello Controlli Unificato

```
┌──────────────────────────────────────────────┐
│ 📊 Tabella Budget Dettagliata               │
├──────────────┬──────────────┬────────────────┤
│ COLONNE      │ RIGHE        │ ANNI (destra) │
│──────────────│──────────────│───────────────│
│ [📊 Tutto]   │ [⬇️ Espandi] │ [2025][2026]  │
│ [📅 Trimestr]│ [⬆️ Comprimi]│ [2027][2028]  │
│ [📈 Totali]  │              │               │
└──────────────┴──────────────┴────────────────┘
```

**1. Visualizzazione Colonne:**
- **📊 Tutto**: Trimestri + totali annuali
- **📅 Solo Trimestri**: Nasconde totali
- **📈 Solo Totali**: Solo totali annuali

**2. Visualizzazione Righe:**
- **⬇️ Espandi Tutto**: Apre tutte le categorie
- **⬆️ Comprimi Tutto**: Chiude tutte

**3. Anni da Visualizzare:**
- Selezione multipla (minimo 1)
- Click per toggle on/off
- Filtra colonne dinamicamente

### 📝 Sistema di Editing

**Flusso completo:**

```
1. User clicca cella editabile
   ↓
2. Appare input con valore corrente
   ↓
3. User modifica e preme INVIO
   ↓
4. API salva su database.json
   ↓
5. updateBudgetData() aggiorna stato React
   ↓
6. Tabella si aggiorna SENZA ricaricare
   ↓
7. Scroll rimane esattamente dove era
```

**Codice chiave:**

```typescript
async function saveValue(itemId, periodId, value) {
  // 1. Salva su database.json via API
  await budgetService.updateItemValue(itemId, periodId, value);
  
  // 2. Aggiorna stato React (immutabile)
  updateBudgetData(itemId, periodId, value);
}
```

### 🔑 Update Immutabile - Il Segreto

**Problema:** BudgetData ha DUE strutture:
1. `allItems[]` - array piatto
2. `categories[].subcategories[].items[]` - gerarchica

La tabella legge dalla struttura **gerarchica**, quindi ENTRAMBE devono essere aggiornate!

**Soluzione:**

```typescript
function updateBudgetData(itemId, periodId, value) {
  setBudgetData(currentData => {
    return {
      ...currentData,
      
      // Aggiorna allItems
      allItems: currentData.allItems.map(item => 
        item.id === itemId 
          ? { ...item, values: { ...item.values, [periodId]: value }}
          : item
      ),
      
      // Aggiorna categories (FONDAMENTALE!)
      categories: currentData.categories.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => ({
          ...sub,
          items: sub.items.map(item => 
            item.id === itemId
              ? { ...item, values: { ...item.values, [periodId]: value }}
              : item
          )
        }))
      }))
    };
  });
}
```

**Perché funziona:**
- ✅ Usa setState **callback** (sempre ultimo stato)
- ✅ Crea **nuovo oggetto** (React rileva cambiamento)
- ✅ Aggiorna **entrambe** le strutture
- ✅ Nessun reload database (scroll preservato)

### 📊 Calcolo Totali Automatici

```typescript
// Totali NON sono salvati, sono CALCOLATI in tempo reale
const yearTotal = 
  (item.values[`q1_${year}`] || 0) +
  (item.values[`q2_${year}`] || 0) +
  (item.values[`q3_${year}`] || 0) +
  (item.values[`q4_${year}`] || 0);
```

### 📊 Grafici Budget

**1. Budget per Categoria (Bar Chart)**
- Confronto budget per categoria su 4 anni
- Colori distintivi per anno

**2. Andamento Trimestrale (Line Chart)**
- Trend budget totale Q1 2025 → Q4 2026
- Visualizzazione crescita trimestrale

---

## 🔐 API Routes - Persistenza

**Endpoint:** `POST /api/budget/update`

```typescript
export async function POST(request: Request) {
  const { itemId, periodId, value } = await request.json();
  
  // 1. Leggi database.json
  const database = JSON.parse(fs.readFileSync(dbPath));
  
  // 2. Aggiorna allItems
  database.budget.allItems.forEach(item => {
    if (item.id === itemId) {
      item.values[periodId] = value;
    }
  });
  
  // 3. Aggiorna categories
  database.budget.categories.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.items.forEach(item => {
        if (item.id === itemId) {
          item.values[periodId] = value;
        }
      });
    });
  });
  
  // 4. Salva database.json
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
  
  return Response.json({ success: true });
}
```

---

## 🎨 Context Pattern

**BudgetContext** gestisce lo stato globale:

```typescript
interface BudgetContextType {
  budgetData: BudgetData | null;
  budgetService: BudgetService | null;
  updateBudgetData: (itemId, periodId, value) => void;
}

export function BudgetProvider({ children }) {
  const [budgetData, setBudgetData] = useState(null);
  
  // Carica all'avvio
  useEffect(() => {
    fetch('/data/database.json')
      .then(res => res.json())
      .then(db => setBudgetData(db.budget));
  }, []);
  
  // Service ricreato solo quando dati cambiano
  const budgetService = useMemo(
    () => budgetData ? new BudgetService(budgetData) : null,
    [budgetData]
  );
  
  return (
    <BudgetContext.Provider value={{...}}>
      {children}
    </BudgetContext.Provider>
  );
}
```

**Uso nei componenti:**

```typescript
function BudgetTable() {
  const { budgetData, updateBudgetData } = useBudget();
  // Usa dati e funzioni del context
}
```

---

## 🔄 Sincronizzazione Completa

### All'avvio
```
App carica → Context fetch database.json → 
Componenti ricevono dati → Renderizzano
```

### Dopo modifica
```
User modifica → API aggiorna database.json → 
updateBudgetData() aggiorna stato → 
Componenti si aggiornano automaticamente
```

### Cambio tab
```
User clicka tab → Component usa budgetData dal Context → 
Renderizza con dati aggiornati (già in memoria)
```

---

## 🐛 Problemi Risolti

### ❌ Scroll torna in cima

**Causa:** `refreshData()` ricaricava tutto causando remount.

**Soluzione:** Update immutabile senza reload.

### ❌ Valore non appare dopo edit

**Causa:** Aggiornavo solo `allItems`, tabella legge da `categories`.

**Soluzione:** Aggiornare ENTRAMBE le strutture.

### ❌ Valore "stale"

**Causa:** `budgetData` era snapshot vecchio.

**Soluzione:** `setState(currentData => ...)` con callback.

---

## 📂 Struttura File

```
financial-dashboard/
│
├── public/data/
│   └── database.json              ← 🎯 SINGLE SOURCE
│
├── src/
│   ├── app/api/budget/update/
│   │   └── route.ts               ← API update
│   │
│   ├── components/
│   │   ├── BudgetWrapper.tsx      ← Budget completo
│   │   └── EcografiDashboard.tsx  ← Mercato
│   │
│   ├── contexts/
│   │   └── BudgetContext.tsx      ← Stato globale
│   │
│   ├── lib/
│   │   └── budget-service.ts      ← Logica business
│   │
│   └── types/
│       └── budget.types.ts        ← TypeScript types
```

---

## ✅ Best Practices

1. **Immutabilità**: Sempre nuovi oggetti, mai mutare direttamente
2. **Single Source**: database.json è l'unica fonte
3. **Separation of Concerns**: Context/Service/Component separati
4. **Controlled Components**: React controlla sempre i valori
5. **Optimistic UI**: Aggiorna UI immediatamente, salva in background

---

## 🎯 Vantaggi Sistema Unificato

1. **Consistenza Garantita**: Un solo database = Una sola verità
2. **Sincronizzazione Automatica**: Tutti i componenti sempre aggiornati
3. **Debugging Semplice**: Un posto dove guardare i dati
4. **Performance**: Update mirati senza reload completi
5. **Manutenibilità**: Modifiche in un posto si riflettono ovunque
6. **Versionamento**: Git traccia ogni modifica al database
7. **Backup**: Facile creare snapshot del sistema

---

**Fine Documentazione**

*Per dettagli implementazione vedi:*
- `IMPLEMENTAZIONE_TOTALI_AUTOMATICI.md`
- `FIX_PERSISTENZA_VALORI_BUDGET.md`
- `STATUS_APPLICAZIONE.md`
