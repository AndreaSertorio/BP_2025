'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PositioningStatement } from '@/types/valueProposition';
import { InlineEditableText } from './InlineEditableText';
import { useValueProposition } from '@/hooks/useValueProposition';

interface PositioningStatementEditorProps {
  data: PositioningStatement;
}

export function PositioningStatementEditor({ data }: PositioningStatementEditorProps) {
  const { updatePositioningStatement, isSaving } = useValueProposition();
  const [copied, setCopied] = React.useState(false);

  const generateFullStatement = () => {
    return `We are the ${data.category}
For ${data.targetCustomer}
Who ${data.customerNeed}
Our product ${data.keyBenefit}
Unlike ${data.primaryCompetitor}
We ${data.uniqueDifferentiator}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullStatement());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Positioning Statement</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {new Date(data.lastUpdated).toLocaleDateString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
        <div className="space-y-4">
          {/* Category */}
          <div>
            <span className="text-sm font-semibold text-gray-700">We are the </span>
            <InlineEditableText
              value={data.category}
              onSave={async (newValue) => {
                await updatePositioningStatement({ category: newValue });
              }}
              className="text-lg font-bold text-indigo-600 inline"
              placeholder="category/market position"
            />
          </div>

          {/* Target Customer */}
          <div>
            <span className="text-sm font-semibold text-gray-700">For </span>
            <InlineEditableText
              value={data.targetCustomer}
              onSave={async (newValue) => {
                await updatePositioningStatement({ targetCustomer: newValue });
              }}
              className="text-lg font-bold text-indigo-600 inline"
              placeholder="target customer segment"
            />
          </div>

          {/* Customer Need */}
          <div>
            <span className="text-sm font-semibold text-gray-700">Who </span>
            <InlineEditableText
              value={data.customerNeed}
              onSave={async (newValue) => {
                await updatePositioningStatement({ customerNeed: newValue });
              }}
              className="text-lg font-bold text-indigo-600 inline"
              placeholder="customer need/job to be done"
            />
          </div>

          {/* Key Benefit */}
          <div>
            <span className="text-sm font-semibold text-gray-700">Our product </span>
            <InlineEditableText
              value={data.keyBenefit}
              onSave={async (newValue) => {
                await updatePositioningStatement({ keyBenefit: newValue });
              }}
              className="text-lg font-bold text-green-600 inline"
              placeholder="key benefit/solution"
            />
          </div>

          {/* Primary Competitor */}
          <div>
            <span className="text-sm font-semibold text-gray-700">Unlike </span>
            <InlineEditableText
              value={data.primaryCompetitor}
              onSave={async (newValue) => {
                await updatePositioningStatement({ primaryCompetitor: newValue });
              }}
              className="text-lg font-bold text-orange-600 inline"
              placeholder="primary competitor reference"
            />
          </div>

          {/* Unique Differentiator */}
          <div>
            <span className="text-sm font-semibold text-gray-700">We </span>
            <InlineEditableText
              value={data.uniqueDifferentiator}
              onSave={async (newValue) => {
                await updatePositioningStatement({ uniqueDifferentiator: newValue });
              }}
              className="text-lg font-bold text-blue-600 inline"
              placeholder="unique differentiator"
              multiline
            />
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="mt-2 text-xs text-indigo-600 animate-pulse">Saving changes...</div>
      )}

      {/* Preview Box */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Full Statement Preview:</h4>
        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {generateFullStatement()}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-gray-700">
          <strong>💡 Tip:</strong> Use this positioning statement in pitch decks, website hero sections, 
          and sales conversations to clearly communicate your unique market position.
        </p>
      </div>
    </Card>
  );
}
