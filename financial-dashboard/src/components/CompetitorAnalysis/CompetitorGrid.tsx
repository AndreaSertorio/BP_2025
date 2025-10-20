'use client';

import React from 'react';
import type { Competitor } from '@/types/competitor.types';

interface CompetitorGridProps {
  competitors: Competitor[];
  onSelectCompetitor: (competitor: Competitor) => void;
}

export default function CompetitorGrid({ competitors, onSelectCompetitor }: CompetitorGridProps) {
  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier1': return { label: 'Tier 1', color: 'bg-purple-600 text-white' };
      case 'tier2': return { label: 'Tier 2', color: 'bg-blue-600 text-white' };
      case 'tier3': return { label: 'Tier 3', color: 'bg-gray-600 text-white' };
      default: return { label: tier, color: 'bg-gray-400 text-white' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'direct': return '🎯';
      case 'indirect': return '↗️';
      case 'substitute': return '🔄';
      case 'emerging': return '🌱';
      default: return '❓';
    }
  };

  if (competitors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-600 text-lg">Nessun competitor trovato</p>
        <p className="text-gray-500 text-sm mt-2">Prova a modificare i filtri</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {competitors.length} Competitor{competitors.length !== 1 ? 's' : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map((competitor) => {
          const tierBadge = getTierBadge(competitor.tier);
          const product = competitor.products?.[0];
          
          return (
            <div
              key={competitor.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => onSelectCompetitor(competitor)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{competitor.companyInfo?.logo || '🏢'}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {competitor.shortName}
                      </h3>
                      <p className="text-xs text-gray-500">{competitor.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tierBadge.color}`}>
                    {tierBadge.label}
                  </span>
                  <span className="text-xl">{getTypeIcon(competitor.type)}</span>
                </div>
              </div>

              {/* Threat Level */}
              <div className={`px-3 py-2 rounded-lg border-2 mb-3 ${getThreatColor(competitor.threatLevel)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase">Threat Level</span>
                  <span className="font-bold uppercase text-sm">{competitor.threatLevel}</span>
                </div>
              </div>

              {/* Product Info */}
              {product && (
                <div className="mb-3 text-sm">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-gray-600 text-xs">{product.category}</div>
                  {product.priceRange && (
                    <div className="text-blue-600 font-semibold mt-1">{product.priceRange}</div>
                  )}
                </div>
              )}

              {/* Features */}
              {product?.features && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.features.imaging3D && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">3D</span>
                  )}
                  {product.features.imaging4D && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">4D</span>
                  )}
                  {product.features.aiGuided && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">AI</span>
                  )}
                  {product.features.portable && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Portable</span>
                  )}
                  {product.features.automation === 'full' && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">Auto</span>
                  )}
                </div>
              )}

              {/* Battlecard Preview */}
              {competitor.battlecard?.whyWeWin && competitor.battlecard.whyWeWin.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Why We Win:</div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {competitor.battlecard.whyWeWin[0]}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  ⚔️
                </button>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-gray-400 mt-2 text-right">
                Updated: {new Date(competitor.lastUpdated).toLocaleDateString('it-IT')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
