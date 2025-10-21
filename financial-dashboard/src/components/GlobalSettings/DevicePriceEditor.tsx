'use client';

import React, { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { DollarSign } from 'lucide-react';

/**
 * Device Price Editor
 * 
 * ✅ SSOT: prezzoMedioDispositivo (sincronizzato con TAM/SAM/SOM)
 * Pattern COPIATO ESATTAMENTE da TamSamSomDashboard.tsx (funzionante)
 */
export function DevicePriceEditor({ compact = false }: { compact?: boolean }) {
  const { data, updateConfigurazioneTamSamSomEcografi } = useDatabase();
  const configDevices = data?.configurazioneTamSamSom?.ecografi;
  
  // SSOT: prezzoMedioDispositivo dal database
  const [prezzoMedio, setPrezzoMedio] = useState(50000);
  const [editingPrezzoMedio, setEditingPrezzoMedio] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Inizializza UNA VOLTA dal database (come in TamSamSomDashboard riga 121-123)
  useEffect(() => {
    if (configDevices && !isInitialized) {
      if (configDevices.prezzoMedioDispositivo !== undefined) {
        setPrezzoMedio(configDevices.prezzoMedioDispositivo);
      }
      setIsInitialized(true);
    }
  }, [configDevices, isInitialized]);
  
  // Auto-save quando cambia prezzoMedio (debounce 1.5s) - Pattern da TamSamSomDashboard riga 552-613
  useEffect(() => {
    if (!isInitialized) return;
    if (!configDevices) return;
    
    const timer = setTimeout(async () => {
      // Salva usando la funzione del DatabaseProvider (come in TamSamSomDashboard)
      await updateConfigurazioneTamSamSomEcografi({
        prezzoMedioDispositivo: prezzoMedio
      } as any);
      
      console.log('💾 Device Price salvato automaticamente:', prezzoMedio);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [prezzoMedio, isInitialized, configDevices, updateConfigurazioneTamSamSomEcografi]);
  
  // UI: Stesso pattern di TamSamSomDashboard riga 1746-1792
  return (
    <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-400">
      <label className="text-sm font-semibold text-emerald-800 mb-2 block flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        💶 Prezzo ASP Medio Dispositivo (SSOT):
      </label>
      
      {editingPrezzoMedio !== null ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editingPrezzoMedio}
            onChange={(e) => setEditingPrezzoMedio(e.target.value)}
            onBlur={() => {
              const newPrice = parseFloat(editingPrezzoMedio);
              if (!isNaN(newPrice) && newPrice > 0) {
                setPrezzoMedio(newPrice);
              }
              setEditingPrezzoMedio(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newPrice = parseFloat(editingPrezzoMedio);
                if (!isNaN(newPrice) && newPrice > 0) {
                  setPrezzoMedio(newPrice);
                }
                setEditingPrezzoMedio(null);
              } else if (e.key === 'Escape') {
                setEditingPrezzoMedio(null);
              }
            }}
            className="flex-1 px-3 py-2 border-2 border-emerald-500 rounded-lg font-mono text-lg"
            autoFocus
          />
          <span className="text-gray-500">€</span>
        </div>
      ) : (
        <div 
          onClick={() => setEditingPrezzoMedio(prezzoMedio.toString())}
          className="cursor-pointer hover:bg-emerald-100 p-3 rounded-lg border-2 border-emerald-200 transition-all"
        >
          <div className="text-2xl font-bold text-emerald-900">
            €{prezzoMedio.toLocaleString('it-IT')}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            ✏️ Click per modificare • Sincronizzato con TAM/SAM/SOM
          </div>
        </div>
      )}
    </div>
  );
}

export default DevicePriceEditor;
