/**
 * TypeScript Types per FinancialPlan v2.0
 * 
 * Struttura phase-based con calcoli automatici mese×mese
 */

// ============================================================================
// CONFIGURATION TYPES (INPUT - Modificabile dall'utente)
// ============================================================================

export interface BusinessPhase {
  id: string;
  name: string;
  startDate: string;        // "YYYY-MM" format
  endDate: string;          // "YYYY-MM" format
  duration: number;         // mesi
  revenueEnabled: boolean;
  revenueStartDate?: string; // "YYYY-QX" format (se revenueEnabled = true)
  expansionMultiplier?: number; // Moltiplicatore espansione geografica (default 1.0). Es: 2.5 = Italia + EU + USA
  description: string;
  milestones: string[];
  focus: string[];
}

export interface UseOfFundsItem {
  percentage: number;
  amount: number;
  description: string;
}

export interface FundingRound {
  id: string;
  name: string;
  date: string;              // "YYYY-QX" format
  month: number;             // mese assoluto da inizio piano (1-120)
  amount: number;
  currency: string;
  valuation: {
    preMoney: number;
    postMoney: number;
  };
  dilution: number;
  investors: string[];
  useOfFunds: Record<string, UseOfFundsItem>;
  expectedRunway: number;    // mesi
  milestone: string;
}

export interface DataIntegrationField {
  path: string;
  description: string;
  fallback?: any;
  note?: string;
}

export interface DataIntegrationSource {
  source: string;
  fields: Record<string, DataIntegrationField | { path: string; description: string }>;
  note?: string;
}

export interface DataIntegration {
  description: string;
  revenue: DataIntegrationSource;
  costs: DataIntegrationSource;
  market: DataIntegrationSource;
}

export interface WorkingCapitalAssumptions {
  daysReceivables: number;
  daysPayables: number;
  daysInventory: number;
}

export interface GrowthAssumptions {
  salesGrowthPreRevenue: number;
  salesGrowthYear1: number;
  salesGrowthYear2: number;
  salesGrowthYear3: number;
  salesGrowthYear4: number;
}

export interface MarginAssumptions {
  hardwareGrossMargin: number;
  saasGrossMargin: number;
  targetEbitdaMargin: number;
}

export interface TaxAssumptions {
  rate: number;
  lossCarryForward: boolean;
}

export interface Assumptions {
  description: string;
  workingCapital: WorkingCapitalAssumptions;
  growth: GrowthAssumptions;
  margins: MarginAssumptions;
  tax: TaxAssumptions;
}

export interface Configuration {
  businessPhases: BusinessPhase[];
  fundingRounds: FundingRound[];
  dataIntegration: DataIntegration;
  assumptions: Assumptions;
}

// ============================================================================
// CALCULATION TYPES (OUTPUT - Calcolato automaticamente)
// ============================================================================

export interface MonthlyCalculation {
  // Identifiers
  month: number;             // 1-120
  date: string;              // "YYYY-MM"
  quarter: string;           // "2025-Q1"
  year: number;              // 2025
  phase: string;             // ID fase business
  
  // REVENUE
  hardwareSales: {
    units: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number;
  };
  
  saasRevenue: {
    activeDevices: number;
    monthlyFee: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number;
  };
  
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMarginPercent: number;
  
  // OPEX (Operating Expenses)
  opex: {
    personnel: number;
    rd: number;
    regulatory: number;
    clinical: number;
    marketing: number;
    operations: number;
    total: number;
  };
  
  // P&L
  ebitda: number;
  ebitdaMarginPercent: number;
  depreciation: number;
  ebit: number;
  interestExpense: number;
  ebt: number;              // Earnings Before Tax
  taxes: number;
  netIncome: number;
  netMarginPercent: number;
  
  // CASH FLOW
  cashFlow: {
    operations: {
      netIncome: number;
      depreciation: number;   // add back non-cash
      workingCapitalChange: number;
      total: number;
    };
    investing: {
      capex: number;          // negative
      total: number;
    };
    financing: {
      fundingRounds: number;  // positive
      debtRepayment: number;  // negative
      total: number;
    };
    netCashFlow: number;
    cashBalance: number;
  };
  
  // BALANCE SHEET (Simplified)
  balanceSheet: {
    assets: {
      cash: number;
      receivables: number;
      inventory: number;
      ppe: number;                    // Gross PPE (Property, Plant, Equipment)
      accumulatedDepreciation: number; // Accumulated Depreciation
      netPPE: number;                  // Net PPE (Gross - Accumulated Depreciation)
      totalAssets: number;
    };
    liabilities: {
      payables: number;
      debt: number;
      totalLiabilities: number;
    };
    equity: {
      capital: number;
      retainedEarnings: number;
      totalEquity: number;
    };
  };
  
  // METRICS
  metrics: {
    burnRate: number;         // monthly cash burn (negative = burning)
    runway: number;           // months remaining
    unitsToBreakEven: number; // units needed for EBITDA = 0
    revenueToBreakEven: number;
  };
}

export interface AnnualCalculation {
  year: number;
  totalRevenue: number;
  hardwareRevenue: number;
  saasRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalOPEX: number;
  ebitda: number;
  ebitdaMarginPercent: number;
  ebit: number;
  netIncome: number;
  netMarginPercent: number;
  cashBalance: number;
  
  cashFlow: {
    operations: number;
    investing: number;
    financing: number;
    netCashFlow: number;
    endingCash: number;
  };
  
  balanceSheet: {
    assets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      grossPPE: number;
      accumulatedDepreciation: number;
      netPPE: number;
      totalAssets: number;
    };
    liabilities: {
      accountsPayable: number;
      debt: number;
      totalLiabilities: number;
    };
    equity: {
      shareCapital: number;
      retainedEarnings: number;
      totalEquity: number;
    };
  };
  
  metrics: {
    averageBurnRate: number;
    averageRunway: number;
    unitsToBreakEven: number;
  };
}

export interface BreakEvenPoint {
  reached: boolean;
  date: string | null;
  month: number | null;
  revenueNeeded: number | null;
  unitsNeeded: number | null;
  note: string;
}

export interface BreakEvenAnalysis {
  description: string;
  economic: BreakEvenPoint;
  cashFlow: BreakEvenPoint;
}

export interface BurnRateMetrics {
  current: number;
  average: number;
  trend: 'increasing' | 'stable' | 'decreasing' | 'positive';
}

export interface CapitalNeeded {
  total: number;
  breakdown: Record<string, number>;
}

export interface KeyMetrics {
  description: string;
  currentRunway: number;
  burnRate: BurnRateMetrics;
  capitalNeeded: CapitalNeeded;
  ltv: number | null;
  cac: number | null;
  ltvCacRatio: number | null;
  cacPayback: number | null;  // mesi
}

export interface Calculations {
  description: string;
  monthly: {
    description: string;
    data: MonthlyCalculation[];
    note: string;
  };
  annual: {
    description: string;
    data: AnnualCalculation[];
    note: string;
  };
  breakEven: BreakEvenAnalysis;
  metrics: KeyMetrics;
}

// ============================================================================
// ROOT FINANCIAL PLAN TYPE
// ============================================================================

export interface FinancialPlan {
  version: string;
  lastUpdated: string;
  description: string;
  configuration: Configuration;
  calculations: Calculations;
  metadata: {
    createdAt: string;
    createdBy: string;
    version: string;
    migrationFrom?: string;
    note: string;
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    revenueStartDelay: number;      // +/- months
    revenueMultiplier: number;      // 0.7 / 1.0 / 1.3
    costMultiplier: number;         // 1.1 / 1.0 / 0.95
    growthRateMultiplier: number;   // 0.8 / 1.0 / 1.2
    certificationDelay: number;     // +/- months for CE Mark
  };
}

export type ScenarioType = 'base' | 'pessimistic' | 'optimistic' | 'custom';

export interface FundingAlert {
  severity: 'info' | 'warning' | 'critical';
  month: string;
  message: string;
  suggestedAmount: number;
  suggestedTiming: string;
  useOfFunds?: Record<string, UseOfFundsItem>;
}

// ============================================================================
// EXTERNAL DATA INTEGRATION TYPES
// ============================================================================

export interface RevenueModelData {
  hardware: {
    unitPrice: number;
    unitCostByType: number;
  };
  saas: {
    pricing: {
      perDevice: {
        monthlyFee: number;
      };
    };
    activationRate: number;
  };
}

export interface GTMData {
  calculated: {
    realisticSales: {
      y1: number;
      y2: number;
      y3: number;
      y4: number;
      y5: number;
    };
  };
}

export interface BudgetCategory {
  items: Array<{
    year: number;
    value: number;
  }>;
}

export interface BudgetData {
  categories: any; // Array nel database reale, oggetto nel fallback - gestito dinamicamente
}

export interface TamSamSomData {
  ecografi: {
    proiezioni: Array<{
      anno: number;
      som: number;
      som3: number;
      som5: number;
    }>;
  };
}

// ============================================================================
// CALCULATOR SERVICE TYPES
// ============================================================================

export interface CalculatorInput {
  financialPlan: FinancialPlan;
  revenueModel: RevenueModelData;
  gtmData: GTMData;
  budgetData: BudgetData;
  marketData?: TamSamSomData;
}

export interface CalculatorOptions {
  startDate: string;
  horizonMonths: number;
  scenario?: Scenario;
}

export interface CalculatorResult {
  success: boolean;
  data?: {
    monthly: MonthlyCalculation[];
    annual: AnnualCalculation[];
    breakEven: BreakEvenAnalysis;
    metrics: KeyMetrics;
  };
  error?: string;
}
