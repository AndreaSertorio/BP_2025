'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Frown, Smile, Package, Zap, TrendingUp, ArrowRight, Plus, Trash2 } from 'lucide-react';
import type { ValueProposition, Job, Pain, Gain, Feature, PainReliever, GainCreator } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { ScoreEditor, SeverityEditor } from './ScoreEditor';
import { useValueProposition } from '@/hooks/useValueProposition';
import { showSaveError, showCreateSuccess, showDeleteWithUndo } from '@/lib/toast-config';
import { AddItemModal } from './AddItemModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SegmentSelector } from './SegmentSelector';
import { CreateSegmentModal } from './CreateSegmentModal';

interface ValuePropositionCanvasProps {
  data: ValueProposition;
}

export function ValuePropositionCanvas({ data }: ValuePropositionCanvasProps) {
  const { 
    updateJob, updatePain, updateGain, updateFeature, updatePainReliever, updateGainCreator,
    createJob, createPain, createGain,
    deleteJob, deletePain, deleteGain,
    createSegment, deleteSegment, setActiveSegment,
    isSaving 
  } = useValueProposition();
  
  // Modal states
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddPainModal, setShowAddPainModal] = useState(false);
  const [showAddGainModal, setShowAddGainModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{type: string, id: string, desc: string} | null>(null);
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
  
  const activeSegment = data.customerProfile.segments.find(
    s => s.id === data.customerProfile.activeSegmentId
  ) || data.customerProfile.segments[0];

  if (!activeSegment) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Nessun customer segment disponibile</p>
      </Card>
    );
  }

  const product = data.valueMap.productsAndServices[0];

  const findLinkedPain = (painId: string) => {
    return activeSegment.pains.find(p => p.id === painId);
  };

  const findLinkedGain = (gainId: string) => {
    return activeSegment.gains.find(g => g.id === gainId);
  };

  return (
    <div>
      {/* SEGMENT SELECTOR */}
      <SegmentSelector
        segments={data.customerProfile.segments}
        activeSegmentId={data.customerProfile.activeSegmentId}
        onSelectSegment={(segmentId) => {
          setActiveSegment(segmentId).catch(err => {
            console.error('Error setting active segment:', err);
            showSaveError();
          });
        }}
        onCreateSegment={() => setShowCreateSegmentModal(true)}
        onDeleteSegment={(segmentId) => {
          deleteSegment(segmentId).catch(err => {
            console.error('Error deleting segment:', err);
            showSaveError();
          });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: CUSTOMER PROFILE */}
        <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{activeSegment.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Profile</h2>
              <p className="text-sm text-gray-600">{activeSegment.name}</p>
            </div>
            <Badge variant={activeSegment.priority === 'high' ? 'default' : 'secondary'} className="ml-auto">
              {activeSegment.priority}
            </Badge>
          </div>
        </Card>

        {/* JOBS TO BE DONE */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Jobs to Be Done</h3>
            <Badge variant="outline" className="text-xs">
              {activeSegment.jobs.filter(j => j.visible !== false).length}
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddJobModal(true)}
              className="ml-auto h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Job
            </Button>
          </div>
          
          <div className="space-y-3">
            {activeSegment.jobs.filter(j => j.visible !== false).map((job: Job) => (
              <div key={job.id} className="group relative p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteItem({type: 'Job', id: job.id, desc: job.description})}
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
                <div className="flex items-start gap-2 mb-2">
                  <InlineEditableText
                    value={job.description}
                    onSave={async (newValue) => {
                      await updateJob(job.id, { description: newValue });
                    }}
                    className="text-sm flex-1"
                    multiline
                  />
                </div>
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <ScoreEditor
                    value={job.importance}
                    onChange={(newValue) => {
                      updateJob(job.id, { importance: newValue }).catch(err => {
                        console.error('Error updating job importance:', err);
                        showSaveError();
                      });
                    }}
                    label="Importance:"
                    showNumeric
                  />
                  <ScoreEditor
                    value={job.difficulty}
                    onChange={(newValue) => {
                      updateJob(job.id, { difficulty: newValue }).catch(err => {
                        console.error('Error updating job difficulty:', err);
                        showSaveError();
                      });
                    }}
                    label="Difficulty:"
                    showNumeric
                  />
                  <Badge variant="outline" className="text-xs">
                    {job.category}
                  </Badge>
                </div>
                {job.notes && (
                  <InlineEditableText
                    value={job.notes}
                    onSave={async (newValue) => {
                      await updateJob(job.id, { notes: newValue });
                    }}
                    className="text-xs text-gray-600 mt-2 italic"
                    placeholder="Add notes..."
                  />
                )}
              </div>
            ))}
          </div>
          {isSaving && (
            <div className="mt-2 text-xs text-blue-600 animate-pulse">Saving changes...</div>
          )}
        </Card>

        {/* PAINS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Frown className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-gray-900">Pains</h3>
            <Badge variant="outline" className="text-xs">
              {activeSegment.pains.filter(p => p.visible !== false).length}
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddPainModal(true)}
              className="ml-auto h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Pain
            </Button>
          </div>
          
          <div className="space-y-3">
            {activeSegment.pains.filter(p => p.visible !== false).map((pain: Pain) => (
              <div key={pain.id} className="group relative p-3 bg-red-50 rounded-lg border border-red-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteItem({type: 'Pain', id: pain.id, desc: pain.description})}
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
                <div className="flex items-start gap-2 mb-2">
                  <InlineEditableText
                    value={pain.description}
                    onSave={async (newValue) => {
                      await updatePain(pain.id, { description: newValue });
                    }}
                    className="text-sm flex-1"
                    multiline
                  />
                </div>
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <SeverityEditor
                    value={pain.severity}
                    onChange={(newValue) => {
                      updatePain(pain.id, { severity: newValue }).catch(err => {
                        console.error('Error updating pain severity:', err);
                        showSaveError();
                      });
                    }}
                    label="Severity:"
                  />
                  <ScoreEditor
                    value={pain.frequency}
                    onChange={(newValue) => {
                      updatePain(pain.id, { frequency: newValue }).catch(err => {
                        console.error('Error updating pain frequency:', err);
                        showSaveError();
                      });
                    }}
                    label="Frequency:"
                    showNumeric
                  />
                  <Badge variant="outline" className="text-xs">
                    {pain.category}
                  </Badge>
                </div>
                {pain.notes && (
                  <InlineEditableText
                    value={pain.notes}
                    onSave={async (newValue) => {
                      await updatePain(pain.id, { notes: newValue });
                    }}
                    className="text-xs text-gray-600 mt-2 italic"
                    placeholder="Add notes..."
                  />
                )}
              </div>
            ))}
          </div>
          {isSaving && (
            <div className="mt-2 text-xs text-red-600 animate-pulse">Saving changes...</div>
          )}
        </Card>

        {/* GAINS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-gray-900">Gains</h3>
            <Badge variant="outline" className="text-xs">
              {activeSegment.gains.filter(g => g.visible !== false).length}
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddGainModal(true)}
              className="ml-auto h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Gain
            </Button>
          </div>
          
          <div className="space-y-3">
            {activeSegment.gains.filter(g => g.visible !== false).map((gain: Gain) => (
              <div key={gain.id} className="group relative p-3 bg-green-50 rounded-lg border border-green-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteItem({type: 'Gain', id: gain.id, desc: gain.description})}
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
                <div className="flex items-start gap-2 mb-2">
                  <InlineEditableText
                    value={gain.description}
                    onSave={async (newValue) => {
                      await updateGain(gain.id, { description: newValue });
                    }}
                    className="text-sm flex-1"
                    multiline
                  />
                </div>
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <ScoreEditor
                    value={gain.desirability}
                    onChange={(newValue) => {
                      updateGain(gain.id, { desirability: newValue }).catch(err => {
                        console.error('Error updating gain desirability:', err);
                        showSaveError();
                      });
                    }}
                    label="Desirability:"
                    showNumeric
                  />
                  <ScoreEditor
                    value={gain.impact}
                    onChange={(newValue) => {
                      updateGain(gain.id, { impact: newValue }).catch(err => {
                        console.error('Error updating gain impact:', err);
                        showSaveError();
                      });
                    }}
                    label="Impact:"
                    showNumeric
                  />
                  <Badge variant="outline" className="text-xs">
                    {gain.category}
                  </Badge>
                </div>
                {gain.notes && (
                  <InlineEditableText
                    value={gain.notes}
                    onSave={async (newValue) => {
                      await updateGain(gain.id, { notes: newValue });
                    }}
                    className="text-xs text-gray-600 mt-2 italic"
                    placeholder="Add notes..."
                  />
                )}
              </div>
            ))}
          </div>
          {isSaving && (
            <div className="mt-2 text-xs text-green-600 animate-pulse">Saving changes...</div>
          )}
        </Card>
      </div>

      {/* RIGHT SIDE: VALUE MAP */}
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{product?.icon || '🎁'}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Value Map</h2>
              <p className="text-sm text-gray-600">{product?.name || 'Prodotti e Servizi'}</p>
            </div>
          </div>
        </Card>

        {/* PRODUCTS & FEATURES */}
        {product && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Features</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {product.features.filter(f => f.visible !== false).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {product.features.filter(f => f.visible !== false).map((feature: Feature) => (
                <div key={feature.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2 mb-2">
                    <InlineEditableText
                      value={feature.name}
                      onSave={async (newValue) => {
                        await updateFeature(feature.id, { name: newValue });
                      }}
                      className="text-sm font-semibold flex-1"
                    />
                    <Badge 
                      variant={feature.category === 'core' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {feature.category}
                    </Badge>
                  </div>
                  {feature.description && (
                    <InlineEditableText
                      value={feature.description}
                      onSave={async (newValue) => {
                        await updateFeature(feature.id, { description: newValue });
                      }}
                      className="text-xs text-gray-600 mb-1"
                      placeholder="Add description..."
                    />
                  )}
                  {feature.technicalSpec && (
                    <InlineEditableText
                      value={feature.technicalSpec}
                      onSave={async (newValue) => {
                        await updateFeature(feature.id, { technicalSpec: newValue });
                      }}
                      className="text-xs text-gray-500 italic"
                      placeholder="Add technical spec..."
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* PAIN RELIEVERS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-gray-900">Pain Relievers</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {data.valueMap.painRelievers.filter(pr => pr.visible !== false).length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {data.valueMap.painRelievers.filter(pr => pr.visible !== false).map((reliever: PainReliever) => {
              const linkedPain = findLinkedPain(reliever.linkedPainId);
              return (
                <div key={reliever.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2 mb-2">
                    <InlineEditableText
                      value={reliever.description}
                      onSave={async (newValue) => {
                        await updatePainReliever(reliever.id, { description: newValue });
                      }}
                      className="text-sm flex-1"
                      multiline
                    />
                  </div>
                  
                  {linkedPain && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 p-2 bg-white rounded">
                      <Frown className="h-3 w-3 text-red-500" />
                      <span className="flex-1">{linkedPain.description}</span>
                      <ArrowRight className="h-3 w-3 text-orange-500" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs">
                    <ScoreEditor
                      value={reliever.effectiveness}
                      onChange={(newValue) => {
                        updatePainReliever(reliever.id, { effectiveness: newValue }).catch(err => {
                          console.error('Error updating pain reliever effectiveness:', err);
                          showSaveError();
                        });
                      }}
                      label="Effectiveness:"
                      showNumeric
                    />
                  </div>
                  
                  {reliever.proof && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <span className="text-xs font-semibold text-gray-700">📊 Proof: </span>
                      <InlineEditableText
                        value={reliever.proof}
                        onSave={async (newValue) => {
                          await updatePainReliever(reliever.id, { proof: newValue });
                        }}
                        className="text-xs text-gray-600 inline"
                        placeholder="Add proof..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* GAIN CREATORS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">Gain Creators</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {data.valueMap.gainCreators.filter(gc => gc.visible !== false).length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {data.valueMap.gainCreators.filter(gc => gc.visible !== false).map((creator: GainCreator) => {
              const linkedGain = findLinkedGain(creator.linkedGainId);
              return (
                <div key={creator.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <InlineEditableText
                      value={creator.description}
                      onSave={async (newValue) => {
                        await updateGainCreator(creator.id, { description: newValue });
                      }}
                      className="text-sm flex-1"
                      multiline
                    />
                  </div>
                  
                  {linkedGain && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 p-2 bg-white rounded">
                      <Smile className="h-3 w-3 text-green-500" />
                      <span className="flex-1">{linkedGain.description}</span>
                      <ArrowRight className="h-3 w-3 text-purple-500" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs">
                    <ScoreEditor
                      value={creator.magnitude}
                      onChange={(newValue) => {
                        updateGainCreator(creator.id, { magnitude: newValue }).catch(err => {
                          console.error('Error updating gain creator magnitude:', err);
                          showSaveError();
                        });
                      }}
                      label="Magnitude:"
                      showNumeric
                    />
                  </div>
                  
                  {creator.proof && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <span className="text-xs font-semibold text-gray-700">📊 Proof: </span>
                      <InlineEditableText
                        value={creator.proof}
                        onSave={async (newValue) => {
                          await updateGainCreator(creator.id, { proof: newValue });
                        }}
                        className="text-xs text-gray-600 inline"
                        placeholder="Add proof..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* MODALS */}
      <AddItemModal
        isOpen={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onSubmit={async (data) => {
          await createJob(data);
          showCreateSuccess('Job');
        }}
        itemType="job"
        title="Add New Job"
      />

      <AddItemModal
        isOpen={showAddPainModal}
        onClose={() => setShowAddPainModal(false)}
        onSubmit={async (data) => {
          await createPain(data);
          showCreateSuccess('Pain');
        }}
        itemType="pain"
        title="Add New Pain"
      />

      <AddItemModal
        isOpen={showAddGainModal}
        onClose={() => setShowAddGainModal(false)}
        onSubmit={async (data) => {
          await createGain(data);
          showCreateSuccess('Gain');
        }}
        itemType="gain"
        title="Add New Gain"
      />

      <DeleteConfirmModal
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (!deleteItem) return;
          
          if (deleteItem.type === 'Job') {
            await deleteJob(deleteItem.id);
          } else if (deleteItem.type === 'Pain') {
            await deletePain(deleteItem.id);
          } else if (deleteItem.type === 'Gain') {
            await deleteGain(deleteItem.id);
          }
          
          showDeleteWithUndo(deleteItem.type, async () => {
            // Undo logic could be implemented here
          });
          setDeleteItem(null);
        }}
        itemType={deleteItem?.type || ''}
        itemDescription={deleteItem?.desc || ''}
      />

      <CreateSegmentModal
        isOpen={showCreateSegmentModal}
        onClose={() => setShowCreateSegmentModal(false)}
        onSubmit={(data) => {
          createSegment(data).then(() => {
            showCreateSuccess('Segment');
          }).catch(err => {
            console.error('Error creating segment:', err);
            showSaveError();
          });
        }}
      />
      </div>
    </div>
  );
}
