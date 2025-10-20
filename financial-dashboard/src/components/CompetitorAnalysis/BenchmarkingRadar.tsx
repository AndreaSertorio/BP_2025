'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface BenchmarkingRadarProps {
  data?: any;
}

export default function BenchmarkingRadar({ data }: BenchmarkingRadarProps) {
  // Start with Eco 3D + top 3 individual competitors for interesting comparison
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([
    'cluster_eco3d',    // Eco 3D reference
    'ge_voluson',       // Top Console 3D
    'ge_invenia_abus',  // ABUS specialist
    'butterfly_iq'      // Handheld 2D leader
  ]);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  if (!data || !data.enabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Benchmarking Radar</h3>
        <p className="text-gray-600 mb-4">Confronto multi-dimensionale</p>
        <p className="text-sm text-gray-500">Dati non ancora configurati nel database</p>
      </div>
    );
  }

  const { dimensions = [], competitors = [], insights = [] } = data;

  // Radar chart dimensions
  const size = 500;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const numDimensions = dimensions.length;

  // Calculate polygon points for a competitor
  const calculatePoints = (scores: Record<string, number>) => {
    return dimensions.map((dim: any, idx: number) => {
      const angle = (Math.PI * 2 * idx) / numDimensions - Math.PI / 2;
      const score = scores[dim.id] || 0;
      const radius = (score / dim.maxScore) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x, y, dimension: dim, score };
    });
  };

  // Get dimension label position
  const getDimensionLabelPosition = (idx: number) => {
    const angle = (Math.PI * 2 * idx) / numDimensions - Math.PI / 2;
    const labelRadius = maxRadius + 40;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y, angle };
  };

  // Toggle competitor selection
  const toggleCompetitor = (competitorId: string) => {
    if (selectedCompetitors.includes(competitorId)) {
      if (selectedCompetitors.length > 1) {
        setSelectedCompetitors(selectedCompetitors.filter(id => id !== competitorId));
      }
    } else {
      if (selectedCompetitors.length < 4) {
        setSelectedCompetitors([...selectedCompetitors, competitorId]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Benchmarking Radar - Multi-Dimensional Analysis
            </h2>
            <p className="text-gray-700 mt-2">
              Strategic comparison across {dimensions.length} key dimensions. Choose from 4 cluster groups or 10 individual competitors (GE, Philips, Siemens, Canon, Samsung, Butterfly, Clarius, etc.)
            </p>
            <div className="flex gap-6 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Dimensions:</span>{' '}
                <span className="font-semibold text-gray-900">{dimensions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Competitors:</span>{' '}
                <span className="font-semibold text-gray-900">{competitors.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Selected:</span>{' '}
                <span className="font-semibold text-gray-900">{selectedCompetitors.length}/4</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-cyan-100 rounded-lg px-4 py-2">
              <Award className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-cyan-900">Best Overall</div>
              <div className="text-xs text-cyan-700">
                {competitors.sort((a: any, b: any) => b.totalScore - a.totalScore)[0]?.name.split(' ')[0] || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Select Competitors to Compare (max 4)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {competitors.map((comp: any) => {
            const isSelected = selectedCompetitors.includes(comp.competitorId);
            const isReference = comp.isReference || false;
            return (
              <button
                key={comp.competitorId}
                onClick={() => toggleCompetitor(comp.competitorId)}
                disabled={!isSelected && selectedCompetitors.length >= 4}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${!isSelected && selectedCompetitors.length >= 4 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: comp.color }}
                  />
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {comp.name.replace(' (Reference)', '')}
                  </span>
                  {isReference && <span className="text-xs text-blue-600">★</span>}
                </div>
                <div className="text-xs text-gray-600">
                  Score: <span className="font-bold text-gray-900">{comp.totalScore.toFixed(2)}</span>/3
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Radar Comparison Chart</h3>
        <svg width={size} height={size} className="mx-auto">
          {/* Background circles */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={maxRadius * scale}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray={idx === 4 ? '0' : '4'}
            />
          ))}

          {/* Dimension axes */}
          {dimensions.map((dim: any, idx: number) => {
            const angle = (Math.PI * 2 * idx) / numDimensions - Math.PI / 2;
            const x = center + maxRadius * Math.cos(angle);
            const y = center + maxRadius * Math.sin(angle);
            const isHovered = hoveredDimension === dim.id;

            return (
              <g key={dim.id}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? '#3B82F6' : '#D1D5DB'}
                  strokeWidth={isHovered ? '2' : '1'}
                />
                {/* Dimension label */}
                {(() => {
                  const labelPos = getDimensionLabelPosition(idx);
                  return (
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      className={`text-xs font-semibold ${isHovered ? 'fill-blue-600' : 'fill-gray-700'}`}
                      onMouseEnter={() => setHoveredDimension(dim.id)}
                      onMouseLeave={() => setHoveredDimension(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {dim.name}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Competitor polygons */}
          {selectedCompetitors.map((competitorId, zIndex) => {
            const comp = competitors.find((c: any) => c.competitorId === competitorId);
            if (!comp) return null;

            const points = calculatePoints(comp.scores);
            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

            return (
              <g key={competitorId} style={{ zIndex: zIndex + 1 }}>
                {/* Polygon fill */}
                <path
                  d={pathData}
                  fill={comp.color}
                  fillOpacity="0.15"
                  stroke={comp.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {points.map((point, idx) => (
                  <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={comp.color}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDimension(point.dimension.id)}
                    onMouseLeave={() => setHoveredDimension(null)}
                  >
                    <title>{`${comp.name} - ${point.dimension.name}: ${point.score}/${point.dimension.maxScore}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {selectedCompetitors.map(competitorId => {
            const comp = competitors.find((c: any) => c.competitorId === competitorId);
            if (!comp) return null;
            return (
              <div key={competitorId} className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: comp.color }} />
                <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                <span className="text-xs text-gray-600">({comp.totalScore.toFixed(2)})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dimension Details */}
      {hoveredDimension && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            const dim = dimensions.find((d: any) => d.id === hoveredDimension);
            if (!dim) return null;
            return (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{dim.name}</h4>
                <p className="text-sm text-gray-700 mb-3">{dim.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedCompetitors.map(competitorId => {
                    const comp = competitors.find((c: any) => c.competitorId === competitorId);
                    if (!comp) return null;
                    const score = comp.scores[dim.id] || 0;
                    return (
                      <div key={competitorId} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.color }} />
                          <span className="text-xs font-medium text-gray-900 truncate">{comp.name.split(' ')[0]}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{score.toFixed(1)}<span className="text-sm text-gray-500">/{dim.maxScore}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Score Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Detailed Score Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Dimension</th>
                {selectedCompetitors.map(competitorId => {
                  const comp = competitors.find((c: any) => c.competitorId === competitorId);
                  if (!comp) return null;
                  return (
                    <th key={competitorId} className="text-center py-3 px-4 font-semibold text-gray-900">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.color }} />
                        {comp.name.replace(' (Reference)', '')}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim: any, idx: number) => (
                <tr key={dim.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 font-medium text-gray-900">{dim.name}</td>
                  {selectedCompetitors.map(competitorId => {
                    const comp = competitors.find((c: any) => c.competitorId === competitorId);
                    if (!comp) return null;
                    const score = comp.scores[dim.id] || 0;
                    const percentage = (score / dim.maxScore) * 100;
                    return (
                      <td key={competitorId} className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-gray-900">{score.toFixed(1)}</span>
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: comp.color
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Average</td>
                {selectedCompetitors.map(competitorId => {
                  const comp = competitors.find((c: any) => c.competitorId === competitorId);
                  if (!comp) return null;
                  return (
                    <td key={competitorId} className="py-3 px-4 text-center">
                      <span className="text-lg" style={{ color: comp.color }}>{comp.totalScore.toFixed(2)}</span>
                      <span className="text-gray-600">/3</span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Benchmarking Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
