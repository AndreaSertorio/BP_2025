'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ScenarioSelector } from './ScenarioSelector';
import { ParameterControl } from './ParameterControl';
import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { ExportPanel } from './ExportPanel';
import { Financials } from './Financials';
import { SensitivityAnalysis } from './SensitivityAnalysis';
import { AdvancedMetricsView } from './AdvancedMetrics';
import { FinancialStatements } from './FinancialStatements';
import { CashFlowView } from './CashFlowView';
import { GrowthMetricsView } from './GrowthMetricsView';
import { ScenarioComparison } from './ScenarioComparison';
import ParametersPanel from './ParametersPanel';
import { ParametersOverview } from './ParametersOverview';
import { SectorMarketConfig } from './SectorMarketConfig';
import { MetricsExplainer } from './MetricsExplainer';
import { FunnelGTM } from './FunnelGTM';
import { Glossary } from './Glossary';
import { MercatoWrapper } from './MercatoWrapper';
import { BudgetWrapper } from './BudgetWrapper';
import { TamSamSomDashboard } from './TamSamSomDashboard';
import { BusinessPlanView } from './BusinessPlanView';
import { RevenueModelDashboard } from './RevenueModel';
import { FinancialPlanDashboard } from './FinancialPlanDashboard';
import { DatabaseInspector } from './DatabaseInspector';
import { TimelineView } from './TimelineView';
import { TeamManagementDashboard } from './TeamManagement/TeamManagementDashboard';
import { ValuePropositionDashboard } from './ValueProposition';
import { CompetitorAnalysisDashboard } from './CompetitorAnalysis';
import { DashboardQuickLinks } from './DashboardQuickLinks';
import { LoadingCard, LoadingChart } from './ui/loading-spinner';
import { MetricTooltip } from './ui/enhanced-tooltip';
import { exportCompleteScenario, exportMonthlyData, exportAnnualData, exportKPIs, exportAdvancedMetrics, exportCashFlowStatements, exportGrowthMetrics } from '@/lib/exportUtils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { defaultScenarios } from '@/data/scenarios';
import { FinancialCalculator } from '@/lib/calculations';
import { Scenario, ScenarioKey, FinancialAssumptions } from '@/types/financial';
import { downloadJSON } from '@/lib/utils';

export function MasterDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentScenarioKey, setCurrentScenarioKey] = useState<ScenarioKey>('base');
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [isCalculating, setIsCalculating] = useState(false);
  const [forceRecalc, setForceRecalc] = useState(0); // Force recalculation trigger
  const [comparisonScenarios] = useState<string[]>(['prudente', 'base', 'ambizioso']);
  
  // Sync active tab with URL query params
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const currentScenario = scenarios[currentScenarioKey];
  
  // Calculate results when scenario changes
  const calculationResults = useMemo(() => {
    if (!currentScenario || !currentScenario.drivers || !currentScenario.base) {
      console.error('Invalid scenario data:', currentScenario);
      return null;
    }
    
    setIsCalculating(true);
    try {
      const calculator = new FinancialCalculator(currentScenario);
      const results = calculator.calculate();
      // Log disabled to reduce console noise
      // console.log(`Calculated results for ${currentScenarioKey}:`, {
      //   totalRevenueY1: results.annualData[0]?.totalRev,
      //   totalRevenueY5: results.annualData[4]?.totalRev,
      //   ebitdaY1: results.annualData[0]?.ebitda,
      //   ebitdaY5: results.annualData[4]?.ebitda
      // });
      setIsCalculating(false);
      return results;
    } catch (error) {
      console.error(`Error calculating scenario ${currentScenarioKey}:`, error);
      setIsCalculating(false);
      return null;
    }
  }, [currentScenario, currentScenarioKey, forceRecalc]);

  // Calculate base scenario results for comparison (currently unused)
  // const baseResults = useMemo(() => {
  //   if (currentScenarioKey === 'base') return null;
  //   
  //   const baseScenario = scenarios.base;
  //   if (!baseScenario || !baseScenario.drivers || !baseScenario.base) {
  //     return null;
  //   }
  //   
  //   try {
  //     const calculator = new FinancialCalculator(baseScenario);
  //     return calculator.calculate();
  //   } catch (error) {
  //     console.error('Error calculating base scenario for comparison:', error);
  //     return null;
  //   }
  // }, [currentScenarioKey, scenarios.base]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    if (!calculationResults) return [];
    return calculationResults.annualData.map(annual => ({
      year: `Y${annual.year}`,
      'Ricavi Ricorrenti': annual.recurringRev,
      'Ricavi CapEx': annual.capexRev,
      'Totale': annual.totalRev
    }));
  }, [calculationResults]);

  const ebitdaChartData = useMemo(() => {
    if (!calculationResults) return [];
    return calculationResults.annualData.map(annual => ({
      year: `Y${annual.year}`,
      'EBITDA': annual.ebitda,
      'Margine Lordo': annual.grossMargin,
      'OPEX': -annual.opex
    }));
  }, [calculationResults]);

  const arrChartData = useMemo(() => {
    if (!calculationResults) return [];
    return calculationResults.annualData.map(annual => ({
      year: `Y${annual.year}`,
      'ARR': annual.arr
    }));
  }, [calculationResults]);

  const handleScenarioChange = (scenarioKey: ScenarioKey) => {
    setCurrentScenarioKey(scenarioKey);
  };

  const handleParameterChange = (parameter: keyof Scenario['drivers'], value: number) => {
    setScenarios(prev => ({
      ...prev,
      [currentScenarioKey]: {
        ...prev[currentScenarioKey],
        drivers: {
          ...prev[currentScenarioKey].drivers,
          [parameter]: value
        }
      }
    }));
  };

  const handleDuplicateToCustom = () => {
    setScenarios(prev => ({
      ...prev,
      custom: {
        ...prev[currentScenarioKey],
        key: 'custom',
        name: 'Scenario Custom'
      }
    }));
    setCurrentScenarioKey('custom');
  };

  const handleResetScenario = () => {
    setScenarios(prev => ({
      ...prev,
      [currentScenarioKey]: defaultScenarios[currentScenarioKey]
    }));
  };

  const handleExportScenario = () => {
    downloadJSON(currentScenario, `eco3d-scenario-${currentScenarioKey}-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportScenario = async (file: File) => {
    try {
      const text = await file.text();
      const importedScenario = JSON.parse(text) as Scenario;
      setScenarios(prev => ({
        ...prev,
        custom: {
          ...importedScenario,
          key: 'custom',
          name: 'Scenario Custom'
        }
      }));
      setCurrentScenarioKey('custom');
    } catch (error) {
      console.error('Error importing scenario:', error);
      alert('Errore nell\'importazione del file. Verificare che sia un file JSON valido.');
    }
  };

  const handleParameterReset = (parameter: keyof Scenario['drivers']) => {
    const defaultValue = defaultScenarios[currentScenarioKey].drivers[parameter];
    handleParameterChange(parameter, defaultValue as number);
  };

  // Handler functions for financial assumptions
  const handleAssumptionChange = (parameter: keyof FinancialAssumptions, value: number) => {
    setScenarios(prev => ({
      ...prev,
      [currentScenarioKey]: {
        ...prev[currentScenarioKey],
        assumptions: {
          ...prev[currentScenarioKey].assumptions,
          [parameter]: value
        }
      }
    }));
  };

  const handleAssumptionReset = (parameter: keyof FinancialAssumptions) => {
    const defaultValue = defaultScenarios[currentScenarioKey].assumptions?.[parameter];
    if (defaultValue !== undefined) {
      handleAssumptionChange(parameter, defaultValue as number);
    }
  };

  // Handler for market configuration updates
  const handleMarketConfigUpdate = (config: {
    selectedSectors: string[];
    customTAM: number;
    customSAM: number;
    sectorMarkets: FinancialAssumptions['sectorMarkets'];
  }) => {
    console.log('Market Config Update - Current Scenario:', currentScenarioKey);
    console.log('Selected Sectors:', config.selectedSectors);
    console.log('Sector Markets:', config.sectorMarkets);
    
    setScenarios(prev => {
      const updatedScenarios = { ...prev };
      
      // Update sector markets for all scenarios
      Object.keys(updatedScenarios).forEach(key => {
        if (updatedScenarios[key as ScenarioKey]?.assumptions) {
          updatedScenarios[key as ScenarioKey] = {
            ...updatedScenarios[key as ScenarioKey],
            assumptions: {
              ...updatedScenarios[key as ScenarioKey].assumptions!,
              sectorMarkets: config.sectorMarkets
            }
          };
        }
      });
      
      // Update individual sector scenarios with their specific data
      if (config.sectorMarkets.tiroide && updatedScenarios.tiroide?.assumptions) {
        updatedScenarios.tiroide = {
          ...updatedScenarios.tiroide,
          assumptions: {
            ...updatedScenarios.tiroide.assumptions!,
            tam: config.sectorMarkets.tiroide.tam,
            sam: config.sectorMarkets.tiroide.sam,
            samAnnualScans: config.sectorMarkets.tiroide.sam * 1000,
            sectorMarkets: config.sectorMarkets
          }
        };
      }
      
      if (config.sectorMarkets.rene && updatedScenarios.rene?.assumptions) {
        updatedScenarios.rene = {
          ...updatedScenarios.rene,
          assumptions: {
            ...updatedScenarios.rene.assumptions!,
            tam: config.sectorMarkets.rene.tam,
            sam: config.sectorMarkets.rene.sam,
            samAnnualScans: config.sectorMarkets.rene.sam * 1000,
            sectorMarkets: config.sectorMarkets
          }
        };
      }
      
      if (config.sectorMarkets.msk && updatedScenarios.msk?.assumptions) {
        updatedScenarios.msk = {
          ...updatedScenarios.msk,
          assumptions: {
            ...updatedScenarios.msk.assumptions!,
            tam: config.sectorMarkets.msk.tam,
            sam: config.sectorMarkets.msk.sam,
            samAnnualScans: config.sectorMarkets.msk.sam * 1000,
            sectorMarkets: config.sectorMarkets
          }
        };
      }
      
      if (config.sectorMarkets.senologia && updatedScenarios.senologia?.assumptions) {
        updatedScenarios.senologia = {
          ...updatedScenarios.senologia,
          assumptions: {
            ...updatedScenarios.senologia.assumptions!,
            tam: config.sectorMarkets.senologia.tam,
            sam: config.sectorMarkets.senologia.sam,
            samAnnualScans: config.sectorMarkets.senologia.sam * 1000,
            sectorMarkets: config.sectorMarkets
          }
        };
      }
      
      // Update "Completo" scenario with combined selected sectors only
      if (updatedScenarios.completo?.assumptions) {
        updatedScenarios.completo = {
          ...updatedScenarios.completo,
          marketConfig: {
            selectedSectors: config.selectedSectors,
            customTAM: config.customTAM,
            customSAM: config.customSAM
          },
          assumptions: {
            ...updatedScenarios.completo.assumptions!,
            tam: config.customTAM,
            sam: config.customSAM,
            samAnnualScans: config.customSAM * 1000,
            sectorMarkets: config.sectorMarkets
          }
        };
      }
      
      return updatedScenarios;
    });
    
    // Force recalculation by incrementing the trigger
    setForceRecalc(prev => prev + 1);
  };

  // Export functions for different data types
  const handleExportMonthly = () => {
    if (calculationResults) {
      exportMonthlyData(calculationResults, currentScenario.name);
    }
  };

  const handleExportAnnual = () => {
    if (calculationResults) {
      exportAnnualData(calculationResults, currentScenario.name);
    }
  };

  const handleExportKPIs = () => {
    if (calculationResults) {
      exportKPIs(calculationResults, currentScenario.name);
    }
  };

  const handleExportAdvanced = () => {
    if (calculationResults) {
      exportAdvancedMetrics(calculationResults, currentScenario.name);
    }
  };

  const handleExportCashFlow = () => {
    if (calculationResults) {
      exportCashFlowStatements(calculationResults, currentScenario.name);
    }
  };

  const handleExportGrowth = () => {
    if (calculationResults) {
      exportGrowthMetrics(calculationResults, currentScenario.name);
    }
  };

  const handleExportComplete = () => {
    if (calculationResults) {
      exportCompleteScenario(calculationResults, currentScenario.name);
    }
  };

  // Handler for tab changes - updates URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/?tab=${newTab}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <ScenarioSelector
        currentScenario={currentScenarioKey}
        onScenarioChange={handleScenarioChange}
        onDuplicateToCustom={handleDuplicateToCustom}
        onResetScenario={handleResetScenario}
        onExportScenario={handleExportScenario}
        onImportScenario={handleImportScenario}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="mercato">🌍 Mercato</TabsTrigger>
              <TabsTrigger value="tam-sam-som">🎯 TAM/SAM/SOM</TabsTrigger>
              <TabsTrigger value="value-proposition">🎯 Value Proposition</TabsTrigger>
              <TabsTrigger value="competitor-analysis">⚔️ Competitor Analysis</TabsTrigger>
              <TabsTrigger value="revenue-model">💼 Modello Business</TabsTrigger>
              <TabsTrigger value="financial-plan">📈 Piano Finanziario</TabsTrigger>
              <TabsTrigger value="budget">💰 Budget</TabsTrigger>
              <TabsTrigger value="team">👥 Team</TabsTrigger>
              <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
              <TabsTrigger value="database">🗄️ Database</TabsTrigger>
              <TabsTrigger value="business-plan">📄 Business Plan</TabsTrigger>
              <TabsTrigger value="varie">📚 Varie</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            {/* HEADER - IN COSTRUZIONE */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl">🚧</span>
                <h1 className="text-2xl font-bold text-blue-900">
                  Dashboard in Costruzione
                </h1>
              </div>
              <p className="text-center text-blue-700 mb-4">
                Stiamo costruendo una nuova interfaccia più intuitiva e focalizzata sulle metriche essenziali.
              </p>
              <div className="bg-white/60 rounded-lg p-4 max-w-xl mx-auto">
                <p className="text-sm text-gray-700 text-center">
                  Nel frattempo, usa i <strong>Quick Links</strong> qui sotto per navigare velocemente 
                  alle sezioni chiave dell&apos;applicazione.
                </p>
              </div>
            </div>

            {/* QUICK LINKS */}
            <DashboardQuickLinks />
          </div>
        </TabsContent>

        <TabsContent value="mercato" className="mt-0">
          <MercatoWrapper />
        </TabsContent>

        <TabsContent value="tam-sam-som" className="mt-0">
          <div className="container mx-auto px-6 py-8">
            <TamSamSomDashboard />
          </div>
        </TabsContent>

        <TabsContent value="value-proposition" className="mt-0">
          <ValuePropositionDashboard />
        </TabsContent>

        <TabsContent value="competitor-analysis" className="mt-0">
          <CompetitorAnalysisDashboard />
        </TabsContent>

        <TabsContent value="revenue-model" className="mt-0">
          <RevenueModelDashboard />
        </TabsContent>

        <TabsContent value="financial-plan" className="mt-0">
          <FinancialPlanDashboard 
            scenario={currentScenario}
            annualData={calculationResults?.annualData || []}
          />
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <BudgetWrapper />
        </TabsContent>

        <TabsContent value="team" className="mt-0">
          <TeamManagementDashboard />
        </TabsContent>

        <TabsContent value="database" className="mt-0">
          <DatabaseInspector />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <div className="container mx-auto p-6">
            <TimelineView />
          </div>
        </TabsContent>

        <TabsContent value="business-plan" className="mt-0">
          <BusinessPlanView />
        </TabsContent>

        <TabsContent value="funnel" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && <FunnelGTM results={calculationResults} />}
          </div>
        </TabsContent>

        <TabsContent value="old-dashboard-temp" className="mt-0">
          <div className="container mx-auto p-6 space-y-6">
            {/* Sector Selection */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-800">
                <Target className="h-5 w-5" />
                Seleziona Focus di Mercato
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button 
                  variant={currentScenarioKey === 'tiroide' ? 'default' : 'outline'}
                  onClick={() => handleScenarioChange('tiroide')}
                  className="text-sm"
                >
                  🦴 Tiroide
                  <br />
                  <span className="text-xs opacity-75">{(scenarios.tiroide.assumptions?.tam || 15000)/1000}M TAM</span>
                </Button>
                <Button 
                  variant={currentScenarioKey === 'rene' ? 'default' : 'outline'}
                  onClick={() => handleScenarioChange('rene')}
                  className="text-sm"
                >
                  🩺 Rene/Urologia
                  <br />
                  <span className="text-xs opacity-75">{(scenarios.rene.assumptions?.tam || 25000)/1000}M TAM</span>
                </Button>
                <Button 
                  variant={currentScenarioKey === 'msk' ? 'default' : 'outline'}
                  onClick={() => handleScenarioChange('msk')}
                  className="text-sm"
                >
                  🏃‍♂️ MSK
                  <br />
                  <span className="text-xs opacity-75">{(scenarios.msk.assumptions?.tam || 5000)/1000}M TAM</span>
                </Button>
                <Button 
                  variant={currentScenarioKey === 'senologia' ? 'default' : 'outline'}
                  onClick={() => handleScenarioChange('senologia')}
                  className="text-sm"
                >
                  🎗️ Senologia
                  <br />
                  <span className="text-xs opacity-75">{(scenarios.senologia.assumptions?.tam || 10000)/1000}M TAM</span>
                </Button>
                <Button 
                  variant={currentScenarioKey === 'completo' ? 'default' : 'outline'}
                  onClick={() => handleScenarioChange('completo')}
                  className="text-sm"
                >
                  🌍 Completo
                  <br />
                  <span className="text-xs opacity-75">{(scenarios.completo.assumptions?.tam || 55000)/1000}M TAM</span>
                </Button>
              </div>
            </div>
            
            {/* Financial Assumptions - Top Priority */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
                <DollarSign className="h-6 w-6" />
                Parametri di Mercato Essenziali
                <Badge variant="outline" className="ml-2">{currentScenario.name}</Badge>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                📊 <strong>Catena di calcolo:</strong> TAM/SAM + Market Penetration → Leads → 
                Funnel (L2D×D2P×P2D) → Deals → Ricavi (MRR/ARR) → Unit Economics (CAC/LTV) → Cash Flow (Burn/Runway)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Market Size */}
                <ParameterControl
                  parameter="tam"
                  value={currentScenario.assumptions?.tam || 63800}
                  onChange={(value) => handleAssumptionChange('tam', value)}
                  onReset={() => handleAssumptionReset('tam')}
                  disabled={isCalculating}
                />
                <ParameterControl
                  parameter="sam"
                  value={currentScenario.assumptions?.sam || 31900}
                  onChange={(value) => handleAssumptionChange('sam', value)}
                  onReset={() => handleAssumptionReset('sam')}
                  disabled={isCalculating}
                />
                
                {/* Market Penetration */}
                <ParameterControl
                  parameter="marketPenetrationY1"
                  value={currentScenario.drivers.marketPenetrationY1 || 0.00008}
                  onChange={(value) => handleParameterChange('marketPenetrationY1', value)}
                  onReset={() => handleParameterReset('marketPenetrationY1')}
                  disabled={isCalculating}
                />
                <ParameterControl
                  parameter="marketPenetrationY5"
                  value={currentScenario.drivers.marketPenetrationY5 || 0.0005}
                  onChange={(value) => handleParameterChange('marketPenetrationY5', value)}
                  onReset={() => handleParameterReset('marketPenetrationY5')}
                  disabled={isCalculating}
                />
                
                {/* Initial Cash */}
                <ParameterControl
                  parameter="initialCash"
                  value={currentScenario.assumptions?.initialCash || 2.0}
                  onChange={(value) => handleAssumptionChange('initialCash', value)}
                  onReset={() => handleAssumptionReset('initialCash')}
                  disabled={isCalculating}
                />
              </div>
            </div>
        {/* 🎯 METRICHE ESSENZIALI - Solo priorità ALTA da Guida.md */}
        <div className="space-y-6">
          
          {/* 1️⃣ REVENUE METRICS */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCalculating ? (
                <LoadingCard title="MRR" description="Loading revenue data..." />
              ) : (
                <div className="relative">
                  <MetricTooltip
                    metric="MRR (Monthly Recurring Revenue)"
                    value={`€${((calculationResults?.monthlyData[59]?.recurringRev || 0) / 12).toFixed(2)}M/mese`}
                    description="Ricavo mensile ricorrente da contratti in abbonamento - metrica fondamentale per tracciare la crescita MoM"
                    formula="MRR = (Clienti Subscription × ARPA Sub / 12) + (Clienti CapEx × ARPA Maint / 12)"
                    benchmark={{
                      good: "Crescita >10% MoM",
                      average: "Crescita 5-10% MoM",
                      poor: "Crescita <5% MoM"
                    }}
                  />
                  <KPICard
                    title="MRR M60 (M€/mese)"
                    value={(calculationResults?.monthlyData[59]?.recurringRev || 0) / 12}
                    format="millions"
                  />
                </div>
              )}
              <div className="relative">
                <MetricTooltip
                  metric="ARR (Annual Recurring Revenue)"
                  value={`€${(calculationResults?.kpis.arrRunRateM60 || 0).toFixed(1)}M/anno`}
                  description="Ricavo ricorrente annualizzato - run-rate annuo per valutazioni a lungo termine"
                  formula="ARR = MRR × 12"
                  benchmark={{
                    good: ">€5M (venture scale)",
                    average: "€1-5M (early growth)",
                    poor: "<€1M (seed stage)"
                  }}
                />
                <KPICard
                  title="ARR Y5 (M€/anno)"
                  value={calculationResults?.kpis.arrRunRateM60 || 0}
                  format="millions"
                />
              </div>
            </div>
          </div>

          {/* 2️⃣ UNIT ECONOMICS */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Unit Economics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <MetricTooltip
                  metric="CAC (Customer Acquisition Cost)"
                  value={`€${(calculationResults?.advancedMetrics?.unitEconomics.cac || 0).toFixed(0)}`}
                  description="Costo medio per acquisire un nuovo cliente - indica efficienza di marketing/vendite"
                  formula="CAC = Total S&M OPEX / Nuovi Clienti acquisiti"
                  benchmark={{
                    good: "<€1,000",
                    average: "€1,000-3,000",
                    poor: ">€3,000"
                  }}
                />
                <KPICard
                  title="CAC (€)"
                  value={calculationResults?.advancedMetrics?.unitEconomics.cac || 0}
                  format="number"
                />
              </div>
              
              <div className="relative">
                <MetricTooltip
                  metric="LTV (Lifetime Value)"
                  value={`€${(calculationResults?.advancedMetrics?.unitEconomics.ltv || 0).toFixed(0)}`}
                  description="Valore totale generato in media da un cliente durante l'intera relazione"
                  formula="LTV = ARPU × Average Lifetime = ARPU × (12 / Churn Annuale)"
                  benchmark={{
                    good: ">€10,000",
                    average: "€5,000-10,000",
                    poor: "<€5,000"
                  }}
                />
                <KPICard
                  title="LTV (€)"
                  value={calculationResults?.advancedMetrics?.unitEconomics.ltv || 0}
                  format="number"
                />
              </div>

              <div className="relative">
                <MetricTooltip
                  metric="LTV/CAC Ratio"
                  value={`${(calculationResults?.advancedMetrics?.unitEconomics.ltvCacRatio || 0).toFixed(1)}x`}
                  description="Rapporto tra valore cliente e costo acquisizione - metrica chiave di sostenibilità del business"
                  formula="LTV/CAC Ratio = LTV ÷ CAC"
                  benchmark={{
                    good: ">5:1 (venture scale) ✅",
                    average: "3-5:1 (sostenibile)",
                    poor: "<3:1 (NON sostenibile) ❌"
                  }}
                />
                <KPICard
                  title="LTV/CAC Ratio"
                  value={calculationResults?.advancedMetrics?.unitEconomics.ltvCacRatio || 0}
                  format="number"
                />
              </div>

              <div className="relative">
                <MetricTooltip
                  metric="Churn Rate"
                  value={`${((calculationResults?.advancedMetrics?.unitEconomics.churnRate || 0) * 100).toFixed(1)}%`}
                  description="Percentuale di clienti persi annualmente - churn elevato erode la crescita"
                  formula="Churn Rate = % clienti abbandonati nel periodo"
                  benchmark={{
                    good: "<5% annuale",
                    average: "5-10% annuale",
                    poor: ">10% annuale"
                  }}
                />
                <KPICard
                  title="Churn Rate (annuale)"
                  value={calculationResults?.advancedMetrics?.unitEconomics.churnRate || 0}
                  format="percent"
                />
              </div>
            </div>
          </div>

          {/* 3️⃣ CASH FLOW & SUSTAINABILITY */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Cash Flow & Sustainability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MetricTooltip
                  metric="Burn Rate"
                  value={`€${Math.abs(calculationResults?.advancedMetrics?.cashFlow.burnRate || 0).toFixed(1)}k/mese`}
                  description="Perdita netta mensile di cassa - velocità con cui l'azienda consuma liquidità"
                  formula="Net Burn Rate = (OPEX mensile - Ricavi mensili)"
                  benchmark={{
                    good: "Decrescente nel tempo",
                    average: "Stabile",
                    poor: "Crescente"
                  }}
                />
                <KPICard
                  title="Burn Rate (k€/mese)"
                  value={Math.abs(calculationResults?.advancedMetrics?.cashFlow.burnRate || 0)}
                  format="number"
                />
              </div>

              <div className="relative">
                <MetricTooltip
                  metric="Runway"
                  value={`${Math.round(calculationResults?.advancedMetrics?.cashFlow.runway || 0)} mesi`}
                  description="Mesi di operatività rimanenti con la cassa disponibile al tasso di burn corrente"
                  formula="Runway = Cassa Disponibile ÷ Net Burn Rate mensile"
                  benchmark={{
                    good: ">18 mesi",
                    average: "12-18 mesi",
                    poor: "<12 mesi (rischio) ⚠️"
                  }}
                />
                <KPICard
                  title="Runway (mesi)"
                  value={calculationResults?.advancedMetrics?.cashFlow.runway || 0}
                  format="number"
                />
              </div>

              <div className="relative">
                <MetricTooltip
                  metric="Break-Even Point"
                  value={`Anno ${calculationResults?.kpis.breakEvenYearEBITDA || 'N/A'}`}
                  description="Anno in cui l'azienda diventa profittabile (EBITDA ≥ 0) - milestone fondamentale per sostenibilità"
                  formula="Primo anno con EBITDA ≥ 0 (Ricavi = Costi Totali)"
                  benchmark={{
                    good: "Anno 2-3",
                    average: "Anno 3-4",
                    poor: ">Anno 5"
                  }}
                />
                <KPICard
                  title="Break-Even (EBITDA)"
                  value={calculationResults?.kpis.breakEvenYearEBITDA || 0}
                  format="year"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-3 space-y-6">
            <ChartCard
              title="Ricavi per Anno"
              subtitle="Evoluzione dei ricavi ricorrenti e CapEx"
              data={revenueChartData}
              type="stacked-bar"
              dataKeys={['Ricavi Ricorrenti', 'Ricavi CapEx']}
              colors={['#3b82f6', '#10b981']}
              xAxisKey="year"
              yAxisLabel="M€"
              description="Mostra l'evoluzione dei ricavi ricorrenti (software/servizi) e CapEx (hardware) nel tempo"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="EBITDA e Margini"
                subtitle="Profittabilità nel tempo"
                data={ebitdaChartData}
                type="line"
                dataKeys={['EBITDA', 'Margine Lordo']}
                colors={['#ef4444', '#10b981']}
                xAxisKey="year"
                yAxisLabel="M€"
                description="Evoluzione dell'EBITDA e del margine lordo"
              />

              <ChartCard
                title="ARR Growth"
                subtitle="Crescita ricavi ricorrenti"
                data={arrChartData}
                type="line"
                dataKeys={['ARR']}
                colors={['#8b5cf6']}
                xAxisKey="year"
                yAxisLabel="M€"
                description="Crescita dell'Annual Recurring Revenue"
              />
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Parametri Rapidi
              </h3>
              
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                <ParameterControl
                  parameter="leadMult"
                  value={currentScenario.drivers.leadMult}
                  onChange={(value) => handleParameterChange('leadMult', value)}
                  onReset={() => handleParameterReset('leadMult')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="l2d"
                  value={currentScenario.drivers.l2d}
                  onChange={(value) => handleParameterChange('l2d', value)}
                  onReset={() => handleParameterReset('l2d')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="d2p"
                  value={currentScenario.drivers.d2p}
                  onChange={(value) => handleParameterChange('d2p', value)}
                  onReset={() => handleParameterReset('d2p')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="p2d"
                  value={currentScenario.drivers.p2d}
                  onChange={(value) => handleParameterChange('p2d', value)}
                  onReset={() => handleParameterReset('p2d')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="dealMult"
                  value={currentScenario.drivers.dealMult}
                  onChange={(value) => handleParameterChange('dealMult', value)}
                  onReset={() => handleParameterReset('dealMult')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="arpaSub"
                  value={currentScenario.drivers.arpaSub}
                  onChange={(value) => handleParameterChange('arpaSub', value)}
                  onReset={() => handleParameterReset('arpaSub')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="arpaMaint"
                  value={currentScenario.drivers.arpaMaint}
                  onChange={(value) => handleParameterChange('arpaMaint', value)}
                  onReset={() => handleParameterReset('arpaMaint')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="gmRecurring"
                  value={currentScenario.drivers.gmRecurring}
                  onChange={(value) => handleParameterChange('gmRecurring', value)}
                  onReset={() => handleParameterReset('gmRecurring')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="mixCapEx"
                  value={currentScenario.drivers.mixCapEx}
                  onChange={(value) => handleParameterChange('mixCapEx', value)}
                  onReset={() => handleParameterReset('mixCapEx')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="devicePrice"
                  value={currentScenario.drivers.devicePrice}
                  onChange={(value) => handleParameterChange('devicePrice', value)}
                  onReset={() => handleParameterReset('devicePrice')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="churnAnnual"
                  value={currentScenario.drivers.churnAnnual || 0.08}
                  onChange={(value) => handleParameterChange('churnAnnual', value)}
                  onReset={() => handleParameterReset('churnAnnual')}
                  disabled={isCalculating}
                />

                <ParameterControl
                  parameter="growthQoqPostQ8"
                  value={currentScenario.drivers.growthQoqPostQ8 || 0.12}
                  onChange={(value) => handleParameterChange('growthQoqPostQ8', value)}
                  onReset={() => handleParameterReset('growthQoqPostQ8')}
                  disabled={isCalculating}
                />
              </div>
              
              {/* Financial Assumptions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Assumptions (Previously Hard-Coded)
                </h3>
                
                {/* Financial Assumptions are now in the main Dashboard tab */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Export Panel - Moved to bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <ExportPanel
            onExportMonthly={handleExportMonthly}
            onExportAnnual={handleExportAnnual}
            onExportKPIs={handleExportKPIs}
            onExportAdvanced={handleExportAdvanced}
            onExportCashFlow={handleExportCashFlow}
            onExportGrowth={handleExportGrowth}
            onExportComplete={handleExportComplete}
            scenarioName={currentScenario.name}
          />
        </div>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && <FunnelGTM results={calculationResults} />}
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && <Financials results={calculationResults} />}
          </div>
        </TabsContent>

        <TabsContent value="sensitivity" className="mt-0">
          <div className="container mx-auto p-6">
            <SensitivityAnalysis baseScenario={currentScenario} />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && calculationResults.advancedMetrics && (
              <AdvancedMetricsView 
                metrics={calculationResults.advancedMetrics}
                monthlyData={calculationResults.monthlyData}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="statements" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && (
              <FinancialStatements 
                scenario={currentScenario}
                annualData={calculationResults.annualData}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && calculationResults.cashFlowStatements && calculationResults.monthlyCashFlows ? (
              <CashFlowView 
                cashFlowStatements={calculationResults.cashFlowStatements}
                monthlyCashFlows={calculationResults.monthlyCashFlows}
              />
            ) : (
              <LoadingChart height={400} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="growth" className="mt-0">
          <div className="container mx-auto p-6">
            {calculationResults && calculationResults.growthMetrics ? (
              <GrowthMetricsView 
                growthMetrics={calculationResults.growthMetrics}
              />
            ) : (
              <LoadingChart height={400} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-0">
          <div className="container mx-auto p-6">
            <ScenarioComparison 
              scenarios={comparisonScenarios.map(key => ({
                name: scenarios[key as ScenarioKey]?.name || key,
                key,
                results: (() => {
                  try {
                    const calculator = new FinancialCalculator(scenarios[key as ScenarioKey]);
                    return calculator.calculate();
                  } catch (error) {
                    console.error(`Error calculating ${key}:`, error);
                    return calculationResults!;
                  }
                })(),
                color: key === 'prudente' ? '#ef4444' : key === 'base' ? '#3b82f6' : '#10b981'
              }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="mt-0">
          <div className="container mx-auto p-6">
            <ParametersPanel 
              scenario={currentScenario}
              onScenarioChange={handleScenarioChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-0">
          <div className="container mx-auto p-6">
            <ParametersOverview scenario={currentScenario} />
          </div>
        </TabsContent>

        <TabsContent value="market-config" className="mt-0">
          <div className="container mx-auto p-6">
            <SectorMarketConfig 
              scenario={currentScenario}
              onUpdateMarketConfig={handleMarketConfigUpdate}
            />
          </div>
        </TabsContent>

        <TabsContent value="calculations" className="mt-0">
          <div className="container mx-auto p-6">
            <MetricsExplainer scenario={currentScenario} />
          </div>
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <div className="container mx-auto p-6">
            <Glossary />
          </div>
        </TabsContent>

        {/* Tab Varie - Solo Glossario */}
        <TabsContent value="varie" className="mt-0">
          <div className="container mx-auto p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">📚 Varie</h2>
              <p className="text-sm text-blue-700">
                Risorse aggiuntive e terminologia tecnica per supportare la comprensione del piano finanziario.
              </p>
            </div>

            <Glossary />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
