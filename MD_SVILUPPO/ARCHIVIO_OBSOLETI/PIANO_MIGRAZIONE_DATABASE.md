# 📋 PIANO MIGRAZIONE DATI → database.json

## ✅ COMPLETATO

### 1. Mercato Ecografie ✓
**File:** `database.json`  
**Struttura:**
```json
{
  "mercatoEcografie": {
    "italia": {
      "annoRiferimento": 2024,
      "percentualeExtraSSN": 30,
      "prestazioni": [
        {
          "codice": "88.71.4",
          "nome": "DIAGNOSTICA ECOGRAFICA DEL CAPO E DEL COLLO",
          "U": 6499,
          "B": 102381,
          "D": 388559,
          "P": 562362,
          "percentualeExtraSSN": 50,
          "aggredibile": true,
          "note": "Prestazione target per Eco3D"
        }
      ]
    }
  }
}
```

**Status:** ✅ COMPLETO
- Componente `MercatoEcografie.tsx` usa database.json
- API backend funzionanti (toggle, percentuale, update)
- NO più dipendenza da Excel

---

## 🎯 PROSSIMI DATI DA MIGRARE

### 2. Parametri Business Plan
**Dove:** Attualmente sparsi nei componenti React  
**Cosa includere:**

#### 2.1 Scenario Configuration
```json
{
  "scenari": {
    "prudente": {
      "nome": "Scenario Prudente",
      "descrizione": "Ipotesi conservative",
      "parametri": {
        "leadsMensili": 50,
        "l2d": 0.30,
        "d2p": 0.40,
        "p2deal": 0.50,
        "churnAnnual": 0.25,
        "arpa": 12000,
        "devicePrice": 15000,
        "capexShare": 0.70
      }
    },
    "base": {
      "nome": "Scenario Base",
      "descrizione": "Ipotesi realistiche",
      "parametri": {
        "leadsMensili": 100,
        "l2d": 0.40,
        "d2p": 0.50,
        "p2deal": 0.60,
        "churnAnnual": 0.20,
        "arpa": 15000,
        "devicePrice": 15000,
        "capexShare": 0.70
      }
    },
    "ambizioso": {
      "nome": "Scenario Ambizioso",
      "descrizione": "Ipotesi ottimistiche",
      "parametri": {
        "leadsMensili": 200,
        "l2d": 0.50,
        "d2p": 0.60,
        "p2deal": 0.70,
        "churnAnnual": 0.15,
        "arpa": 18000,
        "devicePrice": 15000,
        "capexShare": 0.70
      }
    }
  },
  "scenarioDefault": "base"
}
```

#### 2.2 Cost Structure (COGS & OPEX)
```json
{
  "costiStruttura": {
    "cogs": {
      "saas": {
        "cloudHosting": 500,
        "cloudPerAccount": 50,
        "supportoTecnico": 200,
        "note": "Costi mensili per account"
      },
      "hardware": {
        "costoDispositivo": 8000,
        "margineTarget": 0.47,
        "note": "Applicato solo su capexShare"
      }
    },
    "opex": {
      "personale": {
        "rnd": 15000,
        "sales": 12000,
        "marketing": 8000,
        "operations": 6000,
        "admin": 4000
      },
      "infrastruttura": {
        "ufficio": 3000,
        "software": 2000,
        "altro": 1000
      },
      "marketing": {
        "campaignsBudget": 5000,
        "eventsConferences": 2000
      }
    }
  }
}
```

#### 2.3 Market Data (SAM/SOM)
```json
{
  "mercato": {
    "sam": {
      "italia": {
        "totaleScansioni": 5000000,
        "anno": 2024,
        "note": "Da Eco_ITA_MASTER.xlsx"
      }
    },
    "som": {
      "targetPenetration": 0.05,
      "timeframe": "5 anni",
      "note": "Obiettivo 5% del mercato aggredibile"
    },
    "prezziMercato": {
      "arpaMin": 10000,
      "arpaMax": 20000,
      "arpaTarget": 15000,
      "devicePriceRange": [12000, 18000]
    }
  }
}
```

#### 2.4 Financial Assumptions
```json
{
  "assumzioniFinanziarie": {
    "valutazione": {
      "terminalValueMultiple": 5,
      "discountRate": 0.12,
      "note": "Per calcolo NPV/IRR"
    },
    "payback": {
      "targetMonths": 18,
      "note": "CAC payback period target"
    },
    "margini": {
      "targetGrossMargin": 0.70,
      "targetEbitdaMargin": 0.30
    },
    "breakeven": {
      "targetMonth": 24,
      "note": "Mesi per raggiungere EBITDA positivo"
    }
  }
}
```

#### 2.5 Timeline & Milestones
```json
{
  "roadmap": {
    "fasi": [
      {
        "fase": "MVP",
        "mese": 1,
        "milestone": "Lancio prodotto",
        "investimento": 50000
      },
      {
        "fase": "Growth",
        "mese": 12,
        "milestone": "100 clienti",
        "investimento": 100000
      },
      {
        "fase": "Scale",
        "mese": 24,
        "milestone": "Break-even",
        "investimento": 150000
      }
    ]
  }
}
```

---

## 📐 STRUTTURA FINALE database.json

```json
{
  "version": "2.0.0",
  "lastUpdate": "2025-01-06",
  "description": "Database centralizzato Eco 3D - Tutti i parametri del business plan",
  
  "mercatoEcografie": { /* ... GIÀ IMPLEMENTATO ... */ },
  
  "scenari": { /* ... DA IMPLEMENTARE ... */ },
  
  "costiStruttura": { /* ... DA IMPLEMENTARE ... */ },
  
  "mercato": { /* ... DA IMPLEMENTARE ... */ },
  
  "assumzioniFinanziarie": { /* ... DA IMPLEMENTARE ... */ },
  
  "roadmap": { /* ... DA IMPLEMENTARE ... */ },
  
  "metadata": {
    "autore": "Eco 3D Team",
    "ultimaModifica": "2025-01-06T12:00:00Z",
    "versioni": [
      {
        "version": "1.0.0",
        "data": "2025-01-05",
        "note": "Mercato ecografie"
      },
      {
        "version": "2.0.0",
        "data": "2025-01-06",
        "note": "Parametri business plan completi"
      }
    ]
  }
}
```

---

## 🔧 IMPLEMENTAZIONE STEP-BY-STEP

### Fase 1: Preparazione Database (1-2 ore)
1. ✅ Backup attuale database.json
2. ⬜ Aggiungere sezione `scenari`
3. ⬜ Aggiungere sezione `costiStruttura`
4. ⬜ Aggiungere sezione `mercato`
5. ⬜ Aggiungere sezione `assumzioniFinanziarie`
6. ⬜ Validare JSON schema

### Fase 2: API Backend (2-3 ore)
1. ⬜ Endpoint GET `/api/scenari`
2. ⬜ Endpoint PUT `/api/scenari/:nome`
3. ⬜ Endpoint GET `/api/costi`
4. ⬜ Endpoint PUT `/api/costi`
5. ⬜ Endpoint GET `/api/mercato`
6. ⬜ Test API con Postman/curl

### Fase 3: Context Providers (3-4 ore)
1. ⬜ `ScenariProvider.tsx` - gestisce scenari
2. ⬜ `CostiProvider.tsx` - gestisce costi
3. ⬜ `MercatoProvider.tsx` - gestisce dati mercato (SAM/SOM)
4. ⬜ Unificare tutto in `BusinessPlanProvider.tsx`?

### Fase 4: Componenti UI (4-6 ore)
1. ⬜ Aggiornare componenti esistenti per usare Provider
2. ⬜ Rimuovere hardcoded values
3. ⬜ Aggiungere UI per modificare parametri
4. ⬜ Test sincronizzazione end-to-end

### Fase 5: Validazione & Testing (2-3 ore)
1. ⬜ Test modifiche persistono in database.json
2. ⬜ Test Git tracking funziona
3. ⬜ Test calcoli finanziari corretti
4. ⬜ Documentazione aggiornata

---

## 🎯 BENEFICI

### Ora (con Mercato Ecografie)
- ✅ 15 prestazioni configurabili
- ✅ Persistenza su file
- ✅ Git-friendly
- ✅ API backend

### Dopo (con tutti i parametri)
- 🎯 **Unica fonte di verità** per tutto il BP
- 🎯 **Modifiche trackable** in Git
- 🎯 **Multi-user** pronto
- 🎯 **Import/Export** facile
- 🎯 **Versioning** automatico
- 🎯 **No hardcoded values**
- 🎯 **Simulazioni** più facili

---

## 📊 PRIORITÀ

### Must Have (Fase 1)
1. ✅ Mercato Ecografie
2. ⬜ Scenari (Base/Prudente/Ambizioso)
3. ⬜ Costi (COGS + OPEX)

### Should Have (Fase 2)
4. ⬜ Mercato (SAM/SOM)
5. ⬜ Assunzioni finanziarie

### Nice to Have (Fase 3)
6. ⬜ Roadmap/Milestones
7. ⬜ Team configuration
8. ⬜ Investment rounds

---

## 🚀 NEXT STEPS

1. **Decidere priorità**: Quali dati migrare per primi?
2. **Struttura JSON**: Validare struttura proposta
3. **API design**: Quali endpoint servono?
4. **UI design**: Dove inserire controlli per modificare parametri?

**Vuoi procedere con Scenari (Fase 1)? 🎯**
