# 🎮 PIANO COMPLETO PLAYERPREFS - ECO 3D

> **Filosofia**: Come Unity PlayerPrefs - salvare solo dati essenziali, calcolare il resto  
> **Data**: 2025-01-05  
> **Stato**: 📝 Piano definito, inizio implementazione

---

## 🎯 FILOSOFIA PLAYERPREFS

### Unity PlayerPrefs
```csharp
// Salva solo input/configurazione utente
PlayerPrefs.SetInt("Level", 5);
PlayerPrefs.SetFloat("Health", 100.0f);

// Calcola tutto il resto
int damage = baseDamage * level * difficulty;
```

### Nostra Implementazione
```typescript
// TIER 1: Salvare (PlayerPrefs)
- Dati base originali (Italia U/B/D/P)
- Configurazione utente (%, checkbox)
- Moltiplicatori regionali

// TIER 2: Calcolare (Runtime)
- Totali (somme)
- Valori derivati (moltiplicazioni)
- Aggregazioni
```

---

## 📊 MAPPATURA COMPLETA DATI

### 1. MERCATO ECOGRAFI ✅ (IMPLEMENTATO)

#### TIER 1 - PlayerPrefs (Salvare)
```typescript
✅ annoTarget: number                    // 2025-2035
✅ marketShareTarget: number             // 0-100%
✅ regioniVisibili: Set<string>          // Checkbox
✅ scenarioParcoIT: 'basso'|'centrale'|'alto'
✅ tipologieTarget: Set<string>          // Checkbox

// Dati Base da Excel (immutabili)
✅ numeroEcografi: {mercato, unita2025, unita2030}[]
✅ valoreMercato: {mercato, valore2025, valore2030, cagr}[]
✅ parcoIT: {anno, basso, centrale, alto}[]
✅ tipologie: [...]
✅ proiezioniItalia: [...]
✅ quoteTipologie: [...]
```

#### TIER 2 - Calcolati (Runtime)
```typescript
🧮 mercatoGlobaleTarget = interpolazione anno
🧮 mercatoItaliaTarget = interpolazione anno
🧮 unitaTargetRegioni = somma(regioni) × marketShare%
🧮 unitaTargetEco3D = unitaTargetRegioni
🧮 parcoDispositiviTarget = parcoIT[anno][scenario]
🧮 totaliRegioniSelezionate = aggregazioni
🧮 cagrMedio = media ponderata
```

---

### 2. MERCATO ECOGRAFIE 📝 (DA IMPLEMENTARE)

#### TIER 1 - PlayerPrefs (Salvare)

##### Italia (MASTER SOURCE)
```typescript
✅ SALVARE per ogni prestazione (15):
{
  prestazione: string,
  U: number,     // Urgente (da Excel)
  B: number,     // Breve (da Excel)
  D: number,     // Differibile (da Excel)
  P: number,     // Programmata (da Excel)
  aggredibile: boolean  // Checkbox utente
}

✅ SALVARE configurazione:
{
  percentualeExtraSSN: number,  // Slider 0-100%, default 30%
  annoRiferimento: number       // Default 2024
}
```

**TOTALE SALVATO ITALIA**: 
- 15 prestazioni × 4 valori (U/B/D/P) = 60 numeri
- 15 checkbox aggredibile
- 1 percentuale Extra SSN
- 1 anno riferimento
= **77 valori**

##### Altre Regioni (USA, Europa, Cina, Globale)
```typescript
✅ SALVARE per ogni regione:
{
  moltiplicatoreVolume: number,   // Modificabile
  moltiplicatoreValore: number,   // Modificabile
  volumeRange: string,            // Info UI
  valoreRange: string,            // Info UI
  italyQuota: string              // Info UI
}
```

**TOTALE SALVATO ALTRE REGIONI**:
- 4 regioni × 2 moltiplicatori = 8 numeri
- + stringhe info UI
= **8 valori critici**

#### TIER 2 - Calcolati (Runtime)

##### Per Italia
```typescript
🧮 Per ogni prestazione:
  totaleSSN = U + B + D + P
  extraSSN = totaleSSN × (percentualeExtraSSN / 100)
  totale = totaleSSN + extraSSN

🧮 Totale generale Italia:
  volumeSSN = somma(totaleSSN tutte prestazioni)
  volumeExtraSSN = somma(extraSSN tutte prestazioni)
  volumeTotale = volumeSSN + volumeExtraSSN

🧮 Mercato aggredibile Italia:
  volume = somma(totale prestazioni con aggredibile=true)
  valore = volume × costoMedio
```

##### Per Altre Regioni
```typescript
🧮 Per ogni regione (USA, Europa, Cina, Globale):
  
  Per ogni prestazione:
    volumeSSN = Italia.prestazione.totaleSSN × moltiplicatoreVolume
    volumeExtraSSN = Italia.prestazione.extraSSN × moltiplicatoreVolume
    volumeTotale = volumeSSN + volumeExtraSSN
    
    valoreSSN = Italia.prestazione.valoreSSN × moltiplicatoreValore
    valoreExtraSSN = Italia.prestazione.valoreExtraSSN × moltiplicatoreValore
    valoreTotale = valoreSSN + valoreExtraSSN
  
  Totale generale regione:
    volumeTotale = somma(volumeTotale tutte prestazioni)
    valoreTotale = somma(valoreTotale tutte prestazioni)
```

---

## 🏗️ STRUTTURA FILES

```
src/
├── types/
│   ├── mercato.types.ts          ✅ Done
│   └── ecografie.types.ts        ✅ Done
│
├── contexts/
│   ├── MercatoContext.tsx        ✅ Done
│   └── EcografieContext.tsx      📝 Next (850 righe)
│
├── lib/
│   ├── mercato-utils.ts          ✅ Done
│   └── ecografie-utils.ts        📝 Next (450 righe)
│
└── components/
    ├── MercatoDataLoader.tsx     ✅ Done
    ├── EcografieDataLoader.tsx   📝 Next (400 righe)
    ├── MercatoRiepilogo.tsx      ✅ Done
    └── EcografieRiepilogo.tsx    📝 Next (500 righe)
```

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### Fase 1: Types & Utils ✅
- [x] `ecografie.types.ts` - Definizioni complete
- [ ] `ecografie-utils.ts` - Funzioni calcolo

### Fase 2: Context & Provider
- [ ] `EcografieContext.tsx` - State management
  - [ ] Stato con PlayerPrefs structure
  - [ ] Azioni per modifiche
  - [ ] Calcoli derivati memoizzati
  - [ ] Persistenza localStorage
  - [ ] Scenari save/load
  - [ ] Undo/Redo

### Fase 3: Data Loading
- [ ] `EcografieDataLoader.tsx` - Carica Excel
  - [ ] Leggi ECO_Riepilogo.xlsx
  - [ ] Parse dati U/B/D/P Italia
  - [ ] Imposta defaults
  - [ ] Popola Context

### Fase 4: UI Integration
- [ ] Convertire `MercatoEcografie.tsx`
  - [ ] Rimuovi stati locali
  - [ ] Usa `useEcografie()`
  - [ ] Collega azioni
- [ ] Convertire `MercatoEcografieRegionale.tsx`
  - [ ] Rimuovi calcoli locali
  - [ ] Usa dati calcolati Context
- [ ] Creare `EcografieRiepilogo.tsx`
  - [ ] Dashboard test sistema
  - [ ] KPI cards
  - [ ] Controlli modifiche

### Fase 5: Testing & Validazione
- [ ] Test caricamento dati
- [ ] Test calcoli derivati
- [ ] Test persistenza
- [ ] Test scenari
- [ ] Test sincronizzazione tra tab

---

## 🎮 ESEMPIO FLUSSO COMPLETO

### Scenario: Utente Modifica Dati Italia

```typescript
// 1. UTENTE modifica (PlayerPrefs write)
azioni.aggiornaPrestazioneItalia('Addome Completo', {
  U: 1200000,  // Modificato
  B: 800000,
  D: 500000,
  P: 300000
});

azioni.impostaPercentualeExtraSSN(35); // Era 30%

azioni.togglePrestazioneAggredibile('Addome Completo'); // Toggle

// 2. CONTEXT aggiorna stato PlayerPrefs
stato.italia.prestazioni[0] = {
  prestazione: 'Addome Completo',
  U: 1200000,  // ✅ Salvato
  B: 800000,   // ✅ Salvato
  D: 500000,   // ✅ Salvato
  P: 300000,   // ✅ Salvato
  aggredibile: true  // ✅ Salvato
};

stato.italia.percentualeExtraSSN = 35;  // ✅ Salvato

// 3. CALCOLI DERIVATI si aggiornano AUTOMATICAMENTE (memoized)
calcolati.italia.prestazioni[0] = {
  prestazione: 'Addome Completo',
  totaleSSN: 2800000,        // 🧮 U+B+D+P
  extraSSN: 980000,          // 🧮 totaleSSN × 35%
  totale: 3780000,           // 🧮 totaleSSN + extraSSN
  aggredibile: true
};

// 4. ALTRE REGIONI si aggiornano AUTOMATICAMENTE
calcolati.usa.prestazioni[0] = {
  prestazione: 'Addome Completo',
  volumeTotale: 34020000,    // 🧮 Italia × 9 (moltiplicatore USA)
  valoreTotale: 26460000,    // 🧮 Italia × 7 (moltiplicatore USA)
  // ...
};

// 5. TOTALI GENERALI si aggiornano
calcolati.italia.totaleGenerale = {
  volumeTotale: X,           // 🧮 Somma tutte prestazioni
  valoreTotale: Y,           // 🧮 Somma valori
  // ...
};

// 6. MERCATO AGGREDIBILE si aggiorna
calcolati.italia.mercatoAggredibile = {
  volume: Z,                 // 🧮 Solo prestazioni aggredibili
  valore: W                  // 🧮 Solo prestazioni aggredibili
};

// 7. PERSISTENZA automatica (1 secondo dopo)
localStorage.setItem('eco3d_ecografie_stato', JSON.stringify(stato));

// 8. TUTTI I COMPONENTI vedono i nuovi valori
// - MercatoEcografie.tsx
// - MercatoEcografieRegionale.tsx (USA, Europa, etc.)
// - EcografieRiepilogo.tsx
// Tutti sincronizzati automaticamente! ✅
```

---

## 📊 STATISTICHE FINALI

### Dati Salvati (PlayerPrefs)
```
Mercato Ecografi:
- Configurazione: ~10 valori
- Dati Excel base: ~100 valori (immutabili)

Mercato Ecografie:
- Italia U/B/D/P: 60 valori
- Italia config: 17 valori
- Altre regioni: 8 valori
- TOTALE: ~85 valori modificabili

TOTALE GENERALE: ~195 valori salvati
```

### Dati Calcolati (Runtime)
```
Mercato Ecografi:
- ~20 metriche derivate

Mercato Ecografie:
- Italia: 15 prestazioni × 3 metriche = 45
- Altre 4 regioni: 15 × 6 metriche × 4 = 360
- Totali: ~50
- TOTALE: ~455 valori calcolati

TOTALE GENERALE: ~475 valori derivati
```

### Rapporto Salvati/Calcolati
```
195 salvati → 475 calcolati
Rapporto: 1:2.4
```

**Per ogni valore salvato, calcoliamo 2.4 valori!**  
**Risparmio storage: ~71%** ✅

---

## 🚀 BENEFICI SISTEMA

### 1. Storage Efficiente
- Solo 195 valori in localStorage
- Nessuna ridondanza
- Veloce da salvare/caricare

### 2. Coerenza Garantita
- Italia = single source of truth
- Impossibile disallineamento
- Modifiche propagate automaticamente

### 3. Performance
- Calcoli memoizzati
- Solo quando necessario
- React re-render ottimizzati

### 4. Manutenibilità
- Logica calcolo centralizzata
- Facile da testare
- Facile da modificare

### 5. Scenari
- Salva/carica istantaneo
- Solo 195 valori da serializzare
- Export/Import JSON leggero

---

## ⏭️ PROSSIMI STEP

### Immediato (oggi)
1. ✅ `ecografie.types.ts` - DONE
2. 📝 `ecografie-utils.ts` - Next
3. 📝 `EcografieContext.tsx` - Next

### Breve termine (domani)
4. 📝 `EcografieDataLoader.tsx`
5. 📝 Convertire componenti esistenti
6. 📝 Testing completo

### Test finale
- Modificare dati Italia → vedere aggiornamenti ovunque
- Cambiare moltiplicatori → vedere regioni aggiornarsi
- Salva scenario → carica → verificare restore
- Ricarica pagina → persistenza OK

---

**Il sistema è progettato!**  
**Inizio implementazione EcografieContext ora!** 🚀
