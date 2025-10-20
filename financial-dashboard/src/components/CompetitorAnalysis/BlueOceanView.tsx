'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

interface ValueDimension {
  name: string;
  eco3d: number;
  console3d: number;
  abus: number;
  handheld2d: number;
}

export default function BlueOceanView() {
  const { data } = useDatabase();

  // Value Curve Data - allineato alla sezione BP
  const valueDimensions: ValueDimension[] = useMemo(() => [
    { name: 'Portabilità', eco3d: 5, console3d: 2, abus: 1, handheld2d: 5 },
    { name: 'Copertura Anatomica', eco3d: 5, console3d: 5, abus: 1, handheld2d: 3 },
    { name: 'Tempo Esame', eco3d: 5, console3d: 2, abus: 2, handheld2d: 4 },
    { name: 'Costo per Esame', eco3d: 4, console3d: 2, abus: 2, handheld2d: 4 },
    { name: 'Automazione/AI', eco3d: 4, console3d: 3, abus: 4, handheld2d: 2 },
    { name: 'Qualità Volumetrica', eco3d: 4, console3d: 5, abus: 4, handheld2d: 1 }
  ], []);

  // SVG Chart dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 120, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = (index: number) => margin.left + (index * chartWidth) / (valueDimensions.length - 1);
  const yScale = (value: number) => margin.top + chartHeight - (value / 5) * chartHeight;

  // Line paths
  const createPath = (dataKey: keyof Omit<ValueDimension, 'name'>) => {
    return valueDimensions.map((d, i) => {
      const x = xScale(i);
      const y = yScale(d[dataKey]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-3xl">🌊</span>
          Blue Ocean Strategy Canvas
        </h2>
        <p className="text-gray-700 text-sm">
          Visualizzazione del <strong>valore unico</strong> di Eco 3D rispetto ai competitor tradizionali.
          Identifichiamo lo spazio competitivo <strong>non conteso</strong>.
        </p>
      </div>

      {/* Strategic Value Curve */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Value Curve - Confronto Multi-Dimensionale</h3>
        
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <line
                key={value}
                x1={margin.left}
                y1={yScale(value)}
                x2={width - margin.right}
                y2={yScale(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={value === 0 || value === 5 ? '0' : '4,4'}
              />
            ))}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <text
                key={value}
                x={margin.left - 10}
                y={yScale(value)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-600"
              >
                {'★'.repeat(value)}
              </text>
            ))}

            {/* X-axis labels */}
            {valueDimensions.map((d, i) => (
              <text
                key={d.name}
                x={xScale(i)}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                {d.name}
              </text>
            ))}

            {/* Value lines */}
            {/* Eco 3D line (prominent) */}
            <path
              d={createPath('eco3d')}
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {valueDimensions.map((d, i) => (
              <circle
                key={`eco3d-${i}`}
                cx={xScale(i)}
                cy={yScale(d.eco3d)}
                r="6"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
              />
            ))}

            {/* Console 3D line */}
            <path
              d={createPath('console3d')}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {valueDimensions.map((d, i) => (
              <circle
                key={`console-${i}`}
                cx={xScale(i)}
                cy={yScale(d.console3d)}
                r="4"
                fill="#9ca3af"
              />
            ))}

            {/* ABUS line */}
            <path
              d={createPath('abus')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {valueDimensions.map((d, i) => (
              <circle
                key={`abus-${i}`}
                cx={xScale(i)}
                cy={yScale(d.abus)}
                r="4"
                fill="#f59e0b"
              />
            ))}

            {/* Handheld 2D line */}
            <path
              d={createPath('handheld2d')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {valueDimensions.map((d, i) => (
              <circle
                key={`handheld-${i}`}
                cx={xScale(i)}
                cy={yScale(d.handheld2d)}
                r="4"
                fill="#8b5cf6"
              />
            ))}

            {/* Legend */}
            <g transform={`translate(${width - margin.right + 10}, ${margin.top})`}>
              <text className="text-sm font-semibold fill-gray-700" y="0">Legenda:</text>
              
              <line x1="0" y1="20" x2="30" y2="20" stroke="#2563eb" strokeWidth="4" />
              <text x="35" y="20" alignmentBaseline="middle" className="text-xs fill-gray-700 font-bold">Eco 3D</text>

              <line x1="0" y1="40" x2="30" y2="40" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
              <text x="35" y="40" alignmentBaseline="middle" className="text-xs fill-gray-600">Console 3D</text>

              <line x1="0" y1="60" x2="30" y2="60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
              <text x="35" y="60" alignmentBaseline="middle" className="text-xs fill-gray-600">ABUS/ABVS</text>

              <line x1="0" y1="80" x2="30" y2="80" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
              <text x="35" y="80" alignmentBaseline="middle" className="text-xs fill-gray-600">Handheld 2D</text>
            </g>
          </svg>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Insight chiave:</strong> Eco 3D è l'unico player che unisce <strong>portabilità estrema</strong> (5★) 
            con <strong>copertura anatomica completa</strong> (5★) e <strong>velocità di esame</strong> (5★), 
            creando uno <strong>spazio competitivo non conteso</strong>. I competitor tradizionali massimizzano <em>o</em> la portabilità 
            <em>o</em> la qualità volumetrica, mai entrambe.
          </p>
        </div>
      </Card>

      {/* ERRC Framework */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Framework ERRC (Eliminate-Reduce-Raise-Create)</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Eliminate */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-300">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <h4 className="font-bold text-red-900">ELIMINATE</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✖</span>
                <span>Complessità operativa console</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✖</span>
                <span>Tempi lunghi (15-20 min)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✖</span>
                <span>Necessità operatori ultra-specializzati</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✖</span>
                <span>Footprint fisico ingombrante</span>
              </li>
            </ul>
          </div>

          {/* Reduce */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-300">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-6 w-6 text-orange-600" />
              <h4 className="font-bold text-orange-900">REDUCE</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">↓</span>
                <span>TCO per esame (€100-125 vs €200+)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">↓</span>
                <span>Training requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">↓</span>
                <span>Costi di manutenzione</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">↓</span>
                <span>Variabilità inter-operatore</span>
              </li>
            </ul>
          </div>

          {/* Raise */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h4 className="font-bold text-blue-900">RAISE</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">↑</span>
                <span>Automazione AI-driven</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">↑</span>
                <span>Ripetibilità volumetrica (CV -30%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">↑</span>
                <span>Multi-organ capability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">↑</span>
                <span>Accessibilità point-of-care</span>
              </li>
            </ul>
          </div>

          {/* Create */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-6 w-6 text-green-600" />
              <h4 className="font-bold text-green-900">CREATE</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">★</span>
                <span><strong>Portable Premium 3D</strong> segment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">★</span>
                <span>≤5min scan time per 3D volumetric</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">★</span>
                <span>Multi-sonda sincronizzata</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">★</span>
                <span>Follow-up a dose zero (vs TC/RM)</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Strategic Positioning Summary */}
      <Card className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Posizionamento Strategico - White Space</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <div className="text-sm text-gray-600 mb-1">Competitor Focus</div>
            <div className="text-lg font-bold text-gray-900 mb-2">Qualità <span className="text-blue-600">O</span> Portabilità</div>
            <p className="text-xs text-gray-600">
              Console 3D: massima qualità, bassa portabilità. Handheld 2D: massima portabilità, qualità limitata (solo 2D).
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4 border-2 border-blue-500">
            <div className="text-sm text-blue-700 mb-1 font-semibold">🎯 Eco 3D Position</div>
            <div className="text-lg font-bold text-blue-900 mb-2">Qualità <span className="text-green-600">E</span> Portabilità</div>
            <p className="text-xs text-blue-800 font-medium">
              <strong>SPAZIO NON CONTESO:</strong> 3D volumetrico premium + handheld + ≤5min + multi-organ
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
            <div className="text-sm text-gray-600 mb-1">Market Gap</div>
            <div className="text-lg font-bold text-green-700 mb-2">Unmet Need</div>
            <p className="text-xs text-gray-600">
              Follow-up volumetrico portabile senza radiazioni (TC) o costi elevati (RM). Mercato: €2.3B TAM.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-400">
          <p className="text-sm text-gray-900">
            <strong className="text-blue-600">🌊 Conclusione Blue Ocean:</strong> Eco 3D crea un <strong>nuovo segmento di mercato</strong> 
            che non compete direttamente né con le console 3D premium (troppo costose/ingombranti) né con gli handheld 2D 
            (limitati a diagnostica basica). Il nostro white space è <strong>&quot;premium portable volumetric imaging&quot;</strong> 
            per follow-up multi-organ in point-of-care settings.
          </p>
        </div>
      </Card>
    </div>
  );
}
