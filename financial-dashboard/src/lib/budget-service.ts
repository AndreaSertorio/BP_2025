/**
 * BUDGET SERVICE
 * Business logic per gestione budget aziendale
 */

import type {
  BudgetData,
  BudgetItem,
  BudgetCategory,
  BudgetPeriod,
  BudgetStatistics,
  BudgetItemTemplate
} from '@/types/budget.types';

export class BudgetService {
  private data: BudgetData;

  constructor(budgetData: BudgetData) {
    this.data = budgetData;
  }

  /**
   * Ottieni l'intero oggetto dati (per forceUpdate)
   */
  getData(): BudgetData {
    return this.data;
  }

  /**
   * Ottieni tutti i periodi
   */
  getPeriods(): BudgetPeriod[] {
    return this.data.periods;
  }

  /**
   * Ottieni periodi visibili
   */
  getVisiblePeriods(): BudgetPeriod[] {
    return this.data.periods.filter(p => p.isVisible);
  }

  /**
   * Ottieni periodi per anno
   */
  getPeriodsByYear(year: number): BudgetPeriod[] {
    return this.data.periods.filter(p => p.year === year);
  }

  /**
   * Ottieni tutte le categorie
   */
  getCategories(): BudgetCategory[] {
    return this.data.categories;
  }

  /**
   * Ottieni categoria per ID
   */
  getCategory(categoryId: string): BudgetCategory | undefined {
    return this.data.categories.find(c => c.id === categoryId);
  }

  /**
   * Ottieni tutti gli items
   */
  getAllItems(): BudgetItem[] {
    return this.data.allItems;
  }

  /**
   * Ottieni item per ID
   */
  getItem(itemId: string): BudgetItem | undefined {
    return this.data.allItems.find(i => i.id === itemId);
  }

  /**
   * Ottieni items per categoria
   */
  getItemsByCategory(categoryId: string): BudgetItem[] {
    return this.data.allItems.filter(i => i.categoryId === categoryId);
  }

  /**
   * Ottieni items editabili
   */
  getEditableItems(): BudgetItem[] {
    return this.data.allItems.filter(i => i.isEditable);
  }

  /**
   * Calcola totale per periodo
   */
  calculatePeriodTotal(periodId: string, categoryId?: string): number {
    const items = categoryId
      ? this.getItemsByCategory(categoryId).filter(i => !i.isCategory && !i.isTotal)
      : this.data.allItems.filter(i => !i.isCategory && !i.isTotal);

    return items.reduce((sum, item) => {
      const value = item.values[periodId];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  /**
   * Calcola totale per categoria
   */
  calculateCategoryTotal(categoryId: string, periodId: string): number {
    const category = this.getCategory(categoryId);
    if (!category) return 0;

    let total = 0;

    // Somma items diretti
    category.items.forEach(item => {
      if (!item.isCategory && !item.isTotal) {
        const value = item.values[periodId];
        total += typeof value === 'number' ? value : 0;
      }
    });

    // Somma subcategorie
    category.subcategories.forEach(subcat => {
      subcat.items.forEach(item => {
        if (!item.isCategory && !item.isTotal) {
          const value = item.values[periodId];
          total += typeof value === 'number' ? value : 0;
        }
      });
    });

    return total;
  }

  /**
   * Calcola totale per anno
   */
  calculateYearTotal(year: number, categoryId?: string): number {
    const yearPeriods = this.getPeriodsByYear(year).filter(p => p.type === 'quarter');
    
    return yearPeriods.reduce((sum, period) => {
      return sum + this.calculatePeriodTotal(period.id, categoryId);
    }, 0);
  }

  /**
   * Calcola totale generale
   */
  calculateGrandTotal(categoryId?: string): number {
    const items = categoryId
      ? this.getItemsByCategory(categoryId).filter(i => !i.isCategory && !i.isTotal)
      : this.data.allItems.filter(i => !i.isCategory && !i.isTotal);

    const allValues = items.flatMap(item => Object.values(item.values).filter((v): v is number => typeof v === 'number'));
    
    return allValues.reduce((sum, value) => sum + value, 0);
  }

  /**
   * Calcola statistiche budget
   */
  calculateStatistics(): BudgetStatistics {
    const totalBudget = this.calculateGrandTotal();
    
    // Totale per anno
    const years = Array.from(new Set(this.data.periods.map(p => p.year)));
    const totalByYear: { [year: number]: number } = {};
    years.forEach(year => {
      totalByYear[year] = this.calculateYearTotal(year);
    });

    // Totale per categoria
    const totalByCategory: { [categoryId: string]: number } = {};
    const categoryPercentages: { [categoryId: string]: number } = {};
    
    this.data.categories.forEach(cat => {
      const catTotal = this.calculateGrandTotal(cat.id);
      totalByCategory[cat.id] = catTotal;
      categoryPercentages[cat.id] = totalBudget > 0 ? (catTotal / totalBudget) * 100 : 0;
    });

    // Top spese
    const itemsWithTotals = this.data.allItems
      .filter(i => !i.isCategory && !i.isTotal)
      .map(item => {
        const values = Object.values(item.values).filter((v): v is number => typeof v === 'number');
        const total = values.reduce((sum, val) => sum + val, 0);
        return {
          itemId: item.id,
          description: item.description,
          amount: total,
          percentage: totalBudget > 0 ? (total / totalBudget) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Media mensile e trimestrale
    const quarterPeriods = this.data.periods.filter(p => p.type === 'quarter');
    const totalQuarters = quarterPeriods.length;
    const monthlyAverage = totalBudget / (totalQuarters * 3);
    const quarterlyAverage = totalBudget / totalQuarters;

    // Crescita YoY
    const yearOverYearGrowth: { [year: number]: number } = {};
    const sortedYears = years.sort((a, b) => a - b);
    for (let i = 1; i < sortedYears.length; i++) {
      const currentYear = sortedYears[i];
      const prevYear = sortedYears[i - 1];
      const currentTotal = totalByYear[currentYear] || 0;
      const prevTotal = totalByYear[prevYear] || 0;
      
      yearOverYearGrowth[currentYear] = prevTotal > 0 
        ? ((currentTotal - prevTotal) / prevTotal) * 100 
        : 0;
    }

    return {
      totalBudget,
      totalByYear,
      totalByCategory,
      categoryPercentages,
      monthlyAverage,
      quarterlyAverage,
      yearOverYearGrowth,
      topExpenses: itemsWithTotals
    };
  }

  /**
   * Aggiorna valore item
   */
  async updateItemValue(itemId: string, periodId: string, value: number | null): Promise<boolean> {
    const item = this.getItem(itemId);
    if (!item) return false;

    // Aggiorna localmente
    item.values[periodId] = value;
    item.lastModified = new Date().toISOString();
    
    // Salva sul server
    try {
      const response = await fetch('/api/budget/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, periodId, value }),
      });

      if (!response.ok) {
        console.error('Errore salvataggio sul server:', await response.text());
        return false;
      }

      const result = await response.json();
      console.log('✅ Valore salvato:', result);
      return true;
    } catch (error) {
      console.error('Errore chiamata API:', error);
      return false;
    }
  }

  /**
   * Aggiungi nuovo item
   */
  addItem(template: BudgetItemTemplate): BudgetItem {
    const newItem: BudgetItem = {
      id: `item_${Date.now()}`,
      code: template.code || null,
      description: template.description,
      level: 3,
      parentId: template.subcategoryId || undefined,
      categoryId: template.categoryId,
      values: {},
      formula: template.formula || undefined,
      note: undefined,
      isCategory: false,
      isTotal: false,
      isEditable: true,
      isExpanded: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // Applica valore default a tutti i periodi
    if (template.applyToAllPeriods && template.defaultValue !== undefined) {
      this.data.periods.forEach(period => {
        newItem.values[period.id] = template.defaultValue!;
      });
    }

    this.data.allItems.push(newItem);
    
    return newItem;
  }

  /**
   * Rimuovi item
   */
  removeItem(itemId: string): boolean {
    const index = this.data.allItems.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    this.data.allItems.splice(index, 1);
    return true;
  }

  /**
   * Formatta numero come valuta
   * I valori nel budget sono in migliaia di euro (K€)
   */
  formatCurrency(value: number): string {
    const currency = this.data.currency;
    const symbol = currency === 'EUR' ? '€' : '$';
    
    return `${symbol}${value.toLocaleString('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}K`;
  }

  /**
   * Formatta numero compatto (es. 1.2K, 3.5M)
   */
  formatCompact(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }

  /**
   * Esporta dati correnti
   */
  exportData(): BudgetData {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Reset a valori originali
   */
  reset(originalData: BudgetData): void {
    this.data = JSON.parse(JSON.stringify(originalData));
  }
}
