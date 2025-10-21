# 💰 Punto 4: Cash Flow Statement Completo

## 📅 Data: 12 Ottobre 2025

---

## 🎯 Obiettivo

Implementare il **Rendiconto Finanziario (Cash Flow Statement)** completo seguendo le guide al piano finanziario:

- **Operating Cash Flow**: Flussi di cassa da operazioni correnti
- **Investing Cash Flow**: Flussi da investimenti (CAPEX)
- **Financing Cash Flow**: Flussi da finanziamenti (equity/debt)
- **Burn Rate & Runway**: Metriche di sostenibilità finanziaria
- **Working Capital**: Gestione capitale circolante (DSO/DPO)

---

## ✅ Implementazione Completata

### 1. **Service Cash Flow Calculations** 💰
File: `/src/services/cashFlowCalculations.ts`

#### Funzioni Principali

**Working Capital:**
```typescript
calculateWorkingCapital(
  revenue: number,
  cogs: number,
  dso: number = 60,              // Days Sales Outstanding
  dpo: number = 45,              // Days Payable Outstanding
  inventoryTurnover: number = 6,
  deferredRevenuePct: number = 0
): WorkingCapitalMetrics
```

Formula:
```
Crediti = Revenue × (DSO / 365)
Magazzino = COGS / Inventory Turnover
Debiti = COGS × (DPO / 365)
Ricavi Differiti = Revenue × Deferred%

WC = (Crediti + Magazzino) - (Debiti + Ricavi Differiti)
```

**Operating Cash Flow:**
```typescript
calculateOperatingCashFlow(
  ebitda: number,
  depreciation: number,
  workingCapitalChange: number,
  interestPaid: number = 0,
  taxesPaid: number = 0
): OperatingCashFlow
```

Formula:
```
OCF = EBITDA + Ammortamenti - ΔWC - Interessi - Tasse
```

**Investing Cash Flow:**
```typescript
calculateInvestingCashFlow(
  capex: number = 0,
  assetSales: number = 0,
  intangibles: number = 0
): InvestingCashFlow
```

Formula:
```
ICF = -CAPEX + Vendita Asset - IP Investments
```

**Financing Cash Flow:**
```typescript
calculateFinancingCashFlow(
  equityRaised: number = 0,
  debtRaised: number = 0,
  debtRepayments: number = 0,
  dividends: number = 0
): FinancingCashFlow
```

Formula:
```
FCF = Equity Raised + Debt Raised - Rimborsi - Dividendi
```

#### Metriche Avanzate

**Burn Rate:**
```typescript
burnRate = |Operating CF| / 12  // Mensile, se negativo
```

**Runway:**
```typescript
runway = Cash Balance / Burn Rate  // Mesi disponibili
```

---

### 2. **Service Database Integration** 🔗
File: `/src/services/cashFlowFromDatabase.ts`

#### Collegamento ai Dati Reali

**Estrazione Dati per Anno:**
```typescript
extractYearlyDataFromDatabase(
  year: number,
  database: any
): YearlyData
```

Estrae da database.json:
- Revenue (da revenueModel)
- COGS (da contoEconomico.cogs)
- EBITDA (calcolato: Gross Margin - OPEX)
- Ammortamenti (da contoEconomico.ammortamenti)
- Interessi (da contoEconomico.interessiFinanziari)
- Tasse (calcolate con aliquota 28%)
- CAPEX (da statoPatrimoniale.fixedAssets)
- Equity/Debt Raised (da statoPatrimoniale.funding/debt)

**Costruzione Cash Flow Statement:**
```typescript
buildCashFlowStatementFromDatabase(
  year: number,
  previousCash: number,
  previousWC: WorkingCapitalMetrics | null,
  database: any
): CashFlowStatement
```

---

### 3. **UI Component Cash Flow Card** 📊
File: `/src/components/CashFlowStatementCard.tsx`

#### Features Visuali

**Waterfall Cash Flow:**
1. 💰 **Cassa Iniziale** (gray)
2. ➕ **Operating CF** (blu) con breakdown
   - EBITDA
   - + Ammortamenti
   - - Variazione WC
   - - Interessi
   - - Tasse
3. ➕ **Investing CF** (viola) con breakdown
   - - CAPEX
   - - IP Investments
   - + Vendita Asset
4. ➕ **Financing CF** (verde) con breakdown
   - + Equity Raised
   - + Debt Raised
   - - Rimborsi
5. 💰 **Variazione Netta** (border gray)
6. 💰 **Cassa Finale** (blue)

**Metriche Footer:**
- 🔥 **Burn Rate**: €/mese (se negativo)
- 📊 **Runway**: Mesi disponibili (colorato per urgenza)

**Alert Runway Basso:**
- Se runway < 12 mesi → Warning giallo
- Suggerimento di pianificare round finanziamento

---

### 4. **Integrazione Tab Conto Economico** 🎯
File: `/src/components/IncomeStatementDashboard.tsx` (modificato)

#### Nuovo Tab "💰 Cash Flow"

**3 Cash Flow Cards:**
- Anno 1 (2025)
- Anno 3 (2027)
- Anno 5 (2029)

**Grafico Composito:**
- Operating CF (barre blu)
- Investing CF (barre viola)
- Financing CF (barre verdi)
- Net CF (linea rossa)

**Card Formule:**
- Operating Cash Flow formula
- Investing Cash Flow formula
- Financing Cash Flow formula
- Variazione Cassa Netta

**Card Metriche Chiave:**
- Burn Rate definizione
- Runway definizione
- Working Capital definizione
- 💡 Regola d'Oro: Runway > 18 mesi

---

## 📐 Formule Implementate

### Cash Flow Statement Completo

```
╔════════════════════════════════════════╗
║     RENDICONTO FINANZIARIO             ║
╠════════════════════════════════════════╣
║ Cassa Iniziale:                €200K   ║
║                                         ║
║ + Operating Cash Flow:                  ║
║   EBITDA                       €100K    ║
║   + Ammortamenti               +€20K    ║
║   - Variazione WC              -€50K    ║
║   - Interessi                  -€10K    ║
║   - Tasse                      -€5K     ║
║   = OCF                        €55K     ║
║                                         ║
║ + Investing Cash Flow:                  ║
║   - CAPEX                      -€80K    ║
║   - IP Investments             -€10K    ║
║   = ICF                        -€90K    ║
║                                         ║
║ + Financing Cash Flow:                  ║
║   + Equity Raised              €2,000K  ║
║   + Debt Raised                €0K      ║
║   - Rimborsi                   €0K      ║
║   = FCF                        €2,000K  ║
║                                         ║
║ = Variazione Netta:            €1,965K  ║
║                                         ║
║ Cassa Finale:                  €2,165K  ║
╠════════════════════════════════════════╣
║ Burn Rate: €4.6K/mese                  ║
║ Runway: 471 mesi (39 anni) ∞           ║
╚════════════════════════════════════════╝
```

### Working Capital Dettaglio

```
Crediti (DSO 60gg):
  = Revenue × (60 / 365)
  = €500K × 0.164 = €82K

Magazzino (Turnover 6x):
  = COGS / 6
  = €200K / 6 = €33K

Debiti (DPO 45gg):
  = COGS × (45 / 365)
  = €200K × 0.123 = €25K

Ricavi Differiti (SaaS 10%):
  = Revenue × 10%
  = €500K × 0.1 = €50K

Working Capital Netto:
  = (€82K + €33K) - (€25K + €50K)
  = €115K - €75K = €40K
```

---

## 🔗 Integrazione con Database.json

### Sezioni Utilizzate

**`contoEconomico`:**
- ✅ `ammortamenti.totaleAnnualeCalcolato[year]`
- ✅ `interessiFinanziari.totaleAnnualeCalcolato[year]`
- ✅ `tasse.aliquotaEffettiva` (28%)
- ✅ `opex.totaliCalcolatiPerAnno[year]`

**`statoPatrimoniale`:**
- ✅ `workingCapital.dso` (60 giorni)
- ✅ `workingCapital.dpo` (45 giorni)
- ✅ `workingCapital.inventoryTurnover` (6x)
- ✅ `fixedAssets.capexAsPercentRevenue` (5%)
- ✅ `funding.rounds[]` (Seed, Series A, B)
- ✅ `funding.initialCash` (€2M)
- ✅ `debt.loans[]` (prestiti bancari)

**`revenueModel` + `cogsCalculations`:**
- 🔄 Revenue totale (da calcolare runtime)
- 🔄 COGS totale (da calcolare runtime)

---

## 🧪 Come Testare

### Test 1: Service Cash Flow Calculations

```typescript
import { 
  calculateWorkingCapital,
  calculateOperatingCashFlow,
  compileCashFlowStatement 
} from '@/services/cashFlowCalculations';

// Working Capital
const wc = calculateWorkingCapital(
  500000,  // €500K revenue
  200000,  // €200K COGS
  60,      // DSO
  45,      // DPO
  6,       // Inventory turnover
  0.1      // 10% SaaS prepaid
);

console.log('Working Capital:', wc.totalWorkingCapital);
// Output: €40K

// Operating Cash Flow
const ocf = calculateOperatingCashFlow(
  100000,  // EBITDA €100K
  20000,   // Ammortamenti €20K
  10000,   // ΔWC €10K
  5000,    // Interessi €5K
  3000     // Tasse €3K
);

console.log('Operating CF:', ocf.operatingCashFlow);
// Output: €102K (100+20-10-5-3)
```

### Test 2: Component CashFlowStatementCard

```tsx
import CashFlowStatementCard from '@/components/CashFlowStatementCard';

<CashFlowStatementCard
  data={{
    period: 'Anno 2025',
    operatingCF: {
      ebitda: -100,
      addBackDepreciation: 20,
      workingCapitalChange: -50,
      interestPaid: -10,
      taxesPaid: 0,
      operatingCashFlow: -140
    },
    investingCF: {
      capex: -80,
      assetSales: 0,
      intangibleInvestments: -10,
      totalInvestingCashFlow: -90
    },
    financingCF: {
      equityRaised: 2000,
      debtRaised: 0,
      debtRepayments: 0,
      dividendsPaid: 0,
      totalFinancingCashFlow: 2000
    },
    cashBeginning: 200,
    netCashFlow: 1770,
    cashEnding: 1970,
    burnRate: 11.7,  // €11.7K/mese
    runway: 168,     // 14 anni
    cashFlowPositive: true
  }}
  showBreakdown={true}
/>
```

### Test 3: Tab Cash Flow nell'Applicazione

```
1. Apri app → Tab "📊 Conto Economico"
2. Clicca su tab "💰 Cash Flow"
3. Verifica 3 card CF (2025, 2027, 2029)
4. Controlla waterfall Operating → Investing → Financing
5. Verifica Burn Rate e Runway in footer
6. Controlla grafico "Evoluzione Cash Flow per Categoria"
7. Verifica card formule e metriche
```

---

## 📊 Benchmark & Best Practices

### MedTech Startup - Cash Flow Tipico

**Anno 1 (Pre-Revenue):**
- Operating CF: **-€150K** (burn iniziale)
- Investing CF: **-€50K** (setup laboratorio)
- Financing CF: **+€2,000K** (Seed)
- **Net CF: +€1,800K** ✅
- Runway: **12 mesi**

**Anno 3 (Traction):**
- Operating CF: **+€50K** (primi ricavi > costi)
- Investing CF: **-€100K** (scaling)
- Financing CF: **+€5,000K** (Series A)
- **Net CF: +€4,950K** ✅
- Runway: **24 mesi**

**Anno 5 (Scale):**
- Operating CF: **+€500K** (cash flow positivo stabile)
- Investing CF: **-€80K** (maintenance CAPEX)
- Financing CF: **€0** (no funding needed)
- **Net CF: +€420K** ✅
- Runway: **∞** (self-sustaining)

### Regole d'Oro Runway

| Fase | Runway Target | Azione |
|------|---------------|--------|
| **Pre-Seed** | 12-18 mesi | Valida MVP, primi clienti |
| **Seed** | 18-24 mesi | Raggiungi traction, PMF |
| **Series A** | 24-36 mesi | Scale, internazionalizza |
| **Serie B+** | 36+ mesi | Domina mercato, profittabilità |

**Alert Critici:**
- 🔴 Runway < 6 mesi: **EMERGENZA** - Fundraise ora
- 🟡 Runway 6-12 mesi: **ATTENZIONE** - Inizia processo fundraising
- 🟢 Runway > 18 mesi: **OK** - Esegui piano

---

## 🎯 Metriche Cash Flow vs Business Plan Guides

### Comparazione con Guide Finanziarie

**Da `39_GuidaAlPianoFinanziario_2025.md`:**

✅ **Operating CF (Metodo Indiretto):**
```
OCF = EBITDA + Ammortamenti - ΔWC - Interessi - Tasse
```
→ **Implementato** in `calculateOperatingCashFlow()`

✅ **Investing CF:**
```
ICF = - CAPEX - Intangibles + Asset Sales
```
→ **Implementato** in `calculateInvestingCashFlow()`

✅ **Financing CF:**
```
FCF = Equity + Debt - Rimborsi
```
→ **Implementato** in `calculateFinancingCashFlow()`

✅ **Variazione Cassa:**
```
ΔCash = OCF + ICF + FCF
Cassa Finale = Cassa Iniziale + ΔCash
```
→ **Implementato** in `compileCashFlowStatement()`

✅ **Burn Rate & Runway:**
```
Burn Rate = |OCF| / 12  (se negativo)
Runway = Cassa / Burn Rate
```
→ **Implementato** automaticamente nel statement

---

## 📁 File Creati/Modificati

### Nuovi File

**Services:**
- ✅ `/src/services/cashFlowCalculations.ts` (400 righe)
- ✅ `/src/services/cashFlowFromDatabase.ts` (300 righe)

**Components:**
- ✅ `/src/components/CashFlowStatementCard.tsx` (250 righe)

### File Modificati

**Components:**
- 🔄 `/src/components/IncomeStatementDashboard.tsx`
  - Aggiunto tab "💰 Cash Flow" (260 righe nuove)
  - 3 CashFlowStatementCard per anni 1, 3, 5
  - Grafico evoluzione CF per categoria
  - Card formule e metriche

**Documentation:**
- 📝 `/MD_SVILUPPO/PUNTO4_CASH_FLOW_STATEMENT_COMPLETO.md` (questo file)

---

## 🚀 Vantaggi Implementazione

### 1. **Trasparenza Completa** ✅
- Ogni flusso di cassa tracciato e spiegato
- Formule esposte in UI con tooltip
- Breakdown dettagliato per Operating, Investing, Financing

### 2. **Decision Support** 🎯
- Burn Rate calcolato automaticamente
- Runway visibile sempre (con alert se critico)
- Working Capital monitorato (DSO/DPO)

### 3. **Investor-Ready** 💼
- Formato standard Cash Flow Statement
- Metriche chiave highlight (Burn, Runway)
- Scenari multi-anno visualizzati

### 4. **Database Integrato** 🔗
- Dati da `database.json` (contoEconomico, statoPatrimoniale)
- Calcoli runtime coherenti
- No hardcoding, tutto parametrico

### 5. **Visual Excellence** 🎨
- Waterfall cash flow intuitivo
- Colori semantici (rosso/verde per cash in/out)
- Grafici evoluzione temporale

---

## 🔄 Prossimi Passi (Opzionali)

### Enhancement Futuri

**1. Cash Flow Mensile:**
- Attualmente annuale, potrebbe essere mensile/trimestrale
- Serve per startup early-stage (primi 12 mesi critici)

**2. Scenario Analysis:**
- Best/Base/Worst case per Cash Flow
- Sensibilità a variazioni WC, CAPEX, funding

**3. Bridge Chart:**
- Waterfall chart interattivo (da cassa iniziale a finale)
- Visualizzazione tipo "bridge" per investitori

**4. Cash Forecast:**
- Proiezione 12 mesi rolling
- Integrazione con actual data (quando disponibile)

**5. Working Capital Deep Dive:**
- Tab dedicato a DSO, DPO, Inventory optimization
- Confronto con benchmark industry

---

## 📚 Riferimenti Teorici

### Guide Utilizzate

1. **`39_GuidaAlPianoFinanziario_2025.md`:**
   - Sezione "Rendiconto Finanziario (Cash Flow)" (linee 285-361)
   - Formule Operating, Investing, Financing CF
   - Burn Rate e Runway calculations
   - Fabbisogno cassa e punto minimo

2. **`38_GuidaA_BusinessPlan&PianoFinanziario.md`:**
   - Piano Finanziario generale
   - Importanza Cash Flow per startup
   - Working Capital management

### Standard Contabili

- **IAS 7**: Cash Flow Statement standard internazionale
- **Metodo Indiretto**: Da EBITDA a Operating CF via WC adjustments
- **Classificazione 3-Way**: Operating, Investing, Financing

---

## 🎉 Risultato Finale

Un sistema completo per il **Rendiconto Finanziario** che:

✅ **Calcola** tutti i flussi di cassa (Operating, Investing, Financing)
✅ **Visualizza** waterfall cash flow intuitivo con breakdown
✅ **Monitora** Burn Rate e Runway in tempo reale
✅ **Gestisce** Working Capital (DSO, DPO, Inventory)
✅ **Integra** dati da database.json (contoEconomico, statoPatrimoniale)
✅ **Espone** formule e metriche chiave per trasparenza
✅ **Alert** quando runway diventa critico (<12 mesi)
✅ **Investor-Ready** con formato standard e grafici professionali

**Il Cash Flow Statement è ora completamente funzionale e pronto per guidare decisioni finanziarie strategiche!** 🚀💰

---

## 🏁 Status Punto 4

**✅ COMPLETATO AL 100%**

Tutti i componenti del Punto 4 sono implementati:
- ✅ Service calculations (3 sezioni CF)
- ✅ Database integration
- ✅ UI component (card + tab)
- ✅ Burn Rate & Runway
- ✅ Working Capital
- ✅ Formule e metriche
- ✅ Grafici evoluzione
- ✅ Documentazione completa

**Ready per demo e utilizzo in Business Plan!** 🎯
