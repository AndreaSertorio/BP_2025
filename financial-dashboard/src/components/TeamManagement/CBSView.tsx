'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Info, Briefcase, Package, Wrench, BarChart3 } from 'lucide-react';
import { cbsSampleData } from '@/data/cbs-sample-data';

export function CBSView() {
  const [selectedWBS, setSelectedWBS] = useState<string>('1.1');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
  };

  const getCategoryIcon = (categoria: string) => {
    const icons = { labor: Briefcase, materials: Package, equipment: Wrench, overhead: BarChart3, external: DollarSign };
    const Icon = icons[categoria as keyof typeof icons] || DollarSign;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      labor: 'bg-blue-100 text-blue-700',
      materials: 'bg-green-100 text-green-700',
      equipment: 'bg-purple-100 text-purple-700',
      overhead: 'bg-gray-100 text-gray-700',
      external: 'bg-orange-100 text-orange-700'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatoColor = (stato: string) => {
    const colors = { planned: 'bg-gray-500', committed: 'bg-blue-500', spent: 'bg-green-500' };
    return colors[stato as keyof typeof colors] || 'bg-gray-500';
  };

  const getVarianceColor = (variance_percent?: number) => {
    if (!variance_percent) return 'text-gray-500';
    if (Math.abs(variance_percent) < 5) return 'text-green-600';
    if (Math.abs(variance_percent) < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Group CBS by WBS
  const wbsPackages = Array.from(new Set(cbsSampleData.map(c => c.wbs_id))).sort();
  const cbsForWBS = cbsSampleData.filter(c => c.wbs_id === selectedWBS);

  // Calculate stats per WBS
  const wbsStats = wbsPackages.map(wbs_id => {
    const items = cbsSampleData.filter(c => c.wbs_id === wbs_id);
    const pianificato = items.reduce((sum, i) => sum + i.costo_pianificato, 0);
    const effettivo = items.reduce((sum, i) => sum + (i.costo_effettivo || 0), 0);
    const variance = effettivo - pianificato;
    const variance_percent = pianificato > 0 ? (variance / pianificato) * 100 : 0;
    return { wbs_id, pianificato, effettivo, variance, variance_percent };
  });

  // Global stats
  const globalStats = {
    totalPianificato: cbsSampleData.reduce((sum, c) => sum + c.costo_pianificato, 0),
    totalEffettivo: cbsSampleData.reduce((sum, c) => sum + (c.costo_effettivo || 0), 0),
    totalVariance: 0,
    byCategoria: {
      labor: cbsSampleData.filter(c => c.categoria === 'labor').reduce((sum, c) => sum + c.costo_pianificato, 0),
      materials: cbsSampleData.filter(c => c.categoria === 'materials').reduce((sum, c) => sum + c.costo_pianificato, 0),
      equipment: cbsSampleData.filter(c => c.categoria === 'equipment').reduce((sum, c) => sum + c.costo_pianificato, 0),
      overhead: cbsSampleData.filter(c => c.categoria === 'overhead').reduce((sum, c) => sum + c.costo_pianificato, 0),
      external: cbsSampleData.filter(c => c.categoria === 'external').reduce((sum, c) => sum + c.costo_pianificato, 0)
    }
  };
  globalStats.totalVariance = globalStats.totalEffettivo - globalStats.totalPianificato;

  const selectedWBSData = wbsStats.find(w => w.wbs_id === selectedWBS);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">CBS - Cost Breakdown Structure</h4>
              <p className="text-sm text-purple-700 mb-3">
                Mappa gerarchica costi per WBS package (labor, materials, equipment, overhead, external). 
                Track budget planned vs actual con variance analysis.
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-1"><Briefcase className="h-3 w-3" />Labor</div>
                <div className="flex items-center gap-1"><Package className="h-3 w-3" />Materials</div>
                <div className="flex items-center gap-1"><Wrench className="h-3 w-3" />Equipment</div>
                <div className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />Overhead</div>
                <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />External</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(globalStats.totalPianificato)}</div>
            <p className="text-xs text-muted-foreground">Budget Pianificato</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(globalStats.totalEffettivo)}</div>
            <p className="text-xs text-muted-foreground">Speso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${globalStats.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(globalStats.totalVariance))}
            </div>
            <p className="text-xs text-muted-foreground">Variance {globalStats.totalVariance >= 0 ? 'Over' : 'Under'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs space-y-1">
              <div className="flex justify-between"><span>Labor:</span><strong>{formatCurrency(globalStats.byCategoria.labor)}</strong></div>
              <div className="flex justify-between"><span>Materials:</span><strong>{formatCurrency(globalStats.byCategoria.materials)}</strong></div>
              <div className="flex justify-between"><span>External:</span><strong>{formatCurrency(globalStats.byCategoria.external)}</strong></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WBS Package Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seleziona WBS Package</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {wbsPackages.map(wbs => {
              const stats = wbsStats.find(w => w.wbs_id === wbs);
              return (
                <button
                  key={wbs}
                  onClick={() => setSelectedWBS(wbs)}
                  className={`p-3 rounded border-2 transition-all ${
                    selectedWBS === wbs ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-bold text-sm">{wbs}</div>
                  <div className="text-xs text-gray-600">{formatCurrency(stats?.pianificato || 0)}</div>
                  {stats && stats.variance !== 0 && (
                    <Badge className={`text-xs mt-1 ${stats.variance > 0 ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                      {stats.variance > 0 ? '+' : ''}{stats.variance_percent.toFixed(0)}%
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CBS Detail Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              CBS Items - WBS {selectedWBS}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cbsForWBS.map(item => (
                <div key={item.cbs_id} className="p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`p-1.5 rounded ${getCategoryColor(item.categoria)}`}>
                        {getCategoryIcon(item.categoria)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.descrizione}</p>
                        <p className="text-xs text-gray-500">{item.cbs_id}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatoColor(item.stato)} text-white text-xs`}>{item.stato}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div>
                      <p className="text-gray-500">Pianificato</p>
                      <p className="font-bold text-blue-600">{formatCurrency(item.costo_pianificato)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Effettivo</p>
                      <p className="font-bold text-green-600">{item.costo_effettivo ? formatCurrency(item.costo_effettivo) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Variance</p>
                      {item.variance !== undefined ? (
                        <div className="flex items-center gap-1">
                          {item.variance > 0 ? <TrendingUp className="h-3 w-3 text-red-600" /> : <TrendingDown className="h-3 w-3 text-green-600" />}
                          <p className={`font-bold ${getVarianceColor(item.variance_percent)}`}>
                            {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)} ({item.variance_percent?.toFixed(1)}%)
                          </p>
                        </div>
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                  </div>
                  
                  {item.fornitore && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Fornitore:</strong> {item.fornitore}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* WBS Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" />WBS {selectedWBS} Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWBSData ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Budget Pianificato</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedWBSData.pianificato)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Costo Effettivo</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedWBSData.effettivo)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variance</p>
                  <div className="flex items-center gap-2">
                    {selectedWBSData.variance > 0 ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className={`text-xl font-bold ${selectedWBSData.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedWBSData.variance > 0 ? '+' : ''}{formatCurrency(selectedWBSData.variance)}
                      </p>
                      <p className={`text-sm ${getVarianceColor(selectedWBSData.variance_percent)}`}>
                        ({selectedWBSData.variance_percent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Breakdown per Categoria:</p>
                  <div className="space-y-2">
                    {cbsForWBS.reduce((acc: {[key: string]: number}, item) => {
                      acc[item.categoria] = (acc[item.categoria] || 0) + item.costo_pianificato;
                      return acc;
                    }, {} as {[key: string]: number}) && 
                      Object.entries(cbsForWBS.reduce((acc: {[key: string]: number}, item) => {
                        acc[item.categoria] = (acc[item.categoria] || 0) + item.costo_pianificato;
                        return acc;
                      }, {})).map(([cat, val]) => (
                        <div key={cat} className="flex justify-between items-center text-sm">
                          <Badge className={getCategoryColor(cat)}>{cat}</Badge>
                          <span className="font-medium">{formatCurrency(val)}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nessun dato disponibile</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
