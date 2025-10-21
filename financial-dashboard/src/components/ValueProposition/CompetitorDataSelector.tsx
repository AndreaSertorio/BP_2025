'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ChevronRight, Building2, TrendingUp } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { useRouter } from 'next/navigation';

interface CompetitorDataSelectorProps {
  currentCompetitorId?: string;
  onSelectCompetitor?: (competitorId: string, competitorName: string) => void;
}

export function CompetitorDataSelector({ currentCompetitorId, onSelectCompetitor }: CompetitorDataSelectorProps) {
  const { data } = useDatabase();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const competitors = data?.competitorAnalysis?.competitors || [];
  const currentCompetitor = competitors.find(c => c.id === currentCompetitorId);

  const handleViewCompetitorAnalysis = () => {
    router.push('/?tab=competitor-analysis');
  };

  const handleSelectCompetitor = (competitor: any) => {
    if (onSelectCompetitor) {
      onSelectCompetitor(competitor.id, competitor.name);
    }
    setShowDropdown(false);
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Link to Competitor Analysis</h3>
            <Badge variant="outline" className="text-xs bg-white">
              {competitors.length} competitors
            </Badge>
          </div>

          {currentCompetitor ? (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Currently linked to:</p>
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                <span className="text-sm font-semibold text-gray-900">{currentCompetitor.name}</span>
                <Badge variant="outline" className="text-xs">
                  {currentCompetitor.category}
                </Badge>
                {currentCompetitor.marketShare && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {currentCompetitor.marketShare}% share
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600 mb-3">
              Select a competitor from the analysis section to auto-populate data
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewCompetitorAnalysis}
              className="h-8 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Analysis
            </Button>

            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-8 text-xs"
              >
                Select Competitor
                <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showDropdown ? 'rotate-90' : ''}`} />
              </Button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {competitors.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500 text-center">
                      No competitors found. Add them in Competitor Analysis section.
                    </div>
                  ) : (
                    competitors.map((competitor: any) => (
                      <button
                        key={competitor.id}
                        onClick={() => handleSelectCompetitor(competitor)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{competitor.name}</div>
                            <div className="text-xs text-gray-500">{competitor.category}</div>
                          </div>
                          {competitor.id === currentCompetitorId && (
                            <Badge variant="default" className="text-xs bg-blue-600">
                              Current
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-white rounded border border-blue-100">
        <p className="text-xs text-gray-700">
          <strong>💡 Tip:</strong> Data from Competitor Analysis automatically syncs. 
          Update competitor info in the dedicated section to see changes here.
        </p>
      </div>
    </Card>
  );
}
