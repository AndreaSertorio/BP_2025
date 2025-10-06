/**
 * ============================================================================
 * DATA LOADER - ECOGRAFIE
 * ============================================================================
 * 
 * Carica dati U/B/D/P da ECO_Riepilogo.xlsx e popola EcografieContext.
 * 
 * Created: 2025-01-05
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useEcografie } from '@/contexts/EcografieContext';
import * as XLSX from 'xlsx';
import { DatiPrestazioneItalia } from '@/types/ecografie.types';

export function EcografieDataLoader() {
  const { stato, azioni } = useEcografie();
  
  const loadData = useCallback(async () => {
    // Se già caricato, skip
    if (stato.italia.prestazioni[0].U > 0) {
      console.log('✅ Dati Ecografie già caricati nel Context');
      return;
    }
    
    console.log('🔄 Caricamento dati Ecografie da Excel...');
    
    try {
      const response = await fetch('/assets/ECO_Riepilogo.xlsx');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets['Riepilogo'];
      
      if (!sheet) throw new Error('Sheet "Riepilogo" non trovato');
      
      // Helper per leggere celle
      const parseCell = (cell: XLSX.CellObject | undefined): number => {
        if (!cell || cell.v === undefined) return 0;
        const value = cell.v;
        
        if (typeof value === 'number') return value;
        
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^\d.-]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        }
        
        return 0;
      };
      
      // Parse dati U/B/D/P per tutte le 15 prestazioni
      const prestazioni: DatiPrestazioneItalia[] = [
        {
          prestazione: 'Addome Completo',
          U: parseCell(sheet['G9']),
          B: parseCell(sheet['H9']),
          D: parseCell(sheet['I9']),
          P: parseCell(sheet['J9']),
          aggredibile: true
        },
        {
          prestazione: 'Addome Superiore',
          U: parseCell(sheet['G10']),
          B: parseCell(sheet['H10']),
          D: parseCell(sheet['I10']),
          P: parseCell(sheet['J10']),
          aggredibile: true
        },
        {
          prestazione: 'Addome Inferiore',
          U: parseCell(sheet['G11']),
          B: parseCell(sheet['H11']),
          D: parseCell(sheet['I11']),
          P: parseCell(sheet['J11']),
          aggredibile: true
        },
        {
          prestazione: 'Apparato Urinario',
          U: parseCell(sheet['G12']),
          B: parseCell(sheet['H12']),
          D: parseCell(sheet['I12']),
          P: parseCell(sheet['J12']),
          aggredibile: true
        },
        {
          prestazione: 'Collo (tiroide)',
          U: parseCell(sheet['G13']),
          B: parseCell(sheet['H13']),
          D: parseCell(sheet['I13']),
          P: parseCell(sheet['J13']),
          aggredibile: true
        },
        {
          prestazione: 'Cute e Sottocute',
          U: parseCell(sheet['G14']),
          B: parseCell(sheet['H14']),
          D: parseCell(sheet['I14']),
          P: parseCell(sheet['J14']),
          aggredibile: true
        },
        {
          prestazione: 'Mammella',
          U: parseCell(sheet['G15']),
          B: parseCell(sheet['H15']),
          D: parseCell(sheet['I15']),
          P: parseCell(sheet['J15']),
          aggredibile: true
        },
        {
          prestazione: 'Muscoloscheletrico',
          U: parseCell(sheet['G16']),
          B: parseCell(sheet['H16']),
          D: parseCell(sheet['I16']),
          P: parseCell(sheet['J16']),
          aggredibile: true
        },
        {
          prestazione: 'Osteoarticolare',
          U: parseCell(sheet['G17']),
          B: parseCell(sheet['H17']),
          D: parseCell(sheet['I17']),
          P: parseCell(sheet['J17']),
          aggredibile: true
        },
        {
          prestazione: 'Parti Molli',
          U: parseCell(sheet['G18']),
          B: parseCell(sheet['H18']),
          D: parseCell(sheet['I18']),
          P: parseCell(sheet['J18']),
          aggredibile: true
        },
        {
          prestazione: 'Pelvi',
          U: parseCell(sheet['G19']),
          B: parseCell(sheet['H19']),
          D: parseCell(sheet['I19']),
          P: parseCell(sheet['J19']),
          aggredibile: true
        },
        {
          prestazione: 'Prostata',
          U: parseCell(sheet['G20']),
          B: parseCell(sheet['H20']),
          D: parseCell(sheet['I20']),
          P: parseCell(sheet['J20']),
          aggredibile: true
        },
        {
          prestazione: 'Testicoli',
          U: parseCell(sheet['G21']),
          B: parseCell(sheet['H21']),
          D: parseCell(sheet['I21']),
          P: parseCell(sheet['J21']),
          aggredibile: true
        },
        {
          prestazione: 'Vasi',
          U: parseCell(sheet['G22']),
          B: parseCell(sheet['H22']),
          D: parseCell(sheet['I22']),
          P: parseCell(sheet['J22']),
          aggredibile: true
        },
        {
          prestazione: 'Altri Distretti',
          U: parseCell(sheet['G23']),
          B: parseCell(sheet['H23']),
          D: parseCell(sheet['I23']),
          P: parseCell(sheet['J23']),
          aggredibile: true
        }
      ];
      
      // Carica nel Context
      azioni.caricaDatiExcel({
        italia: {
          prestazioni,
          percentualeExtraSSN: 30,
          annoRiferimento: 2024
        }
      });
      
      console.log('✅ Dati Ecografie caricati con successo!');
      console.log('📊 Statistiche:');
      console.log('  - Prestazioni:', prestazioni.length);
      console.log('  - Totale U:', prestazioni.reduce((sum, p) => sum + p.U, 0).toLocaleString());
      console.log('  - Totale B:', prestazioni.reduce((sum, p) => sum + p.B, 0).toLocaleString());
      console.log('  - Totale D:', prestazioni.reduce((sum, p) => sum + p.D, 0).toLocaleString());
      console.log('  - Totale P:', prestazioni.reduce((sum, p) => sum + p.P, 0).toLocaleString());
      
    } catch (error) {
      console.error('❌ Errore caricamento dati Ecografie:', error);
    }
  }, [stato.italia.prestazioni, azioni]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return null;
}
