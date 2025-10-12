import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Info,
  DollarSign,
  CheckCircle2,
  Save
} from 'lucide-react';
import { HardwareCard } from './HardwareCard';
import { SaaSMultiModelCard } from './SaaSMultiModelCard';
import { PricingStrategyCard } from './PricingStrategyCard';
import { ConsumablesCard } from './ConsumablesCard';
import { ServicesCard } from './ServicesCard';
import { BundlingCard } from './BundlingCard';
import { FinancingCard } from './FinancingCard';
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
  
  const tamSamSomEcografi = data?.configurazioneTamSamSom?.ecografi;
  const revenueModel = data?.revenueModel;
  
  // 🆕 Leggi UNITÀ di dispositivi SOM dal TAM/SAM/SOM per tutti i 5 anni
  const dispositiviUnita = tamSamSomEcografi?.dispositiviUnita || {
    som1: 0,
    som2: 0,
    som3: 0,
    som4: 0,
    som5: 0
  };
  
  // State per anno selezionato (default: Anno 1)
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Flag per evitare loop infinito tra caricamento e salvataggio
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  
  // Stati SaaS - Modello Per Dispositivo
  const [saasMonthlyFee, setSaasMonthlyFee] = useState(500);
  const [saasAnnualFee, setSaasAnnualFee] = useState(5500);
  const [saasSetupFee, setSaasSetupFee] = useState(0);
  const [saasActivationRate, setSaasActivationRate] = useState(0.8); // 80% default
  const [saasPerDeviceEnabled, setSaasPerDeviceEnabled] = useState(true);
  const [saasPerDeviceDistributionPct, setSaasPerDeviceDistributionPct] = useState(40); // 🆕 40% default
  const [saasPerDeviceGrossMarginPct, setSaasPerDeviceGrossMarginPct] = useState(0.85);
  
  // Stati SaaS - Modello Per Scansione
  const [saasPerScanEnabled, setSaasPerScanEnabled] = useState(false);
  const [saasPerScanDistributionPct, setSaasPerScanDistributionPct] = useState(30); // 🆕 30% default
  const [saasFeePerScan, setSaasFeePerScan] = useState(1.5);
  const [saasRevSharePct, setSaasRevSharePct] = useState(0.3);
  const [saasScansPerDevicePerMonth, setSaasScansPerDevicePerMonth] = useState(150);
  const [saasPerScanGrossMarginPct, setSaasPerScanGrossMarginPct] = useState(0.7);
  
  // Stati SaaS - Modello Tiered/Scaglioni
  const [saasTieredEnabled, setSaasTieredEnabled] = useState(false);
  const [saasTieredDistributionPct, setSaasTieredDistributionPct] = useState(30); // 🆕 30% default
  const [saasTiers, setSaasTiers] = useState([
    { scansUpTo: 100, monthlyFee: 300, description: 'Piano Starter' },
    { scansUpTo: 500, monthlyFee: 500, description: 'Piano Professional' },
    { scansUpTo: 9999, monthlyFee: 800, description: 'Piano Enterprise' }
  ]);
  const [saasTieredGrossMarginPct, setSaasTieredGrossMarginPct] = useState(0.85);
  
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
      setHardwareUnitCostByType(revenueModel.hardware?.unitCostByType ?? { carrellati: 25000, portatili: 10000, palmari: 2000 });
      setHardwareWarrantyPct(revenueModel.hardware?.warrantyPct ?? 0.03);
      setHardwareCogsMarginByType(revenueModel.hardware?.cogsMarginByType ?? { carrellati: 0.50, portatili: 0.60, palmari: 0.65 });
      
      // SaaS - Modello Per Dispositivo
      setSaasEnabled(revenueModel.saas?.enabled ?? true);
      setSaasPerDeviceEnabled(revenueModel.saas?.pricing?.perDevice?.enabled ?? true);
      setSaasPerDeviceDistributionPct(revenueModel.saas?.pricing?.perDevice?.modelDistributionPct ?? 40);
      setSaasMonthlyFee(revenueModel.saas?.pricing?.perDevice?.monthlyFee ?? 500);
      setSaasAnnualFee(revenueModel.saas?.pricing?.perDevice?.annualFee ?? 5500);
      setSaasSetupFee(0); // Setup fee - feature futura
      setSaasActivationRate(revenueModel.saas?.pricing?.perDevice?.activationRate ?? 0.8);
      setSaasPerDeviceGrossMarginPct(revenueModel.saas?.pricing?.perDevice?.grossMarginPct ?? 0.85);
      
      // SaaS - Modello Per Scansione
      setSaasPerScanEnabled(revenueModel.saas?.pricing?.perScan?.enabled ?? false);
      setSaasPerScanDistributionPct(revenueModel.saas?.pricing?.perScan?.modelDistributionPct ?? 30);
      setSaasFeePerScan(revenueModel.saas?.pricing?.perScan?.feePerScan ?? 1.5);
      setSaasRevSharePct(revenueModel.saas?.pricing?.perScan?.revSharePct ?? 0.3);
      setSaasScansPerDevicePerMonth(revenueModel.saas?.pricing?.perScan?.scansPerDevicePerMonth ?? 150);
      setSaasPerScanGrossMarginPct(revenueModel.saas?.pricing?.perScan?.grossMarginPct ?? 0.7);
      
      // SaaS - Modello Tiered
      setSaasTieredEnabled(revenueModel.saas?.pricing?.tiered?.enabled ?? false);
      setSaasTieredDistributionPct(revenueModel.saas?.pricing?.tiered?.modelDistributionPct ?? 30);
      if (revenueModel.saas?.pricing?.tiered?.tiers) {
        setSaasTiers(revenueModel.saas.pricing.tiered.tiers);
      }
      setSaasTieredGrossMarginPct(revenueModel.saas?.pricing?.tiered?.grossMarginPct ?? 0.85);
      
      // Altri moduli
      setConsumablesEnabled(revenueModel?.consumables?.enabled ?? false);
      setServicesEnabled(revenueModel?.services?.enabled ?? false);
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
      // Per-Device
      saasPerDeviceEnabled,
      saasMonthlyFee,
      saasAnnualFee,
      saasActivationRate,
      saasPerDeviceGrossMarginPct,
      // Per-Scan
      saasPerScanEnabled,
      saasFeePerScan,
      saasRevSharePct,
      saasScansPerDevicePerMonth,
      saasPerScanGrossMarginPct,
      // Tiered
      saasTieredEnabled,
      saasTiers,
      saasTieredGrossMarginPct,
      // Altri
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
    saasEnabled,
    saasPerDeviceEnabled, saasMonthlyFee, saasAnnualFee, saasActivationRate, saasPerDeviceGrossMarginPct,
    saasPerScanEnabled, saasFeePerScan, saasRevSharePct, saasScansPerDevicePerMonth, saasPerScanGrossMarginPct,
    saasTieredEnabled, saasTiers, saasTieredGrossMarginPct,
    consumablesEnabled, servicesEnabled, bundlingEnabled, financingEnabled,
    geoPricingEnabled, geoPriceMultipliers
  ]);
  
  // Auto-save con debounce quando cambiano i parametri
  useEffect(() => {
    if (!isInitialized || !revenueModel || !tamSamSomEcografi) return;
    
    const savedStateJSON = JSON.stringify({
      hardwareEnabled: revenueModel.hardware?.enabled,
      hardwareAsp: tamSamSomEcografi.prezzoMedioDispositivo,
      hardwareUnitCost: revenueModel.hardware?.unitCost,
      hardwareWarrantyPct: revenueModel.hardware?.warrantyPct,
      hardwareAspByType: tamSamSomEcografi.prezziMediDispositivi,
      hardwareCogsMarginByType: revenueModel.hardware?.cogsMarginByType,
      saasEnabled: revenueModel.saas?.enabled,
      // Per-Device
      saasPerDeviceEnabled: revenueModel.saas?.pricing?.perDevice?.enabled,
      saasMonthlyFee: revenueModel.saas?.pricing?.perDevice?.monthlyFee,
      saasAnnualFee: revenueModel.saas?.pricing?.perDevice?.annualFee,
      saasActivationRate: revenueModel.saas?.pricing?.perDevice?.activationRate ?? 0.8,
      saasPerDeviceGrossMarginPct: revenueModel.saas?.pricing?.perDevice?.grossMarginPct,
      // Per-Scan
      saasPerScanEnabled: revenueModel.saas?.pricing?.perScan?.enabled,
      saasFeePerScan: revenueModel.saas?.pricing?.perScan?.feePerScan,
      saasRevSharePct: revenueModel.saas?.pricing?.perScan?.revSharePct,
      saasScansPerDevicePerMonth: revenueModel.saas?.pricing?.perScan?.scansPerDevicePerMonth ?? 150,
      saasPerScanGrossMarginPct: revenueModel.saas?.pricing?.perScan?.grossMarginPct,
      // Tiered
      saasTieredEnabled: revenueModel.saas?.pricing?.tiered?.enabled,
      saasTiers: revenueModel.saas?.pricing?.tiered?.tiers,
      saasTieredGrossMarginPct: revenueModel.saas?.pricing?.tiered?.grossMarginPct,
      // Altri
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
    
    // Debounce: salva dopo 800ms di inattività (ridotto per reattività)
    const timeoutId = setTimeout(() => {
      console.log('💾 Auto-saving Revenue Model...');
      saveChanges();
    }, 800);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStateJSON, isInitialized, revenueModel, tamSamSomEcografi]);
  
  // Cleanup: salva al unmount del componente
  useEffect(() => {
    return () => {
      if (hasChanges) {
        console.log('🔄 Component unmounting - saving pending changes...');
        saveChanges();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges]);
  
  // Salva prima di chiudere/ricaricare la pagina (SINCRONO)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        console.log('⚠️ Page unloading - forcing SYNC save...');
        
        // Usa sendBeacon per salvataggio garantito anche durante chiusura
        // (più affidabile di fetch durante unload)
        const payload = {
          saas: {
            enabled: saasEnabled,
            pricing: {
              perDevice: {
                enabled: saasPerDeviceEnabled,
                monthlyFee: saasMonthlyFee,
                annualFee: saasAnnualFee,
                grossMarginPct: saasPerDeviceGrossMarginPct,
                activationRate: saasActivationRate,
                description: revenueModel?.saas?.pricing?.perDevice?.description ?? ''
              },
              perScan: {
                enabled: saasPerScanEnabled,
                feePerScan: saasFeePerScan,
                revSharePct: saasRevSharePct,
                scansPerDevicePerMonth: saasScansPerDevicePerMonth,
                grossMarginPct: saasPerScanGrossMarginPct,
                description: revenueModel?.saas?.pricing?.perScan?.description ?? ''
              },
              tiered: {
                enabled: saasTieredEnabled,
                description: revenueModel?.saas?.pricing?.tiered?.description ?? '',
                tiers: saasTiers,
                grossMarginPct: saasTieredGrossMarginPct
              }
            }
          }
        };
        
        // Salva con fetch keepalive (garantisce completamento anche dopo unload)
        fetch('http://localhost:3001/api/database/revenue-model/saas', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.saas),
          keepalive: true  // ← CRUCIALE: mantiene richiesta attiva anche dopo chiusura
        }).catch(err => console.error('❌ Errore salvataggio beforeunload:', err));
        
        // Mostra alert se ci sono modifiche
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasChanges, saasEnabled, saasPerDeviceEnabled, saasMonthlyFee, saasAnnualFee,
    saasPerDeviceGrossMarginPct, saasActivationRate, saasPerScanEnabled,
    saasFeePerScan, saasRevSharePct, saasScansPerDevicePerMonth, saasPerScanGrossMarginPct,
    saasTieredEnabled, saasTiers, saasTieredGrossMarginPct
  ]);
  
  // Funzione per salvare immediatamente (esposta per bottone)
  const handleSaveNow = async () => {
    console.log('💾 Salvataggio manuale forzato...');
    setIsSaving(true);
    try {
      await saveChanges();
      console.log('✅ Salvataggio completato!');
    } catch (error) {
      console.error('❌ Errore durante salvataggio manuale:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Funzione salvataggio
  const saveChanges = useCallback(async () => {
    try {
      // 1. Salva prezzi ASP in TAM/SAM/SOM (single source of truth)
      await updateConfigurazioneTamSamSomEcografi({
        prezzoMedioDispositivo: hardwareAsp,
        prezziMediDispositivi: hardwareAspByType
      });
      
      // 2. Salva COGS e margini in Revenue Model
      await updateRevenueModelHardware({
        enabled: hardwareEnabled,
        unitCost: hardwareUnitCost,
        unitCostByType: hardwareUnitCostByType,
        warrantyPct: hardwareWarrantyPct,
        cogsMarginByType: hardwareCogsMarginByType
      });
      
      // Salva SaaS - tutti i modelli
      await updateRevenueModelSaaS({
        enabled: saasEnabled,
        pricing: {
          perDevice: {
            enabled: saasPerDeviceEnabled,
            monthlyFee: saasMonthlyFee,
            annualFee: saasAnnualFee,
            grossMarginPct: saasPerDeviceGrossMarginPct,
            activationRate: saasActivationRate,
            description: revenueModel?.saas?.pricing?.perDevice?.description ?? ''
          },
          perScan: {
            enabled: saasPerScanEnabled,
            feePerScan: saasFeePerScan,
            revSharePct: saasRevSharePct,
            scansPerDevicePerMonth: saasScansPerDevicePerMonth,
            grossMarginPct: saasPerScanGrossMarginPct,
            description: revenueModel?.saas?.pricing?.perScan?.description ?? ''
          },
          tiered: {
            enabled: saasTieredEnabled,
            description: revenueModel?.saas?.pricing?.tiered?.description ?? '',
            tiers: saasTiers,
            grossMarginPct: saasTieredGrossMarginPct
          }
        }
      });
      
      // Salva altri moduli (enabled/disabled)
      await updateRevenueModel({
        consumables: {
          enabled: consumablesEnabled,
          description: revenueModel?.consumables?.description ?? 'Consumabili e materiali',
          items: revenueModel?.consumables?.items ?? [],
          totalRevenuePerDevicePerMonth: revenueModel?.consumables?.totalRevenuePerDevicePerMonth ?? 0,
          note: revenueModel?.consumables?.note ?? ''
        },
        services: {
          enabled: servicesEnabled,
          description: revenueModel?.services?.description ?? 'Servizi e assistenza',
          items: revenueModel?.services?.items ?? [],
          note: revenueModel?.services?.note ?? ''
        },
        bundling: {
          enabled: bundlingEnabled,
          description: revenueModel?.bundling?.description ?? 'Pacchetti bundle',
          bundles: revenueModel?.bundling?.bundles ?? [],
          note: revenueModel?.bundling?.note ?? ''
        },
        financing: {
          enabled: financingEnabled,
          description: revenueModel?.financing?.description ?? 'Opzioni finanziamento',
          options: revenueModel?.financing?.options ?? [],
          note: revenueModel?.financing?.note ?? ''
        },
        pricingStrategy: {
          defaultModel: revenueModel?.pricingStrategy?.defaultModel ?? 'hybrid_hardware_saas',
          volumeDiscounts: revenueModel?.pricingStrategy?.volumeDiscounts ?? {
            enabled: false,
            tiers: [],
            note: ''
          },
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
    hardwareAspByType, hardwareUnitCostByType, hardwareCogsMarginByType,
    saasEnabled, saasMonthlyFee, saasAnnualFee, saasActivationRate,
    saasPerDeviceEnabled, saasPerDeviceGrossMarginPct,
    saasPerScanEnabled, saasFeePerScan, saasRevSharePct, saasScansPerDevicePerMonth, saasPerScanGrossMarginPct,
    saasTieredEnabled, saasTiers, saasTieredGrossMarginPct,
    consumablesEnabled, servicesEnabled, bundlingEnabled, financingEnabled,
    geoPricingEnabled, geoPriceMultipliers,
    updateConfigurazioneTamSamSomEcografi,
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
              <>
                <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                  <Save className="h-3 w-3 mr-1" />
                  Modifiche non salvate
                </Badge>
                <Button 
                  onClick={handleSaveNow}
                  size="sm"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salva ora
                    </>
                  )}
                </Button>
              </>
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
          saasPerDeviceEnabled={saasPerDeviceEnabled}
          saasMonthlyFee={saasMonthlyFee}
          saasAnnualFee={saasAnnualFee}
          saasPerDeviceGrossMarginPct={saasPerDeviceGrossMarginPct}
          saasActivationRate={saasActivationRate}
          saasPerScanEnabled={saasPerScanEnabled}
          saasFeePerScan={saasFeePerScan}
          saasRevSharePct={saasRevSharePct}
          saasScansPerDevicePerMonth={saasScansPerDevicePerMonth}
          saasPerScanGrossMarginPct={saasPerScanGrossMarginPct}
          saasTieredEnabled={saasTieredEnabled}
          saasTiers={saasTiers}
          saasTieredGrossMarginPct={saasTieredGrossMarginPct}
          dispositiviUnita={dispositiviUnita}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
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
          />
          
          {/* SaaS Multi-Model Card */}
          <SaaSMultiModelCard 
            enabled={saasEnabled}
            setEnabled={setSaasEnabled}
            perDeviceEnabled={saasPerDeviceEnabled}
            setPerDeviceEnabled={setSaasPerDeviceEnabled}
            perDeviceDistributionPct={saasPerDeviceDistributionPct}
            setPerDeviceDistributionPct={setSaasPerDeviceDistributionPct}
            monthlyFee={saasMonthlyFee}
            setMonthlyFee={setSaasMonthlyFee}
            annualFee={saasAnnualFee}
            setAnnualFee={setSaasAnnualFee}
            setupFee={saasSetupFee}
            setSetupFee={setSaasSetupFee}
            activationRate={saasActivationRate}
            setActivationRate={setSaasActivationRate}
            perScanEnabled={saasPerScanEnabled}
            setPerScanEnabled={setSaasPerScanEnabled}
            perScanDistributionPct={saasPerScanDistributionPct}
            setPerScanDistributionPct={setSaasPerScanDistributionPct}
            feePerScan={saasFeePerScan}
            setFeePerScan={setSaasFeePerScan}
            revSharePct={saasRevSharePct}
            setRevSharePct={setSaasRevSharePct}
            scansPerDevicePerMonth={saasScansPerDevicePerMonth}
            setScansPerDevicePerMonth={setSaasScansPerDevicePerMonth}
            tieredEnabled={saasTieredEnabled}
            setTieredEnabled={setSaasTieredEnabled}
            tieredDistributionPct={saasTieredDistributionPct}
            setTieredDistributionPct={setSaasTieredDistributionPct}
            tiers={saasTiers}
            setTiers={setSaasTiers}
            perDeviceGrossMarginPct={saasPerDeviceGrossMarginPct}
            setPerDeviceGrossMarginPct={setSaasPerDeviceGrossMarginPct}
            perScanGrossMarginPct={saasPerScanGrossMarginPct}
            setPerScanGrossMarginPct={setSaasPerScanGrossMarginPct}
            tieredGrossMarginPct={saasTieredGrossMarginPct}
            onSave={updateRevenueModelSaaS}
            setTieredGrossMarginPct={setSaasTieredGrossMarginPct}
            somDevicesY1={dispositiviUnita[`som${selectedYear}` as keyof typeof dispositiviUnita] || 0}
          />
          
          {/* Pricing Strategy Card */}
          <PricingStrategyCard 
            geoPricingEnabled={geoPricingEnabled}
            setGeoPricingEnabled={setGeoPricingEnabled}
            geoPriceMultipliers={geoPriceMultipliers}
            setGeoPriceMultipliers={setGeoPriceMultipliers}
          />
          
          {/* Consumables Card */}
          <ConsumablesCard 
            enabled={consumablesEnabled}
            setEnabled={setConsumablesEnabled}
          />
          
          {/* Services Card */}
          <ServicesCard 
            enabled={servicesEnabled}
            setEnabled={setServicesEnabled}
          />
          
          {/* Bundling Card */}
          <BundlingCard 
            enabled={bundlingEnabled}
            setEnabled={setBundlingEnabled}
          />
          
          {/* Financing Card */}
          <FinancingCard 
            enabled={financingEnabled}
            setEnabled={setFinancingEnabled}
          />
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
