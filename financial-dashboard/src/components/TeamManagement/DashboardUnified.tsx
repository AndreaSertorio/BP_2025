'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Euro,
  Target,
  Calendar,
  Download,
  ArrowRight,
  Zap,
  Clock
} from 'lucide-react';

export function DashboardUnified() {
  // Mock aggregated data (in produzione verrebbero dai moduli reali)
  const projectStatus = {
    overallProgress: 35,
    phase: 'Phase 1: R&D Product Development',
    nextMilestone: {
      nome: 'Prototype Ready',
      data: '2025-12-31',
      daysLeft: 76
    },
    criticalTasks: 3,
    tasksAtRisk: 2,
    totalTasks: 22
  };

  const budgetStatus = {
    planned: 246000,
    spent: 129550,
    variance: -47.3,
    burnRate: 21000,
    runway: 5.5,
    trend: 'good' // 'good' | 'warning' | 'critical'
  };

  const teamCapacity = {
    activeMembers: 6,
    avgWorkload: 78,
    overloadedMembers: [
      { name: 'CTO', workload: 120 },
      { name: 'HW Engineer', workload: 110 }
    ],
    availableCapacity: 22, // %
    utilizationTrend: 'increasing'
  };

  const topRisks = [
    {
      id: 'R-1',
      descrizione: 'Ritardo fornitori componenti elettronici (chip shortage)',
      severità: 4,
      probabilità: 3,
      score: 12,
      mitigazione: 'Dual sourcing + inventory 3 mesi',
      owner: 'COO'
    },
    {
      id: 'R-2',
      descrizione: 'Delay certificazione MDR (Notified Body backlog)',
      severità: 5,
      probabilità: 2,
      score: 10,
      mitigazione: 'Pre-submission + early engagement NB',
      owner: 'QA/RA'
    },
    {
      id: 'R-3',
      descrizione: 'Ritardo sviluppo algoritmo ML segmentazione',
      severità: 3,
      probabilità: 3,
      score: 9,
      mitigazione: 'Consultancy esterno + dataset augmentation',
      owner: 'CTO'
    }
  ];

  const okrProgress = {
    quarter: 'Q4 2025',
    avgProgress: 65,
    objectives: 7,
    onTrack: 4,
    atRisk: 2,
    offTrack: 1,
    keyResults: [
      { objective: 'Prototipo Funzionante', progress: 85, status: 'on-track' },
      { objective: 'Firmware Base Ready', progress: 40, status: 'at-risk' },
      { objective: 'ML Model Trained', progress: 30, status: 'at-risk' }
    ]
  };

  const upcomingDeadlines = [
    { id: 'D-1', title: 'Prototipo HW V1', date: '2025-10-31', type: 'deadline', priority: 'critical', daysLeft: 15 },
    { id: 'D-2', title: 'Firmware V1 Complete', date: '2025-11-30', type: 'deadline', priority: 'high', daysLeft: 45 },
    { id: 'D-3', title: 'Training ML Model', date: '2025-12-15', type: 'task', priority: 'high', daysLeft: 60 },
    { id: 'D-4', title: 'MILESTONE: Prototype Ready', date: '2025-12-31', type: 'milestone', priority: 'critical', daysLeft: 76 },
    { id: 'D-5', title: 'EC Submission Dossier', date: '2026-06-30', type: 'deadline', priority: 'critical', daysLeft: 257 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': case 'on-track': return 'text-green-600';
      case 'warning': case 'at-risk': return 'text-yellow-600';
      case 'critical': case 'off-track': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard - Eco 3D Project</h2>
          <p className="text-sm text-muted-foreground">Vista unificata status progetto - Aggiornato: {new Date().toLocaleDateString('it-IT')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Grid 2x3 Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Project Status */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold text-blue-600">{projectStatus.overallProgress}%</span>
                <Badge variant="secondary" className="text-xs">{projectStatus.phase}</Badge>
              </div>
              <Progress value={projectStatus.overallProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Milestone:</span>
                <span className="font-medium">{projectStatus.nextMilestone.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {projectStatus.nextMilestone.data}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {projectStatus.nextMilestone.daysLeft} giorni
                </Badge>
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tasks:</span>
                <span className="font-medium">{projectStatus.totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical Tasks:</span>
                <span className="font-medium text-red-600">{projectStatus.criticalTasks}</span>
              </div>
              {projectStatus.tasksAtRisk > 0 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{projectStatus.tasksAtRisk} tasks at risk</span>
                </div>
              )}
            </div>

            <Button variant="link" size="sm" className="w-full text-blue-600 p-0">
              View Full Gantt <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget 2: Budget Status */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Euro className="h-4 w-4 text-green-600" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    €{(budgetStatus.spent / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of €{(budgetStatus.planned / 1000).toFixed(0)}K
                  </div>
                </div>
                <Badge className={`${budgetStatus.variance < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {budgetStatus.variance > 0 ? '+' : ''}{budgetStatus.variance.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={(budgetStatus.spent / budgetStatus.planned) * 100} 
                className="h-2" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-muted-foreground">Burn Rate</div>
                <div className="font-semibold">€{(budgetStatus.burnRate / 1000).toFixed(0)}K/mo</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-muted-foreground">Runway</div>
                <div className="font-semibold">{budgetStatus.runway} mesi</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-xs">
                {budgetStatus.variance < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Under budget - Good trend</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Over budget - Review needed</span>
                  </>
                )}
              </div>
            </div>

            <Button variant="link" size="sm" className="w-full text-green-600 p-0">
              View CBS Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget 3: Team Capacity */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Team Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold text-purple-600">{teamCapacity.activeMembers}</span>
                <Badge variant="secondary" className="text-xs">Active Members</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Workload: <span className="font-semibold">{teamCapacity.avgWorkload}%</span>
              </div>
              <Progress value={teamCapacity.avgWorkload} className="h-2 mt-2" />
            </div>

            {teamCapacity.overloadedMembers.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-900">
                    {teamCapacity.overloadedMembers.length} Overloaded Members
                  </span>
                </div>
                <div className="space-y-1">
                  {teamCapacity.overloadedMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-orange-700">{member.name}</span>
                      <Badge className="bg-orange-500 text-white">{member.workload}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="font-semibold">{teamCapacity.availableCapacity}%</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-muted-foreground">Trend</div>
                <div className="font-semibold capitalize">{teamCapacity.utilizationTrend}</div>
              </div>
            </div>

            <Button variant="link" size="sm" className="w-full text-purple-600 p-0">
              View RBS Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget 4: Top Risks */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {topRisks.map((risk) => (
                <div key={risk.id} className="bg-white border border-red-100 rounded p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-red-900 leading-tight">
                      {risk.descrizione}
                    </span>
                    <Badge className="bg-red-500 text-white shrink-0">
                      {risk.score}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Severity:</span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < risk.severità ? 'bg-red-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Probability:</span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < risk.probabilità ? 'bg-orange-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 border-t">
                    <span className="font-medium">Mitigation:</span> {risk.mitigazione}
                  </div>
                  <Badge variant="outline" className="text-xs">{risk.owner}</Badge>
                </div>
              ))}
            </div>

            <Button variant="link" size="sm" className="w-full text-red-600 p-0">
              View Full RAID Log <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget 5: OKR Progress */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              OKR Progress - {okrProgress.quarter}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-bold text-indigo-600">{okrProgress.avgProgress}%</span>
                <Badge variant="secondary" className="text-xs">{okrProgress.objectives} Objectives</Badge>
              </div>
              <Progress value={okrProgress.avgProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded border border-green-200 text-center">
                <div className="font-bold text-green-700">{okrProgress.onTrack}</div>
                <div className="text-green-600">On Track</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-center">
                <div className="font-bold text-yellow-700">{okrProgress.atRisk}</div>
                <div className="text-yellow-600">At Risk</div>
              </div>
              <div className="bg-red-50 p-2 rounded border border-red-200 text-center">
                <div className="font-bold text-red-700">{okrProgress.offTrack}</div>
                <div className="text-red-600">Off Track</div>
              </div>
            </div>

            <div className="space-y-2">
              {okrProgress.keyResults.map((kr, idx) => (
                <div key={idx} className="bg-white p-2 rounded border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{kr.objective}</span>
                    <Badge className={`${
                      kr.status === 'on-track' ? 'bg-green-100 text-green-700' :
                      kr.status === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    } text-xs`}>
                      {kr.progress}%
                    </Badge>
                  </div>
                  <Progress value={kr.progress} className="h-1" />
                </div>
              ))}
            </div>

            <Button variant="link" size="sm" className="w-full text-indigo-600 p-0">
              View Full OKR <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget 6: Upcoming Deadlines */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id} 
                  className={`bg-white border rounded p-2 ${
                    deadline.priority === 'critical' ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">
                          {deadline.type === 'milestone' ? '🏁' : deadline.type === 'deadline' ? '⏰' : '📋'}
                        </span>
                        <span className="text-xs font-medium leading-tight">
                          {deadline.title}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deadline.date}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`${getPriorityColor(deadline.priority)} text-white text-xs`}>
                        {deadline.daysLeft}d
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="link" size="sm" className="w-full text-orange-600 p-0">
              View Full Calendar <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Update Progress
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Milestone
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
