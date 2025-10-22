'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  DollarSign, 
  Settings, 
  Star, 
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Edit2
} from 'lucide-react';
import type { BusinessPhase, FundingRound } from '@/types/financialPlan.types';

interface TimelineConfigPanelProps {
  phases: BusinessPhase[];
  fundingRounds: FundingRound[];
  onPhasesUpdate: (phases: BusinessPhase[]) => void;
  onFundingUpdate: (rounds: FundingRound[]) => void;
}

type SelectedElement = {
  type: 'phase' | 'funding' | 'revenue';
  id: string;
} | null;

export function TimelineConfigPanel({
  phases,
  fundingRounds,
  onPhasesUpdate,
  onFundingUpdate
}: TimelineConfigPanelProps) {
  // State
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{ type: string; id: string; part?: string } | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    showPhases: true,
    showFunding: true,
    showRevenue: true,
    showMilestones: true,
    showAmounts: true
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds
  const startYear = 2025;
  const endYear = 2035;
  const totalYears = endYear - startYear + 1;

  // Convert date to position (0-1)
  const dateToPosition = (date: string): number => {
    if (!date) return 0;
    
    // Handle different formats: "YYYY-MM", "YYYY-QX", "YYYY"
    const parts = date.split('-');
    const year = parseInt(parts[0]);
    
    let monthInYear = 1; // Default to January
    
    if (parts.length > 1) {
      if (parts[1].startsWith('Q')) {
        // Format: "2029-Q3"
        const quarter = parseInt(parts[1].substring(1));
        monthInYear = (quarter - 1) * 3 + 1.5; // Middle of quarter
      } else {
        // Format: "2029-06"
        monthInYear = parseInt(parts[1]);
      }
    }
    
    const yearFraction = (year - startYear) + (monthInYear - 1) / 12;
    return yearFraction / totalYears;
  };

  // Convert position (0-1) to date (always month precision)
  const positionToDate = (position: number): string => {
    const yearFraction = position * totalYears;
    const year = Math.floor(startYear + yearFraction);
    const monthFraction = (yearFraction - Math.floor(yearFraction)) * 12;
    
    // Always return month format for precision
    const month = Math.max(1, Math.min(12, Math.floor(monthFraction) + 1));
    const monthStr = month.toString().padStart(2, '0');
    return `${year}-${monthStr}`;
  };

  // Note: formatDate removed - not needed with current implementation

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
    return `€${amount}`;
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, type: string, id: string, part?: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragTarget({ type, id, part });
  };

  // Calculate duration in months between two dates
  const calculateDuration = (startDate: string, endDate: string): number => {
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const [endYear, endMonth] = endDate.split('-').map(Number);
    return (endYear - startYear) * 12 + (endMonth - startMonth);
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragTarget || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(1, x / rect.width));
    const newDate = positionToDate(position);

    // Update based on drag target
    if (dragTarget.type === 'revenue') {
      const phaseId = dragTarget.id;
      const updatedPhases = phases.map(p =>
        p.id === phaseId ? { ...p, revenueStartDate: newDate } : p
      );
      onPhasesUpdate(updatedPhases);
    } else if (dragTarget.type === 'funding') {
      const updatedRounds = fundingRounds.map(r =>
        r.id === dragTarget.id ? { ...r, date: newDate } : r
      );
      onFundingUpdate(updatedRounds);
    } else if (dragTarget.type === 'phase') {
      // Handle phase border dragging with auto-align
      const phaseIndex = phases.findIndex(p => p.id === dragTarget.id);
      if (phaseIndex === -1) return;

      let updatedPhases = [...phases];

      if (dragTarget.part === 'start') {
        // Update start date and recalculate duration
        updatedPhases[phaseIndex] = {
          ...updatedPhases[phaseIndex],
          startDate: newDate,
          duration: calculateDuration(newDate, updatedPhases[phaseIndex].endDate)
        };
        
        // Auto-align: set previous phase end date to this start date
        if (phaseIndex > 0) {
          const prevEndDate = newDate;
          updatedPhases[phaseIndex - 1] = {
            ...updatedPhases[phaseIndex - 1],
            endDate: prevEndDate,
            duration: calculateDuration(updatedPhases[phaseIndex - 1].startDate, prevEndDate)
          };
        }
      } else if (dragTarget.part === 'end') {
        // Update end date and recalculate duration
        updatedPhases[phaseIndex] = {
          ...updatedPhases[phaseIndex],
          endDate: newDate,
          duration: calculateDuration(updatedPhases[phaseIndex].startDate, newDate)
        };
        
        // Auto-align: set next phase start date to this end date
        if (phaseIndex < phases.length - 1) {
          const nextStartDate = newDate;
          updatedPhases[phaseIndex + 1] = {
            ...updatedPhases[phaseIndex + 1],
            startDate: nextStartDate,
            duration: calculateDuration(nextStartDate, updatedPhases[phaseIndex + 1].endDate)
          };
        }
      }

      onPhasesUpdate(updatedPhases);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleDragEnd);
      return () => document.removeEventListener('mouseup', handleDragEnd);
    }
  }, [isDragging]);

  // Get selected element data
  const getSelectedElementData = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'phase') {
      return phases.find(p => p.id === selectedElement.id);
    } else if (selectedElement.type === 'funding') {
      return fundingRounds.find(r => r.id === selectedElement.id);
    } else if (selectedElement.type === 'revenue') {
      return phases.find(p => p.id === selectedElement.id);
    }
    return null;
  };

  const selectedData = getSelectedElementData();

  // Generate timeline markers (years only)
  const generateTimelineMarkers = () => {
    const markers = [];
    for (let year = startYear; year <= endYear; year++) {
      markers.push({ 
        label: year.toString(), 
        position: (year - startYear) / totalYears 
      });
    }
    return markers;
  };

  const timelineMarkers = generateTimelineMarkers();

  // State for collapsed panels
  const [showDetailedPanels, setShowDetailedPanels] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Timeline Configurazione</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-md">
                📅 Vista Annuale (Precisione Mensile)
              </div>
              
              {/* Settings Toggle */}
              <Button
                size="sm"
                variant={showSettings ? 'default' : 'outline'}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showPhases}
                    onChange={(e) => setSettings({ ...settings, showPhases: e.target.checked })}
                    className="rounded"
                  />
                  <span>Fasi Business</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showFunding}
                    onChange={(e) => setSettings({ ...settings, showFunding: e.target.checked })}
                    className="rounded"
                  />
                  <span>Funding Rounds</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showRevenue}
                    onChange={(e) => setSettings({ ...settings, showRevenue: e.target.checked })}
                    className="rounded"
                  />
                  <span>Revenue Start</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showMilestones}
                    onChange={(e) => setSettings({ ...settings, showMilestones: e.target.checked })}
                    className="rounded"
                  />
                  <span>Milestones</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showAmounts}
                    onChange={(e) => setSettings({ ...settings, showAmounts: e.target.checked })}
                    className="rounded"
                  />
                  <span>Importi €</span>
                </label>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Timeline Container */}
          <div 
            ref={timelineRef}
            className="relative h-80 bg-gradient-to-b from-gray-50 to-white border rounded-lg p-4 select-none overflow-visible"
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
          >
            {/* Timeline Axis */}
            <div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-300 rounded">
              {/* Markers */}
              {timelineMarkers.map((marker) => (
                <div
                  key={marker.label}
                  className="absolute"
                  style={{ left: `${marker.position * 100}%` }}
                >
                  <div className="w-px h-3 bg-gray-400 -mt-3" />
                  <div className="absolute -translate-x-1/2 mt-1 text-xs text-gray-500 whitespace-nowrap">
                    {marker.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Business Phases */}
            {settings.showPhases && phases.map((phase, phaseIdx) => {
              const startPos = dateToPosition(phase.startDate);
              const endPos = dateToPosition(phase.endDate);
              const width = (endPos - startPos) * 100;
              const colors = ['bg-blue-200 border-blue-400', 'bg-green-200 border-green-400', 'bg-purple-200 border-purple-400'];
              const color = colors[phaseIdx % colors.length];

              return (
                <div
                  key={phase.id}
                  className={`absolute h-12 ${color} border-2 rounded cursor-pointer hover:shadow-lg transition-shadow`}
                  style={{
                    left: `${startPos * 100}%`,
                    width: `${width}%`,
                    top: `${phaseIdx * 50 + 10}px`
                  }}
                  onClick={() => setSelectedElement({ type: 'phase', id: phase.id })}
                >
                  {/* Start Handle */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 cursor-ew-resize hover:bg-opacity-40"
                    onMouseDown={(e) => handleDragStart(e, 'phase', phase.id, 'start')}
                  />
                  
                  {/* Phase Content */}
                  <div className="px-3 py-1 h-full flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">{phase.name}</span>
                    <span className="text-xs opacity-70">{phase.duration}m</span>
                  </div>

                  {/* End Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 cursor-ew-resize hover:bg-opacity-40"
                    onMouseDown={(e) => handleDragStart(e, 'phase', phase.id, 'end')}
                  />

                </div>
              );
            })}

            {/* Funding Rounds & Revenue Start */}
            {settings.showFunding && fundingRounds.map((round) => {
              const pos = dateToPosition(round.date);

              return (
                <div
                  key={round.id}
                  className="absolute cursor-move"
                  style={{
                    left: `${pos * 100}%`,
                    bottom: '60px'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'funding', round.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ type: 'funding', id: round.id });
                  }}
                >
                  <div className="relative -translate-x-1/2">
                    <DollarSign className="w-8 h-8 text-green-600 bg-white rounded-full p-1 border-2 border-green-600 shadow-lg hover:scale-110 transition-transform" />
                    {settings.showAmounts && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-green-700 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow">
                        {formatCurrency(round.amount)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Revenue Start Markers (allo stesso livello dei funding) */}
            {settings.showRevenue && phases.filter(p => p.revenueEnabled && p.revenueStartDate).map((phase) => {
              const pos = dateToPosition(phase.revenueStartDate!);
              
              return (
                <div
                  key={`revenue-${phase.id}`}
                  className="absolute cursor-move"
                  style={{
                    left: `${pos * 100}%`,
                    bottom: '60px'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'revenue', phase.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ type: 'revenue', id: phase.id });
                  }}
                >
                  <div className="relative -translate-x-1/2">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 bg-white rounded-full p-1 border-2 border-yellow-500 shadow-lg hover:scale-110 transition-transform" />
                    {settings.showAmounts && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-yellow-700 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow">
                        Revenue Start
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                🎯 Dragging...
              </div>
            )}
          </div>

          {/* Quick Info Bar */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-xs text-blue-600 font-semibold">Fasi Business</div>
              <div className="text-lg font-bold text-blue-900">{phases.length}</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="text-xs text-green-600 font-semibold">Total Funding</div>
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(fundingRounds.reduce((sum, r) => sum + r.amount, 0))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Panel */}
      {selectedElement && selectedData && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md">
                {selectedElement.type === 'phase' && '📅 Dettagli Fase'}
                {selectedElement.type === 'funding' && '💰 Dettagli Funding'}
                {selectedElement.type === 'revenue' && '⭐ Revenue Start'}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedElement(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DetailsEditor
              element={selectedData}
              type={selectedElement.type}
              onUpdate={(updated) => {
                if (selectedElement.type === 'phase') {
                  const updatedPhases = phases.map(p =>
                    p.id === selectedElement.id ? updated as BusinessPhase : p
                  );
                  onPhasesUpdate(updatedPhases);
                } else if (selectedElement.type === 'funding') {
                  const updatedRounds = fundingRounds.map(r =>
                    r.id === selectedElement.id ? updated as FundingRound : r
                  );
                  onFundingUpdate(updatedRounds);
                } else if (selectedElement.type === 'revenue') {
                  const updatedPhases = phases.map(p =>
                    p.id === selectedElement.id ? updated as BusinessPhase : p
                  );
                  onPhasesUpdate(updatedPhases);
                }
              }}
              onClose={() => setSelectedElement(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Detailed Panels Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetailedPanels(!showDetailedPanels)}
          className="gap-2"
        >
          {showDetailedPanels ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Nascondi Pannelli Dettagliati
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Mostra Pannelli Dettagliati (Backup)
            </>
          )}
        </Button>
      </div>

      {/* Detailed Panels - Collapsed by Default */}
      {showDetailedPanels && (
        <div className="space-y-4">
          {/* Phases Panel - Compact */}
          <CompactPhasesPanel 
            phases={phases}
            onUpdate={onPhasesUpdate}
          />

          {/* Funding Panel - Compact */}
          <CompactFundingPanel
            fundingRounds={fundingRounds}
            onUpdate={onFundingUpdate}
          />
        </div>
      )}
    </div>
  );
}

// Details Editor Component
function DetailsEditor({
  element,
  type,
  onUpdate,
  onClose
}: {
  element: BusinessPhase | FundingRound;
  type: string;
  onUpdate: (updated: BusinessPhase | FundingRound) => void;
  onClose: () => void;
}) {
  const [editForm, setEditForm] = useState<BusinessPhase | FundingRound>(element);

  const handleSave = () => {
    onUpdate(editForm);
    onClose();
  };

  if (type === 'phase') {
    const phaseForm = editForm as BusinessPhase;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Nome Fase</Label>
          <Input
            value={phaseForm.name}
            onChange={(e) => setEditForm({ ...phaseForm, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Data Inizio</Label>
            <Input
              type="month"
              value={phaseForm.startDate}
              onChange={(e) => setEditForm({ ...phaseForm, startDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Data Fine</Label>
            <Input
              type="month"
              value={phaseForm.endDate}
              onChange={(e) => setEditForm({ ...phaseForm, endDate: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Revenue Start Date</Label>
          <Input
            value={phaseForm.revenueStartDate || ''}
            onChange={(e) => setEditForm({ ...phaseForm, revenueStartDate: e.target.value })}
            placeholder="2029-Q3"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-2">
            🌍 Moltiplicatore Espansione
            <span className="text-gray-400 font-normal">(default: 1.0)</span>
          </Label>
          <Input
            type="number"
            step="0.1"
            min="1.0"
            max="10.0"
            value={phaseForm.expansionMultiplier || 1.0}
            onChange={(e) => setEditForm({ ...phaseForm, expansionMultiplier: parseFloat(e.target.value) || 1.0 })}
            placeholder="1.0"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            1.0 = Solo Italia | 2.5 = Italia + EU + USA | 4.0 = Italia + EU + USA + Asia
          </p>
        </div>
        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salva Modifiche
        </Button>
      </div>
    );
  } else if (type === 'funding') {
    const fundingForm = editForm as FundingRound;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Nome Round</Label>
          <Input
            value={fundingForm.name}
            onChange={(e) => setEditForm({ ...fundingForm, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Data</Label>
            <Input
              value={fundingForm.date}
              onChange={(e) => setEditForm({ ...fundingForm, date: e.target.value })}
              placeholder="2025-Q1"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Importo (€)</Label>
            <Input
              type="number"
              value={fundingForm.amount}
              onChange={(e) => setEditForm({ ...fundingForm, amount: parseFloat(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salva Modifiche
        </Button>
      </div>
    );
  }

  return null;
}

// Compact Phases Panel Component
function CompactPhasesPanel({
  phases,
  onUpdate
}: {
  phases: BusinessPhase[];
  onUpdate: (phases: BusinessPhase[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BusinessPhase>>({});

  const startEdit = (phase: BusinessPhase) => {
    setEditingId(phase.id);
    setEditForm(phase);
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    const updated = phases.map(p => p.id === editForm.id ? { ...p, ...editForm } : p);
    onUpdate(updated);
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Fasi Business (Pannello Dettagliato)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {phases.map((phase) => (
          <div key={phase.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm">{phase.name}</div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>📅 {phase.startDate} → {phase.endDate} ({phase.duration}m)</div>
                  {phase.revenueStartDate && (
                    <div className="text-yellow-600">
                      ⭐ Revenue: {phase.revenueStartDate}
                    </div>
                  )}
                  {phase.expansionMultiplier && phase.expansionMultiplier > 1.0 && (
                    <div className="text-blue-600 font-semibold">
                      🌍 Expansion: ×{phase.expansionMultiplier.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editingId === phase.id ? saveEdit() : startEdit(phase)}
              >
                {editingId === phase.id ? (
                  <><Save className="w-3 h-3 mr-1" /> Salva</>
                ) : (
                  <><Edit2 className="w-3 h-3 mr-1" /> Edit</>
                )}
              </Button>
            </div>
            {editingId === phase.id && (
              <div className="space-y-2 pt-2 border-t">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Inizio</Label>
                    <Input
                      type="month"
                      value={editForm.startDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fine</Label>
                    <Input
                      type="month"
                      value={editForm.endDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Revenue Start</Label>
                    <Input
                      value={editForm.revenueStartDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, revenueStartDate: e.target.value })}
                      placeholder="2029-Q3"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">🌍 Expansion Multiplier (1.0 = Italia, 2.5 = +EU+USA)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={editForm.expansionMultiplier || 1.0}
                    onChange={(e) => setEditForm({ ...editForm, expansionMultiplier: parseFloat(e.target.value) || 1.0 })}
                    placeholder="1.0"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Compact Funding Panel Component
function CompactFundingPanel({
  fundingRounds,
  onUpdate
}: {
  fundingRounds: FundingRound[];
  onUpdate: (rounds: FundingRound[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FundingRound>>({});

  const startEdit = (round: FundingRound) => {
    setEditingId(round.id);
    setEditForm(round);
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    const updated = fundingRounds.map(r => r.id === editForm.id ? { ...r, ...editForm } : r);
    onUpdate(updated);
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
    return `€${amount}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Funding Rounds (Pannello Dettagliato)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fundingRounds.map((round) => (
          <div key={round.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm">{round.name}</div>
                <div className="text-xs text-gray-500">
                  {round.date} • {formatCurrency(round.amount)}
                  {round.valuation?.postMoney && (
                    <span className="ml-2">
                      Post-money: {formatCurrency(round.valuation.postMoney)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editingId === round.id ? saveEdit() : startEdit(round)}
              >
                {editingId === round.id ? (
                  <><Save className="w-3 h-3 mr-1" /> Salva</>
                ) : (
                  <><Edit2 className="w-3 h-3 mr-1" /> Edit</>
                )}
              </Button>
            </div>
            {editingId === round.id && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    placeholder="2025-Q1"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Importo (€)</Label>
                  <Input
                    type="number"
                    value={editForm.amount || ''}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
