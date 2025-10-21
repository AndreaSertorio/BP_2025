'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  MessageSquare, 
  Calculator,
  Swords,
  DollarSign,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  Coins,
  Map,
  Zap
} from 'lucide-react';

interface QuickLink {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  category: string;
  isSubTab?: boolean;
}

export function DashboardQuickLinks() {
  const quickLinks: QuickLink[] = [
    // STRATEGY & POSITIONING
    {
      id: 'vp-messaging',
      label: 'Messaging & Positioning',
      description: 'Elevator pitch, value statements, positioning',
      icon: <MessageSquare className="h-5 w-5" />,
      url: '/?tab=value-proposition&subtab=messaging',
      color: 'from-blue-500 to-blue-600',
      category: 'Strategy',
      isSubTab: true,
    },
    {
      id: 'vp-canvas',
      label: 'Value Proposition Canvas',
      description: 'Customer jobs, pains, gains mapping',
      icon: <Target className="h-5 w-5" />,
      url: '/?tab=value-proposition&subtab=canvas',
      color: 'from-indigo-500 to-indigo-600',
      category: 'Strategy',
      isSubTab: true,
    },
    {
      id: 'vp-roi',
      label: 'ROI Calculator',
      description: 'Customer value & testimonial metrics',
      icon: <Calculator className="h-5 w-5" />,
      url: '/?tab=value-proposition&subtab=roi',
      color: 'from-green-500 to-green-600',
      category: 'Strategy',
      isSubTab: true,
    },
    {
      id: 'competitor',
      label: 'Competitor Analysis',
      description: 'Competitive landscape & benchmarks',
      icon: <Swords className="h-5 w-5" />,
      url: '/?tab=competitor-analysis',
      color: 'from-orange-500 to-orange-600',
      category: 'Strategy',
    },

    // FINANCIAL PLANNING (mostly sub-tabs)
    {
      id: 'income-statement',
      label: 'Conto Economico (P&L)',
      description: 'Ricavi, costi, EBITDA, redditività',
      icon: <BarChart3 className="h-5 w-5" />,
      url: '/?tab=financial-plan&subtab=income-statement',
      color: 'from-emerald-500 to-emerald-600',
      category: 'Financial',
      isSubTab: true,
    },
    {
      id: 'cash-flow',
      label: 'Cash Flow Statement',
      description: 'Operating, investing, financing flows',
      icon: <DollarSign className="h-5 w-5" />,
      url: '/?tab=financial-plan&subtab=cash-flow',
      color: 'from-teal-500 to-teal-600',
      category: 'Financial',
      isSubTab: true,
    },
    {
      id: 'balance-sheet',
      label: 'Stato Patrimoniale',
      description: 'Assets, liabilities, equity',
      icon: <Coins className="h-5 w-5" />,
      url: '/?tab=financial-plan&subtab=balance-sheet',
      color: 'from-lime-500 to-lime-600',
      category: 'Financial',
      isSubTab: true,
    },
    {
      id: 'budget',
      label: 'Budget & Costs',
      description: 'Development budget & cost structure',
      icon: <Coins className="h-5 w-5" />,
      url: '/?tab=budget',
      color: 'from-amber-500 to-amber-600',
      category: 'Financial',
    },

    // OPERATIONS & EXECUTION (mostly sub-tabs)
    {
      id: 'team-orgchart',
      label: 'Team Org Chart',
      description: 'Organization structure & hierarchy',
      icon: <Users className="h-5 w-5" />,
      url: '/?tab=team&view=team&teamtab=orgchart',
      color: 'from-purple-500 to-purple-600',
      category: 'Operations',
      isSubTab: true,
    },
    {
      id: 'team-raci',
      label: 'RACI Matrix',
      description: 'Responsibility assignment matrix',
      icon: <Users className="h-5 w-5" />,
      url: '/?tab=team&view=team&teamtab=raci',
      color: 'from-indigo-500 to-indigo-600',
      category: 'Operations',
      isSubTab: true,
    },
    {
      id: 'team-okr',
      label: 'OKRs & Goals',
      description: 'Objectives and key results tracking',
      icon: <Target className="h-5 w-5" />,
      url: '/?tab=team&view=governance&governancetab=okr',
      color: 'from-pink-500 to-pink-600',
      category: 'Operations',
      isSubTab: true,
    },
    {
      id: 'timeline',
      label: 'Project Timeline',
      description: 'Gantt chart, milestones, deliverables',
      icon: <Calendar className="h-5 w-5" />,
      url: '/?tab=timeline',
      color: 'from-rose-500 to-rose-600',
      category: 'Operations',
    },

    // ANALYSIS & DATA (mostly sub-tabs)
    {
      id: 'tam-sam-som',
      label: 'TAM/SAM/SOM',
      description: 'Market size & addressable market',
      icon: <PieChart className="h-5 w-5" />,
      url: '/?tab=tam-sam-som',
      color: 'from-cyan-500 to-cyan-600',
      category: 'Analysis',
    },
    {
      id: 'mercato-riepilogo',
      label: 'Riepilogo Mercato',
      description: 'Market summary & key metrics',
      icon: <Map className="h-5 w-5" />,
      url: '/?tab=mercato&subtab=riepilogo',
      color: 'from-sky-500 to-sky-600',
      category: 'Analysis',
      isSubTab: true,
    },
    {
      id: 'mercato-ecografie',
      label: 'Mercato Ecografie Italia',
      description: 'Italian ultrasound market analysis',
      icon: <PieChart className="h-5 w-5" />,
      url: '/?tab=mercato&subtab=ecografie',
      color: 'from-blue-500 to-blue-600',
      category: 'Analysis',
      isSubTab: true,
    },
  ];

  // Group by category
  const categories = [
    { id: 'Strategy', label: '🎯 Strategy & Positioning', color: 'blue' },
    { id: 'Financial', label: '💰 Financial Planning', color: 'green' },
    { id: 'Operations', label: '⚙️ Operations & Execution', color: 'purple' },
    { id: 'Analysis', label: '📊 Analysis & Data', color: 'cyan' },
  ];

  const handleLinkClick = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Accesso rapido alle sezioni chiave dell&apos;applicazione. 
          Clicca per navigare direttamente anche ai sub-tab nascosti.
        </p>
      </div>

      {/* Links by Category */}
      {categories.map((category) => {
        const categoryLinks = quickLinks.filter(link => link.category === category.id);
        
        return (
          <div key={category.id}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-gray-800">{category.label}</h3>
              <Badge variant="outline" className="text-xs">
                {categoryLinks.length} links
              </Badge>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryLinks.map((link) => (
                <Card
                  key={link.id}
                  className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => handleLinkClick(link.url)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Content */}
                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-md`}>
                        {link.icon}
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {link.label}
                          </h4>
                          {link.isSubTab && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              sub
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">
                          {link.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-blue-500 text-xs font-semibold">→</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer Note */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Pro Tip</h4>
            <div className="text-sm text-amber-800">
              I link contrassegnati con{' '}
              <Badge variant="secondary" className="text-[10px] px-1 py-0 mx-1 inline-flex">
                sub
              </Badge>{' '}
              ti portano direttamente a sub-tab che non sono accessibili dalla barra principale. 
              Perfetto per accedere rapidamente a <strong>Messaging</strong>, <strong>Canvas</strong> e <strong>ROI Calculator</strong>!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
