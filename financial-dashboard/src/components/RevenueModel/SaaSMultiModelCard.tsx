'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Server, Info, TrendingUp, Zap, Layers } from 'lucide-react';

interface SaaSMultiModelCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  
  // Modello Per Dispositivo
  perDeviceEnabled: boolean;
  setPerDeviceEnabled: (enabled: boolean) => void;
  perDeviceDistributionPct: number; // 🆕 % dispositivi che usano questo modello
  setPerDeviceDistributionPct: (pct: number) => void;
  monthlyFee: number;
  setMonthlyFee: (fee: number) => void;
  annualFee: number;
  setAnnualFee: (fee: number) => void;
  setupFee: number;
  setSetupFee: (fee: number) => void;
  activationRate: number;
  setActivationRate: (rate: number) => void;
  
  // Modello Per Scansione
  perScanEnabled: boolean;
  setPerScanEnabled: (enabled: boolean) => void;
  perScanDistributionPct: number; // 🆕 % dispositivi che usano questo modello
  setPerScanDistributionPct: (pct: number) => void;
  feePerScan: number;
  setFeePerScan: (fee: number) => void;
  revSharePct: number;
  setRevSharePct: (pct: number) => void;
  scansPerDevicePerMonth: number;
  setScansPerDevicePerMonth: (scans: number) => void;
  
  // Modello Tiered/Scaglioni
  tieredEnabled: boolean;
  setTieredEnabled: (enabled: boolean) => void;
  tieredDistributionPct: number; // 🆕 % dispositivi che usano questo modello
  setTieredDistributionPct: (pct: number) => void;
  tiers: Array<{
    scansUpTo: number;
    monthlyFee: number;
    description: string;
    distributionPct?: number; // 🆕 % di dispositivi in questo tier
  }>;
  setTiers: (tiers: any) => void;
  
  // Margini
  perDeviceGrossMarginPct: number;
  setPerDeviceGrossMarginPct: (pct: number) => void;
  perScanGrossMarginPct: number;
  setPerScanGrossMarginPct: (pct: number) => void;
  tieredGrossMarginPct: number;
  setTieredGrossMarginPct: (pct: number) => void;
  
  // Dati per calcolo riepilogo
  somDevicesY1?: number;
  
  // Funzione di salvataggio immediato
  onSave?: (updates: any) => Promise<void>;
}

export function SaaSMultiModelCard({
  enabled,
  setEnabled,
  perDeviceEnabled,
  setPerDeviceEnabled,
  perDeviceDistributionPct,
  setPerDeviceDistributionPct,
  monthlyFee,
  setMonthlyFee,
  annualFee,
  setAnnualFee,
  setupFee,
  setSetupFee,
  activationRate,
  setActivationRate,
  perScanEnabled,
  setPerScanEnabled,
  perScanDistributionPct,
  setPerScanDistributionPct,
  feePerScan,
  setFeePerScan,
  revSharePct,
  setRevSharePct,
  scansPerDevicePerMonth,
  setScansPerDevicePerMonth,
  tieredEnabled,
  setTieredEnabled,
  tieredDistributionPct,
  setTieredDistributionPct,
  tiers,
  setTiers,
  perDeviceGrossMarginPct,
  setPerDeviceGrossMarginPct,
  perScanGrossMarginPct,
  setPerScanGrossMarginPct,
  tieredGrossMarginPct,
  setTieredGrossMarginPct,
  somDevicesY1,
  onSave,
}: SaaSMultiModelCardProps) {
  const [editingMonthlyFee, setEditingMonthlyFee] = useState<string | null>(null);
  const [editingAnnualFee, setEditingAnnualFee] = useState<string | null>(null);
  const [editingFeePerScan, setEditingFeePerScan] = useState<string | null>(null);
  const [editingScansPerDevice, setEditingScansPerDevice] = useState<string | null>(null);
  const [editingTierFee, setEditingTierFee] = useState<{ index: number; value: string } | null>(null);
  const [editingTierScans, setEditingTierScans] = useState<{ index: number; value: string } | null>(null);
  const [editingTierDistribution, setEditingTierDistribution] = useState<{ index: number; value: string } | null>(null);
  const [editingPerDeviceDistribution, setEditingPerDeviceDistribution] = useState<string | null>(null);
  const [editingPerScanDistribution, setEditingPerScanDistribution] = useState<string | null>(null);
  const [editingTieredDistribution, setEditingTieredDistribution] = useState<string | null>(null);

  const activeModelsCount = [perDeviceEnabled, perScanEnabled, tieredEnabled].filter(Boolean).length;
  
  // Funzione per formattare numeri in K o M
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };
  
  // Calcoli per riepilogo
  const UNITS_Y1 = somDevicesY1 && somDevicesY1 > 0 ? somDevicesY1 : 100;
  const ACTIVE_DEVICES = Math.round(UNITS_Y1 * activationRate);
  
  // 🆕 DISTRIBUZIONE DISPOSITIVI TRA MODELLI SAAS
  const perDeviceDevices = Math.round(ACTIVE_DEVICES * (perDeviceDistributionPct / 100));
  const perScanDevices = Math.round(ACTIVE_DEVICES * (perScanDistributionPct / 100));
  const tieredDevices = Math.round(ACTIVE_DEVICES * (tieredDistributionPct / 100));
  
  // Modello Per Dispositivo - usa solo dispositivi allocati a questo modello
  const perDeviceMrr = perDeviceEnabled ? perDeviceDevices * monthlyFee : 0;
  const perDeviceArr = perDeviceEnabled ? perDeviceDevices * annualFee : 0;
  
  // Modello Per Scansione - usa solo dispositivi allocati a questo modello
  const totalScansPerMonth = perScanDevices * scansPerDevicePerMonth;
  const totalScansPerYear = totalScansPerMonth * 12;
  const perScanGrossRevenue = perScanEnabled ? totalScansPerYear * feePerScan : 0;
  const perScanNetRevenue = perScanGrossRevenue * (1 - revSharePct);
  const perScanMrr = perScanNetRevenue / 12;
  
  // Modello Tiered - usa solo dispositivi allocati a questo modello, poi distribuiti tra tier
  let tieredArr = 0;
  let tieredMrr = 0;
  if (tieredEnabled && tiers.length > 0) {
    // Calcola ARR pesato per ogni tier in base alla distribuzione INTERNA al modello tiered
    tieredArr = tiers.reduce((total, tier) => {
      const tierDistribution = tier.distributionPct || 0;
      const devicesInTier = Math.round(tieredDevices * (tierDistribution / 100));
      return total + (devicesInTier * tier.monthlyFee * 12);
    }, 0);
    tieredMrr = tieredArr / 12;
  }
  
  // Totali
  const saasMrr = perDeviceMrr + perScanMrr + tieredMrr;
  const saasArr = perDeviceArr + perScanNetRevenue + tieredArr;
  const arpa = ACTIVE_DEVICES > 0 ? saasArr / ACTIVE_DEVICES : 0;

  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Server className={`h-6 w-6 ${enabled ? 'text-purple-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SaaS - Ricavi Ricorrenti</h3>
            <p className="text-sm text-gray-500">
              Modelli di pricing configurabili {activeModelsCount > 0 && `(${activeModelsCount} attiv${activeModelsCount === 1 ? 'o' : 'i'})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-purple-600" : ""}>
            {enabled ? 'Attivo' : 'Disattivato'}
          </Badge>
          <Switch 
            checked={enabled}
            onCheckedChange={async (checked) => {
              setEnabled(checked);
              
              // ✅ SALVATAGGIO ISTANTANEO
              if (onSave) {
                try {
                  await onSave({ enabled: checked });
                  console.log('✅ SaaS enabled salvato:', checked);
                } catch (error) {
                  console.error('❌ Errore salvataggio SaaS enabled:', error);
                }
              }
            }}
          />
        </div>
      </div>
      
      {enabled && (
        <>
          {/* 📊 RIEPILOGO SAAS MULTI-MODEL */}
          {(perDeviceArr > 0 || perScanNetRevenue > 0 || tieredArr > 0) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Riepilogo Ricavi - Modelli Attivi</h4>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                      {activeModelsCount} Modell{activeModelsCount > 1 ? 'i' : 'o'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 pl-7">
                    📱 Distribuzione {ACTIVE_DEVICES} dispositivi attivi: 
                    {perDeviceEnabled && <span className="ml-2 font-medium text-blue-700">{perDeviceDevices} Per-Device ({perDeviceDistributionPct}%)</span>}
                    {perScanEnabled && <span className="ml-2 font-medium text-green-700">{perScanDevices} Per-Scan ({perScanDistributionPct}%)</span>}
                    {tieredEnabled && <span className="ml-2 font-medium text-orange-700">{tieredDevices} Tiered ({tieredDistributionPct}%)</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">ARR Totale Aggregato</div>
                  <div className="text-2xl font-bold text-purple-900">{formatCurrency(saasArr)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Modello 1: Per Dispositivo */}
                {perDeviceEnabled && perDeviceArr > 0 && (
                  <div className="bg-white p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">Per Dispositivo</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Attivo</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">ARR:</span>
                        <span className="font-bold text-blue-700">{formatCurrency(perDeviceArr)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">% del Totale:</span>
                        <span className="font-semibold text-gray-900">{((perDeviceArr / saasArr) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">MRR:</span>
                        <span className="font-medium text-gray-700">{formatCurrency(perDeviceMrr)}</span>
                      </div>
                      <div className="pt-1 border-t border-blue-100">
                        <div className="text-[10px] text-gray-500">
                          {perDeviceDevices} devices ({perDeviceDistributionPct}%) × €{annualFee.toLocaleString()}/anno
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Modello 2: Per Scansione */}
                {perScanEnabled && perScanNetRevenue > 0 && (
                  <div className="bg-white p-3 rounded-lg border-2 border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">Per Scansione</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">Attivo</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">ARR (Netto):</span>
                        <span className="font-bold text-green-700">{formatCurrency(perScanNetRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">% del Totale:</span>
                        <span className="font-semibold text-gray-900">{((perScanNetRevenue / saasArr) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">MRR:</span>
                        <span className="font-medium text-gray-700">{formatCurrency(perScanMrr)}</span>
                      </div>
                      <div className="pt-1 border-t border-green-100">
                        <div className="text-[10px] text-gray-500">
                          {perScanDevices} devices ({perScanDistributionPct}%) → {totalScansPerYear.toLocaleString()} scans × €{feePerScan}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Modello 3: Tiered */}
                {tieredEnabled && tieredArr > 0 && (
                  <div className="bg-white p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">A Scaglioni</span>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 text-xs">Attivo</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">ARR:</span>
                        <span className="font-bold text-orange-700">{formatCurrency(tieredArr)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">% del Totale:</span>
                        <span className="font-semibold text-gray-900">{((tieredArr / saasArr) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">MRR:</span>
                        <span className="font-medium text-gray-700">{formatCurrency(tieredMrr)}</span>
                      </div>
                      <div className="pt-1 border-t border-orange-100">
                        <div className="text-[10px] text-gray-500 space-y-0.5">
                          <div className="font-medium mb-1">{tieredDevices} devices ({tieredDistributionPct}%) - Distribuz. per tier:</div>
                          {tiers.map((tier, idx) => {
                            const tierDistribution = tier.distributionPct || 0;
                            const devicesInTier = Math.round(tieredDevices * (tierDistribution / 100));
                            return (
                              <div key={idx}>
                                • {tier.description.split(' - ')[0]}: {devicesInTier} devices ({tierDistribution}%) × €{tier.monthlyFee}/m
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Barra di somma visuale */}
              <div className="mt-3 pt-3 border-t-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Formula Aggregazione:</span>
                    <span className="ml-2 font-mono text-xs text-purple-700">
                      ARR_Totale = 
                      {perDeviceEnabled && perDeviceArr > 0 && ` ARR_PerDevice`}
                      {perScanEnabled && perScanNetRevenue > 0 && ` + ARR_PerScan`}
                      {tieredEnabled && tieredArr > 0 && ` + ARR_Tiered`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-600">MRR Totale</div>
                      <div className="text-lg font-bold text-purple-700">{formatCurrency(saasMrr)}/mese</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">ARPA Medio</div>
                      <div className="text-lg font-bold text-purple-900">{formatCurrency(arpa)}/anno</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="perDevice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="perDevice" className="relative">
                <Zap className="h-4 w-4 mr-2" />
                Per Dispositivo
                {perDeviceEnabled && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="perScan" className="relative">
                <TrendingUp className="h-4 w-4 mr-2" />
                Per Scansione
                {perScanEnabled && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tiered" className="relative">
                <Layers className="h-4 w-4 mr-2" />
                A Scaglioni
                {tieredEnabled && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* MODELLO PER DISPOSITIVO */}
            <TabsContent value="perDevice" className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={perDeviceEnabled}
                    onCheckedChange={async (checked) => {
                      setPerDeviceEnabled(checked);
                      
                      // ✅ SALVATAGGIO ISTANTANEO
                      if (onSave) {
                        try {
                          await onSave({
                            pricing: {
                              perDevice: {
                                enabled: checked,
                                monthlyFee,
                                annualFee,
                                grossMarginPct: perDeviceGrossMarginPct
                              }
                            }
                          });
                          console.log('✅ Modello Per Dispositivo enabled:', checked);
                        } catch (error) {
                          console.error('❌ Errore salvataggio Per Dispositivo enabled:', error);
                        }
                      }
                    }}
                  />
                  <span className="font-medium text-gray-700">Abilita Pricing Per Dispositivo</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">Modello classico SaaS: canone mensile o annuale fisso per ogni dispositivo attivo</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {perDeviceEnabled && (
                  <Badge className="bg-green-100 text-green-700">Attivo</Badge>
                )}
              </div>

              {perDeviceEnabled && (
                <>
                  {/* 🆕 Distribuzione Percentuale Modello */}
                  <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        % Dispositivi che usano questo modello
                      </label>
                      <div className="flex items-center gap-2">
                        {editingPerDeviceDistribution !== null ? (
                          <Input
                            type="number"
                            value={editingPerDeviceDistribution}
                            onChange={(e) => setEditingPerDeviceDistribution(e.target.value)}
                            onBlur={async () => {
                              const num = parseFloat(editingPerDeviceDistribution);
                              if (!isNaN(num) && num >= 0 && num <= 100) {
                                setPerDeviceDistributionPct(num);
                                
                                // ✅ SALVATAGGIO ISTANTANEO
                                if (onSave) {
                                  try {
                                    await onSave({
                                      pricing: {
                                        perDevice: {
                                          modelDistributionPct: num
                                        }
                                      }
                                    });
                                    console.log('✅ Distribuzione Per Dispositivo salvata:', num);
                                  } catch (error) {
                                    console.error('❌ Errore salvataggio distribuzione:', error);
                                  }
                                }
                              }
                              setEditingPerDeviceDistribution(null);
                            }}
                            className="h-8 w-20"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="h-8 px-3 py-1 rounded border border-blue-300 hover:border-blue-500 cursor-pointer text-sm font-semibold bg-white flex items-center"
                            onClick={() => setEditingPerDeviceDistribution(perDeviceDistributionPct.toString())}
                          >
                            {perDeviceDistributionPct}%
                          </div>
                        )}
                        <span className="text-xs text-gray-600">
                          = {perDeviceDevices} dispositivi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    {/* Canone Mensile */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Canone Mensile (MRR)
                      </label>
                    {editingMonthlyFee !== null ? (
                      <Input
                        type="number"
                        value={editingMonthlyFee}
                        onChange={(e) => setEditingMonthlyFee(e.target.value)}
                        onBlur={async () => {
                          const num = parseFloat(editingMonthlyFee);
                          if (!isNaN(num) && num >= 0) {
                            setMonthlyFee(num);
                            
                            // ✅ SALVATAGGIO ISTANTANEO
                            if (onSave) {
                              try {
                                await onSave({
                                  pricing: {
                                    perDevice: {
                                      enabled: perDeviceEnabled,
                                      monthlyFee: num,
                                      annualFee,
                                      grossMarginPct: perDeviceGrossMarginPct
                                    }
                                  }
                                });
                                console.log('✅ Canone mensile salvato:', num);
                              } catch (error) {
                                console.error('❌ Errore salvataggio canone mensile:', error);
                              }
                            }
                          }
                          setEditingMonthlyFee(null);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const num = parseFloat(editingMonthlyFee);
                            if (!isNaN(num) && num >= 0) {
                              setMonthlyFee(num);
                              
                              if (onSave) {
                                try {
                                  await onSave({
                                    pricing: {
                                      perDevice: {
                                        enabled: perDeviceEnabled,
                                        monthlyFee: num,
                                        annualFee,
                                        grossMarginPct: perDeviceGrossMarginPct
                                      }
                                    }
                                  });
                                  console.log('✅ Canone mensile salvato:', num);
                                } catch (error) {
                                  console.error('❌ Errore salvataggio canone mensile:', error);
                                }
                              }
                            }
                            setEditingMonthlyFee(null);
                          }
                        }}
                        className="h-9"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors flex items-center"
                        onClick={() => setEditingMonthlyFee(monthlyFee.toString())}
                      >
                        <span className="font-medium text-gray-900">€{monthlyFee.toLocaleString()}/mese</span>
                      </div>
                    )}
                  </div>

                  {/* Canone Annuale */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Canone Annuale (ARR)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Solitamente con sconto 10-15% rispetto a 12 mesi</p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    {editingAnnualFee !== null ? (
                      <Input
                        type="number"
                        value={editingAnnualFee}
                        onChange={(e) => setEditingAnnualFee(e.target.value)}
                        onBlur={async () => {
                          const num = parseFloat(editingAnnualFee);
                          if (!isNaN(num) && num >= 0) {
                            setAnnualFee(num);
                            
                            // ✅ SALVATAGGIO ISTANTANEO
                            if (onSave) {
                              try {
                                await onSave({
                                  pricing: {
                                    perDevice: {
                                      enabled: perDeviceEnabled,
                                      monthlyFee,
                                      annualFee: num,
                                      grossMarginPct: perDeviceGrossMarginPct
                                    }
                                  }
                                });
                                console.log('✅ Canone annuale salvato:', num);
                              } catch (error) {
                                console.error('❌ Errore salvataggio canone annuale:', error);
                              }
                            }
                          }
                          setEditingAnnualFee(null);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const num = parseFloat(editingAnnualFee);
                            if (!isNaN(num) && num >= 0) {
                              setAnnualFee(num);
                              
                              if (onSave) {
                                try {
                                  await onSave({
                                    pricing: {
                                      perDevice: {
                                        enabled: perDeviceEnabled,
                                        monthlyFee,
                                        annualFee: num,
                                        grossMarginPct: perDeviceGrossMarginPct
                                      }
                                    }
                                  });
                                  console.log('✅ Canone annuale salvato:', num);
                                } catch (error) {
                                  console.error('❌ Errore salvataggio canone annuale:', error);
                                }
                              }
                            }
                            setEditingAnnualFee(null);
                          }
                        }}
                        className="h-9"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors flex items-center"
                        onClick={() => setEditingAnnualFee(annualFee.toString())}
                      >
                        <span className="font-medium text-gray-900">€{annualFee.toLocaleString()}/anno</span>
                      </div>
                    )}
                  </div>

                  {/* Tasso Attivazione */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Tasso Attivazione
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">% di clienti che attivano il servizio SaaS dopo l'acquisto hardware</p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{(activationRate * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[activationRate * 100]}
                        onValueChange={(value) => setActivationRate(value[0] / 100)}
                        onValueCommit={async (value) => {
                          const newRate = value[0] / 100;
                          setActivationRate(newRate);
                          
                          // ✅ SALVATAGGIO ISTANTANEO
                          if (onSave) {
                            try {
                              await onSave({
                                activationRate: newRate
                              });
                              console.log('✅ Tasso attivazione salvato:', newRate);
                            } catch (error) {
                              console.error('❌ Errore salvataggio tasso attivazione:', error);
                            }
                          }
                        }}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Margine Lordo */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1">Margine Lordo</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{(perDeviceGrossMarginPct * 100).toFixed(0)}%</span>
                        <span className="text-sm font-medium text-green-600">
                          COGS: {(100 - perDeviceGrossMarginPct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[perDeviceGrossMarginPct * 100]}
                        onValueChange={(value) => setPerDeviceGrossMarginPct(value[0] / 100)}
                        onValueCommit={async (value) => {
                          const newMargin = value[0] / 100;
                          setPerDeviceGrossMarginPct(newMargin);
                          
                          // ✅ SALVATAGGIO ISTANTANEO
                          if (onSave) {
                            try {
                              await onSave({
                                pricing: {
                                  perDevice: {
                                    enabled: perDeviceEnabled,
                                    monthlyFee,
                                    annualFee,
                                    grossMarginPct: newMargin
                                  }
                                }
                              });
                              console.log('✅ Margine per dispositivo salvato:', newMargin);
                            } catch (error) {
                              console.error('❌ Errore salvataggio margine per dispositivo:', error);
                            }
                          }
                        }}
                        min={50}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
              )}
            </TabsContent>

            {/* MODELLO PER SCANSIONE */}
            <TabsContent value="perScan" className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={perScanEnabled}
                    onCheckedChange={async (checked) => {
                      setPerScanEnabled(checked);
                      
                      // ✅ SALVATAGGIO ISTANTANEO
                      if (onSave) {
                        try {
                          await onSave({
                            pricing: {
                              perScan: {
                                enabled: checked,
                                feePerScan,
                                revSharePct,
                                scansPerDevicePerMonth,
                                grossMarginPct: perScanGrossMarginPct
                              }
                            }
                          });
                          console.log('✅ Modello Per Scansione enabled:', checked);
                        } catch (error) {
                          console.error('❌ Errore salvataggio Per Scansione enabled:', error);
                        }
                      }
                    }}
                  />
                  <span className="font-medium text-gray-700">Abilita Pricing Per Scansione</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">Pay-per-use: €X per ogni scansione effettuata. Include revenue share con partner</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {perScanEnabled && (
                  <Badge className="bg-green-100 text-green-700">Attivo</Badge>
                )}
              </div>

              {perScanEnabled && (
                <>
                  {/* 🆕 Distribuzione Percentuale Modello */}
                  <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        % Dispositivi che usano questo modello
                      </label>
                      <div className="flex items-center gap-2">
                        {editingPerScanDistribution !== null ? (
                          <Input
                            type="number"
                            value={editingPerScanDistribution}
                            onChange={(e) => setEditingPerScanDistribution(e.target.value)}
                            onBlur={async () => {
                              const num = parseFloat(editingPerScanDistribution);
                              if (!isNaN(num) && num >= 0 && num <= 100) {
                                setPerScanDistributionPct(num);
                                
                                // ✅ SALVATAGGIO ISTANTANEO
                                if (onSave) {
                                  try {
                                    await onSave({
                                      pricing: {
                                        perScan: {
                                          modelDistributionPct: num
                                        }
                                      }
                                    });
                                    console.log('✅ Distribuzione Per Scansione salvata:', num);
                                  } catch (error) {
                                    console.error('❌ Errore salvataggio distribuzione:', error);
                                  }
                                }
                              }
                              setEditingPerScanDistribution(null);
                            }}
                            className="h-8 w-20"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="h-8 px-3 py-1 rounded border border-green-300 hover:border-green-500 cursor-pointer text-sm font-semibold bg-white flex items-center"
                            onClick={() => setEditingPerScanDistribution(perScanDistributionPct.toString())}
                          >
                            {perScanDistributionPct}%
                          </div>
                        )}
                        <span className="text-xs text-gray-600">
                          = {perScanDevices} dispositivi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    {/* Fee per Scansione */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Fee per Scansione
                      </label>
                    {editingFeePerScan !== null ? (
                      <Input
                        type="number"
                        value={editingFeePerScan}
                        onChange={(e) => setEditingFeePerScan(e.target.value)}
                        onBlur={async () => {
                          const num = parseFloat(editingFeePerScan);
                          if (!isNaN(num) && num >= 0) {
                            setFeePerScan(num);
                            
                            // ✅ SALVATAGGIO ISTANTANEO
                            if (onSave) {
                              try {
                                await onSave({
                                  pricing: {
                                    perScan: {
                                      enabled: perScanEnabled,
                                      feePerScan: num,
                                      revSharePct,
                                      scansPerDevicePerMonth,
                                      grossMarginPct: perScanGrossMarginPct
                                    }
                                  }
                                });
                                console.log('✅ Fee per scansione salvata:', num);
                              } catch (error) {
                                console.error('❌ Errore salvataggio fee per scansione:', error);
                              }
                            }
                          }
                          setEditingFeePerScan(null);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const num = parseFloat(editingFeePerScan);
                            if (!isNaN(num) && num >= 0) {
                              setFeePerScan(num);
                              
                              if (onSave) {
                                try {
                                  await onSave({
                                    pricing: {
                                      perScan: {
                                        enabled: perScanEnabled,
                                        feePerScan: num,
                                        revSharePct,
                                        scansPerDevicePerMonth,
                                        grossMarginPct: perScanGrossMarginPct
                                      }
                                    }
                                  });
                                  console.log('✅ Fee per scansione salvata:', num);
                                } catch (error) {
                                  console.error('❌ Errore salvataggio fee per scansione:', error);
                                }
                              }
                            }
                            setEditingFeePerScan(null);
                          }
                        }}
                        className="h-9"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-green-300 cursor-pointer transition-colors flex items-center"
                        onClick={() => setEditingFeePerScan(feePerScan.toString())}
                      >
                        <span className="font-medium text-gray-900">€{feePerScan.toFixed(2)}/scan</span>
                      </div>
                    )}
                  </div>

                  {/* Scansioni per Dispositivo/Mese */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Scansioni/Dispositivo/Mese
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Volume medio mensile di scansioni per dispositivo attivo</p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    {editingScansPerDevice !== null ? (
                      <Input
                        type="number"
                        value={editingScansPerDevice}
                        onChange={(e) => setEditingScansPerDevice(e.target.value)}
                        onBlur={async () => {
                          const num = parseInt(editingScansPerDevice);
                          if (!isNaN(num) && num >= 0) {
                            setScansPerDevicePerMonth(num);
                            
                            // ✅ SALVATAGGIO ISTANTANEO
                            if (onSave) {
                              try {
                                await onSave({
                                  pricing: {
                                    perScan: {
                                      enabled: perScanEnabled,
                                      feePerScan,
                                      revSharePct,
                                      scansPerDevicePerMonth: num,
                                      grossMarginPct: perScanGrossMarginPct
                                    }
                                  }
                                });
                                console.log('✅ Scansioni/dispositivo salvate:', num);
                              } catch (error) {
                                console.error('❌ Errore salvataggio scansioni/dispositivo:', error);
                              }
                            }
                          }
                          setEditingScansPerDevice(null);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const num = parseInt(editingScansPerDevice);
                            if (!isNaN(num) && num >= 0) {
                              setScansPerDevicePerMonth(num);
                              
                              if (onSave) {
                                try {
                                  await onSave({
                                    pricing: {
                                      perScan: {
                                        enabled: perScanEnabled,
                                        feePerScan,
                                        revSharePct,
                                        scansPerDevicePerMonth: num,
                                        grossMarginPct: perScanGrossMarginPct
                                      }
                                    }
                                  });
                                  console.log('✅ Scansioni/dispositivo salvate:', num);
                                } catch (error) {
                                  console.error('❌ Errore salvataggio scansioni/dispositivo:', error);
                                }
                              }
                            }
                            setEditingScansPerDevice(null);
                          }
                        }}
                        className="h-9"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-green-300 cursor-pointer transition-colors flex items-center"
                        onClick={() => setEditingScansPerDevice(scansPerDevicePerMonth.toString())}
                      >
                        <span className="font-medium text-gray-900">{scansPerDevicePerMonth} scans/mese</span>
                      </div>
                    )}
                  </div>

                  {/* Revenue Share */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Revenue Share Partner
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">% del ricavo da condividere con partner/distributori</p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{(revSharePct * 100).toFixed(0)}%</span>
                        <span className="text-sm font-medium text-blue-600">
                          Netto: {(100 - revSharePct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[revSharePct * 100]}
                        onValueChange={(value) => setRevSharePct(value[0] / 100)}
                        onValueCommit={async (value) => {
                          const newRevShare = value[0] / 100;
                          setRevSharePct(newRevShare);
                          
                          // ✅ SALVATAGGIO ISTANTANEO
                          if (onSave) {
                            try {
                              await onSave({
                                pricing: {
                                  perScan: {
                                    enabled: perScanEnabled,
                                    feePerScan,
                                    revSharePct: newRevShare,
                                    scansPerDevicePerMonth,
                                    grossMarginPct: perScanGrossMarginPct
                                  }
                                }
                              });
                              console.log('✅ Revenue share salvato:', newRevShare);
                            } catch (error) {
                              console.error('❌ Errore salvataggio revenue share:', error);
                            }
                          }
                        }}
                        min={0}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Margine Lordo */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1">Margine Lordo (su netto)</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{(perScanGrossMarginPct * 100).toFixed(0)}%</span>
                        <span className="text-sm font-medium text-green-600">
                          COGS: {(100 - perScanGrossMarginPct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[perScanGrossMarginPct * 100]}
                        onValueChange={(value) => setPerScanGrossMarginPct(value[0] / 100)}
                        onValueCommit={async (value) => {
                          const newMargin = value[0] / 100;
                          setPerScanGrossMarginPct(newMargin);
                          
                          // ✅ SALVATAGGIO ISTANTANEO
                          if (onSave) {
                            try {
                              await onSave({
                                pricing: {
                                  perScan: {
                                    enabled: perScanEnabled,
                                    feePerScan,
                                    revSharePct,
                                    scansPerDevicePerMonth,
                                    grossMarginPct: newMargin
                                  }
                                }
                              });
                              console.log('✅ Margine per scansione salvato:', newMargin);
                            } catch (error) {
                              console.error('❌ Errore salvataggio margine per scansione:', error);
                            }
                          }
                        }}
                        min={50}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
              )}
            </TabsContent>

            {/* MODELLO A SCAGLIONI/TIERED */}
            <TabsContent value="tiered" className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={tieredEnabled}
                    onCheckedChange={async (checked) => {
                      setTieredEnabled(checked);
                      
                      // ✅ SALVATAGGIO ISTANTANEO
                      if (onSave) {
                        try {
                          await onSave({
                            pricing: {
                              tiered: {
                                enabled: checked,
                                tiers,
                                grossMarginPct: tieredGrossMarginPct
                              }
                            }
                          });
                          console.log('✅ Modello Tiered enabled:', checked);
                        } catch (error) {
                          console.error('❌ Errore salvataggio Tiered enabled:', error);
                        }
                      }
                    }}
                  />
                  <span className="font-medium text-gray-700">Abilita Pricing A Scaglioni</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">Piani diversi in base al volume: Starter, Professional, Enterprise</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {tieredEnabled && (
                  <Badge className="bg-orange-100 text-orange-700">Attivo</Badge>
                )}
              </div>

              {tieredEnabled && (
                <>
                  {/* 🆕 Distribuzione Percentuale Modello */}
                  <div className="p-3 bg-orange-100 rounded-lg border border-orange-300">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        % Dispositivi che usano questo modello
                      </label>
                      <div className="flex items-center gap-2">
                        {editingTieredDistribution !== null ? (
                          <Input
                            type="number"
                            value={editingTieredDistribution}
                            onChange={(e) => setEditingTieredDistribution(e.target.value)}
                            onBlur={async () => {
                              const num = parseFloat(editingTieredDistribution);
                              if (!isNaN(num) && num >= 0 && num <= 100) {
                                setTieredDistributionPct(num);
                                
                                // ✅ SALVATAGGIO ISTANTANEO
                                if (onSave) {
                                  try {
                                    await onSave({
                                      pricing: {
                                        tiered: {
                                          modelDistributionPct: num
                                        }
                                      }
                                    });
                                    console.log('✅ Distribuzione Tiered salvata:', num);
                                  } catch (error) {
                                    console.error('❌ Errore salvataggio distribuzione:', error);
                                  }
                                }
                              }
                              setEditingTieredDistribution(null);
                            }}
                            className="h-8 w-20"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="h-8 px-3 py-1 rounded border border-orange-300 hover:border-orange-500 cursor-pointer text-sm font-semibold bg-white flex items-center"
                            onClick={() => setEditingTieredDistribution(tieredDistributionPct.toString())}
                          >
                            {tieredDistributionPct}%
                          </div>
                        )}
                        <span className="text-xs text-gray-600">
                          = {tieredDevices} dispositivi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {tiers.map((tier, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Scansioni fino a</label>
                          {editingTierScans?.index === index ? (
                            <Input
                              type="number"
                              value={editingTierScans.value}
                              onChange={(e) => setEditingTierScans({ index, value: e.target.value })}
                              onBlur={async () => {
                                const num = parseInt(editingTierScans.value);
                                if (!isNaN(num) && num > 0) {
                                  const newTiers = [...tiers];
                                  newTiers[index].scansUpTo = num;
                                  setTiers(newTiers);
                                  
                                  // ✅ SALVATAGGIO ISTANTANEO su database
                                  if (onSave) {
                                    try {
                                      await onSave({
                                        pricing: {
                                          tiered: {
                                            enabled: tieredEnabled,
                                            tiers: newTiers,
                                            grossMarginPct: tieredGrossMarginPct
                                          }
                                        }
                                      });
                                      console.log('✅ Tier scansioni salvato su database:', newTiers[index]);
                                    } catch (error) {
                                      console.error('❌ Errore salvataggio tier scansioni:', error);
                                    }
                                  }
                                }
                                setEditingTierScans(null);
                              }}
                              className="h-8"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-orange-300 cursor-pointer text-sm flex items-center"
                              onClick={() => setEditingTierScans({ index, value: tier.scansUpTo.toString() })}
                            >
                              {tier.scansUpTo === 9999 ? '∞' : tier.scansUpTo}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Fee Mensile</label>
                          {editingTierFee?.index === index ? (
                            <Input
                              type="number"
                              value={editingTierFee.value}
                              onChange={(e) => setEditingTierFee({ index, value: e.target.value })}
                              onBlur={async () => {
                                const num = parseFloat(editingTierFee.value);
                                if (!isNaN(num) && num >= 0) {
                                  const newTiers = [...tiers];
                                  newTiers[index].monthlyFee = num;
                                  setTiers(newTiers);
                                  
                                  // ✅ SALVATAGGIO ISTANTANEO su database
                                  if (onSave) {
                                    try {
                                      await onSave({
                                        pricing: {
                                          tiered: {
                                            enabled: tieredEnabled,
                                            tiers: newTiers,
                                            grossMarginPct: tieredGrossMarginPct
                                          }
                                        }
                                      });
                                      console.log('✅ Tier salvato su database:', newTiers[index]);
                                    } catch (error) {
                                      console.error('❌ Errore salvataggio tier:', error);
                                    }
                                  }
                                }
                                setEditingTierFee(null);
                              }}
                              className="h-8"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-orange-300 cursor-pointer text-sm flex items-center"
                              onClick={() => setEditingTierFee({ index, value: tier.monthlyFee.toString() })}
                            >
                              €{tier.monthlyFee}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">% Distribuzione</label>
                          {editingTierDistribution?.index === index ? (
                            <Input
                              type="number"
                              value={editingTierDistribution.value}
                              onChange={(e) => setEditingTierDistribution({ index, value: e.target.value })}
                              onBlur={async () => {
                                const num = parseFloat(editingTierDistribution.value);
                                if (!isNaN(num) && num >= 0 && num <= 100) {
                                  const newTiers = [...tiers];
                                  newTiers[index].distributionPct = num;
                                  setTiers(newTiers);
                                  
                                  // ✅ SALVATAGGIO ISTANTANEO su database
                                  if (onSave) {
                                    try {
                                      await onSave({
                                        pricing: {
                                          tiered: {
                                            enabled: tieredEnabled,
                                            tiers: newTiers,
                                            grossMarginPct: tieredGrossMarginPct
                                          }
                                        }
                                      });
                                      console.log('✅ Tier distribuzione salvato su database:', newTiers[index]);
                                    } catch (error) {
                                      console.error('❌ Errore salvataggio tier distribuzione:', error);
                                    }
                                  }
                                }
                                setEditingTierDistribution(null);
                              }}
                              className="h-8"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-orange-300 cursor-pointer text-sm flex items-center"
                              onClick={() => setEditingTierDistribution({ index, value: (tier.distributionPct || 0).toString() })}
                            >
                              {(tier.distributionPct || 0)}%
                            </div>
                          )}
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {tier.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Margine Lordo Tiered */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 mb-1">Margine Lordo</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{(tieredGrossMarginPct * 100).toFixed(0)}%</span>
                        <span className="text-sm font-medium text-green-600">
                          COGS: {(100 - tieredGrossMarginPct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[tieredGrossMarginPct * 100]}
                        onValueChange={(value) => setTieredGrossMarginPct(value[0] / 100)}
                        onValueCommit={async (value) => {
                          const newMargin = value[0] / 100;
                          setTieredGrossMarginPct(newMargin);
                          
                          // ✅ SALVATAGGIO ISTANTANEO
                          if (onSave) {
                            try {
                              await onSave({
                                pricing: {
                                  tiered: {
                                    enabled: tieredEnabled,
                                    tiers,
                                    grossMarginPct: newMargin
                                  }
                                }
                              });
                              console.log('✅ Margine tiered salvato:', newMargin);
                            } catch (error) {
                              console.error('❌ Errore salvataggio margine tiered:', error);
                            }
                          }
                        }}
                        min={60}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  );
}
