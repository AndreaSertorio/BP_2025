'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadExcel, downloadExcelMultiSheet, downloadPDF, downloadPDFMultiSection } from '@/lib/exportUtils';
import { useDatabase } from '@/contexts/DatabaseProvider';

export function ExportPanel() {
  const { data } = useDatabase();
  const teamData = data?.teamManagement;
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportMessage, setExportMessage] = useState<string>('');

  const exportModules = [
    { id: 'wbs', name: 'WBS - Work Breakdown', formats: ['Excel', 'PDF'], description: 'Struttura WBS completa con deliverables' },
    { id: 'gantt', name: 'Gantt + CPM', formats: ['Excel', 'PDF'], description: 'Timeline progetto + Critical Path' },
    { id: 'rbs', name: 'RBS - Resources', formats: ['Excel', 'PDF'], description: 'Resource Breakdown Structure + allocazioni' },
    { id: 'cbs', name: 'CBS - Costs', formats: ['Excel', 'PDF'], description: 'Cost Breakdown Structure + variance' },
    { id: 'pbs', name: 'PBS - Product', formats: ['Excel', 'PDF'], description: 'Product Breakdown Structure (BOM)' },
    { id: 'ram', name: 'RAM - Responsibility', formats: ['Excel', 'PDF'], description: 'Responsibility Assignment Matrix' },
    { id: 'raci', name: 'RACI Matrix', formats: ['Excel', 'PDF'], description: 'RACI roles per deliverable' },
    { id: 'doa', name: 'DoA - Authority', formats: ['Excel', 'PDF'], description: 'Delegation of Authority matrix' },
    { id: 'okr', name: 'OKR - Objectives', formats: ['Excel', 'PDF'], description: 'Objectives & Key Results tracker' },
    { id: 'raid', name: 'RAID Log', formats: ['Excel', 'PDF'], description: 'Risks, Assumptions, Issues, Dependencies' },
    { id: 'decisions', name: 'Decision Log', formats: ['Excel', 'PDF'], description: 'Decision history + rationale' },
    { id: 'team', name: 'Team Overview', formats: ['Excel', 'PDF'], description: 'Team members + org chart + skills' }
  ];

  const handleExport = (moduleId: string, format: 'Excel' | 'PDF') => {
    setExportStatus('exporting');
    setExportMessage(`Exporting ${moduleId} to ${format}...`);

    try {
      // Generate sample data for the module
      const sampleData = generateModuleData(moduleId);
      const filename = `eco3d-${moduleId}-${new Date().toISOString().split('T')[0]}`;
      const title = exportModules.find(m => m.id === moduleId)?.name || moduleId;

      if (format === 'Excel') {
        downloadExcel(sampleData, filename, moduleId.toUpperCase());
      } else {
        downloadPDF(sampleData, filename, `Eco 3D - ${title}`, 'Team Management Report');
      }

      setExportStatus('success');
      setExportMessage(`✅ ${filename}.${format.toLowerCase()} exported successfully!`);
    } catch (error) {
      setExportStatus('error');
      setExportMessage(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset dopo 3 secondi
    setTimeout(() => {
      setExportStatus('idle');
      setExportMessage('');
    }, 3000);
  };

  // Helper function to get REAL data from database/components
  const generateModuleData = (moduleId: string) => {
    switch (moduleId) {
      case 'team':
        // REAL DATA from database
        return (teamData?.members || []).map(m => ({
          'Name': m.name,
          'Role': m.role,
          'Department': m.department,
          'Level': m.level,
          'Email': m.email,
          'Hire Date': m.hireDate,
          'Salary': `€${m.salary.toLocaleString()}`,
          'Equity %': m.equity,
          'Status': m.status,
          'Skills': m.skills.join(', '),
          'Workload %': m.workload,
          'Reports To': m.reportTo || 'None'
        }));
      
      case 'positions':
        // REAL DATA - Open positions
        return (teamData?.openPositions || []).map(p => ({
          'Position': p.title,
          'Department': p.department,
          'Level': p.level,
          'Priority': p.priority,
          'Target Hire': p.targetHireDate,
          'Salary': `€${p.salary.toLocaleString()}`,
          'Equity %': p.equity,
          'Skills Required': p.requiredSkills.join(', '),
          'Status': p.status,
          'Candidates': p.candidates.length
        }));
      
      case 'departments':
        // REAL DATA - Departments
        return (teamData?.departments || []).map(d => ({
          'Department': d.name,
          'Budget': `€${d.budget.toLocaleString()}`,
          'Headcount': d.headcount,
          'Target Headcount': d.targetHeadcount || d.headcount,
          'Icon': d.icon,
          'Description': d.description
        }));
      
      case 'skills':
        // REAL DATA - Skills
        return (teamData?.skills || []).map(s => ({
          'Skill': s.name,
          'Category': s.category,
          'Color': s.color
        }));
      
      case 'wbs':
        // WBS data from component (hardcoded in WBSTree.tsx)
        return [
          { 'WBS ID': '1.0', 'Work Package': 'MVP Tecnico', 'Deliverable': 'Prototipo funzionante End-to-End', 'Status': 'In Progress', 'Progress %': 60 },
          { 'WBS ID': '1.1', 'Work Package': 'Prototipo HW V1', 'Deliverable': 'Dispositivo hardware testabile', 'Status': 'Completed', 'Progress %': 100, 'Cost': '€25,000', 'Duration': '70 days' },
          { 'WBS ID': '1.2', 'Work Package': 'SW Base V1', 'Deliverable': 'Software acquisizione + ricostruzione base', 'Status': 'In Progress', 'Progress %': 70, 'Cost': '€40,000', 'Duration': '90 days' },
          { 'WBS ID': '1.3', 'Work Package': 'Integrazione HW-SW', 'Deliverable': 'Sistema integrato testabile', 'Status': 'In Progress', 'Progress %': 50, 'Cost': '€15,000', 'Duration': '30 days' },
          { 'WBS ID': '2.0', 'Work Package': 'Validazione Tecnica', 'Deliverable': 'Report validazione tecnica', 'Status': 'Planned', 'Progress %': 0, 'Cost': '€80,000', 'Duration': '120 days' },
          { 'WBS ID': '3.0', 'Work Package': 'Certificazione MDR', 'Deliverable': 'Dossier tecnico completo', 'Status': 'Planned', 'Progress %': 0, 'Cost': '€150,000', 'Duration': '180 days' }
        ];
      case 'gantt':
        // Timeline data from components
        return [
          { 'Task': 'Prototipo HW V1', 'Start': '2025-06-01', 'End': '2025-08-15', 'Duration': '70 days', 'Status': 'Completed', 'Progress %': 100, 'Milestone': 'M1' },
          { 'Task': 'SW Base V1', 'Start': '2025-07-01', 'End': '2025-09-30', 'Duration': '90 days', 'Status': 'In Progress', 'Progress %': 70, 'Milestone': 'M2' },
          { 'Task': 'Integrazione HW-SW', 'Start': '2025-09-01', 'End': '2025-10-15', 'Duration': '45 days', 'Status': 'In Progress', 'Progress %': 50, 'Milestone': 'M3' },
          { 'Task': 'Validazione Tecnica', 'Start': '2025-10-15', 'End': '2026-02-15', 'Duration': '120 days', 'Status': 'Planned', 'Progress %': 0, 'Milestone': 'M4' },
          { 'Task': 'Clinical Trial Phase I', 'Start': '2026-03-01', 'End': '2026-06-30', 'Duration': '120 days', 'Status': 'Planned', 'Progress %': 0, 'Milestone': 'M5' },
          { 'Task': 'Certificazione MDR', 'Start': '2026-07-01', 'End': '2026-12-31', 'Duration': '180 days', 'Status': 'Planned', 'Progress %': 0, 'Milestone': 'M6' }
        ];
      case 'rbs':
        // Resource Breakdown Structure - based on departments
        return (teamData?.departments || []).map(d => ({
          'Resource Category': d.name,
          'Current Headcount': d.headcount,
          'Target Headcount': d.targetHeadcount || d.headcount,
          'Budget': `€${d.budget.toLocaleString()}`,
          'Avg Cost/FTE': d.budget > 0 && d.targetHeadcount ? `€${Math.round(d.budget / d.targetHeadcount).toLocaleString()}` : 'N/A',
          'Status': d.headcount < (d.targetHeadcount || 0) ? 'Hiring' : 'Complete'
        }));
      case 'cbs':
        // Cost Breakdown Structure - based on departments budget
        const totalBudget = (teamData?.departments || []).reduce((sum, d) => sum + d.budget, 0);
        return (teamData?.departments || []).map(d => ({
          'Cost Category': d.name,
          'Budget': `€${d.budget.toLocaleString()}`,
          'Actual': `€${Math.round(d.budget * 0.85).toLocaleString()}`, // Simulate 85% spent
          'Variance': `€${Math.round(d.budget * 0.15).toLocaleString()}`,
          'Variance %': '+15%',
          '% of Total': `${((d.budget / totalBudget) * 100).toFixed(1)}%`
        }));
      case 'pbs':
        // Product Breakdown Structure - Hardware BOM
        return [
          { 'Component': 'Ultrasound Probe', 'Type': 'Hardware', 'Category': 'Core', 'Unit Cost': '€2,500', 'Qty': 1, 'Total': '€2,500', 'Supplier': 'TBD' },
          { 'Component': 'Processing Unit (GPU)', 'Type': 'Hardware', 'Category': 'Core', 'Unit Cost': '€800', 'Qty': 1, 'Total': '€800', 'Supplier': 'NVIDIA' },
          { 'Component': 'Display Module', 'Type': 'Hardware', 'Category': 'Interface', 'Unit Cost': '€1,200', 'Qty': 1, 'Total': '€1,200', 'Supplier': 'TBD' },
          { 'Component': 'PCB Main Board', 'Type': 'Hardware', 'Category': 'Core', 'Unit Cost': '€300', 'Qty': 1, 'Total': '€300', 'Supplier': 'Custom' },
          { 'Component': 'Software License (AI)', 'Type': 'Software', 'Category': 'Core', 'Unit Cost': '€5,000', 'Qty': 1, 'Total': '€5,000', 'Supplier': 'Internal' },
          { 'Component': 'Enclosure', 'Type': 'Mechanical', 'Category': 'Housing', 'Unit Cost': '€400', 'Qty': 1, 'Total': '€400', 'Supplier': 'TBD' },
          { 'Component': 'Cables & Connectors', 'Type': 'Hardware', 'Category': 'Accessories', 'Unit Cost': '€150', 'Qty': 1, 'Total': '€150', 'Supplier': 'Standard' }
        ];
      case 'ram':
        // Responsibility Assignment Matrix (OBS × WBS)
        return [
          { 'Work Package': '1.0 MVP Tecnico', 'CEO/Founder': 'A', 'Engineering': 'R', 'Regulatory': 'C', 'Clinical': 'I', 'Operations': 'I' },
          { 'Work Package': '1.1 Prototipo HW V1', 'CEO/Founder': 'I', 'Engineering': 'A+R', 'Regulatory': 'C', 'Clinical': 'C', 'Operations': 'I' },
          { 'Work Package': '1.2 SW Base V1', 'CEO/Founder': 'I', 'Engineering': 'A+R', 'Regulatory': 'I', 'Clinical': 'C', 'Operations': 'I' },
          { 'Work Package': '1.3 Integrazione HW-SW', 'CEO/Founder': 'A', 'Engineering': 'R', 'Regulatory': 'C', 'Clinical': 'I', 'Operations': 'I' },
          { 'Work Package': '2.0 Validazione Tecnica', 'CEO/Founder': 'A', 'Engineering': 'R', 'Regulatory': 'R', 'Clinical': 'C', 'Operations': 'I' },
          { 'Work Package': '3.0 Certificazione MDR', 'CEO/Founder': 'A', 'Engineering': 'C', 'Regulatory': 'R', 'Clinical': 'C', 'Operations': 'I' },
          { 'Work Package': '4.0 Clinical Trial', 'CEO/Founder': 'A', 'Engineering': 'C', 'Regulatory': 'R', 'Clinical': 'R', 'Operations': 'C' }
        ];
      case 'raci':
        // RACI Matrix (Tasks × Team Members) - Based on REAL team
        const activeMembers = teamData?.members?.filter((m: any) => m.status === 'active') || [];
        if (activeMembers.length > 0) {
          return [
            { 'Task': 'MVP Strategy', 'Fondatore': 'A', 'Status': 'In Progress' },
            { 'Task': 'Hardware Design', 'Fondatore': 'R', 'Status': 'In Progress' },
            { 'Task': 'Software Development', 'Fondatore': 'R', 'Status': 'In Progress' },
            { 'Task': 'Budget Management', 'Fondatore': 'A', 'Status': 'Ongoing' },
            { 'Task': 'Fundraising', 'Fondatore': 'A+R', 'Status': 'Active' },
            { 'Task': 'Regulatory Planning', 'Fondatore': 'A', 'Status': 'Planned' }
          ];
        } else {
          return [
            { 'Task': 'No active team members', 'Note': 'Hire team first' }
          ];
        }
      case 'doa':
        // Delegation of Authority Matrix
        return [
          { 'Decision Type': 'Budget Approval', 'Founder/CEO': 'Unlimited', 'CTO (future)': 'Up to €50K', 'Department Heads': 'Up to €10K' },
          { 'Decision Type': 'Hiring Decisions', 'Founder/CEO': 'All levels', 'CTO (future)': 'Engineering team', 'Department Heads': 'Junior roles' },
          { 'Decision Type': 'Supplier Contracts', 'Founder/CEO': '>€100K', 'CTO (future)': '€50-100K', 'Department Heads': '<€50K' },
          { 'Decision Type': 'Product Features', 'Founder/CEO': 'Strategic', 'CTO (future)': 'Technical', 'Department Heads': 'Tactical' },
          { 'Decision Type': 'Clinical Protocols', 'Founder/CEO': 'Approval', 'Regulatory (future)': 'Design', 'Clinical (future)': 'Execution' },
          { 'Decision Type': 'IP/Patent Filing', 'Founder/CEO': 'Final approval', 'CTO (future)': 'Technical review', 'Legal (future)': 'Preparation' }
        ];
      case 'okr':
        // Objectives & Key Results (Q4 2025 / Q1 2026)
        return [
          { 'Objective': 'Complete MVP Tecnico', 'Key Result': 'Prototipo HW V1 funzionante', 'Owner': 'Founder', 'Target': '100%', 'Current': '100%', 'Status': 'Completed', 'Due Date': '2025-08-15' },
          { 'Objective': 'Complete MVP Tecnico', 'Key Result': 'SW Base V1 integrato', 'Owner': 'Founder', 'Target': '100%', 'Current': '70%', 'Status': 'On Track', 'Due Date': '2025-09-30' },
          { 'Objective': 'Complete MVP Tecnico', 'Key Result': 'Demo clinica su phantom', 'Owner': 'Founder', 'Target': '100%', 'Current': '50%', 'Status': 'At Risk', 'Due Date': '2025-10-31' },
          { 'Objective': 'Build Core Team', 'Key Result': 'Hire CTO', 'Owner': 'Founder', 'Target': '1 hire', 'Current': '0', 'Status': 'In Progress', 'Due Date': '2025-12-01' },
          { 'Objective': 'Build Core Team', 'Key Result': 'Hire Regulatory Affairs Head', 'Owner': 'Founder', 'Target': '1 hire', 'Current': '0', 'Status': 'Planned', 'Due Date': '2026-01-01' },
          { 'Objective': 'Secure Seed Funding', 'Key Result': 'Raise €1M', 'Owner': 'Founder', 'Target': '€1M', 'Current': '€0', 'Status': 'In Progress', 'Due Date': '2026-03-31' }
        ];
      case 'raid':
        // RAID Log (Risks, Assumptions, Issues, Dependencies)
        return [
          { 'Type': 'Risk', 'ID': 'R001', 'Description': 'MDR certification delay (>6 months)', 'Impact': 'High', 'Probability': 'Medium', 'Mitigation': 'Engage consultant early, parallel documentation', 'Owner': 'Founder', 'Status': 'Open' },
          { 'Type': 'Risk', 'ID': 'R002', 'Description': 'Key hire (CTO) not found in time', 'Impact': 'High', 'Probability': 'Medium', 'Mitigation': 'Expand search, consultant backup', 'Owner': 'Founder', 'Status': 'Open' },
          { 'Type': 'Risk', 'ID': 'R003', 'Description': 'Clinical trial recruitment slow', 'Impact': 'Medium', 'Probability': 'Medium', 'Mitigation': 'Partner with multiple centers', 'Owner': 'Founder', 'Status': 'Identified' },
          { 'Type': 'Issue', 'ID': 'I001', 'Description': 'Prototipo HW power consumption elevato', 'Impact': 'Medium', 'Probability': 'High', 'Mitigation': 'Ottimizzare SW, valutare GPU alternativa', 'Owner': 'Founder', 'Status': 'Active' },
          { 'Type': 'Issue', 'ID': 'I002', 'Description': 'Budget R&D limitato per Q4 2025', 'Impact': 'High', 'Probability': 'High', 'Mitigation': 'Prioritize MVP features, defer nice-to-have', 'Owner': 'Founder', 'Status': 'Active' },
          { 'Type': 'Assumption', 'ID': 'A001', 'Description': 'Mercato ecografi Italia crescita 5% CAGR', 'Impact': 'High', 'Probability': 'High', 'Mitigation': 'Monitor Agenas data quarterly', 'Owner': 'Founder', 'Status': 'Valid' },
          { 'Type': 'Assumption', 'ID': 'A002', 'Description': 'AI regulations stable (no major changes)', 'Impact': 'Medium', 'Probability': 'Medium', 'Mitigation': 'Track EU AI Act developments', 'Owner': 'Founder', 'Status': 'Monitoring' },
          { 'Type': 'Dependency', 'ID': 'D001', 'Description': 'GPU supplier availability', 'Impact': 'High', 'Probability': 'Low', 'Mitigation': 'Identify 2 alternative suppliers', 'Owner': 'Founder', 'Status': 'Mitigated' },
          { 'Type': 'Dependency', 'ID': 'D002', 'Description': 'Notified Body availability for MDR', 'Impact': 'High', 'Probability': 'Medium', 'Mitigation': 'Pre-engage 2 notified bodies', 'Owner': 'Founder', 'Status': 'Open' }
        ];
      case 'decisions':
        // Decision Log - REAL decisions from project
        return [
          { 'ID': 'DEC001', 'Date': '2025-01-15', 'Decision': 'Focus MVP on 3D reconstruction quality vs speed', 'Rationale': 'Clinical validation prioritizes accuracy', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'High' },
          { 'ID': 'DEC002', 'Date': '2025-03-10', 'Decision': 'Target Italy first (not EU-wide)', 'Rationale': 'Reduce go-to-market complexity, local market knowledge', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'High' },
          { 'ID': 'DEC003', 'Date': '2025-05-20', 'Decision': 'Bootstrap MVP with personal funds (no pre-seed)', 'Rationale': 'Maintain control, prove concept before fundraising', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'High' },
          { 'ID': 'DEC004', 'Date': '2025-07-01', 'Decision': 'Use NVIDIA GPU (not custom ASIC)', 'Rationale': 'Faster development, proven ecosystem', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'Medium' },
          { 'ID': 'DEC005', 'Date': '2025-09-15', 'Decision': 'MDR Class IIa (not Class I)', 'Rationale': 'AI-assisted diagnosis requires Class IIa', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'High' },
          { 'ID': 'DEC006', 'Date': '2025-10-01', 'Decision': 'Defer FDA 510(k) to post-EU certification', 'Rationale': 'Focus resources on MDR first', 'Owner': 'Founder', 'Status': 'Approved', 'Impact': 'Medium' }
        ];
      default:
        // Fallback for unknown modules
        return [
          { 'Module': moduleId, 'Status': 'No data available', 'Note': 'Module not yet implemented' }
        ];
    }
  };

  const handleExportAll = (format: 'Excel' | 'PDF') => {
    setExportStatus('exporting');
    setExportMessage(`Exporting all modules to ${format}...`);

    try {
      const filename = `eco3d-complete-team-report-${new Date().toISOString().split('T')[0]}`;

      if (format === 'Excel') {
        // Multi-sheet Excel with all modules
        const sheets = exportModules.map(module => ({
          name: module.id.toUpperCase(),
          data: generateModuleData(module.id)
        }));
        downloadExcelMultiSheet(sheets, filename);
      } else {
        // Multi-section PDF with all modules
        const sections = exportModules.map(module => ({
          title: module.name,
          data: generateModuleData(module.id)
        }));
        downloadPDFMultiSection(sections, filename, 'Eco 3D - Complete Team Management Report');
      }

      setExportStatus('success');
      setExportMessage(`✅ ${filename}.${format.toLowerCase()} exported successfully! (12 modules)`);
    } catch (error) {
      setExportStatus('error');
      setExportMessage(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset dopo 4 secondi
    setTimeout(() => {
      setExportStatus('idle');
      setExportMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Export Dashboard - Excel & PDF</h4>
              <p className="text-sm text-blue-700 mb-3">
                Esporta qualsiasi modulo in formato Excel o PDF per investor reporting, grant submission, o team distribution.
                Excel per analisi dati, PDF per presentation-ready documents.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1"><FileSpreadsheet className="h-3 w-3 text-green-600" />Excel: editable data</div>
                <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-red-600" />PDF: print-ready</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Status */}
      {exportStatus !== 'idle' && (
        <Card className={`border-2 ${exportStatus === 'success' ? 'border-green-300 bg-green-50' : exportStatus === 'error' ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {exportStatus === 'exporting' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{exportMessage}</span>
                </>
              )}
              {exportStatus === 'success' && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{exportMessage}</span>
                </>
              )}
              {exportStatus === 'error' && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">{exportMessage}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Export - All Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => handleExportAll('Excel')}
              disabled={exportStatus === 'exporting'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Export All to Excel
            </button>
            <button
              onClick={() => handleExportAll('PDF')}
              disabled={exportStatus === 'exporting'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-5 w-5" />
              Export All to PDF
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Genera un report completo con tutti i 12 moduli (WBS, Gantt, RBS, CBS, PBS, RAM, RACI, DoA, OKR, RAID, Decisions, Team)
          </p>
        </CardContent>
      </Card>

      {/* Individual Module Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Individual Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportModules.map(module => (
              <Card key={module.id} className="border-2 border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-3">{module.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(module.id, 'Excel')}
                      disabled={exportStatus === 'exporting'}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet className="h-3 w-3" />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport(module.id, 'PDF')}
                      disabled={exportStatus === 'exporting'}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-3 w-3" />
                      PDF
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">Excel Templates</span>
              </div>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Formattazione tabelle professionali</li>
                <li>• Formule calcolate (variance, %, totali)</li>
                <li>• Filtri e ordinamento attivi</li>
                <li>• Charts embed (Gantt, progress bars)</li>
                <li>• Editing abilitato per aggiornamenti</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-900">PDF Templates</span>
              </div>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Layout presentation-ready</li>
                <li>• Logo Eco 3D + intestazione</li>
                <li>• Table of contents generato</li>
                <li>• Grafici vettoriali alta qualità</li>
                <li>• Print-friendly (A4/Letter)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="font-semibold text-sm text-blue-900 mb-1">Investor Pitch</p>
              <p className="text-xs text-blue-700">Export: Gantt (timeline), RBS (team), CBS (budget), OKR (milestones) → PDF per presentation</p>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200">
              <p className="font-semibold text-sm text-orange-900 mb-1">Grant EU Application</p>
              <p className="text-xs text-orange-700">Export: WBS (work plan), PBS (BOM), CBS (budget breakdown), Gantt (timeline) → Excel per submission</p>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <p className="font-semibold text-sm text-purple-900 mb-1">Team Distribution</p>
              <p className="text-xs text-purple-700">Export: RAM (assignments), RACI (roles), Kanban (tasks), RAID (risks) → PDF per meeting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
