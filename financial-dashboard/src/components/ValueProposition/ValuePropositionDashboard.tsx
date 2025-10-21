'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Target, MessageSquare, Calculator, Save, Download } from 'lucide-react';
import { ValuePropositionCanvas } from './ValuePropositionCanvas';
import { MessagingEditor } from './MessagingEditor';
import { ValuePropositionStats } from './ValuePropositionStats';
import { ROICalculatorWidget } from './ROICalculatorWidget';
import { ExportPDFModal } from './ExportPDFModal';

export function ValuePropositionDashboard() {
  const { data } = useDatabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Sync sub-tab with URL query params
  const [activeTab, setActiveTab] = useState<string>('canvas');
  
  useEffect(() => {
    const subtabParam = searchParams.get('subtab');
    if (subtabParam && ['canvas', 'messaging', 'roi'].includes(subtabParam)) {
      setActiveTab(subtabParam);
    }
  }, [searchParams]);
  
  const vpData = data?.valueProposition || null;
  
  if (!vpData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Value Proposition non configurata
          </h2>
          <p className="text-gray-600">
            I dati della Value Proposition non sono ancora disponibili nel database.
          </p>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Auto-save è già gestito dal DatabaseProvider
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  // Handler for sub-tab changes - updates URL
  const handleSubTabChange = (newSubTab: string) => {
    setActiveTab(newSubTab);
    const tabParam = searchParams.get('tab') || 'value-proposition';
    router.push(`/?tab=${tabParam}&subtab=${newSubTab}`);
  };

  const completionStatus = vpData.metadata?.completionStatus || 0;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Value Proposition</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              v{vpData.version}
            </Badge>
            <Badge 
              variant={completionStatus >= 80 ? "default" : "secondary"}
              className="text-sm"
            >
              {completionStatus}% Complete
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Crea e gestisci la proposta di valore per Eco 3D
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salva'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Completamento Sezione
          </span>
          <span className="text-sm font-bold text-blue-600">
            {completionStatus}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionStatus}%` }}
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleSubTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="canvas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Canvas Visuale
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            ROI Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="space-y-6">
          {/* Statistics Overview */}
          <ValuePropositionStats data={vpData} />
          
          {/* Canvas */}
          <ValuePropositionCanvas data={vpData} />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <MessagingEditor data={vpData} />
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <ROICalculatorWidget />
        </TabsContent>
      </Tabs>

      {/* Export PDF Modal */}
      <ExportPDFModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={vpData}
      />
    </div>
  );
}
