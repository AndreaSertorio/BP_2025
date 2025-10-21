'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'task' | 'milestone' | 'meeting' | 'deadline' | 'vacation';
  assignee?: string;
  duration?: string; // "2h", "full-day", etc.
  location?: string;
  description?: string;
  color: string;
}

// Sample calendar events
const sampleEvents: CalendarEvent[] = [
  { id: 'E-1', title: 'PCB Review Meeting', date: '2025-10-20', type: 'meeting', assignee: 'CTO + HW Eng', duration: '2h', location: 'Lab', color: 'bg-blue-500', description: 'Final review PCB V1 schematic' },
  { id: 'E-2', title: 'Deadline: Prototipo HW V1', date: '2025-10-31', type: 'deadline', color: 'bg-red-500', description: 'Consegna prototipo completo' },
  { id: 'E-3', title: 'MILESTONE: Prototype Ready', date: '2025-12-31', type: 'milestone', color: 'bg-purple-500', description: 'Prototipo funzionante + firmware base' },
  { id: 'E-4', title: 'Training ML Model', date: '2025-10-15', type: 'task', assignee: 'AI Engineer', duration: 'full-day', color: 'bg-green-500', description: 'Training U-Net segmentation' },
  { id: 'E-5', title: 'Investor Pitch', date: '2025-10-25', type: 'meeting', assignee: 'CEO + COO', duration: '1h', location: 'VC Office', color: 'bg-orange-500', description: 'Pitch Series A' },
  { id: 'E-6', title: 'Team Vacation', date: '2025-12-25', type: 'vacation', duration: '1 week', color: 'bg-gray-400', description: 'Christmas break' },
  { id: 'E-7', title: 'FPGA Beamforming Implementation', date: '2025-10-18', type: 'task', assignee: 'CTO', duration: 'full-day', color: 'bg-green-500', description: 'Real-time beamforming algorithm' },
  { id: 'E-8', title: 'Sprint Planning Q4', date: '2025-10-01', type: 'meeting', assignee: 'Team', duration: '3h', location: 'Office', color: 'bg-blue-500', description: 'Q4 sprint planning session' },
  { id: 'E-9', title: 'Deadline: Firmware V1', date: '2025-09-30', type: 'deadline', color: 'bg-red-500', description: 'Firmware complete + tested' },
  { id: 'E-10', title: 'UI/UX Review', date: '2025-10-22', type: 'meeting', assignee: 'AI Eng + COO', duration: '1.5h', color: 'bg-blue-500', description: 'Review 3D visualization UI' }
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sampleEvents.filter(e => e.date === dateStr);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone': return '🏁';
      case 'deadline': return '⏰';
      case 'meeting': return '👥';
      case 'task': return '📋';
      case 'vacation': return '🏖️';
      default: return '📅';
    }
  };

  const selectedDateEvents = selectedDate ? sampleEvents.filter(e => e.date === selectedDate) : [];

  const stats = {
    totalEvents: sampleEvents.length,
    milestones: sampleEvents.filter(e => e.type === 'milestone').length,
    deadlines: sampleEvents.filter(e => e.type === 'deadline').length,
    meetings: sampleEvents.filter(e => e.type === 'meeting').length,
    tasks: sampleEvents.filter(e => e.type === 'task').length
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = getEventsForDate(day);
    const isToday = day === 15; // mock today
    const isSelected = selectedDate === dateStr;

    calendarDays.push(
      <div
        key={day}
        className={`aspect-square p-2 border rounded cursor-pointer transition-all ${
          isToday ? 'bg-blue-100 border-blue-400 font-bold' : 'bg-white border-gray-200'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`}
        onClick={() => setSelectedDate(dateStr)}
      >
        <div className="text-sm font-medium">{day}</div>
        <div className="space-y-0.5 mt-1">
          {events.slice(0, 2).map(event => (
            <div key={event.id} className={`text-xs ${event.color} text-white px-1 rounded truncate`} title={event.title}>
              {getEventIcon(event.type)} {event.title}
            </div>
          ))}
          {events.length > 2 && <div className="text-xs text-gray-500">+{events.length - 2} more</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Calendar View - Resource Schedule</h4>
              <p className="text-sm text-green-700 mb-3">
                Visualizzazione calendario per resource allocation, milestones, deadlines, meetings. 
                Sincronizzato con Gantt (milestones) e Kanban (task deadlines). Perfetto per capacity planning mensile.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div>🏁 Milestones</div>
                <div>⏰ Deadlines</div>
                <div>👥 Meetings</div>
                <div>📋 Tasks</div>
                <div>🏖️ Vacations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.totalEvents}</div><p className="text-xs text-muted-foreground">Total Events</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-purple-600">{stats.milestones}</div><p className="text-xs text-muted-foreground">Milestones</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-600">{stats.deadlines}</div><p className="text-xs text-muted-foreground">Deadlines</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{stats.meetings}</div><p className="text-xs text-muted-foreground">Meetings</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.tasks}</div><p className="text-xs text-muted-foreground">Tasks</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded" /> Today</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 ring-2 ring-blue-500 rounded" /> Selected</div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedDate ? `Events on ${new Date(selectedDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className={`p-3 ${event.color} bg-opacity-10 border-l-4 rounded`} style={{ borderColor: event.color.replace('bg-', '') }}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <Badge className={`${event.color} text-white text-xs mt-1`}>{event.type}</Badge>
                      </div>
                    </div>
                    {event.description && <p className="text-xs text-gray-700 mb-2">{event.description}</p>}
                    <div className="space-y-1 text-xs text-gray-600">
                      {event.assignee && <div className="flex items-center gap-1"><User className="h-3 w-3" />{event.assignee}</div>}
                      {event.duration && <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.duration}</div>}
                      {event.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                {selectedDate ? 'No events on this date' : 'Click on a date to view events'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upcoming Events (Next 7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleEvents.slice(0, 6).map(event => (
              <div key={event.id} className={`p-3 bg-white border-2 rounded-lg`} style={{ borderColor: event.color.replace('bg-', '') }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <Badge className={`${event.color} text-white text-xs`}>{event.type}</Badge>
                </div>
                <p className="font-semibold text-sm mb-1">{event.title}</p>
                <p className="text-xs text-gray-600 mb-2">{new Date(event.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
                {event.assignee && <p className="text-xs text-gray-600"><User className="h-3 w-3 inline mr-1" />{event.assignee}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
