'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  TrendingUp,
  DollarSign,
  Globe,
  Calculator,
  Save,
  RefreshCw
} from 'lucide-react';

interface ProcedurePricing {
  code: string;
  description: string;
  publicPrice: number;
  privatePrice: number;
  priceRange: string;
  deviation: string;
  confidence: string;
  sources: number;
  notes: string;
}

interface MarketData {
  procedures: {
    version?: string;
    source?: string;
    lastUpdated?: string;
    description: string;
    year: number;
    regions: string[];
    volumes: Record<string, number>;
    volumeMultiplier: Record<string, number>;
    pricePerCPT?: Record<string, Record<string, number>>;
    growthRate: Record<string, number>;
    regionalPricing?: Record<string, ProcedurePricing[]>;
  };
  devices: {
    description: string;
    year: number;
    regions: string[];
    typologySplit: Record<string, number>;
    unitSales: Record<string, number>;
    installedBase: Record<string, number>;
    asp: Record<string, number>;
    unitCost: Record<string, number>;
    replacementCycle: Record<string, number>;
    growthRate: Record<string, number>;
  };
  tamSamSom: {
    description: string;
    assumptions: {
      serviceable: {
        procedures: number;
        devices: number;
      };
      obtainable: {
        year1: number;
        year3: number;
        year5: number;
      };
    };
    notes: string[];
  };
}

export function TamSamSomDashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'procedures' | 'devices'>('procedures');
  const [selectedRegion, setSelectedRegion] = useState('IT');

  useEffect(() => {
    loadMarketData();
  }, []);

  async function loadMarketData() {
    try {
      const response = await fetch('/data/database.json');
      const database = await response.json();
      setMarketData(database.market);
      setLoading(false);
    } catch (error) {
      console.error('Errore caricamento dati market:', error);
      setLoading(false);
    }
  }

  if (loading || !marketData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Calcolo TAM
  const calculateTAM = () => {
    if (activeView === 'procedures') {
      const totalVolumes = Object.values(marketData.procedures.volumes).reduce((sum, v) => sum + v, 0);
      const avgPrice = 80; // Media ponderata dei prezzi
      return totalVolumes * avgPrice;
    } else {
      const totalSales = Object.values(marketData.devices.unitSales).reduce((sum, v) => sum + v, 0);
      const avgASP = 
        (marketData.devices.asp.cart * marketData.devices.typologySplit.cart) +
        (marketData.devices.asp.portable * marketData.devices.typologySplit.portable) +
        (marketData.devices.asp.handheld * marketData.devices.typologySplit.handheld);
      return totalSales * avgASP;
    }
  };

  // Calcolo SAM
  const calculateSAM = () => {
    const tam = calculateTAM();
    const serviceableRate = activeView === 'procedures' 
      ? marketData.tamSamSom.assumptions.serviceable.procedures
      : marketData.tamSamSom.assumptions.serviceable.devices;
    return tam * serviceableRate;
  };

  // Calcolo SOM
  const calculateSOM = (year: 1 | 3 | 5) => {
    const sam = calculateSAM();
    const obtainableKey = `year${year}` as keyof typeof marketData.tamSamSom.assumptions.obtainable;
    return sam * marketData.tamSamSom.assumptions.obtainable[obtainableKey];
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

  return (
    <div className="space-y-6">
      {/* Header con switch vista */}
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
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Esporta
          </Button>
        </div>

        {/* Toggle vista */}
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
            <DollarSign className="h-4 w-4 mr-2" />
            Vista Ecografi (Devices)
          </Button>
        </div>
      </Card>

      {/* Cards TAM/SAM/SOM */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">TAM</h3>
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{formatCurrency(tam)}</div>
          <p className="text-xs text-blue-700 mt-1">Mercato Totale</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-indigo-900">SAM</h3>
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-900">{formatCurrency(sam)}</div>
          <p className="text-xs text-indigo-700 mt-1">
            {activeView === 'procedures' ? '35%' : '25%'} del TAM
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-900">SOM Y1</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{formatCurrency(som1)}</div>
          <p className="text-xs text-green-700 mt-1">Anno 1 (0.1%)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-900">SOM Y3</h3>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">{formatCurrency(som3)}</div>
          <p className="text-xs text-yellow-700 mt-1">Anno 3 (0.5%)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-900">SOM Y5</h3>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">{formatCurrency(som5)}</div>
          <p className="text-xs text-purple-700 mt-1">Anno 5 (1.5%)</p>
        </Card>
      </div>

      {/* Selector regione */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Regione:</span>
          {marketData.procedures.regions.map(region => (
            <Button
              key={region}
              variant={selectedRegion === region ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </Button>
          ))}
        </div>
      </Card>

      {/* Vista Procedures */}
      {activeView === 'procedures' && (
        <div className="space-y-4">
          {/* Summary Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Volume Annuo</div>
                <div className="text-xl font-bold text-blue-900">
                  {marketData.procedures.volumes[selectedRegion]?.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Moltiplicatore</div>
                <div className="text-xl font-bold text-blue-900">
                  {marketData.procedures.volumeMultiplier[selectedRegion]}×
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Growth Rate</div>
                <div className="text-xl font-bold text-blue-900">
                  {(marketData.procedures.growthRate[selectedRegion] * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Tabella Prezzi Dettagliata */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              Prezzi Ecografie Regionalizzati - {selectedRegion}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Codice</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Descrizione</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Pubblico (€)</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Privato (€)</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Range</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Dev.</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Conf.</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Fonti</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(marketData.procedures.regionalPricing?.[selectedRegion] || []).map((proc: ProcedurePricing, idx: number) => (
                    <tr key={proc.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">{proc.code}</td>
                      <td className="px-3 py-2 font-medium">{proc.description}</td>
                      <td className="px-3 py-2 text-right text-gray-600">€{proc.publicPrice}</td>
                      <td className="px-3 py-2 text-right font-semibold text-green-600">€{proc.privatePrice}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{proc.priceRange}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-500">{proc.deviation}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          proc.confidence === 'A' ? 'bg-green-100 text-green-800' :
                          proc.confidence === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {proc.confidence}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">{proc.sources}</td>
                      <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate" title={proc.notes}>
                        {proc.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calcolo Prezzo Medio */}
            {marketData.procedures.regionalPricing?.[selectedRegion] && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Prezzo Medio Privato:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    €{(marketData.procedures.regionalPricing[selectedRegion].reduce((sum: number, p: ProcedurePricing) => sum + p.privatePrice, 0) / 
                       marketData.procedures.regionalPricing[selectedRegion].length).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Vista Devices */}
      {activeView === 'devices' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Dati Ecografi - {selectedRegion}
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendite Annue (Unità)
                </label>
                <input
                  type="number"
                  value={marketData.devices.unitSales[selectedRegion]}
                  className="w-full px-4 py-2 border rounded-lg"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Installata
                </label>
                <input
                  type="number"
                  value={marketData.devices.installedBase[selectedRegion]}
                  className="w-full px-4 py-2 border rounded-lg"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Rate Annuo
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={(marketData.devices.growthRate[selectedRegion] * 100).toFixed(1)}
                  className="w-full px-4 py-2 border rounded-lg"
                  readOnly
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">ASP e Costi per Tipologia</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(marketData.devices.typologySplit).map(type => (
                  <div key={type} className="border rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-700 capitalize mb-2">{type}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Split:</span>
                        <span className="font-semibold">
                          {(marketData.devices.typologySplit[type] * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ASP:</span>
                        <span className="font-semibold text-green-600">
                          €{marketData.devices.asp[type].toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Costo:</span>
                        <span className="font-semibold text-red-600">
                          €{marketData.devices.unitCost[type].toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ciclo:</span>
                        <span className="font-semibold">
                          {marketData.devices.replacementCycle[type]} anni
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Assumptions TAM/SAM/SOM */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">📊 Assumptions per Calcolo TAM/SAM/SOM</h3>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Serviceable Market (SAM/TAM)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <span className="text-sm">Procedures</span>
                <Badge variant="outline">
                  {(marketData.tamSamSom.assumptions.serviceable.procedures * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <span className="text-sm">Devices</span>
                <Badge variant="outline">
                  {(marketData.tamSamSom.assumptions.serviceable.devices * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Obtainable Market (SOM/SAM)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <span className="text-sm">Year 1</span>
                <Badge variant="outline">
                  {(marketData.tamSamSom.assumptions.obtainable.year1 * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <span className="text-sm">Year 3</span>
                <Badge variant="outline">
                  {(marketData.tamSamSom.assumptions.obtainable.year3 * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <span className="text-sm">Year 5</span>
                <Badge variant="outline">
                  {(marketData.tamSamSom.assumptions.obtainable.year5 * 100).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📝 Note Metodologiche</h4>
          <ul className="space-y-1">
            {marketData.tamSamSom.notes.map((note, idx) => (
              <li key={idx} className="text-sm text-blue-800">• {note}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
