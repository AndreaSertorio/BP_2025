# FASE 2A - Implementation Plan

## Obiettivo
Implementare RBS + CBS in 3 ore per colmare gap critico resource & cost management.

## Componenti da Creare

### 1. RBS Component (1h)
- File: `RBSTree.tsx` (~400 righe)
- Features essenziali:
  - Tree view gerarchico
  - 4 categorie: Human, Equipment, Material, Software
  - Display: costo unitario, disponibilità, allocazioni WBS
  - Stats: totale risorse, costo totale
  - Detail panel selezione nodo
- Sample data: 25 nodi (CEO, CTO, consultants, lab equipment, PCB, software licenses)

### 2. CBS Component (1h)
- File: `CBSView.tsx` (~350 righe)
- Features essenziali:
  - Tabella CBS per WBS package
  - 5 categorie: Labor, Materials, Equipment, Overhead, External
  - Calcolo: Planned vs Actual, Variance (€ e %)
  - Charts: breakdown per categoria, budget status
  - Stats: totale pianificato, speso, variance
- Sample data: CBS per 8 WBS packages principali

### 3. Integration (30min)
- Update `TeamManagementDashboard.tsx`
- Aggiungere 2 tab: "RBS" e "CBS"
- Icons: Package per RBS, DollarSign per CBS

### 4. Testing (30min)
- Quick test navigazione
- Verify data display
- Check responsive layout

## Sample Data Strategy

### RBS Hierarchy
```
Human Resources (RBS-1)
├── Internal (RBS-1.1)
│   ├── CEO (€0, 1 FTE)
│   ├── CTO (€80K, 1 FTE)
│   ├── COO (€70K, 1 FTE)
│   ├── AI Engineer (€60K, 1 FTE)
│   └── HW Engineer (€50K, 1 FTE)
├── External Consultants (RBS-1.2)
│   ├── QA/RA (€800/day, 60 days)
│   ├── ML Expert (€800/day, 30 days)
│   └── Clinical (€500/day, 20 days)

Equipment & Tools (RBS-2)
├── Lab Equipment (RBS-2.1)
│   ├── Oscilloscopio (€5K)
│   ├── Phantom (€6K, 2 units)
│   └── Workstation GPU (€10.5K, 3 units)
├── Software Licenses (RBS-2.2)
│   ├── Altium (€3K/year)
│   ├── GCP (€14.4K/18mo)
│   └── GitHub (€960/2yr)

Materials (RBS-3)
├── Electronic (RBS-3.1)
│   ├── PCB (€23K, 5 units)
│   ├── Trasduttori (€7.5K)
│   └── BOM (€4K)
├── Mechanical (RBS-3.2)
│   ├── Housing (€3K)
│   └── Handle (€750)
```

Total RBS Cost: ~€340K

### CBS Breakdown per WBS

**1.1 Prototipo HW (€25K)**
- Labor: €15K (CTO 30%, HW Eng 60%)
- Materials: €34.5K (PCB + components + housing)
- Equipment: €2K (oscilloscopio allocation)
- Overhead: €2.5K (10%)

**1.2 Firmware (€20K)**
- Labor: €18K (CTO 40%)
- Tools: €1K (IDE licenses)
- Overhead: €1K (5%)

**1.3 App SW (€75K)**
- Labor: €60K (AI Eng 80%, CTO 30%)
- Cloud: €10K (GCP)
- Consultant: €3K (ML expert)
- Overhead: €2K

**2.1 Test EMC (€10K)**
- Labor: €5K
- Equipment: €3K (phantom allocation)
- External: €2K (lab test service)

**2.2 Usabilità (€20K)**
- Labor: €12K
- Consultant: €8K (QA/RA + Clinical)

**2.3 Dossier (€32K)**
- Labor: €10K
- Consultant: €20K (QA/RA 40 days)
- Overhead: €2K

**3.1 EC Submission (€7.5K)**
- Consultant: €6K (QA/RA)
- Admin: €1.5K

**3.2 Trial Clinico (€27.5K)**
- Labor: €10K
- Consultant: €10K (Clinical)
- Materials: €5K (consumables)
- Equipment: €2.5K (phantom)

## UI Design Principles

### RBS Tree
- Color coding per categoria (blue=human, purple=equipment, green=material, orange=software)
- Badges per tipo (internal/external/contractor)
- Alert icon se overallocated (>100% WBS)
- Costo totale badge per leaf nodes

### CBS View
- Tabella sortable per WBS package
- Progress bars: planned vs actual
- Color coding variance: green <5%, yellow 5-10%, red >10%
- Mini charts per categoria breakdown

## Success Criteria

✅ RBS tree navigabile con 25+ risorse
✅ CBS tabella con 8 WBS packages
✅ Variance calculation funzionante
✅ Integration in dashboard (14 tab totali)
✅ No TypeScript errors
✅ Sample data realistici Eco 3D

## Timeline

- T+0h: RBS Component (questo step)
- T+1h: CBS Component
- T+2h: Integration + Testing
- T+3h: FASE 2A COMPLETED ✅

Coverage: 65% → 85% (+20%)
