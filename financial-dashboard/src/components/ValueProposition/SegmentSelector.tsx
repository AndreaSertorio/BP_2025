'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Plus, Check, Trash2, Edit2 } from 'lucide-react';
import type { CustomerSegment } from '@/types/valueProposition';

interface SegmentSelectorProps {
  segments: CustomerSegment[];
  activeSegmentId?: string;
  onSelectSegment: (segmentId: string) => void;
  onCreateSegment: () => void;
  onDeleteSegment: (segmentId: string) => void;
  onEditSegment?: (segmentId: string) => void;
}

export function SegmentSelector({
  segments,
  activeSegmentId,
  onSelectSegment,
  onCreateSegment,
  onDeleteSegment,
  onEditSegment,
}: SegmentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeSegment = segments.find(s => s.id === activeSegmentId) || segments[0];

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '🔴 High';
      case 'medium':
        return '🟡 Medium';
      case 'low':
        return '🟢 Low';
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Users className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Customer Segment</div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {activeSegment?.icon && <span>{activeSegment.icon}</span>}
              <span>{activeSegment?.name || 'No segment selected'}</span>
              <span className="text-sm">{isExpanded ? '▲' : '▼'}</span>
            </button>
            {activeSegment && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(activeSegment.priority)}`}>
                  {getPriorityBadge(activeSegment.priority)}
                </span>
                <span className="text-xs text-gray-500">
                  {activeSegment.jobs.length} Jobs • {activeSegment.pains.length} Pains • {activeSegment.gains.length} Gains
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onCreateSegment}
          size="sm"
          variant="outline"
          className="ml-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Segment
        </Button>
      </div>

      {/* Expanded Segments List */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => {
                  onSelectSegment(segment.id);
                  setIsExpanded(false);
                }}
                className={`
                  group relative p-4 rounded-lg border-2 text-left transition-all
                  ${segment.id === activeSegmentId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                  }
                `}
              >
                {/* Active indicator */}
                {segment.id === activeSegmentId && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                {/* Delete button */}
                {segments.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete segment "${segment.name}"?`)) {
                        onDeleteSegment(segment.id);
                      }
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
                )}

                {/* Edit button */}
                {onEditSegment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSegment(segment.id);
                    }}
                    className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                  >
                    <Edit2 className="h-3 w-3 text-blue-500" />
                  </button>
                )}

                {/* Icon & Name */}
                <div className="flex items-center gap-2 mb-2">
                  {segment.icon && <span className="text-2xl">{segment.icon}</span>}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{segment.name}</div>
                    <div className={`text-xs px-1.5 py-0.5 rounded inline-block ${getPriorityColor(segment.priority)}`}>
                      {segment.priority}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-3">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{segment.jobs.filter(j => j.visible !== false).length}</div>
                    <div>Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{segment.pains.filter(p => p.visible !== false).length}</div>
                    <div>Pains</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{segment.gains.filter(g => g.visible !== false).length}</div>
                    <div>Gains</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {segments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No segments yet. Create your first customer segment!</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
