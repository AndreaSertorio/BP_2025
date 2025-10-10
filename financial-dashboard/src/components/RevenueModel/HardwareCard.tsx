'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Package, Info, TrendingUp, DollarSign } from 'lucide-react';

interface HardwareCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  asp: number;
  setAsp: (asp: number) => void;
  unitCost: number;
  setUnitCost: (unitCost: number) => void;
  warrantyPct: number;
  setWarrantyPct: (pct: number) => void;
  aspByType: {
    carrellati: number;
    portatili: number;
    palmari: number;
  };
  setAspByType: (aspByType: any) => void;
  cogsMarginByType: {
    carrellati: number;
    portatili: number;
    palmari: number;
  };
  setCogsMarginByType: (margins: any) => void;
}

export function HardwareCard({
  enabled,
  setEnabled,
  asp,
  setAsp,
  unitCost,
  setUnitCost,
  warrantyPct,
  setWarrantyPct,
  aspByType,
  setAspByType,
  cogsMarginByType,
  setCogsMarginByType
}: HardwareCardProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [editingAsp, setEditingAsp] = useState<string | null>(null);
  const [editingUnitCost, setEditingUnitCost] = useState<string | null>(null);
  const [editingTypeAsp, setEditingTypeAsp] = useState<{ type: string; value: string } | null>(null);
  
  // Calcoli derivati
  const grossMargin = unitCost > 0 ? ((asp - unitCost) / asp * 100).toFixed(1) : 0;
  const warrantyAmount = (asp * warrantyPct).toFixed(0);
  
  const handleAspChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setAsp(num);
    }
  };
  
  const handleUnitCostChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setUnitCost(num);
    }
  };
  
  const handleTypeAspChange = (type: 'carrellati' | 'portatili' | 'palmari', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setAspByType({ ...aspByType, [type]: num });
    }
  };
  
  const handleMarginChange = (type: 'carrellati' | 'portatili' | 'palmari', value: number[]) => {
    setCogsMarginByType({ ...cogsMarginByType, [type]: value[0] / 100 });
  };
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className={`h-6 w-6 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hardware</h3>
            <p className="text-sm text-gray-500">Vendita dispositivi ecografici (CapEx cliente)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-blue-600" : ""}>
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
          {/* Parametri principali */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* ASP Medio */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                ASP Medio
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average Selling Price - Prezzo medio di vendita ponderato</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              {editingAsp !== null ? (
                <Input
                  type="number"
                  value={editingAsp}
                  onChange={(e) => setEditingAsp(e.target.value)}
                  onBlur={() => {
                    handleAspChange(editingAsp);
                    setEditingAsp(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAspChange(editingAsp);
                      setEditingAsp(null);
                    }
                  }}
                  className="h-9"
                  autoFocus
                />
              ) : (
                <div 
                  className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors flex items-center"
                  onClick={() => setEditingAsp(asp.toString())}
                >
                  <span className="font-medium text-gray-900">€{asp.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {/* COGS Unitario */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                COGS Unitario
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cost of Goods Sold - Costo di produzione per unità</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              {editingUnitCost !== null ? (
                <Input
                  type="number"
                  value={editingUnitCost}
                  onChange={(e) => setEditingUnitCost(e.target.value)}
                  onBlur={() => {
                    handleUnitCostChange(editingUnitCost);
                    setEditingUnitCost(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnitCostChange(editingUnitCost);
                      setEditingUnitCost(null);
                    }
                  }}
                  className="h-9"
                  autoFocus
                />
              ) : (
                <div 
                  className="h-9 px-3 py-2 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors flex items-center"
                  onClick={() => setEditingUnitCost(unitCost.toString())}
                >
                  <span className="font-medium text-gray-900">€{unitCost.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {/* Margine Lordo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Margine Lordo</label>
              <div className="h-9 px-3 py-2 rounded-md border border-green-200 bg-green-50 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                <span className="font-semibold text-green-700">{grossMargin}%</span>
              </div>
            </div>
            
            {/* Garanzia */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                Garanzia Annua
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentuale ASP dedicata a garanzia/anno</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{(warrantyPct * 100).toFixed(1)}%</span>
                  <span className="text-sm font-medium text-gray-900">€{warrantyAmount}/anno</span>
                </div>
                <Slider
                  value={[warrantyPct * 100]}
                  onValueChange={(value) => setWarrantyPct(value[0] / 100)}
                  min={0}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Dettagli per tipologia */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-3 text-blue-600 hover:text-blue-700"
            >
              {showDetails ? '▼' : '▶'} Dettaglio per Tipologia
            </Button>
            
            {showDetails && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {/* Carrellati */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 font-medium text-gray-700 mb-1">
                    🚛 Carrellati
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ASP</label>
                    {editingTypeAsp?.type === 'carrellati' ? (
                      <Input
                        type="number"
                        value={editingTypeAsp.value}
                        onChange={(e) => setEditingTypeAsp({ type: 'carrellati', value: e.target.value })}
                        onBlur={() => {
                          if (editingTypeAsp) {
                            handleTypeAspChange('carrellati', editingTypeAsp.value);
                          }
                          setEditingTypeAsp(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingTypeAsp) {
                            handleTypeAspChange('carrellati', editingTypeAsp.value);
                            setEditingTypeAsp(null);
                          }
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-blue-300 cursor-pointer text-sm flex items-center"
                        onClick={() => setEditingTypeAsp({ type: 'carrellati', value: aspByType.carrellati.toString() })}
                      >
                        €{aspByType.carrellati.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Margine</label>
                    <div className="text-sm font-medium text-green-700">
                      {(cogsMarginByType.carrellati * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Slider
                      value={[cogsMarginByType.carrellati * 100]}
                      onValueChange={(value) => handleMarginChange('carrellati', value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Portatili */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 font-medium text-gray-700 mb-1">
                    💼 Portatili
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ASP</label>
                    {editingTypeAsp?.type === 'portatili' ? (
                      <Input
                        type="number"
                        value={editingTypeAsp.value}
                        onChange={(e) => setEditingTypeAsp({ type: 'portatili', value: e.target.value })}
                        onBlur={() => {
                          if (editingTypeAsp) {
                            handleTypeAspChange('portatili', editingTypeAsp.value);
                          }
                          setEditingTypeAsp(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingTypeAsp) {
                            handleTypeAspChange('portatili', editingTypeAsp.value);
                            setEditingTypeAsp(null);
                          }
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-blue-300 cursor-pointer text-sm flex items-center"
                        onClick={() => setEditingTypeAsp({ type: 'portatili', value: aspByType.portatili.toString() })}
                      >
                        €{aspByType.portatili.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Margine</label>
                    <div className="text-sm font-medium text-green-700">
                      {(cogsMarginByType.portatili * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Slider
                      value={[cogsMarginByType.portatili * 100]}
                      onValueChange={(value) => handleMarginChange('portatili', value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Palmari */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 font-medium text-gray-700 mb-1">
                    📱 Palmari
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ASP</label>
                    {editingTypeAsp?.type === 'palmari' ? (
                      <Input
                        type="number"
                        value={editingTypeAsp.value}
                        onChange={(e) => setEditingTypeAsp({ type: 'palmari', value: e.target.value })}
                        onBlur={() => {
                          if (editingTypeAsp) {
                            handleTypeAspChange('palmari', editingTypeAsp.value);
                          }
                          setEditingTypeAsp(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingTypeAsp) {
                            handleTypeAspChange('palmari', editingTypeAsp.value);
                            setEditingTypeAsp(null);
                          }
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="h-8 px-2 py-1 rounded border border-gray-200 hover:border-blue-300 cursor-pointer text-sm flex items-center"
                        onClick={() => setEditingTypeAsp({ type: 'palmari', value: aspByType.palmari.toString() })}
                      >
                        €{aspByType.palmari.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Margine</label>
                    <div className="text-sm font-medium text-green-700">
                      {(cogsMarginByType.palmari * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Slider
                      value={[cogsMarginByType.palmari * 100]}
                      onValueChange={(value) => handleMarginChange('palmari', value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
