'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings2, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface MessagingSection {
  id: string;
  label: string;
  description: string;
  visible: boolean;
  icon: string;
}

interface MessagingSettingsProps {
  onVisibilityChange?: (visibleSections: string[]) => void;
}

const DEFAULT_SECTIONS: MessagingSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Elevator Pitch, Value Statements, Narrative Flow',
    visible: true,
    icon: '📋',
  },
  {
    id: 'positioning',
    label: 'Positioning',
    description: 'Positioning Statement framework',
    visible: true,
    icon: '🎯',
  },
  {
    id: 'competitive',
    label: 'Competitive',
    description: 'Competitive messaging and battlecards',
    visible: true,
    icon: '⚔️',
  },
  {
    id: 'testimonials',
    label: 'Social Proof',
    description: 'Customer testimonials and case studies',
    visible: true,
    icon: '👥',
  },
  {
    id: 'objections',
    label: 'Objections',
    description: 'Objection handling and responses',
    visible: true,
    icon: '❗',
  },
];

export function MessagingSettings({ onVisibilityChange }: MessagingSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [sections, setSections] = useState<MessagingSection[]>(DEFAULT_SECTIONS);

  const handleToggleSection = (sectionId: string) => {
    const updated = sections.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    setSections(updated);
    
    if (onVisibilityChange) {
      const visibleIds = updated.filter(s => s.visible).map(s => s.id);
      onVisibilityChange(visibleIds);
    }
  };

  const handleResetDefault = () => {
    setSections(DEFAULT_SECTIONS);
    if (onVisibilityChange) {
      const visibleIds = DEFAULT_SECTIONS.filter(s => s.visible).map(s => s.id);
      onVisibilityChange(visibleIds);
    }
  };

  const visibleCount = sections.filter(s => s.visible).length;
  const hiddenCount = sections.filter(s => !s.visible).length;

  if (!showSettings) {
    return (
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Customize Sections
          {hiddenCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {hiddenCount} hidden
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-slate-600" />
          <h3 className="text-sm font-bold text-gray-900">Section Visibility</h3>
          <Badge variant="outline" className="text-xs">
            {visibleCount}/{sections.length} visible
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefault}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            Done
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              section.visible
                ? 'bg-white border-slate-200'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {section.label}
                  </span>
                  {section.visible ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{section.description}</p>
              </div>
            </div>
            <Switch
              checked={section.visible}
              onCheckedChange={() => handleToggleSection(section.id)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>💡 Tip:</strong> Hide sections you don&apos;t need to reduce scrolling. 
          Your changes are saved automatically.
        </p>
      </div>
    </Card>
  );
}
