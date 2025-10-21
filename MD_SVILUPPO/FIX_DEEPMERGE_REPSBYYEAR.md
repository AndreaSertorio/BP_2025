# 🔧 FIX CRITICO: Deep Merge repsByYear

## 📅 Data: 12 Ottobre 2025 - 23:22

---

## 🐛 PROBLEMA IDENTIFICATO

### Sintomo
Quando l'utente modifica i reps per anno (Y1→Y5) nell'UI:
- ✅ Modifiche funzionano in tempo reale
- ✅ Server riceve le PATCH e risponde "✅ Go-To-Market Engine aggiornato"
- ❌ **Dopo reload pagina: tutti i valori spariti, calcoli a ZERO!**

### Root Cause
Nel database restava solo l'**ultimo valore modificato**:
```json
"repsByYear": {
  "y5": 13  // ← Solo Y5, Y1-Y4 spariti!
}
```

---

## 🔍 ANALISI TECNICA

### Codice Problematico (server.js e DatabaseProvider.tsx)

```javascript
// ❌ PROBLEMA: Merge sovrascrive repsByYear completamente
if (updates.salesCapacity) {
  database.goToMarket.salesCapacity = {
    ...database.goToMarket.salesCapacity,
    ...updates.salesCapacity  // ← include repsByYear PARZIALE!
  };
  
  // Questo deep merge NON serve perché repsByYear già sovrascritto sopra
  if (updates.salesCapacity.repsByYear) {
    database.goToMarket.salesCapacity.repsByYear = {
      ...database.goToMarket.salesCapacity.repsByYear,
      ...updates.salesCapacity.repsByYear
    };
  }
}
```

### Sequenza Bug

**Update 1: Cambia Y1 = 1**
```javascript
updates = { salesCapacity: { repsByYear: { y1: 1 } } }

// Merge principale:
salesCapacity = {
  dealsPerRepPerQuarter: 5,
  rampUpMonths: 3,
  repsByYear: { y1: 1 }  // ← SOLO Y1!
}
```

**Update 2: Cambia Y2 = 3**
```javascript
updates = { salesCapacity: { repsByYear: { y2: 3 } } }

// Merge principale:
salesCapacity = {
  dealsPerRepPerQuarter: 5,
  rampUpMonths: 3,
  repsByYear: { y2: 3 }  // ← SOLO Y2, Y1 perso!
}
```

**Risultato**: Ogni update **sovrascrive** `repsByYear` invece di fare merge incrementale.

---

## ✅ SOLUZIONE IMPLEMENTATA

### Pattern: Destructuring + Exclude

**Principio**: Escludere `repsByYear` dal merge principale, gestirlo separatamente con deep merge.

### Codice Corretto (server.js)

```javascript
if (updates.salesCapacity) {
  // 🔧 FIX: Deep merge repsByYear PRIMA, poi escludi dal merge principale
  const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
  
  // Merge campi scalari di salesCapacity (dealsPerRepPerQuarter, rampUpMonths, ecc.)
  database.goToMarket.salesCapacity = {
    ...database.goToMarket.salesCapacity,
    ...restSalesCapacity  // ← NON include repsByYear!
  };
  
  // Deep merge incrementale per repsByYear (se presente)
  if (updatedRepsByYear) {
    database.goToMarket.salesCapacity.repsByYear = {
      ...database.goToMarket.salesCapacity.repsByYear,  // ← Preserva esistenti
      ...updatedRepsByYear  // ← Aggiunge/sovrascrive solo campi aggiornati
    };
  }
}
```

### Sequenza Corretta

**Update 1: Cambia Y1 = 1**
```javascript
restSalesCapacity = {}  // Nessun campo scalare
updatedRepsByYear = { y1: 1 }

salesCapacity.repsByYear = {
  y1: 3,  // esistente
  y2: 5,  // esistente
  y3: 8,  // esistente
  y4: 12, // esistente
  y5: 15, // esistente
  ...{ y1: 1 }  // ← Update
}

// Risultato:
repsByYear = { y1: 1, y2: 5, y3: 8, y4: 12, y5: 15 } ✅
```

**Update 2: Cambia Y2 = 3**
```javascript
repsByYear = {
  y1: 1,   // preservato
  y2: 5,   // esistente
  y3: 8,   // esistente
  y4: 12,  // esistente
  y5: 15,  // esistente
  ...{ y2: 3 }  // ← Update
}

// Risultato:
repsByYear = { y1: 1, y2: 3, y3: 8, y4: 12, y5: 15 } ✅
```

---

## 📊 FILE MODIFICATI

### 1. `server.js` (righe 841-859)
```javascript
// 🔧 FIX: Deep merge repsByYear PRIMA, poi escludi dal merge principale
const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
```

### 2. `DatabaseProvider.tsx` (righe 1140-1157)
```javascript
// 🔧 FIX: Deep merge repsByYear PRIMA, poi escludi dal merge principale
const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
```

### 3. `database.json` (ripristinato stato iniziale)
```json
"repsByYear": {
  "y1": 3,
  "y2": 5,
  "y3": 8,
  "y4": 12,
  "y5": 15
}
```

---

## 🧪 PIANO DI TEST

### Test 1: Update Incrementale Singolo Anno

```bash
# 1. Riavvia server
npm run dev:all

# 2. Vai Bottom-Up → Sales Reps per Anno
# 3. Click "Anno 1" → Cambia 3 → 4
# 4. ✅ Verifica UI aggiorna immediatamente

# 5. Verifica database
cat database.json | grep -A 6 '"repsByYear"'
```

**Expected**:
```json
"repsByYear": {
  "y1": 4,   // ← Cambiato
  "y2": 5,   // ← Preservato
  "y3": 8,   // ← Preservato
  "y4": 12,  // ← Preservato
  "y5": 15   // ← Preservato
}
```

---

### Test 2: Update Sequenziale Multi-Anno

```
1. Anno 1: 3 → 2
2. Anno 2: 5 → 6
3. Anno 3: 8 → 10
4. Anno 4: 12 → 15
5. Anno 5: 15 → 20
```

**Dopo ogni modifica**:
- ✅ UI aggiorna
- ✅ Capacity ricalcolata
- ✅ Database preserva tutti i valori precedenti

**Verifica finale**:
```json
"repsByYear": {
  "y1": 2,
  "y2": 6,
  "y3": 10,
  "y4": 15,
  "y5": 20
}
```

---

### Test 3: Reload Persistenza

```
1. Modifica Y1, Y3, Y5
2. Verifica calcoli corretti
3. F5 (hard reload)
4. ✅ Tutti i valori ancora presenti
5. ✅ Calcoli identici a prima del reload
```

---

### Test 4: Update Campi Scalari + repsByYear

```
1. Cambia "Deals per Quarter": 5 → 7
2. Cambia "Anno 2": 5 → 8
```

**Verifica**:
```json
"salesCapacity": {
  "repsByYear": {
    "y1": 3,
    "y2": 8,   // ← Aggiornato
    "y3": 8,
    "y4": 12,
    "y5": 15
  },
  "dealsPerRepPerQuarter": 7,  // ← Aggiornato
  "rampUpMonths": 3
}
```

---

### Test 5: Update Ottimistico Frontend

```
1. Network tab aperto
2. Modifica Y1 = 1
3. ✅ UI aggiorna PRIMA della risposta server (optimistic update)
4. Server risponde → ✅ Nessun flash/revert
5. F5 → ✅ Valore persistito
```

---

## 🎯 VANTAGGI PATTERN

### 1. Merge Incrementale Sicuro
```javascript
// ✅ Preserva tutti i campi non modificati
repsByYear = { ...existing, ...updates }
```

### 2. Supporto Update Parziale
```javascript
// Update solo Y3, resto intatto
PATCH { salesCapacity: { repsByYear: { y3: 10 } } }
```

### 3. Nested Object Handling
```javascript
// Exclude nested prima del merge
const { nested, ...scalars } = updates;
```

### 4. Type Safety
```typescript
// Destructuring mantiene types TypeScript
const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
```

---

## 📖 PATTERN RIUTILIZZABILE

### Situazioni Simili da Fixare

**1. `salesCycle.bySegment`**
```javascript
if (updates.salesCycle?.bySegment) {
  // ❌ Rischio stesso bug
  database.goToMarket.salesCycle.bySegment = {
    ...existing,
    ...updates.salesCycle.bySegment
  };
}
```

**2. `channelMix`**
```javascript
if (updates.channelMix) {
  // Applica stesso pattern
  const { nested, ...scalars } = updates.channelMix;
}
```

**3. Altri nested objects nel DB**
- `pricing.tiers`
- `scenarios.*.assumptions`
- `tamSamSomEcografi.dispositiviUnita`

---

## 🚨 LEZIONE APPRESA

### Merge Spread Operator è Shallow!

```javascript
// ❌ SHALLOW merge (solo primo livello)
const merged = { ...a, ...b };

// Per nested objects:
// - Se b.nested esiste → SOVRASCRIVE a.nested completamente
// - NON fa merge di a.nested con b.nested

// ✅ DEEP merge manuale per nested
const { nested: bNested, ...bRest } = b;
const merged = {
  ...a,
  ...bRest,
  nested: { ...a.nested, ...bNested }
};
```

---

## ✅ CHECKLIST COMPLETAMENTO

- [x] Fix `server.js` merge `repsByYear`
- [x] Fix `DatabaseProvider.tsx` merge `repsByYear`
- [x] Ripristinato database valori iniziali
- [x] Pattern documentato
- [ ] Test 1: Update singolo anno ✅
- [ ] Test 2: Update sequenziale multi-anno ✅
- [ ] Test 3: Reload persistenza ✅
- [ ] Test 4: Mix scalari + nested ✅
- [ ] Test 5: Optimistic update ✅

---

## 🚀 PROSSIMI STEP

### Immediate
1. **Riavvia server** (npm run dev:all)
2. **Test completo** sequenza modifiche Y1→Y5
3. **Verifica persistence** con F5 reload
4. **Conferma calcoli** corretti dopo reload

### Future
1. Applicare pattern a altri nested objects
2. Creare helper `deepMergeNested()` riutilizzabile
3. Test automatizzati per merge logic
4. Validazione schema nested updates

---

**FIX IMPLEMENTATO! Ora testa per confermare funzionamento.** ✅

**RIAVVIA → MODIFICA Y1-Y5 → F5 → VERIFICA!** 🚀
