# 📊 PIANO IMPLEMENTAZIONE CONTO ECONOMICO (INCOME STATEMENT)

**Data Creazione:** 2025-10-11  
**Obiettivo:** Creare dashboard completa per Conto Economico previsionale

---

## 🎯 OBIETTIVI

Creare una sezione dedicata che visualizzi e permetta di modificare tutti gli elementi del Conto Economico secondo quanto descritto in `ContoEconomico.md`:

### Componenti Principali:
1. **Ricavi (Revenue)** - Vendita dispositivi + Abbonamenti SaaS
2. **COGS** - Costi variabili produzione
3. **Margine Lordo (Gross Margin)** - Ricavi - COGS  
4. **OPEX** - Costi operativi (Personale, R&D, Marketing, G&A)
5. **EBITDA** - Margine Lordo - OPEX
6. **Ammortamenti** - Quota annuale asset
7. **EBIT** - EBITDA - Ammortamenti
8. **Interessi e Tasse** - Oneri finanziari
9. **Utile Netto (Net Income)** - Risultato finale
10. **Break-Even Analysis** - Analisi punto pareggio

---

## 📊 STRUTTURA DATI DATABASE.JSON

### Sezione da Aggiungere: `contoEconomico`

```json
{
  "contoEconomico": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-11",
    "currency": "EUR",
    "note": "Dati per Conto Economico previsionale - integrati con budget e revenue model",
    
    "ricavi": {
      "note": "I ricavi vengono calcolati dal Revenue Model esistente",
      "source": "RevenueModelDashboard",
      "lineeBusinessDefault": [
        {
          "id": "dispositivi_hw",
          "nome": "Vendita Dispositivi Hardware",
          "tipo": "capex",
          "descrizione": "Vendita una tantum dispositivi ecografici",
          "active": true
        },
        {
          "id": "saas_subscription",
          "nome": "Abbonamenti Software SaaS",
          "tipo": "recurring",
          "descrizione": "Ricavi ricorrenti da abbonamenti mensili",
          "active": true
        },
        {
          "id": "servizi_post_vendita",
          "nome": "Servizi Post-Vendita",
          "tipo": "recurring",
          "descrizione": "Manutenzione, training, supporto",
          "active": false
        }
      ]
    },
    
    "cogs": {
      "note": "Costi diretti attribuibili ai ricavi",
      "hardwareCosts": {
        "costoUnitarioDispositivo": 11000,
        "note": "Costo produzione per dispositivo - da Costi_sviluppo.xlsx",
        "componenti": [
          {
            "nome": "Componenti elettronici",
            "percentuale": 45,
            "valore": 4950
          },
          {
            "nome": "Sonda ultrasonica",
            "percentuale": 30,
            "valore": 3300
          },
          {
            "nome": "Assemblaggio e test",
            "percentuale": 15,
            "valore": 1650
          },
          {
            "nome": "Packaging e logistica",
            "percentuale": 10,
            "valore": 1100
          }
        ],
        "curvaApprendimento": {
          "enabled": true,
          "percentualeRiduzionePerDoppio": 15,
          "note": "Riduzione costi con economie di scala"
        }
      },
      "saasCosts": {
        "costoPerUtente": {
          "cloudInfrastructure": 2,
          "storage": 1,
          "bandwidth": 0.5,
          "totale": 3.5,
          "note": "Costi mensili cloud per utente attivo"
        },
        "commissioniPiattaforma": {
          "percentuale": 3,
          "note": "Commissioni payment processor"
        }
      },
      "margineObiettivoPercentuale": {
        "hardware": 78,
        "saas": 95,
        "note": "Target gross margin % per linea di business"
      }
    },
    
    "opex": {
      "note": "I dati OPEX vengono presi dalla sezione budget esistente",
      "source": "budget.categories",
      "mapping": {
        "personale": "cat_4",
        "rd": "cat_1",
        "marketing": "cat_6",
        "ga": "cat_5",
        "regolatorio": "cat_2",
        "clinico": "cat_3"
      },
      "categorieAggiuntive": [
        {
          "id": "marketing_sales_extra",
          "nome": "Marketing & Sales (Aggiuntivo)",
          "note": "Costi marketing non nel budget sviluppo",
          "values": {
            "2025": 0,
            "2026": 50,
            "2027": 100,
            "2028": 150,
            "2029": 200
          }
        }
      ]
    },
    
    "ammortamenti": {
      "note": "Ammortamenti asset capitalizzati",
      "enabled": true,
      "assets": [
        {
          "id": "macchinari_produzione",
          "nome": "Macchinari e Attrezzature Produzione",
          "valoreDiAcquisto": 50,
          "dataAcquisto": "2026-Q1",
          "anniAmmortamento": 5,
          "metodologia": "lineare",
          "quotaAnnuale": 10
        },
        {
          "id": "software_sviluppo",
          "nome": "Software e Piattaforma",
          "valoreDiAcquisto": 30,
          "dataAcquisto": "2025-Q4",
          "anniAmmortamento": 3,
          "metodologia": "lineare",
          "quotaAnnuale": 10
        },
        {
          "id": "brevetti",
          "nome": "Brevetti e IP",
          "valoreDiAcquisto": 5,
          "dataAcquisto": "2025-Q1",
          "anniAmmortamento": 10,
          "metodologia": "lineare",
          "quotaAnnuale": 0.5
        }
      ],
      "totaleAnnualeCalcolato": {
        "2025": 0.5,
        "2026": 20.5,
        "2027": 20.5,
        "2028": 20.5,
        "2029": 10
      }
    },
    
    "interessiFinanziari": {
      "note": "Interessi su debiti e finanziamenti",
      "debiti": [
        {
          "id": "convertible_note_seed",
          "tipo": "Convertible Note",
          "capitale": 200,
          "tassoInteresse": 5,
          "dataEmissione": "2025-Q1",
          "scadenza": "2027-Q1",
          "interesseAnnuale": 10
        }
      ],
      "totaleAnnualeCalcolato": {
        "2025": 10,
        "2026": 10,
        "2027": 5,
        "2028": 0,
        "2029": 0
      }
    },
    
    "tasse": {
      "note": "Imposte sul reddito",
      "regime": "IRES + IRAP",
      "aliquotaEffettiva": 28,
      "perditeRiportabili": true,
      "note": "Tasse solo su utili positivi, perdite riportabili"
    },
    
    "breakEvenAnalysis": {
      "enabled": true,
      "metodologia": "units",
      "assumptions": {
        "prezzoMedioVendita": 50000,
        "costoVariabileUnitario": 11000,
        "costiFissiAnnuali": {
          "2025": 82,
          "2026": 452,
          "2027": 488,
          "2028": 783
        }
      },
      "formula": "Q_BEP = Costi_Fissi / (Prezzo_Unitario - Costo_Variabile_Unitario)",
      "note": "Calcolo unità vendute per raggiungere break-even"
    },
    
    "kpiMetriche": {
      "grossMarginPercentage": {
        "formula": "(Ricavi - COGS) / Ricavi * 100",
        "target": 75,
        "note": "Margine lordo percentuale"
      },
      "ebitdaMargin": {
        "formula": "EBITDA / Ricavi * 100",
        "target": 30,
        "note": "Margine EBITDA percentuale"
      },
      "netMargin": {
        "formula": "Utile_Netto / Ricavi * 100",
        "target": 20,
        "note": "Margine netto percentuale"
      },
      "breakEvenMonth": {
        "descrizione": "Mese in cui EBITDA diventa positivo",
        "target": "Q4 2026"
      }
    }
  }
}
```

---

## 🔄 INTEGRAZIONE CON DATI ESISTENTI

### 1. Ricavi → Da Revenue Model
**Fonte:** `RevenueModelDashboard.tsx` + `FinancialCalculator`

```typescript
// I ricavi vengono già calcolati dal FinancialCalculator
// Dobbiamo solo collegarli alla visualizzazione P&L
interface RicaviData {
  recurringRev: number;  // Da SaaS
  capexRev: number;      // Da vendita HW
  totalRev: number;      // Totale
}
```

### 2. OPEX → Da Budget esistente
**Fonte:** `database.json → budget.categories`

```typescript
// Mappare le categorie budget a voci OPEX
const opexMapping = {
  personale: "cat_4",           // Team e Risorse Umane
  rd: "cat_1",                  // R&D e Prototipo
  marketing: "cat_6",           // Marketing e GTM
  ga: "cat_5",                  // Overhead
  regolatorio: "cat_2",         // Certificazioni
  clinico: "cat_3"              // Studi clinici
};
```

### 3. COGS → Nuovi dati + calcoli
**Nuovo nel database**, calcolato dinamicamente:

```typescript
// COGS Hardware
const cogsHW = numDispositiviVenduti * costoUnitarioDispositivo;

// COGS SaaS
const cogsSaaS = numUtentiAttivi * costoPerUtente * 12;

// COGS Totali
const cogsTotali = cogsHW + cogsSaaS;
```

---

## 🎨 COMPONENTE REACT: IncomeStatementDashboard.tsx

### Struttura Proposta

```typescript
// IncomeStatementDashboard.tsx
interface IncomeStatementProps {
  startYear?: number;
  endYear?: number;
  editable?: boolean;
}

export function IncomeStatementDashboard({ 
  startYear = 2025, 
  endYear = 2029,
  editable = true 
}: IncomeStatementProps) {
  
  // Sezioni del componente:
  
  // 1. KPI Cards Summary
  //    - Ricavi Totali Anno X
  //    - EBITDA Anno X
  //    - Margine Lordo %
  //    - Break-Even Month
  
  // 2. Tabs Principali
  //    - Overview (tabella P&L completa)
  //    - Ricavi (dettaglio linee business)
  //    - COGS (dettaglio costi variabili)
  //    - OPEX (dettaglio costi operativi)
  //    - Break-Even (analisi pareggio)
  //    - Grafici (visualizzazioni)
  
  // 3. Tabella P&L Principale
  //    Colonne: Voce | 2025 | 2026 | 2027 | 2028 | 2029
  //    Rows:
  //    - RICAVI
  //      - Vendita Dispositivi
  //      - Abbonamenti SaaS
  //      - Totale Ricavi
  //    - COGS
  //      - Costo Dispositivi
  //      - Costo SaaS
  //      - Totale COGS
  //    - MARGINE LORDO (Gross Margin)
  //    - OPEX
  //      - Personale
  //      - R&D
  //      - Marketing & Sales
  //      - G&A
  //      - Totale OPEX
  //    - EBITDA
  //    - Ammortamenti
  //    - EBIT
  //    - Interessi
  //    - EBT (Earnings Before Tax)
  //    - Tasse
  //    - UTILE NETTO (Net Income)
  
  // 4. Grafici
  //    - Waterfall Chart (Ricavi → Utile Netto)
  //    - Evolution Chart (trend EBITDA, margini)
  //    - Composition Chart (breakdown OPEX)
  //    - Break-Even Chart
}
```

### Visualizzazioni Chiave

1. **Tabella P&L Completa** - Formato Excel-like, editabile
2. **Waterfall Chart** - Da Ricavi a Utile Netto
3. **Trend Chart** - Evoluzione EBITDA, Margini nel tempo
4. **Break-Even Analysis** - Grafico punto di pareggio
5. **Margini %** - Gross Margin, EBITDA Margin, Net Margin

---

## 🔌 INTEGRAZIONE CON MASTERDASHBOARD

### Aggiungere nuovo Tab

```typescript
// In MasterDashboard.tsx

import { IncomeStatementDashboard } from './IncomeStatementDashboard';

// Aggiungere nel TabsList:
<TabsTrigger value="income-statement">
  <FileText className="h-4 w-4 mr-2" />
  Conto Economico
</TabsTrigger>

// Aggiungere nel TabsContent:
<TabsContent value="income-statement">
  <IncomeStatementDashboard 
    startYear={2025}
    endYear={2029}
    editable={true}
  />
</TabsContent>
```

---

## 📝 FORMULE DA IMPLEMENTARE

### Formula 1: Margine Lordo
```
Margine Lordo (€) = Ricavi Totali - COGS
Margine Lordo (%) = (Margine Lordo / Ricavi Totali) × 100
```

### Formula 2: EBITDA
```
EBITDA = Margine Lordo - OPEX
EBITDA Margin (%) = (EBITDA / Ricavi Totali) × 100
```

### Formula 3: EBIT
```
EBIT = EBITDA - Ammortamenti
```

### Formula 4: Utile Netto
```
EBT = EBIT - Interessi
Tasse = MAX(0, EBT × Aliquota_Fiscale)
Utile Netto = EBT - Tasse
```

### Formula 5: Break-Even Point (Unità)
```
Q_BEP = Costi_Fissi / (Prezzo_Unitario - Costo_Variabile_Unitario)

Dove:
- Costi_Fissi = OPEX annuale
- Prezzo_Unitario = Prezzo medio dispositivo
- Costo_Variabile_Unitario = COGS per dispositivo
```

### Formula 6: Break-Even Point (Ricavi)
```
Ricavi_BEP = Costi_Fissi / (1 - (COGS / Ricavi))
```

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### FASE 1: Foundation (Priorità ALTA)
- [ ] Aggiungere sezione `contoEconomico` al database.json
- [ ] Creare struttura base IncomeStatementDashboard.tsx
- [ ] Collegare ricavi da FinancialCalculator
- [ ] Collegare OPEX da budget esistente

### FASE 2: Calcoli COGS (Priorità ALTA)
- [ ] Implementare calcolo COGS Hardware
- [ ] Implementare calcolo COGS SaaS
- [ ] Implementare economie di scala

### FASE 3: P&L Completo (Priorità MEDIA)
- [ ] Implementare ammortamenti
- [ ] Implementare interessi finanziari
- [ ] Implementare calcolo tasse
- [ ] Calcolo Utile Netto finale

### FASE 4: Visualizzazioni (Priorità MEDIA)
- [ ] Tabella P&L principale editabile
- [ ] Waterfall chart Ricavi → Utile
- [ ] Trend charts (EBITDA, margini)
- [ ] Break-even analysis grafico

### FASE 5: Editing & Persistenza (Priorità BASSA)
- [ ] Permettere modifica COGS unitario
- [ ] Permettere modifica aliquote fiscali
- [ ] Permettere modifica ammortamenti
- [ ] Salvataggio su database.json

---

## 🧪 TESTING & VALIDAZIONE

### Test Case 1: Calcolo Margine Lordo
```
Input:
- Ricavi: €1,000,000
- COGS: €250,000

Expected:
- Margine Lordo: €750,000
- Margine %: 75%
```

### Test Case 2: EBITDA
```
Input:
- Margine Lordo: €750,000
- OPEX: €500,000

Expected:
- EBITDA: €250,000
- EBITDA Margin: 25%
```

### Test Case 3: Break-Even
```
Input:
- Costi Fissi: €500,000
- Prezzo Unitario: €50,000
- Costo Variabile: €11,000

Expected:
- Q_BEP = 500,000 / (50,000 - 11,000) = 12.8 unità → 13 dispositivi
```

---

## 📚 RIFERIMENTI

- **ContoEconomico.md** - Guida teorica e best practices
- **ANALISI_COMPLETA_APP.md** - Struttura applicazione
- **STATO_SISTEMA_2025.md** - Architettura database centralizzato
- **Memories** - Formule chiave (CAC, LTV, EBITDA, Break-even)

---

## 🎯 PROSSIMI PASSI IMMEDIATI

1. ✅ **Documentare piano completo** (questo file)
2. ⏳ **Aggiungere sezione contoEconomico al database.json**
3. ⏳ **Creare IncomeStatementDashboard.tsx**
4. ⏳ **Implementare connessione dati esistenti**
5. ⏳ **Aggiungere tab in MasterDashboard**

---

**Ultimo aggiornamento:** 2025-10-11  
**Stato:** 📝 Piano Completo - Pronto per implementazione
