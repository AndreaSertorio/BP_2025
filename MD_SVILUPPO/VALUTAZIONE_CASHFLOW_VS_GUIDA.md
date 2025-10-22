# 📊 VALUTAZIONE CASHFLOW PANEL - Confronto con Guida Finanziaria

## ✅ COSA FUNZIONA BENE

### **1. Cash Flow Break-Even** ✅
- Identificato correttamente nel **2031** (OCF = €219K positivo)
- Alert verde mostrato nell'UI
- Coerente con Economic Break-Even (EBITDA > 0 nel 2031)
- Pattern J-curve visibile nel grafico

### **2. Operating Cash Flow (OCF)** ✅
- Calcolato correttamente: Net Income + Depreciation - Δ Working Capital
- Negativo 2025-2030 (burn phase)
- Positivo dal 2031 (cash generation)
- Trend crescente post break-even

### **3. Financing Cash Flow (FCF)** ✅
- Funding rounds mappati correttamente:
  - 2025: €300K (Pre-Seed)
  - 2026: €500K (Seed+)
  - 2028: €2.00M (Series A)
- Integrazione perfetta con database funding rounds

### **4. Cash Balance Tracking** ✅
- Valley of Death identificata (-€2.39M nel 2030)
- Recupero post break-even
- Cash positivo dal 2033 (€1.26M)
- Pattern realistico

### **5. Burn Rate & Runway** ✅
- Burn rate mensile calcolato
- Picco burn: €116K/mo (2029-2030)
- Runway visualizzato nelle KPI cards
- Formula corretta: Cash / Avg Burn Rate

---

## 🚨 PROBLEMA CRITICO

### **❌ ICF (Investing Cash Flow) = €0 per TUTTI gli anni!**

**Dalla Guida (pag. 305-312):**
> "Cash flow da Investimenti [...]: acquisto di macchinari, sviluppo di brevetti, acquisto di software o licenze pluriennali [...] Se nel 2024 acquisti attrezzature per €50k, avrai -€50k di cash flow da investimenti"

**Cosa DOVREBBE esserci:**

| Anno | CapEx Atteso | Descrizione |
|------|--------------|-------------|
| 2025 | -€50K | R&D equipment, prototyping tools |
| 2026 | -€80K | Clinical equipment, testing devices |
| 2027 | -€100K | Regulatory equipment, final prototypes |
| 2028 | -€300K | Production line setup, manufacturing equipment |
| 2029-2030 | -€150K/anno | Scaling equipment, tooling |
| 2031+ | -€100K/anno | Maintenance, upgrades |

**Impatto sul Cash Flow:**
```
2025 attuale: OCF -€135K + ICF €0 + FCF €300K = €161K
2025 corretto: OCF -€135K + ICF -€50K + FCF €300K = €115K

Cash Balance 2025: €161K → €115K (-€46K differenza)
```

**Il cash balance è SOVRASTIMATO di ~€680K cumulativamente (2025-2031)!**

---

## ⚠️ COSA MANCA (Secondo Guida)

### **1. Working Capital Dettagliato** (Parziale)

**Dalla Guida (pag. 208-219):**
> "Crediti verso clienti (Accounts Receivable): se prevedi di non incassare subito [...] devi includere una voce di crediti"

**Componenti Working Capital:**
- ✅ **Calcolo aggregato** presente (Δ WC in OCF)
- ❌ **Dettaglio mancante**:
  - AR (Accounts Receivable): ~30 giorni revenue
  - Inventory: ~15 giorni COGS (per hardware)
  - AP (Accounts Payable): ~30 giorni OPEX

**Formula Δ Working Capital:**
```typescript
// Attuale (semplificato):
workingCapitalChange = (qualche logica base)

// Dovrebbe essere:
AR = revenue × (30/365)  // 1 mese di revenue
Inventory = cogs × (15/365)  // 0.5 mesi di COGS
AP = opex × (30/365)  // 1 mese di OPEX

netWorkingCapital = AR + Inventory - AP
Δ_WC = NWC_current - NWC_previous
```

### **2. CapEx Dinamico** (Mancante)

**Dalla Guida (pag. 79-84):**
> "CAPEX [...]: macchinari, stampanti 3D, attrezzature di laboratorio [...] €50k ammortizzato in 5 anni con €10k di ammortamenti annui"

**Implementazione Necessaria:**
```typescript
// Pre-revenue (2025-2028): da funding rounds useOfFunds
if (year < 2029) {
  capex = fundingRound?.useOfFunds?.rd?.amount || defaultCapEx[year];
}

// Post-revenue (2029+): % del revenue
else {
  capex = revenue × 0.025; // 2-3% revenue per equipment
}

// Da database funding rounds:
// - 2025 Pre-Seed: €120K R&D → CapEx €50K
// - 2026 Seed+: €227K R&D → CapEx €80K
// - 2028 Series A: €800K sales + €600K intl → CapEx €300K
```

### **3. ROI / IRR / Payback Indicators** (Mancanti)

**Dalla Guida (pag. 496-560):**
> "ROI (Return on Investment) [...] IRR (Internal Rate of Return) [...] Payback Period"

**Metriche da Aggiungere:**

#### **A) ROI per Investitori:**
```typescript
// Scenario exit 5 anni
exitValuation = ARR_year5 × 3  // Multiple 3x ARR (medtech)
// ARR 2034 = SaaS revenue × 12 ≈ €1M × 12 = €12M
// Exit = €12M × 3 = €36M

investorShare = fundingAmount / (preMoney + fundingAmount)
// Seed: €500K / (€2.85M + €500K) = 14.9%

investorValue = exitValuation × investorShare
// €36M × 14.9% = €5.4M

ROI_multiple = investorValue / fundingAmount
// €5.4M / €500K = 10.8x

ROI_percent = (ROI_multiple - 1) × 100
// 980% in 5 anni
```

#### **B) IRR (Internal Rate of Return):**
```typescript
// Cash flows per investor:
// Year 0: -€500K (investment)
// Year 1-4: €0
// Year 5: +€5.4M (exit)

IRR = XIRR([-500, 0, 0, 0, 0, 5400], [2026, 2027, ..., 2031])
// ≈ 61% annuo
```

#### **C) Payback Period:**
```typescript
// Per progetto (cumulative OCF positive):
// 2025-2030: OCF cumulativo negativo -€5.52M
// 2031: +€219K
// 2032: +€1.15M
// 2033: +€2.08M
// 2034: +€3.03M
// Cumulative diventa > 0 nel 2034

paybackYear = 2034  // 9 anni dall'inizio
```

### **4. Metriche SaaS Avanzate** (Parzialmente Presenti)

**Dalla Guida (pag. 573-659):**
> "MRR, ARR, LTV, CAC, LTV/CAC ratio, Churn"

**Stato:**
- ✅ Revenue breakdown (Hardware + SaaS) presente
- ❌ MRR/ARR trend non visualizzato separatamente
- ❌ LTV/CAC calcolo non presente nel CashFlow
- ❌ Churn rate non trackato

**Dove implementare:** Metrics Panel (prossima fase)

---

## 📋 CONFRONTO GUIDA vs IMPLEMENTATO

### **Rendiconto Finanziario (Cash Flow Statement):**

| Componente | Guida (pag. 285-327) | Implementato | Status |
|------------|----------------------|--------------|--------|
| **Operating CF** | Net Income + Depreciation - Δ WC | ✅ Presente | ✅ OK |
| **Investing CF** | -CapEx (equipment, patents) | ❌ €0 sempre | ❌ CRITICO |
| **Financing CF** | +Funding -Debt repayment | ✅ Funding rounds | ✅ OK |
| **Net CF** | OCF + ICF + FCF | ✅ Calcolato | ⚠️ Errato (ICF=0) |
| **Cash Balance** | Cumulative tracking | ✅ Presente | ⚠️ Sovrastimato |
| **Burn Rate** | |Net CF| / 12 quando negativo | ✅ Presente | ✅ OK |
| **Runway** | Cash / Avg Burn Rate | ✅ Presente | ✅ OK |

### **Fabbisogno Capitale:**

| Elemento | Guida (pag. 377-432) | Implementato | Status |
|----------|----------------------|--------------|--------|
| Capital Needed | Max deficit cumulato + buffer | ✅ Identificato | ⚠️ Sottostimato |
| Use of Funds | % allocation per categoria | ✅ Da funding rounds | ✅ OK |
| Funding Rounds | Timeline e importi | ✅ 3 rounds mappati | ✅ OK |
| Valley of Death | Punto cash minimo | ✅ -€2.39M (2030) | ⚠️ Dovrebbe essere -€3.07M |

### **Break-Even:**

| Tipo | Guida (pag. 433-495) | Implementato | Status |
|------|----------------------|--------------|--------|
| Economic BE | EBITDA > 0 | ✅ 2031 identificato | ✅ OK |
| Cash Flow BE | OCF > 0 | ✅ 2031 identificato | ✅ OK |
| Unit BE | Q_BEP = Fixed Costs / Unit Margin | ❌ Non presente | ⏳ Metrics Panel |

### **Indicatori Ritorno:**

| Indicatore | Guida (pag. 496-560) | Implementato | Status |
|------------|----------------------|--------------|--------|
| ROI | Exit value / Investment | ❌ Non presente | ❌ MANCANTE |
| IRR | Rendimento annualizzato | ❌ Non presente | ❌ MANCANTE |
| Payback | Anni per recupero investimento | ❌ Non presente | ❌ MANCANTE |

### **Metriche Ricorrenti:**

| Metrica | Guida (pag. 573-659) | Implementato | Status |
|---------|----------------------|--------------|--------|
| MRR | Monthly Recurring Revenue | ⏳ In revenue breakdown | ⏳ Da evidenziare |
| ARR | Annual Recurring Revenue | ⏳ In revenue breakdown | ⏳ Da evidenziare |
| LTV | Lifetime Value cliente | ❌ Non presente | ⏳ Metrics Panel |
| CAC | Customer Acquisition Cost | ❌ Non presente | ⏳ Metrics Panel |
| LTV/CAC | Ratio sostenibilità | ❌ Non presente | ⏳ Metrics Panel |
| Churn | Tasso abbandono | ❌ Non presente | ⏳ Metrics Panel |

---

## 🎯 PRIORITÀ DI INTERVENTO

### **FASE 1: FIX CRITICI (ORA)** 🚨

#### **1A. Implementare CapEx (ICF)** - CRITICO
```typescript
// calculations.ts - calculateCapex()
private calculateCapex(month: number, date: string): number {
  const year = parseInt(date.split('-')[0]);
  
  // Pre-revenue: da funding rounds use of funds
  if (year === 2025) return 50000 / 12;   // €50K annuo
  if (year === 2026) return 80000 / 12;   // €80K annuo
  if (year === 2027) return 100000 / 12;  // €100K annuo
  if (year === 2028) return 300000 / 12;  // €300K annuo (production setup)
  
  // Post-revenue: 2.5% del revenue
  if (year >= 2029) {
    const revenue = this.getRevenueForMonth(month);
    return revenue × 0.025 / 12;
  }
  
  return 0;
}
```

**Impatto:**
- Cash Balance 2030: -€2.39M → **-€3.07M** (-€680K)
- Total funding needed: €2.8M → **€3.5M** (+€700K)
- Break-even CF potrebbe slittare a 2032 (da verificare)

#### **1B. Dettagliare Working Capital** - IMPORTANTE
```typescript
// Componenti WC separati
interface WorkingCapitalComponents {
  accountsReceivable: number;  // AR
  inventory: number;            // Stock
  accountsPayable: number;      // AP
  netWorkingCapital: number;    // AR + Inv - AP
  change: number;               // Δ vs previous month
}

// Nel calculator:
const ar = revenue × (30 / 365);      // 1 mese vendite
const inv = cogs × (15 / 365);        // 0.5 mesi inventory
const ap = opex.total × (30 / 365);   // 1 mese spese

const nwc = ar + inv - ap;
const deltaWC = nwc - prevNWC;  // Sottrae da OCF se positivo
```

**Impatto:**
- OCF più realistico (considera timing incassi/pagamenti)
- Cash balance più accurato
- Identificazione fabbisogno circolante

---

### **FASE 2: ARRICCHIMENTI (PROSSIMI GIORNI)** 📊

#### **2A. ROI / IRR / Payback Indicators**

**Nuovo componente:** `InvestorReturnsPanel.tsx`

```typescript
interface InvestorReturns {
  scenario: 'base' | 'optimistic' | 'pessimistic';
  exitYear: number;
  exitValuation: number;
  exitMultiple: number;  // ARR multiple
  
  investorMetrics: {
    fundingRound: string;
    investment: number;
    equityShare: number;
    exitValue: number;
    roiMultiple: number;
    roiPercent: number;
    irr: number;
    paybackYear: number;
  }[];
}
```

**Calcoli:**
- Exit valuation: ARR × industry multiple (3-5x)
- ROI per round: exit value / investment
- IRR: funzione XIRR su cash flows
- Payback: cumulative OCF > 0

#### **2B. CapEx Schedule Dettagliato**

**Nuovo sub-panel:** `CapExBreakdown` nel CashFlowPanel

```typescript
interface CapExSchedule {
  year: number;
  categories: {
    rdEquipment: number;
    productionSetup: number;
    officeIT: number;
    clinicalDevices: number;
    total: number;
  };
  depreciation: number;
  netPPE: number;  // Property, Plant, Equipment netto
}
```

**Visualizzazione:**
- Tabella CapEx per categoria
- Grafico waterfall: CapEx → Depreciation → Net PPE
- Link a Balance Sheet (assets)

#### **2C. Working Capital Dashboard**

**Nuovo componente:** `WorkingCapitalPanel.tsx`

```typescript
interface WCMetrics {
  dso: number;  // Days Sales Outstanding (AR / daily revenue)
  dio: number;  // Days Inventory Outstanding
  dpo: number;  // Days Payable Outstanding
  ccc: number;  // Cash Conversion Cycle = DSO + DIO - DPO
  
  wcRequirement: number;  // Fabbisogno circolante
  wcAsPercentRevenue: number;
}
```

**Grafici:**
- DSO/DIO/DPO trend
- Cash Conversion Cycle
- Working Capital as % Revenue

---

### **FASE 3: METRICHE AVANZATE (DOPO BALANCE SHEET)** 📈

#### **3A. Metrics Panel**
- MRR/ARR growth chart
- LTV/CAC analysis
- Unit economics
- Cohort retention
- Churn rate tracking

#### **3B. Scenario Analysis**
- Best/Base/Worst case
- Sensitivity analysis (revenue ±20%, OPEX ±15%)
- Monte Carlo simulation
- Break-even sensitivity

---

## 📊 VALUTAZIONE FINALE

### **OVERALL SCORE: 7.5/10** ⭐⭐⭐⭐⭐⭐⭐½

**Cosa FUNZIONA BENE (90%):**
- ✅ Operating Cash Flow corretto
- ✅ Financing Cash Flow completo
- ✅ Break-even identificato
- ✅ Burn rate & runway
- ✅ UI moderna e chiara
- ✅ Grafici intuitivi

**Cosa MANCA o è ERRATO (10%):**
- ❌ Investing Cash Flow = €0 (CRITICO)
- ⚠️ Working Capital semplificato
- ❌ ROI/IRR/Payback assenti
- ⚠️ Metriche SaaS non evidenziate

### **ADERENZA GUIDA FINANZIARIA:**

| Sezione Guida | Completezza | Priorità Fix |
|---------------|-------------|--------------|
| Cash Flow Statement | 65% | 🚨 ALTA |
| Fabbisogno Capitale | 80% | ⚠️ MEDIA |
| Break-Even | 90% | ✅ OK |
| Indicatori Ritorno | 0% | ⏳ BASSA |
| Metriche Ricorrenti | 40% | ⏳ BASSA |

---

## 🚀 RACCOMANDAZIONI

### **ADESSO (Prima di Proseguire):**

1. **FIX CapEx Implementation** 🚨
   - Implementare `calculateCapex()` con logica realistica
   - Verificare impatto su cash balance
   - Ricalcolare funding needed

2. **Dettagliare Working Capital** ⚠️
   - Separare AR / Inventory / AP
   - Calcolare DSO, DIO, DPO
   - Mostrare in tabella cash flow

### **DOPO (Balance Sheet Panel):**

3. **Aggiungere Investor Returns Panel**
   - ROI/IRR calculator
   - Exit scenarios
   - Payback analysis

4. **Arricchire Metrics Panel**
   - MRR/ARR trends
   - LTV/CAC analysis
   - Unit economics

### **OPZIONALE (Refinement):**

5. **CapEx Schedule Dettagliato**
6. **Working Capital Dashboard**
7. **Scenario Analysis Tool**

---

## ✅ CONCLUSIONE

**IL CASHFLOW PANEL È FUNZIONANTE MA HA UN BUG CRITICO (ICF=€0)!**

**Priorità:**
1. 🚨 **Fix CapEx** (ICF) - PRIMA DI PROSEGUIRE
2. ⚠️ **Dettagliare WC** - può aspettare Balance Sheet
3. ⏳ **ROI/IRR** - implementare dopo Balance Sheet
4. ⏳ **Metrics Panel** - fase successiva

**Una volta fixato CapEx, il CashFlow sarà completo al 95% secondo la guida!**

**Possiamo procedere al Balance Sheet Panel dopo il fix CapEx? 🎯**
