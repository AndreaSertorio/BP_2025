# 🎯 GUIDA PARAMETRI GTM - DOVE SONO E COME INFLUENZANO I CALCOLI

**Data**: 13 Ottobre 2025  
**Obiettivo**: Spiegare dove trovare i parametri GTM e come influenzano le proiezioni di vendita

---

## 📍 DOVE SI TROVANO I PARAMETRI

### **Nel Database (`database.json`)**

```json
{
  "goToMarket": {
    "channelMix": { ... },      // ← PARAMETRO 1
    "adoptionCurve": { ... },   // ← PARAMETRO 2
    "scenarios": { ... }        // ← PARAMETRO 3
  }
}
```

### **Nell'UI (nuovo componente creato)**

```
Bottom-Up → Go-To-Market → GTMConfigurationPanel
```

Pannello con 3 sezioni:
1. 🔵 **Channel Mix** (Mix canali vendita)
2. 🟢 **Adoption Curve** (Penetrazione mercato regionale)
3. 🟣 **Scenarios** (Scenari Basso/Medio/Alto)

---

## 1️⃣ CHANNEL MIX - MIX CANALI DI VENDITA

### **Cos'è**

Definisce **come vendi** i dispositivi:
- **Direct Sales**: Vendita diretta ai clienti (massimo margine)
- **Distributori**: Vendita tramite rete distributiva (lasci margine al distributore)

### **Configurazione Database**

```json
{
  "channelMix": {
    "direct": 0.6,              // 60% vendite dirette
    "distributors": 0.4,        // 40% tramite distributori
    "distributorMargin": 0.2,   // Lasci 20% margine ai distributori
    "description": "Canali: 60% direct, 40% distributori (margine 20%)"
  }
}
```

### **Come Influenza i Calcoli**

#### **Formula Channel Efficiency**

```
Channel Efficiency = 1.0 - (% Distributori × Margine Distributori)
```

**Esempio**:
```
direct = 60%
distributors = 40%
distributorMargin = 20%

Channel Efficiency = 1.0 - (0.4 × 0.2)
                   = 1.0 - 0.08
                   = 0.92 (92%)
```

#### **Applicazione nella Riconciliazione**

```
STEP 1: Calcola Capacity Base
Capacity_base = reps × deals/quarter × 4 × rampFactor
Esempio: 2 reps × 5 deals/Q × 4 × 1.0 = 40 devices

STEP 2: Applica Channel Efficiency
Capacity_finale = Capacity_base × Channel Efficiency
Esempio: 40 devices × 0.92 = 36.8 ≈ 37 devices

STEP 3: Confronta con SOM
RealisticSales = MIN(SOM_adjusted, Capacity_finale)
Esempio: MIN(50, 37) = 37 devices
```

### **Impatto Pratico**

| Direct % | Distributori % | Margin | Channel Efficiency | Capacity 40 → Finale |
|----------|----------------|--------|-------------------|----------------------|
| 100% | 0% | - | 100% | 40 → **40** |
| 80% | 20% | 20% | 96% | 40 → **38** |
| 60% | 40% | 20% | 92% | 40 → **37** |
| 40% | 60% | 20% | 88% | 40 → **35** |
| 0% | 100% | 20% | 80% | 40 → **32** |

**💡 Insight**: Più usi distributori, più capacity "perdi" perché lasci margine a loro.

---

## 2️⃣ ADOPTION CURVE - PENETRAZIONE MERCATO REGIONALE

### **Cos'è**

Modella la **penetrazione progressiva** nei mercati regionali. Non puoi vendere a tutto il SOM dal giorno 1 - devi guadagnare quota di mercato anno dopo anno.

### **Configurazione Database**

```json
{
  "adoptionCurve": {
    "italia": {
      "y1": 0.2,  // Anno 1: solo 20% del SOM italiano è penetrabile
      "y2": 0.6,  // Anno 2: 60% del SOM è raggiungibile
      "y3": 1.0,  // Anno 3: 100% del SOM è penetrato
      "y4": 1.0,
      "y5": 1.0
    },
    "europa": {
      "y1": 0.1,  // Europa: partenza più lenta (10%)
      "y2": 0.4,
      "y3": 0.8,
      "y4": 1.0,
      "y5": 1.0
    },
    "usa": {
      "y1": 0.0,  // USA: non parti ancora anno 1
      "y2": 0.2,
      "y3": 0.5,
      "y4": 0.8,
      "y5": 1.0
    },
    "cina": {
      "y1": 0.0,  // Cina: market entry più lento
      "y2": 0.1,
      "y3": 0.3,
      "y4": 0.6,
      "y5": 1.0
    }
  }
}
```

### **Come Influenza i Calcoli**

#### **Formula SOM Adjusted**

```
SOM_adjusted = SOM_target × Adoption Rate[regione][anno]
```

**Esempio Italia Anno 1**:
```
SOM_target = 100 devices
Adoption Rate = 0.2 (20%)

SOM_adjusted = 100 × 0.2 = 20 devices
```

**Esempio Italia Anno 3**:
```
SOM_target = 100 devices
Adoption Rate = 1.0 (100%)

SOM_adjusted = 100 × 1.0 = 100 devices
```

#### **Applicazione nella Riconciliazione**

```
STEP 1: Calcola SOM Adjusted
SOM_adjusted = SOM × AdoptionRate[italia][y1]
Esempio: 100 devices × 0.2 = 20 devices

STEP 2: Calcola Capacity Adjusted
Capacity_adjusted = Capacity × ChannelEfficiency
Esempio: 15 devices × 0.92 = 13.8 ≈ 14 devices

STEP 3: Realistic Sales
RealisticSales = MIN(20, 14) = 14 devices
Constraining Factor = "capacity" (perché 14 < 20)
```

### **Impatto Pratico - Scenario Italia**

| Anno | SOM Target | Adoption | SOM Adjusted | Capacity | Realistic |
|------|-----------|----------|--------------|----------|-----------|
| Y1 | 100 | 20% | **20** | 15 | 15 (capacity) |
| Y2 | 100 | 60% | **60** | 40 | 40 (capacity) |
| Y3 | 100 | 100% | **100** | 60 | 60 (capacity) |
| Y4 | 150 | 100% | **150** | 120 | 120 (capacity) |
| Y5 | 200 | 100% | **200** | 180 | 180 (capacity) |

**💡 Insight**: Anche se il SOM totale è 100, nell'anno 1 puoi vendere massimo a 20 (primi adopter). Negli anni successivi penetri il resto del mercato.

---

## 3️⃣ SCENARIOS - SCENARI BASSO/MEDIO/ALTO

### **Cos'è**

Preset di configurazione GTM per diversi livelli di **investimento iniziale**. Quando cambi scenario, vengono aggiornati automaticamente:
- Budget marketing annuo
- Numero sales reps iniziali
- Multiplier efficienza campagne

### **Configurazione Database**

```json
{
  "scenarios": {
    "current": "medio",  // Scenario attivo
    "basso": {
      "budget": 50000,
      "reps": 0,
      "multiplier": 0.5,
      "description": "Budget ridotto: €50K/anno, founder-led, efficienza 50%"
    },
    "medio": {
      "budget": 150000,
      "reps": 1,
      "multiplier": 1.0,
      "description": "Budget medio: €150K/anno, 1 rep, efficienza standard"
    },
    "alto": {
      "budget": 300000,
      "reps": 3,
      "multiplier": 1.5,
      "description": "Budget alto: €300K/anno, 3 reps, efficienza 150%"
    }
  }
}
```

### **Come Influenza i Calcoli**

#### **NON influenza direttamente** i calcoli di riconciliazione, ma:

1. **Imposta parametri iniziali** quando selezioni lo scenario
2. **Guida configurazione** salesCapacity e marketingPlan
3. **Suggerisce budget** per proiezioni finanziarie

#### **Workflow Scenario**

```
1. Utente seleziona "Scenario Alto"
   ↓
2. Sistema suggerisce:
   - Budget marketing: €300K/anno
   - Sales reps iniziali: 3
   - Efficienza campagne: 150%
   ↓
3. Utente accetta o modifica manualmente
   ↓
4. Parametri vengono usati in:
   - salesCapacity.repsByYear (influenza Capacity)
   - marketingPlan.projections (influenza budget)
   - conversionFunnel.multiplier (influenza efficienza)
```

### **Impatto Pratico - Comparazione Scenari**

| Metric | Scenario Basso | Scenario Medio | Scenario Alto |
|--------|----------------|----------------|---------------|
| **Budget Anno 1** | €50K | €150K | €300K |
| **Sales Reps Y1** | 0 (founder) | 1 | 3 |
| **Capacity Y1** | 10 devices | 15 devices | 45 devices |
| **Efficienza** | 50% | 100% | 150% |
| **CAC Stimato** | €5K | €10K | €6.7K (economies of scale) |

**💡 Insight**: Scenario Alto costa di più ma ha CAC più basso (per device) grazie a economies of scale.

---

## 🔄 FLUSSO COMPLETO - COME INTERAGISCONO TUTTI I PARAMETRI

### **Formula Finale Riconciliazione**

```javascript
// STEP 1: Capacity Base (da salesCapacity)
const capacityBase = reps[year] × dealsPerRepPerQuarter × 4 × rampFactor;

// STEP 2: Capacity Adjusted (applica channelMix)
const channelEfficiency = 1.0 - (distributors × distributorMargin);
const capacityAdjusted = capacityBase × channelEfficiency;

// STEP 3: SOM Adjusted (applica adoptionCurve)
const somAdjusted = somTarget × adoptionRate[region][year];

// STEP 4: Realistic Sales (riconciliazione finale)
const realisticSales = Math.min(somAdjusted, capacityAdjusted);

// STEP 5: Constraining Factor
const constrainingFactor = realisticSales === somAdjusted ? 'market' : 'capacity';
```

### **Esempio Completo Anno 1 Italia**

**Input Parametri**:
```
// TAM/SAM/SOM
somTarget = 100 devices

// Channel Mix
direct = 0.6 (60%)
distributors = 0.4 (40%)
distributorMargin = 0.2 (20%)

// Adoption Curve Italia
adoptionRate[italia][y1] = 0.2 (20%)

// Sales Capacity
reps = 1
dealsPerRepPerQuarter = 5
rampFactor = 0.75 (3 mesi ramp-up)

// Scenario: Medio (non influenza direttamente)
```

**Calcoli Step-by-Step**:

```javascript
// STEP 1: Capacity Base
capacityBase = 1 × 5 × 4 × 0.75 = 15 devices

// STEP 2: Channel Efficiency
channelEfficiency = 1.0 - (0.4 × 0.2) = 0.92

// STEP 3: Capacity Adjusted
capacityAdjusted = 15 × 0.92 = 13.8 ≈ 14 devices

// STEP 4: SOM Adjusted
somAdjusted = 100 × 0.2 = 20 devices

// STEP 5: Realistic Sales
realisticSales = Math.min(20, 14) = 14 devices

// STEP 6: Constraining Factor
constrainingFactor = 14 < 20 → "capacity"
```

**Output Visualizzato**:
```
Anno 1 Italia:
- SOM Target: 100 devices
- SOM Adjusted (adoption 20%): 20 devices
- Capacity Base: 15 devices
- Capacity Adjusted (channel 92%): 14 devices
- Realistic Sales: 14 devices ✅
- Bottleneck: CAPACITY ⚠️

💡 Insight: Potresti vendere 6 devices in più (20 - 14) se assumessi più reps!
```

---

## 🎮 SIMULAZIONI - COSA SUCCEDE SE MODIFICHI I PARAMETRI

### **Simulazione 1: Aumento Channel Direct**

**Scenario Iniziale**:
- Direct 60% / Distributori 40% (margin 20%)
- Channel Efficiency = 92%
- Capacity Adjusted = 14 devices

**Modifica**: Direct → 100% / Distributori → 0%

**Risultato**:
- Channel Efficiency = 100%
- Capacity Adjusted = 15 devices (+1 device!)
- Realistic Sales = 15 devices
- Still capacity-constrained (15 < 20)

**💡 Guadagni 1 device vendendo tutto diretto (elimini margine distributori)**

---

### **Simulazione 2: Aumento Adoption Italia Y1**

**Scenario Iniziale**:
- Adoption Italia Y1 = 20%
- SOM Adjusted = 20 devices
- Realistic Sales = 14 (capacity-constrained)

**Modifica**: Adoption Italia Y1 → 50%

**Risultato**:
- SOM Adjusted = 50 devices
- Capacity Adjusted = 14 devices (invariata)
- Realistic Sales = 14 devices
- Still capacity-constrained (14 < 50)

**💡 Aumentare adoption NON aiuta se sei capacity-constrained!**

---

### **Simulazione 3: Cambio Scenario Basso → Alto**

**Scenario Basso**:
- Reps = 0 (founder-led)
- Capacity Base = 10 devices
- Realistic Sales = 10 devices

**Scenario Alto**:
- Reps = 3
- Capacity Base = 45 devices
- Capacity Adjusted = 41.4 devices
- Realistic Sales = 20 devices (ora market-constrained!)

**💡 Con più budget, diventi market-constrained → investi in marketing!**

---

## 📊 TABELLA RIEPILOGATIVA - IMPATTO SU CALCOLI

| Parametro | Dove Si Trova | Influenza Diretta | Formula Impatto | Quando Cambiarlo |
|-----------|---------------|-------------------|-----------------|------------------|
| **Channel Mix - Direct** | `channelMix.direct` | Capacity Adjusted | `Cap × (1 - dist×margin)` | Strategia go-to-market |
| **Channel Mix - Distributors** | `channelMix.distributors` | Capacity Adjusted | Riduce capacity finale | Espansione geografica |
| **Distributor Margin** | `channelMix.distributorMargin` | Capacity Adjusted | Quanto lasci al distributore | Negoziazione contratti |
| **Adoption Curve** | `adoptionCurve[region][year]` | SOM Adjusted | `SOM × adoption` | Velocità penetrazione mercato |
| **Scenarios** | `scenarios.current` | Suggerimenti iniziali | Non diretta | Setup iniziale o fundraising |

---

## ✅ CHECKLIST - HAI CONFIGURATO TUTTO?

- [ ] **Channel Mix** impostato in base a strategia vendita
  - [ ] Se hai rete distributori pronta → 40%+ distributors
  - [ ] Se vendi solo diretto → 100% direct
  
- [ ] **Distributor Margin** negoziato realisticamente
  - [ ] Industry standard medtech: 15-25%
  - [ ] Distributori premium: 30-40%
  
- [ ] **Adoption Curve** allineata con piano espansione
  - [ ] Italia: mercato principale → partenza 20-30% Y1
  - [ ] Europa: espansione Y2-Y3 → partenza 10% Y2
  - [ ] USA/Cina: mercati futuri → partenza Y3+
  
- [ ] **Scenario** selezionato in base a funding disponibile
  - [ ] Basso: Bootstrap / Pre-seed
  - [ ] Medio: Seed round €500K-€1M
  - [ ] Alto: Series A €2M+

---

## 🚀 PROSSIMI STEP

1. **Testa i Parametri**: Modifica nel GTMConfigurationPanel e vedi impatto su Riconciliazione
2. **Confronta Scenari**: Prova Basso/Medio/Alto e vedi come cambiano vendite
3. **Allinea con Fundraising**: Se raccogli più capitale, passa a scenario Alto
4. **Export per Pitch**: Usa dati riconciliazione per slide investitori

---

## 💡 FAQ - DOMANDE FREQUENTI

### **Q: Perché Capacity Adjusted è sempre < Capacity Base?**
**A**: Channel Mix erode sempre un po' di capacity, anche con 100% direct (inefficienze operative). Solo con direct=100% e margin=0 hai efficiency=100%.

### **Q: Perché Italia parte da 20% adoption invece di 100%?**
**A**: Penetrazione mercato è progressiva. Anno 1 vendi solo a early adopters (primi 20%). Anni successivi conquisti il resto.

### **Q: Scenario influenza i calcoli finali?**
**A**: No, è solo un preset iniziale. I calcoli usano i valori effettivi di reps, budget, etc. che puoi modificare manualmente.

### **Q: Come uso questi dati per il P&L?**
**A**: Realistic Sales dal GTM Calculated → usa come input per calcolare ricavi nel Conto Economico.

### **Q: Cosa faccio se sono sempre capacity-constrained?**
**A**: Assumi più sales reps! Il bottleneck ti dice che hai domanda ma non capacità di servire.

### **Q: Cosa faccio se sono sempre market-constrained?**
**A**: Investi in marketing! Hai capacità commerciale ma poca domanda generata.

---

**🎉 ORA SAI DOVE SONO E COME FUNZIONANO TUTTI I PARAMETRI GTM!** 🎉
