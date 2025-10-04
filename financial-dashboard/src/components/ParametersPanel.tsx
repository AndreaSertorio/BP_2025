'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, RotateCcw, Save, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Scenario, ScenarioKey } from '@/types/financial';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

interface ParametersPanelProps {
  scenario: Scenario;
  onScenarioChange: (scenarioKey: ScenarioKey) => void;
}

interface ParameterConfig {
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  category: 'market' | 'pricing' | 'operations' | 'financial';
  impact: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

const parameterConfigs: Record<string, ParameterConfig> = {
  arpaSub: {
    label: 'ARPA Subscription (All-in)',
    description: 'Ricavo annuale per cliente subscription (include software, servizi, manutenzione).',
    unit: '€',
    min: 8000,
    max: 60000,
    step: 1000,
    category: 'pricing',
    impact: 'high',
    icon: <DollarSign className="h-4 w-4" />
  },
  arpaMaint: {
    label: 'ARPA Maintenance (CapEx)',
    description: 'Ricavo annuale per manutenzione clienti CapEx (solo servizi post-vendita).',
    unit: '€',
    min: 2000,
    max: 15000,
    step: 500,
    category: 'pricing',
    impact: 'medium',
    icon: <DollarSign className="h-4 w-4" />
  },
  mixCapEx: {
    label: 'Mix Contratti CapEx',
    description: 'Percentuale di contratti venduti come CapEx vs Subscription.',
    unit: '%',
    min: 0,
    max: 1,
    step: 0.05,
    category: 'market',
    impact: 'high',
    icon: <Target className="h-4 w-4" />
  },
  leadMult: {
    label: 'Lead Multiplier',
    description: 'Moltiplicatore per il numero di lead generati. Riflette efficacia marketing.',
    unit: 'x',
    min: 0.5,
    max: 3.0,
    step: 0.1,
    category: 'market',
    impact: 'high',
    icon: <TrendingUp className="h-4 w-4" />
  },
  l2d: {
    label: 'Lead to Demo (%)',
    description: 'Percentuale di lead che si convertono in demo. Indica qualità lead.',
    unit: '%',
    min: 0.05,
    max: 0.30,
    step: 0.01,
    category: 'market',
    impact: 'medium',
    icon: <Target className="h-4 w-4" />
  },
  d2p: {
    label: 'Demo to Pilot (%)',
    description: 'Percentuale di demo che diventano progetti pilota. Riflette product-market fit.',
    unit: '%',
    min: 0.10,
    max: 0.50,
    step: 0.01,
    category: 'market',
    impact: 'medium',
    icon: <Target className="h-4 w-4" />
  },
  p2deal: {
    label: 'Pilot to Deal (%)',
    description: 'Percentuale di piloti che si convertono in contratti. Indica efficacia sales.',
    unit: '%',
    min: 0.30,
    max: 0.80,
    step: 0.01,
    category: 'market',
    impact: 'high',
    icon: <Target className="h-4 w-4" />
  },
  devicesPerDeal: {
    label: 'Devices per Deal',
    description: 'Numero medio di dispositivi per contratto. Dipende dalla dimensione cliente.',
    unit: 'unità',
    min: 1,
    max: 10,
    step: 0.5,
    category: 'operations',
    impact: 'medium',
    icon: <Users className="h-4 w-4" />
  },
  devicePrice: {
    label: 'Device Price',
    description: 'Prezzo unitario del dispositivo hardware. Include margine e costi produzione.',
    unit: '€',
    min: 15000,
    max: 35000,
    step: 1000,
    category: 'pricing',
    impact: 'high',
    icon: <DollarSign className="h-4 w-4" />
  },
  capexShare: {
    label: 'CapEx Share (%)',
    description: 'Percentuale di clienti che acquistano vs. noleggiano i dispositivi.',
    unit: '%',
    min: 0.20,
    max: 0.80,
    step: 0.05,
    category: 'financial',
    impact: 'medium',
    icon: <DollarSign className="h-4 w-4" />
  },
  gmRecurring: {
    label: 'Gross Margin Recurring (%)',
    description: 'Margine lordo sui ricavi ricorrenti (software). Tipicamente alto per SaaS.',
    unit: '%',
    min: 0.70,
    max: 0.95,
    step: 0.01,
    category: 'financial',
    impact: 'high',
    icon: <DollarSign className="h-4 w-4" />
  },
  churnAnnual: {
    label: 'Annual Churn Rate (%)',
    description: 'Percentuale di clienti persi annualmente. Critico per business ricorrenti.',
    unit: '%',
    min: 0.05,
    max: 0.25,
    step: 0.01,
    category: 'operations',
    impact: 'high',
    icon: <Users className="h-4 w-4" />
  },
  growthQoqPostQ8: {
    label: 'Growth Rate Post Q8 (%)',
    description: 'Crescita trimestrale dei lead dopo Q8. Riflette scalabilità del business.',
    unit: '%',
    min: 0.05,
    max: 0.30,
    step: 0.01,
    category: 'market',
    impact: 'medium',
    icon: <TrendingUp className="h-4 w-4" />
  }
};

const ParametersPanel: React.FC<ParametersPanelProps> = ({ scenario, onScenarioChange }) => {
  const [modifiedParams, setModifiedParams] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleParameterChange = (paramKey: string, value: number) => {
    setModifiedParams(prev => ({
      ...prev,
      [paramKey]: value
    }));
    setHasChanges(true);
  };

  const handleReset = (paramKey?: string) => {
    if (paramKey) {
      setModifiedParams(prev => {
        const newParams = { ...prev };
        delete newParams[paramKey];
        return newParams;
      });
    } else {
      setModifiedParams({});
      setHasChanges(false);
    }
  };

  const handleApplyChanges = () => {
    // Here you would typically update the scenario with the modified parameters
    // For now, we'll just reset the changes
    console.log('Applying changes:', modifiedParams);
    setHasChanges(false);
  };

  const getCurrentValue = (paramKey: string): number => {
    if (modifiedParams[paramKey] !== undefined) {
      return modifiedParams[paramKey];
    }
    
    // Get value from scenario.drivers
    const drivers = scenario.drivers;
    if (drivers && drivers[paramKey as keyof typeof drivers] !== undefined) {
      return drivers[paramKey as keyof typeof drivers] as number;
    }
    
    // Fallback to parameter config defaults
    const config = parameterConfigs[paramKey];
    return config ? config.min : 0;
  };

  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case '€':
        return formatCurrency(value);
      case '%':
        return formatPercent(value);
      case 'x':
        return `${value.toFixed(1)}x`;
      default:
        return formatNumber(value);
    }
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return <TrendingUp className="h-4 w-4" />;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'operations': return <Users className="h-4 w-4" />;
      case 'financial': return <Target className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const renderParameterControl = (paramKey: string, config: ParameterConfig) => {
    const currentValue = getCurrentValue(paramKey);
    const isModified = paramKey in modifiedParams;

    return (
      <Card key={paramKey} className={`p-4 ${isModified ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <div>
              <h4 className="font-medium text-sm">{config.label}</h4>
              <Badge className={`text-xs ${getImpactColor(config.impact)}`}>
                {config.impact} impact
              </Badge>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Slider
              value={[currentValue]}
              onValueChange={([value]) => handleParameterChange(paramKey, value)}
              min={config.min}
              max={config.max}
              step={config.step}
              className="flex-1"
            />
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => handleParameterChange(paramKey, parseFloat(e.target.value) || 0)}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-24"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {formatValue(currentValue, config.unit)}
            </span>
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReset(paramKey)}
                className="h-6 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const groupedParams = Object.entries(parameterConfigs).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ key, config });
    return acc;
  }, {} as Record<string, Array<{ key: string; config: ParameterConfig }>>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Parameters</h2>
          <p className="text-gray-600">Adjust financial model parameters to explore different scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleReset()}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button
            onClick={handleApplyChanges}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              You have unsaved changes. Click "Apply Changes" to update the scenario.
            </p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedParams).map(([category, params]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {params.map(({ key, config }) => renderParameterControl(key, config))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-4 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Parameter Impact Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">High Impact</Badge>
            <span className="text-sm">Significantly affects revenue and profitability</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
            <span className="text-sm">Moderate effect on business metrics</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Low Impact</Badge>
            <span className="text-sm">Minor influence on overall performance</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParametersPanel;
