# 🗄️ ARCHITETTURA DATABASE CENTRALIZZATO - ECO 3D

**Data Creazione:** 2025-01-06  
**Versione:** 2.0.0  
**Stato:** ATTIVO - Sistema Unificato

---

## 📋 FILOSOFIA

**SINGOLA FONTE DI VERITÀ:** Tutta l'applicazione si basa sul file `database.json` come unico punto di archiviazione e lettura dati.

### Principi Fondamentali

1. **Un Solo Database** → `src/data/database.json`
2. **Lettura Centralizzata** → Tutte le pagine leggono dal database
3. **Scrittura Sincronizzata** → Tutte le modifiche scrivono nel database
4. **Persistenza Automatica** → Le modifiche si salvano in localStorage
5. **Sincronizzazione Globale** → Ogni modifica si riflette ovunque

---

## 🏗️ STRUTTURA

```
src/
├── data/
│   └── database.json          ← FONTE UNICA DI VERITÀ
├── contexts/
│   └── DatabaseProvider.tsx   ← Context globale che gestisce database.json
├── lib/
│   └── database-service.ts    ← Utility per calcoli (senza stato)
└── components/
    ├── MercatoEcografie.tsx   ← LEGGE e SCRIVE nel database
    └── MercatoRiepilogo.tsx   ← LEGGE dal database
```

---

## 🔄 FLUSSO DATI

### Lettura (Read)
```
Component → useDatabase() → Context → database.json + localStorage
```

### Scrittura (Write)
```
Component → updateDatabase() → Context → localStorage → Re-render globale
```

### Persistenza
```
Modifiche utente → localStorage.setItem('eco3d_database')
Ricarica app → localStorage.getItem('eco3d_database') || database.json
```

---

## 📦 DATI DINAMICI

### Prestazioni Ecografiche

Ogni prestazione ha questi campi **modificabili**:

1. **`aggredibile: boolean`**
   - Modificabile da: Mercato Ecografie (checkbox)
   - Visibile in: Riepilogo, Calcoli
   - Effetto: Determina se la prestazione è target per Eco3D

2. **`percentualeExtraSSN: number`**
   - Modificabile da: Mercato Ecografie (input %)
   - Visibile in: Riepilogo, Calcoli
   - Effetto: Calcola volume Extra-SSN per quella prestazione

3. **`U, B, D, P: number`**
   - Modificabile da: (futuro) Import Excel
   - Visibile in: Tutte le pagine
   - Effetto: Dati master per calcoli

---

## 💾 PERSISTENZA

### localStorage Schema
```typescript
{
  "eco3d_database": {
    version: "1.0.1",
    lastUpdate: "2025-01-06T12:00:00Z",
    mercatoEcografie: {
      italia: {
        prestazioni: [
          {
            codice: "88.76.1",
            nome: "...",
            aggredibile: true,  // ← modificabile
            percentualeExtraSSN: 50,  // ← modificabile
            U: 28437,
            B: 342268,
            D: 774110,
            P: 992536
          }
        ]
      }
    }
  }
}
```

### Strategia di Merge
1. Carica `database.json` (dati di base)
2. Carica `localStorage` (modifiche utente)
3. Merge: localStorage sovrascrive database.json
4. Risultato: database aggiornato con modifiche utente

---

## 🔧 API CONTEXT

### `DatabaseProvider`

```typescript
interface DatabaseContextValue {
  // Stato
  data: Database;
  loading: boolean;
  
  // Metodi di update
  updatePrestazione: (codice: string, updates: Partial<PrestazioneEcografia>) => void;
  toggleAggredibile: (codice: string) => void;
  setPercentualeExtraSSN: (codice: string, percentuale: number) => void;
  
  // Utility
  resetToDefaults: () => void;
  exportDatabase: () => void;
}
```

### Hook: `useDatabase()`

```typescript
const { data, updatePrestazione, toggleAggredibile } = useDatabase();

// Toggle aggredibile
toggleAggredibile('88.76.1');

// Cambia %
setPercentualeExtraSSN('88.73.1', 60);

// Update completo
updatePrestazione('88.74.1', {
  aggredibile: true,
  percentualeExtraSSN: 45,
  note: "Modificato"
});
```

---

## 📊 COMPONENTI INTEGRATI

### 1. MercatoEcografie (WRITE)
- Checkbox "Aggredibile" → `toggleAggredibile(codice)`
- Input "% Extra-SSN" → `setPercentualeExtraSSN(codice, valore)`
- Modifica U/B/D/P → `updatePrestazione(codice, { U, B, D, P })`

### 2. MercatoRiepilogo (READ)
- Legge `data.mercatoEcografie.italia.prestazioni`
- Calcola totali con `database-service.ts`
- Tooltip mostrano valori aggiornati dal database

### 3. Altri Componenti (futuro)
- Dashboard Finanziario
- Analisi Mercato
- Export Report

---

## 🚀 VANTAGGI

1. ✅ **Sincronizzazione Automatica** - Ogni modifica si riflette ovunque
2. ✅ **Persistenza** - Le modifiche sopravvivono al refresh
3. ✅ **Type-Safe** - TypeScript garantisce correttezza
4. ✅ **Debugging Facile** - Un solo posto dove guardare i dati
5. ✅ **Scalabile** - Facile aggiungere nuovi componenti

---

## ⚠️ LIMITAZIONI

1. **Solo Client-Side** - Le modifiche sono locali al browser
2. **No Multi-User** - Ogni utente ha il suo database locale
3. **No Backup Automatico** - L'utente deve fare export manuale

### Soluzioni Future
- API backend per salvare modifiche
- Database SQL/NoSQL per multi-user
- Sync cloud per backup automatico

---

## 📝 CHANGELOG

### v2.0.0 (2025-01-06)
- ✨ Sistema completamente unificato
- ✨ DatabaseProvider con Context
- ✨ Persistenza localStorage
- ✨ Sync bidirezionale tutti i componenti

### v1.0.1 (2025-01-06)
- ✅ Dati reali da Excel
- ✅ percentualeExtraSSN per prestazione
- ✅ 7 prestazioni aggredibili

### v1.0.0 (2025-01-05)
- 🎉 Prima versione database.json

---

## 📚 FILE CORRELATI

- `src/data/database.json` - Database master
- `src/contexts/DatabaseProvider.tsx` - Context provider
- `src/lib/database-service.ts` - Utility calcoli
- `src/types/ecografie.types.ts` - Type definitions

---

**REGOLA D'ORO:** Se un dato deve essere visualizzato o modificato, deve passare per `database.json` + `DatabaseProvider`.
