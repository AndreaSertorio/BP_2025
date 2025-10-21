'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Target, BookOpen, Copy, CheckCircle2, Crosshair, Swords, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ValueProposition } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { useValueProposition } from '@/hooks/useValueProposition';
import { PositioningStatementEditor } from './PositioningStatementEditor';
import { CompetitiveMessagingEditor } from './CompetitiveMessagingEditor';
import { TestimonialsEditor } from './TestimonialsEditor';
import { ObjectionHandlingEditor } from './ObjectionHandlingEditor';
import { MessagingQuickActions } from './MessagingQuickActions';
import { MessagingSettings } from './MessagingSettings';

interface MessagingEditorProps {
  data: ValueProposition;
}

export function MessagingEditor({ data }: MessagingEditorProps) {
  const { messaging } = data;
  const { updateElevatorPitch, updateValueStatement, updateNarrativeFlow, isSaving } = useValueProposition();
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  
  // Load visible sections from localStorage
  const [visibleSections, setVisibleSections] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messaging-visible-sections');
      return saved ? JSON.parse(saved) : ['overview', 'positioning', 'competitive', 'testimonials', 'objections'];
    }
    return ['overview', 'positioning', 'competitive', 'testimonials', 'objections'];
  });

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleVisibilityChange = (newVisibleSections: string[]) => {
    setVisibleSections(newVisibleSections);
    if (typeof window !== 'undefined') {
      localStorage.setItem('messaging-visible-sections', JSON.stringify(newVisibleSections));
    }
  };

  const isSectionVisible = (sectionId: string) => visibleSections.includes(sectionId);

  // Determine grid columns based on visible sections
  const gridColsClass = `grid w-full grid-cols-${visibleSections.length} mb-6`;

  return (
    <div className="space-y-6">
      {/* Quick Actions Panel */}
      <MessagingQuickActions />

      {/* Settings Panel */}
      <MessagingSettings onVisibilityChange={handleVisibilityChange} />

      {/* Sub-Tabs for Better Organization */}
      <Tabs defaultValue={visibleSections[0] || 'overview'} className="w-full">
        <TabsList className={gridColsClass}>
          {isSectionVisible('overview') && (
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Overview
            </TabsTrigger>
          )}
          {isSectionVisible('positioning') && (
            <TabsTrigger value="positioning" className="flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Positioning
            </TabsTrigger>
          )}
          {isSectionVisible('competitive') && (
            <TabsTrigger value="competitive" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Competitive
            </TabsTrigger>
          )}
          {isSectionVisible('testimonials') && (
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social Proof
            </TabsTrigger>
          )}
          {isSectionVisible('objections') && (
            <TabsTrigger value="objections" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Objections
            </TabsTrigger>
          )}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">

      {/* Elevator Pitch */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Elevator Pitch</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{messaging.elevatorPitch.wordCount || 0} words</Badge>
            <Badge variant="outline">{messaging.elevatorPitch.tone}</Badge>
            <Badge variant="outline">{messaging.elevatorPitch.targetAudience}</Badge>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 mb-4">
          <InlineEditableText
            value={messaging.elevatorPitch.content}
            onSave={async (newValue) => {
              await updateElevatorPitch({ content: newValue });
            }}
            className="text-lg leading-relaxed text-gray-800"
            multiline
            placeholder="Write your elevator pitch..."
          />
        </div>
        {isSaving && (
          <div className="text-xs text-blue-600 animate-pulse mb-2">Saving changes...</div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Version {messaging.elevatorPitch.version} • Last updated: {new Date(messaging.elevatorPitch.lastUpdated).toLocaleDateString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleCopy(messaging.elevatorPitch.content, 'pitch')}
          >
            {copiedSection === 'pitch' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Value Statements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Value Statements</h2>
          <Badge variant="outline" className="ml-auto">
            {messaging.valueStatements.filter(vs => vs.visible !== false).length}
          </Badge>
        </div>

        <div className="space-y-4">
          {messaging.valueStatements.filter(vs => vs.visible !== false).map((statement) => (
            <div key={statement.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    {statement.audience}
                  </Badge>
                  <InlineEditableText
                    value={statement.headline}
                    onSave={async (newValue) => {
                      await updateValueStatement(statement.id, { headline: newValue });
                    }}
                    className="text-lg font-bold text-gray-900 block mb-1"
                    placeholder="Add headline..."
                  />
                  {statement.subheadline && (
                    <InlineEditableText
                      value={statement.subheadline}
                      onSave={async (newValue) => {
                        await updateValueStatement(statement.id, { subheadline: newValue });
                      }}
                      className="text-sm text-gray-600"
                      placeholder="Add subheadline..."
                    />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCopy(
                    `${statement.headline}\n\n${statement.subheadline || ''}\n\n${statement.body}\n\n${statement.cta || ''}`,
                    statement.id
                  )}
                >
                  {copiedSection === statement.id ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <InlineEditableText
                value={statement.body}
                onSave={async (newValue) => {
                  await updateValueStatement(statement.id, { body: newValue });
                }}
                className="text-sm text-gray-700 mb-3 block"
                multiline
                placeholder="Add body text..."
              />

              {statement.cta && (
                <div className="pt-3 border-t border-green-300">
                  <span className="text-sm font-semibold text-green-700">📢 CTA: </span>
                  <InlineEditableText
                    value={statement.cta}
                    onSave={async (newValue) => {
                      await updateValueStatement(statement.id, { cta: newValue });
                    }}
                    className="text-sm font-semibold text-green-700 inline"
                    placeholder="Add call to action..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

        {/* Narrative Flow */}
        <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Narrative Flow</h2>
        </div>

        <div className="space-y-4">
          {/* Hook */}
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-yellow-700">🎣 Hook</span>
              <span className="text-xs text-gray-600">(Attention Grabber)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.hook}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ hook: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add hook..."
            />
          </div>

          {/* Problem */}
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-red-700">😫 Problem</span>
              <span className="text-xs text-gray-600">(Current Pain)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.problem}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ problem: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add problem..."
            />
          </div>

          {/* Solution */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-blue-700">💡 Solution</span>
              <span className="text-xs text-gray-600">(What You Offer)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.solution}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ solution: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add solution..."
            />
          </div>

          {/* How */}
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-purple-700">⚙️ How</span>
              <span className="text-xs text-gray-600">(How It Works)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.how}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ how: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add how it works..."
            />
          </div>

          {/* Proof */}
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-green-700">📊 Proof</span>
              <span className="text-xs text-gray-600">(Evidence & Traction)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.proof}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ proof: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add proof..."
            />
          </div>

          {/* Vision */}
          <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-indigo-700">🚀 Vision</span>
              <span className="text-xs text-gray-600">(Future Impact)</span>
            </div>
            <InlineEditableText
              value={messaging.narrativeFlow.vision}
              onSave={async (newValue) => {
                await updateNarrativeFlow({ vision: newValue });
              }}
              className="text-sm text-gray-700"
              multiline
              placeholder="Add vision..."
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline"
            onClick={() => handleCopy(
              `Hook: ${messaging.narrativeFlow.hook}\n\nProblem: ${messaging.narrativeFlow.problem}\n\nSolution: ${messaging.narrativeFlow.solution}\n\nHow: ${messaging.narrativeFlow.how}\n\nProof: ${messaging.narrativeFlow.proof}\n\nVision: ${messaging.narrativeFlow.vision}`,
              'narrative'
            )}
          >
            {copiedSection === 'narrative' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Full Narrative
              </>
            )}
          </Button>
        </div>
      </Card>
      </TabsContent>

        {/* POSITIONING TAB */}
        <TabsContent value="positioning">
          {messaging.positioningStatement && (
        <PositioningStatementEditor data={messaging.positioningStatement} />
          )}
        </TabsContent>

        {/* COMPETITIVE TAB */}
        <TabsContent value="competitive">
          {messaging.competitiveMessages && (
        <CompetitiveMessagingEditor messages={messaging.competitiveMessages} />
          )}
        </TabsContent>

        {/* TESTIMONIALS TAB */}
        <TabsContent value="testimonials">
          {messaging.customerTestimonials && (
        <TestimonialsEditor testimonials={messaging.customerTestimonials} />
          )}
        </TabsContent>

        {/* OBJECTIONS TAB */}
        <TabsContent value="objections">
          {messaging.objections && (
        <ObjectionHandlingEditor objections={messaging.objections} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
