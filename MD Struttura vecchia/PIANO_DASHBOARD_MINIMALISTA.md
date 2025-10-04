# 🎯 PIANO DASHBOARD MINIMALISTA - Eco 3D

**Data**: 02/10/2025 17:35
**Obiettivo**: Dashboard essenziale con SOLO le metriche prioritarie da Guida.md

---

## 📊 METRICHE ESSENZIALI (da Guida.md)

### Priorità ALTA - Le uniche da mostrare

| # | Metrica | Priorità | Disponibile | Formula |
|---|---------|----------|-------------|---------|
| 1 | **MRR** | ALTA ⭐ | ✅ `monthlyData[59].recurringRev` | Ricavo mensile ricorrente |
| 2 | **ARR** | ALTA ⭐ | ✅ `kpis.arrRunRateM60` | MRR × 12 |
| 3 | **CAC** | ALTA ⭐ | ✅ `advancedMetrics.unitEconomics.cac` | S&M OPEX / Nuovi Clienti |
| 4 | **LTV** | ALTA ⭐ | ✅ `advancedMetrics.unitEconomics.ltv` | ARPU × Lifetime |
| 5 | **LTV/CAC** | ALTA ⭐ | ✅ `advancedMetrics.unitEconomics.ltvCacRatio` | LTV / CAC (target >3:1) |
| 6 | **Burn Rate** | ALTA ⭐ | ✅ `advancedMetrics.cashFlow.burnRate` | Perdita cassa mensile |
| 7 | **Runway** | ALTA ⭐ | ✅ `advancedMetrics.cashFlow.runway` | Mesi di autonomia |
| 8 | **Break-Even** | ALTA ⭐ | ✅ `kpis.breakEvenYearEBITDA` | Anno pareggio EBITDA |
| 9 | **Churn Rate** | ALTA ⭐ | ✅ `advancedMetrics.unitEconomics.churnRate` | % clienti persi |

**TOTALE**: 9 metriche essenziali

### DA RIMUOVERE (non prioritarie)
- ❌ Revenue Y1/Y5 (troppo generico, meglio MRR/ARR)
- ❌ EBITDA Y1/Y5 (meglio Burn Rate + Break-Even)
- ❌ Gross Margin % (secondario)
- ❌ Break-Even CFO (ridondante con EBITDA)
- ❌ SOM % (metrica interna, non critica per decisioni)

---

## 🏗️ LAYOUT DASHBOARD MINIMALISTA

### Struttura a 3 Sezioni

```
┌─────────────────────────────────────────────────────────┐
│ 1️⃣ REVENUE METRICS                                      │
│ ┌──────────────┐ ┌──────────────┐                       │
│ │ MRR          │ │ ARR          │                       │
│ │ €XX.XM/mese  │ │ €XX.XM/anno  │                       │
│ └──────────────┘ └──────────────┘                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2️⃣ UNIT ECONOMICS                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐             │
│ │ CAC      │ │ LTV      │ │ LTV/CAC      │             │
│ │ €X,XXX   │ │ €XX,XXX  │ │ 19.1x ✅     │             │
│ └──────────┘ └──────────┘ └──────────────┘             │
│                                                          │
│ ┌──────────────────────┐                                │
│ │ Churn Rate Annual    │                                │
│ │ 8.0% per year        │                                │
│ └──────────────────────┘                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3️⃣ CASH FLOW & SUSTAINABILITY                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐             │
│ │ Burn Rate│ │ Runway   │ │ Break-Even   │             │
│ │ €XXk/mo  │ │ XX mesi  │ │ Anno X       │             │
│ └──────────┘ └──────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Tooltip per OGNI Metrica

Esempio (da MetricTooltip esistente):

```typescript
<MetricTooltip
  metric="LTV/CAC Ratio"
  value="19.1x"
  description="Rapporto tra valore cliente e costo acquisizione"
  formula="LTV / CAC"
  benchmark={{
    good: ">5:1 (venture scale)",
    average: "3-5:1 (sostenibile)",
    poor: "<3:1 (non sostenibile)"
  }}
/>
```

---

## 🔧 MODIFICHE DA FARE

### Step 1: Semplificare Sezione KPI (30min)

**File**: `src/components/MasterDashboard.tsx`

**Rimuovere**:
- Sezione "Revenue & Profitability Evolution" (4 card)
- Sezione "Key Business Metrics" (5 card)

**Aggiungere**:
- Sezione "Revenue Metrics" (2 card: MRR, ARR)
- Sezione "Unit Economics" (4 card: CAC, LTV, LTV/CAC, Churn)
- Sezione "Cash Flow" (3 card: Burn Rate, Runway, Break-Even)

### Step 2: Aggiungere Tooltip a Tutte le Metriche (30min)

Pattern già esistente su Revenue Y1, replicare su tutte le 9 metriche.

### Step 3: Rimuovere Tab Legacy (15min)

Nascondere completamente il tab "🗂️ Vecchi Tab" o ridurlo a collapsible.

### Step 4: Test Visivo (15min)

- Aprire browser
- Verificare layout pulito
- Screenshot per documentazione

---

## 📐 FORMULE DA MOSTRARE NEI TOOLTIP

### 1. MRR
```
Formula: Somma ricavi mensili ricorrenti
= (Clienti Subscription × ARPA Sub / 12) + (Clienti CapEx × ARPA Maint / 12)

Benchmark:
- Good: Crescita >10% MoM
- Average: Crescita 5-10% MoM
- Poor: Crescita <5% MoM
```

### 2. ARR
```
Formula: MRR × 12
Run-rate annualizzato

Benchmark:
- Good: >€5M (venture scale)
- Average: €1-5M (early growth)
- Poor: <€1M (seed stage)
```

### 3. CAC (Customer Acquisition Cost)
```
Formula: Total S&M OPEX / Nuovi Clienti
= Spese Marketing e Vendite / Deals chiusi

Benchmark:
- Good: <€1,000
- Average: €1,000-3,000
- Poor: >€3,000

⚠️ Nota: Include tutti costi S&M, non solo acquisition pura
```

### 4. LTV (Lifetime Value)
```
Formula: ARPU × Average Lifetime
= Ricavo medio mensile × (12 / Churn Annuale)

Esempio: 
- ARPU = €100/mese
- Churn = 8%/anno
- Lifetime = 12/0.08 = 150 mesi
- LTV = €100 × 150 = €15,000

Benchmark:
- Good: >€10,000
- Average: €5,000-10,000
- Poor: <€5,000
```

### 5. LTV/CAC Ratio
```
Formula: LTV / CAC

Benchmark (Guida.md):
- Good: >5:1 (venture scale) ✅
- Average: 3-5:1 (sostenibile)
- Poor: <3:1 (NON sostenibile) ❌

Target minimo: 3:1
Eco 3D Base: ~19:1 (ECCELLENTE!)
```

### 6. Burn Rate
```
Formula: Perdita netta mensile di cassa
= (OPEX mensile - Ricavi mensili)

Net Burn = uscite - entrate

Benchmark:
- Good: Decrescente nel tempo
- Average: Stabile
- Poor: Crescente

⚠️ Runway = Cash / Burn Rate
```

### 7. Runway
```
Formula: Cassa Disponibile / Net Burn Rate
= Mesi di operatività rimanenti

Esempio:
- Cash: €600k
- Burn: €50k/mese
- Runway: 12 mesi

Benchmark (Guida.md):
- Good: >18 mesi
- Average: 12-18 mesi
- Poor: <12 mesi (rischio) ❌
- Critico: <6 mesi (emergenza) 🚨
```

### 8. Break-Even Point
```
Formula: Primo anno EBITDA ≥ 0
Anno in cui Ricavi = Costi Totali

Benchmark:
- Good: Anno 2-3
- Average: Anno 3-4
- Poor: >Anno 5

⚠️ Milestone fondamentale per sostenibilità
```

### 9. Churn Rate
```
Formula: 1 - (1 - Churn Annuale)^(1/12)
Conversione da annuale a mensile

Esempio:
- Churn Annuale: 8%
- Churn Mensile: ~0.69%

Benchmark (SaaS):
- Good: <5% annuale
- Average: 5-10% annuale
- Poor: >10% annuale

⚠️ Churn alto erode la crescita
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### Fase 1: Prep (15min)
- [ ] Backup MasterDashboard.tsx attuale
- [ ] Creare branch git `feature/minimal-dashboard`
- [ ] Fermare server dev

### Fase 2: Modifiche (1h)
- [ ] Rimuovere sezioni KPI vecchie
- [ ] Aggiungere sezione "Revenue Metrics" (MRR, ARR)
- [ ] Aggiungere sezione "Unit Economics" (CAC, LTV, LTV/CAC, Churn)
- [ ] Aggiungere sezione "Cash Flow" (Burn Rate, Runway, Break-Even)
- [ ] Test compilazione TypeScript

### Fase 3: Tooltip (30min)
- [ ] Tooltip MRR con formula e benchmark
- [ ] Tooltip ARR
- [ ] Tooltip CAC
- [ ] Tooltip LTV
- [ ] Tooltip LTV/CAC
- [ ] Tooltip Burn Rate
- [ ] Tooltip Runway
- [ ] Tooltip Break-Even
- [ ] Tooltip Churn Rate

### Fase 4: Test (30min)
- [ ] `npm run type-check` → zero errori
- [ ] `npm run dev` → server ok
- [ ] Browser → http://localhost:3000
- [ ] Test hover tooltip su tutte le 9 metriche
- [ ] Screenshot dashboard finale
- [ ] Test cambio scenario → metriche si aggiornano

### Fase 5: Cleanup (15min)
- [ ] Nascondere/rimuovere tab "Vecchi Tab"
- [ ] Rimuovere controlli parametri non essenziali
- [ ] Aggiornare RISTRUTTURAZIONE_TRACKING.md

---

## 📸 PRIMA/DOPO

### PRIMA (dashboard attuale)
- 13 tab totali
- 9 KPI cards confuse
- Nessun tooltip informativo
- Metriche non prioritarie
- Overload di informazioni

### DOPO (dashboard minimalista)
- 1 tab principale
- 9 metriche ESSENZIALI
- Tooltip con formule su tutte le metriche
- Layout pulito a 3 sezioni
- Focus su decisioni chiave

---

## 🎯 OBIETTIVO FINALE

**Una dashboard che risponde a 3 domande chiave**:

1. **Stiamo crescendo?** → MRR/ARR
2. **È sostenibile?** → LTV/CAC, Churn
3. **Quanto duriamo?** → Burn Rate, Runway, Break-Even

**Tutto il resto è rumore.**

---

## 🚀 PROSSIMO PASSO

**VUOI CHE PROCEDA CON L'IMPLEMENTAZIONE?**

Approccio:
1. **Modifico MasterDashboard.tsx** rimuovendo il superfluo
2. **Aggiungo le 9 metriche essenziali** con tooltip
3. **Test immediato** dopo ogni sezione
4. **Screenshot finale** per verifica

Tempo stimato: **2 ore totali**

**Procedo?** 🚀
