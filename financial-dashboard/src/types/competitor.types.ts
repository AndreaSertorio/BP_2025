/**
 * Competitor Analysis Types
 * Sistema completo per analisi competitiva Eco 3D
 */

export type CompetitorTier = 'tier1' | 'tier2' | 'tier3';
export type CompetitorType = 'direct' | 'indirect' | 'substitute' | 'emerging';
export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low';
export type CompetitorStatus = 'active' | 'monitoring' | 'archived';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface CompanyInfo {
  founded?: number;
  headquarters?: string;
  employees?: number;
  revenue?: number;
  funding?: {
    totalRaised?: number;
    lastRound?: string;
    lastRoundAmount?: number;
    investors?: string[];
  };
  website?: string;
  logo?: string;
}

export interface ProductFeatures {
  imaging3D?: boolean;
  imaging4D?: boolean;
  aiGuided?: boolean;
  portable?: boolean;
  wireless?: boolean;
  multiProbe?: boolean;
  automation?: 'none' | 'partial' | 'full' | 'manual';
  realtime?: boolean;
  cloudConnected?: boolean;
}

export interface Product {
  name: string;
  category: string;
  priceRange?: string;
  priceMin?: number;
  priceMax?: number;
  features: ProductFeatures;
  targetMarket?: string[];
  strengths?: string[];
  weaknesses?: string[];
  launchDate?: string;
  certifications?: string[];
}

export interface MarketPosition {
  marketShare?: number;
  region: string;
  segments: string[];
  customerBase?: number;
  growthRate?: number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Battlecard {
  whyWeWin: string[];
  theirStrengths: string[];
  theirWeaknesses: string[];
  competitiveResponse: string;
  salesTalks?: string[];
  commonObjections?: {
    objection: string;
    response: string;
  }[];
}

export interface Innovation {
  patents?: number;
  rdInvestment?: number;
  rdTeamSize?: number;
  recentLaunches?: {
    product: string;
    date: string;
    description: string;
  }[];
  technologyFocus?: string[];
}

export interface CustomerReferences {
  testimonials?: {
    company: string;
    quote: string;
    author: string;
  }[];
  casestudies?: number;
  clinicalStudies?: number;
  keyCustomers?: string[];
}

export interface Competitor {
  id: string;
  name: string;
  shortName: string;
  tier: CompetitorTier;
  type: CompetitorType;
  status: CompetitorStatus;
  priority: PriorityLevel;
  companyInfo: CompanyInfo;
  products: Product[];
  marketPosition: MarketPosition;
  swotAnalysis: SWOTAnalysis;
  battlecard: Battlecard;
  innovation?: Innovation;
  customerReferences?: CustomerReferences;
  threatLevel: ThreatLevel;
  monitoringPriority: number;
  lastUpdated: string;
  notes?: string;
  tags?: string[];
}

// Porter's 5 Forces
export interface Porter5Force {
  score: number; // 1-10
  description: string;
  factors: string[];
}

export interface Porter5Forces {
  competitiveRivalry: Porter5Force;
  threatNewEntrants: Porter5Force;
  bargainingPowerSuppliers: Porter5Force;
  bargainingPowerBuyers: Porter5Force;
  threatSubstitutes: Porter5Force;
}

// BCG Matrix
export type BCGCategory = 'stars' | 'cashCows' | 'questionMarks' | 'dogs';

export interface BCGMatrix {
  stars: string[]; // competitor IDs
  cashCows: string[];
  questionMarks: string[];
  dogs: string[];
}

// Perceptual Map
export interface PerceptualMapAxis {
  label: string;
  min: number;
  max: number;
}

export interface PerceptualMapPosition {
  competitorId: string;
  x: number;
  y: number;
  label?: string;
}

export interface PerceptualMap {
  axes: {
    x: PerceptualMapAxis;
    y: PerceptualMapAxis;
  };
  positions: PerceptualMapPosition[];
}

// Benchmarking
export interface BenchmarkCategory {
  name: string;
  weight: number;
  eco3d: number;
  competitors: {
    id: string;
    score: number;
  }[];
}

export interface Benchmarking {
  categories: BenchmarkCategory[];
  overallScore: {
    eco3d: number;
    competitors: {
      [competitorId: string]: number;
    };
  };
}

// Frameworks
export interface CompetitorFrameworks {
  porter5Forces: Porter5Forces;
  bcgMatrix: BCGMatrix;
  perceptualMap: PerceptualMap;
}

// Configuration
export interface CompetitorAnalysisConfiguration {
  analysisFrameworks: {
    swot: { enabled: boolean };
    porter5: { enabled: boolean };
    bcg: { enabled: boolean };
    perceptualMap: { enabled: boolean };
  };
  filters: {
    showTiers: CompetitorTier[];
    showTypes: CompetitorType[];
    showRegions: string[];
  };
  view: 'grid' | 'table' | 'cards';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Metadata
export interface CompetitorAnalysisMetadata {
  lastUpdate: string;
  version: string;
  totalCompetitors: number;
  categories: CompetitorType[];
}

// Main Container
export interface CompetitorAnalysis {
  metadata: CompetitorAnalysisMetadata;
  configuration: CompetitorAnalysisConfiguration;
  competitors: Competitor[];
  frameworks?: CompetitorFrameworks;
  benchmarking?: Benchmarking;
}

// Filter Options
export interface CompetitorFilters {
  search?: string;
  tiers?: CompetitorTier[];
  types?: CompetitorType[];
  threatLevels?: ThreatLevel[];
  regions?: string[];
  tags?: string[];
}

// Sort Options
export interface CompetitorSortOptions {
  field: 'name' | 'threatLevel' | 'priority' | 'lastUpdated' | 'marketShare';
  order: 'asc' | 'desc';
}
