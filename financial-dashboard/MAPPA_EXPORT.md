# 🗺️ MAPPA COMPLETA EXPORT - Eco 3D Dashboard

**Visual guide:** Dove trovare ogni export nell'applicazione  
**Ultima modifica:** 16 Ottobre 2025

---

## 📍 EXPORT LOCATIONS

```
┌─────────────────────────────────────────────────────────────┐
│                    ECO 3D DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏠 HOME (MasterDashboard)                                  │
│     └─ Export Panel (bottom of page)                       │
│        ├─ 📊 Export Monthly Data      → CSV   ✅          │
│        ├─ 📅 Export Annual Data       → CSV   ✅          │
│        ├─ 🎯 Export Key KPIs          → CSV   ✅          │
│        ├─ 📈 Export Advanced Metrics  → CSV   ✅          │
│        ├─ 💰 Export Cash Flow         → CSV   ✅          │
│        ├─ 📊 Export Growth Metrics    → CSV   ✅          │
│        └─ 📦 Export Complete Scenario → JSON  ✅          │
│                                                             │
│  👥 TEAM MANAGEMENT                                         │
│     ├─ Tab: Dashboard                                       │
│     ├─ Tab: Planning                                        │
│     ├─ Tab: Team                                            │
│     ├─ Tab: Resources                                       │
│     ├─ Tab: Schedule                                        │
│     ├─ Tab: Governance                                      │
│     └─ Tab: Export ⭐                                       │
│        ├─ 📗 Export All to Excel      → XLSX  ⏳          │
│        ├─ 📕 Export All to PDF        → PDF   ⏳          │
│        └─ Individual Modules (12):                         │
│           ├─ WBS (Excel/PDF)          → ⏳                │
│           ├─ Gantt (Excel/PDF)        → ⏳                │
│           ├─ RBS (Excel/PDF)          → ⏳                │
│           ├─ CBS (Excel/PDF)          → ⏳                │
│           ├─ PBS (Excel/PDF)          → ⏳                │
│           ├─ RAM (Excel/PDF)          → ⏳                │
│           ├─ RACI (Excel/PDF)         → ⏳                │
│           ├─ DoA (Excel/PDF)          → ⏳                │
│           ├─ OKR (Excel/PDF)          → ⏳                │
│           ├─ RAID (Excel/PDF)         → ⏳                │
│           ├─ Decisions (Excel/PDF)    → ⏳                │
│           └─ Team Overview (Excel/PDF)→ ⏳                │
│                                                             │
│  📊 SCENARIO COMPARISON                                     │
│     └─ Export Comparison              → CSV   ✅          │
│                                                             │
│  📈 FUNNEL GTM                                              │
│     ├─ Export Monthly Funnel          → CSV   ✅          │
│     └─ Export Quarterly Summary       → CSV   ✅          │
│                                                             │
│  💹 FINANCIALS                                              │
│     ├─ Export P&L                     → CSV   ✅          │
│     ├─ Export Cash Flow               → CSV   ✅          │
│     └─ Export Balance Sheet           → CSV   ✅          │
│                                                             │
│  🔧 DATABASE SYNC INDICATOR                                 │
│     └─ Export Database                → JSON  ✅          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Legenda:
✅ Funzionante  ⏳ Da implementare  ❌ Non disponibile
```

---

## 📂 FILE STRUCTURE

### **Sorgenti Export Functions**
```
financial-dashboard/
├── src/
│   ├── lib/
│   │   ├── utils.ts              ← downloadCSV, downloadJSON, formatters
│   │   └── exportUtils.ts        ← All export functions (CSV, Excel, PDF)
│   │
│   └── components/
│       ├── MasterDashboard.tsx       ← Financial exports (7 CSV + 1 JSON)
│       ├── ExportPanel.tsx           ← Export UI component (Financial)
│       ├── Financials.tsx            ← P&L, CF, BS exports (3 CSV)
│       ├── FunnelGTM.tsx             ← Funnel exports (2 CSV)
│       ├── ScenarioComparison.tsx    ← Comparison export (1 CSV)
│       ├── DatabaseSyncIndicator.tsx ← Database export (1 JSON)
│       │
│       └── TeamManagement/
│           ├── TeamManagementDashboard.tsx  ← Main dashboard
│           └── ExportPanel.tsx              ← Team exports (24 planned)
│
├── GUIDA_EXPORT.md                   ← Complete export documentation
├── CHECKLIST_EXPORT_TESTING.md       ← Testing checklist
└── MAPPA_EXPORT.md                   ← This file
```

---

## 🎯 EXPORT BY TYPE

### **CSV Exports (Funzionanti ✅)**
```
1.  monthly-data-[scenario]-[date].csv           ← 60 months detailed
2.  annual-data-[scenario]-[date].csv            ← 5 years summary
3.  kpis-[scenario]-[date].csv                   ← Key KPIs
4.  advanced-metrics-[scenario]-[date].csv       ← CAC, LTV, NPV, IRR
5.  cashflow-statements-[scenario]-[date].csv    ← Cash flow annual
6.  growth-metrics-[scenario]-[date].csv         ← CAGR, Rule of 40
7.  scenario-comparison-[date].csv               ← Multi-scenario
8.  eco3d-monthly-funnel.csv                     ← GTM funnel monthly
9.  eco3d-quarterly-summary.csv                  ← GTM quarterly
10. eco3d-profit-loss.csv                        ← P&L statement
11. eco3d-cash-flow.csv                          ← Cash flow statement
12. eco3d-balance-sheet.csv                      ← Balance sheet

Totale CSV: 12 exports funzionanti
```

### **JSON Exports (Funzionanti ✅)**
```
1. complete-scenario-[scenario]-[date].json      ← Complete backup
2. database-export-[date].json                   ← Full database

Totale JSON: 2 exports funzionanti
```

### **Excel Exports (Planned ⏳)**
```
Library pronta: downloadExcel(), downloadExcelMultiSheet()

Planned:
1.  Complete_Report_Eco3D.xlsx                   ← 12 sheets (Team)
2.  wbs.xlsx                                     ← Work Breakdown
3.  gantt.xlsx                                   ← Gantt + CPM
4.  rbs.xlsx                                     ← Resources
5.  cbs.xlsx                                     ← Costs
6.  pbs.xlsx                                     ← Product BOM
7.  ram.xlsx                                     ← Responsibility
8.  raci.xlsx                                    ← RACI matrix
9.  doa.xlsx                                     ← Delegation Authority
10. okr.xlsx                                     ← Objectives
11. raid.xlsx                                    ← RAID log
12. decisions.xlsx                               ← Decision log
13. team.xlsx                                    ← Team overview

Totale Excel: 13 exports planned
```

### **PDF Exports (Planned ⏳)**
```
Library pronta: downloadPDF(), downloadPDFMultiSection()

Planned:
1.  Complete_Report_Eco3D.pdf                    ← 12 sections (Team)
2.  wbs.pdf                                      ← Work Breakdown
3.  gantt.pdf                                    ← Gantt + CPM
4.  rbs.pdf                                      ← Resources
5.  cbs.pdf                                      ← Costs
6.  pbs.pdf                                      ← Product BOM
7.  ram.pdf                                      ← Responsibility
8.  raci.pdf                                     ← RACI matrix
9.  doa.pdf                                      ← Delegation Authority
10. okr.pdf                                      ← Objectives
11. raid.pdf                                     ← RAID log
12. decisions.pdf                                ← Decision log
13. team.pdf                                     ← Team overview

Totale PDF: 13 exports planned
```

---

## 📊 EXPORT SUMMARY

| Tipo   | Funzionanti | Planned | Totale | %    |
|--------|-------------|---------|--------|------|
| CSV    | 12          | 0       | 12     | 100% |
| JSON   | 2           | 0       | 2      | 100% |
| Excel  | 0           | 13      | 13     | 0%   |
| PDF    | 0           | 13      | 13     | 0%   |
| **TOTALE** | **14**  | **26**  | **40** | **35%** |

**Status applicazione:**
- ✅ Financial Dashboard: 100% funzionante (14/14 exports)
- ⏳ Team Management: 0% implementato (0/26 exports)
- 📚 Libraries: 100% pronte (xlsx, jsPDF, autoTable)

---

## 🎯 USE CASES BY PERSONA

### **CFO / Finance Team**
```
Exports preferiti:
├─ Complete Scenario (JSON)          ← Backup/restore
├─ Annual Data (CSV)                 ← Budget vs Actual
├─ Cash Flow Statements (CSV)        ← Liquidity tracking
├─ Advanced Metrics (CSV)            ← CAC, LTV, Burn Rate
└─ Scenario Comparison (CSV)         ← Sensitivity analysis

Destinazione: Excel per analisi, Board presentation
```

### **CEO / Founder**
```
Exports preferiti:
├─ Key KPIs (CSV)                    ← High-level metrics
├─ Growth Metrics (CSV)              ← CAGR, Rule of 40
├─ Scenario Comparison (CSV)         ← Strategy planning
└─ Complete Report PDF (future)      ← Investor deck

Destinazione: PDF per presentation, Excel per analysis
```

### **Project Manager**
```
Exports preferiti:
├─ Gantt (Excel/PDF)                 ← Timeline + CPM
├─ WBS (Excel/PDF)                   ← Work breakdown
├─ RAID Log (Excel/PDF)              ← Risk tracking
├─ Decisions (Excel/PDF)             ← Decision history
└─ Team Overview (Excel/PDF)         ← Resource planning

Destinazione: Excel per team, PDF per stakeholders
```

### **Grant Officer / EU Application**
```
Exports preferiti:
├─ WBS (Excel)                       ← Work packages
├─ CBS (Excel)                       ← Cost breakdown
├─ Gantt (Excel)                     ← Timeline
├─ PBS (Excel)                       ← Bill of Materials
└─ RBS (Excel)                       ← Resource allocation

Destinazione: Excel per submission forms
```

### **Investor / VC**
```
Exports preferiti:
├─ Key KPIs (CSV → Excel)            ← ARR, Break-even
├─ Advanced Metrics (CSV → Excel)    ← LTV/CAC, NPV, IRR
├─ Growth Metrics (CSV → Excel)      ← CAGR, Rule of 40
├─ Complete Report PDF (future)      ← Due diligence pack
└─ Scenario Comparison (CSV)         ← Upside/downside

Destinazione: Excel per DD, PDF per presentation
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Current (✅ DONE)**
- [x] CSV exports Financial Dashboard (12 exports)
- [x] JSON exports (2 exports)
- [x] `downloadCSV()` function
- [x] `downloadJSON()` function
- [x] Export UI (ExportPanel component)

### **Phase 2: Libraries Integration (✅ DONE)**
- [x] Install xlsx, jsPDF, jspdf-autotable
- [x] Create `downloadExcel()` function
- [x] Create `downloadExcelMultiSheet()` function
- [x] Create `downloadPDF()` function
- [x] Create `downloadPDFMultiSection()` function
- [x] Documentation (GUIDA_EXPORT.md)

### **Phase 3: Team Management Implementation (⏳ NEXT)**
- [ ] Replace `setTimeout` with real exports in `TeamManagement/ExportPanel.tsx`
- [ ] Implement WBS Excel/PDF export
- [ ] Implement Gantt Excel/PDF export
- [ ] Implement RBS Excel/PDF export
- [ ] Implement CBS Excel/PDF export
- [ ] Implement PBS Excel/PDF export
- [ ] Implement RAM Excel/PDF export
- [ ] Implement RACI Excel/PDF export
- [ ] Implement DoA Excel/PDF export
- [ ] Implement OKR Excel/PDF export
- [ ] Implement RAID Excel/PDF export
- [ ] Implement Decisions Excel/PDF export
- [ ] Implement Team Excel/PDF export
- [ ] Implement "Export All" Excel (12 sheets)
- [ ] Implement "Export All" PDF (12 sections)

### **Phase 4: Enhancements (📅 FUTURE)**
- [ ] Progress indicators (loading spinner)
- [ ] Excel: Formulas (variance, %, totals)
- [ ] Excel: Conditional formatting
- [ ] PDF: Logo Eco 3D in header
- [ ] PDF: Table of contents
- [ ] Export charts/graphs (PNG embed)
- [ ] Server-side export API
- [ ] Batch export scheduler

---

## 🔧 HOW TO IMPLEMENT TEAM EXPORTS

### **Example: WBS Export to Excel**

```typescript
// In TeamManagement/ExportPanel.tsx

import { downloadExcel, downloadPDF } from '@/lib/exportUtils';

const handleExport = (moduleId: string, format: 'Excel' | 'PDF') => {
  setExportStatus('exporting');
  setExportMessage(`Exporting ${moduleId} to ${format}...`);

  try {
    if (moduleId === 'wbs') {
      // Prepare WBS data
      const wbsData = [
        { 'WBS ID': '1.0', 'Work Package': 'MVP Tecnico', 'Phase': 'Development', 'Status': 'In Progress' },
        { 'WBS ID': '1.1', 'Work Package': 'Prototipo HW V1', 'Phase': 'Development', 'Status': 'Completed' },
        { 'WBS ID': '1.2', 'Work Package': 'SW Base', 'Phase': 'Development', 'Status': 'In Progress' },
        // ... more data from database
      ];

      if (format === 'Excel') {
        downloadExcel(wbsData, `eco3d-wbs-${new Date().toISOString().split('T')[0]}`, 'WBS');
      } else {
        downloadPDF(wbsData, `eco3d-wbs-${new Date().toISOString().split('T')[0]}`, 'Eco 3D - Work Breakdown Structure', 'Project WBS');
      }
    }

    // Similar for other modules...

    setExportStatus('success');
    setExportMessage(`✅ ${moduleId}.${format.toLowerCase()} exported successfully!`);
  } catch (error) {
    setExportStatus('error');
    setExportMessage(`❌ Export failed: ${error.message}`);
  }

  // Reset after 3 seconds
  setTimeout(() => {
    setExportStatus('idle');
    setExportMessage('');
  }, 3000);
};
```

### **Example: Export All to Excel (Multi-Sheet)**

```typescript
const handleExportAll = (format: 'Excel' | 'PDF') => {
  setExportStatus('exporting');
  setExportMessage(`Exporting all modules to ${format}...`);

  try {
    if (format === 'Excel') {
      const sheets = [
        { name: 'WBS', data: wbsData },
        { name: 'Gantt', data: ganttData },
        { name: 'RBS', data: rbsData },
        { name: 'CBS', data: cbsData },
        { name: 'PBS', data: pbsData },
        { name: 'RAM', data: ramData },
        { name: 'RACI', data: raciData },
        { name: 'DoA', data: doaData },
        { name: 'OKR', data: okrData },
        { name: 'RAID', data: raidData },
        { name: 'Decisions', data: decisionsData },
        { name: 'Team', data: teamData },
      ];

      downloadExcelMultiSheet(sheets, `eco3d-complete-report-${new Date().toISOString().split('T')[0]}`);
    } else {
      const sections = [
        { title: 'Work Breakdown Structure', data: wbsData },
        { title: 'Gantt + CPM', data: ganttData },
        // ... all sections
      ];

      downloadPDFMultiSection(sections, `eco3d-complete-report-${new Date().toISOString().split('T')[0]}`, 'Eco 3D - Complete Project Report');
    }

    setExportStatus('success');
    setExportMessage(`✅ Complete_Report_Eco3D.${format.toLowerCase()} exported successfully! (12 modules)`);
  } catch (error) {
    setExportStatus('error');
    setExportMessage(`❌ Export failed: ${error.message}`);
  }
};
```

---

## 📚 QUICK REFERENCE

### **Import Export Functions**
```typescript
// CSV & JSON (già in uso)
import { downloadCSV, downloadJSON } from '@/lib/utils';

// Excel & PDF (nuove)
import { 
  downloadExcel,
  downloadExcelMultiSheet,
  downloadPDF,
  downloadPDFMultiSection 
} from '@/lib/exportUtils';

// Financial pre-configured (già in uso)
import {
  exportMonthlyData,
  exportAnnualData,
  exportKPIs,
  exportAdvancedMetrics,
  exportCashFlowStatements,
  exportGrowthMetrics,
  exportCompleteScenario,
  exportScenarioComparison
} from '@/lib/exportUtils';
```

### **Test Exports**
```bash
# 1. Start server
npm run dev:all

# 2. Test Financial exports
open http://localhost:3000

# 3. Test Team exports (when implemented)
open http://localhost:3000/team

# 4. Check Downloads folder
ls -lht ~/Downloads/ | head -10

# 5. Open latest export
open ~/Downloads/$(ls -t ~/Downloads/eco3d-* | head -1)
```

---

## ✅ SUMMARY

**Exports Implemented:** 14/40 (35%)  
**Export Destination:** `~/Downloads/` (browser standard)  
**Libraries Ready:** ✅ xlsx, jsPDF, autoTable  
**Next Priority:** Team Management implementation (26 exports)

---

*Mappa creata: 16 Ottobre 2025*  
*Prossimo aggiornamento: Dopo implementazione Team exports*
