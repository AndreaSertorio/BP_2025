# 🔧 Stato Server e Troubleshooting

**Data:** 2025-10-08 18:10  
**Status:** ✅ TUTTI I SERVER ATTIVI

---

## ✅ SERVER ATTIVI

### 1. **Server API Express** (Porta 3001)
- **PID:** 68347
- **Comando:** `npm run server`
- **File:** `server.js`
- **Database:** `/src/data/database.json`
- **Test:** `curl http://localhost:3001/api/database`

```bash
# Verifica stato
lsof -i :3001 | grep LISTEN

# Test API
curl http://localhost:3001/api/database | jq '.mercatoEcografie.italia.prestazioni[0]'
```

**Risposta attesa:**
```json
{
  "codice": "88.71.4",
  "nome": "Capo e collo",
  "aggredibile": true,  ← AGGIORNATO CORRETTAMENTE
  ...
}
```

---

### 2. **Next.js Dev Server** (Porta 3000)
- **PID:** 68623
- **Comando:** `PORT=3000 npm run dev`
- **URL:** http://localhost:3000
- **Verifica:** Browser deve caricare dashboard

```bash
# Verifica stato
lsof -i :3000 | grep LISTEN

# Test HTTP
curl -I http://localhost:3000
```

---

## 🔄 FLUSSO DATI

```
1. USER modifica src/data/database.json manualmente
         ↓
2. Server API legge src/data/database.json
         ↓
3. DatabaseProvider carica dati da API al MOUNT
         ↓
4. Componenti React ricevono dati
         ↓
5. UI renderizza (ma cache browser potrebbe bloccare!)
```

---

## 🐛 PROBLEMA RILEVATO: CACHE BROWSER

### Sintomi:
- ✅ Server API risponde con dati corretti
- ✅ Database.json aggiornato
- ❌ UI non mostra modifiche

### Causa:
DatabaseProvider carica dati **solo al mount** dell'app. Se modifichi `database.json` manualmente, serve:

1. **Hard Refresh del Browser**
2. **Oppure** usare API per modificare (che triggerà re-render)

---

## 🧪 TESTING

### Test 1: Verificare Server API
```bash
# Terminal
curl http://localhost:3001/api/database | \
  jq '.mercatoEcografie.italia.prestazioni[] | select(.codice=="88.71.4")'
```

**Output atteso:**
```json
{
  "codice": "88.71.4",
  "nome": "Capo e collo - Strutture superficiali",
  "U": 32368,
  "B": 196997,
  "D": 388559,
  "P": 562362,
  "percentualeExtraSSN": 50,
  "aggredibile": true,  ← Modificato da te!
  "note": "Prestazione target per Eco3D"
}
```

---

### Test 2: Verificare Browser

#### Apri DevTools (Cmd+Option+I):

**Console:**
```javascript
// Verifica che DatabaseProvider sia caricato
console.log('Database caricato?');

// Force reload dati
localStorage.clear();
location.reload();
```

**Network Tab:**
1. Filtra per `localhost:3001`
2. Cerca chiamata a `/api/database`
3. Verifica response JSON mostra `aggredibile: true`

---

### Test 3: Hard Refresh

```
1. Apri http://localhost:3000
2. Premi Cmd+Shift+R (Mac) o Ctrl+Shift+R (Win)
3. Oppure: Cmd+Option+I → Network → ☑️ Disable cache → F5
```

---

## 🔧 COMANDI UTILI

### Fermare tutti i processi:
```bash
# Trova processi Node sulle porte
lsof -i :3000 -i :3001 | grep LISTEN

# Killa per PID
kill -9 <PID>

# Oppure killa tutti Node
pkill -9 node
```

### Riavviare pulito:
```bash
# Terminal 1 - Server API
cd financial-dashboard
npm run server

# Terminal 2 - Next.js
cd financial-dashboard
PORT=3000 npm run dev
```

### Verificare sincronizzazione file:
```bash
# Copia src → public (per static fallback)
cp src/data/database.json public/data/database.json

# Verifica differenze
diff src/data/database.json public/data/database.json
```

---

## 🎯 SOLUZIONE AL PROBLEMA DI RENDERING

### Opzione 1: Hard Refresh Browser
```
Cmd+Shift+R (o Ctrl+Shift+R su Windows)
```

### Opzione 2: Clear Browser Cache
```javascript
// Console del browser
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Opzione 3: Modificare tramite UI (preferito)
Invece di modificare `database.json` manualmente:
1. Vai su http://localhost:3000
2. Tab "Mercato Ecografie"
3. Clicca checkbox per modificare `aggredibile`
4. La modifica viene salvata tramite API
5. DatabaseProvider si aggiorna automaticamente

---

## 📊 PRESTAZIONI MODIFICATE DA TE

Hai modificato manualmente in `/src/data/database.json`:

### 1. Codice 88.71.4 - Capo e collo
```diff
- "aggredibile": false,
+ "aggredibile": true,
```

### 2. Codice 88.73.5 - TSA
```diff
- "aggredibile": false,
+ "aggredibile": true,
```

**Per vedere le modifiche:**
1. Apri http://localhost:3000
2. **Hard Refresh**: Cmd+Shift+R
3. Tab "TAM/SAM/SOM" → Regione IT
4. Verifica che i checkbox siano selezionati

---

## ⚠️ NOTE IMPORTANTI

### DatabaseProvider vs Static Files

L'app usa **DUE meccanismi** per caricare dati:

1. **DatabaseProvider** (preferito):
   - Carica da API `localhost:3001/api/database`
   - Modifiche tramite UI → salvate su file
   - Real-time sync tra componenti

2. **Static fetch** (fallback):
   - Carica da `/public/data/database.json`
   - Usato se server non disponibile
   - Nessuna persistenza

**Assicurati che il server API sia SEMPRE attivo!**

---

## 🚀 QUICK START

```bash
# 1. Ferma tutto
pkill -9 node

# 2. Avvia Server API
cd financial-dashboard
npm run server &

# 3. Avvia Next.js
PORT=3000 npm run dev &

# 4. Apri browser
open http://localhost:3000

# 5. Hard refresh
# Cmd+Shift+R
```

---

## 🔍 DEBUG CHECKLIST

- [ ] Server API attivo su 3001? → `lsof -i :3001`
- [ ] Next.js attivo su 3000? → `lsof -i :3000`
- [ ] API risponde? → `curl localhost:3001/api/database | jq .version`
- [ ] Database aggiornato? → `cat src/data/database.json | jq '.mercatoEcografie.italia.prestazioni[0].aggredibile'`
- [ ] Browser cache pulita? → Hard refresh (Cmd+Shift+R)
- [ ] Console errori? → DevTools → Console
- [ ] Network chiamata API? → DevTools → Network → localhost:3001

---

**Conclusione:**
I server sono attivi e funzionanti. Il problema di rendering è probabilmente **cache del browser**. 

**Soluzione immediata:** **Hard Refresh** (Cmd+Shift+R) nella pagina http://localhost:3000
