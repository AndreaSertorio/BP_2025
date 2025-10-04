'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, BarChart3, Activity, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { GrowthMetrics } from '@/lib/growthMetrics';

interface GrowthMetricsViewProps {
  growthMetrics: GrowthMetrics;
}

export function GrowthMetricsView({ growthMetrics }: GrowthMetricsViewProps) {
  // Prepare data for CAGR comparison chart
  const cagrData = [
    { metric: 'Revenue', cagr: growthMetrics.revenueCagr, color: '#10b981' },
    { metric: 'ARR', cagr: growthMetrics.arrCagr, color: '#3b82f6' },
    { metric: 'EBITDA', cagr: growthMetrics.ebitdaCagr, color: '#f59e0b' }
  ];

  // Prepare MRR growth data (quarterly averages for better visualization)
  const mrrGrowthByQuarter = [];
  for (let i = 0; i < growthMetrics.mrrGrowthRates.length; i += 3) {
    const quarter = Math.floor(i / 3) + 1;
    const quarterlyRates = growthMetrics.mrrGrowthRates.slice(i, i + 3);
    const avgGrowth = quarterlyRates.reduce((sum, rate) => sum + rate, 0) / quarterlyRates.length;
    mrrGrowthByQuarter.push({
      quarter: `Q${quarter}`,
      growth: Number(avgGrowth.toFixed(2))
    });
  }

  // Prepare YoY growth data
  const yoyGrowthData = growthMetrics.yoyGrowthRates.map((growth, index) => ({
    year: `Y${index + 2}`, // Starting from Year 2
    growth: Number(growth.toFixed(1))
  }));

  // Prepare gross margin trend
  const grossMarginData = growthMetrics.grossMarginTrend.map((margin, index) => ({
    year: `Y${index + 1}`,
    margin: Number(margin.toFixed(1))
  }));

  // Rule of 40 assessment
  const getRuleOf40Status = (value: number) => {
    if (value >= 40) return { status: 'Excellent', color: 'text-green-600', description: 'World-class SaaS performance' };
    if (value >= 25) return { status: 'Good', color: 'text-blue-600', description: 'Strong growth-profitability balance' };
    if (value >= 15) return { status: 'Improving', color: 'text-yellow-600', description: 'On track for SaaS best practices' };
    return { status: 'Needs Work', color: 'text-red-600', description: 'Focus on growth or profitability' };
  };

  const ruleOf40Status = getRuleOf40Status(growthMetrics.ruleOf40);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cagr" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cagr">CAGR Analysis</TabsTrigger>
          <TabsTrigger value="growth">Growth Rates</TabsTrigger>
          <TabsTrigger value="rule40">Rule of 40</TabsTrigger>
          <TabsTrigger value="margins">Margins & Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="cagr" className="space-y-4">
          {/* CAGR Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenue CAGR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {growthMetrics.revenueCagr.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">5-year compound growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  ARR CAGR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {growthMetrics.arrCagr.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recurring revenue growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  EBITDA CAGR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${growthMetrics.ebitdaCagr > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {growthMetrics.ebitdaCagr > 0 ? '+' : ''}{growthMetrics.ebitdaCagr.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Profitability trajectory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${growthMetrics.quickRatio >= 2 ? 'text-green-600' : growthMetrics.quickRatio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {growthMetrics.quickRatio.toFixed(1)}x
                </div>
                <p className="text-xs text-muted-foreground mt-1">New vs Churned MRR</p>
              </CardContent>
            </Card>
          </div>

          {/* CAGR Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>CAGR Comparison</CardTitle>
              <CardDescription>5-year compound annual growth rates across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cagrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'CAGR']}
                  />
                  <Bar dataKey="cagr" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* LTM Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LTM Revenue</CardTitle>
                <CardDescription>Last Twelve Months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{growthMetrics.ltmRevenue.toFixed(1)}M</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LTM EBITDA</CardTitle>
                <CardDescription>Last Twelve Months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${growthMetrics.ltmEbitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{growthMetrics.ltmEbitda.toFixed(1)}M
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {/* MRR Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>MRR Growth Rate (Quarterly Average)</CardTitle>
              <CardDescription>Monthly Recurring Revenue growth trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mrrGrowthByQuarter}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'MRR Growth']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="growth" 
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#mrrGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* YoY Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Revenue Growth</CardTitle>
              <CardDescription>Annual revenue growth rate comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={yoyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'YoY Growth']}
                  />
                  <Bar dataKey="growth" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rule40" className="space-y-4">
          {/* Rule of 40 Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Rule of 40 Analysis
              </CardTitle>
              <CardDescription>
                Growth Rate + EBITDA Margin should exceed 40% for healthy SaaS businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {growthMetrics.ruleOf40.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={ruleOf40Status.color}>
                      {ruleOf40Status.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {ruleOf40Status.description}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Progress 
                    value={Math.min(growthMetrics.ruleOf40, 60)} 
                    className="w-32 mb-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    Target: 40%+
                  </div>
                </div>
              </div>

              {/* Rule of 40 Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Growth Component</div>
                    <div className="text-2xl font-bold text-green-600">
                      +{((growthMetrics.ruleOf40 > 0) ? Math.max(0, growthMetrics.ruleOf40 - (growthMetrics.ltmEbitda / growthMetrics.ltmRevenue * 100)) : 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Revenue growth rate</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Profitability Component</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {growthMetrics.ltmRevenue > 0 ? 
                        (growthMetrics.ltmEbitda / growthMetrics.ltmRevenue * 100).toFixed(1) : 
                        '0.0'
                      }%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">EBITDA margin</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Rule of 40 Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>How Eco 3D compares to SaaS standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">World-class SaaS (40%+)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(growthMetrics.ruleOf40 / 40 * 100, 100)} className="w-24" />
                    <span className="text-xs text-muted-foreground w-12">
                      {growthMetrics.ruleOf40 >= 40 ? '✓' : `${(growthMetrics.ruleOf40 / 40 * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Good SaaS (25%+)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(growthMetrics.ruleOf40 / 25 * 100, 100)} className="w-24" />
                    <span className="text-xs text-muted-foreground w-12">
                      {growthMetrics.ruleOf40 >= 25 ? '✓' : `${(growthMetrics.ruleOf40 / 25 * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Acceptable (15%+)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(growthMetrics.ruleOf40 / 15 * 100, 100)} className="w-24" />
                    <span className="text-xs text-muted-foreground w-12">
                      {growthMetrics.ruleOf40 >= 15 ? '✓' : `${(growthMetrics.ruleOf40 / 15 * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          {/* Gross Margin Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Gross Margin Evolution</CardTitle>
              <CardDescription>Gross margin percentage by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={grossMarginData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Gross Margin']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="margin" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Business Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Quality Score</CardTitle>
                <CardDescription>Based on growth sustainability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Growth</span>
                    <Badge variant={growthMetrics.revenueCagr >= 30 ? "default" : "secondary"}>
                      {growthMetrics.revenueCagr >= 30 ? "Strong" : "Moderate"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Margin Stability</span>
                    <Badge variant="default">Improving</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Efficiency</span>
                    <Badge variant={growthMetrics.quickRatio >= 1.5 ? "default" : "secondary"}>
                      {growthMetrics.quickRatio >= 1.5 ? "Efficient" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Growth Sustainability</CardTitle>
                <CardDescription>Indicators of long-term health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ARR Quality</span>
                    <span className="text-sm font-medium text-green-600">High</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Churn Risk</span>
                    <span className="text-sm font-medium text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Path to Profitability</span>
                    <span className="text-sm font-medium text-blue-600">Clear</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
