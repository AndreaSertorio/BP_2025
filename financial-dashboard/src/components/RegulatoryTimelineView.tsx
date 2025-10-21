'use client';

import React, { useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';

// Helper per convertire task app in task Gantt
function convertToGanttTask(task: any, categories: any[]): Task | null {
  try {
    const category = categories.find(c => c.id === task.category);
    
    return {
      id: task.id,
      name: task.name,
      start: new Date(task.start_date),
      end: new Date(task.end_date),
      progress: task.progress || 0,
      type: task.milestone ? 'milestone' : 'task',
      dependencies: task.dependencies || [],
      styles: {
        backgroundColor: category?.color || '#3b82f6',
        backgroundSelectedColor: category?.color ? shadeColor(category.color, -20) : '#2563eb',
        progressColor: '#4ade80',
        progressSelectedColor: '#22c55e',
      },
    };
  } catch (error) {
    console.error('Error converting task:', task, error);
    return null;
  }
}

// Helper per scurire colore
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * RegulatoryTimelineView
 * Visualizzazione Timeline filtrata per task regolatorio MDR e FDA
 * Da usare nella sezione Business Plan "7. Regolatorio & Clinico"
 */
export function RegulatoryTimelineView() {
  const { data } = useDatabase();

  // Filtra solo task regolatorio e FDA
  const regulatoryTasks = useMemo(() => {
    if (!data?.timeline?.tasks) return [];
    
    return data.timeline.tasks.filter(task => 
      task.category === 'cat_regolatorio' || task.category === 'cat_fda'
    );
  }, [data?.timeline?.tasks]);

  // Converti in formato Gantt
  const ganttTasks = useMemo(() => {
    if (!data?.timeline) return [];
    
    return regulatoryTasks.map(task => 
      convertToGanttTask(task, data?.timeline?.categories || [])
    ).filter(Boolean) as Task[];
  }, [regulatoryTasks, data?.timeline]);

  // Categorie regolatorio
  const categories = useMemo(() => {
    if (!data?.timeline?.categories) return [];
    
    return data.timeline.categories.filter(cat => 
      cat.id === 'cat_regolatorio' || cat.id === 'cat_fda'
    );
  }, [data?.timeline?.categories]);

  // Calcola statistiche
  const stats = useMemo(() => {
    const totalTasks = ganttTasks.length;
    const completedTasks = ganttTasks.filter(t => t.progress === 100).length;
    const avgProgress = totalTasks > 0
      ? Math.round(ganttTasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
      : 0;
    
    const totalCost = regulatoryTasks.reduce((sum, t) => sum + (t.cost || 0), 0);
    
    const minDate = ganttTasks.length > 0
      ? new Date(Math.min(...ganttTasks.map(t => t.start.getTime())))
      : new Date();
    
    const maxDate = ganttTasks.length > 0
      ? new Date(Math.max(...ganttTasks.map(t => t.end.getTime())))
      : new Date();
    
    const durationMonths = Math.ceil(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    return {
      totalTasks,
      completedTasks,
      avgProgress,
      totalCost,
      minDate,
      maxDate,
      durationMonths
    };
  }, [ganttTasks, regulatoryTasks]);

  if (!data?.timeline || ganttTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Nessun task regolatorio trovato nella timeline
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con statistiche */}
      <Card className="bg-gradient-to-r from-red-50 to-purple-50 border-2 border-red-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-red-600" />
                Timeline Regolatorio MDR & FDA
              </CardTitle>
              <CardDescription className="mt-1">
                Visualizzazione task certificazioni e approvazioni
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {categories.map(cat => (
                <Badge 
                  key={cat.id} 
                  style={{ backgroundColor: cat.color }}
                  className="text-white"
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Statistiche */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalTasks}</div>
              <div className="text-xs text-gray-600">Task totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <div className="text-xs text-gray-600">Completati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgProgress}%</div>
              <div className="text-xs text-gray-600">Progress medio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">€{(stats.totalCost / 1000).toFixed(0)}k</div>
              <div className="text-xs text-gray-600">Budget totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.durationMonths}</div>
              <div className="text-xs text-gray-600">Mesi durata</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-red-200 text-xs text-gray-600 text-center">
            📅 Da {stats.minDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })} a {stats.maxDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-4">
          <div className="gantt-container border rounded-lg bg-white overflow-x-auto">
            <Gantt
              tasks={ganttTasks}
              viewMode={ViewMode.Month}
              listCellWidth="0px"
              columnWidth={80}
              locale="it"
              todayColor="rgba(239, 68, 68, 0.1)"
              barBackgroundColor="#ef4444"
              barBackgroundSelectedColor="#dc2626"
              barProgressColor="#22c55e"
              barProgressSelectedColor="#16a34a"
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-600 font-semibold">📋 Task Regolatorio ({categories[0]?.name || 'Regolatorio'}):</p>
            <div className="grid md:grid-cols-2 gap-2">
              {regulatoryTasks
                .filter(t => t.category === 'cat_regolatorio')
                .map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-xs p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex-1">
                      <span className="font-medium">{task.name}</span>
                      <span className="text-gray-500 ml-2">
                        ({new Date(task.start_date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })} 
                        → 
                        {new Date(task.end_date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.progress}%
                    </Badge>
                  </div>
                ))}
            </div>

            <p className="text-xs text-gray-600 font-semibold mt-4">🇺🇸 Task FDA ({categories[1]?.name || 'FDA'}):</p>
            <div className="grid md:grid-cols-2 gap-2">
              {regulatoryTasks
                .filter(t => t.category === 'cat_fda')
                .map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-xs p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="flex-1">
                      <span className="font-medium">{task.name}</span>
                      <span className="text-gray-500 ml-2">
                        ({new Date(task.start_date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })} 
                        → 
                        {new Date(task.end_date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.progress}%
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
