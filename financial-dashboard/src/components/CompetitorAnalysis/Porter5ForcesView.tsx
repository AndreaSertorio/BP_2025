'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';

interface Porter5ForcesViewProps {
  data?: any;
}

export default function Porter5ForcesView({ data }: Porter5ForcesViewProps) {
  if (!data || !data.enabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🏛️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Porter's 5 Forces</h3>
        <p className="text-gray-600 mb-4">Analisi forze competitive di settore</p>
        <p className="text-sm text-gray-500">Dati non ancora configurati nel database</p>
      </div>
    );
  }

  const forces = [
    {
      name: 'Rivalry Among Existing Competitors',
      icon: '⚔️',
      data: data.competitiveRivalry || data.rivalryExistingCompetitors,
      color: 'red'
    },
    {
      name: 'Threat of New Entrants',
      icon: '🚪',
      data: data.threatNewEntrants,
      color: 'orange'
    },
    {
      name: 'Bargaining Power of Suppliers',
      icon: '📦',
      data: data.bargainingPowerSuppliers,
      color: 'blue'
    },
    {
      name: 'Bargaining Power of Buyers',
      icon: '🛒',
      data: data.bargainingPowerBuyers,
      color: 'green'
    },
    {
      name: 'Threat of Substitutes',
      icon: '🔄',
      data: data.threatSubstitutes,
      color: 'purple'
    }
  ];

  const getScoreColor = (score: number) => {
    // Scale 1-5: >= 4 (80%) = high, >= 3 (60%) = medium-high, >= 2 (40%) = medium, < 2 (40%) = low
    if (score >= 4) return 'text-red-600 bg-red-50';
    if (score >= 3) return 'text-orange-600 bg-orange-50';
    if (score >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getScoreBarColor = (score: number) => {
    // Scale 1-5: >= 4 (80%) = high, >= 3 (60%) = medium-high, >= 2 (40%) = medium, < 2 (40%) = low
    if (score >= 4) return 'bg-red-500';
    if (score >= 3) return 'bg-orange-500';
    if (score >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with Industry Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🏛️</span>
              Porter's 5 Forces Analysis
            </h2>
            <p className="text-gray-700 mt-2 font-medium">
              {data.industryAnalysis?.industry || 'Industry Analysis'}
            </p>
            <div className="flex gap-6 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Market Size:</span>{' '}
                <span className="font-semibold text-gray-900">{data.industryAnalysis?.marketSize || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Growth Rate:</span>{' '}
                <span className="font-semibold text-gray-900">{data.industryAnalysis?.growthRate || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Overall Attractiveness</div>
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(data.overallAttractiveness?.score || 0)}`}>
              {data.overallAttractiveness?.score?.toFixed(1) || 'N/A'}/5
            </div>
            <div className="text-sm font-medium text-gray-700 mt-1">{data.overallAttractiveness?.rating || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Forces Analysis */}
      <div className="grid grid-cols-1 gap-4">
        {forces.map((force, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{force.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{force.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{force.data?.description || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(force.data?.score || 0)}`}>
                    {force.data?.score?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1 uppercase">{force.data?.level || 'N/A'}</div>
                </div>
              </div>

              {/* Score Bar (scale 1-5) */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(force.data?.score || 0)}`}
                    style={{ width: `${((force.data?.score || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factors */}
              {force.data?.factors && force.data.factors.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Key Factors</div>
                  <ul className="space-y-1">
                    {force.data.factors.map((factor: string, fidx: number) => (
                      <li key={fidx} className="flex items-start gap-2 text-sm text-gray-700">
                        <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Impact */}
              {force.data?.impact && (
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Impact</div>
                  <p className="text-sm text-gray-700">{force.data.impact}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Summary */}
      {data.overallAttractiveness && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Overall Industry Attractiveness</h3>
          <p className="text-gray-700 mb-4">{data.overallAttractiveness.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opportunities */}
            {data.overallAttractiveness.opportunities && data.overallAttractiveness.opportunities.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Opportunities</span>
                </div>
                <ul className="space-y-1">
                  {data.overallAttractiveness.opportunities.map((opp: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {data.overallAttractiveness.risks && data.overallAttractiveness.risks.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-900">Risks</span>
                </div>
                <ul className="space-y-1">
                  {data.overallAttractiveness.risks.map((risk: string, idx: number) => (
                    <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
