'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, FileJson, Database, TrendingUp, DollarSign, BarChart3, Activity } from 'lucide-react';

interface ExportPanelProps {
  onExportMonthly: () => void;
  onExportAnnual: () => void;
  onExportKPIs: () => void;
  onExportAdvanced: () => void;
  onExportCashFlow: () => void;
  onExportGrowth: () => void;
  onExportComplete: () => void;
  scenarioName: string;
}

export function ExportPanel({
  onExportMonthly,
  onExportAnnual,
  onExportKPIs,
  onExportAdvanced,
  onExportCashFlow,
  onExportGrowth,
  onExportComplete,
  scenarioName
}: ExportPanelProps) {
  const exportOptions = [
    {
      title: 'Monthly Data',
      description: '60 months of detailed monthly metrics',
      icon: BarChart3,
      format: 'CSV',
      onClick: onExportMonthly,
      color: 'text-blue-600'
    },
    {
      title: 'Annual Summary',
      description: '5-year annual financial summary',
      icon: TrendingUp,
      format: 'CSV',
      onClick: onExportAnnual,
      color: 'text-green-600'
    },
    {
      title: 'Key KPIs',
      description: 'Essential performance indicators',
      icon: Activity,
      format: 'CSV',
      onClick: onExportKPIs,
      color: 'text-purple-600'
    },
    {
      title: 'Advanced Metrics',
      description: 'CAC, LTV, NPV, IRR, break-even analysis',
      icon: Database,
      format: 'CSV',
      onClick: onExportAdvanced,
      color: 'text-orange-600'
    },
    {
      title: 'Cash Flow',
      description: 'Annual cash flow statements',
      icon: DollarSign,
      format: 'CSV',
      onClick: onExportCashFlow,
      color: 'text-emerald-600'
    },
    {
      title: 'Growth Metrics',
      description: 'CAGR, Rule of 40, growth rates',
      icon: TrendingUp,
      format: 'CSV',
      onClick: onExportGrowth,
      color: 'text-indigo-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current scenario:</span>
          <Badge variant="outline">{scenarioName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.title}
                variant="outline"
                size="sm"
                onClick={option.onClick}
                className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-4 w-4 ${option.color}`} />
                  <span className="font-medium text-sm">{option.title}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {option.format}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {option.description}
                </p>
              </Button>
            );
          })}
        </div>

        {/* Complete Export */}
        <div className="border-t pt-4">
          <Button
            onClick={onExportComplete}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <FileJson className="h-4 w-4" />
            Export Complete Scenario
            <Badge variant="secondary" className="ml-2">JSON</Badge>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Includes all data, calculations, and metadata for comprehensive analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
