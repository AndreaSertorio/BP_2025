/**
 * ============================================================================
 * TEST DATABASE CENTRALIZZATO
 * ============================================================================
 * 
 * Componente di test per verificare il nuovo approccio centralizzato.
 * Visualizza i dati dal database.json senza Context o PlayerPrefs.
 * 
 * Created: 2025-01-06
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  CheckCircle, 
  TrendingUp, 
  Globe,
  RefreshCw,
  FileJson
} from 'lucide-react';
import db from '@/lib/database-service';

export function TestDatabaseCentralizzato() {
  const [showDetails, setShowDetails] = useState(false);
  const [percentualeExtra, setPercentualeExtra] = useState(30);
  
  // Carica dati (sincrono, niente loading state!)
  const stats = useMemo(() => db.getStatistiche(), []);
  const prestazioniItalia = useMemo(
    () => db.calcolaPrestazioniItalia(percentualeExtra),
    [percentualeExtra]
  );
  const totaliItalia = useMemo(
    () => db.calcolaTotaliItalia(percentualeExtra),
    [percentualeExtra]
  );
  const totaliAggredibili = useMemo(
    () => db.calcolaTotaliAggredibili(percentualeExtra),
    [percentualeExtra]
  );
  const mercatiRegionali = useMemo(
    () => db.calcolaTuttiMercati(percentualeExtra),
    [percentualeExtra]
  );
  
  const formatNumber = (num: number) => db.formatNumber(num);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Test Database Centralizzato
          </h1>
          <p className="text-gray-600">
            Nuovo approccio: un unico file JSON, dati accessibili ovunque
          </p>
          <div className="mt-2 flex gap-3 text-sm">
            <Badge variant="outline" className="bg-green-50">
              <CheckCircle className="h-3 w-3 mr-1" />
              Version {stats.database.version}
            </Badge>
            <Badge variant="outline">
              <FileJson className="h-3 w-3 mr-1" />
              {stats.database.lastUpdate}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              {stats.italia.totale.numeroPrestazioni} prestazioni
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Ricarica
        </Button>
      </div>

      {/* Controllo Percentuale Extra-SSN */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
          ⚙️ Configurazione Calcoli
        </h3>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Percentuale Extra-SSN:
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={percentualeExtra}
            onChange={(e) => setPercentualeExtra(parseInt(e.target.value))}
            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={percentualeExtra}
            onChange={(e) => setPercentualeExtra(parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center"
          />
          <span className="text-2xl font-bold text-blue-900">{percentualeExtra}%</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 Modifica la percentuale per vedere i calcoli in tempo reale
        </p>
      </Card>

      {/* KPI Cards - Italia */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          🇮🇹 Mercato Italia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Volume SSN</h3>
            <p className="text-3xl font-bold text-blue-900">
              {formatNumber(totaliItalia.volumeSSN)}
            </p>
            <p className="text-xs text-blue-700 mt-1">esami/anno</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">Volume Extra-SSN</h3>
            <p className="text-3xl font-bold text-orange-900">
              {formatNumber(totaliItalia.volumeExtraSSN)}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              {percentualeExtra}% del SSN
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <h3 className="text-sm font-semibold text-cyan-800 mb-2">Totale Mercato</h3>
            <p className="text-3xl font-bold text-cyan-900">
              {formatNumber(totaliItalia.volumeTotale)}
            </p>
            <p className="text-xs text-cyan-700 mt-1">esami totali/anno</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-300 ring-2 ring-green-400">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-800">🎯 Mercato Aggredibile</h3>
              <Badge className="bg-green-600 text-white">
                {totaliAggredibili.numeroPrestazioni}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {formatNumber(totaliAggredibili.volumeTotale)}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {stats.italia.percentualeAggredibile} del totale
            </p>
          </Card>
        </div>
      </div>

      {/* Mercati Regionali */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          Mercati Regionali (Derivati da Italia)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* USA */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              🇺🇸 USA
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {formatNumber(mercatiRegionali.usa.volumeTotale)}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {db.getMoltiplicatoreRegione('usa').volumeMultiplier}× Italia
            </p>
          </Card>

          {/* Europa */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              🇪🇺 Europa
            </h3>
            <p className="text-2xl font-bold text-indigo-900">
              {formatNumber(mercatiRegionali.europa.volumeTotale)}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              {db.getMoltiplicatoreRegione('europa').volumeMultiplier}× Italia
            </p>
          </Card>

          {/* Cina */}
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
              🇨🇳 Cina
            </h3>
            <p className="text-2xl font-bold text-red-900">
              {formatNumber(mercatiRegionali.cina.volumeTotale)}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {db.getMoltiplicatoreRegione('cina').volumeMultiplier}× Italia
            </p>
          </Card>

          {/* Globale */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 ring-2 ring-yellow-400">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              🌍 Globale
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              {formatNumber(mercatiRegionali.globale.volumeTotale)}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              {db.getMoltiplicatoreRegione('globale').volumeMultiplier}× Italia
            </p>
          </Card>
        </div>
      </div>

      {/* Tabella Prestazioni */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Prestazioni Italia ({prestazioniItalia.length})
          </h2>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
          >
            {showDetails ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold">Codice</th>
                <th className="text-left p-3 font-semibold">Prestazione</th>
                <th className="text-center p-3 font-semibold w-24">🎯</th>
                {showDetails && (
                  <>
                    <th className="text-right p-3 font-semibold">U</th>
                    <th className="text-right p-3 font-semibold">B</th>
                    <th className="text-right p-3 font-semibold">D</th>
                    <th className="text-right p-3 font-semibold">P</th>
                  </>
                )}
                <th className="text-right p-3 font-semibold bg-blue-50">SSN</th>
                <th className="text-right p-3 font-semibold bg-orange-50">Extra-SSN</th>
                <th className="text-right p-3 font-semibold bg-cyan-50">Totale</th>
                <th className="text-right p-3 font-semibold">% Mercato</th>
              </tr>
            </thead>
            <tbody>
              {prestazioniItalia.map((p) => (
                <tr 
                  key={p.codice}
                  className={`border-b hover:bg-gray-50 ${p.aggredibile ? 'bg-green-50' : ''}`}
                >
                  <td className="p-3 text-sm font-mono text-gray-600">{p.codice}</td>
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3 text-center">
                    {p.aggredibile ? (
                      <Badge className="bg-green-600 text-white text-xs">Target</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  {showDetails && (
                    <>
                      <td className="p-3 text-right text-sm">{formatNumber(p.U)}</td>
                      <td className="p-3 text-right text-sm">{formatNumber(p.B)}</td>
                      <td className="p-3 text-right text-sm">{formatNumber(p.D)}</td>
                      <td className="p-3 text-right text-sm">{formatNumber(p.P)}</td>
                    </>
                  )}
                  <td className="p-3 text-right font-semibold bg-blue-50">
                    {formatNumber(p.totaleSSN)}
                  </td>
                  <td className="p-3 text-right font-semibold bg-orange-50">
                    {formatNumber(p.extraSSN)}
                  </td>
                  <td className="p-3 text-right font-bold bg-cyan-50">
                    {formatNumber(p.totaleAnnuo)}
                  </td>
                  <td className="p-3 text-right text-sm text-gray-600">
                    {p.percentualeSSN.toFixed(1)}%
                  </td>
                </tr>
              ))}
              
              {/* Riga Totale */}
              <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
                <td className="p-3" colSpan={2}>TOTALE ITALIA</td>
                <td className="p-3 text-center">
                  <Badge className="bg-blue-600 text-white">
                    {totaliItalia.numeroPrestazioni}
                  </Badge>
                </td>
                {showDetails && <td colSpan={4}></td>}
                <td className="p-3 text-right bg-blue-100">{formatNumber(totaliItalia.volumeSSN)}</td>
                <td className="p-3 text-right bg-orange-100">{formatNumber(totaliItalia.volumeExtraSSN)}</td>
                <td className="p-3 text-right bg-cyan-100">{formatNumber(totaliItalia.volumeTotale)}</td>
                <td className="p-3 text-right">100%</td>
              </tr>
              
              {/* Riga Aggredibili */}
              <tr className="bg-green-100 font-bold border-t border-gray-300">
                <td className="p-3" colSpan={2}>🎯 MERCATO AGGREDIBILE</td>
                <td className="p-3 text-center">
                  <Badge className="bg-green-600 text-white">
                    {totaliAggredibili.numeroPrestazioni}
                  </Badge>
                </td>
                {showDetails && <td colSpan={4}></td>}
                <td className="p-3 text-right bg-blue-100">{formatNumber(totaliAggredibili.volumeSSN)}</td>
                <td className="p-3 text-right bg-orange-100">{formatNumber(totaliAggredibili.volumeExtraSSN)}</td>
                <td className="p-3 text-right bg-cyan-100">{formatNumber(totaliAggredibili.volumeTotale)}</td>
                <td className="p-3 text-right">{stats.italia.percentualeAggredibile}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Sistema */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Vantaggi Nuovo Approccio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Semplicità</h4>
            <p className="text-gray-600">Un unico file JSON, niente Context complessi</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Accessibilità</h4>
            <p className="text-gray-600">Facile da ispezionare e modificare manualmente</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Performance</h4>
            <p className="text-gray-600">Caricamento sincrono, calcoli memoizzati</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Type-Safe</h4>
            <p className="text-gray-600">TypeScript completo, zero errori runtime</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Centralizzato</h4>
            <p className="text-gray-600">Single source of truth per tutti i dati</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Scalabile</h4>
            <p className="text-gray-600">Facile aggiungere ecografi e materiali</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>📂 File database:</strong> <code className="bg-white px-2 py-1 rounded">src/data/database.json</code>
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>🔧 Servizio:</strong> <code className="bg-white px-2 py-1 rounded">src/lib/database-service.ts</code>
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>💡 Uso:</strong> <code className="bg-white px-2 py-1 rounded">import db from '@/lib/database-service'</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
