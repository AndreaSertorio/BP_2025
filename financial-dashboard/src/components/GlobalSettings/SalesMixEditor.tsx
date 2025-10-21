'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Sales Mix Editor
 * 
 * ✅ SSOT: data.globalSettings.salesMix (sincronizzato)
 * Pattern COPIATO ESATTAMENTE da TamSamSomDashboard.tsx (funzionante)
 */
export function SalesMixEditor() {
  const { data, updateGoToMarket } = useDatabase();
  // ✅ SSOT: salesMix è parte di goToMarket.salesCycle (dove viene USATO)
  const salesCycle = data?.goToMarket?.salesCycle as any;
  const configMix = salesCycle?.salesMix || (data as any)?.globalSettings?.salesMix;
  
  // SSOT: salesMix dal database (valori 0-1, UI mostra 0-100)
  const [pubblico, setPubblico] = useState(60);
  const [privato, setPrivato] = useState(30);
  const [research, setResearch] = useState(10);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Inizializza UNA VOLTA dal database (come in TamSamSomDashboard riga 121-123)
  useEffect(() => {
    if (configMix && !isInitialized) {
      if (configMix.pubblico !== undefined) setPubblico(configMix.pubblico * 100);
      if (configMix.privato !== undefined) setPrivato(configMix.privato * 100);
      if (configMix.research !== undefined) setResearch(configMix.research * 100);
      setIsInitialized(true);
      console.log('✅ Sales Mix inizializzato:', { pubblico: configMix.pubblico * 100, privato: configMix.privato * 100, research: configMix.research * 100 });
    }
  }, [configMix, isInitialized]);
  
  const total = pubblico + privato + research;
  const isValid = Math.abs(total - 100) < 1; // Tolleranza 1%
  
  // Auto-save quando cambiano i valori (debounce 1.5s) - Pattern da TamSamSomDashboard riga 552-613
  useEffect(() => {
    if (!isInitialized) return;
    if (!configMix) return;
    if (!isValid) return; // Salva solo se valido
    
    const timer = setTimeout(async () => {
      setIsSaving(true);
      setSaveError(null);
      
      try {
        const newMix = {
          pubblico: pubblico / 100,
          privato: privato / 100,
          research: research / 100
        };
        
        // ✅ Salva nel goToMarket (pattern funzionante)
        await updateGoToMarket({
          salesCycle: {
            ...(salesCycle || {}),
            salesMix: newMix
          }
        });
        
        console.log('💾 Sales Mix salvato in goToMarket.salesCycle:', newMix);
      } catch (error) {
        console.error('❌ Errore salvataggio Sales Mix:', error);
        setSaveError(String(error));
      } finally {
        setIsSaving(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [pubblico, privato, research, isValid, isInitialized, configMix, salesCycle, updateGoToMarket]);
  
  // Auto-normalize quando utente cambia uno slider
  const handlePubblicoChange = (value: number) => {
    setPubblico(value);
    const remaining = 100 - value;
    const currentRatio = privato / (privato + research) || 0.75; // Default 75% privato
    setPrivato(remaining * currentRatio);
    setResearch(remaining * (1 - currentRatio));
  };
  
  const handlePrivatoChange = (value: number) => {
    setPrivato(value);
    const remaining = 100 - value;
    const currentRatio = pubblico / (pubblico + research) || 0.86; // Default 86% pubblico
    setPubblico(remaining * currentRatio);
    setResearch(remaining * (1 - currentRatio));
  };
  
  const handleResearchChange = (value: number) => {
    setResearch(value);
    const remaining = 100 - value;
    const currentRatio = pubblico / (pubblico + privato) || 0.67; // Default 67% pubblico
    setPubblico(remaining * currentRatio);
    setPrivato(remaining * (1 - currentRatio));
  };
  
  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-semibold text-gray-900">📊 Sales Mix per Segmento</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="font-semibold mb-1">Mix di Vendite</p>
              <p className="text-xs mb-2">
                Percentuali di vendite per segmento. Usato per calcolare la media pesata del Sales Cycle.
              </p>
              <p className="text-xs font-mono bg-white p-1 rounded">
                Avg Sales Cycle = Σ(mesi_segmento × mix_segmento)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-4">
        {/* Pubblico */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm text-gray-700">🏥 Pubblico (SSN)</Label>
            <span className="text-sm font-semibold text-blue-600">{pubblico.toFixed(1)}%</span>
          </div>
          <Slider
            value={[pubblico]}
            onValueChange={([value]) => handlePubblicoChange(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Privato */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm text-gray-700">🏨 Privato</Label>
            <span className="text-sm font-semibold text-blue-600">{privato.toFixed(1)}%</span>
          </div>
          <Slider
            value={[privato]}
            onValueChange={([value]) => handlePrivatoChange(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Research */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm text-gray-700">🔬 Research</Label>
            <span className="text-sm font-semibold text-blue-600">{research.toFixed(1)}%</span>
          </div>
          <Slider
            value={[research]}
            onValueChange={([value]) => handleResearchChange(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Totale e Validazione */}
      <div className={`mt-4 p-3 rounded ${
        isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isValid ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-sm font-semibold">
              Totale: {total.toFixed(1)}%
            </span>
          </div>
          <span className={`text-xs ${isValid ? 'text-green-700' : 'text-orange-700'}`}>
            {isValid ? '✓ Valido' : '⚠ Deve sommare 100%'}
          </span>
        </div>
      </div>
      
      {/* Status Salvataggio */}
      <div className="mt-2">
        {isSaving ? (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Salvataggio in corso...
          </div>
        ) : saveError ? (
          <div className="text-xs text-red-600">
            ❌ Errore: {saveError}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Auto-save attivo • Modifica uno slider, gli altri si aggiustano automaticamente
          </div>
        )}
      </div>
    </Card>
  );
}

export default SalesMixEditor;
