# FIX BREAK-EVEN: CUMULATIVE OPERATING CASH FLOW

**Data:** 2025-10-22  
**Problema:** Il grafico Break-Even mostrava erroneamente il break-even al primo anno (2025)  
**Causa:** Si usava `endingCash` che **include i funding rounds** invece del puro operating cash flow  
**Soluzione:** Usare **Cumulative Operating CF** (escluso financing)

---

## 🚨 PROBLEMA IDENTIFICATO

### **Before (SBAGLIATO):**
```typescript
const endingCash = yearData.cashFlow?.endingCash || 0;
// endingCash = cash from operations + cash from investing + cash from FINANCING
// Include funding rounds → sembra che abbiamo sempre soldi!
```

**Risultato:**
- Grafico partiva da valori positivi (€300K funding)
- Break-even mostrato al 2025 ❌
- Non mostrava il vero burn period pre-revenue

### **Problema Concettuale:**
```
2025 Anno 1:
  Revenue: €0
  OPEX: -€400K
  Operating CF: -€400K
  Funding Round: +€300K
  ───────────────────────
  Ending Cash: -€100K  ← Sembra che siamo vicini al break-even!
```

**MA** questo è sbagliato! L'azienda ha **bruciato €400K** dal punto di vista operativo.

---

## ✅ SOLUZIONE IMPLEMENTATA

### **1. Cumulative Operating Cash Flow**

```typescript
// CUMULATIVE OPERATING CASH FLOW (senza financing!)
let cumulativeOperatingCF = 0;

annualData.forEach((yearData, yearIdx) => {
  // Operating CF (escluso financing/investing)
  const operatingCF = yearData.cashFlow?.operations || 0;
  
  // Aggiungi operating CF al cumulativo
  cumulativeOperatingCF += operatingCF;
  
  // BREAK-EVEN = quando cumulative OPERATING CF diventa >= 0
  if (cumulativeOperatingCF >= 0 && prevCumulativeOpCF < 0) {
    breakEvenYear = yearData.year;
  }
});
```

### **2. Formula Corretta:**

```
Cumulative Operating CF = Σ(Operating Cash Flow da inizio)

Operating CF = Net Income + Depreciation + Working Capital Change
(ESCLUSO: Investing CF, Financing CF)

Break-Even = Anno dove Cumulative Operating CF >= 0
```

---

## 📊 GRAFICO AGGIORNATO

### **dataKey Cambiato:**
```typescript
// PRIMA (sbagliato):
<Area dataKey="endingCash" />  // Include funding

// DOPO (corretto):
<Area dataKey="cumulativeOperatingCF" />  // Solo operations
```

### **Cosa Mostra Ora:**

```
Anno 2025-2028: BURN PERIOD
  ├── Cumulative Operating CF negativo (scende)
  ├── Marker arancione: punto di massimo burn
  └── Area rossa

Anno 2029-2032: RAMP-UP
  ├── Revenue cresce, operating CF migliora
  └── Cumulative Operating CF inizia a risalire

Anno 2033+: BREAK-EVEN REACHED
  ├── Cumulative Operating CF >= 0
  ├── Marker verde: break-even point
  └── Area verde
```

---

## 🔢 METRICHE TRACCIATE

### **1. Cumulative Operating CF**
```typescript
cumulativeOperatingCF: cumulativeOperatingCF
// Totale cash flow dalle operazioni dall'inizio
// Negativo = ancora bruciando cumulativamente
// Positivo = recuperati tutti i costi operativi
```

### **2. Min Operating CF (Max Burn)**
```typescript
minOperatingCF: numero più negativo del cumulative operating CF
minOperatingCFYear: anno del massimo burn operativo
// Es: -€2.4M nel 2028
```

### **3. Ending Cash (Separato)**
```typescript
endingCash: cash disponibile totale (include funding)
// Mostrato separatamente per chiarezza
```

---

## 💡 TOOLTIP AGGIORNATO

```
📊 Cumulative Operating CF: -€1.2M  ← METRICA PRINCIPALE
   (Totale cash flow dalle operazioni, escluso finanziamenti)

───────────────────────────────────

💰 Cash Disponibile: €800K
   (Include funding rounds)

───────────────────────────────────

Operating CF annuale: -€400K
Revenue: €0
EBITDA: -€400K
```

**Chiarezza:**
- **Cumulative Operating CF** = "Quanto abbiamo bruciato dal punto di vista operativo"
- **Cash Disponibile** = "Quanto cash abbiamo in banca (con funding)"

---

## 📈 STATISTICHE 4 CARDS

### **Card 1: Break-Even Operativo**
```
Break-Even Operativo
✅ Raggiunto
Cumulative Operating CF ≥ 0
```

### **Card 2: Anni al Break-Even**
```
Anni al Break-Even
7 anni
```

### **Card 3: Cash Finale**
```
Cash Finale
€22.4M
(Include funding rounds)
```

### **Card 4: Operating CF Minimo**
```
Operating CF Minimo (Max Burn)
-€2.4M
Anno 2028
```

---

## 🎯 INVESTOR INSIGHTS AGGIORNATI

### **Se Break-Even Raggiunto:**
```
💡 Investor Insight
• L'azienda raggiunge il massimo burn operativo nell'anno 2028 (-€2.4M)
• Il break-even operativo si raggiunge nell'anno 2032
• Cumulative Operating CF finale: €8.2M
• Dopo il break-even, l'azienda ha recuperato tutti i costi operativi sostenuti
• Cash disponibile finale (include funding): €22.4M
```

### **Se Break-Even NON Raggiunto:**
```
💡 Investor Insight
• Il break-even operativo non è ancora raggiunto nel periodo pianificato
• Operating CF cumulativo minimo: -€4.2M nell'anno 2030
• Operating CF cumulativo finale: -€1.8M
• Cash disponibile finale (con funding): €5M
• Considera: aumentare revenue, ridurre OPEX, o pianificare ulteriori funding rounds
```

---

## 🔍 CONFRONTO FORMULE

### **Break-Even Classico (Economico):**
```
Break-Even Units = Fixed Costs / (Price - Variable Cost)
Break-Even Revenue = Fixed Costs / Contribution Margin %

Quando: EBITDA >= 0
```

### **Break-Even Cash Flow (Quello che usiamo):**
```
Cumulative Operating CF = Σ Operating CF from start

Quando: Cumulative Operating CF >= 0

Significato: L'azienda ha generato abbastanza cash dalle operazioni
             per coprire TUTTI i costi operativi sostenuti dall'inizio
```

---

## 📝 FILES MODIFICATI

### **`MetricsPanel.tsx`**

**Funzione `calculateBreakEvenData()`:**
- ✅ Aggiunto `cumulativeOperatingCF` (cumulative sum)
- ✅ Tracking `minOperatingCF` e `minOperatingCFYear`
- ✅ Break-even quando `cumulativeOperatingCF >= 0`
- ✅ Data object include `cumulativeOperatingCF`, `endingCash`, `operatingCF`

**Tooltip `CustomBreakEvenTooltip`:**
- ✅ Mostra `cumulativeOperatingCF` come metrica principale
- ✅ Mostra `endingCash` separatamente con nota "(Include funding rounds)"
- ✅ Spiega differenza tra le due metriche

**Grafico AreaChart:**
- ✅ `dataKey="cumulativeOperatingCF"` invece di `endingCash`
- ✅ Reference line per `minOperatingCFYear`
- ✅ Marker arancione per punto di massimo burn operativo

**Statistiche:**
- ✅ Card 1: "Break-Even Operativo" con subtitle
- ✅ Card 4: "Operating CF Minimo (Max Burn)" con anno

**Insights:**
- ✅ Menzionano "massimo burn operativo"
- ✅ Spiegano "cumulative operating CF"
- ✅ Distinguono "cash disponibile (include funding)"

---

## 🧪 TESTING

### **Scenario Pre-Revenue (2025-2028):**
```
Anno 2025:
  Revenue: €0
  Operating CF: -€400K
  Cumulative Op CF: -€400K  ← Corretto!
  Ending Cash: -€100K (con funding €300K)
  
Anno 2026:
  Revenue: €0
  Operating CF: -€500K
  Cumulative Op CF: -€900K  ← Continua a scendere
  Ending Cash: -€600K
```

### **Scenario Post-Revenue (2029+):**
```
Anno 2029:
  Revenue: €500K
  Operating CF: +€50K
  Cumulative Op CF: -€2.35M  ← Ancora negativo ma migliora
  
Anno 2032:
  Revenue: €4.8M
  Operating CF: +€800K
  Cumulative Op CF: +€100K  ← BREAK-EVEN! 🎯
```

---

## ✅ RISULTATO FINALE

### **Prima (SBAGLIATO):**
```
Grafico partiva da €300K (funding)
Break-even mostrato al 2025
Investitori confusi: "Perché break-even immediato?"
```

### **Dopo (CORRETTO):**
```
Grafico parte negativo (burn period)
Scende fino al massimo burn (~2028)
Risale gradualmente con revenue
Break-even realistico (~2032)
Investitori capiscono: "7 anni per recuperare costi operativi"
```

---

## 🚀 IMPLICAZIONI PER INVESTITORI

### **Cumulative Operating CF Negativo:**
- L'azienda sta ancora bruciando cash operativamente
- Dipende da funding rounds per sopravvivere
- Necessita capitale aggiuntivo

### **Cumulative Operating CF Positivo (Break-Even):**
- L'azienda ha recuperato tutti i costi operativi sostenuti
- Operazioni diventano self-sustaining
- Minor rischio di dilution futura
- Cash generato può essere reinvestito o distribuito

---

## 📊 BENCHMARK SETTORE

### **Medtech/Hardware:**
- Break-even tipico: **5-7 anni**
- Max burn tipico: Anno 3-4 (post-R&D, pre-scaling)
- Eco 3D: **7 anni** → In linea con industry standard ✅

### **SaaS Puro:**
- Break-even tipico: **2-4 anni**
- Più veloce per minor COGS e capex

---

## 🔄 PROSSIMI STEP

### **Miglioramenti Futuri:**
- [ ] Drill-down mensile del cumulative operating CF
- [ ] Scenario analysis: "Cosa serve per break-even a 5 anni?"
- [ ] Integrazione con Sensitivity Analysis (cambio pricing/OPEX)
- [ ] Export grafico break-even separato per investor deck

### **Validazione:**
- [ ] Test con dati reali funding rounds
- [ ] Confronto con modelli Excel esistenti
- [ ] Review con CFO/advisor finanziari

---

**🎉 FIX COMPLETATO E DOCUMENTATO!**
