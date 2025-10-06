/**
 * RIEPILOGO MERCATO - DATABASE CENTRALIZZATO
 * Visualizza dati dal database.json tramite DatabaseProvider
 * LETTURA in tempo reale - si aggiorna automaticamente quando cambiano i dati
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Target, Info, ChevronDown, ChevronUp, BarChart3, TrendingUp } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { DatabaseService } from '@/lib/database-service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function MercatoRiepilogo() {
  // Stato per collapsible, toggle e anno selezionato
  const [isEcografieDetailsOpen, setIsEcografieDetailsOpen] = useState(false);
  const [isGraficiOpen, setIsGraficiOpen] = useState(false);
  const [targetSoloItalia, setTargetSoloItalia] = useState(true);
  const [annoSelezionato, setAnnoSelezionato] = useState(2030);
  
  // Leggi dal DatabaseProvider (sincronizzato con tutte le modifiche)
  const { data, loading } = useDatabase();
  
  // Crea un'istanza del service con i dati aggiornati
  const db = useMemo(() => new DatabaseService(data), [data]);
  
  // Calcola dati derivati
  const totaliItalia = useMemo(() => db.calcolaTotaliItalia(), [db]);
  const totaliAggredibili = useMemo(() => db.calcolaTotaliAggredibili(), [db]);
  const mercatiRegionali = useMemo(() => db.calcolaTuttiMercati(), [db]);
  const prestazioniItalia = useMemo(() => db.calcolaPrestazioniItalia(), [db]);
  const prestazioniAggredibili = useMemo(() => db.getPrestazioniAggredibili(), [db]);
  
  const formatNumber = (num: number) => db.formatNumber(num);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento database...</div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            📊 Riepilogo Mercato Ecografie
            <Badge variant="outline" className="text-sm bg-green-50">
              Database Centralizzato
            </Badge>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-5 w-5 text-green-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <div className="text-sm">
                  <p className="font-semibold mb-1 text-green-700">✅ Sistema Unificato</p>
                  <p>Questi dati provengono da <code>database.json</code> tramite <strong>DatabaseProvider</strong>.</p>
                  <p className="mt-2 text-green-600">✨ Tutte le modifiche fatte nel tab &quot;Mercato Ecografie&quot; si sincronizzano automaticamente in tempo reale!</p>
                  <p className="mt-2 text-xs text-gray-600">Salvate in localStorage per persistenza.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </h1>
          <p className="text-gray-600 mt-2">
            Dati caricati da <code className="bg-gray-100 px-2 py-1 rounded">src/data/database.json</code>
          </p>
        </div>

      {/* KPI Cards - Italia */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          🇮🇹 Mercato Italia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Volume SSN */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-blue-800">Volume SSN</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-blue-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">📊 Calcolo</p>
                    <code className="text-xs">Volume SSN = Σ(U + B + D + P)</code>
                    <p className="text-xs mt-2">Somma di Urgente + Breve + Differibile + Programmabile per tutte le {prestazioniItalia.length} prestazioni</p>
                    <p className="text-xs text-gray-600 mt-2">Fonte: database.json → prestazioni[*].U+B+D+P</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {formatNumber(totaliItalia.volumeSSN)}
            </p>
            <p className="text-xs text-blue-700 mt-1">esami/anno</p>
          </Card>

          {/* Volume Extra-SSN */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-orange-800">Volume Extra-SSN</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-orange-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">📊 Calcolo</p>
                    <code className="text-xs">Extra-SSN = Volume SSN × 30%</code>
                    <p className="text-xs mt-2">Percentuale Extra-SSN fissa al 30% (parametro modificabile nel database)</p>
                    <p className="text-xs text-gray-600 mt-2">Fonte: database.json → percentualeExtraSSN: 30</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {formatNumber(totaliItalia.volumeExtraSSN)}
            </p>
            <p className="text-xs text-orange-700 mt-1">30% del SSN</p>
          </Card>

          {/* Totale Mercato */}
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <h3 className="text-sm font-semibold text-cyan-800 mb-2">Totale Mercato</h3>
            <p className="text-3xl font-bold text-cyan-900">
              {formatNumber(totaliItalia.volumeTotale)}
            </p>
            <p className="text-xs text-cyan-700 mt-1">esami totali/anno</p>
          </Card>

          {/* Mercato Aggredibile */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-300 ring-2 ring-green-400">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-green-800">🎯 Mercato Aggredibile</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-green-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="text-sm space-y-2">
                      <p className="font-semibold">📊 Fonte Dati</p>
                      <p className="text-xs">Prestazioni con <code>aggredibile: true</code> in database.json</p>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs max-h-40 overflow-y-auto">
                        <p className="font-semibold mb-1">Prestazioni incluse ({prestazioniAggredibili.length}):</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {prestazioniAggredibili.map((p, idx) => (
                            <li key={idx}>
                              {p.nome} 
                              <span className="text-green-700 ml-1">
                                ({p.percentualeExtraSSN || 30}% Extra-SSN)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        ✅ Sincronizzato! Le modifiche nel tab Ecografie si riflettono automaticamente qui.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge className="bg-green-600 text-white">
                {totaliAggredibili.numeroPrestazioni}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {formatNumber(totaliAggredibili.volumeTotale)}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {totaliItalia.volumeTotale > 0 
                ? `${((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * 100).toFixed(1)}% del mercato`
                : 'Target Eco3D'
              }
            </p>
          </Card>
        </div>
      </div>

      {/* Mercati Regionali */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          Mercati Regionali
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* USA */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              🇺🇸 USA
              {data.regioniMondiali?.usa && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-purple-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">Moltiplicatore Volume: {data.regioniMondiali.usa.moltiplicatoreVolume}×</p>
                      <p className="text-xs text-gray-600">{data.regioniMondiali.usa.note}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {formatNumber(mercatiRegionali.usa.volumeTotale)}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Totale: {data.regioniMondiali?.usa?.moltiplicatoreVolume || 5.5}× Italia
            </p>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs font-semibold text-purple-800 mb-1">🎯 Mercato Aggredibile</p>
              <p className="text-lg font-bold text-green-700">
                {formatNumber((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * mercatiRegionali.usa.volumeTotale)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * 100).toFixed(1)}% del mercato USA
              </p>
            </div>
          </Card>

          {/* Europa */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              🇪🇺 Europa
              {data.regioniMondiali?.europa && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-indigo-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">Moltiplicatore Volume: {data.regioniMondiali.europa.moltiplicatoreVolume}×</p>
                      <p className="text-xs text-gray-600">{data.regioniMondiali.europa.note}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <p className="text-2xl font-bold text-indigo-900">
              {formatNumber(mercatiRegionali.europa.volumeTotale)}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Totale: {data.regioniMondiali?.europa?.moltiplicatoreVolume || 8.0}× Italia
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-200">
              <p className="text-xs font-semibold text-indigo-800 mb-1">🎯 Mercato Aggredibile</p>
              <p className="text-lg font-bold text-green-700">
                {formatNumber((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * mercatiRegionali.europa.volumeTotale)}
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * 100).toFixed(1)}% del mercato Europa
              </p>
            </div>
          </Card>

          {/* Cina */}
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
              🇨🇳 Cina
              {data.regioniMondiali?.cina && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-red-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">Moltiplicatore Volume: {data.regioniMondiali.cina.moltiplicatoreVolume}×</p>
                      <p className="text-xs text-gray-600">{data.regioniMondiali.cina.note}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <p className="text-2xl font-bold text-red-900">
              {formatNumber(mercatiRegionali.cina.volumeTotale)}
            </p>
            <p className="text-xs text-red-700 mt-1">
              Totale: {data.regioniMondiali?.cina?.moltiplicatoreVolume || 22.0}× Italia
            </p>
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs font-semibold text-red-800 mb-1">🎯 Mercato Aggredibile</p>
              <p className="text-lg font-bold text-green-700">
                {formatNumber((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * mercatiRegionali.cina.volumeTotale)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * 100).toFixed(1)}% del mercato Cina
              </p>
            </div>
          </Card>

          {/* Globale */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 ring-2 ring-yellow-400">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              🌍 Globale
              {data.regioniMondiali?.globale && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-yellow-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">Moltiplicatore Volume: {data.regioniMondiali.globale.moltiplicatoreVolume}×</p>
                      <p className="text-xs text-gray-600">{data.regioniMondiali.globale.note}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              {formatNumber(mercatiRegionali.globale.volumeTotale)}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Totale: {data.regioniMondiali?.globale?.moltiplicatoreVolume || 50.0}× Italia
            </p>
            <div className="mt-3 pt-3 border-t border-yellow-300">
              <p className="text-xs font-semibold text-yellow-800 mb-1">🎯 Mercato Aggredibile</p>
              <p className="text-lg font-bold text-green-700">
                {formatNumber((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * mercatiRegionali.globale.volumeTotale)}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {((totaliAggredibili.volumeTotale / totaliItalia.volumeTotale) * 100).toFixed(1)}% del mercato Globale
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* MERCATO ECOGRAFI - Card Riassuntive */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">🏥 Mercato Ecografi - Dati Chiave</h2>
            <Badge variant="outline" className="text-sm bg-blue-50">
              Sincronizzato con Database
            </Badge>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-5 w-5 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <div className="text-sm">
                  <p className="font-semibold mb-1 text-blue-700">✅ Dati in tempo reale</p>
                  <p>Questi dati provengono dalla sezione <code>mercatoEcografi</code> in database.json.</p>
                  <p className="mt-2 text-blue-600">✨ Modifiche nel tab &quot;Mercato Ecografi - Italia e Globale&quot; si aggiornano automaticamente!</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Selector Anno per Card Riassuntive */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border-2 border-blue-300">
            <span className="text-sm font-semibold text-blue-800">Anno:</span>
            <div className="flex items-center gap-1">
              {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((anno) => (
                <Button
                  key={anno}
                  variant={annoSelezionato === anno ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnnoSelezionato(anno)}
                  className={`h-8 px-2.5 text-xs ${
                    annoSelezionato === anno 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'hover:bg-blue-50'
                  }`}
                >
                  {anno}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* PRIMA RIGA - Card Target e Riassuntive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* Card Riassunto Quote Mercato Italia */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-blue-800">📊 Quote Tipologie IT {annoSelezionato}</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">📊 Distribuzione Mercato</p>
                      <p className="text-xs">Quote di mercato per tipologia di ecografo in Italia</p>
                      <p className="text-xs text-gray-600 mt-2">Fonte: database.json → quoteTipologie</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {(() => {
                const quote = data.mercatoEcografi?.quoteTipologie?.find(q => q.anno === annoSelezionato);
                
                return quote ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-blue-200">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <span>🏥</span> Carrellati
                      </span>
                      <span className="text-lg font-bold text-blue-800">{quote.carrellati.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-200">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <span>💼</span> Portatili
                      </span>
                      <span className="text-lg font-bold text-blue-800">{quote.portatili.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <span>📱</span> Palmari
                      </span>
                      <span className="text-lg font-bold text-green-700">{quote.palmari.toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Dati non disponibili per {annoSelezionato}</p>
                );
              })()}
            </div>
          </Card>

          {/* Card Proiezioni Italia 4 Provider */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-purple-800">🇮🇹 Proiezioni IT {annoSelezionato}</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-purple-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">📊 4 Provider di Ricerca</p>
                      <p className="text-xs">Proiezioni valore mercato Italia da diversi provider</p>
                      <p className="text-xs text-gray-600 mt-2">Fonte: database.json → proiezioniItalia</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {(() => {
                const proiezione = data.mercatoEcografi?.proiezioniItalia?.find(p => p.anno === annoSelezionato);
                
                return proiezione ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Mordor</span>
                      <span className="font-semibold text-purple-800">${proiezione.mordor.toFixed(0)}M</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Research</span>
                      <span className="font-semibold text-purple-800">${proiezione.research.toFixed(0)}M</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">GrandView</span>
                      <span className="font-semibold text-purple-800">${proiezione.grandview.toFixed(0)}M</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Cognitive</span>
                      <span className="font-semibold text-purple-800">${proiezione.cognitive.toFixed(0)}M</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t-2 border-purple-300">
                      <span className="text-xs font-bold text-purple-900">Media</span>
                      <span className="text-lg font-bold text-purple-900">${proiezione.media.toFixed(0)}M</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Dati non disponibili</p>
                );
              })()}
            </div>
          </Card>

          {/* Card Target Principale - SULLA DESTRA */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-300 ring-2 ring-green-400">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-green-800">🎯 Target Eco3D</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">📊 Calcolo Automatico</p>
                        <code className="text-xs block mt-2">
                          Target = Σ(Vendite × Market Share)
                        </code>
                        <p className="text-xs mt-2">
                          {targetSoloItalia ? 'Solo Italia' : `${data.mercatoEcografi?.configurazione?.regioniVisibili?.length} regioni`}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white px-3 py-1.5 rounded border border-green-300">
                <span className={`text-xs font-medium ${targetSoloItalia ? 'text-green-800' : 'text-gray-500'}`}>🇮🇹</span>
                <Switch checked={!targetSoloItalia} onCheckedChange={(checked) => setTargetSoloItalia(!checked)} />
                <span className={`text-xs font-medium ${!targetSoloItalia ? 'text-green-800' : 'text-gray-500'}`}>🌍</span>
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold text-green-900">
                  {(() => {
                    const marketShare = data.mercatoEcografi?.configurazione?.marketShare || 1;
                    
                    if (targetSoloItalia) {
                      const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === 'Italia');
                      const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                      return Math.round(vendite * marketShare / 100).toLocaleString();
                    } else {
                      const regioniVisibili = data.mercatoEcografi?.configurazione?.regioniVisibili || [];
                      const targetTotale = regioniVisibili.reduce((sum: number, regione: string) => {
                        const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
                        const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                        return sum + Math.round(vendite * marketShare / 100);
                      }, 0);
                      return targetTotale.toLocaleString();
                    }
                  })()}
                </p>
                <p className="text-xs text-green-700 mt-1">unità/anno</p>
                <Badge className="bg-green-600 text-white mt-2 text-xs">
                  {data.mercatoEcografi?.configurazione?.marketShare}% · Anno {annoSelezionato}
                </Badge>
              </div>

              {!targetSoloItalia && (
                <div className="pt-3 border-t border-green-200">
                  <p className="text-xs font-semibold text-green-800 mb-1">Per Regione:</p>
                  <div className="space-y-1">
                    {data.mercatoEcografi?.configurazione?.regioniVisibili?.map((regione: string, idx: number) => {
                      const marketShare = data.mercatoEcografi?.configurazione?.marketShare || 1;
                      const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
                      const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                      const target = Math.round(vendite * marketShare / 100);
                      
                      const iconMap: Record<string, string> = {
                        'Italia': '🇮🇹', 'Europa': '🇪🇺', 'Stati Uniti': '🇺🇸', 'Cina': '🇨🇳'
                      };
                      
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{iconMap[regione]} {regione}</span>
                          <span className="font-bold text-green-800">{target.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* SECONDA RIGA - Card Regionali con Vendite, Valore e Parco */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card fisse per tutte le regioni principali + Mondo */}
          {['Italia', 'Europa', 'Stati Uniti', 'Cina', 'Mondo (globale)'].map((regione: string, idx: number) => {
            const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
            const valoreData: any = data.mercatoEcografi?.valoreMercato?.find(v => v.mercato === regione);
            
            // Accesso dinamico ai dati per anno selezionato
            const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
            const valore = valoreData ? (valoreData[`valore${annoSelezionato}`] || 0) : 0;
            
            // Dati parco dispositivi
            // Per Italia: dati ufficiali da database
            // Per altre regioni: stima basata su vendite annuali * fattore di accumulazione (durata media dispositivo ~10 anni)
            const parcoData = regione === 'Italia' 
              ? data.mercatoEcografi?.parcoIT?.find(p => p.anno === annoSelezionato)
              : null;
            
            const scenarioParco = data.mercatoEcografi?.configurazione?.scenarioParco || 'centrale';
            let parcoDispositivi = 0;
            
            if (regione === 'Italia' && parcoData) {
              parcoDispositivi = parcoData[scenarioParco] || 0;
            } else if (vendite > 0) {
              // Stima parco: vendite annuali * 10 (durata media ecografo) con fattore di dismissione
              parcoDispositivi = Math.round(vendite * 10 * 0.92); // 8% dismissione annua
            }
            
            // Mappa classi complete per regione (no template strings)
            const styleMap: Record<string, { cardClass: string; titleClass: string; valueClass: string; icon: string }> = {
              'Italia': { 
                cardClass: 'p-5 bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200',
                titleClass: 'text-sm font-semibold text-sky-800',
                valueClass: 'text-2xl font-bold text-sky-800',
                icon: '🇮🇹'
              },
              'Europa': { 
                cardClass: 'p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
                titleClass: 'text-sm font-semibold text-indigo-800',
                valueClass: 'text-2xl font-bold text-indigo-800',
                icon: '🇪🇺'
              },
              'Stati Uniti': { 
                cardClass: 'p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
                titleClass: 'text-sm font-semibold text-purple-800',
                valueClass: 'text-2xl font-bold text-purple-800',
                icon: '🇺🇸'
              },
              'Cina': { 
                cardClass: 'p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200',
                titleClass: 'text-sm font-semibold text-red-800',
                valueClass: 'text-2xl font-bold text-red-800',
                icon: '🇨🇳'
              },
              'Mondo (globale)': {
                cardClass: 'p-5 bg-gradient-to-br from-slate-50 to-gray-100 border-slate-300',
                titleClass: 'text-sm font-semibold text-slate-800',
                valueClass: 'text-2xl font-bold text-slate-800',
                icon: '🌍'
              }
            };
            
            const style = styleMap[regione] || {
              cardClass: 'p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
              titleClass: 'text-sm font-semibold text-gray-800',
              valueClass: 'text-2xl font-bold text-gray-800',
              icon: '🌍'
            };
            
            return (
              <Card key={idx} className={style.cardClass}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{style.icon}</span>
                  <h3 className={style.titleClass}>{regione}</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 opacity-60" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">{regione} - Anno {annoSelezionato}</p>
                        <p className="text-xs">Vendite: {vendite.toLocaleString()} unità</p>
                        <p className="text-xs">Valore: ${valore.toLocaleString()}M</p>
                        <p className="text-xs">CAGR: {valoreData?.cagr}%</p>
                        <p className="text-xs text-gray-600 mt-2">Fonte: database.json → mercatoEcografi</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Vendite {annoSelezionato}</p>
                    <p className={style.valueClass}>
                      {vendite.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">unità/anno</p>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">Valore Mercato</p>
                    <p className="text-xl font-bold text-gray-800">
                      ${typeof valore === 'number' ? valore.toFixed(1) : valore}M
                    </p>
                    <p className="text-xs text-gray-500">CAGR: {valoreData?.cagr}%</p>
                  </div>
                  
                  {/* Parco Dispositivi - Tutte le regioni */}
                  {parcoDispositivi > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold">Parco Dispositivi</p>
                      <p className="text-lg font-bold text-amber-700">
                        {parcoDispositivi.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {regione === 'Italia' ? `Scenario: ${scenarioParco}` : 'Stima basata su vendite'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

        </div>

      </div>

      {/* Dettagli Mercato Ecografie - Sezione Collassabile */}
      <Card className="bg-gray-50 border border-gray-300">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100"
          onClick={() => setIsEcografieDetailsOpen(!isEcografieDetailsOpen)}
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">
              Dettagli Tecnici - Mercato Ecografie
            </span>
            <Badge variant="outline" className="text-xs">
              {totaliItalia.numeroPrestazioni} prestazioni · {totaliAggredibili.numeroPrestazioni} aggredibili
            </Badge>
          </div>
          {isEcografieDetailsOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </Button>
        
        {isEcografieDetailsOpen && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200">
            {/* Dati Disponibili */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Dati Disponibili
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
                <div>
                  <div className="font-semibold text-xs text-gray-600">Prestazioni</div>
                  <div className="text-lg font-bold">{totaliItalia.numeroPrestazioni}</div>
                </div>
                <div>
                  <div className="font-semibold text-xs text-gray-600">Aggredibili</div>
                  <div className="text-lg font-bold text-green-700">{totaliAggredibili.numeroPrestazioni}</div>
                </div>
                <div>
                  <div className="font-semibold text-xs text-gray-600">Regioni</div>
                  <div className="text-lg font-bold">5</div>
                </div>
                <div>
                  <div className="font-semibold text-xs text-gray-600">Database</div>
                  <div className="text-lg font-bold">v1.0.1</div>
                </div>
              </div>
            </div>

            {/* Prestazioni Aggredibili */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 text-sm">
                ✅ Prestazioni Aggredibili (Sincronizzate)
              </h4>
              <p className="text-xs text-green-800 mb-3">
                {prestazioniAggredibili.length} prestazioni con <code className="bg-green-100 px-1 py-0.5 rounded text-xs">aggredibile: true</code>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {prestazioniAggredibili.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-green-200 text-xs">
                    <Badge className="bg-green-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                      {idx + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p.nome}</div>
                      <div className="text-xs text-gray-500">
                        Volume: {formatNumber(p.U + p.B + p.D + p.P)} · Extra-SSN: {p.percentualeExtraSSN || 30}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
                <p className="text-xs text-green-800">
                  <strong>✅ SINCRONIZZAZIONE:</strong> Le modifiche nel tab &quot;Mercato Ecografie&quot; si riflettono automaticamente qui.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SEZIONE GRAFICI ANALITICI - COLLASSABILE */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-4 hover:bg-blue-100"
          onClick={() => setIsGraficiOpen(!isGraficiOpen)}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              📊 Grafici Analitici - Visualizzazione Dati Mercato
            </span>
            <Badge className="bg-blue-600 text-white">Anno {annoSelezionato}</Badge>
          </div>
          {isGraficiOpen ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600" />
          )}
        </Button>

        {isGraficiOpen && (
          <div className="p-6 pt-0 space-y-6">
            
            {/* Grafico 1: Vendite per Regione (Anno Selezionato) */}
            <Card className="p-4 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Vendite per Regione - Anno {annoSelezionato}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={['Italia', 'Europa', 'Stati Uniti', 'Cina', 'Mondo (globale)'].map(regione => {
                  const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
                  const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                  return {
                    regione: regione === 'Mondo (globale)' ? 'Mondo' : regione,
                    vendite: vendite
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regione" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => value.toLocaleString() + ' unità'} />
                  <Legend />
                  <Bar dataKey="vendite" fill="#3b82f6" name="Vendite (unità/anno)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Grafico 2: Evoluzione Vendite Italia 2025-2035 */}
            <Card className="p-4 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Evoluzione Vendite Italia (2025-2035)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(anno => {
                  const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === 'Italia');
                  const vendite = venditeData ? (venditeData[`unita${anno}`] || 0) : 0;
                  return { anno: anno.toString(), vendite };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="anno" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => value.toLocaleString() + ' unità'} />
                  <Legend />
                  <Line type="monotone" dataKey="vendite" stroke="#10b981" strokeWidth={2} name="Vendite Italia" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Grafico 3: Distribuzione Valore Mercato (Pie Chart) */}
            <Card className="p-4 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Distribuzione Valore Mercato - Anno {annoSelezionato}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={['Italia', 'Europa', 'Stati Uniti', 'Cina'].map(regione => {
                      const valoreData: any = data.mercatoEcografi?.valoreMercato?.find(v => v.mercato === regione);
                      const valore = valoreData ? (valoreData[`valore${annoSelezionato}`] || 0) : 0;
                      return {
                        name: regione,
                        value: valore
                      };
                    })}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(1)}M`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['Italia', 'Europa', 'Stati Uniti', 'Cina'].map((_, index) => {
                      const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ef4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index]} />;
                    })}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `$${value.toFixed(1)}M`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Grafico 4: Parco Dispositivi per Regione */}
            <Card className="p-4 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                Parco Dispositivi Installato - Anno {annoSelezionato}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={['Italia', 'Europa', 'Stati Uniti', 'Cina', 'Mondo (globale)'].map(regione => {
                  const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
                  const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                  
                  const parcoData = regione === 'Italia' 
                    ? data.mercatoEcografi?.parcoIT?.find(p => p.anno === annoSelezionato)
                    : null;
                  
                  const scenarioParco = data.mercatoEcografi?.configurazione?.scenarioParco || 'centrale';
                  let parcoDispositivi = 0;
                  
                  if (regione === 'Italia' && parcoData) {
                    parcoDispositivi = parcoData[scenarioParco] || 0;
                  } else if (vendite > 0) {
                    parcoDispositivi = Math.round(vendite * 10 * 0.92);
                  }
                  
                  return {
                    regione: regione === 'Mondo (globale)' ? 'Mondo' : regione,
                    parco: parcoDispositivi
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regione" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => value.toLocaleString() + ' dispositivi'} />
                  <Legend />
                  <Bar dataKey="parco" fill="#f59e0b" name="Parco Dispositivi" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 italic">
                * Italia: dati ufficiali (scenario {data.mercatoEcografi?.configurazione?.scenarioParco || 'centrale'}). 
                Altre regioni: stima basata su vendite annuali × 10 anni × 0.92 (dismissione 8%)
              </p>
            </Card>

            {/* Grafico 5: Confronto Target vs Mercato Totale */}
            <Card className="p-4 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Target Eco3D vs Mercato Disponibile - Anno {annoSelezionato}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(() => {
                  const marketShare = data.mercatoEcografi?.configurazione?.marketShare || 1;
                  const regioniVisibili = data.mercatoEcografi?.configurazione?.regioniVisibili || [];
                  
                  return regioniVisibili.map((regione: string) => {
                    const venditeData: any = data.mercatoEcografi?.numeroEcografi?.find(n => n.mercato === regione);
                    const vendite = venditeData ? (venditeData[`unita${annoSelezionato}`] || 0) : 0;
                    const target = Math.round(vendite * marketShare / 100);
                    
                    return {
                      regione,
                      mercato: vendite,
                      target: target
                    };
                  });
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regione" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => value.toLocaleString() + ' unità'} />
                  <Legend />
                  <Bar dataKey="mercato" fill="#94a3b8" name="Mercato Totale" />
                  <Bar dataKey="target" fill="#10b981" name={`Target Eco3D (${data.mercatoEcografi?.configurazione?.marketShare}%)`} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>📊 Grafici Interattivi:</strong> Tutti i grafici si aggiornano automaticamente in base all&apos;anno selezionato e alle regioni visibili configurate.
                Passa il mouse sui grafici per vedere i dettagli.
              </p>
            </div>

          </div>
        )}
      </Card>

    </div>
    </TooltipProvider>
  );
}
