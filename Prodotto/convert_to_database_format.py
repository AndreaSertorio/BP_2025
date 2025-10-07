#!/usr/bin/env python3
"""
Converte i dati estratti da budget_data.json in formato database.json
compatibile con i types TypeScript definiti
"""

import json
from pathlib import Path
from datetime import datetime

def convert_budget_to_database_format(budget_json_path):
    """Converte budget_data.json nel formato per database.json"""
    
    with open(budget_json_path, 'r', encoding='utf-8') as f:
        source_data = json.load(f)
    
    print("📊 Conversione Budget Data → Database Format\n")
    
    # Estrai periodi
    periods_raw = source_data['header']['periods']
    periods = []
    
    for idx, p in enumerate(periods_raw):
        period_name = p['name']
        
        # Determina tipo periodo
        if 'YTD' in period_name:
            period_type = 'ytd'
            year = int(period_name.split()[1])
            quarter = None
        elif 'TOT' in period_name or 'Totale' in period_name:
            period_type = 'year_total' if 'Totale' not in period_name or '2026-28' not in period_name else 'overall_total'
            year = int(period_name.split()[1]) if 'TOT' in period_name else 2026
            quarter = None
        elif 'Qtr' in period_name:
            period_type = 'quarter'
            parts = period_name.split()
            quarter = int(parts[0])
            year = int(parts[2])
        else:
            period_type = 'quarter'
            year = 2025
            quarter = 4
        
        period_id = f"{'ytd' if period_type == 'ytd' else 'tot' if 'total' in period_type else f'q{quarter}'}_{year if period_type != 'overall_total' else 'all'}"
        
        periods.append({
            'id': period_id,
            'name': period_name,
            'type': period_type,
            'year': year,
            'quarter': quarter,
            'column': idx,
            'isVisible': True
        })
    
    print(f"✅ Estratti {len(periods)} periodi")
    
    # Estrai items e organizza per categorie
    all_items_raw = source_data['all_items']
    
    categories = {}
    all_items = []
    item_counter = 0
    
    current_category = None
    current_subcategory = None
    
    for item_raw in all_items_raw:
        level = item_raw['level']
        code = item_raw['code']
        description = item_raw['description']
        values_raw = item_raw['values']
        formula = item_raw.get('formula')
        
        # Converti valori nel formato {periodId: value}
        values = {}
        for period_name, value in values_raw.items():
            # Trova periodo corrispondente
            matching_period = next((p for p in periods if p['name'] == period_name), None)
            if matching_period:
                values[matching_period['id']] = value if isinstance(value, (int, float)) else None
        
        # Determina tipo item
        is_category = level in [1, 2]
        is_total = 'Totale' in description or 'TOTALE' in description
        is_editable = not is_total and level >= 3
        
        item_id = f"item_{item_counter}"
        item_counter += 1
        
        item = {
            'id': item_id,
            'code': str(code) if code is not None else None,
            'description': description,
            'level': level,
            'parentId': None,  # Sarà impostato dopo
            'categoryId': None,  # Sarà impostato dopo
            'values': values,
            'formula': formula,
            'note': None,
            'isCategory': is_category,
            'isTotal': is_total,
            'isEditable': is_editable,
            'isExpanded': False,
            'createdAt': datetime.now().isoformat(),
            'lastModified': datetime.now().isoformat()
        }
        
        # Gestisci gerarchia
        if level == 1:
            # Nuova categoria principale
            current_category = {
                'id': f"cat_{code}" if code else f"cat_{item_counter}",
                'code': str(code) if code else str(item_counter),
                'name': description,
                'description': None,
                'icon': get_category_icon(description),
                'color': get_category_color(int(code) if code and str(code).isdigit() else 1),
                'order': int(code) if code and str(code).isdigit() else item_counter,
                'subcategories': [],
                'items': [],
                'isExpanded': True,
                'totalRow': None
            }
            categories[current_category['id']] = current_category
            item['categoryId'] = current_category['id']
            current_subcategory = None
            
        elif level == 2:
            # Sottocategoria
            if current_category:
                subcat_id = f"subcat_{code.replace('.', '_')}" if code else f"subcat_{item_counter}"
                current_subcategory = {
                    'id': subcat_id,
                    'code': str(code) if code else '',
                    'name': description,
                    'description': None,
                    'parentCategoryId': current_category['id'],
                    'order': len(current_category['subcategories']),
                    'items': [],
                    'isExpanded': True
                }
                current_category['subcategories'].append(current_subcategory)
                item['categoryId'] = current_category['id']
                item['parentId'] = subcat_id
                
        elif level >= 3:
            # Voce dettaglio
            if current_category:
                item['categoryId'] = current_category['id']
                if current_subcategory:
                    item['parentId'] = current_subcategory['id']
                    current_subcategory['items'].append(item)
                else:
                    current_category['items'].append(item)
        
        # Gestisci totali
        if is_total and current_category:
            current_category['totalRow'] = item
            item['categoryId'] = current_category['id']
        
        all_items.append(item)
    
    print(f"✅ Processati {len(all_items)} items")
    print(f"✅ Create {len(categories)} categorie\n")
    
    # Crea struttura finale
    budget_data = {
        'version': '1.0.0',
        'lastUpdated': datetime.now().isoformat(),
        'currency': 'EUR',
        'periods': periods,
        'categories': list(categories.values()),
        'allItems': all_items,
        'configuration': {
            'expandedYears': [2026],
            'expandedCategories': [cat['id'] for cat in categories.values()],
            'showQuarters': True,
            'showTotals': True,
            'showFormulas': False,
            'yearRange': {
                'start': 2025,
                'end': 2028
            },
            'editMode': False,
            'compactView': False,
            'highlightChanges': True
        },
        'metadata': {
            'source': 'Excel import',
            'originalFile': 'Costi_sviluppo.xlsx',
            'importDate': datetime.now().isoformat(),
            'notes': 'Budget iniziale importato da Excel'
        }
    }
    
    # Salva
    output_file = Path(budget_json_path).parent / 'budget_database_format.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(budget_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Salvato in: {output_file}\n")
    
    # Stampa statistiche
    print("📈 Statistiche:")
    print(f"   - Periodi: {len(periods)}")
    print(f"   - Categorie: {len(categories)}")
    print(f"   - Items totali: {len(all_items)}")
    print(f"   - Items editabili: {sum(1 for i in all_items if i['isEditable'])}")
    print(f"   - Righe totale: {sum(1 for i in all_items if i['isTotal'])}")
    
    return budget_data

def get_category_icon(name):
    """Assegna emoji icona in base al nome categoria"""
    icons = {
        'Prototipo': '🔬',
        'Regolatorio': '📋',
        'Validazione': '🧪',
        'Team': '👥',
        'Overhead': '🏢',
        'Asset': '🏭',
        'Commerciali': '📈',
        'Contingencies': '💰'
    }
    
    for key, icon in icons.items():
        if key.lower() in name.lower():
            return icon
    return '📊'

def get_category_color(code):
    """Assegna colore in base al codice categoria"""
    colors = [
        '#3b82f6',  # blue
        '#6366f1',  # indigo
        '#8b5cf6',  # purple
        '#ec4899',  # pink
        '#f59e0b',  # amber
        '#10b981',  # emerald
        '#06b6d4',  # cyan
        '#f97316'   # orange
    ]
    return colors[(code - 1) % len(colors)]

if __name__ == '__main__':
    budget_json = Path(__file__).parent / 'budget_data.json'
    
    try:
        convert_budget_to_database_format(budget_json)
        print("\n✅ Conversione completata!")
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
