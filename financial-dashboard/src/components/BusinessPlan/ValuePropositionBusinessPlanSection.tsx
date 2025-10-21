'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Briefcase, Frown, Smile, Package, Zap, TrendingUp, MessageSquare } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import type { Job, Pain, Gain, Feature, PainReliever, GainCreator } from '@/types/valueProposition';
import { SCORE_INDICATORS, SEVERITY_INDICATORS } from '@/types/valueProposition';

export function ValuePropositionBusinessPlanSection() {
  const { data } = useDatabase();
  const vpData = data?.valueProposition;

  if (!vpData) {
    return (
      <Card className="p-6 bg-gray-50">
        <p className="text-sm text-gray-600 italic">
          La sezione Value Proposition non è ancora configurata.
        </p>
      </Card>
    );
  }

  const activeSegment = vpData.customerProfile.segments.find(
    s => s.id === vpData.customerProfile.activeSegmentId
  ) || vpData.customerProfile.segments[0];

  const product = vpData.valueMap.productsAndServices[0];

  const renderScoreStars = (score: 1 | 2 | 3 | 4 | 5) => {
    const indicator = SCORE_INDICATORS[score];
    return <span className={`text-xs ${indicator.color}`}>{indicator.stars}</span>;
  };

  const renderSeverity = (score: 1 | 2 | 3 | 4 | 5) => {
    return <span className="text-xs">{SEVERITY_INDICATORS[score]}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Elevator Pitch Highlight */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Elevator Pitch</h3>
          <Badge variant="outline" className="ml-auto">
            {vpData.messaging.elevatorPitch.targetAudience}
          </Badge>
        </div>
        <p className="text-lg leading-relaxed text-gray-800 font-medium">
          "{vpData.messaging.elevatorPitch.content}"
        </p>
        <div className="mt-3 text-xs text-gray-600">
          <strong>Target:</strong> {vpData.messaging.elevatorPitch.targetAudience} • 
          <strong> Tone:</strong> {vpData.messaging.elevatorPitch.tone}
        </div>
      </Card>

      {/* Customer Profile Summary */}
      {activeSegment && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Customer Profile</h3>
            <Badge variant="secondary" className="ml-auto">
              {activeSegment.name}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Jobs */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm text-gray-900">Jobs to Be Done</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {activeSegment.jobs.filter(j => j.visible !== false).length}
                </Badge>
              </div>
              <ul className="space-y-2">
                {activeSegment.jobs.filter(j => j.visible !== false).slice(0, 3).map((job: Job) => (
                  <li key={job.id} className="text-xs text-gray-700">
                    <div className="flex items-start gap-1">
                      <span className="mt-1">•</span>
                      <span className="flex-1">{job.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <span className="text-gray-500">Importance:</span>
                      {renderScoreStars(job.importance)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pains */}
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Frown className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-sm text-gray-900">Pains</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {activeSegment.pains.filter(p => p.visible !== false).length}
                </Badge>
              </div>
              <ul className="space-y-2">
                {activeSegment.pains.filter(p => p.visible !== false).slice(0, 3).map((pain: Pain) => (
                  <li key={pain.id} className="text-xs text-gray-700">
                    <div className="flex items-start gap-1">
                      <span className="mt-1">•</span>
                      <span className="flex-1">{pain.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <span className="text-gray-500">Severity:</span>
                      {renderSeverity(pain.severity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gains */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Smile className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm text-gray-900">Gains</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {activeSegment.gains.filter(g => g.visible !== false).length}
                </Badge>
              </div>
              <ul className="space-y-2">
                {activeSegment.gains.filter(g => g.visible !== false).slice(0, 3).map((gain: Gain) => (
                  <li key={gain.id} className="text-xs text-gray-700">
                    <div className="flex items-start gap-1">
                      <span className="mt-1">•</span>
                      <span className="flex-1">{gain.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <span className="text-gray-500">Impact:</span>
                      {renderScoreStars(gain.impact)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Value Map Summary */}
      {product && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-gray-900">Value Map</h3>
            <Badge variant="secondary" className="ml-auto">
              {product.name}
            </Badge>
          </div>

          {/* Key Features */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Core Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.filter(f => f.visible !== false && f.category === 'core').map((feature: Feature) => (
                <div key={feature.id} className="flex items-start gap-2 p-2 bg-green-50 rounded text-xs">
                  <Badge variant="default" className="text-xs bg-green-600 shrink-0">Core</Badge>
                  <div>
                    <div className="font-semibold text-gray-900">{feature.name}</div>
                    {feature.description && (
                      <div className="text-gray-600 mt-1">{feature.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Differentiating Features */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Differentiating Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.filter(f => f.visible !== false && f.category === 'differentiating').map((feature: Feature) => (
                <div key={feature.id} className="flex items-start gap-2 p-2 bg-purple-50 rounded text-xs">
                  <Badge variant="secondary" className="text-xs shrink-0">Diff</Badge>
                  <div>
                    <div className="font-semibold text-gray-900">{feature.name}</div>
                    {feature.description && (
                      <div className="text-gray-600 mt-1">{feature.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Pain Relievers & Gain Creators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Relievers */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-gray-900">Pain Relievers</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {vpData.valueMap.painRelievers.filter(pr => pr.visible !== false).length}
            </Badge>
          </div>
          <ul className="space-y-3">
            {vpData.valueMap.painRelievers.filter(pr => pr.visible !== false).map((reliever: PainReliever) => (
              <li key={reliever.id} className="p-3 bg-orange-50 rounded-lg text-xs">
                <div className="font-semibold text-gray-900 mb-1">{reliever.description}</div>
                {reliever.proof && (
                  <div className="text-gray-600 italic">📊 {reliever.proof}</div>
                )}
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-gray-500">Effectiveness:</span>
                  {renderScoreStars(reliever.effectiveness)}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Gain Creators */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">Gain Creators</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {vpData.valueMap.gainCreators.filter(gc => gc.visible !== false).length}
            </Badge>
          </div>
          <ul className="space-y-3">
            {vpData.valueMap.gainCreators.filter(gc => gc.visible !== false).map((creator: GainCreator) => (
              <li key={creator.id} className="p-3 bg-purple-50 rounded-lg text-xs">
                <div className="font-semibold text-gray-900 mb-1">{creator.description}</div>
                {creator.proof && (
                  <div className="text-gray-600 italic">📊 {creator.proof}</div>
                )}
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-gray-500">Magnitude:</span>
                  {renderScoreStars(creator.magnitude)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Competitive Positioning */}
      {vpData.competitorAnalysis && vpData.competitorAnalysis.competitors.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50">
          <h3 className="font-bold text-gray-900 mb-3">Competitive Positioning</h3>
          <p className="text-sm text-gray-700 mb-3">
            Eco 3D si posiziona strategicamente nel mercato con un approccio unico che combina:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(vpData.competitorAnalysis.attributeDefinitions).slice(0, 4).map(([key, def]) => {
              const ownCompetitor = vpData.competitorAnalysis.competitors.find(c => c.isOwn);
              const value = ownCompetitor?.attributes[key] || 0;
              return (
                <div key={key} className="p-3 bg-white rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{value}/5</div>
                  <div className="text-xs text-gray-600 mt-1">{def.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
