# 🎯 MASTER GUIDE - Team & Project Management ECO 3D

**Versione:** 3.0 DEFINITIVA  
**Data:** 15 Ottobre 2025  
**Status:** 📋 ORGANIZZAZIONE COMPLETA E CHIARA

---

## 🧭 INDICE RAPIDO

1. [Architettura Sistema](#architettura)
2. [Moduli per Categoria](#moduli)
3. [Differenze Chiave](#differenze)
4. [Roadmap Implementazione](#roadmap)
5. [Priorità & Dipendenze](#priorita)
6. [Quick Reference](#reference)

---

## 📐 ARCHITETTURA SISTEMA {#architettura}

### **Livello 1: STRUTTURE (Foundation)**
```
OBS → Organizational Breakdown (organigramma)
PBS → Product Breakdown (prodotto)
WBS → Work Breakdown (progetto)
RBS → Resource Breakdown (risorse)
CBS → Cost Breakdown (costi)
```

### **Livello 2: COLLEGAMENTI (Bridges)**
```
RAM = WBS × OBS Matrix (chi fa cosa)
PBS↔WBS = Tracciabilità (prodotto→lavoro)
WBS↔CBS = Budget allocation
RBS→WBS = Resource assignment
```

### **Livello 3: GOVERNANCE (Rules)**
```
RACI/RASCI → Ruoli su task
DoA → Delegation of Authority
Decision Log → DACI/RAPID/MOCHA
Role Charter → Schede ruolo
```

### **Livello 4: TRACKING (Monitor)**
```
OKR → Objectives & Key Results
RAID → Risks/Assumptions/Issues/Dependencies
Gantt+CPM → Timeline e critical path
Budget vs Actual → Controllo costi
```

---

## 📦 MODULI PER CATEGORIA {#moduli}

### **A) STRUMENTI ORGANIZZATIVI** 🏢

#### **A1. OBS - Organizational Breakdown Structure** ⭐ FOUNDATION
**Cosa:** Albero gerarchico unità organizzative  
**Campi:** `obs_id`, `parent_id`, `nome`, `responsabile`, `ruoli[]`, `attivo`  
**Output:** Org chart, funzionigramma, permessi  
**UI:** Tree collapsible, drag&drop, badge ruoli  
**Stato:** ⚠️ **PARZIALE** - Abbiamo Org Chart ma manca struttura obs_id gerarchica  

**Esempio Eco 3D:**
```
ROOT
├── Leadership
│   ├── CEO (Andrea Sertorio)
│   ├── COO (Miriam Cultrera)
│   ├── CTO (Enrico Fermi)
│   └── CFO (Filippo Sertorio)
├── QA/RA (PRRC esterno)
├── DPO (Data Protection)
└── Clinical Affairs (PI, Sub-I)
```

---

#### **A2. PBS - Product Breakdown Structure** 📦 OPTIONAL
**Cosa:** Scomposizione prodotto Eco 3D in moduli  
**Campi:** `pbs_id`, `parent_id`, `nome`, `descrizione`, `owner_obs_id`  
**Output:** Tracciabilità PBS↔WBS  
**Stato:** ❌ **MANCANTE**  

**Esempio Eco 3D:**
```
Eco 3D Device
├── 1.1 Hardware (trasduttore, elettronica, case)
├── 1.2 Firmware (controllo, drivers)
├── 1.3 Software App (GUI, ricostruzione 3D)
├── 1.4 Cloud & AI (upload, inferenza, storage)
├── 1.5 Documentazione regolatoria
└── 1.6 Produzione pilota
```

---

#### **A3. RBS - Resource Breakdown Structure** 🔧
**Cosa:** Tassonomia risorse  
**Campi:** `rbs_id`, `tipo` (human/equipment/software/service/site), `tag_competenze[]`, `costo_unit`  
**Output:** Capacità, procurement  
**Stato:** ❌ **MANCANTE**  

---

#### **A4. CBS - Cost Breakdown Structure** 💰
**Cosa:** Tassonomia costi  
**Campi:** `cbs_id`, `categoria`, `sotto_categoria`, `budget_annuale`  
**Output:** Mapping su WBS/OKR, investor deck  
**Stato:** ❌ **MANCANTE**  

---

### **B) STRUMENTI OPERATIVI DI PROGETTO** 🚀

#### **B1. WBS - Work Breakdown Structure** ⭐⭐⭐ CRITICO
**Cosa:** Albero gerarchico lavori/deliverable  
**Campi:** `wbs_id`, `parent_id`, `nome`, `deliverable`, `criteri_accettazione`, `stima_rom`, `stima_3punti{O,M,P}`, `baseline_cost`, `baseline_durata`, `dipendenze[]`  
**Output:** Gantt/CPM, consuntivi, tracciabilità PBS  
**UI:** Tree + Gantt inline, modale stime, badge critical path  
**Stato:** ❌ **MANCANTE - PRIORITÀ #1**  

**Esempio Eco 3D:**
```
1.0 MVP Tecnico
├── 1.1 Prototipo HW V1
├── 1.2 Firmware V1
└── 1.3 App SW V1
2.0 Validazione
├── 2.1 Test laboratorio
├── 2.2 Usabilità 62366
└── 2.3 Dossier tecnico
3.0 Clinica
├── 3.1 Protocollo + EC submission
└── 3.2 Raccolta dati pilota
```

---

#### **B2. RAM - Responsibility Assignment Matrix** ⭐⭐⭐ CRITICO
**Cosa:** Matrice WBS×OBS con RACI  
**Campi:** `wbs_id`, `obs_id`, `ruolo` (R/A/C/I/S)  
**Output:** Chiarezza responsabilità, carico risorse  
**UI:** Griglia cliccabile, validazione (1 A, ≥1 R), contatori colonna  
**Stato:** ⚠️ **PARZIALE** - Abbiamo RACI standalone, serve integrazione WBS×OBS  

**Esempio RAM Eco 3D:**

| WBS | CEO | CTO | COO | QA/RA | Clinical | CFO |
|-----|-----|-----|-----|-------|----------|-----|
| 1.1 Prototipo HW V1 | I | **A/R** | C | C | I | I |
| 1.3 App SW V1 | I | **A** | C | C | C | I |
| 2.2 Usabilità 62366 | I | C | **A/R** | C | C | I |
| 3.1 EC Submission | I | C | **A** | **R** | C | I |

**Regola:** 1 solo A per riga, ≥1 R  

---

#### **B3. RACI/RASCI** ✅ GIÀ IMPLEMENTATO (standalone)
**Cosa:** Schema ruoli su task  
**Campi:** `entità`, `ruolo`, `marcatura` (R/A/C/I/S)  
**Stato:** ✅ **IMPLEMENTATO** in RACIMatrix.tsx  
**Nota:** È standalone, da integrare in RAM  

---

#### **B4. Decision Log - DACI/RAPID/MOCHA/DRI** ⭐⭐ IMPORTANTE
**Cosa:** Framework decisioni  
**Campi:** `decision_id`, `titolo`, `contesto`, `opzioni[]`, `framework`, `driver`, `approver`, `contributors[]`, `informed[]`, `esito`, `data`  
**Output:** Decision Log e audit trail  
**Stato:** ❌ **MANCANTE - PRIORITÀ #4**  

**Framework:**
- **DACI:** Driver, Approver, Contributors, Informed
- **RAPID:** Recommend, Agree, Perform, Input, Decide
- **MOCHA:** Manager, Owner, Consulted, Helper, Approver
- **DRI:** Directly Responsible Individual (unico owner)

---

#### **B5. ROM - Rough Order of Magnitude** 📊
**Cosa:** Stime di massima (±25%/75%)  
**Campi:** `voce`, `range_basso`, `range_alto`, `ipotesi`, `fonte`, `ultima_revisione`  
**UI:** Slider range, badge ROM vs Definitive  
**Stato:** ❌ **MANCANTE**  

**Esempio:** App SW V1: €60K–€90K; 10–16 settimane  

---

#### **B6. PERT - Stima 3 punti** 📐
**Cosa:** Stime O/M/P con formula E=(O+4M+P)/6  
**Campi:** `O`, `M`, `P`, `E`, `σ`  
**Output:** Durata attesa e rischio  
**Stato:** ❌ **MANCANTE**  

**Esempio:** App SW V1: O=10w, M=12w, P=16w → E=12.3w  

---

#### **B7. Gantt + CPM** 📅
**Cosa:** Timeline e critical path  
**Campi:** `attività`, `durata`, `dipendenze`, `early/late_dates`, `float`  
**Automazioni:** Alert ritardi critical path  
**Stato:** ❌ **MANCANTE**  

---

#### **B8. RAID Log** ✅ GIÀ IMPLEMENTATO
**Cosa:** Risks, Assumptions, Issues, Dependencies  
**Campi:** `tipo`, `titolo`, `descrizione`, `prob`, `impatto`, `owner`, `mitigazione`, `scadenza`, `stato`  
**Stato:** ✅ **IMPLEMENTATO** in RAIDLog.tsx  

---

#### **B9. Change Log / CAPA / NC** 🔄
**Cosa:** Quality management  
**Campi:** `change_id`, `richiedente`, `descrizione`, `analisi_rischi`, `approvatori`, `esito`  
**Stato:** ❌ **MANCANTE**  

---

### **C) GOVERNANCE & PERSONE** 👥

#### **C1. Org Chart e Funzionigramma** ✅ GIÀ IMPLEMENTATO
**Campi:** `user_id`, `ruolo`, `line_manager`, `obs_id`, `deleghe[]`  
**Stato:** ✅ **IMPLEMENTATO** in TeamOrgChart.tsx  

---

#### **C2. DoA - Delegation of Authority** ⭐⭐ IMPORTANTE
**Cosa:** Matrice soglie firma  
**Campi:** `voce`, `soglia_euro`, `può_firmare[]`, `cofirma_richiesta`, `note`  
**UI:** Tabella con validazione automatica  
**Stato:** ❌ **MANCANTE - PRIORITÀ #3**  

**Esempio Eco 3D:**
```
| Voce | Soglia | Può firmare | Cofirma |
|------|--------|-------------|---------|
| Contratti | <€5K | CTO, COO | No |
| Contratti | €5K-€25K | CEO | CFO |
| Contratti | >€25K | CEO + Board | Sì |
| Assunzioni FTE | Any | CEO | CFO |
```

---

#### **C3. Role Charter** ✅ GIÀ IMPLEMENTATO
**Campi:** `ruolo`, `mission`, `ambito`, `limiti`, `interfacce`, `kpi[]`, `competenze_richieste[]`  
**Stato:** ✅ **IMPLEMENTATO** in TeamOverview  

---

#### **C4. Competency & Skill Matrix** ✅ GIÀ IMPLEMENTATO
**Campi:** `competenza`, `utente`, `livello(0-4)`, `evidenze`, `gap`, `piano_formazione`  
**Stato:** ✅ **IMPLEMENTATO** in SkillMatrix.tsx  

---

#### **C5. Capacity & Staffing Plan** ⚠️ PARZIALE
**Campi:** `user_id`, `FTE`, `allocazione_per_wbs[%]`, `overbooking_alert`  
**Stato:** ⚠️ **PARZIALE** - Dati workload presenti ma no allocazione WBS  

---

#### **C6. OKR & KPI** ✅ GIÀ IMPLEMENTATO
**Campi:** `objective`, `periodo`, `key_results[]`, `score`, `link_wbs[]`  
**Stato:** ✅ **IMPLEMENTATO** in OKRView.tsx  

---

### **D) PIANIFICAZIONE & CONTROLLO** 💼

#### **D1. Budget & Forecast per WBS/CBS** ❌
**Campi:** `wbs_id`, `cbs_id`, `budget`, `forecast`, `actual`, `varianza`  
**Stato:** ❌ **MANCANTE**  

---

#### **D2. Procurement & Vendor** ❌
**Campi:** `fornitore`, `categoria`, `contratto`, `soglie_doa`, `scadenze`, `SLA`  
**Stato:** ❌ **MANCANTE**  

---

#### **D3. Audit & Versioning** ❌
**Campi:** `entità`, `versione`, `autore`, `timestamp`, `diff`, `motivo`  
**UI:** Pulsante "Crea Baseline", diff visuale  
**Stato:** ❌ **MANCANTE**  

---

## 🔑 DIFFERENZE CHIAVE (Evita Confusione!) {#differenze}

### **RAM vs RACI - ATTENZIONE!**

| Aspetto | RACI (standalone) | RAM (WBS×OBS) |
|---------|-------------------|---------------|
| **Cosa assegna** | Ruoli R/A/C/I a task generici | Ruoli R/A/C/I a WBS work packages |
| **Struttura** | Lista piatta di task | Matrice 2D: WBS × OBS |
| **Collegamento** | Nessuno | Collegata a WBS tree e OBS hierarchy |
| **Output** | Chiarezza ruoli | + Resource loading, gap analysis |
| **Stato** | ✅ Implementato | ❌ Mancante (serve WBS prima!) |

**Conclusione:** RAM è RACI evoluta che richiede WBS e OBS!

---

### **OBS vs Org Chart**

| Aspetto | Org Chart | OBS |
|---------|-----------|-----|
| **Cosa** | Vista gerarchica persone | Struttura gerarchica unità organizzative |
| **Focus** | Who reports to whom | Functional structure |
| **Uso** | HR, team building | Project management, RAM |
| **Stato** | ✅ Implementato | ⚠️ Parziale |

**Conclusione:** OBS è più formale e serve per RAM!

---

### **ROM vs PERT**

| Aspetto | ROM | PERT |
|---------|-----|------|
| **Quando** | Fase iniziale | Fase pianificazione |
| **Accuratezza** | ±25%/75% | ±10% |
| **Formato** | Range (min-max) | 3-point (O, M, P) |
| **Stato** | ❌ Mancante | ❌ Mancante |

**Conclusione:** ROM→PERT→Actual (raffinamento progressivo)

---

## 🗺️ ROADMAP IMPLEMENTAZIONE {#roadmap}

### **FASE 1 - FOUNDATION** (Prossima sessione) 🔥

**Obiettivo:** Creare strutture base per RAM  
**Durata:** ~2 ore  
**Priorità:** CRITICA  

1. **WBS** (Work Breakdown Structure) - 45 min
   - Component: `WBSTree.tsx`
   - Features: Tree view, add/edit/delete nodes, ROM/PERT inline
   - Sample data: 9 work packages Eco 3D

2. **RAM Completa** (WBS×OBS Matrix) - 45 min
   - Component: `RAMMatrix.tsx`
   - Features: Grid WBS×OBS, click assign RACI, validation, resource loading
   - Integration: Usa WBS + OBS esistente

3. **DoA** (Delegation of Authority) - 20 min
   - Component: `DoAMatrix.tsx`
   - Features: Tabella soglie, validazione, alert

4. **Decision Log** - 20 min
   - Component: `DecisionLog.tsx`
   - Features: DACI/RAPID selector, timeline, audit trail

**Output FASE 1:**
- ✅ WBS completa con 9 work packages
- ✅ RAM funzionante con resource loading
- ✅ DoA per governance
- ✅ Decision Log per trasparenza
- ✅ Copertura 65% moduli enterprise

---

### **FASE 2 - ENHANCEMENT** (Futuro) 📈

**Obiettivo:** Moduli avanzati  
**Durata:** ~3 ore  

5. **PBS** (Product Breakdown) - 30 min
6. **Gantt + CPM** - 60 min
7. **ROM/PERT Estimator** - 30 min
8. **Change Log / CAPA** - 30 min
9. **Procurement & Vendor** - 30 min

**Output FASE 2:**
- ✅ Sistema completo 100%
- ✅ Enterprise-grade full

---

## ⚡ PRIORITÀ & DIPENDENZE {#priorita}

### **Dipendenze Critiche:**

```
OBS (enhancedOrgChart)
    ↓
WBS (foundation) ← PRIORITÀ #1
    ↓
RAM (WBS×OBS) ← PRIORITÀ #2
    ↓
Resource Loading, Gap Analysis

DoA ← PRIORITÀ #3 (indipendente)
Decision Log ← PRIORITÀ #4 (indipendente)
OKR → WBS link ← Enhancement
RAID → WBS link ← Enhancement
```

### **Ordine Implementazione:**
1. ✅ **WBS** (serve per RAM)
2. ✅ **RAM** (usa WBS+OBS)
3. ✅ **DoA** (governance)
4. ✅ **Decision Log** (trasparenza)
5. PBS, Gantt, etc. (future)

---

## 📚 QUICK REFERENCE {#reference}

### **Glossario Rapido:**

- **OBS:** Org Breakdown → Chi siamo
- **WBS:** Work Breakdown → Cosa facciamo
- **PBS:** Product Breakdown → Cosa produciamo
- **RAM:** WBS×OBS Matrix → Chi fa cosa
- **RACI:** Responsibility → R/A/C/I roles
- **DoA:** Delegation of Authority → Chi approva cosa
- **OKR:** Objectives & Key Results → Cosa vogliamo raggiungere
- **RAID:** Risks/Assumptions/Issues/Dependencies → Cosa può andare storto
- **ROM:** Rough Order Magnitude → Stima iniziale
- **PERT:** 3-point estimate → Stima raffinata
- **CPM:** Critical Path → Attività critiche

### **Formule Chiave:**

```
PERT: E = (O + 4M + P) / 6
σ = (P - O) / 6

OKR Score: Avg(Key Results %)

Risk Score: Probabilità × Impatto
```

### **Sample Data Eco 3D:**

**OBS:** CEO, COO, CTO, CFO, QA/RA, DPO, Clinical  
**WBS:** 3 fasi (MVP, Validazione, Clinica), 9 work packages  
**RAM:** 9 WP × 6 ruoli = 54 celle  
**DoA:** 4 soglie (€5K, €25K, FTE, Grant)  
**OKR:** 3 quarterly (Q2, Q3, Q4 2025)  
**RAID:** 5 items (2 risks, 1 assumption, 1 issue, 1 dependency)  

---

## ✅ CONCLUSIONI

**Sistema Attuale:**
- ✅ 7 moduli implementati (41%)
- ⚠️ 2 moduli parziali (12%)
- ❌ 8 moduli mancanti (47%)

**Dopo FASE 1:**
- ✅ 11 moduli implementati (65%)
- ⚠️ 2 moduli parziali (12%)
- ❌ 4 moduli mancanti (23%)

**Impatto:**
- ✅ Investor-ready governance
- ✅ Grant EU Horizon compatible
- ✅ Resource planning professionale
- ✅ Decision transparency

---

**Pronto per FASE 1?** Inizio da WBS! 🚀

---

**Versione:** 3.0 DEFINITIVA  
**Data:** 15 Ottobre 2025  
**Autore:** Cascade AI Assistant  
**Status:** 📋 **MASTER GUIDE COMPLETA - ZERO CONFUSIONE**
