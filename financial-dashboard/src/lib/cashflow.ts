import { MonthlyMetrics, AnnualMetrics, Scenario } from '@/types/financial';

export interface CashFlowStatement {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  
  // Operating activities details
  ebitda: number;
  workingCapitalChange: number;
  accountsReceivableChange: number;
  inventoryChange: number;
  accountsPayableChange: number;
  
  // Investing activities details
  capex: number;
  acquisitions: number;
  assetSales: number;
  
  // Financing activities details
  debtIssued: number;
  debtRepaid: number;
  equityRaised: number;
  dividends: number;
}

export interface AnnualCashFlowStatements {
  year: number;
  statement: CashFlowStatement;
}

export class CashFlowCalculator {
  private scenario: Scenario;
  private monthlyData: MonthlyMetrics[];
  private annualData: AnnualMetrics[];
  
  constructor(scenario: Scenario, monthlyData: MonthlyMetrics[], annualData: AnnualMetrics[]) {
    this.scenario = scenario;
    this.monthlyData = monthlyData;
    this.annualData = annualData;
  }
  
  calculateAnnualCashFlows(): AnnualCashFlowStatements[] {
    const cashFlows: AnnualCashFlowStatements[] = [];
    let previousCash = 2.0; // Initial cash balance of 2M€
    
    for (let year = 0; year < this.annualData.length; year++) {
      const annual = this.annualData[year];
      const yearMonths = this.monthlyData.slice(year * 12, (year + 1) * 12);
      
      // Operating Cash Flow Calculations
      const ebitda = annual.ebitda;
      
      // Working Capital calculations
      const avgRevenue = annual.totalRev / 12;
      const daysReceivable = 45; // Average collection period
      const accountsReceivable = (avgRevenue * daysReceivable) / 30;
      const previousAR = year > 0 ? 
        (this.annualData[year - 1].totalRev / 12 * daysReceivable) / 30 : 0;
      const arChange = accountsReceivable - previousAR;
      
      // Inventory for hardware (2 months of COGS)
      const monthlyCogsHw = yearMonths.reduce((sum, m) => sum + m.cogsHardware, 0) / 12;
      const inventory = monthlyCogsHw * 2;
      const previousInventory = year > 0 ? 
        (this.monthlyData.slice((year - 1) * 12, year * 12)
          .reduce((sum, m) => sum + m.cogsHardware, 0) / 12 * 2) : 0;
      const inventoryChange = inventory - previousInventory;
      
      // Accounts Payable (30 days of OPEX)
      const monthlyOpex = annual.opex / 12;
      const accountsPayable = monthlyOpex;
      const previousAP = year > 0 ? this.annualData[year - 1].opex / 12 : 0;
      const apChange = accountsPayable - previousAP;
      
      const workingCapitalChange = arChange + inventoryChange - apChange;
      const operatingCashFlow = ebitda - workingCapitalChange;
      
      // Investing Cash Flow
      // CapEx for infrastructure, R&D capitalization
      const capexIntensity = 0.15; // 15% of revenue for tech infrastructure
      const capex = annual.totalRev * capexIntensity;
      const investingCashFlow = -capex;
      
      // Financing Cash Flow
      let equityRaised = 0;
      let debtIssued = 0;
      
      // Funding rounds logic
      if (year === 0) {
        equityRaised = 2.0; // Seed round
      } else if (year === 1) {
        equityRaised = 3.0; // Seed+ round
      } else if (year === 2) {
        equityRaised = 5.0; // Series A
      }
      
      const financingCashFlow = equityRaised + debtIssued;
      
      // Net Cash Flow
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
      const endingCash = previousCash + netCashFlow;
      
      const statement: CashFlowStatement = {
        operatingCashFlow: Math.round(operatingCashFlow * 1000) / 1000,
        investingCashFlow: Math.round(investingCashFlow * 1000) / 1000,
        financingCashFlow: Math.round(financingCashFlow * 1000) / 1000,
        netCashFlow: Math.round(netCashFlow * 1000) / 1000,
        beginningCash: Math.round(previousCash * 1000) / 1000,
        endingCash: Math.round(endingCash * 1000) / 1000,
        
        ebitda: Math.round(ebitda * 1000) / 1000,
        workingCapitalChange: Math.round(workingCapitalChange * 1000) / 1000,
        accountsReceivableChange: Math.round(arChange * 1000) / 1000,
        inventoryChange: Math.round(inventoryChange * 1000) / 1000,
        accountsPayableChange: Math.round(apChange * 1000) / 1000,
        
        capex: Math.round(capex * 1000) / 1000,
        acquisitions: 0,
        assetSales: 0,
        
        debtIssued: Math.round(debtIssued * 1000) / 1000,
        debtRepaid: 0,
        equityRaised: Math.round(equityRaised * 1000) / 1000,
        dividends: 0
      };
      
      cashFlows.push({
        year: year + 1,
        statement
      });
      
      previousCash = endingCash;
    }
    
    return cashFlows;
  }
  
  calculateMonthlyCashFlows(): Array<{month: number; cashFlow: number; cumulativeCash: number}> {
    const monthlyCashFlows = [];
    let cumulativeCash = 2.0; // Initial cash
    
    for (let month = 0; month < this.monthlyData.length; month++) {
      const monthData = this.monthlyData[month];
      const year = Math.ceil((month + 1) / 12);
      const monthlyOpex = this.scenario.drivers.opex[year as keyof typeof this.scenario.drivers.opex] / 12;
      
      // Simplified monthly cash flow
      let monthlyCashFlow = monthData.grossMargin - monthlyOpex;
      
      // Add funding events
      if (month === 0) monthlyCashFlow += 2.0;  // Seed
      if (month === 12) monthlyCashFlow += 3.0; // Seed+
      if (month === 24) monthlyCashFlow += 5.0; // Series A
      
      cumulativeCash += monthlyCashFlow;
      
      monthlyCashFlows.push({
        month: month + 1,
        cashFlow: Math.round(monthlyCashFlow * 1000) / 1000,
        cumulativeCash: Math.round(cumulativeCash * 1000) / 1000
      });
    }
    
    return monthlyCashFlows;
  }
}
