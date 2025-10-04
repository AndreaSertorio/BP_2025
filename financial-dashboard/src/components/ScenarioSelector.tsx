'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Download, Upload, RotateCcw } from 'lucide-react';
import { ScenarioKey } from '@/types/financial';
import { downloadJSON } from '@/lib/utils';

interface ScenarioSelectorProps {
  currentScenario: ScenarioKey;
  onScenarioChange: (scenario: ScenarioKey) => void;
  onDuplicateToCustom: () => void;
  onResetScenario: () => void;
  onExportScenario: () => void;
  onImportScenario: (file: File) => void;
}

export function ScenarioSelector({
  currentScenario,
  onScenarioChange,
  onDuplicateToCustom,
  onResetScenario,
  onExportScenario,
  onImportScenario
}: ScenarioSelectorProps) {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportScenario(file);
      event.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Eco 3D - Piano Finanziario Interattivo
        </h1>
        
        <Tabs value={currentScenario} onValueChange={(value) => onScenarioChange(value as ScenarioKey)}>
          <TabsList>
            <TabsTrigger value="prudente">Prudente</TabsTrigger>
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="ambizioso">Ambizioso</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicateToCustom}
                disabled={currentScenario === 'custom'}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplica → Custom
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copia lo scenario corrente in Custom per modificarlo
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Ripristina i valori originali dello scenario
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportScenario}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Scarica lo scenario come file JSON
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-import')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importa
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Carica uno scenario da file JSON
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          id="file-import"
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
