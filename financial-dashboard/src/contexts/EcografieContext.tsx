/**
 * ============================================================================
 * ECOGRAFIE CONTEXT - PLAYERPREFS SYSTEM
 * ============================================================================
 * 
 * Context per gestione centralizzata Mercato Ecografie.
 * Filosofia PlayerPrefs: salvare solo dati essenziali (Italia U/B/D/P + config),
 * calcolare tutto il resto on-demand.
 * 
 * Created: 2025-01-05
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  StatoEcografie,
  DatiPrestazioneItalia,
  DatiCalcolatiEcografie,
  ScenarioEcografie,
  CollectionScenariEcografie,
  RegioneEcografie,
  MOLTIPLICATORI_DEFAULT,
  PERCENTUALE_EXTRA_SSN_DEFAULT,
  ANNO_RIFERIMENTO_DEFAULT,
  PRESTAZIONI_ECOGRAFICHE
} from '@/types/ecografie.types';

import {
  calcolaTotaliItalia,
  calcolaTotaleGeneraleItalia,
  calcolaMercatoAggredibileItalia,
  calcolaDatiRegione,
  calcolaTotaleGeneraleRegione
} from '@/lib/ecografie-utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const VERSIONE_DATI = '1.0.0';
const STORAGE_KEY_STATO = 'eco3d_ecografie_stato';
const STORAGE_KEY_SCENARI = 'eco3d_ecografie_scenari';

// ============================================================================
// TYPES
// ============================================================================

interface EcografieContextValue {
  stato: StatoEcografie;
  calcolati: DatiCalcolatiEcografie;
  azioni: {
    // Dati Italia
    aggiornaPrestazioneItalia: (prestazione: string, dati: Partial<DatiPrestazioneItalia>) => void;
    impostaPercentualeExtraSSN: (valore: number) => void;
    togglePrestazioneAggredibile: (prestazione: string) => void;
    
    // Moltiplicatori regioni
    impostaMoltiplicatoreVolume: (regione: keyof StatoEcografie['regioni'], valore: number) => void;
    impostaMoltiplicatoreValore: (regione: keyof StatoEcografie['regioni'], valore: number) => void;
    
    // Dati bulk
    caricaDatiExcel: (dati: Partial<StatoEcografie>) => void;
    
    // Scenari
    salvaScenario: (nome: string, descrizione?: string, tags?: string[]) => string;
    caricaScenario: (scenarioId: string) => void;
    eliminaScenario: (scenarioId: string) => void;
    listaScenari: () => ScenarioEcografie[];
    esportaScenario: (scenarioId: string) => string;
    importaScenario: (jsonString: string) => string;
    
    // Reset
    resetConfigurazione: () => void;
    salvaSuLocalStorage: () => void;
    caricaDaLocalStorage: () => boolean;
  };
  scenari: CollectionScenariEcografie;
}

// ============================================================================
// STATO INIZIALE
// ============================================================================

const STATO_INIZIALE: StatoEcografie = {
  italia: {
    prestazioni: PRESTAZIONI_ECOGRAFICHE.map(p => ({
      prestazione: p,
      U: 0,
      B: 0,
      D: 0,
      P: 0,
      aggredibile: true
    })),
    percentualeExtraSSN: PERCENTUALE_EXTRA_SSN_DEFAULT,
    annoRiferimento: ANNO_RIFERIMENTO_DEFAULT
  },
  regioni: {
    usa: {
      regione: RegioneEcografie.USA,
      moltiplicatoreVolume: MOLTIPLICATORI_DEFAULT.usa.volume,
      moltiplicatoreValore: MOLTIPLICATORI_DEFAULT.usa.valore,
      volumeRange: MOLTIPLICATORI_DEFAULT.usa.volumeRange,
      valoreRange: MOLTIPLICATORI_DEFAULT.usa.valoreRange,
      italyQuota: MOLTIPLICATORI_DEFAULT.usa.italyQuota
    },
    europa: {
      regione: RegioneEcografie.EUROPA,
      moltiplicatoreVolume: MOLTIPLICATORI_DEFAULT.europa.volume,
      moltiplicatoreValore: MOLTIPLICATORI_DEFAULT.europa.valore,
      volumeRange: MOLTIPLICATORI_DEFAULT.europa.volumeRange,
      valoreRange: MOLTIPLICATORI_DEFAULT.europa.valoreRange,
      italyQuota: MOLTIPLICATORI_DEFAULT.europa.italyQuota
    },
    cina: {
      regione: RegioneEcografie.CINA,
      moltiplicatoreVolume: MOLTIPLICATORI_DEFAULT.cina.volume,
      moltiplicatoreValore: MOLTIPLICATORI_DEFAULT.cina.valore,
      volumeRange: MOLTIPLICATORI_DEFAULT.cina.volumeRange,
      valoreRange: MOLTIPLICATORI_DEFAULT.cina.valoreRange,
      italyQuota: MOLTIPLICATORI_DEFAULT.cina.italyQuota
    },
    globale: {
      regione: RegioneEcografie.GLOBALE,
      moltiplicatoreVolume: MOLTIPLICATORI_DEFAULT.globale.volume,
      moltiplicatoreValore: MOLTIPLICATORI_DEFAULT.globale.valore,
      volumeRange: MOLTIPLICATORI_DEFAULT.globale.volumeRange,
      valoreRange: MOLTIPLICATORI_DEFAULT.globale.valoreRange,
      italyQuota: MOLTIPLICATORI_DEFAULT.globale.italyQuota
    }
  },
  metadata: {
    loading: false,
    error: null,
    ultimoAggiornamento: null,
    versioneDati: VERSIONE_DATI
  }
};

const SCENARI_INIZIALI: CollectionScenariEcografie = {
  attivo: null,
  scenari: {},
  metadata: {
    ultimaSalvataggio: null,
    totaleScenari: 0
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

const EcografieContext = createContext<EcografieContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function EcografieProvider({ children }: { children: React.ReactNode }) {
  const [stato, setStato] = useState<StatoEcografie>(STATO_INIZIALE);
  const [scenari, setScenari] = useState<CollectionScenariEcografie>(SCENARI_INIZIALI);
  
  // ========================================================================
  // UTILITY
  // ========================================================================
  
  const aggiornaStato = useCallback((nuovoStato: Partial<StatoEcografie>) => {
    setStato(prev => ({
      ...prev,
      ...nuovoStato,
      metadata: {
        ...prev.metadata,
        ultimoAggiornamento: new Date()
      }
    }));
  }, []);
  
  const generaId = (): string => {
    return `ecografie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // ========================================================================
  // AZIONI DATI ITALIA
  // ========================================================================
  
  const aggiornaPrestazioneItalia = useCallback((prestazione: string, dati: Partial<DatiPrestazioneItalia>) => {
    setStato(prev => {
      const nuovePrestazioni = prev.italia.prestazioni.map(p =>
        p.prestazione === prestazione ? { ...p, ...dati } : p
      );
      
      return {
        ...prev,
        italia: {
          ...prev.italia,
          prestazioni: nuovePrestazioni
        }
      };
    });
  }, []);
  
  const impostaPercentualeExtraSSN = useCallback((valore: number) => {
    if (valore < 0 || valore > 100) {
      console.warn('Percentuale Extra SSN deve essere tra 0 e 100');
      return;
    }
    
    setStato(prev => ({
      ...prev,
      italia: {
        ...prev.italia,
        percentualeExtraSSN: valore
      }
    }));
  }, []);
  
  const togglePrestazioneAggredibile = useCallback((prestazione: string) => {
    setStato(prev => {
      const nuovePrestazioni = prev.italia.prestazioni.map(p =>
        p.prestazione === prestazione ? { ...p, aggredibile: !p.aggredibile } : p
      );
      
      return {
        ...prev,
        italia: {
          ...prev.italia,
          prestazioni: nuovePrestazioni
        }
      };
    });
  }, []);
  
  // ========================================================================
  // AZIONI MOLTIPLICATORI
  // ========================================================================
  
  const impostaMoltiplicatoreVolume = useCallback((
    regione: keyof StatoEcografie['regioni'],
    valore: number
  ) => {
    if (valore <= 0) {
      console.warn('Moltiplicatore deve essere > 0');
      return;
    }
    
    setStato(prev => ({
      ...prev,
      regioni: {
        ...prev.regioni,
        [regione]: {
          ...prev.regioni[regione],
          moltiplicatoreVolume: valore
        }
      }
    }));
  }, []);
  
  const impostaMoltiplicatoreValore = useCallback((
    regione: keyof StatoEcografie['regioni'],
    valore: number
  ) => {
    if (valore <= 0) {
      console.warn('Moltiplicatore deve essere > 0');
      return;
    }
    
    setStato(prev => ({
      ...prev,
      regioni: {
        ...prev.regioni,
        [regione]: {
          ...prev.regioni[regione],
          moltiplicatoreValore: valore
        }
      }
    }));
  }, []);
  
  // ========================================================================
  // CARICA DATI EXCEL
  // ========================================================================
  
  const caricaDatiExcel = useCallback((dati: Partial<StatoEcografie>) => {
    aggiornaStato(dati);
  }, [aggiornaStato]);
  
  // ========================================================================
  // SCENARI
  // ========================================================================
  
  const salvaScenario = useCallback((nome: string, descrizione?: string, tags?: string[]): string => {
    const id = generaId();
    const nuovoScenario: ScenarioEcografie = {
      id,
      nome,
      descrizione,
      dataCreazione: new Date(),
      configurazione: { ...stato },
      versioneDati: VERSIONE_DATI,
      tags
    };
    
    setScenari(prev => ({
      ...prev,
      scenari: {
        ...prev.scenari,
        [id]: nuovoScenario
      },
      metadata: {
        ultimaSalvataggio: new Date(),
        totaleScenari: Object.keys(prev.scenari).length + 1
      }
    }));
    
    return id;
  }, [stato]);
  
  const caricaScenario = useCallback((scenarioId: string) => {
    const scenario = scenari.scenari[scenarioId];
    if (!scenario) {
      console.warn(`Scenario ${scenarioId} non trovato`);
      return;
    }
    
    setStato(scenario.configurazione);
    setScenari(prev => ({ ...prev, attivo: scenarioId }));
  }, [scenari]);
  
  const eliminaScenario = useCallback((scenarioId: string) => {
    setScenari(prev => {
      const nuoviScenari = { ...prev.scenari };
      delete nuoviScenari[scenarioId];
      
      return {
        ...prev,
        scenari: nuoviScenari,
        attivo: prev.attivo === scenarioId ? null : prev.attivo,
        metadata: {
          ...prev.metadata,
          totaleScenari: Object.keys(nuoviScenari).length
        }
      };
    });
  }, []);
  
  const listaScenari = useCallback((): ScenarioEcografie[] => {
    return Object.values(scenari.scenari).sort((a, b) => 
      b.dataCreazione.getTime() - a.dataCreazione.getTime()
    );
  }, [scenari]);
  
  const esportaScenario = useCallback((scenarioId: string): string => {
    const scenario = scenari.scenari[scenarioId];
    if (!scenario) throw new Error(`Scenario ${scenarioId} non trovato`);
    return JSON.stringify(scenario, null, 2);
  }, [scenari]);
  
  const importaScenario = useCallback((jsonString: string): string => {
    try {
      const scenario = JSON.parse(jsonString);
      scenario.id = generaId();
      scenario.dataCreazione = new Date();
      
      setScenari(prev => ({
        ...prev,
        scenari: {
          ...prev.scenari,
          [scenario.id]: scenario
        },
        metadata: {
          ultimaSalvataggio: new Date(),
          totaleScenari: Object.keys(prev.scenari).length + 1
        }
      }));
      
      return scenario.id;
    } catch {
      throw new Error('Formato JSON non valido');
    }
  }, []);
  
  // ========================================================================
  // RESET
  // ========================================================================
  
  const resetConfigurazione = useCallback(() => {
    setStato(STATO_INIZIALE);
  }, []);
  
  // ========================================================================
  // PERSISTENZA
  // ========================================================================
  
  const salvaSuLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATO, JSON.stringify(stato));
      localStorage.setItem(STORAGE_KEY_SCENARI, JSON.stringify(scenari));
      return true;
    } catch (error) {
      console.error('Errore salvataggio localStorage:', error);
      return false;
    }
  }, [stato, scenari]);
  
  const caricaDaLocalStorage = useCallback((): boolean => {
    try {
      const statoSalvato = localStorage.getItem(STORAGE_KEY_STATO);
      if (statoSalvato) setStato(JSON.parse(statoSalvato));
      
      const scenariSalvati = localStorage.getItem(STORAGE_KEY_SCENARI);
      if (scenariSalvati) setScenari(JSON.parse(scenariSalvati));
      
      return true;
    } catch (error) {
      console.error('Errore caricamento localStorage:', error);
      return false;
    }
  }, []);
  
  // Carica all'avvio
  useEffect(() => {
    caricaDaLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Salva automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      salvaSuLocalStorage();
    }, 1000);
    return () => clearTimeout(timer);
  }, [stato, scenari, salvaSuLocalStorage]);
  
  // ========================================================================
  // CALCOLI DERIVATI
  // ========================================================================
  
  const calcolati = useMemo((): DatiCalcolatiEcografie => {
    // Italia
    const totaliItalia = calcolaTotaliItalia(
      stato.italia.prestazioni,
      stato.italia.percentualeExtraSSN
    );
    
    const totaleGeneraleItalia = calcolaTotaleGeneraleItalia(totaliItalia);
    const mercatoAggredibile = calcolaMercatoAggredibileItalia(totaliItalia);
    
    // USA
    const prestazioniUSA = calcolaDatiRegione(totaliItalia, stato.regioni.usa);
    const totaleGeneraleUSA = calcolaTotaleGeneraleRegione(prestazioniUSA);
    
    // Europa
    const prestazioniEuropa = calcolaDatiRegione(totaliItalia, stato.regioni.europa);
    const totaleGeneraleEuropa = calcolaTotaleGeneraleRegione(prestazioniEuropa);
    
    // Cina
    const prestazioniCina = calcolaDatiRegione(totaliItalia, stato.regioni.cina);
    const totaleGeneraleCina = calcolaTotaleGeneraleRegione(prestazioniCina);
    
    // Globale
    const prestazioniGlobale = calcolaDatiRegione(totaliItalia, stato.regioni.globale);
    const totaleGeneraleGlobale = calcolaTotaleGeneraleRegione(prestazioniGlobale);
    
    return {
      italia: {
        prestazioni: totaliItalia,
        totaleGenerale: totaleGeneraleItalia,
        mercatoAggredibile
      },
      usa: {
        prestazioni: prestazioniUSA,
        totaleGenerale: totaleGeneraleUSA
      },
      europa: {
        prestazioni: prestazioniEuropa,
        totaleGenerale: totaleGeneraleEuropa
      },
      cina: {
        prestazioni: prestazioniCina,
        totaleGenerale: totaleGeneraleCina
      },
      globale: {
        prestazioni: prestazioniGlobale,
        totaleGenerale: totaleGeneraleGlobale
      }
    };
  }, [stato]);
  
  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================
  
  const value: EcografieContextValue = {
    stato,
    calcolati,
    azioni: {
      aggiornaPrestazioneItalia,
      impostaPercentualeExtraSSN,
      togglePrestazioneAggredibile,
      impostaMoltiplicatoreVolume,
      impostaMoltiplicatoreValore,
      caricaDatiExcel,
      salvaScenario,
      caricaScenario,
      eliminaScenario,
      listaScenari,
      esportaScenario,
      importaScenario,
      resetConfigurazione,
      salvaSuLocalStorage,
      caricaDaLocalStorage
    },
    scenari
  };
  
  return (
    <EcografieContext.Provider value={value}>
      {children}
    </EcografieContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useEcografie(): EcografieContextValue {
  const context = useContext(EcografieContext);
  if (!context) {
    throw new Error('useEcografie deve essere usato dentro EcografieProvider');
  }
  return context;
}

export function useEcografieAzioni() {
  const { azioni } = useEcografie();
  return azioni;
}

export function useEcografieCalcolati() {
  const { calcolati } = useEcografie();
  return calcolati;
}

export function useEcografieScenari() {
  const { scenari, azioni } = useEcografie();
  return {
    scenari,
    salvaScenario: azioni.salvaScenario,
    caricaScenario: azioni.caricaScenario,
    eliminaScenario: azioni.eliminaScenario,
    listaScenari: azioni.listaScenari,
    esportaScenario: azioni.esportaScenario,
    importaScenario: azioni.importaScenario
  };
}
