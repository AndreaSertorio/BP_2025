'use client';

import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';
import { ParameterControl } from './ParameterControl';
import { KPICard } from './KPICard';
import { ChartCard } from './ChartCard';
import { ExportPanel } from './ExportPanel';
import { LoadingCard } from './ui/loading-spinner';
import { MetricTooltip } from './ui/enhanced-tooltip';
import { Scenario, ScenarioKey, CalculationResults } from '@/types/financial';

interface OldDashboardProps {
  currentScenario: Scenario;
  currentScenarioKey: ScenarioKey;
  scenarios: Record<string, Scenario>;
  isCalculating: boolean;
  calculationResults: CalculationResults | null;
  revenueChartData: Array<{
    year: string;
    'Ricavi Ricorrenti': number;
    'Ricavi CapEx': number;
    'Totale': number;
  }>;
  ebitdaChartData: Array<{
    year: string;
    EBITDA: number;
    'Margine Lordo': number;
  }>;
  arrChartData: Array<{
    year: string;
    ARR: number;
  }>;
  handleScenarioChange: (key: ScenarioKey) => void;
  handleAssumptionChange: (key: string, value: number) => void;
  handleAssumptionReset: (key: string) => void;
  handleParameterChange: (key: string, value: number) => void;
  handleParameterReset: (key: string) => void;
  handleExportMonthly: () => void;
  handleExportAnnual: () => void;
  handleExportKPIs: () => void;
  handleExportAdvanced: () => void;
  handleExportCashFlow: () => void;
  handleExportGrowth: () => void;
  handleExportComplete: () => void;
}

export function OldDashboard({
  currentScenario,
  currentScenarioKey,
  scenarios,
  isCalculating,
  calculationResults,
  revenueChartData,
  ebitdaChartData,
  arrChartData,
  handleScenarioChange,
  handleAssumptionChange,
  handleAssumptionReset,
  handleParameterChange,
  handleParameterReset,
  handleExportMonthly,
  handleExportAnnual,
  handleExportKPIs,
  handleExportAdvanced,
  handleExportCashFlow,
  handleExportGrowth,
  handleExportComplete,
}: OldDashboardProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* DASHBOARD VECCHIA - MANTENUTA PER RIFERIMENTO */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-amber-800 mb-2">
          📦 Dashboard Vecchia (Archivio)
        </h2>
        <p className="text-sm text-amber-700">
          Questa è la dashboard originale completa. È stata archiviata per mantenere tutte le funzionalità 
          esistenti mentre viene sviluppata la nuova dashboard semplificata.
        </p>
      </div>

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
  );
}
