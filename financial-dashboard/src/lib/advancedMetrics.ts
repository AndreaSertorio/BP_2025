import { Scenario, MonthlyMetrics, AnnualMetrics } from '@/types/financial';

export interface BreakEvenAnalysis {
  fixedCosts: number;           // in M€
  variableCostPerUnit: number;  // in €
  pricePerUnit: number;         // in €
  contributionMargin: number;   // in €
  breakEvenUnits: number;       // units
  breakEvenRevenue: number;     // in M€
  breakEvenMonth: number | null; // month number when break-even is reached
}

export interface UnitEconomics {
  cac: number;                  // Customer Acquisition Cost in €
  ltv: number;                  // Lifetime Value in €
  ltvCacRatio: number;          // LTV/CAC ratio
  paybackPeriod: number;        // in months
  arpu: number;                 // Average Revenue Per User in €/year
  churnRate: number;            // Annual churn rate
  averageLifetime: number;      // in months
}

export interface CashFlowMetrics {
  burnRate: number;            // Monthly burn rate in M€
  runway: number;              // Runway in months
  cashBalance: number;         // Current cash balance in M€
  cumulativeCash: number;      // Cumulative cash position in M€
  peakFunding: number;         // Peak funding requirement in M€
}

export interface AdvancedMetrics {
  breakEven: BreakEvenAnalysis;
  unitEconomics: UnitEconomics;
  cashFlow: CashFlowMetrics;
  npv: number;                // Net Present Value in M€
  irr: number | null;         // Internal Rate of Return as percentage
}

export class AdvancedMetricsCalculator {
  private scenario: Scenario;
  private monthlyData: MonthlyMetrics[];
  private annualData: AnnualMetrics[];

  constructor(scenario: Scenario, monthlyData: MonthlyMetrics[], annualData: AnnualMetrics[]) {
    this.scenario = scenario;
    this.monthlyData = monthlyData;
    this.annualData = annualData;
  }

  calculateAll(): AdvancedMetrics {
    return {
      breakEven: this.calculateBreakEven(),
      unitEconomics: this.calculateUnitEconomics(),
      cashFlow: this.calculateCashFlowMetrics(),
      npv: this.calculateNPV(),
      irr: this.calculateIRR()
    };
  }

  private calculateBreakEven(): BreakEvenAnalysis {
    const { drivers } = this.scenario;
    
    // Calculate average fixed costs (OPEX) across years
    const avgOpex = Object.values(drivers.opex).reduce((sum, val) => sum + val, 0) / 5;
    
    // Calculate average ARPA based on mix
    const avgArpa = drivers.arpaSub * (1 - drivers.mixCapEx) + drivers.arpaMaint * drivers.mixCapEx;
    
    // Calculate average price per unit (device price * capex share + annual software fee)
    const pricePerUnit = drivers.devicePrice * drivers.mixCapEx + avgArpa;
    
    // Calculate average variable cost per unit
    const avgCogsHw = Object.values(drivers.cogsHw).reduce((sum, val) => sum + val, 0) / 5;
    const variableCostPerUnit = avgCogsHw * drivers.mixCapEx + (1 - drivers.gmRecurring) * avgArpa;
    
    // Calculate contribution margin
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    
    // Calculate break-even units
    const breakEvenUnits = contributionMargin > 0 ? (avgOpex * 1e6) / contributionMargin : Infinity;
    
    // Calculate break-even revenue
    const breakEvenRevenue = (breakEvenUnits * pricePerUnit) / 1e6;
    
    // Find the month when cumulative EBITDA becomes positive
    let cumulativeEbitda = 0;
    let breakEvenMonth: number | null = null;
    
    for (let month = 0; month < this.monthlyData.length; month++) {
      const yearIndex = Math.floor(month / 12);
      const monthlyOpex = drivers.opex[(yearIndex + 1) as keyof typeof drivers.opex] / 12;
      const monthlyEbitda = this.monthlyData[month].grossMargin - monthlyOpex;
      cumulativeEbitda += monthlyEbitda;
      
      if (cumulativeEbitda >= 0 && breakEvenMonth === null) {
        breakEvenMonth = month + 1;
      }
    }

    return {
      fixedCosts: avgOpex,
      variableCostPerUnit,
      pricePerUnit,
      contributionMargin,
      breakEvenUnits: Math.round(breakEvenUnits),
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      breakEvenMonth
    };
  }

  private calculateUnitEconomics(): UnitEconomics {
    const { drivers } = this.scenario;
    
    // Calculate CAC (Customer Acquisition Cost) using actual S&M costs
    // Use salesMarketingOpex from drivers for accurate CAC
    const totalMarketingCosts = Object.values(drivers.salesMarketingOpex).reduce((sum, val) => sum + val, 0);
    const totalNewCustomers = this.monthlyData.reduce((sum, m) => sum + m.deals, 0);
    const cac = totalNewCustomers > 0 ? (totalMarketingCosts * 1e6) / totalNewCustomers : 0;
    
    // Calculate LTV (Lifetime Value)
    const avgArpa = drivers.arpaSub * (1 - drivers.mixCapEx) + drivers.arpaMaint * drivers.mixCapEx;
    const arpu = avgArpa;
    // Convert monthly churn to annual churn rate
    const annualChurnRate = 1 - Math.pow(1 - drivers.hwChurn, 12);
    const averageLifetime = annualChurnRate > 0 ? 12 / annualChurnRate : 60; // in months
    const ltv = arpu * (averageLifetime / 12);
    
    // Calculate LTV/CAC ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    
    // Calculate payback period
    const monthlyRevPerCustomer = arpu / 12;
    const paybackPeriod = cac > 0 ? cac / monthlyRevPerCustomer : 0;

    return {
      cac,
      ltv,
      ltvCacRatio,
      paybackPeriod,
      arpu,
      churnRate: annualChurnRate,
      averageLifetime
    };
  }

  private calculateCashFlowMetrics(): CashFlowMetrics {
    const { drivers } = this.scenario;
    // Calculate monthly burn rate (average of first 2 years)
    const year1Burn = this.annualData[0].ebitda < 0 ? -this.annualData[0].ebitda / 12 : 0;
    const year2Burn = this.annualData[1].ebitda < 0 ? -this.annualData[1].ebitda / 12 : 0;
    const burnRate = (year1Burn + year2Burn) / 2;
    
    // Use initial cash from assumptions
    const initialCash = this.scenario.assumptions?.initialCash || 2.0;
    
    // Calculate cumulative cash position
    let cumulativeCash = initialCash;
    let peakFunding = 0;
    
    for (const annual of this.annualData) {
      cumulativeCash += annual.ebitda;
      if (cumulativeCash < peakFunding) {
        peakFunding = cumulativeCash;
      }
    }
    
    // Calculate runway
    const currentCash = Math.max(cumulativeCash, 0);
    const runway = burnRate > 0 ? currentCash / burnRate : Infinity;

    return {
      burnRate: Math.round(burnRate * 1000) / 1000,
      runway: Math.round(runway),
      cashBalance: Math.round(currentCash * 1000) / 1000,
      cumulativeCash: Math.round(cumulativeCash * 1000) / 1000,
      peakFunding: Math.round(Math.abs(peakFunding) * 1000) / 1000
    };
  }

  private calculateNPV(discountRate?: number): number {
    const rate = discountRate || this.scenario.assumptions?.discountRate || 0.12;
    let npv = 0;
    
    for (let year = 0; year < this.annualData.length; year++) {
      const cashFlow = this.annualData[year].ebitda;
      const discountFactor = Math.pow(1 + rate, year + 1);
      npv += cashFlow / discountFactor;
    }
    
    // Add terminal value - use scenario-specific multiple or conservative default
    const terminalMultiple = this.scenario.drivers.terminalValueMultiple || 3.0; // Conservative default
    const terminalValue = this.annualData[4].ebitda * terminalMultiple;
    const terminalDiscountFactor = Math.pow(1 + rate, 5);
    npv += terminalValue / terminalDiscountFactor;
    
    return Math.round(npv * 100) / 100;
  }

  private calculateIRR(): number | null {
    const initialInvestment = this.scenario.assumptions?.initialCash || 2.0;
    const cashFlows = [-initialInvestment]; // Initial investment
    
    for (const annual of this.annualData) {
      cashFlows.push(annual.ebitda);
    }
    
    // Add terminal value using scenario-specific or conservative multiple
    const terminalMultiple = this.scenario.drivers.terminalValueMultiple || 3.0;
    cashFlows[cashFlows.length - 1] += this.annualData[4].ebitda * terminalMultiple;
    
    // Newton-Raphson method for IRR calculation
    let rate = 0.1;
    const maxIterations = 100;
    const tolerance = 1e-6;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let j = 0; j < cashFlows.length; j++) {
        const factor = Math.pow(1 + rate, j);
        npv += cashFlows[j] / factor;
        dnpv -= j * cashFlows[j] / (factor * (1 + rate));
      }
      
      if (Math.abs(npv) < tolerance) {
        return Math.round(rate * 10000) / 100; // Return as percentage
      }
      
      rate = rate - npv / dnpv;
      
      // Check for convergence issues
      if (rate < -0.99 || rate > 10) {
        return null;
      }
    }
    
    return null;
  }
}

// Export function to calculate advanced metrics
export function calculateAdvancedMetrics(
  scenario: Scenario,
  monthlyData: MonthlyMetrics[],
  annualData: AnnualMetrics[]
): AdvancedMetrics {
  const calculator = new AdvancedMetricsCalculator(scenario, monthlyData, annualData);
  return calculator.calculateAll();
}
