# 🧪 COME TESTARE IL NUOVO DATABASE CENTRALIZZATO

> **Data**: 2025-01-06  
> **Status**: ✅ Sistema Completo e Pronto per il Test

---

## 🚀 QUICK START - 3 PASSI

### 1️⃣ Avvia l'Applicazione

```bash
cd financial-dashboard
npm run dev
```

### 2️⃣ Apri il Browser

Vai su: **http://localhost:3000**

### 3️⃣ Naviga al Test Database

1. Clicca sul tab **"🌍 Mercato"**
2. Clicca sul tab **"🧪 Test Database"**

**FATTO!** Dovresti vedere la pagina con tutti i dati del mercato ecografie Italia.

---

## 📊 COSA VEDRAI

### Sezione 1: Configurazione

- **Slider Percentuale Extra-SSN**: Prova a modificarlo (0-100%)
- I calcoli si aggiornano **in tempo reale**

### Sezione 2: KPI Cards Italia

✅ **Volume SSN**: Totale esami SSN annuali  
✅ **Volume Extra-SSN**: Esami privati (% del SSN)  
✅ **Totale Mercato**: Somma SSN + Extra-SSN  
✅ **Mercato Aggredibile**: Solo prestazioni target Eco3D (in verde)

### Sezione 3: Mercati Regionali

- 🇺🇸 **USA**: Italia × 9 (volume)
- 🇪🇺 **Europa**: Italia × 7.5
- 🇨🇳 **Cina**: Italia × 11
- 🌍 **Globale**: Italia × 55

### Sezione 4: Tabella Prestazioni

- **19 prestazioni** ecografiche italiane
- **Colonne**: Codice, Nome, U/B/D/P (opzionale), SSN, Extra-SSN, Totale, % Mercato
- **Prestazioni Target** (in verde): 8 prestazioni aggredibili da Eco3D
- **Toggle "Mostra Dettagli"**: Mostra/nasconde colonne U/B/D/P

### Sezione 5: Vantaggi Nuovo Approccio

Riquadro informativo con vantaggi del sistema centralizzato

---

## 🔍 COSA CONTROLLARE

### ✅ Test 1: Dati Popolati

**Verifica che NON ci siano zeri:**

- Volume SSN > 0
- Volume Extra-SSN > 0
- Tutti i mercati regionali > 0
- Tutte le prestazioni hanno valori

**Valori Attesi (con 30% Extra-SSN):**
- Volume SSN Italia: ~23M esami
- Volume Extra-SSN: ~7M esami
- Totale Italia: ~30M esami
- Mercato Aggredibile: ~40% del totale

### ✅ Test 2: Calcoli Dinamici

**Muovi lo slider Percentuale Extra-SSN:**

1. Imposta a **0%**:
   - Extra-SSN dovrebbe essere 0
   - Totale = Solo SSN

2. Imposta a **50%**:
   - Extra-SSN dovrebbe essere metà del SSN
   - Totale = SSN × 1.5

3. Imposta a **100%**:
   - Extra-SSN = SSN
   - Totale = SSN × 2

**I calcoli devono aggiornarsi IMMEDIATAMENTE** (niente loading)

### ✅ Test 3: Moltiplicatori Regionali

**Verifica relazioni:**

- USA ≈ Italia × 9
- Europa ≈ Italia × 7.5
- Cina ≈ Italia × 11
- Globale ≈ Italia × 55

Modifica lo slider → tutti i mercati si aggiornano proporzionalmente

### ✅ Test 4: Prestazioni Aggredibili

**Conta le righe verdi nella tabella:**
- Dovrebbero essere **8 prestazioni** con badge "Target"

**Verifica che la card "Mercato Aggredibile" corrisponda:**
- Numero prestazioni = 8
- Volume = somma solo righe verdi

### ✅ Test 5: Toggle Dettagli

**Clicca "Mostra Dettagli":**
- Appaiono colonne U, B, D, P
- Verifica che U + B + D + P = SSN

**Clicca "Nascondi Dettagli":**
- Colonne U, B, D, P scompaiono
- SSN rimane visibile

---

## 📂 FILE DA CONTROLLARE

### 1. Database JSON

```bash
# Apri il file
code src/data/database.json
```

**Verifica:**
- ✅ 19 prestazioni presenti
- ✅ Ogni prestazione ha U, B, D, P
- ✅ 8 prestazioni con `"aggredibile": true`
- ✅ Moltiplicatori regionali configurati
- ✅ JSON valido (nessun errore di sintassi)

### 2. Servizio Database

```bash
# Apri il file
code src/lib/database-service.ts
```

**Console Log:**
```javascript
// Apri Console DevTools (F12)
// Dovresti vedere al caricamento:
✅ Database caricato: {
  version: "1.0.0",
  lastUpdate: "2025-01-06",
  prestazioni: 19
}
```

### 3. Componente Test

```bash
# Apri il file
code src/components/TestDatabaseCentralizzato.tsx
```

**Nessun errore TypeScript** - tutto type-safe

---

## 🐛 TROUBLESHOOTING

### Problema: "Pagina bianca" o errori

**Soluzione:**
```bash
# Riavvia il server
# Ctrl+C per fermare
npm run dev
```

### Problema: "Tab Test Database non appare"

**Verifica:**
1. Sei nel tab **"🌍 Mercato"**?
2. Il tab **"🧪 Test Database"** dovrebbe essere il primo

**Se non c'è:**
```bash
# Verifica che MercatoWrapper.tsx sia aggiornato
code src/components/MercatoWrapper.tsx
# Riga 18 dovrebbe avere: <TabsTrigger value="test-db">🧪 Test Database</TabsTrigger>
```

### Problema: "Dati tutti a zero"

**Verifica Console:**
```javascript
// F12 → Console
// Cerca messaggi di errore
```

**Verifica import database:**
```typescript
// In database-service.ts
import database from '@/data/database.json';
// Questo dovrebbe funzionare senza errori
```

### Problema: "Errori TypeScript"

**Controlla:**
1. `database.json` ha JSON valido (virgole, parentesi)
2. Campo "valueRange" scritto correttamente (non "valoreRange")
3. Tutti i file salvati

---

## 💡 TEST AVANZATI

### Test 1: Modificare Dati Manualmente

```bash
# 1. Apri database.json
code src/data/database.json

# 2. Trova "Addome Completo"
# 3. Cambia U da 155207 a 200000

# 4. Salva file

# 5. Ricarica browser (Cmd+R / Ctrl+R)

# 6. Verifica che i nuovi valori appaiano
```

### Test 2: Usare il Servizio in Console

```javascript
// Apri Console DevTools (F12)
// Esegui:

import('@/lib/database-service').then(module => {
  const db = module.default;
  
  // Test 1: Ottieni dati Italia
  console.log('Italia:', db.getItaliaBase());
  
  // Test 2: Calcola totali
  console.log('Totali:', db.calcolaTotaliItalia());
  
  // Test 3: Solo aggredibili
  console.log('Aggredibili:', db.calcolaTotaliAggredibili());
  
  // Test 4: Statistiche complete
  console.log('Stats:', db.getStatistiche());
});
```

### Test 3: Creare Componente Custom

```typescript
// Crea file: src/components/MioTest.tsx
'use client';

import db from '@/lib/database-service';
import { useMemo } from 'react';

export function MioTest() {
  const totali = useMemo(() => db.calcolaTotaliItalia(), []);
  
  return (
    <div className="p-6">
      <h1>Mio Test</h1>
      <p>Volume SSN: {db.formatNumber(totali.volumeSSN)}</p>
      <p>Volume Extra: {db.formatNumber(totali.volumeExtraSSN)}</p>
      <p>Totale: {db.formatNumber(totali.volumeTotale)}</p>
    </div>
  );
}
```

**Niente loading states, niente useEffect - solo dati!**

---

## 📈 CONFRONTO APPROCCI

### ❌ Vecchio Approccio (PlayerPrefs + Context)

```typescript
// COMPLESSO
const [loading, setLoading] = useState(true);
const { stato, azioni } = useMercato();

useEffect(() => {
  // Caricamento asincrono
  loadData().then(data => {
    azioni.caricaDatiExcel(data);
    setLoading(false);
  });
}, []);

if (loading) return <Spinner />;
```

**Problemi:**
- Loading states ovunque
- Dati sparsi in Context multipli
- Difficile debuggare
- Non accessibile manualmente

### ✅ Nuovo Approccio (Database Centralizzato)

```typescript
// SEMPLICE
import db from '@/lib/database-service';

const totali = useMemo(() => db.calcolaTotaliItalia(), []);

// FINITO! Niente loading, niente useEffect
```

**Vantaggi:**
- ✅ Sincrono - niente loading
- ✅ Un unico file JSON
- ✅ Facile debuggare
- ✅ Modificabile manualmente
- ✅ Type-safe al 100%

---

## 🎯 PROSSIMI PASSI (se il test funziona)

### 1. Aggiungere Dati Ecografi

Espandere `database.json`:

```json
{
  "mercatoEcografi": {
    "parcoDispositivi": {
      "italia": {
        "2024": 66842,
        "2025": 68500,
        "2030": 75000
      }
    },
    "tipologie": [
      {
        "nome": "Entry-Level",
        "prezzoMedio": 15000,
        "quota": 30
      }
    ]
  }
}
```

### 2. Aggiungere Materiali

```json
{
  "materialiConsumabili": {
    "categorie": [
      {
        "nome": "Gel ecografico",
        "consumoAnnuo": 1000,
        "prezzoUnitario": 5.5
      }
    ]
  }
}
```

### 3. Sostituire MercatoRiepilogo

Usare il nuovo approccio invece del vecchio Context:

```typescript
// In MercatoRiepilogo.tsx
import db from '@/lib/database-service';
// ... usare db invece di useMercato()
```

---

## ✅ CHECKLIST TEST COMPLETO

- [ ] App si avvia senza errori
- [ ] Tab "Test Database" appare
- [ ] Dati Italia popolati (niente zeri)
- [ ] Mercati regionali popolati
- [ ] Slider funziona in tempo reale
- [ ] Tabella mostra 19 prestazioni
- [ ] 8 prestazioni in verde (aggredibili)
- [ ] Toggle dettagli funziona
- [ ] Console non mostra errori
- [ ] Modifiche manuali a database.json funzionano
- [ ] Ricarica pagina mantiene dati

---

## 🎉 SUCCESS!

**Se tutti i test passano:**

✅ Il nuovo sistema è **OPERATIVO**  
✅ Puoi **modificare manualmente** i dati  
✅ Puoi **aggiungere** nuove sezioni facilmente  
✅ Pronto per **produzione**

---

## 📞 SUPPORTO

Se qualcosa non funziona:

1. **Console Log**: F12 → Console → Cerca errori
2. **TypeScript**: Verifica che non ci siano errori TS
3. **JSON Validation**: Verifica che database.json sia valido
4. **Riavvia**: `npm run dev` di nuovo

---

**Creato**: 2025-01-06  
**Versione**: 1.0.0  
**Status**: ✅ Ready for Testing
