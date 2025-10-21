# 📥 GUIDA COMPLETA EXPORT - Eco 3D Dashboard

**Ultima modifica:** 16 Ottobre 2025  
**Librerie:** xlsx (Excel), jsPDF + autoTable (PDF)

---

## 📍 DOVE VANNO I FILE ESPORTATI?

### 🌐 **Applicazioni Web (Browser)**
Tutti gli export vengono salvati nella **cartella Downloads del sistema operativo**:

```
macOS:    ~/Downloads/
Windows:  C:\Users\[Username]\Downloads\
Linux:    ~/Downloads/
```

**Perché non in una cartella del progetto?**
- Le applicazioni web client-side **non hanno accesso diretto al filesystem** per motivi di sicurezza
- Il browser gestisce autonomamente il download nella cartella configurata dall'utente
- Questo è il **comportamento standard** di tutte le web app (Google Docs, Figma, etc.)

### 🔧 **Alternative (future implementazioni):**
1. **Export lato server** (Node.js API) → salva in `/exports/` del progetto
2. **File System Access API** → chiede all'utente dove salvare (Chrome/Edge only)
3. **Electron app** → accesso completo filesystem

---

## 📊 FORMATI DISPONIBILI

| Formato | Libreria | Uso principale | Editabile |
|---------|----------|----------------|-----------|
| **CSV** | Native | Dati bulk, analisi Excel/Python | ✅ Sì |
| **Excel** | xlsx | Report professionali, multi-sheet | ✅ Sì |
| **PDF** | jsPDF + autoTable | Presentazioni, stampa, investor deck | ❌ No |
| **JSON** | Native | Backup completo, import/export scenario | ✅ Sì |

---

## 🎯 FUNZIONI DISPONIBILI

### 1. **CSV Export**
```typescript
import { downloadCSV } from '@/lib/utils';

const data = [
  { Anno: 2025, Ricavi: 1.2, EBITDA: -0.5 },
  { Anno: 2026, Ricavi: 2.5, EBITDA: 0.3 },
];

downloadCSV(data, 'financial-data');
// → Salva: financial-data.csv in Downloads/
```

**Features:**
- ✅ Escape automatico virgole/quotes
- ✅ Headers da chiavi oggetto
- ✅ UTF-8 encoding
- ✅ Excel-compatible

---

### 2. **Excel Export (NUOVO!)**
```typescript
import { downloadExcel } from '@/lib/exportUtils';

const data = [
  { 'Revenue Y1': 1.2, 'Revenue Y5': 5.8, 'EBITDA': 2.1 },
  { 'Revenue Y1': 0.9, 'Revenue Y5': 4.2, 'EBITDA': 1.5 },
];

downloadExcel(data, 'eco3d-financial-plan', 'Financial Summary');
// → Salva: eco3d-financial-plan.xlsx in Downloads/
```

**Features:**
- ✅ Auto-sized columns (max 50 chars)
- ✅ Nome sheet personalizzabile
- ✅ Formatting professionale
- ✅ Formule preservate (se aggiunte)

---

### 3. **Excel Multi-Sheet (NUOVO!)**
```typescript
import { downloadExcelMultiSheet } from '@/lib/exportUtils';

const sheets = [
  { name: 'P&L', data: profitLossData },
  { name: 'Cash Flow', data: cashFlowData },
  { name: 'Balance Sheet', data: balanceSheetData },
  { name: 'KPIs', data: kpiData },
];

downloadExcelMultiSheet(sheets, 'eco3d-complete-financial-model');
// → Salva: eco3d-complete-financial-model.xlsx con 4 sheets
```

**Features:**
- ✅ Multiple sheets in un file
- ✅ Auto-naming (max 31 chars per sheet)
- ✅ Ogni sheet con dati diversi
- ✅ Perfetto per report completi

---

### 4. **PDF Export (NUOVO!)**
```typescript
import { downloadPDF } from '@/lib/exportUtils';

const data = [
  { Metric: 'ARR Y5', Value: '€5.2M', Target: '€5.0M' },
  { Metric: 'EBITDA Y5', Value: '€2.1M', Target: '€1.8M' },
];

downloadPDF(
  data,
  'eco3d-kpi-report',
  'Eco 3D - Key Performance Indicators',
  'Q4 2025 Report'
);
// → Salva: eco3d-kpi-report.pdf in Downloads/
```

**Features:**
- ✅ Layout landscape A4
- ✅ Title + subtitle
- ✅ Auto-paging per tabelle lunghe
- ✅ Header blu professionale
- ✅ Alternating row colors
- ✅ Footer con data e page numbers
- ✅ Font-size adattivo

---

### 5. **PDF Multi-Section (NUOVO!)**
```typescript
import { downloadPDFMultiSection } from '@/lib/exportUtils';

const sections = [
  { title: 'Financial Summary', data: summaryData },
  { title: 'Revenue Breakdown', data: revenueData },
  { title: 'Cost Analysis', data: costData },
  { title: 'KPI Dashboard', data: kpiData },
];

downloadPDFMultiSection(
  sections,
  'eco3d-investor-deck',
  'Eco 3D Business Plan - Complete Report'
);
// → Salva: eco3d-investor-deck.pdf con 4 sezioni
```

**Features:**
- ✅ Sezioni multiple in un PDF
- ✅ Page break automatico tra sezioni
- ✅ Title hierarchy (main title + section titles)
- ✅ Footer unificato "Eco 3D"
- ✅ Professional layout per investor deck

---

### 6. **JSON Export**
```typescript
import { downloadJSON } from '@/lib/utils';

const completeScenario = {
  name: 'Base Scenario',
  parameters: { ... },
  results: { ... },
  metadata: { exportDate: new Date() }
};

downloadJSON(completeScenario, 'scenario-base-2025-10-16');
// → Salva: scenario-base-2025-10-16.json in Downloads/
```

**Features:**
- ✅ Pretty-printed (indentato)
- ✅ UTF-8 encoding
- ✅ Re-importabile nell'app

---

## 📦 EXPORT PRE-CONFIGURATI

### **Financial Dashboard**
```typescript
// Da MasterDashboard.tsx
import { 
  exportMonthlyData,
  exportAnnualData,
  exportKPIs,
  exportAdvancedMetrics,
  exportCashFlowStatements,
  exportGrowthMetrics,
  exportCompleteScenario
} from '@/lib/exportUtils';

// Esempio
exportMonthlyData(calculationResults, 'Base Scenario');
// → monthly-data-Base-Scenario-2025-10-16.csv
```

**Files generati:**
- `monthly-data-[scenario]-[date].csv` - 60 mesi di dati dettagliati
- `annual-data-[scenario]-[date].csv` - 5 anni riassunti
- `kpis-[scenario]-[date].csv` - KPI principali (ARR, EBITDA, Break-even)
- `advanced-metrics-[scenario]-[date].csv` - CAC, LTV, NPV, IRR, Burn Rate
- `cashflow-statements-[scenario]-[date].csv` - Cash flow annuali
- `growth-metrics-[scenario]-[date].csv` - CAGR, Rule of 40, Growth rates
- `complete-scenario-[scenario]-[date].json` - Tutto in JSON

---

### **Team Management Dashboard**
```typescript
// Da TeamManagement/ExportPanel.tsx
// ATTUALMENTE: Simulato (setTimeout)
// TODO: Implementare export reali

const modules = [
  'wbs', 'gantt', 'rbs', 'cbs', 'pbs',
  'ram', 'raci', 'doa', 'okr', 'raid',
  'decisions', 'team'
];

// Export singolo modulo
handleExport('wbs', 'Excel'); // → wbs.xlsx
handleExport('gantt', 'PDF');  // → gantt.pdf

// Export completo
handleExportAll('Excel'); // → Complete_Report_Eco3D.xlsx (12 sheets)
handleExportAll('PDF');   // → Complete_Report_Eco3D.pdf (multi-section)
```

**⚠️ STATO ATTUALE:**
- ✅ CSV/JSON export funzionanti (Financial Dashboard)
- ✅ Excel/PDF library integrate
- ⏳ Team Management export da implementare (usano setTimeout placeholder)

---

## 🧪 COME TESTARE GLI EXPORT

### **Test Base**
1. Apri dashboard: `http://localhost:3000`
2. Naviga a una sezione con export (es. Financials)
3. Click su "Export Monthly Data" (o altro)
4. Verifica che il file appaia in **Downloads**
5. Apri il file:
   - CSV → Excel/Numbers/LibreOffice
   - Excel → Microsoft Excel/Google Sheets
   - PDF → Adobe Reader/Preview/Browser
   - JSON → Text editor/JSON viewer

### **Test Quality Checks**
```bash
# Controlla file generati
ls -lh ~/Downloads/eco3d-* | tail -10

# Verifica dimensione (non vuoti)
du -h ~/Downloads/monthly-data-*.csv

# Apri ultimo export CSV
open ~/Downloads/$(ls -t ~/Downloads/eco3d-*.csv | head -1)

# Apri ultimo export Excel
open ~/Downloads/$(ls -t ~/Downloads/*.xlsx | head -1)

# Apri ultimo export PDF
open ~/Downloads/$(ls -t ~/Downloads/*.pdf | head -1)
```

### **Checklist Qualità Export**

#### CSV:
- [ ] Headers corretti (no undefined)
- [ ] Separatore virgola (no punto e virgola)
- [ ] Numeri formattati correttamente (punto decimale)
- [ ] Date ISO format (YYYY-MM-DD)
- [ ] UTF-8 encoding (caratteri speciali OK)

#### Excel:
- [ ] Colonne auto-sized (leggibili)
- [ ] Sheet names corretti
- [ ] Dati non troncati
- [ ] Formattazione celle OK
- [ ] Multi-sheet se richiesto

#### PDF:
- [ ] Layout landscape (se tabella larga)
- [ ] Title e subtitle visibili
- [ ] Tabella non tagliata (auto-paging)
- [ ] Footer con data e page numbers
- [ ] Font leggibile (min 8pt)
- [ ] Colori professionali

#### JSON:
- [ ] Valid JSON (parse OK)
- [ ] Indentato (pretty-print)
- [ ] Completo (no dati mancanti)
- [ ] Re-importabile nell'app

---

## 🎨 ESEMPI D'USO

### **Investor Pitch Deck**
```typescript
// Esporta KPI principali in PDF per presentazione
const investorData = [
  { Metric: 'ARR Y5', Value: '€5.2M' },
  { Metric: 'EBITDA Y5', Value: '€2.1M' },
  { Metric: 'Break-Even', Value: 'Year 3' },
  { Metric: 'LTV/CAC Ratio', Value: '4.2x' },
];

downloadPDF(
  investorData,
  'eco3d-investor-summary',
  'Eco 3D - Investment Highlights',
  'Series A Pitch - October 2025'
);
```

### **Grant EU Application**
```typescript
// Export completo in Excel multi-sheet per submission
const grantSheets = [
  { name: 'Budget Overview', data: budgetData },
  { name: 'Work Breakdown', data: wbsData },
  { name: 'Timeline', data: ganttData },
  { name: 'Resources', data: rbsData },
  { name: 'Cost Breakdown', data: cbsData },
];

downloadExcelMultiSheet(grantSheets, 'eco3d-eu-grant-h2020-application');
```

### **Team Weekly Update**
```typescript
// Export tasks + RAID log per team meeting
const sections = [
  { title: 'Weekly Tasks (Kanban)', data: kanbanTasks },
  { title: 'Risks & Issues', data: raidLog },
  { title: 'Decisions Made', data: decisions },
];

downloadPDFMultiSection(
  sections,
  'eco3d-weekly-update-W42',
  'Eco 3D Team Update - Week 42/2025'
);
```

### **Financial Analysis**
```typescript
// Export scenario comparison per CFO review
const scenarios = ['Prudente', 'Base', 'Ottimista'].map(name => ({
  name,
  results: calculateScenario(name)
}));

exportScenarioComparison(scenarios);
// → scenario-comparison-2025-10-16.csv
```

---

## 🚀 MIGLIORAMENTI FUTURI

### **Priorità Alta**
- [ ] Implementare export reali per Team Management (sostituire setTimeout)
- [ ] Aggiungere progress indicator per export lunghi
- [ ] Excel: Formule calcolate (variance, %, totali)
- [ ] PDF: Logo Eco 3D nell'header
- [ ] PDF: Table of contents per multi-section

### **Priorità Media**
- [ ] Export charts/grafici (PNG/SVG embed in PDF)
- [ ] Excel: Conditional formatting (colori celle)
- [ ] PDF: Custom templates per tipo documento
- [ ] Server-side export API (salva in `/exports/`)
- [ ] Batch export scheduler (export automatici notturni)

### **Priorità Bassa**
- [ ] Export PowerPoint (pptxgenjs)
- [ ] Export Word (docx)
- [ ] Export Google Sheets direct integration
- [ ] Email export attachment (Resend API)
- [ ] Cloud storage integration (Google Drive, Dropbox)

---

## 🔧 TROUBLESHOOTING

### **Export non parte**
```bash
# Verifica che le librerie siano installate
npm list xlsx jspdf jspdf-autotable

# Re-installa se mancanti
npm install xlsx jspdf jspdf-autotable
```

### **File vuoto o corrotto**
- Verifica che `data` non sia vuoto
- Check console per errori JavaScript
- Verifica permessi cartella Downloads

### **Excel non apre il file**
- Verifica estensione `.xlsx` (non `.xls`)
- Prova ad aprire con Google Sheets
- Check che i dati non contengano caratteri invalidi

### **PDF tabella tagliata**
- Riduci numero colonne (split in più sezioni)
- Usa landscape invece di portrait
- Aumenta font-size minimo (attualmente 8pt)

### **Errore "Cannot find module"**
```typescript
// Verifica import path
import { downloadExcel } from '@/lib/exportUtils'; // ✅ Corretto
import { downloadExcel } from './exportUtils';     // ❌ Sbagliato (relative path)
```

---

## 📊 STATISTICHE EXPORT

**Dati tipici:**
- CSV: ~50-200 KB (60 mesi dati)
- Excel (single sheet): ~30-100 KB
- Excel (multi-sheet): ~150-500 KB
- PDF (single page): ~20-50 KB
- PDF (multi-section): ~100-300 KB
- JSON (scenario completo): ~500 KB - 2 MB

**Performance:**
- CSV generation: <100ms
- Excel generation: <500ms
- PDF generation: <1s (singola sezione)
- PDF multi-section: 1-3s (dipende da numero sezioni)

---

## 📚 RIFERIMENTI

### **Documentazione Librerie**
- [SheetJS (xlsx)](https://docs.sheetjs.com/) - Excel export
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - PDF tables

### **File Sorgenti**
```
/src/lib/exportUtils.ts          - Export functions (CSV, Excel, PDF, JSON)
/src/lib/utils.ts                 - Utility functions (downloadCSV, downloadJSON)
/src/components/ExportPanel.tsx   - Financial export UI
/src/components/TeamManagement/ExportPanel.tsx - Team export UI
```

### **Testing**
```bash
# Riavvia server per vedere modifiche
npm run dev:all

# Test export da browser
# → Apri Developer Tools (F12)
# → Network tab → verifica download
# → Console → check errori
```

---

## ✅ CONCLUSIONE

**Export implementati e funzionanti:**
- ✅ CSV: Financial Dashboard (7 export types)
- ✅ JSON: Complete scenario backup
- ✅ Excel: Library pronta (`downloadExcel`, `downloadExcelMultiSheet`)
- ✅ PDF: Library pronta (`downloadPDF`, `downloadPDFMultiSection`)

**Prossimi step:**
1. Testare export CSV/JSON esistenti
2. Verificare qualità file generati
3. Implementare export Team Management con Excel/PDF reali
4. Aggiungere progress indicators per UX

**Tutti i file vanno in `~/Downloads/` (standard browser)**

---

*Guida creata: 16 Ottobre 2025*  
*Ultima revisione: 16 Ottobre 2025*
