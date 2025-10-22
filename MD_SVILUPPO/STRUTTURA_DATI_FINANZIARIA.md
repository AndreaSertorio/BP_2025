# 📊 STRUTTURA DATI FINANZIARIA - Guida Completa

## 🎯 OVERVIEW

Il piano finanziario legge dati da **3 sorgenti principali**:

```
database.json
├─ budget (OPEX 2025-2028)
├─ goToMarket.calculated.realisticSales (Sales y1-y5)
└─ revenueModel (Prezzi e costi)
```

---

## 1️⃣ BUDGET (OPEX)

### **Path:** `database.budget.categories[]`

### **Struttura:**
```json
{
  "budget": {
    "categories": [
      {
        "id": "cat_1",
        "code": "1",
        "name": "R&D e Sviluppo Prodotto",
        "subcategories": [
          {
            "id": "subcat_1_1",
            "name": "Team Ingegneria",
            "items": [
              {
                "id": "item_1",
                "name": "Ingegneri Biomedici",
                "values": {
                  "q1_25": 30,   // Q1 2025
                  "q2_25": 35,   // Q2 2025
                  "q3_25": 40,
                  "q4_25": 45,
                  "tot_25": 150  // Totale anno (opzionale)
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### **Categorie (6):**
```
cat_1: R&D e Sviluppo Prodotto
cat_2: Regulatory e Compliance
cat_3: Studi Clinici e Validazioni
cat_4: Personale e Organizzazione
cat_5: Overhead Operativo
cat_6: Marketing e Commerciale
```

### **Copertura Temporale:**
```
✅ 2025: q1_25, q2_25, q3_25, q4_25 (tot_25)
✅ 2026: q1_26, q2_26, q3_26, q4_26 (tot_26)
✅ 2027: q1_27, q2_27, q3_27, q4_27 (tot_27)
✅ 2028: q1_28, q2_28, q3_28, q4_28 (tot_28)
❌ 2029+: NESSUN DATO!
```

### **Come viene letto (calculations.ts):**
```typescript
// Per ogni categoria (cat_1, cat_2, ..., cat_6)
const category = budgetData.categories.find(c => c.id === 'cat_4');

// Legge valore annuale
const annualValue = getBudgetValueForYear(category, 2025); // K€

// Distribuisce su 12 mesi
const monthlyOPEX = {
  personnel: personnel / 12,
  rd: rd / 12,
  regulatory: regulatory / 12,
  clinical: clinical / 12,
  marketing: marketing / 12,
  operations: operations / 12,
  total: sum / 12
};
```

### **Problema Attuale:**
```typescript
// Anno 2029
const personnel = getBudgetValueForYear(cat_4, 2029);
// ❌ Ritorna 0 (no dati q1_29, q2_29, ...)

// OPEX 2029 = 0 + 0 + 0 + ... = €0
// EBITDA = Gross Profit - 0 = troppo alto!
```

---

## 2️⃣ GO-TO-MARKET SALES

### **Path:** `database.goToMarket.calculated.realisticSales`

### **Struttura:**
```json
{
  "goToMarket": {
    "calculated": {
      "realisticSales": {
        "y1": 5,     // Anno 1 dal revenueStartDate
        "y2": 25,    // Anno 2
        "y3": 55,    // Anno 3
        "y4": 92,    // Anno 4
        "y5": 128    // Anno 5
      }
    }
  }
}
```

### **Mapping Anni:**
```
revenueStartDate: "2029-Q3"

y1 → 2029:  5 units
y2 → 2030:  25 units
y3 → 2031:  55 units
y4 → 2032:  92 units
y5 → 2033:  128 units
    2034:  ❌ NESSUN DATO (no y6)
```

### **Come viene letto (calculations.ts):**
```typescript
// Trova anno di inizio revenue
const revenuePhase = financialPlan.configuration.businessPhases
  .find(p => p.revenueEnabled);
const revenueStartYear = parseInt(revenuePhase.revenueStartDate.split('-')[0]);
// → 2029

// Calcola yearIndex relativo
const yearIndex = currentYear - revenueStartYear;
// 2029 → yearIndex 0 → y1 = 5
// 2030 → yearIndex 1 → y2 = 25
// 2033 → yearIndex 4 → y5 = 128
// 2034 → yearIndex 5 → OUT OF BOUNDS! ❌

const yearKeys = ['y1', 'y2', 'y3', 'y4', 'y5'];
const annualUnits = yearIndex >= 0 && yearIndex < 5
  ? realisticSales[yearKeys[yearIndex]]
  : 0; // ← Ritorna 0 per 2034+

// Distribuisce su 12 mesi
const monthlyUnits = annualUnits / 12;
```

### **Problema Attuale:**
```typescript
// Anno 2034
const yearIndex = 2034 - 2029 = 5; // Out of bounds!
const annualUnits = 0; // ❌

// Hardware Revenue = 0 × €50K = €0
// SaaS Revenue = pochi device attivi
// Total Revenue ≈ €1M (solo SaaS residuo)
```

---

## 3️⃣ REVENUE MODEL

### **Path:** `database.revenueModel`

### **Struttura:**
```json
{
  "revenueModel": {
    "hardware": {
      "unitPrice": 50000,        // Prezzo vendita dispositivo
      "unitCostByType": 11000,   // Costo produzione
      "grossMargin": 78%         // (50K - 11K) / 50K
    },
    "saas": {
      "pricing": {
        "perDevice": {
          "monthlyFee": 500,     // Canone mensile
          "activationRate": 0.35 // 35% dispositivi attivano SaaS
        }
      }
    }
  }
}
```

### **Come viene usato:**
```typescript
// Hardware Revenue
const revenue = monthlyUnits × unitPrice;
const cogs = monthlyUnits × unitCostByType;
const grossProfit = revenue - cogs;

// SaaS Revenue
const devicesActive = Σ(past hardware sales);
const activeSubscriptions = devicesActive × activationRate;
const saasRevenue = activeSubscriptions × monthlyFee;

// Total
const totalRevenue = hardware.revenue + saas.revenue;
```

---

## 🔍 FLUSSO CALCOLO COMPLETO

### **Per ogni mese (m = 1...120):**

```typescript
// 1. REVENUE
// ──────────────────────────────────────
// a) Determina anno corrente
const year = Math.floor((m - 1) / 12) + startYear;

// b) Trova GTM sales per quell'anno
const yearIndex = year - revenueStartYear;
const annualUnits = realisticSales[`y${yearIndex + 1}`] || 0;
const monthlyUnits = annualUnits / 12;

// c) Calcola Hardware Revenue
const hwRevenue = monthlyUnits × unitPrice;
const hwCOGS = monthlyUnits × unitCostByType;

// d) Calcola SaaS Revenue
const devicesActive = Σ(hwSales fino a mese m-1);
const saasRevenue = devicesActive × activationRate × monthlyFee;

// e) Total Revenue
const totalRevenue = hwRevenue + saasRevenue;
const totalCOGS = hwCOGS + (saasRevenue × 0.15); // SaaS COGS ~15%
const grossProfit = totalRevenue - totalCOGS;


// 2. OPEX
// ──────────────────────────────────────
// Per ogni categoria (cat_1 ... cat_6)
const annualBudget = getBudgetValueForYear(category, year); // K€
const monthlyOPEX = annualBudget / 12; // Distribuzione uniforme

// Total OPEX
const totalOPEX = Σ(all categories);


// 3. EBITDA
// ──────────────────────────────────────
const ebitda = grossProfit - totalOPEX;


// 4. NET INCOME (semplificato)
// ──────────────────────────────────────
const taxRate = 0.24; // IRES 24%
const netIncome = ebitda × (1 - taxRate);


// 5. CASH FLOW (semplificato)
// ──────────────────────────────────────
const operatingCF = netIncome + depreciation;
const investingCF = -capex;
const financingCF = funding - debtRepayment;
const netCF = operatingCF + investingCF + financingCF;
const cashBalance = prevCashBalance + netCF;
```

---

## 📋 DATI MANCANTI - IMPATTO

### **Scenario Attuale (2034):**

```
Hardware Sales:   0 units        (no GTM y6)
Hardware Revenue: €0
SaaS Devices:     ~305 units     (cumulative 2029-2033)
SaaS Revenue:     305 × 0.35 × €500 = €53K/mese = €636K/anno

OPEX:             €0              (no budget 2034)

EBITDA:           €636K           (solo SaaS, no OPEX)
                  ↓ poco realistico!
```

### **Scenario Corretto (2034 con proiezioni):**

```
Hardware Sales:   165 units       (y6 proiettato: +29%)
Hardware Revenue: €8.25M
SaaS Devices:     ~470 units      (cumulative)
SaaS Revenue:     €987K

OPEX:             €1.52M          (growth +15%/anno da 2028)

Gross Profit:     €7.0M           (78% margin)
EBITDA:           €5.5M           (€7.0M - €1.52M)
```

---

## 🎯 FORMULE GROWTH DA IMPLEMENTARE

### **1. OPEX Growth (2029+):**
```typescript
// Base: ultimo anno con dati
const opex2028 = getBudgetValueForYear(category, 2028);

// Formula growth
if (year > 2028 && opex2028 > 0) {
  const yearsSince2028 = year - 2028;
  const growthRate = 0.15; // +15% annuo
  const projectedOPEX = opex2028 × Math.pow(1 + growthRate, yearsSince2028);
  return projectedOPEX;
}

// Esempio:
// 2029: €1.28M × 1.15 = €1.47M
// 2030: €1.28M × 1.15² = €1.69M
// 2031: €1.28M × 1.15³ = €1.95M
```

### **2. GTM Sales Growth (y6+):**
```typescript
// Base: crescita da y4 a y5
const y5 = 128;
const y4 = 92;
const baseGrowthRate = (y5 - y4) / y4; // +39%

// Formula decrescente (maturità mercato)
const y6 = y5 × 1.29;  // +29% (ridotto)
const y7 = y6 × 1.21;  // +21%
const y8 = y7 × 1.15;  // +15%
const y9 = y8 × 1.10;  // +10%
const y10 = y9 × 1.05; // +5%

// Risultato:
// y6 (2034): 165 units
// y7 (2035): 200 units
// y8 (2036): 230 units
// y9 (2037): 253 units
// y10 (2038): 266 units
```

---

## 🚀 PROSSIMI STEP

1. ✅ **Implementa getBudgetValueForYear con growth**
2. ✅ **Estendi GTM realisticSales con y6-y10**
3. ✅ **Testa proiezioni 2029-2037**
4. ⏳ **Aggiungi Cash Flow Panel**
5. ⏳ **Aggiungi Balance Sheet**

---

**Ora implemento i fix! 🎯**
