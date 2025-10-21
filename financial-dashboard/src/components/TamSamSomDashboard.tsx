'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDatabase } from '@/contexts/DatabaseProvider';
import {
  Target,
  TrendingUp,
  Info,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calculator,
  Globe
} from 'lucide-react';

export function TamSamSomDashboard() {
  const { 
    data, 
    loading, 
    toggleAggredibile: toggleAggredibileDB,
    updateConfigurazioneTamSamSomEcografie,
    updateConfigurazioneTamSamSomEcografi,
    updatePrezzoEcografiaRegionalizzato,
    setPercentualeExtraSSN
  } = useDatabase();
  
  const [activeView, setActiveView] = useState<'procedures' | 'devices'>('devices');
  
  // Regioni selezionate per modalità regionalizzato (multi-selezione)
  const [selectedRegions, setSelectedRegions] = useState({
    italia: true,
    europa: false,
    usa: false,
    cina: false
  });
  
  // Stati per Procedures
  const [samPercentage, setSamPercentage] = useState(35);
  const [somPercentages, setSomPercentages] = useState({ y1: 0.5, y3: 2, y5: 5 });
  const [selectedYearProcedures, setSelectedYearProcedures] = useState(2025); // NUOVO: Anno selezionato per Procedures
  
  // Stati per Devices (default allineato a DB)
  const [samPercentageDevices, setSamPercentageDevices] = useState(50);
  const [somPercentagesDevices, setSomPercentagesDevices] = useState({ y1: 1, y3: 2, y5: 5 });
  const [prezzoMedioProcedura, setPrezzoMedioProcedura] = useState(77.5);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [priceMode, setPriceMode] = useState<'semplice' | 'perProcedura' | 'regionalizzato'>('semplice');
  const [volumeMode, setVolumeMode] = useState<'totale' | 'ssn' | 'extraSsn'>('totale');
  
  // State per Vista Devices
  const [selectedYear, setSelectedYear] = useState(2025);
  const [regioniAttive, setRegioniAttive] = useState({
    italia: true,
    europa: false,  // Default: solo Italia (match con DB)
    usa: false,
    cina: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  
  // Flag per evitare loop infinito tra caricamento e salvataggio
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State per prezzo medio dispositivo (SOURCE OF TRUTH - sincronizzato con Revenue Model)
  const [prezzoMedio, setPrezzoMedio] = useState(44000);
  const [editingPrezzoMedio, setEditingPrezzoMedio] = useState<string | null>(null);
  
  // State per prezzi dispositivi (carrellati, portatili, palmari)
  const [prezziDispositivi, setPrezziDispositivi] = useState({ carrellati: 50000, portatili: 25000, palmari: 8000 });
  const [editingPrezzoDispositivo, setEditingPrezzoDispositivo] = useState<{ tipo: 'carrellati' | 'portatili' | 'palmari'; value: string } | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false); // Flag per bloccare auto-save durante editing
  
  // State per editing inline prezzi (come nel Budget)
  const [editingPrice, setEditingPrice] = useState<{ codice: string; tipo: 'pubblico' | 'privato'; value: string } | null>(null);
  
  // State per regione tabella procedure (separato da selectedRegion usato per calcolo TAM)
  const [tableRegion, setTableRegion] = useState<'italia' | 'europa' | 'usa' | 'cina'>('italia');
  
  // State per editing percentuale Extra SSN
  const [editingExtraSSN, setEditingExtraSSN] = useState<{ codice: string; value: string } | null>(null);

  const mercatoEcografie = data?.mercatoEcografie;
  const mercatoEcografi = data?.mercatoEcografi;
  const prezziRegionalizzati = data?.prezziEcografieRegionalizzati;
  const regioniMondiali = data?.regioniMondiali;
  const configTamSamSom = data?.configurazioneTamSamSom?.ecografie;
  const configTamSamSomDevices = data?.configurazioneTamSamSom?.ecografi;

  // Carica configurazione salvata al mount (SOLO UNA VOLTA)
  useEffect(() => {
    if (configTamSamSom && configTamSamSomDevices && !isInitialized) {
      // Carica Procedures
      setPriceMode(configTamSamSom.priceMode || 'semplice');
      setPrezzoMedioProcedura(configTamSamSom.prezzoMedioProcedura || 77.5);
      setVolumeMode(configTamSamSom.volumeMode || 'totale');
      setSamPercentage(configTamSamSom.samPercentage || 35);
      setSomPercentages(configTamSamSom.somPercentages || { y1: 0.5, y3: 2, y5: 5 });
      
      if ((configTamSamSom as any).regioniSelezionate) {
        setSelectedRegions((configTamSamSom as any).regioniSelezionate);
      }
      
      // Carica Devices
      setSamPercentageDevices(configTamSamSomDevices.samPercentage || 50);
      setSomPercentagesDevices(configTamSamSomDevices.somPercentages || { y1: 1, y3: 2, y5: 5 });
      
      if ((configTamSamSomDevices as any).regioniAttive) {
        setRegioniAttive((configTamSamSomDevices as any).regioniAttive);
      }
      
      if (configTamSamSomDevices.prezzoMedioDispositivo !== undefined) {
        setPrezzoMedio(configTamSamSomDevices.prezzoMedioDispositivo);
      }
      
      if ((configTamSamSomDevices as any).prezziMediDispositivi) {
        setPrezziDispositivi((configTamSamSomDevices as any).prezziMediDispositivi);
      }
      
      setIsInitialized(true); // Blocca ricaricamenti successivi
      console.log('✅ Configurazione TAM/SAM/SOM caricata dal database (Procedures + Devices)');
    }
  }, [configTamSamSom, configTamSamSomDevices, isInitialized]);

  // Serializza selectedRegions per evitare loop infinito
  const selectedRegionsJson = useMemo(() => JSON.stringify(selectedRegions), [selectedRegions]);

  // Auto-salva configurazione Procedures quando cambiano i parametri (con debounce 1.5s)
  useEffect(() => {
    // Skip se non inizializzato (evita salvataggio durante caricamento iniziale)
    if (!configTamSamSom || !isInitialized) return;
    if (!mercatoEcografie) return;
    
    const timer = setTimeout(async () => {
      // Calcola proiezioni inline (per evitare dipendenza circolare)
      const baseYear = 2025;
      const growthRate = 0.03;
      const projections = [];
      const tamBase = calculateTAMValue();
      
      for (let i = 0; i < 11; i++) {
        const year = baseYear + i;
        const tamYear = tamBase * Math.pow(1 + growthRate, i);
        const samYear = tamYear * (samPercentage / 100);
        
        let somPercentage = somPercentages.y1;
        if (i <= 3) {
          somPercentage = somPercentages.y1 + ((somPercentages.y3 - somPercentages.y1) / 3) * i;
        } else if (i <= 5) {
          somPercentage = somPercentages.y3 + ((somPercentages.y5 - somPercentages.y3) / 2) * (i - 3);
        } else {
          somPercentage = somPercentages.y5 + (somPercentages.y5 - somPercentages.y3) * 0.3 * (i - 5);
        }
        
        const somYear = samYear * (somPercentage / 100);
        
        projections.push({
          year,
          tam: Math.round(tamYear),
          sam: Math.round(samYear),
          som: Math.round(somYear),
          somPercentage: Math.round(somPercentage * 100) / 100
        });
      }
      
      // Valori correnti (anno 2025)
      const currentYearData = projections[0];
      
      // Salva parametri configurabili + valori calcolati + proiezioni
      await updateConfigurazioneTamSamSomEcografie({
        priceMode,
        prezzoMedioProcedura,
        regioniSelezionate: JSON.parse(selectedRegionsJson),
        volumeMode,
        samPercentage,
        somPercentages,
        // NUOVO: Valori calcolati per l'anno corrente
        valoriCalcolati: {
          tam: currentYearData.tam,
          sam: currentYearData.sam,
          som1: projections[0].som,
          som3: projections[2]?.som || 0,
          som5: projections[4]?.som || 0
        },
        // NUOVO: Proiezioni 10 anni
        proiezioni: projections
      } as any);
      
      console.log('💾 Configurazione TAM/SAM/SOM Procedures salvata automaticamente (con proiezioni)');
    }, 1500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    priceMode, 
    prezzoMedioProcedura, 
    selectedRegionsJson, 
    volumeMode, 
    samPercentage, 
    somPercentages,
    isInitialized,
    mercatoEcografie
  ]);

  // Serializza regioniAttive con useMemo per evitare ricalcolo ad ogni render
  const regioniAttiveJson = useMemo(() => JSON.stringify(regioniAttive), [regioniAttive]);
  
  // Serializza prezziDispositivi con useMemo per evitare loop infinito
  const prezziDispositiviJson = useMemo(() => JSON.stringify(prezziDispositivi), [prezziDispositivi]);

  // 🚀 CALCOLO INIZIALE PROCEDURES: Calcola e salva valori al primo mount (SENZA debounce)
  useEffect(() => {
    // Esegui SOLO dopo inizializzazione
    if (!isInitialized) {
      console.log('⏳ [Procedures] Aspetto inizializzazione per calcolare valori...');
      return;
    }
    if (!configTamSamSom) {
      console.log('⚠️ [Procedures] configTamSamSom non disponibile');
      return;
    }
    
    // IMPORTANTE: Aspetta che mercatoEcografie sia caricato!
    if (!mercatoEcografie) {
      console.log('⏳ [Procedures] Aspetto caricamento mercatoEcografie...');
      return;
    }
    
    // 🎯 VERIFICA SE I VALORI SONO GIÀ VALIDI NEL DB → SKIP CALCOLO
    const existingProceduresValues = configTamSamSom.valoriCalcolati;
    const existingProceduresProjections = (configTamSamSom as any).proiezioni;
    
    console.log('💾 [Procedures] Valori esistenti nel DB:', existingProceduresValues);
    
    // SE i valori esistono già nel DB E sono validi → SKIP calcolo
    const hasValidProceduresValues = existingProceduresValues && 
                          existingProceduresValues.tam > 0 && 
                          existingProceduresValues.sam > 0 && 
                          existingProceduresValues.som1 > 0 &&
                          existingProceduresProjections &&
                          existingProceduresProjections.length > 0;
    
    if (hasValidProceduresValues) {
      console.log('✅ [Procedures] Valori già validi nel DB - SKIP ricalcolo');
      return;
    }
    
    // 🔄 Solo se non ci sono valori validi → Calcola
    console.log('🔄 [Procedures] Calcolo valori al mount (non trovati nel DB)...');
    
    // 🎯 USA VALORI DAL DB invece degli state (che potrebbero essere ancora ai default)
    const dbPriceMode = configTamSamSom.priceMode || 'semplice';
    const dbVolumeMode = configTamSamSom.volumeMode || 'totale';
    const dbPrezzoMedio = configTamSamSom.prezzoMedioProcedura || 77.5;
    const dbSamPercentage = configTamSamSom.samPercentage || 35;
    const dbSomPercentages = configTamSamSom.somPercentages || { y1: 0.5, y3: 2, y5: 5 };
    const dbSelectedRegions = (configTamSamSom as any).regioniSelezionate || selectedRegions;
    console.log('📦 [Procedures] Dati dal DB:', {
      mercatoEcografie: !!mercatoEcografie,
      dbPriceMode,
      dbVolumeMode,
      dbPrezzoMedio,
      dbSamPercentage,
      dbSomPercentages,
      dbSelectedRegions
    });
    console.log('📦 [Procedures] Dati dagli state (potrebbero essere default):', {
      priceMode,
      volumeMode,
      prezzoMedioProcedura,
      samPercentage,
      somPercentages
    });
    
    // 🔄 Ricalcola TAM usando i valori dal DB (non calculateTAMValue che usa gli state!)
    const prestazioni = mercatoEcografie.italia.prestazioni;
    const aggredibili = prestazioni.filter((p: any) => p.aggredibile);
    
    // Helper inline per calcolare volumi (come calculateVolumes ma senza dipendenze da useCallback)
    const calcVolumes = (prestazione: any, regione: 'italia' | 'europa' | 'usa' | 'cina' = 'italia') => {
      const colE = (prestazione.U || 0) + (prestazione.B || 0) + (prestazione.D || 0) + (prestazione.P || 0);
      const percExtraSSN = prestazione.percentualeExtraSSN || 0;
      
      const moltiplicatore = regione === 'italia' 
        ? 1 
        : (regioniMondiali?.[regione]?.moltiplicatoreVolume || 1);
      
      const volumeSSN = Math.round(colE * moltiplicatore);
      const volumeExtraSSN = Math.round((colE * moltiplicatore) * (percExtraSSN / 100));
      const volumeTotale = volumeSSN + volumeExtraSSN;
      
      return { totale: volumeTotale, ssn: volumeSSN, extraSsn: volumeExtraSSN };
    };
    
    const getVolumeByMode = (proc: any, regione: 'italia' | 'europa' | 'usa' | 'cina' = 'italia') => {
      const volumes = calcVolumes(proc, regione);
      switch (dbVolumeMode) {
        case 'ssn': return volumes.ssn;
        case 'extraSsn': return volumes.extraSsn;
        default: return volumes.totale;
      }
    };
    
    let tamBase = 0;
    
    if (dbPriceMode === 'semplice') {
      const volumeTotale = aggredibili.reduce((sum: number, p: any) => sum + getVolumeByMode(p, 'italia'), 0);
      tamBase = volumeTotale * dbPrezzoMedio;
    } else if (dbPriceMode === 'perProcedura' && prezziRegionalizzati) {
      const prezziItalia = prezziRegionalizzati.italia || [];
      aggredibili.forEach((proc: any) => {
        const prezzoInfo = prezziItalia.find((p: any) => p.codice === proc.codice);
        if (!prezzoInfo) {
          tamBase += getVolumeByMode(proc, 'italia') * dbPrezzoMedio;
          return;
        }
        
        const volumes = calcVolumes(proc, 'italia');
        if (dbVolumeMode === 'totale') {
          tamBase += volumes.ssn * (prezzoInfo.prezzoPubblico || dbPrezzoMedio);
          tamBase += volumes.extraSsn * (prezzoInfo.prezzoPrivato || dbPrezzoMedio);
        } else if (dbVolumeMode === 'ssn') {
          tamBase += volumes.ssn * (prezzoInfo.prezzoPubblico || dbPrezzoMedio);
        } else {
          tamBase += volumes.extraSsn * (prezzoInfo.prezzoPrivato || dbPrezzoMedio);
        }
      });
    } else if (dbPriceMode === 'regionalizzato' && prezziRegionalizzati) {
      // Calcolo preciso per Regionalizzato con multi-selezione regioni
      Object.entries(dbSelectedRegions).forEach(([regione, isActive]) => {
        if (!isActive) return;
        
        const regioneKey = regione as 'italia' | 'europa' | 'usa' | 'cina';
        const prezziRegione = prezziRegionalizzati[regioneKey] || [];
        
        aggredibili.forEach((proc: any) => {
          const prezzoInfo = prezziRegione.find((p: any) => p.codice === proc.codice);
          if (!prezzoInfo) {
            tamBase += getVolumeByMode(proc, regioneKey) * dbPrezzoMedio;
            return;
          }
          
          const volumes = calcVolumes(proc, regioneKey);
          if (dbVolumeMode === 'totale') {
            tamBase += volumes.ssn * (prezzoInfo.prezzoPubblico || dbPrezzoMedio);
            tamBase += volumes.extraSsn * (prezzoInfo.prezzoPrivato || dbPrezzoMedio);
          } else if (dbVolumeMode === 'ssn') {
            tamBase += volumes.ssn * (prezzoInfo.prezzoPubblico || dbPrezzoMedio);
          } else {
            tamBase += volumes.extraSsn * (prezzoInfo.prezzoPrivato || dbPrezzoMedio);
          }
        });
      });
    }
    
    console.log('📊 [Procedures] TAM Base calcolato con valori DB:', tamBase);
    
    if (tamBase === 0) {
      console.log('⚠️ [Procedures] TAM = 0, skip salvataggio');
      return;
    }
    
    // Calcola proiezioni usando i valori dal DB
    const baseYear = 2025;
    const growthRate = 0.03;
    const projections = [];
    
    for (let i = 0; i < 11; i++) {
      const year = baseYear + i;
      const tamYear = tamBase * Math.pow(1 + growthRate, i);
      const samYear = tamYear * (dbSamPercentage / 100);
      
      // 🎯 USA dbSomPercentages invece di somPercentages (state)
      let somPercentage = dbSomPercentages.y1;
      if (i <= 3) {
        somPercentage = dbSomPercentages.y1 + ((dbSomPercentages.y3 - dbSomPercentages.y1) / 3) * i;
      } else if (i <= 5) {
        somPercentage = dbSomPercentages.y3 + ((dbSomPercentages.y5 - dbSomPercentages.y3) / 2) * (i - 3);
      } else {
        somPercentage = dbSomPercentages.y5 + (dbSomPercentages.y5 - dbSomPercentages.y3) * 0.3 * (i - 5);
      }
      
      const somYear = samYear * (somPercentage / 100);
      
      projections.push({
        year,
        tam: Math.round(tamYear),
        sam: Math.round(samYear),
        som: Math.round(somYear),
        somPercentage: Math.round(somPercentage * 100) / 100
      });
    }
    
    // Valori correnti (anno 2025)
    const currentYearData = projections[0];
    
    console.log('📊 [Procedures] Valori calcolati FINALI:', {
      tam: currentYearData.tam,
      sam: currentYearData.sam,
      som1: projections[0].som,
      som3: projections[2]?.som || 0,
      som5: projections[4]?.som || 0
    });
    
    // Verifica se valori calcolati esistono già nel DB
    const existingValues = configTamSamSom.valoriCalcolati;
    console.log('💾 [Procedures] Valori esistenti nel DB:', existingValues);
    
    // Salva se i valori sono diversi o se som1 è zero
    const needsUpdate = !existingValues || 
                        existingValues.tam !== currentYearData.tam || 
                        existingValues.sam !== currentYearData.sam || 
                        existingValues.som1 !== projections[0].som ||
                        existingValues.som1 === 0; // Forza update se som1 è zero
    
    if (needsUpdate) {
      console.log('💾 [Procedures] Salvo valori calcolati nel DB...');
      
      updateConfigurazioneTamSamSomEcografie({
        priceMode,
        prezzoMedioProcedura,
        regioniSelezionate: JSON.parse(selectedRegionsJson),
        volumeMode,
        samPercentage,
        somPercentages,
        valoriCalcolati: {
          tam: currentYearData.tam,
          sam: currentYearData.sam,
          som1: projections[0].som,
          som3: projections[2]?.som || 0,
          som5: projections[4]?.som || 0
        },
        proiezioni: projections
      } as any);
      
      console.log('🚀 [Procedures] Valori calcolati inizializzati al mount');
    } else {
      console.log('✅ [Procedures] Valori calcolati già aggiornati nel DB:', existingValues);
    }
    
    // Esegui quando isInitialized E mercatoEcografie sono disponibili
    // NOTA: usa configTamSamSom invece degli state per avere i valori dal DB
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mercatoEcografie, configTamSamSom, prezziRegionalizzati, regioniMondiali]);

  // 🚀 CALCOLO INIZIALE DEVICES: Calcola e salva valori al primo mount (SENZA debounce)
  useEffect(() => {
    // Esegui SOLO dopo inizializzazione
    if (!isInitialized) {
      console.log('⏳ [Devices] Aspetto inizializzazione per calcolare valori...');
      return;
    }
    if (!configTamSamSomDevices) {
      console.log('⚠️ [Devices] configTamSamSomDevices non disponibile');
      return;
    }
    
    // IMPORTANTE: Aspetta che mercatoEcografi sia caricato!
    if (!mercatoEcografi) {
      console.log('⏳ Aspetto caricamento mercatoEcografi...');
      return;
    }
    
    // Verifica se valori calcolati esistono già nel DB
    const existingValues = configTamSamSomDevices.valoriCalcolati;
    const existingUnits = configTamSamSomDevices.dispositiviUnita;
    
    console.log('💾 Valori esistenti nel DB:', existingValues, existingUnits);
    
    // 🎯 SE i valori esistono già nel DB E sono validi → SKIP calcolo
    const hasValidValues = existingValues && 
                          existingValues.tam > 0 && 
                          existingValues.sam > 0 && 
                          existingValues.som1 > 0 &&
                          existingUnits &&
                          existingUnits.tam > 0;
    
    if (hasValidValues) {
      console.log('✅ [Devices] Valori già validi nel DB - SKIP ricalcolo');
      return;
    }
    
    // 🔄 Solo se non ci sono valori validi → Calcola
    console.log('🔄 [Devices] Calcolo valori al mount (non trovati nel DB)...');
    console.log('📦 Dati disponibili:', {
      mercatoEcografi: !!mercatoEcografi,
      numeroEcografi: mercatoEcografi?.numeroEcografi?.length || 0,
      regioniAttive,
      samPercentageDevices,
      somPercentagesDevices
    });
    
    // Calcola valori aggiornati DEVICES
    const metrics = calculateDevicesMetrics();
    const { tam, sam, som1, som3, som5 } = metrics;
    
    console.log('📊 Valori Devices calcolati:', { tam, sam, som1, som3, som5 });
    
    // Salva i valori calcolati
    if (true) {
      // Salva SENZA debounce (immediato)
      console.log('💾 Salvo valori calcolati nel DB...');
      
      // 🆕 Calcola anche UNITÀ di dispositivi per tutti i 5 anni
      const unitsMetrics = calculateDevicesUnitsMetrics();
      
      updateConfigurazioneTamSamSomEcografi({
        samPercentage: samPercentageDevices,
        somPercentages: somPercentagesDevices,
        regioniAttive: JSON.parse(regioniAttiveJson),
        prezzoMedioDispositivo: prezzoMedio,
        prezziMediDispositivi: JSON.parse(prezziDispositiviJson),
        valoriCalcolati: {
          tam,
          sam,
          som1,
          som3,
          som5
        },
        // 🆕 Aggiungi unità dispositivi per tutti i 5 anni (con interpolazione)
        dispositiviUnita: {
          tam: unitsMetrics.tamDispositivi,
          sam: unitsMetrics.samDispositivi,
          som1: unitsMetrics.som1Dispositivi,
          som2: unitsMetrics.som2Dispositivi,  // ← INTERPOLATO
          som3: unitsMetrics.som3Dispositivi,
          som4: unitsMetrics.som4Dispositivi,  // ← INTERPOLATO
          som5: unitsMetrics.som5Dispositivi
        }
      } as any);
      
      console.log('🚀 Valori calcolati inizializzati al mount:', { tam, sam, som1, som3, som5 }, 'Units:', unitsMetrics);
    } else {
      console.log('✅ Valori calcolati già aggiornati nel DB:', existingValues);
    }
    
    // Esegui quando isInitialized E mercatoEcografi sono disponibili
    // IMPORTANTE: Ricalcola anche quando cambiano le configurazioni devices (regioni, percentuali, prezzi)
    // NOTA: NON dipende da activeView perché calcola sempre valori devices
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mercatoEcografi, regioniAttiveJson, samPercentageDevices, somPercentagesDevices, prezziDispositiviJson, selectedYear]);

  // Auto-salva configurazione Devices quando cambiano i parametri (con debounce 1.5s)
  useEffect(() => {
    // Skip se non inizializzato (evita salvataggio durante caricamento iniziale)
    if (!isInitialized) return;
    if (!configTamSamSomDevices) return;
    // Skip se sta editando prezzi (evita loop infinito durante editing inline)
    if (isEditingPrice) return;
    
    const timer = setTimeout(async () => {
      // Calcola valori aggiornati per salvarli nel database
      // IMPORTANTE: Usa calculateDevicesMetrics() che calcola VALORE DI MERCATO in €
      // (non calculateTotalDevices() che restituisce solo unità)
      const metrics = activeView === 'devices' ? calculateDevicesMetrics() : { tam: 0, sam: 0, som1: 0, som3: 0, som5: 0 };
      const { tam, sam, som1, som3, som5 } = metrics;
      
      // 🆕 Calcola anche UNITÀ di dispositivi (non solo valori €) per tutti i 5 anni
      const unitsMetrics = activeView === 'devices' ? calculateDevicesUnitsMetrics() : { 
        tamDispositivi: 0, 
        samDispositivi: 0, 
        som1Dispositivi: 0, 
        som2Dispositivi: 0, 
        som3Dispositivi: 0, 
        som4Dispositivi: 0, 
        som5Dispositivi: 0 
      };
      
      await updateConfigurazioneTamSamSomEcografi({
        samPercentage: samPercentageDevices,
        somPercentages: somPercentagesDevices,
        regioniAttive: JSON.parse(regioniAttiveJson),
        prezzoMedioDispositivo: prezzoMedio,  // SOURCE OF TRUTH - sincronizzato con Revenue Model
        prezziMediDispositivi: JSON.parse(prezziDispositiviJson),
        valoriCalcolati: {
          tam,
          sam,
          som1,
          som3,
          som5
        },
        // 🆕 Aggiungi unità dispositivi per tutti i 5 anni (con interpolazione)
        dispositiviUnita: {
          tam: unitsMetrics.tamDispositivi,
          sam: unitsMetrics.samDispositivi,
          som1: unitsMetrics.som1Dispositivi,
          som2: unitsMetrics.som2Dispositivi,  // ← INTERPOLATO
          som3: unitsMetrics.som3Dispositivi,
          som4: unitsMetrics.som4Dispositivi,  // ← INTERPOLATO
          som5: unitsMetrics.som5Dispositivi
        }
      } as any);
      
      console.log('💾 Configurazione TAM/SAM/SOM Devices salvata automaticamente', { tam, sam, som1, som3, som5 });
    }, 1500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    samPercentageDevices,
    somPercentagesDevices,
    regioniAttiveJson, // FIX: Usa useMemo per evitare loop infinito
    prezzoMedio, // SOURCE OF TRUTH per ASP dispositivi
    prezziDispositiviJson, // FIX: Usa useMemo per evitare loop infinito
    selectedYear, // Ricalcola quando cambia l'anno
    activeView, // Ricalcola solo quando è vista devices
    isInitialized // Aggiungi isInitialized per evitare salvataggio prima dell'init
  ]);

  // Toggle aggredibile (NO RELOAD!)
  async function toggleAggredibile(code: string) {
    if (!mercatoEcografie) return;
    try {
      await toggleAggredibileDB(code);
      // Non serve setHasChanges - il toggle è salvato direttamente nel DB
      console.log('✅ Toggle salvato:', code);
    } catch (error) {
      console.error('❌ Errore toggle:', error);
      alert('❌ Errore durante il salvataggio');
    }
  }

  // Helper per calcolare volumi SSN/ExtraSSN/Totale con moltiplicatore regionale
  // FORMULA CORRETTA (come MercatoEcografie):
  // colE (SSN) = U + B + D + P
  // extraSSN = colE × (percentuale/100)
  // totale = colE + extraSSN
  const calculateVolumes = useCallback((prestazione: any, regione: 'italia' | 'europa' | 'usa' | 'cina' = 'italia') => {
    // Calcola colE (Volume SSN) = somma di tutte le colonne come in MercatoEcografie
    const colE = (prestazione.U || 0) + (prestazione.B || 0) + (prestazione.D || 0) + (prestazione.P || 0);
    const percExtraSSN = prestazione.percentualeExtraSSN || 0;
    
    // Ottieni moltiplicatore di volume dalla regione (Italia = 1, default)
    const moltiplicatore = regione === 'italia' 
      ? 1 
      : (regioniMondiali?.[regione]?.moltiplicatoreVolume || 1);
    
    // Applica moltiplicatore
    const volumeSSN = Math.round(colE * moltiplicatore);
    const volumeExtraSSN = Math.round((colE * moltiplicatore) * (percExtraSSN / 100));
    const volumeTotale = volumeSSN + volumeExtraSSN;
    
    return {
      totale: volumeTotale,
      ssn: volumeSSN,
      extraSsn: volumeExtraSSN
    };
  }, [regioniMondiali]);

  // Helper per ottenere volume basato su volumeMode per una regione specifica
  const getVolume = useCallback((prestazione: any, regione: 'italia' | 'europa' | 'usa' | 'cina' = 'italia') => {
    const volumes = calculateVolumes(prestazione, regione);
    switch (volumeMode) {
      case 'ssn': return volumes.ssn;
      case 'extraSsn': return volumes.extraSsn;
      default: return volumes.totale;
    }
  }, [volumeMode, calculateVolumes]);

  // Calcoli TAM/SAM/SOM (prima dei return condizionali per hooks)
  const calculateTAMValue = useCallback(() => {
    if (!mercatoEcografie) return 0;
    
    if (activeView === 'procedures') {
      const prestazioni = mercatoEcografie.italia.prestazioni;
      const aggredibili = prestazioni.filter(p => p.aggredibile);
      
      if (priceMode === 'semplice') {
        const volumeTotale = aggredibili.reduce((sum, p) => sum + getVolume(p, 'italia'), 0);
        return volumeTotale * prezzoMedioProcedura;
      } else if (priceMode === 'perProcedura' && prezziRegionalizzati) {
        // Calcolo preciso per Procedures
        const prezziItalia = prezziRegionalizzati.italia || [];
        let tamTotale = 0;
        
        aggredibili.forEach(proc => {
          const prezzoInfo = prezziItalia.find((p: any) => p.codice === proc.codice);
          if (!prezzoInfo) {
            // Fallback al prezzo medio se non trovato
            tamTotale += getVolume(proc, 'italia') * prezzoMedioProcedura;
            return;
          }
          
          // Calcolo preciso basato su volumeMode
          if (volumeMode === 'totale') {
            // Volume SSN × Prezzo Pubblico + Volume ExtraSSN × Prezzo Privato
            const volumes = calculateVolumes(proc, 'italia');
            tamTotale += volumes.ssn * (prezzoInfo.prezzoPubblico || prezzoMedioProcedura);
            tamTotale += volumes.extraSsn * (prezzoInfo.prezzoPrivato || prezzoMedioProcedura);
          } else if (volumeMode === 'ssn') {
            // Solo Volume SSN × Prezzo Pubblico
            const volumes = calculateVolumes(proc, 'italia');
            tamTotale += volumes.ssn * (prezzoInfo.prezzoPubblico || prezzoMedioProcedura);
          } else {
            // Solo Volume ExtraSSN × Prezzo Privato
            const volumes = calculateVolumes(proc, 'italia');
            tamTotale += volumes.extraSsn * (prezzoInfo.prezzoPrivato || prezzoMedioProcedura);
          }
        });
        return tamTotale;
      } else if (priceMode === 'regionalizzato' && prezziRegionalizzati) {
        // Calcolo preciso per Regionalizzato con multi-selezione regioni
        let tamTotale = 0;
        
        // Itera su tutte le regioni selezionate
        Object.entries(selectedRegions).forEach(([regione, isActive]) => {
          if (!isActive) return;
          
          const regioneKey = regione as 'italia' | 'europa' | 'usa' | 'cina';
          const prezziRegione = prezziRegionalizzati[regioneKey] || [];
          
          aggredibili.forEach(proc => {
            const prezzoInfo = prezziRegione.find((p: any) => p.codice === proc.codice);
            if (!prezzoInfo) {
              // Fallback al prezzo medio
              tamTotale += getVolume(proc, regioneKey) * prezzoMedioProcedura;
              return;
            }
            
            // Calcolo preciso basato su volumeMode
            if (volumeMode === 'totale') {
              const volumes = calculateVolumes(proc, regioneKey);
              tamTotale += volumes.ssn * (prezzoInfo.prezzoPubblico || prezzoMedioProcedura);
              tamTotale += volumes.extraSsn * (prezzoInfo.prezzoPrivato || prezzoMedioProcedura);
            } else if (volumeMode === 'ssn') {
              const volumes = calculateVolumes(proc, regioneKey);
              tamTotale += volumes.ssn * (prezzoInfo.prezzoPubblico || prezzoMedioProcedura);
            } else {
              const volumes = calculateVolumes(proc, regioneKey);
              tamTotale += volumes.extraSsn * (prezzoInfo.prezzoPrivato || prezzoMedioProcedura);
            }
          });
        });
        return tamTotale;
      }
      
      const volumeTotale = aggredibili.reduce((sum, p) => sum + getVolume(p, 'italia'), 0);
      return volumeTotale * prezzoMedioProcedura;
    } else {
      if (!mercatoEcografi) return 0;
      const anno2025 = mercatoEcografi.proiezioniItalia?.find((p: any) => p.anno === 2025);
      if (!anno2025) return 0;
      const marketValueM = anno2025.media || anno2025.mediana || 0;
      return marketValueM * 1000000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mercatoEcografie, mercatoEcografi, priceMode, volumeMode, prezzoMedioProcedura, selectedRegions, prezziRegionalizzati, getVolume, calculateVolumes]);

  // Helper: Calcola numero totale dispositivi TAM (con logica sovrapposizione Italia-Europa)
  const calculateTotalDevices = useCallback(() => {
    if (!mercatoEcografi) return 0;
    
    const yearKey = `unita${selectedYear}`;
    let total = 0;
    
    // LOGICA SOVRAPPOSIZIONE: Se Italia ED Europa sono entrambi attivi, 
    // NON sommare Italia (è già inclusa in Europa)
    if (regioniAttive.italia && !regioniAttive.europa) {
      total += Number((mercatoEcografi?.numeroEcografi?.find((m: any) => m.mercato === 'Italia') as any)?.[yearKey]) || 0;
    }
    
    if (regioniAttive.europa) {
      total += Number((mercatoEcografi?.numeroEcografi?.find((m: any) => m.mercato === 'Europa') as any)?.[yearKey]) || 0;
    }
    
    if (regioniAttive.usa) {
      total += Number((mercatoEcografi?.numeroEcografi?.find((m: any) => m.mercato === 'Stati Uniti') as any)?.[yearKey]) || 0;
    }
    
    if (regioniAttive.cina) {
      total += Number((mercatoEcografi?.numeroEcografi?.find((m: any) => m.mercato === 'Cina') as any)?.[yearKey]) || 0;
    }
    
    return Math.round(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mercatoEcografi, selectedYear, regioniAttiveJson]);

  // Helper: Calcola dispositivi SAM (proporzionale al TAM)
  const calculateSamDevices = useCallback(() => {
    const tamDevices = calculateTotalDevices();
    const percentage = activeView === 'procedures' ? samPercentage : samPercentageDevices;
    return Math.round(tamDevices * (percentage / 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateTotalDevices, samPercentage, samPercentageDevices, activeView]);

  // Helper: Calcola dispositivi SOM (proporzionale al SAM)
  const calculateSomDevices = useCallback((year: 'y1' | 'y3' | 'y5') => {
    const samDevices = calculateSamDevices();
    const percentages = activeView === 'procedures' ? somPercentages : somPercentagesDevices;
    return Math.round(samDevices * (percentages[year] / 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateSamDevices, somPercentages, somPercentagesDevices, activeView]);

  // 🆕 Calcola NUMERO DI DISPOSITIVI (unità, non valori in €) per tutti gli anni con interpolazione
  const calculateDevicesUnitsMetrics = useCallback(() => {
    const tamUnits = calculateTotalDevices();
    const samUnits = Math.round(tamUnits * (samPercentageDevices / 100));
    const som1Units = Math.round(samUnits * (somPercentagesDevices.y1 / 100));
    const som3Units = Math.round(samUnits * (somPercentagesDevices.y3 / 100));
    const som5Units = Math.round(samUnits * (somPercentagesDevices.y5 / 100));
    
    // Interpolazione lineare per anno 2 e anno 4
    const som2Units = Math.round(som1Units + (som3Units - som1Units) / 2);
    const som4Units = Math.round(som3Units + (som5Units - som3Units) / 2);
    
    return {
      tamDispositivi: tamUnits,
      samDispositivi: samUnits,
      som1Dispositivi: som1Units,
      som2Dispositivi: som2Units,  // ← INTERPOLATO
      som3Dispositivi: som3Units,
      som4Dispositivi: som4Units,  // ← INTERPOLATO
      som5Dispositivi: som5Units
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateTotalDevices, samPercentageDevices, somPercentagesDevices]);

  // Helper: Calcola numero totale prestazioni aggredibili per Procedures
  const calculateTotalProcedures = useCallback(() => {
    if (!mercatoEcografie) return 0;
    const prestazioni = mercatoEcografie.italia?.prestazioni || [];
    const aggredibili = prestazioni.filter(p => p.aggredibile);
    return aggredibili.reduce((sum, p) => sum + getVolume(p, 'italia'), 0);
  }, [mercatoEcografie, getVolume]);

  // Calcola TAM/SAM/SOM Devices
  const calculateDevicesMetrics = useCallback(() => {
    if (!mercatoEcografi) return { tam: 0, sam: 0, som1: 0, som3: 0, som5: 0 };
    
    // USA LO STATE LOCALE, NON IL DATABASE! (per evitare loop infinito)
    const prezziMedi = prezziDispositivi;
    const yearKey = `unita${selectedYear}` as keyof typeof mercatoEcografi.numeroEcografi[0];
    
    let tamDevices = 0;
    
    ['carrellati', 'portatili', 'palmari'].forEach((categoriaId) => {
      const tipologia = mercatoEcografi.tipologie?.find((t: any) => t.id === categoriaId);
      if (!tipologia) return;
      
      const prezzoCategoria = categoriaId === 'carrellati' ? prezziMedi.carrellati :
                             categoriaId === 'portatili' ? prezziMedi.portatili :
                             prezziMedi.palmari;
      
      // LOGICA SOVRAPPOSIZIONE: Se Italia ED Europa sono entrambi attivi, 
      // NON sommare Italia (è già inclusa in Europa)
      const volumeItalia = (regioniAttive.italia && !regioniAttive.europa) 
        ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Italia')?.[yearKey]) || 0) * (tipologia.quotaIT || 0)) 
        : 0;
      
      const volumeEuropa = regioniAttive.europa ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Europa')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
      const volumeUSA = regioniAttive.usa ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Stati Uniti')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
      const volumeCina = regioniAttive.cina ? Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Cina')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0)) : 0;
      
      const volumeTotale = volumeItalia + volumeEuropa + volumeUSA + volumeCina;
      tamDevices += volumeTotale * prezzoCategoria;
    });
    
    const samDevices = tamDevices * (samPercentageDevices / 100);
    const som1Devices = samDevices * (somPercentagesDevices.y1 / 100);
    const som3Devices = samDevices * (somPercentagesDevices.y3 / 100);
    const som5Devices = samDevices * (somPercentagesDevices.y5 / 100);
    
    return { tam: tamDevices, sam: samDevices, som1: som1Devices, som3: som3Devices, som5: som5Devices };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mercatoEcografi,
    selectedYear,
    regioniAttiveJson, // ← SERIALIZZATO per evitare loop (invece di regioniAttive)
    prezziDispositiviJson, // ← SERIALIZZATO per evitare loop (invece di prezziDispositivi)
    samPercentageDevices,
    somPercentagesDevices
  ]);
  
  // 🆕 Calcola proiezioni Procedures per 11 anni (2025-2035)
  const calculateProceduresProjections = useCallback(() => {
    const baseYear = 2025;
    const growthRate = 0.03; // Crescita annua mercato 3% (assumiamo)
    const projections = [];
    
    // Calcolo TAM base (anno 2025)
    const tamBase = calculateTAMValue();
    
    for (let i = 0; i < 11; i++) {
      const year = baseYear + i;
      // TAM cresce del growthRate ogni anno
      const tamYear = tamBase * Math.pow(1 + growthRate, i);
      const samYear = tamYear * (samPercentage / 100);
      
      // SOM cresce progressivamente nel tempo (interpolazione Y1 → Y3 → Y5)
      let somPercentage = somPercentages.y1;
      if (i <= 3) {
        // Anni 0-3: interpola tra Y1 e Y3
        somPercentage = somPercentages.y1 + ((somPercentages.y3 - somPercentages.y1) / 3) * i;
      } else if (i <= 5) {
        // Anni 4-5: interpola tra Y3 e Y5
        somPercentage = somPercentages.y3 + ((somPercentages.y5 - somPercentages.y3) / 2) * (i - 3);
      } else {
        // Anni 6-9: continua crescita oltre Y5 (assume crescita lineare)
        somPercentage = somPercentages.y5 + (somPercentages.y5 - somPercentages.y3) * 0.3 * (i - 5);
      }
      
      const somYear = samYear * (somPercentage / 100);
      
      projections.push({
        year,
        tam: Math.round(tamYear),
        sam: Math.round(samYear),
        som: Math.round(somYear),
        somPercentage: Math.round(somPercentage * 100) / 100
      });
    }
    
    return projections;
  }, [calculateTAMValue, samPercentage, somPercentages]);
  
  // Valori Procedures (memoizzati per evitare ricalcoli)
  // 🎯 USA SEMPRE valoriCalcolati DAL DB - MAI calcolare durante render
  const proceduresMetrics = useMemo(() => {
    // 1. USA valoriCalcolati dal DB (fonte unica di verità)
    const savedValues = (configTamSamSom as any)?.valoriCalcolati;
    
    if (savedValues && savedValues.tam !== undefined) {
      // Usa i valori già calcolati e salvati nel DB
      return {
        tam: savedValues.tam || 0,
        sam: savedValues.sam || 0,
        som1: savedValues.som1 || 0,
        som3: savedValues.som3 || 0,
        som5: savedValues.som5 || 0
      };
    }
    
    // 2. Se valoriCalcolati non esiste, prova con proiezioni
    const savedProjections = (configTamSamSom as any)?.proiezioni;
    if (savedProjections && savedProjections.length > 0) {
      return {
        tam: savedProjections[0]?.tam || 0,
        sam: savedProjections[0]?.sam || 0,
        som1: savedProjections[0]?.som || 0,
        som3: savedProjections[2]?.som || 0,
        som5: savedProjections[4]?.som || 0
      };
    }
    
    // 3. ULTIMO RESORT: Ritorna zero invece di calcolare (evita state non sincronizzati)
    console.warn('⚠️ [Procedures] Nessun dato salvato nel DB - mostrando 0');
    return {
      tam: 0,
      sam: 0,
      som1: 0,
      som3: 0,
      som5: 0
    };
  }, [configTamSamSom]);
  
  // Valori Devices (ANCHE QUESTI memoizzati!)
  // 🎯 USA SEMPRE valoriCalcolati DAL DB - MAI calcolare durante render
  const devicesMetrics = useMemo(() => {
    // 1. USA valoriCalcolati dal DB (fonte unica di verità)
    const savedValues = (configTamSamSomDevices as any)?.valoriCalcolati;
    
    if (savedValues && savedValues.tam !== undefined) {
      // Usa i valori già calcolati e salvati nel DB
      return {
        tam: savedValues.tam || 0,
        sam: savedValues.sam || 0,
        som1: savedValues.som1 || 0,
        som3: savedValues.som3 || 0,
        som5: savedValues.som5 || 0
      };
    }
    
    // 2. ULTIMO RESORT: Ritorna zero invece di calcolare (evita state non sincronizzati)
    console.warn('⚠️ [Devices] Nessun dato salvato nel DB - mostrando 0');
    return {
      tam: 0,
      sam: 0,
      som1: 0,
      som3: 0,
      som5: 0
    };
  }, [configTamSamSomDevices]);
  
  // Valori da mostrare nelle card (memoizzati per evitare refresh)
  const currentMetrics = useMemo(() => {
    if (activeView === 'procedures') {
      return proceduresMetrics;
    } else {
      return devicesMetrics;
    }
  }, [activeView, proceduresMetrics, devicesMetrics]);
  
  const tam = currentMetrics.tam;
  const sam = currentMetrics.sam;
  const som1 = currentMetrics.som1;
  const som3 = currentMetrics.som3;
  const som5 = currentMetrics.som5;
  
  // Percentuali da mostrare nelle card (memoizzate)
  const currentSamPercentage = useMemo(
    () => activeView === 'procedures' ? samPercentage : samPercentageDevices,
    [activeView, samPercentage, samPercentageDevices]
  );
  const currentSomPercentages = useMemo(
    () => activeView === 'procedures' ? somPercentages : somPercentagesDevices,
    [activeView, somPercentages, somPercentagesDevices]
  );

  // DISABILITATO AUTO-SAVE - causava loop infinito e reload continui!
  // Salvataggio manuale solo quando utente modifica esplicitamente un valore

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Caricamento dati...</p>
      </div>
    );
  }

  // Error
  if (!mercatoEcografie) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
        <Info className="h-16 w-16 text-orange-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Dati non disponibili</h3>
        <Button onClick={() => window.location.reload()}>Ricarica</Button>
      </div>
    );
  }

  // Helper formatCurrency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `€${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const prestazioni = mercatoEcografie.italia.prestazioni;
  const aggredibili = prestazioni.filter(p => p.aggredibile);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="h-8 w-8 text-indigo-600" />
              TAM / SAM / SOM Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Total Addressable Market • Serviceable Available Market • Serviceable Obtainable Market
            </p>
          </div>
          {hasChanges && (
            <Badge className="bg-green-600">✅ Salvato</Badge>
          )}
        </div>

        {/* Toggle View */}
        <div className="flex gap-3">
          <Button
            variant={activeView === 'procedures' ? 'default' : 'outline'}
            onClick={() => setActiveView('procedures')}
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Vista Esami (Procedures)
          </Button>
          <Button
            variant={activeView === 'devices' ? 'default' : 'outline'}
            onClick={() => setActiveView('devices')}
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-2" />
            Vista Dispositivi (Devices)
          </Button>
        </div>
        
        {/* 🆕 Selettore Anno per Procedures */}
        {activeView === 'procedures' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-blue-900">
                📅 Anno di Riferimento (Proiezione):
              </label>
              <Badge variant="outline" className="text-blue-700 border-blue-400">
                {selectedYearProcedures}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((year) => (
                <Button
                  key={year}
                  variant={selectedYearProcedures === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYearProcedures(year)}
                  className={selectedYearProcedures === year ? 'bg-blue-600 text-white' : 'border-blue-300 hover:bg-blue-100'}
                >
                  {year}
                </Button>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              ℹ️ Seleziona l&apos;anno per visualizzare le proiezioni TAM/SAM/SOM basate su crescita 3% annua del mercato
            </p>
          </div>
        )}
        
        {/* 🆕 Selettore Anno per Devices (duplicato dal selettore nella tabella) */}
        {activeView === 'devices' && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-emerald-900">
                📅 Anno di Riferimento (Proiezione Dispositivi):
              </label>
              <Badge variant="outline" className="text-emerald-700 border-emerald-400">
                {selectedYear}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? 'bg-emerald-600 text-white' : 'border-emerald-300 hover:bg-emerald-100'}
                >
                  {year}
                </Button>
              ))}
            </div>
            <p className="text-xs text-emerald-700 mt-2">
              ℹ️ Stesso anno usato nella tabella &quot;Mercato Dispositivi Ecografi&quot; qui sotto
            </p>
          </div>
        )}
      </Card>

      {/* Metriche Principali con Tooltip */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TAM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">TAM</h3>
                  <Globe className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(tam)}</div>
                <p className="text-sm opacity-75">Mercato Totale Indirizzabile</p>
                {activeView === 'devices' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>📅 Anno: <strong>{selectedYear}</strong></div>
                      <div>🌍 {Object.entries(regioniAttive).filter(([_, v]) => v).map(([k]) => k === 'italia' ? '🇮🇹' : k === 'europa' ? '🇪🇺' : k === 'usa' ? '🇺🇸' : '🇨🇳').join(' ')}</div>
                      <div>📊 Dispositivi: <strong>{calculateTotalDevices().toLocaleString('it-IT')}</strong></div>
                    </div>
                  </div>
                )}
                {activeView === 'procedures' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>🌍 Mercato: <strong>🇮🇹 Italia</strong></div>
                      <div>📊 Prestazioni: <strong>{calculateTotalProcedures().toLocaleString('it-IT')}</strong></div>
                    </div>
                  </div>
                )}
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-blue-300">
              <div className="space-y-2">
                <div className="font-bold text-blue-900 text-sm">📊 Formula TAM:</div>
                {activeView === 'devices' ? (
                  <div className="text-xs space-y-1">
                    <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Dispositivi × Prezzo medio per tipo)</div>
                    <div className="text-gray-700">
                      • Anno: <strong>{selectedYear}</strong><br/>
                      • Regioni attive: <strong>{Object.entries(regioniAttive).filter(([_, v]) => v).map(([k]) => k === 'italia' ? '🇮🇹 IT' : k === 'europa' ? '🇪🇺 EU' : k === 'usa' ? '🇺🇸 US' : '🇨🇳 CN').join(', ')}</strong><br/>
                      • Dispositivi totali: <strong>{calculateTotalDevices().toLocaleString('it-IT')}</strong><br/>
                      • <strong>TAM = {formatCurrency(tam)}</strong>
                      {regioniAttive.italia && regioniAttive.europa && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800">
                          ⚠️ Italia è inclusa in Europa, conteggio automatico senza duplicati
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {priceMode === 'semplice' && (
                      <div className="text-xs space-y-1">
                        <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Volume × Prezzo medio)</div>
                        <div className="text-gray-700">
                          • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                          • Volume totale: <strong>{(mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).reduce((sum, p) => sum + p.P, 0) || 0).toLocaleString('it-IT')}</strong><br/>
                          • Prezzo medio: <strong>€{prezzoMedioProcedura.toFixed(2)}</strong><br/>
                          • <strong>TAM = {formatCurrency(tam)}</strong>
                        </div>
                      </div>
                    )}
                    {priceMode === 'perProcedura' && (
                      <div className="text-xs space-y-1">
                        <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ(Vol.SSN × Prezzo Pubbl. + Vol.Extra × Prezzo Priv.)</div>
                        <div className="text-gray-700">
                          • Modalità: <strong>Per Procedura (Italia) - Calcolo Preciso</strong><br/>
                          • Calcolo automatico basato su volumeMode selezionato<br/>
                          • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                          • <strong>TAM = {formatCurrency(tam)}</strong>
                        </div>
                      </div>
                    )}
                    {priceMode === 'regionalizzato' && (
                      <div className="text-xs space-y-1">
                        <div className="font-mono bg-blue-50 p-2 rounded">TAM = Σ Multi-Regioni (Vol × Prezzi regionali)</div>
                        <div className="text-gray-700">
                          • Regioni: <strong>{Object.entries(selectedRegions).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}</strong><br/>
                          • Calcolo automatico preciso per ogni regione<br/>
                          • Procedure aggredibili: <strong>{mercatoEcografie?.italia.prestazioni.filter(p => p.aggredibile).length || 0}</strong><br/>
                          • <strong>TAM = {formatCurrency(tam)}</strong>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* SAM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">SAM</h3>
                  <Target className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(sam)}</div>
                <p className="text-sm opacity-75">Mercato Servibile ({currentSamPercentage}% TAM)</p>
                {activeView === 'devices' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>📅 Anno: <strong>{selectedYear}</strong></div>
                      <div>📊 Dispositivi: <strong>{calculateSamDevices().toLocaleString('it-IT')}</strong></div>
                      <div>🎯 SAM: <strong>{currentSamPercentage}% del TAM</strong></div>
                    </div>
                  </div>
                )}
                {activeView === 'procedures' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>📊 Prestazioni: <strong>{Math.round(calculateTotalProcedures() * (currentSamPercentage / 100)).toLocaleString('it-IT')}</strong></div>
                      <div>🎯 SAM: <strong>{currentSamPercentage}% del TAM</strong></div>
                    </div>
                  </div>
                )}
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-indigo-300">
              <div className="space-y-2">
                <div className="font-bold text-indigo-900 text-sm">🎯 Formula SAM ({activeView === 'procedures' ? 'Procedures' : 'Devices'}):</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono bg-indigo-50 p-2 rounded">SAM = TAM × (SAM% / 100)</div>
                  <div className="text-gray-700">
                    • TAM: <strong>{formatCurrency(tam)}</strong><br/>
                    • Percentuale SAM: <strong>{currentSamPercentage}%</strong><br/>
                    • Calcolo: {formatCurrency(tam)} × ({currentSamPercentage}/100)<br/>
                    • <strong>SAM = {formatCurrency(sam)}</strong>
                  </div>
                  <div className="mt-2 p-2 bg-indigo-50 rounded text-gray-600">
                    💡 SAM è la porzione del TAM che puoi realisticamente raggiungere considerando limiti geografici, capacità operativa, concorrenza.
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* SOM Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-help">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold opacity-90">SOM Y1</h3>
                  <TrendingUp className="h-6 w-6 opacity-75" />
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(som1)}</div>
                <p className="text-sm opacity-75">Mercato Ottenibile Anno 1</p>
                {activeView === 'devices' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>📅 Anno: <strong>{selectedYear}</strong></div>
                      <div>📊 Dispositivi: <strong>{calculateSomDevices('y1').toLocaleString('it-IT')}</strong></div>
                      <div>📈 Y1: {currentSomPercentages.y1}% | Y3: {currentSomPercentages.y3}% | Y5: {currentSomPercentages.y5}%</div>
                    </div>
                  </div>
                )}
                {activeView === 'procedures' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-90 space-y-1">
                      <div>📊 Prestazioni: <strong>{Math.round(calculateTotalProcedures() * (currentSamPercentage / 100) * (currentSomPercentages.y1 / 100)).toLocaleString('it-IT')}</strong></div>
                      <div>📈 Y1: {currentSomPercentages.y1}% | Y3: {currentSomPercentages.y3}% | Y5: {currentSomPercentages.y5}%</div>
                    </div>
                  </div>
                )}
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4 bg-white border-2 border-purple-300">
              <div className="space-y-2">
                <div className="font-bold text-purple-900 text-sm">📈 Formula SOM (Anno 1):</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono bg-purple-50 p-2 rounded">SOM = SAM × (SOM% / 100)</div>
                  <div className="text-gray-700">
                    • SAM: <strong>{formatCurrency(sam)}</strong><br/>
                    • Percentuale SOM (Y1): <strong>{currentSomPercentages.y1}%</strong><br/>
                    • Calcolo: {formatCurrency(sam)} × ({currentSomPercentages.y1}/100)<br/>
                    • <strong>SOM (Y1) = {formatCurrency(som1)}</strong>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="text-gray-600">📅 Proiezioni multi-anno:</div>
                    <div className="p-2 bg-blue-50 rounded">
                      • Anno 1 ({currentSomPercentages.y1}%): <strong>{formatCurrency(som1)}</strong>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded">
                      • Anno 3 ({currentSomPercentages.y3}%): <strong>{formatCurrency(som3)}</strong>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      • Anno 5 ({currentSomPercentages.y5}%): <strong>{formatCurrency(som5)}</strong>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-purple-50 rounded text-gray-600">
                    💡 SOM è la quota di SAM che prevedi realisticamente di conquistare considerando risorse, tempo, strategia go-to-market.
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* SAM Percentage Slider - Condizionale */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Percentuale SAM Customizzabile <Badge variant="outline">{activeView === 'procedures' ? 'Procedures' : 'Devices'}</Badge>
            </h3>
            <p className="text-sm text-gray-600">Regola la percentuale di TAM che consideri servibile</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {activeView === 'procedures' ? samPercentage : samPercentageDevices}%
          </Badge>
        </div>
        <Slider
          value={[activeView === 'procedures' ? samPercentage : samPercentageDevices]}
          onValueChange={(value) => {
            if (activeView === 'procedures') {
              setSamPercentage(value[0]);
            } else {
              setSamPercentageDevices(value[0]);
            }
            setHasChanges(true);
          }}
          min={1}
          max={100}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Configurazione Prezzi Multi-Livello - Solo per Procedures */}
      <Card className={`p-6 ${activeView !== 'procedures' ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Configurazione Prezzi Procedure
            </h3>
            <p className="text-sm text-gray-600 mt-1">Scegli il livello di dettaglio per il calcolo TAM</p>
          </div>
          <Button
            variant={showPriceEditor ? "default" : "outline"}
            onClick={() => setShowPriceEditor(!showPriceEditor)}
            size="sm"
          >
            {showPriceEditor ? 'Nascondi' : 'Configura Prezzi'}
          </Button>
        </div>
        
        {showPriceEditor && (
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
            {/* Selezione Modalità */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                📊 Modalità di Calcolo Prezzi
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('semplice');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'semplice' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">🎯 Semplice</div>
                  <div className="text-xs text-gray-600">Prezzo medio generale</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('perProcedura');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'perProcedura' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">📋 Per Procedura</div>
                  <div className="text-xs text-gray-600">Prezzi specifici (Italia)</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('regionalizzato');
                    setHasChanges(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    priceMode === 'regionalizzato' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">🌍 Regionalizzato</div>
                  <div className="text-xs text-gray-600">Prezzi per regione</div>
                </button>
              </div>
            </div>

            {/* MODALITÀ SEMPLICE */}
            {priceMode === 'semplice' && (
              <div className="p-4 bg-white rounded-lg border">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Prezzo Medio per Esame: €{prezzoMedioProcedura.toFixed(2)}
                </label>
                <Slider
                  value={[prezzoMedioProcedura]}
                  onValueChange={(value) => {
                    setPrezzoMedioProcedura(value[0]);
                    setHasChanges(true);
                  }}
                  min={30}
                  max={150}
                  step={0.5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>€30 (SSN)</span>
                  <span>€90 (Medio)</span>
                  <span>€150 (Privato)</span>
                </div>
              </div>
            )}

            {/* MODALITÀ PER PROCEDURA */}
            {priceMode === 'perProcedura' && (
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>✅ Calcolo Preciso Automatico:</strong><br/>
                    • Se Volume = Totale → Volume SSN × Prezzo Pubblico + Volume ExtraSSN × Prezzo Privato<br/>
                    • Se Volume = Solo SSN → Volume SSN × Prezzo Pubblico<br/>
                    • Se Volume = Solo ExtraSSN → Volume ExtraSSN × Prezzo Privato<br/>
                    <span className="text-xs opacity-75 mt-1 block">I prezzi provengono dall&apos;Excel regionalizzato (regione Italia).</span>
                  </p>
                </div>
              </div>
            )}

            {/* MODALITÀ VOLUME (per tutti i priceMode) */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-200">
              <label className="text-sm font-semibold text-gray-800 mb-3 block">
                📊 Modalità Volume per Calcolo TAM
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVolumeMode('totale')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'totale'
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">📊 Volume Totale</div>
                  <div className="text-xs opacity-75 mt-1">SSN + ExtraSSN</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMode('ssn')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'ssn'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">🏥 Solo SSN</div>
                  <div className="text-xs opacity-75 mt-1">Pubblico</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMode('extraSsn')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    volumeMode === 'extraSsn'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="font-bold">💳 Solo Extra-SSN</div>
                  <div className="text-xs opacity-75 mt-1">Privato</div>
                </button>
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs text-gray-700">
                <strong>Modalità attiva:</strong> {volumeMode === 'totale' ? '📊 Volume Totale' : volumeMode === 'ssn' ? '🏥 Solo SSN' : '💳 Solo Extra-SSN'} • 
                Il calcolo TAM userà {volumeMode === 'totale' ? 'il volume completo' : volumeMode === 'ssn' ? 'solo i volumi SSN' : 'solo i volumi Extra-SSN'} delle procedure
              </div>
            </div>

            {/* MODALITÀ REGIONALIZZATA */}
            {priceMode === 'regionalizzato' && (
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    🌍 Seleziona Regioni (Multi-selezione)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['italia', 'europa', 'usa', 'cina'] as const).map(region => (
                      <label
                        key={region}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRegions[region]
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRegions[region]}
                          onChange={(e) => {
                            setSelectedRegions({
                              ...selectedRegions,
                              [region]: e.target.checked
                            });
                            setHasChanges(true);
                          }}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">
                          {region === 'italia' && '🇮🇹 Italia'}
                          {region === 'europa' && '🇪🇺 Europa'}
                          {region === 'usa' && '🇺🇸 USA'}
                          {region === 'cina' && '🇨🇳 Cina'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-800">
                    <strong>✅ Calcolo Preciso Automatico Multi-Regione:</strong><br/>
                    Per ogni regione selezionata:<br/>
                    • Se Volume = Totale → Volume SSN × Prezzo Pubblico + Volume ExtraSSN × Prezzo Privato<br/>
                    • Se Volume = Solo SSN → Volume SSN × Prezzo Pubblico<br/>
                    • Se Volume = Solo ExtraSSN → Volume ExtraSSN × Prezzo Privato<br/>
                    <span className="text-xs opacity-75 mt-1 block">I prezzi provengono dall&apos;Excel regionalizzato per ciascuna regione.</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Proiezioni SOM - Condizionali */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Proiezioni SOM Multi-Anno (Personalizzabili)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 font-semibold mb-1">Anno 1 ({currentSomPercentages.y1}% SAM)</div>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(som1)}</div>
              {activeView === 'devices' && (
                <div className="mt-2 pt-2 border-t border-blue-300">
                  <div className="text-xs text-blue-600">
                    📊 Dispositivi: <strong>{calculateSomDevices('y1').toLocaleString('it-IT')}</strong>
                  </div>
                </div>
              )}
            </div>
            <div className="px-2">
              <Slider
                value={[currentSomPercentages.y1]}
                onValueChange={(value) => {
                  if (activeView === 'procedures') {
                    setSomPercentages({...somPercentages, y1: value[0]});
                  } else {
                    setSomPercentagesDevices({...somPercentagesDevices, y1: value[0]});
                  }
                  setHasChanges(true);
                }}
                min={0.1}
                max={10}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{currentSomPercentages.y1}%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-700 font-semibold mb-1">Anno 3 ({currentSomPercentages.y3}% SAM)</div>
              <div className="text-2xl font-bold text-indigo-900">{formatCurrency(som3)}</div>
              {activeView === 'devices' && (
                <div className="mt-2 pt-2 border-t border-indigo-300">
                  <div className="text-xs text-indigo-600">
                    📊 Dispositivi: <strong>{calculateSomDevices('y3').toLocaleString('it-IT')}</strong>
                  </div>
                </div>
              )}
            </div>
            <div className="px-2">
              <Slider
                value={[currentSomPercentages.y3]}
                onValueChange={(value) => {
                  if (activeView === 'procedures') {
                    setSomPercentages({...somPercentages, y3: value[0]});
                  } else {
                    setSomPercentagesDevices({...somPercentagesDevices, y3: value[0]});
                  }
                  setHasChanges(true);
                }}
                min={0.1}
                max={20}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{currentSomPercentages.y3}%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 font-semibold mb-1">Anno 5 ({currentSomPercentages.y5}% SAM)</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(som5)}</div>
              {activeView === 'devices' && (
                <div className="mt-2 pt-2 border-t border-purple-300">
                  <div className="text-xs text-purple-600">
                    📊 Dispositivi: <strong>{calculateSomDevices('y5').toLocaleString('it-IT')}</strong>
                  </div>
                </div>
              )}
            </div>
            <div className="px-2">
              <Slider
                value={[currentSomPercentages.y5]}
                onValueChange={(value) => {
                  if (activeView === 'procedures') {
                    setSomPercentages({...somPercentages, y5: value[0]});
                  } else {
                    setSomPercentagesDevices({...somPercentagesDevices, y5: value[0]});
                  }
                  setHasChanges(true);
                }}
                min={0.1}
                max={30}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1%</span>
                <span>{currentSomPercentages.y5}%</span>
                <span>30%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Le percentuali SOM rappresentano la quota di SAM che prevedi di conquistare.
            Valori conservativi: Y1=0.5%, Y3=2%, Y5=5%. Valori ottimistici: Y1=2%, Y3=10%, Y5=20%.
          </p>
        </div>
      </Card>

      {/* Sezione Potenziale Ricavi (solo per Devices) */}
      <Card className={`p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 ${activeView !== 'devices' ? 'hidden' : ''}`}>
          <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            💰 Potenziale Ricavi (Prezzo Vendita × Dispositivi SOM)
          </h3>
          
          {/* Prezzo Medio Dispositivo - SOURCE OF TRUTH (sincronizzato con Revenue Model) */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-400">
            <label className="text-sm font-semibold text-emerald-800 mb-2 block">
              💶 Prezzo ASP Medio Dispositivo:
            </label>
            {editingPrezzoMedio !== null ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editingPrezzoMedio}
                  onChange={(e) => setEditingPrezzoMedio(e.target.value)}
                  onBlur={() => {
                    const newPrice = parseFloat(editingPrezzoMedio);
                    if (!isNaN(newPrice) && newPrice > 0) {
                      setPrezzoMedio(newPrice);
                    }
                    setEditingPrezzoMedio(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newPrice = parseFloat(editingPrezzoMedio);
                      if (!isNaN(newPrice) && newPrice > 0) {
                        setPrezzoMedio(newPrice);
                      }
                      setEditingPrezzoMedio(null);
                    } else if (e.key === 'Escape') {
                      setEditingPrezzoMedio(null);
                    }
                  }}
                  className="flex-1 px-3 py-2 border-2 border-emerald-500 rounded-lg font-mono text-lg"
                  autoFocus
                />
                <span className="text-gray-500">€</span>
              </div>
            ) : (
              <div 
                onClick={() => setEditingPrezzoMedio(prezzoMedio.toString())}
                className="cursor-pointer hover:bg-emerald-100 p-3 rounded-lg border-2 border-emerald-200 transition-all"
              >
                <div className="text-2xl font-bold text-emerald-900">
                  €{prezzoMedio.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ✏️ Click per modificare (sincronizzato con Revenue Model)
                </div>
              </div>
            )}
          </div>

          {/* Card Ricavi Y1, Y3, Y5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-lg border-2 border-blue-300">
              <div className="text-sm text-blue-700 font-semibold mb-1">
                Anno 1 ({currentSomPercentages.y1}% SAM)
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                €{(calculateSomDevices('y1') * prezzoMedio).toLocaleString('it-IT')}
              </div>
              <div className="text-xs text-gray-600 border-t border-blue-200 pt-2">
                <div>📊 Dispositivi: <strong>{calculateSomDevices('y1').toLocaleString('it-IT')}</strong></div>
                <div className="text-blue-600 mt-1">💶 {calculateSomDevices('y1')} × €{prezzoMedio.toLocaleString('it-IT')}</div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border-2 border-indigo-300">
              <div className="text-sm text-indigo-700 font-semibold mb-1">
                Anno 3 ({currentSomPercentages.y3}% SAM)
              </div>
              <div className="text-3xl font-bold text-indigo-900 mb-2">
                €{(calculateSomDevices('y3') * prezzoMedio).toLocaleString('it-IT')}
              </div>
              <div className="text-xs text-gray-600 border-t border-indigo-200 pt-2">
                <div>📊 Dispositivi: <strong>{calculateSomDevices('y3').toLocaleString('it-IT')}</strong></div>
                <div className="text-indigo-600 mt-1">💶 {calculateSomDevices('y3')} × €{prezzoMedio.toLocaleString('it-IT')}</div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border-2 border-purple-300">
              <div className="text-sm text-purple-700 font-semibold mb-1">
                Anno 5 ({currentSomPercentages.y5}% SAM)
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">
                €{(calculateSomDevices('y5') * prezzoMedio).toLocaleString('it-IT')}
              </div>
              <div className="text-xs text-gray-600 border-t border-purple-200 pt-2">
                <div>📊 Dispositivi: <strong>{calculateSomDevices('y5').toLocaleString('it-IT')}</strong></div>
                <div className="text-purple-600 mt-1">💶 {calculateSomDevices('y5')} × €{prezzoMedio.toLocaleString('it-IT')}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-100 rounded border border-emerald-300">
            <p className="text-xs text-emerald-900">
              <strong>💡 Nota:</strong> Questi sono i ricavi potenziali calcolati moltiplicando il numero di dispositivi SOM per il prezzo di vendita.
              Il prezzo è salvato nel database e sarà coerente in tutte le pagine dell&apos;applicazione.
            </p>
          </div>
        </Card>

      {/* Vista Procedures */}
      <Card className={`p-6 ${activeView !== 'procedures' ? 'hidden' : ''}`}>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📋 Procedure Ecografiche Aggredibili
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-gray-600 font-semibold">Seleziona Mercato:</span>
              <div className="flex gap-2">
                {(['italia', 'europa', 'usa', 'cina'] as const).map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setTableRegion(region)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tableRegion === region
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region === 'italia' ? '🇮🇹 Italia' : 
                     region === 'europa' ? '🇪🇺 Europa' :
                     region === 'usa' ? '🇺🇸 USA' : '🇨🇳 Cina'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Totale: <strong>{prestazioni.length}</strong></span>
              <span className="text-green-700">Aggredibili: <strong>{aggredibili.length}</strong></span>
              <span className="text-gray-600">Coverage: <strong>{((aggredibili.length / prestazioni.length) * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Aggredibile</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Codice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. Totale</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. SSN</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol. Extra-SSN</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Extra SSN %</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Prezzo SSN €</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">Prezzo Privato €</th>
                </tr>
              </thead>
              <tbody>
                {prestazioni.map((p) => {
                  // Usa tableRegion per volumi E prezzi della regione selezionata
                  const volumes = calculateVolumes(p, tableRegion);
                  const prezzoInfo = prezziRegionalizzati?.[tableRegion]?.find((pr: any) => pr.codice === p.codice);
                  const prezzoSSN = prezzoInfo?.prezzoPubblico || Math.round(prezzoMedioProcedura);
                  const prezzoPrivato = prezzoInfo?.prezzoPrivato || Math.round(prezzoMedioProcedura * 1.3);
                  
                  return (
                  <tr 
                    key={p.codice}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${p.aggredibile ? 'bg-green-50/50' : ''}`}
                  >
                    {/* Aggredibile - Pattern Budget: td onClick invece di button */}
                    <td 
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => toggleAggredibile(p.codice)}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                        p.aggredibile ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}>
                        {p.aggredibile ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <XCircle className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 font-mono text-sm">{p.codice}</td>
                    <td className={`px-4 py-3 ${p.aggredibile ? 'font-semibold' : ''}`}>{p.nome}</td>
                    
                    {/* Volume Totale */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                      {volumes.totale.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Volume SSN */}
                    <td className="px-4 py-3 text-right font-mono text-blue-700">
                      {volumes.ssn.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Volume Extra-SSN */}
                    <td className="px-4 py-3 text-right font-mono text-green-700">
                      {volumes.extraSsn.toLocaleString('it-IT')}
                    </td>
                    
                    {/* Extra SSN % Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingExtraSSN) {
                          setEditingExtraSSN({ codice: p.codice, value: p.percentualeExtraSSN.toString() });
                        }
                      }}
                    >
                      {editingExtraSSN?.codice === p.codice ? (
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={editingExtraSSN.value}
                          onChange={(e) => setEditingExtraSSN({ ...editingExtraSSN, value: e.target.value })}
                          onBlur={async () => {
                            const newPerc = parseInt(editingExtraSSN.value);
                            if (!isNaN(newPerc) && newPerc >= 0 && newPerc <= 100) {
                              try {
                                await setPercentualeExtraSSN(p.codice, newPerc);
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio Extra SSN %:', error);
                              }
                            }
                            setEditingExtraSSN(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingExtraSSN(null);
                          }}
                          className="w-16 px-2 py-1 text-right border-2 border-orange-400 rounded focus:outline-none focus:border-orange-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-orange-50">
                          <Badge variant="outline">{p.percentualeExtraSSN}%</Badge>
                        </div>
                      )}
                    </td>
                    
                    {/* Prezzo SSN Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingPrice) {
                          setEditingPrice({ codice: p.codice, tipo: 'pubblico', value: prezzoSSN.toString() });
                        }
                      }}
                    >
                      {editingPrice?.codice === p.codice && editingPrice.tipo === 'pubblico' ? (
                        <input
                          type="number"
                          step="1"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })}
                          onBlur={async () => {
                            const newPrice = parseInt(editingPrice.value);
                            if (!isNaN(newPrice)) {
                              try {
                                await updatePrezzoEcografiaRegionalizzato(
                                  tableRegion,
                                  p.codice,
                                  { prezzoPubblico: newPrice }
                                );
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio prezzo SSN:', error);
                              }
                            }
                            setEditingPrice(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                          className="w-20 px-2 py-1 text-right border-2 border-blue-400 rounded focus:outline-none focus:border-blue-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-blue-50 font-mono text-blue-700">
                          €{prezzoSSN}
                        </div>
                      )}
                    </td>
                    
                    {/* Prezzo Privato Editabile */}
                    <td 
                      className="px-4 py-3 text-right group cursor-pointer"
                      onClick={() => {
                        if (!editingPrice) {
                          setEditingPrice({ codice: p.codice, tipo: 'privato', value: prezzoPrivato.toString() });
                        }
                      }}
                    >
                      {editingPrice?.codice === p.codice && editingPrice.tipo === 'privato' ? (
                        <input
                          type="number"
                          step="1"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })}
                          onBlur={async () => {
                            const newPrice = parseInt(editingPrice.value);
                            if (!isNaN(newPrice)) {
                              try {
                                await updatePrezzoEcografiaRegionalizzato(
                                  tableRegion,
                                  p.codice,
                                  { prezzoPrivato: newPrice }
                                );
                                setHasChanges(true);
                                setTimeout(() => setHasChanges(false), 3000);
                              } catch (error) {
                                console.error('❌ Errore salvataggio prezzo Privato:', error);
                              }
                            }
                            setEditingPrice(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                          className="w-20 px-2 py-1 text-right border-2 border-green-400 rounded focus:outline-none focus:border-green-600 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 rounded hover:bg-green-50 font-mono text-green-700">
                          €{prezzoPrivato}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      {/* Vista Devices */}
      {mercatoEcografi && (
      <Card className={`p-6 ${activeView !== 'devices' ? 'hidden' : ''}`}>
          <TooltipProvider>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🔬 Mercato Dispositivi Ecografi
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Analisi del mercato globale dispositivi ecografici per categoria hardware.
                    Volumi da {mercatoEcografi.numeroEcografi?.length || 0} mercati regionali.
                  </p>
                </TooltipContent>
              </Tooltip>
            </h3>

            {/* Controlli: Anno + Toggle Regioni */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Selector Anno */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Anno:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(year => (
                    <option key={year} value={year}>📅 {year}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Regioni per Calcolo TAM */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Regioni nel TAM:</span>
                {['italia', 'europa', 'usa', 'cina'].map(regione => (
                  <label key={regione} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regioniAttive[regione as keyof typeof regioniAttive]}
                      onChange={() => setRegioniAttive(prev => ({ ...prev, [regione]: !prev[regione as keyof typeof regioniAttive] }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {regione === 'italia' && '🇮🇹 Italia'}
                      {regione === 'europa' && '🇪🇺 Europa'}
                      {regione === 'usa' && '🇺🇸 USA'}
                      {regione === 'cina' && '🇨🇳 Cina'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          {/* Tabella Categorie Hardware */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">% Mercato</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-700">Prezzo Medio €</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Italia</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Europa</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. USA</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-blue-700">Vol. Cina</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-green-700">TAM Categoria</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calcola volumi totali per riga finale
                  let totalItalia = 0;
                  let totalEuropa = 0;
                  let totalUSA = 0;
                  let totalCina = 0;
                  let totalTAM = 0;

                  const rows = ['carrellati', 'portatili', 'palmari'].map((categoriaId) => {
                    const tipologia = mercatoEcografi.tipologie?.find((t: any) => t.id === categoriaId);
                    if (!tipologia) return null;

                    // Prezzi medi dallo state (modificabili)
                    const prezzoMedio = prezziDispositivi[categoriaId as keyof typeof prezziDispositivi];

                    // Volumi per regione (anno selezionato) × quota categoria
                    const yearKey = `unita${selectedYear}` as keyof typeof mercatoEcografi.numeroEcografi[0];
                    const volumeItalia = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Italia')?.[yearKey]) || 0) * (tipologia.quotaIT || 0));
                    const volumeEuropa = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Europa')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));
                    const volumeUSA = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Stati Uniti')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));
                    const volumeCina = Math.round((Number(mercatoEcografi.numeroEcografi?.find((m: any) => m.mercato === 'Cina')?.[yearKey]) || 0) * (tipologia.quotaGlobale || 0));

                    // TAM categoria = solo regioni attive × prezzo
                    const tamCategoria = (
                      (regioniAttive.italia ? volumeItalia : 0) +
                      (regioniAttive.europa ? volumeEuropa : 0) +
                      (regioniAttive.usa ? volumeUSA : 0) +
                      (regioniAttive.cina ? volumeCina : 0)
                    ) * prezzoMedio;

                    // Accumula totali
                    totalItalia += volumeItalia;
                    totalEuropa += volumeEuropa;
                    totalUSA += volumeUSA;
                    totalCina += volumeCina;
                    totalTAM += tamCategoria;

                    return (
                      <tr key={categoriaId} className="border-b border-gray-100 hover:bg-gray-50">
                        {/* Categoria */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tipologia.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{tipologia.nome}</div>
                              <div className="text-xs text-gray-500">{tipologia.note?.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>

                        {/* % Mercato */}
                        <td className="px-4 py-3 text-right">
                          <Badge variant="outline">
                            IT: {(tipologia.quotaIT * 100).toFixed(1)}%
                          </Badge>
                        </td>

                        {/* Prezzo Medio Editabile (Inline) */}
                        <td className="px-4 py-3 text-right">
                          {editingPrezzoDispositivo?.tipo === categoriaId ? (
                            <input
                              type="number"
                              value={editingPrezzoDispositivo.value}
                              onChange={(e) => setEditingPrezzoDispositivo({ tipo: categoriaId as any, value: e.target.value })}
                              onBlur={() => {
                                const newPrice = parseFloat(editingPrezzoDispositivo.value);
                                if (!isNaN(newPrice) && newPrice > 0) {
                                  // Aggiorna SOLO state locale (auto-save gestirà il DB)
                                  setPrezziDispositivi(prev => ({
                                    ...prev,
                                    [categoriaId]: newPrice
                                  }));
                                }
                                setEditingPrezzoDispositivo(null);
                                // Sblocca auto-save DOPO un breve delay (evita conflitto)
                                setTimeout(() => setIsEditingPrice(false), 100);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const newPrice = parseFloat(editingPrezzoDispositivo.value);
                                  if (!isNaN(newPrice) && newPrice > 0) {
                                    // Aggiorna SOLO state locale (auto-save gestirà il DB)
                                    setPrezziDispositivi(prev => ({
                                      ...prev,
                                      [categoriaId]: newPrice
                                    }));
                                  }
                                  setEditingPrezzoDispositivo(null);
                                  // Sblocca auto-save DOPO un breve delay (evita conflitto)
                                  setTimeout(() => setIsEditingPrice(false), 100);
                                } else if (e.key === 'Escape') {
                                  setEditingPrezzoDispositivo(null);
                                  setIsEditingPrice(false);
                                }
                              }}
                              className="w-full px-2 py-1 border-2 border-indigo-500 rounded font-mono text-indigo-700 font-bold text-right"
                              autoFocus
                            />
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingPrezzoDispositivo({ tipo: categoriaId as any, value: prezzoMedio.toString() });
                                setIsEditingPrice(true); // Blocca auto-save
                              }}
                              className="px-2 py-1 rounded hover:bg-indigo-50 font-mono text-indigo-700 font-bold transition-colors cursor-pointer group"
                            >
                              €{prezzoMedio.toLocaleString('it-IT')}
                              <span className="ml-1 text-xs opacity-0 group-hover:opacity-100">✏️</span>
                            </div>
                          )}
                        </td>

                        {/* Volumi per regione */}
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.italia ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeItalia.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.europa ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeEuropa.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.usa ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeUSA.toLocaleString('it-IT')}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${regioniAttive.cina ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                          {volumeCina.toLocaleString('it-IT')}
                        </td>

                        {/* TAM Categoria */}
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-green-600">{formatCurrency(tamCategoria)}</Badge>
                        </td>
                      </tr>
                    );
                  });

                  // Riga Totale
                  rows.push(
                    <tr key="totale" className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📊</span>
                          <span className="font-bold text-gray-900">TOTALE</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.italia ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalItalia.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.europa ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalEuropa.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.usa ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalUSA.toLocaleString('it-IT')}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${regioniAttive.cina ? 'text-blue-900' : 'text-gray-400'}`}>
                        {totalCina.toLocaleString('it-IT')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-green-700 text-lg">{formatCurrency(totalTAM)}</Badge>
                      </td>
                    </tr>
                  );

                  return rows;
                })()}
              </tbody>
            </table>
          </div>

          {/* Note Calcolo */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Calcolo TAM Devices:</strong> Per ogni categoria: (Vol. Italia + Vol. Europa + Vol. USA + Vol. Cina) × Prezzo Medio.
              Quote mercato: Italia usa quotaIT, altre regioni usano quotaGlobale.
            </p>
          </div>
          </TooltipProvider>
        </Card>
      )}

      {/* Note */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-700 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Formula TAM:</strong> Σ(Volume procedure aggredibili × €{prezzoMedioProcedura.toFixed(2)}) = {formatCurrency(tam)}<br/>
            <strong>Formula SAM:</strong> TAM × {samPercentage}% = {formatCurrency(sam)}<br/>
            <strong>Formula SOM:</strong> SAM × [{somPercentages.y1}% / {somPercentages.y3}% / {somPercentages.y5}%]
          </div>
        </div>
      </Card>
    </div>
  );
}
