# 🚀 SETUP BACKEND - DATABASE CENTRALIZZATO

## Sistema Implementato

✅ **Server Express** per gestire `database.json`  
✅ **API REST** per leggere/scrivere prestazioni  
✅ **DatabaseProvider** aggiornato per usare le API  
✅ **NO localStorage** - persistenza su file  

---

## 📋 PASSAGGI SETUP

### 1. Installa Dipendenze

```bash
npm install
```

Verifica che siano installate:
- `express` (server)
- `cors` (CORS headers)
- `concurrently` (per avviare server + frontend insieme)

---

### 2. Avvia il Sistema

**Opzione A: Avvia Tutto Insieme (CONSIGLIATO)**

```bash
npm run dev:all
```

Questo avvia:
- Server backend su `http://localhost:3001`
- Frontend Next.js su `http://localhost:3000`

**Opzione B: Avvia Separatamente**

Terminal 1:
```bash
npm run server
```

Terminal 2:
```bash
npm run dev
```

---

## 🧪 VERIFICA

### 1. Controlla Server

Apri browser su: `http://localhost:3001/health`

Dovresti vedere:
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T..."
}
```

### 2. Controlla Frontend

Apri: `http://localhost:3000`

Console del browser dovrebbe mostrare:
```
✅ Database caricato dal server
```

### 3. Test Modifiche

1. Vai su **"Mercato Ecografie"**
2. Clicca checkbox "Aggredibile" su una prestazione
3. **Apri** `src/data/database.json` nel tuo editor
4. **Verifica** che il campo `aggredibile` sia cambiato!
5. Vai su **"Riepilogo"** → i numeri si aggiornano
6. **Ricarica la pagina** → le modifiche persistono

---

## 📡 API DISPONIBILI

### GET /api/database
Legge l'intero database

```bash
curl http://localhost:3001/api/database
```

### PUT /api/database
Sovrascrive tutto il database

```bash
curl -X PUT http://localhost:3001/api/database \
  -H "Content-Type: application/json" \
  -d @src/data/database.json
```

### POST /api/database/toggle-aggredibile/:codice
Toggle aggredibile per una prestazione

```bash
curl -X POST http://localhost:3001/api/database/toggle-aggredibile/88.71.4
```

### PATCH /api/database/percentuale/:codice
Aggiorna percentuale Extra-SSN

```bash
curl -X PATCH http://localhost:3001/api/database/percentuale/88.71.4 \
  -H "Content-Type: application/json" \
  -d '{"percentuale": 75}'
```

### PATCH /api/database/prestazione/:codice
Aggiorna campo generico prestazione

```bash
curl -X PATCH http://localhost:3001/api/database/prestazione/88.71.4 \
  -H "Content-Type: application/json" \
  -d '{"note": "Prestazione importante"}'
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Server non raggiungibile"

**Causa:** Server non avviato

**Soluzione:**
```bash
# Verifica che il server sia running
npm run server

# Oppure usa:
npm run dev:all
```

### Problema: "EADDRINUSE: address already in use"

**Causa:** Porta 3001 già occupata

**Soluzione:**
```bash
# Trova il processo sulla porta 3001
lsof -i :3001

# Termina il processo
kill -9 <PID>

# Oppure cambia porta in server.js:
const PORT = 3002;  # Cambia qui
```

### Problema: "Cannot read property 'prestazioni'"

**Causa:** Database corrotto o formato non valido

**Soluzione:**
```bash
# Ripristina database.json da git
git checkout src/data/database.json

# Riavvia server
npm run server
```

### Problema: Modifiche non si salvano

**Verifica:**
1. Console del browser → cerca errori HTTP
2. Console del server → cerca log di salvataggio
3. Permessi file: `database.json` deve essere scrivibile

---

## 📂 FILE MODIFICATI

### Nuovi
- `server.js` - Server Express
- `SETUP_BACKEND.md` - Questa guida

### Modificati
- `package.json` - Aggiunti script e dipendenze
- `src/contexts/DatabaseProvider.tsx` - Usa API invece di localStorage
- `src/components/MercatoEcografie.tsx` - Richieste async

---

## ✅ VANTAGGI

1. **database.json sempre aggiornato** - È il file master
2. **No localStorage** - Niente complessità
3. **Multi-user ready** - Basta condividere il file
4. **Git-friendly** - Vedi le modifiche nel diff
5. **Facile backup** - Copia database.json

---

## 🎯 WORKFLOW

```
User clicca checkbox
    ↓
React chiama toggleAggredibile()
    ↓
Fetch POST /api/database/toggle-aggredibile/88.71.4
    ↓
Server Express legge database.json
    ↓
Server fa toggle del campo
    ↓
Server salva database.json
    ↓
Server risponde OK
    ↓
React ricarica database
    ↓
UI si aggiorna ✅
```

---

## 🚦 STATO ATTUALE

✅ Server Express funzionante  
✅ API REST complete  
✅ DatabaseProvider integrato  
✅ MercatoEcografie sincronizzato  
✅ Persistenza su file  
✅ Nessun localStorage  

**Tutto pronto per l'uso! 🎉**
