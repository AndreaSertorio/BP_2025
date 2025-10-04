# ANALISI COMPLETA APPLICAZIONE FINANZIARIA ECO 3D

## PANORAMICA GENERALE

L'applicazione è un **dashboard finanziario completo** per la startup Eco 3D che sviluppa dispositivi medici per ecografie 3D. Il sistema calcola proiezioni finanziarie a 5 anni basate su un modello di business SaaS + Hardware.

---

## ARCHITETTURA DELL'APPLICAZIONE

### Struttura dei File Principali
```
src/
├── components/
│   ├── MasterDashboard.tsx      # Dashboard principale
│   ├── ParametersPanel.tsx      # Pannello parametri interattivo
│   ├── KPICard.tsx             # Card per visualizzare KPI
│   ├── ChartCard.tsx           # Card per grafici
│   └── ui/                     # Componenti UI base
├── lib/
│   ├── calculations.ts         # Motore di calcolo principale
│   ├── advancedMetrics.ts      # Metriche avanzate (CAC, LTV, NPV, IRR)
│   └── utils.ts               # Utility per formattazione
├── data/
│   └── scenarios.ts           # Scenari predefiniti e configurazioni
└── types/
    └── financial.ts           # Definizioni TypeScript
```

---

## MODELLO DI BUSINESS E VARIABILI CORE

### Funnel di Vendita
Il modello si basa su un **funnel di conversione** a 4 stadi:

1. **Leads** → **Demo** (conversione: `l2d`)
2. **Demo** → **Pilot** (conversione: `d2p`) 
3. **Pilot** → **Deal** (conversione: `p2deal`)
4. **Deal** → **Dispositivi venduti** (moltiplicatore: `devicesPerDeal`)

### Modello di Ricavi Ibrido
**Ricavi Ricorrenti (SaaS)**:
- ARPA (Annual Revenue Per Account): €14.600 base
- Fatturazione mensile: `ARPA / 12`
- Churn annuale: 8% base

**Ricavi CapEx (Hardware)**:
- Prezzo dispositivo: €26.000 base
- Quota riconosciuta come CapEx: 30% base
- Ricavo CapEx per dispositivo: `devicePrice × capexShare`

---

## FORMULE E CALCOLI PRINCIPALI

### 1. CALCOLI MENSILI (60 mesi)

#### Generazione Leads
```javascript
// Primi 8 trimestri: valori fissi da array base
leads = (base.leadsPerQuarterQ1toQ8[quarter-1] / 3) × leadMult

// Dopo Q8: crescita composta
growthFactor = (1 + growthQoqPostQ8)^(quarter-8)
leads = (baseQ8Leads × growthFactor / 3) × leadMult
```

#### Conversioni Funnel
```javascript
deals = leads × l2d × d2p × p2deal
devicesShipped = deals × devicesPerDeal
```

#### Account Attivi (con Churn)
```javascript
churnMonthly = 1 - (1 - churnAnnual)^(1/12)
accountsActive = accountsActive × (1 - churnMonthly) + deals
```

#### Ricavi Mensili
```javascript
// Ricavi ricorrenti (M€)
recurringRev = (accountsActive × (arpa / 12)) / 1e6

// Ricavi CapEx (M€)  
capexRev = (devicesShipped × capexShare × devicePrice) / 1e6

totalRev = recurringRev + capexRev
```

#### COGS (Cost of Goods Sold)
```javascript
// COGS ricorrenti
cogsRecurring = (1 - gmRecurring) × recurringRev

// COGS hardware (varia per anno)
cogsHardware = (devicesShipped × cogsHw[year] × capexShare) / 1e6

cogs = cogsRecurring + cogsHardware
```

#### Margine Lordo
```javascript
grossMargin = totalRev - cogs
```

### 2. CALCOLI ANNUALI

#### Aggregazione da Dati Mensili
```javascript
// Somma 12 mesi per ogni anno
recurringRev = sum(monthlyData[yearStart:yearEnd].recurringRev)
capexRev = sum(monthlyData[yearStart:yearEnd].capexRev)
totalRev = recurringRev + capexRev
cogs = sum(monthlyData[yearStart:yearEnd].cogs)
grossMargin = totalRev - cogs
```

#### EBITDA
```javascript
grossMarginPercent = (grossMargin / totalRev) × 100
ebitda = grossMargin - opex[year]
```

#### ARR (Annual Recurring Revenue)
```javascript
// Account attivi a fine anno × ARPA
endOfYearAccounts = monthlyData[month12/24/36/48/60].accountsActive
arr = (endOfYearAccounts × arpa) / 1e6
```

### 3. KPI PRINCIPALI

#### ARR Run-Rates
```javascript
arrRunRateM24 = (monthlyData[23].accountsActive × arpa) / 1e6  // Mese 24
arrRunRateM60 = (monthlyData[59].accountsActive × arpa) / 1e6  // Mese 60
```

#### Break-Even
```javascript
// Primo anno con EBITDA >= 0
breakEvenYear = annualData.find(a => a.ebitda >= 0)?.year || null
```

#### SOM (Share of Market)
```javascript
// Scansioni totali anno 5 vs mercato SAM
totalScansY5 = sum(monthlyData[48:60].devicesActive × 640 × 12)
somPercent = (totalScansY5 / 31.9e6) × 100  // SAM = 31.9M scansioni
```

#### Margine Lordo Medio
```javascript
grossMarginPercent = average(annualData[1:5].grossMarginPercent)
```

---

## METRICHE AVANZATE

### Break-Even Analysis
```javascript
// Costi fissi medi
avgOpex = average(opex[1:5])

// Prezzo per unità (device + software annuale)
pricePerUnit = devicePrice × capexShare + arpa

// Costo variabile per unità
avgCogsHw = average(cogsHw[1:5])
variableCostPerUnit = avgCogsHw × capexShare + (1 - gmRecurring) × arpa

// Margine di contribuzione
contributionMargin = pricePerUnit - variableCostPerUnit

// Unità break-even
breakEvenUnits = (avgOpex × 1e6) / contributionMargin
```

### Unit Economics
```javascript
// CAC (Customer Acquisition Cost)
totalMarketingCosts = sum(opex[1:5] × 0.3)  // 30% di OPEX
totalNewCustomers = sum(monthlyData.deals)
cac = (totalMarketingCosts × 1e6) / totalNewCustomers

// LTV (Lifetime Value)
averageLifetime = 12 / churnAnnual  // mesi
ltv = arpa × (averageLifetime / 12)

// Ratio LTV/CAC
ltvCacRatio = ltv / cac

// Payback Period
monthlyRevPerCustomer = arpa / 12
paybackPeriod = cac / monthlyRevPerCustomer  // mesi
```

### Cash Flow Metrics
```javascript
// Burn Rate (media primi 2 anni)
year1Burn = annualData[0].ebitda < 0 ? -annualData[0].ebitda / 12 : 0
year2Burn = annualData[1].ebitda < 0 ? -annualData[1].ebitda / 12 : 0
burnRate = (year1Burn + year2Burn) / 2

// Runway
runway = currentCash / burnRate  // mesi
```

### Valutazione (NPV & IRR)
```javascript
// NPV con discount rate 12%
npv = sum(annualData.ebitda / (1 + 0.12)^year) + terminalValue / (1 + 0.12)^5
terminalValue = annualData[4].ebitda × 5  // 5x EBITDA multiple

// IRR calcolato con Newton-Raphson
cashFlows = [-2, ...annualData.ebitda]  // -2M€ investimento iniziale
cashFlows[5] += terminalValue
```

---

## SCENARI E PARAMETRI

### Scenari Predefiniti
1. **Prudente**: Conversioni più basse, crescita conservativa
2. **Base**: Valori realistici di riferimento  
3. **Ambizioso**: Conversioni ottimistiche, crescita accelerata
4. **Custom**: Modificabile dall'utente

### Parametri Chiave e Range
| Parametro | Min | Max | Base | Impatto |
|-----------|-----|-----|------|---------|
| `leadMult` | 0.5x | 2.0x | 1.0x | Moltiplicatore leads |
| `l2d` | 10% | 40% | 20% | Conversione Lead→Demo |
| `d2p` | 30% | 70% | 50% | Conversione Demo→Pilot |
| `p2deal` | 40% | 80% | 60% | Conversione Pilot→Deal |
| `arpa` | €8K | €25K | €14.6K | Ricavo annuo per cliente |
| `churnAnnual` | 2% | 20% | 8% | Perdita clienti annua |
| `capexShare` | 15% | 50% | 30% | % prezzo come CapEx |
| `gmRecurring` | 60% | 90% | 80% | Margine software |

---

## DASHBOARD E VISUALIZZAZIONI

### KPI Cards
- **Revenue Y1/Y5**: Ricavi totali anni 1 e 5
- **EBITDA Y1/Y5**: Profittabilità operativa
- **ARR Y5**: Ricavi ricorrenti annuali
- **Gross Margin %**: Margine lordo medio
- **Break-even**: Anno di pareggio
- **SOM %**: Quota di mercato

### Grafici Principali
1. **Revenue Evolution**: Ricavi ricorrenti vs CapEx nel tempo
2. **Profitability**: EBITDA e margini per anno
3. **Customer Metrics**: Account attivi e churn
4. **Unit Economics**: CAC, LTV, ratios

### Analisi Avanzate
- **Sensitivity Analysis**: Impatto variazione parametri
- **Tornado Chart**: Ranking sensibilità parametri
- **Monte Carlo**: Simulazione probabilistica
- **Two-Way Analysis**: Heatmap ARPA vs Lead Multiplier

---

## LOGICA TREND E CONFRONTI

### Scenario Base
- Nessun trend mostrato (confronto con se stesso = 0)
- Solo valori KPI puliti

### Altri Scenari
- **Trend vs Base**: Differenza percentuale rispetto scenario base
- **Indicatori visivi**: Verde (positivo), Rosso (negativo), Grigio (neutro)

### Formule Trend
```javascript
// Trend percentuale
trendValue = ((currentScenario.kpi - baseScenario.kpi) / baseScenario.kpi) × 100

// Trend assoluto (per margini)
trendValue = currentScenario.kpi - baseScenario.kpi

// Trend inverso (per break-even - minore è meglio)
trendValue = baseScenario.breakEven - currentScenario.breakEven
isPositive = currentScenario.breakEven < baseScenario.breakEven
```

---

## DIPENDENZE E INTERCONNESSIONI

### Flusso Principale
```
Leads → Deals → Account Attivi → Ricavi Ricorrenti
  ↓         ↓         ↓              ↓
Demo → Dispositivi → Ricavi CapEx → Ricavi Totali
  ↓         ↓         ↓              ↓
Pilot → COGS HW → Margine Lordo → EBITDA
```

### Variabili Interdipendenti
- **Account Attivi**: Influenzati da nuovi deal e churn
- **Ricavi**: Dipendono da account attivi (ricorrenti) e dispositivi (CapEx)
- **COGS**: Varia per componente ricorrente e hardware
- **EBITDA**: Margine lordo meno OPEX fissi
- **Break-Even**: Primo anno con EBITDA positivo
- **ARR**: Account attivi × ARPA
- **SOM**: Dispositivi attivi × utilizzo vs mercato totale

---

## POSSIBILI INCONGRUENZE IDENTIFICATE

### 1. Calcolo SOM
- **Problema**: Formula semplificata, assume 640 scansioni/dispositivo/mese
- **Impatto**: Potrebbe sovrastimare la quota di mercato
- **Soluzione**: Validare con dati reali di utilizzo

### 2. COGS Hardware
- **Problema**: COGS varia per anno ma applicato solo su capexShare
- **Impatto**: Potrebbe sottostimare i costi reali
- **Soluzione**: Rivedere se COGS dovrebbe applicarsi al prezzo totale

### 3. Churn Implementation
- **Problema**: Churn applicato mensilmente ma potrebbe non riflettere pattern reali
- **Impatto**: Crescita account attivi potrebbe essere irrealistica
- **Soluzione**: Validare con dati di retention reali

### 4. Marketing Costs in CAC
- **Problema**: Assume 30% di OPEX come marketing
- **Impatto**: CAC potrebbe essere impreciso
- **Soluzione**: Separare costi marketing da OPEX generale

### 5. Terminal Value
- **Problema**: Multiple 5x EBITDA potrebbe essere alto per startup early-stage
- **Impatto**: NPV e IRR potrebbero essere sovrastimati
- **Soluzione**: Usare multiple più conservativi (2-3x)

---

## RACCOMANDAZIONI PER MIGLIORAMENTI

### Priorità Alta
1. **Validare assunzioni SOM** con dati mercato reali
2. **Separare costi marketing** per CAC più accurato
3. **Rivedere terminal value** con multiple più realistici

### Priorità Media
4. **Aggiungere cash flow statement** completo
5. **Implementare scenario stress testing**
6. **Aggiungere metriche di crescita** (CAGR, Rule of 40)

### Priorità Bassa
7. **Ottimizzare performance** per scenari complessi
8. **Aggiungere export dati** in Excel/CSV
9. **Implementare confronti** multi-scenario

---

## CONCLUSIONI

L'applicazione rappresenta un **modello finanziario robusto e completo** per una startup medtech con modello SaaS+Hardware. Le formule sono matematicamente corrette e interconnesse logicamente. Le principali aree di miglioramento riguardano la **validazione delle assunzioni** piuttosto che errori di calcolo.

Il sistema fornisce insights preziosi per:
- **Pianificazione strategica**: Scenari e sensibilità
- **Fundraising**: Proiezioni e valutazioni
- **Gestione operativa**: KPI e metriche di performance
- **Analisi di rischio**: Monte Carlo e stress testing
