/**
 * Charts Panel - Grafici Interattivi e Nascondibili
 * Massima flessibilità: tutti i grafici sono toggle-able e interattivi
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Eye, EyeOff, Maximize2, Download } from 'lucide-react';
import type { AnnualCalculation, MonthlyCalculation } from '@/types/financialPlan.types';

type ViewMode = 'monthly' | 'quarterly' | 'annual';

interface ChartsPanelProps {
  annualData: AnnualCalculation[];
  monthlyData?: MonthlyCalculation[];
  viewMode?: ViewMode;
}

interface ChartVisibility {
  revenue: boolean;
  profitability: boolean;
  cashFlow: boolean;
  margins: boolean;
  growth: boolean;
  balanceSheet: boolean;
}

export function ChartsPanel({ annualData, monthlyData = [], viewMode = 'annual' }: ChartsPanelProps) {
  
  // State per visibilità grafici
  const [chartVisibility, setChartVisibility] = useState<ChartVisibility>({
    revenue: true,
    profitability: true,
    cashFlow: true,
    margins: true,
    growth: true,
    balanceSheet: true
  });
  
  // Toggle visibility
  const toggleChart = (chart: keyof ChartVisibility) => {
    setChartVisibility(prev => ({ ...prev, [chart]: !prev[chart] }));
  };
  
  // Toggle all
  const showAll = () => {
    setChartVisibility({
      revenue: true,
      profitability: true,
      cashFlow: true,
      margins: true,
      growth: true,
      balanceSheet: true
    });
  };
  
  const hideAll = () => {
    setChartVisibility({
      revenue: false,
      profitability: false,
      cashFlow: false,
      margins: false,
      growth: false,
      balanceSheet: false
    });
  };
  
  // Prepara dati in base al viewMode
  const getDisplayData = () => {
    if (viewMode === 'annual') {
      return annualData.map(a => ({
        period: a.year.toString(),
        revenue: a.totalRevenue,
        hardwareRevenue: a.hardwareRevenue,
        saasRevenue: a.saasRevenue,
        cogs: a.totalCOGS,
        grossProfit: a.grossProfit,
        opex: a.totalOPEX,
        ebitda: a.ebitda,
        netIncome: a.netIncome,
        grossMargin: a.grossMarginPercent,
        ebitdaMargin: a.ebitdaMarginPercent,
        netMargin: a.netMarginPercent,
        ocf: a.cashFlow.operations,
        icf: a.cashFlow.investing,
        fcf: a.cashFlow.financing,
        cashBalance: a.cashBalance,
        totalAssets: a.balanceSheet.assets.totalAssets,
        totalLiabilities: a.balanceSheet.liabilities.totalLiabilities,
        totalEquity: a.balanceSheet.equity.totalEquity
      }));
    }
    
    if (viewMode === 'monthly') {
      return monthlyData.map(m => ({
        period: m.date,
        revenue: m.totalRevenue,
        hardwareRevenue: m.hardwareSales.revenue,
        saasRevenue: m.saasRevenue.revenue,
        cogs: m.totalCOGS,
        grossProfit: m.grossProfit,
        opex: m.opex.total,
        ebitda: m.ebitda,
        netIncome: m.netIncome,
        grossMargin: m.grossMarginPercent,
        ebitdaMargin: m.ebitdaMarginPercent,
        netMargin: m.netMarginPercent,
        ocf: m.cashFlow.operations.total,
        icf: m.cashFlow.investing.total,
        fcf: m.cashFlow.financing.total,
        cashBalance: m.cashFlow.cashBalance,
        totalAssets: m.balanceSheet.assets.totalAssets,
        totalLiabilities: m.balanceSheet.liabilities.totalLiabilities,
        totalEquity: m.balanceSheet.equity.totalEquity
      }));
    }
    
    // Quarterly
    const quarterlyMap = new Map<string, Record<string, number | string>>();
    monthlyData.forEach(m => {
      const key = m.quarter;
      if (!quarterlyMap.has(key)) {
        quarterlyMap.set(key, {
          period: key,
          revenue: 0,
          hardwareRevenue: 0,
          saasRevenue: 0,
          cogs: 0,
          grossProfit: 0,
          opex: 0,
          ebitda: 0,
          netIncome: 0,
          grossMargin: 0,
          ebitdaMargin: 0,
          netMargin: 0,
          ocf: 0,
          icf: 0,
          fcf: 0,
          cashBalance: m.cashFlow.cashBalance,
          totalAssets: m.balanceSheet.assets.totalAssets,
          totalLiabilities: m.balanceSheet.liabilities.totalLiabilities,
          totalEquity: m.balanceSheet.equity.totalEquity,
          count: 0
        });
      }
      const q = quarterlyMap.get(key)!;
      q.revenue = (q.revenue as number) + m.totalRevenue;
      q.hardwareRevenue = (q.hardwareRevenue as number) + m.hardwareSales.revenue;
      q.saasRevenue = (q.saasRevenue as number) + m.saasRevenue.revenue;
      q.cogs = (q.cogs as number) + m.totalCOGS;
      q.grossProfit = (q.grossProfit as number) + m.grossProfit;
      q.opex = (q.opex as number) + m.opex.total;
      q.ebitda = (q.ebitda as number) + m.ebitda;
      q.netIncome = (q.netIncome as number) + m.netIncome;
      q.ocf = (q.ocf as number) + m.cashFlow.operations.total;
      q.icf = (q.icf as number) + m.cashFlow.investing.total;
      q.fcf = (q.fcf as number) + m.cashFlow.financing.total;
      q.cashBalance = m.cashFlow.cashBalance;
      q.totalAssets = m.balanceSheet.assets.totalAssets;
      q.totalLiabilities = m.balanceSheet.liabilities.totalLiabilities;
      q.totalEquity = m.balanceSheet.equity.totalEquity;
      q.count = (q.count as number) + 1;
    });
    
    // Calculate average margins for quarterly
    return Array.from(quarterlyMap.values()).map(q => ({
      ...q,
      grossMargin: ((q.grossProfit as number) / (q.revenue as number)) * 100,
      ebitdaMargin: ((q.ebitda as number) / (q.revenue as number)) * 100,
      netMargin: ((q.netIncome as number) / (q.revenue as number)) * 100
    }));
  };
  
  const displayData = getDisplayData();
  
  // Format functions
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
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : `${entry.value?.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Grafici Interattivi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={showAll}>
                <Eye className="w-4 h-4 mr-2" />
                Mostra Tutti
              </Button>
              <Button size="sm" variant="outline" onClick={hideAll}>
                <EyeOff className="w-4 h-4 mr-2" />
                Nascondi Tutti
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {Object.entries(chartVisibility).map(([key, visible]) => (
              <Button
                key={key}
                size="sm"
                variant={visible ? "default" : "outline"}
                onClick={() => toggleChart(key as keyof ChartVisibility)}
                className="justify-start"
              >
                {visible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 1. REVENUE TRENDS */}
      {chartVisibility.revenue && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trends (HW + SaaS)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="saasRevenue" stackId="1" fill="#10b981" stroke="#10b981" name="SaaS Revenue" fillOpacity={0.6} />
                <Area yAxisId="left" type="monotone" dataKey="hardwareRevenue" stackId="1" fill="#3b82f6" stroke="#3b82f6" name="HW Revenue" fillOpacity={0.6} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} name="Total Revenue" dot={{ r: 4 }} />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* 2. PROFITABILITY */}
      {chartVisibility.profitability && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profitability (EBITDA & Net Income)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="grossProfit" fill="#10b981" name="Gross Profit" />
                <Bar dataKey="ebitda" fill="#f59e0b" name="EBITDA" />
                <Line type="monotone" dataKey="netIncome" stroke="#3b82f6" strokeWidth={3} name="Net Income" dot={{ r: 4 }} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* 3. CASH FLOW WATERFALL */}
      {chartVisibility.cashFlow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cash Flow (OCF + ICF + FCF)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ocf" fill="#10b981" name="Operating CF" />
                <Bar dataKey="icf" fill="#ef4444" name="Investing CF" />
                <Bar dataKey="fcf" fill="#3b82f6" name="Financing CF" />
                <Line type="monotone" dataKey="cashBalance" stroke="#f59e0b" strokeWidth={3} name="Cash Balance" dot={{ r: 4 }} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* 4. MARGINS */}
      {chartVisibility.margins && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Margins (Gross, EBITDA, Net %)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="grossMargin" stroke="#10b981" strokeWidth={3} name="Gross Margin %" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ebitdaMargin" stroke="#f59e0b" strokeWidth={3} name="EBITDA Margin %" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="netMargin" stroke="#3b82f6" strokeWidth={3} name="Net Margin %" dot={{ r: 4 }} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">Gross Margin (Latest)</p>
                <p className="text-2xl font-bold text-green-600">
                  {(displayData[displayData.length - 1]?.grossMargin as number)?.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-800">EBITDA Margin (Latest)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(displayData[displayData.length - 1]?.ebitdaMargin as number)?.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">Net Margin (Latest)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(displayData[displayData.length - 1]?.netMargin as number)?.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 5. GROWTH RATES */}
      {chartVisibility.growth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Growth Rates (YoY %)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={displayData.map((d, i) => {
                if (i === 0) return { ...d, revenueGrowth: 0, ebitdaGrowth: 0 };
                const prev = displayData[i - 1];
                return {
                  ...d,
                  revenueGrowth: ((d.revenue as number) / (prev.revenue as number) - 1) * 100,
                  ebitdaGrowth: prev.ebitda !== 0 ? ((d.ebitda as number) / (prev.ebitda as number) - 1) * 100 : 0
                };
              })}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenueGrowth" fill="#3b82f6" name="Revenue Growth %" />
                <Bar dataKey="ebitdaGrowth" fill="#10b981" name="EBITDA Growth %" />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* 6. BALANCE SHEET */}
      {chartVisibility.balanceSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Balance Sheet (Assets vs Liabilities + Equity)</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="totalLiabilities" stackId="1" fill="#ef4444" stroke="#ef4444" name="Liabilities" fillOpacity={0.6} />
                <Area type="monotone" dataKey="totalEquity" stackId="1" fill="#10b981" stroke="#10b981" name="Equity" fillOpacity={0.6} />
                <Line type="monotone" dataKey="totalAssets" stroke="#3b82f6" strokeWidth={3} name="Total Assets" dot={{ r: 4 }} />
                <Brush dataKey="period" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
}
