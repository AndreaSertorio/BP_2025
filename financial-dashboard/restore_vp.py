#!/usr/bin/env python3
"""
Script per ripristinare la sezione valueProposition nel database
"""
import json
import shutil
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / 'src' / 'data' / 'database.json'
BACKUP_PATH = DB_PATH.with_suffix('.json.backup_vp')

# Leggi database
print("📖 Lettura database...")
with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Backup
print(f"💾 Creazione backup: {BACKUP_PATH}")
shutil.copy(DB_PATH, BACKUP_PATH)

# Aggiorna segments
print("✨ Popolamento segments...")
db['valueProposition']['customerProfile']['segments'] = json.loads('''[
  {
    "id": "segment_clinici",
    "name": "Medici e Radiologi",
    "priority": "high",
    "icon": "👨‍⚕️",
    "visible": true,
    "order": 0,
    "jobs": [
      {
        "id": "job_1",
        "description": "Ottenere immagini diagnostiche 3D rapide e precise",
        "category": "functional",
        "importance": 5,
        "difficulty": 4,
        "notes": "Driver critico adozione",
        "visible": true,
        "order": 0
      }
    ],
    "pains": [
      {
        "id": "pain_1",
        "description": "Ecografi tradizionali limitati a 2D",
        "severity": 5,
        "frequency": 5,
        "category": "functional",
        "notes": "Pain principale",
        "visible": true,
        "order": 0
      }
    ],
    "gains": [
      {
        "id": "gain_1",
        "description": "Visualizzazione 3D migliora accuratezza",
        "desirability": 5,
        "impact": 5,
        "category": "performance",
        "notes": "Gain critico",
        "visible": true,
        "order": 0
      }
    ]
  }
]''')

print("💾 Salvataggio database...")
with open(DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print(f"✅ Completato! Backup salvato in: {BACKUP_PATH}")
