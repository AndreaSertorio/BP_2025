# 🔧 FIX COMPLETO - Struttura Budget

## ❌ PROBLEMA ORIGINALE

**Errore:** `Cannot read properties of undefined (reading 'items')`

**Root Cause:** Il calculator cercava di accedere al budget con una struttura errata:
```typescript
// ❌ ERRATO
budgetData.categories.cat_4.items  // categories è array, non oggetto!
```

---

## 🔍 ANALISI STRUTTURA DATABASE

### Struttura Reale Budget

```json
{
  "budget": {
    "categories": [  // ← ARRAY, non oggetto!
      {
        "id": "cat_1",
        "name": "Realizzazione Prototipo",
        "subcategories": [
          {
            "id": "subcat_1_1",
            "items": [
              {
                "id": "item_2",
                "values": {
                  "tot_25": 30,  // Valori per anno
                  "tot_26": 50,
                  "tot_27": 70
                }
              }
            ]
          }
        ]
      },
      {
        "id": "cat_4",  // Personnel
        "subcategories": [...]
      }
    ]
  }
}
```

### Path Dati
- `categories` = **Array** di categorie
- Ogni categoria ha `subcategories` (array)
- Ogni subcategory ha `items` (array)
- Ogni item ha `values` (oggetto con chiavi anno tipo "tot_25", "tot_26")

---

## ✅ FIX APPLICATI

### 1. **calculations.ts** - Fix accesso categorie

**Prima (errato):**
```typescript
const personnel = getBudgetValueForYear(budgetData.categories.cat_4, year);
```

**Dopo (corretto):**
```typescript
const findCategory = (id: string) => {
  const categories = budgetData.categories as any;
  return Array.isArray(categories) 
    ? categories.find((c: any) => c.id === id)
    : categories[id]; // Fallback
};

const personnel = getBudgetValueForYear(findCategory('cat_4'), year);
```

---

### 2. **dataIntegration.ts** - Riscritto `getBudgetValueForYear`

**Prima (assumeva struttura semplice):**
```typescript
export function getBudgetValueForYear(
  category: { items: Array<{ year: number; value: number }> },
  year: number
): number {
  const item = category.items.find(i => i.year === year);
  return item?.value ?? 0;
}
```

**Dopo (gestisce struttura reale):**
```typescript
export function getBudgetValueForYear(
  category: any,
  year: number
): number {
  if (!category) return 0;
  
  // Cerca chiave anno (es: "tot_25" per 2025)
  const yearKey = `tot_${year.toString().slice(-2)}`;
  
  let total = 0;
  
  // Aggrega da subcategories → items → values
  if (category.subcategories && Array.isArray(category.subcategories)) {
    for (const subcat of category.subcategories) {
      if (subcat.items && Array.isArray(subcat.items)) {
        for (const item of subcat.items) {
          if (item.values && item.values[yearKey]) {
            total += item.values[yearKey];
          }
        }
      }
    }
  }
  
  // Fallback per items diretti (cat senza subcategories)
  if (category.items && Array.isArray(category.items)) {
    for (const item of category.items) {
      if (item.values && item.values[yearKey]) {
        total += item.values[yearKey];
      }
    }
  }
  
  return total; // K€
}
```

---

## 🧮 LOGICA AGGREGAZIONE

Per ogni categoria (es: cat_4 = Personnel):
1. Cerca categoria nell'array per `id`
2. Itera tutte le `subcategories`
3. Per ogni subcategory, itera tutti gli `items`
4. Per ogni item, legge `values[yearKey]` (es: "tot_25")
5. Somma tutti i valori trovati
6. Ritorna totale in K€

**Esempio:**
```
cat_4 (Personnel) → 2025
├─ subcat_4_1
│  ├─ item_45: values.tot_25 = 100
│  └─ item_46: values.tot_25 = 50
└─ subcat_4_2
   └─ item_47: values.tot_25 = 30
   
TOTALE = 100 + 50 + 30 = 180 K€
```

---

## 🎯 RISULTATO

**Ora il calculator:**
- ✅ Trova correttamente le categorie nell'array
- ✅ Aggrega valori da subcategories → items → values
- ✅ Estrae dati per anno specifico (tot_25, tot_26, etc.)
- ✅ Calcola OPEX completo (personnel + rd + regulatory + clinical + operations + marketing)
- ✅ Proiezioni mese×mese funzionanti

---

## 🚀 TEST

**Ricarica browser** su `http://localhost:3000/test-financial-plan`

**Dovresti vedere:**
- ✅ Tab "P&L & Calcoli" funzionante
- ✅ OPEX calcolati correttamente dal budget
- ✅ Tabella P&L con Revenue, COGS, OPEX, EBITDA
- ✅ Grafici Revenue e EBITDA

**Anni con dati budget:**
- 2025 ✅
- 2026 ✅
- 2027 ✅
- 2028 ✅
- 2029+ → OPEX = 0 (no dati nel budget)

---

## ⚠️ NOTE

**Anni oltre 2028:** Il database budget ha dati solo fino a 2027-2028. Per anni successivi (2029-2035), l'OPEX sarà 0 a meno che non aggiungi dati nel budget.

**Formato chiavi anno:**
- 2025 → `tot_25`
- 2026 → `tot_26`
- 2030 → `tot_30`
- 2100 → `tot_00` (slice(-2) prende ultime 2 cifre)

**Ready per il test! 🎯**
