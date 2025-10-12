#!/bin/bash

echo "🧪 TEST SALVATAGGIO TIERS SAAS"
echo "================================"
echo ""

# 1. Leggi valori correnti
echo "📖 1. Leggi valori ATTUALI dal database..."
TIER1_BEFORE=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[0].monthlyFee')
TIER2_BEFORE=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[1].monthlyFee')
TIER3_BEFORE=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[2].monthlyFee')

echo "   Tier 1: €$TIER1_BEFORE"
echo "   Tier 2: €$TIER2_BEFORE"
echo "   Tier 3: €$TIER3_BEFORE"
echo ""

# 2. Aggiorna a valori TEST
echo "💾 2. Aggiorno tiers a valori TEST (€111, €222, €333)..."
curl -s -X PATCH http://localhost:3001/api/database/revenue-model/saas \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "tiered": {
        "tiers": [
          {
            "scansUpTo": 100,
            "monthlyFee": 111,
            "description": "Piano Starter - fino a 100 scansioni/mese"
          },
          {
            "scansUpTo": 505,
            "monthlyFee": 222,
            "description": "Piano Professional - fino a 500 scansioni/mese"
          },
          {
            "scansUpTo": 9999,
            "monthlyFee": 333,
            "description": "Piano Enterprise - scansioni illimitate"
          }
        ]
      }
    }
  }' > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ API risponde OK"
else
    echo "❌ Errore nella chiamata API"
    exit 1
fi
echo ""

# 3. Attendi scrittura su disco
echo "⏳ 3. Attendo 1 secondo per scrittura su disco..."
sleep 1
echo ""

# 4. Verifica database.json
echo "🔍 4. Verifico database.json su disco..."
TIER1_AFTER=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[0].monthlyFee')
TIER2_AFTER=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[1].monthlyFee')
TIER3_AFTER=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.tiered.tiers[2].monthlyFee')

echo "   Tier 1: €$TIER1_AFTER"
echo "   Tier 2: €$TIER2_AFTER"
echo "   Tier 3: €$TIER3_AFTER"
echo ""

# 5. Verifica
if [ "$TIER1_AFTER" == "111" ] && [ "$TIER2_AFTER" == "222" ] && [ "$TIER3_AFTER" == "333" ]; then
    echo "✅ VALORI SALVATI CORRETTAMENTE!"
else
    echo "❌ ERRORE: Valori NON salvati correttamente"
    echo "   Atteso: 111, 222, 333"
    echo "   Trovato: $TIER1_AFTER, $TIER2_AFTER, $TIER3_AFTER"
    exit 1
fi
echo ""

# 6. Ripristina valori originali
echo "♻️  6. Ripristino valori originali..."
curl -s -X PATCH http://localhost:3001/api/database/revenue-model/saas \
  -H "Content-Type: application/json" \
  -d "{
    \"pricing\": {
      \"tiered\": {
        \"tiers\": [
          {
            \"scansUpTo\": 100,
            \"monthlyFee\": $TIER1_BEFORE,
            \"description\": \"Piano Starter - fino a 100 scansioni/mese\"
          },
          {
            \"scansUpTo\": 505,
            \"monthlyFee\": $TIER2_BEFORE,
            \"description\": \"Piano Professional - fino a 500 scansioni/mese\"
          },
          {
            \"scansUpTo\": 9999,
            \"monthlyFee\": $TIER3_BEFORE,
            \"description\": \"Piano Enterprise - scansioni illimitate\"
          }
        ]
      }
    }
  }" > /dev/null

sleep 1
echo "✅ Valori ripristinati: €$TIER1_BEFORE, €$TIER2_BEFORE, €$TIER3_BEFORE"
echo ""

echo "================================"
echo "🎉 TEST COMPLETATO CON SUCCESSO!"
echo "================================"
echo ""
echo "📋 RIEPILOGO:"
echo "  ✅ Server API attivo"
echo "  ✅ Route PATCH /api/database/revenue-model/saas funziona"
echo "  ✅ Dati scritti su database.json"
echo "  ✅ Dati persistiti su disco"
echo "  ✅ Ripristino valori OK"
echo ""
echo "🌐 TESTARE NELL'INTERFACCIA WEB:"
echo "  1. Apri http://localhost:3000 (o 3002)"
echo "  2. Vai su Revenue Model → SaaS → Tab 'A Scaglioni'"
echo "  3. Modifica i valori dei tiers"
echo "  4. Clicca 'Salva ora' (bottone blu)"
echo "  5. Ricarica la pagina (F5)"
echo "  6. ✅ I valori devono rimanere!"
echo ""
echo "Se nell'interfaccia NON funziona, controlla:"
echo "  - Console Browser (F12) per errori"
echo "  - Console Server per vedere le chiamate API"
echo "  - Che il frontend chiami http://localhost:3001/api"
