# 🧪 GUIDA TESTING BOTTOM-UP & RICONCILIAZIONE - PARTE 1

**Data**: 13 Ottobre 2025  
**Parte**: 1/3 - Mappa Componenti e Architettura

---

## 📋 COSA ABBIAMO IMPLEMENTATO

### **SEZIONE BOTTOM-UP**

```
1. GTMEngineCard (Componente Principale)
   ├─ Badge KPI (Channel Efficiency, Adoption, Scenario)
   ├─ Sales Capacity (reps per anno Y1-Y5)
   ├─ Conversion Funnel (Lead→Demo→Pilot→Deal)
   └─ Simulatore Impatto Business (calcoli per anno)

2. GTMConfigurationPanel (Configurazione Avanzata)
   ├─ Channel Mix (Direct vs Distributori)
   ├─ Adoption Curve (penetrazione regionale)
   └─ Scenarios (Basso/Medio/Alto)
```

### **SEZIONE RICONCILIAZIONE**

```
1. GTMReconciliationCard (NUOVO - Componente Chiave)
   ├─ Tabella comparativa 5 anni
   ├─ Confronto SOM vs Capacity
   ├─ Badge bottleneck (Market/Capacity constrained)
   ├─ Gap analysis con percentuali
   └─ Insights strategici automatici

2. Tabelle Comparative (esistenti)
   └─ Analisi dettagliata per anno
```

---

## 🗺️ MAPPA DATI NEL DATABASE

### **Struttura `goToMarket` in `database.json`**

```json
{
  "goToMarket": {
    
    "enabled": true,
    
    "salesCapacity": {
      "reps": 1,
      "repsByYear": { "y1": 1, "y2": 2, "y3": 3, "y4": 4, "y5": 6 },
      "dealsPerRepPerQuarter": 5,
      "salesCycleDays": 90,
      "rampUpQuarters": 1
    },
    
    "conversionFunnel": {
      "leadToDemo": 0.1,
      "demoToPilot": 0.5,
      "pilotToDeal": 0.6
    },
    
    "channelMix": {
      "direct": 0.6,
      "distributors": 0.4,
      "distributorMargin": 0.2
    },
    
    "adoptionCurve": {
      "italia": { "y1": 0.2, "y2": 0.6, "y3": 1, "y4": 1, "y5": 1 },
      "europa": { "y1": 0.1, "y2": 0.4, "y3": 0.8, "y4": 1, "y5": 1 },
      "usa": { "y1": 0, "y2": 0.2, "y3": 0.5, "y4": 0.8, "y5": 1 },
      "cina": { "y1": 0, "y2": 0.1, "y3": 0.3, "y4": 0.6, "y5": 1 }
    },
    
    "scenarios": {
      "current": "medio",
      "basso": { "budget": 50000, "reps": 0, "multiplier": 0.5 },
      "medio": { "budget": 150000, "reps": 1, "multiplier": 1.0 },
      "alto": { "budget": 300000, "reps": 3, "multiplier": 1.5 }
    },
    
    "marketingPlan": {
      "projections": {
        "y1": {
          "costPerLead": 55,
          "calculated": {
            "reps": 1,
            "capacity": 15,
            "leadsNeeded": 500,
            "budgetMarketing": 27500,
            "cacEffettivo": 1833,
            "expectedRevenue": 750000
          }
        }
      }
    },
    
    "calculated": {
      "maxSalesCapacity": { "y1": 15, "y2": 40, "y3": 60, "y4": 120, "y5": 180 },
      "realisticSales": { "y1": 7, "y2": 31, "y3": 55, "y4": 110, "y5": 165 },
      "constrainingFactor": { "y1": "market", "y2": "market", "y3": "capacity", "y4": "capacity", "y5": "capacity" },
      "details": {
        "y1": {
          "somTarget": 35,
          "somAdjustedByAdoption": 7,
          "capacityBeforeChannels": 15,
          "capacityAfterChannels": 14,
          "realisticSales": 7,
          "constrainingFactor": "market",
          "adoptionRate": 0.2,
          "channelEfficiency": 0.92
        }
      }
    }
  }
}
```

---

## 🔄 FLUSSO DATI SEMPLIFICATO

```
┌──────────────────────────┐
│ 1. UTENTE MODIFICA      │
│    PARAMETRI GTM         │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ 2. SALVATAGGIO DATABASE  │
│    goToMarket.{...}      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ 3. CALCOLO SIMULATORE    │
│    marketingPlan.yX      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ 4. RICONCILIAZIONE AUTO  │
│    calculated.{...}      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ 5. UI AGGIORNATA         │
│    Badge + Tabelle       │
└──────────────────────────┘
```

---

## 🎯 CONNESSIONI TRA COMPONENTI

### **COSA INFLUENZA COSA**

```
salesCapacity.repsByYear
    ↓
    Influenza: Capacity Base
    Usa: Simulatore, Riconciliazione
    Formula: reps × deals/Q × 4 × ramp

conversionFunnel (L2D, D2P, P2D)
    ↓
    Influenza: Leads Needed
    Usa: Simulatore
    Formula: capacity / (L2D × D2P × P2D)

channelMix (distributors, margin)
    ↓
    Influenza: Channel Efficiency
    Usa: Riconciliazione
    Formula: 1 - (dist × margin)

adoptionCurve (regione, anno)
    ↓
    Influenza: SOM Adjusted
    Usa: Riconciliazione
    Formula: SOM × adoptionRate

SOM (da Top-Down)
    ↓
    Influenza: Domanda Mercato
    Usa: Riconciliazione
    Source: tamSamSomEcografi.dispositiviUnita

calculated.realisticSales ⭐
    ↓
    Usa: P&L, Revenue Projections, Cash Flow
    Formula: MIN(SOM_adjusted, Capacity_adjusted)
```

---

## 📊 TABELLA CONNESSIONI RAPIDA

| Input | Dove Modifichi | Dove Impatta | Formula |
|-------|----------------|--------------|---------|
| **Sales Reps Y1-Y5** | GTMEngineCard | Capacity Base | reps × deals × 4 × ramp |
| **Deals/Rep/Quarter** | GTMEngineCard | Capacity Base | reps × deals × 4 × ramp |
| **Funnel L2D/D2P/P2D** | GTMEngineCard | Leads Needed | cap / (L2D×D2P×P2D) |
| **Channel Mix** | GTMConfigPanel | Capacity Adjusted | cap × (1-dist×margin) |
| **Adoption Curve** | GTMConfigPanel | SOM Adjusted | SOM × adoptionRate |
| **Scenario** | GTMConfigPanel | Nessuno (solo riferimento) | - |
| **Cost per Lead** | Simulatore | Budget Marketing | leads × costPerLead |

---

## 🧮 FORMULE CHIAVE

### **FORMULA 1: Capacity Base**
```
Capacity = reps × dealsPerRepPerQuarter × 4 × rampFactor

rampFactor = (4 - rampUpQuarters) / 4

Esempio:
reps = 2, deals/Q = 5, rampUpQuarters = 1
rampFactor = (4-1)/4 = 0.75
Capacity = 2 × 5 × 4 × 0.75 = 30 devices
```

### **FORMULA 2: Funnel Efficiency**
```
Efficiency = leadToDemo × demoToPilot × pilotToDeal

Esempio:
L2D = 0.1, D2P = 0.5, P2D = 0.6
Efficiency = 0.1 × 0.5 × 0.6 = 0.03 (3%)
```

### **FORMULA 3: Leads Needed**
```
LeadsNeeded = capacity / funnelEfficiency

Esempio:
Capacity = 15, Efficiency = 0.03
Leads = 15 / 0.03 = 500 leads
```

### **FORMULA 4: Budget Marketing**
```
BudgetMarketing = leadsNeeded × costPerLead

Esempio:
Leads = 500, CostPerLead = €55
Budget = 500 × 55 = €27,500
```

### **FORMULA 5: Channel Efficiency**
```
ChannelEfficiency = 1 - (distributors × distributorMargin)

Esempio:
Distributors = 0.4, Margin = 0.2
Efficiency = 1 - (0.4 × 0.2) = 0.92 (92%)
```

### **FORMULA 6: SOM Adjusted**
```
SOM_Adjusted = SOM_Target × adoptionRate

Esempio:
SOM = 35, Adoption Italia Y1 = 0.2
SOM_Adjusted = 35 × 0.2 = 7 devices
```

### **FORMULA 7: Realistic Sales** ⭐
```
RealisticSales = MIN(SOM_Adjusted, Capacity_Adjusted)

Capacity_Adjusted = Capacity_Base × ChannelEfficiency

Esempio:
SOM_Adj = 7, Cap_Base = 15, Channel = 0.92
Cap_Adj = 15 × 0.92 = 13.8 ≈ 14
Realistic = MIN(7, 14) = 7 devices
```

### **FORMULA 8: Constraining Factor**
```
IF RealisticSales === SOM_Adjusted:
    Factor = "market" (limitati da domanda)
ELSE:
    Factor = "capacity" (limitati da team)

Esempio:
Realistic = 7, SOM_Adj = 7 → "market" ✅
```

---

## 🔍 DOVE TROVARE I DATI

### **Nel Browser (DevTools)**

1. Apri Console: `Cmd+Option+J` (Mac) o `F12` (Win)

2. Leggi database:
   ```javascript
   // Apri IndexedDB o localStorage
   // O usa React DevTools per vedere DatabaseContext
   ```

3. Verifica salvataggi:
   - Network tab → Filter: `/api/database`
   - Vedi POST/PATCH requests
   - Check Response status 200

### **Nel Filesystem**

File: `/financial-dashboard/src/data/database.json`

Path completo:
```
/Users/dracs/Documents/START_UP/DOC PROGETTI/DOC_ECO 3d Multisonda/__BP 2025/financial-dashboard/src/data/database.json
```

Cerca sezione:
```json
"goToMarket": {
  // Tutti i dati GTM qui
}
```

---

## ✅ CHECKLIST PREREQUISITI TEST

Prima di iniziare i test dettagliati, verifica:

- [ ] Server in esecuzione (`npm run dev:all`)
- [ ] Browser aperto su `http://localhost:3000`
- [ ] DevTools Console aperta (no errori rossi)
- [ ] Database accessibile in `/src/data/database.json`
- [ ] Tab Bottom-Up caricato correttamente
- [ ] GTMEngineCard visibile e enabled
- [ ] GTMConfigurationPanel visibile (scroll down)
- [ ] Tab Riconciliazione caricato
- [ ] GTMReconciliationCard visibile

---

**📖 CONTINUA IN PARTE 2: Procedura Testing Dettagliata**
