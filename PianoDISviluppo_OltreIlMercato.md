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

## 5.1 Struttura dati (nuovo blocco)

Aggiungi un blocco **derivato** (non editabile) che la tua app calcola e scrive in memoria (o rigenera a vista):

```json
"kpi": {
  "period": "2025-Q4",
  "mrr": 0,
  "arr": 0,
  "grossMarginPct": 0,
  "burnRateMonthly": 0,
  "runwayMonths": 0,
  "breakEvenMonthly€": 0,
  "breakEvenUnitsPerYear": 0,
  "ltv": 0,
  "cac": 0,
  "ltvToCac": 0
}

```

> Questi sono esattamente i KPI che la guida chiede di presentare agli investitori (MRR/ARR, GM, Burn/Runway, Break-even, LTV/CAC).
> 

## 5.2 Formule (motore “ForecastService”)

- **MRR/ARR**: somma solo le linee ricorrenti (SaaS, maintenance, fee-per-scan contrattualizzate).
    
    `ARR = 12 × MRR`.
    
- **Gross Margin %**: `(Ricavi tot − COGS tot) / Ricavi tot`.
- **Burn rate** (mensile): media degli **outflow netti operativi** per mese (escludi equity/debito in entrata).
    
    `burn = |cash_op_out − cash_op_in| / mesi` (puoi calcolarlo trimestralmente/12).
    
- **Runway (mesi)**: `runway = cassa_attuale / burn`.
- **Break-even (€/mese)**: `costi_fissi_mensili / margine_contribuzione_%`.
    
    **Unità/anno** (hardware): `costi_fissi_annui / margine_contribuzione_unitario`.
    
- **LTV** (ricorrente): `ARPU_annuo × (12 / churn_mensile)` / `12`.
    
    **CAC**: `spese S&M periodo / #nuovi clienti periodo`.
    
    **LTV/CAC**: `ltv / cac`. (Mostralo solo se il modello ha vera ricorrenza).
    

## 5.3 Validazioni & “spie”

- **MRR include solo ricorrente** (se > Ricavi ricorrenti: errore).
- **Runway**: warning se `< 6` mesi; rosso se `< 3`.
- **LTV/CAC**: nascondi se mancano dati funnel; warning se `< 1.5`.

**UI**: strip KPI fissa in alto nel tab *Forecast* con semafori (verde/giallo/rosso) e tooltip “formula + fonte”.

---

# 6) Scenari & sensibilità (Prudente / Base / Ambizioso)

## 6.1 Engine scenari (override dichiarativi)

Hai già i moltiplicatori e la logica di **single source**; estendila con override per scenario:

```json
"scenarios": {
  "prudente": {
    "goToMarket.salesCapacity.reps": 1,
    "conversionFunnel.demoToPo": 0.2,
    "market.procedures.volumeMultiplier": 0.9,
    "revenueModel.saas.priceMonthly": 400
  },
  "base": {},
  "ambizioso": {
    "goToMarket.salesCapacity.reps": 4,
    "conversionFunnel.demoToPo": 0.4,
    "market.procedures.volumeMultiplier": 1.1,
    "revenueModel.saas.priceMonthly": 650
  }
}

```

Lo **ScenarioSelector** applica gli override al volo; i prospetti si ricalcolano senza ricaricare (pattern Context immutabile che già usi).

## 6.2 Sensitivity (tornado chart)

Parametri consigliati (slider ±20% con default): **penetrazione (SOM)**, **scans/mese**, **prezzo per esame/ASP**, **COGS unit**, **mix CapEx/Sub**, **churn**. Mostra impatto su **ARR Y3/Y5** e **cassa minima**. (Allineato al focus investitori su driver che cambiano la traiettoria).

---

# 7) Use of Funds & Capital Needed

## 7.1 Calcolo fabbisogno

Dal rendiconto cassa cumulato trova il **minimo di cassa** (valore più basso della curva).

`capital_needed = |min_cassa| + buffer` (10–20%). Questo è il numero che **chiedi** al round.

## 7.2 Allocazione fondi (auto-build)

Crea una card “**Use of Funds**” che legge il **budget** e propone la ripartizione:

```json
"useOfFunds": {
  "rnd": 0.35,
  "certificazioni": 0.15,
  "salesMarketing": 0.25,
  "produzione": 0.15,
  "g&a": 0.10
}

```

Spiega in nota: “copre **X mesi** di runway a burn **Y/mese**” (prende runway/burn dai KPI). Questo è esattamente ciò che la guida chiede di evidenziare (importo, mesi coperti, destinazione, milestone coperte).

---

# 8) Pannello Valutazione & Round (VC Method + Milestone ladder)

## 8.1 VC Method (widget semplice)

Input: **ARR target Y5** (dal forecast), **multiplo di exit Ricavi** (2–4×), **ROI target investitore** (10–15×), **diluizione cumulativa stimata** (seed→A→B).

Calcolo base:

`EnterpriseValue_exit = Revenues_Y5 × ExitMultiple`

`PostMoney_oggi ≈ (Investment × ROI_target) / (Ownership_a_exit)`

Dove `Ownership_a_exit` = quota investitore oggi × (1 − diluizione futura). Mostra **range** con multipli/ROI slider. (Metodo standard per early stage).

## 8.2 Milestone-based step-ups (ladder)

Tabella pre-compilata con **step di valutazione** e **evento**:

- **+20–30%**: **Brevetto concesso** (T+12m).
- **×2–3**: **Validazione clinica pilota** (12–18m).
- **×2**: **Marcatura CE** (24–36m).
- **×?**: **Prime vendite / run-rate** (36–48m).

Mostra “oggi”, “post-brevetto”, “post-pilota”, “post-CE” con stime automatiche. (È esattamente lo schema che i VC si aspettano di vedere).

## 8.3 Dilution simulator (cap table semplificata)

Campi: **pre-money**, **raise**, **option pool (%)**, **round A**, **round B**.

Output: quote founder/investitori a ogni round. (La guida 26 insiste su gestione equity e step-up).

---

# 9) Prospetti completi & coerenza contabile

## 9.1 P&L → Cash Flow → Stato Patrimoniale

Implementa i tre prospetti come **derivati** (read-only). La 38c dà l’ordine e le definizioni; tu hai già il pattern “calcolo a vista dal single source”.

- **P&L**: ricavi per linea → **COGS** → **Gross Margin** → **OPEX** (dal Budget) → **EBITDA/EBIT/Net**.
- **Cash Flow**: `EBITDA ± ΔWC − CAPEX +/− Finanza = ΔCassa`; curva cumulata per **minimo cassa**.
- **Balance**: cassa finale, crediti, inventario, immobilizzazioni nette, debiti, patrimonio; **check**: Attivo = Passivo+PN.

## 9.2 Validazioni automatiche

- **P&L vs Cash**: `Utile netto + ammortamenti − ΔWC − CAPEX ≈ CF operativo+investimenti`.
- **Balance**: scarto massimo accettato `< €1`.
- **Coerenza ricavi**: MRR × 12 = ARR (entro 1%).

---

# 10) UI: componenti aggiuntivi minimi

- **KPI strip** (sticky) con semafori.
- **Scenario bar**: 3 scenari + toggle “Buffer 15%”.
- **Card Use of Funds** (importo richiesto, mesi coperti, % allocazioni).
- **Valuation tab**: VC Method (slider), Milestone ladder (tabella), Dilution sim (grafico stacked).
---

## Perché questo approccio “funziona” con ciò che hai già

* **Single Source of Truth**: restiamo dentro `database.json`, aggiornando UI in modo immutabile come già fai (niente ricarichi, niente scroll che salta). 
* **Sequenza della guida**: mercato → pricing/modello → volumi → P&L → cash → balance → KPI/Use of Funds → scenari. È la pipeline più credibile verso investitori. 

Se vuoi, nel prossimo passo costruisco subito i **JSON skeleton** pronti da incollare nel tuo repo (con chiavi esatte e placeholder) e le **formule “inline”** del `ForecastService.v1` così puoi collegarle in poche righe.
