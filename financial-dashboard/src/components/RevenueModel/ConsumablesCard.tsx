'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Package, Info, AlertCircle } from 'lucide-react';

interface ConsumablesCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function ConsumablesCard({
  enabled,
  setEnabled
}: ConsumablesCardProps) {
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className={`h-6 w-6 ${enabled ? 'text-teal-600' : 'text-gray-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Consumabili</h3>
              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 text-xs">
                🚧 In sviluppo
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Gel conduttore, kit pulizia, materiali di consumo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-teal-600" : ""}>
            {enabled ? 'Attivo' : 'Disattivato'}
          </Badge>
          <Switch 
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>
      
      {enabled && (
        <div className="space-y-4">
          {/* Warning Box */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">Funzionalità in fase di sviluppo</p>
              <p className="text-xs text-orange-700 mt-1">
                Questa sezione mostra il potenziale stream di ricavi da consumabili ma non è ancora integrata nei calcoli finanziari. 
                Include gel conduttore, kit di pulizia, materiali usa e getta.
              </p>
            </div>
          </div>

          {/* Consumables Overview */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Gel Conduttore */}
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧴</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Gel Conduttore</h4>
                    <p className="text-xs text-gray-500">250ml/mese per dispositivo</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Prezzo unitario:</span>
                    <span className="text-sm font-bold text-teal-700">€12.50/flacone</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Consumo medio:</span>
                    <span className="text-sm font-medium text-gray-700">4 flaconi/mese</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-teal-200">
                    <span className="text-xs font-medium text-gray-700">MRR/dispositivo:</span>
                    <span className="text-sm font-bold text-teal-700">€50/mese</span>
                  </div>
                </div>
              </div>

              {/* Kit Pulizia */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧽</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Kit Pulizia</h4>
                    <p className="text-xs text-gray-500">Mensile + Trimestrale</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Kit base (mensile):</span>
                    <span className="text-sm font-bold text-blue-700">€15/kit</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Kit avanzato (trim.):</span>
                    <span className="text-sm font-medium text-gray-700">€45/trimestre</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-blue-200">
                    <span className="text-xs font-medium text-gray-700">MRR/dispositivo:</span>
                    <span className="text-sm font-bold text-blue-700">€30/mese</span>
                  </div>
                </div>
              </div>

              {/* Materiali Usa e Getta */}
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧻</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Materiali Usa&Getta</h4>
                    <p className="text-xs text-gray-500">Coprisonde, salviette</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Coprisonde (100pz):</span>
                    <span className="text-sm font-bold text-purple-700">€25/conf.</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Consumo medio:</span>
                    <span className="text-sm font-medium text-gray-700">2 conf./mese</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-purple-200">
                    <span className="text-xs font-medium text-gray-700">MRR/dispositivo:</span>
                    <span className="text-sm font-bold text-purple-700">€50/mese</span>
                  </div>
                </div>
              </div>

              {/* Calibrazione e Manutenzione */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Manutenzione</h4>
                    <p className="text-xs text-gray-500">Calibrazione semestrale</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Calibrazione (6 mesi):</span>
                    <span className="text-sm font-bold text-amber-700">€150/calib.</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Frequenza:</span>
                    <span className="text-sm font-medium text-gray-700">2 volte/anno</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-amber-200">
                    <span className="text-xs font-medium text-gray-700">MRR/dispositivo:</span>
                    <span className="text-sm font-bold text-amber-700">€25/mese</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border-2 border-teal-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-teal-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ricavo Totale Consumabili</h4>
                    <p className="text-xs text-gray-600">Per singolo dispositivo attivo</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-700">€155<span className="text-sm text-gray-500">/mese</span></div>
                  <div className="text-xs text-gray-600">€1,860/anno</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        Margine lordo stimato
                        <Info className="h-3 w-3 text-gray-400" />
                      </span>
                      <span className="font-bold text-green-700">~45-55%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">
                      I consumabili hanno margini elevati (45-55%) essendo prodotti ricorrenti con basso costo logistico
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Business Model Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Modello Razor & Blade</p>
                <p>
                  I consumabili rappresentano un importante stream di ricavi ricorrenti con margini elevati. 
                  Ogni dispositivo attivo genera ~€155/mese in consumabili (gel, kit pulizia, materiali usa&getta, calibrazione).
                  <br /><br />
                  <span className="font-medium">Potenziale ARR:</span> Con 100 dispositivi attivi → €186K/anno solo da consumabili.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
