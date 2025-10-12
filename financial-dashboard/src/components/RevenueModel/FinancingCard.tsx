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
import { CreditCard, Info, AlertCircle, Percent } from 'lucide-react';

interface FinancingCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function FinancingCard({
  enabled,
  setEnabled
}: FinancingCardProps) {
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CreditCard className={`h-6 w-6 ${enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Opzioni Finanziamento</h3>
              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 text-xs">
                🚧 In sviluppo
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Leasing operativo, renting, pay-per-use per facilitare adoption</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-emerald-600" : ""}>
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
                Questa sezione mostra le opzioni di finanziamento per abbassare la barriera d&apos;ingresso ma non è ancora integrata nei calcoli finanziari. 
                Include leasing operativo, renting full-service, pay-per-scan.
              </p>
            </div>
          </div>

          {/* Financing Options */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="space-y-3">
              {/* Leasing Operativo */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Leasing Operativo</h4>
                      <p className="text-xs text-gray-600">36-60 mesi, deducibilità fiscale 100%</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">Most Popular</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Piano 36 mesi:</div>
                    <div className="text-lg font-bold text-blue-700">€1,350<span className="text-xs text-gray-500">/mese</span></div>
                    <div className="text-xs text-gray-500">Include: device + SaaS base</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Piano 60 mesi:</div>
                    <div className="text-lg font-bold text-blue-700">€950<span className="text-xs text-gray-500">/mese</span></div>
                    <div className="text-xs text-gray-500">Include: device + SaaS base</div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Deducibilità fiscale 100%</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">No capex iniziale</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Opzione riscatto finale (1%)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Upgrade tecnologico garantito</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-blue-200">
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 flex items-center gap-1">
                          TAN equivalente
                          <Info className="h-3 w-3 text-gray-400" />
                        </span>
                        <span className="font-bold text-blue-700">~3.5-4.5%</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">
                        Tasso Annuo Nominale. Varia in base a durata contratto e rating creditizio cliente
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Renting Full-Service */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Renting Full-Service</h4>
                      <p className="text-xs text-gray-600">All-inclusive con manutenzione e upgrade</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">Premium</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Mensile tutto incluso:</div>
                    <div className="text-lg font-bold text-purple-700">€1,850<span className="text-xs text-gray-500">/mese</span></div>
                    <div className="text-xs text-gray-500">Contratto minimo 24 mesi</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Canone variabile:</div>
                    <div className="text-lg font-bold text-purple-700">€1,200<span className="text-xs text-gray-500"> + €2/scan</span></div>
                    <div className="text-xs text-gray-500">Pay-per-use oltre 300 scan/mese</div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs">
                    <span className="text-purple-600">✓ </span>
                    <span className="font-medium">Device + SaaS + Consumabili</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-purple-600">✓ </span>
                    <span className="font-medium">Manutenzione preventiva inclusa</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-purple-600">✓ </span>
                    <span className="font-medium">Sostituzione immediata in caso guasto</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-purple-600">✓ </span>
                    <span className="font-medium">Upgrade ogni 36 mesi</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-purple-600">✓ </span>
                    <span className="font-medium">Training e supporto premium</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Zero imprevisti, costo fisso prevedibile</span>
                    <span className="font-bold text-purple-700">TCO ottimizzato</span>
                  </div>
                </div>
              </div>

              {/* Pay-Per-Scan */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Pay-Per-Scan</h4>
                      <p className="text-xs text-gray-600">Paghi solo per ciò che usi, no upfront</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">Zero CapEx</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Tariffa base:</div>
                    <div className="text-lg font-bold text-green-700">€18<span className="text-xs text-gray-500">/scansione</span></div>
                    <div className="text-xs text-gray-500">0-500 scansioni/mese</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Tariffa volume:</div>
                    <div className="text-lg font-bold text-green-700">€12<span className="text-xs text-gray-500">/scansione</span></div>
                    <div className="text-xs text-gray-500">Oltre 500 scansioni/mese</div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Zero investimento iniziale</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Device fornito in comodato</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Software + consumabili inclusi</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Fatturazione posticipata mensile</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">✓ </span>
                    <span className="font-medium">Perfetto per startup e low-volume clinics</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-green-200">
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 flex items-center gap-1">
                          Esempio: 300 scansioni/mese
                          <Info className="h-3 w-3 text-gray-400" />
                        </span>
                        <span className="font-bold text-green-700">€5,400/mese</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">
                        300 scan × €18 = €5,400/mese. Nessun costo fisso, massima flessibilità per volumi variabili
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Financing Comparison */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <h5 className="text-xs font-semibold text-gray-900">Leasing</h5>
                </div>
                <div className="text-xl font-bold text-blue-700">€950/m</div>
                <p className="text-xs text-gray-600 mt-1">60 mesi - CapEx light</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🔄</span>
                  <h5 className="text-xs font-semibold text-gray-900">Renting</h5>
                </div>
                <div className="text-xl font-bold text-purple-700">€1,850/m</div>
                <p className="text-xs text-gray-600 mt-1">All-inclusive - OpEx puro</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💳</span>
                  <h5 className="text-xs font-semibold text-gray-900">Pay-Per-Scan</h5>
                </div>
                <div className="text-xl font-bold text-green-700">€18/scan</div>
                <p className="text-xs text-gray-600 mt-1">Zero upfront - Variabile</p>
              </div>
            </div>
          </div>

          {/* Financial Impact */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
            <h4 className="text-sm font-bold text-gray-900 mb-3">💰 Impatto Finanziario per Eco 3D</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Accelerazione vendite:</div>
                <div className="text-lg font-bold text-emerald-700">+40-60%</div>
                <p className="text-xs text-gray-600 mt-1">Barriera d&apos;ingresso ridotta</p>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Commissione partner:</div>
                <div className="text-lg font-bold text-emerald-700">3-5%</div>
                <p className="text-xs text-gray-600 mt-1">Società leasing/finanziarie</p>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Cash flow anticipato:</div>
                <div className="text-lg font-bold text-emerald-700">80-90%</div>
                <p className="text-xs text-gray-600 mt-1">Incasso immediato da partner</p>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Retention migliorata:</div>
                <div className="text-lg font-bold text-emerald-700">+25%</div>
                <p className="text-xs text-gray-600 mt-1">Lock-in contrattuale 36-60 mesi</p>
              </div>
            </div>
          </div>

          {/* Business Model Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Opzioni Finanziamento - Abbassano Barriera d&apos;Ingresso</p>
                <p>
                  Offrire leasing, renting e pay-per-scan accelera significativamente le vendite (+40-60%) rimuovendo il principale ostacolo: 
                  il costo iniziale di €45K. I clienti preferiscono OpEx prevedibile vs CapEx pesante.
                  <br /><br />
                  <span className="font-medium">Partnership strategiche:</span> Collaborazioni con società di leasing (Leasys, Grenke) e fintech 
                  permettono di incassare 80-90% del valore immediatamente, migliorando il cash flow senza deteriorare i margini (commissione 3-5%).
                  <br /><br />
                  <span className="font-medium">Pay-per-scan:</span> Perfetto per low-volume clinics, startups, e mercati emergenti. 
                  Converte CapEx €45K in OpEx variabile €18/scan, eliminando completamente il rischio d&apos;investimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
