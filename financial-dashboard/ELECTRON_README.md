# 🖥️ Eco 3D Dashboard - Electron Desktop App

## ✅ Implementazione Completata

L'applicazione è stata configurata per funzionare anche come **app desktop standalone** utilizzando Electron.

### 🔒 Garanzia di Sicurezza

**✅ ZERO MODIFICHE** al codice esistente:
- Tutti i file in `src/`, `server.js`, componenti → **INVARIATI**
- Script esistenti (`npm run dev`, `./START.sh`) → **FUNZIONANO COME PRIMA**
- Database, configurazione → **NESSUNA MODIFICA**

**✅ SOLO AGGIUNTE**:
- Cartella `electron/` → Nuova
- 4 script npm → Nuovi
- 2 dipendenze dev → Nuove

---

## 🚀 Come Funziona

### Modalità 1: **Web (come prima)** ✅
```bash
# Avvio normale con script esistente
./START.sh

# Oppure
npm run dev        # Solo Next.js
npm run server     # Solo API
npm run dev:all    # Entrambi con concurrently
```
→ **Funziona esattamente come prima**

### Modalità 2: **Desktop Electron** 🆕
```bash
# Avvio in finestra Electron
npm run electron:dev
```
→ **Nuova modalità, completamente indipendente**

---

## 📦 Installazione Dipendenze Electron

Prima di usare Electron per la prima volta:

```bash
# Dalla cartella financial-dashboard/
npm install
```

Questo installerà:
- `electron` (~130 MB)
- `electron-builder` (~50 MB)

---

## 🧪 Test Electron - STEP BY STEP

### **Test 1: Verifica che l'app normale funzioni ancora**

```bash
# In un terminale
./START.sh
```

Apri `http://localhost:3000` → Dovrebbe funzionare **esattamente come prima**

### **Test 2: Prova Electron per la prima volta**

```bash
# Ferma START.sh (Ctrl+C)

# Avvia in modalità Electron
npm run electron:dev
```

**Cosa dovrebbe succedere**:
1. Console mostra: "🔧 Avvio Server API Express..."
2. Console mostra: "🌐 Avvio Next.js Server..."
3. Si apre una finestra desktop con l'app
4. L'app funziona identica alla versione web

### **Test 3: Verifica funzionalità**

Nella finestra Electron:
- ✅ Dashboard carica correttamente
- ✅ Grafici si visualizzano
- ✅ Modifiche parametri funzionano
- ✅ Database si salva correttamente
- ✅ Export funziona

---

## 🏗️ Creazione Eseguibile Standalone

### **Per macOS**

```bash
# Build completo (crea .dmg + .zip)
npm run electron:build:mac

# Output in:
dist-electron/
  ├── Eco3D Financial Dashboard-1.0.0.dmg     (installer)
  └── Eco3D Financial Dashboard-1.0.0-mac.zip (archivio)
```

**Dimensione finale**: ~180-220 MB

### **Per Windows** (richiede Wine su Mac o build su Windows)

```bash
npm run electron:build:win

# Output:
dist-electron/
  ├── Eco3D Financial Dashboard Setup 1.0.0.exe  (installer)
  └── Eco3D Financial Dashboard 1.0.0.exe        (portable)
```

### **Build per entrambi**

```bash
npm run electron:build
```

---

## 📱 Come Usare l'Eseguibile

### Su macOS:
1. Apri il file `.dmg`
2. Trascina "Eco3D Financial Dashboard" in Applicazioni
3. Doppio clic per aprire
4. Prima volta: "Apri" dal menu contestuale (sicurezza macOS)

### Su Windows:
1. Esegui il `.exe` installer o usa la versione portable
2. Doppio clic sull'icona
3. L'app si avvia automaticamente

**🎯 L'applicazione è completamente standalone**:
- ✅ Non serve Node.js installato
- ✅ Non serve npm
- ✅ Non serve terminale
- ✅ Funziona offline
- ✅ Database incluso

---

## 🗂️ Struttura File Aggiunti

```
financial-dashboard/
  ├── electron/                    ← NUOVO
  │   ├── main.js                 ← Processo principale Electron
  │   ├── preload.js              ← Bridge sicurezza
  │   └── icon.png/.icns/.ico     ← Icone app (da creare)
  │
  ├── electron-builder.yml        ← NUOVO - Config build
  ├── ELECTRON_README.md          ← NUOVO - Questa guida
  │
  └── package.json                ← MODIFICATO
      ├── "main": "electron/main.js"     ← Aggiunto
      ├── scripts.electron:dev           ← Aggiunto
      ├── scripts.electron:build         ← Aggiunto
      ├── devDeps.electron               ← Aggiunto
      └── devDeps.electron-builder       ← Aggiunto
```

**Tutto il resto → INVARIATO**

---

## 🔧 Troubleshooting

### ❌ Errore: "electron: command not found"
```bash
npm install  # Reinstalla dipendenze
```

### ❌ La finestra Electron si apre ma è vuota
Attendi 5-10 secondi. Next.js impiega tempo ad avviarsi la prima volta.

### ❌ Errore: "Port 3000 already in use"
```bash
# Ferma eventuali processi
lsof -ti :3000 :3001 | xargs kill -9
# Riprova
npm run electron:dev
```

### ❌ Il build fallisce con errore di firma
Disabilita la firma del codice (già fatto in `electron-builder.yml`):
```yaml
mac:
  hardenedRuntime: false
  gatekeeperAssess: false
```

### ❌ L'app funziona in dev ma non nel build
Verifica che `.next` sia stato buildato:
```bash
npm run build          # Crea build Next.js ottimizzato
npm run electron:build # Poi crea eseguibile
```

---

## 🎨 Personalizzazione

### Cambia Icona
Sostituisci i file in `electron/`:
- `icon.icns` (macOS, 512x512px)
- `icon.ico` (Windows, 256x256px)
- `icon.png` (Linux, 512x512px)

### Cambia Nome App
Modifica `electron-builder.yml`:
```yaml
productName: Il Mio Nome
```

### Cambia Dimensioni Finestra
Modifica `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,  // Larghezza
  height: 1000, // Altezza
  // ...
});
```

---

## 📊 Comparazione Modalità

| Feature | Web (START.sh) | Electron Desktop |
|---------|----------------|------------------|
| Richiede Node.js | ✅ Sì | ❌ No (embedded) |
| Richiede Browser | ✅ Sì | ❌ No (Chromium embedded) |
| Installazione | npm install | Doppio clic .dmg/.exe |
| Aggiornamenti | git pull | Sostituisci .app/.exe |
| Portabilità | Solo con Node.js | Totale |
| DevTools | F12 nel browser | Cmd+Option+I |
| Dimensione | ~2 MB app | ~200 MB app |
| Offline | ❌ No | ✅ Sì |

---

## ✅ Checklist Test Completa

Prima di distribuire l'app:

- [ ] **Test 1**: `npm run dev` funziona
- [ ] **Test 2**: `./START.sh` funziona
- [ ] **Test 3**: `npm run electron:dev` funziona
- [ ] **Test 4**: Tutte le sezioni caricano (Dashboard, Funnel, Financials, etc.)
- [ ] **Test 5**: Modifiche parametri salvano correttamente
- [ ] **Test 6**: Export CSV/Excel funzionano
- [ ] **Test 7**: Grafici si visualizzano
- [ ] **Test 8**: `npm run electron:build:mac` completa senza errori
- [ ] **Test 9**: L'eseguibile .dmg si installa
- [ ] **Test 10**: L'app installata si avvia e funziona

---

## 🚨 Rollback (se qualcosa va storto)

Per tornare alla versione precedente:

```bash
# 1. Rimuovi cartella electron
rm -rf electron/

# 2. Rimuovi file config
rm electron-builder.yml
rm ELECTRON_README.md

# 3. Ripristina package.json
# Rimuovi da "scripts":
#   - electron:dev
#   - electron:build
#   - electron:build:mac
#   - electron:build:win
# Rimuovi "main": "electron/main.js"
# Rimuovi da "devDependencies":
#   - electron
#   - electron-builder

# 4. Reinstalla dipendenze
npm install
```

**Tempo totale**: 2 minuti

---

## 📞 Supporto

### Errori Comuni

1. **Porta occupata**: Ferma tutti i processi Node.js
2. **Finestra vuota**: Attendi l'avvio di Next.js (5-10 sec)
3. **Build fallito**: Esegui `npm run build` prima
4. **Icona mancante**: Usa un placeholder o rimuovi da config

### Log Utili

```bash
# Electron in modalità verbose
DEBUG=* npm run electron:dev

# Verifica porte in uso
lsof -i :3000
lsof -i :3001

# Verifica processi Node
ps aux | grep node
```

---

## 🎯 Prossimi Passi

1. ✅ **Test** l'app in modalità dev: `npm run electron:dev`
2. ✅ **Verifica** che tutto funzioni
3. ✅ **Crea build** per macOS: `npm run electron:build:mac`
4. ✅ **Testa eseguibile** su un altro Mac
5. ✅ **Distribuisci** il file .dmg

---

**Versione**: 1.0.0  
**Compatibilità**: macOS 10.13+, Windows 10+, Linux (Ubuntu 18.04+)  
**Node.js richiesto per dev**: 18+  
**Node.js richiesto per app finale**: Nessuno (embedded)
