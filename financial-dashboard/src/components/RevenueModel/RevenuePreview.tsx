'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  DollarSign, 
  Repeat, 
  Package, 
  Info,
  ArrowRight 
} from 'lucide-react';

interface RevenuePreviewProps {
  hardwareEnabled: boolean;
  hardwareAsp: number;
  hardwareUnitCost: number;
  saasEnabled: boolean;
  saasMonthlyFee: number;
  saasAnnualFee: number;
  saasGrossMarginPct: number;
}

export function RevenuePreview({
  hardwareEnabled,
  hardwareAsp,
  hardwareUnitCost,
  saasEnabled,
  saasMonthlyFee,
  saasAnnualFee,
  saasGrossMarginPct
}: RevenuePreviewProps) {
  
  // Assunzioni per preview (100 dispositivi venduti anno 1)
  const UNITS_Y1 = 100;
  const ACTIVE_DEVICES = 80; // 80% dei venduti diventano attivi SaaS
  
  // Calcoli Hardware
  const hardwareRevenue = hardwareEnabled ? UNITS_Y1 * hardwareAsp : 0;
  const hardwareCogs = hardwareEnabled ? UNITS_Y1 * hardwareUnitCost : 0;
  const hardwareGrossProfit = hardwareRevenue - hardwareCogs;
  const hardwareGrossMarginPct = hardwareRevenue > 0 ? (hardwareGrossProfit / hardwareRevenue) * 100 : 0;
  
  // Calcoli SaaS
  const saasMrr = saasEnabled ? ACTIVE_DEVICES * saasMonthlyFee : 0;
  const saasArr = saasEnabled ? ACTIVE_DEVICES * saasAnnualFee : 0;
  const saasCogs = saasArr * (1 - saasGrossMarginPct);
  const saasGrossProfit = saasArr - saasCogs;
  
  // Totali
  const totalRevenue = hardwareRevenue + saasArr;
  const totalGrossProfit = hardwareGrossProfit + saasGrossProfit;
  const totalGrossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  
  // ARPA
  const arpa = saasEnabled && ACTIVE_DEVICES > 0 ? saasArr / ACTIVE_DEVICES : 0;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Preview Ricavi Anno 1</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Proiezione basata su {UNITS_Y1} dispositivi venduti anno 1, 
                con {ACTIVE_DEVICES} ({((ACTIVE_DEVICES/UNITS_Y1)*100).toFixed(0)}%) che attivano abbonamento SaaS
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Badge variant="outline" className="bg-white">
          Simulazione
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Hardware Revenue */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">Hardware</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            €{(hardwareRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-gray-500">
            {UNITS_Y1} unità × €{(hardwareAsp / 1000).toFixed(0)}K
          </div>
          {hardwareEnabled && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Margine:</span>
                <span className="font-semibold text-green-600">{hardwareGrossMarginPct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
        
        {/* SaaS MRR */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">MRR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            €{(saasMrr / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-500">
            {ACTIVE_DEVICES} devices × €{saasMonthlyFee}
          </div>
          {saasEnabled && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Margine:</span>
                <span className="font-semibold text-green-600">{(saasGrossMarginPct * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
        
        {/* SaaS ARR */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">ARR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            €{(saasArr / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-gray-500">
            MRR × 12 mesi
          </div>
          {saasEnabled && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">ARPA:</span>
                <span className="font-semibold text-purple-600">€{arpa.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg border-2 border-green-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-700" />
            <span className="text-xs font-medium text-green-800 uppercase">Totale Anno 1</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            €{(totalRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-green-700">
            Hardware + SaaS
          </div>
          <div className="mt-2 pt-2 border-t border-green-200">
            <div className="flex justify-between text-xs">
              <span className="text-green-700">Margine Medio:</span>
              <span className="font-semibold text-green-800">{totalGrossMarginPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Breakdown Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-medium text-gray-700 mb-2">📦 Hardware</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Ricavi:</span>
                <span className="font-medium">€{(hardwareRevenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>COGS:</span>
                <span className="font-medium text-red-600">-€{(hardwareCogs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Gross Profit:</span>
                <span className="font-semibold text-green-600">€{(hardwareGrossProfit / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">💻 SaaS</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Ricavi (ARR):</span>
                <span className="font-medium">€{(saasArr / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>COGS:</span>
                <span className="font-medium text-red-600">-€{(saasCogs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Gross Profit:</span>
                <span className="font-semibold text-green-600">€{(saasGrossProfit / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600">
          Questi valori sono proiezioni indicative basate sui parametri configurati. 
          Le proiezioni complete multi-anno sono disponibili nella sezione <strong>Forecast</strong>.
        </p>
      </div>
    </Card>
  );
}
