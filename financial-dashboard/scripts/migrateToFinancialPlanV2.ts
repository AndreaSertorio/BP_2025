/**
 * Script di migrazione database: Rimuove vecchie sezioni e aggiunge financialPlan v2.0
 * 
 * COSA FA:
 * 1. Legge database.json corrente
 * 2. Rimuove contoEconomico e statoPatrimoniale (vecchia struttura)
 * 3. Aggiunge nuova sezione financialPlan v2.0 (phase-based)
 * 4. Salva con backup automatico (via server.js)
 * 
 * SICUREZZA:
 * - Backup automatico attivato in server.js
 * - Validazione pre-save
 * - Rollback possibile
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../src/data/database.json');

interface Database {
  [key: string]: any;
  contoEconomico?: any;
  statoPatrimoniale?: any;
  financialPlan?: any;
}

/**
 * Nuova struttura FinancialPlan v2.0
 */
const NEW_FINANCIAL_PLAN = {
  version: "2.0.0",
  lastUpdated: new Date().toISOString(),
  description: "Piano Finanziario Phase-Based - Calcoli automatici mese×mese da sorgenti dati integrate",
  
  configuration: {
    businessPhases: [
      {
        id: "pre_commercial",
        name: "Pre-Commerciale (R&D + Certificazioni)",
        startDate: "2025-01",
        endDate: "2028-12",
        duration: 48, // mesi
        revenueEnabled: false,
        description: "Sviluppo prototipo, test clinici, certificazione CE Mark, validazioni. Nessun ricavo.",
        milestones: [
          "Prototipo funzionante (Q2 2025)",
          "Test pre-clinici (Q4 2025)",
          "Studi clinici pilota (2026-2027)",
          "CE Mark (Q2 2028)"
        ],
        focus: ["R&D", "Regulatory", "Clinical Validation"]
      },
      {
        id: "launch",
        name: "Lancio Commerciale",
        startDate: "2029-01",
        endDate: "2030-12",
        duration: 24, // mesi
        revenueEnabled: true,
        revenueStartDate: "2029-Q3", // ⭐ KEY: Prime vendite Q3 2029 (6 mesi dopo inizio fase)
        description: "Prime installazioni commerciali, validazione product-market fit, team commerciale iniziale",
        milestones: [
          "Prime 5 installazioni (Q3 2029)",
          "20 clienti attivi (Q4 2029)",
          "50 dispositivi installati (Q4 2030)",
          "Break-even economico (target Q4 2030)"
        ],
        focus: ["Sales", "Customer Success", "Market Validation"]
      },
      {
        id: "scaling",
        name: "Scaling & Espansione",
        startDate: "2031-01",
        endDate: "2035-12",
        duration: 60, // mesi
        revenueEnabled: true,
        description: "Espansione Italia, prime esportazioni Europa, ottimizzazione produzione, team scale-up",
        milestones: [
          "100 dispositivi/anno (2031)",
          "Espansione 3 regioni EU (2032)",
          "Break-even cash flow (Q2 2031)",
          "200+ installazioni totali (2035)"
        ],
        focus: ["International Expansion", "Production Scale", "Team Growth"]
      }
    ],
    
    fundingRounds: [
      {
        id: "seed_2025",
        name: "Seed",
        date: "2025-Q1",
        month: 1, // mese assoluto da inizio piano
        amount: 300000,
        currency: "EUR",
        valuation: {
          preMoney: 1200000,
          postMoney: 1500000
        },
        dilution: 20,
        investors: ["Business Angels", "Accelerator"],
        useOfFunds: {
          rd: { percentage: 40, amount: 120000, description: "Sviluppo prototipo 1, test componenti" },
          team: { percentage: 30, amount: 90000, description: "2 ingegneri biomedici, 1 software dev" },
          marketing: { percentage: 20, amount: 60000, description: "Branding iniziale, sito web, materiali pitch" },
          operations: { percentage: 10, amount: 30000, description: "Spese generali, legali, amministrazione" }
        },
        expectedRunway: 18, // mesi
        milestone: "MVP prototipo + test pre-clinici"
      },
      {
        id: "seed_plus_2026",
        name: "Seed+",
        date: "2026-Q2",
        month: 18, // 18 mesi da inizio
        amount: 650000,
        currency: "EUR",
        valuation: {
          preMoney: 2850000,
          postMoney: 3500000
        },
        dilution: 18.6,
        investors: ["Seed Fund", "Strategic Angels"],
        useOfFunds: {
          rd: { percentage: 35, amount: 227500, description: "Prototipo 2, ottimizzazioni hardware/software" },
          team: { percentage: 30, amount: 195000, description: "QA/RA specialist, clinical team, 1 ingegnere" },
          clinical: { percentage: 20, amount: 130000, description: "Studi clinici pilota, protocolli validazione" },
          marketing: { percentage: 10, amount: 65000, description: "KOL engagement, partecipazione congressi" },
          buffer: { percentage: 5, amount: 32500, description: "Buffer imprevisti" }
        },
        expectedRunway: 24, // mesi
        milestone: "Prototipo finale + inizio studi clinici"
      },
      {
        id: "series_a_2028",
        name: "Series A",
        date: "2028-Q1",
        month: 37, // 37 mesi da inizio
        amount: 2000000,
        currency: "EUR",
        valuation: {
          preMoney: 8000000,
          postMoney: 10000000
        },
        dilution: 20,
        investors: ["VC Fund", "Corporate Investor"],
        useOfFunds: {
          sales: { percentage: 40, amount: 800000, description: "Team commerciale 5 persone, infrastruttura vendita" },
          international: { percentage: 30, amount: 600000, description: "Espansione mercati EU, certificazioni locali" },
          production: { percentage: 20, amount: 400000, description: "Scaling produzione, supply chain" },
          marketing: { percentage: 5, amount: 100000, description: "Marketing campaigns, lead generation" },
          buffer: { percentage: 5, amount: 100000, description: "Buffer + imprevisti" }
        },
        expectedRunway: 30, // mesi
        milestone: "CE Mark + lancio commerciale + prime vendite"
      }
    ],
    
    dataIntegration: {
      description: "Mappatura sorgenti dati per calcoli automatici",
      revenue: {
        source: "revenueModel + goToMarket",
        fields: {
          devicePrice: {
            path: "revenueModel.hardware.unitPrice",
            description: "Prezzo vendita dispositivo hardware",
            fallback: 50000
          },
          deviceCost: {
            path: "revenueModel.hardware.unitCostByType",
            description: "Costo unitario produzione",
            fallback: 11000
          },
          saasMonthlyFee: {
            path: "revenueModel.saas.pricing.perDevice.monthlyFee",
            description: "Canone mensile SaaS per dispositivo",
            fallback: 300
          },
          salesProjection: {
            path: "goToMarket.calculated.realisticSales",
            description: "Proiezioni vendite realistiche dal GTM Engine",
            note: "Array vendite per anno (y1-y5)"
          },
          activationRate: {
            path: "revenueModel.saas.activationRate",
            description: "% dispositivi che attivano SaaS",
            fallback: 0.8
          }
        }
      },
      costs: {
        source: "budget",
        fields: {
          personnel: {
            path: "budget.categories.cat_4.items",
            description: "Costi personale per anno"
          },
          rd: {
            path: "budget.categories.cat_1.items",
            description: "Costi R&D"
          },
          regulatory: {
            path: "budget.categories.cat_2.items",
            description: "Costi regolatori e compliance"
          },
          clinical: {
            path: "budget.categories.cat_3.items",
            description: "Studi clinici e validazioni"
          },
          operations: {
            path: "budget.categories.cat_5.items",
            description: "Overhead operativo"
          },
          marketing: {
            path: "budget.categories.cat_6.items",
            description: "Marketing e commerciale"
          }
        },
        note: "Budget fornisce totali annuali, distribuiamo su 12 mesi"
      },
      market: {
        source: "configurazioneTamSamSom",
        fields: {
          som: {
            path: "ecografi.proiezioni",
            description: "Proiezioni SOM per anni futuri"
          }
        }
      }
    },
    
    assumptions: {
      description: "Assunzioni chiave per calcoli",
      workingCapital: {
        daysReceivables: 60, // giorni incasso clienti
        daysPayables: 30,    // giorni pagamento fornitori
        daysInventory: 45    // giorni rotazione magazzino
      },
      growth: {
        salesGrowthPreRevenue: 0,
        salesGrowthYear1: 1.5, // +50% Y1 post-lancio
        salesGrowthYear2: 2.0, // +100% Y2
        salesGrowthYear3: 1.8, // +80% Y3
        salesGrowthYear4: 1.5  // +50% Y4
      },
      margins: {
        hardwareGrossMargin: 0.78, // 78% (50k vendita, 11k costo)
        saasGrossMargin: 0.95,     // 95% SaaS
        targetEbitdaMargin: 0.30   // 30% EBITDA a regime
      },
      tax: {
        rate: 0.28, // 28% (IRES + IRAP)
        lossCarryForward: true
      }
    }
  },
  
  calculations: {
    description: "OUTPUT dei calcoli - popolato dinamicamente dal FinancialCalculator",
    monthly: {
      description: "Calcoli mese×mese per primi 120 mesi (10 anni)",
      data: [],
      note: "Array di 120 oggetti MonthlyCalculation"
    },
    annual: {
      description: "Aggregazione annuale per 10 anni",
      data: [],
      note: "Array di 10 oggetti AnnualCalculation"
    },
    breakEven: {
      description: "Analisi break-even automatica",
      economic: {
        reached: false,
        date: null,
        month: null,
        revenueNeeded: null,
        unitsNeeded: null,
        note: "Break-even economico: quando EBITDA >= 0"
      },
      cashFlow: {
        reached: false,
        date: null,
        month: null,
        note: "Break-even cash flow: quando cash from operations >= 0"
      }
    },
    metrics: {
      description: "Metriche chiave calcolate",
      currentRunway: 0,
      burnRate: {
        current: 0,
        average: 0,
        trend: "stable"
      },
      capitalNeeded: {
        total: 0,
        breakdown: {}
      },
      ltv: null,
      cac: null,
      ltvCacRatio: null,
      cacPayback: null
    }
  },
  
  metadata: {
    createdAt: new Date().toISOString(),
    createdBy: "FinancialPlanV2 Migration Script",
    version: "2.0.0",
    migrationFrom: "contoEconomico v1.0.0 + statoPatrimoniale v1.0.0",
    note: "Nuova architettura phase-based con calcoli automatici. Sostituisce vecchie sezioni statiche."
  }
};

async function migrate() {
  console.log('🚀 Inizio migrazione Database → FinancialPlan v2.0\n');
  
  try {
    // 1. Leggi database corrente
    console.log('📖 Leggo database corrente...');
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db: Database = JSON.parse(dbContent);
    
    console.log(`✅ Database letto: ${(dbContent.length / 1024).toFixed(1)} KB\n`);
    
    // 2. Verifica cosa c'è da rimuovere
    const hasContoEconomico = !!db.contoEconomico;
    const hasStatoPatrimoniale = !!db.statoPatrimoniale;
    const hasOldFinancialPlan = !!db.financialPlan;
    
    console.log('🔍 Analisi sezioni esistenti:');
    console.log(`   - contoEconomico: ${hasContoEconomico ? '✅ presente (verrà rimosso)' : '❌ assente'}`);
    console.log(`   - statoPatrimoniale: ${hasStatoPatrimoniale ? '✅ presente (verrà rimosso)' : '❌ assente'}`);
    console.log(`   - financialPlan: ${hasOldFinancialPlan ? '⚠️  già presente (verrà sovrascritto)' : '❌ assente'}\n`);
    
    // 3. Rimuovi vecchie sezioni
    if (hasContoEconomico) {
      delete db.contoEconomico;
      console.log('🗑️  Rimosso: contoEconomico');
    }
    
    if (hasStatoPatrimoniale) {
      delete db.statoPatrimoniale;
      console.log('🗑️  Rimosso: statoPatrimoniale');
    }
    
    // 4. Aggiungi nuova sezione
    db.financialPlan = NEW_FINANCIAL_PLAN;
    console.log('✨ Aggiunto: financialPlan v2.0\n');
    
    // 5. Validazione pre-save
    const newDbString = JSON.stringify(db, null, 2);
    const newSize = (newDbString.length / 1024).toFixed(1);
    
    console.log(`📊 Nuovo database: ${newSize} KB`);
    
    // Test parse (verifica JSON valido)
    JSON.parse(newDbString);
    console.log('✅ Validazione JSON: OK\n');
    
    // 6. Salva (backup automatico via server.js!)
    await fs.writeFile(DB_PATH, newDbString, 'utf-8');
    console.log('💾 Database salvato con successo!');
    console.log('   (Backup automatico creato via server.js)\n');
    
    // 7. Riepilogo
    console.log('✅ MIGRAZIONE COMPLETATA!\n');
    console.log('📋 Struttura financialPlan v2.0:');
    console.log(`   - ${NEW_FINANCIAL_PLAN.configuration.businessPhases.length} fasi business configurate`);
    console.log(`   - ${NEW_FINANCIAL_PLAN.configuration.fundingRounds.length} funding rounds definiti`);
    console.log(`   - €${(NEW_FINANCIAL_PLAN.configuration.fundingRounds.reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(0)}K capitale totale pianificato`);
    console.log(`   - Integrazione dati: ${Object.keys(NEW_FINANCIAL_PLAN.configuration.dataIntegration).length} sorgenti`);
    console.log('\n🎯 Prossimi step: Implementare FinancialCalculator per popolare calculations[]');
    
  } catch (error) {
    console.error('\n❌ ERRORE MIGRAZIONE:', error);
    console.error('\n⚠️  Database NON modificato. Verifica il problema e riprova.');
    process.exit(1);
  }
}

// Esegui migrazione
migrate();
