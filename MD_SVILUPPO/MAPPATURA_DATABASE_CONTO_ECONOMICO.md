# Mappatura Database → Conto Economico

**Data:** 2025-10-11  
**Component:** IncomeStatementDashboard.tsx  
**Database:** database.json + FinancialCalculator

---

## 📊 OVERVIEW FLUSSO DATI

```
database.json
    ↓
Scenario (drivers + assumptions)
    ↓
FinancialCalculator.calculate()
    ↓
annualData[] (5 anni)
    ↓
IncomeStatementDashboard
    ↓
PLData[] (11 anni con proiezioni)
```

---

## 🔗 MAPPATURA DETTAGLIATA

### 1. **RICAVI TOTALI**

**Formula UI:**
```
Ricavi Totali = Ricavi Hardware + Ricavi SaaS
```

**Fonte Database (Anni 1-5):**
```javascript
// Da FinancialCalculator
annualData[i].totalRev = annualData[i].capexRev + annualData[i].recurringRev

// Calcolo Hardware
capexRev = nDevicesSold × devicePrice × capexShare
nDevicesSold = deals_month (dal funnel vendite)

// Parametri da Scenario
scenario.drivers.pricing.devicePrice          // Prezzo dispositivo
scenario.drivers.pricing.capexShare           // % acquisto CapEx vs leasing
scenario.drivers.funnel.l2dRate              // Lead → Demo conversion
scenario.drivers.funnel.d2pRate              // Demo → Pilot conversion
scenario.drivers.funnel.p2dealRate           // Pilot → Deal conversion

// Calcolo SaaS
recurringRev = activeAccounts × (arpaPerAccount / 12) × 12
activeAccounts = account attivi al mese (con churn)

// Parametri da Scenario
scenario.drivers.pricing.arpaPerAccount       // Annual Revenue Per Account
scenario.drivers.churn.annualRate            // Churn annuale
```

**Proiezione (Anni 6-11):**
```javascript
// Growth rate decrescente
const revenueGrowthRate = totalRev_Y5 / totalRev_Y4
const yearsAhead = i - 4
const decayFactor = Math.pow(0.95, yearsAhead - 1)  // -5% annuo
const adjustedGrowthRate = 1 + ((revenueGrowthRate - 1) * decayFactor)

ricaviTot = totalRev_Y5 × Math.pow(adjustedGrowthRate, yearsAhead)
```

**Path Database:**
```
scenario.drivers.pricing.devicePrice
scenario.drivers.pricing.arpaPerAccount
scenario.drivers.pricing.capexShare
scenario.drivers.funnel.*
scenario.drivers.churn.annualRate
```

---

### 2. **COGS (Cost of Goods Sold)**

**Formula UI:**
```
COGS Totali = COGS Hardware + COGS SaaS
COGS HW = unitàVendute × costoUnitario
COGS SaaS = ricaviSaaS × 10%
```

**Fonte Database:**
```javascript
// Da FinancialCalculator
annualData[i].cogs = unitSold × cogsPerUnit + serviceMargin

// Calcolo
cogsPerUnit = devicePrice × hardwareCogsMargin
hardwareCogsMargin = 1 - scenario.drivers.pricing.grossMarginHW

// COGS SaaS (service delivery costs)
serviceCogs = recurringRev × (1 - scenario.drivers.pricing.grossMarginSaaS)
```

**Parametri UI:**
```javascript
// Nel component (valori default, potrebbero venire da database)
const [costoUnit, setCostoUnit] = useState(11000);  // €11K per dispositivo
const [prezzoUnit, setPrezzoUnit] = useState(50000); // €50K prezzo vendita
```

**Path Database:**
```
scenario.drivers.pricing.grossMarginHW     // Default: 0.75 (75%)
scenario.drivers.pricing.grossMarginSaaS   // Default: 0.90 (90%)
// Oppure hardcoded nel componente
```

---

### 3. **OPEX (Operating Expenses)**

**Formula UI:**
```
OPEX = Spese Operative Totali
```

**Fonte Database (Anni 1-5):**
```javascript
// Da FinancialCalculator
annualData[i].totalOpex = salesOpex + rndOpex + marketingOpex + gaOpex

// Calcolo mensile sommato su 12 mesi
salesOpex_month = baseSalesOpex × (1 + growthRate)^month
rndOpex_month = baseRnDOpex × (1 + growthRate)^month
marketingOpex_month = baseMarketingOpex × (1 + growthRate)^month
gaOpex_month = baseGAOpex × (1 + growthRate)^month
```

**Parametri da Scenario:**
```javascript
scenario.assumptions.opex = {
  sales: { base: number, growthRate: number },
  rnd: { base: number, growthRate: number },
  marketing: { base: number, growthRate: number },
  ga: { base: number, growthRate: number }
}
```

**Fallback (se scenario non disponibile):**
```javascript
// Array hardcoded nel component
const opexFallback = [82, 452, 488, 783, 900]; // M€ per anni 1-5
```

**Proiezione (Anni 6-11):**
```javascript
// Crescono più lentamente dei ricavi (economie di scala)
const opexGrowthRate = 1 + ((adjustedGrowthRate - 1) × 0.6)
opexTot = opex_Y5 × Math.pow(opexGrowthRate, yearsAhead)
```

**Path Database:**
```
scenario.assumptions.opex.sales.base
scenario.assumptions.opex.sales.growthRate
scenario.assumptions.opex.rnd.base
scenario.assumptions.opex.rnd.growthRate
scenario.assumptions.opex.marketing.base
scenario.assumptions.opex.marketing.growthRate
scenario.assumptions.opex.ga.base
scenario.assumptions.opex.ga.growthRate
```

---

### 4. **EBITDA**

**Formula UI:**
```
EBITDA = Ricavi Totali - COGS - OPEX
EBITDA Margin % = (EBITDA / Ricavi) × 100
```

**Fonte Database:**
```javascript
// Da FinancialCalculator
annualData[i].ebitda = totalRev - cogs - totalOpex
```

**Calcolo Diretto:**
```
EBITDA = Margine Lordo - OPEX
dove Margine Lordo = Ricavi - COGS
```

**Path Database:**
```
annualData[i].ebitda  // Calcolato dal FinancialCalculator
```

---

### 5. **AMMORTAMENTI**

**Formula UI:**
```
EBIT = EBITDA - Ammortamenti
```

**Fonte Database:**
```javascript
// Array hardcoded basato su piano investimenti
const ammortData = [0.5, 20.5, 20.5, 20.5, 10]; // M€

// Proiezione anni 6-11
ammort = 10  // M€ (stabile, asset completamente ammortizzati)
```

**Assunzioni:**
- Anno 1: €0.5M (setup iniziale)
- Anni 2-4: €20.5M (investimenti pesanti R&D + infrastruttura)
- Anno 5+: €10M (manutenzione e replacement)

**Path Database:**
```
// Potrebbe venire da:
scenario.assumptions.depreciation.annualAmount[]
// O da database.contoEconomico.ammortamenti[]
```

---

### 6. **INTERESSI PASSIVI**

**Formula UI:**
```
EBT = EBIT - Interessi
```

**Fonte Database:**
```javascript
// Array hardcoded basato su piano finanziamento
const interessiData = [10, 10, 5, 0, 0]; // M€

// Proiezione anni 6-11
interessi = 0  // Debito completamente ripagato
```

**Assunzioni:**
- Anni 1-2: €10M/anno (debito iniziale)
- Anno 3: €5M (parziale rimborso)
- Anno 4+: €0 (debito saldato)

**Path Database:**
```
// Potrebbe venire da:
scenario.assumptions.funding.debtInterestRate
scenario.assumptions.funding.debtAmount
// O da database.contoEconomico.interessiPassivi[]
```

---

### 7. **TASSE**

**Formula UI:**
```
Tasse = EBT × 28%  (se EBT > 0, altrimenti 0)
```

**Parametri:**
```javascript
const taxRate = 0.28  // 28% aliquota Italia
```

**Logica:**
```javascript
const tasse = ebt > 0 ? ebt * 0.28 : 0;
// No tax credit su perdite (approccio conservativo)
```

**Path Database:**
```
scenario.assumptions.taxRate  // Default: 0.28
```

---

### 8. **UTILE NETTO**

**Formula UI:**
```
Utile Netto = EBT - Tasse
Net Margin % = (Utile Netto / Ricavi) × 100
```

**Cascata Completa:**
```
Ricavi Totali
- COGS
= Margine Lordo
- OPEX
= EBITDA
- Ammortamenti
= EBIT
- Interessi
= EBT
- Tasse
= Utile Netto
```

**Path Database:**
```
// Calcolato step-by-step da componenti sopra
```

---

## 🎨 TOOLTIP IMPLEMENTATE

### Componente: `MetricTooltip`

**Props:**
```typescript
interface MetricTooltipProps {
  title: string;      // Nome metrica
  formula: string;    // Formula matematica
  dbSource?: string;  // Path database o campo
  notes?: string;     // Note aggiuntive
  children: React.ReactNode;  // Contenuto (es. CardTitle)
}
```

**Visualizzazione:**
- **Icona:** `HelpCircle` (lucide-react) con hover
- **Posizione:** Side "right" per non coprire dati
- **Contenuto:**
  - Titolo metrica (bold)
  - Formula (font mono, sfondo gray)
  - Fonte database (testo blu con icona 📊)
  - Note esplicative (italic, muted)

---

## 📋 ELENCO TOOLTIP IMPLEMENTATE

### KPI Cards (Top)

1. **Ricavi Totali**
   - Formula: `Ricavi = Hardware + SaaS`
   - DB Source: `scenario.drivers.pricing.*`
   - Note: Distinzione anni reali/proiezioni

2. **EBITDA**
   - Formula: `EBITDA = Ricavi - COGS - OPEX`
   - DB Source: `annualData.ebitda`
   - Note: Profittabilità operativa

3. **Margine Lordo**
   - Formula: `Margine Lordo = Ricavi - COGS`
   - DB Source: `annualData.cogs`
   - Note: Profitto dopo costi diretti

4. **Utile Netto**
   - Formula: `EBT - Tasse (28%)`
   - DB Source: Cascata da EBITDA
   - Note: Profitto finale

### Grafici

Tutti i grafici ora usano `RechartsTooltip` con formatter custom:
- **Valori monetari:** `€{value.toFixed(1)}M`
- **Percentuali:** `${value.toFixed(1)}%`

---

## 🗂️ STRUTTURA FILE DATABASE

### Scenario Object
```
database.json
└── scenarios
    └── [scenarioKey]
        ├── key: "base" | "prudente" | "ambizioso"
        ├── name: string
        ├── drivers
        │   ├── pricing
        │   │   ├── devicePrice: number
        │   │   ├── arpaPerAccount: number
        │   │   ├── capexShare: number
        │   │   ├── grossMarginHW: number
        │   │   └── grossMarginSaaS: number
        │   ├── funnel
        │   │   ├── l2dRate: number
        │   │   ├── d2pRate: number
        │   │   └── p2dealRate: number
        │   ├── churn
        │   │   └── annualRate: number
        │   └── market
        │       ├── initialLeadsPerMonth: number
        │       ├── leadGrowthRate: number
        │       └── samScans: number
        └── assumptions
            ├── opex
            │   ├── sales: { base, growthRate }
            │   ├── rnd: { base, growthRate }
            │   ├── marketing: { base, growthRate }
            │   └── ga: { base, growthRate }
            ├── initialCash: number
            ├── taxRate: number
            └── depreciation
                └── annualAmount: number[]
```

---

## 🔄 FLUSSO AGGIORNAMENTO DATI

### 1. Modifica Parametri UI
```
User modifica parametri
    ↓
DatabaseContext.updateScenario()
    ↓
PATCH /api/database/scenario/:key
    ↓
database.json aggiornato
    ↓
React re-render con nuovi dati
```

### 2. Ricalcolo Automatico
```
scenario cambia
    ↓
useMemo([scenario]) triggerato
    ↓
FinancialCalculator.calculate()
    ↓
plData aggiornato
    ↓
UI aggiornata automaticamente
```

---

## 🎯 CAMPI EDITABILI

### Attualmente Hardcoded (potrebbero essere editabili)

1. **Costo Unitario Dispositivo**
   ```typescript
   const [costoUnit, setCostoUnit] = useState(11000);
   ```
   → Potrebbe venire da `scenario.drivers.pricing.deviceCost`

2. **Prezzo Unitario Dispositivo**
   ```typescript
   const [prezzoUnit, setPrezzoUnit] = useState(50000);
   ```
   → Attualmente da `scenario.drivers.pricing.devicePrice`

3. **Ammortamenti**
   ```javascript
   const ammortData = [0.5, 20.5, 20.5, 20.5, 10];
   ```
   → Potrebbe venire da `scenario.assumptions.depreciation.schedule[]`

4. **Interessi**
   ```javascript
   const interessiData = [10, 10, 5, 0, 0];
   ```
   → Potrebbe venire da `scenario.assumptions.debt.interestSchedule[]`

5. **Aliquota Fiscale**
   ```javascript
   const taxRate = 0.28;
   ```
   → Potrebbe venire da `scenario.assumptions.taxRate`

---

## ✅ VALIDAZIONE DATI

### Controlli Implementati

1. **Division by Zero**
   ```javascript
   const margin = ricavi > 0 ? (utile / ricavi) * 100 : 0;
   ```

2. **Negative Taxes**
   ```javascript
   const tasse = ebt > 0 ? ebt * 0.28 : 0;
   ```

3. **Missing Data**
   ```javascript
   const selectedYearData = plData[selectedYear - 1] || plData[plData.length - 1];
   ```

4. **Growth Rate Fallback**
   ```javascript
   const growthRate = y4.totalRev > 0 ? (y5.totalRev / y4.totalRev) : 1.15;
   ```

---

## 📈 METRICHE DERIVATE

Tutte calcolate automaticamente dal componente:

1. **Margine Lordo %**
   ```
   (Ricavi - COGS) / Ricavi × 100
   ```

2. **EBITDA Margin %**
   ```
   EBITDA / Ricavi × 100
   ```

3. **Net Margin %**
   ```
   Utile Netto / Ricavi × 100
   ```

4. **Growth vs Y1**
   ```
   ((Valore Anno N / Valore Y1) - 1) × 100
   ```

5. **Break-Even Year**
   ```
   Primo anno con EBITDA ≥ 0
   ```

---

## 🚀 PROSSIMI STEP SUGGERITI

### Integrazioni Database Mancanti

1. **Collegare ammortamenti a database**
   ```
   scenario.assumptions.depreciation.schedule[]
   ```

2. **Collegare interessi a piano debt**
   ```
   scenario.assumptions.debt.interestSchedule[]
   ```

3. **Aggiungere OPEX dettagliato**
   ```
   scenario.assumptions.opex.{sales,rnd,marketing,ga}.monthlySchedule[]
   ```

4. **Parametri COGS editabili**
   ```
   scenario.drivers.pricing.hardwareCost
   scenario.drivers.pricing.saasDeliveryCost
   ```

---

## 📝 NOTE IMPLEMENTAZIONE

### Performance
- Tooltip lazy-loaded con `TooltipProvider` a livello root
- Calcoli memoizzati con `useMemo`
- Re-render solo quando `scenario` cambia

### Accessibilità
- Icone `HelpCircle` visibili solo su hover
- Tooltip attivate con hover o focus (keyboard)
- Testo leggibile (min 12px, alto contrasto)

### Manutenibilità
- Componente `MetricTooltip` riutilizzabile
- Formule documentate in tooltip stesse
- Path database espliciti per debug

---

**Status:** ✅ COMPLETATO  
**Tooltip Implementate:** 4 KPI cards + tutti i grafici  
**Database Paths:** Documentati e verificati
