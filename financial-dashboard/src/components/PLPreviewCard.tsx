/**
 * 📊 P&L PREVIEW CARD
 * 
 * Punto 3: Visualizzazione Margine Lordo, COGS e OPEX
 * 
 * Mostra preview Conto Economico con:
 * - Ricavi (da Revenue Model)
 * - COGS per linea di business
 * - Gross Margin e %
 * - OPEX breakdown
 * - EBITDA e margin %
 * 
 * @component
 */

'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  Package,
  Cloud,
  Users,
  Briefcase,
  LineChart
} from 'lucide-react';
import { 
  calculateBlendedCogs, 
  type CogsBreakdown 
} from '@/services/cogsCalculations';
import {
  calculateEbitda,
  type OpexBreakdown,
  type EbitdaCalculation
} from '@/services/opexCalculations';

// ============================================================================
// TYPES
// ============================================================================

export interface PLPreviewData {
  // Ricavi per linea di business
  hardwareRevenue: number;
  hardwareUnits: number;
  saasRevenue: number;
  saasUsers: number;
  consumablesRevenue?: number;
  servicesRevenue?: number;
  
  // COGS parameters
  hardwareUnitCost: number;
  hardwareMarginTarget?: number;
  saasCostPerUser?: number;
  
  // OPEX
  opex: OpexBreakdown;
  
  // Metadata
  year: number;
  quarter?: number;
}

interface PLPreviewCardProps {
  data: PLPreviewData;
  title?: string;
  showBreakdown?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PLPreviewCard({
  data,
  title = 'P&L Preview',
  showBreakdown = true,
  className = ''
}: PLPreviewCardProps) {
  
  // Calcola COGS
  const cogsBreakdown: CogsBreakdown = useMemo(() => {
    return calculateBlendedCogs({
      hardwareRevenue: data.hardwareRevenue,
      hardwareUnits: data.hardwareUnits,
      hardwareUnitCost: data.hardwareUnitCost,
      hardwareMarginTarget: data.hardwareMarginTarget,
      saasRevenue: data.saasRevenue,
      saasActiveUsers: data.saasUsers,
      saasCostPerUser: data.saasCostPerUser,
      consumablesRevenue: data.consumablesRevenue,
      servicesRevenue: data.servicesRevenue
    });
  }, [data]);
  
  // Calcola EBITDA
  const ebitdaCalc: EbitdaCalculation = useMemo(() => {
    return calculateEbitda(
      cogsBreakdown.total.revenue,
      cogsBreakdown.total.cogs,
      data.opex
    );
  }, [cogsBreakdown, data.opex]);
  
  // Formattazione valori
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              {data.quarter ? `Q${data.quarter}` : ''} {data.year}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="font-semibold mb-2">Conto Economico Semplificato</p>
              <p className="text-xs mb-2">
                Formula: <strong>EBITDA = Ricavi - COGS - OPEX</strong>
              </p>
              <p className="text-xs">
                EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization) 
                mostra la profittabilità operativa dell'azienda.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* P&L Cascata */}
      <div className="space-y-3">
        
        {/* 1. RICAVI */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-700">Ricavi Totali</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(cogsBreakdown.total.revenue)}
            </span>
          </div>
          
          {showBreakdown && (
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Hardware: {formatCurrency(cogsBreakdown.hardware.revenue)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>SaaS: {formatCurrency(cogsBreakdown.saas.revenue)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* 2. COGS */}
        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-gray-700">COGS (Costi Diretti)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>COGS</strong> (Cost of Goods Sold): costi diretti 
                      attribuibili alla produzione/erogazione del prodotto/servizio.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-2xl font-bold text-red-600">
              -{formatCurrency(cogsBreakdown.total.cogs)}
            </span>
          </div>
          
          {showBreakdown && (
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
              <div>Hardware: {formatCurrency(cogsBreakdown.hardware.totalCogs)}</div>
              <div>SaaS: {formatCurrency(cogsBreakdown.saas.totalCogs)}</div>
            </div>
          )}
        </div>
        
        {/* 3. GROSS MARGIN */}
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-700">Margine Lordo</span>
              <Badge variant="outline" className="ml-2 border-green-500 text-green-700">
                {formatPercentage(cogsBreakdown.total.grossMarginPct)}
              </Badge>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(cogsBreakdown.total.grossMargin)}
            </span>
          </div>
          
          {showBreakdown && (
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
              <div>
                HW Margin: {formatPercentage(cogsBreakdown.hardware.grossMarginPct)}
              </div>
              <div>
                SaaS Margin: {formatPercentage(cogsBreakdown.saas.grossMarginPct)}
              </div>
            </div>
          )}
        </div>
        
        {/* 4. OPEX */}
        <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-gray-700">OPEX (Costi Operativi)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>OPEX</strong> (Operating Expenses): costi operativi 
                      non direttamente attribuibili alla produzione (personale, marketing, R&D, G&A).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              -{formatCurrency(data.opex.total)}
            </span>
          </div>
          
          {showBreakdown && (
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Staff: {formatCurrency(data.opex.staff)}</span>
              </div>
              <div>R&D: {formatCurrency(data.opex.rd)}</div>
              <div>S&M: {formatCurrency(data.opex.salesMarketing)}</div>
              <div>G&A: {formatCurrency(data.opex.ga)}</div>
            </div>
          )}
        </div>
        
        {/* 5. EBITDA */}
        <div className={`p-4 rounded-lg border-2 ${
          ebitdaCalc.ebitda >= 0 
            ? 'bg-emerald-50 border-emerald-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LineChart className={`w-5 h-5 ${
                ebitdaCalc.ebitda >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`} />
              <span className="font-bold text-gray-900">EBITDA</span>
              <Badge 
                variant={ebitdaCalc.ebitda >= 0 ? 'default' : 'destructive'}
                className="ml-2"
              >
                {formatPercentage(ebitdaCalc.ebitdaPct)} margin
              </Badge>
            </div>
            <span className={`text-3xl font-bold ${
              ebitdaCalc.ebitda >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {formatCurrency(ebitdaCalc.ebitda)}
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
            <strong>Formula:</strong> EBITDA = Gross Margin - OPEX = 
            {formatCurrency(ebitdaCalc.grossMargin)} - {formatCurrency(data.opex.total)} = 
            {formatCurrency(ebitdaCalc.ebitda)}
          </div>
        </div>
        
      </div>
      
      {/* Footer Info */}
      {ebitdaCalc.ebitda < 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded text-xs text-yellow-900">
          <strong>⚠️ EBITDA negativo:</strong> L'azienda sta bruciando cassa. 
          Burn rate mensile stimato: {formatCurrency(Math.abs(ebitdaCalc.ebitda) / 12)}/mese
        </div>
      )}
      
      {ebitdaCalc.ebitda >= 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded text-xs text-green-900">
          <strong>✅ EBITDA positivo:</strong> L'azienda è operativamente profittevole!
        </div>
      )}
      
    </Card>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default PLPreviewCard;
