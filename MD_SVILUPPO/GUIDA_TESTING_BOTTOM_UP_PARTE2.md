# 🧪 GUIDA TESTING BOTTOM-UP & RICONCILIAZIONE - PARTE 2

**Data**: 13 Ottobre 2025  
**Parte**: 2/3 - Procedura Testing Dettagliata

---

## 📋 INDICE TEST

1. [TEST 1: Sales Capacity (Reps per Anno)](#test-1-sales-capacity)
2. [TEST 2: Conversion Funnel](#test-2-conversion-funnel)
3. [TEST 3: Simulatore Impatto Business](#test-3-simulatore-impatto-business)
4. [TEST 4: Channel Mix](#test-4-channel-mix)
5. [TEST 5: Adoption Curve](#test-5-adoption-curve)
6. [TEST 6: Scenarios](#test-6-scenarios)
7. [TEST 7: Badge KPI e Warning](#test-7-badge-kpi-e-warning)

---

## TEST 1: SALES CAPACITY (REPS PER ANNO)

### **🎯 Obiettivo**
Verificare che il numero di sales reps per anno si salvi correttamente e influenzi i calcoli

### **📍 Dove**
Bottom-Up → GTMEngineCard → Sezione "Capacità Commerciale"

### **🔧 Setup**
Nessun setup richiesto - usa valori default

### **📝 Procedura**

#### **STEP 1: Visualizzazione Iniziale**
1. Vai in Bottom-Up
2. Trova sezione "Capacità Commerciale"
3. Vedi 5 badge: Anno 1, Anno 2, Anno 3, Anno 4, Anno 5
4. **Verifica**: Ogni badge mostra un numero (es: "1 rep", "2 reps")

#### **STEP 2: Modifica Anno 1**
1. Click su badge "Anno 1"
2. Badge diventa editabile (input appare)
3. Modifica valore a **1**
4. Click su checkmark verde ✅
5. Badge torna in modalità visualizzazione
6. **Verifica**: Badge mostra "1 rep"

#### **STEP 3: Modifica Altri Anni**
Ripeti per tutti gli anni:
```
Anno 1: 1 rep
Anno 2: 2 reps
Anno 3: 3 reps
Anno 4: 4 reps
Anno 5: 6 reps
```

#### **STEP 4: Verifica Database**
1. Apri: `/src/data/database.json`
2. Cerca: `"goToMarket"` → `"salesCapacity"` → `"repsByYear"`
3. **Verifica Valori**:
```json
"repsByYear": {
  "y1": 1,
  "y2": 2,
  "y3": 3,
  "y4": 4,
  "y5": 6
}
```

#### **STEP 5: Verifica Console**
1. Apri Browser DevTools (F12)
2. Tab Console
3. **Verifica**: Nessun errore rosso
4. Dovresti vedere log tipo: `✅ Sales reps per anno aggiornati`

### **✅ Criteri Successo**
- [ ] Badge mostrano numeri corretti
- [ ] Click edit funziona
- [ ] Salvataggio conferma con checkmark
- [ ] Database.json aggiornato
- [ ] Nessun errore in console

### **❌ Se Fallisce**
- Badge non salva → Check API `/api/database/go-to-market` in Network tab
- Numeri scompaiono → Check fallback in GTMEngineCard.tsx line 230
- Errore console → Copy errore e cerca in codice

---

## TEST 2: CONVERSION FUNNEL

### **🎯 Obiettivo**
Verificare che i tassi di conversione si salvino e calcolino la funnel efficiency

### **📍 Dove**
Bottom-Up → GTMEngineCard → Sezione "Conversion Funnel"

### **📝 Procedura**

#### **STEP 1: Visualizzazione Iniziale**
1. Trova sezione "Conversion Funnel"
2. Vedi 3 slider:
   - Lead-to-Demo
   - Demo-to-Pilot
   - Pilot-to-Deal
3. Vedi card "Pipeline Efficiency Overall"

#### **STEP 2: Test Lead-to-Demo**
1. Muovi slider "Lead-to-Demo" a **10%** (0.1)
2. **Verifica**: Label sotto mostra "10%"
3. Aspetta 500ms (auto-save debounced)
4. **Verifica Console**: Log `Funnel aggiornato`

#### **STEP 3: Test Demo-to-Pilot**
1. Muovi slider "Demo-to-Pilot" a **50%** (0.5)
2. **Verifica**: Label mostra "50%"

#### **STEP 4: Test Pilot-to-Deal**
1. Muovi slider "Pilot-to-Deal" a **60%** (0.6)
2. **Verifica**: Label mostra "60%"

#### **STEP 5: Verifica Calcolo Efficiency**
**Calcolo Manuale**:
```
Efficiency = L2D × D2P × P2D
           = 0.1 × 0.5 × 0.6
           = 0.03 (3%)
```

**Verifica UI**:
1. Card "Pipeline Efficiency Overall" mostra: **3%**
2. Esempio mostra: "100 lead → 3 deal"

#### **STEP 6: Verifica Database**
```json
"conversionFunnel": {
  "leadToDemo": 0.1,
  "demoToPilot": 0.5,
  "pilotToDeal": 0.6
}
```

### **✅ Criteri Successo**
- [ ] Slider si muovono smooth
- [ ] Label % aggiornate correttamente
- [ ] Efficiency calcolata: 3%
- [ ] Esempio "100 → 3" corretto
- [ ] Database aggiornato

### **🧮 Calcoli da Verificare**

| L2D | D2P | P2D | Efficiency | Esempio |
|-----|-----|-----|------------|---------|
| 10% | 50% | 60% | 3% | 100→3 |
| 20% | 50% | 60% | 6% | 100→6 |
| 10% | 80% | 80% | 6.4% | 100→6.4 |

Prova diversi valori e verifica che:
```
Efficiency UI = (L2D/100) × (D2P/100) × (P2D/100) × 100
```

---

## TEST 3: SIMULATORE IMPATTO BUSINESS

### **🎯 Obiettivo**
Verificare che il simulatore calcoli correttamente proiezioni marketing per un anno

### **📍 Dove**
Bottom-Up → GTMEngineCard → Sezione "Simulatore Impatto Business"

### **🔧 Setup Richiesto**
Prima di questo test, assicurati di aver completato:
- ✅ TEST 1: Sales Reps configurati
- ✅ TEST 2: Funnel configurato

### **📊 Valori Test Standard**
```
Anno da testare: Anno 1

INPUT:
- Sales Reps Y1: 1
- Deals/Rep/Quarter: 5
- Ramp-up Quarters: 1
- Lead-to-Demo: 10% (0.1)
- Demo-to-Pilot: 50% (0.5)
- Pilot-to-Deal: 60% (0.6)
- Cost per Lead: €55
- Device Price: €50,000
```

### **📝 Procedura**

#### **STEP 1: Seleziona Anno**
1. Click su badge "Anno 1" nella sezione Simulatore
2. **Verifica**: Badge Anno 1 diventa attivo (background colorato)

#### **STEP 2: Verifica Input Visibili**
Card mostra:
- Cost per Lead: €55 (editabile)
- Deals per Rep (Override): vuoto (opzionale)

#### **STEP 3: Click "Calcola Proiezioni"**
1. Click sul pulsante "Calcola Proiezioni Anno 1"
2. Aspetta calcolo (< 1 secondo)
3. Card si espande e mostra risultati

#### **STEP 4: Calcoli Manuali Attesi**

**A. Ramp Factor**:
```
rampUpQuarters = 1
rampFactor = (4 - 1) / 4 = 0.75
```

**B. Capacity Annua**:
```
capacity = reps × deals/Q × 4 × rampFactor
         = 1 × 5 × 4 × 0.75
         = 15 devices
```

**C. Funnel Efficiency**:
```
efficiency = 0.1 × 0.5 × 0.6 = 0.03 (3%)
```

**D. Leads Needed**:
```
leadsNeeded = capacity / efficiency
            = 15 / 0.03
            = 500 leads/anno
```

**E. Leads Mensili**:
```
leadsMonthly = 500 / 12 = 41.67 ≈ 42 leads/mese
```

**F. Budget Marketing Annuo**:
```
budgetMarketing = leadsNeeded × costPerLead
                = 500 × 55
                = €27,500
```

**G. Budget Mensile**:
```
budgetMonthly = 27,500 / 12 = €2,292
```

**H. CAC Effettivo**:
```
cacEffettivo = budgetMarketing / capacity
             = 27,500 / 15
             = €1,833 per device
```

**I. Expected Revenue**:
```
expectedRevenue = capacity × devicePrice
                = 15 × 50,000
                = €750,000
```

**J. Marketing % su Revenue**:
```
marketingPct = (budgetMarketing / expectedRevenue) × 100
             = (27,500 / 750,000) × 100
             = 3.67%
```

**K. Produttività Rep**:
```
productivityRepYear = capacity / reps
                    = 15 / 1
                    = 15 devices/rep/anno
```

#### **STEP 5: Verifica Risultati UI**

Card "Proiezioni Anno 1" deve mostrare:

```
┌─────────────────────────────────────────────┐
│ 📊 Proiezioni Anno 1                        │
├─────────────────────────────────────────────┤
│ Capacity Commerciale: 15 devices           │
│ Leads Necessari: 500 (42/mese)             │
│ Budget Marketing: €27,500 (€2,292/mese)    │
│ CAC Effettivo: €1,833                       │
│ Expected Revenue: €750,000                  │
│ Marketing % su Revenue: 3.67%               │
│ Produttività Rep: 15 devices/anno          │
└─────────────────────────────────────────────┘
```

**TOLLERANZA**: ±2% per arrotondamenti

#### **STEP 6: Verifica Database**
```json
"marketingPlan": {
  "projections": {
    "y1": {
      "costPerLead": 55,
      "dealsPerRepOverride": null,
      "calculated": {
        "reps": 1,
        "rampFactor": 0.75,
        "capacity": 15,
        "funnelEfficiency": 0.03,
        "leadsNeeded": 500,
        "leadsMonthly": 42,
        "budgetMarketing": 27500,
        "budgetMonthly": 2292,
        "cacEffettivo": 1833,
        "expectedRevenue": 750000,
        "marketingPercentage": 3.67,
        "productivityRepYear": 15
      }
    }
  }
}
```

### **✅ Criteri Successo**
- [ ] Capacity = 15 devices
- [ ] Leads = 500 (42/mese)
- [ ] Budget = €27,500 (±€100)
- [ ] CAC = €1,833 (±€50)
- [ ] Revenue = €750K
- [ ] Marketing % = 3.67% (±0.1%)
- [ ] Produttività = 15 devices/rep

### **🧮 Test Aggiuntivi**

#### **TEST 3.1: Anno 2 con 2 Reps**
```
INPUT:
- Reps Y2: 2
- Deals/Q: 5
- Ramp: 1
- Funnel: stesso (3%)
- Cost/Lead: €50

ATTESO:
- Capacity: 2 × 5 × 4 × 0.75 = 30 devices
- Leads: 30 / 0.03 = 1,000
- Budget: 1,000 × 50 = €50,000
- CAC: 50,000 / 30 = €1,667
```

#### **TEST 3.2: Override Deals**
1. Inserisci "Override Deals/Rep": 8 (invece di 5)
2. Calcola
3. **Atteso**: Capacity usa 8 invece di 5
   - Capacity = 1 × 8 × 4 × 0.75 = 24 devices

### **❌ Troubleshooting**

| Problema | Causa Probabile | Fix |
|----------|-----------------|-----|
| Capacity errata | Reps non salvati | Torna a TEST 1 |
| Leads troppi/pochi | Funnel errato | Verifica efficiency = L2D×D2P×P2D |
| Budget errato | Cost/Lead sbagliato | Check input field |
| CAC strano | Divisione per 0 | Capacity deve essere > 0 |
| Nessun risultato | API fallita | Check console, server running? |

---

## TEST 4: CHANNEL MIX

### **🎯 Obiettivo**
Verificare configurazione canali vendita e calcolo channel efficiency

### **📍 Dove**
Bottom-Up → GTMConfigurationPanel → Sezione "Channel Mix"

### **📝 Procedura**

#### **STEP 1: Trova Sezione**
1. Scroll down dopo GTMEngineCard
2. Trova titolo "Configurazione Avanzata GTM"
3. Prima card: "Channel Mix"

#### **STEP 2: Valori Test**
Imposta:
```
Vendite Dirette: 60% (0.6)
Tramite Distributori: 40% (0.4)
Margine Distributori: 20% (0.2)
```

**Metodo**:
- Input "Direct" → Scrivi 0.6
- Verifica: "Distributors" si aggiorna automaticamente a 0.4
- Input "Margin" → Scrivi 0.2

#### **STEP 3: Verifica KPI Live**
Card mostra KPI "Channel Efficiency":
```
Calcolo Manuale:
channelEfficiency = 1 - (distributors × margin)
                  = 1 - (0.4 × 0.2)
                  = 1 - 0.08
                  = 0.92 (92%)
```

**Verifica UI**: Mostra "92.0%"

#### **STEP 4: Click "Salva Channel Mix"**
1. Click pulsante
2. **Verifica**: Messaggio success o toast notification

#### **STEP 5: Verifica Badge Header**
1. Scroll up a GTMEngineCard header
2. Badge "Channel Efficiency: 92.0%" aggiornato
3. Badge BLU (non rosso) perché 92% ≥ 85%

#### **STEP 6: Test Warning**
1. Torna a Channel Mix
2. Imposta:
   ```
   Distributors: 70% (0.7)
   Margin: 30% (0.3)
   ```
3. **Calcolo**: 1 - (0.7 × 0.3) = 0.79 (79%)
4. **Verifica UI**: Mostra "79.0%"
5. Salva
6. **Verifica Badge**: Diventa ROSSO con ⚠️ perché < 85%
7. Tooltip: "⚠️ Troppo margine ai distributori"

#### **STEP 7: Verifica Database**
```json
"channelMix": {
  "direct": 0.6,
  "distributors": 0.4,
  "distributorMargin": 0.2,
  "description": "Canali: 60% direct, 40% distributori (margine 20%)"
}
```

### **✅ Criteri Successo**
- [ ] KPI calcolato correttamente (92%)
- [ ] Badge header aggiornato
- [ ] Warning appare se < 85%
- [ ] Database salvato

### **🧮 Test Vari Channel Mix**

| Direct | Dist | Margin | Efficiency | Warning? |
|--------|------|--------|------------|----------|
| 100% | 0% | 0% | 100% | No ✅ |
| 80% | 20% | 20% | 96% | No ✅ |
| 60% | 40% | 20% | 92% | No ✅ |
| 50% | 50% | 20% | 90% | No ✅ |
| 40% | 60% | 20% | 88% | No ✅ |
| 20% | 80% | 20% | 84% | Sì ⚠️ |
| 50% | 50% | 30% | 85% | No (edge) |
| 40% | 60% | 30% | 82% | Sì ⚠️ |

---

## TEST 5: ADOPTION CURVE

### **🎯 Obiettivo**
Verificare configurazione penetrazione mercato regionale

### **📍 Dove**
Bottom-Up → GTMConfigurationPanel → Sezione "Adoption Curve"

### **📝 Procedura**

#### **STEP 1: Visualizzazione Tabella**
Card mostra tabella:
```
┌─────────┬──────┬──────┬──────┬──────┬──────┐
│ Regione │  Y1  │  Y2  │  Y3  │  Y4  │  Y5  │
├─────────┼──────┼──────┼──────┼──────┼──────┤
│ Italia  │ 0.2  │ 0.6  │ 1.0  │ 1.0  │ 1.0  │
│ Europa  │ 0.1  │ 0.4  │ 0.8  │ 1.0  │ 1.0  │
│ USA     │ 0.0  │ 0.2  │ 0.5  │ 0.8  │ 1.0  │
│ Cina    │ 0.0  │ 0.1  │ 0.3  │ 0.6  │ 1.0  │
└─────────┴──────┴──────┴──────┴──────┴──────┘
```

#### **STEP 2: Test Modifica Italia Y1**
1. Click su input Italia Y1
2. Cambia da 0.2 → 0.4
3. **Verifica**: Label sotto mostra "40%"
4. Campo accetta valori 0-1 (con step 0.1)

#### **STEP 3: Modifica Altri Valori**
Test pattern realistico:
```
Italia:  0.4 → 0.7 → 1.0 → 1.0 → 1.0
Europa:  0.2 → 0.5 → 0.9 → 1.0 → 1.0
USA:     0.0 → 0.3 → 0.6 → 0.9 → 1.0
Cina:    0.0 → 0.2 → 0.4 → 0.7 → 1.0
```

#### **STEP 4: Click "Salva Adoption Curve"**
1. Click pulsante
2. **Verifica**: Conferma salvataggio

#### **STEP 5: Verifica Badge Header**
1. Scroll up a GTMEngineCard
2. Badge "Adoption Italia: 40% → 100%"
3. Badge NORMALE (non rosso) perché 40% < 50% ma raggiunge 100%
4. Se Y1 ≥ 50% → Badge blu normale
5. Se Y1 < 50% → Badge rosso con ⚠️

#### **STEP 6: Test Warning**
1. Imposta Italia Y1 = 0.3 (30%)
2. Salva
3. **Verifica Badge**: ROSSO con ⚠️
4. Tooltip: "⚠️ Mercato poco penetrato in Anno 1"

#### **STEP 7: Verifica Database**
```json
"adoptionCurve": {
  "italia": {
    "y1": 0.4,
    "y2": 0.7,
    "y3": 1.0,
    "y4": 1.0,
    "y5": 1.0
  },
  "europa": { ... },
  "usa": { ... },
  "cina": { ... }
}
```

### **✅ Criteri Successo**
- [ ] Tabella editabile
- [ ] Percentuali calcolate correttamente
- [ ] Badge aggiornato con Y1 → Y5
- [ ] Warning se Y1 < 50%
- [ ] Database salvato

### **📚 Significato Adoption**

| Valore | Significato | Quando Usare |
|--------|-------------|--------------|
| 0% | Mercato non penetrato | Anno 1 mercati futuri (USA, Cina) |
| 20% | Solo early adopters | Anno 1 mercato principale (Italia) |
| 50% | Primi adopter penetrati | Anno 2-3 mercato principale |
| 100% | Mercato completamente penetrato | Anno 3+ mercato principale |

---

## TEST 6: SCENARIOS

### **🎯 Obiettivo**
Verificare selezione scenario investimento

### **📍 Dove**
Bottom-Up → GTMConfigurationPanel → Sezione "Scenarios"

### **📝 Procedura**

#### **STEP 1: Verifica Scenario Corrente**
1. Trova sezione "Scenarios"
2. 3 card: Basso, Medio, Alto
3. Una ha pallino viola (scenario attivo)
4. Default dovrebbe essere "Medio"

#### **STEP 2: Click "Scenario Alto"**
1. Click su card "Scenario Alto"
2. **Verifica**: Pallino viola si sposta su "Alto"
3. Card mostra:
   ```
   Budget: €300,000/anno
   Sales Reps: 3
   Efficienza: 150%
   ```

#### **STEP 3: Verifica Badge**
1. Scroll up a GTMEngineCard header
2. Badge "Scenario: alto" aggiornato
3. Capitalized: "Alto"

#### **STEP 4: NOTA IMPORTANTE**
⚠️ **Lo scenario NON modifica automaticamente i parametri GTM**

Scenario è solo un **riferimento/template**. L'utente deve poi:
1. Modificare manualmente reps (es: Y1 → 3)
2. Modificare budget nel simulatore
3. Scenario suggerisce ma non impone

#### **STEP 5: Verifica Database**
```json
"scenarios": {
  "current": "alto",
  "basso": { ... },
  "medio": { ... },
  "alto": {
    "budget": 300000,
    "reps": 3,
    "multiplier": 1.5,
    "description": "..."
  }
}
```

### **✅ Criteri Successo**
- [ ] Click cambia scenario
- [ ] Pallino si sposta
- [ ] Badge aggiornato
- [ ] Database salvato
- [ ] Nessuna modifica automatica ad altri parametri

---

## TEST 7: BADGE KPI E WARNING

### **🎯 Obiettivo**
Verificare che badge header rispondano a modifiche parametri

### **📍 Dove**
Bottom-Up → GTMEngineCard → Header (sotto titolo)

### **📝 Procedura**

#### **STEP 1: Identifica Badge**
Header mostra 3 badge:
1. Channel Efficiency: X%
2. Adoption Italia: Y% → Z%
3. Scenario: nome

#### **STEP 2: Test Click Badge Channel**
1. Click su "Channel Efficiency: 92%"
2. **Atteso**: Scroll automatico a GTMConfigurationPanel → Channel Mix
3. **Verifica**: Pagina scrolla giù (smooth scroll)

#### **STEP 3: Test Click Badge Adoption**
1. Click su "Adoption Italia: 20% → 100%"
2. **Atteso**: Scroll a GTMConfigurationPanel → Adoption Curve
3. **Verifica**: Pagina scrolla giù

#### **STEP 4: Test Warning Channel**
1. Vai a Channel Mix
2. Imposta efficiency < 85% (es: dist=70%, margin=30% → 79%)
3. Salva
4. **Verifica Badge**: 
   - Diventa ROSSO
   - Mostra ⚠️
   - Testo: "Channel Efficiency: 79.0%"
5. Hover tooltip: "⚠️ Troppo margine ai distributori - Click per modificare"

#### **STEP 5: Test Warning Adoption**
1. Vai a Adoption Curve
2. Imposta Italia Y1 < 50% (es: 0.3)
3. Salva
4. **Verifica Badge**:
   - Diventa ROSSO
   - Mostra ⚠️
   - Testo: "Adoption Italia: 30% → 100%"
5. Hover tooltip: "⚠️ Mercato poco penetrato in Anno 1"

#### **STEP 6: Test Rimozione Warning**
1. Torna a Channel Mix
2. Imposta efficiency ≥ 85%
3. Salva
4. **Verifica Badge**: Torna BLU, no ⚠️

### **✅ Criteri Successo**
- [ ] Badge visibili e leggibili
- [ ] Click triggera scroll
- [ ] Warning appaiono correttamente
- [ ] Warning scompaiono quando risolti
- [ ] Tooltip informativi

---

**📖 CONTINUA IN PARTE 3: Test Riconciliazione e Troubleshooting**
