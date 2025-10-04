'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, RefreshCw, TrendingUp, Eye, EyeOff, ChevronUp, ChevronDown, FileSpreadsheet, BarChart3, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PrestazioneData {
  codice: string;
  nome: string;
  riga: number;
  U: number;
  B: number;
  D: number;
  P: number;
  colE: number;
  totaleAnnuo: number;
  extraSSN: number;
  percentualeExtraSSN: number;
  visible: boolean;
  aggredibile: boolean; // Mercato target per Eco3D
}

// Definizione delle prestazioni con i loro dettagli (fuori dal componente per evitare re-render)
const prestazioniConfig = [
  { codice: '88.71.4', nome: 'Capo/Collo', riga: 6 },
  { codice: '88.72.2', nome: 'Cardio a riposo', riga: 10 },
  { codice: '88.73.5', nome: 'TSA', riga: 14 },
  { codice: '88.77.4', nome: 'Arti inferiori (arterioso/venoso)', riga: 18 },
  { codice: '88.77.6', nome: 'Arti superiori (arterioso/venoso)', riga: 22 },
  { codice: '88.76.3', nome: 'Grossi vasi addominali', riga: 26 },
  { codice: '88.78.2', nome: 'Ginecologica (TV/TA)', riga: 30 },
  { codice: '88.76.1', nome: 'Addome completo', riga: 34 },
  { codice: '88.75.1', nome: 'Addome inferiore', riga: 38 },
  { codice: '88.74.1', nome: 'Addome superiore', riga: 42 },
  { codice: '88.73.1', nome: 'Mammella bilaterale', riga: 46 },
  { codice: '88.73.2', nome: 'Mammella monolaterale', riga: 50 },
  { codice: '88.79.3', nome: 'MSK', riga: 54 },
  { codice: '88.79.6', nome: 'Scrotale (eco)', riga: 58 },
  { codice: '88.79.E', nome: 'Scrotale (ECD)', riga: 62 }
];

// Colori per i grafici
const COLORS = {
  primary: '#3b82f6',      // Blu - SSN
  secondary: '#f97316',    // Arancione - Extra-SSN
  accent: '#06b6d4',       // Cyan - Totale
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',      // Verde - Aggredibile
  palette: ['#3b82f6', '#f97316', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#eab308', '#22d3ee']
};

interface RegionalProps {
  region: string;
  flag: string;
  defaultVolumeMultiplier: number;
  defaultValueMultiplier: number;
  volumeRange: string;
  valueRange: string;
  italyQuota: string;
}

export function MercatoEcografieRegionale({
  region,
  flag,
  defaultVolumeMultiplier,
  defaultValueMultiplier,
  volumeRange,
  valueRange,
  italyQuota
}: RegionalProps) {
  // Dati BASE dall'Italia (caricati una sola volta)
  const [basePrestazioniData, setBasePrestazioniData] = useState<PrestazioneData[]>([]);
  const [baseTotaleData, setBaseTotaleData] = useState<PrestazioneData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCodice, setShowCodice] = useState(true);
  const [showUBDP, setShowUBDP] = useState(true);
  const [isTableExpanded, setIsTableExpanded] = useState(true);
  const [chartMode, setChartMode] = useState<'totale' | 'aggredibile' | 'confronto'>('confronto');
  
  // Moltiplicatori regionali modificabili
  const [volumeMultiplier, setVolumeMultiplier] = useState(defaultVolumeMultiplier);
  const [valueMultiplier, setValueMultiplier] = useState(defaultValueMultiplier);
  
  // Calcola range dinamici per gli slider
  const volumeSliderRange = useMemo(() => {
    const offset = region === 'Globale' ? 15 : 5;
    return {
      min: Math.max(1, defaultVolumeMultiplier - offset),
      max: defaultVolumeMultiplier + offset
    };
  }, [region, defaultVolumeMultiplier]);

  const loadExcelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Inizio caricamento Excel...');
      const response = await fetch('/assets/Eco_ITA_MASTER.xlsx');
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      console.log('📊 File scaricato, parsing in corso...');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      console.log('📊 Fogli disponibili:', workbook.SheetNames);

      // Cerca il foglio ECO_Riepilogo
      const sheetName = workbook.SheetNames.find(name => 
        name.includes('Riepilogo') || name.includes('riepilogo')
      );

      if (!sheetName) {
        throw new Error('Foglio ECO_Riepilogo non trovato');
      }

      const worksheet = workbook.Sheets[sheetName];

      // Funzione helper per leggere una cella
      const getCellValue = (cell: string): number => {
        const cellRef = XLSX.utils.decode_cell(cell);
        const cellAddress = XLSX.utils.encode_cell(cellRef);
        const cellData = worksheet[cellAddress];
        return cellData ? (typeof cellData.v === 'number' ? cellData.v : parseFloat(cellData.v) || 0) : 0;
      };

      // Prestazioni target per Eco3D (mercato aggredibile)
      const prestazioniTarget = [
        'Capo/Collo',
        'TSA',
        'Grossi vasi addominali',
        'Addome superiore',
        'Mammella bilaterale',
        'Mammella monolaterale',
        'MSK'
      ];

      // Leggi i dati BASE per ogni prestazione (SENZA moltiplicatori)
      const prestazioniData: PrestazioneData[] = prestazioniConfig.map(config => {
        const isTarget = prestazioniTarget.some(target => 
          config.nome.toLowerCase().includes(target.toLowerCase())
        );
        
        // Dati base dall'Italia (NON moltiplicati)
        return {
          codice: config.codice,
          nome: config.nome,
          riga: config.riga,
          U: getCellValue(`A${config.riga}`),
          B: getCellValue(`B${config.riga}`),
          D: getCellValue(`C${config.riga}`),
          P: getCellValue(`D${config.riga}`),
          colE: getCellValue(`E${config.riga}`),
          totaleAnnuo: getCellValue(`F${config.riga}`),
          extraSSN: getCellValue(`G${config.riga}`),
          percentualeExtraSSN: getCellValue(`H${config.riga}`),
          visible: true,
          aggredibile: isTarget
        };
      });

      console.log('📊 Dati BASE letti:', prestazioniData.length, 'prestazioni');
      setBasePrestazioniData(prestazioniData);

      // Leggi il totale BASE Italia (riga 69)
      const totaleData: PrestazioneData = {
        codice: 'TOTALE',
        nome: 'Totale Italia',
        riga: 69,
        U: getCellValue('A69'),
        B: getCellValue('B69'),
        D: getCellValue('C69'),
        P: getCellValue('D69'),
        colE: getCellValue('E69'),
        totaleAnnuo: getCellValue('F69'),
        extraSSN: getCellValue('G69'),
        percentualeExtraSSN: 0,
        visible: true,
        aggredibile: false
      };

      setBaseTotaleData(totaleData);
      console.log('✅ Caricamento completato con successo');
      setLoading(false);
    } catch (err) {
      console.error('❌ Errore nel caricamento Excel:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setLoading(false);
    }
  }, []); // Carica SOLO UNA VOLTA

  useEffect(() => {
    loadExcelData();
  }, [loadExcelData]);
  
  // Applica moltiplicatori ai dati base (SENZA ricaricare Excel)
  const prestazioni = useMemo(() => {
    return basePrestazioniData.map(base => ({
      ...base,
      // SOLO volumeMultiplier applicato (valueMultiplier NON ancora attivo)
      U: base.U * volumeMultiplier,
      B: base.B * volumeMultiplier,
      D: base.D * volumeMultiplier,
      P: base.P * volumeMultiplier,
      colE: base.colE * volumeMultiplier,
      totaleAnnuo: base.totaleAnnuo * volumeMultiplier,
      extraSSN: base.extraSSN * volumeMultiplier
      // percentualeExtraSSN rimane invariata
    }));
  }, [basePrestazioniData, volumeMultiplier]);
  
  // Applica moltiplicatori al totale
  const totaleItalia = useMemo(() => {
    if (!baseTotaleData) return null;
    return {
      ...baseTotaleData,
      U: baseTotaleData.U * volumeMultiplier,
      B: baseTotaleData.B * volumeMultiplier,
      D: baseTotaleData.D * volumeMultiplier,
      P: baseTotaleData.P * volumeMultiplier,
      colE: baseTotaleData.colE * volumeMultiplier,
      totaleAnnuo: baseTotaleData.totaleAnnuo * volumeMultiplier,
      extraSSN: baseTotaleData.extraSSN * volumeMultiplier
    };
  }, [baseTotaleData, volumeMultiplier]);

  const handlePercentualeChange = (index: number, newValue: number) => {
    const updatedPrestazioni = [...basePrestazioniData];
    const prestazione = updatedPrestazioni[index];
    
    // Aggiorna la percentuale (limitata tra 0 e 100)
    const newPercentuale = Math.max(0, Math.min(100, newValue));
    prestazione.percentualeExtraSSN = newPercentuale;
    
    // Ricalcola l'extra-SSN in base alla nuova percentuale
    // Formula: Extra-SSN = Totale SSN (colE) * (percentuale/100)
    prestazione.extraSSN = (prestazione.colE * newPercentuale) / 100;
    
    // Ricalcola il totale annuo
    prestazione.totaleAnnuo = prestazione.colE + prestazione.extraSSN;
    
    setBasePrestazioniData(updatedPrestazioni);
  };

  const toggleVisibility = (index: number) => {
    const updatedPrestazioni = [...basePrestazioniData];
    updatedPrestazioni[index].visible = !updatedPrestazioni[index].visible;
    setBasePrestazioniData(updatedPrestazioni);
  };

  const toggleAggredibile = (index: number) => {
    const updatedPrestazioni = [...basePrestazioniData];
    updatedPrestazioni[index].aggredibile = !updatedPrestazioni[index].aggredibile;
    setBasePrestazioniData(updatedPrestazioni);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 0
    }).format(num);
  };

  const exportData = () => {
    // Crea un nuovo workbook
    const wb = XLSX.utils.book_new();

    // Prepara i dati per l'export
    const exportData = prestazioni.map(p => ({
      'Codice': p.codice,
      'Prestazione': p.nome,
      'Aggredibile': p.aggredibile ? 'Sì' : 'No',
      'Urgente (U)': p.U,
      'Breve (B)': p.B,
      'Differibile (D)': p.D,
      'Programmabile (P)': p.P,
      'Stima SSN': p.colE,
      'Extra-SSN': p.extraSSN,
      'Totale Annuo': p.totaleAnnuo,
      '% Extra-SSN': p.percentualeExtraSSN,
      'Visibile': p.visible ? 'Sì' : 'No'
    }));

    // Aggiungi riga totale
    if (totaleItalia) {
      exportData.push({
        'Codice': 'TOTALE',
        'Prestazione': 'Totale Italia',
        'Aggredibile': '-',
        'Urgente (U)': totaleItalia.U,
        'Breve (B)': totaleItalia.B,
        'Differibile (D)': totaleItalia.D,
        'Programmabile (P)': totaleItalia.P,
        'Stima SSN': totaleItalia.colE,
        'Extra-SSN': totaleItalia.extraSSN,
        'Totale Annuo': totaleItalia.totaleAnnuo,
        '% Extra-SSN': totaleItalia.colE > 0 ? parseFloat(((totaleItalia.extraSSN / totaleItalia.colE) * 100).toFixed(1)) : 0,
        'Visibile': 'Sì'
      });
    }

    // Aggiungi riga mercato aggredibile
    if (totaleAggredibile && totaleAggredibile.count > 0) {
      exportData.push({
        'Codice': 'AGGREDIBILE',
        'Prestazione': 'Mercato Aggredibile Eco3D',
        'Aggredibile': '🎯',
        'Urgente (U)': totaleAggredibile.U,
        'Breve (B)': totaleAggredibile.B,
        'Differibile (D)': totaleAggredibile.D,
        'Programmabile (P)': totaleAggredibile.P,
        'Stima SSN': totaleAggredibile.colE,
        'Extra-SSN': totaleAggredibile.extraSSN,
        'Totale Annuo': totaleAggredibile.totaleAnnuo,
        '% Extra-SSN': totaleAggredibile.colE > 0 ? parseFloat(((totaleAggredibile.extraSSN / totaleAggredibile.colE) * 100).toFixed(1)) : 0,
        'Visibile': 'Sì'
      });
    }

    // Converti in worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Imposta larghezza colonne
    ws['!cols'] = [
      { wch: 12 },  // Codice
      { wch: 35 },  // Prestazione
      { wch: 12 },  // Aggredibile
      { wch: 12 },  // U
      { wch: 12 },  // B
      { wch: 12 },  // D
      { wch: 12 },  // P
      { wch: 15 },  // Stima SSN
      { wch: 15 },  // Extra-SSN
      { wch: 15 },  // Totale Annuo
      { wch: 12 },  // % Extra-SSN
      { wch: 10 }   // Visibile
    ];

    // Aggiungi worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Mercato Ecografie');

    // Esporta il file
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Eco3D_Mercato_Ecografie_${timestamp}.xlsx`);
  };

  const movePrestazione = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === basePrestazioniData.length - 1) return;

    const newPrestazioni = [...basePrestazioniData];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPrestazioni[index], newPrestazioni[targetIndex]] = [newPrestazioni[targetIndex], newPrestazioni[index]];
    setBasePrestazioniData(newPrestazioni);
  };

  // Memoizza il conteggio delle prestazioni visibili per evitare re-render
  const visibleCount = useMemo(() => {
    return prestazioni.filter(p => p.visible).length;
  }, [prestazioni]);

  // Calcola i totali per il mercato aggredibile
  const totaleAggredibile = useMemo(() => {
    if (!prestazioni || prestazioni.length === 0) return null;
    
    const prestazioniAggredibili = prestazioni.filter(p => p.aggredibile && p.visible);
    
    return {
      count: prestazioniAggredibili.length,
      U: prestazioniAggredibili.reduce((sum, p) => sum + p.U, 0),
      B: prestazioniAggredibili.reduce((sum, p) => sum + p.B, 0),
      D: prestazioniAggredibili.reduce((sum, p) => sum + p.D, 0),
      P: prestazioniAggredibili.reduce((sum, p) => sum + p.P, 0),
      colE: prestazioniAggredibili.reduce((sum, p) => sum + p.colE, 0),
      extraSSN: prestazioniAggredibili.reduce((sum, p) => sum + p.extraSSN, 0),
      totaleAnnuo: prestazioniAggredibili.reduce((sum, p) => sum + p.totaleAnnuo, 0)
    };
  }, [prestazioni]);

  // Dati per i grafici (basati su prestazioni VISIBILI - aggiornati dinamicamente)
  const chartData = useMemo(() => {
    if (!prestazioni || prestazioni.length === 0) return null;

    // Filtra in base alla modalità selezionata
    let dataSource = prestazioni.filter(p => p.visible);
    
    if (chartMode === 'aggredibile') {
      dataSource = dataSource.filter(p => p.aggredibile);
    }
    
    if (dataSource.length === 0) return null;

    // Per la modalità confronto, prepariamo anche i dati aggredibili separati
    const aggredibiliData = prestazioni.filter(p => p.visible && p.aggredibile);

    // Top 10 prestazioni per volume totale
    const top10 = [...dataSource]
      .sort((a, b) => b.totaleAnnuo - a.totaleAnnuo)
      .slice(0, 10)
      .map(p => {
        if (chartMode === 'confronto') {
          // In modalità confronto, mostra sia totale che aggredibile
          const isAggredibile = p.aggredibile;
          return {
            nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
            nomeCompleto: p.nome,
            totale: p.totaleAnnuo,
            ssn: p.colE,
            extraSSN: p.extraSSN,
            ssnAggredibile: isAggredibile ? p.colE : 0,
            extraSSNAggredibile: isAggredibile ? p.extraSSN : 0,
            isAggredibile
          };
        }
        return {
          nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
          nomeCompleto: p.nome,
          totale: p.totaleAnnuo,
          ssn: p.colE,
          extraSSN: p.extraSSN
        };
      });

    // Distribuzione SSN vs Extra-SSN
    const totaleSSN = dataSource.reduce((sum, p) => sum + p.colE, 0);
    const totaleExtra = dataSource.reduce((sum, p) => sum + p.extraSSN, 0);
    
    let pieData;
    if (chartMode === 'confronto') {
      const totaleSSNAggr = aggredibiliData.reduce((sum, p) => sum + p.colE, 0);
      const totaleExtraAggr = aggredibiliData.reduce((sum, p) => sum + p.extraSSN, 0);
      pieData = [
        { name: 'SSN Totale', value: totaleSSN, percentage: ((totaleSSN / (totaleSSN + totaleExtra)) * 100).toFixed(1), type: 'totale' },
        { name: 'Extra-SSN Totale', value: totaleExtra, percentage: ((totaleExtra / (totaleSSN + totaleExtra)) * 100).toFixed(1), type: 'totale' },
        { name: 'SSN Aggredibile', value: totaleSSNAggr, percentage: ((totaleSSNAggr / (totaleSSNAggr + totaleExtraAggr)) * 100).toFixed(1), type: 'aggredibile' },
        { name: 'Extra-SSN Aggredibile', value: totaleExtraAggr, percentage: ((totaleExtraAggr / (totaleSSNAggr + totaleExtraAggr)) * 100).toFixed(1), type: 'aggredibile' }
      ];
    } else {
      pieData = [
        { name: 'SSN', value: totaleSSN, percentage: ((totaleSSN / (totaleSSN + totaleExtra)) * 100).toFixed(1) },
        { name: 'Extra-SSN', value: totaleExtra, percentage: ((totaleExtra / (totaleSSN + totaleExtra)) * 100).toFixed(1) }
      ];
    }

    // Distribuzione priorità (U/B/D/P)
    const priorityData = [
      { name: 'Urgente', value: dataSource.reduce((sum, p) => sum + p.U, 0) },
      { name: 'Breve', value: dataSource.reduce((sum, p) => sum + p.B, 0) },
      { name: 'Differibile', value: dataSource.reduce((sum, p) => sum + p.D, 0) },
      { name: 'Programmabile', value: dataSource.reduce((sum, p) => sum + p.P, 0) }
    ];

    // Dati per bar chart con stack
    const stackedData = dataSource.map(p => ({
      nome: p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome,
      nomeCompleto: p.nome,
      U: p.U,
      B: p.B,
      D: p.D,
      P: p.P
    }));

    // Top 10 per Extra-SSN (numero prestazioni, non percentuale)
    const percentageData = [...dataSource]
      .map(p => ({
        nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
        nomeCompleto: p.nome,
        extraSSN: p.extraSSN,
        percentuale: p.percentualeExtraSSN
      }))
      .sort((a, b) => b.extraSSN - a.extraSSN)
      .slice(0, 10);

    return {
      top10,
      pieData,
      priorityData,
      stackedData,
      percentageData,
      totaleSSN,
      totaleExtra,
      totalePrestazioni: totaleSSN + totaleExtra
    };
  }, [prestazioni, chartMode]);

  if (loading) {
    console.log('🔄 Rendering stato loading');
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento dati Excel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Rendering stato errore:', error);
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Errore nel caricamento</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={loadExcelData} 
                variant="outline" 
                className="mt-4"
              >
                Riprova
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!prestazioni || prestazioni.length === 0) {
    console.log('⚠️ Nessuna prestazione caricata');
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-gray-600">Nessuna prestazione da visualizzare</p>
          <Button onClick={loadExcelData} className="mt-4">
            Ricarica Dati
          </Button>
        </Card>
      </div>
    );
  }

  console.log('✅ Rendering tabella con', prestazioni.length, 'prestazioni');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            {flag} Mercato Ecografie - {region}
          </h1>
          <p className="text-gray-600">
            Analisi mercato ecografico {region} (dati derivati dall&apos;Italia × moltiplicatori)
          </p>
          <div className="mt-2 flex gap-4 text-sm text-gray-500">
            <span>📊 Volume: {volumeRange}× Italia</span>
            <span>💰 Valore: {valueRange}× Italia</span>
            <span>🇮🇹 Quota Italia: {italyQuota}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadExcelData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Ricarica
          </Button>
          <Button onClick={exportData} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Esporta Excel
          </Button>
        </div>
      </div>

      {/* SLIDER MOLTIPLICATORI - SOPRA LE CARDS */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
          ⚙️ Moltiplicatori Regionali
          <Badge variant="outline" className="ml-2 bg-white">
            {region}
          </Badge>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Moltiplicatore Volume (esami)
              <Badge className="ml-2 bg-green-600 text-white text-xs">ATTIVO</Badge>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={volumeSliderRange.min}
                max={volumeSliderRange.max}
                step="0.5"
                value={volumeMultiplier}
                onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min={volumeSliderRange.min}
                max={volumeSliderRange.max}
                step="0.5"
                value={volumeMultiplier}
                onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value) || defaultVolumeMultiplier)}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xl font-bold text-blue-900">×</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Range: {volumeSliderRange.min}× – {volumeSliderRange.max}× (consigliato: {volumeRange}×)
            </p>
          </div>
          
          {/* Slider Valore */}
          <div className="opacity-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Moltiplicatore Valore (economico)
              <Badge className="ml-2 bg-gray-400 text-white text-xs">NON ATTIVO</Badge>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={valueMultiplier}
                disabled
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
              />
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={valueMultiplier}
                disabled
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center bg-gray-100 cursor-not-allowed"
              />
              <span className="text-xl font-bold text-gray-400">×</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ⏸️ Temporaneamente disabilitato (futuro: {valueRange}×)
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVolumeMultiplier(defaultVolumeMultiplier);
              setValueMultiplier(defaultValueMultiplier);
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Valori Default
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          💡 <strong>Nota:</strong> Solo il <strong>Moltiplicatore Volume</strong> è attivo. 
          Tutti i valori di volume (U, B, D, P, SSN, Extra-SSN, Totale) vengono moltiplicati in tempo reale.
          Il Moltiplicatore Valore sarà implementato in futuro. Le percentuali Extra-SSN rimangono invariate.
        </p>
      </Card>

      {/* Summary Cards - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Volume SSN Totale</h3>
          <p className="text-3xl font-bold text-blue-900">
            {totaleItalia ? formatNumber(totaleItalia.colE) : '0'}
          </p>
          <p className="text-xs text-blue-700 mt-1">mercato {region}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <h3 className="text-sm font-semibold text-orange-800 mb-2">Volume Extra-SSN</h3>
          <p className="text-3xl font-bold text-orange-900">
            {totaleItalia ? formatNumber(totaleItalia.extraSSN) : '0'}
          </p>
          <p className="text-xs text-orange-700 mt-1">mercato {region}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <h3 className="text-sm font-semibold text-cyan-800 mb-2">Mercato Totale</h3>
          <p className="text-3xl font-bold text-cyan-900">
            {totaleItalia ? formatNumber(totaleItalia.totaleAnnuo) : '0'}
          </p>
          <p className="text-xs text-cyan-700 mt-1">{region}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-300 ring-2 ring-green-400">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-800">🎯 Mercato Aggredibile</h3>
            <Badge className="bg-green-600 text-white">
              {totaleAggredibile?.count || 0}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {totaleAggredibile ? formatNumber(totaleAggredibile.totaleAnnuo) : '0'}
          </p>
          <p className="text-xs text-green-700 mt-1">
            {totaleAggredibile && totaleItalia 
              ? `${((totaleAggredibile.totaleAnnuo / totaleItalia.totaleAnnuo) * 100).toFixed(1)}% del mercato`
              : 'Target Eco3D'}
          </p>
        </Card>
      </div>

      {/* Tabella Prestazioni */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Prestazioni Ecografiche
            </h2>
            <Badge variant="outline" className="text-sm">
              {visibleCount} / {prestazioni.length} visibili
            </Badge>
          </div>
          
          {/* Controlli per nascondere colonne */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
            >
              {isTableExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Comprimi
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Espandi
                </>
              )}
            </Button>
            <Button
              variant={showCodice ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCodice(!showCodice)}
            >
              {showCodice ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              Codice
            </Button>
            <Button
              variant={showUBDP ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUBDP(!showUBDP)}
            >
              {showUBDP ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              U-B-D-P
            </Button>
          </div>
        </div>
        
        {!isTableExpanded && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              📊 Mostrando le prime 5 prestazioni. Clicca &quot;Espandi&quot; per vedere tutte le {prestazioni.length} prestazioni.
            </p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-center p-3 font-semibold w-16">
                  <Eye className="h-4 w-4 mx-auto" />
                </th>
                <th className="text-center p-3 font-semibold w-20 bg-green-50">
                  🎯 Aggred.
                </th>
                <th className="text-center p-3 font-semibold w-24">Ordine</th>
                {showCodice && <th className="text-left p-3 font-semibold">Codice</th>}
                <th className="text-left p-3 font-semibold">Prestazione</th>
                {showUBDP && (
                  <>
                    <th className="text-right p-3 font-semibold">U</th>
                    <th className="text-right p-3 font-semibold">B</th>
                    <th className="text-right p-3 font-semibold">D</th>
                    <th className="text-right p-3 font-semibold">P</th>
                  </>
                )}
                <th className="text-right p-3 font-semibold bg-blue-50 text-blue-900">Pubblico</th>
                <th className="text-right p-3 font-semibold bg-orange-50 text-orange-900">Privato</th>
                <th className="text-right p-3 font-semibold bg-cyan-50 text-cyan-900">Tot. Annuo</th>
                <th className="text-center p-3 font-semibold">% Extra-SSN</th>
              </tr>
            </thead>
            <tbody>
              {prestazioni.slice(0, isTableExpanded ? prestazioni.length : 5).map((prestazione, index) => (
                <tr 
                  key={`${prestazione.codice}-${index}`} 
                  className={`border-b hover:bg-gray-50 ${!prestazione.visible ? 'opacity-40 bg-gray-100' : ''}`}
                >
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(index)}
                      className="h-8 w-8 p-0"
                      title={prestazione.visible ? 'Nascondi prestazione' : 'Mostra prestazione'}
                    >
                      {prestazione.visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </td>
                  <td className="p-3 bg-green-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAggredibile(index)}
                      className={`h-8 w-8 p-0 ${prestazione.aggredibile ? 'bg-green-100' : ''}`}
                      title={prestazione.aggredibile ? 'Rimuovi da mercato aggredibile' : 'Aggiungi a mercato aggredibile'}
                    >
                      {prestazione.aggredibile ? (
                        <span className="text-2xl">✅</span>
                      ) : (
                        <span className="text-2xl text-gray-300">☐</span>
                      )}
                    </Button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePrestazione(index, 'up')}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePrestazione(index, 'down')}
                        disabled={index === prestazioni.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  {showCodice && (
                    <td className="p-3">
                      <Badge variant="outline">{prestazione.codice}</Badge>
                    </td>
                  )}
                  <td className="p-3 font-medium">{prestazione.nome}</td>
                  {showUBDP && (
                    <>
                      <td className="p-3 text-right text-gray-700">{formatNumber(prestazione.U)}</td>
                      <td className="p-3 text-right text-gray-700">{formatNumber(prestazione.B)}</td>
                      <td className="p-3 text-right text-gray-700">{formatNumber(prestazione.D)}</td>
                      <td className="p-3 text-right text-gray-700">{formatNumber(prestazione.P)}</td>
                    </>
                  )}
                  <td className="p-3 text-right font-semibold text-blue-900 bg-blue-50">
                    {formatNumber(prestazione.colE)}
                  </td>
                  <td className="p-3 text-right font-semibold text-orange-900 bg-orange-50">
                    {formatNumber(prestazione.extraSSN)}
                  </td>
                  <td className="p-3 text-right font-bold text-cyan-900 bg-cyan-50">
                    {formatNumber(prestazione.totaleAnnuo)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={prestazione.percentualeExtraSSN}
                        onChange={(e) => handlePercentualeChange(index, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Riga Totale Italia */}
              {totaleItalia && (
                <tr className="bg-gray-200 border-t-2 border-gray-400 font-bold">
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  {showCodice && <td className="p-3"></td>}
                  <td className="p-3">
                    <Badge className="bg-gray-600">TOTALE {region.toUpperCase()}</Badge>
                  </td>
                  {showUBDP && (
                    <>
                      <td className="p-3 text-right">{formatNumber(totaleItalia.U)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleItalia.B)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleItalia.D)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleItalia.P)}</td>
                    </>
                  )}
                  <td className="p-3 text-right text-blue-900 bg-blue-100 font-bold">
                    {formatNumber(totaleItalia.colE)}
                  </td>
                  <td className="p-3 text-right text-orange-900 bg-orange-100 font-bold">
                    {formatNumber(totaleItalia.extraSSN)}
                  </td>
                  <td className="p-3 text-right text-cyan-900 bg-cyan-100 font-bold">
                    {formatNumber(totaleItalia.totaleAnnuo)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-gray-600">
                      {totaleItalia.colE > 0 
                        ? ((totaleItalia.extraSSN / totaleItalia.colE) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </td>
                </tr>
              )}
              
              {/* Riga Mercato Aggredibile */}
              {totaleAggredibile && (
                <tr className="bg-green-100 border-t border-green-300 font-bold">
                  <td className="p-3"></td>
                  <td className="p-3 bg-green-200">
                    <span className="text-2xl">🎯</span>
                  </td>
                  <td className="p-3"></td>
                  {showCodice && <td className="p-3"></td>}
                  <td className="p-3">
                    <Badge className="bg-green-600">MERCATO AGGREDIBILE</Badge>
                  </td>
                  {showUBDP && (
                    <>
                      <td className="p-3 text-right">{formatNumber(totaleAggredibile.U)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleAggredibile.B)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleAggredibile.D)}</td>
                      <td className="p-3 text-right">{formatNumber(totaleAggredibile.P)}</td>
                    </>
                  )}
                  <td className="p-3 text-right text-green-900 bg-green-200 font-bold">
                    {formatNumber(totaleAggredibile.colE)}
                  </td>
                  <td className="p-3 text-right text-green-900 bg-green-200 font-bold">
                    {formatNumber(totaleAggredibile.extraSSN)}
                  </td>
                  <td className="p-3 text-right text-green-900 bg-green-200 font-bold">
                    {formatNumber(totaleAggredibile.totaleAnnuo)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm font-semibold text-green-700">
                      {totaleAggredibile.colE > 0 
                        ? ((totaleAggredibile.extraSSN / totaleAggredibile.colE) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SEZIONE GRAFICI INTERATTIVI */}
      {chartData && (
        <>
          {/* Intestazione Grafici con Toggle */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📈 Analisi Visuale del Mercato
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={chartMode === 'totale' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartMode('totale')}
                  className={chartMode === 'totale' ? 'bg-gray-600' : ''}
                >
                  Mercato Totale
                </Button>
                <Button
                  variant={chartMode === 'aggredibile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartMode('aggredibile')}
                  className={chartMode === 'aggredibile' ? 'bg-green-600' : ''}
                >
                  Solo Aggredibile
                </Button>
                <Button
                  variant={chartMode === 'confronto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartMode('confronto')}
                  className={chartMode === 'confronto' ? 'bg-blue-600' : ''}
                >
                  Confronto
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <p className="text-gray-600">
                {chartMode === 'totale' && 'Visualizzazione: Mercato Totale Italia'}
                {chartMode === 'aggredibile' && 'Visualizzazione: Solo Mercato Aggredibile da Eco3D'}
                {chartMode === 'confronto' && 'Visualizzazione: Confronto Totale vs Aggredibile'}
              </p>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                {visibleCount} / {prestazioni.length} visibili
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {totaleAggredibile?.count || 0} aggredibili
              </Badge>
            </div>
          </div>

          {/* Grid Grafici Principali */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Grafico 1: Top 10 Prestazioni per Volume */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Top 10 Prestazioni per Volume
                {chartMode === 'aggredibile' && ' (Aggredibili)'}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.top10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(label) => {
                      const item = chartData.top10.find((d: any) => d.nome === label);
                      return item?.nomeCompleto || label;
                    }}
                  />
                  <Legend />
                  {chartMode === 'confronto' ? (
                    <>
                      <Bar dataKey="ssn" name="SSN Totale" fill={COLORS.primary} opacity={0.7} />
                      <Bar dataKey="extraSSN" name="Extra-SSN Totale" fill={COLORS.secondary} opacity={0.7} />
                      <Bar dataKey="ssnAggredibile" name="SSN Aggredibile" fill={COLORS.primary} />
                      <Bar dataKey="extraSSNAggredibile" name="Extra-SSN Aggredibile" fill={COLORS.secondary} />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="ssn" name={chartMode === 'aggredibile' ? 'SSN Aggredibile' : 'Volume SSN'} fill={COLORS.primary} />
                      <Bar dataKey="extraSSN" name={chartMode === 'aggredibile' ? 'Extra-SSN Aggredibile' : 'Volume Extra-SSN'} fill={COLORS.secondary} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Grafico 2: Distribuzione SSN vs Extra-SSN (Pie) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Distribuzione Mercato SSN vs Extra-SSN
                {chartMode === 'aggredibile' && ' (Aggredibili)'}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPie>
                  {chartMode === 'confronto' ? (
                    <>
                      <Pie
                        data={chartData.pieData.filter((d: any) => d.type === 'totale')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        opacity={0.5}
                      >
                        {chartData.pieData.filter((d: any) => d.type === 'totale').map((entry: any, index: number) => (
                          <Cell key={`cell-totale-${index}`} fill={index === 0 ? COLORS.primary : COLORS.secondary} />
                        ))}
                      </Pie>
                      <Pie
                        data={chartData.pieData.filter((d: any) => d.type === 'aggredibile')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                        innerRadius={90}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.pieData.filter((d: any) => d.type === 'aggredibile').map((entry: any, index: number) => (
                          <Cell key={`cell-aggr-${index}`} fill={index === 0 ? COLORS.primary : COLORS.secondary} />
                        ))}
                      </Pie>
                    </>
                  ) : (
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.secondary} />
                      ))}
                    </Pie>
                  )}
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value) + ' prestazioni'}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold">SSN</p>
                  <p className="text-2xl font-bold text-blue-900">{formatNumber(chartData.totaleSSN)}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800 font-semibold">Extra-SSN</p>
                  <p className="text-2xl font-bold text-orange-900">{formatNumber(chartData.totaleExtra)}</p>
                </div>
              </div>
            </Card>

            {/* Grafico 3: Distribuzione Priorità (U/B/D/P) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Distribuzione per Priorità (U/B/D/P)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => formatNumber(value) + ' prestazioni'}
                  />
                  <Bar dataKey="value" fill={COLORS.accent}>
                    {chartData.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.palette[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Grafico 4: Top 10 per Extra-SSN (Numero) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Top 10 Prestazioni per Privato
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.percentageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => formatNumber(value) + ' prestazioni'}
                    labelFormatter={(label) => {
                      const item = chartData.percentageData.find(d => d.nome === label);
                      return item?.nomeCompleto || label;
                    }}
                  />
                  <Bar dataKey="extraSSN" name="Privato" fill={COLORS.warning} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Grafico a tutta larghezza: Stack U/B/D/P per ogni prestazione */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Composizione Completa per Priorità (Tutte le Prestazioni)
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData.stackedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => formatNumber(value)}
                  labelFormatter={(label) => {
                    const item = chartData.stackedData.find(d => d.nome === label);
                    return item?.nomeCompleto || label;
                  }}
                />
                <Legend />
                <Bar dataKey="U" stackId="a" name="Urgente" fill="#ef4444" />
                <Bar dataKey="B" stackId="a" name="Breve" fill="#f59e0b" />
                <Bar dataKey="D" stackId="a" name="Differibile" fill="#10b981" />
                <Bar dataKey="P" stackId="a" name="Programmabile" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">Prestazione Più Richiesta</h4>
              <p className="text-lg font-bold text-purple-900">{chartData.top10[0]?.nomeCompleto}</p>
              <p className="text-sm text-purple-700 mt-1">{formatNumber(chartData.top10[0]?.totale)} prest./anno</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <h4 className="text-sm font-semibold text-orange-800 mb-2">Maggior Privato</h4>
              <p className="text-lg font-bold text-orange-900">{chartData.percentageData[0]?.nomeCompleto}</p>
              <p className="text-sm text-orange-700 mt-1">{formatNumber(chartData.percentageData[0]?.extraSSN)} prestazioni</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <h4 className="text-sm font-semibold text-cyan-800 mb-2">Mercato Totale</h4>
              <p className="text-lg font-bold text-cyan-900">{formatNumber(chartData.totalePrestazioni)}</p>
              <p className="text-sm text-cyan-700 mt-1">prestazioni/anno</p>
            </Card>
          </div>
        </>
      )}

      {/* Legenda - SPOSTATA IN FONDO */}
      <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Legenda Colonne</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
          <div><strong>👁️ Visibilità:</strong> Mostra/Nascondi prestazione (influisce sui totali)</div>
          <div><strong>Ordine:</strong> Riordina prestazioni con frecce ↑↓</div>
          {showCodice && <div><strong>Codice:</strong> Nomenclatore SSN</div>}
          {showUBDP && (
            <>
              <div><strong>U:</strong> Urgente</div>
              <div><strong>B:</strong> Breve</div>
              <div><strong>D:</strong> Differibile</div>
              <div><strong>P:</strong> Programmabile</div>
            </>
          )}
          <div><strong>Stima SSN:</strong> Volume annuo SSN</div>
          <div><strong>Extra-SSN:</strong> Volume mercato privato</div>
          <div><strong>Tot. Annuo:</strong> SSN + Extra-SSN</div>
          <div><strong>% Extra:</strong> Percentuale mercato privato (0-100)</div>
        </div>
      </Card>
    </div>
  );
}
