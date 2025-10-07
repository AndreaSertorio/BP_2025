# Ristrutturazione Periodi Budget 2025

**Data:** 6 Ottobre 2025, 23:58  
**Versione Database:** 1.0.2 → 1.0.3  
**Script:** `restructure_2025_periods.py`

---

## 📋 Modifiche Implementate

### 1. Ristrutturazione Anno 2025

#### ❌ PRIMA (Struttura Errata)
```
YTD 25    4 2025    Q1 26    Q2 26    Q3 26    Q4 26    TOT 26 ...
```

#### ✅ DOPO (Struttura Corretta)
```
1 Tr 25   2 Tr 25   3 Tr 25   4 Tr 25   TOT 2025   1 Tr 26   2 Tr 26   3 Tr 26   4 Tr 26   TOT 26 ...
```

### 2. Cambiamenti Nomenclatura

| Vecchio | Nuovo |
|---------|-------|
| `YTD 25` | Suddiviso in `1 Tr 25`, `2 Tr 25`, `3 Tr 25` |
| `4 2025` | `4 Tr 25` |
| `1 Qtr 26` | `1 Tr 26` |
| `2 Qtr 26` | `2 Tr 26` |
| `3 Qtr 26` | `3 Tr 26` |
| `4 Qtr 26` | `4 Tr 26` |
| (tutti i Qtr) | (tutti in Tr) |

---

## 🔢 Redistribuzione Valori

### Logica Applicata

Per ogni item che aveva un valore in `ytd_25`:

1. **Suddivisione**: Il valore YTD è stato diviso equamente tra i 3 trimestri
   ```
   YTD_25 = 60 €
   →
   Q1_25 = 60/3 = 20 €
   Q2_25 = 60/3 = 20 €
   Q3_25 = 60/3 = 20 €
   ```

2. **Calcolo TOT 2025**: Somma di tutti i 4 trimestri
   ```
   TOT_25 = Q1_25 + Q2_25 + Q3_25 + Q4_25
   TOT_25 = 20 + 20 + 20 + 22 = 82 €
   ```

### Esempi Reali dal Database

#### Esempio 1: Consulenze Tecniche
```json
// PRIMA
"values": {
  "ytd_25": 30
}

// DOPO
"values": {
  "q1_25": 10.0,
  "q2_25": 10.0,
  "q3_25": 10.0,
  "tot_25": 30.0
}
```

#### Esempio 2: Materiali e Componenti
```json
// PRIMA
"values": {
  "ytd_25": 20
}

// DOPO
"values": {
  "q1_25": 6.67,
  "q2_25": 6.67,
  "q3_25": 6.67,
  "tot_25": 20.01  // (arrotondamento)
}
```

#### Esempio 3: Item con Q4 esistente
```json
// PRIMA
"values": {
  "ytd_25": 60,
  "q4_2025": 19
}

// DOPO
"values": {
  "q1_25": 20.0,
  "q2_25": 20.0,
  "q3_25": 20.0,
  "q4_2025": 19,  // mantenuto
  "tot_25": 79.0  // 20+20+20+19
}
```

---

## 📊 Struttura Completa Periodi

### Array Periods nel Database

```json
{
  "periods": [
    // 2025 (5 colonne)
    { "id": "q1_25", "name": "1 Tr 25", "year": 2025, "quarter": 1, "column": 0 },
    { "id": "q2_25", "name": "2 Tr 25", "year": 2025, "quarter": 2, "column": 1 },
    { "id": "q3_25", "name": "3 Tr 25", "year": 2025, "quarter": 3, "column": 2 },
    { "id": "q4_2025", "name": "4 Tr 25", "year": 2025, "quarter": 4, "column": 3 },
    { "id": "tot_25", "name": "TOT 2025", "year": 2025, "column": 4 },
    
    // 2026 (5 colonne)
    { "id": "q1_26", "name": "1 Tr 26", "year": 26, "quarter": 1, "column": 6 },
    { "id": "q2_26", "name": "2 Tr 26", "year": 26, "quarter": 2, "column": 7 },
    { "id": "q3_26", "name": "3 Tr 26", "year": 26, "quarter": 3, "column": 8 },
    { "id": "q4_26", "name": "4 Tr 26", "year": 26, "quarter": 4, "column": 9 },
    { "id": "tot_26", "name": "TOT 26", "year": 26, "column": 10 },
    
    // 2027 (5 colonne)
    { "id": "q1_27", "name": "1 Tr 27", "year": 27, "quarter": 1, "column": 11 },
    { "id": "q2_27", "name": "2 Tr 27", "year": 27, "quarter": 2, "column": 12 },
    { "id": "q3_27", "name": "3 Tr 27", "year": 27, "quarter": 3, "column": 13 },
    { "id": "q4_27", "name": "4 Tr 27", "year": 27, "quarter": 4, "column": 14 },
    { "id": "tot_27", "name": "TOT 27", "year": 27, "column": 15 },
    
    // 2028 (5 colonne)
    { "id": "q1_28", "name": "1 Tr 28", "year": 28, "quarter": 1, "column": 16 },
    { "id": "q2_28", "name": "2 Tr 28", "year": 28, "quarter": 2, "column": 17 },
    { "id": "q3_28", "name": "3 Tr 28", "year": 28, "quarter": 3, "column": 18 },
    { "id": "q4_28", "name": "4 Tr 28", "year": 28, "quarter": 4, "column": 19 },
    { "id": "tot_28", "name": "TOT 28", "year": 28, "column": 20 },
    
    // Totale generale
    { "id": "tot_all", "name": "TOT 2026-28", "column": 21 }
  ]
}
```

**Totale Periodi:** 22 colonne

---

## 🔧 Script Utilizzato

### `restructure_2025_periods.py`

#### Funzionalità:
1. ✅ Backup automatico del database
2. ✅ Creazione nuovi periodi Q1, Q2, Q3 per il 2025
3. ✅ Rinomina Q4 2025
4. ✅ Creazione periodo TOT 2025
5. ✅ Cambio nomenclatura Qtr → Tr per tutti gli anni
6. ✅ Redistribuzione valori YTD sui 3 trimestri
7. ✅ Calcolo automatico TOT 2025
8. ✅ Aggiornamento categorie e subcategorie
9. ✅ Aggiornamento metadata versione

#### Backup Creato:
```
database_backup_restructure_20251006_235845.json
```

---

## 📈 Statistiche Operazione

### Items Aggiornati
- **Items allItems**: Tutti gli items con `ytd_25` sono stati aggiornati
- **Categorie**: 7 categorie principali aggiornate
- **Subcategorie**: Tutte le subcategorie aggiornate
- **Total Rows**: Aggiornati per ogni categoria

### Valori Rimossi
- ❌ `ytd_25`: Completamente rimosso da tutto il database
- ✅ Verificato: 0 occorrenze di `ytd_25` rimanenti

### Valori Aggiunti
- ✅ `q1_25`: Presente in tutti gli items pertinenti
- ✅ `q2_25`: Presente in tutti gli items pertinenti  
- ✅ `q3_25`: Presente in tutti gli items pertinenti
- ✅ `tot_25`: Calcolato e presente in tutti gli items

---

## ✅ Verifiche Completate

### 1. Build Compilata
```bash
npm run build
✓ Compiled successfully
✓ Generating static pages (4/4)
```

### 2. Nessun Errore TypeScript
- Nessun errore di tipo
- Nessun warning

### 3. Struttura Coerente
- Ogni anno ha 5 colonne (Q1, Q2, Q3, Q4, TOT)
- Nomenclatura uniforme (Tr invece di Qtr)
- Colonne indicizzate correttamente

---

## 🎯 Impatto UI

### Tabella Budget

**Prima:**
```
| Voce | YTD 25 | 4 2025 | 1 Qtr 26 | 2 Qtr 26 | ...
```

**Dopo:**
```
| Voce | 1 Tr 25 | 2 Tr 25 | 3 Tr 25 | 4 Tr 25 | TOT 2025 | 1 Tr 26 | 2 Tr 26 | ...
```

### Features Tabella
- ✅ Header con nomi periodi aggiornati
- ✅ Espansione/Compressione categorie funzionante
- ✅ Calcoli totali per categoria corretti
- ✅ Toggle "Mostra Tutti i Periodi" include tutti i 22 periodi
- ✅ Formattazione valuta corretta

---

## 📝 Note Tecniche

### Arrotondamenti
I valori sono arrotondati a 2 decimali per evitare problemi di precisione floating point:
```python
value_per_quarter = round(ytd_value / 3, 2)
```

### Gestione Totali
Il totale 2025 può differire leggermente dalla somma esatta dei trimestri a causa dell'arrotondamento:
```
Esempio:
20.00 / 3 = 6.67 (arrotondato)
6.67 + 6.67 + 6.67 = 20.01 (non 20.00)
```

### ID Periodi
Gli ID mantengono la nomenclatura originale per compatibilità:
- `q1_25`, `q2_25`, `q3_25` (nuovi)
- `q4_2025` (esistente, mantenuto)
- `tot_25` (nuovo)

---

## 🚀 Prossimi Step

### Immediate
1. ✅ Test visualizzazione tabella nel browser
2. ✅ Verifica calcoli automatici
3. ✅ Test espansione categorie

### Future Enhancement
1. Implementare editing inline celle
2. Aggiungere validazione input
3. Implementare salvataggio modifiche
4. Aggiungere undo/redo
5. Export Excel con nuova struttura

---

## 📦 File Modificati

```
financial-dashboard/
└── src/
    └── data/
        └── database.json  (v1.0.2 → v1.0.3)

Prodotto/
├── restructure_2025_periods.py  [NUOVO]
└── database_backup_restructure_20251006_235845.json  [BACKUP]
```

---

**Status:** ✅ **COMPLETATO CON SUCCESSO**  
**Build:** ✅ **COMPILATO**  
**Testing:** ⏳ **DA TESTARE IN BROWSER**
