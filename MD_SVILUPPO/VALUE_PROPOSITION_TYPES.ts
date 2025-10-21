// ============================================================================
// VALUE PROPOSITION - TYPESCRIPT INTERFACES
// File: /src/types/valueProposition.ts
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
}

// VALUE MAP
export interface Feature {
  id: string;
  name: string;
  category: 'core' | 'enabling' | 'differentiating';
  technicalSpec?: string;
  visible?: boolean;
}

export interface ProductService {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'service';
  features: Feature[];
}

export interface PainReliever {
  id: string;
  linkedPainId: string;
  linkedFeatureIds: string[];
  description: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  proof?: string;
}

export interface GainCreator {
  id: string;
  linkedGainId: string;
  linkedFeatureIds: string[];
  description: string;
  magnitude: 1 | 2 | 3 | 4 | 5;
  proof?: string;
}

// MESSAGING
export type ToneType = 'professional' | 'persuasive' | 'technical';
export type AudienceType = 'investors' | 'clinici' | 'strutture_sanitarie';

export interface ElevatorPitch {
  version: string;
  lastUpdated: string;
  tone: ToneType;
  targetAudience: AudienceType;
  content: string;
  editable: boolean;
}

// COMPETITOR
export interface Competitor {
  id: string;
  name: string;
  type: string;
  isOwn?: boolean;
  attributes: { [key: string]: number };
}

// MAIN INTERFACE
export interface ValueProposition {
  version: string;
  lastUpdated: string;
  customerProfile: {
    segments: CustomerSegment[];
  };
  valueMap: {
    productsAndServices: ProductService[];
    painRelievers: PainReliever[];
    gainCreators: GainCreator[];
  };
  messaging: {
    elevatorPitch: ElevatorPitch;
  };
  competitorAnalysis: {
    framework: 'radar' | 'matrix';
    competitors: Competitor[];
  };
}
