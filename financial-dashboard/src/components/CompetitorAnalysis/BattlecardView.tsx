'use client';

import React, { useState } from 'react';
import type { Competitor } from '@/types/competitor.types';

interface BattlecardViewProps {
  competitors: Competitor[];
}

export default function BattlecardView({ competitors }: BattlecardViewProps) {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(competitors[0]?.id || '');
  
  const selectedCompetitor = competitors.find(c => c.id === selectedCompetitorId);

  if (!selectedCompetitor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nessun competitor disponibile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competitor Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Competitor</label>
        <select
          value={selectedCompetitorId}
          onChange={(e) => setSelectedCompetitorId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {competitors.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.shortName} - {comp.tier}
            </option>
          ))}
        </select>
      </div>

      {/* Battlecard */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span>⚔️</span>
              Battlecard: Eco 3D vs {selectedCompetitor.shortName}
            </h2>
            <p className="text-gray-600 mt-1">{selectedCompetitor.name}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Export PDF
          </button>
        </div>

        {/* Why We Win */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>🎯</span>
            WHY WE WIN
          </h3>
          <div className="space-y-2">
            {selectedCompetitor.battlecard?.whyWeWin?.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-gray-800">
                <span className="text-green-600 font-bold">✓</span>
                <span>{item}</span>
              </div>
            )) || <p className="text-gray-500 italic">No data available</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Their Strengths */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <span>🔴</span>
              THEIR STRENGTHS
            </h3>
            <div className="space-y-2">
              {selectedCompetitor.battlecard?.theirStrengths?.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-700 text-sm">
                  <span className="text-red-500">•</span>
                  <span>{item}</span>
                </div>
              )) || <p className="text-gray-500 italic text-sm">No data available</p>}
            </div>
          </div>

          {/* Their Weaknesses */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
              <span>🟡</span>
              THEIR WEAKNESSES
            </h3>
            <div className="space-y-2">
              {selectedCompetitor.battlecard?.theirWeaknesses?.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-700 text-sm">
                  <span className="text-orange-500">•</span>
                  <span>{item}</span>
                </div>
              )) || <p className="text-gray-500 italic text-sm">No data available</p>}
            </div>
          </div>
        </div>

        {/* Competitive Response */}
        {selectedCompetitor.battlecard?.competitiveResponse && (
          <div className="bg-white rounded-lg p-6 mt-6 shadow-md">
            <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
              <span>💡</span>
              COMPETITIVE RESPONSE
            </h3>
            <p className="text-gray-800 italic">"{selectedCompetitor.battlecard.competitiveResponse}"</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-sm text-gray-600">Threat Level</div>
            <div className="text-2xl font-bold text-red-600 mt-1 uppercase">
              {selectedCompetitor.threatLevel}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-sm text-gray-600">Market Share</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {selectedCompetitor.marketPosition?.marketShare || 'N/A'}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-sm text-gray-600">Priority</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              #{selectedCompetitor.monitoringPriority}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-sm text-gray-600">Type</div>
            <div className="text-lg font-bold text-gray-700 mt-1 capitalize">
              {selectedCompetitor.type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
