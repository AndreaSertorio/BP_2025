#!/usr/bin/env python3
"""
Popola la sezione valueProposition nel database con dati completi per Eco 3D
"""
import json
import shutil
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
DB_PATH = SCRIPT_DIR / 'src' / 'data' / 'database.json'
DATA_PATH = SCRIPT_DIR / 'vp_complete_data.json'
BACKUP_PATH = DB_PATH.with_suffix('.json.backup_vp')

def main():
    print("="*60)
    print("🔧 RIPRISTINO VALUE PROPOSITION - ECO 3D")
    print("="*60)
    
    # Leggi database
    print("\n📖 Lettura database...")
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    # Verifica struttura valueProposition esiste
    if 'valueProposition' not in db:
        print("❌ Errore: sezione valueProposition non trovata nel database!")
        return
    
    print("✅ Struttura valueProposition trovata")
    
    # Backup
    print(f"\n💾 Creazione backup...")
    shutil.copy(DB_PATH, BACKUP_PATH)
    print(f"✅ Backup creato: {BACKUP_PATH.name}")
    
    # Leggi dati da popolare
    print(f"\n📂 Lettura dati da: {DATA_PATH.name}")
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        vp_data = json.load(f)
    
    # Popola sections
    vp = db['valueProposition']
    timestamp = datetime.now().isoformat() + "Z"
    
    print("\n✨ Popolamento sezioni...")
    
    # Customer Profile - Segments
    print("  → Customer Profile Segments")
    vp['customerProfile']['segments'] = vp_data['segments_data']
    vp['customerProfile']['activeSegmentId'] = 'segment_clinici'
    
    # Value Map
    print("  → Value Map - Products")
    vp['valueMap']['productsAndServices'] = vp_data['products_data']
    
    print("  → Value Map - Pain Relievers")
    vp['valueMap']['painRelievers'] = vp_data['painRelievers_data']
    
    print("  → Value Map - Gain Creators")
    vp['valueMap']['gainCreators'] = vp_data['gainCreators_data']
    
    # Competitor Analysis
    print("  → Competitor Analysis")
    vp['competitorAnalysis']['competitors'] = vp_data['competitors_data']
    vp['competitorAnalysis']['attributeDefinitions'] = vp_data['attributeDefinitions_data']
    
    # Messaging
    print("  → Messaging - Elevator Pitch")
    vp['messaging']['elevatorPitch']['content'] = vp_data['elevatorPitch_data']['content']
    vp['messaging']['elevatorPitch']['wordCount'] = vp_data['elevatorPitch_data']['wordCount']
    vp['messaging']['elevatorPitch']['lastUpdated'] = timestamp
    
    print("  → Messaging - Narrative Flow")
    vp['messaging']['narrativeFlow'] = {
        **vp['messaging']['narrativeFlow'],
        **vp_data['narrativeFlow_data']
    }
    
    print("  → Messaging - Positioning Statement")
    vp['messaging']['positioningStatement'] = {
        **vp['messaging']['positioningStatement'],
        **vp_data['positioningStatement_data'],
        'lastUpdated': timestamp
    }
    
    # Update timestamps
    vp['lastUpdated'] = timestamp
    vp['metadata']['lastReviewed'] = timestamp
    vp['metadata']['completionStatus'] = 85
    
    # Salva database
    print("\n💾 Salvataggio database...")
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("✅ COMPLETATO CON SUCCESSO!")
    print("="*60)
    print(f"\n📊 Statistiche:")
    print(f"  • Segments: {len(vp['customerProfile']['segments'])}")
    print(f"  • Jobs totali: {sum(len(s['jobs']) for s in vp['customerProfile']['segments'])}")
    print(f"  • Pains totali: {sum(len(s['pains']) for s in vp['customerProfile']['segments'])}")
    print(f"  • Gains totali: {sum(len(s['gains']) for s in vp['customerProfile']['segments'])}")
    print(f"  • Features: {sum(len(p['features']) for p in vp['valueMap']['productsAndServices'])}")
    print(f"  • Pain Relievers: {len(vp['valueMap']['painRelievers'])}")
    print(f"  • Gain Creators: {len(vp['valueMap']['gainCreators'])}")
    print(f"  • Competitors: {len(vp['competitorAnalysis']['competitors'])}")
    print(f"  • Completamento: {vp['metadata']['completionStatus']}%")
    print(f"\n💡 Backup disponibile in: {BACKUP_PATH.name}")
    print(f"🚀 Riavvia il server per vedere le modifiche!\n")

if __name__ == '__main__':
    main()
