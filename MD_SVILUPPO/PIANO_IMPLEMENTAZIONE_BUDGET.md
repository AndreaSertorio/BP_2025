# Piano Implementazione Tab BUDGET

**Data:** 6 Ottobre 2025  
**Obiettivo:** Creare interfaccia completa per gestione budget aziendale Eco3D

---

## 📊 Analisi Struttura Dati Excel

### Dimensioni
- **8 Categorie principali**
- **29 Sottocategorie**
- **66 Voci di costo** totali
- **18 Periodi** (colonne temporali)

### Struttura Temporale
```
YTD 25 → Q4 2025 → 
  Q1-Q4 2026 (+ TOT 26) → 
  Q1-Q4 2027 (+ TOT 27) → 
  Q1-Q4 2028 (+ TOT 28) → 
  Totale 2026-28
```

### Categorie Principali

**1. Realizzazione Prototipo**
- 1.1 Materiali e Componenti
- 1.2 Consulenze e Servizi Tecnici Esterni
- 1.3 Personale R&D
- 1.4 Test e Validazioni di Laboratorio
- 1.5 Contingencies

**2. Percorso Regolatorio e Certificazioni (CE/MDR)**
- 2.1 Consulenza Regolatoria e QA
- 2.2 Documentazione Tecnica e Qualità
- 2.3 Fee di Organismi Notificati
- 2.4 Test di Laboratorio e Certificazioni
- 2.5 Implementazione UDI e Registrazione EUDAMED
- 2.6 Team e formazione
- 2.7 Contingencies

**3. Validazione Preclinica e Studi Clinici**
- 3.1 Validazioni Precliniche
- 3.2 Studio Clinico Pilota
- 3.3 Studio Clinico Pivotal multicentrico
- 3.4 Early marketing (dispositivi pilota)
- 3.5 Contingencies

**4. Strutturazione del Team e Risorse Umane**
- 4.1 Fondatori
- 4.2 Ingegneri biomedici, elettronici, software
- 4.3 Reclutamento, formazione e training

**5. Overhead**
- 5.1 Laboratorio e ufficio
- 5.2 Assicurazioni
- 5.3 Amministrative e legali
- 5.4 Viaggi e trasferte

**6. Asset Industriali Minimi e Setup Produttivo**
- 5.1 Attrezzature e Infrastrutture
- 5.2 Progettazione per la Produzione (DfM)
- 5.3 Supply Chain e Lotti Pilota
- 5.4 Manuali, packaging e etichettature

**7. Strategie Commerciali e Go-to-Market**

**8. Contingencies**

---

## 🎯 Funzionalità Richieste

### Core Features
1. **Visualizzazione Gerarchica**
   - Espandibile/collassabile per categoria
   - Indentazione visiva per livelli
   - Codici voce chiari (1, 1.1, 1.1.2)

2. **Editing In-line**
   - Click su cella per modificare
   - Validazione numeri/formule
   - Auto-save nel database

3. **Calcoli Automatici**
   - Totali per trimestre
   - Totali per anno
   - Totali per categoria
   - Totale generale

4. **Espansione Dinamica**
   - Toggle anni (mostra/nascondi 2027, 2028)
   - Toggle trimestri (mostra/nascondi dettaglio Q1-Q4)
   - Aggiungi nuovi anni

5. **Gestione Voci**
   - Aggiungi voce di costo
   - Elimina voce
   - Riordina voci (drag&drop)
   - Duplica voce

6. **Import/Export**
   - Importa da Excel
   - Esporta in Excel
   - Reset a valori originali

7. **Visualizzazioni**
   - Grafici per categoria
   - Timeline evoluzione costi
   - Pie chart distribuzione
   - Waterfall chart

### User Experience
- **Responsive:** Mobile, tablet, desktop
- **Performance:** Rendering veloce anche con 66+ voci
- **Keyboard Navigation:** Tab, Enter, Esc
- **Undo/Redo:** Ctrl+Z / Ctrl+Y
- **Search/Filter:** Cerca voce per nome/codice

---

## 🗂️ Struttura Dati

### TypeScript Interface

```typescript
interface BudgetItem {
  id: string;
  code: string | null;  // "1", "1.1", "1.1.2"
  description: string;
  level: 1 | 2 | 3 | 4;  // Livello gerarchico
  parentId?: string;
  formula?: string;  // "=3*1000/MESE"
  isCategory: boolean;
  isEditable: boolean;
  values: {
    [period: string]: number | string;  // "YTD 25": 30, "Q1 2026": 12
  };
  metadata?: {
    note?: string;
    tags?: string[];
    lastModified?: string;
  };
}

interface BudgetPeriod {
  id: string;
  name: string;  // "YTD 25", "Q1 2026"
  type: 'ytd' | 'quarter' | 'total';
  year: number;
  quarter?: number;
  column: number;
}

interface BudgetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  subcategories: BudgetCategory[];
  items: BudgetItem[];
}

interface BudgetData {
  version: string;
  lastUpdated: string;
  currency: 'EUR' | 'USD';
  periods: BudgetPeriod[];
  categories: BudgetCategory[];
  allItems: BudgetItem[];
  configuration: {
    expandedYears: number[];
    expandedCategories: string[];
    showQuarters: boolean;
    showTotals: boolean;
  };
}
```

### Database Structure

```json
{
  "budget": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-06T18:50:00Z",
    "currency": "EUR",
    "periods": [
      {"id": "ytd_25", "name": "YTD 25", "type": "ytd", "year": 2025, "column": 0},
      {"id": "q4_25", "name": "Q4 2025", "type": "quarter", "year": 2025, "quarter": 4, "column": 1},
      {"id": "q1_26", "name": "Q1 2026", "type": "quarter", "year": 2026, "quarter": 1, "column": 2}
    ],
    "categories": [...],
    "items": [...],
    "configuration": {
      "expandedYears": [2026, 2027],
      "expandedCategories": ["cat_1", "cat_2"],
      "showQuarters": true,
      "showTotals": true
    }
  }
}
```

---

## 🏗️ Architettura Componenti

```
financial-dashboard/
└── src/
    ├── components/
    │   ├── BudgetWrapper.tsx         [NUOVO] Tab navigation
    │   ├── BudgetDashboard.tsx       [NUOVO] Overview e KPI
    │   ├── BudgetTable.tsx           [NUOVO] Tabella editabile
    │   ├── BudgetRow.tsx             [NUOVO] Singola riga
    │   ├── BudgetCell.tsx            [NUOVO] Cella editabile
    │   ├── BudgetToolbar.tsx         [NUOVO] Azioni (add, export, etc)
    │   ├── BudgetCategoryHeader.tsx  [NUOVO] Header categoria
    │   ├── BudgetCharts.tsx          [NUOVO] Grafici
    │   └── BudgetImportExport.tsx    [NUOVO] Import/Export Excel
    │
    ├── contexts/
    │   └── BudgetContext.tsx         [NUOVO] State management
    │
    ├── lib/
    │   ├── budget-service.ts         [NUOVO] Business logic
    │   ├── budget-calculations.ts    [NUOVO] Formule e calcoli
    │   └── budget-excel.ts           [NUOVO] Import/Export Excel
    │
    ├── types/
    │   └── budget.types.ts           [NUOVO] TypeScript types
    │
    └── data/
        └── database.json             [MODIFICATO] +sezione budget
```

---

## 📋 Piano di Sviluppo

### Fase 1: Setup e Modello Dati (2-3 ore)
- [ ] Creare types TypeScript (`budget.types.ts`)
- [ ] Convertire dati Excel in JSON (`budget_data.json`)
- [ ] Integrare nel `database.json`
- [ ] Creare `budget-service.ts`

### Fase 2: UI Base (3-4 ore)
- [ ] `BudgetWrapper.tsx` con tabs
- [ ] `BudgetDashboard.tsx` con KPI cards
- [ ] `BudgetTable.tsx` struttura base
- [ ] Integrazione con `MercatoWrapper` pattern

### Fase 3: Editing e Interattività (4-5 ore)
- [ ] `BudgetCell.tsx` con editing inline
- [ ] Validazione input
- [ ] Calcoli automatici totali
- [ ] Espansione/collasso categorie

### Fase 4: Features Avanzate (3-4 ore)
- [ ] Aggiungi/Elimina voci
- [ ] Espansione anni dinamica
- [ ] Formule personalizzate
- [ ] Undo/Redo

### Fase 5: Visualizzazioni (2-3 ore)
- [ ] `BudgetCharts.tsx` con Recharts
- [ ] Grafici per categoria
- [ ] Timeline evolutiva
- [ ] Export grafici

### Fase 6: Import/Export (2-3 ore)
- [ ] `budget-excel.ts` per Excel
- [ ] Import wizard
- [ ] Export formato Excel
- [ ] Template download

### Fase 7: Testing e Documentazione (2 ore)
- [ ] Test funzionalità
- [ ] Documentazione MD
- [ ] README utente

**Tempo totale stimato: 18-24 ore**

---

## 🎨 Design UI/UX

### Layout Principale

```
┌─────────────────────────────────────────────────────────┐
│  📊 Budget                                    [Export]  │
├─────────────────────────────────────────────────────────┤
│  [Dashboard] [Tabella Budget] [Grafici]                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔎 Cerca] [+ Aggiungi Voce] [Espandi: 2027 2028]    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Voce              │YTD 25│Q4 25│Q1 26│...│TOT 26   │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ ▼ 1. Prototipo                                     │ │
│  │   ▶ 1.1 Materiali                                  │ │
│  │   ▶ 1.2 Consulenze                                 │ │
│  │   ✅ Totale         │ 60 │ 19│ 64│...│ 295        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Colori e Stili

```typescript
const budgetTheme = {
  category: {
    level1: 'bg-blue-100 border-blue-300',
    level2: 'bg-indigo-50 border-indigo-200',
    level3: 'bg-gray-50 border-gray-200'
  },
  cells: {
    editable: 'hover:bg-yellow-50 cursor-pointer',
    total: 'bg-green-50 font-bold',
    formula: 'bg-purple-50 italic'
  }
}
```

---

## ⚙️ Formule e Calcoli

### Auto-calcolo Totali

```typescript
function calculatePeriodTotal(items: BudgetItem[], period: string): number {
  return items.reduce((sum, item) => {
    if (item.isCategory) return sum;
    const value = item.values[period];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

function calculateCategoryTotal(category: BudgetCategory, period: string): number {
  let total = 0;
  
  // Somma subcategorie
  category.subcategories.forEach(sub => {
    total += calculateCategoryTotal(sub, period);
  });
  
  // Somma items
  category.items.forEach(item => {
    if (!item.isCategory) {
      const value = item.values[period];
      total += (typeof value === 'number' ? value : 0);
    }
  });
  
  return total;
}
```

### Gestione Formule

```typescript
function evaluateFormula(formula: string, context: any): number {
  // Es: "=3*1000/MESE" → 3000
  // Es: "=SUM(Q1,Q2,Q3,Q4)" → somma trimestri
  // TODO: Implementare parser formule
  return 0;
}
```

---

## 🚀 Prossimi Passi

1. **Avviare Fase 1:** Creo struttura types e converto dati
2. **Setup componenti:** BudgetWrapper e navigazione
3. **Implementazione iterativa:** Una funzionalità alla volta
4. **Test continuo:** Verificare ogni step

---

**Ready to start! 🎯**
