'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Download, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CalculationResults } from '@/types/financial';
import { exportScenarioComparison } from '@/lib/exportUtils';

interface ScenarioComparisonProps {
  scenarios: Array<{
    name: string;
    key: string;
    results: CalculationResults;
    color: string;
  }>;
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  // Prepare data for revenue comparison chart
  const revenueComparisonData = [];
  for (let year = 1; year <= 5; year++) {
    const yearData: any = { year: `Y${year}` };
    scenarios.forEach(scenario => {
      yearData[scenario.name] = scenario.results.annualData[year - 1]?.totalRev || 0;
    });
    revenueComparisonData.push(yearData);
  }

  // Prepare data for EBITDA comparison chart
  const ebitdaComparisonData = [];
  for (let year = 1; year <= 5; year++) {
    const yearData: any = { year: `Y${year}` };
    scenarios.forEach(scenario => {
      yearData[scenario.name] = scenario.results.annualData[year - 1]?.ebitda || 0;
    });
    ebitdaComparisonData.push(yearData);
  }

  // Prepare data for key metrics comparison
  const keyMetricsData = scenarios.map(scenario => ({
    scenario: scenario.name,
    revenueY5: scenario.results.kpis.totalRevenueY5,
    ebitdaY5: scenario.results.kpis.ebitdaY5,  
    arrY5: scenario.results.kpis.arrRunRateM60,
    grossMargin: scenario.results.kpis.grossMarginPercent,
    som: scenario.results.kpis.somPercent,
    breakEven: scenario.results.kpis.breakEvenYearEBITDA || 6,
    cac: scenario.results.advancedMetrics?.unitEconomics.cac || 0,
    ltv: scenario.results.advancedMetrics?.unitEconomics.ltv || 0,
    ltvCacRatio: scenario.results.advancedMetrics?.unitEconomics.ltvCacRatio || 0,
    npv: scenario.results.advancedMetrics?.npv || 0,
    revenueCagr: scenario.results.growthMetrics?.revenueCagr || 0,
    ruleOf40: scenario.results.growthMetrics?.ruleOf40 || 0
  }));

  // Prepare radar chart data (normalized to 0-100 scale)
  const radarData = [
    {
      metric: 'Revenue Growth',
      ...Object.fromEntries(scenarios.map(s => [
        s.name,
        Math.min((s.results.growthMetrics?.revenueCagr || 0) * 2, 100) // Scale CAGR
      ]))
    },
    {
      metric: 'Profitability',
      ...Object.fromEntries(scenarios.map(s => [
        s.name,
        Math.max(0, Math.min((s.results.kpis.ebitdaY5 + 5) * 10, 100)) // Scale EBITDA
      ]))
    },
    {
      metric: 'Market Share',
      ...Object.fromEntries(scenarios.map(s => [
        s.name,
        Math.min(s.results.kpis.somPercent * 20, 100) // Scale SOM
      ]))
    },
    {
      metric: 'Unit Economics',
      ...Object.fromEntries(scenarios.map(s => [
        s.name,
        Math.min((s.results.advancedMetrics?.unitEconomics.ltvCacRatio || 0) * 25, 100) // Scale LTV/CAC
      ]))
    },
    {
      metric: 'Gross Margin',
      ...Object.fromEntries(scenarios.map(s => [
        s.name,
        s.results.kpis.grossMarginPercent
      ]))
    }
  ];

  const handleExportComparison = () => {
    exportScenarioComparison(scenarios.map(s => ({ name: s.name, results: s.results })));
  };

  const getBestScenario = (metric: string) => {
    let best = scenarios[0];
    let bestValue = -Infinity;

    scenarios.forEach(scenario => {
      let value = 0;
      switch (metric) {
        case 'revenue':
          value = scenario.results.kpis.totalRevenueY5;
          break;
        case 'ebitda':
          value = scenario.results.kpis.ebitdaY5;
          break;
        case 'arr':
          value = scenario.results.kpis.arrRunRateM60;
          break;
        case 'breakeven':
          value = scenario.results.kpis.breakEvenYearEBITDA ? -scenario.results.kpis.breakEvenYearEBITDA : -10;
          break;
        case 'ltvCac':
          value = scenario.results.advancedMetrics?.unitEconomics.ltvCacRatio || 0;
          break;
        case 'npv':
          value = scenario.results.advancedMetrics?.npv || -Infinity;
          break;
      }
      
      if (value > bestValue) {
        bestValue = value;
        best = scenario;
      }
    });

    return best.name;
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scenario Comparison</h2>
          <p className="text-muted-foreground">Side-by-side analysis of {scenarios.length} scenarios</p>
        </div>
        <Button onClick={handleExportComparison} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Comparison
        </Button>
      </div>

      {/* Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Best Revenue Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{getBestScenario('revenue')}</span>
              <Badge variant="default">Y5 Leader</Badge>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              €{Math.max(...scenarios.map(s => s.results.kpis.totalRevenueY5)).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Best Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{getBestScenario('ebitda')}</span>
              <Badge variant="default">EBITDA Leader</Badge>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              €{Math.max(...scenarios.map(s => s.results.kpis.ebitdaY5)).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Best Unit Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{getBestScenario('ltvCac')}</span>
              <Badge variant="default">LTV/CAC Leader</Badge>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {Math.max(...scenarios.map(s => s.results.advancedMetrics?.unitEconomics.ltvCacRatio || 0)).toFixed(1)}x
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Evolution Comparison</CardTitle>
          <CardDescription>Annual revenue progression across scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: any) => [`€${Number(value).toFixed(1)}M`, name]}
              />
              <Legend />
              {scenarios.map((scenario, index) => (
                <Line
                  key={scenario.key}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={scenario.color}
                  strokeWidth={3}
                  dot={{ fill: scenario.color, r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* EBITDA Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>EBITDA Evolution Comparison</CardTitle>
          <CardDescription>Profitability trajectory across scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ebitdaComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: any) => [`€${Number(value).toFixed(1)}M`, name]}
              />
              <Legend />
              {scenarios.map((scenario, index) => (
                <Line
                  key={scenario.key}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={scenario.color}
                  strokeWidth={3}
                  dot={{ fill: scenario.color, r: 6 }}
                />
              ))}
              {/* Reference line at 0 */}
              <Line 
                type="monotone" 
                dataKey={() => 0} 
                stroke="#666" 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart for Multi-Dimensional Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Performance</CardTitle>
          <CardDescription>Balanced scorecard across key business dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{fontSize: 12}} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              {scenarios.map((scenario, index) => (
                <Radar
                  key={scenario.key}
                  name={scenario.name}
                  dataKey={scenario.name}
                  stroke={scenario.color}
                  fill={scenario.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics Comparison</CardTitle>
          <CardDescription>Comprehensive side-by-side metrics comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metric</th>
                  {scenarios.map(scenario => (
                    <th key={scenario.key} className="text-right p-2">{scenario.name}</th>
                  ))}
                  <th className="text-right p-2">Best</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">Revenue Y5 (M€)</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className="p-2 text-right">
                      €{scenario.results.kpis.totalRevenueY5.toFixed(1)}M
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <Badge variant="outline">{getBestScenario('revenue')}</Badge>
                  </td>
                </tr>
                
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">EBITDA Y5 (M€)</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className={`p-2 text-right ${scenario.results.kpis.ebitdaY5 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{scenario.results.kpis.ebitdaY5.toFixed(1)}M
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <Badge variant="outline">{getBestScenario('ebitda')}</Badge>
                  </td>
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">ARR Y5 (M€)</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className="p-2 text-right">
                      €{scenario.results.kpis.arrRunRateM60.toFixed(1)}M
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <Badge variant="outline">{getBestScenario('arr')}</Badge>
                  </td>
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">Break-Even Year</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className="p-2 text-right">
                      {scenario.results.kpis.breakEvenYearEBITDA ? `Y${scenario.results.kpis.breakEvenYearEBITDA}` : 'Not reached'}
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <Badge variant="outline">{getBestScenario('breakeven')}</Badge>
                  </td>
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">Gross Margin %</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className="p-2 text-right">
                      {scenario.results.kpis.grossMarginPercent.toFixed(1)}%
                    </td>
                  ))}
                  <td className="p-2 text-right">-</td>
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">SOM %</td>
                  {scenarios.map(scenario => (
                    <td key={scenario.key} className="p-2 text-right">
                      {scenario.results.kpis.somPercent.toFixed(2)}%
                    </td>
                  ))}
                  <td className="p-2 text-right">-</td>
                </tr>

                {scenarios[0].results.advancedMetrics && (
                  <>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">LTV/CAC Ratio</td>
                      {scenarios.map(scenario => (
                        <td key={scenario.key} className="p-2 text-right">
                          {scenario.results.advancedMetrics?.unitEconomics.ltvCacRatio.toFixed(1)}x
                        </td>
                      ))}
                      <td className="p-2 text-right">
                        <Badge variant="outline">{getBestScenario('ltvCac')}</Badge>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">NPV (M€)</td>
                      {scenarios.map(scenario => (
                        <td key={scenario.key} className={`p-2 text-right ${(scenario.results.advancedMetrics?.npv || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{(scenario.results.advancedMetrics?.npv || 0).toFixed(1)}M
                        </td>
                      ))}
                      <td className="p-2 text-right">
                        <Badge variant="outline">{getBestScenario('npv')}</Badge>
                      </td>
                    </tr>
                  </>
                )}

                {scenarios[0].results.growthMetrics && (
                  <>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Revenue CAGR %</td>
                      {scenarios.map(scenario => (
                        <td key={scenario.key} className="p-2 text-right">
                          {(scenario.results.growthMetrics?.revenueCagr || 0).toFixed(1)}%
                        </td>
                      ))}
                      <td className="p-2 text-right">-</td>
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Rule of 40</td>
                      {scenarios.map(scenario => (
                        <td key={scenario.key} className="p-2 text-right">
                          {(scenario.results.growthMetrics?.ruleOf40 || 0).toFixed(1)}%
                        </td>
                      ))}
                      <td className="p-2 text-right">-</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
