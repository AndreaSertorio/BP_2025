'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROIInputs {
  pazientiMese: number;
  prezzoEsame3D: number;
  penetrazione3D: number;
  costoDispositivo: number;
  costoManutenzioneAnnuale: number;
  costoPerEsame: number;
}

export function ROICalculatorWidget() {
  const [inputs, setInputs] = useState<ROIInputs>({
    pazientiMese: 200,
    prezzoEsame3D: 150,
    penetrazione3D: 30,
    costoDispositivo: 75000,
    costoManutenzioneAnnuale: 5000,
    costoPerEsame: 20,
  });

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  // Calculations
  const calculations = useMemo(() => {
    const esamiMensili3D = inputs.pazientiMese * (inputs.penetrazione3D / 100);
    const ricaviMensili = esamiMensili3D * inputs.prezzoEsame3D;
    const ricaviAnnuali = ricaviMensili * 12;
    
    const costiVariabiliMensili = esamiMensili3D * inputs.costoPerEsame;
    const costiVariabiliAnnuali = costiVariabiliMensili * 12;
    const margineContribuzioneMensile = ricaviMensili - costiVariabiliMensili;
    const margineContribuzioneAnnuale = margineContribuzioneMensile * 12;
    
    const costiAnnualiTotali = inputs.costoManutenzioneAnnuale + costiVariabiliAnnuali;
    const profittoAnnuale = ricaviAnnuali - costiAnnualiTotali;
    
    const breakEvenMesi = margineContribuzioneMensile > 0 
      ? (inputs.costoDispositivo / margineContribuzioneMensile) 
      : 0;
    
    const roi3anni = inputs.costoDispositivo > 0
      ? ((profittoAnnuale * 3 - inputs.costoDispositivo) / inputs.costoDispositivo * 100)
      : 0;
    
    // NPV calculation (10% discount rate)
    const discountRate = 0.10;
    let npv = -inputs.costoDispositivo;
    for (let year = 1; year <= 3; year++) {
      npv += profittoAnnuale / Math.pow(1 + discountRate, year);
    }
    
    return {
      esamiMensili3D,
      ricaviMensili,
      ricaviAnnuali,
      costiVariabiliMensili,
      costiVariabiliAnnuali,
      margineContribuzioneMensile,
      margineContribuzioneAnnuale,
      costiAnnualiTotali,
      profittoAnnuale,
      breakEvenMesi,
      roi3anni,
      npv,
    };
  }, [inputs]);

  // Chart data - Cash Flow
  const cashFlowData = useMemo(() => {
    const data = [];
    let cumulativeCash = -inputs.costoDispositivo;
    
    for (let month = 0; month <= 36; month++) {
      if (month === 0) {
        data.push({
          month,
          cumulative: cumulativeCash,
          breakEven: 0,
        });
      } else {
        cumulativeCash += calculations.margineContribuzioneMensile;
        data.push({
          month,
          cumulative: cumulativeCash,
          breakEven: 0,
        });
      }
    }
    
    return data;
  }, [inputs, calculations]);

  // Chart data - ROI Comparison
  const roiComparisonData = [
    { scenario: '2D Only', roi: 0, color: '#94a3b8' },
    { scenario: 'Eco 3D', roi: calculations.roi3anni, color: '#10b981' },
    { scenario: 'Competitor', roi: calculations.roi3anni * 0.7, color: '#ef4444' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">ROI Calculator</h3>
          <p className="text-sm text-gray-600">Calculate return on investment for Eco 3D</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-3">Input Parameters</h4>
          
          {/* Pazienti al mese */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pazienti/mese: <span className="text-blue-600 font-semibold">{inputs.pazientiMese}</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={inputs.pazientiMese}
              onChange={(e) => updateInput('pazientiMese', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50</span>
              <span>500</span>
            </div>
          </div>

          {/* Prezzo esame 3D */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prezzo esame 3D: <span className="text-green-600 font-semibold">€{inputs.prezzoEsame3D}</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={inputs.prezzoEsame3D}
              onChange={(e) => updateInput('prezzoEsame3D', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>€50</span>
              <span>€300</span>
            </div>
          </div>

          {/* Penetrazione 3D */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penetrazione 3D: <span className="text-purple-600 font-semibold">{inputs.penetrazione3D}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={inputs.penetrazione3D}
              onChange={(e) => updateInput('penetrazione3D', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>80%</span>
            </div>
          </div>

          {/* Costo dispositivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo dispositivo: <span className="text-red-600 font-semibold">€{inputs.costoDispositivo.toLocaleString()}</span>
            </label>
            <input
              type="number"
              value={inputs.costoDispositivo}
              onChange={(e) => updateInput('costoDispositivo', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Costo manutenzione annuale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manutenzione/anno: <span className="text-orange-600 font-semibold">€{inputs.costoManutenzioneAnnuale.toLocaleString()}</span>
            </label>
            <input
              type="number"
              value={inputs.costoManutenzioneAnnuale}
              onChange={(e) => updateInput('costoManutenzioneAnnuale', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Costo per esame */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo variabile/esame: <span className="text-gray-600 font-semibold">€{inputs.costoPerEsame}</span>
            </label>
            <input
              type="number"
              value={inputs.costoPerEsame}
              onChange={(e) => updateInput('costoPerEsame', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-3">Risultati</h4>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-semibold mb-1">Ricavi/anno</div>
              <div className="text-2xl font-bold text-blue-700">
                €{Math.round(calculations.ricaviAnnuali / 1000)}K
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 font-semibold mb-1">Profitto/anno</div>
              <div className="text-2xl font-bold text-green-700">
                €{Math.round(calculations.profittoAnnuale / 1000)}K
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-semibold mb-1">Break-Even</div>
              <div className="text-2xl font-bold text-purple-700">
                {calculations.breakEvenMesi.toFixed(1)} mesi
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600 font-semibold mb-1">ROI 3 anni</div>
              <div className="text-2xl font-bold text-orange-700">
                {calculations.roi3anni.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Esami 3D/mese:</span>
              <span className="font-semibold">{Math.round(calculations.esamiMensili3D)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ricavi/mese:</span>
              <span className="font-semibold text-green-600">€{Math.round(calculations.ricaviMensili).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costi variabili/mese:</span>
              <span className="font-semibold text-red-600">€{Math.round(calculations.costiVariabiliMensili).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-700 font-semibold">Margine/mese:</span>
              <span className="font-bold text-blue-600">€{Math.round(calculations.margineContribuzioneMensile).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-700 font-semibold">NPV (10% discount):</span>
              <span className="font-bold text-purple-600">€{Math.round(calculations.npv).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 space-y-6">
        {/* Cumulative Cash Flow */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Cumulative Cash Flow (36 mesi)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Mese', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Cash Flow (€)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => `€${value.toLocaleString()}`}
                labelFormatter={(label) => `Mese ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#3b82f6" 
                fill="#93c5fd" 
                name="Cash Flow Cumulativo"
              />
              <Line 
                type="monotone" 
                dataKey="breakEven" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Break-Even"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-xs text-center text-gray-600 mt-2">
            Break-even raggiunto al mese {calculations.breakEvenMesi.toFixed(1)}
          </div>
        </div>

        {/* ROI Comparison */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">ROI Comparison (3 anni)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roiComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis 
                label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
              <Bar dataKey="roi" fill="#10b981">
                {roiComparisonData.map((entry, index) => (
                  <Bar key={`cell-${index}`} dataKey="roi" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export button */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" className="flex-1">
          <DollarSign className="h-4 w-4 mr-2" />
          Share Scenario
        </Button>
      </div>
    </Card>
  );
}
