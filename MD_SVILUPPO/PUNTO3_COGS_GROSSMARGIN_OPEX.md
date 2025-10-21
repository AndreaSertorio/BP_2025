# 📊 Punto 3: Margine Lordo, COGS e OPEX

## 📅 Data: 12 Ottobre 2025

---

## 🎯 Obiettivo

Implementare il **calcolo di COGS, Gross Margin e OPEX** seguendo la guida al piano finanziario:
- **COGS**: Cost of Goods Sold per Hardware e SaaS
- **Gross Margin**: Ricavi - COGS (€ e %)
- **OPEX**: Operating Expenses dal Budget esistente
- **EBITDA**: Gross Margin - OPEX

---

## ✅ Implementazione Completata

### 1. **Service COGS Calculations** 📦
File: `/src/services/cogsCalculations.ts`

#### Funzioni Principali

**Hardware COGS:**
```typescript
calculateHardwareCogs(
  revenue: number,
  units: number,
  unitCost: number,
  marginTarget?: number
): CogsHardware
```

Formula:
- **COGS** = units × unitCost
- **Gross Margin** = Revenue - COGS
- **Gross Margin %** = (Revenue - COGS) / Revenue × 100

**SaaS COGS:**
```typescript
calculateSaaSCogs(
  revenue: number,
  activeUsers: number,
  costPerUser: number = 3.5,
  paymentFeePct: number = 0.03
): CogsSaaS
```

Formula:
- **COGS** = (costPerUser × activeUsers) + (revenue × paymentFeePct)
- Include: cloud infrastructure + payment processing fees

**Blended COGS (Tutte le Linee):**
```typescript
calculateBlendedCogs(input: CogsInput): CogsBreakdown
```

Aggrega COGS per:
- Hardware
- SaaS
- Consumables (opzionale)
- Services (opzionale)

#### Features Avanzate

1. **Learning Curve:** Riduzione costi hardware con economie di scala
2. **Validazione Input:** Check parametri negativi
3. **Formatters:** Display valori EUR e percentuali

---

### 2. **Service OPEX Calculations** 💰
File: `/src/services/opexCalculations.ts`

#### Funzioni Principali

**OPEX da Budget:**
```typescript
calculateOpexFromBudget(
  budgetData: BudgetData,
  periodId: string
): OpexBreakdown
```

Mappa voci budget in categorie OPEX:
- **Staff** (Personale)
- **R&D** (Ricerca & Sviluppo)
- **Sales & Marketing**
- **G&A** (General & Administrative)

**EBITDA Calculation:**
```typescript
calculateEbitda(
  revenue: number,
  cogs: number,
  opex: OpexBreakdown
): EbitdaCalculation
```

Formula:
- **EBITDA** = Gross Margin - OPEX
- **EBITDA Margin %** = EBITDA / Revenue × 100

#### Features Avanzate

1. **OPEX by Year:** Aggregazione trimestri
2. **Staff Cost Detail:** Breakdown per ruolo
3. **OPEX Ratios:** % su ricavi per categoria
4. **Benchmarks Industry:** Confronto con MedTech averages
5. **Burn Rate & Runway:** Calcolo automatico

---

### 3. **P&L Preview Card Component** 📈
File: `/src/components/PLPreviewCard.tsx`

#### Features UI

**Cascata P&L Visuale:**
1. ✅ **Ricavi Totali** (blu) con breakdown HW/SaaS
2. ➖ **COGS** (rosso) con breakdown per linea
3. ✅ **Gross Margin** (verde) con % margin
4. ➖ **OPEX** (arancione) con breakdown Staff/R&D/S&M/G&A
5. ✅ **EBITDA** (verde/rosso) con margin % e formula

**Tooltip Informativi:**
- COGS: Definizione + componenti
- OPEX: Categorie + esempi
- EBITDA: Formula + significato

**Alert Contestuali:**
- EBITDA negativo → Mostra burn rate mensile
- EBITDA positivo → Conferma profittabilità

---

## 📐 Formule Implementate

### COGS Hardware
```
COGS_HW = units × unitCost
Gross_Margin_HW = Revenue_HW - COGS_HW
GM_Pct_HW = (Revenue_HW - COGS_HW) / Revenue_HW × 100
```

### COGS SaaS
```
COGS_SaaS = (activeUsers × costPerUser) + (revenue × paymentFeePct)
Gross_Margin_SaaS = Revenue_SaaS - COGS_SaaS
GM_Pct_SaaS = (Revenue_SaaS - COGS_SaaS) / Revenue_SaaS × 100
```

### OPEX Totale
```
OPEX_Total = Staff + R&D + S&M + G&A
```

### EBITDA
```
EBITDA = Gross_Margin - OPEX_Total
EBITDA_Pct = EBITDA / Revenue × 100
```

### Burn Rate
```
Monthly_Burn_Rate = |EBITDA| / 12    (se EBITDA < 0)
```

### Runway
```
Runway_Months = Cash_Balance / Monthly_Burn_Rate
```

---

## 🔗 Integrazione con Sistema Esistente

### Database.json
- ✅ Sezione `budget` già esistente con struttura completa
- ✅ Sezione `revenueModel` con COGS parameters
- ✅ Sezione `contoEconomico` con target margins

### Context React
- 🔄 `BudgetContext.tsx` per gestione budget
- 🔄 `DatabaseProvider` per dati centrali

### Services
- ✅ `cogsCalculations.ts` (nuovo)
- ✅ `opexCalculations.ts` (nuovo)
- 🔄 `gtmCalculations.ts` (esistente - per ricavi)

---

## 📊 Benchmark Industry (MedTech)

### OPEX Ratios Target

**Early Stage (pre-revenue):**
- R&D: 60% budget
- S&M: 15% budget
- G&A: 25% budget

**Growth Stage (post-revenue):**
- R&D: 30% ricavi
- S&M: 40% ricavi
- G&A: 15% ricavi

**Mature:**
- R&D: 15% ricavi
- S&M: 25% ricavi
- G&A: 10% ricavi

### Gross Margin Target

- **Hardware MedTech:** 50-65%
- **SaaS/Software:** 85-95%
- **Blended (HW+SaaS):** 70-85%

---

## 🧪 Come Testare

### Test Service COGS

```typescript
import { calculateBlendedCogs } from '@/services/cogsCalculations';

const result = calculateBlendedCogs({
  hardwareRevenue: 300000,  // €300K hardware
  hardwareUnits: 10,        // 10 dispositivi
  hardwareUnitCost: 11000,  // €11K costo unitario
  saasRevenue: 60000,       // €60K SaaS
  saasActiveUsers: 100      // 100 utenti attivi
});

console.log('Total Gross Margin:', result.total.grossMarginPct + '%');
console.log('EBITDA ready:', result.total.grossMargin);
```

**Output Atteso:**
```
Total Revenue: €360,000
Total COGS: €113,500
  - HW COGS: €110,000
  - SaaS COGS: €3,500
Gross Margin: €246,500 (68.5%)
```

### Test Service OPEX

```typescript
import { calculateEbitda } from '@/services/opexCalculations';

const ebitda = calculateEbitda(
  360000,  // revenue
  113500,  // cogs
  {
    staff: 180000,
    rd: 60000,
    salesMarketing: 40000,
    ga: 20000,
    total: 300000
  }
);

console.log('EBITDA:', ebitda.ebitda);
console.log('EBITDA Margin:', ebitda.ebitdaPct + '%');
```

**Output Atteso:**
```
Gross Margin: €246,500
OPEX Total: €300,000
EBITDA: -€53,500
EBITDA Margin: -14.9%
Burn Rate: €4,458/mese
```

### Test Component

```tsx
import PLPreviewCard from '@/components/PLPreviewCard';

<PLPreviewCard
  data={{
    hardwareRevenue: 300000,
    hardwareUnits: 10,
    saasRevenue: 60000,
    saasUsers: 100,
    hardwareUnitCost: 11000,
    opex: {
      staff: 180000,
      rd: 60000,
      salesMarketing: 40000,
      ga: 20000,
      total: 300000
    },
    year: 2025,
    quarter: 1
  }}
  title="P&L Q1 2025"
  showBreakdown={true}
/>
```

---

## 🔄 Prossimi Passi (Punto 4)

### Prospetti Previsionali Completi

1. **Conto Economico (P&L) Completo**
   - Ricavi per linea di business
   - COGS dettagliato
   - Gross Margin
   - OPEX per categoria
   - **EBITDA** ✅
   - Ammortamenti → **EBIT**
   - Interessi e Tasse → **Net Income**

2. **Cash Flow Statement**
   - Operating Cash Flow (da EBITDA)
   - Variazione Working Capital (DSO/DPO)
   - Investing Cash Flow (CAPEX)
   - Financing Cash Flow (equity/debt)
   - **Cash Balance finale**

3. **Stato Patrimoniale (Balance Sheet)**
   - Assets (cassa, crediti, immobilizzazioni)
   - Liabilities (debiti, accruals)
   - Equity (capitale + utili)
   - **Check: Assets = Liabilities + Equity**

---

## 📁 File Creati

### Services
- `/src/services/cogsCalculations.ts` ✅
- `/src/services/opexCalculations.ts` ✅

### Components
- `/src/components/PLPreviewCard.tsx` ✅

### Documentation
- `/MD_SVILUPPO/PUNTO3_COGS_GROSSMARGIN_OPEX.md` ✅

---

## 🎓 Concetti Chiave

### COGS (Cost of Goods Sold)
Costi **diretti** attribuibili alla produzione/erogazione del prodotto:
- Hardware: costo componenti + assemblaggio
- SaaS: cloud hosting + payment fees
- **Esclude:** personale, marketing, overhead

### Gross Margin
```
Gross Margin = Revenue - COGS
```
Indica quanto rimane dopo aver coperto i costi diretti.
**Target MedTech:** 60-85% blended

### OPEX (Operating Expenses)
Costi **operativi** non diretti:
- Staff (personale)
- R&D (sviluppo)
- Sales & Marketing
- G&A (General & Administrative)

### EBITDA
```
EBITDA = Gross Margin - OPEX
```
Earnings Before Interest, Taxes, Depreciation, Amortization.
**Indica:** Profittabilità operativa prima di finanza/accounting.

### Burn Rate
```
Burn Rate = |EBITDA| / 12    (se negativo)
```
Quanto cash brucia l'azienda al mese.

### Runway
```
Runway = Cash Balance / Burn Rate
```
Quanti mesi di operatività rimangono.

---

## 🚀 Risultato

Un sistema completo per calcolare e visualizzare:
- ✅ **COGS** per tutte le linee di business
- ✅ **Gross Margin** con % e breakdown
- ✅ **OPEX** integrato con Budget esistente
- ✅ **EBITDA** e profittabilità operativa
- ✅ **Burn Rate & Runway** automatici

Tutto **trasparente, calcolato runtime, e collegato al database centralizzato**! 🎉
