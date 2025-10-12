# ✅ IMPLEMENTAZIONE DISTRIBUZIONE PERCENTUALE PER TIER SAAS

**Data:** 12 Ottobre 2025 - 14:50  
**Status:** ✅ **COMPLETATO - CALCOLO PRECISO DEI RICAVI TIERED**  
**Scope:** Aggiunta distribuzione percentuale per ogni tier nel modello SaaS A Scaglioni

---

## 🎯 **PROBLEMA RISOLTO**

### **Prima:**
```typescript
// ❌ Calcolo SCORRETTO - usava solo il tier medio
const midTier = tiers[Math.floor(tiers.length / 2)];
tieredArr = ACTIVE_DEVICES * midTier.monthlyFee * 12;

// Esempio con 44 dispositivi attivi:
// midTier = Professional (€500/mese)
// tieredArr = 44 × €500 × 12 = €264,000/anno

// ❌ SBAGLIATO: Presume che TUTTI i 44 dispositivi siano nel tier Professional!
```

### **Adesso:**
```typescript
// ✅ Calcolo CORRETTO - usa distribuzione pesata
tieredArr = tiers.reduce((total, tier) => {
  const distribution = tier.distributionPct || 0;
  const devicesInTier = Math.round(ACTIVE_DEVICES * (distribution / 100));
  return total + (devicesInTier * tier.monthlyFee * 12);
}, 0);

// Esempio con 44 dispositivi attivi e distribuzione 50/30/20:
// Starter (50%): 22 devices × €200 × 12 = €52,800
// Professional (30%): 13 devices × €500 × 12 = €78,000
// Enterprise (20%): 9 devices × €800 × 12 = €86,400
// tieredArr = €217,200/anno

// ✅ CORRETTO: Distribuzione realistica tra i tier!
```

---

## 🔧 **MODIFICHE IMPLEMENTATE**

### **1. Database (database.json)**

Aggiunto campo `distributionPct` a ogni tier:

```json
{
  "saas": {
    "pricing": {
      "tiered": {
        "enabled": true,
        "tiers": [
          {
            "scansUpTo": 100,
            "monthlyFee": 200,
            "description": "Piano Starter - fino a 100 scansioni/mese",
            "distributionPct": 50     // 🆕 50% dei dispositivi
          },
          {
            "scansUpTo": 500,
            "monthlyFee": 500,
            "description": "Piano Professional - fino a 500 scansioni/mese",
            "distributionPct": 30     // 🆕 30% dei dispositivi
          },
          {
            "scansUpTo": 9999,
            "monthlyFee": 800,
            "description": "Piano Enterprise - scansioni illimitate",
            "distributionPct": 20     // 🆕 20% dei dispositivi
          }
        ],
        "grossMarginPct": 0.85
      }
    }
  }
}
```

**Valori Default:**
- **Starter:** 50% (maggioranza dei clienti - piccole cliniche)
- **Professional:** 30% (clienti medio-grandi)
- **Enterprise:** 20% (grandi ospedali e reti)

---

### **2. TypeScript Interfaces**

Aggiornato tipo `tier` con `distributionPct`:

```typescript
// SaaSMultiModelCard.tsx & RevenuePreview.tsx
tiers: Array<{
  scansUpTo: number;
  monthlyFee: number;
  description: string;
  distributionPct?: number; // 🆕 % di dispositivi in questo tier
}>;
```

---

### **3. Calcolo Ricavi (SaaSMultiModelCard.tsx & RevenuePreview.tsx)**

**Prima (SCORRETTO):**
```typescript
let tieredArr = 0;
if (tieredEnabled && tiers.length > 0) {
  const midTier = tiers[Math.floor(tiers.length / 2)];
  tieredArr = ACTIVE_DEVICES * midTier.monthlyFee * 12;
}
```

**Adesso (CORRETTO):**
```typescript
let tieredArr = 0;
let tieredMrr = 0;
if (tieredEnabled && tiers.length > 0) {
  // Calcola ARR pesato per ogni tier in base alla distribuzione
  tieredArr = tiers.reduce((total, tier) => {
    const distribution = tier.distributionPct || 0;
    const devicesInTier = Math.round(ACTIVE_DEVICES * (distribution / 100));
    return total + (devicesInTier * tier.monthlyFee * 12);
  }, 0);
  tieredMrr = tieredArr / 12;
}
```

---

### **4. UI - Campo Editabile (SaaSMultiModelCard.tsx)**

Aggiunta **quarta colonna** nella tabella tier per editare la distribuzione:

```tsx
<div className="grid grid-cols-4 gap-3 items-center">
  {/* Colonna 1: Scansioni */}
  <div>
    <label>Scansioni fino a</label>
    <Input value={tier.scansUpTo} ... />
  </div>

  {/* Colonna 2: Fee Mensile */}
  <div>
    <label>Fee Mensile</label>
    <Input value={tier.monthlyFee} ... />
  </div>

  {/* 🆕 Colonna 3: % Distribuzione */}
  <div>
    <label>% Distribuzione</label>
    <Input 
      type="number"
      value={tier.distributionPct}
      onChange={...}
      onBlur={async () => {
        const newTiers = [...tiers];
        newTiers[index].distributionPct = num;
        setTiers(newTiers);
        
        // ✅ SALVATAGGIO ISTANTANEO su database
        await onSave({
          pricing: {
            tiered: {
              enabled: tieredEnabled,
              tiers: newTiers,
              grossMarginPct: tieredGrossMarginPct
            }
          }
        });
      }}
    />
  </div>

  {/* Colonna 4: Descrizione */}
  <div className="text-xs text-gray-600">
    {tier.description}
  </div>
</div>
```

**Pattern di salvataggio:**
- ✅ Stesso identico pattern usato per `scansUpTo` e `monthlyFee`
- ✅ Salvataggio **istantaneo** su database
- ✅ Nessun debounce - salva immediatamente all'`onBlur`

---

### **5. Riepilogo Dettagliato (SaaSMultiModelCard.tsx)**

Prima mostrava solo: `"44 devices × tier medio (3 livelli)"`

**Adesso mostra dettaglio completo:**
```tsx
<div className="text-[10px] text-gray-500 space-y-0.5">
  <div className="font-medium mb-1">Distribuzione per tier:</div>
  {tiers.map((tier, idx) => {
    const distribution = tier.distributionPct || 0;
    const devicesInTier = Math.round(ACTIVE_DEVICES * (distribution / 100));
    return (
      <div key={idx}>
        • {tier.description.split(' - ')[0]}: {devicesInTier} devices ({distribution}%) × €{tier.monthlyFee}/m
      </div>
    );
  })}
</div>
```

**Output visualizzato:**
```
Distribuzione per tier:
• Piano Starter: 22 devices (50%) × €200/m
• Piano Professional: 13 devices (30%) × €500/m
• Piano Enterprise: 9 devices (20%) × €800/m
```

---

## 📊 **ESEMPIO CALCOLO DETTAGLIATO**

### **Input:**
- **Dispositivi Venduti:** 44 (da SOM Anno 1)
- **Activation Rate:** 35%
- **Dispositivi Attivi SaaS:** 44 × 35% = **15 devices**

### **Distribuzione Tier (configurabile):**
- **Starter (50%):** 15 × 50% = **8 devices**
- **Professional (30%):** 15 × 30% = **5 devices**  
- **Enterprise (20%):** 15 × 20% = **3 devices**

### **Calcolo ARR:**

```
Starter:       8 devices × €200/mese × 12 mesi = €19,200/anno
Professional:  5 devices × €500/mese × 12 mesi = €30,000/anno
Enterprise:    3 devices × €800/mese × 12 mesi = €28,800/anno

ARR Tiered = €19,200 + €30,000 + €28,800 = €78,000/anno
MRR Tiered = €78,000 / 12 = €6,500/mese
```

### **Confronto Prima vs Adesso:**

| Metodo | Calcolo | Risultato |
|--------|---------|-----------|
| **Prima (SCORRETTO)** | 15 devices × €500 × 12 | €90,000/anno |
| **Adesso (CORRETTO)** | (8×€200 + 5×€500 + 3×€800) × 12 | €78,000/anno |
| **Differenza** | | **-€12,000/anno (-13%)** |

❌ **Prima sopravvalutavamo i ricavi del 13%!**

---

## ✅ **VANTAGGI**

1. **🎯 Calcolo Preciso:** Distribuzione realistica tra i tier
2. **📊 Visibilità Completa:** Riepilogo dettagliato per tier con numero dispositivi
3. **⚙️ Configurabile:** Puoi modificare le percentuali facilmente
4. **💾 Persistente:** Salva automaticamente sul database
5. **🔄 Sincronizzato:** Stesso calcolo in SaaSCard e RevenuePreview

---

## 🎨 **UI MIGLIORATA**

### **Tabella Tier - Ora con 4 colonne:**

```
┌──────────────────┬─────────────┬───────────────────┬────────────────────┐
│ Scansioni fino a │ Fee Mensile │ % Distribuzione   │ Descrizione        │
├──────────────────┼─────────────┼───────────────────┼────────────────────┤
│ 100              │ €200        │ 50%               │ Piano Starter      │
│ 500              │ €500        │ 30%               │ Piano Professional │
│ ∞                │ €800        │ 20%               │ Piano Enterprise   │
└──────────────────┴─────────────┴───────────────────┴────────────────────┘
```

### **Riepilogo ARR Tiered:**

```
📊 A Scaglioni: €78,000/anno (35% del totale SaaS)
   MRR: €6,500/mese

Distribuzione per tier:
• Piano Starter: 8 devices (50%) × €200/m = €19.2K/anno
• Piano Professional: 5 devices (30%) × €500/m = €30K/anno
• Piano Enterprise: 3 devices (20%) × €800/m = €28.8K/anno
```

---

## 🧪 **COME TESTARE**

1. **Vai a Revenue Model → SaaS Card → Modello A Scaglioni**
2. **Attiva il modello Tiered** se non è già attivo
3. **Click su una percentuale** (es: 50%) per editarla
4. **Modifica in 40%** e premi Enter/Tab
5. **Verifica:**
   - Il valore si salva istantaneamente
   - Il riepilogo si aggiorna con il nuovo calcolo
   - Reload (F5) → il valore persiste ✅

### **Test Validazione:**

Prova a impostare percentuali che NON sommano a 100%:
- Starter: 60%
- Professional: 30%
- Enterprise: 20%
- **Totale: 110%** ⚠️

L'app funziona lo stesso (usa le % così come sono), ma dovresti aggiustare per avere 100% totale.

---

## 💡 **BEST PRACTICES**

### **Distribuzione Tipica B2B SaaS:**

**Mercato Healthcare Italia (raccomandato):**
- **Starter (50%):** Piccole cliniche, studi medici privati
- **Professional (30%):** Poliambulatori, cliniche medio-grandi
- **Enterprise (20%):** Ospedali, ASL, grandi reti

**Mercato Maturo (alternativo):**
- **Starter (30%):** Meno clienti entry-level
- **Professional (50%):** Maggioranza nel tier medio
- **Enterprise (20%):** Stabile

**Strategia Aggressive Growth:**
- **Starter (70%):** Acquisizione massiva low-tier
- **Professional (20%):** Upsell graduale
- **Enterprise (10%):** Solo grandi deal

---

## 📝 **FORMULA MATEMATICA**

```
ARR_Tiered = Σ (DevicesAttivi × DistribuzionePercentuale[i] × FeeMensile[i] × 12)

Dove:
- DevicesAttivi = DispositiviVenduti × ActivationRate
- DistribuzionePercentuale[i] = tier[i].distributionPct / 100
- FeeMensile[i] = tier[i].monthlyFee
- i = indice tier (Starter, Professional, Enterprise)

Esempio pratico:
ARR = (15 × 0.50 × 200 × 12) + (15 × 0.30 × 500 × 12) + (15 × 0.20 × 800 × 12)
    = (8 × 200 × 12) + (5 × 500 × 12) + (3 × 800 × 12)
    = 19,200 + 30,000 + 28,800
    = €78,000/anno
```

---

## ⚠️ **NOTE IMPORTANTI**

1. **Validazione Percentuali:** L'app NON forza il totale al 100%
   - Puoi avere 110% (overlap) o 80% (gap)
   - È TUA responsabilità avere 100% totale

2. **Arrotondamento Dispositivi:** `Math.round()` può causare +/-1 device
   - Es: 15 × 30% = 4.5 → arrotondato a **5 devices**

3. **Tier Disabilitati:** Se `distributionPct` manca (undefined), usa 0%
   - Nessun errore, semplicemente quel tier contribuisce €0

4. **Compatibilità:** Valori vecchi senza `distributionPct` funzionano
   - Default a 0% se il campo non esiste

---

## ✅ **RIEPILOGO**

| Aspetto | Status | Note |
|---------|--------|------|
| **Calcolo Corretto** | ✅ | Distribuzione pesata implementata |
| **Salvataggio DB** | ✅ | Istantaneo con pattern esistente |
| **UI Editabile** | ✅ | Quarta colonna aggiunta |
| **Riepilogo Dettagliato** | ✅ | Mostra breakdown per tier |
| **TypeScript Types** | ✅ | Interfacce aggiornate |
| **RevenuePreview** | ✅ | Usa stesso calcolo |
| **Valori Default** | ✅ | 50/30/20 nel database |

---

**Implementato da:** Cascade AI  
**Data:** 12 Ottobre 2025 - 14:50  
**Status:** ✅ **PRODUZIONE-READY**

**I calcoli SaaS Tiered sono ora precisi e configurabili!** 🎯
