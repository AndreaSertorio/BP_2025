'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  FileCheck,
  Calendar,
  Activity
} from 'lucide-react';
import { RegulatoryTimelineView } from '../RegulatoryTimelineView';

interface BusinessPlanRegolatorioSectionProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function BusinessPlanRegolatorioSection({ 
  isCollapsed = false,
  onToggle 
}: BusinessPlanRegolatorioSectionProps) {
  
  // Stati per customizzazione visualizzazione
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [visualOptions, setVisualOptions] = useState({
    showClassificazione: true,
    showQMS: true,
    showStrategiaClinica: true,
    showTimelineTestuale: true,
    showRischi: true,
    showTimelineInterattiva: true,
    showIP: false, // Nuova sezione Proprietà Intellettuale
    showCosti: false, // Nuova sezione Budget & Costi
  });

  const toggleOption = (key: keyof typeof visualOptions) => {
    setVisualOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card className="p-8 border-l-4 border-l-red-600">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold">7</span>
          Regolatorio & Clinico
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomPanel(!showCustomPanel)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Settings className="h-4 w-4 mr-1" />
            Personalizza
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          {/* Pannello Personalizzazione */}
          {showCustomPanel && (
            <Card className="p-4 bg-gray-50 border-2 border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Personalizza Visualizzazione Sezione 7
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {Object.entries({
                  showClassificazione: '🌍 Classificazione UE/USA',
                  showQMS: '📋 Sistema Qualità & Norme',
                  showStrategiaClinica: '🏥 Strategia Clinica',
                  showTimelineTestuale: '📅 Timeline Testuale (2025-2028)',
                  showRischi: '⚠️ Rischi & Mitigazioni',
                  showTimelineInterattiva: '📊 Timeline Interattiva (Gantt)',
                  showIP: '🔒 Proprietà Intellettuale',
                  showCosti: '💰 Budget & Costi Regolatori',
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleOption(key as keyof typeof visualOptions)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                      visualOptions[key as keyof typeof visualOptions]
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  >
                    {visualOptions[key as keyof typeof visualOptions] ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Introduzione */}
          <p className="text-sm text-gray-700">
            <strong>Obiettivo:</strong> allineare GTM e finanza a un percorso regolatorio/clinico realistico 
            per <strong>USA (510(k))</strong> e <strong>UE (MDR classe IIa / CE)</strong>.
          </p>

          {/* 7.1 Classificazione UE/USA */}
          {visualOptions.showClassificazione && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                7.1 Classificazione regolatoria
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-50 border-2 border-blue-300">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span> UE (MDR 2017/745)
                  </h4>
                  <p className="text-xs text-gray-700">
                    Dispositivo ecografico diagnostico <strong>classe IIa</strong> (rischio moderato) 
                    con componente software/AI a supporto dell&apos;acquisizione/misura.
                  </p>
                </Card>
                <Card className="p-4 bg-red-50 border-2 border-red-300">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span> USA (FDA)
                  </h4>
                  <p className="text-xs text-gray-700">
                    Probabile <strong>classe II</strong> con percorso <strong>510(k)</strong> per sistema 
                    ecografico diagnostico. Conferma predicate e product code in Pre-Sub.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* 7.2 Sistema Qualità & Norme */}
          {visualOptions.showQMS && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2 Sistema Qualità (QMS) & norme chiave</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { norm: 'ISO 13485', desc: 'SGQ dispositivi medici (Design Control, CAPA, Complaints)' },
                  { norm: 'ISO 14971', desc: 'Risk Management - analisi pericoli/controlli' },
                  { norm: 'IEC 62304', desc: 'Ciclo di vita software (classe B/C)' },
                  { norm: 'IEC 60601-1', desc: 'Sicurezza elettrica generale' },
                  { norm: 'IEC 60601-1-2', desc: 'Compatibilità elettromagnetica (EMC)' },
                  { norm: 'IEC 60601-2-37', desc: 'Requisiti per apparecchi ecografici diagnostici' },
                  { norm: 'IEC 62366-1', desc: 'Usabilità - integrazione con 60601-1-6' },
                  { norm: 'ISO 10993', desc: 'Biocompatibilità parti paziente-contatto' },
                  { norm: 'IEC 81001-5-1', desc: 'Cybersecurity per software medicale' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200">
                    <p className="font-semibold text-xs text-blue-700">{item.norm}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7.3 Strategia Clinica */}
          {visualOptions.showStrategiaClinica && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                7.3 Strategia clinica (ISO 14155)
              </h3>
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Obiettivo:</strong> dimostrare performance clinica e benefici attesi nelle indicazioni prioritarie.
                </p>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="font-semibold text-sm text-gray-800 mb-1">1) Pilot comparativo (6–12 settimane)</p>
                    <p className="text-xs text-gray-700">
                      Tempo esame, qualità immagine, accuratezza volumetrica vs riferimento; <strong>n≥50 casi</strong> per distretto
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="font-semibold text-sm text-gray-800 mb-1">2) Studio confermativo (multicentrico)</p>
                    <p className="text-xs text-gray-700">
                      Non-inferiorità su misure volumetriche vs TC/RM; concordanza/ICC, variabilità intra/inter-operatore
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 7.4 Timeline Testuale */}
          {visualOptions.showTimelineTestuale && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                7.4 Timeline regolatoria (2025–2028)
              </h3>
              <div className="space-y-3">
                <Card className="p-4 bg-blue-50 border-l-4 border-l-blue-600">
                  <h4 className="font-bold text-sm text-gray-800 mb-2">2025 Q4</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong>Pre-Sub FDA</strong> (Q-Submission): predicate, schema test, dati clinici, labeling AI</li>
                    <li>• Shortlist <strong>Notified Body</strong> (2–3) e gap assessment MDR</li>
                    <li>• Scelta CRO e site per pilot</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-purple-50 border-l-4 border-l-purple-600">
                  <h4 className="font-bold text-sm text-gray-800 mb-2">2026</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong>Q1:</strong> Avvio QMS ISO 13485 (manuale + 12 procedure core)</li>
                    <li>• <strong>Q2:</strong> Testing completo (60601-1/-1-2/-2-37, 62366, 10993, V&V SW, cybersecurity)</li>
                    <li>• <strong>Q3:</strong> 510(k) submission (Δ 90–180 gg review)</li>
                    <li>• <strong>Q4:</strong> <strong className="text-green-600">510(k) clearance</strong> (target H2-2026) → Launch USA</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-green-50 border-l-4 border-l-green-600">
                  <h4 className="font-bold text-sm text-gray-800 mb-2">2027</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong>Q1–Q2:</strong> Pilot clinici EU/IT (ISO 14155) → aggiornamento CER e PMS/PMCF</li>
                    <li>• <strong>Q2–Q3:</strong> Audit ISO 13485 (Stage 1/2) e Technical Documentation pronta</li>
                    <li>• <strong>Q4:</strong> Sottomissione CE al NB (Δ 4–6 mesi)</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-orange-50 border-l-4 border-l-orange-600">
                  <h4 className="font-bold text-sm text-gray-800 mb-2">2028 Q1</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong className="text-green-600">Marcatura CE</strong> (target) → Go-to-market EU e tender</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* 7.5 Proprietà Intellettuale */}
          {visualOptions.showIP && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.5 Strategia Proprietà Intellettuale</h3>
              <Card className="p-4 bg-purple-50 border-l-4 border-l-purple-600">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">🇮🇹 Brevetto Priorità Italia</h4>
                    <p className="text-xs text-gray-700">
                      <strong>Set-2025:</strong> Deposito brevetto "madre" su 3D ecografico + AI guida scansione
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">🌍 PCT (Patent Cooperation Treaty)</h4>
                    <p className="text-xs text-gray-700">
                      <strong>Set-2026:</strong> Estensione internazionale entro 12 mesi da priorità
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">🎯 Nazionalizzazioni</h4>
                    <p className="text-xs text-gray-700">
                      <strong>2028:</strong> USA (USPTO), EU (EPO), Asia (CN, JP) - entro 30 mesi da PCT
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 7.6 Budget & Costi */}
          {visualOptions.showCosti && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.6 Budget & Costi Regolatori</h3>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">💰 USA (FDA 510k)</h4>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• Pre-Sub: €5-8k</li>
                      <li>• Testing: €80-120k</li>
                      <li>• 510(k) submission: €15-25k</li>
                      <li>• Consulenti FDA: €30-50k</li>
                      <li className="pt-1 border-t border-orange-200">
                        <strong>Totale: €130-200k</strong>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🇪🇺 UE (MDR CE)</h4>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• QMS ISO 13485: €35k</li>
                      <li>• Technical File: €40-60k</li>
                      <li>• CER (Clinical Evaluation): €20k</li>
                      <li>• Notified Body: €25-40k</li>
                      <li>• Testing: €60-80k</li>
                      <li className="pt-1 border-t border-orange-200">
                        <strong>Totale: €180-235k</strong>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-orange-300">
                  <p className="text-sm font-bold text-gray-800">
                    📊 Budget Regolatorio Totale: <span className="text-orange-600">€310-435k</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Budget distribuito su 2-3 anni (2026-2028)
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 7.7 Rischi & Mitigazioni */}
          {visualOptions.showRischi && (
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                7.7 Rischi specifici & mitigazioni
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-red-700">⚠️ Testing slittano/rigettano</p>
                  <p className="text-xs text-gray-700">Pre-test e gap-fix; contratti con 2 laboratori (backup slot)</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">⚠️ Dati clinici aggiuntivi richiesti</p>
                  <p className="text-xs text-gray-700">Protocollo add-on e coorte estesa; buffer 3–6 mesi</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">⚠️ Software safety class ↑</p>
                  <p className="text-xs text-gray-700">Evidenze V&V mature; ridurre funzioni AI advisory in v1</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">⚠️ Risorse QARA</p>
                  <p className="text-xs text-gray-700">Ingaggio CRO/QARA esterna per picchi; semplificare perimetro v1</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">⚠️ Cambio normativo</p>
                  <p className="text-xs text-gray-700">Monitoring continuo EU/FDA updates; advisory board regolatorio</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">⚠️ Notified Body capacity</p>
                  <p className="text-xs text-gray-700">Early engagement (2025 Q4); 2-3 NB in shortlist per backup</p>
                </div>
              </div>
            </div>
          )}

          {/* 7.8 Timeline Interattiva */}
          {visualOptions.showTimelineInterattiva && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.8 Timeline Interattiva — Task Regolatorio MDR & FDA</h3>
              <RegulatoryTimelineView />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
