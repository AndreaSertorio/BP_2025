'use client';

export const parameterExplanations = {
  // Market Parameters
  tam: {
    label: "TAM (Total Addressable Market)",
    unit: "K esami/anno",
    description: "Volume totale di esami ecografici nel mercato di riferimento",
    formula: "Somma di tutti gli esami potenziali nei settori target",
    example: "Tiroide 15M + Rene 25M + MSK 5M + Senologia 10M = 55M",
    impact: "Definisce il limite massimo teorico del mercato"
  },
  sam: {
    label: "SAM (Serviceable Addressable Market)", 
    unit: "K esami/anno",
    description: "Parte del TAM che possiamo realisticamente servire",
    formula: "TAM × 50% (fattore di accessibilità)",
    example: "TAM 55M × 50% = 27.5M esami servibili",
    impact: "Base per calcolo penetrazione mercato e leads"
  },
  pricePerExam: {
    label: "Prezzo per Esame",
    unit: "€",
    description: "Quanto costa ogni esame ecografico al paziente/struttura",
    formula: "Prezzo medio ponderato per settore",
    example: "Tiroide €75, Senologia €90 → Media €82.50",
    impact: "Determina ARPA: Prezzo × Scansioni/mese × 12"
  },
  initialCash: {
    label: "Capitale Iniziale",
    unit: "M€",
    description: "Funding disponibile all'inizio del business",
    formula: "Seed + investimenti iniziali",
    example: "€2M seed round",
    impact: "Determina runway e capacità investimento iniziale"
  },

  // GTM Parameters
  marketPenetrationY1: {
    label: "Penetrazione Mercato Anno 1",
    unit: "%",
    description: "Quale % del SAM genera leads nel primo anno",
    formula: "Leads mensili = (SAM × penetrazione) / 12",
    example: "0.01% di 27.5M = 2,750 leads/anno = 229 leads/mese",
    impact: "Determina volume iniziale di leads"
  },
  marketPenetrationY5: {
    label: "Penetrazione Mercato Anno 5",
    unit: "%",
    description: "Quale % del SAM genera leads al quinto anno",
    formula: "Crescita lineare da Y1 a Y5",
    example: "0.1% di 27.5M = 27,500 leads/anno = 2,291 leads/mese",
    impact: "Determina crescita organica del business"
  },
  leadMult: {
    label: "Lead Multiplier",
    unit: "x",
    description: "Fattore di scala per i leads (marketing effectiveness)",
    formula: "Leads finali = Leads base × leadMult",
    example: "229 leads × 1.2 = 275 leads",
    impact: "Simula efficacia campagne marketing"
  },
  l2d: {
    label: "Lead to Demo (L2D)",
    unit: "%",
    description: "% di leads che richiedono una demo",
    formula: "Demo = Leads × L2D",
    example: "100 leads × 20% = 20 demo",
    impact: "Prima conversione del funnel vendite"
  },
  d2p: {
    label: "Demo to Pilot (D2P)",
    unit: "%",
    description: "% di demo che diventano pilot",
    formula: "Pilot = Demo × D2P",
    example: "20 demo × 50% = 10 pilot",
    impact: "Conversione qualificazione opportunità"
  },
  p2d: {
    label: "Pilot to Deal (P2D)",
    unit: "%",
    description: "% di pilot che si convertono in contratti",
    formula: "Deals = Pilot × P2D",
    example: "10 pilot × 60% = 6 deals chiusi",
    impact: "Tasso finale chiusura contratti"
  },

  // Business Model Parameters
  mixCapEx: {
    label: "Mix CapEx",
    unit: "%",
    description: "% contratti vendita dispositivo vs subscription",
    formula: "Deals CapEx = Total Deals × mixCapEx",
    example: "10 deals × 30% = 3 vendite, 7 subscription",
    impact: "Determina split ricavi one-time vs recurring"
  },
  dealMult: {
    label: "Dispositivi per Deal",
    unit: "dispositivi",
    description: "Numero medio dispositivi per contratto",
    formula: "Dispositivi = Deals × dealMult",
    example: "10 deals × 1.5 = 15 dispositivi",
    impact: "Scala hardware deployment"
  },
  devicePrice: {
    label: "Prezzo Dispositivo",
    unit: "€",
    description: "Prezzo vendita dispositivo (modello CapEx)",
    formula: "Revenue CapEx = Dispositivi × devicePrice",
    example: "15 dispositivi × €26,000 = €390,000",
    impact: "Ricavi one-time da vendita hardware"
  },
  arpaSub: {
    label: "ARPA Subscription",
    unit: "€/anno",
    description: "Ricavo annuo per cliente subscription",
    formula: "Prezzo/esame × Scansioni/mese × 12",
    example: "€75 × 80 scans × 12 = €72,000/anno",
    impact: "Ricavi ricorrenti principali"
  },
  arpaMaint: {
    label: "ARPA Maintenance",
    unit: "€/anno",
    description: "Ricavo annuo manutenzione (clienti CapEx)",
    formula: "ARPA Sub × 15%",
    example: "€72,000 × 15% = €10,800/anno",
    impact: "Ricavi ricorrenti da clienti CapEx"
  },
  scansPerDevicePerMonth: {
    label: "Scansioni per Dispositivo",
    unit: "scans/mese",
    description: "Numero medio esami mensili per dispositivo",
    formula: "Volume = Dispositivi × Scansioni/mese",
    example: "100 dispositivi × 80 scans = 8,000 esami/mese",
    impact: "Determina utilizzo e valore generato"
  },

  // Financial Parameters  
  gmRecurring: {
    label: "Margine Lordo Recurring",
    unit: "%",
    description: "Gross margin su ricavi subscription/SaaS",
    formula: "Gross Profit = Revenue × gmRecurring",
    example: "€1M revenue × 80% = €800k gross profit",
    impact: "Profittabilità del modello SaaS"
  },
  cogsHw: {
    label: "Costo Hardware",
    unit: "€",
    description: "Costo produzione dispositivo",
    formula: "COGS = Dispositivi venduti × cogsHw",
    example: "10 dispositivi × €12,000 = €120,000 COGS",
    impact: "Margine su vendite CapEx"
  },
  opex: {
    label: "OPEX Mensile",
    unit: "M€",
    description: "Spese operative mensili totali",
    formula: "OPEX = Personale + Marketing + G&A + R&D",
    example: "Y1: €1.7M, Y5: €5.2M",
    impact: "Determina EBITDA e burn rate"
  },
  churnAnnual: {
    label: "Churn Annuale",
    unit: "%",
    description: "% clienti persi ogni anno",
    formula: "Clienti fine = Clienti inizio × (1 - churn) + Nuovi",
    example: "100 clienti × 8% churn = 8 clienti persi/anno",
    impact: "Riduce base clienti e ricavi ricorrenti"
  }
};

// Helper function to get explanation for a parameter
export function getParameterExplanation(paramName: string) {
  return parameterExplanations[paramName as keyof typeof parameterExplanations] || {
    label: paramName,
    unit: "",
    description: "Parametro personalizzato",
    formula: "N/A",
    example: "N/A",
    impact: "N/A"
  };
}

// Component to show parameter info
export function ParameterInfo({ paramName }: { paramName: string }) {
  const info = getParameterExplanation(paramName);
  
  return (
    <div className="text-xs space-y-1">
      <div className="font-semibold">{info.label}</div>
      <div className="text-gray-600">{info.description}</div>
      <div className="text-gray-500">
        <span className="font-medium">Formula:</span> {info.formula}
      </div>
      {info.example && (
        <div className="text-gray-500">
          <span className="font-medium">Esempio:</span> {info.example}
        </div>
      )}
      <div className="text-blue-600">
        <span className="font-medium">Impatto:</span> {info.impact}
      </div>
    </div>
  );
}
