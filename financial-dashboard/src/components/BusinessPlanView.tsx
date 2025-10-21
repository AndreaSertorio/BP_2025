'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { FileText, Target, CheckCircle2, XCircle, Users, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { BusinessPlanMercatoSection } from './BusinessPlan/BusinessPlanMercatoSection';
import { BusinessPlanRevenueModelSection } from './BusinessPlan/BusinessPlanRevenueModelSection';
import { BusinessPlanRegolatorioSection } from './BusinessPlan/BusinessPlanRegolatorioSection';
import { ValuePropositionBusinessPlanSection } from './BusinessPlan/ValuePropositionBusinessPlanSection';
import { BusinessPlanCompetitionSection } from './BusinessPlan/BusinessPlanCompetitionSection';

export function BusinessPlanView() {
  const { data, updateBusinessPlanProgress } = useDatabase();
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  const [editingProgress, setEditingProgress] = useState<{ id: string; value: string } | null>(null);

  // Inizializza tutte le sezioni come collassate e carica da localStorage
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('businessPlanCollapsedSections');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Default: tutte le sezioni collassate
    return {
      'executive-summary': true,
      'proposta-valore': true,
      'mercato': true,
      'competizione': true,
      'modello-business': true,
      'gtm': true,
      'regolatorio': true,
      'roadmap-prodotto': true,
      'operazioni': true,
      'team': true,
      'rischi': true,
      'piano-finanziario': true,
      'ask': true
    };
  });

  // Salva stato in localStorage quando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('businessPlanCollapsedSections', JSON.stringify(collapsedSections));
    }
  }, [collapsedSections]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Carica progress da database
  const sectionProgress = data?.businessPlan?.sectionProgress || {};

  // Debug: Log quando sectionProgress cambia
  useEffect(() => {
    console.log('📊 BusinessPlanView - sectionProgress aggiornato:', sectionProgress);
  }, [sectionProgress]);

  // Calcola media progress
  const averageProgress = useMemo(() => {
    const values = Object.values(sectionProgress);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }, [sectionProgress]);

  const sections = [
    { id: 'executive-summary', name: '1. Executive Summary', color: 'bg-blue-600' },
    { id: 'proposta-valore', name: '2. Proposta di Valore', color: 'bg-green-600' },
    { id: 'mercato', name: '3. Mercato TAM/SAM/SOM', color: 'bg-purple-600' },
    { id: 'competizione', name: '4. Competizione', color: 'bg-orange-600' },
    { id: 'modello-business', name: '5. Modello Business', color: 'bg-cyan-600' },
    { id: 'gtm', name: '6. Go-to-Market', color: 'bg-indigo-600' },
    { id: 'regolatorio', name: '7. Regolatorio', color: 'bg-red-600' },
    { id: 'roadmap-prodotto', name: '8. Roadmap Prodotto', color: 'bg-teal-600' },
    { id: 'operazioni', name: '9. Operazioni', color: 'bg-lime-600' },
    { id: 'team', name: '10. Team', color: 'bg-pink-600' },
    { id: 'rischi', name: '11. Rischi', color: 'bg-amber-600' },
    { id: 'piano-finanziario', name: '12. Piano Finanziario', color: 'bg-emerald-600' },
  ];

  return (
    <div className="relative">
      {/* Sidebar Navigation */}
      <div className="fixed left-4 top-32 w-56 h-[calc(100vh-140px)] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 hidden xl:block z-10">
        <h3 className="text-sm font-bold text-gray-900 mb-3">📑 Navigazione</h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${section.color}`} />
                {section.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl xl:ml-64">
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

      {/* Tracker Progress - MODIFICABILE ✏️ */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Tracker stato BP — Iterazione #17
          </h2>
          <div className="flex gap-2">
            <div className="text-sm font-semibold text-blue-700 bg-white px-3 py-1 rounded-full border-2 border-blue-400">
              {sections.filter(s => collapsedSections[s.id] === false).length} / {sections.length} espanse
            </div>
            <div className="text-sm font-semibold text-green-700 bg-white px-3 py-1 rounded-full border-2 border-green-400">
              {averageProgress}% completato
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sections.map((section, idx) => {
            const progress = sectionProgress[section.id] || 0;
            const isEditing = editingProgress?.id === section.id;
            
            return (
              <div key={section.id} className="text-sm">
                <div className="flex justify-between mb-1">
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className="font-medium text-gray-700 text-xs truncate hover:text-blue-600 transition-colors"
                  >
                    {idx + 1}. {section.name.split('. ')[1]}
                  </button>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingProgress.value}
                      onChange={(e) => setEditingProgress({ id: section.id, value: e.target.value })}
                      onBlur={async () => {
                        const newProgress = parseInt(editingProgress.value);
                        console.log('📊 Blur - Tentativo salvataggio:', { sectionId: section.id, newProgress, isValid: !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100 });
                        if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                          try {
                            await updateBusinessPlanProgress(section.id, newProgress);
                            console.log('✅ Progress salvato con successo:', section.id, '→', newProgress);
                          } catch (error) {
                            console.error('❌ Errore salvataggio progress:', error);
                          }
                        }
                        setEditingProgress(null);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const newProgress = parseInt(editingProgress.value);
                          console.log('📊 Enter - Tentativo salvataggio:', { sectionId: section.id, newProgress, isValid: !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100 });
                          if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                            try {
                              await updateBusinessPlanProgress(section.id, newProgress);
                              console.log('✅ Progress salvato con successo:', section.id, '→', newProgress);
                            } catch (error) {
                              console.error('❌ Errore salvataggio progress:', error);
                            }
                          }
                          setEditingProgress(null);
                        } else if (e.key === 'Escape') {
                          console.log('🚫 Escape - Annullato salvataggio');
                          setEditingProgress(null);
                        }
                      }}
                      className="w-12 px-1 py-0.5 text-xs font-bold border-2 border-blue-500 rounded text-center"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setEditingProgress({ id: section.id, value: progress.toString() })}
                      className={`font-bold text-xs ml-2 hover:underline ${
                        progress >= 85 ? 'text-green-600' : 
                        progress >= 70 ? 'text-blue-600' : 'text-yellow-600'
                      }`}
                      title="Click per modificare"
                    >
                      {progress}%
                    </button>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:h-3 transition-all">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      progress >= 85 ? 'bg-green-500' : 
                      progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>≥85% Completato ({Object.values(sectionProgress).filter(p => p >= 85).length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>70-84% In Progress ({Object.values(sectionProgress).filter(p => p >= 70 && p < 85).length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>&lt;70% Da Rivedere ({Object.values(sectionProgress).filter(p => p < 70).length})</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              ✏️ Click sulla percentuale per modificare
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        {/* 1. Executive Summary */}
        <section id="executive-summary">
          <Card className="p-8 border-l-4 border-l-blue-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">1</span>
                Executive Summary
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('executive-summary')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['executive-summary'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['executive-summary'] && (
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
            )}
          </Card>
        </section>

        {/* 2. Proposta di Valore */}
        <section id="proposta-valore">
          <Card className="p-8 border-l-4 border-l-green-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">2</span>
                Proposta di Valore
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('proposta-valore')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['proposta-valore'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['proposta-valore'] && (
            <div className="space-y-6">
              <ValuePropositionBusinessPlanSection />
            </div>
            )}
          </Card>
        </section>

        {/* 3. Mercato (TAM/SAM/SOM) - DATI DINAMICI */}
        <section id="mercato">
          <BusinessPlanMercatoSection 
            isCollapsed={collapsedSections['mercato']}
            onToggle={() => toggleSection('mercato')}
          />
        </section>

        {/* 4. Competizione & Posizionamento */}
        <section id="competizione">
          <Card className="p-8 border-l-4 border-l-orange-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">4</span>
                Competizione & Posizionamento
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('competizione')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['competizione'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['competizione'] && (
              <BusinessPlanCompetitionSection />
            )}
          </Card>
        </section>

        {/* 5. Modello di Business & Prezzi */}
        <section id="modello-business">
          <Card className="p-8 border-l-4 border-l-cyan-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 font-bold">5</span>
                Modello di Business & Prezzi
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('modello-business')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['modello-business'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['modello-business'] && (
              <div className="mt-6">
                <BusinessPlanRevenueModelSection
                  isCollapsed={false}
                  onToggle={() => toggleSection('modello-business')}
                />
              </div>
            )}
          </Card>
        </section>

        {/* 6. Go-to-Market (24 mesi) */}
        <section id="gtm">
          <Card className="p-8 border-l-4 border-l-indigo-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">6</span>
                Go-to-Market (24 mesi)
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('gtm')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['gtm'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['gtm'] && (
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
            )}
          </Card>
        </section>

        {/* 7. Regolatorio & Clinico - PERSONALIZZABILE */}
        <section id="regolatorio">
          <BusinessPlanRegolatorioSection 
            isCollapsed={collapsedSections['regolatorio']}
            onToggle={() => toggleSection('regolatorio')}
          />
        </section>

        {/* 8. Roadmap Prodotto & Industrializzazione */}
        <section id="roadmap-prodotto">
          <Card className="p-8 border-l-4 border-l-teal-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-600 font-bold">8</span>
                Roadmap Prodotto & Industrializzazione
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('roadmap-prodotto')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['roadmap-prodotto'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['roadmap-prodotto'] && (
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Obiettivo:</strong> legare test/validazioni e capacità produttiva al GTM e alle milestone regolatorie, 
                con criteri di &quot;gate&quot; chiari.
              </p>

              {/* Architettura prodotto */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 Architettura di prodotto (sintesi)</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">📡 Sonde & acquisizione</h4>
                    <p className="text-xs text-gray-700">
                      Array lineare/convex/phased; opzione pMUT medio termine; 
                      <strong>sincronizzazione multi-sonda</strong> con IMU/ToF
                    </p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">⚡ Elaborazione</h4>
                    <p className="text-xs text-gray-700">
                      Modulo edge (GPU/NPU) per <strong>3D/4D real-time</strong> e <strong>AI guidance</strong>; 
                      compressione loss-aware; buffer sicuri
                    </p>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">💻 Software</h4>
                    <p className="text-xs text-gray-700">
                      Pipeline 3D, fusione/mosaico, volumetria, export DICOM; telemetria e aggiornamenti sicuri (OTA)
                    </p>
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">🔗 Integrazione</h4>
                    <p className="text-xs text-gray-700">
                      RIS/PACS via DICOM; API per workflow ospedaliero; policy privacy/security
                    </p>
                  </Card>
                </div>
              </div>

              {/* Gating criteria */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-lg border-2 border-teal-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 Fasi & &quot;gating criteria&quot;</h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border border-teal-200">
                    <p className="font-bold text-sm text-teal-700 mb-1">EVT (Engineering Validation Test)</p>
                    <p className="text-xs text-gray-700">
                      <strong>Gate:</strong> qualità immagine ≥ soglia, ≥3 vol/s 3D, MI/TI entro limiti; 
                      stabilità termica; protocolli per distretto v0.1
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-cyan-200">
                    <p className="font-bold text-sm text-cyan-700 mb-1">DVT (Design Validation Test)</p>
                    <p className="text-xs text-gray-700">
                      <strong>Gate:</strong> pre-compliance 60601/EMC/-2-37 ok; usabilità 62366 (summative) pass; 
                      BOM congelata; readiness clinica pilot
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="font-bold text-sm text-green-700 mb-1">PVT (Production Validation Test)</p>
                    <p className="text-xs text-gray-700">
                      <strong>Gate:</strong> yield ≥90%, tempo test ≤20&apos;/unità, tracciabilità lotti, 
                      packaging/UDI, IFU finali
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline tecnica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3 Timeline tecnica (2025–2028)</h3>
                <div className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-blue-600 text-white text-xs">2025 Q4</Badge>
                    <p className="text-sm text-gray-700">EVT build #1 (10 unità) per bench/usabilità</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-purple-600 text-white text-xs">2026 Q1</Badge>
                    <p className="text-sm text-gray-700">EVT build #2 (15 unità) per pre-compliance; congelamento spec v1</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-purple-600 text-white text-xs">2026 Q2-Q3</Badge>
                    <p className="text-sm text-gray-700">DVT: test conformità completi, V&V SW, usabilità</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-purple-600 text-white text-xs">2026 Q4</Badge>
                    <p className="text-sm text-gray-700">PVT (25–30 unità) e readiness produzione lancio USA</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-green-600 text-white text-xs">2027 Q1-Q2</Badge>
                    <p className="text-sm text-gray-700">Pre-serie pilot EU/IT (50–60 unità cumul.); validazioni IQ/OQ/PQ</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-green-600 text-white text-xs">2027 Q3-Q4</Badge>
                    <p className="text-sm text-gray-700">Rampa controllata (60–70 u/trim); dati affidabilità</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge className="bg-orange-600 text-white text-xs">2028 Q1</Badge>
                    <p className="text-sm text-gray-700">Rampa EU post-CE (80–100 u/trim) con second source attivi</p>
                  </div>
                </div>
              </div>

              {/* Capacità vs spedizioni */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.4 Capacità vs. spedizioni (link al GTM)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                        <th className="px-3 py-2 text-left border">Trimestre</th>
                        <th className="px-3 py-2 text-right border">Capacità (u)</th>
                        <th className="px-3 py-2 text-right border">Spedizioni (u)</th>
                        <th className="px-3 py-2 text-right border">Cumul. (u)</th>
                        <th className="px-3 py-2 text-right border">Yield target</th>
                        <th className="px-3 py-2 text-right border">Stazioni test</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { q: 'Q1 (M1–3)', cap: 10, ship: 7, cum: 7, yield: '0.80', stations: 1 },
                        { q: 'Q2 (M4–6)', cap: 15, ship: 11, cum: 18, yield: '0.85', stations: 1 },
                        { q: 'Q3 (M7–9)', cap: 18, ship: 13, cum: 31, yield: '0.88', stations: 1 },
                        { q: 'Q4 (M10–12)', cap: 20, ship: 16, cum: 47, yield: '0.90', stations: 2 },
                        { q: 'Q5 (M13–15)', cap: 24, ship: 19, cum: 66, yield: '0.91', stations: 2 },
                        { q: 'Q6 (M16–18)', cap: 27, ship: 22, cum: 88, yield: '0.92', stations: 2 },
                        { q: 'Q7 (M19–21)', cap: 30, ship: 25, cum: 113, yield: '0.93', stations: 3 },
                        { q: 'Q8 (M22–24)', cap: 34, ship: 29, cum: 142, yield: '0.94', stations: 3 },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-teal-50">
                          <td className="px-3 py-2 font-medium border">{row.q}</td>
                          <td className="px-3 py-2 text-right border">{row.cap}</td>
                          <td className="px-3 py-2 text-right font-semibold text-teal-600 border">{row.ship}</td>
                          <td className="px-3 py-2 text-right border">{row.cum}</td>
                          <td className="px-3 py-2 text-right border">{row.yield}</td>
                          <td className="px-3 py-2 text-right border">{row.stations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Coerenza con SOM: <strong>142 device</strong> attivi a M24 ⇒ ~1,09M scans/anno ⇒ <strong>SOM ≈ 3–3,5%</strong> su SAM 31,9M
                </p>
              </div>

              {/* DFM & COGS */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">🔧 DFM/DFA & sourcing</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Riduzione parti/fasteners; moduli sostituibili</li>
                    <li>• Componenti critici: trasduttori, ASIC, GPU/NPU, display</li>
                    <li>• <strong>Second source</strong> e LTB; mappa MOQ/lead time</li>
                    <li>• EMS/ODM: shortlist 2 partner (Italia/EU)</li>
                  </ul>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">💰 Target COGS</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">COGS v1:</p>
                      <p className="text-2xl font-bold text-orange-600">€11–12k</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Cost-down Y3 (VA/VE):</p>
                      <p className="text-2xl font-bold text-green-600">€9–10k</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Qualità & affidabilità */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.6 Qualità processo & collaudi</h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-blue-700 mb-1">Incoming</p>
                    <p className="text-xs text-gray-700">AQL componenti critici; test elettrico sonde; tracciabilità lotti</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 mb-1">In-process</p>
                    <p className="text-xs text-gray-700">Autotest, calibrazione IMU/ToF, verifica leak, calibrazione acustica</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 mb-1">Finale</p>
                    <p className="text-xs text-gray-700">Test funzionale completo (≤20&apos;), burn-in 2–4h, report DICOM prova</p>
                  </div>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-blue-200">
                    <strong>RMA target Y1:</strong> <span className="text-blue-600 font-bold">≤3%</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-200">
                    <strong>MTBF:</strong> <span className="text-blue-600 font-bold">≥5,000h</span>
                  </div>
                </div>
              </div>
            </div>
            )}
          </Card>
        </section>

        {/* 9. Operazioni & Supply Chain */}
        <section id="operazioni">
          <Card className="p-8 border-l-4 border-l-lime-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-100 text-lime-600 font-bold">9</span>
                Operazioni & Supply Chain
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('operazioni')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['operazioni'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['operazioni'] && (
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Obiettivo:</strong> garantire continuità di fornitura, qualità <strong>ISO 13485-compliant</strong> 
                e service efficiente.
              </p>

              {/* Field Service SLA */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.6 Field Service & SLA</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-lime-600 to-green-600 text-white">
                        <th className="px-3 py-2 text-left border">Piano</th>
                        <th className="px-3 py-2 text-left border">Copertura</th>
                        <th className="px-3 py-2 text-left border">Risposta</th>
                        <th className="px-3 py-2 text-left border">Risoluzione</th>
                        <th className="px-3 py-2 text-left border">Sostituzione</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-lime-50">
                        <td className="px-3 py-2 font-bold text-blue-600 border">Bronze</td>
                        <td className="px-3 py-2 border text-xs">5×8</td>
                        <td className="px-3 py-2 border text-xs">NBD remoto</td>
                        <td className="px-3 py-2 border text-xs">3 g lav.</td>
                        <td className="px-3 py-2 border text-xs">Loaner su disponibilità</td>
                      </tr>
                      <tr className="border-b hover:bg-lime-50">
                        <td className="px-3 py-2 font-bold text-purple-600 border">Gold</td>
                        <td className="px-3 py-2 border text-xs">5×8</td>
                        <td className="px-3 py-2 border text-xs">NBD on-site</td>
                        <td className="px-3 py-2 border text-xs">2 g lav.</td>
                        <td className="px-3 py-2 border text-xs">Loaner garantito</td>
                      </tr>
                      <tr className="border-b hover:bg-lime-50 bg-green-50">
                        <td className="px-3 py-2 font-bold text-green-600 border">Platinum</td>
                        <td className="px-3 py-2 border text-xs">7×12</td>
                        <td className="px-3 py-2 border text-xs">&lt;4h triage</td>
                        <td className="px-3 py-2 border text-xs">48h swap</td>
                        <td className="px-3 py-2 border text-xs">Device cortesia garantito</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KPI operativi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.8 KPI operativi</h3>
                <div className="grid md:grid-cols-4 gap-2">
                  <Card className="p-3 bg-blue-50 border-blue-200">
                    <p className="text-xs text-gray-600">OTD</p>
                    <p className="text-xl font-bold text-blue-600">≥95%</p>
                  </Card>
                  <Card className="p-3 bg-purple-50 border-purple-200">
                    <p className="text-xs text-gray-600">DPPM inbound</p>
                    <p className="text-xl font-bold text-purple-600">&lt;500</p>
                  </Card>
                  <Card className="p-3 bg-green-50 border-green-200">
                    <p className="text-xs text-gray-600">FPY</p>
                    <p className="text-xl font-bold text-green-600">≥95%</p>
                  </Card>
                  <Card className="p-3 bg-orange-50 border-orange-200">
                    <p className="text-xs text-gray-600">RMA Y1</p>
                    <p className="text-xl font-bold text-orange-600">≤3%</p>
                  </Card>
                  <Card className="p-3 bg-cyan-50 border-cyan-200">
                    <p className="text-xs text-gray-600">FTF</p>
                    <p className="text-xl font-bold text-cyan-600">≥80%</p>
                  </Card>
                  <Card className="p-3 bg-red-50 border-red-200">
                    <p className="text-xs text-gray-600">MTTR</p>
                    <p className="text-xl font-bold text-red-600">≤48h</p>
                  </Card>
                  <Card className="p-3 bg-teal-50 border-teal-200">
                    <p className="text-xs text-gray-600">SLA compliance</p>
                    <p className="text-xl font-bold text-teal-600">≥95%</p>
                  </Card>
                  <Card className="p-3 bg-indigo-50 border-indigo-200">
                    <p className="text-xs text-gray-600">Inventory turns</p>
                    <p className="text-xl font-bold text-indigo-600">≥4</p>
                  </Card>
                </div>
              </div>

              {/* Scorte */}
              <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.4 Scorte, sicurezza & ricambi</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-lime-700 mb-1">Spare pool dispositivi</p>
                    <p className="text-xs text-gray-700">8–10% dell&apos;installato. Con 142 device a M24 ⇒ ~12–15 unità</p>
                  </div>
                  <div>
                    <p className="font-semibold text-lime-700 mb-1">Safety Stock (SS)</p>
                    <p className="text-xs text-gray-700">Z=1,65 (95%) per critici A; livello servizio 95% (A), 90% (B), 85% (C)</p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </Card>
        </section>

        {/* 10. Team & Governance */}
        <section id="team">
          <Card className="p-8 border-l-4 border-l-pink-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-bold">10</span>
                Team & Governance
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('team')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['team'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['team'] && (
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Obiettivo:</strong> definire cosa serve per eseguire il piano e come governare qualità/regolatorio, vendite e produzione.
              </p>

              {/* Piano assunzioni */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.4 Piano assunzioni (scenario base)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                        <th className="px-3 py-2 text-left border">Periodo</th>
                        <th className="px-3 py-2 text-right border">FTE totali</th>
                        <th className="px-3 py-2 text-left border">Aggiunte chiave</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-pink-50">
                        <td className="px-3 py-2 font-medium border">M0–M6</td>
                        <td className="px-3 py-2 text-right border">8–10</td>
                        <td className="px-3 py-2 border text-xs">Reg. Lead, QA Manager, HW Lead, SW/AI Lead, PM, 2 Eng, 1 SCS</td>
                      </tr>
                      <tr className="border-b hover:bg-pink-50">
                        <td className="px-3 py-2 font-medium border">M7–M12</td>
                        <td className="px-3 py-2 text-right border">12–15</td>
                        <td className="px-3 py-2 border text-xs">+2 SCS (tot 3), Head of Sales, App. Specialist, Field Service Lead, Ops/SCM</td>
                      </tr>
                      <tr className="border-b hover:bg-pink-50">
                        <td className="px-3 py-2 font-medium border">M13–M18</td>
                        <td className="px-3 py-2 text-right border">18–22</td>
                        <td className="px-3 py-2 border text-xs">+3 SCS (tot 6), +1 App. Specialist, +1 Eng, +1 QA SW</td>
                      </tr>
                      <tr className="border-b hover:bg-pink-50 bg-purple-50">
                        <td className="px-3 py-2 font-medium border">M19–M24</td>
                        <td className="px-3 py-2 text-right border">22–26</td>
                        <td className="px-3 py-2 border text-xs">+2 Field Service, Marketing, Finance (fraz.), Tech Writer/Doc Control</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ruoli chiave */}
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.3 Ruoli chiave & KPI</h3>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-pink-200">
                    <p className="font-semibold text-pink-700">Regulatory Lead</p>
                    <p className="text-gray-600">510(k) H2-2026; CE Q1-2028 | Pre-Sub on-time; dossier first-pass</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-pink-200">
                    <p className="font-semibold text-pink-700">QA Manager</p>
                    <p className="text-gray-600">QMS ISO 13485 operativo | Audit pass; CAPA ≤30gg; FPY ≥95%</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-pink-200">
                    <p className="font-semibold text-pink-700">Head of Sales</p>
                    <p className="text-gray-600">Conversioni funnel & ARR | Lead→Deal ≥6%; ARPA; forecast accuracy</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-pink-200">
                    <p className="font-semibold text-pink-700">SCS (Sales Clinical Specialist)</p>
                    <p className="text-gray-600">Demo/Pilot/Deal | 10–12 demo/mese; 3–4 pilot/mese; 1–2 deal/mese</p>
                  </div>
                </div>
              </div>

              {/* Governance & Comp */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">📅 Rituali</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong>Board</strong> mensile (90&apos;): KPI, rischi, cash runway</li>
                    <li>• <strong>Clinical Advisory</strong> trimestrale: protocolli, priorità</li>
                    <li>• <strong>Design Review</strong> ai gate EVT/DVT/PVT</li>
                    <li>• <strong>S&OP</strong> mensile: domanda/offerta/cassa</li>
                  </ul>
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">💰 Comp & incentivi</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• <strong>ESOP pool:</strong> 10–15% (vesting 4 anni, 1 anno cliff)</li>
                    <li>• <strong>SCS OTE:</strong> €55–75k (base+variabile)</li>
                    <li>• <strong>Head of Sales:</strong> €90–120k + bonus</li>
                    <li>• <strong>Engineering senior:</strong> €65–90k base + MBO 10–15%</li>
                  </ul>
                </Card>
              </div>
            </div>
            )}
          </Card>
        </section>

        {/* 11. Rischi & Mitigazioni */}
        <section id="rischi">
          <Card className="p-8 border-l-4 border-l-amber-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 font-bold">11</span>
                Rischi & Mitigazioni
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('rischi')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['rischi'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['rischi'] && (
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Metodo:</strong> Scala P×I (1–5 ciascuno). Semaforo: 🟢 ≤6 | 🟡 8–12 | 🔴 ≥15
              </p>

              {/* Top 5 Rischi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.1 Top 5 Rischi</h3>
                <div className="space-y-2">
                  <Card className="p-4 bg-red-50 border-l-4 border-l-red-600">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800">1. 510(k) in ritardo o dati aggiuntivi</h4>
                      <Badge className="bg-red-600 text-white text-xs">🔴 P3×I5 = 15</Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2"><strong>Trigger:</strong> Feedback Pre-Sub; RTA/deficiency letter</p>
                    <p className="text-xs text-gray-700"><strong>Mitigazioni:</strong> Pre-Sub robusta; predicate chiaro; pre-test lab; consulente FDA; buffer 3–6 mesi</p>
                  </Card>

                  <Card className="p-4 bg-red-50 border-l-4 border-l-red-600">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800">2. Shortage trasduttori/ASIC/GPU</h4>
                      <Badge className="bg-red-600 text-white text-xs">🔴 P4×I4 = 16</Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2"><strong>Trigger:</strong> Lead time in aumento; PCN fornitori</p>
                    <p className="text-xs text-gray-700"><strong>Mitigazioni:</strong> Dual-source; contratti quadro; safety stock 60–90gg; broker componenti</p>
                  </Card>

                  <Card className="p-4 bg-red-50 border-l-4 border-l-red-600">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800">3. Runway &lt; 9 mesi / round in ritardo</h4>
                      <Badge className="bg-red-600 text-white text-xs">🔴 P3×I5 = 15</Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2"><strong>Trigger:</strong> Burn ↑; ricavi ↓; slittamento milestone</p>
                    <p className="text-xs text-gray-700"><strong>Mitigazioni:</strong> Bridge pianificato; tranche milestone-based; riduzione OPEX variabili</p>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-l-4 border-l-yellow-600">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800">4. Fail 60601/EMC/-2-37 in test</h4>
                      <Badge className="bg-yellow-600 text-white text-xs">🟡 P3×I4 = 12</Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2"><strong>Trigger:</strong> Pre-compliance negativa; surriscaldamento</p>
                    <p className="text-xs text-gray-700"><strong>Mitigazioni:</strong> Pre-compliance iterativa; redesign termico; 2 laboratori prenotati</p>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-l-4 border-l-yellow-600">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800">5. Conversioni funnel &lt; target</h4>
                      <Badge className="bg-yellow-600 text-white text-xs">🟡 P3×I4 = 12</Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2"><strong>Trigger:</strong> Demo/pilot sotto ritmo; cycle time ↑</p>
                    <p className="text-xs text-gray-700"><strong>Mitigazioni:</strong> Playbook demo-pilot; revisione pricing; focus segmenti top</p>
                  </Card>
                </div>
              </div>

              {/* Early warning */}
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.2 Early-warning dashboard (soglie)</h3>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <div>⚠️ <strong>Regolatorio:</strong> tempo risposta FDA/NB &gt;30gg</div>
                  <div>⚠️ <strong>Testing:</strong> fail pre-compliance &gt;1 volta/modulo</div>
                  <div>⚠️ <strong>Clinico:</strong> completamento pilot &lt;85%; NPS &lt;30</div>
                  <div>⚠️ <strong>Supply:</strong> lead time trasduttori &gt;20 sett</div>
                  <div>⚠️ <strong>Vendite:</strong> Demo/mese &lt;8; Pilot→Deal &lt;45%</div>
                  <div>⚠️ <strong>Service:</strong> FTF &lt;80%; MTTR &gt;48h; RMA &gt;3%</div>
                  <div>⚠️ <strong>Finanza:</strong> runway &lt;9 mesi; burn ↑ &gt;15% vs piano</div>
                  <div>⚠️ <strong>Cyber:</strong> CVSS≥9 non patchate &gt;7gg</div>
                </div>
              </div>
            </div>
            )}
          </Card>
        </section>

        {/* 12. Piano Finanziario (3-5 anni) */}
        <section id="piano-finanziario">
          <Card className="p-8 border-l-4 border-l-emerald-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold">12</span>
                Piano Finanziario (3–5 anni)
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('piano-finanziario')}
                className="text-gray-500 hover:text-gray-700"
              >
                {collapsedSections['piano-finanziario'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>

            {!collapsedSections['piano-finanziario'] && (
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                <strong>Obiettivo:</strong> proiezione a 5 anni (scenari Prudente/Base/Ambizioso) coerente con GTM, industrializzazione e regolatorio.
              </p>

              {/* P&L sintetico scenario Base */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.3 Scenario Base — P&L sintetico (M€)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                        <th className="px-3 py-2 text-left border">Voce</th>
                        <th className="px-3 py-2 text-right border">Y1</th>
                        <th className="px-3 py-2 text-right border">Y2</th>
                        <th className="px-3 py-2 text-right border">Y3</th>
                        <th className="px-3 py-2 text-right border">Y4</th>
                        <th className="px-3 py-2 text-right border">Y5</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">Account attivi (n)</td>
                        <td className="px-3 py-2 text-right border">19.5</td>
                        <td className="px-3 py-2 text-right border">78.5</td>
                        <td className="px-3 py-2 text-right border">193.0</td>
                        <td className="px-3 py-2 text-right border">368.0</td>
                        <td className="px-3 py-2 text-right border">598.0</td>
                      </tr>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">Ricavi ricorrenti</td>
                        <td className="px-3 py-2 text-right border">0.28</td>
                        <td className="px-3 py-2 text-right border">1.15</td>
                        <td className="px-3 py-2 text-right border">2.82</td>
                        <td className="px-3 py-2 text-right border">5.37</td>
                        <td className="px-3 py-2 text-right border">8.73</td>
                      </tr>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">Ricavi CapEx</td>
                        <td className="px-3 py-2 text-right border">0.37</td>
                        <td className="px-3 py-2 text-right border">0.74</td>
                        <td className="px-3 py-2 text-right border">1.40</td>
                        <td className="px-3 py-2 text-right border">1.87</td>
                        <td className="px-3 py-2 text-right border">2.43</td>
                      </tr>
                      <tr className="border-b bg-green-50 font-semibold">
                        <td className="px-3 py-2 border">Ricavi totali</td>
                        <td className="px-3 py-2 text-right border">0.65</td>
                        <td className="px-3 py-2 text-right border">1.89</td>
                        <td className="px-3 py-2 text-right border">4.22</td>
                        <td className="px-3 py-2 text-right border">7.24</td>
                        <td className="px-3 py-2 text-right border text-green-600 text-lg">11.16</td>
                      </tr>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">Margine lordo (€)</td>
                        <td className="px-3 py-2 text-right border">0.42</td>
                        <td className="px-3 py-2 text-right border">1.32</td>
                        <td className="px-3 py-2 text-right border">3.01</td>
                        <td className="px-3 py-2 text-right border">5.31</td>
                        <td className="px-3 py-2 text-right border">8.30</td>
                      </tr>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">Margine lordo (%)</td>
                        <td className="px-3 py-2 text-right border">65.3%</td>
                        <td className="px-3 py-2 text-right border">69.7%</td>
                        <td className="px-3 py-2 text-right border">71.3%</td>
                        <td className="px-3 py-2 text-right border">73.2%</td>
                        <td className="px-3 py-2 text-right border font-bold">74.3%</td>
                      </tr>
                      <tr className="border-b hover:bg-emerald-50">
                        <td className="px-3 py-2 border">OPEX</td>
                        <td className="px-3 py-2 text-right border text-red-600">(1.80)</td>
                        <td className="px-3 py-2 text-right border text-red-600">(2.50)</td>
                        <td className="px-3 py-2 text-right border text-red-600">(3.50)</td>
                        <td className="px-3 py-2 text-right border text-red-600">(4.50)</td>
                        <td className="px-3 py-2 text-right border text-red-600">(5.50)</td>
                      </tr>
                      <tr className="bg-gradient-to-r from-blue-100 to-purple-100 font-bold">
                        <td className="px-3 py-2 border">EBITDA</td>
                        <td className="px-3 py-2 text-right border text-red-600">(1.38)</td>
                        <td className="px-3 py-2 text-right border text-red-600">(1.18)</td>
                        <td className="px-3 py-2 text-right border text-orange-600">(0.49)</td>
                        <td className="px-3 py-2 text-right border text-green-600">0.81</td>
                        <td className="px-3 py-2 text-right border text-green-600 text-lg">2.80</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Lettura rapida:</strong> EBITDA ≈ 0 al Y4; GM migliora con mix ricorrente (80% GM) e cost-down hardware
                </p>
              </div>

              {/* Scenari a confronto */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.4 Scenari a confronto (Y5)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Prudente</h4>
                    <div className="space-y-1 text-xs">
                      <p>Ricavi: <strong className="text-orange-600">€7.47M</strong></p>
                      <p>GM: <strong>74%</strong></p>
                      <p>EBITDA: <strong className="text-orange-600">€0.94M</strong></p>
                      <p>Break-even: <strong>Y5</strong></p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-green-50 border-2 border-green-400">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Base ⭐</h4>
                    <div className="space-y-1 text-xs">
                      <p>Ricavi: <strong className="text-green-600">€11.16M</strong></p>
                      <p>GM: <strong>74%</strong></p>
                      <p>EBITDA: <strong className="text-green-600">€2.80M</strong></p>
                      <p>Break-even: <strong>Y4</strong></p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Ambizioso</h4>
                    <div className="space-y-1 text-xs">
                      <p>Ricavi: <strong className="text-blue-600">€17.04M</strong></p>
                      <p>GM: <strong>76%</strong></p>
                      <p>EBITDA: <strong className="text-blue-600">€6.72M</strong></p>
                      <p>Break-even: <strong>Y3–Y4</strong></p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Fundraising */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-5 rounded-lg border-2 border-emerald-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.5 Piano fundraising & use of funds</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border border-emerald-200">
                    <p className="font-bold text-sm text-emerald-700 mb-1">Pre-Seed (Q3-Q4 2025)</p>
                    <p className="text-2xl font-bold text-emerald-600">€0.2–0.5M</p>
                    <p className="text-xs text-gray-600 mt-1">Prototipo, pre-compliance, IP iniziale, preparazione Pre-Sub</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-300">
                    <p className="font-bold text-sm text-blue-700 mb-1">Seed (H1-H2 2026)</p>
                    <p className="text-2xl font-bold text-blue-600">€1.0–1.5M</p>
                    <p className="text-xs text-gray-600 mt-1">QMS 13485, test 60601/EMC, V&V SW, 510(k), piloti USA/EU, PVT</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <p className="font-bold text-sm text-purple-700 mb-1">Series A (H2 2028)</p>
                    <p className="text-2xl font-bold text-purple-600">€3–5M</p>
                    <p className="text-xs text-gray-600 mt-1">Industrializzazione/rampa, crescita vendite USA, preparazione CE/tender EU</p>
                  </div>
                </div>
                <div className="mt-3 bg-white p-3 rounded border border-emerald-200">
                  <p className="text-xs text-gray-700">
                    <strong>Allocazione indicativa:</strong> R&S 20–30% · Regolatorio/QARA 15–20% · Industrializzazione 20–25% · Team 20% · Mkt&Sales 10–15%
                  </p>
                </div>
              </div>

              {/* KPI finanziari */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.7 KPI finanziari & monitoraggio</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  <Card className="p-3 bg-blue-50 border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">ARR & Net-new ARR</p>
                    <p className="text-sm font-bold text-blue-600">Per trimestre</p>
                  </Card>
                  <Card className="p-3 bg-green-50 border-green-200">
                    <p className="text-xs text-gray-600 mb-1">LTV/CAC</p>
                    <p className="text-sm font-bold text-green-600">≥3</p>
                  </Card>
                  <Card className="p-3 bg-purple-50 border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Payback CAC</p>
                    <p className="text-sm font-bold text-purple-600">≤18 mesi</p>
                  </Card>
                  <Card className="p-3 bg-orange-50 border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Churn annuo</p>
                    <p className="text-sm font-bold text-orange-600">&lt;8%</p>
                  </Card>
                </div>
              </div>

              {/* Note finali */}
              <div className="bg-emerald-100 p-4 rounded-lg border-2 border-emerald-400 text-center">
                <p className="text-sm font-semibold text-emerald-800">
                  📊 Modello Excel completo disponibile: <strong>Eco3D_BP_Financial_Model_v0_4_GTM_link_MonteCarlo.xlsx</strong>
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  Include: Three-statement (CE/SP/CF), scenari completi, Monte Carlo, collegamento GTM→Ricavi mensile
                </p>
              </div>
            </div>
            )}
          </Card>
        </section>
      </div>
      </div>
    </div>
  );
}
