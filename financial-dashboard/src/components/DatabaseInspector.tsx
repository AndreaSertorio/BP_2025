'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Edit2, 
  Save, 
  X, 
  Search,
  Info,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';

interface DatabaseInspectorProps {
  onDataUpdate?: (path: string, value: any) => void;
}

export function DatabaseInspector({ onDataUpdate }: DatabaseInspectorProps) {
  // Carica stato espansione da sessionStorage (persiste durante la sessione)
  const loadExpandedPaths = (): Set<string> => {
    if (typeof window === 'undefined') return new Set(['root']);
    
    const saved = sessionStorage.getItem('dbInspector_expandedPaths');
    if (saved) {
      try {
        const array = JSON.parse(saved);
        return new Set(array);
      } catch (e) {
        console.error('Errore nel caricamento stato espansione:', e);
      }
    }
    return new Set(['root']);
  };

  const [data, setData] = useState<any>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(loadExpandedPaths());
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMetadata, setShowMetadata] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionValue, setNewSectionValue] = useState('{}');
  const [showSystemSections, setShowSystemSections] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sezioni di sistema da nascondere di default
  const systemSections = ['version', 'lastUpdate', 'description', 'metadata'];

  // Carica i dati dal database tramite API (sempre aggiornato!)
  const loadDatabase = async () => {
    try {
      // Usa l'API invece del file statico per avere sempre i dati aggiornati
      const response = await fetch('/api/database', {
        cache: 'no-store' // Disabilita cache per vedere sempre modifiche recenti
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const dbData = await response.json();
      
      // CARICA TUTTO IL DATABASE (incluso Budget)
      // Le sezioni di sistema (version, metadata, etc.) verranno nascoste di default nell'UI
      
      console.log('📊 Database caricato da API:', {
        sezioniTotali: Object.keys(dbData).length,
        sezioniVisualizzate: Object.keys(dbData).length,
        sezioniSistemaNascosteDiDefault: systemSections,
        elencoSezioni: Object.keys(dbData).sort(),
        timestamp: new Date().toISOString()
      });
      
      setData(dbData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Errore nel caricamento del database:', error);
      alert('Errore nel caricamento del database. Controlla la console per dettagli.');
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Salva stato espansione in sessionStorage quando cambia
  useEffect(() => {
    if (typeof window !== 'undefined' && expandedPaths.size > 0) {
      const pathsArray = Array.from(expandedPaths);
      sessionStorage.setItem('dbInspector_expandedPaths', JSON.stringify(pathsArray));
      console.log('💾 Stato espansione salvato:', pathsArray.length, 'nodi aperti');
    }
  }, [expandedPaths]);

  // Auto-refresh ogni 5 secondi se attivato
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDatabase();
      }, 5000); // Refresh ogni 5 secondi
      
      setRefreshInterval(interval);
      
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  // Toggle espansione nodo
  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Avvia modifica
  const startEdit = (path: string, currentValue: any) => {
    setEditingPath(path);
    setEditValue(JSON.stringify(currentValue, null, 2));
  };

  // Salva modifica (ora salva REALMENTE sul database!)
  const saveEdit = async () => {
    if (!editingPath) return;
    
    try {
      const newValue = JSON.parse(editValue);
      
      // Aggiorna i dati localmente prima (per feedback immediato)
      const pathParts = editingPath.split('.');
      const newData = JSON.parse(JSON.stringify(data));
      
      let current = newData;
      for (let i = 1; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = newValue;
      
      setData(newData);
      setEditingPath(null);
      setEditValue('');
      
      // Salva sul database tramite API
      const response = await fetch('/api/database', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: editingPath.substring(5), // Rimuovi "root." dal path
          value: newValue
        })
      });
      
      if (!response.ok) {
        throw new Error(`Errore nel salvataggio: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Modifica salvata sul database:', result);
      
      // Mostra messaggio di successo
      setSaveMessage(`✅ Salvato: ${editingPath.split('.').pop()}`);
      setTimeout(() => setSaveMessage(null), 3000);
      
      // Ricarica i dati per sincronizzare
      await loadDatabase();
      
      if (onDataUpdate) {
        onDataUpdate(editingPath, newValue);
      }
    } catch (error) {
      setSaveMessage(`❌ Errore nel salvataggio`);
      setTimeout(() => setSaveMessage(null), 3000);
      console.error('Errore salvataggio:', error);
      // Ricarica i dati per ripristinare lo stato corretto
      await loadDatabase();
    }
  };

  // Cancella modifica
  const cancelEdit = () => {
    setEditingPath(null);
    setEditValue('');
  };

  // Determina il tipo di un valore
  const getValueType = (value: any): string => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  };

  // Ottiene descrizione di una sezione (mappa dinamica - si aggiorna automaticamente)
  const getDescription = (key: string): string => {
    const descriptionMap: { [key: string]: string } = {
      // Metadata e info generali
      version: 'Numero versione database',
      lastUpdate: 'Data ultimo aggiornamento database',
      description: 'Descrizione generale database',
      metadata: 'Informazioni versione, sorgenti dati, regole validazione',
      
      // Mercato ecografie e prestazioni
      mercatoEcografie: 'Prestazioni ecografiche Italia con codici, valori U/B/D/P e % Extra-SSN',
      prezziEcografieRegionalizzati: 'Prezzi prestazioni pubblico/privato con range regionali Italia',
      
      // Mercato ecografi e dispositivi
      mercatoEcografi: 'Tipologie ecografi (Carrellati, Portatili, Palmari), valori mercato, proiezioni 2025-2035',
      
      // Geografia e moltiplicatori
      regioniMondiali: 'Moltiplicatori geografici per espansione (USA, Europa, Cina, Globale)',
      moltiplicatoriRegionali: 'Moltiplicatori regionali alternativi per analisi mercato',
      
      // Configurazioni e modelli
      configurazioneTamSamSom: 'Configurazione TAM/SAM/SOM, prezzi medi, stime mercato aggredibile',
      revenueModel: 'Modello completo ricavi: Hardware (CapEx) + SaaS (ricorrente) + Penetrazione',
      
      // Finanza e Budget
      contoEconomico: 'P&L completo: ricavi, COGS, OPEX, ammortamenti, interessi, break-even, KPI',
      budget: 'Budget aziendale completo 2025-2028: tutte le voci di costo dettagliate per categoria (~3000 righe)',
      
      // Placeholder
      materialiConsumabili: 'Placeholder per dati materiali consumabili (da implementare)'
    };
    
    return descriptionMap[key] || '🆕 Nuova sezione - descrizione da aggiungere nella mappa';
  };

  // Ottiene informazioni su chi usa questi dati (mappa dinamica - si aggiorna automaticamente)
  const getUsageInfo = (key: string): string[] => {
    const usageMap: { [key: string]: string[] } = {
      // Sistema
      version: ['Sistema - versioning'],
      lastUpdate: ['Sistema - timestamp'],
      description: ['Sistema - metadata'],
      metadata: ['Tutti i componenti'],
      
      // Mercato ecografie
      mercatoEcografie: ['MercatoEcografie.tsx', 'MercatoEcografieRegionale.tsx'],
      prezziEcografieRegionalizzati: ['MercatoEcografie.tsx', 'TamSamSomDashboard.tsx'],
      
      // Mercato ecografi
      mercatoEcografi: ['MercatoEcografi.tsx', 'TamSamSomDashboard.tsx'],
      
      // Geografia
      regioniMondiali: ['MercatoEcografieRegionale.tsx'],
      moltiplicatoriRegionali: ['MercatoEcografieRegionale.tsx'],
      
      // Configurazioni
      configurazioneTamSamSom: ['TamSamSomDashboard.tsx', 'RevenueModelDashboard.tsx'],
      revenueModel: ['RevenueModelDashboard.tsx', 'FinancialCalculator.ts'],
      
      // Finanza e Budget
      contoEconomico: ['IncomeStatementDashboard.tsx', 'FinancialStatements.tsx'],
      budget: ['BudgetWrapper.tsx', 'BudgetContext.tsx', 'BudgetVoiceEditor.tsx'],
      
      // Placeholder
      materialiConsumabili: ['Nessuno (placeholder)']
    };
    
    return usageMap[key] || ['🆕 Nuova sezione - utilizzo da definire'];
  };

  // Filtra i dati in base alla ricerca
  const matchesSearch = (key: string, value: any): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const keyMatches = key.toLowerCase().includes(searchLower);
    const valueString = JSON.stringify(value).toLowerCase();
    const valueMatches = valueString.includes(searchLower);
    
    return keyMatches || valueMatches;
  };

  // Conta elementi in un oggetto/array
  const countItems = (value: any): number => {
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length;
    return 0;
  };

  // Esporta database
  const exportDatabase = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Aggiungi nuova sezione
  const addNewSection = () => {
    if (!newSectionName.trim()) {
      alert('Inserisci un nome per la nuova sezione');
      return;
    }

    if (data[newSectionName]) {
      alert(`La sezione "${newSectionName}" esiste già!`);
      return;
    }

    try {
      const parsedValue = JSON.parse(newSectionValue);
      const newData = {
        ...data,
        [newSectionName]: parsedValue
      };
      
      setData(newData);
      setShowAddDialog(false);
      setNewSectionName('');
      setNewSectionValue('{}');
      
      alert(`✅ Sezione "${newSectionName}" aggiunta con successo!\n\n⚠️ Ricorda: questa modifica è temporanea. Per renderla permanente, esporta il database e sostituisci il file.`);
      
      if (onDataUpdate) {
        onDataUpdate('root.' + newSectionName, parsedValue);
      }
    } catch (error) {
      alert('Errore nel parsing del JSON: ' + error);
    }
  };

  // Renderizza un singolo nodo
  const renderNode = (key: string, value: any, path: string, level: number = 0): React.ReactNode => {
    const fullPath = `${path}.${key}`;
    const isExpanded = expandedPaths.has(fullPath);
    const isEditing = editingPath === fullPath;
    const valueType = getValueType(value);
    const isExpandable = valueType === 'object' || valueType === 'array';
    const itemCount = countItems(value);
    
    // Filtra per ricerca - APPLICA A TUTTI I LIVELLI (anche level 0)
    if (!matchesSearch(key, value)) {
      return null;
    }

    return (
      <div key={fullPath} className="mb-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 ${
            level === 0 ? 'bg-blue-50 border-l-4 border-blue-500 font-semibold' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {isExpandable && (
            <button
              onClick={() => toggleExpand(fullPath)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!isExpandable && <div className="w-6" />}

          {/* Key name */}
          <span className="font-mono text-sm font-medium text-gray-700">
            {key}
          </span>

          {/* Type badge */}
          <Badge variant="outline" className="text-xs">
            {valueType}
          </Badge>

          {/* Item count for objects/arrays */}
          {isExpandable && (
            <Badge variant="secondary" className="text-xs">
              {itemCount} {valueType === 'array' ? 'items' : 'keys'}
            </Badge>
          )}

          {/* Value preview for primitives */}
          {!isExpandable && !isEditing && (
            <span className="text-sm text-gray-600 truncate max-w-md">
              {String(value)}
            </span>
          )}

          {/* Usage info per sezioni di primo livello */}
          {level === 0 && showMetadata && (
            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs text-gray-500">
                📍 Usato in: {getUsageInfo(key).join(', ')}
              </div>
            </div>
          )}

          {/* Edit button */}
          {!isEditing && level > 0 && (
            <button
              onClick={() => startEdit(fullPath, value)}
              className="ml-auto p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Modifica valore"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Save/Cancel buttons during editing */}
          {isEditing && (
            <div className="ml-auto flex gap-1">
              <button
                onClick={saveEdit}
                className="p-1 hover:bg-green-100 rounded text-green-600"
                title="Salva"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Annulla"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Edit input */}
        {isEditing && (
          <div className="ml-8 mt-2 mb-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-2 border rounded font-mono text-sm"
              rows={5}
            />
          </div>
        )}

        {/* Expanded children */}
        {isExpanded && isExpandable && (
          <div>
            {valueType === 'object' &&
              Object.keys(value).map(childKey =>
                renderNode(childKey, value[childKey], fullPath, level + 1)
              )}
            {valueType === 'array' &&
              value.map((item: any, index: number) =>
                renderNode(`[${index}]`, item, fullPath, level + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  // Espandi tutto
  const expandAll = () => {
    const allPaths = new Set<string>();
    
    const collectPaths = (obj: any, path: string) => {
      allPaths.add(path);
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          collectPaths(obj[key], `${path}.${key}`);
        });
      }
    };
    
    if (data) {
      collectPaths(data, 'root');
    }
    
    setExpandedPaths(allPaths);
  };

  // Reset stato espansione (collassa tutto e pulisce sessionStorage)
  const resetExpansionState = () => {
    sessionStorage.removeItem('dbInspector_expandedPaths');
    setExpandedPaths(new Set(['root']));
    console.log('🔄 Stato espansione resettato');
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Caricamento database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Database Inspector</h1>
        </div>
        <p className="text-blue-100">
          Visualizza, esplora e modifica tutti i dati centralizzati dell'applicazione (escluso Budget)
        </p>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca nel database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Messaggio di salvataggio */}
            {saveMessage && (
              <div className="mt-2 text-sm font-semibold text-green-600 animate-pulse">
                {saveMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDatabase}
              title="Ricarica database manualmente"
              className="bg-green-50 hover:bg-green-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "Disattiva auto-refresh (ogni 5s)" : "Attiva auto-refresh (ogni 5s)"}
              className={autoRefresh ? "bg-blue-100 border-blue-400" : ""}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              title="Espandi tutto"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Espandi
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetExpansionState}
              title="Collassa tutto e pulisce stato salvato"
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(!showMetadata)}
              title="Mostra/Nascondi metadata utilizzo"
            >
              {showMetadata ? (
                <><EyeOff className="w-4 h-4 mr-1" /> Nascondi Info</>
              ) : (
                <><Eye className="w-4 h-4 mr-1" /> Mostra Info</>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSystemSections(!showSystemSections)}
              title="Mostra/Nascondi sezioni di sistema (version, metadata, etc.)"
              className={showSystemSections ? "bg-gray-100" : ""}
            >
              {showSystemSections ? (
                <><Eye className="w-4 h-4 mr-1" /> Sezioni Sistema</>
              ) : (
                <><EyeOff className="w-4 h-4 mr-1" /> Sezioni Sistema</>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportDatabase}
              title="Esporta database"
            >
              <Download className="w-4 h-4 mr-1" />
              Esporta
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              title="Aggiungi nuova sezione al database"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuova Sezione
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>
              <strong>{Object.keys(data).length}</strong> sezioni principali
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>|</span>
            <span>Ultimo aggiornamento: {lastUpdate.toLocaleString('it-IT')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>|</span>
            <span>Versione: {data.version || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>|</span>
            <Badge className="bg-green-600 text-white">
              🔴 LIVE da API
            </Badge>
          </div>
          {autoRefresh && (
            <div className="flex items-center gap-2">
              <span>|</span>
              <Badge className="bg-blue-600 text-white animate-pulse">
                🔄 Auto-refresh attivo (5s)
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>|</span>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              📂 {expandedPaths.size - 1} nodi aperti
            </Badge>
          </div>
        </div>
        
        {/* Elenco sezioni caricate */}
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs font-semibold text-blue-800 mb-2">
            📂 Sezioni Caricate: <strong>{Object.keys(data).filter(key => showSystemSections || !systemSections.includes(key)).length}</strong> visualizzate
            {!showSystemSections && <span className="text-gray-600 ml-2">(+{systemSections.length} nascoste)</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(data).sort().filter(key => showSystemSections || !systemSections.includes(key)).map(key => (
              <Badge key={key} variant={key === 'budget' ? 'default' : 'secondary'} className="text-xs">
                {key}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-blue-700 mt-2">
            ⚡ Sezioni di sistema nascoste di default. Toggle "Sezioni Sistema" per visualizzarle.
          </div>
        </div>
      </Card>

      {/* Database tree */}
      <Card className="p-4">
        <div className="space-y-1">
          {Object.keys(data)
            .filter(key => showSystemSections || !systemSections.includes(key))
            .map(key => renderNode(key, data[key], 'root', 0))
          }
        </div>
      </Card>

      {/* Info stato espansione */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💾</div>
          <div>
            <h4 className="font-semibold text-purple-800 mb-1">Stato Espansione Memorizzato</h4>
            <p className="text-sm text-purple-700">
              I nodi che apri rimangono <strong>aperti durante tutta la sessione</strong>, anche quando cambi tab.
              Puoi navigare liberamente nell&apos;applicazione e tornare qui trovando tutto come lo avevi lasciato.
            </p>
            <p className="text-sm text-purple-700 mt-2">
              📂 <strong>{expandedPaths.size - 1}</strong> nodi attualmente aperti | 
              Click su <strong>&quot;Reset&quot;</strong> per chiudere tutto e pulire la memoria.
            </p>
          </div>
        </div>
      </Card>

      {/* Legend - Generata dinamicamente */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Descrizione Sezioni Database (Aggiornamento Automatico)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {Object.keys(data)
            .sort()
            .filter(key => showSystemSections || !systemSections.includes(key))
            .map(key => {
              const description = getDescription(key);
              const usageInfo = getUsageInfo(key);
              const isBudget = key === 'budget';
              return (
                <div 
                  key={key} 
                  className={`border-l-2 pl-3 ${isBudget ? 'border-green-500 bg-green-50' : 'border-blue-400'}`}
                >
                  <strong className={isBudget ? 'text-green-700' : 'text-blue-600'}>
                    {key}:{isBudget && ' 🆕'}
                  </strong>
                  <p className="text-gray-600 text-xs mt-1">{description}</p>
                  <p className="text-gray-500 text-xs mt-1 italic">Usato in: {usageInfo.join(', ')}</p>
                </div>
              );
            })
          }
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-xs text-yellow-800">
            💡 <strong>Nota:</strong> Questa legenda si aggiorna automaticamente quando aggiungi nuove sezioni al database.json
          </div>
        </div>
      </Card>

      {/* Info note - Modifiche permanenti */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Salvataggio Modifiche</h4>
            <p className="text-sm text-green-700">
              Le modifiche effettuate tramite l&apos;icona di modifica (✏️) vengono <strong>salvate permanentemente</strong> sul file <code>database.json</code>.
              Le modifiche sono immediate e persistono anche dopo il riavvio dell&apos;applicazione.
            </p>
            <p className="text-sm text-green-700 mt-2">
              <strong>⚠️ Attenzione:</strong> Le nuove sezioni create con &quot;Nuova Sezione&quot; sono temporanee. 
              Per renderle permanenti, usa il pulsante &quot;Esporta&quot; e sostituisci il file.
            </p>
          </div>
        </div>
      </Card>

      {/* Dialog Aggiungi Nuova Sezione */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Aggiungi Nuova Sezione al Database
              </h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Sezione <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="es: nuovaSezione"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa camelCase senza spazi (es: prezziRegionali, configurazioneProdotto)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valore JSON <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newSectionValue}
                  onChange={(e) => setNewSectionValue(e.target.value)}
                  className="w-full h-64 p-3 border rounded font-mono text-sm"
                  placeholder='{"esempio": "valore", "numero": 123}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci un oggetto JSON valido
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-sm text-blue-800">
                  <strong>💡 Esempi di sezioni:</strong>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
{`{
  "nome": "Sezione Esempio",
  "valori": [1, 2, 3],
  "configurazione": {
    "enabled": true,
    "parametro": "valore"
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Annulla
                </Button>
                <Button
                  variant="default"
                  onClick={addNewSection}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Aggiungi Sezione
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
