'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';

/**
 * COMPONENTE DI ESEMPIO - Marketing Plan Summary
 * 
 * Dimostra come accedere ai dati salvati del marketing plan
 * da qualsiasi parte dell'applicazione usando il DatabaseContext
 */
export function MarketingPlanSummary() {
  const { data, loading } = useDatabase();
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Caricamento...</div>
      </Card>
    );
  }
  
  const marketingPlan = data?.goToMarket?.marketingPlan;
  
  if (!marketingPlan || !marketingPlan.projections) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Nessun piano marketing disponibile. Vai nel Simulatore Impatto Business per generare le proiezioni.
        </div>
      </Card>
    );
  }
  
  // Calcola totali per tutti i 5 anni
  const years = [1, 2, 3, 4, 5];
  const projections = years.map(year => {
    const yearKey = `y${year}`;
    return marketingPlan.projections[yearKey];
  }).filter(Boolean);
  
  if (projections.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Nessuna proiezione salvata. Modifica i parametri nel Simulatore per generare i dati.
        </div>
      </Card>
    );
  }
  
  // Calcola metriche aggregate
  const totalBudget = projections.reduce((sum, p) => sum + (p.calculated?.budgetMarketing || 0), 0);
  const totalLeads = projections.reduce((sum, p) => sum + (p.calculated?.leadsNeeded || 0), 0);
  const avgCAC = projections.reduce((sum, p) => sum + (p.calculated?.cacEffettivo || 0), 0) / projections.length;
  const avgMarketingPercentage = projections.reduce((sum, p) => sum + (p.calculated?.marketingPercentage || 0), 0) / projections.length;
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">📊 Piano Marketing 5 Anni</h2>
        <p className="text-sm text-gray-500 mb-4">
          Dati salvati dal Simulatore Impatto Business
        </p>
        
        {/* KPI Principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div className="text-xs font-semibold text-blue-900">Budget Totale</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              €{(totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-blue-700 mt-1">5 anni</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <div className="text-xs font-semibold text-green-900">Lead Totali</div>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {(totalLeads / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-green-700 mt-1">5 anni</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <div className="text-xs font-semibold text-orange-900">CAC Medio</div>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              €{Math.round(avgCAC).toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 mt-1">Per deal</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="text-xs font-semibold text-purple-900">Marketing/Ricavi</div>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {avgMarketingPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-700 mt-1">Media 5 anni</div>
          </div>
        </div>
        
        {/* Tabella Anno per Anno */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Anno</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Reps</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Capacity</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Lead</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Budget</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">CAC</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Mkt/Rev</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Ultimo Agg.</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => {
                const yearKey = `y${year}`;
                const projection = marketingPlan.projections[yearKey];
                
                if (!projection || !projection.calculated) {
                  return (
                    <tr key={year} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-500" colSpan={8}>
                        Anno {year}: Non configurato
                      </td>
                    </tr>
                  );
                }
                
                const calc = projection.calculated;
                const lastUpdate = projection.lastUpdate 
                  ? new Date(projection.lastUpdate).toLocaleDateString('it-IT', { 
                      day: '2-digit', 
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A';
                
                return (
                  <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-900">Anno {year}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{calc.reps}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{calc.capacity}</td>
                    <td className="py-2 px-3 text-right text-gray-700">
                      {calc.leadsNeeded.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-900">
                      €{(calc.budgetMarketing / 1000).toFixed(0)}K
                    </td>
                    <td className="py-2 px-3 text-right text-orange-700">
                      €{calc.cacEffettivo.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-purple-700">
                      {calc.marketingPercentage.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right text-xs text-gray-500">
                      {lastUpdate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer con informazioni */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <strong>Fonte dati:</strong> database.goToMarket.marketingPlan.projections
            </div>
            <div>
              <strong>Ultimo aggiornamento globale:</strong>{' '}
              {marketingPlan.lastUpdate 
                ? new Date(marketingPlan.lastUpdate).toLocaleString('it-IT')
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </Card>
      
      {/* Card istruzioni per sviluppatori */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          💡 Come usare questi dati nel tuo componente
        </h3>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>1. Importa il context:</strong>
            <pre className="mt-1 p-2 bg-white rounded border border-blue-200 overflow-x-auto">
              <code>import {`{ useDatabase }`} from '@/contexts/DatabaseProvider';</code>
            </pre>
          </div>
          
          <div>
            <strong>2. Accedi ai dati:</strong>
            <pre className="mt-1 p-2 bg-white rounded border border-blue-200 overflow-x-auto">
              <code>{`const { data } = useDatabase();
const marketingPlan = data?.goToMarket?.marketingPlan;
const y3 = marketingPlan?.projections?.y3;`}</code>
            </pre>
          </div>
          
          <div>
            <strong>3. Usa i dati calcolati:</strong>
            <pre className="mt-1 p-2 bg-white rounded border border-blue-200 overflow-x-auto">
              <code>{`console.log('Budget Anno 3:', y3?.calculated?.budgetMarketing);
console.log('Lead Anno 3:', y3?.calculated?.leadsNeeded);
console.log('CAC Anno 3:', y3?.calculated?.cacEffettivo);`}</code>
            </pre>
          </div>
          
          <div className="pt-2 border-t border-blue-300">
            <strong>📊 Dati disponibili per ogni anno (y1-y5):</strong>
            <ul className="mt-2 ml-4 space-y-1">
              <li>• <code>costPerLead</code> - Costo per lead impostato</li>
              <li>• <code>dealsPerRepOverride</code> - Deals/rep customizzati</li>
              <li>• <code>calculated.reps</code> - Numero reps</li>
              <li>• <code>calculated.capacity</code> - Deals chiudibili</li>
              <li>• <code>calculated.leadsNeeded</code> - Lead necessari</li>
              <li>• <code>calculated.budgetMarketing</code> - Budget marketing</li>
              <li>• <code>calculated.cacEffettivo</code> - CAC per deal</li>
              <li>• <code>calculated.marketingPercentage</code> - Budget/Ricavi %</li>
              <li>• <code>lastUpdate</code> - Timestamp ultimo aggiornamento</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MarketingPlanSummary;
