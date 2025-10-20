'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadExcel, downloadExcelMultiSheet, downloadPDF, downloadPDFMultiSection } from '@/lib/exportUtils';
import { useDatabase } from '@/contexts/DatabaseProvider';
import type { Competitor, Product } from '@/types/competitor.types';

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  exportFormats: ('Excel' | 'PDF')[];
}

export default function CompetitorExportPanel() {
  const { data } = useDatabase();
  const compData = data?.competitorAnalysis;
  const competitors = compData?.competitors || [];

  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportMessage, setExportMessage] = useState<string>('');

  const exportModules: ExportModule[] = [
    {
      id: 'battlecards',
      name: 'Battlecards',
      description: 'One-page competitive battlecards per competitor',
      icon: '⚔️',
      exportFormats: ['PDF', 'Excel']
    },
    {
      id: 'swot',
      name: 'SWOT Analysis',
      description: 'Complete SWOT analysis for all competitors',
      icon: '⚖️',
      exportFormats: ['PDF', 'Excel']
    },
    {
      id: 'profiles',
      name: 'Competitor Profiles',
      description: 'Detailed profiles with company info and products',
      icon: '📋',
      exportFormats: ['PDF', 'Excel']
    },
    {
      id: 'comparison',
      name: 'Comparison Matrix',
      description: 'Side-by-side comparison of all competitors',
      icon: '📊',
      exportFormats: ['Excel']
    },
    {
      id: 'porter5',
      name: "Porter's 5 Forces",
      description: 'Industry forces analysis',
      icon: '🏛️',
      exportFormats: ['Excel', 'PDF']
    },
    {
      id: 'perceptual',
      name: 'Perceptual Map',
      description: 'Market positioning visualization',
      icon: '📍',
      exportFormats: ['Excel', 'PDF']
    }
  ];

  const generateModuleData = (moduleId: string): Record<string, any>[] => {
    switch (moduleId) {
      case 'battlecards':
        return competitors.map((c: Competitor) => ({
          'Competitor': c.name,
          'Tier': c.tier,
          'Type': c.type,
          'Threat Level': c.threatLevel,
          'Why We Win': c.battlecard?.whyWeWin?.join(' • ') || 'N/A',
          'Their Strengths': c.battlecard?.theirStrengths?.join(' • ') || 'N/A',
          'Their Weaknesses': c.battlecard?.theirWeaknesses?.join(' • ') || 'N/A',
          'Response': c.battlecard?.competitiveResponse || 'N/A'
        }));

      case 'swot':
        return competitors.flatMap((c: Competitor) => [
          {
            'Competitor': c.name,
            'Category': 'Strengths',
            'Items': c.swotAnalysis?.strengths?.join(' | ') || 'N/A'
          },
          {
            'Competitor': c.name,
            'Category': 'Weaknesses',
            'Items': c.swotAnalysis?.weaknesses?.join(' | ') || 'N/A'
          },
          {
            'Competitor': c.name,
            'Category': 'Opportunities',
            'Items': c.swotAnalysis?.opportunities?.join(' | ') || 'N/A'
          },
          {
            'Competitor': c.name,
            'Category': 'Threats',
            'Items': c.swotAnalysis?.threats?.join(' | ') || 'N/A'
          }
        ]);

      case 'profiles':
        return competitors.map((c: Competitor) => ({
          'Name': c.name,
          'Short Name': c.shortName,
          'Tier': c.tier,
          'Type': c.type,
          'Status': c.status,
          'Threat Level': c.threatLevel,
          'Founded': c.companyInfo.founded || 'N/A',
          'Headquarters': c.companyInfo.headquarters || 'N/A',
          'Employees': c.companyInfo.employees || 'N/A',
          'Revenue (M€)': c.companyInfo.revenue || 'N/A',
          'Market Share %': c.marketPosition?.marketShare || 'N/A',
          'Region': c.marketPosition?.region || 'N/A',
          'Segments': c.marketPosition?.segments?.join(', ') || 'N/A',
          'Products': c.products?.map((p: Product) => p.name).join(', ') || 'N/A',
          'Website': c.companyInfo.website || 'N/A',
          'Last Updated': new Date(c.lastUpdated).toLocaleDateString('it-IT')
        }));

      case 'comparison':
        // Create comparison matrix with all key features
        const featureKeys = [
          'imaging3D', 'imaging4D', 'aiGuided', 'portable', 
          'wireless', 'multiProbe', 'realtime', 'cloudConnected'
        ];
        
        return competitors.map((c: Competitor) => {
          const product = c.products?.[0];
          const row: Record<string, string | number> = {
            'Competitor': c.name,
            'Threat Level': c.threatLevel,
            'Type': c.type,
            'Market Share %': c.marketPosition?.marketShare || 0,
            'Employees': c.companyInfo?.employees || 0,
            'Founded': c.companyInfo?.founded || 'N/A'
          };
          
          // Add feature columns
          if (product?.features) {
            featureKeys.forEach(key => {
              row[key] = product.features?.[key as keyof typeof product.features] ? '✓' : '✗';
            });
            row['Price Range'] = product.priceRange || 'N/A';
          } else {
            // No product data - fill with N/A
            featureKeys.forEach(key => {
              row[key] = 'N/A';
            });
            row['Price Range'] = 'N/A';
          }
          
          return row;
        });

      case 'porter5':
        if (!compData?.frameworks?.porter5Forces) {
          return [{ 'Note': 'Porter 5 Forces analysis not configured yet' }];
        }
        const p5f = compData.frameworks.porter5Forces;
        return [
          {
            'Force': 'Rivalry Among Existing Competitors',
            'Level': p5f.rivalryExistingCompetitors?.level || 'N/A',
            'Score (1-5)': p5f.rivalryExistingCompetitors?.score || 'N/A',
            'Description': p5f.rivalryExistingCompetitors?.description || '',
            'Factors': p5f.rivalryExistingCompetitors?.factors?.join(' • ') || 'N/A',
            'Impact': p5f.rivalryExistingCompetitors?.impact || ''
          },
          {
            'Force': 'Threat of New Entrants',
            'Level': p5f.threatNewEntrants?.level || 'N/A',
            'Score (1-5)': p5f.threatNewEntrants?.score || 'N/A',
            'Description': p5f.threatNewEntrants?.description || '',
            'Factors': p5f.threatNewEntrants?.factors?.join(' • ') || 'N/A',
            'Impact': p5f.threatNewEntrants?.impact || ''
          },
          {
            'Force': 'Bargaining Power of Suppliers',
            'Level': p5f.bargainingPowerSuppliers?.level || 'N/A',
            'Score (1-5)': p5f.bargainingPowerSuppliers?.score || 'N/A',
            'Description': p5f.bargainingPowerSuppliers?.description || '',
            'Factors': p5f.bargainingPowerSuppliers?.factors?.join(' • ') || 'N/A',
            'Impact': p5f.bargainingPowerSuppliers?.impact || ''
          },
          {
            'Force': 'Bargaining Power of Buyers',
            'Level': p5f.bargainingPowerBuyers?.level || 'N/A',
            'Score (1-5)': p5f.bargainingPowerBuyers?.score || 'N/A',
            'Description': p5f.bargainingPowerBuyers?.description || '',
            'Factors': p5f.bargainingPowerBuyers?.factors?.join(' • ') || 'N/A',
            'Impact': p5f.bargainingPowerBuyers?.impact || ''
          },
          {
            'Force': 'Threat of Substitutes',
            'Level': p5f.threatSubstitutes?.level || 'N/A',
            'Score (1-5)': p5f.threatSubstitutes?.score || 'N/A',
            'Description': p5f.threatSubstitutes?.description || '',
            'Factors': p5f.threatSubstitutes?.factors?.join(' • ') || 'N/A',
            'Impact': p5f.threatSubstitutes?.impact || ''
          },
          {
            'Force': 'Overall Industry Attractiveness',
            'Level': p5f.overallAttractiveness?.rating || 'N/A',
            'Score (1-5)': p5f.overallAttractiveness?.score || 'N/A',
            'Description': p5f.overallAttractiveness?.summary || '',
            'Factors': '',
            'Impact': ''
          }
        ];

      case 'perceptual':
        if (!compData?.frameworks?.perceptualMap) {
          return [{ 'Note': 'Perceptual Map not configured yet' }];
        }
        const pmap = compData.frameworks.perceptualMap;
        return pmap.positions.map((pos: { competitorId: string; x: number; y: number; label?: string }) => {
          const comp = competitors.find((c: Competitor) => c.id === pos.competitorId);
          return {
            'Competitor': comp?.name || pos.competitorId,
            [`${pmap.axes.x.label}`]: pos.x,
            [`${pmap.axes.y.label}`]: pos.y,
            'Label': pos.label || comp?.shortName || ''
          };
        });

      default:
        return [{ 'Module': moduleId, 'Status': 'No data available' }];
    }
  };

  const handleExport = (moduleId: string, format: 'Excel' | 'PDF') => {
    setExportStatus('exporting');
    setExportMessage(`Exporting ${moduleId} to ${format}...`);

    try {
      const moduleData = generateModuleData(moduleId);
      const filename = `eco3d-competitor-${moduleId}-${new Date().toISOString().split('T')[0]}`;
      const exportModule = exportModules.find(m => m.id === moduleId);
      const title = exportModule?.name || moduleId;

      if (format === 'Excel') {
        downloadExcel(moduleData, filename, moduleId.toUpperCase());
      } else {
        downloadPDF(moduleData, filename, `Eco 3D - ${title}`, 'Competitor Analysis Report');
      }

      setExportStatus('success');
      setExportMessage(`✅ ${filename}.${format.toLowerCase()} exported successfully!`);
    } catch (error) {
      setExportStatus('error');
      setExportMessage(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTimeout(() => {
      setExportStatus('idle');
      setExportMessage('');
    }, 3000);
  };

  const handleExportAll = (format: 'Excel' | 'PDF') => {
    setExportStatus('exporting');
    setExportMessage(`Exporting all modules to ${format}...`);

    try {
      const filename = `eco3d-complete-competitor-report-${new Date().toISOString().split('T')[0]}`;

      if (format === 'Excel') {
        const sheets = exportModules
          .filter(m => m.exportFormats.includes('Excel'))
          .map(module => ({
            name: module.id.toUpperCase().substring(0, 31), // Excel sheet name limit
            data: generateModuleData(module.id)
          }));
        downloadExcelMultiSheet(sheets, filename);
      } else {
        const sections = exportModules
          .filter(m => m.exportFormats.includes('PDF'))
          .map(module => ({
            title: module.name,
            data: generateModuleData(module.id)
          }));
        downloadPDFMultiSection(sections, filename, 'Eco 3D - Complete Competitor Analysis');
      }

      setExportStatus('success');
      setExportMessage(`✅ ${filename}.${format.toLowerCase()} exported successfully! (${exportModules.length} modules)`);
    } catch (error) {
      setExportStatus('error');
      setExportMessage(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTimeout(() => {
      setExportStatus('idle');
      setExportMessage('');
    }, 4000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="h-6 w-6 text-purple-600" />
            Export Competitor Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Export competitive intelligence reports in Excel or PDF format
          </p>
        </div>
        {competitors.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <p className="text-sm text-yellow-800">⚠️ No competitors in database</p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {exportMessage && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          exportStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          exportStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {exportStatus === 'success' && <CheckCircle2 className="h-5 w-5" />}
          {exportStatus === 'error' && <AlertCircle className="h-5 w-5" />}
          {exportStatus === 'exporting' && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />}
          <span className="font-medium">{exportMessage}</span>
        </div>
      )}

      {/* Export All Buttons */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Export Complete Report
        </h3>
        <div className="flex gap-3">
          <Button
            onClick={() => handleExportAll('Excel')}
            disabled={exportStatus === 'exporting' || competitors.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export All to Excel
          </Button>
          <Button
            onClick={() => handleExportAll('PDF')}
            disabled={exportStatus === 'exporting' || competitors.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <FileText className="h-4 w-4" />
            Export All to PDF
          </Button>
        </div>
      </div>

      {/* Individual Module Exports */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Export Individual Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportModules.map(module => (
            <div
              key={module.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">{module.icon}</div>
                  <h4 className="font-semibold text-gray-900">{module.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {module.exportFormats.includes('Excel') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(module.id, 'Excel')}
                    disabled={exportStatus === 'exporting' || competitors.length === 0}
                    className="flex-1 text-xs"
                  >
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                )}
                {module.exportFormats.includes('PDF') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(module.id, 'PDF')}
                    disabled={exportStatus === 'exporting' || competitors.length === 0}
                    className="flex-1 text-xs"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">📁 Export Location:</span>
          <span>Browser Downloads folder</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <span className="font-medium">📊 Competitors Tracked:</span>
          <span className="font-semibold text-purple-600">{competitors.length}</span>
        </div>
      </div>
    </div>
  );
}
