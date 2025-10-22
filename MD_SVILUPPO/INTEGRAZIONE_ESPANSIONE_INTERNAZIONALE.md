# 🌍 INTEGRAZIONE ESPANSIONE INTERNAZIONALE - PIANO DI SVILUPPO

## 📋 STATO ATTUALE (v1.0 - Implementato)

### **Modello Bifase Semplificato:**

```
FASE 1: Lancio Commerciale (2029-2032)
├── Mercato: Solo Italia
├── Revenue: Dati GTM base (go-to-market calculated.realisticSales)
└── ExpansionMultiplier: 1.0 (default)

FASE 2: Scaling & Espansione (2033-2036)
├── Mercato: Italia + Europa + USA
├── Revenue: Dati GTM base × 2.5 (moltiplicatore configurabile)
└── ExpansionMultiplier: 2.5 (parametro modificabile)
```

### **Implementazione Tecnica:**

#### **A. Calcolo Revenue per Fase:**

**File:** `src/services/financialPlan/calculations.ts`

```typescript
private calculateHardwareSales(month: number, date: string, year: number) {
  const currentPhase = this.getCurrentPhaseForYear(year);
  
  // Prende revenue start della FASE CORRENTE (non più globale)
  const revenueStartYear = parseInt(currentPhase.revenueStartDate.split('-')[0]);
  const yearIndex = year - revenueStartYear; // Reset per ogni fase
  
  // Applica moltiplicatore espansione
  const expansionMultiplier = currentPhase.expansionMultiplier || 1.0;
  annualUnits = annualUnits * expansionMultiplier;
}
```

**Comportamento:**
- **Fase 1** (2029): y1, y2, y3, y4 → Units base × 1.0
- **Fase 2** (2033): y1, y2, y3, y4 → Units base × 2.5

Ogni fase **resetta** il ciclo revenue (y1-y10).

#### **B. Configurazione Database:**

**File:** `src/data/database.json`

```json
{
  "id": "scaling",
  "name": "Scaling & Espansione",
  "startDate": "2032-12",
  "endDate": "2036-01",
  "revenueEnabled": true,
  "revenueStartDate": "2033-01",
  "expansionMultiplier": 2.5,  ← NUOVO parametro
  "description": "Espansione internazionale (Italia + Europa + USA)"
}
```

#### **C. TypeScript Types:**

**File:** `src/types/financialPlan.types.ts`

```typescript
export interface BusinessPhase {
  // ... campi esistenti ...
  expansionMultiplier?: number; // default 1.0
}
```

---

## 🎯 FUTURO SVILUPPO (v2.0 - Da Implementare)

### **OBIETTIVO: Sostituire Moltiplicatore Semplice con Dati Regionali Reali**

### **Dati Disponibili nel Database:**

Il database **già contiene** dati mercato per regioni internazionali:

```json
{
  "tamSamSom": {
    "mercatiEsteri": {
      "europa": {
        "germania": { "tam": 45000000, "sam": 9000000, "som": 270000 },
        "francia": { "tam": 38000000, "sam": 7600000, "som": 228000 },
        "spagna": { "tam": 28000000, "sam": 5600000, "som": 168000 },
        "uk": { "tam": 35000000, "sam": 7000000, "som": 210000 }
      },
      "usa": {
        "totale": { "tam": 180000000, "sam": 36000000, "som": 1080000 }
      },
      "asia": {
        "giappone": { "tam": 52000000, "sam": 10400000, "som": 312000 }
      }
    }
  }
}
```

---

## 🛠️ ARCHITETTURA TARGET (v2.0)

### **Step 1: Definire Strategia Espansione Geografica**

#### **Nuova Configurazione Fase:**

```typescript
export interface BusinessPhase {
  id: string;
  name: string;
  // ... campi esistenti ...
  
  // NUOVO: Configurazione mercati per fase
  markets?: {
    enabled: string[];  // ["italia", "europa", "usa"]
    weights?: {        // Peso relativo per mercato (opzionale)
      italia?: number;  // 0.4 = 40% revenue da Italia
      europa?: number;  // 0.4 = 40% revenue da Europa
      usa?: number;     // 0.2 = 20% revenue da USA
    };
    specificRegions?: {
      europa?: string[]; // ["germania", "francia", "spagna"]
      usa?: string[];    // ["totale"] o futuri stati specifici
    };
  };
  
  // DEPRECATO (mantenuto per backward compatibility)
  expansionMultiplier?: number;
}
```

#### **Esempio Configurazione:**

```json
{
  "id": "launch",
  "name": "Lancio Commerciale",
  "markets": {
    "enabled": ["italia"],
    "weights": { "italia": 1.0 }
  }
},
{
  "id": "scaling",
  "name": "Scaling & Espansione",
  "markets": {
    "enabled": ["italia", "europa", "usa"],
    "weights": {
      "italia": 0.4,
      "europa": 0.4,
      "usa": 0.2
    },
    "specificRegions": {
      "europa": ["germania", "francia", "spagna", "uk"]
    }
  }
}
```

---

### **Step 2: Calcoli Revenue Multi-Regione**

#### **Nuovo File:** `src/services/financialPlan/regionalRevenue.ts`

```typescript
export class RegionalRevenueCalculator {
  
  /**
   * Calcola revenue totale da tutti i mercati attivi nella fase
   */
  calculateMultiRegionRevenue(
    phase: BusinessPhase,
    year: number,
    baseGTMSales: any
  ): RegionalRevenueBreakdown {
    
    if (!phase.markets || !phase.markets.enabled) {
      // Fallback a moltiplicatore semplice
      return this.calculateWithMultiplier(phase, year, baseGTMSales);
    }
    
    const regionalBreakdown = {
      italia: { units: 0, revenue: 0, share: 0 },
      europa: { units: 0, revenue: 0, share: 0, byCountry: {} },
      usa: { units: 0, revenue: 0, share: 0 },
      total: { units: 0, revenue: 0 }
    };
    
    // Per ogni mercato attivo
    for (const market of phase.markets.enabled) {
      const weight = phase.markets.weights?.[market] || 1.0 / phase.markets.enabled.length;
      
      if (market === 'italia') {
        regionalBreakdown.italia = this.calculateItalyRevenue(year, baseGTMSales, weight);
      } else if (market === 'europa') {
        regionalBreakdown.europa = this.calculateEuropeRevenue(year, phase, weight);
      } else if (market === 'usa') {
        regionalBreakdown.usa = this.calculateUSARevenue(year, weight);
      }
    }
    
    // Aggregazione totale
    regionalBreakdown.total.units = 
      regionalBreakdown.italia.units + 
      regionalBreakdown.europa.units + 
      regionalBreakdown.usa.units;
    
    regionalBreakdown.total.revenue = 
      regionalBreakdown.italia.revenue + 
      regionalBreakdown.europa.revenue + 
      regionalBreakdown.usa.revenue;
    
    return regionalBreakdown;
  }
  
  /**
   * Calcola revenue Italia (dati GTM base)
   */
  private calculateItalyRevenue(year: number, baseGTMSales: any, weight: number) {
    // Usa dati GTM esistenti
    const yearIndex = year - 2029; // Base year
    const yearKey = ['y1', 'y2', 'y3', 'y4', 'y5'][yearIndex];
    const baseUnits = baseGTMSales[yearKey] || 0;
    
    return {
      units: baseUnits * weight,
      revenue: baseUnits * weight * HARDWARE_PRICE,
      share: weight
    };
  }
  
  /**
   * Calcola revenue Europa (da TAM/SAM/SOM)
   */
  private calculateEuropeRevenue(year: number, phase: BusinessPhase, weight: number) {
    const marketData = this.getMarketData('europa');
    const countries = phase.markets?.specificRegions?.europa || ['germania', 'francia', 'spagna', 'uk'];
    
    let totalUnits = 0;
    const byCountry = {};
    
    for (const country of countries) {
      const countryData = marketData[country];
      if (!countryData) continue;
      
      // Penetrazione progressiva: y1=2%, y2=4%, y3=6%, y4=8%, y5=10%
      const penetrationRate = Math.min((year - 2033 + 1) * 0.02, 0.10);
      const countryUnits = (countryData.som / HARDWARE_PRICE) * penetrationRate;
      
      byCountry[country] = {
        units: countryUnits,
        revenue: countryUnits * HARDWARE_PRICE,
        penetration: penetrationRate
      };
      
      totalUnits += countryUnits;
    }
    
    return {
      units: totalUnits * weight,
      revenue: totalUnits * weight * HARDWARE_PRICE,
      share: weight,
      byCountry
    };
  }
  
  /**
   * Calcola revenue USA (da TAM/SAM/SOM)
   */
  private calculateUSARevenue(year: number, weight: number) {
    const usaData = this.getMarketData('usa').totale;
    
    // Penetrazione USA più conservativa: y1=1%, y2=2%, y3=3%
    const penetrationRate = Math.min((year - 2033 + 1) * 0.01, 0.05);
    const units = (usaData.som / HARDWARE_PRICE) * penetrationRate;
    
    return {
      units: units * weight,
      revenue: units * weight * HARDWARE_PRICE,
      share: weight,
      penetration: penetrationRate
    };
  }
}
```

---

### **Step 3: Integrazione con Calculations.ts**

```typescript
// In FinancialPlanCalculator class

private calculateHardwareSales(month: number, date: string, year: number) {
  const currentPhase = this.getCurrentPhaseForYear(year);
  
  // NUOVO: Usa regional calculator se disponibile
  if (currentPhase.markets && currentPhase.markets.enabled) {
    const regionalCalc = new RegionalRevenueCalculator(this.input.marketData);
    const regionalRevenue = regionalCalc.calculateMultiRegionRevenue(
      currentPhase,
      year,
      this.input.gtmData.calculated.realisticSales
    );
    
    return {
      units: regionalRevenue.total.units / 12, // Mensile
      revenue: regionalRevenue.total.revenue / 12,
      cogs: regionalRevenue.total.units / 12 * UNIT_COST,
      // ...
      _regional: regionalRevenue // Metadata per visualizzazione
    };
  }
  
  // FALLBACK: Usa moltiplicatore semplice (backward compatibility)
  return this.calculateWithMultiplier(currentPhase, year);
}
```

---

## 📊 VISUALIZZAZIONE DATI REGIONALI

### **Nuovo Pannello: Regional Breakdown**

```typescript
// src/components/FinancialPlanV2/RegionalBreakdownPanel.tsx

export function RegionalBreakdownPanel({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📍 Breakdown Geografico Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabella breakdown per regione */}
        <table>
          <thead>
            <tr>
              <th>Mercato</th>
              <th>Units</th>
              <th>Revenue</th>
              <th>% Share</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🇮🇹 Italia</td>
              <td>{data.italia.units}</td>
              <td>€{data.italia.revenue.toLocaleString()}</td>
              <td>{(data.italia.share * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>🇪🇺 Europa</td>
              <td>{data.europa.units}</td>
              <td>€{data.europa.revenue.toLocaleString()}</td>
              <td>{(data.europa.share * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>🇺🇸 USA</td>
              <td>{data.usa.units}</td>
              <td>€{data.usa.revenue.toLocaleString()}</td>
              <td>{(data.usa.share * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
        
        {/* Breakdown Europa per paese */}
        {data.europa.byCountry && (
          <details>
            <summary>Dettaglio Europa</summary>
            <ul>
              {Object.entries(data.europa.byCountry).map(([country, stats]) => (
                <li key={country}>
                  <strong>{country}</strong>: {stats.units} units, €{stats.revenue.toLocaleString()}
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🔄 MIGRAZIONE DA v1.0 A v2.0

### **Step-by-Step Migration:**

#### **1. Aggiungi campo `markets` mantenendo `expansionMultiplier`**

```json
{
  "id": "scaling",
  "expansionMultiplier": 2.5,  // DEPRECATO ma mantenuto
  "markets": {                   // NUOVO
    "enabled": ["italia", "europa", "usa"],
    "weights": { "italia": 0.4, "europa": 0.4, "usa": 0.2 }
  }
}
```

#### **2. Testa con dati mock**

```typescript
// Test: Verifica che revenue totale sia simile a v1.0
const v1Revenue = baseUnits * 2.5;
const v2Revenue = 
  italiaUnits * 0.4 + 
  europaUnits * 0.4 + 
  usaUnits * 0.2;

// Assert: v2Revenue ≈ v1Revenue (±10%)
```

#### **3. Calibra pesi e penetrazione**

Aggiusta `weights` e `penetrationRate` per matchare target revenue.

#### **4. Rimuovi `expansionMultiplier`**

Quando v2.0 è stabile, rimuovi campo deprecato.

---

## 📈 METRICHE AGGIUNTIVE (v2.0)

### **Nuove Metriche da Tracciare:**

```typescript
export interface RegionalMetrics {
  // Per regione
  marketShare: {
    italia: number;    // % share of total TAM
    europa: number;
    usa: number;
  };
  
  // Penetrazione progressiva
  penetration: {
    italia: { year: number, rate: number }[];
    europa: { year: number, rate: number }[];
    usa: { year: number, rate: number }[];
  };
  
  // CAC per regione (se diverso)
  cacByRegion: {
    italia: number;
    europa: number;  // Può essere più alto (marketing EU)
    usa: number;     // Può essere molto più alto
  };
  
  // Pricing per regione (se diverso)
  pricingByRegion: {
    italia: number;
    europa: number;  // ES: +10% per costi import
    usa: number;     // ES: +20% per FDA/logistica
  };
}
```

---

## ⚠️ CONSIDERAZIONI CRITICHE

### **A. Regulatory Compliance:**

```
Europa: CE Mark (già ottenuto in Fase 1)
USA: FDA 510(k) clearance richiesto
  → Aggiungere milestone "FDA Approval" prima di USA entry
  → Stimare costi: $100K-$500K + 6-12 mesi
```

### **B. Pricing Differenziale:**

```typescript
const regionalPricing = {
  italia: 25000,        // Base price
  europa: 27500,        // +10% (import duties, localization)
  usa: 30000,           // +20% (FDA, distribution, higher WTP)
  giappone: 32500       // +30% (regulatory, cultural adaptation)
};
```

### **C. OPEX Scaling:**

```
International expansion richiede:
- Sales team locali (EU, USA)
- Regulatory affairs (FDA, PMDA)
- Customer support multilingua
- Marketing localizzato

→ OPEX non scala linearmente con revenue!
→ Aggiungere "International OPEX" separato per Fase 2
```

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### **Fase Preparatoria:**
- [x] Implementato modello bifase con `expansionMultiplier`
- [x] Aggiornato database.json con parametro configurabile
- [x] Aggiornato TypeScript types
- [x] Modificato `calculations.ts` per revenue per fase
- [ ] Test calcoli Fase 1 vs Fase 2

### **v2.0 Development:**
- [ ] Definire strategia espansione (mercati, timing, weights)
- [ ] Creare `RegionalRevenueCalculator` class
- [ ] Integrare dati TAM/SAM/SOM esistenti
- [ ] Implementare penetration curves per mercato
- [ ] Aggiungere pricing differenziale per regione
- [ ] Creare UI per regional breakdown
- [ ] Aggiungere export Excel con breakdown geografico

### **Calibrazione:**
- [ ] Validare penetration rates con benchmark settore
- [ ] Calibrare weights per matchare target revenue
- [ ] Aggiustare CAC per mercato (Italia < EU < USA)
- [ ] Verificare coerenza OPEX con espansione

### **Testing:**
- [ ] Unit test: Regional calculator
- [ ] Integration test: Fase 1 → Fase 2 transition
- [ ] Regression test: v1.0 multiplier vs v2.0 regional
- [ ] UI test: Visualizzazione breakdown geografico

---

## 🎯 TIMELINE SUGGERITA

```
Q1 2025: Setup v2.0 architecture
  - Definire strategia espansione
  - Creare RegionalRevenueCalculator
  - Integrare dati TAM/SAM/SOM

Q2 2025: Implementation
  - Calcoli multi-regione
  - UI regional breakdown
  - Testing & calibrazione

Q3 2025: Refinement
  - Pricing differenziale
  - CAC per regione
  - OPEX international

Q4 2025: Production
  - Deploy v2.0
  - Deprecate expansionMultiplier
  - Documentation finale
```

---

## 📚 RIFERIMENTI DATI

### **Dati già disponibili in database.json:**

```
- tamSamSom.mercatiEsteri.europa.*
- tamSamSom.mercatiEsteri.usa.*
- tamSamSom.mercatiEsteri.asia.*
```

### **Dati da integrare:**

```
- Pricing differenziale per regione
- CAC per regione (da definire)
- OPEX expansion costs (da budget)
- Regulatory costs (FDA, PMDA)
- Penetration curves calibrate
```

---

## ✅ VANTAGGI v2.0

1. **Precisione:** Dati reali vs moltiplicatore arbitrario
2. **Granularità:** Breakdown per paese/regione
3. **Flessibilità:** Configurazione weights dinamica
4. **Insights:** Metriche regionali per decision-making
5. **Professionalità:** Investor presentation con dettaglio geografico

---

## 🚀 PROSSIMI STEP IMMEDIATI

1. **Testare v1.0 attuale:**
   - Verificare calcoli Fase 1 (moltiplicatore 1.0)
   - Verificare calcoli Fase 2 (moltiplicatore 2.5)
   - Confermare coerenza P&L, Cash Flow, Balance Sheet

2. **Preparare dati per v2.0:**
   - Estrarre TAM/SAM/SOM per mercati target
   - Definire penetration curves realistiche
   - Calibrare pricing differenziale

3. **Prototipo UI:**
   - Mockup regional breakdown panel
   - Grafico geografico revenue split
   - Export Excel con breakdown

---

**🎉 IMPLEMENTAZIONE v1.0 COMPLETATA!**

**🔮 ROADMAP v2.0 DEFINITA!**

**🌍 ESPANSIONE INTERNAZIONALE PRONTA PER SCALING!**
