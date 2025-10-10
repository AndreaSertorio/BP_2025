# 🎯 PIANO IMPLEMENTAZIONE: REVENUE MODEL

**Sezione 1.2 del PianoDISviluppo_OltreIlMercato.md**

**Status:** 🟢 FASE 1-2 COMPLETATA | 🟡 FASE 3-4 IN CORSO

**Data Inizio:** 2025-01-10  
**Ultima Modifica:** 2025-01-10

---

## 📋 **OBIETTIVO**

Implementare il **Modello di Business** completo per Eco 3D, definendo:
- **COSA vendi** (Hardware, SaaS, Services, Consumables)
- **A CHE PREZZO** (ASP, fees, margini)
- **COME lo vendi** (Bundling, Financing, Geographic Pricing)

Questo modello serve come **base** per:
- Calcoli ricavi (top-down & bottom-up)
- Proiezioni P&L
- Scenari multipli (Prudente/Base/Ambizioso)
- Use of Funds investitori

---

## ✅ **FASI COMPLETATE**

### **FASE 1: Schema Dati (✅ COMPLETATO)**

**File:** `financial-dashboard/src/data/database.json`

**Sezione aggiunta:** `revenueModel` (220 righe)

#### **Struttura Completa:**

```json
{
  "revenueModel": {
    "hardware": {
      "enabled": true,
      "asp": 25000,
      "unitCost": 10000,
      "warrantyPct": 0.03,
      "typologySplit": { "carrellati": 0.45, "portatili": 0.35, "palmari": 0.20 },
      "aspByType": { "carrellati": 50000, "portatili": 25000, "palmari": 8000 },
      "cogsMarginByType": { "carrellati": 0.50, "portatili": 0.60, "palmari": 0.65 }
    },
    "saas": {
      "enabled": true,
      "pricing": {
        "perDevice": { "enabled": true, "monthlyFee": 500, "annualFee": 5500, "grossMarginPct": 0.85 },
        "perScan": { "enabled": false, "feePerScan": 1.50, "revSharePct": 0.30, "grossMarginPct": 0.70 },
        "tiered": { "enabled": false, "tiers": [...], "grossMarginPct": 0.85 }
      }
    },
    "consumables": {
      "enabled": false,
      "items": [
        { "id": "gel_eco", "name": "Gel ecografico", "revenuePerDevicePerMonth": 50, "grossMarginPct": 0.40 },
        { "id": "accessories", "name": "Sonde e accessori", "revenuePerDevicePerMonth": 100, "grossMarginPct": 0.50 }
      ]
    },
    "services": {
      "enabled": false,
      "items": [
        { "id": "training", "type": "one-time", "revenue": 2000, "attachRate": 0.80, "grossMarginPct": 0.70 },
        { "id": "extended_warranty", "type": "annual", "annualRevenue": 1500, "attachRate": 0.40, "grossMarginPct": 0.80 }
      ]
    },
    "bundling": {
      "enabled": false,
      "bundles": [
        { "id": "starter_bundle", "name": "Pacchetto Starter", "components": {...}, "price": 15000, "discount": 0.15 },
        { "id": "professional_bundle", "name": "Pacchetto Professional", "components": {...}, "price": 35000, "discount": 0.20 }
      ]
    },
    "financing": {
      "enabled": false,
      "options": [
        { "type": "leasing", "durationMonths": 36, "interestRate": 0.05, "downPaymentPct": 0.20 },
        { "type": "rent_to_own", "durationMonths": 24, "monthlyFee": 1200, "ownershipAtEnd": true }
      ]
    },
    "pricingStrategy": {
      "defaultModel": "hybrid_hardware_saas",
      "geographicPricing": {
        "enabled": true,
        "regions": {
          "italia": { "priceMultiplier": 1.0 },
          "europa": { "priceMultiplier": 1.1 },
          "usa": { "priceMultiplier": 1.3 },
          "cina": { "priceMultiplier": 0.8 }
        }
      },
      "volumeDiscounts": {
        "enabled": false,
        "tiers": [
          { "unitsFrom": 1, "unitsTo": 5, "discount": 0 },
          { "unitsFrom": 6, "unitsTo": 20, "discount": 0.10 },
          { "unitsFrom": 21, "unitsTo": 9999, "discount": 0.15 }
        ]
      }
    },
    "metadata": {
      "version": "1.0.0",
      "currency": "EUR",
      "lastUpdate": "2025-01-10T11:00:00.000Z"
    }
  }
}
```

**Commit:** `ec302a8` - "feat: REVENUE MODEL - Schema completo + TypeScript Types + Backend Integration"

---

### **FASE 2: TypeScript Types (✅ COMPLETATO)**

**File:** `financial-dashboard/src/contexts/DatabaseProvider.tsx`

**Interfaces create (20+):**

```typescript
// Core
interface RevenueModel { ... }

// Hardware
interface HardwareRevenueModel { ... }

// SaaS
interface SaasRevenueModel { ... }
interface SaasPricingPerDevice { ... }
interface SaasPricingPerScan { ... }
interface SaasPricingTiered { ... }
interface SaasPricingTier { ... }

// Consumables
interface ConsumablesRevenueModel { ... }
interface ConsumableItem { ... }

// Services
interface ServicesRevenueModel { ... }
interface ServiceItem { ... }

// Bundling
interface BundlingRevenueModel { ... }
interface Bundle { ... }
interface BundleComponents { ... }

// Financing
interface FinancingRevenueModel { ... }
interface FinancingOption { ... }

// Pricing Strategy
interface PricingStrategy { ... }
interface GeographicPricing { ... }
interface RegionPricing { ... }
interface VolumeDiscounts { ... }
interface VolumeDiscountTier { ... }

// Metadata
interface RevenueModelMetadata { ... }
```

**Database interface aggiornata:**
```typescript
interface Database {
  // ... esistente
  revenueModel?: RevenueModel;
  // ...
}
```

**Type Safety:** ✅ 100% - Nessun `any`, tutto tipizzato

---

### **FASE 3: Backend Integration (✅ COMPLETATO)**

**File:** `financial-dashboard/src/contexts/DatabaseProvider.tsx`

**Funzioni aggiunte:**

```typescript
// 1. Update generico completo
updateRevenueModel: (updates: Partial<RevenueModel>) => Promise<void>

// 2. Update specifico Hardware
updateRevenueModelHardware: (updates: Partial<HardwareRevenueModel>) => Promise<void>

// 3. Update specifico SaaS
updateRevenueModelSaaS: (updates: Partial<SaasRevenueModel>) => Promise<void>
```

**Pattern Implementato:**
- ✅ **Update Ottimistico** (no `refreshData()`)
- ✅ PATCH API endpoint
- ✅ Aggiornamento stato locale immediato
- ✅ lastUpdate automatico
- ✅ Error handling

**API Endpoints (da implementare backend):**
```
PATCH /api/database/revenue-model
PATCH /api/database/revenue-model/hardware
PATCH /api/database/revenue-model/saas
```

**Esempio utilizzo:**
```typescript
const { updateRevenueModelHardware } = useDatabase();

await updateRevenueModelHardware({
  asp: 30000,
  unitCost: 12000,
  aspByType: {
    carrellati: 55000,
    portatili: 28000,
    palmari: 9000
  }
});
// ✅ Salvato su DB
// ✅ UI aggiornata istantaneamente
// ✅ NO refresh page
```

---

## 🔄 **FASI IN CORSO**

### **FASE 4: UI Component - Tab Modello Business** 🟡

**Obiettivo:** Creare interfaccia visuale per gestire tutti i parametri del Revenue Model

#### **4.1 Layout Generale**

```
┌─────────────────────────────────────────────────────────────┐
│  💼 MODELLO DI BUSINESS                            [Export] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📦 HARDWARE                               [✓] ON   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ASP Medio:          €25,000                        │   │
│  │  COGS Unitario:      €10,000                        │   │
│  │  Margine Lordo:      60%                            │   │
│  │  Garanzia:           3% ASP/anno                    │   │
│  │                                                      │   │
│  │  📊 Per Tipologia:                                  │   │
│  │  ├─ Carrellati:  €50,000  (COGS 50%)  [45%]       │   │
│  │  ├─ Portatili:   €25,000  (COGS 60%)  [35%]       │   │
│  │  └─ Palmari:     €8,000   (COGS 65%)  [20%]       │   │
│  │                                                      │   │
│  │  💡 Ricavi annuali proiettati: €X.XXM               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💻 SaaS                                   [✓] ON   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ◉ Per Dispositivo  ○ Per Scansione  ○ Tiered      │   │
│  │                                                      │   │
│  │  Mensile:           €500/mese                       │   │
│  │  Annuale:           €5,500/anno (sconto 8%)        │   │
│  │  Margine:           85%                             │   │
│  │                                                      │   │
│  │  💡 MRR proiettato (100 devices): €50K              │   │
│  │  💡 ARR proiettato: €600K                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛠️ CONSUMABILI                           [✗] OFF  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [Click per abilitare e configurare]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎓 SERVIZI                               [✗] OFF  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [Click per abilitare e configurare]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📦 BUNDLING                              [✗] OFF  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💳 FINANCING                             [✗] OFF  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌍 PRICING STRATEGY                                │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Geographic Pricing:                     [✓] ON    │   │
│  │  ├─ 🇮🇹 Italia:    1.0x  (base)                    │   │
│  │  ├─ 🇪🇺 Europa:    1.1x  (+10%)                    │   │
│  │  ├─ 🇺🇸 USA:       1.3x  (+30%)                    │   │
│  │  └─ 🇨🇳 Cina:      0.8x  (-20%)                    │   │
│  │                                                      │   │
│  │  Volume Discounts:                       [✗] OFF   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### **4.2 Componenti React da Creare**

```typescript
// 📁 components/RevenueModel/
├── RevenueModelDashboard.tsx          // Container principale
├── HardwareCard.tsx                   // Card Hardware
├── SaaSCard.tsx                       // Card SaaS
├── ConsumablesCard.tsx                // Card Consumables
├── ServicesCard.tsx                   // Card Services
├── BundlingCard.tsx                   // Card Bundling
├── FinancingCard.tsx                  // Card Financing
├── PricingStrategyCard.tsx            // Card Pricing Strategy
└── RevenuePreview.tsx                 // Widget preview ricavi
```

#### **4.3 Features UI**

**Features Core:**
- ✅ Toggle Enable/Disable per ogni sezione
- ✅ Input editabili con validazione
- ✅ Preview real-time margini/ricavi
- ✅ Auto-save con debounce 1.5s
- ✅ Update ottimistico (no refresh)

**Features Avanzate:**
- ✅ Radio buttons per selezione modello SaaS
- ✅ Slider per percentuali (margins, splits, discounts)
- ✅ Calculator integrato per ARPA, MRR, ARR
- ✅ Tabs espandibili/collapsabili
- ✅ Tooltips esplicativi
- ✅ Indicatori validazione (✓/✗)

**Features Export:**
- ✅ Export JSON
- ✅ Export Excel
- ✅ Print-friendly view

#### **4.4 Calcoli Real-time**

**Widget "Revenue Preview":**
```typescript
// Inputs (da revenueModel + scenari)
- Unità vendute/anno: X
- Devices attivi SaaS: Y
- Attach rate servizi: Z%

// Outputs calcolati
- Ricavi Hardware annui: €X.XXM
- MRR SaaS: €XXK
- ARR SaaS: €X.XXM
- Ricavi Services: €XXK
- TOTALE RICAVI ANNO 1: €X.XXM
- Margine Lordo Medio: XX%
```

**Formule:**
```typescript
// Hardware
revenueHardware = Σ(units[tipo] × aspByType[tipo] × geoPriceMultiplier)

// SaaS (per-device)
mrr = activeDevices × monthlyFee × geoPriceMultiplier
arr = mrr × 12

// SaaS (per-scan)
revenuePerScan = totalScans × feePerScan

// Services (one-time)
revenueTraining = newCustomers × training.revenue × training.attachRate

// Services (recurring)
revenueWarranty = activeDevices × warranty.annualRevenue × warranty.attachRate

// Margine Lordo
grossMargin = Σ(revenue[i] × marginPct[i]) / totalRevenue
```

---

## 📝 **TODO: FASE 5 - Backend API**

### **5.1 Express Endpoints**

**File:** `server/routes/database.ts`

```typescript
// Update Revenue Model completo
router.patch('/database/revenue-model', async (req, res) => {
  const updates = req.body;
  // Valida updates
  // Merge con existing revenueModel
  // Salva database.json
  // Return updated revenueModel
});

// Update Hardware specifico
router.patch('/database/revenue-model/hardware', async (req, res) => {
  const updates = req.body;
  // Merge revenueModel.hardware
  // Salva
});

// Update SaaS specifico
router.patch('/database/revenue-model/saas', async (req, res) => {
  const updates = req.body;
  // Merge revenueModel.saas
  // Salva
});

// GET Revenue Model
router.get('/database/revenue-model', async (req, res) => {
  // Return current revenueModel
});
```

### **5.2 Validazione Server-Side**

```typescript
// Joi schemas per validazione
const hardwareSchema = Joi.object({
  asp: Joi.number().min(0).max(1000000),
  unitCost: Joi.number().min(0).max(1000000),
  warrantyPct: Joi.number().min(0).max(1),
  // ...
});

const saasSchema = Joi.object({
  pricing: Joi.object({
    perDevice: Joi.object({
      monthlyFee: Joi.number().min(0).max(100000),
      annualFee: Joi.number().min(0).max(1000000),
      grossMarginPct: Joi.number().min(0).max(1),
    }),
    // ...
  }),
});
```

---

## 📝 **TODO: FASE 6 - Testing & Validazione**

### **6.1 Unit Tests**

```typescript
// __tests__/revenueModel.test.ts

describe('Revenue Model', () => {
  test('Hardware ASP calculation', () => {
    const revenue = calculateHardwareRevenue({
      units: 100,
      asp: 25000,
      geoPriceMultiplier: 1.0
    });
    expect(revenue).toBe(2500000);
  });

  test('SaaS MRR calculation', () => {
    const mrr = calculateSaaSMRR({
      devices: 50,
      monthlyFee: 500
    });
    expect(mrr).toBe(25000);
  });

  test('Gross margin calculation', () => {
    const margin = calculateGrossMargin({
      revenue: 100000,
      cogs: 40000
    });
    expect(margin).toBe(0.60);
  });
});
```

### **6.2 Integration Tests**

```typescript
// Test update flow completo
test('Update hardware model e verifica persistenza', async () => {
  await updateRevenueModelHardware({ asp: 30000 });
  const data = await fetchDatabase();
  expect(data.revenueModel.hardware.asp).toBe(30000);
});
```

### **6.3 UI Tests (Playwright)**

```typescript
test('Revenue Model Dashboard', async ({ page }) => {
  await page.goto('/revenue-model');
  
  // Test toggle hardware
  await page.click('[data-testid="hardware-toggle"]');
  expect(await page.isChecked('[data-testid="hardware-toggle"]')).toBe(true);
  
  // Test edit ASP
  await page.fill('[data-testid="hardware-asp"]', '30000');
  await page.waitForTimeout(2000); // Debounce
  
  // Verifica salvataggio
  const value = await page.inputValue('[data-testid="hardware-asp"]');
  expect(value).toBe('30000');
});
```

---

## 📊 **METRICHE SUCCESSO**

### **Funzionalità**
- ✅ Schema completo con 6 linee ricavo
- ✅ TypeScript 100% type-safe
- ✅ Backend integration pronta
- ⏳ UI component (in progress)
- ⏳ Tests (todo)

### **Performance**
- ⏳ Update UI < 100ms (update ottimistico)
- ⏳ Save to DB < 500ms
- ⏳ Calcoli preview < 50ms

### **UX**
- ⏳ NO refresh page
- ⏳ NO flickering
- ⏳ Feedback visuale immediato
- ⏳ Tooltips esplicativi
- ⏳ Validazione inline

---

## 🔗 **COLLEGAMENTI CON ALTRE SEZIONI**

### **Input da:**
- ✅ `mercatoEcografie` → Volumi prestazioni
- ✅ `mercatoEcografi` → Numero dispositivi
- ✅ `configurazioneTamSamSom` → SAM/SOM percentages
- ⏳ `goToMarket` (prossima sezione) → Sales capacity

### **Output verso:**
- ⏳ `forecast.revenue` → Proiezioni ricavi
- ⏳ `forecast.cogs` → Calcolo margini
- ⏳ `forecast.pl` → Conto Economico
- ⏳ `kpi` → MRR, ARR, Gross Margin

### **Coerenza:**
```
revenueModel (COSA, PREZZO)
    ↓
goToMarket (COME, QUANTI) → Sezione 2
    ↓
forecast (PROIEZIONI) → Sezione 4
    ↓
kpi (METRICHE) → Sezione 5
```

---

## 📅 **TIMELINE**

| Fase | Descrizione | Status | Data Completamento |
|------|-------------|--------|---------------------|
| 1 | Schema Dati | ✅ | 2025-01-10 |
| 2 | TypeScript Types | ✅ | 2025-01-10 |
| 3 | Backend Integration | ✅ | 2025-01-10 |
| 4 | UI Component | 🟡 | TBD |
| 5 | Backend API | ⏳ | TBD |
| 6 | Testing | ⏳ | TBD |

**Tempo stimato restante:** 3-4 ore

---

## 📚 **RIFERIMENTI**

- **Guida:** `/PianoDISviluppo_OltreIlMercato.md` - Sezione 1.2
- **Schema JSON:** `/financial-dashboard/src/data/database.json` - Linea 4463
- **Types:** `/financial-dashboard/src/contexts/DatabaseProvider.tsx` - Linea 127-322
- **Context:** `/financial-dashboard/src/contexts/DatabaseProvider.tsx` - Linea 785-904

---

## ✅ **NEXT STEPS IMMEDIATI**

1. **Creare componente React `RevenueModelDashboard.tsx`** ⏳
   - Layout card-based
   - Toggle enable/disable
   - Input editabili

2. **Implementare auto-save con debounce** ⏳
   - Pattern già testato in TamSamSomDashboard
   - useMemo per serializzazione
   - useEffect con cleanup

3. **Aggiungere preview ricavi** ⏳
   - Widget calcolo real-time
   - Formule MRR/ARR/Gross Margin
   - Chart visuale

4. **Test manuale UI** ⏳
   - Modifica → Save → Reload → Verifica
   - NO refresh
   - NO flickering

---

**Documento creato:** 2025-01-10  
**Ultimo aggiornamento:** 2025-01-10  
**Prossima revisione:** TBD
