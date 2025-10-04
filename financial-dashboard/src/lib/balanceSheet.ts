import { Scenario, AnnualMetrics } from '@/types/financial';

export interface BalanceSheetItem {
  year: number;
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      totalCurrent: number;
    };
    fixed: {
      ppe: number; // Property, Plant & Equipment
      intangibles: number;
      accumulatedDepreciation: number;
      netFixed: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      totalCurrent: number;
    };
    longTerm: {
      longTermDebt: number;
      otherLiabilities: number;
      totalLongTerm: number;
    };
    totalLiabilities: number;
  };
  equity: {
    paidInCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  checkBalance: number; // Should be 0 (Assets - Liabilities - Equity)
}

export interface CashFlowStatement {
  year: number;
  operating: {
    netIncome: number;
    depreciation: number;
    changeInReceivables: number;
    changeInPayables: number;
    changeInInventory: number;
    totalOperating: number;
  };
  investing: {
    capex: number;
    acquisitions: number;
    totalInvesting: number;
  };
  financing: {
    equityRaised: number;
    debtProceeds: number;
    debtRepayment: number;
    dividends: number;
    totalFinancing: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export class FinancialStatementsCalculator {
  private scenario: Scenario;
  private annualData: AnnualMetrics[];
  
  constructor(scenario: Scenario, annualData: AnnualMetrics[]) {
    this.scenario = scenario;
    this.annualData = annualData;
  }

  calculateBalanceSheet(): BalanceSheetItem[] {
    const sheets: BalanceSheetItem[] = [];
    let accumulatedDepreciation = 0;
    let retainedEarnings = 0;
    let cash = 2.0; // Initial cash in M€
    let ppe = 0.5; // Initial PP&E in M€
    
    for (let year = 1; year <= 5; year++) {
      const annual = this.annualData[year - 1];
      
      // Calculate DSO (Days Sales Outstanding) and receivables
      const dso = 60; // 60 days average collection
      const accountsReceivable = (annual.totalRev * dso) / 365;
      
      // Calculate inventory (for hardware business)
      const inventoryTurnover = 6; // 6x per year
      const inventory = annual.cogs / inventoryTurnover;
      
      // Calculate payables (DPO - Days Payable Outstanding)
      const dpo = 45; // 45 days average payment
      const accountsPayable = (annual.cogs * dpo) / 365;
      
      // Fixed assets and depreciation
      const capex = annual.totalRev * 0.05; // 5% of revenue as CapEx
      ppe += capex;
      const annualDepreciation = ppe * 0.2; // 20% depreciation rate
      accumulatedDepreciation += annualDepreciation;
      
      // Update cash based on EBITDA and working capital changes
      cash += annual.ebitda;
      
      // Equity calculations
      const paidInCapital = year === 1 ? 2.0 : (year === 3 ? 5.0 : 2.0); // Funding rounds
      retainedEarnings += annual.ebitda - annualDepreciation;
      
      // Current assets
      const currentAssets = {
        cash: Math.round(cash * 1000) / 1000,
        accountsReceivable: Math.round(accountsReceivable * 1000) / 1000,
        inventory: Math.round(inventory * 1000) / 1000,
        totalCurrent: 0
      };
      currentAssets.totalCurrent = currentAssets.cash + currentAssets.accountsReceivable + currentAssets.inventory;
      
      // Fixed assets
      const fixedAssets = {
        ppe: Math.round(ppe * 1000) / 1000,
        intangibles: 0.3, // Patents and IP
        accumulatedDepreciation: Math.round(accumulatedDepreciation * 1000) / 1000,
        netFixed: 0
      };
      fixedAssets.netFixed = fixedAssets.ppe + fixedAssets.intangibles - fixedAssets.accumulatedDepreciation;
      
      const totalAssets = currentAssets.totalCurrent + fixedAssets.netFixed;
      
      // Current liabilities
      const currentLiabilities = {
        accountsPayable: Math.round(accountsPayable * 1000) / 1000,
        shortTermDebt: 0,
        accruedExpenses: Math.round(annual.opex * 0.1 * 1000) / 1000, // 10% of OPEX accrued
        totalCurrent: 0
      };
      currentLiabilities.totalCurrent = currentLiabilities.accountsPayable + 
                                         currentLiabilities.shortTermDebt + 
                                         currentLiabilities.accruedExpenses;
      
      // Long-term liabilities
      const longTermLiabilities = {
        longTermDebt: year >= 2 ? 1.0 : 0, // €1M debt from year 2
        otherLiabilities: 0,
        totalLongTerm: 0
      };
      longTermLiabilities.totalLongTerm = longTermLiabilities.longTermDebt + longTermLiabilities.otherLiabilities;
      
      const totalLiabilities = currentLiabilities.totalCurrent + longTermLiabilities.totalLongTerm;
      
      // Equity
      const equity = {
        paidInCapital: Math.round(paidInCapital * 1000) / 1000,
        retainedEarnings: Math.round(retainedEarnings * 1000) / 1000,
        totalEquity: 0
      };
      equity.totalEquity = equity.paidInCapital + equity.retainedEarnings;
      
      // Balance check
      const checkBalance = Math.round((totalAssets - totalLiabilities - equity.totalEquity) * 1000) / 1000;
      
      sheets.push({
        year,
        assets: {
          current: currentAssets,
          fixed: fixedAssets,
          totalAssets: Math.round(totalAssets * 1000) / 1000
        },
        liabilities: {
          current: currentLiabilities,
          longTerm: longTermLiabilities,
          totalLiabilities: Math.round(totalLiabilities * 1000) / 1000
        },
        equity,
        checkBalance
      });
    }
    
    return sheets;
  }

  calculateCashFlow(): CashFlowStatement[] {
    const statements: CashFlowStatement[] = [];
    let previousReceivables = 0;
    let previousPayables = 0;
    let previousInventory = 0;
    let beginningCash = 2.0; // Initial cash
    
    for (let year = 1; year <= 5; year++) {
      const annual = this.annualData[year - 1];
      const balanceSheet = this.calculateBalanceSheet()[year - 1];
      
      // Operating activities
      const netIncome = annual.ebitda - (balanceSheet.assets.fixed.ppe * 0.2); // EBITDA - Depreciation
      const depreciation = balanceSheet.assets.fixed.ppe * 0.2;
      
      const currentReceivables = balanceSheet.assets.current.accountsReceivable;
      const currentPayables = balanceSheet.liabilities.current.accountsPayable;
      const currentInventory = balanceSheet.assets.current.inventory;
      
      const changeInReceivables = currentReceivables - previousReceivables;
      const changeInPayables = currentPayables - previousPayables;
      const changeInInventory = currentInventory - previousInventory;
      
      const operating = {
        netIncome: Math.round(netIncome * 1000) / 1000,
        depreciation: Math.round(depreciation * 1000) / 1000,
        changeInReceivables: Math.round(-changeInReceivables * 1000) / 1000, // Negative is cash outflow
        changeInPayables: Math.round(changeInPayables * 1000) / 1000, // Positive is cash inflow
        changeInInventory: Math.round(-changeInInventory * 1000) / 1000, // Negative is cash outflow
        totalOperating: 0
      };
      operating.totalOperating = operating.netIncome + operating.depreciation + 
                                 operating.changeInReceivables + operating.changeInPayables + 
                                 operating.changeInInventory;
      
      // Investing activities
      const capex = annual.totalRev * 0.05; // 5% of revenue
      const investing = {
        capex: Math.round(-capex * 1000) / 1000, // Negative for cash outflow
        acquisitions: 0,
        totalInvesting: Math.round(-capex * 1000) / 1000
      };
      
      // Financing activities
      let equityRaised = 0;
      if (year === 1) equityRaised = 2.0; // Seed round
      if (year === 3) equityRaised = 3.0; // Series A
      
      const debtProceeds = year === 2 ? 1.0 : 0;
      const debtRepayment = year >= 4 ? -0.25 : 0; // Repay €250k/year from year 4
      
      const financing = {
        equityRaised: Math.round(equityRaised * 1000) / 1000,
        debtProceeds: Math.round(debtProceeds * 1000) / 1000,
        debtRepayment: Math.round(debtRepayment * 1000) / 1000,
        dividends: 0,
        totalFinancing: Math.round((equityRaised + debtProceeds + debtRepayment) * 1000) / 1000
      };
      
      const netCashFlow = operating.totalOperating + investing.totalInvesting + financing.totalFinancing;
      const endingCash = beginningCash + netCashFlow;
      
      statements.push({
        year,
        operating,
        investing,
        financing,
        netCashFlow: Math.round(netCashFlow * 1000) / 1000,
        beginningCash: Math.round(beginningCash * 1000) / 1000,
        endingCash: Math.round(endingCash * 1000) / 1000
      });
      
      // Update for next iteration
      previousReceivables = currentReceivables;
      previousPayables = currentPayables;
      previousInventory = currentInventory;
      beginningCash = endingCash;
    }
    
    return statements;
  }
}

export function calculateFinancialStatements(
  scenario: Scenario,
  annualData: AnnualMetrics[]
): { balanceSheet: BalanceSheetItem[], cashFlow: CashFlowStatement[] } {
  const calculator = new FinancialStatementsCalculator(scenario, annualData);
  return {
    balanceSheet: calculator.calculateBalanceSheet(),
    cashFlow: calculator.calculateCashFlow()
  };
}
