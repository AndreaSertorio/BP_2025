'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Globe, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface PricingStrategyCardProps {
  geoPricingEnabled: boolean;
  setGeoPricingEnabled: (enabled: boolean) => void;
  geoPriceMultipliers: {
    italia: number;
    europa: number;
    usa: number;
    cina: number;
  };
  setGeoPriceMultipliers: (multipliers: any) => void;
}

export function PricingStrategyCard({
  geoPricingEnabled,
  setGeoPricingEnabled,
  geoPriceMultipliers,
  setGeoPriceMultipliers
}: PricingStrategyCardProps) {
  
  const handleMultiplierChange = (region: 'italia' | 'europa' | 'usa' | 'cina', value: number[]) => {
    setGeoPriceMultipliers({
      ...geoPriceMultipliers,
      [region]: value[0] / 100
    });
  };
  
  const getVariationBadge = (multiplier: number) => {
    if (multiplier === 1.0) return null;
    const pct = ((multiplier - 1) * 100).toFixed(0);
    const isPositive = multiplier > 1.0;
    
    return (
      <Badge 
        variant="outline" 
        className={`ml-2 ${isPositive ? 'bg-green-50 border-green-300 text-green-700' : 'bg-orange-50 border-orange-300 text-orange-700'}`}
      >
        {isPositive ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
        {isPositive ? '+' : ''}{pct}%
      </Badge>
    );
  };
  
  return (
    <Card className={`p-6 transition-all ${geoPricingEnabled ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className={`h-6 w-6 ${geoPricingEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Strategy</h3>
            <p className="text-sm text-gray-500">Moltiplicatori geografici e sconti volume</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={geoPricingEnabled ? "default" : "outline"} className={geoPricingEnabled ? "bg-blue-600" : ""}>
            {geoPricingEnabled ? 'Attivo' : 'Disattivato'}
          </Badge>
          <Switch 
            checked={geoPricingEnabled}
            onCheckedChange={setGeoPricingEnabled}
          />
        </div>
      </div>
      
      {geoPricingEnabled && (
        <div className="space-y-6">
          {/* Geographic Pricing */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              🌍 Pricing Geografico
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Moltiplicatori di prezzo per regione geografica</p>
                </TooltipContent>
              </Tooltip>
            </h4>
            
            <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
              {/* Italia */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇹</span>
                    <span className="font-medium text-gray-900">Italia</span>
                    {getVariationBadge(geoPriceMultipliers.italia)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {geoPriceMultipliers.italia.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[geoPriceMultipliers.italia * 100]}
                  onValueChange={(value) => handleMultiplierChange('italia', value)}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Prezzo base di riferimento</p>
              </div>
              
              {/* Europa */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span>
                    <span className="font-medium text-gray-900">Europa</span>
                    {getVariationBadge(geoPriceMultipliers.europa)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {geoPriceMultipliers.europa.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[geoPriceMultipliers.europa * 100]}
                  onValueChange={(value) => handleMultiplierChange('europa', value)}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Premium per mercato EU (regolamentazione, supporto multilingua)</p>
              </div>
              
              {/* USA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    <span className="font-medium text-gray-900">USA</span>
                    {getVariationBadge(geoPriceMultipliers.usa)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {geoPriceMultipliers.usa.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[geoPriceMultipliers.usa * 100]}
                  onValueChange={(value) => handleMultiplierChange('usa', value)}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Premium per mercato USA (FDA, supporto locale, costi operativi)</p>
              </div>
              
              {/* Cina */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇨🇳</span>
                    <span className="font-medium text-gray-900">Cina</span>
                    {getVariationBadge(geoPriceMultipliers.cina)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {geoPriceMultipliers.cina.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[geoPriceMultipliers.cina * 100]}
                  onValueChange={(value) => handleMultiplierChange('cina', value)}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Discount per penetrazione mercato emergente</p>
              </div>
            </div>
          </div>
          
          {/* Volume Discounts - Placeholder */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              📊 Sconti Volume
              <Badge variant="outline" className="ml-2 text-xs">
                Disattivato
              </Badge>
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-600">
                Sconti per grandi ordini da configurare (1-5 unità: 0%, 6-20: -10%, 21+: -15%)
              </p>
            </div>
          </div>
          
          {/* Esempio calcolo */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Esempio Calcolo</h4>
            <div className="text-xs space-y-1 text-blue-800">
              <div className="flex justify-between">
                <span>Dispositivo portatile (Italia):</span>
                <span className="font-medium">€25,000 × {geoPriceMultipliers.italia.toFixed(2)} = €{(25000 * geoPriceMultipliers.italia).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispositivo portatile (USA):</span>
                <span className="font-medium">€25,000 × {geoPriceMultipliers.usa.toFixed(2)} = €{(25000 * geoPriceMultipliers.usa).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SaaS mensile (Europa):</span>
                <span className="font-medium">€500 × {geoPriceMultipliers.europa.toFixed(2)} = €{(500 * geoPriceMultipliers.europa).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
