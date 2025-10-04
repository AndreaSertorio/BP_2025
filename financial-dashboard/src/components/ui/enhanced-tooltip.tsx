import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTooltipProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
  impact?: string;
  type?: 'info' | 'help' | 'warning';
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function EnhancedTooltip({ 
  title, 
  description, 
  formula, 
  example, 
  impact,
  type = 'info',
  children,
  side = 'top',
  className 
}: EnhancedTooltipProps) {
  const icons = {
    info: Info,
    help: HelpCircle,
    warning: AlertCircle
  };

  const Icon = icons[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1 cursor-help', className)}>
            {children}
            <Icon className="h-3 w-3 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs p-4 space-y-2">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>
          {formula && (
            <div className="border-t pt-2">
              <div className="text-xs font-mono bg-gray-50 p-2 rounded">
                <span className="font-semibold">Formula:</span> {formula}
              </div>
            </div>
          )}
          {example && (
            <div className="text-xs">
              <span className="font-semibold">Example:</span> {example}
            </div>
          )}
          {impact && (
            <div className="text-xs border-t pt-2">
              <span className="font-semibold">Impact:</span> {impact}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MetricTooltipProps {
  metric: string;
  value: string | number;
  description: string;
  formula?: string;
  benchmark?: {
    good: string;
    average: string;
    poor: string;
  };
}

export function MetricTooltip({ metric, value, description, formula, benchmark }: MetricTooltipProps) {
  return (
    <EnhancedTooltip
      title={metric}
      description={description}
      formula={formula}
      impact={benchmark ? `Good: ${benchmark.good}, Average: ${benchmark.average}, Poor: ${benchmark.poor}` : undefined}
    >
      <span className="font-medium">{metric}</span>
    </EnhancedTooltip>
  );
}

interface ParameterTooltipProps {
  parameter: string;
  description: string;
  unit: string;
  impact: string;
  currentValue: number;
  range: { min: number; max: number };
}

export function ParameterTooltip({ 
  parameter, 
  description, 
  unit, 
  impact, 
  currentValue, 
  range 
}: ParameterTooltipProps) {
  return (
    <EnhancedTooltip
      title={parameter}
      description={description}
      example={`Current: ${currentValue}${unit}, Range: ${range.min}-${range.max}${unit}`}
      impact={impact}
      type="help"
    >
      <span>{parameter}</span>
    </EnhancedTooltip>
  );
}
