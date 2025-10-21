# 🔗 Integrazioni Sistema Completo - Eco 3D Dashboard

**Data:** 13 Ottobre 2025 00:45  
**Versione:** 1.3.0  
**Status:** 📋 ANALISI COMPLETA

---

## 🎯 Overview Sistema

Il dashboard finanziario Eco 3D è composto da:
- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Node.js Express Server (porta 3001)
- **Database**: JSON file persistente (`database.json`)
- **Componenti**: Timeline, Go-To-Market, Revenue Model, P&L, Balance Sheet

---

## ✅ Integrazioni Completate

### **1. Timeline Gantt** ✅

#### **Frontend**
- `TimelineView.tsx` - Componente principale
- `DatabaseProvider.tsx` - Context con CRUD task

#### **Backend API**
```
GET    /api/timeline/tasks       - Leggi tutti i task
GET    /api/timeline/categories  - Leggi categorie
POST   /api/timeline/task        - Crea nuovo task
PATCH  /api/timeline/task/:id    - Aggiorna task
DELETE /api/timeline/task/:id    - Elimina task
PATCH  /api/timeline/filters     - Aggiorna filtri
```

#### **Funzionalità**
- ✅ 6 viste temporali (6h, Giorno, Settimana, Mese, Trimestre, Anno)
- ✅ Editing date inline con date picker
- ✅ Editing costi inline
- ✅ Colonne ridimensionabili (150-600px)
- ✅ Toggle visibilità colonne
- ✅ Filtri per categoria
- ✅ Drag & drop barre Gantt
- ✅ Progress tracking
- ✅ Dependencies visualization

#### **Database Schema**
```json
{
  "timeline": {
    "tasks": [
      {
        "id": "task_001",
        "name": "PROTOTIPO 1",
        "start_date": "2025-04-01",
        "end_date": "2025-06-30",
        "progress": 100,
        "category": "cat_prototipo",
        "cost": 50000,
        "dependencies": [],
        "milestone": false
      }
    ],
    "categories": [...],
    "filters": {...}
  }
}
```

---

### **2. Go-To-Market Engine** ✅

#### **Frontend**
- Context: `DatabaseProvider.tsx`
- Hook: `updateGoToMarket()`

#### **Backend API**
```
PATCH /api/database/go-to-market - Aggiorna config GTM
```

#### **Funzionalità**
- ✅ Sales capacity configuration
- ✅ Conversion funnel settings
- ✅ Sales cycle duration
- ✅ Channel mix
- ✅ Adoption curve
- ✅ 3 scenari (Basso, Medio, Alto)

#### **Database Schema**
```json
{
  "goToMarket": {
    "enabled": true,
    "salesCapacity": {
      "avgDealsPerRep": 20,
      "rampUpMonths": 6,
      "repsByYear": {...}
    },
    "conversionFunnel": {
      "lead_to_demo": 0.05,
      "demo_to_pilot": 0.1,
      "pilot_to_deal": 0.2
    },
    "scenarios": {...}
  }
}
```

---

### **3. Marketing Plan** ✅ (NUOVO)

#### **Frontend**
- Type: `MarketingPlan` interface
- Type: `MarketingProjection` interface  
- Hook: `updateMarketingPlan(year, projection)`

#### **Backend API**
```
PATCH /api/database/go-to-market/marketing-plan/:year
```

**Esempio chiamata:**
```typescript
await fetch('http://localhost:3001/api/database/go-to-market/marketing-plan/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    costPerLead: 50,
    dealsPerRepOverride: null,
    calculated: {
      reps: 1,
      capacity: 15,
      leadsNeeded: 15000,
      budgetMarketing: 750000,
      cacEffettivo: 50000,
      ...
    }
  })
});
```

#### **Funzionalità**
- ✅ Proiezioni per anno (y1-y5)
- ✅ Parametri globali (costPerLead, devicePrice)
- ✅ Metriche calcolate automatiche
- ✅ Timestamp per tracking modifiche
- ✅ Persistenza automatica

#### **Database Schema**
```json
{
  "goToMarket": {
    "marketingPlan": {
      "description": "Proiezioni marketing e sales per anno",
      "globalSettings": {
        "costPerLead": 50,
        "devicePrice": 50000
      },
      "projections": {
        "y1": {
          "costPerLead": 50,
          "calculated": {
            "reps": 1,
            "budgetMarketing": 750000,
            "leadsNeeded": 15000,
            "cacEffettivo": 50000,
            ...
          },
          "lastUpdate": "2025-10-12T22:16:29.647Z"
        },
        "y2": {...},
        ...
      },
      "lastUpdate": "2025-10-12T22:16:29.647Z"
    }
  }
}
```

---

## 🔄 Integrazioni Necessarie

### **1. Simulatore Marketing ↔ Marketing Plan** 🔴 PRIORITARIO

#### **Problema**
Il simulatore marketing esiste ma non salva le proiezioni nel database.

#### **Soluzione**
```typescript
// In Simulatore Component
import { useDatabase } from '@/contexts/DatabaseProvider';

function SimulatoreMarketing() {
  const { updateMarketingPlan } = useDatabase();
  
  const handleCalculate = async (year: number, params: SimParams) => {
    // 1. Calcola proiezioni
    const projection = calculateProjections(params);
    
    // 2. Salva nel context (memoria)
    updateMarketingPlan(year, projection);
    
    // 3. Persisti su backend
    await fetch(`http://localhost:3001/api/database/go-to-market/marketing-plan/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projection)
    });
  };
}
```

#### **File da Modificare**
- Trovare componente Simulatore Marketing
- Aggiungere import `useDatabase()`
- Aggiungere chiamata `updateMarketingPlan()` dopo calcolo
- Aggiungere fetch API per persistenza

---

### **2. Marketing Plan → Revenue Model** 🟡 IMPORTANTE

#### **Problema**
Le proiezioni marketing non si integrano automaticamente nel Revenue Model.

#### **Soluzione**
Creare hook che legge `marketingPlan.projections` e popola parametri Revenue Model:

```typescript
// In RevenueModel Component
const { data } = useDatabase();
const marketingPlan = data?.goToMarket?.marketingPlan;

useEffect(() => {
  if (marketingPlan?.projections) {
    // Estrai leads/deals per anno
    const leadsY1 = marketingPlan.projections.y1?.calculated?.leadsNeeded;
    const dealsY1 = marketingPlan.projections.y1?.calculated?.capacity;
    
    // Popola Revenue Model
    updateRevenueModel({
      newCustomersYear1: dealsY1,
      marketingBudgetYear1: marketingPlan.projections.y1?.calculated?.budgetMarketing
    });
  }
}, [marketingPlan]);
```

---

### **3. Timeline Costs → Budget Tracking** 🟡 IMPORTANTE

#### **Problema**
I costi dei task timeline (€561k totali) non sono tracciati vs budget.

#### **Soluzione**
Creare componente "Budget Timeline Tracker":

```typescript
function BudgetTimelineTracker() {
  const { data } = useDatabase();
  const tasks = data?.timeline?.tasks || [];
  
  // Calcola costi per categoria
  const costsByCategory = tasks.reduce((acc, task) => {
    const cat = task.category;
    acc[cat] = (acc[cat] || 0) + (task.cost || 0);
    return acc;
  }, {});
  
  // Confronta con budget allocato
  const budgetAllocato = {
    cat_prototipo: 200000,
    cat_regolatorio: 350000,
    ...
  };
  
  return (
    <Card>
      <CardTitle>Budget vs Speso</CardTitle>
      {Object.entries(costsByCategory).map(([cat, spent]) => {
        const budget = budgetAllocato[cat] || 0;
        const percentage = (spent / budget) * 100;
        
        return (
          <div key={cat}>
            <Progress value={percentage} />
            <span>{spent}€ / {budget}€</span>
          </div>
        );
      })}
    </Card>
  );
}
```

---

### **4. Timeline Milestones → Key Dates Dashboard** 🟢 NICE-TO-HAVE

#### **Problema**
Le milestone importanti (es: Certificazione CE) non sono evidenti.

#### **Soluzione**
Creare dashboard dedicated "Milestone Critiche":

```typescript
function MilestoneDashboard() {
  const { data } = useDatabase();
  const milestones = data?.timeline?.tasks
    .filter(t => t.milestone)
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {milestones.map(m => (
        <Card key={m.id}>
          <Badge>{m.category}</Badge>
          <h3>{m.name}</h3>
          <p>Target: {format(m.end_date, 'MMM yyyy')}</p>
          <Progress value={m.progress} />
        </Card>
      ))}
    </div>
  );
}
```

---

### **5. Export Excel Completo** 🟡 IMPORTANTE

#### **Problema**
Non c'è export consolidato di tutti i dati.

#### **Soluzione**
Creare endpoint e UI per export:

```typescript
// Backend: server.js
app.get('/api/export/excel', async (req, res) => {
  const database = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
  
  // Usa libreria xlsx
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Timeline Tasks
  const tasksSheet = XLSX.utils.json_to_sheet(database.timeline.tasks);
  XLSX.utils.book_append_sheet(wb, tasksSheet, 'Timeline');
  
  // Sheet 2: Marketing Plan
  const marketingData = [];
  Object.entries(database.goToMarket.marketingPlan.projections).forEach(([year, proj]) => {
    marketingData.push({
      Anno: year,
      Reps: proj.calculated.reps,
      Budget: proj.calculated.budgetMarketing,
      Leads: proj.calculated.leadsNeeded,
      CAC: proj.calculated.cacEffettivo
    });
  });
  const marketingSheet = XLSX.utils.json_to_sheet(marketingData);
  XLSX.utils.book_append_sheet(wb, marketingSheet, 'Marketing Plan');
  
  // Sheet 3: P&L
  // ...
  
  // Genera file
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=eco3d_export.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
});

// Frontend: Button
<Button onClick={async () => {
  const res = await fetch('http://localhost:3001/api/export/excel');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eco3d_export.xlsx';
  a.click();
}}>
  📊 Export Excel Completo
</Button>
```

**Librerie necessarie:**
```bash
npm install xlsx
```

---

### **6. Real-Time Sync Dashboard** 🟢 NICE-TO-HAVE

#### **Problema**
Modifiche su una sezione non si riflettono immediatamente su altre.

#### **Soluzione**
Implementare WebSocket o polling:

```typescript
// Opzione 1: Polling semplice
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('http://localhost:3001/api/database');
    const newData = await res.json();
    
    // Solo se diverso
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData);
      toast.success('Dati aggiornati!');
    }
  }, 5000); // Ogni 5 secondi
  
  return () => clearInterval(interval);
}, []);

// Opzione 2: WebSocket (più complesso ma real-time)
```

---

## 📋 Checklist Implementazione

### **Priorità ALTA** 🔴

- [ ] **Integrare Simulatore Marketing con Marketing Plan**
  - Trovare componente simulatore
  - Aggiungere hook `updateMarketingPlan`
  - Aggiungere chiamata API persist
  - Testare salvataggio y1-y5

- [ ] **Collegare Marketing Plan a Revenue Model**
  - Creare hook sync automatico
  - Mappare proiezioni → parametri revenue
  - Testare propagazione modifiche

- [ ] **Budget Timeline Tracker**
  - Creare componente tracker
  - Calcolare totali per categoria
  - Visualizzare progress bar
  - Aggiungere alerts budget superato

### **Priorità MEDIA** 🟡

- [ ] **Export Excel Completo**
  - Installare libreria xlsx
  - Creare endpoint backend
  - Implementare UI button
  - Testare export multi-sheet

- [ ] **Dashboard Milestone**
  - Creare componente dedicated
  - Filtrare solo milestones
  - Ordinare per data
  - Aggiungere countdown

### **Priorità BASSA** 🟢

- [ ] **Real-Time Sync**
  - Valutare polling vs WebSocket
  - Implementare logica sync
  - Aggiungere toast notifications
  - Gestire conflitti

- [ ] **Grafici Timeline**
  - Costi cumulativi nel tempo
  - Gantt alternativo (D3.js?)
  - Critical path analysis

---

## 🔧 File Modificati Oggi

### **Timeline Gantt**
✅ `TimelineView.tsx`
- Ordine viste: 6h → Giorno → Settimana → Mese → Trimestre → Anno
- Vista Trimestre usa ViewMode.Year con columnWidth 90px
- Margine laterale minimo (px-1)

✅ `DatabaseProvider.tsx`
- Aggiunto tipo `CustomViewMode`
- Aggiunto tipo `MarketingPlan`
- Aggiunto tipo `MarketingProjection`
- Aggiunto metodo `updateMarketingPlan()`

✅ `server.js`
- Aggiunto endpoint `/api/database/go-to-market/marketing-plan/:year`
- Aggiornato banner con nuova API

---

## 📊 Struttura Dati Completa

### **Database Root**
```
database.json
├── version
├── lastUpdate
├── ecografie (TAM/SAM/SOM prestazioni)
├── ecografi (TAM/SAM/SOM dispositivi)
├── tamSamSom (config mercato)
├── revenueModel (SaaS + Hardware)
├── goToMarket
│   ├── salesCapacity
│   ├── conversionFunnel
│   ├── scenarios
│   └── marketingPlan ⭐ (NUOVO)
│       ├── globalSettings
│       └── projections
│           ├── y1
│           ├── y2
│           ├── y3
│           ├── y4
│           └── y5
├── contoEconomico (P&L)
├── statoPatrimoniale (Balance Sheet)
├── cashFlow
├── budgetProdotto
└── timeline ⭐
    ├── tasks (23 task con costi)
    ├── categories
    └── filters
```

---

## 🎯 Roadmap Integrazione

### **Fase 1: Core Integrations** (1-2 giorni)
1. ✅ Marketing Plan API endpoint
2. 🔴 Simulatore → Marketing Plan sync
3. 🔴 Marketing Plan → Revenue Model sync

### **Fase 2: Visualizations** (2-3 giorni)
4. 🟡 Budget Timeline Tracker
5. 🟡 Dashboard Milestone
6. 🟢 Grafici timeline avanzati

### **Fase 3: Export & Sync** (1-2 giorni)
7. 🟡 Export Excel multi-sheet
8. 🟢 Real-time sync (opzionale)

### **Fase 4: Polish** (1 giorno)
9. 🟢 Toast notifications
10. 🟢 Loading states
11. 🟢 Error handling
12. 🟢 Documentazione utente

---

## 🚀 Next Steps Immediati

### **Per l'utente:**

1. **Trovare componente Simulatore Marketing**
   - Probabilmente in `src/components/BusinessPlan/` o simile
   - Cercare dove vengono calcolati leads, budget, CAC

2. **Testare API Marketing Plan**
   ```bash
   # Riavvia server
   npm run dev:all
   
   # Test con curl
   curl -X PATCH http://localhost:3001/api/database/go-to-market/marketing-plan/1 \
     -H "Content-Type: application/json" \
     -d '{"costPerLead": 60, "calculated": {...}}'
   ```

3. **Verificare salvataggio**
   - Controlla `database.json`
   - Sezione `goToMarket.marketingPlan.projections.y1`

---

## 📚 Documentazione Tecnica

### **TypeScript Types Location**
- Timeline: `DatabaseProvider.tsx` lines 420-445
- Marketing: `DatabaseProvider.tsx` lines 306-340, 481-502
- Go-To-Market: `DatabaseProvider.tsx` lines 308-342

### **API Endpoints**
- Base URL: `http://localhost:3001`
- Auth: Nessuna (development)
- Content-Type: `application/json`

### **Database File**
- Path: `src/data/database.json`
- Size: ~500KB
- Encoding: UTF-8
- Pretty printed: 2 spaces

---

## ✅ Summary

**Completato oggi:**
- ✅ Fix ordine viste timeline (6h prima, ordine logico)
- ✅ Vera vista trimestrale (ViewMode.Year, 90px)
- ✅ API endpoint marketing plan
- ✅ Types TypeScript completi
- ✅ Documentazione integrazioni

**Da fare priorità alta:**
- 🔴 Integrare simulatore marketing
- 🔴 Sync marketing plan → revenue model
- 🔴 Budget tracker timeline

**Il sistema è pronto per essere integrato end-to-end!** 🎉

---

*Ultimo aggiornamento: 13 Ottobre 2025 00:45*  
*Versione: 1.3.0*  
*Status: 📋 Pronto per implementazione integrazioni*
