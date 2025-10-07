#!/usr/bin/env python3
"""
Integra i dati budget nel database.json principale
"""

import json
from pathlib import Path
from datetime import datetime

def integrate_budget():
    """Integra budget_database_format.json nel database.json"""
    
    # Percorsi file
    budget_file = Path(__file__).parent / 'budget_database_format.json'
    database_file = Path(__file__).parent.parent / 'financial-dashboard/src/data/database.json'
    
    print("🔄 Integrazione Budget in Database Principale\n")
    
    # Carica dati budget
    with open(budget_file, 'r', encoding='utf-8') as f:
        budget_data = json.load(f)
    
    print(f"✅ Caricato budget: {len(budget_data['categories'])} categorie, {len(budget_data['allItems'])} items")
    
    # Carica database esistente
    with open(database_file, 'r', encoding='utf-8') as f:
        database = json.load(f)
    
    print(f"✅ Caricato database esistente")
    
    # Aggiungi sezione budget
    database['budget'] = budget_data
    
    # Aggiorna metadata
    database['metadata']['sources']['budget'] = "Dati da Costi_sviluppo.xlsx - Budget aziendale 2025-2028"
    database['metadata']['validationRules']['budget'] = "Valori numerici >= 0 per tutte le voci di costo"
    
    # Aggiorna versione
    version_parts = database['version'].split('.')
    version_parts[-1] = str(int(version_parts[-1]) + 1)
    database['version'] = '.'.join(version_parts)
    
    # Aggiorna lastUpdate
    database['lastUpdate'] = datetime.now().strftime('%Y-%m-%d')
    
    # Backup del database originale
    backup_file = database_file.parent / f"database_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup creato: {backup_file.name}")
    
    # Salva database aggiornato
    with open(database_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Database aggiornato!")
    print(f"   - Versione: {database['version']}")
    print(f"   - Data: {database['lastUpdate']}")
    print(f"   - Sezioni: {list(database.keys())}")
    
    # Statistiche budget
    print(f"\n📊 Dati Budget Integrati:")
    print(f"   - Periodi: {len(budget_data['periods'])}")
    print(f"   - Categorie: {len(budget_data['categories'])}")
    print(f"   - Voci totali: {len(budget_data['allItems'])}")
    print(f"   - Voci editabili: {sum(1 for i in budget_data['allItems'] if i['isEditable'])}")
    
    return True

if __name__ == '__main__':
    try:
        integrate_budget()
        print("\n✅ Integrazione completata con successo!")
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
