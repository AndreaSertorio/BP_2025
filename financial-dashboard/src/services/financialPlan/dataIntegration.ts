/**
 * Data Integration Service
 * 
 * Legge dati da altre sezioni del database (Revenue Model, GTM, Budget, Market)
 * e li prepara per il FinancialCalculator
 */

import type {
  RevenueModelData,
  GTMData,
  BudgetData,
  TamSamSomData,
  FinancialPlan
} from '../../types/financialPlan.types';

// ============================================================================
// DATA READERS
// ============================================================================

/**
 * Legge dati Revenue Model dal database
 */
export function readRevenueModelData(database: any): RevenueModelData {
  try {
    const revenueModel = database.revenueModel;
    
    if (!revenueModel) {
      console.warn('⚠️ revenueModel non trovato in database, uso fallback');
      return getRevenueModelFallback();
    }
    
    return {
      hardware: {
        unitPrice: revenueModel.hardware?.unitPrice ?? 50000,
        unitCostByType: revenueModel.hardware?.unitCostByType ?? 11000
      },
      saas: {
        pricing: {
          perDevice: {
            monthlyFee: revenueModel.saas?.pricing?.perDevice?.monthlyFee ?? 300
          }
        },
        activationRate: revenueModel.saas?.activationRate ?? 0.8
      }
    };
  } catch (error) {
    console.error('❌ Errore lettura revenueModel:', error);
    return getRevenueModelFallback();
  }
}

/**
 * Legge dati GTM (Go-To-Market) dal database
 */
export function readGTMData(database: any): GTMData {
  try {
    const gtm = database.goToMarket;
    
    if (!gtm?.calculated?.realisticSales) {
      console.warn('⚠️ goToMarket.calculated.realisticSales non trovato, uso fallback');
      return getGTMDataFallback();
    }
    
    const realisticSales = gtm.calculated.realisticSales;
    
    return {
      calculated: {
        realisticSales: {
          y1: realisticSales.y1 ?? 0,
          y2: realisticSales.y2 ?? 0,
          y3: realisticSales.y3 ?? 0,
          y4: realisticSales.y4 ?? 0,
          y5: realisticSales.y5 ?? 0
        }
      }
    };
  } catch (error) {
    console.error('❌ Errore lettura GTM data:', error);
    return getGTMDataFallback();
  }
}

/**
 * Legge dati Budget dal database
 */
export function readBudgetData(database: any): BudgetData {
  try {
    const budget = database.budget;
    
    if (!budget?.categories) {
      console.warn('⚠️ budget.categories non trovato, uso fallback');
      return getBudgetDataFallback();
    }
    
    // budget.categories è un ARRAY nel database!
    const categoriesArray = budget.categories;
    
    return {
      categories: categoriesArray // Passo l'array direttamente, il calculator lo gestisce
    };
  } catch (error) {
    console.error('❌ Errore lettura budget data:', error);
    return getBudgetDataFallback();
  }
}

/**
 * Legge dati mercato (TAM/SAM/SOM) dal database
 */
export function readMarketData(database: any): TamSamSomData {
  try {
    const config = database.configurazioneTamSamSom;
    
    if (!config?.ecografi?.proiezioni) {
      console.warn('⚠️ configurazioneTamSamSom.ecografi.proiezioni non trovato, uso fallback');
      return getMarketDataFallback();
    }
    
    return {
      ecografi: {
        proiezioni: config.ecografi.proiezioni
      }
    };
  } catch (error) {
    console.error('❌ Errore lettura market data:', error);
    return getMarketDataFallback();
  }
}

// ============================================================================
// FALLBACK DATA (se database manca dati)
// ============================================================================

function getRevenueModelFallback(): RevenueModelData {
  return {
    hardware: {
      unitPrice: 50000,
      unitCostByType: 11000
    },
    saas: {
      pricing: {
        perDevice: {
          monthlyFee: 300
        }
      },
      activationRate: 0.8
    }
  };
}

function getGTMDataFallback(): GTMData {
  return {
    calculated: {
      realisticSales: {
        y1: 0,
        y2: 5,
        y3: 15,
        y4: 35,
        y5: 60
      }
    }
  };
}

function getBudgetDataFallback(): BudgetData {
  return {
    categories: {
      cat_1: { items: [{ year: 2025, value: 20000 }] }, // R&D
      cat_2: { items: [{ year: 2025, value: 10000 }] }, // Regulatory
      cat_3: { items: [{ year: 2025, value: 15000 }] }, // Clinical
      cat_4: { items: [{ year: 2025, value: 30000 }] }, // Personnel
      cat_5: { items: [{ year: 2025, value: 5000 }] },  // Operations
      cat_6: { items: [{ year: 2025, value: 10000 }] }  // Marketing
    }
  };
}

function getMarketDataFallback(): TamSamSomData {
  return {
    ecografi: {
      proiezioni: [
        { anno: 2025, som: 0, som3: 0, som5: 0 },
        { anno: 2026, som: 0, som3: 0, som5: 0 },
        { anno: 2027, som: 100000, som3: 300000, som5: 500000 },
        { anno: 2028, som: 200000, som3: 600000, som5: 1000000 },
        { anno: 2029, som: 400000, som3: 1200000, som5: 2000000 }
      ]
    }
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Estrae valore da budget per uno specifico anno
 * Struttura reale: category.subcategories[].items[].values{tot_25, tot_26, ...}
 */
export function getBudgetValueForYear(
  category: any,
  year: number
): number {
  if (!category) return 0;
  
  // Vecchio formato: { items: Array<{ year, value }> }
  if (category.items && Array.isArray(category.items) && category.items[0]?.year) {
    const item = category.items.find((i: any) => i.year === year);
    return item?.value ?? 0;
  }
  
  // Nuovo formato database: { subcategories: [{ items: [{ values: { tot_25, tot_26, ... } }] }] }
  let total = 0;
  
  // Cerca chiave anno (es: "tot_25" per 2025, "tot_26" per 2026, etc.)
  const yearKey = `tot_${year.toString().slice(-2)}`; // 2025 → tot_25
  const yearShort = year.toString().slice(-2); // "25"
  
  // Helper per estrarre valore da item (tot_XX o somma trimestri)
  const getItemValue = (item: any): number => {
    if (!item.values) return 0;
    
    // Prova prima tot_XX
    if (item.values[yearKey] !== undefined) {
      return item.values[yearKey];
    }
    
    // Se non c'è tot_XX, somma i trimestri: q1_25 + q2_25 + q3_25 + q4_25
    let quarterSum = 0;
    for (let q = 1; q <= 4; q++) {
      const qKey = `q${q}_${yearShort}`;
      if (item.values[qKey] !== undefined) {
        quarterSum += item.values[qKey];
      }
    }
    return quarterSum;
  };
  
  // Aggrega da tutte le subcategories
  if (category.subcategories && Array.isArray(category.subcategories)) {
    for (const subcat of category.subcategories) {
      if (subcat.items && Array.isArray(subcat.items)) {
        for (const item of subcat.items) {
          const value = getItemValue(item);
          if (value !== 0) {
            total += value;
          }
        }
      }
    }
  }
  
  // Se non ci sono subcategories, prova direttamente su items (alcuni cat hanno items diretti)
  if (category.items && Array.isArray(category.items)) {
    for (const item of category.items) {
      const value = getItemValue(item);
      if (value !== 0) {
        total += value;
      }
    }
  }
  
  // GROWTH FORMULA: Se anno > 2028 e non ci sono dati, proietta dal 2028 con +15% annuo
  if (total === 0 && year > 2028) {
    const base2028 = getBudgetValueForYear(category, 2028);
    if (base2028 > 0) {
      const yearsSince2028 = year - 2028;
      const growthRate = 0.15; // +15% annuo (assunzione: hiring + inflation)
      total = base2028 * Math.pow(1 + growthRate, yearsSince2028);
      // console.log(`📊 [OPEX Growth] ${category.id} ${year}: €${base2028}K (2028) → €${total.toFixed(1)}K (+${(growthRate * 100)}%/anno × ${yearsSince2028} anni)`);
    }
  }
  
  return total; // Già in K€
}

/**
 * Distribuzione mensile di un valore annuale
 * @param annualValue - Valore annuale in K€
 * @param distributionType - 'uniform' | 'weighted'
 * @returns Array di 12 valori mensili
 */
export function distributeAnnualToMonthly(
  annualValue: number,
  distributionType: 'uniform' | 'weighted' = 'uniform'
): number[] {
  if (distributionType === 'uniform') {
    const monthly = annualValue / 12;
    return Array(12).fill(monthly);
  }
  
  // TODO: Implementare weighted distribution se necessario
  // (es. costi maggiori in certi mesi, stagionalità, etc.)
  
  return Array(12).fill(annualValue / 12);
}

/**
 * Converte data "YYYY-QX" in numero mese (1-120)
 * @param quarterDate - Es. "2025-Q1", "2026-Q3"
 * @param startDate - Data inizio piano in formato "YYYY-MM"
 * @returns Numero mese assoluto
 */
export function quarterToMonth(quarterDate: string, startDate: string): number {
  const [yearStr, quarterStr] = quarterDate.split('-');
  const year = parseInt(yearStr);
  const quarter = parseInt(quarterStr.replace('Q', ''));
  
  // Primo mese del quarter
  const quarterStartMonth = (quarter - 1) * 3 + 1;
  
  const [startYear, startMonth] = startDate.split('-').map(Number);
  
  // Calcola offset in mesi
  const monthsOffset = (year - startYear) * 12 + (quarterStartMonth - startMonth);
  
  return monthsOffset + 1; // +1 perché partiamo da mese 1 (non 0)
}

/**
 * Converte numero mese (1-120) in data "YYYY-MM"
 */
export function monthToDate(month: number, startDate: string): string {
  const [startYear, startMonth] = startDate.split('-').map(Number);
  
  const totalMonths = startMonth + month - 1;
  const year = startYear + Math.floor((totalMonths - 1) / 12);
  const monthOfYear = ((totalMonths - 1) % 12) + 1;
  
  return `${year}-${monthOfYear.toString().padStart(2, '0')}`;
}

/**
 * Converte mese in quarter "YYYY-QX"
 */
export function monthToQuarter(month: number, startDate: string): string {
  const date = monthToDate(month, startDate);
  const [year, monthStr] = date.split('-');
  const monthNum = parseInt(monthStr);
  const quarter = Math.ceil(monthNum / 3);
  
  return `${year}-Q${quarter}`;
}

/**
 * Ottiene fase business per un dato mese
 */
export function getPhaseForMonth(
  month: number,
  phases: FinancialPlan['configuration']['businessPhases'],
  startDate: string
): FinancialPlan['configuration']['businessPhases'][0] | null {
  const currentDate = monthToDate(month, startDate);
  
  for (const phase of phases) {
    if (currentDate >= phase.startDate && currentDate <= phase.endDate) {
      return phase;
    }
  }
  
  return null;
}

/**
 * Verifica se un mese è dopo l'inizio ricavi
 */
export function isAfterRevenueStart(
  month: number,
  revenueStartDate: string | undefined,
  startDate: string
): boolean {
  if (!revenueStartDate) return false;
  
  const revenueStartMonth = quarterToMonth(revenueStartDate, startDate);
  return month >= revenueStartMonth;
}

/**
 * Legge tutti i dati integrati dal database
 */
export function integrateAllData(database: any) {
  console.log('📊 Integrazione dati da database...');
  
  const revenueModel = readRevenueModelData(database);
  const gtmData = readGTMData(database);
  const budgetData = readBudgetData(database);
  const marketData = readMarketData(database);
  
  console.log('✅ Dati integrati:');
  console.log(`   - Revenue Model: €${revenueModel.hardware.unitPrice} device price`);
  console.log(`   - GTM Sales Y1-Y5: ${Object.values(gtmData.calculated.realisticSales).join(', ')}`);
  console.log(`   - Budget: ${Object.keys(budgetData.categories).length} categorie`);
  console.log(`   - Market: ${marketData.ecografi.proiezioni.length} proiezioni anni`);
  
  return {
    revenueModel,
    gtmData,
    budgetData,
    marketData
  };
}
