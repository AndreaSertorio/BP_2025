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
  Database,
  Edit3,
  Server
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface RevenuePreviewProps {
  hardwareEnabled: boolean;
  hardwareAsp: number;
  hardwareUnitCost: number;
  saasEnabled: boolean;
  
  // Modello Per Dispositivo
  saasPerDeviceEnabled: boolean;
  saasMonthlyFee: number;
  saasAnnualFee: number;
  saasPerDeviceGrossMarginPct: number;
  saasActivationRate: number; // % dispositivi venduti che diventano attivi SaaS
  
  // Modello Per Scansione
  saasPerScanEnabled: boolean;
  saasFeePerScan: number;
  saasRevSharePct: number;
  saasScansPerDevicePerMonth: number;
  saasPerScanGrossMarginPct: number;
  
  // Modello Tiered
  saasTieredEnabled: boolean;
  saasTiers: Array<{
    scansUpTo: number;
    monthlyFee: number;
    description: string;
    distributionPct?: number; // 🆕 % di dispositivi in questo tier
  }>;
  saasTieredGrossMarginPct: number;
  
  // 🆕 Unità dispositivi per tutti i 5 anni dal TAM/SAM/SOM
  dispositiviUnita?: {
    som1: number;
    som2: number;
    som3: number;
    som4: number;
    som5: number;
  };
  selectedYear: 1 | 2 | 3 | 4 | 5;
  setSelectedYear: (year: 1 | 2 | 3 | 4 | 5) => void;
}

export function RevenuePreview({
  hardwareEnabled,
  hardwareAsp,
  hardwareUnitCost,
  saasEnabled,
  saasPerDeviceEnabled,
  saasMonthlyFee,
  saasAnnualFee,
  saasPerDeviceGrossMarginPct,
  saasActivationRate,
  saasPerScanEnabled,
  saasFeePerScan,
  saasRevSharePct,
  saasScansPerDevicePerMonth,
  saasPerScanGrossMarginPct,
  saasTieredEnabled,
  saasTiers,
  saasTieredGrossMarginPct,
  dispositiviUnita,
  selectedYear,
  setSelectedYear
}: RevenuePreviewProps) {
  
  // 🏛️ DUAL-MODE: Dati Reali vs Simulazione Manuale
  const [useRealData, setUseRealData] = React.useState(true); // DEFAULT: Dati Reali ✅
  const [manualDevices, setManualDevices] = React.useState(100);
  
  // 🆕 Leggi unità per l'anno selezionato dal database
  const devicesForSelectedYear = dispositiviUnita ? dispositiviUnita[`som${selectedYear}` as keyof typeof dispositiviUnita] : 0;
  
  // Determina quale sorgente usare
  const hasRealData = devicesForSelectedYear && devicesForSelectedYear > 0;
  const realDataDevices = hasRealData ? devicesForSelectedYear : 0;
  
  // Se modalità Real Data: usa SOM dell'anno selezionato o fallback 100
  // Se modalità Manual: usa input utente
  const UNITS_YEAR = useRealData 
    ? (realDataDevices > 0 ? realDataDevices : 100)  // Real data or fallback
    : manualDevices;                                   // Manual input
  
  const isUsingRealData = useRealData && hasRealData;
  const ACTIVE_DEVICES = Math.round(UNITS_YEAR * saasActivationRate); // % configurabile dei venduti diventano attivi SaaS
  
  // Calcoli Hardware
  const hardwareRevenue = hardwareEnabled ? UNITS_YEAR * hardwareAsp : 0;
  const hardwareCogs = hardwareEnabled ? UNITS_YEAR * hardwareUnitCost : 0;
  const hardwareGrossProfit = hardwareRevenue - hardwareCogs;
  const hardwareGrossMarginPct = hardwareRevenue > 0 ? (hardwareGrossProfit / hardwareRevenue) * 100 : 0;
  
  // ==========================================================================
  // CALCOLI SAAS MULTI-MODEL
  // ==========================================================================
  
  // 1. MODELLO PER DISPOSITIVO
  const perDeviceMrr = (saasEnabled && saasPerDeviceEnabled) ? ACTIVE_DEVICES * saasMonthlyFee : 0;
  const perDeviceArr = (saasEnabled && saasPerDeviceEnabled) ? ACTIVE_DEVICES * saasAnnualFee : 0;
  const perDeviceCogs = perDeviceArr * (1 - saasPerDeviceGrossMarginPct);
  const perDeviceGrossProfit = perDeviceArr - perDeviceCogs;
  
  // 2. MODELLO PER SCANSIONE
  const totalScansPerMonth = ACTIVE_DEVICES * saasScansPerDevicePerMonth;
  const totalScansPerYear = totalScansPerMonth * 12;
  const perScanGrossRevenue = (saasEnabled && saasPerScanEnabled) ? totalScansPerYear * saasFeePerScan : 0;
  const perScanNetRevenue = perScanGrossRevenue * (1 - saasRevSharePct); // Dopo revenue share
  const perScanCogs = perScanNetRevenue * (1 - saasPerScanGrossMarginPct);
  const perScanGrossProfit = perScanNetRevenue - perScanCogs;
  const perScanMrr = perScanNetRevenue / 12;
  
  // 3. MODELLO TIERED - con distribuzione pesata per tier
  let tieredArr = 0;
  if (saasEnabled && saasTieredEnabled && saasTiers.length > 0) {
    // Calcola ARR pesato per ogni tier in base alla distributionPct
    tieredArr = saasTiers.reduce((total, tier) => {
      const distribution = tier.distributionPct || 0;
      const devicesInTier = Math.round(ACTIVE_DEVICES * (distribution / 100));
      return total + (devicesInTier * tier.monthlyFee * 12);
    }, 0);
  }
  const tieredCogs = tieredArr * (1 - saasTieredGrossMarginPct);
  const tieredGrossProfit = tieredArr - tieredCogs;
  const tieredMrr = tieredArr / 12;
  
  // AGGREGATI SAAS
  const saasMrr = perDeviceMrr + perScanMrr + tieredMrr;
  const saasArr = perDeviceArr + perScanNetRevenue + tieredArr;
  const saasCogs = perDeviceCogs + perScanCogs + tieredCogs;
  const saasGrossProfit = perDeviceGrossProfit + perScanGrossProfit + tieredGrossProfit;
  const saasGrossMarginPct = saasArr > 0 ? saasGrossProfit / saasArr : 0;
  
  // Totali
  const totalRevenue = hardwareRevenue + saasArr;
  const totalGrossProfit = hardwareGrossProfit + saasGrossProfit;
  const totalGrossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  
  // OPEX stimato (25% del Gross Profit come baseline conservativa)
  const estimatedOpex = totalGrossProfit * 0.25;
  const netProfit = totalGrossProfit - estimatedOpex;
  const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // ARPA
  const arpa = saasEnabled && ACTIVE_DEVICES > 0 ? saasArr / ACTIVE_DEVICES : 0;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Preview Ricavi</h3>
            {/* 🆕 Selettore Anno */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[1, 2, 3, 4, 5].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year as 1 | 2 | 3 | 4 | 5)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Y{year}
                </button>
              ))}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">
                  📊 Fonte dati dispositivi:
                </p>
                {useRealData ? (
                  <div className="space-y-1">
                    {hasRealData ? (
                      <>
                        <p className="text-green-400">
                          ✅ <strong>Dati reali dal TAM/SAM/SOM</strong>
                        </p>
                        <p className="text-xs opacity-90">
                          • Dispositivi Anno 1 (SOM): <strong>{realDataDevices}</strong>
                        </p>
                        <p className="text-xs opacity-90">
                          • Calcolati da: TAM → SAM → SOM
                        </p>
                        <p className="text-xs opacity-90">
                          • Regioni attive nel calcolo TAM/SAM/SOM
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-yellow-400">
                          ⚠️ <strong>Fallback: 100 unità (dati non disponibili)</strong>
                        </p>
                        <p className="text-xs opacity-90">
                          Vai a TAM/SAM/SOM → Vista Dispositivi per calcolare i dati reali
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-blue-400">
                      ✏️ <strong>Simulazione Manuale</strong>
                    </p>
                    <p className="text-xs opacity-90">
                      • Dispositivi impostati manualmente: <strong>{manualDevices}</strong>
                    </p>
                    <p className="text-xs opacity-90">
                      • Usa questa modalità per analisi &quot;what-if&quot;
                    </p>
                  </div>
                )}
                <p className="text-xs opacity-75 border-t border-gray-600 pt-2">
                  • Conversione SaaS: {ACTIVE_DEVICES} devices ({((ACTIVE_DEVICES/UNITS_YEAR)*100).toFixed(0)}%)
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* 🎛️ DUAL-MODE CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Mode Badge */}
          {useRealData ? (
            hasRealData ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <Database className="h-3 w-3 mr-1" />
                Dati Reali
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                ⚠️ Fallback
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              <Edit3 className="h-3 w-3 mr-1" />
              Simulazione
            </Badge>
          )}
          
          {/* Toggle Switch */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span className={`text-xs font-medium ${useRealData ? 'text-green-700' : 'text-gray-400'}`}>
              Reali
            </span>
            <Switch 
              checked={!useRealData}
              onCheckedChange={(checked) => setUseRealData(!checked)}
            />
            <span className={`text-xs font-medium ${!useRealData ? 'text-blue-700' : 'text-gray-400'}`}>
              Manuale
            </span>
          </div>
          
          {/* Manual Input (visible only in manual mode) */}
          {!useRealData && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">Dispositivi:</label>
              <Input 
                type="number"
                value={manualDevices}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setManualDevices(val);
                  }
                }}
                className="w-24 h-8 text-sm"
                min={0}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Hardware Revenue */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">Hardware</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">📦 Ricavi Hardware Anno 1:</p>
                  <p className="font-mono">
                    = Dispositivi SOM Y1 × ASP Medio
                  </p>
                  <p className="font-mono text-blue-400">
                    = {UNITS_YEAR} × €{hardwareAsp.toLocaleString()}
                  </p>
                  <p className="font-mono text-green-400">
                    = €{hardwareRevenue.toLocaleString()}
                  </p>
                  <div className="border-t border-gray-600 pt-1 mt-1">
                    <p className="opacity-75">
                      {isUsingRealData ? '✅ Dispositivi da TAM/SAM/SOM' : '⚠️ Usando 100 unità di default'}
                    </p>
                    <p className="opacity-75">
                      ASP da: database.configurazioneTamSamSom.ecografi.prezzoMedioDispositivo
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            €{(hardwareRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-gray-500">
            {UNITS_YEAR} unità × €{(hardwareAsp / 1000).toFixed(0)}K
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
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">MRR</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">💻 Monthly Recurring Revenue (TOTALE):</p>
                  <p className="font-mono text-green-400 font-bold">
                    = €{saasMrr.toLocaleString()}/mese
                  </p>
                  <div className="border-t border-gray-600 pt-2 mt-2 space-y-1">
                    <p className="font-semibold text-blue-400">Breakdown per Modello:</p>
                    {saasPerDeviceEnabled && perDeviceMrr > 0 && (
                      <p className="opacity-90">
                        • Per-Device: €{perDeviceMrr.toLocaleString()}/mese ({((perDeviceMrr/saasMrr)*100).toFixed(0)}%)
                      </p>
                    )}
                    {saasPerScanEnabled && perScanMrr > 0 && (
                      <p className="opacity-90">
                        • Per-Scan: €{perScanMrr.toLocaleString()}/mese ({((perScanMrr/saasMrr)*100).toFixed(0)}%)
                      </p>
                    )}
                    {saasTieredEnabled && tieredMrr > 0 && (
                      <p className="opacity-90">
                        • Tiered: €{tieredMrr.toLocaleString()}/mese ({((tieredMrr/saasMrr)*100).toFixed(0)}%)
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-600 pt-1 mt-1">
                    <p className="opacity-75">
                      Devices Attivi = {UNITS_YEAR} venduti × {(saasActivationRate*100).toFixed(0)}% conversione
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
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
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600 uppercase">ARR</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">📅 Annual Recurring Revenue (TOTALE):</p>
                  <p className="font-mono text-green-400 font-bold">
                    = €{saasArr.toLocaleString()}/anno
                  </p>
                  <div className="border-t border-gray-600 pt-2 mt-2 space-y-1">
                    <p className="font-semibold text-blue-400">Breakdown per Modello:</p>
                    {saasPerDeviceEnabled && perDeviceArr > 0 && (
                      <p className="opacity-90">
                        • Per-Device: €{perDeviceArr.toLocaleString()}/anno ({((perDeviceArr/saasArr)*100).toFixed(0)}%)
                      </p>
                    )}
                    {saasPerScanEnabled && perScanNetRevenue > 0 && (
                      <p className="opacity-90">
                        • Per-Scan: €{perScanNetRevenue.toLocaleString()}/anno ({((perScanNetRevenue/saasArr)*100).toFixed(0)}%)
                      </p>
                    )}
                    {saasTieredEnabled && tieredArr > 0 && (
                      <p className="opacity-90">
                        • Tiered: €{tieredArr.toLocaleString()}/anno ({((tieredArr/saasArr)*100).toFixed(0)}%)
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-600 pt-1 mt-1">
                    <p className="opacity-75">
                      ARPA medio (per device): €{arpa.toLocaleString()}/anno
                    </p>
                    <p className="opacity-75">
                      {ACTIVE_DEVICES} dispositivi attivi
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-green-700" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">💰 Ricavi Totali Anno 1:</p>
                  <p className="font-mono">
                    = Ricavi Hardware + Ricavi SaaS (ARR)
                  </p>
                  <p className="font-mono text-blue-400">
                    = €{hardwareRevenue.toLocaleString()}
                  </p>
                  <p className="font-mono text-purple-400">
                    + €{saasArr.toLocaleString()}
                  </p>
                  <p className="font-mono text-green-400 font-bold">
                    = €{totalRevenue.toLocaleString()}
                  </p>
                  <div className="border-t border-green-700 pt-1 mt-1">
                    <p className="opacity-75">
                      Mix: {((hardwareRevenue / totalRevenue) * 100).toFixed(0)}% Hardware + {((saasArr / totalRevenue) * 100).toFixed(0)}% SaaS
                    </p>
                    <p className="opacity-75">
                      Margine Medio Ponderato: {totalGrossMarginPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
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
      
      {/* Breakdown Details - Cards */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          {/* Hardware Card */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-blue-600" />
              <div className="font-semibold text-gray-800">Hardware</div>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Ricavi:</span>
                <span className="font-medium">€{(hardwareRevenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>COGS:</span>
                <span className="font-medium text-red-600">-€{(hardwareCogs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="font-medium">Gross Profit:</span>
                <span className="font-bold text-green-600">€{(hardwareGrossProfit / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 bg-blue-100 px-2 py-1 rounded">
                <span>Margine Lordo:</span>
                <span className="font-semibold">{hardwareGrossMarginPct.toFixed(1)}%</span>
              </div>
            </div>
          </Card>
          
          {/* SaaS Card */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-purple-600" />
              <div className="font-semibold text-gray-800">SaaS</div>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Ricavi (ARR):</span>
                <span className="font-medium">€{(saasArr / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>COGS:</span>
                <span className="font-medium text-red-600">-€{(saasCogs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2 mt-2">
                <span className="font-medium">Gross Profit:</span>
                <span className="font-bold text-green-600">€{(saasGrossProfit / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 bg-purple-100 px-2 py-1 rounded">
                <span>Margine Lordo:</span>
                <span className="font-semibold">{(saasGrossMarginPct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </Card>
          
          {/* Total Card */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-green-700" />
              <div className="font-semibold text-gray-800">Totale (Lordo + Netto)</div>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Gross Profit:</span>
                <span className="font-semibold text-green-600">€{(totalGrossProfit / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>OPEX (stima):</span>
                <span className="font-medium text-orange-600">-€{(estimatedOpex / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t-2 border-green-300 pt-2 mt-2">
                <span className="font-semibold">Net Profit:</span>
                <span className="font-bold text-blue-700 text-sm">€{(netProfit / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 bg-gradient-to-r from-green-100 to-blue-100 px-2 py-1 rounded font-medium">
                <span>Net Margin:</span>
                <span className="font-bold">{netMarginPct.toFixed(1)}%</span>
              </div>
            </div>
          </Card>
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
