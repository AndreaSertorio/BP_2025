# 🏗️ ARCHITETTURA DATI GTM - ANALISI COMPLETA

**Data**: 14 Ottobre 2025  
**Obiettivo**: Mappare duplicazioni, flussi dati e integrare scenari

---

## 🔴 **PROBLEMA 1: DUPLICAZIONE DEVICE PRICE**

### **Dove appare il prezzo dispositivo**

| Sezione | Campo | Valore | Uso |
|---------|-------|--------|-----|
| **TAM/SAM/SOM** | `configurazioneTamSamSom.ecografi.prezziMediDispositivi.carrellati` | €50,000 | Calcolo revenue da SOM |
| **Revenue Model** | `revenueModel.assumptions.prezzoMedioVendita` | €50,000 | Calcolo P&L e revenue |
| **GTM Marketing Plan** | `goToMarket.marketingPlan.globalSettings.devicePrice` | €50,000 | Simulatore bottom-up |

### ❌ **PROBLEMA**
**3 copie dello stesso dato!** Se modifichi uno, gli altri non si aggiornano.

### ✅ **SOLUZIONE**
**Single Source of Truth (SSOT)**:

```json
{
  "globalSettings": {
    "business": {
      "devicePrice": 50000,
      "deviceType": "carrellato",
      "currency": "EUR",
      "lastUpdate": "2025-10-14"
    }
  }
}
```

**Tutti gli altri referenziano**:
```typescript
// TAM/SAM/SOM
const devicePrice = data.globalSettings.business.devicePrice;

// Revenue Model
const prezzoMedioVendita = data.globalSettings.business.devicePrice;

// GTM
const simulatorPrice = data.globalSettings.business.devicePrice;
```

**BENEFICI**:
- ✅ Modifichi in UN solo posto
- ✅ Sincronizzazione automatica
- ✅ Coerenza garantita

---

## 🔴 **PROBLEMA 2: SCENARI - COSA SONO?**

### **Situazione Attuale**

```json
"scenarios": {
  "current": "alto",
  "basso": {
    "budget": 50000,      // Budget marketing annuale
    "reps": 0,            // Venditori (founder-led)
    "multiplier": 0.5,    // Efficienza ridotta
    "description": "Budget ridotto: €50K/anno, founder-led"
  },
  "medio": {
    "budget": 150000,
    "reps": 1,
    "multiplier": 1,
    "description": "Budget medio: €150K/anno, 1 rep"
  },
  "alto": {
    "budget": 300000,
    "reps": 3,
    "multiplier": 1.5,
    "description": "Budget alto: €300K/anno, 3 reps"
  }
}
```

### ❓ **DOMANDE NON CHIARE**

1. **Budget**: È il budget marketing totale dell'anno o per qualcos'altro?
2. **Reps**: Sovrascrive `salesCapacity.repsByYear.y1`?
3. **Multiplier**: Moltiplica cosa? Funnel? Capacity?
4. **Current**: Come influenza i calcoli?

### 🎯 **PROPOSTA: SCENARI WHAT-IF**

Gli scenari dovrebbero essere **preset di configurazione** che modificano temporaneamente i parametri base:

```typescript
// SCENARIO = Configurazione predefinita
interface Scenario {
  name: string;
  description: string;
  overrides: {
    // Parametri che sovrascrive
    salesCapacity?: {
      repsByYear?: { y1: number, y2: number, ... };
      dealsPerRepPerQuarter?: number;
    };
    conversionFunnel?: {
      lead_to_demo?: number;
      demo_to_pilot?: number;
      pilot_to_deal?: number;
    };
    channelMix?: {
      direct?: number;
      distributors?: number;
    };
    adoptionCurve?: {
      italia?: { y1: number, ... };
    };
  };
}
```

**ESEMPIO PRATICO**:

```json
{
  "scenarios": {
    "current": "base",
    "prudente": {
      "name": "Prudente",
      "description": "Conservative: meno reps, funnel più basso, lenta adoption",
      "overrides": {
        "salesCapacity": {
          "repsByYear": { "y1": 1, "y2": 2, "y3": 3, "y4": 5, "y5": 7 }
        },
        "conversionFunnel": {
          "lead_to_demo": 0.08,
          "demo_to_pilot": 0.4,
          "pilot_to_deal": 0.5
        },
        "adoptionCurve": {
          "italia": { "y1": 0.1, "y2": 0.3, "y3": 0.6, "y4": 0.8, "y5": 1 }
        }
      }
    },
    "base": {
      "name": "Base",
      "description": "Realistic scenario - parametri attuali",
      "overrides": {}  // Usa valori correnti
    },
    "ottimista": {
      "name": "Ottimista",
      "description": "Aggressive: più reps, funnel migliore, adozione veloce",
      "overrides": {
        "salesCapacity": {
          "repsByYear": { "y1": 3, "y2": 5, "y3": 10, "y4": 15, "y5": 20 }
        },
        "conversionFunnel": {
          "lead_to_demo": 0.15,
          "demo_to_pilot": 0.6,
          "pilot_to_deal": 0.7
        },
        "adoptionCurve": {
          "italia": { "y1": 0.3, "y2": 0.7, "y3": 1, "y4": 1, "y5": 1 }
        }
      }
    }
  }
}
```

**COME SI USA**:

1. Utente seleziona scenario dal dropdown
2. UI mostra parametri dello scenario (editabili temporaneamente)
3. Calcoli usano i parametri sovrascritti
4. "Applica Scenario" = salva come configurazione corrente
5. "Reset" = torna allo scenario Base

---

## 🔴 **PROBLEMA 3: CONFIGURAZIONE AVANZATA SEPARATA**

### **Situazione Attuale**

Ci sono 2 componenti separati:
1. **GTMEngineCard**: Parametri base (reps, funnel, simulatore)
2. **GTMConfigurationPanel**: Parametri avanzati (channel mix, adoption curve)

### ❌ **PROBLEMA**
- Utente deve navigare tra 2 UI diverse
- Non chiaro dove modificare cosa
- Adoption curve e channel mix sembrano "nascosti"

### ✅ **SOLUZIONE: TUTTO IN UN SOLO POSTO**

**Struttura Unificata con Tabs**:

```
┌─ GO-TO-MARKET ENGINE ─────────────────────────┐
│  [Scenario: Base ▼]  [Compare: Prudente ▼]   │
├───────────────────────────────────────────────┤
│  [📊 Parametri] [🎯 Simulatore] [📈 Scenari]  │
├───────────────────────────────────────────────┤
│                                               │
│  TAB 1: PARAMETRI                             │
│  ┌─────────────────────────────────────────┐  │
│  │ TEAM & CAPACITY                         │  │
│  │ - Reps per anno (5 badge)               │  │
│  │ - Deals/Rep/Quarter                     │  │
│  │ - Ramp-up months                        │  │
│  │                                         │  │
│  │ SALES CYCLE                             │  │
│  │ - Pubblico, Privato, Research           │  │
│  │                                         │  │
│  │ CONVERSION FUNNEL                       │  │
│  │ - Lead→Demo, Demo→Pilot, Pilot→Deal    │  │
│  │                                         │  │
│  │ CHANNEL MIX                             │  │
│  │ - Direct %, Distributors %, Margin      │  │
│  │                                         │  │
│  │ ADOPTION CURVE                          │  │
│  │ - Italia, Europa, USA, Cina per Y1-Y5   │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  TAB 2: SIMULATORE                            │
│  (calcoli anno per anno)                      │
│                                               │
│  TAB 3: SCENARI                               │
│  ┌─────────────────────────────────────────┐  │
│  │ [Prudente] [Base] [Ottimista]           │  │
│  │                                         │  │
│  │ Confronta 3 scenari side-by-side        │  │
│  │ Tabella comparativa                     │  │
│  │ [Applica Scenario Selezionato]          │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## 🔴 **PROBLEMA 4: FLUSSO DATI NELL'APPLICAZIONE**

### **Chi Usa Cosa?**

| Componente | Input Da | Output A |
|------------|----------|----------|
| **TAM/SAM/SOM** | Device Price (SSOT) | SOM dispositivi → GTM |
| **GTM Engine** | SOM, Parametri Base | Realistic Sales → Revenue Model |
| **Revenue Model** | Realistic Sales, Device Price | P&L, Cash Flow |
| **Conto Economico** | Revenue Model | Financial Statements |

### **Flusso End-to-End**

```
┌──────────────┐
│ GLOBAL       │
│ SETTINGS     │ → Device Price: €50K
│              │ → Cost Structure
└──────┬───────┘
       │
       v
┌──────────────┐
│ TAM/SAM/SOM  │ → Calculate market size
│ (Top-Down)   │ → SOM Y1: 28 devices
└──────┬───────┘
       │
       v
┌──────────────┐
│ GTM ENGINE   │ → Capacity Y1: 15 devices
│ (Bottom-Up)  │ → Realistic = MIN(28, 15) = 15
└──────┬───────┘
       │
       v
┌──────────────┐
│ RECONCILE    │ → Realistic Sales Y1: 15
│              │ → Budget Marketing Y1: €27.5K
└──────┬───────┘
       │
       v
┌──────────────┐
│ REVENUE      │ → Revenue Y1 = 15 × €50K = €750K
│ MODEL        │ → COGS, OPEX, etc.
└──────┬───────┘
       │
       v
┌──────────────┐
│ P&L          │ → EBITDA, Net Income
│ CASH FLOW    │ → Runway, Burn Rate
└──────────────┘
```

---

## 🎯 **SOLUZIONE COMPLETA: NUOVA ARCHITETTURA**

### **1. Single Source of Truth**

```json
{
  "globalSettings": {
    "business": {
      "devicePrice": 50000,
      "deviceType": "carrellato",
      "currency": "EUR"
    }
  }
}
```

### **2. GTM Unificato**

```json
{
  "goToMarket": {
    "scenarioCurrent": "base",
    "scenarioComparison": null,  // opzionale per side-by-side
    
    "scenarios": {
      "prudente": { /* overrides */ },
      "base": { /* valori correnti */ },
      "ottimista": { /* overrides */ }
    },
    
    "parametriBase": {
      // Tutti i parametri in un solo oggetto
      "salesCapacity": { /* ... */ },
      "salesCycle": { /* ... */ },
      "conversionFunnel": { /* ... */ },
      "channelMix": { /* ... */ },
      "adoptionCurve": { /* ... */ }
    },
    
    "calculated": {
      // Output per scenario corrente
      "maxSalesCapacity": { y1: 15, ... },
      "realisticSales": { y1: 15, ... },
      "budgetMarketing": { y1: 27500, ... }
    }
  }
}
```

### **3. API Unificata**

```typescript
// GET calcoli per scenario specifico
GET /api/gtm/calculate?scenario=ottimista

// PATCH aggiorna parametri (auto-ricalcola)
PATCH /api/gtm/parametri
Body: { "conversionFunnel": { "lead_to_demo": 0.12 } }

// POST applica scenario (copia overrides in parametriBase)
POST /api/gtm/scenario/apply
Body: { "scenario": "ottimista" }

// GET confronta scenari
GET /api/gtm/compare?scenarios=prudente,base,ottimista
```

---

## 📊 **UI REDESIGN FINALE**

### **Layout Proposto**

```
┌──────────────────────────────────────────────────────┐
│  🎯 Go-To-Market Engine                              │
│                                                      │
│  Scenario Attivo: [Base ▼]  Confronta: [None ▼]    │
│                                                      │
│  [📊 Parametri] [🎯 Simulatore] [📈 Scenari]        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  TAB: PARAMETRI                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Sezioni collassabili (Accordion):              │  │
│  │                                                │  │
│  │ ▼ Team & Capacity                              │  │
│  │   Reps: Y1(1) Y2(3) Y3(4) Y4(7) Y5(10)        │  │
│  │   Deals/Q: 5 | Ramp-up: 3 mesi                │  │
│  │                                                │  │
│  │ ▼ Sales Cycle                                  │  │
│  │   Pubblico: 9 | Privato: 3 | Research: 6      │  │
│  │                                                │  │
│  │ ▼ Conversion Funnel                            │  │
│  │   L→D: 10% | D→P: 50% | P→D: 60% (3% total)  │  │
│  │                                                │  │
│  │ ▶ Channel Mix (collapsed)                      │  │
│  │ ▶ Adoption Curve (collapsed)                   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  TAB: SIMULATORE                                     │
│  Anno, Cost/Lead, Risultati tabella                 │
│                                                      │
│  TAB: SCENARI                                        │
│  [Prudente] [Base] [Ottimista]                      │
│  Tabella comparativa 3 scenari                      │
│  [Applica Scenario Selezionato]                     │
└──────────────────────────────────────────────────────┘
```

**FEATURES CHIAVE**:
1. ✅ **Accordion** per sezioni collassabili (risparmia spazio)
2. ✅ **Dropdown scenario** per testare what-if
3. ✅ **Tab separati** per flusso logico
4. ✅ **Device Price** letto da globalSettings (non duplicato!)
5. ✅ **Tutto in UN componente** unificato

---

## ✅ **IMPLEMENTAZIONE STEP-BY-STEP**

### **FASE 1: Refactoring Database**
1. Crea `globalSettings.business.devicePrice`
2. Rimuovi duplicati
3. Aggiorna API per leggere da SSOT

### **FASE 2: Ridefinizione Scenari**
1. Riscrivi structure scenarios con `overrides`
2. Implementa logica scenario selection
3. API `calculate?scenario=X`

### **FASE 3: UI Unificata**
1. Crea `GTMEngineUnified.tsx`
2. Implementa Tabs + Accordion
3. Integra tutti parametri in un solo posto
4. Aggiungi Sales Cycle UI

### **FASE 4: Testing & Integration**
1. Testa flusso end-to-end
2. Verifica sincronizzazione con Revenue Model
3. Update guide testing

---

## 🚀 **PRONTO PER APPROVAZIONE?**

Questa è l'architettura completa. Prima di procedere con l'implementazione:

1. **Approvi la logica degli scenari** (overrides)?
2. **Approvi il SSOT per device price**?
3. **Approvi UI unificata** con Tabs + Accordion?
4. **Vuoi modifiche** a questa proposta?

Dimmi cosa ne pensi! 🎯
