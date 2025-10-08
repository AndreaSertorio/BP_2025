'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Target,
  TrendingUp,
  DollarSign,
  Globe,
  Calculator,
  Save,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export function TamSamSomDashboard() {
  const { data, loading, toggleAggredibile: toggleAggredibileDB } = useDatabase();
  
  const [activeView, setActiveView] = useState<'procedures' | 'devices'>('procedures');
  const [selectedRegion, setSelectedRegion] = useState('IT');
  const [samPercentage, setSamPercentage] = useState(35);
  const [hasChanges, setHasChanges] = useState(false);

  const mercatoEcografie = data?.mercatoEcografie;
  const mercatoEcografi = data?.mercatoEcografi;

  // Toggle aggredibile
  async function toggleAggredibile(code: string) {
    if (!mercatoEcografie) return;
    try {
      await toggleAggredibileDB(code);
      setHasChanges(true);
    } catch (error) {
      console.error('Errore toggle:', error);
      alert('❌ Errore durante il salvataggio');
    }
  }

  // Helper
  function isAggredibile(code: string): boolean {
    if (!mercatoEcografie) return false;
    const prestazione = mercatoEcografie.italia.prestazioni.find(p => p.codice === code);
    return prestazione?.aggredibile || false;
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Caricamento dati...</p>
      </div>
    );
  }

  // Error
  if (!mercatoEcografie) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
        <Info className="h-16 w-16 text-orange-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Dati non disponibili</h3>
        <Button onClick={() => window.location.reload()}>Ricarica</Button>
      </div>
    );
  }

  // === CALCOLI TAM/SAM/SOM ===
  
  const calculateTAM = () => {
    if (activeView === 'procedures') {
      // TAM basato su procedure aggredibili
      const prestazioni = mercatoEcografie.italia.prestazioni;
      const aggredibili = prestazioni.filter(p => p.aggredibile);
      
      const volumeTotale = aggredibili.reduce((sum, p) => sum + p.P, 0);
      const prezzoMedio = 77.5; // Prezzo medio per esame (da configurazione)
      
      return volumeTotale * prezzoMedio;
    } else {
      // TAM basato su ecografi (valore di mercato stimato)
      if (!mercatoEcografi) return 0;
      
      const anno2025 = mercatoEcografi.proiezioniItalia?.find((p: any) => p.anno === 2025);
      if (!anno2025) return 0;
      
      // Usa la media dei valori di mercato disponibili (in milioni)
      const marketValueM = anno2025.media || anno2025.mediana || 0;
      return marketValueM * 1000000; // Converti in unità base
    }
  };

  const calculateSAM = () => {
    const tam = calculateTAM();
    return tam * (samPercentage / 100);
  };

  const calculateSOM = (year: 1 | 3 | 5) => {
    const sam = calculateSAM();
    // Assumptions di default per SOM
    const somPercentages = {
      1: 0.005,  // 0.5% year 1
      3: 0.02,   // 2% year 3
      5: 0.05    // 5% year 5
    };
    return sam * somPercentages[year];
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `€${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const tam = calculateTAM();
  const sam = calculateSAM();
  const som1 = calculateSOM(1);
  const som3 = calculateSOM(3);
  const som5 = calculateSOM(5);

  const prestazioni = mercatoEcografie.italia.prestazioni;
  const aggredibili = prestazioni.filter(p => p.aggredibile);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="h-8 w-8 text-indigo-600" />
              TAM / SAM / SOM Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Total Addressable Market • Serviceable Available Market • Serviceable Obtainable Market
            </p>
          </div>
          {hasChanges && (
            <Badge className="bg-green-600">✅ Salvato</Badge>
          )}
        </div>

        {/* Toggle View */}
        <div className="flex gap-3">
          <Button
            variant={activeView === 'procedures' ? 'default' : 'outline'}
            onClick={() => setActiveView('procedures')}
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Vista Esami (Procedures)
          </Button>
          <Button
            variant={activeView === 'devices' ? 'default' : 'outline'}
            onClick={() => setActiveView('devices')}
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-2" />
            Vista Dispositivi (Devices)
          </Button>
        </div>
      </Card>

      {/* Metriche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold opacity-90">TAM</h3>
            <Globe className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(tam)}</div>
          <p className="text-sm opacity-75">Mercato Totale Indirizzabile</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold opacity-90">SAM</h3>
            <Target className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(sam)}</div>
          <p className="text-sm opacity-75">Mercato Servibile ({samPercentage}% TAM)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold opacity-90">SOM Y1</h3>
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(som1)}</div>
          <p className="text-sm opacity-75">Mercato Ottenibile Anno 1</p>
        </Card>
      </div>

      {/* SAM Percentage Slider */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Percentuale SAM Customizzabile</h3>
            <p className="text-sm text-gray-600">Regola la percentuale di TAM che consideri servibile</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {samPercentage}%
          </Badge>
        </div>
        <Slider
          value={[samPercentage]}
          onValueChange={(value) => {
            setSamPercentage(value[0]);
            setHasChanges(true);
          }}
          min={1}
          max={100}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Proiezioni SOM */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Proiezioni SOM Multi-Anno
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-semibold mb-1">Anno 1 (0.5% SAM)</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(som1)}</div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="text-sm text-indigo-700 font-semibold mb-1">Anno 3 (2% SAM)</div>
            <div className="text-2xl font-bold text-indigo-900">{formatCurrency(som3)}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700 font-semibold mb-1">Anno 5 (5% SAM)</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(som5)}</div>
          </div>
        </div>
      </Card>

      {/* Vista Procedures */}
      {activeView === 'procedures' && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📋 Procedure Ecografiche Aggredibili - {selectedRegion}
            </h3>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Totale: <strong>{prestazioni.length}</strong></span>
              <span className="text-green-700">Aggredibili: <strong>{aggredibili.length}</strong></span>
              <span className="text-gray-600">Coverage: <strong>{((aggredibili.length / prestazioni.length) * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Aggredibile</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Codice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Volume (P)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Extra SSN %</th>
                </tr>
              </thead>
              <tbody>
                {prestazioni.map((p) => (
                  <tr 
                    key={p.codice}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${p.aggredibile ? 'bg-green-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAggredibile(p.codice)}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                          p.aggredibile ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        {p.aggredibile ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <XCircle className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{p.codice}</td>
                    <td className={`px-4 py-3 ${p.aggredibile ? 'font-semibold' : ''}`}>{p.nome}</td>
                    <td className="px-4 py-3 text-right font-mono">{p.P.toLocaleString('it-IT')}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{p.percentualeExtraSSN}%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Vista Devices */}
      {activeView === 'devices' && mercatoEcografi && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔬 Mercato Dispositivi Ecografi - Italia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mercatoEcografi.proiezioniItalia?.slice(0, 3).map((proj: any) => (
              <div key={proj.anno} className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm font-semibold text-gray-700 mb-2">Anno {proj.anno}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fonte Mordor:</span>
                    <span className="font-bold">{formatCurrency((proj.mordor || 0) * 1000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fonte Research:</span>
                    <span className="font-bold">{formatCurrency((proj.research || 0) * 1000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Media:</span>
                    <Badge variant="outline">{formatCurrency((proj.media || 0) * 1000000)}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Proiezioni di mercato basate su dati di {mercatoEcografi.proiezioniItalia?.length || 0} anni. 
              Parco installato Italia (scenario centrale, 2025): {
                (mercatoEcografi.parcoIT?.find((p: any) => p.anno === 2025)?.centrale || 0).toLocaleString('it-IT')
              } unità.
            </p>
          </div>
        </Card>
      )}

      {/* Note */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-700 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> TAM calcolato da procedure aggredibili × prezzo medio. 
            SAM personalizzabile tramite slider. SOM basato su assunzioni conservative (0.5%/2%/5%).
          </div>
        </div>
      </Card>
    </div>
  );
}
