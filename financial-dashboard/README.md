# Eco 3D - Piano Finanziario Interattivo

Dashboard interattiva per la visualizzazione e modifica degli scenari finanziari di Eco 3D, sviluppata con Next.js, TypeScript e Tailwind CSS.

## 🚀 Funzionalità Principali

### Master Dashboard
- **KPI Cards**: Visualizzazione in tempo reale di metriche chiave (ARR, EBITDA, Break-even)
- **Controlli Parametri**: Slider interattivi per modificare variabili del modello
- **Grafici Dinamici**: Visualizzazione di ricavi, EBITDA e ARR con aggiornamento automatico
- **Gestione Scenari**: Supporto per scenari Prudente, Base, Ambizioso e Custom

### Funnel & GTM
- **Funnel di Conversione**: Visualizzazione del percorso Lead → Demo → Pilot → Deal
- **Tabelle Mensili**: Dati dettagliati per 60 mesi con export CSV
- **Grafici Temporali**: Evoluzione di leads, deals, dispositivi e account attivi
- **Riepilogo Trimestrale**: Aggregazioni per trimestre

### Financials (Three-Statement)
- **Conto Economico**: P&L dettagliato con margini e EBITDA
- **Cash Flow**: Analisi del flusso di cassa e Free Cash Flow
- **Stato Patrimoniale**: Composizione degli asset (semplificato)
- **Export Dati**: Possibilità di esportare tutti i dati in CSV

### Analisi di Sensitività
- **Tornado Analysis**: Identificazione dei parametri con maggiore impatto su EBITDA
- **Two-Way Heatmap**: Analisi combinata ARPA vs Lead Multiplier
- **Sensitività Parametro Singolo**: Analisi dettagliata dell'impatto di singole variabili
- **Visualizzazioni Interattive**: Grafici e tabelle per comprendere l'impatto delle variazioni

## 🛠️ Tecnologie Utilizzate

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipizzazione statica per maggiore affidabilità
- **Tailwind CSS**: Styling utility-first
- **Radix UI**: Componenti accessibili e personalizzabili
- **Recharts**: Libreria per grafici reattivi
- **Lucide React**: Icone moderne e leggere

## 📊 Modello Finanziario

Il modello implementa le formule specificate nel business plan:

### Parametri Chiave
- **Lead Multiplier**: Fattore moltiplicativo sui leads di base
- **Conversioni Funnel**: L2D, D2P, P2Deal percentuali
- **ARPA**: Annual Revenue Per Account
- **Margini**: Gross Margin ricorrente e CapEx share
- **Churn**: Tasso di abbandono annuale
- **OPEX/COGS**: Costi operativi e del venduto per anno

### Calcoli Mensili (60 mesi)
```typescript
// Leads per mese
Leads_m = BaseSeries[q(m)] / 3 * leadMult (per q≤8)
Leads_m = BaseSeries[8] * (1+growthQoQPostQ8)^(q-8) / 3 * leadMult (per q>8)

// Deals e Account Attivi
Deals_m = Leads_m * (l2d * d2p * p2deal)
Accounts_m = Accounts_(m-1) * (1 - churnMonthly) + Deals_m

// Ricavi
RecurringRev_m = Accounts_m * (arpa/12) / 1e6
CapExRev_m = Devices_m * capexShare * devicePrice / 1e6
```

## 🚀 Installazione e Avvio

```bash
# Installazione dipendenze
npm install

# Avvio in modalità sviluppo
npm run dev

# Build per produzione
npm run build

# Avvio produzione
npm start
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 📱 Utilizzo

### 1. Selezione Scenario
- Utilizzare i tab in alto per scegliere tra Prudente, Base, Ambizioso
- Creare scenari Custom duplicando uno esistente
- Importare/esportare scenari tramite file JSON

### 2. Modifica Parametri
- Utilizzare i controlli nel pannello destro per modificare i parametri
- Ogni parametro ha tooltip esplicativi e limiti predefiniti
- Reset individuale o completo dello scenario

### 3. Navigazione Sezioni
- **Master Dashboard**: Vista d'insieme con KPI e grafici principali
- **Funnel & GTM**: Analisi del percorso commerciale
- **Financials**: Prospetti contabili completi
- **Sensitivity**: Analisi di sensitività e stress test

### 4. Export Dati
- Export JSON per scenari completi
- Export CSV per tabelle specifiche
- Grafici esportabili come PNG (funzionalità futura)

## 🔧 Personalizzazione

### Aggiunta Nuovi Parametri
1. Aggiornare il tipo `Drivers` in `src/types/financial.ts`
2. Aggiungere limiti in `src/data/scenarios.ts`
3. Implementare la logica di calcolo in `src/lib/calculations.ts`
4. Aggiungere il controllo UI nel dashboard

### Nuovi Scenari Predefiniti
Modificare `defaultScenarios` in `src/data/scenarios.ts` con i nuovi valori.

### Personalizzazione Grafici
I grafici utilizzano Recharts e possono essere personalizzati modificando i componenti in `src/components/ChartCard.tsx`.

## 📈 Validazione Modello

Il modello è stato validato contro i seguenti check numerici dal file Excel:
- EBITDA Y5 scenario Base: ~2.8 M€
- ARR Y5 coerente con account attivi e ARPA
- Margini lordi in linea con le aspettative del settore

## 🤝 Contributi

Per contribuire al progetto:
1. Fork del repository
2. Creazione di un branch per la feature
3. Implementazione e test
4. Pull request con descrizione dettagliata

## 📄 Licenza

Questo progetto è proprietario di Eco 3D. Tutti i diritti riservati.

## 🆘 Supporto

Per supporto tecnico o domande sul modello finanziario, contattare il team di sviluppo.

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: Settembre 2025  
**Compatibilità**: Modern browsers, Node.js 18+
