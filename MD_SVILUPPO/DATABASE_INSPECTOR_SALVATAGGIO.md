# Database Inspector - Sistema di Salvataggio

**Data aggiornamento:** 2025-10-11

## ✅ Problema Risolto

Le modifiche nel Database Inspector ora vengono **salvate permanentemente** sul file `database.json`.

---

## 🔧 Come Funziona

### Prima (Non Funzionante)
- ❌ Modifiche solo in memoria (stato React)
- ❌ Si perdevano al refresh della pagina
- ❌ Nessuna persistenza su file

### Ora (Funzionante) ✅
1. **Clicchi sull'icona ✏️** per modificare un valore
2. **Modifichi il valore** nel campo di input
3. **Clicchi su ✅** per salvare
4. **Chiamata API** → `PATCH /api/database`
5. **Salvataggio su file** → `/src/data/database.json`
6. **Sincronizzazione** → `/public/data/database.json`
7. **Ricaricamento automatico** → Vedi subito le modifiche
8. **Messaggio di conferma** → "✅ Salvato: [nome_campo]"

---

## 📂 File Coinvolti

### 1. `/src/app/api/database/route.ts` (NUOVO)
API endpoint per gestire il database:
- **GET** `/api/database` → Legge sempre l'ultima versione
- **PATCH** `/api/database` → Salva modifiche permanentemente

### 2. `/src/components/DatabaseInspector.tsx` (AGGIORNATO)
- **Funzione `loadDatabase()`** → Usa API invece di file statico
- **Funzione `saveEdit()`** → Salva via API invece che solo in memoria
- **Badge "🔴 LIVE da API"** → Indica che i dati sono sempre aggiornati
- **Messaggio salvataggio** → Feedback visivo dopo ogni modifica

### 3. `/src/app/api/budget/update/route.ts` (AGGIORNATO)
- Sincronizza modifiche budget su **entrambi** i file
- `/public/data/database.json` (file statico)
- `/src/data/database.json` (file sorgente API)

---

## 🎯 Flusso Completo

```
Utente modifica valore nel Database Inspector
             ↓
    Click ✅ (saveEdit)
             ↓
    PATCH /api/database
             ↓
    Aggiorna /src/data/database.json
             ↓
    Sincronizza /public/data/database.json
             ↓
    Ricarica dati da API (loadDatabase)
             ↓
    Mostra messaggio: "✅ Salvato: [campo]"
             ↓
    Modifica visibile immediatamente
```

---

## 💾 Doppio Salvataggio

Ogni modifica viene salvata su **2 file**:

1. **`/src/data/database.json`**
   - File sorgente letto dall'API
   - Usato da Database Inspector (LIVE)
   
2. **`/public/data/database.json`**
   - File statico (fallback)
   - Sincronizzato automaticamente

### Perché 2 File?

- **API** legge da `/src/data/` (server-side, sempre aggiornato)
- **Fallback** disponibile in `/public/data/` (client-side, cache-friendly)
- **Sincronizzazione automatica** garantisce coerenza

---

## 🔄 Auto-Refresh

### Pulsante "Auto ON/OFF"
- **OFF** (default): Ricarica manuale con pulsante "Refresh"
- **ON**: Ricarica automatica ogni 5 secondi
- **Icona animata**: Quando attivo, icona gira
- **Badge lampeggiante**: "🔄 Auto-refresh attivo (5s)"

### Quando Usare Auto-Refresh

✅ **Consigliato per:**
- Test e sviluppo
- Visualizzare modifiche da altri componenti
- Debug di flussi complessi

❌ **Non necessario per:**
- Uso normale
- Modifiche dirette nel Database Inspector (già ricarica automaticamente)

---

## 📊 Indicatori Visivi

### Badge "🔴 LIVE da API"
Indica che stai vedendo dati in **tempo reale** dall'API, non da cache.

### Messaggio di Salvataggio
Dopo ogni modifica salvata:
```
✅ Salvato: [nome_campo]
```
Appare per 3 secondi sotto la barra di ricerca.

### Pannello Verde "Salvataggio Modifiche"
Spiega che:
- ✅ Modifiche con ✏️ sono **permanenti**
- ⚠️ Nuove sezioni sono **temporanee** (servono export manuale)

---

## 🚨 Importante

### Modifiche Permanenti ✅
Tutto quello che modifichi tramite **icona ✏️** viene salvato sul file:
- Prezzi
- Configurazioni
- Valori di mercato
- Moltiplicatori
- etc.

### Modifiche Temporanee ⚠️
Solo le **nuove sezioni** create con "Nuova Sezione" sono temporanee:
- Esistono solo in memoria
- Per renderle permanenti: **Esporta** → Sostituisci file manualmente

---

## 🧪 Test di Verifica

### Test 1: Modifica Semplice
1. Apri Database Inspector
2. Espandi una sezione (es. `mercatoEcografie`)
3. Clicca ✏️ su un valore
4. Modifica il valore
5. Clicca ✅
6. Vedi messaggio "✅ Salvato"
7. Fai refresh pagina → Modifica ancora presente ✅

### Test 2: Auto-Refresh
1. Apri Database Inspector
2. Clicca "Auto ON"
3. Vedi badge "🔄 Auto-refresh attivo"
4. Vai in altra sezione app e modifica un dato
5. Torna al Database Inspector
6. Entro 5 secondi vedi la modifica ✅

### Test 3: Persistenza
1. Modifica un valore nel Database Inspector
2. Chiudi browser completamente
3. Riapri applicazione
4. Vai al Database Inspector
5. Verifica che la modifica sia ancora presente ✅

---

## 📝 Log Console

Quando salvi una modifica, nella console vedi:
```javascript
✅ Modifica salvata sul database: {
  success: true,
  message: "Database aggiornato con successo",
  updatedPath: "mercatoEcografie.italia[0].u"
}

📊 Database caricato da API: {
  sezioniTotali: 12,
  timestamp: "2025-10-11T18:45:23.456Z"
}
```

---

## 🔍 Troubleshooting

### Problema: Modifiche Non Si Salvano
**Causa**: API non raggiungibile  
**Soluzione**: Verifica che il server Next.js sia attivo

### Problema: Errore "500" al Salvataggio
**Causa**: Permessi file o path non corretto  
**Soluzione**: Verifica permessi su `/src/data/database.json`

### Problema: Modifiche Si Perdono al Refresh
**Causa**: File non sincronizzati  
**Soluzione**: Copia manualmente `src/data/database.json` → `public/data/database.json`

---

## ✨ Vantaggi

1. ✅ **Salvataggio Reale** - Non più modifiche temporanee
2. ✅ **Feedback Immediato** - Messaggio di conferma visivo
3. ✅ **Auto-Sync** - I due file rimangono sincronizzati
4. ✅ **Live Data** - Sempre i dati più aggiornati
5. ✅ **Auto-Refresh** - Opzione per vedere modifiche da altre fonti
6. ✅ **Persistenza** - Modifiche sopravvivono al riavvio

---

## 🎓 Per Sviluppatori

### Aggiungere Nuove API che Modificano il Database

Se crei nuove API che scrivono su `database.json`, ricorda di:

```typescript
// 1. Salva su src/data (sorgente)
const srcDbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
await fs.writeFile(srcDbPath, JSON.stringify(database, null, 2), 'utf-8');

// 2. Sincronizza su public/data (statico)
const publicDbPath = path.join(process.cwd(), 'public', 'data', 'database.json');
await fs.writeFile(publicDbPath, JSON.stringify(database, null, 2), 'utf-8');
```

### Disabilitare Auto-Refresh (Cambiare Intervallo)

In `DatabaseInspector.tsx`, riga ~88:
```typescript
}, 5000); // Modifica a 3000 per 3s, 10000 per 10s, etc.
```

---

**Fine documento** - Ultimo aggiornamento: 2025-10-11 18:45
