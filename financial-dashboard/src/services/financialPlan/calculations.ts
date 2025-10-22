/**
 * Financial Plan Calculator - Core Engine
 * 
 * Calcola projections mese×mese per 120 mesi (10 anni)
 * Input: Configuration + Dati integrati (Revenue, Budget, Market)
 * Output: MonthlyCalculation[] + AnnualCalculation[] + Metrics
 */

import type {
  FinancialPlan,
  MonthlyCalculation,
  AnnualCalculation,
  BreakEvenAnalysis,
  KeyMetrics,
  CalculatorInput,
  CalculatorOptions,
  CalculatorResult
} from '../../types/financialPlan.types';

import {
  monthToDate,
  monthToQuarter,
  getPhaseForMonth,
  isAfterRevenueStart,
  getBudgetValueForYear,
  distributeAnnualToMonthly,
  quarterToMonth
} from './dataIntegration';

// ============================================================================
// MAIN CALCULATOR CLASS
// ============================================================================

export class FinancialPlanCalculator {
  private input: CalculatorInput;
  private options: CalculatorOptions;
  private monthlyData: MonthlyCalculation[] = [];
  
  // Working Capital tracking
  private previousWorkingCapital = {
    accountsReceivable: 0,
    inventory: 0,
    accountsPayable: 0,
    netWorkingCapital: 0
  };
  
  // CapEx tracking
  private cumulativeCapex = 0;
  
  constructor(input: CalculatorInput, options: CalculatorOptions) {
    this.input = input;
    this.options = options;
  }
  
  /**
   * Calcola tutte le proiezioni
   */
  calculate(): CalculatorResult {
    try {
      console.log('🧮 Inizio calcoli Financial Plan...\n');
      
      // 1. Calcoli mese×mese
      this.calculateMonthlyProjections();
      
      // 2. Aggregazione annuale
      const annual = this.calculateAnnualProjections();
      
      // 3. Break-even analysis
      const breakEven = this.calculateBreakEven();
      
      // 4. Metriche chiave
      const metrics = this.calculateKeyMetrics();
      
      console.log('\n✅ Calcoli completati!');
      console.log(`   - ${this.monthlyData.length} mesi calcolati`);
      console.log(`   - ${annual.length} anni aggregati`);
      console.log(`   - Break-even economico: ${breakEven.economic.reached ? breakEven.economic.date : 'Non raggiunto'}`);
      console.log(`   - Runway corrente: ${metrics.currentRunway} mesi\n`);
      
      return {
        success: true,
        data: {
          monthly: this.monthlyData,
          annual,
          breakEven,
          metrics
        }
      };
      
    } catch (error) {
      console.error('❌ Errore nei calcoli:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }
  
  // ==========================================================================
  // MONTHLY CALCULATIONS
  // ==========================================================================
  
  private calculateMonthlyProjections(): void {
    const config = this.input.financialPlan.configuration;
    const { startDate, horizonMonths } = this.options;
    
    console.log(`📅 Calcolo ${horizonMonths} mesi da ${startDate}...`);
    
    // Reset cumulative CapEx per evitare accumulo tra chiamate
    this.cumulativeCapex = 0;
    
    let cumulativeCash = 0;
    let cumulativeEquity = 0;
    let cumulativeRetainedEarnings = 0;
    let cumulativePPE = 0;
    let accumulatedDepreciation = 0; // Track accumulated depreciation locally
    let cumulativeDebt = 0;
    
    for (let month = 1; month <= horizonMonths; month++) {
      const date = monthToDate(month, startDate);
      const quarter = monthToQuarter(month, startDate);
      const year = parseInt(date.split('-')[0]);
      const phase = getPhaseForMonth(month, config.businessPhases, startDate);
      
      if (!phase) {
        console.warn(`⚠️ Nessuna fase trovata per mese ${month} (${date})`);
        continue;
      }
      
      // -----------------------------------------------------------------------
      // REVENUE
      // -----------------------------------------------------------------------
      
      const isRevenueActive = phase.revenueEnabled && 
                             isAfterRevenueStart(month, phase.revenueStartDate, startDate);
      
      let hardwareSales = { units: 0, revenue: 0, cogs: 0, grossProfit: 0, grossMarginPercent: 0 };
      let saasRevenue = { activeDevices: 0, monthlyFee: 0, revenue: 0, cogs: 0, grossProfit: 0, grossMarginPercent: 0 };
      
      if (isRevenueActive) {
        // Calcola hardware sales per questo mese
        hardwareSales = this.calculateHardwareSales(month, date, year);
        
        // Calcola SaaS revenue (devices attivi accumulati)
        saasRevenue = this.calculateSaasRevenue(month, date);
      }
      
      const totalRevenue = hardwareSales.revenue + saasRevenue.revenue;
      const totalCOGS = hardwareSales.cogs + saasRevenue.cogs;
      const grossProfit = totalRevenue - totalCOGS;
      const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      
      // -----------------------------------------------------------------------
      // OPEX
      // -----------------------------------------------------------------------
      
      const opex = this.calculateOpex(year, phase);
      
      // -----------------------------------------------------------------------
      // P&L
      // -----------------------------------------------------------------------
      
      const ebitda = grossProfit - opex.total;
      const ebitdaMarginPercent = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
      
      // -----------------------------------------------------------------------
      // CASH FLOW (calculate before P&L for depreciation)
      // -----------------------------------------------------------------------
      
      // Cash from investing (CapEx)
      const capex = this.calculateCapex(month, date);
      const cashFromInvesting = -capex; // negative = cash out
      
      // Depreciation (add to cumulative and calculate monthly depreciation)
      const depreciation = this.calculateDepreciation(capex);
      
      // P&L continued
      const ebit = ebitda - depreciation;
      
      const interestExpense = this.calculateInterestExpense(month, date, cumulativeDebt);
      const ebt = ebit - interestExpense;
      
      const taxes = this.calculateTaxes(ebt);
      const netIncome = ebt - taxes;
      const netMarginPercent = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
      
      // -----------------------------------------------------------------------
      // CASH FLOW (continued)
      // -----------------------------------------------------------------------
      
      // Cash from operations
      const workingCapitalChange = this.calculateWorkingCapitalChange(month, totalRevenue, totalCOGS);
      const cashFromOps = netIncome + depreciation + workingCapitalChange;
      
      // Cash from financing
      const fundingThisMonth = this.getFundingForMonth(month, date, config.fundingRounds);
      const debtRepayment = 0; // TODO: implementare se necessario
      const cashFromFinancing = fundingThisMonth - debtRepayment;
      
      const netCashFlow = cashFromOps + cashFromInvesting + cashFromFinancing;
      cumulativeCash += netCashFlow;
      
      // -----------------------------------------------------------------------
      // BALANCE SHEET
      // -----------------------------------------------------------------------
      
      // Assets
      const receivables = this.calculateReceivables(totalRevenue);
      const inventory = this.calculateInventory(totalCOGS);
      // PPE: Gross PPE = cumulative CapEx, Net PPE = Gross - Accumulated Depreciation
      cumulativePPE += capex; // Gross PPE
      accumulatedDepreciation += depreciation; // Accumulated Depreciation
      const netPPE = cumulativePPE - accumulatedDepreciation;
      const totalAssets = cumulativeCash + receivables + inventory + netPPE;
      
      // Liabilities
      const payables = this.calculatePayables(totalCOGS + opex.total);
      // Debt stays same unless we add/repay
      const totalLiabilities = payables + cumulativeDebt;
      
      // Equity
      cumulativeEquity += fundingThisMonth;
      cumulativeRetainedEarnings += netIncome;
      const totalEquity = cumulativeEquity + cumulativeRetainedEarnings;
      
      // -----------------------------------------------------------------------
      // METRICS
      // -----------------------------------------------------------------------
      
      const burnRate = netCashFlow < 0 ? Math.abs(netCashFlow) : 0;
      const runway = burnRate > 0 ? Math.floor(cumulativeCash / burnRate) : Infinity;
      
      const unitsToBreakEven = this.calculateUnitsToBreakEven(opex.total);
      const revenueToBreakEven = this.calculateRevenueToBreakEven(opex.total);
      
      // -----------------------------------------------------------------------
      // STORE MONTHLY DATA
      // -----------------------------------------------------------------------
      
      this.monthlyData.push({
        month,
        date,
        quarter,
        year,
        phase: phase.id,
        
        hardwareSales,
        saasRevenue,
        totalRevenue,
        totalCOGS,
        grossProfit,
        grossMarginPercent,
        
        opex,
        
        ebitda,
        ebitdaMarginPercent,
        depreciation,
        ebit,
        interestExpense,
        ebt,
        taxes,
        netIncome,
        netMarginPercent,
        
        cashFlow: {
          operations: {
            netIncome,
            depreciation,
            workingCapitalChange,
            total: cashFromOps
          },
          investing: {
            capex: -capex,
            total: cashFromInvesting
          },
          financing: {
            fundingRounds: fundingThisMonth,
            debtRepayment,
            total: cashFromFinancing
          },
          netCashFlow,
          cashBalance: cumulativeCash
        },
        
        balanceSheet: {
          assets: {
            cash: cumulativeCash,
            receivables,
            inventory,
            ppe: cumulativePPE,                    // Gross PPE
            accumulatedDepreciation,               // Accumulated Depreciation
            netPPE: netPPE,                        // Net PPE
            totalAssets
          },
          liabilities: {
            payables,
            debt: cumulativeDebt,
            totalLiabilities
          },
          equity: {
            capital: cumulativeEquity,
            retainedEarnings: cumulativeRetainedEarnings,
            totalEquity
          }
        },
        
        metrics: {
          burnRate,
          runway,
          unitsToBreakEven,
          revenueToBreakEven
        }
      });
      
      // Progress log ogni 12 mesi
      if (month % 12 === 0) {
        console.log(`   ✓ Mese ${month} (${date}): Cash €${(cumulativeCash / 1000).toFixed(0)}K, EBITDA €${(ebitda / 1000).toFixed(0)}K`);
        console.log(`      PPE: Gross €${(cumulativePPE / 1000).toFixed(0)}K, AccDepr €${(accumulatedDepreciation / 1000).toFixed(0)}K, Net €${(netPPE / 1000).toFixed(0)}K`);
        console.log(`      Total Assets: €${(totalAssets / 1000).toFixed(0)}K, Total Liab: €${(totalLiabilities / 1000).toFixed(0)}K, Total Equity: €${(totalEquity / 1000).toFixed(0)}K`);
        const diff = Math.abs(totalAssets - (totalLiabilities + totalEquity));
        console.log(`      CHECK: Assets ${diff < 1000 ? '✓' : '✗'} Balanced (diff: €${diff.toFixed(0)})`);
      }
    }
  }
  
  // ==========================================================================
  // HELPER CALCULATION METHODS
  // ==========================================================================
  
  /**
   * Calcola hardware sales per un mese
   * MODELLO BIFASE:
   * - Fase 1 (Lancio): Solo Italia, dati GTM base
   * - Fase 2+ (Espansione): Italia + International, con moltiplicatore espansione
   * 
   * IMPORTANTE: yearIndex è GLOBALE (dalla prima fase revenue), NON resetta per fase!
   * Questo evita crolli di revenue quando cambia fase.
   */
  private calculateHardwareSales(month: number, date: string, year: number) {
    const gtmSales = this.input.gtmData.calculated.realisticSales;
    const revenueModel = this.input.revenueModel;
    const currentPhase = this.getCurrentPhaseForYear(year);
    
    if (!currentPhase?.revenueEnabled || !currentPhase.revenueStartDate) {
      return { units: 0, revenue: 0, cogs: 0, grossProfit: 0, grossMarginPercent: 0 };
    }
    
    // Trova PRIMO anno revenue (dalla PRIMA fase con revenue)
    const firstRevenuePhase = this.input.financialPlan.configuration.businessPhases
      .find((p: any) => p.revenueEnabled && p.revenueStartDate);
    const firstRevenueYear = firstRevenuePhase 
      ? parseInt(firstRevenuePhase.revenueStartDate.split('-')[0])
      : parseInt(currentPhase.revenueStartDate.split('-')[0]);
    
    // Calcola yearIndex GLOBALE (non resetta per fase!)
    // Es: 2033 → yearIndex = 4 (y5), NON 0 (y1)!
    const yearIndex = year - firstRevenueYear;
    const yearKeys = ['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10'];
    const yearKey = yearKeys[yearIndex];
    let annualUnits = yearKey && yearIndex >= 0 && yearIndex < yearKeys.length 
      ? (gtmSales as any)[yearKey] || 0
      : 0;
    
    // ESPANSIONE INTERNAZIONALE: Applica moltiplicatore per fasi post-lancio
    // Fase 1 = Solo Italia (multiplier = 1.0)
    // Fase 2+ = Italia + International (multiplier configurabile, default 2.5x)
    const expansionMultiplier = currentPhase.expansionMultiplier || 1.0;
    annualUnits = annualUnits * expansionMultiplier;
    
    // Distribuzione mensile (semplificata: uniforme)
    const monthlyUnits = annualUnits / 12;
    
    const unitPrice = revenueModel.hardware.unitPrice;
    const unitCost = revenueModel.hardware.unitCostByType;
    
    const revenue = monthlyUnits * unitPrice;
    const cogs = monthlyUnits * unitCost;
    const grossProfit = revenue - cogs;
    const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    
    return {
      units: monthlyUnits,
      revenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      // Metadata per debug
      _debug: {
        phase: currentPhase.id,
        yearIndex,
        yearKey,
        baseUnits: annualUnits / expansionMultiplier,
        expansionMultiplier
      }
    };
  }
  
  /**
   * Helper: Trova fase corrente per un dato anno
   */
  private getCurrentPhaseForYear(year: number): any {
    const phases = this.input.financialPlan.configuration.businessPhases;
    return phases.find((p: any) => {
      if (!p.startDate || !p.endDate) return false;
      const startYear = parseInt(p.startDate.split('-')[0]);
      const endYear = parseInt(p.endDate.split('-')[0]);
      return year >= startYear && year <= endYear;
    });
  }
  
  /**
   * Calcola SaaS revenue per un mese
   */
  private calculateSaasRevenue(month: number, date: string) {
    // Conta dispositivi attivi (venduti fino ad ora)
    const devicesActive = this.monthlyData
      .filter(m => m.month < month)
      .reduce((sum, m) => sum + m.hardwareSales.units, 0);
    
    const revenueModel = this.input.revenueModel;
    const monthlyFee = revenueModel.saas.pricing.perDevice.monthlyFee;
    const activationRate = revenueModel.saas.activationRate;
    
    const activeSubscriptions = devicesActive * activationRate;
    const revenue = activeSubscriptions * monthlyFee;
    const cogs = activeSubscriptions * 3.5; // Cloud cost per device (from old schema)
    const grossProfit = revenue - cogs;
    const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    
    return {
      activeDevices: activeSubscriptions,
      monthlyFee,
      revenue,
      cogs,
      grossProfit,
      grossMarginPercent
    };
  }
  
  /**
   * Calcola OPEX per un mese
   */
  private calculateOpex(year: number, phase: any) {
    const budgetData = this.input.budgetData;
    
    // Helper per trovare categoria per id (budget.categories è un array nel database)
    const findCategory = (id: string) => {
      const categories = budgetData.categories as any;
      return Array.isArray(categories) 
        ? categories.find((c: any) => c.id === id)
        : categories[id]; // Fallback per vecchio formato
    };
    
    // Leggi valori annuali dal budget
    const personnel = getBudgetValueForYear(findCategory('cat_4'), year) * 1000; // K€ → €
    const rd = getBudgetValueForYear(findCategory('cat_1'), year) * 1000;
    const regulatory = getBudgetValueForYear(findCategory('cat_2'), year) * 1000;
    const clinical = getBudgetValueForYear(findCategory('cat_3'), year) * 1000;
    const operations = getBudgetValueForYear(findCategory('cat_5'), year) * 1000;
    const marketing = getBudgetValueForYear(findCategory('cat_6'), year) * 1000;
    
    // Distribuzione mensile (uniforme)
    const monthly = {
      personnel: personnel / 12,
      rd: rd / 12,
      regulatory: regulatory / 12,
      clinical: clinical / 12,
      marketing: marketing / 12,
      operations: operations / 12,
      total: 0
    };
    
    monthly.total = monthly.personnel + monthly.rd + monthly.regulatory + 
                   monthly.clinical + monthly.marketing + monthly.operations;
    
    return monthly;
  }
  
  /**
   * Calcola depreciation per un mese
   * Ammortamento su 5 anni (60 mesi) di tutto il CapEx cumulativo
   */
  private calculateDepreciation(capex: number): number {
    // Aggiungi CapEx del mese corrente al cumulativo
    this.cumulativeCapex += capex;
    
    // Ammortamento lineare su 5 anni (60 mesi)
    // Depreciation mensile = CapEx cumulativo / 60 mesi
    const depreciation = this.cumulativeCapex / 60;
    
    return depreciation;
  }
  
  /**
   * Calcola interest expense per un mese
   */
  private calculateInterestExpense(month: number, date: string, debt: number): number {
    // TODO: Implementare interessi su debiti
    return 0;
  }
  
  /**
   * Calcola taxes
   */
  private calculateTaxes(ebt: number): number {
    const config = this.input.financialPlan.configuration;
    const taxRate = config.assumptions.tax.rate;
    
    // Tax solo se EBT positivo
    return ebt > 0 ? ebt * taxRate : 0;
  }
  
  /**
   * Calcola working capital change
   * Formula: Δ WC = (AR + Inv - AP)_current - (AR + Inv - AP)_previous
   * Positivo = consuma cassa (più crediti/inventory da finanziare)
   * Negativo = libera cassa (più debiti verso fornitori)
   */
  private calculateWorkingCapitalChange(month: number, revenue: number, cogs: number): number {
    // Calcola componenti Working Capital corrente
    const accountsReceivable = this.calculateReceivables(revenue);
    const inventory = this.calculateInventory(cogs);
    
    // Payables basati su OPEX totale del mese
    const year = this.monthlyData.length > 0 
      ? this.monthlyData[this.monthlyData.length - 1].year 
      : parseInt(this.options.startDate.split('-')[0]);
    const phase = getPhaseForMonth(month, this.input.financialPlan.configuration.businessPhases, this.options.startDate);
    const opex = this.calculateOpex(year, phase);
    const accountsPayable = this.calculatePayables(opex.total);
    
    // Net Working Capital = AR + Inventory - AP
    const netWorkingCapital = accountsReceivable + inventory - accountsPayable;
    
    // Delta WC (change vs previous month)
    const deltaWC = netWorkingCapital - this.previousWorkingCapital.netWorkingCapital;
    
    // Update previous WC for next iteration
    this.previousWorkingCapital = {
      accountsReceivable,
      inventory,
      accountsPayable,
      netWorkingCapital
    };
    
    // Negative sign: positive deltaWC reduces cash (OCF)
    return -deltaWC;
  }
  
  /**
   * Calcola CAPEX per un mese
   * Pre-revenue: da funding rounds use of funds (R&D equipment, production setup)
   * Post-revenue: % del revenue (2.5% per scaling equipment)
   */
  private calculateCapex(month: number, date: string): number {
    const year = parseInt(date.split('-')[0]);
    const monthInYear = parseInt(date.split('-')[1]);
    
    // CapEx Schedule (annuale, poi distribuito mensilmente)
    const capexSchedule: Record<number, number> = {
      2025: 50000,   // €50K - R&D equipment, prototyping tools
      2026: 80000,   // €80K - Clinical equipment, testing devices
      2027: 100000,  // €100K - Regulatory equipment, final prototypes
      2028: 300000,  // €300K - Production line setup, manufacturing equipment
    };
    
    // Pre-revenue years: fixed schedule
    if (year <= 2028 && capexSchedule[year]) {
      // Distribuzione mensile uniforme
      return capexSchedule[year] / 12;
    }
    
    // Post-revenue (2029+): CapEx dinamico = 2.5% revenue (scaling equipment)
    if (year >= 2029) {
      // Prendi revenue del mese corrente
      const currentMonthData = this.monthlyData[month - 1];
      const revenue = currentMonthData ? currentMonthData.totalRevenue : 0;
      
      // 2.5% del revenue per equipment, tooling, upgrades
      // Base annua: 150K-200K, poi cresce con revenue
      const baseCapex = 150000 / 12; // €12.5K/mese base
      const revenueBasedCapex = revenue * 0.025;
      
      return Math.max(baseCapex, revenueBasedCapex);
    }
    
    // Default: no CapEx
    return 0;
  }
  
  /**
   * Ottiene funding per un dato mese
   */
  private getFundingForMonth(month: number, date: string, fundingRounds: any[]): number {
    for (const round of fundingRounds) {
      if (round.month === month) {
        console.log(`   💰 Funding ${round.name}: €${(round.amount / 1000).toFixed(0)}K nel mese ${month}`);
        return round.amount;
      }
    }
    return 0;
  }
  
  /**
   * Calcola receivables (crediti)
   */
  private calculateReceivables(monthlyRevenue: number): number {
    const config = this.input.financialPlan.configuration;
    const daysReceivables = config.assumptions.workingCapital.daysReceivables;
    return (monthlyRevenue * daysReceivables) / 30;
  }
  
  /**
   * Calcola inventory
   */
  private calculateInventory(monthlyCOGS: number): number {
    const config = this.input.financialPlan.configuration;
    const daysInventory = config.assumptions.workingCapital.daysInventory;
    return (monthlyCOGS * daysInventory) / 30;
  }
  
  /**
   * Calcola payables (debiti fornitori)
   */
  private calculatePayables(monthlyCosts: number): number {
    const config = this.input.financialPlan.configuration;
    const daysPayables = config.assumptions.workingCapital.daysPayables;
    return (monthlyCosts * daysPayables) / 30;
  }
  
  /**
   * Calcola unità necessarie per break-even
   */
  private calculateUnitsToBreakEven(monthlyOpex: number): number {
    const revenueModel = this.input.revenueModel;
    const unitPrice = revenueModel.hardware.unitPrice;
    const unitCost = revenueModel.hardware.unitCostByType;
    const contributionMargin = unitPrice - unitCost;
    
    return contributionMargin > 0 ? monthlyOpex / contributionMargin : Infinity;
  }
  
  /**
   * Calcola revenue necessario per break-even
   */
  private calculateRevenueToBreakEven(monthlyOpex: number): number {
    const config = this.input.financialPlan.configuration;
    const grossMargin = config.assumptions.margins.hardwareGrossMargin;
    
    return grossMargin > 0 ? monthlyOpex / grossMargin : Infinity;
  }
  
  // ==========================================================================
  // ANNUAL AGGREGATION
  // ==========================================================================
  
  private calculateAnnualProjections(): AnnualCalculation[] {
    const annual: AnnualCalculation[] = [];
    const years = Math.ceil(this.monthlyData.length / 12);
    
    for (let yearIndex = 0; yearIndex < years; yearIndex++) {
      const yearData = this.monthlyData.slice(yearIndex * 12, (yearIndex + 1) * 12);
      
      if (yearData.length === 0) continue;
      
      const year = yearData[0].year;
      
      const totalRevenue = yearData.reduce((sum, m) => sum + m.totalRevenue, 0);
      const hardwareRevenue = yearData.reduce((sum, m) => sum + m.hardwareSales.revenue, 0);
      const saasRevenue = yearData.reduce((sum, m) => sum + m.saasRevenue.revenue, 0);
      const totalCOGS = yearData.reduce((sum, m) => sum + m.totalCOGS, 0);
      const grossProfit = totalRevenue - totalCOGS;
      const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      
      const totalOPEX = yearData.reduce((sum, m) => sum + m.opex.total, 0);
      const ebitda = grossProfit - totalOPEX;
      const ebitdaMarginPercent = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
      
      const ebit = yearData.reduce((sum, m) => sum + m.ebit, 0);
      const netIncome = yearData.reduce((sum, m) => sum + m.netIncome, 0);
      const netMarginPercent = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
      
      const cashFromOps = yearData.reduce((sum, m) => sum + m.cashFlow.operations.total, 0);
      const cashFromInv = yearData.reduce((sum, m) => sum + m.cashFlow.investing.total, 0);
      const cashFromFin = yearData.reduce((sum, m) => sum + m.cashFlow.financing.total, 0);
      const netCashFlow = cashFromOps + cashFromInv + cashFromFin;
      const endingCash = yearData[yearData.length - 1].cashFlow.cashBalance;
      const cashBalance = endingCash;
      
      const averageBurnRate = yearData.reduce((sum, m) => sum + m.metrics.burnRate, 0) / yearData.length;
      const averageRunway = yearData.reduce((sum, m) => sum + (isFinite(m.metrics.runway) ? m.metrics.runway : 0), 0) / yearData.length;
      const unitsToBreakEven = yearData[yearData.length - 1].metrics.unitsToBreakEven;
      
      // Balance Sheet (end of year snapshot)
      const lastMonth = yearData[yearData.length - 1];
      const balanceSheet = lastMonth.balanceSheet;
      
      annual.push({
        year,
        totalRevenue,
        hardwareRevenue,
        saasRevenue,
        totalCOGS,
        grossProfit,
        grossMarginPercent,
        totalOPEX,
        ebitda,
        ebitdaMarginPercent,
        ebit,
        netIncome,
        netMarginPercent,
        cashBalance,
        cashFlow: {
          operations: cashFromOps,
          investing: cashFromInv,
          financing: cashFromFin,
          netCashFlow,
          endingCash
        },
        balanceSheet: {
          assets: {
            cash: balanceSheet.assets.cash,
            accountsReceivable: balanceSheet.assets.receivables,
            inventory: balanceSheet.assets.inventory,
            grossPPE: balanceSheet.assets.ppe, // Gross PPE from monthly
            accumulatedDepreciation: balanceSheet.assets.accumulatedDepreciation, // From monthly BS
            netPPE: balanceSheet.assets.netPPE, // Net PPE from monthly
            totalAssets: balanceSheet.assets.totalAssets
          },
          liabilities: {
            accountsPayable: balanceSheet.liabilities.payables,
            debt: balanceSheet.liabilities.debt,
            totalLiabilities: balanceSheet.liabilities.totalLiabilities
          },
          equity: {
            shareCapital: balanceSheet.equity.capital,
            retainedEarnings: balanceSheet.equity.retainedEarnings,
            totalEquity: balanceSheet.equity.totalEquity
          }
        },
        metrics: {
          averageBurnRate,
          averageRunway,
          unitsToBreakEven
        }
      });
    }
    
    return annual;
  }
  
  // ==========================================================================
  // BREAK-EVEN ANALYSIS
  // ==========================================================================
  
  private calculateBreakEven(): BreakEvenAnalysis {
    // Economic break-even: primo mese con EBITDA >= 0
    const economicBE = this.monthlyData.find(m => m.ebitda >= 0);
    
    // Cash flow break-even: primo mese con cash from operations >= 0
    const cashBE = this.monthlyData.find(m => m.cashFlow.operations.total >= 0);
    
    return {
      description: "Analisi break-even automatica basata su proiezioni",
      economic: {
        reached: !!economicBE,
        date: economicBE?.date ?? null,
        month: economicBE?.month ?? null,
        revenueNeeded: economicBE?.totalRevenue ?? null,
        unitsNeeded: economicBE ? Math.ceil(economicBE.hardwareSales.units) : null,
        note: "Break-even economico: quando EBITDA >= 0"
      },
      cashFlow: {
        reached: !!cashBE,
        date: cashBE?.date ?? null,
        month: cashBE?.month ?? null,
        note: "Break-even cash flow: quando cash from operations >= 0"
      }
    };
  }
  
  // ==========================================================================
  // KEY METRICS
  // ==========================================================================
  
  private calculateKeyMetrics(): KeyMetrics {
    const lastMonth = this.monthlyData[this.monthlyData.length - 1];
    
    return {
      description: "Metriche chiave calcolate",
      currentRunway: lastMonth.metrics.runway,
      burnRate: {
        current: lastMonth.metrics.burnRate,
        average: this.monthlyData.reduce((sum, m) => sum + m.metrics.burnRate, 0) / this.monthlyData.length,
        trend: this.calculateBurnTrend()
      },
      capitalNeeded: {
        total: this.calculateTotalCapitalNeeded(),
        breakdown: {}
      },
      ltv: null, // TODO
      cac: null, // TODO
      ltvCacRatio: null, // TODO
      cacPayback: null // TODO
    };
  }
  
  private calculateBurnTrend(): 'increasing' | 'stable' | 'decreasing' | 'positive' {
    // Confronta ultimi 3 mesi
    const recent = this.monthlyData.slice(-3);
    if (recent.length < 3) return 'stable';
    
    const burns = recent.map(m => m.metrics.burnRate);
    
    if (burns.every(b => b === 0)) return 'positive';
    if (burns[2] > burns[0] * 1.1) return 'increasing';
    if (burns[2] < burns[0] * 0.9) return 'decreasing';
    return 'stable';
  }
  
  private calculateTotalCapitalNeeded(): number {
    return this.input.financialPlan.configuration.fundingRounds.reduce(
      (sum, round) => sum + round.amount,
      0
    );
  }
}
