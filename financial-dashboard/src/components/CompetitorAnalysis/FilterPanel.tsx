'use client';

import React from 'react';
import type { CompetitorFilters, CompetitorTier, CompetitorType, ThreatLevel } from '@/types/competitor.types';

interface FilterPanelProps {
  filters: CompetitorFilters;
  onFiltersChange: (filters: CompetitorFilters) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleTierToggle = (tier: CompetitorTier) => {
    const currentTiers = filters.tiers || [];
    const newTiers = currentTiers.includes(tier)
      ? currentTiers.filter(t => t !== tier)
      : [...currentTiers, tier];
    onFiltersChange({ ...filters, tiers: newTiers });
  };

  const handleTypeToggle = (type: CompetitorType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleThreatToggle = (threat: ThreatLevel) => {
    const currentThreats = filters.threatLevels || [];
    const newThreats = currentThreats.includes(threat)
      ? currentThreats.filter(t => t !== threat)
      : [...currentThreats, threat];
    onFiltersChange({ ...filters, threatLevels: newThreats });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || 
    (filters.tiers && filters.tiers.length > 0) || 
    (filters.types && filters.types.length > 0) || 
    (filters.threatLevels && filters.threatLevels.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">🔍 Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tier Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
        <div className="flex flex-wrap gap-2">
          {(['tier1', 'tier2', 'tier3'] as CompetitorTier[]).map((tier) => {
            const isActive = filters.tiers?.includes(tier);
            return (
              <button
                key={tier}
                onClick={() => handleTierToggle(tier)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tier === 'tier1' ? 'Tier 1' : tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="flex flex-wrap gap-2">
          {(['direct', 'indirect', 'substitute', 'emerging'] as CompetitorType[]).map((type) => {
            const isActive = filters.types?.includes(type);
            const icons = { direct: '🎯', indirect: '↗️', substitute: '🔄', emerging: '🌱' };
            return (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Threat Level Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Threat Level</label>
        <div className="flex flex-wrap gap-2">
          {(['critical', 'high', 'medium', 'low'] as ThreatLevel[]).map((threat) => {
            const isActive = filters.threatLevels?.includes(threat);
            const colors = {
              critical: isActive ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800',
              high: isActive ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800',
              medium: isActive ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
              low: isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
            };
            return (
              <button
                key={threat}
                onClick={() => handleThreatToggle(threat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${colors[threat]} ${
                  isActive ? 'shadow-md' : 'hover:opacity-80'
                }`}
              >
                {threat.charAt(0).toUpperCase() + threat.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
