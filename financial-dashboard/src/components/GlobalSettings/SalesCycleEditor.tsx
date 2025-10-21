'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { GlobalSettingsService } from '@/services/globalSettingsService';
import { Info, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Sales Cycle Editor
 * 
 * Componente per editare il ciclo vendita per segmento
 * Calcola automaticamente la media pesata basata su salesMix
 */
export function SalesCycleEditor() {
  const { data } = useDatabase();
  
  const salesCycle = data?.goToMarket?.salesCycle;
  const bySegment = salesCycle?.bySegment || { pubblico: 9, privato: 3, research: 6 };
  
  const [pubblico, setPubblico] = useState(bySegment.pubblico);
  const [privato, setPrivato] = useState(bySegment.privato);
  const [research, setResearch] = useState(bySegment.research);
  const [isSaving, setIsSaving] = useState(false);
  
  // Memorizza l'ultimo valore salvato
  const lastSavedRef = React.useRef({ pubblico: bySegment.pubblico, privato: bySegment.privato, research: bySegment.research });
  
  // Calcola media pesata
  const avgMonths = GlobalSettingsService.calculateWeightedAvgSalesCycle(
    { pubblico, privato, research },
    data
  );
  
  const salesMix = GlobalSettingsService.getSalesMix(data);
  
  // Auto-save con debounce - SOLO quando valori cambiano
  useEffect(() => {
    if (isSaving) return;
    
    const hasChanged = 
      pubblico !== lastSavedRef.current.pubblico ||
      privato !== lastSavedRef.current.privato ||
      research !== lastSavedRef.current.research;
    
    if (!hasChanged) return;
    
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      
      try {
        const response = await fetch('/api/database/go-to-market', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salesCycle: {
              bySegment: { pubblico, privato, research },
              avgMonths,
              avgMonthsCalculated: true
            }
          })
        });
        
        if (response.ok) {
          // Aggiorna il ref con i nuovi valori salvati
          lastSavedRef.current = { pubblico, privato, research };
          console.log('✅ Sales Cycle salvato:', avgMonths, 'mesi');
        }
      } catch (error) {
        console.error('❌ Errore salvataggio Sales Cycle:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [pubblico, privato, research, avgMonths, isSaving]);
  
  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-semibold text-gray-900">⏱️ Ciclo Vendita per Segmento</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="font-semibold mb-1">Sales Cycle Segmentato</p>
              <p className="text-xs mb-2">
                Mesi necessari per chiudere un deal, per tipo di cliente.
              </p>
              <p className="text-xs font-mono bg-white p-1 rounded mb-2">
                Avg = Σ(mesi × salesMix)
              </p>
              <p className="text-xs">
                Il ciclo nel <strong>pubblico</strong> (SSN) è più lungo per burocrazia.
                Il <strong>privato</strong> è più rapido.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Pubblico */}
        <div>
          <Label className="text-xs text-gray-600 mb-1">🏥 Pubblico</Label>
          <div className="relative">
            <Input
              type="number"
              value={pubblico}
              onChange={(e) => setPubblico(Number(e.target.value))}
              min={1}
              max={24}
              step={1}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              mesi
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(salesMix.pubblico * 100).toFixed(0)}% vendite
          </div>
        </div>
        
        {/* Privato */}
        <div>
          <Label className="text-xs text-gray-600 mb-1">🏨 Privato</Label>
          <div className="relative">
            <Input
              type="number"
              value={privato}
              onChange={(e) => setPrivato(Number(e.target.value))}
              min={1}
              max={24}
              step={1}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              mesi
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(salesMix.privato * 100).toFixed(0)}% vendite
          </div>
        </div>
        
        {/* Research */}
        <div>
          <Label className="text-xs text-gray-600 mb-1">🔬 Research</Label>
          <div className="relative">
            <Input
              type="number"
              value={research}
              onChange={(e) => setResearch(Number(e.target.value))}
              min={1}
              max={24}
              step={1}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              mesi
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(salesMix.research * 100).toFixed(0)}% vendite
          </div>
        </div>
      </div>
      
      {/* Media Pesata */}
      <div className="p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border-2 border-orange-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-900">Media Pesata</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {avgMonths} mesi
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Calcolo: ({pubblico} × {(salesMix.pubblico * 100).toFixed(0)}%) + 
          ({privato} × {(salesMix.privato * 100).toFixed(0)}%) + 
          ({research} × {(salesMix.research * 100).toFixed(0)}%) = {avgMonths}m
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Auto-save attivo • Pesi basati su Sales Mix
      </div>
    </Card>
  );
}

export default SalesCycleEditor;
