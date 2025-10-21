'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrestazioneITA {
  codice: string;
  nome: string;
  U: number;
  B: number;
  D: number;
  P: number;
  percentualeExtraSSN: number;
  aggredibile: boolean;
  note: string;
}

interface MercatoEcografie {
  italia: {
    annoRiferimento: number;
    percentualeExtraSSN: number;
    note: string;
    prestazioni: PrestazioneITA[];
  };
  regioniMondiali: any;
}

interface DatabaseType {
  version: string;
  lastUpdate: string;
  description: string;
  mercatoEcografie: MercatoEcografie;
  market: any;
  budget: any;
  [key: string]: any;
}

interface MarketingProjection {
  costPerLead: number;
  dealsPerRepOverride: number | null;
  calculated: {
    reps: number;
    rampFactor: number;
    capacity: number;
    funnelEfficiency: number;
    leadsNeeded: number;
    leadsMonthly: number;
    budgetMarketing: number;
    budgetMonthly: number;
    cacEffettivo: number;
    expectedRevenue: number;
    marketingPercentage: number;
    productivityRepYear: number;
  };
  lastUpdate: string | null;
  note?: string;
}

interface DatabaseContextType {
  database: DatabaseType | null;
  loading: boolean;
  error: string | null;
  updatePrestazioneAggredibile: (codice: string, aggredibile: boolean) => void;
  updateMarketingPlan: (year: number, projection: MarketingProjection) => void;
  updateMarketingPlanGlobalSettings: (settings: { costPerLead?: number; devicePrice?: number }) => void;
  saveToBackend: () => Promise<void>;
  refreshDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<DatabaseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica database completo
  useEffect(() => {
    loadDatabase();
  }, []);

  const loadDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cache busting
      const timestamp = Date.now();
      const response = await fetch(`/data/database.json?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDatabase(data);
      
      console.log('✅ Database completo caricato:', {
        version: data.version,
        lastUpdate: data.lastUpdate,
        prestazioni: data.mercatoEcografie?.italia?.prestazioni?.length || 0,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      console.error('❌ Errore caricamento database:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna aggredibilità di una prestazione
  const updatePrestazioneAggredibile = (codice: string, aggredibile: boolean) => {
    if (!database) return;

    console.log(`📝 Aggiorno aggredibilità: ${codice} → ${aggredibile}`);

    setDatabase(currentDb => {
      if (!currentDb) return currentDb;

      const updatedDb = { ...currentDb };
      const prestazioni = updatedDb.mercatoEcografie.italia.prestazioni;
      
      const prestazione = prestazioni.find(p => p.codice === codice);
      if (prestazione) {
        prestazione.aggredibile = aggredibile;
        
        // Salva in localStorage per persistenza temporanea
        try {
          localStorage.setItem('eco3d_database', JSON.stringify(updatedDb));
          console.log('💾 Database salvato in localStorage');
        } catch (err) {
          console.warn('⚠️ Impossibile salvare in localStorage:', err);
        }
      }

      return updatedDb;
    });
  };

  // Aggiorna proiezione marketing per un anno specifico
  const updateMarketingPlan = (year: number, projection: MarketingProjection) => {
    if (!database) return;

    console.log(`📊 Aggiorno Marketing Plan Anno ${year}:`, {
      costPerLead: projection.costPerLead,
      budgetMarketing: projection.calculated.budgetMarketing,
      leadsNeeded: projection.calculated.leadsNeeded
    });

    setDatabase(currentDb => {
      if (!currentDb) return currentDb;

      const updatedDb = { ...currentDb };
      
      // Inizializza marketingPlan se non esiste
      if (!updatedDb.goToMarket.marketingPlan) {
        updatedDb.goToMarket.marketingPlan = {
          description: "Proiezioni marketing e sales per anno - calcolate dal Simulatore Impatto Business",
          globalSettings: {
            costPerLead: 50,
            devicePrice: 50000,
            description: "Parametri globali default per simulatore"
          },
          projections: {},
          lastUpdate: null,
          note: "Piano marketing persistente - aggiornato automaticamente dal simulatore"
        };
      }

      // Aggiorna proiezione per l'anno specifico
      const yearKey = `y${year}`;
      updatedDb.goToMarket.marketingPlan.projections[yearKey] = {
        ...projection,
        lastUpdate: new Date().toISOString()
      };
      
      // Aggiorna timestamp globale
      updatedDb.goToMarket.marketingPlan.lastUpdate = new Date().toISOString();
      updatedDb.goToMarket.lastUpdate = new Date().toISOString();

      // Salva in localStorage
      try {
        localStorage.setItem('eco3d_database', JSON.stringify(updatedDb));
        console.log(`✅ Marketing Plan Anno ${year} salvato`);
      } catch (err) {
        console.warn('⚠️ Impossibile salvare in localStorage:', err);
      }

      return updatedDb;
    });
  };

  // Aggiorna impostazioni globali marketing plan
  const updateMarketingPlanGlobalSettings = (settings: { costPerLead?: number; devicePrice?: number }) => {
    if (!database) return;

    console.log('⚙️ Aggiorno Global Settings Marketing Plan:', settings);

    setDatabase(currentDb => {
      if (!currentDb) return currentDb;

      const updatedDb = { ...currentDb };
      
      // Inizializza marketingPlan se non esiste
      if (!updatedDb.goToMarket.marketingPlan) {
        updatedDb.goToMarket.marketingPlan = {
          description: "Proiezioni marketing e sales per anno - calcolate dal Simulatore Impatto Business",
          globalSettings: {
            costPerLead: 50,
            devicePrice: 50000,
            description: "Parametri globali default per simulatore"
          },
          projections: {},
          lastUpdate: null,
          note: "Piano marketing persistente - aggiornato automaticamente dal simulatore"
        };
      }

      // Aggiorna solo i campi forniti
      if (settings.costPerLead !== undefined) {
        updatedDb.goToMarket.marketingPlan.globalSettings.costPerLead = settings.costPerLead;
      }
      if (settings.devicePrice !== undefined) {
        updatedDb.goToMarket.marketingPlan.globalSettings.devicePrice = settings.devicePrice;
      }

      updatedDb.goToMarket.marketingPlan.lastUpdate = new Date().toISOString();
      updatedDb.goToMarket.lastUpdate = new Date().toISOString();

      // Salva in localStorage
      try {
        localStorage.setItem('eco3d_database', JSON.stringify(updatedDb));
        console.log('✅ Global Settings salvate');
      } catch (err) {
        console.warn('⚠️ Impossibile salvare in localStorage:', err);
      }

      return updatedDb;
    });
  };

  // Salva modifiche su backend (da implementare)
  const saveToBackend = async () => {
    if (!database) return;

    try {
      console.log('💾 Salvando database su backend...');
      
      // TODO: Implementare chiamata API
      // const response = await fetch('/api/database/update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(database)
      // });
      
      // Per ora: simulazione
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Database salvato con successo (simulato)');
      alert('✅ Modifiche salvate con successo!');
      
    } catch (err) {
      console.error('❌ Errore salvataggio database:', err);
      alert('❌ Errore durante il salvataggio');
      throw err;
    }
  };

  // Ricarica database dal file
  const refreshDatabase = () => {
    loadDatabase();
  };

  const value: DatabaseContextType = {
    database,
    loading,
    error,
    updatePrestazioneAggredibile,
    updateMarketingPlan,
    updateMarketingPlanGlobalSettings,
    saveToBackend,
    refreshDatabase
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase deve essere usato all\'interno di DatabaseProvider');
  }
  return context;
}
