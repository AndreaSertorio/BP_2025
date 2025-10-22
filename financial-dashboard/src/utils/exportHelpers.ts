/**
 * Export Helpers - Funzioni per esportare dati in vari formati
 */

import * as XLSX from 'xlsx';
import type { AnnualCalculation, MonthlyCalculation } from '@/types/financialPlan.types';

// ============================================================================
// EXCEL EXPORTS
// ============================================================================

/**
 * Export completo Piano Finanziario in Excel
 */
export function exportCompleteExcel(
  annualData: AnnualCalculation[],
  monthlyData: MonthlyCalculation[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: P&L Annuale
  const plData = annualData.map(year => ({
    'Anno': year.year,
    'Revenue HW': year.hardwareRevenue,
    'Revenue SaaS': year.saasRevenue,
    'Revenue Totale': year.totalRevenue,
    'COGS': year.totalCOGS,
    'Gross Profit': year.grossProfit,
    'OPEX': year.totalOPEX,
    'EBITDA': year.ebitda,
    'EBIT': year.ebit,
    'Net Income': year.netIncome,
    'Gross Margin %': year.grossMarginPercent,
    'EBITDA Margin %': year.ebitdaMarginPercent,
    'Net Margin %': year.netMarginPercent
  }));
  const wspl = XLSX.utils.json_to_sheet(plData);
  XLSX.utils.book_append_sheet(wb, wspl, 'P&L Annuale');

  // Sheet 2: Cash Flow Annuale
  const cfData = annualData.map(year => ({
    'Anno': year.year,
    'OCF': year.cashFlow.operations,
    'ICF': year.cashFlow.investing,
    'FCF': year.cashFlow.financing,
    'Net Cash Flow': year.cashFlow.netCashFlow,
    'Cash Balance': year.cashFlow.endingCash,
    'Net Income': year.netIncome
  }));
  const wscf = XLSX.utils.json_to_sheet(cfData);
  XLSX.utils.book_append_sheet(wb, wscf, 'Cash Flow');

  // Sheet 3: Balance Sheet Annuale
  const bsData = annualData.map(year => ({
    'Anno': year.year,
    'Cash': year.balanceSheet.assets.cash,
    'AR': year.balanceSheet.assets.accountsReceivable,
    'Inventory': year.balanceSheet.assets.inventory,
    'PPE Net': year.balanceSheet.assets.netPPE,
    'Total Assets': year.balanceSheet.assets.totalAssets,
    'AP': year.balanceSheet.liabilities.accountsPayable,
    'Debt': year.balanceSheet.liabilities.debt,
    'Total Liabilities': year.balanceSheet.liabilities.totalLiabilities,
    'Equity': year.balanceSheet.equity.totalEquity
  }));
  const wsbs = XLSX.utils.json_to_sheet(bsData);
  XLSX.utils.book_append_sheet(wb, wsbs, 'Balance Sheet');

  // Sheet 4: Metrics Annuali
  const metricsData = annualData.map(year => ({
    'Anno': year.year,
    'Revenue': year.totalRevenue,
    'Gross Profit': year.grossProfit,
    'EBITDA': year.ebitda,
    'Net Income': year.netIncome,
    'Cash Balance': year.cashBalance,
    'Avg Burn Rate': year.metrics.averageBurnRate,
    'Avg Runway': year.metrics.averageRunway
  }));
  const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metrics');

  // Download
  XLSX.writeFile(wb, `Eco3D_Piano_Finanziario_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export Executive Summary
 */
export function exportExecutiveSummary(annualData: AnnualCalculation[]) {
  const wb = XLSX.utils.book_new();

  // Summary degli anni principali
  const summaryYears = annualData.filter((_, idx) => [0, 2, 4, 9].includes(idx)); // Y1, Y3, Y5, Y10
  
  const summaryData = summaryYears.map(year => ({
    'Anno': year.year,
    'Revenue': year.totalRevenue,
    'EBITDA': year.ebitda,
    'Net Income': year.netIncome,
    'Cash Balance': year.cashBalance,
    'Gross Margin %': year.grossMarginPercent,
    'EBITDA Margin %': year.ebitdaMarginPercent
  }));

  const ws = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, 'Executive Summary');

  // KPI Card
  const totalRevenue = annualData.reduce((sum, y) => sum + y.totalRevenue, 0);
  const avgEbitdaMargin = annualData.reduce((sum, y) => sum + y.ebitdaMarginPercent, 0) / annualData.length;
  const finalCash = annualData[annualData.length - 1]?.cashBalance || 0;

  const kpiData = [
    { 'KPI': 'Revenue Totale 10Y', 'Valore': totalRevenue },
    { 'KPI': 'EBITDA Margin Medio', 'Valore': avgEbitdaMargin },
    { 'KPI': 'Cash Finale (Y10)', 'Valore': finalCash },
    { 'KPI': 'Break-Even Year', 'Valore': annualData.find(y => y.ebitda > 0)?.year || 'N/A' }
  ];

  const wsKpi = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI');

  XLSX.writeFile(wb, `Eco3D_Executive_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export Monthly Projections
 */
export function exportMonthlyProjections(monthlyData: MonthlyCalculation[]) {
  const wb = XLSX.utils.book_new();

  const data = monthlyData.map(month => ({
    'Mese': month.month,
    'Anno': month.year,
    'Revenue': month.totalRevenue || 0,
    'Gross Profit': month.grossProfit || 0,
    'EBITDA': month.ebitda || 0,
    'Net Income': month.netIncome || 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Data');

  XLSX.writeFile(wb, `Eco3D_Monthly_Projections_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export Investor Package
 */
export function exportInvestorPackage(annualData: AnnualCalculation[]) {
  const wb = XLSX.utils.book_new();

  // Revenue & Growth
  const revenueData = annualData.map(year => ({
    'Anno': year.year,
    'Total Revenue': year.totalRevenue,
    'HW Revenue': year.hardwareRevenue,
    'SaaS Revenue': year.saasRevenue
  }));
  const wsRev = XLSX.utils.json_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue');

  // Profitability
  const profitData = annualData.map(year => ({
    'Anno': year.year,
    'Gross Profit': year.grossProfit,
    'EBITDA': year.ebitda,
    'Net Income': year.netIncome,
    'Gross Margin %': year.grossMarginPercent,
    'EBITDA Margin %': year.ebitdaMarginPercent,
    'Net Margin %': year.netMarginPercent
  }));
  const wsProfit = XLSX.utils.json_to_sheet(profitData);
  XLSX.utils.book_append_sheet(wb, wsProfit, 'Profitability');

  // Unit Economics
  const unitEcon = annualData.map(year => ({
    'Anno': year.year,
    'EBITDA': year.ebitda,
    'Net Income': year.netIncome,
    'Cash Balance': year.cashBalance
  }));
  const wsUnit = XLSX.utils.json_to_sheet(unitEcon);
  XLSX.utils.book_append_sheet(wb, wsUnit, 'Unit Economics');

  XLSX.writeFile(wb, `Eco3D_Investor_Package_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ============================================================================
// JSON EXPORT
// ============================================================================

export function exportJSON(
  annualData: AnnualCalculation[],
  monthlyData: MonthlyCalculation[],
  financialPlan: any
) {
  const data = {
    exportDate: new Date().toISOString(),
    financialPlan,
    projections: {
      annual: annualData,
      monthly: monthlyData
    },
    summary: {
      totalRevenue10Y: annualData.reduce((sum, y) => sum + y.totalRevenue, 0),
      avgEbitdaMargin: annualData.reduce((sum, y) => sum + y.ebitdaMarginPercent, 0) / annualData.length,
      finalCashBalance: annualData[annualData.length - 1]?.cashBalance || 0,
      breakEvenYear: annualData.find(y => y.ebitda > 0)?.year || null
    }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Eco3D_Financial_Data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export function exportCSV(annualData: AnnualCalculation[], monthlyData: MonthlyCalculation[]) {
  // Annual CSV
  const annualHeaders = [
    'Anno', 'Revenue_Totale', 'Revenue_HW', 'Revenue_SaaS', 'COGS', 'Gross_Profit',
    'OPEX', 'EBITDA', 'Net_Income', 'OCF', 'ICF', 'FCF', 'Cash_Balance',
    'Gross_Margin_%', 'EBITDA_Margin_%', 'Net_Margin_%', 'Growth_Rate_%'
  ];

  const annualRows = annualData.map(year => [
    year.year,
    year.totalRevenue,
    year.hardwareRevenue,
    year.saasRevenue,
    year.totalCOGS,
    year.grossProfit,
    year.totalOPEX,
    year.ebitda,
    year.netIncome,
    year.cashFlow.operations,
    year.cashFlow.investing,
    year.cashFlow.financing,
    year.cashBalance,
    year.grossMarginPercent,
    year.ebitdaMarginPercent,
    year.netMarginPercent,
    0
  ]);

  const annualCSV = [
    annualHeaders.join(','),
    ...annualRows.map(row => row.join(','))
  ].join('\n');

  // Download Annual CSV
  const blobAnnual = new Blob([annualCSV], { type: 'text/csv;charset=utf-8;' });
  const urlAnnual = URL.createObjectURL(blobAnnual);
  const aAnnual = document.createElement('a');
  aAnnual.href = urlAnnual;
  aAnnual.download = `Eco3D_Annual_Data_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(aAnnual);
  aAnnual.click();
  document.body.removeChild(aAnnual);
  URL.revokeObjectURL(urlAnnual);

  // Monthly CSV
  const monthlyHeaders = [
    'Mese', 'Anno', 'Revenue', 'COGS', 'Gross_Profit', 'OPEX', 'EBITDA',
    'Net_Income', 'OCF', 'Cash_Balance'
  ];

  const monthlyRows = monthlyData.map(month => [
    month.month,
    month.year,
    month.totalRevenue || 0,
    month.totalCOGS || 0,
    month.grossProfit || 0,
    month.opex?.total || 0,
    month.ebitda || 0,
    month.netIncome || 0,
    month.cashFlow?.operations?.total || 0,
    month.cashFlow?.cashBalance || 0
  ]);

  const monthlyCSV = [
    monthlyHeaders.join(','),
    ...monthlyRows.map(row => row.join(','))
  ].join('\n');

  // Download Monthly CSV (con delay per evitare conflitti)
  setTimeout(() => {
    const blobMonthly = new Blob([monthlyCSV], { type: 'text/csv;charset=utf-8;' });
    const urlMonthly = URL.createObjectURL(blobMonthly);
    const aMonthly = document.createElement('a');
    aMonthly.href = urlMonthly;
    aMonthly.download = `Eco3D_Monthly_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(aMonthly);
    aMonthly.click();
    document.body.removeChild(aMonthly);
    URL.revokeObjectURL(urlMonthly);
  }, 500);
}

// ============================================================================
// PDF EXPORT
// ============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportPDF(type: string, annualData: AnnualCalculation[]) {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('it-IT');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Eco 3D - Piano Finanziario', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generato il: ${date}`, 14, 28);
  
  switch (type) {
    case 'report':
      exportBusinessPlanReport(doc, annualData);
      break;
    case 'dashboard':
      exportDashboardSnapshot(doc, annualData);
      break;
    case 'deck':
      exportInvestorDeckPDF(doc, annualData);
      break;
    case 'statements':
      exportFinancialStatements(doc, annualData);
      break;
    default:
      exportBusinessPlanReport(doc, annualData);
  }
}

// Business Plan Report PDF
function exportBusinessPlanReport(doc: jsPDF, annualData: AnnualCalculation[]) {
  let yPos = 40;
  
  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;
  
  const totalRevenue = annualData.reduce((sum, y) => sum + y.totalRevenue, 0);
  const avgEbitda = annualData.reduce((sum, y) => sum + y.ebitdaMarginPercent, 0) / annualData.length;
  const finalCash = annualData[annualData.length - 1]?.cashBalance || 0;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`• Revenue Totale (10Y): €${(totalRevenue / 1000000).toFixed(2)}M`, 14, yPos);
  yPos += 7;
  doc.text(`• EBITDA Margin Medio: ${avgEbitda.toFixed(1)}%`, 14, yPos);
  yPos += 7;
  doc.text(`• Cash Balance Finale: €${(finalCash / 1000000).toFixed(2)}M`, 14, yPos);
  yPos += 15;
  
  // P&L Table
  doc.setFontSize(14);
  doc.setTextColor(33, 150, 243);
  doc.text('Conto Economico (P&L)', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Anno', 'Revenue (€M)', 'EBITDA (€M)', 'Net Income (€M)', 'EBITDA %']],
    body: annualData.map(year => [
      year.year.toString(),
      (year.totalRevenue / 1000000).toFixed(2),
      (year.ebitda / 1000000).toFixed(2),
      (year.netIncome / 1000000).toFixed(2),
      year.ebitdaMarginPercent.toFixed(1) + '%'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [33, 150, 243] },
    styles: { fontSize: 9 }
  });
  
  // Cash Flow Table (nuova pagina)
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setTextColor(33, 150, 243);
  doc.text('Cash Flow', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Anno', 'OCF (€M)', 'ICF (€M)', 'FCF (€M)', 'Cash Balance (€M)']],
    body: annualData.map(year => [
      year.year.toString(),
      (year.cashFlow.operations / 1000000).toFixed(2),
      (year.cashFlow.investing / 1000000).toFixed(2),
      (year.cashFlow.financing / 1000000).toFixed(2),
      (year.cashBalance / 1000000).toFixed(2)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [76, 175, 80] },
    styles: { fontSize: 9 }
  });
  
  doc.save(`Eco3D_Business_Plan_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Dashboard Snapshot PDF
function exportDashboardSnapshot(doc: jsPDF, annualData: AnnualCalculation[]) {
  let yPos = 40;
  
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text('Dashboard Snapshot', 14, yPos);
  yPos += 15;
  
  // KPI Cards
  const kpis = [
    { label: 'Total Revenue (10Y)', value: `€${(annualData.reduce((s, y) => s + y.totalRevenue, 0) / 1000000).toFixed(1)}M` },
    { label: 'Avg EBITDA Margin', value: `${(annualData.reduce((s, y) => s + y.ebitdaMarginPercent, 0) / annualData.length).toFixed(1)}%` },
    { label: 'Final Cash', value: `€${(annualData[annualData.length - 1]?.cashBalance / 1000000).toFixed(1)}M` },
    { label: 'Break-Even Year', value: annualData.find(y => y.ebitda > 0)?.year.toString() || 'N/A' }
  ];
  
  doc.setFontSize(12);
  kpis.forEach(kpi => {
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, 14, yPos);
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text(kpi.value, 14, yPos + 7);
    yPos += 20;
    doc.setFontSize(12);
  });
  
  // Trend Table
  yPos += 10;
  autoTable(doc, {
    startY: yPos,
    head: [['Metrica', 'Y1', 'Y3', 'Y5', 'Y10']],
    body: [
      ['Revenue (€M)', 
        (annualData[0]?.totalRevenue / 1000000).toFixed(1),
        (annualData[2]?.totalRevenue / 1000000).toFixed(1),
        (annualData[4]?.totalRevenue / 1000000).toFixed(1),
        (annualData[9]?.totalRevenue / 1000000).toFixed(1)
      ],
      ['EBITDA %',
        annualData[0]?.ebitdaMarginPercent.toFixed(1) + '%',
        annualData[2]?.ebitdaMarginPercent.toFixed(1) + '%',
        annualData[4]?.ebitdaMarginPercent.toFixed(1) + '%',
        annualData[9]?.ebitdaMarginPercent.toFixed(1) + '%'
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243] }
  });
  
  doc.save(`Eco3D_Dashboard_Snapshot_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Investor Deck PDF
function exportInvestorDeckPDF(doc: jsPDF, annualData: AnnualCalculation[]) {
  // Slide 1: Cover
  doc.setFontSize(24);
  doc.setTextColor(33, 150, 243);
  doc.text('Eco 3D', 105, 100, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('Piano Finanziario Investor Deck', 105, 115, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('it-IT'), 105, 130, { align: 'center' });
  
  // Slide 2: Revenue Growth
  doc.addPage();
  let yPos = 30;
  
  doc.setFontSize(18);
  doc.setTextColor(33, 150, 243);
  doc.text('Revenue Growth', 14, yPos);
  yPos += 15;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Anno', 'HW Revenue (€M)', 'SaaS Revenue (€M)', 'Total (€M)']],
    body: annualData.map(y => [
      y.year.toString(),
      (y.hardwareRevenue / 1000000).toFixed(2),
      (y.saasRevenue / 1000000).toFixed(2),
      (y.totalRevenue / 1000000).toFixed(2)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [33, 150, 243] }
  });
  
  // Slide 3: Profitability
  doc.addPage();
  yPos = 30;
  
  doc.setFontSize(18);
  doc.setTextColor(33, 150, 243);
  doc.text('Profitability', 14, yPos);
  yPos += 15;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Anno', 'Gross Profit (€M)', 'EBITDA (€M)', 'Net Income (€M)']],
    body: annualData.map(y => [
      y.year.toString(),
      (y.grossProfit / 1000000).toFixed(2),
      (y.ebitda / 1000000).toFixed(2),
      (y.netIncome / 1000000).toFixed(2)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [76, 175, 80] }
  });
  
  doc.save(`Eco3D_Investor_Deck_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Financial Statements PDF
function exportFinancialStatements(doc: jsPDF, annualData: AnnualCalculation[]) {
  let yPos = 40;
  
  doc.setFontSize(16);
  doc.setTextColor(33, 150, 243);
  doc.text('Financial Statements', 14, yPos);
  yPos += 15;
  
  // P&L
  doc.setFontSize(12);
  doc.text('Conto Economico', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']],
    body: [
      ['Revenue', ...annualData.slice(0, 5).map(y => (y.totalRevenue / 1000).toFixed(0) + 'k')],
      ['COGS', ...annualData.slice(0, 5).map(y => (y.totalCOGS / 1000).toFixed(0) + 'k')],
      ['Gross Profit', ...annualData.slice(0, 5).map(y => (y.grossProfit / 1000).toFixed(0) + 'k')],
      ['OPEX', ...annualData.slice(0, 5).map(y => (y.totalOPEX / 1000).toFixed(0) + 'k')],
      ['EBITDA', ...annualData.slice(0, 5).map(y => (y.ebitda / 1000).toFixed(0) + 'k')],
      ['Net Income', ...annualData.slice(0, 5).map(y => (y.netIncome / 1000).toFixed(0) + 'k')]
    ],
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243] },
    styles: { fontSize: 9 }
  });
  
  // Balance Sheet
  doc.addPage();
  yPos = 30;
  
  doc.setFontSize(12);
  doc.text('Stato Patrimoniale', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']],
    body: [
      ['Total Assets', ...annualData.slice(0, 5).map(y => (y.balanceSheet.assets.totalAssets / 1000).toFixed(0) + 'k')],
      ['Total Liabilities', ...annualData.slice(0, 5).map(y => (y.balanceSheet.liabilities.totalLiabilities / 1000).toFixed(0) + 'k')],
      ['Total Equity', ...annualData.slice(0, 5).map(y => (y.balanceSheet.equity.totalEquity / 1000).toFixed(0) + 'k')]
    ],
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
    styles: { fontSize: 9 }
  });
  
  doc.save(`Eco3D_Financial_Statements_${new Date().toISOString().split('T')[0]}.pdf`);
}
