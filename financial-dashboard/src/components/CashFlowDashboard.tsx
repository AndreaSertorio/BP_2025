/**
 * Cash Flow Dashboard - Tab Principale Dedicato
 * 
 * Visualizza il Rendiconto Finanziario completo con:
 * 1. Overview annuale (Operating, Investing, Financing CF)
 * 2. Waterfall Bridge Chart
 * 3. Runway Timeline
 * 4. Working Capital Management
 */

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Area,
  AreaChart,
  LineChart
} from 'recharts';
import { Wallet, TrendingDown, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Scenario } from '@/types/financial';
import { FinancialCalculator } from '@/lib/calculations';
import CashFlowStatementCard from './CashFlowStatementCard';

interface CashFlowDashboardProps {
  scenario?: Scenario;
}

export function CashFlowDashboard({ scenario }: CashFlowDashboardProps) {
  const [selectedBridgeYear, setSelectedBridgeYear] = React.useState(0); // Index: 0=2025, 1=2026, etc.

  // Calcola dati reali da scenario
  const calculationResults = useMemo(() => {
    if (!scenario) return null;
    
    try {
      const calculator = new FinancialCalculator(scenario);
      return calculator.calculate();
    } catch (error) {
      console.error('Error calculating financial data:', error);
      return null;
    }
  }, [scenario]);

  // Prepara dati P&L per i calcoli CF
  const plData = useMemo(() => {
    if (!calculationResults) return [];
    
    // Ammortamenti hardcoded (da database)
    const ammortamenti = [0.5, 20.5, 20.5, 20.5, 10, 10, 10, 10, 10, 10, 10];
    
    // Interessi hardcoded (da database)
    const interessiPerAnno = [10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0];
    
    return calculationResults.annualData.map((annual, i) => {
      const ricaviTot = annual.totalRev / 1000000; // M€
      const ricaviHW = annual.capexRev / 1000000;
      const ricaviSaaS = annual.recurringRev / 1000000;
      const cogsTot = annual.cogs / 1000000;
      const margineLordo = annual.grossMargin / 1000000;
      const margineLordoPerc = ricaviTot > 0 ? (margineLordo / ricaviTot) * 100 : 0;
      const opexTot = annual.totalOpex / 1000000;
      const ebitda = annual.ebitda / 1000000;
      const ebitdaPerc = ricaviTot > 0 ? (ebitda / ricaviTot) * 100 : 0;
      const ammort = ammortamenti[i] || 10;
      const ebit = ebitda - ammort;
      const interessi = interessiPerAnno[i] || 0;
      const ebt = ebit - interessi;
      const tasse = ebt > 0 ? ebt * 0.28 : 0;
      const utileNetto = ebt - tasse;
      const netMarginPerc = ricaviTot > 0 ? (utileNetto / ricaviTot) * 100 : 0;

      return {
        year: 2025 + i,
        ricaviHW,
        ricaviSaaS,
        ricaviTot,
        cogsHW: 0,
        cogsSaaS: 0,
        cogsTot,
        margineLordo,
        margineLordoPerc,
        opexTot,
        ebitda,
        ebitdaPerc,
        ammort,
        ebit,
        interessi,
        ebt,
        tasse,
        utileNetto,
        netMarginPerc,
        unitaVendute: 0, // TODO: collegare a calcoli vendite hardware
        unitaBE: 0
      };
    });
  }, [calculationResults]);

  if (!calculationResults || plData.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>💸 Cash Flow Statement</CardTitle>
            <CardDescription>Caricamento dati...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seleziona uno scenario per visualizzare il rendiconto finanziario.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                💸 Rendiconto Finanziario
              </h1>
              <p className="text-blue-700 mt-1">
                Cash Flow Statement - Analisi Completa dei Flussi di Cassa
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Scenario: {scenario?.name || 'Base'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Operating Cash Flow</span>
            </div>
            <p className="text-xs text-gray-600">
              Flussi di cassa da operazioni correnti (EBITDA, WC, tasse)
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 font-semibold mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Investing Cash Flow</span>
            </div>
            <p className="text-xs text-gray-600">
              Investimenti in CAPEX, IP, attrezzature
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Financing Cash Flow</span>
            </div>
            <p className="text-xs text-gray-600">
              Equity rounds, debt, rimborsi prestiti
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview Annuale</TabsTrigger>
          <TabsTrigger value="bridge">🌉 Waterfall Bridge</TabsTrigger>
          <TabsTrigger value="runway">🛫 Runway Timeline</TabsTrigger>
          <TabsTrigger value="working-capital">💼 Working Capital</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW ANNUALE */}
        <TabsContent value="overview" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Rendiconto Finanziario (Cash Flow Statement)</p>
                <p className="text-blue-700">
                  Il Cash Flow Statement traccia i flussi di cassa in entrata e uscita, divisi in tre categorie:
                  <strong> Operating</strong> (operazioni correnti), <strong>Investing</strong> (investimenti), e <strong>Financing</strong> (finanziamenti).
                  È fondamentale per capire quando serve liquidità e calcolare il <strong>runway</strong> (mesi disponibili prima di esaurire la cassa).
                </p>
              </div>
            </div>
          </div>

          {/* Cash Flow Cards per 3 anni chiave */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Anno 1 (2025) */}
            <CashFlowStatementCard
              data={{
                period: 'Anno 1 (2025)',
                operatingCF: {
                  ebitda: plData[0].ebitda,
                  addBackDepreciation: plData[0].ammort,
                  workingCapitalChange: -(plData[0].ricaviTot * 0.05),
                  interestPaid: -plData[0].interessi,
                  taxesPaid: -plData[0].tasse,
                  operatingCashFlow: plData[0].ebitda + plData[0].ammort - (plData[0].ricaviTot * 0.05) - plData[0].interessi - plData[0].tasse
                },
                investingCF: {
                  capex: -50,
                  assetSales: 0,
                  intangibleInvestments: -5,
                  totalInvestingCashFlow: -55
                },
                financingCF: {
                  equityRaised: 2000,
                  debtRaised: 0,
                  debtRepayments: 0,
                  dividendsPaid: 0,
                  totalFinancingCashFlow: 2000
                },
                cashBeginning: 200,
                netCashFlow: 0,
                cashEnding: 0,
                burnRate: 0,
                runway: 0,
                cashFlowPositive: false
              }}
              showBreakdown={true}
            />

            {/* Anno 3 (2027) */}
            <CashFlowStatementCard
              data={{
                period: 'Anno 3 (2027)',
                operatingCF: {
                  ebitda: plData[2].ebitda,
                  addBackDepreciation: plData[2].ammort,
                  workingCapitalChange: -(plData[2].ricaviTot * 0.03),
                  interestPaid: -plData[2].interessi,
                  taxesPaid: -plData[2].tasse,
                  operatingCashFlow: plData[2].ebitda + plData[2].ammort - (plData[2].ricaviTot * 0.03) - plData[2].interessi - plData[2].tasse
                },
                investingCF: {
                  capex: -plData[2].ricaviTot * 0.05,
                  assetSales: 0,
                  intangibleInvestments: 0,
                  totalInvestingCashFlow: -plData[2].ricaviTot * 0.05
                },
                financingCF: {
                  equityRaised: 5000,
                  debtRaised: 0,
                  debtRepayments: 0,
                  dividendsPaid: 0,
                  totalFinancingCashFlow: 5000
                },
                cashBeginning: 1500,
                netCashFlow: 0,
                cashEnding: 0,
                burnRate: 0,
                runway: 0,
                cashFlowPositive: false
              }}
              showBreakdown={true}
            />

            {/* Anno 5 (2029) */}
            <CashFlowStatementCard
              data={{
                period: 'Anno 5 (2029)',
                operatingCF: {
                  ebitda: plData[4].ebitda,
                  addBackDepreciation: plData[4].ammort,
                  workingCapitalChange: -(plData[4].ricaviTot * 0.02),
                  interestPaid: -plData[4].interessi,
                  taxesPaid: -plData[4].tasse,
                  operatingCashFlow: plData[4].ebitda + plData[4].ammort - (plData[4].ricaviTot * 0.02) - plData[4].interessi - plData[4].tasse
                },
                investingCF: {
                  capex: -plData[4].ricaviTot * 0.03,
                  assetSales: 0,
                  intangibleInvestments: 0,
                  totalInvestingCashFlow: -plData[4].ricaviTot * 0.03
                },
                financingCF: {
                  equityRaised: 0,
                  debtRaised: 0,
                  debtRepayments: 0,
                  dividendsPaid: 0,
                  totalFinancingCashFlow: 0
                },
                cashBeginning: 8000,
                netCashFlow: 0,
                cashEnding: 0,
                burnRate: 0,
                runway: 0,
                cashFlowPositive: plData[4].ebitda > 0
              }}
              showBreakdown={true}
            />
          </div>

          {/* Grafico Evoluzione Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Evoluzione Cash Flow per Categoria</CardTitle>
              <CardDescription>Operating, Investing, Financing Cash Flows su 11 anni</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={plData.map((d, i) => {
                  const operating = d.ebitda + d.ammort - (d.ricaviTot * 0.04) - d.interessi - d.tasse;
                  const investing = -d.ricaviTot * (i === 0 ? 0.08 : 0.04);
                  const financing = i === 0 ? 2000 : i === 2 ? 5000 : 0;
                  return {
                    year: d.year,
                    'Operating CF': operating,
                    'Investing CF': investing,
                    'Financing CF': financing,
                    'Net CF': operating + investing + financing
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'K€', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number) => `€${value.toFixed(0)}K`} />
                  <Legend />
                  <Bar dataKey="Operating CF" fill="#3b82f6" />
                  <Bar dataKey="Investing CF" fill="#a855f7" />
                  <Bar dataKey="Financing CF" fill="#10b981" />
                  <Line type="monotone" dataKey="Net CF" stroke="#ef4444" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Formule e Metriche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Formule Cash Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-blue-700">Operating Cash Flow:</p>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                    OCF = EBITDA + Ammortamenti - ΔWC - Interessi - Tasse
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-purple-700">Investing Cash Flow:</p>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                    ICF = - CAPEX - IP Investments + Asset Sales
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">Financing Cash Flow:</p>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                    FCF = Equity Raised + Debt Raised - Debt Repayments
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-gray-800">Variazione Cassa Netta:</p>
                  <p className="font-mono text-xs bg-blue-50 p-2 rounded">
                    ΔCash = OCF + ICF + FCF
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metriche Cash Flow Chiave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Burn Rate (se CF negativo):</p>
                  <p className="text-xs text-gray-600">
                    Quanti €/mese brucia l&apos;azienda. Calcolato come |Operating CF| / 12.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Runway:</p>
                  <p className="text-xs text-gray-600">
                    Mesi disponibili prima di esaurire la cassa: Cassa / Burn Rate mensile.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Working Capital (WC):</p>
                  <p className="text-xs text-gray-600">
                    Capitale bloccato in crediti + magazzino - debiti fornitori. 
                    Un aumento WC consuma cassa.
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold text-blue-700">💡 Regola d&apos;Oro:</p>
                  <p className="text-xs text-blue-600">
                    Mantieni sempre runway &gt; 18 mesi. Inizia fundraising quando runway ≈ 12 mesi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Assunzioni e Metodologia
                </p>
                <ul className="text-xs text-amber-800 space-y-1 ml-4 list-disc">
                  <li>Working Capital = 2-5% ricavi (DSO 60 gg, DPO 45 gg)</li>
                  <li>CAPEX = 5-8% ricavi anno 1, poi 3-5%</li>
                  <li>Funding rounds: Seed €2M (Y1), Series A €5M (Y3) da database statoPatrimoniale</li>
                  <li>Valori reali calcolati runtime dal FinancialCalculator</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: WATERFALL BRIDGE */}
        <TabsContent value="bridge" className="space-y-4">
          {/* Alert In Sviluppo */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-lg mb-1">🚧 Feature in Sviluppo</p>
                <p className="text-sm text-amber-800">
                  Questa sezione è in fase di implementazione avanzata. 
                  La versione attuale mostra un&apos;anteprima delle funzionalità pianificate.
                  Il <strong>Waterfall Chart interattivo</strong> con animazioni sarà disponibile nella prossima release.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🌉 Waterfall Bridge Chart - Anno Selezionato</CardTitle>
              <CardDescription>Visualizzazione cascata del flusso di cassa dall&apos;anno selezionato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Selezione Anno FUNZIONALE */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Anno di riferimento:</label>
                  <select 
                    className="border rounded px-3 py-1 text-sm"
                    value={selectedBridgeYear}
                    onChange={(e) => setSelectedBridgeYear(Number(e.target.value))}
                  >
                    {plData.slice(0, 5).map((d, i) => (
                      <option key={i} value={i}>
                        {d.year} (Anno {i + 1})
                      </option>
                    ))}
                  </select>
                  <Badge variant="outline" className="ml-2">
                    {plData[selectedBridgeYear] ? `EBITDA: €${plData[selectedBridgeYear].ebitda.toFixed(1)}M` : ''}
                  </Badge>
                </div>

                {/* Calcoli dinamici basati su anno selezionato */}
                {(() => {
                  const yearData = plData[selectedBridgeYear];
                  const cashBeginning = selectedBridgeYear === 0 ? 200 : 
                    (200 + plData.slice(0, selectedBridgeYear).reduce((sum, d, i) => {
                      const opCF = d.ebitda + d.ammort - (d.ricaviTot * 0.04) - d.interessi - d.tasse;
                      const invCF = -d.ricaviTot * (i === 0 ? 0.08 : 0.04);
                      const finCF = i === 0 ? 2000 : i === 2 ? 5000 : 0;
                      return sum + opCF + invCF + finCF;
                    }, 0));
                  
                  const wcChange = yearData.ricaviTot * (selectedBridgeYear === 0 ? 0.05 : 0.03);
                  const operatingCF = yearData.ebitda + yearData.ammort - wcChange - yearData.interessi - yearData.tasse;
                  const capexRate = selectedBridgeYear === 0 ? 0.08 : 0.04;
                  const investingCF = -yearData.ricaviTot * capexRate - (selectedBridgeYear === 0 ? 5 : 0);
                  const financingCF = selectedBridgeYear === 0 ? 2000 : selectedBridgeYear === 2 ? 5000 : 0;
                  const netCF = operatingCF + investingCF + financingCF;
                  const cashEnding = cashBeginning + netCF;

                  return (
                    <>
                      {/* Waterfall Chart */}
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart
                          data={[
                            { name: 'Cassa Iniziale', cumulative: cashBeginning, color: '#6b7280' },
                            { name: 'Operating CF', cumulative: cashBeginning + operatingCF, color: operatingCF >= 0 ? '#10b981' : '#ef4444' },
                            { name: 'Investing CF', cumulative: cashBeginning + operatingCF + investingCF, color: '#a855f7' },
                            { name: 'Financing CF', cumulative: cashEnding, color: '#10b981' },
                            { name: 'Cassa Finale', cumulative: cashEnding, color: '#3b82f6' }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                          <YAxis label={{ value: 'K€', angle: -90, position: 'insideLeft' }} />
                          <RechartsTooltip 
                            formatter={(value: number) => `€${value.toFixed(0)}K`}
                            labelFormatter={(label) => `Componente: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="cumulative" fill="#3b82f6" name="Posizione Cassa Cumulativa">
                            {[0, 1, 2, 3, 4].map((index) => (
                              <rect key={index} fill={index === 0 ? '#6b7280' : index === 1 ? (operatingCF >= 0 ? '#10b981' : '#ef4444') : index === 2 ? '#a855f7' : index === 3 ? '#10b981' : '#3b82f6'} />
                            ))}
                          </Bar>
                        </ComposedChart>
                      </ResponsiveContainer>

                      {/* Breakdown Numerico DINAMICO */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Flussi in Entrata</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cassa Iniziale:</span>
                              <span className="font-semibold text-green-600">€{cashBeginning.toFixed(0)}K</span>
                            </div>
                            {operatingCF > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Operating CF (positivo):</span>
                                <span className="font-semibold text-green-600">+€{operatingCF.toFixed(0)}K</span>
                              </div>
                            )}
                            {financingCF > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Financing CF (Funding):</span>
                                <span className="font-semibold text-green-600">+€{financingCF.toFixed(0)}K</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Totale Entrate:</span>
                              <span className="font-bold text-green-700">
                                €{(cashBeginning + Math.max(0, operatingCF) + financingCF).toFixed(0)}K
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Flussi in Uscita</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {operatingCF < 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Operating CF (Burn):</span>
                                <span className="font-semibold text-red-600">€{operatingCF.toFixed(0)}K</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Investing CF (CAPEX):</span>
                              <span className="font-semibold text-red-600">€{investingCF.toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Totale Uscite:</span>
                              <span className="font-bold text-red-700">
                                €{(Math.abs(Math.min(0, operatingCF)) + Math.abs(investingCF)).toFixed(0)}K
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Risultato Finale DINAMICO */}
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Cassa Finale {yearData.year}</p>
                              <p className="text-3xl font-bold text-blue-700">
                                €{cashEnding.toFixed(0)}K
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-1">Variazione Netta</p>
                              <p className={`text-2xl font-semibold ${netCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {netCF >= 0 ? '+' : ''}€{netCF.toFixed(0)}K
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Note Sviluppi Futuri */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Prossimi Sviluppi Pianificati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-900 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="line-through text-gray-600"><strong>Selezione Anno Dinamica:</strong> Implementata! Switch tra i 5 anni disponibili</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Waterfall Chart Avanzato:</strong> Visualizzazione animata stile &quot;cascata&quot; con barre fluttuanti (libreria Victory o D3)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Espansione a 11 anni:</strong> Estendere selezione a tutti gli anni proiettati (2025-2035)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Breakdown Espandibile:</strong> Click su componente per drill-down (es. Operating CF → EBITDA, WC, Tasse, Interessi)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Export PDF/PNG:</strong> Salvataggio grafico per presentazioni investor-ready</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Animazioni Transizioni:</strong> Smooth animation quando si cambia anno selezionato</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RUNWAY TIMELINE */}
        <TabsContent value="runway" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🛫 Runway Timeline</CardTitle>
              <CardDescription>Proiezione runway mensile e alert critici</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Grafico Runway Evolution */}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={plData.slice(0, 5).map((d, i) => {
                    const operating = d.ebitda + d.ammort - (d.ricaviTot * 0.04) - d.interessi - d.tasse;
                    const burnRate = operating < 0 ? Math.abs(operating) / 12 : 0;
                    // Simulazione cash balance cumulativo
                    const cashBalance = i === 0 ? 2000 : 2000 + (operating * (i + 1));
                    const runway = burnRate > 0 ? cashBalance / burnRate : 999;
                    
                    return {
                      year: d.year,
                      'Runway (mesi)': Math.min(runway, 60),
                      'Cash Balance': cashBalance,
                      'Soglia Critica': 12
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Mesi', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Runway (mesi)" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="Soglia Critica" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Interpretazione:</strong> Il runway rappresenta quanti mesi l&apos;azienda può operare
                    con la cassa disponibile, assumendo burn rate costante. Quando scende sotto 12 mesi (linea rossa),
                    è tempo di iniziare un round di fundraising.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: WORKING CAPITAL */}
        <TabsContent value="working-capital" className="space-y-4">
          {/* Alert In Sviluppo */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-lg mb-1">🚧 Feature in Sviluppo</p>
                <p className="text-sm text-amber-800">
                  Questa sezione è in fase di implementazione avanzata. 
                  La versione attuale mostra metriche base del capitale circolante.
                  <strong> Cash Conversion Cycle optimization</strong> e raccomandazioni AI saranno disponibili nella prossima release.
                </p>
              </div>
            </div>
          </div>

          {/* Metriche WC Base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  📅 DSO (Days Sales Outstanding)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-blue-700">60</span>
                    <span className="text-gray-500 mb-1">giorni</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Tempo medio per incassare crediti dai clienti
                  </p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      <strong>Formula:</strong> Crediti / (Ricavi / 365)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  📦 DPO (Days Payable Outstanding)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-green-700">45</span>
                    <span className="text-gray-500 mb-1">giorni</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Tempo medio per pagare fornitori
                  </p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      <strong>Formula:</strong> Debiti / (COGS / 365)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  🔄 Inventory Turnover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-purple-700">6</span>
                    <span className="text-gray-500 mb-1">volte/anno</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Rotazione magazzino annuale
                  </p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      <strong>Formula:</strong> COGS / Magazzino Medio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Conversion Cycle */}
          <Card>
            <CardHeader>
              <CardTitle>⏱️ Cash Conversion Cycle (CCC)</CardTitle>
              <CardDescription>Tempo tra esborso per fornitori e incasso da clienti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Formula Visuale */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-center gap-4 text-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">DSO</div>
                      <div className="text-3xl font-bold text-blue-700">60</div>
                    </div>
                    <div className="text-2xl text-gray-400">+</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">DIO*</div>
                      <div className="text-3xl font-bold text-purple-700">61</div>
                    </div>
                    <div className="text-2xl text-gray-400">-</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">DPO</div>
                      <div className="text-3xl font-bold text-green-700">45</div>
                    </div>
                    <div className="text-2xl text-gray-400">=</div>
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-300">
                      <div className="text-sm text-gray-600 mb-1">CCC</div>
                      <div className="text-4xl font-bold text-orange-600">76</div>
                      <div className="text-xs text-gray-500 mt-1">giorni</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-4">
                    * DIO (Days Inventory Outstanding) = 365 / Inventory Turnover = 365 / 6 ≈ 61 giorni
                  </p>
                </div>

                {/* Grafico CCC Evolution */}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={plData.slice(0, 5).map((d, i) => {
                    const dso = 60 - (i * 2); // Migliora nel tempo
                    const dpo = 45 + (i * 1); // Peggiora leggermente (paghiamo più lenti)
                    const dio = 61 - (i * 3); // Magazzino più efficiente
                    const ccc = dso + dio - dpo;
                    
                    return {
                      year: d.year,
                      'DSO': dso,
                      'DPO': dpo,
                      'DIO': dio,
                      'CCC': ccc
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Giorni', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip formatter={(value: number) => `${value.toFixed(0)} gg`} />
                    <Legend />
                    <Line type="monotone" dataKey="DSO" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="DPO" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="DIO" stroke="#a855f7" strokeWidth={2} />
                    <Line type="monotone" dataKey="CCC" stroke="#f97316" strokeWidth={3} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Interpretazione:</strong> Il Cash Conversion Cycle di <strong>76 giorni</strong> indica 
                    che l&apos;azienda impiega circa 2.5 mesi tra quando paga i fornitori e quando incassa dai clienti.
                    Un CCC più basso è migliore (meno capitale bloccato). Target ottimale per MedTech: <strong>&lt;60 giorni</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Capital Requirement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💰 Working Capital Stimato (Anno 1)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crediti Commerciali (DSO):</span>
                    <span className="font-semibold">€{(plData[0].ricaviTot * 1000 * (60/365)).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Magazzino (DIO):</span>
                    <span className="font-semibold">€{(plData[0].cogsTot * 1000 / 6).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>- Debiti Fornitori (DPO):</span>
                    <span className="font-semibold">-€{(plData[0].cogsTot * 1000 * (45/365)).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Working Capital Netto:</span>
                    <span className="text-orange-600">
                      €{((plData[0].ricaviTot * 1000 * (60/365)) + (plData[0].cogsTot * 1000 / 6) - (plData[0].cogsTot * 1000 * (45/365))).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="text-base">⚠️ Impatto su Cassa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Il Working Capital <strong>consuma liquidità</strong> perché:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    <li>Paghiamo fornitori (45gg) prima di incassare da clienti (60gg)</li>
                    <li>Capitale bloccato in magazzino (~61 giorni di COGS)</li>
                    <li>Gap di 76 giorni in cui serve cash per operare</li>
                  </ul>
                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold text-orange-700">
                      Fabbisogno finanziario WC Anno 1: 
                      <span className="text-lg ml-2">
                        €{((plData[0].ricaviTot * 1000 * (60/365)) + (plData[0].cogsTot * 1000 / 6) - (plData[0].cogsTot * 1000 * (45/365))).toFixed(0)}K
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Note Sviluppi Futuri */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Prossimi Sviluppi Pianificati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-900 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Benchmark Industry:</strong> Confronto DSO/DPO/CCC con competitor MedTech</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Scenario What-If:</strong> Simulazione impatto riduzione DSO (es. da 60 a 45 gg)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Raccomandazioni AI:</strong> Suggerimenti automatici per ottimizzare CCC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Factoring Analysis:</strong> Valutazione cessione crediti per migliorare liquidità</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Seasonal Patterns:</strong> Analisi variazioni mensili WC</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
