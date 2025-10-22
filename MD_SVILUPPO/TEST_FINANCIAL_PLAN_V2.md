# 🧪 TEST FINANCIAL PLAN V2 - GUIDA RAPIDA

## ✅ COSA ABBIAMO FATTO

### 1. Migrazione Database ✅ COMPLETATO
- ❌ Rimosso: `contoEconomico`
- ❌ Rimosso: `statoPatrimoniale`
- ✅ Aggiunto: `financialPlan` v2.0

### 2. UI Components Creati ✅ COMPLETATO
- ✅ `PhaseConfigPanel` - Configura fasi business
- ✅ `FundingRoundsPanel` - Configura funding rounds
- ✅ `FinancialPlanMasterV2` - Dashboard principale

---

## 🚀 COME TESTARE (3 STEP)

### STEP 1: Avvia Server (se non già fatto)

```bash
cd /Users/dracs/Documents/START_UP/DOC\ PROGETTI/DOC_ECO\ 3d\ Multisonda/__BP\ 2025/financial-dashboard

npm run dev:all
```

Aspetta che vedi:
```
[SERVER] 📡 Porta: 3001
[NEXT] ✓ Ready in 1270ms
```

---

### STEP 2: Apri Browser

Vai su: **http://localhost:3000/test-financial-plan**

---

### STEP 3: Testa le Funzionalità

#### A) Visualizza Fasi Business
- ✅ Dovresti vedere 3 fasi configurate
- ✅ Pre-Commerciale (2025-2028)
- ✅ Launch (2029-2030) con Revenue Start Q3 2029 ⭐
- ✅ Scaling (2031-2035)

#### B) Modifica una Fase
1. Clicca **"Modifica"** su una fase
2. Cambia date start/end
3. Cambia revenue start date (se abilitato)
4. Clicca **"Salva"**
5. Clicca **"Salva Tutte le Modifiche"** in fondo

#### C) Visualizza Funding Rounds
- ✅ Dovresti vedere 3 rounds:
  - Seed: €300K (Q1 2025)
  - Seed+: €650K (Q2 2026)
  - Series A: €2M (Q1 2028)
- ✅ Totale: €2.95M

#### D) Modifica un Round
1. Clicca **"Modifica"** su un round
2. Cambia data (es. da Q1 2025 a Q2 2025)
3. Cambia importo (es. da 300000 a 350000)
4. Clicca **"Salva"**
5. Clicca **"Salva Tutte le Modifiche"**

---

## 📸 SCREENSHOT ATTESI

### Executive Summary (in alto)
```
┌─────────────────────────────────────────────────┐
│ Fasi Business: 3                                │
│ Funding Totale: €2950K                          │
│ Rounds: 3                                       │
│ Revenue Start: 2029-Q3                          │
└─────────────────────────────────────────────────┘
```

### Phase Config Panel
```
┌─────────────────────────────────────────────────┐
│ [1] Pre-Commerciale                             │
│     Inizio: 2025-01                             │
│     Fine: 2028-12                               │
│     Durata: 48 mesi                             │
│     [❌] Revenue Abilitato                      │
│                                                 │
│ [2] Lancio Commerciale                          │
│     Inizio: 2029-01                             │
│     Fine: 2030-12                               │
│     Durata: 24 mesi                             │
│     [✅] Revenue Abilitato                      │
│     ⭐ Revenue Start Date: 2029-Q3              │
└─────────────────────────────────────────────────┘
```

### Funding Rounds Panel
```
┌─────────────────────────────────────────────────┐
│ [1] Seed                                        │
│     Data: 2025-Q1                               │
│     Importo: €300,000                           │
│     Use of Funds:                               │
│       • R&D: 40% (€120k)                        │
│       • Team: 30% (€90k)                        │
│       • Marketing: 20% (€60k)                   │
│       • Operations: 10% (€30k)                  │
└─────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST TEST

- [ ] Server avviato correttamente (3001 + 3000)
- [ ] Pagina si apre senza errori
- [ ] Vedo 3 fasi business
- [ ] Vedo 3 funding rounds
- [ ] Vedo revenue start date Q3 2029
- [ ] Posso modificare date fasi
- [ ] Posso modificare revenue start date
- [ ] Posso modificare importi funding
- [ ] Posso salvare modifiche
- [ ] Toast di conferma appare dopo salvataggio
- [ ] Ricaricando la pagina, modifiche sono persistite

---

## 🐛 PROBLEMI COMUNI

### Errore: "FinancialPlan non trovato"

**Causa:** Migrazione non eseguita o database non aggiornato

**Soluzione:**
```bash
npm run migrate:financial-plan
# poi riavvia server
npm run dev:all
```

### Errore: "Cannot connect to server"

**Causa:** Server Express non avviato

**Soluzione:**
```bash
# Verifica che il server sia su porta 3001
curl http://localhost:3001/api/database
# Se non risponde, riavvia
npm run dev:all
```

### Modifiche non salvate

**Causa:** Dimenticato di cliccare "Salva Tutte le Modifiche"

**Soluzione:** Dopo ogni modifica, clicca il pulsante verde in fondo alla pagina

---

## 🎯 PROSSIMI STEP (dopo test OK)

1. ✅ Test configurazione fasi
2. ✅ Test configurazione funding
3. ⏭️ Implementare calcoli automatici
4. ⏭️ Aggiungere grafici (waterfall, gauge)
5. ⏭️ Integrare con MasterDashboard

---

## 📝 NOTE TECNICHE

### Struttura Files

```
/src/
  /components/
    /FinancialPlanV2/
      PhaseConfigPanel.tsx          ← Pannello fasi
      FundingRoundsPanel.tsx        ← Pannello funding
      FinancialPlanMasterV2.tsx     ← Container principale
      
  /app/
    /test-financial-plan/
      page.tsx                      ← Pagina test
      
  /types/
    financialPlan.types.ts          ← TypeScript types
    
  /services/
    /financialPlan/
      dataIntegration.ts            ← Lettura dati
      calculations.ts               ← Engine calcoli
```

### API Calls

Il component fa:
1. **GET** `/api/database` - Carica tutto il database
2. **PUT** `/api/database` - Salva tutto il database (con financialPlan aggiornato)

### State Management

- `useState` per local state
- `useEffect` per caricamento iniziale
- `toast` per notifiche utente

---

## 🎉 SUCCESSO!

Se vedi i panel e puoi modificare i valori, **FASE 2 COMPLETATA!** 🚀

Prossimo: Implementare calcoli e grafici! 📊
