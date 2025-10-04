# 📊 Modifiche Tab Mercato Ecografie

## ✅ Funzionalità Implementate

### 1. **Layout Riorganizzato**
- ✅ **3 Card Riepilogo** spostate in alto (prima della tabella)
  - Volume SSN Totale
  - Volume Extra-SSN
  - Mercato Totale
- ✅ **Legenda spostata in fondo** (dopo la tabella)
- ✅ Legenda si adatta dinamicamente alle colonne visibili

### 2. **Controllo Visibilità Colonne**
- ✅ **Pulsante "Codice"** - Mostra/Nascondi colonna codici nomenclatore SSN
- ✅ **Pulsante "U-B-D-P"** - Mostra/Nascondi le 4 colonne di priorità
- ✅ Icone Eye/EyeOff per chiarezza visiva
- ✅ Pulsanti cambiano aspetto quando attivi/disattivi

### 3. **Riordinamento Prestazioni**
- ✅ **Colonna "Ordine"** con pulsanti freccia
- ✅ **Freccia ↑** - Sposta prestazione verso l'alto
- ✅ **Freccia ↓** - Sposta prestazione verso il basso
- ✅ Pulsanti si disabilitano automaticamente ai limiti
- ✅ Ordine completamente personalizzabile

### 4. **Nascondi/Mostra Singole Prestazioni** ⭐ NUOVO
- ✅ **Nuova colonna con icona 👁️** a sinistra della tabella
- ✅ **Clic sull'icona** per nascondere/mostrare la prestazione
- ✅ **Righe nascoste** appaiono in grigio semi-trasparente
- ✅ **Icona diventa EyeOff** (grigia) per prestazioni nascoste
- ✅ **I totali si ricalcolano automaticamente** escludendo le prestazioni nascoste
- ✅ **Badge contatore** mostra "X / 15 visibili"
- ✅ Le 3 card riepilogo si aggiornano in tempo reale

### 5. **Indicatori Visivi**
- ✅ Badge che mostra "X / 15 visibili" accanto al titolo
- ✅ Righe nascoste con opacità ridotta (40%) e sfondo grigio
- ✅ Icone colorate: verde per visibile, grigio per nascosto

## 🎨 Struttura Visiva

```
┌─────────────────────────────────────────────┐
│  📊 Mercato Ecografie Italia                │
│  [Ricarica] [Esporta JSON]                  │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Volume   │ Volume   │ Mercato  │
│ SSN      │ Extra-SSN│ Totale   │
│ (blue)   │ (green)  │ (purple) │
└──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────┐
│ Prestazioni Ecografiche [12 / 15 visibili]  │
│                      [Codice] [U-B-D-P]     │
├─────────────────────────────────────────────┤
│ 👁️ │ ↑↓ │ Codice │ Nome │ ... │ %         │
│ 🟢 │ ⬆️⬇️ │ ...    │ ...  │ ... │ [input]  │
│ 🟢 │ ⬆️⬇️ │ ...    │ ...  │ ... │ [input]  │
│ ⚪ │ ⬆️⬇️ │ ...    │ ...  │ ... │ [input]  │ ← NASCOSTA
│ ...                                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ℹ️ Legenda Colonne                          │
│ • 👁️ Visibilità: Mostra/Nascondi           │
│ • Ordine: Riordina con frecce ↑↓           │
│ • ... (altre spiegazioni)                   │
└─────────────────────────────────────────────┘
```

## 🔧 Comportamento Dinamico

### Quando l'utente nasconde una prestazione:
1. ✅ La riga diventa grigia e semi-trasparente
2. ✅ L'icona cambia da Eye (verde) a EyeOff (grigio)
3. ✅ I totali vengono ricalcolati ESCLUDENDO quella prestazione
4. ✅ Le 3 card in alto si aggiornano automaticamente
5. ✅ Il badge contatore si aggiorna (es: "14 / 15 visibili")
6. ✅ La riga Totale Italia riflette solo le prestazioni visibili

### Quando l'utente rimostra una prestazione:
1. ✅ La riga torna normale (opacità 100%, sfondo bianco)
2. ✅ L'icona torna Eye (verde)
3. ✅ I totali vengono ricalcolati INCLUDENDO quella prestazione
4. ✅ Tutte le card e contatori si aggiornano

## 📝 Dettagli Tecnici

### Stato Componente
```typescript
interface PrestazioneData {
  // ... altri campi
  visible: boolean; // NUOVO campo per tracciare la visibilità
}
```

### Funzione Ricalcolo Totali
```typescript
const recalculateTotale = (prestazioniData: PrestazioneData[]) => {
  // Filtra solo le prestazioni visibili
  const visiblePrestazioni = prestazioniData.filter(p => p.visible);
  
  // Calcola i totali solo sulle prestazioni visibili
  newTotale.colE = visiblePrestazioni.reduce((sum, p) => sum + p.colE, 0);
  // ... altri campi
};
```

### Toggle Visibilità
```typescript
const toggleVisibility = (index: number) => {
  // Inverte lo stato visible
  updatedPrestazioni[index].visible = !updatedPrestazioni[index].visible;
  
  // Ricalcola i totali
  recalculateTotale(updatedPrestazioni);
};

## 🌐 Come Usare

1. Apri **http://localhost:3002**
2. Vai alla tab **"📊 Mercato Ecografie"**
3. **Riordina** le prestazioni con le frecce ↑↓
4. **Nascondi colonne** con i pulsanti in alto a destra
5. **Nascondi prestazioni** cliccando sull'icona 👁️
6. **Modifica percentuali** Extra-SSN direttamente
7. **Osserva** i totali aggiornarsi automaticamente
8. **Esporta in Excel** con il pulsante in alto a destra (icona 📊)

## ⚠️ Note Importanti

- Le prestazioni nascoste **NON vengono rimosse**, solo escluse dai totali
- L'ordine personalizzato e la visibilità **vengono salvati** nell'export Excel
- **Esportazione Excel** include TUTTE le prestazioni con stato visibilità
- Le prestazioni nascoste rimangono nella tabella ma con aspetto attenuato

## 📤 Funzionalità Export Excel

### **Formato File Esportato**
- **Nome file**: `Eco3D_Mercato_Ecografie_YYYY-MM-DD.xlsx`
- **Foglio**: "Mercato Ecografie"

### **Colonne Esportate**
1. Codice (nomenclatore SSN)
2. Prestazione (nome)
3. Urgente (U)
4. Breve (B)
5. Differibile (D)
6. Programmabile (P)
7. Stima SSN
8. Extra-SSN
9. Totale Annuo
10. % Extra-SSN
11. Visibile (Sì/No)

### **Caratteristiche**
- ✅ **Larghezza colonne ottimizzata** per leggibilità
- ✅ **Riga totale inclusa** con somme aggregate
- ✅ **Stato visibilità** di ogni prestazione
- ✅ **Percentuali calcolate** automaticamente
- ✅ **Formato numerico** italiano

## 🎯 Casi d'Uso

1. **Analisi Scenari**: Nascondi prestazioni irrilevanti per vedere l'impatto
2. **Focus Specifico**: Visualizza solo le prestazioni di interesse
3. **Presentazioni**: Riordina per importanza e nascondi dettagli non necessari
4. **Comparazioni**: Attiva/disattiva rapidamente gruppi di prestazioni

## 📊 File Modificati

- ✅ `/financial-dashboard/src/components/MercatoEcografie.tsx`
  - Aggiunto campo `visible` all'interfaccia
  - Implementata funzione `toggleVisibility()`
  - Modificata funzione `recalculateTotale()` per filtrare prestazioni visibili
  - Aggiunta colonna visibilità con icone Eye/EyeOff
  - Aggiunto badge contatore prestazioni visibili
  - Aggiornata legenda

## ✨ Miglioramenti Futuri Suggeriti

1. **Salvataggio configurazione** in localStorage
2. **Preset** di visibilità (es: "Solo MSK", "Solo Cardio", ecc.)
3. **Filtri rapidi** per categoria di prestazione
4. **Esportazione Excel** con solo prestazioni visibili
5. **Grafici** che mostrano distribuzione delle prestazioni visibili
