# ✅ DATABASE REFACTORING - COMPLETATO

**Data**: 14 Ottobre 2025  
**Branch**: database-unification

---

## 🎯 **OBIETTIVI RAGGIUNTI**

### **1. Single Source of Truth (SSOT)** ✅

**Creato** `globalSettings` con parametri condivisi:

```json
{
  "globalSettings": {
    "business": {
      "devicePrice": 50000,
      "deviceType": "carrellato",
      "currency": "EUR",
      "description": "SSOT - usato da TAM/SAM/SOM, GTM, Revenue Model",
      "lastUpdate": "2025-10-14"
    },
    "salesMix": {
      "pubblico": 0.6,
      "privato": 0.3,
      "research": 0.1,
      "description": "Mix vendite per segmento - calcola media pesata Sales Cycle"
    }
  }
}
```

**Benefici**:
- ✅ Device Price modificabile in UN solo punto
- ✅ Sincronizzazione automatica cross-app
- ✅ Sales Mix modificabile per ricalcolare Sales Cycle

---

### **2. Sales Cycle con Media Pesata** ✅

**Aggiornato** `goToMarket.salesCycle`:

```json
{
  "salesCycle": {
    "avgMonths": 6.6,
    "avgMonthsCalculated": true,
    "bySegment": {
      "pubblico": 9,
      "privato": 3,
      "research": 6
    },
    "description": "Media pesata: 60% pubb(9m) + 30% priv(3m) + 10% res(6m) = 6.6m"
  }
}
```

**Formula**:
```
avgMonths = (pubblico × salesMix.pubblico) + 
            (privato × salesMix.privato) + 
            (research × salesMix.research)
          
          = (9 × 0.6) + (3 × 0.3) + (6 × 0.1)
          = 5.4 + 0.9 + 0.6
          = 6.6 mesi
```

---

### **3. Scenari Ridefiniti (Override System)** ✅

**Prima** (confuso):
```json
{
  "scenarios": {
    "current": "alto",
    "basso": { "budget": 50000, "reps": 0, "multiplier": 0.5 }
  }
}
```

**Dopo** (chiaro):
```json
{
  "scenarioCurrent": "base",
  "scenarioComparison": null,
  "scenarios": {
    "base": {
      "name": "Base (Realistico)",
      "overrides": {}  // usa parametri correnti
    },
    "prudente": {
      "name": "Prudente (Conservativo)",
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
    "ottimista": {
      "name": "Ottimista (Aggressivo)",
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

**Come funziona**:
1. **BASE** = working scenario, parametri attuali
2. **PRUDENTE/OTTIMISTA** = what-if scenarios con overrides
3. Utente può confrontare scenari side-by-side
4. "Applica Scenario" → copia overrides in parametri base

---

### **4. Device Price Unificato** ✅

**Rimosso da**:
- ❌ `goToMarket.marketingPlan.globalSettings.devicePrice`

**Referenziare sempre da**:
- ✅ `globalSettings.business.devicePrice`

**Aggiornare componenti**:
- `GTMEngineCard`: usa `data.globalSettings.business.devicePrice`
- `TAMSAMSOMCard`: usa `data.globalSettings.business.devicePrice`
- `RevenueModel`: usa `data.globalSettings.business.devicePrice`

---

## 🔧 **SERVIZI DA CREARE**

### **globalSettingsService.ts**

```typescript
/**
 * Service per accedere a Global Settings (SSOT)
 */
export class GlobalSettingsService {
  
  /**
   * Get device price (SSOT)
   */
  static getDevicePrice(data: Database): number {
    return data.globalSettings?.business?.devicePrice || 50000;
  }
  
  /**
   * Update device price (sincronizza ovunque)
   */
  static async updateDevicePrice(price: number): Promise<void> {
    await fetch('/api/database/global-settings', {
      method: 'PATCH',
      body: JSON.stringify({
        business: { devicePrice: price }
      })
    });
  }
  
  /**
   * Get sales mix
   */
  static getSalesMix(data: Database) {
    return data.globalSettings?.salesMix || {
      pubblico: 0.6,
      privato: 0.3,
      research: 0.1
    };
  }
  
  /**
   * Calculate weighted average sales cycle
   */
  static calculateAvgSalesCycle(
    bySegment: { pubblico: number, privato: number, research: number },
    data: Database
  ): number {
    const mix = this.getSalesMix(data);
    
    const weighted = 
      (bySegment.pubblico * mix.pubblico) +
      (bySegment.privato * mix.privato) +
      (bySegment.research * mix.research);
    
    return Math.round(weighted * 10) / 10; // 1 decimale
  }
}
```

---

## 🎨 **UI COMPONENTS DA AGGIORNARE**

### **1. Creare DevicePriceEditor.tsx**

Componente riusabile per editare device price:

```tsx
export function DevicePriceEditor() {
  const { data, updateGlobalSettings } = useDatabase();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(data.globalSettings.business.devicePrice);
  
  const handleSave = async () => {
    await updateGlobalSettings({
      business: { devicePrice: price }
    });
    setEditing(false);
  };
  
  return (
    <Card className="p-4">
      <Label>💎 Prezzo Dispositivo (SSOT)</Label>
      {editing ? (
        <Input 
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onBlur={handleSave}
        />
      ) : (
        <div onClick={() => setEditing(true)}>
          €{price.toLocaleString()}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        Usato in: TAM/SAM/SOM, GTM, Revenue Model
      </div>
    </Card>
  );
}
```

**Usare in**:
- GTM Engine (tab Parametri)
- TAM/SAM/SOM Configuration
- Revenue Model Settings
- Global Settings Panel (nuovo!)

---

### **2. Creare SalesMixEditor.tsx**

```tsx
export function SalesMixEditor() {
  const { data, updateGlobalSettings } = useDatabase();
  const mix = data.globalSettings.salesMix;
  
  const handleUpdate = async (field: string, value: number) => {
    await updateGlobalSettings({
      salesMix: { [field]: value }
    });
  };
  
  return (
    <Card className="p-4">
      <Label>📊 Sales Mix per Segmento</Label>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div>
          <Label className="text-xs">Pubblico</Label>
          <Input 
            type="number"
            value={mix.pubblico * 100}
            onChange={(e) => handleUpdate('pubblico', Number(e.target.value) / 100)}
          /> %
        </div>
        <div>
          <Label className="text-xs">Privato</Label>
          <Input 
            type="number"
            value={mix.privato * 100}
            onChange={(e) => handleUpdate('privato', Number(e.target.value) / 100)}
          /> %
        </div>
        <div>
          <Label className="text-xs">Research</Label>
          <Input 
            type="number"
            value={mix.research * 100}
            onChange={(e) => handleUpdate('research', Number(e.target.value) / 100)}
          /> %
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Totale: {((mix.pubblico + mix.privato + mix.research) * 100).toFixed(0)}%
      </div>
    </Card>
  );
}
```

---

### **3. Aggiornare GTMEngineCard**

Integrare:
- Device Price da globalSettings (non duplicato!)
- Sales Cycle con media pesata
- Sales Mix editor

```tsx
// Nella sezione Parametri
<DevicePriceEditor />
<SalesMixEditor />

<Card className="p-4">
  <Label>⏱️ Ciclo Vendita per Segmento</Label>
  <div className="grid grid-cols-3 gap-3">
    <div>
      <Label>Pubblico</Label>
      <Input value={salesCycle.bySegment.pubblico} onChange={...} />
    </div>
    {/* ... */}
  </div>
  <div className="mt-2 p-2 bg-blue-50 rounded">
    <strong>Media Pesata:</strong> {calculatedAvg} mesi
    <div className="text-xs text-gray-500">
      Basato su Sales Mix: {mix.pubblico*100}% pubb, {mix.privato*100}% priv, {mix.research*100}% res
    </div>
  </div>
</Card>
```

---

## 📡 **API ENDPOINTS DA AGGIORNARE**

### **PATCH /api/database/global-settings**

```typescript
// app/api/database/global-settings/route.ts
export async function PATCH(req: Request) {
  const updates = await req.json();
  
  // Deep merge
  const current = await readDatabase();
  current.globalSettings = {
    ...current.globalSettings,
    business: { ...current.globalSettings.business, ...updates.business },
    salesMix: { ...current.globalSettings.salesMix, ...updates.salesMix }
  };
  
  // Ricalcola Sales Cycle se cambia salesMix
  if (updates.salesMix) {
    const bySegment = current.goToMarket.salesCycle.bySegment;
    current.goToMarket.salesCycle.avgMonths = 
      GlobalSettingsService.calculateAvgSalesCycle(bySegment, current);
  }
  
  await writeDatabase(current);
  return NextResponse.json(current.globalSettings);
}
```

---

## ✅ **CHECKLIST IMPLEMENTAZIONE**

### **Backend**
- [x] Aggiunto `globalSettings` in database.json
- [x] Aggiunto `salesMix` con pesi
- [x] Aggiornato `salesCycle` con media pesata
- [x] Ridefiniti `scenarios` con sistema overrides
- [x] Rimosso `devicePrice` duplicato da marketingPlan
- [ ] Creare `globalSettingsService.ts`
- [ ] Creare API `PATCH /api/database/global-settings`
- [ ] Aggiornare API GTM per usare globalSettings

### **Frontend**
- [ ] Creare `DevicePriceEditor.tsx`
- [ ] Creare `SalesMixEditor.tsx`
- [ ] Aggiornare `GTMEngineCard` per usare globalSettings
- [ ] Aggiornare `TAMSAMSOMCard` per usare globalSettings
- [ ] Aggiornare `RevenueModel` per usare globalSettings
- [ ] Creare UI per Sales Cycle con media pesata
- [ ] Implementare scenario selector con overrides
- [ ] Testing end-to-end

### **Documentazione**
- [x] Documento refactoring database
- [ ] Aggiornare guide testing
- [ ] Documentare nuova API globalSettings
- [ ] Schema TypeScript per globalSettings

---

## 🎯 **PROSSIMI PASSI**

1. **Creare services** (globalSettingsService.ts)
2. **Creare API** (/api/database/global-settings)
3. **Creare UI components** (DevicePriceEditor, SalesMixEditor)
4. **Integrare in GTMEngineUnified** (nuovo componente)
5. **Testing** con guide esistenti
6. **Deploy** e validazione

---

**STATUS**: ✅ Database refactoring completato  
**NEXT**: Implementazione services e UI components
