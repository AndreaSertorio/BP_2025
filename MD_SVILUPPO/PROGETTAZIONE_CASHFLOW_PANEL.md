# 📊 PROGETTAZIONE CASHFLOW PANEL - Integrato con Sistema Esistente

## 🎯 OBIETTIVO

Creare un **CashFlowPanel** che:
1. ✅ Calcola cash flow statement completo (OCF + ICF + FCF)
2. ✅ Traccia burn rate mensile e runway
3. ✅ Integra funding rounds dal database
4. ✅ Calcola break-even cash flow
5. ✅ Visualizza trend e metriche chiave

**Logica:** Phase-based, data-driven, seamless integration con P&L esistente

---

## 🏗️ STRUTTURA DATI (Database Integration)

### **Dati Necessari (già presenti nel database):**

```json
{
  "financialPlan": {
    "configuration": {
      "fundingRounds": [
        {
          "id": "seed_2025",
          "month": 1,              // Quando arriva il funding
          "amount": 300000,        // €300K
          "useOfFunds": {...}
        },
        {
          "id": "seed_plus_2026",
          "month": 18,             // Mese 18
          "amount": 500000
        },
        {
          "id": "series_a_2028",
          "month": 37,             // Mese 37
          "amount": 2000000
        }
      ]
    },
    "calculations": {
      "breakEven": {
        "cashFlow": {
          "reached": false,
          "date": null,
          "month": null
        }
      },
      "metrics": {
        "burnRate": {
          "current": 0,
          "average": 0,
          "trend": "stable"
        },
        "currentRunway": 0
      }
    }
  }
}
```

### **Dati Calcolati (da P&L esistente):**

```typescript
// Per ogni mese, il P&L ci dà:
{
  revenue: number,        // Total revenue
  cogs: number,           // Cost of goods sold
  grossProfit: number,    // Revenue - COGS
  opex: {                 // Operating expenses
    personnel: number,
    rd: number,
    regulatory: number,
    clinical: number,
    marketing: number,
    operations: number,
    total: number
  },
  ebitda: number,         // Gross Profit - OPEX
  netIncome: number       // EBITDA × (1 - tax)
}
```

---

## 💰 FORMULE CASH FLOW

### **1. OPERATING CASH FLOW (OCF)**

```typescript
// Metodo Indiretto (da Net Income)
operatingCashFlow = netIncome 
                  + depreciation
                  - Δ_workingCapital
                  + non_cash_expenses

// Semplificato per startup early stage:
operatingCashFlow = netIncome + depreciation

// Depreciation (semplificato):
// - CapEx ammortizzato in 5 anni
// - depreciation_mensile = (cumulative_capex) / 60 mesi
```

**Componenti:**
- **Net Income**: Dal P&L (già calcolato)
- **Depreciation**: CapEx / 60 mesi (5 anni vita utile)
- **Working Capital**: Semplificato per ora (AR + Inventory - AP)

**Assunzioni:**
- AR (Accounts Receivable): 30 giorni di revenue
- Inventory: 15 giorni di COGS (per hardware)
- AP (Accounts Payable): 30 giorni di OPEX

```typescript
workingCapital = {
  accountsReceivable: revenue × (30/30),  // 1 mese
  inventory: cogs × (15/30),               // 0.5 mesi
  accountsPayable: opex × (30/30)          // 1 mese
};

netWorkingCapital = AR + Inventory - AP;
Δ_NWC = NWC_current - NWC_previous;

// OCF ridotto se NWC cresce (cash tied up)
OCF = netIncome + depreciation - Δ_NWC;
```

---

### **2. INVESTING CASH FLOW (ICF)**

```typescript
// CapEx = Investimenti in fixed assets
investingCashFlow = -capex

// CapEx breakdown:
capex = {
  rdEquipment: 0,      // R&D equipment (2025-2027)
  productionSetup: 0,  // Production line setup (2028-2029)
  officeIT: 0,         // Office & IT infrastructure
  total: 0
};
```

**Assunzioni CapEx:**
```
2025 (Seed):       €50K  (R&D equipment)
2026 (Seed+):      €80K  (Prototyping tools)
2027:              €100K (Clinical equipment)
2028 (Series A):   €300K (Production setup)
2029-2030:         €150K/anno (Scaling equipment)
2031+:             €100K/anno (Maintenance)
```

**Formula per CapEx dinamico:**
```typescript
// CapEx legato a crescita revenue
if (year >= 2029 && revenue > 0) {
  // 2-3% del revenue per equipment/tooling
  capex = revenue × 0.025;
} else {
  // Pre-revenue: da funding rounds use of funds
  capex = fundingRound?.useOfFunds?.rd?.amount || 0;
}
```

---

### **3. FINANCING CASH FLOW (FCF)**

```typescript
// Funding in - Debt out
financingCashFlow = fundingInflow 
                  - debtRepayment
                  - dividends  // Zero per startup

// Funding rounds dal database
fundingInflow = fundingRounds
  .filter(r => r.month === currentMonth)
  .reduce((sum, r) => sum + r.amount, 0);
```

**Debt (se presente):**
```typescript
// Per ora: zero debt
// In futuro: venture debt, bank loans
debtRepayment = 0;
```

---

### **4. NET CASH FLOW & CASH BALANCE**

```typescript
// Net Cash Flow mensile
netCashFlow = OCF + ICF + FCF;

// Cash Balance cumulativo
cashBalance[month] = cashBalance[month - 1] + netCashFlow[month];

// Starting cash = primo funding round
cashBalance[0] = fundingRounds[0].amount; // €300K
```

---

## 📉 BURN RATE & RUNWAY

### **Burn Rate (mensile):**

```typescript
// Negative cash flow = burning cash
burnRate = -min(0, netCashFlow);

// Average burn (rolling 3 months)
avgBurnRate = average(burnRate[month-2], burnRate[month-1], burnRate[month]);
```

### **Runway (mesi):**

```typescript
// Quanto tempo prima che cash = 0?
runway = cashBalance / avgBurnRate;

// Se runway < 6 mesi → alert!
if (runway < 6 && runway > 0) {
  alert("⚠️ Low runway! Need funding soon");
}
```

---

## 🎯 BREAK-EVEN CASH FLOW

```typescript
// Break-even CF = primo mese con OCF >= 0
breakEvenCF = months.find(m => operatingCashFlow[m] >= 0);

// Diverso da break-even economico (EBITDA >= 0)!
// Può essere mesi/anni dopo per via di WC e timing payments
```

**Esempio:**
```
Mese 72 (2031):
- EBITDA: €950K (positivo) ✅ Break-even economico
- Net Income: €722K
- Δ_NWC: €200K (crescita AR/Inventory)
- OCF: €722K - €200K = €522K (positivo) ✅ Break-even CF

Può succedere che:
- Break-even EBITDA: Mese 72
- Break-even CF: Mese 75 (3 mesi dopo, per timing WC)
```

---

## 📊 VISUALIZZAZIONI PANEL

### **1. Cash Flow Statement Table (Annuale)**

| Anno | OCF | ICF | FCF | Net CF | Cash Balance | Burn Rate | Runway |
|------|-----|-----|-----|--------|--------------|-----------|--------|
| 2025 | -€139K | -€50K | €300K | €111K | €111K | €15.8K/mo | 7 mo |
| 2026 | -€810K | -€80K | €500K | -€390K | -€279K | €74.2K/mo | - |
| 2027 | -€688K | -€100K | €0 | -€788K | -€1.07M | €65.7K/mo | - |
| 2028 | -€1.28M | -€300K | €2.0M | €420K | -€650K | €132K/mo | 4.9 mo |
| 2029 | -€1.21M | -€150K | €0 | -€1.36M | -€2.01M | €113K/mo | - |
| 2030 | -€390K | -€150K | €0 | -€540K | -€2.55M | €45K/mo | - |
| 2031 | €950K | -€100K | €0 | €850K | -€1.70M | €0 (CF+) | ∞ |
| 2032 | €2.56M | -€100K | €0 | €2.46M | €760K | €0 | ∞ |

### **2. Grafici:**

#### **A) Cash Balance Trend**
```
€3M  │                               ╱─────
     │                           ╱───
€0   ├─────────────────────────────────────
     │     ╲                 ╱
-€3M │      ╲──────────────╱
     └────────────────────────────────────
      2025  2027  2029  2031  2033  2035
```

#### **B) OCF vs ICF vs FCF (Waterfall)**
```
€3M  │  █ (FCF)
     │  █
€0   ├──█──────────────────────────────────
     │     █ (OCF neg)
-€3M │     ██ (ICF)
     └────────────────────────────────────
```

#### **C) Burn Rate Trend**
```
€150K│ █
     │ █
€100K│ ██
     │ ███
€50K │ ████╲
     │ ██████╲────────────────
€0   └────────────────────────────────────
      2025  2027  2029  2031  2033
```

---

## 🧮 CALCOLI INTEGRATI CON P&L

### **Nel Calculator (`calculations.ts`):**

```typescript
class FinancialCalculator {
  
  // Calcolo per ogni mese
  calculateCashFlow(month: number, plData: PLData): CashFlowData {
    
    // 1. OPERATING CASH FLOW
    const netIncome = plData.netIncome;
    const depreciation = this.getDepreciation(month);
    const deltaWC = this.getWorkingCapitalChange(month, plData);
    const ocf = netIncome + depreciation - deltaWC;
    
    // 2. INVESTING CASH FLOW
    const capex = this.getCapEx(month);
    const icf = -capex;
    
    // 3. FINANCING CASH FLOW
    const fundingInflow = this.getFundingInflow(month);
    const fcf = fundingInflow;
    
    // 4. NET & BALANCE
    const netCF = ocf + icf + fcf;
    const prevBalance = month > 1 ? this.cashBalance[month - 1] : 0;
    const cashBalance = prevBalance + netCF;
    
    // 5. BURN RATE & RUNWAY
    const burnRate = Math.max(0, -netCF);
    const runway = burnRate > 0 ? cashBalance / burnRate : Infinity;
    
    return {
      ocf,
      icf,
      fcf,
      netCF,
      cashBalance,
      burnRate,
      runway,
      depreciation,
      deltaWC,
      capex
    };
  }
  
  private getDepreciation(month: number): number {
    // CapEx cumulativo fino a questo mese / 60 (5 anni)
    const cumulativeCapEx = this.getCumulativeCapEx(month);
    return cumulativeCapEx / 60;
  }
  
  private getCapEx(month: number): number {
    const year = Math.floor((month - 1) / 12) + 2025;
    
    // Pre-revenue: da funding rounds
    if (year < 2029) {
      return this.getPreRevenueCapEx(year);
    }
    
    // Post-revenue: % del revenue
    const revenue = this.getRevenueForMonth(month);
    return revenue * 0.025; // 2.5% revenue
  }
  
  private getFundingInflow(month: number): number {
    const round = this.input.financialPlan.configuration.fundingRounds
      .find(r => r.month === month);
    return round?.amount || 0;
  }
}
```

---

## 🎨 COMPONENTE UI

### **CashFlowPanel.tsx:**

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

interface CashFlowPanelProps {
  data: CashFlowData[];
  annualData: AnnualCashFlow[];
}

export const CashFlowPanel: React.FC<CashFlowPanelProps> = ({ 
  data, 
  annualData 
}) => {
  
  // Metriche correnti
  const currentCash = data[data.length - 1]?.cashBalance || 0;
  const currentBurn = data[data.length - 1]?.burnRate || 0;
  const currentRunway = data[data.length - 1]?.runway || 0;
  
  // Break-even CF
  const breakEvenCF = data.find(d => d.ocf >= 0);
  
  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <h3>Cash Balance</h3>
          <p className={currentCash >= 0 ? 'text-green' : 'text-red'}>
            €{(currentCash / 1000).toFixed(0)}K
          </p>
        </Card>
        
        <Card>
          <h3>Monthly Burn Rate</h3>
          <p>€{(currentBurn / 1000).toFixed(0)}K/mo</p>
        </Card>
        
        <Card>
          <h3>Runway</h3>
          <p className={currentRunway < 6 ? 'text-red' : ''}>
            {currentRunway === Infinity ? '∞' : `${currentRunway.toFixed(0)} months`}
          </p>
        </Card>
        
        <Card>
          <h3>CF Break-Even</h3>
          <p>{breakEvenCF?.date || 'Not reached'}</p>
        </Card>
      </div>
      
      {/* Cash Balance Trend */}
      <Card>
        <h3>Cash Balance Over Time</h3>
        <LineChart data={annualData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => `€${(value/1000).toFixed(0)}K`} />
          <Line type="monotone" dataKey="cashBalance" stroke="#10b981" />
          <Line type="monotone" dataKey="runway" stroke="#f59e0b" />
        </LineChart>
      </Card>
      
      {/* Cash Flow Statement */}
      <Card>
        <h3>Cash Flow Statement (Annual)</h3>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>OCF</th>
              <th>ICF</th>
              <th>FCF</th>
              <th>Net CF</th>
              <th>Balance</th>
              <th>Burn Rate</th>
            </tr>
          </thead>
          <tbody>
            {annualData.map(row => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td className={row.ocf >= 0 ? 'text-green' : 'text-red'}>
                  €{(row.ocf / 1000).toFixed(0)}K
                </td>
                <td className="text-red">
                  €{(row.icf / 1000).toFixed(0)}K
                </td>
                <td className="text-green">
                  €{(row.fcf / 1000).toFixed(0)}K
                </td>
                <td className={row.netCF >= 0 ? 'text-green' : 'text-red'}>
                  €{(row.netCF / 1000).toFixed(0)}K
                </td>
                <td className={row.cashBalance >= 0 ? 'text-green' : 'text-red'}>
                  €{(row.cashBalance / 1000).toFixed(0)}K
                </td>
                <td>
                  €{(row.avgBurnRate / 1000).toFixed(0)}K/mo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      {/* Waterfall Chart: OCF + ICF + FCF */}
      <Card>
        <h3>Cash Flow Components</h3>
        <BarChart data={annualData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ocf" fill="#10b981" name="Operating CF" />
          <Bar dataKey="icf" fill="#ef4444" name="Investing CF" />
          <Bar dataKey="fcf" fill="#3b82f6" name="Financing CF" />
        </BarChart>
      </Card>
      
    </div>
  );
};
```

---

## 🔗 INTEGRAZIONE CON SISTEMA ESISTENTE

### **1. Estendere `CalculatorInput` interface:**

```typescript
// types/financialPlan.types.ts
export interface CashFlowData {
  month: number;
  date: string;
  ocf: number;           // Operating Cash Flow
  icf: number;           // Investing Cash Flow
  fcf: number;           // Financing Cash Flow
  netCF: number;         // Net Cash Flow
  cashBalance: number;   // Cumulative cash
  burnRate: number;      // Monthly burn
  runway: number;        // Months until cash = 0
  depreciation: number;
  deltaWC: number;       // Working capital change
  capex: number;
}

export interface Calculations {
  monthlyData: MonthlyData[];
  annualSummary: AnnualSummary[];
  cashFlow: CashFlowData[];  // ← AGGIUNTO
  metrics: {
    breakEven: {
      economic: {...},
      cashFlow: {         // ← AGGIUNTO
        reached: boolean,
        date: string | null,
        month: number | null
      }
    },
    burnRate: {...},
    runway: {...}
  };
}
```

### **2. Aggiungere al Calculator:**

```typescript
// calculations.ts
public calculate(): CalculationResults {
  // ... calcoli P&L esistenti ...
  
  // NUOVO: Calcola cash flow
  const cashFlowData = this.calculateCashFlowStatement(monthlyData);
  
  return {
    monthlyData,
    annualSummary,
    cashFlow: cashFlowData,  // ← AGGIUNTO
    metrics: {
      ...existing,
      cashFlowBreakEven: this.findCashFlowBreakEven(cashFlowData)
    }
  };
}
```

### **3. Aggiungere Tab in UI:**

```typescript
// CalculationsPanel.tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="pl">P&L</TabsTrigger>
    <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>  {/* NUOVO */}
    <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
    <TabsTrigger value="metrics">Metrics</TabsTrigger>
  </TabsList>
  
  <TabsContent value="cashflow">
    <CashFlowPanel 
      data={calculations.cashFlow}
      annualData={calculations.annualSummary.map(mapToCashFlow)}
    />
  </TabsContent>
</Tabs>
```

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### **Phase 1: Core (ora)**
1. ✅ Calcolo OCF base (Net Income + Depreciation)
2. ✅ ICF con CapEx semplificato
3. ✅ FCF da funding rounds
4. ✅ Cash balance tracking
5. ✅ Burn rate & runway
6. ✅ UI base con tabella e grafico trend

### **Phase 2: Refinement (dopo)**
7. ⏳ Working capital dynamics (AR, Inventory, AP)
8. ⏳ CapEx dinamico basato su revenue
9. ⏳ Debt management (venture debt)
10. ⏳ Scenario analysis (best/worst case)

### **Phase 3: Advanced (futuro)**
11. ⏳ Waterfall chart dettagliato
12. ⏳ Funding alert system
13. ⏳ Sensitivity analysis
14. ⏳ Export to Excel

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [ ] Estendere `types/financialPlan.types.ts` con CashFlowData
- [ ] Implementare `calculateCashFlow()` in calculations.ts
- [ ] Implementare helper functions (depreciation, capex, funding)
- [ ] Creare `CashFlowPanel.tsx` component
- [ ] Aggiungere tab in CalculationsPanel
- [ ] Test con dati esistenti
- [ ] Validare break-even CF
- [ ] Verificare runway calculations

---

**PRONTO PER IMPLEMENTAZIONE! 🚀**
