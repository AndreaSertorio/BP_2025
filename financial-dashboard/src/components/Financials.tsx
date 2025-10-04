'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartCard } from './ChartCard';
import { CalculationResults } from '@/types/financial';
import { formatMillions, formatPercent, downloadCSV } from '@/lib/utils';

interface FinancialsProps {
  results: CalculationResults;
}

export function Financials({ results }: FinancialsProps) {
  const [viewMode, setViewMode] = useState<'annual' | 'quarterly'>('annual');

  // P&L Statement data
  const plData = useMemo(() => {
    return results.annualData.map(annual => ({
      year: `Y${annual.year}`,
      'Ricavi Ricorrenti': annual.recurringRev,
      'Ricavi CapEx': annual.capexRev,
      'Ricavi Totali': annual.totalRev,
      'COGS': -annual.cogs,
      'Margine Lordo': annual.grossMargin,
      'OPEX': -annual.opex,
      'EBITDA': annual.ebitda
    }));
  }, [results]);

  // Cash Flow approximation (simplified)
  const cashFlowData = useMemo(() => {
    return results.annualData.map((annual, index) => {
      const capex = annual.capexRev * 0.3; // Assume 30% of CapEx revenue requires upfront investment
      const workingCapital = annual.totalRev * 0.1; // 10% of revenue tied in working capital
      const previousWC = index > 0 ? results.annualData[index - 1].totalRev * 0.1 : 0;
      const wcChange = workingCapital - previousWC;
      
      return {
        year: `Y${annual.year}`,
        'EBITDA': annual.ebitda,
        'CapEx': -capex,
        'Δ Working Capital': -wcChange,
        'Free Cash Flow': annual.ebitda - capex - wcChange
      };
    });
  }, [results]);

  // Balance Sheet approximation (simplified)
  const balanceSheetData = useMemo(() => {
    let cumulativeCash = 0;
    let cumulativeCapex = 0;
    
    return results.annualData.map((annual, index) => {
      const capex = annual.capexRev * 0.3;
      const freeCashFlow = cashFlowData[index]['Free Cash Flow'];
      cumulativeCash += freeCashFlow;
      cumulativeCapex += capex;
      
      const workingCapital = annual.totalRev * 0.1;
      const totalAssets = cumulativeCash + cumulativeCapex + workingCapital;
      
      return {
        year: `Y${annual.year}`,
        'Cash': cumulativeCash,
        'Fixed Assets': cumulativeCapex,
        'Working Capital': workingCapital,
        'Total Assets': totalAssets,
        'Equity': totalAssets // Simplified - assuming no debt
      };
    });
  }, [results, cashFlowData]);

  const handleExportPL = () => {
    downloadCSV(plData, 'eco3d-profit-loss.csv');
  };

  const handleExportCF = () => {
    downloadCSV(cashFlowData, 'eco3d-cash-flow.csv');
  };

  const handleExportBS = () => {
    downloadCSV(balanceSheetData, 'eco3d-balance-sheet.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Financials (Three-Statement)</h2>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'annual' | 'quarterly')}>
          <TabsList>
            <TabsTrigger value="annual">Annuale</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestrale</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="pl" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pl">P&L</TabsTrigger>
          <TabsTrigger value="cf">Cash Flow</TabsTrigger>
          <TabsTrigger value="bs">Stato Patrimoniale</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Conto Economico"
              subtitle="Ricavi, Costi e EBITDA"
              data={plData}
              type="bar"
              dataKeys={['Ricavi Totali', 'Margine Lordo', 'EBITDA']}
              colors={['#3b82f6', '#10b981', '#f59e0b']}
              xAxisKey="year"
              yAxisLabel="M€"
              onExport={handleExportPL}
              description="Evoluzione del conto economico nel tempo"
            />

            <ChartCard
              title="Margini Percentuali"
              subtitle="Margine Lordo % e EBITDA %"
              data={plData.map(item => ({
                year: item.year,
                'Margine Lordo %': item['Ricavi Totali'] > 0 ? (item['Margine Lordo'] / item['Ricavi Totali']) * 100 : 0,
                'EBITDA %': item['Ricavi Totali'] > 0 ? (item['EBITDA'] / item['Ricavi Totali']) * 100 : 0
              }))}
              type="line"
              dataKeys={['Margine Lordo %', 'EBITDA %']}
              colors={['#10b981', '#f59e0b']}
              xAxisKey="year"
              yAxisLabel="%"
              description="Evoluzione dei margini percentuali"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conto Economico Dettagliato</CardTitle>
              <button
                onClick={handleExportPL}
                className="text-sm text-primary hover:underline"
              >
                Esporta CSV
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Voce</th>
                      {results.annualData.map(annual => (
                        <th key={annual.year} className="text-right p-2">Y{annual.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Ricavi Ricorrenti</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right">{formatMillions(annual.recurringRev)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Ricavi CapEx</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right">{formatMillions(annual.capexRev)}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="p-2 font-semibold">Ricavi Totali</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right font-semibold">{formatMillions(annual.totalRev)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">COGS</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right text-red-600">({formatMillions(annual.cogs)})</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="p-2 font-semibold">Margine Lordo</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right font-semibold">{formatMillions(annual.grossMargin)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Margine Lordo %</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right">{formatPercent(annual.grossMarginPercent)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">OPEX</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className="p-2 text-right text-red-600">({formatMillions(annual.opex)})</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-green-50">
                      <td className="p-2 font-bold">EBITDA</td>
                      {results.annualData.map(annual => (
                        <td key={annual.year} className={`p-2 text-right font-bold ${annual.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {annual.ebitda >= 0 ? formatMillions(annual.ebitda) : `(${formatMillions(Math.abs(annual.ebitda))})`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cf" className="space-y-6">
          <ChartCard
            title="Free Cash Flow"
            subtitle="Generazione di cassa operativa"
            data={cashFlowData}
            type="bar"
            dataKeys={['EBITDA', 'Free Cash Flow']}
            colors={['#10b981', '#3b82f6']}
            xAxisKey="year"
            yAxisLabel="M€"
            onExport={handleExportCF}
            description="Confronto tra EBITDA e Free Cash Flow generato"
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rendiconto Finanziario</CardTitle>
              <button
                onClick={handleExportCF}
                className="text-sm text-primary hover:underline"
              >
                Esporta CSV
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Voce</th>
                      {results.annualData.map(annual => (
                        <th key={annual.year} className="text-right p-2">Y{annual.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">EBITDA</td>
                      {cashFlowData.map((cf, index) => (
                        <td key={index} className="p-2 text-right">{formatMillions(cf.EBITDA)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">CapEx</td>
                      {cashFlowData.map((cf, index) => (
                        <td key={index} className="p-2 text-right text-red-600">({formatMillions(Math.abs(cf.CapEx))})</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Δ Working Capital</td>
                      {cashFlowData.map((cf, index) => (
                        <td key={index} className={`p-2 text-right ${cf['Δ Working Capital'] >= 0 ? '' : 'text-red-600'}`}>
                          {cf['Δ Working Capital'] >= 0 ? formatMillions(cf['Δ Working Capital']) : `(${formatMillions(Math.abs(cf['Δ Working Capital']))})`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-blue-50">
                      <td className="p-2 font-bold">Free Cash Flow</td>
                      {cashFlowData.map((cf, index) => (
                        <td key={index} className={`p-2 text-right font-bold ${cf['Free Cash Flow'] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {cf['Free Cash Flow'] >= 0 ? formatMillions(cf['Free Cash Flow']) : `(${formatMillions(Math.abs(cf['Free Cash Flow']))})`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bs" className="space-y-6">
          <ChartCard
            title="Evoluzione Patrimoniale"
            subtitle="Assets e Cash position"
            data={balanceSheetData}
            type="stacked-bar"
            dataKeys={['Cash', 'Fixed Assets', 'Working Capital']}
            colors={['#10b981', '#3b82f6', '#f59e0b']}
            xAxisKey="year"
            yAxisLabel="M€"
            onExport={handleExportBS}
            description="Composizione degli asset nel tempo"
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Stato Patrimoniale Semplificato</CardTitle>
              <button
                onClick={handleExportBS}
                className="text-sm text-primary hover:underline"
              >
                Esporta CSV
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Voce</th>
                      {results.annualData.map(annual => (
                        <th key={annual.year} className="text-right p-2">Y{annual.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Cash</td>
                      {balanceSheetData.map((bs, index) => (
                        <td key={index} className="p-2 text-right">{formatMillions(bs.Cash)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Fixed Assets</td>
                      {balanceSheetData.map((bs, index) => (
                        <td key={index} className="p-2 text-right">{formatMillions(bs['Fixed Assets'])}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Working Capital</td>
                      {balanceSheetData.map((bs, index) => (
                        <td key={index} className="p-2 text-right">{formatMillions(bs['Working Capital'])}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="p-2 font-bold">Total Assets</td>
                      {balanceSheetData.map((bs, index) => (
                        <td key={index} className="p-2 text-right font-bold">{formatMillions(bs['Total Assets'])}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-green-50">
                      <td className="p-2 font-bold">Equity</td>
                      {balanceSheetData.map((bs, index) => (
                        <td key={index} className="p-2 text-right font-bold">{formatMillions(bs.Equity)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
