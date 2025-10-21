'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, PlayCircle, CheckCircle2, AlertCircle, Clock, User, Calendar } from 'lucide-react';

interface KanbanTask {
  id: string;
  wbs_id?: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  tags?: string[];
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
}

// Sample Kanban tasks based on WBS
const sampleTasks: KanbanTask[] = [
  { id: 'K-1', wbs_id: '1.1', title: 'Finalizza PCB V1', description: 'Review finale schematico + layout', assignee: 'HW Engineer', priority: 'critical', dueDate: '2025-07-31', tags: ['hardware', 'prototipo'], status: 'in-progress' },
  { id: 'K-2', wbs_id: '1.1', title: 'Test trasduttori 64ch', description: 'Validazione segnale 2-15 MHz', assignee: 'CTO', priority: 'high', dueDate: '2025-07-25', tags: ['hardware', 'test'], status: 'in-progress' },
  { id: 'K-3', wbs_id: '1.2', title: 'Driver FPGA beamforming', description: 'Implementazione algoritmo real-time', assignee: 'CTO', priority: 'critical', dueDate: '2025-09-15', tags: ['firmware', 'fpga'], status: 'todo' },
  { id: 'K-4', wbs_id: '1.3', title: 'Training modello U-Net', description: 'Dataset 500 immagini segmentazione', assignee: 'AI Engineer', priority: 'high', dueDate: '2025-11-30', tags: ['ai', 'ml'], status: 'todo' },
  { id: 'K-5', wbs_id: '2.1', title: 'EMC testing IEC 60601-1-2', description: 'Test lab esterno certificato', assignee: 'HW Engineer', priority: 'critical', dueDate: '2026-02-28', tags: ['regulatory', 'test'], status: 'backlog' },
  { id: 'K-6', wbs_id: '2.2', title: 'Usability test 10 medici', description: 'Sessioni 1h + report IEC 62366', assignee: 'COO', priority: 'high', dueDate: '2026-04-30', tags: ['regulatory', 'usability'], status: 'backlog' },
  { id: 'K-7', wbs_id: '1.1', title: 'Housing prototipo stampa 3D', description: 'Stampa case + handle ergonomico', assignee: 'HW Engineer', priority: 'medium', dueDate: '2025-07-20', tags: ['hardware', 'meccanica'], status: 'review' },
  { id: 'K-8', wbs_id: '1.3', title: 'UI/UX visualizzazione 3D', description: 'React component viewer volumetrico', assignee: 'AI Engineer', priority: 'medium', dueDate: '2025-10-15', tags: ['software', 'ui'], status: 'todo' },
  { id: 'K-9', wbs_id: '1.1', title: 'PCB assembly V1', description: 'Assemblaggio componenti SMD', assignee: 'Vendor A', priority: 'critical', dueDate: '2025-06-30', tags: ['hardware', 'produzione'], status: 'done' },
  { id: 'K-10', wbs_id: '2.3', title: 'Risk Management ISO 14971', description: 'FMEA + Risk-Benefit analysis', assignee: 'QA/RA Consultant', priority: 'critical', dueDate: '2026-05-31', tags: ['regulatory', 'risk'], status: 'backlog' },
  { id: 'K-11', wbs_id: '1.2', title: 'DAQ firmware module', description: 'Buffer management + USB interface', assignee: 'CTO', priority: 'high', dueDate: '2025-09-01', tags: ['firmware', 'daq'], status: 'in-progress' },
  { id: 'K-12', wbs_id: '1.3', title: 'Export DICOM feature', description: 'Integrazione libreria DICOM standard', assignee: 'AI Engineer', priority: 'low', dueDate: '2025-12-15', tags: ['software', 'dicom'], status: 'todo' }
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>(sampleTasks);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const columns: { id: KanbanTask['status']; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'backlog', title: 'Backlog', icon: <Circle className="h-4 w-4" />, color: 'bg-gray-100 border-gray-300' },
    { id: 'todo', title: 'To Do', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 border-blue-300' },
    { id: 'in-progress', title: 'In Progress', icon: <PlayCircle className="h-4 w-4" />, color: 'bg-yellow-100 border-yellow-300' },
    { id: 'review', title: 'Review', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-purple-100 border-purple-300' },
    { id: 'done', title: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-100 border-green-300' }
  ];

  const getTasksByStatus = (status: KanbanTask['status']) => {
    return tasks.filter(t => t.status === status);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  };

  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === 'backlog').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    critical: tasks.filter(t => t.priority === 'critical').length
  };

  const selectedTaskData = tasks.find(t => t.id === selectedTask);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <PlayCircle className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Kanban Board - Visual Workflow</h4>
              <p className="text-sm text-purple-700 mb-3">
                Visualizzazione alternativa WBS tasks in workflow Kanban. Drag-and-drop tra colonne (Backlog → To Do → In Progress → Review → Done).
                Perfetto per daily standup e sprint planning agile.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1"><Circle className="h-3 w-3 text-gray-600" />Backlog</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-600" />To Do</div>
                <div className="flex items-center gap-1"><PlayCircle className="h-3 w-3 text-yellow-600" />In Progress</div>
                <div className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-purple-600" />Review</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" />Done</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">Total Tasks</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-gray-600">{stats.backlog}</div><p className="text-xs text-muted-foreground">Backlog</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.done}</div><p className="text-xs text-muted-foreground">Done</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-600">{stats.critical}</div><p className="text-xs text-muted-foreground">Critical</p></CardContent></Card>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <Card key={column.id} className={`border-2 ${column.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <span>{column.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{columnTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedTask === task.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-1 h-full ${getPriorityColor(task.priority)} rounded`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-600 mb-2">{task.description}</p>}
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.wbs_id && <Badge variant="outline" className="text-xs">{task.wbs_id}</Badge>}
                            <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>{task.priority}</Badge>
                          </div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {task.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                            {task.assignee && <div className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignee}</div>}
                            {task.dueDate && <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(task.dueDate)}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Detail Panel */}
      {selectedTaskData && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">Task Detail: {selectedTaskData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold text-gray-700">ID:</span> <Badge variant="outline">{selectedTaskData.id}</Badge></div>
              {selectedTaskData.wbs_id && <div><span className="font-semibold text-gray-700">WBS:</span> <Badge variant="outline">{selectedTaskData.wbs_id}</Badge></div>}
              <div><span className="font-semibold text-gray-700">Status:</span> <Badge className="bg-blue-500 text-white">{selectedTaskData.status}</Badge></div>
              <div><span className="font-semibold text-gray-700">Priority:</span> <Badge className={`${getPriorityColor(selectedTaskData.priority)} text-white`}>{selectedTaskData.priority}</Badge></div>
              {selectedTaskData.assignee && <div><span className="font-semibold text-gray-700">Assignee:</span> {selectedTaskData.assignee}</div>}
              {selectedTaskData.dueDate && <div><span className="font-semibold text-gray-700">Due Date:</span> {formatDate(selectedTaskData.dueDate)}</div>}
              {selectedTaskData.description && <div className="md:col-span-2"><span className="font-semibold text-gray-700">Description:</span> <p className="text-xs text-gray-600 mt-1">{selectedTaskData.description}</p></div>}
              {selectedTaskData.tags && selectedTaskData.tags.length > 0 && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Tags:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedTaskData.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
