/**
 * ============================================================================
 * DATA LOADER - CARICA DATI EXCEL NEL CONTEXT
 * ============================================================================
 * 
 * Componente invisibile che carica i dati dai file Excel e li popola
 * nel MercatoContext all'avvio dell'applicazione.
 * 
 * Created: 2025-01-05
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useMercato } from '@/contexts/MercatoContext';
import * as XLSX from 'xlsx';

export function MercatoDataLoader() {
  const { stato, azioni } = useMercato();
  
  const loadData = useCallback(async () => {
    // Verifica se dati effettivamente presenti e validi
    const datiValidi = stato.datiBase.numeroEcografi.length > 0 && 
                       stato.datiBase.valoreMercato.length > 0;
    
    if (datiValidi) {
      console.log('✅ Dati già caricati nel Context');
      console.log('📊 Numero Ecografi:', stato.datiBase.numeroEcografi.length, 'regioni');
      console.log('📊 Valore Mercato:', stato.datiBase.valoreMercato.length, 'regioni');
      return;
    }
    
    console.log('🔄 Caricamento dati Excel nel Context...');
    console.log('📁 Cercando files in /assets/');
    
    try {
      // ===================================================================
      // 1. CARICA ECO_Proiezioni_Ecografi_2025_2030.xlsx
      // ===================================================================
      const responseProiezioni = await fetch('/assets/ECO_Proiezioni_Ecografi_2025_2030.xlsx');
      if (!responseProiezioni.ok) throw new Error(`HTTP ${responseProiezioni.status}`);
      
      const arrayBufferProiezioni = await responseProiezioni.arrayBuffer();
      const workbookProiezioni = XLSX.read(arrayBufferProiezioni, { type: 'array' });
      
      // PARCO IT 2025-2035
      const sheetParco = workbookProiezioni.Sheets['Parco_IT_2025-2035'];
      const parcoIT = [];
      if (sheetParco) {
        const dataParco = XLSX.utils.sheet_to_json(sheetParco, { header: 1 }) as unknown[][];
        for (let i = 1; i < dataParco.length; i++) {
          const row = dataParco[i] as (string | number)[];
          if (row[0]) {
            parcoIT.push({
              anno: Number(row[0]),
              basso: Number(row[1]) || 0,
              centrale: Number(row[2]) || 0,
              alto: Number(row[3]) || 0
            });
          }
        }
      }
      
      // NUMERO ECOGRAFI
      const sheetNumero = workbookProiezioni.Sheets['Numero Ecografi'];
      const numeroEcografi = [];
      if (sheetNumero) {
        const dataNumero = XLSX.utils.sheet_to_json(sheetNumero, { header: 1 }) as unknown[][];
        for (let i = 1; i < dataNumero.length; i++) {
          const row = dataNumero[i] as (string | number)[];
          if (row[0]) {
            numeroEcografi.push({
              mercato: String(row[0]),
              unita2025: Number(row[1]) || 0,
              unita2030: Number(row[2]) || 0
            });
          }
        }
      }
      
      // VALORE MERCATO
      const sheetValore = workbookProiezioni.Sheets['Valore Mercato'];
      const valoreMercato = [];
      if (sheetValore) {
        const dataValore = XLSX.utils.sheet_to_json(sheetValore, { header: 1 }) as unknown[][];
        for (let i = 1; i < dataValore.length; i++) {
          const row = dataValore[i] as (string | number)[];
          if (row[0]) {
            valoreMercato.push({
              mercato: String(row[0]),
              valore2025: Number(row[1]) || 0,
              valore2030: Number(row[2]) || 0,
              cagr: Number(row[3]) || 0
            });
          }
        }
      }
      
      // ===================================================================
      // 2. CARICA ECO_DatiMercato.xlsx
      // ===================================================================
      const responseDati = await fetch('/assets/ECO_DatiMercato.xlsx');
      if (!responseDati.ok) throw new Error(`HTTP ${responseDati.status}`);
      
      const arrayBufferDati = await responseDati.arrayBuffer();
      const workbookDati = XLSX.read(arrayBufferDati, { type: 'array' });
      const sheetDati = workbookDati.Sheets['DatiMercato'];
      
      if (!sheetDati) {
        throw new Error('Sheet "DatiMercato" non trovato');
      }
      
      // Helper per leggere celle
      const getCell = (cell: string): number => {
        const cellValue = sheetDati[cell];
        if (!cellValue) return 0;
        
        let value = cellValue.v;
        if (typeof value === 'string') {
          value = value.replace(/[\$M\s,]/g, '');
          value = parseFloat(value);
        }
        return isNaN(value) ? 0 : value;
      };
      
      const getTipCell = (cell: string): string | number => {
        const cellValue = sheetDati[cell];
        return cellValue ? cellValue.v : '';
      };
      
      // Mercato Italia 2030
      const mercatoItalia2030 = getCell('C5'); // 339 M$
      
      // Quote Italia 2030
      const quotaCarrIT2030 = getCell('B28') / 100;
      const quotaPortIT2030 = getCell('C28') / 100;
      const quotaPalmIT2030 = getCell('D28') / 100;
      
      // Valori Italia 2030
      const valCarrIT = mercatoItalia2030 * quotaCarrIT2030;
      const valPortIT = mercatoItalia2030 * quotaPortIT2030;
      const valPalmIT = mercatoItalia2030 * quotaPalmIT2030;
      
      // TIPOLOGIE
      const tipologie = [
        { 
          tipologia: 'Carrellati', icon: '🏥', 
          quotaIT: quotaCarrIT2030,
          valoreIT: valCarrIT,
          quotaGlobale: Number(getTipCell('E6')) || 0,
          valoreGlobale: Number(getTipCell('F6')) || 0,
          cagrGlobale: String(getTipCell('H6')),
          note: String(getTipCell('I6')),
          visible: true, target: false 
        },
        { 
          tipologia: 'Portatili', icon: '💼', 
          quotaIT: quotaPortIT2030,
          valoreIT: valPortIT,
          quotaGlobale: Number(getTipCell('E7')) || 0,
          valoreGlobale: Number(getTipCell('F7')) || 0,
          cagrGlobale: String(getTipCell('H7')),
          note: String(getTipCell('I7')),
          visible: true, target: false 
        },
        { 
          tipologia: 'Palmari', icon: '📱', 
          quotaIT: quotaPalmIT2030,
          valoreIT: valPalmIT,
          quotaGlobale: Number(getTipCell('E8')) || 0,
          valoreGlobale: Number(getTipCell('F8')) || 0,
          cagrGlobale: String(getTipCell('H8')),
          note: String(getTipCell('I8')),
          visible: true, target: true 
        }
      ];
      
      // PROIEZIONI ITALIA
      const parseValue = (val: string | number | undefined) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          let cleaned = val.replace(/[\$M\s]/g, '').trim();
          if (/,\d{2}($|\D)/.test(cleaned)) {
            cleaned = cleaned.replace(',', '.');
          } else {
            cleaned = cleaned.replace(/,/g, '');
          }
          return parseFloat(cleaned) || 0;
        }
        return 0;
      };
      
      const proiezioniItalia = [];
      for (let r = 5; r <= 11; r++) {
        const anno = getCell(`A${r}`);
        const mordor = parseValue(getTipCell(`B${r}`));
        const research = parseValue(getTipCell(`C${r}`));
        const grandview = parseValue(getTipCell(`D${r}`));
        const cognitive = parseValue(getTipCell(`E${r}`));
        const media = parseValue(getTipCell(`G${r}`));
        const mediana = parseValue(getTipCell(`H${r}`));
        proiezioniItalia.push({ anno, mordor, research, grandview, cognitive, media, mediana });
      }
      
      // Proiezione lineare 2031-2035
      const cagr = 0.0411;
      const ultimo = proiezioniItalia[proiezioniItalia.length - 1];
      for (let anno = 2031; anno <= 2035; anno++) {
        const anni_diff = anno - 2030;
        const fattoreCrescita = Math.pow(1 + cagr, anni_diff);
        proiezioniItalia.push({
          anno,
          mordor: ultimo.mordor * fattoreCrescita,
          research: ultimo.research * fattoreCrescita,
          grandview: ultimo.grandview * fattoreCrescita,
          cognitive: ultimo.cognitive * fattoreCrescita,
          media: ultimo.media * fattoreCrescita,
          mediana: ultimo.mediana * fattoreCrescita
        });
      }
      
      // QUOTE TIPOLOGIE
      const quoteTipologie = [];
      for (let r = 21; r <= 27; r++) {
        const anno = 2025 + (r - 21);
        const carrellati = getCell(`B${r}`) / 100;
        const portatili = getCell(`C${r}`) / 100;
        const palmari = getCell(`D${r}`) / 100;
        quoteTipologie.push({ anno, carrellati, portatili, palmari });
      }
      
      // ===================================================================
      // 3. CARICA DATI NEL CONTEXT
      // ===================================================================
      azioni.caricaDatiExcel({
        tipologie,
        proiezioniItalia,
        quoteTipologie,
        parcoIT,
        numeroEcografi,
        valoreMercato
      });
      
      console.log('✅ Dati caricati con successo nel Context!');
      console.log('📊 Statistiche:');
      console.log('  - Tipologie:', tipologie.length);
      console.log('  - Proiezioni Italia:', proiezioniItalia.length, 'anni');
      console.log('  - Quote Tipologie:', quoteTipologie.length, 'anni');
      console.log('  - Parco IT:', parcoIT.length, 'anni');
      console.log('  - Numero Ecografi:', numeroEcografi.length, 'regioni');
      console.log('  - Valore Mercato:', valoreMercato.length, 'regioni');
      
    } catch (error) {
      console.error('❌ Errore caricamento dati:', error);
    }
  }, [stato.datiBase.numeroEcografi.length, stato.datiBase.valoreMercato.length, azioni]);
  
  // Carica dati all'avvio
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Componente invisibile
  return null;
}
