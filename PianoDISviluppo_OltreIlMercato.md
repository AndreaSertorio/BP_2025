Grandissimo lavoro: ora che hai un “single source of truth” e una guida operativa solida, possiamo trasformare quello che hai già costruito in un **piano di implementazione step-by-step** (dalle basi → al modello completo) senza perdere tempo su cose secondarie.

Sotto trovi **che cosa fare, in che ordine farlo, e cosa salvare in `database.json`**, così tutto resta coerente con il tuo Sistema Unificato Dati e si aggiorna in tempo reale nell’app.  

---

# 1) Basi assolute (TAM/SAM/SOM + driver di ricavo)

## 1.1 Strato “Mercato” (due viste: *esami* e *ecografi*)

Aggiungi in `market` due sottosezioni parallele, **coerenti tra loro**:

* **Esami (procedures)**

  ```json
  "procedures": {
    "regions": ["IT","EU","US","CN","ROW"],
    "year": 2025,
    "volumes": { "IT": 105974, "EU": ..., "US": ... }, 
    "pricePerCPT": { "IT": { "capoCollo":  X, "cardio": Y, ... } }
  }
  ```

  → Serve per il modello “per-esame” (pricing a scansione o fee SaaS per esame).
  *Nota:* nella tua app i moltiplicatori regionali sono già previsti (slider), mantienili qui come `volumeMultiplier` per replicare la logica “Italia × moltiplicatori” che hai in UI. 

* **Ecografi (devices)**

  ```json
  "devices": {
    "typologySplit": { "cart":0.45,"portable":0.35,"handheld":0.20 },
    "unitSales": { "IT": n_anno, "EU": ..., ... },
    "installedBase": { "IT": n_tot, ... },
    "asp": { "cart": A, "portable": B, "handheld": C }
  }
  ```

  → Serve per il modello “vendita dispositivi” e per stimare base installata da cui estrarre abbonamenti/consumabili.

Con questi due strati puoi calcolare **TAM/SAM/SOM** sia lato *esami* sia lato *macchine* e confrontarli (utile a investitori perché legano domanda clinica e offerta hardware). La guida insiste proprio su “parti dal mercato e definisci il target ottenibile (SOM) con ipotesi prudenziali e supportate” – esattamente ciò che questi driver abilitano. 

## 1.2 Strato “Modello di business”

Definisci **le linee di ricavo** come oggetti dichiarativi:

```json
"revenueModel": {
  "hardware": { "enabled": true, "asp": 20000, "unitCost": 10000, "warrantyPct": 0.03 },
  "saas": { "enabled": true, "priceMonthly": 500, "grossMarginPct": 0.85 },
  "perScanFee": { "enabled": false, "fee": 1.50, "revSharePct": 0.30 }
}
```

Questo ricalca la sequenza corretta della guida: **cosa vendi e a che prezzo** (device, SaaS, per-esame) prima di fare i conti. 

---

# 2) Dalle assunzioni alle vendite (top-down + bottom-up)

## 2.1 Motore volumi

Aggiungi un piccolo “engine” che trasformi mercato → vendite:

```json
"goToMarket": {
  "salesCycleMonths": 6,
  "salesCapacity": { "reps": 2, "dealsPerRepPerQuarter": 4 },
  "channelMix": { "direct": 0.6, "distributors": 0.4, "distributorMargin": 0.20 },
  "conversionFunnel": { "leads→demo": 0.25, "demo→po": 0.30 },
  "adoptionCurve": { "IT": [0.2,0.6,1.0], "EU":[0.1,0.4,0.8] } 
}
```

* Questo ti dà una **proiezione bottom-up** (capacità commerciale) da incrociare con la **quota SOM top-down**: prendi la minore delle due ogni periodo → realismo immediato. La guida raccomanda proprio questa doppia vista per non “magheggiare” i ricavi. 

---

# 3) Margine lordo, COGS e OPEX (collegati al tuo Tab Budget)

* **COGS/Margine lordo**: per hardware calcoli per unità; per SaaS/scan usi % di gross margin.
  La guida usa questo esatto passaggio (ricavi → COGS → **Gross Margin**) come base del conto economico. 

* **OPEX**: riusa il tuo **Tab Budget** (personale, R&D, S&M, G&A, ammortamenti). Hai già editing, persistenza e totali calcolati runtime nel context React: continuiamo lì per avere **una sola fonte**. 

Suggerimento struttura (già compatibile col tuo `budget`):

```json
"opex": {
  "staff": [ { "role":"CTO","startQ":"q1_25","costYear":50000 }, ... ],
  "rnd":   [ { "item":"Certificazione CE", "q1_25":15000, ... } ],
  "salesMarketing":[ ... ],
  "ga":[ ... ],
  "capex":[ { "item":"Attrezzature lab", "amount":50000, "lifeYears":5 } ]
}
```

---

# 4) Prospetti previsionali (P&L → Cash Flow → Stato Patrimoniale)

Implementiamo **3 calcoli periodici** (trimestri/anni) in un nuovo namespace `forecast` dentro `database.json` generato dall’app:

1. **Conto Economico (P&L)**: ricavi per linea – COGS = **Gross Margin**; – OPEX = **EBITDA**; – ammortamenti = **EBIT**; – interessi/tasse = **Utile Netto**. È esattamente l’ordine indicato dalla guida. 

2. **Cash Flow**: parti da EBITDA, aggiungi ammortamenti, variazione **capitale circolante** (DSO/DPO/inventario), poi **CAPEX** e **finanziamenti**; ottieni **cassa finale** e **minimo di cassa** (serve per il *capital needed*). 

3. **Stato Patrimoniale**: cassa finale, crediti, magazzino, immobilizzazioni nette, debiti, patrimonio. Mantieni il check **Attivo = Passivo+PN** come validazione. 

Nel tuo frontend hai già il **Context** e l’update immutabile: aggiungiamo un servizio `ForecastService` che legge `market + revenueModel + budget` e scrive `forecast` in memoria (non persistiamo i totali, li ricalcoliamo a vista — stessa filosofia dei “totali automatici” che già usi). 

---

# 5) KPI investitori (base → avanzato)

Mostra un riquadro KPI (per periodo e “as of today”):

* **MRR / ARR** (solo per parti ricorrenti: SaaS, per-scan se contrattualizzato)
* **Gross Margin %**
* **Burn rate** e **Runway** (mesi)
* **Break-even**: in **€ mensili** e in **unità/anno** (hardware) = *costi fissi / margine di contribuzione unitario*
* **LTV, CAC, LTV/CAC** (quando avrai i primi dati/assunzioni di funnel; inizialmente ipotesi)

Queste sono le metriche che la guida ti chiede di presentare chiaramente agli investitori, con formule e storytelling coerente. 

---

# 6) Scenari & sensibilità (Prudente / Base / Ambizioso)

Aggiungi in `database.json` un blocco `scenarios` con override puntuali:

```json
"scenarios": {
  "prudente": { "goToMarket.salesCapacity.reps": 1, "revenueModel.saas.priceMonthly": 400, "procedures.volumeMultiplier": 0.9 },
  "base":     { },
  "ambizioso":{ "goToMarket.salesCapacity.reps": 4, "conversionFunnel.demo→po": 0.40, "procedures.volumeMultiplier": 1.1 }
}
```

Il selettore scenario applica gli override in tempo reale (come già fai coi moltiplicatori mercato). La guida raccomanda esplicitamente **scenari multipli** e un **buffer 10–20%** per imprevisti: inserisci un toggle “buffer” che aumenta OPEX o riduce ricavi dello x%. 

---

# 7) Use of Funds & Capital Needed (output pronto-investitori)

Dalla serie di cassa proiettata estrai:

* **Punto di cassa minima** e **fabbisogno** = deficit massimo + buffer.
* **Runway con round richiesto** (mesi).
* **Allocazione fondi** (R&D/Certificazioni, Sales/Marketing, Produzione/Scala, G&A/Buffer) con percentuali.

Questa sezione esce “one-click” dal tuo `forecast.cash` ed è esattamente ciò che la guida suggerisce di comunicare (importo, uso, mesi coperti, milestone). 

---

# 8) UI: cosa aggiungere dove (rapido e concreto)

* **Tab Mercato** (già esiste): mostra *doppia vista* “Esami” vs “Ecografi” e un widget **TAM/SAM/SOM** con switch. (Continua a usare il tuo slider moltiplicatore volume). 
* **Tab Budget** (già esiste): aggiungi colonna “ammortamenti” auto-derivata dal CAPEX; lascia i totali calcolati runtime come fai ora. 
* **Nuovo Tab “Forecast”**: tre pannelli (P&L, Cash Flow, Balance), card KPI, pulsante **Esporta**. Le tabelle sono *read-only* (derivate).
* **Scenario bar** persistente (top): switch 3 scenari + toggle buffer + selezione regione.

---

## Piano per sprint (3 settimane “from now” come traccia operativa)

**Sprint 1 – Fundamentals (mercato + modello + forecast P&L)**

1. Estendi `database.json` con `procedures`, `devices`, `revenueModel`, `goToMarket`. 
2. Implementa `ForecastService.v1` → calcola **unità vendute**, **ricavi per linea**, **COGS**, **Gross Margin**, **OPEX link** (dal Budget) → **EBITDA/EBIT/Net**. 
3. UI: Tab Forecast (P&L + KPI base: GM%, EBITDA, MRR/ARR se applicabile). 

**Sprint 2 – Cash & Balance + scenari**
4) Aggiungi working capital (DSO, DPO, inventory), CAPEX → **Cash Flow** + **Cassa finale/minima**. 
5) Deriva **Stato Patrimoniale** semplificato. 
6) Scenario engine (+ buffer 10–20%). 

**Sprint 3 – KPI avanzati & investitori**
7) KPI completi: **Burn, Runway, Break-even (€/mese e unità/anno), LTV/CAC** (con ipotesi iniziali), **Use of Funds** auto-compilato. 
8) Export deck/Excel dai dati del `forecast` (nessun dato duplicato; tutto proviene dal single source). 

---

## Perché questo approccio “funziona” con ciò che hai già

* **Single Source of Truth**: restiamo dentro `database.json`, aggiornando UI in modo immutabile come già fai (niente ricarichi, niente scroll che salta). 
* **Sequenza della guida**: mercato → pricing/modello → volumi → P&L → cash → balance → KPI/Use of Funds → scenari. È la pipeline più credibile verso investitori. 

Se vuoi, nel prossimo passo costruisco subito i **JSON skeleton** pronti da incollare nel tuo repo (con chiavi esatte e placeholder) e le **formule “inline”** del `ForecastService.v1` così puoi collegarle in poche righe.
