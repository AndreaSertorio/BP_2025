# 🚀 ROADMAP IMPLEMENTAZIONE CALCOLI FINANZIARI

## 🎯 OBIETTIVO
Costruire sopra la timeline completata i pannelli di visualizzazione per P&L, Cash Flow, Balance Sheet e metriche chiave.

## ✅ STATO ATTUALE

### COMPLETATO
- ✅ Timeline interattiva (configurazione fasi, funding, revenue start)
- ✅ Motore calcoli in `calculations.ts` (P&L, CF, BS, metriche)
- ✅ Database centralizzato con tutti i dati

### MANCANTE
- ❌ Tab "Calcoli" nel FinancialPlanMasterV2
- ❌ Visualizzazione P&L (Income Statement)
- ❌ Visualizzazione Cash Flow
- ❌ Visualizzazione Balance Sheet  
- ❌ Dashboard metriche chiave
- ❌ Grafici proiezioni

---

## 📋 FASE 1: TAB CALCOLI E P&L (PRIORITÀ #1)

### Component: `CalculationsPanel.tsx`

**Features:**
1. Run Calculator con dati da database
2. Tabella P&L mensile/annuale
3. Grafici Revenue & EBITDA
4. Export Excel

**Struttura:**
```typescript
interface CalculationsPanelProps {
  financialPlan: FinancialPlan;
  revenueModel: RevenueModel;
  budgetData: BudgetData;
  gtmData: GTMData;
}
```

**Output:**
- Tabella P&L interattiva (scroll orizzontale 120 mesi)
- Toggle vista: Mensile / Trimestrale / Annuale
- Highlight break-even economico
- Chart: Revenue breakdown (Hardware vs SaaS)
- Chart: EBITDA trend

**Durata:** 60 min

---

## 📋 FASE 2: CASH FLOW E METRICHE

### Component: `CashFlowPanel.tsx`

**Features:**
1. Tabella Cash Flow Statement (CFO, CFI, CFF)
2. Waterfall chart cash flow
3. Cash balance trend
4. Burn rate & runway

**Output:**
- Cash Flow completo mese×mese
- Chart: Cash balance con funding milestones
- Alert: Runway < 6 mesi
- Chart: Burn rate mensile

**Durata:** 45 min

---

## 📋 FASE 3: BALANCE SHEET

### Component: `BalanceSheetPanel.tsx`

**Features:**
1. Tabella Balance Sheet (Assets, Liabilities, Equity)
2. Chart: Equity structure
3. Validation: Assets = Liabilities + Equity

**Output:**
- Balance Sheet evolutivo
- Chart: Asset composition
- Chart: Debt vs Equity

**Durata:** 30 min

---

## 📋 FASE 4: DASHBOARD METRICHE CHIAVE

### Component: `MetricsDashboard.tsx`

**Features:**
1. KPI Cards (Revenue, EBITDA, Cash, Runway)
2. Break-even analysis
3. Unit economics
4. Scenario switcher (Base/Prudente/Ambizioso)

**Output:**
- 6 KPI cards con trend
- Break-even date e units
- CAC/LTV ratio
- Gross margin %

**Durata:** 45 min

---

## 🗂️ STRUTTURA TAB IN FINANCIALPLANMASTERV2

```typescript
const tabs = [
  { id: 'config', label: 'Configurazione', icon: Settings },
  { id: 'calculations', label: 'Calcoli', icon: Calculator }, // NUOVO
  { id: 'pl', label: 'P&L', icon: TrendingUp },              // NUOVO
  { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },  // NUOVO
  { id: 'balance', label: 'Balance Sheet', icon: Scale },    // NUOVO
  { id: 'metrics', label: 'Metriche', icon: BarChart3 }      // NUOVO
];
```

---

## ⏱️ TIMING TOTALE

| Fase | Component | Durata | Priorità |
|------|-----------|--------|----------|
| 1 | CalculationsPanel | 60 min | 🔥 CRITICA |
| 2 | CashFlowPanel | 45 min | ⭐⭐ Alta |
| 3 | BalanceSheetPanel | 30 min | ⭐ Media |
| 4 | MetricsDashboard | 45 min | ⭐⭐ Alta |
| **TOTALE** | | **3 ore** | |

---

## 🎯 DELIVERABLES

Dopo implementazione completa avrai:
- ✅ Dashboard finanziario completo
- ✅ P&L, CF, BS visualizzati
- ✅ Metriche chiave live
- ✅ Grafici professionali
- ✅ Export Excel
- ✅ Scenario planning ready

---

## 🚀 INIZIAMO?

**Proposta:** Inizio con FASE 1 - CalculationsPanel

Creo il componente che:
1. Esegue il calculator con dati da database
2. Mostra tabella P&L 
3. Grafici Revenue & EBITDA
4. Toggle vista mensile/trimestrale/annuale

**Procediamo?** 🎯
