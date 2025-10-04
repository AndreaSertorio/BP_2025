import { FinancialAssumptions } from '@/types/financial';

export const defaultFinancialAssumptions: FinancialAssumptions = {
  // Market & Business Model (based on Eco 3D memory)
  tam: 63800, // 63.8M examinations (Total Addressable Market)
  sam: 31900, // 31.9M examinations (Serviceable Addressable Market)  
  samAnnualScans: 31900000, // 31.9M annual scans in SAM
  
  // Financial Structure
  initialCash: 2.0, // Initial cash/funding (M€)
  discountRate: 0.12, // 12% WACC for NPV calculation
  capexAsPercentRevenue: 0.05, // 5% CapEx as % of revenue
  depreciationRate: 0.20, // 20% annual depreciation rate
  
  // Funding Schedule (typical MedTech startup)
  fundingRounds: [
    { year: 1, amount: 2.0, type: 'seed' },
    { year: 2, amount: 3.0, type: 'seed' }, // Seed extension
    { year: 3, amount: 5.0, type: 'series-a' }
  ],
  
  // Working Capital (industry standards for MedTech)
  daysReceivable: 45, // Average collection period for medical devices
  daysPayable: 30, // Average payment period to suppliers
  inventoryMonths: 2, // 2 months of inventory for hardware
  
  // Ratios & Multiples
  accruedExpensesAsPercentOpex: 0.10, // 10% of OPEX accrued
  realizationFactor: 0.85, // 85% of scans actually performed/billed
  
  // Break-even parameters (should match initialCash)
  breakEvenInitialInvestment: 2.0,
  
  // Sector markets configuration (real values from mercati.md - mondo, base prices €50-100)
  sectorMarkets: {
    tiroide: { enabled: true, tam: 15000, sam: 7500, pricePerExam: 75 },    // TIROIDE: 15M esami @ €75 base
    rene: { enabled: true, tam: 25000, sam: 12500, pricePerExam: 60 },      // RENE: 25M esami @ €60 routine
    msk: { enabled: true, tam: 5000, sam: 2500, pricePerExam: 85 },         // MSK: 5M esami @ €85 moderato
    senologia: { enabled: true, tam: 10000, sam: 5000, pricePerExam: 90 }   // SENOLOGIA: 10M esami @ €90 moderato
  }
};

// Sector-specific market assumptions for Eco 3D applications
export const sectorAssumptions = {
  tiroide: {
    ...defaultFinancialAssumptions,
    tam: 15000, // REAL: 15.00M mondo (mercati.md)
    sam: 7500,  // REAL: 7.50M mondo (SAM 50% TAM)
    samAnnualScans: 7500000,
    description: "Focus solo su ecografie tiroidee"
  },
  
  rene: {
    ...defaultFinancialAssumptions,
    tam: 25000, // REAL: 25.00M mondo (mercati.md)
    sam: 12500, // REAL: 12.50M mondo (SAM 50% TAM)
    samAnnualScans: 12500000,
    description: "Focus solo su ecografie renali e urologiche"
  },
  
  msk: {
    ...defaultFinancialAssumptions,
    tam: 5000, // REAL: 5.00M mondo (mercati.md)
    sam: 2500, // REAL: 2.50M mondo (SAM 50% TAM)
    samAnnualScans: 2500000,
    description: "Focus solo su ecografie muscolo-scheletriche"
  },
  
  senologia: {
    ...defaultFinancialAssumptions,
    tam: 10000, // REAL: 10.00M mondo (mercati.md)
    sam: 5000,  // REAL: 5.00M mondo (SAM 50% TAM)
    samAnnualScans: 5000000,
    description: "Focus solo su ecografie senologiche"
  },
  
  completo: {
    ...defaultFinancialAssumptions,
    tam: 55000, // REAL TOTAL: 55.00M mondo (15+25+5+10 mercati.md)
    sam: 27500, // REAL TOTAL: 27.50M mondo (7.5+12.5+2.5+5.0)
    samAnnualScans: 27500000,
    description: "Mercato completo - tutti i settori combinati (valori reali)"
  }
};

// Validation function to ensure all assumptions are properly configured
export function validateFinancialAssumptions(assumptions: FinancialAssumptions): string[] {
  const errors: string[] = [];
  
  if (assumptions.tam <= 0) errors.push('TAM must be positive');
  if (assumptions.sam <= 0) errors.push('SAM must be positive');
  if (assumptions.sam > assumptions.tam) errors.push('SAM cannot exceed TAM');
  if (assumptions.initialCash <= 0) errors.push('Initial cash must be positive');
  if (assumptions.discountRate <= 0 || assumptions.discountRate >= 1) errors.push('Discount rate must be between 0 and 1');
  if (assumptions.realizationFactor <= 0 || assumptions.realizationFactor > 1) errors.push('Realization factor must be between 0 and 1');
  
  // Validate funding rounds
  const sortedRounds = [...assumptions.fundingRounds].sort((a, b) => a.year - b.year);
  for (let i = 0; i < sortedRounds.length; i++) {
    const round = sortedRounds[i];
    if (round.year < 1 || round.year > 5) errors.push(`Funding round year ${round.year} must be between 1 and 5`);
    if (round.amount <= 0) errors.push(`Funding round amount must be positive for year ${round.year}`);
  }
  
  return errors;
}

// Helper function to get funding amount for a specific year
export function getFundingForYear(assumptions: FinancialAssumptions, year: number): number {
  const roundsInYear = assumptions.fundingRounds.filter(round => round.year === year);
  return roundsInYear.reduce((total, round) => total + round.amount, 0);
}

// Helper function to get total funding raised by a specific year
export function getCumulativeFunding(assumptions: FinancialAssumptions, upToYear: number): number {
  const roundsUpToYear = assumptions.fundingRounds.filter(round => round.year <= upToYear);
  return roundsUpToYear.reduce((total, round) => total + round.amount, 0);
}
