'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, GanttChart as GanttIcon, Kanban as KanbanIcon, Info } from 'lucide-react';
import { GanttChart } from './GanttChart';
import { CalendarView } from './CalendarView';
import { KanbanBoard } from './KanbanBoard';

export function ScheduleView() {
  const [activeTab, setActiveTab] = useState<'gantt' | 'calendar' | 'kanban'>('gantt');

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">Schedule Management - 3 Viste Unificate</h4>
              <p className="text-sm text-indigo-700 mb-3">
                Sistema unificato per gestione timeline, calendario risorse e workflow execution.
                <strong> I dati sono sincronizzati:</strong> milestones Gantt e deadlines Kanban appaiono automaticamente nel Calendar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
                  <GanttIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Gantt + CPM</p>
                    <p className="text-blue-700">Timeline progetto, critical path, dependencies</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
                  <CalendarIcon className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">Calendar</p>
                    <p className="text-purple-700">Monthly resource schedule, events, deadlines</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
                  <KanbanIcon className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Kanban</p>
                    <p className="text-green-700">Sprint workflow: Backlog → To Do → In Progress → Review → Done</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs bg-white/70 p-2 rounded border border-indigo-300">
                <p className="text-indigo-800">
                  <strong>🔗 Sincronizzazione automatica:</strong>
                </p>
                <ul className="list-disc ml-4 mt-1 space-y-0.5 text-indigo-700">
                  <li>Gantt milestones (4) → Calendar events automatici</li>
                  <li>Kanban task deadlines (12) → Calendar deadline alerts</li>
                  <li>WBS linkage: Kanban tasks collegati a WBS packages</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <GanttIcon className="h-4 w-4" />
            <span>Gantt + CPM</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <KanbanIcon className="h-4 w-4" />
            <span>Kanban</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="mt-6">
          <GanttChart />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView />
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsContent>
      </Tabs>

      {/* Synchronization Info Panel */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="text-xs space-y-2">
              <p className="font-semibold text-indigo-900">Come funziona la sincronizzazione:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="bg-white/50 p-3 rounded border border-indigo-200">
                  <p className="font-semibold text-blue-900 mb-1">📊 Gantt → Calendar</p>
                  <p className="text-blue-700">
                    I <strong>4 milestones</strong> Gantt (Prototype Ready, Validation Complete, Clinical Complete, Market Launch)
                    appaiono automaticamente nel Calendar come eventi tipo "🏁 Milestone" nelle date corrispondenti.
                  </p>
                </div>
                <div className="bg-white/50 p-3 rounded border border-indigo-200">
                  <p className="font-semibold text-green-900 mb-1">📋 Kanban → Calendar</p>
                  <p className="text-green-700">
                    I <strong>12 tasks</strong> Kanban con dueDate appaiono automaticamente nel Calendar come eventi tipo "⏰ Deadline".
                    I task critical/high priority sono evidenziati in rosso/arancione.
                  </p>
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded border border-purple-200 mt-3">
                <p className="font-semibold text-purple-900 mb-1">🔗 WBS Linkage</p>
                <p className="text-purple-700">
                  I Kanban tasks sono collegati ai WBS packages via <code className="bg-purple-100 px-1 rounded">wbs_id</code>.
                  Esempio: Task "Finalizza PCB V1" → WBS 1.1 "Prototipo HW V1". Questo permette di tracciare progress WBS dal Kanban status.
                </p>
              </div>
              <p className="text-indigo-600 mt-3">
                <strong>💡 Best Practice:</strong> Usa Gantt per pianificazione long-term, Calendar per resource scheduling short-term, Kanban per sprint execution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
