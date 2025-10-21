'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, FileText, File, Presentation, Check } from 'lucide-react';
import { exportValuePropositionToPDF, type PDFFormat } from '@/lib/pdf-export';
import type { ValueProposition } from '@/types/valueProposition';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ValueProposition;
}

type FormatOption = {
  id: PDFFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  pages: string;
  bestFor: string;
};

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Formato visuale, stile slides',
    icon: <Presentation className="h-8 w-8" />,
    pages: '5-7 pagine',
    bestFor: 'Demo, pitch, investor meetings',
  },
  {
    id: 'report',
    name: 'Report',
    description: 'Dettagliato, ricco di testo',
    icon: <FileText className="h-8 w-8" />,
    pages: '10-15 pagine',
    bestFor: 'Documentazione interna, analisi',
  },
  {
    id: 'onepager',
    name: 'One-Pager',
    description: 'Executive summary su singola pagina',
    icon: <File className="h-8 w-8" />,
    pages: '1 pagina',
    bestFor: 'Quick reference, email, handouts',
  },
];

export function ExportPDFModal({ isOpen, onClose, data }: ExportPDFModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<PDFFormat>('presentation');
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'en'>('it');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      await exportValuePropositionToPDF(data, {
        format: selectedFormat,
        language: selectedLanguage,
        includeLogo,
        includeCharts,
      });
      
      // Success toast
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { type: 'success', message: 'PDF esportato con successo!' }
        });
        window.dispatchEvent(event);
      }
      
      // Close modal after 500ms
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      
      // Error toast
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { type: 'error', message: 'Errore durante l\'esportazione PDF' }
        });
        window.dispatchEvent(event);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0"
          disabled={isExporting}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Export PDF</h2>
          <p className="text-gray-600">
            Scegli il formato e le opzioni per esportare la Value Proposition
          </p>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                disabled={isExporting}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${selectedFormat === format.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                  }
                  ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Check icon */}
                {selectedFormat === format.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-3 ${selectedFormat === format.id ? 'text-blue-600' : 'text-gray-600'}`}>
                  {format.icon}
                </div>

                {/* Name */}
                <div className="font-semibold text-gray-900 mb-1">
                  {format.name}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 mb-2">
                  {format.description}
                </div>

                {/* Pages */}
                <div className="text-xs text-gray-500 mb-1">
                  📄 {format.pages}
                </div>

                {/* Best for */}
                <div className="text-xs text-gray-500">
                  ✨ {format.bestFor}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lingua</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedLanguage('it')}
              disabled={isExporting}
              className={`
                flex-1 p-3 rounded-lg border-2 font-medium transition-all
                ${selectedLanguage === 'it' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              🇮🇹 Italiano
            </button>
            <button
              onClick={() => setSelectedLanguage('en')}
              disabled={isExporting}
              className={`
                flex-1 p-3 rounded-lg border-2 font-medium transition-all
                ${selectedLanguage === 'en' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Opzioni</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                disabled={isExporting}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Includi logo</div>
                <div className="text-sm text-gray-600">Mostra logo aziendale nelle pagine</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                disabled={isExporting}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Includi grafici</div>
                <div className="text-sm text-gray-600">Mostra charts e visualizzazioni (ROI, Competitors)</div>
              </div>
            </label>
          </div>
        </div>

        {/* Preview Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              ℹ️
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-900 mb-1">Anteprima configurazione</div>
              <div className="text-sm text-blue-800">
                <strong>{FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.name}</strong> • {' '}
                {selectedLanguage === 'it' ? 'Italiano' : 'English'} • {' '}
                {includeLogo && 'Logo ✓'} {includeCharts && 'Charts ✓'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[140px]"
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Esportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Esporta PDF
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
