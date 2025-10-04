'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { AnnualCashFlowStatements } from '@/lib/cashflow';

interface CashFlowViewProps {
  cashFlowStatements: AnnualCashFlowStatements[];
  monthlyCashFlows: Array<{month: number; cashFlow: number; cumulativeCash: number}>;
}

export function CashFlowView({ cashFlowStatements, monthlyCashFlows }: CashFlowViewProps) {
  // Prepare data for annual cash flow chart
  const annualCashFlowData = cashFlowStatements.map(({ year, statement }) => ({
    year: `Y${year}`,
    operating: statement.operatingCashFlow,
    investing: statement.investingCashFlow,
    financing: statement.financingCashFlow,
    net: statement.netCashFlow,
    cash: statement.endingCash
  }));

  // Prepare data for monthly cash flow chart
  const monthlyCashFlowData = monthlyCashFlows.map(({ month, cashFlow, cumulativeCash }) => ({
    month: `M${month}`,
    cashFlow: cashFlow,
    cumulativeCash: cumulativeCash,
    isNegative: cumulativeCash < 0
  }));

  // Key metrics
  const latestStatement = cashFlowStatements[cashFlowStatements.length - 1]?.statement;
  const finalCash = latestStatement?.endingCash || 0;
  const totalFundingRaised = cashFlowStatements.reduce((sum, { statement }) => 
    sum + statement.equityRaised + statement.debtIssued, 0);
  const peakCashNeeded = Math.min(...monthlyCashFlows.map(m => m.cumulativeCash));
  const monthsToPositiveCash = monthlyCashFlows.findIndex(m => m.cumulativeCash > 0) + 1;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Cash Flow Overview</TabsTrigger>
          <TabsTrigger value="statements">Annual Statements</TabsTrigger>
          <TabsTrigger value="runway">Monthly Runway</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Final Cash Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${finalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{finalCash.toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground mt-1">End of Year 5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Funding Raised
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  €{totalFundingRaised.toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground mt-1">Equity + Debt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4" />
                  Peak Funding Need
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  €{Math.abs(peakCashNeeded).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maximum cash deficit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Cash Positive Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthsToPositiveCash > 0 ? `M${monthsToPositiveCash}` : 'Never'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthsToPositiveCash > 0 ? `Year ${Math.ceil(monthsToPositiveCash / 12)}` : 'Beyond 5 years'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Annual Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Cash Flow Breakdown</CardTitle>
              <CardDescription>Operating, Investing, and Financing activities by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={annualCashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [`€${Number(value).toFixed(1)}M`, name]}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="operating" fill="#10b981" name="Operating CF" />
                  <Bar dataKey="investing" fill="#f59e0b" name="Investing CF" />
                  <Bar dataKey="financing" fill="#3b82f6" name="Financing CF" />
                  <Line type="monotone" dataKey="cash" stroke="#ef4444" strokeWidth={3} name="Cash Balance" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          {/* Annual Cash Flow Statements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Cash Flow Statements</CardTitle>
              <CardDescription>Detailed breakdown of cash flows by activity type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">EBITDA</th>
                      <th className="text-right p-2">Working Capital Δ</th>
                      <th className="text-right p-2">Operating CF</th>
                      <th className="text-right p-2">CapEx</th>
                      <th className="text-right p-2">Investing CF</th>
                      <th className="text-right p-2">Equity Raised</th>
                      <th className="text-right p-2">Financing CF</th>
                      <th className="text-right p-2">Net CF</th>
                      <th className="text-right p-2">Ending Cash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowStatements.map(({ year, statement }) => (
                      <tr key={year} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">Y{year}</td>
                        <td className="p-2 text-right">€{statement.ebitda.toFixed(1)}M</td>
                        <td className="p-2 text-right">€{(-statement.workingCapitalChange).toFixed(1)}M</td>
                        <td className={`p-2 text-right ${statement.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{statement.operatingCashFlow.toFixed(1)}M
                        </td>
                        <td className="p-2 text-right text-orange-600">€{(-statement.capex).toFixed(1)}M</td>
                        <td className="p-2 text-right text-orange-600">€{statement.investingCashFlow.toFixed(1)}M</td>
                        <td className="p-2 text-right text-blue-600">€{statement.equityRaised.toFixed(1)}M</td>
                        <td className="p-2 text-right text-blue-600">€{statement.financingCashFlow.toFixed(1)}M</td>
                        <td className={`p-2 text-right font-semibold ${statement.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{statement.netCashFlow.toFixed(1)}M
                        </td>
                        <td className={`p-2 text-right font-bold ${statement.endingCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{statement.endingCash.toFixed(1)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runway" className="space-y-4">
          {/* Monthly Cash Flow and Runway */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cash Runway</CardTitle>
              <CardDescription>Cumulative cash position over 60 months with funding events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyCashFlowData}>
                  <defs>
                    <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    interval={5}
                    tick={{fontSize: 12}}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [`€${Number(value).toFixed(1)}M`, name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeCash" 
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#cashGradient)"
                    name="Cumulative Cash"
                  />
                  {/* Reference line at 0 */}
                  <Line 
                    type="monotone" 
                    dataKey={() => 0} 
                    stroke="#666" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funding Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Events Timeline</CardTitle>
              <CardDescription>Major funding rounds and their impact on cash position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-50">M1</Badge>
                  <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Seed Round</span>
                  <span className="text-muted-foreground">€2.0M</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50">M13</Badge>
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Seed+ Round</span>
                  <span className="text-muted-foreground">€3.0M</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-purple-50">M25</Badge>
                  <ArrowUpCircle className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Series A</span>
                  <span className="text-muted-foreground">€5.0M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
