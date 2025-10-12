'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart, Cell } from 'recharts';
import { TrendingUp, DollarSign, Target, Percent, FileText, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Scenario } from '@/types/financial';
import { FinancialCalculator } from '@/lib/calculations';

interface PLData {
  year: number;
  ricaviHW: number;
  ricaviSaaS: number;
  ricaviTot: number;
  cogsHW: number;
  cogsSaaS: number;
  cogsTot: number;
  margineLordo: number;
  margineLordoPerc: number;
  opexTot: number;
  ebitda: number;
  ebitdaPerc: number;
  ammort: number;
  ebit: number;
  interessi: number;
  ebt: number;
  tasse: number;
  utileNetto: number;
  netMarginPerc: number;
  unitaVendute: number;
  unitaBE: number;
}

interface IncomeStatementDashboardProps {
  scenario?: Scenario;
}

// Componente helper per Tooltip con formula e fonte dati
interface MetricTooltipProps {
  title: string;
  formula: string;
  dbSource?: string;
  notes?: string;
  children: React.ReactNode;
}

function MetricTooltip({ title, formula, dbSource, notes, children }: MetricTooltipProps) {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help inline-flex items-center gap-1">
          {children}
          <HelpCircle className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-sm">
        <div className="space-y-2">
          <p className="font-semibold text-xs">{title}</p>
          <div className="text-xs">
            <p className="font-mono bg-muted px-2 py-1 rounded">{formula}</p>
          </div>
          {dbSource && (
            <div className="text-xs text-blue-600">
              <p className="font-semibold">📊 Fonte Database:</p>
              <p className="font-mono text-[10px]">{dbSource}</p>
            </div>
          )}
          {notes && (
            <p className="text-xs text-muted-foreground italic">{notes}</p>
          )}
        </div>
      </TooltipContent>
    </UITooltip>
  );
}

export function IncomeStatementDashboard({ scenario }: IncomeStatementDashboardProps) {
  const [costoUnit, setCostoUnit] = useState(11000);
  const [prezzoUnit, setPrezzoUnit] = useState(50000);
  const [selectedYear, setSelectedYear] = useState<number>(11); // Anno 11 (2035) come default
  
  // Calcola dati reali da scenario usando FinancialCalculator
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

  const plData = useMemo((): PLData[] => {
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
    
    return years.map((year, i) => {
      // RICAVI - Usa dati reali se disponibili, altrimenti proietta
      let ricaviHW: number, ricaviSaaS: number, ricaviTot: number;
      let cogsFromCalc: number, opexFromCalc: number, ebitdaFromCalc: number;
      
      // Per i primi 5 anni (2025-2029) usa dati reali dal calculator
      if (i < 5 && calculationResults && calculationResults.annualData[i]) {
        const annualData = calculationResults.annualData[i];
        ricaviHW = annualData.capexRev;
        ricaviSaaS = annualData.recurringRev;
        ricaviTot = annualData.totalRev;
        cogsFromCalc = annualData.cogs;
        opexFromCalc = annualData.totalOpex;
        ebitdaFromCalc = annualData.ebitda;
      } else if (i >= 5 && calculationResults && calculationResults.annualData[4]) {
        // Anni 6-11 (2030-2035): proiezione basata su Y5 + growth rate
        const y5 = calculationResults.annualData[4];
        const y4 = calculationResults.annualData[3];
        
        // Calcola growth rate medio Y4->Y5
        const revenueGrowthRate = y4.totalRev > 0 ? (y5.totalRev / y4.totalRev) : 1.15;
        
        // Anni di proiezione (0 per Y6, 1 per Y7, etc.)
        const yearsAhead = i - 4;
        
        // Growth rate che decresce nel tempo (maturazione mercato)
        const decayFactor = Math.pow(0.95, yearsAhead - 1); // Riduce del 5% ogni anno
        const adjustedGrowthRate = 1 + ((revenueGrowthRate - 1) * decayFactor);
        
        // Applica growth cumulativo
        const cumulativeGrowth = Math.pow(adjustedGrowthRate, yearsAhead);
        
        ricaviHW = y5.capexRev * cumulativeGrowth;
        ricaviSaaS = y5.recurringRev * cumulativeGrowth;
        ricaviTot = y5.totalRev * cumulativeGrowth;
        cogsFromCalc = y5.cogs * cumulativeGrowth;
        
        // OPEX crescono più lentamente (economie di scala)
        const opexGrowthRate = 1 + ((adjustedGrowthRate - 1) * 0.6); // 60% del growth revenue
        const cumulativeOpexGrowth = Math.pow(opexGrowthRate, yearsAhead);
        opexFromCalc = y5.totalOpex * cumulativeOpexGrowth;
        
        ebitdaFromCalc = (ricaviTot - cogsFromCalc) - opexFromCalc;
      } else {
        // Fallback a simulazione se scenario non disponibile
        const baseRev = 100 * (1 + i * 0.5);
        ricaviHW = baseRev * 0.7;
        ricaviSaaS = baseRev * 0.3;
        ricaviTot = ricaviHW + ricaviSaaS;
        cogsFromCalc = 0;
        opexFromCalc = 0;
        ebitdaFromCalc = 0;
      }
      
      // COGS - Usa dati reali o calcola
      const unitaVendute = ricaviHW > 0 ? ricaviHW / (prezzoUnit / 1000) : 0;
      const cogsHW = cogsFromCalc > 0 ? cogsFromCalc * 0.8 : unitaVendute * (costoUnit / 1000); // 80% COGS è HW
      const cogsSaaS = cogsFromCalc > 0 ? cogsFromCalc * 0.2 : ricaviSaaS * 0.10;
      const cogsTot = cogsFromCalc > 0 ? cogsFromCalc : cogsHW + cogsSaaS;
      
      // MARGINE LORDO
      const margineLordo = ricaviTot - cogsTot;
      const margineLordoPerc = ricaviTot > 0 ? (margineLordo / ricaviTot) * 100 : 0;
      
      // OPEX - Usa dati reali da scenario o fallback proiettato
      let opexTot: number;
      if (opexFromCalc > 0) {
        opexTot = opexFromCalc;
      } else {
        // Fallback: usa dati storici e proietta
        const opexFallback = [82, 452, 488, 783, 900];
        if (i < 5) {
          opexTot = opexFallback[i];
        } else {
          // Proietta con growth del 5% annuo
          const lastOpex = opexFallback[4];
          opexTot = lastOpex * Math.pow(1.05, i - 4);
        }
      }
      
      // EBITDA
      const ebitda = ebitdaFromCalc !== 0 ? ebitdaFromCalc : margineLordo - opexTot;
      const ebitdaPerc = ricaviTot > 0 ? (ebitda / ricaviTot) * 100 : 0;
      
      // AMMORTAMENTI - Da database contoEconomico + proiezione anni 6-11
      const ammortData = [0.5, 20.5, 20.5, 20.5, 10];
      let ammort: number;
      if (i < 5) {
        ammort = ammortData[i];
      } else {
        // Anni 6-11: stabile a 10M (assume asset fully depreciated)
        ammort = 10;
      }
      
      // EBIT
      const ebit = ebitda - ammort;
      
      // INTERESSI - Da database contoEconomico + proiezione anni 6-11
      const interessiData = [10, 10, 5, 0, 0];
      let interessi: number;
      if (i < 5) {
        interessi = interessiData[i];
      } else {
        // Anni 6-11: assume debito ripagato, interessi = 0
        interessi = 0;
      }
      
      // EBT e TASSE
      const ebt = ebit - interessi;
      const tasse = ebt > 0 ? ebt * 0.28 : 0;
      
      // UTILE NETTO
      const utileNetto = ebt - tasse;
      const netMarginPerc = ricaviTot > 0 ? (utileNetto / ricaviTot) * 100 : 0;
      
      // BREAK-EVEN
      const unitaBE = opexTot / ((prezzoUnit - costoUnit) / 1000);
      
      return {
        year, ricaviHW, ricaviSaaS, ricaviTot, cogsHW, cogsSaaS, cogsTot,
        margineLordo, margineLordoPerc, opexTot, ebitda, ebitdaPerc,
        ammort, ebit, interessi, ebt, tasse, utileNetto, netMarginPerc,
        unitaVendute, unitaBE
      };
    });
  }, [scenario, calculationResults, costoUnit, prezzoUnit]);
  
  // KPI per anno selezionato
  const selectedYearData = plData[selectedYear - 1] || plData[plData.length - 1];
  const firstYear = plData[0];

  return (
    <TooltipProvider>
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conto Economico</h1>
          <p className="text-muted-foreground mt-1">Income Statement Previsionale 2025-2035</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Anno KPI:</span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSelectedYear(prev => Math.max(1, prev - 1))}
                disabled={selectedYear === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="default" className="min-w-[80px] justify-center text-base">
                {2024 + selectedYear}
              </Badge>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSelectedYear(prev => Math.min(11, prev + 1))}
                disabled={selectedYear === 11}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Badge variant="outline"><FileText className="h-4 w-4 mr-2" />P&L Dashboard</Badge>
        </div>
      </div>

      {selectedYear > 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Anno {selectedYearData.year}: Proiezione</strong> - I dati dal 2030 in poi sono proiezioni basate sul trend 2025-2029 con growth rate decrescente e economie di scala.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <MetricTooltip
              title="Ricavi Totali"
              formula="Ricavi Totali = Ricavi Hardware + Ricavi SaaS"
              dbSource="scenario.drivers.pricing.devicePrice × dispositivi + scenario.drivers.pricing.arpaPerAccount × account"
              notes="Anni 1-5: dati da FinancialCalculator basati su funnel vendite. Anni 6-11: proiezione con growth rate decrescente."
            >
              <CardTitle className="text-sm font-medium">Ricavi {selectedYearData.year}</CardTitle>
            </MetricTooltip>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{selectedYearData.ricaviTot.toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              HW: €{selectedYearData.ricaviHW.toFixed(1)}M | SaaS: €{selectedYearData.ricaviSaaS.toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">
              vs Y1: {selectedYearData.ricaviTot > 0 ? ((selectedYearData.ricaviTot / firstYear.ricaviTot - 1) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <MetricTooltip
              title="EBITDA"
              formula="EBITDA = Ricavi - COGS - OPEX"
              dbSource="annualData.ebitda (calcolato) = totalRev - cogs - totalOpex"
              notes="Earnings Before Interest, Taxes, Depreciation, and Amortization. Misura la profittabilità operativa prima di ammortamenti e oneri finanziari."
            >
              <CardTitle className="text-sm font-medium">EBITDA {selectedYearData.year}</CardTitle>
            </MetricTooltip>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${selectedYearData.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{selectedYearData.ebitda.toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Margin: {selectedYearData.ebitdaPerc.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <MetricTooltip
              title="Margine Lordo (Gross Margin)"
              formula="Margine Lordo = Ricavi - COGS\nGross Margin % = (Margine Lordo / Ricavi) × 100"
              dbSource="COGS = annualData.cogs (hardware × costoUnit + SaaS × 10%)"
              notes="Misura il profitto dopo aver sottratto i costi diretti di produzione/erogazione servizio."
            >
              <CardTitle className="text-sm font-medium">Margine Lordo {selectedYearData.year}</CardTitle>
            </MetricTooltip>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedYearData.margineLordoPerc.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">€{selectedYearData.margineLordo.toFixed(1)}M</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <MetricTooltip
              title="Utile Netto (Net Income)"
              formula="EBT = EBIT - Interessi\nTasse = EBT × 28% (se EBT > 0)\nUtile Netto = EBT - Tasse"
              dbSource="EBIT = EBITDA - Ammortamenti\nAmmortamenti: [0.5, 20.5, 20.5, 20.5, 10, ...] M€\nInteressi: [10, 10, 5, 0, 0, ...] M€"
              notes="Profitto finale dopo tutti i costi, ammortamenti, interessi e tasse. Aliquota fiscale: 28%."
            >
              <CardTitle className="text-sm font-medium">Utile Netto {selectedYearData.year}</CardTitle>
            </MetricTooltip>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${selectedYearData.utileNetto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{selectedYearData.utileNetto.toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Net Margin: {selectedYearData.netMarginPerc.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="margins">Margini</TabsTrigger>
          <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evoluzione P&L</CardTitle>
              <CardDescription>Ricavi, Costi e Profittabilità</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={plData.map(d => ({
                  year: d.year,
                  Ricavi: d.ricaviTot,
                  COGS: d.cogsTot,
                  OPEX: d.opexTot,
                  EBITDA: d.ebitda,
                  'Utile Netto': d.utileNetto
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number) => `€${value.toFixed(1)}M`} />
                  <Legend />
                  <Bar dataKey="Ricavi" fill="#10b981" />
                  <Bar dataKey="COGS" fill="#ef4444" />
                  <Bar dataKey="OPEX" fill="#f59e0b" />
                  <Line type="monotone" dataKey="EBITDA" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Utile Netto" stroke="#8b5cf6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composizione Ricavi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={plData.map(d => ({ year: d.year, Hardware: d.ricaviHW, SaaS: d.ricaviSaaS }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number) => `€${value.toFixed(1)}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="Hardware" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="SaaS" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conto Economico Dettagliato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Voce</TableHead>
                      {plData.map(d => <TableHead key={d.year} className="text-right">{d.year}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="font-semibold bg-green-50">
                      <TableCell>RICAVI</TableCell>
                      {plData.map(d => <TableCell key={d.year} />)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">
                        <MetricTooltip
                          title="Ricavi Hardware"
                          formula="Ricavi HW = dispositivi venduti × prezzo × %CapEx"
                          dbSource="annualData.capexRev = nDevicesSold × devicePrice × capexShare"
                          notes="Vendite one-time di dispositivi. Include solo quota acquisto CapEx (non leasing)."
                        >
                          <span>Hardware</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">€{d.ricaviHW.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">
                        <MetricTooltip
                          title="Ricavi SaaS"
                          formula="Ricavi SaaS = account attivi × (ARPA / 12) × 12"
                          dbSource="annualData.recurringRev = activeAccounts × arpaPerAccount"
                          notes="Ricavi ricorrenti mensili da abbonamento software. Impattati da churn."
                        >
                          <span>SaaS</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">€{d.ricaviSaaS.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    <TableRow className="font-bold border-t-2">
                      <TableCell>
                        <MetricTooltip
                          title="Totale Ricavi"
                          formula="Totale = Ricavi Hardware + Ricavi SaaS"
                          dbSource="annualData.totalRev"
                          notes="Top line del P&L. Base per tutti i margini percentuali."
                        >
                          <span>Totale Ricavi</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right font-bold">€{d.ricaviTot.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-semibold bg-red-50">
                      <TableCell>COGS</TableCell>
                      {plData.map(d => <TableCell key={d.year} />)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">
                        <MetricTooltip
                          title="COGS (Cost of Goods Sold)"
                          formula="COGS = (unitàVendute × costoUnit) + (ricaviSaaS × 10%)"
                          dbSource="annualData.cogs | Default: costoUnit=€11K, SaaS delivery=10%"
                          notes="Costi diretti di produzione hardware + delivery cost SaaS. HW: €11K/unità, SaaS: 10% ricavi."
                        >
                          <span>Totale COGS</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right text-red-600">-€{d.cogsTot.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-bold bg-blue-50 border-t-2">
                      <TableCell>
                        <MetricTooltip
                          title="Margine Lordo (Gross Profit)"
                          formula="Margine Lordo = Ricavi - COGS"
                          dbSource="Calcolato: ricaviTot - cogsTot"
                          notes="Profitto dopo costi diretti. Indica efficienza produttiva/delivery."
                        >
                          <span>MARGINE LORDO</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right font-bold">€{d.margineLordo.toFixed(1)}M ({d.margineLordoPerc.toFixed(1)}%)</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-semibold bg-orange-50">
                      <TableCell>OPEX</TableCell>
                      {plData.map(d => <TableCell key={d.year} />)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">
                        <MetricTooltip
                          title="OPEX (Operating Expenses)"
                          formula="OPEX = Sales + R&D + Marketing + G&A"
                          dbSource="annualData.totalOpex | Anni 6-11: proiettato con +5% annuo"
                          notes="Spese operative: vendite, ricerca, marketing, amministrazione. Crescono più lentamente dei ricavi (economie di scala)."
                        >
                          <span>Totale OPEX</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">-€{d.opexTot.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-bold bg-blue-100 border-t-2">
                      <TableCell>
                        <MetricTooltip
                          title="EBITDA"
                          formula="EBITDA = Margine Lordo - OPEX"
                          dbSource="annualData.ebitda = totalRev - cogs - totalOpex"
                          notes="Earnings Before Interest, Taxes, Depreciation, Amortization. KPI chiave per profittabilità operativa."
                        >
                          <span>EBITDA</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className={`text-right font-bold ${d.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{d.ebitda.toFixed(1)}M ({d.ebitdaPerc.toFixed(1)}%)</TableCell>)}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>
                        <MetricTooltip
                          title="Ammortamenti (Depreciation)"
                          formula="Ammortamento asset tangibili e intangibili"
                          dbSource="Hardcoded: [0.5, 20.5, 20.5, 20.5, 10, 10...] M€"
                          notes="Y1: setup €0.5M, Y2-4: investimenti pesanti €20.5M, Y5+: manutenzione €10M."
                        >
                          <span>Ammortamenti</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">-€{d.ammort.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-bold border-t">
                      <TableCell>
                        <MetricTooltip
                          title="EBIT (Operating Profit)"
                          formula="EBIT = EBITDA - Ammortamenti"
                          dbSource="Calcolato: ebitda - ammort"
                          notes="Earnings Before Interest and Taxes. Profitto operativo dopo ammortamenti."
                        >
                          <span>EBIT</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className={`text-right font-bold ${d.ebit >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{d.ebit.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>
                        <MetricTooltip
                          title="Interessi Passivi (Interest Expense)"
                          formula="Interessi su debito finanziario"
                          dbSource="Hardcoded: [10, 10, 5, 0, 0...] M€"
                          notes="Y1-2: €10M/anno su debito iniziale, Y3: €5M (parziale rimborso), Y4+: €0 (debito saldato)."
                        >
                          <span>Interessi</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">-€{d.interessi.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-bold border-t">
                      <TableCell>
                        <MetricTooltip
                          title="EBT (Pre-Tax Income)"
                          formula="EBT = EBIT - Interessi"
                          dbSource="Calcolato: ebit - interessi"
                          notes="Earnings Before Taxes. Base imponibile per il calcolo delle tasse."
                        >
                          <span>EBT</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className={`text-right font-bold ${d.ebt >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{d.ebt.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>
                        <MetricTooltip
                          title="Tasse (Income Tax)"
                          formula="Tasse = EBT × 28% (se EBT > 0)"
                          dbSource="Calcolato: ebt > 0 ? ebt * 0.28 : 0"
                          notes="Aliquota fiscale Italia: 28% (IRES). No tax credit su perdite (approccio conservativo)."
                        >
                          <span>Tasse (28%)</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className="text-right">-€{d.tasse.toFixed(1)}M</TableCell>)}
                    </TableRow>
                    
                    <TableRow className="font-bold bg-purple-100 border-t-2">
                      <TableCell>
                        <MetricTooltip
                          title="Utile Netto (Net Income)"
                          formula="Utile Netto = EBT - Tasse"
                          dbSource="Calcolato: ebt - tasse"
                          notes="Bottom line del P&L. Profitto finale disponibile per azionisti dopo tutti i costi, ammortamenti, interessi e tasse."
                        >
                          <span>UTILE NETTO</span>
                        </MetricTooltip>
                      </TableCell>
                      {plData.map(d => <TableCell key={d.year} className={`text-right font-bold ${d.utileNetto >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{d.utileNetto.toFixed(1)}M ({d.netMarginPerc.toFixed(1)}%)</TableCell>)}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evoluzione Margini</CardTitle>
              <CardDescription>Gross Margin, EBITDA Margin, Net Margin</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={plData.map(d => ({
                  year: d.year,
                  'Gross Margin %': d.margineLordoPerc,
                  'EBITDA Margin %': d.ebitdaPerc,
                  'Net Margin %': d.netMarginPerc
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="Gross Margin %" stroke="#10b981" strokeWidth={3} />
                  <Line type="monotone" dataKey="EBITDA Margin %" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Net Margin %" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakeven" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Break-Even</CardTitle>
              <CardDescription>Distanza dal punto di pareggio operativo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={plData.map(d => {
                  const breakEvenEbitda = 0;
                  const distanza = d.ebitda - breakEvenEbitda;
                  const percentuale = d.ricaviTot > 0 ? (distanza / d.ricaviTot) * 100 : 0;
                  return {
                    year: d.year,
                    'EBITDA': d.ebitda,
                    'Break-Even': breakEvenEbitda,
                    'Margine vs BEP': distanza,
                    'EBITDA %': percentuale
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'M€', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number) => `€${value.toFixed(1)}M`} />
                  <Legend />
                  <Bar 
                    dataKey="EBITDA" 
                    fill="#8884d8"
                    name="EBITDA"
                  >
                    {plData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.ebitda >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="Break-Even" 
                    stroke="#64748b" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Soglia Break-Even (0€)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="EBITDA %" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    yAxisId="right"
                    name="EBITDA Margin %"
                  />
                  <YAxis yAxisId="right" orientation="right" label={{ value: '%', angle: 90, position: 'insideRight' }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Break-Even Timing:</p>
                  {plData.map(d => d.ebitda >= 0).findIndex(x => x) >= 0 ? (
                    <p className="text-sm text-green-600">
                      ✓ Raggiunto in {plData.find(d => d.ebitda >= 0)?.year || 'N/A'}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      ✗ Non raggiunto nel periodo 2025-2035
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">EBITDA {selectedYearData.year}:</p>
                  <p className={`text-sm ${selectedYearData.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{selectedYearData.ebitda.toFixed(1)}M ({selectedYearData.ebitdaPerc.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Break-Even Point:</strong> Il momento in cui EBITDA raggiunge €0, ovvero quando i ricavi coprono tutti i costi operativi (COGS + OPEX).
                  Barre verdi = profitto operativo, barre rosse = perdita operativa.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
