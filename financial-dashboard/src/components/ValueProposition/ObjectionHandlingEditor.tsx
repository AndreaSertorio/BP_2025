'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Trash2, AlertCircle, CheckCircle, Link as LinkIcon } from 'lucide-react';
import type { Objection } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { useValueProposition } from '@/hooks/useValueProposition';

interface ObjectionHandlingEditorProps {
  objections: Objection[];
}

const categoryIcons: Record<string, string> = {
  price: '💰',
  regulatory: '📋',
  technical: '⚙️',
  integration: '🔗',
  training: '🎓',
  other: '❓',
};

const categoryLabels: Record<string, string> = {
  price: 'Price',
  regulatory: 'Regulatory',
  technical: 'Technical',
  integration: 'Integration',
  training: 'Training',
  other: 'Other',
};

const frequencyColors: Record<string, string> = {
  common: 'bg-red-100 text-red-700 border-red-300',
  occasional: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  rare: 'bg-green-100 text-green-700 border-green-300',
};

export function ObjectionHandlingEditor({ objections }: ObjectionHandlingEditorProps) {
  const { updateObjection, createObjection, deleteObjection, isSaving } = useValueProposition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleObjections = objections.filter(o => o.visible !== false);
  const commonObjections = visibleObjections.filter(o => o.frequency === 'common');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Objection Handling</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {visibleObjections.length} objections
          </Badge>
          <Badge variant="destructive" className="text-xs">
            {commonObjections.length} common
          </Badge>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Objection
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Prepared responses for common customer objections. Train your sales team with these battle-tested answers.
      </p>

      {/* Common Objections (Priority) */}
      {commonObjections.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Common Objections (Priority)
          </h3>
          <div className="space-y-3">
            {commonObjections.map((objection) => (
              <ObjectionCard
                key={objection.id}
                objection={objection}
                expanded={expandedId === objection.id}
                onToggleExpand={() => setExpandedId(expandedId === objection.id ? null : objection.id)}
                onUpdate={updateObjection}
                onDelete={deleteObjection}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Objections by Category */}
      {Object.keys(categoryIcons).map(category => {
        const categoryObjections = visibleObjections.filter(
          o => o.category === category && o.frequency !== 'common'
        );
        if (categoryObjections.length === 0) return null;

        return (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-lg">{categoryIcons[category]}</span>
              {categoryLabels[category]}
            </h3>
            <div className="space-y-2">
              {categoryObjections.map((objection) => (
                <ObjectionCard
                  key={objection.id}
                  objection={objection}
                  expanded={expandedId === objection.id}
                  onToggleExpand={() => setExpandedId(expandedId === objection.id ? null : objection.id)}
                  onUpdate={updateObjection}
                  onDelete={deleteObjection}
                />
              ))}
            </div>
          </div>
        );
      })}

      {visibleObjections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No objections yet. Add common customer concerns and your responses!</p>
        </div>
      )}

      {isSaving && (
        <div className="mt-2 text-xs text-purple-600 animate-pulse">Saving changes...</div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Objection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a new objection handler, then edit inline.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await createObjection({
                    objection: 'Customer objection...',
                    category: 'price',
                    frequency: 'common',
                    response: 'Your response...',
                    proofPoints: ['Proof point 1', 'Proof point 2'],
                    resourceLinks: [],
                  });
                  setShowAddModal(false);
                }}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Usage Tip */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-700">
          <strong>💡 Sales Tip:</strong> Use these objection handlers in role-playing exercises 
          and include them in your sales playbook. Update responses based on real customer feedback.
        </p>
      </div>
    </Card>
  );
}

// Objection Card Component
interface ObjectionCardProps {
  objection: Objection;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<Objection>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function ObjectionCard({ 
  objection, 
  expanded, 
  onToggleExpand, 
  onUpdate, 
  onDelete 
}: ObjectionCardProps) {
  return (
    <div className="group relative p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
      {/* Header - Objection */}
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${frequencyColors[objection.frequency]}`}>
              {objection.frequency}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {categoryIcons[objection.category]} {categoryLabels[objection.category]}
            </Badge>
          </div>
          <InlineEditableText
            value={objection.objection}
            onSave={async (newValue) => {
              await onUpdate(objection.id, { objection: newValue });
            }}
            className="text-sm font-semibold text-gray-900 block"
            multiline
            placeholder="Customer objection..."
          />
        </div>
        <div className="flex gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-7 w-7 p-0"
          >
            {expanded ? '▼' : '▶'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm('Delete this objection?')) {
                await onDelete(objection.id);
              }
            }}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-3">
          {/* Response */}
          <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">Response:</span>
            </div>
            <InlineEditableText
              value={objection.response}
              onSave={async (newValue) => {
                await onUpdate(objection.id, { response: newValue });
              }}
              className="text-sm text-gray-700 block"
              multiline
              placeholder="Your response..."
            />
          </div>

          {/* Proof Points */}
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <span className="text-xs font-bold text-blue-700 block mb-2">📊 Proof Points:</span>
            <ul className="list-disc list-inside space-y-1">
              {objection.proofPoints.map((point, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <InlineEditableText
                    value={point}
                    onSave={async (newValue) => {
                      const newProofPoints = [...objection.proofPoints];
                      newProofPoints[index] = newValue;
                      await onUpdate(objection.id, { proofPoints: newProofPoints });
                    }}
                    className="inline"
                    placeholder="Proof point..."
                  />
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const newProofPoints = [...objection.proofPoints, 'New proof point'];
                await onUpdate(objection.id, { proofPoints: newProofPoints });
              }}
              className="mt-2 h-6 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Proof Point
            </Button>
          </div>

          {/* Resource Links (Optional) */}
          {objection.resourceLinks && objection.resourceLinks.length > 0 && (
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-bold text-purple-700">Resources:</span>
              </div>
              <ul className="space-y-1">
                {objection.resourceLinks.map((link, index) => (
                  <li key={index} className="text-xs text-blue-600 hover:underline">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
