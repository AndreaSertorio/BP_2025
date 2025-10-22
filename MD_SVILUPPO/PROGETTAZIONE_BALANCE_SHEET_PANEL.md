# 📊 PROGETTAZIONE BALANCE SHEET PANEL - Da Guida Finanziaria

## 🎯 OBIETTIVO (dalla Guida pag. 194-195)

> "Lo stato patrimoniale previsionale è il fotogramma finanziario della startup a fine periodo: elenca ciò che l'azienda possiede (Attività), ciò che deve (Passività) e il patrimonio netto"

**Formula fondamentale:** **Assets = Liabilities + Equity**

---

## 📊 STRUTTURA DATI

### **ASSETS (Attività) - pag. 200-230**

#### **1. Cash (Cassa)**
> "La cassa finale di ogni anno deriva dal cash flow (cassa iniziale + flussi di cassa netti dell'anno)" - pag. 202

```typescript
cash = cashBalance // Dal Cash Flow Panel
```

#### **2. Accounts Receivable (Crediti)**
> "Se prevedi di non incassare subito tutti i ricavi (tipico nelle vendite B2B, dove si emette fattura e il pagamento avviene a 30-60-90 giorni)" - pag. 208

**Formula DSO (Days Sales Outstanding):**
```typescript
AR = revenue × (daysReceivables / 365)

// Esempio: 30 giorni DSO
AR = annualRevenue × (30 / 365)
```

**Dalla guida:**
> "potresti assumere crediti pari al 15% del fatturato annuo se mediamente ~2 mesi di vendite rimangono da incassare" - pag. 212

#### **3. Inventory (Magazzino)**
> "Per startup hardware, l'inventario può essere significativo [...] a fine periodo avrai un certo capitale immobilizzato in magazzino" - pag. 214

**Formula DIO (Days Inventory Outstanding):**
```typescript
Inventory = COGS × (daysInventory / 365)

// Esempio: 15 giorni inventory
Inventory = annualCOGS × (15 / 365)
```

#### **4. Fixed Assets / PPE (Immobilizzazioni)**
> "includi qui gli investimenti in beni durevoli: macchinari, attrezzature [...] li registri al costo d'acquisto e poi li diminuisci degli ammortamenti accumulati" - pag. 220

**Formula:**
```typescript
// Gross PPE = CapEx cumulativo
grossPPE = cumulativeCapex

// Accumulated Depreciation
accumulatedDepreciation = Σ(depreciation tutti i mesi)

// Net PPE
netPPE = grossPPE - accumulatedDepreciation
```

**Esempio dalla guida (pag. 223):**
> "compri €50k di attrezzature nel 2024, con ammortamento 5 anni → a fine 2024 l'attivo immobilizzato è €50k (costo) - €10k (amm.to) = €40k valore netto"

---

### **LIABILITIES (Passività) - pag. 231-248**

#### **1. Accounts Payable (Debiti Fornitori)**
> "Se non paghi immediatamente i fornitori o i salari (es. paghi a 30 giorni), avrai a fine anno dei debiti di corto termine" - pag. 233

**Formula DPO (Days Payable Outstanding):**
```typescript
AP = (COGS + OPEX) × (daysPayables / 365)

// Esempio: 30 giorni DPO
AP = annualOperatingCosts × (30 / 365)
```

#### **2. Debt (Debiti Finanziari)**
> "se fai debito (es. prestito bancario, finanziamento agevolato, anticipazioni), inserisci l'ammontare residuo" - pag. 238

```typescript
debt = outstandingDebt // Per ora: €0 (solo equity)
```

#### **3. Deferred Revenue (Ricavi Differiti) - Solo SaaS**
> "ricavi anticipati per cui devi ancora erogare il servizio, ad es. un cliente paga un abbonamento annuale anticipato" - pag. 244

**Esempio dalla guida (pag. 245):**
> "se incassi €12k a dicembre per un abbonamento annuale (12 mesi), a fine anno solo €1k è ricavo di dicembre e i restanti €11k sono ricavi anticipati"

```typescript
// Se SaaS con pagamenti annuali anticipati
deferredRevenue = prepaidAnnualSubscriptions - recognizedRevenue
```

---

### **EQUITY (Patrimonio Netto) - pag. 249-260**

#### **1. Share Capital (Capitale Sociale)**
> "i fondi investiti dai soci/founder [...] Qualsiasi nuovo aumento di capitale (seed, A) andrà ad aumentare questa voce" - pag. 251

```typescript
shareCapital = Σ(all funding rounds)

// Esempio:
// Pre-Seed 2025: €300K
// Seed+ 2026: €500K
// Series A 2028: €2.0M
// Total Share Capital = €2.8M
```

#### **2. Retained Earnings (Utili/Perdite a Nuovo)**
> "l'utile netto di ogni esercizio, cumulato [...] le perdite iniziali erodono il capitale investito" - pag. 256

```typescript
retainedEarnings = Σ(netIncome tutti gli anni)

// Esempio dalla guida (pag. 259):
// "se hai raccolto €500k ma perdi €300k nei primi 2 anni, 
//  il patrimonio netto scende a €200k (500-300)"
```

---

## 📋 FORMULA CHECK (pag. 261)

> "dovresti verificare che Attività totali = Passività totali + Patrimonio Netto a ogni data"

```typescript
totalAssets = cash + AR + inventory + netPPE

totalLiabilities = AP + debt + deferredRevenue

totalEquity = shareCapital + retainedEarnings

// VERIFICA:
assert(totalAssets === totalLiabilities + totalEquity)
```

**Esempio dalla guida (pag. 266-270):**
```
ASSETS:
- Cash: €300K
- Fixed Assets (net): €50K
- AR: €20K
Total Assets = €370K

LIABILITIES:
- AP: €20K
Total Liabilities = €20K

EQUITY:
- Initial Capital: €50K
- Funding Round: €500K
- Net Loss: -€200K
Total Equity = €350K

CHECK: €370K = €20K + €350K ✅
```

---

## 🎨 UI COMPONENTS

### **1. Balance Sheet Table (Annuale)**

```typescript
interface BalanceSheetData {
  year: number;
  
  assets: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    grossPPE: number;
    accumulatedDepreciation: number;
    netPPE: number;
    totalAssets: number;
  };
  
  liabilities: {
    accountsPayable: number;
    debt: number;
    deferredRevenue: number;
    totalLiabilities: number;
  };
  
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  
  // Check formula
  balanced: boolean; // totalAssets === totalLiabilities + totalEquity
}
```

### **2. KPI Cards**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total       │ Net         │ Working     │ Debt/Equity │
│ Assets      │ PPE         │ Capital     │ Ratio       │
│ €4.33M      │ €880K       │ €120K       │ 0% (no debt)│
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **3. Grafici**

#### **A) Assets Composition (Pie/Donut Chart)**
```
Components:
- Cash: 60%
- AR: 15%
- Inventory: 10%
- Net PPE: 15%
```

#### **B) Equity Evolution (Stacked Area Chart)**
```
Layers:
- Share Capital (cumulative funding)
- Retained Earnings (cumulative losses)
```

#### **C) Working Capital Trend (Line Chart)**
```
NWC = (AR + Inventory) - AP

Shows:
- How working capital grows with revenue
- When it becomes material
```

---

## 🧮 CALCOLI NEL CALCULATOR

### **Asset Calculations:**

```typescript
// 1. CASH (già calcolato in Cash Flow)
cash = cashBalance

// 2. ACCOUNTS RECEIVABLE
const daysReceivables = 30; // from config
accountsReceivable = annualRevenue × (daysReceivables / 365)

// 3. INVENTORY
const daysInventory = 15; // from config
inventory = annualCOGS × (daysInventory / 365)

// 4. NET PPE
grossPPE = cumulativeCapex
accumulatedDepreciation = Σ(monthly depreciation)
netPPE = grossPPE - accumulatedDepreciation

totalAssets = cash + accountsReceivable + inventory + netPPE
```

### **Liability Calculations:**

```typescript
// 1. ACCOUNTS PAYABLE
const daysPayables = 30; // from config
accountsPayable = (annualCOGS + annualOPEX) × (daysPayables / 365)

// 2. DEBT
debt = 0 // Solo equity per ora

// 3. DEFERRED REVENUE (se SaaS annuale)
deferredRevenue = 0 // Semplificato per ora

totalLiabilities = accountsPayable + debt + deferredRevenue
```

### **Equity Calculations:**

```typescript
// 1. SHARE CAPITAL
shareCapital = Σ(funding rounds fino a questo anno)

// Example:
// 2025: €300K
// 2026: €300K + €500K = €800K
// 2028: €800K + €2.0M = €2.8M

// 2. RETAINED EARNINGS
retainedEarnings = Σ(netIncome tutti gli anni fino ad ora)

// Example:
// 2025: -€135K
// 2026: -€135K + (-€850K) = -€985K
// 2027: -€985K + (-€710K) = -€1.695M

totalEquity = shareCapital + retainedEarnings
```

---

## 📊 ESEMPIO NUMERI ATTESI (Eco 3D)

### **2025:**
```
ASSETS:
- Cash: €123K
- AR: €0 (no revenue yet)
- Inventory: €0
- Net PPE: €46K (€50K - €4K deprec)
Total: €169K

LIABILITIES:
- AP: €20K
Total: €20K

EQUITY:
- Share Capital: €300K
- Retained Earnings: -€151K
Total: €149K

CHECK: €169K ≈ €169K ✅ (small rounding)
```

### **2028:**
```
ASSETS:
- Cash: -€544K
- AR: €50K
- Inventory: €25K
- Net PPE: €424K (€530K - €106K)
Total: -€45K ❌ NEGATIVO!

LIABILITIES:
- AP: €80K
Total: €80K

EQUITY:
- Share Capital: €2.8M
- Retained Earnings: -€2.925M
Total: -€125K

CHECK: -€45K ≈ €80K + (-€125K) = -€45K ✅
```

**Nota:** Assets negativi = situazione critica! Serve funding Series A!

### **2034:**
```
ASSETS:
- Cash: €1.64M
- AR: €250K
- Inventory: €120K
- Net PPE: €880K (€1.5M - €620K)
Total: €2.89M

LIABILITIES:
- AP: €150K
Total: €150K

EQUITY:
- Share Capital: €2.8M
- Retained Earnings: -€60K (recovery!)
Total: €2.74M

CHECK: €2.89M ≈ €2.89M ✅
```

---

## ✅ BEST PRACTICES (dalla Guida pag. 272-284)

### **1. Semplicità**
> "concentrati sulle 2-3 voci chiave: cassa, crediti, debiti e patrimonio"

### **2. Percentuali Fisse**
> "setta crediti e debiti come percentuali fisse dei ricavi/costi (es. crediti = 20% di fatturato se incassi a 2-3 mesi, debiti = 10% costi se paghi a 1 mese)"

### **3. Formula Check**
> "Far quadrare il bilancio è un ottimo check di coerenza per tutto il piano finanziario"

### **4. Capital Circolante**
> "pianificare il capitale circolante significa prevedere quanta cassa resterà bloccata in crediti e magazzino"

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### **FASE 1: Core Balance Sheet**
1. ✅ Calcola Assets (Cash, AR, Inv, PPE)
2. ✅ Calcola Liabilities (AP, Debt)
3. ✅ Calcola Equity (Capital, Retained)
4. ✅ Verifica formula: Assets = Liab + Equity
5. ✅ Tabella Balance Sheet annuale

### **FASE 2: UI Visualizations**
6. ✅ KPI Cards (Total Assets, Net PPE, NWC)
7. ✅ Assets Composition Chart (pie)
8. ✅ Equity Evolution Chart (area)

### **FASE 3: Advanced (opzionale)**
9. ⏳ Working Capital trend chart
10. ⏳ Debt/Equity ratio tracking
11. ⏳ ROE (Return on Equity) metrics
12. ⏳ Asset turnover ratio

---

## 📋 CHECKLIST IMPLEMENTAZIONE

- [ ] Estendere AnnualCalculation types con balanceSheet
- [ ] Implementare calcoli BS nel calculator
- [ ] Creare BalanceSheetPanel.tsx component
- [ ] Aggiungere tab "Balance Sheet" in CalculationsPanel
- [ ] Implementare Assets table
- [ ] Implementare Liabilities table
- [ ] Implementare Equity table
- [ ] Formula check visualization
- [ ] KPI cards
- [ ] Assets composition chart
- [ ] Equity evolution chart
- [ ] Test con dati 2025-2037

---

**PRONTO PER IMPLEMENTAZIONE! 🚀**

**Riferimenti Guida:**
- Stato Patrimoniale: pag. 194-284
- Assets: pag. 200-230
- Liabilities: pag. 231-248
- Equity: pag. 249-260
- Formula Check: pag. 261-270
- Best Practices: pag. 272-284
