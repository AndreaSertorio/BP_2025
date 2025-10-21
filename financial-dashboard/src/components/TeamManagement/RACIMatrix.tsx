'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RACIAssignment, TeamMember, Department } from '@/types/team';

interface RACIMatrixProps {
  members: TeamMember[];
  departments: Department[];
}

export function RACIMatrix({ members, departments }: RACIMatrixProps) {
  // Sample tasks/work packages
  const tasks = [
    { id: 'wbs_1.1', name: 'Prototipo HW V1', category: 'engineering' },
    { id: 'wbs_1.3', name: 'App SW V1', category: 'engineering' },
    { id: 'wbs_2.2', name: 'Usabilità 62366', category: 'regulatory' },
    { id: 'wbs_3.1', name: 'EC Submission', category: 'clinical' },
    { id: 'wbs_4.1', name: 'Go-To-Market Strategy', category: 'sales' },
  ];

  // Sample RACI assignments
  const [assignments, setAssignments] = useState<RACIAssignment[]>([
    { wbs_id: 'wbs_1.1', obs_id: 'member_001', ruolo: 'I' },
    { wbs_id: 'wbs_1.3', obs_id: 'member_001', ruolo: 'A' },
    { wbs_id: 'wbs_2.2', obs_id: 'member_001', ruolo: 'I' },
  ]);

  const roles = ['R', 'A', 'C', 'I'] as const;

  const getAssignment = (taskId: string, memberId: string): string | null => {
    const assignment = assignments.find(
      a => a.wbs_id === taskId && a.obs_id === memberId
    );
    return assignment?.ruolo || null;
  };

  const toggleAssignment = (taskId: string, memberId: string, role: typeof roles[number]) => {
    const existing = assignments.find(
      a => a.wbs_id === taskId && a.obs_id === memberId
    );

    if (existing && existing.ruolo === role) {
      // Remove assignment
      setAssignments(assignments.filter(
        a => !(a.wbs_id === taskId && a.obs_id === memberId)
      ));
    } else if (existing) {
      // Update assignment
      setAssignments(assignments.map(a =>
        a.wbs_id === taskId && a.obs_id === memberId
          ? { ...a, ruolo: role }
          : a
      ));
    } else {
      // Add new assignment
      setAssignments([...assignments, { wbs_id: taskId, obs_id: memberId, ruolo: role }]);
    }
  };

  const validateTask = (taskId: string): { valid: boolean; issues: string[] } => {
    const taskAssignments = assignments.filter(a => a.wbs_id === taskId);
    const issues: string[] = [];

    // Must have exactly 1 Accountable
    const accountableCount = taskAssignments.filter(a => a.ruolo === 'A').length;
    if (accountableCount === 0) issues.push('Manca Accountable (A)');
    if (accountableCount > 1) issues.push('Troppi Accountable (deve essere 1)');

    // Must have at least 1 Responsible
    const responsibleCount = taskAssignments.filter(a => a.ruolo === 'R').length;
    if (responsibleCount === 0) issues.push('Manca Responsible (R)');

    return { valid: issues.length === 0, issues };
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'R': return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'A': return 'bg-green-500 text-white hover:bg-green-600';
      case 'C': return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'I': return 'bg-gray-400 text-white hover:bg-gray-500';
      default: return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  const getRoleDescription = (role: string): string => {
    switch (role) {
      case 'R': return 'Responsible: Esegue il lavoro';
      case 'A': return 'Accountable: Responsabile finale (1 solo per task)';
      case 'C': return 'Consulted: Deve essere consultato';
      case 'I': return 'Informed: Deve essere informato';
      default: return '';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Matrice RACI</h4>
                <p className="text-sm text-blue-700 mb-3">
                  La matrice RACI definisce i ruoli e le responsabilità per ogni task/deliverable.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">R</Badge>
                    <span className="text-blue-900">Responsible (esegue)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">A</Badge>
                    <span className="text-blue-900">Accountable (approva)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500">C</Badge>
                    <span className="text-blue-900">Consulted (consulta)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-400">I</Badge>
                    <span className="text-blue-900">Informed (informato)</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  ⚠️ Regola: ogni task deve avere <strong>esattamente 1 A</strong> e <strong>almeno 1 R</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RACI Matrix Table */}
        <Card>
          <CardHeader>
            <CardTitle>Matrice Responsabilità (RACI)</CardTitle>
            <CardDescription>
              Clicca sulle celle per assegnare ruoli. Validazione automatica attiva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Task / Deliverable</TableHead>
                    {members.map(member => (
                      <TableHead key={member.id} className="text-center min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium">{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.role.split(' ')[0]}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Validazione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => {
                    const validation = validateTask(task.id);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{task.name}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">ID: {task.id}</p>
                                <p className="text-xs">Categoria: {task.category}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        {members.map(member => {
                          const currentRole = getAssignment(task.id, member.id);
                          return (
                            <TableCell key={member.id} className="p-2 text-center">
                              <div className="flex gap-1 justify-center flex-wrap">
                                {roles.map(role => (
                                  <Tooltip key={role}>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={currentRole === role ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-7 w-7 p-0 text-xs ${
                                          currentRole === role ? getRoleColor(role) : ''
                                        }`}
                                        onClick={() => toggleAssignment(task.id, member.id, role)}
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
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger>
                              {validation.valid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {validation.valid ? (
                                <p className="text-xs text-green-600">✓ Validazione OK</p>
                              ) : (
                                <div className="text-xs text-red-600">
                                  {validation.issues.map((issue, idx) => (
                                    <p key={idx}>• {issue}</p>
                                  ))}
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {tasks.filter(t => validateTask(t.id).valid).length}/{tasks.length}
              </div>
              <p className="text-xs text-muted-foreground">Tasks Validati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Assegnazioni Totali</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {tasks.filter(t => !validateTask(t.id).valid).length}
              </div>
              <p className="text-xs text-muted-foreground text-red-500">Issues da Risolvere</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
