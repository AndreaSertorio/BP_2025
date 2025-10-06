/**
 * ============================================================================
 * TYPES - MERCATO ECOGRAFIE (PLAYERPREFS-LIKE)
 * ============================================================================
 * 
 * Definizioni TypeScript per il sistema Ecografie.
 * Filosofia PlayerPrefs: salvare solo dati essenziali, calcolare il resto.
 * 
 * TIER 1 (SALVARE):
 * - Italia: dati U/B/D/P completi (source of truth)
 * - Altre regioni: moltiplicatori
 * - Configurazione utente
 * 
 * TIER 2 (CALCOLARE):
 * - Totali (somme)
 * - Valori regionali derivati
 * - Mercato aggredibile
 * 
 * Created: 2025-01-05
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum RegioneEcografie {
  ITALIA = 'Italia',
  USA = 'USA',
  EUROPA = 'Europa (UE)',
  CINA = 'Cina',
  GLOBALE = 'Globale'
}

export enum ClassePriorita {
  URGENTE = 'U',
  BREVE = 'B',
  DIFFERIBILE = 'D',
  PROGRAMMATA = 'P'
}

// ============================================================================
// PRESTAZIONI ECOGRAFICHE (15 tipologie)
// ============================================================================

export const PRESTAZIONI_ECOGRAFICHE = [
  'Addome Completo',
  'Addome Superiore',
  'Addome Inferiore',
  'Apparato Urinario',
  'Collo (tiroide)',
  'Cute e Sottocute',
  'Mammella',
  'Muscoloscheletrico',
  'Osteoarticolare',
  'Parti Molli',
  'Pelvi',
  'Prostata',
  'Testicoli',
  'Vasi',
  'Altri Distretti'
] as const;

export type PrestazioneEcografica = typeof PRESTAZIONI_ECOGRAFICHE[number];

// ============================================================================
// TIER 1: DATI DA SALVARE (PLAYERPREFS)
// ============================================================================

/**
 * Dati dettagliati per singola prestazione Italia
 * QUESTI SONO I DATI MASTER - tutto deriva da qui
 */
export interface DatiPrestazioneItalia {
  prestazione: PrestazioneEcografica;
  
  // Classi priorità (dati originali da Excel)
  U: number;  // Urgente
  B: number;  // Breve
  D: number;  // Differibile
  P: number;  // Programmata
  
  // Flag se è aggredibile (modificabile da utente)
  aggredibile: boolean;
}

/**
 * Configurazione Italia (MASTER)
 */
export interface ConfigurazioneItalia {
  // Dati base per tutte le 15 prestazioni
  prestazioni: DatiPrestazioneItalia[];
  
  // Parametri modificabili
  percentualeExtraSSN: number;  // Default: 30%, range 0-100
  
  // Anno di riferimento
  annoRiferimento: number;  // Default: 2024
}

/**
 * Configurazione altre regioni (DERIVATE da Italia)
 */
export interface ConfigurazioneRegione {
  regione: RegioneEcografie;
  
  // Moltiplicatori (modificabili)
  moltiplicatoreVolume: number;   // Default: vedi tabella
  moltiplicatoreValore: number;   // Default: vedi tabella
  
  // Range suggeriti (per UI)
  volumeRange: string;  // es: "8 - 10"
  valoreRange: string;  // es: "6 - 8"
  italyQuota: string;   // es: "~10-12 %"
}

/**
 * Stato completo Ecografie (TIER 1 - da salvare)
 */
export interface StatoEcografie {
  // Italia = MASTER SOURCE
  italia: ConfigurazioneItalia;
  
  // Altre regioni = moltiplicatori
  regioni: {
    usa: ConfigurazioneRegione;
    europa: ConfigurazioneRegione;
    cina: ConfigurazioneRegione;
    globale: ConfigurazioneRegione;
  };
  
  // Metadata
  metadata: {
    loading: boolean;
    error: string | null;
    ultimoAggiornamento: Date | null;
    versioneDati: string;
  };
}

// ============================================================================
// TIER 2: DATI CALCOLATI (DERIVATI)
// ============================================================================

/**
 * Totali calcolati per Italia
 */
export interface TotaliItalia {
  prestazione: PrestazioneEcografica;
  
  // Totale SSN (somma U+B+D+P)
  totaleSSN: number;
  
  // Extra SSN (totaleSSN × percentualeExtraSSN)
  extraSSN: number;
  
  // Totale complessivo
  totale: number;  // totaleSSN + extraSSN
  
  // Flag se aggredibile
  aggredibile: boolean;
}

/**
 * Dati calcolati per altre regioni
 */
export interface DatiRegioneCalcolati {
  prestazione: PrestazioneEcografica;
  
  // Volume (Italia × moltiplicatore)
  volumeSSN: number;
  volumeExtraSSN: number;
  volumeTotale: number;
  
  // Valore M€ (Italia × moltiplicatore)
  valoreSSN: number;
  valoreExtraSSN: number;
  valoreTotale: number;
}

/**
 * Tutti i dati calcolati
 */
export interface DatiCalcolatiEcografie {
  // Italia (totali calcolati)
  italia: {
    prestazioni: TotaliItalia[];
    totaleGenerale: {
      volumeSSN: number;
      volumeExtraSSN: number;
      volumeTotale: number;
      valoreSSN: number;
      valoreExtraSSN: number;
      valoreTotale: number;
    };
    mercatoAggredibile: {
      volume: number;
      valore: number;
    };
  };
  
  // Altre regioni (derivate)
  usa: {
    prestazioni: DatiRegioneCalcolati[];
    totaleGenerale: { /* stessa struttura */ };
  };
  europa: {
    prestazioni: DatiRegioneCalcolati[];
    totaleGenerale: { /* stessa struttura */ };
  };
  cina: {
    prestazioni: DatiRegioneCalcolati[];
    totaleGenerale: { /* stessa struttura */ };
  };
  globale: {
    prestazioni: DatiRegioneCalcolati[];
    totaleGenerale: { /* stessa struttura */ };
  };
}

// ============================================================================
// SCENARI
// ============================================================================

/**
 * Scenario salvabile/caricabile
 */
export interface ScenarioEcografie {
  id: string;
  nome: string;
  descrizione?: string;
  dataCreazione: Date;
  
  // Configurazione completa (TIER 1)
  configurazione: StatoEcografie;
  
  versioneDati: string;
  tags?: string[];
  note?: string;
}

/**
 * Collection scenari
 */
export interface CollectionScenariEcografie {
  attivo: string | null;
  scenari: Record<string, ScenarioEcografie>;
  metadata: {
    ultimaSalvataggio: Date | null;
    totaleScenari: number;
  };
}

// ============================================================================
// ACTIONS
// ============================================================================

export enum AzioneEcografie {
  // Italia - Dati U/B/D/P
  AGGIORNA_PRESTAZIONE_ITALIA = 'AGGIORNA_PRESTAZIONE_ITALIA',
  IMPOSTA_PERCENTUALE_EXTRA_SSN = 'IMPOSTA_PERCENTUALE_EXTRA_SSN',
  TOGGLE_PRESTAZIONE_AGGREDIBILE = 'TOGGLE_PRESTAZIONE_AGGREDIBILE',
  
  // Altre regioni - Moltiplicatori
  IMPOSTA_MOLTIPLICATORE_VOLUME = 'IMPOSTA_MOLTIPLICATORE_VOLUME',
  IMPOSTA_MOLTIPLICATORE_VALORE = 'IMPOSTA_MOLTIPLICATORE_VALORE',
  
  // Dati bulk
  CARICA_DATI_EXCEL = 'CARICA_DATI_EXCEL',
  
  // Scenari
  SALVA_SCENARIO = 'SALVA_SCENARIO',
  CARICA_SCENARIO = 'CARICA_SCENARIO',
  ELIMINA_SCENARIO = 'ELIMINA_SCENARIO',
  
  // Reset
  RESET_CONFIGURAZIONE = 'RESET_CONFIGURAZIONE',
  RESET_COMPLETO = 'RESET_COMPLETO'
}

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Moltiplicatori default per regioni
 */
export const MOLTIPLICATORI_DEFAULT = {
  usa: {
    volume: 9,
    valore: 7,
    volumeRange: '8 – 10',
    valoreRange: '6 – 8',
    italyQuota: '~10–12 %'
  },
  europa: {
    volume: 7.5,
    valore: 6.5,
    volumeRange: '7 – 8',
    valoreRange: '6 – 7',
    italyQuota: '~12–15 %'
  },
  cina: {
    volume: 11,
    valore: 10,
    volumeRange: '10 – 12',
    valoreRange: '9 – 11',
    italyQuota: '~8–10 %'
  },
  globale: {
    volume: 55,
    valore: 50,
    volumeRange: '50 – 60',
    valoreRange: '45 – 55',
    italyQuota: '~1,5–2 %'
  }
} as const;

/**
 * Percentuale Extra SSN default
 */
export const PERCENTUALE_EXTRA_SSN_DEFAULT = 30;

/**
 * Anno riferimento default
 */
export const ANNO_RIFERIMENTO_DEFAULT = 2024;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Verifica se percentuale Extra SSN è valida
 */
export function isPercentualeExtraSSNValida(valore: number): boolean {
  return valore >= 0 && valore <= 100;
}

/**
 * Verifica se moltiplicatore è valido
 */
export function isMoltiplicatoreValido(valore: number): boolean {
  return valore > 0 && valore < 1000; // Range ragionevole
}

/**
 * Verifica se prestazione è valida
 */
export function isPrestazioneValida(prestazione: string): prestazione is PrestazioneEcografica {
  return PRESTAZIONI_ECOGRAFICHE.includes(prestazione as PrestazioneEcografica);
}

/**
 * Verifica se regione è valida
 */
export function isRegioneValida(regione: string): regione is RegioneEcografie {
  return Object.values(RegioneEcografie).includes(regione as RegioneEcografie);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Dati prestazione parziali (per update)
 */
export type DatiPrestazioneParziali = Partial<Omit<DatiPrestazioneItalia, 'prestazione'>>;

/**
 * Configurazione Italia parziale
 */
export type ConfigurazioneItaliaParziale = Partial<ConfigurazioneItalia>;

/**
 * Readonly stato (per export sicuro)
 */
export type StatoEcografieReadonly = Readonly<StatoEcografie>;
