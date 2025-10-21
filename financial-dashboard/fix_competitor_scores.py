#!/usr/bin/env python3
"""
FIX COMPETITOR ANALYSIS - SCORE REALI DAL PDF

Problema: Gli score attuali sono troppo uniformi (tutti 5/10)
Soluzione: Aggiornare con score REALI basati sul PDF di analisi competitiva

Score basati su caratteristiche REALI estratte dal PDF:
- GE Healthcare: imaging 10/10, automazione 2/10, portabilità 1/10, prezzo 3/10
- Philips: imaging 9/10, automazione 2/10, portabilità 2/10, prezzo 2/10  
- Siemens ABVS: imaging 7/10, automazione 10/10, portabilità 1/10, versatilità 1/10 (SOLO BREAST!)
- Butterfly iQ: imaging 2/10, automazione 1/10, portabilità 10/10, prezzo 10/10, AI 7/10
- Clarius: imaging 7/10, automazione 1/10, portabilità 9/10, prezzo 8/10
- Exo pMUT: imaging 6/10, automazione 5/10, portabilità 9/10, AI 8/10 (emerging)
- Mindray: imaging 7/10, automazione 2/10, prezzo 9/10
"""

import json
import sys
from pathlib import Path

def main():
    print("🔧 FIX COMPETITOR SCORES - DATI REALI DAL PDF")
    print("=" * 70)
    
    db_path = Path("src/data/database.json")
    
    # Leggi database
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    ca = db['competitorAnalysis']
    bm = ca['frameworks']['benchmarking']
    
    print("\n📊 AGGIORNAMENTO BENCHMARKING con SCORE REALI\n")
    
    # Score REALI basati sul PDF (scale 0-10)
    # cat_imaging_quality, cat_automation, cat_portability, cat_price_value, cat_versatility, cat_ai_features
    
    real_scores = {
        "eco3d": {
            "name": "Eco 3D (Reference)",
            "scores": {
                "cat_imaging_quality": 9,    # 3D/4D real-time di qualità
                "cat_automation": 10,          # Multi-sonda auto-sincronizzata + AI
                "cat_portability": 8,          # Handheld/compact design
                "cat_price_value": 9,          # €40K = ottimo rapporto
                "cat_versatility": 10,         # Multi-distretto completo
                "cat_ai_features": 9           # AI end-to-end integrata
            },
            "totalScore": 9.15,
            "color": "#00D2FF",
            "isReference": True
        },
        "ge-healthcare": {
            "name": "GE Voluson/Vivid",
            "scores": {
                "cat_imaging_quality": 10,   # Best-in-class 4D obstetric/cardio
                "cat_automation": 2,          # Caption AI guides ma scansione manuale
                "cat_portability": 1,         # Console carrellate pesanti
                "cat_price_value": 3,         # €100K-180K = costoso
                "cat_versatility": 9,         # Multi-distretto ma sistemi dedicati
                "cat_ai_features": 8          # AI avanzata (120 calcoli auto)
            },
            "totalScore": 5.5
        },
        "philips-healthcare": {
            "name": "Philips EPIQ/Affiniti",
            "scores": {
                "cat_imaging_quality": 9,    # xMATRIX, Live 3D Echo eccellente
                "cat_automation": 2,          # Anatomical Intelligence ma manuale
                "cat_portability": 2,         # Prevalentemente console
                "cat_price_value": 2,         # €120K-180K = premium
                "cat_versatility": 8,         # Multi-distretto, Lumify portable separate
                "cat_ai_features": 9          # AI riduce tempi 50%, molto avanzata
            },
            "totalScore": 5.3
        },
        "siemens-healthineers": {
            "name": "Siemens ABVS",
            "scores": {
                "cat_imaging_quality": 7,    # Buona per breast, non top general
                "cat_automation": 10,         # Hands-free breast scan completo
                "cat_portability": 1,         # Console carrellata dedicata
                "cat_price_value": 5,         # €80K-120K = medio-alto
                "cat_versatility": 1,         # SOLO BREAST - limitazione critica!
                "cat_ai_features": 7          # AI per breast detection
            },
            "totalScore": 5.2
        },
        "butterfly-iq": {
            "name": "Butterfly iQ+",
            "scores": {
                "cat_imaging_quality": 2,    # 2D only, qualità limitata CMUT
                "cat_automation": 1,          # Manuale, AI-assisted basic
                "cat_portability": 10,        # Handheld su smartphone - massima
                "cat_price_value": 10,        # $2-3K = disruptive pricing
                "cat_versatility": 7,         # Multi-applicazione ma 2D limits
                "cat_ai_features": 7          # Butterfly Garden SDK, pulmonary AI
            },
            "totalScore": 6.2
        },
        "clarius": {
            "name": "Clarius HD",
            "scores": {
                "cat_imaging_quality": 7,    # 2D di buona qualità
                "cat_automation": 1,          # Manuale
                "cat_portability": 9,         # Wireless handheld
                "cat_price_value": 8,         # $5-8K = competitivo
                "cat_versatility": 8,         # Diverse sonde disponibili
                "cat_ai_features": 5          # AI basic
            },
            "totalScore": 6.3
        },
        "exo-imaging": {
            "name": "Exo Iris pMUT",
            "scores": {
                "cat_imaging_quality": 6,    # pMUT emerging, da validare
                "cat_automation": 5,          # Partial automation, AI-guided
                "cat_portability": 9,         # Handheld design
                "cat_price_value": 7,         # $5-8K estimated
                "cat_versatility": 7,         # Multi-application potential
                "cat_ai_features": 8          # AI-driven core technology
            },
            "totalScore": 7.0
        },
        "mindray-resona": {
            "name": "Mindray Resona",
            "scores": {
                "cat_imaging_quality": 7,    # Buona qualità, non top-tier
                "cat_automation": 2,          # Mostly manual
                "cat_portability": 3,         # Mid-size console
                "cat_price_value": 9,         # Best price/performance traditional
                "cat_versatility": 8,         # Multi-application
                "cat_ai_features": 6          # AI features growing
            },
            "totalScore": 5.8
        }
    }
    
    # Trova competitor ID mapping
    competitor_id_map = {}
    for comp in ca['competitors']:
        name_lower = comp['name'].lower()
        short_lower = comp.get('shortName', '').lower()
        
        if 'ge' in name_lower or 'ge' in short_lower:
            if 'voluson' in name_lower or 'healthcare' in short_lower:
                competitor_id_map[comp['id']] = 'ge-healthcare'
        elif 'philips' in name_lower or 'philips' in short_lower:
            competitor_id_map[comp['id']] = 'philips-healthcare'
        elif 'siemens' in name_lower or 'siemens' in short_lower:
            if 'abvs' in name_lower or 'acuson' in name_lower:
                competitor_id_map[comp['id']] = 'siemens-healthineers'
        elif 'butterfly' in name_lower:
            competitor_id_map[comp['id']] = 'butterfly-iq'
        elif 'clarius' in name_lower:
            competitor_id_map[comp['id']] = 'clarius'
        elif 'exo' in name_lower:
            competitor_id_map[comp['id']] = 'exo-imaging'
        elif 'mindray' in name_lower:
            competitor_id_map[comp['id']] = 'mindray-resona'
    
    print("Competitor ID mapping trovato:")
    for cid, key in competitor_id_map.items():
        print(f"   {cid} → {key}")
    
    # Aggiorna competitors nel benchmarking
    new_competitors = []
    
    # Eco 3D reference
    new_competitors.append({
        "competitorId": "eco3d",
        **real_scores["eco3d"]
    })
    
    # Altri competitor
    for comp_id, score_key in competitor_id_map.items():
        if score_key in real_scores:
            comp_data = real_scores[score_key]
            new_competitors.append({
                "competitorId": comp_id,
                "name": comp_data["name"],
                "scores": comp_data["scores"],
                "totalScore": comp_data["totalScore"],
                "color": f"#{hash(score_key) % 0xFFFFFF:06x}",  # Color from hash
                "isReference": False
            })
            print(f"✅ Aggiornato {comp_data['name']}: total score {comp_data['totalScore']}")
    
    bm['competitors'] = new_competitors
    
    # Aggiorna insights con DATI REALI
    bm['insights'] = [
        "Eco 3D domina con 9.15/10 - unico a combinare qualità imaging (9/10), automazione (10/10) e versatilità (10/10)",
        "GE Voluson e Philips EPIQ hanno imaging top (10/10, 9/10) ma automazione bassa (2/10) e portabilità critica (1-2/10)",
        "Siemens ABVS ha automazione massima (10/10) MA versatilità minima (1/10) - limitato SOLO a breast",
        "Butterfly iQ eccelle in portabilità (10/10) e prezzo (10/10) ma qualità imaging insufficiente (2/10) - solo 2D",
        "Exo pMUT (7.0) è emerging threat con AI forte (8/10) ma imaging da validare (6/10)",
        "Gap competitivo: Eco 3D è l'unico con HIGH score su tutte 6 dimensioni contemporaneamente"
    ]
    
    ca['frameworks']['benchmarking'] = bm
    db['competitorAnalysis'] = ca
    
    # Salva
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 70)
    print("✅ BENCHMARKING AGGIORNATO CON SCORE REALI!")
    print("\n📊 Nuovo ranking:")
    for comp in sorted(new_competitors, key=lambda x: x['totalScore'], reverse=True):
        print(f"   {comp['name']}: {comp['totalScore']}/10")
    
    print("\n🎯 Differenziatori chiave ora visibili:")
    print("   - GE/Philips: imaging ALTO ma automazione BASSA")
    print("   - Siemens: automazione ALTA ma versatilità BASSA (breast only)")
    print("   - Butterfly: portabilità/prezzo ALTI ma imaging BASSO (2D)")
    print("   - Eco 3D: ALTO su tutto = competitive advantage chiaro!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
