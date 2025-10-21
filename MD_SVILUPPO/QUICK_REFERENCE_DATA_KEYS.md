# 🔑 QUICK REFERENCE - DATA KEYS

**Guida rapida per accedere ai dati dal database.json**

---

## 📊 TAM/SAM/SOM - MERCATO DISPOSITIVI

### **Path:** `data.configurazioneTamSamSom.ecografi`

```typescript
import { useDatabase } from '@/contexts/DatabaseProvider';

const { data } = useDatabase();
const configDevices = data?.configurazioneTamSamSom?.ecografi;

// ✅ ASP (Average Selling Price) - SSOT
const asp = configDevices?.prezzoMedioDispositivo ?? 40000;

// ASP per tipo dispositivo
const aspCarrellati = configDevices?.prezziMediDispositivi?.carrellati ?? 50000;
const aspPortatili = configDevices?.prezziMediDispositivi?.portatili ?? 25000;
const aspPalmari = configDevices?.prezziMediDispositivi?.palmari ?? 6000;

// Valori di mercato (€)
const tam = configDevices?.valoriCalcolati?.tam ?? 0;
const sam = configDevices?.valoriCalcolati?.sam ?? 0;
const som1 = configDevices?.valoriCalcolati?.som1 ?? 0;  // Year 1
const som3 = configDevices?.valoriCalcolati?.som3 ?? 0;  // Year 3
const som5 = configDevices?.valoriCalcolati?.som5 ?? 0;  // Year 5

// 🆕 UNITÀ dispositivi (numero pezzi, NON euro!)
const somUnits1 = configDevices?.dispositiviUnita?.som1 ?? 0;  // Year 1: unità
const somUnits3 = configDevices?.dispositiviUnita?.som3 ?? 0;  // Year 3: unità
const somUnits5 = configDevices?.dispositiviUnita?.som5 ?? 0;  // Year 5: unità

// Regioni attive
const italiaActive = configDevices?.regioniAttive?.italia ?? false;
```

**⚠️ ATTENZIONE:**
- `valoriCalcolati.som1` = **EURO** (valore di mercato)
- `dispositiviUnita.som1` = **UNITÀ** (numero dispositivi)

---

## 🚀 GTM ENGINE - VENDITE REALISTICHE

### **Path:** `data.goToMarket.calculated`

```typescript
const { data } = useDatabase();
const gtmCalculated = data?.goToMarket?.calculated;

// 🎯 VENDITE REALISTICHE (unità) - SSOT PER RICAVI!
const sales1 = gtmCalculated?.realisticSales?.y1 ?? 0;  // Year 1: 5 unità
const sales2 = gtmCalculated?.realisticSales?.y2 ?? 0;  // Year 2: 25 unità
const sales3 = gtmCalculated?.realisticSales?.y3 ?? 0;  // Year 3: 55 unità
const sales4 = gtmCalculated?.realisticSales?.y4 ?? 0;  // Year 4: 92 unità
const sales5 = gtmCalculated?.realisticSales?.y5 ?? 0;  // Year 5: 140 unità

// Capacità commerciale massima
const capacity1 = gtmCalculated?.maxSalesCapacity?.y1 ?? 0;

// Fattore limitante (chi limita le vendite?)
const constraint1 = gtmCalculated?.constrainingFactor?.y1;  // "market" | "capacity"

// Dettagli per anno
const y1Details = gtmCalculated?.details?.y1;
const somTarget = y1Details?.somTarget ?? 0;
const adoptionRate = y1Details?.adoptionRate ?? 0;
const channelEfficiency = y1Details?.channelEfficiency ?? 0;
```

### **Path:** `data.goToMarket.salesCapacity`

```typescript
const salesCapacity = data?.goToMarket?.salesCapacity;

// Commerciali per anno
const reps1 = salesCapacity?.repsByYear?.y1 ?? 1;
const reps5 = salesCapacity?.repsByYear?.y5 ?? 8;

// Deal per rep per trimestre
const dealsPerQ = salesCapacity?.dealsPerRepPerQuarter ?? 5;

// Mesi di ramp-up
const rampUp = salesCapacity?.rampUpMonths ?? 3;
```

### **Path:** `data.goToMarket.salesCycle`

```typescript
const salesCycle = data?.goToMarket?.salesCycle;

// Ciclo vendita per segmento (mesi)
const cyclePubblico = salesCycle?.bySegment?.pubblico ?? 10;
const cyclePrivato = salesCycle?.bySegment?.privato ?? 2;
const cycleResearch = salesCycle?.bySegment?.research ?? 2;

// Media pesata
const avgMonths = salesCycle?.avgMonths ?? 7;

// 🆕 Sales Mix (peso per segmento)
const salesMix = salesCycle?.salesMix;
const mixPubblico = salesMix?.pubblico ?? 0.6;   // 60%
const mixPrivato = salesMix?.privato ?? 0.3;     // 30%
const mixResearch = salesMix?.research ?? 0.1;   // 10%
```

### **Path:** `data.goToMarket.conversionFunnel`

```typescript
const funnel = data?.goToMarket?.conversionFunnel;

// Tassi di conversione
const l2d = funnel?.lead_to_demo ?? 0.1;      // 10%
const d2p = funnel?.demo_to_pilot ?? 0.5;     // 50%
const p2deal = funnel?.pilot_to_deal ?? 0.6;  // 60%

// Efficienza funnel totale
const funnelEfficiency = l2d * d2p * p2deal;  // 3%
```

### **Path:** `data.goToMarket.marketingPlan.projections`

```typescript
const marketingPlan = data?.goToMarket?.marketingPlan?.projections;

// Budget marketing per anno
const y1 = marketingPlan?.y1;
const budgetMarketing = y1?.calculated?.budgetMarketing ?? 0;
const budgetMonthly = y1?.calculated?.budgetMonthly ?? 0;
const leadsNeeded = y1?.calculated?.leadsNeeded ?? 0;
const cacEffettivo = y1?.calculated?.cacEffettivo ?? 0;
```

---

## 💰 REVENUE MODEL

### **Path:** `data.revenueModel.hardware`

```typescript
const { data } = useDatabase();
const hardware = data?.revenueModel?.hardware;

// Abilitato?
const hardwareEnabled = hardware?.enabled ?? true;

// COGS per tipo
const cogsCarrellati = hardware?.unitCostByType?.carrellati ?? 25000;
const cogsPortatili = hardware?.unitCostByType?.portatili ?? 10000;
const cogsPalmari = hardware?.unitCostByType?.palmari ?? 2000;

// Margin target per tipo
const marginCarrellati = hardware?.cogsMarginByType?.carrellati ?? 0.5;  // 50%

// Warranty
const warrantyPct = hardware?.warrantyPct ?? 0.03;  // 3%
```

### **Path:** `data.revenueModel.saas`

```typescript
const saas = data?.revenueModel?.saas;

// Abilitato?
const saasEnabled = saas?.enabled ?? true;

// Modello Per Dispositivo
const perDevice = saas?.pricing?.perDevice;
const perDeviceEnabled = perDevice?.enabled ?? true;
const monthlyFee = perDevice?.monthlyFee ?? 500;
const annualFee = perDevice?.annualFee ?? 5500;
const activationRate = perDevice?.activationRate ?? 0.8;  // 80%
const grossMargin = perDevice?.grossMarginPct ?? 0.85;    // 85%

// Modello Per Scansione
const perScan = saas?.pricing?.perScan;
const perScanEnabled = perScan?.enabled ?? false;
const feePerScan = perScan?.feePerScan ?? 1.5;
const scansPerMonth = perScan?.scansPerDevicePerMonth ?? 150;
```

---

## 📈 CONTO ECONOMICO

### **Path:** `data.contoEconomico.proiezioni` (da verificare!)

```typescript
const { data } = useDatabase();
const proiezioni = data?.contoEconomico?.proiezioni;

// Anno 1
const y1 = proiezioni?.y1;
const revenue = y1?.revenue ?? 0;
const cogs = y1?.cogs ?? 0;
const grossProfit = y1?.grossProfit ?? 0;
const grossMargin = y1?.grossMargin ?? 0;

// OPEX
const opex = y1?.opex;
const marketing = opex?.marketing ?? 0;
const sales = opex?.sales ?? 0;
const rd = opex?.rd ?? 0;
const gna = opex?.gna ?? 0;
const totalOpex = opex?.total ?? 0;

// Risultati
const ebitda = y1?.ebitda ?? 0;
const ebitdaMargin = y1?.ebitdaMargin ?? 0;
const netIncome = y1?.netIncome ?? 0;
```

---

## 💵 BUDGET (OPEX & CAPEX)

### **Path:** `data.budget` (da verificare struttura!)

```typescript
const { data } = useDatabase();
const budget = data?.budget;

// OPEX per categoria
const personnel = budget?.opex?.personnel ?? 0;
const facilities = budget?.opex?.facilities ?? 0;
const rdCost = budget?.opex?.rd ?? 0;
const gna = budget?.opex?.gna ?? 0;

// CAPEX
const equipment = budget?.capex?.equipment ?? 0;
const software = budget?.capex?.software ?? 0;
const intangibles = budget?.capex?.intangibles ?? 0;
```

---

## 💵 CASH FLOW

### **Path:** `data.cashFlow` (da verificare!)

```typescript
const { data } = useDatabase();
const cashFlow = data?.cashFlow;

// Operating Cash Flow
const ocf = cashFlow?.operatingCashFlow ?? 0;

// Investing Cash Flow
const icf = cashFlow?.investingCashFlow ?? 0;

// Financing Cash Flow
const fcf = cashFlow?.financingCashFlow ?? 0;

// Cash position
const beginningCash = cashFlow?.beginningCash ?? 0;
const endingCash = cashFlow?.endingCash ?? 0;

// Metriche
const burnRate = cashFlow?.burnRate ?? 0;  // € al mese
const runway = cashFlow?.runway ?? 0;      // Mesi
```

---

## 🏦 STATO PATRIMONIALE

### **Path:** `data.statoPatrimoniale` (da verificare!)

```typescript
const { data } = useDatabase();
const balance = data?.statoPatrimoniale;

// ASSETS
const cash = balance?.assets?.current?.cash ?? 0;
const accountsReceivable = balance?.assets?.current?.accountsReceivable ?? 0;
const inventory = balance?.assets?.current?.inventory ?? 0;
const ppe = balance?.assets?.fixed?.ppe ?? 0;

// LIABILITIES
const accountsPayable = balance?.liabilities?.current?.accountsPayable ?? 0;
const longTermDebt = balance?.liabilities?.longTerm?.debt ?? 0;

// EQUITY
const equity = balance?.equity?.total ?? 0;

// Working Capital parameters
const dso = balance?.workingCapital?.dso ?? 60;  // Days Sales Outstanding
const dpo = balance?.workingCapital?.dpo ?? 45;  // Days Payable Outstanding
```

---

## 🔧 HELPER FUNCTIONS

### **Calcolare Ricavi Hardware**

```typescript
function calculateHardwareRevenue(year: number) {
  const { data } = useDatabase();
  
  // Unità vendute da GTM
  const sales = data?.goToMarket?.calculated?.realisticSales?.[`y${year}`] ?? 0;
  
  // ASP da TAM/SAM/SOM
  const asp = data?.configurazioneTamSamSom?.ecografi?.prezzoMedioDispositivo ?? 40000;
  
  // Calcola ricavo
  const revenue = sales * asp;
  
  return revenue;
}

// Esempio:
// Year 1: 5 unità × €40,000 = €200,000
```

### **Calcolare COGS Hardware**

```typescript
function calculateHardwareCOGS(year: number) {
  const { data } = useDatabase();
  
  // Unità vendute
  const sales = data?.goToMarket?.calculated?.realisticSales?.[`y${year}`] ?? 0;
  
  // COGS unitario (assumiamo 50% margin = €20k COGS)
  const unitCost = data?.revenueModel?.hardware?.unitCost ?? 20000;
  
  // Calcola COGS
  const cogs = sales * unitCost;
  
  return cogs;
}
```

### **Calcolare Ricavi SaaS**

```typescript
function calculateSaasRevenue(year: number) {
  const { data } = useDatabase();
  
  // Installed base (cumulativo)
  let installedBase = 0;
  for (let y = 1; y <= year; y++) {
    const sales = data?.goToMarket?.calculated?.realisticSales?.[`y${y}`] ?? 0;
    installedBase += sales;
  }
  
  // Active devices (activation rate)
  const activationRate = data?.revenueModel?.saas?.pricing?.perDevice?.activationRate ?? 0.8;
  const activeDevices = installedBase * activationRate;
  
  // Annual fee
  const annualFee = data?.revenueModel?.saas?.pricing?.perDevice?.annualFee ?? 5500;
  
  // Ricavo SaaS
  const saasRevenue = activeDevices * annualFee;
  
  return saasRevenue;
}

// Esempio Year 1:
// installedBase = 5
// activeDevices = 5 × 0.8 = 4
// revenue = 4 × €5,500 = €22,000
```

### **Calcolare EBITDA**

```typescript
function calculateEBITDA(year: number) {
  const { data } = useDatabase();
  
  // Ricavi
  const hardwareRev = calculateHardwareRevenue(year);
  const saasRev = calculateSaasRevenue(year);
  const totalRevenue = hardwareRev + saasRev;
  
  // COGS
  const hardwareCOGS = calculateHardwareCOGS(year);
  const saasCOGS = saasRev * (1 - 0.85);  // 85% margin
  const totalCOGS = hardwareCOGS + saasCOGS;
  
  // Gross Profit
  const grossProfit = totalRevenue - totalCOGS;
  
  // OPEX (da Budget o GTM)
  const marketing = data?.goToMarket?.marketingPlan?.projections?.[`y${year}`]?.calculated?.budgetMarketing ?? 0;
  const opex = data?.budget?.opex?.total?.[year] ?? 0;
  const totalOpex = marketing + opex;
  
  // EBITDA
  const ebitda = grossProfit - totalOpex;
  
  return ebitda;
}
```

---

## 🚨 COMMON PITFALLS

### **1. Confondere Valore vs Unità**

```typescript
// ❌ ERRORE:
const revenue = data.configurazioneTamSamSom.ecografi.valoriCalcolati.som1;
// som1 è già in EURO (valore di mercato)!

// ✅ CORRETTO:
const units = data.configurazioneTamSamSom.ecografi.dispositiviUnita.som1;
const asp = data.configurazioneTamSamSom.ecografi.prezzoMedioDispositivo;
const revenue = units * asp;
```

### **2. Non controllare se dati esistono**

```typescript
// ❌ ERRORE:
const sales = data.goToMarket.calculated.realisticSales.y1;
// → TypeError se goToMarket non esiste!

// ✅ CORRETTO:
const sales = data?.goToMarket?.calculated?.realisticSales?.y1 ?? 0;
```

### **3. Usare dati vecchi invece di SSOT**

```typescript
// ❌ ERRORE:
const asp = 35000;  // Hard-coded!

// ✅ CORRETTO (SSOT):
const asp = data?.configurazioneTamSamSom?.ecografi?.prezzoMedioDispositivo ?? 40000;
```

---

**Fine Quick Reference** 🎯
