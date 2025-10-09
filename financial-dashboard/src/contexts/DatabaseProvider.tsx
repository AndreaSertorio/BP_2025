/**
 * DATABASE PROVIDER - CON BACKEND API
 * Legge e scrive database.json tramite server Express
 * NO localStorage - persistenza su file
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
interface PrestazioneEcografia {
  codice: string;
  nome: string;
  U: number;
  B: number;
  D: number;
  P: number;
  percentualeExtraSSN: number;
  aggredibile: boolean;
  note?: string;
}

interface MercatoEcografieItalia {
  annoRiferimento: number;
  percentualeExtraSSN: number;
  note?: string;
  prestazioni: PrestazioneEcografia[];
}

interface RegioneMondialeData {
  nome: string;
  flag: string;
  moltiplicatoreVolume: number;
  moltiplicatoreValore: number;
  quotaItalia: string;
  note: string;
}

// Types per mercatoEcografi
interface TipologiaEcografo {
  id: string;
  nome: string;
  icon: string;
  quotaIT: number;
  valoreIT: number;
  quotaGlobale: number;
  valoreGlobale: number;
  cagrGlobale: string;
  note: string;
  visible: boolean;
  target: boolean;
}

interface ConfigurazioneMercatoEcografi {
  annoTarget: number;
  marketShare: number;
  scenarioParco: 'basso' | 'centrale' | 'alto';
  regioniVisibili: string[];
  tipologieTarget: string[];
}

interface MercatoEcografi {
  tipologie: TipologiaEcografo[];
  numeroEcografi: Array<{ mercato: string; unita2025: number; unita2030: number }>;
  valoreMercato: Array<{ mercato: string; valore2025: number; valore2030: number; cagr: number }>;
  proiezioniItalia: Array<{ anno: number; mordor: number; research: number; grandview: number; cognitive: number; media: number; mediana: number }>;
  quoteTipologie: Array<{ anno: number; carrellati: number; portatili: number; palmari: number }>;
  parcoIT: Array<{ anno: number; basso: number; centrale: number; alto: number }>;
  configurazione: ConfigurazioneMercatoEcografi;
}

interface PrezzoEcografia {
  codice: string;
  descrizione: string;
  prezzoPubblico: number;
  prezzoPrivato: number;
  range: string;
  devStd: string;
  confidenza: string;
  nFonti: number;
  note: string;
}

interface ValoriCalcolatiTamSamSom {
  tam: number;
  sam: number;
  som1: number;
  som3: number;
  som5: number;
}

interface ConfigurazioneTamSamSomEcografie {
  priceMode: 'semplice' | 'perProcedura' | 'regionalizzato';
  prezzoMedioProcedura: number;
  tipoPrezzo: 'pubblico' | 'privato' | 'medio';
  regioneSelezionata: 'italia' | 'europa' | 'usa' | 'cina';
  volumeMode: 'totale' | 'ssn' | 'extraSsn';
  samPercentage: number;
  somPercentages: {
    y1: number;
    y3: number;
    y5: number;
  };
  valoriCalcolati: ValoriCalcolatiTamSamSom;
  lastUpdate: string | null;
}

interface ConfigurazioneTamSamSomEcografi {
  priceMode: 'semplice';
  prezzoMedioDispositivo: number;
  samPercentage: number;
  somPercentages: {
    y1: number;
    y3: number;
    y5: number;
  };
  valoriCalcolati: ValoriCalcolatiTamSamSom;
  lastUpdate: string | null;
}

interface Database {
  version: string;
  lastUpdate: string;
  description?: string;
  mercatoEcografie: {
    italia: MercatoEcografieItalia;
  };
  regioniMondiali?: {
    usa: RegioneMondialeData;
    europa: RegioneMondialeData;
    cina: RegioneMondialeData;
    globale: RegioneMondialeData;
  };
  mercatoEcografi?: MercatoEcografi;
  prezziEcografieRegionalizzati?: {
    italia: PrezzoEcografia[];
    europa: PrezzoEcografia[];
    usa: PrezzoEcografia[];
    cina: PrezzoEcografia[];
  };
  configurazioneTamSamSom?: {
    ecografie: ConfigurazioneTamSamSomEcografie;
    ecografi: ConfigurazioneTamSamSomEcografi;
  };
  market?: any; // Dati mercato per TAM/SAM/SOM (da definire tipo completo)
  budget?: any; // Dati budget (da definire tipo completo)
  metadata?: Record<string, unknown>;
}

interface DatabaseContextValue {
  data: Database;
  loading: boolean;
  lastUpdate: Date | null;
  // Ecografie
  updatePrestazione: (codice: string, updates: Partial<PrestazioneEcografia>) => Promise<void>;
  toggleAggredibile: (codice: string) => Promise<void>;
  setPercentualeExtraSSN: (codice: string, percentuale: number) => Promise<void>;
  updateRegioneMoltiplicatori: (regioneId: string, moltiplicatoreVolume?: number, moltiplicatoreValore?: number) => Promise<void>;
  // Ecografi
  updateConfigurazioneEcografi: (updates: Partial<ConfigurazioneMercatoEcografi>) => Promise<void>;
  toggleTipologiaVisible: (id: string) => Promise<void>;
  toggleTipologiaTarget: (id: string) => Promise<void>;
  updateTipologia: (id: string, updates: Partial<TipologiaEcografo>) => Promise<void>;
  // TAM/SAM/SOM
  updateConfigurazioneTamSamSomEcografie: (updates: Partial<ConfigurazioneTamSamSomEcografie>) => Promise<void>;
  updateConfigurazioneTamSamSomEcografi: (updates: Partial<ConfigurazioneTamSamSomEcografi>) => Promise<void>;
  updatePrezzoEcografiaRegionalizzato: (regione: string, codice: string, updates: Partial<PrezzoEcografia>) => Promise<void>;
  // Generali
  resetToDefaults: () => Promise<void>;
  exportDatabase: () => string;
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================================
// PROVIDER
// ============================================================================

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Database>({
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    mercatoEcografie: {
      italia: {
        annoRiferimento: 2024,
        percentualeExtraSSN: 30,
        prestazioni: []
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Carica dati dal server al mount
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/database`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const database = await response.json();
      setData(database);
      setLastUpdate(new Date(database.lastUpdate));
      console.log('✅ Database caricato dal server');
    } catch (error) {
      console.error('❌ Errore caricamento database:', error);
      alert('⚠️ Server non raggiungibile. Assicurati che il server sia avviato (npm run server)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update generica di una prestazione (tramite API)
  const updatePrestazione = useCallback(async (codice: string, updates: Partial<PrestazioneEcografia>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/prestazione/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Prestazione ${codice} aggiornata`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento prestazione ${codice}:`, error);
    }
  }, [refreshData]);

  // Toggle aggredibile (tramite API) - OTTIMIZZATO: aggiorna solo lo stato locale
  const toggleAggredibile = useCallback(async (codice: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/toggle-aggredibile/${codice}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle aggredibile ${codice}: ${result.aggredibile}`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      // Questo previene il reload completo della pagina
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          mercatoEcografie: {
            ...prevData.mercatoEcografie,
            italia: {
              ...prevData.mercatoEcografie.italia,
              prestazioni: prevData.mercatoEcografie.italia.prestazioni.map(p =>
                p.codice === codice ? { ...p, aggredibile: result.aggredibile } : p
              )
            }
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore toggle aggredibile ${codice}:`, error);
    }
  }, []);

  // Set percentuale Extra-SSN (tramite API)
  const setPercentualeExtraSSN = useCallback(async (codice: string, percentuale: number) => {
    if (percentuale < 0 || percentuale > 100) {
      console.error(`❌ Percentuale non valida: ${percentuale}. Deve essere 0-100.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/database/percentuale/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentuale })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Percentuale ${codice}: ${percentuale}%`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          mercatoEcografie: {
            ...prevData.mercatoEcografie,
            italia: {
              ...prevData.mercatoEcografie.italia,
              prestazioni: prevData.mercatoEcografie.italia.prestazioni.map(p =>
                p.codice === codice ? { ...p, percentualeExtraSSN: percentuale } : p
              )
            }
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento percentuale ${codice}:`, error);
    }
  }, []);

  // Aggiorna moltiplicatori regionali
  const updateRegioneMoltiplicatori = useCallback(async (
    regioneId: string,
    moltiplicatoreVolume?: number,
    moltiplicatoreValore?: number
  ) => {
    try {
      const body: Record<string, number> = {};
      if (moltiplicatoreVolume !== undefined) body.moltiplicatoreVolume = moltiplicatoreVolume;
      if (moltiplicatoreValore !== undefined) body.moltiplicatoreValore = moltiplicatoreValore;

      const response = await fetch(`${API_BASE_URL}/regioni/${regioneId}/moltiplicatore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Moltiplicatori ${regioneId} aggiornati`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento moltiplicatori ${regioneId}:`, error);
    }
  }, [refreshData]);

  // ============================================================================
  // MERCATO ECOGRAFI - METODI
  // ============================================================================

  // Aggiorna configurazione mercato ecografi
  const updateConfigurazioneEcografi = useCallback(async (updates: Partial<ConfigurazioneMercatoEcografi>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/configurazione`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione ecografi aggiornata');
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione ecografi:', error);
    }
  }, [refreshData]);

  // Toggle visible per una tipologia
  const toggleTipologiaVisible = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/toggle-tipologia/${id}/visible`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle visible tipologia ${id}: ${result.visible}`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore toggle visible tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // Toggle target per una tipologia
  const toggleTipologiaTarget = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/toggle-tipologia/${id}/target`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Toggle target tipologia ${id}: ${result.target}`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore toggle target tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // Aggiorna una tipologia
  const updateTipologia = useCallback(async (id: string, updates: Partial<TipologiaEcografo>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ecografi/tipologia/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Tipologia ${id} aggiornata`);
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error(`❌ Errore aggiornamento tipologia ${id}:`, error);
    }
  }, [refreshData]);

  // ============================================================================
  // TAM/SAM/SOM
  // ============================================================================

  // Update configurazione TAM/SAM/SOM Ecografie
  const updateConfigurazioneTamSamSomEcografie = useCallback(async (updates: Partial<ConfigurazioneTamSamSomEcografie>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/tam-sam-som/ecografie`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione TAM/SAM/SOM Ecografie aggiornata:', updates);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData || !prevData.configurazioneTamSamSom?.ecografie) return prevData;
        
        const currentConfig = prevData.configurazioneTamSamSom.ecografie;
        
        return {
          ...prevData,
          configurazioneTamSamSom: {
            ...prevData.configurazioneTamSamSom,
            ecografie: {
              priceMode: updates.priceMode ?? currentConfig.priceMode,
              prezzoMedioProcedura: updates.prezzoMedioProcedura ?? currentConfig.prezzoMedioProcedura,
              tipoPrezzo: updates.tipoPrezzo ?? currentConfig.tipoPrezzo,
              regioneSelezionata: updates.regioneSelezionata ?? currentConfig.regioneSelezionata,
              volumeMode: updates.volumeMode ?? currentConfig.volumeMode,
              samPercentage: updates.samPercentage ?? currentConfig.samPercentage,
              somPercentages: updates.somPercentages ?? currentConfig.somPercentages,
              valoriCalcolati: updates.valoriCalcolati ?? currentConfig.valoriCalcolati,
              lastUpdate: new Date().toISOString()
            }
          }
        };
      });
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografie:', error);
    }
  }, []);

  // Update configurazione TAM/SAM/SOM Ecografi
  const updateConfigurazioneTamSamSomEcografi = useCallback(async (updates: Partial<ConfigurazioneTamSamSomEcografi>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/tam-sam-som/ecografi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log('✅ Configurazione TAM/SAM/SOM Ecografi aggiornata');
      
      // Ricarica dati dal server
      await refreshData();
    } catch (error) {
      console.error('❌ Errore aggiornamento configurazione TAM/SAM/SOM Ecografi:', error);
    }
  }, [refreshData]);

  // Update prezzo ecografia regionalizzato - OTTIMIZZATO: aggiorna solo lo stato locale
  const updatePrezzoEcografiaRegionalizzato = useCallback(async (regione: string, codice: string, updates: Partial<PrezzoEcografia>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/database/prezzi-regionalizzati/${regione}/${codice}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      console.log(`✅ Prezzo ${codice} (${regione}) aggiornato`);
      
      // OTTIMIZZAZIONE: Aggiorna solo lo stato locale invece di ricaricare tutto!
      setData(prevData => {
        if (!prevData || !prevData.prezziEcografieRegionalizzati) return prevData;
        
        const regioneKey = regione as keyof typeof prevData.prezziEcografieRegionalizzati;
        const prezziRegione = prevData.prezziEcografieRegionalizzati[regioneKey];
        
        if (!prezziRegione || !Array.isArray(prezziRegione)) return prevData;
        
        return {
          ...prevData,
          prezziEcografieRegionalizzati: {
            ...prevData.prezziEcografieRegionalizzati,
            [regioneKey]: prezziRegione.map(p =>
              p.codice === codice ? { ...p, ...updates } : p
            )
          }
        };
      });
    } catch (error) {
      console.error(`❌ Errore aggiornamento prezzo ${codice} (${regione}):`, error);
    }
  }, []);

  // ============================================================================
  // GENERALI
  // ============================================================================

  // Reset ai valori di default
  const resetToDefaults = useCallback(async () => {
    if (!window.confirm('⚠️ Sicuro di voler ripristinare tutti i dati ai valori di default? Tutte le modifiche andranno perse.')) {
      return;
    }

    alert('ℹ️ Per resettare il database, riavvia il server o ripristina manualmente database.json');
    // TODO: Implementare endpoint API per reset
  }, []);

  // Export database come JSON
  const exportDatabase = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  // Valore del context
  const value: DatabaseContextValue = {
    data,
    loading,
    lastUpdate,
    // Ecografie
    updatePrestazione,
    toggleAggredibile,
    setPercentualeExtraSSN,
    updateRegioneMoltiplicatori,
    // Ecografi
    updateConfigurazioneEcografi,
    toggleTipologiaVisible,
    toggleTipologiaTarget,
    updateTipologia,
    // TAM/SAM/SOM
    updateConfigurazioneTamSamSomEcografie,
    updateConfigurazioneTamSamSomEcografi,
    updatePrezzoEcografiaRegionalizzato,
    // Generali
    resetToDefaults,
    exportDatabase,
    refreshData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase deve essere usato dentro DatabaseProvider');
  }
  return context;
}

