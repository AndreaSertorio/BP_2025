/**
 * ============================================================================
 * UTILITY FUNCTIONS - ECOGRAFIE
 * ============================================================================
 * 
 * Funzioni per calcoli TIER 2 (derivati da PlayerPrefs).
 * Pure functions senza side effects.
 * 
 * Created: 2025-01-05
 */

import {
  DatiPrestazioneItalia,
  TotaliItalia,
  DatiRegioneCalcolati,
  ConfigurazioneRegione,
  PrestazioneEcografica
} from '@/types/ecografie.types';

// ============================================================================
// CALCOLI ITALIA (da U/B/D/P)
// ============================================================================

/**
 * Calcola totali per una prestazione Italia
 */
export function calcolaTotaliPrestazione(
  dati: DatiPrestazioneItalia,
  percentualeExtraSSN: number
): TotaliItalia {
  // Totale SSN = somma U+B+D+P
  const totaleSSN = dati.U + dati.B + dati.D + dati.P;
  
  // Extra SSN = totale × percentuale
  const extraSSN = totaleSSN * (percentualeExtraSSN / 100);
  
  // Totale complessivo
  const totale = totaleSSN + extraSSN;
  
  return {
    prestazione: dati.prestazione,
    totaleSSN,
    extraSSN,
    totale,
    aggredibile: dati.aggredibile
  };
}

/**
 * Calcola totali per tutte le prestazioni Italia
 */
export function calcolaTotaliItalia(
  prestazioni: DatiPrestazioneItalia[],
  percentualeExtraSSN: number
): TotaliItalia[] {
  return prestazioni.map(p => 
    calcolaTotaliPrestazione(p, percentualeExtraSSN)
  );
}

/**
 * Calcola totale generale Italia
 */
export function calcolaTotaleGeneraleItalia(totali: TotaliItalia[]) {
  return totali.reduce(
    (acc, t) => ({
      volumeSSN: acc.volumeSSN + t.totaleSSN,
      volumeExtraSSN: acc.volumeExtraSSN + t.extraSSN,
      volumeTotale: acc.volumeTotale + t.totale,
      valoreSSN: acc.valoreSSN + 0, // TODO: calcolare con costo medio
      valoreExtraSSN: acc.valoreExtraSSN + 0,
      valoreTotale: acc.valoreTotale + 0
    }),
    {
      volumeSSN: 0,
      volumeExtraSSN: 0,
      volumeTotale: 0,
      valoreSSN: 0,
      valoreExtraSSN: 0,
      valoreTotale: 0
    }
  );
}

/**
 * Calcola mercato aggredibile Italia
 */
export function calcolaMercatoAggredibileItalia(totali: TotaliItalia[]) {
  const aggredibili = totali.filter(t => t.aggredibile);
  
  const volume = aggredibili.reduce((sum, t) => sum + t.totale, 0);
  const valore = 0; // TODO: calcolare con costo medio
  
  return { volume, valore };
}

// ============================================================================
// CALCOLI ALTRE REGIONI (da Italia × moltiplicatori)
// ============================================================================

/**
 * Calcola dati regione per una prestazione
 */
export function calcolaDatiRegionePrestazione(
  totaliItalia: TotaliItalia,
  moltiplicatoreVolume: number,
  moltiplicatoreValore: number
): DatiRegioneCalcolati {
  return {
    prestazione: totaliItalia.prestazione,
    
    // Volume
    volumeSSN: totaliItalia.totaleSSN * moltiplicatoreVolume,
    volumeExtraSSN: totaliItalia.extraSSN * moltiplicatoreVolume,
    volumeTotale: totaliItalia.totale * moltiplicatoreVolume,
    
    // Valore (TODO: implementare con costi reali)
    valoreSSN: 0,
    valoreExtraSSN: 0,
    valoreTotale: 0
  };
}

/**
 * Calcola dati regione per tutte le prestazioni
 */
export function calcolaDatiRegione(
  totaliItalia: TotaliItalia[],
  configRegione: ConfigurazioneRegione
): DatiRegioneCalcolati[] {
  return totaliItalia.map(t =>
    calcolaDatiRegionePrestazione(
      t,
      configRegione.moltiplicatoreVolume,
      configRegione.moltiplicatoreValore
    )
  );
}

/**
 * Calcola totale generale per una regione
 */
export function calcolaTotaleGeneraleRegione(dati: DatiRegioneCalcolati[]) {
  return dati.reduce(
    (acc, d) => ({
      volumeSSN: acc.volumeSSN + d.volumeSSN,
      volumeExtraSSN: acc.volumeExtraSSN + d.volumeExtraSSN,
      volumeTotale: acc.volumeTotale + d.volumeTotale,
      valoreSSN: acc.valoreSSN + d.valoreSSN,
      valoreExtraSSN: acc.valoreExtraSSN + d.valoreExtraSSN,
      valoreTotale: acc.valoreTotale + d.valoreTotale
    }),
    {
      volumeSSN: 0,
      volumeExtraSSN: 0,
      volumeTotale: 0,
      valoreSSN: 0,
      valoreExtraSSN: 0,
      valoreTotale: 0
    }
  );
}

// ============================================================================
// FORMATTAZIONE
// ============================================================================

/**
 * Formatta numero con separatori migliaia
 */
export function formatNumeroEcografie(valore: number): string {
  return Math.round(valore).toLocaleString('it-IT');
}

/**
 * Formatta valore in milioni €
 */
export function formatMilioniEuro(valore: number, decimali: number = 1): string {
  return `${valore.toFixed(decimali)} M€`;
}

/**
 * Formatta percentuale
 */
export function formatPercentualeEcografie(valore: number, decimali: number = 1): string {
  return `${valore.toFixed(decimali)}%`;
}

// ============================================================================
// VALIDAZIONI
// ============================================================================

/**
 * Valida percentuale Extra SSN
 */
export function isPercentualeExtraSSNValida(valore: number): boolean {
  return valore >= 0 && valore <= 100;
}

/**
 * Valida moltiplicatore
 */
export function isMoltiplicatoreValido(valore: number): boolean {
  return valore > 0 && valore < 1000;
}

/**
 * Valida dati U/B/D/P
 */
export function isDatiUBDPValidi(U: number, B: number, D: number, P: number): boolean {
  return U >= 0 && B >= 0 && D >= 0 && P >= 0;
}

// ============================================================================
// AGGREGAZIONI
// ============================================================================

/**
 * Aggrega dati per export
 */
export function aggregaDatiPerExport(
  totaliItalia: TotaliItalia[],
  includiSoloAggredibili: boolean = false
) {
  const dati = includiSoloAggredibili
    ? totaliItalia.filter(t => t.aggredibile)
    : totaliItalia;
  
  return dati.map(t => ({
    Prestazione: t.prestazione,
    'Volume SSN': formatNumeroEcografie(t.totaleSSN),
    'Volume Extra SSN': formatNumeroEcografie(t.extraSSN),
    'Volume Totale': formatNumeroEcografie(t.totale),
    Aggredibile: t.aggredibile ? 'Sì' : 'No'
  }));
}

// ============================================================================
// CONFRONTI
// ============================================================================

/**
 * Trova prestazione con volume maggiore
 */
export function trovaPrestazioneMaxVolume(totali: TotaliItalia[]) {
  if (totali.length === 0) return null;
  return totali.reduce((max, t) => t.totale > max.totale ? t : max);
}

/**
 * Calcola quota percentuale prestazione sul totale
 */
export function calcolaQuotaPrestazione(
  prestazione: TotaliItalia,
  totale: number
): number {
  if (totale === 0) return 0;
  return (prestazione.totale / totale) * 100;
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

/**
 * Serializza dati prestazione per JSON
 */
export function serializzaPrestazione(dati: DatiPrestazioneItalia) {
  return {
    prestazione: dati.prestazione,
    U: dati.U,
    B: dati.B,
    D: dati.D,
    P: dati.P,
    aggredibile: dati.aggredibile
  };
}

/**
 * Deserializza dati prestazione da JSON
 */
export function deserializzaPrestazione(json: any): DatiPrestazioneItalia {
  return {
    prestazione: json.prestazione,
    U: Number(json.U) || 0,
    B: Number(json.B) || 0,
    D: Number(json.D) || 0,
    P: Number(json.P) || 0,
    aggredibile: Boolean(json.aggredibile)
  };
}

// ============================================================================
// DEBUG
// ============================================================================

/**
 * Log strutturato per debug
 */
export function logDebugEcografie(
  categoria: string,
  messaggio: string,
  dati?: any
): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Ecografie] ${categoria}`);
    console.log(messaggio);
    if (dati) console.table(dati);
    console.groupEnd();
  }
}
