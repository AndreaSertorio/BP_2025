# 📊 ANALISI DASHBOARD ESISTENTE - MasterDashboard.tsx

**Data**: 02/10/2025 17:13
**Obiettivo**: Mappare struttura attuale prima di semplificare

---

## 🏗️ STRUTTURA GENERALE

### Tab Principali (Livello 1)
1. **Dashboard** - Tab principale con KPI e controlli
2. **🗂️ Vecchi Tab** - Raggruppa tutti i tab legacy

### Tab Legacy (Livello 2 - dentro "Vecchi Tab")
1. Financials
2. Advanced
3. Cash Flow
4. Growth
5. Statements
6. Compare
7. Sensitivity
8. Parameters
9. Overview
10. Market Config
11. Calcoli
12. Glossary

**TOTALE**: 12 tab legacy + 1 tab principale = **13 tab**

---

## 📈 METRICHE MOSTRATE NEL TAB "DASHBOARD"

### Sezione 1: Revenue & Profitability Evolution
```typescript
KPICard: "Revenue Y1" 
  - value: calculationResults.kpis.totalRevenueY1
  - format: "millions"
  - comparison: vs baseResults (se disponibile)

KPICard: "Revenue Y5"
  - value: calculationResults.kpis.totalRevenueY5
  - format: "millions"
  - comparison: Y5 vs Y1 growth

KPICard: "EBITDA Y1"
  - value: calculationResults.kpis.ebitdaY1
  - format: "millions"
  - comparison: vs baseResults

KPICard: "EBITDA Y5"
  - value: calculationResults.kpis.ebitdaY5
  - format: "millions"
```

### Sezione 2: Key Business Metrics
```typescript
KPICard: "ARR Y5"
  - value: calculationResults.kpis.arrRunRateM60
  - format: "millions"

KPICard: "Gross Margin %"
  - value: calculationResults.kpis.grossMarginPercent
  - format: "percent"

KPICard: "Break-Even EBITDA"
  - value: calculationResults.kpis.breakEvenYearEBITDA
  - format: "year"

KPICard: "Break-Even CFO"
  - value: calculationResults.kpis.breakEvenYearCFO
  - format: "year"

KPICard: "SOM %"
  - value: calculationResults.kpis.somPercent
  - format: "percent"
```

**TOTALE METRICHE TAB DASHBOARD**: ~9 KPI cards

---

## 🎛️ CONTROLLI PARAMETRI

### Sezione: Seleziona Focus di Mercato
5 bottoni per scenari settoriali:
- 🦴 Tiroide (15M TAM)
- 🩺 Rene/Urologia (25M TAM)
- 🏃‍♂️ MSK (5M TAM)
- 🎗️ Senologia (10M TAM)
- 🌍 Completo (55M TAM)

### Sezione: Assumptions Finanziarie Configurabili
```typescript
ParameterControl × 7:
1. initialCash (default: 2.0 M€)
2. discountRate (default: 0.12)
3. tam (default: 63800)
4. sam (default: 31900)
5. realizationFactor (default: 0.85)
6. capexAsPercentRevenue (default: 0.05)
7. depreciationRate (default: 0.20)
```

---

## 🎨 COMPONENTI UI USATI

### Da Verificare
- ✅ **KPICard** - componente card per metriche
- ✅ **ChartCard** - componente per grafici
- ✅ **ParameterControl** - controllo slider/input parametri
- ✅ **MetricTooltip** - tooltip con formula e benchmark (GIÀ ESISTE!)
- ✅ **LoadingCard/LoadingSpinner** - stati di loading

### Tooltip Già Implementato!
```typescript
<MetricTooltip
  metric="Revenue Y1"
  value="€1.2M"
  description="Total revenue in the first year of operations"
  formula="Recurring Revenue + CapEx Revenue"
  benchmark={{
    good: ">€1M",
    average: "€0.5-1M",
    poor: "<€0.5M"
  }}
/>
```

**IMPORTANTE**: Il sistema di tooltip con formule ESISTE GIÀ ma è usato solo su Revenue Y1!

---

## 📊 DATI DISPONIBILI

### calculationResults.kpis (KPIMetrics)
```typescript
interface KPIMetrics {
  // ARR metrics
  arrRunRateM24: number;
  arrRunRateM60: number;
  arrSubM24: number;
  arrSubM60: number;
  arrMaintM24: number;
  arrMaintM60: number;
  
  // Revenue per anno
  totalRevenueY1: number;
  totalRevenueY2: number;
  totalRevenueY3: number;
  totalRevenueY4: number;
  totalRevenueY5: number;
  
  // EBITDA per anno
  ebitdaY1: number;
  ebitdaY2: number;
  ebitdaY3: number;
  ebitdaY4: number;
  ebitdaY5: number;
  
  // Altri KPI
  grossMarginPercent: number;
  breakEvenYearEBITDA: number | null;
  breakEvenYearCFO: number | null;
  somPercent: number;
}
```

### calculationResults.advancedMetrics
```typescript
interface AdvancedMetrics {
  breakEven: BreakEvenAnalysis;
  unitEconomics: {
    cac: number;           // Customer Acquisition Cost
    ltv: number;           // Lifetime Value
    ltvCacRatio: number;   // LTV/CAC ratio
    paybackPeriod: number; // in months
    arpu: number;          // Average Revenue Per User
    churnRate: number;
    averageLifetime: number;
  };
  cashFlow: {
    burnRate: number;      // Monthly burn rate
    runway: number;        // Runway in months
    cashBalance: number;
    cumulativeCash: number;
    peakFunding: number;
  };
  npv: number;
  irr: number | null;
}
```

### calculationResults.monthlyData
```typescript
interface MonthlyMetrics {
  month: MonthIndex;
  leads: number;
  deals: number;
  accountsActive: number;
  devicesActive: number;
  recurringRev: number;  // NO "mrr" property!
  capexRev: number;
  totalRev: number;
  cogs: number;
  grossMargin: number;
  scansPerformed: number;
}
```

### calculationResults.annualData
```typescript
interface AnnualMetrics {
  year: Year;
  recurringRev: number;
  capexRev: number;
  totalRev: number;
  cogs: number;
  grossMargin: number;
  grossMarginPercent: number;
  opex: number;
  ebitda: number;  // EBITDA è SOLO qui, non in MonthlyMetrics!
  arr: number;
}
```

---

## 🎯 METRICHE PRIORITARIE (da Guida.md)

### TOP 10 da Mostrare
1. ✅ **ARR** - DISPONIBILE (`kpis.arrRunRateM60`)
2. ⚠️ **MRR** - CALCOLARE (`monthlyData[59].recurringRev`)
3. ⚠️ **LTV/CAC Ratio** - DISPONIBILE (`advancedMetrics.unitEconomics.ltvCacRatio`)
4. ✅ **Break-Even Point** - DISPONIBILE (`kpis.breakEvenYearEBITDA`)
5. ⚠️ **Runway** - DISPONIBILE (`advancedMetrics.cashFlow.runway`)
6. ⚠️ **Burn Rate** - DISPONIBILE (`advancedMetrics.cashFlow.burnRate`)
7. ⚠️ **CAC** - DISPONIBILE (`advancedMetrics.unitEconomics.cac`)
8. ⚠️ **LTV** - DISPONIBILE (`advancedMetrics.unitEconomics.ltv`)
9. ⚠️ **Payback Period** - DISPONIBILE (`advancedMetrics.unitEconomics.paybackPeriod`)
10. ⚠️ **Churn Rate** - DISPONIBILE (`advancedMetrics.unitEconomics.churnRate`)

**Legenda**:
- ✅ Già mostrato nella dashboard
- ⚠️ Disponibile nei dati ma NON mostrato

---

## 💡 OPPORTUNITÀ DI SEMPLIFICAZIONE

### Quick Wins
1. **Aggiungere MetricTooltip** alle altre 8 KPI card (esempio già presente!)
2. **Aggiungere sezione** "Unit Economics" con CAC, LTV, LTV/CAC ratio
3. **Aggiungere sezione** "Cash Flow" con Burn Rate e Runway
4. **Nascondere tab legacy** di default (già fatto con "Vecchi Tab")

### Metriche Mancanti da Aggiungere
- MRR (ultimo mese)
- CAC
- LTV
- LTV/CAC Ratio
- Burn Rate
- Runway
- Payback Period
- Churn Rate

### Tab da Rimuovere/Consolidare
Da valutare quali dei 12 tab legacy sono davvero necessari.

---

## 📝 NOTE IMPLEMENTATIVE

### Pattern di Calcolo
```typescript
const calculationResults = useMemo(() => {
  const calculator = new FinancialCalculator(currentScenario);
  return calculator.calculate();
}, [currentScenario, currentScenarioKey, forceRecalc]);
```

### Pattern Tooltip Esistente
```typescript
<MetricTooltip {...props} />
<KPICard {...props} />
```

### Gestione Loading
```typescript
{isCalculating ? (
  <LoadingCard title="..." description="..." />
) : (
  <KPICard {...} />
)}
```

---

## ✅ PROSSIMI STEP

1. **Completare tooltip** su tutte le KPI esistenti
2. **Aggiungere metriche mancanti** (CAC, LTV, Burn Rate, Runway)
3. **Riorganizzare layout** in sezioni logiche
4. **Valutare rimozione tab** legacy uno alla volta
