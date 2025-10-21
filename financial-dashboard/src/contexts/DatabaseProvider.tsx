/**
 * DATABASE PROVIDER - CON BACKEND API
 * Legge e scrive database.json tramite server Express
 * NO localStorage - persistenza su file
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ValueProposition } from '@/types/valueProposition';

// Types
interface PrestazioneEcografia {
  codice: string;
  nome: string;
  U: number;
  B: number;
  D: number;
  P: number;
  percentualeExtraSSN: number;
  aggredibile: boolean;
  note?: string;
}

interface MercatoEcografieItalia {
  annoRiferimento: number;
  percentualeExtraSSN: number;
  note?: string;
  prestazioni: PrestazioneEcografia[];
}

interface RegioneMondialeData {
  nome: string;
  flag: string;
  moltiplicatoreVolume: number;
  moltiplicatoreValore: number;
  quotaItalia: string;
  note: string;
}

// Types per mercatoEcografi
interface TipologiaEcografo {
  id: string;
  nome: string;
  icon: string;
  quotaIT: number;
  valoreIT: number;
  quotaGlobale: number;
  valoreGlobale: number;
  cagrGlobale: string;
  note: string;
  visible: boolean;
  target: boolean;
}

interface ConfigurazioneMercatoEcografi {
  annoTarget: number;
  marketShare: number;
  scenarioParco: 'basso' | 'centrale' | 'alto';
  regioniVisibili: string[];
  tipologieTarget: string[];
}

interface MercatoEcografi {
  tipologie: TipologiaEcografo[];
  numeroEcografi: Array<{ mercato: string; unita2025: number; unita2030: number }>;
  valoreMercato: Array<{ mercato: string; valore2025: number; valore2030: number; cagr: number }>;
  proiezioniItalia: Array<{ anno: number; mordor: number; research: number; grandview: number; cognitive: number; media: number; mediana: number }>;
  quoteTipologie: Array<{ anno: number; carrellati: number; portatili: number; palmari: number }>;
  parcoIT: Array<{ anno: number; basso: number; centrale: number; alto: number }>;
  configurazione: ConfigurazioneMercatoEcografi;
}

interface PrezzoEcografia {
  codice: string;
  descrizione: string;
  prezzoPubblico: number;
  prezzoPrivato: number;
  range: string;
  devStd: string;
  confidenza: string;
  nFonti: number;
  note: string;
}

interface ValoriCalcolatiTamSamSom {
  tam: number;
  sam: number;
  som1: number;
  som3: number;
  som5: number;
}

interface ConfigurazioneTamSamSomEcografie {
  priceMode: 'semplice' | 'perProcedura' | 'regionalizzato';
  prezzoMedioProcedura: number;
  tipoPrezzo: 'pubblico' | 'privato' | 'medio';
  regioneSelezionata: 'italia' | 'europa' | 'usa' | 'cina';
  volumeMode: 'totale' | 'ssn' | 'extraSsn';
  samPercentage: number;
  somPercentages: {
    y1: number;
    y3: number;
    y5: number;
  };
  valoriCalcolati: ValoriCalcolatiTamSamSom;
  lastUpdate: string | null;
}

interface ConfigurazioneTamSamSomEcografi {
  priceMode: 'semplice';
  prezzoMedioDispositivo: number;
  prezziMediDispositivi?: {
    carrellati: number;
    portatili: number;
    palmari: number;
  };
  samPercentage: number;
  somPercentages: {
    y1: number;
    y3: number;
    y5: number;
  };
  valoriCalcolati: ValoriCalcolatiTamSamSom;
  regioniAttive?: {
    italia: boolean;
    europa: boolean;
    usa: boolean;
    cina: boolean;
  };
  // 🆕 Numero di UNITÀ di dispositivi (non valori in €) per tutti i 5 anni
  dispositiviUnita?: {
    tam: number;
    sam: number;
    som1: number;
    som2: number;  // ← Interpolato
    som3: number;
    som4: number;  // ← Interpolato
    som5: number;
  };
  lastUpdate: string | null;
}

// ==================== REVENUE MODEL TYPES ====================
// Revenue Model Types
interface HardwareRevenueModel {
  enabled: boolean;
  description?: string;
  unitCost: number;
  unitCostByType?: {
    carrellati: number;
    portatili: number;
    palmari: number;
  };
  warrantyPct: number;
  cogsMarginByType?: {
    carrellati: number;
    portatili: number;
    palmari: number;
  };
  note?: string;
}

interface SaasPricingPerDevice {
  enabled: boolean;
  modelDistributionPct?: number; // 🆕 % dispositivi che usano questo modello
  monthlyFee: number;
  annualFee: number;
  grossMarginPct: number;
  activationRate?: number; // % dispositivi venduti che diventano abbonamenti SaaS attivi
  description: string;
}

interface SaasPricingPerScan {
  enabled: boolean;
  modelDistributionPct?: number; // 🆕 % dispositivi che usano questo modello
  feePerScan: number;
  revSharePct: number;
  scansPerDevicePerMonth: number;
  grossMarginPct: number;
  description: string;
}

interface SaasPricingTier {
  scansUpTo: number;
  monthlyFee: number;
  description: string;
  distributionPct?: number; // 🆕 % dispositivi INTERNI al modello tiered
}

interface SaasPricingTiered {
  enabled: boolean;
  modelDistributionPct?: number; // 🆕 % dispositivi che usano questo modello
  description: string;
  tiers: SaasPricingTier[];
  grossMarginPct: number;
}

interface SaasRevenueModel {
  enabled: boolean;
  description: string;
  pricing: {
    perDevice: SaasPricingPerDevice;
    perScan: SaasPricingPerScan;
    tiered: SaasPricingTiered;
  };
  note: string;
}

interface ConsumableItem {
  id: string;
  name: string;
  revenuePerDevicePerMonth: number;
  grossMarginPct: number;
  description: string;
}

interface ConsumablesRevenueModel {
  enabled: boolean;
  description: string;
  items: ConsumableItem[];
  totalRevenuePerDevicePerMonth: number;
  note: string;
}

interface ServiceItem {
  id: string;
  name: string;
  type: 'one-time' | 'annual' | 'project';
  revenue?: number;
  annualRevenue?: number;
  revenuePerProject?: number;
  projectsPerYear?: number;
  attachRate: number;
  grossMarginPct: number;
  description: string;
}

interface ServicesRevenueModel {
  enabled: boolean;
  description: string;
  items: ServiceItem[];
  note: string;
}

// === GO-TO-MARKET ENGINE INTERFACES ===

interface SalesCapacity {
  reps?: number;  // Legacy: numero fisso reps (retro-compatibilità)
  repsByYear?: {  // Nuovo: reps per anno (Y1-Y5)
    y1: number;
    y2: number;
    y3: number;
    y4: number;
    y5: number;
  };
  dealsPerRepPerQuarter: number;
  rampUpMonths: number;
  description: string;
}

interface SalesCycle {
  avgMonths: number;
  bySegment: {
    pubblico: number;
    privato: number;
    research: number;
  };
  description: string;
}

interface ConversionFunnel {
  lead_to_demo: number;
  demo_to_pilot: number;
  pilot_to_deal: number;
  description: string;
}

interface ChannelMix {
  direct: number;
  distributors: number;
  oem: number;
  distributorMargin: number;
  description: string;
}

interface AdoptionCurveYear {
  y1: number;
  y2: number;
  y3: number;
  y4: number;
  y5: number;
}

interface AdoptionCurve {
  italia: AdoptionCurveYear;
  europa: AdoptionCurveYear;
  usa: AdoptionCurveYear;
  cina: AdoptionCurveYear;
  description: string;
}

interface GtmScenario {
  budget: number;
  reps: number;
  multiplier: number;
  description: string;
}

interface MarketingPlan {
  description: string;
  globalSettings: {
    costPerLead: number;
    devicePrice: number;
    description: string;
  };
  projections: {
    [key: string]: MarketingProjection;
  };
  lastUpdate: string | null;
  note: string;
}

interface GoToMarketModel {
  enabled: boolean;
  description: string;
  salesCapacity: SalesCapacity;
  salesCycle: SalesCycle;
  conversionFunnel: ConversionFunnel;
  channelMix: ChannelMix;
  adoptionCurve: AdoptionCurve;
  scenarios: {
    current: string;
    basso: GtmScenario;
    medio: GtmScenario;
    alto: GtmScenario;
  };
  marketingPlan?: MarketingPlan;
  lastUpdate: string;
  note: string;
}

interface BundleComponents {
  hardware: string;
  saasMonths: number;
  training?: boolean;
  extendedWarranty?: boolean;
}

interface Bundle {
  id: string;
  name: string;
  components: BundleComponents;
  price: number;
  discount: number;
  description: string;
}

interface BundlingRevenueModel {
  enabled: boolean;
  description: string;
  bundles: Bundle[];
  note: string;
}

interface FinancingOption {
  type: string;
  durationMonths: number;
  interestRate?: number;
  downPaymentPct?: number;
  monthlyFee?: number;
  ownershipAtEnd?: boolean;
  description: string;
}

interface FinancingRevenueModel {
  enabled: boolean;
  description: string;
  options: FinancingOption[];
  note: string;
}

interface RegionPricing {
  priceMultiplier: number;
  note: string;
}

interface GeographicPricing {
  enabled: boolean;
  regions: {
    italia: RegionPricing;
    europa: RegionPricing;
    usa: RegionPricing;
    cina: RegionPricing;
  };
}

interface VolumeDiscountTier {
  unitsFrom: number;
  unitsTo: number;
  discount: number;
}

interface VolumeDiscounts {
  enabled: boolean;
  tiers: VolumeDiscountTier[];
  note: string;
}

interface PricingStrategy {
  defaultModel: string;
  geographicPricing: GeographicPricing;
  volumeDiscounts: VolumeDiscounts;
}

interface RevenueModelMetadata {
  version: string;
  currency: string;
  lastUpdate: string;
  createdBy: string;
  validFrom: string;
  note: string;
}

interface RevenueModel {
  hardware: HardwareRevenueModel;
  saas: SaasRevenueModel;
  consumables: ConsumablesRevenueModel;
  services: ServicesRevenueModel;
  bundling: BundlingRevenueModel;
  financing: FinancingRevenueModel;
  pricingStrategy: PricingStrategy;
  metadata: RevenueModelMetadata;
}

// ==================== TIMELINE TYPES ====================

interface TimelineTask {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  progress: number;   // 0-100
  category: string;
  dependencies?: string[];
  note?: string;
  milestone?: boolean;
  cost?: number;      // Costo in EUR
}

interface TimelineCategory {
  id: string;
  name: string;
  color: string;
  description: string;
  order: number;
}

interface TimelineFilters {
  activeCategories: string[];
  showMilestonesOnly: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

interface Timeline {
  version: string;
  lastUpdate: string;
  description: string;
  categories: TimelineCategory[];
  tasks: TimelineTask[];
  filters: TimelineFilters;
  metadata: {
    createdBy: string;
    createdAt: string;
    source: string;
    note: string;
  };
}

// =============================================================

interface MarketingProjection {
  costPerLead: number;
  dealsPerRepOverride: number | null;
  calculated: {
    reps: number;
    rampFactor: number;
    capacity: number;
    funnelEfficiency: number;
    leadsNeeded: number;
    leadsMonthly: number;
    budgetMarketing: number;
    budgetMonthly: number;
    cacEffettivo: number;
    expectedRevenue: number;
    marketingPercentage: number;
    productivityRepYear: number;
  };
  lastUpdate: string | null;
  note?: string;
}

interface Database {
  version: string;
  lastUpdate: string;
  description?: string;
  mercatoEcografie: {
    italia: MercatoEcografieItalia;
  };
  regioniMondiali?: {
    usa: RegioneMondialeData;
    europa: RegioneMondialeData;
    cina: RegioneMondialeData;
    globale: RegioneMondialeData;
  };
  mercatoEcografi?: MercatoEcografi;
  prezziEcografieRegionalizzati?: {
    italia: PrezzoEcografia[];
    europa: PrezzoEcografia[];
    usa: PrezzoEcografia[];
    cina: PrezzoEcografia[];
  };
  configurazioneTamSamSom?: {
    ecografie: ConfigurazioneTamSamSomEcografie;
    ecografi: ConfigurazioneTamSamSomEcografi;
  };
  businessPlan?: {
    sectionProgress: Record<string, number>;
    lastUpdate: string;
  };
  revenueModel?: RevenueModel;
  goToMarket?: GoToMarketModel;
  statoPatrimoniale?: {
    workingCapital?: {
      dso?: number;
      dpo?: number;
      inventoryTurnover?: number;
      [key: string]: any;
    };
    fixedAssets?: {
      capexAsPercentRevenue?: number;
      depreciationRate?: number;
      initialPPE?: number;
      intangibles?: number;
      [key: string]: any;
    };
    funding?: {
      rounds?: Array<{
        year: number;
        quarter: number;
        type: string;
        amount: number;
        valuation: number;
        dilution: number;
        note: string;
        enabled: boolean;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  market?: any; // Dati mercato per TAM/SAM/SOM (da definire tipo completo)
  budget?: any; // Dati budget (da definire tipo completo)
  timeline?: Timeline;
  valueProposition?: ValueProposition;
  competitorAnalysis?: any; // Competitor analysis data (import type from competitor.types.ts)
  teamManagement?: any; // Team management data
  metadata?: Record<string, unknown>;
}

interface DatabaseContextValue {
  data: Database;
  loading: boolean;
  lastUpdate: Date | null;
  // Ecografie
  updatePrestazione: (codice: string, updates: Partial<PrestazioneEcografia>) => Promise<void>;
  toggleAggredibile: (codice: string) => Promise<void>;
  setPercentualeExtraSSN: (codice: string, percentuale: number) => Promise<void>;
  updateRegioneMoltiplicatori: (regioneId: string, moltiplicatoreVolume?: number, moltiplicatoreValore?: number) => Promise<void>;
  // Ecografi
  updateConfigurazioneEcografi: (updates: Partial<ConfigurazioneMercatoEcografi>) => Promise<void>;
  toggleTipologiaVisible: (id: string) => Promise<void>;
  toggleTipologiaTarget: (id: string) => Promise<void>;
  updateTipologia: (id: string, updates: Partial<TipologiaEcografo>) => Promise<void>;
  // TAM/SAM/SOM
  updateConfigurazioneTamSamSomEcografie: (updates: Partial<ConfigurazioneTamSamSomEcografie>) => Promise<void>;
  updateConfigurazioneTamSamSomEcografi: (updates: Partial<ConfigurazioneTamSamSomEcografi>) => Promise<void>;
  updatePrezzoEcografiaRegionalizzato: (regione: string, codice: string, updates: Partial<PrezzoEcografia>) => Promise<void>;
  // Business Plan
  updateBusinessPlanProgress: (sectionId: string, progress: number) => Promise<void>;
  // Revenue Model
  updateRevenueModel: (updates: Partial<RevenueModel>) => Promise<void>;
  updateRevenueModelHardware: (updates: Partial<HardwareRevenueModel>) => Promise<void>;
  updateRevenueModelSaaS: (updates: Partial<SaasRevenueModel>) => Promise<void>;
  // Global Settings
  updateGlobalSettings: (updates: any) => Promise<void>;
  // Go-To-Market
  updateGoToMarket: (updates: Partial<GoToMarketModel>) => Promise<void>;
  updateMarketingPlan: (year: number, projection: MarketingProjection) => Promise<void>;
  updateGtmCalculated: (calculated: any) => Promise<void>;
  // Timeline
  createTask: (task: Omit<TimelineTask, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TimelineTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTimelineFilters: (filters: Partial<TimelineFilters>) => Promise<void>;
  // Generali
  resetToDefaults: () => Promise<void>;
  exportDatabase: () => string;
  refreshData: () => Promise<void>;
  refetch: () => Promise<void>;  // Alias di refreshData
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================================
// PROVIDER
// ============================================================================

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Database>({
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    mercatoEcografie: {
      italia: {
        annoRiferimento: 2024,
        percentualeExtraSSN: 30,
        prestazioni: []
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Carica dati dal server al mount
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/database`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const database = await response.json();
      setData(database);
      setLastUpdate(new Date(database.lastUpdate));
      console.log('✅ Database caricato dal server');
    } catch (error) {
      console.error('❌ Errore caricamento database:', error);
      alert('⚠️ Server non raggiungibile. Assicurati che il server sia avviato (npm run server)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Listen for database-updated events
  useEffect(() => {
    const handleDatabaseUpdate = () => {
      console.log('🔄 Database update event received, refreshing...');
      refreshData();
    };

    window.addEventListener('database-updated', handleDatabaseUpdate);

    return () => {
      window.removeEventListener('database-updated', handleDatabaseUpdate);
    };
  }, [refreshData]);

  // Update generica di una prestazione (tramite API)
  const updatePrestazione = useCallback(async (codice: string, updates: Partial<PrestazioneEcografia>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/prestazione/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Prestazione ${codice} aggiornata`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento prestazione ${codice}:`, error);
    }
  }, [refreshData]);

  // Toggle aggredibile (tramite API) - OTTIMIZZATO: aggiorna solo lo stato locale
  const toggleAggredibile = useCallback(async (codice: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/toggle-aggredibile/${codice}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle aggredibile ${codice}: ${result.aggredibile}`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      // Questo previene il reload completo della pagina
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          mercatoEcografie: {
            ...prevData.mercatoEcografie,
            italia: {
              ...prevData.mercatoEcografie.italia,
              prestazioni: prevData.mercatoEcografie.italia.prestazioni.map(p =>
                p.codice === codice ? { ...p, aggredibile: result.aggredibile } : p
              )
            }
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore toggle aggredibile ${codice}:`, error);
    }
  }, []);

  // Set percentuale Extra-SSN (tramite API)
  const setPercentualeExtraSSN = useCallback(async (codice: string, percentuale: number) => {
    if (percentuale < 0 || percentuale > 100) {
      console.error(`❌ Percentuale non valida: ${percentuale}. Deve essere 0-100.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/database/percentuale/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentuale })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Percentuale ${codice}: ${percentuale}%`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          mercatoEcografie: {
            ...prevData.mercatoEcografie,
            italia: {
              ...prevData.mercatoEcografie.italia,
              prestazioni: prevData.mercatoEcografie.italia.prestazioni.map(p =>
                p.codice === codice ? { ...p, percentualeExtraSSN: percentuale } : p
              )
            }
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento percentuale ${codice}:`, error);
    }
  }, []);

  // Aggiorna moltiplicatori regionali
  const updateRegioneMoltiplicatori = useCallback(async (
    regioneId: string,
    moltiplicatoreVolume?: number,
    moltiplicatoreValore?: number
  ) => {
    try {
      const body: Record<string, number> = {};
      if (moltiplicatoreVolume !== undefined) body.moltiplicatoreVolume = moltiplicatoreVolume;
      if (moltiplicatoreValore !== undefined) body.moltiplicatoreValore = moltiplicatoreValore;

      const response = await fetch(`${API_BASE_URL}/regioni/${regioneId}/moltiplicatore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Moltiplicatori ${regioneId} aggiornati`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento moltiplicatori ${regioneId}:`, error);
    }
  }, [refreshData]);

  // ============================================================================
  // MERCATO ECOGRAFI - METODI
  // ============================================================================

  // Aggiorna configurazione mercato ecografi
  const updateConfigurazioneEcografi = useCallback(async (updates: Partial<ConfigurazioneMercatoEcografi>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/configurazione`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione ecografi aggiornata');
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione ecografi:', error);
    }
  }, [refreshData]);

  // Toggle visible per una tipologia
  const toggleTipologiaVisible = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/toggle-tipologia/${id}/visible`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle visible tipologia ${id}: ${result.visible}`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore toggle visible tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // Toggle target per una tipologia
  const toggleTipologiaTarget = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/toggle-tipologia/${id}/target`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle target tipologia ${id}: ${result.target}`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore toggle target tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // Aggiorna una tipologia
  const updateTipologia = useCallback(async (id: string, updates: Partial<TipologiaEcografo>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/tipologia/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Tipologia ${id} aggiornata`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // ============================================================================
  // TAM/SAM/SOM
  // ============================================================================

  // Update configurazione TAM/SAM/SOM Ecografie
  const updateConfigurazioneTamSamSomEcografie = useCallback(async (updates: Partial<ConfigurazioneTamSamSomEcografie>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/tam-sam-som/ecografie`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione TAM/SAM/SOM Ecografie aggiornata:', updates);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData || !prevData.configurazioneTamSamSom?.ecografie) return prevData;
        
        const currentConfig = prevData.configurazioneTamSamSom.ecografie;
        
        return {
          ...prevData,
          configurazioneTamSamSom: {
            ...prevData.configurazioneTamSamSom,
            ecografie: {
              priceMode: updates.priceMode ?? currentConfig.priceMode,
              prezzoMedioProcedura: updates.prezzoMedioProcedura ?? currentConfig.prezzoMedioProcedura,
              tipoPrezzo: updates.tipoPrezzo ?? currentConfig.tipoPrezzo,
              regioneSelezionata: updates.regioneSelezionata ?? currentConfig.regioneSelezionata,
              volumeMode: updates.volumeMode ?? currentConfig.volumeMode,
              samPercentage: updates.samPercentage ?? currentConfig.samPercentage,
              somPercentages: updates.somPercentages ?? currentConfig.somPercentages,
              valoriCalcolati: updates.valoriCalcolati ?? currentConfig.valoriCalcolati,
              lastUpdate: new Date().toISOString()
            }
          }
        };
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografie:', error);
    }
  }, []);

  // Update configurazione TAM/SAM/SOM Ecografi
  const updateConfigurazioneTamSamSomEcografi = useCallback(async (updates: Partial<ConfigurazioneTamSamSomEcografi>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/tam-sam-som/ecografi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione TAM/SAM/SOM Ecografi aggiornata');
      
      // ⚡ UPDATE OTTIMISTICO: Aggiorna solo lo stato locale invece di reload completo
      setData(prevData => {
        if (!prevData || !prevData.configurazioneTamSamSom) return prevData;
        
        const newEcografi = {
          ...prevData.configurazioneTamSamSom.ecografi,
          ...updates,
          lastUpdate: new Date().toISOString()
        } as ConfigurazioneTamSamSomEcografi;
        
        return {
          ...prevData,
          configurazioneTamSamSom: {
            ...prevData.configurazioneTamSamSom,
            ecografi: newEcografi
          }
        } as Database;
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografi:', error);
    }
  }, []);

  // Update Business Plan Progress (percentuali completamento sezioni)
  const updateBusinessPlanProgress = useCallback(async (sectionId: string, progress: number) => {
    console.log(`🔄 updateBusinessPlanProgress chiamato:`, { sectionId, progress });
    
    try {
      const response = await fetch(`${API_BASE_URL}/database/business-plan/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, progress })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore risposta server:', { status: response.status, errorText });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Progress Business Plan aggiornato sul server:`, result);
      
      // ⚡ UPDATE OTTIMISTICO: Aggiorna solo lo stato locale
      setData(prevData => {
        console.log('🔍 State prima update:', { 
          hasData: !!prevData, 
          hasBP: !!prevData?.businessPlan,
          currentProgress: prevData?.businessPlan?.sectionProgress?.[sectionId]
        });
        
        if (!prevData) {
          console.warn('⚠️ prevData è null/undefined');
          return prevData;
        }
        
        // Inizializza struttura se non esiste
        const currentBP = prevData.businessPlan || {
          sectionProgress: {},
          lastUpdate: new Date().toISOString()
        };
        
        if (!prevData.businessPlan) {
          console.log('🆕 Inizializzazione businessPlan');
        }
        
        const newData = {
          ...prevData,
          businessPlan: {
            sectionProgress: {
              ...currentBP.sectionProgress,
              [sectionId]: progress
            },
            lastUpdate: new Date().toISOString()
          }
        } as Database;
        
        console.log('✅ State dopo update:', { 
          newProgress: newData.businessPlan?.sectionProgress?.[sectionId]
        });
        
        return newData;
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento progress Business Plan:', error);
      throw error; // Re-throw per gestire in UI
    }
  }, []);

  // Update prezzo ecografia regionalizzato - OTTIMIZZATO: aggiorna solo lo stato locale
  const updatePrezzoEcografiaRegionalizzato = useCallback(async (regione: string, codice: string, updates: Partial<PrezzoEcografia>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/prezzi-regionalizzati/${regione}/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Prezzo ${codice} (${regione}) aggiornato`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData || !prevData.prezziEcografieRegionalizzati) return prevData;
        
        const regioneKey = regione as keyof typeof prevData.prezziEcografieRegionalizzati;
        const prezziRegione = prevData.prezziEcografieRegionalizzati[regioneKey];
        
        if (!prezziRegione || !Array.isArray(prezziRegione)) return prevData;
        
        return {
          ...prevData,
          prezziEcografieRegionalizzati: {
            ...prevData.prezziEcografieRegionalizzati,
            [regioneKey]: prezziRegione.map(p =>
              p.codice === codice ? { ...p, ...updates } : p
            )
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento prezzo ${codice} (${regione}):`, error);
    }
  }, []);

  // ============================================================================
  // REVENUE MODEL
  // ============================================================================

  // Update completo revenue model
  const updateRevenueModel = useCallback(async (updates: Partial<RevenueModel>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/revenue-model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Revenue Model aggiornato');
      
      // ⚡ UPDATE OTTIMISTICO: Aggiorna solo lo stato locale
      setData(prevData => {
        if (!prevData || !prevData.revenueModel) return prevData;
        
        return {
          ...prevData,
          revenueModel: {
            ...prevData.revenueModel,
            ...updates,
            metadata: {
              ...prevData.revenueModel.metadata,
              lastUpdate: new Date().toISOString()
            }
          }
        } as Database;
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento Revenue Model:', error);
    }
  }, []);

  // Update hardware revenue model
  const updateRevenueModelHardware = useCallback(async (updates: Partial<HardwareRevenueModel>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/revenue-model/hardware`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Hardware Revenue Model aggiornato');
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.revenueModel) return prevData;
        
        return {
          ...prevData,
          revenueModel: {
            ...prevData.revenueModel,
            hardware: {
              ...prevData.revenueModel.hardware,
              ...updates
            },
            metadata: {
              ...prevData.revenueModel.metadata,
              lastUpdate: new Date().toISOString()
            }
          }
        } as Database;
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento Hardware Revenue Model:', error);
    }
  }, []);

  // Update SaaS revenue model
  const updateRevenueModelSaaS = useCallback(async (updates: Partial<SaasRevenueModel>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/revenue-model/saas`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ SaaS Revenue Model aggiornato');
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.revenueModel) return prevData;
        
        return {
          ...prevData,
          revenueModel: {
            ...prevData.revenueModel,
            saas: {
              ...prevData.revenueModel.saas,
              ...updates
            },
            metadata: {
              ...prevData.revenueModel.metadata,
              lastUpdate: new Date().toISOString()
            }
          }
        } as Database;
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento SaaS Revenue Model:', error);
    }
  }, []);

  // ============================================================================
  // GLOBAL SETTINGS
  // ============================================================================

  // Update Global Settings (SSOT)
  const updateGlobalSettings = useCallback(async (updates: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/global-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Global Settings aggiornati:', result.globalSettings);
      
      // Refresh data per sincronizzare
      await refreshData();
      
    } catch (error) {
      console.error('❌ Errore aggiornamento Global Settings:', error);
      throw error;
    }
  }, [refreshData]);

  // ============================================================================
  // GO-TO-MARKET
  // ============================================================================

  // Update Go-To-Market model
  const updateGoToMarket = useCallback(async (updates: Partial<GoToMarketModel>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/go-to-market`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Go-To-Market Engine aggiornato');
      
      // ⚡ UPDATE OTTIMISTICO - Merge corretto senza sovrascrittura
      setData(prevData => {
        if (!prevData) return prevData;
        
        // Copia esistente
        const updatedGoToMarket = { ...prevData.goToMarket } as GoToMarketModel;
        
        // Update scalari (enabled, description, ecc.)
        const scalarKeys = ['enabled', 'description', 'note'] as const;
        scalarKeys.forEach(key => {
          if (key in updates && updates[key] !== undefined) {
            (updatedGoToMarket as any)[key] = updates[key];
          }
        });
        
        // Merge nested objects SOLO se presenti in updates
        if (updates.salesCapacity) {
          // 🔧 FIX: Deep merge repsByYear PRIMA, poi escludi dal merge principale
          const { repsByYear: updatedRepsByYear, ...restSalesCapacity } = updates.salesCapacity;
          
          // Merge campi scalari di salesCapacity
          updatedGoToMarket.salesCapacity = {
            ...prevData.goToMarket?.salesCapacity,
            ...restSalesCapacity
          };
          
          // Deep merge incrementale per repsByYear (se presente)
          if (updatedRepsByYear) {
            updatedGoToMarket.salesCapacity.repsByYear = {
              ...prevData.goToMarket?.salesCapacity?.repsByYear,
              ...updatedRepsByYear
            };
          }
        }
        
        if (updates.conversionFunnel) {
          updatedGoToMarket.conversionFunnel = {
            ...prevData.goToMarket?.conversionFunnel,
            ...updates.conversionFunnel
          };
        }
        
        if (updates.salesCycle) {
          updatedGoToMarket.salesCycle = {
            ...prevData.goToMarket?.salesCycle,
            ...updates.salesCycle
          };
        }
        
        if (updates.channelMix) {
          updatedGoToMarket.channelMix = {
            ...prevData.goToMarket?.channelMix,
            ...updates.channelMix
          };
        }
        
        if (updates.adoptionCurve) {
          updatedGoToMarket.adoptionCurve = {
            ...prevData.goToMarket?.adoptionCurve,
            ...updates.adoptionCurve
          };
        }
        
        if (updates.scenarios) {
          updatedGoToMarket.scenarios = {
            ...prevData.goToMarket?.scenarios,
            ...updates.scenarios
          };
        }
        
        // Update timestamp
        updatedGoToMarket.lastUpdate = new Date().toISOString();
        
        return {
          ...prevData,
          goToMarket: updatedGoToMarket
        };
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento Go-To-Market:', error);
    }
  }, []);

  // ============================================================================
  // TIMELINE
  // ============================================================================

  // Crea nuovo task
  const createTask = useCallback(async (task: Omit<TimelineTask, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Task creato:', result.task.id);
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.timeline) return prevData;
        
        return {
          ...prevData,
          timeline: {
            ...prevData.timeline,
            tasks: [...prevData.timeline.tasks, result.task],
            lastUpdate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error('❌ Errore creazione task:', error);
    }
  }, []);

  // Aggiorna task esistente
  const updateTask = useCallback(async (taskId: string, updates: Partial<TimelineTask>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Task ${taskId} aggiornato`);
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.timeline) return prevData;
        
        return {
          ...prevData,
          timeline: {
            ...prevData.timeline,
            tasks: prevData.timeline.tasks.map(t => 
              t.id === taskId ? { ...t, ...updates } : t
            ),
            lastUpdate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento task ${taskId}:`, error);
    }
  }, []);

  // Elimina task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/task/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Task ${taskId} eliminato`);
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.timeline) return prevData;
        
        return {
          ...prevData,
          timeline: {
            ...prevData.timeline,
            tasks: prevData.timeline.tasks.filter(t => t.id !== taskId),
            lastUpdate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore eliminazione task ${taskId}:`, error);
    }
  }, []);

  // Aggiorna filtri timeline
  const updateTimelineFilters = useCallback(async (filters: Partial<TimelineFilters>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/filters`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Filtri timeline aggiornati');
      
      // ⚡ UPDATE OTTIMISTICO
      setData(prevData => {
        if (!prevData || !prevData.timeline) return prevData;
        
        return {
          ...prevData,
          timeline: {
            ...prevData.timeline,
            filters: {
              ...prevData.timeline.filters,
              ...filters
            },
            lastUpdate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento filtri:', error);
    }
  }, []);

  // ============================================================================
  // GENERALI
  // ============================================================================

  // Reset ai valori di default
  const resetToDefaults = useCallback(async () => {
    if (!window.confirm('⚠️ Sicuro di voler ripristinare tutti i dati ai valori di default? Tutte le modifiche andranno perse.')) {
      return;
    }

    alert('ℹ️ Per resettare il database, riavvia il server o ripristina manualmente database.json');
    // TODO: Implementare endpoint API per reset
  }, []);

  // Export database come JSON
  const exportDatabase = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  // ============================================================================
  // MARKETING PLAN
  // ============================================================================

  // Aggiorna sezione calculated (riconciliazione Top-Down vs Bottom-Up)
  const updateGtmCalculated = useCallback(async (calculated: any) => {
    try {
      console.log('📊 Aggiorno GTM Calculated:', {
        realisticSales: calculated.realisticSales,
        constrainingFactors: calculated.constrainingFactor
      });

      // Chiamata API al backend
      const response = await fetch(`${API_BASE_URL}/database/go-to-market/calculated`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculated)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ GTM Calculated salvato su database');

      // ⚡ UPDATE OTTIMISTICO - Aggiorna stato locale
      setData(prevData => {
        if (!prevData || !prevData.goToMarket) return prevData;

        return {
          ...prevData,
          goToMarket: {
            ...prevData.goToMarket,
            calculated: {
              ...calculated,
              lastUpdate: new Date().toISOString()
            },
            lastUpdate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento GTM Calculated:', error);
    }
  }, []);

  // Aggiorna proiezione marketing per un anno specifico
  const updateMarketingPlan = useCallback(async (year: number, projection: MarketingProjection) => {
    try {
      console.log(`📊 Aggiorno Marketing Plan Anno ${year}:`, {
        costPerLead: projection.costPerLead,
        budgetMarketing: projection.calculated.budgetMarketing,
        leadsNeeded: projection.calculated.leadsNeeded
      });

      // Chiamata API al backend
      const response = await fetch(`${API_BASE_URL}/database/go-to-market/marketing-plan/${year}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projection)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Marketing Plan Anno ${year} salvato su database`);

      // ⚡ UPDATE OTTIMISTICO - Aggiorna stato locale
      setData(prevData => {
        if (!prevData || !prevData.goToMarket) return prevData;

        const updatedData = { ...prevData };
        const gtm = updatedData.goToMarket!; // Safe dopo il check sopra
        
        // Inizializza marketingPlan se non esiste
        if (!gtm.marketingPlan) {
          gtm.marketingPlan = {
            description: "Proiezioni marketing e sales per anno - calcolate dal Simulatore Impatto Business",
            globalSettings: {
              costPerLead: 50,
              devicePrice: 50000,
              description: "Parametri globali default per simulatore"
            },
            projections: {},
            lastUpdate: null,
            note: "Piano marketing persistente - aggiornato automaticamente dal simulatore"
          };
        }

        // Aggiorna proiezione per l'anno specifico
        const yearKey = `y${year}`;
        gtm.marketingPlan.projections[yearKey] = {
          ...projection,
          lastUpdate: new Date().toISOString()
        };
        
        // Aggiorna timestamp globale
        gtm.marketingPlan.lastUpdate = new Date().toISOString();
        gtm.lastUpdate = new Date().toISOString();
        
        return updatedData;
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento Marketing Plan Anno ${year}:`, error);
    }
  }, []);

  // Valore del context
  const value: DatabaseContextValue = {
    data,
    loading,
    lastUpdate,
    // Ecografie
    updatePrestazione,
    toggleAggredibile,
    setPercentualeExtraSSN,
    updateRegioneMoltiplicatori,
    // Ecografi
    updateConfigurazioneEcografi,
    toggleTipologiaVisible,
    toggleTipologiaTarget,
    updateTipologia,
    // TAM/SAM/SOM
    updateConfigurazioneTamSamSomEcografie,
    updateConfigurazioneTamSamSomEcografi,
    updatePrezzoEcografiaRegionalizzato,
    // Business Plan
    updateBusinessPlanProgress,
    // Revenue Model
    updateRevenueModel,
    updateRevenueModelHardware,
    updateRevenueModelSaaS,
    // Global Settings
    updateGlobalSettings,
    // Go-To-Market
    updateGoToMarket,
    updateMarketingPlan,
    updateGtmCalculated,
    // Timeline
    createTask,
    updateTask,
    deleteTask,
    updateTimelineFilters,
    // Generali
    resetToDefaults,
    exportDatabase,
    refreshData,
    refetch: refreshData  // Alias per compatibilità
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase deve essere usato dentro DatabaseProvider');
  }
  return context;
}

