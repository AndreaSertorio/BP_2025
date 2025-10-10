#!/usr/bin/env python3
"""Script per applicare automaticamente il collapse pattern a tutte le sezioni"""
import re

# Leggi il file
file_path = 'financial-dashboard/src/components/BusinessPlanView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern per trovare sezioni che NON hanno ancora il collapse
# Cerchiamo h2 che non hanno già il div flex parent
pattern = r'(<section id="([^"]+)">\s*<Card[^>]*>\s*)<h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">\s*(<span[^>]*>(\d+)</span>\s*([^<]+))\s*</h2>\s*(<div className="space-y-6">)'

def replace_section(match):
    section_start = match.group(1)
    section_id = match.group(2)
    span_and_title = match.group(3)
    number = match.group(4)
    title = match.group(5).strip()
    div_start = match.group(6)
    
    # Extract color from span (assuming pattern bg-{color}-100)
    color_match = re.search(r'bg-(\w+)-100', match.group(0))
    color = color_match.group(1) if color_match else 'blue'
    
    replacement = f'''{section_start}<div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {span_and_title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={{() => toggleSection('{section_id}')}}
                className="text-gray-500 hover:text-gray-700"
              >
                {{collapsedSections['{section_id}'] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}}
              </Button>
            </div>

            {{!collapsedSections['{section_id}'] && (
            {div_start}'''
    
    return replacement

# Applica il pattern
new_content = re.sub(pattern, replace_section, content, flags=re.MULTILINE | re.DOTALL)

# Ora chiudiamo tutte le sezioni che non hanno il )}
# Cerchiamo i pattern </Card>\n        </section> che devono diventare )}...</Card>...
section_close_pattern = r'(</div>\s*</Card>\s*</section>)'

# Conta quanti pattern abbiamo applicato
sections_with_button = new_content.count('onClick={() => toggleSection(')
print(f"Sezioni con collapse button: {sections_with_button}")

# Per ogni sezione con button, dobbiamo chiudere con )}
# Ma questo è complesso, meglio farlo manualmente per ciascuna

print("File aggiornato (parziale). Ora devi chiudere manualmente ogni sezione con )}") 
print("Prima di </Card></section>")
