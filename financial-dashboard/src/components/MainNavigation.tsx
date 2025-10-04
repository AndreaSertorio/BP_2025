import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MasterDashboard } from './MasterDashboard';
import { FunnelGTM } from './FunnelGTM';
import { Financials } from './Financials';
import { SensitivityAnalysis } from './SensitivityAnalysis';
import { Scenario, CalculationResults } from '@/types/financial';

interface MainNavigationProps {
  currentScenario: Scenario;
  calculationResults: CalculationResults;
  onScenarioChange: (scenario: Scenario) => void;
}

export function MainNavigation({ 
  currentScenario, 
  calculationResults, 
  onScenarioChange 
}: MainNavigationProps) {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger value="dashboard" className="px-6">
                Master Dashboard
              </TabsTrigger>
              <TabsTrigger value="funnel" className="px-6">
                Funnel & GTM
              </TabsTrigger>
              <TabsTrigger value="financials" className="px-6">
                Financials
              </TabsTrigger>
              <TabsTrigger value="sensitivity" className="px-6">
                Sensitivity
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <MasterDashboard />
        </TabsContent>

        <TabsContent value="funnel" className="mt-0">
          <div className="container mx-auto p-6">
            <FunnelGTM results={calculationResults} />
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-0">
          <div className="container mx-auto p-6">
            <Financials results={calculationResults} />
          </div>
        </TabsContent>

        <TabsContent value="sensitivity" className="mt-0">
          <div className="container mx-auto p-6">
            <SensitivityAnalysis baseScenario={currentScenario} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
