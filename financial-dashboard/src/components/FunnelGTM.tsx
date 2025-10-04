'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartCard } from './ChartCard';
import { CalculationResults } from '@/types/financial';
import { formatNumber, downloadCSV } from '@/lib/utils';

interface FunnelGTMProps {
  results: CalculationResults;
}

export function FunnelGTM({ results }: FunnelGTMProps) {
  // Prepare funnel visualization data
  const funnelData = useMemo(() => {
    const totalLeads = results.monthlyData.reduce((sum, m) => sum + m.leads, 0);
    const totalDeals = results.monthlyData.reduce((sum, m) => sum + m.deals, 0);
    
    // Simulate demo and pilot data based on conversion rates
    const totalDemos = totalLeads * 0.20; // 20% conversion rate
    const totalPilots = totalDemos * 0.50; // 50% conversion rate
    
    return [
      { stage: 'Leads', count: Math.round(totalLeads), conversion: 100 },
      { stage: 'Demo', count: Math.round(totalDemos), conversion: 20 },
      { stage: 'Pilot', count: Math.round(totalPilots), conversion: 10 },
      { stage: 'Deal', count: Math.round(totalDeals), conversion: 6 }
    ];
  }, [results]);

  // Monthly funnel data for charts
  const monthlyFunnelData = useMemo(() => {
    return results.monthlyData.slice(0, 24).map((month, index) => ({
      month: `M${index + 1}`,
      'Leads': month.leads,
      'Deals': Math.round(month.deals),
      'Devices Shipped': Math.round(month.devicesShipped),
      'Active Accounts': Math.round(month.accountsActive)
    }));
  }, [results]);

  // Quarterly summary
  const quarterlyData = useMemo(() => {
    const quarters = [];
    for (let q = 0; q < 8; q++) {
      const startMonth = q * 3;
      const endMonth = Math.min(startMonth + 3, results.monthlyData.length);
      const quarterMonths = results.monthlyData.slice(startMonth, endMonth);
      
      if (quarterMonths.length > 0) {
        quarters.push({
          quarter: `Q${q + 1}`,
          leads: quarterMonths.reduce((sum, m) => sum + m.leads, 0),
          deals: quarterMonths.reduce((sum, m) => sum + m.deals, 0),
          devices: quarterMonths.reduce((sum, m) => sum + m.devicesShipped, 0),
          accounts: quarterMonths[quarterMonths.length - 1].accountsActive
        });
      }
    }
    return quarters;
  }, [results]);

  const handleExportMonthly = () => {
    downloadCSV(monthlyFunnelData, 'eco3d-monthly-funnel.csv');
  };

  const handleExportQuarterly = () => {
    downloadCSV(quarterlyData, 'eco3d-quarterly-summary.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Funnel & Go-to-Market</h2>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel di Conversione (60 mesi)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage: any, index: number) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(stage.count)} ({stage.conversion}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-8">
                  <div
                    className="bg-primary h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium transition-all duration-300"
                    style={{ width: `${stage.conversion}%` }}
                  >
                    {stage.conversion}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Leads e Deals Mensili"
          subtitle="Primi 24 mesi"
          data={monthlyFunnelData}
          type="line"
          dataKeys={['Leads', 'Deals']}
          colors={['#3b82f6', '#10b981']}
          xAxisKey="month"
          yAxisLabel="Numero"
          onExport={handleExportMonthly}
          description="Evoluzione mensile di leads generati e deals conclusi"
        />

        <ChartCard
          title="Dispositivi e Account Attivi"
          subtitle="Primi 24 mesi"
          data={monthlyFunnelData}
          type="line"
          dataKeys={['Devices Shipped', 'Active Accounts']}
          colors={['#f59e0b', '#8b5cf6']}
          xAxisKey="month"
          yAxisLabel="Numero"
          description="Crescita di dispositivi spediti e account attivi"
        />
      </div>

      {/* Monthly Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tabella Mensile (primi 24 mesi)</CardTitle>
          <button
            onClick={handleExportMonthly}
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
                  <th className="text-left p-2">Mese</th>
                  <th className="text-right p-2">Leads</th>
                  <th className="text-right p-2">Deals</th>
                  <th className="text-right p-2">Devices Shipped</th>
                  <th className="text-right p-2">Account Attivi</th>
                </tr>
              </thead>
              <tbody>
                {monthlyFunnelData.map((row: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.month}</td>
                    <td className="p-2 text-right">{formatNumber(row.Leads)}</td>
                    <td className="p-2 text-right">{formatNumber(row.Deals)}</td>
                    <td className="p-2 text-right">{formatNumber(row['Devices Shipped'])}</td>
                    <td className="p-2 text-right">{formatNumber(row['Active Accounts'])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riepilogo Trimestrale</CardTitle>
          <button
            onClick={handleExportQuarterly}
            className="text-sm text-primary hover:underline"
          >
            Esporta CSV
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterlyData.map((quarter: any) => (
              <div key={quarter.quarter} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">{quarter.quarter}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads:</span>
                    <span className="font-medium">{formatNumber(quarter.leads)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deals:</span>
                    <span className="font-medium">{formatNumber(quarter.deals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Devices:</span>
                    <span className="font-medium">{formatNumber(quarter.devices)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Attivi:</span>
                    <span className="font-medium">{formatNumber(quarter.accounts)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
