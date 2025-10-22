'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle2, XCircle, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { BusinessPhase } from '@/types/financialPlan.types';

interface PhaseConfigPanelProps {
  phases: BusinessPhase[];
  onUpdate: (phases: BusinessPhase[]) => void;
}

export function PhaseConfigPanel({ phases, onUpdate }: PhaseConfigPanelProps) {
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BusinessPhase>>({});
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(phases.map(p => p.id)));

  const startEdit = (phase: BusinessPhase) => {
    setEditingPhase(phase.id);
    setEditForm(phase);
  };

  const cancelEdit = () => {
    setEditingPhase(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    
    const updatedPhases = phases.map(p => 
      p.id === editForm.id ? { ...p, ...editForm } : p
    );
    
    onUpdate(updatedPhases);
    setEditingPhase(null);
    setEditForm({});
  };

  const toggleRevenue = (phaseId: string) => {
    const updatedPhases = phases.map(p => 
      p.id === phaseId ? { ...p, revenueEnabled: !p.revenueEnabled } : p
    );
    onUpdate(updatedPhases);
  };

  const toggleExpand = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const isExpanded = (phaseId: string) => expandedPhases.has(phaseId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Fasi Business
        </CardTitle>
        <CardDescription>
          Definisci le fasi temporali del business plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {phases.map((phase, index) => (
          <div key={phase.id} className="border rounded-lg overflow-hidden">
            {/* Header Fase - Sempre visibile */}
            <div className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                 onClick={() => toggleExpand(phase.id)}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{phase.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{phase.startDate} → {phase.endDate}</span>
                    <span>•</span>
                    <span>{phase.duration} mesi</span>
                    {phase.revenueEnabled && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">Revenue ✓</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingPhase === phase.id && (
                  <span className="text-xs text-orange-600 font-medium">Editing...</span>
                )}
                {isExpanded(phase.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Dettagli - Collassabile */}
            {isExpanded(phase.id) && (
              <div className="p-4 space-y-3 border-t" onClick={(e) => e.stopPropagation()}>
                {/* Edit Buttons */}
                <div className="flex justify-end gap-2">
                  {editingPhase === phase.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit} variant="default">
                        <Save className="w-4 h-4 mr-1" />
                        Salva
                      </Button>
                      <Button size="sm" onClick={cancelEdit} variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => startEdit(phase)} variant="outline">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modifica
                    </Button>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Data Inizio</Label>
                {editingPhase === phase.id ? (
                  <Input
                    type="month"
                    value={editForm.startDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 font-mono font-semibold text-blue-600">
                    {phase.startDate}
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Data Fine</Label>
                {editingPhase === phase.id ? (
                  <Input
                    type="month"
                    value={editForm.endDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 font-mono font-semibold text-blue-600">
                    {phase.endDate}
                  </div>
                )}
                  </div>
                </div>

                {/* Revenue Toggle */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                {phase.revenueEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Revenue Abilitato</span>
                  </div>
                  <Button
                    size="sm"
                    variant={phase.revenueEnabled ? 'default' : 'outline'}
                    onClick={() => toggleRevenue(phase.id)}
                  >
                    {phase.revenueEnabled ? 'OFF' : 'ON'}
                  </Button>
                </div>

                {/* Revenue Start Date (se abilitato) */}
                {phase.revenueEnabled && (
                  <div className="p-2 bg-blue-50 border-l-2 border-blue-500 rounded">
                    <Label className="text-xs font-semibold text-blue-700">
                      ⭐ Revenue Start
                    </Label>
                    {editingPhase === phase.id ? (
                      <select
                        value={editForm.revenueStartDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, revenueStartDate: e.target.value })}
                        className="mt-1 w-full px-2 py-1 text-sm border rounded-md"
                      >
                        <option value="">Seleziona quarter...</option>
                        {generateQuarters(phase.startDate, phase.endDate).map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-1 font-mono font-bold text-blue-700">
                        {phase.revenueStartDate || 'Non impostato'}
                      </div>
                    )}
                  </div>
                )}

                {/* Milestones */}
                {phase.milestones && phase.milestones.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">Milestone</Label>
                    <ul className="mt-1 space-y-0.5">
                      {phase.milestones.map((milestone, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Focus Areas */}
                {phase.focus && phase.focus.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {phase.focus.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Genera lista quarters tra due date
 */
function generateQuarters(startDate: string, endDate: string): string[] {
  const quarters: string[] = [];
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  
  for (let year = startYear; year <= endYear; year++) {
    const startQ = year === startYear ? Math.ceil(startMonth / 3) : 1;
    const endQ = year === endYear ? Math.ceil(endMonth / 3) : 4;
    
    for (let q = startQ; q <= endQ; q++) {
      quarters.push(`${year}-Q${q}`);
    }
  }
  
  return quarters;
}
