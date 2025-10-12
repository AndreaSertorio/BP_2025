# 📊 IMPLEMENTAZIONE SEZIONE STATO PATRIMONIALE (BALANCE SHEET)

**Data:** 11 Ottobre 2025  
**Status:** 🔨 IN SVILUPPO  
**Priorità:** ALTA - Componente mancante del piano finanziario

---

## 🎯 OBIETTIVO

Creare un nuovo tab principale **"Stato Patrimoniale"** che permetta di:
- ✅ Visualizzare tutte le voci del Balance Sheet (Attivo, Passivo, Patrimonio Netto)
- ✅ Modificare parametri chiave (DSO, DPO, giorni magazzino, funding rounds)
- ✅ Calcolare automaticamente il bilancio per 5 anni
- ✅ Integrare con dati esistenti (EBITDA, ricavi, costi dal Conto Economico)
- ✅ Salvare configurazione nel database centralizzato

---

## 📚 RIFERIMENTI

### Documento Guida
**File:** `/assets/StatoPatrimoniale.md`

### Componenti Chiave da StatoPatrimoniale.md

#### **ATTIVITÀ (Assets)**
1. **Cassa (Cash)**
   - Calcolata dal cash flow
   - Formula: `Cassa finale = Cassa iniziale + Flusso di cassa netto del periodo`
   - ⚠️ Non deve mai diventare negativa

2. **Crediti verso clienti (Accounts Receivable)**
   - Formula: `Crediti = Ricavi × (DSO / 365)`
   - DSO = Days Sales Outstanding (default 60 giorni B2B)
   - Esempio: 15% del fatturato annuo se DSO = 60gg

3. **Magazzino (Inventory)**
   - Rilevante per hardware startup
   - Formula: `Magazzino = COGS Hardware / Inventory Turnover`
   - Turnover default: 6x/anno

4. **Immobilizzazioni (Fixed Assets)**
   - Macchinari, attrezzature, software capitalizzato, brevetti
   - Valore netto = Costo - Ammortamenti accumulati
   - Formula: `Valore netto anno N = Costo - (Amm.to annuale × N)`

#### **PASSIVITÀ (Liabilities)**
1. **Debiti verso fornitori (Accounts Payable)**
   - Formula: `Debiti = Costi × (DPO / 365)`
   - DPO = Days Payable Outstanding (default 30-45 giorni)

2. **Debiti finanziari (Debt)**
   - Prestiti bancari, finanziamenti agevolati, convertibili
   - Si riduce con i rimborsi

3. **Altre passività**
   - Ricavi differiti (SaaS pre-pagato)
   - IVA da versare
   - Ratei e risconti

#### **PATRIMONIO NETTO (Equity)**
1. **Capitale Sociale**
   - Investimenti founder + funding rounds
   - Si aggiorna ad ogni round di finanziamento

2. **Utili (Perdite) a nuovo**
   - Accumulo degli utili netti
   - Formula: `PN anno N = Capitale + Σ Utili (o - Perdite)`

### **Formula di Equilibrio**
```
Attività Totali = Passività Totali + Patrimonio Netto
```

---

## 🔍 ANALISI DATI ESISTENTI

### ✅ CALCOLI GIÀ IMPLEMENTATI

**File:** `/src/lib/balanceSheet.ts`

```typescript
interface BalanceSheetItem {
  year: number;
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      totalCurrent: number;
    };
    fixed: {
      ppe: number;
      intangibles: number;
      accumulatedDepreciation: number;
      netFixed: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      totalCurrent: number;
    };
    longTerm: {
      longTermDebt: number;
      otherLiabilities: number;
      totalLongTerm: number;
    };
    totalLiabilities: number;
  };
  equity: {
    paidInCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  checkBalance: number; // Deve essere 0
}
```

**Calcoli già implementati:**
- ✅ DSO = 60 giorni (hardcoded)
- ✅ DPO = 45 giorni (hardcoded)
- ✅ Inventory Turnover = 6x/anno (hardcoded)
- ✅ CapEx = 5% revenue (hardcoded)
- ✅ Depreciation = 20%/anno (hardcoded)
- ✅ Funding rounds: Y1 €2M, Y3 €5M (hardcoded)

**File:** `/src/lib/cashflow.ts`
- ✅ Calcolo cash flow operativo
- ✅ Calcolo working capital changes
- ✅ Funding rounds logic

### ❌ COSA MANCA

1. **Parametri configurabili nel database**
   - DSO, DPO, giorni magazzino
   - Funding schedule personalizzato
   - CapEx % e depreciation rates

2. **UI per visualizzare e modificare**
   - Nessun componente dedicato allo Stato Patrimoniale
   - Dati calcolati ma non visualizzati

3. **Integrazione con database centralizzato**
   - Calcoli usano valori hardcoded
   - Non leggono da `database.json`

---

## 🏗️ ARCHITETTURA SOLUZIONE

### **1. ESTENSIONE DATABASE**

Aggiungere sezione `statoPatrimoniale` in `database.json`:

```json
{
  "statoPatrimoniale": {
    "workingCapital": {
      "dso": 60,
      "dsoNote": "Days Sales Outstanding - giorni medi incasso clienti B2B",
      "dpo": 45,
      "dpoNote": "Days Payable Outstanding - giorni medi pagamento fornitori",
      "inventoryTurnover": 6,
      "inventoryTurnoverNote": "Rotazione magazzino (volte/anno) - 6x significa ~2 mesi di stock"
    },
    "fixedAssets": {
      "capexAsPercentRevenue": 5,
      "capexNote": "CapEx come % ricavi - investimenti in attrezzature/infrastruttura",
      "depreciationRate": 20,
      "depreciationNote": "Tasso ammortamento annuale (%) - 20% = vita utile 5 anni",
      "initialPPE": 0.5,
      "intangibles": 0.3,
      "intangiblesNote": "Brevetti e proprietà intellettuale (M€)"
    },
    "funding": {
      "initialCash": 2.0,
      "rounds": [
        {
          "year": 1,
          "quarter": 1,
          "type": "Seed",
          "amount": 2.0,
          "valuation": 8.0,
          "note": "Round seed - validazione prodotto"
        },
        {
          "year": 2,
          "quarter": 1,
          "type": "Seed+",
          "amount": 3.0,
          "valuation": 15.0,
          "note": "Bridge round - prime vendite"
        },
        {
          "year": 3,
          "quarter": 1,
          "type": "Series A",
          "amount": 5.0,
          "valuation": 25.0,
          "note": "Series A - scaling"
        }
      ]
    },
    "debt": {
      "enabled": true,
      "loans": [
        {
          "id": "bank_loan_2026",
          "year": 2,
          "amount": 1.0,
          "interestRate": 4.5,
          "termYears": 5,
          "type": "Term Loan",
          "note": "Finanziamento bancario per attrezzature"
        }
      ]
    },
    "otherLiabilities": {
      "accruedExpensesAsPercentOpex": 10,
      "deferredRevenue": {
        "enabled": true,
        "description": "Abbonamenti SaaS pre-pagati - riconosciuti nel tempo",
        "monthsInAdvance": 12
      }
    },
    "metadata": {
      "createdBy": "Balance Sheet Implementation",
      "createdAt": "2025-10-11T18:00:00.000Z",
      "version": "1.0.0",
      "lastModified": "2025-10-11T18:00:00.000Z"
    }
  }
}
```

### **2. COMPONENTE UI**

Creare `/src/components/BalanceSheetView.tsx`:

**Struttura:**
```
┌─────────────────────────────────────────┐
│  📊 STATO PATRIMONIALE                  │
├─────────────────────────────────────────┤
│  Tabs:                                  │
│  • Overview                             │
│  • Parametri Working Capital            │
│  • Parametri Asset Fissi                │
│  • Funding & Debt                       │
│  • Visualizzazione Bilancio             │
└─────────────────────────────────────────┘
```

**Tab 1: Overview**
- Cards con metriche chiave per Anno 5:
  - Total Assets
  - Total Liabilities
  - Equity
  - Debt-to-Equity Ratio
- Grafico evoluzione Equity vs Debt

**Tab 2: Parametri Working Capital**
```
┌──────────────────────────────────────┐
│ DSO (Days Sales Outstanding)         │
│ [60] giorni  ──────────O───  90     │
│ Impact: AR = €X.XM                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ DPO (Days Payable Outstanding)       │
│ [45] giorni  ──────────O───  60     │
│ Impact: AP = €X.XM                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Inventory Turnover                   │
│ [6]x/anno    ──────────O───  12     │
│ Impact: Inventory = €X.XM            │
└──────────────────────────────────────┘
```

**Tab 3: Parametri Fixed Assets**
- CapEx as % Revenue
- Depreciation Rate
- Initial PP&E
- Intangibles value

**Tab 4: Funding & Debt**
- Timeline funding rounds (editable)
- Debt schedule
- Equity dilution calculator

**Tab 5: Bilancio Dettagliato**
- Tabella Anno 1-5 con tutte le voci
- Sezioni collassabili:
  - Attività Correnti
  - Attività Fisse
  - Passività Correnti
  - Passività a Lungo Termine
  - Patrimonio Netto
- Highlight se bilancio non quadra

### **3. SERVICE LAYER**

Creare `/src/lib/balance-sheet-service.ts`:

```typescript
import { getDatabase, updateDatabase } from './database-service';

export async function getBalanceSheetConfig() {
  const db = await getDatabase();
  return db.statoPatrimoniale;
}

export async function updateWorkingCapitalParams(params: {
  dso?: number;
  dpo?: number;
  inventoryTurnover?: number;
}) {
  return updateDatabase('statoPatrimoniale.workingCapital', params);
}

export async function updateFundingRound(roundIndex: number, round: any) {
  const db = await getDatabase();
  const rounds = [...db.statoPatrimoniale.funding.rounds];
  rounds[roundIndex] = round;
  return updateDatabase('statoPatrimoniale.funding.rounds', rounds);
}
```

### **4. INTEGRAZIONE CALCOLI**

Modificare `/src/lib/balanceSheet.ts`:

```typescript
export class FinancialStatementsCalculator {
  private scenario: Scenario;
  private annualData: AnnualMetrics[];
  private config: BalanceSheetConfig; // ← NUOVO: da database
  
  constructor(
    scenario: Scenario, 
    annualData: AnnualMetrics[],
    config?: BalanceSheetConfig // ← Parametri dal database
  ) {
    this.scenario = scenario;
    this.annualData = annualData;
    this.config = config || defaultBalanceSheetConfig;
  }
  
  calculateBalanceSheet(): BalanceSheetItem[] {
    // Usa this.config invece di valori hardcoded
    const dso = this.config.workingCapital.dso;
    const dpo = this.config.workingCapital.dpo;
    const inventoryTurnover = this.config.workingCapital.inventoryTurnover;
    // ... resto del codice
  }
}
```

---

## 📋 TASK LIST IMPLEMENTAZIONE

### **FASE 1: Database** ✅
- [ ] Estendere `database.json` con sezione `statoPatrimoniale`
- [ ] Validare struttura JSON
- [ ] Creare valori di default
- [ ] Testare lettura/scrittura con Database Inspector

### **FASE 2: Service Layer** 
- [ ] Creare `balance-sheet-service.ts`
- [ ] Implementare CRUD per parametri
- [ ] Aggiungere validazione input
- [ ] Testare persistenza

### **FASE 3: Componente UI**
- [ ] Creare `BalanceSheetView.tsx` con struttura tab
- [ ] Tab 1: Overview con cards e chart
- [ ] Tab 2: Working Capital controls
- [ ] Tab 3: Fixed Assets controls
- [ ] Tab 4: Funding & Debt editor
- [ ] Tab 5: Tabella bilancio dettagliato
- [ ] Stile coerente con resto app

### **FASE 4: Integrazione**
- [ ] Modificare `balanceSheet.ts` per usare config da database
- [ ] Collegare `BalanceSheetView` al service layer
- [ ] Aggiungere tab in `MasterDashboard.tsx`
- [ ] Implementare auto-save con debounce
- [ ] Aggiungere beforeunload handler

### **FASE 5: Validazione**
- [ ] Test calcoli con parametri custom
- [ ] Verificare equilibrio bilancio (Assets = Liabilities + Equity)
- [ ] Test integrazione con Conto Economico
- [ ] Test integrazione con Cash Flow
- [ ] Validare formule contro doc StatoPatrimoniale.md

### **FASE 6: Business Plan Integration**
- [ ] Aggiungere sezione Balance Sheet in BusinessPlanView
- [ ] Visualizzare metriche chiave (D/E ratio, Working Capital)
- [ ] Export PDF balance sheet

---

## 🔗 INTERCONNESSIONI CON ALTRI COMPONENTI

### Da Conto Economico → Stato Patrimoniale
- **EBITDA** → Operating Cash Flow
- **Ricavi** → Accounts Receivable (DSO)
- **COGS** → Inventory & Accounts Payable
- **OPEX** → Accrued Expenses
- **Utile Netto** → Retained Earnings

### Da Stato Patrimoniale → Cash Flow
- **Cash** → Beginning/Ending Cash
- **Working Capital Changes** → Operating CF
- **CapEx** → Investing CF
- **Funding Rounds** → Financing CF

### Da Revenue Model → Stato Patrimoniale
- **Ricavi SaaS pre-pagati** → Deferred Revenue
- **Dispositivi venduti (CapEx)** → Fixed Assets se demo units

---

## 📊 FORMULE CHIAVE DA IMPLEMENTARE

### Working Capital
```
Net Working Capital = (Cash + AR + Inventory) - (AP + Accrued Expenses)

Cash Conversion Cycle = DSO + DIO - DPO
dove DIO = Days Inventory Outstanding = 365 / Inventory Turnover
```

### Key Ratios
```
Current Ratio = Current Assets / Current Liabilities
(target: > 1.5)

Quick Ratio = (Current Assets - Inventory) / Current Liabilities
(target: > 1.0)

Debt-to-Equity = Total Debt / Total Equity
(target: < 0.5 per startup early stage)

Return on Assets (ROA) = Net Income / Total Assets
Return on Equity (ROE) = Net Income / Total Equity
```

---

## 🎨 UI/UX BEST PRACTICES

1. **Visual Hierarchy**
   - Assets a sinistra (verde/blu)
   - Liabilities al centro (arancione)
   - Equity a destra (viola)

2. **Real-time Updates**
   - Modifiche parametri → ricalcolo istantaneo
   - Highlight voci che cambiano
   - Mostra impatto su altre metriche

3. **Validation**
   - Alert se bilancio non quadra
   - Warning se cash diventa negativo
   - Info tooltip su ogni parametro

4. **Responsiveness**
   - Mobile: tabelle scrollabili
   - Desktop: vista affiancata
   - Tablet: layout intermedio

---

## ✅ ACCEPTANCE CRITERIA

La sezione è completa quando:
- [ ] Tutti i parametri sono configurabili via UI
- [ ] Modifiche si salvano nel database.json
- [ ] Bilancio quadra sempre (checkBalance = 0)
- [ ] Integrazione con Conto Economico funziona
- [ ] Funding rounds personalizzabili
- [ ] Export Excel/PDF disponibile
- [ ] Documentazione MD aggiornata
- [ ] Nessun errore TypeScript
- [ ] Test su dati reali Eco 3D

---

## 📝 NOTE IMPLEMENTATIVE

### Priorità Parametri
**ALTA:**
- DSO, DPO (impatto cash flow)
- Funding rounds (capitale disponibile)
- CapEx % (investimenti)

**MEDIA:**
- Inventory turnover
- Depreciation rate

**BASSA:**
- Accrued expenses %
- Deferred revenue (se SaaS non prepagato)

### Performance
- Memoizzare calcoli bilancio (useMemo)
- Debounce input a 500ms
- Lazy load chart pesanti

### Accessibilità
- Tutti i numeri formattati (€, %, M/K)
- Tooltips esplicativi
- Colori contrastati per dyslexia

---

**PROSSIMO STEP:** Iniziare con FASE 1 - Estensione Database
