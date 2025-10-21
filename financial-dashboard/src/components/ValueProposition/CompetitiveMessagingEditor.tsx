'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import type { CompetitiveMessage } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { useValueProposition } from '@/hooks/useValueProposition';
import { CompetitorDataSelector } from './CompetitorDataSelector';

interface CompetitiveMessagingEditorProps {
  messages: CompetitiveMessage[];
}

export function CompetitiveMessagingEditor({ messages }: CompetitiveMessagingEditorProps) {
  const { updateCompetitiveMessage, createCompetitiveMessage, deleteCompetitiveMessage, isSaving } = useValueProposition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompetitorForNew, setSelectedCompetitorForNew] = useState<{id: string, name: string} | null>(null);

  const visibleMessages = messages.filter(m => m.visible !== false);

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    await updateCompetitiveMessage(id, { visible: !currentVisibility });
  };

  const handleSelectCompetitorForMessage = (competitorId: string, competitorName: string) => {
    setSelectedCompetitorForNew({ id: competitorId, name: competitorName });
    setShowAddModal(true);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Competitive Messaging</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {visibleMessages.length} messages
          </Badge>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Message
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Messaggi pronti per confronti competitivi. Integrazione automatica con dati dalla macro sezione Competitor Analysis.
      </p>

      {/* Competitor Data Selector */}
      <div className="mb-4">
        <CompetitorDataSelector 
          onSelectCompetitor={handleSelectCompetitorForMessage}
        />
      </div>

      <div className="space-y-4">
        {visibleMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Swords className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No competitive messages yet. Add your first one!</p>
          </div>
        ) : (
          visibleMessages.map((message) => (
            <div 
              key={message.id} 
              className="group relative p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{message.competitorName}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    ID: {message.competitorId}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleVisibility(message.id, message.visible !== false)}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {message.visible !== false ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (confirm(`Delete competitive message vs ${message.competitorName}?`)) {
                        await deleteCompetitiveMessage(message.id);
                      }
                    }}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Their Strength */}
              <div className="mb-3 p-3 bg-white rounded border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-orange-700">💪 Their Strength:</span>
                </div>
                <InlineEditableText
                  value={message.theirStrength}
                  onSave={async (newValue) => {
                    await updateCompetitiveMessage(message.id, { theirStrength: newValue });
                  }}
                  className="text-sm text-gray-700"
                  multiline
                  placeholder="What they do well..."
                />
              </div>

              {/* Our Differentiator */}
              <div className="mb-3 p-3 bg-white rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-700">⚡ Our Differentiator:</span>
                </div>
                <InlineEditableText
                  value={message.ourDifferentiator}
                  onSave={async (newValue) => {
                    await updateCompetitiveMessage(message.id, { ourDifferentiator: newValue });
                  }}
                  className="text-sm text-gray-700 font-semibold"
                  multiline
                  placeholder="How Eco 3D wins..."
                />
              </div>

              {/* Proof Point */}
              <div className="mb-3 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-green-700">📊 Proof Point:</span>
                </div>
                <InlineEditableText
                  value={message.proofPoint}
                  onSave={async (newValue) => {
                    await updateCompetitiveMessage(message.id, { proofPoint: newValue });
                  }}
                  className="text-sm text-gray-700"
                  multiline
                  placeholder="Evidence, data, case study..."
                />
              </div>

              {/* When to Use */}
              <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="text-xs font-semibold text-yellow-700">💡 When to use: </span>
                <InlineEditableText
                  value={message.whenToUse}
                  onSave={async (newValue) => {
                    await updateCompetitiveMessage(message.id, { whenToUse: newValue });
                  }}
                  className="text-xs text-gray-700 inline"
                  placeholder="Sales situations, objections..."
                />
              </div>
            </div>
          ))
        )}
      </div>

      {isSaving && (
        <div className="mt-2 text-xs text-orange-600 animate-pulse">Saving changes...</div>
      )}

      {/* Add Modal (Simple version - full modal can be created separately) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Competitive Message</h3>
            {selectedCompetitorForNew ? (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  Creating message for: <strong>{selectedCompetitorForNew.name}</strong>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Create a new message by clicking Add, then edit inline.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await createCompetitiveMessage({
                    competitorId: selectedCompetitorForNew?.id || 'new-competitor',
                    competitorName: selectedCompetitorForNew?.name || 'New Competitor',
                    theirStrength: 'Their strength...',
                    ourDifferentiator: 'Our differentiator...',
                    proofPoint: 'Proof point...',
                    whenToUse: 'When to use this message...',
                  });
                  setShowAddModal(false);
                  setSelectedCompetitorForNew(null);
                }}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCompetitorForNew(null);
                }}
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
          <strong>💡 Integration:</strong> These messages are automatically synced with competitor data 
          from the Competitor Analysis section. Use competitorId to link specific battlecards.
        </p>
      </div>
    </Card>
  );
}
