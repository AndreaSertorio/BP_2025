# 🚀 GUIDA RAPIDA - SISTEMA DATABASE UNIFICATO

**Per:** Sviluppatori e Utenti Eco 3D  
**Data:** 2025-01-06  
**Versione:** 2.0.0

---

## 📌 COSA È CAMBIATO

### Prima: Sistema Frammentato ❌
- Dati sparsi in più posti
- Modifiche non persistenti
- Nessuna sincronizzazione tra pagine
- Difficile capire quale sia la fonte corretta

### Ora: Sistema Unificato ✅
- **UN SOLO database.json** = fonte unica di verità
- **Modifiche automaticamente salvate** in localStorage
- **Sincronizzazione in tempo reale** tra tutte le pagine
- **Persistenza** tra sessioni (anche dopo refresh)

---

## 🎯 COME USARE IL SISTEMA

### 1️⃣ Modificare Prestazioni Aggredibili

**Dove:** Tab "Mercato Ecografie"

**Come:**
1. Trova la prestazione nella tabella
2. Clicca la checkbox nella colonna "Target" (✅/☐)
3. ✅ = Aggredibile (mercato target per Eco3D)
4. ☐ = Non aggredibile

**Effetto:**
- Il database si aggiorna **immediatamente**
- Il numero nel tab "Riepilogo" cambia **in tempo reale**
- La modifica viene **salvata** in localStorage
- Dopo refresh, la modifica è **ancora presente**

---

### 2️⃣ Modificare % Extra-SSN

**Dove:** Tab "Mercato Ecografie"

**Come:**
1. Trova la colonna "% Extra-SSN" nella tabella
2. Modifica il numero (0-100)
3. Premi Enter o clicca fuori dall'input

**Effetto:**
- Il calcolo Extra-SSN si aggiorna immediatamente
- Il totale viene ricalcolato
- Il database salva la nuova percentuale
- Il tab "Riepilogo" mostra la nuova % nei tooltip

---

### 3️⃣ Verificare le Modifiche

**Dove:** Tab "Riepilogo"

**Come:**
1. Vai su "📋 Riepilogo"
2. Guarda la card "🎯 Mercato Aggredibile"
3. Il numero mostrato riflette le tue modifiche
4. Passa il mouse sull'icona ℹ️ per vedere dettagli
5. Scorri in basso per vedere tutte le prestazioni aggredibili

**Cosa Vedere:**
- Numero di prestazioni aggredibili aggiornato
- Volume totale mercato aggredibile
- Lista completa con % Extra-SSN di ognuna
- Messaggi di conferma sincronizzazione

---

### 4️⃣ Export/Import Database

**Export (Salva):**
1. Clicca "Export" nell'indicatore in basso a destra
2. Scarica il file JSON con tutte le modifiche
3. Conserva come backup

**Import (Carica):**
1. Usa il metodo `importDatabase()` dal Context
2. Oppure: apri Console → `localStorage.setItem('eco3d_database', jsonString)`

---

### 5️⃣ Reset ai Valori Default

**Quando:**
- Vuoi annullare tutte le modifiche
- Hai fatto errori e vuoi ricominciare
- Vuoi tornare ai dati originali dell'Excel

**Come:**
1. Clicca "Reset" nell'indicatore
2. Conferma l'azione
3. La pagina si ricarica con dati originali

**Alternativa (Console):**
```javascript
localStorage.removeItem('eco3d_database');
location.reload();
```

---

## 🔍 VERIFICA SINCRONIZZAZIONE

### Test Completo in 5 Step

**Step 1: Modifica nel Tab Ecografie**
```
✅ Vai su "Mercato Ecografie"
✅ Toggle aggredibile su "Addome Superiore"
✅ Cambia % Extra-SSN da 50% a 60%
```

**Step 2: Verifica nel Tab Riepilogo**
```
✅ Vai su "Riepilogo"
✅ Controlla che il numero "Mercato Aggredibile" sia cambiato
✅ Apri tooltip e verifica "Addome Superiore: 60%"
```

**Step 3: Refresh Pagina**
```
✅ Premi F5 o Ctrl+R
✅ Vai su "Riepilogo"
✅ Verifica che le modifiche siano ancora presenti
```

**Step 4: Verifica localStorage**
```
✅ Apri DevTools (F12)
✅ Tab "Application" → "Local Storage"
✅ Trova chiave "eco3d_database"
✅ Verifica che contiene le tue modifiche
```

**Step 5: Export e Controlla**
```
✅ Clicca "Export"
✅ Apri il JSON scaricato
✅ Cerca "88.74.1" (Addome Superiore)
✅ Verifica "percentualeExtraSSN": 60
```

---

## 🛠️ PER SVILUPPATORI

### Usare il DatabaseProvider

```typescript
import { useDatabase } from '@/contexts/DatabaseProvider';

function MyComponent() {
  const {
    data,                    // Database completo
    loading,                 // Boolean
    lastUpdate,              // Date | null
    updatePrestazione,       // (codice, updates) => void
    toggleAggredibile,       // (codice) => void
    setPercentualeExtraSSN,  // (codice, percentuale) => void
  } = useDatabase();

  // Esempio: Toggle aggredibile
  const handleToggle = (codice: string) => {
    toggleAggredibile(codice);
  };

  // Esempio: Cambia percentuale
  const handlePercentuale = (codice: string, perc: number) => {
    setPercentualeExtraSSN(codice, perc);
  };

  return <div>{data.mercatoEcografie.italia.prestazioni.length} prestazioni</div>;
}
```

### Leggere Dati con DatabaseService

```typescript
import { useDatabase } from '@/contexts/DatabaseProvider';
import { DatabaseService } from '@/lib/database-service';

function MyComponent() {
  const { data } = useDatabase();
  const db = useMemo(() => new DatabaseService(data), [data]);
  
  const totali = useMemo(() => db.calcolaTotaliItalia(), [db]);
  const aggredibili = useMemo(() => db.getPrestazioniAggredibili(), [db]);
  
  return <div>Totale: {totali.volumeTotale}</div>;
}
```

### Aggiungere Nuovi Campi Modificabili

1. Aggiungi il campo in `PrestazioneEcografia` interface
2. Aggiungi metodo in `DatabaseProvider`
3. Implementa UI per modificarlo
4. Chiama il metodo dal componente

---

## 📊 STRUTTURA FILE

```
src/
├── data/
│   └── database.json              ← FONTE UNICA DI VERITÀ
│
├── contexts/
│   └── DatabaseProvider.tsx       ← Context globale
│
├── lib/
│   └── database-service.ts        ← Logica calcoli
│
├── components/
│   ├── MercatoEcografie.tsx      ← WRITE (modifica dati)
│   ├── MercatoRiepilogo.tsx      ← READ (visualizza dati)
│   └── DatabaseSyncIndicator.tsx ← Status indicator
│
└── app/
    └── layout.tsx                 ← Wrapper DatabaseProvider
```

---

## 🐛 TROUBLESHOOTING

### Problema: Modifiche non si vedono nel Riepilogo

**Causa:** Cache o errore di sincronizzazione

**Soluzione:**
1. Apri Console (F12)
2. Verifica errori in rosso
3. Controlla che `localStorage.getItem('eco3d_database')` esista
4. Prova hard refresh: Ctrl+Shift+R

---

### Problema: Dopo refresh i dati tornano default

**Causa:** localStorage non salva o viene cancellato

**Soluzione:**
1. Verifica che il browser supporti localStorage
2. Controlla che non sia in modalità incognito
3. Verifica spazio disponibile (raramente un problema)
4. Controlla console per errori `localStorage`

---

### Problema: Numeri diversi tra Ecografie e Riepilogo

**Causa:** Probabile bug di calcolo o dati non sincronizzati

**Soluzione:**
1. Fai Reset completo
2. Ricarica dati da Excel (se disponibile)
3. Verifica console per errori
4. Controlla che `data.version` sia uguale in entrambi i componenti

---

## 📝 CHECKLIST PRE-PRODUZIONE

Prima di mettere in produzione, verifica:

- [ ] Tutti i test di sincronizzazione passano
- [ ] Export/Import funziona correttamente
- [ ] Reset ripristina valori default
- [ ] localStorage persiste tra sessioni
- [ ] Nessun errore TypeScript
- [ ] Nessun errore in Console
- [ ] Tooltip mostrano dati corretti
- [ ] Numeri tra Ecografie e Riepilogo coincidono
- [ ] Modifiche si riflettono in tempo reale
- [ ] Performance accettabile (no lag)

---

## 🎓 CONCETTI CHIAVE

### Single Source of Truth
- `database.json` è l'UNICA fonte di verità
- Tutti i componenti leggono da lì
- Tutte le modifiche scrivono lì

### Unidirectional Data Flow
```
database.json → DatabaseProvider → Components → UI
     ↑                                          |
     └──────────── User Actions ────────────────┘
```

### Persistence Strategy
```
database.json (default)
    ↓
localStorage (modifiche utente)
    ↓
Merge al caricamento
    ↓
DatabaseProvider (stato runtime)
```

---

## 🆘 SUPPORTO

### Domande Comuni

**Q: Posso modificare database.json manualmente?**  
A: Sì, ma le modifiche in localStorage hanno priorità. Fai Reset per ricaricare.

**Q: Quanto spazio occupa in localStorage?**  
A: ~10-50KB, insignificante rispetto al limite di 5-10MB.

**Q: Le modifiche sono condivise tra utenti?**  
A: No, ogni browser ha il suo localStorage. Serve backend per multi-user.

**Q: Posso tornare indietro dopo una modifica?**  
A: Attualmente no (no undo). Usa Export frequente come backup.

**Q: Cosa succede se localStorage è pieno?**  
A: Errore in console, le modifiche non si salvano. Caso rarissimo.

---

## 📚 RIFERIMENTI

- **Architettura:** `ARCHITETTURA_DATABASE_CENTRALIZZATO.md`
- **Completamento:** `SISTEMA_UNIFICATO_COMPLETATO.md`
- **Codice:** `src/contexts/DatabaseProvider.tsx`
- **Types:** `src/lib/database-service.ts`

---

**Buon lavoro! 🚀**
