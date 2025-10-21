'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Filter, Euro } from 'lucide-react';

// Tipi
interface AppTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  category: string;
  dependencies?: string[];
  note?: string;
  milestone?: boolean;
  cost?: number;
}

/**
 * Converte task dal database al formato richiesto da gantt-task-react
 */
function convertToGanttTask(
  task: AppTask,
  categories: Array<{ id: string; name: string; color: string }>
): Task {
  const category = categories.find(c => c.id === task.category);
  const backgroundColor = category?.color || '#3b82f6';
  
  // Genera tonalità più scura per la barra di progresso
  const progressColor = darkenColor(backgroundColor, 20);

  return {
    id: task.id,
    name: task.name,
    start: task.start,
    end: task.end,
    progress: task.progress,
    type: task.milestone ? 'milestone' : 'task',
    isDisabled: false,
    dependencies: task.dependencies || [],
    styles: {
      backgroundColor,
      progressColor,
      progressSelectedColor: progressColor
    }
  };
}

/**
 * Genera tonalità più scura di un colore hex
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

export function TimelineView() {
  const { data, loading, updateTask } = useDatabase();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<{taskId: string; field: 'start' | 'end' | 'cost'} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showTaskList, setShowTaskList] = useState(true);
  const [taskListWidth, setTaskListWidth] = useState(350);

  // Inizializza categorie attive
  useEffect(() => {
    if (data?.timeline?.filters?.activeCategories) {
      setActiveCategories(data.timeline.filters.activeCategories);
    }
  }, [data?.timeline?.filters?.activeCategories]);

  // Converti tasks dal database
  const appTasks = useMemo(() => {
    if (!data?.timeline?.tasks) return [];
    
    return data.timeline.tasks.map(task => ({
      id: task.id,
      name: task.name,
      start: parseISO(task.start_date),
      end: parseISO(task.end_date),
      progress: task.progress,
      category: task.category,
      dependencies: task.dependencies,
      note: task.note,
      milestone: task.milestone,
      cost: task.cost || 0
    }));
  }, [data?.timeline?.tasks]);

  // Filtra e converti tasks per Gantt
  const ganttTasks = useMemo(() => {
    if (!data?.timeline) return [];
    
    const filteredTasks = appTasks.filter(task => 
      activeCategories.length === 0 || activeCategories.includes(task.category)
    );
    
    return filteredTasks.map(task => 
      convertToGanttTask(task, data?.timeline?.categories || [])
    ).filter(Boolean);
  }, [appTasks, activeCategories, data?.timeline]);

  // Handler selezione task
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task.id);
  };

  // Handler modifica date tramite drag
  const handleTaskChange = async (task: Task) => {
    const updates = {
      start_date: format(task.start, 'yyyy-MM-dd'),
      end_date: format(task.end, 'yyyy-MM-dd'),
      progress: task.progress
    };
    
    await updateTask(task.id, updates);
  };

  // Handler editing inline
  const handleStartEdit = (taskId: string, field: 'start' | 'end' | 'cost') => {
    const task = appTasks.find(t => t.id === taskId);
    if (!task) return;

    let value = '';
    if (field === 'start') value = format(task.start, 'yyyy-MM-dd');
    else if (field === 'end') value = format(task.end, 'yyyy-MM-dd');
    else if (field === 'cost') value = String(task.cost || 0);

    setEditingField({ taskId, field });
    setEditValue(value);
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;

    const updates: Record<string, unknown> = {};
    if (editingField.field === 'start') updates.start_date = editValue;
    else if (editingField.field === 'end') updates.end_date = editValue;
    else if (editingField.field === 'cost') updates.cost = parseFloat(editValue) || 0;

    await updateTask(editingField.taskId, updates);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // Toggle categoria
  const toggleCategory = (categoryId: string) => {
    setActiveCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Caricamento timeline...</div>
      </div>
    );
  }

  if (!data?.timeline) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Nessuna timeline trovata nel database</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      {/* Header con controlli */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Progetto Eco 3D
              </CardTitle>
              <CardDescription>
                {data.timeline.description}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Toggle visibilità colonne */}
              <Button
                variant={showTaskList ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTaskList(!showTaskList)}
                className="h-8"
              >
                {showTaskList ? '📋 Nascondi Colonne' : '📋 Mostra Colonne'}
              </Button>
              
              {/* Vista temporale - Ordine crescente */}
              <div className="flex gap-1 border-l pl-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.QuarterDay)}
                  className={`h-8 ${viewMode === ViewMode.QuarterDay ? 'bg-primary text-primary-foreground' : ''}`}
                  title="6 ore (Quarter Day)"
                >
                  6h
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Day)}
                  className={`h-8 ${viewMode === ViewMode.Day ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  Giorno
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Week)}
                  className={`h-8 ${viewMode === ViewMode.Week ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  Settimana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Month)}
                  className={`h-8 ${viewMode === ViewMode.Month ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  Mese
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(ViewMode.Year)}
                  className={`h-8 ${viewMode === ViewMode.Year ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  Anno
                </Button>
              </div>
            </div>
          </div>
          
          {/* Controllo larghezza colonne (solo se visibili) */}
          {showTaskList && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">Larghezza colonne:</span>
              <Input
                type="range"
                min="150"
                max="600"
                step="10"
                value={taskListWidth}
                onChange={(e) => setTaskListWidth(parseInt(e.target.value))}
                className="w-64 h-2"
              />
              <span className="text-sm font-medium w-16 text-right">{taskListWidth}px</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Filtri categorie */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtra per categoria:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.timeline.categories.map(category => {
                const isActive = activeCategories.includes(category.id);
                return (
                  <Badge
                    key={category.id}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: isActive ? category.color : 'transparent',
                      borderColor: category.color,
                      color: isActive ? 'white' : category.color
                    }}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                );
              })}
              {activeCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategories([])}
                  className="h-6 text-xs"
                >
                  Mostra tutti
                </Button>
              )}
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="gantt-container border rounded-lg bg-white p-1">
            {ganttTasks.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <Gantt
                  tasks={ganttTasks}
                  viewMode={viewMode as ViewMode}
                  onDateChange={handleTaskChange}
                  onProgressChange={handleTaskChange}
                  onClick={handleTaskClick}
                  listCellWidth={showTaskList ? `${taskListWidth}px` : '0px'}
                  columnWidth={
                    viewMode === ViewMode.QuarterDay ? 250 :
                    viewMode === ViewMode.Day ? 50 : 
                    viewMode === ViewMode.Week ? 90 : 
                    viewMode === ViewMode.Month ? 65 : 
                    viewMode === ViewMode.Year ? 200 : 50
                  }
                  locale="it"
                  todayColor="rgba(59, 130, 246, 0.1)"
                  barBackgroundColor="#3b82f6"
                  barBackgroundSelectedColor="#2563eb"
                  TaskListHeader={({ headerHeight }) => (
                    showTaskList ? (
                      <div 
                        style={{ 
                          height: headerHeight,
                          display: 'flex',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          width: `${taskListWidth}px`
                        }}
                      >
                        <div style={{ 
                          width: `${taskListWidth * 0.5}px`, 
                          padding: '8px 12px', 
                          fontWeight: 600, 
                          fontSize: '13px',
                          borderRight: '1px solid #e2e8f0'
                        }}>
                          Nome Task
                        </div>
                        <div style={{ 
                          width: `${taskListWidth * 0.25}px`, 
                          padding: '8px 8px', 
                          fontWeight: 600, 
                          fontSize: '13px',
                          borderRight: '1px solid #e2e8f0',
                          textAlign: 'center'
                        }}>
                          From
                        </div>
                        <div style={{ 
                          width: `${taskListWidth * 0.25}px`, 
                          padding: '8px 8px', 
                          fontWeight: 600, 
                          fontSize: '13px',
                          textAlign: 'center'
                        }}>
                          To
                        </div>
                      </div>
                    ) : null
                  )}
                  TaskListTable={({ tasks, rowHeight }) => (
                    showTaskList ? (
                      <div>
                        {tasks.map((task, index) => {
                          const appTask = appTasks.find(t => t.id === task.id);
                          if (!appTask) return null;
                          
                          return (
                            <div 
                              key={task.id}
                              style={{ 
                                height: rowHeight,
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                width: `${taskListWidth}px`
                              }}
                            >
                              {/* Nome */}
                              <div style={{ 
                                width: `${taskListWidth * 0.5}px`, 
                                padding: '0 12px',
                                fontSize: '13px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                borderRight: '1px solid #e2e8f0'
                              }}>
                                {task.name}
                              </div>
                              
                              {/* Data From */}
                              <div style={{ 
                                width: `${taskListWidth * 0.25}px`, 
                                padding: '0 8px',
                                fontSize: '12px',
                                borderRight: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <input
                                  type="date"
                                  value={format(appTask.start, 'yyyy-MM-dd')}
                                  onChange={async (e) => {
                                    if (e.target.value) {
                                      await updateTask(task.id, { start_date: e.target.value });
                                    }
                                  }}
                                  style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    width: '100%',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              
                              {/* Data To */}
                              <div style={{ 
                                width: `${taskListWidth * 0.25}px`, 
                                padding: '0 8px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <input
                                  type="date"
                                  value={format(appTask.end, 'yyyy-MM-dd')}
                                  onChange={async (e) => {
                                    if (e.target.value) {
                                      await updateTask(task.id, { end_date: e.target.value });
                                    }
                                  }}
                                  style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    width: '100%',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null
                  )}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nessun task da visualizzare con i filtri selezionati
              </div>
            )}
          </div>

          {/* Info task selezionato */}
          {selectedTask && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              {(() => {
                const task = appTasks.find(t => t.id === selectedTask);
                if (!task) return null;
                
                const category = data.timeline.categories.find(c => c.id === task.category);
                const isEditingStart = editingField?.taskId === task.id && editingField.field === 'start';
                const isEditingEnd = editingField?.taskId === task.id && editingField.field === 'end';
                const isEditingCost = editingField?.taskId === task.id && editingField.field === 'cost';
                
                return (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">{task.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Inizio:</span>
                        {isEditingStart ? (
                          <div className="flex gap-1">
                            <Input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 w-32 text-xs"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2">✓</Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-2">✗</Button>
                          </div>
                        ) : (
                          <span 
                            className="cursor-pointer hover:underline text-blue-600"
                            onClick={() => handleStartEdit(task.id, 'start')}
                          >
                            {format(task.start, 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Fine:</span>
                        {isEditingEnd ? (
                          <div className="flex gap-1">
                            <Input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 w-32 text-xs"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2">✓</Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-2">✗</Button>
                          </div>
                        ) : (
                          <span 
                            className="cursor-pointer hover:underline text-blue-600"
                            onClick={() => handleStartEdit(task.id, 'end')}
                          >
                            {format(task.end, 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Progresso:</span>{' '}
                        {task.progress}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoria:</span>{' '}
                        <Badge style={{ backgroundColor: category?.color }}>
                          {category?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Euro className="h-3 w-3" /> Costo:
                        </span>
                        {isEditingCost ? (
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 w-24 text-xs"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2">✓</Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 px-2">✗</Button>
                          </div>
                        ) : (
                          <span 
                            className="cursor-pointer hover:underline text-blue-600 font-medium"
                            onClick={() => handleStartEdit(task.id, 'cost')}
                          >
                            €{(task.cost || 0).toLocaleString('it-IT')}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.note && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Note:</span> {task.note}
                      </div>
                    )}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Dipendenze:</span>{' '}
                        {task.dependencies.map(depId => {
                          const depTask = appTasks.find(t => t.id === depId);
                          return depTask?.name || depId;
                        }).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiche */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appTasks.filter(t => t.progress === 100).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appTasks.filter(t => t.progress > 0 && t.progress < 100).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appTasks.filter(t => t.milestone).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Euro className="h-4 w-4" />
              Costo Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{appTasks.reduce((sum, t) => sum + (t.cost || 0), 0).toLocaleString('it-IT')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
