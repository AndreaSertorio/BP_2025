# 🎯 COMPETITOR ANALYSIS - Sample Data Structure

**Data:** 16 Ottobre 2025  
**File:** Esempi struttura dati per database

---

## 📊 SAMPLE COMPETITOR DATA (5 competitors rappresentativi)

Questi 5 competitor rappresentano i diversi tier e categorie:
1. **GE Healthcare** - Tier 1, Major Player, Direct
2. **Butterfly iQ** - Tier 2, Startup Disruptive, Direct  
3. **Siemens ABVS** - Tier 1, Automation Specialist, Direct
4. **Exo Imaging** - Tier 3, Emerging pMUT, High Threat
5. **MRI Portatile** - Substitute Technology

---

## COMPETITOR 1: GE HEALTHCARE (Tier 1 - Major Player)

```json
{
  "id": "comp_001",
  "name": "GE Voluson / Venue / Vscan Air",
  "shortName": "GE Healthcare",
  "tier": "tier1",
  "type": "direct",
  "status": "active",
  "priority": "critical",
  "threatLevel": "high",
  "monitoringPriority": 1,
  "companyInfo": {
    "founded": 1892,
    "employees": 52000,
    "revenue": 19800000000,
    "website": "https://www.gehealthcare.com",
    "logo": "🏥"
  },
  "products": [{
    "name": "Voluson 4D",
    "priceMin": 100000,
    "priceMax": 150000,
    "features": {
      "imaging3D": true,
      "imaging4D": true,
      "aiGuided": true,
      "portable": false,
      "multiProbe": false,
      "automation": "manual"
    }
  }],
  "marketPosition": {
    "marketShare": 25,
    "customerBase": 10000
  },
  "battlecard": {
    "whyWeWin": [
      "Eco 3D €40K vs GE €100K+ (-60%)",
      "Multi-sonda simultanea vs manuale",
      "Multi-distretto vs solo ostetrico",
      "Portabile vs carrellato"
    ],
    "theirStrengths": [
      "Brand globale",
      "4D ostetrico best-in-class"
    ],
    "theirWeaknesses": [
      "Prezzo premium",
      "No portabilità",
      "Single-operator dependent"
    ]
  }
}
```

---

## COMPETITOR 2: BUTTERFLY IQ (Tier 2 - Disruptive Startup)

```json
{
  "id": "comp_022",
  "name": "Butterfly iQ",
  "shortName": "Butterfly Network",
  "tier": "tier2",
  "type": "direct",
  "status": "active",
  "priority": "high",
  "threatLevel": "medium",
  "monitoringPriority": 4,
  "companyInfo": {
    "founded": 2011,
    "employees": 400,
    "funding": {
      "totalRaised": 350000000,
      "lastRound": "IPO"
    }
  },
  "products": [{
    "name": "Butterfly iQ+",
    "priceMin": 2000,
    "priceMax": 3000,
    "features": {
      "imaging3D": false,
      "portable": true,
      "wireless": true,
      "automation": "none"
    }
  }],
  "battlecard": {
    "whyWeWin": [
      "Eco 3D volumetrico vs Butterfly 2D",
      "Diagnostica avanzata vs screening basico",
      "Target cliniche vs primary care"
    ],
    "competitiveResponse": "Target diversi: Eco 3D mid-market quality, Butterfly low-end screening."
  }
}
```

---

## COMPETITOR 3: SIEMENS ABVS (Tier 1 - Automation Specialist)

```json
{
  "id": "comp_003",
  "name": "Siemens Acuson S2000 ABVS",
  "tier": "tier1",
  "type": "direct",
  "threatLevel": "medium",
  "products": [{
    "name": "ABVS Breast Scanner",
    "priceMin": 80000,
    "priceMax": 120000,
    "features": {
      "imaging3D": true,
      "automation": "full"
    },
    "strengths": [
      "Automazione hands-free completa",
      "Standardizzazione workflow"
    ],
    "weaknesses": [
      "Limitato al solo distretto mammario",
      "Non versatile per altri distretti"
    ]
  }],
  "battlecard": {
    "whyWeWin": [
      "Multi-distretto (tutto corpo) vs solo seno",
      "€40K vs €80K+ (-50%)",
      "Portabile vs fisso ingombrante"
    ]
  }
}
```

---

## COMPETITOR 4: EXO IMAGING (Tier 3 - Emerging Threat)

```json
{
  "id": "comp_024",
  "name": "Exo Iris (pMUT)",
  "tier": "tier3",
  "type": "emerging",
  "status": "monitoring",
  "priority": "high",
  "threatLevel": "high",
  "monitoringPriority": 2,
  "companyInfo": {
    "founded": 2015,
    "funding": {
      "totalRaised": 125000000,
      "investors": ["Intel Capital", "Samsung", "GE Healthcare"]
    }
  },
  "products": [{
    "name": "Exo Iris Prototype",
    "features": {
      "imaging3D": true,
      "portable": true,
      "automation": "partial"
    },
    "weaknesses": [
      "Non ancora commerciale",
      "Validazione clinica mancante",
      "FDA/CE da ottenere"
    ]
  }],
  "battlecard": {
    "whyWeWin": [
      "Eco 3D già commerciale e certificato CE",
      "Presenza mercato NOW vs loro TBD 2026+",
      "First-mover advantage"
    ],
    "competitiveResponse": "Exo promette futuro, Eco 3D deliver adesso."
  },
  "notes": "THREAT ALTA se lanciano. Monitorare FDA clearance stretto."
}
```

---

## COMPETITOR 5: MRI PORTATILE (Substitute)

```json
{
  "id": "comp_031",
  "name": "MRI Portatile Hyperfine Swoop",
  "tier": "tier2",
  "type": "substitute",
  "threatLevel": "low",
  "products": [{
    "name": "Swoop Portable MRI",
    "priceMin": 50000,
    "features": {
      "portable": true
    },
    "weaknesses": [
      "Bassa risoluzione (<0.1T)",
      "Tempi scansione lunghi (minuti)",
      "Ingombro schermature"
    ]
  }],
  "battlecard": {
    "whyWeWin": [
      "Tempo acquisizione 1s vs minuti",
      "Real-time 3-5 vol/s vs statico",
      "Zero magneti, zero ingombro"
    ]
  }
}
```

---

## 📊 FRAMEWORKS DATA

### Porter's 5 Forces

```json
{
  "porter5Forces": {
    "competitiveRivalry": {
      "score": 8,
      "description": "Alta rivalità con 10+ major players",
      "factors": [
        "GE, Philips, Siemens dominano",
        "Startup emergenti (Butterfly, Exo)",
        "Innovazione rapida"
      ]
    },
    "threatNewEntrants": {
      "score": 6,
      "description": "Barriere MDR alte ma tech abbassa costi"
    },
    "bargainingPowerBuyers": {
      "score": 7,
      "description": "Alto - budget sanitari limitati"
    }
  }
}
```

### Perceptual Map

```json
{
  "perceptualMap": {
    "axes": {
      "x": { "label": "Prezzo (€)", "min": 0, "max": 150000 },
      "y": { "label": "Automazione (score)", "min": 0, "max": 10 }
    },
    "positions": [
      { "competitorId": "eco3d", "x": 40000, "y": 9 },
      { "competitorId": "comp_001", "x": 125000, "y": 3 },
      { "competitorId": "comp_022", "x": 2500, "y": 1 },
      { "competitorId": "comp_003", "x": 100000, "y": 10 },
      { "competitorId": "comp_024", "x": 5000, "y": 5 }
    ]
  }
}
```

### BCG Matrix

```json
{
  "bcgMatrix": {
    "stars": ["comp_001", "comp_002"],
    "cashCows": ["comp_003"],
    "questionMarks": ["comp_022", "comp_024"],
    "dogs": []
  }
}
```

---

## 🎯 COMPLETE DATA STRUCTURE

Il file completo `competitors-data.json` conterrà:
- **32 competitor** dal CSV originale
- **Frameworks** completi (Porter, BCG, Perceptual Map)
- **Benchmarking** radar scores

---

## 📝 NOTE IMPLEMENTAZIONE

### Priorità Popolamento:
1. ✅ **Tier 1** (8 competitor): GE, Philips, Siemens, Canon, Fujifilm, Mindray, Samsung, Esaote
2. ✅ **Tier 2** (12 competitor): Butterfly, Clarius, EchoNous, Delphinus, QT Imaging, ecc.
3. ✅ **Tier 3 / Emerging** (6): Exo, ROPCA, AdEchoTech, bracci robotici
4. ✅ **Substitute** (6): MRI portatile, CT low-dose, CBCT, EOS 3D

### Script Migrazione CSV:
Creare script Python per parsare `Competitor Eco3D.csv` e generare JSON completo.

---

**File salvato come riferimento per implementazione componenti UI.**
