'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Circle, PlayCircle, Zap, Info } from 'lucide-react';
import { ganttSampleData, criticalPathSummary } from '@/data/gantt-sample-data';

export function GanttChart() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const tasks = showOnlyCritical 
    ? ganttSampleData.filter(t => t.critical_path || t.milestone)
    : ganttSampleData;

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const dates = ganttSampleData.flatMap(t => [new Date(t.data_inizio), new Date(t.data_fine)]);
    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }, []);

  const totalDays = Math.ceil((timelineBounds.end.getTime() - timelineBounds.start.getTime()) / (1000 * 60 * 60 * 24));

  const getTaskPosition = (task: typeof ganttSampleData[0]) => {
    const taskStart = new Date(task.data_inizio);
    const taskEnd = new Date(task.data_fine);
    const startOffset = Math.ceil((taskStart.getTime() - timelineBounds.start.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startOffset / totalDays) * 100;
    const width = Math.max((duration / totalDays) * 100, 0.5);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'in-progress': return <PlayCircle className="h-3 w-3 text-blue-600" />;
      case 'delayed': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'blocked': return <AlertTriangle className="h-3 w-3 text-orange-600" />;
      default: return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'blocked': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const selectedTaskData = ganttSampleData.find(t => t.task_id === selectedTask);

  // Stats
  const stats = {
    totalTasks: ganttSampleData.filter(t => !t.milestone).length,
    milestones: ganttSampleData.filter(t => t.milestone).length,
    criticalTasks: ganttSampleData.filter(t => t.critical_path).length,
    inProgress: ganttSampleData.filter(t => t.stato === 'in-progress').length,
    completed: ganttSampleData.filter(t => t.progresso === 100).length,
    avgProgress: Math.round(ganttSampleData.reduce((sum, t) => sum + t.progresso, 0) / ganttSampleData.length)
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">Gantt + CPM - Timeline & Critical Path</h4>
              <p className="text-sm text-indigo-700 mb-3">
                Visualizzazione timeline progetto Eco 3D con Critical Path Method (CPM). Identifica il percorso critico 
                (zero slack) e dipendenze tra attività per ottimizzare schedulazione e resource allocation.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1"><Zap className="h-3 w-3 text-red-500" />Critical Path: zero slack</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />Slack: float disponibile</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-purple-600" />Milestones</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.totalTasks}</div><p className="text-xs text-muted-foreground">Tasks</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-purple-600">{stats.milestones}</div><p className="text-xs text-muted-foreground">Milestones</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-600">{stats.criticalTasks}</div><p className="text-xs text-muted-foreground">Critical</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.avgProgress}%</div><p className="text-xs text-muted-foreground">Avg Progress</p></CardContent></Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOnlyCritical(!showOnlyCritical)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                showOnlyCritical ? 'bg-red-100 text-red-700 border-2 border-red-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              {showOnlyCritical ? 'Mostra Tutti' : 'Solo Critical Path'}
            </button>
            <div className="text-sm text-gray-600">
              <strong>{criticalPathSummary.total_duration_days} giorni</strong> totali • 
              Completion: <strong>{criticalPathSummary.completion_date}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gantt Timeline - Eco 3D Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tasks.map(task => {
                const position = getTaskPosition(task);
                const isSelected = selectedTask === task.task_id;
                const isParent = task.parent_id === null;
                
                return (
                  <div key={task.task_id} className={`${isParent ? 'mb-2 border-t pt-2' : ''}`}>
                    <div
                      className={`cursor-pointer p-2 rounded transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTask(task.task_id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getStatoIcon(task.stato)}
                        <span className={`text-sm ${isParent ? 'font-bold' : 'font-medium'}`} style={{ paddingLeft: task.parent_id ? '20px' : '0' }}>
                          {task.nome}
                        </span>
                        <Badge variant="outline" className="text-xs">{task.task_id}</Badge>
                        {task.milestone && <Badge className="bg-purple-500 text-white text-xs">Milestone</Badge>}
                        {task.critical_path && <Zap className="h-3 w-3 text-red-500" />}
                      </div>
                      
                      {!task.milestone && (
                        <>
                          <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                            <div
                              className={`absolute h-full ${getStatoColor(task.stato)} opacity-70`}
                              style={position}
                            />
                            <div
                              className={`absolute h-full ${getStatoColor(task.stato)} border-2 border-white`}
                              style={{ ...position, width: `calc(${position.width} * ${task.progresso / 100})` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{formatDate(task.data_inizio)}</span>
                            <span className="font-medium">{task.progresso}%</span>
                            <span>{formatDate(task.data_fine)}</span>
                          </div>
                        </>
                      )}
                      {task.milestone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.data_inizio)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" />Task Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTaskData ? (
              <div className="space-y-4 text-sm">
                <div><p className="font-semibold text-gray-700 mb-1">Task:</p><p className="font-medium">{selectedTaskData.nome}</p></div>
                {selectedTaskData.descrizione && (<div><p className="font-semibold text-gray-700 mb-1">Descrizione:</p><p className="text-xs text-gray-600">{selectedTaskData.descrizione}</p></div>)}
                <div className="flex gap-2">
                  {selectedTaskData.milestone && <Badge className="bg-purple-500 text-white">Milestone</Badge>}
                  {selectedTaskData.critical_path && <Badge className="bg-red-500 text-white flex items-center gap-1"><Zap className="h-3 w-3" />Critical</Badge>}
                  <Badge className={`${getStatoColor(selectedTaskData.stato)} text-white`}>{selectedTaskData.stato}</Badge>
                </div>
                {!selectedTaskData.milestone && (
                  <>
                    <div><p className="font-semibold text-gray-700 mb-1">Periodo:</p><p className="text-xs">{formatDate(selectedTaskData.data_inizio)} → {formatDate(selectedTaskData.data_fine)}</p><p className="text-xs text-gray-600">{selectedTaskData.durata_giorni} giorni</p></div>
                    <div><p className="font-semibold text-gray-700 mb-1">Progresso:</p><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden"><div className={`h-full ${getStatoColor(selectedTaskData.stato)}`} style={{ width: `${selectedTaskData.progresso}%` }} /></div><span className="text-xs font-bold">{selectedTaskData.progresso}%</span></div></div>
                  </>
                )}
                {selectedTaskData.risorsa_assegnata && (<div><p className="font-semibold text-gray-700 mb-1">Risorsa:</p><p className="text-xs">{selectedTaskData.risorsa_assegnata}</p></div>)}
                {selectedTaskData.wbs_id && (<div><p className="font-semibold text-gray-700 mb-1">WBS Link:</p><Badge variant="outline">{selectedTaskData.wbs_id}</Badge></div>)}
                {selectedTaskData.predecessori && selectedTaskData.predecessori.length > 0 && (
                  <div><p className="font-semibold text-gray-700 mb-2">Dipendenze:</p><div className="space-y-1">{selectedTaskData.predecessori.map(pred => (<div key={pred} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"><span className="font-medium">{pred}</span><Badge variant="outline" className="text-xs">{selectedTaskData.tipo_dipendenza || 'FS'}</Badge></div>))}</div></div>
                )}
                {selectedTaskData.critical_path && selectedTaskData.slack !== undefined && (
                  <div><p className="font-semibold text-gray-700 mb-1">Slack (Float):</p><p className="text-lg font-bold text-red-600">{selectedTaskData.slack} giorni</p><p className="text-xs text-gray-600">Zero slack = Critical Path</p></div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Seleziona un task per vederne i dettagli</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
