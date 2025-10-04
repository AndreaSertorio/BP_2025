# 🔴 PROBLEMA CRITICO: Logica TAM/SAM/SOM Errata

**Data**: 02/10/2025 18:31

## 🐛 PROBLEMI IDENTIFICATI

### 1. initialCash Non Influenza Runway
**Root cause**: `advancedMetrics.ts:154`
```typescript
const initialCash = this.scenario.assumptions?.initialCash || 2.0;
```
Il valore VIENE usato, ma il problema è che:
- initialCash è **uguale in tutti gli scenari** (sempre 2.0M)
- Runway dipende da: `initialCash / burnRate`
- Se initialCash è fisso, Runway varia solo con burnRate

**Soluzione**: Differenziare initialCash per scenario (prudente più, ambizioso meno).

---

### 2. TAM Non Viene Usato nei Calcoli
**Root cause**: `calculations.ts:69`
```typescript
const baseMonthlyLeads = (assumptions.sam * 1000 * currentPenetration) / 12;
```
Usa **solo SAM**, TAM è ignorato!

**Problema**: TAM è inutile se non influenza SAM.

---

### 3. SOM Calcolato MALE (calculations.ts:261-268)
```typescript
const scansY5 = monthlyData.slice(48, 60).reduce((sum, m) => sum + m.scansPerformed, 0);
const samVolumesAnnual = 31.9e6; // ⚠️ HARDCODED!
const effectiveScansY5 = scansY5 * realizationFactor;
const somPercent = (effectiveScansY5 / samVolumesAnnual) * 100;
```

**Problemi**:
- SAM hardcoded a 31.9M (ignora `assumptions.sam`!)
- SOM calcolato DOPO i ricavi (dovrebbe essere PRIMA!)
- SOM è solo una metrica di output, non guida i calcoli

---

## ✅ LOGICA CORRETTA (Come Dovrebbe Essere)

### Gerarchia Mercato → Ricavi

```
TAM (Total Market)
  ↓ × % Addressable
SAM (Serviceable Market) 
  ↓ × Market Penetration %
SOM (Share of Market - mercato conquistato)
  ↓ → Leads generation
Leads
  ↓ × Funnel (L2D × D2P × P2D)
Deals
  ↓ → Accounts attivi
Accounts × ARPA = MRR/ARR
```

### Esempio Numerico
```
TAM = 63.8M esami/anno (mercato Italia totale)
  ↓ × 50% addressable
SAM = 31.9M esami/anno (mercato target)
  ↓ × 0.008% penetration Y1
SOM = 2,552 esami/anno (mercato conquistato Anno 1)
  ↓ / 400 scans per device = 6.4 devices
  ↓ × lead factor
Leads = ~20 leads/mese Anno 1
  ↓ × funnel (20% L2D × 50% D2P × 60% P2D)
Deals = ~1.2 deals/mese
```

---

## 🎯 PROPOSTA RISTRUTTURAZIONE UI

### Parametri Mercato (3 livelli)

```typescript
┌─────────────────────────────────────────────────┐
│ 📊 Definizione Mercato                          │
├─────────────────────────────────────────────────┤
│                                                  │
│ TAM (Total Addressable Market)                  │
│ ┌──────────────────┐                            │
│ │ 63.8M esami/anno │  [Slider: 30M - 100M]      │
│ └──────────────────┘                            │
│                                                  │
│ % SAM Addressable (del TAM)                     │
│ ┌──────────────────┐                            │
│ │ 50% = 31.9M      │  [Slider: 30% - 70%]       │
│ └──────────────────┘                            │
│ → SAM = TAM × 50%                               │
│                                                  │
│ Market Penetration Y1 (del SAM)                 │
│ ┌──────────────────┐                            │
│ │ 0.008% = 2.5K    │  [Slider: 0.001% - 0.1%]   │
│ └──────────────────┘                            │
│ → SOM Y1 = SAM × 0.008%                         │
│                                                  │
│ Market Penetration Y5 (del SAM)                 │
│ ┌──────────────────┐                            │
│ │ 0.05% = 16K      │  [Slider: 0.01% - 1%]      │
│ └──────────────────┘                            │
│ → SOM Y5 = SAM × 0.05%                          │
│                                                  │
│ [ℹ️] I ricavi vengono dal SOM, non dal SAM!    │
│     SOM = mercato effettivamente conquistato    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 💰 Capitale Iniziale                            │
├─────────────────────────────────────────────────┤
│ Initial Cash                                     │
│ ┌──────────────────┐                            │
│ │ 2.0M€            │  [Slider: 0.5M - 10M]       │
│ └──────────────────┘                            │
│ → Influenza: Runway = Cash / Burn Rate          │
└─────────────────────────────────────────────────┘
```

---

## 🔧 FIX NECESSARI

### Fix 1: Calcolare SAM da TAM (CRITICO)
**File**: `src/lib/calculations.ts` line 69

**Aggiungere parametro**: `samAddressablePercent` (default: 0.5 = 50%)

```typescript
// NEW: Calculate SAM from TAM
const samAddressablePercent = drivers.samAddressablePercent || 0.5;
const sam = assumptions.tam * samAddressablePercent;

// Use calculated SAM, not hardcoded
const baseMonthlyLeads = (sam * 1000 * currentPenetration) / 12;
```

### Fix 2: Rimuovere SAM Hardcoded in SOM
**File**: `src/lib/calculations.ts` line 264

**PRIMA** (hardcoded):
```typescript
const samVolumesAnnual = 31.9e6; // ⚠️ BAD
```

**DOPO** (da assumptions):
```typescript
const sam = assumptions?.sam || 31900; // K units
const samVolumesAnnual = sam * 1000; // Convert to units
```

### Fix 3: Differenziare initialCash per Scenario
**File**: `src/data/scenarios.ts`

```typescript
// Prudente
assumptions: {
  initialCash: 2.5,  // Più cauto, più cash
  // ...
}

// Base
assumptions: {
  initialCash: 2.0,  // Standard
  // ...
}

// Ambizioso
assumptions: {
  initialCash: 1.5,  // Più aggressivo, meno cash buffer
  // ...
}
```

### Fix 4: UI Gerarchica TAM → SAM → SOM
**File**: `src/components/MasterDashboard.tsx`

Sostituire i 5 parametri flat con:
1. TAM (base)
2. samAddressablePercent (% del TAM)
3. marketPenetrationY1 (% del SAM)
4. marketPenetrationY5 (% del SAM)
5. initialCash (separato)

Mostrare valori derivati:
- `SAM = TAM × samAddressable%`
- `SOM Y1 = SAM × penetration Y1`

---

## 📊 IMPATTO ATTESO

### Dopo i Fix:

1. **TAM slider influenza tutto**:
   - TAM ↑ → SAM ↑ → SOM ↑ → Leads ↑ → MRR ↑

2. **SAM è derivato, non input**:
   - SAM = TAM × % addressable
   - Più intuitivo e corretto

3. **SOM guida i ricavi**:
   - SOM = SAM × market penetration
   - Leads basati su SOM, non SAM raw

4. **initialCash varia per scenario**:
   - Prudente: più cash → runway più lungo
   - Ambizioso: meno cash → runway più corto

---

## 🚀 PRIORITÀ

**CRITICO** (implementare ORA):
- [ ] Fix 1: SAM da TAM (non input separato) - RIMANDATO
- [x] Fix 2: Rimuovere SAM hardcoded in SOM - FATTO!
- [ ] Fix 3: initialCash per scenario - TODO

**Fix 2 APPLICATO** (calculations.ts line 265-268):
```typescript
// PRIMA (hardcoded):
const samVolumesAnnual = 31.9e6;

// DOPO (da assumptions):
const sam = this.scenario.assumptions?.sam || 31900;
const samVolumesAnnual = sam * 1000;
const realizationFactor = this.scenario.assumptions?.realizationFactor || 0.85;
```

**Effetto**: Ora slider SAM influenza SOM % correttamente!

**IMPORTANTE** (dopo fix critici):
- [ ] Fix 4: UI gerarchica

**BASSO** (opzionale):
- [ ] Visualizzazione waterfall TAM → SAM → SOM

---

## ✅ CONFERMA UTENTE

**L'utente ha ragione su tutto**:
1. ✅ initialCash non influenza → Fix 3 necessario
2. ✅ TAM non influenza, solo SAM → Fix 1 necessario  
3. ✅ SOM è fondamentale, non secondario → Fix 2 necessario
4. ✅ Ricavi vengono dal SOM, non dal SAM → Logica corretta

**Conclusione**: La logica attuale è **invertita**. Serve ristrutturazione completa della catena TAM → SAM → SOM.
