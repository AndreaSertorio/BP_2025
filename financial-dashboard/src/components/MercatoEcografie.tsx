'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, RefreshCw, TrendingUp, Eye, EyeOff, ChevronUp, ChevronDown, FileSpreadsheet, BarChart3, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDatabase } from '@/contexts/DatabaseProvider';

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

export function MercatoEcografie() {
  // Hook al DatabaseProvider per sincronizzazione
  const { data: dbData, toggleAggredibile: toggleAggredibileDB, setPercentualeExtraSSN: setPercentualeDB } = useDatabase();
  
  const [prestazioni, setPrestazioni] = useState<PrestazioneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totaleItalia, setTotaleItalia] = useState<PrestazioneData | null>(null);
  const [showCodice, setShowCodice] = useState(true);
  const [showUBDP, setShowUBDP] = useState(true);
  const [isTableExpanded, setIsTableExpanded] = useState(true);
  const [chartMode, setChartMode] = useState<'totale' | 'aggredibile' | 'confronto'>('confronto');

  // Carica dati direttamente da database.json (NO Excel!)
  const loadDataFromDatabase = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Caricamento dati da database.json...');
      
      // Converti dati dal database al formato interno
      const prestazioniData: PrestazioneData[] = dbData.mercatoEcografie.italia.prestazioni.map(dbP => {
        // Calcola i valori derivati
        const colE = dbP.U + dbP.B + dbP.D + dbP.P; // SSN totale
        const extraSSN = Math.round((colE * dbP.percentualeExtraSSN) / 100); // Extra-SSN
        const totaleAnnuo = colE + extraSSN; // Totale mercato
        
        return {
          codice: dbP.codice,
          nome: dbP.nome,
          riga: 0, // Non più necessario
          U: dbP.U,
          B: dbP.B,
          D: dbP.D,
          P: dbP.P,
          colE: colE,
          totaleAnnuo: totaleAnnuo,
          extraSSN: extraSSN,
          percentualeExtraSSN: dbP.percentualeExtraSSN,
          visible: true,
          aggredibile: dbP.aggredibile
        };
      });

      console.log(`✅ Caricate ${prestazioniData.length} prestazioni da database`);
      setPrestazioni(prestazioniData);

      // Calcola totale Italia sommando tutte le prestazioni
      const totaleU = prestazioniData.reduce((sum, p) => sum + p.U, 0);
      const totaleB = prestazioniData.reduce((sum, p) => sum + p.B, 0);
      const totaleD = prestazioniData.reduce((sum, p) => sum + p.D, 0);
      const totaleP = prestazioniData.reduce((sum, p) => sum + p.P, 0);
      const totaleColE = prestazioniData.reduce((sum, p) => sum + p.colE, 0);
      const totaleExtraSSN = prestazioniData.reduce((sum, p) => sum + p.extraSSN, 0);
      const totaleTotaleAnnuo = prestazioniData.reduce((sum, p) => sum + p.totaleAnnuo, 0);

      const totaleData: PrestazioneData = {
        codice: 'TOTALE',
        nome: 'Totale Italia',
        riga: 0,
        U: totaleU,
        B: totaleB,
        D: totaleD,
        P: totaleP,
        colE: totaleColE,
        totaleAnnuo: totaleTotaleAnnuo,
        extraSSN: totaleExtraSSN,
        percentualeExtraSSN: 0,
        visible: true,
        aggredibile: false
      };

      setTotaleItalia(totaleData);
      console.log('✅ Totale Italia calcolato');
      setLoading(false);
    } catch (err) {
      console.error('❌ Errore caricamento dati:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setLoading(false);
    }
  }, [dbData]);

  useEffect(() => {
    // Carica dati da database.json al mount
    loadDataFromDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al mount!

  // Sincronizza quando cambia dbData (per riflettere modifiche da altre pagine)
  useEffect(() => {
    if (prestazioni.length === 0 || !dbData) return;

    console.log('🔄 Controllo sincronizzazione con database...');
    
    // Verifica se ci sono differenze
    let hasChanges = false;
    
    const prestazioniAggiornate = prestazioni.map(p => {
      const dbPrestazione = dbData.mercatoEcografie.italia.prestazioni.find(
        dbP => dbP.codice === p.codice
      );

      if (dbPrestazione) {
        // Se aggredibile o percentuale sono diversi, aggiorna
        if (dbPrestazione.aggredibile !== p.aggredibile || 
            dbPrestazione.percentualeExtraSSN !== p.percentualeExtraSSN) {
          
          hasChanges = true;
          const percentuale = dbPrestazione.percentualeExtraSSN || p.percentualeExtraSSN;
          const extraSSN = Math.round((p.colE * percentuale) / 100);
          const totaleAnnuo = p.colE + extraSSN;
          
          console.log(`   → Aggiorno ${p.codice}: aggredibile=${dbPrestazione.aggredibile}, %=${percentuale}`);
          
          return {
            ...p,
            aggredibile: dbPrestazione.aggredibile,
            percentualeExtraSSN: percentuale,
            extraSSN: extraSSN,
            totaleAnnuo: totaleAnnuo,
          };
        }
      }

      return p;
    });

    if (hasChanges) {
      console.log('✅ Sincronizzazione completata con modifiche');
      setPrestazioni(prestazioniAggiornate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbData.mercatoEcografie.italia.prestazioni]);

  const handlePercentualeChange = (index: number, newValue: number) => {
    const updatedPrestazioni = [...prestazioni];
    const prestazione = updatedPrestazioni[index];
    
    // Aggiorna la percentuale (limitata tra 0 e 100)
    const newPercentuale = Math.max(0, Math.min(100, newValue));
    prestazione.percentualeExtraSSN = newPercentuale;
    
    // Ricalcola l'extra-SSN in base alla nuova percentuale
    // Formula: Extra-SSN = Totale SSN (colE) * (percentuale/100)
    prestazione.extraSSN = Math.round((prestazione.colE * newPercentuale) / 100);
    
    // Ricalcola il totale annuo
    prestazione.totaleAnnuo = prestazione.colE + prestazione.extraSSN;
    
    // Sincronizza PRIMA con il database centralizzato
    setPercentualeDB(prestazione.codice, newPercentuale);
    
    console.log(`📊 Percentuale Extra-SSN per ${prestazione.codice}: ${newPercentuale}% -> Extra-SSN: ${prestazione.extraSSN}`);
    
    // Aggiorna stato locale DOPO (per evitare loop)
    setPrestazioni(updatedPrestazioni);
    
    // Ricalcola il totale Italia
    recalculateTotale(updatedPrestazioni);
  };

  const recalculateTotale = (prestazioniData: PrestazioneData[]) => {
    if (!totaleItalia) return;

    // Considera solo le prestazioni visibili per il calcolo dei totali
    const visiblePrestazioni = prestazioniData.filter(p => p.visible);

    const newTotale = { ...totaleItalia };
    newTotale.U = visiblePrestazioni.reduce((sum, p) => sum + p.U, 0);
    newTotale.B = visiblePrestazioni.reduce((sum, p) => sum + p.B, 0);
    newTotale.D = visiblePrestazioni.reduce((sum, p) => sum + p.D, 0);
    newTotale.P = visiblePrestazioni.reduce((sum, p) => sum + p.P, 0);
    newTotale.colE = visiblePrestazioni.reduce((sum, p) => sum + p.colE, 0);
    newTotale.extraSSN = visiblePrestazioni.reduce((sum, p) => sum + p.extraSSN, 0);
    newTotale.totaleAnnuo = visiblePrestazioni.reduce((sum, p) => sum + p.totaleAnnuo, 0);

    setTotaleItalia(newTotale);
  };

  const toggleVisibility = (index: number) => {
    const updatedPrestazioni = [...prestazioni];
    updatedPrestazioni[index].visible = !updatedPrestazioni[index].visible;
    setPrestazioni(updatedPrestazioni);
    recalculateTotale(updatedPrestazioni);
  };

  const toggleAggredibile = (index: number) => {
    const prestazione = prestazioni[index];
    
    // SOLO toggle nel database centralizzato
    toggleAggredibileDB(prestazione.codice);
    
    // Aggiorna lo stato locale in base al nuovo valore del database
    // Il database fa il toggle, quindi invertiamo il valore attuale
    const nuovoValore = !prestazione.aggredibile;
    
    const updatedPrestazioni = [...prestazioni];
    updatedPrestazioni[index] = {
      ...prestazione,
      aggredibile: nuovoValore
    };
    
    setPrestazioni(updatedPrestazioni);
    
    console.log(`✅ Toggle aggredibile per ${prestazione.codice}: ${prestazione.aggredibile} → ${nuovoValore}`);
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
    if (direction === 'down' && index === prestazioni.length - 1) return;

    const newPrestazioni = [...prestazioni];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPrestazioni[index], newPrestazioni[targetIndex]] = [newPrestazioni[targetIndex], newPrestazioni[index]];
    setPrestazioni(newPrestazioni);
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
                onClick={loadDataFromDatabase} 
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
          <Button onClick={loadDataFromDatabase} className="mt-4">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Mercato Ecografie Italia
          </h1>
          <p className="text-gray-600">
            Dati da <strong>database.json</strong> - {prestazioni.length} prestazioni ecografiche
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDataFromDatabase} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Ricarica
          </Button>
          <Button onClick={exportData} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Esporta Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Volume SSN Totale</h3>
          <p className="text-3xl font-bold text-blue-900">
            {totaleItalia ? formatNumber(totaleItalia.colE) : '0'}
          </p>
          <p className="text-xs text-blue-700 mt-1">mercato completo</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <h3 className="text-sm font-semibold text-orange-800 mb-2">Volume Extra-SSN</h3>
          <p className="text-3xl font-bold text-orange-900">
            {totaleItalia ? formatNumber(totaleItalia.extraSSN) : '0'}
          </p>
          <p className="text-xs text-orange-700 mt-1">mercato completo</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <h3 className="text-sm font-semibold text-cyan-800 mb-2">Mercato Totale</h3>
          <p className="text-3xl font-bold text-cyan-900">
            {totaleItalia ? formatNumber(totaleItalia.totaleAnnuo) : '0'}
          </p>
          <p className="text-xs text-cyan-700 mt-1">Italia completa</p>
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
                <th className="text-right p-3 font-semibold bg-blue-50 text-blue-900">SSN (Pubblico)</th>
                <th className="text-right p-3 font-semibold bg-orange-50 text-orange-900">Extra-SSN (Privato)</th>
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
                    <Badge className="bg-gray-600">TOTALE ITALIA</Badge>
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
                Top 10 Prestazioni per Extra-SSN (Privato)
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
                  <Bar dataKey="extraSSN" name="Extra-SSN (Privato)" fill={COLORS.warning} />
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
              <h4 className="text-sm font-semibold text-orange-800 mb-2">Maggior Extra-SSN (Privato)</h4>
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
