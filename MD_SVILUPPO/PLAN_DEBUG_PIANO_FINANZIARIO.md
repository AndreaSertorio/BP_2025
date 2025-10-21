# 🐛 PIANO DI DEBUG - PIANO FINANZIARIO

**Versione:** 1.0  
**Data:** 2025-10-15  
**Obiettivo:** Debuggare sistematicamente Conto Economico, Cash Flow e Stato Patrimoniale

---

## 📋 STEP-BY-STEP DEBUG WORKFLOW

### **FASE 1: VERIFICA PREREQUISITI** ✅ (COMPLETATA)

- [x] TAM/SAM/SOM produce `dispositiviUnita` corretti
- [x] TAM/SAM/SOM produce `prezzoMedioDispositivo` (SSOT)
- [x] GTM Engine produce `realisticSales` corretti
- [x] GTM Engine salva in `goToMarket.calculated`
- [x] Sales Mix funziona e salva correttamente

**Risultato:** ✅ Fondamenta solide!

---

### **FASE 2: AUDIT REVENUE MODEL** 🔍 (DA FARE)

#### **2.1 - Verificare Inputs**

```typescript
// File: src/components/RevenueModel/RevenueModelDashboard.tsx

// 1. Verifica che legge realisticSales da GTM
const gtm = data?.goToMarket?.calculated;
const realisticSales = {
  y1: gtm?.realisticSales?.y1 ?? 0,
  y2: gtm?.realisticSales?.y2 ?? 0,
  y3: gtm?.realisticSales?.y3 ?? 0,
  y4: gtm?.realisticSales?.y4 ?? 0,
  y5: gtm?.realisticSales?.y5 ?? 0
};

console.log('🔍 Revenue Model - Realistic Sales:', realisticSales);

// 2. Verifica ASP
const asp = data?.configurazioneTamSamSom?.ecografi?.prezzoMedioDispositivo;
console.log('🔍 Revenue Model - ASP:', asp);

// 3. Verifica COGS
const hardwareCOGS = data?.revenueModel?.hardware?.unitCost;
console.log('🔍 Revenue Model - Hardware COGS:', hardwareCOGS);
```

**Domande da fare:**
- [ ] Il Revenue Model legge correttamente `realisticSales` da GTM?
- [ ] Usa l'ASP corretto da TAM/SAM/SOM?
- [ ] I COGS sono configurati correttamente?

#### **2.2 - Verificare Calcoli**

```typescript
// Calcolo ricavi hardware per Year 1
const y1Revenue = realisticSales.y1 * asp;
console.log('💰 Y1 Hardware Revenue (atteso):', y1Revenue);

// Esempio:
// 5 unità × €40,000 = €200,000
```

**Test:**
```typescript
// TEST 1: Hardware Revenue
expect(y1Revenue).toBe(5 * 40000);  // €200,000

// TEST 2: Hardware COGS
const y1COGS = realisticSales.y1 * hardwareCOGS;
expect(y1COGS).toBe(5 * 20000);  // €100,000 (50% margin)

// TEST 3: Gross Margin
const grossMargin = (y1Revenue - y1COGS) / y1Revenue;
expect(grossMargin).toBeCloseTo(0.5);  // 50%
```

#### **2.3 - Verificare Output**

```typescript
// Verifica che salva le proiezioni
const projections = data?.revenueModel?.projections;

console.log('📊 Revenue Model Projections:', {
  y1: projections?.y1,
  y2: projections?.y2,
  y3: projections?.y3,
  y4: projections?.y4,
  y5: projections?.y5
});
```

**Domande:**
- [ ] Le proiezioni vengono salvate nel database?
- [ ] Sono accessibili dalle altre sezioni?
- [ ] Vengono ricalcolate quando cambiano i parametri?

---

### **FASE 3: AUDIT CONTO ECONOMICO** 📈 (DA FARE)

#### **3.1 - Identificare File Componenti**

```bash
# Trovare i file del Conto Economico
find src/components -name "*ContoEconomico*" -o -name "*PL*" -o -name "*IncomeStatement*"
```

#### **3.2 - Verificare Inputs**

```typescript
// File: src/components/ContoEconomico/ContoEconomicoDashboard.tsx (o simile)

// 1. Ricavi da Revenue Model
const revenue = data?.revenueModel?.projections?.y1?.total?.revenue;
console.log('🔍 P&L - Revenue (da Revenue Model):', revenue);

// 2. COGS da Revenue Model
const cogs = data?.revenueModel?.projections?.y1?.total?.cogs;
console.log('🔍 P&L - COGS (da Revenue Model):', cogs);

// 3. OPEX da Budget o GTM
const marketing = data?.goToMarket?.marketingPlan?.projections?.y1?.calculated?.budgetMarketing;
const opex = data?.budget?.opex?.y1;
console.log('🔍 P&L - OPEX:', { marketing, opex });
```

**Domande:**
- [ ] Il Conto Economico legge ricavi da Revenue Model?
- [ ] Usa i COGS corretti?
- [ ] Include tutte le voci di OPEX (Marketing, Sales, R&D, G&A)?

#### **3.3 - Verificare Calcoli**

```typescript
// Calcoli P&L
const grossProfit = revenue - cogs;
const totalOpex = marketing + (opex?.personnel ?? 0) + (opex?.facilities ?? 0) + (opex?.rd ?? 0);
const ebitda = grossProfit - totalOpex;

console.log('📊 P&L Calculations:', {
  revenue,
  cogs,
  grossProfit,
  grossMargin: (grossProfit / revenue * 100).toFixed(1) + '%',
  totalOpex,
  ebitda,
  ebitdaMargin: (ebitda / revenue * 100).toFixed(1) + '%'
});
```

**Test:**
```typescript
// Year 1 Example (5 dispositivi venduti)
// Revenue: €200,000 (hardware) + €22,000 (SaaS) = €222,000
// COGS: €100,000 (hardware) + €3,300 (SaaS 15%) = €103,300
// Gross Profit: €118,700
// OPEX: €50k (marketing) + €120k (sales) + €150k (R&D) + €80k (G&A) = €400k
// EBITDA: €118,700 - €400,000 = -€281,300 (negativo, normale per startup!)
```

#### **3.4 - Verificare Output**

```typescript
// Verifica che salva i dati calcolati
const savedData = data?.contoEconomico?.proiezioni?.y1;

console.log('💾 Saved P&L Data:', savedData);
```

**Checklist:**
- [ ] EBITDA calcolato correttamente
- [ ] EBITDA Margin calcolato
- [ ] Break-Even year identificato (primo anno EBITDA >= 0)
- [ ] Dati salvati nel database
- [ ] Grafici mostrano dati corretti

---

### **FASE 4: AUDIT CASH FLOW** 💵 (DA FARE)

#### **4.1 - Verificare Inputs**

```typescript
// File: src/services/cashFlowCalculations.ts o simile

// 1. Net Income da Conto Economico
const netIncome = data?.contoEconomico?.proiezioni?.y1?.netIncome;
console.log('🔍 Cash Flow - Net Income:', netIncome);

// 2. Depreciation (add-back non-cash)
const depreciation = data?.contoEconomico?.proiezioni?.y1?.depreciation;
console.log('🔍 Cash Flow - Depreciation:', depreciation);

// 3. Working Capital Changes
const ar = data?.statoPatrimoniale?.assets?.current?.accountsReceivable;
const inventory = data?.statoPatrimoniale?.assets?.current?.inventory;
const ap = data?.statoPatrimoniale?.liabilities?.current?.accountsPayable;
console.log('🔍 Cash Flow - Working Capital:', { ar, inventory, ap });

// 4. CAPEX
const capex = data?.budget?.capex?.y1;
console.log('🔍 Cash Flow - CAPEX:', capex);
```

#### **4.2 - Verificare Calcoli**

```typescript
// Operating Cash Flow (OCF)
const ocf = netIncome + depreciation - (ar_change + inventory_change - ap_change);
console.log('💰 Operating Cash Flow:', ocf);

// Free Cash Flow
const fcf = ocf - capex;
console.log('💰 Free Cash Flow:', fcf);

// Burn Rate (se negativo)
const burnRate = fcf < 0 ? fcf / 12 : 0;  // € al mese
console.log('🔥 Burn Rate:', burnRate, '€/mese');

// Runway
const cash = data?.statoPatrimoniale?.assets?.current?.cash ?? 0;
const runway = burnRate < 0 ? Math.abs(cash / burnRate) : Infinity;
console.log('⏱️ Runway:', runway.toFixed(1), 'mesi');
```

**Test:**
```typescript
// Year 1 Example (startup in perdita)
// Net Income: -€300,000
// Depreciation: +€20,000
// Δ AR: -€30,000 (aumento crediti = uso cassa)
// Δ Inventory: -€20,000 (aumento stock)
// Δ AP: +€15,000 (aumento debiti = risparmio cassa)
// OCF: -€300k + €20k - €30k - €20k + €15k = -€315,000
// CAPEX: -€150,000
// FCF: -€465,000
// Burn Rate: -€38,750/mese
```

#### **4.3 - Verificare Financing**

```typescript
// Se la startup ha bisogno di finanziamenti
if (fcf < 0 && cash + fcf < 0) {
  console.warn('⚠️ SERVE FUNDING! Cash insufficiente per coprire burn rate');
  
  // Quanto serve?
  const fundingNeeded = Math.abs(fcf) - cash;
  console.log('💰 Funding necessario:', fundingNeeded);
}
```

---

### **FASE 5: AUDIT STATO PATRIMONIALE** 🏦 (DA FARE)

#### **5.1 - Verificare Struttura**

```typescript
// File: src/components/StatoPatrimoniale/*.tsx

// ASSETS = LIABILITIES + EQUITY (deve bilanciare!)
const assets = {
  current: {
    cash: data?.statoPatrimoniale?.assets?.current?.cash ?? 0,
    accountsReceivable: 0,  // Da calcolare
    inventory: 0            // Da calcolare
  },
  fixed: {
    ppe: 0,                 // Property, Plant & Equipment
    intangibles: 0          // Software, brevetti
  }
};

const liabilities = {
  current: {
    accountsPayable: 0,     // Da calcolare
    accruedExpenses: 0
  },
  longTerm: {
    debt: 0
  }
};

const equity = {
  capital: 500000,          // Equity rounds
  retainedEarnings: 0       // Cumulative net income
};
```

#### **5.2 - Calcolare Working Capital**

```typescript
// Accounts Receivable (crediti verso clienti)
const dso = data?.statoPatrimoniale?.workingCapital?.dso ?? 60;  // giorni
const revenue = data?.revenueModel?.projections?.y1?.total?.revenue ?? 0;
const ar = (revenue * dso) / 365;
console.log('💰 Accounts Receivable:', ar);

// Inventory (magazzino)
const inventoryTurnover = 6;  // volte all'anno
const cogs = data?.revenueModel?.projections?.y1?.total?.cogs ?? 0;
const inventory = cogs / inventoryTurnover;
console.log('📦 Inventory:', inventory);

// Accounts Payable (debiti verso fornitori)
const dpo = data?.statoPatrimoniale?.workingCapital?.dpo ?? 45;  // giorni
const ap = (cogs * dpo) / 365;
console.log('💳 Accounts Payable:', ap);
```

#### **5.3 - Verificare Bilanciamento**

```typescript
// CRITICAL: Assets DEVE essere uguale a Liabilities + Equity!
const totalAssets = 
  assets.current.cash + 
  assets.current.accountsReceivable + 
  assets.current.inventory + 
  assets.fixed.ppe + 
  assets.fixed.intangibles;

const totalLiabilities = 
  liabilities.current.accountsPayable + 
  liabilities.current.accruedExpenses + 
  liabilities.longTerm.debt;

const totalEquity = equity.capital + equity.retainedEarnings;

const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

if (!isBalanced) {
  console.error('❌ BALANCE SHEET NON BILANCIATO!');
  console.error('Assets:', totalAssets);
  console.error('Liabilities + Equity:', totalLiabilities + totalEquity);
  console.error('Differenza:', totalAssets - (totalLiabilities + totalEquity));
} else {
  console.log('✅ Balance Sheet bilanciato!');
}
```

---

## 🔧 TOOLKIT DI DEBUG

### **1. Logger Helper**

```typescript
// src/utils/debugLogger.ts
export function logFinancialData(label: string, data: any) {
  console.group(`📊 ${label}`);
  console.table(data);
  console.groupEnd();
}

// Uso:
logFinancialData('Revenue Model Y1', {
  units: 5,
  asp: 40000,
  revenue: 200000,
  cogs: 100000,
  grossProfit: 100000,
  margin: '50%'
});
```

### **2. Validation Helper**

```typescript
// src/utils/validation.ts
export function validateFinancialData(data: any) {
  const errors: string[] = [];
  
  // Check Revenue Model
  if (!data?.revenueModel?.projections) {
    errors.push('Revenue Model: Proiezioni mancanti');
  }
  
  // Check Conto Economico
  if (!data?.contoEconomico?.proiezioni) {
    errors.push('Conto Economico: Proiezioni mancanti');
  }
  
  // Check Balance Sheet bilanciato
  const assets = calculateTotalAssets(data);
  const liabilitiesEquity = calculateTotalLiabilitiesEquity(data);
  if (Math.abs(assets - liabilitiesEquity) > 1) {
    errors.push(`Balance Sheet: Non bilanciato (diff: €${(assets - liabilitiesEquity).toFixed(2)})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### **3. Test Suite**

```typescript
// src/__tests__/financial.test.ts
describe('Financial Calculations', () => {
  test('Hardware Revenue = Units × ASP', () => {
    const units = 5;
    const asp = 40000;
    const revenue = units * asp;
    expect(revenue).toBe(200000);
  });
  
  test('Gross Margin = (Revenue - COGS) / Revenue', () => {
    const revenue = 200000;
    const cogs = 100000;
    const margin = (revenue - cogs) / revenue;
    expect(margin).toBe(0.5);  // 50%
  });
  
  test('EBITDA = Gross Profit - OPEX', () => {
    const grossProfit = 100000;
    const opex = 400000;
    const ebitda = grossProfit - opex;
    expect(ebitda).toBe(-300000);  // Negativo year 1
  });
  
  test('Balance Sheet bilanciato', () => {
    const assets = 1000000;
    const liabilities = 200000;
    const equity = 800000;
    expect(assets).toBe(liabilities + equity);
  });
});
```

---

## 📊 CHECKLIST FINALE

### **Revenue Model**
- [ ] Legge `realisticSales` da GTM
- [ ] Usa ASP da TAM/SAM/SOM
- [ ] Calcola ricavi hardware correttamente
- [ ] Calcola ricavi SaaS correttamente
- [ ] Calcola COGS correttamente
- [ ] Salva proiezioni in database
- [ ] Auto-save funziona

### **Conto Economico**
- [ ] Legge ricavi da Revenue Model
- [ ] Legge COGS da Revenue Model
- [ ] Include tutte le voci OPEX
- [ ] Calcola EBITDA correttamente
- [ ] Calcola Net Income correttamente
- [ ] Identifica Break-Even year
- [ ] Mostra grafici corretti
- [ ] Salva dati in database

### **Cash Flow**
- [ ] Legge Net Income da P&L
- [ ] Include add-back depreciation
- [ ] Calcola Δ Working Capital
- [ ] Include CAPEX
- [ ] Include Financing Cash Flow
- [ ] Calcola Burn Rate
- [ ] Calcola Runway
- [ ] Alert se cash insufficiente

### **Stato Patrimoniale**
- [ ] Calcola AR (DSO method)
- [ ] Calcola Inventory (turnover method)
- [ ] Calcola AP (DPO method)
- [ ] Include Fixed Assets
- [ ] Include Liabilities
- [ ] Include Equity
- [ ] **BILANCIATO**: Assets = Liabilities + Equity ✅
- [ ] Aggiorna ogni anno

---

## 🚀 ORDINE DI ESECUZIONE

1. **Verifica Revenue Model** → Assicurati che produca dati corretti
2. **Aggiusta Conto Economico** → Usa i dati da Revenue Model
3. **Aggiusta Cash Flow** → Usa i dati da P&L
4. **Aggiusta Balance Sheet** → Usa i dati da Cash Flow e P&L
5. **Test End-to-End** → Verifica che tutto sia connesso
6. **Aggiungi Scenari** → Prudente, Base, Ottimista

---

## 📖 DOCUMENTI DI RIFERIMENTO

- **Mappa Flusso Dati:** `MAPPA_FLUSSO_DATI_APPLICAZIONE.md`
- **Quick Reference:** `QUICK_REFERENCE_DATA_KEYS.md`
- **Database:** `/src/data/database.json`

---

**Pronto per iniziare il debug!** 🎯
