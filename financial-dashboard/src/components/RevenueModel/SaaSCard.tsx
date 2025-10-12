'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Server, Info, TrendingUp, Repeat, Zap, Layers } from 'lucide-react';

interface SaaSCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  perDeviceEnabled: boolean;
  setPerDeviceEnabled: (enabled: boolean) => void;
  perScanEnabled: boolean;
  setPerScanEnabled: (enabled: boolean) => void;
  tieredEnabled: boolean;
  setTieredEnabled: (enabled: boolean) => void;
  monthlyFee: number;
  setMonthlyFee: (fee: number) => void;
  annualFee: number;
  setAnnualFee: (fee: number) => void;
  grossMarginPct: number;
  setGrossMarginPct: (pct: number) => void;
  activationRate: number;
  setActivationRate: (rate: number) => void;
}

export function SaaSCard({
  enabled,
  setEnabled,
  perDeviceEnabled,
  setPerDeviceEnabled,
  perScanEnabled,
  setPerScanEnabled,
  tieredEnabled,
  setTieredEnabled,
  monthlyFee,
  setMonthlyFee,
  annualFee,
  setAnnualFee,
  grossMarginPct,
  setGrossMarginPct,
  activationRate,
  setActivationRate
}: SaaSCardProps) {
  const [editingMonthly, setEditingMonthly] = useState<string | null>(null);
  const [editingAnnual, setEditingAnnual] = useState<string | null>(null);
  
  // Calcoli derivati
  const monthlyToAnnual = monthlyFee * 12;
  const discountPct = monthlyToAnnual > 0 ? (((monthlyToAnnual - annualFee) / monthlyToAnnual) * 100).toFixed(1) : 0;
  const cogs = annualFee * (1 - grossMarginPct);
  
  const handlePricingModelChange = (value: string) => {
    setPerDeviceEnabled(value === 'perDevice');
    setPerScanEnabled(value === 'perScan');
    setTieredEnabled(value === 'tiered');
  };
  
  const getCurrentPricingModel = () => {
    if (perDeviceEnabled) return 'perDevice';
    if (perScanEnabled) return 'perScan';
    if (tieredEnabled) return 'tiered';
    return 'perDevice';
  };
  
  const handleMonthlyChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setMonthlyFee(num);
      // Auto-adjust annual (8% discount)
      setAnnualFee(Math.round(num * 12 * 0.92));
    }
  };
  
  const handleAnnualChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setAnnualFee(num);
    }
  };
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Server className={`h-6 w-6 ${enabled ? 'text-purple-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SaaS</h3>
            <p className="text-sm text-gray-500">Abbonamento software ricorrente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-purple-600" : ""}>
            {enabled ? 'Attivo' : 'Disattivato'}
          </Badge>
          <Switch 
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>
      
      {enabled && (
        <>
          {/* Selettore Modello Pricing */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Modello di Pricing
            </label>
            <RadioGroup 
              value={getCurrentPricingModel()} 
              onValueChange={handlePricingModelChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perDevice" id="perDevice" />
                <Label htmlFor="perDevice" className="flex items-center gap-2 cursor-pointer">
                  <Repeat className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Per Dispositivo</span>
                  <span className="text-xs text-gray-500">(Abbonamento mensile/annuale fisso)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perScan" id="perScan" />
                <Label htmlFor="perScan" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Per Scansione</span>
                  <span className="text-xs text-gray-500">(Pay-per-use con revenue share)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tiered" id="tiered" />
                <Label htmlFor="tiered" className="flex items-center gap-2 cursor-pointer">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">A Scaglioni</span>
                  <span className="text-xs text-gray-500">(Pricing basato su volume scansioni)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Parametri Per Dispositivo */}
          {perDeviceEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Monthly Fee */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Fee Mensile
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Abbonamento mensile per dispositivo</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  {editingMonthly !== null ? (
                    <Input
                      type="number"
                      value={editingMonthly}
                      onChange={(e) => setEditingMonthly(e.target.value)}
                      onBlur={() => {
                        handleMonthlyChange(editingMonthly);
                        setEditingMonthly(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleMonthlyChange(editingMonthly);
                          setEditingMonthly(null);
                        }
                      }}
                      className="h-9"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors flex items-center"
                      onClick={() => setEditingMonthly(monthlyFee.toString())}
                    >
                      <span className="font-medium text-gray-900">€{monthlyFee.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">/mese</span>
                    </div>
                  )}
                </div>
                
                {/* Annual Fee */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Fee Annuale
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Abbonamento annuale (scontato)</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  {editingAnnual !== null ? (
                    <Input
                      type="number"
                      value={editingAnnual}
                      onChange={(e) => setEditingAnnual(e.target.value)}
                      onBlur={() => {
                        handleAnnualChange(editingAnnual);
                        setEditingAnnual(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAnnualChange(editingAnnual);
                          setEditingAnnual(null);
                        }
                      }}
                      className="h-9"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors flex items-center"
                      onClick={() => setEditingAnnual(annualFee.toString())}
                    >
                      <span className="font-medium text-gray-900">€{annualFee.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">/anno</span>
                    </div>
                  )}
                </div>
                
                {/* Discount */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Sconto Annuale</label>
                  <div className="h-9 px-3 py-2 rounded-md border border-green-200 bg-green-50 flex items-center justify-between">
                    <span className="text-xs text-green-600">vs mensile×12</span>
                    <span className="font-semibold text-green-700">{discountPct}%</span>
                  </div>
                </div>
              </div>
              
              {/* Gross Margin */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Margine Lordo
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentuale di margine sui ricavi SaaS (costi server, supporto, etc.)</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{(grossMarginPct * 100).toFixed(0)}%</span>
                    <span className="text-sm font-medium text-gray-900">COGS: €{cogs.toFixed(0)}/anno</span>
                  </div>
                  <Slider
                    value={[grossMarginPct * 100]}
                    onValueChange={(value) => setGrossMarginPct(value[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Activation Rate */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Tasso di Attivazione SaaS
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>% di dispositivi venduti che diventano abbonamenti SaaS attivi</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{(activationRate * 100).toFixed(0)}%</span>
                    <span className="text-xs text-gray-500">dei dispositivi venduti → SaaS attivi</span>
                  </div>
                  <Slider
                    value={[activationRate * 100]}
                    onValueChange={(value) => setActivationRate(value[0] / 100)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Preview Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-600 mb-1">MRR (100 devices)</div>
                  <div className="text-lg font-bold text-purple-700">
                    €{(monthlyFee * 100 / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">ARR (100 devices)</div>
                  <div className="text-lg font-bold text-purple-700">
                    €{(annualFee * 100 / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">ARPA (annuale)</div>
                  <div className="text-lg font-bold text-purple-700">
                    €{annualFee.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Parametri Per Scansione */}
          {perScanEnabled && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700 mb-2">
                <Zap className="h-4 w-4 inline mr-1" />
                Modello Pay-per-Use
              </p>
              <p className="text-xs text-gray-600">
                Il pricing per scansione è configurabile nei dettagli del modello.
                Fee per scan: €1.50 | Revenue Share: 30% | Margine: 70%
              </p>
            </div>
          )}
          
          {/* Parametri Tiered */}
          {tieredEnabled && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                <Layers className="h-4 w-4 inline mr-1" />
                Pricing a Scaglioni
              </p>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Piano Starter (fino 100 scans/mese):</span>
                  <span className="font-medium">€300/mese</span>
                </div>
                <div className="flex justify-between">
                  <span>Piano Professional (fino 500 scans/mese):</span>
                  <span className="font-medium">€500/mese</span>
                </div>
                <div className="flex justify-between">
                  <span>Piano Enterprise (illimitato):</span>
                  <span className="font-medium">€800/mese</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
