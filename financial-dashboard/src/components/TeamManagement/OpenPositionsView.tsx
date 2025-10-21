'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OpenPositionsViewProps {
  openPositions: any[];
  departments: any[];
  skills: any[];
}

export function OpenPositionsView({ openPositions, departments, skills }: OpenPositionsViewProps) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredPositions = openPositions.filter(pos => {
    if (filterPriority && pos.priority !== filterPriority) return false;
    if (filterDepartment && pos.department !== filterDepartment) return false;
    if (filterStatus && pos.status !== filterStatus) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in-progress': return 'bg-purple-500 text-white';
      case 'planned': return 'bg-gray-500 text-white';
      case 'filled': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getDaysUntilHire = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Priorità</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterPriority === null ? 'default' : 'outline'}
                  onClick={() => setFilterPriority(null)}
                >
                  Tutte
                </Button>
                {['critical', 'high', 'medium', 'low'].map(priority => (
                  <Button
                    key={priority}
                    size="sm"
                    variant={filterPriority === priority ? 'default' : 'outline'}
                    onClick={() => setFilterPriority(priority)}
                    className="capitalize"
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Stato</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterStatus === null ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(null)}
                >
                  Tutti
                </Button>
                {['open', 'in-progress', 'planned'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filterStatus === status ? 'default' : 'outline'}
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Dipartimento</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filterDepartment === null ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment(null)}
                >
                  Tutti
                </Button>
                {departments.slice(1).map(dept => (
                  <Button
                    key={dept.id}
                    size="sm"
                    variant={filterDepartment === dept.id ? 'default' : 'outline'}
                    onClick={() => setFilterDepartment(dept.id)}
                  >
                    {dept.icon} {dept.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPositions.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">Nessuna Posizione Trovata</h3>
              <p className="text-sm">Prova a modificare i filtri o aggiungi nuove posizioni</p>
            </CardContent>
          </Card>
        ) : (
          filteredPositions.map(position => {
            const department = departments.find(d => d.id === position.department);
            const daysUntilHire = getDaysUntilHire(position.targetHireDate);
            const isUrgent = daysUntilHire < 90 && position.priority === 'critical';

            return (
              <Card 
                key={position.id} 
                className={`hover:shadow-lg transition-shadow ${isUrgent ? 'border-red-500 border-2' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(position.priority)}>
                          {position.priority === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {position.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(position.status)}>
                          {position.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <CardDescription className="mt-1">{position.description}</CardDescription>
                    </div>
                    <span className="text-3xl ml-2">{department?.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Department */}
                  <div className="mb-4">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: department?.color + '20',
                        color: department?.color
                      }}
                    >
                      {department?.name}
                    </Badge>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Target Hire</p>
                        <p className="font-medium">{new Date(position.targetHireDate).toLocaleDateString('it-IT')}</p>
                        {daysUntilHire > 0 && (
                          <p className={`text-xs ${daysUntilHire < 90 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            tra {daysUntilHire} giorni
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Compenso</p>
                        <p className="font-medium">€{(position.salary / 1000).toFixed(0)}K/anno</p>
                        {position.equity > 0 && (
                          <p className="text-xs text-green-600">+ {position.equity}% equity</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Skills Richieste</p>
                    <div className="flex flex-wrap gap-1">
                      {position.requiredSkills.map((skillId: string) => {
                        const skill = skills.find(s => s.id === skillId);
                        return (
                          <Badge 
                            key={skillId} 
                            variant="outline"
                            style={{ 
                              borderColor: skill?.color || '#ccc',
                              color: skill?.color || '#666'
                            }}
                          >
                            {skill?.name || skillId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Responsabilità</p>
                    <ul className="space-y-1">
                      {position.responsibilities.slice(0, 3).map((resp: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                      {position.responsibilities.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          + {position.responsibilities.length - 3} altre responsabilità
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Candidates */}
                  {position.candidates && position.candidates.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Candidati</p>
                      <Badge variant="secondary">
                        {position.candidates.length} in valutazione
                      </Badge>
                    </div>
                  )}

                  {/* Urgent Flag */}
                  {isUrgent && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-red-700 font-medium">
                        Assunzione urgente - Meno di 90 giorni
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Riepilogo Posizioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{openPositions.length}</p>
              <p className="text-xs text-muted-foreground">Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {openPositions.filter(p => p.priority === 'critical').length}
              </p>
              <p className="text-xs text-muted-foreground">Critiche</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                €{(openPositions.reduce((sum, p) => sum + p.salary, 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Budget Annuale</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {openPositions.reduce((sum, p) => sum + p.equity, 0).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Equity Totale</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
