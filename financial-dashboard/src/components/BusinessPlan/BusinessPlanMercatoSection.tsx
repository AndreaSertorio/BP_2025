'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { 
  TrendingUp, 
  Globe,
  BarChart3,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BusinessPlanMercatoSectionProps {
  onNavigateToTamSamSom?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function BusinessPlanMercatoSection({ 
  onNavigateToTamSamSom, 
  isCollapsed = false,
  onToggle 
}: BusinessPlanMercatoSectionProps) {
  const { data } = useDatabase();
  
  const configProcedures = data?.configurazioneTamSamSom?.ecografie;
  const configDevices = data?.configurazioneTamSamSom?.ecografi;
  
  // Estrai valori calcolati
  const proceduresData = useMemo(() => ({
    tam: configProcedures?.valoriCalcolati?.tam || 0,
    sam: configProcedures?.valoriCalcolati?.sam || 0,
    som1: configProcedures?.valoriCalcolati?.som1 || 0,
    som3: configProcedures?.valoriCalcolati?.som3 || 0,
    som5: configProcedures?.valoriCalcolati?.som5 || 0,
  }), [configProcedures]);
  
  const devicesData = useMemo(() => ({
    tam: configDevices?.valoriCalcolati?.tam || 0,
    sam: configDevices?.valoriCalcolati?.sam || 0,
    som1: configDevices?.valoriCalcolati?.som1 || 0,
    som3: configDevices?.valoriCalcolati?.som3 || 0,
    som5: configDevices?.valoriCalcolati?.som5 || 0,
  }), [configDevices]);
  
  // Totali combinati
  const totals = useMemo(() => ({
    tam: proceduresData.tam + devicesData.tam,
    sam: proceduresData.sam + devicesData.sam,
    som1: proceduresData.som1 + devicesData.som1,
    som3: proceduresData.som3 + devicesData.som3,
    som5: proceduresData.som5 + devicesData.som5,
  }), [proceduresData, devicesData]);
  
  // Percentuali configurate
  const samPercentage = configDevices?.samPercentage || 50;
  const somPercentages = configDevices?.somPercentages || { y1: 0.5, y3: 2, y5: 5 };
  
  // Regioni attive - estrai dall'anno selezionato o default
  const regioniAttive = useMemo(() => {
    // Prova a dedurre dalle regioni con TAM > 0
    const hasItalia = devicesData.tam > 0;
    const regions: string[] = [];
    if (hasItalia) {
      regions.push('🇮🇹 Italia');
    }
    // Se non ci sono dati, mostra placeholder
    return regions.length > 0 ? regions : ['🇮🇹 Italia (default)'];
  }, [devicesData.tam]);
  
  // Dati per grafici
  const timelineData = useMemo(() => [
    { year: 'Anno 1', procedures: proceduresData.som1, devices: devicesData.som1, total: totals.som1 },
    { year: 'Anno 3', procedures: proceduresData.som3, devices: devicesData.som3, total: totals.som3 },
    { year: 'Anno 5', procedures: proceduresData.som5, devices: devicesData.som5, total: totals.som5 },
  ], [proceduresData, devicesData, totals]);
  
  const segmentationData = useMemo(() => [
    { name: 'TAM', procedures: proceduresData.tam, devices: devicesData.tam },
    { name: 'SAM', procedures: proceduresData.sam, devices: devicesData.sam },
    { name: 'SOM Y1', procedures: proceduresData.som1, devices: devicesData.som1 },
  ], [proceduresData, devicesData]);
  
  // Breakdown geografico TAM/SAM/SOM (stime indicative basate su dati reali)
  const geographicBreakdown = useMemo(() => {
    // Se totals è zero, usa valori indicativi dal BP per mostrare la struttura
    const useIndicative = totals.tam === 0;
    
    if (useIndicative) {
      // Valori dal BP_2025_01.md (milioni di € per procedures)
      return [
        {
          area: 'Italia',
          flag: '🇮🇹',
          tam: 8.3 * 1000000,
          sam: 4.15 * 1000000,
          som1: 42000,
          som3: 124000,
          som5: 208000,
          valueY3: 12.4 * 1000000,
          note: 'Mercato domestico - lancio iniziale'
        },
        {
          area: 'EU5',
          flag: '🇪🇺',
          tam: 32.0 * 1000000,
          sam: 16.0 * 1000000,
          som1: 160000,
          som3: 480000,
          som5: 800000,
          valueY3: 48.0 * 1000000,
          note: 'Espansione europea - anno 2-3'
        },
        {
          area: 'USA',
          flag: '🇺🇸',
          tam: 23.5 * 1000000,
          sam: 11.75 * 1000000,
          som1: 118000,
          som3: 352000,
          som5: 588000,
          valueY3: 35.2 * 1000000,
          note: 'Mercato strategico - anno 3-4'
        },
        {
          area: 'Mondo',
          flag: '🌍',
          tam: 63.8 * 1000000,
          sam: 31.9 * 1000000,
          som1: 319000,
          som3: 957000,
          som5: 1595000,
          valueY3: 95.7 * 1000000,
          note: 'Potenziale globale cumulativo',
          isTotal: true
        }
      ];
    }
    
    // Calcolo proporzionale basato su dati reali dal database
    // Ipotesi: Italia = 20%, EU = 40%, USA = 30%, Cina = 10%
    const italia = {
      area: 'Italia',
      flag: '🇮🇹',
      tam: totals.tam * 0.20,
      sam: totals.sam * 0.20,
      som1: totals.som1 * 0.20,
      som3: totals.som3 * 0.20,
      som5: totals.som5 * 0.20,
      valueY3: totals.som3 * 0.20,
      note: 'Mercato domestico - lancio iniziale'
    };
    
    const eu = {
      area: 'Europa',
      flag: '🇪🇺',
      tam: totals.tam * 0.40,
      sam: totals.sam * 0.40,
      som1: totals.som1 * 0.40,
      som3: totals.som3 * 0.40,
      som5: totals.som5 * 0.40,
      valueY3: totals.som3 * 0.40,
      note: 'Espansione europea - anno 2-3'
    };
    
    const usa = {
      area: 'USA',
      flag: '🇺🇸',
      tam: totals.tam * 0.30,
      sam: totals.sam * 0.30,
      som1: totals.som1 * 0.30,
      som3: totals.som3 * 0.30,
      som5: totals.som5 * 0.30,
      valueY3: totals.som3 * 0.30,
      note: 'Mercato strategico - anno 3-4'
    };
    
    return [italia, eu, usa, {
      area: 'Totale',
      flag: '🌍',
      tam: totals.tam,
      sam: totals.sam,
      som1: totals.som1,
      som3: totals.som3,
      som5: totals.som5,
      valueY3: totals.som3,
      note: 'Somma mercati target',
      isTotal: true
    }];
  }, [totals]);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `€${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value.toFixed(0)}`;
  };
  
  return (
    <Card className="p-8 border-l-4 border-l-purple-600">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">3</span>
          Mercato (TAM/SAM/SOM)
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      {!isCollapsed && (
      <div className="space-y-8">
        {/* Testo introduttivo */}
        <div className="prose max-w-none bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
          <p className="text-gray-700 leading-relaxed mb-0">
            L&apos;analisi di mercato per <strong className="text-purple-600">Eco 3D</strong> utilizza la metodologia <strong>TAM / SAM / SOM</strong> 
            per stimare la dimensione totale del mercato addressabile (<em>Total Addressable Market</em>), 
            la porzione effettivamente raggiungibile (<em>Serviceable Available Market</em>) 
            e la quota realisticamente ottenibile nei primi 5 anni (<em>Serviceable Obtainable Market</em>).
          </p>
        </div>

        {/* Link dashboard in alto */}
        {onNavigateToTamSamSom && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onNavigateToTamSamSom}
              size="sm"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Apri Dashboard TAM/SAM/SOM
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      
      {/* 3.1 Overview Mercato - Cards Principali */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          Overview Mercato Totale
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* TAM */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">TAM - Total Addressable Market</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(totals.tam)}
            </div>
            <div className="text-xs text-gray-500">
              Mercato totale teoricamente addressabile
            </div>
            <div className="mt-2 pt-2 border-t border-blue-100 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Procedures:</span>
                <span className="font-semibold">{formatCurrency(proceduresData.tam)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Devices:</span>
                <span className="font-semibold">{formatCurrency(devicesData.tam)}</span>
              </div>
            </div>
          </div>
          
          {/* SAM */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">SAM - Serviceable Available Market</div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(totals.sam)}
            </div>
            <div className="text-xs text-gray-500">
              {samPercentage}% del TAM effettivamente raggiungibile
            </div>
            <div className="mt-2 pt-2 border-t border-green-100 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Procedures:</span>
                <span className="font-semibold">{formatCurrency(proceduresData.sam)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Devices:</span>
                <span className="font-semibold">{formatCurrency(devicesData.sam)}</span>
              </div>
            </div>
          </div>
          
          {/* SOM */}
          <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">SOM - Serviceable Obtainable Market</div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatCurrency(totals.som1)}
            </div>
            <div className="text-xs text-gray-500">
              Anno 1: {somPercentages.y1}% del SAM penetrato
            </div>
            <div className="mt-2 pt-2 border-t border-orange-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Anno 3 ({somPercentages.y3}%):</span>
                <span className="font-semibold">{formatCurrency(totals.som3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Anno 5 ({somPercentages.y5}%):</span>
                <span className="font-semibold">{formatCurrency(totals.som5)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info regioni attive */}
        <div className="bg-white/50 p-3 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold">Regioni analizzate:</span>
            <div className="flex gap-2">
              {regioniAttive.length > 0 ? (
                regioniAttive.map((region, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white">
                    {region}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  ⚠️ Configura regioni nella dashboard
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* 3.2 Segmentazione Mercato */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Segmentazione: Procedures vs Devices</h3>
        <p className="text-sm text-gray-600 mb-4">
          Il mercato si divide in <strong>procedure ecografiche</strong> (esami annui valorizzabili con pay-per-scan) e 
          <strong> dispositivi</strong> (ecografi vendibili/noleggiabili). Entrambi rappresentano opportunità di monetizzazione complementari.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabella Comparativa */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Segmentazione: Procedures vs Devices
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-700 font-semibold">Metrica</th>
                  <th className="text-right py-2 px-3 text-blue-700 font-semibold">Procedures</th>
                  <th className="text-right py-2 px-3 text-green-700 font-semibold">Devices</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">TAM</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600">
                    {formatCurrency(proceduresData.tam)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(devicesData.tam)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">SAM ({samPercentage}%)</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600">
                    {formatCurrency(proceduresData.sam)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(devicesData.sam)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">SOM Anno 1</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600">
                    {formatCurrency(proceduresData.som1)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(devicesData.som1)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">SOM Anno 3</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600">
                    {formatCurrency(proceduresData.som3)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(devicesData.som3)}
                  </td>
                </tr>
                <tr className="border-b-2 border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">SOM Anno 5</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600">
                    {formatCurrency(proceduresData.som5)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-green-600">
                    {formatCurrency(devicesData.som5)}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-3">Growth Y1 → Y5</td>
                  <td className="py-3 px-3 text-right text-blue-700">
                    {proceduresData.som1 > 0 
                      ? `+${((proceduresData.som5 / proceduresData.som1 - 1) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-green-700">
                    {devicesData.som1 > 0 
                      ? `+${((devicesData.som5 / devicesData.som1 - 1) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Note Procedures */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-900">
              <div className="font-semibold mb-1">📊 Procedures (Esami Ecografici)</div>
              <div className="text-blue-700">
                Mercato basato su volumi annui di prestazioni ecografiche SSN + Privato
              </div>
            </div>
          </div>
          
          {/* Note Devices */}
          <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-900">
              <div className="font-semibold mb-1">🏥 Devices (Dispositivi Hardware)</div>
              <div className="text-green-700">
                Mercato ecografi: Carrellati (€50K), Portatili (€25K), Palmari (€8K)
              </div>
            </div>
          </div>
        </Card>
        
        {/* Grafico Segmentazione */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Visualizzazione TAM/SAM/SOM
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="procedures" fill="#3b82f6" name="Procedures" radius={[4, 4, 0, 0]} />
              <Bar dataKey="devices" fill="#10b981" name="Devices" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* 3.3 Evoluzione Temporale SOM */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Proiezione SOM: Anno 1 → Anno 5
        </h3>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="SOM Totale"
              dot={{ fill: '#8b5cf6', r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="procedures" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="SOM Procedures"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="devices" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="SOM Devices"
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          {timelineData.map((item, idx) => (
            <div key={idx} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-gray-600 mb-1">{item.year}</div>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatCurrency(item.total)}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Procedures: {formatCurrency(item.procedures)}</div>
                <div>Devices: {formatCurrency(item.devices)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* 3.5 Breakdown Geografico */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Dimensioni Mercato per Area Geografica</h3>
        <p className="text-sm text-gray-600 mb-4">
          Breakdown TAM/SAM/SOM per mercato target, con proiezione di penetrazione progressiva anno 1 → 5. 
          Valori basati su dati AGENAS, OECD, WHO e analisi competitive.
        </p>
      </div>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-indigo-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Area</th>
                <th className="text-right py-3 px-4 text-blue-700 font-semibold">TAM</th>
                <th className="text-right py-3 px-4 text-green-700 font-semibold">SAM (50%)</th>
                <th className="text-right py-3 px-4 text-orange-700 font-semibold">SOM Anno 1</th>
                <th className="text-right py-3 px-4 text-orange-700 font-semibold">SOM Anno 3</th>
                <th className="text-right py-3 px-4 text-orange-700 font-semibold">SOM Anno 5</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Timing</th>
              </tr>
            </thead>
            <tbody>
              {geographicBreakdown.map((geo, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-indigo-100 ${
                    geo.isTotal ? 'bg-indigo-100 font-bold' : 'bg-white/50 hover:bg-white'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{geo.flag}</span>
                      <span className={geo.isTotal ? 'font-bold' : ''}>{geo.area}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-700">
                    {formatCurrency(geo.tam)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-700">
                    {formatCurrency(geo.sam)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-orange-600">
                    {formatCurrency(geo.som1)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-orange-600">
                    {formatCurrency(geo.som3)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-orange-600">
                    {formatCurrency(geo.som5)}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 italic">
                    {geo.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Note metodologiche */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-900">
                <div className="font-semibold mb-1">Metodologia Calcolo:</div>
                <div className="text-blue-700 space-y-1">
                  <div>• <strong>TAM</strong>: Volume totale procedure 3D/4D + dispositivi vendibili</div>
                  <div>• <strong>SAM</strong>: {samPercentage}% del TAM (barriere tecniche/normative)</div>
                  <div>• <strong>SOM</strong>: Crescita {somPercentages.y1}% (Y1) → {somPercentages.y5}% (Y5)</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-purple-900">
                <div className="font-semibold mb-1">Fonti Dati:</div>
                <div className="text-purple-700 space-y-1">
                  <div>• <strong>Italia</strong>: AGENAS 2024, Eco_ITA_MASTER.xlsx</div>
                  <div>• <strong>Europa/USA</strong>: OECD Health Stats, WHO reports</div>
                  <div>• <strong>Prezzo medio</strong>: €100-125 per procedura (benchmark mercato)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Footer con link alla dashboard */}
      {totals.tam === 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                Dati non ancora configurati
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Per visualizzare i dati reali di mercato, configura i parametri TAM/SAM/SOM nella dashboard dedicata.
              </p>
              {onNavigateToTamSamSom && (
                <Button
                  onClick={onNavigateToTamSamSom}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Vai alla Dashboard TAM/SAM/SOM
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
      </div>
      )}
    </Card>
  );
}
