# 🚀 Migrazione Database → FinancialPlan v2.0

## 📋 Cosa fa questo script

Lo script `migrateToFinancialPlanV2.ts` trasforma il database da struttura **vecchia** (statica) a **nuova** (phase-based con calcoli automatici).

### Cambiamenti

**RIMUOVE:**
- ❌ `contoEconomico` (dati statici hardcoded)
- ❌ `statoPatrimoniale` (dati statici hardcoded)

**AGGIUNGE:**
- ✅ `financialPlan` v2.0 (phase-based, calcoli automatici)

---

## 🎯 Struttura FinancialPlan v2.0

```json
{
  "financialPlan": {
    "configuration": {
      "businessPhases": [...],      // ← MODIFICABILE dall'utente
      "fundingRounds": [...],        // ← MODIFICABILE dall'utente
      "dataIntegration": {...},      // ← Mapping sorgenti dati
      "assumptions": {...}           // ← Parametri calcoli
    },
    
    "calculations": {
      "monthly": [],    // ← OUTPUT (120 mesi)
      "annual": [],     // ← OUTPUT (10 anni)
      "breakEven": {},  // ← OUTPUT automatico
      "metrics": {}     // ← OUTPUT (runway, burn, etc)
    }
  }
}
```

### Caratteristiche Chiave

1. **Phase-Based:**
   - Pre-Commerciale (2025-2028): NO revenue
   - Launch (2029-2030): revenue start Q3 2029
   - Scaling (2031-2035): espansione

2. **Revenue Start Date:**
   - Configurabile! (default: Q3 2029)
   - I ricavi iniziano SOLO dopo questa data

3. **Funding Rounds:**
   - Seed: €300K (Q1 2025)
   - Seed+: €650K (Q2 2026)
   - Series A: €2M (Q1 2028)
   - Tutti MODIFICABILI (date + importi)

4. **Data Integration:**
   - Legge da `revenueModel` (prezzi)
   - Legge da `goToMarket` (vendite)
   - Legge da `budget` (costi)
   - Legge da `configurazioneTamSamSom` (mercato)

5. **Calcoli Automatici:**
   - 120 mesi (10 anni)
   - Break-even automatico
   - Runway dinamico
   - Metriche LTV/CAC

---

## 🏃 Come Eseguire

### Prerequisiti

```bash
# Assicurati di avere tsx installato
npm install -g tsx
# oppure usa quello nel progetto
```

### Esecuzione

```bash
# Metodo 1: npm script (raccomandato)
npm run migrate:financial-plan

# Metodo 2: diretto con tsx
npx tsx scripts/migrateToFinancialPlanV2.ts

# Metodo 3: con node (se compilato)
node scripts/migrateToFinancialPlanV2.js
```

### Output Atteso

```
🚀 Inizio migrazione Database → FinancialPlan v2.0

📖 Leggo database corrente...
✅ Database letto: 1234.5 KB

🔍 Analisi sezioni esistenti:
   - contoEconomico: ✅ presente (verrà rimosso)
   - statoPatrimoniale: ✅ presente (verrà rimosso)
   - financialPlan: ❌ assente

🗑️  Rimosso: contoEconomico
🗑️  Rimosso: statoPatrimoniale
✨ Aggiunto: financialPlan v2.0

📊 Nuovo database: 1235.0 KB
✅ Validazione JSON: OK

💾 Database salvato con successo!
   (Backup automatico creato via server.js)

✅ MIGRAZIONE COMPLETATA!

📋 Struttura financialPlan v2.0:
   - 3 fasi business configurate
   - 3 funding rounds definiti
   - €2950K capitale totale pianificato
   - 3 sorgenti dati integrate

🎯 Prossimi step: Implementare FinancialCalculator per popolare calculations[]
```

---

## 🛡️ Sicurezza

### Backup Automatico

Il database viene **SEMPRE** salvato con backup automatico grazie a `server.js`:

```
/src/data/
  ├─ database.json                    ← Versione corrente
  └─ backups/
      ├─ database_2025-10-21T15-10-00.json
      ├─ database_2025-10-21T15-15-00.json
      └─ ...
```

### Validazione Pre-Save

Lo script verifica:
- ✅ JSON valido
- ✅ Dimensione minima
- ✅ Struttura corretta

### Rollback

Se qualcosa va storto:

```bash
# 1. Trova ultimo backup
ls -lah src/data/backups/

# 2. Ripristina
cp src/data/backups/database_TIMESTAMP.json src/data/database.json
```

---

## 🧪 Test Migrazione

Dopo la migrazione, verifica:

```bash
# 1. Controlla struttura
cat src/data/database.json | grep -A 5 "financialPlan"

# 2. Verifica rimozione vecchie sezioni
cat src/data/database.json | grep "contoEconomico"
# (dovrebbe essere vuoto)

# 3. Conta fasi
cat src/data/database.json | grep -c "businessPhases"
# (dovrebbe essere 1)

# 4. Conta funding rounds
cat src/data/database.json | grep -c "fundingRounds"
# (dovrebbe essere 1)
```

---

## 📝 Configurazione Post-Migrazione

Dopo la migrazione, puoi modificare:

### 1. Date Fasi

```json
{
  "businessPhases": [
    {
      "id": "pre_commercial",
      "startDate": "2025-01",  // ← MODIFICA QUI
      "endDate": "2028-12",     // ← MODIFICA QUI
      ...
    }
  ]
}
```

### 2. Revenue Start Date

```json
{
  "id": "launch",
  "revenueStartDate": "2029-Q3"  // ← MODIFICA QUI (Q1/Q2/Q3/Q4)
}
```

### 3. Funding Rounds

```json
{
  "fundingRounds": [
    {
      "id": "seed_2025",
      "date": "2025-Q1",        // ← MODIFICA QUI
      "amount": 300000,         // ← MODIFICA QUI (in €)
      ...
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Errore: Database troppo piccolo

**Causa:** Il database corrente è corrotto o vuoto.

**Soluzione:**
```bash
# Ripristina da backup
cp src/data/backups/database_LAST_GOOD.json src/data/database.json
```

### Errore: Permessi negati

**Causa:** Lo script non ha permessi di scrittura.

**Soluzione:**
```bash
chmod +w src/data/database.json
```

### Errore: JSON invalido

**Causa:** Il database ha sintassi JSON non valida.

**Soluzione:**
1. Ripristina backup
2. Oppure usa un JSON validator per identificare il problema

---

## ✅ Checklist Post-Migrazione

- [ ] Migrazione completata senza errori
- [ ] Backup creato automaticamente
- [ ] `financialPlan` presente nel database
- [ ] `contoEconomico` rimosso
- [ ] `statoPatrimoniale` rimosso
- [ ] 3 fasi business configurate
- [ ] 3 funding rounds definiti
- [ ] Server Express funzionante
- [ ] Pronto per implementare UI components

---

## 🎯 Prossimi Step

1. ✅ **FATTO:** Migrazione database
2. ⏭️ **TODO:** Implementare UI Configuration Panels
3. ⏭️ **TODO:** Testare calcoli con dati reali
4. ⏭️ **TODO:** Creare visualizzazioni (Waterfall, Gauge)
5. ⏭️ **TODO:** Integrare con MasterDashboard

---

## 📞 Support

In caso di problemi:
1. Controlla i backup in `src/data/backups/`
2. Verifica i log dello script
3. Testa con database ridotto
4. Ripristina da backup se necessario

**IMPORTANTE:** Non eliminare mai i backup manualmente!
