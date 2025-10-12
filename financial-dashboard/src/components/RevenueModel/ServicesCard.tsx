'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
// Tooltip imports removed - not used in this component
import { Headphones, Info, AlertCircle } from 'lucide-react';

interface ServicesCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function ServicesCard({
  enabled,
  setEnabled
}: ServicesCardProps) {
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Headphones className={`h-6 w-6 ${enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Servizi Professional</h3>
              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 text-xs">
                🚧 In sviluppo
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Training, consulenza, supporto premium, analytics avanzate</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-indigo-600" : ""}>
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
                Questa sezione mostra i servizi professionali aggiuntivi ma non è ancora integrata nei calcoli finanziari. 
                Include training specializzato, consulenza clinica, supporto premium e analytics avanzate.
              </p>
            </div>
          </div>

          {/* Services Grid */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Training & Onboarding */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Training & Onboarding</h4>
                    <p className="text-xs text-gray-500">Formazione tecnici e medici</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Corso base (8h):</span>
                    <span className="text-sm font-bold text-blue-700">€500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Corso avanzato (16h):</span>
                    <span className="text-sm font-bold text-blue-700">€1,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Certificazione (24h):</span>
                    <span className="text-sm font-bold text-blue-700">€2,500</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-gray-600">
                      Include: materiale didattico, esercitazioni pratiche, certificato finale
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporto Premium */}
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Supporto Premium</h4>
                    <p className="text-xs text-gray-500">24/7 priorità massima</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">SLA 2h:</span>
                    <span className="text-sm font-bold text-purple-700">€200/mese</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Supporto dedicato:</span>
                    <span className="text-sm font-bold text-purple-700">€500/mese</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Technical Account Manager:</span>
                    <span className="text-sm font-bold text-purple-700">€1,500/mese</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <p className="text-xs text-gray-600">
                      Include: hotline dedicata, troubleshooting prioritario, patch urgenti
                    </p>
                  </div>
                </div>
              </div>

              {/* Consulenza Clinica */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👨‍⚕️</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Consulenza Clinica</h4>
                    <p className="text-xs text-gray-500">Protocolli e best practices</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Sessione (2h):</span>
                    <span className="text-sm font-bold text-green-700">€350/sessione</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Pacchetto 10 sessioni:</span>
                    <span className="text-sm font-bold text-green-700">€3,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Setup protocolli clinici:</span>
                    <span className="text-sm font-bold text-green-700">€2,500</span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-xs text-gray-600">
                      Con medico specialista: ottimizzazione workflow, interpretazione imaging
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics & Reporting */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Analytics Avanzate</h4>
                    <p className="text-xs text-gray-500">Dashboard e report custom</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Dashboard custom:</span>
                    <span className="text-sm font-bold text-amber-700">€150/mese</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Report automatici:</span>
                    <span className="text-sm font-bold text-amber-700">€100/mese</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">AI/ML insights:</span>
                    <span className="text-sm font-bold text-amber-700">€300/mese</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-xs text-gray-600">
                      KPI personalizzati, trend analysis, predizioni AI su qualità diagnosi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary - One-time + Recurring */}
            <div className="grid grid-cols-2 gap-3">
              {/* One-time Revenue */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700">Ricavi One-Time</h4>
                    <p className="text-xs text-gray-500">Per nuovo cliente</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Training completo:</span>
                    <span className="font-bold text-blue-700">€2,500</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Setup protocolli:</span>
                    <span className="font-bold text-blue-700">€2,500</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-200">
                    <span className="font-medium text-gray-700">Totale setup:</span>
                    <span className="text-lg font-bold text-blue-700">€5,000</span>
                  </div>
                </div>
              </div>

              {/* Recurring Revenue */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700">Ricavi Ricorrenti</h4>
                    <p className="text-xs text-gray-500">Per cliente attivo</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Supporto premium:</span>
                    <span className="font-bold text-purple-700">€500/mese</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Analytics avanzate:</span>
                    <span className="font-bold text-purple-700">€300/mese</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-200">
                    <span className="font-medium text-gray-700">MRR potenziale:</span>
                    <span className="text-lg font-bold text-purple-700">€800/mese</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Model Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Servizi Professional - Alto Valore Aggiunto</p>
                <p>
                  I servizi professionali generano ricavi significativi sia one-time (€5K/cliente setup) che ricorrenti (€800/mese).
                  Margini elevati (70-80%) e aumentano customer success e retention.
                  <br /><br />
                  <span className="font-medium">Target clienti premium:</span> Centri diagnostici avanzati, cliniche specializzate, reti ospedaliere che richiedono supporto dedicato e ottimizzazione continua.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
