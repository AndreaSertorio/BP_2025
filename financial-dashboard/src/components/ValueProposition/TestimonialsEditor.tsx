'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, Trash2, Star, CheckCircle2, Building2 } from 'lucide-react';
import type { CustomerTestimonial } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { useValueProposition } from '@/hooks/useValueProposition';

interface TestimonialsEditorProps {
  testimonials: CustomerTestimonial[];
}

const organizationIcons: Record<string, string> = {
  hospital: '🏥',
  clinic: '🏪',
  diagnostic_center: '🔬',
  research: '🎓',
};

const organizationLabels: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  diagnostic_center: 'Diagnostic Center',
  research: 'Research Institution',
};

export function TestimonialsEditor({ testimonials }: TestimonialsEditorProps) {
  const { updateTestimonial, createTestimonial, deleteTestimonial, isSaving } = useValueProposition();
  const [showAddModal, setShowAddModal] = useState(false);

  const visibleTestimonials = testimonials.filter(t => t.visible !== false);
  const featuredTestimonials = visibleTestimonials.filter(t => t.featured);
  const verifiedCount = visibleTestimonials.filter(t => t.verified).length;

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await updateTestimonial(id, { featured: !currentFeatured });
  };

  const handleToggleVerified = async (id: string, currentVerified: boolean) => {
    await updateTestimonial(id, { verified: !currentVerified });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Customer Testimonials</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {visibleTestimonials.length} total
          </Badge>
          <Badge variant="default" className="text-xs bg-green-600">
            {verifiedCount} verified
          </Badge>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Social proof e case studies dai tuoi clienti. Featured testimonials vengono mostrati in homepage e sales materials.
      </p>

      {/* Featured Testimonials */}
      {featuredTestimonials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            Featured Testimonials
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {featuredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onUpdate={updateTestimonial}
                onDelete={deleteTestimonial}
                onToggleFeatured={handleToggleFeatured}
                onToggleVerified={handleToggleVerified}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Testimonials */}
      <div className="space-y-3">
        {visibleTestimonials.filter(t => !t.featured).length > 0 && (
          <h3 className="text-sm font-bold text-gray-900 mb-3">All Testimonials</h3>
        )}
        {visibleTestimonials.filter(t => !t.featured).map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            onUpdate={updateTestimonial}
            onDelete={deleteTestimonial}
            onToggleFeatured={handleToggleFeatured}
            onToggleVerified={handleToggleVerified}
          />
        ))}
      </div>

      {visibleTestimonials.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No testimonials yet. Add your first customer success story!</p>
        </div>
      )}

      {isSaving && (
        <div className="mt-2 text-xs text-green-600 animate-pulse">Saving changes...</div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Customer Testimonial</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a new testimonial, then edit inline.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await createTestimonial({
                    customerName: 'Customer Name',
                    role: 'Role',
                    organization: 'Organization Name',
                    organizationType: 'hospital',
                    testimonial: 'Testimonial quote here...',
                    impact: 'Key impact or result...',
                    metrics: 'Optional: quantifiable metrics',
                    date: new Date().toISOString(),
                    verified: false,
                    featured: false,
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
    </Card>
  );
}

// Testimonial Card Component
interface TestimonialCardProps {
  testimonial: CustomerTestimonial;
  onUpdate: (id: string, updates: Partial<CustomerTestimonial>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFeatured: (id: string, current: boolean) => void;
  onToggleVerified: (id: string, current: boolean) => void;
}

function TestimonialCard({ 
  testimonial, 
  onUpdate, 
  onDelete, 
  onToggleFeatured, 
  onToggleVerified 
}: TestimonialCardProps) {
  return (
    <div className={`group relative p-4 rounded-lg border-2 transition-all ${
      testimonial.featured 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">
            {organizationIcons[testimonial.organizationType]}
          </div>
          <div>
            <InlineEditableText
              value={testimonial.customerName}
              onSave={async (newValue) => {
                await onUpdate(testimonial.id, { customerName: newValue });
              }}
              className="font-bold text-gray-900 block"
              placeholder="Customer Name"
            />
            <InlineEditableText
              value={testimonial.role}
              onSave={async (newValue) => {
                await onUpdate(testimonial.id, { role: newValue });
              }}
              className="text-sm text-gray-600 block"
              placeholder="Role"
            />
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3 w-3 text-gray-400" />
              <InlineEditableText
                value={testimonial.organization}
                onSave={async (newValue) => {
                  await onUpdate(testimonial.id, { organization: newValue });
                }}
                className="text-xs text-gray-500 inline"
                placeholder="Organization"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleFeatured(testimonial.id, testimonial.featured || false)}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title={testimonial.featured ? "Remove from featured" : "Mark as featured"}
          >
            <Star 
              className={`h-3 w-3 ${testimonial.featured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} 
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleVerified(testimonial.id, testimonial.verified)}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title={testimonial.verified ? "Unverify" : "Mark as verified"}
          >
            <CheckCircle2 
              className={`h-3 w-3 ${testimonial.verified ? 'text-green-600' : 'text-gray-400'}`} 
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (confirm(`Delete testimonial from ${testimonial.customerName}?`)) {
                await onDelete(testimonial.id);
              }
            }}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {organizationLabels[testimonial.organizationType]}
        </Badge>
        {testimonial.verified && (
          <Badge variant="default" className="text-xs bg-green-600">
            ✓ Verified
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {new Date(testimonial.date).toLocaleDateString()}
        </Badge>
      </div>

      {/* Testimonial Quote */}
      <div className="mb-3 p-3 bg-white rounded border-l-4 border-blue-400">
        <span className="text-2xl text-blue-400">&ldquo;</span>
        <InlineEditableText
          value={testimonial.testimonial}
          onSave={async (newValue) => {
            await onUpdate(testimonial.id, { testimonial: newValue });
          }}
          className="text-sm text-gray-700 italic block my-1"
          multiline
          placeholder="Customer testimonial quote..."
        />
        <span className="text-2xl text-blue-400">&rdquo;</span>
      </div>

      {/* Impact */}
      <div className="p-3 bg-green-50 rounded border border-green-200">
        <span className="text-xs font-bold text-green-700">📈 Impact: </span>
        <InlineEditableText
          value={testimonial.impact}
          onSave={async (newValue) => {
            await onUpdate(testimonial.id, { impact: newValue });
          }}
          className="text-sm text-gray-700 inline font-semibold"
          placeholder="Key impact or result..."
        />
      </div>

      {/* Metrics (Optional) */}
      {testimonial.metrics && (
        <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
          <span className="text-xs font-bold text-purple-700">📊 Metrics: </span>
          <InlineEditableText
            value={testimonial.metrics}
            onSave={async (newValue) => {
              await onUpdate(testimonial.id, { metrics: newValue });
            }}
            className="text-xs text-gray-700 inline"
            placeholder="Quantifiable metrics..."
          />
        </div>
      )}
    </div>
  );
}
