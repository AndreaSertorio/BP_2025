/**
 * Investor Returns Panel - ROI, IRR, Exit Scenarios
 * Calcola i ritorni per gli investitori basandosi su funding rounds e exit scenarios
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Percent, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AnnualCalculation } from '@/types/financialPlan.types';

interface InvestorReturnsPanelProps {
  annualData: AnnualCalculation[];
}

interface FundingRound {
  name: string;
  year: number;
  amount: number;
  valuation: number;
  equity: number;
}

interface ExitScenario {
  name: string;
  multiple: number;
  exitValue: number;
  investorReturn: number;
  roi: number;
  moic: number;
  irr: number;
}

export function InvestorReturnsPanel({ annualData }: InvestorReturnsPanelProps) {
  
  // Funding rounds (da database o hardcoded)
  const fundingRounds: FundingRound[] = [
    { name: 'Pre-Seed', year: 2025, amount: 300000, valuation: 1500000, equity: 20 },
    { name: 'Seed+', year: 2026, amount: 500000, valuation: 3000000, equity: 16.7 },
    { name: 'Series A', year: 2028, amount: 2000000, valuation: 12000000, equity: 16.7 },
  ];
  
  const totalInvestment = fundingRounds.reduce((sum, r) => sum + r.amount, 0);
  
  // Exit year (2034) metrics
  const exitYear = annualData[annualData.length - 1];
  const exitYearNumber = exitYear?.year || 2034;
  const annualRevenue = exitYear?.totalRevenue || 0;
  
  // Calculate exit scenarios based on ARR multiple
  const calculateExitScenarios = (): ExitScenario[] => {
    const scenarios = [
      { name: 'Conservative (3x ARR)', multiple: 3 },
      { name: 'Base Case (5x ARR)', multiple: 5 },
      { name: 'Optimistic (10x ARR)', multiple: 10 },
      { name: 'Best Case (15x ARR)', multiple: 15 },
    ];
    
    return scenarios.map(scenario => {
      const exitValue = annualRevenue * scenario.multiple;
      // Assume investors own 50% after all dilution
      const investorEquity = 0.50; 
      const investorReturn = exitValue * investorEquity;
      const roi = ((investorReturn - totalInvestment) / totalInvestment) * 100;
      const moic = investorReturn / totalInvestment; // Multiple on Invested Capital
      
      // Calculate IRR (simplified: assume exit in 2034, first investment in 2025)
      const years = exitYearNumber - 2025;
      const irr = (Math.pow(investorReturn / totalInvestment, 1 / years) - 1) * 100;
      
      return {
        name: scenario.name,
        multiple: scenario.multiple,
        exitValue,
        investorReturn,
        roi,
        moic,
        irr
      };
    });
  };
  
  const exitScenarios = calculateExitScenarios();
  
  // Payback period calculation
  const calculatePaybackPeriod = () => {
    let cumulativeCashFlow = -totalInvestment;
    
    for (let i = 0; i < annualData.length; i++) {
      const year = annualData[i];
      cumulativeCashFlow += year.cashFlow.operations;
      
      if (cumulativeCashFlow >= 0) {
        return {
          reached: true,
          year: year.year,
          months: i * 12,
        };
      }
    }
    
    return {
      reached: false,
      year: null,
      months: null,
    };
  };
  
  const payback = calculatePaybackPeriod();
  
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
  
  // Colors for scenarios
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  
  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Total Investment */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <h3 className="text-2xl font-bold mt-2 text-blue-600">
                  {formatCurrency(totalInvestment)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {fundingRounds.length} rounds
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Base Case ROI */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Base Case ROI</p>
                <h3 className="text-2xl font-bold mt-2 text-green-600">
                  {exitScenarios[1]?.roi.toFixed(0)}%
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  5x ARR multiple
                </p>
              </div>
              <Percent className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* IRR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IRR (Base Case)</p>
                <h3 className="text-2xl font-bold mt-2 text-purple-600">
                  {exitScenarios[1]?.irr.toFixed(1)}%
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Internal Rate of Return
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Payback Period */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
                <h3 className={`text-2xl font-bold mt-2 ${payback.reached ? 'text-green-600' : 'text-blue-600'}`}>
                  {payback.reached ? `${payback.year}` : 'Post-Exit'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {payback.reached ? 'Cumulative CF positive' : 'Via exit event'}
                </p>
              </div>
              <Target className={`h-8 w-8 ${payback.reached ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
          </CardContent>
        </Card>
        
      </div>
      
      {/* Funding Rounds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Round</th>
                  <th className="text-right py-3 px-2 font-semibold">Year</th>
                  <th className="text-right py-3 px-2 font-semibold">Amount</th>
                  <th className="text-right py-3 px-2 font-semibold">Valuation</th>
                  <th className="text-right py-3 px-2 font-semibold">Equity %</th>
                </tr>
              </thead>
              <tbody>
                {fundingRounds.map((round, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{round.name}</td>
                    <td className="text-right py-3 px-2">{round.year}</td>
                    <td className="text-right py-3 px-2 text-blue-600 font-semibold">
                      {formatCurrency(round.amount)}
                    </td>
                    <td className="text-right py-3 px-2">
                      {formatCurrency(round.valuation)}
                    </td>
                    <td className="text-right py-3 px-2 text-purple-600">
                      {round.equity}%
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="py-3 px-2">Total</td>
                  <td className="text-right py-3 px-2">-</td>
                  <td className="text-right py-3 px-2 text-blue-700">
                    {formatCurrency(totalInvestment)}
                  </td>
                  <td className="text-right py-3 px-2">-</td>
                  <td className="text-right py-3 px-2">~50%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Exit Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Exit Scenarios (Year {exitYearNumber})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Scenario</th>
                  <th className="text-right py-3 px-2 font-semibold">Exit Value</th>
                  <th className="text-right py-3 px-2 font-semibold">Investor Return</th>
                  <th className="text-right py-3 px-2 font-semibold">MOIC</th>
                  <th className="text-right py-3 px-2 font-semibold">ROI</th>
                  <th className="text-right py-3 px-2 font-semibold">IRR</th>
                </tr>
              </thead>
              <tbody>
                {exitScenarios.map((scenario, idx) => (
                  <tr key={idx} className={`border-b hover:bg-gray-50 ${idx === 1 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-2 font-medium">
                      {scenario.name}
                      <span className="text-xs text-muted-foreground ml-2">({scenario.multiple}x ARR)</span>
                    </td>
                    <td className="text-right py-3 px-2 text-blue-600 font-semibold">
                      {formatCurrency(scenario.exitValue)}
                    </td>
                    <td className="text-right py-3 px-2 text-green-600 font-semibold">
                      {formatCurrency(scenario.investorReturn)}
                    </td>
                    <td className="text-right py-3 px-2 text-indigo-600 font-bold">
                      {scenario.moic.toFixed(1)}x
                    </td>
                    <td className="text-right py-3 px-2 text-purple-600 font-bold">
                      {scenario.roi.toFixed(0)}%
                    </td>
                    <td className="text-right py-3 px-2 text-orange-600 font-bold">
                      {scenario.irr.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Exit Scenarios Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exitScenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="exitValue" fill="#3b82f6" name="Exit Value" />
              <Bar dataKey="investorReturn" fill="#10b981" name="Investor Return (50% equity)" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              💡 <strong>Base Case (5x ARR): {formatCurrency(exitScenarios[1]?.exitValue)}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Annual Revenue {exitYearNumber}: {formatCurrency(annualRevenue)} × 5 = {formatCurrency(annualRevenue * 5)} exit value
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Investor return (50% equity): {formatCurrency(exitScenarios[1]?.investorReturn)} | MOIC: {exitScenarios[1]?.moic.toFixed(1)}x | ROI: {exitScenarios[1]?.roi.toFixed(0)}% | IRR: {exitScenarios[1]?.irr.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* ROI by Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Comparison by Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exitScenarios}
                  dataKey="roi"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.roi.toFixed(0)}%`}
                >
                  {exitScenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* ROI Details */}
            <div>
              <h4 className="font-semibold mb-3">ROI & IRR Details</h4>
              <table className="w-full text-sm">
                <tbody>
                  {exitScenarios.map((scenario, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 font-medium">{scenario.name}</td>
                      <td className="text-right">
                        <span className="font-bold text-purple-600">{scenario.roi.toFixed(0)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">ROI</span>
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-orange-600">{scenario.irr.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">IRR</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-xs font-medium text-green-800">
                  🎯 Target for VC funds: IRR &gt; 25%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Base case IRR: <strong>{exitScenarios[1]?.irr.toFixed(1)}%</strong> 
                  {exitScenarios[1]?.irr > 25 ? ' ✓ Above target!' : ' Below target'}
                </p>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
