# 🔍 DEBUG - Problemi Dati Finanziari

## ❌ PROBLEMI IDENTIFICATI DALLE IMMAGINI

### 1. **OPEX Negativi**
```
2025: (€139K)  ❌ Dovrebbe essere €139K
2026: (€810K)  ❌ Dovrebbe essere €810K
2027: (€688K)  ❌ Dovrebbe essere €688K
2028: (€1.28M) ❌ Dovrebbe essere €1.28M
```

### 2. **Revenue €NaN dal 2029**
```
2029: €NaN  ❌ Dovrebbe essere ~€500K-1M
2030: €NaN  ❌
2031: €NaN  ❌
```

### 3. **EBITDA €NaN nelle summary**
```
EBITDA Cumulato: €NaN  ❌
Cash Balance Finale: €0  ❌
```

### 4. **Grafici Parzialmente Corretti**
- ✅ Revenue Breakdown 2029-2031: Mostra barre (ma valori hover €0)
- ❌ EBITDA Trend: Linea piatta a €0 invece di burn negativo 2025-2028

---

## 🔍 POSSIBILI CAUSE

### Causa 1: Budget con Valori Negativi
Nel database alcuni items hanno valori **negativi** nelle colonne `tot_25`, `tot_26`, etc:
```json
{
  "values": {
    "tot_25": -139,  // ← NEGATIVO!
    "tot_26": -810,
    "tot_27": -688
  }
}
```

**Soluzione:** Applicare `Math.abs()` sui valori OPEX.

---

### Causa 2: Revenue Calculation €NaN
Il calculator cerca di leggere `realisticSales` ma:
- Potrebbe non trovare i dati GTM
- Potrebbe esserci errore nel mapping y1-y5 → anni calendario

**Verifica necessaria:**
- goToMarket.calculated.realisticSales esiste? ✅ (confermato)
- Mapping anni corretto? (y1 = quale anno?)

---

### Causa 3: Gross Margin / COGS Calculation
Se Revenue = NaN, allora:
```
COGS = Revenue × (1 - grossMargin) = NaN × 0.45 = NaN
EBITDA = Gross Profit - OPEX = NaN - 139K = NaN
```

**Dipendenza a catena:**
```
Revenue NaN → COGS NaN → Gross Profit NaN → EBITDA NaN
```

---

## 🛠️ FIX APPLICATI

### 1. ✅ **Logging Esteso**

**In `dataIntegration.ts`:**
```typescript
console.log('📊 [readBudgetData] categories type:', Array.isArray(...));
console.log('📊 [readBudgetData] categories count:', ...);
console.log('📊 [readBudgetData] category IDs:', ...);
```

**In `getBudgetValueForYear`:**
```typescript
console.log(`📊 [getBudgetValueForYear] cat ${id} year ${year} → key "${yearKey}"`);
console.log(`  ├─ ${subcategories.length} subcategories`);
console.log(`  ├─ item ${item.id}: +${value}K`);
console.log(`  └─ TOTAL: ${total}K`);
```

### 2. ✅ **Fix Struttura Budget**
- `readBudgetData` ora passa l'array direttamente
- `getBudgetValueForYear` gestisce array di categories
- `calculateOpex` trova categorie con `.find(c => c.id === 'cat_X')`

---

## 🧪 TEST DIAGNOSTICO

### **Step 1: Ricarica browser con console aperta**
```bash
# Apri DevTools (F12)
# Vai su Console
# Ricarica pagina (Cmd+R)
```

### **Step 2: Cerca questi log**
```
📊 [readBudgetData] categories type: ARRAY
📊 [readBudgetData] categories count: 7
📊 [readBudgetData] category IDs: ['cat_1', 'cat_2', ...]

📊 [getBudgetValueForYear] cat cat_1 year 2025 → key "tot_25"
  ├─ 3 subcategories
  ├─ item item_2: +30K
  ├─ item item_3: +20.01K
  └─ TOTAL: XXX.XXK
```

### **Step 3: Verifica valori**
Per ogni anno (2025-2028):
- ✅ TOTAL dovrebbe essere **POSITIVO**
- ❌ Se TOTAL è negativo → database ha valori negativi
- ❌ Se TOTAL è 0 → chiave anno errata o items vuoti

---

## 🎯 AZIONI SUCCESSIVE

### Se OPEX è negativo:
**Fix nel calculator:**
```typescript
const personnel = Math.abs(getBudgetValueForYear(...)) * 1000;
const rd = Math.abs(getBudgetValueForYear(...)) * 1000;
// etc...
```

### Se Revenue è NaN:
**Verifica mapping y1-y5:**
```typescript
// In calculations.ts - calculateRevenue()
// y1 corrisponde a quale anno calendario?
// Forse serve: revenueStartYear + (yearIndex - 1)
```

---

## 📋 CHECKLIST DEBUG

- [ ] Console mostra "ARRAY" per categories type?
- [ ] Tutti i category IDs trovati (cat_1 ... cat_6)?
- [ ] Budget totals sono POSITIVI per 2025-2028?
- [ ] GTM realisticSales caricati (y1-y5)?
- [ ] Revenue calculation trova fase business corretta?
- [ ] Mapping anni calendario corretto?

---

## 🚀 PROSSIMI STEP

1. **Testa con console aperta** → Copia i log qui
2. **Identifica se OPEX negativi** → Applico Math.abs()
3. **Identifica se Revenue NaN** → Fix mapping anni
4. **Re-test** → Verifica grafici e tabella

**Testa ora e mandami i log della console! 📊**
