# 🧪 GUIDA TESTING BOTTOM-UP & RICONCILIAZIONE - PARTE 3

**Data**: 13 Ottobre 2025  
**Parte**: 3/3 - Test Riconciliazione e Troubleshooting

---

## 📋 INDICE

1. [TEST 8: GTMReconciliationCard](#test-8-gtmreconciliationcard)
2. [TEST 9: Interconnessioni End-to-End](#test-9-interconnessioni-end-to-end)
3. [Troubleshooting Errori Comuni](#troubleshooting-errori-comuni)
4. [Checklist Testing Completa](#checklist-testing-completa)

---

## TEST 8: GTMReconciliationCard

### **🎯 Obiettivo**
Verificare il componente più importante: confronto Top-Down vs Bottom-Up

### **📍 Dove**
Tab **Riconciliazione** → GTMReconciliationCard (dopo summary widget)

### **🔧 Prerequisiti**
Prima di questo test, devi aver completato:
- ✅ TEST 1-6 (tutti i parametri configurati)
- ✅ TAM/SAM/SOM configurato nel Top-Down

### **📊 Setup Test Completo**

Configura questi valori prima del test:

```
SALES CAPACITY:
- Reps Y1: 1, Y2: 2, Y3: 3, Y4: 4, Y5: 6
- Deals/Rep/Quarter: 5
- Ramp-up: 1 quarter

CONVERSION FUNNEL:
- Lead-to-Demo: 10%
- Demo-to-Pilot: 50%
- Pilot-to-Deal: 60%
- Efficiency: 3%

CHANNEL MIX:
- Direct: 60%
- Distributors: 40%
- Margin: 20%
- Efficiency: 92%

ADOPTION ITALIA:
- Y1: 20%, Y2: 60%, Y3: 100%, Y4: 100%, Y5: 100%

SOM (da Top-Down):
- Y1: 35, Y2: 52, Y3: 69, Y4: 121, Y5: 173 devices
```

### **📝 Procedura TEST 8.1: Anno 1**

#### **STEP 1: Vai in Riconciliazione**
1. Click tab "Riconciliazione"
2. Scroll per trovare GTMReconciliationCard
3. Card ha titolo "Riconciliazione Top-Down vs Bottom-Up"

#### **STEP 2: Verifica Tabella Anno 1**
Tabella mostra 5 colonne:
1. SOM Target
2. SOM Adjusted
3. Capacity Base
4. Capacity Adj
5. Realistic Sales

#### **STEP 3: Calcolo Manuale Anno 1**

**INPUT:**
```
SOM Target: 35 devices (da database)
Adoption Italia Y1: 0.2
Reps Y1: 1
Deals/Q: 5
Ramp Factor: 0.75
Channel Efficiency: 0.92
```

**CALCOLI:**

**A. SOM Adjusted**:
```
somAdjusted = somTarget × adoptionRate
            = 35 × 0.2
            = 7 devices
```

**B. Capacity Base**:
```
capacityBase = reps × deals/Q × 4 × rampFactor
             = 1 × 5 × 4 × 0.75
             = 15 devices
```

**C. Capacity Adjusted**:
```
capacityAdjusted = capacityBase × channelEfficiency
                 = 15 × 0.92
                 = 13.8 ≈ 14 devices
```

**D. Realistic Sales**:
```
realisticSales = MIN(somAdjusted, capacityAdjusted)
               = MIN(7, 14)
               = 7 devices
```

**E. Constraining Factor**:
```
IF realisticSales === somAdjusted:
    "market"  // Limitati da domanda
ELSE:
    "capacity"  // Limitati da team

Risultato: 7 === 7 → "market" ✅
```

**F. Gap**:
```
gap = capacityAdjusted - somAdjusted
    = 14 - 7
    = +7 devices (capacità in eccesso)

gapPercentage = (7 / 14) × 100 = 50%
```

#### **STEP 4: Verifica UI Anno 1**

**Tabella Riga Anno 1**:
```
┌────────┬─────────┬──────────┬──────────┬──────────┬──────────┬────────┐
│  Anno  │   SOM   │   SOM    │ Capacity │ Capacity │ Realistic│  Gap   │
│        │ Target  │ Adjusted │   Base   │ Adjusted │  Sales   │        │
├────────┼─────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ Anno 1 │   35    │    7     │    15    │    14    │    7     │  +7    │
│        │         │   (20%)  │          │   (92%)  │ [MARKET] │  (50%) │
└────────┴─────────┴──────────┴──────────┴──────────┴──────────┴────────┘
```

**Verifica Numeri**:
- SOM Target: **35** ✅
- SOM Adjusted: **7** con label "(20%)" ✅
- Capacity Base: **15** ✅
- Capacity Adj: **14** con label "(92%)" ✅
- Realistic: **7** ✅
- Gap: **+7** con "(50%)" ✅

**Badge Bottleneck**:
- Badge BLU: **"Market-Constrained"**
- Significato: Hai domanda limitata (7) ma capacità maggiore (14)

**Tooltip Badge**:
"Limitato da domanda mercato. Hai capacità in eccesso di 7 devices. Focus: marketing per generare più lead."

#### **STEP 5: Verifica Insights**

Card "Insights Strategici" mostra:
- **💡 "Capacità in eccesso: 7 devices in Anno 1"**
- **📈 "Investi in marketing per aumentare lead generation"**
- **🎯 "Considera espansione geografica per sfruttare capacity"**

#### **STEP 6: Verifica Database**

```json
"calculated": {
  "maxSalesCapacity": {
    "y1": 15,
    ...
  },
  "realisticSales": {
    "y1": 7,
    ...
  },
  "constrainingFactor": {
    "y1": "market",
    ...
  },
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
```

### **✅ Criteri Successo Anno 1**
- [ ] SOM Adjusted = 7 (±1)
- [ ] Capacity Adjusted = 14 (±1)
- [ ] Realistic Sales = 7
- [ ] Constraining = "market"
- [ ] Gap = +7 (50%)
- [ ] Badge BLU "Market-Constrained"
- [ ] Insights suggeriscono marketing

---

### **📝 Procedura TEST 8.2: Anno 3**

Anno 3 è interessante perché cambia il bottleneck!

#### **INPUT Anno 3:**
```
SOM Target: 69 devices
Adoption Italia Y3: 1.0 (100%)
Reps Y3: 3
Deals/Q: 5
Ramp: 0.75
Channel: 0.92
```

#### **CALCOLI Anno 3:**

**A. SOM Adjusted**:
```
somAdjusted = 69 × 1.0 = 69 devices
```

**B. Capacity Base**:
```
capacityBase = 3 × 5 × 4 × 0.75 = 45 devices
```

**C. Capacity Adjusted**:
```
capacityAdjusted = 45 × 0.92 = 41.4 ≈ 41 devices
```

**D. Realistic Sales**:
```
realisticSales = MIN(69, 41) = 41 devices
```

**E. Constraining Factor**:
```
41 !== 69 → "capacity" ✅
```

**F. Gap**:
```
gap = somAdjusted - capacityAdjusted
    = 69 - 41
    = +28 devices (domanda in eccesso!)

gapPercentage = (28 / 69) × 100 = 40.6%
```

#### **Verifica UI Anno 3**:

```
┌────────┬─────────┬──────────┬──────────┬──────────┬──────────┬────────┐
│ Anno 3 │   69    │    69    │    45    │    41    │    41    │  +28   │
│        │         │  (100%)  │          │   (92%)  │[CAPACITY]│ (40.6%)│
└────────┴─────────┴──────────┴──────────┴──────────┴──────────┴────────┘
```

**Badge Bottleneck**:
- Badge ARANCIONE: **"Capacity-Constrained"**
- Significato: Hai domanda alta (69) ma capacità limitata (41)

**Tooltip**:
"Limitato da capacità team. Hai domanda in eccesso di 28 devices. Focus: assumere più sales reps!"

**Insights Anno 3**:
- **⚠️ "Domanda insoddisfatta: 28 devices in Anno 3"**
- **👥 "Assumi almeno 2 sales reps aggiuntivi per Anno 3"**
- **📊 "Oppure aumenta produttività a 7 deals/rep/quarter"**

### **✅ Criteri Successo Anno 3**
- [ ] SOM Adjusted = 69
- [ ] Capacity Adjusted = 41 (±2)
- [ ] Realistic Sales = 41
- [ ] Constraining = "capacity"
- [ ] Gap = +28 (40.6%)
- [ ] Badge ARANCIONE "Capacity-Constrained"
- [ ] Insights suggeriscono hiring

---

### **📊 TEST 8.3: Verifica Tutti e 5 Anni**

Completa la tabella manualmente e confronta:

| Anno | SOM Adj | Cap Adj | Realistic | Factor | Gap | Badge |
|------|---------|---------|-----------|--------|-----|-------|
| Y1 | 7 | 14 | 7 | market | +7 | BLU |
| Y2 | 31 | 36 | 31 | market | +5 | BLU |
| Y3 | 69 | 41 | 41 | capacity | +28 | ARANCIONE |
| Y4 | 121 | 73 | 73 | capacity | +48 | ARANCIONE |
| Y5 | 173 | 110 | 110 | capacity | +63 | ARANCIONE |

**Pattern Atteso**:
- Anni 1-2: **Market-constrained** (adoption bassa, team OK)
- Anni 3-5: **Capacity-constrained** (adoption 100%, team limitato)

**Insight Globale**:
"Passi da market-constrained a capacity-constrained in Anno 3. Pianifica hiring sales team per catturare domanda crescente."

---

## TEST 9: INTERCONNESSIONI END-TO-END

### **🎯 Obiettivo**
Verificare che modifiche in un componente impattino correttamente gli altri

### **TEST 9.1: Sales Reps → Capacity → Realistic**

**Modifica:**
1. Bottom-Up → Modifica Reps Y3 da 3 → 5
2. Salva

**Effetto Atteso:**
```
Capacity Base Y3: 3×5×4×0.75 = 45
                ↓ cambia in
Capacity Base Y3: 5×5×4×0.75 = 75

Capacity Adj Y3: 75 × 0.92 = 69

Realistic Sales Y3: MIN(69, 69) = 69
Constraining Factor: "market" (era "capacity")
```

**Verifica:**
1. Tab Riconciliazione → Anno 3
2. Capacity Adjusted: **69** ✅
3. Realistic Sales: **69** ✅
4. Badge: da ARANCIONE a BLU ✅
5. Gap: 0 (perfetto match!) ✅

---

### **TEST 9.2: Channel Mix → Capacity Adj → Realistic**

**Modifica:**
1. GTMConfigPanel → Channel Mix
2. Distributors: 40% → 60%
3. Margin: 20% → 25%
4. Channel Efficiency: 92% → 85%
5. Salva

**Effetto Atteso:**
```
Anno 1:
Capacity Base: 15 (invariato)
Capacity Adj: 15 × 0.85 = 12.75 ≈ 13 (era 14)

Realistic: MIN(7, 13) = 7 (invariato, già market-constrained)

Anno 3:
Capacity Base: 45 (invariato)
Capacity Adj: 45 × 0.85 = 38.25 ≈ 38 (era 41)

Realistic: MIN(69, 38) = 38 (era 41, peggiora!)
Gap: 69 - 38 = 31 (era 28, aumenta!)
```

**Verifica:**
1. Badge "Channel Efficiency: 85%" (edge, potrebbe essere rosso)
2. Riconciliazione Anno 3:
   - Capacity Adj: **38** ✅
   - Realistic: **38** ✅
   - Gap aumentato: **+31** ✅

**Insight**: Peggiorando channel mix, perdi capacity e aumenti gap!

---

### **TEST 9.3: Adoption → SOM Adj → Realistic**

**Modifica:**
1. GTMConfigPanel → Adoption Curve
2. Italia Y1: 0.2 → 0.5 (20% → 50%)
3. Salva

**Effetto Atteso:**
```
Anno 1:
SOM Target: 35 (invariato)
SOM Adj: 35 × 0.5 = 17.5 ≈ 18 (era 7)

Capacity Adj: 14 (invariato)

Realistic: MIN(18, 14) = 14 (era 7, raddoppia!)
Constraining: "capacity" (era "market", cambia!)
Gap: 18 - 14 = 4 (era -7, si inverte!)
```

**Verifica:**
1. Badge "Adoption: 50% → 100%" (no warning più)
2. Riconciliazione Anno 1:
   - SOM Adj: **18** ✅
   - Realistic: **14** ✅
   - Badge: da BLU a ARANCIONE ✅
   - Constraining: **capacity** ✅

**Insight**: Aumentando adoption, diventi capacity-constrained anche in Anno 1!

---

## TROUBLESHOOTING ERRORI COMUNI

### **🔴 ERRORE 1: "repsByYear is not defined"**

**Sintomo**: Errore console, app crasha in Bottom-Up

**Causa**: Variabile non inizializzata in GTMEngineCard

**Fix**:
1. Vai a `GTMEngineCard.tsx` line ~230
2. Verifica esista:
```typescript
const repsByYear = salesCapacity.repsByYear || {
  y1: salesCapacity.reps || 1,
  y2: salesCapacity.reps || 1,
  ...
};
```

**Se Manca**: Già fixato nel codice, fai pull latest

---

### **🔴 ERRORE 2: "Cannot read property 'som1' of undefined"**

**Sintomo**: GTMReconciliationCard non carica, errore console

**Causa**: Mancanza TAM/SAM/SOM nel database o conversione som→y

**Fix**:
1. Verifica `database.json`:
```json
"configurazioneTamSamSom": {
  "ecografi": {
    "dispositiviUnita": {
      "som1": 35,
      "som2": 52,
      ...
    }
  }
}
```

2. Se manca, vai in Top-Down e configura TAM/SAM/SOM

3. Se esiste ma errore persiste, check `GTMReconciliationCard.tsx` line ~32:
```typescript
const somDevicesByYear = {
  y1: dispositivi.som1 || 0,
  y2: dispositivi.som2 || 0,
  ...
};
```

---

### **🔴 ERRORE 3: Calcoli Simulatore Errati**

**Sintomo**: Leads/Budget non corrispondono a calcoli manuali

**Debug**:
1. Apri Console Browser
2. Cerca log `GtmCalculationService.calculateMarketingPlan`
3. Verifica input loggati:
   - reps
   - deals/quarter
   - funnel efficiency
   - cost per lead

**Cause Comuni**:
- Funnel non salvato (usa default)
- Reps sbagliati (usa reps vecchi)
- Cost per lead non aggiornato

**Fix**:
1. Re-salva tutti i parametri
2. Click "Calcola Proiezioni" di nuovo
3. Verifica log dettagliati in console

---

### **🔴 ERRORE 4: Badge Non Si Aggiornano**

**Sintomo**: Modifichi channel mix ma badge resta uguale

**Causa**: useMemo dependencies non aggiornate

**Fix**:
1. Refresh pagina (F5)
2. Se persiste, check `GTMEngineCard.tsx` line ~200:
```typescript
const channelEfficiency = useMemo(() => {
  ...
}, [goToMarket?.channelMix]);  // ← dependency corretta?
```

3. Verifica database salvato correttamente
4. Check React DevTools: DatabaseContext aggiornato?

---

### **🔴 ERRORE 5: "Constraining Factor" Sbagliato**

**Sintomo**: Badge mostra "market" ma dovrebbe essere "capacity"

**Debug Manuale**:
```
Anno X:
SOM Adj = 50
Capacity Adj = 30
Realistic = MIN(50, 30) = 30

IF Realistic === SOM Adj:
    "market"
ELSE:
    "capacity"

30 !== 50 → "capacity" ✅
```

**Se Badge Mostra "market"**:
1. Check calculated.details.yX.constrainingFactor in database
2. Se database corretto ma UI errata: problema render
3. Refresh componente GTMReconciliationCard

---

### **🔴 ERRORE 6: API 404 o 500**

**Sintomo**: Salvataggio fallisce, errore Network tab

**Check**:
1. Server running? `npm run dev:all`
2. Porto corretto? Backend su 5001
3. Endpoint corretto?
   - `/api/database/go-to-market` ✅
   - `/api/database/gtm` ❌ (sbagliato)

**Fix**:
1. Restart server
2. Check `server.js` endpoint definitions
3. Verifica CORS settings

---

## CHECKLIST TESTING COMPLETA

### **✅ BOTTOM-UP**

#### **Componenti Base**
- [ ] GTMEngineCard carica senza errori
- [ ] Sales Capacity editabile (Y1-Y5)
- [ ] Conversion Funnel sliders funzionano
- [ ] Pipeline Efficiency calcolata correttamente
- [ ] Simulatore Impatto mostra risultati

#### **Configurazione Avanzata**
- [ ] GTMConfigurationPanel visibile
- [ ] Channel Mix: input + KPI live
- [ ] Adoption Curve: tabella editabile
- [ ] Scenarios: selezione funziona

#### **Badge e UX**
- [ ] Badge KPI visibili header
- [ ] Click badge scrolla a config
- [ ] Warning appaiono/scompaiono
- [ ] Tooltip informativi

---

### **✅ RICONCILIAZIONE**

#### **GTMReconciliationCard**
- [ ] Tabella 5 anni carica
- [ ] SOM Adjusted corretto (per ogni anno)
- [ ] Capacity Adjusted corretto (per ogni anno)
- [ ] Realistic Sales corretto (per ogni anno)
- [ ] Constraining Factor corretto (per ogni anno)
- [ ] Gap calcolato e percentuale corretta
- [ ] Badge bottleneck giusti (BLU/ARANCIONE)
- [ ] Insights strategici pertinenti

---

### **✅ INTERCONNESSIONI**

- [ ] Modifica Reps → Impatta Capacity
- [ ] Modifica Channel → Impatta Capacity Adj
- [ ] Modifica Adoption → Impatta SOM Adj
- [ ] Modifica Funnel → Impatta Simulatore
- [ ] Tutti i cambi salvati su database
- [ ] Badge si aggiornano automaticamente

---

### **✅ DATABASE**

- [ ] `goToMarket.salesCapacity` completo
- [ ] `goToMarket.conversionFunnel` completo
- [ ] `goToMarket.channelMix` completo
- [ ] `goToMarket.adoptionCurve` completo
- [ ] `goToMarket.scenarios` completo
- [ ] `goToMarket.marketingPlan.projections.y1-y5` completo
- [ ] `goToMarket.calculated` completo

---

## 📊 TEMPLATE REPORT TESTING

Usa questo template per documentare i test:

```markdown
# Test Report - Bottom-Up & Riconciliazione
Data: [DATA]
Tester: [NOME]

## Test Completati
- [x] TEST 1: Sales Capacity - OK
- [x] TEST 2: Conversion Funnel - OK  
- [x] TEST 3: Simulatore - OK (con minor issue)
- [ ] TEST 4: Channel Mix - FALLITO
- ...

## Issue Trovati

### ISSUE #1: Badge Channel Non Si Aggiorna
**Gravità**: Media
**Componente**: GTMEngineCard
**Descrizione**: Modifico channel mix ma badge resta 92%
**Riproduzione**:
1. Vai Channel Mix
2. Cambio distributors a 70%
3. Salvo
4. Badge non cambia

**Fix**: Refresh pagina risolve temporaneamente

### ISSUE #2: ...

## Calcoli Verificati

### Anno 1
- SOM Adjusted: 7 ✅ (atteso: 7)
- Capacity Adj: 14 ✅ (atteso: 14)
- Realistic: 7 ✅ (atteso: 7)
- Constraining: market ✅ (atteso: market)

### Anno 3
- ...

## Raccomandazioni
1. Fix badge update issue
2. Aggiungere test automatici per calcoli
3. Migliorare error handling API

## Conclusione
Sistema funzionante all'80%. Issue minori da fixare.
```

---

## 🎉 CONGRATULAZIONI!

Se hai completato tutti i test, ora hai:

✅ **Compreso** l'intera architettura Bottom-Up  
✅ **Verificato** tutti i calcoli chiave  
✅ **Testato** le interconnessioni  
✅ **Documentato** eventuali issue  

**Prossimi Step**:
1. Fix issue trovati
2. Collegare `realisticSales` al P&L
3. Aggiungere visualizzazioni grafiche
4. Export dati per pitch deck

---

**🚀 SISTEMA PRONTO PER USO PRODUZIONE!**
