# 🚀 AVVIO RAPIDO - Server + Frontend

## ⚡ Comando Unico per Avviare Tutto

```bash
cd "/Users/dracs/Documents/START_UP/DOC PROGETTI/DOC_ECO 3d Multisonda/__BP 2025/financial-dashboard"
npm run dev:all
```

Questo comando avvia **contemporaneamente**:
- 🔵 **SERVER** (porta 3001) - API per database.json
- 🟣 **NEXT.JS** (porta 3000) - Frontend React

---

## 📋 Cosa Vedrai nel Terminale

```
[SERVER] 
[SERVER] ╔════════════════════════════════════════════════════════════════╗
[SERVER] ║   🚀 SERVER DATABASE ECO 3D                                   ║
[SERVER] ║   📡 Porta: 3001                                              ║
[SERVER] ║   📂 Database: database.json                                  ║
[SERVER] ╚════════════════════════════════════════════════════════════════╝
[NEXT]   
[NEXT]   ▲ Next.js 14.0.0
[NEXT]   - Local:        http://localhost:3000
[NEXT]   ✓ Ready in 2.5s
```

---

## ✅ Verifica che Funzioni

### Test 1: Server Backend
```bash
curl http://localhost:3001/health
```

Dovresti vedere:
```json
{"status":"ok","timestamp":"2025-10-06T..."}
```

### Test 2: API Regioni
```bash
curl http://localhost:3001/api/regioni
```

Dovresti vedere i dati delle regioni (USA, Europa, Cina, Globale).

### Test 3: Frontend
Apri browser: `http://localhost:3000`

---

## 🛑 Per Fermare Tutto

Premi **`Ctrl + C`** nel terminale → Ferma server + frontend insieme

---

## 🔧 Comandi Alternativi

Se preferisci avviare separatamente:

### Solo Server (terminale 1)
```bash
npm run server
```

### Solo Frontend (terminale 2)
```bash
npm run dev
```

---

## 🎯 Adesso Testa il Sistema

1. **Apri** `http://localhost:3000`
2. **Vai** su "Mercato Ecografie" → Tab "USA"
3. **Sposta** lo slider (es: 5.5 → 6.0)
4. **Clicca** il pulsante "💾 Salva"
5. **Vai** su tab "Riepilogo"
6. **Verifica** che la card USA mostri "6.0× Italia"
7. **Apri** `src/data/database.json`
8. **Cerca** `"usa"` → Vedi `"moltiplicatoreVolume": 6.0` ✅

---

## 📊 Monitoraggio

### Log Server
Ogni salvataggio mostrerà nel terminale:
```
[SERVER] ✅ Moltiplicatori usa aggiornati: { volume: 6, valore: 1.8 }
```

### Log Browser (Console)
Apri DevTools (F12) → Console:
```
✅ Moltiplicatori usa aggiornati
✅ Database caricato dal server
```

---

## 🚨 Troubleshooting

### Problema: "EADDRINUSE: porta già in uso"

**Soluzione 1:** Trova e termina processo
```bash
lsof -i :3001  # Trova PID del server
kill -9 <PID>  # Termina processo

lsof -i :3000  # Trova PID di Next.js
kill -9 <PID>  # Termina processo
```

**Soluzione 2:** Usa script cleanup
```bash
killall node  # ⚠️ Termina tutti i processi Node!
npm run dev:all  # Riavvia
```

### Problema: "Cannot GET /api/regioni"

**Causa:** Server non avviato o non aggiornato

**Soluzione:**
```bash
# Ferma tutto (Ctrl+C)
# Riavvia
npm run dev:all
```

### Problema: Modifiche non si salvano

**Verifica:**
1. Server è attivo? → Cerca `[SERVER]` nei log
2. API funziona? → `curl http://localhost:3001/api/regioni`
3. Console browser ha errori? → F12 → Console

---

## 📁 File Coinvolti

```
financial-dashboard/
├── server.js              ← Server Express (API)
├── package.json           ← Script npm
└── src/
    ├── data/
    │   └── database.json  ← DATI SALVATI QUI
    ├── contexts/
    │   └── DatabaseProvider.tsx
    └── components/
        ├── MercatoEcografieRegionale.tsx  ← TAB con slider
        └── MercatoRiepilogo.tsx           ← Visualizza dati
```

---

## 🎉 Sistema Pronto!

Dopo aver eseguito `npm run dev:all`:
- ✅ Server attivo su porta 3001
- ✅ Frontend attivo su porta 3000  
- ✅ API `/api/regioni` funzionanti
- ✅ Salvataggio funzionante
- ✅ Sincronizzazione completa

**Vai su http://localhost:3000 e testa! 🚀**
