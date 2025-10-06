# 🆕 Aggiornamento Export Excel - Mercato Ecografie

## ✅ Modifiche Applicate

### **1. Icona Pulsante Ricarica** ✨
**Prima**: Icona Upload (freccia verso l'alto) ❌  
**Dopo**: Icona RefreshCw (frecce circolari) ✅

```typescript
// Prima
<Upload className="h-4 w-4 mr-2" />

// Dopo  
<RefreshCw className="h-4 w-4 mr-2" />
```

### **2. Export da JSON a Excel** 📊
**Prima**: Esportava file JSON con struttura dati grezza  
**Dopo**: Esporta file Excel professionale con formattazione

#### **Nome File**
```
Eco3D_Mercato_Ecografie_2025-10-04.xlsx
```

#### **Struttura Excel**

| Codice | Prestazione | U | B | D | P | Stima SSN | Extra-SSN | Totale Annuo | % Extra-SSN | Visibile |
|--------|-------------|---|---|---|---|-----------|-----------|--------------|-------------|----------|
| 88.71.4 | Capo/Collo | 12,345 | 23,456 | 34,567 | 45,678 | 116,046 | 23,209 | 139,255 | 20.0 | Sì |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| TOTALE | Totale Italia | ... | ... | ... | ... | 1,234,567 | 246,913 | 1,481,480 | 20.0 | Sì |

## 🎯 Funzionalità Export Excel

### **Caratteristiche del File**

1. **Formato Professionale**
   - File `.xlsx` nativo Excel
   - Colonne con larghezza ottimizzata
   - Header ben formattati

2. **Dati Completi**
   - ✅ Tutte le 15 prestazioni
   - ✅ Riga totale con somme aggregate
   - ✅ Percentuali calcolate automaticamente
   - ✅ Stato visibilità (Sì/No)

3. **Larghezza Colonne Ottimizzata**
   ```typescript
   ws['!cols'] = [
     { wch: 12 },  // Codice
     { wch: 35 },  // Prestazione (più largo)
     { wch: 12 },  // U
     { wch: 12 },  // B
     { wch: 12 },  // D
     { wch: 12 },  // P
     { wch: 15 },  // Stima SSN
     { wch: 15 },  // Extra-SSN
     { wch: 15 },  // Totale Annuo
     { wch: 12 },  // % Extra-SSN
     { wch: 10 }   // Visibile
   ];
   ```

4. **Calcolo Percentuali**
   ```typescript
   '% Extra-SSN': prestazione.percentualeExtraSSN
   
   // Per il totale:
   '% Extra-SSN': totaleItalia.colE > 0 
     ? parseFloat(((totaleItalia.extraSSN / totaleItalia.colE) * 100).toFixed(1))
     : 0
   ```

## 📋 Colonne Esportate

1. **Codice** - Nomenclatore SSN (es: 88.71.4)
2. **Prestazione** - Nome descrittivo
3. **Urgente (U)** - Volume priorità Urgente
4. **Breve (B)** - Volume priorità Breve
5. **Differibile (D)** - Volume priorità Differibile
6. **Programmabile (P)** - Volume priorità Programmabile
7. **Stima SSN** - Volume totale SSN annuo
8. **Extra-SSN** - Volume mercato privato
9. **Totale Annuo** - SSN + Extra-SSN
10. **% Extra-SSN** - Percentuale mercato privato
11. **Visibile** - Stato visibilità (Sì/No)

## 🔧 Implementazione Tecnica

### **Funzione exportData()**

```typescript
const exportData = () => {
  // 1. Crea workbook
  const wb = XLSX.utils.book_new();

  // 2. Prepara dati
  const exportData = prestazioni.map(p => ({
    'Codice': p.codice,
    'Prestazione': p.nome,
    // ... tutti i campi
    'Visibile': p.visible ? 'Sì' : 'No'
  }));

  // 3. Aggiungi riga totale
  if (totaleItalia) {
    exportData.push({ /* totali */ });
  }

  // 4. Converti in worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // 5. Imposta larghezza colonne
  ws['!cols'] = [ /* configurazione */ ];

  // 6. Aggiungi al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Mercato Ecografie');

  // 7. Esporta file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Eco3D_Mercato_Ecografie_${timestamp}.xlsx`);
};
```

## 🎨 UI Aggiornata

### **Header Pulsanti**

```jsx
<Button onClick={loadExcelData} variant="outline">
  <RefreshCw className="h-4 w-4 mr-2" />
  Ricarica
</Button>

<Button onClick={exportData} variant="outline">
  <FileSpreadsheet className="h-4 w-4 mr-2" />
  Esporta Excel
</Button>
```

### **Icone Utilizzate**

- 🔄 **RefreshCw**: Ricarica dati (frecce circolari)
- 📊 **FileSpreadsheet**: Export Excel (icona foglio di calcolo)

## 🚀 Come Usare

1. **Apri** http://localhost:3002
2. **Vai** sulla tab "📊 Mercato Ecografie"
3. **Personalizza** i dati (nascondi righe, riordina, modifica %)
4. **Clicca** "Esporta Excel" (pulsante con icona 📊)
5. **Il file viene scaricato** automaticamente nel browser
6. **Apri** il file con Excel, Numbers o Google Sheets

## 📊 Esempio Output

Quando clicchi "Esporta Excel", ottieni un file completo:

**Nome**: `Eco3D_Mercato_Ecografie_2025-10-04.xlsx`

**Contenuto**:
- Foglio "Mercato Ecografie"
- 15 righe prestazioni + 1 riga totale
- 11 colonne con dati completi
- Formattazione professionale
- Pronto per analisi in Excel

## ✨ Vantaggi

### **Rispetto a JSON**
- ✅ **Più leggibile** - Apri direttamente in Excel
- ✅ **Più professionale** - Pronto per presentazioni
- ✅ **Più flessibile** - Analizza con pivot tables
- ✅ **Più condivisibile** - Formato universale

### **Funzionalità Avanzate**
- ✅ **Colonne ottimizzate** - Nessuna formattazione manuale necessaria
- ✅ **Riga totale** - Aggregazioni già calcolate
- ✅ **Stato visibilità** - Traccia configurazione
- ✅ **Nome file intelligente** - Include data export

## 🔍 Dettagli Tecnici

### **Libreria Utilizzata**
```typescript
import * as XLSX from 'xlsx';
```

### **Metodi Chiave**
1. `XLSX.utils.book_new()` - Crea workbook vuoto
2. `XLSX.utils.json_to_sheet()` - Converte JSON in worksheet
3. `XLSX.utils.book_append_sheet()` - Aggiunge foglio al workbook
4. `XLSX.writeFile()` - Esporta file su disco

### **Configurazione Colonne**
```typescript
ws['!cols'] = [
  { wch: width_in_characters }
];
```

## 📝 Note Importanti

1. **Tutte le prestazioni** vengono esportate (anche quelle nascoste)
2. **Lo stato "Visibile"** è incluso per tracciare la configurazione
3. **L'ordine** delle righe riflette l'ordine attuale nella tabella
4. **I totali** sono ricalcolati nel file Excel
5. **Il formato** è compatibile con Excel 2007+

## 🎯 Prossimi Passi Suggeriti

1. **Formattazione avanzata**: Aggiungere colori alle celle
2. **Grafici automatici**: Includere chart nel file Excel
3. **Filtri**: Aggiungere auto-filter alle colonne
4. **Stili**: Formattare header con bold e colore
5. **Validazione**: Proteggere celle dalla modifica

---

**Stato**: ✅ Completato e Funzionante  
**Server**: http://localhost:3002  
**Ultima modifica**: 2025-10-04 19:08
