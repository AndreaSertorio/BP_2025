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
  const [selectedRegion, setSelectedRegion] = useState<'italia' | 'europa' | 'usa' | 'cina' | 'mondo'>('italia');
  const [samPercentage, setSamPercentage] = useState(35);
  const [somPercentages, setSomPercentages] = useState({ y1: 0.5, y3: 2, y5: 5 });
  const [prezzoMedioProcedura, setPrezzoMedioProcedura] = useState(77.5);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [priceMode, setPriceMode] = useState<'semplice' | 'perProcedura' | 'regionalizzato'>('semplice');
  const [tipoPrezzo, setTipoPrezzo] = useState<'pubblico' | 'privato' | 'medio'>('medio');
  const [hasChanges, setHasChanges] = useState(false);

  const mercatoEcografie = data?.mercatoEcografie;
  const mercatoEcografi = data?.mercatoEcografi;
  const prezziRegionalizzati = data?.prezziEcografieRegionalizzati;

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
      
      if (priceMode === 'semplice') {
        // MODALITÀ 1: Prezzo medio generale
        const volumeTotale = aggredibili.reduce((sum, p) => sum + p.P, 0);
        return volumeTotale * prezzoMedioProcedura;
        
      } else if (priceMode === 'perProcedura' && prezziRegionalizzati) {
        // MODALITÀ 2: Prezzi specifici per procedura (Italia)
        const prezziItalia = prezziRegionalizzati.italia || [];
        let tamTotale = 0;
        
        aggredibili.forEach(proc => {
          const prezzoInfo = prezziItalia.find((p: any) => p.codice === proc.codice);
          if (prezzoInfo) {
            let prezzo = prezzoMedioProcedura; // fallback
            
            if (tipoPrezzo === 'pubblico') {
              prezzo = prezzoInfo.prezzoPubblico || prezzoMedioProcedura;
            } else if (tipoPrezzo === 'privato') {
              prezzo = prezzoInfo.prezzoPrivato || prezzoMedioProcedura;
            } else {
              // medio
              prezzo = (prezzoInfo.prezzoPubblico + prezzoInfo.prezzoPrivato) / 2;
            }
            
            tamTotale += proc.P * prezzo;
          } else {
            tamTotale += proc.P * prezzoMedioProcedura;
          }
        });
        
        return tamTotale;
        
      } else if (priceMode === 'regionalizzato' && prezziRegionalizzati) {
        // MODALITÀ 3: Prezzi regionalizzati
        const prezziRegione = prezziRegionalizzati[selectedRegion] || [];
        let tamTotale = 0;
        
        aggredibili.forEach(proc => {
          const prezzoInfo = prezziRegione.find((p: any) => p.codice === proc.codice);
          if (prezzoInfo) {
            let prezzo = prezzoMedioProcedura;
            
            if (tipoPrezzo === 'pubblico') {
              prezzo = prezzoInfo.prezzoPubblico || prezzoMedioProcedura;
            } else if (tipoPrezzo === 'privato') {
              prezzo = prezzoInfo.prezzoPrivato || prezzoMedioProcedura;
            } else {
              prezzo = (prezzoInfo.prezzoPubblico + prezzoInfo.prezzoPrivato) / 2;
            }
            
            tamTotale += proc.P * prezzo;
          } else {
            tamTotale += proc.P * prezzoMedioProcedura;
          }
        });
        
        return tamTotale;
      }
      
      // Fallback
      const volumeTotale = aggredibili.reduce((sum, p) => sum + p.P, 0);
      return volumeTotale * prezzoMedioProcedura;
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
    const percentageMap = {
      1: somPercentages.y1 / 100,
      3: somPercentages.y3 / 100,
      5: somPercentages.y5 / 100
    };
    return sam * percentageMap[year];
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

      {/* Configurazione Prezzi Multi-Livello */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Configurazione Prezzi Procedure
            </h3>
            <p className="text-sm text-gray-600 mt-1">Scegli il livello di dettaglio per il calcolo TAM</p>
          </div>
          <Button
            variant={showPriceEditor ? "default" : "outline"}
            onClick={() => setShowPriceEditor(!showPriceEditor)}
            size="sm"
          >
            {showPriceEditor ? 'Nascondi' : 'Configura Prezzi'}
          </Button>
        </div>
        
        {showPriceEditor && (
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
            {/* Selezione Modalità */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                📊 Modalità di Calcolo Prezzi
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('semplice');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'semplice' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">🎯 Semplice</div>
                  <div className="text-xs text-gray-600">Prezzo medio generale</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('perProcedura');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'perProcedura' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">📋 Per Procedura</div>
                  <div className="text-xs text-gray-600">Prezzi specifici (Italia)</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('regionalizzato');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'regionalizzato' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">🌍 Regionalizzato</div>
                  <div className="text-xs text-gray-600">Prezzi per regione</div>
                </button>
              </div>
            </div>

            {/* MODALITÀ SEMPLICE */}
            {priceMode === 'semplice' && (
              <div className="p-4 bg-white rounded-lg border">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Prezzo Medio per Esame: €{prezzoMedioProcedura.toFixed(2)}
                </label>
                <Slider
                  value={[prezzoMedioProcedura]}
                  onValueChange={(value) => {
                    setPrezzoMedioProcedura(value[0]);
                    setHasChanges(true);
                  }}
                  min={30}
                  max={150}
                  step={0.5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>€30 (SSN)</span>
                  <span>€90 (Medio)</span>
                  <span>€150 (Privato)</span>
                </div>
              </div>
            )}

            {/* MODALITÀ PER PROCEDURA */}
            {priceMode === 'perProcedura' && (
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Tipo di Prezzo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('pubblico')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'pubblico'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💙 Pubblico (SSN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('medio')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'medio'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💜 Media Pubblico/Privato
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('privato')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'privato'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💚 Privato
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Info:</strong> Usa prezzi specifici per ogni procedura aggredibile.
                    I prezzi provengono dall'Excel regionalizzato (regione Italia).
                  </p>
                </div>
              </div>
            )}

            {/* MODALITÀ REGIONALIZZATA */}
            {priceMode === 'regionalizzato' && (
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Regione
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['italia', 'europa', 'usa', 'cina', 'mondo'].map(region => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => setSelectedRegion(region as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                          selectedRegion === region
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {region === 'italia' && '🇮🇹'}
                        {region === 'europa' && '🇪🇺'}
                        {region === 'usa' && '🇺🇸'}
                        {region === 'cina' && '🇨🇳'}
                        {region === 'mondo' && '🌍'}
                        {' '}{region}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Tipo di Prezzo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('pubblico')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'pubblico'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💙 Pubblico
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('medio')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'medio'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💜 Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPrezzo('privato')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tipoPrezzo === 'privato'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💚 Privato
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-800">
                    <strong>Info:</strong> Calcolo TAM con prezzi specifici per regione {selectedRegion.toUpperCase()}.
                    Massima precisione con dati regionalizzati dall'Excel.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Proiezioni SOM */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Proiezioni SOM Multi-Anno (Personalizzabili)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 font-semibold mb-1">Anno 1 ({somPercentages.y1}% SAM)</div>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(som1)}</div>
            </div>
            <div className="px-2">
              <Slider
                value={[somPercentages.y1]}
                onValueChange={(value) => {
                  setSomPercentages({...somPercentages, y1: value[0]});
                  setHasChanges(true);
                }}
                min={0.1}
                max={10}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{somPercentages.y1}%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-700 font-semibold mb-1">Anno 3 ({somPercentages.y3}% SAM)</div>
              <div className="text-2xl font-bold text-indigo-900">{formatCurrency(som3)}</div>
            </div>
            <div className="px-2">
              <Slider
                value={[somPercentages.y3]}
                onValueChange={(value) => {
                  setSomPercentages({...somPercentages, y3: value[0]});
                  setHasChanges(true);
                }}
                min={0.1}
                max={20}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{somPercentages.y3}%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 font-semibold mb-1">Anno 5 ({somPercentages.y5}% SAM)</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(som5)}</div>
            </div>
            <div className="px-2">
              <Slider
                value={[somPercentages.y5]}
                onValueChange={(value) => {
                  setSomPercentages({...somPercentages, y5: value[0]});
                  setHasChanges(true);
                }}
                min={0.1}
                max={30}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{somPercentages.y5}%</span>
                <span>30%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Le percentuali SOM rappresentano la quota di SAM che prevedi di conquistare.
            Valori conservativi: Y1=0.5%, Y3=2%, Y5=5%. Valori ottimistici: Y1=2%, Y3=10%, Y5=20%.
          </p>
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
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleAggredibile(p.codice);
                        }}
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
            <strong>Formula TAM:</strong> Σ(Volume procedure aggredibili × €{prezzoMedioProcedura.toFixed(2)}) = {formatCurrency(tam)}<br/>
            <strong>Formula SAM:</strong> TAM × {samPercentage}% = {formatCurrency(sam)}<br/>
            <strong>Formula SOM:</strong> SAM × [{somPercentages.y1}% / {somPercentages.y3}% / {somPercentages.y5}%]
          </div>
        </div>
      </Card>
    </div>
  );
}
