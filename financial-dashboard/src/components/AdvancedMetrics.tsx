'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Users, Clock, Activity } from 'lucide-react';
import { AdvancedMetrics as AdvancedMetricsType } from '@/lib/advancedMetrics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface AdvancedMetricsViewProps {
  metrics: AdvancedMetricsType;
  monthlyData: any[];
}

export function AdvancedMetricsView({ metrics, monthlyData }: AdvancedMetricsViewProps) {
  const { breakEven, unitEconomics, cashFlow } = metrics;

  // Prepare break-even chart data
  const breakEvenData = [];
  const maxUnits = isFinite(breakEven.breakEvenUnits) ? breakEven.breakEvenUnits * 1.5 : 1000;
  const step = maxUnits / 20;
  
  if (isFinite(maxUnits) && maxUnits > 0) {
    for (let units = 0; units <= maxUnits; units += step) {
      breakEvenData.push({
        units: Math.round(units),
        revenue: (units * breakEven.pricePerUnit) / 1e6,
        totalCosts: (breakEven.fixedCosts + (units * breakEven.variableCostPerUnit) / 1e6),
        fixedCosts: breakEven.fixedCosts,
        variableCosts: (units * breakEven.variableCostPerUnit) / 1e6
      });
    }
  }

  // Prepare cash flow runway chart
  const runwayData = [];
  let currentCash = cashFlow.cashBalance;
  const maxMonths = isFinite(cashFlow.runway) ? Math.min(cashFlow.runway, 24) : 24;
  
  for (let month = 0; month <= maxMonths; month++) {
    runwayData.push({
      month,
      cash: Math.max(currentCash - (month * cashFlow.burnRate), 0)
    });
  }

  // LTV/CAC visualization
  const ltvCacData = [
    { metric: 'LTV', value: unitEconomics.ltv / 1000, color: '#10b981' },
    { metric: 'CAC', value: unitEconomics.cac / 1000, color: '#ef4444' }
  ];

  const isHealthy = unitEconomics.ltvCacRatio >= 3;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="breakeven" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakeven">Break-Even Analysis</TabsTrigger>
          <TabsTrigger value="uniteconomics">Unit Economics</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow & Runway</TabsTrigger>
        </TabsList>

        <TabsContent value="breakeven" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Break-Even Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isFinite(breakEven.breakEvenUnits) ? breakEven.breakEvenUnits.toLocaleString() : '∞'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Units needed to break even</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Break-Even Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{isFinite(breakEven.breakEvenRevenue) ? breakEven.breakEvenRevenue : '∞'}M
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenue needed to break even</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Break-Even Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breakEven.breakEvenMonth ? `Month ${breakEven.breakEvenMonth}` : 'Not reached'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {breakEven.breakEvenMonth ? `Year ${Math.ceil(breakEven.breakEvenMonth / 12)}` : 'Beyond 5 years'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Break-Even Analysis Chart</CardTitle>
              <CardDescription>Revenue vs. Costs at different production volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={breakEvenData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="units" label={{ value: 'Units', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}M`} />
                  <Legend />
                  <ReferenceLine 
                    x={breakEven.breakEvenUnits} 
                    stroke="#6366f1" 
                    strokeDasharray="3 3"
                    label={{ value: "Break-Even", position: "top" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="totalCosts" stroke="#ef4444" fillOpacity={1} fill="url(#colorCosts)" name="Total Costs" />
                  <Line type="monotone" dataKey="fixedCosts" stroke="#6366f1" strokeDasharray="5 5" name="Fixed Costs" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uniteconomics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  CAC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{unitEconomics.cac.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Customer Acquisition Cost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  LTV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{unitEconomics.ltv.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Customer Lifetime Value</p>
              </CardContent>
            </Card>

            <Card className={isHealthy ? 'border-green-500' : 'border-red-500'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {isHealthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                  LTV/CAC Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {unitEconomics.ltvCacRatio}x
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isHealthy ? 'Healthy (>3x)' : 'Needs improvement (<3x)'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Payback Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unitEconomics.paybackPeriod}</div>
                <p className="text-xs text-muted-foreground mt-1">Months to recover CAC</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>LTV vs CAC Comparison</CardTitle>
              <CardDescription>Customer value vs. acquisition cost</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ltvCacData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis label={{ value: 'k€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${(value * 1000).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Status:</span>
                  <span className={`text-sm font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {isHealthy ? 'Sustainable Business Model' : 'Needs Optimization'}
                  </span>
                </div>
                <Progress 
                  value={Math.min((unitEconomics.ltvCacRatio / 3) * 100, 100)} 
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ARPU (Annual)</span>
                  <span className="text-sm font-medium">€{unitEconomics.arpu.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Churn Rate</span>
                  <span className="text-sm font-medium">{(unitEconomics.churnRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Customer Lifetime</span>
                  <span className="text-sm font-medium">{unitEconomics.averageLifetime} months</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Investment Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NPV @ 12%</span>
                  <span className="text-sm font-medium">€{metrics.npv}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IRR</span>
                  <span className="text-sm font-medium">
                    {metrics.irr !== null ? `${metrics.irr}%` : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Burn Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  €{cashFlow.burnRate}M
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly cash burn</p>
              </CardContent>
            </Card>

            <Card className={cashFlow.runway < 12 ? 'border-red-500' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {cashFlow.runway < 12 ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4" />}
                  Runway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${cashFlow.runway < 12 ? 'text-red-600' : ''}`}>
                  {cashFlow.runway === Infinity ? '∞' : `${cashFlow.runway} months`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cashFlow.runway < 12 ? 'Funding needed soon!' : 'Time until cash runs out'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{cashFlow.cashBalance}M</div>
                <p className="text-xs text-muted-foreground mt-1">Current cash position</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Peak Funding Need</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">€{cashFlow.peakFunding}M</div>
                <p className="text-xs text-muted-foreground mt-1">Maximum funding required</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Runway Projection</CardTitle>
              <CardDescription>Projected cash balance over time at current burn rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={runwayData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}M`} />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="cash" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCash)" 
                    name="Cash Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
              {cashFlow.runway < 12 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Critical: Less than 12 months runway remaining</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Consider raising funds or reducing burn rate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
