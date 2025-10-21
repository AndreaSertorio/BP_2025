'use client';

import React, { useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { GtmCalculationService } from '@/services/gtmCalculations';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * GTM Reconciliation Card
 * 
 * Mostra la riconciliazione tra:
 * - Top-Down: Quote mercato SOM (TAM/SAM/SOM)
 * - Bottom-Up: Capacità commerciale effettiva (sales team)
 * 
 * Calcola automaticamente e salva su database
 */
export function GTMReconciliationCard() {
  const { data, updateGtmCalculated } = useDatabase();
  
  const goToMarket = data?.goToMarket;
  const tamSamSomEcografi = data?.configurazioneTamSamSom?.ecografi;
  
  // Calcola proiezioni complete
  const calculated = useMemo(() => {
    if (!goToMarket || !tamSamSomEcografi?.dispositiviUnita) {
      return null;
    }
    
    // Converti da som1/som2/som3/som4/som5 a y1/y2/y3/y4/y5
    const dispositivi = tamSamSomEcografi.dispositiviUnita;
    const somDevicesByYear = {
      y1: dispositivi.som1 || 0,
      y2: dispositivi.som2 || 0,
      y3: dispositivi.som3 || 0,
      y4: dispositivi.som4 || 0,
      y5: dispositivi.som5 || 0
    };
    
    return GtmCalculationService.calculateCompleteReconciliation(
      goToMarket,
      somDevicesByYear,
      'italia'
    );
  }, [goToMarket, tamSamSomEcografi]);
  
  // Auto-save quando cambiano i calcoli
  useEffect(() => {
    if (calculated && updateGtmCalculated) {
      const saveCalculated = async () => {
        try {
          await updateGtmCalculated(calculated);
        } catch (error) {
          console.error('Errore salvataggio GTM Calculated:', error);
        }
      };
      
      // Debounce 1 secondo
      const timeoutId = setTimeout(saveCalculated, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [calculated, updateGtmCalculated]);
  
  if (!calculated) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Configura Go-To-Market e TAM/SAM/SOM per vedere la riconciliazione
        </div>
      </Card>
    );
  }
  
  const years = [1, 2, 3, 4, 5];
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎯 Riconciliazione Top-Down vs Bottom-Up
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Proiezioni realistiche = MIN(Mercato SOM, Capacità Commerciale)
        </p>
      </div>
      
      {/* Tabella Comparazione */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Anno</th>
              <th className="text-right py-3 px-3 font-semibold text-blue-700">SOM Target</th>
              <th className="text-right py-3 px-3 font-semibold text-green-700">Capacità</th>
              <th className="text-right py-3 px-3 font-semibold text-purple-700">Realistico</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Bottleneck</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Gap</th>
            </tr>
          </thead>
          <tbody>
            {years.map(year => {
              const yearKey = `y${year}` as any;
              const details = calculated.details[yearKey];
              
              if (!details) return null;
              
              const gap = Math.abs(details.somAdjustedByAdoption - details.capacityAfterChannels);
              const gapPercentage = details.capacityAfterChannels > 0
                ? ((gap / details.capacityAfterChannels) * 100).toFixed(0)
                : 0;
              
              const isCapacityConstrained = details.constrainingFactor === 'capacity';
              
              return (
                <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-semibold text-gray-900">Anno {year}</td>
                  
                  {/* SOM Target */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-semibold text-blue-900">
                      {details.somAdjustedByAdoption} devices
                    </div>
                    <div className="text-xs text-gray-500">
                      (adoption {(details.adoptionRate * 100).toFixed(0)}%)
                    </div>
                  </td>
                  
                  {/* Capacità */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-semibold text-green-900">
                      {details.capacityAfterChannels} devices
                    </div>
                    <div className="text-xs text-gray-500">
                      ({details.capacityBeforeChannels} × {(details.channelEfficiency * 100).toFixed(0)}%)
                    </div>
                  </td>
                  
                  {/* Realistico */}
                  <td className="py-3 px-3 text-right">
                    <div className="text-xl font-bold text-purple-900">
                      {details.realisticSales}
                    </div>
                  </td>
                  
                  {/* Bottleneck */}
                  <td className="py-3 px-3 text-center">
                    {isCapacityConstrained ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Capacity
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Market
                      </div>
                    )}
                  </td>
                  
                  {/* Gap */}
                  <td className="py-3 px-3 text-center">
                    <div className={`flex items-center justify-center gap-1 ${
                      isCapacityConstrained ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      {isCapacityConstrained ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      <span className="text-xs font-semibold">
                        {gap} ({gapPercentage}%)
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Metriche Go-To-Market */}
      <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300">
        <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
          📊 Metriche Go-To-Market
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">Funnel Efficienza</div>
            <div className="text-2xl font-bold text-purple-600">
              {((goToMarket?.conversionFunnel?.lead_to_demo || 0) * 
                (goToMarket?.conversionFunnel?.demo_to_pilot || 0) * 
                (goToMarket?.conversionFunnel?.pilot_to_deal || 0) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Lead → Deal conversion</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">Channel Efficiency</div>
            <div className="text-2xl font-bold text-purple-600">
              {((1 - ((goToMarket?.channelMix?.distributors || 0) * (goToMarket?.channelMix?.distributorMargin || 0))) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((goToMarket?.channelMix?.direct || 0) * 100)}% direct + {Math.round((goToMarket?.channelMix?.distributors || 0) * 100)}% distributors
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">Ciclo Vendita Medio</div>
            <div className="text-2xl font-bold text-purple-600">
              {goToMarket?.salesCycle?.avgMonths || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">mesi per deal</div>
          </div>
        </div>
      </div>
      
      {/* KPI Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
          <div className="text-xs font-semibold text-indigo-900 mb-1">Vendite Totali 5 Anni</div>
          <div className="text-2xl font-bold text-indigo-900">
            {Object.values(calculated.realisticSales as Record<string, number>)
              .filter(v => typeof v === 'number')
              .reduce((sum, v) => sum + v, 0)} devices
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="text-xs font-semibold text-orange-900 mb-1">Anni Limitati da Capacity</div>
          <div className="text-2xl font-bold text-orange-900">
            {years.filter(y => {
              const yearKey = `y${y}` as any;
              return calculated.details[yearKey]?.constrainingFactor === 'capacity';
            }).length} / 5
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-900 mb-1">Anni Limitati da Market</div>
          <div className="text-2xl font-bold text-blue-900">
            {years.filter(y => {
              const yearKey = `y${y}` as any;
              return calculated.details[yearKey]?.constrainingFactor === 'market';
            }).length} / 5
          </div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Insights Strategici</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {years.map(year => {
            const yearKey = `y${year}` as any;
            const details = calculated.details[yearKey];
            
            if (!details) return null;
            
            const isCapacityConstrained = details.constrainingFactor === 'capacity';
            const gap = Math.abs(details.somAdjustedByAdoption - details.capacityAfterChannels);
            
            if (gap < 5) return null; // Ignora gap trascurabili
            
            return (
              <div key={year} className="flex items-start gap-2">
                {isCapacityConstrained ? (
                  <>
                    <span className="text-orange-600 font-semibold">📈 Anno {year}:</span>
                    <span>
                      Potresti vendere <strong>{gap} devices in più</strong> se assumessi più sales reps 
                      (domanda mercato disponibile)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 font-semibold">📢 Anno {year}:</span>
                    <span>
                      Hai capacità in eccesso di <strong>{gap} devices</strong>. 
                      Investi in marketing per aumentare domanda.
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <div>
          <strong>Formula:</strong> RealisticSales = MIN(SOM × adoption, Capacity × channelEfficiency)
        </div>
        <div>
          {calculated.lastUpdate && (
            <span>Aggiornato: {new Date(calculated.lastUpdate).toLocaleString('it-IT')}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default GTMReconciliationCard;
