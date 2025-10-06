/**
 * INDICATORE SINCRONIZZAZIONE DATABASE
 * Mostra lo stato di sincronizzazione del database centralizzato
 */

'use client';

import React from 'react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Upload, RotateCcw, CheckCircle2, Database } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DatabaseSyncIndicator() {
  const { data, lastUpdate, resetToDefaults, exportDatabase } = useDatabase();

  const handleExport = () => {
    const jsonString = exportDatabase();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eco3d-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('⚠️ Sicuro di voler ripristinare tutti i dati ai valori di default? Tutte le modifiche andranno perse.')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  const prestazioniAggredibili = data.mercatoEcografie.italia.prestazioni.filter(p => p.aggredibile).length;

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-3 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center gap-2 border-b pb-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm">Database Status</h3>
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Sistema sincronizzato</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Versione:</span>
              <Badge variant="outline" className="text-xs">
                {data.version}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prestazioni:</span>
              <span className="font-semibold">{data.mercatoEcografie.italia.prestazioni.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Aggredibili:</span>
              <Badge className="bg-green-600 text-white text-xs">
                {prestazioniAggredibili}
              </Badge>
            </div>
            {lastUpdate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ultimo aggiornamento:</span>
                <span className="text-xs font-mono">
                  {lastUpdate.toLocaleTimeString('it-IT')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Scarica database come JSON</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Ripristina valori default</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Storage Info */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            💾 Salvato in localStorage
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
