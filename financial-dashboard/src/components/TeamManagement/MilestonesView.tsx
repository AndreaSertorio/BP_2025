'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface MilestonesViewProps {
  milestones: any[];
  openPositions: any[];
}

export function MilestonesView({ milestones, openPositions }: MilestonesViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Team Milestones
        </CardTitle>
        <CardDescription>Obiettivi chiave di crescita del team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map(milestone => {
            const requiredPositions = milestone.requiredPositions || [];
            const filledPositions = requiredPositions.filter((posId: string) => 
              !openPositions.find(p => p.id === posId)
            ).length;
            const progress = requiredPositions.length > 0 
              ? (filledPositions / requiredPositions.length) * 100 
              : 0;
            const milestoneDate = new Date(milestone.date);
            const now = new Date();
            const isPast = milestoneDate < now;
            const daysUntil = Math.ceil((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={milestone.id} className={`${progress === 100 ? 'border-green-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {progress === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <h4 className="font-semibold">{milestone.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    <Badge variant={isPast && progress < 100 ? 'destructive' : 'secondary'}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {milestoneDate.toLocaleDateString('it-IT')}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{progress.toFixed(0)}% ({filledPositions}/{requiredPositions.length})</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {!isPast && progress < 100 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {daysUntil > 0 ? `${daysUntil} giorni rimanenti` : 'Scaduto'}
                      </div>
                    )}

                    {isPast && progress < 100 && (
                      <p className="text-xs text-red-500 mt-2">
                        In ritardo di {Math.abs(daysUntil)} giorni
                      </p>
                    )}

                    {progress === 100 && (
                      <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Milestone completata!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
