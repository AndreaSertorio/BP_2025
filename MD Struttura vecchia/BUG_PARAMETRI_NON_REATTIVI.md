# 🐛 BUG: Parametri TAM/SAM Non Reattivi

**Data**: 02/10/2025 18:20

## 🔴 PROBLEMA IDENTIFICATO

### 1. TAM/SAM slider non influenzano metriche
**Root cause**: `useMemo` dependencies in `MasterDashboard.tsx` line 69:
```typescript
}, [currentScenario, currentScenarioKey, forceRecalc]);
```

**Manca**: `currentScenario.assumptions` nelle dependencies!

Quando modifichi TAM/SAM via slider:
- ✅ `assumptions` cambia
- ❌ `currentScenario` object reference NON cambia
- ❌ `useMemo` NON ricalcola
- ❌ Metriche restano uguali

### 2. Cash Flow non varia con scenari
**Root cause**: Cash Flow usa SOLO `assumptions` (initialCash) che è uguale in tutti gli scenari!

```typescript
// advancedMetrics.ts:154
const initialCash = this.scenario.assumptions?.initialCash || 2.0;
```

**Problema**: initialCash è identico in prudente/base/ambizioso → Runway identico!

### 3. SOM non serve per le 9 metriche essenziali
**Conferma**: SOM si usa solo per Market Share % (metrica secondaria, non prioritaria).

## ✅ FIX NECESSARI

### Fix 1: Dependencies useMemo (CRITICO)
```typescript
// MasterDashboard.tsx line 69
}, [currentScenario.drivers, currentScenario.assumptions, currentScenarioKey]);
```

### Fix 2: Cash Flow deve usare drivers OPEX
Il problema è che Runway dipende da:
- initialCash (assumptions) → uguale in tutti scenari
- burnRate (EBITDA) → dipende da OPEX (drivers) → DIVERSO per scenario

**Soluzione**: Già funziona! Il bug è solo nelle dependencies useMemo.

### Fix 3: Rimuovere SOM da UI
Non serve per le 9 metriche essenziali.

## 🚀 AZIONE IMMEDIATA

1. ✅ Fix `useMemo` dependencies in MasterDashboard.tsx (FATTO)
2. ⏳ Test: cambia TAM → verifica MRR cambia
3. ⏳ Test: cambia scenario → verifica Burn Rate cambia

## 🔧 FIX APPLICATO

**File**: `src/components/MasterDashboard.tsx` line 69

**PRIMA** (non reattivo):
```typescript
}, [currentScenario, currentScenarioKey, forceRecalc]);
```

**DOPO** (reattivo a drivers e assumptions):
```typescript
}, [currentScenario.drivers, currentScenario.assumptions, currentScenario.base, currentScenarioKey, forceRecalc]);
```

**Effetto**:
- Ora quando modifichi TAM/SAM → `currentScenario.assumptions` cambia → useMemo ricalcola!
- Quando modifichi drivers (leadMult, ARPA, etc) → `currentScenario.drivers` cambia → useMemo ricalcola!

## ✅ TEST NECESSARI (Utente)

1. **Test TAM/SAM slider**:
   - Modifica TAM da 63.8M a 80M
   - Verifica che MRR/ARR cambiano
   - Nota: impatto potrebbe essere piccolo se market penetration è bassa

2. **Test cambio scenario**:
   - Cambia da Base → Prudente
   - Verifica Burn Rate cambia (dovrebbe aumentare con OPEX più alto)
   - Verifica Runway cambia

3. **Test market penetration**:
   - Modifica marketPenetrationY1 da 0.00008 a 0.0002
   - Verifica forte impatto su MRR/ARR/CAC
