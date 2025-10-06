# 📊 MERCATO ECOGRAFI - MASTER MAPPING

> **Single Source of Truth** per tutti i dati di mercato  
> **Versione**: 1.0.0 | **Data**: 2025-01-05

---

## 🎯 OBIETTIVO

Questo documento è il **MASTER REFERENCE** per:
1. 📚 Trovare qualsiasi dato di mercato
2. 🗺️ Capire come sono strutturati i dati
3. 🔧 Integrare il mercato nel piano finanziario
4. 💾 Gestire scenari salvabili/caricabili

---

## 📁 ARCHITETTURA FILE

```
src/
├── types/mercato.types.ts       ← TYPE DEFINITIONS (SSoT)
├── contexts/MercatoContext.tsx  ← STATE MANAGEMENT
├── components/MercatoEcografi.tsx
└── lib/mercato-utils.ts

public/assets/
├── ECO_DatiMercato.xlsx
└── ECO_Proiezioni_Ecografi_2025_2030.xlsx
```

---

## 🗄️ SORGENTI DATI EXCEL

### 1. ECO_DatiMercato.xlsx
- **Sheet "DatiMercato"**: Proiezioni Italia 2024-2030 (4 provider)
- **Sheet "Quote Tipologie"**: Evoluzione quote carrellati/portatili/palmari
- **Celle chiave**: C5 (339 M$ Italia 2030), E6-E10 (quote globali)

### 2. ECO_Proiezioni_Ecografi_2025_2030.xlsx
- **Sheet "Parco_IT_2025-2035"**: 3 scenari dispositivi (basso/centrale/alto)
- **Sheet "Numero Ecografi"**: Unità vendute per regione
- **Sheet "Valore Mercato"**: Valori M$ e CAGR per regione

---

## 📊 STRUTTURE DATI PRINCIPALI

### TipologiaEcografo
```typescript
{
  tipologia: 'Palmari',  // Nome
  icon: '📱',            // Emoji UI
  quotaIT: 0.0588,       // 5.88% quota Italia 2030
  valoreIT: 19.93,       // M$ Italia 2030
  quotaGlobale: 0.03,    // 3% quota globale
  valoreGlobale: 300,    // 300 M$ globale
  cagrGlobale: '0.055',  // 5.5% CAGR
  visible: true,
  target: true           // Flag target Eco 3D
}
```

### NumeroEcografiRegione ⚠️ IMPORTANTE
```
Regione          2025     2030    Crescita
────────────────────────────────────────────
Italia 🇮🇹        5,600    6,900   +23.2%
Europa 🇪🇺       37,000   49,000   +32.4%
Stati Uniti 🇺🇸  31,000   40,000   +29.0%
Cina 🇨🇳         26,000   33,000   +26.9%
────────────────────────────────────────────
Mondo 🌍        125,000  155,000   +24.0%  ⚠️ TOTALE, NON SOMMARE
```

**⚠️ REGOLA CRITICA**: "Mondo (globale)" è un TOTALE mondiale.  
NON deve MAI essere incluso nelle somme. Serve SOLO come riferimento.

### ValoreMercatoRegione
```
Regione          2025 M$  2030 M$  CAGR
────────────────────────────────────────
Italia 🇮🇹        278.6    343.7   4.3%
Europa 🇪🇺      2,810.0  3,637.0   5.3%
Stati Uniti 🇺🇸 3,110.0  4,060.0   5.5%
Cina 🇨🇳          776.2    998.4   5.2%
────────────────────────────────────────
Mondo 🌍        9,120.0 10,980.0   3.8%  ⚠️ TOTALE
```

---

## ⚙️ CONFIGURAZIONE MODIFICABILE

```typescript
ConfigurazioneMercato {
  annoTarget: number;              // 2025-2035, default: 2030
  tipologieTarget: Set<string>;    // default: Set(['Palmari'])
  regioniVisibili: Set<string>;    // default: Set(['Italia', 'Europa', 'Stati Uniti', 'Cina'])
  marketShareTarget: number;       // 0-100%, default: 1.0%
  scenarioParcoIT: 'basso' | 'centrale' | 'alto';  // default: 'centrale'
  ui: { /* flags visibilità grafici */ }
}
```

---

## 🧮 CALCOLI DERIVATI

### Formula Target Unità
```typescript
// 1. Filtra regioni (ESCLUDI Mondo)
regioniSelezionate = numeroEcografi.filter(
  r => regioniVisibili.has(r.mercato) && r.mercato !== 'Mondo (globale)'
);

// 2. Anno dati (2025 o 2030)
annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;

// 3. Somma unità
unitaTotali = regioniSelezionate.reduce((sum, r) => 
  sum + (annoData === 2025 ? r.unita2025 : r.unita2030), 0
);

// 4. Applica market share
unitaTargetEco3D = Math.round(unitaTotali × marketShareTarget / 100);
```

### Esempi Calcolo
```
Scenario: Italia + Europa, 1% market share, 2030
→ (6,900 + 49,000) × 1% = 559 unità

Scenario: Tutte 4 regioni, 1.5% market share, 2030
→ (6,900 + 49,000 + 40,000 + 33,000) × 1.5% = 1,934 unità
```

---

## 💾 SISTEMA SCENARI (come videogioco)

### ScenarioMercato
```typescript
{
  id: 'scenario_123...',
  nome: 'Conservativo Italia 2030',
  descrizione: 'Penetrazione conservativa solo Italia',
  dataCreazione: Date,
  configurazione: { /* ConfigurazioneMercato completa */ },
  tags: ['Italia', 'Conservativo']
}
```

### Azioni Disponibili
- `salvaScenario(nome, descrizione, tags)` → salva configurazione corrente
- `caricaScenario(id)` → ripristina configurazione salvata
- `eliminaScenario(id)` → cancella scenario
- `duplicaScenario(id, nuovoNome)` → crea copia
- `esportaScenario(id)` → JSON string per file
- `importaScenario(jsonString)` → carica da file

### Persistenza
- **localStorage**: salvataggio automatico ogni 1s
- **Export/Import JSON**: download/upload file manuale

---

## 🔗 UTILIZZO NEL CODICE

### Setup Provider
```tsx
// app/layout.tsx
import { MercatoProvider } from '@/contexts/MercatoContext';

export default function RootLayout({ children }) {
  return (
    <MercatoProvider>
      {children}
    </MercatoProvider>
  );
}
```

### Uso Base
```tsx
import { useMercato } from '@/contexts/MercatoContext';

function Component() {
  const { stato, calcolati, azioni } = useMercato();
  
  // Leggi
  const anno = stato.configurazione.annoTarget;
  const target = calcolati.unitaTargetEco3D;
  
  // Modifica
  azioni.impostaAnnoTarget(2028);
  azioni.impostaMarketShare(2.0);
  
  // Scenari
  const id = azioni.salvaScenario('Mio Scenario');
  azioni.caricaScenario(id);
}
```

### Ottimizzazioni
```tsx
// Solo azioni (no re-render su stato)
const azioni = useMercatoAzioni();

// Solo calcolati
const calcolati = useMercatoCalcolati();

// Solo scenari
const { scenari, salvaScenario } = useMercatoScenari();
```

---

## 🚀 ROADMAP INTEGRAZIONE

### ✅ Fase 1: Sistema Base Mercato (COMPLETATA)
- Type definitions complete
- Context con gestione stato
- Persistenza + scenari
- Undo/Redo

### 🔄 Fase 2: IN CORSO - Collegamento UI
- [ ] Convertire MercatoEcografi.tsx per usare Context
- [ ] Rimuovere stati locali duplicati
- [ ] Testare persistenza

### 📈 Fase 3: Piano Finanziario
- [ ] Creare FinanziarioContext simile
- [ ] Importare dati da MercatoContext
- [ ] Calcoli ricavi/costi basati su target
- [ ] Modello SaaS (MRR, churn, CAC/LTV)

### 💰 Fase 4: Metriche Avanzate
- [ ] Break-even analysis
- [ ] Cash flow projections
- [ ] NPV/IRR
- [ ] Sensitivity analysis
- [ ] Monte Carlo

---

## ⚠️ REGOLE CRITICHE

### 🔴 #1: Mondo NON si somma
```typescript
// ❌ SBAGLIATO
const totale = numeroEcografi.reduce((sum, r) => sum + r.unita2025, 0);

// ✅ CORRETTO
const totale = numeroEcografi
  .filter(r => r.mercato !== 'Mondo (globale)')
  .reduce((sum, r) => sum + r.unita2025, 0);
```

### 🟡 #2: Anno determina dataset
```typescript
const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
const valore = valoreMercato[`valore${annoData}`];
```

### 🟢 #3: Persistenza automatica
Ogni modifica viene salvata automaticamente in localStorage dopo 1 secondo.

### 🔵 #4: Immutabilità
Non modificare mai direttamente `stato`. Usa sempre `azioni.*`.

---

## 📚 SCENARI PREDEFINITI SUGGERITI

### Conservativo Italia 2030
```typescript
{
  annoTarget: 2030,
  regioniVisibili: Set(['Italia']),
  marketShareTarget: 0.5,
  scenarioParcoIT: 'basso'
}
// → ~35 unità
```

### Espansione Europa 2028
```typescript
{
  annoTarget: 2028,
  regioniVisibili: Set(['Italia', 'Europa']),
  marketShareTarget: 0.8,
  scenarioParcoIT: 'centrale'
}
// → ~360 unità
```

### Aggressivo Globale 2030
```typescript
{
  annoTarget: 2030,
  regioniVisibili: Set(['Italia', 'Europa', 'Stati Uniti', 'Cina']),
  marketShareTarget: 1.5,
  scenarioParcoIT: 'alto'
}
// → ~1,934 unità
```

---

## 📞 RIFERIMENTI RAPIDI

### Trova un Dato
- **Mercato Italia 2030**: `valoreMercato.find(v => v.mercato === 'Italia').valore2030`
- **Unità target**: `calcolati.unitaTargetEco3D`
- **Parco IT**: `calcolati.parcoDispositiviTarget`
- **CAGR medio**: `calcolati.totaliRegioniSelezionate.cagrMedio`

### Modifica Configurazione
- **Anno**: `azioni.impostaAnnoTarget(2028)`
- **Market Share**: `azioni.impostaMarketShare(2.5)`
- **Regioni**: `azioni.impostaRegioniVisibili(new Set(['Italia', 'Europa']))`
- **Scenario Parco**: `azioni.impostaScenarioParco('alto')`

### Gestione Scenari
- **Salva**: `azioni.salvaScenario('Nome', 'Descrizione', ['tag'])`
- **Carica**: `azioni.caricaScenario(id)`
- **Lista**: `azioni.listaScenari()`
- **Esporta**: `azioni.esportaScenario(id)` → JSON string
- **Importa**: `azioni.importaScenario(jsonString)`

---

**Ultima Modifica**: 2025-01-05  
**Prossimo Update**: Dopo integrazione Context in UI
