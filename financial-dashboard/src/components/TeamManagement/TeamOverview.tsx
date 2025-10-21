'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Briefcase, TrendingUp, Clock } from 'lucide-react';

interface TeamOverviewProps {
  members: any[];
  departments: any[];
  openPositions: any[];
  stats: any;
  uiSettings: any;
}

export function TeamOverview({ members, departments, openPositions, stats, uiSettings }: TeamOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Current Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Attuale ({members.filter(m => m.status === 'active').length})
          </CardTitle>
          <CardDescription>Membri del team in forza</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nessun membro nel team</p>
              <p className="text-sm">Inizia ad assumere per costruire il tuo team!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-2xl">
                          {member.avatar || '👤'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{member.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            style={{ 
                              backgroundColor: departments.find(d => d.id === member.department)?.color + '20',
                              color: departments.find(d => d.id === member.department)?.color
                            }}
                          >
                            {departments.find(d => d.id === member.department)?.icon} {departments.find(d => d.id === member.department)?.name}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.slice(0, 3).map((skillId: string) => (
                            <Badge key={skillId} variant="outline" className="text-xs">
                              {skillId}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                      <span>Dal {new Date(member.hireDate).toLocaleDateString('it-IT')}</span>
                      {member.equity > 0 && <span>{member.equity}% equity</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Dipartimenti ({departments.length})
          </CardTitle>
          <CardDescription>Struttura organizzativa per dipartimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptMembers = members.filter(m => m.department === dept.id);
              const deptPositions = openPositions.filter(p => p.department === dept.id);
              
              return (
                <Card key={dept.id} className="border-2" style={{ borderColor: dept.color + '40' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{dept.icon}</span>
                        <div>
                          <h4 className="font-semibold">{dept.name}</h4>
                          <p className="text-xs text-muted-foreground">{dept.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Team</span>
                        <Badge variant="secondary">
                          {deptMembers.length} / {dept.targetHeadcount || deptMembers.length}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Posizioni Aperte</span>
                        <Badge variant="destructive">
                          {deptPositions.length}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <Badge variant="outline">
                          €{((dept.budget || 0) / 1000).toFixed(0)}K
                        </Badge>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Completamento</span>
                        <span>{dept.targetHeadcount ? Math.round((deptMembers.length / dept.targetHeadcount) * 100) : 100}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: dept.targetHeadcount ? `${(deptMembers.length / dept.targetHeadcount) * 100}%` : '100%',
                            backgroundColor: dept.color
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Crescita Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{stats.targetTeamSize - stats.currentTeamSize}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Crescita prevista nei prossimi 12-24 mesi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Time to Hire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ~3-6
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mesi stimati per assumere ruoli chiave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-500" />
              Equity Allocata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.reduce((sum, m) => sum + m.equity, 0) + 
               openPositions.reduce((sum, p) => sum + p.equity, 0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Del capitale totale allocato al team
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
