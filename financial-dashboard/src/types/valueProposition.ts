// ============================================================================
// VALUE PROPOSITION - TYPESCRIPT INTERFACES
// ============================================================================

// CUSTOMER PROFILE
export interface Job {
  id: string;
  description: string;
  category: 'functional' | 'social' | 'emotional';
  importance: 1 | 2 | 3 | 4 | 5;
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  visible?: boolean;
  order?: number;
}

export interface Pain {
  id: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  frequency: 1 | 2 | 3 | 4 | 5;
  category: 'functional' | 'cost' | 'experience';
  notes?: string;
  visible?: boolean;
  order?: number;
}

export interface Gain {
  id: string;
  description: string;
  desirability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  category: 'performance' | 'time' | 'cost' | 'experience';
  notes?: string;
  visible?: boolean;
  order?: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  jobs: Job[];
  pains: Pain[];
  gains: Gain[];
  visible?: boolean;
  order?: number;
}

export interface CustomerProfile {
  segments: CustomerSegment[];
  activeSegmentId?: string;
}

// VALUE MAP
export interface Feature {
  id: string;
  name: string;
  description?: string;
  category: 'core' | 'enabling' | 'differentiating';
  technicalSpec?: string;
  visible?: boolean;
  order?: number;
}

export interface ProductService {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'service';
  description?: string;
  icon?: string;
  features: Feature[];
  visible?: boolean;
  order?: number;
}

export interface PainReliever {
  id: string;
  linkedPainId: string;
  linkedFeatureIds: string[];
  description: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  proof?: string;
  visible?: boolean;
  order?: number;
}

export interface GainCreator {
  id: string;
  linkedGainId: string;
  linkedFeatureIds: string[];
  description: string;
  magnitude: 1 | 2 | 3 | 4 | 5;
  proof?: string;
  visible?: boolean;
  order?: number;
}

export interface ValueMap {
  productsAndServices: ProductService[];
  painRelievers: PainReliever[];
  gainCreators: GainCreator[];
}

// COMPETITOR
export interface Competitor {
  id: string;
  name: string;
  type: string;
  isOwn?: boolean;
  attributes: { [key: string]: number };
  notes?: string;
  visible?: boolean;
}

export interface CompetitorAnalysis {
  framework: 'radar' | 'matrix' | 'table';
  competitors: Competitor[];
  attributeDefinitions: {
    [key: string]: {
      label: string;
      description?: string;
    };
  };
}

// MESSAGING
export type ToneType = 'professional' | 'persuasive' | 'technical' | 'casual';
export type AudienceType = 'investors' | 'clinici' | 'strutture_sanitarie' | 'pazienti';

export interface ElevatorPitch {
  version: string;
  lastUpdated: string;
  tone: ToneType;
  targetAudience: AudienceType;
  content: string;
  wordCount?: number;
  editable: boolean;
}

export interface ValueStatement {
  id: string;
  audience: AudienceType;
  headline: string;
  subheadline?: string;
  body: string;
  cta?: string;
  tone: ToneType;
  editable: boolean;
  visible?: boolean;
}

export interface NarrativeFlow {
  hook: string;
  problem: string;
  solution: string;
  how: string;
  proof: string;
  vision: string;
  editable: boolean;
}

export interface PositioningStatement {
  category: string;
  targetCustomer: string;
  customerNeed: string;
  keyBenefit: string;
  primaryCompetitor: string;
  uniqueDifferentiator: string;
  editable: boolean;
  lastUpdated: string;
}

export interface CompetitiveMessage {
  id: string;
  competitorId: string;
  competitorName: string;
  theirStrength: string;
  ourDifferentiator: string;
  proofPoint: string;
  whenToUse: string;
  visible?: boolean;
}

export interface CustomerTestimonial {
  id: string;
  customerName: string;
  role: string;
  organization: string;
  organizationType: 'hospital' | 'clinic' | 'diagnostic_center' | 'research';
  testimonial: string;
  impact: string;
  metrics?: string;
  date: string;
  verified: boolean;
  visible?: boolean;
  featured?: boolean;
}

export interface Objection {
  id: string;
  objection: string;
  category: 'price' | 'regulatory' | 'technical' | 'integration' | 'training' | 'other';
  frequency: 'common' | 'occasional' | 'rare';
  response: string;
  proofPoints: string[];
  resourceLinks?: string[];
  visible?: boolean;
}

export interface Messaging {
  elevatorPitch: ElevatorPitch;
  valueStatements: ValueStatement[];
  narrativeFlow: NarrativeFlow;
  positioningStatement: PositioningStatement;
  competitiveMessages: CompetitiveMessage[];
  customerTestimonials: CustomerTestimonial[];
  objections: Objection[];
}

// ROI CALCULATOR
export interface ROIAssumptions {
  pazientiMese: number;
  prezzoEsame3D: number;
  penetrazione3D: number;
  costoReferral: number;
  tempoRisparmiato: number;
  tassoOrario?: number;
}

export interface ROIResults {
  ricaviAggiuntivi: number;
  costiRisparmiati: number;
  beneficioMensile: number;
  beneficioAnnuale: number;
  paybackPeriod: number;
  roi1anno: number;
  roi3anni: number;
}

export interface ROICalculator {
  enabled: boolean;
  targetCustomer: string;
  devicePrice: number;
  assumptions: ROIAssumptions;
  results: ROIResults;
}

// UI CONFIGURATION
export interface UIConfiguration {
  layout: 'canvas' | 'list' | 'tabs' | 'grid';
  visibleComponents: {
    customerProfile: boolean;
    valueMap: boolean;
    competitorAnalysis: boolean;
    messaging: boolean;
    roiCalculator: boolean;
  };
  componentOrder: string[];
  theme: 'strategyzer' | 'miro' | 'notion' | 'default';
  autoSave: boolean;
  autoSaveInterval?: number;
}

// METADATA
export interface ValuePropositionMetadata {
  framework: 'vpc' | 'hybrid' | 'jtbd' | 'value_map';
  completionStatus: number;
  lastReviewed: string;
  reviewedBy: string;
  targetAudiences: AudienceType[];
}

// MAIN VALUE PROPOSITION INTERFACE
export interface ValueProposition {
  version: string;
  lastUpdated: string;
  metadata: ValuePropositionMetadata;
  customerProfile: CustomerProfile;
  valueMap: ValueMap;
  competitorAnalysis: CompetitorAnalysis;
  messaging: Messaging;
  roiCalculator: ROICalculator;
  uiConfiguration: UIConfiguration;
}

// HELPER TYPES
export type ScoreType = 1 | 2 | 3 | 4 | 5;

export interface ScoreIndicator {
  value: ScoreType;
  stars: string;
  color: string;
  label: string;
}

export const SCORE_INDICATORS: Record<ScoreType, ScoreIndicator> = {
  1: { value: 1, stars: '⭐', color: 'text-gray-400', label: 'Very Low' },
  2: { value: 2, stars: '⭐⭐', color: 'text-yellow-400', label: 'Low' },
  3: { value: 3, stars: '⭐⭐⭐', color: 'text-yellow-500', label: 'Medium' },
  4: { value: 4, stars: '⭐⭐⭐⭐', color: 'text-orange-500', label: 'High' },
  5: { value: 5, stars: '⭐⭐⭐⭐⭐', color: 'text-red-500', label: 'Very High' }
};

export const SEVERITY_INDICATORS: Record<ScoreType, string> = {
  1: '🔥',
  2: '🔥🔥',
  3: '🔥🔥🔥',
  4: '🔥🔥🔥🔥',
  5: '🔥🔥🔥🔥🔥'
};
