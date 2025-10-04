'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, DollarSign, Users, Target, BarChart3, Calculator } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  acronym?: string;
  definition: string;
  example?: string;
  category: 'kpi' | 'financial' | 'gtm' | 'valuation' | 'risk';
  icon: React.ReactNode;
}

const glossaryTerms: GlossaryTerm[] = [
  // KPI & Metriche
  {
    term: 'ARR (Annual Recurring Revenue)',
    acronym: 'ARR',
    definition: 'Ricavi ricorrenti annuali. Rappresenta la parte dei ricavi che si ripete ogni anno, tipicamente da abbonamenti o contratti pluriennali.',
    example: 'Se hai 100 clienti che pagano 1.000€/anno, il tuo ARR è 100.000€',
    category: 'kpi',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    term: 'ARPA (Annual Revenue Per Account)',
    acronym: 'ARPA',
    definition: 'Ricavo annuale per account/cliente. Indica quanto fatturi mediamente per ogni cliente attivo.',
    example: 'Con 50 clienti e 150.000€ di ricavi annui, ARPA = 3.000€',
    category: 'kpi',
    icon: <DollarSign className="w-4 h-4" />
  },
  {
    term: 'Churn Rate',
    definition: 'Tasso di abbandono clienti. Percentuale di clienti che smettono di utilizzare il servizio in un periodo.',
    example: 'Se perdi 5 clienti su 100 in un anno, il churn annuale è 5%',
    category: 'kpi',
    icon: <Users className="w-4 h-4" />
  },
  {
    term: 'SOM (Share of Market)',
    acronym: 'SOM',
    definition: 'Quota di mercato. Percentuale del mercato totale che la tua azienda riesce a catturare.',
    example: 'Se il mercato vale 1 miliardo e fatturi 10 milioni, SOM = 1%',
    category: 'kpi',
    icon: <Target className="w-4 h-4" />
  },

  // Metriche Finanziarie
  {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation and Amortization. Utile operativo prima di interessi, tasse, ammortamenti.',
    example: 'Ricavi 1M€ - Costi operativi 700k€ = EBITDA 300k€',
    category: 'financial',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    term: 'Gross Margin',
    definition: 'Margine lordo. Differenza tra ricavi e costo del venduto, espresso come percentuale dei ricavi.',
    example: 'Ricavi 100k€, COGS 30k€ → Gross Margin = 70%',
    category: 'financial',
    icon: <Calculator className="w-4 h-4" />
  },
  {
    term: 'COGS (Cost of Goods Sold)',
    acronym: 'COGS',
    definition: 'Costo del venduto. Costi diretti per produrre il bene/servizio venduto (materiali, manodopera diretta).',
    example: 'Per ogni dispositivo venduto a 1000€, COGS potrebbe essere 300€',
    category: 'financial',
    icon: <DollarSign className="w-4 h-4" />
  },
  {
    term: 'OPEX (Operating Expenses)',
    acronym: 'OPEX',
    definition: 'Spese operative. Costi necessari per gestire il business (stipendi, marketing, affitti, R&D).',
    example: 'Stipendi 500k€ + Marketing 200k€ + Affitti 100k€ = OPEX 800k€',
    category: 'financial',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    term: 'Free Cash Flow (FCF)',
    acronym: 'FCF',
    definition: 'Flusso di cassa libero. Liquidità generata dalle operazioni dopo gli investimenti in capitale.',
    example: 'EBITDA 300k€ - Investimenti 100k€ - Tasse 50k€ = FCF 150k€',
    category: 'financial',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    term: 'Break-even',
    definition: 'Punto di pareggio. Momento in cui i ricavi eguagliano i costi totali (EBITDA = 0).',
    example: 'Se raggiungi EBITDA positivo nel mese 24, il break-even è a 2 anni',
    category: 'financial',
    icon: <Target className="w-4 h-4" />
  },

  // Go-to-Market
  {
    term: 'Lead',
    definition: 'Potenziale cliente che ha mostrato interesse per il prodotto/servizio.',
    example: 'Azienda che compila un form di contatto o richiede una demo',
    category: 'gtm',
    icon: <Users className="w-4 h-4" />
  },
  {
    term: 'Conversion Rate',
    definition: 'Tasso di conversione. Percentuale di lead che si trasformano in clienti paganti.',
    example: 'Su 100 lead, 20 diventano clienti → Conversion rate = 20%',
    category: 'gtm',
    icon: <Target className="w-4 h-4" />
  },
  {
    term: 'L2D (Lead to Demo)',
    acronym: 'L2D',
    definition: 'Tasso di conversione da lead a demo. Percentuale di lead che accettano una dimostrazione.',
    example: 'Su 100 lead, 30 fanno una demo → L2D = 30%',
    category: 'gtm',
    icon: <Target className="w-4 h-4" />
  },
  {
    term: 'D2P (Demo to Pilot)',
    acronym: 'D2P',
    definition: 'Tasso di conversione da demo a pilot. Percentuale di demo che si trasformano in progetti pilota.',
    example: 'Su 30 demo, 15 avviano un pilot → D2P = 50%',
    category: 'gtm',
    icon: <Target className="w-4 h-4" />
  },
  {
    term: 'P2Deal (Pilot to Deal)',
    acronym: 'P2Deal',
    definition: 'Tasso di conversione da pilot a contratto. Percentuale di pilot che diventano clienti paganti.',
    example: 'Su 15 pilot, 10 firmano un contratto → P2Deal = 67%',
    category: 'gtm',
    icon: <Target className="w-4 h-4" />
  },

  // Valutazione e Rischio
  {
    term: 'Sensitivity Analysis',
    definition: 'Analisi di sensitività. Studio di come le variazioni dei parametri di input influenzano i risultati.',
    example: 'Cosa succede all\'EBITDA se ARPA aumenta del 20% o il churn raddoppia?',
    category: 'risk',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    term: 'Monte Carlo Simulation',
    definition: 'Simulazione che usa numeri casuali per modellare l\'incertezza e calcolare probabilità di diversi scenari.',
    example: 'Eseguire 1000 simulazioni con parametri variabili per stimare la probabilità di successo',
    category: 'risk',
    icon: <Calculator className="w-4 h-4" />
  },
  {
    term: 'Tornado Analysis',
    definition: 'Analisi che identifica quali parametri hanno il maggiore impatto sui risultati finali.',
    example: 'ARPA potrebbe avere impatto 10x maggiore sul profitto rispetto al churn',
    category: 'risk',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    term: 'Percentili (P5, P50, P95)',
    definition: 'Valori che dividono una distribuzione in percentuali. P50 = mediana, P5 = scenario pessimistico, P95 = ottimistico.',
    example: 'P5 EBITDA = 1M€ (5% probabilità di fare peggio), P95 = 5M€ (5% probabilità di fare meglio)',
    category: 'risk',
    icon: <Calculator className="w-4 h-4" />
  }
];

const categoryColors = {
  kpi: 'bg-blue-100 text-blue-800',
  financial: 'bg-green-100 text-green-800',
  gtm: 'bg-purple-100 text-purple-800',
  valuation: 'bg-orange-100 text-orange-800',
  risk: 'bg-red-100 text-red-800'
};

const categoryNames = {
  kpi: 'KPI & Metriche',
  financial: 'Finanza',
  gtm: 'Go-to-Market',
  valuation: 'Valutazione',
  risk: 'Rischio & Analisi'
};

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (term.acronym && term.acronym.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(categoryNames) as Array<keyof typeof categoryNames>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Glossario Economico-Finanziario</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cerca e Filtra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca termini, sigle o definizioni..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              Tutti ({glossaryTerms.length})
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={`cursor-pointer ${selectedCategory === category ? categoryColors[category] : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {categoryNames[category]} ({glossaryTerms.filter(t => t.category === category).length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((term, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {term.icon}
                  <CardTitle className="text-lg">
                    {term.acronym ? (
                      <span>
                        <span className="font-bold text-primary">{term.acronym}</span>
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({term.term.replace(term.acronym, '').replace(/^\s*\(|\)\s*$/g, '')})
                        </span>
                      </span>
                    ) : (
                      term.term
                    )}
                  </CardTitle>
                </div>
                <Badge className={categoryColors[term.category]}>
                  {categoryNames[term.category]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {term.definition}
              </p>
              {term.example && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Esempio:</span> {term.example}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nessun termine trovato per "{searchTerm}".
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Prova a modificare i criteri di ricerca o seleziona una categoria diversa.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Suggerimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 text-sm">
            Questo glossario spiega tutti i termini utilizzati nell'applicazione finanziaria di Eco 3D. 
            Usa la barra di ricerca per trovare rapidamente definizioni specifiche, oppure filtra per categoria 
            per esplorare concetti correlati. Ogni termine include esempi pratici per facilitare la comprensione.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
