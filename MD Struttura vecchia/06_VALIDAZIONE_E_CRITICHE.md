# 06 - VALIDAZIONE E NOTE CRITICHE
**Eco 3D Financial Dashboard - Business Plan 2025**

*Generato: 2025-10-01*

---

## ⚠️ PANORAMICA

Questo documento identifica **incongruenze, bug potenziali e aree di miglioramento** nell'applicazione finanziaria.

---

## 1. FORMULE DA VALIDARE

### 1.1 SOM CALCULATION ⚠️ PRIORITÀ ALTA

**Issue Identificato**:
```typescript
// File: src/lib/calculations.ts, line 264
const samVolumesAnnual = 31.9e6; // HARDCODED!
const somPercent = (effectiveScansY5 / samVolumesAnnual) × 100;
```

**Problema**:
- SAM hardcoded a 31.9M esami
- Non usa `assumptions.samAnnualScans` configurabile
- SOM calculation sbagliato per scenari settoriali

**Impatto**:
- Scenario Tiroide (SAM 7.5M): usa 31.9M → SOM sottostimato 4.25x
- Scenario Completo custom: ignora SAM dinamico

**Fix Necessario**:
```typescript
// CORRECTED
const samVolumeAnnual = this.scenario.assumptions?.samAnnualScans || 31.9e6;
const somPercent = (effectiveScansY5 / samVolumeAnnual) × 100;
```

**Stima Effort**: 15 minuti
**Test Required**: Verificare SOM per tutti i 9 scenari

---

### 1.2 COGS HARDWARE SCOPE ⚠️ DA VERIFICARE

**Logica Attuale**:
```typescript
// File: src/lib/calculations.ts, line 150
const cogsHardware = (DevicesCapExShipped × drivers.cogsHw[yearForCogs]) / 1e6;
```

**Osservazione**:
- COGS applicato **SOLO** su `DevicesCapExShipped`
- I dispositivi Subscription (comodato d'uso) non hanno COGS manifatturiero
- È corretto?

**Domande da Risolvere**:
1. Nel modello Subscription, chi paga il COGS del device?
   - ✓ Se azienda: COGS al momento shipment
   - ? Se vendor: no COGS
2. Device in comodato si ammortizza?
   - Dovrebbe essere OPEX non COGS
3. Manutenzione device subscription ha COGS?

**Possibili Scenari**:
- **Scenario A (Attuale)**: CapEx = vendita → COGS. Sub = comodato → no COGS upfront
- **Scenario B (Alternativo)**: Tutti device hanno COGS upfront → applicare a `DevicesShipped` totali

**Raccomandazione**: 
✅ Confermare modello economico con CFO/Finance
⚠️ Se Scenario B: Cambiare a `DevicesShipped` invece di `DevicesCapExShipped`

---

### 1.3 CAC CALCULATION ⚠️ SEMPLIFICAZIONE

**Formula Attuale**:
```typescript
// File: src/lib/advancedMetrics.ts, line 116
const totalMarketingCosts = sum(salesMarketingOpex[1:5])
const totalNewCustomers = sum(monthlyData.deals)
const CAC = (totalMarketingCosts × 1e6) / totalNewCustomers
```

**Assunzioni Implicite**:
- 100% S&M OPEX va ad acquisizione
- Nessun costo per retention/upsell
- Nessuna inefficienza temporale (lag)

**Limitazioni**:
1. **Mix Spending**: Tipicamente:
   - New Customer Acquisition: 60-70%
   - Retention/Success: 15-20%
   - Marketing Brand: 15-20%
   
2. **Time Lag**: S&M speso oggi → customer in 3-6 mesi

3. **Churn Replacement**: Parte S&M per rimpiazzare churn

**Miglioramento Suggerito**:
```typescript
// New customer acquisition focused
const acquisitionRate = 0.65; // 65% S&M to acquisition
const CAC_Acquisition = (totalMarketingCosts × acquisitionRate × 1e6) / totalNewCustomers;

// Blended CAC (include retention costs)
const CAC_Blended = (totalMarketingCosts × 1e6) / totalNewCustomers;
```

**Impatto Attuale**: CAC leggermente sottostimato (15-20%)

---

### 1.4 TERMINAL VALUE MULTIPLE 📊 VALUTAZIONE

**Range Utilizzati**:
- Prudente: 2.0x EBITDA
- Base: 3.0x EBITDA
- Ambizioso: 4.0x EBITDA
- Settoriali: 3.0-3.8x EBITDA

**Benchmark Industry** (MedTech SaaS):
- Early stage (<€5M revenue): 3-5x
- Growth stage (€5-20M revenue): 5-8x
- Mature (>€20M revenue): 8-12x

**Valutazione Critica**:
- ✅ Range conservativo per early-stage
- ⚠️ Forse troppo conservativo per scenario Ambizioso
- 📈 Considerare crescita ARR come driver

**Alternative Approach**:
```typescript
// Revenue-based for SaaS
const terminalARR = annualData[4].arr;
const revenueMultiple = 5.0; // ARR multiple
const terminalValue = terminalARR × revenueMultiple;

// Dynamic based on growth + profitability
const growthRate = yoyGrowth[4]; // Y5 growth
const ebitdaMargin = ebitda[4] / revenue[4];
const dynamicMultiple = 2 + (growthRate × 0.02) + (ebitdaMargin × 10);
```

**Raccomandazione**: 
- ✅ Mantenere EBITDA multiple come primario
- 📊 Aggiungere ARR multiple come comparison
- 📈 Documentare assunzioni in glossary

---

### 1.5 CHURN PATTERN 📉 MATEMATICAMENTE CORRETTO

**Formula**:
```typescript
ChurnMonthly = 1 - (1 - ChurnAnnual)^(1/12)
```

**Validazione Matematica**:
```
Retention annuale = (1 - ChurnAnnual)
Retention mensile = (1 - ChurnAnnual)^(1/12)
Churn mensile = 1 - Retention mensile ✓
```

**Assunzioni**:
- Churn uniformemente distribuito nel tempo
- Indipendenza tra mesi
- Probabilità costante

**Realtà**:
- Churn spesso seasonale (fine anno fiscale)
- Anniversary churn (contratti annuali)
- First-year churn > mature customer churn

**Pattern Realistico**:
```
M1-M12: Churn 1.5× base (onboarding risk)
M13-M24: Churn 1.0× base (stabilized)
M25+: Churn 0.7× base (sticky customers)
```

**Raccomandazione**:
- ✅ Formula attuale OK per modeling
- 📊 Considerare cohort-based churn per analisi avanzata
- 📈 Aggiungere seasonality factor (opzionale)

---

## 2. INCONGRUENZE TECNICHE

### 2.1 OPEX DOUBLE-COUNTING? 🔴 VERIFICARE

**Issue**:
```typescript
// File: src/data/scenarios.ts
drivers: {
  opex: { 1: 1.80, 2: 2.50, ... },           // Total OPEX
  salesMarketingOpex: { 1: 0.54, 2: 0.75, ... } // S&M component
}

// File: src/lib/calculations.ts, line 203
const totalOpex = opex; // Non somma S&M separatamente
```

**Domanda**: 
- `salesMarketingOpex` è **dentro** `opex` o **addizionale**?

**Indicatori che è DENTRO**:
- Ratio S&M/OPEX = 30% costante
- Comment: "30% di OPEX"
- `totalOpex = opex` (non somma)

**Se fosse ADDIZIONALE** (bug):
```typescript
// WRONG (se fosse il caso)
const totalOpex = opex + salesMarketingOpex; // Double counting!
```

**Validazione**:
```
Scenario Base Y1:
OPEX: €1.80M
S&M: €0.54M
Ratio: 0.54/1.80 = 30% ✓

Se additivo: Total = €2.34M (EBITDA cambierebbe drasticamente)
```

**Conclusione**: 
✅ CORRETTO - S&M è breakdown di OPEX, non addizionale
📝 Ma documentazione ambigua

**Fix Documentazione**:
```typescript
// Add comment
opex: {
  1: 1.80, // Total OPEX (includes S&M, R&D, G&A)
  ...
},
salesMarketingOpex: {
  1: 0.54, // Subset of OPEX, ~30% allocation
  ...
}
```

---

### 2.2 FUNDING ROUNDS: DUE FONTI DI VERITÀ 🔴 PRIORITÀ ALTA

**Fonte 1**: `assumptions.fundingRounds`
```typescript
// File: src/data/defaultAssumptions.ts
fundingRounds: [
  { year: 1, amount: 2.0, type: 'seed' },
  { year: 2, amount: 3.0, type: 'seed' },
  { year: 3, amount: 5.0, type: 'series-a' }
]
```

**Fonte 2**: Hardcoded in `cashflow.ts`
```typescript
// File: src/lib/cashflow.ts, lines 93-99
if (year === 0) equityRaised = 2.0; // Seed round
if (year === 1) equityRaised = 3.0; // Seed+ round
if (year === 2) equityRaised = 5.0; // Series A
```

**Problema**: 
- Due luoghi diversi
- Modifiche a `assumptions.fundingRounds` non si riflettono in cash flow!
- Index mismatch: `year: 1` in assumptions vs `year === 0` in code

**Impatto**:
- Cash flow ignora configurazione
- UI mostra funding configurato, ma calcoli usano hardcoded

**Fix Necessario**:
```typescript
// File: src/lib/cashflow.ts
// BEFORE
if (year === 0) equityRaised = 2.0;

// AFTER
const roundsThisYear = this.scenario.assumptions?.fundingRounds.filter(
  r => r.year === year + 1
);
equityRaised = roundsThisYear.reduce((sum, r) => sum + r.amount, 0);
```

**Effort**: 30 minuti
**Test**: Modificare funding in UI, verificare cash flow recalcolato

---

### 2.3 CAPEX %: CONFLITTO PARAMETRI 🟡 MEDIA PRIORITÀ

**Parametro 1**: `assumptions.capexAsPercentRevenue`
```typescript
// Default: 5%
capexAsPercentRevenue: 0.05
```

**Parametro 2**: Hardcoded in cash flow
```typescript
// File: src/lib/cashflow.ts, line 84
const capexIntensity = 0.15; // 15% hardcoded!
const capex = annual.totalRev × capexIntensity;
```

**Conflitto**: 5% vs 15% (3x difference!)

**Quale viene usato dove**:
- Balance Sheet: usa 5% (correct)
- Cash Flow Statement: usa 15% (hardcoded)
- NPV calculation: usa cash flow → 15%

**Impatto**:
- Investing CF sovrastimato 3x
- NPV sottostimato
- Balance Sheet inconsistente con CF

**Fix**:
```typescript
// src/lib/cashflow.ts, line 84
const capexIntensity = this.scenario.assumptions?.capexAsPercentRevenue || 0.05;
const capex = annual.totalRev × capexIntensity;
```

**Effort**: 5 minuti
**Validazione**: Balance Sheet PP&E deve match accumulated CapEx in CF

---

### 2.4 DEPRECIATION RATE NON USATO 🟡 FEATURE INCOMPL

ETA

**Parametro Configurabile**:
```typescript
depreciationRate: 0.20  // 20% configurabile
```

**Uso Reale**:
```typescript
// File: src/lib/balanceSheet.ts, line 103
const annualDepreciation = ppe × 0.20; // Hardcoded 20%!
```

**Issue**: 
- Parametro configurabile ma ignorato
- Balance sheet usa sempre 20%

**Fix**:
```typescript
const depreciationRate = this.scenario.assumptions?.depreciationRate || 0.20;
const annualDepreciation = ppe × depreciationRate;
```

**Effort**: 10 minuti

---

### 2.5 INITIAL CASH VS BREAK-EVEN INVESTMENT 🟢 MINOR

**Due Parametri Separati**:
```typescript
initialCash: 2.0              // Used in cash flow
breakEvenInitialInvestment: 2.0  // Used in break-even calc
```

**Dovrebbero essere sincronizzati** ma sono indipendenti

**Risk**: 
- Utente modifica `initialCash` ma non `breakEvenInitialInvestment`
- Break-even analysis inconsistente

**Fix**: Rimuovere `breakEvenInitialInvestment`, usare sempre `initialCash`

---

## 3. METRICHE MANCANTI (OPPORTUNITÀ)

### 3.1 LOGO RETENTION 📊

**Definizione**: % clienti che rinnovano (indipendente da espansione)

```typescript
logoRetention = accountsRenewed / accountsUpForRenewal
```

**Utilizzo**: 
- Misura product-market fit
- Diverso da churn (più granulare)
- SaaS standard metric

**Effort**: Medio (necessita tracking renewal events)

---

### 3.2 NET DOLLAR RETENTION (NDR) 📊

**Definizione**: 
```
NDR = (Starting ARR + Expansion - Churn - Contraction) / Starting ARR × 100
```

**Benchmark**:
- < 100%: Losing value
- 100-110%: Good
- 110-120%: Great
- >120%: Excellent (expansion > churn)

**Best-in-class SaaS**: 120-150% NDR

**Effort**: Alto (necessita expansion/upsell tracking)

---

### 3.3 MAGIC NUMBER 📊

**Definizione**:
```
Magic Number = (ARR[t] - ARR[t-4]) / S&M Spend[t-4 to t-1]
```

**Interpretazione**:
- < 0.5: Poor efficiency
- 0.5-0.75: Acceptable
- 0.75-1.0: Good
- >1.0: Excellent

**Utilizzo**: S&M spend efficiency

**Effort**: Basso (dati già disponibili)

---

### 3.4 T2D3 TRAJECTORY 📈

**Definizione**: Triple, Triple, Double, Double, Double

```
Year 1: €1M
Year 2: €3M (3x)
Year 3: €9M (3x)
Year 4: €18M (2x)
Year 5: €36M (2x)
Year 6: €72M (2x)
```

**Utilizzo**: Benchmark venture-scale growth

**Effort**: Basso (comparison vs attuale)

---

### 3.5 CUSTOMER COHORT ANALYSIS 📊

**Struttura**:
```
Cohort Q1-2025:
  M1: 10 customers, €120k ARR
  M6: 9 customers, €130k ARR (90% retention, 8% expansion)
  M12: 8 customers, €125k ARR
  ...
```

**Insights**:
- Cohort-specific churn
- Expansion patterns
- LTV accuracy

**Effort**: Alto (necessita refactor data structure)

---

### 3.6 BURN MULTIPLE 📊

**Definizione**:
```
Burn Multiple = Cash Burned / Net New ARR
```

**Benchmark**:
- < 1.0x: Excellent capital efficiency
- 1.0-1.5x: Good
- 1.5-3.0x: Acceptable
- >3.0x: Poor efficiency

**Effort**: Basso (dati già disponibili)

---

## 4. FEATURES NON TESTATE

### 4.1 IMPORT SCENARIO JSON 🔴

**Funzionalità**: `handleImportScenario(file)`

**Rischi**:
- Parsing errors
- Schema mismatch
- Type validation
- Malicious input

**Test Necessari**:
1. Valid JSON, valid schema
2. Valid JSON, invalid schema
3. Invalid JSON
4. Missing required fields
5. Extra unexpected fields

**Validazione Mancante**:
```typescript
// Current
const importedScenario = JSON.parse(text) as Scenario; // No validation!

// Needed
import { validateScenario } from '@/lib/validation';
const importedScenario = JSON.parse(text);
const errors = validateScenario(importedScenario);
if (errors.length > 0) throw new Error(errors.join(', '));
```

---

### 4.2 PDF EXPORT QUALITY 📄

**Funzionalità**: Export to PDF

**Issues Potenziali**:
- Charts rendering quality
- Multi-page layout
- Large tables pagination
- Font embedding
- Memory usage per large datasets

**Test Necessari**:
1. Single page export
2. Multi-page with charts
3. Large data tables (60+ rows)
4. Special characters
5. Mobile export

---

### 4.3 MONTE CARLO IRR CONVERGENCE 📊

**Issue Potenziale**:
```typescript
// Newton-Raphson può non convergere
if (rate < -0.99 || rate > 10):
  return null  // No convergence
```

**Scenari Problema**:
- Very negative early cash flows
- Very high terminal value
- Unusual cash flow patterns

**Test Necessari**:
1. Standard case (converges)
2. All negative EBITDA (no convergence expected)
3. Extreme terminal value
4. Oscillating cash flows

---

### 4.4 BALANCE SHEET RECONCILIATION 🔴

**Check Implemented**:
```typescript
checkBalance = totalAssets - totalLiabilities - totalEquity
// Should be ~0
```

**Test Necessari**:
1. Verify balance = 0 for all 5 years
2. Verify all 9 scenarios
3. Verify after parameter changes
4. Check floating point precision

**Observed**: Non testato sistematicamente

---

### 4.5 MULTI-CURRENCY ❌

**Status**: Non implementato

**Needed For**:
- International markets
- Forex considerations
- Multi-currency AR/AP

**Effort**: Alto (major refactor)

---

## 5. RACCOMANDAZIONI PRIORITARIE

### 🔴 PRIORITÀ ALTA (Fix Immediati)

1. **SOM Calculation** 
   - Fix: Usare `assumptions.samAnnualScans`
   - Effort: 15 min
   - Impact: Correttezza metrica chiave

2. **Funding Rounds Sync**
   - Fix: Cash flow usa `assumptions.fundingRounds`
   - Effort: 30 min
   - Impact: Consistency configurazione

3. **CapEx % Conflict**
   - Fix: Cash flow usa `assumptions.capexAsPercentRevenue`
   - Effort: 5 min
   - Impact: NPV accuracy

4. **Scenario Import Validation**
   - Fix: Aggiungere schema validation
   - Effort: 2 ore
   - Impact: Reliability + security

### 🟡 PRIORITÀ MEDIA (Miglioramenti)

5. **CAC Separation**
   - Enhancement: CAC acquisition vs blended
   - Effort: 1 ora
   - Impact: Accuracy + insights

6. **Depreciation Rate Usage**
   - Fix: Balance sheet usa parametro configurabile
   - Effort: 10 min
   - Impact: Consistency

7. **COGS Model Verification**
   - Verify: Confermare con finance team
   - Effort: Meeting + potenziale fix
   - Impact: Correttezza economica

8. **NDR Metric**
   - Enhancement: Aggiungere Net Dollar Retention
   - Effort: 3-4 ore
   - Impact: SaaS best practice

### 🟢 PRIORITÀ BASSA (Nice to Have)

9. **Terminal Value Alternative**
   - Enhancement: Aggiungere ARR multiple comparison
   - Effort: 2 ore
   - Impact: Valuation confidence

10. **Cohort Analysis**
    - Enhancement: Customer cohort tracking
    - Effort: 1-2 giorni
    - Impact: Advanced insights

11. **Burn Multiple**
    - Enhancement: Aggiungere metrica
    - Effort: 30 min
    - Impact: Capital efficiency insight

12. **Magic Number**
    - Enhancement: Aggiungere metrica
    - Effort: 1 ora
    - Impact: S&M efficiency

---

## 6. TEST CHECKLIST

### 6.1 FORMULA VALIDATION

- [ ] SOM calculation per tutti scenari
- [ ] CAC/LTV con vari parametri
- [ ] NPV con WACC variations
- [ ] IRR convergence edge cases
- [ ] Churn math verificato
- [ ] Break-even accuracy

### 6.2 DATA CONSISTENCY

- [ ] Balance Sheet bilancia (= 0)
- [ ] Cash Flow riconcilia con P&L
- [ ] ARR matches MRR × 12
- [ ] Cumulative cash matches statements
- [ ] Funding rounds consistent

### 6.3 UI/UX

- [ ] Tutti grafici renderizzano
- [ ] Export funziona (CSV/JSON/PDF)
- [ ] Import JSON validates
- [ ] Parameters update real-time
- [ ] Tooltips accurati
- [ ] Mobile responsive

### 6.4 EDGE CASES

- [ ] Zero revenue scenario
- [ ] Negative EBITDA tutti anni
- [ ] 100% churn
- [ ] Extreme parameter values
- [ ] Very large numbers (>€100M)

---

## 7. DOCUMENTAZIONE NECESSARIA

### 7.1 MANCANTE

1. **Assumptions Documentation**
   - Rationale per ogni default value
   - Source dei benchmark
   - Industry comparisons

2. **Formula Derivations**
   - Mathematical proofs
   - Alternative formulas considered
   - Why current approach chosen

3. **Data Model Spec**
   - Complete TypeScript interfaces
   - Validation rules
   - Relationships diagram

4. **API Documentation**
   - If any external calls
   - Data sources
   - Update frequency

### 7.2 DA MIGLIORARE

1. **README**
   - Setup instructions
   - Deployment guide
   - Troubleshooting

2. **Inline Comments**
   - Complex formulas need explanation
   - Magic numbers need context
   - TODOs need tracking

3. **User Guide**
   - How to interpret metrics
   - How to customize scenarios
   - Best practices

---

**TOTALE ISSUES IDENTIFICATI: 15**
**PRIORITÀ ALTA: 4**
**PRIORITÀ MEDIA: 4**
**PRIORITÀ BASSA: 7**
**EFFORT STIMATO (Alta+Media): 1-2 giorni**
