'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator,
  Table, 
  BarChart3, 
  Settings,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BudgetProvider, useBudget } from '@/contexts/BudgetContext';
import { BudgetService } from '@/lib/budget-service';
import type { BudgetData } from '@/types/budget.types';
import OpexSummaryCard from './OpexSummaryCard';

/**
 * BUDGET WRAPPER
 * Container principale per gestione budget aziendale
 */

// ⚙️ CONFIGURAZIONE ALTEZZA TABELLA
// Modifica questo valore per aumentare/diminuire l'altezza massima della tabella Budget
const TABLE_MAX_HEIGHT = 800; // In pixels (es: 600, 800, 1000, 1200)

export function BudgetWrapper() {
  return (
    <BudgetProvider>
      <BudgetWrapperContent />
    </BudgetProvider>
  );
}

function BudgetWrapperContent() {
  const { budgetData, budgetService, loading, updateBudgetData } = useBudget();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'charts' | 'settings'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Calculator },
    { id: 'table', label: 'Tabella Budget', icon: Table },
    { id: 'charts', label: 'Grafici', icon: BarChart3 },
    { id: 'settings', label: 'Impostazioni', icon: Settings }
  ] as const;

  return (
    <div className="w-full">
      
      {/* Header */}
      <div className="container mx-auto px-6 pt-6">
        <div className="flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            💰 Budget Aziendale
            <Badge variant="outline" className="text-sm bg-purple-50">
              2025-2028
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">
            Gestione completa costi di sviluppo Eco 3D
          </p>
          </div>
        
          <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importa
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6">
        <Card className="p-1 bg-gray-100">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'table' | 'charts' | 'settings')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md
                    font-medium transition-all
                    ${isActive 
                      ? 'bg-white text-purple-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6">
        <div className="min-h-[600px] w-full">
          {activeTab === 'dashboard' && <BudgetDashboard budgetService={budgetService} loading={loading} />}
          {activeTab === 'table' && <BudgetTableView budgetData={budgetData} budgetService={budgetService} loading={loading} updateBudgetData={updateBudgetData} />}
          {activeTab === 'charts' && <BudgetChartsView budgetData={budgetData} budgetService={budgetService} />}
          {activeTab === 'settings' && <BudgetSettings />}
        </div>
      </div>
      
    </div>
  );
}

/**
 * Dashboard Tab - KPI e overview
 */
function BudgetDashboard({ budgetService, loading }: { budgetService: BudgetService | null; loading: boolean }) {
  if (loading) return <div className="text-center py-12">Caricamento...</div>;
  if (!budgetService) return <div className="text-center py-12">Nessun dato disponibile</div>;

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-800">Budget Totale</h3>
            <Calculator className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {budgetService ? budgetService.formatCurrency(budgetService.calculateGrandTotal()) : '€0K'}
          </p>
          <p className="text-xs text-blue-600 mt-1">2025-2028 • Valori in migliaia €</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-800">Budget 2026</h3>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">€450K</p>
          <p className="text-xs text-green-600 mt-1">+15% vs 2025</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-800">Media Mensile</h3>
            <Calculator className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">€33K</p>
          <p className="text-xs text-purple-600 mt-1">Burn rate medio (K€)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-800">Categorie</h3>
            <Table className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">7</p>
          <p className="text-xs text-amber-600 mt-1">69 voci totali</p>
        </Card>
        
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">
          📊 Panoramica Budget
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-indigo-700 font-semibold mb-1">Copertura Temporale</p>
            <p className="text-gray-700">YTD 2025 → Q4 2028 (18 periodi)</p>
          </div>
          <div>
            <p className="text-indigo-700 font-semibold mb-1">Categorie Principali</p>
            <p className="text-gray-700">Prototipo, Regolatorio, Clinici, Team</p>
          </div>
          <div>
            <p className="text-indigo-700 font-semibold mb-1">Ultimo Aggiornamento</p>
            <p className="text-gray-700">6 Ottobre 2025, 22:50</p>
          </div>
        </div>
      </Card>

      {/* ========================================
          NUOVO: OPEX SUMMARY & BENCHMARKS
          ======================================== */}
      <OpexSummaryCard
        data={[
          {
            year: 2025,
            opex: {
              staff: 220000,
              rd: 136000,
              salesMarketing: 44000,
              ga: 49000,
              total: 449000
            },
            revenue: 360000
          },
          {
            year: 2026,
            opex: {
              staff: 365000,
              rd: 84000,
              salesMarketing: 80000,
              ga: 54000,
              total: 583000
            },
            revenue: 800000
          },
          {
            year: 2027,
            opex: {
              staff: 420000,
              rd: 90000,
              salesMarketing: 100000,
              ga: 60000,
              total: 670000
            },
            revenue: 1500000
          }
        ]}
        stage="growth_stage"
        title="OPEX Analysis & Industry Benchmarks"
        className="w-full"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Table className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Modifica Budget</h4>
              <p className="text-sm text-gray-600">
                Accedi alla tabella completa per modificare le voci di costo
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Visualizza Grafici</h4>
              <p className="text-sm text-gray-600">
                Analizza l&apos;evoluzione dei costi con grafici interattivi
              </p>
            </div>
          </div>
        </Card>
      </div>
      
    </div>
  );
}

/**
 * Table Tab - Tabella budget editabile
 */
function BudgetTableView({ budgetData, budgetService, loading, updateBudgetData }: { 
  budgetData: BudgetData | null; 
  budgetService: BudgetService | null; 
  loading: boolean;
  updateBudgetData: (itemId: string, periodId: string, value: number) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{itemId: string; periodId: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [columnView, setColumnView] = useState<'all' | 'quarters' | 'totals'>('all');
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set(['2025', '2026', '2027', '2028']));

  if (loading) {
    return <div className="text-center py-12">Caricamento dati budget...</div>;
  }

  if (!budgetData || !budgetService) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Table className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun Dato Disponibile</h3>
          <p className="text-gray-500">Impossibile caricare i dati budget</p>
        </div>
      </Card>
    );
  }

  const toggleCategory = (catId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  const startEditing = (itemId: string, periodId: string, currentValue: number | null) => {
    setEditingCell({ itemId, periodId });
    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : '0');
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveValue = async (itemId: string, periodId: string) => {
    if (!budgetService || !budgetData) return;
    
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      alert('Valore non valido');
      return;
    }

    try {
      // Reset editing state subito per feedback immediato
      setEditingCell(null);
      setEditValue('');
      
      // Salva sul server (updateItemValue salva anche localmente)
      const success = await budgetService.updateItemValue(itemId, periodId, numValue);
      
      if (success) {
        console.log(`✅ Valore salvato sul server: ${itemId} - ${periodId} = ${numValue}`);
        
        // Aggiorna budgetData nel context (usa callback per stato sempre aggiornato)
        updateBudgetData(itemId, periodId, numValue);
        console.log('🔄 UI aggiornata con nuovo valore');
      } else {
        alert('Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, periodId: string) => {
    if (e.key === 'Enter') {
      saveValue(itemId, periodId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Periodi da mostrare - filtrati per anni selezionati
  let periodsToShow = budgetData.periods.filter(p => {
    const relevantTypes = ['ytd', 'quarter', 'year_total'];
    if (!relevantTypes.includes(p.type)) return false;
    
    // Estrai anno dal period id (es. "q1_25" -> "2025")
    const yearMatch = p.id.match(/_(\d{2})$/);
    if (!yearMatch) return false;
    const year = '20' + yearMatch[1]; // "25" -> "2025"
    
    // Mostra solo gli anni selezionati
    return selectedYears.has(year);
  });
  
  // Applica filtro per tipo di colonne
  if (columnView === 'quarters') {
    // Solo trimestri (Q1, Q2, Q3, Q4)
    periodsToShow = periodsToShow.filter(p => !p.id.startsWith('tot_'));
  } else if (columnView === 'totals') {
    // Solo totali annuali (tot_25, tot_26, etc.)
    periodsToShow = periodsToShow.filter(p => p.id.startsWith('tot_'));
  }
  // 'all' = mostra tutto (default)

  const toggleYear = (year: string) => {
    const newYears = new Set(selectedYears);
    if (newYears.has(year)) {
      // Non permettere di deselezionare tutti gli anni
      if (newYears.size > 1) {
        newYears.delete(year);
      }
    } else {
      newYears.add(year);
    }
    setSelectedYears(newYears);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Pannello Controlli Unificato */}
      <Card className="mx-6">
        <div className="p-4 space-y-4">
          {/* Titolo */}
          <h2 className="text-xl font-bold">Tabella Budget Dettagliata</h2>
          
          {/* Sezione Controlli - 3 colonne */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Controlli Colonne */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Visualizzazione Colonne:</label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={columnView === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColumnView('all')}
                >
                  📊 Tutto
                </Button>
                <Button 
                  variant={columnView === 'quarters' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColumnView('quarters')}
                >
                  📅 Trimestri
                </Button>
                <Button 
                  variant={columnView === 'totals' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColumnView('totals')}
                >
                  📈 Totali
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {columnView === 'all' && 'Trimestri e totali'}
                {columnView === 'quarters' && 'Solo Q1-Q4'}
                {columnView === 'totals' && 'Solo totali annuali'}
              </p>
            </div>
            
            {/* Controlli Righe */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Visualizzazione Righe:</label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedCategories(new Set(budgetData.categories.map(c => c.id)))}
                >
                  ⬇️ Espandi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedCategories(new Set())}
                >
                  ⬆️ Comprimi
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Espandi o comprimi categorie
              </p>
            </div>
            
            {/* Selezione Anni - Allineato a destra */}
            <div className="space-y-2 md:text-right">
              <label className="text-sm font-semibold text-gray-700">Anni da Visualizzare:</label>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {['2025', '2026', '2027', '2028'].map(year => (
                  <Button
                    key={year}
                    variant={selectedYears.has(year) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleYear(year)}
                    disabled={selectedYears.has(year) && selectedYears.size === 1}
                  >
                    {year}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Seleziona almeno 1 anno
              </p>
            </div>
            
          </div>
        </div>
      </Card>

      {/* Tabella */}
      <Card>
        <div className="overflow-auto" style={{ maxHeight: `${TABLE_MAX_HEIGHT}px` }}>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gradient-to-r from-purple-100 to-blue-100 sticky top-0 z-20">
              <tr>
                <th className="p-3 text-left border-r-2 border-white sticky left-0 bg-purple-100 min-w-[300px] z-30">
                  Voce di Costo <span className="text-xs text-gray-500">(valori in K€)</span>
                </th>
                {periodsToShow.map((period, idx) => {
                  const isYearTotal = period.id.startsWith('tot_');
                  return (
                    <th 
                      key={period.id} 
                      className={`p-3 text-right border-r border-white min-w-[120px] sticky top-0 ${
                        isYearTotal 
                          ? 'bg-amber-200 font-bold text-amber-900' 
                          : idx % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'
                      }`}
                    >
                      {period.name}
                    </th>
                  );
                })}
                {/* COLONNA TOTALE GENERALE */}
                <th className="p-3 text-right border-l-2 border-white min-w-[140px] bg-gradient-to-r from-green-200 to-emerald-200 font-black text-green-900 sticky top-0">
                  💰 TOTALE<br/>GENERALE
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Ordina categorie per campo order prima di mappare */}
              {[...budgetData.categories].sort((a, b) => a.order - b.order).map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <React.Fragment key={category.id}>
                    {/* Categoria Header */}
                    <tr 
                      className="bg-gradient-to-r from-indigo-100 to-indigo-50 hover:from-indigo-200 hover:to-indigo-100 cursor-pointer border-t-2 border-indigo-300"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <td className="p-3 font-bold sticky left-0 bg-indigo-100 flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span>{category.icon} {category.code}. {category.name}</span>
                      </td>
                      {periodsToShow.map((period) => {
                        const total = budgetService.calculateCategoryTotal(category.id, period.id);
                        return (
                          <td key={period.id} className="p-3 text-right font-semibold bg-indigo-50">
                            {budgetService.formatCurrency(total)}
                          </td>
                        );
                      })}
                      {/* TOTALE GENERALE CATEGORIA (somma tutti i totali annuali) */}
                      <td className="p-3 text-right font-black bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-l-2 border-green-300">
                        {budgetService.formatCurrency(
                          periodsToShow
                            .filter(p => p.id.startsWith('tot_'))
                            .reduce((sum, p) => sum + budgetService.calculateCategoryTotal(category.id, p.id), 0)
                        )}
                      </td>
                    </tr>

                    {/* Items della categoria (se espanso) */}
                    {isExpanded && category.subcategories.map((subcat) => (
                      <React.Fragment key={subcat.id}>
                        <tr className="bg-blue-50">
                          <td className="p-2 pl-8 font-semibold text-sm sticky left-0 bg-blue-50">
                            {subcat.code} {subcat.name}
                          </td>
                          {periodsToShow.map(() => (
                            <td key={subcat.id} className="p-2"></td>
                          ))}
                          {/* Cella vuota per colonna TOTALE GENERALE */}
                          <td className="p-2 bg-green-50"></td>
                        </tr>
                        {subcat.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 border-b">
                            <td className="p-2 pl-12 text-sm sticky left-0 bg-white">
                              {item.code && <span className="text-gray-500 mr-2">{item.code}</span>}
                              {item.description}
                            </td>
                            {periodsToShow.map((period) => {
                              // Verifica se è una colonna totale annuale
                              const isYearTotal = period.id.startsWith('tot_');
                              
                              // Se è un totale, calcola la somma dei trimestri
                              let displayValue = item.values[period.id];
                              if (isYearTotal) {
                                const year = period.id.split('_')[1]; // es. "tot_25" -> "25"
                                const quarterIds = [`q1_${year}`, `q2_${year}`, `q3_${year}`, `q4_${year}`];
                                displayValue = quarterIds.reduce((sum, qId) => {
                                  const qValue = item.values[qId];
                                  return sum + (typeof qValue === 'number' ? qValue : 0);
                                }, 0);
                              }
                              
                              const isEditing = editingCell?.itemId === item.id && editingCell?.periodId === period.id;
                              const canEdit = !isYearTotal; // I totali NON sono editabili
                              
                              return (
                                <td 
                                  key={period.id} 
                                  className={`p-1 text-right ${isYearTotal ? 'bg-amber-50' : 'group'}`}
                                  onClick={() => !isEditing && canEdit && startEditing(item.id, period.id, displayValue)}
                                >
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={() => saveValue(item.id, period.id)}
                                      onKeyDown={(e) => handleKeyDown(e, item.id, period.id)}
                                      className="w-full px-2 py-1 text-right border-2 border-blue-400 rounded focus:outline-none focus:border-blue-600"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className={`px-2 py-1 rounded transition-colors ${
                                      isYearTotal 
                                        ? 'font-bold text-amber-900 bg-amber-100' 
                                        : 'cursor-pointer hover:bg-blue-50'
                                    }`}>
                                      {displayValue !== null && displayValue !== undefined && displayValue !== 0 ? (
                                        <span className="font-medium">{displayValue.toLocaleString()}</span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            {/* TOTALE GENERALE ITEM (somma tutti i valori di tutti i trimestri) */}
                            <td className="p-1 text-right bg-gradient-to-r from-green-50 to-emerald-50 border-l-2 border-green-200">
                              <div className="px-2 py-1 rounded font-bold text-green-900">
                                {(() => {
                                  // Somma tutti i valori dell'item (tutti i periodi visibili)
                                  const itemGrandTotal = periodsToShow
                                    .filter(p => !p.id.startsWith('tot_')) // Solo trimestri, non totali
                                    .reduce((sum, period) => {
                                      const val = item.values[period.id];
                                      return sum + (typeof val === 'number' ? val : 0);
                                    }, 0);
                                  
                                  return itemGrandTotal > 0 ? (
                                    <span>{itemGrandTotal.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                );
              })}
              
              {/* RIGA TOTALE GENERALE - SEMPRE VISIBILE */}
              <tr className="bg-gradient-to-r from-yellow-100 to-amber-100 border-t-4 border-amber-400 font-bold sticky bottom-0">
                <td className="p-4 text-lg sticky left-0 bg-gradient-to-r from-yellow-100 to-amber-100">
                  💰 TOTALE GENERALE
                </td>
                {periodsToShow.map((period) => {
                  // Calcola somma di tutte le categorie per questo periodo
                  const grandTotal = budgetData.categories.reduce((sum, cat) => {
                    return sum + budgetService.calculateCategoryTotal(cat.id, period.id);
                  }, 0);
                  
                  const isYearTotal = period.id.startsWith('tot_');
                  
                  return (
                    <td 
                      key={period.id} 
                      className={`p-4 text-right text-lg ${
                        isYearTotal ? 'bg-amber-200 font-black text-amber-900' : 'bg-yellow-50'
                      }`}
                    >
                      {budgetService.formatCurrency(grandTotal)}
                    </td>
                  );
                })}
                {/* TOTALE GENERALE ASSOLUTO (somma di tutti i totali annuali) */}
                <td className="p-4 text-right text-xl font-black bg-gradient-to-r from-green-200 to-emerald-300 text-green-900 border-l-4 border-green-500">
                  {budgetService.formatCurrency(
                    periodsToShow
                      .filter(p => p.id.startsWith('tot_'))
                      .reduce((sum, period) => {
                        const total = budgetData.categories.reduce((catSum, cat) => {
                          return catSum + budgetService.calculateCategoryTotal(cat.id, period.id);
                        }, 0);
                        return sum + total;
                      }, 0)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Footer */}
      <div className="text-sm text-gray-600 px-6 pb-6">
        <p>
          <strong>Totale Budget:</strong> {budgetService.formatCurrency(budgetService.calculateGrandTotal())} • 
          <strong className="ml-2">Categorie:</strong> {budgetData.categories.length} • 
          <strong className="ml-2">Voci:</strong> {budgetData.allItems.length} • 
          <span className="ml-2 text-blue-600 font-semibold">💡 Tutti i valori sono in migliaia di euro (K€)</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Charts Tab - Visualizzazioni grafiche
 */
function BudgetChartsView({ budgetData, budgetService }: {
  budgetData: BudgetData | null;
  budgetService: BudgetService | null;
}) {
  if (!budgetData || !budgetService) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Caricamento dati...</p>
        </div>
      </Card>
    );
  }

  // Prepara dati per grafico categorie per anno
  const categoryData = budgetData.categories.map(cat => {
    const data: any = { name: cat.name };
    ['2025', '2026', '2027', '2028'].forEach(year => {
      const total = budgetService.calculateCategoryTotal(cat.id, `tot_${year.slice(-2)}`);
      data[year] = total;
    });
    return data;
  });

  // Prepara dati per andamento trimestrale 2025-2026
  const quarterlyData: any[] = [];
  ['2025', '2026'].forEach(year => {
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q, idx) => {
      const periodId = `q${idx + 1}_${year.slice(-2)}`;
      const total = budgetData.categories.reduce((sum, cat) => {
        return sum + budgetService.calculateCategoryTotal(cat.id, periodId);
      }, 0);
      quarterlyData.push({
        period: `${q} ${year}`,
        valore: total
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Grafico Budget per Categoria */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Budget per Categoria (2025-2028)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: number) => budgetService.formatCurrency(value)} />
              <Legend />
              <Bar dataKey="2025" fill="#8b5cf6" name="2025" />
              <Bar dataKey="2026" fill="#3b82f6" name="2026" />
              <Bar dataKey="2027" fill="#10b981" name="2027" />
              <Bar dataKey="2028" fill="#f59e0b" name="2028" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grafico Andamento Trimestrale */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Andamento Trimestrale Budget (2025-2026)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => budgetService.formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="valore" stroke="#8b5cf6" strokeWidth={3} name="Budget Totale" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/**
 * Settings Tab - Configurazione
 */
function BudgetSettings() {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Impostazioni
        </h3>
        <p className="text-gray-500">
          In fase di implementazione...
        </p>
      </div>
    </Card>
  );
}
