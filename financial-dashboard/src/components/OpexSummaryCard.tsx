/**
 * 💰 OPEX SUMMARY CARD
 * 
 * Punto 3: Analytics OPEX per Tab Budget
 * 
 * Mostra:
 * - OPEX totali per categoria (Staff, R&D, S&M, G&A)
 * - Confronto con benchmark industry MedTech
 * - Trend annuale
 * - OPEX % su ricavi (se disponibili)
 * 
 * @component
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';
import {
  Users,
  Lightbulb,
  TrendingUp,
  Building,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { OPEX_BENCHMARKS } from '@/services/opexCalculations';

// ============================================================================
// TYPES
// ============================================================================

export interface OpexData {
  staff: number;
  rd: number;
  salesMarketing: number;
  ga: number;
  total: number;
}

export interface OpexSummaryData {
  year: number;
  opex: OpexData;
  revenue?: number;  // Opzionale per calcolare %
}

interface OpexSummaryCardProps {
  data: OpexSummaryData[];
  stage?: 'early_stage' | 'growth_stage' | 'mature';
  title?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OpexSummaryCard({
  data,
  stage = 'growth_stage',
  title = 'OPEX Summary & Benchmarks',
  className = ''
}: OpexSummaryCardProps) {
  
  // Calcola totali multi-anno
  const totalOpex = data.reduce((sum, d) => sum + d.opex.total, 0);
  const avgYearlyOpex = totalOpex / data.length;
  
  // Ultimo anno per comparazione
  const lastYearData = data[data.length - 1];
  const firstYearData = data[0];
  
  // Growth rate OPEX
  const opexGrowth = firstYearData.opex.total > 0
    ? ((lastYearData.opex.total / firstYearData.opex.total - 1) * 100)
    : 0;
  
  // Calcola % per categoria (ultimo anno)
  const staffPct = (lastYearData.opex.staff / lastYearData.opex.total) * 100;
  const rdPct = (lastYearData.opex.rd / lastYearData.opex.total) * 100;
  const smPct = (lastYearData.opex.salesMarketing / lastYearData.opex.total) * 100;
  const gaPct = (lastYearData.opex.ga / lastYearData.opex.total) * 100;
  
  // Benchmarks per stage
  const benchmarks = OPEX_BENCHMARKS[stage];
  
  // Confronta con benchmark
  const comparisons = [
    {
      category: 'R&D',
      actual: rdPct,
      benchmark: benchmarks.rd_pct,
      icon: Lightbulb
    },
    {
      category: 'Sales & Marketing',
      actual: smPct,
      benchmark: benchmarks.sales_marketing_pct,
      icon: TrendingUp
    },
    {
      category: 'G&A',
      actual: gaPct,
      benchmark: benchmarks.ga_pct,
      icon: Building
    }
  ];
  
  // Helper per status
  const getStatus = (actual: number, benchmark: number) => {
    const delta = Math.abs(actual - benchmark);
    if (delta <= 5) return 'aligned';
    return actual > benchmark ? 'over' : 'under';
  };
  
  // Formatters
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPct = (value: number) => `${value.toFixed(1)}%`;
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              Analisi {data.length} anni • Stage: {stage.replace('_', ' ')}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="font-semibold mb-2">OPEX Summary & Benchmarks</p>
              <p className="text-xs mb-2">
                Analizza la distribuzione delle spese operative per categoria e 
                confronta con benchmark industry MedTech.
              </p>
              <p className="text-xs">
                Categorie: Staff (personale), R&D (ricerca), S&M (vendite/marketing), G&A (amministrazione).
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">OPEX Totale {lastYearData.year}</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(lastYearData.opex.total)}
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Media Annuale</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(avgYearlyOpex)}
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
          <div className={`text-2xl font-bold ${opexGrowth > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {opexGrowth > 0 ? '+' : ''}{formatPct(opexGrowth)}
          </div>
        </div>
      </div>
      
      {/* Breakdown per Categoria */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          Breakdown {lastYearData.year}
        </h4>
        
        <div className="space-y-3">
          {/* Staff */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold">Staff</div>
                <div className="text-xs text-gray-500">Personale</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(lastYearData.opex.staff)}</div>
              <div className="text-xs text-gray-500">{formatPct(staffPct)}</div>
            </div>
          </div>
          
          {/* R&D */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-semibold">R&D</div>
                <div className="text-xs text-gray-500">Ricerca & Sviluppo</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(lastYearData.opex.rd)}</div>
              <div className="text-xs text-gray-500">{formatPct(rdPct)}</div>
            </div>
          </div>
          
          {/* Sales & Marketing */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold">Sales & Marketing</div>
                <div className="text-xs text-gray-500">Vendite & Marketing</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(lastYearData.opex.salesMarketing)}</div>
              <div className="text-xs text-gray-500">{formatPct(smPct)}</div>
            </div>
          </div>
          
          {/* G&A */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-semibold">G&A</div>
                <div className="text-xs text-gray-500">General & Administrative</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(lastYearData.opex.ga)}</div>
              <div className="text-xs text-gray-500">{formatPct(gaPct)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benchmark Comparison */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📊 Confronto Benchmark Industry
          <Badge variant="outline">{stage.replace('_', ' ')}</Badge>
        </h4>
        
        <div className="space-y-3">
          {comparisons.map((comp) => {
            const status = getStatus(comp.actual, comp.benchmark);
            const delta = comp.actual - comp.benchmark;
            const Icon = comp.icon;
            
            return (
              <div key={comp.category} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-sm">{comp.category}</span>
                  </div>
                  {status === 'aligned' && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aligned
                    </Badge>
                  )}
                  {status === 'over' && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Over {formatPct(Math.abs(delta))}
                    </Badge>
                  )}
                  {status === 'under' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Under {formatPct(Math.abs(delta))}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Actual:</span>
                    <span className="font-bold ml-1">{formatPct(comp.actual)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Benchmark:</span>
                    <span className="font-bold ml-1">{formatPct(comp.benchmark)}</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      status === 'aligned' ? 'bg-green-600' : 
                      status === 'over' ? 'bg-red-600' : 
                      'bg-yellow-600'
                    }`}
                    style={{ width: `${Math.min(comp.actual, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-600">
        <p>
          <strong>💡 Benchmarks MedTech:</strong> Early stage (pre-revenue): R&D 60%, S&M 15%, G&A 25%. 
          Growth stage (post-revenue): R&D 30%, S&M 40%, G&A 15%. Mature: R&D 15%, S&M 25%, G&A 10%.
        </p>
      </div>
      
    </Card>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default OpexSummaryCard;
