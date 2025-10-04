export type Year = 1 | 2 | 3 | 4 | 5;
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60;
export type ScenarioKey = "prudente" | "base" | "ambizioso" | "custom" | 
  "tiroide" | "rene" | "msk" | "senologia" | "completo";

export interface FinancialAssumptions {
  // Market & Business Model
  tam: number; // Total Addressable Market (M€)
  sam: number; // Serviceable Addressable Market (M€)
  samAnnualScans: number; // Annual scans in SAM
  
  // Financial Structure
  initialCash: number; // Initial cash/funding (M€)
  discountRate: number; // WACC for NPV calculation
  capexAsPercentRevenue: number; // CapEx as % of revenue
  depreciationRate: number; // Annual depreciation rate
  
  // Funding Schedule
  fundingRounds: Array<{
    year: number;
    amount: number; // M€
    type: 'seed' | 'series-a' | 'series-b' | 'series-c';
  }>;
  
  // Break-even parameters
  breakEvenInitialInvestment?: number; // Should match initialCash
  
  // Sector-specific market configuration
  sectorMarkets?: {
    tiroide: { enabled: boolean; tam: number; sam: number; pricePerExam: number; };
    rene: { enabled: boolean; tam: number; sam: number; pricePerExam: number; };
    msk: { enabled: boolean; tam: number; sam: number; pricePerExam: number; };
    senologia: { enabled: boolean; tam: number; sam: number; pricePerExam: number; };
  };
  
  // Working Capital
  daysReceivable: number; // Average collection period
  daysPayable: number; // Average payment period
  inventoryMonths: number; // Months of inventory to hold
  
  // Ratios & Multiples
  accruedExpensesAsPercentOpex: number; // % of OPEX accrued
  realizationFactor: number; // % of scans actually performed/billed
}

export interface Scenario {
  key: ScenarioKey;
  name: string;
  drivers: {
    // Market penetration rate (what % of SAM generates leads)
    marketPenetrationY1?: number; // 0.001 = 0.1% of SAM
    marketPenetrationY5?: number; // 0.010 = 1.0% of SAM
    useMarketBasedLeads?: boolean; // Use SAM-based calculation vs hardcoded
    leadMult: number;
    l2d: number; // lead to demo conversion
    d2p: number; // demo to pilot conversion  
    p2d: number; // pilot to deal conversion
    dealMult: number;
    arpaSub: number; // ARPA for subscription deals
    arpaMaint: number; // ARPA for maintenance deals (CapEx)
    mixCapEx: number; // % of deals that are CapEx vs Subscription
    devicePrice: number;
    gmRecurring: number; // gross margin on recurring revenue
    hwChurn: number; // monthly hardware churn rate  
    scansPerDevicePerMonth: number;
    // Additional parameters found in scenarios
    churnAnnual?: number; // annual customer churn rate
    hwChurnAnnual?: number; // annual hardware churn rate
    growthQoqPostQ8?: number; // quarterly growth rate post Q8
    opex: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    salesMarketingOpex: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    cogsHw: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    terminalValueMultiple?: number;
  };
  base: {
    leadsPerQuarterQ1toQ8: number[];
  };
  assumptions?: FinancialAssumptions;
  marketConfig?: {
    selectedSectors: string[];
    customTAM?: number;
    customSAM?: number;
  };
}

export interface MonthlyMetrics {
  month: MonthIndex;
  leads: number;
  deals: number;
  dealsCapEx: number;
  dealsSub: number;
  accountsActive: number;
  accountsCapEx: number;
  accountsSub: number;
  devicesShipped: number;
  devicesActive: number;
  recurringRev: number; // M€
  capexRev: number; // M€
  totalRev: number; // M€
  cogs: number; // M€
  cogsHardware: number; // M€
  cogsRecurring: number; // M€
  grossMargin: number; // M€
  scansPerformed: number;
}

export interface AnnualMetrics {
  year: Year;
  recurringRev: number;
  capexRev: number;
  totalRev: number;
  cogs: number;
  grossMargin: number;
  grossMarginPercent: number;
  opex: number;
  salesMarketingOpex: number;
  totalOpex: number;
  ebitda: number;
  arr: number;
}

export interface KPIMetrics {
  arrRunRateM24: number;
  arrRunRateM60: number;
  arrSubM24: number;
  arrSubM60: number;
  arrMaintM24: number;
  arrMaintM60: number;
  totalRevenueY1: number;
  totalRevenueY2: number;
  totalRevenueY3: number;
  totalRevenueY4: number;
  totalRevenueY5: number;
  grossMarginPercent: number;
  ebitdaY1: number;
  ebitdaY2: number;
  ebitdaY3: number;
  ebitdaY4: number;
  ebitdaY5: number;
  breakEvenYearEBITDA: number | null;
  breakEvenYearCFO: number | null;
  somPercent: number;
}

export interface CalculationResults {
  monthlyData: MonthlyMetrics[];
  annualData: AnnualMetrics[];
  kpis: KPIMetrics;
  advancedMetrics?: import('@/lib/advancedMetrics').AdvancedMetrics;
  cashFlowStatements?: import('@/lib/cashflow').AnnualCashFlowStatements[];
  monthlyCashFlows?: Array<{month: number; cashFlow: number; cumulativeCash: number}>;
  growthMetrics?: import('@/lib/growthMetrics').GrowthMetrics;
}

export interface SensitivityCase {
  name: string;
  arpaMult?: number;
  leadMult?: number;
  convMult?: number;
  capexShare?: number;
  cogsDelta?: number;
  opexMult?: number;
}

export interface TornadoResult {
  parameter: string;
  impact: number;
  baseValue: number;
  lowValue: number;
  highValue: number;
}

export interface TwoWayHeatmapData {
  arpaMultipliers: number[];
  leadMultipliers: number[];
  results: number[][]; // EBITDA Y5 values
}

export interface MonteCarloDistribution {
  arpa: { type: 'normal'; mu: number; sigma: number };
  leadMult: { type: 'lognormal'; muln: number; sigmaln: number };
  l2d: { type: 'beta'; alpha: number; beta: number };
  d2p: { type: 'beta'; alpha: number; beta: number };
  p2deal: { type: 'beta'; alpha: number; beta: number };
  cogsHw: { type: 'triangular'; low: number; mode: number; high: number };
  opex: { type: 'normal'; mu: number; sigma: number };
  churnAnnual: { type: 'beta'; alpha: number; beta: number };
}

export interface MonteCarloResult {
  runs: number;
  ebitdaY5Distribution: number[];
  percentiles: {
    p10: number;
    p50: number;
    p90: number;
  };
  breakEvenProbability: number;
  fanChart: {
    years: Year[];
    p10: number[];
    p50: number[];
    p90: number[];
  };
}
