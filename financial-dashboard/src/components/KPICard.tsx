'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatMillions, formatPercent, formatNumber, cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  format: 'millions' | 'percent' | 'number' | 'year';
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  format, 
  description, 
  trend, 
  className 
}: KPICardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatValue = (val: number, fmt: string) => {
    if (!isClient) {
      // Server-side rendering: formato semplice
      switch (fmt) {
        case 'millions':
          return `${val.toFixed(1)}M€`;
        case 'percent':
          return `${(val * 100).toFixed(1)}%`;
        case 'number':
          return Math.round(val).toString();
        case 'year':
          return val === null ? 'N/A' : `Anno ${Math.round(val)}`;
        default:
          return val.toString();
      }
    }
    
    // Client-side rendering: formato localizzato
    switch (fmt) {
      case 'millions':
        return formatMillions(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
        return formatNumber(val);
      case 'year':
        return val === null ? 'N/A' : `Anno ${Math.round(val)}`;
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.isPositive) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.value === 0) return <Minus className="h-4 w-4 text-gray-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive) return 'text-green-600';
    if (trend.value === 0) return 'text-gray-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            {title}
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value, format)}
        </div>
        {trend && (
          <p className={cn("text-xs mt-1", getTrendColor())}>
            {trend.isPositive ? '+' : ''}{formatPercent(Math.abs(trend.value))} vs scenario base
          </p>
        )}
      </CardContent>
    </Card>
  );
}
