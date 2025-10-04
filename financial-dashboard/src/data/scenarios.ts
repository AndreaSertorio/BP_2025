import { Scenario, ScenarioKey } from '@/types/financial';
import { defaultFinancialAssumptions, sectorAssumptions } from './defaultAssumptions';

export const defaultScenarios: Record<ScenarioKey, Scenario> = {
  prudente: {
    key: "prudente",
    name: "Scenario Prudente",
    drivers: {
      // Market-based lead generation
      useMarketBasedLeads: true,
      marketPenetrationY1: 0.00005, // 0.005% del SAM (molto conservativo)
      marketPenetrationY5: 0.0003,  // 0.03% del SAM a Y5
      leadMult: 0.85,
      l2d: 0.18,
      d2p: 0.45,
      p2d: 0.55,
      dealMult: 1.10,
      mixCapEx: 0.25, // 25% contratti CapEx, 75% Subscription
      arpaSub: 13200, // € - canone all-in subscription
      arpaMaint: 4800, // € - canone manutenzione CapEx
      gmRecurring: 0.78,
      devicePrice: 25000, // €
      hwChurn: 0.0025, // 3% annual = 0.25% monthly
      scansPerDevicePerMonth: 50,
      churnAnnual: 0.10,
      hwChurnAnnual: 0.03,
      growthQoqPostQ8: 0.08,
      opex: {
        1: 1.70,
        2: 2.30,
        3: 3.20,
        4: 4.20,
        5: 5.20
      },
      salesMarketingOpex: {
        1: 0.51, // 30% di OPEX
        2: 0.69,
        3: 0.96,
        4: 1.26,
        5: 1.56
      },
      cogsHw: {
        1: 13000,
        2: 12800,
        3: 12200,
        4: 11000,
        5: 10500
      },
      terminalValueMultiple: 2.0 // Conservative for prudent scenario
    },
    base: {
      leadsPerQuarterQ1toQ8: [120, 150, 180, 220, 260, 300, 350, 400]
    },
    assumptions: defaultFinancialAssumptions
  },
  base: {
    key: "base",
    name: "Scenario Base",
    drivers: {
      // Market-based lead generation
      useMarketBasedLeads: true,
      marketPenetrationY1: 0.00008, // 0.008% del SAM
      marketPenetrationY5: 0.0005,  // 0.05% del SAM a Y5
      leadMult: 1.00,
      l2d: 0.20,
      d2p: 0.50,
      p2d: 0.60,
      dealMult: 1.20,
      mixCapEx: 0.30, // 30% contratti CapEx, 70% Subscription
      arpaSub: 14600, // € - canone all-in subscription
      arpaMaint: 5200, // € - canone manutenzione CapEx
      gmRecurring: 0.80,
      devicePrice: 26000, // €
      hwChurn: 0.0025, // 3% annual = 0.25% monthly
      scansPerDevicePerMonth: 60,
      churnAnnual: 0.08,
      hwChurnAnnual: 0.03,
      growthQoqPostQ8: 0.12,
      opex: {
        1: 1.80,
        2: 2.50,
        3: 3.50,
        4: 4.50,
        5: 5.50
      },
      salesMarketingOpex: {
        1: 0.54, // 30% di OPEX
        2: 0.75,
        3: 1.05,
        4: 1.35,
        5: 1.65
      },
      cogsHw: {
        1: 12000,
        2: 11800,
        3: 11200,
        4: 10500,
        5: 10000
      },
      terminalValueMultiple: 3.0 // Moderate for base scenario
    },
    base: {
      leadsPerQuarterQ1toQ8: [120, 150, 180, 220, 260, 300, 350, 400]
    },
    assumptions: defaultFinancialAssumptions
  },
  ambizioso: {
    key: "ambizioso",
    name: "Scenario Ambizioso",
    drivers: {
      // Market-based lead generation
      useMarketBasedLeads: true,
      marketPenetrationY1: 0.00012, // 0.012% del SAM
      marketPenetrationY5: 0.0008,  // 0.08% del SAM a Y5
      leadMult: 1.15,
      l2d: 0.22,
      d2p: 0.55,
      p2d: 0.65,
      dealMult: 1.30,
      mixCapEx: 0.35, // 35% contratti CapEx, 65% Subscription
      arpaSub: 16060, // € - canone all-in subscription
      arpaMaint: 5800, // € - canone manutenzione CapEx
      gmRecurring: 0.82,
      devicePrice: 27000, // €
      hwChurn: 0.0017, // 2% annual = 0.17% monthly
      scansPerDevicePerMonth: 70,
      churnAnnual: 0.06,
      hwChurnAnnual: 0.02,
      growthQoqPostQ8: 0.16,
      opex: {
        1: 2.00,
        2: 2.90,
        3: 4.10,
        4: 5.20,
        5: 6.30
      },
      salesMarketingOpex: {
        1: 0.60, // 30% di OPEX
        2: 0.87,
        3: 1.23,
        4: 1.56,
        5: 1.89
      },
      cogsHw: {
        1: 11500,
        2: 11200,
        3: 10600,
        4: 10000,
        5: 9500
      },
      terminalValueMultiple: 4.0 // Optimistic but realistic
    },
    base: {
      leadsPerQuarterQ1toQ8: [120, 150, 180, 220, 260, 300, 350, 400]
    },
    assumptions: defaultFinancialAssumptions
  },
  custom: {
    key: "custom",
    name: "Scenario Custom",
    drivers: {
      leadMult: 1.00,
      l2d: 0.20,
      d2p: 0.50,
      p2d: 0.60,
      dealMult: 1.20,
      mixCapEx: 0.30, // 30% contratti CapEx, 70% Subscription
      arpaSub: 14600, // € - canone all-in subscription
      arpaMaint: 5200, // € - canone manutenzione CapEx
      gmRecurring: 0.80,
      devicePrice: 26000,
      hwChurn: 0.0025, // 3% annual = 0.25% monthly
      scansPerDevicePerMonth: 60,
      churnAnnual: 0.08,
      hwChurnAnnual: 0.03,
      growthQoqPostQ8: 0.12,
      opex: {
        1: 1.80,
        2: 2.50,
        3: 3.50,
        4: 4.50,
        5: 5.50
      },
      salesMarketingOpex: {
        1: 0.54, // 30% di OPEX
        2: 0.75,
        3: 1.05,
        4: 1.35,
        5: 1.65
      },
      cogsHw: {
        1: 12000,
        2: 11800,
        3: 11200,
        4: 10500,
        5: 10000
      },
      terminalValueMultiple: 3.0 // Moderate for custom scenario
    },
    base: {
      leadsPerQuarterQ1toQ8: [120, 150, 180, 220, 260, 300, 350, 400]
    },
    assumptions: defaultFinancialAssumptions
  },
  
  // Sector-specific scenarios based on medical applications
  tiroide: {
    key: "tiroide",
    name: "Tiroide Focus",
    drivers: {
      // Market-based lead generation
      useMarketBasedLeads: true,
      marketPenetrationY1: 0.0001,  // 0.01% del SAM settore
      marketPenetrationY5: 0.0006,  // 0.06% del SAM settore
      leadMult: 1.00,
      l2d: 0.22, // Higher conversion for specialized thyroid focus
      d2p: 0.55,
      p2d: 0.65,
      dealMult: 1.15,
      mixCapEx: 0.25, // Less CapEx for specialized application
      arpaSub: 15200, // Premium for specialized thyroid software
      arpaMaint: 5400,
      gmRecurring: 0.82,
      devicePrice: 26500,
      hwChurn: 0.0020, // Lower churn for specialized use
      scansPerDevicePerMonth: 75, // Higher utilization for thyroid focus
      churnAnnual: 0.06,
      hwChurnAnnual: 0.024,
      growthQoqPostQ8: 0.14,
      opex: {
        1: 1.60, // Lower OPEX for focused market
        2: 2.20,
        3: 3.00,
        4: 3.80,
        5: 4.60
      },
      salesMarketingOpex: {
        1: 0.48,
        2: 0.66,
        3: 0.90,
        4: 1.14,
        5: 1.38
      },
      cogsHw: {
        1: 11800,
        2: 11600,
        3: 11000,
        4: 10300,
        5: 9800
      },
      terminalValueMultiple: 3.5
    },
    base: {
      leadsPerQuarterQ1toQ8: [80, 100, 120, 150, 180, 210, 240, 280] // Smaller focused market
    },
    assumptions: sectorAssumptions.tiroide
  },
  
  rene: {
    key: "rene",
    name: "Rene/Urologia Focus",
    drivers: {
      // Market-based lead generation
      useMarketBasedLeads: true,
      marketPenetrationY1: 0.0001,  // 0.01% del SAM settore
      marketPenetrationY5: 0.0006,  // 0.06% del SAM settore
      leadMult: 1.00,
      l2d: 0.21,
      d2p: 0.52,
      p2d: 0.62,
      dealMult: 1.20,
      mixCapEx: 0.30,
      arpaSub: 14800,
      arpaMaint: 5100,
      gmRecurring: 0.81,
      devicePrice: 26000,
      hwChurn: 0.0022,
      scansPerDevicePerMonth: 65,
      churnAnnual: 0.07,
      hwChurnAnnual: 0.026,
      growthQoqPostQ8: 0.13,
      opex: {
        1: 1.50,
        2: 2.10,
        3: 2.80,
        4: 3.50,
        5: 4.20
      },
      salesMarketingOpex: {
        1: 0.45,
        2: 0.63,
        3: 0.84,
        4: 1.05,
        5: 1.26
      },
      cogsHw: {
        1: 12100,
        2: 11900,
        3: 11300,
        4: 10600,
        5: 10100
      },
      terminalValueMultiple: 3.2
    },
    base: {
      leadsPerQuarterQ1toQ8: [70, 85, 105, 130, 155, 180, 210, 240]
    },
    assumptions: sectorAssumptions.rene
  },
  
  msk: {
    key: "msk",
    name: "MSK Focus",
    drivers: {
      leadMult: 1.00,
      l2d: 0.19, // MSK might have more competition
      d2p: 0.48,
      p2d: 0.58,
      dealMult: 1.25,
      mixCapEx: 0.35, // More CapEx for sports medicine
      arpaSub: 14200,
      arpaMaint: 4900,
      gmRecurring: 0.79,
      devicePrice: 25500,
      hwChurn: 0.0025,
      scansPerDevicePerMonth: 70,
      churnAnnual: 0.08,
      hwChurnAnnual: 0.030,
      growthQoqPostQ8: 0.11,
      opex: {
        1: 1.70,
        2: 2.30,
        3: 3.10,
        4: 3.90,
        5: 4.70
      },
      salesMarketingOpex: {
        1: 0.51,
        2: 0.69,
        3: 0.93,
        4: 1.17,
        5: 1.41
      },
      cogsHw: {
        1: 12300,
        2: 12100,
        3: 11500,
        4: 10800,
        5: 10300
      },
      terminalValueMultiple: 3.0
    },
    base: {
      leadsPerQuarterQ1toQ8: [85, 105, 125, 155, 185, 215, 250, 290]
    },
    assumptions: sectorAssumptions.msk
  },
  
  senologia: {
    key: "senologia",
    name: "Senologia Focus",
    drivers: {
      leadMult: 1.00,
      l2d: 0.23, // High conversion for breast health focus
      d2p: 0.57,
      p2d: 0.68,
      dealMult: 1.10,
      mixCapEx: 0.20, // Less CapEx for women's health centers
      arpaSub: 15800, // Premium for specialized breast imaging
      arpaMaint: 5600,
      gmRecurring: 0.83,
      devicePrice: 27000,
      hwChurn: 0.0018, // Very low churn for specialized breast centers
      scansPerDevicePerMonth: 80, // High utilization in women's health
      churnAnnual: 0.05,
      hwChurnAnnual: 0.022,
      growthQoqPostQ8: 0.15,
      opex: {
        1: 1.65,
        2: 2.25,
        3: 3.05,
        4: 3.85,
        5: 4.65
      },
      salesMarketingOpex: {
        1: 0.50,
        2: 0.68,
        3: 0.92,
        4: 1.16,
        5: 1.40
      },
      cogsHw: {
        1: 11700,
        2: 11500,
        3: 10900,
        4: 10200,
        5: 9700
      },
      terminalValueMultiple: 3.8
    },
    base: {
      leadsPerQuarterQ1toQ8: [90, 110, 135, 165, 195, 225, 260, 300]
    },
    assumptions: sectorAssumptions.senologia
  },
  
  completo: {
    key: "completo",
    name: "Mercato Completo",
    drivers: {
      leadMult: 1.00,
      l2d: 0.20,
      d2p: 0.50,
      p2d: 0.60,
      dealMult: 1.20,
      mixCapEx: 0.30,
      arpaSub: 14600,
      arpaMaint: 5200,
      gmRecurring: 0.80,
      devicePrice: 26000,
      hwChurn: 0.0025,
      scansPerDevicePerMonth: 60,
      churnAnnual: 0.08,
      hwChurnAnnual: 0.03,
      growthQoqPostQ8: 0.12,
      opex: {
        1: 1.80,
        2: 2.50,
        3: 3.50,
        4: 4.50,
        5: 5.50
      },
      salesMarketingOpex: {
        1: 0.54,
        2: 0.75,
        3: 1.05,
        4: 1.35,
        5: 1.65
      },
      cogsHw: {
        1: 12000,
        2: 11800,
        3: 11200,
        4: 10500,
        5: 10000
      },
      terminalValueMultiple: 3.0
    },
    base: {
      leadsPerQuarterQ1toQ8: [120, 150, 180, 220, 260, 300, 350, 400] // Full market potential
    },
    assumptions: sectorAssumptions.completo,
    marketConfig: {
      selectedSectors: ['tiroide', 'rene', 'msk', 'senologia'], // All sectors by default
      customTAM: 63800, // Will be calculated dynamically
      customSAM: 31900  // Will be calculated dynamically
    }
  }
};

export const parameterLimits = {
  leadMult: { min: 0.5, max: 3.0, step: 0.1 },
  l2d: { min: 0.15, max: 0.40, step: 0.01 },
  d2p: { min: 0.25, max: 0.60, step: 0.01 },
  p2d: { min: 0.40, max: 0.80, step: 0.01 },
  dealMult: { min: 0.8, max: 2.0, step: 0.1 },
  arpaSub: { min: 12000, max: 40000, step: 500 },
  arpaMaint: { min: 3000, max: 12000, step: 250 },
  mixCapEx: { min: 0.0, max: 1.0, step: 0.05 },
  gmRecurring: { min: 0.60, max: 0.90, step: 0.01 },
  devicePrice: { min: 15000, max: 35000, step: 500 },
  churnAnnual: { min: 0.02, max: 0.20, step: 0.01 },
  hwChurnAnnual: { min: 0.01, max: 0.10, step: 0.005 },
  growthQoqPostQ8: { min: 0.05, max: 0.25, step: 0.01 },
  opex: { min: 0.5, max: 10.0, step: 0.1 },
  salesMarketingOpex: { min: 0.2, max: 5.0, step: 0.1 },
  cogsHw: { min: 5000, max: 20000, step: 100 },
  scansPerDevicePerMonth: { min: 400, max: 1000, step: 20 },
  terminalValueMultiple: { min: 3.0, max: 8.0, step: 0.5 },
  // Market Penetration
  marketPenetrationY1: { min: 0.00001, max: 0.001, step: 0.00001 },
  marketPenetrationY5: { min: 0.0001, max: 0.01, step: 0.0001 },
  // Financial Assumptions (previously hard-coded)
  initialCash: { min: 0.5, max: 10.0, step: 0.1 },
  discountRate: { min: 0.05, max: 0.25, step: 0.01 },
  capexAsPercentRevenue: { min: 0.01, max: 0.15, step: 0.01 },
  depreciationRate: { min: 0.05, max: 0.40, step: 0.05 },
  tam: { min: 0, max: 100000, step: 1000 },
  sam: { min: 0, max: 50000, step: 500 },
  realizationFactor: { min: 0.5, max: 1.0, step: 0.01 },
  daysReceivable: { min: 15, max: 90, step: 5 },
  daysPayable: { min: 15, max: 60, step: 5 },
  inventoryMonths: { min: 1, max: 6, step: 0.5 }
};

export const parameterDescriptions = {
  leadMult: {
    label: "Moltiplicatore Leads",
    description: "Fattore moltiplicativo sui leads di base per trimestre",
    unit: "x",
    impact: "Impatta direttamente il numero di leads generati ogni mese"
  },
  l2d: {
    label: "Conversione Lead→Demo",
    description: "Percentuale di conversione da Lead a Demo",
    unit: "%",
    impact: "Determina quante demo vengono generate dai leads"
  },
  d2p: {
    label: "Conversione Demo→Pilot",
    description: "Percentuale di conversione da Demo a Pilot",
    unit: "%",
    impact: "Determina quanti pilot vengono avviati dalle demo"
  },
  p2d: {
    label: "Conversione Pilot→Deal",
    description: "Percentuale di conversione da Pilot a Deal concluso",
    unit: "%",
    impact: "Determina il tasso di chiusura dei contratti"
  },
  churnAnnual: {
    label: "Churn Annuale Clienti",
    description: "Percentuale annua di clienti che cessano il servizio",
    unit: "%",
    impact: "Riduce il numero di account attivi nel tempo"
  },
  hwChurnAnnual: {
    label: "Churn Hardware Annuo",
    description: "Percentuale annua di dispositivi che escono dal parco installato",
    unit: "%",
    impact: "Riduce il numero di dispositivi attivi"
  },
  growthQoqPostQ8: {
    label: "Crescita QoQ Post-Q8",
    description: "Crescita trimestrale dei leads dopo il trimestre 8",
    unit: "%",
    impact: "Determina l'accelerazione di crescita nel lungo termine"
  },
  scansPerDevicePerMonth: {
    label: "Scansioni per Dispositivo/Mese",
    description: "Numero medio di scansioni eseguite per dispositivo ogni mese",
    unit: "scansioni",
    impact: "Determina l'utilizzo e il valore generato per dispositivo"
  },
  dealMult: {
    label: "Dispositivi per Deal",
    description: "Numero medio di dispositivi venduti per contratto",
    unit: "unità",
    impact: "Moltiplicatore sui ricavi hardware per ogni deal"
  },
  arpaSub: {
    label: "ARPA Subscription",
    description: "Annual Revenue Per Account per clienti subscription (all-in: software + servizi + manutenzione)",
    unit: "€",
    impact: "Impatta direttamente i ricavi ricorrenti per clienti subscription"
  },
  arpaMaint: {
    label: "ARPA Maintenance",
    description: "Annual Revenue Per Account per manutenzione clienti CapEx (solo servizi post-vendita)",
    unit: "€",
    impact: "Impatta i ricavi ricorrenti per clienti CapEx"
  },
  mixCapEx: {
    label: "Mix Contratti CapEx",
    description: "Percentuale di contratti venduti come CapEx vs Subscription",
    unit: "%",
    impact: "Determina la distribuzione tra modelli di business CapEx e Subscription"
  },
  gmRecurring: {
    label: "Margine Lordo Ricorrente",
    description: "Percentuale di margine lordo sui ricavi ricorrenti",
    unit: "%",
    impact: "Determina la profittabilità dei ricavi software/servizi"
  },
  salesMarketingOpex: {
    label: "OPEX Sales & Marketing",
    description: "Costi operativi annui per vendite e marketing",
    unit: "M€",
    impact: "Utilizzato per calcolo CAC realistico separato da altri OPEX"
  },
  devicePrice: {
    label: "Prezzo Dispositivo",
    description: "Prezzo di vendita del dispositivo hardware",
    unit: "€",
    impact: "Impatta i ricavi CapEx per dispositivo venduto"
  },
  opex: {
    label: "OPEX",
    description: "Costi operativi annuali",
    unit: "M€",
    impact: "Impatta direttamente l'EBITDA sottraendo dai margini lordi"
  },
  cogsHw: {
    label: "COGS Hardware",
    description: "Costo del venduto per dispositivo hardware",
    unit: "€/unità",
    impact: "Riduce il margine lordo sui ricavi CapEx"
  },
  terminalValueMultiple: {
    label: "Multiplo Terminal Value",
    description: "Multiplo dell'EBITDA finale per calcolo valore terminale NPV",
    unit: "x",
    impact: "Impatta significativamente il valore attuale netto del progetto"
  },
  initialCash: {
    label: "Capitale Iniziale",
    description: "Capitale iniziale disponibile per finanziare il progetto",
    unit: "M€",
    impact: "Determina la disponibilità finanziaria iniziale e runway"
  },
  discountRate: {
    label: "Tasso di Sconto (WACC)",
    description: "Costo medio ponderato del capitale per calcolo NPV",
    unit: "%",
    impact: "Impatta significativamente il valore attuale netto del progetto"
  },
  capexAsPercentRevenue: {
    label: "CapEx % Ricavi",
    description: "CapEx come percentuale dei ricavi annuali",
    unit: "%",
    impact: "Determina gli investimenti in capitale fisso"
  },
  depreciationRate: {
    label: "Tasso Ammortamento",
    description: "Percentuale annua di ammortamento degli asset",
    unit: "%",
    impact: "Impatta P&L attraverso ammortamenti e valore asset"
  },
  tam: {
    label: "TAM (Total Addressable Market)",
    description: "Mercato totale raggiungibile in milioni di esami annui",
    unit: "M esami",
    impact: "Definisce il potenziale totale del mercato"
  },
  sam: {
    label: "SAM (Serviceable Addressable Market)",
    description: "Mercato effettivamente servibile in milioni di esami annui",
    unit: "M esami",
    impact: "Definisce il mercato target realisticamente raggiungibile"
  },
  marketPenetrationY1: {
    label: "Market Penetration Anno 1",
    description: "Percentuale del SAM che genera leads nell'anno 1 (es. 0.00008 = 0.008%)",
    unit: "%",
    impact: "Determina il numero di leads iniziale basato sul SAM"
  },
  marketPenetrationY5: {
    label: "Market Penetration Anno 5",
    description: "Percentuale del SAM che genera leads nell'anno 5 (es. 0.0005 = 0.05%)",
    unit: "%",
    impact: "Determina il target di penetrazione a lungo termine"
  },
  realizationFactor: {
    label: "Fattore di Realizzazione",
    description: "Percentuale di scansioni effettivamente fatturate",
    unit: "%",
    impact: "Riduce i ricavi teorici per inefficienze operative"
  },
  daysReceivable: {
    label: "Giorni Crediti",
    description: "Tempo medio di incasso dai clienti",
    unit: "giorni",
    impact: "Impatta il working capital e cash flow"
  },
  daysPayable: {
    label: "Giorni Debiti",
    description: "Tempo medio di pagamento ai fornitori",
    unit: "giorni",
    impact: "Impatta il working capital e liquidità"
  },
  inventoryMonths: {
    label: "Scorte (Mesi)",
    description: "Mesi di inventario da mantenere",
    unit: "mesi",
    impact: "Impatta il capitale circolante e costi di magazzino"
  }
};
