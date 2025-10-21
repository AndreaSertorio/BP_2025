'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, Star, Award } from 'lucide-react';
import type { ValueProposition } from '@/types/valueProposition';

interface ValuePropositionStatsProps {
  data: ValueProposition;
}

export function ValuePropositionStats({ data }: ValuePropositionStatsProps) {
  const activeSegment = data.customerProfile.segments.find(
    s => s.id === data.customerProfile.activeSegmentId
  ) || data.customerProfile.segments[0];

  if (!activeSegment) return null;

  const product = data.valueMap.productsAndServices[0];

  // Calculate statistics
  const stats = {
    totalJobs: activeSegment.jobs.filter(j => j.visible !== false).length,
    highPriorityJobs: activeSegment.jobs.filter(j => j.visible !== false && j.importance >= 4).length,
    totalPains: activeSegment.pains.filter(p => p.visible !== false).length,
    severePains: activeSegment.pains.filter(p => p.visible !== false && p.severity >= 4).length,
    totalGains: activeSegment.gains.filter(g => g.visible !== false).length,
    highImpactGains: activeSegment.gains.filter(g => g.visible !== false && g.impact >= 4).length,
    totalFeatures: product?.features.filter(f => f.visible !== false).length || 0,
    coreFeatures: product?.features.filter(f => f.visible !== false && f.category === 'core').length || 0,
    totalPainRelievers: data.valueMap.painRelievers.filter(pr => pr.visible !== false).length,
    effectivePainRelievers: data.valueMap.painRelievers.filter(pr => pr.visible !== false && pr.effectiveness >= 4).length,
    totalGainCreators: data.valueMap.gainCreators.filter(gc => gc.visible !== false).length,
    highMagnitudeGainCreators: data.valueMap.gainCreators.filter(gc => gc.visible !== false && gc.magnitude >= 4).length,
  };

  // Calculate fit score (0-100)
  const calculateFitScore = () => {
    const painCoverage = stats.totalPains > 0 ? (stats.effectivePainRelievers / stats.totalPains) * 100 : 0;
    const gainCoverage = stats.totalGains > 0 ? (stats.highMagnitudeGainCreators / stats.totalGains) * 100 : 0;
    const jobCoverage = stats.totalJobs > 0 ? (stats.totalFeatures / stats.totalJobs) * 100 : 0;
    
    // Weighted average
    const fitScore = (painCoverage * 0.4) + (gainCoverage * 0.3) + (jobCoverage * 0.3);
    return Math.min(Math.round(fitScore), 100);
  };

  const fitScore = calculateFitScore();

  const getFitScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-4">
      {/* Fit Score Card */}
      <Card className={`p-6 border-2 ${getFitScoreColor(fitScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8" />
            <div>
              <h3 className="text-2xl font-bold">{fitScore}%</h3>
              <p className="text-sm font-semibold">Product-Market Fit Score</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={fitScore >= 70 ? 'default' : 'secondary'} className="text-sm">
              {fitScore >= 80 ? '🎯 Strong Fit' : fitScore >= 60 ? '✅ Good Fit' : fitScore >= 40 ? '⚠️ Needs Work' : '🔴 Weak Fit'}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold">Pain Coverage</div>
            <div className="text-lg">{stats.totalPains > 0 ? Math.round((stats.effectivePainRelievers / stats.totalPains) * 100) : 0}%</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold">Gain Coverage</div>
            <div className="text-lg">{stats.totalGains > 0 ? Math.round((stats.highMagnitudeGainCreators / stats.totalGains) * 100) : 0}%</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold">Job Coverage</div>
            <div className="text-lg">{stats.totalJobs > 0 ? Math.round((stats.totalFeatures / stats.totalJobs) * 100) : 0}%</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Jobs Stats */}
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">Jobs</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalJobs}</div>
          <div className="text-xs text-blue-700 mt-1">
            {stats.highPriorityJobs} alta priorità
          </div>
        </Card>

        {/* Pains Stats */}
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-red-600" />
            <span className="text-xs font-bold text-red-900">Pains</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.totalPains}</div>
          <div className="text-xs text-red-700 mt-1">
            {stats.severePains} severi → {stats.effectivePainRelievers} risolti
          </div>
        </Card>

        {/* Gains Stats */}
        <Card className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-bold text-green-900">Gains</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.totalGains}</div>
          <div className="text-xs text-green-700 mt-1">
            {stats.highImpactGains} alto impatto → {stats.highMagnitudeGainCreators} attivati
          </div>
        </Card>

        {/* Features Stats */}
        <Card className="p-4 bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-900">Features</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.totalFeatures}</div>
          <div className="text-xs text-purple-700 mt-1">
            {stats.coreFeatures} core features
          </div>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <h4 className="font-bold text-sm text-gray-900 mb-2">💡 Quick Insights</h4>
        <div className="space-y-1 text-xs text-gray-700">
          {stats.severePains > stats.effectivePainRelievers && (
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span><strong>{stats.severePains - stats.effectivePainRelievers}</strong> pains severi non ancora risolti</span>
            </div>
          )}
          {stats.highImpactGains > stats.highMagnitudeGainCreators && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span><strong>{stats.highImpactGains - stats.highMagnitudeGainCreators}</strong> gains ad alto impatto senza gain creators</span>
            </div>
          )}
          {stats.highPriorityJobs > stats.totalFeatures && (
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💭</span>
              <span>Considera di aggiungere features per <strong>{stats.highPriorityJobs - stats.totalFeatures}</strong> jobs critici</span>
            </div>
          )}
          {fitScore >= 80 && (
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span><strong>Excellent fit!</strong> Value proposition ben allineata al customer profile</span>
            </div>
          )}
        </div>
      </Card>

      {/* Competitive Edge */}
      {data.competitorAnalysis && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
          <h4 className="font-bold text-sm text-gray-900 mb-2">🏆 Competitive Edge</h4>
          <div className="text-xs text-gray-700">
            {data.competitorAnalysis.competitors.filter(c => c.visible !== false).length} competitors analizzati
            {data.competitorAnalysis.competitors.find(c => c.isOwn) && (
              <div className="mt-1">
                <Badge variant="default" className="text-xs">
                  Eco 3D posizionamento competitivo disponibile
                </Badge>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
