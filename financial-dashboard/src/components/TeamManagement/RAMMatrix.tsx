'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  TrendingUp,
  Users
} from 'lucide-react';
import type { RACIAssignment, TeamMember, Department } from '@/types/team';

interface RAMMatrixProps {
  members: TeamMember[];
  departments: Department[];
}

export function RAMMatrix({ }: RAMMatrixProps) {
  // OBS Structure (organizational units)
  const obsUnits = [
    { obs_id: 'OBS-CEO', nome: 'CEO', color: 'bg-purple-100' },
    { obs_id: 'OBS-CTO', nome: 'CTO', color: 'bg-blue-100' },
    { obs_id: 'OBS-COO', nome: 'COO', color: 'bg-green-100' },
    { obs_id: 'OBS-QA', nome: 'QA/RA', color: 'bg-yellow-100' },
    { obs_id: 'OBS-CLINICAL', nome: 'Clinical', color: 'bg-pink-100' },
    { obs_id: 'OBS-CFO', nome: 'CFO', color: 'bg-orange-100' }
  ];

  // WBS work packages
  const wbsPackages = [
    { wbs_id: '1.1', nome: 'Prototipo HW V1', fase: '1.0 MVP Tecnico' },
    { wbs_id: '1.2', nome: 'Firmware V1', fase: '1.0 MVP Tecnico' },
    { wbs_id: '1.3', nome: 'App SW V1', fase: '1.0 MVP Tecnico' },
    { wbs_id: '2.1', nome: 'Test laboratorio', fase: '2.0 Validazione' },
    { wbs_id: '2.2', nome: 'Usabilità 62366', fase: '2.0 Validazione' },
    { wbs_id: '2.3', nome: 'Dossier tecnico', fase: '2.0 Validazione' },
    { wbs_id: '3.1', nome: 'EC Submission', fase: '3.0 Clinica' },
    { wbs_id: '3.2', nome: 'Raccolta dati', fase: '3.0 Clinica' }
  ];

  // Sample RAM assignments (da StrumentiPerTeam.md)
  const [assignments, setAssignments] = useState<RACIAssignment[]>([
    // 1.1 Prototipo HW V1
    { wbs_id: '1.1', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '1.1', obs_id: 'OBS-CTO', ruolo: 'A' },
    { wbs_id: '1.1', obs_id: 'OBS-COO', ruolo: 'C' },
    { wbs_id: '1.1', obs_id: 'OBS-QA', ruolo: 'C' },
    
    // 1.2 Firmware V1
    { wbs_id: '1.2', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '1.2', obs_id: 'OBS-CTO', ruolo: 'A' },
    { wbs_id: '1.2', obs_id: 'OBS-COO', ruolo: 'C' },
    
    // 1.3 App SW V1
    { wbs_id: '1.3', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '1.3', obs_id: 'OBS-CTO', ruolo: 'A' },
    { wbs_id: '1.3', obs_id: 'OBS-COO', ruolo: 'C' },
    { wbs_id: '1.3', obs_id: 'OBS-QA', ruolo: 'C' },
    { wbs_id: '1.3', obs_id: 'OBS-CLINICAL', ruolo: 'C' },
    
    // 2.1 Test laboratorio
    { wbs_id: '2.1', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '2.1', obs_id: 'OBS-CTO', ruolo: 'R' },
    { wbs_id: '2.1', obs_id: 'OBS-COO', ruolo: 'A' },
    { wbs_id: '2.1', obs_id: 'OBS-QA', ruolo: 'C' },
    
    // 2.2 Usabilità 62366
    { wbs_id: '2.2', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '2.2', obs_id: 'OBS-CTO', ruolo: 'C' },
    { wbs_id: '2.2', obs_id: 'OBS-COO', ruolo: 'A' },
    { wbs_id: '2.2', obs_id: 'OBS-QA', ruolo: 'C' },
    { wbs_id: '2.2', obs_id: 'OBS-CLINICAL', ruolo: 'C' },
    
    // 2.3 Dossier tecnico
    { wbs_id: '2.3', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '2.3', obs_id: 'OBS-COO', ruolo: 'A' },
    { wbs_id: '2.3', obs_id: 'OBS-QA', ruolo: 'R' },
    
    // 3.1 EC Submission
    { wbs_id: '3.1', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '3.1', obs_id: 'OBS-CTO', ruolo: 'C' },
    { wbs_id: '3.1', obs_id: 'OBS-COO', ruolo: 'A' },
    { wbs_id: '3.1', obs_id: 'OBS-QA', ruolo: 'R' },
    { wbs_id: '3.1', obs_id: 'OBS-CLINICAL', ruolo: 'C' },
    
    // 3.2 Raccolta dati
    { wbs_id: '3.2', obs_id: 'OBS-CEO', ruolo: 'I' },
    { wbs_id: '3.2', obs_id: 'OBS-COO', ruolo: 'A' },
    { wbs_id: '3.2', obs_id: 'OBS-CLINICAL', ruolo: 'R' }
  ]);

  const getAssignment = (wbs_id: string, obs_id: string): RACIAssignment | undefined => {
    return assignments.find(a => a.wbs_id === wbs_id && a.obs_id === obs_id);
  };

  const toggleAssignment = (wbs_id: string, obs_id: string, ruolo: 'R' | 'A' | 'C' | 'I') => {
    const existing = getAssignment(wbs_id, obs_id);
    
    if (existing) {
      if (existing.ruolo === ruolo) {
        // Remove assignment
        setAssignments(assignments.filter(a => !(a.wbs_id === wbs_id && a.obs_id === obs_id)));
      } else {
        // Update role
        setAssignments(assignments.map(a => 
          a.wbs_id === wbs_id && a.obs_id === obs_id 
            ? { ...a, ruolo } 
            : a
        ));
      }
    } else {
      // Add new assignment
      setAssignments([...assignments, { wbs_id, obs_id, ruolo }]);
    }
  };

  const validateRow = (wbs_id: string): { valid: boolean; errors: string[] } => {
    const rowAssignments = assignments.filter(a => a.wbs_id === wbs_id);
    const accountables = rowAssignments.filter(a => a.ruolo === 'A').length;
    const responsibles = rowAssignments.filter(a => a.ruolo === 'R').length;
    
    const errors: string[] = [];
    if (accountables === 0) errors.push('Manca Accountable (A)');
    if (accountables > 1) errors.push(`Troppi Accountable (${accountables}), deve essere 1 solo`);
    if (responsibles === 0 && accountables === 1) {
      // OK se A fa anche da R
      const hasAccountableOnly = rowAssignments.some(a => a.ruolo === 'A');
      if (hasAccountableOnly) {
        // Check if it's marked A/R (we allow this)
      } else {
        errors.push('Manca almeno 1 Responsible (R)');
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  const getRoleColor = (ruolo: string): string => {
    switch (ruolo) {
      case 'R': return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'A': return 'bg-red-600 text-white hover:bg-red-700';
      case 'C': return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'I': return 'bg-green-600 text-white hover:bg-green-700';
      default: return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  const getRoleDescription = (ruolo: string): string => {
    switch (ruolo) {
      case 'R': return 'Responsible - Esegue il lavoro';
      case 'A': return 'Accountable - Responsabile finale (1 solo!)';
      case 'C': return 'Consulted - Deve essere consultato';
      case 'I': return 'Informed - Deve essere informato';
      default: return '';
    }
  };

  // Resource loading per OBS
  const getResourceLoading = (obs_id: string) => {
    const obsAssignments = assignments.filter(a => a.obs_id === obs_id);
    return {
      total: obsAssignments.length,
      A: obsAssignments.filter(a => a.ruolo === 'A').length,
      R: obsAssignments.filter(a => a.ruolo === 'R').length,
      C: obsAssignments.filter(a => a.ruolo === 'C').length,
      I: obsAssignments.filter(a => a.ruolo === 'I').length
    };
  };

  // Validation stats
  const validationStats = {
    total: wbsPackages.length,
    valid: wbsPackages.filter(wp => validateRow(wp.wbs_id).valid).length,
    invalid: wbsPackages.filter(wp => !validateRow(wp.wbs_id).valid).length
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">RAM - Responsibility Assignment Matrix (WBS×OBS)</h4>
                <p className="text-sm text-green-700 mb-3">
                  Matrice che collega Work Packages (WBS) a Unità Organizzative (OBS) con ruoli RACI.
                  Chiarezza su chi può decidere cosa + Velocità decisionale + Compliance + Investor confidence
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Badge className="bg-blue-600 text-white">R</Badge>
                    <span>Responsible - Esegue (≥1)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-red-600 text-white">A</Badge>
                    <span>Accountable - Responsabile (1 solo!)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-yellow-500 text-white">C</Badge>
                    <span>Consulted - Consultato</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-green-600 text-white">I</Badge>
                    <span>Informed - Informato</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{validationStats.total}</div>
              <p className="text-xs text-muted-foreground">Work Packages Totali</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{validationStats.valid}</div>
              </div>
              <p className="text-xs text-muted-foreground">Validati (1A, ≥1R)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{validationStats.invalid}</div>
              </div>
              <p className="text-xs text-muted-foreground">Da Completare</p>
            </CardContent>
          </Card>
        </div>

        {/* Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              RAM Matrix - WBS × OBS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 text-xs font-semibold sticky left-0 z-10">
                      WBS / OBS
                    </th>
                    {obsUnits.map(obs => (
                      <th key={obs.obs_id} className={`border p-2 ${obs.color} text-xs font-semibold min-w-[80px]`}>
                        <Tooltip>
                          <TooltipTrigger>
                            {obs.nome}
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-semibold mb-1">{obs.nome} - Resource Loading:</p>
                              {(() => {
                                const loading = getResourceLoading(obs.obs_id);
                                return (
                                  <>
                                    <p>Accountable (A): {loading.A}</p>
                                    <p>Responsible (R): {loading.R}</p>
                                    <p>Consulted (C): {loading.C}</p>
                                    <p>Informed (I): {loading.I}</p>
                                    <p className="mt-1 font-semibold">Totale: {loading.total}</p>
                                  </>
                                );
                              })()}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                    <th className="border p-2 bg-gray-100 text-xs font-semibold">
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Validazione RACI</p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wbsPackages.map(wp => {
                    const validation = validateRow(wp.wbs_id);
                    return (
                      <tr key={wp.wbs_id} className={!validation.valid ? 'bg-red-50' : ''}>
                        <td className="border p-2 bg-gray-50 text-xs sticky left-0 z-10">
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">{wp.wbs_id}</Badge>
                            <div className="font-medium">{wp.nome}</div>
                            <div className="text-gray-500">{wp.fase}</div>
                          </div>
                        </td>
                        {obsUnits.map(obs => {
                          const assignment = getAssignment(wp.wbs_id, obs.obs_id);
                          return (
                            <td key={obs.obs_id} className="border p-1 text-center">
                              <div className="flex gap-1 justify-center">
                                {(['R', 'A', 'C', 'I'] as const).map(role => (
                                  <Tooltip key={role}>
                                    <TooltipTrigger>
                                      <Button
                                        size="sm"
                                        variant={assignment?.ruolo === role ? 'default' : 'outline'}
                                        className={`w-8 h-8 p-0 text-xs ${
                                          assignment?.ruolo === role ? getRoleColor(role) : ''
                                        }`}
                                        onClick={() => toggleAssignment(wp.wbs_id, obs.obs_id, role)}
                                      >
                                        {role}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{getRoleDescription(role)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                        <td className="border p-2 text-center">
                          {validation.valid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-5 w-5 text-red-600 mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  {validation.errors.map((err, idx) => (
                                    <p key={idx} className="text-red-600">{err}</p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer with resource loading */}
                <tfoot>
                  <tr>
                    <td className="border p-2 bg-gray-100 text-xs font-semibold sticky left-0 z-10">
                      Resource Loading
                    </td>
                    {obsUnits.map(obs => {
                      const loading = getResourceLoading(obs.obs_id);
                      return (
                        <td key={obs.obs_id} className={`border p-2 ${obs.color} text-center`}>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>A:</span><strong>{loading.A}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>R:</span><strong>{loading.R}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>C:</span><strong>{loading.C}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>I:</span><strong>{loading.I}</strong>
                            </div>
                            <div className="border-t pt-1 flex justify-between font-semibold">
                              <span>Tot:</span><span>{loading.total}</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border p-2 bg-gray-100"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Validation Rules */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Regole di Validazione RAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <p><strong>1. Esattamente 1 Accountable (A) per work package</strong></p>
              <p>→ L'Accountable è il responsabile finale che approva il deliverable</p>
              <p><strong>2. Almeno 1 Responsible (R) per work package</strong></p>
              <p>→ Il Responsible esegue materialmente il lavoro (può essere stesso di A)</p>
              <p><strong>3. Consulted (C) e Informed (I) sono opzionali</strong></p>
              <p>→ Usa C per chi deve dare input, I per chi deve sapere</p>
              <p className="text-blue-700 mt-3">
                <strong>Output RAM:</strong> Chiarezza responsabilità + Resource loading per ruolo + Gap analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
