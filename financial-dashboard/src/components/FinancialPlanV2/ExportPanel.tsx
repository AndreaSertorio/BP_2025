/**
 * Export Panel - Sistema Completo di Export Dati Finanziari
 * Supporta export Excel, PDF, JSON con template professionali
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  FileJson, 
  Printer,
  Check,
  Loader2,
  Settings,
  Calendar,
  Eye
} from 'lucide-react';
import type { AnnualCalculation, MonthlyCalculation } from '@/types/financialPlan.types';
import {
  exportCompleteExcel,
  exportExecutiveSummary,
  exportMonthlyProjections,
  exportInvestorPackage,
  exportJSON,
  exportCSV,
  exportPDF
} from '@/utils/exportHelpers';
import { exportDashboardAsPNG, exportAllChartsAsPNG, exportChartsAreaAsPNG } from '@/utils/chartExportHelpers';
import { exportPowerPoint } from '@/utils/pptExportHelpers';

interface ExportPanelProps {
  annualData: AnnualCalculation[];
  monthlyData: MonthlyCalculation[];
  financialPlan: any;
}

export function ExportPanel({ annualData, monthlyData, financialPlan }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = async (format: string, type: string) => {
    const exportKey = `${format}-${type}`;
    setExporting(exportKey);
    setExportSuccess(null);

    try {
      // EXPORT REALE
      switch (exportKey) {
        // Excel Exports
        case 'excel-complete':
          exportCompleteExcel(annualData, monthlyData);
          break;
        case 'excel-summary':
          exportExecutiveSummary(annualData);
          break;
        case 'excel-monthly':
          exportMonthlyProjections(monthlyData);
          break;
        case 'excel-investor':
          exportInvestorPackage(annualData);
          break;
        
        // PDF Exports
        case 'pdf-report':
        case 'pdf-dashboard':
        case 'pdf-deck':
        case 'pdf-statements':
          exportPDF(type, annualData);
          break;
        
        // PNG Exports
        case 'png-dashboard':
          await exportDashboardAsPNG();
          break;
        case 'png-charts':
          // Prova prima exportAllChartsAsPNG, se fallisce usa exportChartsAreaAsPNG
          try {
            await exportAllChartsAsPNG();
          } catch (error) {
            console.warn('Fallback a exportChartsAreaAsPNG:', error);
            await exportChartsAreaAsPNG();
          }
          break;
        
        // PowerPoint Exports
        case 'ppt-investor':
        case 'ppt-business':
        case 'ppt-summary':
          await exportPowerPoint(annualData, type);
          break;
        
        // Data Exports
        case 'json-full':
          exportJSON(annualData, monthlyData, financialPlan);
          break;
        case 'csv-dataset':
          exportCSV(annualData, monthlyData);
          break;
        
        default:
          console.warn('Export type non implementato:', exportKey);
      }
      
      setExportSuccess(exportKey);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Errore export:', error);
      alert('Errore durante l\'export. Controlla la console per dettagli.');
    } finally {
      setExporting(null);
    }
  };

  const ExportCard = ({ 
    title, 
    description, 
    icon: Icon, 
    format, 
    type,
    color 
  }: any) => {
    const exportKey = `${format}-${type}`;
    const isExporting = exporting === exportKey;
    const isSuccess = exportSuccess === exportKey;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-4">{description}</p>
              <Button 
                onClick={() => handleExport(format, type)}
                disabled={isExporting}
                className="w-full"
                variant={isSuccess ? "default" : "outline"}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Esportazione...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completato!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Esporta {format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Export Dati Finanziari</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Esporta i tuoi dati in formati professionali per presentazioni, analisi e archiviazione
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Periodo</p>
              <p className="text-sm font-semibold">
                {annualData[0]?.year} - {annualData[annualData.length - 1]?.year}
              </p>
              <p className="text-xs text-gray-400">
                {monthlyData.length} mesi • {annualData.length} anni
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SEZIONE 1: EXCEL EXPORTS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <CardTitle>Export Excel</CardTitle>
          </div>
          <p className="text-sm text-gray-500">
            File Excel professionali con tabelle, grafici e formule
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Piano Finanziario Completo"
              description="P&L, Cash Flow, Balance Sheet, KPI - 10 anni"
              icon={FileSpreadsheet}
              format="excel"
              type="complete"
              color="bg-green-100 text-green-600"
            />
            <ExportCard
              title="Executive Summary"
              description="Highlights principali per investitori (5 pagine)"
              icon={FileSpreadsheet}
              format="excel"
              type="summary"
              color="bg-green-100 text-green-600"
            />
            <ExportCard
              title="Monthly Projections"
              description="Proiezioni mensili dettagliate (120 mesi)"
              icon={Calendar}
              format="excel"
              type="monthly"
              color="bg-blue-100 text-blue-600"
            />
            <ExportCard
              title="Investor Package"
              description="Template per pitch deck e due diligence"
              icon={Eye}
              format="excel"
              type="investor"
              color="bg-purple-100 text-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 2: PDF EXPORTS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            <CardTitle>Export PDF</CardTitle>
          </div>
          <p className="text-sm text-gray-500">
            Report professionali in PDF per presentazioni e stampa
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Business Plan Report"
              description="Report completo con grafici e analisi narrative"
              icon={FileText}
              format="pdf"
              type="report"
              color="bg-red-100 text-red-600"
            />
            <ExportCard
              title="Dashboard Snapshot"
              description="Screenshot interattivo di tutti i dashboard"
              icon={Printer}
              format="pdf"
              type="dashboard"
              color="bg-orange-100 text-orange-600"
            />
            <ExportCard
              title="Investor Deck"
              description="Slide deck per presentazioni investitori"
              icon={Eye}
              format="pdf"
              type="deck"
              color="bg-pink-100 text-pink-600"
            />
            <ExportCard
              title="Financial Statements"
              description="P&L, CF, BS formattati per banche"
              icon={Settings}
              format="pdf"
              type="statements"
              color="bg-indigo-100 text-indigo-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 3: PNG EXPORTS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <CardTitle>Export Immagini PNG</CardTitle>
          </div>
          <p className="text-sm text-gray-500">
            Screenshot dashboard e grafici in alta qualità
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Dashboard Screenshot"
              description="Screenshot completo del dashboard"
              icon={Eye}
              format="png"
              type="dashboard"
              color="bg-blue-100 text-blue-600"
            />
            <ExportCard
              title="Tutti i Grafici"
              description="Export tutti i grafici come PNG separate"
              icon={Settings}
              format="png"
              type="charts"
              color="bg-cyan-100 text-cyan-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 4: POWERPOINT EXPORTS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-600" />
            <CardTitle>Export PowerPoint</CardTitle>
          </div>
          <p className="text-sm text-gray-500">
            Presentazioni PowerPoint professionali (richiede pptxgenjs)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Investor Deck PPT"
              description="Presentazione per pitch investitori"
              icon={Eye}
              format="ppt"
              type="investor"
              color="bg-orange-100 text-orange-600"
            />
            <ExportCard
              title="Business Plan PPT"
              description="Presentazione business plan completa"
              icon={FileText}
              format="ppt"
              type="business"
              color="bg-amber-100 text-amber-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 5: DATA EXPORTS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-yellow-600" />
            <CardTitle>Export Dati Grezzi</CardTitle>
          </div>
          <p className="text-sm text-gray-500">
            Dati in formato JSON/CSV per analisi personalizzate
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="JSON Completo"
              description="Tutti i dati in formato JSON (per API/import)"
              icon={FileJson}
              format="json"
              type="full"
              color="bg-yellow-100 text-yellow-600"
            />
            <ExportCard
              title="CSV Dataset"
              description="Tabelle CSV per Excel/Google Sheets"
              icon={FileSpreadsheet}
              format="csv"
              type="dataset"
              color="bg-teal-100 text-teal-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 4: TEMPLATES PERSONALIZZATI */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Template Personalizzati</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configura template di export personalizzati con i tuoi KPI, grafici e layout preferiti
            </p>
            <Button variant="outline" disabled>
              <Settings className="w-4 h-4 mr-2" />
              Configura Template (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">💡 Suggerimento</h4>
              <p className="text-xs text-gray-600">
                Per presentazioni a investitori, usa <strong>Excel Investor Package</strong> + <strong>PDF Investor Deck</strong>.
                Per banche e credito, usa <strong>PDF Financial Statements</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
