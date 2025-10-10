'use client';

import React from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { FileText, Target, CheckCircle2, XCircle, Users, Award } from 'lucide-react';

export function BusinessPlanView() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Business Plan — Eco 3D</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <Badge variant="outline" className="font-normal">v0.1 Internal</Badge>
          <span>Ultimo aggiornamento: 14-09-2025</span>
          <span className="text-gray-400">|</span>
          <span>Proprietario: Team Eco 3D</span>
        </div>
        <p className="mt-3 text-gray-700">
          <strong>Scopo:</strong> base operativa interna per strategia, execution e fundraising. 
          Versioni derivate: v1.1 (investitori), v1.2 (banche/finanziatori).
        </p>
      </div>

      {/* Tracker Progress */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Tracker stato BP — Iterazione #17
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Executive Summary', progress: 50 },
            { name: 'Proposta di Valore', progress: 90 },
            { name: 'Mercato (TAM/SAM/SOM)', progress: 75 },
            { name: 'Competizione & Posizionamento', progress: 90 },
            { name: 'Modello di Business & Prezzi', progress: 70 },
            { name: 'Go-to-Market (24 mesi)', progress: 80 },
            { name: 'Regolatorio & Clinico', progress: 85 },
            { name: 'Piano Finanziario (3–5 anni)', progress: 95 },
          ].map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700 text-xs truncate">{idx + 1}. {item.name}</span>
                <span className="text-blue-600 font-semibold text-xs ml-2">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    item.progress >= 85 ? 'bg-green-500' : 
                    item.progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-8">
        {/* 1. Executive Summary */}
        <section id="executive-summary">
          <Card className="p-8 border-l-4 border-l-blue-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">1</span>
              Executive Summary
            </h2>

            <div className="space-y-6">
              {/* Problema e Soluzione */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-red-50 border-red-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Problema (oggi)
                  </h3>
                  <p className="text-sm text-gray-700">
                    TAC irradia; RM è costosa e lenta; ecografia 2D non fornisce volume: il follow-up è spesso lento, 
                    costoso e con ripetizioni non necessarie.
                  </p>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Soluzione (tesi di prodotto)
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-600">Eco 3D</strong>: dispositivo <strong>ultra-portatile (&lt;5 kg)</strong> con{' '}
                    <strong>3D/4D in tempo reale</strong> e <strong>AI di guida alla scansione</strong>. 
                    Obiettivo: <strong>esame ≈5 minuti</strong>, <strong>0 radiazioni</strong>, 
                    <strong> misure volumetriche riproducibili</strong> al letto del paziente, 
                    <strong> costo target ≈€125/esame</strong>.
                  </p>
                </Card>
              </div>

              {/* Perché ora */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Perché ora</h3>
                <p className="text-sm text-gray-700">
                  Cresce la domanda di esami bedside e di follow-up frequenti; pressione su tempi/costi; 
                  maturità combinata di AI + 3D ecografico.
                </p>
              </Card>

              {/* Clienti */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Clienti e primi utilizzatori
                </h3>
                <p className="text-sm text-gray-700">
                  Ospedali e cliniche, con priorità ai reparti che gestiscono follow-up oncologici 
                  (tiroide/addome), <strong>MSK</strong> e <strong>senologia</strong>.
                </p>
              </div>

              {/* Mercato */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-300">
                <h3 className="font-semibold text-gray-800 mb-2">Mercato iniziale (stima validata)</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Italia/EU5/USA — <strong className="text-blue-600">TAM 63,8 M esami</strong>; 
                    <strong className="text-blue-600"> SAM 31,9 M</strong>; 
                    <strong className="text-blue-600"> SOM 1–5%</strong>
                  </p>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm">
                      Esempio: <strong className="text-green-600 text-lg">SOM 3% ≈ €95,7 M</strong> 
                      <span className="text-gray-600"> assumendo €100/esame</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Vantaggio competitivo */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Vantaggio competitivo
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Unico 3D portatile <strong>multi-distretto</strong> con guida AI e workflow rapido (≈5'); 
                  <strong> costo totale di possesso</strong> inferiore a console 3D; più valore dei palmari 2D.
                </p>
              </div>

              {/* Key Points Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-3 bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">📋 Regolatorio & clinico</h4>
                  <p className="text-xs text-gray-700">
                    EU: <strong>MDR classe IIa, CE</strong><br/>
                    USA: <strong>FDA 510(k)</strong><br/>
                    QMS: <strong>ISO 13485</strong><br/>
                    Sicurezza: <strong>IEC 60601</strong>
                  </p>
                </Card>

                <Card className="p-3 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">🔒 Proprietà intellettuale</h4>
                  <p className="text-xs text-gray-700">
                    <strong>Priorità IT Set-2025</strong><br/>
                    (brevetto "madre" su 3D + AI)<br/>
                    <strong>PCT Set-2026</strong><br/>
                    Nazionali 2028
                  </p>
                </Card>

                <Card className="p-3 bg-orange-50 border-orange-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">🎯 Go-to-Market</h4>
                  <p className="text-xs text-gray-700">
                    Funnel:<br/>
                    <strong>Lead → Demo → Pilot → Contratto</strong><br/>
                    con kit minimi e metriche misurabili
                  </p>
                </Card>

                <Card className="p-3 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">💰 Modello ricavi</h4>
                  <p className="text-xs text-gray-700">
                    Vendita +<br/>
                    <strong>abbonamento software/AI</strong><br/>
                    e/o <strong>pay-per-scan</strong><br/>
                    Leasing/noleggio
                  </p>
                </Card>
              </div>

              {/* Roadmap capitali */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border-2 border-green-300">
                <h3 className="font-semibold text-gray-800 mb-3">💵 Roadmap & capitali (macro)</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600 min-w-[100px]">Seed €1–3M</span>
                    <span>Prototipo, PCT, pre-clinica, QMS</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-[100px]">Seed+ €2–5M</span>
                    <span>Studio clinico, Tech File, CE/510k</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-purple-600 min-w-[100px]">Serie A €5–12M</span>
                    <span>Produzione & vendite</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Proposta di Valore */}
        <section id="proposta-valore">
          <Card className="p-8 border-l-4 border-l-green-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">2</span>
              Proposta di Valore
            </h2>

            <div className="space-y-6">
              {/* Per chi risolviamo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Per chi e quale problema risolviamo</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                      <span>👨‍⚕️</span> Clinici
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Radiologi, specialisti MSK, senologi, endocrinologi: oggi il 2D non fornisce volume 
                      e richiede ripetizioni o invii a TAC/RM → tempi lunghi, variabilità operatore-dipendente.
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                      <span>🏥</span> Reparti/ospedali
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Direzioni, caposala, COO: costi e liste d'attesa elevati; 
                      difficoltà a portare l'imaging al letto del paziente; scarsità di sale ecografiche dedicate.
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                      <span>👤</span> Pazienti
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Esami lenti, ansia d'attesa, esposizione a radiazioni in TAC.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Soluzione */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Soluzione e perché è diversa</h3>
                <Card className="p-5 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <ul className="space-y-2.5 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Eco 3D</strong> porta <strong>3D/4D in tempo reale</strong> al letto del paziente, 
                        con <strong>AI che guida il posizionamento</strong> della sonda e protocolli rapidi per distretto.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Portatile (&lt;5 kg)</strong>, <strong>dose zero</strong>, 
                        workflow snello (target <strong>≈5 min/esame</strong>), integrazione prevista con RIS/PACS.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Obiettivo: <strong>misure volumetriche riproducibili</strong> e riduzione degli invii inutili verso TAC/RM.
                      </span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Outcome promessi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Outcome promessi (KPI target iniziali, da validare in pilot)
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Tempo medio esame</h4>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">≤6 min</Badge>
                    </div>
                    <p className="text-xs text-gray-600">(target 5 min) per protocolli predefiniti</p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Riduzione second-look TAC/RM</h4>
                      <Badge className="bg-green-100 text-green-800 text-xs">−20% ~ −40%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Nei follow-up selezionati (tiroide/addome, MSK, seno)</p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Aumento capacità bedside</h4>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">+25% ~ +40%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Esami/giorno per reparto con stessa dotazione di personale</p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Variabilità inter-operatore</h4>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">−30%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Su misure volumetriche chiave (CV)</p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-yellow-500 md:col-span-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Costo medio per esame</h4>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">€100–125</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Allineato al nostro modello (mix device + sw/AI + service)
                    </p>
                  </Card>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  *Nota: valori con intervalli conservativi; saranno aggiornati con i dati dei pilot.
                </p>
              </div>

              {/* Casi d'uso prioritari */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Casi d'uso prioritari (v1)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🦴</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">1. Tiroide/linfonodi</h4>
                        <p className="text-xs text-gray-700 mb-2">
                          Volumetria noduli; follow-up post-chirurgico.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Valore: decisioni più rapide, meno rinvii a TAC
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🩺</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">2. Addome (fegato/rene)</h4>
                        <p className="text-xs text-gray-700 mb-2">
                          Segmentazione volumetrica di lesioni/masse e monitoraggi.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Valore: follow-up ravvicinati a dose zero
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏃‍♂️</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">3. MSK (spalla, ginocchio)</h4>
                        <p className="text-xs text-gray-700 mb-2">
                          Imaging dinamico 3D di tendini/strutture.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Valore: triage e controllo terapia
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎗️</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">4. Senologia (site selezionati)</h4>
                        <p className="text-xs text-gray-700 mb-2">
                          Supporto volumetrico su lesioni sospette.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Valore: integrazione con percorso diagnostico
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Differenziatori chiave */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Differenziatori chiave
                </h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span><strong>3D premium, portatile</strong> (non solo 2D palmare)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span><strong>AI di guida</strong> che riduce variabilità e curva di apprendimento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span><strong>Workflow da 5 minuti</strong> e protocolli per distretto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span><strong>TCO inferiore</strong> a console 3D; integrazione IT prevista</span>
                  </div>
                </div>
              </div>

              {/* Pitch finale */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white text-center shadow-lg">
                <p className="text-xs uppercase tracking-wide mb-2 opacity-90">Messaggio sintetico (pitch)</p>
                <p className="text-lg md:text-xl font-semibold italic leading-relaxed">
                  "3D di livello alto, portatile e accessibile (dose zero): con la guida AI, 
                  il follow-up diventa più veloce, ripetibile e sostenibile."
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Mercato (TAM/SAM/SOM) */}
        <section id="mercato">
          <Card className="p-8 border-l-4 border-l-purple-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">3</span>
              Mercato (TAM/SAM/SOM)
            </h2>

            <div className="space-y-6">
              {/* Definizioni */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">TAM (totale teorico)</h4>
                  <p className="text-sm text-gray-700">
                    Volume complessivo di esami ecografici 3D potenziali nei mercati target
                  </p>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">SAM (raggiungibile)</h4>
                  <p className="text-sm text-gray-700">
                    Porzione del TAM coerente con i nostri canali/paesi iniziali
                  </p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">SOM (ottenibile)</h4>
                  <p className="text-sm text-gray-700">
                    Quota realistica nei primi anni
                  </p>
                </Card>
              </div>

              {/* Tabella principale */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Riepilogo dimensioni (TAM/SAM/SOM) — segmenti prioritari
                </h3>
                <p className="text-xs text-gray-500 mb-3 italic">
                  *Fonti interne: Eco3D_PP 31-5 (tabella TAM/SAM/SOM), &quot;Analisi del mercato potenziale di Eco 3D&quot; (doc. 1), 
                  &quot;Seconda Analisi TAM/SAM/SOM&quot; (doc. 27).
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <th className="px-3 py-2 text-left border border-blue-700">Area</th>
                        <th className="px-3 py-2 text-right border border-blue-700">TAM Tot (M)</th>
                        <th className="px-3 py-2 text-right border border-blue-700">SAM 50% (M)</th>
                        <th className="px-3 py-2 text-right border border-blue-700">SOM 1% (k)</th>
                        <th className="px-3 py-2 text-right border border-blue-700">SOM 3% (k)</th>
                        <th className="px-3 py-2 text-right border border-blue-700">SOM 5% (k)</th>
                        <th className="px-3 py-2 text-right border border-blue-700 bg-gradient-to-r from-green-600 to-green-700">
                          Valore SOM 3% @ €100 (M€)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-2 font-medium border">Italia</td>
                        <td className="px-3 py-2 text-right border">8.3</td>
                        <td className="px-3 py-2 text-right border">4.15</td>
                        <td className="px-3 py-2 text-right border">42</td>
                        <td className="px-3 py-2 text-right border font-semibold">124</td>
                        <td className="px-3 py-2 text-right border">208</td>
                        <td className="px-3 py-2 text-right font-bold text-green-600 border bg-green-50">12.4</td>
                      </tr>
                      <tr className="border-b hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-2 font-medium border">EU5</td>
                        <td className="px-3 py-2 text-right border">32.0</td>
                        <td className="px-3 py-2 text-right border">16.00</td>
                        <td className="px-3 py-2 text-right border">160</td>
                        <td className="px-3 py-2 text-right border font-semibold">480</td>
                        <td className="px-3 py-2 text-right border">800</td>
                        <td className="px-3 py-2 text-right font-bold text-green-600 border bg-green-50">48.0</td>
                      </tr>
                      <tr className="border-b hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-2 font-medium border">USA</td>
                        <td className="px-3 py-2 text-right border">23.5</td>
                        <td className="px-3 py-2 text-right border">11.75</td>
                        <td className="px-3 py-2 text-right border">118</td>
                        <td className="px-3 py-2 text-right border font-semibold">352</td>
                        <td className="px-3 py-2 text-right border">588</td>
                        <td className="px-3 py-2 text-right font-bold text-green-600 border bg-green-50">35.2</td>
                      </tr>
                      <tr className="bg-gradient-to-r from-purple-100 to-blue-100 font-bold">
                        <td className="px-3 py-2 border">Mondo*</td>
                        <td className="px-3 py-2 text-right border">63.8</td>
                        <td className="px-3 py-2 text-right border">31.90</td>
                        <td className="px-3 py-2 text-right border">319</td>
                        <td className="px-3 py-2 text-right border text-blue-700">957</td>
                        <td className="px-3 py-2 text-right border">1,595</td>
                        <td className="px-3 py-2 text-right text-green-700 border bg-green-100 text-lg">95.7</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  *Mondo: somma conservativa dei tre mercati citati. Valore calcolato a €100 per esame.
                </p>
              </div>

              {/* Sensitività prezzo */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-gray-800 mb-3">Sensitività prezzo — Valore SOM 3% @ €125/esame</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Italia</p>
                    <p className="text-xl font-bold text-green-600">€15.5M</p>
                    <p className="text-xs text-gray-500">124k esami</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">EU5</p>
                    <p className="text-xl font-bold text-green-600">€60.0M</p>
                    <p className="text-xs text-gray-500">480k esami</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">USA</p>
                    <p className="text-xl font-bold text-green-600">€44.0M</p>
                    <p className="text-xs text-gray-500">352k esami</p>
                  </div>
                  <div className="bg-white p-3 rounded border-2 border-green-400">
                    <p className="text-xs text-gray-600 mb-1">Mondo*</p>
                    <p className="text-2xl font-bold text-green-700">€119.6M</p>
                    <p className="text-xs text-gray-500">957k esami</p>
                  </div>
                </div>
              </div>

              {/* Assunzioni */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Assunzioni e note</h4>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>SAM = 50%</strong> del TAM per fase iniziale (canali/paesi selezionati)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>SOM</strong> mostrato per scenari <strong>1% / 3% / 5%</strong>. Lo scenario <strong>base</strong> usa <strong>3%</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Prezzo per esame</strong> per la valorizzazione: <strong>€100</strong> (base) e <strong>€125</strong> (sensitività)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Segmenti inclusi: <strong>Tiroide+Addome (T+A)</strong>, <strong>MSK</strong>, <strong>Senologia</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Le stime saranno riconciliate con le fonti volumetriche citate (AGENAS/OECD/WHO, report di mercato) e con i dati dei pilot</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Prossimi inserimenti */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>📋</span> Prossimi inserimenti (mercato)
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">→</span>
                    <span>Tabella dettagliata <strong>per segmento</strong> con: volume annuo, prezzo medio, fonti, ipotesi penetrazione (scenari basso/base/alto)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">→</span>
                    <span>Nota metodologica su come deriviamo <strong>SOM</strong> (conversioni funnel e capacità operativa), collegata al capitolo <strong>GTM</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Competizione & Posizionamento */}
        <section id="competizione">
          <Card className="p-8 border-l-4 border-l-orange-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">4</span>
              Competizione & Posizionamento
            </h2>

            <div className="space-y-6">
              <p className="text-sm text-gray-700 italic">
                <strong>Obiettivo:</strong> fotografare il landscape competitivo e chiarire <strong>dove Eco 3D vince/perde</strong> oggi 
                e nei prossimi 24 mesi, con una matrice 10×feature e una value curve orientata al &quot;blue ocean&quot; 
                (portabilità + volumetria + automazione).
              </p>

              {/* Matrice competitiva sintetica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Matrice competitiva (sintesi 7 feature chiave)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse bg-white rounded-lg">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                        <th className="px-2 py-2 text-left border border-orange-700">Player</th>
                        <th className="px-2 py-2 text-center border border-orange-700">3D/4D RT</th>
                        <th className="px-2 py-2 text-center border border-orange-700">AI guida</th>
                        <th className="px-2 py-2 text-center border border-orange-700">Multi-probe</th>
                        <th className="px-2 py-2 text-center border border-orange-700">Tempo (min)</th>
                        <th className="px-2 py-2 text-center border border-orange-700">Portabilità</th>
                        <th className="px-2 py-2 text-center border border-orange-700">TCO</th>
                        <th className="px-2 py-2 text-center border border-orange-700">Maturità</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-blue-50 font-semibold border-b-2 border-blue-300">
                        <td className="px-2 py-2 border text-blue-800">Eco 3D (noi)</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border font-bold text-green-600">≤5</td>
                        <td className="px-2 py-2 text-center border font-bold text-green-600">HH/Port</td>
                        <td className="px-2 py-2 text-center border text-green-600">€-€€</td>
                        <td className="px-2 py-2 text-center border text-orange-600">R&D</td>
                      </tr>
                      <tr className="hover:bg-gray-50 border-b">
                        <td className="px-2 py-2 border text-gray-700">GE Voluson/Vivid</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✖︎</td>
                        <td className="px-2 py-2 text-center border">10-20</td>
                        <td className="px-2 py-2 text-center border">Cart</td>
                        <td className="px-2 py-2 text-center border text-red-600">€€€</td>
                        <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                      </tr>
                      <tr className="hover:bg-gray-50 border-b">
                        <td className="px-2 py-2 border text-gray-700">Philips EPIQ/xMATRIX</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">✖︎</td>
                        <td className="px-2 py-2 text-center border">10-20</td>
                        <td className="px-2 py-2 text-center border">Cart/Port</td>
                        <td className="px-2 py-2 text-center border text-red-600">€€€</td>
                        <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                      </tr>
                      <tr className="hover:bg-gray-50 border-b">
                        <td className="px-2 py-2 border text-gray-700">GE ABUS (seno)</td>
                        <td className="px-2 py-2 text-center border">✔︎</td>
                        <td className="px-2 py-2 text-center border">◔</td>
                        <td className="px-2 py-2 text-center border">✖︎</td>
                        <td className="px-2 py-2 text-center border text-orange-600">15-20</td>
                        <td className="px-2 py-2 text-center border">Cart</td>
                        <td className="px-2 py-2 text-center border text-red-600">€€€</td>
                        <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                      </tr>
                      <tr className="hover:bg-gray-50 border-b">
                        <td className="px-2 py-2 border text-gray-700">Butterfly iQ</td>
                        <td className="px-2 py-2 text-center border text-red-600">✖︎</td>
                        <td className="px-2 py-2 text-center border">◔</td>
                        <td className="px-2 py-2 text-center border">✖︎</td>
                        <td className="px-2 py-2 text-center border text-green-600">2-5 (2D)</td>
                        <td className="px-2 py-2 text-center border font-bold text-green-600">HH</td>
                        <td className="px-2 py-2 text-center border text-green-600">€</td>
                        <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                      </tr>
                      <tr className="hover:bg-gray-50 border-b">
                        <td className="px-2 py-2 border text-gray-700">Clarius</td>
                        <td className="px-2 py-2 text-center border text-red-600">✖︎</td>
                        <td className="px-2 py-2 text-center border">◔</td>
                        <td className="px-2 py-2 text-center border">✖︎</td>
                        <td className="px-2 py-2 text-center border text-green-600">2-5 (2D)</td>
                        <td className="px-2 py-2 text-center border font-bold text-green-600">HH</td>
                        <td className="px-2 py-2 text-center border">€-€€</td>
                        <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Legenda: ✔︎ = sì/forte · ◔ = parziale/limitato · ✖︎ = assente · HH = handheld · Port = portatile · Cart = carrello
                </p>
              </div>

              {/* Value Curve */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Value curve (Blue-Ocean)</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-blue-300">
                          <th className="px-3 py-2 text-left">Asse di valore</th>
                          <th className="px-3 py-2 text-center text-blue-600">Eco 3D</th>
                          <th className="px-3 py-2 text-center text-gray-600">Console 3D</th>
                          <th className="px-3 py-2 text-center text-gray-600">ABUS/ABVS</th>
                          <th className="px-3 py-2 text-center text-gray-600">Handheld 2D</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-medium">Portabilità</td>
                          <td className="px-3 py-2 text-center text-green-600 font-bold">★★★★★</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆</td>
                          <td className="px-3 py-2 text-center">★☆☆☆☆</td>
                          <td className="px-3 py-2 text-center text-green-600">★★★★★</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-medium">Copertura anatomica</td>
                          <td className="px-3 py-2 text-center text-green-600 font-bold">★★★★★</td>
                          <td className="px-3 py-2 text-center text-green-600">★★★★★</td>
                          <td className="px-3 py-2 text-center">★☆☆☆☆</td>
                          <td className="px-3 py-2 text-center">★★★☆☆</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-medium">Tempo esame</td>
                          <td className="px-3 py-2 text-center text-green-600 font-bold">★★★★★ (≤5 min)</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆ (15-20)</td>
                          <td className="px-3 py-2 text-center text-green-600">★★★★☆</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-medium">Costo per esame</td>
                          <td className="px-3 py-2 text-center text-green-600 font-bold">★★★★☆ (€100-125)</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆</td>
                          <td className="px-3 py-2 text-center text-green-600">★★★★☆</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-medium">Automazione/AI</td>
                          <td className="px-3 py-2 text-center text-green-600 font-bold">★★★★☆</td>
                          <td className="px-3 py-2 text-center">★★★☆☆</td>
                          <td className="px-3 py-2 text-center">★★★★☆</td>
                          <td className="px-3 py-2 text-center">★★☆☆☆</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium">Qualità volumetrica</td>
                          <td className="px-3 py-2 text-center text-blue-600 font-bold">★★★★☆ (target)</td>
                          <td className="px-3 py-2 text-center text-green-600">★★★★★</td>
                          <td className="px-3 py-2 text-center">★★★★☆</td>
                          <td className="px-3 py-2 text-center">★☆☆☆☆</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800">
                      💡 Lettura rapida: I player attuali massimizzano <em>o</em> la portabilità (handheld 2D) <em>o</em> la volumetria 
                      (ABUS/ABVS/console). <strong>Nessuno unisce entrambi</strong> con automazione e costo per esame contenuto: 
                      è lo <strong className="text-blue-600">spazio Eco 3D</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Posizionamento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Posizionamento & messaggi chiave</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Tesi di differenziazione</h4>
                    <p className="text-xs text-gray-700 italic">
                      &quot;3D premium, portatile e guidato da AI, multi-distretto, in ≤5 minuti a dose zero.&quot;
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Moat tecnico</h4>
                    <p className="text-xs text-gray-700">
                      Sincronizzazione <strong>multi-sonda ToF/IMU</strong> + pipeline <strong>AI di fusione/super-risoluzione</strong> + 
                      robotica/guide per scansione standardizzata.
                    </p>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Claim clinico (progressivo)</h4>
                    <p className="text-xs text-gray-700">
                      <strong>Non-inferiorità vs 2D</strong> → equivalenza mirata a TC/RM su misure volumetriche → 
                      <strong>follow-up a dose zero</strong>
                    </p>
                  </Card>
                </div>
              </div>

              {/* Scoring ponderato */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.6 Scoring ponderato (0–3) — Risultati</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-400">
                    <p className="text-xs text-gray-600 mb-1">Eco 3D (target)</p>
                    <p className="text-3xl font-bold text-blue-600">2.70</p>
                    <p className="text-xs text-green-600 mt-1">🏆 Leader</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">Console 3D premium</p>
                    <p className="text-2xl font-bold text-gray-700">1.70</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">ABUS/ABVS (seno)</p>
                    <p className="text-2xl font-bold text-gray-700">1.40</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">Handheld 2D</p>
                    <p className="text-2xl font-bold text-gray-700">1.40</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3 italic">
                  *Score basato su 10 feature ponderate: 3D/4D volumetrico (15%), AI guida (10%), Multi-probe sync (10%), 
                  Automazione (10%), Tempo esame (15%), Multi-distretto (10%), Portabilità (10%), RIS/PACS (5%), TCO (10%), Maturità (5%)
                </p>
              </div>

              {/* Cosa dobbiamo dimostrare */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.5 Cosa dobbiamo dimostrare (per chiudere il posizionamento)</h3>
                <div className="space-y-2">
                  <Card className="p-3 bg-blue-50 border-l-4 border-l-blue-500">
                    <p className="text-sm text-gray-700">
                      <strong>1)</strong> <strong>Tempo ≤6 min</strong> per protocolli tiroide/addome/MSK con <strong>NPS ≥40</strong> nei pilot
                    </p>
                  </Card>
                  <Card className="p-3 bg-green-50 border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-700">
                      <strong>2)</strong> <strong>Riduzione invii TAC/RM −20~−40%</strong> in follow-up selezionati
                    </p>
                  </Card>
                  <Card className="p-3 bg-purple-50 border-l-4 border-l-purple-500">
                    <p className="text-sm text-gray-700">
                      <strong>3)</strong> <strong>Ripetibilità:</strong> CV volumetrico <strong>−30%</strong> vs 2D; 
                      concordanza con TC/RM su misure volumetriche (ICC ≈0,99)
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Modello di Business & Prezzi */}
        <section id="modello-business">
          <Card className="p-8 border-l-4 border-l-cyan-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 font-bold">5</span>
              Modello di Business & Prezzi
            </h2>

            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Obiettivo:</strong> definire l&apos;architettura dei ricavi (hardware + software/AI + servizi) 
                e una politica prezzi <strong>v0.1</strong> da validare con 3 scenari e con i pilot.
              </p>

              {/* Architettura ricavi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Architettura ricavi (panoramica)</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">💻 Hardware (CapEx)</h4>
                    <p className="text-xs text-gray-700">
                      Dispositivo Eco 3D. Opzioni: licenze 3D avanzate, modulo multi-sonda, kit robotica/guide.
                    </p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🔄 Software/AI (OpEx)</h4>
                    <p className="text-xs text-gray-700">
                      Licenze per dispositivo/sito (Basic/Pro/Enterprise). AI-guidance, analytics, aggiornamenti, SLA.
                    </p>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">📊 Pay-per-scan</h4>
                    <p className="text-xs text-gray-700">
                      Crediti/&quot;token&quot; di scansione (tier a scaglioni). Fair use per costi prevedibili.
                    </p>
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🛠️ Servizi</h4>
                    <p className="text-xs text-gray-700">
                      Installazione/integrazione IT, formazione, manutenzione estesa, fast-swap, reportistica HTA.
                    </p>
                  </Card>
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🤝 Partnership</h4>
                    <p className="text-xs text-gray-700">
                      Ricerca clinica co-finanziata, noleggio operativo con partner leasing.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Pacchetti */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Pacchetti v0.1 (indicativi)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                        <th className="px-3 py-2 text-left border">Pacchetto</th>
                        <th className="px-3 py-2 text-left border">Target</th>
                        <th className="px-3 py-2 text-left border">Contenuto</th>
                        <th className="px-3 py-2 text-right border">Canone/mese</th>
                        <th className="px-3 py-2 text-right border">CapEx alternativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-blue-50">
                        <td className="px-3 py-2 font-bold text-blue-600 border">Starter</td>
                        <td className="px-3 py-2 border text-xs">Reparti a basso volume / trial</td>
                        <td className="px-3 py-2 border text-xs">
                          1 device, SW Basic, 300 scan/mese, Service Bronze, formazione 1/2 giornata
                        </td>
                        <td className="px-3 py-2 text-right font-semibold border">€699</td>
                        <td className="px-3 py-2 text-right border text-xs">€22k + €2.4k/anno SW</td>
                      </tr>
                      <tr className="border-b hover:bg-blue-50">
                        <td className="px-3 py-2 font-bold text-purple-600 border">Pro</td>
                        <td className="px-3 py-2 border text-xs">Reparti medi</td>
                        <td className="px-3 py-2 border text-xs">
                          1 device, SW Pro, 800 scan/mese, Service Gold, formazione 1 gg, integrazione RIS/PACS
                        </td>
                        <td className="px-3 py-2 text-right font-semibold border">€1,290</td>
                        <td className="px-3 py-2 text-right border text-xs">€29k + €4.8k/anno SW</td>
                      </tr>
                      <tr className="border-b hover:bg-blue-50 bg-green-50">
                        <td className="px-3 py-2 font-bold text-green-600 border">Enterprise</td>
                        <td className="px-3 py-2 border text-xs">Multi-sito/alta intensità</td>
                        <td className="px-3 py-2 border text-xs">
                          3 devices, SW Enterprise, 3k scan/mese, Service Platinum, 2 gg on-site, report HTA
                        </td>
                        <td className="px-3 py-2 text-right font-semibold border">€3,490</td>
                        <td className="px-3 py-2 text-right border text-xs">€79k + €9.9k/anno SW</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p>• <strong>Pay-per-scan</strong> (oltre soglie): €4 → €2 per scan (scaglioni volume)</p>
                  <p>• <strong>Training extra:</strong> €900/mezzo-giorno on-site</p>
                  <p>• <strong>Service:</strong> Bronze (NBD remoto), Gold (NBD on-site), Platinum (sostituzione 48h + device cortesia)</p>
                </div>
              </div>

              {/* Politiche sconto */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.4 Politiche di prezzo & sconto</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">💰</span>
                    <span><strong>Early adopter</strong> (entro 6 mesi): −15% canone primo anno o +20% crediti scan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">📦</span>
                    <span><strong>Multi-device:</strong> −10% sul 2°/3° device; bundle Enterprise</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">🎓</span>
                    <span><strong>Accademico/ricerca:</strong> −20% su SW/Service con co-publishing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">🏛️</span>
                    <span><strong>Tender/centrali:</strong> sconti strutturati vs volumi minimi garantiti</span>
                  </div>
                </div>
              </div>

              {/* KPI economici */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.5 KPI economici (target)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Margine lordo HW</h4>
                    <p className="text-2xl font-bold text-green-600">45–55%</p>
                    <p className="text-xs text-gray-600">COGS incl. assemblaggio/test/logistica</p>
                  </Card>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Margine lordo SW/AI</h4>
                    <p className="text-2xl font-bold text-blue-600">≥80%</p>
                    <p className="text-xs text-gray-600">Personale remoto, aggiornamenti</p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Mix ricavi ricorrenti</h4>
                    <p className="text-2xl font-bold text-purple-600">≥40%</p>
                    <p className="text-xs text-gray-600">Del fatturato dal Y2</p>
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">LTV/CAC</h4>
                    <p className="text-2xl font-bold text-orange-600">≥3</p>
                    <p className="text-xs text-gray-600">Sostenibilità business</p>
                  </Card>
                  <Card className="p-4 bg-cyan-50 border-cyan-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Payback CAC</h4>
                    <p className="text-2xl font-bold text-cyan-600">≤12–18</p>
                    <p className="text-xs text-gray-600">Mesi per recuperare acquisizione</p>
                  </Card>
                  <Card className="p-4 bg-red-50 border-red-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Churn annuo</h4>
                    <p className="text-2xl font-bold text-red-600">&lt;8%</p>
                    <p className="text-xs text-gray-600">Retention &gt;92%</p>
                  </Card>
                </div>
              </div>

              {/* Unit economics esempio */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-lg border-2 border-cyan-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.6 Esempio unit economics (v0.1)</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded border border-cyan-200">
                    <p className="font-semibold text-gray-800 mb-1">Starter leasing €699/mese (300 scan inclusi)</p>
                    <ul className="text-xs text-gray-700 space-y-1 ml-4">
                      <li>• Costo per scan: <strong>€2,33</strong></li>
                      <li>• Con overage a €3/scan → prezzo medio €2,6–3,0/scan</li>
                      <li>• Costo variabile/scan: €0,60 (cloud, AI, storage)</li>
                      <li>• <strong className="text-green-600">Margine/scan: €2,0–2,4</strong></li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border border-cyan-200">
                    <p className="font-semibold text-gray-800 mb-1">Hardware CapEx €22k</p>
                    <ul className="text-xs text-gray-700 space-y-1 ml-4">
                      <li>• COGS ipotetico: €11–12k</li>
                      <li>• <strong className="text-green-600">Margine: €10–11k (45–50%)</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 6. Go-to-Market (24 mesi) */}
        <section id="go-to-market">
          <Card className="p-8 border-l-4 border-l-indigo-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">6</span>
              Go-to-Market (24 mesi)
            </h2>

            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-300">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Prerequisito regolatorio:</strong> Le attività commerciali partono <strong>dopo</strong> le approvazioni 
                  (USA: 510(k) atteso H2-2026; EU: CE successivo). Prima: KOL, studi, site evaluation e LOI.
                </p>
              </div>

              {/* Strategia & fasi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Strategia & fasi (24 mesi)</h3>
                <div className="space-y-2">
                  <Card className="p-3 bg-blue-50 border-l-4 border-l-blue-500">
                    <p className="text-sm"><strong>Mesi 0–6</strong> (Pre-clearance): KOL, 3–5 site evaluation EU/IT e 2–3 USA; materiali minimi, CRM</p>
                  </Card>
                  <Card className="p-3 bg-purple-50 border-l-4 border-l-purple-500">
                    <p className="text-sm"><strong>Mesi 7–12</strong> (Prime validazioni): pilot strutturati (6–12 sett) con KPI; case study; pre-negoziazioni</p>
                  </Card>
                  <Card className="p-3 bg-green-50 border-l-4 border-l-green-500">
                    <p className="text-sm"><strong>Mesi 13–18</strong> (Launch 1): prime vendite USA (post-510(k)), contratti subscription; EU ancora pilot/LOI</p>
                  </Card>
                  <Card className="p-3 bg-orange-50 border-l-4 border-l-orange-500">
                    <p className="text-sm"><strong>Mesi 19–24</strong> (Launch 2): espansione canali USA; preparazione go-to-market EU (post-CE) e primi tender</p>
                  </Card>
                </div>
              </div>

              {/* Funnel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Funnel definito (metriche target)</h3>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border-2 border-indigo-300">
                  <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">Lead</div>
                    </div>
                    <span className="text-2xl text-gray-400">→</span>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Demo</div>
                      <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">20%</Badge>
                    </div>
                    <span className="text-2xl text-gray-400">→</span>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">Pilot</div>
                      <Badge className="mt-1 bg-purple-100 text-purple-800 text-xs">50%</Badge>
                    </div>
                    <span className="text-2xl text-gray-400">→</span>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Deal</div>
                      <Badge className="mt-1 bg-green-100 text-green-800 text-xs">60%</Badge>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 font-semibold">
                    Conversione totale Lead→Deal: <span className="text-green-600 text-lg">≈6%</span>
                  </p>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  <Card className="p-3 bg-white border border-gray-200">
                    <h4 className="font-semibold text-sm mb-2">⏱️ Tempi medi</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Lead→Demo: ≤2 sett</li>
                      <li>• Demo→Pilot: ≤4 sett</li>
                      <li>• Pilot: 6–12 sett</li>
                      <li>• Procurement: 4–8 sett</li>
                    </ul>
                  </Card>
                  <Card className="p-3 bg-white border border-gray-200">
                    <h4 className="font-semibold text-sm mb-2">📊 KPI operativi</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Demo/mese per SCS: 10–12</li>
                      <li>• Pilot/mese per team: 3–4</li>
                      <li>• Deal/mese per team: 1–2</li>
                      <li>• CPL: €120–€250</li>
                    </ul>
                  </Card>
                </div>
              </div>

              {/* Piano trimestrale */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Piano trimestrale (scenario base)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <th className="px-3 py-2 text-left border">Trimestre</th>
                        <th className="px-3 py-2 text-right border">Leads</th>
                        <th className="px-3 py-2 text-right border">Demos (20%)</th>
                        <th className="px-3 py-2 text-right border">Pilots (50%)</th>
                        <th className="px-3 py-2 text-right border">Deals (60%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { q: 'Q1 (M1–3)', leads: 120, demos: 24, pilots: 12, deals: 6 },
                        { q: 'Q2 (M4–6)', leads: 150, demos: 30, pilots: 15, deals: 9 },
                        { q: 'Q3 (M7–9)', leads: 180, demos: 36, pilots: 18, deals: 11 },
                        { q: 'Q4 (M10–12)', leads: 220, demos: 44, pilots: 22, deals: 13 },
                        { q: 'Q5 (M13–15)', leads: 260, demos: 52, pilots: 26, deals: 16 },
                        { q: 'Q6 (M16–18)', leads: 300, demos: 60, pilots: 30, deals: 18 },
                        { q: 'Q7 (M19–21)', leads: 350, demos: 70, pilots: 35, deals: 21 },
                        { q: 'Q8 (M22–24)', leads: 400, demos: 80, pilots: 40, deals: 24 },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-indigo-50">
                          <td className="px-3 py-2 font-medium border">{row.q}</td>
                          <td className="px-3 py-2 text-right border">{row.leads}</td>
                          <td className="px-3 py-2 text-right border">{row.demos}</td>
                          <td className="px-3 py-2 text-right border">{row.pilots}</td>
                          <td className="px-3 py-2 text-right font-bold text-green-600 border">{row.deals}</td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 font-bold">
                        <td className="px-3 py-2 border" colSpan={4}>Totale 24 mesi</td>
                        <td className="px-3 py-2 text-right text-green-600 border text-lg">118 deals</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Mix pacchetti</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Starter: <strong>50%</strong></li>
                      <li>• Pro: <strong>40%</strong></li>
                      <li>• Enterprise: <strong>10%</strong></li>
                    </ul>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">ARPA medio (annuo)</h4>
                    <p className="text-2xl font-bold text-purple-600">€14.6k</p>
                    <p className="text-xs text-gray-600">Per account subscription</p>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">ARR run-rate M24</h4>
                    <p className="text-2xl font-bold text-green-600">€1.72M</p>
                    <p className="text-xs text-gray-600">118 × €14.6k (indicativo)</p>
                  </Card>
                </div>
              </div>

              {/* Sales capacity */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.4 Sales capacity & organizzazione</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">👥 Team</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>M1:</strong> 2 Sales Clinical Specialist</li>
                      <li>• <strong>M9:</strong> 4 SCS</li>
                      <li>• <strong>M12:</strong> 1 Head of Sales</li>
                      <li>• <strong>M18:</strong> 6 SCS</li>
                      <li>• 1 Application Specialist ogni 3 pilot attivi</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🎯 Metriche di capacità (per SCS)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 10–12 demo/mese (steady-state)</li>
                      <li>• 3–4 pilot/mese</li>
                      <li>• 1–2 deal/mese</li>
                      <li>• <strong>Marketing:</strong> 2–3 fiere/trim, 1 webinar/mese</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SOM operativo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.6 Metodo SOM operativo (dal funnel alla quota)</h3>
                <Card className="p-4 bg-green-50 border-2 border-green-300">
                  <div className="space-y-2 text-sm">
                    <p><strong>1) Deals → dispositivi:</strong> Devices = 118 × 1.2 = <strong className="text-green-600">142</strong></p>
                    <p><strong>2) Capacità scansioni:</strong> 142 × 640 scan/device/mese = <strong className="text-green-600">90,880 scan/mese</strong></p>
                    <p><strong>3) Scans/anno:</strong> 90,880 × 12 = <strong className="text-green-600">1.09M scans/anno</strong></p>
                    <p><strong>4) Quota SOM:</strong> 1.09M / 31.9M (SAM) = <strong className="text-green-600 text-lg">3.4%</strong></p>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    *Coerente con lo scenario base 3% della tabella mercato
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
