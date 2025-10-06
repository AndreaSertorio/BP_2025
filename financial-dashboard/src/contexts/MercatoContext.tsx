/**
 * ============================================================================
 * CONTEXT MERCATO - SINGLE SOURCE OF TRUTH
 * ============================================================================
 * 
 * Context React per gestione centralizzata dello stato Mercato Ecografi.
 * Fornisce stato globale, azioni, persistenza e calcoli derivati.
 * 
 * CARATTERISTICHE:
 * - Stato centralizzato con React Context
 * - Persistenza automatica in localStorage
 * - Export/Import scenari in JSON
 * - Calcoli derivati memoizzati
 * - Type-safe con TypeScript
 * - Undo/Redo support
 * 
 * UTILIZZO:
 * ```tsx
 * import { useMercato } from '@/contexts/MercatoContext';
 * 
 * function Component() {
 *   const { stato, azioni, calcolati } = useMercato();
 *   // ... use stato, azioni, calcolati
 * }
 * ```
 * 
 * Created: 2025-01-05
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import {
  StatoMercato,
  ConfigurazioneMercato,
  ScenarioMercato,
  CollectionScenari,
  DatiCalcolatiMercato,
  AzioneMercato,
  PayloadAzione,
  DEFAULT_CONFIGURAZIONE,
  ScenarioParcoIT,
  isAnnoValido,
  isMarketShareValido,
  ScenarioMercatoSerializable,
  TipologiaEcografo,
  ProiezioneItaliaAnno,
  QuoteTipologieAnno,
  ParcoDispositiviITAnno,
  NumeroEcografiRegione,
  ValoreMercatoRegione
} from '@/types/mercato.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const VERSIONE_DATI = '1.0.0';
const STORAGE_KEY_STATO = 'eco3d_mercato_stato';
const STORAGE_KEY_SCENARI = 'eco3d_mercato_scenari';
const MAX_HISTORY = 50; // Per undo/redo

// ============================================================================
// TYPES
// ============================================================================

interface MercatoContextValue {
  /** Stato corrente */
  stato: StatoMercato;
  
  /** Dati calcolati (memoizzati) */
  calcolati: DatiCalcolatiMercato;
  
  /** Azioni per modificare lo stato */
  azioni: {
    // Configurazione
    impostaAnnoTarget: (anno: number) => void;
    impostaTipologieTarget: (tipologie: Set<string>) => void;
    impostaRegioniVisibili: (regioni: Set<string>) => void;
    impostaMarketShare: (percentuale: number) => void;
    impostaScenarioParco: (scenario: ScenarioParcoIT) => void;
    
    // UI
    toggleUIElement: (elemento: keyof ConfigurazioneMercato['ui']) => void;
    
    // Dati
    caricaDatiExcel: (dati: StatoMercato['datiBase']) => void;
    
    // Scenari
    salvaScenario: (nome: string, descrizione?: string, tags?: string[]) => string;
    caricaScenario: (scenarioId: string) => void;
    eliminaScenario: (scenarioId: string) => void;
    duplicaScenario: (scenarioId: string, nuovoNome: string) => string;
    listaScenari: () => ScenarioMercato[];
    esportaScenario: (scenarioId: string) => string;
    importaScenario: (jsonString: string) => string;
    
    // Reset
    resetConfigurazione: () => void;
    resetCompleto: () => void;
    
    // Persistenza
    salvaSuLocalStorage: () => void;
    caricaDaLocalStorage: () => boolean;
    
    // History (undo/redo)
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  };
  
  /** Collection scenari */
  scenari: CollectionScenari;
}

// ============================================================================
// STATO INIZIALE
// ============================================================================

const STATO_INIZIALE: StatoMercato = {
  configurazione: DEFAULT_CONFIGURAZIONE,
  datiBase: {
    tipologie: [],
    proiezioniItalia: [],
    quoteTipologie: [],
    parcoIT: [],
    numeroEcografi: [],
    valoreMercato: []
  },
  metadata: {
    loading: false,
    error: null,
    ultimoAggiornamento: null,
    versioneDati: VERSIONE_DATI
  }
};

const SCENARI_INIZIALI: CollectionScenari = {
  attivo: null,
  scenari: {},
  metadata: {
    ultimaSalvatagio: null,
    totaleScenari: 0
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

const MercatoContext = createContext<MercatoContextValue | undefined>(undefined);

// ============================================================================
// REDUCER (per history undo/redo)
// ============================================================================

interface StatoConHistory {
  presente: StatoMercato;
  passato: StatoMercato[];
  futuro: StatoMercato[];
}

type AzioneHistory =
  | { type: 'SET'; stato: StatoMercato }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' };

function reducerHistory(state: StatoConHistory, action: AzioneHistory): StatoConHistory {
  switch (action.type) {
    case 'SET':
      return {
        presente: action.stato,
        passato: [...state.passato, state.presente].slice(-MAX_HISTORY),
        futuro: []
      };
    
    case 'UNDO':
      if (state.passato.length === 0) return state;
      const nuovoPassato = state.passato.slice(0, -1);
      const nuovoPresente = state.passato[state.passato.length - 1];
      return {
        presente: nuovoPresente,
        passato: nuovoPassato,
        futuro: [state.presente, ...state.futuro]
      };
    
    case 'REDO':
      if (state.futuro.length === 0) return state;
      const prossimoPresente = state.futuro[0];
      const nuovoFuturo = state.futuro.slice(1);
      return {
        presente: prossimoPresente,
        passato: [...state.passato, state.presente],
        futuro: nuovoFuturo
      };
    
    case 'CLEAR_HISTORY':
      return {
        presente: state.presente,
        passato: [],
        futuro: []
      };
    
    default:
      return state;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export function MercatoProvider({ children }: { children: React.ReactNode }) {
  // State con history per undo/redo
  const [stateHistory, dispatchHistory] = useReducer(reducerHistory, {
    presente: STATO_INIZIALE,
    passato: [],
    futuro: []
  });
  
  const stato = stateHistory.presente;
  
  // Scenari salvati
  const [scenari, setScenari] = useState<CollectionScenari>(SCENARI_INIZIALI);
  
  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  /**
   * Aggiorna stato e salva in history
   */
  const aggiornaStato = useCallback((nuovoStato: Partial<StatoMercato>) => {
    const statoCompleto: StatoMercato = {
      ...stato,
      ...nuovoStato,
      metadata: {
        ...stato.metadata,
        ...nuovoStato.metadata,
        ultimoAggiornamento: new Date()
      }
    };
    dispatchHistory({ type: 'SET', stato: statoCompleto });
  }, [stato]);
  
  /**
   * Serializza Set<string> per JSON
   */
  const serializeSet = (set: Set<string>): string[] => Array.from(set);
  
  /**
   * Deserializza string[] in Set<string>
   */
  const deserializeSet = (arr: string[]): Set<string> => new Set(arr);
  
  /**
   * Genera ID univoco
   */
  const generaId = (): string => {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // ========================================================================
  // AZIONI CONFIGURAZIONE
  // ========================================================================
  
  const impostaAnnoTarget = useCallback((anno: number) => {
    if (!isAnnoValido(anno)) {
      console.warn(`Anno ${anno} non valido. Deve essere tra 2025 e 2035.`);
      return;
    }
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        annoTarget: anno
      }
    });
  }, [stato, aggiornaStato]);
  
  const impostaTipologieTarget = useCallback((tipologie: Set<string>) => {
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        tipologieTarget: new Set(tipologie)
      }
    });
  }, [stato, aggiornaStato]);
  
  const impostaRegioniVisibili = useCallback((regioni: Set<string>) => {
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        regioniVisibili: new Set(regioni)
      }
    });
  }, [stato, aggiornaStato]);
  
  const impostaMarketShare = useCallback((percentuale: number) => {
    if (!isMarketShareValido(percentuale)) {
      console.warn(`Market share ${percentuale}% non valido. Deve essere tra 0 e 100.`);
      return;
    }
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        marketShareTarget: percentuale
      }
    });
  }, [stato, aggiornaStato]);
  
  const impostaScenarioParco = useCallback((scenario: ScenarioParcoIT) => {
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        scenarioParcoIT: scenario
      }
    });
  }, [stato, aggiornaStato]);
  
  const toggleUIElement = useCallback((elemento: keyof ConfigurazioneMercato['ui']) => {
    aggiornaStato({
      configurazione: {
        ...stato.configurazione,
        ui: {
          ...stato.configurazione.ui,
          [elemento]: !stato.configurazione.ui[elemento]
        }
      }
    });
  }, [stato, aggiornaStato]);
  
  // ========================================================================
  // AZIONI DATI
  // ========================================================================
  
  const caricaDatiExcel = useCallback((dati: StatoMercato['datiBase']) => {
    aggiornaStato({
      datiBase: { ...dati },
      metadata: {
        ...stato.metadata,
        loading: false,
        error: null,
        ultimoAggiornamento: new Date()
      }
    });
  }, [stato, aggiornaStato]);
  
  // ========================================================================
  // AZIONI SCENARI
  // ========================================================================
  
  const salvaScenario = useCallback((nome: string, descrizione?: string, tags?: string[]): string => {
    const id = generaId();
    const nuovoScenario: ScenarioMercato = {
      id,
      nome,
      descrizione,
      dataCreazione: new Date(),
      configurazione: { ...stato.configurazione },
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
        ultimaSalvatagio: new Date(),
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
    
    aggiornaStato({
      configurazione: { ...scenario.configurazione }
    });
    
    setScenari(prev => ({
      ...prev,
      attivo: scenarioId
    }));
  }, [scenari, aggiornaStato]);
  
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
  
  const duplicaScenario = useCallback((scenarioId: string, nuovoNome: string): string => {
    const scenario = scenari.scenari[scenarioId];
    if (!scenario) {
      console.warn(`Scenario ${scenarioId} non trovato`);
      return '';
    }
    
    const nuovoId = generaId();
    const scenarioDuplicato: ScenarioMercato = {
      ...scenario,
      id: nuovoId,
      nome: nuovoNome,
      dataCreazione: new Date()
    };
    
    setScenari(prev => ({
      ...prev,
      scenari: {
        ...prev.scenari,
        [nuovoId]: scenarioDuplicato
      },
      metadata: {
        ultimaSalvatagio: new Date(),
        totaleScenari: Object.keys(prev.scenari).length + 1
      }
    }));
    
    return nuovoId;
  }, [scenari]);
  
  const listaScenari = useCallback((): ScenarioMercato[] => {
    return Object.values(scenari.scenari).sort((a, b) => 
      b.dataCreazione.getTime() - a.dataCreazione.getTime()
    );
  }, [scenari]);
  
  const esportaScenario = useCallback((scenarioId: string): string => {
    const scenario = scenari.scenari[scenarioId];
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} non trovato`);
    }
    
    // Serializza Sets in arrays per JSON
    const scenarioSerializable: ScenarioMercatoSerializable = {
      ...scenario,
      configurazione: {
        ...scenario.configurazione,
        tipologieTarget: serializeSet(scenario.configurazione.tipologieTarget),
        regioniVisibili: serializeSet(scenario.configurazione.regioniVisibili)
      }
    };
    
    return JSON.stringify(scenarioSerializable, null, 2);
  }, [scenari]);
  
  const importaScenario = useCallback((jsonString: string): string => {
    try {
      const scenarioSerializable: ScenarioMercatoSerializable = JSON.parse(jsonString);
      
      // Deserializza arrays in Sets
      const scenario: ScenarioMercato = {
        ...scenarioSerializable,
        id: generaId(), // Nuovo ID per evitare conflitti
        dataCreazione: new Date(),
        configurazione: {
          ...scenarioSerializable.configurazione,
          tipologieTarget: deserializeSet(scenarioSerializable.configurazione.tipologieTarget),
          regioniVisibili: deserializeSet(scenarioSerializable.configurazione.regioniVisibili)
        }
      };
      
      setScenari(prev => ({
        ...prev,
        scenari: {
          ...prev.scenari,
          [scenario.id]: scenario
        },
        metadata: {
          ultimaSalvatagio: new Date(),
          totaleScenari: Object.keys(prev.scenari).length + 1
        }
      }));
      
      return scenario.id;
    } catch (error) {
      console.error('Errore importazione scenario:', error);
      throw new Error('Formato JSON non valido');
    }
  }, []);
  
  // ========================================================================
  // AZIONI RESET
  // ========================================================================
  
  const resetConfigurazione = useCallback(() => {
    aggiornaStato({
      configurazione: { ...DEFAULT_CONFIGURAZIONE }
    });
  }, [aggiornaStato]);
  
  const resetCompleto = useCallback(() => {
    dispatchHistory({ type: 'CLEAR_HISTORY' });
    aggiornaStato(STATO_INIZIALE);
    setScenari(SCENARI_INIZIALI);
    localStorage.removeItem(STORAGE_KEY_STATO);
    localStorage.removeItem(STORAGE_KEY_SCENARI);
  }, [aggiornaStato]);
  
  // ========================================================================
  // PERSISTENZA LOCALSTORAGE
  // ========================================================================
  
  const salvaSuLocalStorage = useCallback(() => {
    try {
      // Salva stato
      const statoSerializable = {
        ...stato,
        configurazione: {
          ...stato.configurazione,
          tipologieTarget: serializeSet(stato.configurazione.tipologieTarget),
          regioniVisibili: serializeSet(stato.configurazione.regioniVisibili)
        }
      };
      localStorage.setItem(STORAGE_KEY_STATO, JSON.stringify(statoSerializable));
      
      // Salva scenari
      const scenariSerializable = {
        ...scenari,
        scenari: Object.fromEntries(
          Object.entries(scenari.scenari).map(([id, scenario]) => [
            id,
            {
              ...scenario,
              configurazione: {
                ...scenario.configurazione,
                tipologieTarget: serializeSet(scenario.configurazione.tipologieTarget),
                regioniVisibili: serializeSet(scenario.configurazione.regioniVisibili)
              }
            }
          ])
        )
      };
      localStorage.setItem(STORAGE_KEY_SCENARI, JSON.stringify(scenariSerializable));
      
      console.log('✅ Stato salvato su localStorage');
      return true;
    } catch (error) {
      console.error('❌ Errore salvataggio localStorage:', error);
      return false;
    }
  }, [stato, scenari]);
  
  const caricaDaLocalStorage = useCallback((): boolean => {
    try {
      // Carica stato
      const statoSalvato = localStorage.getItem(STORAGE_KEY_STATO);
      if (statoSalvato) {
        const statoDeserializzato = JSON.parse(statoSalvato);
        const statoCompleto: StatoMercato = {
          ...statoDeserializzato,
          configurazione: {
            ...statoDeserializzato.configurazione,
            tipologieTarget: deserializeSet(statoDeserializzato.configurazione.tipologieTarget),
            regioniVisibili: deserializeSet(statoDeserializzato.configurazione.regioniVisibili)
          }
        };
        dispatchHistory({ type: 'SET', stato: statoCompleto });
      }
      
      // Carica scenari
      const scenariSalvati = localStorage.getItem(STORAGE_KEY_SCENARI);
      if (scenariSalvati) {
        const scenariDeserializzati = JSON.parse(scenariSalvati);
        const scenariCompleti: CollectionScenari = {
          ...scenariDeserializzati,
          scenari: Object.fromEntries(
            Object.entries(scenariDeserializzati.scenari).map(([id, scenario]: [string, any]) => [
              id,
              {
                ...scenario,
                configurazione: {
                  ...scenario.configurazione,
                  tipologieTarget: deserializeSet(scenario.configurazione.tipologieTarget),
                  regioniVisibili: deserializeSet(scenario.configurazione.regioniVisibili)
                }
              }
            ])
          )
        };
        setScenari(scenariCompleti);
      }
      
      console.log('✅ Stato caricato da localStorage');
      return true;
    } catch (error) {
      console.error('❌ Errore caricamento localStorage:', error);
      return false;
    }
  }, []);
  
  // Carica automaticamente all'avvio
  useEffect(() => {
    caricaDaLocalStorage();
  }, []);
  
  // Salva automaticamente ad ogni modifica (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      salvaSuLocalStorage();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [stato, scenari, salvaSuLocalStorage]);
  
  // ========================================================================
  // HISTORY (UNDO/REDO)
  // ========================================================================
  
  const undo = useCallback(() => {
    dispatchHistory({ type: 'UNDO' });
  }, []);
  
  const redo = useCallback(() => {
    dispatchHistory({ type: 'REDO' });
  }, []);
  
  const canUndo = stateHistory.passato.length > 0;
  const canRedo = stateHistory.futuro.length > 0;
  
  // ========================================================================
  // CALCOLI DERIVATI (MEMOIZZATI)
  // ========================================================================
  
  const calcolati = useMemo((): DatiCalcolatiMercato => {
    const { configurazione, datiBase } = stato;
    const { annoTarget, regioniVisibili, marketShareTarget, scenarioParcoIT } = configurazione;
    
    // Determina anno dati (2025 o 2030)
    const annoData = annoTarget <= 2025 ? 2025 : annoTarget <= 2030 ? 2030 : 2030;
    
    // Mercato globale
    const mercatoMondiale = datiBase.valoreMercato.find(v => v.mercato === 'Mondo (globale)');
    const mercatoGlobaleTarget = mercatoMondiale 
      ? (annoData === 2025 ? mercatoMondiale.valore2025 : mercatoMondiale.valore2030)
      : 0;
    
    // Mercato Italia
    const mercatoItalia = datiBase.valoreMercato.find(v => v.mercato === 'Italia');
    const mercatoItaliaTarget = mercatoItalia
      ? (annoData === 2025 ? mercatoItalia.valore2025 : mercatoItalia.valore2030)
      : 0;
    
    // Unità target regioni selezionate (escluso Mondo)
    const regioniSelezionate = datiBase.numeroEcografi.filter(
      row => regioniVisibili.has(row.mercato) && row.mercato !== 'Mondo (globale)'
    );
    const unitaTotali = regioniSelezionate.reduce((sum, r) => {
      const unita = annoData === 2025 ? r.unita2025 : r.unita2030;
      return sum + unita;
    }, 0);
    const unitaTargetRegioni = Math.round(unitaTotali * marketShareTarget / 100);
    
    // Target Eco 3D
    const unitaTargetEco3D = unitaTargetRegioni;
    const valoreTargetEco3D = 0; // TODO: calcolare basandosi su prezzo medio dispositivo
    
    // Parco dispositivi
    const parcoAnno = datiBase.parcoIT.find(p => p.anno === annoTarget);
    const parcoDispositiviTarget = parcoAnno ? parcoAnno[scenarioParcoIT] : 0;
    
    // Totali regioni selezionate
    const regioniValori = datiBase.valoreMercato.filter(
      row => regioniVisibili.has(row.mercato) && row.mercato !== 'Mondo (globale)'
    );
    const totaliRegioniSelezionate = {
      unita2025: regioniSelezionate.reduce((sum, r) => sum + r.unita2025, 0),
      unita2030: regioniSelezionate.reduce((sum, r) => sum + r.unita2030, 0),
      valore2025: regioniValori.reduce((sum, r) => sum + r.valore2025, 0),
      valore2030: regioniValori.reduce((sum, r) => sum + r.valore2030, 0),
      cagrMedio: regioniValori.length > 0
        ? regioniValori.reduce((sum, r) => sum + r.cagr, 0) / regioniValori.length
        : 0
    };
    
    // Chart data
    const chartData = {
      totaleGlobale: mercatoGlobaleTarget,
      totaleItalia: mercatoItaliaTarget,
      targetValue: valoreTargetEco3D,
      distribuzioneQuote: [] // TODO: calcolare distribuzione
    };
    
    return {
      mercatoGlobaleTarget,
      mercatoItaliaTarget,
      unitaTargetRegioni,
      unitaTargetEco3D,
      valoreTargetEco3D,
      parcoDispositiviTarget,
      totaliRegioniSelezionate,
      chartData
    };
  }, [stato]);
  
  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================
  
  const value: MercatoContextValue = {
    stato,
    calcolati,
    azioni: {
      impostaAnnoTarget,
      impostaTipologieTarget,
      impostaRegioniVisibili,
      impostaMarketShare,
      impostaScenarioParco,
      toggleUIElement,
      caricaDatiExcel,
      salvaScenario,
      caricaScenario,
      eliminaScenario,
      duplicaScenario,
      listaScenari,
      esportaScenario,
      importaScenario,
      resetConfigurazione,
      resetCompleto,
      salvaSuLocalStorage,
      caricaDaLocalStorage,
      undo,
      redo,
      canUndo,
      canRedo
    },
    scenari
  };
  
  return (
    <MercatoContext.Provider value={value}>
      {children}
    </MercatoContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook per accedere al context Mercato
 */
export function useMercato(): MercatoContextValue {
  const context = useContext(MercatoContext);
  if (!context) {
    throw new Error('useMercato deve essere usato all\'interno di MercatoProvider');
  }
  return context;
}

/**
 * Hook per accedere solo alle azioni (ottimizzazione re-render)
 */
export function useMercatoAzioni() {
  const { azioni } = useMercato();
  return azioni;
}

/**
 * Hook per accedere solo ai calcoli (ottimizzazione re-render)
 */
export function useMercatoCalcolati() {
  const { calcolati } = useMercato();
  return calcolati;
}

/**
 * Hook per accedere solo agli scenari
 */
export function useMercatoScenari() {
  const { scenari, azioni } = useMercato();
  return {
    scenari,
    salvaScenario: azioni.salvaScenario,
    caricaScenario: azioni.caricaScenario,
    eliminaScenario: azioni.eliminaScenario,
    duplicaScenario: azioni.duplicaScenario,
    listaScenari: azioni.listaScenari,
    esportaScenario: azioni.esportaScenario,
    importaScenario: azioni.importaScenario
  };
}
