#!/usr/bin/env python3
"""
Estrae valoreMercato dal file Proiezioni_Mercato_Ecografi_Internazionali_Completo.xlsx
"""
import pandas as pd
import json
from pathlib import Path

base_path = Path(__file__).parent
file = base_path / "Proiezioni_Mercato_Ecografi_Internazionali_Completo.xlsx"

df = pd.read_excel(file)
print("=== STRUTTURA FILE INTERNAZIONALI ===")
print("Colonne:", df.columns.tolist())
print("\nDati completi:")
print(df.to_string(index=False))

# Identifica riga 2025 e 2030
row_2025 = df[df['Anno'] == 2025].iloc[0] if len(df[df['Anno'] == 2025]) > 0 else None
row_2030 = df[df['Anno'] == 2030].iloc[0] if len(df[df['Anno'] == 2030]) > 0 else None

if row_2025 is None or row_2030 is None:
    print("\n❌ ERRORE: Non trovate righe 2025 o 2030")
    exit(1)

# Estrai dati per regione
regioni = {
    "Italia": None,  # Da calcolare dalla tabella IT_Summary
    "Europa": {
        "media_col": "Europa_Media",
        "2025": row_2025.get("Europa_Media", 0),
        "2030": row_2030.get("Europa_Media", 0)
    },
    "Stati Uniti": {
        "media_col": "USA_Media",
        "2025": row_2025.get("USA_Media", 0),
        "2030": row_2030.get("USA_Media", 0)
    },
    "Cina": {
        "media_col": "Cina_Media",
        "2025": row_2025.get("Cina_Media", 0),
        "2030": row_2030.get("Cina_Media", 0)
    },
    "Mondo (globale)": {
        "media_col": "Globale_Media",
        "2025": row_2025.get("Globale_Media", 0),
        "2030": row_2030.get("Globale_Media", 0)
    }
}

# Per l'Italia, leggo da IT_Summary
file_italia = base_path / "ECO_Mercato_Ecografi_IT_Riepilogo.xlsx"
df_italia = pd.read_excel(file_italia, sheet_name='IT_Summary', header=None)

# Trova riga 2025 (riga 6, 0-indexed: 5) e 2030 (riga 11, 0-indexed: 10)
# Colonna Media è la colonna 7 (0-indexed: 6)
italia_2025 = df_italia.iloc[5, 6] if len(df_italia) > 5 else 0
italia_2030 = df_italia.iloc[10, 6] if len(df_italia) > 10 else 0

regioni["Italia"] = {
    "2025": italia_2025,
    "2030": italia_2030
}

# Calcola CAGR per ogni regione
# CAGR = ((valore_finale / valore_iniziale)^(1/anni) - 1) * 100
def calcola_cagr(val_2025, val_2030, anni=5):
    if val_2025 <= 0 or val_2030 <= 0:
        return 0
    return round(((val_2030 / val_2025) ** (1/anni) - 1) * 100, 2)

valore_mercato = []
for mercato, dati in regioni.items():
    if dati is None:
        continue
    val_2025 = float(dati["2025"]) if dati["2025"] else 0
    val_2030 = float(dati["2030"]) if dati["2030"] else 0
    cagr = calcola_cagr(val_2025, val_2030)
    
    valore_mercato.append({
        "mercato": mercato,
        "valore2025": round(val_2025, 1) if val_2025 < 10000 else int(val_2025),
        "valore2030": round(val_2030, 1) if val_2030 < 10000 else int(val_2030),
        "cagr": cagr
    })

print("\n=== VALORE MERCATO ESTRATTO ===")
print(json.dumps(valore_mercato, indent=2, ensure_ascii=False))

# Salva
output = {"valoreMercato": valore_mercato}
output_file = base_path / "valore_mercato_corretto.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n✅ SALVATO IN: {output_file}")
