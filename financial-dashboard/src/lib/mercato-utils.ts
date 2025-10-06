/**
 * ============================================================================
 * UTILITY FUNCTIONS - MERCATO ECOGRAFI
 * ============================================================================
 * 
 * Funzioni helper per calcoli, validazioni e trasformazioni dati.
 * Pure functions senza side effects.
 * 
 * Created: 2025-01-05
 */

import {
  NumeroEcografiRegione,
  ValoreMercatoRegione,
  ProiezioneItaliaAnno,
  ParcoDispositiviITAnno,
  ScenarioParcoIT,
  RegioneGeografica
} from '@/types/mercato.types';

// ============================================================================
// CALCOLI UNITÀ E VALORI
// ============================================================================

/**
 * Calcola unità totali per un anno specifico escludendo Mondo
 */
export function calcolaUnitaTotali(
  numeroEcografi: NumeroEcografiRegione[],
  regioniSelezionate: Set<string>,
  anno: 2025 | 2030
): number {
  return numeroEcografi
    .filter(r => 
      regioniSelezionate.has(r.mercato) && 
      r.mercato !== RegioneGeografica.MONDO_GLOBALE
    )
    .reduce((sum, r) => {
      const unita = anno === 2025 ? r.unita2025 : r.unita2030;
      return sum + unita;
    }, 0);
}

/**
 * Calcola target unità con market share
 */
export function calcolaTargetUnita(
  unitaTotali: number,
  marketSharePercent: number
): number {
  return Math.round(unitaTotali * marketSharePercent / 100);
}

/**
 * Calcola valore mercato totale per regioni selezionate
 */
export function calcolaValoreMercatoTotale(
  valoreMercato: ValoreMercatoRegione[],
  regioniSelezionate: Set<string>,
  anno: 2025 | 2030
): number {
  return valoreMercato
    .filter(r => 
      regioniSelezionate.has(r.mercato) && 
      r.mercato !== RegioneGeografica.MONDO_GLOBALE
    )
    .reduce((sum, r) => {
      const valore = anno === 2025 ? r.valore2025 : r.valore2030;
      return sum + valore;
    }, 0);
}

/**
 * Calcola CAGR medio per regioni selezionate
 */
export function calcolaCAGRMedio(
  valoreMercato: ValoreMercatoRegione[],
  regioniSelezionate: Set<string>
): number {
  const regioni = valoreMercato.filter(r => 
    regioniSelezionate.has(r.mercato) && 
    r.mercato !== RegioneGeografica.MONDO_GLOBALE
  );
  
  if (regioni.length === 0) return 0;
  
  const sommaCAGR = regioni.reduce((sum, r) => sum + r.cagr, 0);
  return sommaCAGR / regioni.length;
}

/**
 * Calcola crescita percentuale tra due valori
 */
export function calcolaCrescitaPercentuale(
  valoreIniziale: number,
  valoreFinale: number
): number {
  if (valoreIniziale === 0) return 0;
  return ((valoreFinale - valoreIniziale) / valoreIniziale) * 100;
}

// ============================================================================
// PROIEZIONI E INTERPOLAZIONI
// ============================================================================

/**
 * Interpola linearmente valore per anno intermedio
 */
export function interpolaLineare(
  anno: number,
  anno1: number,
  valore1: number,
  anno2: number,
  valore2: number
): number {
  if (anno <= anno1) return valore1;
  if (anno >= anno2) return valore2;
  
  const ratio = (anno - anno1) / (anno2 - anno1);
  return valore1 + (valore2 - valore1) * ratio;
}

/**
 * Proietta valore futuro con CAGR
 */
export function proiettaConCAGR(
  valoreBase: number,
  annoBase: number,
  annoTarget: number,
  cagr: number
): number {
  const anni = annoTarget - annoBase;
  return valoreBase * Math.pow(1 + cagr / 100, anni);
}

/**
 * Estendi proiezioni Italia oltre 2030 con CAGR
 */
export function estendiProiezioniItalia(
  proiezioni: ProiezioneItaliaAnno[],
  annoFinale: number,
  cagr: number = 4.11
): ProiezioneItaliaAnno[] {
  const estese = [...proiezioni];
  const ultimaProiezione = proiezioni[proiezioni.length - 1];
  
  if (!ultimaProiezione) return estese;
  
  for (let anno = ultimaProiezione.anno + 1; anno <= annoFinale; anno++) {
    const anniDiff = anno - ultimaProiezione.anno;
    const fattoreCrescita = Math.pow(1 + cagr / 100, anniDiff);
    
    estese.push({
      anno,
      mordor: ultimaProiezione.mordor * fattoreCrescita,
      research: ultimaProiezione.research * fattoreCrescita,
      grandview: ultimaProiezione.grandview * fattoreCrescita,
      cognitive: ultimaProiezione.cognitive * fattoreCrescita,
      media: ultimaProiezione.media * fattoreCrescita,
      mediana: ultimaProiezione.mediana * fattoreCrescita
    });
  }
  
  return estese;
}

// ============================================================================
// PARCO DISPOSITIVI
// ============================================================================

/**
 * Ottieni valore parco per anno e scenario
 */
export function getParcoDispositivi(
  parcoIT: ParcoDispositiviITAnno[],
  anno: number,
  scenario: ScenarioParcoIT
): number {
  const parcoAnno = parcoIT.find(p => p.anno === anno);
  return parcoAnno ? parcoAnno[scenario] : 0;
}

/**
 * Calcola tasso di dismissione implicito
 */
export function calcolaTassoDismissione(scenario: ScenarioParcoIT): number {
  switch (scenario) {
    case ScenarioParcoIT.BASSO:
      return 8.0; // 8%
    case ScenarioParcoIT.CENTRALE:
      return 7.0; // 7%
    case ScenarioParcoIT.ALTO:
      return 6.0; // 6%
    default:
      return 7.0;
  }
}

// ============================================================================
// FORMATTAZIONE E DISPLAY
// ============================================================================

/**
 * Formatta valore in milioni con M$
 */
export function formatMilioni(valore: number, decimali: number = 1): string {
  return `${valore.toFixed(decimali)} M$`;
}

/**
 * Formatta valore in miliardi con B$
 */
export function formatMiliardi(valore: number, decimali: number = 1): string {
  return `${(valore / 1000).toFixed(decimali)} B$`;
}

/**
 * Formatta percentuale
 */
export function formatPercentuale(valore: number, decimali: number = 1): string {
  return `${valore.toFixed(decimali)}%`;
}

/**
 * Formatta numero con separatori migliaia
 */
export function formatNumero(valore: number): string {
  return valore.toLocaleString('it-IT');
}

/**
 * Formatta CAGR da stringa Excel
 */
export function parseCAGRDaStringa(cagrString: string): number {
  // Es: "0.055 (2024-2030)" → 5.5
  const match = cagrString.match(/^([\d.]+)/);
  if (match) {
    return parseFloat(match[1]) * 100;
  }
  return 0;
}

// ============================================================================
// VALIDAZIONI
// ============================================================================

/**
 * Valida range anno
 */
export function isAnnoValido(anno: number): boolean {
  return anno >= 2025 && anno <= 2035;
}

/**
 * Valida market share
 */
export function isMarketShareValido(percentuale: number): boolean {
  return percentuale >= 0 && percentuale <= 100;
}

/**
 * Valida che array non sia vuoto
 */
export function hasData<T>(array: T[]): boolean {
  return array && array.length > 0;
}

/**
 * Valida che regione esista nei dati
 */
export function isRegioneValida(
  mercato: string,
  numeroEcografi: NumeroEcografiRegione[]
): boolean {
  return numeroEcografi.some(n => n.mercato === mercato);
}

// ============================================================================
// CONFRONTI E ANALISI
// ============================================================================

/**
 * Trova regione con crescita maggiore
 */
export function trovaRegioneMaxCrescita(
  numeroEcografi: NumeroEcografiRegione[]
): { mercato: string; crescita: number } | null {
  const regioni = numeroEcografi.filter(
    r => r.mercato !== RegioneGeografica.MONDO_GLOBALE
  );
  
  if (regioni.length === 0) return null;
  
  let maxCrescita = -Infinity;
  let regioneMax = regioni[0];
  
  regioni.forEach(r => {
    const crescita = calcolaCrescitaPercentuale(r.unita2025, r.unita2030);
    if (crescita > maxCrescita) {
      maxCrescita = crescita;
      regioneMax = r;
    }
  });
  
  return {
    mercato: regioneMax.mercato,
    crescita: maxCrescita
  };
}

/**
 * Trova regione con CAGR maggiore
 */
export function trovaRegioneMaxCAGR(
  valoreMercato: ValoreMercatoRegione[]
): { mercato: string; cagr: number } | null {
  const regioni = valoreMercato.filter(
    r => r.mercato !== RegioneGeografica.MONDO_GLOBALE
  );
  
  if (regioni.length === 0) return null;
  
  const maxRegione = regioni.reduce((max, r) => 
    r.cagr > max.cagr ? r : max
  , regioni[0]);
  
  return {
    mercato: maxRegione.mercato,
    cagr: maxRegione.cagr
  };
}

/**
 * Calcola quota regione sul totale mondiale
 */
export function calcolaQuotaMondiale(
  numeroEcografi: NumeroEcografiRegione[],
  mercato: string,
  anno: 2025 | 2030
): number {
  const regione = numeroEcografi.find(r => r.mercato === mercato);
  const mondo = numeroEcografi.find(r => r.mercato === RegioneGeografica.MONDO_GLOBALE);
  
  if (!regione || !mondo) return 0;
  
  const unitaRegione = anno === 2025 ? regione.unita2025 : regione.unita2030;
  const unitaMondo = anno === 2025 ? mondo.unita2025 : mondo.unita2030;
  
  return (unitaRegione / unitaMondo) * 100;
}

// ============================================================================
// AGGREGAZIONI
// ============================================================================

/**
 * Aggrega dati per chart
 */
export function aggregaDatiPerChart(
  numeroEcografi: NumeroEcografiRegione[],
  regioniSelezionate: Set<string>,
  escludiMondo: boolean = true
): Array<{ name: string; unita2025: number; unita2030: number }> {
  return numeroEcografi
    .filter(r => {
      if (escludiMondo && r.mercato === RegioneGeografica.MONDO_GLOBALE) {
        return false;
      }
      return regioniSelezionate.has(r.mercato);
    })
    .map(r => ({
      name: r.mercato,
      unita2025: r.unita2025,
      unita2030: r.unita2030
    }));
}

/**
 * Crea distribuzione percentuale per pie chart
 */
export function creaDistribuzionePercentuale(
  numeroEcografi: NumeroEcografiRegione[],
  regioniSelezionate: Set<string>,
  anno: 2025 | 2030
): Array<{ name: string; value: number; percentage: number }> {
  const regioni = numeroEcografi.filter(r => 
    regioniSelezionate.has(r.mercato) && 
    r.mercato !== RegioneGeografica.MONDO_GLOBALE
  );
  
  const totale = regioni.reduce((sum, r) => {
    const unita = anno === 2025 ? r.unita2025 : r.unita2030;
    return sum + unita;
  }, 0);
  
  return regioni.map(r => {
    const unita = anno === 2025 ? r.unita2025 : r.unita2030;
    return {
      name: r.mercato,
      value: unita,
      percentage: totale > 0 ? (unita / totale) * 100 : 0
    };
  });
}

// ============================================================================
// EXPORT/IMPORT HELPERS
// ============================================================================

/**
 * Converte Set in Array per serializzazione JSON
 */
export function setToArray<T>(set: Set<T>): T[] {
  return Array.from(set);
}

/**
 * Converte Array in Set
 */
export function arrayToSet<T>(array: T[]): Set<T> {
  return new Set(array);
}

/**
 * Download file JSON
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload e parse file JSON
 */
export function uploadJSON<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error('File JSON non valido'));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}

// ============================================================================
// UTILITIES EXCEL PARSING
// ============================================================================

/**
 * Parse valore da cella Excel (gestisce formati multipli)
 */
export function parseCellaExcel(valore: any): number {
  if (typeof valore === 'number') return valore;
  
  if (typeof valore === 'string') {
    // Rimuovi simboli comuni: $, M, €, spazi
    let cleaned = valore.replace(/[\$M€\s]/g, '').trim();
    
    // Gestisci separatori decimali (virgola vs punto)
    if (/,\d{2}($|\D)/.test(cleaned)) {
      // Virgola seguita da 2 cifre = decimale
      cleaned = cleaned.replace(',', '.');
    } else {
      // Altrimenti rimuovi tutte le virgole (separatore migliaia)
      cleaned = cleaned.replace(/,/g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Parse percentuale da stringa
 */
export function parsePercentuale(valore: string | number): number {
  if (typeof valore === 'number') {
    // Se già numero, assumiamo sia 0-1 o 0-100
    return valore > 1 ? valore : valore * 100;
  }
  
  const cleaned = valore.replace(/%/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================================================
// DEBUG & LOGGING
// ============================================================================

/**
 * Log strutturato per debug
 */
export function logDebug(categoria: string, messaggio: string, dati?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Mercato] ${categoria}`);
    console.log(messaggio);
    if (dati) {
      console.table(dati);
    }
    console.groupEnd();
  }
}

/**
 * Valida coerenza dati
 */
export function validaCoerenzaDati(
  numeroEcografi: NumeroEcografiRegione[],
  valoreMercato: ValoreMercatoRegione[]
): { valido: boolean; errori: string[] } {
  const errori: string[] = [];
  
  // Verifica che le regioni matchino
  const regioniNumero = new Set(numeroEcografi.map(n => n.mercato));
  const regioniValore = new Set(valoreMercato.map(v => v.mercato));
  
  regioniNumero.forEach(r => {
    if (!regioniValore.has(r)) {
      errori.push(`Regione "${r}" presente in numeroEcografi ma non in valoreMercato`);
    }
  });
  
  regioniValore.forEach(r => {
    if (!regioniNumero.has(r)) {
      errori.push(`Regione "${r}" presente in valoreMercato ma non in numeroEcografi`);
    }
  });
  
  // Verifica valori positivi
  numeroEcografi.forEach(n => {
    if (n.unita2025 < 0 || n.unita2030 < 0) {
      errori.push(`Valori negativi per regione "${n.mercato}"`);
    }
  });
  
  return {
    valido: errori.length === 0,
    errori
  };
}
