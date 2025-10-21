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
  FileText, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { DecisionLog, TeamMember } from '@/types/team';

interface DecisionLogViewProps {
  members: TeamMember[];
}

export function DecisionLogView({ }: DecisionLogViewProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  // Sample Decision Log per Eco 3D
  const [decisions] = useState<DecisionLog[]>([
    {
      decision_id: 'DEC-001',
      titolo: 'Scelta fornitore PCB per Prototipo HW',
      contesto: 'Necessità di produrre 5 unità prototipo per test validazione. Budget disponibile €23K. Due fornitori in shortlist: Vendor A (Italia, €23K, 8w) e Vendor B (Cina, €15K, 12w + import).',
      opzioni: [
        'Vendor A - Italia (€23K, 8w, supporto locale)',
        'Vendor B - Cina (€15K, 12w, import complesso)',
        'Split order - 3 unità A + 2 unità B (hedge risk)'
      ],
      framework: 'DACI',
      driver: 'CTO',
      approver: 'CEO',
      contributors: ['COO', 'CFO'],
      informed: ['Team R&D'],
      esito: 'Vendor A selezionato',
      data: '2025-09-15',
      rationale: 'Vendor A scelto per: (1) delivery time critico (8w vs 12w), (2) supporto tecnico locale essenziale per debug, (3) riduzione rischio import/doganale. Budget extra €8K assorbibile. Risk > Cost in questa fase.'
    },
    {
      decision_id: 'DEC-002',
      titolo: 'Architettura Cloud per AI inference',
      contesto: 'Necessità di deployare modello AI per ricostruzione 3D. Opzioni: on-premise vs AWS vs GCP vs hybrid.',
      opzioni: [
        'AWS (Lambda + S3)',
        'GCP (Cloud Run + GCS)',
        'Azure (Functions + Blob)',
        'On-premise GPU server',
        'Hybrid: edge processing + cloud backup'
      ],
      framework: 'RAPID',
      driver: 'CTO',
      approver: 'CEO',
      contributors: ['CFO', 'DPO'],
      informed: ['Team SW'],
      esito: 'GCP Cloud Run + edge hybrid',
      data: '2025-08-20',
      rationale: 'GCP per: (1) migliore support TensorFlow, (2) Cloud Run più flessibile Lambda, (3) compliance GDPR con region EU. Edge processing per latency critica. DPO approval su data residency EU.'
    },
    {
      decision_id: 'DEC-003',
      titolo: 'Strategia Regulatory: MDR Class IIa vs IIb',
      contesto: 'Classificazione dispositivo Eco 3D. Class IIa (più facile) vs IIb (più rigorosa ma market positioning migliore).',
      opzioni: [
        'Class IIa - Timing più rapido (18-24 mesi)',
        'Class IIb - Requisiti maggiori ma premium positioning'
      ],
      framework: 'DACI',
      driver: 'COO',
      approver: 'CEO',
      contributors: ['PRRC', 'QA/RA Consultant', 'CFO'],
      informed: ['Board', 'Team'],
      esito: 'Class IIa selezionata',
      data: '2025-07-10',
      rationale: 'Class IIa per: (1) time-to-market critico (fundraising Series A target Q4 2026), (2) rischio Class IIb eccessivo per MVP, (3) possibilità upgrade a IIb in V2. PRRC conferma IIa sufficiente per uso clinico target.'
    },
    {
      decision_id: 'DEC-004',
      titolo: 'Assunzione AI Engineer vs Consulente',
      contesto: 'Necessità competenze ML/CV per algoritmo ricostruzione 3D. FTE (€60K + equity) vs Consulente (€800/day, 3 mesi).',
      opzioni: [
        'FTE AI Engineer (€60K/anno + 1.5% equity)',
        'Consulente ML (€800/day × 60 giorni = €48K)',
        'Hybrid: Consulente Q3 + FTE Q4'
      ],
      framework: 'DRI',
      driver: 'CTO',
      approver: 'CTO',
      contributors: ['CEO', 'CFO'],
      informed: ['Team'],
      esito: 'Hybrid approach',
      data: '2025-09-01',
      rationale: 'Hybrid: (1) Consulente per MVP rapido e proof-of-concept, (2) valutazione competenze in campo prima FTE commitment, (3) riduzione burn rate Q3. Se consulente performa, offer FTE Q4 con conversion bonus.'
    },
    {
      decision_id: 'DEC-005',
      titolo: 'Fundraising Timing: Q4 2025 vs Q1 2026',
      contesto: 'Series A target €1.5M. Runway attuale fino Q2 2026. Opzioni timing pitch investors.',
      opzioni: [
        'Q4 2025 - Anticipare (meno traction ma più runway)',
        'Q1 2026 - Aspettare (più dati clinici ma meno runway)'
      ],
      framework: 'DACI',
      driver: 'CFO',
      approver: 'CEO',
      contributors: ['Board', 'COO'],
      informed: ['Team'],
      esito: 'Q1 2026 selezionato',
      data: '2025-10-01',
      rationale: 'Q1 2026 per: (1) avere dati trial pilota (30 pazienti) per pitch, (2) completare usabilità IEC 62366, (3) runway sufficiente (6 mesi margin), (4) market timing post-holiday migliore. Risk: runway tight ma mitigato con bridge loan option.'
    },
    {
      decision_id: 'DEC-006',
      titolo: 'Go-To-Market: Direct vs Distribution partner',
      contesto: 'Strategia commercializzazione Italia. Direct sales team vs partnership con distributore medical devices.',
      opzioni: [
        'Direct sales team (2 FTE, €120K/anno)',
        'Distribution partner (revenue share 30%)',
        'Hybrid: Direct per top 10 ospedali, partner per long tail'
      ],
      framework: 'MOCHA',
      driver: 'CEO',
      approver: 'Board',
      contributors: ['COO', 'CFO', 'Sales Consultant'],
      informed: ['Team'],
      esito: 'Pending - Decision Q4 2025',
      data: '2025-10-15',
      rationale: 'In valutazione. Pros direct: margini, controllo, relationship. Pros partner: capillarity, credibilità, low upfront cost. Decisione dipende da: (1) risultati trial clinici, (2) interesse early adopters, (3) feedback roadshow Q4.'
    }
  ]);

  const getFrameworkColor = (framework: string): string => {
    const colors: Record<string, string> = {
      'DACI': 'bg-blue-500',
      'RAPID': 'bg-green-500',
      'MOCHA': 'bg-purple-500',
      'DRI': 'bg-orange-500'
    };
    return colors[framework] || 'bg-gray-500';
  };

  const getStatusBadge = (esito: string | undefined) => {
    if (!esito || esito.includes('Pending')) {
      return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Decided</Badge>;
  };

  const getFrameworkDescription = (framework: string): string => {
    switch (framework) {
      case 'DACI':
        return 'Driver (propone), Approver (decide), Contributors (input), Informed (comunicati)';
      case 'RAPID':
        return 'Recommend, Agree, Perform, Input, Decide';
      case 'MOCHA':
        return 'Manager (owner), Owner (esegue), Consulted, Helper, Approver';
      case 'DRI':
        return 'Directly Responsible Individual - unico owner e decider';
      default:
        return '';
    }
  };

  const filteredDecisions = selectedFramework === 'all' 
    ? decisions 
    : decisions.filter(d => d.framework === selectedFramework);

  // Stats
  const stats = {
    total: decisions.length,
    decided: decisions.filter(d => d.esito && !d.esito.includes('Pending')).length,
    pending: decisions.filter(d => !d.esito || d.esito.includes('Pending')).length,
    frameworks: {
      DACI: decisions.filter(d => d.framework === 'DACI').length,
      RAPID: decisions.filter(d => d.framework === 'RAPID').length,
      MOCHA: decisions.filter(d => d.framework === 'MOCHA').length,
      DRI: decisions.filter(d => d.framework === 'DRI').length
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-900 mb-2">Decision Log - Framework DACI/RAPID/MOCHA/DRI</h4>
                <p className="text-sm text-indigo-700 mb-3">
                  Log strutturato delle decisioni strategiche con framework di responsabilità chiari.
                  Garantisce trasparenza, audit trail e onboarding rapido.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <Badge className="bg-blue-500 text-white mb-1">DACI</Badge>
                    <p>Driver/Approver/Contributors/Informed</p>
                  </div>
                  <div>
                    <Badge className="bg-green-500 text-white mb-1">RAPID</Badge>
                    <p>Recommend/Agree/Perform/Input/Decide</p>
                  </div>
                  <div>
                    <Badge className="bg-purple-500 text-white mb-1">MOCHA</Badge>
                    <p>Manager/Owner/Consulted/Helper/Approver</p>
                  </div>
                  <div>
                    <Badge className="bg-orange-500 text-white mb-1">DRI</Badge>
                    <p>Directly Responsible Individual</p>
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
              <p className="text-xs text-muted-foreground">Decisioni Totali</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.decided}</div>
              <p className="text-xs text-muted-foreground">Decise</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">In Valutazione</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>DACI: <strong>{stats.frameworks.DACI}</strong></div>
                <div>RAPID: <strong>{stats.frameworks.RAPID}</strong></div>
                <div>MOCHA: <strong>{stats.frameworks.MOCHA}</strong></div>
                <div>DRI: <strong>{stats.frameworks.DRI}</strong></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Framework Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedFramework === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFramework('all')}
              >
                Tutti ({decisions.length})
              </Button>
              {['DACI', 'RAPID', 'MOCHA', 'DRI'].map(fw => (
                <Button
                  key={fw}
                  size="sm"
                  variant={selectedFramework === fw ? 'default' : 'outline'}
                  className={selectedFramework === fw ? getFrameworkColor(fw) : ''}
                  onClick={() => setSelectedFramework(fw)}
                >
                  {fw} ({stats.frameworks[fw as keyof typeof stats.frameworks]})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Decisions Timeline */}
        <div className="space-y-4">
          {filteredDecisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nessuna decisione trovata</p>
              </CardContent>
            </Card>
          ) : (
            filteredDecisions.map((decision) => (
              <Card key={decision.decision_id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{decision.decision_id}</Badge>
                          <Badge className={`${getFrameworkColor(decision.framework)} text-white`}>
                            {decision.framework}
                          </Badge>
                          {getStatusBadge(decision.esito)}
                        </div>
                        <h3 className="font-bold text-lg">{decision.titolo}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(decision.data).toLocaleDateString('it-IT', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Context */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Contesto:</p>
                      <p className="text-sm text-gray-700">{decision.contesto}</p>
                    </div>

                    {/* Options */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Opzioni Valutate:</p>
                      <ul className="space-y-1">
                        {decision.opzioni.map((opt, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span className={decision.esito && opt.toLowerCase().includes(decision.esito.split(' ')[0].toLowerCase()) 
                              ? 'font-semibold text-green-700' 
                              : 'text-gray-600'
                            }>
                              {opt}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          {decision.framework} Roles:
                        </p>
                        <div className="space-y-1 text-xs">
                          {decision.driver && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Driver/Manager</Badge>
                              <span className="font-semibold text-blue-700">{decision.driver}</span>
                            </div>
                          )}
                          {decision.approver && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Approver/Decider</Badge>
                              <span className="font-semibold text-red-700">{decision.approver}</span>
                            </div>
                          )}
                          {decision.contributors.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Contributors</Badge>
                              <span className="text-gray-700">{decision.contributors.join(', ')}</span>
                            </div>
                          )}
                          {decision.informed.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Informed</Badge>
                              <span className="text-gray-600">{decision.informed.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Tooltip>
                          <TooltipTrigger>
                            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                              Framework Info
                              <Info className="h-3 w-3" />
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{getFrameworkDescription(decision.framework)}</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-gray-600">
                          {getFrameworkDescription(decision.framework)}
                        </p>
                      </div>
                    </div>

                    {/* Outcome & Rationale */}
                    {decision.esito && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-900">Decisione:</p>
                        </div>
                        <p className="text-sm font-semibold text-green-800 mb-2">{decision.esito}</p>
                        {decision.rationale && (
                          <>
                            <p className="text-xs font-semibold text-green-900 mb-1">Rationale:</p>
                            <p className="text-sm text-green-700">{decision.rationale}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Best Practices */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Decision Log Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-3">
              <div>
                <p className="font-semibold text-indigo-900 mb-1">📝 Quando loggare:</p>
                <ul className="list-disc list-inside space-y-1 text-indigo-700">
                  <li>Decisioni strategiche (product, market, tech, finance)</li>
                  <li>Trade-off con impatto &gt;€10K o &gt;2 settimane timeline</li>
                  <li>Decisioni reversibili ma costose da cambiare</li>
                  <li>Precedenti per decisioni future simili</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-indigo-900 mb-1">✅ Output Decision Log:</p>
                <ul className="list-disc list-inside space-y-1 text-indigo-700">
                  <li><strong>Trasparenza:</strong> Tutti sanno perché decisioni prese</li>
                  <li><strong>Onboarding:</strong> Nuovi membri capiscono storia</li>
                  <li><strong>Learning:</strong> Retrospective su decisioni passate</li>
                  <li><strong>Alignment:</strong> Team aligned su direzione</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-indigo-900 mb-1">🎯 Framework Selection:</p>
                <p className="text-indigo-700">
                  <strong>DACI:</strong> Decision complesse multi-stakeholder | 
                  <strong> RAPID:</strong> Consensus rapido | 
                  <strong> MOCHA:</strong> Progetti con ownership chiaro | 
                  <strong> DRI:</strong> Decisioni individuali rapide
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
