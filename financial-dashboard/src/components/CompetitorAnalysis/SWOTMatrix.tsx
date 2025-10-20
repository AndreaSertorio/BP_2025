'use client';

import React, { useState } from 'react';
import type { Competitor } from '@/types/competitor.types';

interface SWOTMatrixProps {
  competitors: Competitor[];
}

export default function SWOTMatrix({ competitors }: SWOTMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>(competitors[0]?.id || '');
  const competitor = competitors.find(c => c.id === selectedId);

  if (!competitor || !competitor.swotAnalysis) {
    return <div className="text-center py-12 text-gray-600">No SWOT data available</div>;
  }

  const swot = competitor.swotAnalysis;

  return (
    <div className="space-y-6">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded-lg"
      >
        {competitors.map(c => (
          <option key={c.id} value={c.id}>{c.shortName}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4">STRENGTHS</h3>
          <ul className="space-y-2">
            {swot.strengths?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4">WEAKNESSES</h3>
          <ul className="space-y-2">
            {swot.weaknesses?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600">✗</span>
                <span className="text-sm text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">OPPORTUNITIES</h3>
          <ul className="space-y-2">
            {swot.opportunities?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600">⚡</span>
                <span className="text-sm text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-4">THREATS</h3>
          <ul className="space-y-2">
            {swot.threats?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-600">⚠</span>
                <span className="text-sm text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
