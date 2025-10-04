import { CalculationResults } from '@/types/financial';

// CSV Export Functions
export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// JSON Export for complete scenario data
export function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export monthly data
export function exportMonthlyData(results: CalculationResults, scenarioName: string) {
  const data = results.monthlyData.map(month => ({
    Month: month.month,
    Year: Math.ceil(month.month / 12),
    Quarter: `Q${Math.ceil((month.month % 12 || 12) / 3)}`,
    Leads: month.leads,
    Deals: month.deals,
    'Deals CapEx': month.dealsCapEx,
    'Deals Subscription': month.dealsSub,
    'Accounts Active': month.accountsActive,
    'Accounts CapEx': month.accountsCapEx,
    'Accounts Subscription': month.accountsSub,
    'Devices Shipped': month.devicesShipped,
    'Devices Active': month.devicesActive,
    'Recurring Revenue (M€)': month.recurringRev,
    'CapEx Revenue (M€)': month.capexRev,
    'Total Revenue (M€)': month.totalRev,
    'COGS (M€)': month.cogs,
    'COGS Hardware (M€)': month.cogsHardware,
    'COGS Recurring (M€)': month.cogsRecurring,
    'Gross Margin (M€)': month.grossMargin,
    'Scans Performed': month.scansPerformed
  }));

  downloadCSV(data, `monthly-data-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export annual data
export function exportAnnualData(results: CalculationResults, scenarioName: string) {
  const data = results.annualData.map(year => ({
    Year: year.year,
    'Recurring Revenue (M€)': year.recurringRev,
    'CapEx Revenue (M€)': year.capexRev,
    'Total Revenue (M€)': year.totalRev,
    'COGS (M€)': year.cogs,
    'Gross Margin (M€)': year.grossMargin,
    'Gross Margin %': year.grossMarginPercent,
    'OPEX (M€)': year.opex,
    'Sales & Marketing OPEX (M€)': year.salesMarketingOpex,
    'Total OPEX (M€)': year.totalOpex,
    'EBITDA (M€)': year.ebitda,
    'ARR (M€)': year.arr
  }));

  downloadCSV(data, `annual-data-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export KPIs
export function exportKPIs(results: CalculationResults, scenarioName: string) {
  const kpis = results.kpis;
  const data = [{
    Scenario: scenarioName,
    'ARR Run-Rate M24 (M€)': kpis.arrRunRateM24,
    'ARR Run-Rate M60 (M€)': kpis.arrRunRateM60,
    'ARR Subscription M24 (M€)': kpis.arrSubM24,
    'ARR Subscription M60 (M€)': kpis.arrSubM60,
    'ARR Maintenance M24 (M€)': kpis.arrMaintM24,
    'ARR Maintenance M60 (M€)': kpis.arrMaintM60,
    'Total Revenue Y1 (M€)': kpis.totalRevenueY1,
    'Total Revenue Y2 (M€)': kpis.totalRevenueY2,
    'Total Revenue Y3 (M€)': kpis.totalRevenueY3,
    'Total Revenue Y4 (M€)': kpis.totalRevenueY4,
    'Total Revenue Y5 (M€)': kpis.totalRevenueY5,
    'Gross Margin %': kpis.grossMarginPercent,
    'EBITDA Y1 (M€)': kpis.ebitdaY1,
    'EBITDA Y2 (M€)': kpis.ebitdaY2,
    'EBITDA Y3 (M€)': kpis.ebitdaY3,
    'EBITDA Y4 (M€)': kpis.ebitdaY4,
    'EBITDA Y5 (M€)': kpis.ebitdaY5,
    'Break-Even Year (EBITDA)': kpis.breakEvenYearEBITDA || 'Not reached',
    'Break-Even Year (Cash Flow)': kpis.breakEvenYearCFO || 'Not reached',
    'SOM %': kpis.somPercent
  }];

  downloadCSV(data, `kpis-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export advanced metrics
export function exportAdvancedMetrics(results: CalculationResults, scenarioName: string) {
  if (!results.advancedMetrics) return;
  
  const metrics = results.advancedMetrics;
  const data = [{
    Scenario: scenarioName,
    'Break-Even Units': metrics.breakEven.breakEvenUnits,
    'Break-Even Revenue (M€)': metrics.breakEven.breakEvenRevenue,
    'Break-Even Month': metrics.breakEven.breakEvenMonth || 'Not reached',
    'Fixed Costs (M€)': metrics.breakEven.fixedCosts,
    'Variable Cost per Unit (€)': metrics.breakEven.variableCostPerUnit,
    'Price per Unit (€)': metrics.breakEven.pricePerUnit,
    'Contribution Margin (€)': metrics.breakEven.contributionMargin,
    'CAC (€)': metrics.unitEconomics.cac,
    'LTV (€)': metrics.unitEconomics.ltv,
    'LTV/CAC Ratio': metrics.unitEconomics.ltvCacRatio,
    'Payback Period (months)': metrics.unitEconomics.paybackPeriod,
    'ARPU (€)': metrics.unitEconomics.arpu,
    'Churn Rate': metrics.unitEconomics.churnRate,
    'Average Lifetime (months)': metrics.unitEconomics.averageLifetime,
    'Burn Rate (M€/month)': metrics.cashFlow.burnRate,
    'Runway (months)': metrics.cashFlow.runway,
    'Cash Balance (M€)': metrics.cashFlow.cashBalance,
    'Cumulative Cash (M€)': metrics.cashFlow.cumulativeCash,
    'Peak Funding (M€)': metrics.cashFlow.peakFunding,
    'NPV (M€)': metrics.npv,
    'IRR %': metrics.irr || 'N/A'
  }];

  downloadCSV(data, `advanced-metrics-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export cash flow statements
export function exportCashFlowStatements(results: CalculationResults, scenarioName: string) {
  if (!results.cashFlowStatements) return;
  
  const data = results.cashFlowStatements.map(({ year, statement }) => ({
    Year: year,
    'Beginning Cash (M€)': statement.beginningCash,
    'EBITDA (M€)': statement.ebitda,
    'Working Capital Change (M€)': statement.workingCapitalChange,
    'Operating Cash Flow (M€)': statement.operatingCashFlow,
    'CapEx (M€)': statement.capex,
    'Investing Cash Flow (M€)': statement.investingCashFlow,
    'Equity Raised (M€)': statement.equityRaised,
    'Debt Issued (M€)': statement.debtIssued,
    'Financing Cash Flow (M€)': statement.financingCashFlow,
    'Net Cash Flow (M€)': statement.netCashFlow,
    'Ending Cash (M€)': statement.endingCash
  }));

  downloadCSV(data, `cashflow-statements-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export growth metrics
export function exportGrowthMetrics(results: CalculationResults, scenarioName: string) {
  if (!results.growthMetrics) return;
  
  const metrics = results.growthMetrics;
  const data = [{
    Scenario: scenarioName,
    'Revenue CAGR %': metrics.revenueCagr,
    'ARR CAGR %': metrics.arrCagr,
    'EBITDA CAGR %': metrics.ebitdaCagr,
    'Rule of 40': metrics.ruleOf40,
    'LTM Revenue (M€)': metrics.ltmRevenue,
    'LTM EBITDA (M€)': metrics.ltmEbitda,
    'Quick Ratio': metrics.quickRatio,
    'YoY Growth Y2 %': metrics.yoyGrowthRates[0] || 'N/A',
    'YoY Growth Y3 %': metrics.yoyGrowthRates[1] || 'N/A',
    'YoY Growth Y4 %': metrics.yoyGrowthRates[2] || 'N/A',
    'YoY Growth Y5 %': metrics.yoyGrowthRates[3] || 'N/A'
  }];

  downloadCSV(data, `growth-metrics-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export complete scenario data
export function exportCompleteScenario(results: CalculationResults, scenarioName: string) {
  const completeData = {
    scenario: scenarioName,
    exportDate: new Date().toISOString(),
    kpis: results.kpis,
    monthlyData: results.monthlyData,
    annualData: results.annualData,
    advancedMetrics: results.advancedMetrics,
    cashFlowStatements: results.cashFlowStatements,
    monthlyCashFlows: results.monthlyCashFlows,
    growthMetrics: results.growthMetrics
  };

  downloadJSON(completeData, `complete-scenario-${scenarioName}-${new Date().toISOString().split('T')[0]}`);
}

// Export function for multi-scenario comparison
export function exportScenarioComparison(scenarios: Array<{name: string, results: CalculationResults}>) {
  const comparisonData = scenarios.map(({ name, results }) => ({
    Scenario: name,
    'Revenue Y1 (M€)': results.kpis.totalRevenueY1,
    'Revenue Y5 (M€)': results.kpis.totalRevenueY5,
    'EBITDA Y1 (M€)': results.kpis.ebitdaY1,
    'EBITDA Y5 (M€)': results.kpis.ebitdaY5,
    'ARR Y5 (M€)': results.kpis.arrRunRateM60,
    'Break-Even Year': results.kpis.breakEvenYearEBITDA || 'Not reached',
    'SOM %': results.kpis.somPercent,
    'Gross Margin %': results.kpis.grossMarginPercent,
    'Revenue CAGR %': results.growthMetrics?.revenueCagr || 'N/A',
    'Rule of 40': results.growthMetrics?.ruleOf40 || 'N/A',
    'CAC (€)': results.advancedMetrics?.unitEconomics.cac || 'N/A',
    'LTV (€)': results.advancedMetrics?.unitEconomics.ltv || 'N/A',
    'LTV/CAC Ratio': results.advancedMetrics?.unitEconomics.ltvCacRatio || 'N/A',
    'NPV (M€)': results.advancedMetrics?.npv || 'N/A',
    'IRR %': results.advancedMetrics?.irr || 'N/A'
  }));

  downloadCSV(comparisonData, `scenario-comparison-${new Date().toISOString().split('T')[0]}`);
}
