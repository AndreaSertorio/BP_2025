#!/usr/bin/env python3
"""
REBUILD RADAR BENCHMARKING
Ricostruisce il radar basandosi sui dati REALISTICI del BP_2025_01.md
Con 10 feature, scala 0-3, e 4 cluster competitive
"""

import json

DB_PATH = '/Users/dracs/Documents/START_UP/DOC PROGETTI/DOC_ECO 3d Multisonda/__BP 2025/financial-dashboard/src/data/database.json'

def create_realistic_radar():
    """
    Crea radar basato sui dati del BP_2025_01.md (sezione 4.6)
    """
    
    print("=" * 80)
    print("REBUILDING RADAR BENCHMARKING - REALISTIC DATA FROM BP")
    print("=" * 80)
    print()
    
    # 10 Feature dal BP con pesi corretti
    dimensions = [
        {
            "id": "dim_3d_4d_volumetric",
            "name": "3D/4D Volumetrico Real-time",
            "weight": 0.15,
            "maxScore": 3,
            "description": "Capacità di acquisizione volumetrica 3D/4D con frame rate real-time (>3 vol/s)"
        },
        {
            "id": "dim_ai_guidance",
            "name": "AI Guida/Auto-misure",
            "weight": 0.10,
            "maxScore": 3,
            "description": "AI per guida posizionamento sonde e misurazioni automatiche"
        },
        {
            "id": "dim_multi_probe",
            "name": "Multi-probe Sync",
            "weight": 0.10,
            "maxScore": 3,
            "description": "Sincronizzazione simultanea di multiple sonde per copertura angolare"
        },
        {
            "id": "dim_automation",
            "name": "Automazione/Hands-free",
            "weight": 0.10,
            "maxScore": 3,
            "description": "Livello di automazione acquisizione, riduzione operator-dependency"
        },
        {
            "id": "dim_exam_time",
            "name": "Tempo Esame (velocità)",
            "weight": 0.15,
            "maxScore": 3,
            "description": "Velocità esame - score alto = tempo basso (≤5 min = 3, 10-20 min = 1)"
        },
        {
            "id": "dim_multi_district",
            "name": "Multi-distretto Anatomico",
            "weight": 0.10,
            "maxScore": 3,
            "description": "Capacità di coprire multipli distretti anatomici (non solo seno/cardio)"
        },
        {
            "id": "dim_portability",
            "name": "Portabilità",
            "weight": 0.10,
            "maxScore": 3,
            "description": "Handheld/portable (3) vs Cart-based (1)"
        },
        {
            "id": "dim_ris_pacs",
            "name": "Integrazione RIS/PACS",
            "weight": 0.05,
            "maxScore": 3,
            "description": "Integrazione con sistemi informativi ospedalieri (DICOM, HL7, API)"
        },
        {
            "id": "dim_tco",
            "name": "TCO Atteso (economicità)",
            "weight": 0.10,
            "maxScore": 3,
            "description": "Total Cost of Ownership - score alto = costo basso (€100/esame = 3, €500+ = 1)"
        },
        {
            "id": "dim_maturity",
            "name": "Maturità (CE/FDA)",
            "weight": 0.05,
            "maxScore": 3,
            "description": "Certificazioni e maturità prodotto (CE/FDA = 3, R&D = 1)"
        }
    ]
    
    # 4 Cluster dal BP (invece di singoli competitor)
    # Score dalla tabella BP_2025_01.md linee 262-277
    competitors = [
        {
            "competitorId": "cluster_eco3d",
            "name": "Eco 3D (Target)",
            "shortName": "Eco 3D",
            "isCluster": True,
            "isReference": True,
            "color": "#00D2FF",
            "scores": {
                "dim_3d_4d_volumetric": 3,  # ✔︎ target 3-5 vol/s
                "dim_ai_guidance": 3,        # ✔︎ 
                "dim_multi_probe": 3,        # ✔︎ unique feature
                "dim_automation": 2,         # ◔ robotica/guide v1
                "dim_exam_time": 3,          # ≤5 min
                "dim_multi_district": 3,     # ✔︎
                "dim_portability": 3,        # HH/Port
                "dim_ris_pacs": 3,           # ✔︎ DICOM/API
                "dim_tco": 2,                # €-€€ (~€100-125/esame)
                "dim_maturity": 1            # R&D (pre-CE)
            },
            "totalScore": 2.70,  # Dal BP
            "description": "Sistema portatile multi-sonda con volumetria 3D/4D real-time e AI"
        },
        {
            "competitorId": "cluster_console_3d",
            "name": "Console 3D Premium",
            "shortName": "Console 3D",
            "isCluster": True,
            "isReference": False,
            "color": "#8B5CF6",  # Purple
            "scores": {
                "dim_3d_4d_volumetric": 3,  # ✔︎ console premium
                "dim_ai_guidance": 2,        # ◔ parziale
                "dim_multi_probe": 0,        # ✖︎ assente
                "dim_automation": 1,         # ◔ limitato (ABUS separato)
                "dim_exam_time": 1,          # 10-20 min
                "dim_multi_district": 3,     # ✔︎
                "dim_portability": 1,        # Cart
                "dim_ris_pacs": 3,           # ✔︎
                "dim_tco": 1,                # €€€ alto
                "dim_maturity": 3            # CE/FDA
            },
            "totalScore": 1.70,  # Dal BP
            "description": "GE Voluson, Philips EPIQ, Samsung HERA - console carrellati premium"
        },
        {
            "competitorId": "cluster_abus",
            "name": "ABUS/ABVS (Seno Automatico)",
            "shortName": "ABUS/ABVS",
            "isCluster": True,
            "isReference": False,
            "color": "#EF4444",  # Red
            "scores": {
                "dim_3d_4d_volumetric": 3,  # ✔︎ volumetria seno
                "dim_ai_guidance": 1,        # ◔ limitato
                "dim_multi_probe": 0,        # ✖︎
                "dim_automation": 3,         # ✔︎ hands-free (distretto unico)
                "dim_exam_time": 1,          # 15-20 min
                "dim_multi_district": 0,     # ✖︎ solo seno
                "dim_portability": 0,        # Cart dedicato
                "dim_ris_pacs": 3,           # ✔︎
                "dim_tco": 1,                # €€€ alto
                "dim_maturity": 3            # CE/FDA
            },
            "totalScore": 1.40,  # Dal BP
            "description": "GE Invenia ABUS, Siemens ABVS - automazione breast-only"
        },
        {
            "competitorId": "cluster_handheld_2d",
            "name": "Handheld 2D (POCUS)",
            "shortName": "Handheld 2D",
            "isCluster": True,
            "isReference": False,
            "color": "#10B981",  # Green
            "scores": {
                "dim_3d_4d_volumetric": 0,  # ✖︎ solo 2D
                "dim_ai_guidance": 1,        # ◔ limitato
                "dim_multi_probe": 0,        # ✖︎
                "dim_automation": 0,         # ✖︎
                "dim_exam_time": 2,          # 2-5 min (ma 2D)
                "dim_multi_district": 2,     # ◔ multi ma solo 2D
                "dim_portability": 3,        # ✔︎ HH
                "dim_ris_pacs": 1,           # ◔ limitato
                "dim_tco": 3,                # € basso
                "dim_maturity": 3            # CE/FDA
            },
            "totalScore": 1.40,  # Dal BP
            "description": "Butterfly iQ, Clarius - portabili economici ma solo 2D"
        }
    ]
    
    print("📊 Created 10 realistic dimensions (scale 0-3):")
    for dim in dimensions:
        print(f"   • {dim['name']}: weight={dim['weight']}, max={dim['maxScore']}")
    print()
    
    print("🎯 Created 4 competitive clusters:")
    for comp in competitors:
        print(f"   • {comp['name']}: totalScore={comp['totalScore']}/3")
    print()
    
    return {
        "enabled": True,
        "description": "Analisi competitiva su 10 dimensioni chiave (scala 0-3) per cluster strategici",
        "dimensions": dimensions,
        "competitors": competitors,
        "methodology": {
            "scale": "0-3 per feature",
            "source": "BP_2025_01.md sezione 4.6 - Scoring ponderato",
            "lastUpdate": "2025-10-21",
            "notes": [
                "Score 3 = eccellenza nella feature",
                "Score 2 = buono/parziale", 
                "Score 1 = limitato/debole",
                "Score 0 = assente",
                "Total Score ponderato con pesi dimensioni"
            ]
        }
    }

def update_database():
    """
    Aggiorna il database con il radar realistico
    """
    print("📖 Reading database.json...")
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    # Get old benchmarking for comparison
    old_bench = db.get('competitorAnalysis', {}).get('frameworks', {}).get('benchmarking', {})
    old_competitors = old_bench.get('competitors', [])
    
    print(f"✓ Found {len(old_competitors)} old competitors")
    print()
    
    # Create new realistic radar
    new_bench = create_realistic_radar()
    
    # Update database
    db['competitorAnalysis']['frameworks']['benchmarking'] = new_bench
    
    # Save
    print("💾 Saving updated database...")
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print("✓ Database saved successfully!")
    print()
    
    # Validation
    print("=" * 80)
    print("VALIDATION - BENCHMARKING RADAR")
    print("=" * 80)
    print()
    
    print("📊 DIMENSIONS (10):")
    for dim in new_bench['dimensions']:
        print(f"   {dim['name']}: weight={dim['weight']}, max={dim['maxScore']}")
    print()
    
    print("🎯 CLUSTERS SCORES:")
    for comp in new_bench['competitors']:
        name = comp['name']
        total = comp['totalScore']
        ref_badge = " [REFERENCE]" if comp.get('isReference') else ""
        print(f"   {name}{ref_badge}: {total}/3.0")
        
        # Show top 3 strengths
        scores_list = [(k.replace('dim_', '').replace('_', ' ').title(), v) 
                       for k, v in comp['scores'].items()]
        scores_list.sort(key=lambda x: x[1], reverse=True)
        print(f"      Top strengths: {', '.join([f'{k}({v})' for k, v in scores_list[:3]])}")
    
    print()
    print("=" * 80)
    print("✅ RADAR BENCHMARKING REBUILT!")
    print("=" * 80)
    print()
    print("🔄 NEXT STEPS:")
    print("1. Ricarica il browser (Cmd+R)")
    print("2. Vai a Competitor Analysis > Benchmarking")
    print("3. Verifica il RADAR con 4 cluster (Eco 3D, Console, ABUS, Handheld)")
    print("4. Controlla che i score siano realistici (scala 0-3)")
    print()
    
    return True

if __name__ == '__main__':
    success = update_database()
    exit(0 if success else 1)
