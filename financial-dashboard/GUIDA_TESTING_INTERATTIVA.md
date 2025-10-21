# 🧪 GUIDA TESTING INTERATTIVA - Export Dashboard

**Server attivo:** ✅ `http://localhost:3000`  
**Obiettivo:** Testare tutti i 14 export CSV/JSON  
**Tempo stimato:** 10-15 minuti

---

## 🎯 STEP-BY-STEP TESTING

### **STEP 1: Apri Dashboard** ✅
```bash
# Il server è già avviato!
# Apri browser su:
http://localhost:3000
```

**➡️ Azione:** Apri il link nel browser

---

### **STEP 2: Export Panel Location**

Scroll verso il **fondo della pagina** fino a vedere:

```
┌─────────────────────────────────────┐
│  📥 Export Data                     │
│                                     │
│  Current scenario: Base Scenario   │
│                                     │
│  [ Export Monthly Data      CSV ]  │
│  [ Export Annual Data       CSV ]  │
│  [ Export Key KPIs          CSV ]  │
│  [ Export Advanced Metrics  CSV ]  │
│  [ Export Cash Flow         CSV ]  │
│  [ Export Growth Metrics    CSV ]  │
│                                     │
│  [ Export Complete Scenario JSON ] │
└─────────────────────────────────────┘
```

**➡️ Azione:** Trova questo pannello (in fondo alla home)

---

### **STEP 3: Test Export #1 - Monthly Data**

1. **Click:** "Export Monthly Data" button
2. **Aspetta:** 1-2 secondi
3. **Verifica:** File appare in Downloads

```bash
# Check in Terminal:
ls -lh ~/Downloads/monthly-data-*.csv | tail -1
```

**✅ Expected:**
- Filename: `monthly-data-Base-Scenario-2025-10-16.csv`
- Size: ~50-100 KB
- Lines: 61 (header + 60 months)

**Columns expected:**
```
Month, Year, Quarter, Leads, Deals, Accounts Active, 
Recurring Revenue, CapEx Revenue, Total Revenue, COGS, 
Gross Margin, Scans Performed
```

**➡️ Test:** Apri file con Excel/Numbers e verifica dati

---

### **STEP 4: Test Export #2 - Annual Data**

1. **Click:** "Export Annual Data"
2. **Verifica:** `annual-data-Base-Scenario-2025-10-16.csv`

```bash
ls -lh ~/Downloads/annual-data-*.csv | tail -1
```

**✅ Expected:**
- Lines: 6 (header + 5 years)
- Columns: Year, Recurring Rev, CapEx Rev, Total Rev, COGS, Gross Margin, OPEX, EBITDA, ARR

---

### **STEP 5: Test Export #3 - Key KPIs**

1. **Click:** "Export Key KPIs"
2. **Verifica:** `kpis-Base-Scenario-2025-10-16.csv`

**✅ Expected:**
- Lines: 2 (header + 1 row di KPI)
- Metrics: ARR M24, ARR M60, Revenue Y1-Y5, EBITDA Y1-Y5, Break-Even Year, SOM %

---

### **STEP 6: Test Export #4 - Advanced Metrics**

1. **Click:** "Export Advanced Metrics"
2. **Verifica:** `advanced-metrics-Base-Scenario-2025-10-16.csv`

**✅ Expected:**
- Metrics: CAC, LTV, LTV/CAC Ratio, Break-Even Units, NPV, IRR, Burn Rate, Runway

---

### **STEP 7: Test Export #5 - Cash Flow**

1. **Click:** "Export Cash Flow"
2. **Verifica:** `cashflow-statements-Base-Scenario-2025-10-16.csv`

**✅ Expected:**
- Lines: 6 (header + 5 years)
- Columns: Operating CF, Investing CF, Financing CF, Net CF, Beginning/Ending Cash

---

### **STEP 8: Test Export #6 - Growth Metrics**

1. **Click:** "Export Growth Metrics"
2. **Verifica:** `growth-metrics-Base-Scenario-2025-10-16.csv`

**✅ Expected:**
- Metrics: Revenue CAGR, ARR CAGR, EBITDA CAGR, Rule of 40, YoY Growth Rates

---

### **STEP 9: Test Export #7 - Complete Scenario (JSON)**

1. **Click:** "Export Complete Scenario" (ultimo button, badge JSON)
2. **Verifica:** `complete-scenario-Base-Scenario-2025-10-16.json`

```bash
# Verifica JSON valido:
cat ~/Downloads/complete-scenario-*.json | jq . > /dev/null && echo "✅ Valid JSON"
```

**✅ Expected:**
- Size: ~500 KB - 2 MB
- Structure: scenario, exportDate, kpis, monthlyData, annualData, advancedMetrics, cashFlowStatements, growthMetrics

---

### **STEP 10: Test Altri Export (Optional)**

#### **Funnel GTM** (nella sezione GTM/Funnel)
1. Naviga alla sezione Funnel/GTM
2. Click "Esporta CSV" sotto la tabella mensile
3. Verifica: `eco3d-monthly-funnel.csv`

#### **Financials P&L/CF/BS** (nella sezione Financials)
1. Naviga alla sezione Financials
2. Ci dovrebbero essere 3 export per P&L, Cash Flow, Balance Sheet
3. Verifica: `eco3d-profit-loss.csv`, `eco3d-cash-flow.csv`, `eco3d-balance-sheet.csv`

---

## 🔍 VERIFICA COMPLETA

### **Automated Check**
```bash
# Esegui lo script di test:
cd /Users/dracs/Documents/START\ UP/DOC\ PROGETTI/DOC_ECO\ 3d\ Multisonda/__BP\ 2025/financial-dashboard
./test-exports.sh
```

### **Manual Check**
```bash
# Lista tutti gli export di oggi:
ls -lht ~/Downloads/ | grep $(date +%Y-%m-%d)

# Conta file export:
ls ~/Downloads/ | grep -E "(monthly-data|annual-data|kpis|advanced-metrics|cashflow|growth|scenario|eco3d)" | wc -l

# Apri ultimo export CSV:
open ~/Downloads/$(ls -t ~/Downloads/*.csv | head -1)

# Apri ultimo export JSON:
open ~/Downloads/$(ls -t ~/Downloads/*.json | head -1)
```

---

## ✅ CHECKLIST RAPIDA

```
Financial Dashboard Exports:
[ ] 1. Monthly Data (CSV)              → monthly-data-*.csv
[ ] 2. Annual Data (CSV)               → annual-data-*.csv
[ ] 3. Key KPIs (CSV)                  → kpis-*.csv
[ ] 4. Advanced Metrics (CSV)          → advanced-metrics-*.csv
[ ] 5. Cash Flow (CSV)                 → cashflow-statements-*.csv
[ ] 6. Growth Metrics (CSV)            → growth-metrics-*.csv
[ ] 7. Complete Scenario (JSON)        → complete-scenario-*.json

Optional Exports:
[ ] 8. Monthly Funnel (CSV)            → eco3d-monthly-funnel.csv
[ ] 9. Quarterly Summary (CSV)         → eco3d-quarterly-summary.csv
[ ] 10. Profit & Loss (CSV)            → eco3d-profit-loss.csv
[ ] 11. Cash Flow (CSV)                → eco3d-cash-flow.csv
[ ] 12. Balance Sheet (CSV)            → eco3d-balance-sheet.csv
[ ] 13. Scenario Comparison (CSV)      → scenario-comparison-*.csv
[ ] 14. Database Export (JSON)         → database-export-*.json

Total: ___/14 exports funzionanti
```

---

## 🐛 TROUBLESHOOTING

### **Export button non funziona**
```bash
# Check console browser (F12):
# Cerca errori JavaScript
```

### **File non appare in Downloads**
1. Verifica permessi cartella Downloads
2. Check browser settings (allow downloads)
3. Prova altro browser (Chrome vs Safari)

### **CSV si apre male in Excel**
1. Excel italiano: Dati → Da Testo/CSV → Delimitatore: virgola
2. Oppure: Import CSV in Google Sheets

### **JSON non è valido**
```bash
# Test validità:
cat ~/Downloads/[filename].json | jq .

# Se errore, check console browser
```

---

## 📊 QUALITY CHECKS

### **CSV Quality**
- [ ] Header row presente
- [ ] Separatore: virgola (`,`)
- [ ] Numeri: formato US (punto decimale)
- [ ] No valori: `undefined`, `NaN`, `null`
- [ ] UTF-8 encoding

### **JSON Quality**
- [ ] Valid JSON (parse OK)
- [ ] Indentato (pretty-print)
- [ ] Struttura completa
- [ ] No `undefined` (diventa `null` in JSON)

---

## 🎯 EXPECTED RESULTS

**Se tutto funziona:**
```bash
~/Downloads/
├── monthly-data-Base-Scenario-2025-10-16.csv        ✅
├── annual-data-Base-Scenario-2025-10-16.csv         ✅
├── kpis-Base-Scenario-2025-10-16.csv                ✅
├── advanced-metrics-Base-Scenario-2025-10-16.csv    ✅
├── cashflow-statements-Base-Scenario-2025-10-16.csv ✅
├── growth-metrics-Base-Scenario-2025-10-16.csv      ✅
├── complete-scenario-Base-Scenario-2025-10-16.json  ✅
├── eco3d-monthly-funnel.csv                         ✅
├── eco3d-quarterly-summary.csv                      ✅
├── eco3d-profit-loss.csv                            ✅
├── eco3d-cash-flow.csv                              ✅
├── eco3d-balance-sheet.csv                          ✅
├── scenario-comparison-2025-10-16.csv               ✅
└── database-export-2025-10-16.json                  ✅

Total: 14 files ✅
```

---

## 🚀 NEXT STEPS

**Dopo aver testato con successo:**
1. [ ] Segna tutti i checkbox sopra
2. [ ] Verifica quality checks
3. [ ] Esegui `./test-exports.sh` per report automatico
4. [ ] Se tutto OK → Procedi a implementazione Team Management exports

**Se ci sono problemi:**
1. Annota errori specifici
2. Check console browser
3. Verifica funzioni in `src/lib/exportUtils.ts`
4. Test con scenario diverso (Prudente/Ottimista)

---

## 📝 TEST REPORT TEMPLATE

```
Data test: __________
Tester: __________

Exports testati: ___/14
Successi: ___
Failures: ___

Issues riscontrati:
1. _____________________________________
2. _____________________________________
3. _____________________________________

Note:
_________________________________________
_________________________________________
_________________________________________

Status: [ ] PASS  [ ] FAIL  [ ] PARTIAL
```

---

**Pronto per iniziare il testing! 🚀**

Server: ✅ http://localhost:3000  
Script: ✅ `./test-exports.sh`  
Checklist: ✅ Sopra

**➡️ Prossima azione: Apri browser e inizia con STEP 1!**
