/**
 * ============================================================================
 * TYPES E INTERFACCE - MERCATO ECOGRAFI
 * ============================================================================
 * 
 * File centrale per tutte le definizioni TypeScript del modulo Mercato.
 * Questo è il MASTER TYPE SYSTEM che definisce la struttura di tutti i dati.
 * 
 * FILOSOFIA:
 * - Single Source of Truth per types
 * - Immutabilità tramite readonly dove appropriato
 * - Validazione tramite type guards
 * - Documentazione inline dettagliata
 * 
 * Created: 2025-01-05
 * Last Modified: 2025-01-05
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Scenari disponibili per il parco dispositivi Italia
 */
export enum ScenarioParcoIT {
  BASSO = 'basso',      // Scenario pessimistico: dismissioni 8%
  CENTRALE = 'centrale', // Scenario base: dismissioni 7%
  ALTO = 'alto'         // Scenario ottimistico: dismissioni 6%
}

/**
 * Tipologie di ecografi riconosciute
 */
export enum TipologiaEcografoEnum {
  CARRELLATI = 'Carrellati',
  PORTATILI = 'Portatili',
  PALMARI = 'Palmari',
  PREMIUM = 'Premium',
  POCUS = 'POCUS'
}

/**
 * Regioni geografiche per analisi mercato
 */
export enum RegioneGeografica {
  ITALIA = 'Italia',
  EUROPA = 'Europa',
  STATI_UNITI = 'Stati Uniti',
  CINA = 'Cina',
  MONDO_GLOBALE = 'Mondo (globale)' // Sempre separato, mai sommabile
}

/**
 * Provider di dati mercato
 */
export enum ProviderDatiMercato {
  MORDOR = 'mordor',
  RESEARCH_AND_MARKETS = 'research',
  GRAND_VIEW_RESEARCH = 'grandview',
  COGNITIVE_MARKET = 'cognitive'
}

// ============================================================================
// INTERFACCE DATI BASE (DA EXCEL)
// ============================================================================

/**
 * Dati tipologia ecografo - combinazione Excel + calcoli
 */
export interface TipologiaEcografo {
  /** Nome tipologia */
  tipologia: string;
  
  /** Emoji/Icon per UI */
  icon: string;
  
  /** Quota mercato Italia (0-1) per anno target */
  quotaIT: number;
  
  /** Valore mercato Italia in M$ per anno target */
  valoreIT: number;
  
  /** Quota mercato globale (0-1) */
  quotaGlobale: number;
  
  /** Valore mercato globale in M$ */
  valoreGlobale: number;
  
  /** CAGR globale (es: "0.055 (2024-2030)") */
  cagrGlobale: string;
  
  /** Note aggiuntive da Excel */
  note: string;
  
  /** Visibilità in UI */
  visible: boolean;
  
  /** Flag se è target Eco 3D */
  target: boolean;
}

/**
 * Proiezione mercato Italia da un provider
 * Fonte: ECO_DatiMercato.xlsx
 */
export interface ProiezioneItaliaAnno {
  /** Anno di riferimento */
  anno: number;
  
  /** Valore Mordor Intelligence (M$) */
  mordor: number;
  
  /** Valore Research & Markets (M$) */
  research: number;
  
  /** Valore Grand View Research (M$) */
  grandview: number;
  
  /** Valore Cognitive Market Research (M$) */
  cognitive: number;
  
  /** Media aritmetica dei 4 provider (M$) */
  media: number;
  
  /** Mediana dei 4 provider (M$) */
  mediana: number;
}

/**
 * Quote tipologie per anno
 * Fonte: ECO_DatiMercato.xlsx, Sheet "Quote Tipologie"
 */
export interface QuoteTipologieAnno {
  /** Anno di riferimento */
  anno: number;
  
  /** Quota Carrellati (0-1) */
  carrellati: number;
  
  /** Quota Portatili (0-1) */
  portatili: number;
  
  /** Quota Palmari (0-1) */
  palmari: number;
}

/**
 * Parco dispositivi Italia con scenari
 * Fonte: ECO_Proiezioni_Ecografi_2025_2030.xlsx, Sheet "Parco_IT_2025-2035"
 */
export interface ParcoDispositiviITAnno {
  /** Anno di riferimento (2025-2035) */
  anno: number;
  
  /** Scenario basso: dismissioni 8% */
  basso: number;
  
  /** Scenario centrale: dismissioni 7% (default) */
  centrale: number;
  
  /** Scenario alto: dismissioni 6% */
  alto: number;
}

/**
 * Numero ecografi venduti per regione
 * Fonte: ECO_Proiezioni_Ecografi_2025_2030.xlsx, Sheet "Numero Ecografi"
 */
export interface NumeroEcografiRegione {
  /** Nome regione */
  mercato: string;
  
  /** Unità vendute nel 2025 */
  unita2025: number;
  
  /** Unità vendute nel 2030 (proiezione) */
  unita2030: number;
}

/**
 * Valore mercato per regione con CAGR
 * Fonte: ECO_Proiezioni_Ecografi_2025_2030.xlsx, Sheet "Valore Mercato"
 */
export interface ValoreMercatoRegione {
  /** Nome regione */
  mercato: string;
  
  /** Valore mercato 2025 in M$ */
  valore2025: number;
  
  /** Valore mercato 2030 in M$ (proiezione) */
  valore2030: number;
  
  /** CAGR 2025-2030 in percentuale (es: 4.3 = 4.3%) */
  cagr: number;
}

// ============================================================================
// CONFIGURAZIONE UTENTE (MODIFICABILE)
// ============================================================================

/**
 * Configurazione modificabile dall'utente
 * Questi sono i parametri che determinano gli scenari
 */
export interface ConfigurazioneMercato {
  /** Anno target per analisi (2025-2035) */
  annoTarget: number;
  
  /** Set di tipologie selezionate come target Eco 3D */
  tipologieTarget: Set<string>;
  
  /** Set di regioni geografiche visibili/selezionate */
  regioniVisibili: Set<string>;
  
  /** Percentuale market share obiettivo (0-100) */
  marketShareTarget: number;
  
  /** Scenario parco dispositivi Italia */
  scenarioParcoIT: ScenarioParcoIT;
  
  /** Visibilità sezioni avanzate */
  ui: {
    showProiezioniEstese: boolean;
    showProviderDetails: boolean;
    showGraficiItalia: boolean;
    showGraficiQuote: boolean;
    showGraficiGlobali: boolean;
    showGraficiNumero: boolean;
  };
}

/**
 * Defaults per configurazione
 */
export const DEFAULT_CONFIGURAZIONE: ConfigurazioneMercato = {
  annoTarget: 2030,
  tipologieTarget: new Set(['Palmari']),
  regioniVisibili: new Set(['Italia', 'Europa', 'Stati Uniti', 'Cina']),
  marketShareTarget: 1.0,
  scenarioParcoIT: ScenarioParcoIT.CENTRALE,
  ui: {
    showProiezioniEstese: false,
    showProviderDetails: false,
    showGraficiItalia: false,
    showGraficiQuote: false,
    showGraficiGlobali: false,
    showGraficiNumero: false
  }
};

// ============================================================================
// STATO COMPLETO MERCATO
// ============================================================================

/**
 * Stato completo del modulo Mercato
 * Questa è la Single Source of Truth runtime
 */
export interface StatoMercato {
  /** Configurazione corrente (modificabile) */
  configurazione: ConfigurazioneMercato;
  
  /** Dati caricati da Excel (immutabili) */
  datiBase: {
    tipologie: TipologiaEcografo[];
    proiezioniItalia: ProiezioneItaliaAnno[];
    quoteTipologie: QuoteTipologieAnno[];
    parcoIT: ParcoDispositiviITAnno[];
    numeroEcografi: NumeroEcografiRegione[];
    valoreMercato: ValoreMercatoRegione[];
  };
  
  /** Metadata caricamento */
  metadata: {
    loading: boolean;
    error: string | null;
    ultimoAggiornamento: Date | null;
    versioneDati: string;
  };
}

// ============================================================================
// DATI CALCOLATI (DERIVATI)
// ============================================================================

/**
 * Calcoli derivati dai dati base + configurazione
 * Questi sono sempre calcolabili on-the-fly
 */
export interface DatiCalcolatiMercato {
  /** Totale mercato globale per anno target */
  mercatoGlobaleTarget: number;
  
  /** Totale mercato Italia per anno target */
  mercatoItaliaTarget: number;
  
  /** Unità target nelle regioni selezionate */
  unitaTargetRegioni: number;
  
  /** Valore target Eco 3D in unità */
  unitaTargetEco3D: number;
  
  /** Valore target Eco 3D in M$ */
  valoreTargetEco3D: number;
  
  /** Parco dispositivi IT per anno target e scenario */
  parcoDispositiviTarget: number;
  
  /** Totali per regioni selezionate */
  totaliRegioniSelezionate: {
    unita2025: number;
    unita2030: number;
    valore2025: number;
    valore2030: number;
    cagrMedio: number;
  };
  
  /** Chart data pronti per visualizzazione */
  chartData: {
    totaleGlobale: number;
    totaleItalia: number;
    targetValue: number;
    distribuzioneQuote: Array<{name: string, value: number}>;
  };
}

// ============================================================================
// SCENARIO COMPLETO (SAVEABLE)
// ============================================================================

/**
 * Scenario completo salvabile/caricabile
 * Contiene tutto il necessario per ricostruire uno stato
 */
export interface ScenarioMercato {
  /** ID univoco scenario */
  id: string;
  
  /** Nome scenario */
  nome: string;
  
  /** Descrizione */
  descrizione?: string;
  
  /** Data creazione */
  dataCreazione: Date;
  
  /** Configurazione scenario */
  configurazione: ConfigurazioneMercato;
  
  /** Versione dati utilizzata */
  versioneDati: string;
  
  /** Tags per categorizzazione */
  tags?: string[];
  
  /** Note aggiuntive */
  note?: string;
}

/**
 * Collection di scenari
 */
export interface CollectionScenari {
  /** Scenario attivo */
  attivo: string | null;
  
  /** Tutti gli scenari salvati */
  scenari: Record<string, ScenarioMercato>;
  
  /** Metadata collection */
  metadata: {
    ultimaSalvatagio: Date | null;
    totaleScenari: number;
  };
}

// ============================================================================
// ACTIONS & MUTATIONS
// ============================================================================

/**
 * Azioni disponibili per modificare lo stato
 */
export enum AzioneMercato {
  // Configurazione
  IMPOSTA_ANNO_TARGET = 'IMPOSTA_ANNO_TARGET',
  IMPOSTA_TIPOLOGIE_TARGET = 'IMPOSTA_TIPOLOGIE_TARGET',
  IMPOSTA_REGIONI_VISIBILI = 'IMPOSTA_REGIONI_VISIBILI',
  IMPOSTA_MARKET_SHARE = 'IMPOSTA_MARKET_SHARE',
  IMPOSTA_SCENARIO_PARCO = 'IMPOSTA_SCENARIO_PARCO',
  
  // UI
  TOGGLE_UI_ELEMENT = 'TOGGLE_UI_ELEMENT',
  
  // Dati
  CARICA_DATI_EXCEL = 'CARICA_DATI_EXCEL',
  AGGIORNA_TIPOLOGIA = 'AGGIORNA_TIPOLOGIA',
  
  // Scenari
  SALVA_SCENARIO = 'SALVA_SCENARIO',
  CARICA_SCENARIO = 'CARICA_SCENARIO',
  ELIMINA_SCENARIO = 'ELIMINA_SCENARIO',
  DUPLICA_SCENARIO = 'DUPLICA_SCENARIO',
  ESPORTA_SCENARIO = 'ESPORTA_SCENARIO',
  IMPORTA_SCENARIO = 'IMPORTA_SCENARIO',
  
  // Reset
  RESET_CONFIGURAZIONE = 'RESET_CONFIGURAZIONE',
  RESET_COMPLETO = 'RESET_COMPLETO'
}

/**
 * Payload per azioni
 */
export type PayloadAzione =
  | { type: AzioneMercato.IMPOSTA_ANNO_TARGET; anno: number }
  | { type: AzioneMercato.IMPOSTA_TIPOLOGIE_TARGET; tipologie: Set<string> }
  | { type: AzioneMercato.IMPOSTA_REGIONI_VISIBILI; regioni: Set<string> }
  | { type: AzioneMercato.IMPOSTA_MARKET_SHARE; percentuale: number }
  | { type: AzioneMercato.IMPOSTA_SCENARIO_PARCO; scenario: ScenarioParcoIT }
  | { type: AzioneMercato.TOGGLE_UI_ELEMENT; elemento: keyof ConfigurazioneMercato['ui'] }
  | { type: AzioneMercato.CARICA_DATI_EXCEL; dati: StatoMercato['datiBase'] }
  | { type: AzioneMercato.SALVA_SCENARIO; scenario: Omit<ScenarioMercato, 'id' | 'dataCreazione'> }
  | { type: AzioneMercato.CARICA_SCENARIO; scenarioId: string }
  | { type: AzioneMercato.ELIMINA_SCENARIO; scenarioId: string }
  | { type: AzioneMercato.RESET_CONFIGURAZIONE }
  | { type: AzioneMercato.RESET_COMPLETO };

// ============================================================================
// TYPE GUARDS & VALIDATORI
// ============================================================================

/**
 * Verifica se un anno è valido per il modello
 */
export function isAnnoValido(anno: number): boolean {
  return anno >= 2025 && anno <= 2035;
}

/**
 * Verifica se una tipologia è valida
 */
export function isTipologiaValida(tipologia: string): boolean {
  return Object.values(TipologiaEcografoEnum).includes(tipologia as TipologiaEcografoEnum);
}

/**
 * Verifica se una regione è valida
 */
export function isRegioneValida(regione: string): boolean {
  return Object.values(RegioneGeografica).includes(regione as RegioneGeografica);
}

/**
 * Verifica se una percentuale market share è valida
 */
export function isMarketShareValido(percentuale: number): boolean {
  return percentuale >= 0 && percentuale <= 100;
}

/**
 * Type guard per StatoMercato
 */
export function isStatoMercatoValido(stato: any): stato is StatoMercato {
  return (
    stato &&
    typeof stato === 'object' &&
    'configurazione' in stato &&
    'datiBase' in stato &&
    'metadata' in stato
  );
}

/**
 * Type guard per ScenarioMercato
 */
export function isScenarioMercatoValido(scenario: any): scenario is ScenarioMercato {
  return (
    scenario &&
    typeof scenario === 'object' &&
    'id' in scenario &&
    'nome' in scenario &&
    'configurazione' in scenario &&
    'versioneDati' in scenario
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Configurazione parziale (per updates)
 */
export type ConfigurazioneMercatoParziale = Partial<ConfigurazioneMercato>;

/**
 * Readonly stato (per export sicuro)
 */
export type StatoMercatoReadonly = Readonly<{
  configurazione: Readonly<ConfigurazioneMercato>;
  datiBase: Readonly<StatoMercato['datiBase']>;
  metadata: Readonly<StatoMercato['metadata']>;
}>;

/**
 * Serializable scenario (per JSON)
 */
export interface ScenarioMercatoSerializable extends Omit<ScenarioMercato, 'configurazione'> {
  configurazione: Omit<ConfigurazioneMercato, 'tipologieTarget' | 'regioniVisibili'> & {
    tipologieTarget: string[];
    regioniVisibili: string[];
  };
}
