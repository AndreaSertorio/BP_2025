'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface TeamTimelineProps {
  members: any[];
  openPositions: any[];
  milestones: any[];
}

export function TeamTimeline({ members, openPositions, milestones }: TeamTimelineProps) {
  const timelineEvents = [
    ...members.map(m => ({
      id: m.id,
      type: 'hire',
      date: m.hireDate,
      title: `${m.name} - ${m.role}`,
      status: 'completed',
      description: `Assunto come ${m.role}`
    })),
    ...openPositions.map(p => ({
      id: p.id,
      type: 'planned-hire',
      date: p.targetHireDate,
      title: p.title,
      status: p.status,
      description: `Target assunzione - ${p.department}`,
      priority: p.priority
    })),
    ...milestones.map(m => ({
      id: m.id,
      type: 'milestone',
      date: m.date,
      title: m.title,
      status: m.status,
      description: m.description
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const now = new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline Assunzioni
          </CardTitle>
          <CardDescription>Cronologia e piano assunzioni team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            <div className="space-y-6">
              {timelineEvents.map((event, idx) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < now;
                const isToday = eventDate.toDateString() === now.toDateString();
                
                return (
                  <div key={event.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 top-2 h-4 w-4 rounded-full border-2 flex items-center justify-center
                      ${event.status === 'completed' ? 'bg-green-500 border-green-600' : 
                        event.status === 'in-progress' ? 'bg-blue-500 border-blue-600' :
                        isPast && event.status !== 'completed' ? 'bg-red-500 border-red-600' :
                        'bg-white border-gray-400'}`}
                    >
                      {event.status === 'completed' && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                      {event.status === 'in-progress' && (
                        <Circle className="h-2 w-2 text-white fill-white animate-pulse" />
                      )}
                    </div>

                    <Card className={`${isToday ? 'border-2 border-blue-500' : ''} 
                      ${event.priority === 'critical' ? 'border-l-4 border-l-red-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={event.type === 'milestone' ? 'default' : 'secondary'}>
                                {event.type === 'hire' ? '✓ Assunto' : 
                                 event.type === 'milestone' ? '🎯 Milestone' : 
                                 '📋 Pianificato'}
                              </Badge>
                              {event.priority === 'critical' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  CRITICAL
                                </Badge>
                              )}
                              {isToday && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                                  Oggi
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {eventDate.toLocaleDateString('it-IT')}
                            </div>
                            {!isPast && event.status !== 'completed' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                tra {Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} giorni
                              </p>
                            )}
                            {isPast && event.status !== 'completed' && (
                              <p className="text-xs text-red-500 mt-1">
                                {Math.abs(Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))} giorni fa
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {timelineEvents.filter(e => e.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completati</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {timelineEvents.filter(e => e.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">In Corso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {timelineEvents.filter(e => e.status === 'planned').length}
            </div>
            <p className="text-xs text-muted-foreground">Pianificati</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {timelineEvents.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate < now && e.status !== 'completed';
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">In Ritardo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
