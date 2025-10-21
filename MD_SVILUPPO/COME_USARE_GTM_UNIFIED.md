# 🔧 COME USARE GTM ENGINE UNIFIED

**Guida rapida** per sostituire GTMEngineCard con GTMEngineUnified

---

## 📍 **DOVE SI USA ATTUALMENTE**

### **File**: `RevenueModelDashboard.tsx`

**Riga 18**:
```tsx
import { GTMEngineCard } from '../GTMEngineCard';
```

**Riga 831**:
```tsx
<GTMEngineCard
  goToMarket={goToMarket}
  tamSamSomEcografi={tamSamSomEcografi}
  updateGoToMarket={updateGoToMarket}
/>
```

---

## ✅ **COME SOSTITUIRE**

### **Opzione 1: Sostituzione Diretta** (Consigliata)

**Step 1**: Aggiorna import
```tsx
// Prima
import { GTMEngineCard } from '../GTMEngineCard';

// Dopo
import { GTMEngineUnified } from '../GTMEngineUnified';
```

**Step 2**: Sostituisci componente
```tsx
// Prima
<GTMEngineCard
  goToMarket={goToMarket}
  tamSamSomEcografi={tamSamSomEcografi}
  updateGoToMarket={updateGoToMarket}
/>

// Dopo
<GTMEngineUnified />
```

**Nota**: GTMEngineUnified non ha bisogno di props, usa direttamente `useDatabase()`!

---

### **Opzione 2: Side-by-Side Testing**

Per testare affiancati prima di sostituire:

```tsx
import { GTMEngineCard } from '../GTMEngineCard';
import { GTMEngineUnified } from '../GTMEngineUnified';

// Nel render
<>
  {/* Nuovo componente compatto */}
  <GTMEngineUnified />
  
  {/* Vecchio componente (nascosto o collassato) */}
  <details>
    <summary>Vecchia versione (per confronto)</summary>
    <GTMEngineCard
      goToMarket={goToMarket}
      tamSamSomEcografi={tamSamSomEcografi}
      updateGoToMarket={updateGoToMarket}
    />
  </details>
</>
```

---

## 🔍 **DIFFERENZE IMPLEMENTAZIONE**

### **GTMEngineCard** (Vecchio)
```tsx
export function GTMEngineCard({
  goToMarket: gtmProp,
  tamSamSomEcografi: tamProp,
  updateGoToMarket: updateProp
}: GTMEngineCardProps) {
  // Usa props passate dal parent
  const goToMarket = gtmProp || data?.goToMarket;
  // ...
}
```

**Caratteristiche**:
- ❌ Richiede props dal parent
- ❌ Duplicazione data (già in context)
- ❌ 997 righe
- ❌ Layout verticale infinito

---

### **GTMEngineUnified** (Nuovo)
```tsx
export function GTMEngineUnified() {
  const { data, updateGoToMarket, updateMarketingPlan } = useDatabase();
  const goToMarket = data?.goToMarket;
  const tamSamSomEcografi = data?.configurazioneTamSamSom?.ecografi;
  // ...
}
```

**Caratteristiche**:
- ✅ Auto-contained (usa context)
- ✅ No props required
- ✅ ~550 righe (-45%)
- ✅ Tabs + Accordion
- ✅ Global Settings integrati
- ✅ Sales Cycle con media pesata

---

## 📦 **VERIFICA DIPENDENZE**

Prima di usare, verifica che shadcn/ui Tabs e Accordion siano installati:

```bash
# Verifica se esistono
ls src/components/ui/tabs.tsx
ls src/components/ui/accordion.tsx

# Se mancano, installa
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
```

---

## 🧪 **TESTING**

### **1. Test Visivo**
```bash
npm run dev:all
```

Apri: http://localhost:3000  
Naviga: Revenue Model → Bottom-Up tab

**Verifica**:
- ✅ Tabs visibili (Parametri | Simulatore | Scenari)
- ✅ Accordion espansi di default
- ✅ Tutti i parametri editabili
- ✅ Calcoli aggiornati real-time

---

### **2. Test Funzionale**

**a) Edit Reps**
1. Tab "Parametri Base"
2. Accordion "Team & Produttività"
3. Click badge "Y1: 1"
4. Input appare → Cambia valore → Blur
5. ✅ Valore salvato su database

**b) Edit Device Price**
1. Tab "Parametri Base"
2. Accordion "Impostazioni Globali"
3. Click su prezzo (es. €50,000)
4. Input appare → Modifica → Blur
5. ✅ Prezzo salvato
6. ✅ Sincronizzato in TAM/SAM/SOM
7. ✅ Simulatore aggiornato

**c) Simulatore**
1. Tab "Simulatore"
2. Select "Anno 2"
3. Modifica "Costo/Lead" → €60
4. ✅ Tutti i risultati aggiornati
5. ✅ Auto-save dopo 1s

**d) Conversion Funnel**
1. Tab "Parametri Base"
2. Accordion "Conversion Funnel"
3. Muovi slider "Lead → Demo" → 15%
4. ✅ Badge efficienza totale aggiornato
5. ✅ Simulatore ricalcolato

---

### **3. Test Integrazione**

**a) Verifica database.json**
```bash
# Modifica un parametro
# Attendi 1-2 secondi
cat src/data/database.json | grep -A 5 "goToMarket"
```

✅ Valori salvati correttamente

**b) Verifica Riconciliazione**
1. Modifica reps in GTMEngineUnified
2. Vai su tab "Riconciliazione"
3. ✅ Card aggiornata con nuovi valori

**c) Verifica SSOT Device Price**
1. Modifica device price in GTMEngineUnified
2. Vai su TAM/SAM/SOM
3. ✅ Prezzo sincronizzato ovunque

---

## 🐛 **TROUBLESHOOTING**

### **Errore: Tabs not found**
```
Error: Module not found: Can't resolve '@/components/ui/tabs'
```

**Soluzione**:
```bash
npx shadcn-ui@latest add tabs
```

---

### **Errore: Accordion not found**
```
Error: Module not found: Can't resolve '@/components/ui/accordion'
```

**Soluzione**:
```bash
npx shadcn-ui@latest add accordion
```

---

### **Errore: GlobalSettings components not found**
```
Error: Module not found: Can't resolve '@/components/GlobalSettings'
```

**Soluzione**:  
Verifica che esistano:
- `src/components/GlobalSettings/DevicePriceEditor.tsx`
- `src/components/GlobalSettings/SalesMixEditor.tsx`
- `src/components/GlobalSettings/SalesCycleEditor.tsx`
- `src/components/GlobalSettings/index.ts`

Se mancano, sono già stati creati - controlla percorso.

---

### **Nessun auto-save**

**Sintomo**: Modifichi parametri ma non si salvano

**Debug**:
1. Apri DevTools Console
2. Cerca log: `✅ Go-To-Market Engine aggiornato`
3. Cerca log: `✅ Marketing Plan Anno X salvato`

**Se non vedi log**:
- Verifica server Express running su :3001
- Verifica API endpoint `/api/database/go-to-market`
- Controlla network tab per errori

---

### **Calcoli sbagliati**

**Sintomo**: Numeri non corrispondono

**Verifica**:
1. Device Price usa globalSettings? ✅
2. Sales Cycle usa media pesata? ✅
3. Ramp factor applicato solo Y1? ✅
4. Funnel efficiency calcolata correttamente? ✅

**Debug**:
```tsx
console.log('Current calculations:', currentYearCalculations);
```

---

## 📋 **CHECKLIST PRE-DEPLOY**

Prima di sostituire definitivamente:

- [ ] ✅ Tabs installati e funzionanti
- [ ] ✅ Accordion installati e funzionanti
- [ ] ✅ GlobalSettings components esistono
- [ ] ✅ Auto-save funziona
- [ ] ✅ Calcoli corretti
- [ ] ✅ Device Price sincronizzato
- [ ] ✅ Sales Cycle con media pesata
- [ ] ✅ Edit inline funziona
- [ ] ✅ No errori console
- [ ] ✅ No errori lint (o accettabili)
- [ ] ✅ Testato su Chrome + Firefox
- [ ] ✅ Responsive (mobile/tablet)

---

## 🚀 **DEPLOY FINALE**

Quando tutto è verificato:

### **Step 1**: Backup vecchio componente
```bash
cd src/components
mv GTMEngineCard.tsx GTMEngineCard.tsx.old
```

### **Step 2**: Aggiorna import in RevenueModelDashboard
```tsx
// src/components/RevenueModel/RevenueModelDashboard.tsx

// Rimuovi
import { GTMEngineCard } from '../GTMEngineCard';

// Aggiungi
import { GTMEngineUnified } from '../GTMEngineUnified';
```

### **Step 3**: Sostituisci componente
```tsx
// Rimuovi
<GTMEngineCard
  goToMarket={goToMarket}
  tamSamSomEcografi={tamSamSomEcografi}
  updateGoToMarket={updateGoToMarket}
/>

// Aggiungi
<GTMEngineUnified />
```

### **Step 4**: Test finale
```bash
npm run dev:all
```

Verifica tutto funziona correttamente.

### **Step 5**: Commit
```bash
git add .
git commit -m "feat: Replace GTMEngineCard with GTMEngineUnified (-45% code, Tabs+Accordion, Global Settings)"
```

---

## 🎉 **COMPLETATO!**

Ora hai:
- ✅ Componente più compatto (-45% code)
- ✅ UI moderna con Tabs + Accordion
- ✅ Global Settings integrati (SSOT)
- ✅ Sales Cycle con media pesata
- ✅ Auto-save su tutto
- ✅ Edit inline completo

**Enjoy! 🚀**
