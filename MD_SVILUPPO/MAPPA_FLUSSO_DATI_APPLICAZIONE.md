# 🗺️ MAPPA FLUSSO DATI - ECO 3D FINANCIAL DASHBOARD

**Versione:** 1.0  
**Data:** 2025-10-15  
**Scopo:** Documentare il flusso completo dei dati tra tutte le sezioni dell'applicazione per facilitare il debug del Piano Finanziario

---

## 📊 ARCHITETTURA GENERALE

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE.JSON (SSOT)                          │
│  Single Source of Truth - Tutti i dati vivono qui              │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
            │   MERCATO    │ │  GTM ENGINE │ │ REVENUE MODEL│
            │  TAM/SAM/SOM │ │             │ │              │
            └──────────────┘ └─────────────┘ └──────────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │     PIANO FINANZIARIO        │
                    │  - Conto Economico (P&L)    │
                    │  - Cash Flow Statement       │
                    │  - Stato Patrimoniale        │
                    └──────────────────────────────┘
```

---

## 🎯 SEZIONE 1: MERCATO (TAM/SAM/SOM)

### **OUTPUT (Cosa produce)**

**Path:** `database.json → configurazioneTamSamSom.ecografi`

```json
{
  "prezzoMedioDispositivo": 40000,     // ✅ SSOT per ASP
  "prezziMediDispositivi": {           // ASP per tipo
    "carrellati": 50000,
    "portatili": 25001,
    "palmari": 6000
  },
  "valoriCalcolati": {                 // Valori di mercato (€)
    "tam": 10237280000,                // Total Addressable Market
    "sam": 2195508.37,                 // Serviceable Addressable Market
    "som1": 43910,                     // Year 1
    "som3": 131731,                    // Year 3
    "som5": 219552                     // Year 5
  },
  "dispositiviUnita": {                // 🆕 UNITÀ di dispositivi
    "tam": 255932,
    "sam": 54888,
    "som1": 1,                         // Year 1: 1 dispositivo
    "som2": 1,                         // Year 2: 1 dispositivo (interpolato)
    "som3": 3,                         // Year 3: 3 dispositivi
    "som4": 4,                         // Year 4: 4 dispositivi (interpolato)
    "som5": 5                          // Year 5: 5 dispositivi
  },
  "regioniAttive": {
    "italia": true,
    "europa": false,
    "usa": false,
    "cina": false
  }
}
```

### **CHI LO USA**

✅ **GTM Engine** → Per calcolare capacità vs domanda  
✅ **Revenue Model** → Per ASP e unità vendute  
✅ **Conto Economico** → Per ricavi target

---

## 🚀 SEZIONE 2: GTM ENGINE (Go-To-Market)

### **INPUT (Cosa riceve)**

1. **Da TAM/SAM/SOM:**
   - `dispositiviUnita.som1`, `som3`, `som5` → Domanda di mercato (unità)
   - `prezzoMedioDispositivo` → Per calcolare valore vendite

2. **Configurazione Interna:**
   - `salesCapacity.repsByYear` → Numero commerciali per anno
   - `salesCapacity.dealsPerRepPerQuarter` → Deal per rep per trimestre
   - `salesCycle.bySegment` → Mesi per chiudere deal per segmento
   - `salesCycle.salesMix` → Mix vendite per segmento (pubblico/privato/research)
   - `conversionFunnel` → Lead → Demo → Pilot → Deal
   - `adoptionCurve` → Tasso di adozione mercato per anno

### **OUTPUT (Cosa produce)**

**Path:** `database.json → goToMarket.calculated`

```json
{
  "maxSalesCapacity": {              // Capacità commerciale MASSIMA
    "y1": 15,                        // Year 1: max 15 dispositivi
    "y2": 40,
    "y3": 60,
    "y4": 100,
    "y5": 160
  },
  "realisticSales": {                // 🎯 VENDITE REALISTICHE (SSOT per Ricavi!)
    "y1": 5,                         // Year 1: 5 dispositivi venduti
    "y2": 25,
    "y3": 55,
    "y4": 92,
    "y5": 140
  },
  "constrainingFactor": {            // Cosa limita le vendite
    "y1": "market",                  // Limitati da domanda
    "y2": "market",
    "y3": "capacity",                // Limitati da team commerciale
    "y4": "capacity",
    "y5": "market"
  },
  "details": {                       // Dettaglio per anno
    "y1": {
      "somTarget": 28,               // Target SOM (unità)
      "somAdjustedByAdoption": 5,    // SOM × adoptionRate
      "capacityBeforeChannels": 15,  // Capacità teorica
      "capacityAfterChannels": 13,   // Capacità × channelEfficiency
      "realisticSales": 5,           // MIN(capacity, demand)
      "constrainingFactor": "market",
      "adoptionRate": 0.2,           // 20% adozione anno 1
      "channelEfficiency": 0.92      // 92% efficienza canali
    }
    // ... y2, y3, y4, y5
  }
}
```

### **FORMULE CHIAVE**

```typescript
// 1. Capacità Commerciale
maxSalesCapacity[year] = 
  reps[year] × dealsPerRepPerQuarter × 4 × rampFactor

// 2. Vendite Realistiche (SSOT per Ricavi!)
realisticSales[year] = MIN(
  somTarget[year] × adoptionRate[year],
  maxSalesCapacity[year] × channelEfficiency
)

// 3. Fattore Limitante
if (realisticSales === capacityAdjusted) → "capacity"
if (realisticSales === somAdjusted) → "market"
```

### **CHI LO USA**

✅ **Revenue Model** → `realisticSales` = unità vendute per anno  
✅ **Marketing Plan** → Budget marketing basato su lead necessari  
✅ **Conto Economico** → Ricavi = realisticSales × ASP

---

## 💰 SEZIONE 3: REVENUE MODEL

### **INPUT (Cosa riceve)**

1. **Da GTM Engine:**
   - `goToMarket.calculated.realisticSales` → Unità vendute per anno
   
2. **Da TAM/SAM/SOM:**
   - `configurazioneTamSamSom.ecografi.prezzoMedioDispositivo` → ASP medio
   - `configurazioneTamSamSom.ecografi.prezziMediDispositivi` → ASP per tipo

3. **Configurazione Interna:**
   - `revenueModel.hardware.unitCostByType` → COGS per dispositivo
   - `revenueModel.saas.pricing.perDevice` → Fee SaaS per dispositivo
   - `revenueModel.saas.pricing.perScan` → Fee SaaS per scansione

### **CALCOLI (Cosa calcola)**

#### **A. RICAVI HARDWARE**

```typescript
// Per ogni anno
hardwareRevenue[year] = realisticSales[year] × ASP

// Esempio Year 1:
hardwareRevenue[Y1] = 5 dispositivi × €40,000 = €200,000
```

#### **B. RICAVI SAAS (Ricorrenti)**

```typescript
// Modello Per Dispositivo
installedBase[year] = Σ(realisticSales[0..year])
activeDevices[year] = installedBase[year] × activationRate
saasRevenuePerDevice[year] = activeDevices[year] × annualFee

// Modello Per Scansione
scansPerYear[year] = activeDevices[year] × scansPerMonth × 12
saasRevenuePerScan[year] = scansPerYear[year] × feePerScan

// Totale SaaS
saasRevenue[year] = saasRevenuePerDevice + saasRevenuePerScan
```

#### **C. COGS (Cost of Goods Sold)**

```typescript
// Hardware COGS
hardwareCOGS[year] = realisticSales[year] × unitCost

// SaaS COGS (server, licenze, supporto)
saasCOGS[year] = saasRevenue[year] × (1 - grossMargin)

// Totale COGS
totalCOGS[year] = hardwareCOGS + saasCOGS
```

### **OUTPUT (Cosa produce)**

**Path:** `database.json → revenueModel.projections` (da calcolare)

```json
{
  "y1": {
    "hardware": {
      "units": 5,                    // Da GTM realisticSales
      "asp": 40000,                  // Da TAM/SAM/SOM
      "revenue": 200000,             // 5 × 40k
      "cogs": 125000,                // 5 × 25k (50% margin)
      "grossProfit": 75000,
      "grossMargin": 0.375
    },
    "saas": {
      "installedBase": 5,
      "activeDevices": 4,            // 5 × 0.8 activation
      "revenue": 22000,              // 4 × 5.5k/year
      "cogs": 3300,                  // 15% COGS
      "grossProfit": 18700,
      "grossMargin": 0.85
    },
    "total": {
      "revenue": 222000,
      "cogs": 128300,
      "grossProfit": 93700,
      "grossMargin": 0.422
    }
  }
  // ... y2, y3, y4, y5
}
```

### **CHI LO USA**

✅ **Conto Economico** → Ricavi e COGS  
✅ **Cash Flow** → Variazioni working capital (DSO, inventario)  
✅ **Stato Patrimoniale** → Inventario, crediti

---

## 📈 SEZIONE 4: CONTO ECONOMICO (P&L)

### **INPUT (Cosa riceve)**

1. **Da Revenue Model:**
   - `total.revenue` → Ricavi totali per anno
   - `total.cogs` → COGS totali per anno
   - `total.grossProfit` → Margine lordo

2. **Da GTM Engine (Marketing):**
   - `goToMarket.marketingPlan.projections[year].budgetMarketing` → Spese marketing

3. **Da Budget (OPEX):**
   - `budget.opex.personnel` → Stipendi
   - `budget.opex.facilities` → Affitti, utenze
   - `budget.opex.rd` → R&D
   - `budget.opex.gna` → General & Admin

### **CALCOLI (Cosa calcola)**

```typescript
// 1. Margine Lordo
grossProfit = revenue - COGS

// 2. EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization)
EBITDA = grossProfit - OPEX

// 3. EBIT (Operating Income)
EBIT = EBITDA - depreciation - amortization

// 4. Net Income
netIncome = EBIT - interest - taxes
```

### **OUTPUT (Cosa produce)**

**Path:** `database.json → contoEconomico.proiezioni` (da verificare/fixare)

```json
{
  "y1": {
    "revenue": 222000,               // Da Revenue Model
    "cogs": 128300,                  // Da Revenue Model
    "grossProfit": 93700,
    "grossMargin": 0.422,
    
    "opex": {
      "marketing": 50000,            // Da GTM Marketing Plan
      "sales": 120000,               // Stipendi commerciali (2 reps)
      "rd": 150000,                  // R&D team
      "gna": 80000,                  // Admin, contabilità
      "total": 400000
    },
    
    "ebitda": -306300,               // Negativo anno 1 (investimento)
    "ebitdaMargin": -1.38,
    
    "depreciation": 20000,           // CAPEX ammortizzato
    "ebit": -326300,
    
    "interest": 0,
    "taxes": 0,
    "netIncome": -326300
  }
  // ... y2, y3, y4, y5
}
```

---

## 💵 SEZIONE 5: CASH FLOW STATEMENT

### **INPUT (Cosa riceve)**

1. **Da Conto Economico:**
   - `netIncome` → Utile/perdita netta
   - `depreciation` + `amortization` → Add-back non-cash

2. **Da Stato Patrimoniale (Working Capital):**
   - `Δ accountsReceivable` → Variazione crediti
   - `Δ inventory` → Variazione inventario
   - `Δ accountsPayable` → Variazione debiti

3. **Da Budget (CAPEX):**
   - `capex.equipment` → Acquisto macchinari
   - `capex.intangibles` → Software, brevetti

### **CALCOLI (Cosa calcola)**

```typescript
// 1. Operating Cash Flow (OCF)
OCF = netIncome 
    + depreciation + amortization
    - Δ accountsReceivable
    - Δ inventory
    + Δ accountsPayable

// 2. Investing Cash Flow (ICF)
ICF = - capex - acquisitions

// 3. Financing Cash Flow (FCF)
FCF = equity_raised + debt_borrowed - debt_repaid

// 4. Free Cash Flow
freeCashFlow = OCF + ICF

// 5. Ending Cash
endingCash = beginningCash + OCF + ICF + FCF
```

### **OUTPUT (Cosa produce)**

```json
{
  "y1": {
    "operatingCashFlow": -280000,    // Negativo (investimento)
    "investingCashFlow": -150000,    // CAPEX
    "financingCashFlow": 500000,     // Equity round
    "freeCashFlow": -430000,
    "endingCash": 70000,
    "burnRate": -23333,              // € al mese
    "runway": 3                      // Mesi rimanenti
  }
}
```

---

## 🏦 SEZIONE 6: STATO PATRIMONIALE (Balance Sheet)

### **INPUT (Cosa riceve)**

1. **Da Cash Flow:**
   - `endingCash` → Cassa disponibile

2. **Da Revenue Model:**
   - `revenue × DSO / 365` → Crediti (Accounts Receivable)
   - `cogs × inventoryTurnover` → Inventario

3. **Da Budget:**
   - `capex` → Property, Plant & Equipment (PP&E)
   - `intangibles` → Software, brevetti

### **CALCOLI (Cosa calcola)**

```typescript
// ASSETS
currentAssets = cash + accountsReceivable + inventory
fixedAssets = PPE + intangibles - accumulatedDepreciation
totalAssets = currentAssets + fixedAssets

// LIABILITIES
currentLiabilities = accountsPayable + accruedExpenses
longTermLiabilities = longTermDebt
totalLiabilities = currentLiabilities + longTermLiabilities

// EQUITY
equity = totalAssets - totalLiabilities

// VERIFICA
assets === liabilities + equity  // Deve essere TRUE!
```

---

## 🔗 MAPPA DIPENDENZE - ORDINE DI CALCOLO

### **PRIORITÀ 1: FONDAMENTA** (già fatto ✅)

```
1. TAM/SAM/SOM → Produce: dispositiviUnita, prezzoMedioDispositivo
2. GTM Engine → Produce: realisticSales (da TAM/SAM/SOM)
```

### **PRIORITÀ 2: RICAVI** (da fixare 🔧)

```
3. Revenue Model → Produce: revenue, COGS (da realisticSales)
   - Dipende da: GTM.realisticSales, TAM/SAM/SOM.prezzoMedioDispositivo
```

### **PRIORITÀ 3: PIANO FINANZIARIO** (da debuggare 🐛)

```
4. Conto Economico → Produce: netIncome, EBITDA
   - Dipende da: Revenue Model (revenue, COGS), Budget (OPEX)

5. Cash Flow → Produce: endingCash, burnRate, runway
   - Dipende da: Conto Economico (netIncome), Stato Patrimoniale (Δ WC)

6. Stato Patrimoniale → Produce: assets, liabilities, equity
   - Dipende da: Cash Flow (cash), Revenue Model (AR, inventory)
```

---

## 📋 CHECKLIST PRE-DEBUG PIANO FINANZIARIO

### **✅ VERIFICHE COMPLETATE**

- [x] TAM/SAM/SOM produce `dispositiviUnita` corretti
- [x] GTM Engine produce `realisticSales` corretti
- [x] GTM Engine salva in `goToMarket.calculated`
- [x] Sales Mix salvato in `goToMarket.salesCycle.salesMix`
- [x] Pattern standardizzato per tutti i componenti

### **🔧 DA VERIFICARE**

- [ ] **Revenue Model** legge correttamente `realisticSales` da GTM
- [ ] **Revenue Model** calcola ricavi per tutti i 5 anni
- [ ] **Revenue Model** salva proiezioni in `revenueModel.projections`
- [ ] **Conto Economico** legge ricavi da Revenue Model
- [ ] **Conto Economico** legge OPEX da Budget
- [ ] **Cash Flow** calcola OCF correttamente
- [ ] **Stato Patrimoniale** bilancia (assets = liabilities + equity)

---

## 🎯 PROSSIMI PASSI

### **STEP 1: Verificare Revenue Model**

```typescript
// Verificare che legga da GTM:
const realisticSales = data?.goToMarket?.calculated?.realisticSales;
const asp = data?.configurazioneTamSamSom?.ecografi?.prezzoMedioDispositivo;

// Deve calcolare:
revenue[year] = realisticSales[year] × asp
```

### **STEP 2: Debuggare Conto Economico**

```typescript
// Verificare che legga da Revenue Model:
const revenue = data?.revenueModel?.projections?.[year]?.total?.revenue;
const cogs = data?.revenueModel?.projections?.[year]?.total?.cogs;
const opex = data?.budget?.opex?.[year] || calcolaOpexDaGTM(year);

// Deve calcolare:
ebitda = (revenue - cogs) - opex
```

### **STEP 3: Debuggare Cash Flow**

```typescript
// Verificare che legga da Conto Economico:
const netIncome = data?.contoEconomico?.proiezioni?.[year]?.netIncome;
const depreciation = data?.contoEconomico?.proiezioni?.[year]?.depreciation;

// Verificare working capital:
const deltaAR = accountsReceivable[year] - accountsReceivable[year-1];

// Deve calcolare:
ocf = netIncome + depreciation - deltaAR - ...
```

### **STEP 4: Debuggare Stato Patrimoniale**

```typescript
// Verificare che bilancia:
const totalAssets = currentAssets + fixedAssets;
const totalLiabilitiesAndEquity = liabilities + equity;

if (totalAssets !== totalLiabilitiesAndEquity) {
  console.error('❌ BALANCE SHEET NON BILANCIATO!');
}
```

---

## 📊 METRICHE CHIAVE DA MONITORARE

### **Growth Metrics**

- **Revenue Growth (YoY):** `(revenue[n] - revenue[n-1]) / revenue[n-1]`
- **Unit Sales Growth:** `(realisticSales[n] - realisticSales[n-1]) / realisticSales[n-1]`
- **ARR Growth (SaaS):** `(saasRevenue[n] - saasRevenue[n-1]) / saasRevenue[n-1]`

### **Profitability Metrics**

- **Gross Margin:** `(revenue - COGS) / revenue`
- **EBITDA Margin:** `EBITDA / revenue`
- **Net Margin:** `netIncome / revenue`
- **Break-Even Point:** Primo anno con `EBITDA >= 0`

### **Efficiency Metrics**

- **CAC (Customer Acquisition Cost):** `marketingSpend / newCustomers`
- **LTV (Lifetime Value):** `ARPU / churnRate`
- **LTV/CAC Ratio:** Deve essere `>= 3`
- **Payback Period:** Mesi per recuperare CAC

### **Cash Metrics**

- **Burn Rate:** `Δ cash / mesi` (negativo = brucia cassa)
- **Runway:** `cash / burnRate` (mesi rimanenti)
- **Free Cash Flow:** `OCF - CAPEX`

---

## 🚨 POTENZIALI PROBLEMI DA VERIFICARE

### **1. Disallineamento Unità vs Valore**

```typescript
// ❌ ERRORE COMUNE:
revenue = dispositiviUnita.som1  // Som1 è in EURO, non unità!

// ✅ CORRETTO:
revenue = realisticSales.y1 × prezzoMedioDispositivo
```

### **2. Missing Data Checks**

```typescript
// ❌ ERRORE: Non verifica se i dati esistono
const revenue = data.revenueModel.projections.y1.revenue;

// ✅ CORRETTO: Usa optional chaining
const revenue = data?.revenueModel?.projections?.y1?.revenue ?? 0;
```

### **3. Calcoli Duplicati**

```typescript
// ❌ PROBLEMA: Calcola in più posti diversi
// Component A: revenue = sales × price
// Component B: revenue = units × asp
// → Rischio di inconsistenza!

// ✅ SOLUZIONE: Calcola UNA VOLTA, salva nel database
```

---

## 📖 RIFERIMENTI

- **Database:** `/src/data/database.json`
- **GTM Engine:** `/src/components/GTMEngineUnified.tsx`
- **Revenue Model:** `/src/components/RevenueModel/RevenueModelDashboard.tsx`
- **Conto Economico:** `/src/components/ContoEconomico/*.tsx`
- **Cash Flow:** `/src/services/cashFlowCalculations.ts`
- **Stato Patrimoniale:** `/src/components/StatoPatrimoniale/*.tsx`

---

**Fine Documento** 🎯
