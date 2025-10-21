# ✅ CHECKLIST EXPORT TESTING

**Obiettivo:** Verificare che tutti gli export funzionino correttamente  
**Destinazione file:** `~/Downloads/`  
**Data:** 16 Ottobre 2025

---

## 🎯 SETUP INIZIALE

```bash
# 1. Verifica installazione librerie
npm list xlsx jspdf jspdf-autotable

# 2. Se mancanti, installa
npm install xlsx jspdf jspdf-autotable

# 3. Avvia server
npm run dev:all

# 4. Apri browser
open http://localhost:3000
```

---

## 📊 FINANCIAL DASHBOARD EXPORTS

### **URL di Test**
```
http://localhost:3000
```

### **Export da testare:**

#### 1. Monthly Data (CSV)
- [ ] Click "Export Monthly Data"
- [ ] Verifica file: `monthly-data-[scenario]-[date].csv` in Downloads
- [ ] Apri con Excel: 60 righe (mesi) visibili
- [ ] Colonne: Month, Year, Leads, Deals, Revenue, COGS, etc.
- [ ] Numeri formattati correttamente (no NaN, no undefined)

#### 2. Annual Data (CSV)
- [ ] Click "Export Annual Data"
- [ ] Verifica file: `annual-data-[scenario]-[date].csv`
- [ ] Apri con Excel: 5 righe (anni) visibili
- [ ] Colonne: Year, Recurring Rev, CapEx Rev, EBITDA, etc.

#### 3. KPIs (CSV)
- [ ] Click "Export Key KPIs"
- [ ] Verifica file: `kpis-[scenario]-[date].csv`
- [ ] 1 riga con tutti i KPI principali
- [ ] Metriche: ARR M24, ARR M60, Break-Even Year, SOM%, etc.

#### 4. Advanced Metrics (CSV)
- [ ] Click "Export Advanced Metrics"
- [ ] Verifica file: `advanced-metrics-[scenario]-[date].csv`
- [ ] Metriche: CAC, LTV, LTV/CAC Ratio, NPV, IRR, Burn Rate, etc.
- [ ] Valori numerici sensati (no infiniti, no negativi impossibili)

#### 5. Cash Flow (CSV)
- [ ] Click "Export Cash Flow"
- [ ] Verifica file: `cashflow-statements-[scenario]-[date].csv`
- [ ] 5 righe (cash flow annuali)
- [ ] Colonne: Operating CF, Investing CF, Financing CF, Net CF, etc.

#### 6. Growth Metrics (CSV)
- [ ] Click "Export Growth Metrics"
- [ ] Verifica file: `growth-metrics-[scenario]-[date].csv`
- [ ] Metriche: Revenue CAGR, ARR CAGR, Rule of 40, YoY Growth, etc.

#### 7. Complete Scenario (JSON)
- [ ] Click "Export Complete Scenario"
- [ ] Verifica file: `complete-scenario-[scenario]-[date].json`
- [ ] Apri con text editor: JSON valido (indentato)
- [ ] Contiene: kpis, monthlyData, annualData, advancedMetrics, etc.
- [ ] Dimensione: ~500KB - 2MB

---

## 👥 TEAM MANAGEMENT EXPORTS

### **URL di Test**
```
http://localhost:3000/team
```

### **Tab: Export**

#### 8. Quick Export - All to Excel
- [ ] Click "Export All to Excel"
- [ ] **⚠️ ATTUALMENTE:** Mostra animazione + messaggio success (simulato)
- [ ] **TODO:** Implementare export reale con `downloadExcelMultiSheet`
- [ ] **Dovrebbe generare:** `Complete_Report_Eco3D.xlsx` con 12 sheets

#### 9. Quick Export - All to PDF
- [ ] Click "Export All to PDF"
- [ ] **⚠️ ATTUALMENTE:** Simulato
- [ ] **TODO:** Implementare export reale con `downloadPDFMultiSection`
- [ ] **Dovrebbe generare:** `Complete_Report_Eco3D.pdf` multi-section

#### 10-21. Individual Module Exports
**⚠️ TUTTI SIMULATI - DA IMPLEMENTARE**

- [ ] WBS → Excel (dovrebbe: `wbs.xlsx`)
- [ ] WBS → PDF (dovrebbe: `wbs.pdf`)
- [ ] Gantt → Excel
- [ ] Gantt → PDF
- [ ] RBS → Excel
- [ ] RBS → PDF
- [ ] CBS → Excel
- [ ] CBS → PDF
- [ ] PBS → Excel
- [ ] PBS → PDF
- [ ] RAM → Excel
- [ ] RAM → PDF
- [ ] RACI → Excel
- [ ] RACI → PDF
- [ ] DoA → Excel
- [ ] DoA → PDF
- [ ] OKR → Excel
- [ ] OKR → PDF
- [ ] RAID → Excel
- [ ] RAID → PDF
- [ ] Decisions → Excel
- [ ] Decisions → PDF
- [ ] Team → Excel
- [ ] Team → PDF

---

## 🔍 QUALITY CHECKS

### **Per ogni export CSV:**
```bash
# 1. Verifica file non vuoto
ls -lh ~/Downloads/[filename].csv

# 2. Conta righe
wc -l ~/Downloads/[filename].csv

# 3. Visualizza primi 5 righe
head -5 ~/Downloads/[filename].csv

# 4. Apri con Excel/Numbers
open ~/Downloads/[filename].csv
```

**Checklist qualità CSV:**
- [ ] Header row presente
- [ ] Separatore: virgola (`,`)
- [ ] Encoding: UTF-8
- [ ] Numeri: formato US (punto decimale)
- [ ] Date: ISO format (YYYY-MM-DD)
- [ ] No valori: `undefined`, `NaN`, `null` visibili

---

### **Per export Excel (future):**
```bash
# Apri ultimo Excel generato
open ~/Downloads/$(ls -t ~/Downloads/*.xlsx | head -1)
```

**Checklist qualità Excel:**
- [ ] File si apre senza errori
- [ ] Sheet names corretti e leggibili
- [ ] Colonne auto-sized (no testo tagliato)
- [ ] Dati allineati correttamente (numeri a destra, testo a sinistra)
- [ ] No celle vuote in header row
- [ ] Multi-sheet se richiesto

---

### **Per export PDF (future):**
```bash
# Apri ultimo PDF generato
open ~/Downloads/$(ls -t ~/Downloads/*.pdf | head -1)
```

**Checklist qualità PDF:**
- [ ] File si apre senza errori
- [ ] Title visibile e leggibile
- [ ] Subtitle (se presente) visibile
- [ ] Tabella completa (non tagliata)
- [ ] Headers tabella: sfondo blu, testo bianco
- [ ] Alternating row colors
- [ ] Font size: minimo 8pt (leggibile)
- [ ] Footer: "Generated: [date] - Page X of Y"
- [ ] Layout: landscape se tabella larga
- [ ] Multi-section con page breaks (se multi-section)

---

### **Per export JSON:**
```bash
# Verifica JSON valido
cat ~/Downloads/[filename].json | jq . > /dev/null && echo "✅ Valid JSON"

# Visualizza struttura
cat ~/Downloads/[filename].json | jq 'keys'

# Verifica dimensione
du -h ~/Downloads/[filename].json
```

**Checklist qualità JSON:**
- [ ] Valid JSON (parse senza errori)
- [ ] Indentato (pretty-print)
- [ ] Struttura completa (scenario, kpis, monthlyData, etc.)
- [ ] No valori undefined (diventano null in JSON)
- [ ] Re-importabile (test import scenario)

---

## 🐛 ERRORI COMUNI

### **Errore: "Cannot find module 'xlsx'"**
```bash
# Fix
npm install xlsx jspdf jspdf-autotable
```

### **Errore: "downloadCSV is not exported"**
```bash
# Verifica che src/lib/utils.ts contenga:
export function downloadCSV(data: any[], filename: string): void { ... }
```

### **File non appare in Downloads**
- [ ] Check console browser (F12) per errori JavaScript
- [ ] Verifica che browser non blocchi download automatici
- [ ] Check permessi cartella Downloads
- [ ] Prova con browser diverso (Chrome vs Safari)

### **CSV si apre male in Excel**
- [ ] Verifica separatore: dovrebbe essere virgola (`,`)
- [ ] Verifica encoding: UTF-8
- [ ] Se Excel italiano: Dati → Da Testo/CSV → Delimitatore: virgola

### **Excel corrotto**
- [ ] Verifica che dati non contengano caratteri invalidi
- [ ] Check dimensione file (se 0 bytes → errore generazione)
- [ ] Prova ad aprire con Google Sheets
- [ ] Check console per errori durante export

### **PDF vuoto o tabella tagliata**
- [ ] Verifica che `data` array non sia vuoto
- [ ] Check numero colonne (max ~10 per landscape A4)
- [ ] Verifica startY position (min 35mm)
- [ ] Test con dati ridotti (meno righe/colonne)

---

## 📊 METRICHE ATTESE

**Export funzionanti (Financial Dashboard):**
- ✅ 7 CSV exports
- ✅ 1 JSON export
- **Totale: 8/8 funzionanti** (100%)

**Export da implementare (Team Management):**
- ⏳ 24 exports (12 moduli × 2 formati)
- **Stato: 0/24 implementati** (0%)

**Librerie pronte:**
- ✅ `downloadExcel()` - Single sheet
- ✅ `downloadExcelMultiSheet()` - Multi-sheet
- ✅ `downloadPDF()` - Single section
- ✅ `downloadPDFMultiSection()` - Multi-section

---

## 🚀 NEXT STEPS

### **Immediate (Priority 1)**
1. [ ] Testare tutti gli 8 export Financial Dashboard
2. [ ] Verificare qualità file generati
3. [ ] Documentare eventuali problemi

### **Short-term (Priority 2)**
4. [ ] Implementare Team Management exports
5. [ ] Sostituire `setTimeout` con chiamate reali a `downloadExcel/PDF`
6. [ ] Test completi 24 exports

### **Medium-term (Priority 3)**
7. [ ] Aggiungere progress indicators (loading spinner)
8. [ ] Excel: formule calcolate (variance, %, totali)
9. [ ] PDF: logo Eco 3D nell'header
10. [ ] PDF: table of contents per multi-section

---

## 📝 LOG TEST

**Data test:** _______________  
**Tester:** _______________

### **Risultati:**
```
Financial Dashboard:
- Monthly Data:        [ ] PASS  [ ] FAIL  Note: _________________
- Annual Data:         [ ] PASS  [ ] FAIL  Note: _________________
- KPIs:                [ ] PASS  [ ] FAIL  Note: _________________
- Advanced Metrics:    [ ] PASS  [ ] FAIL  Note: _________________
- Cash Flow:           [ ] PASS  [ ] FAIL  Note: _________________
- Growth Metrics:      [ ] PASS  [ ] FAIL  Note: _________________
- Complete Scenario:   [ ] PASS  [ ] FAIL  Note: _________________

Team Management:
- All to Excel:        [ ] PASS  [ ] FAIL  Note: _________________
- All to PDF:          [ ] PASS  [ ] FAIL  Note: _________________
- Individual modules:  [ ] PASS  [ ] FAIL  Note: _________________
```

### **Issues riscontrati:**
```
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________
```

### **File generati (samples):**
```bash
# Copia samples in cartella test
mkdir -p test-exports
cp ~/Downloads/monthly-data-*.csv test-exports/
cp ~/Downloads/complete-scenario-*.json test-exports/
ls -lh test-exports/
```

---

**Test completato:** [ ] SÌ  [ ] NO  
**Tutti export funzionanti:** [ ] SÌ  [ ] NO  
**Pronto per production:** [ ] SÌ  [ ] NO

---

*Checklist creata: 16 Ottobre 2025*
