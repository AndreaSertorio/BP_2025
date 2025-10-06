# 🚀 IMPLEMENTAZIONE PLAYERPREFS - PROSSIMI PASSI

> **Stato Corrente**: Foundation completa, pronto per Context  
> **Data**: 2025-01-05  
> **Tempo Stimato Completamento**: 2-3 ore

---

## ✅ COMPLETATO FINO AD ORA

### Files Creati
```
✅ types/mercato.types.ts (410 righe)
✅ contexts/MercatoContext.tsx (806 righe)
✅ lib/mercato-utils.ts (450 righe)
✅ components/MercatoDataLoader.tsx (280 righe)
✅ components/MercatoRiepilogo.tsx (471 righe)

✅ types/ecografie.types.ts (300 righe)
✅ lib/ecografie-utils.ts (250 righe)

📝 contexts/EcografieContext.tsx (DA CREARE)
📝 components/EcografieDataLoader.tsx (DA CREARE)
📝 components/EcografieRiepilogo.tsx (DA CREARE)
```

### Sistema Funzionante
- ✅ **Mercato Ecografi**: 100% operativo
  - Context centralizzato
  - Dati caricati da Excel
  - Tab Riepilogo funzionante
  - Persistenza + Scenari
  - Undo/Redo

- 🔶 **Mercato Ecografie**: 40% completato
  - Types definiti
  - Utils functions pronte
  - Manca Context + DataLoader

---

## 📋 PROSSIMI 3 STEP

### Step 1: EcografieContext.tsx (1.5 ore)

**Template da copiare**: `MercatoContext.tsx`

**Modifiche necessarie**:

```typescript
// 1. Importa types ecografie
import {
  StatoEcografie,
  ConfigurazioneItalia,
  DatiPrestazioneItalia,
  TotaliItalia,
  // ... altri types
} from '@/types/ecografie.types';

// 2. Importa utils
import {
  calcolaTotaliItalia,
  calcolaTotaleGeneraleItalia,
  calcolaMercatoAggredibileItalia,
  calcolaDatiRegione,
  // ...
} from '@/lib/ecografie-utils';

// 3. Stato iniziale
const STATO_INIZIALE: StatoEcografie = {
  italia: {
    prestazioni: [], // 15 prestazioni vuote
    percentualeExtraSSN: 30,
    annoRiferimento: 2024
  },
  regioni: {
    usa: { moltiplicatoreVolume: 9, moltiplicatoreValore: 7, ... },
    europa: { moltiplicatoreVolume: 7.5, moltiplicatoreValore: 6.5, ... },
    cina: { moltiplicatoreVolume: 11, moltiplicatoreValore: 10, ... },
    globale: { moltiplicatoreVolume: 55, moltiplicatoreValore: 50, ... }
  },
  metadata: { ... }
};

// 4. Azioni principali
const azioni = {
  // Modifica dati Italia
  aggiornaPrestazioneItalia: (prestazione, dati) => {
    // Update stato.italia.prestazioni[index]
  },
  
  // Modifica % Extra SSN
  impostaPercentualeExtraSSN: (valore) => {
    // Update stato.italia.percentualeExtraSSN
  },
  
  // Toggle aggredibile
  togglePrestazioneAggredibile: (prestazione) => {
    // Toggle stato.italia.prestazioni[index].aggredibile
  },
  
  // Modifica moltiplicatori
  impostaMoltiplicatoreVolume: (regione, valore) => {
    // Update stato.regioni[regione].moltiplicatoreVolume
  },
  
  impostaMoltiplicatoreValore: (regione, valore) => {
    // Update stato.regioni[regione].moltiplicatoreValore
  },
  
  // Carica dati Excel
  caricaDatiExcel: (dati) => {
    // Popola stato.italia.prestazioni da Excel
  },
  
  // ... scenari, reset, etc (copia da MercatoContext)
};

// 5. Calcoli derivati (memoized)
const calcolati = useMemo(() => {
  // Totali Italia
  const totaliItalia = calcolaTotaliItalia(
    stato.italia.prestazioni,
    stato.italia.percentualeExtraSSN
  );
  
  const totaleGeneraleItalia = calcolaTotaleGeneraleItalia(totaliItalia);
  const mercatoAggredibile = calcolaMercatoAggredibileItalia(totaliItalia);
  
  // Dati USA
  const prestazioniUSA = calcolaDatiRegione(
    totaliItalia,
    stato.regioni.usa
  );
  const totaleGeneraleUSA = calcolaTotaleGeneraleRegione(prestazioniUSA);
  
  // ... stessa logica per Europa, Cina, Globale
  
  return {
    italia: {
      prestazioni: totaliItalia,
      totaleGenerale: totaleGeneraleItalia,
      mercatoAggredibile
    },
    usa: {
      prestazioni: prestazioniUSA,
      totaleGenerale: totaleGeneraleUSA
    },
    // ... europa, cina, globale
  };
}, [stato]);

// 6. Persistenza localStorage (copia da MercatoContext)
const STORAGE_KEY = 'eco3d_ecografie_stato';
```

**File Completo**: ~700 righe (simile a MercatoContext)

---

### Step 2: EcografieDataLoader.tsx (30 min)

**Template da copiare**: `MercatoDataLoader.tsx`

**Modifiche necessarie**:

```typescript
export function EcografieDataLoader() {
  const { stato, azioni } = useEcografie();
  
  const loadData = useCallback(async () => {
    // Se già caricato, skip
    if (stato.italia.prestazioni.length > 0) {
      console.log('✅ Dati Ecografie già caricati');
      return;
    }
    
    try {
      // 1. Carica ECO_Riepilogo.xlsx
      const response = await fetch('/assets/ECO_Riepilogo.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets['Riepilogo'];
      
      // 2. Parse dati U/B/D/P per ogni prestazione
      const prestazioni: DatiPrestazioneItalia[] = [];
      
      // Addome Completo (riga 9)
      prestazioni.push({
        prestazione: 'Addome Completo',
        U: parseCell(sheet['G9']),
        B: parseCell(sheet['H9']),
        D: parseCell(sheet['I9']),
        P: parseCell(sheet['J9']),
        aggredibile: true  // default
      });
      
      // ... ripeti per tutte le 15 prestazioni
      // Addome Superiore (riga 10)
      // Addome Inferiore (riga 11)
      // etc...
      
      // 3. Carica nel Context
      azioni.caricaDatiExcel({
        italia: {
          prestazioni,
          percentualeExtraSSN: 30,
          annoRiferimento: 2024
        }
      });
      
      console.log('✅ Dati Ecografie caricati!');
      console.log('📊 Prestazioni:', prestazioni.length);
      
    } catch (error) {
      console.error('❌ Errore caricamento Ecografie:', error);
    }
  }, [stato, azioni]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return null;
}
```

**Mappatura Righe Excel → Prestazioni**:
```
Riga 9:  Addome Completo
Riga 10: Addome Superiore
Riga 11: Addome Inferiore
Riga 12: Apparato Urinario
Riga 13: Collo (tiroide)
Riga 14: Cute e Sottocute
Riga 15: Mammella
Riga 16: Muscoloscheletrico
Riga 17: Osteoarticolare
Riga 18: Parti Molli
Riga 19: Pelvi
Riga 20: Prostata
Riga 21: Testicoli
Riga 22: Vasi
Riga 23: Altri Distretti
```

**File Completo**: ~200 righe

---

### Step 3: Integrare nel Layout (5 min)

```typescript
// src/app/layout.tsx

import { EcografieProvider } from '@/contexts/EcografieContext';
import { EcografieDataLoader } from '@/components/EcografieDataLoader';

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <MercatoProvider>
          <MercatoDataLoader />
          
          <EcografieProvider>
            <EcografieDataLoader />
            {children}
          </EcografieProvider>
        </MercatoProvider>
      </body>
    </html>
  );
}
```

---

## 🧪 TESTING DOPO IMPLEMENTAZIONE

### Test 1: Caricamento Dati
```typescript
// Apri Console DevTools
// Dovresti vedere:
🔄 Caricamento dati Excel nel Context...
✅ Dati Ecografie caricati!
📊 Prestazioni: 15
```

### Test 2: Verifica Dati Italia
```typescript
const { stato } = useEcografie();
console.log(stato.italia.prestazioni[0]);
// Output atteso:
{
  prestazione: "Addome Completo",
  U: 1219804,
  B: 837933,
  D: 537405,
  P: 314443,
  aggredibile: true
}
```

### Test 3: Verifica Calcoli
```typescript
const { calcolati } = useEcografie();
console.log(calcolati.italia.prestazioni[0]);
// Output atteso:
{
  prestazione: "Addome Completo",
  totaleSSN: 2909585,
  extraSSN: 872875,  // 30% di totaleSSN
  totale: 3782460,
  aggredibile: true
}
```

### Test 4: Modifica % Extra SSN
```typescript
azioni.impostaPercentualeExtraSSN(35);
// Tutti i totali si aggiornano automaticamente
console.log(calcolati.italia.prestazioni[0].extraSSN);
// Output: 1018354 (35% invece di 30%)
```

### Test 5: Verifica Moltiplicazioni
```typescript
console.log(calcolati.usa.prestazioni[0].volumeTotale);
// Output: 34042140 (Italia × 9)
```

---

## 🎯 CONVERSIONE COMPONENTI ESISTENTI

### MercatoEcografie.tsx

**Prima** (stato locale):
```typescript
const [datiEcografie, setDatiEcografie] = useState([]);
const [percentualeExtra, setPercentualeExtra] = useState(30);

// Carica Excel
useEffect(() => {
  // fetch...
  // parse...
  setDatiEcografie(...)
}, []);

// Calcola totali
const totali = datiEcografie.map(d => ({
  totale: d.U + d.B + d.D + d.P
}));
```

**Dopo** (Context):
```typescript
const { calcolati, azioni } = useEcografie();

// Dati già caricati e calcolati!
const totali = calcolati.italia.prestazioni;

// Modifica % Extra SSN
<input
  value={stato.italia.percentualeExtraSSN}
  onChange={(e) => azioni.impostaPercentualeExtraSSN(Number(e.target.value))}
/>

// Toggle prestazione aggredibile
<checkbox
  checked={prestazione.aggredibile}
  onChange={() => azioni.togglePrestazioneAggredibile(prestazione.prestazione)}
/>
```

### MercatoEcografieRegionale.tsx

**Prima**:
```typescript
// Props moltiplicatori
const { moltiplicatoreVolume, moltiplicatoreValore } = props;

// Calcola manualmente
const volumeUSA = datiItalia.totale * moltiplicatoreVolume;
```

**Dopo**:
```typescript
const { calcolati, azioni, stato } = useEcografie();

// Dati già calcolati!
const prestazioniUSA = calcolati.usa.prestazioni;
const totaleUSA = calcolati.usa.totaleGenerale;

// Modifica moltiplicatore
<input
  value={stato.regioni.usa.moltiplicatoreVolume}
  onChange={(e) => 
    azioni.impostaMoltiplicatoreVolume('usa', Number(e.target.value))
  }
/>
```

---

## 📊 CREAZIONE EcografieRiepilogo.tsx (OPZIONALE)

**Template**: `MercatoRiepilogo.tsx`

**KPI da mostrare**:
```typescript
// Card 1: Totale Volume Italia
{calcolati.italia.totaleGenerale.volumeTotale} ecografie

// Card 2: % Extra SSN
{stato.italia.percentualeExtraSSN}%

// Card 3: Prestazioni Aggredibili
{stato.italia.prestazioni.filter(p => p.aggredibile).length} / 15

// Card 4: Mercato Aggredibile
{calcolati.italia.mercatoAggredibile.volume} ecografie

// Tabella Prestazioni con:
- Volume SSN
- Volume Extra SSN  
- Totale
- Checkbox aggredibile
```

---

## ✅ CHECKLIST FINALE

### Implementazione
- [ ] Creare `EcografieContext.tsx` (~700 righe)
- [ ] Creare `EcografieDataLoader.tsx` (~200 righe)
- [ ] Integrare in `layout.tsx`
- [ ] Test caricamento dati
- [ ] Test calcoli derivati
- [ ] Test persistenza localStorage

### Conversione Componenti
- [ ] Convertire `MercatoEcografie.tsx`
  - [ ] Rimuovere stati locali
  - [ ] Usare `useEcografie()`
  - [ ] Collegare azioni modifiche
- [ ] Convertire `MercatoEcografieRegionale.tsx`
  - [ ] Rimuovere calcoli manuali
  - [ ] Usare dati calcolati
  - [ ] Collegare modifica moltiplicatori
- [ ] (Opzionale) Creare `EcografieRiepilogo.tsx`

### Testing Finale
- [ ] Modifica dati Italia → verifica aggiornamento USA/Europa/etc
- [ ] Cambia % Extra SSN → verifica ricalcolo totali
- [ ] Toggle aggredibile → verifica mercato aggredibile
- [ ] Salva scenario → carica → verifica restore
- [ ] Ricarica pagina → verifica persistenza

---

## 🎮 RISULTATO FINALE

### Prima (Complesso)
```
- MercatoEcografie.tsx carica dati
- MercatoEcografieRegionale.tsx ricalcola tutto
- Nessuna sincronizzazione
- Duplicazione logica
- Hard to maintain
```

### Dopo (Semplice)
```
✅ EcografieContext = Single Source of Truth
✅ Dati caricati UNA volta
✅ Calcoli memoizzati
✅ Tutti i componenti sincronizzati
✅ Persistenza automatica
✅ Scenari save/load
✅ PlayerPrefs-like
```

---

## 📈 METRICHE SUCCESSO

```
Dati Salvati: 85 valori (PlayerPrefs)
Dati Calcolati: 455 valori (Runtime)
Rapporto: 1:5.4
Efficienza: 84%

LOC Rimossi: ~500 (stati duplicati)
LOC Aggiunti: ~1,100 (Context + Utils)
Net: +600 righe per sistema professionale

Velocità: < 1s caricamento
Persistenza: Automatica
Scenari: Illimitati
Coerenza: 100% garantita
```

---

## 🚀 INIZIO IMPLEMENTAZIONE

**Step 1**: Copia `MercatoContext.tsx` → `EcografieContext.tsx`  
**Step 2**: Cerca/sostituisci "Mercato" → "Ecografie"  
**Step 3**: Adatta types e logica per Ecografie  
**Step 4**: Test, test, test!  

**Tempo Totale Stimato**: 2-3 ore  
**Difficoltà**: Media (hai già il template!)  

---

**PRONTO PER INIZIARE! 🎯**
