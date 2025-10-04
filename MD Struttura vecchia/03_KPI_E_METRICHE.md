# 03 - KPI E METRICHE
**Eco 3D Financial Dashboard - Business Plan 2025**

*Generato: 2025-10-01*

---

## 📈 PANORAMICA

Catalogo completo di **40+ KPI e metriche** implementate e visualizzate nella dashboard.

---

## 1. REVENUE KPIs (12 metriche)

### 1.1 TOTAL REVENUE

**Definizione**: Ricavi totali per anno (Recurring + CapEx)

| KPI | Formula | Unità | Dashboard |
|-----|---------|-------|-----------|
| **Total Revenue Y1** | Sum(MRR[1-12]) + Sum(CapEx[1-12]) | M€ | ✓ |
| **Total Revenue Y2** | Sum(MRR[13-24]) + Sum(CapEx[13-24]) | M€ | ✓ |
| **Total Revenue Y3** | Sum(MRR[25-36]) + Sum(CapEx[25-36]) | M€ | ✓ |
| **Total Revenue Y4** | Sum(MRR[37-48]) + Sum(CapEx[37-48]) | M€ | ✓ |
| **Total Revenue Y5** | Sum(MRR[49-60]) + Sum(CapEx[49-60]) | M€ | ✓ |

**Benchmark**: MedTech SaaS tipicamente €0.5M-€5M entro Y5

### 1.2 RECURRING REVENUE

**Definizione**: Solo ricavi ricorrenti (MRR subscription + maintenance)

| KPI | Source | Granularità |
|-----|--------|-------------|
| **MRR** | Monthly Recurring Revenue | 60 valori mensili |
| **Recurring Rev Y1-Y5** | Aggregazione annuale | 5 valori |

**Mix Typico**:
- Subscription: 65-75%
- Maintenance: 25-35%

### 1.3 CAPEX REVENUE

**Definizione**: Ricavi one-time da vendita hardware

| KPI | Formula | Note |
|-----|---------|------|
| **CapEx Rev Monthly** | DevicesCapEx × Price | 60 valori |
| **CapEx Rev Y1-Y5** | Aggregazione annuale | 5 valori |

**Pattern**: 
- Alto nei primi anni (seeding market)
- Riduce con shift verso subscription

### 1.4 ARR (ANNUAL RECURRING REVENUE)

**Definizione**: Run-rate ricavi ricorrenti annuali

| KPI | Formula | Target |
|-----|---------|--------|
| **ARR Run Rate M24** | (AccSub × ARPASub + AccCapEx × ARPAMaint) @ M24 | €1.5M-€3M |
| **ARR Run Rate M60** | (AccSub × ARPASub + AccCapEx × ARPAMaint) @ M60 | €5M-€15M |
| **ARR Subscription M24** | AccSub × ARPASub @ M24 | Tracking |
| **ARR Subscription M60** | AccSub × ARPASub @ M60 | Tracking |
| **ARR Maintenance M24** | AccCapEx × ARPAMaint @ M24 | Tracking |
| **ARR Maintenance M60** | AccCapEx × ARPAMaint @ M60 | Tracking |

**Benchmark ARR Growth**:
- Good: 100% YoY
- Great: 150% YoY
- Exceptional: 200%+ YoY

### 1.5 LTM REVENUE

**Definizione**: Last Twelve Months revenue (trailing)

| KPI | Calculation | Use Case |
|-----|-------------|----------|
| **LTM Revenue** | Sum(TotalRev[49-60]) | Valuation multiple base |

**Utilizzo**: Base per valutazioni EV/Revenue

---

## 2. PROFITABILITY KPIs (10 metriche)

### 2.1 GROSS MARGIN

| KPI | Formula | Target | Attuale |
|-----|---------|--------|---------|
| **Gross Margin Y1** | TotalRev[Y1] - COGS[Y1] | > 60% | Scenario-specific |
| **Gross Margin Y2** | TotalRev[Y2] - COGS[Y2] | > 65% | Scenario-specific |
| **Gross Margin Y3** | TotalRev[Y3] - COGS[Y3] | > 70% | Scenario-specific |
| **Gross Margin Y4** | TotalRev[Y4] - COGS[Y4] | > 75% | Scenario-specific |
| **Gross Margin Y5** | TotalRev[Y5] - COGS[Y5] | > 75% | Scenario-specific |
| **Gross Margin % Avg** | Average(GM%[1-5]) | > 70% | Tracking |

**Benchmark SaaS**:
- Software puro: 80-90%
- SaaS + Hardware: 60-75%
- Hardware puro: 30-50%

### 2.2 EBITDA

| KPI | Formula | Target | Milestone |
|-----|---------|--------|-----------|
| **EBITDA Y1** | GM[Y1] - OPEX[Y1] | Negativo OK | Seeding |
| **EBITDA Y2** | GM[Y2] - OPEX[Y2] | -€0.5M to €0 | Approaching BE |
| **EBITDA Y3** | GM[Y3] - OPEX[Y3] | > €0 | Break-even |
| **EBITDA Y4** | GM[Y4] - OPEX[Y4] | > €1M | Scaling |
| **EBITDA Y5** | GM[Y5] - OPEX[Y5] | > €2M | Profitability |
| **EBITDA Margin %** | EBITDA / Revenue | Y5 > 30% | Efficiency |

**Rule of Thumb**: 
- Y1-Y2: Burn per crescita
- Y3: Break-even
- Y4-Y5: Profitabilità

### 2.3 COGS

| KPI | Components | Tracking |
|-----|------------|----------|
| **COGS Y1-Y5** | Hardware + Recurring | Annual |
| **COGS Recurring** | (1 - GM%) × RecRev | Monthly × 60 |
| **COGS Hardware** | DevicesShipped × Unit Cost | Monthly × 60 |

### 2.4 OPEX

| KPI | Breakdown | Budget |
|-----|-----------|--------|
| **OPEX Y1** | Total operating expenses | €1.5M-€2.0M |
| **OPEX Y2** | Including S&M, R&D, G&A | €2.2M-€2.9M |
| **OPEX Y3** | Full team operational | €3.0M-€4.1M |
| **OPEX Y4** | Scaling organization | €3.5M-€5.2M |
| **OPEX Y5** | Mature organization | €4.2M-€6.3M |

**Typical Split**:
- Sales & Marketing: 30-40%
- R&D: 30-35%
- G&A: 20-25%
- Other: 5-15%

### 2.5 BREAK-EVEN

| KPI | Definition | Calculation |
|-----|------------|-------------|
| **Break-Even Year (EBITDA)** | First year EBITDA ≥ 0 | Year number or null |
| **Break-Even Year (CFO)** | First year cumulative CF ≥ 0 | Year number or null |
| **Break-Even Month** | First month cumulative EBITDA ≥ 0 | Month 1-60 or null |

**Target**: Y3 o prima per venture-backed startup

### 2.6 LTM EBITDA

| KPI | Use | Formula |
|-----|-----|---------|
| **LTM EBITDA** | Valuation base | EBITDA Year 5 |

**Utilizzo**: Base per EV/EBITDA multiple

---

## 3. CUSTOMER KPIs (8 metriche)

### 3.1 ACCOUNTS ACTIVE

**Definizione**: Clienti attivi paganti

| KPI | Granularità | Range Atteso Y5 |
|-----|-------------|-----------------|
| **Accounts Active** | 60 valori mensili | 200-800 |
| **Accounts Subscription** | 60 valori mensili | 140-560 (70%) |
| **Accounts CapEx** | 60 valori mensili | 60-240 (30%) |

**Growth Pattern**: 
- Y1: 20-80 accounts
- Y2: 60-180 accounts
- Y3: 120-300 accounts
- Y4: 180-450 accounts
- Y5: 250-600 accounts

### 3.2 DEVICES

| KPI | Type | Tracking |
|-----|------|----------|
| **Devices Active** | Total parco installato | 60 mesi |
| **Devices Shipped** | New deployments | 60 mesi |
| **Devices per Account** | Avg multiplier | Calculated |

**Average**: 1.2-1.5 devices per account

### 3.3 DEALS

| KPI | Split | Conversion |
|-----|-------|------------|
| **Deals Total** | Monthly new contracts | From funnel |
| **Deals CapEx** | Purchase contracts | Mix% |
| **Deals Subscription** | Rental contracts | 1 - Mix% |

**Velocity**: 
- Y1: 2-8 deals/mese
- Y5: 10-40 deals/mese

### 3.4 SCANS PERFORMED

| KPI | Formula | Purpose |
|-----|---------|---------|
| **Scans Performed** | DevicesActive × ScansPerMonth | Utilization tracking |
| **Scans Year 5** | Sum(Scans[49-60]) | SOM calculation |

**Utilization Target**: 50-80 scans/device/mese

### 3.5 SHARE OF MARKET (SOM)

| KPI | Formula | Target Y5 |
|-----|---------|-----------|
| **SOM %** | (EffectiveScansY5 / SAM) × 100 | 0.01%-0.1% |

**Interpretation**:
- 0.01%: Early traction
- 0.05%: Meaningful presence
- 0.1%: Market player
- 0.5%: Dominant player

---

## 4. UNIT ECONOMICS (8 metriche)

### 4.1 CAC (CUSTOMER ACQUISITION COST)

**Definizione**: Costo per acquisire un cliente

| Metric | Formula | Benchmark |
|--------|---------|-----------|
| **CAC** | Total S&M / Total Customers | €3.000-€8.000 |

**Calculation Period**: 5 anni totali

**Breakdown**:
- Sales team costs: 60%
- Marketing costs: 30%
- Tools & infrastructure: 10%

### 4.2 LTV (LIFETIME VALUE)

**Definizione**: Valore atteso lifetime di un cliente

| Metric | Formula | Target |
|--------|---------|--------|
| **LTV** | ARPU × (Lifetime / 12) | > €100.000 |

**Components**:
- ARPU: €11.000-€16.000/anno
- Lifetime: 30-60 mesi tipico
- Churn: 5-10% annuo

### 4.3 LTV/CAC RATIO

**Definizione**: Efficienza acquisizione clienti

| Ratio | Interpretation | Action |
|-------|----------------|--------|
| < 1.0 | Insostenibile | Stop growth |
| 1.0-3.0 | Marginal | Optimize |
| 3.0-5.0 | Healthy | Scale cautiously |
| 5.0-7.0 | Excellent | Scale aggressively |
| > 7.0 | World-class | Maximize growth |

**Target**: > 5.0 per venture scale

### 4.4 PAYBACK PERIOD

**Definizione**: Mesi per recuperare CAC

| Metric | Formula | Target |
|--------|---------|--------|
| **Payback Period** | CAC / (ARPU / 12) | < 12 mesi |

**Benchmark**:
- < 6 mesi: Eccezionale
- 6-12 mesi: Ottimo
- 12-18 mesi: Accettabile
- > 18 mesi: Preoccupante

### 4.5 ARPU (AVERAGE REVENUE PER USER)

| Metric | Calculation | Range |
|--------|-------------|-------|
| **ARPU** | Weighted avg by mix | €11.000-€16.000/anno |

**Split**:
- Subscription ARPU: €13.000-€16.000
- Maintenance ARPU: €4.500-€5.800

### 4.6 CHURN RATE

| Metric | Type | Target |
|--------|------|--------|
| **Churn Annual** | Customer churn | < 8% |
| **HW Churn Annual** | Device churn | < 3% |

**Benchmark SaaS**:
- Enterprise: 5-7%
- SMB: 10-15%
- Consumer: 20-40%

### 4.7 AVERAGE LIFETIME

| Metric | Formula | Typical |
|--------|---------|---------|
| **Avg Lifetime** | 12 / Annual Churn | 30-60 mesi |

**Example**:
- 8% churn → 150 mesi (12.5 anni)
- 10% churn → 120 mesi (10 anni)

### 4.8 CONTRIBUTION MARGIN

| Metric | Formula | Use |
|--------|---------|-----|
| **Contribution Margin** | Price - Variable Cost | Break-even calc |

**Per Unit**: €10.000-€15.000

---

## 5. CASH FLOW KPIs (8 metriche)

### 5.1 OPERATING CASH FLOW

| KPI | Period | Expected Pattern |
|-----|--------|------------------|
| **Operating CF Y1** | Annual | Negative (burn) |
| **Operating CF Y2** | Annual | Negative (improving) |
| **Operating CF Y3** | Annual | Zero to positive |
| **Operating CF Y4** | Annual | Positive |
| **Operating CF Y5** | Annual | Strongly positive |

### 5.2 INVESTING CASH FLOW

| KPI | Components | Typical |
|-----|------------|---------|
| **Investing CF** | CapEx + Acquisitions | -5% to -15% revenue |

### 5.3 FINANCING CASH FLOW

| KPI | Sources | Timing |
|-----|---------|--------|
| **Financing CF Y1** | Seed | +€2.0M |
| **Financing CF Y2** | Seed+ | +€3.0M |
| **Financing CF Y3** | Series A | +€5.0M |

### 5.4 NET CASH FLOW

| KPI | Formula | Cumulative |
|-----|---------|------------|
| **Net CF** | Operating + Investing + Financing | Annual |
| **Cumulative Cash** | Running sum | 60 mesi |

### 5.5 BURN RATE

| KPI | Definition | Target |
|-----|------------|--------|
| **Burn Rate** | Monthly cash consumption | Y1-Y2: €100k-€200k/mese |

**Formula**: Avg(-EBITDA / 12) primi 2 anni

### 5.6 RUNWAY

| KPI | Definition | Minimum |
|-----|------------|---------|
| **Runway** | Cash / Burn Rate | > 18 mesi sempre |

**Red Flags**:
- < 6 mesi: Emergency
- 6-12 mesi: Urgent fundraising
- 12-18 mesi: Start fundraising
- > 18 mesi: Comfortable

### 5.7 PEAK FUNDING REQUIREMENT

| KPI | Definition | Purpose |
|-----|------------|---------|
| **Peak Funding** | Max cumulative negative cash | Total capital needed |

**Use**: Size funding rounds

### 5.8 CASH BALANCE

| KPI | Tracking | Critical |
|-----|----------|----------|
| **Current Cash** | End of period | Never negative |

---

## 6. VALUATION KPIs (2 metriche)

### 6.1 NPV (NET PRESENT VALUE)

**Definizione**: Valore attuale netto progetto

| Metric | Inputs | Typical Range |
|--------|--------|---------------|
| **NPV** | EBITDA + Terminal Value @ WACC 12% | €5M-€20M |

**Components**:
- PV(EBITDA 5 years)
- PV(Terminal Value)
- Terminal = EBITDA Y5 × Multiple (3-4x)

**Interpretation**:
- NPV > €10M: Attractive investment
- NPV €5-10M: Reasonable
- NPV < €5M: Marginal
- NPV < 0: Not viable

### 6.2 IRR (INTERNAL RATE OF RETURN)

**Definizione**: Tasso rendimento interno progetto

| Metric | Method | Target |
|--------|--------|--------|
| **IRR** | Newton-Raphson | > 25% |

**Benchmark Venture**:
- < 15%: Below VC threshold
- 15-20%: Acceptable
- 20-30%: Good
- 30-50%: Very good
- > 50%: Exceptional

**Comparison**:
- IRR > WACC: Create value
- IRR = WACC: Break-even
- IRR < WACC: Destroy value

---

## 7. GROWTH KPIs (9 metriche)

### 7.1 CAGR METRICS

| KPI | Period | Target |
|-----|--------|--------|
| **Revenue CAGR** | 5 years | > 80% |
| **ARR CAGR** | 4 years | > 100% |
| **EBITDA CAGR** | From positive | > 50% |

**World-Class**:
- Revenue CAGR > 100%
- ARR CAGR > 150%

### 7.2 RULE OF 40

**Definizione**: Revenue Growth % + EBITDA Margin %

| Score | Interpretation | Status |
|-------|----------------|--------|
| < 0 | Poor | Red flag |
| 0-20 | Below average | Improve |
| 20-40 | Average | Acceptable |
| 40-60 | Good | Healthy |
| > 60 | Excellent | World-class |

**Target Y5**: > 40

### 7.3 MRR GROWTH RATES

| KPI | Granularity | Typical |
|-----|-------------|---------|
| **MRR Growth MoM** | 59 values | 2-10% |

**Pattern**:
- Y1: 5-15% MoM (early volatility)
- Y2-Y3: 3-8% MoM (stabilizing)
- Y4-Y5: 2-5% MoM (mature growth)

### 7.4 QOQ GROWTH RATES

| KPI | Quarters | Range |
|-----|----------|-------|
| **QoQ Growth** | 19 values (Q2-Q20) | 10-30% |

### 7.5 YOY GROWTH RATES

| KPI | Years | Target |
|-----|-------|--------|
| **YoY Growth Y2/Y1** | First year | > 200% |
| **YoY Growth Y3/Y2** | Second year | > 150% |
| **YoY Growth Y4/Y3** | Third year | > 100% |
| **YoY Growth Y5/Y4** | Fourth year | > 80% |

**SaaS Magic Number**: > 0.75 is good

### 7.6 GROSS MARGIN TREND

| KPI | Pattern | Target |
|-----|---------|--------|
| **GM Trend Y1-Y5** | 5 values | Increasing |

**Expected**: 60% → 65% → 70% → 75% → 75%

### 7.7 QUICK RATIO

**Definizione**: New MRR / Churned MRR

| Ratio | Health | Action |
|-------|--------|--------|
| < 1.0 | Unhealthy | Fix churn |
| 1.0-2.0 | Acceptable | Monitor |
| 2.0-4.0 | Good | Continue |
| > 4.0 | Excellent | Scale |

**Target**: > 2.0

---

## 8. KPI DASHBOARD LAYOUT

### 8.1 PRIMARY KPIs (Hero Metrics)

Displayed prominently on main dashboard:

1. **Total Revenue Y5**
2. **ARR Run Rate M60**
3. **EBITDA Y5**
4. **LTV/CAC Ratio**
5. **NPV**
6. **Break-Even Year**

### 8.2 SECONDARY KPIs

In detail views:

- Revenue breakdown
- Profitability metrics
- Customer metrics
- Unit economics
- Cash flow metrics
- Growth rates

### 8.3 TERTIARY KPIs

In advanced/export views:

- Monthly granular data
- Detailed growth rates
- Working capital details
- Balance sheet metrics

---

## 9. KPI ALERTS & THRESHOLDS

### 9.1 RED FLAGS 🔴

| KPI | Threshold | Alert |
|-----|-----------|-------|
| **Burn Rate** | > €250k/mese | Critical |
| **Runway** | < 6 mesi | Emergency |
| **LTV/CAC** | < 2.0 | Economics broken |
| **Churn** | > 15% | High attrition |
| **Payback** | > 24 mesi | Too long |

### 9.2 WARNINGS 🟡

| KPI | Threshold | Monitor |
|-----|-----------|---------|
| **Runway** | 6-12 mesi | Plan fundraise |
| **LTV/CAC** | 2.0-3.0 | Improve efficiency |
| **Churn** | 10-15% | Address retention |
| **Payback** | 18-24 mesi | Optimize |

### 9.3 HEALTHY 🟢

| KPI | Threshold | Status |
|-----|-----------|--------|
| **Runway** | > 18 mesi | Comfortable |
| **LTV/CAC** | > 5.0 | Excellent |
| **Churn** | < 8% | Low |
| **Payback** | < 12 mesi | Fast |

---

**TOTALE KPIs IMPLEMENTATI: 45**
**DASHBOARDS: 7 viste principali**
**EXPORT: Tutti KPI esportabili CSV/JSON**
