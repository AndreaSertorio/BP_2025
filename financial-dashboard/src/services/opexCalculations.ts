/**
 * 💰 OPEX & EBITDA CALCULATION SERVICE
 * 
 * Punto 3 del Piano Sviluppo: OPEX collegati al Budget
 * 
 * Calcola Operating Expenses e EBITDA:
 * - Staff costs (personale)
 * - R&D (sviluppo e ricerca)
 * - Sales & Marketing
 * - G&A (General & Administrative)
 * - EBITDA = Gross Margin - OPEX
 * 
 * Legge dati dal budget esistente nel database.json
 * 
 * @module opexCalculations
 */

import type { BudgetData } from '@/types/budget.types';

// ============================================================================
// TYPES
// ============================================================================

export interface OpexBreakdown {
  staff: number;
  rd: number;
  salesMarketing: number;
  ga: number;
  total: number;
}

export interface OpexByPeriod {
  [periodId: string]: OpexBreakdown;
}

export interface EbitdaCalculation {
  revenue: number;
  cogs: number;
  grossMargin: number;
  grossMarginPct: number;
  opex: OpexBreakdown;
  ebitda: number;
  ebitdaPct: number;      // EBITDA margin %
}

export interface StaffCostDetail {
  role: string;
  costYear: number;
  fte: number;
  category: string;
  startQuarter: string;
  costPerPeriod: {
    [periodId: string]: number;
  };
}

// ============================================================================
// OPEX CALCULATION FROM BUDGET
// ============================================================================

/**
 * Calcola OPEX totali da BudgetData
 * 
 * Aggrega tutte le voci di budget per periodo
 * e le raggruppa in categorie OPEX standard
 */
export function calculateOpexFromBudget(
  budgetData: BudgetData,
  periodId: string
): OpexBreakdown {
  let staff = 0;
  let rd = 0;
  let salesMarketing = 0;
  let ga = 0;
  
  // Itera su tutte le categories del budget
  budgetData.categories.forEach(category => {
    // Itera su tutti gli items della category
    category.items.forEach(item => {
      const value = item.values[periodId] || 0;
      
      // Mappa item a categoria OPEX basandosi su metadata
      // Questo mapping può essere customizzato in base alle tue categorie budget
      
      const description = item.description.toLowerCase();
      const categoryName = category.name.toLowerCase();
      
      if (
        categoryName.includes('personale') ||
        categoryName.includes('staff') ||
        categoryName.includes('risorse umane')
      ) {
        staff += value;
      } else if (
        categoryName.includes('r&d') ||
        categoryName.includes('ricerca') ||
        categoryName.includes('sviluppo') ||
        categoryName.includes('prototipo')
      ) {
        rd += value;
      } else if (
        categoryName.includes('marketing') ||
        categoryName.includes('sales') ||
        categoryName.includes('vendite') ||
        categoryName.includes('commerciale')
      ) {
        salesMarketing += value;
      } else {
        // Tutto il resto va in G&A
        ga += value;
      }
    });
  });
  
  return {
    staff,
    rd,
    salesMarketing,
    ga,
    total: staff + rd + salesMarketing + ga
  };
}

/**
 * Calcola OPEX per tutti i periodi da BudgetData
 */
export function calculateOpexAllPeriods(budgetData: BudgetData): OpexByPeriod {
  const result: OpexByPeriod = {};
  
  budgetData.periods.forEach(period => {
    result[period.id] = calculateOpexFromBudget(budgetData, period.id);
  });
  
  return result;
}

// ============================================================================
// OPEX BY YEAR
// ============================================================================

/**
 * Aggrega OPEX per anno
 * Somma tutti i trimestri di un anno
 */
export function aggregateOpexByYear(
  opexByPeriod: OpexByPeriod,
  year: number
): OpexBreakdown {
  let staff = 0;
  let rd = 0;
  let salesMarketing = 0;
  let ga = 0;
  
  // Filtra periodi dell'anno e somma
  Object.entries(opexByPeriod).forEach(([periodId, opex]) => {
    // Estrai anno dal periodId (es: "q1_25" → 2025)
    const match = periodId.match(/\d+/);
    if (match) {
      const periodYear = 2000 + parseInt(match[0]);
      if (periodYear === year) {
        staff += opex.staff;
        rd += opex.rd;
        salesMarketing += opex.salesMarketing;
        ga += opex.ga;
      }
    }
  });
  
  return {
    staff,
    rd,
    salesMarketing,
    ga,
    total: staff + rd + salesMarketing + ga
  };
}

// ============================================================================
// EBITDA CALCULATION
// ============================================================================

/**
 * Calcola EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization)
 * 
 * Formula:
 * EBITDA = Gross Margin - OPEX
 * EBITDA % = EBITDA / Revenue × 100
 * 
 * EBITDA è una metrica chiave per investitori:
 * - Mostra profittabilità operativa
 * - Esclude financing, accounting, tax decisions
 * - Comparabile tra aziende
 */
export function calculateEbitda(
  revenue: number,
  cogs: number,
  opex: OpexBreakdown
): EbitdaCalculation {
  const grossMargin = revenue - cogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  const ebitda = grossMargin - opex.total;
  const ebitdaPct = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  
  return {
    revenue,
    cogs,
    grossMargin,
    grossMarginPct,
    opex,
    ebitda,
    ebitdaPct
  };
}

// ============================================================================
// STAFF COSTS DETAILED
// ============================================================================

/**
 * Estrae dettaglio costi personale dal budget
 * 
 * Utile per analisi headcount e salary breakdown
 */
export function extractStaffCosts(budgetData: BudgetData): StaffCostDetail[] {
  const staffDetails: StaffCostDetail[] = [];
  
  // Cerca categoria "Personale" o "Staff"
  const staffCategory = budgetData.categories.find(cat => 
    cat.name.toLowerCase().includes('personale') ||
    cat.name.toLowerCase().includes('staff')
  );
  
  if (!staffCategory) return staffDetails;
  
  // Per ogni item nella categoria staff
  staffCategory.items.forEach(item => {
    if (item.isTotal || !item.isEditable) return;
    
    const costPerPeriod: { [periodId: string]: number } = {};
    let totalYearCost = 0;
    
    budgetData.periods.forEach(period => {
      const value = item.values[period.id] || 0;
      costPerPeriod[period.id] = value;
      totalYearCost += value;
    });
    
    staffDetails.push({
      role: item.description,
      costYear: totalYearCost,
      fte: 1, // Assume 1 FTE, può essere customizzato
      category: item.categoryId,
      startQuarter: '', // Può essere estratto da metadata se disponibile
      costPerPeriod
    });
  });
  
  return staffDetails;
}

// ============================================================================
// OPEX RATIOS & BENCHMARKS
// ============================================================================

/**
 * Calcola OPEX ratios utili per analisi
 */
export function calculateOpexRatios(revenue: number, opex: OpexBreakdown) {
  return {
    staffAsPercentRevenue: revenue > 0 ? (opex.staff / revenue) * 100 : 0,
    rdAsPercentRevenue: revenue > 0 ? (opex.rd / revenue) * 100 : 0,
    salesMarketingAsPercentRevenue: revenue > 0 ? (opex.salesMarketing / revenue) * 100 : 0,
    gaAsPercentRevenue: revenue > 0 ? (opex.ga / revenue) * 100 : 0,
    totalOpexAsPercentRevenue: revenue > 0 ? (opex.total / revenue) * 100 : 0,
    
    // Efficiency metrics
    revenuePerEmployee: opex.staff > 0 ? revenue / (opex.staff / 50000) : 0, // Assume avg salary 50K
    rdEfficiency: opex.rd > 0 ? revenue / opex.rd : 0 // Revenue per € di R&D
  };
}

// ============================================================================
// OPEX BENCHMARKS (MEDTECH INDUSTRY)
// ============================================================================

/**
 * Benchmarks OPEX per MedTech startup
 * 
 * Fonte: Industry averages per startup B2B MedTech
 */
export const OPEX_BENCHMARKS = {
  early_stage: {
    // Pre-revenue / Early stage
    rd_pct: 60,              // 60% budget in R&D
    sales_marketing_pct: 15, // 15% in S&M
    ga_pct: 25               // 25% in G&A
  },
  growth_stage: {
    // Post-revenue / Growth
    rd_pct: 30,              // 30% revenue in R&D
    sales_marketing_pct: 40, // 40% revenue in S&M
    ga_pct: 15               // 15% revenue in G&A
  },
  mature: {
    // Mature company
    rd_pct: 15,              // 15% revenue in R&D
    sales_marketing_pct: 25, // 25% revenue in S&M
    ga_pct: 10               // 10% revenue in G&A
  }
};

/**
 * Confronta OPEX con benchmarks industry
 */
export function compareWithBenchmarks(
  revenue: number,
  opex: OpexBreakdown,
  stage: 'early_stage' | 'growth_stage' | 'mature' = 'growth_stage'
): {
  category: string;
  actual: number;
  benchmark: number;
  delta: number;
  status: 'over' | 'under' | 'aligned';
}[] {
  const benchmarks = OPEX_BENCHMARKS[stage];
  const ratios = calculateOpexRatios(revenue, opex);
  
  const compare = (actual: number, benchmark: number) => {
    const delta = actual - benchmark;
    const tolerance = 5; // 5% tolerance
    
    if (Math.abs(delta) <= tolerance) return 'aligned';
    return delta > 0 ? 'over' : 'under';
  };
  
  return [
    {
      category: 'R&D',
      actual: ratios.rdAsPercentRevenue,
      benchmark: benchmarks.rd_pct,
      delta: ratios.rdAsPercentRevenue - benchmarks.rd_pct,
      status: compare(ratios.rdAsPercentRevenue, benchmarks.rd_pct)
    },
    {
      category: 'Sales & Marketing',
      actual: ratios.salesMarketingAsPercentRevenue,
      benchmark: benchmarks.sales_marketing_pct,
      delta: ratios.salesMarketingAsPercentRevenue - benchmarks.sales_marketing_pct,
      status: compare(ratios.salesMarketingAsPercentRevenue, benchmarks.sales_marketing_pct)
    },
    {
      category: 'G&A',
      actual: ratios.gaAsPercentRevenue,
      benchmark: benchmarks.ga_pct,
      delta: ratios.gaAsPercentRevenue - benchmarks.ga_pct,
      status: compare(ratios.gaAsPercentRevenue, benchmarks.ga_pct)
    }
  ];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatta valore OPEX per display
 */
export function formatOpexValue(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Calcola burn rate mensile
 * Burn Rate = OPEX mensile (assumendo EBITDA negativo in early stage)
 */
export function calculateBurnRate(opexMonthly: number, ebitda: number): number {
  // Se EBITDA negativo, burn rate = abs(EBITDA)
  // Altrimenti, burn rate = 0 (azienda profittevole)
  return ebitda < 0 ? Math.abs(ebitda) : 0;
}

/**
 * Calcola runway (mesi)
 * Runway = Cash Balance / Monthly Burn Rate
 */
export function calculateRunway(cashBalance: number, monthlyBurnRate: number): number {
  if (monthlyBurnRate <= 0) return Infinity;
  return cashBalance / monthlyBurnRate;
}
