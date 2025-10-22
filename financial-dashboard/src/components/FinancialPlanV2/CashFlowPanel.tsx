/**
 * Cash Flow Panel - OCF, ICF, FCF + Burn Rate & Runway
 * Visualizza statement cash flow e metriche liquidità
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnnualCalculation, MonthlyCalculation } from '@/types/financialPlan.types';

type ViewMode = 'monthly' | 'quarterly' | 'annual';

interface CashFlowPanelProps {
  annualData: AnnualCalculation[];
  monthlyData?: MonthlyCalculation[];
  viewMode?: ViewMode;
}

export function CashFlowPanel({ annualData, monthlyData = [], viewMode = 'annual' }: CashFlowPanelProps) {
  
  // Prepara dati in base al viewMode
  const getDisplayData = () => {
    if (viewMode === 'annual') {
      return annualData.map(a => ({
        period: a.year.toString(),
        ocf: a.cashFlow.operations,
        icf: a.cashFlow.investing,
        fcf: a.cashFlow.financing,
        netCashFlow: a.cashFlow.netCashFlow,
        cashBalance: a.cashBalance
      }));
    }
    
    if (viewMode === 'monthly') {
      return monthlyData.map(m => ({
        period: m.date,
        ocf: m.cashFlow.operations.total,
        icf: m.cashFlow.investing.total,
        fcf: m.cashFlow.financing.total,
        netCashFlow: m.cashFlow.netCashFlow,
        cashBalance: m.cashFlow.cashBalance
      }));
    }
    
    // Quarterly
    const quarterlyMap = new Map<string, Record<string, number | string>>();
    monthlyData.forEach(m => {
      const key = m.quarter;
      if (!quarterlyMap.has(key)) {
        quarterlyMap.set(key, {
          period: key,
          ocf: 0,
          icf: 0,
          fcf: 0,
          netCashFlow: 0,
          cashBalance: m.cashFlow.cashBalance
        });
      }
      const q = quarterlyMap.get(key)!;
      q.ocf = (q.ocf as number) + m.cashFlow.operations.total;
      q.icf = (q.icf as number) + m.cashFlow.investing.total;
      q.fcf = (q.fcf as number) + m.cashFlow.financing.total;
      q.netCashFlow = (q.netCashFlow as number) + m.cashFlow.netCashFlow;
      q.cashBalance = m.cashFlow.cashBalance;
    });
    return Array.from(quarterlyMap.values());
  };
  
  const displayData = getDisplayData();
  
  // Metriche correnti (ultimo anno)
  const currentYear = annualData[annualData.length - 1];
  const currentCash = currentYear?.cashBalance || 0;
  const currentOCF = currentYear?.cashFlow?.operations || 0;
  
  // Break-even cash flow (primo anno con OCF > 0)
  const breakEvenCF = annualData.find(y => y.cashFlow.operations > 0);
  
  // Runway medio ultimi 3 anni con burn
  const lastYearsWithBurn = annualData
    .slice(-3)
    .filter(y => y.cashFlow.netCashFlow < 0);
  const avgBurnRate = lastYearsWithBurn.length > 0
    ? lastYearsWithBurn.reduce((sum, y) => sum + Math.abs(y.cashFlow.netCashFlow), 0) / lastYearsWithBurn.length / 12
    : 0;
  const runway = avgBurnRate > 0 && currentCash < 0 ? Math.abs(currentCash) / (avgBurnRate || 1) : Infinity;
  
  // Formattazione valori
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
  
  // Prepara dati per grafici (usa displayData che è già formattato correttamente)
  const chartData = displayData.map(d => ({
    year: d.period,
    ocf: d.ocf as number,
    icf: d.icf as number,
    fcf: d.fcf as number,
    netCashFlow: d.netCashFlow as number,
    cashBalance: d.cashBalance as number
  }));
  
  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Cash Balance */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                <h3 className={`text-2xl font-bold mt-2 ${currentCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentCash)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentYear?.year || '-'}
                </p>
              </div>
              <Wallet className={`h-8 w-8 ${currentCash >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
        
        {/* Operating Cash Flow */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operating CF</p>
                <h3 className={`text-2xl font-bold mt-2 ${currentOCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentOCF)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Annual OCF {currentYear?.year}
                </p>
              </div>
              {currentOCF >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Monthly Burn Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</p>
                <h3 className={`text-2xl font-bold mt-2 ${avgBurnRate > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {avgBurnRate > 0 ? formatCurrency(avgBurnRate) + '/mo' : '€0'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg last 3 years
                </p>
              </div>
              <TrendingDown className={`h-8 w-8 ${avgBurnRate > 0 ? 'text-orange-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>
        
        {/* Runway */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Runway</p>
                <h3 className={`text-2xl font-bold mt-2 ${runway < 6 && runway !== Infinity ? 'text-red-600' : runway === Infinity ? 'text-green-600' : 'text-orange-600'}`}>
                  {runway === Infinity ? '∞' : `${Math.floor(runway)} mo`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {runway < 6 && runway !== Infinity ? '⚠️ Need funding' : 'Cash positive' }
                </p>
              </div>
              {runway < 6 && runway !== Infinity ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : (
                <TrendingUp className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
      </div>
      
      {/* Cash Balance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatNumber(value)}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="cashBalance" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Cash Balance"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {breakEvenCF && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">
                ✅ Cash Flow Break-Even reached in <strong>{breakEvenCF.year}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Operating Cash Flow became positive (OCF = {formatCurrency(breakEvenCF.cashFlow.operations)})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cash Flow Statement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement (Annual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Year</th>
                  <th className="text-right py-3 px-2 font-semibold">Operating CF</th>
                  <th className="text-right py-3 px-2 font-semibold">Investing CF</th>
                  <th className="text-right py-3 px-2 font-semibold">Financing CF</th>
                  <th className="text-right py-3 px-2 font-semibold">Net CF</th>
                  <th className="text-right py-3 px-2 font-semibold">Cash Balance</th>
                  <th className="text-right py-3 px-2 font-semibold">Burn Rate</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, idx) => {
                  const ocf = row.ocf as number;
                  const icf = row.icf as number;
                  const fcf = row.fcf as number;
                  const netCF = row.netCashFlow as number;
                  const balance = row.cashBalance as number;
                  
                  const isPositiveOCF = ocf >= 0;
                  const isPositiveBalance = balance >= 0;
                  const divisor = viewMode === 'monthly' ? 1 : viewMode === 'quarterly' ? 3 : 12;
                  const monthlyBurn = netCF < 0 ? Math.abs(netCF) / divisor : 0;
                  
                  return (
                    <tr key={row.period} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-gray-25' : ''}`}>
                      <td className="py-3 px-2 font-medium">{row.period}</td>
                      <td className={`text-right py-3 px-2 ${isPositiveOCF ? 'text-green-600 font-semibold' : 'text-red-600'}`}>
                        {formatCurrency(ocf)}
                      </td>
                      <td className="text-right py-3 px-2 text-orange-600">
                        {formatCurrency(icf)}
                      </td>
                      <td className="text-right py-3 px-2 text-blue-600">
                        {formatCurrency(fcf)}
                      </td>
                      <td className={`text-right py-3 px-2 font-semibold ${netCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netCF)}
                      </td>
                      <td className={`text-right py-3 px-2 font-bold ${isPositiveBalance ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="text-right py-3 px-2">
                        {monthlyBurn > 0 ? formatCurrency(monthlyBurn) + '/mo' : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="font-medium text-green-800">Operating CF (OCF)</p>
              <p className="text-xs text-green-600 mt-1">Cash from core business operations</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-md">
              <p className="font-medium text-orange-800">Investing CF (ICF)</p>
              <p className="text-xs text-orange-600 mt-1">CapEx, equipment, production setup</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-800">Financing CF (FCF)</p>
              <p className="text-xs text-blue-600 mt-1">Funding rounds, debt</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cash Flow Components (Stacked Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Components</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatNumber(value)}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" />
              <Bar dataKey="ocf" fill="#10b981" name="Operating CF" />
              <Bar dataKey="icf" fill="#f97316" name="Investing CF" />
              <Bar dataKey="fcf" fill="#3b82f6" name="Financing CF" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Burn Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Burn Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatNumber(value) + '/mo'}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="burnRate" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Monthly Burn"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              💡 <strong>Burn Rate</strong> = Monthly cash consumption when Net CF &lt; 0
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Lower burn rate = longer runway with current cash. Zero burn = cash flow positive!
            </p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
