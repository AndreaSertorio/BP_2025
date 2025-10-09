# 🔄 ANTI-PATTERN: LOOP INFINITI NEL SALVATAGGIO DATABASE

## ⚠️ PROBLEMA RICORRENTE

Questo è un problema che si è verificato **MOLTISSIME VOLTE** nel progetto:
- Con `regioniAttive`
- Con `prezziDispositivi`
- Con `editingExtraSSN`
- Con le percentuali SAM/SOM
- E probabilmente si ripresenterà ancora!

## 🔍 CAUSA ROOT

### Il Problema degli Oggetti in useEffect Dependencies

```typescript
// ❌ SBAGLIATO - CAUSA LOOP INFINITO!
const [prezziDispositivi, setPrezziDispositivi] = useState({
  carrellati: 50000,
  portatili: 25000,
  palmari: 8000
});

useEffect(() => {
  // Salva nel database
  await updateDB({ prezziDispositivi });
}, [prezziDispositivi]); // ← PROBLEMA QUI!
```

**Perché causa loop:**
1. User modifica prezzo → `setPrezziDispositivi({ ...prezzi, palmari: 6000 })`
2. `prezziDispositivi` è OGGETTO → **NUOVA REFERENZA** ogni volta
3. `useEffect` vede "oggetto diverso" → Trigger
4. Salva DB → `configDB` cambia
5. Re-render componente
6. `prezziDispositivi` NUOVO OGGETTO (stesso contenuto, diversa ref)
7. `useEffect` vede "oggetto diverso" di nuovo → **LOOP INFINITO!**

### Il Problema del Confronto per Riferimento

JavaScript confronta oggetti per **riferimento**, non per **valore**:

```javascript
const obj1 = { a: 1 };
const obj2 = { a: 1 };
obj1 === obj2  // false ❌ (riferimenti diversi!)

const str1 = '{"a":1}';
const str2 = '{"a":1}';
str1 === str2  // true ✅ (stesso valore!)
```

## ✅ SOLUZIONE DEFINITIVA

### Pattern da Usare SEMPRE con Oggetti in Dependencies

```typescript
// 1. State oggetto
const [prezziDispositivi, setPrezziDispositivi] = useState({
  carrellati: 50000,
  portatili: 25000,
  palmari: 8000
});

// 2. ✅ SOLUZIONE: Serializza con useMemo
const prezziDispositiviJson = useMemo(
  () => JSON.stringify(prezziDispositivi),
  [prezziDispositivi]
);

// 3. Usa la STRINGA nelle dependencies
useEffect(() => {
  if (!isInitialized) return; // Protezione init
  
  await updateDB({ 
    prezziDispositivi: JSON.parse(prezziDispositiviJson) 
  });
}, [
  prezziDispositiviJson, // ← STRING non OGGETTO!
  isInitialized
]);
```

### Perché Funziona

1. **useMemo** serializza oggetto → stringa JSON
2. **Confronto STRING per valore** (non riferimento)
3. Stesso contenuto = **stessa stringa** = NO re-trigger
4. Contenuto diverso = stringa diversa = trigger **UNA VOLTA SOLA**
5. **NO LOOP!**

## 📋 CHECKLIST ANTI-LOOP

Quando aggiungi auto-save per un nuovo campo, segui SEMPRE questi passi:

### ✅ 1. Identifica il Tipo di Dato

```typescript
// Primitivi (string, number, boolean)
const [name, setName] = useState(''); // ✅ OK in dependencies

// Oggetti o Array
const [prices, setPrices] = useState({}); // ❌ Servono useMemo!
const [regions, setRegions] = useState([]); // ❌ Servono useMemo!
```

### ✅ 2. Serializza con useMemo (se oggetto/array)

```typescript
const pricesJson = useMemo(
  () => JSON.stringify(prices),
  [prices]
);

const regionsJson = useMemo(
  () => JSON.stringify(regions),
  [regions]
);
```

### ✅ 3. Usa isInitialized Flag

```typescript
const [isInitialized, setIsInitialized] = useState(false);

// Caricamento INIZIALE (UNA VOLTA)
useEffect(() => {
  if (configDB && !isInitialized) {
    setPrices(configDB.prices);
    setIsInitialized(true); // ← BLOCCA reload successivi
  }
}, [configDB, isInitialized]);

// Salvataggio (SOLO DOPO INIT)
useEffect(() => {
  if (!isInitialized) return; // ← SKIP se non inizializzato
  
  setTimeout(() => {
    updateDB({ prices: JSON.parse(pricesJson) });
  }, 1500);
}, [pricesJson, isInitialized]);
```

### ✅ 4. Flow Corretto

```
1. Mount → isInitialized = false
   ↓
2. Carica DB → setPrices() → setIsInitialized(true)
   ↓
3. isInitialized = true → BLOCCA ulteriori caricamenti
   ↓
4. User modifica → setPrices()
   ↓
5. useMemo → pricesJson cambia (nuova stringa)
   ↓
6. useEffect salvataggio (isInitialized=true) → Salva DB
   ↓
7. DB aggiornato → configDB cambia
   ↓
8. useEffect caricamento: if (!isInitialized) → FALSE → NO RELOAD
   ↓
9. useMemo ricalcola → STESSA STRINGA (contenuto identico)
   ↓
10. useEffect salvataggio: deps non cambiate → NO trigger
   ↓
✅ STABILE!
```

## 🚨 ERRORI COMUNI DA EVITARE

### ❌ 1. Oggetto Diretto in Dependencies

```typescript
// SBAGLIATO!
useEffect(() => {
  saveDB(prices);
}, [prices]); // ← Loop infinito!
```

### ❌ 2. Dimenticare isInitialized

```typescript
// SBAGLIATO!
useEffect(() => {
  // Salva anche durante init → doppio salvataggio
  saveDB(pricesJson);
}, [pricesJson]);
```

### ❌ 3. useMemo senza Dependencies

```typescript
// SBAGLIATO!
const pricesJson = useMemo(
  () => JSON.stringify(prices)
  // Mancano dependencies! Non si aggiorna mai
);
```

### ❌ 4. Serializzare nel posto sbagliato

```typescript
// SBAGLIATO!
useEffect(() => {
  const json = JSON.stringify(prices); // ← Dentro useEffect
  saveDB(json);
}, [prices]); // ← Loop comunque!
```

### ❌ 5. Auto-Save durante Editing Inline (NUOVO!)

```typescript
// SBAGLIATO! Loop infinito durante editing
const [editingPrice, setEditingPrice] = useState(null);

// Auto-save che scatta anche durante editing
useEffect(() => {
  setTimeout(() => {
    updateDB({ prices }); // ← Salva durante editing!
  }, 1500);
}, [pricesJson]); // ← Trigger anche quando utente digita!

onBlur={() => {
  setPrices(newValue); // ← Trigger auto-save
  // DB cambia → Re-render → Input perde focus → LOOP!
}}

// PROBLEMA:
// 1. User digita → setPrices()
// 2. Dopo 1.5s → Auto-save trigger
// 3. DB aggiornato → configDB cambia
// 4. Re-render → Input remountato
// 5. User perde focus → onBlur trigger
// 6. setPrices() → LOOP infinito!
```

**SOLUZIONE:**
```typescript
// ✅ CORRETTO: Blocca auto-save + Aggiorna SOLO state locale
const [isEditingPrice, setIsEditingPrice] = useState(false);

// Auto-save BLOCCATO durante editing
useEffect(() => {
  if (isEditingPrice) return; // ← BLOCCA!
  
  setTimeout(() => {
    updateDB({ prices }); // Auto-save dopo debounce
  }, 1500);
}, [pricesJson, isEditingPrice]);

onClick(() => {
  setIsEditingPrice(true); // ← Blocca auto-save
}}

onBlur(() => {
  setPrices(newValue); // ← Solo state locale, NO DB!
  
  // Sblocca dopo breve delay (evita conflitto)
  setTimeout(() => setIsEditingPrice(false), 100);
}}

// Il DB viene salvato automaticamente 1.5s dopo lo sblocco
```

**IMPORTANTE:** NON salvare nel DB immediatamente onBlur! Causa refresh!  
Lascia che l'auto-save gestisca il salvataggio dopo il debounce.

## 📝 TEMPLATE DA COPIARE

```typescript
// === TEMPLATE ANTI-LOOP PER OGGETTI ===

// 1. State
const [myObject, setMyObject] = useState({ /* ... */ });
const [isInitialized, setIsInitialized] = useState(false);

// 2. Serializza con useMemo
const myObjectJson = useMemo(
  () => JSON.stringify(myObject),
  [myObject]
);

// 3. Caricamento INIZIALE
useEffect(() => {
  if (configDB && !isInitialized) {
    setMyObject(configDB.myObject || defaultValue);
    setIsInitialized(true);
    console.log('✅ Caricato (INIT)');
  }
}, [configDB, isInitialized]);

// 4. Salvataggio AUTO (dopo init)
useEffect(() => {
  if (!isInitialized) return;
  if (!configDB) return;
  
  const timer = setTimeout(async () => {
    await updateDB({
      myObject: JSON.parse(myObjectJson)
    });
    console.log('💾 Salvato');
  }, 1500);
  
  return () => clearTimeout(timer);
}, [
  myObjectJson, // ← STRING serializzata
  isInitialized,
  configDB
]);
```

## 🔍 COME DIAGNOSTICARE UN LOOP

### Sintomi:
- Pagina si ricarica continuamente
- Console piena di "💾 Salvato"
- Database `lastUpdate` cambia ogni secondo
- Hot reload continuo in dev mode

### Debug Steps:

```typescript
// Aggiungi log per capire cosa trigge useEffect
useEffect(() => {
  console.log('🔍 useEffect triggered');
  console.log('  prezziDispositivi:', prezziDispositivi);
  console.log('  reference:', JSON.stringify(prezziDispositivi));
  
  // ... resto del codice
}, [prezziDispositivi]);
```

### Fix:
1. Identifica quale oggetto causa il loop
2. Cerca quel nome nelle `dependencies` dei `useEffect`
3. Aggiungi `useMemo` per serializzare
4. Sostituisci oggetto con string serializzata
5. Verifica che `isInitialized` sia usato correttamente

## 📚 CASI RISOLTI IN QUESTO PROGETTO

### 1. regioniAttive (Loop risolto 3+ volte!)
```typescript
const regioniAttiveJson = useMemo(
  () => JSON.stringify(regioniAttive),
  [regioniAttive]
);
// Uso: [regioniAttiveJson] invece di [regioniAttive]
```

### 2. prezziDispositivi (Loop risolto 3+ volte!)
```typescript
const prezziDispositiviJson = useMemo(
  () => JSON.stringify(prezziDispositivi),
  [prezziDispositivi]
);
// Uso: [prezziDispositiviJson] invece di [prezziDispositivi]

// SOLUZIONE FINALE: Flag editing + Auto-save ritardato
const [isEditingPrice, setIsEditingPrice] = useState(false);

// Auto-save con protezione
useEffect(() => {
  if (!isInitialized) return;
  if (isEditingPrice) return; // ← BLOCCA durante editing
  
  setTimeout(() => {
    updateDB({ prezziDispositivi });
  }, 1500);
}, [prezziDispositiviJson, isInitialized]);

// Editing inline: aggiorna SOLO state locale
onBlur={() => {
  setPrezziDispositivi(newValue); // ← Solo state locale
  
  // Sblocca auto-save dopo breve delay (evita conflitto)
  setTimeout(() => setIsEditingPrice(false), 100);
}}

onClick={() => {
  setIsEditingPrice(true); // ← Blocca auto-save
}}

// Il salvataggio DB avviene automaticamente 1.5s dopo lo sblocco
```

### 3. selectedRegions (Procedures)
```typescript
const selectedRegionsJson = useMemo(
  () => JSON.stringify(selectedRegions),
  [selectedRegions]
);
// Uso: [selectedRegionsJson] invece di [selectedRegions]
```

## 🎯 REGOLE D'ORO

### Regola #1: Serializzazione Oggetti
> **Se è un OGGETTO o ARRAY e va in useEffect dependencies:**
> **→ SERIALIZZA con useMemo!**
> 
> Nessuna eccezione. Mai. Zero tolleranza.

### Regola #2: Editing Inline con Auto-Save
> **Se hai EDITING INLINE + AUTO-SAVE sullo stesso campo:**
> **→ USA FLAG per BLOCCARE auto-save durante editing + Aggiorna SOLO STATE LOCALE onBlur!**
> 
> **Pattern:**
> ```typescript
> // 1. Flag editing
> const [isEditingField, setIsEditingField] = useState(false);
> 
> // 2. Auto-save BLOCCATO durante editing
> useEffect(() => {
>   if (isEditingField) return; // ← BLOCCA
>   
>   setTimeout(() => {
>     updateDB({ field }); // Auto-save dopo debounce
>   }, 1500);
> }, [fieldJson, isEditingField]);
> 
> // 3. Click → Blocca auto-save
> onClick(() => {
>   setIsEditingField(true);
> }}
> 
> // 4. Blur → Aggiorna SOLO state locale + Sblocca dopo delay
> onBlur={() => {
>   setField(newValue); // ← Solo state locale, NO DB!
>   
>   // Sblocca dopo breve delay (evita conflitto immediato)
>   setTimeout(() => setIsEditingField(false), 100);
> }}
> ```
> 
> **Perché funziona:**
> - Durante editing, auto-save è BLOCCATO (evita conflitti)
> - Al termine editing, aggiorna SOLO state locale (NO DB immediato)
> - Dopo 100ms, sblocca auto-save
> - Dopo altri 1.5s, auto-save salva nel DB automaticamente
> - ✅ NO LOOP, NO REFRESH, NO conflitti!

## 📖 LETTURA CONSIGLIATA

Ogni volta che aggiungi un nuovo campo modificabile:
1. Leggi questo documento
2. Copia il template
3. Adatta al tuo caso
4. Testa con modifica + attendi 5 secondi
5. Verifica che NON ci siano reload continui

---

## 🎯 REGOLA #3: Cambio Vista/Tab senza Refresh

### Problema: Refresh quando cambi tab/vista

**Sintomo:**
- Quando cambi vista (es. Procedures → Devices)
- La pagina fa un piccolo "refresh" fastidioso
- Sembra ricaricare anche se è solo un re-render

**Causa:**
- Molti `useCallback` hanno la vista nelle dependencies
- Quando cambi vista, tutte le funzioni vengono ricreate
- Questo causa un re-render massiccio di tutti i componenti

**Soluzione: Usa useMemo per memorizzare VALORI, non funzioni**

```typescript
// ❌ SBAGLIATO: Calcoli ripetuti ad ogni render
const tam = activeView === 'procedures' ? calculateTAM() : devicesMetrics.tam;
const sam = activeView === 'procedures' ? calculateSAM() : devicesMetrics.sam;

// ✅ CORRETTO: Memorizza i valori calcolati
const proceduresMetrics = useMemo(() => {
  const tam = calculateTAM();
  const sam = tam * (samPercentage / 100);
  return { tam, sam, som1, som3, som5 };
}, [calculateTAM, samPercentage, somPercentages]);

const currentMetrics = useMemo(() => {
  return activeView === 'procedures' ? proceduresMetrics : devicesMetrics;
}, [activeView, proceduresMetrics, devicesMetrics]);

// Usa i valori memorizzati
const tam = currentMetrics.tam;
const sam = currentMetrics.sam;
```

**Perché funziona:**
- `useMemo` memorizza il RISULTATO dei calcoli
- Quando cambi vista, NON ricalcola tutto
- Restituisce il valore già calcolato
- Re-render ultra veloce = NO refresh visibile
- ✅ Cambio vista fluido e istantaneo!

**IMPORTANTE:**
- `useCallback` memorizza la FUNZIONE (non il risultato)
- `useMemo` memorizza il RISULTATO (quello che ci serve!)
- Usa `useMemo` per valori derivati che dipendono da molti calcoli

---

**Data Creazione:** 2025-01-10  
**Ultima Modifica:** 2025-01-10  
**Versione:** 1.1  
**Stato:** ⚠️ CRITICO - LEGGERE SEMPRE PRIMA DI AUTO-SAVE
