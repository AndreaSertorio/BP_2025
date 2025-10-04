# 🐛 Debug Mercato Ecografie - Guida

## ✅ Stato Attuale

Il server è **ATTIVO** su http://localhost:3002

## 🔍 Come Verificare il Problema

### 1. **Apri la Console del Browser**
1. Apri **Chrome/Edge** o il tuo browser
2. Vai su http://localhost:3002
3. Premi **F12** o **Cmd+Option+I** (Mac) per aprire DevTools
4. Vai nella tab **Console**

### 2. **Log Attesi nella Console**
Se tutto funziona, dovresti vedere:
```
📊 Inizio caricamento Excel...
📊 File scaricato, parsing in corso...
📊 Fogli disponibili: [...]
📊 Dati letti: 15 prestazioni
✅ Caricamento completato con successo
🔄 Rendering stato loading
✅ Rendering tabella con 15 prestazioni
```

### 3. **Errori Comuni**

#### **A. "Failed to fetch" / Errore 404**
**Problema**: Il file Excel non viene trovato
**Soluzione**: 
```bash
# Verifica che il file esista
ls -la public/assets/Eco_ITA_MASTER.xlsx
```

#### **B. "Cannot read properties of undefined"**
**Problema**: Dati Excel malformati
**Soluzione**: Controlla i log della console per vedere quale cella causa problemi

#### **C. La pagina si blocca senza errori**
**Problema**: Possibile loop infinito nel rendering
**Soluzione**: 
1. Apri DevTools > Performance
2. Clicca Record
3. Aspetta 5 secondi
4. Stop
5. Cerca "Long Tasks" (attività lunghe)

### 4. **Verifica Network**
1. Apri DevTools > **Network**
2. Ricarica la pagina
3. Cerca `Eco_ITA_MASTER.xlsx`
4. Verifica che:
   - Status sia **200 OK**
   - Size sia **~100KB**

## 🔧 Modifiche Applicate

### **Logging Dettagliato**
Ho aggiunto console.log in tutti i punti critici:
- ✅ Inizio caricamento Excel
- ✅ Dopo download file
- ✅ Dopo parsing fogli
- ✅ Dopo lettura dati
- ✅ Prima di ogni render

### **Safety Checks**
```typescript
// Check 1: Verifica loading
if (loading) return <LoadingSpinner />

// Check 2: Verifica errori
if (error) return <ErrorMessage />

// Check 3: Verifica dati vuoti
if (!prestazioni || prestazioni.length === 0) 
  return <EmptyState />

// Check 4: Rendering normale
return <Table />
```

### **Ottimizzazioni Performance**
```typescript
// useMemo per il conteggio visibili
const visibleCount = useMemo(() => {
  return prestazioni.filter(p => p.visible).length;
}, [prestazioni]);
```

## 🚀 Test Rapido

### **Test 1: La pagina carica?**
```bash
curl http://localhost:3002 | grep "Mercato Ecografie"
```
✅ **Output atteso**: `Mercato Ecografie`

### **Test 2: Il file Excel è accessibile?**
```bash
curl -I http://localhost:3002/assets/Eco_ITA_MASTER.xlsx
```
✅ **Output atteso**: `HTTP/1.1 200 OK`

### **Test 3: Next.js compila senza errori?**
Guarda il terminale dove hai avviato `npm run dev`
✅ **Output atteso**: 
```
 ✓ Compiled in XXms
 ○ Ready on http://localhost:3002
```

## 📋 Checklist Debugging

- [ ] Server attivo su porta 3002
- [ ] File Excel esiste in `public/assets/`
- [ ] Console browser aperta (F12)
- [ ] Tab Network aperta per vedere richieste
- [ ] Log della console visibili
- [ ] Nessun errore rosso in console
- [ ] La tab "Mercato Ecografie" è cliccabile

## 🔍 Cosa Cercare nella Console

### **Sintomi del Problema**

#### **Sintomo 1: "Rendering stato loading" infinito**
**Causa**: Il caricamento Excel non completa mai
**Verifica**: 
- Vedi "📊 Inizio caricamento Excel..."?
- Vedi "✅ Caricamento completato con successo"?

#### **Sintomo 2: Errore "Cannot read property 'v'"**
**Causa**: Una cella dell'Excel è vuota o ha formato sbagliato
**Verifica**: Controlla il messaggio di errore per vedere quale riga/cella

#### **Sintomo 3: La pagina è bianca**
**Causa**: Errore di rendering prima dei check
**Verifica**: Guarda la console per errori React

#### **Sintomo 4: "Network error"**
**Causa**: File Excel non raggiungibile
**Verifica**: Tab Network > cerca `Eco_ITA_MASTER.xlsx` > vedi Status 404?

## 🛠️ Soluzioni Rapide

### **Soluzione 1: Riavvia il Server**
```bash
# Ferma il server
lsof -ti:3002 | xargs kill -9

# Riavvia
PORT=3002 npm run dev
```

### **Soluzione 2: Pulisci Cache Next.js**
```bash
rm -rf .next
npm run dev
```

### **Soluzione 3: Ricarica Hard Browser**
- **Mac**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + R

### **Soluzione 4: Verifica Percorso File**
```bash
# Il file DEVE essere qui:
ls -la public/assets/Eco_ITA_MASTER.xlsx

# Se non c'è, copialo di nuovo:
cp ../assets/Eco_ITA_MASTER.xlsx public/assets/
```

## 📞 Info da Fornire se Problema Persiste

1. **Screenshot della Console** (F12 > Console)
2. **Screenshot del Network tab** (F12 > Network, ricarica pagina)
3. **Log del terminale** dove gira `npm run dev`
4. **Errori specifici** (copia/incolla il messaggio esatto)

## 🎯 Test Finale

Una volta risolto, dovresti poter:
- ✅ Cliccare su tab "📊 Mercato Ecografie"
- ✅ Vedere 3 card in alto con i totali
- ✅ Vedere la tabella con 15 prestazioni
- ✅ Cliccare icona 👁️ per nascondere prestazioni
- ✅ Vedere i totali aggiornarsi in tempo reale
- ✅ Cliccare frecce ↑↓ per riordinare
- ✅ Toggle pulsanti "Codice" e "U-B-D-P"

## 📝 Note Tecniche

### **Architettura Caricamento**
1. `useEffect` chiama `loadExcelData()` al mount
2. `loadExcelData()` è wrappato in `useCallback` (dipendenze: [])
3. Fetch file da `/assets/Eco_ITA_MASTER.xlsx`
4. Parse con libreria `xlsx`
5. Cerca foglio che contiene "Riepilogo"
6. Legge 15 righe (una per prestazione)
7. Calcola totale Italia (riga 69)
8. Set state e trigger re-render

### **Possibili Bottleneck**
- ❌ File Excel troppo grande (ma è solo 100KB)
- ❌ Parsing sincrono blocca UI (ma è async)
- ❌ Loop infinito useEffect (risolto con useCallback + [])
- ❌ Re-render eccessivi (risolto con useMemo)

---

**Server attivo su**: http://localhost:3002
**Ultima modifica**: 2025-10-04 18:28
