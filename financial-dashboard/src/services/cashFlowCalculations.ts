/**
 * Cash Flow Calculations Service
 * 
 * Calcola il Rendiconto Finanziario (Cash Flow Statement) completo:
 * - Operating Cash Flow (da operazioni)
 * - Investing Cash Flow (investimenti/CAPEX)
 * - Financing Cash Flow (equity/debt)
 * 
 * Fonte dati: database.json (contoEconomico, statoPatrimoniale, revenueModel, budget)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkingCapitalMetrics {
  accountsReceivable: number;      // Crediti commerciali (DSO)
  inventory: number;                // Magazzino
  accountsPayable: number;          // Debiti commerciali (DPO)
  deferredRevenue: number;          // Ricavi differiti (SaaS prepagato)
  totalWorkingCapital: number;      // Totale capitale circolante
  change: number;                   // Variazione rispetto periodo precedente
}

export interface OperatingCashFlow {
  ebitda: number;                   // EBITDA dal P&L
  addBackDepreciation: number;      // + Ammortamenti (non-cash)
  workingCapitalChange: number;     // - Variazione working capital
  interestPaid: number;             // - Interessi pagati
  taxesPaid: number;                // - Tasse pagate
  operatingCashFlow: number;        // = Cash Flow Operativo netto
}

export interface InvestingCashFlow {
  capex: number;                    // - Acquisto asset fissi (negativo)
  assetSales: number;               // + Vendita asset (positivo)
  intangibleInvestments: number;    // - Brevetti, IP, software
  totalInvestingCashFlow: number;   // = Cash Flow da Investimenti (negativo)
}

export interface FinancingCashFlow {
  equityRaised: number;             // + Aumenti di capitale
  debtRaised: number;               // + Nuovi prestiti
  debtRepayments: number;           // - Rimborsi prestiti
  dividendsPaid: number;            // - Dividendi (raro per startup)
  totalFinancingCashFlow: number;   // = Cash Flow da Finanziamenti
}

export interface CashFlowStatement {
  period: string;                   // Anno o trimestre
  
  // Cash Flow Components
  operatingCF: OperatingCashFlow;
  investingCF: InvestingCashFlow;
  financingCF: FinancingCashFlow;
  
  // Cash Position
  cashBeginning: number;            // Cassa iniziale periodo
  netCashFlow: number;              // Flusso netto (Op + Inv + Fin)
  cashEnding: number;               // Cassa finale periodo
  
  // Metrics
  burnRate: number;                 // Burn rate mensile (se negativo)
  runway: number;                   // Mesi di runway disponibili
  cashFlowPositive: boolean;        // Flag: cash flow positivo?
}

export interface CashFlowSummary {
  periods: CashFlowStatement[];
  minCashBalance: number;           // Minimo saldo cassa raggiunto
  minCashPeriod: string;            // Periodo con minimo saldo
  totalFundingRequired: number;     // Totale finanziamento necessario
  breakEvenCashFlowPeriod?: string; // Primo periodo cash flow positivo
}

// ============================================================================
// WORKING CAPITAL CALCULATIONS
// ============================================================================

/**
 * Calcola metriche di capitale circolante
 */
export function calculateWorkingCapital(
  revenue: number,
  cogs: number,
  dso: number = 60,              // Days Sales Outstanding
  dpo: number = 45,              // Days Payable Outstanding
  inventoryTurnover: number = 6, // Rotazione magazzino (volte/anno)
  deferredRevenuePct: number = 0 // % ricavi SaaS prepagati
): WorkingCapitalMetrics {
  // Crediti commerciali: ricavi × (DSO / 365)
  const accountsReceivable = revenue * (dso / 365);
  
  // Magazzino: COGS / inventory turnover
  const inventory = cogs / inventoryTurnover;
  
  // Debiti commerciali: COGS × (DPO / 365)
  const accountsPayable = cogs * (dpo / 365);
  
  // Ricavi differiti: % ricavi SaaS prepagati
  const deferredRevenue = revenue * deferredRevenuePct;
  
  // Working Capital = (AR + Inventory) - (AP + Deferred Revenue)
  const totalWorkingCapital = 
    (accountsReceivable + inventory) - (accountsPayable + deferredRevenue);
  
  return {
    accountsReceivable,
    inventory,
    accountsPayable,
    deferredRevenue,
    totalWorkingCapital,
    change: 0 // Calcolato dopo confrontando periodi
  };
}

/**
 * Calcola variazione working capital tra due periodi
 */
export function calculateWorkingCapitalChange(
  currentWC: WorkingCapitalMetrics,
  previousWC: WorkingCapitalMetrics
): number {
  // Variazione positiva = consuma cassa
  // Variazione negativa = libera cassa
  return currentWC.totalWorkingCapital - previousWC.totalWorkingCapital;
}

// ============================================================================
// OPERATING CASH FLOW
// ============================================================================

/**
 * Calcola Cash Flow Operativo (metodo indiretto)
 * 
 * Formula:
 * OCF = EBITDA + Ammortamenti - ΔWC - Interessi - Tasse
 */
export function calculateOperatingCashFlow(
  ebitda: number,
  depreciation: number,
  workingCapitalChange: number,
  interestPaid: number = 0,
  taxesPaid: number = 0
): OperatingCashFlow {
  // EBITDA è già cash-based (esclude D&A)
  // Aggiungiamo indietro depreciation perché non è cash out
  const cashFromOperations = ebitda + depreciation;
  
  // Sottraiamo variazione WC (se aumenta, consuma cassa)
  // Sottraiamo interessi e tasse effettivamente pagate
  const operatingCashFlow = 
    cashFromOperations - workingCapitalChange - interestPaid - taxesPaid;
  
  return {
    ebitda,
    addBackDepreciation: depreciation,
    workingCapitalChange: -workingCapitalChange, // Mostriamo come sottrazione
    interestPaid: -interestPaid,
    taxesPaid: -taxesPaid,
    operatingCashFlow
  };
}

// ============================================================================
// INVESTING CASH FLOW
// ============================================================================

/**
 * Calcola Cash Flow da Investimenti
 * 
 * Tipicamente negativo (uscite per CAPEX)
 */
export function calculateInvestingCashFlow(
  capex: number = 0,              // Acquisti asset (positivo in input)
  assetSales: number = 0,         // Vendite asset
  intangibles: number = 0         // IP, brevetti, software
): InvestingCashFlow {
  // CAPEX sono uscite (negativi nel cash flow)
  const totalInvestingCashFlow = -capex + assetSales - intangibles;
  
  return {
    capex: -capex,
    assetSales,
    intangibleInvestments: -intangibles,
    totalInvestingCashFlow
  };
}

// ============================================================================
// FINANCING CASH FLOW
// ============================================================================

/**
 * Calcola Cash Flow da Finanziamenti
 */
export function calculateFinancingCashFlow(
  equityRaised: number = 0,       // Aumenti capitale
  debtRaised: number = 0,         // Nuovi prestiti
  debtRepayments: number = 0,     // Rimborsi rate
  dividends: number = 0           // Dividendi (raro per startup)
): FinancingCashFlow {
  const totalFinancingCashFlow = 
    equityRaised + debtRaised - debtRepayments - dividends;
  
  return {
    equityRaised,
    debtRaised,
    debtRepayments: -debtRepayments,
    dividendsPaid: -dividends,
    totalFinancingCashFlow
  };
}

// ============================================================================
// COMPLETE CASH FLOW STATEMENT
// ============================================================================

/**
 * Compila Cash Flow Statement completo per un periodo
 */
export function compileCashFlowStatement(
  period: string,
  operatingCF: OperatingCashFlow,
  investingCF: InvestingCashFlow,
  financingCF: FinancingCashFlow,
  cashBeginning: number
): CashFlowStatement {
  // Net Cash Flow = somma dei tre flussi
  const netCashFlow = 
    operatingCF.operatingCashFlow +
    investingCF.totalInvestingCashFlow +
    financingCF.totalFinancingCashFlow;
  
  // Cash finale = cash iniziale + net cash flow
  const cashEnding = cashBeginning + netCashFlow;
  
  // Burn Rate (se negativo)
  const burnRate = operatingCF.operatingCashFlow < 0 
    ? Math.abs(operatingCF.operatingCashFlow) / 12 
    : 0;
  
  // Runway (mesi disponibili)
  const runway = burnRate > 0 ? cashEnding / burnRate : Infinity;
  
  return {
    period,
    operatingCF,
    investingCF,
    financingCF,
    cashBeginning,
    netCashFlow,
    cashEnding,
    burnRate,
    runway,
    cashFlowPositive: netCashFlow > 0
  };
}

// ============================================================================
// MULTI-PERIOD ANALYSIS
// ============================================================================

/**
 * Analizza Cash Flow su più periodi e identifica metriche chiave
 */
export function analyzeCashFlowSummary(
  statements: CashFlowStatement[]
): CashFlowSummary {
  if (statements.length === 0) {
    return {
      periods: [],
      minCashBalance: 0,
      minCashPeriod: '',
      totalFundingRequired: 0
    };
  }
  
  // Trova minimo saldo cassa
  let minCash = Infinity;
  let minPeriod = '';
  let firstPositivePeriod: string | undefined;
  
  statements.forEach(stmt => {
    if (stmt.cashEnding < minCash) {
      minCash = stmt.cashEnding;
      minPeriod = stmt.period;
    }
    
    // Primo periodo cash flow positivo
    if (!firstPositivePeriod && stmt.cashFlowPositive) {
      firstPositivePeriod = stmt.period;
    }
  });
  
  // Funding necessario = valore assoluto se minimo è negativo
  const totalFundingRequired = minCash < 0 ? Math.abs(minCash) * 1.2 : 0; // +20% buffer
  
  return {
    periods: statements,
    minCashBalance: minCash,
    minCashPeriod: minPeriod,
    totalFundingRequired,
    breakEvenCashFlowPeriod: firstPositivePeriod
  };
}

// ============================================================================
// BURN RATE & RUNWAY HELPERS
// ============================================================================

/**
 * Calcola burn rate mensile medio su un periodo
 */
export function calculateAverageBurnRate(
  statements: CashFlowStatement[]
): number {
  const negativeCFs = statements
    .map(s => s.operatingCF.operatingCashFlow)
    .filter(cf => cf < 0);
  
  if (negativeCFs.length === 0) return 0;
  
  const totalNegativeCF = negativeCFs.reduce((sum, cf) => sum + Math.abs(cf), 0);
  const avgAnnualBurn = totalNegativeCF / negativeCFs.length;
  
  return avgAnnualBurn / 12; // Mensile
}

/**
 * Calcola runway attuale
 */
export function calculateCurrentRunway(
  currentCash: number,
  monthlyBurnRate: number
): number {
  if (monthlyBurnRate <= 0) return Infinity;
  return currentCash / monthlyBurnRate;
}

// ============================================================================
// FORMATTERS
// ============================================================================

export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value * 1000); // Database in K€, display in €
}

export function formatCurrencyK(value: number, decimals: number = 0): string {
  return `€${Math.round(value)}K`;
}

export function formatMonths(months: number): string {
  if (!isFinite(months)) return '∞';
  if (months < 1) return '<1 mese';
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (years > 0 && remainingMonths > 0) {
    return `${years}a ${remainingMonths}m`;
  } else if (years > 0) {
    return `${years} ${years === 1 ? 'anno' : 'anni'}`;
  } else {
    return `${remainingMonths} ${remainingMonths === 1 ? 'mese' : 'mesi'}`;
  }
}

// ============================================================================
// VALIDATORS
// ============================================================================

export function validateCashFlowInputs(
  ebitda: number,
  depreciation: number,
  workingCapitalChange: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Depreciation non può essere negativo
  if (depreciation < 0) {
    errors.push('Ammortamenti non possono essere negativi');
  }
  
  // Working capital change eccessivo (>100% ricavi) è sospetto
  // (ma non blocchiamo, solo warning)
  
  return {
    valid: errors.length === 0,
    errors
  };
}
