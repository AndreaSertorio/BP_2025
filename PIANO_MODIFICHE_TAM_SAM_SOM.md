# PIANO MODIFICHE COMPLETE TAM/SAM/SOM Dashboard

## ✅ COMPLETATO
1. ✅ Aggiunto useEffect/useCallback agli import
2. ✅ Caricamento configurazione da DB al mount
3. ✅ Aggiunta funzione saveConfiguration
4. ✅ Aggiunto state volumeMode
5. ✅ Aggiunto state showRegionalPriceEditor

## 🚧 DA IMPLEMENTARE SUBITO

### 1. CALCOLO VOLUMI SINCRONIZZATO
```typescript
// Helper per calcolare volumi basati su percentualeExtraSSN
const calculateVolumes = (prestazione) => {
  const total = prestazione.P;
  const percExtraSSN = prestazione.percentualeExtraSSN || 0;
  
  return {
    totale: total,
    ssn: Math.round(total * (1 - percExtraSSN / 100)),
    extraSsn: Math.round(total * (percExtraSSN / 100))
  };
};
```

### 2. UPDATE calculateTAM per supportare volumeMode
```typescript
const calculateTAM = () => {
  if (activeView === 'procedures') {
    const prestazioni = mercatoEcografie.italia.prestazioni;
    const aggredibili = prestazioni.filter(p => p.aggredibile);
    
    // Calcola volume basato su volumeMode
    const getVolume = (p) => {
      const volumes = calculateVolumes(p);
      switch (volumeMode) {
        case 'ssn': return volumes.ssn;
        case 'extraSsn': return volumes.extraSsn;
        default: return volumes.totale;
      }
    };
    
    // Poi continua con i 3 priceMode come prima ma usando getVolume(p)
    ...
  }
};
```

### 3. AGGIUNGERE COLONNE VOLUMI ALLA TABELLA
Modificare la tabella per includere:
- Volume SSN
- Volume ExtraSSN
- Volume Totale
- Percentuale ExtraSSN (editabile)

### 4. AUTO-SAVE SU OGNI MODIFICA
Aggiungere saveConfiguration() su ogni handler:
- setPrezzoMedioProcedura → saveConfiguration({ prezzoMedioProcedura: value })
- setPriceMode → saveConfiguration({ priceMode: value })
- setVolumeMode → saveConfiguration({ volumeMode: value })
- setSamPercentage → saveConfiguration({ samPercentage: value })
- etc...

### 5. SALVARE TAM/SAM/SOM CALCOLATI
```typescript
useEffect(() => {
  const tam = calculateTAM();
  const sam = calculateSAM();
  const som1 = calculateSOM(1);
  const som3 = calculateSOM(3);
  const som5 = calculateSOM(5);
  
  saveConfiguration({
    valoriCalcolati: { tam, sam, som1, som3, som5 }
  });
}, [priceMode, volumeMode, prezzoMedioProcedura, tipoPrezzo, selectedRegion, samPercentage, somPercentages, mercatoEcografie]);
```

### 6. UI OPZIONE VOLUMEMODE
Aggiungere nel configuratore prezzi:
```tsx
<div>
  <label>Modalità Volume per Calcolo TAM</label>
  <div className="flex gap-2">
    <Button onClick={() => { setVolumeMode('totale'); saveConfiguration({ volumeMode: 'totale' }); }}>
      📊 Totale
    </Button>
    <Button onClick={() => { setVolumeMode('ssn'); saveConfiguration({ volumeMode: 'ssn' }); }}>
      🏥 Solo SSN
    </Button>
    <Button onClick={() => { setVolumeMode('extraSsn'); saveConfiguration({ volumeMode: 'extraSsn' }); }}>
      💳 Solo Extra-SSN
    </Button>
  </div>
</div>
```

### 7. EDITOR PREZZI REGIONALIZZATI
Creare modal/sezione per modificare prezziEcografieRegionalizzati:
- Lista procedure
- Per ogni procedura: pubblico / privato editabili
- Selezione regione
- Save con updatePrezzoEcografiaRegionalizzato()

### 8. FIX PREVENT DEFAULT CHECKBOX
Nel toggle aggredibile:
```tsx
<button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAggredibile(p.codice);
  }}
>
```

## ORDINE IMPLEMENTAZIONE
1. calculateVolumes helper
2. Update calculateTAM con volumeMode
3. Auto-save handlers
4. useEffect per salvare valori calcolati
5. UI volumeMode selector
6. Colonne volumi in tabella
7. Editor prezzi regionalizzati
8. Fix preventDefault

## TESTING
- ✅ Modifico prezzo → ricarico → prezzo salvato
- ✅ Modifico volumeMode → TAM cambia
- ✅ Modifico percentualeExtraSSN → volumi aggiornati
- ✅ Click checkbox → NO reload pagina
- ✅ TAM/SAM/SOM salvati → disponibili in altre sezioni
