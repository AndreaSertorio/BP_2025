'use client';

import React from 'react';
import { Info, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalculationExplainerProps {
  title: string;
  formula: string;
  example?: string;
  result?: string | number;
  className?: string;
}

export function CalculationExplainer({ 
  title, 
  formula, 
  example, 
  result,
  className = ""
}: CalculationExplainerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center gap-1 text-xs ${className}`}>
            <Calculator className="h-3 w-3" />
            <span className="underline decoration-dotted">{title}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-4">
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-1">
              <Info className="h-4 w-4" />
              Formula
            </div>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {formula}
            </code>
            {example && (
              <>
                <div className="font-semibold">Esempio</div>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                  {example}
                </code>
              </>
            )}
            {result && (
              <>
                <div className="font-semibold">Risultato</div>
                <div className="text-sm font-medium">
                  {typeof result === 'number' ? result.toLocaleString() : result}
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component to show calculation chain
export function CalculationChain({ 
  steps 
}: { 
  steps: Array<{ label: string; formula: string; value?: string | number }> 
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="text-xs font-semibold text-gray-600 mb-2">
        📊 Catena di Calcolo
      </div>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-2 text-xs">
          <span className="font-semibold text-gray-500 min-w-[20px]">
            {index + 1}.
          </span>
          <div className="flex-1">
            <span className="font-medium">{step.label}:</span>
            <code className="ml-2 text-gray-600">{step.formula}</code>
            {step.value && (
              <span className="ml-2 font-semibold text-blue-600">
                = {typeof step.value === 'number' ? step.value.toLocaleString() : step.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
