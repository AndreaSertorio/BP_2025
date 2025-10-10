# 🎛️ Dual-Mode: Dati Reali vs Simulazione Manuale

**Data:** 2025-10-10  
**Commit:** `bf712af`  
**Status:** ✅ **IMPLEMENTATO E TESTABILE**

---

## 🎯 **PROBLEMA RISOLTO**

### **Errore Critico:**
- ❌ **JSON malformato:** Parentesi graffe duplicate alla fine di `database.json`
- ❌ **Build error:** "Cannot parse JSON: Unexpected token '}'"
- ✅ **RISOLTO:** Rimosso `}   }  }  }` duplicato

### **Richiesta Funzionalità:**
> "Vorrei rendere duplice modalità: possibilità di vedere con i dati reali che abbiamo calcolato, oppure una prova con dei dati fasulli inseriti a mano. All'inizio sia sempre sui dati reali, poi se schiaccio e voglio visualizzare invece questi dati inseriti a mano, voglio la possibilità di inserire io a mano il dato."

---

## 🎛️ **DUAL-MODE IMPLEMENTATO**

### **Due Modalità Disponibili:**

#### **1️⃣ MODALITÀ DATI REALI (DEFAULT ✅)**
- **Priorità assoluta:** Legge dispositivi SOM Y1 dal database TAM/SAM/SOM
- **Auto-sync:** Modifiche TAM/SAM/SOM → Update automatico Revenue Model
- **Fallback intelligente:** Se som1 = 0 → usa 100 unità
- **Badge:** `📊 Dati Reali` (verde)

#### **2️⃣ MODALITÀ SIMULAZIONE MANUALE**
- **Input personalizzato:** Utente inserisce numero dispositivi a piacere
- **What-if analysis:** Test scenari alternativi senza modificare dati reali
- **Real-time update:** Ogni modifica ricalcola istantaneamente tutti i ricavi
- **Badge:** `✏️ Simulazione` (blu)

---

## 🖥️ **INTERFACCIA UTENTE**

### **Layout Completo:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  💰 Preview Ricavi Anno 1                                       [ℹ️]            │
│                                                                                  │
│  ┌───────────────────────┐  ┌──────────────────────────────┐  ┌──────────────┐ │
│  │ 📊 Dati Reali        │  │ Reali [====○    ] Manuale   │  │ (input)      │ │
│  └───────────────────────┘  └──────────────────────────────┘  └──────────────┘ │
│     ↑ Badge dinamico          ↑ Toggle switch               ↑ Solo in modalità │
│                                                                simulazione      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### **🎨 Badge Dinamico (3 stati):**

| Modalità | Condizione | Badge | Colore | Descrizione |
|----------|-----------|-------|--------|-------------|
| **Reali** | som1 > 0 | `📊 Dati Reali` | 🟢 Verde | Usa dispositivi da TAM/SAM/SOM |
| **Reali** | som1 = 0 | `⚠️ Fallback` | 🟡 Giallo | Usa 100 unità (dati non disponibili) |
| **Manuale** | Toggle ON | `✏️ Simulazione` | 🔵 Blu | Usa input utente |

### **🔄 Toggle Switch:**

```
┌──────────────────────────────┐
│ Reali  [====○    ]  Manuale  │
└──────────────────────────────┘
   ↑                    ↑
 Verde               Grigio
(attivo)          (inattivo)
```

**Comportamento:**
- **Default:** Switch a sinistra (Reali) ✅
- **Click:** Switch a destra (Manuale)
- **Colore testo:** Attivo = colorato, Inattivo = grigio

### **✏️ Input Manuale:**

```
┌──────────────────────┐
│ Dispositivi: [ 250 ] │
└──────────────────────┘
```

**Caratteristiche:**
- **Visibilità:** Solo in modalità Simulazione
- **Type:** Number input
- **Range:** Min 0, no max
- **Update:** Real-time (ogni digitazione)
- **Width:** 24 (circa 100px)

---

## 🔄 **FLUSSO OPERATIVO**

### **Scenario 1: Avvio Applicazione (DEFAULT)**

```
1. Utente apre Revenue Model
   → useRealData = true (DEFAULT)
   
2. Sistema legge database
   → somDevicesY1 = 3,086 (da TAM/SAM/SOM)
   
3. UI mostra:
   ✅ Badge: "📊 Dati Reali" (verde)
   ✅ Toggle: Sinistra (Reali)
   ✅ Input: Nascosto
   ✅ Dispositivi: 3,086
   ✅ Hardware Revenue: €138,870,000
```

### **Scenario 2: Modifica TAM/SAM/SOM (Auto-Sync)**

```
1. Utente va a TAM/SAM/SOM → Vista Dispositivi
2. Modifica: SOM Y1 da 0.5% → 1%
3. Dopo 2s (auto-save):
   → somDevicesY1 = 6,172 (raddoppiato)
   
4. Utente torna a Revenue Model:
   ✅ Dispositivi aggiornati: 6,172
   ✅ Hardware Revenue: €277,740,000
   ✅ Badge: "📊 Dati Reali" (sempre verde)
   
Nessun reload necessario! ✨
```

### **Scenario 3: Switch a Simulazione Manuale**

```
1. Utente click toggle → Destra (Manuale)
   → useRealData = false
   
2. UI cambia istantaneamente:
   ✅ Badge: "✏️ Simulazione" (blu)
   ✅ Input appare: [ 100 ]
   ✅ Dispositivi: 100 (default manuale)
   
3. Utente digita: 500
   → manualDevices = 500
   
4. Calcoli aggiornati in real-time:
   ✅ Hardware Revenue: €22,500,000
   ✅ MRR: €200,000
   ✅ ARR: €2,200,000
```

### **Scenario 4: Ritorno a Dati Reali**

```
1. Utente click toggle → Sinistra (Reali)
   → useRealData = true
   
2. UI ripristina:
   ✅ Badge: "📊 Dati Reali" (verde)
   ✅ Input nascosto
   ✅ Dispositivi: 6,172 (da TAM/SAM/SOM)
   ✅ Hardware Revenue: €277,740,000
   
Dati reali sempre preservati! ✅
```

---

## 🧪 **GUIDA TEST COMPLETA**

### **Test 1: Verifica Default su Dati Reali**

**Steps:**
1. Apri http://localhost:3002
2. Vai a tab "💼 Modello Business"
3. Scorri a "Preview Ricavi Anno 1"

**✅ VERIFICA:**
- [ ] Toggle su "Reali" (sinistra)
- [ ] Badge verde "📊 Dati Reali" (se som1 > 0)
- [ ] Input manuale nascosto
- [ ] Dispositivi mostrano numero da TAM/SAM/SOM

### **Test 2: Auto-Sync con TAM/SAM/SOM**

**Steps:**
1. Vai a "🎯 TAM/SAM/SOM"
2. Click "Vista Dispositivi"
3. Modifica SOM Y1: 0.5% → 1%
4. Attendi 2 secondi (auto-save)
5. Torna a "💼 Modello Business"

**✅ VERIFICA:**
- [ ] Dispositivi raddoppiati
- [ ] Hardware revenue aggiornato
- [ ] Badge ancora verde "📊 Dati Reali"
- [ ] Tooltip mostra nuovi valori

### **Test 3: Switch a Simulazione**

**Steps:**
1. In "Preview Ricavi Anno 1"
2. Click toggle → Sposta a destra
3. Osserva UI

**✅ VERIFICA:**
- [ ] Badge cambia: "✏️ Simulazione" (blu)
- [ ] Input appare: "Dispositivi: [ 100 ]"
- [ ] Toggle su "Manuale" (destra)
- [ ] Calcoli usano 100 unità

### **Test 4: Input Manuale Real-Time**

**Steps:**
1. In modalità Simulazione
2. Click su input dispositivi
3. Digita: 500
4. Osserva calcoli

**✅ VERIFICA:**
- [ ] Dispositivi: 500
- [ ] Hardware: 500 × €45,000 = €22,500,000
- [ ] MRR: 400 × €500 = €200,000
- [ ] ARR: 400 × €5,500 = €2,200,000
- [ ] Tooltip aggiorna in real-time

### **Test 5: Ritorno a Dati Reali**

**Steps:**
1. Da modalità Simulazione (500 dispositivi)
2. Click toggle → Sposta a sinistra
3. Osserva UI

**✅ VERIFICA:**
- [ ] Badge: "📊 Dati Reali" (verde)
- [ ] Input nascosto
- [ ] Dispositivi ripristinati da TAM/SAM/SOM
- [ ] Hardware revenue torna a valori reali
- [ ] Input manuale (500) NON salvato

### **Test 6: Fallback Intelligente**

**Steps:**
1. Vai a TAM/SAM/SOM → Vista Dispositivi
2. Deseleziona tutte le regioni
3. Attendi 2 secondi
4. Torna a Modello Business

**✅ VERIFICA:**
- [ ] Badge: "⚠️ Fallback" (giallo)
- [ ] Dispositivi: 100 (fallback)
- [ ] Tooltip: "dati non disponibili"
- [ ] Toggle ancora su "Reali"

---

## 💻 **IMPLEMENTAZIONE TECNICA**

### **State Management:**

```typescript
// 🎛️ Stati locali componente
const [useRealData, setUseRealData] = useState(true);     // DEFAULT ✅
const [manualDevices, setManualDevices] = useState(100);  // Input utente

// 📊 Logica selezione sorgente
const hasRealData = somDevicesY1 && somDevicesY1 > 0;
const realDataDevices = hasRealData ? somDevicesY1 : 0;

// 🔢 Calcolo dispositivi finali
const UNITS_Y1 = useRealData 
  ? (realDataDevices > 0 ? realDataDevices : 100)  // Real o fallback
  : manualDevices;                                   // Manual
```

### **UI Components:**

```tsx
{/* Toggle Switch */}
<Switch 
  checked={!useRealData}
  onCheckedChange={(checked) => setUseRealData(!checked)}
/>

{/* Input Manuale (condizionale) */}
{!useRealData && (
  <Input 
    type="number"
    value={manualDevices}
    onChange={(e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val >= 0) {
        setManualDevices(val);
      }
    }}
  />
)}
```

### **Badge Dinamico:**

```tsx
{useRealData ? (
  hasRealData ? (
    <Badge className="bg-green-100 text-green-700">
      <Database className="h-3 w-3 mr-1" />
      Dati Reali
    </Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-700">
      ⚠️ Fallback
    </Badge>
  )
) : (
  <Badge className="bg-blue-100 text-blue-700">
    <Edit3 className="h-3 w-3 mr-1" />
    Simulazione
  </Badge>
)}
```

---

## 📊 **ESEMPIO CALCOLI**

### **Modalità Dati Reali (som1 = 3,086)**

```
Hardware Revenue:
  = 3,086 × €45,000 = €138,870,000

Active Devices (80%):
  = 3,086 × 0.80 = 2,469

MRR:
  = 2,469 × €500 = €1,234,500

ARR:
  = 2,469 × €5,500 = €13,579,500

TOTALE Y1:
  = €138,870,000 + €13,579,500
  = €152,449,500
```

### **Modalità Simulazione (input = 500)**

```
Hardware Revenue:
  = 500 × €45,000 = €22,500,000

Active Devices (80%):
  = 500 × 0.80 = 400

MRR:
  = 400 × €500 = €200,000

ARR:
  = 400 × €5,500 = €2,200,000

TOTALE Y1:
  = €22,500,000 + €2,200,000
  = €24,700,000
```

---

## 🎯 **PRIORITÀ RISPETTATA**

✅ **Default SEMPRE su Dati Reali**
- useRealData inizializzato a `true`
- Nessuna persistenza modalità manuale
- Ogni reload parte da Dati Reali

✅ **Simulazione solo su richiesta**
- Richiede azione esplicita (toggle)
- Input appare solo in modalità manuale
- Badge blu indica chiaramente stato

✅ **Facile ritorno a Reali**
- Un click sul toggle
- Dati reali sempre preservati
- Nessuna perdita informazioni

---

## 🚀 **BENEFICI IMPLEMENTAZIONE**

### **Per l'Utente:**
- ✅ **Chiarezza:** Badge mostra sempre fonte dati
- ✅ **Flessibilità:** Test what-if senza perdere dati reali
- ✅ **Controllo:** Switch rapido tra modalità
- ✅ **Sicurezza:** Default su dati reali (no confusione)

### **Per il Business:**
- ✅ **Validazione:** Test scenari alternativi
- ✅ **Presentazioni:** Demo con numeri personalizzati
- ✅ **Analisi sensitivity:** Impact dispositivi su ricavi
- ✅ **Planning:** What-if per target vendite

---

## 📝 **TOOLTIP AGGIORNATI**

### **Modalità Dati Reali (con dati)**
```
📊 Fonte dati dispositivi:

✅ Dati reali dal TAM/SAM/SOM
  • Dispositivi Anno 1 (SOM): 3,086
  • Calcolati da: TAM → SAM → SOM
  • Regioni attive nel calcolo TAM/SAM/SOM
  
  • Conversione SaaS: 2,469 devices (80%)
```

### **Modalità Dati Reali (senza dati)**
```
📊 Fonte dati dispositivi:

⚠️ Fallback: 100 unità (dati non disponibili)
  Vai a TAM/SAM/SOM → Vista Dispositivi 
  per calcolare i dati reali
  
  • Conversione SaaS: 80 devices (80%)
```

### **Modalità Simulazione**
```
📊 Fonte dati dispositivi:

✏️ Simulazione Manuale
  • Dispositivi impostati manualmente: 500
  • Usa questa modalità per analisi "what-if"
  
  • Conversione SaaS: 400 devices (80%)
```

---

## ⚡ **PERFORMANCE**

- **Real-time update:** Input onChange → Calcoli instantanei
- **No API calls:** Modalità manuale puramente client-side
- **State locale:** Non persiste nel database
- **Smooth UX:** Nessun lag o delay visibile

---

## 🎉 **CONCLUSIONE**

✅ **Errore JSON risolto** → Build funzionante  
✅ **Dual-mode implementato** → Dati Reali (default) + Simulazione  
✅ **UI intuitiva** → Toggle + Badge + Input condizionale  
✅ **Priorità rispettata** → Default sempre su dati reali  
✅ **Testabile ora** → Tutte le funzionalità operative  

---

**Pronto per il test!** 🚀  
**Server:** http://localhost:3002  
**Commit:** `bf712af`
