'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scenario, AnnualMetrics } from '@/types/financial';
import { IncomeStatementDashboard } from './IncomeStatementDashboard';
import { CashFlowDashboard } from './CashFlowDashboard';
import { BalanceSheetView } from './BalanceSheetView';

interface FinancialPlanDashboardProps {
  scenario: Scenario;
  annualData: AnnualMetrics[];
}

export function FinancialPlanDashboard({ scenario, annualData }: FinancialPlanDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('income-statement');

  // Sync sub-tab with URL
  useEffect(() => {
    const subtabParam = searchParams.get('subtab');
    if (subtabParam && ['income-statement', 'cash-flow', 'balance-sheet'].includes(subtabParam)) {
      setActiveTab(subtabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const tabParam = searchParams.get('tab') || 'financial-plan';
    router.push(`/?tab=${tabParam}&subtab=${newTab}`);
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-blue-200 p-6 mb-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            📈 Piano Finanziario
          </h1>
          <p className="text-lg text-blue-700">
            Prospetti contabili completi: Conto Economico, Cash Flow e Stato Patrimoniale
          </p>
          <div className="mt-4 flex gap-2">
            <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
              <span className="text-sm font-semibold text-gray-700">Scenario:</span>
              <span className="ml-2 text-sm text-blue-600 font-bold capitalize">{scenario.name}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
              <span className="text-sm font-semibold text-gray-700">Proiezione:</span>
              <span className="ml-2 text-sm text-blue-600 font-bold">5 Anni</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Tabs per i 3 Financial Statements */}
      <div className="container mx-auto px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="income-statement" className="text-sm md:text-base">
              📊 Conto Economico
            </TabsTrigger>
            <TabsTrigger value="cash-flow" className="text-sm md:text-base">
              💸 Cash Flow
            </TabsTrigger>
            <TabsTrigger value="balance-sheet" className="text-sm md:text-base">
              🏦 Stato Patrimoniale
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Conto Economico (Income Statement) */}
          <TabsContent value="income-statement" className="mt-0">
            <IncomeStatementDashboard scenario={scenario} />
          </TabsContent>

          {/* Tab 2: Cash Flow */}
          <TabsContent value="cash-flow" className="mt-0">
            <CashFlowDashboard scenario={scenario} />
          </TabsContent>

          {/* Tab 3: Stato Patrimoniale (Balance Sheet) */}
          <TabsContent value="balance-sheet" className="mt-0">
            <BalanceSheetView 
              scenario={scenario}
              annualData={annualData}
            />
          </TabsContent>
        </Tabs>

        {/* Info Footer */}
        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">ℹ️ Prospetti Finanziari</CardTitle>
            <CardDescription>
              Informazioni sui tre prospetti contabili fondamentali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Conto Economico (P&L)</h4>
                <p className="text-sm text-gray-600">
                  Mostra ricavi, costi e redditività (EBITDA, EBIT, Net Income) nel tempo.
                  Risponde a: <strong>&quot;Quanto guadagniamo?&quot;</strong>
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-green-900 mb-2">💸 Cash Flow</h4>
                <p className="text-sm text-gray-600">
                  Traccia flussi di cassa operativi, investimenti e finanziamenti.
                  Risponde a: <strong>&quot;Abbiamo liquidità?&quot;</strong>
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-purple-900 mb-2">🏦 Stato Patrimoniale</h4>
                <p className="text-sm text-gray-600">
                  Fotografia di attività, passività e patrimonio netto a fine anno.
                  Risponde a: <strong>&quot;Quanto vale l&apos;azienda?&quot;</strong>
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>💡 Best Practice:</strong> I tre prospetti sono interconnessi. 
                Il Net Income del Conto Economico impatta il Cash Flow e il Patrimonio Netto dello Stato Patrimoniale.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
