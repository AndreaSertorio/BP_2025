'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, Save, RotateCcw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Scenario, AnnualMetrics } from '@/types/financial';
import { FinancialStatementsCalculator, BalanceSheetItem } from '@/lib/balanceSheet';
import { BalanceSheetTable } from './BalanceSheetTable';

interface FundingRound {
  year: number;
  quarter: number;
  type: string;
  amount: number;
  valuation: number;
  dilution: number;
  note: string;
  enabled: boolean;
}

interface BalanceSheetViewProps {
  scenario?: Scenario;
  annualData?: AnnualMetrics[];
}

export function BalanceSheetView({ scenario, annualData }: BalanceSheetViewProps = {}) {
  const { data, loading } = useDatabase();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Working Capital State
  const [dso, setDso] = useState(60);
  const [dpo, setDpo] = useState(45);
  const [inventoryTurnover, setInventoryTurnover] = useState(6);

  // Fixed Assets State
  const [capexPercent, setCapexPercent] = useState(5);
  const [depreciationRate, setDepreciationRate] = useState(20);
  const [initialPPE, setInitialPPE] = useState(0.5);
  const [intangibles, setIntangibles] = useState(0.3);

  // Initialize from database
  useEffect(() => {
    if (data?.statoPatrimoniale) {
      const sp = data.statoPatrimoniale;
      setDso(sp.workingCapital?.dso ?? 60);
      setDpo(sp.workingCapital?.dpo ?? 45);
      setInventoryTurnover(sp.workingCapital?.inventoryTurnover ?? 6);
      setCapexPercent(sp.fixedAssets?.capexAsPercentRevenue ?? 5);
      setDepreciationRate(sp.fixedAssets?.depreciationRate ?? 20);
      setInitialPPE(sp.fixedAssets?.initialPPE ?? 0.5);
      setIntangibles(sp.fixedAssets?.intangibles ?? 0.3);
    }
  }, [data]);

  // Calculate balance sheets using real data
  const balanceSheets = useMemo<BalanceSheetItem[]>(() => {
    if (!scenario || !annualData || annualData.length === 0) {
      return [];
    }
    const calculator = new FinancialStatementsCalculator(scenario, annualData);
    return calculator.calculateBalanceSheet();
  }, [scenario, annualData, dso, dpo, inventoryTurnover, capexPercent, depreciationRate]);

  // Calculate working capital metrics from Year 5 (or last available year)
  const workingCapitalMetrics = useMemo(() => {
    const lastYear = balanceSheets.length > 0 ? balanceSheets[balanceSheets.length - 1] : null;
    
    if (!lastYear) {
      // Fallback calculations if no data
      const annualRevenue = 10.0;
      const annualCOGS = 3.0;
      const accountsReceivable = (annualRevenue * dso) / 365;
      const inventory = annualCOGS / inventoryTurnover;
      const accountsPayable = (annualCOGS * dpo) / 365;
      const netWorkingCapital = accountsReceivable + inventory - accountsPayable;
      const cashConversionCycle = dso + (365 / inventoryTurnover) - dpo;
      
      return {
        accountsReceivable,
        inventory,
        accountsPayable,
        netWorkingCapital,
        cashConversionCycle
      };
    }

    // Real calculations from balance sheet
    const accountsReceivable = lastYear.assets.current.accountsReceivable;
    const inventory = lastYear.assets.current.inventory;
    const accountsPayable = lastYear.liabilities.current.accountsPayable;
    const netWorkingCapital = lastYear.assets.current.totalCurrent - lastYear.liabilities.current.totalCurrent;
    const cashConversionCycle = dso + (365 / inventoryTurnover) - dpo;

    return {
      accountsReceivable,
      inventory,
      accountsPayable,
      netWorkingCapital,
      cashConversionCycle
    };
  }, [balanceSheets, dso, dpo, inventoryTurnover]);

  // Save changes using API
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update working capital params
      const wcResponse = await fetch('http://localhost:3001/api/database/stato-patrimoniale/working-capital', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dso,
          dpo,
          inventoryTurnover
        })
      });

      if (!wcResponse.ok) {
        throw new Error('Failed to update working capital');
      }

      // Update fixed assets params
      const faResponse = await fetch('http://localhost:3001/api/database/stato-patrimoniale/fixed-assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capexAsPercentRevenue: capexPercent,
          depreciationRate,
          initialPPE,
          intangibles
        })
      });

      if (!faResponse.ok) {
        throw new Error('Failed to update fixed assets');
      }

      console.log('✅ Balance sheet configuration saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Error saving balance sheet config:', error);
      alert('Errore durante il salvataggio. Verifica che il server API sia attivo.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setDso(60);
    setDpo(45);
    setInventoryTurnover(6);
    setCapexPercent(5);
    setDepreciationRate(20);
    setInitialPPE(0.5);
    setIntangibles(0.3);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Stato Patrimoniale</h1>
          <p className="text-muted-foreground mt-1">
            Configura parametri Balance Sheet e visualizza proiezioni
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hai modifiche non salvate. Clicca &quot;Salva modifiche&quot; per rendere permanenti i cambiamenti.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📈 Overview</TabsTrigger>
          <TabsTrigger value="working-capital">💰 Working Capital</TabsTrigger>
          <TabsTrigger value="fixed-assets">🏭 Asset Fissi</TabsTrigger>
          <TabsTrigger value="funding">💼 Funding & Debt</TabsTrigger>
          <TabsTrigger value="balance-sheet">📋 Bilancio</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assets (Y5)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  €{balanceSheets.length > 0 
                    ? balanceSheets[balanceSheets.length - 1].assets.totalAssets.toFixed(1)
                    : '15.2'}M
                </div>
                <p className="text-xs text-muted-foreground">Attività totali</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Equity (Y5)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{balanceSheets.length > 0 
                    ? balanceSheets[balanceSheets.length - 1].equity.totalEquity.toFixed(1)
                    : '12.5'}M
                </div>
                <p className="text-xs text-muted-foreground">Patrimonio netto</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Debt (Y5)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  €{balanceSheets.length > 0 
                    ? (balanceSheets[balanceSheets.length - 1].liabilities.longTerm.longTermDebt +
                       balanceSheets[balanceSheets.length - 1].liabilities.current.shortTermDebt).toFixed(1)
                    : '1.0'}M
                </div>
                <p className="text-xs text-muted-foreground">Debiti totali</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">D/E Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balanceSheets.length > 0 
                    ? ((balanceSheets[balanceSheets.length - 1].liabilities.totalLiabilities /
                        balanceSheets[balanceSheets.length - 1].equity.totalEquity) || 0).toFixed(2)
                    : '0.08'}
                </div>
                <Badge variant="outline" className="mt-1">
                  {balanceSheets.length > 0 && 
                   (balanceSheets[balanceSheets.length - 1].liabilities.totalLiabilities /
                    balanceSheets[balanceSheets.length - 1].equity.totalEquity) < 0.5
                    ? 'Ottimo' : 'OK'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equity Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Evoluzione Patrimonio Netto</CardTitle>
                <CardDescription>Equity vs Debt nel tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={balanceSheets.map(bs => ({
                    year: `Y${bs.year}`,
                    Equity: bs.equity.totalEquity,
                    Debt: bs.liabilities.totalLiabilities,
                    Assets: bs.assets.totalAssets
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}M`} />
                    <Legend />
                    <Area type="monotone" dataKey="Equity" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="Debt" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Line type="monotone" dataKey="Assets" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Composition Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Composizione Attività</CardTitle>
                <CardDescription>Current vs Fixed Assets per anno</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={balanceSheets.map(bs => ({
                    year: `Y${bs.year}`,
                    "Att. Correnti": bs.assets.current.totalCurrent,
                    "Att. Fisse": bs.assets.fixed.netFixed
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}M`} />
                    <Legend />
                    <Bar dataKey="Att. Correnti" fill="#3b82f6" />
                    <Bar dataKey="Att. Fisse" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metriche Working Capital</CardTitle>
              <CardDescription>Impatto parametri sulla gestione operativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Crediti Clienti</div>
                  <div className="text-2xl font-bold mt-1">
                    €{workingCapitalMetrics.accountsReceivable.toFixed(2)}M
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {dso} giorni DSO
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Magazzino</div>
                  <div className="text-2xl font-bold mt-1">
                    €{workingCapitalMetrics.inventory.toFixed(2)}M
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {inventoryTurnover}x turnover/anno
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Debiti Fornitori</div>
                  <div className="text-2xl font-bold mt-1">
                    €{workingCapitalMetrics.accountsPayable.toFixed(2)}M
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {dpo} giorni DPO
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Net Working Capital</div>
                    <div className="text-sm text-muted-foreground">
                      Capitale circolante netto
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    €{workingCapitalMetrics.netWorkingCapital.toFixed(2)}M
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Cash Conversion Cycle: {Math.round(workingCapitalMetrics.cashConversionCycle)} giorni
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Working Capital Parameters */}
        <TabsContent value="working-capital" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parametri Working Capital</CardTitle>
              <CardDescription>
                Configura giorni incasso clienti, pagamento fornitori e rotazione magazzino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DSO Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      DSO - Days Sales Outstanding
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Giorni medi per incassare dai clienti (B2B tipico: 60-90gg)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{dso}</div>
                    <div className="text-xs text-muted-foreground">giorni</div>
                  </div>
                </div>
                <Slider
                  value={[dso]}
                  onValueChange={(value) => {
                    setDso(value[0]);
                    setHasChanges(true);
                  }}
                  min={30}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30gg (B2C)</span>
                  <span>90gg (B2B enterprise)</span>
                </div>
              </div>

              {/* DPO Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      DPO - Days Payable Outstanding
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Giorni medi per pagare i fornitori (ottimizza cash flow)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{dpo}</div>
                    <div className="text-xs text-muted-foreground">giorni</div>
                  </div>
                </div>
                <Slider
                  value={[dpo]}
                  onValueChange={(value) => {
                    setDpo(value[0]);
                    setHasChanges(true);
                  }}
                  min={30}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30gg (rapido)</span>
                  <span>60gg (dilazionato)</span>
                </div>
              </div>

              {/* Inventory Turnover */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Inventory Turnover
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Rotazioni magazzino per anno (6x = ~2 mesi stock)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{inventoryTurnover}</div>
                    <div className="text-xs text-muted-foreground">volte/anno</div>
                  </div>
                </div>
                <Slider
                  value={[inventoryTurnover]}
                  onValueChange={(value) => {
                    setInventoryTurnover(value[0]);
                    setHasChanges(true);
                  }}
                  min={4}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4x (~3 mesi)</span>
                  <span>12x (~1 mese)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Fixed Assets */}
        <TabsContent value="fixed-assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parametri Asset Fissi</CardTitle>
              <CardDescription>
                CapEx, ammortamenti e immobilizzazioni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">CapEx % Ricavi</label>
                    <p className="text-xs text-muted-foreground">
                      Investimenti annuali come % dei ricavi
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{capexPercent}%</div>
                  </div>
                </div>
                <Slider
                  value={[capexPercent]}
                  onValueChange={(value) => {
                    setCapexPercent(value[0]);
                    setHasChanges(true);
                  }}
                  min={2}
                  max={15}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Tasso Ammortamento</label>
                    <p className="text-xs text-muted-foreground">
                      % annuale (20% = vita utile 5 anni)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{depreciationRate}%</div>
                  </div>
                </div>
                <Slider
                  value={[depreciationRate]}
                  onValueChange={(value) => {
                    setDepreciationRate(value[0]);
                    setHasChanges(true);
                  }}
                  min={10}
                  max={33}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Funding */}
        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funding Rounds</CardTitle>
              <CardDescription>Piano di raccolta capitale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.statoPatrimoniale?.funding?.rounds?.map((round: FundingRound, idx: number) => (
                  round.enabled && (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{round.type}</div>
                          <div className="text-sm text-muted-foreground">
                            Anno {round.year}, Q{round.quarter}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">€{round.amount}M</div>
                          <div className="text-xs text-muted-foreground">
                            Val: €{round.valuation}M
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">{round.note}</div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Balance Sheet Table */}
        <TabsContent value="balance-sheet" className="space-y-6">
          <BalanceSheetTable balanceSheets={balanceSheets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
