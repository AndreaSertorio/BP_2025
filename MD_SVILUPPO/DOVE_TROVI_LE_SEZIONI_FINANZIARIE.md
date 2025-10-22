# 📍 DOVE TROVI LE SEZIONI FINANZIARIE

## 🎯 STRUTTURA COMPLETA FINANCIAL PLAN V2

```
📈 Financial Plan Master Dashboard
│
├─ Tab 1: Configurazione ✅ (ATTIVA)
│  │
│  ├─ 📅 Fasi Business (collassabile)
│  │  ├─ Pre-Commerciale (2025-2028)
│  │  ├─ Launch (2029-2030) → Revenue Start Q3 2029
│  │  └─ Scaling (2031-2035)
│  │
│  └─ 💰 Funding Rounds (collassabile)
│     ├─ Seed €300K (Q1 2025)
│     ├─ Seed+ €650K (Q2 2026)
│     └─ Series A €2M (Q1 2028)
│
├─ Tab 2: Calcoli 🔜 (PROSSIMA FASE)
│  │
│  ├─ 💼 **CONTO ECONOMICO (P&L)**
│  │  ├─ Revenue (Hardware + SaaS)
│  │  ├─ COGS
│  │  ├─ Gross Margin
│  │  ├─ OPEX
│  │  ├─ EBITDA
│  │  ├─ EBIT
│  │  └─ Net Income
│  │
│  ├─ 💸 **CASH FLOW STATEMENT**
│  │  ├─ Operating Cash Flow
│  │  ├─ Investing Cash Flow
│  │  ├─ Financing Cash Flow
│  │  └─ Ending Cash Balance
│  │
│  └─ 🏦 **STATO PATRIMONIALE (Balance Sheet)**
│     ├─ Assets (Cash, Inventory, Fixed Assets)
│     ├─ Liabilities (Debt, Accrued Expenses)
│     └─ Equity (Paid-in Capital, Retained Earnings)
│
├─ Tab 3: Grafici 🔜 (DOPO)
│  │
│  ├─ 📊 Cash Waterfall Chart
│  ├─ 🎯 Runway Gauge
│  ├─ 📈 Break-even Chart
│  ├─ 💹 Revenue Trend
│  └─ 🔥 Burn Rate Chart
│
└─ Tab 4: Export 🔜 (FINALE)
   │
   └─ 💾 Export Excel/PDF completo
```

---

## ✅ GIÀ FATTO (Tab Configurazione)

### 1. Phase Configuration Panel
**Cosa fa:** Configura le fasi temporali del business

**Dati configurabili:**
- Date inizio/fine fase
- Revenue abilitato/disabilitato
- Revenue start date (Q3 2029)
- Milestone per fase
- Focus areas (R&D, Sales, etc.)

**Dove salva:** `database.json → financialPlan.configuration.businessPhases`

---

### 2. Funding Rounds Panel
**Cosa fa:** Pianifica i round di finanziamento

**Dati configurabili:**
- Data round (Q1/Q2/Q3/Q4)
- Importo (€)
- Post-money valuation
- Use of funds (R&D, Team, Marketing, etc.)
- Investitori

**Dove salva:** `database.json → financialPlan.configuration.fundingRounds`

---

## 🔜 PROSSIMA FASE (Tab Calcoli)

### 1. Conto Economico (P&L)

**Calcoli automatici da:**
- `revenueModel` → Prezzi hardware & SaaS
- `goToMarket` → Proiezioni vendite
- `budget` → Struttura costi

**Output (mese×mese, 120 mesi):**
```typescript
{
  month: 57,  // Settembre 2029
  date: "2029-09",
  
  // REVENUE
  hardwareRevenue: 20833,     // 5 devices/anno × €50k / 12
  saasRevenue: 100,           // Pochi abbonamenti iniziali
  totalRevenue: 20933,
  
  // COSTS
  cogs: 5500,                 // ~€11k per device × 0.5 devices/mese
  grossProfit: 15433,
  grossMargin: 73.7%,
  
  opex: {
    personnel: 30000,
    rd: 5000,
    marketing: 10000,
    operations: 5000,
    total: 50000
  },
  
  // P&L
  ebitda: -34567,
  ebit: -35000,               // + D&A
  netIncome: -25200,          // Post-tax
  
  // Break-even status
  isBreakEven: false
}
```

**Visualizzazione:**
- Tabella mese×mese scrollabile
- Aggregazione annuale
- Grafici trend revenue/costs
- **Highlight break-even automatico**

---

### 2. Cash Flow Statement

**Calcoli automatici:**
```typescript
{
  month: 57,
  
  // OPERATING
  operatingCashFlow: {
    netIncome: -25200,
    adjustments: {
      depreciation: 433,
      changeInAR: -3472,      // DSO 60 gg
      changeInInventory: -2083,
      changeInAP: 1389        // DPO 30 gg
    },
    total: -29033
  },
  
  // INVESTING
  investingCashFlow: {
    capex: -2083,             // 5% revenue
    total: -2083
  },
  
  // FINANCING
  financingCashFlow: {
    fundingRaised: 0,         // No funding questo mese
    debtRepayment: -2500,
    total: -2500
  },
  
  // CASH POSITION
  netCashFlow: -33616,
  beginningCash: 483616,
  endingCash: 450000,
  
  // METRICS
  burnRate: 33616,
  runway: 13                   // mesi
}
```

**Visualizzazione:**
- Waterfall chart (Operating → Investing → Financing → Ending Cash)
- Runway gauge dinamico
- Burn rate trend
- **Alert se runway < 6 mesi**

---

### 3. Stato Patrimoniale (Balance Sheet)

**Calcoli automatici:**
```typescript
{
  month: 57,
  date: "2029-09",
  
  // ASSETS
  assets: {
    current: {
      cash: 450000,
      accountsReceivable: 34722,  // DSO 60gg
      inventory: 22917,           // DIO 45gg
      total: 507639
    },
    fixed: {
      ppe: 125000,
      accumulatedDepreciation: -26000,
      intangibles: 300000,
      total: 399000
    },
    totalAssets: 906639
  },
  
  // LIABILITIES
  liabilities: {
    current: {
      accountsPayable: 13889,     // DPO 30gg
      accruedExpenses: 5000,
      deferredRevenue: 2400,      // SaaS pre-pagato
      total: 21289
    },
    longTerm: {
      debt: 750000,
      total: 750000
    },
    totalLiabilities: 771289
  },
  
  // EQUITY
  equity: {
    paidInCapital: 2950000,       // Seed + Seed+ + Series A
    retainedEarnings: -2814650,   // Perdite cumulate
    total: 135350
  },
  
  // CHECK
  totalLiabilitiesAndEquity: 906639  // = Total Assets ✓
}
```

**Visualizzazione:**
- Tabella Assets | Liabilities + Equity
- Stack chart composizione equity
- Debt-to-Equity ratio
- Working Capital trends

---

## 📊 METRICHE CHIAVE (Calcolate Automaticamente)

### Break-Even Analysis
```typescript
{
  economic: {
    reached: true,
    date: "2030-06",
    month: 66,
    revenueNeeded: 450000,
    unitsNeeded: 9
  },
  cashFlow: {
    reached: true,
    date: "2031-03",
    month: 75
  }
}
```

### Burn Rate & Runway
```typescript
{
  currentBurnRate: 37000,       // €/mese
  averageBurnRate: 42000,
  trend: "decreasing",          // improving!
  currentRunway: 12,            // mesi
  runwayWithNextFunding: 24
}
```

### LTV/CAC (TODO Fase 3)
```typescript
{
  cac: 15000,                   // Cost per acquisition
  ltv: 180000,                  // Lifetime value
  ltvCacRatio: 12,              // 12:1 - Ottimo!
  paybackPeriod: 8              // mesi
}
```

---

## 🔄 FLUSSO DATI

```
DATABASE.JSON
│
├─ configurazioneTamSamSom  ──┐
├─ revenueModel             ──┤
├─ goToMarket               ──┤
├─ budget                   ──┤
└─ financialPlan.configuration┤
                               │
                               ▼
                    ┌──────────────────┐
                    │ DataIntegration  │
                    │    Service       │
                    └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │ FinancialPlan    │
                    │   Calculator     │
                    └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  calculations    │
                    │   .monthly[]     │
                    │   .annual[]      │
                    │   .breakEven     │
                    │   .metrics       │
                    └──────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │ UI Components    │
                    │ - P&L Tab        │
                    │ - CF Tab         │
                    │ - BS Tab         │
                    │ - Charts Tab     │
                    └──────────────────┘
```

---

## 🎯 TIMELINE IMPLEMENTAZIONE

### ✅ FASE 1 - COMPLETATA
- [x] Database migration
- [x] TypeScript types
- [x] Data integration service
- [x] Calculation engine base
- [x] Configuration UI (Phases + Funding)
- [x] Padding e layout migliorato
- [x] Sezioni collassabili

### 🔜 FASE 2 - IN CORSO (2-3 giorni)
- [ ] **Tab "Calcoli"** con 3 sub-tabs:
  - [ ] Conto Economico (P&L)
  - [ ] Cash Flow Statement
  - [ ] Stato Patrimoniale (BS)
- [ ] Tabelle interattive mese×mese
- [ ] Aggregazione annuale
- [ ] Esportazione dati

### 🔜 FASE 3 - GRAFICI (2 giorni)
- [ ] Cash waterfall chart
- [ ] Runway gauge
- [ ] Break-even visualization
- [ ] Revenue vs Costs trends
- [ ] Burn rate chart

### 🔜 FASE 4 - INTELLIGENCE (2 giorni)
- [ ] Funding alerts automatici
- [ ] Use of funds suggerito
- [ ] LTV/CAC calculator
- [ ] Scenario comparison

---

## 💡 DOMANDE FREQUENTI

### Q: Dove sono finiti contoEconomico e statoPatrimoniale vecchi?
**A:** Sono stati **rimossi** durante la migrazione perché erano statici e hardcoded. Ora tutto è calcolato automaticamente in `financialPlan.calculations`.

### Q: Posso ancora modificare i dati?
**A:** Sì! Modifichi la **configurazione** (fasi, funding) e i **calcoli si aggiornano automaticamente**.

### Q: Quando vedrò i numeri P&L/CF/BS?
**A:** Appena implementeremo la **Tab "Calcoli"** (Fase 2). La struttura dati è già pronta, manca solo l'UI!

### Q: I calcoli sono già fatti?
**A:** Il **motore di calcolo** è implementato in `/services/financialPlan/calculations.ts`. Manca solo collegarlo all'UI.

### Q: Posso vedere i calcoli ora?
**A:** Sì, via script di test! Ma è più facile aspettare l'UI tra 1-2 giorni.

---

## 🚀 PROSSIMI STEP IMMEDIATI

1. **ORA:** Test configurazione Phases + Funding ✅
2. **OGGI:** Layout migliorato con collapse ✅
3. **DOMANI:** Implementare Tab "Calcoli" con P&L
4. **DOPODOMANI:** Aggiungere CF e BS
5. **POI:** Grafici e visualizzazioni

---

## 📝 RIEPILOGO

**Configurazione → Calcoli → Grafici → Export**

Tutto è phase-based, automatico, e configurabile.

I dati P&L/CF/BS ci saranno nella **Tab 2: Calcoli** che implementeremo nella prossima sessione! 🎯
