# 📈 Grafici Interattivi - Mercato Ecografie Italia

## ✨ Panoramica

Dashboard completa di visualizzazione dati con 5 grafici interattivi, 3 insight cards e tabella collassabile.

## 🎯 Caratteristiche Principali

### **1. Tabella Collassabile**
- ✅ **Pulsante Comprimi/Espandi** - Mostra solo prime 5 prestazioni quando compressa
- ✅ **Avviso visivo** - Banner blu che indica quante prestazioni sono nascoste
- ✅ **Icone intuitive** - ChevronUp/ChevronDown per chiarezza

### **2. Grafici Reattivi alla Visibilità** ⭐
- ✅ **Si aggiornano in tempo reale** - Nascondere una prestazione la rimuove dai grafici
- ✅ **Badge contatore** - Mostra X/15 prestazioni attive
- ✅ **Aggiornamento automatico** - Si rigenerano quando modifichi le percentuali Extra-SSN
- ✅ **Tooltip interattivi** - Hover per dettagli completi

### **3. Design Responsivo**
- ✅ **Grid 2 colonne** su desktop
- ✅ **Stack verticale** su mobile
- ✅ **Grafico a tutta larghezza** per panoramica completa

## 📊 Grafici Implementati

### **Grafico 1: Top 10 Prestazioni per Volume Totale**
- **Tipo**: BarChart (Raggruppato)
- **Dati**: SSN + Extra-SSN affiancati
- **Ordinamento**: Decrescente per volume totale
- **Colori**: Blu (SSN), Verde (Extra-SSN)

**Insight**: Identifica le prestazioni più richieste nel mercato italiano

```typescript
const visiblePrestazioni = prestazioni.filter(p => p.visible);

chartData.top10 = visiblePrestazioni
  .sort((a, b) => b.totaleAnnuo - a.totaleAnnuo)
  .slice(0, 10)
  .map(p => ({
    nome: p.nome,
    ssn: p.colE,
    extraSSN: p.extraSSN
  }))
```

### **Grafico 2: Distribuzione SSN vs Extra-SSN**
- **Tipo**: PieChart
- **Dati**: Somma totale SSN vs somma totale Extra-SSN
- **Percentuali**: Calcolate automaticamente
- **Labels**: Nome + Percentuale sul grafico
- **Cards sottostanti**: Valori assoluti SSN e Extra-SSN

**Insight**: Mostra il peso relativo del mercato pubblico vs privato

```typescript
pieData = [
  { name: 'SSN', value: totaleSSN, percentage: 'XX.X%' },
  { name: 'Extra-SSN', value: totaleExtra, percentage: 'XX.X%' }
]
```

### **Grafico 3: Distribuzione per Priorità (U/B/D/P)**
- **Tipo**: BarChart Orizzontale
- **Dati**: Somma di U, B, D, P per tutte le prestazioni
- **Colori**: Palette diversificata per categoria
- **Layout**: Orizzontale per migliore leggibilità

**Insight**: Comprende la distribuzione temporale delle prestazioni

```typescript
priorityData = [
  { name: 'Urgente', value: Σ(U) },
  { name: 'Breve', value: Σ(B) },
  { name: 'Differibile', value: Σ(D) },
  { name: 'Programmabile', value: Σ(P) }
]
```

### **Grafico 4: Top 10 per % Extra-SSN**
- **Tipo**: BarChart
- **Dati**: Percentuale mercato privato per prestazione
- **Ordinamento**: Decrescente per percentuale
- **Colore**: Arancione
- **Formatter**: Mostra valori come percentuale con 1 decimale

**Insight**: Identifica quali prestazioni hanno maggior penetrazione nel privato

```typescript
percentageData = prestazioni
  .map(p => ({
    nome: p.nome,
    percentuale: p.percentualeExtraSSN
  }))
  .sort((a, b) => b.percentuale - a.percentuale)
  .slice(0, 10)
```

### **Grafico 5: Composizione Completa per Priorità**
- **Tipo**: BarChart Stacked (Impilato)
- **Dati**: TUTTE le 15 prestazioni con U/B/D/P impilati
- **Altezza**: 500px per migliore visualizzazione
- **Colori**: Rosso (U), Arancione (B), Verde (D), Blu (P)
- **Legenda**: Mostra categorie con colori

**Insight**: Panoramica completa della composizione di ogni prestazione

```typescript
stackedData = prestazioni.map(p => ({
  nome: p.nome,
  U: p.U,
  B: p.B,
  D: p.D,
  P: p.P
}))
```

## 🎨 Colori Utilizzati

```typescript
const COLORS = {
  primary: '#3b82f6',    // Blu - SSN
  secondary: '#10b981',  // Verde - Extra-SSN
  accent: '#8b5cf6',     // Viola - Generico
  warning: '#f59e0b',    // Arancione - % Extra
  danger: '#ef4444',     // Rosso - Urgente
  palette: [...]         // Array 15 colori per grafici multi-categoria
};
```

## 💡 Insight Cards

### **Card 1: Prestazione Più Richiesta**
- **Colore**: Gradient Viola
- **Dati**: Prima prestazione per volume totale
- **Mostra**: Nome + Volume annuo

### **Card 2: Maggior % Extra-SSN**
- **Colore**: Gradient Arancione
- **Dati**: Prima prestazione per percentuale privato
- **Mostra**: Nome + Percentuale

### **Card 3: Mercato Totale**
- **Colore**: Gradient Ciano
- **Dati**: Somma di tutte le prestazioni
- **Mostra**: Volume totale annuo

## 🔄 Aggiornamento Dinamico

### **Quando si Aggiornano i Grafici**

1. **Modifica % Extra-SSN in tabella** → Grafici si rigenerano automaticamente
2. **Ricarica dati Excel** → Tutti i grafici vengono ricalcolati
3. **Nascondi/Mostra prestazioni** → I grafici SI AGGIORNANO in tempo reale ⭐
   - Nascondere una prestazione la rimuove da TUTTI i grafici
   - I totali vengono ricalcolati escludendo le prestazioni nascoste
   - Badge mostra "X / 15 prestazioni attive"

### **useMemo per Performance**

```typescript
const chartData = useMemo(() => {
  // Calcola solo quando prestazioni cambiano
  // Non ricalcola ad ogni render
  return {
    top10,
    pieData,
    priorityData,
    stackedData,
    percentageData
  };
}, [prestazioni]);
```

## 📱 Responsive Design

### **Desktop (≥1024px)**
- Grid 2 colonne per grafici principali
- Grafico stack a tutta larghezza
- 3 insight cards affiancate

### **Tablet (768-1023px)**
- Grid 2 colonne compatta
- Font ridotti per labels
- Insight cards 3 colonne

### **Mobile (<768px)**
- Stack verticale (1 colonna)
- Altezza grafici ridotta a 300px
- Insight cards stack verticale

## 🎯 Tooltip Personalizzati

Tutti i grafici hanno tooltip ricchi di informazioni:

```typescript
<Tooltip 
  contentStyle={{ 
    backgroundColor: '#fff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '8px' 
  }}
  formatter={(value: number) => formatNumber(value)}
  labelFormatter={(label) => {
    // Mostra nome completo invece di nome troncato
    const item = chartData.top10.find(d => d.nome === label);
    return item?.nomeCompleto || label;
  }}
/>
```

## 🚀 Funzionalità Avanzate

### **1. Troncamento Nomi Intelligente**
- Nomi >20 caratteri troncati a 20 + "..."
- Tooltip mostra sempre nome completo
- Previene overflow labels

### **2. Formatter Numerico Italiano**
```typescript
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: 0
  }).format(num);
};
```

### **3. Calcolo Percentuali Dinamico**
```typescript
percentage: ((value / total) * 100).toFixed(1)
```

## 📐 Layout Completo

```
┌─────────────────────────────────────────────┐
│  Header + Pulsanti                          │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Card SSN │ Card     │ Card     │
│          │ Extra    │ Totale   │
└──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────┐
│  Tabella Prestazioni                        │
│  [Comprimi/Espandi] [Codice] [U-B-D-P]     │
│  ───────────────────────────────────────    │
│  Solo prime 5 righe se compressa           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📈 Analisi Visuale del Mercato             │
│  (I grafici mostrano SEMPRE tutti i dati)   │
└─────────────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ Grafico 1        │ Grafico 2        │
│ Top 10 Volume    │ Pie SSN vs Extra │
└──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│ Grafico 3        │ Grafico 4        │
│ Priorità U/B/D/P │ Top 10 % Extra   │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────────────┐
│  Grafico 5                                  │
│  Composizione Completa Tutte Prestazioni    │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Insight  │ Insight  │ Insight  │
│ Card 1   │ Card 2   │ Card 3   │
└──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────┐
│  ℹ️ Legenda Colonne                         │
└─────────────────────────────────────────────┘
```

## 🎨 Stile e UX

### **Palette Coerente**
- SSN: Sempre Blu (#3b82f6)
- Extra-SSN: Sempre Verde (#10b981)
- Urgente: Rosso (#ef4444)
- Breve: Arancione (#f59e0b)
- Differibile: Verde (#10b981)
- Programmabile: Blu (#3b82f6)

### **Hover States**
- Tooltip appare al passaggio mouse
- Background bianco con border grigio
- Border radius 8px per coerenza

### **Grid Layout**
```css
grid grid-cols-1 lg:grid-cols-2 gap-6
```

## 🔍 Casi d'Uso

### **Scenario 1: Identificare Opportunità Mercato Privato**
1. Guarda Grafico 4 (Top % Extra-SSN)
2. Identifica prestazioni con alta penetrazione privato
3. Confronta con volumi totali (Grafico 1)
4. Strategia: Focus su alto volume + alta % privato

### **Scenario 2: Analizzare Distribuzione Temporale**
1. Guarda Grafico 3 (Priorità)
2. Vedi quante prestazioni sono Urgenti vs Programmabili
3. Pianifica risorse di conseguenza

### **Scenario 3: Valutare Peso SSN vs Privato**
1. Guarda Grafico 2 (Pie Chart)
2. Leggi percentuali dirette
3. Confronta con cards sottostanti per valori assoluti

### **Scenario 4: Analisi Dettagliata Singola Prestazione**
1. Trova prestazione in Grafico 5 (Stack completo)
2. Vedi composizione U/B/D/P
3. Confronta con altre prestazioni

### **Scenario 5: Report Esecutivo**
1. Leggi 3 Insight Cards per KPI principali
2. Mostra Grafico 1 e 2 per overview
3. Comprimi tabella per focus su grafici

## 📊 Dati Tecnici

### **Performance**
- **useMemo**: Calcola chartData solo quando prestazioni cambiano
- **ResponsiveContainer**: Adatta grafici automaticamente
- **Troncamento**: Riduce complessità rendering labels

### **Librerie**
- **Recharts 2.8.0**: Libreria grafici React
- **Lucide React**: Icone SVG ottimizzate
- **Tailwind CSS**: Styling utility-first

### **Type Safety**
```typescript
interface ChartDataPoint {
  nome: string;
  nomeCompleto: string;
  totale: number;
  ssn: number;
  extraSSN: number;
}
```

## ✨ Miglioramenti Futuri Suggeriti

1. **Export Grafici come PNG/PDF**
2. **Filtri interattivi** (es: mostra solo prestazioni >X volume)
3. **Grafico trend temporale** se aggiungiamo dati storici
4. **Comparazione scenari** (Base vs Prudente)
5. **Drill-down** - Click su barra per dettagli prestazione
6. **Animation** - Transizioni smooth tra aggiornamenti
7. **Dark mode** - Palette alternativa per tema scuro
8. **Export dati grafico** in CSV/Excel

---

**Stato**: ✅ Completato e Funzionante  
**Server**: http://localhost:3002  
**Tab**: 📊 Mercato Ecografie  
**Ultima modifica**: 2025-10-04 19:15
