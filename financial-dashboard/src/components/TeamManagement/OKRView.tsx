'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Target, TrendingUp, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import type { OKR, KeyResult, TeamMember } from '@/types/team';

interface OKRViewProps {
  members: TeamMember[];
}

export function OKRView({ members }: OKRViewProps) {
  // Sample OKRs
  const [okrs] = useState<OKR[]>([
    {
      id: 'OKR-Q2-MVP',
      objective: 'Validare MVP tecnico entro Q2 2025',
      periodo: '2025-Q2',
      owner: 'member_001',
      score: 65,
      link_wbs: ['1.3', '2.2'],
      key_results: [
        {
          label: 'Reco 3D base funzionante',
          target: 100,
          current: 75,
          metrica: '% completamento',
          owner: 'member_001'
        },
        {
          label: 'Test usabilità 62366 completato',
          target: 1,
          current: 0,
          metrica: 'numero test',
          owner: 'member_001'
        },
        {
          label: 'Demo clinica con 2 medici',
          target: 2,
          current: 1,
          metrica: 'numero demo',
          owner: 'member_001'
        }
      ]
    },
    {
      id: 'OKR-Q3-REG',
      objective: 'Completare documentazione regolatoria MDR',
      periodo: '2025-Q3',
      owner: 'member_001',
      score: 30,
      link_wbs: ['2.3', '3.1'],
      key_results: [
        {
          label: 'Risk Management File ISO 14971',
          target: 100,
          current: 40,
          metrica: '% completamento',
          owner: 'member_001'
        },
        {
          label: 'Software documentation IEC 62304',
          target: 100,
          current: 25,
          metrica: '% completamento',
          owner: 'member_001'
        },
        {
          label: 'Clinical evaluation report',
          target: 1,
          current: 0,
          metrica: 'documento',
          owner: 'member_001'
        }
      ]
    },
    {
      id: 'OKR-Q4-FUND',
      objective: 'Chiudere round seed €500K',
      periodo: '2025-Q4',
      owner: 'member_001',
      score: 20,
      link_wbs: ['5.1'],
      key_results: [
        {
          label: 'Investor deck completato',
          target: 1,
          current: 1,
          metrica: 'documento',
          owner: 'member_001'
        },
        {
          label: 'Meeting con investitori',
          target: 10,
          current: 3,
          metrica: 'numero meeting',
          owner: 'member_001'
        },
        {
          label: 'Term sheet firmato',
          target: 1,
          current: 0,
          metrica: 'documento',
          owner: 'member_001'
        }
      ]
    }
  ]);

  const calculateKRProgress = (kr: KeyResult): number => {
    if (typeof kr.target === 'number' && typeof kr.current === 'number') {
      return Math.min(100, (kr.current / kr.target) * 100);
    }
    return 0;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 70) return 'On Track';
    if (score >= 40) return 'At Risk';
    return 'Off Track';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">OKR - Objectives & Key Results</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Framework per definire obiettivi ambiziosi e misurarne il progresso con metriche concrete.
                </p>
                <div className="text-xs text-purple-600 space-y-1">
                  <p><strong>Objective:</strong> Obiettivo qualitativo e ambizioso (cosa vogliamo raggiungere)</p>
                  <p><strong>Key Results:</strong> Metriche quantitative (come misuriamo il successo)</p>
                  <p><strong>Score:</strong> Media % completamento KR (70%+ = successo)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OKRs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {okrs.map(okr => {
            const owner = members.find(m => m.id === okr.owner);
            return (
              <Card key={okr.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {okr.periodo}
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              className={`text-xs ${
                                okr.score && okr.score >= 70 ? 'bg-green-500' :
                                okr.score && okr.score >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            >
                              {okr.score}% {getScoreLabel(okr.score || 0)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Score medio Key Results</p>
                            <p className="text-xs">70%+ = Successo</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardTitle className="text-lg mb-2">{okr.objective}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{owner?.name || 'Owner'}</span>
                        {okr.link_wbs && okr.link_wbs.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="text-xs">
                                {okr.link_wbs.length} WBS linked
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Work packages collegati:</p>
                              {okr.link_wbs.map(wbs => (
                                <p key={wbs} className="text-xs">• {wbs}</p>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(okr.score || 0)}`}>
                      {okr.score}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-xs text-muted-foreground">
                          {okr.key_results.filter(kr => calculateKRProgress(kr) === 100).length}/
                          {okr.key_results.length} KR completed
                        </span>
                      </div>
                      <Progress value={okr.score} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        Key Results
                      </h4>
                      {okr.key_results.map((kr, idx) => {
                        const progress = calculateKRProgress(kr);
                        const isComplete = progress === 100;
                        return (
                          <Card key={idx} className={`p-3 ${isComplete ? 'bg-green-50 border-green-200' : ''}`}>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${isComplete ? 'line-through text-green-700' : ''}`}>
                                    {kr.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {kr.current} / {kr.target} {kr.metrica}
                                  </p>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {isComplete ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : progress >= 70 ? (
                                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{progress.toFixed(0)}% completato</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{okrs.length}</div>
              <p className="text-xs text-muted-foreground">OKR Attivi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {okrs.filter(o => (o.score || 0) >= 70).length}
              </div>
              <p className="text-xs text-muted-foreground">On Track (≥70%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {okrs.filter(o => (o.score || 0) >= 40 && (o.score || 0) < 70).length}
              </div>
              <p className="text-xs text-muted-foreground">At Risk (40-69%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {okrs.filter(o => (o.score || 0) < 40).length}
              </div>
              <p className="text-xs text-muted-foreground">Off Track (&lt;40%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Best Practices */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-600" />
              Best Practices OKR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span><strong>3-5 Objectives per quarter</strong> - Focus su priorità critiche</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span><strong>3-5 Key Results per Objective</strong> - Metriche concrete e misurabili</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span><strong>Ambitious but achievable</strong> - Target 70% = successo (non 100%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span><strong>Weekly check-ins</strong> - Update progress e identificare blockers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span><strong>Link to WBS</strong> - Collegare OKR a work packages concreti</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
