'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { Scenario } from '@/types/financial';

interface MetricsExplainerProps {
  scenario: Scenario;
}

export function MetricsExplainer({ scenario }: MetricsExplainerProps) {
  const { assumptions, drivers } = scenario;
  
  if (!assumptions) return null;
  
  // Calculate example values for Y1
  const marketPenY1 = drivers.marketPenetrationY1 || 0.0001;
  const monthlyLeads = (assumptions.sam * 1000 * marketPenY1) / 12;
  const monthlyDeals = monthlyLeads * drivers.l2d * drivers.d2p * drivers.p2d;
  const monthlyDevices = monthlyDeals * drivers.dealMult;
  
  // Calculate revenues
  const avgPricePerExam = 75; // Average from sectors
  const arpaCalculated = avgPricePerExam * drivers.scansPerDevicePerMonth * 12;
  const monthlyRecurringRev = (monthlyDeals * (1 - drivers.mixCapEx)) * (arpaCalculated / 12);
  const monthlyCapexRev = (monthlyDeals * drivers.mixCapEx) * drivers.dealMult * drivers.devicePrice;
  const monthlyTotalRev = monthlyRecurringRev + monthlyCapexRev;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Come Funzionano i Calcoli - Esempio Mese 1
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Market to Leads */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
              Da Mercato a Leads
            </h3>
            <div className="text-xs space-y-1 ml-8">
              <div>SAM: <strong>{assumptions.sam.toLocaleString()}K esami/anno</strong></div>
              <div>Penetrazione Y1: <strong>{(marketPenY1 * 100).toFixed(3)}%</strong></div>
              <div className="font-mono bg-white p-2 rounded">
                Leads/mese = {assumptions.sam.toLocaleString()} × {(marketPenY1 * 100).toFixed(3)}% ÷ 12
              </div>
              <div className="text-blue-600 font-semibold">
                = {monthlyLeads.toFixed(0)} leads/mese
              </div>
            </div>
          </div>

          {/* Step 2: Funnel Conversion */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
              Funnel GTM (Conversioni)
            </h3>
            <div className="text-xs space-y-1 ml-8">
              <div>Leads: <strong>{monthlyLeads.toFixed(0)}</strong></div>
              <div>L2D: <strong>{(drivers.l2d * 100).toFixed(0)}%</strong> → Demo: {(monthlyLeads * drivers.l2d).toFixed(0)}</div>
              <div>D2P: <strong>{(drivers.d2p * 100).toFixed(0)}%</strong> → Pilot: {(monthlyLeads * drivers.l2d * drivers.d2p).toFixed(0)}</div>
              <div>P2D: <strong>{(drivers.p2d * 100).toFixed(0)}%</strong> → Deals: {monthlyDeals.toFixed(1)}</div>
              <div className="font-mono bg-white p-2 rounded">
                Deals = {monthlyLeads.toFixed(0)} × {(drivers.l2d * 100).toFixed(0)}% × {(drivers.d2p * 100).toFixed(0)}% × {(drivers.p2d * 100).toFixed(0)}%
              </div>
              <div className="text-blue-600 font-semibold">
                = {monthlyDeals.toFixed(1)} deals/mese
              </div>
            </div>
          </div>

          {/* Step 3: Deals to Devices */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
              Da Deals a Dispositivi
            </h3>
            <div className="text-xs space-y-1 ml-8">
              <div>Deals totali: <strong>{monthlyDeals.toFixed(1)}</strong></div>
              <div>Mix CapEx: <strong>{(drivers.mixCapEx * 100).toFixed(0)}%</strong> → {(monthlyDeals * drivers.mixCapEx).toFixed(1)} vendite</div>
              <div>Mix Subscription: <strong>{((1 - drivers.mixCapEx) * 100).toFixed(0)}%</strong> → {(monthlyDeals * (1 - drivers.mixCapEx)).toFixed(1)} abbonamenti</div>
              <div>Dispositivi/deal: <strong>{drivers.dealMult}</strong></div>
              <div className="font-mono bg-white p-2 rounded">
                Dispositivi = {monthlyDeals.toFixed(1)} × {drivers.dealMult}
              </div>
              <div className="text-blue-600 font-semibold">
                = {monthlyDevices.toFixed(1)} dispositivi/mese
              </div>
            </div>
          </div>

          {/* Step 4: Devices to Revenue */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
              Da Dispositivi a Ricavi
            </h3>
            <div className="text-xs space-y-1 ml-8">
              <div><strong>Ricavi Subscription:</strong></div>
              <div className="ml-4">
                Prezzo/esame: €{avgPricePerExam} × {drivers.scansPerDevicePerMonth} scans/mese = €{(avgPricePerExam * drivers.scansPerDevicePerMonth).toLocaleString()}/mese
              </div>
              <div className="ml-4">
                ARPA annuale: €{arpaCalculated.toLocaleString()}
              </div>
              <div className="ml-4 text-green-600">
                Ricavi Sub/mese: €{monthlyRecurringRev.toFixed(0)}
              </div>
              
              <div className="mt-2"><strong>Ricavi CapEx:</strong></div>
              <div className="ml-4">
                Dispositivi venduti: {(monthlyDeals * drivers.mixCapEx * drivers.dealMult).toFixed(1)} × €{drivers.devicePrice.toLocaleString()}
              </div>
              <div className="ml-4 text-green-600">
                Ricavi CapEx/mese: €{monthlyCapexRev.toFixed(0)}
              </div>
              
              <div className="mt-2 pt-2 border-t">
                <div className="text-green-600 font-bold">
                  Ricavi Totali/mese: €{monthlyTotalRev.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Info className="h-4 w-4" />
              Insights Chiave
            </h3>
            <div className="text-xs space-y-1">
              <div>• Conversion Rate totale: <strong>{(drivers.l2d * drivers.d2p * drivers.p2d * 100).toFixed(1)}%</strong> (da lead a deal)</div>
              <div>• Per chiudere 1 deal servono: <strong>{Math.round(1 / (drivers.l2d * drivers.d2p * drivers.p2d))} leads</strong></div>
              <div>• Revenue per deal: <strong>€{((monthlyRecurringRev + monthlyCapexRev) / monthlyDeals).toFixed(0)}</strong></div>
              <div>• Break-even stimato con questi numeri: calcolo in corso...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
