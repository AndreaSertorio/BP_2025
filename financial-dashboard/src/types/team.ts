// Team Management Types - Eco 3D

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  level: 'founder' | 'c-level' | 'senior' | 'mid' | 'junior';
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  equity: number;
  status: 'active' | 'inactive' | 'on-leave';
  skills: string[];
  responsibilities: string[];
  avatar: string;
  bio: string;
  reportTo: string | null;
  workload: number;
  performance: number | null;
  notes: string;
}

export interface OpenPosition {
  id: string;
  title: string;
  department: string;
  level: 'c-level' | 'senior' | 'mid' | 'junior';
  priority: 'critical' | 'high' | 'medium' | 'low';
  targetHireDate: string;
  salary: number;
  equity: number;
  requiredSkills: string[];
  responsibilities: string[];
  description: string;
  status: 'open' | 'in-progress' | 'planned' | 'filled';
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: 'screening' | 'interview' | 'technical' | 'final' | 'offer' | 'rejected';
  appliedDate: string;
  notes: string;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget: number;
  headcount: number;
  targetHeadcount?: number;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'business' | 'domain' | 'soft';
  color: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  requiredPositions: string[];
}

export interface UISettings {
  visibleCards: {
    orgChart?: boolean;
    teamOverview?: boolean;
    openPositions?: boolean;
    skillMatrix?: boolean;
    timeline?: boolean;
    budgetBreakdown?: boolean;
    milestones?: boolean;
    candidates?: boolean;
    raci?: boolean;
    okr?: boolean;
    raid?: boolean;
    doa?: boolean;
  };
  layout: 'grid' | 'list';
  theme: 'professional' | 'colorful';
  chartStyle: 'tree' | 'horizontal';
}

// Advanced Team Management Types (from StrumentiPerTeam.md)

export interface OBSNode {
  obs_id: string;
  parent_id: string | null;
  nome: string;
  descrizione: string;
  responsabile: string; // user_id
  ruoli: string[]; // es. PRRC, DPO, CTO
  attivo: boolean;
}

export interface RACIAssignment {
  wbs_id: string;
  obs_id: string;
  ruolo: 'R' | 'A' | 'C' | 'I' | 'S';
}

export interface OKR {
  id: string;
  objective: string;
  periodo: string;
  key_results: KeyResult[];
  score?: number;
  link_wbs?: string[];
  owner: string;
}

export interface KeyResult {
  label: string;
  target: string | number;
  current?: number;
  metrica: string;
  owner: string;
}

export interface RAIDItem {
  id: string;
  tipo: 'risk' | 'assumption' | 'issue' | 'dependency';
  titolo: string;
  descrizione: string;
  probabilita?: number; // 1-5
  impatto?: number; // 1-5
  owner: string;
  mitigazione?: string;
  scadenza?: string;
  stato: 'open' | 'in-progress' | 'mitigated' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface DelegationOfAuthority {
  id: string;
  voce: string;
  soglia_euro: number;
  puo_firmare: string[]; // user_ids or roles
  cofirma_richiesta: boolean;
  note: string;
}

export interface RoleCharter {
  ruolo: string;
  mission: string;
  ambito: string[];
  limiti: string[];
  interfacce: string[];
  kpi: string[];
  competenze_richieste: string[];
}

export interface DecisionLog {
  decision_id: string;
  titolo: string;
  contesto: string;
  opzioni: string[];
  framework: 'DACI' | 'RAPID' | 'MOCHA' | 'DRI';
  driver?: string;
  approver?: string;
  decider?: string;
  contributors: string[];
  informed: string[];
  esito?: string;
  data: string;
  rationale?: string;
}

export interface CapacityPlan {
  user_id: string;
  ruolo: string;
  FTE: number;
  allocazione_per_wbs: { wbs_id: string; percentage: number }[];
  overbooking_alert: boolean;
}

export interface TeamStats {
  currentTeamSize: number;
  targetTeamSize: number;
  totalBudget: number;
  openRoles: number;
  criticalRoles: number;
  totalSalary: number;
  projectedSalary: number;
  departmentsCount: number;
  skillsCount: number;
}

// WBS - Work Breakdown Structure
export interface WBSNode {
  wbs_id: string;
  parent_id: string | null;
  nome: string;
  deliverable: string;
  criteri_accettazione: string;
  stima_rom?: ROMEstimate;
  stima_3punti?: PERTEstimate;
  baseline_cost?: number;
  baseline_durata?: number; // in giorni
  dipendenze: string[]; // wbs_ids
  owner_obs_id?: string;
  stato: 'planned' | 'in-progress' | 'completed' | 'blocked' | 'delayed';
  progress?: number; // 0-100%
  start_date?: string;
  end_date?: string;
  notes?: string;
}

// ROM - Rough Order of Magnitude
export interface ROMEstimate {
  cost_min: number;
  cost_max: number;
  dur_min_w: number; // settimane
  dur_max_w: number;
  ipotesi: string;
  fonte?: string;
  ultima_revisione: string;
}

// PERT - Program Evaluation Review Technique
export interface PERTEstimate {
  O: number; // Optimistic (settimane)
  M: number; // Most likely
  P: number; // Pessimistic
  E?: number; // Expected = (O + 4M + P) / 6
  sigma?: number; // σ = (P - O) / 6
}

// PBS - Product Breakdown Structure
export interface PBSNode {
  pbs_id: string;
  parent_id: string | null;
  nome: string;
  descrizione: string;
  owner_obs_id?: string;
}

// Trace Link PBS <-> WBS
export interface TraceLink {
  id: string;
  pbs_id: string;
  wbs_id: string;
  tipo: 'requisito' | 'verifica' | 'validazione';
}

// RBS - Resource Breakdown Structure
export interface RBSNode {
  rbs_id: string;
  parent_id: string | null;
  nome: string;
  categoria: 'human' | 'equipment' | 'material' | 'software';
  tipo: 'internal' | 'external' | 'contractor';
  costo_unitario?: number;
  unita_misura?: string; // 'FTE', 'day', 'hour', 'piece', 'month'
  disponibilita?: number; // ore/settimana o quantità disponibile
  costo_totale?: number;
  allocazioni_wbs?: { wbs_id: string; percentage: number; ore?: number }[];
  fornitore?: string;
  notes?: string;
}

// CBS - Cost Breakdown Structure
export interface CBSNode {
  cbs_id: string;
  wbs_id: string; // Link to WBS package
  categoria: 'labor' | 'materials' | 'equipment' | 'overhead' | 'external';
  descrizione: string;
  costo_pianificato: number;
  costo_effettivo?: number;
  variance?: number; // effettivo - pianificato
  variance_percent?: number;
  fornitore?: string;
  purchase_order?: string;
  data_prevista?: string;
  data_effettiva?: string;
  stato: 'planned' | 'committed' | 'spent';
  notes?: string;
}

// Gantt + CPM - Timeline & Critical Path
export interface GanttTask {
  task_id: string;
  wbs_id?: string; // Link to WBS if applicable
  nome: string;
  descrizione?: string;
  data_inizio: string; // YYYY-MM-DD
  data_fine: string; // YYYY-MM-DD
  durata_giorni: number;
  progresso: number; // 0-100%
  predecessori?: string[]; // task_id dependencies (FS, SS, FF, SF)
  tipo_dipendenza?: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-Start, Start-Start, Finish-Finish, Start-Finish
  lag_giorni?: number; // positive or negative lag
  risorsa_assegnata?: string; // nome risorsa
  milestone?: boolean;
  critical_path?: boolean; // calcolato da CPM
  slack?: number; // float/slack days
  early_start?: string; // ES from CPM
  early_finish?: string; // EF from CPM
  late_start?: string; // LS from CPM
  late_finish?: string; // LF from CPM
  stato: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'blocked';
  parent_id?: string | null; // for grouped tasks
  notes?: string;
}
