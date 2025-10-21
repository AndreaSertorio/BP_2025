# 🎯 QUICK REFERENCE - TESTING BOTTOM-UP & RICONCILIAZIONE

**Data**: 13 Ottobre 2025  
**Uso**: Riferimento rapido durante testing

---

## 📚 DOCUMENTI GUIDA

| Documento | Contenuto |
|-----------|-----------|
| **[PARTE 1](./GUIDA_TESTING_BOTTOM_UP_PARTE1.md)** | Mappa componenti, architettura, formule |
| **[PARTE 2](./GUIDA_TESTING_BOTTOM_UP_PARTE2.md)** | Test 1-7 (Bottom-Up) |
| **[PARTE 3](./GUIDA_TESTING_BOTTOM_UP_PARTE3.md)** | Test 8-9 (Riconciliazione), Troubleshooting |

---

## ⚡ FORMULE CHIAVE

### **Capacity Base**
```
Capacity = reps × deals/Q × 4 × rampFactor
rampFactor = (4 - rampUpQuarters) / 4
```

### **Funnel Efficiency**
```
Efficiency = leadToDemo × demoToPilot × pilotToDeal
```

### **Leads Needed**
```
Leads = capacity / funnelEfficiency
```

### **Budget Marketing**
```
Budget = leadsNeeded × costPerLead
```

### **Channel Efficiency**
```
ChannelEff = 1 - (distributors × distributorMargin)
```

### **SOM Adjusted**
```
SOM_Adj = SOM_Target × adoptionRate
```

### **Realistic Sales** ⭐
```
Realistic = MIN(SOM_Adjusted, Capacity_Adjusted)
```

### **Constraining Factor**
```
IF Realistic === SOM_Adj → "market"
ELSE → "capacity"
```

---

## 🧮 ESEMPIO CALCOLO COMPLETO ANNO 1

```
INPUT:
- Reps: 1
- Deals/Q: 5
- Ramp: 1 quarter
- Funnel: 10% × 50% × 60% = 3%
- Channel: 60% direct, 40% dist, 20% margin
- Adoption Italia: 20%
- SOM: 35 devices
- Cost/Lead: €55

STEP-BY-STEP:

1. Ramp Factor = (4-1)/4 = 0.75

2. Capacity Base = 1 × 5 × 4 × 0.75 = 15

3. Channel Eff = 1 - (0.4 × 0.2) = 0.92

4. Capacity Adj = 15 × 0.92 = 14

5. SOM Adj = 35 × 0.2 = 7

6. Realistic = MIN(7, 14) = 7

7. Constraining = "market" (7 === 7)

8. Gap = 14 - 7 = +7 (50%)

SIMULATORE:
9. Leads = 15 / 0.03 = 500
10. Budget = 500 × 55 = €27,500
11. CAC = 27,500 / 15 = €1,833
12. Revenue = 15 × 50,000 = €750,000
```

---

## 🎯 VALORI ATTESI PER SETUP STANDARD

| Anno | Reps | Cap Base | Cap Adj | SOM Adj | Realistic | Factor |
|------|------|----------|---------|---------|-----------|--------|
| Y1 | 1 | 15 | 14 | 7 | 7 | market |
| Y2 | 2 | 30 | 28 | 31 | 28 | capacity |
| Y3 | 3 | 45 | 41 | 69 | 41 | capacity |
| Y4 | 4 | 60 | 55 | 121 | 55 | capacity |
| Y5 | 6 | 90 | 83 | 173 | 83 | capacity |

*(Assumendo: deals/Q=5, ramp=1, channel=92%, adoption IT=[20,60,100,100,100]%)*

---

## 🔍 DOVE TROVARE I DATI

### **Nel Browser**
```
DevTools → Application → IndexedDB → eco3d_database
oppure
DevTools → Console → Digita: localStorage.getItem('eco3d_data')
```

### **Nel Filesystem**
```
/financial-dashboard/src/data/database.json

Sezione: "goToMarket": { ... }
```

### **Chiavi Importanti**
```json
{
  "salesCapacity": {
    "repsByYear": { "y1": 1, "y2": 2, ... }
  },
  "conversionFunnel": {
    "leadToDemo": 0.1,
    "demoToPilot": 0.5,
    "pilotToDeal": 0.6
  },
  "channelMix": {
    "distributors": 0.4,
    "distributorMargin": 0.2
  },
  "adoptionCurve": {
    "italia": { "y1": 0.2, ... }
  },
  "calculated": {
    "realisticSales": { "y1": 7, ... },
    "constrainingFactor": { "y1": "market", ... }
  }
}
```

---

## ⚠️ WARNING THRESHOLD

| Parametro | Threshold | Warning |
|-----------|-----------|---------|
| **Channel Efficiency** | < 85% | ⚠️ Troppo margine distributori |
| **Adoption Italia Y1** | < 50% | ⚠️ Mercato poco penetrato |
| **Funnel Efficiency** | < 2% | ⚠️ Funnel troppo pessimistico |
| **CAC Effettivo** | > €3,000 | ⚠️ CAC troppo alto |

---

## 🚨 ERRORI COMUNI & FIX RAPIDI

| Errore | Fix Rapido |
|--------|------------|
| "repsByYear is not defined" | Refresh pagina |
| Badge non si aggiornano | Refresh + Check database salvato |
| Calcoli simulatore errati | Re-salva funnel + reps |
| API 404/500 | Restart server (`npm run dev:all`) |
| Riconciliazione vuota | Configura TAM/SAM/SOM in Top-Down |
| Gap percentuale strana | Check SOM ≠ 0, Capacity ≠ 0 |

---

## ✅ CHECKLIST RAPIDA

**Prima di Testare**:
- [ ] Server running
- [ ] Browser su http://localhost:3000
- [ ] Console aperta (no errori)
- [ ] Database accessibile

**Test Base**:
- [ ] Sales Reps editabili
- [ ] Funnel sliders funzionano
- [ ] Simulatore calcola
- [ ] Channel Mix salva
- [ ] Adoption Curve salva

**Test Avanzato**:
- [ ] Badge KPI corretti
- [ ] Warning appaiono/scompaiono
- [ ] Riconciliazione 5 anni OK
- [ ] Constraining factor corretto
- [ ] Interconnessioni funzionano

---

## 📊 TEMPLATE TEST RAPIDO

Copia/incolla per ogni anno testato:

```
ANNO X TEST:
- Reps: __
- SOM Adj: __ (calc: SOM × adoption)
- Cap Adj: __ (calc: reps × deals × 4 × ramp × channel)
- Realistic: __ (calc: MIN)
- Factor: __ (market/capacity)
- Gap: __ (calc: |SOM - Cap|)
- ✅/❌
```

---

## 🎯 PRIORITÀ TESTING

### **CRITICAL (Testare per primo)**:
1. Sales Capacity (reps per anno)
2. Conversion Funnel
3. Riconciliazione Anno 1
4. Database persistence

### **HIGH (Importante)**:
5. Simulatore Impatto Business
6. Channel Mix
7. Badge KPI e warning
8. Riconciliazione Anni 2-5

### **MEDIUM (Se hai tempo)**:
9. Adoption Curve altre regioni
10. Scenarios
11. Interconnessioni avanzate
12. Edge cases

---

## 🔗 API ENDPOINTS

```
POST   /api/database/go-to-market
PATCH  /api/database/go-to-market/sales-capacity
PATCH  /api/database/go-to-market/marketing-plan/:year
PATCH  /api/database/go-to-market/calculated
GET    /api/database
```

---

## 💡 TIPS

1. **Testa un anno alla volta** - Non fare tutti e 5 insieme
2. **Verifica database dopo ogni modifica** - Non fidarti solo dell'UI
3. **Usa console log** - Aiuta a capire cosa sta succedendo
4. **Refresh se in dubbio** - Molti problemi si risolvono con F5
5. **Documenta issue** - Prendi screenshot, copia errori console

---

## 📞 DOMANDE FREQUENTI

**Q: Come so se un calcolo è corretto?**  
A: Confronta con calcolo manuale usando formule in Parte 1

**Q: Dove vedo se i dati sono salvati?**  
A: Database.json o Network tab DevTools (cerca status 200)

**Q: Cosa faccio se un test fallisce?**  
A: Vedi sezione Troubleshooting in Parte 3

**Q: Posso modificare valori direttamente nel database?**  
A: Sì per testing, ma poi refresh pagina per ricaricare

**Q: Come testo se realisticSales influenza P&L?**  
A: Per ora manualmente, collegamento automatico da implementare

---

**🚀 BUON TESTING!**
