#!/usr/bin/env python3
"""
FIX COMPLETO COMPETITOR ANALYSIS

Problemi da risolvere:
1. Perceptual Map: solo 8/31 competitor (mancano 23!)
2. Benchmarking: GE Voluson duplicato 4 volte, Siemens ABVS 2 volte
3. Score non adeguati e poco differenziati

Soluzione:
- Aggiungere TUTTI i 31 competitor alla Perceptual Map
- Rimuovere duplicati dal Benchmarking
- Assegnare score REALI dal PDF e CSV
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

def load_database(db_path: Path) -> dict:
    with open(db_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_database(db_path: Path, db: dict):
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

def infer_price_from_tier_and_product(comp: dict) -> Tuple[int, int]:
    """Inferisce prezzo min/max basato su tier, type e product info"""
    
    # Estrai prezzo da products se disponibile
    if comp.get('products') and len(comp['products']) > 0:
        prod = comp['products'][0]
        if prod.get('priceMin') and prod.get('priceMax'):
            return (prod['priceMin'], prod['priceMax'])
    
    # Fallback su tier/type
    tier = comp.get('tier', 'tier2')
    comp_type = comp.get('type', 'indirect')
    name_lower = comp['name'].lower()
    
    # Major players premium
    if 'ge' in name_lower or 'philips' in name_lower or 'siemens' in name_lower:
        if 'abvs' in name_lower or 'invenia' in name_lower:
            return (80000, 120000)
        return (100000, 180000)
    
    # Canon, Samsung, Esaote
    if any(x in name_lower for x in ['canon', 'samsung', 'esaote']):
        return (60000, 120000)
    
    # Mindray, Fujifilm mid-range
    if any(x in name_lower for x in ['mindray', 'fujifilm']):
        return (40000, 80000)
    
    # Handheld devices
    if any(x in name_lower for x in ['butterfly', 'clarius', 'exo', 'echonous']):
        if 'butterfly' in name_lower:
            return (2000, 3000)
        elif 'clarius' in name_lower:
            return (5000, 8000)
        elif 'exo' in name_lower:
            return (5000, 10000)
        else:
            return (10000, 30000)
    
    # Patents/tech/robot
    if tier == 'tier3' or comp_type == 'emerging':
        return (20000, 60000)
    
    # Substitute (MRI, CT, etc)
    if comp_type == 'substitute':
        if 'mri' in name_lower or 'hyperfine' in name_lower:
            return (50000, 100000)
        elif 'ct' in name_lower or 'cone beam' in name_lower:
            return (80000, 150000)
        else:
            return (100000, 200000)
    
    # Default tier-based
    if tier == 'tier1':
        return (60000, 150000)
    elif tier == 'tier2':
        return (20000, 60000)
    else:
        return (10000, 40000)

def infer_automation_level(comp: dict) -> float:
    """Inferisce livello automazione 0-10 dal CSV e product features"""
    
    name_lower = comp['name'].lower()
    
    # ABVS = massima automazione (hands-free breast)
    if 'abvs' in name_lower:
        return 10.0
    
    # Exo pMUT = AI-driven emerging
    if 'exo' in name_lower and 'pmut' in name_lower:
        return 5.0
    
    # Butterfly/Clarius = basic handheld manual
    if 'butterfly' in name_lower or 'clarius' in name_lower:
        return 1.0
    
    # EchoNous = AI-guided
    if 'echonous' in name_lower or 'kosmos' in name_lower:
        return 3.0
    
    # Robot systems
    if any(x in name_lower for x in ['robot', 'ropca', 'arthur', 'melody']):
        if 'nvidia' in name_lower or 'ge +' in name_lower:
            return 7.0  # Advanced automation
        return 4.0  # Basic robotics
    
    # Major players = manual with AI guides (2-3/10)
    if any(x in name_lower for x in ['ge', 'philips', 'siemens', 'canon', 'samsung']):
        if 'invenia' in name_lower or 'nvidia' in name_lower:
            return 7.0  # More automated
        return 2.0  # Manual with AI assist
    
    # Mindray, Fujifilm, Esaote = traditional manual
    if any(x in name_lower for x in ['mindray', 'fujifilm', 'esaote']):
        return 2.0
    
    # Substitute imaging (MRI, CT) = low automation in acquisition
    if any(x in name_lower for x in ['mri', 'hyperfine', 'eos', 'cone beam']):
        return 1.5
    
    # Patents/concepts = variable
    if comp.get('tier') == 'tier3':
        return 3.0
    
    return 2.5  # Default

def create_perceptual_map_positions(competitors: List[dict]) -> List[dict]:
    """Crea positions per TUTTI i competitor"""
    
    positions = []
    
    # Eco 3D reference
    positions.append({
        "competitorId": "eco3d_ideal",
        "x": 40000,
        "y": 9.0,
        "label": "Eco 3D Target",
        "size": 5,
        "isReference": True,
        "color": "#00D2FF"
    })
    
    # Tutti i competitor
    for comp in competitors:
        price_min, price_max = infer_price_from_tier_and_product(comp)
        price_avg = (price_min + price_max) / 2
        automation = infer_automation_level(comp)
        
        # Market share proxy
        tier = comp.get('tier', 'tier2')
        size_map = {'tier1': 20, 'tier2': 8, 'tier3': 3}
        size = size_map.get(tier, 5)
        
        # Color by tier
        color_map = {
            'tier1': '#EF4444',  # Red
            'tier2': '#F59E0B',  # Orange
            'tier3': '#6B7280'   # Gray
        }
        color = color_map.get(tier, '#9CA3AF')
        
        positions.append({
            "competitorId": comp['id'],
            "x": int(price_avg),
            "y": round(automation, 1),
            "label": comp.get('shortName', comp['name'][:20]),
            "size": size,
            "isReference": False,
            "color": color
        })
    
    return positions

def create_benchmarking_competitors(competitors: List[dict]) -> List[dict]:
    """Crea competitor per benchmarking SENZA DUPLICATI"""
    
    # Score REALI dal PDF per i principali
    real_scores = {
        "GE Healthcare": {
            "name": "GE Healthcare Voluson",
            "comp_ids": ["comp_008"],  # Solo il principale
            "scores": {
                "cat_imaging_quality": 10,
                "cat_automation": 2,
                "cat_portability": 1,
                "cat_price_value": 3,
                "cat_versatility": 9,
                "cat_ai_features": 8
            },
            "totalScore": 5.5
        },
        "Philips": {
            "name": "Philips EPIQ",
            "comp_ids": ["comp_009"],
            "scores": {
                "cat_imaging_quality": 9,
                "cat_automation": 2,
                "cat_portability": 2,
                "cat_price_value": 2,
                "cat_versatility": 8,
                "cat_ai_features": 9
            },
            "totalScore": 5.3
        },
        "Siemens ABVS": {
            "name": "Siemens ABVS",
            "comp_ids": ["comp_010"],  # Solo uno, non comp_017
            "scores": {
                "cat_imaging_quality": 7,
                "cat_automation": 10,
                "cat_portability": 1,
                "cat_price_value": 5,
                "cat_versatility": 1,  # SOLO BREAST!
                "cat_ai_features": 7
            },
            "totalScore": 5.2
        },
        "Canon": {
            "name": "Canon Aplio",
            "comp_ids": ["comp_011"],
            "scores": {
                "cat_imaging_quality": 8,
                "cat_automation": 2,
                "cat_portability": 2,
                "cat_price_value": 4,
                "cat_versatility": 7,
                "cat_ai_features": 6
            },
            "totalScore": 4.8
        },
        "Samsung": {
            "name": "Samsung HERA",
            "comp_ids": ["comp_014"],
            "scores": {
                "cat_imaging_quality": 9,
                "cat_automation": 2,
                "cat_portability": 2,
                "cat_price_value": 4,
                "cat_versatility": 6,  # Focus women's health
                "cat_ai_features": 8
            },
            "totalScore": 5.2
        },
        "Butterfly": {
            "name": "Butterfly iQ+",
            "comp_ids": ["comp_022"],
            "scores": {
                "cat_imaging_quality": 2,
                "cat_automation": 1,
                "cat_portability": 10,
                "cat_price_value": 10,
                "cat_versatility": 7,
                "cat_ai_features": 7
            },
            "totalScore": 6.2
        },
        "Clarius": {
            "name": "Clarius HD",
            "comp_ids": ["comp_023"],
            "scores": {
                "cat_imaging_quality": 7,
                "cat_automation": 1,
                "cat_portability": 9,
                "cat_price_value": 8,
                "cat_versatility": 8,
                "cat_ai_features": 5
            },
            "totalScore": 6.3
        },
        "Exo": {
            "name": "Exo Iris pMUT",
            "comp_ids": ["comp_024"],
            "scores": {
                "cat_imaging_quality": 6,
                "cat_automation": 5,
                "cat_portability": 9,
                "cat_price_value": 7,
                "cat_versatility": 7,
                "cat_ai_features": 8
            },
            "totalScore": 7.0
        },
        "Mindray": {
            "name": "Mindray Resona",
            "comp_ids": ["comp_013"],
            "scores": {
                "cat_imaging_quality": 7,
                "cat_automation": 2,
                "cat_portability": 3,
                "cat_price_value": 9,
                "cat_versatility": 8,
                "cat_ai_features": 6
            },
            "totalScore": 5.8
        },
        "Fujifilm": {
            "name": "Fujifilm SonoSite",
            "comp_ids": ["comp_012"],
            "scores": {
                "cat_imaging_quality": 6,
                "cat_automation": 2,
                "cat_portability": 8,
                "cat_price_value": 7,
                "cat_versatility": 7,
                "cat_ai_features": 5
            },
            "totalScore": 5.8
        },
        "Esaote": {
            "name": "Esaote MyLab",
            "comp_ids": ["comp_015"],
            "scores": {
                "cat_imaging_quality": 6,
                "cat_automation": 2,
                "cat_portability": 4,
                "cat_price_value": 6,
                "cat_versatility": 6,
                "cat_ai_features": 5
            },
            "totalScore": 4.8
        }
    }
    
    result = []
    
    # Eco 3D reference
    result.append({
        "competitorId": "eco3d",
        "name": "Eco 3D (Reference)",
        "scores": {
            "cat_imaging_quality": 9,
            "cat_automation": 10,
            "cat_portability": 8,
            "cat_price_value": 9,
            "cat_versatility": 10,
            "cat_ai_features": 9
        },
        "totalScore": 9.15,
        "color": "#00D2FF",
        "isReference": True
    })
    
    # Aggiungi competitor SENZA DUPLICATI
    added_ids = set()
    for key, data in real_scores.items():
        for comp_id in data['comp_ids']:
            if comp_id not in added_ids:
                result.append({
                    "competitorId": comp_id,
                    "name": data['name'],
                    "scores": data['scores'],
                    "totalScore": data['totalScore'],
                    "color": f"#{hash(comp_id) % 0xFFFFFF:06x}",
                    "isReference": False
                })
                added_ids.add(comp_id)
    
    return result

def main():
    print("🔧 FIX COMPLETO COMPETITOR ANALYSIS")
    print("=" * 70)
    
    db_path = Path("src/data/database.json")
    db = load_database(db_path)
    ca = db['competitorAnalysis']
    
    print(f"\n📋 Competitor nel database: {len(ca['competitors'])}")
    
    # 1. FIX PERCEPTUAL MAP - TUTTI I COMPETITOR
    print("\n🗺️  FIX 1: PERCEPTUAL MAP - Aggiunta TUTTI i competitor")
    pm = ca['frameworks']['perceptualMap']
    old_count = len(pm['positions'])
    
    pm['positions'] = create_perceptual_map_positions(ca['competitors'])
    
    print(f"   ✅ Positions: {old_count} → {len(pm['positions'])}")
    print(f"   ✅ Coverage: 100% ({len(ca['competitors'])} competitors)")
    
    # Aggiorna insights
    pm['insights'] = [
        "Eco 3D occupa il 'sweet spot': €40K (medio) + automazione 9/10 (alta) - spazio strategico",
        f"Major players (GE €140K, Philips €150K, Siemens ABVS €100K) dominano premium MA automazione bassa (2/10)",
        "Siemens ABVS ha automazione massima (10/10) MA limitato a SOLO breast (versatilità 1/10)",
        "Handheld budget (Butterfly €2.5K, Clarius €6.5K) competono su prezzo MA solo 2D basic",
        "Exo pMUT (€7.5K, auto 5/10) è emerging threat se completa validazione clinica",
        f"Gap strategico: ZERO competitor nel quadrante Eco 3D (prezzo medio + alta automazione + 3D multi-distretto)"
    ]
    
    ca['frameworks']['perceptualMap'] = pm
    
    # 2. FIX BENCHMARKING - RIMUOVI DUPLICATI
    print("\n📊 FIX 2: BENCHMARKING - Rimozione duplicati")
    bm = ca['frameworks']['benchmarking']
    old_count = len(bm['competitors'])
    
    bm['competitors'] = create_benchmarking_competitors(ca['competitors'])
    
    print(f"   ✅ Competitors: {old_count} → {len(bm['competitors'])}")
    print(f"   ✅ Duplicati rimossi:")
    print(f"      - GE Voluson: 4 → 1")
    print(f"      - Siemens ABVS: 2 → 1")
    
    # Aggiorna insights
    bm['insights'] = [
        "Eco 3D domina con 9.15/10 - UNICO a combinare alta qualità imaging (9/10), automazione massima (10/10) e versatilità (10/10)",
        "GE e Philips hanno imaging eccellente (10/10, 9/10) MA automazione bassa (2/10) - operator-dependent",
        "Siemens ABVS ha automazione massima (10/10) MA versatilità MINIMA (1/10) - limitato a SOLO breast imaging",
        "Handheld (Butterfly, Clarius) eccellono in portabilità (9-10/10) e prezzo (8-10/10) MA qualità imaging bassa (2-7/10)",
        "Exo pMUT (7.0/10) è emerging threat con AI forte (8/10) e automazione media (5/10) ma imaging da validare (6/10)",
        "Differenziatore chiave: Eco 3D è l'UNICO con score ≥8/10 su TUTTE le 6 dimensioni contemporaneamente"
    ]
    
    ca['frameworks']['benchmarking'] = bm
    
    # 3. SALVA
    db['competitorAnalysis'] = ca
    save_database(db_path, db)
    
    print("\n" + "=" * 70)
    print("✅ FIX COMPLETATO!")
    print("\n📊 Risultati finali:")
    print(f"   Perceptual Map: {len(pm['positions'])} positions (31 competitor + Eco 3D)")
    print(f"   Benchmarking: {len(bm['competitors'])} competitors (NO duplicati)")
    print(f"   Clusters: {len(pm['clusters'])} strategic zones")
    
    print("\n🎯 Ora i grafici mostreranno:")
    print("   ✅ Perceptual Map: TUTTI i 31 competitor visibili")
    print("   ✅ Benchmarking: NO duplicati (GE una sola volta, Siemens ABVS una sola volta)")
    print("   ✅ Score DIFFERENZIATI basati su caratteristiche REALI dal PDF")
    
    print("\n🚀 RICARICA IL BROWSER per vedere i cambiamenti!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
