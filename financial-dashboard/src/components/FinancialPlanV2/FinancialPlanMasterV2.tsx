'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, DollarSign, FileText, Save, RefreshCw, AlertCircle, Calculator } from 'lucide-react';
import { TimelineConfigPanel } from './TimelineConfigPanel';
import { CalculationsPanel } from './CalculationsPanel';
import { ChartsPanel } from './ChartsPanel';
import { ExportPanel } from './ExportPanel';
import type { FinancialPlan, BusinessPhase, FundingRound } from '@/types/financialPlan.types';
import { FinancialPlanCalculator } from '@/services/financialPlan/calculations';
import toast from 'react-hot-toast';

export function FinancialPlanMasterV2() {
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [revenueModel, setRevenueModel] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [gtmData, setGtmData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calculate financial data
  const calculationResults = useMemo(() => {
    if (!financialPlan || !revenueModel || !budgetData || !gtmData) {
      return { success: false, error: 'Dati mancanti' };
    }

    const calculator = new FinancialPlanCalculator(
      {
        financialPlan,
        revenueModel,
        budgetData,
        gtmData,
        marketData
      },
      {
        startDate: financialPlan.configuration.businessPhases[0]?.startDate || '2025-01',
        horizonMonths: 120,
        scenario: 'base' as const
      }
    );

    return calculator.calculate();
  }, [financialPlan, revenueModel, budgetData, gtmData, marketData]);

  // Carica dati dal database
  useEffect(() => {
    loadFinancialPlan();
  }, []);

  const loadFinancialPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/database');
      const data = await response.json();
      
      if (data.financialPlan) {
        setFinancialPlan(data.financialPlan);
      } else {
        toast.error('FinancialPlan non trovato nel database. Esegui la migrazione!');
      }

      // Carica anche altri dati necessari per i calcoli
      if (data.revenueModel) {
        setRevenueModel(data.revenueModel);
      }
      if (data.budget) {
        setBudgetData(data.budget);
      }
      if (data.goToMarket) {
        setGtmData(data.goToMarket);
      }
      if (data.tamSamSom) {
        setMarketData(data.tamSamSom);
      }
    } catch (error) {
      console.error('Errore caricamento:', error);
      toast.error('Errore caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialPlan = async () => {
    if (!financialPlan) return;

    try {
      setSaving(true);
      
      // Leggi database completo
      const response = await fetch('http://localhost:3001/api/database');
      const fullDatabase = await response.json();
      
      // Aggiorna solo financialPlan
      fullDatabase.financialPlan = {
        ...financialPlan,
        lastUpdated: new Date().toISOString()
      };
      
      // Salva
      const saveResponse = await fetch('http://localhost:3001/api/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDatabase)
      });
      
      if (saveResponse.ok) {
        toast.success('✅ Configurazione salvata!');
      } else {
        throw new Error('Errore salvataggio');
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      toast.error('❌ Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const updatePhases = (updatedPhases: BusinessPhase[]) => {
    if (!financialPlan) return;
    
    setFinancialPlan({
      ...financialPlan,
      configuration: {
        ...financialPlan.configuration,
        businessPhases: updatedPhases
      }
    });
  };

  const updateFundingRounds = (updatedRounds: FundingRound[]) => {
    if (!financialPlan) return;
    
    setFinancialPlan({
      ...financialPlan,
      configuration: {
        ...financialPlan.configuration,
        fundingRounds: updatedRounds
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Caricamento Financial Plan...</p>
        </div>
      </div>
    );
  }

  if (!financialPlan) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-yellow-500" />
            <h3 className="text-xl font-bold">Financial Plan non trovato</h3>
            <p className="text-gray-600">
              Sembra che il database non abbia ancora la sezione <code className="bg-gray-100 px-2 py-1 rounded">financialPlan</code>.
            </p>
            <p className="text-sm text-gray-500">
              Esegui la migrazione con: <code className="bg-gray-100 px-2 py-1 rounded">npm run migrate:financial-plan</code>
            </p>
            <Button onClick={loadFinancialPlan}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Ricarica
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { configuration } = financialPlan;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">📈 Piano Finanziario Eco 3D</CardTitle>
              <CardDescription>
                Configurazione phase-based con calcoli automatici • Versione {financialPlan.version}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadFinancialPlan} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
              <Button onClick={saveFinancialPlan} disabled={saving} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fasi Business</p>
                <p className="text-2xl font-bold">{configuration.businessPhases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Funding Totale</p>
                <p className="text-2xl font-bold">
                  €{(configuration.fundingRounds.reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rounds</p>
                <p className="text-2xl font-bold">{configuration.fundingRounds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue Start</p>
                <p className="text-lg font-bold">
                  {configuration.businessPhases.find(p => p.revenueStartDate)?.revenueStartDate || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configurazione
          </TabsTrigger>
          <TabsTrigger value="calculations">
            <Calculator className="w-4 h-4 mr-2" />
            Dettagli Finanziari
          </TabsTrigger>
          <TabsTrigger value="charts">
            <FileText className="w-4 h-4 mr-2" />
            Grafici
          </TabsTrigger>
          <TabsTrigger value="export">
            <Save className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          {/* Timeline Interactive Configuration */}
          <TimelineConfigPanel
            phases={configuration.businessPhases}
            fundingRounds={configuration.fundingRounds}
            onPhasesUpdate={updatePhases}
            onFundingUpdate={updateFundingRounds}
          />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveFinancialPlan} disabled={saving} size="lg">
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva Tutte le Modifiche'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="calculations">
          {revenueModel && budgetData && gtmData ? (
            <CalculationsPanel
              financialPlan={financialPlan}
              revenueModel={revenueModel}
              budgetData={budgetData}
              gtmData={gtmData}
              marketData={marketData || {}}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-500">
                  Caricamento dati per calcoli...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Assicurati che il database contenga: revenueModel, budget, goToMarket
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="charts">
          {revenueModel && budgetData && gtmData ? (
            <ChartsPanel
              annualData={calculationResults?.data?.annual || []}
              monthlyData={calculationResults?.data?.monthly || []}
              viewMode="annual"
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-500">
                  Caricamento dati per grafici...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  I grafici richiedono i dati di calcolo completi
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          {calculationResults.success && calculationResults.data ? (
            <ExportPanel
              annualData={calculationResults.data.annual}
              monthlyData={calculationResults.data.monthly}
              financialPlan={financialPlan}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-500">
                  Caricamento dati per export...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  L&apos;export richiede i dati di calcolo completi
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
