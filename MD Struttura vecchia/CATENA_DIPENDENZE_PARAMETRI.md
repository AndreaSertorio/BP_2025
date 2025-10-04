# 🔗 CATENA DIPENDENZE PARAMETRI → METRICHE ESSENZIALI

**Data**: 02/10/2025 17:46
**Obiettivo**: Mappare TUTTI i parametri necessari per calcolare le 9 metriche essenziali

---

## 🎯 LE 9 METRICHE ESSENZIALI

### 1️⃣ REVENUE METRICS

#### MRR (Monthly Recurring Revenue)
**Formula**: `(Clienti Sub × ARPA Sub / 12) + (Clienti CapEx × ARPA Maint / 12)`

**Parametri Necessari**:
```typescript
// Da drivers
- arpaSub: number          // ARPA Subscription (€/anno)
- arpaMaint: number        // ARPA Maintenance (€/anno)
- mixCapEx: number         // % deals CapEx vs Subscription
- churnAnnual: number      // Churn annuale clienti

// Da funnel (calcolo clienti)
- leadMult: number
- l2d: number             // Lead to Demo conversion
- d2p: number             // Demo to Pilot conversion
- p2d: number             // Pilot to Deal conversion
- dealMult: number

// Da market (calcolo leads)
- tam: number             // Total Addressable Market
- sam: number             // Serviceable Addressable Market
- marketPenetrationY1: number
- marketPenetrationY5: number
```

**Calcolo Cliente**:
```
Leads → Demo → Pilot → Deal → Cliente Attivo
Cliente perde per churn mensile = 1 - (1 - churnAnnual)^(1/12)
```

---

#### ARR (Annual Recurring Revenue)
**Formula**: `MRR × 12`

**Parametri**: Stessi di MRR (è una derivata)

---

### 2️⃣ UNIT ECONOMICS

#### CAC (Customer Acquisition Cost)
**Formula**: `Total S&M OPEX / Nuovi Clienti`

**Codice** (`advancedMetrics.ts:114-118`):
```typescript
const totalMarketingCosts = Object.values(drivers.salesMarketingOpex).reduce((sum, val) => sum + val, 0);
const totalNewCustomers = this.monthlyData.reduce((sum, m) => sum + m.deals, 0);
const cac = totalNewCustomers > 0 ? (totalMarketingCosts * 1e6) / totalNewCustomers : 0;
```

**Parametri Necessari**:
```typescript
// Da drivers
- salesMarketingOpex: {     // OPEX S&M per anno (M€)
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }

// + tutti i parametri per calcolare Deals (funnel + market)
```

---

#### LTV (Lifetime Value)
**Formula**: `ARPU × Average Lifetime (mesi) / 12`

**Codice** (`advancedMetrics.ts:121-126`):
```typescript
const avgArpa = drivers.arpaSub * (1 - drivers.mixCapEx) + drivers.arpaMaint * drivers.mixCapEx;
const annualChurnRate = 1 - Math.pow(1 - drivers.hwChurn, 12);
const averageLifetime = annualChurnRate > 0 ? 12 / annualChurnRate : 60; // mesi
const ltv = arpu * (averageLifetime / 12);
```

**Parametri Necessari**:
```typescript
// Da drivers
- arpaSub: number
- arpaMaint: number
- mixCapEx: number
- hwChurn: number          // Monthly hardware churn (o churnAnnual)
```

**⚠️ ISSUE**: Usa `hwChurn` invece di `churnAnnual` - potenziale bug!

---

#### LTV/CAC Ratio
**Formula**: `LTV / CAC`

**Parametri**: Unione di LTV + CAC

---

#### Churn Rate
**Formula**: Già nei drivers

**Parametri Necessari**:
```typescript
- churnAnnual: number      // % annuale (es. 0.08 = 8%)
- hwChurnAnnual: number    // % annuale hardware
```

---

### 3️⃣ CASH FLOW & SUSTAINABILITY

#### Burn Rate
**Formula**: `Average(-EBITDA primi 2 anni) / 12`

**Codice** (`advancedMetrics.ts:149-151`):
```typescript
const year1Burn = this.annualData[0].ebitda < 0 ? -this.annualData[0].ebitda / 12 : 0;
const year2Burn = this.annualData[1].ebitda < 0 ? -this.annualData[1].ebitda / 12 : 0;
const burnRate = (year1Burn + year2Burn) / 2;
```

**EBITDA Formula**: `Gross Margin - OPEX`

**Parametri Necessari**:
```typescript
// Per Ricavi (vedi MRR)
- arpaSub, arpaMaint, mixCapEx, funnel, market

// Per COGS
- cogsHw: {               // COGS Hardware per anno (€/device)
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }
- gmRecurring: number     // Gross Margin recurring (%)

// Per OPEX
- opex: {                 // OPEX totale per anno (M€)
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }
```

---

#### Runway
**Formula**: `Current Cash / Burn Rate`

**Codice** (`advancedMetrics.ts:154-169`):
```typescript
const initialCash = this.scenario.assumptions?.initialCash || 2.0;  // ⚠️ FALLBACK HARDCODED
let cumulativeCash = initialCash;
for (const annual of this.annualData) {
  cumulativeCash += annual.ebitda;
}
const currentCash = Math.max(cumulativeCash, 0);
const runway = burnRate > 0 ? currentCash / burnRate : Infinity;
```

**Parametri Necessari**:
```typescript
// Da assumptions
- initialCash: number     // Cassa iniziale (M€)

// + tutti parametri per EBITDA (Burn Rate)
```

---

#### Break-Even Point
**Formula**: Primo anno con `EBITDA ≥ 0`

**Parametri**: Tutti quelli per EBITDA

---

## 📊 SUMMARY PARAMETRI ESSENZIALI

### ✅ PARAMETRI CORE (15 essenziali)

#### Da `drivers` (obbligatori)
```typescript
1.  arpaSub: number           // ARPA Subscription
2.  arpaMaint: number         // ARPA Maintenance
3.  mixCapEx: number          // % CapEx deals
4.  churnAnnual: number       // Churn annuale
5.  leadMult: number          // Lead multiplier
6.  l2d: number               // Lead to Demo
7.  d2p: number               // Demo to Pilot
8.  p2d: number               // Pilot to Deal
9.  dealMult: number          // Deal multiplier
10. gmRecurring: number       // Gross Margin recurring

11. opex: { 1-5: number }     // OPEX per anno
12. salesMarketingOpex: { 1-5: number }  // S&M OPEX
13. cogsHw: { 1-5: number }   // COGS Hardware
```

#### Da `assumptions` (obbligatori)
```typescript
14. initialCash: number       // Cassa iniziale
15. tam: number               // TAM (per leads)
16. sam: number               // SAM (per leads)
```

#### Market Penetration (per leads)
```typescript
17. marketPenetrationY1: number
18. marketPenetrationY5: number
```

---

### ⚠️ PARAMETRI SECONDARI (da rimuovere/nascondere)

#### Da `assumptions` (NON usati per le 9 metriche)
```typescript
❌ discountRate           // Usato solo per NPV (non nelle 9)
❌ capexAsPercentRevenue  // NON usato nelle metriche essenziali
❌ depreciationRate       // NON usato nelle metriche essenziali
❌ fundingRounds          // Usato solo in Cash Flow dettagliato
❌ daysReceivable         // Working Capital (avanzato)
❌ daysPayable            // Working Capital (avanzato)
❌ inventoryMonths        // Working Capital (avanzato)
❌ accruedExpensesAsPercentOpex  // Avanzato
❌ realizationFactor      // Avanzato
❌ breakEvenInitialInvestment    // Ridondante con initialCash
❌ sectorMarkets          // Configurato via selector UI
```

---

## 🔴 HARDCODED VALUES TROVATI

### 1. `advancedMetrics.ts:154`
```typescript
const initialCash = this.scenario.assumptions?.initialCash || 2.0;  // ⚠️ FALLBACK
```
**Fix**: Rendere `initialCash` obbligatorio in types

### 2. `advancedMetrics.ts:191`
```typescript
const terminalMultiple = this.scenario.drivers.terminalValueMultiple || 3.0;  // ⚠️ DEFAULT
```
**Fix**: Aggiungere `terminalValueMultiple` a UI configurabile (o nasconderlo se non serve per le 9)

### 3. `calculations.ts:83`
```typescript
// Original hardcoded logic (fallback)
if (quarter <= 8) {
  leads = (base.leadsPerQuarterQ1toQ8[quarter - 1] / 3) * drivers.leadMult;
}
```
**Fix**: Usare SEMPRE market penetration, rimuovere fallback hardcoded

---

## 🎨 SEZIONE UI "ASSUMPTIONS FINANZIARIE" - PROPOSTA SEMPLIFICATA

### ✅ DA MANTENERE (essenziali per 9 metriche)
```typescript
1. initialCash           // → Runway
2. tam                   // → Leads → MRR/ARR
3. sam                   // → Leads → MRR/ARR
4. marketPenetrationY1   // → Leads
5. marketPenetrationY5   // → Leads
```

### ❌ DA NASCONDERE (non essenziali)
```typescript
- discountRate           // Solo per NPV (non nelle 9)
- capexAsPercentRevenue  // Non usato
- depreciationRate       // Non usato
- realizationFactor      // Avanzato
```

### 🔧 DA AGGIUNGERE (se non già visibili)
```typescript
- churnAnnual           // Essenziale per LTV/Churn
```

---

## 🚀 AZIONI PRIORITARIE

### 1. Pulire UI "Assumptions Finanziarie" (30min)
- Rimuovere: `discountRate`, `capexAsPercentRevenue`, `depreciationRate`, `realizationFactor`
- Mantenere: `initialCash`, `tam`, `sam`
- Aggiungere se manca: `marketPenetrationY1`, `marketPenetrationY5`

### 2. Verificare Parametri in Sezione "Parametri Rapidi" (sidebar)
Attualmente mostra:
- ✅ `leadMult`, `l2d`, `d2p`, `p2d` (essenziali)
- ✅ `arpaSub`, `mixCapEx` (essenziali)
- ⚠️ Verificare se mancano parametri chiave

### 3. Fix Hardcoded Values (1h)
- [ ] Rimuovere fallback `initialCash || 2.0`
- [ ] Rimuovere fallback leads hardcoded
- [ ] Rendere `churnAnnual` obbligatorio
- [ ] Verificare che TUTTI i parametri vengano da scenarios.ts

### 4. Documentare Catena (questo file!)
- [x] Mappatura completa
- [ ] Aggiungere a Guida.md riferimento

---

## 📖 RIFERIMENTI CODICE

### File chiave:
1. `src/lib/advancedMetrics.ts` - Calcola CAC, LTV, Burn Rate, Runway
2. `src/lib/calculations.ts` - Calcola MRR, ARR, EBITDA
3. `src/data/scenarios.ts` - TUTTI i parametri configurabili
4. `src/data/defaultAssumptions.ts` - TAM/SAM per mercati

### Formule validate da Guida.md:
- ✅ MRR: Standard SaaS
- ✅ ARR = MRR × 12: Corretto
- ✅ CAC = S&M / Clienti: Standard
- ✅ LTV = ARPU / Churn: Standard SaaS
- ✅ Burn Rate: Average EBITDA negativo
- ✅ Runway: Cash / Burn: Standard
- ✅ Break-Even: Primo anno EBITDA ≥ 0: Standard

---

## ✅ CONCLUSIONI

**PARAMETRI CORE ESSENZIALI**: 18 parametri
- 13 da `drivers` (funnel, pricing, costs)
- 3 da `assumptions` (cash, TAM, SAM)
- 2 market penetration

**PARAMETRI DA RIMUOVERE DA UI**: 7 parametri
- 4 da assumptions (discount, capex%, depreciation, realization)
- 3 working capital (avanzati)

**HARDCODED DA FIXARE**: 3 fallback values

**PROSSIMO STEP**: Semplificare sezione "Assumptions Finanziarie Configurabili" in MasterDashboard.tsx
