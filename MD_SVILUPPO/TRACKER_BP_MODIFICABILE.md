# ✏️ Tracker Business Plan - Percentuali Modificabili

## 🎯 Obiettivo

Rendere il **Tracker stato BP** completamente **modificabile** dall'utente, trasformandolo in uno strumento operativo per trackare il progresso reale del documento.

---

## ✅ Implementazione Completata

### 1️⃣ **Database Structure**

Aggiunta sezione `businessPlan` in `database.json`:

```json
{
  "configurazioneTamSamSom": {
    "ecografie": {...},
    "ecografi": {...},
    "businessPlan": {
      "sectionProgress": {
        "executive-summary": 50,
        "proposta-valore": 90,
        "mercato": 75,
        "competizione": 90,
        "modello-business": 70,
        "gtm": 80,
        "regolatorio": 85,
        "roadmap-prodotto": 85,
        "operazioni": 80,
        "team": 90,
        "rischi": 95,
        "piano-finanziario": 95
      },
      "lastUpdate": "2025-10-10T15:00:00.000Z"
    }
  }
}
```

**Struttura**:
- `sectionProgress`: Record<string, number> - Map sezione → percentuale
- `lastUpdate`: ISO timestamp ultimo aggiornamento

---

### 2️⃣ **API Endpoint**

**File**: `server.js`

```javascript
/**
 * PATCH /api/database/business-plan/progress
 * Aggiorna percentuale completamento sezione Business Plan
 */
app.patch('/api/database/business-plan/progress', async (req, res) => {
  const { sectionId, progress } = req.body;
  
  // Validazione: progress tra 0 e 100
  // Inizializza struttura se non esiste
  // Aggiorna database
  // Salva su disco
});
```

**Validazione**:
- ✅ `sectionId` (string) richiesto
- ✅ `progress` (number) richiesto, range 0-100
- ✅ Inizializzazione automatica struttura
- ✅ Auto-save su file

---

### 3️⃣ **Database Context**

**File**: `DatabaseProvider.tsx`

#### Tipo TypeScript aggiunto:

```typescript
interface Database {
  // ... altri campi
  configurazioneTamSamSom?: {
    ecografie: ConfigurazioneTamSamSomEcografie;
    ecografi: ConfigurazioneTamSamSomEcografi;
    businessPlan?: {
      sectionProgress: Record<string, number>;
      lastUpdate: string;
    };
  };
}
```

#### Funzione Update:

```typescript
const updateBusinessPlanProgress = useCallback(async (
  sectionId: string, 
  progress: number
) => {
  const response = await fetch(
    `${API_BASE_URL}/database/business-plan/progress`,
    {
      method: 'PATCH',
      body: JSON.stringify({ sectionId, progress })
    }
  );
  
  // ⚡ UPDATE OTTIMISTICO: aggiorna stato locale
  setData(prevData => ({
    ...prevData,
    configurazioneTamSamSom: {
      ...prevData.configurazioneTamSamSom,
      businessPlan: {
        sectionProgress: {
          ...prevData.configurazioneTamSamSom.businessPlan.sectionProgress,
          [sectionId]: progress
        },
        lastUpdate: new Date().toISOString()
      }
    }
  }));
}, []);
```

**Export**:
```typescript
interface DatabaseContextValue {
  // ... altri campi
  updateBusinessPlanProgress: (sectionId: string, progress: number) => Promise<void>;
}
```

---

### 4️⃣ **UI Component - BusinessPlanView**

**File**: `BusinessPlanView.tsx`

#### Hook e State:

```typescript
export function BusinessPlanView() {
  const { data, updateBusinessPlanProgress } = useDatabase();
  const [editingProgress, setEditingProgress] = useState<{ 
    id: string; 
    value: string 
  } | null>(null);
  
  // Carica progress da database
  const sectionProgress = data?.configurazioneTamSamSom?.businessPlan?.sectionProgress || {};
  
  // Calcola media automatica
  const averageProgress = useMemo(() => {
    const values = Object.values(sectionProgress);
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }, [sectionProgress]);
```

#### UI Modificabile:

```tsx
{sections.map((section, idx) => {
  const progress = sectionProgress[section.id] || 0;
  const isEditing = editingProgress?.id === section.id;
  
  return (
    <div key={section.id}>
      <div className="flex justify-between mb-1">
        {/* Titolo sezione - cliccabile per navigare */}
        <button onClick={() => scrollToSection(section.id)}>
          {idx + 1}. {section.name}
        </button>
        
        {/* Percentuale - MODIFICABILE */}
        {isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            value={editingProgress.value}
            onChange={(e) => setEditingProgress({ id: section.id, value: e.target.value })}
            onBlur={async () => {
              const newProgress = parseInt(editingProgress.value);
              if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                await updateBusinessPlanProgress(section.id, newProgress);
              }
              setEditingProgress(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Salva e chiudi
              } else if (e.key === 'Escape') {
                // Annulla
              }
            }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingProgress({ 
              id: section.id, 
              value: progress.toString() 
            })}
            title="Click per modificare"
          >
            {progress}%
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-full rounded-full ${
            progress >= 85 ? 'bg-green-500' : 
            progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
})}
```

---

## 🎨 Features UI

### Click-to-Edit
1. **Visualizzazione**: Percentuale mostrata come button con hover underline
2. **Click**: Trasforma in input field
3. **Input**: Campo numerico 0-100
4. **Enter**: Salva e chiudi
5. **Escape**: Annulla modifiche
6. **Blur**: Salva automaticamente

### Visual Feedback

**Badge Dinamici**:
```tsx
<div className="flex gap-2">
  {/* Sezioni espanse */}
  <div className="badge border-blue-400">
    {sections.filter(s => collapsedSections[s.id] === false).length} / {sections.length} espanse
  </div>
  
  {/* Completamento medio */}
  <div className="badge border-green-400">
    {averageProgress}% completato
  </div>
</div>
```

**Progress Bar Colori**:
- 🟢 **Verde** (≥85%): Completato
- 🔵 **Blu** (70-84%): In progress
- 🟡 **Giallo** (<70%): Da rivedere

**Legenda Automatica**:
```tsx
<div className="flex gap-4">
  <div>🟢 ≥85% Completato ({count1})</div>
  <div>🔵 70-84% In Progress ({count2})</div>
  <div>🟡 <70% Da Rivedere ({count3})</div>
</div>
```

Conteggi aggiornati dinamicamente:
```typescript
Object.values(sectionProgress).filter(p => p >= 85).length
Object.values(sectionProgress).filter(p => p >= 70 && p < 85).length
Object.values(sectionProgress).filter(p => p < 70).length
```

---

## 📊 Flusso Dati

```
USER INTERACTION
    ↓
Click su percentuale
    ↓
setEditingProgress({ id, value })
    ↓
Modifica valore
    ↓
Enter / Blur
    ↓
updateBusinessPlanProgress(sectionId, progress)
    ↓
API CALL: PATCH /api/database/business-plan/progress
    ↓
Server valida & salva database.json
    ↓
Response Success
    ↓
⚡ UPDATE OTTIMISTICO: aggiorna stato locale
    ↓
UI re-render con nuovo valore
    ↓
Badge e conteggi aggiornati automaticamente
```

---

## 🔧 Come Usare

### 1. Avvia Server Backend
```bash
cd financial-dashboard
node server.js
# Server su http://localhost:3001
```

### 2. Avvia Dev Server
```bash
npm run dev
# App su http://localhost:3000
```

### 3. Naviga al Business Plan
- Dashboard → Tab "Business Plan"
- Trovi il **Tracker stato BP** in alto

### 4. Modifica Percentuali
1. **Click** sulla percentuale (es: "50%")
2. **Digita** nuovo valore (es: "75")
3. **Enter** per salvare (o click fuori)
4. **Escape** per annullare

### 5. Verifica Salvataggio
- Badge "X% completato" aggiorna automaticamente
- Conteggi legenda aggiornati
- Check console: `✅ Progress Business Plan aggiornato: executive-summary → 75%`
- Verifica file: `src/data/database.json`

---

## 📁 File Modificati

| File | Modifiche |
|------|-----------|
| `database.json` | Aggiunta sezione `businessPlan` |
| `server.js` | Endpoint PATCH `/api/database/business-plan/progress` |
| `DatabaseProvider.tsx` | Funzione `updateBusinessPlanProgress` + tipo TS |
| `BusinessPlanView.tsx` | UI modificabile con click-to-edit |

---

## ✅ Validazioni

### Client-side:
- ✅ Valore numerico (parseInt)
- ✅ Range 0-100
- ✅ NaN check

### Server-side:
- ✅ `sectionId` required (string)
- ✅ `progress` required (number)
- ✅ Range 0-100
- ✅ Type validation

### Database:
- ✅ Auto-inizializzazione struttura
- ✅ Update timestamp automatico
- ✅ Atomic write su file

---

## 🎯 Valori Iniziali

Le 12 sezioni partono con questi valori (modificabili):

```typescript
{
  "executive-summary": 50,     // 🟡 Da rivedere
  "proposta-valore": 90,       // 🟢 Completato
  "mercato": 75,               // 🔵 In progress
  "competizione": 90,          // 🟢 Completato
  "modello-business": 70,      // 🔵 In progress
  "gtm": 80,                   // 🔵 In progress
  "regolatorio": 85,           // 🟢 Completato
  "roadmap-prodotto": 85,      // 🟢 Completato
  "operazioni": 80,            // 🔵 In progress
  "team": 90,                  // 🟢 Completato
  "rischi": 95,                // 🟢 Completato
  "piano-finanziario": 95      // 🟢 Completato
}
```

**Media iniziale**: 83%

---

## 🚀 Prossimi Miglioramenti (Opzionali)

### 1. Slider UI
Invece di input numerico, usa slider:
```tsx
<input 
  type="range" 
  min="0" 
  max="100" 
  value={progress}
  onChange={(e) => updateBusinessPlanProgress(section.id, parseInt(e.target.value))}
/>
```

### 2. Debounce Auto-save
Evita troppe chiamate API:
```typescript
const debouncedUpdate = useMemo(
  () => debounce((id, val) => updateBusinessPlanProgress(id, val), 1000),
  []
);
```

### 3. Progress History
Trackare lo storico modifiche:
```json
{
  "history": [
    { "date": "2025-10-10", "sectionId": "executive-summary", "progress": 50 },
    { "date": "2025-10-11", "sectionId": "executive-summary", "progress": 75 }
  ]
}
```

### 4. Target Goals
Impostare obiettivi per sezione:
```json
{
  "sectionProgress": { "executive-summary": 50 },
  "sectionTargets": { "executive-summary": 100 },
  "sectionDeadlines": { "executive-summary": "2025-10-15" }
}
```

### 5. Export Progress
Esportare report progresso:
- PDF con grafici
- Excel con storico
- JSON per integrazione esterna

---

## 🐛 Troubleshooting

### Modifiche non salvate?
1. Verifica server backend attivo: `http://localhost:3001`
2. Check console browser: cercar errori API
3. Verifica file `database.json` permessi scrittura

### Percentuale non aggiorna?
1. Controlla update ottimistico in `DatabaseProvider`
2. Verifica `data` object nel context
3. Force refresh browser (Cmd+Shift+R)

### Build fallisce?
```bash
# Verifica TypeScript
npm run type-check

# Clean build
rm -rf .next
npm run build
```

---

## 📝 Riepilogo

✅ **Database**: Struttura `businessPlan` aggiunta  
✅ **API**: Endpoint PATCH per aggiornamenti  
✅ **Context**: Funzione `updateBusinessPlanProgress`  
✅ **UI**: Click-to-edit con input field  
✅ **UX**: Visual feedback immediato  
✅ **Validazione**: Client + Server side  
✅ **Auto-save**: Persistenza automatica  
✅ **Calcoli**: Media e conteggi dinamici  

**Il Tracker ora è uno strumento operativo completo!** 🎉
