# Database Inspector - Stato Espansione Persistente

**Data creazione:** 2025-10-12  
**Richiesta:** Memorizzare lo stato di espansione dei nodi durante la sessione

---

## 🎯 Problema Risolto

### Prima ❌
- Ogni volta che torni al Database Inspector, l'albero è **tutto collassato**
- Devi riaprire manualmente tutti i nodi (anche 10+ click)
- Fastidioso quando devi controllare → modificare → ricontrollare

### Ora ✅
- **Stato espansione salvato in sessionStorage**
- I nodi aperti **rimangono aperti** quando cambi tab
- Torni al Database Inspector e trovi **tutto come lo avevi lasciato**
- Persiste per **tutta la sessione del browser**

---

## 🔧 Come Funziona

### sessionStorage (Non localStorage!)

**Perché sessionStorage?**
- ✅ Persiste solo durante la **sessione corrente** del browser
- ✅ Si pulisce automaticamente quando **chiudi il tab**
- ✅ Non inquina il disco (temporaneo)
- ❌ localStorage sarebbe permanente → può causare confusione

### Flusso di Salvataggio

```
1. Apri/Chiudi un nodo (click ▶️ o ▼)
        ↓
2. toggleExpand() aggiorna expandedPaths (Set)
        ↓
3. useEffect rileva il cambiamento
        ↓
4. Converte Set → Array
        ↓
5. Salva in sessionStorage['dbInspector_expandedPaths']
        ↓
6. Console: "💾 Stato espansione salvato: N nodi aperti"
```

### Flusso di Caricamento

```
1. Monti il componente (prima volta)
        ↓
2. loadExpandedPaths() legge da sessionStorage
        ↓
3. Se presente: Array → Set → expandedPaths
        ↓
4. Se assente: Set(['root']) (default)
        ↓
5. Nodi si aprono automaticamente
```

---

## 💾 Implementazione

### 1. Funzione di Caricamento

```typescript
const loadExpandedPaths = (): Set<string> => {
  if (typeof window === 'undefined') return new Set(['root']);
  
  const saved = sessionStorage.getItem('dbInspector_expandedPaths');
  if (saved) {
    try {
      const array = JSON.parse(saved);
      return new Set(array);
    } catch (e) {
      console.error('Errore nel caricamento stato espansione:', e);
    }
  }
  return new Set(['root']);
};
```

**Cosa fa:**
- Legge da `sessionStorage`
- Converte JSON array → Set
- Se errore o non presente → default `['root']`
- SSR-safe (`typeof window`)

### 2. Inizializzazione State

```typescript
const [expandedPaths, setExpandedPaths] = useState<Set<string>>(loadExpandedPaths());
```

**Invece di:**
```typescript
const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
```

### 3. useEffect per Salvataggio

```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && expandedPaths.size > 0) {
    const pathsArray = Array.from(expandedPaths);
    sessionStorage.setItem('dbInspector_expandedPaths', JSON.stringify(pathsArray));
    console.log('💾 Stato espansione salvato:', pathsArray.length, 'nodi aperti');
  }
}, [expandedPaths]);
```

**Cosa fa:**
- Monitora `expandedPaths`
- Ogni cambiamento → salva in sessionStorage
- Converte Set → Array per JSON
- Log per debug

### 4. Funzione Reset

```typescript
const resetExpansionState = () => {
  sessionStorage.removeItem('dbInspector_expandedPaths');
  setExpandedPaths(new Set(['root']));
  console.log('🔄 Stato espansione resettato');
};
```

**Cosa fa:**
- Pulisce sessionStorage
- Chiude tutti i nodi
- Reset allo stato iniziale

---

## 🎨 UI/UX

### Badge Contatore

```tsx
<Badge variant="outline" className="text-purple-700 border-purple-300">
  📂 {expandedPaths.size - 1} nodi aperti
</Badge>
```

**Mostra:**
- Numero di nodi attualmente aperti
- `-1` perché `root` è sempre incluso ma non conta

### Pannello Informativo

```tsx
<Card className="p-4 bg-purple-50 border-purple-200">
  <div className="text-2xl">💾</div>
  <h4>Stato Espansione Memorizzato</h4>
  <p>I nodi che apri rimangono aperti durante tutta la sessione...</p>
  <p>📂 {expandedPaths.size - 1} nodi attualmente aperti</p>
</Card>
```

**Spiega:**
- La funzionalità di memorizzazione
- Quanti nodi sono aperti
- Come resettare

### Pulsante Reset

```tsx
<Button onClick={resetExpansionState} title="Collassa tutto e pulisce stato salvato">
  <ChevronRight className="w-4 h-4 mr-1" />
  Reset
</Button>
```

**Prima era:**
- "Collassa" → chiudeva solo visivamente
- Stato rimaneva in sessionStorage

**Ora è:**
- "Reset" → pulisce tutto (UI + storage)

---

## 🧪 Test di Verifica

### Test 1: Salvataggio Base
```
1. Apri Database Inspector
2. Espandi "mercatoEcografie"
3. Espandi "italia"
4. Console: vedi "💾 Stato espansione salvato: 2 nodi aperti"
5. Badge mostra: "📂 2 nodi aperti"
6. Cambia TAB (vai in Mercato Ecografie)
7. Torna a Database Inspector
8. ✅ "mercatoEcografie" e "italia" ANCORA APERTI
```

### Test 2: Persistenza Multi-Navigazione
```
1. Apri 5-6 nodi profondi (es. mercatoEcografie → italia → [0] → u)
2. Badge: "📂 6 nodi aperti"
3. Naviga in 3-4 TAB diversi
4. Modifica qualche valore
5. Torna a Database Inspector
6. ✅ TUTTI i 6 nodi ANCORA APERTI
```

### Test 3: Reset
```
1. Apri 10 nodi
2. Badge: "📂 10 nodi aperti"
3. Click "Reset"
4. ✅ Tutto collassato
5. Badge: "📂 0 nodi aperti"
6. Console: "🔄 Stato espansione resettato"
7. sessionStorage['dbInspector_expandedPaths'] = null
```

### Test 4: Chiusura Browser
```
1. Apri 5 nodi
2. Chiudi il TAB del browser
3. Riapri l'applicazione (nuovo tab)
4. ✅ Tutto collassato (sessionStorage pulito)
5. Badge: "📂 0 nodi aperti"
```

### Test 5: Refresh Pagina (F5)
```
1. Apri 7 nodi
2. Fai refresh pagina (F5 o Cmd+R)
3. ✅ Tutti i 7 nodi ANCORA APERTI
4. sessionStorage sopravvive al refresh
```

---

## 📊 Dati Salvati

### Formato in sessionStorage

**Key:** `dbInspector_expandedPaths`

**Value (JSON Array):**
```json
[
  "root",
  "root.mercatoEcografie",
  "root.mercatoEcografie.italia",
  "root.mercatoEcografie.italia[0]",
  "root.mercatoEcografie.italia[0].u",
  "root.configurazioneTamSamSom"
]
```

### Dimensione Approssimativa

- ~50 bytes per path medio
- 100 nodi aperti = ~5 KB
- Trascurabile per sessionStorage (limite ~5-10 MB)

---

## 🎯 Workflow Utente Tipico

### Scenario: Controllo → Modifica → Verifica

**Prima (Senza Persistenza):**
```
1. Database Inspector
2. Apri 10 nodi per arrivare a "mercatoEcografie.italia[5].u"
3. Vedi valore: 150
4. Vai a "Mercato Ecografie" TAB
5. Modifichi il valore → 200
6. Torni a Database Inspector
7. ❌ TUTTO COLLASSATO
8. Riapri 10 nodi di nuovo
9. Verifichi: 200 ✅
10. Frustrazione 😤
```

**Ora (Con Persistenza):**
```
1. Database Inspector
2. Apri 10 nodi per arrivare a "mercatoEcografie.italia[5].u"
3. Vedi valore: 150
4. Vai a "Mercato Ecografie" TAB
5. Modifichi il valore → 200
6. Torni a Database Inspector
7. ✅ Già aperto su "mercatoEcografie.italia[5].u"
8. Verifichi immediatamente: 200 ✅
9. Felicità 🎉
```

**Risparmio:**
- Da ~30 secondi a ~2 secondi
- Da 10 click a 0 click
- Molto meno frustrazione

---

## 🔍 Console Logging

### Al Caricamento
```javascript
// Non loggato automaticamente, ma puoi verificare:
sessionStorage.getItem('dbInspector_expandedPaths')
// → '["root","root.mercatoEcografie",...]'
```

### Ad Ogni Espansione/Collasso
```javascript
💾 Stato espansione salvato: 5 nodi aperti
💾 Stato espansione salvato: 6 nodi aperti
💾 Stato espansione salvato: 5 nodi aperti // (collassato uno)
```

### Al Reset
```javascript
🔄 Stato espansione resettato
```

---

## ⚙️ Configurazione

### Cambiare Storage (se necessario)

**Da sessionStorage a localStorage:**
```typescript
// In loadExpandedPaths():
const saved = localStorage.getItem('dbInspector_expandedPaths'); // invece di sessionStorage

// In useEffect:
localStorage.setItem('dbInspector_expandedPaths', ...); // invece di sessionStorage

// In resetExpansionState:
localStorage.removeItem('dbInspector_expandedPaths'); // invece di sessionStorage
```

**⚠️ Attenzione:**
- localStorage persiste **per sempre**
- Anche dopo chiusura browser
- Può causare confusione se dimentichi nodi aperti

---

## 🚨 Edge Cases Gestiti

### 1. Server-Side Rendering (SSR)
```typescript
if (typeof window === 'undefined') return new Set(['root']);
```
- Previene errori durante build Next.js
- SSR non ha accesso a `sessionStorage`

### 2. JSON Parse Error
```typescript
try {
  const array = JSON.parse(saved);
  return new Set(array);
} catch (e) {
  console.error('Errore nel caricamento stato espansione:', e);
}
return new Set(['root']);
```
- Se sessionStorage corrotto → fallback safe

### 3. Set Vuoto
```typescript
if (expandedPaths.size > 0) {
  // salva solo se c'è almeno 'root'
}
```
- Non salva Set vuoti (edge case impossibile ma safe)

---

## 📝 Vantaggi

1. ✅ **Esperienza utente migliorata** - Nessun click sprecato
2. ✅ **Workflow più veloce** - Controllo → Modifica → Verifica fluido
3. ✅ **Temporaneo** - Si pulisce automaticamente (sessionStorage)
4. ✅ **Leggero** - Pochi KB di memoria
5. ✅ **Trasparente** - Funziona senza che l'utente se ne accorga
6. ✅ **Reversibile** - Pulsante "Reset" sempre disponibile
7. ✅ **Visibile** - Badge mostra stato corrente

---

## 🎓 Per Sviluppatori

### Aggiungere Logging Dettagliato

```typescript
// In toggleExpand:
console.log('🔀 Toggle nodo:', path, isExpanded ? 'chiuso' : 'aperto');

// In loadExpandedPaths:
console.log('📥 Caricato stato espansione:', array.length, 'nodi');

// In useEffect salvataggio:
console.log('💾 Salvato:', pathsArray); // array completo
```

### Aggiungere Expiration

```typescript
// Salva con timestamp:
const saveData = {
  paths: pathsArray,
  timestamp: Date.now()
};
sessionStorage.setItem('dbInspector_expandedPaths', JSON.stringify(saveData));

// Carica con check expiration (es. 1 ora):
const saved = JSON.parse(sessionStorage.getItem('dbInspector_expandedPaths'));
if (saved && Date.now() - saved.timestamp < 3600000) { // 1 ora
  return new Set(saved.paths);
}
```

---

## 🔄 Compatibilità

- ✅ Chrome/Edge (tutte le versioni moderne)
- ✅ Firefox (tutte le versioni moderne)
- ✅ Safari (iOS 8+, macOS 10.9+)
- ✅ sessionStorage supportato da IE 8+

---

## 🎉 Risultato Finale

L'utente può ora:
1. Aprire il Database Inspector
2. Navigare in profondità (10+ nodi)
3. Cambiare TAB per modificare dati
4. Tornare al Database Inspector
5. **Trovare tutto esattamente come lo aveva lasciato** ✨

**Quality of Life: +1000%** 🚀

---

**Fine documento** - Ultimo aggiornamento: 2025-10-12 14:15
