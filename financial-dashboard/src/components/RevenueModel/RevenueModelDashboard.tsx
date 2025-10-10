'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Package,
  Server,
  ShoppingCart,
  GraduationCap,
  Gift,
  CreditCard,
  Globe,
  Info,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Save
} from 'lucide-react';

import { HardwareCard } from './HardwareCard';
import { SaaSCard } from './SaaSCard';
import { PricingStrategyCard } from './PricingStrategyCard';
import { RevenuePreview } from './RevenuePreview';

export function RevenueModelDashboard() {
  const { 
    data, 
    loading,
    updateRevenueModelHardware,
    updateRevenueModelSaaS,
    updateRevenueModel,
    updateConfigurazioneTamSamSomEcografi
  } = useDatabase();
  
  const revenueModel = data?.revenueModel;
  const tamSamSomEcografi = data?.configurazioneTamSamSom?.ecografi;
  
  // Flag per evitare loop infinito tra caricamento e salvataggio
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Stati locali per editing
  const [hardwareEnabled, setHardwareEnabled] = useState(true);
  const [saasEnabled, setSaasEnabled] = useState(true);
  const [consumablesEnabled, setConsumablesEnabled] = useState(false);
  const [servicesEnabled, setServicesEnabled] = useState(false);
  const [bundlingEnabled, setBundlingEnabled] = useState(false);
  const [financingEnabled, setFinancingEnabled] = useState(false);
  
  // Stati Hardware - Prezzi ASP letti da TAM/SAM/SOM
  const [hardwareAsp, setHardwareAsp] = useState(25000);
  const [hardwareUnitCost, setHardwareUnitCost] = useState(10000);
  const [hardwareWarrantyPct, setHardwareWarrantyPct] = useState(0.03);
  const [hardwareAspByType, setHardwareAspByType] = useState({
    carrellati: 50000,
    portatili: 25000,
    palmari: 6000
  });
  const [hardwareUnitCostByType, setHardwareUnitCostByType] = useState({
    carrellati: 25000,
    portatili: 10000,
    palmari: 2000
  });
  const [hardwareCogsMarginByType, setHardwareCogsMarginByType] = useState({
    carrellati: 0.50,
    portatili: 0.60,
    palmari: 0.65
  });
  
  // Stati SaaS
  const [saasMonthlyFee, setSaasMonthlyFee] = useState(500);
  const [saasAnnualFee, setSaasAnnualFee] = useState(5500);
  const [saasGrossMarginPct, setSaasGrossMarginPct] = useState(0.85);
  const [saasPerDeviceEnabled, setSaasPerDeviceEnabled] = useState(true);
  const [saasPerScanEnabled, setSaasPerScanEnabled] = useState(false);
  const [saasTieredEnabled, setSaasTieredEnabled] = useState(false);
  
  // Stati Geographic Pricing
  const [geoPricingEnabled, setGeoPricingEnabled] = useState(true);
  const [geoPriceMultipliers, setGeoPriceMultipliers] = useState({
    italia: 1.0,
    europa: 1.1,
    usa: 1.3,
    cina: 0.8
  });
  
  // Carica configurazione salvata al mount
  useEffect(() => {
    if (revenueModel && tamSamSomEcografi && !isInitialized) {
      console.log('📥 Caricamento configurazione Revenue Model salvata');
      
      // Hardware - Prezzi ASP da TAM/SAM/SOM
      setHardwareEnabled(revenueModel.hardware?.enabled ?? true);
      const prezzoMedio = tamSamSomEcografi.prezzoMedioDispositivo ?? 25000;
      const prezziByType = tamSamSomEcografi.prezziMediDispositivi ?? { carrellati: 50000, portatili: 25000, palmari: 6000 };
      setHardwareAsp(prezzoMedio);
      setHardwareAspByType(prezziByType);
      
      // COGS da Revenue Model
      setHardwareUnitCost(revenueModel.hardware?.unitCost ?? 10000);
      setHardwareUnitCostByType(revenueModel.hardware?.unitCostByType ?? { carrellati: 25000, portatili: 10000, palmari: 2000 });
      setHardwareWarrantyPct(revenueModel.hardware?.warrantyPct ?? 0.03);
      setHardwareCogsMarginByType(revenueModel.hardware?.cogsMarginByType ?? { carrellati: 0.50, portatili: 0.60, palmari: 0.65 });
      
      // SaaS
      setSaasEnabled(revenueModel.saas?.enabled ?? true);
      setSaasMonthlyFee(revenueModel.saas?.pricing?.perDevice?.monthlyFee ?? 500);
      setSaasAnnualFee(revenueModel.saas?.pricing?.perDevice?.annualFee ?? 5500);
      setSaasGrossMarginPct(revenueModel.saas?.pricing?.perDevice?.grossMarginPct ?? 0.85);
      setSaasPerDeviceEnabled(revenueModel.saas?.pricing?.perDevice?.enabled ?? true);
      setSaasPerScanEnabled(revenueModel.saas?.pricing?.perScan?.enabled ?? false);
      setSaasTieredEnabled(revenueModel.saas?.pricing?.tiered?.enabled ?? false);
      
      // Altri moduli
      setConsumablesEnabled(revenueModel.consumables?.enabled ?? false);
      setServicesEnabled(revenueModel.services?.enabled ?? false);
      setBundlingEnabled(revenueModel.bundling?.enabled ?? false);
      setFinancingEnabled(revenueModel.financing?.enabled ?? false);
      
      // Geographic Pricing
      setGeoPricingEnabled(revenueModel.pricingStrategy?.geographicPricing?.enabled ?? true);
      setGeoPriceMultipliers({
        italia: revenueModel.pricingStrategy?.geographicPricing?.regions?.italia?.priceMultiplier ?? 1.0,
        europa: revenueModel.pricingStrategy?.geographicPricing?.regions?.europa?.priceMultiplier ?? 1.1,
        usa: revenueModel.pricingStrategy?.geographicPricing?.regions?.usa?.priceMultiplier ?? 1.3,
        cina: revenueModel.pricingStrategy?.geographicPricing?.regions?.cina?.priceMultiplier ?? 0.8
      });
      
      setIsInitialized(true);
      console.log('✅ Configurazione Revenue Model caricata');
    }
  }, [revenueModel, tamSamSomEcografi, isInitialized]);
  
  // Serializza stati per rilevare cambiamenti
  const currentStateJSON = useMemo(() => {
    return JSON.stringify({
      hardwareEnabled,
      hardwareAsp,
      hardwareUnitCost,
      hardwareWarrantyPct,
      hardwareAspByType,
      hardwareCogsMarginByType,
      saasEnabled,
      saasMonthlyFee,
      saasAnnualFee,
      saasGrossMarginPct,
      saasPerDeviceEnabled,
      saasPerScanEnabled,
      saasTieredEnabled,
      consumablesEnabled,
      servicesEnabled,
      bundlingEnabled,
      financingEnabled,
      geoPricingEnabled,
      geoPriceMultipliers
    });
  }, [
    hardwareEnabled, hardwareAsp, hardwareUnitCost, hardwareWarrantyPct,
    hardwareAspByType, hardwareCogsMarginByType,
    saasEnabled, saasMonthlyFee, saasAnnualFee, saasGrossMarginPct,
    saasPerDeviceEnabled, saasPerScanEnabled, saasTieredEnabled,
    consumablesEnabled, servicesEnabled, bundlingEnabled, financingEnabled,
    geoPricingEnabled, geoPriceMultipliers
  ]);
  
  // Auto-save con debounce quando cambiano i parametri
  useEffect(() => {
    if (!isInitialized || !revenueModel) return;
    
    const savedStateJSON = JSON.stringify({
      hardwareEnabled: revenueModel.hardware?.enabled,
      hardwareAsp: revenueModel.hardware?.asp,
      hardwareUnitCost: revenueModel.hardware?.unitCost,
      hardwareWarrantyPct: revenueModel.hardware?.warrantyPct,
      hardwareAspByType: revenueModel.hardware?.aspByType,
      hardwareCogsMarginByType: revenueModel.hardware?.cogsMarginByType,
      saasEnabled: revenueModel.saas?.enabled,
      saasMonthlyFee: revenueModel.saas?.pricing?.perDevice?.monthlyFee,
      saasAnnualFee: revenueModel.saas?.pricing?.perDevice?.annualFee,
      saasGrossMarginPct: revenueModel.saas?.pricing?.perDevice?.grossMarginPct,
      saasPerDeviceEnabled: revenueModel.saas?.pricing?.perDevice?.enabled,
      saasPerScanEnabled: revenueModel.saas?.pricing?.perScan?.enabled,
      saasTieredEnabled: revenueModel.saas?.pricing?.tiered?.enabled,
      consumablesEnabled: revenueModel.consumables?.enabled,
      servicesEnabled: revenueModel.services?.enabled,
      bundlingEnabled: revenueModel.bundling?.enabled,
      financingEnabled: revenueModel.financing?.enabled,
      geoPricingEnabled: revenueModel.pricingStrategy?.geographicPricing?.enabled,
      geoPriceMultipliers: {
        italia: revenueModel.pricingStrategy?.geographicPricing?.regions?.italia?.priceMultiplier,
        europa: revenueModel.pricingStrategy?.geographicPricing?.regions?.europa?.priceMultiplier,
        usa: revenueModel.pricingStrategy?.geographicPricing?.regions?.usa?.priceMultiplier,
        cina: revenueModel.pricingStrategy?.geographicPricing?.regions?.cina?.priceMultiplier
      }
    });
    
    // Confronta stato corrente con quello salvato
    const changed = currentStateJSON !== savedStateJSON;
    setHasChanges(changed);
    
    if (!changed) return;
    
    // Debounce: salva dopo 1.5 secondi di inattività
    const timeoutId = setTimeout(() => {
      console.log('💾 Auto-saving Revenue Model...');
      saveChanges();
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [currentStateJSON, isInitialized, revenueModel]);
  
  // Funzione salvataggio
  const saveChanges = useCallback(async () => {
    try {
      // Salva Hardware
      await updateRevenueModelHardware({
        enabled: hardwareEnabled,
        asp: hardwareAsp,
        unitCost: hardwareUnitCost,
        warrantyPct: hardwareWarrantyPct,
        aspByType: hardwareAspByType,
        cogsMarginByType: hardwareCogsMarginByType
      });
      
      // Salva SaaS
      await updateRevenueModelSaaS({
        enabled: saasEnabled,
        pricing: {
          perDevice: {
            enabled: saasPerDeviceEnabled,
            monthlyFee: saasMonthlyFee,
            annualFee: saasAnnualFee,
            grossMarginPct: saasGrossMarginPct,
            description: revenueModel?.saas?.pricing?.perDevice?.description ?? ''
          },
          perScan: {
            enabled: saasPerScanEnabled,
            feePerScan: revenueModel?.saas?.pricing?.perScan?.feePerScan ?? 1.5,
            revSharePct: revenueModel?.saas?.pricing?.perScan?.revSharePct ?? 0.3,
            grossMarginPct: revenueModel?.saas?.pricing?.perScan?.grossMarginPct ?? 0.7,
            description: revenueModel?.saas?.pricing?.perScan?.description ?? ''
          },
          tiered: {
            enabled: saasTieredEnabled,
            description: revenueModel?.saas?.pricing?.tiered?.description ?? '',
            tiers: revenueModel?.saas?.pricing?.tiered?.tiers ?? [],
            grossMarginPct: revenueModel?.saas?.pricing?.tiered?.grossMarginPct ?? 0.85
          }
        }
      });
      
      // Salva altri moduli (enabled/disabled)
      await updateRevenueModel({
        consumables: {
          ...revenueModel?.consumables,
          enabled: consumablesEnabled
        },
        services: {
          ...revenueModel?.services,
          enabled: servicesEnabled
        },
        bundling: {
          ...revenueModel?.bundling,
          enabled: bundlingEnabled
        },
        financing: {
          ...revenueModel?.financing,
          enabled: financingEnabled
        },
        pricingStrategy: {
          ...revenueModel?.pricingStrategy,
          geographicPricing: {
            enabled: geoPricingEnabled,
            regions: {
              italia: {
                priceMultiplier: geoPriceMultipliers.italia,
                note: revenueModel?.pricingStrategy?.geographicPricing?.regions?.italia?.note ?? ''
              },
              europa: {
                priceMultiplier: geoPriceMultipliers.europa,
                note: revenueModel?.pricingStrategy?.geographicPricing?.regions?.europa?.note ?? ''
              },
              usa: {
                priceMultiplier: geoPriceMultipliers.usa,
                note: revenueModel?.pricingStrategy?.geographicPricing?.regions?.usa?.note ?? ''
              },
              cina: {
                priceMultiplier: geoPriceMultipliers.cina,
                note: revenueModel?.pricingStrategy?.geographicPricing?.regions?.cina?.note ?? ''
              }
            }
          }
        }
      });
      
      console.log('✅ Revenue Model salvato con successo');
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Errore salvataggio Revenue Model:', error);
    }
  }, [
    hardwareEnabled, hardwareAsp, hardwareUnitCost, hardwareWarrantyPct,
    hardwareAspByType, hardwareCogsMarginByType,
    saasEnabled, saasMonthlyFee, saasAnnualFee, saasGrossMarginPct,
    saasPerDeviceEnabled, saasPerScanEnabled, saasTieredEnabled,
    consumablesEnabled, servicesEnabled, bundlingEnabled, financingEnabled,
    geoPricingEnabled, geoPriceMultipliers,
    updateRevenueModelHardware, updateRevenueModelSaaS, updateRevenueModel,
    revenueModel
  ]);
  
  if (loading || !revenueModel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Caricamento Revenue Model...</p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              Modello di Business
            </h1>
            <p className="text-gray-500 mt-1">
              Definisci prezzi, margini e strategie di pricing per ogni linea di ricavo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                <Save className="h-3 w-3 mr-1" />
                Salvataggio in corso...
              </Badge>
            )}
            {!hasChanges && isInitialized && (
              <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Salvato
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-1" />
              Guida
            </Button>
          </div>
        </div>
        
        {/* Revenue Preview - Widget sommario */}
        <RevenuePreview 
          hardwareEnabled={hardwareEnabled}
          hardwareAsp={hardwareAsp}
          hardwareUnitCost={hardwareUnitCost}
          saasEnabled={saasEnabled}
          saasMonthlyFee={saasMonthlyFee}
          saasAnnualFee={saasAnnualFee}
          saasGrossMarginPct={saasGrossMarginPct}
        />
        
        {/* Cards principali */}
        <div className="grid grid-cols-1 gap-6">
          {/* Hardware Card */}
          <HardwareCard 
            enabled={hardwareEnabled}
            setEnabled={setHardwareEnabled}
            asp={hardwareAsp}
            setAsp={setHardwareAsp}
            unitCost={hardwareUnitCost}
            setUnitCost={setHardwareUnitCost}
            warrantyPct={hardwareWarrantyPct}
            setWarrantyPct={setHardwareWarrantyPct}
            aspByType={hardwareAspByType}
            setAspByType={setHardwareAspByType}
            cogsMarginByType={hardwareCogsMarginByType}
            setCogsMarginByType={setHardwareCogsMarginByType}
          />
          
          {/* SaaS Card */}
          <SaaSCard 
            enabled={saasEnabled}
            setEnabled={setSaasEnabled}
            perDeviceEnabled={saasPerDeviceEnabled}
            setPerDeviceEnabled={setSaasPerDeviceEnabled}
            perScanEnabled={saasPerScanEnabled}
            setPerScanEnabled={setSaasPerScanEnabled}
            tieredEnabled={saasTieredEnabled}
            setTieredEnabled={setSaasTieredEnabled}
            monthlyFee={saasMonthlyFee}
            setMonthlyFee={setSaasMonthlyFee}
            annualFee={saasAnnualFee}
            setAnnualFee={setSaasAnnualFee}
            grossMarginPct={saasGrossMarginPct}
            setGrossMarginPct={setSaasGrossMarginPct}
          />
          
          {/* Pricing Strategy Card */}
          <PricingStrategyCard 
            geoPricingEnabled={geoPricingEnabled}
            setGeoPricingEnabled={setGeoPricingEnabled}
            geoPriceMultipliers={geoPriceMultipliers}
            setGeoPriceMultipliers={setGeoPriceMultipliers}
          />
          
          {/* Placeholder cards per moduli opzionali */}
          <Card className="p-6 border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setConsumablesEnabled(!consumablesEnabled)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-700">Consumabili</h3>
                  <p className="text-sm text-gray-500">Gel, sonde, accessori ricorrenti</p>
                </div>
              </div>
              <Badge variant={consumablesEnabled ? "default" : "outline"}>
                {consumablesEnabled ? 'Attivo' : 'Disattivato'}
              </Badge>
            </div>
          </Card>
          
          <Card className="p-6 border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setServicesEnabled(!servicesEnabled)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-700">Servizi</h3>
                  <p className="text-sm text-gray-500">Training, garanzia estesa, consulenza</p>
                </div>
              </div>
              <Badge variant={servicesEnabled ? "default" : "outline"}>
                {servicesEnabled ? 'Attivo' : 'Disattivato'}
              </Badge>
            </div>
          </Card>
          
          <Card className="p-6 border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setBundlingEnabled(!bundlingEnabled)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-700">Bundling</h3>
                  <p className="text-sm text-gray-500">Pacchetti hardware + software + servizi</p>
                </div>
              </div>
              <Badge variant={bundlingEnabled ? "default" : "outline"}>
                {bundlingEnabled ? 'Attivo' : 'Disattivato'}
              </Badge>
            </div>
          </Card>
          
          <Card className="p-6 border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setFinancingEnabled(!financingEnabled)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-700">Financing</h3>
                  <p className="text-sm text-gray-500">Leasing, rent-to-own</p>
                </div>
              </div>
              <Badge variant={financingEnabled ? "default" : "outline"}>
                {financingEnabled ? 'Attivo' : 'Disattivato'}
              </Badge>
            </div>
          </Card>
        </div>
        
        {/* Footer Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Auto-save attivo</p>
              <p className="text-blue-700">
                Le modifiche vengono salvate automaticamente dopo 1.5 secondi.
                I dati persistono nel database e vengono utilizzati per calcoli ricavi e proiezioni.
              </p>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
