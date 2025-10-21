# 🎯 Simulatore Impatto Business Interattivo

## 📅 Data: 13 Ottobre 2025 - 00:05

---

## 🎯 OBIETTIVO

Trasformare il Funnel da **tool di configurazione** a **strumento strategico di pianificazione** sales & marketing, permettendo di:

1. ✅ Testare diversi scenari (anni, costi, produttività)
2. ✅ Stimare lead necessari per ogni anno
3. ✅ Calcolare budget marketing dinamicamente
4. ✅ Valutare efficacia strategia commerciale

---

## 🚀 FUNZIONALITÀ IMPLEMENTATE

### 1. **Selettore Anno Dinamico**

**Controllo**: Dropdown Anno 1-5

**Comportamento**:
- Seleziona l'anno da analizzare (default: Anno 1)
- Legge automaticamente i reps configurati per quell'anno
- Applica ramp-up **solo per Anno 1**
- Mostra reps in tempo reale sotto il dropdown

**Esempio**:
```
Anno 1 → Reps: 1 (con ramp-up 75%)
Anno 2 → Reps: 2 (senza ramp-up)
Anno 5 → Reps: 9 (senza ramp-up)
```

---

### 2. **Costo per Lead Modificabile**

**Controllo**: Input numerico €10-€500

**Default**: €50/lead

**Utilizzo**:
- Stima CAC (Customer Acquisition Cost)
- Permette di testare diverse strategie marketing:
  - **Organico**: €10-30/lead (SEO, referral)
  - **Paid Ads**: €50-100/lead (Google, LinkedIn)
  - **Outbound**: €150-300/lead (cold calling, events)

**Calcolo Budget**:
```
Budget Marketing = Lead Necessari × Costo per Lead
```

---

### 3. **Deals per Rep Modificabile**

**Controllo**: Input numerico 1-15 deals/quarter

**Default**: Valore da `salesCapacity.dealsPerRepPerQuarter`

**Reset**: Bottone per tornare al default

**Utilizzo**:
- Testare produttività sales team
- Confrontare scenari ottimistici vs conservativi
- Pianificare target performance rep

**Esempio Scenari**:
```
Conservativo: 3 deals/Q/rep
Base: 5 deals/Q/rep
Ottimistico: 7 deals/Q/rep
Top Performer: 10 deals/Q/rep
```

---

### 4. **Calcoli Dinamici Real-Time**

Tutti i calcoli si aggiornano **istantaneamente** al cambio parametri:

#### A. **Efficienza Totale Funnel**
```typescript
Efficienza = lead_to_demo × demo_to_pilot × pilot_to_deal
```
Mostra: "Ogni 100 lead → X deal"

#### B. **Capacity Anno Selezionato**
```typescript
// Anno 1 con ramp-up
capacity = reps × deals/Q × 4 × rampFactor

// Altri anni senza ramp-up
capacity = reps × deals/Q × 4
```

#### C. **Lead Necessari**
```typescript
lead = ceil(capacity / efficienza_funnel)
```
**Output chiave**: Quanti lead servono per saturare capacity

#### D. **Budget Marketing**
```typescript
budget = lead × costo_per_lead
```
**Output chiave**: Investimento marketing necessario

---

### 5. **Breakdown Mensile**

**Grid 2 colonne**:
- **Lead/Mese**: `lead_annuali / 12`
- **Budget/Mese**: `budget_annuale / 12`

**Utilità**: Pianificazione operativa mensile

---

### 6. **Insights & Metriche Avanzate**

Box verde con metriche calcolate:

#### **Efficienza Funnel**
```
"Ogni 100 lead → 0.7 deal" (con efficienza 0.7%)
```

#### **CAC Effettivo**
```
CAC = Costo per Lead / Efficienza Funnel
Esempio: €50 / 0.007 = €7,143 per deal
```

#### **Budget/Ricavi %**
```
% = (Budget Marketing / Ricavi Attesi) × 100
Esempio: €28K / €750K = 3.7%
```
- ✅ < 10%: Eccellente
- ⚠️ 10-15%: Accettabile
- ❌ > 15%: Troppo alto

#### **Produttività Rep**
```
Deals/Anno/Rep = deals/Q × 4
Esempio: 5 × 4 = 20 deals/anno
```

---

### 7. **Alert Automatico Budget Alto**

**Trigger**: `marketingPercentage > 15%`

**Box rosso** con suggerimenti:
```
⚠️ Budget Marketing Alto

Il budget marketing supera il 15% dei ricavi. Considera:
• Migliorare efficienza funnel (attualmente X%)
• Ridurre costo per lead (attualmente €X)
• Aumentare produttività reps
```

**Esempio**:
```
Scenario Problematico:
- Lead necessari: 2,000
- Costo/lead: €100
- Budget: €200K
- Ricavi attesi: €1M
- %: 20% ❌

Dopo ottimizzazione:
- Migliora funnel 0.7% → 2%
- Lead necessari: 750 (-62%)
- Budget: €75K
- %: 7.5% ✅
```

---

## 🎮 USE CASES PRATICI

### Use Case 1: "Quanto budget serve per Anno 2?"

**Step**:
1. Seleziona **Anno 2** dal dropdown
2. Sistema legge automaticamente reps configurati (es. 2)
3. Vedi capacity: 2 reps × 5 deals/Q × 4 = 40 deals
4. Con efficienza 2.6%, servono 1,538 lead
5. A €50/lead → Budget €77K

**Output**: Pianificazione budget marketing Anno 2

---

### Use Case 2: "Posso permettermi solo €30K marketing Anno 1?"

**Step**:
1. Anno 1 selezionato
2. Lead necessari: 571 (con efficienza 2.6%)
3. Budget attuale €50/lead: €28.5K ✅
4. Prova scenario pessimistico: efficienza scende a 1.5%
5. Lead necessari: 1,000
6. Budget €50/lead: €50K ❌

**Output**: Budget attuale sufficiente SE mantieni efficienza

---

### Use Case 3: "Se assumi rep più bravi?"

**Step**:
1. Anno 1, 1 rep, 5 deals/Q (base)
2. Lead: 571, Budget: €28.5K
3. Cambia **Deals/Rep/Q** → 7 (top performer)
4. Capacity sale: 21 deals (+40%)
5. Lead necessari: 800 (+40%)
6. Budget: €40K (+40%)

**Output**: Top performer richiedono più lead ma generano più deals

---

### Use Case 4: "Strategia Marketing Organico vs Paid"

**Scenario A - Paid Ads**:
```
Costo/Lead: €100
Lead necessari: 571
Budget: €57K
% su ricavi: 7.6%
```

**Scenario B - Mix (70% organic, 30% paid)**:
```
Costo/Lead: €45 (media pesata)
Lead necessari: 571
Budget: €25.7K
% su ricavi: 3.4% ✅
```

**Output**: Mix organic riduce budget marketing del 55%

---

### Use Case 5: "Ottimizzare Funnel vs Assumere Reps"

**Opzione A - Migliora Funnel**:
```
Prima: Efficienza 2.6%, 571 lead, €28.5K
Dopo: Efficienza 4%, 375 lead (-34%), €18.7K
Risparmio: €9.8K/anno
```

**Opzione B - Assumi 1 rep**:
```
Prima: 1 rep, 15 deals, 571 lead, €28.5K
Dopo: 2 reps, 30 deals, 1,142 lead, €57K
Costo extra: +€28.5K marketing + €60K stipendio = €88.5K
Ricavi extra: +15 deals × €50K = €750K
ROI: 847% ✅
```

**Output**: Assumere reps ha ROI migliore del solo migliorare funnel

---

## 📊 FORMULE COMPLETE

### Capacity con Ramp-Up
```typescript
const yearKey = `y${selectedYear}` as keyof typeof repsByYear;
const repsForYear = repsByYear[yearKey];
const dealsPerQ = dealsPerRepOverride ?? salesCapacity.dealsPerRepPerQuarter;

// Ramp-up solo anno 1
const rampFactor = selectedYear === 1 
  ? (12 - salesCapacity.rampUpMonths) / 12 
  : 1;

const capacityWithRamp = repsForYear * dealsPerQ * 4 * rampFactor;
```

### Efficienza Funnel
```typescript
const funnelEfficiency = 
  conversionFunnel.lead_to_demo * 
  conversionFunnel.demo_to_pilot * 
  conversionFunnel.pilot_to_deal;
```

### Lead Necessari
```typescript
const leadsNeeded = Math.ceil(capacityWithRamp / funnelEfficiency);
```

### Budget Marketing
```typescript
const marketingBudget = leadsNeeded * costPerLead;
```

### CAC Effettivo
```typescript
const cacEffettivo = costPerLead / funnelEfficiency;
```

### Budget/Ricavi %
```typescript
const devicePrice = 50000; // €50K per dispositivo
const expectedRevenue = capacityWithRamp * devicePrice;
const marketingPercentage = (marketingBudget / expectedRevenue) * 100;
```

---

## 🎨 UI/UX DESIGN

### Controlli Interattivi (Grid 3 colonne)

**Box 1 - Selettore Anno**:
- Dropdown con 5 opzioni (Anno 1-5)
- Label: "📅 Anno"
- Info sotto: "Reps: X" (valore dinamico)
- Background: White, border green

**Box 2 - Costo per Lead**:
- Input numerico con prefisso €
- Range: €10-€500, step €5
- Label: "💰 Costo/Lead"
- Info sotto: "CAC stimato"

**Box 3 - Deals per Rep**:
- Input numerico
- Range: 1-15, step 1
- Label: "📊 Deals/Rep/Q"
- Bottone reset sotto (testo blue clickable)

### Output Metriche

**Color Coding**:
- 🟢 Verde: Efficienza funnel (metrica positiva)
- 🟣 Viola: Capacity (metrica interna)
- 🔵 Blu: Lead (metrica marketing)
- 🟠 Arancione: Budget (metrica finanziaria)

**Typography**:
- Valori grandi: text-3xl font-bold
- Valori medi: text-2xl font-bold
- Label: text-xs text-gray-600
- Formula: text-sm text-gray-500

---

## 🔧 STATI COMPONENTE

```typescript
// Anno selezionato (1-5)
const [selectedYear, setSelectedYear] = useState<number>(1);

// Costo per lead in EUR (default €50)
const [costPerLead, setCostPerLead] = useState<number>(50);

// Override deals/rep (null = usa default da salesCapacity)
const [dealsPerRepOverride, setDealsPerRepOverride] = useState<number | null>(null);
```

**Persistence**: Stati locali, non salvati in DB (sono per simulazione)

---

## 📊 METRICHE MONITORATE

### Input Parametri
- ✅ Anno selezionato (1-5)
- ✅ Costo per lead (€10-500)
- ✅ Deals per rep per quarter (1-15)

### Output Calcolati
- ✅ Efficienza funnel totale (%)
- ✅ Capacity anno con/senza ramp-up
- ✅ Lead necessari (annuali e mensili)
- ✅ Budget marketing (annuale e mensile)
- ✅ CAC effettivo per deal
- ✅ Budget/Ricavi %
- ✅ Produttività rep (deals/anno)

### Alerts
- ⚠️ Budget marketing > 15% ricavi

---

## 🧪 PIANO DI TEST

### Test 1: Selezione Anno Dinamica

```
1. Seleziona Anno 1
   ✅ Vedi Reps: 1
   ✅ Vedi ramp-up applicato (0.75)
   ✅ Capacity: 15 deals

2. Seleziona Anno 3
   ✅ Vedi Reps: 3
   ✅ NO ramp-up
   ✅ Capacity: 60 deals

3. Lead e Budget aggiornati automaticamente
```

---

### Test 2: Modifica Costo per Lead

```
1. Anno 1, Costo €50
   ✅ Budget: €28.5K

2. Cambia Costo → €100
   ✅ Budget raddoppia: €57K
   ✅ % su ricavi sale: 7.6%

3. Cambia Costo → €20
   ✅ Budget scende: €11.4K
   ✅ % su ricavi: 1.5%
```

---

### Test 3: Override Deals per Rep

```
1. Default: 5 deals/Q
   ✅ Capacity: 15 deals
   ✅ Lead: 571

2. Override → 7 deals/Q
   ✅ Capacity: 21 deals (+40%)
   ✅ Lead: 800 (+40%)
   ✅ Produttività: 28 deals/anno

3. Click "Reset"
   ✅ Torna a 5 deals/Q
   ✅ Capacity torna a 15
```

---

### Test 4: Alert Budget Alto

```
1. Scenario normale (efficienza 2.6%, €50/lead)
   ✅ Budget: €28.5K
   ✅ %: 3.8%
   ✅ NO alert

2. Scenario problematico:
   - Funnel Lead→Demo: 10% (pessimo)
   - Efficienza totale: 0.7%
   ✅ Lead: 2,142
   ✅ Budget: €107K
   ✅ %: 14.3%... ancora OK

3. Funnel pessimistico + Costo alto:
   - Efficienza: 0.7%
   - Costo: €100/lead
   ✅ Budget: €214K
   ✅ %: 28.5% ❌
   ✅ Alert rosso appare con suggerimenti
```

---

### Test 5: Breakdown Mensile

```
Lead annuali: 571
Budget annuale: €28.5K

✅ Lead/Mese: 48 (571/12)
✅ Budget/Mese: €2.4K (€28.5K/12)

Cambia anno → Anno 3:
Lead annuali: 2,308
Budget annuale: €115K

✅ Lead/Mese: 193
✅ Budget/Mese: €9.6K
```

---

## 🎯 VANTAGGI BUSINESS

### 1. Pianificazione Data-Driven

**Prima**: "Quanto budget marketing serve?"
**Dopo**: "Per Anno 2 con 2 reps servono 1,538 lead = €77K budget"

### 2. Ottimizzazione Strategica

**Scenario Testing**:
- Migliora funnel vs Assumi reps vs Mix
- Organic vs Paid marketing
- Produttività conservative vs aggressive

### 3. Controllo Costi

**Monitoring**:
- Budget/Ricavi % in tempo reale
- Alert automatico se troppo alto
- CAC effettivo calcolato

### 4. Allineamento Team

**Sales ↔ Marketing**:
- Sales sa: "Devo chiudere X deal quest'anno"
- Marketing sa: "Devo generare Y lead/mese"
- Finance sa: "Budget marketing è Z% ricavi"

---

## 🚀 ESTENSIONI FUTURE

### Immediate
1. **Prezzo Dispositivo Configurabile**: Input invece di hardcoded €50K
2. **Salva Scenari**: Possibilità di salvare configurazioni "Base", "Ottimistico", "Conservativo"
3. **Export Excel**: Tabella comparativa scenari

### Avanzate
1. **Timeline View**: Mostra evoluzione lead/budget per anno su grafico
2. **Channel Mix**: Breakdown costo/lead per canale (SEO, Ads, Events)
3. **Seasonality**: Lead necessari per mese considerando stagionalità
4. **Monte Carlo**: Simulazione probabilistica efficienza funnel

---

## 📖 GUIDA UTENTE

### Come Usare il Simulatore

**Step 1**: Seleziona l'anno
```
Dropdown "Anno" → Scegli Anno 1-5
→ Sistema carica reps configurati
```

**Step 2**: Imposta costo per lead
```
Input "Costo/Lead" → €10-500
→ Default €50 (paid ads medio)
→ Usa €20 per organic, €100 per outbound
```

**Step 3**: (Opzionale) Testa produttività reps
```
Input "Deals/Rep/Q" → 1-15
→ Default da configurazione globale
→ Cambia per testare scenari
```

**Step 4**: Leggi risultati
```
✅ Efficienza funnel → Quanto è efficace
✅ Capacity → Quanti deal puoi chiudere
✅ Lead necessari → Target marketing
✅ Budget → Investimento richiesto
✅ Breakdown mensile → Operativo
✅ Insights → Metriche avanzate
```

**Step 5**: Ottimizza
```
Se Budget/Ricavi > 15%:
→ Aumenta efficienza funnel (slider sopra)
→ Riduci costo/lead (cambia strategia)
→ Aumenta produttività reps
```

---

## ✅ CHECKLIST COMPLETAMENTO

- [x] Stati interattivi (anno, costo, deals)
- [x] Calcoli dinamici real-time
- [x] Selezione anno 1-5
- [x] Costo per lead modificabile
- [x] Deals per rep modificabile con reset
- [x] Breakdown mensile
- [x] Insights avanzati (CAC, %, produttività)
- [x] Alert budget alto (>15%)
- [x] Formule visibili e trasparenti
- [x] UI pulita con color coding
- [x] Tooltip esplicativi
- [ ] Test completo funzionalità

---

**SIMULATORE COMPLETO E INTERATTIVO!** ✅

**Ora è uno strumento strategico fondamentale per pianificazione sales & marketing!** 🚀
