#!/bin/bash

# Script di test per verificare che il salvataggio funzioni
echo "🧪 TEST SALVATAGGIO PARAMETRI SAAS"
echo "=================================="
echo ""

# 1. Verifica server attivo
echo "📡 1. Verifico server API su porta 3001..."
if lsof -i :3001 | grep -q LISTEN; then
    echo "✅ Server API attivo"
else
    echo "❌ Server API NON attivo!"
    echo "   Avvia con: npm run server"
    exit 1
fi
echo ""

# 2. Health check
echo "🏥 2. Health check server..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Server risponde correttamente"
else
    echo "❌ Server non risponde"
    exit 1
fi
echo ""

# 3. Leggi valore corrente
echo "📖 3. Leggo valore corrente di feePerScan..."
CURRENT=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.perScan.feePerScan')
echo "   Valore attuale: €$CURRENT"
echo ""

# 4. Aggiorna a valore test
echo "💾 4. Aggiorno feePerScan a €9.99 (valore test)..."
RESPONSE=$(curl -s -X PATCH http://localhost:3001/api/database/revenue-model/saas \
  -H "Content-Type: application/json" \
  -d '{"pricing":{"perScan":{"feePerScan":9.99}}}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ API risponde success:true"
else
    echo "❌ Errore nella chiamata API"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# 5. Verifica su disco
echo "🔍 5. Verifico database.json su disco..."
sleep 1
NEW_VALUE=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.perScan.feePerScan')

if [ "$NEW_VALUE" == "9.99" ]; then
    echo "✅ Valore salvato correttamente su disco: €$NEW_VALUE"
else
    echo "❌ Valore NON salvato! Trovato: €$NEW_VALUE"
    exit 1
fi
echo ""

# 6. Ripristina valore originale
echo "♻️  6. Ripristino valore originale (€$CURRENT)..."
curl -s -X PATCH http://localhost:3001/api/database/revenue-model/saas \
  -H "Content-Type: application/json" \
  -d "{\"pricing\":{\"perScan\":{\"feePerScan\":$CURRENT}}}" > /dev/null

sleep 1
RESTORED=$(cat src/data/database.json | jq -r '.revenueModel.saas.pricing.perScan.feePerScan')
echo "✅ Valore ripristinato: €$RESTORED"
echo ""

# 7. Risultato finale
echo "=================================="
echo "🎉 TUTTI I TEST SUPERATI!"
echo "=================================="
echo ""
echo "Il salvataggio funziona correttamente:"
echo "  ✅ Server API attivo e funzionante"
echo "  ✅ Route PATCH /api/database/revenue-model/saas funziona"
echo "  ✅ Dati scritti correttamente su database.json"
echo "  ✅ Modifiche persistite su disco"
echo ""
echo "Ora puoi modificare i parametri nell'interfaccia web"
echo "e verranno salvati automaticamente dopo 1.5 secondi!"
