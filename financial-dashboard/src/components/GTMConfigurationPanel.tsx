'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDatabase } from '@/contexts/DatabaseProvider';
import { 
  Settings, 
  Globe, 
  TrendingUp, 
  DollarSign,
  Info,
  Save
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * GTM Configuration Panel
 * 
 * Pannello per configurare:
 * 1. Channel Mix (Direct vs Distributori)
 * 2. Adoption Curve (Penetrazione mercato regionale)
 * 3. Scenarios (Basso/Medio/Alto)
 */
export function GTMConfigurationPanel() {
  const { data, updateGoToMarket } = useDatabase();
  const goToMarket = data?.goToMarket;
  
  const [channelMix, setChannelMix] = useState({
    direct: goToMarket?.channelMix?.direct || 0.6,
    distributors: goToMarket?.channelMix?.distributors || 0.4,
    distributorMargin: goToMarket?.channelMix?.distributorMargin || 0.2
  });
  
  const [adoptionCurve, setAdoptionCurve] = useState({
    italia: goToMarket?.adoptionCurve?.italia || { y1: 0.2, y2: 0.6, y3: 1, y4: 1, y5: 1 },
    europa: goToMarket?.adoptionCurve?.europa || { y1: 0.1, y2: 0.4, y3: 0.8, y4: 1, y5: 1 },
    usa: goToMarket?.adoptionCurve?.usa || { y1: 0, y2: 0.2, y3: 0.5, y4: 0.8, y5: 1 },
    cina: goToMarket?.adoptionCurve?.cina || { y1: 0, y2: 0.1, y3: 0.3, y4: 0.6, y5: 1 }
  });
  
  const [currentScenario, setCurrentScenario] = useState(goToMarket?.scenarios?.current || 'medio');
  
  if (!goToMarket) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Go-To-Market non configurato
        </div>
      </Card>
    );
  }
  
  const handleSaveChannelMix = async () => {
    await updateGoToMarket({
      channelMix: {
        ...channelMix,
        description: `Canali: ${Math.round(channelMix.direct * 100)}% direct, ${Math.round(channelMix.distributors * 100)}% distributori (margine ${Math.round(channelMix.distributorMargin * 100)}%)`
      }
    });
  };
  
  const handleSaveAdoptionCurve = async () => {
    await updateGoToMarket({
      adoptionCurve: {
        ...adoptionCurve,
        description: "Curva penetrazione progressiva per regione"
      }
    });
  };
  
  const handleChangeScenario = async (scenario: 'basso' | 'medio' | 'alto') => {
    setCurrentScenario(scenario);
    await updateGoToMarket({
      scenarios: {
        ...goToMarket.scenarios,
        current: scenario
      }
    });
  };
  
  // Calcola channel efficiency
  const channelEfficiency = 1.0 - (channelMix.distributors * channelMix.distributorMargin);
  
  return (
    <div className="space-y-6">
      
      {/* ============================================================
          1. CHANNEL MIX - Mix Canali di Vendita
          ============================================================ */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Channel Mix</h3>
              <p className="text-sm text-gray-600">Canali di vendita e distribuzione</p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  <strong>Channel Mix</strong> determina come vendi i dispositivi:
                  <br/>• <strong>Direct</strong>: Vendita diretta (massimo margine)
                  <br/>• <strong>Distributori</strong>: Tramite rete distributiva (lasci margine)
                  <br/><br/>
                  <strong>Impatto sui calcoli:</strong>
                  <br/>Channel Efficiency = 1 - (% distributori × margine lasciato)
                  <br/>Capacity Finale = Capacity × Channel Efficiency
                  <br/><br/>
                  Es: 40% distributori con 20% margine → Efficiency = 0.92
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Direct Sales */}
          <div>
            <Label htmlFor="direct" className="text-sm font-semibold text-gray-700">
              Vendite Dirette
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="direct"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={channelMix.direct}
                onChange={(e) => {
                  const direct = parseFloat(e.target.value);
                  setChannelMix({
                    ...channelMix,
                    direct,
                    distributors: 1 - direct
                  });
                }}
                className="w-24"
              />
              <span className="text-sm font-semibold text-blue-900">
                {Math.round(channelMix.direct * 100)}%
              </span>
            </div>
          </div>
          
          {/* Distributors */}
          <div>
            <Label htmlFor="distributors" className="text-sm font-semibold text-gray-700">
              Tramite Distributori
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="distributors"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={channelMix.distributors}
                onChange={(e) => {
                  const distributors = parseFloat(e.target.value);
                  setChannelMix({
                    ...channelMix,
                    distributors,
                    direct: 1 - distributors
                  });
                }}
                className="w-24"
              />
              <span className="text-sm font-semibold text-orange-900">
                {Math.round(channelMix.distributors * 100)}%
              </span>
            </div>
          </div>
          
          {/* Distributor Margin */}
          <div>
            <Label htmlFor="margin" className="text-sm font-semibold text-gray-700">
              Margine Distributori
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="margin"
                type="number"
                min="0"
                max="0.5"
                step="0.05"
                value={channelMix.distributorMargin}
                onChange={(e) => {
                  setChannelMix({
                    ...channelMix,
                    distributorMargin: parseFloat(e.target.value)
                  });
                }}
                className="w-24"
              />
              <span className="text-sm font-semibold text-red-900">
                {Math.round(channelMix.distributorMargin * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Channel Efficiency KPI */}
        <div className="p-4 bg-white rounded-lg border border-blue-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-600">Channel Efficiency</div>
              <div className="text-sm text-gray-500">
                = 1 - ({Math.round(channelMix.distributors * 100)}% × {Math.round(channelMix.distributorMargin * 100)}%)
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {(channelEfficiency * 100).toFixed(1)}%
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            💡 La Capacity finale sarà moltiplicata per questa efficienza
          </div>
        </div>
        
        <Button onClick={handleSaveChannelMix} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salva Channel Mix
        </Button>
      </Card>
      
      
      {/* ============================================================
          2. ADOPTION CURVE - Penetrazione Mercato Regionale
          ============================================================ */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Adoption Curve</h3>
              <p className="text-sm text-gray-600">Penetrazione mercato per regione</p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  <strong>Adoption Curve</strong> modella la penetrazione progressiva nei mercati regionali.
                  <br/><br/>
                  <strong>Impatto sui calcoli:</strong>
                  <br/>SOM Adjusted = SOM Target × Adoption Rate
                  <br/><br/>
                  Es: Italia Anno 1 → SOM = 100 devices × 20% adoption = 20 devices
                  <br/>Es: Italia Anno 3 → SOM = 100 devices × 100% adoption = 100 devices
                  <br/><br/>
                  Ogni regione ha curva diversa (IT più veloce, Cina più lenta)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Tabella Adoption Curve */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Regione</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Anno 1</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Anno 2</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Anno 3</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Anno 4</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Anno 5</th>
              </tr>
            </thead>
            <tbody>
              {(['italia', 'europa', 'usa', 'cina'] as const).map(region => (
                <tr key={region} className="border-b border-gray-100">
                  <td className="py-3 px-3 font-semibold text-gray-900 capitalize">
                    {region === 'italia' ? '🇮🇹 Italia' : 
                     region === 'europa' ? '🇪🇺 Europa' :
                     region === 'usa' ? '🇺🇸 USA' : '🇨🇳 Cina'}
                  </td>
                  {[1, 2, 3, 4, 5].map(year => {
                    const yearKey = `y${year}` as 'y1' | 'y2' | 'y3' | 'y4' | 'y5';
                    const value = adoptionCurve[region][yearKey];
                    return (
                      <td key={year} className="py-2 px-3">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={value}
                          onChange={(e) => {
                            setAdoptionCurve({
                              ...adoptionCurve,
                              [region]: {
                                ...adoptionCurve[region],
                                [yearKey]: parseFloat(e.target.value)
                              }
                            });
                          }}
                          className="w-20 text-center"
                        />
                        <div className="text-xs text-center mt-1 font-semibold text-green-900">
                          {Math.round(value * 100)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">💡 Come funziona:</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• <strong>0.2 (20%)</strong> = Solo primi adopter penetrati</div>
            <div>• <strong>0.6 (60%)</strong> = Maggioranza early adopter</div>
            <div>• <strong>1.0 (100%)</strong> = Mercato completamente penetrato</div>
          </div>
        </div>
        
        <Button onClick={handleSaveAdoptionCurve} className="w-full mt-4">
          <Save className="w-4 h-4 mr-2" />
          Salva Adoption Curve
        </Button>
      </Card>
      
      
      {/* ============================================================
          3. SCENARIOS - Scenari Basso/Medio/Alto
          ============================================================ */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Scenarios</h3>
              <p className="text-sm text-gray-600">Scenari di investimento (Basso/Medio/Alto)</p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  <strong>Scenarios</strong> sono preset di configurazione GTM per diversi livelli di investimento.
                  <br/><br/>
                  <strong>Impatto:</strong>
                  <br/>• Budget marketing annuo
                  <br/>• Numero sales reps iniziali
                  <br/>• Multiplier efficienza (ottimizzazione campagne)
                  <br/><br/>
                  Quando cambi scenario, i parametri GTM vengono aggiornati automaticamente.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario Basso */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentScenario === 'basso' 
                ? 'border-purple-600 bg-purple-100' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleChangeScenario('basso')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">🔵 Scenario Basso</h4>
              {currentScenario === 'basso' && (
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Budget:</strong> €{(goToMarket.scenarios?.basso?.budget || 50000).toLocaleString()}/anno</div>
              <div><strong>Sales Reps:</strong> {goToMarket.scenarios?.basso?.reps || 0} (founder-led)</div>
              <div><strong>Efficienza:</strong> {Math.round((goToMarket.scenarios?.basso?.multiplier || 0.5) * 100)}%</div>
            </div>
            <div className="mt-3 text-xs text-gray-600 italic">
              {goToMarket.scenarios?.basso?.description}
            </div>
          </div>
          
          {/* Scenario Medio */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentScenario === 'medio' 
                ? 'border-purple-600 bg-purple-100' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleChangeScenario('medio')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">🟢 Scenario Medio</h4>
              {currentScenario === 'medio' && (
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Budget:</strong> €{(goToMarket.scenarios?.medio?.budget || 150000).toLocaleString()}/anno</div>
              <div><strong>Sales Reps:</strong> {goToMarket.scenarios?.medio?.reps || 1}</div>
              <div><strong>Efficienza:</strong> {Math.round((goToMarket.scenarios?.medio?.multiplier || 1) * 100)}%</div>
            </div>
            <div className="mt-3 text-xs text-gray-600 italic">
              {goToMarket.scenarios?.medio?.description}
            </div>
          </div>
          
          {/* Scenario Alto */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentScenario === 'alto' 
                ? 'border-purple-600 bg-purple-100' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleChangeScenario('alto')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">🔴 Scenario Alto</h4>
              {currentScenario === 'alto' && (
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Budget:</strong> €{(goToMarket.scenarios?.alto?.budget || 300000).toLocaleString()}/anno</div>
              <div><strong>Sales Reps:</strong> {goToMarket.scenarios?.alto?.reps || 3}</div>
              <div><strong>Efficienza:</strong> {Math.round((goToMarket.scenarios?.alto?.multiplier || 1.5) * 100)}%</div>
            </div>
            <div className="mt-3 text-xs text-gray-600 italic">
              {goToMarket.scenarios?.alto?.description}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">📊 Scenario Attivo:</div>
          <div className="text-sm font-bold text-purple-900 capitalize">{currentScenario}</div>
        </div>
      </Card>
      
    </div>
  );
}

export default GTMConfigurationPanel;
