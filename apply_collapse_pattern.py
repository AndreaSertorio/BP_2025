#!/usr/bin/env python3
"""Script per applicare il pattern di collapse a tutte le sezioni del Business Plan"""

# Sezioni da modificare (escludendo la 1 che è già stata fatta)
sections = [
    {"id": "proposta-valore", "num": "2", "title": "Proposta di Valore", "color": "green"},
    {"id": "mercato", "num": "3", "title": "Mercato TAM/SAM/SOM", "color": "purple"},
    {"id": "competizione", "num": "4", "title": "Competizione & Posizionamento", "color": "orange"},
    {"id": "modello-business", "num": "5", "title": "Modello di Business & Prezzi", "color": "cyan"},
    {"id": "gtm", "num": "6", "title": "Go-to-Market (24 mesi)", "color": "indigo"},
    {"id": "regolatorio", "num": "7", "title": "Regolatorio & Clinico", "color": "red"},
    {"id": "roadmap-prodotto", "num": "8", "title": "Roadmap Prodotto & Industrializzazione", "color": "teal"},
    {"id": "operazioni", "num": "9", "title": "Operazioni & Supply Chain", "color": "lime"},
    {"id": "team", "num": "10", "title": "Team & Governance", "color": "pink"},
    {"id": "rischi", "num": "11", "title": "Rischi & Mitigazioni", "color": "amber"},
    {"id": "piano-finanziario", "num": "12", "title": "Piano Finanziario (3–5 anni)", "color": "emerald"},
]

# Per ogni sezione, generare:
# 1. Pattern OLD: sezione con h2 singolo
# 2. Pattern NEW: sezione con div flex, h2, e Button collapse

for section in sections:
    print(f"\n### SEZIONE {section['num']}: {section['title']} ###\n")
    
    # OLD pattern to find
    old_pattern = f'''        {{/* {section['num']}. {section['title']} */}}
        <section id="{section['id']}">
          <Card className="p-8 border-l-4 border-l-{section['color']}-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-{section['color']}-100 text-{section['color']}-600 font-bold">{section['num']}</span>
              {section['title']}
            </h2>

            <div className="space-y-6">'''
    
    # NEW pattern with collapse
    new_pattern = f'''        {{/* {section['num']}. {section['title']} */}}
        <section id="{section['id']}">
          <Card className="p-8 border-l-4 border-l-{section['color']}-600">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-{section['color']}-100 text-{section['color']}-600 font-bold">{section['num']}</span>
                {section['title']}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={{() => toggleSection('{section['id']}')}}
                className="text-gray-500 hover:text-gray-700"
              >
                {{collapsedSections['{section['id']}'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}}
              </Button>
            </div>

            {{!collapsedSections['{section['id']}'] && (
            <div className="space-y-6">'''
    
    print("OLD:")
    print(old_pattern)
    print("\nNEW:")
    print(new_pattern)
    print("\n" + "="*80)
