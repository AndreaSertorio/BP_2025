'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Target, Award, AlertTriangle, BarChart3, Map } from 'lucide-react';

interface OverviewDashboardProps {
  data?: any;
  competitors: any[];
  onNavigate: (view: string) => void;
}

interface WidgetVisibility {
  keyMetrics: boolean;
  topThreats: boolean;
  porter5Summary: boolean;
  perceptualMapPreview: boolean;
  benchmarkingLeader: boolean;
  recentUpdates: boolean;
  competitiveAdvantages: boolean;
  actionItems: boolean;
}

export default function OverviewDashboard({ data, competitors, onNavigate }: OverviewDashboardProps) {
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
    keyMetrics: true,
    topThreats: true,
    porter5Summary: true,
    perceptualMapPreview: true,
    benchmarkingLeader: true,
    recentUpdates: true,
    competitiveAdvantages: true,
    actionItems: true,
  });

  const toggleWidget = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  // Calculate stats
  const totalCompetitors = competitors.length;
  const highThreat = competitors.filter(c => c.threatLevel === 'high' || c.threatLevel === 'critical').length;
  const mediumThreat = competitors.filter(c => c.threatLevel === 'medium').length;
  const lowThreat = competitors.filter(c => c.threatLevel === 'low').length;
  const tier1Count = competitors.filter(c => c.tier === 'tier1').length;
  const directCount = competitors.filter(c => c.type === 'direct').length;
  const indirectCount = competitors.filter(c => c.type === 'indirect').length;
  const substituteCount = competitors.filter(c => c.type === 'substitute').length;
  const emergingCount = competitors.filter(c => c.type === 'emerging').length;

  // Top threats (high + critical, sorted by market share)
  const topThreats = competitors
    .filter(c => c.threatLevel === 'high' || c.threatLevel === 'critical')
    .sort((a, b) => (b.marketPosition?.marketShare || 0) - (a.marketPosition?.marketShare || 0))
    .slice(0, 5);

  // Porter5 summary
  const porter5 = data?.frameworks?.porter5Forces;
  const benchmarking = data?.frameworks?.benchmarking;
  const perceptualMap = data?.frameworks?.perceptualMap;

  // Widget component
  const Widget = ({ 
    title, 
    icon: Icon, 
    widgetKey, 
    children, 
    className = '' 
  }: { 
    title: string; 
    icon: any; 
    widgetKey: keyof WidgetVisibility; 
    children: React.ReactNode;
    className?: string;
  }) => {
    const isVisible = widgetVisibility[widgetKey];
    
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={() => toggleWidget(widgetKey)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={isVisible ? 'Hide widget' : 'Show widget'}
          >
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        {isVisible && (
          <div className="p-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Customization Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📊 Competitive Intelligence Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize your dashboard by showing/hiding widgets using the eye icon
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWidgetVisibility(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {} as WidgetVisibility))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Show All
            </button>
            <button
              onClick={() => setWidgetVisibility(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as WidgetVisibility))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hide All
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Key Metrics - Full Width */}
      <Widget title="Key Metrics" icon={BarChart3} widgetKey="keyMetrics">
        <div className="space-y-6">
          {/* Threat Level Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Threat Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{totalCompetitors}</div>
                <div className="text-xs text-gray-600 mt-1">Total Competitors</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{highThreat}</div>
                <div className="text-xs text-gray-600 mt-1">High Threat</div>
                <div className="text-xs text-gray-500 mt-0.5">Monitoring Priority</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{mediumThreat}</div>
                <div className="text-xs text-gray-600 mt-1">Medium Threat</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{lowThreat}</div>
                <div className="text-xs text-gray-600 mt-1">Low Threat</div>
              </div>
            </div>
          </div>

          {/* Competitor Type Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribution by Type</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm font-medium text-gray-700">Direct</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(directCount / totalCompetitors) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-900 font-semibold w-12 text-right">{directCount}</div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm font-medium text-gray-700">Indirect</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(indirectCount / totalCompetitors) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-900 font-semibold w-12 text-right">{indirectCount}</div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm font-medium text-gray-700">Substitute</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(substituteCount / totalCompetitors) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-900 font-semibold w-12 text-right">{substituteCount}</div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm font-medium text-gray-700">Emerging</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(emergingCount / totalCompetitors) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-900 font-semibold w-12 text-right">{emergingCount}</div>
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tier Breakdown</h3>
            <div className="flex gap-3 text-center">
              <div className="flex-1 bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-xl font-bold text-purple-600">{tier1Count}</div>
                <div className="text-xs text-gray-600 mt-1">Tier 1</div>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xl font-bold text-blue-600">{competitors.filter(c => c.tier === 'tier2').length}</div>
                <div className="text-xs text-gray-600 mt-1">Tier 2</div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 border border-gray-300">
                <div className="text-xl font-bold text-gray-600">{competitors.filter(c => c.tier === 'tier3').length}</div>
                <div className="text-xs text-gray-600 mt-1">Tier 3</div>
              </div>
            </div>
          </div>
        </div>
      </Widget>

      {/* Row 2: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Threats */}
        <Widget title="Top Threats" icon={AlertTriangle} widgetKey="topThreats">
          <div className="space-y-3">
            {topThreats.map((comp, idx) => (
              <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onNavigate('grid')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">#{idx + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{comp.name}</div>
                    <div className="text-xs text-gray-500">
                      {comp.marketPosition?.marketShare?.toFixed(1)}% market share
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  comp.threatLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {comp.threatLevel}
                </div>
              </div>
            ))}
            {topThreats.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No high-threat competitors identified
              </div>
            )}
          </div>
        </Widget>

        {/* Porter's 5 Forces Summary */}
        <Widget title="Porter's 5 Forces Summary" icon={Target} widgetKey="porter5Summary">
          {porter5 && porter5.enabled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onNavigate('porter5')}
              >
                <span className="text-sm font-medium text-gray-700">Overall Attractiveness</span>
                <span className="text-lg font-bold text-blue-600">{porter5.overallAttractiveness?.score?.toFixed(1)}/5</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Rivalry', value: porter5.rivalryExistingCompetitors?.score, level: porter5.rivalryExistingCompetitors?.level },
                  { label: 'New Entrants', value: porter5.threatNewEntrants?.score, level: porter5.threatNewEntrants?.level },
                  { label: 'Suppliers', value: porter5.bargainingPowerSuppliers?.score, level: porter5.bargainingPowerSuppliers?.level },
                  { label: 'Buyers', value: porter5.bargainingPowerBuyers?.score, level: porter5.bargainingPowerBuyers?.level },
                ].map((force, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-600">{force.label}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm font-bold text-gray-900">{force.value?.toFixed(1)}/5</div>
                      <div className="text-xs text-gray-500">{force.level}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('porter5')}
                className="w-full mt-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Full Analysis →
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              Porter's 5 Forces not configured
            </div>
          )}
        </Widget>
      </div>

      {/* Row 3: Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Perceptual Map Preview */}
        <Widget title="Perceptual Map" icon={Map} widgetKey="perceptualMapPreview">
          {perceptualMap && perceptualMap.enabled ? (
            <div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{perceptualMap.positions?.length || 0}</div>
                  <div className="text-xs text-gray-600 mt-1">Competitors Positioned</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clusters Identified:</span>
                  <span className="font-semibold text-gray-900">{perceptualMap.clusters?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">X-Axis:</span>
                  <span className="font-semibold text-gray-900 text-xs">{perceptualMap.axes?.x?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Y-Axis:</span>
                  <span className="font-semibold text-gray-900 text-xs">{perceptualMap.axes?.y?.label}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('perceptual')}
                className="w-full mt-3 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                View Full Map →
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              Perceptual Map not configured
            </div>
          )}
        </Widget>

        {/* Benchmarking Leader */}
        <Widget title="Benchmarking Leader" icon={Award} widgetKey="benchmarkingLeader">
          {benchmarking && benchmarking.enabled ? (
            <div>
              {(() => {
                const leader = benchmarking.competitors?.sort((a: any, b: any) => b.totalScore - a.totalScore)[0];
                const eco3d = benchmarking.competitors?.find((c: any) => c.competitorId === 'eco3d');
                
                return (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="font-bold text-gray-900">{leader?.name || 'N/A'}</div>
                      <div className="text-2xl font-bold text-orange-600 mt-2">{leader?.totalScore?.toFixed(2)}/10</div>
                      <div className="text-xs text-gray-600 mt-1">Overall Score</div>
                    </div>
                    
                    {eco3d && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-700 mb-2">Eco 3D Position</div>
                        <div className="text-lg font-bold text-blue-600">{eco3d.totalScore?.toFixed(2)}/10</div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => onNavigate('benchmarking')}
                      className="w-full px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      View Radar Chart →
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              Benchmarking not configured
            </div>
          )}
        </Widget>

        {/* Recent Updates */}
        <Widget title="Recent Updates" icon={TrendingUp} widgetKey="recentUpdates">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">32 Competitors Added</div>
                <div className="text-xs text-gray-500 mt-1">All tiers completed</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Porter's 5 Forces</div>
                <div className="text-xs text-gray-500 mt-1">Industry analysis completed</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Benchmarking Data</div>
                <div className="text-xs text-gray-500 mt-1">7 competitors analyzed</div>
              </div>
            </div>
          </div>
        </Widget>
      </div>

      {/* Row 4: Full Width Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Advantages */}
        <Widget title="Eco 3D Competitive Advantages" icon={TrendingUp} widgetKey="competitiveAdvantages">
          <div className="space-y-2">
            {[
              { title: 'Automation Level', value: '9.5/10', description: 'Highest in industry' },
              { title: 'Multi-Organ Capability', value: '10/10', description: 'Only provider with full coverage' },
              { title: 'AI Integration', value: '9.0/10', description: 'Advanced AI-driven features' },
              { title: 'White Space Position', value: 'Unique', description: 'No direct competitors in quadrant' },
            ].map((adv, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-gray-900">{adv.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{adv.description}</div>
                </div>
                <div className="text-lg font-bold text-green-600">{adv.value}</div>
              </div>
            ))}
          </div>
        </Widget>

        {/* Action Items */}
        <Widget title="Strategic Action Items" icon={AlertTriangle} widgetKey="actionItems">
          <div className="space-y-3">
            {[
              { priority: 'high', task: 'Monitor GE Voluson AI Caption updates', due: 'Q4 2025' },
              { priority: 'high', task: 'Track Butterfly iQ market penetration', due: 'Monthly' },
              { priority: 'medium', task: 'Evaluate Exo Iris pMUT development', due: 'Q1 2026' },
              { priority: 'medium', task: 'Analyze GE+NVIDIA prototype progress', due: 'Q2 2026' },
              { priority: 'low', task: 'Review patent landscape (US 2024285256)', due: 'Q3 2026' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' :
                  item.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.task}</div>
                  <div className="text-xs text-gray-500 mt-1">Due: {item.due}</div>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'All Competitors', view: 'grid', icon: '🔍' },
            { label: 'SWOT Analysis', view: 'swot', icon: '⚖️' },
            { label: 'Perceptual Map', view: 'perceptual', icon: '📍' },
            { label: 'Battlecards', view: 'battlecards', icon: '⚔️' },
            { label: 'Benchmarking', view: 'benchmarking', icon: '📊' },
            { label: 'Porter\'s 5', view: 'porter5', icon: '🏛️' },
          ].map((nav) => (
            <button
              key={nav.view}
              onClick={() => onNavigate(nav.view)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center"
            >
              <div className="text-2xl mb-2">{nav.icon}</div>
              <div className="text-xs font-medium text-gray-700">{nav.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
