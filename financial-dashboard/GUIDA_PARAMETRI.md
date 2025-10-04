# 📊 Guida ai Parametri Chiave - Eco 3D Financial Model

## 🎯 Parametri ad Alto Impatto per Ottimizzare i Risultati

### 1. **ARPA (Annual Revenue Per Account)** - IMPATTO MASSIMO
- **Range consigliato**: 12.000€ - 18.000€
- **Valore attuale**: Prudente: 13.200€ | Base: 14.600€ | Ambizioso: 16.060€
- **Perché è critico**: Determina direttamente i ricavi ricorrenti mensili
- **Come ottimizzare**: 
  - Aumentare il prezzo del servizio software
  - Aggiungere moduli premium (AI, analytics avanzate)
  - Offrire pacchetti di scansioni aggiuntive

### 2. **OPEX (Costi Operativi)** - IMPATTO MASSIMO
- **Range critico**: Y1: 1.2-2.0M€ | Y5: 4.0-6.5M€
- **Problema identificato**: OPEX troppo alto nei primi anni
- **Come ottimizzare**:
  - **Y1**: Ridurre a 1.2-1.5M€ (vs 1.7-2.0M€ attuali)
  - **Crescita graduale**: +30-40% annuo invece di valori fissi
  - **Focus**: Assumere gradualmente, non tutto subito

### 3. **Conversioni Funnel** - IMPATTO ALTO
- **Lead→Demo (L2D)**: 18-25% (attuale: 18-22%)
- **Demo→Pilot (D2P)**: 45-60% (attuale: 45-55%)
- **Pilot→Deal (P2Deal)**: 55-70% (attuale: 55-65%)
- **Come migliorare**:
  - Qualificare meglio i leads
  - Demo più efficaci con casi d'uso specifici
  - Pilot strutturati con ROI chiaro

### 4. **Margine Lordo Ricorrente** - IMPATTO ALTO
- **Range ottimale**: 78-85%
- **Attuale**: 78-82%
- **Come migliorare**:
  - Automatizzare supporto clienti
  - Ridurre costi infrastruttura cloud
  - Economie di scala su licenze software

## 🔧 Parametri di Tuning Fine

### 5. **Lead Multiplier**
- **Range**: 0.85-1.15
- **Impatto**: Scala tutti i leads generati
- **Strategia**: Investimenti marketing mirati

### 6. **Churn Annuale**
- **Target**: <8% (attuale: 6-10%)
- **Critico per**: Sostenibilità ARR
- **Come ridurre**: Customer success, training, supporto proattivo

### 7. **Crescita Post-Q8**
- **Range**: 8-16% trimestrale
- **Impatto**: Accelerazione crescita
- **Dipende da**: Scalabilità team sales, market penetration

## Parametri Principali

### Funnel di Vendita
- **leadMult**: Moltiplicatore per il numero di lead generati
- **l2d**: Tasso di conversione da Lead a Demo
- **d2p**: Tasso di conversione da Demo a Pilot
- **p2deal**: Tasso di conversione da Pilot a Deal

### Pricing e Revenue
- **arpaSub**: Annual Revenue Per Account per clienti Subscription (€/anno) - include software, servizi e manutenzione
- **arpaMaint**: Annual Revenue Per Account per manutenzione clienti CapEx (€/anno) - solo servizi post-vendita
- **mixCapEx**: Percentuale di contratti venduti come CapEx vs Subscription (0-1)
- **devicePrice**: Prezzo di vendita del dispositivo (€)
- **devicesPerDeal**: Numero medio di dispositivi per contratto

### Margini e Costi
- **gmRecurring**: Margine lordo sui ricavi ricorrenti (%)
- **cogsHw**: Costo del venduto per dispositivo (€) - applicato a TUTTI i dispositivi spediti
- **opex**: Costi operativi generali annuali (M€)
- **salesMarketingOpex**: Costi operativi Sales & Marketing annuali (M€) - separati per calcolo CAC

### Churn e Retention
- **churnAnnual**: Churn annuale clienti (%)
- **hwChurnAnnual**: Churn annuale dispositivi hardware (%) - impatta dispositivi attivi

### Metriche SOM
- **scansPerDevicePerMonth**: Numero medio di scansioni per dispositivo al mese
- **terminalValueMultiple**: Multiplo EBITDA per calcolo valore terminale NPV

## 📈 Scenari di Ottimizzazione Raccomandati

### **Scenario "Quick Win" (Risultati a 18 mesi)**
```
ARPA: 15.500€ (+6% vs base)
OPEX Y1: 1.4M€ (-22% vs base)
OPEX Y2: 2.0M€ (-20% vs base)
L2D: 22% (+10% vs base)
Margine Ricorrente: 82% (+2.5% vs base)
```
**Risultato atteso**: Break-even Y3, EBITDA Y5: +40%

### **Scenario "Growth Hacking" (Crescita accelerata)**
```
Lead Multiplier: 1.2 (+20%)
ARPA: 16.000€ (+10% vs base)
Conversioni: L2D 23%, D2P 55%, P2Deal 65%
Churn: 6% (-25% vs base)
```
**Risultato atteso**: Break-even Y2, EBITDA Y5: +60%

### **Scenario "Efficiency Focus" (Margini ottimizzati)**
```
OPEX ridotto del 25% tutti gli anni
Margine Ricorrente: 85% (+6% vs base)
ARPA: 15.000€ (+3% vs base)
Automazione: -20% costi supporto
```
**Risultato atteso**: EBITDA margin Y5: >25%

## 🎛️ Come Usare l'Applicazione per Testare

### **Step 1: Baseline Test**
1. Vai su **Dashboard** → seleziona scenario **Base**
2. Nota EBITDA Y5 attuale
3. Vai su **Financials** → verifica break-even year

### **Step 2: Quick Wins**
1. Modifica **ARPA** → aumenta a 15.500€
2. Riduci **OPEX** nei parametri custom
3. Aumenta **Margine Ricorrente** a 82%
4. Osserva impatto immediato su KPI

### **Step 3: Sensitivity Analysis**
1. Vai su **Sensitivity** tab
2. Identifica parametri con maggiore impatto
3. Concentrati sui top 3 per massimizzare ROI

### **Step 4: Monte Carlo Validation**
1. Usa **Monte Carlo** per testare robustezza
2. Verifica che P5 (scenario pessimistico) sia ancora accettabile
3. Assicurati che P95 sia realisticamente raggiungibile

## 🔧 Correzioni Applicate (Versione Corrente)

### ✅ COGS Hardware
- **Prima**: Applicato solo alla quota CapEx dei dispositivi
- **Ora**: Applicato a TUTTI i dispositivi spediti
- **Impatto**: Calcolo più realistico dei margini hardware

### ✅ ARR Segmentato  
- **Prima**: ARPA unico per tutti i clienti
- **Ora**: ARPA separato per Subscription (all-in) e CapEx (solo manutenzione)
- **Parametri**: `arpaSub` (12-40k€) e `arpaMaint` (3-12k€)
- **Impatto**: Modellazione più accurata del mix contrattuale

### ✅ Mix Contratti CapEx/Subscription
- **Nuovo**: Parametro `mixCapEx` (0-100%) per definire la distribuzione contrattuale
- **Impatto**: Controllo granulare del business model mix

### ✅ Dispositivi Attivi con Churn Hardware
- **Prima**: SOM basato su dispositivi spediti cumulativi
- **Ora**: Tracking dispositivi attivi con `hwChurnAnnual` (1-10%)
- **Impatto**: SOM più realistico considerando obsolescenza e sostituzione

### ✅ CAC Calculation Realistico
- **Prima**: CAC stimato come 30% degli OPEX totali
- **Ora**: `salesMarketingOpex` separati per calcolo CAC preciso
- **Impatto**: Metriche unit economics più accurate

### ✅ Break-Even Analysis Completo
- **Prima**: Solo break-even EBITDA
- **Ora**: Break-even EBITDA + Cash Flow (CFO)
- **Impatto**: Visibilità completa su profittabilità operativa e finanziaria

### ✅ Terminal Value Parametrico
- **Nuovo**: `terminalValueMultiple` (3-8x) per NPV scenarios
- **Impatto**: Valutazioni più flessibili per diversi scenari di mercato

### ✅ SOM Calculation Migliorato
- **Nuovo**: `scansPerDevicePerMonth` (400-1000) per calcolo volume
- **Impatto**: Stima SOM basata su utilizzo effettivo dispositivi

## ⚠️ Errori Comuni da Evitare

### **1. OPEX Troppo Aggressivo**
- ❌ Non assumere tutto il team dal Y1
- ✅ Crescita graduale basata sui ricavi

### **2. ARPA Irrealistico**
- ❌ Non superare 40.000€ per subscription senza validazione mercato
- ✅ Testare pricing con pilot customers

### **3. Conversioni Ottimistiche**
- ❌ Non assumere >70% conversioni senza processo rodato
- ✅ Migliorare gradualmente con esperienza

### **4. Churn Sottovalutato**
- ❌ Non assumere <5% churn senza customer success solido
- ✅ Investire in retention prima di assumere churn basso

## 🎯 KPI Target per Scenario Ottimizzato

| Metrica | Y1 | Y3 | Y5 |
|---------|----|----|----| 
| Revenue | 1.0M€ | 8.0M€ | 18.0M€ |
| EBITDA | -0.8M€ | 2.0M€ | 6.5M€ |
| ARR | 1.2M€ | 9.5M€ | 20.0M€ |
| Accounts | 80 | 600 | 1.300 |
| Break-even | - | Y3 Q2 | - |

## 🔄 Processo di Ottimizzazione Iterativo

1. **Baseline**: Documenta risultati scenario attuale
2. **Hypothesis**: Identifica 1-2 parametri da modificare
3. **Test**: Modifica parametri nell'app
4. **Validate**: Verifica con Monte Carlo
5. **Iterate**: Ripeti con nuovi parametri
6. **Document**: Salva scenario ottimizzato come Custom

---

**💡 Ricorda**: L'obiettivo è trovare il giusto equilibrio tra crescita ambiziosa e realismo operativo. Usa questa guida per esplorare sistematicamente le leve di valore del tuo business model.
