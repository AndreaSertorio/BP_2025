# 💾 SCHEMA DATABASE - PIANO FINANZIARIO PHASE-BASED

## Struttura da aggiungere a database.json

```json
{
  "financialPlan": {
    "version": "2.0",
    "lastUpdated": "2025-10-20",
    "description": "Piano Finanziario Phase-Based per Eco 3D",
    
    "configuration": {
      "company": {
        "name": "Eco 3D",
        "foundedDate": "2025-01",
        "planHorizon": 10
      },
      
      "phases": [
        {
          "id": "pre_commercial",
          "name": "Pre-Commerciale",
          "startDate": "2025-01",
          "endDate": "2028-12",
          "revenueEnabled": false,
          "description": "R&D, certificazioni, studi clinici. Zero ricavi.",
          "color": "#ef4444",
          
          "milestones": [
            {
              "id": "proto1",
              "date": "2025-Q4",
              "name": "Prototipo 1 completato",
              "description": "MVP tecnico funzionante",
              "critical": true,
              "achieved": false
            },
            {
              "id": "ce_mark",
              "date": "2028-Q2",
              "name": "CE Mark ottenuto",
              "description": "Certificazione MDR completata",
              "critical": true,
              "achieved": false
            }
          ],
          
          "costStructure": {
            "personnel": [
              {
                "role": "Founder/CEO",
                "count": 1,
                "monthlySalary": 3000,
                "startMonth": "2025-01"
              },
              {
                "role": "CTO",
                "count": 1,
                "monthlySalary": 3500,
                "startMonth": "2025-01"
              },
              {
                "role": "Ingegnere HW",
                "count": 2,
                "monthlySalary": 3000,
                "startMonth": "2025-06"
              },
              {
                "role": "QA/RA Manager",
                "count": 1,
                "monthlySalary": 3500,
                "startMonth": "2027-01"
              }
            ],
            
            "rd": [
              {
                "name": "Materiali prototipazione",
                "monthlyAmount": 2000,
                "startMonth": "2025-01",
                "endMonth": "2026-12"
              },
              {
                "name": "Test laboratorio",
                "monthlyAmount": 3000,
                "startMonth": "2026-01",
                "endMonth": "2027-12"
              }
            ],
            
            "regulatory": [
              {
                "name": "Consulenza MDR",
                "monthlyAmount": 2000,
                "startMonth": "2026-06",
                "endMonth": "2028-06"
              },
              {
                "name": "Studi clinici",
                "monthlyAmount": 5000,
                "startMonth": "2027-06",
                "endMonth": "2028-06"
              }
            ],
            
            "operations": [
              {
                "name": "Affitto laboratorio",
                "monthlyAmount": 1500,
                "startMonth": "2025-01"
              },
              {
                "name": "Software e licenze",
                "monthlyAmount": 500,
                "startMonth": "2025-01"
              }
            ],
            
            "capex": [
              {
                "name": "Attrezzature laboratorio",
                "amount": 50000,
                "month": "2025-03",
                "depreciationYears": 5
              }
            ]
          },
          
          "fundingRounds": [
            {
              "id": "seed_2025",
              "date": "2025-Q1",
              "type": "seed",
              "amount": 300000,
              "valuation": 1500000,
              "dilution": 20,
              "status": "planned"
            },
            {
              "id": "seed_plus_2026",
              "date": "2026-Q2",
              "type": "seed_plus",
              "amount": 500000,
              "valuation": 3000000,
              "dilution": 16.7,
              "status": "planned"
            },
            {
              "id": "series_a_2028",
              "date": "2028-Q1",
              "type": "series_a",
              "amount": 2000000,
              "valuation": 10000000,
              "dilution": 20,
              "status": "planned"
            }
          ]
        },
        
        {
          "id": "launch",
          "name": "Lancio Commerciale",
          "startDate": "2029-01",
          "endDate": "2030-12",
          "revenueEnabled": true,
          "revenueStartDate": "2029-Q3",
          "description": "Prime vendite, scaling commerciale",
          "color": "#f59e0b",
          
          "milestones": [
            {
              "id": "first_sales",
              "date": "2029-Q3",
              "name": "Prime 5 vendite",
              "critical": false,
              "achieved": false
            },
            {
              "id": "break_even",
              "date": "2030-Q2",
              "name": "Break-even operativo",
              "critical": true,
              "achieved": false
            }
          ],
          
          "costStructure": {
            "personnel": [
              {
                "role": "Sales Manager",
                "count": 1,
                "monthlySalary": 4000,
                "startMonth": "2029-01"
              },
              {
                "role": "Sales Rep",
                "count": 2,
                "monthlySalary": 3000,
                "startMonth": "2029-06"
              },
              {
                "role": "Marketing Manager",
                "count": 1,
                "monthlySalary": 3500,
                "startMonth": "2029-01"
              }
            ],
            
            "marketing": [
              {
                "name": "Digital marketing",
                "monthlyBudget": 5000,
                "startMonth": "2029-01"
              },
              {
                "name": "Fiere mediche",
                "monthlyBudget": 3000,
                "startMonth": "2029-01"
              }
            ],
            
            "operations": [
              {
                "name": "Customer support",
                "monthlyAmount": 2000,
                "startMonth": "2029-06"
              }
            ]
          }
        },
        
        {
          "id": "scaling",
          "name": "Scaling",
          "startDate": "2031-01",
          "endDate": "2035-12",
          "revenueEnabled": true,
          "description": "Espansione internazionale",
          "color": "#10b981",
          
          "fundingRounds": [
            {
              "id": "series_b_2031",
              "date": "2031-Q2",
              "type": "series_b",
              "amount": 5000000,
              "valuation": 30000000,
              "status": "planned"
            }
          ]
        }
      ],
      
      "revenueConfiguration": {
        "enabled": true,
        "startDate": "2029-Q3",
        
        "rampUp": {
          "type": "gradual",
          "monthlyGrowthRate": 0.10,
          "firstQuarterUnits": 5,
          "firstQuarterRevenue": 200000
        },
        
        "hardware": {
          "enabled": true,
          "unitPrice": 40000,
          "cogs": 20000,
          "grossMargin": 0.5
        },
        
        "saas": {
          "enabled": true,
          "monthlyFeePerDevice": 500,
          "annualFeePerDevice": 5500,
          "activationRate": 0.8,
          "grossMargin": 0.85
        },
        
        "services": {
          "enabled": false
        },
        
        "consumables": {
          "enabled": false
        }
      },
      
      "assumptions": {
        "dso": 60,
        "dpo": 45,
        "inventoryTurnover": 6,
        "taxRate": 0.28,
        "depreciationRate": 0.20
      }
    },
    
    "calculations": {
      "lastCalculated": "2025-10-20T18:00:00Z",
      "monthly": [],
      "annual": [],
      "breakEven": {}
    },
    
    "intelligence": {
      "fundingRecommendations": [],
      "currentRunway": 0,
      "nextMilestone": "CE Mark",
      "riskFlags": []
    },
    
    "scenarios": [
      {
        "id": "base",
        "name": "Base Case",
        "type": "base",
        "assumptions": {
          "revenueStartDate": "2029-Q3",
          "revenueDelayMonths": 0,
          "revenueMultiplier": 1.0,
          "costMultiplier": 1.0,
          "growthRateMultiplier": 1.0
        }
      },
      {
        "id": "pessimistic",
        "name": "Scenario Pessimistico",
        "type": "pessimistic",
        "assumptions": {
          "revenueStartDate": "2030-Q1",
          "revenueDelayMonths": 6,
          "revenueMultiplier": 0.7,
          "costMultiplier": 1.1,
          "growthRateMultiplier": 0.8
        }
      },
      {
        "id": "optimistic",
        "name": "Scenario Ottimistico",
        "type": "optimistic",
        "assumptions": {
          "revenueStartDate": "2029-Q1",
          "revenueDelayMonths": -6,
          "revenueMultiplier": 1.3,
          "costMultiplier": 1.05,
          "growthRateMultiplier": 1.2
        }
      }
    ]
  }
}
```

## API Endpoints da implementare

```typescript
// GET /api/financial-plan
// Legge configurazione completa

// POST /api/financial-plan/calculate
// Ricalcola tutte le proiezioni

// PATCH /api/financial-plan/phases/:phaseId
// Modifica una fase

// PATCH /api/financial-plan/revenue-config
// Modifica configurazione ricavi

// POST /api/financial-plan/funding-rounds
// Aggiunge un funding round

// GET /api/financial-plan/recommendations
// Ottiene raccomandazioni funding

// POST /api/financial-plan/scenarios/:scenarioId/calculate
// Calcola uno scenario specifico
```

## Migrazio ne da Sistema Attuale

```typescript
// Script di migrazione
async function migrateToPhaseBasedPlan() {
  const oldData = await loadOldFinancialPlan();
  
  const newPlan = {
    financialPlan: {
      version: "2.0",
      configuration: {
        // Converte dati esistenti in formato phase-based
        phases: convertToPhases(oldData),
        revenueConfiguration: {
          enabled: true,
          startDate: "2029-Q3",  // ⭐ Default Eco 3D
          // ... resto config
        }
      }
    }
  };
  
  await saveNewFinancialPlan(newPlan);
  return newPlan;
}
```

## Note Implementazione

**PRIORITÀ ALTA:**
- ✅ Revenue start date configuration
- ✅ Phase-based cost structure
- ✅ Cash flow waterfall visualization
- ✅ Funding recommendations

**PRIORITÀ MEDIA:**
- Scenario comparison
- Sensitivity analysis
- Export for investors

**PRIORITÀ BASSA:**
- Advanced forecasting models
- Machine learning predictions
- Integration with accounting software

**TEMPO STIMATO:**
- Core functionality: 1 settimana
- Visualizations: 3 giorni
- Intelligence features: 3 giorni
- Testing & polish: 2 giorni
- **TOTALE: ~2.5 settimane**
