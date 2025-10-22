# 🎯 PIANO IMPLEMENTAZIONE FINALE - FINANCIAL PLAN V3

**Data:** 2025-10-21  
**Scope:** SOLO macro tab "📈 Piano Finanziario"  
**Durata:** 2.5 settimane (Opzione B - Complete)

---

## 🎯 OBIETTIVO

Trasformare il Piano Finanziario in strumento **REALMENTE UTILIZZABILE** dove:

✅ **TUTTO è CONFIGURABILE** (date, durate, importi, fasi)  
✅ **Legge dati** da Revenue Model, GTM, Budget, TAM/SAM/SOM  
✅ **Calcola automaticamente** mese×mese (120 mesi)  
✅ **Mostra metriche chiave** (Runway, Burn, Break-even, LTV/CAC)  
✅ **Gestisce funding** con alerts intelligenti  
✅ **Scenari multipli** (Base/Pessimista/Ottimista)

---

## 🚫 COSA NON TOCCHIAMO

```
MANTENIAMO INVARIATI (solo leggiamo):
├─ Dashboard, Mercato, TAM/SAM/SOM
├─ Modello Business (Revenue Model + GTM)
├─ Budget
└─ Tutti gli altri tab
```

---

## 📐 ARCHITETTURA

### Database Schema (Nuovo!)

```json
{
  "financialPlan": {
    "businessPhases": [
      {
        "id": "pre_commercial",
        "startDate": "2025-01",  // ← MODIFICABILE
        "endDate": "2028-12",     // ← MODIFICABILE
        "revenueEnabled": false
      },
      {
        "id": "launch",
        "startDate": "2029-01",
        "endDate": "2030-12",
        "revenueEnabled": true,
        "revenueStartDate": "2029-Q3"  // ⭐ KEY!
      },
      {
        "id": "scaling",
        "startDate": "2031-01",
        "endDate": "2035-12",
        "revenueEnabled": true
      }
    ],
    
    "fundingRounds": [
      {
        "id": "seed_2025",
        "date": "2025-Q1",
        "amount": 300000,        // ← MODIFICABILE
        "useOfFunds": {
          "rd": 40, "team": 30, "marketing": 20, "ops": 10
        }
      },
      {
        "id": "seed_plus_2026",
        "date": "2026-Q2",
        "amount": 650000,        // ← aumentato come richiesto
        "useOfFunds": {...}
      },
      {
        "id": "series_a_2028",
        "date": "2028-Q1",
        "amount": 2000000,
        "useOfFunds": {...}
      }
    ],
    
    "dataIntegration": {
      "revenue": "revenueModel + goToMarket",
      "costs": "budget + phaseConfig",
      "market": "configurazioneTamSamSom"
    },
    
    "calculations": {
      "monthly": [],  // 120 mesi
      "annual": [],   // 10 anni
      "breakEven": {},
      "metrics": {}
    }
  }
}
```

---

## 🚀 IMPLEMENTAZIONE - 4 FASI

### FASE 1: Core Engine (Settimana 1)

**Files da creare:**
```
/src/types/financialPlan.types.ts
/src/services/financialPlanCalculations.ts
/src/services/dataIntegration.ts
/src/components/FinancialPlan/PhaseConfigPanel.tsx
/src/components/FinancialPlan/FundingRoundsPanel.tsx
```

**Funzionalità:**
- ✅ Schema database completo
- ✅ TypeScript interfaces
- ✅ Calculation engine mese×mese
- ✅ Integrazione dati da altre sezioni
- ✅ UI panels per configurazione fasi e funding

**Calcoli chiave:**

```typescript
// Per ogni mese (0-120):
for (let month = 0; month < 120; month++) {
  const phase = getPhaseForMonth(month);
  
  // REVENUE (solo se fase abilitata + dopo revenue start date)
  const revenue = phase.revenueEnabled && afterRevenueStart(month)
    ? calculateRevenue(month)  // da GTM + Revenue Model
    : 0;
  
  // COSTS (sempre, crescono per fase)
  const costs = calculateCosts(month, phase);  // da Budget
  
  // CASH FLOW
  const cashOps = revenue - costs + workingCapital;
  const cashInv = getCAPEX(month);
  const cashFin = getFunding(month);  // funding rounds
  
  cashBalance += (cashOps + cashInv + cashFin);
  
  // METRICS
  const burnRate = revenue - costs < 0 ? Math.abs(revenue - costs) : 0;
  const runway = burnRate > 0 ? cashBalance / burnRate : Infinity;
  
  monthlyData[month] = {
    month, revenue, costs, cashBalance, burnRate, runway, ...
  };
}
```

---

### FASE 2: Visualizations (4 giorni)

**Components:**
```
/src/components/FinancialPlan/CashFlowWaterfall.tsx
/src/components/FinancialPlan/RunwayGauge.tsx
/src/components/FinancialPlan/ExecutiveSummary.tsx
/src/components/FinancialPlan/IncomeStatementTab.tsx  // aggiornato
/src/components/FinancialPlan/CashFlowTab.tsx         // aggiornato
/src/components/FinancialPlan/BalanceSheetTab.tsx     // aggiornato
```

**Features:**
- ✅ Cash Waterfall Chart con funding rounds
- ✅ Runway gauge dinamico
- ✅ P&L/CF/BS tabs aggiornati
- ✅ Executive summary card

---

### FASE 3: Intelligence (4 giorni)

**Services:**
```
/src/services/fundingIntelligence.ts
/src/services/metricsCalculator.ts
/src/services/scenarioEngine.ts
```

**Components:**
```
/src/components/FinancialPlan/FundingAlertsCard.tsx
/src/components/FinancialPlan/KeyMetricsDashboard.tsx
/src/components/FinancialPlan/ScenarioComparison.tsx
```

**Features:**
- ✅ Alert automatici runway
- ✅ Suggerimenti importo funding
- ✅ Use of funds automatico
- ✅ Metriche chiave (LTV/CAC, IRR, Payback)
- ✅ Scenario builder

---

### FASE 4: Integration & Testing (3 giorni)

**Activities:**
- ✅ Integrazione con MasterDashboard
- ✅ Testing calcoli end-to-end
- ✅ Validazione dati integrati
- ✅ Performance optimization
- ✅ Documentazione

---

## 📊 UI FINALE

### Master Tab Container

```
┌───────────────────────────────────────────────┐
│ 📈 PIANO FINANZIARIO ECO 3D                   │
├───────────────────────────────────────────────┤
│                                                │
│ [📊 Summary] [⚙️ Config] [📈 P&L] [💸 CF] [🏦 BS] [📐 Metrics]
│                                                │
│ ┌─────────────────────────────────────────────┤
│ │ EXECUTIVE SUMMARY                           │
│ │                                             │
│ │ 💰 Cash: €450k    📅 Runway: 8 mesi ⚠️    │
│ │ 🎯 Next: CE Mark Q2 2028                    │
│ │                                             │
│ │ 🚨 ALERT: Runway < 12 mesi                 │
│ │ Inizia Seed+ fundraising ORA!              │
│ │ Consigliato: €650k                         │
│ │                                             │
│ │ [Cash Waterfall Chart]                     │
│ │                                             │
│ │ KEY METRICS:                                │
│ │ Revenue Start: Q3 2029                      │
│ │ Break-even: Q2 2030                         │
│ │ Total Funding: €2.95M                       │
│ │ Burn Rate: €37k/mo                          │
│ └─────────────────────────────────────────────┘
└───────────────────────────────────────────────┘
```

---

## ✅ DELIVERABLES FINALI

### Funzionalità Core
- ✅ Configurazione fasi business (date modificabili)
- ✅ Revenue start date picker
- ✅ Funding rounds editor (date + importi)
- ✅ Calcoli mese×mese automatici
- ✅ Integrazione dati da altre sezioni

### Visualizzazioni
- ✅ Cash waterfall interattivo
- ✅ Runway gauge dinamico
- ✅ P&L/CF/BS aggiornati
- ✅ Executive dashboard

### Intelligence
- ✅ Funding alerts automatici
- ✅ Use of funds suggerito
- ✅ Key metrics (LTV/CAC, IRR, Break-even)
- ✅ Scenario comparison

### Integration
- ✅ Master dashboard integrato
- ✅ API endpoints funzionanti
- ✅ Performance ottimizzata
- ✅ Documentazione completa

---

## 🎓 PRINCIPI GUIDA (dalle guide)

1. **Phase-Based:** Pre-commerciale (NO revenue) → Launch (revenue start) → Scaling
2. **Configurabile:** Date, importi, durate TUTTO modificabile
3. **Integrato:** Legge da Revenue Model, GTM, Budget
4. **Mese×Mese:** Calcoli mensili per 36 mesi, poi annuali
5. **Runway Critical:** Sempre visibile, alerts proattivi
6. **Break-even:** Economico vs Finanziario
7. **Funding Driven:** Rounds linked a milestone
8. **Scenari:** Base + Pessimista + Ottimista
9. **Metriche Medtech:** LTV/CAC, CAC Payback, Unit Economics
10. **Cash is King:** Focus su cash flow, non solo P&L

---

## 📋 PROSSIMI STEP

1. ✅ **Conferma finale** questo piano
2. 🔨 **Creo branch Git** `feature/phase-based-financial-plan`
3. 💾 **Backup database.json**
4. 🚀 **Inizio FASE 1** (Core Engine)
5. 🧪 **Testing iterativo** con te durante implementazione

---

**Pronto a partire quando mi dai l'OK!** 🚀

Vuoi modifiche al piano prima che inizi?
