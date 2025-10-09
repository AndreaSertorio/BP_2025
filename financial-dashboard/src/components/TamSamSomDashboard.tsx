'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Target,
  TrendingUp,
  Info,
  DollarSign,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
  Calculator,
  Globe
} from 'lucide-react';

export function TamSamSomDashboard() {
  const { 
    data, 
    loading, 
    toggleAggredibile: toggleAggredibileDB,
    updateConfigurazioneTamSamSomEcografie,
    updateConfigurazioneTamSamSomEcografi,
    updatePrezzoEcografiaRegionalizzato,
    setPercentualeExtraSSN
  } = useDatabase();
  
  const [activeView, setActiveView] = useState<'procedures' | 'devices'>('procedures');
  const [selectedRegion, setSelectedRegion] = useState<'italia' | 'europa' | 'usa' | 'cina'>('italia');
  const [samPercentage, setSamPercentage] = useState(35);
  const [somPercentages, setSomPercentages] = useState({ y1: 0.5, y3: 2, y5: 5 });
  const [prezzoMedioProcedura, setPrezzoMedioProcedura] = useState(77.5);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [showRegionalPriceEditor, setShowRegionalPriceEditor] = useState(false);
  const [priceMode, setPriceMode] = useState<'semplice' | 'perProcedura' | 'regionalizzato'>('semplice');
  const [tipoPrezzo, setTipoPrezzo] = useState<'pubblico' | 'privato' | 'medio'>('medio');
  const [volumeMode, setVolumeMode] = useState<'totale' | 'ssn' | 'extraSsn'>('totale');
  
  // State per Vista Devices
  const [selectedYear, setSelectedYear] = useState(2025);
  const [regioniAttive, setRegioniAttive] = useState({
    italia: true,
    europa: true,
    usa: true,
    cina: true
  });
  const [hasChanges, setHasChanges] = useState(false);
  
  // State per editing inline prezzi (come nel Budget)
  const [editingPrice, setEditingPrice] = useState<{ codice: string; tipo: 'pubblico' | 'privato'; value: string } | null>(null);
  
  // State per regione tabella procedure (separato da selectedRegion usato per calcolo TAM)
  const [tableRegion, setTableRegion] = useState<'italia' | 'europa' | 'usa' | 'cina'>('italia');
  
  // State per editing percentuale Extra SSN
  const [editingExtraSSN, setEditingExtraSSN] = useState<{ codice: string; value: string } | null>(null);

  const mercatoEcografie = data?.mercatoEcografie;
  const mercatoEcografi = data?.mercatoEcografi;
  const prezziRegionalizzati = data?.prezziEcografieRegionalizzati;
  const regioniMondiali = data?.regioniMondiali;
  const configTamSamSom = data?.configurazioneTamSamSom?.ecografie;

  // Carica configurazione salvata al mount
  useEffect(() => {
    if (configTamSamSom) {
      setPriceMode(configTamSamSom.priceMode || 'semplice');
      setPrezzoMedioProcedura(configTamSamSom.prezzoMedioProcedura || 77.5);
      setTipoPrezzo(configTamSamSom.tipoPrezzo || 'medio');
      setSelectedRegion(configTamSamSom.regioneSelezionata || 'italia');
      setVolumeMode(configTamSamSom.volumeMode || 'totale');
      setSamPercentage(configTamSamSom.samPercentage || 35);
      setSomPercentages(configTamSamSom.somPercentages || { y1: 0.5, y3: 2, y5: 5 });
      console.log('✅ Configurazione TAM/SAM/SOM caricata dal database');
    }
  }, [configTamSamSom]);

  // Auto-salva configurazione quando cambiano i parametri (con debounce 1.5s)
  useEffect(() => {
    // Skip primo mount (quando configTamSamSom non è ancora caricato)
    if (!configTamSamSom) return;
    
    const timer = setTimeout(async () => {
      // Salva SOLO i parametri configurabili (non i valori calcolati che vengono derivati)
      await updateConfigurazioneTamSamSomEcografie({
        priceMode,
        prezzoMedioProcedura,
        tipoPrezzo,
        regioneSelezionata: selectedRegion,
        volumeMode,
        samPercentage,
        somPercentages
      });
      
      console.log('💾 Configurazione TAM/SAM/SOM salvata automaticamente');
    }, 1500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    priceMode, 
    prezzoMedioProcedura, 
    tipoPrezzo, 
    selectedRegion, 
    volumeMode, 
    samPercentage, 
    somPercentages
  ]);

  // Toggle aggredibile (NO RELOAD!)
  async function toggleAggredibile(code: string) {
    if (!mercatoEcografie) return;
    try {
      await toggleAggredibileDB(code);
      // Non serve setHasChanges - il toggle è salvato direttamente nel DB
      console.log('✅ Toggle salvato:', code);
    } catch (error) {
      console.error('❌ Errore toggle:', error);
      alert('❌ Errore durante il salvataggio');
    }
  }

  // Update prezzo dispositivo (NO RELOAD!)
  async function updatePrezzoDispositivo(categoriaId: 'carrellati' | 'portatili' | 'palmari', nuovoPrezzo: number) {
    try {
      const configEcografi = data?.configurazioneTamSamSom?.ecografi;
      const prezziAttuali = configEcografi?.prezziMediDispositivi || { carrellati: 50000, portatili: 25000, palmari: 8000 };
      
      const nuoviPrezzi = {
        ...prezziAttuali,
        [categoriaId]: nuovoPrezzo
      };

      await updateConfigurazioneTamSamSomEcografi({
        prezziMediDispositivi: nuoviPrezzi
      });
      
      console.log(`✅ Prezzo ${categoriaId} aggiornato: €${nuovoPrezzo.toLocaleString('it-IT')}`);
    } catch (error) {
      console.error('❌ Errore aggiornamento prezzo:', error);
      alert('❌ Errore durante il salvataggio');
    }
  }

  // Helper per calcolare volumi SSN/ExtraSSN/Totale con moltiplicatore regionale
  // FORMULA CORRETTA (come MercatoEcografie):
  // colE (SSN) = U + B + D + P
  // extraSSN = colE × (percentuale/100)
  // totale = colE + extraSSN
  const calculateVolumes = useCallback((prestazione: any, regione: 'italia' | 'europa' | 'usa' | 'cina' = 'italia') => {
    // Calcola colE (Volume SSN) = somma di tutte le colonne come in MercatoEcografie
    const colE = (prestazione.U || 0) + (prestazione.B || 0) + (prestazione.D || 0) + (prestazione.P || 0);
    const percExtraSSN = prestazione.percentualeExtraSSN || 0;
    
    // Ottieni moltiplicatore di volume dalla regione (Italia = 1, default)
    const moltiplicatore = regione === 'italia' 
      ? 1 
      : (regioniMondiali?.[regione]?.moltiplicatoreVolume || 1);
    
    // Applica moltiplicatore
    const volumeSSN = Math.round(colE * moltiplicatore);
    const volumeExtraSSN = Math.round((colE * moltiplicatore) * (percExtraSSN / 100));
    const volumeTotale = volumeSSN + volumeExtraSSN;
    
    return {
      totale: volumeTotale,
      ssn: volumeSSN,
      extraSsn: volumeExtraSSN
    };
  }, [regioniMondiali]);

  // Helper per ottenere volume basato su volumeMode (usa selectedRegion per calcoli TAM)
  const getVolume = useCallback((prestazione: any) => {
    const volumes = calculateVolumes(prestazione, selectedRegion);
    switch (volumeMode) {
      case 'ssn': return volumes.ssn;
      case 'extraSsn': return volumes.extraSsn;
      default: return volumes.totale;
    }
  }, [volumeMode, selectedRegion, calculateVolumes]);

  // Calcoli TAM/SAM/SOM (prima dei return condizionali per hooks)
  const calculateTAMValue = useCallback(() => {
    if (!mercatoEcografie) return 0;
    
    if (activeView === 'procedures') {
      const prestazioni = mercatoEcografie.italia.prestazioni;
      const aggredibili = prestazioni.filter(p => p.aggredibile);
      
      if (priceMode === 'semplice') {
        const volumeTotale = aggredibili.reduce((sum, p) => sum + getVolume(p), 0);
        return volumeTotale * prezzoMedioProcedura;
      } else if (priceMode === 'perProcedura' && prezziRegionalizzati) {
        const prezziItalia = prezziRegionalizzati.italia || [];
        let tamTotale = 0;
        
        aggredibili.forEach(proc => {
          const volume = getVolume(proc);
          const prezzoInfo = prezziItalia.find((p: any) => p.codice === proc.codice);
          if (prezzoInfo) {
            let prezzo = prezzoMedioProcedura;
            if (tipoPrezzo === 'pubblico') {
              prezzo = prezzoInfo.prezzoPubblico || prezzoMedioProcedura;
            } else if (tipoPrezzo === 'privato') {
              prezzo = prezzoInfo.prezzoPrivato || prezzoMedioProcedura;
            } else {
              prezzo = (prezzoInfo.prezzoPubblico + prezzoInfo.prezzoPrivato) / 2;
            }
            tamTotale += volume * prezzo;
          } else {
            tamTotale += volume * prezzoMedioProcedura;
          }
        });
        return tamTotale;
      } else if (priceMode === 'regionalizzato' && prezziRegionalizzati) {
        const prezziRegione = prezziRegionalizzati[selectedRegion] || [];
        let tamTotale = 0;
        
        aggredibili.forEach(proc => {
          const volume = getVolume(proc);
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
            tamTotale += volume * prezzo;
          } else {
            tamTotale += volume * prezzoMedioProcedura;
          }
        });
        return tamTotale;
      }
      
      const volumeTotale = aggredibili.reduce((sum, p) => sum + getVolume(p), 0);
      return volumeTotale * prezzoMedioProcedura;
    } else {
      if (!mercatoEcografi) return 0;
      const anno2025 = mercatoEcografi.proiezioniItalia?.find((p: any) => p.anno === 2025);
      if (!anno2025) return 0;
      const marketValueM = anno2025.media || anno2025.mediana || 0;
      return marketValueM * 1000000;
    }
  }, [mercatoEcografie, mercatoEcografi, activeView, priceMode, volumeMode, prezzoMedioProcedura, tipoPrezzo, selectedRegion, prezziRegionalizzati, getVolume]);

  const tam = calculateTAMValue();
  const sam = tam * (samPercentage / 100);
  const som1 = sam * (somPercentages.y1 / 100);
  const som3 = sam * (somPercentages.y3 / 100);
  const som5 = sam * (somPercentages.y5 / 100);

  // DISABILITATO AUTO-SAVE - causava loop infinito e reload continui!
  // Salvataggio manuale solo quando utente modifica esplicitamente un valore

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

  // Helper formatCurrency
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

      {/* Metriche Principali con Tooltip */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TAM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">TAM</h3>
                  <Globe className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(tam)}</div>
                <p className="text-sm opacity-75">Mercato Totale Indirizzabile</p>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-blue-300">
              <div className="space-y-2">
                <div className="font-bold text-blue-900 text-sm">📊 Formula TAM:</div>
                {priceMode === 'semplice' && (
                  <div className="text-xs space-y-1">
                    <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Volume × Prezzo medio)</div>
                    <div className="text-gray-700">
                      • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                      • Volume totale: <strong>{(mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).reduce((sum, p) => sum + p.P, 0) || 0).toLocaleString('it-IT')}</strong><br/>
                      • Prezzo medio: <strong>€{prezzoMedioProcedura.toFixed(2)}</strong><br/>
                      • <strong>TAM = {formatCurrency(tam)}</strong>
                    </div>
                  </div>
                )}
                {priceMode === 'perProcedura' && (
                  <div className="text-xs space-y-1">
                    <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Volume × Prezzo specifico)</div>
                    <div className="text-gray-700">
                      • Modalità: <strong>Per Procedura (Italia)</strong><br/>
                      • Tipo: <strong>{tipoPrezzo === 'pubblico' ? '💙 Pubblico' : tipoPrezzo === 'privato' ? '💚 Privato' : '💜 Media'}</strong><br/>
                      • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                      • <strong>TAM = {formatCurrency(tam)}</strong>
                    </div>
                  </div>
                )}
                {priceMode === 'regionalizzato' && (
                  <div className="text-xs space-y-1">
                    <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Volume × Prezzo regionale)</div>
                    <div className="text-gray-700">
                      • Regione: <strong>{selectedRegion.toUpperCase()}</strong><br/>
                      • Tipo: <strong>{tipoPrezzo === 'pubblico' ? '💙 Pubblico' : tipoPrezzo === 'privato' ? '💚 Privato' : '💜 Media'}</strong><br/>
                      • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                      • <strong>TAM = {formatCurrency(tam)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* SAM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">SAM</h3>
                  <Target className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(sam)}</div>
                <p className="text-sm opacity-75">Mercato Servibile ({samPercentage}% TAM)</p>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-indigo-300">
              <div className="space-y-2">
                <div className="font-bold text-indigo-900 text-sm">🎯 Formula SAM:</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono bg-indigo-50 p-2 rounded">SAM = TAM × (SAM% / 100)</div>
                  <div className="text-gray-700">
                    • TAM: <strong>{formatCurrency(tam)}</strong><br/>
                    • Percentuale SAM: <strong>{samPercentage}%</strong><br/>
                    • Calcolo: {formatCurrency(tam)} × ({samPercentage}/100)<br/>
                    • <strong>SAM = {formatCurrency(sam)}</strong>
                  </div>
                  <div className="mt-2 p-2 bg-indigo-50 rounded text-gray-600">
                    💡 SAM è la porzione del TAM che puoi realisticamente raggiungere considerando limiti geografici, capacità operativa, concorrenza.
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* SOM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">SOM Y1</h3>
                  <TrendingUp className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(som1)}</div>
                <p className="text-sm opacity-75">Mercato Ottenibile Anno 1</p>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-purple-300">
              <div className="space-y-2">
                <div className="font-bold text-purple-900 text-sm">📈 Formula SOM (Anno 1):</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono bg-purple-50 p-2 rounded">SOM = SAM × (SOM% / 100)</div>
                  <div className="text-gray-700">
                    • SAM: <strong>{formatCurrency(sam)}</strong><br/>
                    • Percentuale SOM (Y1): <strong>{somPercentages.y1}%</strong><br/>
                    • Calcolo: {formatCurrency(sam)} × ({somPercentages.y1}/100)<br/>
                    • <strong>SOM (Y1) = {formatCurrency(som1)}</strong>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="text-gray-600">📅 Proiezioni multi-anno:</div>
                    <div className="p-2 bg-blue-50 rounded">
                      • Anno 1 ({somPercentages.y1}%): <strong>{formatCurrency(som1)}</strong>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded">
                      • Anno 3 ({somPercentages.y3}%): <strong>{formatCurrency(som3)}</strong>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      • Anno 5 ({somPercentages.y5}%): <strong>{formatCurrency(som5)}</strong>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-purple-50 rounded text-gray-600">
                    💡 SOM è la quota di SAM che prevedi realisticamente di conquistare considerando risorse, tempo, strategia go-to-market.
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

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
                    I prezzi provengono dall&apos;Excel regionalizzato (regione Italia).
                  </p>
                </div>
              </div>
            )}

            {/* MODALITÀ VOLUME (per tutti i priceMode) */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-200">
              <label className="text-sm font-semibold text-gray-800 mb-3 block">
                📊 Modalità Volume per Calcolo TAM
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVolumeMode('totale')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'totale'
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">📊 Volume Totale</div>
                  <div className="text-xs opacity-75 mt-1">SSN + ExtraSSN</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMode('ssn')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'ssn'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">🏥 Solo SSN</div>
                  <div className="text-xs opacity-75 mt-1">Pubblico</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMode('extraSsn')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'extraSsn'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">💳 Solo Extra-SSN</div>
                  <div className="text-xs opacity-75 mt-1">Privato</div>
                </button>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs text-gray-700">
                <strong>Modalità attiva:</strong> {volumeMode === 'totale' ? '📊 Volume Totale' : volumeMode === 'ssn' ? '🏥 Solo SSN' : '💳 Solo Extra-SSN'} • 
                Il calcolo TAM userà {volumeMode === 'totale' ? 'il volume completo' : volumeMode === 'ssn' ? 'solo i volumi SSN' : 'solo i volumi Extra-SSN'} delle procedure
              </div>
            </div>

            {/* MODALITÀ REGIONALIZZATA */}
            {priceMode === 'regionalizzato' && (
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Regione
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['italia', 'europa', 'usa', 'cina'].map(region => (
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
                        {region === 'italia' && '🇮🇹 Italia'}
                        {region === 'europa' && '🇪🇺 Europa'}
                        {region === 'usa' && '🇺🇸 USA'}
                        {region === 'cina' && '🇨🇳 Cina'}
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
                    Massima precisione con dati regionalizzati dall&apos;Excel.
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
              📋 Procedure Ecografiche Aggredibili
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-gray-600 font-semibold">Seleziona Mercato:</span>
              <div className="flex gap-2">
                {(['italia', 'europa', 'usa', 'cina'] as const).map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setTableRegion(region)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tableRegion === region
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region === 'italia' ? '🇮🇹 Italia' : 
                     region === 'europa' ? '🇪🇺 Europa' :
                     region === 'usa' ? '🇺🇸 USA' : '🇨🇳 Cina'}
                  </button>
                ))}
              </div>
            </div>
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. Totale</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. SSN</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. Extra-SSN</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Extra SSN %</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Prezzo SSN €</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">Prezzo Privato €</th>
                </tr>
              </thead>
              <tbody>
                {prestazioni.map((p) => {
                  // Usa tableRegion per volumi E prezzi della regione selezionata
                  const volumes = calculateVolumes(p, tableRegion);
                  const prezzoInfo = prezziRegionalizzati?.[tableRegion]?.find((pr: any) => pr.codice === p.codice);
                  const prezzoSSN = prezzoInfo?.prezzoPubblico || Math.round(prezzoMedioProcedura);
                  const prezzoPrivato = prezzoInfo?.prezzoPrivato || Math.round(prezzoMedioProcedura * 1.3);
                  
                  return (
                  <tr 
                    key={p.codice}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${p.aggredibile ? 'bg-green-50/50' : ''}`}
                  >
                    {/* Aggredibile - Pattern Budget: td onClick invece di button */}
                    <td 
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => toggleAggredibile(p.codice)}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                        p.aggredibile ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}>
                        {p.aggredibile ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <XCircle className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 font-mono text-sm">{p.codice}</td>
                    <td className={`px-4 py-3 ${p.aggredibile ? 'font-semibold' : ''}`}>{p.nome}</td>
                    
                    {/* Volume Totale */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                      {volumes.totale.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Volume SSN */}
                    <td className="px-4 py-3 text-right font-mono text-blue-700">
                      {volumes.ssn.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Volume Extra-SSN */}
                    <td className="px-4 py-3 text-right font-mono text-green-700">
                      {volumes.extraSsn.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Extra SSN % Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingExtraSSN) {
                          setEditingExtraSSN({ codice: p.codice, value: p.percentualeExtraSSN.toString() });
                        }
                      }}
                    >
                      {editingExtraSSN?.codice === p.codice ? (
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={editingExtraSSN.value}
                          onChange={(e) => setEditingExtraSSN({ ...editingExtraSSN, value: e.target.value })}
                          onBlur={async () => {
                            const newPerc = parseInt(editingExtraSSN.value);
                            if (!isNaN(newPerc) && newPerc >= 0 && newPerc <= 100) {
                              try {
                                await setPercentualeExtraSSN(p.codice, newPerc);
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio Extra SSN %:', error);
                              }
                            }
                            setEditingExtraSSN(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingExtraSSN(null);
                          }}
                          className="w-16 px-2 py-1 text-right border-2 border-orange-400 rounded focus:outline-none focus:border-orange-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-orange-50">
                          <Badge variant="outline">{p.percentualeExtraSSN}%</Badge>
                        </div>
                      )}
                    </td>
                    
                    {/* Prezzo SSN Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingPrice) {
                          setEditingPrice({ codice: p.codice, tipo: 'pubblico', value: prezzoSSN.toString() });
                        }
                      }}
                    >
                      {editingPrice?.codice === p.codice && editingPrice.tipo === 'pubblico' ? (
                        <input
                          type="number"
                          step="1"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })}
                          onBlur={async () => {
                            const newPrice = parseInt(editingPrice.value);
                            if (!isNaN(newPrice)) {
                              try {
                                await updatePrezzoEcografiaRegionalizzato(
                                  tableRegion,
                                  p.codice,
                                  { prezzoPubblico: newPrice }
                                );
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio prezzo SSN:', error);
                              }
                            }
                            setEditingPrice(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                          className="w-20 px-2 py-1 text-right border-2 border-blue-400 rounded focus:outline-none focus:border-blue-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-blue-50 font-mono text-blue-700">
                          €{prezzoSSN}
                        </div>
                      )}
                    </td>
                    
                    {/* Prezzo Privato Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingPrice) {
                          setEditingPrice({ codice: p.codice, tipo: 'privato', value: prezzoPrivato.toString() });
                        }
                      }}
                    >
                      {editingPrice?.codice === p.codice && editingPrice.tipo === 'privato' ? (
                        <input
                          type="number"
                          step="1"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })}
                          onBlur={async () => {
                            const newPrice = parseInt(editingPrice.value);
                            if (!isNaN(newPrice)) {
                              try {
                                await updatePrezzoEcografiaRegionalizzato(
                                  tableRegion,
                                  p.codice,
                                  { prezzoPrivato: newPrice }
                                );
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio prezzo Privato:', error);
                              }
                            }
                            setEditingPrice(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                          className="w-20 px-2 py-1 text-right border-2 border-green-400 rounded focus:outline-none focus:border-green-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-green-50 font-mono text-green-700">
                          €{prezzoPrivato}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Vista Devices */}
      {activeView === 'devices' && mercatoEcografi && (
        <Card className="p-6">
          <TooltipProvider>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🔬 Mercato Dispositivi Ecografi
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Analisi del mercato globale dispositivi ecografici per categoria hardware.
                    Volumi da {mercatoEcografi.numeroEcografi?.length || 0} mercati regionali.
                  </p>
                </TooltipContent>
              </Tooltip>
            </h3>

            {/* Controlli: Anno + Toggle Regioni */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Selector Anno */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Anno:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(year => (
                    <option key={year} value={year}>📅 {year}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Regioni per Calcolo TAM */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Regioni nel TAM:</span>
                {['italia', 'europa', 'usa', 'cina'].map(regione => (
                  <label key={regione} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regioniAttive[regione as keyof typeof regioniAttive]}
                      onChange={() => setRegioniAttive(prev => ({ ...prev, [regione]: !prev[regione as keyof typeof regioniAttive] }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {regione === 'italia' && '🇮🇹 Italia'}
                      {regione === 'europa' && '🇪🇺 Europa'}
                      {regione === 'usa' && '🇺🇸 USA'}
                      {regione === 'cina' && '🇨🇳 Cina'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Metriche TAM/SAM/SOM Devices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {(() => {
                // Calcola TAM totale Devices dalle regioni attive
                const configEcografi = data?.configurazioneTamSamSom?.ecografi;
                const prezziMedi = configEcografi?.prezziMediDispositivi || { carrellati: 50000, portatili: 25000, palmari: 8000 };
                const yearKey = `unita${selectedYear}` as keyof typeof mercatoEcografi.numeroEcografi[0];
                
                let tamDevices = 0;
                
                ['carrellati', 'portatili', 'palmari'].forEach((categoriaId) => {
                  const tipologia = mercatoEcografi.tipologie?.find((t: any) => t.id === categoriaId);
                  if (!tipologia) return;
                  
                  const prezzoCategoria = categoriaId === 'carrellati' ? prezziMedi.carrellati :
                                         categoriaId === 'portatili' ? prezziMedi.portatili :
                                         prezziMedi.palmari;
                  
                  const volumeItalia = regioniAttive.italia ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Italia')?.[yearKey]) || 0) * (tipologia.quotaIT || 0)) : 0;
                  const volumeEuropa = regioniAttive.europa ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Europa')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
                  const volumeUSA = regioniAttive.usa ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Stati Uniti')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
                  const volumeCina = regioniAttive.cina ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Cina')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
                  
                  const volumeTotale = volumeItalia + volumeEuropa + volumeUSA + volumeCina;
                  tamDevices += volumeTotale * prezzoCategoria;
                });

                const samPercentageDevices = configEcografi?.samPercentage || 35;
                const somPercentagesDevices = configEcografi?.somPercentages || { y1: 0.5, y3: 2, y5: 5 };
                
                const samDevices = tamDevices * (samPercentageDevices / 100);
                const som1Devices = samDevices * (somPercentagesDevices.y1 / 100);
                const som3Devices = samDevices * (somPercentagesDevices.y3 / 100);
                const som5Devices = samDevices * (somPercentagesDevices.y5 / 100);

                return (
                  <>
                    {/* TAM Card */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">TAM Devices</p>
                              <p className="text-2xl font-bold text-blue-700">{formatCurrency(tamDevices)}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Anno {selectedYear} | {Object.values(regioniAttive).filter(Boolean).length} regioni
                              </p>
                            </div>
                            <Target className="h-8 w-8 text-blue-500" />
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          <strong>Total Addressable Market (Devices)</strong><br/>
                          Mercato totale dispositivi ecografi basato su volumi regionali × quote categoria × prezzi medi.
                          Regioni attive: {Object.entries(regioniAttive).filter(([_, v]) => v).map(([k]) => k).join(', ')}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* SAM Card */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">SAM Devices</p>
                              <p className="text-2xl font-bold text-green-700">{formatCurrency(samDevices)}</p>
                              <p className="text-xs text-gray-500 mt-1">{samPercentageDevices}% del TAM</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          <strong>Serviceable Addressable Market (Devices)</strong><br/>
                          Quota di mercato realisticamente raggiungibile. Attualmente {samPercentageDevices}% del TAM.
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* SOM Card */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">SOM Devices</p>
                              <div className="space-y-1 mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Y1:</span>
                                  <span className="text-sm font-semibold text-purple-700">{formatCurrency(som1Devices)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Y3:</span>
                                  <span className="text-sm font-semibold text-purple-700">{formatCurrency(som3Devices)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Y5:</span>
                                  <span className="text-lg font-bold text-purple-700">{formatCurrency(som5Devices)}</span>
                                </div>
                              </div>
                            </div>
                            <Zap className="h-8 w-8 text-purple-500" />
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          <strong>Serviceable Obtainable Market (Devices)</strong><br/>
                          Quota mercato dispositivi effettivamente raggiungibile nei primi 5 anni.
                          Y1: {somPercentagesDevices.y1}% | Y3: {somPercentagesDevices.y3}% | Y5: {somPercentagesDevices.y5}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                );
              })()}
            </div>

          {/* Tabella Categorie Hardware */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% Mercato</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-700">Prezzo Medio €</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Italia</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Europa</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. USA</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Cina</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">TAM Categoria</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calcola volumi totali per riga finale
                  let totalItalia = 0;
                  let totalEuropa = 0;
                  let totalUSA = 0;
                  let totalCina = 0;
                  let totalTAM = 0;

                  const rows = ['carrellati', 'portatili', 'palmari'].map((categoriaId) => {
                    const tipologia = mercatoEcografi.tipologie?.find((t: any) => t.id === categoriaId);
                    if (!tipologia) return null;

                    // Prezzi medi da configurazione
                    const configEcografi = data?.configurazioneTamSamSom?.ecografi;
                    const prezziMedi = configEcografi?.prezziMediDispositivi;
                    let prezzoMedio = 0;
                    if (prezziMedi) {
                      if (categoriaId === 'carrellati') prezzoMedio = prezziMedi.carrellati;
                      else if (categoriaId === 'portatili') prezzoMedio = prezziMedi.portatili;
                      else if (categoriaId === 'palmari') prezzoMedio = prezziMedi.palmari;
                    }

                    // Volumi per regione (anno selezionato) × quota categoria
                    const yearKey = `unita${selectedYear}` as keyof typeof mercatoEcografi.numeroEcografi[0];
                    const volumeItalia = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Italia')?.[yearKey]) || 0) * (tipologia.quotaIT || 0));
                    const volumeEuropa = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Europa')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));
                    const volumeUSA = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Stati Uniti')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));
                    const volumeCina = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Cina')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));

                    // TAM categoria = solo regioni attive × prezzo
                    const tamCategoria = (
                      (regioniAttive.italia ? volumeItalia : 0) +
                      (regioniAttive.europa ? volumeEuropa : 0) +
                      (regioniAttive.usa ? volumeUSA : 0) +
                      (regioniAttive.cina ? volumeCina : 0)
                    ) * prezzoMedio;

                    // Accumula totali
                    totalItalia += volumeItalia;
                    totalEuropa += volumeEuropa;
                    totalUSA += volumeUSA;
                    totalCina += volumeCina;
                    totalTAM += tamCategoria;

                    return (
                      <tr key={categoriaId} className="border-b border-gray-100 hover:bg-gray-50">
                        {/* Categoria */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tipologia.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{tipologia.nome}</div>
                              <div className="text-xs text-gray-500">{tipologia.note?.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>

                        {/* % Mercato */}
                        <td className="px-4 py-3 text-right">
                          <Badge variant="outline">
                            IT: {(tipologia.quotaIT * 100).toFixed(1)}%
                          </Badge>
                        </td>

                        {/* Prezzo Medio Editabile */}
                        <td 
                          className="px-4 py-3 text-right group cursor-pointer"
                          onClick={() => {
                            const nuovoPrezzo = prompt(`Nuovo prezzo per ${tipologia.nome}:`, prezzoMedio.toString());
                            if (nuovoPrezzo && !isNaN(Number(nuovoPrezzo))) {
                              updatePrezzoDispositivo(categoriaId as 'carrellati' | 'portatili' | 'palmari', Number(nuovoPrezzo));
                            }
                          }}
                        >
                          <div className="px-2 py-1 rounded hover:bg-indigo-50 font-mono text-indigo-700 font-bold transition-colors">
                            €{prezzoMedio.toLocaleString('it-IT')}
                            <span className="ml-1 text-xs opacity-0 group-hover:opacity-100">✏️</span>
                          </div>
                        </td>

                        {/* Volumi per regione */}
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.italia ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeItalia.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.europa ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeEuropa.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.usa ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeUSA.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.cina ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeCina.toLocaleString('it-IT')}
                        </td>

                        {/* TAM Categoria */}
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-green-600">{formatCurrency(tamCategoria)}</Badge>
                        </td>
                      </tr>
                    );
                  });

                  // Riga Totale
                  rows.push(
                    <tr key="totale" className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📊</span>
                          <span className="font-bold text-gray-900">TOTALE</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.italia ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalItalia.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.europa ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalEuropa.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.usa ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalUSA.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.cina ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalCina.toLocaleString('it-IT')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-green-700 text-lg">{formatCurrency(totalTAM)}</Badge>
                      </td>
                    </tr>
                  );

                  return rows;
                })()}
              </tbody>
            </table>
          </div>

          {/* Note Calcolo */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Calcolo TAM Devices:</strong> Per ogni categoria: (Vol. Italia + Vol. Europa + Vol. USA + Vol. Cina) × Prezzo Medio.
              Quote mercato: Italia usa quotaIT, altre regioni usano quotaGlobale.
            </p>
          </div>
          </TooltipProvider>
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
