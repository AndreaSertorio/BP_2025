/**
 * ============================================================================
 * DATABASE SERVICE - APPROCCIO CENTRALIZZATO
 * ============================================================================
 * 
 * Servizio semplice per accedere al database centralizzato JSON.
 * Sostituisce il complesso sistema PlayerPrefs con Context multipli.
 * 
 * FILOSOFIA:
 * - Un unico file JSON con tutti i dati
 * - Caricamento sincrono (import diretto) - Read-only mercato data
 * - Type-safe con TypeScript
 * - Facile da ispezionare e modificare manualmente
 * 
 * NOTE: Per dati Budget editabili, usare BudgetContext che fa fetch dinamico
 * 
 * Created: 2025-01-06
 */

import database from '@/data/database.json';

// ============================================================================
// TYPES
// ============================================================================

export interface PrestazioneEcografia {
  codice: string;
  nome: string;
  U: number;
  B: number;
  D: number;
  P: number;
  percentualeExtraSSN?: number;  // Percentuale Extra-SSN specifica per questa prestazione
  aggredibile: boolean;
  note?: string;
}

export interface MercatoEcografieItalia {
  annoRiferimento: number;
  percentualeExtraSSN: number;
  prestazioni: PrestazioneEcografia[];
}

export interface MoltiplicatoreRegionale {
  volumeMultiplier: number;
  valueMultiplier: number;
  volumeRange: string;
  valueRange: string;
  italyQuota: string;
  note: string;
}

export interface PrestazioneCalcolata extends PrestazioneEcografia {
  totaleSSN: number;        // U + B + D + P
  extraSSN: number;         // totaleSSN × (percentualeExtraSSN / 100)
  totaleAnnuo: number;      // totaleSSN + extraSSN
  percentualeSSN: number;   // % rispetto al totale Italia
}

export interface TotaliMercato {
  volumeSSN: number;
  volumeExtraSSN: number;
  volumeTotale: number;
  numeroPrestazioni: number;
  prestazioniAggredibili: number;
}

export interface RegioneMondialeData {
  nome: string;
  flag: string;
  moltiplicatoreVolume: number;
  moltiplicatoreValore: number;
  quotaItalia: string;
  note: string;
}

export interface Database {
  version: string;
  lastUpdate: string;
  description?: string;
  mercatoEcografie: {
    italia: MercatoEcografieItalia;
    moltiplicatoriRegionali?: {
      usa: MoltiplicatoreRegionale;
      europa: MoltiplicatoreRegionale;
      cina: MoltiplicatoreRegionale;
      globale: MoltiplicatoreRegionale;
    };
  };
  regioniMondiali?: {
    usa: RegioneMondialeData;
    europa: RegioneMondialeData;
    cina: RegioneMondialeData;
    globale: RegioneMondialeData;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

export class DatabaseService {
  private data: Database;
  
  constructor(data?: Database) {
    this.data = data || (database as Database);
    if (!data) {
      console.log('✅ Database caricato da file statico:', {
        version: this.data.version,
        lastUpdate: this.data.lastUpdate,
        prestazioni: this.data.mercatoEcografie.italia.prestazioni.length
      });
    }
  }
  
  // --------------------------------------------------------------------------
  // GETTERS - DATI BASE
  // --------------------------------------------------------------------------
  
  /**
   * Ottieni tutti i dati Italia (base)
   */
  getItaliaBase(): MercatoEcografieItalia {
    return this.data.mercatoEcografie.italia;
  }
  
  /**
   * Ottieni singola prestazione per codice
   */
  getPrestazioneByCodice(codice: string): PrestazioneEcografia | undefined {
    return this.data.mercatoEcografie.italia.prestazioni.find(
      p => p.codice === codice
    );
  }
  
  /**
   * Ottieni singola prestazione per nome
   */
  getPrestazioneByNome(nome: string): PrestazioneEcografia | undefined {
    return this.data.mercatoEcografie.italia.prestazioni.find(
      p => p.nome.toLowerCase() === nome.toLowerCase()
    );
  }
  
  /**
   * Ottieni solo prestazioni aggredibili
   */
  getPrestazioniAggredibili(): PrestazioneEcografia[] {
    return this.data.mercatoEcografie.italia.prestazioni.filter(
      p => p.aggredibile
    );
  }
  
  /**
   * Ottieni moltiplicatori regionali
   */
  getMoltiplicatoriRegionali() {
    return this.data.mercatoEcografie.moltiplicatoriRegionali;
  }
  
  /**
   * Ottieni moltiplicatore per una specifica regione
   * AGGIORNATO: Legge da regioniMondiali (database centralizzato)
   */
  getMoltiplicatoreRegione(regione: 'usa' | 'europa' | 'cina' | 'globale'): MoltiplicatoreRegionale {
    // Usa regioniMondiali se disponibile (nuovo sistema), altrimenti fallback a vecchio
    if (this.data.regioniMondiali && this.data.regioniMondiali[regione]) {
      const reg = this.data.regioniMondiali[regione];
      return {
        volumeMultiplier: reg.moltiplicatoreVolume,
        valueMultiplier: reg.moltiplicatoreValore,
        volumeRange: reg.quotaItalia,
        valueRange: `${reg.moltiplicatoreValore}×`,
        italyQuota: reg.quotaItalia,
        note: reg.note
      };
    }
    // Fallback a vecchio sistema (per retrocompatibilità)
    if (this.data.mercatoEcografie.moltiplicatoriRegionali) {
      return this.data.mercatoEcografie.moltiplicatoriRegionali[regione];
    }
    
    // Default se nessun moltiplicatore disponibile
    const defaults: Record<string, MoltiplicatoreRegionale> = {
      usa: { volumeMultiplier: 9, valueMultiplier: 7, volumeRange: '8-10', valueRange: '6-8', italyQuota: '10-12%', note: 'Default USA' },
      europa: { volumeMultiplier: 8, valueMultiplier: 6.5, volumeRange: '7-9', valueRange: '6-7', italyQuota: '12-15%', note: 'Default Europa' },
      cina: { volumeMultiplier: 22, valueMultiplier: 10, volumeRange: '20-25', valueRange: '9-11', italyQuota: '4-5%', note: 'Default Cina' },
      globale: { volumeMultiplier: 50, valueMultiplier: 30, volumeRange: '45-55', valueRange: '25-35', italyQuota: '2%', note: 'Default Globale' }
    };
    return defaults[regione];
  }
  
  // --------------------------------------------------------------------------
  // CALCOLI - DATI DERIVATI
  // --------------------------------------------------------------------------
  
  /**
   * Calcola prestazione con totali
   * Usa la percentualeExtraSSN specifica della prestazione se presente
   */
  calcolaPrestazione(
    prestazione: PrestazioneEcografia,
    percentualeExtra?: number,
    totaleSSNItalia?: number
  ): PrestazioneCalcolata {
    const totaleSSN = prestazione.U + prestazione.B + prestazione.D + prestazione.P;
    
    // Usa la percentuale specifica della prestazione, altrimenti il parametro, altrimenti il default globale
    const percentualeEffettiva = prestazione.percentualeExtraSSN 
      ?? percentualeExtra 
      ?? this.data.mercatoEcografie.italia.percentualeExtraSSN;
    
    const extraSSN = Math.round(totaleSSN * (percentualeEffettiva / 100));
    const totaleAnnuo = totaleSSN + extraSSN;
    
    // Calcola percentuale rispetto al totale Italia (solo se fornito, evita ricorsione)
    const percentualeSSN = totaleSSNItalia && totaleSSNItalia > 0
      ? (totaleSSN / totaleSSNItalia) * 100 
      : 0;
    
    return {
      ...prestazione,
      totaleSSN,
      extraSSN,
      totaleAnnuo,
      percentualeSSN
    };
  }
  
  /**
   * Calcola tutte le prestazioni Italia con totali
   * Ogni prestazione usa la propria percentualeExtraSSN se presente
   */
  calcolaPrestazioniItalia(
    percentualeExtra?: number
  ): PrestazioneCalcolata[] {
    // Prima calcola il totale SSN Italia (somma di tutte le prestazioni)
    const totaleSSNItalia = this.data.mercatoEcografie.italia.prestazioni.reduce(
      (sum, p) => sum + p.U + p.B + p.D + p.P, 0
    );
    
    // Ogni prestazione calcola con la sua % specifica (non più un valore globale)
    return this.data.mercatoEcografie.italia.prestazioni.map(
      p => this.calcolaPrestazione(p, percentualeExtra, totaleSSNItalia)
    );
  }
  
  /**
   * Calcola totali mercato Italia
   */
  calcolaTotaliItalia(percentualeExtra?: number): TotaliMercato {
    const prestazioni = this.calcolaPrestazioniItalia(percentualeExtra);
    
    const volumeSSN = prestazioni.reduce((sum, p) => sum + p.totaleSSN, 0);
    const volumeExtraSSN = prestazioni.reduce((sum, p) => sum + p.extraSSN, 0);
    const volumeTotale = volumeSSN + volumeExtraSSN;
    
    return {
      volumeSSN,
      volumeExtraSSN,
      volumeTotale,
      numeroPrestazioni: prestazioni.length,
      prestazioniAggredibili: prestazioni.filter(p => p.aggredibile).length
    };
  }
  
  /**
   * Calcola totali solo prestazioni aggredibili
   */
  calcolaTotaliAggredibili(percentualeExtra?: number): TotaliMercato {
    const prestazioni = this.calcolaPrestazioniItalia(percentualeExtra)
      .filter(p => p.aggredibile);
    
    const volumeSSN = prestazioni.reduce((sum, p) => sum + p.totaleSSN, 0);
    const volumeExtraSSN = prestazioni.reduce((sum, p) => sum + p.extraSSN, 0);
    const volumeTotale = volumeSSN + volumeExtraSSN;
    
    return {
      volumeSSN,
      volumeExtraSSN,
      volumeTotale,
      numeroPrestazioni: prestazioni.length,
      prestazioniAggredibili: prestazioni.length
    };
  }
  
  /**
   * Calcola mercato regionale (Italia × moltiplicatore)
   */
  calcolaMercatoRegionale(
    regione: 'usa' | 'europa' | 'cina' | 'globale',
    percentualeExtra?: number
  ): TotaliMercato {
    const totaliItalia = this.calcolaTotaliItalia(percentualeExtra);
    const moltiplicatore = this.getMoltiplicatoreRegione(regione);
    
    return {
      volumeSSN: Math.round(totaliItalia.volumeSSN * moltiplicatore.volumeMultiplier),
      volumeExtraSSN: Math.round(totaliItalia.volumeExtraSSN * moltiplicatore.volumeMultiplier),
      volumeTotale: Math.round(totaliItalia.volumeTotale * moltiplicatore.volumeMultiplier),
      numeroPrestazioni: totaliItalia.numeroPrestazioni,
      prestazioniAggredibili: totaliItalia.prestazioniAggredibili
    };
  }
  
  /**
   * Calcola tutti i mercati regionali
   */
  calcolaTuttiMercati(percentualeExtra?: number) {
    return {
      italia: this.calcolaTotaliItalia(percentualeExtra),
      usa: this.calcolaMercatoRegionale('usa', percentualeExtra),
      europa: this.calcolaMercatoRegionale('europa', percentualeExtra),
      cina: this.calcolaMercatoRegionale('cina', percentualeExtra),
      globale: this.calcolaMercatoRegionale('globale', percentualeExtra)
    };
  }
  
  // --------------------------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------------------------
  
  /**
   * Formatta numero con separatori migliaia
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 0
    }).format(num);
  }
  
  /**
   * Ottieni info database
   */
  getMetadata() {
    return {
      version: this.data.version,
      lastUpdate: this.data.lastUpdate,
      description: this.data.description
    };
  }
  
  /**
   * Statistiche complete database
   */
  getStatistiche() {
    const italia = this.calcolaTotaliItalia();
    const aggredibili = this.calcolaTotaliAggredibili();
    const tuttiMercati = this.calcolaTuttiMercati();
    
    return {
      database: this.getMetadata(),
      italia: {
        totale: italia,
        aggredibili,
        percentualeAggredibile: italia.volumeTotale > 0 
          ? ((aggredibili.volumeTotale / italia.volumeTotale) * 100).toFixed(1) + '%'
          : '0%'
      },
      mercatiRegionali: tuttiMercati,
      totaleGlobale: tuttiMercati.globale
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Istanza singleton del servizio
 * Può essere importata ovunque nell'app
 */
export const db = new DatabaseService();

// ============================================================================
// EXPORTS
// ============================================================================

export default db;
