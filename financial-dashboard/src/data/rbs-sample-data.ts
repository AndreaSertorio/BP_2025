// RBS Sample Data for Eco 3D
import type { RBSNode } from '@/types/team';

export const rbsSampleData: RBSNode[] = [
  // 1. Human Resources
  { rbs_id: 'RBS-1', parent_id: null, nome: 'Human Resources', categoria: 'human', tipo: 'internal' },
  { rbs_id: 'RBS-1.1', parent_id: 'RBS-1', nome: 'Internal Team', categoria: 'human', tipo: 'internal' },
  { rbs_id: 'RBS-1.1.1', parent_id: 'RBS-1.1', nome: 'CEO', categoria: 'human', tipo: 'internal', costo_unitario: 0, unita_misura: 'FTE', disponibilita: 40, costo_totale: 0, allocazioni_wbs: [{ wbs_id: '1.0', percentage: 20 }, { wbs_id: '2.0', percentage: 30 }] },
  { rbs_id: 'RBS-1.1.2', parent_id: 'RBS-1.1', nome: 'CTO', categoria: 'human', tipo: 'internal', costo_unitario: 80000, unita_misura: 'FTE', disponibilita: 40, costo_totale: 80000, allocazioni_wbs: [{ wbs_id: '1.1', percentage: 30 }, { wbs_id: '1.2', percentage: 40 }] },
  { rbs_id: 'RBS-1.1.3', parent_id: 'RBS-1.1', nome: 'COO', categoria: 'human', tipo: 'internal', costo_unitario: 70000, unita_misura: 'FTE', disponibilita: 40, costo_totale: 70000, allocazioni_wbs: [{ wbs_id: '2.1', percentage: 25 }, { wbs_id: '2.3', percentage: 40 }] },
  { rbs_id: 'RBS-1.1.4', parent_id: 'RBS-1.1', nome: 'AI Engineer', categoria: 'human', tipo: 'internal', costo_unitario: 60000, unita_misura: 'FTE', disponibilita: 40, costo_totale: 60000, allocazioni_wbs: [{ wbs_id: '1.3', percentage: 80 }] },
  
  { rbs_id: 'RBS-1.2', parent_id: 'RBS-1', nome: 'External Consultants', categoria: 'human', tipo: 'external' },
  { rbs_id: 'RBS-1.2.1', parent_id: 'RBS-1.2', nome: 'QA/RA Consultant', categoria: 'human', tipo: 'external', costo_unitario: 800, unita_misura: 'day', disponibilita: 60, costo_totale: 48000, fornitore: 'Regulatory SRL', allocazioni_wbs: [{ wbs_id: '2.2', percentage: 50 }, { wbs_id: '2.3', percentage: 40 }] },
  { rbs_id: 'RBS-1.2.2', parent_id: 'RBS-1.2', nome: 'ML Expert', categoria: 'human', tipo: 'contractor', costo_unitario: 800, unita_misura: 'day', disponibilita: 30, costo_totale: 24000, allocazioni_wbs: [{ wbs_id: '1.3', percentage: 100 }] },
  
  // 2. Equipment & Tools
  { rbs_id: 'RBS-2', parent_id: null, nome: 'Equipment & Tools', categoria: 'equipment', tipo: 'internal' },
  { rbs_id: 'RBS-2.1', parent_id: 'RBS-2', nome: 'Lab Equipment', categoria: 'equipment', tipo: 'internal' },
  { rbs_id: 'RBS-2.1.1', parent_id: 'RBS-2.1', nome: 'Oscilloscopio', categoria: 'equipment', tipo: 'internal', costo_unitario: 5000, unita_misura: 'piece', disponibilita: 1, costo_totale: 5000, fornitore: 'Tektronix' },
  { rbs_id: 'RBS-2.1.2', parent_id: 'RBS-2.1', nome: 'Phantom US', categoria: 'equipment', tipo: 'external', costo_unitario: 3000, unita_misura: 'piece', disponibilita: 2, costo_totale: 6000, fornitore: 'CIRS' },
  { rbs_id: 'RBS-2.1.3', parent_id: 'RBS-2.1', nome: 'Workstation GPU', categoria: 'equipment', tipo: 'internal', costo_unitario: 3500, unita_misura: 'piece', disponibilita: 3, costo_totale: 10500 },
  
  { rbs_id: 'RBS-2.2', parent_id: 'RBS-2', nome: 'Software Licenses', categoria: 'software', tipo: 'external' },
  { rbs_id: 'RBS-2.2.1', parent_id: 'RBS-2.2', nome: 'Altium Designer', categoria: 'software', tipo: 'external', costo_unitario: 250, unita_misura: 'month', disponibilita: 12, costo_totale: 3000, fornitore: 'Altium' },
  { rbs_id: 'RBS-2.2.2', parent_id: 'RBS-2.2', nome: 'GCP Cloud', categoria: 'software', tipo: 'external', costo_unitario: 800, unita_misura: 'month', disponibilita: 18, costo_totale: 14400, fornitore: 'Google' },
  
  // 3. Materials
  { rbs_id: 'RBS-3', parent_id: null, nome: 'Materials & Components', categoria: 'material', tipo: 'external' },
  { rbs_id: 'RBS-3.1', parent_id: 'RBS-3', nome: 'Electronic Components', categoria: 'material', tipo: 'external' },
  { rbs_id: 'RBS-3.1.1', parent_id: 'RBS-3.1', nome: 'PCB Prototype', categoria: 'material', tipo: 'external', costo_unitario: 4600, unita_misura: 'piece', disponibilita: 5, costo_totale: 23000, fornitore: 'Vendor A' },
  { rbs_id: 'RBS-3.1.2', parent_id: 'RBS-3.1', nome: 'Trasduttori 64ch', categoria: 'material', tipo: 'external', costo_unitario: 1500, unita_misura: 'piece', disponibilita: 5, costo_totale: 7500 },
  { rbs_id: 'RBS-3.1.3', parent_id: 'RBS-3.1', nome: 'BOM Elettronico', categoria: 'material', tipo: 'external', costo_unitario: 800, unita_misura: 'piece', disponibilita: 5, costo_totale: 4000, fornitore: 'Mouser' },
  
  { rbs_id: 'RBS-3.2', parent_id: 'RBS-3', nome: 'Mechanical Parts', categoria: 'material', tipo: 'external' },
  { rbs_id: 'RBS-3.2.1', parent_id: 'RBS-3.2', nome: 'Housing Medical Grade', categoria: 'material', tipo: 'external', costo_unitario: 600, unita_misura: 'piece', disponibilita: 5, costo_totale: 3000 },
  { rbs_id: 'RBS-3.2.2', parent_id: 'RBS-3.2', nome: 'Handle Ergonomico', categoria: 'material', tipo: 'external', costo_unitario: 150, unita_misura: 'piece', disponibilita: 5, costo_totale: 750 }
];
