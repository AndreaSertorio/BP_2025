import { Scenario, MonthlyMetrics, AnnualMetrics, KPIMetrics, CalculationResults, Year, MonthIndex } from '@/types/financial';
import { calculateAdvancedMetrics } from './advancedMetrics';
import { CashFlowCalculator } from './cashflow';
import { GrowthMetricsCalculator } from './growthMetrics';

export class FinancialCalculator {
  private scenario: Scenario;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
  }

  calculate(): CalculationResults {
    const monthlyData = this.calculateMonthlyMetrics();
    const annualData = this.calculateAnnualMetrics(monthlyData);
    const kpis = this.calculateKPIs(monthlyData, annualData);
    const advancedMetrics = calculateAdvancedMetrics(this.scenario, monthlyData, annualData);
    
    // Calculate additional metrics
    const cashFlowCalculator = new CashFlowCalculator(this.scenario, monthlyData, annualData);
    const cashFlowStatements = cashFlowCalculator.calculateAnnualCashFlows();
    const monthlyCashFlows = cashFlowCalculator.calculateMonthlyCashFlows();
    
    const growthMetricsCalculator = new GrowthMetricsCalculator(monthlyData, annualData);
    const growthMetrics = growthMetricsCalculator.calculateAll();

    return {
      monthlyData,
      annualData,
      kpis,
      advancedMetrics,
      cashFlowStatements,
      monthlyCashFlows,
      growthMetrics
    };
  }

  private calculateMonthlyMetrics(): MonthlyMetrics[] {
    const { drivers, base, assumptions } = this.scenario;
    const monthlyData: MonthlyMetrics[] = [];
    
    let accountsActive = 0;
    let accountsCapEx = 0;
    let accountsSub = 0;
    let devicesActive = 0;
    
    const churnMonthly = 1 - Math.pow(1 - (drivers.churnAnnual || 0.08), 1/12);
    const hwChurnMonthly = drivers.hwChurn; // Use monthly hardware churn directly

    for (let month = 1; month <= 60; month++) {
      const quarter = Math.ceil(month / 3);
      const yearNum = Math.ceil(month / 12);
      
      // Calculate leads per month
      let leads: number;
      
      // New: Use market-based calculation if enabled
      if (drivers.useMarketBasedLeads && assumptions?.sam) {
        // Calculate market penetration that grows over time
        const marketPenY1 = drivers.marketPenetrationY1 || 0.0001; // 0.01% default
        const marketPenY5 = drivers.marketPenetrationY5 || 0.001;  // 0.1% default
        
        // Linear growth of market penetration over 5 years
        const yearProgress = Math.min(yearNum, 5) / 5;
        const currentPenetration = marketPenY1 + (marketPenY5 - marketPenY1) * yearProgress;
        
        // Monthly leads = (SAM × penetration rate) / 12 months
        // SAM is in K units, so multiply by 1000
        const baseMonthlyLeads = (assumptions.sam * 1000 * currentPenetration) / 12;
        
        // Apply seasonal factor based on quarter (if available)
        const seasonalFactor = quarter <= 8 ? 
          (base.leadsPerQuarterQ1toQ8[quarter - 1] / base.leadsPerQuarterQ1toQ8[0]) : 
          Math.pow(1 + (drivers.growthQoqPostQ8 || 0.12), quarter - 8);
        
        leads = baseMonthlyLeads * seasonalFactor * drivers.leadMult;
        
        // Log for debugging
        if (month === 1 || month === 12 || month === 60) {
          console.log(`Month ${month}: SAM=${assumptions.sam}K, Penetration=${(currentPenetration*100).toFixed(3)}%, Leads=${leads.toFixed(0)}`);
        }
      } else {
        // Original hardcoded logic (fallback)
        if (quarter <= 8) {
          leads = (base.leadsPerQuarterQ1toQ8[quarter - 1] / 3) * drivers.leadMult;
        } else {
          const baseQ8Leads = base.leadsPerQuarterQ1toQ8[7];
          const growthFactor = Math.pow(1 + (drivers.growthQoqPostQ8 || 0.12), quarter - 8);
          leads = (baseQ8Leads * growthFactor / 3) * drivers.leadMult;
        }
      }

      // Calculate funnel conversions
      const deals = leads * drivers.l2d * drivers.d2p * drivers.p2d;
      
      // Split deals by contract type
      const dealsCapEx = deals * drivers.mixCapEx;
      const dealsSub = deals * (1 - drivers.mixCapEx);
      
      // Update active accounts (with churn)
      accountsCapEx = accountsCapEx * (1 - churnMonthly) + dealsCapEx;
      accountsSub = accountsSub * (1 - churnMonthly) + dealsSub;
      accountsActive = accountsCapEx + accountsSub;
      
      // Calculate devices
      const devicesCapExShipped = dealsCapEx * drivers.dealMult;
      const devicesSubShipped = dealsSub * drivers.dealMult;
      const devicesShipped = devicesCapExShipped + devicesSubShipped;
      
      // Update devices active (with hardware churn)
      devicesActive = devicesActive * (1 - hwChurnMonthly) + devicesShipped;

      // Calculate revenues (in M€)
      // If we have price per exam and scans, calculate ARPA from that
      let arpaSubCalculated = drivers.arpaSub;
      let arpaMaintCalculated = drivers.arpaMaint;
      
      if (assumptions?.sectorMarkets) {
        // Get the average price per exam from active sectors
        let totalPrice = 0;
        let activeSectors = 0;
        
        const markets = assumptions.sectorMarkets;
        if (markets.tiroide?.enabled) { totalPrice += markets.tiroide.pricePerExam; activeSectors++; }
        if (markets.rene?.enabled) { totalPrice += markets.rene.pricePerExam; activeSectors++; }
        if (markets.msk?.enabled) { totalPrice += markets.msk.pricePerExam; activeSectors++; }
        if (markets.senologia?.enabled) { totalPrice += markets.senologia.pricePerExam; activeSectors++; }
        
        if (activeSectors > 0) {
          const avgPricePerExam = totalPrice / activeSectors;
          // Calculate ARPA from price × scans per month × 12 months
          arpaSubCalculated = avgPricePerExam * drivers.scansPerDevicePerMonth * 12;
          arpaMaintCalculated = arpaSubCalculated * 0.15; // Maintenance is 15% of subscription
          
          // Log for debugging on key months
          if (month === 1 || month === 12) {
            console.log(`ARPA Calculation: Price/exam=€${avgPricePerExam}, Scans/month=${drivers.scansPerDevicePerMonth}, ARPA=€${arpaSubCalculated}`);
          }
        }
      }
      
      const recurringRev = (accountsSub * (arpaSubCalculated / 12) + accountsCapEx * (arpaMaintCalculated / 12)) / 1e6;
      const capexRev = (devicesCapExShipped * drivers.devicePrice) / 1e6;
      const totalRev = recurringRev + capexRev;

      // Calculate COGS (in M€)
      const yearForCogs = Math.ceil(month / 12) as Year;
      const cogsRecurring = (1 - drivers.gmRecurring) * recurringRev;
      // Hardware COGS should only apply to CapEx devices sold
      const cogsHardware = (devicesCapExShipped * drivers.cogsHw[yearForCogs]) / 1e6;
      const cogs = cogsRecurring + cogsHardware;

      // Calculate gross margin
      const grossMargin = totalRev - cogs;
      
      // Calculate scans performed
      const scansPerformed = devicesActive * drivers.scansPerDevicePerMonth;

      monthlyData.push({
        month: month as MonthIndex,
        leads: Math.round(leads),
        deals: Math.round(deals * 100) / 100,
        dealsCapEx: Math.round(dealsCapEx * 100) / 100,
        dealsSub: Math.round(dealsSub * 100) / 100,
        accountsActive: Math.round(accountsActive * 100) / 100,
        accountsCapEx: Math.round(accountsCapEx * 100) / 100,
        accountsSub: Math.round(accountsSub * 100) / 100,
        devicesShipped: Math.round(devicesShipped * 100) / 100,
        devicesActive: Math.round(devicesActive * 100) / 100,
        recurringRev: Math.round(recurringRev * 1000) / 1000,
        capexRev: Math.round(capexRev * 1000) / 1000,
        totalRev: Math.round(totalRev * 1000) / 1000,
        cogs: Math.round(cogs * 1000) / 1000,
        cogsHardware: Math.round(cogsHardware * 1000) / 1000,
        cogsRecurring: Math.round(cogsRecurring * 1000) / 1000,
        grossMargin: Math.round(grossMargin * 1000) / 1000,
        scansPerformed: Math.round(scansPerformed)
      });
    }

    return monthlyData;
  }

  private calculateAnnualMetrics(monthlyData: MonthlyMetrics[]): AnnualMetrics[] {
    const annualData: AnnualMetrics[] = [];
    const { drivers } = this.scenario;

    for (let year = 1; year <= 5; year++) {
      const yearStart = (year - 1) * 12 + 1;
      const yearEnd = year * 12;
      const yearMonths = monthlyData.slice(yearStart - 1, yearEnd);

      const recurringRev = yearMonths.reduce((sum, m) => sum + m.recurringRev, 0);
      const capexRev = yearMonths.reduce((sum, m) => sum + m.capexRev, 0);
      const totalRev = recurringRev + capexRev;
      const cogs = yearMonths.reduce((sum, m) => sum + m.cogs, 0);
      const grossMargin = totalRev - cogs;
      const grossMarginPercent = totalRev > 0 ? (grossMargin / totalRev) * 100 : 0;
      
      const opex = drivers.opex[year as Year];
      const salesMarketingOpex = drivers.salesMarketingOpex[year as Year];
      // Total OPEX should not double-count S&M
      const totalOpex = opex; // opex already includes all operational expenses
      const ebitda = grossMargin - totalOpex;
      
      // ARR calculation (segmented by contract type)
      const endOfYearAccountsSub = monthlyData[yearEnd - 1].accountsSub;
      const endOfYearAccountsCapEx = monthlyData[yearEnd - 1].accountsCapEx;
      const arr = (endOfYearAccountsSub * drivers.arpaSub + endOfYearAccountsCapEx * drivers.arpaMaint) / 1e6;

      annualData.push({
        year: year as Year,
        recurringRev: Math.round(recurringRev * 1000) / 1000,
        capexRev: Math.round(capexRev * 1000) / 1000,
        totalRev: Math.round(totalRev * 1000) / 1000,
        cogs: Math.round(cogs * 1000) / 1000,
        grossMargin: Math.round(grossMargin * 1000) / 1000,
        grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
        opex: Math.round(opex * 1000) / 1000,
        salesMarketingOpex: Math.round(salesMarketingOpex * 1000) / 1000,
        totalOpex: Math.round(totalOpex * 1000) / 1000,
        ebitda: Math.round(ebitda * 1000) / 1000,
        arr: Math.round(arr * 1000) / 1000
      });
    }

    return annualData;
  }

  private calculateKPIs(monthlyData: MonthlyMetrics[], annualData: AnnualMetrics[]): KPIMetrics {
    const { drivers } = this.scenario;
    
    // ARR run-rates segmented
    const arrSubM24 = (monthlyData[23].accountsSub * drivers.arpaSub) / 1e6;
    const arrSubM60 = (monthlyData[59].accountsSub * drivers.arpaSub) / 1e6;
    const arrMaintM24 = (monthlyData[23].accountsCapEx * drivers.arpaMaint) / 1e6;
    const arrMaintM60 = (monthlyData[59].accountsCapEx * drivers.arpaMaint) / 1e6;
    const arrRunRateM24 = arrSubM24 + arrMaintM24;
    const arrRunRateM60 = arrSubM60 + arrMaintM60;

    // Break-even year calculation - EBITDA
    let breakEvenYearEBITDA: number | null = null;
    for (const annual of annualData) {
      if (annual.ebitda >= 0) {
        breakEvenYearEBITDA = annual.year;
        break;
      }
    }

    // Break-even year calculation - CFO (simplified as EBITDA for now)
    let breakEvenYearCFO: number | null = null;
    let cumulativeCash = -2.0; // Initial investment 2M€
    for (const annual of annualData) {
      cumulativeCash += annual.ebitda;
      if (cumulativeCash >= 0 && breakEvenYearCFO === null) {
        breakEvenYearCFO = annual.year;
        break;
      }
    }

    // SOM calculation - more realistic with annual scans
    // Year 5 only (last 12 months) for annual comparison
    const scansY5 = monthlyData.slice(48, 60).reduce((sum, m) => sum + m.scansPerformed, 0);
    // Use SAM from assumptions, not hardcoded!
    const sam = this.scenario.assumptions?.sam || 31900; // K units from assumptions
    const samVolumesAnnual = sam * 1000; // Convert to units
    // Apply a realization factor as not all scans are billable
    const realizationFactor = this.scenario.assumptions?.realizationFactor || 0.85;
    const effectiveScansY5 = scansY5 * realizationFactor;
    const somPercent = (effectiveScansY5 / samVolumesAnnual) * 100;

    return {
      arrRunRateM24: Math.round(arrRunRateM24 * 1000) / 1000,
      arrRunRateM60: Math.round(arrRunRateM60 * 1000) / 1000,
      arrSubM24: Math.round(arrSubM24 * 1000) / 1000,
      arrSubM60: Math.round(arrSubM60 * 1000) / 1000,
      arrMaintM24: Math.round(arrMaintM24 * 1000) / 1000,
      arrMaintM60: Math.round(arrMaintM60 * 1000) / 1000,
      totalRevenueY1: annualData[0].totalRev,
      totalRevenueY2: annualData[1].totalRev,
      totalRevenueY3: annualData[2].totalRev,
      totalRevenueY4: annualData[3].totalRev,
      totalRevenueY5: annualData[4].totalRev,
      grossMarginPercent: Math.round((annualData.reduce((sum, a) => sum + a.grossMarginPercent, 0) / 5) * 100) / 100,
      ebitdaY1: annualData[0].ebitda,
      ebitdaY2: annualData[1].ebitda,
      ebitdaY3: annualData[2].ebitda,
      ebitdaY4: annualData[3].ebitda,
      ebitdaY5: annualData[4].ebitda,
      breakEvenYearEBITDA,
      breakEvenYearCFO,
      somPercent: Math.round(somPercent * 100) / 100
    };
  }
}

// Utility functions for sensitivity analysis
export function calculateSensitivity(baseScenario: Scenario, parameter: keyof Scenario['drivers'], variation: number): number {
  const modifiedScenario = JSON.parse(JSON.stringify(baseScenario)) as Scenario;
  
  if (typeof modifiedScenario.drivers[parameter] === 'number') {
    (modifiedScenario.drivers[parameter] as number) *= (1 + variation);
  }
  
  const calculator = new FinancialCalculator(modifiedScenario);
  const results = calculator.calculate();
  return results.kpis.totalRevenueY5;
}

export function calculateTornadoChart(baseScenario: Scenario): Array<{parameter: string, impact: number}> {
  const parameters: (keyof Scenario['drivers'])[] = ['leadMult', 'l2d', 'd2p', 'p2d', 'arpaSub', 'mixCapEx'];
  const variation = 0.1; // 10% variation
  
  return parameters.map(param => ({
    parameter: param,
    impact: Math.abs(calculateSensitivity(baseScenario, param, variation) - calculateSensitivity(baseScenario, param, -variation))
  })).sort((a, b) => b.impact - a.impact);
}
