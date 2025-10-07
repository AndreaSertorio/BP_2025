# Implementazione Totali Automatici e Colorazione

**Data:** 7 Ottobre 2025, 14:05  
**Versione:** 1.0.9  
**Status:** ✅ Implementato

---

## ✨ Funzionalità Implementate

### 1. Somma Automatica Totali Annuali ✅

Le colonne totali (`tot_2025`, `tot_2026`, `tot_2027`, `tot_2028`) ora calcolano **automaticamente** la somma dei 4 trimestri dell'anno:

```
tot_2025 = Q1_2025 + Q2_2025 + Q3_2025 + Q4_2025
tot_2026 = Q1_2026 + Q2_2026 + Q3_2026 + Q4_2026
... e così via
```

### 2. Colorazione Distinguibile ✅

Le colonne totali hanno un **colore ambra** distintivo:
- **Header:** Ambra scuro (`bg-amber-200`, testo `text-amber-900`)
- **Celle:** Ambra chiaro (`bg-amber-50`)
- **Valori:** Ambra scuro con grassetto (`bg-amber-100`, `font-bold`)

### 3. Totali NON Editabili ✅

Le colonne totali sono **calcolate e read-only**:
- ❌ NON cliccabili
- ❌ NON editabili
- ✅ Si aggiornano automaticamente quando modifichi i trimestri
- ✅ NON vengono salvate nel database (sono calcolate al volo)

---

## 🎨 Aspetto Visivo

### Colonne Trimestri (Q1, Q2, Q3, Q4)

**Header:**
- Alternato blu/viola (`bg-blue-100` / `bg-purple-100`)

**Celle:**
- Bianco con hover blu
- **Cliccabili** (cursor pointer)
- **Editabili**

### Colonne Totali (tot_2025, tot_2026, etc.)

**Header:**
- **Ambra scuro** (`bg-amber-200`)
- **Grassetto** (`font-bold`)
- **Testo ambra** (`text-amber-900`)

**Celle:**
- **Sfondo ambra chiaro** (`bg-amber-50`)
- **Valori in grassetto** (`font-bold`)
- **Testo ambra scuro** (`text-amber-900`)
- **Sfondo interno ambra** (`bg-amber-100`)
- **NON cliccabili** (no hover, no cursor pointer)

---

## 📊 Formula di Calcolo

### Logica Implementata

```typescript
const isYearTotal = period.id.startsWith('tot_');

if (isYearTotal) {
  // Estrai l'anno: "tot_25" → "25"
  const year = period.id.split('_')[1];
  
  // Crea array con IDs dei 4 trimestri
  const quarterIds = [`q1_${year}`, `q2_${year}`, `q3_${year}`, `q4_${year}`];
  
  // Somma i valori
  displayValue = quarterIds.reduce((sum, qId) => {
    const qValue = item.values[qId];
    return sum + (typeof qValue === 'number' ? qValue : 0);
  }, 0);
}
```

### Gestione Valori Null/Undefined

```typescript
// Se un trimestre è null o undefined, viene contato come 0
typeof qValue === 'number' ? qValue : 0
```

**Esempio:**
```
Q1_2025 = 100
Q2_2025 = null  → conta come 0
Q3_2025 = 50
Q4_2025 = 25
─────────────────
tot_2025 = 175 ✅
```

---

## 🔄 Comportamento Dinamico

### Scenario di Utilizzo

**Stato iniziale:**
```
Q1_2025 = 10
Q2_2025 = 20
Q3_2025 = 30
Q4_2025 = 40
──────────────
tot_2025 = 100
```

**User modifica Q1_2025 da 10 a 50:**
```
1. Click Q1_2025
2. Modifica: 10 → 50
3. Premi INVIO
4. Salva nel database
5. refreshData() ricarica tutto
6. tot_2025 ricalcolato automaticamente
```

**Risultato:**
```
Q1_2025 = 50  ✏️ modificato
Q2_2025 = 20
Q3_2025 = 30
Q4_2025 = 40
──────────────
tot_2025 = 140  ✅ aggiornato automaticamente!
```

---

## 🎯 Vantaggi del Calcolo Automatico

### ✅ Pro

1. **Sempre corretti:** I totali sono sempre = Q1+Q2+Q3+Q4
2. **No errori umani:** Non puoi inserire un totale sbagliato
3. **Update automatico:** Modifichi un trimestre, il totale si aggiorna
4. **No duplicazione dati:** Totali non salvati in DB (calcolati al volo)
5. **Visivamente distinguibili:** Colore ambra = "questo è calcolato"

### ⚠️ Nota Importante

I totali nel `database.json` vengono **ignorati**. Anche se ci sono valori in `tot_25`, `tot_26`, etc., questi vengono sovrascritti dal calcolo dinamico.

---

## 🔧 Dettagli Implementazione

### File Modificato

**`src/components/BudgetWrapper.tsx`**

### 1. Header Tabella

```typescript
{periodsToShow.map((period, idx) => {
  const isYearTotal = period.id.startsWith('tot_');
  return (
    <th 
      key={period.id} 
      className={`p-3 text-right border-r border-white min-w-[120px] ${
        isYearTotal 
          ? 'bg-amber-200 font-bold text-amber-900'  // ← Ambra per totali
          : idx % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'  // ← Blu/viola per trimestri
      }`}
    >
      {period.name}
    </th>
  );
})}
```

### 2. Celle Tabella

```typescript
{periodsToShow.map((period) => {
  // Verifica se è totale
  const isYearTotal = period.id.startsWith('tot_');
  
  // Calcola valore
  let displayValue = item.values[period.id];
  if (isYearTotal) {
    const year = period.id.split('_')[1];
    const quarterIds = [`q1_${year}`, `q2_${year}`, `q3_${year}`, `q4_${year}`];
    displayValue = quarterIds.reduce((sum, qId) => {
      const qValue = item.values[qId];
      return sum + (typeof qValue === 'number' ? qValue : 0);
    }, 0);
  }
  
  const canEdit = !isYearTotal;  // ← Totali NON editabili
  
  return (
    <td 
      className={`p-1 text-right ${isYearTotal ? 'bg-amber-50' : 'group'}`}
      onClick={() => !isEditing && canEdit && startEditing(...)}
    >
      <div className={`px-2 py-1 rounded transition-colors ${
        isYearTotal 
          ? 'font-bold text-amber-900 bg-amber-100'  // ← Ambra grassetto
          : 'cursor-pointer hover:bg-blue-50'         // ← Hover blu per editabili
      }`}>
        {displayValue !== null && displayValue !== undefined && displayValue !== 0 ? (
          <span className="font-medium">{displayValue.toLocaleString()}</span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
    </td>
  );
})}
```

---

## 🧪 Test di Verifica

### Test 1: Somma Corretta

**Setup:**
```
Q1_2025 = 25
Q2_2025 = 30
Q3_2025 = 35
Q4_2025 = 40
```

**Verifica:**
```
tot_2025 = 130 ✅ (25+30+35+40)
```

### Test 2: Update Automatico

**Step:**
1. Modifica Q1_2025: 25 → 100
2. Premi INVIO
3. **Verifica:** tot_2025 = 205 ✅ (100+30+35+40)

### Test 3: Valori Null

**Setup:**
```
Q1_2026 = 10
Q2_2026 = null
Q3_2026 = null
Q4_2026 = 5
```

**Verifica:**
```
tot_2026 = 15 ✅ (10+0+0+5)
```

### Test 4: Totale NON Editabile

**Step:**
1. Click su tot_2025
2. **Verifica:** Nessun input appare ✅
3. **Verifica:** Cursor normale (non pointer) ✅

### Test 5: Colorazione

**Verifica visiva:**
- ✅ Header tot_2025, tot_2026, etc. → Ambra scuro
- ✅ Celle totali → Ambra chiaro
- ✅ Valori totali → Ambra scuro grassetto
- ✅ Distinguibili dai trimestri (blu/viola)

---

## 📈 Tabella Comparativa

| Aspetto | Trimestri (Q1-Q4) | Totali Annuali (tot_XX) |
|---------|-------------------|-------------------------|
| **Editabili** | ✅ Sì | ❌ No (calcolati) |
| **Salvati in DB** | ✅ Sì | ❌ No (ignorati) |
| **Colore Header** | Blu/Viola alternato | Ambra scuro |
| **Colore Celle** | Bianco | Ambra chiaro |
| **Font Peso** | Medium | **Bold** |
| **Hover** | ✅ Blu | ❌ Nessuno |
| **Cursor** | Pointer (cliccabile) | Default (non cliccabile) |
| **Calcolo** | Valore dal DB | Q1+Q2+Q3+Q4 |

---

## 🎨 Palette Colori

### Trimestri
- **Header Q1, Q3:** `bg-blue-100` (blu chiaro)
- **Header Q2, Q4:** `bg-purple-100` (viola chiaro)
- **Celle:** `bg-white` → `hover:bg-blue-50`
- **Valori:** `text-gray-900`

### Totali
- **Header:** `bg-amber-200` (ambra medio)
- **Testo Header:** `text-amber-900` (ambra scuro)
- **Sfondo Cella:** `bg-amber-50` (ambra molto chiaro)
- **Sfondo Valore:** `bg-amber-100` (ambra chiaro)
- **Testo Valore:** `text-amber-900` + `font-bold`

---

## ✅ Checklist Completamento

- [x] Calcolo automatico somma trimestri
- [x] Totali aggiornati dinamicamente
- [x] Totali NON editabili
- [x] Colorazione ambra header totali
- [x] Colorazione ambra celle totali
- [x] Font grassetto per valori totali
- [x] No hover su celle totali
- [x] No cursor pointer su celle totali
- [x] Gestione valori null/undefined
- [x] Build compilata senza errori

---

## 🚀 Risultato Finale

### Prima (Senza Totali Automatici)

```
Q1_2025 = 10 ✏️ editabile
Q2_2025 = 20 ✏️ editabile
Q3_2025 = 30 ✏️ editabile
Q4_2025 = 40 ✏️ editabile
tot_2025 = 85 ✏️ editabile (SBAGLIATO! dovrebbe essere 100)
```

### Dopo (Con Totali Automatici)

```
Q1_2025 = 10 ✏️ editabile
Q2_2025 = 20 ✏️ editabile
Q3_2025 = 30 ✏️ editabile
Q4_2025 = 40 ✏️ editabile
tot_2025 = 100 🔒 calcolato (SEMPRE CORRETTO!) [AMBRA]
```

---

**Status:** ✅ **IMPLEMENTATO E FUNZIONANTE**

**Ready for:** Test utente completo

**Come Testare:**
1. Ricarica http://localhost:3000
2. Budget → Tabella Budget
3. Espandi categoria
4. **Verifica colore ambra** su colonne totali
5. **Modifica un trimestre** (es. Q1_2025)
6. **Verifica tot_2025** si aggiorna automaticamente
7. **Prova a cliccare tot_2025** → Non editabile ✅
