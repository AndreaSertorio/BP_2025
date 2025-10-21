// CBS Sample Data for Eco 3D
import type { CBSNode } from '@/types/team';

export const cbsSampleData: CBSNode[] = [
  // 1.1 Prototipo HW V1 (€25K baseline)
  { cbs_id: 'CBS-1.1.1', wbs_id: '1.1', categoria: 'labor', descrizione: 'CTO + HW Eng labor', costo_pianificato: 15000, costo_effettivo: 14500, variance: -500, variance_percent: -3.3, stato: 'spent' },
  { cbs_id: 'CBS-1.1.2', wbs_id: '1.1', categoria: 'materials', descrizione: 'PCB + components + housing', costo_pianificato: 34500, costo_effettivo: 35200, variance: 700, variance_percent: 2.0, stato: 'spent', fornitore: 'Vendor A' },
  { cbs_id: 'CBS-1.1.3', wbs_id: '1.1', categoria: 'equipment', descrizione: 'Oscilloscopio allocation', costo_pianificato: 2000, costo_effettivo: 2000, variance: 0, variance_percent: 0, stato: 'spent' },
  { cbs_id: 'CBS-1.1.4', wbs_id: '1.1', categoria: 'overhead', descrizione: 'Overhead 10%', costo_pianificato: 2500, costo_effettivo: 2600, variance: 100, variance_percent: 4.0, stato: 'spent' },
  
  // 1.2 Firmware V1 (€20K baseline)
  { cbs_id: 'CBS-1.2.1', wbs_id: '1.2', categoria: 'labor', descrizione: 'CTO labor', costo_pianificato: 18000, costo_effettivo: 13500, variance: -4500, variance_percent: -25.0, stato: 'spent' },
  { cbs_id: 'CBS-1.2.2', wbs_id: '1.2', categoria: 'equipment', descrizione: 'IDE licenses', costo_pianificato: 1000, costo_effettivo: 800, variance: -200, variance_percent: -20.0, stato: 'spent' },
  { cbs_id: 'CBS-1.2.3', wbs_id: '1.2', categoria: 'overhead', descrizione: 'Overhead 5%', costo_pianificato: 1000, costo_effettivo: 950, variance: -50, variance_percent: -5.0, stato: 'spent' },
  
  // 1.3 App SW V1 (€75K baseline)
  { cbs_id: 'CBS-1.3.1', wbs_id: '1.3', categoria: 'labor', descrizione: 'AI Eng + CTO', costo_pianificato: 60000, costo_effettivo: 33750, variance: -26250, variance_percent: -43.8, stato: 'committed' },
  { cbs_id: 'CBS-1.3.2', wbs_id: '1.3', categoria: 'external', descrizione: 'GCP cloud + ML consultant', costo_pianificato: 13000, costo_effettivo: 7200, variance: -5800, variance_percent: -44.6, stato: 'committed' },
  { cbs_id: 'CBS-1.3.3', wbs_id: '1.3', categoria: 'overhead', descrizione: 'Overhead', costo_pianificato: 2000, costo_effettivo: 900, variance: -1100, variance_percent: -55.0, stato: 'committed' },
  
  // 2.1 Test EMC (€10K baseline)
  { cbs_id: 'CBS-2.1.1', wbs_id: '2.1', categoria: 'labor', descrizione: 'Internal labor', costo_pianificato: 5000, stato: 'planned' },
  { cbs_id: 'CBS-2.1.2', wbs_id: '2.1', categoria: 'equipment', descrizione: 'Phantom allocation', costo_pianificato: 3000, stato: 'planned' },
  { cbs_id: 'CBS-2.1.3', wbs_id: '2.1', categoria: 'external', descrizione: 'EMC lab test service', costo_pianificato: 2000, stato: 'planned', fornitore: 'EMC Lab' },
  
  // 2.2 Usabilità 62366 (€20K baseline)
  { cbs_id: 'CBS-2.2.1', wbs_id: '2.2', categoria: 'labor', descrizione: 'COO + team', costo_pianificato: 12000, costo_effettivo: 4800, variance: -7200, variance_percent: -60.0, stato: 'committed' },
  { cbs_id: 'CBS-2.2.2', wbs_id: '2.2', categoria: 'external', descrizione: 'QA/RA + Clinical consultants', costo_pianificato: 8000, costo_effettivo: 3200, variance: -4800, variance_percent: -60.0, stato: 'committed' },
  
  // 2.3 Dossier Tecnico (€32K baseline)
  { cbs_id: 'CBS-2.3.1', wbs_id: '2.3', categoria: 'labor', descrizione: 'COO labor', costo_pianificato: 10000, costo_effettivo: 2000, variance: -8000, variance_percent: -80.0, stato: 'committed' },
  { cbs_id: 'CBS-2.3.2', wbs_id: '2.3', categoria: 'external', descrizione: 'QA/RA 40 days', costo_pianificato: 20000, costo_effettivo: 4000, variance: -16000, variance_percent: -80.0, stato: 'committed', fornitore: 'Regulatory SRL' },
  { cbs_id: 'CBS-2.3.3', wbs_id: '2.3', categoria: 'overhead', descrizione: 'Documentation overhead', costo_pianificato: 2000, costo_effettivo: 400, variance: -1600, variance_percent: -80.0, stato: 'committed' },
  
  // 3.1 EC Submission (€7.5K baseline)
  { cbs_id: 'CBS-3.1.1', wbs_id: '3.1', categoria: 'external', descrizione: 'QA/RA EC submission', costo_pianificato: 6000, costo_effettivo: 3000, variance: -3000, variance_percent: -50.0, stato: 'committed' },
  { cbs_id: 'CBS-3.1.2', wbs_id: '3.1', categoria: 'overhead', descrizione: 'Admin fees', costo_pianificato: 1500, costo_effettivo: 750, variance: -750, variance_percent: -50.0, stato: 'committed' },
  
  // 3.2 Trial Clinico (€27.5K baseline)
  { cbs_id: 'CBS-3.2.1', wbs_id: '3.2', categoria: 'labor', descrizione: 'Internal team', costo_pianificato: 10000, stato: 'planned' },
  { cbs_id: 'CBS-3.2.2', wbs_id: '3.2', categoria: 'external', descrizione: 'Clinical specialist', costo_pianificato: 10000, stato: 'planned', fornitore: 'Radiologo' },
  { cbs_id: 'CBS-3.2.3', wbs_id: '3.2', categoria: 'materials', descrizione: 'Consumables', costo_pianificato: 5000, stato: 'planned' },
  { cbs_id: 'CBS-3.2.4', wbs_id: '3.2', categoria: 'equipment', descrizione: 'Phantom allocation', costo_pianificato: 2500, stato: 'planned' }
];
