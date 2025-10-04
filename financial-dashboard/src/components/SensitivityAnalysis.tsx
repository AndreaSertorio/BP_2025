'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ChartCard } from './ChartCard';
import { Scenario } from '@/types/financial';
import { calculateTornadoChart, FinancialCalculator } from '@/lib/calculations';
import { formatMillions, formatPercent } from '@/lib/utils';

interface SensitivityAnalysisProps {
  baseScenario: Scenario;
}

export function SensitivityAnalysis({ baseScenario }: SensitivityAnalysisProps) {
  const [selectedParameter, setSelectedParameter] = useState<string>('arpaSub');
  const [variationRange, setVariationRange] = useState<number>(20); // ±20%

  // Calculate Tornado Analysis
  const tornadoResults = useMemo(() => {
    return calculateTornadoChart(baseScenario);
  }, [baseScenario]);

  // Calculate Two-Way Analysis (ARPA vs Lead Multiplier)
  const twoWayResults = useMemo(() => {
    const arpaMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const leadMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const results: number[][] = [];

    leadMultipliers.forEach(leadMult => {
      const row: number[] = [];
      arpaMultipliers.forEach(arpaMult => {
        const modifiedScenario = JSON.parse(JSON.stringify(baseScenario)) as Scenario;
        modifiedScenario.drivers.arpaSub *= arpaMult;
        modifiedScenario.drivers.leadMult *= leadMult;
        
        const calculator = new FinancialCalculator(modifiedScenario);
        const result = calculator.calculate();
        row.push(result.kpis.ebitdaY5);
      });
      results.push(row);
    });

    return {
      arpaMultipliers,
      leadMultipliers,
      results
    };
  }, [baseScenario]);

  // Prepare Tornado chart data
  const tornadoChartData = useMemo(() => {
    return tornadoResults.map(item => ({
      parameter: item.parameter,
      impact: item.impact
    })).sort((a, b) => b.impact - a.impact);
  }, [tornadoResults]);

  // Calculate sensitivity for selected parameter
  const sensitivityData = useMemo(() => {
    const variations = [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3];
    const baseCalculator = new FinancialCalculator(baseScenario);
    const baseResult = baseCalculator.calculate();
    const baseEbitda = baseResult.kpis.ebitdaY5;

    return variations.map(variation => {
      if (variation === 0) {
        return {
          variation: `${variation > 0 ? '+' : ''}${formatPercent(variation * 100)}`,
          ebitda: baseEbitda,
          change: 0
        };
      }

      const modifiedScenario = JSON.parse(JSON.stringify(baseScenario)) as Scenario;
      const paramKey = selectedParameter as keyof Scenario['drivers'];
      
      if (typeof modifiedScenario.drivers[paramKey] === 'number') {
        (modifiedScenario.drivers[paramKey] as number) *= (1 + variation);
      }

      const calculator = new FinancialCalculator(modifiedScenario);
      const result = calculator.calculate();
      const newEbitda = result.kpis.ebitdaY5;
      const change = ((newEbitda - baseEbitda) / baseEbitda) * 100;

      return {
        variation: `${variation > 0 ? '+' : ''}${formatPercent(variation * 100)}`,
        ebitda: newEbitda,
        change
      };
    });
  }, [baseScenario, selectedParameter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analisi di Sensitività</h2>
      </div>

      {/* Tornado Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tornado Analysis - Impatto su EBITDA Y5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tornadoChartData.slice(0, 8).map((item) => (
              <div key={item.parameter} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {item.parameter.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ±{formatMillions(item.impact)}
                  </span>
                </div>
                <div className="relative h-6 bg-secondary rounded">
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 h-full bg-primary rounded"
                    style={{
                      width: `${Math.min((item.impact / tornadoChartData[0].impact) * 50, 50)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parameter Sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analisi Parametro Singolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Parametro da analizzare:</label>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="arpa">ARPA</option>
                <option value="leadMult">Lead Multiplier</option>
                <option value="l2d">Lead to Demo %</option>
                <option value="d2p">Demo to Pilot %</option>
                <option value="p2deal">Pilot to Deal %</option>
                <option value="gmRecurring">Margine Lordo Ricorrente</option>
                <option value="churnAnnual">Churn Annuale</option>
                <option value="capexShare">Quota CapEx</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Range di variazione: ±{variationRange}%</label>
              <Slider
                value={[variationRange]}
                onValueChange={(value) => setVariationRange(value[0])}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <ChartCard
          title="Sensitività EBITDA Y5"
          subtitle={`Variazioni del parametro ${selectedParameter}`}
          data={sensitivityData}
          type="line"
          dataKeys={['ebitda']}
          colors={['#3b82f6']}
          xAxisKey="variation"
          yAxisLabel="M€"
          description="Impatto delle variazioni del parametro selezionato sull'EBITDA"
        />
      </div>

      {/* Two-Way Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Way Analysis: ARPA vs Lead Multiplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Lead Mult \ ARPA</th>
                  {twoWayResults.arpaMultipliers.map(mult => (
                    <th key={mult} className="p-2 text-center">
                      {formatPercent((mult - 1) * 100)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {twoWayResults.leadMultipliers.map((leadMult, rowIndex) => (
                  <tr key={leadMult}>
                    <td className="p-2 font-medium">
                      {formatPercent((leadMult - 1) * 100)}
                    </td>
                    {twoWayResults.results[rowIndex].map((ebitda, colIndex) => {
                      const baseEbitda = twoWayResults.results[2][2]; // Center cell (1.0, 1.0)
                      const isPositive = ebitda >= baseEbitda;
                      const intensity = Math.abs((ebitda - baseEbitda) / baseEbitda);
                      
                      return (
                        <td
                          key={colIndex}
                          className={`p-2 text-center text-xs font-medium ${
                            isPositive 
                              ? `bg-green-${Math.min(Math.round(intensity * 500) + 100, 500)} text-green-900`
                              : `bg-red-${Math.min(Math.round(intensity * 500) + 100, 500)} text-red-900`
                          }`}
                          style={{
                            backgroundColor: isPositive 
                              ? `rgba(34, 197, 94, ${Math.min(intensity * 2, 0.8)})`
                              : `rgba(239, 68, 68, ${Math.min(intensity * 2, 0.8)})`
                          }}
                        >
                          {formatMillions(ebitda)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Verde = EBITDA superiore al caso base, Rosso = EBITDA inferiore al caso base
          </p>
        </CardContent>
      </Card>

      {/* Sensitivity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Sensitività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMillions(Math.max(...sensitivityData.map(d => d.ebitda)))}
              </div>
              <div className="text-sm text-muted-foreground">EBITDA Massimo</div>
              <div className="text-xs text-muted-foreground">
                (+{formatPercent(Math.max(...sensitivityData.map(d => d.change)))})
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatMillions(sensitivityData.find(d => d.change === 0)?.ebitda || 0)}
              </div>
              <div className="text-sm text-muted-foreground">EBITDA Base</div>
              <div className="text-xs text-muted-foreground">Scenario corrente</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatMillions(Math.min(...sensitivityData.map(d => d.ebitda)))}
              </div>
              <div className="text-sm text-muted-foreground">EBITDA Minimo</div>
              <div className="text-xs text-muted-foreground">
                ({formatPercent(Math.min(...sensitivityData.map(d => d.change)))})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
