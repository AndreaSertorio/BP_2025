'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, TrendingUp, Target, Monitor, RefreshCw } from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useDatabase } from '@/contexts/DatabaseProvider';

const COLORS = {
  palette: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']
};

export function MercatoEcografi() {
  const { data, loading, updateConfigurazioneEcografi, refreshData } = useDatabase();
  
  // UI states
  const [showProiezioni, setShowProiezioni] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [showGraficiItalia, setShowGraficiItalia] = useState(false);
  const [showGraficiQuote, setShowGraficiQuote] = useState(false);
  const [showGraficiGlobali, setShowGraficiGlobali] = useState(false);
  const [showGraficiNumero, setShowGraficiNumero] = useState(false);
  const [expandTo2035, setExpandTo2035] = useState(false);
  
  // Estrai dati dal database
  const mercatoEcografi = data.mercatoEcografi;
  const tipologie = mercatoEcografi?.tipologie || [];
  const numeroEcografi = mercatoEcografi?.numeroEcografi || [];
  const valoreMercato = mercatoEcografi?.valoreMercato || [];
  const proiezioniItalia = mercatoEcografi?.proiezioniItalia || [];
  const proiezioniQuote = mercatoEcografi?.quoteTipologie || [];
  const parcoIT = mercatoEcografi?.parcoIT || [];
  const configurazione = mercatoEcografi?.configurazione || {
    annoTarget: 2030,
    marketShare: 1.0,
    scenarioParco: 'centrale' as const,
    regioniVisibili: ['Italia', 'Europa', 'Stati Uniti', 'Cina'],
    tipologieTarget: ['Palmari']
  };
  
  // Stati locali derivati dalla configurazione
  const annoTarget = configurazione.annoTarget;
  const marketShare = configurazione.marketShare;
  const scenarioParco = configurazione.scenarioParco;
  const regioniVisibili = new Set(configurazione.regioniVisibili);
  const tipologieTarget = new Set(configurazione.tipologieTarget);

  // Handler per aggiornare configurazione
  const handleSetAnnoTarget = (anno: number) => {
    updateConfigurazioneEcografi({ annoTarget: anno });
  };

  const handleSetMarketShare = (share: number) => {
    updateConfigurazioneEcografi({ marketShare: share });
  };

  const handleSetScenarioParco = (scenario: 'basso' | 'centrale' | 'alto') => {
    updateConfigurazioneEcografi({ scenarioParco: scenario });
  };

  const handleToggleRegione = (regione: string) => {
    const newRegioni = new Set(configurazione.regioniVisibili);
    if (newRegioni.has(regione)) {
      newRegioni.delete(regione);
    } else {
      newRegioni.add(regione);
    }
    updateConfigurazioneEcografi({ regioniVisibili: Array.from(newRegioni) });
  };

  const handleToggleTipologiaTarget = (nome: string) => {
    const newTipologie = new Set(configurazione.tipologieTarget);
    if (newTipologie.has(nome)) {
      newTipologie.delete(nome);
    } else {
      newTipologie.add(nome);
    }
    updateConfigurazioneEcografi({ tipologieTarget: Array.from(newTipologie) });
  };

  // ✅ Dati caricati direttamente da database.json tramite DatabaseProvider
  // Calcoli e visualizzazioni basate su dati già sincronizzati

  const chartData = useMemo(() => {
    // Solo le 3 tipologie principali per i grafici
    const principali = tipologie.filter(t => ['Carrellati', 'Portatili', 'Palmari'].includes(t.nome));
    
    const pieData = principali.filter(t => t.quotaGlobale > 0).map(t => ({ 
      name: t.nome, 
      value: t.quotaGlobale * 100 
    }));
    
    const barData = principali.filter(t => t.valoreGlobale > 0).map(t => ({ 
      name: t.nome, 
      Globale: t.valoreGlobale, 
      Italia: t.valoreIT 
    }));
    
    // Mercato globale 2023: ~9.800 M$ (somma Carrellati + Portatili + Palmari)
    const totaleGlobale = principali.reduce((sum, t) => sum + (t.valoreGlobale || 0), 0);
    
    // CALCOLO TARGET ECO 3D DINAMICO
    // Trova i dati per l'anno selezionato
    const datiAnno = proiezioniItalia.find(p => p.anno === annoTarget);
    const quoteAnno = proiezioniQuote.find(q => q.anno === annoTarget);
    
    let targetValue = 0;
    if (datiAnno && quoteAnno) {
      const mercatoTotale = datiAnno.media;
      if (tipologieTarget.has('Carrellati')) {
        targetValue += mercatoTotale * (quoteAnno.carrellati / 100);
      }
      if (tipologieTarget.has('Portatili')) {
        targetValue += mercatoTotale * (quoteAnno.portatili / 100);
      }
      if (tipologieTarget.has('Palmari')) {
        targetValue += mercatoTotale * (quoteAnno.palmari / 100);
      }
    }
    
    // Italia totale per l'anno selezionato
    const totaleItalia = datiAnno?.media || 339;
    
    return { pieData, barData, totaleGlobale, targetValue, totaleItalia };
  }, [tipologie, annoTarget, tipologieTarget, proiezioniItalia, proiezioniQuote]);

  const fmt = (n: number) => new Intl.NumberFormat('it-IT').format(n);

  // Loading gestito da DatabaseProvider
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-600">Caricamento dati mercato ecografi...</p>
      </div>
    );
  }

  if (!mercatoEcografi || !chartData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏥 Mercato Ecografi - Italia & Globale
          </h1>
          <p className="text-gray-600 mt-2">
            Analisi mercato dispositivi ecografici per tipologia, applicazioni cliniche e trend tecnologici
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Ricarica
        </Button>
      </div>

      {/* Summary Cards - Dinamici */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Mercato Globale (anno dinamico) */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-3 w-3 text-blue-700" />
            <h3 className="text-xs font-semibold text-blue-800">Mercato Globale</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {(() => {
              const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
              const mercato = valoreMercato.find(v => v.mercato === 'Mondo (globale)');
              const valore = annoData === 2025 ? mercato?.valore2025 : mercato?.valore2030;
              return valore ? `${(valore / 1000).toFixed(1)} B$` : '-';
            })()}
          </p>
          <p className="text-xs text-blue-600">{annoTarget <= 2025 ? '2025' : annoTarget <= 2030 ? '2030' : '2030'}</p>
        </Card>

        {/* Card 2: Mercato Italia (anno dinamico) */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="h-3 w-3 text-green-700" />
            <h3 className="text-xs font-semibold text-green-800">Mercato Italia</h3>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {(() => {
              const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
              const mercato = valoreMercato.find(v => v.mercato === 'Italia');
              const valore = annoData === 2025 ? mercato?.valore2025 : mercato?.valore2030;
              return valore ? `${valore.toFixed(1)} M$` : '-';
            })()}
          </p>
          <p className="text-xs text-green-600">
            {annoTarget <= 2025 ? '2025' : annoTarget <= 2030 ? '2030' : '2030'} • CAGR {valoreMercato.find(v => v.mercato === 'Italia')?.cagr.toFixed(1)}%
          </p>
        </Card>

        {/* Card 3: Unità Target Regioni Selezionate */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3 text-purple-700" />
            <h3 className="text-xs font-semibold text-purple-800">Unità Target</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {(() => {
              const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
              const selezionate = numeroEcografi.filter(row => regioniVisibili.has(row.mercato));
              const totale = selezionate.reduce((sum, r) => {
                const unita = annoData === 2025 ? r.unita2025 : r.unita2030;
                return sum + unita;
              }, 0);
              const target = Math.round(totale * marketShare / 100);
              return target.toLocaleString();
            })()}
          </p>
          <p className="text-xs text-purple-600">
            {marketShare}% × {regioniVisibili.size} region{regioniVisibili.size > 1 ? 'i' : 'e'}
          </p>
        </Card>

        {/* Card 4: Target Eco 3D (ultimo a destra) */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 ring-2 ring-orange-400">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3 w-3 text-orange-700" />
            <h3 className="text-xs font-semibold text-orange-800">🎯 Target Eco 3D</h3>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {(() => {
              const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
              const selezionate = numeroEcografi.filter(row => regioniVisibili.has(row.mercato));
              const totale = selezionate.reduce((sum, r) => {
                const unita = annoData === 2025 ? r.unita2025 : r.unita2030;
                return sum + unita;
              }, 0);
              const targetUnita = Math.round(totale * marketShare / 100);
              return targetUnita.toLocaleString();
            })()} unità
          </p>
          <p className="text-xs text-orange-600 mb-2">{annoTarget <= 2025 ? '2025' : annoTarget <= 2030 ? '2030' : '2030'}</p>
          
          <div className="space-y-1.5">
            <select 
              value={annoTarget} 
              onChange={(e) => handleSetAnnoTarget(Number(e.target.value))}
              className="w-full text-xs p-1 border border-orange-300 rounded bg-white font-semibold"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(anno => (
                <option key={anno} value={anno}>{anno}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandTo2035(!expandTo2035)}
              className="w-full text-xs"
            >
              {expandTo2035 ? '📊 Mostra fino 2030' : '📈 Espandi fino 2035'}
            </Button>
          </div>
        </Card>
      </div>

      {/* ========== TABELLA PRINCIPALE: NUMERO ECOGRAFI VENDUTI PER REGIONE ========== */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-purple-900">
              🎯 Numero Ecografi Venduti per Regione
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Unità vendute annualmente - Base per strategia di penetrazione mercato
            </p>
          </div>
        </div>

        {/* Controlli: Visibilità Regioni e Market Share */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white rounded-lg border border-purple-200">
          {/* Selezione Regioni */}
          <div>
            <label className="block text-sm font-semibold text-purple-800 mb-2">
              🌍 Regioni Visibili:
            </label>
            <div className="space-y-1">
              {numeroEcografi.filter(({mercato}) => mercato !== 'Mondo (globale)').map(({mercato}) => (
                <label key={mercato} className="flex items-center text-sm cursor-pointer hover:bg-purple-50 p-1 rounded">
                  <input 
                    type="checkbox" 
                    checked={regioniVisibili.has(mercato)}
                    onChange={() => handleToggleRegione(mercato)}
                    className="mr-2"
                  />
                  <span className={mercato === 'Italia' ? 'font-bold text-green-700' : ''}>
                    {mercato}
                  </span>
                </label>
              ))}
              <p className="text-xs text-gray-500 italic mt-2">
                💡 &quot;Mondo (globale)&quot; mostrato sempre come riferimento totale
              </p>
            </div>
          </div>

          {/* Market Share Calculator */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-300">
            <label className="block text-sm font-bold text-orange-900 mb-2">
              🎯 Market Share Target (%):
            </label>
            <input 
              type="number"
              value={marketShare}
              onChange={(e) => handleSetMarketShare(Math.max(0, Math.min(100, Number(e.target.value))))}
              min="0"
              max="100"
              step="0.1"
              className="w-full p-2 border border-orange-300 rounded text-lg font-bold text-center"
            />
            <p className="text-xs text-gray-600 mt-2">
              Percentuale di mercato da conquistare (0-100%)
            </p>
          </div>
        </div>

        {/* Tabella Numero Ecografi - Dinamica con espansione */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-200 to-pink-200 border-b-2 border-purple-400">
                <th className="text-center p-3 font-bold border-r-2 border-white sticky left-0 bg-purple-200 z-10">Regione</th>
                {(expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030]
                ).map((anno, idx) => (
                  <th key={anno} className={`text-right p-3 font-bold border-r border-white ${
                    idx % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    Unità {anno}
                  </th>
                ))}
                <th className="text-right p-3 font-bold bg-yellow-100 border-r-2 border-white">Crescita (%)</th>
              </tr>
            </thead>
            <tbody>
              {/* Regioni selezionabili */}
              {numeroEcografi.filter(row => row.mercato !== 'Mondo (globale)' && regioniVisibili.has(row.mercato)).map((row) => {
                const anni = expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030];
                const primoAnno = anni[0];
                const ultimoAnno = anni[anni.length - 1];
                const valPrimo = (row[`unita${primoAnno}` as keyof typeof row] as number) || 0;
                const valUltimo = (row[`unita${ultimoAnno}` as keyof typeof row] as number) || 0;
                const crescita = valPrimo > 0 ? ((valUltimo - valPrimo) / valPrimo * 100) : 0;
                const isItalia = row.mercato === 'Italia';
                
                return (
                  <tr 
                    key={row.mercato}
                    className={`border-b hover:bg-purple-50 transition-colors ${
                      isItalia ? 'bg-green-50 font-bold' : ''
                    }`}
                  >
                    <td className="p-3 text-center font-semibold border-r-2 border-gray-200 sticky left-0 bg-white z-10">
                      {isItalia && '🇮🇹 '}
                      {row.mercato === 'Europa' && '🇪🇺 '}
                      {row.mercato === 'Stati Uniti' && '🇺🇸 '}
                      {row.mercato === 'Cina' && '🇨🇳 '}
                      {row.mercato}
                    </td>
                    {anni.map((anno, idx) => (
                      <td key={anno} className={`p-3 text-right ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}`}>
                        {(row[`unita${anno}` as keyof typeof row] as number)?.toLocaleString() || '-'}
                      </td>
                    ))}
                    <td className="p-3 text-right bg-yellow-50">
                      <Badge variant={crescita > 20 ? 'default' : 'outline'}>
                        +{crescita.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              
              {/* Separatore */}
              <tr className="bg-gray-200 border-t-2 border-gray-400">
                <td colSpan={expandTo2035 ? 13 : 4} className="p-1"></td>
              </tr>
              
              {/* Mondo (globale) - Riga di riferimento */}
              {numeroEcografi.filter(row => row.mercato === 'Mondo (globale)').map((row) => {
                const anni = expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030];
                const primoAnno = anni[0];
                const ultimoAnno = anni[anni.length - 1];
                const valPrimo = (row[`unita${primoAnno}` as keyof typeof row] as number) || 0;
                const valUltimo = (row[`unita${ultimoAnno}` as keyof typeof row] as number) || 0;
                const crescita = valPrimo > 0 ? ((valUltimo - valPrimo) / valPrimo * 100) : 0;
                
                return (
                  <tr 
                    key={row.mercato}
                    className="bg-gradient-to-r from-gray-100 to-slate-100 border-t-2 border-gray-400 font-semibold"
                  >
                    <td className="p-3 text-center font-bold border-r-2 border-gray-300 sticky left-0 bg-gray-100 z-10">
                      🌍 {row.mercato}
                      <div className="text-xs text-gray-600 font-normal">Riferimento totale</div>
                    </td>
                    {anni.map((anno, idx) => (
                      <td key={anno} className={`p-3 text-right ${idx % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {(row[`unita${anno}` as keyof typeof row] as number)?.toLocaleString() || '-'}
                      </td>
                    ))}
                    <td className="p-3 text-right bg-yellow-100">
                      <Badge variant="outline">
                        +{crescita.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totali per Regioni Selezionate */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
          <h4 className="font-bold text-purple-900 mb-2">📊 Totali Regioni Selezionate:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const selezionate = numeroEcografi.filter(row => regioniVisibili.has(row.mercato));
              const tot2025 = selezionate.reduce((sum, r) => sum + r.unita2025, 0);
              const tot2030 = selezionate.reduce((sum, r) => sum + r.unita2030, 0);
              const target2025 = Math.round(tot2025 * marketShare / 100);
              const target2030 = Math.round(tot2030 * marketShare / 100);
              
              return (
                <>
                  <div className="bg-white p-3 rounded shadow">
                    <p className="text-xs text-gray-600">Totale 2025</p>
                    <p className="text-lg font-bold text-blue-700">{tot2025.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <p className="text-xs text-gray-600">Totale 2030</p>
                    <p className="text-lg font-bold text-green-700">{tot2030.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <p className="text-xs text-gray-600">Target 2025 ({marketShare}%)</p>
                    <p className="text-lg font-bold text-orange-700">{target2025.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <p className="text-xs text-gray-600">Target 2030 ({marketShare}%)</p>
                    <p className="text-lg font-bold text-red-700">{target2030.toLocaleString()}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 italic">
          💡 Modifica il Market Share % per calcolare obiettivi di penetrazione. Seleziona/deseleziona regioni per personalizzare l&apos;analisi.
        </p>
      </Card>

      {/* Grafici Numero Ecografi */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📊 Grafici Analitici - Numero Ecografi per Regione
          </h3>
          <Button 
            onClick={() => setShowGraficiNumero(!showGraficiNumero)}
            variant={showGraficiNumero ? "outline" : "default"}
            size="sm"
            className={showGraficiNumero ? "" : "bg-purple-600 hover:bg-purple-700"}
          >
            {showGraficiNumero ? '✕ Nascondi Grafici' : '📊 Mostra Grafici'}
          </Button>
        </div>
      </Card>
      
      {showGraficiNumero && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico 1: Confronto Unità 2025 vs 2030 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Unità Vendute: 2025 vs 2030
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={numeroEcografi.filter(row => regioniVisibili.has(row.mercato))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mercato" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="unita2025" fill="#3b82f6" name="2025" />
              <Bar dataKey="unita2030" fill="#10b981" name="2030" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Solo regioni selezionate - Crescita media: 23.5%
          </p>
        </Card>

        {/* Grafico 2: Target con Market Share */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🎯 Obiettivi con Market Share {marketShare}%
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={numeroEcografi.filter(row => regioniVisibili.has(row.mercato)).map(row => ({
              mercato: row.mercato,
              target2025: Math.round(row.unita2025 * marketShare / 100),
              target2030: Math.round(row.unita2030 * marketShare / 100)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mercato" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="target2025" fill="#f59e0b" name="Target 2025" />
              <Bar dataKey="target2030" fill="#ef4444" name="Target 2030" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Obiettivi calcolati con {marketShare}% di penetrazione
          </p>
        </Card>

        {/* Grafico 3: Crescita Percentuale per Regione */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📈 Crescita Percentuale 2025-2030
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={numeroEcografi.filter(row => regioniVisibili.has(row.mercato)).map(row => ({
              mercato: row.mercato,
              crescita: ((row.unita2030 - row.unita2025) / row.unita2025 * 100)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mercato" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="crescita" fill="#8b5cf6" name="Crescita %" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Europa leader con +32.4% di crescita
          </p>
        </Card>

        {/* Grafico 4: CAGR Confronto Regioni */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 CAGR per Regione (2025-2030)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valoreMercato.filter(row => regioniVisibili.has(row.mercato)).map(row => ({
              mercato: row.mercato,
              cagr: row.cagr
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mercato" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="cagr" fill="#8b5cf6" name="CAGR %" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Tasso di crescita annuale composto - Confronto tra regioni selezionate
          </p>
        </Card>
      </div>
      )}

      {/* Tabella Proiezioni Italia */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📈 Proiezioni Mercato Italia 2024-{showProiezioni ? '2035' : '2030'}
          </h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowProviders(!showProviders)}
              variant="outline"
              size="sm"
            >
              {showProviders ? 'Nascondi provider' : 'Mostra provider'}
            </Button>
            <Button 
              onClick={() => setShowProiezioni(!showProiezioni)}
              variant="outline"
              size="sm"
            >
              {showProiezioni ? 'Nascondi 2031-35' : 'Mostra 2031-35'}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b-2 border-indigo-300">
                <th className="text-center p-2 font-semibold border-r-2 border-white">Anno</th>
                {showProviders && (
                  <>
                    <th className="text-right p-2 font-semibold bg-pink-100 border-r border-white text-xs">Mordor</th>
                    <th className="text-right p-2 font-semibold bg-purple-100 border-r border-white text-xs">R&amp;M</th>
                    <th className="text-right p-2 font-semibold bg-blue-100 border-r border-white text-xs">GVR</th>
                    <th className="text-right p-2 font-semibold bg-green-100 border-r-2 border-white text-xs">Cognitive</th>
                  </>
                )}
                <th className="text-right p-2 font-semibold bg-amber-100 border-r border-white">Media</th>
                <th className="text-right p-2 font-semibold bg-orange-100">Mediana</th>
              </tr>
            </thead>
            <tbody>
              {proiezioniItalia.slice(0, showProiezioni ? undefined : 7).map((row) => {
                const is2030 = row.anno === 2030;
                const isProiezione = row.anno > 2030;
                return (
                  <tr 
                    key={row.anno}
                    className={`border-b hover:bg-white/50 transition-colors ${
                      is2030 ? 'border-b-2 border-indigo-300 bg-gradient-to-r from-green-100 to-emerald-100' :
                      isProiezione ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className={`p-2 text-center ${is2030 ? 'font-bold' : 'font-semibold'} border-r-2 border-gray-200 text-xs`}>
                      {row.anno}{isProiezione && ' *'}
                    </td>
                    {showProviders && (
                      <>
                        <td className={`p-2 text-right bg-pink-50 border-r border-gray-100 text-xs ${isProiezione && 'italic'}`}>
                          {row.mordor ? row.mordor.toFixed(1) : '-'}
                        </td>
                        <td className={`p-2 text-right bg-purple-50 border-r border-gray-100 text-xs ${isProiezione && 'italic'}`}>
                          {row.research ? row.research.toFixed(1) : '-'}
                        </td>
                        <td className={`p-2 text-right bg-blue-50 border-r border-gray-100 text-xs ${isProiezione && 'italic'}`}>
                          {row.grandview ? row.grandview.toFixed(1) : '-'}
                        </td>
                        <td className={`p-2 text-right bg-green-50 border-r-2 border-gray-200 text-xs ${isProiezione && 'italic'}`}>
                          {row.cognitive ? row.cognitive.toFixed(1) : '-'}
                        </td>
                      </>
                    )}
                    <td className={`p-2 text-right bg-amber-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold' : 'font-semibold'} border-r border-gray-100 text-xs`}>
                      {row.media ? row.media.toFixed(1) : '-'}
                    </td>
                    <td className={`p-2 text-right bg-orange-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold' : 'font-semibold'} text-xs`}>
                      {row.mediana ? row.mediana.toFixed(1) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showProiezioni && (
          <p className="text-xs text-gray-600 mt-3 italic">
            * Proiezioni 2031-2035 calcolate con CAGR 4.11% (non basate su dati provider)
          </p>
        )}
        <p className="text-xs text-gray-600 mt-3 flex items-center gap-2">
          <strong>CAGR 2024-2030: 4.11%</strong> (crescita annua composta media tra provider)
        </p>
      </Card>

      {/* Grafici Proiezioni Italia */}
      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📊 Grafici Analitici - Proiezioni Mercato Italia
          </h3>
          <Button 
            onClick={() => setShowGraficiItalia(!showGraficiItalia)}
            variant={showGraficiItalia ? "outline" : "default"}
            size="sm"
            className={showGraficiItalia ? "" : "bg-indigo-600 hover:bg-indigo-700"}
          >
            {showGraficiItalia ? '✕ Nascondi Grafici' : '📊 Mostra Grafici'}
          </Button>
        </div>
      </Card>
      
      {showGraficiItalia && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico 1: Trend Temporale con Confronto Provider */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📈 Trend Mercato Italia per Provider
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniItalia.slice(0, showProiezioni ? undefined : 7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} M$`} />
              <Legend />
              {showProviders && (
                <>
                  <Bar dataKey="mordor" fill="#ec4899" name="Mordor" />
                  <Bar dataKey="research" fill="#a855f7" name="R&M" />
                  <Bar dataKey="grandview" fill="#3b82f6" name="GVR" />
                  <Bar dataKey="cognitive" fill="#10b981" name="Cognitive" />
                </>
              )}
              <Bar dataKey="media" fill="#f59e0b" name="Media" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            {showProviders ? 'Confronto tra stime dei provider' : 'Mostra provider per vedere il confronto'}
          </p>
        </Card>

        {/* Grafico 2: Evoluzione Media vs Mediana */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Media vs Mediana nel Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniItalia.slice(0, showProiezioni ? undefined : 7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} M$`} />
              <Legend />
              <Bar dataKey="media" fill="#f59e0b" name="Media" />
              <Bar dataKey="mediana" fill="#ef4444" name="Mediana" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Divergenza media-mediana indica variabilità tra provider
          </p>
        </Card>

        {/* Grafico 3: Crescita Anno su Anno */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📈 Crescita Anno su Anno (YoY %)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniItalia.slice(1, showProiezioni ? undefined : 7).map((row, idx) => {
              const prev = proiezioniItalia[idx];
              return {
                anno: row.anno,
                crescita: prev.media ? ((row.media - prev.media) / prev.media * 100) : 0
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="crescita" fill="#10b981" name="YoY %" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Target: CAGR 4.11% annuo costante
          </p>
        </Card>

        {/* Grafico 4: Dispersione Provider (Range) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Range Stime Provider
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniItalia.slice(0, showProiezioni ? undefined : 7).map(row => {
              const values = [row.mordor, row.research, row.grandview, row.cognitive].filter(v => v > 0);
              const min = Math.min(...values);
              const max = Math.max(...values);
              return {
                anno: row.anno,
                range: max - min,
                min,
                max
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'range') return `${value.toFixed(1)} M$`;
                  return `${value.toFixed(1)} M$`;
                }}
              />
              <Legend />
              <Bar dataKey="range" fill="#8b5cf6" name="Differenza Max-Min" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Maggiore range = maggiore incertezza nelle stime
          </p>
        </Card>
      </div>
      )}

      {/* Tabella Quote Tipologie Italia */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📊 Quote per Tipologia - Italia (2026-{showProiezioni ? '2035' : '2030'})
            </h3>
            <p className="text-sm text-gray-600 mt-1">Quote di mercato e numero dispositivi totali</p>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-semibold text-gray-700">Scenario Parco:</label>
            <select 
              value={scenarioParco}
              onChange={(e) => handleSetScenarioParco(e.target.value as 'basso' | 'centrale' | 'alto')}
              className="p-2 border border-green-300 rounded bg-white text-sm font-semibold"
            >
              <option value="basso">Basso (dism. 8%)</option>
              <option value="centrale">Centrale (dism. 7%)</option>
              <option value="alto">Alto (dism. 6%)</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 via-green-100 to-orange-100 border-b-2 border-gray-300">
                <th className="text-center p-3 font-semibold border-r-2 border-white" rowSpan={2}>Anno</th>
                <th className="text-center p-3 font-semibold bg-purple-100 border-r-2 border-white" rowSpan={2}>
                  Parco Totale<br/>Dispositivi
                </th>
                <th colSpan={3} className="text-center p-2 font-bold bg-gray-200 border-b border-white">
                  Quote di Mercato (%)
                </th>
              </tr>
              <tr className="bg-gradient-to-r from-blue-100 via-green-100 to-orange-100 border-b-2 border-gray-300">
                <th className="text-right p-2 font-semibold bg-blue-100 border-r border-white text-xs">
                  Carrellati
                  {tipologieTarget.has('Carrellati') && ' 🎯'}
                </th>
                <th className="text-right p-2 font-semibold bg-green-100 border-r border-white text-xs">
                  Portatili
                  {tipologieTarget.has('Portatili') && ' 🎯'}
                </th>
                <th className="text-right p-2 font-semibold bg-orange-100 text-xs">
                  Palmari
                  {tipologieTarget.has('Palmari') && ' 🎯'}
                </th>
              </tr>
            </thead>
            <tbody>
              {proiezioniQuote.slice(0, showProiezioni ? undefined : 5).map((row) => {
                const is2030 = row.anno === 2030;
                const isProiezione = row.anno > 2030;
                const datiAnno = proiezioniItalia.find(p => p.anno === row.anno);
                const mercatoTotale = datiAnno?.media || 0;
                
                // Trova parco IT per l'anno
                const parcoAnno = parcoIT.find(p => p.anno === row.anno);
                const parcoDispositivi = parcoAnno ? parcoAnno[scenarioParco] : 0;
                
                return (
                  <tr 
                    key={row.anno}
                    className={`border-b hover:bg-white/50 transition-colors ${
                      is2030 ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-300' :
                      isProiezione ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className={`p-3 text-center ${is2030 ? 'font-bold text-lg' : 'font-semibold'} border-r-2 border-gray-200`}>
                      {row.anno}{isProiezione && ' *'}
                    </td>
                    <td className={`p-3 text-center bg-purple-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold text-lg' : 'font-semibold'} border-r-2 border-gray-200`}>
                      {parcoDispositivi > 0 ? parcoDispositivi.toLocaleString() : '-'}
                    </td>
                    <td className={`p-2 text-right bg-blue-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold' : ''} border-r border-gray-100`}>
                      <div className="text-sm">{row.carrellati.toFixed(2)}%</div>
                      <div className="text-xs text-gray-600">{(mercatoTotale * row.carrellati / 100).toFixed(1)} M$</div>
                    </td>
                    <td className={`p-2 text-right bg-green-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold' : ''} border-r border-gray-100`}>
                      <div className="text-sm">{row.portatili.toFixed(2)}%</div>
                      <div className="text-xs text-gray-600">{(mercatoTotale * row.portatili / 100).toFixed(1)} M$</div>
                    </td>
                    <td className={`p-2 text-right bg-orange-${is2030 ? '100' : '50'} ${is2030 ? 'font-bold' : ''}`}>
                      <div className="text-sm">{row.palmari.toFixed(2)}%</div>
                      <div className="text-xs text-gray-600">{(mercatoTotale * row.palmari / 100).toFixed(1)} M$</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showProiezioni && (
          <p className="text-xs text-gray-600 mt-3 italic">
            * Proiezioni 2031-2035: Carrellati -0.2%/anno, Portatili +0.05%/anno, Palmari +0.15%/anno
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          💡 Usa i checkbox nel card &quot;Target Eco 3D&quot; per selezionare le tipologie di interesse
        </p>
      </Card>

      {/* Grafici Quote Tipologie */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📊 Grafici Analitici - Quote per Tipologia
          </h3>
          <Button 
            onClick={() => setShowGraficiQuote(!showGraficiQuote)}
            variant={showGraficiQuote ? "outline" : "default"}
            size="sm"
            className={showGraficiQuote ? "" : "bg-green-600 hover:bg-green-700"}
          >
            {showGraficiQuote ? '✕ Nascondi Grafici' : '📊 Mostra Grafici'}
          </Button>
        </div>
      </Card>
      
      {showGraficiQuote && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico 1: Evoluzione Quote nel Tempo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Evoluzione Quote per Tipologia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniQuote.slice(0, showProiezioni ? undefined : 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="carrellati" fill="#3b82f6" name="Carrellati" stackId="a" />
              <Bar dataKey="portatili" fill="#10b981" name="Portatili" stackId="a" />
              <Bar dataKey="palmari" fill="#f59e0b" name="Palmari" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Stack al 100%: evoluzione delle quote di mercato
          </p>
        </Card>

        {/* Grafico 2: Trend Singole Tipologie */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📈 Trend Quote Individuali
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniQuote.slice(0, showProiezioni ? undefined : 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="carrellati" fill="#3b82f6" name="Carrellati %" />
              <Bar dataKey="portatili" fill="#10b981" name="Portatili %" />
              <Bar dataKey="palmari" fill="#f59e0b" name="Palmari %" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Palmari in crescita: da 5.28% (2026) a {showProiezioni ? '6.63% (2035)' : '5.88% (2030)'}
          </p>
        </Card>

        {/* Grafico 3: Valori Assoluti per Tipologia */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💰 Valori Assoluti per Tipologia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniQuote.slice(0, showProiezioni ? undefined : 5).map(row => {
              const datiAnno = proiezioniItalia.find(p => p.anno === row.anno);
              const mercato = datiAnno?.media || 0;
              return {
                anno: row.anno,
                carrellati: mercato * row.carrellati / 100,
                portatili: mercato * row.portatili / 100,
                palmari: mercato * row.palmari / 100
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} M$`} />
              <Legend />
              <Bar dataKey="carrellati" fill="#3b82f6" name="Carrellati M$" stackId="a" />
              <Bar dataKey="portatili" fill="#10b981" name="Portatili M$" stackId="a" />
              <Bar dataKey="palmari" fill="#f59e0b" name="Palmari M$" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Valori in milioni di $ per tipologia
          </p>
        </Card>

        {/* Grafico 4: Crescita Palmari vs Altri */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🎯 Focus Crescita Palmari (Target Eco 3D)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proiezioniQuote.slice(1, showProiezioni ? undefined : 5).map((row, idx) => {
              const prev = proiezioniQuote[idx];
              return {
                anno: row.anno,
                palmariDelta: row.palmari - prev.palmari,
                carrellatiDelta: row.carrellati - prev.carrellati,
                portatiliDelta: row.portatili - prev.portatili
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anno" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="palmariDelta" fill="#f59e0b" name="Palmari Δ%" />
              <Bar dataKey="portatiliDelta" fill="#10b981" name="Portatili Δ%" />
              <Bar dataKey="carrellatiDelta" fill="#3b82f6" name="Carrellati Δ%" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Variazione punti percentuali anno su anno
          </p>
        </Card>
      </div>
      )}

      {/* Grafici Globali */}
      <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🌍 Grafici Analitici - Confronto Globale
          </h3>
          <Button 
            onClick={() => setShowGraficiGlobali(!showGraficiGlobali)}
            variant={showGraficiGlobali ? "outline" : "default"}
            size="sm"
            className={showGraficiGlobali ? "" : "bg-slate-600 hover:bg-slate-700"}
          >
            {showGraficiGlobali ? '✕ Nascondi Grafici' : '📊 Mostra Grafici'}
          </Button>
        </div>
      </Card>
      
      {showGraficiGlobali && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Quote di Mercato Globale per Tipologia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={chartData.pieData} 
                cx="50%" 
                cy="50%" 
                label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`} 
                outerRadius={100} 
                dataKey="value"
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.palette[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Valori di Mercato (M$)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 11 }} 
              />
              <YAxis />
              <Tooltip formatter={(value: number) => `${fmt(value)} M$`} />
              <Legend />
              <Bar dataKey="Globale" fill="#3b82f6" name="Mercato Globale" />
              <Bar dataKey="Italia" fill="#ef4444" name="Mercato Italia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      )}

      {/* Tabella Valori di Mercato per Regione */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">🌍 Valori di Mercato per Regione</h3>
            <p className="text-sm text-gray-600 mt-1">Dati 2025 e proiezioni 2030 con CAGR</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mr-2">Filtra Regioni:</label>
            <Button 
              onClick={() => updateConfigurazioneEcografi({ regioniVisibili: valoreMercato.filter(v => v.mercato !== 'Mondo (globale)').map(v => v.mercato) })}
              variant="outline"
              size="sm"
              className="mr-2"
            >
              Tutte
            </Button>
            <Button 
              onClick={() => updateConfigurazioneEcografi({ regioniVisibili: ['Italia'] })}
              variant="outline"
              size="sm"
            >
              Solo Italia
            </Button>
          </div>
        </div>
        {/* Checkboxes Visibilità Regioni */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 Regioni Visibili:</label>
          <div className="flex flex-wrap gap-3">
            {valoreMercato.filter(({mercato}) => mercato !== 'Mondo (globale)').map(({mercato}) => (
              <label key={mercato} className="flex items-center text-sm cursor-pointer hover:bg-slate-50 p-2 rounded">
                <input 
                  type="checkbox" 
                  checked={regioniVisibili.has(mercato)}
                  onChange={() => handleToggleRegione(mercato)}
                  className="mr-2"
                />
                <span className={mercato === 'Italia' ? 'font-bold text-green-700' : ''}>
                  {mercato === 'Italia' && '🇮🇹 '}
                  {mercato === 'Europa' && '🇪🇺 '}
                  {mercato === 'Stati Uniti' && '🇺🇸 '}
                  {mercato === 'Cina' && '🇨🇳 '}
                  {mercato}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic mt-2">
            💡 &quot;Mondo (globale)&quot; rappresenta il totale mondiale ed è sempre visualizzato separatamente
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-200 to-gray-200 border-b-2 border-gray-400">
                <th className="p-3 text-center border-r-2 border-white sticky left-0 bg-slate-200 z-10">Regione</th>
                {(expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030]
                ).map((anno, idx) => (
                  <th key={anno} className={`text-right p-3 border-r border-white ${
                    idx % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    Valore {anno}<br/>(M$)
                  </th>
                ))}
                <th className="text-center p-3 bg-purple-100">CAGR<br/>(%)</th>
              </tr>
            </thead>
            <tbody>
              {/* Regioni selezionabili */}
              {valoreMercato.filter(row => row.mercato !== 'Mondo (globale)' && regioniVisibili.has(row.mercato)).map((row: any) => {
                const anni = expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030];
                const isItalia = row.mercato === 'Italia';
                
                return (
                  <tr 
                    key={row.mercato}
                    className={`border-b hover:bg-slate-50 transition-colors ${
                      isItalia ? 'bg-green-50 font-bold' : ''
                    }`}
                  >
                    <td className="p-3 text-center font-semibold border-r-2 border-gray-200 sticky left-0 bg-white z-10">
                      {isItalia && '🇮🇹 '}
                      {row.mercato === 'Europa' && '🇪🇺 '}
                      {row.mercato === 'Stati Uniti' && '🇺🇸 '}
                      {row.mercato === 'Cina' && '🇨🇳 '}
                      {row.mercato}
                    </td>
                    {anni.map((anno, idx) => {
                      const valore = row[`valore${anno}`];
                      return (
                        <td key={anno} className={`p-3 text-right border-r border-gray-100 ${
                          idx % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'
                        }`}>
                          <strong>{valore ? valore.toFixed(1) : '-'}</strong>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-purple-50">
                      <Badge variant="outline" className="font-semibold">
                        {row.cagr.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Totale Selezionate (escluso Mondo) */}
              {regioniVisibili.size > 1 && (
                <tr className="bg-gradient-to-r from-slate-200 to-gray-200 border-t-2 border-gray-400 font-bold">
                  <td className="p-3 text-center border-r-2 border-white sticky left-0 bg-slate-200 z-10">SOMMA SELEZIONATE</td>
                  {(expandTo2035 
                    ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                    : [2025, 2030]
                  ).map((anno, idx) => (
                    <td key={anno} className={`p-3 text-right border-r border-white ${
                      idx % 2 === 0 ? 'bg-blue-200' : 'bg-green-200'
                    }`}>
                      {valoreMercato.filter((r: any) => regioniVisibili.has(r.mercato))
                        .reduce((sum: number, r: any) => sum + (r[`valore${anno}`] || 0), 0).toFixed(1)}
                    </td>
                  ))}
                  <td className="p-3 text-center bg-purple-200">
                    {(valoreMercato.filter((r: any) => regioniVisibili.has(r.mercato))
                      .reduce((sum: number, r: any) => sum + r.cagr, 0) / regioniVisibili.size).toFixed(1)}%
                  </td>
                </tr>
              )}
              
              {/* Separatore */}
              <tr className="bg-gray-300">
                <td colSpan={expandTo2035 ? 13 : 4} className="p-1"></td>
              </tr>
              
              {/* Mondo (globale) - Totale Mondiale (riferimento) */}
              {valoreMercato.filter(row => row.mercato === 'Mondo (globale)').map((row: any) => {
                const anni = expandTo2035 
                  ? [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
                  : [2025, 2030];
                
                return (
                  <tr key={row.mercato} className="bg-gradient-to-r from-gray-100 to-slate-100 border-t-2 border-gray-400 font-semibold">
                    <td className="p-3 text-center font-bold border-r-2 border-gray-300 sticky left-0 bg-gray-100 z-10">
                      🌍 {row.mercato}
                      <div className="text-xs text-gray-600 font-normal">Riferimento totale</div>
                    </td>
                    {anni.map((anno, idx) => {
                      const valore = row[`valore${anno}`];
                      return (
                        <td key={anno} className={`p-3 text-right border-r border-gray-100 ${
                          idx % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <strong>{valore ? valore.toFixed(1) : '-'}</strong>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-purple-100">
                      <Badge variant="outline" className="font-semibold">
                        {row.cagr.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tfoot>
          </table>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-xs text-amber-900">
            <strong>📌 Nota:</strong> Dati di valore mercato da fonti multiple (Mordor, Research & Markets, Grand View Research, Cognitive Market).
            Seleziona/deseleziona regioni per personalizzare l&apos;analisi comparativa.
          </p>
        </div>
      </Card>

      {/* Insight Card */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <h3 className="text-lg font-bold text-cyan-900 mb-3">💡 Analisi Dinamica del Mercato Target</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-cyan-800 mb-2">📊 Configurazione Attuale</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="p-2 bg-white rounded border border-cyan-200">
                <strong>Anno di Ingresso:</strong> {annoTarget}
              </div>
              <div className="p-2 bg-white rounded border border-cyan-200">
                <strong>Tipologie Target:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Array.from(tipologieTarget).map(tip => (
                    <Badge key={tip} className="bg-orange-600 text-white text-xs">
                      {tip}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded border-2 border-orange-400">
                <strong>Mercato Target {annoTarget}:</strong>
                <div className="text-2xl font-bold text-orange-900">
                  {fmt(chartData.targetValue)} M$
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-800 mb-2">🎯 Strategia Consigliata</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>Focus Palmari:</strong> Segmento in crescita (5.5% CAGR), bassa saturazione</li>
              <li><strong>Differenziazione:</strong> Imaging 3D/4D + AI diagnostica</li>
              <li><strong>Applicazioni:</strong> PS/ICU, emergenza, telemedicina</li>
              <li><strong>Proiezioni 2031-2035:</strong> Palmari crescono da 5.88% a 6.63% del mercato</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-cyan-100 rounded-lg border border-cyan-300">
          <p className="text-xs text-cyan-900">
            <strong>💡 Suggerimento:</strong> Usa il menu a tendina nel card &quot;Target Eco 3D&quot; per selezionare 
            l&apos;anno di ingresso nel mercato (2026-2035) e le tipologie di hardware su cui ti vuoi posizionare. 
            Il mercato target si aggiornerà automaticamente basandosi sulle proiezioni.
          </p>
        </div>
      </Card>
    </div>
  );
}
