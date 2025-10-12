'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
// Tooltip imports removed - not used in this component
import { PackageCheck, Info, AlertCircle, TrendingUp } from 'lucide-react';

interface BundlingCardProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function BundlingCard({
  enabled,
  setEnabled
}: BundlingCardProps) {
  
  return (
    <Card className={`p-6 transition-all ${enabled ? 'border-pink-300 bg-pink-50/30' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <PackageCheck className={`h-6 w-6 ${enabled ? 'text-pink-600' : 'text-gray-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Bundling & Pacchetti</h3>
              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 text-xs">
                🚧 In sviluppo
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Offerte combinate hardware + SaaS + servizi con sconti progressivi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-pink-600" : ""}>
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
                Questa sezione mostra pacchetti bundled per accelerare adoption e aumentare Average Deal Size ma non è ancora integrata nei calcoli finanziari.
              </p>
            </div>
          </div>

          {/* Bundle Packages */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="space-y-3">
              {/* Starter Bundle */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Starter Pack</h4>
                      <p className="text-xs text-gray-600">Per cliniche individuali</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">Best Seller</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">1x Ecografo multisonda</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">SaaS Piano Base (1 anno)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Training base (8h)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Kit consumabili 3 mesi</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Supporto standard</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Garanzia 12 mesi</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div>
                    <div className="text-xs text-gray-500 line-through">Prezzo lista: €48,500</div>
                    <div className="text-lg font-bold text-blue-700">€42,900 <span className="text-xs text-gray-600">(-12%)</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">TCO 3 anni:</div>
                    <div className="text-sm font-bold text-gray-900">€68,500</div>
                  </div>
                </div>
              </div>

              {/* Professional Bundle */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Professional Pack</h4>
                      <p className="text-xs text-gray-600">Per centri diagnostici</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">Premium</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">3x Ecografi multisonda</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">SaaS Piano Pro (2 anni)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Training avanzato (16h)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Kit consumabili 6 mesi</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Supporto premium 24/7</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Consulenza clinica (5 sessioni)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Analytics avanzate</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Garanzia estesa 24 mesi</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                  <div>
                    <div className="text-xs text-gray-500 line-through">Prezzo lista: €165,000</div>
                    <div className="text-lg font-bold text-purple-700">€142,000 <span className="text-xs text-gray-600">(-14%)</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">TCO 3 anni:</div>
                    <div className="text-sm font-bold text-gray-900">€218,000</div>
                  </div>
                </div>
              </div>

              {/* Enterprise Bundle */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-lg border-2 border-amber-400">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Enterprise Pack</h4>
                      <p className="text-xs text-gray-600">Per reti ospedaliere</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 border-amber-400">Enterprise</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">10+ Ecografi multisonda</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">SaaS Piano Enterprise (3 anni)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Training certificazione (24h)</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Consumabili illimitati</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Technical Account Manager dedicato</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Setup protocolli personalizzati</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">Integrazione PACS/EMR</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">✓ </span>
                    <span className="font-medium">SLA 99.9% uptime</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-amber-300">
                  <div>
                    <div className="text-xs text-gray-500 line-through">Prezzo lista: €520,000</div>
                    <div className="text-lg font-bold text-orange-700">€425,000 <span className="text-xs text-gray-600">(-18%)</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">TCO 3 anni:</div>
                    <div className="text-sm font-bold text-gray-900">€650,000</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundling Strategy Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h5 className="text-xs font-semibold text-gray-900">Deal Size Medio</h5>
                </div>
                <div className="text-2xl font-bold text-green-700">€142K</div>
                <p className="text-xs text-gray-600 mt-1">+87% vs hardware solo</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💰</span>
                  <h5 className="text-xs font-semibold text-gray-900">Sconto Medio</h5>
                </div>
                <div className="text-2xl font-bold text-blue-700">15%</div>
                <p className="text-xs text-gray-600 mt-1">Win-win cliente/fornitore</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎯</span>
                  <h5 className="text-xs font-semibold text-gray-900">LTV Incremento</h5>
                </div>
                <div className="text-2xl font-bold text-purple-700">+120%</div>
                <p className="text-xs text-gray-600 mt-1">Con servizi bundled</p>
              </div>
            </div>
          </div>

          {/* Business Model Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-pink-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Strategia Bundling - Aumenta ACV e Customer Success</p>
                <p>
                  I pacchetti bundled combinano hardware, SaaS, servizi e consumabili con sconti progressivi (12-18%). 
                  Aumentano significativamente l&apos;Average Contract Value (+87%) e accelerano l&apos;adoption grazie al servizio completo chiavi in mano.
                  <br /><br />
                  <span className="font-medium">Benefici chiave:</span> 
                  • Deal size maggiori • Riduce friction nel processo di acquisto • Aumenta retention con lock-in positivo 
                  • Migliora customer success con supporto integrato • Flusso di cassa più prevedibile con contratti pluriennali
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
