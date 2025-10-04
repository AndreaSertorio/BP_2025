# 02 - FORMULE E CALCOLI FINANZIARI
**Eco 3D Financial Dashboard - Business Plan 2025**

*Generato: 2025-10-01*

---

## 📐 PANORAMICA

Questo documento cataloga tutte le **40+ formule** implementate nel motore di calcolo finanziario.

---

## 1. LEAD GENERATION

### 1.1 MARKET-BASED CALCULATION (Predefinito)

**Step 1: Market Penetration nel Tempo**
```typescript
yearProgress = min(yearNum, 5) / 5
currentPenetration = marketPenY1 + (marketPenY5 - marketPenY1) × yearProgress
```

**Esempio**:
- Anno 1: penetration = 0.008%
- Anno 3: penetration = 0.008% + (0.05% - 0.008%) × (3/5) = 0.0332%
- Anno 5: penetration = 0.05%

**Step 2: Base Monthly Leads**
```typescript
baseMonthlyLeads = (SAM × 1000 × currentPenetration) / 12
```

**Esempio** (Anno 1 con SAM 31.900K):
```
baseMonthlyLeads = (31.900 × 1000 × 0.00008) / 12 = 213 leads/mese
```

**Step 3: Seasonal/Growth Factor**
```typescript
// Primi 8 trimestri: usa pattern stagionale
if (quarter ≤ 8):
  seasonalFactor = leadsQ[quarter-1] / leadsQ[0]

// Post Q8: crescita composta
else:
  seasonalFactor = (1 + growthQoQ)^(quarter - 8)
```

**Step 4: Leads Finali**
```typescript
Leads = baseMonthlyLeads × seasonalFactor × leadMult
```

### 1.2 HARDCODED CALCULATION (Fallback)

**Primi 8 Trimestri**:
```typescript
Leads = (leadsPerQuarterQ[quarter-1] / 3) × leadMult
```

**Post Trimestre 8**:
```typescript
baseQ8 = leadsPerQuarterQ[7]
growthFactor = (1 + growthQoQ)^(quarter - 8)
Leads = (baseQ8 × growthFactor / 3) × leadMult
```

---

## 2. FUNNEL CONVERSION

### 2.1 DEALS CALCULATION

**Formula Base**:
```typescript
Deals = Leads × L2D × D2P × P2D
```

**Esempio** (Scenario Base):
```
Leads = 200
L2D = 20% = 0.20
D2P = 50% = 0.50
P2D = 60% = 0.60

Deals = 200 × 0.20 × 0.50 × 0.60 = 12 deals/mese
```

### 2.2 SPLIT BY CONTRACT TYPE

```typescript
DealsCapEx = Deals × mixCapEx
DealsSub = Deals × (1 - mixCapEx)
```

**Esempio** (Mix 30% CapEx):
```
Deals = 12
mixCapEx = 0.30

DealsCapEx = 12 × 0.30 = 3.6 deals CapEx
DealsSub = 12 × 0.70 = 8.4 deals Subscription
```

### 2.3 DEVICE SHIPMENTS

```typescript
DevicesCapExShipped = DealsCapEx × dealMult
DevicesSubShipped = DealsSub × dealMult
DevicesShipped = DevicesCapExShipped + DevicesSubShipped
```

**Esempio** (Deal Multiplier 1.2x):
```
DealsCapEx = 3.6
DealsSub = 8.4
dealMult = 1.2

DevicesCapExShipped = 3.6 × 1.2 = 4.32 devices
DevicesSubShipped = 8.4 × 1.2 = 10.08 devices
DevicesShipped = 14.4 devices/mese
```

---

## 3. CHURN & RETENTION

### 3.1 ANNUAL TO MONTHLY CHURN CONVERSION

**Formula**:
```typescript
ChurnMonthly = 1 - (1 - ChurnAnnual)^(1/12)
```

**Derivazione**:
- Se il churn annuale è 8%, vogliamo trovare il churn mensile
- Dopo 12 mesi: (1 - ChurnMonthly)^12 = (1 - 0.08) = 0.92
- Quindi: ChurnMonthly = 1 - 0.92^(1/12) = 1 - 0.9932 = 0.0068 = 0.68%

**Esempi**:
| Churn Annuale | Churn Mensile |
|---------------|---------------|
| 5% | 0.43% |
| 8% | 0.68% |
| 10% | 0.87% |
| 15% | 1.35% |
| 20% | 1.84% |

### 3.2 ACCOUNT DYNAMICS

**Formula Ricorsiva**:
```typescript
Accounts[t] = Accounts[t-1] × (1 - ChurnMonthly) + NewDeals[t]
```

**Split by Type**:
```typescript
AccountsCapEx[t] = AccountsCapEx[t-1] × (1 - ChurnMonthly) + DealsCapEx[t]
AccountsSub[t] = AccountsSub[t-1] × (1 - ChurnMonthly) + DealsSub[t]
AccountsActive = AccountsCapEx + AccountsSub
```

**Esempio Simulazione 3 Mesi**:
```
Mese 0: Accounts = 0
Mese 1: Accounts = 0 × 0.9932 + 12 = 12.00
Mese 2: Accounts = 12 × 0.9932 + 12 = 23.92
Mese 3: Accounts = 23.92 × 0.9932 + 12 = 35.76
```

### 3.3 DEVICE DYNAMICS

**Formula con Hardware Churn**:
```typescript
DevicesActive[t] = DevicesActive[t-1] × (1 - hwChurnMonthly) + DevicesShipped[t]
```

**Note**: 
- `hwChurnMonthly` è già mensile (non necessita conversione)
- Tipicamente 0.0025 = 0.25%/mese = ~3%/anno

---

## 4. REVENUE CALCULATIONS

### 4.1 ARPA CALCULATION (Sector-Based)

**Se Sector Markets Abilitati**:
```typescript
// Step 1: Calcola prezzo medio
totalPrice = 0
activeSectors = 0

for each sector in [tiroide, rene, msk, senologia]:
  if (sector.enabled):
    totalPrice += sector.pricePerExam
    activeSectors++

avgPricePerExam = totalPrice / activeSectors

// Step 2: Calcola ARPA da utilizzo
arpaSubCalculated = avgPricePerExam × scansPerDevicePerMonth × 12
arpaMaintCalculated = arpaSubCalculated × 0.15  // 15% for maintenance
```

**Esempio** (Tutti Settori Attivi):
```
Tiroide: €75
Rene: €60
MSK: €85
Senologia: €90

avgPrice = (75 + 60 + 85 + 90) / 4 = €77.50

Con 60 scans/mese:
ARPA Sub = 77.50 × 60 × 12 = €55.800/anno
ARPA Maint = 55.800 × 0.15 = €8.370/anno
```

**Se Sector Markets NON Abilitati**:
```typescript
arpaSubCalculated = drivers.arpaSub      // Usa valore configurato
arpaMaintCalculated = drivers.arpaMaint
```

### 4.2 MONTHLY RECURRING REVENUE (MRR)

**Formula**:
```typescript
RecurringRev = (AccountsSub × (arpaSub/12) + AccountsCapEx × (arpaMaint/12)) / 1e6
```

**Unità**: M€ (milioni di euro)

**Esempio**:
```
AccountsSub = 50
AccountsCapEx = 20
ARPA Sub = €14.600/anno
ARPA Maint = €5.200/anno

MRR Sub = 50 × (14.600/12) = €60.833/mese
MRR Maint = 20 × (5.200/12) = €8.667/mese
MRR Total = (60.833 + 8.667) / 1000 = €0.0695M = €69.500/mese
```

### 4.3 CAPEX REVENUE (One-Time)

**Formula**:
```typescript
CapExRev = (DevicesCapExShipped × devicePrice) / 1e6
```

**Esempio**:
```
DevicesCapExShipped = 4.32
devicePrice = €26.000

CapExRev = (4.32 × 26.000) / 1e6 = €0.112M
```

### 4.4 TOTAL REVENUE

```typescript
TotalRev = RecurringRev + CapExRev
```

---

## 5. COST OF GOODS SOLD (COGS)

### 5.1 COGS RECURRING

**Formula**:
```typescript
CogsRecurring = (1 - gmRecurring) × RecurringRev
```

**Esempio** (GM 80%):
```
RecurringRev = €0.0695M
gmRecurring = 0.80

CogsRecurring = (1 - 0.80) × 0.0695 = 0.20 × 0.0695 = €0.0139M
```

### 5.2 COGS HARDWARE

**Formula**:
```typescript
year = ceil(month / 12)
CogsHardware = (DevicesCapExShipped × cogsHw[year]) / 1e6
```

**IMPORTANTE**: COGS applicato **SOLO** su `DevicesCapExShipped`, non su tutti i devices!

**Esempio**:
```
DevicesCapExShipped = 4.32
year = 1
cogsHw[1] = €12.000

CogsHardware = (4.32 × 12.000) / 1e6 = €0.0518M
```

### 5.3 TOTAL COGS

```typescript
COGS = CogsRecurring + CogsHardware
```

---

## 6. PROFITABILITY

### 6.1 GROSS MARGIN

**Formula**:
```typescript
GrossMargin = TotalRev - COGS
```

**In Percentage**:
```typescript
GrossMarginPercent = (GrossMargin / TotalRev) × 100
```

**Esempio**:
```
TotalRev = €0.182M
COGS = €0.066M

GrossMargin = 0.182 - 0.066 = €0.116M
GrossMargin% = (0.116 / 0.182) × 100 = 63.7%
```

### 6.2 EBITDA

**Formula Annuale**:
```typescript
EBITDA = GrossMargin - OPEX
```

**Dove**:
- `GrossMargin` = somma 12 mesi gross margin
- `OPEX` = costo operativo annuale configurato

**Esempio** (Anno 1):
```
GrossMargin Year 1 = €2.5M
OPEX Year 1 = €1.8M

EBITDA = 2.5 - 1.8 = €0.7M
```

**EBITDA Margin**:
```typescript
EBITDAMargin = (EBITDA / TotalRevenue) × 100
```

---

## 7. ANNUAL RECURRING REVENUE (ARR)

### 7.1 ARR CALCULATION

**Formula** (Fine Periodo):
```typescript
ARR = (AccountsSub × arpaSub + AccountsCapEx × arpaMaint) / 1e6
```

**Esempio** (Fine Anno 2, M24):
```
AccountsSub[23] = 120
AccountsCapEx[23] = 40
arpaSub = €14.600
arpaMaint = €5.200

ARR_Sub = 120 × 14.600 = €1.752M
ARR_Maint = 40 × 5.200 = €0.208M
ARR_Total = 1.752 + 0.208 = €1.96M
```

### 7.2 ARR RUN-RATE

**M24 (Fine Anno 2)**:
```typescript
ARRRunRateM24 = ARR at month 24
```

**M60 (Fine Anno 5)**:
```typescript
ARRRunRateM60 = ARR at month 60
```

---

## 8. SCANS PERFORMED

**Formula**:
```typescript
ScansPerformed = DevicesActive × scansPerDevicePerMonth
```

**Esempio**:
```
DevicesActive = 150
scansPerDevicePerMonth = 60

ScansPerformed = 150 × 60 = 9.000 scansioni/mese
```

**Annuale**:
```
ScansPerYear = ScansPerformed × 12 = 9.000 × 12 = 108.000 scansioni/anno
```

---

## 9. BREAK-EVEN ANALYSIS

### 9.1 UNIT ECONOMICS BREAK-EVEN

**Fixed Costs**:
```typescript
avgOpex = sum(opex[1:5]) / 5  // Media OPEX 5 anni
```

**Price Per Unit**:
```typescript
avgArpa = arpaSub × (1 - mixCapEx) + arpaMaint × mixCapEx
pricePerUnit = devicePrice × mixCapEx + avgArpa
```

**Variable Cost Per Unit**:
```typescript
avgCogsHw = sum(cogsHw[1:5]) / 5
variableCostPerUnit = avgCogsHw × mixCapEx + (1 - gmRecurring) × avgArpa
```

**Contribution Margin**:
```typescript
contributionMargin = pricePerUnit - variableCostPerUnit
```

**Break-Even Units**:
```typescript
breakEvenUnits = (avgOpex × 1e6) / contributionMargin
```

**Break-Even Revenue**:
```typescript
breakEvenRevenue = (breakEvenUnits × pricePerUnit) / 1e6  // M€
```

**Esempio** (Scenario Base):
```
avgOpex = (1.8 + 2.5 + 3.5 + 4.5 + 5.5) / 5 = €3.56M
avgArpa = 14.600 × 0.7 + 5.200 × 0.3 = €11.780
pricePerUnit = 26.000 × 0.3 + 11.780 = €19.580
avgCogsHw = 11.300
variableCostPerUnit = 11.300 × 0.3 + 0.2 × 11.780 = €5.746
contributionMargin = 19.580 - 5.746 = €13.834

breakEvenUnits = (3.56 × 1e6) / 13.834 = 257 deals
breakEvenRevenue = (257 × 19.580) / 1e6 = €5.03M
```

### 9.2 TIME TO BREAK-EVEN

**Cumulative EBITDA Method**:
```typescript
cumulativeEbitda = 0

for month = 1 to 60:
  yearIndex = floor((month - 1) / 12)
  monthlyOpex = opex[yearIndex + 1] / 12
  monthlyEbitda = monthlyData[month].grossMargin - monthlyOpex
  cumulativeEbitda += monthlyEbitda
  
  if (cumulativeEbitda >= 0):
    breakEvenMonth = month
    break
```

---

## 10. CAC & LTV

### 10.1 CUSTOMER ACQUISITION COST (CAC)

**Formula**:
```typescript
totalMarketingCosts = sum(salesMarketingOpex[1:5])  // M€
totalNewCustomers = sum(monthlyData[0:59].deals)

CAC = (totalMarketingCosts × 1e6) / totalNewCustomers  // €
```

**Esempio**:
```
S&M Year 1-5 = [0.54, 0.75, 1.05, 1.35, 1.65] = €5.34M total
Total Deals 60 mesi = 1.200 customers

CAC = (5.34 × 1e6) / 1.200 = €4.450 per customer
```

### 10.2 LIFETIME VALUE (LTV)

**Average Revenue Per User**:
```typescript
avgArpa = arpaSub × (1 - mixCapEx) + arpaMaint × mixCapEx
ARPU = avgArpa
```

**Annual Churn from Monthly**:
```typescript
annualChurnRate = 1 - (1 - hwChurn)^12
```

**Average Lifetime**:
```typescript
averageLifetime = 12 / annualChurnRate  // Months
```

**LTV Calculation**:
```typescript
LTV = ARPU × (averageLifetime / 12)  // €
```

**Esempio**:
```
ARPU = €11.780/anno
hwChurn = 0.0025/mese
annualChurn = 1 - 0.9975^12 = 0.0296 = 2.96%
averageLifetime = 12 / 0.0296 = 405 mesi = 33.8 anni

LTV = 11.780 × (405 / 12) = €397.650

(Nota: lifetime molto alto indica churn molto basso)
```

### 10.3 LTV/CAC RATIO

**Formula**:
```typescript
ltvCacRatio = LTV / CAC
```

**Benchmark SaaS**:
- < 1.0: Insostenibile
- 1.0 - 3.0: Marginal
- 3.0 - 5.0: Healthy
- > 5.0: Eccellente
- > 7.0: World-class

### 10.4 PAYBACK PERIOD

**Formula**:
```typescript
monthlyRevPerCustomer = ARPU / 12
paybackPeriod = CAC / monthlyRevPerCustomer  // Mesi
```

**Esempio**:
```
CAC = €4.450
ARPU = €11.780/anno
monthlyRev = 11.780 / 12 = €982/mese

paybackPeriod = 4.450 / 982 = 4.5 mesi
```

**Benchmark**: < 12 mesi è ottimo per SaaS

---

## 11. NPV & IRR

### 11.1 NET PRESENT VALUE (NPV)

**Formula**:
```typescript
discountRate = assumptions.discountRate || 0.12
npv = 0

// Discount cash flows 5 anni
for year = 0 to 4:
  cashFlow = annualData[year].ebitda
  discountFactor = (1 + discountRate)^(year + 1)
  npv += cashFlow / discountFactor

// Terminal Value
terminalMultiple = drivers.terminalValueMultiple || 3.0
terminalValue = annualData[4].ebitda × terminalMultiple
terminalDiscountFactor = (1 + discountRate)^5
npv += terminalValue / terminalDiscountFactor
```

**Esempio** (Scenario Base, WACC 12%):
```
EBITDA = [-1.2, -0.5, 0.8, 2.1, 3.5] M€
Terminal Multiple = 3.0x
Terminal Value = 3.5 × 3.0 = €10.5M

Year 1: -1.2 / 1.12^1 = -1.07
Year 2: -0.5 / 1.12^2 = -0.40
Year 3: 0.8 / 1.12^3 = 0.57
Year 4: 2.1 / 1.12^4 = 1.33
Year 5: 3.5 / 1.12^5 = 1.99
Terminal: 10.5 / 1.12^5 = 5.96

NPV = -1.07 - 0.40 + 0.57 + 1.33 + 1.99 + 5.96 = €8.38M
```

**Interpretazione**:
- NPV > 0: Progetto crea valore
- NPV < 0: Progetto distrugge valore
- NPV = 0: Progetto in break-even

### 11.2 INTERNAL RATE OF RETURN (IRR)

**Cash Flows Setup**:
```typescript
initialInvestment = assumptions.initialCash
cashFlows = [-initialInvestment]

for year in annualData:
  cashFlows.push(year.ebitda)

// Add terminal value to last year
terminalMultiple = drivers.terminalValueMultiple || 3.0
cashFlows[5] += annualData[4].ebitda × terminalMultiple
```

**Newton-Raphson Method**:
```typescript
rate = 0.1  // Starting guess 10%
maxIterations = 100
tolerance = 1e-6

for i = 0 to maxIterations:
  npv = 0
  dnpv = 0  // Derivative
  
  for j = 0 to cashFlows.length:
    factor = (1 + rate)^j
    npv += cashFlows[j] / factor
    dnpv -= j × cashFlows[j] / (factor × (1 + rate))
  
  if (abs(npv) < tolerance):
    return rate × 100  // As percentage
  
  rate = rate - npv / dnpv
  
  if (rate < -0.99 || rate > 10):
    return null  // No convergence

return null
```

**Interpretazione**:
- IRR > WACC: Progetto crea valore
- IRR < WACC: Progetto distrugge valore
- IRR = WACC: Progetto indifferente

---

## 12. CASH FLOW CALCULATIONS

### 12.1 OPERATING CASH FLOW

**Base**:
```typescript
operatingCF = EBITDA - ΔWorkingCapital
```

**Working Capital Components**:

**Accounts Receivable**:
```typescript
avgRevenue = annualRev / 12
daysReceivable = 45
AR = (avgRevenue × daysReceivable) / 30
ΔAR = AR[year] - AR[year-1]
```

**Inventory**:
```typescript
monthlyCogsHw = sum(monthlyCogsHw[year]) / 12
inventory = monthlyCogsHw × 2  // 2 mesi scorte
ΔInventory = Inventory[year] - Inventory[year-1]
```

**Accounts Payable**:
```typescript
daysPayable = 30
AP = opex[year] / 12
ΔAP = AP[year] - AP[year-1]
```

**Total WC Change**:
```typescript
ΔWC = ΔAR + ΔInventory - ΔAP
```

**Operating CF**:
```typescript
operatingCF = EBITDA - ΔWC
```

### 12.2 INVESTING CASH FLOW

**CapEx**:
```typescript
capexIntensity = assumptions.capexAsPercentRevenue || 0.05
capex = annualRev × capexIntensity

investingCF = -capex
```

### 12.3 FINANCING CASH FLOW

**Equity Raised**:
```typescript
// From funding rounds configuration
if (year === round.year):
  equityRaised = round.amount

financingCF = equityRaised + debtIssued - debtRepaid
```

### 12.4 NET CASH FLOW

```typescript
netCF = operatingCF + investingCF + financingCF
endingCash = beginningCash + netCF
```

### 12.5 BURN RATE

**Formula**:
```typescript
// Media burn primi 2 anni
year1Burn = EBITDA[0] < 0 ? -EBITDA[0] / 12 : 0
year2Burn = EBITDA[1] < 0 ? -EBITDA[1] / 12 : 0

burnRate = (year1Burn + year2Burn) / 2  // M€/mese
```

### 12.6 RUNWAY

**Formula**:
```typescript
currentCash = max(cumulativeCash, 0)
runway = burnRate > 0 ? currentCash / burnRate : Infinity  // Mesi
```

---

## 13. SHARE OF MARKET (SOM)

### 13.1 CURRENT CALCULATION

```typescript
// Anno 5 (ultimi 12 mesi)
scansY5 = sum(monthlyData[48:59].scansPerformed)

// SAM hardcoded
samVolumeAnnual = 31.9e6

// Realization factor
realizationFactor = 0.85

effectiveScansY5 = scansY5 × realizationFactor
SOMPercent = (effectiveScansY5 / samVolumeAnnual) × 100
```

### 13.2 CORRECTED CALCULATION (Da Implementare)

```typescript
// Use dynamic SAM
samVolumeAnnual = assumptions.samAnnualScans

effectiveScansY5 = scansY5 × realizationFactor
SOMPercent = (effectiveScansY5 / samVolumeAnnual) × 100
```

---

## 14. GROWTH METRICS

### 14.1 CAGR (Compound Annual Growth Rate)

**Revenue CAGR**:
```typescript
startRevenue = annualData[0].totalRev
endRevenue = annualData[4].totalRev

revenueCagr = (endRevenue / startRevenue)^(1/5) - 1
revenueCagrPercent = revenueCagr × 100
```

**ARR CAGR**:
```typescript
startArr = annualData[0].arr
endArr = annualData[4].arr

arrCagr = (endArr / startArr)^(1/4) - 1  // 4 anni crescita
```

### 14.2 RULE OF 40

**Formula**:
```typescript
// Year 5 metrics
y4Revenue = annualData[3].totalRev
y5Revenue = annualData[4].totalRev
revenueGrowth = ((y5Revenue - y4Revenue) / y4Revenue) × 100

y5EbitdaMargin = (annualData[4].ebitda / y5Revenue) × 100

ruleOf40 = revenueGrowth + y5EbitdaMargin
```

**Benchmark**: 
- < 0: Poor
- 0-20: Below average
- 20-40: Average
- > 40: Excellent

### 14.3 MRR GROWTH

**Month-over-Month**:
```typescript
for month = 1 to 59:
  currentMrr = monthlyData[month].recurringRev
  previousMrr = monthlyData[month-1].recurringRev
  
  mrrGrowth = ((currentMrr - previousMrr) / previousMrr) × 100
```

### 14.4 QUICK RATIO

**Formula SaaS**:
```typescript
// Ultimi 3 mesi vs precedenti 3
lastMonths = monthlyData[-3:]
firstMonths = monthlyData[-6:-3]

newMrr = 0
churnedMrr = 0

for i = 0 to 2:
  if (lastMonths[i].mrr > firstMonths[i].mrr):
    newMrr += difference
  else:
    churnedMrr += difference

quickRatio = newMrr / churnedMrr
```

**Benchmark**:
- < 1.0: Unhealthy (losing more than gaining)
- 1.0-2.0: Acceptable
- 2.0-4.0: Good
- > 4.0: Excellent

---

**TOTALE FORMULE DOCUMENTATE: 40+**
**COMPLESSITÀ COMPUTAZIONALE: O(60) per calcoli mensili, O(5) per annuali**
