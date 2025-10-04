'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from './ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scenario, FinancialAssumptions } from '@/types/financial';
import { Target, Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SectorMarketConfigProps {
  scenario: Scenario;
  onUpdateMarketConfig: (config: { 
    selectedSectors: string[], 
    customTAM: number, 
    customSAM: number,
    sectorMarkets: any 
  }) => void;
}

export function SectorMarketConfig({ scenario, onUpdateMarketConfig }: SectorMarketConfigProps) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    scenario.marketConfig?.selectedSectors || ['tiroide', 'rene', 'msk', 'senologia']
  );
  
  const [sectorMarkets, setSectorMarkets] = useState({
    tiroide: scenario.assumptions?.sectorMarkets?.tiroide || { enabled: true, tam: 15000, sam: 7500, pricePerExam: 75 },
    rene: scenario.assumptions?.sectorMarkets?.rene || { enabled: true, tam: 25000, sam: 12500, pricePerExam: 60 },
    msk: scenario.assumptions?.sectorMarkets?.msk || { enabled: true, tam: 5000, sam: 2500, pricePerExam: 85 },
    senologia: scenario.assumptions?.sectorMarkets?.senologia || { enabled: true, tam: 10000, sam: 5000, pricePerExam: 90 }
  });

  const sectorInfo = {
    tiroide: { 
      name: '🦴 Tiroide', 
      description: 'Ecografie tiroidee e del collo',
      market: 'Endocrinologia, medicina generale',
      suggestedPrice: 100 // €100 target ottimistico
    },
    rene: { 
      name: '🩺 Rene/Urologia', 
      description: 'Ecografie renali e urologiche',
      market: 'Urologia, nefrologia',
      suggestedPrice: 80 // €80 routine migliorata
    },
    msk: { 
      name: '🏃‍♂️ MSK', 
      description: 'Ecografie muscolo-scheletriche',
      market: 'Medicina sportiva, ortopedia',
      suggestedPrice: 110 // €110 premium moderato
    },
    senologia: { 
      name: '🎗️ Senologia', 
      description: 'Ecografie mammarie e senologiche',
      market: 'Ginecologia, centri breast unit',
      suggestedPrice: 115 // €115 premium breast imaging
    }
  };

  const calculateTotals = () => {
    let totalTAM = 0;
    let totalSAM = 0;
    let totalTAMValue = 0; // €M value
    let totalSAMValue = 0; // €M value
    
    selectedSectors.forEach(sector => {
      if (sectorMarkets[sector as keyof typeof sectorMarkets]) {
        const market = sectorMarkets[sector as keyof typeof sectorMarkets];
        totalTAM += market.tam;
        totalSAM += market.sam;
        // Convert: (M esami) * (€/esame) / 1000 = M€
        totalTAMValue += (market.tam * market.pricePerExam) / 1000;
        totalSAMValue += (market.sam * market.pricePerExam) / 1000;
      }
    });
    
    return { totalTAM, totalSAM, totalTAMValue, totalSAMValue };
  };

  const handleSectorToggle = (sector: string) => {
    const newSelected = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSelected);
    updateConfig(newSelected, sectorMarkets);
  };

  const handleSectorValueChange = (
    sector: string, 
    field: 'tam' | 'sam' | 'pricePerExam', 
    value: number
  ) => {
    const newSectorMarkets = {
      ...sectorMarkets,
      [sector]: {
        ...sectorMarkets[sector as keyof typeof sectorMarkets],
        [field]: value
      }
    };
    
    setSectorMarkets(newSectorMarkets);
    updateConfig(selectedSectors, newSectorMarkets);
  };

  const updateConfig = (sectors: string[], markets: any) => {
    const totals = calculateTotalsForConfig(sectors, markets);
    console.log('Market Config Update:', {
      sectors,
      totalTAM: totals.totalTAM,
      totalSAM: totals.totalSAM
    });
    onUpdateMarketConfig({
      selectedSectors: sectors,
      customTAM: totals.totalTAM,
      customSAM: totals.totalSAM,
      sectorMarkets: markets
    });
  };

  const calculateTotalsForConfig = (sectors: string[], markets: any) => {
    let totalTAM = 0;
    let totalSAM = 0;
    let totalTAMValue = 0;
    let totalSAMValue = 0;
    
    sectors.forEach(sector => {
      if (markets[sector]) {
        const market = markets[sector];
        totalTAM += market.tam;
        totalSAM += market.sam;
        totalTAMValue += (market.tam * market.pricePerExam) / 1000;
        totalSAMValue += (market.sam * market.pricePerExam) / 1000;
      }
    });
    
    return { totalTAM, totalSAM, totalTAMValue, totalSAMValue };
  };

  const { totalTAM, totalSAM, totalTAMValue, totalSAMValue } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Market Composition Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Composizione Mercato Totale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalTAM.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">TAM Totale (K esami/anno)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalSAM.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">SAM Totale (K esami/anno)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">€{totalTAMValue.toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">TAM Valore Mercato</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">€{totalSAMValue.toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">SAM Valore Mercato</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedSectors.map(sector => (
              <Badge key={sector} variant="default">
                {sectorInfo[sector as keyof typeof sectorInfo].name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sector Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configurazione Mercati Settoriali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(sectorInfo).map(([sector, info]) => (
              <div key={sector} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={selectedSectors.includes(sector)}
                      onCheckedChange={() => handleSectorToggle(sector)}
                    />
                    <div>
                      <div className="font-medium">{info.name}</div>
                      <div className="text-sm text-muted-foreground">{info.description}</div>
                      <div className="text-xs text-muted-foreground">{info.market}</div>
                    </div>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>TAM: mercato totale raggiungibile</p>
                        <p>SAM: mercato effettivamente servibile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {selectedSectors.includes(sector) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <Label htmlFor={`${sector}-tam`}>TAM (K esami/anno)</Label>
                      <Input
                        id={`${sector}-tam`}
                        type="number"
                        value={sectorMarkets[sector as keyof typeof sectorMarkets].tam}
                        onChange={(e) => handleSectorValueChange(
                          sector, 
                          'tam', 
                          parseInt(e.target.value) || 0
                        )}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${sector}-sam`}>SAM (K esami/anno)</Label>
                      <Input
                        id={`${sector}-sam`}
                        type="number"
                        value={sectorMarkets[sector as keyof typeof sectorMarkets].sam}
                        onChange={(e) => handleSectorValueChange(
                          sector, 
                          'sam', 
                          parseInt(e.target.value) || 0
                        )}
                        min="0"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={`${sector}-price`}>Prezzo per Esame (€)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSectorValueChange(
                            sector, 
                            'pricePerExam', 
                            sectorInfo[sector as keyof typeof sectorInfo].suggestedPrice
                          )}
                          className="text-xs h-6 px-2"
                        >
                          → €{sectorInfo[sector as keyof typeof sectorInfo].suggestedPrice}
                        </Button>
                      </div>
                      <Input
                        id={`${sector}-price`}
                        type="number"
                        value={sectorMarkets[sector as keyof typeof sectorMarkets].pricePerExam}
                        onChange={(e) => handleSectorValueChange(
                          sector, 
                          'pricePerExam', 
                          parseInt(e.target.value) || 0
                        )}
                        min="0"
                        step="5"
                        placeholder={`Suggerito: €${sectorInfo[sector as keyof typeof sectorInfo].suggestedPrice}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
