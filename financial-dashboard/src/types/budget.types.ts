/**
 * TYPES per sistema Budget
 * Gestione completa budget aziendale con struttura gerarchica
 */

// Tipo di periodo (trimestre, totale annuale, YTD)
export type PeriodType = 'ytd' | 'quarter' | 'year_total' | 'overall_total';

// Valuta supportate
export type Currency = 'EUR' | 'USD';

// Livello gerarchico della voce
export type BudgetLevel = 1 | 2 | 3 | 4;

/**
 * Periodo temporale del budget
 */
export interface BudgetPeriod {
  id: string;                 // "ytd_25", "q1_26", "tot_26"
  name: string;               // "YTD 25", "Q1 2026", "TOT 26"
  type: PeriodType;
  year: number;
  quarter?: number;           // 1-4 per i trimestri
  column: number;             // Indice colonna nella tabella
  isVisible: boolean;         // Per show/hide dinamico
}

/**
 * Singola voce di budget
 */
export interface BudgetItem {
  id: string;
  code: string | null;        // "1", "1.1", "1.1.2"
  description: string;
  level: BudgetLevel;         // 1=Categoria, 2=Sottocategoria, 3=Dettaglio, 4=Totale
  parentId?: string;          // ID categoria padre
  categoryId: string;         // ID categoria principale di appartenenza
  
  // Dati
  values: {
    [periodId: string]: number | null;  // Valore per ogni periodo
  };
  
  // Metadati
  formula?: string;           // "=3*1000/MESE" per calcoli automatici
  note?: string;              // Note aggiuntive
  isCategory: boolean;        // true se è header categoria/sottocategoria
  isTotal: boolean;           // true se è riga di totale
  isEditable: boolean;        // false per totali calcolati
  
  // UI State
  isExpanded?: boolean;       // Per categorie espandibili
  
  // Tracking
  createdAt?: string;
  lastModified?: string;
  modifiedBy?: string;
}

/**
 * Categoria principale del budget
 */
export interface BudgetCategory {
  id: string;
  code: string;               // "1", "2", "3"
  name: string;               // "Realizzazione Prototipo"
  description?: string;
  icon?: string;              // Emoji o nome icona
  color?: string;             // Colore tema per UI
  order: number;              // Ordinamento
  
  // Gerarchia
  subcategories: BudgetSubcategory[];
  items: BudgetItem[];
  
  // UI State
  isExpanded: boolean;
  
  // Metadati
  totalRow?: BudgetItem;      // Riga "Totale [Categoria]"
}

/**
 * Sottocategoria del budget
 */
export interface BudgetSubcategory {
  id: string;
  code: string;               // "1.1", "1.2"
  name: string;
  description?: string;
  parentCategoryId: string;
  order: number;
  
  items: BudgetItem[];
  
  // UI State
  isExpanded: boolean;
}

/**
 * Configurazione visualizzazione budget
 */
export interface BudgetConfiguration {
  // Visualizzazione
  expandedYears: number[];           // Anni espansi (es. [2026, 2027])
  expandedCategories: string[];      // ID categorie espanse
  showQuarters: boolean;             // Mostra dettaglio trimestri
  showTotals: boolean;               // Mostra colonne totali
  showFormulas: boolean;             // Mostra formule nelle celle
  
  // Filtri
  yearRange: {
    start: number;                   // 2025
    end: number;                     // 2028
  };
  
  // Editing
  editMode: boolean;                 // Modalità editing attiva
  
  // Layout
  compactView: boolean;              // Vista compatta
  highlightChanges: boolean;         // Evidenzia modifiche recenti
}

/**
 * Statistiche e KPI del budget
 */
export interface BudgetStatistics {
  // Totali
  totalBudget: number;                      // Budget totale
  totalByYear: { [year: number]: number };  // Totale per anno
  totalByCategory: { [categoryId: string]: number };
  
  // Percentuali
  categoryPercentages: { [categoryId: string]: number };
  
  // Timeline
  monthlyAverage: number;
  quarterlyAverage: number;
  
  // Crescita
  yearOverYearGrowth: { [year: number]: number };  // Crescita YoY in %
  
  // Top spese
  topExpenses: {
    itemId: string;
    description: string;
    amount: number;
    percentage: number;
  }[];
}

/**
 * Dati completi del budget
 */
export interface BudgetData {
  version: string;
  lastUpdated: string;
  currency: Currency;
  
  // Struttura temporale
  periods: BudgetPeriod[];
  
  // Struttura gerarchica
  categories: BudgetCategory[];
  
  // Tutti gli items (flat per ricerche veloci)
  allItems: BudgetItem[];
  
  // Configurazione
  configuration: BudgetConfiguration;
  
  // Statistiche calcolate
  statistics?: BudgetStatistics;
  
  // Metadata
  metadata: {
    source: string;              // "Excel import", "Manual"
    originalFile?: string;
    importDate?: string;
    notes?: string;
  };
}

/**
 * Azione di modifica sul budget (per undo/redo)
 */
export interface BudgetAction {
  id: string;
  type: 'edit' | 'add' | 'delete' | 'move';
  timestamp: string;
  
  // Dettagli azione
  itemId?: string;
  periodId?: string;
  oldValue?: any;
  newValue?: any;
  
  // Per undo
  reversible: boolean;
}

/**
 * Storia modifiche budget
 */
export interface BudgetHistory {
  actions: BudgetAction[];
  currentIndex: number;
  maxHistory: number;  // Limite azioni memorizzate
}

/**
 * Opzioni per export Excel
 */
export interface BudgetExportOptions {
  includeFormulas: boolean;
  includeNotes: boolean;
  format: 'xlsx' | 'csv';
  periods?: string[];           // Periodi da includere (default: tutti)
  categories?: string[];        // Categorie da includere (default: tutte)
}

/**
 * Risultato validazione budget
 */
export interface BudgetValidation {
  isValid: boolean;
  errors: {
    itemId: string;
    periodId?: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  warnings: {
    itemId: string;
    message: string;
  }[];
}

/**
 * Template per nuova voce budget
 */
export interface BudgetItemTemplate {
  code?: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  defaultValue?: number;
  formula?: string;
  applyToAllPeriods?: boolean;
}
