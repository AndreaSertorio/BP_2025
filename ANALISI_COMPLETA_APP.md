# 📊 ANALISI COMPLETA FINANCIAL DASHBOARD ECO 3D

## 🎯 **OBIETTIVO DOCUMENTO**
Mappare e comprendere tutti i parametri, formule e flussi di calcolo dell'applicazione per garantire coerenza e correttezza.

---

## 🏗️ **ARCHITETTURA DEI DATI**

### **1. FLUSSO PRINCIPALE DEI CALCOLI**
```
TAM/SAM (Mercato)
    ↓
Leads (Potenziali clienti)
    ↓
Funnel GTM (Conversioni)
    ↓
Deals (Contratti chiusi)
    ↓
Dispositivi Attivi
    ↓
Ricavi (CapEx + Subscription)
    ↓
COGS & Margini
    ↓
OPEX
    ↓
EBITDA & Cash Flow
```

---

## 📊 **PARAMETRI DELL'APPLICAZIONE**

### **🔴 PARAMETRI PRIMARI (Mercato)**
Questi sono i veri input fondamentali del business:

| Parametro | Descrizione | Dove si trova | Formula/Uso |
|-----------|-------------|---------------|------------|
| **TAM** | Total Addressable Market (K esami/anno) | Market Config | Volume totale mercato |
| **SAM** | Serviceable Addressable Market | Market Config | TAM × 50% (default) |
| **Prezzo per Esame** | €/esame per settore | Market Config | €60-90 base |
| **Capitale Iniziale** | Funding iniziale (M€) | Assumptions | €2M default |

### **🟡 PARAMETRI SECONDARI (GTM & Operations)**
Parametri che guidano le conversioni e operations:

| Parametro | Descrizione | Default | Formula |
|-----------|-------------|---------|---------|
| **leadMult** | Moltiplicatore leads | 1.0 | Scala i leads base |
| **l2d** | Lead → Deal conversion | 25% | % leads che diventano deal |
| **d2p** | Deal → Proposal | 40% | % deal con proposta |
| **p2d** | Proposal → Deal closed | 50% | % proposte chiuse |
| **dealMult** | Dispositivi per deal | 1.5 | Media dispositivi venduti |
| **mixCapEx** | % vendite CapEx vs Sub | 30% | Split modello business |

### **🟢 PARAMETRI FINANZIARI**
Parametri per calcoli finanziari:

| Parametro | Descrizione | Default | Perché importante |
|-----------|-------------|---------|-------------------|
| **arpaSub** | Ricavo annuo subscription | €14,400 | Revenue recurring |
| **arpaMaint** | Ricavo annuo manutenzione | €2,400 | Revenue da CapEx |
| **devicePrice** | Prezzo dispositivo CapEx | €50,000 | One-time revenue |
| **gmRecurring** | Margine lordo recurring | 90% | Profittabilità SaaS |
| **cogsHw** | Costo hardware | €11-13k | Costo produzione |

### **⚫ PARAMETRI DA RIMUOVERE/SPOSTARE**
Questi confondono e vanno gestiti diversamente:

| Parametro | Problema | Soluzione |
|-----------|----------|-----------|
| **discountRate** | Non chiaro l'uso | Spostare in Financial Settings |
| **capexAsPercentRevenue** | Confonde con devicePrice | Rimuovere o chiarire |
| **depreciationRate** | Accounting detail | Spostare in Advanced |
| **daysReceivable/Payable** | Working capital details | Spostare in Advanced |
| **accruedExpensesAsPercentOpex** | Troppo dettagliato | Default nascosto |

---

## 🔍 **CATENA DI CALCOLO PRINCIPALE**

### **1. DA MERCATO A LEADS**
```
TAM (K esami) → Non usato direttamente nei calcoli (!)
SAM (K esami) → Non usato direttamente nei calcoli (!)

PROBLEMA: TAM/SAM non influenzano i leads!

Leads = leadsPerQuarterQ1toQ8[quarter] × leadMult
```
❌ **BUG CRITICO**: I leads sono hardcoded, non dipendono da TAM/SAM!

### **2. DA LEADS A DEALS**
```
Deals = Leads × l2d × d2p × p2d

Esempio:
100 leads × 0.25 × 0.40 × 0.50 = 5 deals
```
✅ Questa parte funziona

### **3. DA DEALS A DISPOSITIVI**
```
DealsCapEx = Deals × mixCapEx
DealsSub = Deals × (1 - mixCapEx)

DevicesShipped = Deals × dealMult
DevicesActive = DevicesActive(t-1) × (1 - hwChurn) + DevicesShipped
```
✅ Questa parte funziona

### **4. DA DISPOSITIVI A RICAVI**
```
RecurringRevenue = AccountsSub × (arpaSub/12) + AccountsCapEx × (arpaMaint/12)
CapExRevenue = DevicesCapEx × devicePrice
TotalRevenue = RecurringRevenue + CapExRevenue
```
✅ Questa parte funziona

### **5. MARGINI E COSTI**
```
COGS_Recurring = (1 - gmRecurring) × RecurringRevenue
COGS_Hardware = DevicesCapEx × cogsHw
GrossMargin = TotalRevenue - COGS

OPEX = opexMonthly[year][month]
EBITDA = GrossMargin - OPEX
```
✅ Questa parte funziona

---

## 🐛 **PROBLEMI IDENTIFICATI**

### **🔴 PROBLEMA CRITICO #1: TAM/SAM NON COLLEGATI**
- **Problema**: TAM e SAM non influenzano i calcoli dei leads
- **Impatto**: Cambiare TAM/SAM non cambia i risultati finanziari
- **Soluzione**: 
  ```typescript
  // CURRENT (WRONG)
  leads = leadsPerQuarterQ1toQ8[quarter] × leadMult
  
  // PROPOSED (CORRECT)
  marketPenetration = 0.001 // 0.1% del SAM genera leads
  monthlyLeadsPotential = (SAM × marketPenetration) / 12
  leads = monthlyLeadsPotential × leadMult × seasonalFactor[quarter]
  ```

### **🟡 PROBLEMA MEDIO #2: PREZZO ESAME NON USATO**
- **Problema**: Il prezzo per esame (€60-90) non è collegato a devicePrice o arpaSub
- **Impatto**: Non c'è coerenza tra prezzo esame e ricavi
- **Soluzione**:
  ```typescript
  // Collegare prezzo esame ai ricavi
  scansPerMonth = 80 // per dispositivo
  pricePerExam = €75
  arpaSubMonthly = scansPerMonth × pricePerExam = €6,000/mese
  arpaSub = €72,000/anno (invece di €14,400 hardcoded)
  ```

### **🟡 PROBLEMA MEDIO #3: PARAMETRI CONFUSI**
- **Problema**: Troppi parametri finanziari avanzati nelle assumptions base
- **Soluzione**: Riorganizzare in 3 livelli:
  1. **Base**: TAM, SAM, Prezzo, Capitale
  2. **GTM**: Funnel conversioni, mix business
  3. **Advanced**: Working capital, depreciation, etc.

---

## 📋 **PIANO D'AZIONE**

### **FASE 1: COLLEGARE TAM/SAM AI CALCOLI**
1. ✅ Creare formula che lega SAM → Leads mensili
2. ✅ Aggiungere parametro "Market Penetration Rate"
3. ✅ Testare che modifiche TAM/SAM cambino i risultati

### **FASE 2: COLLEGARE PREZZO ESAME**
1. ✅ Calcolare ARPA da prezzo × volume scansioni
2. ✅ Rimuovere ARPA hardcoded
3. ✅ Aggiungere "Scansioni/mese per dispositivo"

### **FASE 3: RIORGANIZZARE UI**
1. ✅ Tab "Market" → TAM, SAM, Prezzi
2. ✅ Tab "GTM" → Funnel, conversioni
3. ✅ Tab "Financials" → OPEX, margini
4. ✅ Tab "Advanced" → Working capital, depreciation

### **FASE 4: VALIDAZIONE**
1. ✅ Creare test cases con numeri noti
2. ✅ Verificare ogni formula
3. ✅ Documentare ogni calcolo

---

## 📈 **FORMULE CORRETTE PROPOSTE**

### **Formula Master Revenue**
```
// Input mercato
TAM_esami = 15,000,000 (tiroide)
SAM_esami = 7,500,000
Prezzo_esame = €75

// Penetrazione mercato (crescente)
MarketPenetration_Y1 = 0.001 (0.1% del SAM)
MarketPenetration_Y5 = 0.010 (1.0% del SAM)

// Leads mensili
Leads_mensili = (SAM × MarketPenetration) / 12

// Conversioni
Deals = Leads × ConversionRate (l2d × d2p × p2d)
Devices = Deals × DevicesPerDeal

// Ricavi da scansioni
Scansioni_mensili = Devices_attivi × 80
Revenue_scansioni = Scansioni_mensili × Prezzo_esame

// Check coerenza
SOM_target = SAM × 0.03 (3% in 5 anni)
Revenue_target_Y5 = SOM_target × Prezzo_esame
```

---

## ✅ **NEXT STEPS IMMEDIATI**

1. **Implementare collegamento TAM/SAM → Leads**
2. **Collegare prezzo esame → ARPA**
3. **Riorganizzare parametri in UI**
4. **Testare con numeri reali da mercati.md**
5. **Validare ogni calcolo step-by-step**

---

## 📝 **NOTE PER SVILUPPO**

- Ogni modifica deve essere retrocompatibile
- Aggiungere console.log per debug calcoli
- Creare unit test per formule critiche
- Documentare assumptions in-code
- Permettere override manuale se necessario
