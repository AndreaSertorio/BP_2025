# 🏗️ DESIGN UNIFICAZIONE - ARCHITETTURA DETTAGLIATA

**Data:** 16 Ottobre 2025  
**Obiettivo:** Zero perdita funzionalità + Sincronizzazione corretta

---

## 📊 ANALISI COMPONENTI

### 1. RAM vs RACI - UNIFICARE ✅

**RAMMatrix.tsx:**
- OBS Structure (CEO, CTO, COO, QA, Clinical, CFO)
- WBS × OBS matrix
- RACI nomenclatura (R/A/C/I)
- 8 WBS packages

**RACIMatrix.tsx:**
- Real team members da props
- Interactive editing (toggle role per cell)
- **Validation rules:** 1 A, ≥1 R per task
- Visual feedback errors
- Role colors + legend

**PRESERVARE:**
- ✅ OBS structure (fallback se no members)
- ✅ Interactive editing (toggle)
- ✅ Validation rules (critical!)
- ✅ Real team members (props)
- ✅ Color coding (merge entrambi)

**NUOVO COMPONENTE:** `ResponsibilityMatrix.tsx`
- Merge features entrambi
- Props: members, wbsPackages
- Interactive + validation
- OBS structure fallback

---

### 2. Schedule: Gantt + Calendar + Kanban - SUB-TABS ✅

**NON unificare completamente** (troppo diversi!)

**SOLUZIONE:** `ScheduleView.tsx` container con 3 sub-tabs:

#### **Tab 1: Gantt** (PRESERVATO 100%)
- Timeline visualization
- Critical Path Method (CPM)
- Dependencies (predecessori)
- Slack calculation
- ES/EF, LS/LF dates
- Progress bars
- Milestones
- Filter critical path

#### **Tab 2: Calendar** (PRESERVATO 100%)
- Monthly grid view
- 5 event types (task, milestone, meeting, deadline, vacation)
- Navigation prev/next month
- Selected date drill-down
- Upcoming events
- Resource schedule

#### **Tab 3: Kanban** (PRESERVATO 100%)
- 5 workflow columns (Backlog → Done)
- Task cards (priority, assignee, due date, tags)
- WBS linkage (wbs_id)
- Sprint planning
- WIP monitoring

**🔗 SINCRONIZZAZIONE CRITICA:**

```typescript
// In ScheduleView.tsx - container

// 1. Gantt milestones → Calendar events
useEffect(() => {
  const milestones = ganttTasks.filter(t => t.milestone);
  const events = milestones.map(m => ({
    id: `gantt-${m.task_id}`,
    title: m.nome,
    date: m.data_fine,
    type: 'milestone',
    color: 'bg-purple-500'
  }));
  setCalendarEvents(prev => [...prev.filter(e => !e.id.startsWith('gantt-')), ...events]);
}, [ganttTasks]);

// 2. Kanban deadlines → Calendar events
useEffect(() => {
  const withDeadlines = kanbanTasks.filter(t => t.dueDate);
  const events = withDeadlines.map(k => ({
    id: `kanban-${k.id}`,
    title: `Due: ${k.title}`,
    date: k.dueDate!,
    type: 'deadline',
    color: k.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'
  }));
  setCalendarEvents(prev => [...prev.filter(e => !e.id.startsWith('kanban-')), ...events]);
}, [kanbanTasks]);

// 3. WBS tasks ↔ Kanban tasks (via wbs_id)
// Mantieni link, sincronizza stati
```

---

## 📤 EXPORT REALI - IMPLEMENTAZIONE

### **Installare Librerie:**
```bash
npm install xlsx jspdf jspdf-autotable
```

### **ExportService.ts (NEW):**
```typescript
// src/services/ExportService.ts

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ExportService {
  static exportToExcel(data: any[], filename: string, sheetName: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
  }
  
  static exportToPDF(title: string, tables: any[], filename: string) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(title, 14, 20);
    
    let currentY = 40;
    tables.forEach(table => {
      doc.setFontSize(14);
      doc.text(table.title, 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [table.headers],
        body: table.rows
      });
      currentY = doc.lastAutoTable.finalY + 15;
    });
    
    doc.save(`${filename}_${Date.now()}.pdf`);
  }
}
```

### **Usare in Componenti:**
```typescript
// In ogni componente modulo:
import { ExportService } from '@/services/ExportService';

const handleExportExcel = () => {
  const data = wbsPackages.map(w => ({
    'WBS ID': w.wbs_id,
    'Nome': w.nome,
    'Owner': w.owner,
    'Budget': w.budget,
    'Progress': `${w.progresso}%`
  }));
  ExportService.exportToExcel(data, 'WBS_Eco3D', 'WBS');
};
```

---

## 🎯 PIANO IMPLEMENTAZIONE

### **FASE 1: Unificare RAM/RACI (4h)**
1. Creare `ResponsibilityMatrix.tsx`
2. Merge features RAMMatrix + RACIMatrix
3. Interactive editing + validation
4. Test validation rules (1 A, ≥1 R)
5. Integrare in TeamView

### **FASE 2: Schedule Container (3h)**
1. Creare `ScheduleView.tsx` container
2. Sub-tabs: Gantt, Calendar, Kanban
3. Implementare sincronizzazione:
   - Gantt milestones → Calendar
   - Kanban deadlines → Calendar
4. Test sincronizzazione bidirezionale
5. Integrare in dashboard principale

### **FASE 3: Export Reali (4h)**
1. Installare librerie (xlsx, jspdf)
2. Creare `ExportService.ts`
3. Implementare exportToExcel()
4. Implementare exportToPDF()
5. Integrare in tutti i moduli
6. Test download files (verificare file creati!)

### **FASE 4: Dashboard Unificata (4h)**
1. Creare `DashboardUnified.tsx`
2. 6 widgets (Project, Budget, Team, Risks, OKR, Deadlines)
3. Data aggregation da moduli
4. Quick links moduli
5. Export dashboard PDF

### **FASE 5: Refactoring Dashboard (3h)**
1. Aggiornare `TeamManagementDashboard.tsx`
2. 20 → 8 tab structure
3. Test navigation
4. Mobile responsive
5. Polish UI

### **FASE 6: Testing Finale (2h)**
1. Test unificazione RAM/RACI
2. Test sincronizzazione Schedule
3. Test export reali (files scaricati)
4. Test dashboard widgets
5. Fix bugs

**TOTAL:** 20 ore (2.5 giorni)

---

## ✅ PRESERVATION CHECKLIST

### RAM/RACI:
- [x] OBS structure
- [x] Interactive editing
- [x] Validation rules (1 A, ≥1 R)
- [x] Real team members
- [x] Color coding

### Schedule:
- [x] Gantt: CPM, dependencies, slack, milestones
- [x] Calendar: monthly grid, 5 event types, navigation
- [x] Kanban: 5 columns, WBS link, priority, tags
- [x] Sincronizzazione: Gantt/Kanban → Calendar

### Export:
- [x] Export REALI (non mock)
- [x] Excel (.xlsx files)
- [x] PDF (.pdf files)
- [x] Dashboard complete report

---

## 🚀 READY TO IMPLEMENT

**Approval confermato - Procedo con implementazione!**
