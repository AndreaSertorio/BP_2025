/**
 * Metrics Panel - SaaS Metrics & Unit Economics
 * LTV/CAC, MRR/ARR, Customer Metrics, Unit Economics, Break-Even Analysis
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Activity, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine, ReferenceArea, Dot } from 'recharts';
import type { AnnualCalculation } from '@/types/financialPlan.types';
import { useState } from 'react';

interface MetricsPanelProps {
  annualData: AnnualCalculation[];
}

export function MetricsPanel({ annualData }: MetricsPanelProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  
  // ============================================================================
  // BREAK-EVEN ANALYSIS
  // ============================================================================
  
  const calculateBreakEvenData = () => {
    const breakEvenData: any[] = [];
    let breakEvenMonth: number | null = null;
    let breakEvenYear: number | null = null;
    let minOperatingCF = Infinity;
    let minOperatingCFYear: number | null = null;
    
    // CUMULATIVE OPERATING CASH FLOW (senza financing!)
    let cumulativeOperatingCF = 0;
    
    annualData.forEach((yearData, yearIdx) => {
      // Operating CF (escluso financing/investing)
      const operatingCF = typeof yearData.cashFlow?.operations === 'object' 
        ? (yearData.cashFlow.operations as any).total || 0 
        : yearData.cashFlow?.operations || 0;
      
      // Cash totale (include funding rounds)
      const endingCash = yearData.cashFlow?.endingCash || 0;
      const yearCashFlow = yearData.cashFlow?.netCashFlow || 0;
      
      // Aggiungi operating CF al cumulativo (questo è il "vero" cash flow operativo)
      cumulativeOperatingCF += operatingCF;
      
      // Track minimum cumulative operating CF (punto di massimo burn OPERATIVO)
      if (cumulativeOperatingCF < minOperatingCF) {
        minOperatingCF = cumulativeOperatingCF;
        minOperatingCFYear = yearData.year;
      }
      
      // BREAK-EVEN = quando cumulative OPERATING CF diventa >= 0
      // (questo significa che l'azienda ha recuperato tutti i costi operativi)
      if (breakEvenMonth === null && yearIdx > 0) {
        const prevCumulativeOpCF = breakEvenData[yearIdx - 1]?.cumulativeOperatingCF || 0;
        // Break-even quando cumulative operating CF passa da negativo a positivo
        if (cumulativeOperatingCF >= 0 && prevCumulativeOpCF < 0) {
          breakEvenMonth = yearIdx;
          breakEvenYear = yearData.year;
        }
      }
      
      breakEvenData.push({
        year: yearData.year,
        month: yearIdx + 1,
        cumulativeOperatingCF: cumulativeOperatingCF,  // QUESTO è il vero break-even metric
        endingCash: endingCash,                        // Cash disponibile (con funding)
        annualCashFlow: yearCashFlow,
        operatingCF: operatingCF,                      // Operating CF annuale
        isPositive: cumulativeOperatingCF >= 0,        // Break-even raggiunto?
        isBreakEven: yearIdx === breakEvenMonth,
        revenue: yearData.totalRevenue,
        ebitda: yearData.ebitda,
        isMinCash: yearData.year === minOperatingCFYear  // Punto di massimo burn operativo
      });
    });
    
    const finalCash = breakEvenData.length > 0 
      ? breakEvenData[breakEvenData.length - 1].endingCash 
      : 0;
    
    const finalCumulativeOpCF = breakEvenData.length > 0
      ? breakEvenData[breakEvenData.length - 1].cumulativeOperatingCF
      : 0;
    
    return {
      data: breakEvenData,
      breakEvenMonth,
      breakEvenYear,
      finalCash,
      finalCumulativeOpCF,
      minOperatingCF,
      minOperatingCFYear,
      reached: breakEvenMonth !== null
    };
  };
  
  const breakEven = calculateBreakEvenData();
  
  // Calculate MRR/ARR trends
  const calculateMRRARR = () => {
    return annualData.map(year => {
      // Assume SaaS revenue is subscription-based
      const annualSaasRevenue = year.saasRevenue || 0;
      const monthlyRecurringRevenue = annualSaasRevenue / 12;
      
      return {
        year: year.year,
        mrr: monthlyRecurringRevenue,
        arr: annualSaasRevenue,
        totalRevenue: year.totalRevenue
      };
    });
  };
  
  const mrrArrData = calculateMRRARR();
  
  // Latest year metrics
  const latestYear = annualData[annualData.length - 1];
  const latestMRR = mrrArrData[mrrArrData.length - 1]?.mrr || 0;
  const latestARR = mrrArrData[mrrArrData.length - 1]?.arr || 0;
  
  // Calculate LTV/CAC (simplified)
  const calculateLTVCAC = () => {
    // Assumptions
    const averageCustomerLifetime = 5; // years
    const churnRate = 0.10; // 10% annual
    const grossMargin = latestYear?.grossMarginPercent || 70;
    
    // LTV = (ARPA × Gross Margin) / Churn Rate
    // Simplified: assume 100 customers, €10K ARPA
    const assumedCustomers = 100;
    const arpa = latestARR / Math.max(assumedCustomers, 1);
    const ltv = (arpa * (grossMargin / 100)) / churnRate;
    
    // CAC = Marketing & Sales costs / New customers
    // Assume 30% of OPEX is marketing/sales
    const marketingSalesCosts = latestYear?.totalOPEX * 0.30 || 0;
    const newCustomers = assumedCustomers * 0.30; // 30% growth rate
    const cac = marketingSalesCosts / Math.max(newCustomers, 1);
    
    const ltvCacRatio = ltv / cac;
    const paybackMonths = (cac / (arpa * (grossMargin / 100))) || 0;
    
    return {
      ltv,
      cac,
      ltvCacRatio,
      paybackMonths,
      arpa
    };
  };
  
  const ltvCacMetrics = calculateLTVCAC();
  
  // Unit Economics
  const calculateUnitEconomics = () => {
    return annualData.map(year => {
      const revenue = year.totalRevenue;
      const cogs = year.totalCOGS;
      const opex = year.totalOPEX;
      
      // Assume number of customers (simplified)
      const estimatedCustomers = Math.max(1, Math.floor(revenue / 50000)); // €50K per customer
      
      const revenuePerCustomer = revenue / estimatedCustomers;
      const cogsPerCustomer = cogs / estimatedCustomers;
      const grossProfitPerCustomer = revenuePerCustomer - cogsPerCustomer;
      const contributionMargin = ((revenue - cogs - opex) / revenue) * 100;
      
      return {
        year: year.year,
        customers: estimatedCustomers,
        revenuePerCustomer,
        cogsPerCustomer,
        grossProfitPerCustomer,
        contributionMargin
      };
    });
  };
  
  const unitEconomics = calculateUnitEconomics();
  const latestUE = unitEconomics[unitEconomics.length - 1];
  
  // Format currency
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom Tooltip for Break-Even Chart
  const CustomBreakEvenTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-lg mb-2">Anno {data.year}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">📊 Cumulative Operating CF:</span>{' '}
              <span className={data.cumulativeOperatingCF >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {formatCurrency(data.cumulativeOperatingCF)}
              </span>
            </p>
            <p className="text-sm text-gray-500 text-xs ml-4">
              (Totale cash flow dalle operazioni, escluso finanziamenti)
            </p>
            <div className="border-t border-gray-200 my-2"></div>
            <p className="text-sm">
              <span className="font-medium">💰 Cash Disponibile:</span>{' '}
              <span className={data.endingCash >= 0 ? 'text-green-600' : 'text-orange-600'}>
                {formatCurrency(data.endingCash)}
              </span>
            </p>
            <p className="text-sm text-gray-500 text-xs ml-4">
              (Include funding rounds)
            </p>
            <div className="border-t border-gray-200 my-2"></div>
            <p className="text-sm">
              <span className="font-medium">Operating CF annuale:</span>{' '}
              <span className={data.operatingCF >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(data.operatingCF)}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Revenue:</span> {formatCurrency(data.revenue)}
            </p>
            <p className="text-sm">
              <span className="font-medium">EBITDA:</span>{' '}
              <span className={data.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(data.ebitda)}
              </span>
            </p>
            {data.isMinCash && (
              <div className="mt-2 pt-2 border-t border-orange-300">
                <p className="text-orange-600 font-bold text-sm">⚠️ Punto di massimo BURN operativo</p>
              </div>
            )}
            {data.isBreakEven && (
              <div className="mt-2 pt-2 border-t border-green-300">
                <p className="text-green-600 font-bold text-sm">🎯 BREAK-EVEN POINT!</p>
                <p className="text-green-600 text-xs mt-1">
                  L&apos;azienda ha recuperato tutti i costi operativi cumulati
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      
      {/* ========================================================================== */}
      {/* BREAK-EVEN ANALYSIS - GRAFICO PRINCIPALE */}
      {/* ========================================================================== */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-600" />
                Break-Even Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cumulative Operating Cash Flow - Quando l&apos;azienda recupera tutti i costi operativi (escluso financing)
              </p>
            </div>
            {breakEven.reached ? (
              <div className="text-right">
                <p className="text-sm font-medium text-green-800">Break-Even Raggiunto</p>
                <p className="text-3xl font-bold text-green-600">
                  Anno {breakEven.breakEvenYear}
                </p>
                <p className="text-xs text-green-600">
                  {breakEven.breakEvenMonth! + 1} anni dall'inizio
                </p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm font-medium text-orange-800 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Non ancora raggiunto
                </p>
                <p className="text-xl font-bold text-orange-600">
                  Cash: {formatCurrency(breakEven.finalCash)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={breakEven.data}
              onMouseMove={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setHoveredMonth(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <defs>
                <linearGradient id="colorCashPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCashNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomBreakEvenTooltip />} />
              
              {/* Linea dello zero (break-even line) */}
              <ReferenceLine 
                y={0} 
                stroke="#374151" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: 'Break-Even Line', position: 'right', fill: '#374151', fontSize: 12 }}
              />
              
              {/* Evidenzia il punto di massimo BURN (min cash) */}
              {breakEven.minOperatingCFYear && (
                <ReferenceLine 
                  x={breakEven.minOperatingCFYear}
                  stroke="#f97316" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `⚠️ Max Burn: ${breakEven.minOperatingCFYear}`, 
                    position: 'bottom', 
                    fill: '#f97316', 
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              {/* Evidenzia il punto di break-even */}
              {breakEven.reached && breakEven.breakEvenYear && (
                <ReferenceLine 
                  x={breakEven.breakEvenYear}
                  stroke="#10b981" 
                  strokeWidth={3}
                  label={{ 
                    value: `🎯 Break-Even: ${breakEven.breakEvenYear}`, 
                    position: 'top', 
                    fill: '#10b981', 
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              {/* Area cumulative operating CF */}
              <Area 
                type="monotone" 
                dataKey="cumulativeOperatingCF" 
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#colorCashNegative)"
                fillOpacity={1}
                name="Cumulative Operating CF"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isBreakEven) {
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={8} 
                        fill="#10b981" 
                        stroke="#fff" 
                        strokeWidth={3}
                      />
                    );
                  }
                  if (payload.isMinCash) {
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#f97316" 
                        stroke="#fff" 
                        strokeWidth={2}
                      />
                    );
                  }
                  if (hoveredMonth === payload.month - 1) {
                    return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" />;
                  }
                  return null;
                }}
              />
              
              {/* Override per area positiva (verde) - usando ReferenceArea */}
              {breakEven.reached && breakEven.breakEvenYear && (
                <ReferenceArea
                  x1={breakEven.breakEvenYear}
                  x2={breakEven.data[breakEven.data.length - 1].year}
                  fill="#10b981"
                  fillOpacity={0.1}
                  stroke="none"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Statistiche Break-Even */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-700">Break-Even Operativo</p>
              <p className={`text-2xl font-bold mt-1 ${breakEven.reached ? 'text-green-600' : 'text-orange-600'}`}>
                {breakEven.reached ? '✅ Raggiunto' : '⏳ Non ancora'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Cumulative Operating CF {breakEven.reached ? '≥' : '<'} 0
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-700">Anni al Break-Even</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {breakEven.reached ? `${breakEven.breakEvenMonth! + 1} anni` : 'N/A'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-gray-700">Cash Finale</p>
              <p className={`text-xl font-bold mt-1 ${breakEven.finalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(breakEven.finalCash)}
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-gray-700">Operating CF Minimo (Max Burn)</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {formatCurrency(breakEven.minOperatingCF)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Anno {breakEven.minOperatingCFYear}
              </p>
            </div>
          </div>
          
          {/* Insights */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-800 mb-2">💡 Investor Insight</p>
            {breakEven.reached ? (
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• L&apos;azienda raggiunge il massimo burn operativo nell&apos;anno {breakEven.minOperatingCFYear} ({formatCurrency(breakEven.minOperatingCF)})</li>
                <li>• Il break-even operativo si raggiunge nell&apos;anno {breakEven.breakEvenYear}</li>
                <li>• Cumulative Operating CF finale: {formatCurrency(breakEven.finalCumulativeOpCF)}</li>
                <li>• Dopo il break-even, l&apos;azienda ha recuperato tutti i costi operativi sostenuti</li>
                <li>• Cash disponibile finale (include funding): {formatCurrency(breakEven.finalCash)}</li>
              </ul>
            ) : (
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Il break-even operativo non è ancora raggiunto nel periodo pianificato</li>
                <li>• Operating CF cumulativo minimo: {formatCurrency(breakEven.minOperatingCF)} nell&apos;anno {breakEven.minOperatingCFYear}</li>
                <li>• Operating CF cumulativo finale: {formatCurrency(breakEven.finalCumulativeOpCF)}</li>
                <li>• Cash disponibile finale (con funding): {formatCurrency(breakEven.finalCash)}</li>
                <li>• Considera: aumentare revenue, ridurre OPEX, o pianificare ulteriori funding rounds</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* MRR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MRR</p>
                <h3 className="text-2xl font-bold mt-2 text-blue-600">
                  {formatCurrency(latestMRR)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly Recurring Revenue
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* ARR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ARR</p>
                <h3 className="text-2xl font-bold mt-2 text-green-600">
                  {formatCurrency(latestARR)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Annual Recurring Revenue
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* LTV/CAC Ratio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">LTV/CAC Ratio</p>
                <h3 className={`text-2xl font-bold mt-2 ${ltvCacMetrics.ltvCacRatio >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                  {ltvCacMetrics.ltvCacRatio.toFixed(1)}x
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: &gt;3x
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <h3 className="text-2xl font-bold mt-2 text-indigo-600">
                  {latestUE?.customers.toLocaleString() || 0}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated base
                </p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
      </div>
      
      {/* MRR/ARR Growth */}
      <Card>
        <CardHeader>
          <CardTitle>MRR & ARR Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mrrArrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Area type="monotone" dataKey="arr" fill="#10b981" stroke="#10b981" name="ARR" fillOpacity={0.6} />
              <Area type="monotone" dataKey="mrr" fill="#3b82f6" stroke="#3b82f6" name="MRR" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm font-medium text-green-800">Latest ARR</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(latestARR)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">Latest MRR</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(latestMRR)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-md">
              <p className="text-sm font-medium text-purple-800">MRR Growth Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {mrrArrData.length > 1 
                  ? ((mrrArrData[mrrArrData.length - 1].mrr / mrrArrData[mrrArrData.length - 2].mrr - 1) * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* LTV/CAC Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>LTV/CAC Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Metrics Table */}
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Lifetime Value (LTV)</td>
                    <td className="text-right text-green-600 font-bold">{formatCurrency(ltvCacMetrics.ltv)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">Customer Acquisition Cost (CAC)</td>
                    <td className="text-right text-orange-600 font-bold">{formatCurrency(ltvCacMetrics.cac)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">LTV/CAC Ratio</td>
                    <td className={`text-right font-bold ${ltvCacMetrics.ltvCacRatio >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {ltvCacMetrics.ltvCacRatio.toFixed(2)}x
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">CAC Payback Period</td>
                    <td className="text-right text-blue-600 font-bold">
                      {ltvCacMetrics.paybackMonths.toFixed(0)} months
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-medium">ARPA (Annual)</td>
                    <td className="text-right text-purple-600 font-bold">{formatCurrency(ltvCacMetrics.arpa)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  📊 Benchmark Standards
                </p>
                <ul className="text-xs text-blue-600 mt-2 space-y-1">
                  <li>• LTV/CAC Ratio: &gt;3x (Good), &gt;5x (Excellent)</li>
                  <li>• CAC Payback: &lt;12 months (Good), &lt;6 months (Excellent)</li>
                  <li>• Gross Margin: &gt;70% for SaaS</li>
                </ul>
              </div>
            </div>
            
            {/* Visual Comparison */}
            <div>
              <h4 className="font-semibold mb-3">LTV vs CAC Comparison</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{
                  name: 'Metrics',
                  LTV: ltvCacMetrics.ltv,
                  CAC: ltvCacMetrics.cac
                }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="LTV" fill="#10b981" name="Lifetime Value" />
                  <Bar dataKey="CAC" fill="#f59e0b" name="Acquisition Cost" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className={`mt-4 p-3 rounded-md ${ltvCacMetrics.ltvCacRatio >= 3 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <p className={`text-sm font-medium ${ltvCacMetrics.ltvCacRatio >= 3 ? 'text-green-800' : 'text-red-800'}`}>
                  {ltvCacMetrics.ltvCacRatio >= 3 ? '✅ Healthy Economics' : '⚠️ Needs Improvement'}
                </p>
                <p className={`text-xs mt-1 ${ltvCacMetrics.ltvCacRatio >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                  {ltvCacMetrics.ltvCacRatio >= 3 
                    ? 'LTV/CAC ratio above 3x indicates sustainable unit economics'
                    : 'Consider reducing CAC or increasing LTV through pricing/retention'
                  }
                </p>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>
      
      {/* Unit Economics */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Economics Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={unitEconomics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenuePerCustomer" stroke="#3b82f6" name="Revenue/Customer" strokeWidth={2} />
              <Line type="monotone" dataKey="cogsPerCustomer" stroke="#ef4444" name="COGS/Customer" strokeWidth={2} />
              <Line type="monotone" dataKey="grossProfitPerCustomer" stroke="#10b981" name="Gross Profit/Customer" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">Latest Year</th>
                  <th className="text-right py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Revenue per Customer</td>
                  <td className="text-right font-semibold text-blue-600">{formatCurrency(latestUE?.revenuePerCustomer || 0)}</td>
                  <td className="text-right">
                    <span className="text-green-600">↑</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">COGS per Customer</td>
                  <td className="text-right font-semibold text-red-600">{formatCurrency(latestUE?.cogsPerCustomer || 0)}</td>
                  <td className="text-right">
                    <span className="text-green-600">Optimized</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Gross Profit per Customer</td>
                  <td className="text-right font-semibold text-green-600">{formatCurrency(latestUE?.grossProfitPerCustomer || 0)}</td>
                  <td className="text-right">
                    <span className="text-green-600">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Estimated Customer Base</td>
                  <td className="text-right font-semibold text-purple-600">{latestUE?.customers.toLocaleString() || 0}</td>
                  <td className="text-right">
                    <span className="text-blue-600">Growing</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
