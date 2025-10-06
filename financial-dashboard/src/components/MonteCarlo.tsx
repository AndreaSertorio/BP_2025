'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartCard } from './ChartCard';
import { Scenario } from '@/types/financial';
import { FinancialCalculator } from '@/lib/calculations';
import { formatMillions, downloadCSV } from '@/lib/utils';

interface MonteCarloProps {
  baseScenario: Scenario;
}
interface MonteCarloResult {
  iteration: number;
  ebitdaY5: number;
  arrY5: number;
  breakEvenYear: number;
  maxDrawdown: number;
}

interface MonteCarloStats {
  mean: number;
  median: number;
  std: number;
  p5: number;
  p25: number;
  p75: number;
  p95: number;
}

export function MonteCarlo({ baseScenario }: MonteCarloProps) {
  const [iterations, setIterations] = useState([1000]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MonteCarloResult[]>([]);

  // Parametri di volatilità per Monte Carlo (ridotti per essere più realistici)
  const volatilityParams = {
    leadMult: 0.10,      // ±10% volatilità (ridotto da 15%)
    l2d: 0.08,           // ±8% volatilità (ridotto da 10%)
    d2p: 0.08,           // ±8% volatilità (ridotto da 10%)
    p2deal: 0.08,        // ±8% volatilità (ridotto da 10%)
    arpa: 0.12,          // ±12% volatilità (ridotto da 20%)
    churn: 0.10,         // ±10% volatilità (ridotto da 15%)
    grossMargin: 0.03,   // ±3% volatilità (ridotto da 5%)
    capexShare: 0.08,    // ±8% volatilità (ridotto da 10%)
    opex: 0.15           // ±15% volatilità per OPEX
  };

  // Genera numero casuale con distribuzione normale
  const normalRandom = (mean: number, std: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
  };

  // Genera scenario randomizzato
  const generateRandomScenario = (): Scenario => {
    const randomScenario = { ...baseScenario };
    
    // Applica volatilità ai parametri numerici semplici
    const simpleParams = ['leadMult', 'l2d', 'd2p', 'p2deal', 'arpa', 'capexShare'];
    
    simpleParams.forEach(param => {
      const baseValue = baseScenario.drivers[param as keyof typeof baseScenario.drivers] as number;
      const volatility = volatilityParams[param as keyof typeof volatilityParams];
      const randomValue = normalRandom(baseValue, baseValue * volatility);
      
      // Applica limiti ragionevoli
      if (param === 'l2d' || param === 'd2p' || param === 'p2deal') {
        (randomScenario.drivers as any)[param] = Math.max(0.01, Math.min(1, randomValue));
      } else if (param === 'capexShare') {
        (randomScenario.drivers as any)[param] = Math.max(0, Math.min(1, randomValue));
      } else {
        (randomScenario.drivers as any)[param] = Math.max(0, randomValue);
      }
    });

    // Applica volatilità al churn
    const baseChurn = baseScenario.drivers.churnAnnual ?? 0.15;
    const churnVolatility = volatilityParams.churn;
    const randomChurn = normalRandom(baseChurn, baseChurn * churnVolatility);
    randomScenario.drivers.churnAnnual = Math.max(0, Math.min(0.5, randomChurn));

    // Applica volatilità all'OPEX (nuovo)
    const opexVolatility = volatilityParams.opex;
    Object.keys(baseScenario.drivers.opex).forEach(year => {
      const yearKey = parseInt(year) as keyof typeof baseScenario.drivers.opex;
      const baseOpex = baseScenario.drivers.opex[yearKey];
      const randomOpex = normalRandom(baseOpex, baseOpex * opexVolatility);
      randomScenario.drivers.opex[yearKey] = Math.max(baseOpex * 0.5, randomOpex); // Min 50% dell'OPEX base
    });

    return randomScenario;
  };

  // Esegui simulazione Monte Carlo
  const runSimulation = async () => {
    setIsRunning(true);
    setResults([]); // Reset risultati precedenti
    const simulationResults: MonteCarloResult[] = [];
    
    try {
      for (let i = 0; i < iterations[0]; i++) {
        try {
          const randomScenario = generateRandomScenario();
          const calculator = new FinancialCalculator(randomScenario);
          const results = calculator.calculate();

          // Calcola max drawdown usando i dati annuali
          let maxDrawdown = 0;
          let peak = 0;
          
          if (results.annualData && results.annualData.length > 0) {
            results.annualData.forEach((year: any) => {
              const cashFlow = (year.ebitda || 0) - ((year.totalRev || 0) * 0.1);
              if (cashFlow > peak) peak = cashFlow;
              const drawdown = peak !== 0 ? Math.max(0, (peak - cashFlow) / Math.abs(peak)) : 0;
              if (drawdown > maxDrawdown) maxDrawdown = drawdown;
            });
          }

          simulationResults.push({
            iteration: i + 1,
            ebitdaY5: results.annualData[4]?.ebitda || 0,
            arrY5: results.kpis.arrRunRateM24 || 0,
            breakEvenYear: results.kpis.breakEvenYearCFO || 6,
            maxDrawdown: Math.min(maxDrawdown, 1) // Cap al 100%
          });

          // Aggiorna UI ogni 50 iterazioni per performance migliore
          if (i % 50 === 0 && i > 0) {
            setResults([...simulationResults]);
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (iterationError) {
          console.warn(`Errore iterazione ${i + 1}:`, iterationError);
          // Continua con la prossima iterazione
        }
      }

      setResults(simulationResults);
    } catch (error) {
      console.error('Errore simulazione Monte Carlo:', error);
      alert('Errore durante la simulazione. Controlla la console per dettagli.');
    } finally {
      setIsRunning(false);
    }
  };

  // Calcola statistiche
  const calculateStats = (values: number[]): MonteCarloStats => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    return {
      mean: values.reduce((a, b) => a + b, 0) / n,
      median: sorted[Math.floor(n / 2)],
      std: Math.sqrt(values.reduce((sum, x) => sum + Math.pow(x - values.reduce((a, b) => a + b, 0) / n, 2), 0) / n),
      p5: sorted[Math.floor(n * 0.05)],
      p25: sorted[Math.floor(n * 0.25)],
      p75: sorted[Math.floor(n * 0.75)],
      p95: sorted[Math.floor(n * 0.95)]
    };
  };

  const ebitdaStats = useMemo(() => 
    results.length > 0 ? calculateStats(results.map(r => r.ebitdaY5)) : null
  , [results]);

  const arrStats = useMemo(() => 
    results.length > 0 ? calculateStats(results.map(r => r.arrY5)) : null
  , [results]);

  // Dati per istogramma EBITDA
  const ebitdaHistogram = useMemo(() => {
    if (results.length === 0) return [];
    
    const values = results.map(r => r.ebitdaY5).filter(v => !isNaN(v) && isFinite(v));
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 20;
    const binSize = max > min ? (max - min) / bins : 1;
    
    const histogram = Array(bins).fill(null).map((_, i) => ({
      range: `${formatMillions(min + i * binSize)}-${formatMillions(min + (i + 1) * binSize)}`,
      count: 0,
      midpoint: min + (i + 0.5) * binSize
    }));

    values.forEach(value => {
      if (binSize > 0) {
        const binIndex = Math.min(Math.max(0, Math.floor((value - min) / binSize)), bins - 1);
        if (histogram[binIndex]) {
          histogram[binIndex].count++;
        }
      }
    });

    return histogram.filter(bin => bin !== null);
  }, [results]);

  const handleExportResults = () => {
    if (results.length === 0) return;
    
    const csvData = results.map(r => ({
      'Iterazione': r.iteration,
      'EBITDA Y5 (M€)': r.ebitdaY5.toFixed(2),
      'ARR Y5 (M€)': r.arrY5.toFixed(2),
      'Break-even Year': r.breakEvenYear,
      'Max Drawdown (%)': (r.maxDrawdown * 100).toFixed(1)
    }));
    
    downloadCSV(csvData, 'monte-carlo-results.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Simulazione Monte Carlo</h2>
      </div>

      {/* Controlli Simulazione */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📊 Come Interpretare i Risultati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-blue-800 text-sm space-y-2">
              <p><strong>Statistiche Chiave:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>P50 (Mediana):</strong> Scenario più probabile - 50% probabilità di fare meglio/peggio</li>
                <li><strong>P5:</strong> Scenario pessimistico - solo 5% probabilità di fare peggio</li>
                <li><strong>P95:</strong> Scenario ottimistico - solo 5% probabilità di fare meglio</li>
                <li><strong>Media:</strong> Valore atteso considerando tutti gli scenari</li>
              </ul>
              
              <p className="mt-3"><strong>Istogramma EBITDA:</strong> Mostra la distribuzione di probabilità dei risultati. Picchi alti = scenari più probabili.</p>
              
              <p><strong>Risk-Return:</strong> Relazione tra profittabilità (EBITDA) e rischio (Max Drawdown). Punti in alto a sinistra = migliori (alto EBITDA, basso rischio).</p>
              
              <p className="mt-2 font-medium">💡 <strong>Esempio:</strong> Se P5 EBITDA = 1M€ e P95 = 5M€, c'è 90% probabilità che l'EBITDA sia tra 1-5M€.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">🔍 Diagnostica Scenario Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-amber-800 text-sm space-y-2">
              {(() => {
                const calculator = new FinancialCalculator(baseScenario);
                const baseResults = calculator.calculate();
                return (
                  <div>
                    <p><strong>Scenario Deterministico (senza volatilità):</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>EBITDA Y5: {formatMillions(baseResults.kpis.ebitdaY5)}</li>
                      <li>ARR Y5: {formatMillions(baseResults.kpis.arrRunRateM60)}</li>
                      <li>Break-even CFO: Anno {baseResults.kpis.breakEvenYearCFO || 'N/A'}</li>
                      <li>Revenue Y5: {formatMillions(baseResults.kpis.totalRevenueY5)}</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      {baseResults.kpis.ebitdaY5 > 0 
                        ? "✅ Scenario base positivo" 
                        : "⚠️ Scenario base negativo - verificare parametri OPEX"}
                    </p>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parametri Simulazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Numero Iterazioni: {iterations[0].toLocaleString()}
            </label>
            <Slider
              value={iterations}
              onValueChange={setIterations}
              min={100}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={runSimulation} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? `Simulazione in corso... (${results.length}/${iterations[0]})` : 'Avvia Simulazione'}
            </Button>
            
            {results.length > 0 && (
              <Button variant="outline" onClick={handleExportResults}>
                Esporta Risultati
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Volatilità applicata:</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• Lead Multiplier: ±15%</li>
              <li>• Conversioni Funnel: ±10%</li>
              <li>• ARPA: ±20%</li>
              <li>• Churn: ±15%</li>
              <li>• Margini: ±5-10%</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          {/* Statistiche Riassuntive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>EBITDA Anno 5 - Statistiche</CardTitle>
              </CardHeader>
              <CardContent>
                {ebitdaStats && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Media:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.mean)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mediana:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.median)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std Dev:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.std)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>P5:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.p5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P25:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.p25)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P75:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.p75)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P95:</span>
                        <span className="font-medium">{formatMillions(ebitdaStats.p95)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ARR Anno 5 - Statistiche</CardTitle>
              </CardHeader>
              <CardContent>
                {arrStats && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Media:</span>
                        <span className="font-medium">{formatMillions(arrStats.mean)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mediana:</span>
                        <span className="font-medium">{formatMillions(arrStats.median)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std Dev:</span>
                        <span className="font-medium">{formatMillions(arrStats.std)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>P5:</span>
                        <span className="font-medium">{formatMillions(arrStats.p5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P25:</span>
                        <span className="font-medium">{formatMillions(arrStats.p25)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P75:</span>
                        <span className="font-medium">{formatMillions(arrStats.p75)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P95:</span>
                        <span className="font-medium">{formatMillions(arrStats.p95)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Istogramma EBITDA */}
          <ChartCard
            title="Distribuzione EBITDA Anno 5"
            subtitle={`Basato su ${results.length.toLocaleString()} simulazioni`}
            type="bar"
            data={ebitdaHistogram}
            dataKeys={['count']}
            xAxisKey="range"
            colors={['#3b82f6']}
          />

          {/* Scatter Plot Risk-Return */}
          <ChartCard
            title="Risk-Return Analysis"
            subtitle="EBITDA vs Max Drawdown"
            type="line"
            data={results.slice(0, 1000).map(r => ({
              ebitda: r.ebitdaY5,
              drawdown: r.maxDrawdown * 100,
              name: `Sim ${r.iteration}`
            }))}
            dataKeys={['drawdown']}
            xAxisKey="ebitda"
            colors={['#ef4444']}
          />
        </>
      )}
    </div>
  );
}
