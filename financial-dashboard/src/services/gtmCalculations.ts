/**
 * GTM Calculation Service
 * 
 * Servizio per calcolare proiezioni di vendita realistiche riconciliando:
 * - Top-Down: Quote mercato SOM
 * - Bottom-Up: Capacità commerciale effettiva
 * 
 * Basato su:
 * - Guida 39: Piano Finanziario Medtech
 * - Guida 8: Strategia Go-To-Market
 */

export interface GtmCalculationResult {
  somAdjusted: number;
  capacityMax: number;
  realisticSales: number;
  constrainingFactor: 'market' | 'capacity';
}

export interface YearlyProjection {
  y1: number;
  y2: number;
  y3: number;
  y4: number;
  y5: number;
}

export interface GtmProjectionResult {
  maxSalesCapacity: YearlyProjection;
  realisticSales: YearlyProjection;
  constrainingFactor: Record<string, 'market' | 'capacity'>;
}

export class GtmCalculationService {
  
  /**
   * Calcola la capacità massima di vendita basata su team e produttività
   * 
   * Formula: Capacity = reps × deals/quarter × 4 × ramp_factor
   * 
   * @param reps Numero di sales rep
   * @param dealsPerRepPerQuarter Deals chiusi per rep per quarter
   * @param year Anno corrente (per applicare ramp-up)
   * @param rampUpMonths Mesi di ramp-up per nuovi rep
   * @returns Capacità annua in unità
   */
  static calculateSalesCapacity(
    reps: number,
    dealsPerRepPerQuarter: number,
    year: number,
    rampUpMonths: number = 3
  ): number {
    // Fattore ramping: primi mesi produttività ridotta
    // Solo anno 1 ha ramp-up (nuove assunzioni)
    const rampFactor = year === 1 && rampUpMonths > 0 
      ? (12 - rampUpMonths) / 12 
      : 1.0;
    
    // Capacità annua = reps × deals/quarter × 4 quarters × ramp
    const capacity = reps * dealsPerRepPerQuarter * 4 * rampFactor;
    
    return Math.floor(capacity);
  }
  
  /**
   * Applica il funnel di conversione ai lead per stimare deals
   * 
   * Fasi: Lead → Demo → Pilot → Deal
   * 
   * @param leads Numero di lead iniziali
   * @param funnel Tassi di conversione tra fasi
   * @returns Numero di demos, pilots e deals risultanti
   */
  static applyConversionFunnel(
    leads: number,
    funnel: { 
      lead_to_demo: number; 
      demo_to_pilot: number; 
      pilot_to_deal: number 
    }
  ): { demos: number; pilots: number; deals: number } {
    const demos = Math.floor(leads * funnel.lead_to_demo);
    const pilots = Math.floor(demos * funnel.demo_to_pilot);
    const deals = Math.floor(pilots * funnel.pilot_to_deal);
    
    return { demos, pilots, deals };
  }
  
  /**
   * Applica curva di adozione regionale al SOM
   * 
   * Es: Italia parte da 20% anno 1, raggiunge 100% anno 3
   * 
   * @param somDevices Dispositivi SOM totali
   * @param adoptionPct Percentuale adozione per anno (0.0-1.0)
   * @returns Dispositivi SOM aggiustati per adoption curve
   */
  static applyCurvaAdozione(
    somDevices: number,
    adoptionPct: number
  ): number {
    return Math.floor(somDevices * adoptionPct);
  }
  
  /**
   * LOGICA PRINCIPALE: Riconcilia Top-Down vs Bottom-Up
   * 
   * Vendite Realistiche = MIN(SOM × adoption, Capacity × channel_efficiency)
   * 
   * @param somDevicesYear Dispositivi SOM per anno
   * @param salesCapacityYear Capacità commerciale per anno
   * @param adoptionPct Percentuale adozione regionale
   * @param channelEfficiency Efficienza canale (1.0 = direct, <1.0 con distributori)
   * @returns Proiezioni e fattore limitante
   */
  static calculateRealisticSales(
    somDevicesYear: number,
    salesCapacityYear: number,
    adoptionPct: number,
    channelEfficiency: number = 1.0
  ): GtmCalculationResult {
    // SOM aggiustato per curva adozione
    const somAdjusted = this.applyCurvaAdozione(somDevicesYear, adoptionPct);
    
    // Capacità commerciale con efficienza canali
    // Es: 40% tramite distributori con 20% margin → efficiency 0.92
    const capacityMax = Math.floor(salesCapacityYear * channelEfficiency);
    
    // Prendi il minore (realismo)
    const realisticSales = Math.min(somAdjusted, capacityMax);
    
    // Determina quale fattore limita
    const constrainingFactor: 'market' | 'capacity' = 
      realisticSales === somAdjusted ? 'market' : 'capacity';
    
    return {
      somAdjusted,
      capacityMax,
      realisticSales,
      constrainingFactor
    };
  }
  
  /**
   * Calcola efficienza canale basata su mix
   * 
   * Formula: efficiency = 1 - (distributor_pct × distributor_margin)
   * 
   * @param directPct Percentuale vendite dirette
   * @param distributorsPct Percentuale tramite distributori
   * @param distributorMargin Margine lasciato ai distributori
   * @returns Efficienza aggregata (0.0-1.0)
   */
  static calculateChannelEfficiency(
    directPct: number,
    distributorsPct: number,
    distributorMargin: number
  ): number {
    // Direct non erode efficienza
    // Distributors erodono secondo il loro margine
    const efficiency = 1.0 - (distributorsPct * distributorMargin);
    return efficiency;
  }
  
  /**
   * Calcola proiezioni complete 5 anni
   * 
   * @param goToMarket Configurazione GTM dal database
   * @param somDevicesByYear Dispositivi SOM per anno dal TAM/SAM/SOM
   * @param region Regione per adoption curve (default: italia)
   * @returns Proiezioni capacity, realistic sales e constraining factors
   */
  static projectSalesOverYears(
    goToMarket: {
      salesCapacity: {
        repsByYear?: YearlyProjection;  // Nuovo: reps per anno
        reps?: number;  // Legacy: reps fissi (fallback)
        dealsPerRepPerQuarter: number;
        rampUpMonths: number;
      };
      adoptionCurve: {
        italia: YearlyProjection;
        europa: YearlyProjection;
        usa: YearlyProjection;
        cina: YearlyProjection;
      };
      channelMix: {
        direct: number;
        distributors: number;
        distributorMargin: number;
      };
      conversionFunnel?: {
        lead_to_demo: number;
        demo_to_pilot: number;
        pilot_to_deal: number;
      };
    },
    somDevicesByYear: YearlyProjection,
    region: 'italia' | 'europa' | 'usa' | 'cina' = 'italia'
  ): GtmProjectionResult {
    const results: GtmProjectionResult = {
      maxSalesCapacity: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      realisticSales: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      constrainingFactor: {}
    };
    
    const years = [1, 2, 3, 4, 5] as const;
    const adoptionCurve = goToMarket.adoptionCurve[region];
    
    // Calcola efficienza canale aggregata
    const channelEfficiency = this.calculateChannelEfficiency(
      goToMarket.channelMix.direct,
      goToMarket.channelMix.distributors,
      goToMarket.channelMix.distributorMargin
    );
    
    // Fallback per legacy: usa reps fissi se repsByYear non presente
    const legacyReps = goToMarket.salesCapacity.reps || 1;
    
    years.forEach(year => {
      const yearKey = `y${year}` as keyof YearlyProjection;
      
      // 🆕 Ottieni reps per anno (nuovo schema) o fallback
      const repsForYear = goToMarket.salesCapacity.repsByYear 
        ? goToMarket.salesCapacity.repsByYear[yearKey] 
        : legacyReps;
      
      // Capacità commerciale anno Y
      const capacity = this.calculateSalesCapacity(
        repsForYear,
        goToMarket.salesCapacity.dealsPerRepPerQuarter,
        year,
        goToMarket.salesCapacity.rampUpMonths
      );
      
      // Nota: Il funnel di conversione influenza il numero di lead necessari
      // per raggiungere il target di deals, non la capacity del team.
      // La capacity è il numero massimo di deals che il team può chiudere.
      // Funnel più alto = meno lead necessari per stessa capacity.
      
      // Calcolo realistico con adoption curve
      const result = this.calculateRealisticSales(
        somDevicesByYear[yearKey],
        capacity,
        adoptionCurve[yearKey],
        channelEfficiency
      );
      
      results.maxSalesCapacity[yearKey] = result.capacityMax;
      results.realisticSales[yearKey] = result.realisticSales;
      results.constrainingFactor[yearKey] = result.constrainingFactor;
    });
    
    return results;
  }
  
  /**
   * Calcola CAC (Customer Acquisition Cost) implicito
   * 
   * Formula: CAC = Budget Marketing / Deals Chiusi
   * 
   * @param marketingBudget Budget marketing/vendite
   * @param dealsClosedperiod Deals chiusi nel periodo
   * @returns CAC per deal
   */
  static calculateCAC(
    marketingBudget: number,
    dealsClosedPeriod: number
  ): number {
    if (dealsClosedPeriod === 0) return 0;
    return Math.round(marketingBudget / dealsClosedPeriod);
  }
  
  /**
   * Stima lead necessari per raggiungere target vendite
   * 
   * Inversione del funnel: Deals → Pilots → Demos → Leads
   * 
   * @param targetDeals Deals target da raggiungere
   * @param funnel Tassi conversione funnel
   * @returns Lead necessari da generare
   */
  static calculateRequiredLeads(
    targetDeals: number,
    funnel: {
      lead_to_demo: number;
      demo_to_pilot: number;
      pilot_to_deal: number;
    }
  ): number {
    // Inversione: lavora all'indietro dal target deals
    const pilotsNeeded = Math.ceil(targetDeals / funnel.pilot_to_deal);
    const demosNeeded = Math.ceil(pilotsNeeded / funnel.demo_to_pilot);
    const leadsNeeded = Math.ceil(demosNeeded / funnel.lead_to_demo);
    
    return leadsNeeded;
  }

  /**
   * Calcola struttura completa "calculated" con tutti i dettagli per anno
   * 
   * Include:
   * - maxSalesCapacity (capacità commerciale per anno)
   * - realisticSales (vendite realistiche MIN(SOM, Capacity))
   * - constrainingFactor (market vs capacity)
   * - details (breakdown completo per ogni anno)
   * 
   * @param goToMarket Configurazione GTM dal database
   * @param somDevicesByYear Dispositivi SOM per anno dal TAM/SAM/SOM
   * @param region Regione per adoption curve (default: italia)
   * @returns Struttura calculated completa per database
   */
  static calculateCompleteReconciliation(
    goToMarket: {
      salesCapacity: {
        repsByYear?: YearlyProjection;
        reps?: number;
        dealsPerRepPerQuarter: number;
        rampUpMonths: number;
      };
      adoptionCurve: {
        italia: YearlyProjection;
        europa: YearlyProjection;
        usa: YearlyProjection;
        cina: YearlyProjection;
      };
      channelMix: {
        direct: number;
        distributors: number;
        distributorMargin: number;
      };
    },
    somDevicesByYear: YearlyProjection,
    region: 'italia' | 'europa' | 'usa' | 'cina' = 'italia'
  ) {
    const calculated: any = {
      description: "Riconciliazione Top-Down (SOM) vs Bottom-Up (Capacità Commerciale) - calcoli runtime",
      maxSalesCapacity: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      realisticSales: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      constrainingFactor: {},
      details: {},
      lastUpdate: new Date().toISOString()
    };

    const years = [1, 2, 3, 4, 5] as const;
    const adoptionCurve = goToMarket.adoptionCurve[region];
    
    // Calcola efficienza canale
    const channelEfficiency = this.calculateChannelEfficiency(
      goToMarket.channelMix.direct,
      goToMarket.channelMix.distributors,
      goToMarket.channelMix.distributorMargin
    );
    
    const legacyReps = goToMarket.salesCapacity.reps || 1;
    
    years.forEach(year => {
      const yearKey = `y${year}` as keyof YearlyProjection;
      
      // Reps per anno
      const repsForYear = goToMarket.salesCapacity.repsByYear 
        ? goToMarket.salesCapacity.repsByYear[yearKey] 
        : legacyReps;
      
      // Capacità commerciale (prima di channel efficiency)
      const capacityBeforeChannels = this.calculateSalesCapacity(
        repsForYear,
        goToMarket.salesCapacity.dealsPerRepPerQuarter,
        year,
        goToMarket.salesCapacity.rampUpMonths
      );
      
      // Capacità dopo channel efficiency
      const capacityAfterChannels = Math.floor(capacityBeforeChannels * channelEfficiency);
      
      // SOM target e adjusted
      const somTarget = somDevicesByYear[yearKey];
      const adoptionRate = adoptionCurve[yearKey];
      const somAdjustedByAdoption = Math.floor(somTarget * adoptionRate);
      
      // Vendite realistiche = MIN
      const realisticSales = Math.min(somAdjustedByAdoption, capacityAfterChannels);
      
      // Fattore limitante
      const constrainingFactor: 'market' | 'capacity' = 
        realisticSales === somAdjustedByAdoption ? 'market' : 'capacity';
      
      // Popola risultati
      calculated.maxSalesCapacity[yearKey] = capacityBeforeChannels;
      calculated.realisticSales[yearKey] = realisticSales;
      calculated.constrainingFactor[yearKey] = constrainingFactor;
      
      // Dettagli per anno
      calculated.details[yearKey] = {
        somTarget,
        somAdjustedByAdoption,
        capacityBeforeChannels,
        capacityAfterChannels,
        realisticSales,
        constrainingFactor,
        adoptionRate,
        channelEfficiency
      };
    });
    
    // Aggiungi note
    calculated.maxSalesCapacity.note = "Capacità massima vendite basata su: reps × deals/quarter × 4 × rampFactor";
    calculated.realisticSales.note = "Vendite realistiche = MIN(SOM_adjusted, maxSalesCapacity_adjusted)";
    calculated.constrainingFactor.note = "capacity = limitati da team commerciale | market = limitati da domanda SOM";
    calculated.note = "Valori ricalcolati automaticamente quando cambiano salesCapacity, funnel, TAM/SAM/SOM o adoptionCurve";
    
    return calculated;
  }
}

// Export per uso in componenti
export default GtmCalculationService;
