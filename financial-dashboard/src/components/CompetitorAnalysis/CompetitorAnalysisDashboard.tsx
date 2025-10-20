'use client';

import React, { useState, useMemo } from 'react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import type { Competitor, CompetitorFilters, CompetitorType, CompetitorTier, ThreatLevel } from '@/types/competitor.types';
import CompetitorGrid from './CompetitorGrid';
import CompetitorDetail from './CompetitorDetail';
import SWOTMatrix from './SWOTMatrix';
import PerceptualMap from './PerceptualMap';
import BattlecardView from './BattlecardView';
import BenchmarkingRadar from './BenchmarkingRadar';
import Porter5ForcesView from './Porter5ForcesView';
import FilterPanel from './FilterPanel';
import CompetitorExportPanel from './ExportPanel';
import OverviewDashboard from './OverviewDashboard';
import BlueOceanView from './BlueOceanView';

type ViewMode = 'overview' | 'grid' | 'swot' | 'perceptual' | 'battlecards' | 'benchmarking' | 'porter5' | 'blueocean' | 'export';

export default function CompetitorAnalysisDashboard() {
  const { data } = useDatabase();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [filters, setFilters] = useState<CompetitorFilters>({});

  const competitorAnalysis = data?.competitorAnalysis;
  const competitors = competitorAnalysis?.competitors || [];

  // Filtered competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter((comp: Competitor) => {
      if (filters.search && !comp.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.tiers && filters.tiers.length > 0 && !filters.tiers.includes(comp.tier)) {
        return false;
      }
      if (filters.types && filters.types.length > 0 && !filters.types.includes(comp.type)) {
        return false;
      }
      if (filters.threatLevels && filters.threatLevels.length > 0 && !filters.threatLevels.includes(comp.threatLevel)) {
        return false;
      }
      return true;
    });
  }, [competitors, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = competitors.length;
    const highThreat = competitors.filter((c: Competitor) => c.threatLevel === 'high' || c.threatLevel === 'critical').length;
    const mediumThreat = competitors.filter((c: Competitor) => c.threatLevel === 'medium').length;
    const lowThreat = competitors.filter((c: Competitor) => c.threatLevel === 'low').length;
    const direct = competitors.filter((c: Competitor) => c.type === 'direct').length;
    const indirect = competitors.filter((c: Competitor) => c.type === 'indirect').length;
    const substitute = competitors.filter((c: Competitor) => c.type === 'substitute').length;
    const emerging = competitors.filter((c: Competitor) => c.type === 'emerging').length;

    return {
      total,
      highThreat,
      mediumThreat,
      lowThreat,
      direct,
      indirect,
      substitute,
      emerging
    };
  }, [competitors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Competitor Analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Analisi competitiva completa per Eco 3D - {stats.total} competitor monitorati
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Update</div>
              <div className="text-lg font-semibold text-gray-900">
                {competitorAnalysis?.metadata?.lastUpdate ? new Date(competitorAnalysis.metadata.lastUpdate).toLocaleDateString('it-IT') : 'N/A'}
              </div>
            </div>
          </div>
        </div>


        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔍 Competitors
            </button>
            <button
              onClick={() => setViewMode('swot')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'swot'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚖️ SWOT
            </button>
            <button
              onClick={() => setViewMode('perceptual')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'perceptual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📍 Perceptual Map
            </button>
            <button
              onClick={() => setViewMode('battlecards')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'battlecards'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚔️ Battlecards
            </button>
            <button
              onClick={() => setViewMode('benchmarking')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'benchmarking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Benchmarking
            </button>
            <button
              onClick={() => setViewMode('porter5')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'porter5'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏛️ Porter&apos;s 5
            </button>
            <button
              onClick={() => setViewMode('blueocean')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'blueocean'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🌊 Blue Ocean
            </button>
            <button
              onClick={() => setViewMode('export')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'export'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📥 Export
            </button>
          </div>
        </div>

        {/* Filter Panel (shown in grid view) */}
        {viewMode === 'grid' && (
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <OverviewDashboard 
            data={competitorAnalysis}
            competitors={competitors}
            onNavigate={(view) => setViewMode(view as ViewMode)}
          />
        )}

        {viewMode !== 'overview' && viewMode !== 'export' && viewMode !== 'blueocean' && (
          <div className="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
            {viewMode === 'grid' && (
            <CompetitorGrid 
              competitors={filteredCompetitors} 
              onSelectCompetitor={setSelectedCompetitor}
            />
          )}
          
          {viewMode === 'swot' && (
            <SWOTMatrix competitors={competitors} />
          )}
          
          {viewMode === 'perceptual' && (
            <PerceptualMap data={competitorAnalysis?.frameworks?.perceptualMap} />
          )}
          
          {viewMode === 'battlecards' && (
            <BattlecardView competitors={competitors} />
          )}
          
          {viewMode === 'benchmarking' && (
            <BenchmarkingRadar data={competitorAnalysis?.frameworks?.benchmarking} />
          )}
          
          {viewMode === 'porter5' && (
            <Porter5ForcesView data={competitorAnalysis?.frameworks?.porter5Forces} />
          )}
          </div>
        )}

        {/* Blue Ocean View */}
        {viewMode === 'blueocean' && (
          <BlueOceanView />
        )}
        
        {/* Export Panel (shown outside content box for full width) */}
        {viewMode === 'export' && (
          <CompetitorExportPanel />
        )}

        {/* Competitor Detail Modal */}
        {selectedCompetitor && (
          <CompetitorDetail 
            competitor={selectedCompetitor} 
            onClose={() => setSelectedCompetitor(null)}
          />
        )}
      </div>
    </div>
  );
}
