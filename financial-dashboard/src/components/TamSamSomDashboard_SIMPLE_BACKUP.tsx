'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Target,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

export function TamSamSomDashboard() {
  const { data, loading, toggleAggredibile } = useDatabase();
  const [hasChanges, setHasChanges] = useState(false);

  const mercatoEcografie = data?.mercatoEcografie;

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Caricamento dati dal server...</p>
        <p className="text-xs text-gray-400 mt-2">Server API: localhost:3001</p>
      </div>
    );
  }

  // Error state
  if (!mercatoEcografie) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Dati non disponibili</h3>
        <p className="text-gray-600 mb-4 max-w-md">
          La sezione <code className="bg-gray-100 px-2 py-1 rounded">mercatoEcografie</code> non è presente nel database.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Assicurati che il server API sia attivo su <strong>localhost:3001</strong>
        </p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Ricarica pagina
          </Button>
          <Button 
            onClick={() => window.open('http://localhost:3001/api/database', '_blank')} 
            variant="outline"
          >
            <Info className="mr-2 h-4 w-4" />
            Vedi database API
          </Button>
        </div>
      </div>
    );
  }

  // Calcola statistiche
  const prestazioni = mercatoEcografie.italia?.prestazioni || [];
  const aggredibili = prestazioni.filter(p => p.aggredibile);
  const nonAggredibili = prestazioni.filter(p => !p.aggredibile);
  
  // Calcola TAM semplificato (solo procedure aggredibili)
  const volumeTotale = aggredibili.reduce((sum, p) => sum + p.P, 0);
  const prezzoMedio = aggredibili.length > 0 
    ? aggredibili.reduce((sum, p) => sum + p.P, 0) / aggredibili.length
    : 0;
  const tamStimato = volumeTotale * prezzoMedio / 1000000; // In milioni

  // Handle toggle
  async function handleToggle(codice: string) {
    try {
      await toggleAggredibile(codice);
      setHasChanges(true);
    } catch (error) {
      console.error('Errore toggle:', error);
      alert('❌ Errore durante il salvataggio. Il server API è attivo?');
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-indigo-600" />
            TAM/SAM/SOM - Configurazione Procedure
          </h1>
          <p className="text-gray-600 mt-2">
            Seleziona le procedure ecografiche aggredibili dal mercato
          </p>
        </div>
        {hasChanges && (
          <Badge variant="default" className="bg-green-600">
            ✅ Modifiche salvate automaticamente
          </Badge>
        )}
      </div>

      {/* Alert Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">ℹ️ Versione Semplificata</h4>
            <p className="text-sm text-blue-800">
              Questa è una versione semplificata del componente TAM/SAM/SOM. 
              Puoi modificare quali procedure sono considerate "aggredibili" dal mercato. 
              Le modifiche vengono salvate automaticamente tramite l'API.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Nota:</strong> La sezione completa con calcoli TAM/SAM/SOM dettagliati 
              richiede dati aggiuntivi nel database (<code>market</code> section).
            </p>
          </div>
        </div>
      </Card>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Totale Procedure</div>
          <div className="text-3xl font-bold text-gray-900">{prestazioni.length}</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-green-700 mb-1 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aggredibili
          </div>
          <div className="text-3xl font-bold text-green-700">{aggredibili.length}</div>
          <div className="text-xs text-green-600 mt-1">
            {((aggredibili.length / prestazioni.length) * 100).toFixed(1)}% del mercato
          </div>
        </Card>
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Non Aggredibili
          </div>
          <div className="text-3xl font-bold text-gray-700">{nonAggredibili.length}</div>
        </Card>
        <Card className="p-4 bg-indigo-50 border-indigo-200">
          <div className="text-sm text-indigo-700 mb-1">TAM Stimato</div>
          <div className="text-3xl font-bold text-indigo-700">
            €{tamStimato.toFixed(1)}M
          </div>
          <div className="text-xs text-indigo-600 mt-1">Volume × Prezzo medio</div>
        </Card>
      </div>

      {/* Tabella Procedure */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Procedure Ecografiche - Italia
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">
                    Aggredibile
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Codice
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nome Procedura
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Volume SSN (P)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Extra SSN %
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {prestazioni.map((prestazione, idx) => (
                  <tr 
                    key={prestazione.codice}
                    className={`
                      border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${prestazione.aggredibile ? 'bg-green-50/50' : ''}
                    `}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(prestazione.codice)}
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-lg
                          transition-all duration-200 hover:scale-110
                          ${prestazione.aggredibile 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300 hover:bg-gray-400'}
                        `}
                      >
                        {prestazione.aggredibile ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <XCircle className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">
                      {prestazione.codice}
                    </td>
                    <td className={`px-4 py-3 ${prestazione.aggredibile ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {prestazione.nome}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-mono">
                      {prestazione.P.toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">
                        {prestazione.percentualeExtraSSN}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {prestazione.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <Card className="p-4 bg-gray-50">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Anno Riferimento:</strong> {mercatoEcografie.italia.annoRiferimento}</p>
          <p><strong>% Extra SSN Globale:</strong> {mercatoEcografie.italia.percentualeExtraSSN}%</p>
          <p className="text-xs text-gray-500 mt-2">{mercatoEcografie.italia.note}</p>
        </div>
      </Card>
    </div>
  );
}
