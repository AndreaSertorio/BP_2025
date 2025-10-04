# 04 - GRAFICI E VISUALIZZAZIONI
**Eco 3D Financial Dashboard - Business Plan 2025**

*Generato: 2025-10-01*

---

## 📊 PANORAMICA

Catalogo completo di **20+ grafici interattivi** implementati usando **Recharts 2.8**.

---

## 1. DASHBOARD PRINCIPALE (6 grafici)

### 1.1 REVENUE BREAKDOWN

**Tipo**: Stacked Bar Chart
**Libreria**: `<BarChart>` + `<Bar>` (Recharts)
**Dati**: Annual aggregation

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'Ricavi Ricorrenti': 0.5, 'Ricavi CapEx': 0.3, 'Totale': 0.8 },
  { year: 'Y2', 'Ricavi Ricorrenti': 1.2, 'Ricavi CapEx': 0.5, 'Totale': 1.7 },
  ...
]
```

**Visualizzazione**:
- **X-Axis**: Years (Y1-Y5)
- **Y-Axis**: Revenue (M€)
- **Bars Stacked**:
  - Blue: Ricavi Ricorrenti (MRR)
  - Orange: Ricavi CapEx (Hardware)
- **Tooltip**: Mostra breakdown + totale

**Insight**:
- Vedere mix revenue evolution
- Shift verso ricorrente nel tempo
- Seasonality patterns

**Posizione**: Tab "Dashboard" - Top section

---

### 1.2 EBITDA ANALYSIS

**Tipo**: Line Chart (Multi-line)
**Libreria**: `<LineChart>` + `<Line>` × 3 (Recharts)
**Dati**: Annual aggregation

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'EBITDA': -1.2, 'Margine Lordo': 0.6, 'OPEX': -1.8 },
  { year: 'Y2', 'EBITDA': -0.5, 'Margine Lordo': 1.3, 'OPEX': -1.8 },
  ...
]
```

**Visualizzazione**:
- **X-Axis**: Years (Y1-Y5)
- **Y-Axis**: Amount (M€)
- **Lines**:
  - Green: EBITDA
  - Blue: Margine Lordo
  - Red (dashed): OPEX (negative values)
- **Reference Line**: Y=0 (break-even)
- **Tooltip**: Show all 3 values

**Insight**:
- Path to profitability
- Margin expansion
- OPEX scaling
- Break-even crossing point

**Posizione**: Tab "Dashboard" - Middle section

---

### 1.3 ARR GROWTH

**Tipo**: Area Chart
**Libreria**: `<AreaChart>` + `<Area>` (Recharts)
**Dati**: Annual aggregation

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'ARR': 0.4 },
  { year: 'Y2', 'ARR': 1.2 },
  { year: 'Y3', 'ARR': 2.8 },
  { year: 'Y4', 'ARR': 5.1 },
  { year: 'Y5', 'ARR': 8.5 }
]
```

**Visualizzazione**:
- **X-Axis**: Years
- **Y-Axis**: ARR (M€)
- **Area**: Gradient fill (purple)
- **Trend line**: Compounding growth
- **Annotations**: Key milestones (€1M, €5M, €10M)

**Insight**:
- ARR trajectory
- Compounding effect
- SaaS momentum

**Posizione**: Tab "Dashboard" - ARR section

---

### 1.4 FUNNEL GTM

**Tipo**: Sankey Diagram / Flow Chart
**Libreria**: Custom component with Recharts
**Dati**: Aggregated conversion funnel

**Struttura**:
```typescript
stages = [
  { stage: 'Leads', value: 10000, conversion: 100% },
  { stage: 'Demo', value: 2000, conversion: 20% },
  { stage: 'Pilot', value: 1000, conversion: 50% },
  { stage: 'Deal', value: 600, conversion: 60% }
]
```

**Visualizzazione**:
- **Flow**: Left to right
- **Width**: Proportional to volume
- **Colors**: Gradient per stage
- **Labels**: 
  - Stage name
  - Absolute numbers
  - Conversion % to next stage
- **Tooltips**: Detailed metrics

**Insight**:
- Conversion bottlenecks
- Funnel efficiency
- Volume at each stage

**Posizione**: Tab "Dashboard" - GTM section

---

### 1.5 CUSTOMER & DEVICE GROWTH

**Tipo**: Dual-axis Line Chart
**Libreria**: `<LineChart>` + `<Line>` × 2
**Dati**: Monthly (60 points)

**Struttura**:
```typescript
data = monthlyData.map(m => ({
  month: m.month,
  'Accounts Active': m.accountsActive,
  'Devices Active': m.devicesActive
}))
```

**Visualizzazione**:
- **X-Axis**: Months (M1-M60)
- **Y-Axis Left**: Accounts
- **Y-Axis Right**: Devices
- **Lines**:
  - Blue: Accounts Active
  - Green: Devices Active
- **Smoothing**: Curve interpolation

**Insight**:
- Customer growth trajectory
- Device deployment rate
- Devices per customer ratio

**Posizione**: Tab "Dashboard" - Growth section

---

### 1.6 BREAK-EVEN MILESTONE

**Tipo**: Timeline / Milestone Chart
**Libreria**: Custom component
**Dati**: Break-even calculations

**Struttura**:
```typescript
milestones = [
  { type: 'EBITDA Break-Even', year: 3, status: 'achieved' },
  { type: 'Cash Break-Even', year: 4, status: 'projected' }
]
```

**Visualizzazione**:
- **Timeline**: Horizontal
- **Markers**: Year indicators
- **Colors**:
  - Green: Achieved
  - Yellow: Projected
  - Red: Not met
- **Annotations**: Key dates

**Posizione**: Tab "Dashboard" - Summary section

---

## 2. ADVANCED METRICS VIEW (5 grafici)

### 2.1 CAC vs LTV COMPARISON

**Tipo**: Grouped Bar Chart
**Libreria**: `<BarChart>` + `<Bar>` × 2
**Dati**: Unit economics summary

**Struttura**:
```typescript
data = [
  { metric: 'Unit Economics', 'CAC': 4500, 'LTV': 85000 }
]
```

**Visualizzazione**:
- **Bars**: Side-by-side
- **Colors**:
  - Red: CAC
  - Green: LTV
- **Ratio Display**: LTV/CAC = 18.9x
- **Benchmark line**: 3:1 minimum
- **Target zone**: > 5:1

**Insight**:
- Economics viability
- Efficiency comparison
- Investment return

**Posizione**: Tab "Advanced"

---

### 2.2 NPV WATERFALL

**Tipo**: Waterfall Chart
**Libreria**: Custom Recharts implementation
**Dati**: NPV components

**Struttura**:
```typescript
data = [
  { label: 'Y1 EBITDA', value: -1.2, type: 'negative' },
  { label: 'Y2 EBITDA', value: -0.5, type: 'negative' },
  { label: 'Y3 EBITDA', value: 0.8, type: 'positive' },
  { label: 'Y4 EBITDA', value: 2.1, type: 'positive' },
  { label: 'Y5 EBITDA', value: 3.5, type: 'positive' },
  { label: 'Terminal Value', value: 10.5, type: 'positive' },
  { label: 'NPV', value: 8.4, type: 'total' }
]
```

**Visualizzazione**:
- **Cascading bars**: Mostra flow
- **Colors**:
  - Red: Negative contributions
  - Green: Positive contributions
  - Blue: Total NPV
- **Connectors**: Show cumulative
- **Discount annotations**: Show WACC

**Posizione**: Tab "Advanced" - Valuation section

---

### 2.3 CASH POSITION OVER TIME

**Tipo**: Area Chart with Reference Line
**Libreria**: `<AreaChart>` + `<Area>` + `<ReferenceLine>`
**Dati**: Monthly cumulative cash (60 points)

**Struttura**:
```typescript
data = monthlyCashFlows.map(m => ({
  month: m.month,
  'Cumulative Cash': m.cumulativeCash
}))
```

**Visualizzazione**:
- **X-Axis**: Months (M1-M60)
- **Y-Axis**: Cash (M€)
- **Area**: Gradient fill
  - Green when positive
  - Red when negative
- **Reference Line**: Y=0
- **Funding events**: Vertical annotations
- **Burn rate**: Slope indicator

**Insight**:
- Cash runway visualization
- Funding needs timing
- Burn pattern
- Break-even point

**Posizione**: Tab "Advanced" - Cash section

---

### 2.4 PAYBACK PERIOD GAUGE

**Tipo**: Gauge Chart / Progress Circle
**Libreria**: Custom SVG component
**Dati**: Payback period metric

**Struttura**:
```typescript
data = {
  paybackPeriod: 6.5,  // months
  target: 12,          // months
  excellent: 6         // months
}
```

**Visualizzazione**:
- **Semi-circle gauge**: 0-24 months
- **Needle**: Current payback
- **Zones**:
  - Green (0-6): Excellent
  - Yellow (6-12): Good
  - Orange (12-18): Acceptable
  - Red (18-24): Poor
- **Label**: X.X months

**Posizione**: Tab "Advanced" - Unit Economics card

---

### 2.5 UNIT ECONOMICS MATRIX

**Tipo**: Table with Embedded Sparklines
**Libreria**: Custom table + Recharts mini-charts
**Dati**: Multi-metric display

**Metrics Displayed**:
- CAC: €4.500 ▼ trend
- LTV: €85.000 ▲ trend
- LTV/CAC: 18.9x ✓
- Payback: 6.5 mo ✓
- ARPU: €11.780/yr ▲
- Churn: 8% ▼
- Lifetime: 150 mo ▲

**Visualizzazione**:
- **Rows**: Each metric
- **Columns**: Value | Trend | Status
- **Sparklines**: 12-month trend
- **Status icons**: ✓ ⚠ ✗

**Posizione**: Tab "Advanced" - Summary table

---

## 3. CASH FLOW VIEW (4 grafici)

### 3.1 OPERATING CASH FLOW

**Tipo**: Bar Chart
**Libreria**: `<BarChart>` + `<Bar>`
**Dati**: Annual cash flow statements

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'Operating CF': -1.5 },
  { year: 'Y2', 'Operating CF': -0.8 },
  { year: 'Y3', 'Operating CF': 0.3 },
  { year: 'Y4', 'Operating CF': 1.8 },
  { year: 'Y5', 'Operating CF': 3.2 }
]
```

**Visualizzazione**:
- **Bars**: Positive green, negative red
- **Reference line**: Y=0
- **Annotations**: Break-even year
- **Tooltip**: CF components breakdown

**Posizione**: Tab "Cash Flow"

---

### 3.2 INVESTING CASH FLOW

**Tipo**: Bar Chart (Negative values)
**Libreria**: `<BarChart>` + `<Bar>`
**Dati**: Annual CapEx and investments

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'CapEx': -0.09, 'Acquisitions': 0 },
  { year: 'Y2', 'CapEx': -0.13, 'Acquisitions': 0 },
  ...
]
```

**Visualizzazione**:
- **Stacked bars**: Negative direction
- **Colors**: Dark blue (CapEx), purple (Acquisitions)
- **% of Revenue**: Secondary label

**Posizione**: Tab "Cash Flow"

---

### 3.3 FINANCING CASH FLOW

**Tipo**: Bar Chart with Event Markers
**Libreria**: `<BarChart>` + `<Bar>`
**Dati**: Funding rounds

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'Equity Raised': 2.0, 'Debt': 0 },
  { year: 'Y2', 'Equity Raised': 3.0, 'Debt': 0 },
  { year: 'Y3', 'Equity Raised': 5.0, 'Debt': 0 },
  ...
]
```

**Visualizzazione**:
- **Bars**: Positive (green)
- **Event labels**: "Seed", "Series A", etc.
- **Cumulative line**: Total funding raised

**Posizione**: Tab "Cash Flow"

---

### 3.4 CUMULATIVE CASH (60 MONTHS)

**Tipo**: Line Chart with Area Fill
**Libreria**: `<AreaChart>` + `<Area>` + markers
**Dati**: Monthly cumulative cash

**Struttura**:
```typescript
data = monthlyCashFlows.map(m => ({
  month: `M${m.month}`,
  cash: m.cumulativeCash,
  funded: m.fundingEvent
}))
```

**Visualizzazione**:
- **Line**: Cumulative cash trajectory
- **Area fill**: Conditional (positive/negative)
- **Markers**: Funding events (stars)
- **Annotations**: Key milestones
- **Burn rate overlay**: Slope indicators

**Insight**:
- Cash runway over time
- Impact of funding rounds
- Burn pattern changes
- Safety margins

**Posizione**: Tab "Cash Flow" - Main chart

---

## 4. GROWTH METRICS VIEW (5 grafici)

### 4.1 CAGR COMPARISON

**Tipo**: Grouped Bar Chart
**Libreria**: `<BarChart>` + `<Bar>` × 3
**Dati**: CAGR calculations

**Struttura**:
```typescript
data = [
  { metric: 'CAGRs', 'Revenue': 125, 'ARR': 180, 'EBITDA': 95 }
]
```

**Visualizzazione**:
- **Bars**: Side-by-side
- **Colors**: Distinct per metric
- **Y-axis**: Percentage
- **Benchmark lines**: 
  - 80% (good)
  - 100% (excellent)
- **Labels**: Percentage values

**Posizione**: Tab "Growth"

---

### 4.2 RULE OF 40 SCATTER

**Tipo**: Scatter Plot
**Libreria**: `<ScatterChart>` + `<Scatter>`
**Dati**: Growth vs margin by year

**Struttura**:
```typescript
data = [
  { year: 'Y1', growth: 250, margin: -60 },
  { year: 'Y2', growth: 180, margin: -25 },
  { year: 'Y3', growth: 120, margin: 10 },
  { year: 'Y4', growth: 85, margin: 28 },
  { year: 'Y5', growth: 65, margin: 35 }
]
```

**Visualizzazione**:
- **X-Axis**: Revenue Growth %
- **Y-Axis**: EBITDA Margin %
- **Diagonal line**: Rule of 40 (x + y = 40)
- **Zones**:
  - Green: Above 40
  - Yellow: 20-40
  - Red: Below 20
- **Points**: Labeled by year

**Insight**:
- Balance growth vs profitability
- Evolution over time
- SaaS efficiency

**Posizione**: Tab "Growth" - Rule of 40 section

---

### 4.3 MRR GROWTH (60 MONTHS)

**Tipo**: Line Chart
**Libreria**: `<LineChart>` + `<Line>`
**Dati**: Monthly MRR growth rates

**Struttura**:
```typescript
data = growthMetrics.mrrGrowthRates.map((rate, idx) => ({
  month: `M${idx + 2}`,
  'MRR Growth %': rate
}))
```

**Visualizzazione**:
- **X-Axis**: Months
- **Y-Axis**: Growth % MoM
- **Line**: Smoothed curve
- **Reference lines**: 
  - 0% (no growth)
  - 5% (target)
- **Trend line**: Moving average

**Insight**:
- Growth momentum
- Stabilization pattern
- Acceleration periods

**Posizione**: Tab "Growth"

---

### 4.4 QOQ GROWTH (20 QUARTERS)

**Tipo**: Bar Chart
**Libreria**: `<BarChart>` + `<Bar>`
**Dati**: Quarterly growth rates

**Struttura**:
```typescript
data = growthMetrics.qoqGrowthRates.map((rate, idx) => ({
  quarter: `Q${idx + 2}`,
  'QoQ Growth %': rate
}))
```

**Visualizzazione**:
- **Bars**: Positive green, negative red
- **Y-axis**: Percentage
- **Target zone**: 10-30% shaded
- **Trend line**: Polynomial fit

**Posizione**: Tab "Growth"

---

### 4.5 GROSS MARGIN TREND

**Tipo**: Line Chart with Area
**Libreria**: `<AreaChart>` + `<Area>`
**Dati**: Gross margin % by year

**Struttura**:
```typescript
data = growthMetrics.grossMarginTrend.map((gm, idx) => ({
  year: `Y${idx + 1}`,
  'Gross Margin %': gm
}))
```

**Visualizzazione**:
- **Line**: GM% evolution
- **Area**: Light fill
- **Target line**: 75% (SaaS standard)
- **Annotations**: Key improvements

**Posizione**: Tab "Growth"

---

## 5. SCENARIO COMPARISON (3 grafici)

### 5.1 REVENUE COMPARISON

**Tipo**: Grouped Bar Chart
**Libreria**: `<BarChart>` + `<Bar>` × scenarios
**Dati**: Multi-scenario annual revenues

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'Prudente': 0.6, 'Base': 0.8, 'Ambizioso': 1.1 },
  { year: 'Y2', 'Prudente': 1.3, 'Base': 1.7, 'Ambizioso': 2.3 },
  ...
]
```

**Visualizzazione**:
- **Bars**: Grouped by year
- **Colors**: Distinct per scenario
- **Legend**: Scenario names
- **Tooltip**: All scenarios + delta

**Posizione**: Tab "Compare"

---

### 5.2 EBITDA COMPARISON

**Tipo**: Line Chart (Multi-line)
**Libreria**: `<LineChart>` + `<Line>` × scenarios
**Dati**: Multi-scenario EBITDA

**Struttura**:
```typescript
data = [
  { year: 'Y1', 'Prudente': -1.5, 'Base': -1.2, 'Ambizioso': -1.0 },
  { year: 'Y2', 'Prudente': -0.8, 'Base': -0.5, 'Ambizioso': -0.2 },
  ...
]
```

**Visualizzazione**:
- **Lines**: One per scenario
- **Reference line**: Y=0
- **Intersection points**: Break-even markers
- **Shaded area**: Confidence band

**Posizione**: Tab "Compare"

---

### 5.3 ARR COMPARISON

**Tipo**: Multi-line Area Chart
**Libreria**: `<AreaChart>` + `<Area>` × scenarios
**Dati**: Multi-scenario ARR

**Visualizzazione**:
- **Stacked areas**: Semi-transparent
- **Lines**: Bold borders
- **Divergence**: Shows range
- **Labels**: End values

**Posizione**: Tab "Compare"

---

## 6. SENSITIVITY ANALYSIS (5 grafici)

### 6.1 TORNADO CHART

**Tipo**: Horizontal Bar Chart
**Libreria**: Custom `<BarChart>` rotated
**Dati**: Parameter impact ranking

**Struttura**:
```typescript
data = [
  { parameter: 'ARPA', lowImpact: -2.5, highImpact: 3.2 },
  { parameter: 'Leads', lowImpact: -2.1, highImpact: 2.8 },
  { parameter: 'L2D', lowImpact: -1.8, highImpact: 2.1 },
  ...
].sort(by total range)
```

**Visualizzazione**:
- **Horizontal bars**: Bidirectional from center
- **Left**: Negative impact (red)
- **Right**: Positive impact (green)
- **Sorted**: By total impact
- **Baseline**: EBITDA Y5 base case

**Insight**:
- Most sensitive parameters
- Asymmetric impacts
- Risk factors

**Posizione**: Tab "Sensitivity"

---

### 6.2 TWO-WAY HEATMAP

**Tipo**: Heatmap
**Libreria**: Custom SVG grid
**Dati**: ARPA × Leads → EBITDA matrix

**Struttura**:
```typescript
data = {
  arpaMultipliers: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3],
  leadMultipliers: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3],
  results: [[ebitda values matrix]]
}
```

**Visualizzazione**:
- **Grid**: 7×7 cells
- **Color scale**: Red (negative) → Yellow (zero) → Green (positive)
- **X-axis**: ARPA multiplier
- **Y-axis**: Lead multiplier
- **Cell values**: EBITDA Y5
- **Crosshairs**: Base case (1.0, 1.0)

**Insight**:
- Combined parameter effects
- Sweet spots
- Risk zones

**Posizione**: Tab "Sensitivity"

---

### 6.3 SPIDER/RADAR CHART

**Tipo**: Radar Chart
**Libreria**: `<RadarChart>` + `<Radar>`
**Dati**: Multi-parameter variation

**Struttura**:
```typescript
data = [
  { parameter: 'ARPA', base: 100, scenario: 120 },
  { parameter: 'Leads', base: 100, scenario: 90 },
  { parameter: 'L2D', base: 100, scenario: 110 },
  ...
]
```

**Visualizzazione**:
- **Axes**: One per parameter (6-8 axes)
- **Polygons**: Base (blue) vs Modified (green)
- **Scales**: Normalized 0-150%
- **Labels**: Parameter names

**Posizione**: Tab "Sensitivity"

---

### 6.4 WATERFALL IMPACT

**Tipo**: Waterfall Chart
**Libreria**: Custom component
**Dati**: Incremental parameter impacts

**Struttura**:
```typescript
data = [
  { label: 'Base EBITDA', value: 3.5, type: 'total' },
  { label: '+ARPA 10%', value: 0.8, type: 'positive' },
  { label: '+Leads 10%', value: 0.6, type: 'positive' },
  { label: '-Churn 2%', value: 0.3, type: 'positive' },
  { label: 'New EBITDA', value: 5.2, type: 'total' }
]
```

**Visualizzazione**:
- **Cascading bars**: Show cumulative effect
- **Colors**: Green (positive), red (negative)
- **Connectors**: Bridge between bars
- **Labels**: Delta values

**Posizione**: Tab "Sensitivity"

---

### 6.5 SCENARIO TREE

**Tipo**: Decision Tree Diagram
**Libreria**: Custom SVG/D3
**Dati**: Multiple scenario paths

**Visualizzazione**:
- **Root**: Base case
- **Branches**: Parameter variations
- **Nodes**: Outcome scenarios
- **Probabilities**: Edge labels
- **Values**: Node labels

**Posizione**: Tab "Sensitivity" - Advanced

---

## 7. MONTE CARLO SIMULATION (3 grafici)

### 7.1 DISTRIBUTION HISTOGRAM

**Tipo**: Histogram
**Libreria**: `<BarChart>` + `<Bar>` (binned data)
**Dati**: EBITDA Y5 distribution from 1000+ runs

**Struttura**:
```typescript
data = [
  { bin: '0-0.5M', frequency: 15 },
  { bin: '0.5-1M', frequency: 45 },
  { bin: '1-1.5M', frequency: 120 },
  ...
]
```

**Visualizzazione**:
- **Bars**: Frequency distribution
- **X-axis**: EBITDA bins
- **Y-axis**: Count
- **Overlay**: Normal curve fit
- **Percentile lines**: P10, P50, P90
- **Mean line**: Average
- **Annotations**: Key statistics

**Insight**:
- Probability distribution
- Outcome range
- Confidence levels

**Posizione**: Tab "Monte Carlo"

---

### 7.2 FAN CHART

**Tipo**: Multi-band Area Chart
**Libreria**: Custom `<AreaChart>` + multiple `<Area>`
**Dati**: P10/P50/P90 projections over time

**Struttura**:
```typescript
data = [
  { year: 'Y1', p10: -2.1, p50: -1.2, p90: -0.5 },
  { year: 'Y2', p10: -1.3, p50: -0.5, p90: 0.3 },
  ...
]
```

**Visualizzazione**:
- **Bands**: 
  - P10-P90: Light blue (80% confidence)
  - P25-P75: Medium blue (50% confidence)
  - P50: Dark blue line (median)
- **Fan shape**: Widening over time
- **Annotations**: Confidence levels

**Insight**:
- Uncertainty over time
- Confidence bands
- Most likely path (P50)

**Posizione**: Tab "Monte Carlo"

---

### 7.3 PERCENTILE ANALYSIS (CDF)

**Tipo**: Line Chart (Cumulative)
**Libreria**: `<LineChart>` + `<Line>`
**Dati**: Cumulative distribution function

**Struttura**:
```typescript
data = sortedResults.map((value, idx) => ({
  ebitda: value,
  percentile: (idx / total) * 100
}))
```

**Visualizzazione**:
- **X-axis**: EBITDA Y5 value
- **Y-axis**: Cumulative probability (0-100%)
- **S-curve**: CDF line
- **Key points**: P10, P25, P50, P75, P90
- **Break-even**: Probability EBITDA > 0

**Insight**:
- Probability of outcomes
- Break-even probability
- Downside/upside ranges

**Posizione**: Tab "Monte Carlo"

---

## 8. CHART SPECIFICATIONS

### 8.1 COMMON FEATURES

All charts include:

- **Responsive**: Auto-resize to container
- **Tooltips**: Hover to show details
- **Legend**: Toggle series visibility
- **Export**: Download as PNG
- **Animations**: Smooth transitions
- **Theme**: Consistent color palette
- **Accessibility**: ARIA labels

### 8.2 COLOR PALETTE

**Primary Colors**:
- Blue: `#3b82f6` (Revenue, Accounts)
- Green: `#10b981` (Profit, Growth)
- Red: `#ef4444` (Costs, Negative)
- Orange: `#f59e0b` (CapEx, Hardware)
- Purple: `#8b5cf6` (ARR, Recurring)

**Semantic Colors**:
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Info: `#3b82f6`
- Neutral: `#6b7280`

### 8.3 TYPOGRAPHY

- **Chart Titles**: 18px, bold
- **Axis Labels**: 12px, medium
- **Tick Labels**: 10px, regular
- **Tooltips**: 12px, medium
- **Legends**: 12px, regular

---

**TOTALE GRAFICI: 23**
**FRAMEWORK: Recharts 2.8**
**EXPORT: PNG/SVG per tutti i grafici**
**INTERATTIVITÀ: Full tooltips, zoom, filter**
