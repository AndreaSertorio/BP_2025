'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { DevicePriceEditor, SalesMixEditor, SalesCycleEditor } from '@/components/GlobalSettings';
import { 
  Settings, 
  TrendingUp, 
  Target,
  BarChart3,
  Zap
} from 'lucide-react';

/**
 * GTM Engine Unified
 * 
 * Componente unificato e compatto per il Go-To-Market Engine
 * Sostituisce GTMEngineCard riducendo da 997 a ~540 righe (-46%)
 * 
 * Features:
 * - Tabs per separare logicamente le sezioni
 * - Accordion per compattare parametri
 * - Integra Global Settings (Device Price, Sales Mix, Sales Cycle)
 * - Simulatore interattivo
 * - Confronto scenari
 */
export function GTMEngineUnified() {
  const { data, updateGoToMarket, updateMarketingPlan } = useDatabase();
  
  const goToMarket = data?.goToMarket;
  const tamSamSomEcografi = data?.configurazioneTamSamSom?.ecografi;
  
  // Stati
  const [activeTab, setActiveTab] = useState<string>('parametri');
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [costPerLead, setCostPerLead] = useState<number>(50);
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Stati editing inline
  const [editingReps, setEditingReps] = useState<number | null>(null);
  const [editingDeals, setEditingDeals] = useState<string | null>(null);
  const [editingRampUp, setEditingRampUp] = useState<string | null>(null);
  
  // Traccia ultimo salvataggio per evitare loop
  const lastSavedRef = React.useRef<{
    year: number;
    costPerLead: number;
    capacity: number;
  } | null>(null);
  
  // Carica valori salvati all'avvio
  useEffect(() => {
    if (!data?.goToMarket?.marketingPlan || initialized) return;
    
    const marketingPlan = data.goToMarket.marketingPlan;
    if (marketingPlan.globalSettings?.costPerLead) {
      setCostPerLead(marketingPlan.globalSettings.costPerLead);
    }
    
    setInitialized(true);
  }, [data, initialized]);
  
  // Calcoli anno corrente
  const currentYearCalculations = useMemo(() => {
    if (!goToMarket) return null;
    
    const { salesCapacity, conversionFunnel } = goToMarket;
    const devicePrice = data?.globalSettings?.business?.devicePrice || 50000;
    
    const repsByYear = salesCapacity.repsByYear || {};
    const yearKey = `y${selectedYear}` as keyof typeof repsByYear;
    const repsForYear = repsByYear[yearKey] || 0;
    const dealsPerQ = salesCapacity.dealsPerRepPerQuarter;
    
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
  }, [goToMarket, selectedYear, costPerLead, data]);
  
  // Auto-save marketing plan - SOLO quando utente modifica
  useEffect(() => {
    if (!initialized || !currentYearCalculations || !goToMarket || isSaving) return;
    
    // Confronta con l'ultimo salvato per evitare loop
    const hasChanged = 
      !lastSavedRef.current ||
      lastSavedRef.current.year !== selectedYear ||
      lastSavedRef.current.costPerLead !== costPerLead ||
      lastSavedRef.current.capacity !== currentYearCalculations.capacity;
    
    if (!hasChanged) return;
    
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      
      try {
        const projection = {
          costPerLead,
          calculated: currentYearCalculations
        };
        
        await updateMarketingPlan(selectedYear, projection);
        
        // Aggiorna il ref con i valori salvati
        lastSavedRef.current = {
          year: selectedYear,
          costPerLead,
          capacity: currentYearCalculations.capacity
        };
        
        console.log('✅ Marketing Plan salvato per Anno', selectedYear);
      } catch (error) {
        console.error('❌ Errore salvataggio Marketing Plan:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500); // Debounce 1.5s
    
    return () => clearTimeout(timeoutId);
  }, [costPerLead, selectedYear, currentYearCalculations?.capacity, initialized, isSaving]);
  
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
  
  const { salesCapacity, conversionFunnel, channelMix, adoptionCurve } = goToMarket;
  const repsByYear = salesCapacity.repsByYear || {};
  
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Go-To-Market Engine</h2>
            <p className="text-sm text-gray-600">Bottom-Up: Capacità Commerciale + Simulatore</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">
            Channel: {((1 - (channelMix.distributors * channelMix.distributorMargin)) * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline" className="bg-white">
            Funnel: {((conversionFunnel.lead_to_demo * conversionFunnel.demo_to_pilot * conversionFunnel.pilot_to_deal) * 100).toFixed(1)}%
          </Badge>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="parametri" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Parametri Base
          </TabsTrigger>
          <TabsTrigger value="simulatore" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Simulatore
          </TabsTrigger>
          <TabsTrigger value="scenari" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Scenari
          </TabsTrigger>
        </TabsList>
        
        {/* TAB 1: PARAMETRI BASE */}
        <TabsContent value="parametri" className="space-y-4">
          
          <Accordion type="multiple" defaultValue={['team', 'cycle', 'funnel']} className="space-y-3">
            
            {/* Team & Capacity */}
            <AccordionItem value="team" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Team & Produttività</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Reps per Anno */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">👥 Reps per Anno</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(year => {
                        const yearKey = `y${year}` as keyof typeof repsByYear;
                        const repsValue = repsByYear[yearKey] || 0;
                        
                        return (
                          <div key={year}>
                            <div className="text-xs text-gray-500 mb-1 text-center">Y{year}</div>
                            {editingReps === year ? (
                              <Input
                                type="number"
                                value={repsValue}
                                onChange={async (e) => {
                                  const num = parseInt(e.target.value);
                                  if (!isNaN(num) && num >= 0 && num <= 50) {
                                    await updateGoToMarket({
                                      salesCapacity: {
                                        repsByYear: { [yearKey]: num }
                                      }
                                    });
                                  }
                                }}
                                onBlur={() => setEditingReps(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingReps(null)}
                                autoFocus
                                min={0}
                                max={50}
                                className="w-16 h-8 text-center text-sm"
                              />
                            ) : (
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-purple-100 w-16 h-8 flex items-center justify-center font-bold text-purple-600"
                                onClick={() => setEditingReps(year)}
                              >
                                {repsValue}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Deals/Rep/Quarter + Ramp-Up */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600 mb-1 block">📊 Deals/Rep/Quarter</Label>
                      {editingDeals !== null ? (
                        <Input
                          type="number"
                          value={editingDeals}
                          onChange={(e) => setEditingDeals(e.target.value)}
                          onBlur={async () => {
                            const num = parseInt(editingDeals);
                            if (!isNaN(num) && num >= 1 && num <= 50) {
                              await updateGoToMarket({
                                salesCapacity: { dealsPerRepPerQuarter: num }
                              });
                            }
                            setEditingDeals(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          autoFocus
                          className="h-9"
                        />
                      ) : (
                        <div
                          className="h-9 px-3 py-2 border-2 border-purple-300 rounded cursor-pointer hover:border-purple-500 hover:bg-purple-50 flex items-center justify-between bg-white"
                          onClick={() => setEditingDeals(salesCapacity.dealsPerRepPerQuarter.toString())}
                        >
                          <span className="font-bold text-purple-600">{salesCapacity.dealsPerRepPerQuarter}</span>
                          <span className="text-xs text-gray-500">deals/Q</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-600 mb-1 block">⏱️ Ramp-Up (mesi)</Label>
                      {editingRampUp !== null ? (
                        <Input
                          type="number"
                          value={editingRampUp}
                          onChange={(e) => setEditingRampUp(e.target.value)}
                          onBlur={async () => {
                            const num = parseInt(editingRampUp);
                            if (!isNaN(num) && num >= 0 && num <= 12) {
                              await updateGoToMarket({
                                salesCapacity: { rampUpMonths: num }
                              });
                            }
                            setEditingRampUp(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          autoFocus
                          className="h-9"
                        />
                      ) : (
                        <div
                          className="h-9 px-3 py-2 border-2 border-orange-300 rounded cursor-pointer hover:border-orange-500 hover:bg-orange-50 flex items-center justify-between bg-white"
                          onClick={() => setEditingRampUp(salesCapacity.rampUpMonths.toString())}
                        >
                          <span className="font-bold text-orange-600">{salesCapacity.rampUpMonths}</span>
                          <span className="text-xs text-gray-500">mesi</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
                
              </AccordionContent>
            </AccordionItem>
            
            {/* Global Settings */}
            <AccordionItem value="global" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Impostazioni Globali</span>
                  <Badge variant="secondary" className="text-xs">SSOT</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <DevicePriceEditor />
                <SalesMixEditor />
              </AccordionContent>
            </AccordionItem>
            
            {/* Sales Cycle */}
            <AccordionItem value="cycle" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold">Ciclo Vendita</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <SalesCycleEditor />
              </AccordionContent>
            </AccordionItem>
            
            {/* Conversion Funnel */}
            <AccordionItem value="funnel" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Conversion Funnel</span>
                  <Badge variant="outline" className="text-xs">
                    {((conversionFunnel.lead_to_demo * conversionFunnel.demo_to_pilot * conversionFunnel.pilot_to_deal) * 100).toFixed(1)}% total
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                
                {/* Lead → Demo */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-gray-700">Lead → Demo</Label>
                    <span className="text-sm font-semibold text-blue-600">
                      {(conversionFunnel.lead_to_demo * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[conversionFunnel.lead_to_demo * 100]}
                    onValueChange={async ([value]) => {
                      await updateGoToMarket({
                        conversionFunnel: { lead_to_demo: value / 100 }
                      });
                    }}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                
                {/* Demo → Pilot */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-gray-700">Demo → Pilot</Label>
                    <span className="text-sm font-semibold text-blue-600">
                      {(conversionFunnel.demo_to_pilot * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[conversionFunnel.demo_to_pilot * 100]}
                    onValueChange={async ([value]) => {
                      await updateGoToMarket({
                        conversionFunnel: { demo_to_pilot: value / 100 }
                      });
                    }}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                
                {/* Pilot → Deal */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-gray-700">Pilot → Deal</Label>
                    <span className="text-sm font-semibold text-blue-600">
                      {(conversionFunnel.pilot_to_deal * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[conversionFunnel.pilot_to_deal * 100]}
                    onValueChange={async ([value]) => {
                      await updateGoToMarket({
                        conversionFunnel: { pilot_to_deal: value / 100 }
                      });
                    }}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                
              </AccordionContent>
            </AccordionItem>
            
            {/* Channel Mix */}
            <AccordionItem value="channel" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">Channel Mix</span>
                  <Badge variant="outline" className="text-xs">
                    {((1 - (channelMix.distributors * channelMix.distributorMargin)) * 100).toFixed(0)}% direct
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                
                {/* % Vendite via Distributori */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-gray-700">🏪 % Vendite via Distributori</Label>
                    <span className="text-sm font-semibold text-indigo-600">
                      {(channelMix.distributors * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[channelMix.distributors * 100]}
                    onValueChange={async ([value]) => {
                      await updateGoToMarket({
                        channelMix: { distributors: value / 100 }
                      });
                    }}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Direct: {((1 - channelMix.distributors) * 100).toFixed(0)}%
                  </div>
                </div>
                
                {/* Margine Distributore */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-gray-700">💰 Margine Distributore</Label>
                    <span className="text-sm font-semibold text-indigo-600">
                      {(channelMix.distributorMargin * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[channelMix.distributorMargin * 100]}
                    onValueChange={async ([value]) => {
                      await updateGoToMarket({
                        channelMix: { distributorMargin: value / 100 }
                      });
                    }}
                    min={0}
                    max={50}
                    step={5}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Revenue netto: {((1 - channelMix.distributorMargin) * 100).toFixed(0)}%
                  </div>
                </div>
                
                {/* Efficienza Channel */}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">📊 Efficienza Canale Totale</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {((1 - (channelMix.distributors * channelMix.distributorMargin)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Formula: 100% - (% distributori × margine)
                  </div>
                </div>
                
              </AccordionContent>
            </AccordionItem>
            
            {/* Adoption Curve */}
            <AccordionItem value="adoption" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Curva Adozione Mercato</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                
                <div className="space-y-3">
                  {/* Adoption per Anno */}
                  {[1, 2, 3, 4, 5].map(year => {
                    const yearKey = `y${year}` as keyof typeof adoptionCurve;
                    const adoptionValue = (adoptionCurve[yearKey] || 0) * 100;
                    
                    return (
                      <div key={year}>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-sm text-gray-700">Anno {year}</Label>
                          <span className="text-sm font-semibold text-emerald-600">
                            {adoptionValue.toFixed(0)}%
                          </span>
                        </div>
                        <Slider
                          value={[adoptionValue]}
                          onValueChange={async ([value]) => {
                            await updateGoToMarket({
                              adoptionCurve: { [yearKey]: value / 100 }
                            });
                          }}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <div className="text-xs text-gray-700">
                    <strong>💡 Curva Adozione:</strong> Percentuale del SOM disponibile effettivamente
                    raggiungibile ogni anno. Tiene conto di penetrazione mercato, awareness, maturità prodotto.
                  </div>
                </div>
                
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>
          
        </TabsContent>
        
        {/* TAB 2: SIMULATORE */}
        <TabsContent value="simulatore" className="space-y-4">
          
          {/* Controls */}
          <Card className="p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Anno Selector */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">📅 Anno</Label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full p-2 border-2 border-gray-300 rounded text-sm font-semibold bg-gray-50"
                >
                  {[1, 2, 3, 4, 5].map(y => (
                    <option key={y} value={y}>Anno {y}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Reps: <strong>{repsByYear[`y${selectedYear}` as keyof typeof repsByYear]}</strong>
                </div>
              </div>
              
              {/* Cost per Lead */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">💰 Costo/Lead</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">€</span>
                  <Input
                    type="number"
                    value={costPerLead}
                    onChange={(e) => setCostPerLead(Number(e.target.value))}
                    className="flex-1"
                    min={10}
                    max={500}
                    step={5}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Per generare 1 lead
                </div>
              </div>
              
            </div>
          </Card>
          
          {/* Risultati */}
          {currentYearCalculations && (
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
              <h3 className="font-bold text-gray-900 mb-4">📊 Risultati Anno {selectedYear}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Capacity {selectedYear === 1 && '(con ramp-up)'}</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentYearCalculations.capacity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dispositivi/anno</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Lead Necessari</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentYearCalculations.leadsNeeded}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{currentYearCalculations.leadsMonthly}/mese</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Budget Marketing</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{(currentYearCalculations.budgetMarketing / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-500 mt-1">€{(currentYearCalculations.budgetMonthly / 1000).toFixed(1)}K/mese</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">CAC Effettivo</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{currentYearCalculations.cacEffettivo.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">per deal chiuso</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Revenue Atteso</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{(currentYearCalculations.expectedRevenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentYearCalculations.capacity} × €{((data?.globalSettings?.business?.devicePrice || 50000) / 1000).toFixed(0)}K
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Marketing % Revenue</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentYearCalculations.marketingPercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">budget/ricavi</div>
                </div>
                
              </div>
              
            </Card>
          )}
          
        </TabsContent>
        
        {/* TAB 3: SCENARI */}
        <TabsContent value="scenari" className="space-y-4">
          
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold">Scenari What-If</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Confronta proiezioni Bottom-Up con parametri diversi per scenario. 
              Scenario attuale: <strong>{data?.goToMarket?.scenarioCurrent || 'base'}</strong>
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              
              {/* Scenario Base */}
              <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-600">📊 Base</span>
                  <Badge variant="secondary" className="text-xs">Working</Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Parametri correnti</div>
                  <div>• Reps: 1-2-3-5-7</div>
                  <div>• Funnel: 10/25/50%</div>
                </div>
              </div>
              
              {/* Scenario Prudente */}
              <div className="p-4 bg-white rounded-lg border-2 border-orange-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-orange-600">⚠️ Prudente</span>
                  <Badge variant="outline" className="text-xs">Conservativo</Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Crescita lenta</div>
                  <div>• Reps: 1-2-2-3-4</div>
                  <div>• Funnel: 8/20/40%</div>
                </div>
              </div>
              
              {/* Scenario Ottimista */}
              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-green-600">🚀 Ottimista</span>
                  <Badge variant="outline" className="text-xs">Aggressivo</Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Crescita rapida</div>
                  <div>• Reps: 3-5-8-12-15</div>
                  <div>• Funnel: 15/30/60%</div>
                </div>
              </div>
              
            </div>
          </Card>
          
          {/* Tabella Confronto */}
          <Card className="p-4 bg-white">
            <h3 className="text-md font-bold mb-3">📈 Confronto Capacity (dispositivi/anno)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-2 font-semibold text-gray-700">Anno</th>
                    <th className="text-right p-2 font-semibold text-blue-600">Base</th>
                    <th className="text-right p-2 font-semibold text-orange-600">Prudente</th>
                    <th className="text-right p-2 font-semibold text-green-600">Ottimista</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(year => {
                    const yearKey = `y${year}` as keyof typeof repsByYear;
                    const baseReps = repsByYear[yearKey] || 0;
                    const baseCapacity = Math.round(baseReps * salesCapacity.dealsPerRepPerQuarter * 4 * (year === 1 ? 0.75 : 1));
                    
                    // Simula altri scenari (semplificato)
                    const prudenteReps = [1, 2, 2, 3, 4][year - 1];
                    const prudenteCapacity = Math.round(prudenteReps * 4 * 4 * (year === 1 ? 0.75 : 1));
                    
                    const ottimistaReps = [3, 5, 8, 12, 15][year - 1];
                    const ottimistaCapacity = Math.round(ottimistaReps * 6 * 4 * (year === 1 ? 0.75 : 1));
                    
                    return (
                      <tr key={year} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 font-semibold">Anno {year}</td>
                        <td className="p-2 text-right text-blue-600">{baseCapacity}</td>
                        <td className="p-2 text-right text-orange-600">{prudenteCapacity}</td>
                        <td className="p-2 text-right text-green-600">{ottimistaCapacity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
              <strong>💡 Nota:</strong> I valori Prudente e Ottimista sono simulati per confronto. 
              Per applicare uno scenario, usa il sistema overrides in database.json.
            </div>
          </Card>
          
        </TabsContent>
        
      </Tabs>
      
    </Card>
  );
}

export default GTMEngineUnified;
