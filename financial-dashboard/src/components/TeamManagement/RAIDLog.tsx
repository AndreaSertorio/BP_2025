'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckSquare, 
  AlertCircle, 
  Link2, 
  Info,
  Filter,
  TrendingUp
} from 'lucide-react';
import type { RAIDItem, TeamMember } from '@/types/team';

interface RAIDLogProps {
  members: TeamMember[];
}

export function RAIDLog({ members }: RAIDLogProps) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Sample RAID items
  const [items] = useState<RAIDItem[]>([
    {
      id: 'RISK-001',
      tipo: 'risk',
      titolo: 'Ritardo certificazione MDR',
      descrizione: 'Possibile ritardo nella certificazione MDR Class IIa per complessità documentazione',
      probabilita: 3,
      impatto: 5,
      owner: 'member_001',
      mitigazione: 'Assumere consulente QA/RA esperto; buffer timeline +3 mesi',
      scadenza: '2026-03-31',
      stato: 'open',
      createdAt: '2025-01-15',
      updatedAt: '2025-10-15'
    },
    {
      id: 'RISK-002',
      tipo: 'risk',
      titolo: 'Key person risk - CTO',
      descrizione: 'Dipendenza critica da singola persona per sviluppo tecnico',
      probabilita: 2,
      impatto: 5,
      owner: 'member_001',
      mitigazione: 'Documentare conoscenza tecnica; assumere 2nd AI engineer; knowledge transfer',
      scadenza: '2025-12-31',
      stato: 'in-progress',
      createdAt: '2025-02-01',
      updatedAt: '2025-10-15'
    },
    {
      id: 'ASSUMPTION-001',
      tipo: 'assumption',
      titolo: 'Mercato pronto per AI in ecografia',
      descrizione: 'Assunzione: medici sono pronti ad adottare AI-powered ultrasound entro 2026',
      owner: 'member_001',
      stato: 'open',
      createdAt: '2025-01-10',
      updatedAt: '2025-10-15'
    },
    {
      id: 'ISSUE-001',
      tipo: 'issue',
      titolo: 'Budget prototipo superato',
      descrizione: 'Costi HW prototipo V1 superati del 30% (€30K vs €23K previsti)',
      impatto: 3,
      owner: 'member_001',
      mitigazione: 'Rivedere fornitori; negoziare batch discount; aggiornare forecast',
      stato: 'in-progress',
      createdAt: '2025-09-15',
      updatedAt: '2025-10-15'
    },
    {
      id: 'DEPENDENCY-001',
      tipo: 'dependency',
      titolo: 'Campus Bio-Medico per trial clinico',
      descrizione: 'Dipendenza da Campus Bio-Medico per trial clinico pilota e accesso pazienti',
      owner: 'member_001',
      stato: 'open',
      createdAt: '2025-03-01',
      updatedAt: '2025-10-15'
    }
  ]);

  const filteredItems = items.filter(item => {
    if (filterType && item.tipo !== filterType) return false;
    if (filterStatus && item.stato !== filterStatus) return false;
    return true;
  });

  const getRiskScore = (prob?: number, imp?: number): number => {
    if (!prob || !imp) return 0;
    return prob * imp;
  };

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 15) return { label: 'CRITICAL', color: 'bg-red-600' };
    if (score >= 10) return { label: 'HIGH', color: 'bg-orange-500' };
    if (score >= 5) return { label: 'MEDIUM', color: 'bg-yellow-500' };
    return { label: 'LOW', color: 'bg-green-500' };
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'assumption': return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case 'issue': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'dependency': return <Link2 className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (tipo: string): string => {
    switch (tipo) {
      case 'risk': return 'Risk';
      case 'assumption': return 'Assumption';
      case 'issue': return 'Issue';
      case 'dependency': return 'Dependency';
      default: return tipo;
    }
  };

  const renderItem = (item: RAIDItem) => {
    const owner = members.find(m => m.id === item.owner);
    const riskScore = getRiskScore(item.probabilita, item.impatto);
    const riskLevel = getRiskLevel(riskScore);

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">{getIcon(item.tipo)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {item.id}
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        item.stato === 'open' ? 'bg-blue-500' :
                        item.stato === 'in-progress' ? 'bg-yellow-500' :
                        item.stato === 'mitigated' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                    >
                      {item.stato}
                    </Badge>
                    {item.tipo === 'risk' && riskScore > 0 && (
                      <Badge className={`text-xs ${riskLevel.color} text-white`}>
                        {riskLevel.label} ({riskScore})
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{item.titolo}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.descrizione}
                  </p>
                </div>
              </div>

              {/* Risk Matrix */}
              {item.tipo === 'risk' && item.probabilita && item.impatto && (
                <div className="flex items-center gap-4 text-xs">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Probabilità:</span>
                        <Badge variant="outline">{item.probabilita}/5</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">1=Molto bassa, 5=Molto alta</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Impatto:</span>
                        <Badge variant="outline">{item.impatto}/5</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">1=Minimo, 5=Catastrofico</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Mitigation */}
              {item.mitigazione && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <p className="font-medium text-blue-900 mb-1">Mitigazione:</p>
                  <p className="text-blue-700">{item.mitigazione}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>Owner: <strong>{owner?.name || 'Unassigned'}</strong></span>
                {item.scadenza && (
                  <span>Scadenza: {new Date(item.scadenza).toLocaleDateString('it-IT')}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const stats = {
    risks: items.filter(i => i.tipo === 'risk'),
    highRisks: items.filter(i => i.tipo === 'risk' && getRiskScore(i.probabilita, i.impatto) >= 10),
    openIssues: items.filter(i => i.tipo === 'issue' && i.stato === 'open'),
    dependencies: items.filter(i => i.tipo === 'dependency')
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-2">RAID Log</h4>
                <p className="text-sm text-orange-700 mb-2">
                  Sistema di tracking per Risks, Assumptions, Issues e Dependencies del progetto.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span><strong>Risk:</strong> Evento futuro negativo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3 text-blue-500" />
                    <span><strong>Assumption:</strong> Ipotesi da validare</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    <span><strong>Issue:</strong> Problema attuale</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link2 className="h-3 w-3 text-purple-500" />
                    <span><strong>Dependency:</strong> Dipendenza esterna</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.risks.length}</div>
              <p className="text-xs text-muted-foreground">Risks Totali</p>
              <p className="text-xs text-red-500 mt-1">{stats.highRisks.length} High/Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.openIssues.length}</div>
              <p className="text-xs text-muted-foreground">Issues Aperti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(i => i.tipo === 'assumption').length}
              </div>
              <p className="text-xs text-muted-foreground">Assumptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.dependencies.length}</div>
              <p className="text-xs text-muted-foreground">Dependencies</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtri
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType(null);
                  setFilterStatus(null);
                }}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipo</p>
                <div className="flex gap-2">
                  {['risk', 'assumption', 'issue', 'dependency'].map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant={filterType === type ? 'default' : 'outline'}
                      onClick={() => setFilterType(filterType === type ? null : type)}
                      className="capitalize"
                    >
                      {getTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Stato</p>
                <div className="flex gap-2">
                  {['open', 'in-progress', 'mitigated', 'closed'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={filterStatus === status ? 'default' : 'outline'}
                      onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                      className="capitalize"
                    >
                      {status.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAID Items */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              Tutti ({filteredItems.length})
            </TabsTrigger>
            <TabsTrigger value="risk">
              Risks ({filteredItems.filter(i => i.tipo === 'risk').length})
            </TabsTrigger>
            <TabsTrigger value="assumption">
              Assumptions ({filteredItems.filter(i => i.tipo === 'assumption').length})
            </TabsTrigger>
            <TabsTrigger value="issue">
              Issues ({filteredItems.filter(i => i.tipo === 'issue').length})
            </TabsTrigger>
            <TabsTrigger value="dependency">
              Dependencies ({filteredItems.filter(i => i.tipo === 'dependency').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nessun elemento trovato</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map(renderItem)
            )}
          </TabsContent>

          {['risk', 'assumption', 'issue', 'dependency'].map(type => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              {filteredItems.filter(i => i.tipo === type).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {getIcon(type)}
                    <p className="mt-3">Nessun {getTypeLabel(type)} trovato</p>
                  </CardContent>
                </Card>
              ) : (
                filteredItems.filter(i => i.tipo === type).map(renderItem)
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Risk Heatmap Info */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              Risk Scoring Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <p><strong>Score = Probabilità × Impatto</strong></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">1-4</Badge>
                  <span>LOW - Monitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500">5-9</Badge>
                  <span>MEDIUM - Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">10-14</Badge>
                  <span>HIGH - Mitigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600">15-25</Badge>
                  <span>CRITICAL - Act now</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
