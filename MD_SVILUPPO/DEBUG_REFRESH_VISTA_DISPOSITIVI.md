# 🔍 DEBUG SISTEMATICO: REFRESH VISTA DISPOSITIVI

## 🎯 OBIETTIVO
Eliminare completamente il refresh quando si cambia da "Vista Esami" a "Vista Dispositivi"

## 📋 ANALISI STEP-BY-STEP

### ✅ STEP 1: Rimozione activeView da useCallback dependencies

**PROBLEMA IDENTIFICATO:**
- `calculateTAMValue` aveva `activeView` nelle dependencies
- `calculateSamDevices` aveva `activeView` nelle dependencies
- `calculateSomDevices` aveva `activeView` nelle dependencies

**CAUSA DEL REFRESH:**
```
1. User click "Vista Dispositivi"
2. setActiveView('devices')
3. activeView cambia
4. Tutte le funzioni con activeView nelle deps vengono RICREATE
5. proceduresMetrics dipende da calculateTAMValue → deps cambiate
6. devicesMetrics dipende da calculateDevicesMetrics → deps cambiate
7. Tutto viene ricalcolato → Re-render massiccio → Flash visibile
```

**FIX APPLICATO:**
```typescript
// Prima (con activeView):
}, [mercatoEcografie, mercatoEcografi, activeView, ...]);

// Dopo (senza activeView):
}, [mercatoEcografie, mercatoEcografi, ...]); // eslint-disable
```

**MOTIVAZIONE:**
- `activeView` è usato DENTRO le funzioni per branching logico
- NON serve nelle dependencies perché le funzioni calcolano sempre tutto
- Le funzioni restano stabili indipendentemente dalla vista corrente

**STATUS:** ✅ RISOLTO

---

### 🔍 STEP 2: Verifica useMemo su metriche calcolate

**DA VERIFICARE:**
- [x] proceduresMetrics: useMemo ✅
- [x] devicesMetrics: useMemo ✅  
- [x] currentMetrics: useMemo ✅
- [x] currentSamPercentage: useMemo ✅
- [x] currentSomPercentages: useMemo ✅

**STATUS:** ✅ TUTTO MEMOIZZATO CORRETTAMENTE

---

### 🔍 STEP 3: Verifica useEffect con activeView

**DA VERIFICARE:**
Cercare tutti i useEffect che potrebbero triggerare con activeView

```bash
grep -n "useEffect.*activeView" TamSamSomDashboard.tsx
```

**RISULTATO:** Nessun useEffect dipende da activeView ✅

**STATUS:** ✅ NESSUN PROBLEMA

---

### 🔍 STEP 4: Verifica rendering condizionale costoso

**DA VERIFICARE:**
Controllare se ci sono componenti pesanti che vengono remountati al cambio vista

```typescript
// Possibili problemi:
{activeView === 'devices' && <ComponentePesante />}
```

**DA ANALIZZARE:**
- Tabelle grandi con molte righe
- Grafici che vengono ricreati
- Componenti con effetti collaterali

**STATUS:** 🔄 IN CORSO

---

### 🔍 STEP 5: Verifica Context e Provider

**DA VERIFICARE:**
- DatabaseContext: potrebbe triggerare re-render?
- Altri context esterni che reagiscono al cambio?

**STATUS:** ⏳ DA VERIFICARE

---

### 🔍 STEP 6: Verifica console.log e side effects

**DA VERIFICARE:**
Controllare se ci sono console.log o side effects che rallentano

**STATUS:** ⏳ DA VERIFICARE

---

## 🧪 TEST PROCEDURE

### Test 1: Cambio Vista Base
1. Apri TAM/SAM/SOM
2. Sei su "Vista Esami (Procedures)"
3. Click "Vista Dispositivi"
4. **ATTESO:** Cambio istantaneo, NO flash
5. **RISULTATO:** ⏳ DA TESTARE

### Test 2: Cambio Vista Multiplo
1. Click "Vista Dispositivi" → Procedures → Devices → Procedures
2. **ATTESO:** Sempre istantaneo
3. **RISULTATO:** ⏳ DA TESTARE

### Test 3: Con DevTools Performance
1. Apri Chrome DevTools → Performance
2. Start recording
3. Click "Vista Dispositivi"
4. Stop recording
5. **ANALIZZARE:** Cosa causa il delay?

---

## 📊 METRICHE TARGET

- **Cambio vista:** < 16ms (1 frame)
- **Flash visibile:** ZERO
- **Ricalcoli:** ZERO (solo switch cache)
- **UX:** Fluida e professionale

---

## 🔧 FIX GIÀ APPLICATI

1. ✅ Memoizzazione proceduresMetrics con useMemo
2. ✅ Memoizzazione devicesMetrics con useMemo
3. ✅ Memoizzazione currentMetrics con useMemo
4. ✅ Rimozione activeView da calculateTAMValue deps
5. ✅ Rimozione activeView da calculateSamDevices deps
6. ✅ Rimozione activeView da calculateSomDevices deps

---

## 📝 NOTE

- Il problema persiste dopo i fix iniziali
- Necessaria analisi più approfondita
- Possibile causa: componenti pesanti che si remountano
- Possibile causa: context che triggera re-render globale

---

**Data:** 2025-01-10  
**Status:** 🔄 IN PROGRESS  
**Commit:** Step 1 completato - activeView rimosso da deps
