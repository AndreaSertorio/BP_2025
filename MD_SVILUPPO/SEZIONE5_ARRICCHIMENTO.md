# Piano di Arricchimento Sezione 5 - Modello di Business

## Nuove Sezioni da Aggiungere

### 1. Opzioni Contrattuali (showContractualOptions)
**Card con 3 opzioni:**
- **Vendita (CapEx)**: Acquisto dispositivo + garanzia 12 mesi + piano Service
- **Leasing/Noleggio**: Canone mensile 36-60 mesi, riscatto opzionale
- **Subscription All-in-One**: Device + SW + scan + service inclusi

**Tooltip**: Spiegare vantaggi/svantaggi di ogni opzione per clienti diversi

### 2. Tabella Pacchetti Completa (showPackagesTable)
**Tabella responsive** con colonne:
- Pacchetto (Starter/Pro/Enterprise)
- Target
- Contenuto dettagliato
- Canone/mese
- CapEx alternativa

**Note sotto tabella:**
- Pay-per-scan oltre soglie
- Training extra
- Livelli Service

### 3. Politiche di Sconto (showDiscountPolicies)
**Card colorate per ogni tipo:**
- Early Adopter: -15% o +20% crediti
- Multi-device: -10% dal 2° device
- Accademico/Ricerca: -20% con co-publishing
- Tender/Centrali: Sconti strutturati vs volumi
- Upgrade pacchetto: Pro-rata su residuo

### 4. Formule e Calcoli (showFormulas)
**Accordion con formule chiave:**
- LTV = ARPA × Margine × Durata × (1 - Churn)
- Unit Economics: Margine/scan = Prezzo - Costo variabile
- Break-even: CF / (PVU - CVU)
- CAC/LTV Ratio

**Tooltip** con esempi numerici

### 5. Roadmap Prezzi (showPricingRoadmap)
**Timeline con milestone:**
- v0.1 (oggi): Range indicativi
- v0.2 (post-pilot): Aggiornamento con dati reali
- v1.0 (GTM): Listini ufficiali Italia/EU/USA

**To-Do list** con checkbox

## Miglioramenti UX

### Tooltip Everywhere
Aggiungere icona Info accanto a:
- Ogni metrica KPI
- Termini tecnici (LTV, CAC, ARPA, Churn)
- Margini e percentuali
- Formule

### Alert e Note
- Warning box per "numeri placeholder da validare"
- Info box per prerequisiti regolatori
- Success box per obiettivi raggiunti

### Testo Esplicativo
Ogni sezione deve avere:
1. **Titolo** con icona
2. **Descrizione** (1-2 frasi contesto)
3. **Visualizzazione** (grafico/tabella)
4. **Note operative** (come usare questi dati)
5. **Link** a sezioni correlate (es. "vedi GTM per volumi")

## Struttura Finale Proposta

```
[Header + Personalizza]

1. Revenue Streams Overview
   ↓ Descrizione architettura ricavi
   ↓ Card per stream + dettagli HW

2. Opzioni Contrattuali  [NUOVO]
   ↓ 3 modelli: Vendita/Leasing/Subscription
   ↓ Tooltip vantaggi/svantaggi

3. Pacchetti e Pricing [NUOVO]
   ↓ Tabella completa Starter/Pro/Enterprise
   ↓ Note pay-per-scan, training, service

4. Modelli Pricing SaaS
   ↓ Grafico distribuzione
   ↓ Card dettagliate + tiered pricing

5. Politiche di Sconto [NUOVO]
   ↓ 5 card con sconti specifici
   ↓ Alert "validare con legal/procurement"

6. Analisi Margini
   ↓ Grafico barre + card medie

7. KPI Economici Target
   ↓ 6 KPI con tooltip spiegazione

8. Formule e Calcoli [NUOVO]
   ↓ Accordion con formule + esempi
   ↓ Calculator interattivo (opzionale)

9. Unit Economics
   ↓ 2-3 esempi dettagliati
   ↓ Breakdown costi step-by-step

10. Roadmap Prezzi [NUOVO]
    ↓ Timeline validazione
    ↓ To-Do checklist
```

## Componenti UI da Usare

### Tooltip
```tsx
<span className="flex items-center gap-1">
  Margine Lordo 
  <Info className="h-3 w-3 text-gray-400 cursor-help" 
    title="Margine Lordo = (Ricavi - COGS) / Ricavi × 100. 
    Indica quanto profitto rimane dopo aver coperto i costi diretti di produzione." 
  />
</span>
```

### Alert Box
```tsx
<div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
  <div className="flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
    <div>
      <p className="font-semibold text-yellow-800">Numeri indicativi</p>
      <p className="text-sm text-yellow-700">
        I prezzi sono placeholder v0.1 da validare con pilot e modello finanziario completo.
      </p>
    </div>
  </div>
</div>
```

### Accordion
```tsx
<details className="group">
  <summary className="cursor-pointer font-semibold flex items-center gap-2">
    <Calculator className="h-4 w-4" />
    Formula LTV (Lifetime Value)
  </summary>
  <div className="mt-2 pl-6 text-sm">
    <code>LTV = ARPA × Margine % × Durata media × (1 - Churn %)</code>
    <p className="mt-2 text-gray-600">
      Esempio: €500/mese × 85% × 3 anni × (1 - 0.08) = €14,076
    </p>
  </div>
</details>
```

## Priorità Implementazione

1. **ALTA**: Tabella Pacchetti, Politiche Sconto, Formule
2. **MEDIA**: Opzioni Contrattuali, Roadmap Prezzi
3. **BASSA**: Calculator interattivo, grafici avanzati

## Note Finali

- Ogni sezione deve poter essere nascosta individualmente
- Salvare preferenze personalizzazione in localStorage
- Testo deve essere **leggibile** (no wall of text)
- Tooltip su tutti i termini tecnici
- Link interni tra sezioni Business Plan
