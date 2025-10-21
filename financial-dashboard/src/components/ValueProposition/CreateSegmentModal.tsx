'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CreateSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
  }) => void;
  editData?: {
    name: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
  };
}

const ICON_OPTIONS = [
  '🏥', '🏢', '👨‍⚕️', '👩‍⚕️', '🔬', '🧪', 
  '💼', '🎯', '📊', '💡', '🚀', '⚡',
  '🌟', '💪', '🎓', '🏆', '📈', '🔍'
];

const PRIORITY_OPTIONS: Array<{ value: 'high' | 'medium' | 'low'; label: string; color: string }> = [
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-700 border-green-300' },
];

export function CreateSegmentModal({ isOpen, onClose, onSubmit, editData }: CreateSegmentModalProps) {
  const [name, setName] = useState(editData?.name || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(editData?.priority || 'medium');
  const [icon, setIcon] = useState(editData?.icon || '🏥');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a segment name');
      return;
    }

    onSubmit({ name: name.trim(), priority, icon });
    
    // Reset form
    setName('');
    setPriority('medium');
    setIcon('🏥');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {editData ? 'Edit Customer Segment' : 'Create New Customer Segment'}
          </h2>
          <p className="text-gray-600">
            Define a customer persona with specific jobs, pains, and gains
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Segment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ospedali Pubblici, Cliniche Private, Centri Diagnostici"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the customer segment or persona
            </p>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-9 gap-2">
              {ICON_OPTIONS.map((iconOption) => (
                <button
                  key={iconOption}
                  onClick={() => setIcon(iconOption)}
                  className={`
                    text-3xl p-2 rounded-lg border-2 transition-all
                    ${icon === iconOption 
                      ? 'border-blue-500 bg-blue-50 scale-110' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`
                    p-3 rounded-lg border-2 font-medium transition-all
                    ${priority === option.value 
                      ? `${option.color} scale-105` 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set the strategic importance of this segment
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-bold text-gray-900">
                  {name || 'Segment Name'}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                  priority === 'high' ? 'bg-red-100 text-red-700' :
                  priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {priority} priority
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editData ? 'Save Changes' : 'Create Segment'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
