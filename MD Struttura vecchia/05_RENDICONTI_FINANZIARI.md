# 05 - RENDICONTI FINANZIARI
**Eco 3D Financial Dashboard - Business Plan 2025**

*Generato: 2025-10-01*

---

## 📑 PANORAMICA

Catalogo completo dei **7 rendiconti finanziari** implementati nell'applicazione.

---

## 1. PROFIT & LOSS (P&L / CONTO ECONOMICO)

### 1.1 STRUTTURA COMPLETA

```
RICAVI
├─ Ricavi Ricorrenti
│  ├─ Ricavi Subscription (Accounts Sub × ARPA Sub / 12)
│  └─ Ricavi Maintenance (Accounts CapEx × ARPA Maint / 12)
└─ Ricavi CapEx (Hardware)
   └─ Vendite Dispositivi (Devices CapEx × Device Price)
─────────────────────────────────────────────────────────
TOTALE RICAVI

COSTO DEL VENDUTO (COGS)
├─ COGS Recurring ((1 - GM%) × Ricavi Ricorrenti)
└─ COGS Hardware (Devices CapEx × COGS Unit)
─────────────────────────────────────────────────────────
TOTALE COGS

MARGINE LORDO (Ricavi - COGS)
Margine Lordo % ((Margine / Ricavi) × 100)

SPESE OPERATIVE (OPEX)
├─ Sales & Marketing (30% tipico)
├─ R&D / Product (30-35% tipico)
├─ G&A / Admin (20-25% tipico)
└─ Other Operating (5-15% tipico)
─────────────────────────────────────────────────────────
TOTALE OPEX

EBITDA (Margine Lordo - OPEX)
EBITDA Margin % ((EBITDA / Ricavi) × 100)
```

### 1.2 P&L ANNUALE (5 Anni)

**Anno 1** (Esempio Scenario Base):
```
Ricavi Ricorrenti:              €0.45M
Ricavi CapEx:                   €0.35M
────────────────────────────────────────
TOTALE RICAVI:                  €0.80M

COGS Recurring:                 €0.09M
COGS Hardware:                  €0.18M
────────────────────────────────────────
TOTALE COGS:                    €0.27M

MARGINE LORDO:                  €0.53M
Margine Lordo %:                66.3%

OPEX:                           €1.80M
  ├─ Sales & Marketing:         €0.54M
  ├─ R&D:                       €0.63M
  ├─ G&A:                       €0.45M
  └─ Other:                     €0.18M
────────────────────────────────────────
EBITDA:                         -€1.27M
EBITDA Margin %:                -158.8%
```

**Anno 5** (Esempio Scenario Base):
```
Ricavi Ricorrenti:              €6.80M
Ricavi CapEx:                   €1.20M
────────────────────────────────────────
TOTALE RICAVI:                  €8.00M

COGS Recurring:                 €1.36M
COGS Hardware:                  €0.48M
────────────────────────────────────────
TOTALE COGS:                    €1.84M

MARGINE LORDO:                  €6.16M
Margine Lordo %:                77.0%

OPEX:                           €5.50M
  ├─ Sales & Marketing:         €1.65M
  ├─ R&D:                       €1.93M
  ├─ G&A:                       €1.38M
  └─ Other:                     €0.55M
────────────────────────────────────────
EBITDA:                         €0.66M
EBITDA Margin %:                8.3%
```

### 1.3 VISUALIZZAZIONE

**Tab**: "Financials"
**Component**: `<Financials>` component
**Formato**: Tabella interattiva con drill-down
**Export**: CSV, JSON, PDF

---

## 2. CASH FLOW STATEMENT (RENDICONTO FINANZIARIO)

### 2.1 STRUTTURA COMPLETA

```
ATTIVITÀ OPERATIVE (Operating Activities)
  EBITDA
  Aggiustamenti non-monetari:
    + Ammortamenti
    + Svalutazioni
  Variazione Capitale Circolante:
    - Δ Crediti verso clienti (AR)
    - Δ Rimanenze (Inventory)
    + Δ Debiti verso fornitori (AP)
────────────────────────────────────────────
FLUSSO DI CASSA OPERATIVO (Operating CF)

ATTIVITÀ DI INVESTIMENTO (Investing Activities)
  - CapEx (Investimenti in immobilizzazioni)
  - Acquisizioni
  + Vendite di asset
────────────────────────────────────────────
FLUSSO DI CASSA DA INVESTIMENTI (Investing CF)

ATTIVITÀ FINANZIARIE (Financing Activities)
  + Equity Raised (Funding rounds)
  + Debito Emesso
  - Rimborso Debito
  - Dividendi Pagati
────────────────────────────────────────────
FLUSSO DI CASSA DA FINANZIAMENTI (Financing CF)

FLUSSO DI CASSA NETTO (Net Cash Flow)

Cassa Iniziale (Beginning Cash)
+ Flusso di Cassa Netto
────────────────────────────────────────────
Cassa Finale (Ending Cash)
```

### 2.2 CASH FLOW ANNUALE (5 Anni)

**Anno 1**:
```
ATTIVITÀ OPERATIVE
  EBITDA:                       -€1.27M
  + Ammortamenti:               €0.10M
  Δ Working Capital:
    - Δ Crediti:                -€0.10M
    - Δ Rimanenze:              -€0.05M
    + Δ Debiti:                 €0.15M
────────────────────────────────────────
Operating CF:                   -€1.17M

ATTIVITÀ DI INVESTIMENTO
  - CapEx:                      -€0.04M
────────────────────────────────────────
Investing CF:                   -€0.04M

ATTIVITÀ FINANZIARIE
  + Equity Raised (Seed):       €2.00M
────────────────────────────────────────
Financing CF:                   €2.00M

Net Cash Flow:                  €0.79M

Beginning Cash:                 €0.00M
Ending Cash:                    €0.79M
```

**Anno 2**:
```
ATTIVITÀ OPERATIVE
  EBITDA:                       -€0.55M
  + Ammortamenti:               €0.15M
  Δ Working Capital:            -€0.12M
────────────────────────────────────────
Operating CF:                   -€0.52M

ATTIVITÀ DI INVESTIMENTO
  - CapEx:                      -€0.09M
────────────────────────────────────────
Investing CF:                   -€0.09M

ATTIVITÀ FINANZIARIE
  + Equity Raised (Seed+):      €3.00M
────────────────────────────────────────
Financing CF:                   €3.00M

Net Cash Flow:                  €2.39M

Beginning Cash:                 €0.79M
Ending Cash:                    €3.18M
```

**Anno 3**:
```
ATTIVITÀ OPERATIVE
  EBITDA:                       €0.25M
  + Ammortamenti:               €0.22M
  Δ Working Capital:            -€0.18M
────────────────────────────────────────
Operating CF:                   €0.29M

ATTIVITÀ DI INVESTIMENTO
  - CapEx:                      -€0.18M
────────────────────────────────────────
Investing CF:                   -€0.18M

ATTIVITÀ FINANZIARIE
  + Equity Raised (Series A):   €5.00M
────────────────────────────────────────
Financing CF:                   €5.00M

Net Cash Flow:                  €5.11M

Beginning Cash:                 €3.18M
Ending Cash:                    €8.29M
```

### 2.3 CASH FLOW MENSILE (60 Mesi)

**Struttura Semplificata**:
```typescript
monthlyData = [
  {
    month: 1,
    cashFlow: -€0.10M,      // Gross Margin - OPEX/12 + Funding
    cumulativeCash: €2.00M  // Running total
  },
  {
    month: 2,
    cashFlow: -€0.09M,
    cumulativeCash: €1.91M
  },
  ...
]
```

**Visualizzazione**: Area chart con funding events marcati

### 2.4 VISUALIZZAZIONE

**Tab**: "Cash Flow"
**Component**: `<CashFlowView>` component
**Grafici**: 
- Operating CF bars (annual)
- Investing CF bars (annual)
- Financing CF bars (annual)
- Cumulative cash line (monthly)

---

## 3. BALANCE SHEET (STATO PATRIMONIALE)

### 3.1 STRUTTURA COMPLETA

```
ATTIVO (Assets)

ATTIVITÀ CORRENTI (Current Assets)
├─ Cassa e Disponibilità Liquide
├─ Crediti verso Clienti (DSO: 45-60 giorni)
├─ Rimanenze (2 mesi COGS hardware)
└─ Altri Crediti
────────────────────────────────────────
Totale Attività Correnti

ATTIVITÀ IMMOBILIZZATE (Fixed Assets)
├─ Immobili, Impianti e Macchinari (PP&E)
├─ Attività Immateriali (IP, Patents)
├─ - Ammortamenti Accumulati
└─ Altri Immobilizzi
────────────────────────────────────────
Totale Attività Immobilizzate

TOTALE ATTIVO
════════════════════════════════════════

PASSIVO E PATRIMONIO NETTO (Liabilities & Equity)

PASSIVITÀ CORRENTI (Current Liabilities)
├─ Debiti verso Fornitori (DPO: 30-45 giorni)
├─ Debiti a Breve Termine
├─ Ratei e Risconti (10% OPEX)
└─ Altri Debiti Correnti
────────────────────────────────────────
Totale Passività Correnti

PASSIVITÀ NON CORRENTI (Long-term Liabilities)
├─ Debiti a Lungo Termine
└─ Altre Passività
────────────────────────────────────────
Totale Passività Non Correnti

TOTALE PASSIVITÀ
────────────────────────────────────────

PATRIMONIO NETTO (Equity)
├─ Capitale Sociale (Paid-in Capital)
└─ Utili/Perdite Portate a Nuovo (Retained Earnings)
────────────────────────────────────────
Totale Patrimonio Netto

TOTALE PASSIVITÀ E PATRIMONIO NETTO
════════════════════════════════════════

Verifica Bilanciamento (Balance Check)
Attivo - Passività - Patrimonio = 0 ✓
```

### 3.2 BALANCE SHEET ANNUALE (5 Anni)

**Anno 1**:
```
ATTIVO

Attività Correnti:
  Cassa:                        €0.79M
  Crediti:                      €0.10M
  Rimanenze:                    €0.03M
────────────────────────────────────────
Totale Correnti:                €0.92M

Attività Immobilizzate:
  PP&E:                         €0.54M
  Immateriali:                  €0.30M
  - Ammortamenti:               -€0.10M
────────────────────────────────────────
Totale Immobilizzate:           €0.74M

TOTALE ATTIVO:                  €1.66M
════════════════════════════════════════

PASSIVO E PATRIMONIO NETTO

Passività Correnti:
  Debiti Fornitori:             €0.11M
  Ratei:                        €0.18M
────────────────────────────────────────
Totale Passività Correnti:      €0.29M

Passività Non Correnti:
  Debiti a Lungo:               €0.00M
────────────────────────────────────────
Totale Passività:               €0.29M

Patrimonio Netto:
  Capitale Sociale:             €2.00M
  Utili Portati:                -€0.63M
────────────────────────────────────────
Totale Patrimonio:              €1.37M

TOTALE PASS. + PATRIM.:         €1.66M
════════════════════════════════════════
Balance Check:                  €0.00 ✓
```

**Anno 5**:
```
ATTIVO

Attività Correnti:
  Cassa:                        €14.25M
  Crediti:                      €1.10M
  Rimanenze:                    €0.08M
────────────────────────────────────────
Totale Correnti:                €15.43M

Attività Immobilizzate:
  PP&E:                         €1.20M
  Immateriali:                  €0.30M
  - Ammortamenti:               -€0.80M
────────────────────────────────────────
Totale Immobilizzate:           €0.70M

TOTALE ATTIVO:                  €16.13M
════════════════════════════════════════

PASSIVO E PATRIMONIO NETTO

Passività Correnti:
  Debiti Fornitori:             €0.76M
  Ratei:                        €0.55M
────────────────────────────────────────
Totale Passività Correnti:      €1.31M

Passività Non Correnti:
  Debiti a Lungo:               €1.00M
────────────────────────────────────────
Totale Passività:               €2.31M

Patrimonio Netto:
  Capitale Sociale:             €10.00M
  Utili Portati:                €3.82M
────────────────────────────────────────
Totale Patrimonio:              €13.82M

TOTALE PASS. + PATRIM.:         €16.13M
════════════════════════════════════════
Balance Check:                  €0.00 ✓
```

### 3.3 KEY RATIOS

**Working Capital**:
```
Working Capital = Current Assets - Current Liabilities
Y1: €0.92M - €0.29M = €0.63M
Y5: €15.43M - €1.31M = €14.12M
```

**Current Ratio**:
```
Current Ratio = Current Assets / Current Liabilities
Y1: €0.92M / €0.29M = 3.2x
Y5: €15.43M / €1.31M = 11.8x
Target: > 1.5x (healthy liquidity)
```

**Debt-to-Equity**:
```
D/E = Total Liabilities / Total Equity
Y1: €0.29M / €1.37M = 0.21x
Y5: €2.31M / €13.82M = 0.17x
Target: < 1.0x (conservative)
```

### 3.4 VISUALIZZAZIONE

**Tab**: "Statements"
**Component**: `<FinancialStatements>` component
**Formato**: Side-by-side Assets/Liabilities/Equity
**Drill-down**: Click categories for details

---

## 4. MONTHLY METRICS TABLE (60 Mesi)

### 4.1 STRUTTURA

**Colonne** (15):
1. Month
2. Leads
3. Deals Total
4. Deals CapEx
5. Deals Subscription
6. Accounts Active
7. Accounts CapEx
8. Accounts Subscription
9. Devices Shipped
10. Devices Active
11. Recurring Revenue (M€)
12. CapEx Revenue (M€)
13. Total Revenue (M€)
14. COGS (M€)
15. Gross Margin (M€)
16. Scans Performed

### 4.2 ESEMPIO (Primi 3 Mesi)

```
Month | Leads | Deals | Acc.Active | Dev.Active | MRR    | CapEx  | Total  | Scans
------|-------|-------|------------|------------|--------|--------|--------|-------
1     | 40    | 2.4   | 2.4        | 2.9        | 0.003  | 0.075  | 0.078  | 174
2     | 42    | 2.5   | 4.9        | 5.9        | 0.006  | 0.079  | 0.085  | 354
3     | 45    | 2.7   | 7.5        | 9.1        | 0.009  | 0.085  | 0.094  | 546
```

### 4.3 VISUALIZZAZIONE

**Tab**: "Calculations" o "Data"
**Component**: Scrollable table
**Features**:
- Sort by column
- Filter by range
- Search
- Export to CSV

---

## 5. ANNUAL METRICS TABLE (5 Anni)

### 5.1 STRUTTURA

**Colonne** (12):
1. Year
2. Recurring Revenue (M€)
3. CapEx Revenue (M€)
4. Total Revenue (M€)
5. COGS (M€)
6. Gross Margin (M€)
7. Gross Margin %
8. OPEX (M€)
9. S&M OPEX (M€)
10. Total OPEX (M€)
11. EBITDA (M€)
12. ARR (M€)

### 5.2 ESEMPIO (Scenario Base)

```
Year | Recurring | CapEx | Total | COGS | GM   | GM%  | OPEX | EBITDA | ARR
-----|-----------|-------|-------|------|------|------|------|--------|-----
1    | 0.45      | 0.35  | 0.80  | 0.27 | 0.53 | 66.3%| 1.80 | -1.27  | 0.42
2    | 1.25      | 0.55  | 1.80  | 0.54 | 1.26 | 70.0%| 2.50 | -1.24  | 1.35
3    | 2.80      | 0.80  | 3.60  | 1.01 | 2.59 | 71.9%| 3.50 | -0.91  | 3.05
4    | 5.20      | 1.00  | 6.20  | 1.55 | 4.65 | 75.0%| 4.50 | 0.15   | 5.68
5    | 6.80      | 1.20  | 8.00  | 1.84 | 6.16 | 77.0%| 5.50 | 0.66   | 7.42
```

### 5.3 VISUALIZZAZIONE

**Tab**: "Financials"
**Component**: Main summary table
**Charts**: Multiple charts derived from this data

---

## 6. KPI SUMMARY TABLE

### 6.1 STRUTTURA

**Categorie**:
1. Revenue KPIs (12 metriche)
2. Profitability KPIs (10 metriche)
3. Customer KPIs (8 metriche)
4. Unit Economics (8 metriche)
5. Cash Flow KPIs (8 metriche)
6. Valuation KPIs (2 metriche)
7. Growth KPIs (9 metriche)

### 6.2 FORMATO

```
Categoria: UNIT ECONOMICS

KPI                    | Valore      | Target     | Status | Delta vs Base
-----------------------|-------------|------------|--------|---------------
CAC                    | €4.450      | < €8.000   | ✓      | +5% vs Base
LTV                    | €85.000     | > €100k    | ⚠      | -8% vs Base
LTV/CAC Ratio          | 19.1x       | > 5.0x     | ✓✓     | +12% vs Base
Payback Period         | 6.5 mesi    | < 12 mesi  | ✓      | -2 mesi vs Base
ARPU                   | €11.780     | > €10k     | ✓      | Same as Base
Churn Annual           | 8%          | < 8%       | ✓      | Same as Base
Avg Lifetime           | 150 mesi    | > 36 mesi  | ✓✓     | +25% vs Base
Contribution Margin    | €13.834     | > €10k     | ✓      | +8% vs Base
```

### 6.3 VISUALIZZAZIONE

**Tab**: "Overview"
**Component**: `<ParametersOverview>` + KPI section
**Interactive**: Hover for explanations

---

## 7. ADVANCED METRICS SUMMARY

### 7.1 STRUTTURA

**Sezioni**:
1. Break-Even Analysis
2. Unit Economics Details
3. Cash Flow Metrics
4. NPV Breakdown
5. IRR Calculation

### 7.2 ESEMPIO

```
═══════════════════════════════════════════════════════════
BREAK-EVEN ANALYSIS
═══════════════════════════════════════════════════════════
Fixed Costs (Avg):              €3.56M/anno
Variable Cost Per Unit:         €5.746
Price Per Unit:                 €19.580
Contribution Margin:            €13.834

Break-Even Units:               257 deals/anno
Break-Even Revenue:             €5.03M
Break-Even Month:               Mese 38 (Q10 Y4)

═══════════════════════════════════════════════════════════
UNIT ECONOMICS
═══════════════════════════════════════════════════════════
CAC:                            €4.450
LTV:                            €85.000
LTV/CAC Ratio:                  19.1x ✓✓
Payback Period:                 6.5 mesi ✓
ARPU:                           €11.780/anno
Churn Rate:                     8%/anno
Average Lifetime:               150 mesi (12.5 anni)

═══════════════════════════════════════════════════════════
CASH FLOW METRICS
═══════════════════════════════════════════════════════════
Burn Rate (Y1-Y2):              €0.14M/mese
Runway:                         28 mesi ✓
Cash Balance (EOY5):            €14.25M
Cumulative Cash:                €14.25M
Peak Funding Requirement:       €3.85M
Total Funding Raised:           €10.00M

═══════════════════════════════════════════════════════════
VALUATION
═══════════════════════════════════════════════════════════
Discount Rate (WACC):           12%
Terminal Multiple:              3.0x EBITDA

NPV Components:
  PV(EBITDA Y1):                -€1.07M
  PV(EBITDA Y2):                -€0.40M
  PV(EBITDA Y3):                €0.57M
  PV(EBITDA Y4):                €1.33M
  PV(EBITDA Y5):                €1.99M
  PV(Terminal Value):           €5.96M
──────────────────────────────────────────────
NPV:                            €8.38M ✓

IRR:                            32.5% ✓✓
```

### 7.3 VISUALIZZAZIONE

**Tab**: "Advanced"
**Component**: `<AdvancedMetrics>` component
**Format**: Cards with detailed breakdowns

---

## 8. EXPORT FORMATS

### 8.1 CSV EXPORTS

**Available**:
1. **Monthly Data CSV** (60 rows × 16 cols)
2. **Annual Data CSV** (5 rows × 12 cols)
3. **KPI Summary CSV** (45 rows × 5 cols)
4. **Advanced Metrics CSV** (Custom format)
5. **Cash Flow Statements CSV** (5 rows × 20 cols)
6. **Growth Metrics CSV** (Custom format)

### 8.2 JSON EXPORT

**Complete Scenario**:
```json
{
  "scenario": {
    "key": "base",
    "name": "Scenario Base",
    "drivers": { ... },
    "assumptions": { ... }
  },
  "results": {
    "monthlyData": [ ... ],
    "annualData": [ ... ],
    "kpis": { ... },
    "advancedMetrics": { ... },
    "cashFlowStatements": [ ... ],
    "growthMetrics": { ... }
  },
  "metadata": {
    "calculatedAt": "2025-10-01T16:00:00Z",
    "version": "1.0.0"
  }
}
```

### 8.3 PDF EXPORT

**Multi-Page Report**:
- Page 1: Executive Summary + Key Charts
- Page 2: P&L Statement
- Page 3: Cash Flow Statement
- Page 4: Balance Sheet
- Page 5: KPI Dashboard
- Page 6: Charts Gallery
- Page 7: Assumptions Table

---

**TOTALE RENDICONTI: 7**
**GRANULARITÀ: Mensile (60) + Annuale (5)**
**EXPORT: CSV, JSON, PDF**
**VALIDAZIONE: Balance check, consistency checks**
