/**
 * Global Settings Service
 * 
 * Service per accedere e modificare parametri globali (SSOT)
 * - Device Price
 * - Sales Mix
 * - Altri parametri condivisi cross-app
 */

export interface GlobalSettings {
  business: {
    devicePrice: number;
    deviceType: string;
    currency: string;
    description?: string;
    lastUpdate?: string;
  };
  salesMix: {
    pubblico: number;
    privato: number;
    research: number;
    description?: string;
    lastUpdate?: string;
  };
}

export interface SalesCycleBySegment {
  pubblico: number;
  privato: number;
  research: number;
}

export class GlobalSettingsService {
  
  /**
   * Get device price (SSOT)
   * Usato da: TAM/SAM/SOM, GTM, Revenue Model
   */
  static getDevicePrice(data: any): number {
    return data?.globalSettings?.business?.devicePrice || 50000;
  }
  
  /**
   * Get device type
   */
  static getDeviceType(data: any): string {
    return data?.globalSettings?.business?.deviceType || 'carrellato';
  }
  
  /**
   * Get currency
   */
  static getCurrency(data: any): string {
    return data?.globalSettings?.business?.currency || 'EUR';
  }
  
  /**
   * Get sales mix per segmento
   * Usato per calcolare media pesata Sales Cycle
   * 
   * ✅ SSOT: goToMarket.salesCycle.salesMix (fallback su globalSettings)
   */
  static getSalesMix(data: any): { pubblico: number; privato: number; research: number } {
    // Prima prova in goToMarket.salesCycle (nuovo SSOT)
    const gtmMix = data?.goToMarket?.salesCycle?.salesMix;
    if (gtmMix) return gtmMix;
    
    // Fallback su globalSettings (legacy)
    return data?.globalSettings?.salesMix || {
      pubblico: 0.6,
      privato: 0.3,
      research: 0.1
    };
  }
  
  /**
   * Validate sales mix (deve sommare a 1.0)
   */
  static validateSalesMix(mix: { pubblico: number; privato: number; research: number }): boolean {
    const total = mix.pubblico + mix.privato + mix.research;
    return Math.abs(total - 1.0) < 0.01; // Tolleranza per arrotondamenti
  }
  
  /**
   * Normalize sales mix (forza somma a 1.0)
   */
  static normalizeSalesMix(mix: { pubblico: number; privato: number; research: number }): {
    pubblico: number;
    privato: number;
    research: number;
  } {
    const total = mix.pubblico + mix.privato + mix.research;
    
    if (total === 0) {
      return { pubblico: 0.6, privato: 0.3, research: 0.1 }; // Default
    }
    
    return {
      pubblico: mix.pubblico / total,
      privato: mix.privato / total,
      research: mix.research / total
    };
  }
  
  /**
   * Calculate weighted average sales cycle
   * 
   * Formula: avgMonths = (pubblico_months × pubblico_mix) + 
   *                      (privato_months × privato_mix) + 
   *                      (research_months × research_mix)
   * 
   * Example: (9 × 0.6) + (3 × 0.3) + (6 × 0.1) = 5.4 + 0.9 + 0.6 = 6.6 mesi
   */
  static calculateWeightedAvgSalesCycle(
    bySegment: SalesCycleBySegment,
    data: any
  ): number {
    const mix = this.getSalesMix(data);
    
    const weighted = 
      (bySegment.pubblico * mix.pubblico) +
      (bySegment.privato * mix.privato) +
      (bySegment.research * mix.research);
    
    // Arrotonda a 1 decimale
    return Math.round(weighted * 10) / 10;
  }
  
  /**
   * Format price with currency
   */
  static formatPrice(price: number, data: any): string {
    const currency = this.getCurrency(data);
    
    if (currency === 'EUR') {
      return `€${price.toLocaleString('it-IT')}`;
    } else if (currency === 'USD') {
      return `$${price.toLocaleString('en-US')}`;
    }
    
    return `${currency} ${price.toLocaleString()}`;
  }
  
  /**
   * Get all global settings
   */
  static getGlobalSettings(data: any): GlobalSettings | null {
    return data?.globalSettings || null;
  }
}

export default GlobalSettingsService;
