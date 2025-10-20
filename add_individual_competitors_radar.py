#!/usr/bin/env python3
"""
ADD INDIVIDUAL COMPETITORS TO RADAR
Aggiunge i competitor singoli dalla tabella 4.1 del BP oltre ai cluster
"""

import json

DB_PATH = '/Users/dracs/Documents/START_UP/DOC PROGETTI/DOC_ECO 3d Multisonda/__BP 2025/financial-dashboard/src/data/database.json'

def score_from_symbol(symbol, feature_type='generic'):
    """
    Converte simboli della tabella 4.1 in score 0-3
    ✔︎ = 3 (sì/forte)
    ◔ = 2 o 1 (parziale/limitato) 
    ✖︎ = 0 (assente)
    """
    if '✔' in symbol or symbol == 'CE/FDA':
        return 3
    elif '◔' in symbol:
        # Partial - depends on context
        if 'ABUS' in symbol or 'limitato' in symbol:
            return 1
        return 2
    elif '✖' in symbol or 'R&D' in symbol:
        return 0 if feature_type != 'maturity' else 1
    
    # Time exam - convert minutes to score
    if 'min' in symbol:
        if '≤5' in symbol or '2-5' in symbol:
            return 3
        elif '10-20' in symbol or '15-20' in symbol:
            return 1
        return 2
    
    # Portability
    if symbol == 'HH/Port' or symbol == 'HH':
        return 3
    elif symbol == 'Port/Cart':
        return 2
    elif symbol == 'Cart':
        return 1
    
    # TCO
    if symbol == '€':
        return 3
    elif symbol == '€-€€' or symbol == '€€':
        return 2
    elif symbol == '€€€':
        return 1
    
    return 2  # default

def create_individual_competitors():
    """
    Crea competitor individuali dalla tabella 4.1 del BP
    """
    
    # Mapping dalla tabella 4.1 (10 features)
    # Format: name, 3D/4D, AI, Multi-probe, Automation, Time, Multi-district, Portability, RIS/PACS, TCO, Maturity
    
    competitors_data = [
        {
            "id": "ge_voluson",
            "name": "GE Voluson / Vivid / Logiq",
            "shortName": "GE Voluson",
            "type": "Console 3D Premium",
            "color": "#751D49",
            "scores": {
                "dim_3d_4d_volumetric": 3,     # ✔︎ console premium
                "dim_ai_guidance": 3,           # ✔︎ Caption AI
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 1,            # ◔ ABUS su linee dedicate
                "dim_exam_time": 1,             # 10-20 min
                "dim_multi_district": 3,        # ✔︎
                "dim_portability": 1,           # Cart (anche se Vscan HH è separato)
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "philips_epiq",
            "name": "Philips EPIQ/xMATRIX · Lumify",
            "shortName": "Philips EPIQ",
            "type": "Console 3D Premium",
            "color": "#AB6615",
            "scores": {
                "dim_3d_4d_volumetric": 3,     # ✔︎ console premium
                "dim_ai_guidance": 3,           # ✔︎ AI cardiac quant
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 1,             # 10-20 min
                "dim_multi_district": 3,        # ✔︎
                "dim_portability": 1,           # Cart / Port / USB
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "ge_invenia_abus",
            "name": "GE Invenia ABUS (seno)",
            "shortName": "GE ABUS",
            "type": "ABUS/ABVS",
            "color": "#DC2626",
            "scores": {
                "dim_3d_4d_volumetric": 3,     # ✔︎ volumetria seno
                "dim_ai_guidance": 1,           # ◔ limitato
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 3,            # ✔︎ hands-free breast
                "dim_exam_time": 1,             # 15-20 min
                "dim_multi_district": 0,        # ✖︎ solo seno
                "dim_portability": 0,           # Cart
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "siemens_abvs",
            "name": "Siemens ABVS (seno)",
            "shortName": "Siemens ABVS",
            "type": "ABUS/ABVS",
            "color": "#EA580C",
            "scores": {
                "dim_3d_4d_volumetric": 3,     # ✔︎ volumetria seno
                "dim_ai_guidance": 1,           # ◔ limitato
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 3,            # ✔︎ hands-free breast
                "dim_exam_time": 1,             # 15-20 min
                "dim_multi_district": 0,        # ✖︎ solo seno
                "dim_portability": 0,           # Cart
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "canon_aplio",
            "name": "Canon Aplio i-Series",
            "shortName": "Canon Aplio",
            "type": "Console 3D Premium",
            "color": "#0A529C",
            "scores": {
                "dim_3d_4d_volumetric": 2,     # ◔ 3D manuale
                "dim_ai_guidance": 2,           # ◔
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 1,             # 10-20 min
                "dim_multi_district": 3,        # ✔︎
                "dim_portability": 1,           # Cart
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "samsung_hera",
            "name": "Samsung HERA/RS/Z20",
            "shortName": "Samsung HERA",
            "type": "Console 3D Premium",
            "color": "#3E1203",
            "scores": {
                "dim_3d_4d_volumetric": 3,     # ✔︎ 4D ostetrico
                "dim_ai_guidance": 3,           # ✔︎ S-Detect
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 1,             # 10-20 min
                "dim_multi_district": 2,        # ◔ focus WH
                "dim_portability": 1,           # Cart
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 1,                   # €€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "esaote_mylab",
            "name": "Esaote MyLab Omega/Alpha",
            "shortName": "Esaote MyLab",
            "type": "Console Mid-range",
            "color": "#7C3AED",
            "scores": {
                "dim_3d_4d_volumetric": 2,     # ◔ 3D niche
                "dim_ai_guidance": 2,           # ◔
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 1,             # 10-20 min
                "dim_multi_district": 2,        # ◔ MSK focus
                "dim_portability": 2,           # Port/Cart
                "dim_ris_pacs": 3,              # ✔︎
                "dim_tco": 2,                   # €€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "butterfly_iq",
            "name": "Butterfly iQ",
            "shortName": "Butterfly",
            "type": "Handheld 2D",
            "color": "#10B981",
            "scores": {
                "dim_3d_4d_volumetric": 0,     # ✖︎ solo 2D
                "dim_ai_guidance": 2,           # ◔ guidance
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 3,             # 2-5 min (2D)
                "dim_multi_district": 3,        # ✔︎ 2D multi
                "dim_portability": 3,           # HH
                "dim_ris_pacs": 1,              # ◔ limitato
                "dim_tco": 3,                   # € basso
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "clarius",
            "name": "Clarius",
            "shortName": "Clarius",
            "type": "Handheld 2D",
            "color": "#059669",
            "scores": {
                "dim_3d_4d_volumetric": 0,     # ✖︎ solo 2D
                "dim_ai_guidance": 2,           # ◔
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 3,             # 2-5 min (2D)
                "dim_multi_district": 3,        # ✔︎ 2D multi
                "dim_portability": 3,           # HH
                "dim_ris_pacs": 1,              # ◔ limitato
                "dim_tco": 2,                   # €-€€
                "dim_maturity": 3               # CE/FDA
            }
        },
        {
            "id": "exo_iris",
            "name": "Exo Iris (pMUT)",
            "shortName": "Exo Iris",
            "type": "Handheld 2D (R&D)",
            "color": "#84CC16",
            "scores": {
                "dim_3d_4d_volumetric": 1,     # ◔ promesso
                "dim_ai_guidance": 2,           # ◔
                "dim_multi_probe": 0,           # ✖︎
                "dim_automation": 0,            # ✖︎
                "dim_exam_time": 3,             # 2-5 min atteso
                "dim_multi_district": 3,        # ✔︎
                "dim_portability": 3,           # HH
                "dim_ris_pacs": 1,              # ◔
                "dim_tco": 2,                   # €? presumed mid
                "dim_maturity": 1               # R&D
            }
        }
    ]
    
    # Calculate weighted scores
    weights = {
        "dim_3d_4d_volumetric": 0.15,
        "dim_ai_guidance": 0.10,
        "dim_multi_probe": 0.10,
        "dim_automation": 0.10,
        "dim_exam_time": 0.15,
        "dim_multi_district": 0.10,
        "dim_portability": 0.10,
        "dim_ris_pacs": 0.05,
        "dim_tco": 0.10,
        "dim_maturity": 0.05
    }
    
    for comp in competitors_data:
        total = sum(comp['scores'][dim] * weights[dim] for dim in weights.keys())
        comp['totalScore'] = round(total, 2)
        comp['competitorId'] = comp['id']
        comp['isCluster'] = False
        comp['isReference'] = False
        comp['description'] = f"{comp['type']} - Score {comp['totalScore']}/3"
    
    return competitors_data

def add_to_database():
    """
    Aggiunge i competitor individuali al database mantenendo i cluster
    """
    print("=" * 80)
    print("ADDING INDIVIDUAL COMPETITORS TO RADAR")
    print("=" * 80)
    print()
    
    # Load database
    print("📖 Reading database.json...")
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    bench = db['competitorAnalysis']['frameworks']['benchmarking']
    existing = bench['competitors']
    
    print(f"✓ Found {len(existing)} existing entries (4 clusters)")
    print()
    
    # Create individual competitors
    print("🏢 Creating 10 individual competitors from BP table 4.1...")
    individuals = create_individual_competitors()
    
    for comp in individuals:
        print(f"   • {comp['name']}: {comp['totalScore']}/3 ({comp['type']})")
    print()
    
    # Add to competitors list
    bench['competitors'].extend(individuals)
    
    print(f"📊 Total competitors now: {len(bench['competitors'])} (4 clusters + 10 individuals)")
    print()
    
    # Save
    print("💾 Saving database...")
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print("✓ Database saved!")
    print()
    
    print("=" * 80)
    print("✅ INDIVIDUAL COMPETITORS ADDED!")
    print("=" * 80)
    print()
    print("🔄 NEXT STEPS:")
    print("1. Ricarica il browser (Cmd+R)")
    print("2. Vai a Competitor Analysis > Benchmarking")
    print("3. Ora puoi selezionare:")
    print("   - 4 CLUSTER (Eco 3D, Console, ABUS, Handheld)")
    print("   - 10 SINGOLI (GE, Philips, Siemens, Canon, Samsung, etc.)")
    print("4. Confronta fino a 4 alla volta!")
    print()
    
    return True

if __name__ == '__main__':
    success = add_to_database()
    exit(0 if success else 1)
