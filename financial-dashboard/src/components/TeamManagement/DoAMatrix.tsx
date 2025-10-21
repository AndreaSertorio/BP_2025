'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  FileCheck,
  Info
} from 'lucide-react';
import type { DelegationOfAuthority, TeamMember } from '@/types/team';

interface DoAMatrixProps {
  members: TeamMember[];
}

export function DoAMatrix({ }: DoAMatrixProps) {
  // Sample DoA data per Eco 3D
  const [doaItems] = useState<DelegationOfAuthority[]>([
    {
      id: 'DOA-001',
      voce: 'Contratti fornitori - Small',
      soglia_euro: 5000,
      puo_firmare: ['CTO', 'COO'],
      cofirma_richiesta: false,
      note: 'Acquisti materiali, componenti, servizi tecnici ordinari'
    },
    {
      id: 'DOA-002',
      voce: 'Contratti fornitori - Medium',
      soglia_euro: 25000,
      puo_firmare: ['CEO'],
      cofirma_richiesta: true,
      note: 'Richiesta cofirma CFO per approvazione budget'
    },
    {
      id: 'DOA-003',
      voce: 'Contratti fornitori - Large',
      soglia_euro: 999999,
      puo_firmare: ['CEO', 'Board'],
      cofirma_richiesta: true,
      note: 'Contratti >€25K richiedono approvazione Board'
    },
    {
      id: 'DOA-004',
      voce: 'Assunzioni FTE',
      soglia_euro: 0,
      puo_firmare: ['CEO'],
      cofirma_richiesta: true,
      note: 'Tutte le assunzioni richiedono cofirma CFO (budget)'
    },
    {
      id: 'DOA-005',
      voce: 'Spese R&D - Autonome',
      soglia_euro: 10000,
      puo_firmare: ['CTO'],
      cofirma_richiesta: false,
      note: 'Spese sviluppo, prototipazione, test entro budget approvato'
    },
    {
      id: 'DOA-006',
      voce: 'Spese R&D - Straordinarie',
      soglia_euro: 999999,
      puo_firmare: ['CTO', 'CEO'],
      cofirma_richiesta: true,
      note: 'Spese >€10K richiedono approvazione CEO + CFO'
    },
    {
      id: 'DOA-007',
      voce: 'Spese Marketing/Sales',
      soglia_euro: 5000,
      puo_firmare: ['CEO'],
      cofirma_richiesta: false,
      note: 'Campagne marketing, eventi, fiere'
    },
    {
      id: 'DOA-008',
      voce: 'Grant applications',
      soglia_euro: 0,
      puo_firmare: ['CFO'],
      cofirma_richiesta: true,
      note: 'Richieste grant Horizon, PNRR etc. - cofirma CEO'
    },
    {
      id: 'DOA-009',
      voce: 'Consulenze QA/RA',
      soglia_euro: 15000,
      puo_firmare: ['COO'],
      cofirma_richiesta: false,
      note: 'PRRC, consulenti regolatori, CRO'
    },
    {
      id: 'DOA-010',
      voce: 'Consulenze QA/RA - Maggiori',
      soglia_euro: 999999,
      puo_firmare: ['COO', 'CEO'],
      cofirma_richiesta: true,
      note: 'Consulenze >€15K richiedono CEO + CFO'
    },
    {
      id: 'DOA-011',
      voce: 'Contratti Clinici (CRO, siti)',
      soglia_euro: 20000,
      puo_firmare: ['COO'],
      cofirma_richiesta: true,
      note: 'Trial clinici, CRO - cofirma CEO'
    },
    {
      id: 'DOA-012',
      voce: 'Investimenti CapEx (equipment)',
      soglia_euro: 10000,
      puo_firmare: ['CTO'],
      cofirma_richiesta: true,
      note: 'Equipment lab, strumentazione - cofirma CFO'
    }
  ]);

  const formatCurrency = (value: number): string => {
    if (value >= 999999) return '>€25K';
    if (value >= 1000) return `<€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  const getSogliaColor = (soglia: number): string => {
    if (soglia >= 25000) return 'text-red-600 font-bold';
    if (soglia >= 10000) return 'text-orange-600 font-semibold';
    if (soglia >= 5000) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  const getCategoria = (voce: string): string => {
    if (voce.includes('Contratti fornitori')) return 'Procurement';
    if (voce.includes('Assunzioni')) return 'HR';
    if (voce.includes('R&D')) return 'R&D';
    if (voce.includes('Marketing')) return 'Commercial';
    if (voce.includes('Grant')) return 'Finance';
    if (voce.includes('QA/RA')) return 'Regulatory';
    if (voce.includes('Clinici')) return 'Clinical';
    if (voce.includes('CapEx')) return 'Finance';
    return 'Other';
  };

  const getCategoriaColor = (categoria: string): string => {
    const colors: Record<string, string> = {
      'Procurement': 'bg-blue-100 text-blue-800',
      'HR': 'bg-purple-100 text-purple-800',
      'R&D': 'bg-green-100 text-green-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Regulatory': 'bg-red-100 text-red-800',
      'Clinical': 'bg-pink-100 text-pink-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  // Group by category
  const byCategory = doaItems.reduce((acc, item) => {
    const cat = getCategoria(item.voce);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, DelegationOfAuthority[]>);

  // Stats
  const stats = {
    total: doaItems.length,
    cofirmaRequired: doaItems.filter(d => d.cofirma_richiesta).length,
    categories: Object.keys(byCategory).length,
    avgThreshold: Math.round(
      doaItems.filter(d => d.soglia_euro < 999999).reduce((sum, d) => sum + d.soglia_euro, 0) / 
      doaItems.filter(d => d.soglia_euro < 999999).length
    )
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">DoA - Delegation of Authority</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Matrice delle soglie di firma e approvazione per garantire governance e compliance.
                  Definisce chi può autorizzare spese/contratti e quando serve cofirma.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <strong>Soglia:</strong> Limite massimo autorizzabile
                  </div>
                  <div>
                    <strong>Può firmare:</strong> Ruoli autorizzati
                  </div>
                  <div>
                    <strong>Cofirma:</strong> Richiede secondo approvatore
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
              <p className="text-xs text-muted-foreground">Voci DoA</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.cofirmaRequired}</div>
              <p className="text-xs text-muted-foreground">Richiedono Cofirma</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Categorie</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">€{(stats.avgThreshold / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Soglia Media</p>
            </CardContent>
          </Card>
        </div>

        {/* DoA Table by Category */}
        {Object.entries(byCategory).map(([categoria, items]) => (
          <Card key={categoria}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                {categoria}
                <Badge className={getCategoriaColor(categoria)}>
                  {items.length} voci
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-xs font-semibold">ID</th>
                      <th className="text-left p-2 text-xs font-semibold">Voce</th>
                      <th className="text-center p-2 text-xs font-semibold">Soglia</th>
                      <th className="text-left p-2 text-xs font-semibold">Può Firmare</th>
                      <th className="text-center p-2 text-xs font-semibold">Cofirma</th>
                      <th className="text-left p-2 text-xs font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {item.id}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm font-medium">{item.voce}</td>
                        <td className={`p-2 text-center text-sm ${getSogliaColor(item.soglia_euro)}`}>
                          {formatCurrency(item.soglia_euro)}
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {item.puo_firmare.map(role => (
                              <Badge key={role} className="text-xs bg-blue-600">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {item.cofirma_richiesta ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Cofirma richiesta</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger>
                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Firma singola sufficiente</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                        <td className="p-2 text-xs text-gray-600">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Governance Best Practices */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-600" />
              Best Practices DoA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-3">
              <div>
                <p className="font-semibold text-purple-900 mb-1">📋 Quando usare DoA:</p>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                  <li>Prima di firmare contratti con fornitori</li>
                  <li>Prima di approvare spese fuori budget</li>
                  <li>Prima di assumere personale (FTE/consulenti)</li>
                  <li>Prima di sottomettere grant applications</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-1">⚠️ Regole chiave:</p>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                  <li>Cofirma: Richiesta per decisioni ad alto impatto finanziario</li>
                  <li>Audit trail: Tutte le approvazioni devono essere documentate</li>
                  <li>Escalation: Se soglia superata, passa a livello superiore</li>
                  <li>Board approval: Contratti &gt;€25K richiedono Board</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-1">✅ Output DoA:</p>
                <p className="text-purple-700">
                  Chiarezza su chi può decidere cosa + Velocità decisionale + Compliance + Investor confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Esempi Pratici Eco 3D</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-900 mb-1">✅ Scenario 1: Acquisto componenti PCB (€3K)</p>
                <p className="text-green-700">
                  → CTO può firmare autonomamente (soglia &lt;€5K, DoA-001)
                </p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <p className="font-semibold text-orange-900 mb-1">⚠️ Scenario 2: Contratto CRO trial clinico (€18K)</p>
                <p className="text-orange-700">
                  → COO firma + CEO cofirma (soglia &lt;€20K ma cofirma richiesta, DoA-011)
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="font-semibold text-red-900 mb-1">🚨 Scenario 3: Contratto sviluppo SW (€80K)</p>
                <p className="text-red-700">
                  → CEO firma + Board approval richiesta (soglia &gt;€25K, DoA-003)
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-semibold text-blue-900 mb-1">💼 Scenario 4: Assunzione AI Engineer (€60K/anno)</p>
                <p className="text-blue-700">
                  → CEO firma + CFO cofirma (tutte le assunzioni FTE, DoA-004)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
