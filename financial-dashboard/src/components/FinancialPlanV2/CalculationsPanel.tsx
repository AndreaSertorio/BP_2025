/**
 * Calculations Panel - P&L, Revenue, EBITDA
 * Esegue il calculator e visualizza Income Statement
 */

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingUp,
  Wallet,
  Building2,
  Target,
  Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FinancialPlan } from '@/types/financialPlan.types';
import { FinancialPlanCalculator } from '@/services/financialPlan/calculations';
import { CashFlowPanel } from './CashFlowPanel';
import { BalanceSheetPanel } from './BalanceSheetPanel';
import { InvestorReturnsPanel } from './InvestorReturnsPanel';
import { MetricsPanel } from './MetricsPanel';

interface CalculationsPanelProps {
  financialPlan: FinancialPlan;
  revenueModel: any; // TODO: Type properly
  budgetData: any;
  gtmData: any;
  marketData: any;
}

type ViewMode = 'monthly' | 'quarterly' | 'annual';

export function CalculationsPanel({
  financialPlan,
  revenueModel,
  budgetData,
  gtmData,
  marketData
}: CalculationsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('annual');

  // Run calculator
  const calculationResults = useMemo(() => {
    console.log('🧮 Esecuzione calculator...');
    
    const calculator = new FinancialPlanCalculator(
      {
        financialPlan,
        revenueModel,
        budgetData,
        gtmData,
        marketData
      },
      {
        startDate: financialPlan.configuration.businessPhases[0]?.startDate || '2025-01',
        horizonMonths: 120, // 10 anni
        scenario: 'base' as const
      }
    );
    
    return calculator.calculate();
  }, [financialPlan, revenueModel, budgetData, gtmData, marketData]);

  // Aggregate data by view mode
  const displayData = useMemo(() => {
    if (!calculationResults.success || !calculationResults.data) {
      return [];
    }

    const { monthly, annual } = calculationResults.data;

    if (viewMode === 'annual') {
      return annual.map(a => ({
        period: a.year.toString(),
        revenue: a.totalRevenue,
        hardwareRevenue: a.hardwareRevenue,
        saasRevenue: a.saasRevenue,
        cogs: a.totalCOGS,
        grossProfit: a.grossProfit,
        grossMargin: a.grossMarginPercent,
        opex: a.totalOPEX,
        ebitda: a.ebitda,
        ebitdaMargin: a.ebitdaMarginPercent,
        netIncome: a.netIncome,
        netMargin: a.netMarginPercent,
        cashBalance: a.cashBalance
      }));
    }

    if (viewMode === 'quarterly') {
      // Group by quarter
      const quarterlyMap = new Map<string, any>();
      
      monthly.forEach(m => {
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
            cashBalance: m.cashFlow.cashBalance,
            months: 0
          });
        }
        
        const q = quarterlyMap.get(key)!;
        q.revenue += m.totalRevenue;
        q.hardwareRevenue += m.hardwareSales.revenue;
        q.saasRevenue += m.saasRevenue.revenue;
        q.cogs += m.totalCOGS;
        q.grossProfit += m.grossProfit;
        q.opex += m.opex.total;
        q.ebitda += m.ebitda;
        q.netIncome += m.netIncome;
        q.cashBalance = m.cashFlow.cashBalance; // Last month of quarter
        q.months += 1;
      });

      return Array.from(quarterlyMap.values()).map(q => ({
        ...q,
        grossMargin: q.revenue > 0 ? (q.grossProfit / q.revenue) * 100 : 0,
        ebitdaMargin: q.revenue > 0 ? (q.ebitda / q.revenue) * 100 : 0,
        netMargin: q.revenue > 0 ? (q.netIncome / q.revenue) * 100 : 0
      }));
    }

    // Monthly
    return monthly.slice(0, 60).map(m => ({ // First 5 years for readability
      period: m.date,
      revenue: m.totalRevenue,
      hardwareRevenue: m.hardwareSales.revenue,
      saasRevenue: m.saasRevenue.revenue,
      cogs: m.totalCOGS,
      grossProfit: m.grossProfit,
      grossMargin: m.grossMarginPercent,
      opex: m.opex.total,
      ebitda: m.ebitda,
      ebitdaMargin: m.ebitdaMarginPercent,
      netIncome: m.netIncome,
      netMargin: m.netMarginPercent,
      cashBalance: m.cashFlow.cashBalance
    }));
  }, [calculationResults, viewMode]);

  // Format currency
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (!calculationResults.success || !calculationResults.data) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Calculator className="w-12 h-12 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Errore nei Calcoli</h3>
            <p className="text-sm">{calculationResults.error || 'Dati non disponibili'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = calculationResults.data;

  return (
    <Tabs defaultValue="pl" className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <CardTitle>Proiezioni Finanziarie</CardTitle>
            </div>
            
            {/* Tabs Navigation */}
            <TabsList>
              <TabsTrigger value="pl" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                P&L
              </TabsTrigger>
              <TabsTrigger value="cashflow" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Cash Flow
              </TabsTrigger>
              <TabsTrigger value="balancesheet" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Balance Sheet
              </TabsTrigger>
              <TabsTrigger value="returns" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Investor Returns
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Metrics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('monthly')}
                  className="h-8 text-xs"
                >
                  Mensile
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'quarterly' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('quarterly')}
                  className="h-8 text-xs"
                >
                  Trimestrale
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'annual' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('annual')}
                  className="h-8 text-xs"
                >
                  Annuale
                </Button>
              </div>

              {/* Export */}
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* P&L TAB */}
      <TabsContent value="pl" className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Revenue Totale (10y)</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.annual.reduce((sum, a) => sum + a.totalRevenue, 0))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              HW: {formatCurrency(data.annual.reduce((sum, a) => sum + a.hardwareRevenue, 0))} | 
              SaaS: {formatCurrency(data.annual.reduce((sum, a) => sum + a.saasRevenue, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">EBITDA Cumulato</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.annual.reduce((sum, a) => sum + a.ebitda, 0))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Margin Avg: {formatPercent(
                data.annual.reduce((sum, a) => sum + a.ebitdaMarginPercent, 0) / data.annual.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Cash Balance Finale</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.annual[data.annual.length - 1]?.cashBalance || 0)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Fine periodo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Break-Even Economico</div>
            <div className="text-2xl font-bold text-orange-600">
              {data.breakEven.economic.reached 
                ? data.breakEven.economic.date?.split('-')[0] || 'N/A'
                : 'Non raggiunto'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.breakEven.economic.reached 
                ? `Mese ${data.breakEven.economic.month}`
                : 'Oltre orizzonte'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="hardwareRevenue" fill="#3b82f6" name="Hardware" stackId="a" />
              <Bar dataKey="saasRevenue" fill="#10b981" name="SaaS" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* EBITDA Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">EBITDA Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ebitda" 
                stroke="#10b981" 
                strokeWidth={2}
                name="EBITDA"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Revenue"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* P&L Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Conto Economico (P&L)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 font-semibold sticky left-0 bg-gray-50">Periodo</th>
                  <th className="text-right p-2 font-semibold">Revenue</th>
                  <th className="text-right p-2 font-semibold">COGS</th>
                  <th className="text-right p-2 font-semibold">Gross Profit</th>
                  <th className="text-right p-2 font-semibold">GM%</th>
                  <th className="text-right p-2 font-semibold">OPEX</th>
                  <th className="text-right p-2 font-semibold">EBITDA</th>
                  <th className="text-right p-2 font-semibold">EBITDA%</th>
                  <th className="text-right p-2 font-semibold">Net Income</th>
                  <th className="text-right p-2 font-semibold">NI%</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium sticky left-0 bg-white">{row.period}</td>
                    <td className="p-2 text-right">{formatCurrency(row.revenue)}</td>
                    <td className="p-2 text-right text-red-600">({formatCurrency(row.cogs)})</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(row.grossProfit)}</td>
                    <td className="p-2 text-right text-sm text-gray-600">{formatPercent(row.grossMargin)}</td>
                    <td className="p-2 text-right text-red-600">({formatCurrency(row.opex)})</td>
                    <td className={`p-2 text-right font-bold ${row.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(row.ebitda)}
                    </td>
                    <td className="p-2 text-right text-sm text-gray-600">{formatPercent(row.ebitdaMargin)}</td>
                    <td className={`p-2 text-right font-bold ${row.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(row.netIncome)}
                    </td>
                    <td className="p-2 text-right text-sm text-gray-600">{formatPercent(row.netMargin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </TabsContent>
      
      {/* CASH FLOW TAB */}
      <TabsContent value="cashflow" className="space-y-6">
        <CashFlowPanel 
          annualData={data.annual} 
          monthlyData={data.monthly}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* BALANCE SHEET TAB */}
      <TabsContent value="balancesheet" className="space-y-6">
        <BalanceSheetPanel 
          annualData={data.annual}
          monthlyData={data.monthly}
          viewMode={viewMode}
        />
      </TabsContent>
      
      {/* INVESTOR RETURNS TAB */}
      <TabsContent value="returns" className="space-y-6">
        <InvestorReturnsPanel annualData={data.annual} />
      </TabsContent>
      
      {/* METRICS TAB */}
      <TabsContent value="metrics" className="space-y-6">
        <MetricsPanel annualData={data.annual} />
      </TabsContent>
      
    </Tabs>
  );
}
