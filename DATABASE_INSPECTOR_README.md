# 🗄️ Database Inspector - Guida Rapida

## 🎯 Cos'è

Il **Database Inspector** è un nuovo TAB nell'applicazione Business Planning che ti permette di:

- ✅ Visualizzare tutti i dati del database centralizzato
- ✅ Controllare quali componenti usano quali dati
- ✅ Modificare valori direttamente dall'interfaccia
- ✅ Cercare dati specifici
- ✅ Esportare il database

## 🚀 Come Accedere

1. Avvia l'applicazione:
   ```bash
   cd financial-dashboard
   npm run dev
   ```

2. Apri il browser su `http://localhost:3000`

3. Click sul TAB **"🗄️ Database"** nella barra di navigazione principale

## 📊 Cosa Visualizza

Il Database Inspector è **completamente automatico** e mostra **TUTTE le sezioni** del database **TRANNE il Budget** (righe 751-3733):

### ⚡ Caricamento Automatico

**Il sistema carica automaticamente ogni sezione presente in `database.json`**, incluse quelle aggiunte in futuro, senza bisogno di modifiche al codice!

### Sezioni Attualmente Disponibili:

1. **version, lastUpdate, description** → Metadata sistema
2. **mercatoEcografie** → 15 prestazioni ecografiche Italia (codici, U/B/D/P, % Extra-SSN)
3. **mercatoEcografi** → Tipologie dispositivi, proiezioni 2025-2035, parco installato
4. **regioniMondiali** → Moltiplicatori geografici (USA, Europa, Cina, Globale)
5. **moltiplicatoriRegionali** → Moltiplicatori alternativi per analisi
6. **prezziEcografieRegionalizzati** → Prezzi pubblico/privato con range regionali
7. **configurazioneTamSamSom** → Config TAM/SAM/SOM, prezzi medi, stime mercato
8. **revenueModel** → Modello ricavi completo (Hardware CapEx + SaaS ricorrente)
9. **contoEconomico** → P&L completo (ricavi, COGS, OPEX, ammortamenti, KPI)
10. **metadata** → Info versione, sorgenti, validazione
11. **materialiConsumabili** → Placeholder futuro

### 🆕 Nuove Sezioni

Quando aggiungi una nuova sezione al `database.json`:
- ✅ Appare **automaticamente** nel Database Inspector
- ✅ È immediatamente **navigabile e modificabile**
- ✅ Viene mostrata nella lista sezioni caricate
- ℹ️ Per descrizione/utilizzo personalizzati, aggiornare le mappe nel codice (opzionale)

## 🎨 Funzionalità Principali

### 🔍 Ricerca
- Digita nel campo di ricerca per filtrare dati
- Cerca per chiave o valore
- Risultati in tempo reale

### 📂 Navigazione
- Click su ▶️/▼ per espandere/collassare sezioni
- Pulsanti "Espandi"/"Collassa" per azioni bulk
- Struttura gerarchica ad albero

### ✏️ Modifica
1. Click sull'icona edit (✏️) accanto a un valore
2. Modifica nel campo JSON
3. Salva con ✅ o annulla con ❌

⚠️ **IMPORTANTE**: Le modifiche sono **temporanee** (solo per la sessione corrente)

### 📥 Esporta
- Click su "Esporta" per scaricare il database in JSON
- Include timestamp nel nome file
- Utile per backup e analisi

## 📍 Chi Usa Cosa

Il Database Inspector mostra per ogni sezione principale quali componenti la utilizzano:

| Sezione | Componenti |
|---------|-----------|
| mercatoEcografie | MercatoEcografie.tsx, MercatoEcografieRegionale.tsx |
| mercatoEcografi | MercatoEcografi.tsx, TamSamSomDashboard.tsx |
| regioniMondiali | MercatoEcografieRegionale.tsx |
| contoEconomico | IncomeStatementDashboard.tsx, FinancialStatements.tsx |
| metadata | Tutti i componenti |

## ⚡ Tips & Tricks

### Navigazione Efficiente
- Usa la ricerca per trovare rapidamente dati specifici
- Espandi solo le sezioni di interesse
- Usa "Collassa" prima di espandere una nuova sezione

### Debugging
- Verifica valori sospetti con la ricerca
- Controlla i contatori di elementi (badge con numeri)
- Usa i badge "type" per verificare tipi di dati corretti

### Backup
- Esporta regolarmente il database
- Confronta export per vedere modifiche

## ⚠️ Limitazioni

### Modifiche Non Permanenti
Le modifiche tramite interfaccia:
- ✅ Funzionano immediatamente
- ✅ Si vedono in altri componenti
- ❌ NON vengono salvate su disco
- ❌ Si perdono al refresh pagina

**Per modifiche permanenti**: modifica direttamente `/financial-dashboard/src/data/database.json`

### Budget Non Visibile
- La sezione "budget" è esclusa (troppo grande: ~3800 righe)
- Per vedere il budget usa il TAB "💰 Budget" dedicato

## 🐛 Problemi Comuni

### "Database non carica"
- Verifica che il file `database.json` esista
- Controlla la console del browser per errori
- Ricarica la pagina

### "Modifica non funziona"
- Verifica che il JSON sia valido (usa validatore online se necessario)
- Controlla che non ci siano virgole mancanti o extra
- Annulla e riprova

### "Performance lente"
- Collassa sezioni non utilizzate
- Usa la ricerca per filtrare
- Non espandere tutte le sezioni contemporaneamente

## 📚 Documentazione Completa

Per maggiori dettagli, consulta:
- **Documentazione completa**: `/MD_SVILUPPO/DATABASE_INSPECTOR_DOCUMENTAZIONE.md`
- **Codice sorgente**: `/financial-dashboard/src/components/DatabaseInspector.tsx`

## 🎓 Esempio d'Uso

### Scenario: Verificare percentuali Extra-SSN

1. Apri il Database Inspector
2. Cerca "Extra-SSN" nella barra di ricerca
3. Espandi "mercatoEcografie" → "italia" → "prestazioni"
4. Verifica i valori `percentualeExtraSSN` per ogni prestazione
5. Se necessario, modifica con l'icona edit
6. Salva ed esporta per backup

### Scenario: Controllare proiezioni mercato 2025

1. Cerca "2025" nella ricerca
2. Espandi "mercatoEcografi" → "numeroEcografi"
3. Verifica i valori `unita2025` per ogni mercato
4. Confronta con "valoreMercato" → "valore2025"

### Scenario: Verificare configurazione TAM/SAM/SOM

1. Cerca "configurazione"
2. Espandi "mercatoEcografi" → "configurazione"
3. Verifica:
   - `annoTarget`: 2033
   - `marketShare`: 1%
   - `scenarioParco`: "basso"
   - `regioniVisibili`
   - `tipologieTarget`

## 💡 Prossimi Sviluppi

- [ ] Salvataggio permanente modifiche
- [ ] Cronologia modifiche (undo/redo)
- [ ] Validazione schema automatica
- [ ] Visualizzatore budget ottimizzato
- [ ] Diff viewer tra versioni
- [ ] Export selettivo di sezioni

---

**Versione**: 1.0.0  
**Data**: 2025-10-11  
**Stato**: ✅ Pronto all'uso
