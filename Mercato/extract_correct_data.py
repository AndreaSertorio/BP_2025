#!/usr/bin/env python3
"""
Script per estrarre i dati CORRETTI dagli Excel per il database.json
"""
import pandas as pd
import json
from pathlib import Path

base_path = Path(__file__).parent

print("=" * 80)
print("ESTRAZIONE DATI CORRETTI PER DATABASE.JSON")
print("=" * 80)

# ============================================================================
# 1. NUMERO ECOGRAFI VENDUTI (non parco totale!)
# ============================================================================
print("\n1. NUMERO ECOGRAFI VENDUTI")
print("-" * 80)
file1 = base_path / "ECO_Proiezioni_Ecografi_2025_2030.xlsx"
df_numero = pd.read_excel(file1, sheet_name='Numero Ecografi')
print("Foglio: 'Numero Ecografi'")
print(df_numero.to_string(index=False))

# Converti in formato JSON
numero_ecografi = []
for _, row in df_numero.iterrows():
    numero_ecografi.append({
        "mercato": str(row.iloc[0]),
        "unita2025": int(row.iloc[1]) if pd.notna(row.iloc[1]) else 0,
        "unita2030": int(row.iloc[2]) if pd.notna(row.iloc[2]) else 0
    })

print("\n✅ DATI JSON per 'numeroEcografi':")
print(json.dumps(numero_ecografi, indent=2, ensure_ascii=False))

# ============================================================================
# 2. PROIEZIONI ITALIA 2024-2030 (righe 4-11 da IT_Summary)
# ============================================================================
print("\n\n2. PROIEZIONI MERCATO ITALIA 2024-2030")
print("-" * 80)
file2 = base_path / "ECO_Mercato_Ecografi_IT_Riepilogo.xlsx"
df_proiezioni = pd.read_excel(file2, sheet_name='IT_Summary', header=None)
print("Foglio: 'IT_Summary', righe 4-11")
print("Righe grezze:")
for i in range(3, 11):  # Righe 4-11 (0-indexed: 3-10)
    print(f"Riga {i+1}: {df_proiezioni.iloc[i].tolist()}")

# Estrai dati (assumendo struttura: Anno, Mordor, Research, GrandView, Cognitive, ..., Media, Mediana)
proiezioni_italia = []
for i in range(4, 11):  # Righe 5-11 (skippa header in riga 4)
    row = df_proiezioni.iloc[i]
    anno = int(row.iloc[0]) if pd.notna(row.iloc[0]) else 0
    
    # Parsing dei valori monetari (potrebbero essere stringhe come "$295 M")
    def parse_value(val):
        if pd.isna(val):
            return 0
        if isinstance(val, (int, float)):
            return float(val)
        # Se è stringa, rimuovi $, M, spazi
        val_str = str(val).replace('$', '').replace('M', '').replace(',', '').strip()
        try:
            return float(val_str)
        except:
            return 0
    
    proiezioni_italia.append({
        "anno": anno,
        "mordor": parse_value(row.iloc[1]) if len(row) > 1 else 0,
        "research": parse_value(row.iloc[2]) if len(row) > 2 else 0,
        "grandview": parse_value(row.iloc[3]) if len(row) > 3 else 0,
        "cognitive": parse_value(row.iloc[4]) if len(row) > 4 else 0,
        "media": parse_value(row.iloc[6]) if len(row) > 6 else 0,
        "mediana": parse_value(row.iloc[7]) if len(row) > 7 else 0
    })

print("\n✅ DATI JSON per 'proiezioniItalia':")
print(json.dumps(proiezioni_italia, indent=2, ensure_ascii=False))

# ============================================================================
# 3. PARCO IT 2025-2035 (colonna "Parco Totale Dispositivi")
# ============================================================================
print("\n\n3. PARCO IT 2025-2035 (Parco Totale Dispositivi)")
print("-" * 80)
df_parco = pd.read_excel(file1, sheet_name='Parco_IT_2025-2035')
print("Foglio: 'Parco_IT_2025-2035'")
print(df_parco.to_string(index=False))

# Estrai dati
parco_it = []
for _, row in df_parco.iterrows():
    parco_it.append({
        "anno": int(row.iloc[0]) if pd.notna(row.iloc[0]) else 0,
        "basso": int(row.iloc[1]) if pd.notna(row.iloc[1]) else 0,
        "centrale": int(row.iloc[2]) if pd.notna(row.iloc[2]) else 0,
        "alto": int(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
    })

print("\n✅ DATI JSON per 'parcoIT':")
print(json.dumps(parco_it, indent=2, ensure_ascii=False))

# ============================================================================
# 4. QUOTE TIPOLOGIE ITALIA (da IT_Summary, righe 24-28?)
# ============================================================================
print("\n\n4. QUOTE TIPOLOGIE ITALIA 2026-2030")
print("-" * 80)
print("Foglio: 'IT_Summary', righe quote")
# Le quote dovrebbero essere nelle righe 24-28
for i in range(23, 29):  # Righe 24-29
    if i < len(df_proiezioni):
        print(f"Riga {i+1}: {df_proiezioni.iloc[i].tolist()}")

# Estrai quote (assumendo: Anno, Carrellati%, Portatili%, Palmari%)
quote_tipologie = []
for i in range(23, 28):  # Righe 24-28
    if i >= len(df_proiezioni):
        break
    row = df_proiezioni.iloc[i]
    anno = int(row.iloc[0]) if pd.notna(row.iloc[0]) else 0
    if anno >= 2026 and anno <= 2030:
        quote_tipologie.append({
            "anno": anno,
            "carrellati": float(row.iloc[1]) if pd.notna(row.iloc[1]) else 0,
            "portatili": float(row.iloc[2]) if pd.notna(row.iloc[2]) else 0,
            "palmari": float(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
        })

print("\n✅ DATI JSON per 'quoteTipologie':")
print(json.dumps(quote_tipologie, indent=2, ensure_ascii=False))

# ============================================================================
# 5. VALORI MERCATO INTERNAZIONALI
# ============================================================================
print("\n\n5. VALORI MERCATO INTERNAZIONALI")
print("-" * 80)
file3 = base_path / "Proiezioni_Mercato_Ecografi_Internazionali_Completo.xlsx"
df_internazionali = pd.read_excel(file3)
print("File: Proiezioni_Mercato_Ecografi_Internazionali_Completo.xlsx")
print(df_internazionali.to_string(index=False))

# Estrai dati
valore_mercato = []
for _, row in df_internazionali.iterrows():
    valore_mercato.append({
        "mercato": str(row.iloc[0]),
        "valore2025": float(row.iloc[1]) if pd.notna(row.iloc[1]) else 0,
        "valore2030": float(row.iloc[2]) if pd.notna(row.iloc[2]) else 0,
        "cagr": float(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
    })

print("\n✅ DATI JSON per 'valoreMercato':")
print(json.dumps(valore_mercato, indent=2, ensure_ascii=False))

# ============================================================================
# SALVA TUTTO IN UN FILE JSON
# ============================================================================
output = {
    "numeroEcografi": numero_ecografi,
    "proiezioniItalia": proiezioni_italia,
    "parcoIT": parco_it,
    "quoteTipologie": quote_tipologie,
    "valoreMercato": valore_mercato
}

output_file = base_path / "dati_corretti_database.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("\n" + "=" * 80)
print(f"✅ DATI SALVATI IN: {output_file}")
print("=" * 80)
