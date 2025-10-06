# 🔍 DEBUG: Dati a Zero - Istruzioni

> **Problema**: La pagina Riepilogo mostra tutti i valori a zero  
> **Data**: 2025-01-05

---

## 📍 DOVE SONO SALVATE LE PLAYERPREFS

Le PlayerPrefs sono nel **localStorage del browser**:

### Come Vedere

1. **F12** → Tab "Application"
2. Sidebar: **Local Storage** → `http://localhost:3000`
3. Cerca le chiavi:
   - `eco3d_mercato_stato` (PlayerPrefs Mercato Ecografi)
   - `eco3d_mercato_scenari` (Scenari salvati)
   - `eco3d_ecografie_stato` (PlayerPrefs Ecografie)
   - `eco3d_ecografie_scenari` (Scenari Ecografie)

---

## ✅ PASSO 1: Pulire localStorage e Ricaricare

### Opzione A: Console Command (VELOCE)

```javascript
// Apri Console (F12) ed esegui:
localStorage.clear()
location.reload()
```

### Opzione B: Manualmente

1. F12 → Application → Local Storage
2. Clicca destro su `http://localhost:3000`
3. "Clear" → Ricarica pagina

---

## ✅ PASSO 2: Verificare Console Logs

Dopo aver ricaricato, apri **Console** e cerca:

### Log Atteso (SUCCESS):
```
🔄 Caricamento dati Excel nel Context...
📁 Cercando files in /assets/
✅ Dati caricati con successo nel Context!
📊 Statistiche:
  - Tipologie: 3
  - Proiezioni Italia: 11 anni
  - Quote Tipologie: 7 anni
  - Parco IT: 11 anni
  - Numero Ecografi: 5 regioni
  - Valore Mercato: 5 regioni

🔄 Caricamento dati Ecografie da Excel...
✅ Dati Ecografie caricati con successo!
📊 Statistiche:
  - Prestazioni: 15
```

### Log Problema (ERROR):
```
❌ Errore caricamento dati: HTTP 404
```

Se vedi 404 → I file Excel non sono in `/public/assets/`

---

## ✅ PASSO 3: Controllare Debug Panel

Ho aggiunto un **pannello giallo di DEBUG** in fondo al Riepilogo.

Verifica:

### Se i dati sono caricati:
```json
"Dati Base": {
  "numeroEcografi": "5 regioni",
  "valoreMercato": "5 regioni",
  "primiNumeroEcografi": [
    { "mercato": "Italia", "unita2025": 8500, ... },
    { "mercato": "Europa", ... }
  ]
}
```

### Se i dati NON sono caricati:
```json
"Dati Base": {
  "numeroEcografi": "0 regioni",   ← PROBLEMA!
  "valoreMercato": "0 regioni",    ← PROBLEMA!
  "primiNumeroEcografi": []
}
```

---

## 🔧 TROUBLESHOOTING

### Problema 1: Console mostra "Dati già caricati" ma sono a zero

**Causa**: localStorage ha uno stato vecchio vuoto

**Fix**:
```javascript
localStorage.clear()
location.reload()
```

---

### Problema 2: Console mostra "HTTP 404"

**Causa**: File Excel non trovati in `/public/assets/`

**Fix**: Verifica che esistano:
```
/public/assets/ECO_Proiezioni_Ecografi_2025_2030.xlsx
/public/assets/ECO_DatiMercato.xlsx
/public/assets/ECO_Riepilogo.xlsx
```

---

### Problema 3: Console non mostra nessun log

**Causa**: DataLoader non sta eseguendo

**Fix**: Verifica che `layout.tsx` abbia:
```tsx
<MercatoProvider>
  <MercatoDataLoader />  ← Deve esserci
  <EcografieProvider>
    <EcografieDataLoader />  ← Deve esserci
    {children}
  </EcografieProvider>
</MercatoProvider>
```

---

### Problema 4: Debug panel mostra dati caricati MA Riepilogo è a zero

**Causa**: Problema con i calcoli derivati

**Verifica nel Debug Panel**:
```json
"Calcolati": {
  "mercatoGlobaleTarget": 0,     ← Dovrebbe essere > 0
  "mercatoItaliaTarget": 0,      ← Dovrebbe essere ~340
  "unitaTargetEco3D": 0          ← Dovrebbe essere > 0
}
```

Se `Calcolati` sono a zero ma `Dati Base` sono popolati:
- Verifica che `annoTarget` sia valido (2025-2030)
- Verifica che `regioniVisibili` abbia almeno una regione
- Verifica che `marketShareTarget` sia > 0

---

## 🎯 SOLUZIONE RAPIDA STEP-BY-STEP

```bash
# 1. Pulisci localStorage
localStorage.clear()

# 2. Ricarica
location.reload()

# 3. Aspetta 2 secondi

# 4. Verifica Console
# Dovresti vedere: "✅ Dati caricati con successo!"

# 5. Verifica Debug Panel (pannello giallo)
# "numeroEcografi": "5 regioni"
# "valoreMercato": "5 regioni"

# 6. Verifica KPI Cards
# "Anno Target": 2030 (non 0)
# "Mercato Italia": 343.7 M$ (non 0 M$)
# "Target Eco 3D": 889 unità (non 0 unità)
```

---

## 📊 VALORI ATTESI (Config Default)

```yaml
Configurazione:
  annoTarget: 2030
  marketShareTarget: 1.0
  regioniVisibili: ['Italia', 'Europa', 'Stati Uniti', 'Cina']
  scenarioParcoIT: 'centrale'

Dati Base:
  numeroEcografi: 5 regioni
  valoreMercato: 5 regioni
  parcoIT: 11 anni

Calcolati:
  mercatoGlobaleTarget: ~10,980 M$
  mercatoItaliaTarget: ~343.7 M$
  unitaTargetEco3D: ~889 unità
  parcoDispositiviTarget: 66,842
```

---

## 🚨 SE NULLA FUNZIONA

1. **Verifica che il server sia avviato**:
   ```bash
   npm run dev
   ```

2. **Verifica che i file Excel esistano**:
   ```bash
   ls -la public/assets/*.xlsx
   ```

3. **Riavvia il server**:
   ```bash
   # Ctrl+C
   npm run dev
   ```

4. **Hard refresh**:
   ```
   Cmd + Shift + R (Mac)
   Ctrl + Shift + R (Windows)
   ```

---

## 📝 DOPO CHE FUNZIONA

Una volta risolto, puoi:

1. **Rimuovere il debug panel**:
   - Apri `MercatoRiepilogo.tsx`
   - Rimuovi `<DebugMercato />`
   - Rimuovi `import { DebugMercato } from './DebugMercato';`

2. **Oppure lasciarlo** per debug futuro

---

## 🎉 SUCCESS INDICATORS

✅ Console mostra log caricamento  
✅ Debug panel mostra "5 regioni"  
✅ KPI Cards mostrano valori > 0  
✅ Modifiche parametri aggiornano UI  
✅ Salva scenario funziona  
✅ Ricarica pagina mantiene dati  

**Se tutti questi ✅ sono verdi, il sistema funziona!**
