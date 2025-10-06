/**
 * ============================================================================
 * DEBUG COMPONENT - MERCATO
 * ============================================================================
 * 
 * Componente per debug dello stato MercatoContext.
 * Mostra esattamente cosa c'è nel Context.
 */

'use client';

import React from 'react';
import { useMercato } from '@/contexts/MercatoContext';
import { Card } from '@/components/ui/card';

export function DebugMercato() {
  const { stato, calcolati } = useMercato();
  
  return (
    <Card className="p-6 bg-yellow-50 border-yellow-300">
      <h2 className="text-xl font-bold mb-4 text-yellow-900">🐛 DEBUG - Stato MercatoContext</h2>
      
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-bold text-yellow-800">Configurazione:</h3>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify({
              annoTarget: stato.configurazione.annoTarget,
              marketShareTarget: stato.configurazione.marketShareTarget,
              regioniVisibili: Array.from(stato.configurazione.regioniVisibili),
              scenarioParcoIT: stato.configurazione.scenarioParcoIT
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-bold text-yellow-800">Dati Base:</h3>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-40">
            {JSON.stringify({
              numeroEcografi: stato.datiBase.numeroEcografi.length + ' regioni',
              valoreMercato: stato.datiBase.valoreMercato.length + ' regioni',
              parcoIT: stato.datiBase.parcoIT.length + ' anni',
              tipologie: stato.datiBase.tipologie.length,
              proiezioniItalia: stato.datiBase.proiezioniItalia.length + ' anni',
              quoteTipologie: stato.datiBase.quoteTipologie.length + ' anni',
              
              primiNumeroEcografi: stato.datiBase.numeroEcografi.slice(0, 2),
              primiValoreMercato: stato.datiBase.valoreMercato.slice(0, 2)
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-bold text-yellow-800">Calcolati:</h3>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify({
              mercatoGlobaleTarget: calcolati.mercatoGlobaleTarget,
              mercatoItaliaTarget: calcolati.mercatoItaliaTarget,
              unitaTargetRegioni: calcolati.unitaTargetRegioni,
              unitaTargetEco3D: calcolati.unitaTargetEco3D,
              parcoDispositiviTarget: calcolati.parcoDispositiviTarget
            }, null, 2)}
          </pre>
        </div>
      </div>
    </Card>
  );
}
