'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  itemType: 'job' | 'pain' | 'gain' | 'feature' | 'pain-reliever' | 'gain-creator';
  title: string;
}

export function AddItemModal({ isOpen, onClose, onSubmit, itemType, title }: AddItemModalProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('functional');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const baseData = {
        description: description.trim(),
        category,
      };

      // Add type-specific defaults
      let data = baseData;
      if (itemType === 'job') {
        data = { ...baseData, importance: 3, difficulty: 3 };
      } else if (itemType === 'pain') {
        data = { ...baseData, severity: 3, frequency: 3 };
      } else if (itemType === 'gain') {
        data = { ...baseData, desirability: 3, impact: 3 };
      } else if (itemType === 'feature') {
        data = { ...baseData, name: description.split(' ').slice(0, 3).join(' '), technicalSpec: '' };
      } else if (itemType === 'pain-reliever') {
        data = { ...baseData, effectiveness: 3, linkedPainId: null };
      } else if (itemType === 'gain-creator') {
        data = { ...baseData, magnitude: 3, linkedGainId: null };
      }

      await onSubmit(data);
      setDescription('');
      setCategory('functional');
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = {
    job: ['functional', 'social', 'emotional'],
    pain: ['functional', 'cost', 'emotional', 'risk'],
    gain: ['functional', 'social', 'emotional', 'savings'],
    feature: ['core', 'differentiator', 'hygiene'],
    'pain-reliever': ['direct', 'indirect'],
    'gain-creator': ['direct', 'indirect'],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter description..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories[itemType].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500">
              {itemType === 'job' && 'Default importance and difficulty: 3/5'}
              {itemType === 'pain' && 'Default severity and frequency: 3/5'}
              {itemType === 'gain' && 'Default desirability and impact: 3/5'}
              {itemType === 'feature' && 'Technical spec can be added after creation'}
              {(itemType === 'pain-reliever' || itemType === 'gain-creator') && 'Default score: 3/5'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
