#!/usr/bin/env python3
"""
Estrae la struttura gerarchica del budget da Costi_sviluppo.xlsx
"""

import openpyxl
import json
from pathlib import Path

def extract_budget_structure(file_path):
    """Estrae categorie, voci e dati del budget"""
    
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb['Costi sviluppo']
    
    print(f"📊 Analisi Budget Costi Sviluppo\n")
    
    # Struttura dati
    budget_data = {
        'header': {},
        'categories': [],
        'all_items': []
    }
    
    # Estrai header (riga 4)
    header_row = list(sheet[4])
    periods = []
    for idx, cell in enumerate(header_row):
        if cell.value and idx >= 4:  # Skip prime 4 colonne
            periods.append({
                'column': idx,
                'name': str(cell.value)
            })
    
    budget_data['header'] = {
        'title': header_row[3].value if len(header_row) > 3 else '',
        'periods': periods
    }
    
    print(f"📅 Periodi trovati: {len(periods)}")
    for p in periods[:5]:
        print(f"   - {p['name']} (col {p['column']})")
    print(f"   ... e altri {len(periods)-5} periodi\n")
    
    # Estrai voci di budget
    print("📋 Struttura Categorie:\n")
    
    current_category = None
    current_subcategory = None
    
    for row_idx in range(5, sheet.max_row + 1):
        row = list(sheet[row_idx])
        
        # Codice voce (colonna 2, indice 2)
        code = row[2].value if len(row) > 2 else None
        # Descrizione (colonna 3, indice 3)
        description = row[3].value if len(row) > 3 else None
        
        if not description:
            continue
        
        # Estrai valori per ogni periodo
        values = {}
        for period in periods:
            col_idx = period['column']
            val = row[col_idx].value if len(row) > col_idx else None
            if val is not None and val != '':
                values[period['name']] = float(val) if isinstance(val, (int, float)) else str(val)
        
        # Determina livello gerarchico
        level = 0
        if code:
            code_str = str(code)
            if '.' not in code_str:
                level = 1  # Categoria principale (es. "1")
            elif code_str.count('.') == 1:
                level = 2  # Sottocategoria (es. "1.1")
            else:
                level = 3  # Voce dettaglio (es. "1.1.2")
        else:
            # Nessun codice, probabilmente voce senza codice o totale
            level = 4
        
        item = {
            'row': row_idx,
            'code': code,
            'description': description,
            'level': level,
            'values': values,
            'formula': row[1].value if len(row) > 1 else None  # Colonna formula
        }
        
        budget_data['all_items'].append(item)
        
        # Stampa struttura
        if level == 1:
            print(f"\n{'='*60}")
            print(f"🔷 {code}. {description}")
            print(f"{'='*60}")
            current_category = description
        elif level == 2:
            print(f"\n  📁 {code} {description}")
            current_subcategory = description
        elif level == 3:
            val_str = f" → {list(values.values())[:3]}" if values else ""
            print(f"    • {code} {description[:50]}{val_str}")
        elif "Totale" in description or "TOTALE" in description:
            val_str = f" → {list(values.values())[:3]}" if values else ""
            print(f"\n    ✅ {description}{val_str}")
    
    # Salva JSON
    output_file = Path(file_path).parent / 'budget_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(budget_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n\n💾 Dati salvati in: {output_file}")
    print(f"📊 Totale voci: {len(budget_data['all_items'])}")
    
    # Statistiche
    by_level = {}
    for item in budget_data['all_items']:
        level = item['level']
        by_level[level] = by_level.get(level, 0) + 1
    
    print(f"\n📈 Distribuzione voci:")
    print(f"   - Livello 1 (Categorie principali): {by_level.get(1, 0)}")
    print(f"   - Livello 2 (Sottocategorie): {by_level.get(2, 0)}")
    print(f"   - Livello 3 (Voci dettaglio): {by_level.get(3, 0)}")
    print(f"   - Livello 4 (Altro/Totali): {by_level.get(4, 0)}")
    
    return budget_data

if __name__ == '__main__':
    excel_file = Path(__file__).parent / 'Costi_sviluppo.xlsx'
    
    try:
        extract_budget_structure(excel_file)
        print("\n✅ Estrazione completata!")
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
