# ✅ IMPLEMENTAZIONE DISTRIBUZIONE DISPOSITIVI TRA MODELLI SAAS

**Data:** 12 Ottobre 2025 - 15:10  
**Status:** 🚧 **IN CORSO** - Calcolo e UI in fase di completamento  
**Scope:** Distribuzione pesata dei dispositivi tra i 3 modelli SaaS (Per Dispositivo, Per Scansione, A Scaglioni)

---

## 🎯 **PROBLEMA RISOLTO**

### **Prima (SCORRETTO):**

```typescript
// ❌ Ogni modello usa TUTTI i dispositivi attivi
const ACTIVE_DEVICES = 15;  // Esempio

// Modello Per Dispositivo
const perDeviceArr = 15 × €6,000 = €90,000

// Modello Per Scansione
const perScanArr = (15 × 150 scans/mese × 12) × €1.5 = €40,500

// Modello Tiered
const tieredArr = 15 × €500/mese × 12 = €90,000

// ❌ TOTALE = €90K + €40K + €90K = €220,000
// ❌ MA ABBIAMO CONTATO 3 VOLTE GLI STESSI 15 DISPOSITIVI!
```

### **Adesso (CORRETTO):**

```typescript
// ✅ Distribuzione 40% / 30% / 30%
const ACTIVE_DEVICES = 15;

// Distribuzione tra modelli
const perDeviceDevices = 15 × 40% = 6 dispositivi
const perScanDevices = 15 × 30% = 5 dispositivi  
const tieredDevices = 15 × 30% = 4 dispositivi

// Modello Per Dispositivo (6 dispositivi)
const perDeviceArr = 6 × €6,000 = €36,000

// Modello Per Scansione (5 dispositivi)
const perScanArr = (5 × 150 × 12) × €1.5 = €13,500

// Modello Tiered (4 dispositivi distribuiti tra tier)
const tieredArr = calcolato con distribuzione interna tier

// ✅ TOTALE = €36K + €13.5K + tiered ≈ €80K
// ✅ CORRETTO: ogni dispositivo è contato UNA VOLTA SOLA!
```

---

## 📊 **LOGICA A DUE LIVELLI**

### **Livello 1: Distribuzione TRA Modelli SaaS**

```
ACTIVE_DEVICES (15)
    │
    ├─→ 40% → Per Dispositivo (6 devices)
    ├─→ 30% → Per Scansione (5 devices)
    └─→ 30% → A Scaglioni (4 devices)
```

### **Livello 2: Distribuzione INTERNA al Tiered**

```
Tiered Devices (4)
    │
    ├─→ 50% → Starter (2 devices) × €200/m
    ├─→ 30% → Professional (1 device) × €500/m
    └─→ 20% → Enterprise (1 device) × €800/m
```

---

## 🔧 **MODIFICHE IMPLEMENTATE**

### **1. Database (database.json)**

```json
{
  "saas": {
    "pricing": {
      "perDevice": {
        "enabled": true,
        "modelDistributionPct": 40,  // 🆕 40% dei dispositivi
        "monthlyFee": 500,
        "annualFee": 6000,
        "grossMarginPct": 0.85,
        "activationRate": 0.35
      },
      "perScan": {
        "enabled": true,
        "modelDistributionPct": 30,  // 🆕 30% dei dispositivi
        "feePerScan": 1.5,
        "revSharePct": 0,
        "scansPerDevicePerMonth": 150,
        "grossMarginPct": 0.7
      },
      "tiered": {
        "enabled": true,
        "modelDistributionPct": 30,  // 🆕 30% dei dispositivi
        "tiers": [
          {
            "scansUpTo": 100,
            "monthlyFee": 200,
            "distributionPct": 50  // 50% dei dispositivi TIERED
          },
          {
            "scansUpTo": 500,
            "monthlyFee": 500,
            "distributionPct": 30  // 30% dei dispositivi TIERED
          },
          {
            "scansUpTo": 9999,
            "monthlyFee": 800,
            "distributionPct": 20  // 20% dei dispositivi TIERED
          }
        ],
        "grossMarginPct": 0.85
      }
    }
  }
}
```

---

### **2. TypeScript Interfaces**

```typescript
interface SaaSMultiModelCardProps {
  // Modello Per Dispositivo
  perDeviceEnabled: boolean;
  perDeviceDistributionPct: number; // 🆕 % dispositivi per questo modello
  setPerDeviceDistributionPct: (pct: number) => void;
  monthlyFee: number;
  annualFee: number;
  // ...altri campi
  
  // Modello Per Scansione
  perScanEnabled: boolean;
  perScanDistributionPct: number; // 🆕 % dispositivi per questo modello
  setPerScanDistributionPct: (pct: number) => void;
  feePerScan: number;
  // ...altri campi
  
  // Modello Tiered
  tieredEnabled: boolean;
  tieredDistributionPct: number; // 🆕 % dispositivi per questo modello
  setTieredDistributionPct: (pct: number) => void;
  tiers: Array<{
    scansUpTo: number;
    monthlyFee: number;
    description: string;
    distributionPct?: number; // % INTERNA al modello tiered
  }>;
}
```

---

### **3. Calcolo Ricavi (SaaSMultiModelCard.tsx)**

**Prima (SCORRETTO):**
```typescript
// ❌ Tutti i modelli usano ACTIVE_DEVICES
const perDeviceMrr = perDeviceEnabled ? ACTIVE_DEVICES * monthlyFee : 0;
const totalScansPerMonth = ACTIVE_DEVICES * scansPerDevicePerMonth;
// Modello Tiered usava ACTIVE_DEVICES
```

**Adesso (CORRETTO):**
```typescript
// ✅ DISTRIBUZIONE DISPOSITIVI TRA MODELLI
const perDeviceDevices = Math.round(ACTIVE_DEVICES * (perDeviceDistributionPct / 100));
const perScanDevices = Math.round(ACTIVE_DEVICES * (perScanDistributionPct / 100));
const tieredDevices = Math.round(ACTIVE_DEVICES * (tieredDistributionPct / 100));

// Modello Per Dispositivo - usa solo dispositivi allocati
const perDeviceMrr = perDeviceEnabled ? perDeviceDevices * monthlyFee : 0;
const perDeviceArr = perDeviceEnabled ? perDeviceDevices * annualFee : 0;

// Modello Per Scansione - usa solo dispositivi allocati
const totalScansPerMonth = perScanDevices * scansPerDevicePerMonth;
const perScanGrossRevenue = perScanEnabled ? totalScansPerMonth * 12 * feePerScan : 0;
const perScanNetRevenue = perScanGrossRevenue * (1 - revSharePct);

// Modello Tiered - usa solo dispositivi allocati, poi distribuiti tra tier
let tieredArr = 0;
if (tieredEnabled && tiers.length > 0) {
  tieredArr = tiers.reduce((total, tier) => {
    const tierDistribution = tier.distributionPct || 0;
    const devicesInTier = Math.round(tieredDevices * (tierDistribution / 100));
    return total + (devicesInTier * tier.monthlyFee * 12);
  }, 0);
}
```

---

### **4. UI - Campo Editabile Distribuzione**

Aggiunta una sezione **PRIMA** dei campi di configurazione di ogni modello:

```tsx
{/* 🆕 Distribuzione Percentuale Modello */}
<div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-gray-700">
      % Dispositivi che usano questo modello
    </label>
    <div className="flex items-center gap-2">
      {editingPerDeviceDistribution !== null ? (
        <Input
          type="number"
          value={editingPerDeviceDistribution}
          onChange={(e) => setEditingPerDeviceDistribution(e.target.value)}
          onBlur={async () => {
            const num = parseFloat(editingPerDeviceDistribution);
            if (!isNaN(num) && num >= 0 && num <= 100) {
              setPerDeviceDistributionPct(num);
              
              // ✅ SALVATAGGIO ISTANTANEO
              await onSave({
                pricing: {
                  perDevice: {
                    modelDistributionPct: num
                  }
                }
              });
            }
            setEditingPerDeviceDistribution(null);
          }}
          className="h-8 w-20"
          autoFocus
        />
      ) : (
        <div 
          className="h-8 px-3 py-1 rounded border border-blue-300 hover:border-blue-500 cursor-pointer text-sm font-semibold bg-white flex items-center"
          onClick={() => setEditingPerDeviceDistribution(perDeviceDistributionPct.toString())}
        >
          {perDeviceDistributionPct}%
        </div>
      )}
      <span className="text-xs text-gray-600">
        = {perDeviceDevices} dispositivi
      </span>
    </div>
  </div>
</div>
```

---

### **5. Riepilogo Aggiornato**

Nel riepilogo sopra le card, ora mostra:

```
📱 Distribuzione 15 dispositivi attivi:
   6 Per-Device (40%)  |  5 Per-Scan (30%)  |  4 Tiered (30%)
```

Nelle singole card:

**Per Dispositivo:**
```
6 devices (40%) × €6,000/anno
```

**Per Scansione:**
```
5 devices (30%) → 9,000 scans × €1.5
```

**Tiered:**
```
4 devices (30%) - Distribuz. per tier:
• Starter: 2 devices (50%) × €200/m
• Professional: 1 device (30%) × €500/m
• Enterprise: 1 device (20%) × €800/m
```

---

## 📊 **ESEMPIO CALCOLO COMPLETO**

### **Input:**
- **Dispositivi Venduti:** 44 (SOM Anno 1)
- **Activation Rate:** 35%
- **Dispositivi Attivi:** 44 × 35% = **15 devices**

### **Distribuzione Modelli (40/30/30):**
- **Per Dispositivo:** 15 × 40% = **6 devices**
- **Per Scansione:** 15 × 30% = **5 devices**
- **Tiered:** 15 × 30% = **4 devices**

### **Calcolo Ricavi:**

#### **1. Per Dispositivo (6 devices):**
```
ARR = 6 devices × €6,000/anno = €36,000/anno
MRR = €36,000 / 12 = €3,000/mese
```

#### **2. Per Scansione (5 devices):**
```
Scansioni = 5 devices × 150 scans/mese × 12 mesi = 9,000 scans/anno
ARR = 9,000 × €1.5 = €13,500/anno
MRR = €13,500 / 12 = €1,125/mese
```

#### **3. Tiered (4 devices distribuiti 50/30/20):**
```
Starter:      4 × 50% = 2 devices × €200/m × 12 = €4,800/anno
Professional: 4 × 30% = 1 device  × €500/m × 12 = €6,000/anno
Enterprise:   4 × 20% = 1 device  × €800/m × 12 = €9,600/anno

ARR Tiered = €4,800 + €6,000 + €9,600 = €20,400/anno
MRR Tiered = €20,400 / 12 = €1,700/mese
```

#### **TOTALE SaaS:**
```
ARR Totale = €36,000 + €13,500 + €20,400 = €69,900/anno
MRR Totale = €3,000 + €1,125 + €1,700 = €5,825/mese
```

### **Confronto Prima vs Adesso:**

| Metodo | Calcolo Dispositivi | ARR Totale |
|--------|---------------------|------------|
| **Prima (SCORRETTO)** | 15 + 15 + 15 = 45 conteggi | ~€220,000 |
| **Adesso (CORRETTO)** | 6 + 5 + 4 = 15 conteggi | ~€70,000 |
| **Differenza** | -30 dispositivi duplicati | **-€150K (-68%)** |

❌ **Prima sopravvalutavamo i ricavi SaaS del 214%!**

---

## ✅ **STATUS IMPLEMENTAZIONE**

| Componente | Status | Note |
|------------|--------|------|
| **Database JSON** | ✅ | `modelDistributionPct` aggiunto |
| **TypeScript Types** | ✅ | Interfacce aggiornate |
| **Calcolo Distribuzione** | ✅ | `perDeviceDevices`, `perScanDevices`, `tieredDevices` |
| **Calcolo ARR Corretto** | ✅ | Usa dispositivi allocati per modello |
| **Riepilogo Header** | ✅ | Mostra distribuzione dispositivi |
| **Riepilogo Card** | ✅ | Mostra dispositivi per modello |
| **UI Per Dispositivo** | ✅ | Campo editabile % distribuzione |
| **UI Per Scansione** | 🚧 | DA COMPLETARE |
| **UI Tiered** | 🚧 | DA COMPLETARE |
| **RevenuePreview.tsx** | ⏳ | DA AGGIORNARE |
| **RevenueModelDashboard.tsx** | ⏳ | DA AGGIORNARE (passare props) |

---

## 🚧 **DA COMPLETARE**

### **1. Aggiungere campo % in Per Scansione e Tiered**

Stesso pattern di Per Dispositivo:

```tsx
{/* Tab Per Scansione */}
<div className="p-3 bg-green-100 rounded-lg border border-green-300">
  <label>% Dispositivi che usano questo modello</label>
  <Input ... onBlur={() => onSave({ pricing: { perScan: { modelDistributionPct: num }}})} />
  <span>= {perScanDevices} dispositivi</span>
</div>

{/* Tab Tiered */}
<div className="p-3 bg-orange-100 rounded-lg border border-orange-300">
  <label>% Dispositivi che usano questo modello</label>
  <Input ... onBlur={() => onSave({ pricing: { tiered: { modelDistributionPct: num }}})} />
  <span>= {tieredDevices} dispositivi</span>
</div>
```

### **2. Aggiornare RevenuePreview.tsx**

Applicare stessa logica di distribuzione:

```typescript
const perDeviceDevices = Math.round(ACTIVE_DEVICES * (perDeviceDistributionPct / 100));
const perScanDevices = Math.round(ACTIVE_DEVICES * (perScanDistributionPct / 100));
const tieredDevices = Math.round(ACTIVE_DEVICES * (tieredDistributionPct / 100));

// Usare nelle formule
const perDeviceArr = perDeviceEnabled ? perDeviceDevices * annualFee : 0;
// ...
```

### **3. Passare props in RevenueModelDashboard.tsx**

```tsx
<SaaSMultiModelCard 
  perDeviceDistributionPct={saasPerDeviceDistributionPct}
  setPerDeviceDistributionPct={setSaasPerDeviceDistributionPct}
  perScanDistributionPct={saasPerScanDistributionPct}
  setPerScanDistributionPct={setSaasPerScanDistributionPct}
  tieredDistributionPct={saasTieredDistributionPct}
  setTieredDistributionPct={setSaasTieredDistributionPct}
  // ...
/>
```

---

## 💡 **BEST PRACTICES DISTRIBUZIONE**

### **Mercato B2B Healthcare (raccomandato):**
- **Per Dispositivo (40%):** Clienti con flotte di dispositivi omogenee
- **Per Scansione (30%):** Ospedali con volumi variabili
- **Tiered (30%):** Cliniche che preferiscono piani scalabili

### **Startup Early Stage:**
- **Per Dispositivo (60%):** Focus su canone fisso predicibile
- **Per Scansione (20%):** Clienti pilota pay-as-you-go
- **Tiered (20%):** Upsell premium

### **Mercato Maturo:**
- **Per Dispositivo (30%):** Commodity
- **Per Scansione (40%):** Volume-based
- **Tiered (30%):** Value-based pricing

---

**Implementazione in corso...**  
**Prossimi step:** Completare UI Per Scansione e Tiered, aggiornare RevenuePreview e Dashboard.
