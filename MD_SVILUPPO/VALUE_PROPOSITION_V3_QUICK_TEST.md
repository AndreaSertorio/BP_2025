# ⚡ VALUE PROPOSITION V3 - QUICK TEST GUIDE

**5 minuti per verificare tutto**

---

## 🚀 START SERVER

```bash
cd financial-dashboard
npm run dev:all
```

Attendi che appaia:
```
[SERVER] ✓ Server ready
[NEXT] ✓ Ready in 1.3s
```

---

## ✅ TEST 1: TOAST NOTIFICATIONS (2 min)

### Test Success Toast
1. Apri: http://localhost:3000
2. Tab: **Value Proposition** → Canvas Visuale
3. Click su un job description → modifica testo
4. Attendi 2 secondi
5. **✅ Vedi toast verde "Salvato con successo!"** in alto a destra

### Test Error Toast
1. **Stoppa il server** (Ctrl+C nel terminal)
2. Prova a editare un campo
3. **✅ Vedi toast rosso "Errore salvataggio. Riprova."**
4. **Riavvia server:** `npm run dev:all`

**Result:** Toast system funziona! ✅

---

## ✅ TEST 2: CREATE API (2 min)

### Test con Browser Console

1. Apri DevTools (F12) → Console tab
2. Paste questo codice:

```javascript
// CREATE JOB
fetch('http://localhost:3001/api/value-proposition/customer-profile/job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: "TEST JOB - Verificare funzionalità 3D",
    category: "functional",
    importance: 4,
    difficulty: 3
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ Job creato:', data))
  .catch(err => console.error('❌ Error:', err));
```

3. **✅ Vedi nel console:** `✅ Job creato: {success: true, job: {...}}`
4. Refresh pagina (F5)
5. **✅ Vedi il nuovo job nella lista!**

### Test con curl (optional)

```bash
# Terminal
curl -X POST http://localhost:3001/api/value-proposition/customer-profile/job \
  -H "Content-Type: application/json" \
  -d '{
    "description": "TEST JOB via curl",
    "category": "functional",
    "importance": 5
  }'
```

**Result:** CREATE API funziona! ✅

---

## ✅ TEST 3: DELETE API (1 min)

### Get Job ID
1. Browser → DevTools Console
2. Paste:

```javascript
// Trova ID del test job
fetch('http://localhost:3001/api/database')
  .then(r => r.json())
  .then(data => {
    const jobs = data.valueProposition.customerProfile.segments[0].jobs;
    console.log('Jobs disponibili:', jobs.map(j => ({ id: j.id, desc: j.description })));
  });
```

3. Copia un ID (es. `job_1729095234567`)

### Delete Job

```javascript
// Sostituisci JOB_ID_HERE con l'ID copiato
fetch('http://localhost:3001/api/value-proposition/customer-profile/job/JOB_ID_HERE', {
  method: 'DELETE'
})
  .then(r => r.json())
  .then(data => console.log('✅ Job eliminato:', data))
  .catch(err => console.error('❌ Error:', err));
```

4. **✅ Vedi nel console:** `✅ Job eliminato: {success: true}`
5. Refresh pagina (F5)
6. **✅ Job non più nella lista!**

**Result:** DELETE API funziona! ✅

---

## 📊 CHECKLIST RAPIDA

Dopo aver fatto i test, compila:

```
✅ TEST 1: Toast Notifications
  ✅ Success toast (verde) appare su save
  ✅ Error toast (rosso) appare su network error
  
✅ TEST 2: CREATE API
  ✅ POST /job crea nuovo job
  ✅ Nuovo job appare nella lista
  ✅ ID generato correttamente
  ✅ Defaults applicati (importance = 3)
  
✅ TEST 3: DELETE API
  ✅ DELETE /job/:id elimina job
  ✅ Job rimosso dalla lista
  ✅ Database aggiornato

---
TUTTI I TEST: [✅ PASS] / [❌ FAIL]
```

---

## 🐛 SE QUALCOSA NON FUNZIONA

### Toast non appare
**Check:**
1. Browser console → errori JavaScript?
2. Toast position "top-right" visibile?
3. z-index issues? (inspect with DevTools)

**Fix:** Verifica `ToastProvider` in `layout.tsx`

### CREATE API fallisce
**Check:**
1. Server running? (`http://localhost:3001/api/database` risponde?)
2. Body JSON valido?
3. Headers corretti?

**Debug:** Check server console per errori

### DELETE API fallisce
**Check:**
1. Job ID corretto? (case-sensitive)
2. Job esiste nel database?
3. Active segment correct?

**Debug:** Verifica database.json structure

---

## 💡 TESTING AVANZATO

### Test con Postman/Insomnia

**Collection:**
```
POST http://localhost:3001/api/value-proposition/customer-profile/job
{
  "description": "Test job",
  "category": "functional",
  "importance": 4
}

POST http://localhost:3001/api/value-proposition/customer-profile/pain
{
  "description": "Test pain",
  "category": "functional",
  "severity": 5
}

POST http://localhost:3001/api/value-proposition/customer-profile/gain
{
  "description": "Test gain",
  "category": "functional",
  "desirability": 5
}

DELETE http://localhost:3001/api/value-proposition/customer-profile/job/[ID]
DELETE http://localhost:3001/api/value-proposition/customer-profile/pain/[ID]
DELETE http://localhost:3001/api/value-proposition/customer-profile/gain/[ID]
```

---

## 🎯 EXPECTED RESULTS

### All Tests Pass ✅
- **Toast:** Green success, red error
- **CREATE:** New items appear in list
- **DELETE:** Items removed from list
- **Database:** Changes persist after refresh

### Ready for Next Step 🚀
- ✅ Canvas Integration (add buttons in UI)
- ✅ Modal wiring
- ✅ User testing
- ✅ ROI Calculator

---

**⏱️ TOTAL TIME: 5 minutes**

*Quick test completed!*
