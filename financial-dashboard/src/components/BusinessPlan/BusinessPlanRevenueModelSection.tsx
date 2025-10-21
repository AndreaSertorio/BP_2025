'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  DollarSign,
  TrendingUp,
  Package,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Zap,
  BarChart3,
  Info,
  FileText,
  ShoppingCart,
  Percent,
  Calculator,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function BusinessPlanRevenueModelSection() {
  const { data } = useDatabase();

  // Stati per customizzazione visualizzazione
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [visualOptions, setVisualOptions] = useState({
    showRevenueStreams: true,
    showContractualOptions: true,
    showPackagesTable: true,
    showPricingModels: true,
    showDiscountPolicies: true,
    showMargins: true,
    showKPIs: true,
    showFormulas: true,
    showUnitEconomics: true,
    showPricingRoadmap: true,
  });

  const revenueModel = data?.revenueModel;
  const hardware = revenueModel?.hardware;
  const saas = revenueModel?.saas;
  const consumables = revenueModel?.consumables;
  const services = revenueModel?.services;

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value.toFixed(0)}`;
  };

  // Calcola dati per grafici
  const revenueStreamsData = useMemo(() => {
    const streams = [];
    
    if (hardware?.enabled) {
      streams.push({ name: 'Hardware', value: 100, color: '#3b82f6' });
    }
    if (saas?.enabled) {
      streams.push({ name: 'SaaS', value: 80, color: '#8b5cf6' });
    }
    if (consumables?.enabled && consumables.items?.length > 0) {
      streams.push({ name: 'Consumables', value: 30, color: '#10b981' });
    }
    if (services?.enabled && services.items?.length > 0) {
      streams.push({ name: 'Services', value: 40, color: '#f59e0b' });
    }
    
    return streams;
  }, [hardware, saas, consumables, services]);

  // Dati modelli pricing SaaS
  const pricingModelsData = useMemo(() => {
    if (!saas?.pricing) return [];
    
    const models = [];
    
    if (saas.pricing.perDevice?.enabled) {
      models.push({
        name: 'Per Device',
        distribution: saas.pricing.perDevice.modelDistributionPct || 0,
        color: '#3b82f6'
      });
    }
    
    if (saas.pricing.perScan?.enabled) {
      models.push({
        name: 'Per Scan',
        distribution: saas.pricing.perScan.modelDistributionPct || 0,
        color: '#8b5cf6'
      });
    }
    
    if (saas.pricing.tiered?.enabled) {
      models.push({
        name: 'Tiered',
        distribution: saas.pricing.tiered.modelDistributionPct || 0,
        color: '#10b981'
      });
    }
    
    return models;
  }, [saas]);

  // Dati margini
  const marginsData = useMemo(() => {
    const margins = [];
    
    if (hardware?.cogsMarginByType) {
      Object.entries(hardware.cogsMarginByType).forEach(([type, margin]) => {
        margins.push({
          category: `HW ${type}`,
          margin: (margin as number) * 100,
          color: '#3b82f6'
        });
      });
    }
    
    if (saas?.pricing?.perDevice?.grossMarginPct) {
      margins.push({
        category: 'SaaS Device',
        margin: saas.pricing.perDevice.grossMarginPct * 100,
        color: '#8b5cf6'
      });
    }
    
    return margins;
  }, [hardware, saas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Modello di Business & Revenue Streams</h3>
          <p className="text-sm text-gray-600 mt-1">
            Architettura ricavi: Hardware + SaaS + Services
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomPanel(!showCustomPanel)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Personalizza
        </Button>
      </div>

      {/* Pannello Personalizzazione */}
      {showCustomPanel && (
        <Card className="p-4 bg-gray-50 border-2 border-gray-300">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">⚙️ Personalizza visualizzazione</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {Object.entries(visualOptions).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setVisualOptions({...visualOptions, [key]: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  {value ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
                  {key.replace(/([A-Z])/g, ' $1').replace(/^show /, '')}
                </span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Revenue Streams */}
      {visualOptions.showRevenueStreams && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Revenue Streams Attivi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {revenueStreamsData.map((stream, idx) => (
              <Card key={idx} className="p-4 border-2" style={{ borderColor: stream.color }}>
                <h4 className="font-bold text-sm text-gray-900 mb-2">{stream.name}</h4>
                <Badge variant="outline" style={{ borderColor: stream.color, color: stream.color }}>
                  Abilitato
                </Badge>
              </Card>
            ))}
          </div>

          {/* Hardware Details */}
          {hardware?.enabled && hardware.unitCostByType && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Hardware - Tipologie
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(hardware.unitCostByType).map(([type, cost]) => {
                  const marginByType = hardware.cogsMarginByType as Record<string, number> | undefined;
                  return (
                    <div key={type} className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-gray-600 capitalize">{type}</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(cost as number)}</p>
                      <p className="text-[10px] text-gray-500">
                        Margine: {((marginByType?.[type] || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Opzioni Contrattuali */}
      {visualOptions.showContractualOptions && (
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Opzioni Contrattuali
          </h3>
          <p className="text-sm text-gray-600 mb-4">Tre modalità di acquisto per adattarsi alle esigenze finanziarie dei clienti</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vendita CapEx */}
            <Card className="p-5 border-2 border-blue-300 bg-blue-50 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-blue-900">Vendita (CapEx)</h4>
                  <Badge variant="outline" className="mt-1 border-blue-500 text-blue-700 text-[10px]">
                    Acquisto completo
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-1">📦 Cosa include</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Dispositivo hardware di proprietà</li>
                    <li>• Licenza software perpetua o annuale</li>
                    <li>• Garanzia standard 12 mesi</li>
                    <li>• 1 training iniziale incluso</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 rounded border border-green-300">
                  <p className="font-semibold text-green-800 mb-1">✅ Vantaggi</p>
                  <ul className="text-xs space-y-1 text-green-700">
                    <li>• Proprietà completa asset</li>
                    <li>• Ammortamento fiscale</li>
                    <li>• No canoni mensili HW</li>
                    <li>• Libertà su service provider</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-red-50 rounded border border-red-300">
                  <p className="font-semibold text-red-800 mb-1">⚠️ Svantaggi</p>
                  <ul className="text-xs space-y-1 text-red-700">
                    <li>• Investimento iniziale elevato</li>
                    <li>• Rischio obsolescenza tecnologica</li>
                    <li>• Costi manutenzione post-garanzia</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-blue-100 rounded font-bold text-center">
                  <p className="text-xs text-blue-800">💶 Range Prezzi</p>
                  <p className="text-lg text-blue-900">€8K - €50K+</p>
                  <p className="text-[10px] text-blue-700">+ SaaS €300-2K/mese</p>
                </div>
              </div>
            </Card>

            {/* Leasing/Noleggio */}
            <Card className="p-5 border-2 border-purple-300 bg-purple-50 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-purple-900">Leasing / Noleggio</h4>
                  <Badge variant="outline" className="mt-1 border-purple-500 text-purple-700 text-[10px]">
                    Canone HW mensile
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-1">📦 Cosa include</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Dispositivo in uso (36-60 mesi)</li>
                    <li>• Opzione riscatto a fine contratto</li>
                    <li>• Manutenzione ordinaria inclusa</li>
                    <li>• Upgrade tecnologico a metà periodo</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 rounded border border-green-300">
                  <p className="font-semibold text-green-800 mb-1">✅ Vantaggi</p>
                  <ul className="text-xs space-y-1 text-green-700">
                    <li>• Zero investimento iniziale</li>
                    <li>• Deducibilità fiscale canone</li>
                    <li>• Protezione obsolescenza</li>
                    <li>• Cash flow preservato</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-red-50 rounded border border-red-300">
                  <p className="font-semibold text-red-800 mb-1">⚠️ Svantaggi</p>
                  <ul className="text-xs space-y-1 text-red-700">
                    <li>• Costo totale superiore (interesse)</li>
                    <li>• Vincolo contrattuale lungo</li>
                    <li>• Non proprietà durante leasing</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-purple-100 rounded font-bold text-center">
                  <p className="text-xs text-purple-800">💶 Canone Mensile</p>
                  <p className="text-lg text-purple-900">€250 - €1.2K</p>
                  <p className="text-[10px] text-purple-700">+ SaaS €300-2K/mese</p>
                </div>
              </div>
            </Card>

            {/* Subscription All-in-One */}
            <Card className="p-5 border-2 border-green-300 bg-green-50 hover:shadow-lg transition-shadow relative">
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600 text-white text-[9px] px-2">CONSIGLIATO</Badge>
              </div>
              
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-green-900">Subscription All-in-One</h4>
                  <Badge variant="outline" className="mt-1 border-green-500 text-green-700 text-[10px]">
                    Tutto incluso
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded border border-green-200">
                  <p className="font-semibold text-green-900 mb-1">📦 Cosa include</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Device + SW + Scansioni illimitate*</li>
                    <li>• Service completo 24/7</li>
                    <li>• Upgrade automatici inclusi</li>
                    <li>• Training continuo + onboarding</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 rounded border border-green-300">
                  <p className="font-semibold text-green-800 mb-1">✅ Vantaggi</p>
                  <ul className="text-xs space-y-1 text-green-700">
                    <li>• Massima prevedibilità costi</li>
                    <li>• Zero sorprese o extra</li>
                    <li>• Sempre tecnologia aggiornata</li>
                    <li>• Partnership strategica</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-red-50 rounded border border-red-300">
                  <p className="font-semibold text-red-800 mb-1">⚠️ Svantaggi</p>
                  <ul className="text-xs space-y-1 text-red-700">
                    <li>• Canone più alto</li>
                    <li>• Lock-in contrattuale</li>
                    <li>• Mai proprietà device</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-100 rounded font-bold text-center">
                  <p className="text-xs text-green-800">💶 Canone Mensile</p>
                  <p className="text-lg text-green-900">€800 - €3K</p>
                  <p className="text-[10px] text-green-700">All-inclusive, no hidden fees</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 p-3 bg-teal-50 border-l-4 border-teal-400 rounded text-xs">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-teal-800">💡 Come scegliere?</p>
                <ul className="mt-1 space-y-1 text-teal-700">
                  <li>• <strong>CapEx</strong>: Se hai budget e vuoi proprietà asset</li>
                  <li>• <strong>Leasing</strong>: Se vuoi flessibilità e proteggere liquidità</li>
                  <li>• <strong>Subscription</strong>: Se vuoi semplicità totale e partnership a lungo termine</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabella Pacchetti */}
      {visualOptions.showPackagesTable && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            Pacchetti & Pricing
          </h3>
          <p className="text-sm text-gray-600 mb-4">Confronto tra opzioni Starter, Professional ed Enterprise</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100 border-b-2 border-amber-300">
                  <th className="p-3 text-left font-bold">Feature</th>
                  <th className="p-3 text-center font-bold bg-blue-50">Starter</th>
                  <th className="p-3 text-center font-bold bg-purple-50">Professional</th>
                  <th className="p-3 text-center font-bold bg-green-50">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="p-3 font-semibold">Target</td>
                  <td className="p-3 text-center bg-blue-50/30">Piccole cliniche, POC</td>
                  <td className="p-3 text-center bg-purple-50/30">Ospedali medi</td>
                  <td className="p-3 text-center bg-green-50/30">Grandi ospedali, network</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Dispositivi inclusi</td>
                  <td className="p-3 text-center">1 portatile</td>
                  <td className="p-3 text-center">1-3 multi-tipo</td>
                  <td className="p-3 text-center">3+ configurazione custom</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Scansioni/mese (incluse)</td>
                  <td className="p-3 text-center">≤200</td>
                  <td className="p-3 text-center">≤1,000</td>
                  <td className="p-3 text-center">Illimitate o custom</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Software & AI</td>
                  <td className="p-3 text-center">✓ Base</td>
                  <td className="p-3 text-center">✓✓ Avanzato</td>
                  <td className="p-3 text-center">✓✓✓ Full + custom</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Service & Training</td>
                  <td className="p-3 text-center">Email support</td>
                  <td className="p-3 text-center">Telefono + 1 training</td>
                  <td className="p-3 text-center">Dedicato + training illimitato</td>
                </tr>
                <tr className="border-b bg-amber-50">
                  <td className="p-3 font-bold">Canone mensile (SaaS)</td>
                  <td className="p-3 text-center font-bold text-blue-600">~€300/mese</td>
                  <td className="p-3 text-center font-bold text-purple-600">~€800/mese</td>
                  <td className="p-3 text-center font-bold text-green-600">Custom (€2K+)</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="p-3 font-bold">CapEx alternativa</td>
                  <td className="p-3 text-center font-bold">€8-12K</td>
                  <td className="p-3 text-center font-bold">€20-35K</td>
                  <td className="p-3 text-center font-bold">€50K+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800">Note operative</p>
                <ul className="mt-1 space-y-1 text-yellow-700">
                  <li>• Pay-per-scan oltre soglie: €1.5-3/scan variabile per piano</li>
                  <li>• Training extra: €500-1,500 per sessione</li>
                  <li>• Service Premium: SLA 4h/24h disponibile con sovrapprezzo 15-25%</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pricing Models */}
      {visualOptions.showPricingModels && saas?.enabled && pricingModelsData.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            Modelli Pricing SaaS
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pricingModelsData}
                  dataKey="distribution"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.distribution}%`}
                >
                  {pricingModelsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>

            <div className="space-y-3">
              {pricingModelsData.map((model, idx) => (
                <Card key={idx} className="p-4 border-2" style={{ borderColor: model.color }}>
                  <h4 className="font-bold text-sm" style={{ color: model.color }}>{model.name}</h4>
                  <Badge variant="outline" style={{ borderColor: model.color, color: model.color }}>
                    {model.distribution}% clienti
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Tiered Pricing */}
          {saas.pricing?.tiered?.enabled && saas.pricing.tiered.tiers && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Piani Tiered</h4>
              <div className="grid grid-cols-3 gap-3">
                {saas.pricing.tiered.tiers.map((tier, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">{tier.description}</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(tier.monthlyFee)}/mese</p>
                    <p className="text-[10px] text-gray-500">
                      ≤{tier.scansUpTo} scan | {tier.distributionPct}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Politiche di Sconto */}
      {visualOptions.showDiscountPolicies && (
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Percent className="h-5 w-5 text-rose-600" />
            Politiche di Sconto
          </h3>
          <p className="text-sm text-gray-600 mb-4">Sconti strutturati per tipologia cliente e volume</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Early Adopter */}
            <Card className="p-4 border-2 border-blue-300 bg-blue-50">
              <div className="flex items-start gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-blue-900">Early Adopter</h4>
                  <Badge variant="outline" className="mt-1 border-blue-400 text-blue-700 text-[10px]">
                    Primi 20-30 clienti
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>-15%</strong> su listino HW + SW</li>
                <li>• OPPURE <strong>+20% crediti</strong> scan gratis</li>
                <li>• Requisito: feedback strutturato + case study</li>
              </ul>
            </Card>

            {/* Multi-Device */}
            <Card className="p-4 border-2 border-purple-300 bg-purple-50">
              <div className="flex items-start gap-2 mb-2">
                <Package className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-purple-900">Multi-Device</h4>
                  <Badge variant="outline" className="mt-1 border-purple-400 text-purple-700 text-[10px]">
                    Volumi crescenti
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>-10%</strong> dal 2° dispositivo</li>
                <li>• <strong>-15%</strong> da 5+ dispositivi</li>
                <li>• Bundle SaaS: sconto 12% se annuale prepagato</li>
              </ul>
            </Card>

            {/* Accademico */}
            <Card className="p-4 border-2 border-green-300 bg-green-50">
              <div className="flex items-start gap-2 mb-2">
                <FileText className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-green-900">Accademico & Ricerca</h4>
                  <Badge variant="outline" className="mt-1 border-green-400 text-green-700 text-[10px]">
                    Università, IRCCS
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>-20%</strong> listino standard</li>
                <li>• Requisito: co-publishing studi</li>
                <li>• Supporto preferenziale per trial clinici</li>
              </ul>
            </Card>

            {/* Tender & Centrali */}
            <Card className="p-4 border-2 border-orange-300 bg-orange-50">
              <div className="flex items-start gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-orange-900">Tender & Centrali Acquisto</h4>
                  <Badge variant="outline" className="mt-1 border-orange-400 text-orange-700 text-[10px]">
                    Gare pubbliche
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Sconti <strong>strutturati</strong> vs volumi</li>
                <li>• Pricing competitivo su convenzioni MEF</li>
                <li>• Termini pagamento: 60-90gg su PA</li>
              </ul>
            </Card>

            {/* Upgrade Pacchetto */}
            <Card className="p-4 border-2 border-cyan-300 bg-cyan-50">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-cyan-900">Upgrade Pacchetto</h4>
                  <Badge variant="outline" className="mt-1 border-cyan-400 text-cyan-700 text-[10px]">
                    Cross-sell esistente
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>Pro-rata</strong> su canone residuo</li>
                <li>• Da Starter → Pro: credito 80% residuo</li>
                <li>• Incentivo upgrade: +10% crediti scan 1° anno</li>
              </ul>
            </Card>

            {/* Fedeltà */}
            <Card className="p-4 border-2 border-amber-300 bg-amber-50">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Fedeltà & Rinnovo</h4>
                  <Badge variant="outline" className="mt-1 border-amber-400 text-amber-700 text-[10px]">
                    Clienti attivi
                  </Badge>
                </div>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>-5%</strong> rinnovo annuale SaaS</li>
                <li>• Referral program: €500-1K per cliente portato</li>
                <li>• Bonus scansioni gratis sopra soglia utilizzo</li>
              </ul>
            </Card>
          </div>

          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">⚠️ Da validare</p>
                <p className="text-red-700">Queste politiche sono bozza v0.1 e richiedono validazione con legal, procurement e modello finanziario definitivo prima di applicazione commerciale.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Margins */}
      {visualOptions.showMargins && marginsData.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Analisi Margini
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marginsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="margin" radius={[8, 8, 0, 0]}>
                {marginsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* KPIs */}
      {visualOptions.showKPIs && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-600" />
            KPI Economici Target
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                Margine HW
                <span title="(Prezzo vendita - COGS) / Prezzo vendita. Target 45-55% per hardware medtech.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-green-600">45-55%</p>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                Margine SW
                <span title="Margine lordo su licenze SaaS. Target ≥80% tipico per software B2B.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-blue-600">≥80%</p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                Ricavi Ricorrenti
                <span title="% ricavi da SaaS/subscription sul totale. Obiettivo ≥40% per valuation premium.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-purple-600">≥40%</p>
            </Card>
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                LTV/CAC
                <span title="Lifetime Value / Customer Acquisition Cost. Rapporto ≥3 indica modello sostenibile.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-orange-600">≥3</p>
            </Card>
            <Card className="p-4 bg-cyan-50 border-cyan-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                Payback CAC
                <span title="Mesi necessari per recuperare CAC con margini lordi. Target 12-18m per B2B medtech.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-cyan-600">12-18m</p>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <h4 className="font-semibold text-xs text-gray-800 mb-2 flex items-center gap-1">
                Churn
                <span title="% clienti che abbandonano annualmente. Target <8% per SaaS B2B enterprise.">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </span>
              </h4>
              <p className="text-2xl font-bold text-red-600">&lt;8%</p>
            </Card>
          </div>
        </Card>
      )}

      {/* Formule e Calcoli */}
      {visualOptions.showFormulas && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Formule & Calcoli Chiave
          </h3>
          <p className="text-sm text-gray-600 mb-4">Logica matematica dietro metriche e KPI economici</p>
          
          <div className="space-y-3">
            {/* LTV */}
            <details className="group bg-white p-4 rounded-lg border-2 border-indigo-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-indigo-900">
                <span className="text-indigo-600">▶</span> LTV - Lifetime Value
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-indigo-50 rounded text-xs font-mono">
                  LTV = ARPA × Margine% × Durata_media × (1 - Churn%)
                </code>
                <p className="text-xs text-gray-600">
                  <strong>Esempio Pro:</strong> €800/mese × 85% × 36 mesi × (1 - 0.08) = <strong className="text-green-600">€22,464</strong>
                </p>
                <p className="text-[11px] text-gray-500">
                  ARPA = Average Revenue Per Account | Margine% = Margine lordo SaaS | Durata_media = retention tipica
                </p>
              </div>
            </details>

            {/* CAC */}
            <details className="group bg-white p-4 rounded-lg border-2 border-purple-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-purple-900">
                <span className="text-purple-600">▶</span> CAC - Customer Acquisition Cost
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-purple-50 rounded text-xs font-mono">
                  CAC = (Marketing + Sales + Overhead) / Nuovi_Clienti
                </code>
                <p className="text-xs text-gray-600">
                  <strong>Ipotesi:</strong> €80K OPEX/mese × 30% commerciale / 5 deal = <strong className="text-orange-600">€4,800</strong>
                </p>
                <p className="text-[11px] text-gray-500">
                  Assumiamo 30% OPEX totale allocato a commerciale (marketing + vendite)
                </p>
              </div>
            </details>

            {/* Margine Lordo */}
            <details className="group bg-white p-4 rounded-lg border-2 border-green-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-green-900">
                <span className="text-green-600">▶</span> Margine Lordo (Gross Margin)
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-green-50 rounded text-xs font-mono">
                  Margine% = (Ricavi - COGS) / Ricavi × 100
                </code>
                <p className="text-xs text-gray-600">
                  <strong>HW Portatile:</strong> (€15K - €6K) / €15K = <strong className="text-green-600">60%</strong><br/>
                  <strong>SaaS:</strong> (€800 - €120) / €800 = <strong className="text-green-600">85%</strong>
                </p>
              </div>
            </details>

            {/* Break-Even */}
            <details className="group bg-white p-4 rounded-lg border-2 border-amber-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-amber-900">
                <span className="text-amber-600">▶</span> Break-Even Point
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-amber-50 rounded text-xs font-mono">
                  Q_BEP = Costi_Fissi / (Prezzo_Unitario - Costo_Variabile_Unitario)
                </code>
                <p className="text-xs text-gray-600">
                  Unità necessarie per coprire costi fissi mensili/annuali
                </p>
                <p className="text-[11px] text-gray-500">
                  Per analisi completa vedi Conto Economico
                </p>
              </div>
            </details>

            {/* Payback CAC */}
            <details className="group bg-white p-4 rounded-lg border-2 border-cyan-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-cyan-900">
                <span className="text-cyan-600">▶</span> CAC Payback Period
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-cyan-50 rounded text-xs font-mono">
                  Payback_mesi = CAC / (ARPA × Margine%)
                </code>
                <p className="text-xs text-gray-600">
                  <strong>Esempio:</strong> €4,800 / (€800 × 85%) = <strong className="text-cyan-600">7.1 mesi</strong>
                </p>
                <p className="text-[11px] text-gray-500">
                  Target B2B medtech: 12-18 mesi considerando vendita complessa
                </p>
              </div>
            </details>

            {/* Churn */}
            <details className="group bg-white p-4 rounded-lg border-2 border-red-200">
              <summary className="cursor-pointer font-bold text-sm flex items-center gap-2 text-red-900">
                <span className="text-red-600">▶</span> Churn Rate
              </summary>
              <div className="mt-3 pl-6 space-y-2">
                <code className="block p-2 bg-red-50 rounded text-xs font-mono">
                  Churn_annuale% = Clienti_persi_anno / Clienti_inizio_anno × 100
                </code>
                <code className="block p-2 bg-red-50 rounded text-xs font-mono mt-1">
                  Churn_mensile = 1 - (1 - Churn_annuale)^(1/12)
                </code>
                <p className="text-xs text-gray-600">
                  <strong>Target:</strong> &lt;8% annuale → ~0.7% mensile
                </p>
              </div>
            </details>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-xs">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800">💡 Come usare queste formule</p>
                <p className="text-blue-700">Puoi calcolare versioni custom inserendo i tuoi valori nelle formule. I numeri negli esempi sono placeholder da validare con dati reali dei pilot.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Unit Economics */}
      {visualOptions.showUnitEconomics && saas?.pricing?.perDevice && (
        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Unit Economics (Esempio)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
              <h4 className="font-semibold text-sm mb-3">
                SaaS Per-Device: {formatCurrency(saas.pricing.perDevice.monthlyFee)}/mese
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Ricavo mensile:</span>
                  <span className="font-semibold">{formatCurrency(saas.pricing.perDevice.monthlyFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo variabile (~15%):</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(saas.pricing.perDevice.monthlyFee * 0.15)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Margine mensile:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(saas.pricing.perDevice.monthlyFee * 0.85)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Margine annuo:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(saas.pricing.perDevice.annualFee * 0.85)}
                  </span>
                </div>
              </div>
            </div>

            {hardware?.unitCostByType?.portatili && (
              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-sm mb-3">
                  Hardware Portatile: {formatCurrency(hardware.unitCostByType.portatili)}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Prezzo vendita:</span>
                    <span className="font-semibold">{formatCurrency(hardware.unitCostByType.portatili)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COGS (~40%):</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(hardware.unitCostByType.portatili * 0.4)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Margine per unità:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(hardware.unitCostByType.portatili * 0.6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Margine %:</span>
                    <span className="font-bold text-green-600">60%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Roadmap Prezzi */}
      {visualOptions.showPricingRoadmap && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            Roadmap Validazione Prezzi
          </h3>
          <p className="text-sm text-gray-600 mb-4">Timeline evoluzione pricing da placeholder v0.1 a listini definitivi GTM</p>
          
          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-green-400"></div>
            
            <div className="space-y-6">
              {/* v0.1 - Oggi */}
              <div className="relative pl-20">
                <div className="absolute left-4 top-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs border-4 border-white shadow-lg">
                  v0.1
                </div>
                <Card className="p-4 bg-blue-50 border-2 border-blue-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-blue-900">Fase Placeholder (OGGI)</h4>
                      <p className="text-xs text-blue-700">Status: 🟡 Draft</p>
                    </div>
                    <Badge className="bg-blue-600 text-white text-[10px]">Q4 2024</Badge>
                  </div>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Range indicativi da benchmark mercato</li>
                    <li>• Stime preliminari su COGS hardware (~40-50%)</li>
                    <li>• Margini SaaS teorici (80-85%)</li>
                    <li>• Pacchetti Starter/Pro/Enterprise baseline</li>
                  </ul>
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-[10px] text-yellow-800">
                    ⚠️ <strong>Non utilizzare per contratti reali</strong> - Solo per modellazione finanziaria
                  </div>
                </Card>
              </div>

              {/* v0.2 - Post Pilot */}
              <div className="relative pl-20">
                <div className="absolute left-4 top-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs border-4 border-white shadow-lg">
                  v0.2
                </div>
                <Card className="p-4 bg-purple-50 border-2 border-purple-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-purple-900">Fase Validazione Pilot</h4>
                      <p className="text-xs text-purple-700">Status: 🟠 In attesa pilot</p>
                    </div>
                    <Badge className="bg-purple-600 text-white text-[10px]">Q1-Q2 2025</Badge>
                  </div>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Aggiornamento con COGS reali da fornitori</li>
                    <li>• Feedback pricing da 3-5 pilot clienti</li>
                    <li>• Validazione willingness-to-pay per segmento</li>
                    <li>• Raffinamento pacchetti vs utilizzo reale</li>
                  </ul>
                  <div className="mt-2 p-2 bg-purple-100 rounded text-[10px]">
                    <p className="font-semibold text-purple-800 mb-1">📋 To-Do:</p>
                    <ul className="space-y-1 text-purple-700">
                      <li>☐ Survey pricing con prospect (3+ segmenti)</li>
                      <li>☐ Quotazioni definitive supply chain HW</li>
                      <li>☐ Test pay-per-scan vs subscription con pilot</li>
                      <li>☐ Benchmark competitor aggiornato</li>
                    </ul>
                  </div>
                </Card>
              </div>

              {/* v1.0 - GTM */}
              <div className="relative pl-20">
                <div className="absolute left-4 top-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs border-4 border-white shadow-lg">
                  v1.0
                </div>
                <Card className="p-4 bg-green-50 border-2 border-green-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-green-900">Listini Ufficiali GTM</h4>
                      <p className="text-xs text-green-700">Status: 🔴 Target futuro</p>
                    </div>
                    <Badge className="bg-green-600 text-white text-[10px]">Q3 2025</Badge>
                  </div>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Listino pubblico Italia validato legal/fiscal</li>
                    <li>• Pricing per mercati EU e USA (se applicabile)</li>
                    <li>• Politiche sconto ufficiali + matrice approvazioni</li>
                    <li>• Tender framework per PA italiana</li>
                  </ul>
                  <div className="mt-2 p-2 bg-green-100 rounded text-[10px]">
                    <p className="font-semibold text-green-800 mb-1">✅ Deliverable:</p>
                    <ul className="space-y-1 text-green-700">
                      <li>☐ Listino v1.0 Italia (PDF + CRM)</li>
                      <li>☐ Configuratore CPQ per sales team</li>
                      <li>☐ Template contratti per 3 opzioni (CapEx/Leasing/Sub)</li>
                      <li>☐ Pricing deck per investor presentation</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Checklist Validazione */}
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-slate-300">
            <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-600" />
              Checklist Pre-GTM (da completare per v1.0)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">📊 Dati & Validazione</p>
                <ul className="space-y-1 text-gray-700">
                  <li>☐ COGS hardware certificati (±5%)</li>
                  <li>☐ Infrastructure costs SaaS (AWS/Azure)</li>
                  <li>☐ Price sensitivity analysis 3+ segmenti</li>
                  <li>☐ Competitive intelligence aggiornato</li>
                  <li>☐ Break-even analysis per pacchetto</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">📄 Legal & Compliance</p>
                <ul className="space-y-1 text-gray-700">
                  <li>☐ Review legal termini contratti</li>
                  <li>☐ Compliance pricing trasparente (MDR)</li>
                  <li>☐ Policy sconti approvata da CFO</li>
                  <li>☐ Template tender PA validati</li>
                  <li>☐ Export control (se mercati extra-EU)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">🛠️ Strumenti Sales</p>
                <ul className="space-y-1 text-gray-700">
                  <li>☐ CPQ configurator implementato</li>
                  <li>☐ ROI calculator per prospect</li>
                  <li>☐ Pricing deck + FAQ</li>
                  <li>☐ Training team sales su listini</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">💼 Governance</p>
                <ul className="space-y-1 text-gray-700">
                  <li>☐ Approval matrix sconti definita</li>
                  <li>☐ Price review cadence (quarterly?)</li>
                  <li>☐ KPI pricing tracked (win rate, avg deal)</li>
                  <li>☐ Escalation process per custom deal</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-100 border-l-4 border-slate-400 rounded text-xs">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">🎯 Prossimi Step Immediati</p>
                <ol className="mt-1 space-y-1 text-slate-700 list-decimal list-inside">
                  <li>Finalizzare quotazioni supply chain HW (target: fine Q4 2024)</li>
                  <li>Pianificare survey pricing con 10+ prospect (Q1 2025)</li>
                  <li>Aggiornare modello finanziario con v0.2 dopo pilot</li>
                  <li>Preparare template contratti per 3 opzioni contrattuali</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
