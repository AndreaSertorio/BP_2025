'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';
import type { ValueProposition, Competitor } from '@/types/valueProposition';
import { useValueProposition } from '@/hooks/useValueProposition';

interface CompetitorRadarChartProps {
  data: ValueProposition;
}

export function CompetitorRadarChart({ data }: CompetitorRadarChartProps) {
  const { competitors, attributeDefinitions } = data.competitorAnalysis;
  const { updateCompetitor, isSaving } = useValueProposition();
  const visibleCompetitors = competitors.filter(c => c.visible !== false);
  const ownCompetitor = competitors.find(c => c.isOwn);
  
  // Get all attribute keys
  const attributes = Object.keys(attributeDefinitions);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Competitor Analysis</h2>
              <p className="text-sm text-gray-600">Confronto multi-dimensionale</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {visibleCompetitors.length} competitors
          </Badge>
        </div>
      </Card>

      {/* Competitor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleCompetitors.map((competitor: Competitor) => (
          <Card 
            key={competitor.id} 
            className={`p-6 ${
              competitor.isOwn 
                ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300' 
                : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{competitor.name}</h3>
                <p className="text-sm text-gray-600">{competitor.type}</p>
              </div>
              {competitor.isOwn && (
                <Badge variant="default" className="bg-blue-600">
                  Eco 3D
                </Badge>
              )}
            </div>

            {competitor.notes && (
              <p className="text-xs text-gray-600 mb-4 italic">💡 {competitor.notes}</p>
            )}

            <div className="space-y-2">
              {attributes.map(attr => {
                const value = competitor.attributes[attr] || 0;
                const definition = attributeDefinitions[attr];
                const percentage = (value / 5) * 100;
                
                return (
                  <div key={attr}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{definition.label}</span>
                      <span className="font-semibold">{value}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 relative group">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          competitor.isOwn 
                            ? 'bg-blue-600' 
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      {/* Interactive slider overlay */}
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={value}
                        onChange={async (e) => {
                          const newValue = parseInt(e.target.value);
                          const newAttributes = { ...competitor.attributes, [attr]: newValue };
                          await updateCompetitor(competitor.id, { attributes: newAttributes });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer group-hover:opacity-100"
                        title={`Click to edit ${definition.label}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {isSaving && (
              <div className="mt-2 text-xs text-blue-600 animate-pulse">Saving changes...</div>
            )}
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">Comparative Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 font-bold text-gray-900">Attribute</th>
                {visibleCompetitors.map(comp => (
                  <th 
                    key={comp.id} 
                    className={`text-center py-3 px-2 font-bold ${
                      comp.isOwn ? 'text-blue-600 bg-blue-50' : 'text-gray-900'
                    }`}
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributes.map(attr => {
                const definition = attributeDefinitions[attr];
                return (
                  <tr key={attr} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-semibold text-gray-900">{definition.label}</div>
                        {definition.description && (
                          <div className="text-xs text-gray-500">{definition.description}</div>
                        )}
                      </div>
                    </td>
                    {visibleCompetitors.map(comp => {
                      const value = comp.attributes[attr] || 0;
                      const isMax = visibleCompetitors.every(c => (c.attributes[attr] || 0) <= value);
                      
                      return (
                        <td 
                          key={comp.id} 
                          className={`text-center py-3 px-2 ${
                            comp.isOwn ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                            isMax && value > 0 
                              ? 'bg-green-100 text-green-700 font-bold' 
                              : 'text-gray-700'
                          }`}>
                            {value}/5
                            {isMax && value > 0 && ' 👑'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Eco 3D Advantages */}
      {ownCompetitor && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Eco 3D Competitive Advantages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attributes.map(attr => {
              const ownValue = ownCompetitor.attributes[attr] || 0;
              const maxOthers = Math.max(...competitors.filter(c => !c.isOwn).map(c => c.attributes[attr] || 0));
              
              if (ownValue > maxOthers) {
                const definition = attributeDefinitions[attr];
                return (
                  <div key={attr} className="flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                    <Badge variant="default" className="bg-green-600">
                      {ownValue}/5
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">
                      {definition.label}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
