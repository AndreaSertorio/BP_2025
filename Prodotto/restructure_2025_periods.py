#!/usr/bin/env python3
"""
Ristruttura i periodi del budget 2025:
- YTD 25 -> suddiviso in 1 Tr 25, 2 Tr 25, 3 Tr 25
- 4 2025 -> 4 Tr 25
- Aggiunge TOT 2025
- Cambia Qtr in Tr per tutti i periodi
"""

import json
from pathlib import Path
from datetime import datetime

def restructure_periods():
    """Ristruttura i periodi nel database.json"""
    
    database_file = Path(__file__).parent.parent / 'financial-dashboard/src/data/database.json'
    
    print("🔄 Ristrutturazione Periodi Budget 2025\n")
    
    # Backup
    backup_file = database_file.parent / f"database_backup_restructure_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    # Carica database
    with open(database_file, 'r', encoding='utf-8') as f:
        database = json.load(f)
    
    # Salva backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup creato: {backup_file.name}\n")
    
    if 'budget' not in database:
        print("❌ Sezione budget non trovata!")
        return False
    
    budget = database['budget']
    
    # STEP 1: Ristruttura periods
    print("📅 STEP 1: Ristrutturazione periods array")
    old_periods = budget['periods']
    new_periods = []
    
    for period in old_periods:
        # Cambia Qtr in Tr per tutti
        if 'Qtr' in period['name']:
            period['name'] = period['name'].replace('Qtr', 'Tr')
            print(f"   ✓ Rinominato: {period['id']} -> {period['name']}")
        
        # YTD 25 -> diventa 1 Tr 25
        if period['id'] == 'ytd_25':
            # Crea 3 trimestri
            for q in range(1, 4):
                new_period = {
                    "id": f"q{q}_25",
                    "name": f"{q} Tr 25",
                    "type": "quarter",
                    "year": 2025,
                    "quarter": q,
                    "column": period['column'] + q - 1,
                    "isVisible": True
                }
                new_periods.append(new_period)
                print(f"   ✓ Creato: q{q}_25 -> {q} Tr 25")
        
        # 4 2025 -> 4 Tr 25
        elif period['id'] == 'q4_2025':
            period['name'] = '4 Tr 25'
            period['year'] = 2025
            period['quarter'] = 4
            period['column'] = 3  # Dopo i primi 3 trimestri
            new_periods.append(period)
            print(f"   ✓ Modificato: q4_2025 -> 4 Tr 25")
            
            # Aggiungi TOT 2025
            tot_2025 = {
                "id": "tot_25",
                "name": "TOT 2025",
                "type": "year_total",
                "year": 2025,
                "quarter": None,
                "column": 4,
                "isVisible": True
            }
            new_periods.append(tot_2025)
            print(f"   ✓ Creato: tot_25 -> TOT 2025")
        
        else:
            # Aggiusta column index
            if period['year'] >= 26:
                period['column'] += 4  # Shift per i nuovi periodi 2025
            new_periods.append(period)
    
    budget['periods'] = new_periods
    print(f"   ✅ Totale periodi: {len(old_periods)} -> {len(new_periods)}\n")
    
    # STEP 2: Redistribuzione valori items
    print("💰 STEP 2: Redistribuzione valori items")
    
    items_updated = 0
    ytd_values_found = 0
    
    for item in budget['allItems']:
        if 'ytd_25' in item['values']:
            ytd_value = item['values']['ytd_25']
            ytd_values_found += 1
            
            # Redistribuisci il valore YTD sui 3 trimestri
            # Logica: dividi equamente
            value_per_quarter = ytd_value / 3 if ytd_value else 0
            
            # Rimuovi ytd_25
            del item['values']['ytd_25']
            
            # Aggiungi i 3 trimestri
            item['values']['q1_25'] = round(value_per_quarter, 2) if value_per_quarter else 0
            item['values']['q2_25'] = round(value_per_quarter, 2) if value_per_quarter else 0
            item['values']['q3_25'] = round(value_per_quarter, 2) if value_per_quarter else 0
            
            # Calcola TOT 2025 (Q1+Q2+Q3+Q4)
            q4_value = item['values'].get('q4_2025', 0)
            tot_2025_value = item['values']['q1_25'] + item['values']['q2_25'] + item['values']['q3_25'] + q4_value
            item['values']['tot_25'] = round(tot_2025_value, 2)
            
            items_updated += 1
            
            if items_updated <= 3:  # Mostra i primi 3 esempi
                print(f"   Item: {item['description'][:40]}...")
                print(f"      YTD 25: {ytd_value} -> Q1: {item['values']['q1_25']}, Q2: {item['values']['q2_25']}, Q3: {item['values']['q3_25']}")
                print(f"      TOT 2025: {item['values']['tot_25']}")
    
    print(f"   ✅ Items aggiornati: {items_updated} (YTD trovati: {ytd_values_found})\n")
    
    # STEP 3: Aggiorna categorie (stessa logica)
    print("📊 STEP 3: Aggiornamento categorie")
    
    def update_category_items(items):
        for item in items:
            if 'ytd_25' in item['values']:
                ytd_value = item['values']['ytd_25']
                del item['values']['ytd_25']
                
                value_per_quarter = ytd_value / 3 if ytd_value else 0
                item['values']['q1_25'] = round(value_per_quarter, 2)
                item['values']['q2_25'] = round(value_per_quarter, 2)
                item['values']['q3_25'] = round(value_per_quarter, 2)
                
                q4_value = item['values'].get('q4_2025', 0)
                tot_2025_value = item['values']['q1_25'] + item['values']['q2_25'] + item['values']['q3_25'] + q4_value
                item['values']['tot_25'] = round(tot_2025_value, 2)
    
    for category in budget['categories']:
        # Items diretti della categoria
        if 'items' in category:
            update_category_items(category['items'])
        
        # Subcategories
        for subcat in category.get('subcategories', []):
            if 'items' in subcat:
                update_category_items(subcat['items'])
        
        # TotalRow
        if 'totalRow' in category and 'values' in category['totalRow']:
            if 'ytd_25' in category['totalRow']['values']:
                ytd_value = category['totalRow']['values']['ytd_25']
                del category['totalRow']['values']['ytd_25']
                
                value_per_quarter = ytd_value / 3 if ytd_value else 0
                category['totalRow']['values']['q1_25'] = round(value_per_quarter, 2)
                category['totalRow']['values']['q2_25'] = round(value_per_quarter, 2)
                category['totalRow']['values']['q3_25'] = round(value_per_quarter, 2)
                
                q4_value = category['totalRow']['values'].get('q4_2025', 0)
                tot_2025_value = (category['totalRow']['values']['q1_25'] + 
                                 category['totalRow']['values']['q2_25'] + 
                                 category['totalRow']['values']['q3_25'] + q4_value)
                category['totalRow']['values']['tot_25'] = round(tot_2025_value, 2)
    
    print(f"   ✅ Categorie aggiornate: {len(budget['categories'])}\n")
    
    # STEP 4: Aggiorna metadata
    database['version'] = '1.0.3'
    database['lastUpdate'] = datetime.now().strftime('%Y-%m-%d')
    
    # Salva
    with open(database_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    
    print("✅ Ristrutturazione completata!")
    print(f"   - Versione: {database['version']}")
    print(f"   - Periodi totali: {len(budget['periods'])}")
    print(f"   - Struttura 2025: 1 Tr 25, 2 Tr 25, 3 Tr 25, 4 Tr 25, TOT 2025")
    
    return True

if __name__ == '__main__':
    try:
        restructure_periods()
        print("\n🎉 Operazione completata con successo!")
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
