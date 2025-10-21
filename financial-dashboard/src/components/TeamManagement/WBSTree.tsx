'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Package,
  Info,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { WBSNode, PERTEstimate } from '@/types/team';

interface WBSTreeProps {
  wbsData?: WBSNode[];
}

export function WBSTree({ wbsData }: WBSTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1.0', '2.0', '3.0']));
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);

  // Sample WBS data per Eco 3D
  const defaultWBSData: WBSNode[] = [
    // 1.0 MVP Tecnico
    {
      wbs_id: '1.0',
      parent_id: null,
      nome: 'MVP Tecnico',
      deliverable: 'Prototipo funzionante End-to-End',
      criteri_accettazione: 'Demo clinica con medico su paziente simulato',
      stato: 'in-progress',
      progress: 60,
      dipendenze: [],
      notes: 'Fase critica per validazione tecnica'
    },
    {
      wbs_id: '1.1',
      parent_id: '1.0',
      nome: 'Prototipo HW V1',
      deliverable: 'Dispositivo hardware testabile',
      criteri_accettazione: 'Acquisizione immagini su phantom',
      stima_rom: {
        cost_min: 20000,
        cost_max: 30000,
        dur_min_w: 8,
        dur_max_w: 12,
        ipotesi: 'Team 2 FTE (1 lead, 1 tecnico), componenti disponibili',
        ultima_revisione: '2025-09-01'
      },
      stima_3punti: {
        O: 8,
        M: 10,
        P: 14,
        E: 10.3,
        sigma: 1.0
      },
      baseline_cost: 25000,
      baseline_durata: 70,
      stato: 'completed',
      progress: 100,
      dipendenze: [],
      start_date: '2025-06-01',
      end_date: '2025-08-15'
    },
    {
      wbs_id: '1.2',
      parent_id: '1.0',
      nome: 'Firmware V1',
      deliverable: 'Software embedded per controllo trasduttore',
      criteri_accettazione: 'Controllo scanning e acquisizione dati',
      stima_rom: {
        cost_min: 15000,
        cost_max: 25000,
        dur_min_w: 6,
        dur_max_w: 10,
        ipotesi: 'Team 1.5 FTE (1 embedded dev), test su HW V1',
        ultima_revisione: '2025-09-01'
      },
      stima_3punti: {
        O: 6,
        M: 8,
        P: 12,
        E: 8.3,
        sigma: 1.0
      },
      baseline_cost: 20000,
      baseline_durata: 56,
      stato: 'in-progress',
      progress: 75,
      dipendenze: ['1.1'],
      start_date: '2025-08-01'
    },
    {
      wbs_id: '1.3',
      parent_id: '1.0',
      nome: 'App SW V1 (Ricostruzione 3D base)',
      deliverable: 'MVP GUI + algoritmo ricostruzione 3D',
      criteri_accettazione: 'Demo stabile su dataset pilota',
      stima_rom: {
        cost_min: 60000,
        cost_max: 90000,
        dur_min_w: 10,
        dur_max_w: 16,
        ipotesi: 'Team 3 FTE (1 lead, 1 dev, 1 QA), scope limitato GUI+reco base',
        ultima_revisione: '2025-09-15'
      },
      stima_3punti: {
        O: 10,
        M: 12,
        P: 16,
        E: 12.3,
        sigma: 1.0
      },
      baseline_cost: 75000,
      baseline_durata: 84,
      stato: 'in-progress',
      progress: 45,
      dipendenze: ['1.2'],
      start_date: '2025-08-15'
    },
    // 2.0 Validazione
    {
      wbs_id: '2.0',
      parent_id: null,
      nome: 'Validazione',
      deliverable: 'Documentazione tecnica completa + test conformità',
      criteri_accettazione: 'Dossier approvato da PRRC, test EMC/sicurezza passati',
      stato: 'in-progress',
      progress: 30,
      dipendenze: ['1.0'],
      notes: 'Critical per certificazione MDR'
    },
    {
      wbs_id: '2.1',
      parent_id: '2.0',
      nome: 'Test di laboratorio (EMC, sicurezza elettrica)',
      deliverable: 'Report test IEC 60601-1, IEC 60601-1-2',
      criteri_accettazione: 'Test EMC e sicurezza passati con margine',
      stima_rom: {
        cost_min: 8000,
        cost_max: 12000,
        dur_min_w: 4,
        dur_max_w: 8,
        ipotesi: 'Lab esterno certificato, 2 iterazioni test',
        ultima_revisione: '2025-10-01'
      },
      baseline_cost: 10000,
      baseline_durata: 42,
      stato: 'planned',
      progress: 0,
      dipendenze: ['1.1'],
      start_date: '2025-11-01'
    },
    {
      wbs_id: '2.2',
      parent_id: '2.0',
      nome: 'Usabilità IEC 62366',
      deliverable: 'Usability engineering file completo',
      criteri_accettazione: 'Test moderato con ≥10 utenti rappresentativi, hazards mitigati',
      stima_rom: {
        cost_min: 15000,
        cost_max: 25000,
        dur_min_w: 8,
        dur_max_w: 12,
        ipotesi: 'Consulente usability + PRRC, recruitment pazienti',
        ultima_revisione: '2025-10-01'
      },
      baseline_cost: 20000,
      baseline_durata: 70,
      stato: 'in-progress',
      progress: 40,
      dipendenze: ['1.3'],
      start_date: '2025-10-01'
    },
    {
      wbs_id: '2.3',
      parent_id: '2.0',
      nome: 'Dossier tecnico preliminare',
      deliverable: 'Technical file MDR Annex II/III',
      criteri_accettazione: 'Dossier completo approvato da PRRC',
      stima_rom: {
        cost_min: 25000,
        cost_max: 40000,
        dur_min_w: 12,
        dur_max_w: 20,
        ipotesi: 'PRRC + consulente QA/RA, include RMF ISO 14971 e SW IEC 62304',
        ultima_revisione: '2025-10-01'
      },
      baseline_cost: 32000,
      baseline_durata: 112,
      stato: 'planned',
      progress: 20,
      dipendenze: ['2.1', '2.2'],
      start_date: '2025-11-15'
    },
    // 3.0 Clinica
    {
      wbs_id: '3.0',
      parent_id: null,
      nome: 'Clinica',
      deliverable: 'Studio pilota completato con dati real-world',
      criteri_accettazione: 'Dati clinici da ≥30 pazienti, report approvato da EC',
      stato: 'planned',
      progress: 10,
      dipendenze: ['2.0'],
      notes: 'Necessario per clinical evaluation report'
    },
    {
      wbs_id: '3.1',
      parent_id: '3.0',
      nome: 'Protocollo studio pilota + EC submission',
      deliverable: 'Protocollo approvato da Comitato Etico',
      criteri_accettazione: 'EC approval da Campus Bio-Medico',
      stima_rom: {
        cost_min: 5000,
        cost_max: 10000,
        dur_min_w: 8,
        dur_max_w: 16,
        ipotesi: 'PI + consulente stats, 1 submission + risposte EC',
        ultima_revisione: '2025-10-01'
      },
      baseline_cost: 7500,
      baseline_durata: 84,
      stato: 'in-progress',
      progress: 50,
      dipendenze: ['2.2'],
      start_date: '2025-10-01'
    },
    {
      wbs_id: '3.2',
      parent_id: '3.0',
      nome: 'Raccolta dati simulati e real-world limitati',
      deliverable: 'Dataset ≥30 pazienti con follow-up',
      criteri_accettazione: 'Dati completi, CRF validati, report preliminare',
      stima_rom: {
        cost_min: 20000,
        cost_max: 35000,
        dur_min_w: 16,
        dur_max_w: 24,
        ipotesi: 'CRO + 2 siti clinici, recruitment 2-3 pz/settimana',
        ultima_revisione: '2025-10-01'
      },
      baseline_cost: 27500,
      baseline_durata: 140,
      stato: 'planned',
      progress: 0,
      dipendenze: ['3.1'],
      start_date: '2026-01-15'
    }
  ];

  const wbs = wbsData || defaultWBSData;

  // Build tree structure
  const buildTree = (parentId: string | null = null): WBSNode[] => {
    return wbs.filter(node => node.parent_id === parentId);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusIcon = (stato: string) => {
    switch (stato) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (stato: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-blue-500',
      'blocked': 'bg-red-500',
      'delayed': 'bg-orange-500',
      'planned': 'bg-gray-400'
    };
    return (
      <Badge className={`${colors[stato] || 'bg-gray-400'} text-white text-xs`}>
        {stato}
      </Badge>
    );
  };

  const calculatePERT = (pert: PERTEstimate): { E: number; sigma: number } => {
    const E = (pert.O + 4 * pert.M + pert.P) / 6;
    const sigma = (pert.P - pert.O) / 6;
    return { E: Math.round(E * 10) / 10, sigma: Math.round(sigma * 10) / 10 };
  };

  const renderNode = (node: WBSNode, level: number = 0) => {
    const children = buildTree(node.wbs_id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.wbs_id);
    const isRoot = level === 0;

    return (
      <div key={node.wbs_id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedNode?.wbs_id === node.wbs_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.wbs_id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* WBS ID */}
          <Badge variant="outline" className={`text-xs font-mono ${isRoot ? 'bg-purple-100' : ''}`}>
            {node.wbs_id}
          </Badge>

          {/* Status Icon */}
          {getStatusIcon(node.stato)}

          {/* Name */}
          <span className={`flex-1 ${isRoot ? 'font-bold' : 'font-medium'}`}>
            {node.nome}
          </span>

          {/* Progress */}
          {node.progress !== undefined && (
            <div className="flex items-center gap-2 min-w-[100px]">
              <Progress value={node.progress} className="h-2 w-16" />
              <span className="text-xs text-gray-600">{node.progress}%</span>
            </div>
          )}

          {/* Status Badge */}
          {getStatusBadge(node.stato)}

          {/* Dependencies indicator */}
          {node.dipendenze.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  Deps: {node.dipendenze.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Dipendenze: {node.dipendenze.join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = buildTree(null);

  // Stats
  const stats = {
    total: wbs.length,
    completed: wbs.filter(n => n.stato === 'completed').length,
    inProgress: wbs.filter(n => n.stato === 'in-progress').length,
    planned: wbs.filter(n => n.stato === 'planned').length,
    blocked: wbs.filter(n => n.stato === 'blocked').length,
    totalCost: wbs.reduce((sum, n) => sum + (n.baseline_cost || 0), 0),
    avgProgress: Math.round(wbs.reduce((sum, n) => sum + (n.progress || 0), 0) / wbs.length)
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">WBS - Work Breakdown Structure</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Scomposizione gerarchica del progetto Eco 3D in work packages misurabili.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <strong>Deliverable:</strong> Output verificabile
                  </div>
                  <div>
                    <strong>ROM:</strong> Stima range ±25%
                  </div>
                  <div>
                    <strong>PERT:</strong> Stima 3-point (O/M/P)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Work Packages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In Corso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">€{(stats.totalCost / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Budget Baseline</p>
            </CardContent>
          </Card>
        </div>

        {/* Tree + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                WBS Tree - Eco 3D
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {rootNodes.map(node => renderNode(node))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Dettaglio WP
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">{selectedNode.wbs_id}</Badge>
                    <h3 className="font-bold">{selectedNode.nome}</h3>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Deliverable:</p>
                    <p className="text-sm">{selectedNode.deliverable}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Criteri Accettazione:</p>
                    <p className="text-sm text-gray-700">{selectedNode.criteri_accettazione}</p>
                  </div>

                  {selectedNode.stima_rom && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        ROM (Rough Order of Magnitude)
                      </p>
                      <div className="text-xs space-y-1">
                        <p><strong>Costo:</strong> €{selectedNode.stima_rom.cost_min/1000}K - €{selectedNode.stima_rom.cost_max/1000}K</p>
                        <p><strong>Durata:</strong> {selectedNode.stima_rom.dur_min_w}-{selectedNode.stima_rom.dur_max_w} settimane</p>
                        <p className="text-yellow-700 mt-2"><strong>Ipotesi:</strong> {selectedNode.stima_rom.ipotesi}</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.stima_3punti && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-xs font-semibold text-purple-900 mb-2">PERT (3-point)</p>
                      <div className="text-xs space-y-1">
                        <p><strong>Optimistic (O):</strong> {selectedNode.stima_3punti.O}w</p>
                        <p><strong>Most Likely (M):</strong> {selectedNode.stima_3punti.M}w</p>
                        <p><strong>Pessimistic (P):</strong> {selectedNode.stima_3punti.P}w</p>
                        {selectedNode.stima_3punti.E && (
                          <p className="text-purple-700 mt-2">
                            <strong>Expected (E):</strong> {selectedNode.stima_3punti.E}w ± {selectedNode.stima_3punti.sigma}w
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedNode.baseline_cost && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Baseline:</p>
                      <div className="text-sm">
                        <p>Costo: €{(selectedNode.baseline_cost / 1000).toFixed(1)}K</p>
                        <p>Durata: {selectedNode.baseline_durata} giorni</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.dipendenze.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Dipendenze:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.dipendenze.map(dep => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNode.start_date && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>
                        {new Date(selectedNode.start_date).toLocaleDateString('it-IT')}
                        {selectedNode.end_date && ` → ${new Date(selectedNode.end_date).toLocaleDateString('it-IT')}`}
                      </span>
                    </div>
                  )}

                  {selectedNode.notes && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <strong>Note:</strong> {selectedNode.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Seleziona un work package per vedere i dettagli</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>Delayed</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Blocked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
