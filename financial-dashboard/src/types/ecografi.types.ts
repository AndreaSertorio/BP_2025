/**
 * ============================================================================
 * TYPES - MERCATO ECOGRAFI
 * ============================================================================
 * 
 * Definizioni TypeScript per il sistema Mercato Ecografi.
 * Sincronizzato con database.json → mercatoEcografi
 * 
 * Created: 2025-01-06
 */

// ============================================================================
// TIPOLOGIE ECOGRAFI
// ============================================================================

export interface TipologiaEcografo {
  id: string;                // "carrellati", "portatili", "palmari", "premium", "pocus"
  nome: string;              // "Carrellati", "Portatili", ecc.
  icon: string;              // Emoji
  quotaIT: number;           // Quota mercato Italia 2030 (0-1)
  valoreIT: number;          // Valore mercato Italia 2030 (M$)
  quotaGlobale: number;      // Quota mercato globale 2023 (0-1)
  valoreGlobale: number;     // Valore mercato globale 2023 (M$)
  cagrGlobale: string;       // CAGR globale (es: "0.04 (2024-2030)")
  note: string;              // Descrizione
  visible: boolean;          // Visibile in UI
  target: boolean;           // È tipologia target per Eco3D
}

// ============================================================================
// NUMERO ECOGRAFI PER REGIONE
// ============================================================================

export interface NumeroEcografiRegione {
  mercato: string;           // "Italia", "Europa", "Stati Uniti", "Cina", "Mondo (globale)"
  unita2025: number;         // Unità vendute nel 2025
  unita2030: number;         // Unità vendute nel 2030
}

// ============================================================================
// VALORE MERCATO PER REGIONE
// ============================================================================

export interface ValoreMercatoRegione {
  mercato: string;           // "Italia", "Europa", "Stati Uniti", "Cina", "Mondo (globale)"
  valore2025: number;        // Valore mercato 2025 (M$)
  valore2030: number;        // Valore mercato 2030 (M$)
  cagr: number;              // CAGR 2025-2030 (%)
}

// ============================================================================
// PROIEZIONI MERCATO ITALIA
// ============================================================================

export interface ProiezioneItaliaEcografi {
  anno: number;              // 2024-2035
  mordor: number;            // Stima Mordor Intelligence (M$)
  research: number;          // Stima Research & Markets (M$)
  grandview: number;         // Stima Grand View Research (M$)
  cognitive: number;         // Stima Cognitive Market Research (M$)
  media: number;             // Media delle 4 stime (M$)
  mediana: number;           // Mediana delle 4 stime (M$)
}

// ============================================================================
// QUOTE TIPOLOGIE ITALIA
// ============================================================================

export interface QuoteTipologieItalia {
  anno: number;              // 2026-2035
  carrellati: number;        // Quota % carrellati
  portatili: number;         // Quota % portatili
  palmari: number;           // Quota % palmari
}

// ============================================================================
// PARCO DISPOSITIVI ITALIA
// ============================================================================

export interface ParcoDispositiviItalia {
  anno: number;              // 2025-2035
  basso: number;             // Scenario basso (dismissione 8%)
  centrale: number;          // Scenario centrale (dismissione 7%)
  alto: number;              // Scenario alto (dismissione 6%)
}

export type ScenarioParcoIT = 'basso' | 'centrale' | 'alto';

// ============================================================================
// CONFIGURAZIONE MERCATO ECOGRAFI
// ============================================================================

export interface ConfigurazioneMercatoEcografi {
  annoTarget: number;                    // Anno target per proiezioni (default: 2030)
  marketShare: number;                   // Market share target % (0-100, default: 1.0)
  scenarioParco: ScenarioParcoIT;        // Scenario parco IT (default: 'centrale')
  regioniVisibili: string[];             // Regioni selezionate per analisi
  tipologieTarget: string[];             // Tipologie target per Eco3D (default: ["Palmari"])
}

// ============================================================================
// STATO COMPLETO MERCATO ECOGRAFI (da database.json)
// ============================================================================

export interface MercatoEcografi {
  tipologie: TipologiaEcografo[];
  numeroEcografi: NumeroEcografiRegione[];
  valoreMercato: ValoreMercatoRegione[];
  proiezioniItalia: ProiezioneItaliaEcografi[];
  quoteTipologie: QuoteTipologieItalia[];
  parcoIT: ParcoDispositiviItalia[];
  configurazione: ConfigurazioneMercatoEcografi;
}

// ============================================================================
// DATI CALCOLATI
// ============================================================================

export interface CalcoliMercatoEcografi {
  // Target Eco3D per anno selezionato
  targetEco3D: {
    anno: number;
    unita: number;                       // Unità target calcolate
    valore: number;                      // Valore target M$
    regioni: string[];                   // Regioni incluse
    tipologie: string[];                 // Tipologie incluse
  };
  
  // Totali regioni selezionate
  totaliRegioni: {
    unita2025: number;
    unita2030: number;
    target2025: number;                  // Con market share applicato
    target2030: number;                  // Con market share applicato
  };
  
  // Mercato Italia per anno target
  mercatoItaliaTarget: {
    anno: number;
    valoreMedia: number;                 // M$
    valoreMediana: number;               // M$
    parcoDispositivi: number;            // Numero dispositivi
  };
}

// ============================================================================
// ACTIONS / MUTATIONS
// ============================================================================

export enum AzioneMercatoEcografi {
  // Configurazione
  IMPOSTA_ANNO_TARGET = 'IMPOSTA_ANNO_TARGET',
  IMPOSTA_MARKET_SHARE = 'IMPOSTA_MARKET_SHARE',
  IMPOSTA_SCENARIO_PARCO = 'IMPOSTA_SCENARIO_PARCO',
  
  // Selezioni
  TOGGLE_REGIONE_VISIBILE = 'TOGGLE_REGIONE_VISIBILE',
  IMPOSTA_REGIONI_VISIBILI = 'IMPOSTA_REGIONI_VISIBILI',
  TOGGLE_TIPOLOGIA_TARGET = 'TOGGLE_TIPOLOGIA_TARGET',
  IMPOSTA_TIPOLOGIE_TARGET = 'IMPOSTA_TIPOLOGIE_TARGET',
  
  // Tipologie
  TOGGLE_TIPOLOGIA_VISIBLE = 'TOGGLE_TIPOLOGIA_VISIBLE',
  TOGGLE_TIPOLOGIA_TARGET_FLAG = 'TOGGLE_TIPOLOGIA_TARGET_FLAG',
  
  // Dati bulk (da Excel o API)
  CARICA_DATI_COMPLETI = 'CARICA_DATI_COMPLETI',
  
  // Reset
  RESET_CONFIGURAZIONE = 'RESET_CONFIGURAZIONE'
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const CONFIGURAZIONE_ECOGRAFI_DEFAULT: ConfigurazioneMercatoEcografi = {
  annoTarget: 2030,
  marketShare: 1.0,
  scenarioParco: 'centrale',
  regioniVisibili: ['Italia', 'Europa', 'Stati Uniti', 'Cina'],
  tipologieTarget: ['Palmari']
};

// ============================================================================
// TYPE GUARDS & VALIDATORS
// ============================================================================

export function isScenarioParcoValido(scenario: string): scenario is ScenarioParcoIT {
  return ['basso', 'centrale', 'alto'].includes(scenario);
}

export function isAnnoTargetValido(anno: number): boolean {
  return anno >= 2025 && anno <= 2035;
}

export function isMarketShareValido(share: number): boolean {
  return share >= 0 && share <= 100;
}

export function isTipologiaIdValido(id: string): boolean {
  return ['carrellati', 'portatili', 'palmari', 'premium', 'pocus'].includes(id);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Configurazione parziale (per updates)
 */
export type ConfigurazioneMercatoEcografiParziale = Partial<ConfigurazioneMercatoEcografi>;

/**
 * Readonly (per export sicuro)
 */
export type MercatoEcografiReadonly = Readonly<MercatoEcografi>;

/**
 * Tipologia parziale (per updates)
 */
export type TipologiaEcografoParziale = Partial<Omit<TipologiaEcografo, 'id'>>;
