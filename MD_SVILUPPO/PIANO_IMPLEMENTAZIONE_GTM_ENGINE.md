# Piano Implementazione Go-To-Market Engine

## 📋 Documento di Riferimento
**Basato su:**
- Guida 39: Piano Finanziario Startup Medtech
- Guida 8: Strategia Go-To-Market Eco 3D
- PianoDISviluppo_OltreIlMercato.md (Sezione 2)

**Data:** 12 Ottobre 2025  
**Versione:** 1.0  
**Stima Tempo:** 45-60 minuti

---

## 🎯 Obiettivo

Implementare un **motore Go-To-Market** che trasforma le assunzioni di mercato (TAM/SAM/SOM) in proiezioni realistiche di vendita, considerando:
- **Top-Down**: Quote di mercato SOM
- **Bottom-Up**: Capacità commerciale effettiva (reps, funnel, ciclo vendita)
- **Logica di riconciliazione**: `Vendite Reali = min(SOM, Capacità Commerciale)`

---

## 📊 Struttura Database: `goToMarket`

### 1. Schema JSON Completo

```json
"goToMarket": {
  "enabled": true,
  "description": "Motore capacità commerciale per proiezioni realistiche",
  
  // === CAPACITÀ COMMERCIALE ===
  "salesCapacity": {
    "reps": 2,
    "dealsPerRepPerQuarter": 4,
    "rampUpMonths": 3,
    "description": "Team commerciale e produttività"
  },
  
  // === CICLO DI VENDITA ===
  "salesCycle": {
    "avgMonths": 6,
    "bySegment": {
      "pubblico": 9,
      "privato": 3,
      "research": 6
    },
    "description": "Tempo medio lead-to-close"
  },
  
  // === FUNNEL DI CONVERSIONE ===
  "conversionFunnel": {
    "lead_to_demo": 0.25,
    "demo_to_pilot": 0.30,
    "pilot_to_deal": 0.40,
    "description": "Tassi conversione fasi funnel"
  },
  
  // === MIX CANALI DISTRIBUZIONE ===
  "channelMix": {
    "direct": 0.60,
    "distributors": 0.40,
    "oem": 0.00,
    "distributorMargin": 0.20,
    "description": "Split canali vendita e margini"
  },
  
  // === CURVA DI ADOZIONE PER REGIONE ===
  "adoptionCurve": {
    "italia": {
      "y1": 0.20,
      "y2": 0.60,
      "y3": 1.00,
      "y4": 1.00,
      "y5": 1.00
    },
    "europa": {
      "y1": 0.10,
      "y2": 0.40,
      "y3": 0.80,
      "y4": 1.00,
      "y5": 1.00
    },
    "usa": {
      "y1": 0.00,
      "y2": 0.20,
      "y3": 0.50,
      "y4": 0.80,
      "y5": 1.00
    },
    "description": "Penetrazione progressiva mercati"
  },
  
  // === SCENARI BUDGET GTM ===
  "scenarios": {
    "current": "medio",
    "basso": {
      "budget": 50000,
      "reps": 0,
      "multiplier": 0.5
    },
    "medio": {
      "budget": 150000,
      "reps": 1,
      "multiplier": 1.0
    },
    "alto": {
      "budget": 300000,
      "reps": 3,
      "multiplier": 1.5
    }
  },
  
  // === METRICHE CALCOLATE (Runtime) ===
  "calculated": {
    "maxSalesCapacity": {
      "y1": 0,
      "y2": 0,
      "y3": 0,
      "y4": 0,
      "y5": 0
    },
    "realisticSales": {
      "y1": 0,
      "y2": 0,
      "y3": 0,
      "y4": 0,
      "y5": 0
    },
    "constrainingFactor": {
      "y1": "market",
      "y2": "capacity",
      "y3": "market",
      "y4": "capacity",
      "y5": "market"
    }
  }
}
```

---

## 🔧 Implementazione: Step by Step

### **STEP 1: Aggiornare Database Schema** (5 min)

**File:** `financial-dashboard/src/data/database.json`

**Azione:** Aggiungere sezione `goToMarket` nel nodo `businessPlan`

```bash
# Path da modificare
database.json → businessPlan → goToMarket
```

**Posizione:** Dopo `revenueModel`, prima di `budget`

---

### **STEP 2: Aggiornare TypeScript Interfaces** (5 min)

**File:** `financial-dashboard/src/contexts/DatabaseProvider.tsx`

**Aggiungere:**

```typescript
// === GO-TO-MARKET INTERFACES ===

interface SalesCapacity {
  reps: number;
  dealsPerRepPerQuarter: number;
  rampUpMonths: number;
  description: string;
}

interface SalesCycle {
  avgMonths: number;
  bySegment: {
    pubblico: number;
    privato: number;
    research: number;
  };
  description: string;
}

interface ConversionFunnel {
  lead_to_demo: number;
  demo_to_pilot: number;
  pilot_to_deal: number;
  description: string;
}

interface ChannelMix {
  direct: number;
  distributors: number;
  oem: number;
  distributorMargin: number;
  description: string;
}

interface AdoptionCurveYear {
  y1: number;
  y2: number;
  y3: number;
  y4: number;
  y5: number;
}

interface AdoptionCurve {
  italia: AdoptionCurveYear;
  europa: AdoptionCurveYear;
  usa: AdoptionCurveYear;
  description: string;
}

interface GtmScenario {
  budget: number;
  reps: number;
  multiplier: number;
}

interface GoToMarketModel {
  enabled: boolean;
  description: string;
  salesCapacity: SalesCapacity;
  salesCycle: SalesCycle;
  conversionFunnel: ConversionFunnel;
  channelMix: ChannelMix;
  adoptionCurve: AdoptionCurve;
  scenarios: {
    current: string;
    basso: GtmScenario;
    medio: GtmScenario;
    alto: GtmScenario;
  };
  calculated?: {
    maxSalesCapacity: AdoptionCurveYear;
    realisticSales: AdoptionCurveYear;
    constrainingFactor: Record<string, string>;
  };
}
```

**Aggiornare `BusinessPlan`:**

```typescript
interface BusinessPlan {
  // ... existing
  goToMarket: GoToMarketModel;
}
```

---

### **STEP 3: Creare Servizio di Calcolo** (15 min)

**File:** `financial-dashboard/src/services/gtmCalculations.ts` (nuovo)

```typescript
import { GoToMarketModel } from '@/contexts/DatabaseProvider';

export class GtmCalculationService {
  
  /**
   * Calcola la capacità massima di vendita basata su team e produttività
   */
  static calculateSalesCapacity(
    reps: number,
    dealsPerRepPerQuarter: number,
    year: number,
    rampUpMonths: number = 3
  ): number {
    // Fattore ramping: primi mesi produttività ridotta
    const rampFactor = year === 1 && rampUpMonths > 0 
      ? (12 - rampUpMonths) / 12 
      : 1.0;
    
    // Capacità annua = reps × deals/quarter × 4 quarters × ramp
    return Math.floor(reps * dealsPerRepPerQuarter * 4 * rampFactor);
  }
  
  /**
   * Applica il funnel di conversione ai lead per stimare deals
   */
  static applyConversionFunnel(
    leads: number,
    funnel: { lead_to_demo: number; demo_to_pilot: number; pilot_to_deal: number }
  ): { demos: number; pilots: number; deals: number } {
    const demos = Math.floor(leads * funnel.lead_to_demo);
    const pilots = Math.floor(demos * funnel.demo_to_pilot);
    const deals = Math.floor(pilots * funnel.pilot_to_deal);
    
    return { demos, pilots, deals };
  }
  
  /**
   * Applica curva di adozione regionale al SOM
   */
  static applyCurvaAdozione(
    somDevices: number,
    adoptionPct: number
  ): number {
    return Math.floor(somDevices * adoptionPct);
  }
  
  /**
   * LOGICA PRINCIPALE: Riconcilia Top-Down vs Bottom-Up
   */
  static calculateRealisticSales(
    somDevicesYear: number,
    salesCapacityYear: number,
    adoptionPct: number,
    channelEfficiency: number = 1.0
  ): {
    somAdjusted: number;
    capacityMax: number;
    realisticSales: number;
    constrainingFactor: 'market' | 'capacity';
  } {
    // SOM aggiustato per curva adozione
    const somAdjusted = this.applyCurvaAdozione(somDevicesYear, adoptionPct);
    
    // Capacità commerciale con efficienza canali
    const capacityMax = Math.floor(salesCapacityYear * channelEfficiency);
    
    // Prendi il minore (realismo)
    const realisticSales = Math.min(somAdjusted, capacityMax);
    
    // Determina quale fattore limita
    const constrainingFactor = realisticSales === somAdjusted ? 'market' : 'capacity';
    
    return {
      somAdjusted,
      capacityMax,
      realisticSales,
      constrainingFactor
    };
  }
  
  /**
   * Calcola proiezioni complete 5 anni
   */
  static projectSalesOverYears(
    gtm: GoToMarketModel,
    somDevicesByYear: { y1: number; y2: number; y3: number; y4: number; y5: number },
    region: 'italia' | 'europa' | 'usa' = 'italia'
  ) {
    const results = {
      maxSalesCapacity: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      realisticSales: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      constrainingFactor: {} as Record<string, string>
    };
    
    const years = [1, 2, 3, 4, 5];
    const adoptionCurve = gtm.adoptionCurve[region];
    const channelEfficiency = 1.0 - (gtm.channelMix.distributors * gtm.channelMix.distributorMargin);
    
    years.forEach(year => {
      const yearKey = `y${year}` as keyof typeof somDevicesByYear;
      
      // Capacità commerciale anno Y
      const capacity = this.calculateSalesCapacity(
        gtm.salesCapacity.reps,
        gtm.salesCapacity.dealsPerRepPerQuarter,
        year,
        gtm.salesCapacity.rampUpMonths
      );
      
      // Calcolo realistico
      const result = this.calculateRealisticSales(
        somDevicesByYear[yearKey],
        capacity,
        adoptionCurve[yearKey],
        channelEfficiency
      );
      
      results.maxSalesCapacity[yearKey] = result.capacityMax;
      results.realisticSales[yearKey] = result.realisticSales;
      results.constrainingFactor[yearKey] = result.constrainingFactor;
    });
    
    return results;
  }
}
```

---

### **STEP 4: Integrare nel DatabaseProvider** (5 min)

**File:** `financial-dashboard/src/contexts/DatabaseProvider.tsx`

**Aggiungere funzione UPDATE:**

```typescript
const updateGoToMarket = async (updates: Partial<GoToMarketModel>) => {
  try {
    const response = await fetch('/api/database/business-plan/gtm', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error('Failed to update GTM');
    
    await loadData(); // Ricarica
  } catch (error) {
    console.error('❌ Error updating GTM:', error);
  }
};
```

**Esporre nel Context:**

```typescript
return (
  <DatabaseContext.Provider value={{
    // ... existing
    goToMarket: data?.businessPlan?.goToMarket,
    updateGoToMarket,
  }}>
```

---

### **STEP 5: Creare API Endpoint** (10 min)

**File:** `financial-dashboard/src/app/api/database/business-plan/gtm/route.ts` (nuovo)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/database.json');

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Leggi database
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    
    // Merge updates
    data.businessPlan.goToMarket = {
      ...data.businessPlan.goToMarket,
      ...updates
    };
    
    // Scrivi
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      goToMarket: data.businessPlan.goToMarket 
    });
    
  } catch (error) {
    console.error('❌ GTM API Error:', error);
    return NextResponse.json({ error: 'Failed to update GTM' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    return NextResponse.json(data.businessPlan.goToMarket);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read GTM' }, { status: 500 });
  }
}
```

---

### **STEP 6: Creare UI Component** (15 min)

**File:** `financial-dashboard/src/components/GTMEngineCard.tsx` (nuovo)

```typescript
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, TrendingUp, Users } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { GtmCalculationService } from '@/services/gtmCalculations';

export function GTMEngineCard() {
  const { goToMarket, tamSamSomEcografi, updateGoToMarket } = useDatabase();
  
  if (!goToMarket || !tamSamSomEcografi) return null;
  
  // Calcola proiezioni in tempo reale
  const projections = GtmCalculationService.projectSalesOverYears(
    goToMarket,
    tamSamSomEcografi.dispositiviUnita,
    'italia'
  );
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Go-To-Market Engine</h3>
        <Badge variant={goToMarket.enabled ? 'default' : 'secondary'}>
          {goToMarket.enabled ? 'Attivo' : 'Disattivo'}
        </Badge>
      </div>
      
      {/* === SALES CAPACITY === */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Capacità Commerciale
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Sales Reps</label>
            <Input
              type="number"
              value={goToMarket.salesCapacity.reps}
              onChange={(e) => updateGoToMarket({
                salesCapacity: {
                  ...goToMarket.salesCapacity,
                  reps: parseInt(e.target.value) || 0
                }
              })}
              min={0}
              max={10}
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Deals/Rep/Quarter</label>
            <Input
              type="number"
              value={goToMarket.salesCapacity.dealsPerRepPerQuarter}
              onChange={(e) => updateGoToMarket({
                salesCapacity: {
                  ...goToMarket.salesCapacity,
                  dealsPerRepPerQuarter: parseInt(e.target.value) || 0
                }
              })}
              min={1}
              max={20}
            />
          </div>
        </div>
      </div>
      
      {/* === CONVERSION FUNNEL === */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium">Funnel di Conversione</h4>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Lead → Demo</span>
              <span className="font-semibold">{(goToMarket.conversionFunnel.lead_to_demo * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[goToMarket.conversionFunnel.lead_to_demo * 100]}
              onValueChange={([value]) => updateGoToMarket({
                conversionFunnel: {
                  ...goToMarket.conversionFunnel,
                  lead_to_demo: value / 100
                }
              })}
              min={5}
              max={50}
              step={5}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Demo → Pilot</span>
              <span className="font-semibold">{(goToMarket.conversionFunnel.demo_to_pilot * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[goToMarket.conversionFunnel.demo_to_pilot * 100]}
              onValueChange={([value]) => updateGoToMarket({
                conversionFunnel: {
                  ...goToMarket.conversionFunnel,
                  demo_to_pilot: value / 100
                }
              })}
              min={10}
              max={60}
              step={5}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Pilot → Deal</span>
              <span className="font-semibold">{(goToMarket.conversionFunnel.pilot_to_deal * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[goToMarket.conversionFunnel.pilot_to_deal * 100]}
              onValueChange={([value]) => updateGoToMarket({
                conversionFunnel: {
                  ...goToMarket.conversionFunnel,
                  pilot_to_deal: value / 100
                }
              })}
              min={20}
              max={80}
              step={5}
            />
          </div>
        </div>
      </div>
      
      {/* === RIEPILOGO PROIEZIONI === */}
      <div className="p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <h4 className="font-medium">Proiezioni Realistiche</h4>
        </div>
        
        <div className="grid grid-cols-5 gap-2 text-sm">
          {[1, 2, 3, 4, 5].map(year => (
            <div key={year} className="text-center">
              <div className="text-xs text-gray-600 mb-1">Anno {year}</div>
              <div className="font-bold text-purple-600">
                {projections.realisticSales[`y${year}` as keyof typeof projections.realisticSales]}
              </div>
              <div className="text-xs text-gray-500">
                {projections.constrainingFactor[`y${year}`] === 'market' ? '📊 Mercato' : '👥 Capacità'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <strong>Legenda:</strong> 📊 = Limitato da SOM | 👥 = Limitato da capacità commerciale
        </div>
      </div>
    </Card>
  );
}
```

---

## ⚙️ Integrazione con RevenueModelDashboard

**File:** `financial-dashboard/src/components/RevenueModel/RevenueModelDashboard.tsx`

**Aggiungere import:**

```typescript
import { GTMEngineCard } from '@/components/GTMEngineCard';
```

**Inserire nel render dopo TAM/SAM/SOM:**

```tsx
{/* Go-To-Market Engine */}
<GTMEngineCard />
```

---

## 🧪 Testing e Validazione

### Test 1: Scenario Base
- **Input:** 2 reps, 4 deals/quarter, SOM Y1 = 28 dispositivi
- **Expected:** Capacity = 32/anno, Realistic = 28 (limitato da mercato)

### Test 2: Scenario Crescita
- **Input:** 3 reps, 5 deals/quarter, SOM Y2 = 42
- **Expected:** Capacity = 60/anno, Realistic = 42 (limitato da mercato)

### Test 3: Scenario Vincolato
- **Input:** 1 rep, 3 deals/quarter, SOM Y3 = 56
- **Expected:** Capacity = 12/anno, Realistic = 12 (limitato da capacità)

---

## 📈 Metriche di Successo

✅ **Calcoli Corretti:**
- Vendite realistiche sempre ≤ SOM
- Vendite realistiche sempre ≤ Capacità
- Fattore limitante identificato correttamente

✅ **UI Funzionale:**
- Modifiche salvate in real-time
- Proiezioni ricalcolate istantaneamente
- Validazione input (no valori negativi)

✅ **Integrazione Database:**
- Persistenza modifiche su database.json
- Reload automatico dopo salvataggio
- Coerenza tra frontend e backend

---

## 🎯 Prossimi Step (Dopo Implementazione)

### Fase 2 (Opzionale - Raffinamenti):
1. **Canali Multi-Regione**: Applicare adoption curve diverse per IT/EU/USA
2. **Simulazione Budget**: Toggle scenario Basso/Medio/Alto
3. **Analisi CAC**: Collegare spese marketing a lead generati
4. **Ciclo Vendita**: Modellare timing incassi (DSO)

### Fase 3 (Collegamento P&L):
1. **Revenue Forecast**: Usare `realisticSales` come input ricavi
2. **OPEX Scaling**: Collegare numero reps a costi personale
3. **Break-Even Analysis**: Calcolare quando vendite coprono costi

---

## 📝 Note Implementative

### Decisioni Architetturali:
- **Calcoli Runtime**: Non persistiamo `calculated`, si ricalcola sempre
- **Validazione Input**: Min/max su slider per evitare valori assurdi
- **Granularità**: Anno (non mese) per semplicità iniziale
- **Regione Default**: Italia come primary market

### Best Practices Applicate:
✅ Doppia vista Top-Down/Bottom-Up (Guida 39, punto 3)  
✅ Funnel a 4 fasi: Lead→Demo→Pilot→Deal (Guida 8)  
✅ Curva adozione progressiva per regione (Guida 8, Adoption Curve)  
✅ Capacità con ramp-up period (Guida 39)  
✅ Channel mix con margin erosion (Guida 8, Distribution)

---

## ✅ Checklist Implementazione

- [ ] **Step 1**: Aggiornare `database.json` con schema `goToMarket`
- [ ] **Step 2**: Aggiungere TypeScript interfaces in `DatabaseProvider.tsx`
- [ ] **Step 3**: Creare `gtmCalculations.ts` service
- [ ] **Step 4**: Aggiungere `updateGoToMarket()` in Context
- [ ] **Step 5**: Creare API `/api/database/business-plan/gtm/route.ts`
- [ ] **Step 6**: Creare componente `GTMEngineCard.tsx`
- [ ] **Step 7**: Integrare in `RevenueModelDashboard.tsx`
- [ ] **Step 8**: Testare calcoli con dati reali
- [ ] **Step 9**: Validare salvataggio database
- [ ] **Step 10**: Commit e documentazione

---

## 🚀 Ready to Implement!

**Tempo stimato:** 45-60 minuti  
**Complessità:** Media  
**Impatto:** Alto (Base per Sezione 3: COGS/OPEX/P&L)

Procediamo con l'implementazione? 💪
