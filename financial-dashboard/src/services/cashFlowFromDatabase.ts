/**
 * Cash Flow From Database Service
 * 
 * Collega i calcoli del Cash Flow Statement ai dati reali del database.json
 * Integra: contoEconomico, statoPatrimoniale, revenueModel, budget
 */

import {
  CashFlowStatement,
  WorkingCapitalMetrics,
  calculateWorkingCapital,
  calculateWorkingCapitalChange,
  calculateOperatingCashFlow,
  calculateInvestingCashFlow,
  calculateFinancingCashFlow,
  compileCashFlowStatement,
  analyzeCashFlowSummary
} from './cashFlowCalculations';

// ============================================================================
// TYPES
// ============================================================================

interface DatabaseContoEconomico {
  cogs: any;
  opex: any;
  ammortamenti: any;
  interessiFinanziari: any;
  tasse: any;
}

interface DatabaseStatoPatrimoniale {
  workingCapital: any;
  fixedAssets: any;
  funding: any;
  debt: any;
}

interface YearlyData {
  revenue: number;
  cogs: number;
  ebitda: number;
  depreciation: number;
  interestPaid: number;
  taxesPaid: number;
  capex: number;
  equityRaised: number;
  debtRaised: number;
  debtRepayments: number;
}

// ============================================================================
// EXTRACT DATA FROM DATABASE
// ============================================================================

/**
 * Estrae dati per un anno specifico dal database
 */
export function extractYearlyDataFromDatabase(
  year: number,
  database: any
): YearlyData {
  const yearKey = year.toString();
  
  // Revenue (dalla simulazione o revenueModel)
  // Per ora usiamo placeholder - deve essere collegato al motore ricavi
  const revenue = 0; // TODO: collegare a revenue calculator
  
  // COGS
  const cogs = 0; // TODO: da cogsCalculations
  
  // EBITDA (calcolato: Gross Margin - OPEX)
  const opexTotal = database.contoEconomico?.opex?.totaliCalcolatiPerAnno?.[yearKey] || 0;
  const grossMargin = revenue - cogs;
  const ebitda = grossMargin - opexTotal;
  
  // Ammortamenti
  const depreciation = database.contoEconomico?.ammortamenti?.totaleAnnualeCalcolato?.[yearKey] || 0;
  
  // Interessi
  const interestPaid = database.contoEconomico?.interessiFinanziari?.totaleAnnualeCalcolato?.[yearKey] || 0;
  
  // Tasse
  const taxRate = database.contoEconomico?.tasse?.aliquotaEffettiva || 28;
  const taxableIncome = Math.max(0, ebitda - depreciation - interestPaid);
  const taxesPaid = taxableIncome * (taxRate / 100);
  
  // CAPEX (da fixedAssets)
  const capexPct = database.statoPatrimoniale?.fixedAssets?.capexAsPercentRevenue || 5;
  const capex = revenue * (capexPct / 100);
  
  // Funding rounds per questo anno
  const rounds = database.statoPatrimoniale?.funding?.rounds || [];
  const yearRounds = rounds.filter((r: any) => r.year === (year - 2024) && r.enabled);
  const equityRaised = yearRounds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  
  // Debt per questo anno
  const loans = database.statoPatrimoniale?.debt?.loans || [];
  const yearLoans = loans.filter((l: any) => l.year === (year - 2024) && l.enabled);
  const debtRaised = yearLoans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
  
  // Debt repayments (stimato come interessi per semplicità - da migliorare)
  const debtRepayments = interestPaid * 0.3; // Placeholder
  
  return {
    revenue,
    cogs,
    ebitda,
    depreciation,
    interestPaid,
    taxesPaid,
    capex,
    equityRaised,
    debtRaised,
    debtRepayments
  };
}

/**
 * Calcola working capital per un anno
 */
export function calculateWorkingCapitalForYear(
  yearData: YearlyData,
  database: any
): WorkingCapitalMetrics {
  const wcParams = database.statoPatrimoniale?.workingCapital || {};
  
  return calculateWorkingCapital(
    yearData.revenue,
    yearData.cogs,
    wcParams.dso || 60,
    wcParams.dpo || 45,
    wcParams.inventoryTurnover || 6,
    0.1 // 10% ricavi SaaS prepagati (placeholder)
  );
}

// ============================================================================
// BUILD CASH FLOW STATEMENT
// ============================================================================

/**
 * Costruisce Cash Flow Statement per un anno dai dati database
 */
export function buildCashFlowStatementFromDatabase(
  year: number,
  previousCash: number,
  previousWC: WorkingCapitalMetrics | null,
  database: any
): CashFlowStatement {
  // Estrai dati dell'anno
  const yearData = extractYearlyDataFromDatabase(year, database);
  
  // Calcola working capital
  const currentWC = calculateWorkingCapitalForYear(yearData, database);
  const wcChange = previousWC 
    ? calculateWorkingCapitalChange(currentWC, previousWC)
    : 0;
  
  // Operating Cash Flow
  const operatingCF = calculateOperatingCashFlow(
    yearData.ebitda,
    yearData.depreciation,
    wcChange,
    yearData.interestPaid,
    yearData.taxesPaid
  );
  
  // Investing Cash Flow
  const investingCF = calculateInvestingCashFlow(
    yearData.capex,
    0, // asset sales
    0  // intangibles (inclusi in CAPEX)
  );
  
  // Financing Cash Flow
  const financingCF = calculateFinancingCashFlow(
    yearData.equityRaised,
    yearData.debtRaised,
    yearData.debtRepayments,
    0 // dividends
  );
  
  // Compila statement completo
  return compileCashFlowStatement(
    `Anno ${year}`,
    operatingCF,
    investingCF,
    financingCF,
    previousCash
  );
}

/**
 * Genera serie completa di Cash Flow Statements per 5 anni
 */
export function generateCashFlowProjections(
  database: any,
  startYear: number = 2025,
  numYears: number = 5
): CashFlowStatement[] {
  const statements: CashFlowStatement[] = [];
  
  // Cassa iniziale
  let currentCash = database.statoPatrimoniale?.funding?.initialCash || 2; // M€
  let previousWC: WorkingCapitalMetrics | null = null;
  
  for (let i = 0; i < numYears; i++) {
    const year = startYear + i;
    
    const statement = buildCashFlowStatementFromDatabase(
      year,
      currentCash,
      previousWC,
      database
    );
    
    statements.push(statement);
    
    // Update per prossimo ciclo
    currentCash = statement.cashEnding;
    previousWC = calculateWorkingCapitalForYear(
      extractYearlyDataFromDatabase(year, database),
      database
    );
  }
  
  return statements;
}

// ============================================================================
// INTEGRATION WITH REAL CALCULATIONS
// ============================================================================

/**
 * Versione integrata che usa calcoli reali da altri services
 * 
 * TODO: Collegare a:
 * - gtmCalculations.ts per ricavi reali
 * - cogsCalculations.ts per COGS reali
 * - opexCalculations.ts per OPEX reali
 */
export function buildIntegratedCashFlowStatement(
  year: number,
  previousCash: number,
  previousWC: WorkingCapitalMetrics | null,
  revenueData: { total: number; hardware: number; saas: number },
  cogsData: { total: number },
  opexData: { total: number },
  database: any
): CashFlowStatement {
  const yearKey = year.toString();
  
  // EBITDA = Revenue - COGS - OPEX
  const grossMargin = revenueData.total - cogsData.total;
  const ebitda = grossMargin - opexData.total;
  
  // Ammortamenti
  const depreciation = database.contoEconomico?.ammortamenti?.totaleAnnualeCalcolato?.[yearKey] || 0;
  
  // Interessi e tasse
  const interestPaid = database.contoEconomico?.interessiFinanziari?.totaleAnnualeCalcolato?.[yearKey] || 0;
  const taxRate = database.contoEconomico?.tasse?.aliquotaEffettiva || 28;
  const taxableIncome = Math.max(0, ebitda - depreciation - interestPaid);
  const taxesPaid = taxableIncome * (taxRate / 100);
  
  // Working Capital
  const wcParams = database.statoPatrimoniale?.workingCapital || {};
  const currentWC = calculateWorkingCapital(
    revenueData.total,
    cogsData.total,
    wcParams.dso || 60,
    wcParams.dpo || 45,
    wcParams.inventoryTurnover || 6,
    0.1 // SaaS prepaid
  );
  const wcChange = previousWC ? calculateWorkingCapitalChange(currentWC, previousWC) : 0;
  
  // CAPEX
  const capexPct = database.statoPatrimoniale?.fixedAssets?.capexAsPercentRevenue || 5;
  const capex = revenueData.total * (capexPct / 100);
  
  // Funding
  const rounds = database.statoPatrimoniale?.funding?.rounds || [];
  const yearRounds = rounds.filter((r: any) => r.year === (year - 2024) && r.enabled);
  const equityRaised = yearRounds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  
  const loans = database.statoPatrimoniale?.debt?.loans || [];
  const yearLoans = loans.filter((l: any) => l.year === (year - 2024) && l.enabled);
  const debtRaised = yearLoans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
  const debtRepayments = interestPaid * 0.3;
  
  // Build cash flows
  const operatingCF = calculateOperatingCashFlow(
    ebitda,
    depreciation,
    wcChange,
    interestPaid,
    taxesPaid
  );
  
  const investingCF = calculateInvestingCashFlow(capex, 0, 0);
  const financingCF = calculateFinancingCashFlow(equityRaised, debtRaised, debtRepayments, 0);
  
  return compileCashFlowStatement(
    `Anno ${year}`,
    operatingCF,
    investingCF,
    financingCF,
    previousCash
  );
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export {
  analyzeCashFlowSummary,
  calculateAverageBurnRate,
  calculateCurrentRunway
} from './cashFlowCalculations';
