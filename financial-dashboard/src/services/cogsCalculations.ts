/**
 * 🧮 COGS & GROSS MARGIN CALCULATION SERVICE
 * 
 * Punto 3 del Piano Sviluppo: Margine Lordo, COGS e OPEX
 * 
 * Calcola Cost of Goods Sold e Gross Margin per:
 * - Hardware (dispositivi ecografici)
 * - SaaS (abbonamenti software)
 * - Consumables (materiali ricorrenti)
 * - Services (servizi professionali)
 * 
 * Formula base:
 * - COGS = Ricavi × (1 - Gross Margin%)
 * - Gross Margin = Ricavi - COGS
 * - Gross Margin % = (Ricavi - COGS) / Ricavi × 100
 * 
 * @module cogsCalculations
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CogsHardware {
  unitsSold: number;
  unitCost: number;           // Costo unitario medio
  totalCogs: number;          // Costo totale
  revenue: number;            // Ricavi hardware
  grossMargin: number;        // Margine lordo €
  grossMarginPct: number;     // Margine lordo %
}

export interface CogsSaaS {
  activeSubscriptions: number;
  costPerUser: number;        // Costo cloud per utente/mese
  paymentFees: number;        // Commissioni payment processor
  totalCogs: number;
  revenue: number;
  grossMargin: number;
  grossMarginPct: number;
}

export interface CogsConsumables {
  itemsSold: number;
  avgCostPerItem: number;
  totalCogs: number;
  revenue: number;
  grossMargin: number;
  grossMarginPct: number;
}

export interface CogsServices {
  hoursBilled: number;
  costPerHour: number;
  totalCogs: number;
  revenue: number;
  grossMargin: number;
  grossMarginPct: number;
}

export interface CogsBreakdown {
  hardware: CogsHardware;
  saas: CogsSaaS;
  consumables: CogsConsumables;
  services: CogsServices;
  total: {
    revenue: number;
    cogs: number;
    grossMargin: number;
    grossMarginPct: number;
  };
}

export interface CogsInput {
  // Hardware
  hardwareRevenue: number;
  hardwareUnits: number;
  hardwareUnitCost: number;          // Default o da revenueModel
  hardwareMarginTarget?: number;     // Target gross margin % (opzionale)
  
  // SaaS
  saasRevenue: number;
  saasActiveUsers: number;
  saasCostPerUser?: number;          // Default 3.5 €/mese
  saasPaymentFeePct?: number;        // Default 3%
  
  // Consumables (opzionale)
  consumablesRevenue?: number;
  consumablesUnits?: number;
  consumablesAvgCost?: number;
  
  // Services (opzionale)
  servicesRevenue?: number;
  servicesHours?: number;
  servicesCostPerHour?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SAAS_COST_PER_USER = 3.5;      // €/mese per utente (cloud)
const DEFAULT_PAYMENT_FEE_PCT = 0.03;        // 3% commissioni payment
const DEFAULT_SERVICES_COST_HOUR = 50;       // €50/ora costo interno

// ============================================================================
// HARDWARE COGS
// ============================================================================

/**
 * Calcola COGS per Hardware
 * 
 * Formula:
 * - COGS = unitsSold × unitCost
 * - Gross Margin = Revenue - COGS
 * - Gross Margin % = (Revenue - COGS) / Revenue × 100
 */
export function calculateHardwareCogs(
  revenue: number,
  units: number,
  unitCost: number,
  marginTarget?: number
): CogsHardware {
  // Se abbiamo un target margin, calcola COGS al contrario
  let totalCogs: number;
  
  if (marginTarget && marginTarget > 0 && marginTarget < 1) {
    // COGS = Revenue × (1 - marginTarget)
    totalCogs = revenue * (1 - marginTarget);
  } else {
    // COGS = units × unitCost
    totalCogs = units * unitCost;
  }
  
  const grossMargin = revenue - totalCogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  return {
    unitsSold: units,
    unitCost: units > 0 ? totalCogs / units : unitCost,
    totalCogs,
    revenue,
    grossMargin,
    grossMarginPct
  };
}

// ============================================================================
// SAAS COGS
// ============================================================================

/**
 * Calcola COGS per SaaS
 * 
 * COGS SaaS include:
 * - Cloud infrastructure (per utente)
 * - Payment processing fees (% revenue)
 * 
 * Gross Margin SaaS tipicamente molto alto (85-95%)
 */
export function calculateSaaSCogs(
  revenue: number,
  activeUsers: number,
  costPerUser: number = DEFAULT_SAAS_COST_PER_USER,
  paymentFeePct: number = DEFAULT_PAYMENT_FEE_PCT
): CogsSaaS {
  // COGS = (costPerUser × activeUsers) + (revenue × paymentFeePct)
  const infrastructureCost = activeUsers * costPerUser;
  const paymentFees = revenue * paymentFeePct;
  const totalCogs = infrastructureCost + paymentFees;
  
  const grossMargin = revenue - totalCogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  return {
    activeSubscriptions: activeUsers,
    costPerUser,
    paymentFees,
    totalCogs,
    revenue,
    grossMargin,
    grossMarginPct
  };
}

// ============================================================================
// CONSUMABLES COGS
// ============================================================================

/**
 * Calcola COGS per Consumables (gel, accessori)
 */
export function calculateConsumablesCogs(
  revenue: number,
  units: number,
  avgCostPerItem: number
): CogsConsumables {
  const totalCogs = units * avgCostPerItem;
  const grossMargin = revenue - totalCogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  return {
    itemsSold: units,
    avgCostPerItem,
    totalCogs,
    revenue,
    grossMargin,
    grossMarginPct
  };
}

// ============================================================================
// SERVICES COGS
// ============================================================================

/**
 * Calcola COGS per Services (training, consulting)
 */
export function calculateServicesCogs(
  revenue: number,
  hours: number,
  costPerHour: number = DEFAULT_SERVICES_COST_HOUR
): CogsServices {
  const totalCogs = hours * costPerHour;
  const grossMargin = revenue - totalCogs;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
  
  return {
    hoursBilled: hours,
    costPerHour,
    totalCogs,
    revenue,
    grossMargin,
    grossMarginPct
  };
}

// ============================================================================
// BLENDED COGS (TUTTE LE LINEE)
// ============================================================================

/**
 * Calcola COGS blended per tutte le linee di business
 * 
 * @param input Ricavi e parametri per ogni linea di business
 * @returns Breakdown completo COGS + totali aggregati
 */
export function calculateBlendedCogs(input: CogsInput): CogsBreakdown {
  // Hardware
  const hardware = calculateHardwareCogs(
    input.hardwareRevenue,
    input.hardwareUnits,
    input.hardwareUnitCost,
    input.hardwareMarginTarget
  );
  
  // SaaS
  const saas = calculateSaaSCogs(
    input.saasRevenue,
    input.saasActiveUsers,
    input.saasCostPerUser,
    input.saasPaymentFeePct
  );
  
  // Consumables (se abilitato)
  const consumables = input.consumablesRevenue
    ? calculateConsumablesCogs(
        input.consumablesRevenue,
        input.consumablesUnits || 0,
        input.consumablesAvgCost || 0
      )
    : {
        itemsSold: 0,
        avgCostPerItem: 0,
        totalCogs: 0,
        revenue: 0,
        grossMargin: 0,
        grossMarginPct: 0
      };
  
  // Services (se abilitato)
  const services = input.servicesRevenue
    ? calculateServicesCogs(
        input.servicesRevenue,
        input.servicesHours || 0,
        input.servicesCostPerHour
      )
    : {
        hoursBilled: 0,
        costPerHour: 0,
        totalCogs: 0,
        revenue: 0,
        grossMargin: 0,
        grossMarginPct: 0
      };
  
  // Totali aggregati
  const totalRevenue = hardware.revenue + saas.revenue + consumables.revenue + services.revenue;
  const totalCogs = hardware.totalCogs + saas.totalCogs + consumables.totalCogs + services.totalCogs;
  const totalGrossMargin = totalRevenue - totalCogs;
  const totalGrossMarginPct = totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0;
  
  return {
    hardware,
    saas,
    consumables,
    services,
    total: {
      revenue: totalRevenue,
      cogs: totalCogs,
      grossMargin: totalGrossMargin,
      grossMarginPct: totalGrossMarginPct
    }
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calcola learning curve per hardware
 * Riduzione costi con economie di scala
 * 
 * Formula: newCost = baseCost × (cumulativeUnits / baseUnits) ^ log(1-reductionPct) / log(2)
 */
export function applyLearningCurve(
  baseCost: number,
  cumulativeUnits: number,
  baseUnits: number = 100,
  reductionPctPerDoubling: number = 0.15  // 15% riduzione per ogni raddoppio
): number {
  if (cumulativeUnits <= baseUnits) return baseCost;
  
  const learningFactor = Math.log(1 - reductionPctPerDoubling) / Math.log(2);
  const costMultiplier = Math.pow(cumulativeUnits / baseUnits, learningFactor);
  
  return baseCost * costMultiplier;
}

/**
 * Valida input COGS
 */
export function validateCogsInput(input: CogsInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (input.hardwareRevenue < 0) errors.push('Hardware revenue cannot be negative');
  if (input.hardwareUnits < 0) errors.push('Hardware units cannot be negative');
  if (input.hardwareUnitCost < 0) errors.push('Hardware unit cost cannot be negative');
  
  if (input.saasRevenue < 0) errors.push('SaaS revenue cannot be negative');
  if (input.saasActiveUsers < 0) errors.push('SaaS active users cannot be negative');
  
  if (input.hardwareMarginTarget && (input.hardwareMarginTarget < 0 || input.hardwareMarginTarget > 1)) {
    errors.push('Hardware margin target must be between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formatta valori COGS per display
 */
export function formatCogsValue(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formatta percentuale
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
