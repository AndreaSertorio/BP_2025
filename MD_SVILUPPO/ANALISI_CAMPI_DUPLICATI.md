# 🔍 ANALISI CAMPI DUPLICATI - Database Financial Dashboard

**Data:** 2025-10-10  
**Autore:** Analisi automatica  
**Obiettivo:** Identificare tutti i campi duplicati che devono essere sincronizzati

---

## ❌ **PROBLEMA IDENTIFICATO**

Esistono **3 campi separati** che rappresentano lo stesso concetto: **prezzo di vendita dispositivo hardware**

```
1. configurazioneTamSamSom.ecografi.prezzoMedioDispositivo = 44000
2. configurazioneTamSamSom.ecografi.prezzoVenditaProdotto = 25000  ❌ OBSOLETO
3. revenueModel.hardware.asp = (ELIMINATO nel refactoring)
```

### **🚨 INCONSISTENZA ATTUALE**

```json
"ecografi": {
  "prezzoMedioDispositivo": 44000,      // ← Aggiornato dall'utente
  "prezzoVenditaProdotto": 25000        // ← VECCHIO VALORE! ❌
}
```

**Risultato:** La sezione "Potenziale Ricavi" mostra valori errati perché usa `prezzoVenditaProdotto` obsoleto!

---

## 📋 **ELENCO COMPLETO DUPLICATI**

### **1. PREZZO HARDWARE (ASP) - 🔴 CRITICO**

| Campo | Posizione | Usato In | Valore Attuale | Status |
|-------|-----------|----------|----------------|--------|
| `prezzoMedioDispositivo` | `configurazioneTamSamSom.ecografi` | TAM/SAM/SOM (Vista Dispositivi) | €44,000 | ✅ SOURCE OF TRUTH |
| `prezzoVenditaProdotto` | `configurazioneTamSamSom.ecografi` | TAM/SAM/SOM (Potenziale Ricavi) | €25,000 | ❌ OBSOLETO - DA RIMUOVERE |
| `asp` (ELIMINATO) | `revenueModel.hardware` | Revenue Model | N/A | ✅ Già rimosso |

**Componenti Impattati:**
- `TamSamSomDashboard.tsx` (linee 74, 129, 191, 1199, 1215, 1228, 1241)
- `RevenueModelDashboard.tsx` (già aggiornato ✅)

**Azione Richiesta:**
- ❌ **ELIMINARE** `prezzoVenditaProdotto` dal database
- ✅ **USARE** `prezzoMedioDispositivo` ovunque
- 🔧 **AGGIORNARE** `TamSamSomDashboard.tsx` per leggere campo corretto

---

### **2. PREZZI PER TIPOLOGIA (Carrellati/Portatili/Palmari) - ✅ OK**

| Campo | Posizione | Valore | Status |
|-------|-----------|--------|--------|
| `prezziMediDispositivi` | `configurazioneTamSamSom.ecografi` | Carrellati: €50k, Portatili: €25k, Palmari: €6k | ✅ SOURCE OF TRUTH |
| `aspByType` (ELIMINATO) | `revenueModel.hardware` | N/A | ✅ Già rimosso |

**Stato:** ✅ Già correttamente gestito nel refactoring precedente

---

### **3. COGS / UNIT COST - ✅ OK**

| Campo | Posizione | Scope | Status |
|-------|-----------|-------|--------|
| `unitCost` | `revenueModel.hardware` | COGS medio | ✅ UNICO |
| `unitCostByType` | `revenueModel.hardware` | COGS per tipologia | ✅ UNICO |

**Stato:** ✅ NO duplicati, corretto

---

### **4. MARGINI HARDWARE - ✅ OK**

| Campo | Posizione | Scope | Status |
|-------|-----------|-------|--------|
| `cogsMarginByType` | `revenueModel.hardware` | Margini per tipologia | ✅ UNICO |
| `warrantyPct` | `revenueModel.hardware` | % garanzia | ✅ UNICO |

**Stato:** ✅ NO duplicati, corretto

---

### **5. PRICING SAAS - ✅ OK**

| Campo | Posizione | Scope | Status |
|-------|-----------|-------|--------|
| `monthlyFee` | `revenueModel.saas.pricing.perDevice` | Fee mensile SaaS | ✅ UNICO |
| `annualFee` | `revenueModel.saas.pricing.perDevice` | Fee annuale SaaS | ✅ UNICO |
| `feePerScan` | `revenueModel.saas.pricing.perScan` | Fee per scansione | ✅ UNICO |

**Stato:** ✅ NO duplicati, corretto

---

### **6. PREZZI SCANSIONI (Nomenclatore) - ✅ OK**

| Campo | Posizione | Scope | Status |
|-------|-----------|-------|--------|
| `prezzoPubblico` | `configurazioneTamSamSom.scansioni[].italia[]` | Prezzo SSN | ✅ UNICO |
| `prezzoPrivato` | `configurazioneTamSamSom.scansioni[].italia[]` | Prezzo privato | ✅ UNICO |

**Stato:** ✅ NO duplicati, questi sono prezzi delle scansioni (diverso concetto)

---

## 🎯 **RIEPILOGO**

### **✅ Campi OK (NO Duplicati)**
- ✅ `prezziMediDispositivi` (SOURCE OF TRUTH per ASP by type)
- ✅ `unitCost` e `unitCostByType` (COGS)
- ✅ `cogsMarginByType` (Margini)
- ✅ `warrantyPct` (Garanzia)
- ✅ Pricing SaaS (`monthlyFee`, `annualFee`, `feePerScan`)
- ✅ Prezzi scansioni (`prezzoPubblico`, `prezzoPrivato`)

### **❌ Campi Duplicati TROVATI**
- 🔴 **CRITICO:** `prezzoVenditaProdotto` vs `prezzoMedioDispositivo`

---

## 🔧 **AZIONI RICHIESTE**

### **PRIORITÀ 1 - CRITICA**

#### **1. Eliminare `prezzoVenditaProdotto` dal database**
```json
// ELIMINARE questa riga:
"prezzoVenditaProdotto": 25000
```

#### **2. Aggiornare `TamSamSomDashboard.tsx`**

**Modifiche da fare:**

```typescript
// ❌ VECCHIO (linea 74)
const [prezzoVenditaProdotto, setPrezzoVenditaProdotto] = useState(75000);

// ✅ NUOVO - Usare prezzoMedioDispositivo
// (già disponibile nello state come prezzoMedio)
```

**Calcolo Ricavi Potenziali (linee 1215, 1228, 1241):**
```typescript
// ❌ VECCHIO
€{(calculateSomDevices('y1') * prezzoVenditaProdotto).toLocaleString('it-IT')}

// ✅ NUOVO
€{(calculateSomDevices('y1') * prezzoMedio).toLocaleString('it-IT')}
```

**Campo editabile (linea 1195-1199):**
```typescript
// ❌ ELIMINARE completamente questa sezione
// Il prezzo si modifica già nella Vista Dispositivi (modalità dettagliata)
```

#### **3. Rimuovere salvataggio `prezzoVenditaProdotto`**

**In `saveConfigurazione()` (linea 191):**
```typescript
// ❌ VECCHIO
updateConfigurazioneTamSamSomEcografi({
  prezzoVenditaProdotto: prezzoVenditaProdotto,  // ← ELIMINARE
  // ...
});

// ✅ NUOVO
updateConfigurazioneTamSamSomEcografi({
  prezzoMedioDispositivo: prezzoMedio,  // ← Già presente
  // ...
});
```

---

## ✅ **VERIFICA POST-FIX**

Dopo le modifiche, verificare:

### **Test 1: Modifica Prezzo in Vista Dispositivi**
1. TAM/SAM/SOM → Vista Dispositivi (Modalità Dettagliata)
2. Cambia "Prezzo Medio" → €50,000
3. Salva
4. **VERIFICA:** Sezione "Potenziale Ricavi" mostra calcoli con €50,000 ✅

### **Test 2: Sincronizzazione con Revenue Model**
1. TAM/SAM/SOM → Cambia prezzo → €55,000
2. Vai a Revenue Model → Tab Hardware
3. **VERIFICA:** ASP Medio = €55,000 ✅

### **Test 3: Calcolo Ricavi Corretto**
1. TAM/SAM/SOM → Dispositivi SOM Anno 1 = 10
2. Prezzo Medio = €40,000
3. **VERIFICA:** Ricavi Anno 1 = €400,000 (10 × €40k) ✅

---

## 📊 **IMPATTO**

### **Before (Inconsistente)**
```
prezzoMedioDispositivo = €44,000   (Vista Dispositivi)
prezzoVenditaProdotto = €25,000    (Potenziale Ricavi) ❌ SBAGLIATO
```

**Risultato:** Ricavi calcolati con prezzo obsoleto!

### **After (Consistente)**
```
prezzoMedioDispositivo = €44,000   (SINGLE SOURCE OF TRUTH)
└─ Usato in: Vista Dispositivi ✅
└─ Usato in: Potenziale Ricavi ✅
└─ Usato in: Revenue Model ✅
```

**Risultato:** Tutti i calcoli usano lo stesso valore! ✅

---

## 📝 **NOTE**

### **Perché `prezzoVenditaProdotto` esisteva?**
Probabilmente creato in una versione precedente quando la logica era diversa. Con l'introduzione di `prezziMediDispositivi` (dettaglio per tipologia), il campo singolo è diventato ridondante.

### **Perché non unificare anche i prezzi per tipologia?**
La Vista Dispositivi può funzionare in 2 modalità:
- **Semplice:** usa `prezzoMedioDispositivo` (singolo prezzo)
- **Dettagliata:** usa `prezziMediDispositivi` (prezzi per carrellati/portatili/palmari)

Questo è corretto e serve per flessibilità dell'utente.

---

## 🎯 **CONCLUSIONE**

**Trovato 1 duplicato critico:**
- ❌ `prezzoVenditaProdotto` (OBSOLETO)

**Azione:**
- Eliminare campo dal database
- Aggiornare `TamSamSomDashboard.tsx` per usare `prezzoMedioDispositivo`
- Rimuovere UI di editing duplicata

**Beneficio:**
- Single Source of Truth garantito
- NO più inconsistenze tra sezioni
- Calcoli ricavi corretti

---

## 🚀 **PROSSIMI PASSI**

1. ✅ Analisi completata
2. ⏳ Implementare fix su `TamSamSomDashboard.tsx`
3. ⏳ Pulire database.json
4. ⏳ Test cross-sync completo
5. ⏳ Documentare pattern per future modifiche
