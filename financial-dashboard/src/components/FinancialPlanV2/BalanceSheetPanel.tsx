/**
 * Balance Sheet Panel - Assets, Liabilities, Equity
 * Implements "Stato Patrimoniale" from Guida Finanziaria pag. 194-284
 * 
 * Formula: Assets = Liabilities + Equity
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AnnualCalculation, MonthlyCalculation } from '@/types/financialPlan.types';

type ViewMode = 'monthly' | 'quarterly' | 'annual';

interface BalanceSheetPanelProps {
  annualData: AnnualCalculation[];
  monthlyData?: MonthlyCalculation[];
  viewMode?: ViewMode;
}

export function BalanceSheetPanel({ annualData, monthlyData = [], viewMode = 'annual' }: BalanceSheetPanelProps) {
  
  // Prepara dati in base al viewMode
  const getDisplayData = () => {
    if (viewMode === 'annual') {
      return annualData.map(a => ({
        period: a.year.toString(),
        cash: a.balanceSheet.assets.cash,
        ar: a.balanceSheet.assets.accountsReceivable,
        inventory: a.balanceSheet.assets.inventory,
        netPPE: a.balanceSheet.assets.netPPE,
        totalAssets: a.balanceSheet.assets.totalAssets,
        ap: a.balanceSheet.liabilities.accountsPayable,
        debt: a.balanceSheet.liabilities.debt,
        totalLiabilities: a.balanceSheet.liabilities.totalLiabilities,
        shareCapital: a.balanceSheet.equity.shareCapital,
        retainedEarnings: a.balanceSheet.equity.retainedEarnings,
        totalEquity: a.balanceSheet.equity.totalEquity
      }));
    }
    
    if (viewMode === 'monthly') {
      return monthlyData.map(m => ({
        period: m.date,
        cash: m.balanceSheet.assets.cash,
        ar: m.balanceSheet.assets.receivables,
        inventory: m.balanceSheet.assets.inventory,
        netPPE: m.balanceSheet.assets.netPPE,
        totalAssets: m.balanceSheet.assets.totalAssets,
        ap: m.balanceSheet.liabilities.payables,
        debt: m.balanceSheet.liabilities.debt,
        totalLiabilities: m.balanceSheet.liabilities.totalLiabilities,
        shareCapital: m.balanceSheet.equity.capital,
        retainedEarnings: m.balanceSheet.equity.retainedEarnings,
        totalEquity: m.balanceSheet.equity.totalEquity
      }));
    }
    
    // Quarterly - prende ultimo mese del quarter
    const quarterlyMap = new Map<string, Record<string, number | string>>();
    monthlyData.forEach(m => {
      quarterlyMap.set(m.quarter, {
        period: m.quarter,
        cash: m.balanceSheet.assets.cash,
        ar: m.balanceSheet.assets.receivables,
        inventory: m.balanceSheet.assets.inventory,
        netPPE: m.balanceSheet.assets.netPPE,
        totalAssets: m.balanceSheet.assets.totalAssets,
        ap: m.balanceSheet.liabilities.payables,
        debt: m.balanceSheet.liabilities.debt,
        totalLiabilities: m.balanceSheet.liabilities.totalLiabilities,
        shareCapital: m.balanceSheet.equity.capital,
        retainedEarnings: m.balanceSheet.equity.retainedEarnings,
        totalEquity: m.balanceSheet.equity.totalEquity
      });
    });
    return Array.from(quarterlyMap.values());
  };
  
  const displayData = getDisplayData();
  
  // Latest year Balance Sheet
  const currentYear = annualData[annualData.length - 1];
  const currentBS = currentYear?.balanceSheet;
  
  // Check if balance sheet is balanced
  const isBalanced = currentBS 
    ? Math.abs(currentBS.assets.totalAssets - (currentBS.liabilities.totalLiabilities + currentBS.equity.totalEquity)) < 1000
    : false;
  
  // Working Capital (NWC)
  const workingCapital = currentBS
    ? (currentBS.assets.accountsReceivable + currentBS.assets.inventory) - currentBS.liabilities.accountsPayable
    : 0;
  
  // Debt/Equity Ratio
  const debtToEquityRatio = currentBS && currentBS.equity.totalEquity !== 0
    ? currentBS.liabilities.debt / Math.abs(currentBS.equity.totalEquity)
    : 0;
  
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
  
  // Assets composition for pie chart
  const assetsComposition = currentBS ? [
    { name: 'Cash', value: Math.max(0, currentBS.assets.cash), color: '#10b981' },
    { name: 'AR', value: currentBS.assets.accountsReceivable, color: '#3b82f6' },
    { name: 'Inventory', value: currentBS.assets.inventory, color: '#f59e0b' },
    { name: 'PPE (net)', value: currentBS.assets.netPPE, color: '#8b5cf6' }
  ].filter(item => item.value > 0) : [];
  
  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Total Assets */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <h3 className={`text-2xl font-bold mt-2 ${currentBS && currentBS.assets.totalAssets >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {currentBS ? formatCurrency(currentBS.assets.totalAssets) : '-'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentYear?.year || '-'}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Net PPE */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net PPE</p>
                <h3 className="text-2xl font-bold mt-2 text-purple-600">
                  {currentBS ? formatCurrency(currentBS.assets.netPPE) : '-'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed Assets (net)
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Working Capital */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working Capital</p>
                <h3 className={`text-2xl font-bold mt-2 ${workingCapital >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatCurrency(workingCapital)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  (AR + Inv) - AP
                </p>
              </div>
              {workingCapital >= 0 ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Formula Check */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance Check</p>
                <h3 className={`text-2xl font-bold mt-2 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Assets = Liab + Equity
                </p>
              </div>
              {isBalanced ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        
      </div>
      
      {/* Balance Sheet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Statement (Annual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Year</th>
                  <th className="text-right py-3 px-2 font-semibold">Total Assets</th>
                  <th className="text-right py-3 px-2 font-semibold">Cash</th>
                  <th className="text-right py-3 px-2 font-semibold">AR</th>
                  <th className="text-right py-3 px-2 font-semibold">Inventory</th>
                  <th className="text-right py-3 px-2 font-semibold">Net PPE</th>
                  <th className="text-right py-3 px-2 font-semibold">Total Liab</th>
                  <th className="text-right py-3 px-2 font-semibold">Total Equity</th>
                  <th className="text-center py-3 px-2 font-semibold">Balanced</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, idx) => {
                  const totalAssets = row.totalAssets as number;
                  const cash = row.cash as number;
                  const ar = row.ar as number;
                  const inventory = row.inventory as number;
                  const netPPE = row.netPPE as number;
                  const totalLiab = row.totalLiabilities as number;
                  const totalEquity = row.totalEquity as number;
                  
                  const balanced = Math.abs(totalAssets - (totalLiab + totalEquity)) < 1000;
                  
                  return (
                    <tr key={row.period} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-gray-25' : ''}`}>
                      <td className="py-3 px-2 font-medium">{row.period}</td>
                      <td className={`text-right py-3 px-2 font-bold ${totalAssets >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        {formatCurrency(totalAssets)}
                      </td>
                      <td className={`text-right py-3 px-2 ${cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cash)}
                      </td>
                      <td className="text-right py-3 px-2 text-blue-600">
                        {formatCurrency(ar)}
                      </td>
                      <td className="text-right py-3 px-2 text-orange-600">
                        {formatCurrency(inventory)}
                      </td>
                      <td className="text-right py-3 px-2 text-purple-600">
                        {formatCurrency(netPPE)}
                      </td>
                      <td className="text-right py-3 px-2 font-semibold">
                        {formatCurrency(totalLiab)}
                      </td>
                      <td className={`text-right py-3 px-2 font-bold ${totalEquity >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(totalEquity)}
                      </td>
                      <td className="text-center py-3 px-2">
                        {balanced ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 inline" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-800">Assets (Attività)</p>
              <p className="text-xs text-blue-600 mt-1">Cash, AR, Inventory, Fixed Assets</p>
            </div>
            <div className="p-3 bg-red-50 rounded-md">
              <p className="font-medium text-red-800">Liabilities (Passività)</p>
              <p className="text-xs text-red-600 mt-1">AP, Debt, Deferred Revenue</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="font-medium text-green-800">Equity (Patrimonio Netto)</p>
              <p className="text-xs text-green-600 mt-1">Share Capital + Retained Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Assets Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Assets Composition ({currentYear?.year})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsComposition}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                >
                  {assetsComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Asset Details Table */}
            <div>
              <h4 className="font-semibold mb-3">Asset Details</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Cash</td>
                    <td className="text-right font-medium">{currentBS ? formatCurrency(currentBS.assets.cash) : '-'}</td>
                    <td className="text-right text-xs text-muted-foreground">
                      {currentBS && currentBS.assets.totalAssets > 0 
                        ? `${((currentBS.assets.cash / currentBS.assets.totalAssets) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Accounts Receivable</td>
                    <td className="text-right font-medium">{currentBS ? formatCurrency(currentBS.assets.accountsReceivable) : '-'}</td>
                    <td className="text-right text-xs text-muted-foreground">
                      {currentBS && currentBS.assets.totalAssets > 0
                        ? `${((currentBS.assets.accountsReceivable / currentBS.assets.totalAssets) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Inventory</td>
                    <td className="text-right font-medium">{currentBS ? formatCurrency(currentBS.assets.inventory) : '-'}</td>
                    <td className="text-right text-xs text-muted-foreground">
                      {currentBS && currentBS.assets.totalAssets > 0
                        ? `${((currentBS.assets.inventory / currentBS.assets.totalAssets) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">PPE (net)</td>
                    <td className="text-right font-medium">{currentBS ? formatCurrency(currentBS.assets.netPPE) : '-'}</td>
                    <td className="text-right text-xs text-muted-foreground">
                      {currentBS && currentBS.assets.totalAssets > 0
                        ? `${((currentBS.assets.netPPE / currentBS.assets.totalAssets) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-2">Total Assets</td>
                    <td className="text-right">{currentBS ? formatCurrency(currentBS.assets.totalAssets) : '-'}</td>
                    <td className="text-right text-xs">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </CardContent>
      </Card>
      
      {/* Equity Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={annualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Bar dataKey={(d) => d.balanceSheet.equity.shareCapital} fill="#3b82f6" name="Share Capital" />
              <Bar dataKey={(d) => d.balanceSheet.equity.retainedEarnings} fill="#f59e0b" name="Retained Earnings" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              💡 <strong>Equity = Share Capital + Retained Earnings</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Share Capital aumenta con funding rounds. Retained Earnings accumula utili/perdite nel tempo.
            </p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
