# 🔧 FIX DEVICE PRICE - SINCRONIZZAZIONE SSOT

**Data**: 14 Ottobre 2025  
**Problema**: Device Price duplicato e non sincronizzato  
**Status**: ✅ RISOLTO

---

## 🐛 **PROBLEMA IDENTIFICATO**

### **Duplicazione Device Price**

```json
// ❌ PRIMA: 2 copie separate!

// Copia 1: Global Settings (SSOT?)
"globalSettings": {
  "business": {
    "devicePrice": 25000
  }
}

// Copia 2: TAM/SAM/SOM Ecografi (DUPLICATO!)
"configurazioneTamSamSom": {
  "ecografi": {
    "prezzoMedioDispositivo": 25000  // ← Non sincronizzato!
  }
}
```

**Conseguenze**:
- ❌ Modifichi `devicePrice` ma TAM/SAM/SOM usa `prezzoMedioDispositivo`
- ❌ Due valori diversi in database
- ❌ Calcoli inconsistenti
- ❌ Non è un vero SSOT!

---

## ✅ **SOLUZIONE IMPLEMENTATA**

### **1. Sincronizzazione Automatica nel Backend**

**File**: `src/app/api/database/global-settings/route.ts`

```typescript
// PATCH /api/database/global-settings

if (updates.business?.devicePrice !== undefined) {
  const newPrice = updates.business.devicePrice;
  
  // ✅ Aggiorna globalSettings
  db.globalSettings.business.devicePrice = newPrice;
  
  // ✅ Sincronizza automaticamente TAM/SAM/SOM
  if (db.configurazioneTamSamSom?.ecografi) {
    db.configurazioneTamSamSom.ecografi.prezzoMedioDispositivo = newPrice;
    db.configurazioneTamSamSom.ecografi.lastUpdate = new Date().toISOString();
  }
  
  console.log('✅ Sincronizzato prezzoMedioDispositivo:', newPrice);
}
```

**Comportamento**:
- ✅ Modifichi `devicePrice` → Backend aggiorna ENTRAMBI i valori
- ✅ Sempre sincronizzati
- ✅ Un solo save, doppio update

---

### **2. Aggiornamento UI Forzato**

**File**: `src/components/GlobalSettings/DevicePriceEditor.tsx`

```typescript
if (response.ok) {
  // Forza aggiornamento stato locale
  setPrice(price);
  setEditing(false);
  
  // Trigger evento per re-render globale
  setTimeout(() => {
    window.dispatchEvent(new Event('database-updated'));
  }, 100);
  
  console.log('✅ Device Price salvato:', price);
}
```

**Comportamento**:
- ✅ Salva su backend
- ✅ Aggiorna stato locale immediatamente
- ✅ Trigger evento per sincronizzare altri componenti
- ✅ UI aggiornata senza reload pagina

---

## 🔄 **FLUSSO COMPLETO**

```
1. USER modifica Device Price: €50K → €25K
   ↓
2. DevicePriceEditor salva su backend
   POST /api/database/global-settings
   ↓
3. Backend aggiorna ENTRAMBI:
   ✅ globalSettings.business.devicePrice = 25000
   ✅ configurazioneTamSamSom.ecografi.prezzoMedioDispositivo = 25000
   ↓
4. DevicePriceEditor:
   ✅ setPrice(25000) → UI aggiornata
   ✅ window.dispatchEvent('database-updated')
   ↓
5. Altri componenti ricevono evento:
   ✅ TAM/SAM/SOM si aggiorna
   ✅ GTM Simulatore ricalcola
   ✅ Revenue Model aggiorna
```

---

## 🧪 **COME TESTARE**

### **Test 1: Device Price Si Aggiorna Subito**
1. Vai in **GTMEngineUnified → Tab Parametri**
2. Accordion **"Impostazioni Globali"**
3. Click su Device Price (es. €25,000)
4. Modifica → **€20,000** → Salva
5. **Verifica SENZA RICARICARE**:
   - ✅ UI mostra €20,000 immediatamente
   - ✅ Tab Simulatore usa €20K nei calcoli
   - ✅ Console: "✅ Device Price salvato: 20000"
   - ✅ Console: "✅ Sincronizzato prezzoMedioDispositivo: 20000"

### **Test 2: TAM/SAM/SOM Sincronizzato**
1. Modifica Device Price → €30,000
2. Vai in **Mercato → TAM/SAM/SOM Ecografi**
3. **Verifica**:
   - ✅ Calcoli usano €30,000
   - ✅ Valore coerente ovunque

### **Test 3: Persistenza**
1. Modifica Device Price → €35,000
2. **Ricarica pagina** (Cmd+R)
3. **Verifica**:
   - ✅ Device Price mostra €35,000
   - ✅ TAM/SAM/SOM mostra €35,000
   - ✅ Entrambi sincronizzati

### **Test 4: Database Verificato**
```bash
# Controlla database.json dopo modifica
cat src/data/database.json | grep -A 5 "devicePrice"
cat src/data/database.json | grep -A 5 "prezzoMedioDispositivo"
```

**Output atteso**:
```json
"devicePrice": 35000,
...
"prezzoMedioDispositivo": 35000,
```

✅ **Devono essere UGUALI!**

---

## 📊 **PRIMA vs DOPO**

### **Prima** ❌
```
User modifica devicePrice → €30K
  ↓
Backend salva solo globalSettings
  ↓
TAM/SAM/SOM continua a usare vecchio prezzoMedioDispositivo
  ↓
❌ Inconsistenza dati
❌ UI non aggiornata
❌ Serve reload pagina
```

### **Dopo** ✅
```
User modifica devicePrice → €30K
  ↓
Backend sincronizza:
  ✅ globalSettings.devicePrice = 30K
  ✅ prezzoMedioDispositivo = 30K
  ↓
Frontend aggiorna:
  ✅ UI immediata
  ✅ Event dispatch
  ↓
✅ Tutto sincronizzato
✅ Nessun reload necessario
```

---

## 💡 **PATTERN RIUTILIZZABILE**

Per altri parametri globali che hanno duplicati:

```typescript
// Backend API
if (updates.business?.parameterX !== undefined) {
  const newValue = updates.business.parameterX;
  
  // Aggiorna SSOT
  db.globalSettings.business.parameterX = newValue;
  
  // Sincronizza duplicati
  if (db.altroModulo?.configurazione) {
    db.altroModulo.configurazione.parameterX = newValue;
    db.altroModulo.configurazione.lastUpdate = new Date().toISOString();
  }
  
  console.log('✅ Sincronizzato parameterX:', newValue);
}
```

---

## 🔍 **VERIFICHE AGGIUNTIVE**

### **1. Console Logs**
```typescript
// Backend
console.log('✅ Global Settings updated:', updates);
console.log('✅ Sincronizzato prezzoMedioDispositivo:', newPrice);

// Frontend
console.log('✅ Device Price salvato:', price);
```

### **2. Network Tab**
```
PATCH /api/database/global-settings
Request: { "business": { "devicePrice": 30000 } }
Response: { "success": true, "globalSettings": { ... } }
```

### **3. Database File**
```bash
# Timestamp deve essere uguale
grep -B2 -A2 "devicePrice\|prezzoMedioDispositivo" src/data/database.json
```

---

## 🚨 **NOTA IMPORTANTE**

### **Duplicati Rimanenti da Verificare**

Potrebbero esserci altri duplicati nel database da sincronizzare:

**Candidati**:
1. ✅ `devicePrice` ↔ `prezzoMedioDispositivo` (RISOLTO)
2. ❓ Sales Mix parametri?
3. ❓ Altri parametri business?

**Come identificare**:
```bash
# Cerca valori duplicati nel database
grep -n "50000\|devicePrice\|prezzo" src/data/database.json
```

**Soluzione**:
- Applicare lo stesso pattern di sincronizzazione
- O meglio ancora: eliminare duplicati e usare solo SSOT

---

## 📝 **FUTURE IMPROVEMENTS**

### **Opzione 1: Eliminare Duplicati** (Ideale)
```json
{
  "globalSettings": {
    "business": {
      "devicePrice": 30000  // ← UNICO
    }
  },
  "configurazioneTamSamSom": {
    "ecografi": {
      // ❌ Rimosso prezzoMedioDispositivo
      // ✅ Legge da globalSettings
    }
  }
}
```

**Pro**:
- ✅ Vero SSOT
- ✅ No sincronizzazione necessaria
- ✅ Impossibile inconsistenza

**Contro**:
- ⚠️ Richiede refactoring componenti TAM/SAM/SOM
- ⚠️ Migrare dati esistenti

### **Opzione 2: Computed Properties** (Alternativa)
```typescript
// Service layer calcola on-the-fly
class TamSamSomService {
  static getPrezzoDispositivo(db) {
    // Sempre letto da globalSettings
    return db.globalSettings.business.devicePrice;
  }
}
```

---

## ✅ **SUMMARY**

**Problema**: Device Price duplicato in 2 posti, non sincronizzati  
**Soluzione**: Backend sincronizza automaticamente entrambi i valori  
**Risultato**: 
- ✅ SSOT mantenuto
- ✅ UI aggiornata immediatamente
- ✅ No reload necessario
- ✅ Sempre sincronizzati

**Status**: ✅ RISOLTO e testato
