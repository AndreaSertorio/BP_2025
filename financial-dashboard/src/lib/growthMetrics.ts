import { MonthlyMetrics, AnnualMetrics } from '@/types/financial';

export interface GrowthMetrics {
  revenueCagr: number; // 5-year CAGR
  arrCagr: number;
  ebitdaCagr: number;
  ruleOf40: number; // Growth rate + EBITDA margin
  mrrGrowthRates: number[]; // Monthly MRR growth rates
  qoqGrowthRates: number[]; // Quarter over quarter growth
  yoyGrowthRates: number[]; // Year over year growth
  ltmRevenue: number; // Last twelve months revenue
  ltmEbitda: number; // Last twelve months EBITDA
  grossMarginTrend: number[]; // Gross margin by year
  quickRatio: number; // (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
}

export class GrowthMetricsCalculator {
  private monthlyData: MonthlyMetrics[];
  private annualData: AnnualMetrics[];
  
  constructor(monthlyData: MonthlyMetrics[], annualData: AnnualMetrics[]) {
    this.monthlyData = monthlyData;
    this.annualData = annualData;
  }
  
  calculateAll(): GrowthMetrics {
    return {
      revenueCagr: this.calculateRevenueCagr(),
      arrCagr: this.calculateArrCagr(),
      ebitdaCagr: this.calculateEbitdaCagr(),
      ruleOf40: this.calculateRuleOf40(),
      mrrGrowthRates: this.calculateMrrGrowth(),
      qoqGrowthRates: this.calculateQoqGrowth(),
      yoyGrowthRates: this.calculateYoyGrowth(),
      ltmRevenue: this.calculateLtmRevenue(),
      ltmEbitda: this.calculateLtmEbitda(),
      grossMarginTrend: this.calculateGrossMarginTrend(),
      quickRatio: this.calculateQuickRatio()
    };
  }
  
  private calculateRevenueCagr(): number {
    const startRevenue = this.annualData[0].totalRev;
    const endRevenue = this.annualData[4].totalRev;
    
    if (startRevenue <= 0) return 0;
    
    const cagr = Math.pow(endRevenue / startRevenue, 1/5) - 1;
    return Math.round(cagr * 10000) / 100; // Return as percentage
  }
  
  private calculateArrCagr(): number {
    // ARR at end of year 1 vs year 5
    const startArr = this.annualData[0].arr;
    const endArr = this.annualData[4].arr;
    
    if (startArr <= 0) return 0;
    
    const cagr = Math.pow(endArr / startArr, 1/4) - 1; // 4 years growth
    return Math.round(cagr * 10000) / 100;
  }
  
  private calculateEbitdaCagr(): number {
    // Find first positive EBITDA year for meaningful CAGR
    let startYear = -1;
    let startEbitda = 0;
    
    for (let i = 0; i < this.annualData.length; i++) {
      if (this.annualData[i].ebitda > 0) {
        startYear = i;
        startEbitda = this.annualData[i].ebitda;
        break;
      }
    }
    
    if (startYear === -1 || startYear >= 4) return 0; // No positive EBITDA or too late
    
    const endEbitda = this.annualData[4].ebitda;
    const years = 4 - startYear;
    
    if (endEbitda <= 0 || startEbitda <= 0) return 0;
    
    const cagr = Math.pow(endEbitda / startEbitda, 1/years) - 1;
    return Math.round(cagr * 10000) / 100;
  }
  
  private calculateRuleOf40(): number {
    // Rule of 40 = Revenue Growth Rate + EBITDA Margin
    // Using Year 5 metrics
    const y4Revenue = this.annualData[3].totalRev;
    const y5Revenue = this.annualData[4].totalRev;
    const revenueGrowth = y4Revenue > 0 ? ((y5Revenue - y4Revenue) / y4Revenue) * 100 : 0;
    
    const y5EbitdaMargin = y5Revenue > 0 ? (this.annualData[4].ebitda / y5Revenue) * 100 : 0;
    
    return Math.round((revenueGrowth + y5EbitdaMargin) * 100) / 100;
  }
  
  private calculateMrrGrowth(): number[] {
    const mrrGrowthRates: number[] = [];
    
    for (let i = 1; i < this.monthlyData.length; i++) {
      const currentMrr = this.monthlyData[i].recurringRev;
      const previousMrr = this.monthlyData[i - 1].recurringRev;
      
      const growth = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0;
      mrrGrowthRates.push(Math.round(growth * 100) / 100);
    }
    
    return mrrGrowthRates;
  }
  
  private calculateQoqGrowth(): number[] {
    const qoqGrowth: number[] = [];
    
    for (let q = 1; q <= 20; q++) { // 20 quarters in 5 years
      const currentQuarterMonths = this.monthlyData.slice(q * 3, (q + 1) * 3);
      const previousQuarterMonths = this.monthlyData.slice((q - 1) * 3, q * 3);
      
      const currentRevenue = currentQuarterMonths.reduce((sum, m) => sum + m.totalRev, 0);
      const previousRevenue = previousQuarterMonths.reduce((sum, m) => sum + m.totalRev, 0);
      
      const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      qoqGrowth.push(Math.round(growth * 100) / 100);
    }
    
    return qoqGrowth;
  }
  
  private calculateYoyGrowth(): number[] {
    const yoyGrowth: number[] = [];
    
    for (let year = 1; year < this.annualData.length; year++) {
      const currentRevenue = this.annualData[year].totalRev;
      const previousRevenue = this.annualData[year - 1].totalRev;
      
      const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      yoyGrowth.push(Math.round(growth * 100) / 100);
    }
    
    return yoyGrowth;
  }
  
  private calculateLtmRevenue(): number {
    // Last 12 months revenue (months 49-60)
    const ltmMonths = this.monthlyData.slice(48, 60);
    const ltmRevenue = ltmMonths.reduce((sum, m) => sum + m.totalRev, 0);
    return Math.round(ltmRevenue * 1000) / 1000;
  }
  
  private calculateLtmEbitda(): number {
    // Last 12 months EBITDA
    return this.annualData[4].ebitda;
  }
  
  private calculateGrossMarginTrend(): number[] {
    return this.annualData.map(a => Math.round(a.grossMarginPercent * 100) / 100);
  }
  
  private calculateQuickRatio(): number {
    // Simplified Quick Ratio for SaaS
    // Using last 3 months for calculation
    const lastMonths = this.monthlyData.slice(-3);
    const firstMonths = this.monthlyData.slice(-6, -3);
    
    let newMrr = 0;
    let churnedMrr = 0;
    
    for (let i = 0; i < 3; i++) {
      const currentMrr = lastMonths[i].recurringRev;
      const previousMrr = firstMonths[i].recurringRev;
      
      if (currentMrr > previousMrr) {
        newMrr += currentMrr - previousMrr;
      } else {
        churnedMrr += previousMrr - currentMrr;
      }
    }
    
    const quickRatio = churnedMrr > 0 ? newMrr / churnedMrr : newMrr > 0 ? 999 : 0;
    return Math.round(quickRatio * 100) / 100;
  }
}
