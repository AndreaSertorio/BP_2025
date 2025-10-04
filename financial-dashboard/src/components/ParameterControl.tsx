'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info, RotateCcw } from 'lucide-react';
import { parameterLimits, parameterDescriptions } from '@/data/scenarios';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface ParameterControlProps {
  parameter: keyof typeof parameterLimits;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function ParameterControl({ 
  parameter, 
  value, 
  onChange, 
  onReset, 
  disabled = false 
}: ParameterControlProps) {
  const [isClient, setIsClient] = useState(false);
  const limits = parameterLimits[parameter];
  const description = parameterDescriptions[parameter];

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const formatValue = (val: number) => {
    if (!isClient) {
      // Server-side: formato semplice
      switch (description.unit) {
        case '%':
          return `${(val * 100).toFixed(1)}%`;
        case '€':
          return `${Math.round(val)} €`;
        case '€/unità':
          return `${Math.round(val)} €`;
        case 'M€':
          return `${val.toFixed(1)}M€`;
        case 'x':
          return `${val.toFixed(2)}x`;
        case 'unità':
          return val.toFixed(1);
        default:
          return val.toFixed(2);
      }
    }

    // Client-side: formato localizzato
    switch (description.unit) {
      case '%':
        return formatPercent(val);
      case '€':
        return formatCurrency(val);
      case '€/unità':
        return formatCurrency(val);
      case 'M€':
        return `${formatNumber(val, 1)}M€`;
      case 'x':
        return `${formatNumber(val, 2)}x`;
      case 'unità':
        return formatNumber(val, 1);
      default:
        return formatNumber(val, 2);
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= limits.min && newValue <= limits.max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {description.label}
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">{description.description}</p>
                  <p className="text-xs text-muted-foreground">{description.impact}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled}
          className="h-6 w-6 p-0"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={limits.min}
          max={limits.max}
          step={limits.step}
          disabled={disabled}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatValue(limits.min)}</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={limits.min}
              max={limits.max}
              step={limits.step}
              disabled={disabled}
              className="w-20 px-2 py-1 text-xs border rounded text-center bg-background"
            />
            <span className="text-foreground font-medium">{formatValue(value)}</span>
          </div>
          <span>{formatValue(limits.max)}</span>
        </div>
      </div>
    </div>
  );
}
