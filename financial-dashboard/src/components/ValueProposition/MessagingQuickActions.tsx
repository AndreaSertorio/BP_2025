'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Swords, 
  TrendingUp, 
  Users, 
  Target,
  ExternalLink,
  FileText,
  Download 
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: string;
}

export function MessagingQuickActions() {

  const quickActions: QuickAction[] = [
    {
      id: 'roi-calculator',
      label: 'ROI Calculator',
      description: 'Calculate customer ROI with testimonial metrics',
      icon: <Calculator className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      action: () => {
        window.location.href = '/?tab=value-proposition&subtab=roi';
      },
      badge: 'Financial',
    },
    {
      id: 'competitor-analysis',
      label: 'Competitor Analysis',
      description: 'View detailed competitor data and benchmarks',
      icon: <Swords className="h-5 w-5" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      action: () => {
        window.location.href = '/?tab=competitor-analysis';
      },
      badge: 'Strategy',
    },
    {
      id: 'tam-sam-som',
      label: 'Market Size',
      description: 'TAM/SAM/SOM analysis for positioning context',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      action: () => {
        window.location.href = '/?tab=tam-sam-som';
      },
      badge: 'Market',
    },
    {
      id: 'customer-segments',
      label: 'Customer Segments',
      description: 'Manage customer profiles and jobs-to-be-done',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      action: () => {
        window.location.href = '/?tab=value-proposition&subtab=canvas';
      },
      badge: 'Persona',
    },
    {
      id: 'value-canvas',
      label: 'Value Canvas',
      description: 'Full value proposition canvas view',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      action: () => {
        window.location.href = '/?tab=value-proposition&subtab=canvas';
      },
      badge: 'Strategy',
    },
    {
      id: 'export-pdf',
      label: 'Export PDF',
      description: 'Download complete messaging playbook',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      action: () => {
        // Trigger PDF export modal
        window.dispatchEvent(new CustomEvent('open-export-pdf-modal'));
      },
      badge: 'Export',
    },
  ];

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-slate-600" />
        <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
        <Badge variant="outline" className="text-xs ml-auto">
          {quickActions.length} shortcuts
        </Badge>
      </div>

      <p className="text-xs text-gray-600 mb-3">
        Navigate to related sections for comprehensive business plan development
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`relative p-3 rounded-lg border-2 ${action.color} hover:shadow-md transition-all text-left group`}
          >
            <div className="flex items-start gap-2 mb-1">
              {action.icon}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
            </div>
            <div className="text-xs font-semibold mb-1">{action.label}</div>
            <div className="text-xs opacity-75 leading-tight">{action.description}</div>
            {action.badge && (
              <Badge variant="outline" className="text-xs mt-2 bg-white/50">
                {action.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 p-2 bg-white rounded border border-slate-200">
        <p className="text-xs text-gray-700">
          <strong>💡 Workflow:</strong> Use these sections together: Competitor Analysis → Positioning → 
          Competitive Messages → Testimonials → ROI Calculator
        </p>
      </div>
    </Card>
  );
}
