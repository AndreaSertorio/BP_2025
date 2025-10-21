'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Eye, EyeOff, X } from 'lucide-react';

interface TeamSettingsPanelProps {
  uiSettings: any;
  onToggleCard: (cardName: string) => void;
  onClose: () => void;
}

export function TeamSettingsPanel({ uiSettings, onToggleCard, onClose }: TeamSettingsPanelProps) {
  const cards = [
    { id: 'orgChart', label: 'Organigramma', icon: '🌳' },
    { id: 'teamOverview', label: 'Team Overview', icon: '👥' },
    { id: 'openPositions', label: 'Posizioni Aperte', icon: '💼' },
    { id: 'skillMatrix', label: 'Skill Matrix', icon: '🎯' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'budgetBreakdown', label: 'Budget Breakdown', icon: '💰' },
    { id: 'milestones', label: 'Milestones', icon: '🎖️' },
    { id: 'candidates', label: 'Candidati', icon: '📝' }
  ];

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Impostazioni Visualizzazione
            </CardTitle>
            <CardDescription>Personalizza le card visibili nel dashboard</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">{card.icon}</span>
                <span className="text-sm font-medium">{card.label}</span>
              </div>
              <Switch
                checked={uiSettings.visibleCards?.[card.id] ?? true}
                onCheckedChange={() => onToggleCard(card.id)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>💡 Tip:</strong> Le modifiche vengono salvate automaticamente nel database e 
            persistono tra le sessioni.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
