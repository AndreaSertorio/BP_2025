'use client';

import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Filter, Eye, EyeOff } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseProvider';

interface PerceptualMapProps {
  data?: any;
}

export default function PerceptualMap({ data }: PerceptualMapProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['tier1', 'tier2', 'tier3']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['direct', 'indirect', 'substitute', 'emerging']);
  const [showLabels, setShowLabels] = useState<'all' | 'reference' | 'hover'>('reference');
  const [showClusters, setShowClusters] = useState(true);
  
  // Hooks must be called unconditionally
  const { data: dbData } = useDatabase();
  const allCompetitors = useMemo(() => dbData?.competitorAnalysis?.competitors || [], [dbData]);
  
  // Extract data before conditional return
  const axes = data?.axes;
  const positions = data?.positions || [];
  const clusters = data?.clusters || [];
  const insights = data?.insights || [];
  
  // Filter positions based on selected tiers and types
  const filteredPositions = useMemo(() => {
    if (!data || !data.enabled) return [];
    return positions.filter((pos: any) => {
      const competitor = allCompetitors.find((c: any) => c.id === pos.competitorId);
      if (!competitor) return true; // Show if we can't find the competitor
      
      const tierMatch = selectedTiers.includes(competitor.tier);
      const typeMatch = selectedTypes.includes(competitor.type);
      
      return tierMatch && typeMatch;
    });
  }, [data, positions, selectedTiers, selectedTypes, allCompetitors]);

  if (!data || !data.enabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Perceptual Map</h3>
        <p className="text-gray-600 mb-4">Visualizzazione posizionamento competitivo</p>
        <p className="text-sm text-gray-500">Dati non ancora configurati nel database</p>
      </div>
    );
  }
  
  // Toggle functions
  const toggleTier = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };
  
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  
  // Canvas dimensions
  const width = 800;
  const height = 600;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Scale position to canvas coordinates  
  // X axis: innovation score (axes.x.min to axes.x.max)
  // Y axis: automation score (0-10)
  const scaleX = (x: number) => {
    const normalized = Math.max(axes.x.min, Math.min(x, axes.x.max)); // Clamp to min-max range
    return padding + ((normalized - axes.x.min) / (axes.x.max - axes.x.min)) * chartWidth;
  };
  
  const scaleY = (y: number) => {
    const normalized = Math.max(0, Math.min(y, axes.y.max)); // Clamp value
    return height - padding - (normalized / axes.y.max) * chartHeight;
  };

  // Grid lines for Y axis (automation 0-10)
  const gridLinesY = [0, 2.5, 5, 7.5, 10];
  // Grid lines for X axis (innovation 3-10)
  const gridLinesX = [3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">📍</span>
              Perceptual Map - Competitive Positioning
            </h2>
            <p className="text-gray-700 mt-2">
              {axes.x.label} vs {axes.y.label}
            </p>
            <div className="flex gap-6 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Competitors Positioned:</span>{' '}
                <span className="font-semibold text-gray-900">{positions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Strategic Clusters:</span>{' '}
                <span className="font-semibold text-gray-900">{clusters.length}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 rounded-lg px-4 py-2">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-blue-900">White Space</div>
              <div className="text-xs text-blue-700">Opportunity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            Visualization Filters
          </h3>
          <div className="text-sm text-gray-600">
            Showing {filteredPositions.length} of {positions.length} competitors
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier Filters */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">By Tier</h4>
            <div className="space-y-2">
              {['tier1', 'tier2', 'tier3'].map(tier => {
                const isSelected = selectedTiers.includes(tier);
                const count = positions.filter((p: any) => {
                  const comp = allCompetitors.find((c: any) => c.id === p.competitorId);
                  return comp?.tier === tier;
                }).length;
                return (
                  <button
                    key={tier}
                    onClick={() => toggleTier(tier)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{tier.toUpperCase()}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filters */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">By Type</h4>
            <div className="space-y-2">
              {[
                { id: 'direct', label: 'Direct', color: 'blue' },
                { id: 'indirect', label: 'Indirect', color: 'purple' },
                { id: 'substitute', label: 'Substitute', color: 'orange' },
                { id: 'emerging', label: 'Emerging', color: 'green' }
              ].map(type => {
                const isSelected = selectedTypes.includes(type.id);
                const count = positions.filter((p: any) => {
                  const comp = allCompetitors.find((c: any) => c.id === p.competitorId);
                  return comp?.type === type.id;
                }).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-900`
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{type.label}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Display Options</h4>
            <div className="space-y-2">
              {/* Show Labels */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs font-medium text-gray-700 block mb-2">Show Labels</label>
                <select
                  value={showLabels}
                  onChange={(e) => setShowLabels(e.target.value as 'all' | 'reference' | 'hover')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="reference">Reference Only</option>
                  <option value="hover">On Hover</option>
                  <option value="all">All Competitors</option>
                </select>
              </div>

              {/* Show Clusters */}
              <button
                onClick={() => setShowClusters(!showClusters)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
                  showClusters
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-sm">
                  {showClusters ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Clusters
                </span>
              </button>

              {/* Quick Filters */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedTiers(['tier1']);
                    setSelectedTypes(['direct']);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-1"
                >
                  🎯 Top Threats Only
                </button>
                <button
                  onClick={() => {
                    setSelectedTiers(['tier1', 'tier2', 'tier3']);
                    setSelectedTypes(['direct', 'indirect', 'substitute', 'emerging']);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  🔄 Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Perceptual Map Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <svg width={width} height={height} className="mx-auto">
          {/* Vertical grid lines (price) */}
          {gridLinesX.map((value) => (
            <line
              key={`grid-x-${value}`}
              x1={scaleX(value)}
              y1={padding}
              x2={scaleX(value)}
              y2={height - padding}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}
          
          {/* Horizontal grid lines (automation) */}
          {gridLinesY.map((value) => (
            <line
              key={`grid-y-${value}`}
              x1={padding}
              y1={scaleY(value)}
              x2={width - padding}
              y2={scaleY(value)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

          {/* Axis labels */}
          <text x={width / 2} y={height - 20} textAnchor="middle" className="fill-gray-700 text-sm font-semibold">
            {axes.x.label}
          </text>
          <text x={25} y={height / 2} textAnchor="middle" transform={`rotate(-90, 25, ${height / 2})`} className="fill-gray-700 text-sm font-semibold">
            {axes.y.label}
          </text>

          {/* Min/Max labels */}
          <text x={padding} y={height - padding + 30} textAnchor="middle" className="fill-gray-500 text-xs">
            {axes.x.minLabel || '0'}
          </text>
          <text x={width - padding} y={height - padding + 30} textAnchor="middle" className="fill-gray-500 text-xs">
            {axes.x.maxLabel || '10'}
          </text>
          <text x={padding - 40} y={height - padding} textAnchor="middle" className="fill-gray-500 text-xs">
            {axes.y.minLabel || '0'}
          </text>
          <text x={padding - 40} y={padding} textAnchor="middle" className="fill-gray-500 text-xs">
            {axes.y.maxLabel || '10'}
          </text>

          {/* Data points */}
          {filteredPositions.map((pos: any, idx: number) => {
            const cx = scaleX(pos.x);
            const cy = scaleY(pos.y);
            const isReference = pos.isReference || false;
            const isHovered = hoveredPoint === pos.competitorId;
            
            return (
              <g key={idx}>
                {/* Point shadow for reference */}
                {isReference && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="20"
                    fill="#00D2FF"
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}
                
                {/* Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isReference ? "10" : "7"}
                  fill={pos.color || '#6B7280'}
                  stroke={isHovered ? '#1F2937' : 'white'}
                  strokeWidth={isHovered ? "3" : "2"}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                  onMouseEnter={() => setHoveredPoint(pos.competitorId)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Label */}
                {(showLabels === 'all' || (showLabels === 'reference' && isReference) || (showLabels === 'hover' && isHovered)) && (
                  <text
                    x={cx}
                    y={cy - 15}
                    textAnchor="middle"
                    className={`fill-gray-900 text-xs font-bold ${isReference ? 'text-base' : ''}`}
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))'
                    }}
                  >
                    {pos.label || pos.competitorId}
                  </text>
                )}
              </g>
            );
          })}

          {/* Quadrant labels */}
          <text x={width * 0.75} y={padding + 30} textAnchor="middle" className="fill-purple-600 text-sm font-bold opacity-30">
            High Innovation
          </text>
          <text x={width * 0.75} y={padding + 45} textAnchor="middle" className="fill-purple-600 text-sm font-bold opacity-30">
            High Automation
          </text>
          <text x={width * 0.25} y={height - padding - 30} textAnchor="middle" className="fill-gray-400 text-sm font-medium opacity-30">
            Low Innovation
          </text>
          <text x={width * 0.25} y={height - padding - 15} textAnchor="middle" className="fill-gray-400 text-sm font-medium opacity-30">
            Low Automation
          </text>
        </svg>

        {/* Fixed Details Panel - Always visible */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            // Find the position to display (hovered or reference)
            const displayPos = hoveredPoint 
              ? positions.find((p: any) => p.competitorId === hoveredPoint)
              : positions.find((p: any) => p.isReference) || positions[0];
            
            if (!displayPos) return null;
            
            return (
              <>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: displayPos.color || '#6B7280' }}
                  />
                  <span className="font-semibold text-gray-900">
                    {displayPos.label || displayPos.competitorId}
                  </span>
                  {displayPos.isReference && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      Reference
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{axes.x.label}:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {displayPos.x.toFixed(1)}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{axes.y.label}:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {displayPos.y.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Strategic Clusters */}
      {showClusters && clusters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Strategic Clusters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cluster: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900 mb-2">{cluster.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{cluster.description}</p>
                <div className="text-xs text-gray-500">
                  {cluster.competitors?.length || 0} competitors
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Key Strategic Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 font-bold">✓</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
