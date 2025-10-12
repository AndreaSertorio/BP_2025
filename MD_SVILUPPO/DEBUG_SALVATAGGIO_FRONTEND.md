# 🐛 DEBUG: Salvataggio Frontend Non Funziona

**Data:** 11 Ottobre 2025 - 19:30  
**Status:** 🔍 **IN DEBUG**

---

## ✅ **BACKEND FUNZIONA PERFETTAMENTE**

Ho verificato che:

```bash
./test-saas-tiers.sh

🎉 TEST COMPLETATO CON SUCCESSO!
📋 RIEPILOGO:
  ✅ Server API attivo (porta 3001)
  ✅ Route PATCH /api/database/revenue-model/saas funziona
  ✅ Dati scritti su database.json
  ✅ Dati persistiti su disco
```

**Le API salvano correttamente!**

---

## ❌ **PROBLEMA: Frontend Non Salva**

Quando modifichi i tiers nell'interfaccia web:
1. I valori cambiano nello stato React (rimangono nella sessione)
2. MA non vengono salvati su database.json
3. Al reload (F5) → i valori spariscono

**Cause Possibili:**

1. Il frontend non chiama `updateRevenueModelSaaS()`
2. La chiamata API fallisce silenziosamente
3. Il frontend legge da un altro source (cache, file statico)

---

## 🔍 **STEP DI DEBUG**

### **1. Apri Console Browser**

```
1. Apri http://localhost:3000 (o 3002)
2. Premi F12 → Tab "Console"
3. Vai su Revenue Model → SaaS → Tab "A Scaglioni"
4. Modifica Tier 1: €305 → €400
5. Attendi 1 secondo
```

**Cosa Dovresti Vedere:**

```javascript
💾 Auto-saving Revenue Model...
✅ SaaS Revenue Model aggiornato
```

**Se NON vedi questi log:**
→ Il componente NON sta chiamando `saveChanges()`

**Se vedi errori:**
→ La chiamata API sta fallendo

---

### **2. Verifica Network Calls**

```
1. F12 → Tab "Network"
2. Modifica un tier
3. Cerca richieste a:
   - http://localhost:3001/api/database/revenue-model/saas
   - Method: PATCH
   - Status: 200 OK
```

**Se NON vedi la richiesta:**
→ `saveChanges()` non viene chiamata

**Se vedi Status 404:**
→ Route non trovata (impossibile, abbiamo verificato)

**Se vedi CORS error:**
→ Problema di configurazione server (improbabile)

---

### **3. Test Manuale Console Browser**

Apri Console Browser e esegui:

```javascript
// Test diretto API
fetch('http://localhost:3001/api/database/revenue-model/saas', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pricing: {
      tiered: {
        tiers: [
          { scansUpTo: 100, monthlyFee: 777, description: "Test" }
        ]
      }
    }
  })
})
.then(r => r.json())
.then(d => console.log('✅ Salvato:', d))
.catch(e => console.error('❌ Errore:', e));
```

**Se funziona:**
→ L'API è OK, il problema è nel componente React

**Se fallisce:**
→ Problema di rete/CORS

---

### **4. Verifica File Caricato**

Il frontend potrebbe caricare `database.json` come file statico invece che dall'API.

Controlla in `DatabaseProvider.tsx`:

```typescript
// Cerca questa riga:
const response = await fetch(`${API_BASE_URL}/database`);

// Verifica che API_BASE_URL sia:
const API_BASE_URL = 'http://localhost:3001/api';

// E NON:
import database from '../data/database.json'  // ← STATICO!
```

---

## 🎯 **DIAGNOSI PROBABILE**

Basandomi sul codice, il problema più probabile è:

### **Il componente non chiama `saveChanges()` correttamente**

Possibili cause:

1. **Il debounce si resetta troppo velocemente**
   - Modifichi un campo
   - Il timer parte (800ms)
   - Modifichi altro campo
   - Il timer si RESETTA
   - Non salva mai

2. **Il beforeunload non funziona in Next.js dev mode**
   - Il beforeunload potrebbe essere ignorato durante sviluppo
   - Funziona solo in produzione

3. **Gli stati React non sono sincronizzati**
   - Modifichi i tiers nello stato locale
   - Ma `currentStateJSON` non rileva il cambiamento
   - `hasChanges` rimane `false`
   - `saveChanges()` non viene mai chiamata

---

## 🔧 **SOLUZIONI**

### **Soluzione A: Usa il Bottone "Salva ora"**

Il bottone blu "Salva ora" dovrebbe SEMPRE funzionare perché:
- Chiama `handleSaveNow()` con `await`
- Non dipende da debounce
- Forza il salvataggio immediato

**Test:**
```
1. Modifica un tier
2. Click bottone "Salva ora"
3. Attendi che diventi "Salvato" (verde)
4. F5
5. ✅ Dovrebbe rimanere
```

**Se questo funziona:**
→ Il problema è solo con l'auto-save

---

### **Soluzione B: Aggiungi Logging Esplicito**

Aggiungi console.log in punti chiave:

```typescript
// In RevenueModelDashboard.tsx

// 1. Quando cambi stato
setSaasTiers(newTiers);
console.log('🔄 Tiers aggiornati:', newTiers);

// 2. Nel useMemo currentStateJSON
const currentStateJSON = useMemo(() => {
  const json = JSON.stringify({...});
  console.log('📊 currentStateJSON aggiornato');
  return json;
}, [deps]);

// 3. Nel useEffect di salvataggio
useEffect(() => {
  console.log('🔍 Check hasChanges:', hasChanges);
  console.log('🔍 currentStateJSON vs savedStateJSON');
  
  if (!changed) {
    console.log('⏭️  Nessun cambiamento, skip save');
    return;
  }
  
  console.log('⏰ Debounce avviato (800ms)');
  const timeoutId = setTimeout(() => {
    console.log('💾 Debounce completato, chiamo saveChanges()');
    saveChanges();
  }, 800);
  
  return () => {
    console.log('🚫 Debounce cancellato');
    clearTimeout(timeoutId);
  };
}, [currentStateJSON]);
```

Questo ti dirà ESATTAMENTE dove si blocca il flusso.

---

### **Soluzione C: Verifica che i Tiers Siano nel Payload**

Nel `saveChanges()`, aggiungi log del payload:

```typescript
const saveChanges = useCallback(async () => {
  console.log('💾 saveChanges() AVVIATO');
  console.log('📦 saasTiers:', saasTiers);
  
  try {
    // ... altre chiamate ...
    
    await updateRevenueModelSaaS({
      enabled: saasEnabled,
      pricing: {
        tiered: {
          enabled: saasTieredEnabled,
          tiers: saasTiers,  // ← Questo viene inviato?
          grossMarginPct: saasTieredGrossMarginPct
        }
      }
    });
    
    console.log('✅ updateRevenueModelSaaS completato');
  } catch (error) {
    console.error('❌ Errore saveChanges:', error);
  }
}, [deps]);
```

---

## 📋 **CHECKLIST DEBUG**

Segui questi step in ordine:

- [ ] Server API attivo su 3001? (`lsof -i :3001`)
- [ ] Next.js attivo su 3000/3002? (`lsof -i :3000`)
- [ ] Console browser mostra "💾 Auto-saving"?
- [ ] Console browser mostra "✅ SaaS Revenue Model aggiornato"?
- [ ] Network tab mostra richiesta PATCH a `/revenue-model/saas`?
- [ ] Richiesta PATCH ha status 200 OK?
- [ ] Console server mostra "📥 Ricevuto update SaaS"?
- [ ] Console server mostra "✅ SaaS Revenue Model aggiornato"?
- [ ] `database.json` su disco ha i nuovi valori? (verifica con `jq`)
- [ ] Bottone "Salva ora" funziona?
- [ ] Badge diventa verde "Salvato" dopo il salvataggio?

Se tutti i punti sono ✅ ma al reload i dati spariscono:
→ Il frontend carica da un'altra fonte (cache, file statico, altro database)

---

## 🚨 **CASO SPECIALE: Next.js Cache**

Next.js potrebbe fare cache delle API calls. Verifica:

1. **Hard reload:** Cmd+Shift+R (Mac) o Ctrl+Shift+R (Win)
2. **Disabilita cache:** F12 → Network → checkbox "Disable cache"
3. **Clear cache:** Chrome → Clear browsing data → Cached images

---

## 🎯 **AZIONE IMMEDIATA**

**Fai questo adesso:**

1. Apri http://localhost:3000
2. F12 → Console
3. Vai su Revenue Model → SaaS → "A Scaglioni"
4. Modifica Tier 1 a €999
5. **PRIMA di ricaricare**, fai screenshot della console
6. Click bottone "Salva ora"
7. Osserva la console
8. Attendi che badge diventi verde
9. **SOLO POI** fai F5

Dimmi cosa vedi nella console in ogni step.

---

## 📊 **RISULTATI ATTESI vs REALI**

### **Attesi:**

```
Console Browser:
🔄 Tiers aggiornati
📊 currentStateJSON aggiornato
🔍 Check hasChanges: true
⏰ Debounce avviato (800ms)
💾 Debounce completato, chiamo saveChanges()
💾 saveChanges() AVVIATO
✅ updateRevenueModelSaaS completato
✅ SaaS Revenue Model aggiornato

Console Server:
📥 Ricevuto update SaaS: { pricing: { tiered: { tiers: [...] } } }
✅ SaaS Revenue Model aggiornato

database.json:
"monthlyFee": 999  ✅
```

### **Reali (da verificare):**

```
Console Browser:
?

Console Server:
?

database.json:
?
```

---

**Prossimo step:** Esegui il test e dimmi cosa vedi! 🔍
