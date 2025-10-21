'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import PerceptualMap from '@/components/CompetitorAnalysis/PerceptualMap';
import BenchmarkingRadar from '@/components/CompetitorAnalysis/BenchmarkingRadar';
import BlueOceanView from '@/components/CompetitorAnalysis/BlueOceanView';
import {
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  Award,
  Map as MapIcon,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function BusinessPlanCompetitionSection() {
  const { data } = useDatabase();
  
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [visualOptions, setVisualOptions] = useState({
    showKeyStats: true,
    showTopThreats: true,
    showCompetitiveMatrix: true,
    showPositioning: true,
    showScoringWeighted: true,
    showWhatToProve: true,
    // GRAFICI COMPLETI
    showPerceptualMapChart: true,
    showBenchmarkingRadarChart: true,
    showBlueOceanChart: true,
    showPorter5Summary: true
  });

  const toggleOption = (key: keyof typeof visualOptions) => {
    setVisualOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const competitorAnalysis = data?.competitorAnalysis;
  const competitors = useMemo(() => competitorAnalysis?.competitors || [], [competitorAnalysis]);
  const porter5 = competitorAnalysis?.frameworks?.porter5Forces;
  const perceptualMap = competitorAnalysis?.frameworks?.perceptualMap;
  const benchmarking = competitorAnalysis?.frameworks?.benchmarking;

  const stats = useMemo(() => {
    const totalCompetitors = competitors.length;
    const highThreat = competitors.filter((c: any) => c.threatLevel === 'high' || c.threatLevel === 'critical').length;
    const tier1Count = competitors.filter((c: any) => c.tier === 'tier1').length;
    const directCount = competitors.filter((c: any) => c.type === 'direct').length;

    const topThreats = competitors
      .filter((c: any) => c.threatLevel === 'high' || c.threatLevel === 'critical')
      .sort((a: any, b: any) => (b.marketPosition?.marketShare || 0) - (a.marketPosition?.marketShare || 0))
      .slice(0, 5);

    return { totalCompetitors, highThreat, tier1Count, directCount, topThreats };
  }, [competitors]);

  const eco3dScore = useMemo(() => {
    if (!benchmarking?.competitors) return null;
    const eco3d = benchmarking.competitors.find((c: any) => c.competitorId === 'eco3d');
    return eco3d?.totalScore || null;
  }, [benchmarking]);

  const toggleLabels: Record<string, string> = {
    showKeyStats: 'Key Stats',
    showTopThreats: 'Top 5 Threats',
    showCompetitiveMatrix: 'Matrice',
    showPositioning: 'Posizionamento',
    showScoringWeighted: 'Scoring',
    showWhatToProve: 'Da Dimostrare',
    showPerceptualMapChart: '📍 Perceptual Map',
    showBenchmarkingRadarChart: '📊 Benchmarking Radar',
    showBlueOceanChart: '🌊 Blue Ocean',
    showPorter5Summary: 'Porter5'
  };

  return (
    <div className="space-y-6">
      {/* Customization Panel */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Personalizza Visualizzazione Sezione</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {Object.values(visualOptions).filter(v => v).length} / {Object.keys(visualOptions).length} elementi visibili
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCustomPanel(!showCustomPanel)}
            className="gap-2"
          >
            {showCustomPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showCustomPanel ? 'Nascondi' : 'Mostra'} Opzioni
          </Button>
        </div>

        {showCustomPanel && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {(Object.keys(visualOptions) as Array<keyof typeof visualOptions>).map((key) => {
                const isVisible = visualOptions[key];
                const isChart = key.includes('Chart') || key === 'showBlueOceanChart';
                return (
                  <button
                    key={key}
                    onClick={() => toggleOption(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isVisible
                        ? isChart
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {toggleLabels[key]}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisualOptions(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {} as typeof visualOptions))}
                className="text-xs"
              >
                Mostra Tutto
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisualOptions(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as typeof visualOptions))}
                className="text-xs"
              >
                Nascondi Tutto
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 italic">
        <strong>Obiettivo:</strong> fotografare il landscape competitivo e chiarire <strong>dove Eco 3D vince/perde</strong> oggi 
        e nei prossimi 24 mesi, con grafici interattivi e analisi strategica blue ocean.
      </p>

      {/* Key Stats Live */}
      {visualOptions.showKeyStats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            📊 Key Stats Live
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalCompetitors}</div>
              <div className="text-xs text-gray-600 mt-1">Total Competitors</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-red-200 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.highThreat}</div>
              <div className="text-xs text-gray-600 mt-1">High Threat</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.tier1Count}</div>
              <div className="text-xs text-gray-600 mt-1">Tier 1 Players</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-200 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.directCount}</div>
              <div className="text-xs text-gray-600 mt-1">Direct Competitors</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Threats */}
      {visualOptions.showTopThreats && stats.topThreats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            🚨 Top 5 Competitor Threats
          </h3>
          <div className="grid md:grid-cols-5 gap-3">
            {stats.topThreats.map((comp: any, idx: number) => (
              <Card key={comp.id} className="p-3 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-600">#{idx + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    comp.threatLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {comp.threatLevel}
                  </span>
                </div>
                <div className="font-semibold text-sm text-gray-900 mb-1">{comp.name}</div>
                <div className="text-xs text-gray-600">
                  {comp.marketPosition?.marketShare?.toFixed(1)}% market
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* GRAFICO COMPLETO: Perceptual Map */}
      {visualOptions.showPerceptualMapChart && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-green-600" />
            📍 Perceptual Map - Posizionamento Strategico
          </h3>
          <div className="bg-white rounded-lg border-2 border-green-300 p-4">
            <PerceptualMap data={perceptualMap} />
          </div>
        </div>
      )}

      {/* GRAFICO COMPLETO: Benchmarking Radar */}
      {visualOptions.showBenchmarkingRadarChart && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            🏆 Benchmarking Multi-Dimensionale
          </h3>
          <div className="bg-white rounded-lg border-2 border-yellow-300 p-4">
            <BenchmarkingRadar data={benchmarking} />
          </div>
        </div>
      )}

      {/* GRAFICO COMPLETO: Blue Ocean Strategy */}
      {visualOptions.showBlueOceanChart && (
        <div>
          <BlueOceanView />
        </div>
      )}

      {/* Porter's 5 Forces Summary */}
      {visualOptions.showPorter5Summary && porter5 && porter5.enabled && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border-2 border-purple-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            🏛️ Porter&apos;s 5 Forces Summary
          </h3>
          <div className="grid md:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-lg border-2 border-purple-200 text-center">
              <div className="text-lg font-bold text-purple-600">{porter5.overallAttractiveness?.score?.toFixed(1)}/5</div>
              <div className="text-xs text-gray-600 mt-1">Overall</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-sm font-bold text-gray-700">{porter5.rivalryExistingCompetitors?.score?.toFixed(1)}</div>
              <div className="text-xs text-gray-600 mt-1">Rivalry</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-sm font-bold text-gray-700">{porter5.threatNewEntrants?.score?.toFixed(1)}</div>
              <div className="text-xs text-gray-600 mt-1">New Entrants</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-sm font-bold text-gray-700">{porter5.bargainingPowerSuppliers?.score?.toFixed(1)}</div>
              <div className="text-xs text-gray-600 mt-1">Suppliers</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-sm font-bold text-gray-700">{porter5.bargainingPowerBuyers?.score?.toFixed(1)}</div>
              <div className="text-xs text-gray-600 mt-1">Buyers</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-sm font-bold text-gray-700">{porter5.threatSubstitutes?.score?.toFixed(1)}</div>
              <div className="text-xs text-gray-600 mt-1">Substitutes</div>
            </div>
          </div>
        </div>
      )}

      {/* Matrice competitiva (ORIGINALE BP) */}
      {visualOptions.showCompetitiveMatrix && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Matrice competitiva</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse bg-white rounded-lg">
              <thead>
                <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  <th className="px-2 py-2 text-left border border-orange-700">Player</th>
                  <th className="px-2 py-2 text-center border border-orange-700">3D/4D</th>
                  <th className="px-2 py-2 text-center border border-orange-700">AI</th>
                  <th className="px-2 py-2 text-center border border-orange-700">Multi-probe</th>
                  <th className="px-2 py-2 text-center border border-orange-700">Tempo</th>
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
                  <td className="px-2 py-2 text-center border text-green-600 font-bold">≤5</td>
                  <td className="px-2 py-2 text-center border text-green-600 font-bold">HH</td>
                  <td className="px-2 py-2 text-center border text-green-600">€-€€</td>
                  <td className="px-2 py-2 text-center border text-orange-600">R&D</td>
                </tr>
                <tr className="hover:bg-gray-50 border-b">
                  <td className="px-2 py-2 border">GE Voluson</td>
                  <td className="px-2 py-2 text-center border">✔︎</td>
                  <td className="px-2 py-2 text-center border">✔︎</td>
                  <td className="px-2 py-2 text-center border">✖︎</td>
                  <td className="px-2 py-2 text-center border">10-20</td>
                  <td className="px-2 py-2 text-center border">Cart</td>
                  <td className="px-2 py-2 text-center border text-red-600">€€€</td>
                  <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                </tr>
                <tr className="hover:bg-gray-50 border-b">
                  <td className="px-2 py-2 border">Philips EPIQ</td>
                  <td className="px-2 py-2 text-center border">✔︎</td>
                  <td className="px-2 py-2 text-center border">✔︎</td>
                  <td className="px-2 py-2 text-center border">✖︎</td>
                  <td className="px-2 py-2 text-center border">10-20</td>
                  <td className="px-2 py-2 text-center border">Cart/Port</td>
                  <td className="px-2 py-2 text-center border text-red-600">€€€</td>
                  <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                </tr>
                <tr className="hover:bg-gray-50 border-b">
                  <td className="px-2 py-2 border">Butterfly iQ</td>
                  <td className="px-2 py-2 text-center border text-red-600">✖︎</td>
                  <td className="px-2 py-2 text-center border">◔</td>
                  <td className="px-2 py-2 text-center border">✖︎</td>
                  <td className="px-2 py-2 text-center border text-green-600">2-5</td>
                  <td className="px-2 py-2 text-center border text-green-600 font-bold">HH</td>
                  <td className="px-2 py-2 text-center border text-green-600">€</td>
                  <td className="px-2 py-2 text-center border text-green-600">CE/FDA</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ✔︎ = sì · ◔ = parziale · ✖︎ = no · HH = handheld · Cart = carrello
          </p>
        </div>
      )}

      {/* Posizionamento (ORIGINALE BP) */}
      {visualOptions.showPositioning && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Posizionamento</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Tesi di differenziazione</h4>
              <p className="text-xs text-gray-700 italic">
                &quot;3D premium, portatile e guidato da AI, multi-distretto, in ≤5 minuti.&quot;
              </p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-sm mb-2">Moat tecnico</h4>
              <p className="text-xs text-gray-700">
                Multi-sonda ToF/IMU + AI fusion + robotica/guide per scansione standardizzata
              </p>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="font-semibold text-sm mb-2">Claim clinico</h4>
              <p className="text-xs text-gray-700">
                Non-inferiorità vs 2D → equivalenza TC/RM → follow-up a dose zero
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Scoring Ponderato (ORIGINALE BP) */}
      {visualOptions.showScoringWeighted && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">4.6 Scoring ponderato</h3>
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
              <p className="text-xs text-gray-600 mb-1">ABUS/ABVS</p>
              <p className="text-2xl font-bold text-gray-700">1.40</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-300">
              <p className="text-xs text-gray-600 mb-1">Handheld 2D</p>
              <p className="text-2xl font-bold text-gray-700">1.40</p>
            </div>
          </div>
        </div>
      )}

      {/* Cosa Dimostrare (ORIGINALE BP) */}
      {visualOptions.showWhatToProve && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">4.5 Cosa dobbiamo dimostrare</h3>
          <div className="space-y-2">
            <Card className="p-3 bg-blue-50 border-l-4 border-l-blue-500">
              <p className="text-sm">
                <strong>1)</strong> Tempo ≤6 min con NPS ≥40 nei pilot
              </p>
            </Card>
            <Card className="p-3 bg-green-50 border-l-4 border-l-green-500">
              <p className="text-sm">
                <strong>2)</strong> Riduzione invii TAC/RM −20~−40% in follow-up
              </p>
            </Card>
            <Card className="p-3 bg-purple-50 border-l-4 border-l-purple-500">
              <p className="text-sm">
                <strong>3)</strong> CV volumetrico −30% vs 2D; ICC ≈0.99 con TC/RM
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
