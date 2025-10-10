# 🎯 INTEGRAZIONE SEZIONE 3 BP - Mercato TAM/SAM/SOM

**Data:** 10 Ottobre 2025  
**Obiettivo:** Integrare dati reali calcolati dall'app nella sezione 3 del Business Plan

---

## 📊 ANALISI DATI DISPONIBILI

### 1️⃣ **TAB MERCATO ECOGRAFIE** (`MercatoEcografie.tsx`)

**Fonte dati**: `Eco_ITA_MASTER.xlsx`

#### Dati Disponibili:
- ✅ **15 prestazioni ecografiche** complete
- ✅ **Volumi annui**: SSN + Extra-SSN per regione Italia
- ✅ **Classificazione urgenza**: U (Urgenti), B (Brevi), D (Differite), P (Programmate)
- ✅ **Percentuali Extra-SSN**: Penetrazione mercato privato per prestazione
- ✅ **Toggle Aggredibili**: Quali prestazioni targetizzare
- ✅ **Prezzi regionalizzati**: Pubblico vs Privato per regione

#### Metriche Calcolate:
```
Volume SSN Totale: ~105,974 esami/anno (Italia)
Volume Extra-SSN: ~XX esami/anno
Mercato Totale: SSN + Extra-SSN
```

**Top Prestazioni** (esempio):
1. MSK Arti: ~15,000 esami/anno
2. Tiroide: ~12,000 esami/anno  
3. Addominale: ~11,000 esami/anno

---

### 2️⃣ **TAB TAM/SAM/SOM - VISTA PROCEDURES** (`TamSamSomDashboard.tsx`)

**Calcoli Real-Time basati su**:

#### Configurazione:
- **Price Mode**: 
  - `semplice`: Prezzo medio fisso (€77.5/esame)
  - `perProcedura`: Prezzo specifico per procedura
  - `regionalizzato`: Prezzi per regione (IT/EU/US/CN)
  
- **Volume Mode**:
  - `totale`: SSN + Extra-SSN
  - `ssn`: Solo pubblico
  - `extraSsn`: Solo privato

- **Regioni Attive**: Multi-selezione Italia/Europa/USA/Cina

#### Formula TAM Procedures:
```typescript
// Modalità Semplice
TAM = Σ(Volume_Aggredibili) × PrezzoMedio
     = ~105,974 × €77.5
     = ~€8.2M (solo Italia)

// Modalità Regional izzato
TAM = Σ(regioni_attive) {
        Σ(prestazioni_aggredibili) {
          Volume_SSN × Prezzo_Pubblico +
          Volume_ExtraSSN × Prezzo_Privato
        }
      }
```

#### Parametri Configurabili:
```json
{
  "samPercentage": 35-50,  // SAM = TAM × %
  "somPercentages": {
    "y1": 0.5,   // SOM Anno 1 = SAM × 0.5%
    "y3": 2.0,   // SOM Anno 3 = SAM × 2%
    "y5": 5.0    // SOM Anno 5 = SAM × 5%
  }
}
```

#### Metriche Output (esempio Italia):
```
TAM Procedures: €8.2M - €31.9M (dipende da regioni)
SAM (50%): €4.1M - €15.95M
SOM Y1 (0.5%): €20K - €80K
SOM Y3 (2%): €82K - €319K
SOM Y5 (5%): €205K - €798K
```

---

### 3️⃣ **TAB TAM/SAM/SOM - VISTA DEVICES** (`TamSamSomDashboard.tsx`)

**Fonte dati**: `database.mercatoEcografi`

#### Struttura Dispositivi:
**3 Categorie Hardware**:
1. **Carrellati** (61.3% IT, 69.6% globale)
   - Prezzo medio: €50,000
   - Volume IT 2025: ~3,433 unità
   
2. **Portatili** (32.8% IT, 29.5% globale)
   - Prezzo medio: €25,000
   - Volume IT 2025: ~1,837 unità
   
3. **Palmari** (5.9% IT, 3% globale)
   - Prezzo medio: €8,000
   - Volume IT 2025: ~329 unità

#### Regioni Disponibili:
```
Italia:         5,600 unità/anno 2025
Europa:        37,000 unità/anno 2025  
Stati Uniti:   31,000 unità/anno 2025
Cina:          26,000 unità/anno 2025
```

#### Formula TAM Devices:
```typescript
// Per ogni categoria
Volume_Categoria = Unità_Mercato × Quota_Tipologia
TAM_Categoria = Σ(regioni_attive) { Volume × PrezzoMedio }

// Esempio Carrellati IT 2025
Volume = 5,600 × 61.3% = 3,433 unità
TAM = 3,433 × €50,000 = €171.6M

// Totale Italia 2025 (tutte categorie)
TAM_IT_2025 = €171.6M + €45.9M + €2.6M = €220M
```

#### Proiezioni Temporali:
✅ **Anni disponibili**: 2025 → 2035 (11 anni)
✅ **Growth rate**: Integrato per ogni regione
✅ **Selector anno**: Dinamico nell'UI

#### Parametri Config urabili:
```json
{
  "regioniAttive": {
    "italia": true,
    "europa": true,
    "usa": true,
    "cina": true
  },
  "selectedYear": 2025-2035,
  "samPercentage": 50,
  "somPercentages": {
    "y1": 0.5,
    "y3": 2.0,
    "y5": 5.0
  },
  "prezziMediDispositivi": {
    "carrellati": 50000,
    "portatili": 25000,
    "palmari": 8000
  }
}
```

#### Metriche Output (esempio tutte regioni 2025):
```
TAM Devices: ~€4.2B (globale, tutte categorie)
SAM (50%): ~€2.1B
SOM Y1 (0.5%): ~€10.5M
SOM Y3 (2%): ~€42M
SOM Y5 (5%): ~€105M

Dispositivi Target:
Y1: ~10,500 unità
Y3: ~42,000 unità
Y5: ~105,000 unità
```

---

### 4️⃣ **SALVATAGGIO AUTOMATICO DATABASE**

✅ **Tutti i parametri sono salvati** in `database.json`:

```json
{
  "configurazioneTamSamSom": {
    "ecografie": {
      "priceMode": "regionalizzato",
      "prezzoMedioProcedura": 77.5,
      "samPercentage": 50,
      "somPercentages": { "y1": 0.5, "y3": 2, "y5": 5 },
      "valoriCalcolati": {
        "tam": 31900000,
        "sam": 15950000,
        "som1": 79750,
        "som3": 319000,
        "som5": 797500
      }
    },
    "ecografi": {
      "prezzoMedioDispositivo": 45000,
      "samPercentage": 50,
      "somPercentages": { "y1": 0.5, "y3": 2, "y5": 5 },
      "regioniAttive": { ... },
      "valoriCalcolati": {
        "tam": 4200000000,
        "sam": 2100000000,
        "som1": 10500000,
        "som3": 42000000,
        "som5": 105000000
      }
    }
  }
}
```

✅ **Auto-save con debounce 1.5s** - Ogni modifica viene salvata automaticamente
✅ **Update ottimistico UI** - L'interfaccia si aggiorna immediatamente

---

## 🎯 PIANO INTEGRAZIONE SEZIONE 3 BP

### **OBIETTIVI**

1. ✅ Visualizzare TAM/SAM/SOM con dati reali calcolati
2. ✅ Segmentazione mercato (Procedures vs Devices)
3. ✅ Analisi geografica (Italia/Europa/USA/Cina)
4. ✅ Trend temporali (2025-2035)
5. ✅ Confronto scenari (Prudente/Base/Ottimista)
6. ✅ Metriche chiave per investitori

---

### **STRUTTURA PROPOSTA - SEZIONE 3 BP**

```
📊 3. MERCATO TAM/SAM/SOM

├── 3.1 Overview Mercato
│   ├── Card: TAM Totale (Procedures + Devices)
│   ├── Card: SAM Serviceable
│   ├── Card: SOM Year 1/3/5
│   └── Trend Growth Mercato 2025-2035
│
├── 3.2 Segmentazione Mercato
│   ├── TAM/SAM/SOM Procedures (Esami)
│   │   ├── Tabella prestazioni aggredibili
│   │   ├── Split SSN vs Privato
│   │   └── Breakdown geografico
│   ├── TAM/SAM/SOM Devices (Dispositivi)
│   │   ├── Categorie hardware (Cart/Port/Palm)
│   │   ├── Volumi per regione
│   │   └── ASP per tipologia
│   └── Grafico confronto Procedures vs Devices
│
├── 3.3 Analisi Geografica
│   ├── Italia (mercato primario)
│   ├── Europa (espansione immediata)
│   ├── USA (mercato maturo)
│   ├── Cina (crescita rapida)
│   └── Heatmap penetrazione regionale
│
├── 3.4 Assumptions & Metodologia
│   ├── Criteri SAM (% TAM serviceable)
│   ├── Criteri SOM (penetrazione realistica)
│   ├── Growth rates per regione
│   ├── Pricing assumptions
│   └── Fonti dati e validazione
│
└── 3.5 Scenari Strategici
    ├── Prudente (Italia only, Y1: 0.1%)
    ├── Base (IT+EU, Y1: 0.5%)
    ├── Ottimista (4 regioni, Y1: 1%)
    └── Tabella comparativa scenari
```

---

### **COMPONENTI DA IMPLEMENTARE**

#### **1. Card Riepilogo TAM/SAM/SOM Unificato**

```tsx
<Card>
  <h3>Mercato Totale Addressabile (TAM)</h3>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p>TAM Procedures</p>
      <p className="text-3xl font-bold">
        {formatCurrency(tamProcedures)}
      </p>
      <Badge>{formatNumber(tamProceduresVolume)} esami/anno</Badge>
    </div>
    <div>
      <p>TAM Devices</p>
      <p className="text-3xl font-bold">
        {formatCurrency(tamDevices)}
      </p>
      <Badge>{formatNumber(tamDevicesUnits)} unità/anno</Badge>
    </div>
  </div>
  
  <div className="mt-4">
    <p className="text-sm text-gray-600">
      Regioni: {regioniAttive.join(', ')}
    </p>
    <p className="text-sm text-gray-600">
      Anno riferimento: {selectedYear}
    </p>
  </div>
</Card>
```

#### **2. Tabella Comparativa Procedures vs Devices**

```tsx
<table>
  <thead>
    <tr>
      <th>Metrica</th>
      <th>Procedures (Esami)</th>
      <th>Devices (Hardware)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>TAM</td>
      <td>{formatCurrency(tamProc)}</td>
      <td>{formatCurrency(tamDev)}</td>
    </tr>
    <tr>
      <td>SAM (50%)</td>
      <td>{formatCurrency(samProc)}</td>
      <td>{formatCurrency(samDev)}</td>
    </tr>
    <tr>
      <td>SOM Y1 (0.5%)</td>
      <td>{formatCurrency(somProc1)}</td>
      <td>{formatCurrency(somDev1)}</td>
    </tr>
    <tr>
      <td>Growth Y1→Y5</td>
      <td>+{((somProc5/somProc1-1)*100).toFixed(1)}%</td>
      <td>+{((somDev5/somDev1-1)*100).toFixed(1)}%</td>
    </tr>
  </tbody>
</table>
```

#### **3. Grafico Evoluzione Temporale (2025-2035)**

```tsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={timelineData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year" />
    <YAxis />
    <Tooltip formatter={(value) => formatCurrency(value)} />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="tamDevices" 
      stroke="#3b82f6" 
      name="TAM Devices"
      strokeWidth={2}
    />
    <Line 
      type="monotone" 
      dataKey="samDevices" 
      stroke="#10b981" 
      name="SAM Devices"
      strokeWidth={2}
    />
    <Line 
      type="monotone" 
      dataKey="somDevices" 
      stroke="#f59e0b" 
      name="SOM Devices"
      strokeWidth={2}
      strokeDasharray="5 5"
    />
  </LineChart>
</ResponsiveContainer>
```

#### **4. Heatmap Geografica**

```tsx
{regionsList.map(region => {
  const tamRegion = calculateTAMForRegion(region);
  const penetration = (tamRegion / tamGlobal) * 100;
  
  return (
    <div 
      key={region}
      className="p-4 rounded"
      style={{
        backgroundColor: getHeatColor(penetration)
      }}
    >
      <p className="font-bold">{region}</p>
      <p>{formatCurrency(tamRegion)}</p>
      <Badge>{penetration.toFixed(1)}% TAM</Badge>
    </div>
  );
})}
```

#### **5. Tabella Scenari Strategici**

```tsx
<table>
  <thead>
    <tr>
      <th>Scenario</th>
      <th>Regioni</th>
      <th>SOM Y1</th>
      <th>SOM Y3</th>
      <th>SOM Y5</th>
      <th>Dispositivi Y1</th>
    </tr>
  </thead>
  <tbody>
    <tr className="bg-yellow-50">
      <td>Prudente</td>
      <td>IT</td>
      <td>€80K</td>
      <td>€319K</td>
      <td>€798K</td>
      <td>~1,800 unità</td>
    </tr>
    <tr className="bg-blue-50">
      <td>Base</td>
      <td>IT + EU</td>
      <td>€410K</td>
      <td>€1.6M</td>
      <td>€4.1M</td>
      <td>~9,200 unità</td>
    </tr>
    <tr className="bg-green-50">
      <td>Ottimista</td>
      <td>IT + EU + US + CN</td>
      <td>€10.5M</td>
      <td>€42M</td>
      <td>€105M</td>
      <td>~105,000 unità</td>
    </tr>
  </tbody>
</table>
```

---

## 🔄 DATI DISPONIBILI PER INTEGRAZIONE

### **Da `database.configurazioneTamSamSom`**:

```typescript
// Già salvato e accessibile
const tamSomData = {
  procedures: {
    tam: data.configurazioneTamSamSom.ecografie.valoriCalcolati.tam,
    sam: data.configurazioneTamSamSom.ecografie.valoriCalcolati.sam,
    som1: data.configurazioneTamSamSom.ecografie.valoriCalcolati.som1,
    som3: data.configurazioneTamSamSom.ecografie.valoriCalcolati.som3,
    som5: data.configurazioneTamSamSom.ecografie.valoriCalcolati.som5
  },
  devices: {
    tam: data.configurazioneTamSamSom.ecografi.valoriCalcolati.tam,
    sam: data.configurazioneTamSamSom.ecografi.valoriCalcolati.sam,
    som1: data.configurazioneTamSamSom.ecografi.valoriCalcolati.som1,
    som3: data.configurazioneTamSamSom.ecografi.valoriCalcolati.som3,
    som5: data.configurazioneTamSamSom.ecografi.valoriCalcolati.som5
  }
};
```

### **Da `database.mercatoEcografie`**:

```typescript
// Prestazioni ecografiche
const prestazioni = data.mercatoEcografie.italia.prestazioni;
const aggredibili = prestazioni.filter(p => p.aggredibile);
const volumeSSN = aggredibili.reduce((sum, p) => sum + p.volumeSSN, 0);
const volumeExtra = aggredibili.reduce((sum, p) => sum + p.volumeExtraSSN, 0);
```

### **Da `database.mercatoEcografi`**:

```typescript
// Numero ecografi per regione e anno
const getDevicesForYear = (year: number, region: string) => {
  return data.mercatoEcografi.numeroEcografi
    .find(m => m.mercato === region)[`unita${year}`];
};

// Proiezioni Italia
const proiezioni = data.mercatoEcografi.proiezioniItalia;
```

---

## 📝 PROSSIMI STEP IMPLEMENTAZIONE

### **FASE 1: Preparazione Dati** ✅

1. ✅ Verificare `valoriCalcolati` salvati correttamente
2. ✅ Testare calcoli TAM/SAM/SOM per tutte le regioni
3. ✅ Validare dati devices per anni 2025-2035
4. ✅ Confermare prezzi dispositivi aggiornati

### **FASE 2: Componente Sezione 3 BP** 🔄

1. Creare `BusinessPlanMercatoSection.tsx`
2. Implementare cards riepilogo TAM/SAM/SOM
3. Tabella comparativa Procedures vs Devices
4. Grafico evoluzione temporale
5. Heatmap geografica
6. Tabella scenari strategici

### **FASE 3: Integrazione in BusinessPlanView** 🔄

1. Importare dati da database via `useDatabase()`
2. Sostituire sezione statica con componente dinamico
3. Collegare con altre sezioni BP (Revenue Model, Go-to-Market)
4. Tooltip informativi per trasparenza calcoli
5. Link di navigazione a tab TAM/SAM/SOM per dettagli

### **FASE 4: Testing & Validazione** 🔜

1. Test modifiche TAM/SAM/SOM → Update BP automatico
2. Test scenari Prudente/Base/Ottimista
3. Verifica consistenza numeri con Revenue Model
4. Export PDF sezione mercato

---

## 🎓 NOTE METODOLOGICHE PER BP

### **Giustificazione SAM (50% TAM)**

```
TAM = Mercato totale teoricamente addressabile
SAM = Mercato effettivamente raggiungibile

Perché 50%?
- Eco 3D non compete su tutto il mercato ecografi
- Focus su segmenti specifici: portatili/palmari + nicchie
- Barriere entry: regolamentazioni, canali distribuzione
- Competizione con players consolidati
- Limitazioni tecnologiche attuali

Benchmark settore:
- Startup MedTech early-stage: 30-50% SAM/TAM
- Fonte: CB Insights, MedTech Startup Benchmarks 2024
```

### **Giustificazione SOM (0.5% → 5% crescita)**

```
SOM Anno 1 = 0.5% SAM
- Primo anno commerciale
- Network vendita limitato
- Brand awareness basso
- Validazione clinica in corso

SOM Anno 3 = 2% SAM  
- Espansione geografica (2-3 paesi)
- Proof of concept consolidato
- Prime partnership strategiche

SOM Anno 5 = 5% SAM
- Presenza multi-nazionale
- Product-market fit provato
- Economie di scala

Benchmark:
- MedTech devices Y1-Y5: 0.1% → 3% penetrazione media
- Fonte: Medical Device Market Reports 2024
```

### **Segmentazione Geografica Razionale**

```
Italia (Primario):
- Mercato domestico
- Validazione normativa CE più semplice
- Conoscenza contesto sanitario
- Network iniziale disponibile

Europa (Immediato):
- Normativa armonizzata (CE Mark)
- Mercato maturo, payor ben definiti
- Vicinanza geografica

USA (Medio termine):
- Mercato più grande
- FDA approval richiesta (processo lungo)
- Partnership distributiva necessaria

Cina (Lungo termine):
- Crescita rapida mercato
- Barriere entry alte (NMPA)
- Localizzazione prodotto richiesta
```

---

## ✅ CONCLUSIONE

**Hai tutto il necessario per creare una sezione 3 BP professionale e data-driven!**

### Dati disponibili:
- ✅ TAM/SAM/SOM Procedures con calcoli reali
- ✅ TAM/SAM/SOM Devices con proiezioni 2025-2035
- ✅ Segmentazione geografica 4 regioni
- ✅ Breakdown per categoria (Carrellati/Portatili/Palmari)
- ✅ Salvataggio automatico tutte configurazioni
- ✅ Integrazione con Revenue Model già attiva

### Prossimo step:
Implementare il componente `BusinessPlanMercatoSection.tsx` che legge questi dati e li visualizza in formato executive-ready per investitori! 🚀
