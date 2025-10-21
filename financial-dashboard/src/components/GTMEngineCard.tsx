'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  TrendingUp,
  Users, 
  Target,
  Info,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GtmCalculationService } from '@/services/gtmCalculations';
import { useDatabase } from '@/contexts/DatabaseProvider';

interface GTMEngineCardProps {
  goToMarket?: any;
  tamSamSomEcografi?: any;
  updateGoToMarket: (updates: any) => Promise<void>;
}

export function GTMEngineCard({
  goToMarket: gtmProp,
  tamSamSomEcografi: tamProp,
  updateGoToMarket: updateProp
}: GTMEngineCardProps) {
  // Accesso al database context
  const { data, updateMarketingPlan } = useDatabase();
  const goToMarket = gtmProp || data?.goToMarket;
  const tamSamSomEcografi = tamProp || data?.configurazioneTamSamSom?.ecografi;
  const updateGoToMarket = updateProp;
  
  // ✅ Stati PRIMA del return condizionale (React Hooks rule)
  const [editingDeals, setEditingDeals] = useState<string | null>(null);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editingYearValue, setEditingYearValue] = useState<string>('');
  const [editingRampUp, setEditingRampUp] = useState<string | null>(null);
  
  // 🎯 Stati per Impatto Business interattivo
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [costPerLead, setCostPerLead] = useState<number>(50);
  const [devicePrice, setDevicePrice] = useState<number>(50000);
  const [dealsPerRepOverride, setDealsPerRepOverride] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // 🔄 Carica valori salvati dal database all'avvio
  useEffect(() => {
    if (!data?.goToMarket?.marketingPlan || initialized) return;
    
    const marketingPlan = data.goToMarket.marketingPlan;
    
    // Carica global settings se disponibili
    if (marketingPlan.globalSettings?.costPerLead) {
      setCostPerLead(marketingPlan.globalSettings.costPerLead);
    }
    
    // Carica valori per anno corrente se disponibili
    const yearKey = `y${selectedYear}`;
    const savedProjection = marketingPlan.projections?.[yearKey];
    if (savedProjection) {
      if (savedProjection.costPerLead) {
        setCostPerLead(savedProjection.costPerLead);
      }
      if (savedProjection.dealsPerRepOverride !== undefined) {
        setDealsPerRepOverride(savedProjection.dealsPerRepOverride);
      }
      console.log(`✅ Caricati valori salvati per Anno ${selectedYear}:`, savedProjection);
    }
    
    setInitialized(true);
  }, [data, selectedYear, initialized]);
  
  // 🔄 Quando cambia anno, carica i valori salvati per quell'anno
  useEffect(() => {
    if (!data?.goToMarket?.marketingPlan) return;
    
    const yearKey = `y${selectedYear}`;
    const savedProjection = data.goToMarket.marketingPlan.projections?.[yearKey];
    
    if (savedProjection) {
      if (savedProjection.costPerLead) {
        setCostPerLead(savedProjection.costPerLead);
      }
      if (savedProjection.dealsPerRepOverride !== undefined) {
        setDealsPerRepOverride(savedProjection.dealsPerRepOverride);
      }
    } else {
      // Anno non salvato, usa defaults
      const globalSettings = data.goToMarket.marketingPlan.globalSettings;
      if (globalSettings?.costPerLead) {
        setCostPerLead(globalSettings.costPerLead);
      }
      setDealsPerRepOverride(null);
    }
  }, [selectedYear, data]);
  
  // 📊 Calcoli dinamici per anno selezionato (usati per salvataggio)
  const currentYearCalculations = useMemo(() => {
    if (!goToMarket) return null;
    
    const { salesCapacity, conversionFunnel } = goToMarket;
    const repsByYear = salesCapacity.repsByYear || {};
    const yearKey = `y${selectedYear}` as keyof typeof repsByYear;
    const repsForYear = repsByYear[yearKey] || 0;
    const dealsPerQ = dealsPerRepOverride ?? salesCapacity.dealsPerRepPerQuarter;
    
    const rampFactor = selectedYear === 1 
      ? (12 - salesCapacity.rampUpMonths) / 12 
      : 1;
    
    const capacity = repsForYear * dealsPerQ * 4 * rampFactor;
    
    const funnelEfficiency = (conversionFunnel.lead_to_demo || 0) * 
      (conversionFunnel.demo_to_pilot || 0) * 
      (conversionFunnel.pilot_to_deal || 0);
    
    const leadsNeeded = Math.ceil(capacity / (funnelEfficiency || 0.001));
    const budgetMarketing = leadsNeeded * costPerLead;
    const expectedRevenue = capacity * devicePrice;
    const marketingPercentage = expectedRevenue > 0 ? (budgetMarketing / expectedRevenue) * 100 : 0;
    const cacEffettivo = funnelEfficiency > 0 ? costPerLead / funnelEfficiency : 0;
    
    return {
      reps: repsForYear,
      rampFactor,
      capacity: Math.round(capacity),
      funnelEfficiency,
      leadsNeeded,
      leadsMonthly: Math.ceil(leadsNeeded / 12),
      budgetMarketing,
      budgetMonthly: Math.round(budgetMarketing / 12),
      cacEffettivo: Math.round(cacEffettivo),
      expectedRevenue,
      marketingPercentage,
      productivityRepYear: dealsPerQ * 4
    };
  }, [goToMarket, selectedYear, costPerLead, devicePrice, dealsPerRepOverride]);
  
  // 💾 Salva automaticamente nel database quando cambiano parametri o calcoli
  useEffect(() => {
    if (!initialized || !currentYearCalculations || !goToMarket) return;
    
    // Debounce: salva dopo 500ms dall'ultimo cambio
    const timeoutId = setTimeout(async () => {
      const projection = {
        costPerLead,
        dealsPerRepOverride,
        calculated: currentYearCalculations,
        lastUpdate: new Date().toISOString(),
        note: `Calcolato automaticamente dal simulatore`
      };
      
      try {
        await updateMarketingPlan(selectedYear, projection);
        console.log(`💾 Auto-salvato Marketing Plan Anno ${selectedYear} su database`);
      } catch (error) {
        console.error(`❌ Errore auto-salvataggio Marketing Plan Anno ${selectedYear}:`, error);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [selectedYear, costPerLead, dealsPerRepOverride, currentYearCalculations, initialized, updateMarketingPlan, goToMarket]);
  
  // 🆕 Calcola proiezioni usando il Service (prima del return condizionale)
  const projections = useMemo(() => {
    if (!goToMarket || !tamSamSomEcografi) return [];
    
    const dispositiviUnita = tamSamSomEcografi.dispositiviUnita || {};
    const somDevicesByYear = {
      y1: dispositiviUnita.som1 || 0,
      y2: dispositiviUnita.som2 || 0,
      y3: dispositiviUnita.som3 || 0,
      y4: dispositiviUnita.som4 || 0,
      y5: dispositiviUnita.som5 || 0
    };
    
    const gtmProjections = GtmCalculationService.projectSalesOverYears(
      goToMarket,
      somDevicesByYear,
      'italia'
    );
    
    return [1, 2, 3, 4, 5].map(year => {
      const yearKey = `y${year}` as 'y1' | 'y2' | 'y3' | 'y4' | 'y5';
      return {
        realistic: gtmProjections.realisticSales[yearKey],
        limiting: gtmProjections.constrainingFactor[yearKey],
        capacity: gtmProjections.maxSalesCapacity[yearKey],
        som: somDevicesByYear[yearKey]
      };
    });
  }, [goToMarket, tamSamSomEcografi]);
  
  // Calcola KPI per badge e warning (PRIMA del check per regole React Hooks)
  const channelEfficiency = useMemo(() => {
    if (!goToMarket?.channelMix) return 0.92; // Default
    const channelMix = goToMarket.channelMix;
    return 1.0 - (channelMix.distributors * channelMix.distributorMargin);
  }, [goToMarket?.channelMix]);
  
  const adoptionItalia = useMemo(() => {
    const adoption = goToMarket?.adoptionCurve?.italia;
    if (!adoption) return { y1: 0.2, y5: 1 };
    return { y1: adoption.y1 || 0.2, y5: adoption.y5 || 1 };
  }, [goToMarket?.adoptionCurve]);
  
  const hasLowAdoption = adoptionItalia.y1 < 0.5;
  const hasLowChannelEfficiency = channelEfficiency < 0.85;
  
  if (!goToMarket || !tamSamSomEcografi) {
    return (
      <Card className="p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Go-To-Market Engine non configurato</p>
        </div>
      </Card>
    );
  }
  
  // Destructure dopo il check
  const { salesCapacity, conversionFunnel } = goToMarket;
  
  // Sales reps per anno (con fallback a oggetto vuoto)
  const repsByYear = salesCapacity.repsByYear || {
    y1: salesCapacity.reps || 1,
    y2: salesCapacity.reps || 1,
    y3: salesCapacity.reps || 1,
    y4: salesCapacity.reps || 1,
    y5: salesCapacity.reps || 1
  };
  
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Go-To-Market Engine</h3>
            <p className="text-sm text-gray-600">Proiezioni realistiche bottom-up</p>
          </div>
        </div>
        
        <Switch
          checked={goToMarket.enabled}
          onCheckedChange={async (checked) => {
            await updateGoToMarket({ enabled: checked });
          }}
        />
      </div>
      
      {/* KPI Badges - Shortcut per configurazione */}
      {goToMarket.enabled && (
        <div className="mb-4 flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#gtm-configuration" className="no-underline">
                  <Badge 
                    variant={hasLowChannelEfficiency ? "destructive" : "default"}
                    className="cursor-pointer hover:opacity-80 flex items-center gap-1 py-1.5 px-3"
                  >
                    {hasLowChannelEfficiency && <AlertTriangle className="w-3 h-3" />}
                    Channel Efficiency: {(channelEfficiency * 100).toFixed(1)}%
                    <ChevronRight className="w-3 h-3" />
                  </Badge>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  {hasLowChannelEfficiency 
                    ? "⚠️ Troppo margine ai distributori - Click per modificare Channel Mix"
                    : "✅ Channel efficiency ottimale - Click per modificare"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#gtm-configuration" className="no-underline">
                  <Badge 
                    variant={hasLowAdoption ? "destructive" : "default"}
                    className="cursor-pointer hover:opacity-80 flex items-center gap-1 py-1.5 px-3"
                  >
                    {hasLowAdoption && <AlertTriangle className="w-3 h-3" />}
                    Adoption Italia: {Math.round(adoptionItalia.y1 * 100)}% → {Math.round(adoptionItalia.y5 * 100)}%
                    <ChevronRight className="w-3 h-3" />
                  </Badge>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  {hasLowAdoption 
                    ? "⚠️ Mercato poco penetrato in Anno 1 - Click per modificare Adoption Curve"
                    : "✅ Adoption curve realistica - Click per modificare"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Badge variant="outline" className="py-1.5 px-3">
            Scenario: <span className="font-bold ml-1 capitalize">{goToMarket.scenarios?.current || 'medio'}</span>
          </Badge>
        </div>
      )}
      
      {goToMarket.enabled && (
        <>
          {/* === SALES CAPACITY === */}
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold">Capacità Commerciale</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Team di vendita e produttività: quanti deal può chiudere il team per trimestre</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* 🆕 Sales Reps per Anno (Y1-Y5) */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-semibold text-gray-700">Sales Reps per Anno</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">Evoluzione Team Commerciale</p>
                      <p className="text-xs mb-2">
                        Definisci quanti sales rep avrai attivi in ogni anno (Y1-Y5).
                        Questo permette di stimare l&apos;evoluzione dei costi del team e la crescita della capacity.
                      </p>
                      <p className="text-xs font-mono bg-purple-100 p-2 rounded">
                        Capacity(Y) = reps(Y) × deals/Q × 4 × ramp_factor
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((year) => {
                  const yearKey = `y${year}` as 'y1' | 'y2' | 'y3' | 'y4' | 'y5';
                  const repsValue = repsByYear[yearKey];
                  
                  return (
                    <div key={year}>
                      <div className="text-xs text-gray-500 mb-1 text-center">Anno {year}</div>
                      {editingYear === year ? (
                        <Input
                          type="number"
                          value={editingYearValue}
                          onChange={(e) => setEditingYearValue(e.target.value)}
                          onBlur={async () => {
                            const num = parseInt(editingYearValue);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              await updateGoToMarket({
                                salesCapacity: {
                                  repsByYear: {
                                    [yearKey]: num
                                  }
                                }
                              });
                            }
                            setEditingYear(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingYear(null);
                          }}
                          autoFocus
                          min={0}
                          max={100}
                          className="h-12 text-center font-bold"
                        />
                      ) : (
                        <div
                          className="h-12 px-2 py-2 border-2 border-purple-300 rounded cursor-pointer hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center bg-white transition-all"
                          onClick={() => {
                            setEditingYear(year);
                            setEditingYearValue(repsValue.toString());
                          }}
                        >
                          <span className="font-bold text-purple-600 text-xl">{repsValue}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Deals per Rep per Quarter */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600">Deals/Rep/Quarter</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Produttività per Rep</p>
                        <p className="text-xs mb-2">Quanti deal può chiudere 1 sales rep in 1 trimestre (3 mesi).</p>
                        <p className="text-xs font-mono bg-purple-100 p-1 rounded">Capacity/anno = reps × deals/Q × 4</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {editingDeals !== null ? (
                  <Input
                    type="number"
                    value={editingDeals}
                    onChange={(e) => setEditingDeals(e.target.value)}
                    onBlur={async () => {
                      const num = parseInt(editingDeals);
                      if (!isNaN(num) && num >= 1 && num <= 50) {
                        // ✅ Passa solo il campo modificato (deep merge sul backend)
                        await updateGoToMarket({
                          salesCapacity: {
                            dealsPerRepPerQuarter: num
                          }
                        });
                      }
                      setEditingDeals(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    autoFocus
                    min={1}
                    max={50}
                    className="h-10"
                  />
                ) : (
                  <div
                    className="h-10 px-3 py-2 border-2 border-purple-300 rounded cursor-pointer hover:border-purple-500 hover:bg-purple-50 flex items-center justify-between bg-white transition-all"
                    onClick={() => setEditingDeals(salesCapacity.dealsPerRepPerQuarter.toString())}
                  >
                    <span className="font-bold text-purple-600 text-lg">{salesCapacity.dealsPerRepPerQuarter}</span>
                    <span className="text-xs text-gray-500">📊 deals/Q</span>
                  </div>
                )}
              </div>
              
              {/* 🆕 Ramp-Up Months */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600">Ramp-Up (mesi)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Tempo Onboarding</p>
                        <p className="text-xs mb-2">Mesi necessari per portare un nuovo rep a produttività piena (solo Anno 1).</p>
                        <p className="text-xs font-mono bg-orange-100 p-1 rounded">Ramp Factor = (12 - rampUpMonths) / 12</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {editingRampUp !== null ? (
                  <Input
                    type="number"
                    value={editingRampUp}
                    onChange={(e) => setEditingRampUp(e.target.value)}
                    onBlur={async () => {
                      const num = parseInt(editingRampUp);
                      if (!isNaN(num) && num >= 0 && num <= 12) {
                        await updateGoToMarket({
                          salesCapacity: {
                            rampUpMonths: num
                          }
                        });
                      }
                      setEditingRampUp(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    autoFocus
                    min={0}
                    max={12}
                    className="h-10"
                  />
                ) : (
                  <div
                    className="h-10 px-3 py-2 border-2 border-orange-300 rounded cursor-pointer hover:border-orange-500 hover:bg-orange-50 flex items-center justify-between bg-white transition-all"
                    onClick={() => setEditingRampUp(salesCapacity.rampUpMonths.toString())}
                  >
                    <span className="font-bold text-orange-600 text-lg">{salesCapacity.rampUpMonths}</span>
                    <span className="text-xs text-gray-500">⏱️ mesi</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 🆕 BREAKDOWN TRASPARENTE DEL CALCOLO CAPACITY */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-purple-600 rounded">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-bold text-gray-900">Calcolo Capacity Dettagliato</h5>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">Formula Capacity Anno 1</p>
                      <p className="text-xs font-mono bg-white p-2 rounded mb-2">
                        Capacity = reps × deals/Q × 4 × ramp_factor
                      </p>
                      <p className="text-xs mb-1">
                        <strong>ramp_factor:</strong> Penalità primo anno per tempo onboarding team
                      </p>
                      <p className="text-xs font-mono bg-white p-1 rounded">
                        ramp_factor = (12 - rampUpMonths) / 12
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Grid calcolo step-by-step */}
              <div className="grid grid-cols-5 gap-2 text-center mb-3">
                <div className="p-2 bg-white rounded border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">👥 Reps Y1</div>
                  <div className="text-xl font-bold text-purple-600">{repsByYear.y1}</div>
                </div>
                
                <div className="flex items-center justify-center text-purple-400">×</div>
                
                <div className="p-2 bg-white rounded border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">📊 Deals/Q</div>
                  <div className="text-xl font-bold text-purple-600">{salesCapacity.dealsPerRepPerQuarter}</div>
                </div>
                
                <div className="flex items-center justify-center text-purple-400">×</div>
                
                <div className="p-2 bg-white rounded border border-purple-200">
                  <div className="text-xs text-gray-500 mb-1">📅 Quarters</div>
                  <div className="text-xl font-bold text-purple-600">4</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-3">
                <div className="text-purple-400 text-2xl">↓</div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border-2 border-purple-400">
                <div className="text-xs text-gray-600 mb-1">Capacity Teorica Anno 1 (senza ramp-up)</div>
                <div className="text-3xl font-bold text-purple-600 text-center">
                  {repsByYear.y1 * salesCapacity.dealsPerRepPerQuarter * 4}
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                  dispositivi/anno
                </div>
              </div>
              
              {/* Anno 1 con ramp-up */}
              {salesCapacity.rampUpMonths > 0 && (
                <>
                  <div className="flex items-center justify-center my-2">
                    <div className="text-orange-500 text-sm">× Ramp Factor Anno 1</div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-orange-700">
                        <strong>Ramp-Up:</strong> {salesCapacity.rampUpMonths} mesi onboarding
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-orange-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs mb-1">Il team non è operativo al 100% nel primo anno.</p>
                            <p className="text-xs font-mono bg-white p-1 rounded">
                              Factor = (12 - {salesCapacity.rampUpMonths}) / 12 = {((12 - salesCapacity.rampUpMonths) / 12).toFixed(2)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 text-center">
                      {projections[0]?.capacity || 0}
                    </div>
                    <div className="text-xs text-center text-orange-700 mt-1">
                      dispositivi effettivi Anno 1
                    </div>
                  </div>
                </>
              )}
              
              {/* Anni successivi */}
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-900">
                <strong>📈 Anni 2-5:</strong> Capacity piena = {salesCapacity.reps * salesCapacity.dealsPerRepPerQuarter * 4} dispositivi/anno (senza penalità ramp-up)
              </div>
            </div>
          </div>
          
          {/* === CONVERSION FUNNEL === */}
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold">Funnel di Conversione</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Tassi di conversione tra le fasi del sales funnel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-3">
              {/* Lead → Demo */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Lead → Demo</span>
                  <span className="font-semibold text-blue-600">
                    {(conversionFunnel.lead_to_demo * 100).toFixed(0)}%
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Lead → Demo %</p>
                        <p className="text-xs mb-2">Percentuale di lead che accettano una demo del prodotto.</p>
                        <p className="text-xs font-mono bg-blue-100 p-1 rounded">
                          Demos = Leads × {(conversionFunnel.lead_to_demo * 100).toFixed(0)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[conversionFunnel.lead_to_demo * 100]}
                  onValueChange={async ([value]) => {
                    // ✅ Passa solo il campo modificato
                    await updateGoToMarket({
                      conversionFunnel: {
                        lead_to_demo: value / 100
                      }
                    });
                  }}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
              
              {/* Demo → Pilot */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Demo → Pilot</span>
                  <span className="font-semibold text-blue-600">
                    {(conversionFunnel.demo_to_pilot * 100).toFixed(0)}%
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Demo → Pilot %</p>
                        <p className="text-xs mb-2">Percentuale di demo che si convertono in progetti pilot/POC.</p>
                        <p className="text-xs font-mono bg-blue-100 p-1 rounded">
                          Pilots = Demos × {(conversionFunnel.demo_to_pilot * 100).toFixed(0)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[conversionFunnel.demo_to_pilot * 100]}
                  onValueChange={async ([value]) => {
                    // ✅ Passa solo il campo modificato
                    await updateGoToMarket({
                      conversionFunnel: {
                        demo_to_pilot: value / 100
                      }
                    });
                  }}
                  min={10}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
              
              {/* Pilot → Deal */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pilot → Deal</span>
                  <span className="font-semibold text-blue-600">
                    {(conversionFunnel.pilot_to_deal * 100).toFixed(0)}%
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Pilot → Deal %</p>
                        <p className="text-xs mb-2">Percentuale di pilot che si convertono in contratti chiusi (deals).</p>
                        <p className="text-xs font-mono bg-blue-100 p-1 rounded mb-2">
                          Deals = Pilots × {(conversionFunnel.pilot_to_deal * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Efficienza Totale Funnel:</strong> {(conversionFunnel.lead_to_demo * conversionFunnel.demo_to_pilot * conversionFunnel.pilot_to_deal * 100).toFixed(1)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[conversionFunnel.pilot_to_deal * 100]}
                  onValueChange={async ([value]) => {
                    // ✅ Passa solo il campo modificato
                    await updateGoToMarket({
                      conversionFunnel: {
                        pilot_to_deal: value / 100
                      }
                    });
                  }}
                  min={20}
                  max={80}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* 🆕 IMPATTO BUSINESS DEL FUNNEL - INTERATTIVO */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-green-600 rounded">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-bold text-gray-900">Simulatore Impatto Business</h5>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">Strumento di Pianificazione</p>
                      <p className="text-xs mb-2">
                        Modifica i parametri per stimare <strong>lead necessari</strong> e <strong>budget marketing</strong>.
                      </p>
                      <p className="text-xs">
                        Puoi testare diversi scenari per ottimizzare la strategia commerciale.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* CONTROLLI INTERATTIVI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {/* Selettore Anno */}
                <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">📅 Anno</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full p-2 border rounded text-sm font-semibold bg-gray-50"
                  >
                    <option value={1}>Anno 1</option>
                    <option value={2}>Anno 2</option>
                    <option value={3}>Anno 3</option>
                    <option value={4}>Anno 4</option>
                    <option value={5}>Anno 5</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    Reps: <strong>{repsByYear[`y${selectedYear}` as keyof typeof repsByYear]}</strong>
                  </div>
                </div>
                
                {/* Costo per Lead */}
                <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">💰 Costo/Lead</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">€</span>
                    <input
                      type="number"
                      value={costPerLead}
                      onChange={(e) => setCostPerLead(Number(e.target.value))}
                      className="w-full p-2 border rounded text-sm font-semibold"
                      min={10}
                      max={500}
                      step={5}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    CAC stimato
                  </div>
                </div>
                
                {/* 🆕 Device Price */}
                <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">💎 Prezzo Device</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">€</span>
                    <input
                      type="number"
                      value={devicePrice}
                      onChange={(e) => setDevicePrice(Number(e.target.value))}
                      className="w-full p-2 border rounded text-sm font-semibold"
                      min={10000}
                      max={150000}
                      step={1000}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Revenue per unit
                  </div>
                </div>
                
                {/* Deals per Rep */}
                <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">📊 Deals/Rep/Q</label>
                  <input
                    type="number"
                    value={dealsPerRepOverride ?? salesCapacity.dealsPerRepPerQuarter}
                    onChange={(e) => setDealsPerRepOverride(Number(e.target.value))}
                    className="w-full p-2 border rounded text-sm font-semibold"
                    min={1}
                    max={15}
                    step={1}
                  />
                  <button
                    onClick={() => setDealsPerRepOverride(null)}
                    className="text-xs text-blue-600 hover:underline mt-1"
                  >
                    Reset a default ({salesCapacity.dealsPerRepPerQuarter})
                  </button>
                </div>
              </div>
              
              {(() => {
                // Usa calcoli già computati in useMemo
                if (!currentYearCalculations) return null;
                
                const {
                  reps: repsForYear,
                  rampFactor,
                  capacity: capacityWithRamp,
                  funnelEfficiency,
                  leadsNeeded,
                  leadsMonthly,
                  budgetMarketing: marketingBudget,
                  budgetMonthly,
                  cacEffettivo,
                  marketingPercentage,
                  productivityRepYear
                } = currentYearCalculations;
                
                const dealsPerQ = dealsPerRepOverride ?? salesCapacity.dealsPerRepPerQuarter;
                
                return (
                  <div className="space-y-3">
                    {/* Efficienza Totale Funnel */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <div className="text-xs text-gray-600">Efficienza Totale Funnel</div>
                        <div className="text-sm text-gray-500 mt-0.5">Lead → Deal conversion rate</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {(funnelEfficiency * 100).toFixed(2)}%
                      </div>
                    </div>
                    
                    {/* Capacity Anno Selezionato */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <div className="text-xs text-gray-600">Capacity Anno {selectedYear} {selectedYear === 1 && '(con ramp-up)'}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {repsForYear} reps × {dealsPerQ} deals/Q × 4Q {selectedYear === 1 && `× ${rampFactor.toFixed(2)}`}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(capacityWithRamp)}
                      </div>
                    </div>
                    
                    {/* Lead Necessari */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">📢 Lead Necessari Anno {selectedYear}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {Math.round(capacityWithRamp)} deals ÷ {(funnelEfficiency * 100).toFixed(2)}% efficienza
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {leadsNeeded.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Budget Marketing */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">💰 Budget Marketing Anno {selectedYear}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {leadsNeeded.toLocaleString()} lead × €{costPerLead}/lead
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        €{(marketingBudget / 1000).toFixed(0)}K
                      </div>
                    </div>
                    
                    {/* Breakdown Mensile/Trimestrale */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded border border-green-200">
                        <div className="text-xs text-gray-600">Lead/Mese</div>
                        <div className="text-lg font-bold text-blue-600">{leadsMonthly}</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-green-200">
                        <div className="text-xs text-gray-600">Budget/Mese</div>
                        <div className="text-lg font-bold text-orange-600">€{(budgetMonthly / 1000).toFixed(1)}K</div>
                      </div>
                    </div>
                    
                    {/* Insights Avanzati */}
                    <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                      <div className="text-xs font-semibold text-green-800 mb-2">💡 Insights & Metriche</div>
                      <div className="space-y-1 text-xs text-green-700">
                        <div>• <strong>Efficienza funnel:</strong> ogni 100 lead → {(funnelEfficiency * 100).toFixed(1)} deal</div>
                        <div>• <strong>CAC effettivo:</strong> €{cacEffettivo.toLocaleString()} per deal (cost per lead / efficienza)</div>
                        <div>• <strong>Budget/Ricavi:</strong> {marketingPercentage.toFixed(1)}% (assumendo €{(devicePrice/1000).toFixed(0)}K/dispositivo)</div>
                        <div>• <strong>Produttività rep:</strong> {productivityRepYear} deals/anno/rep</div>
                      </div>
                    </div>
                    
                    {/* Suggerimenti Ottimizzazione */}
                    {marketingPercentage > 15 && (
                      <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                        <div className="text-xs font-semibold text-red-800 mb-1">⚠️ Budget Marketing Alto</div>
                        <div className="text-xs text-red-700">
                          Il budget marketing supera il 15% dei ricavi. Considera:
                          <ul className="ml-4 mt-1 list-disc">
                            <li>Migliorare efficienza funnel (attualmente {(funnelEfficiency * 100).toFixed(2)}%)</li>
                            <li>Ridurre costo per lead (attualmente €{costPerLead})</li>
                            <li>Aumentare produttività reps</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default GTMEngineCard;
