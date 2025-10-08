#!/bin/bash
# ============================================================
# SCRIPT DI AVVIO APPLICAZIONE ECO 3D
# Avvia Server API (3001) + Next.js (3000)
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║          🚀 ECO 3D - AVVIO APPLICAZIONE               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 1. Chiudi processi esistenti
echo "🧹 Chiusura processi esistenti sulle porte 3000, 3001, 3002, 3003..."
lsof -ti :3000 :3001 :3002 :3003 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1
echo "   ✅ Processi chiusi"
echo ""

# 2. Verifica file database.json
if [ ! -f "src/data/database.json" ]; then
    echo "❌ ERRORE: src/data/database.json non trovato!"
    exit 1
fi
echo "📁 Database: src/data/database.json"
echo ""

# 3. Avvia Server API (porta 3001)
echo "🔧 Avvio Server API Express (porta 3001)..."
npm run server > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# Verifica server API
if curl -s http://localhost:3001/api/database > /dev/null 2>&1; then
    echo "   ✅ Server API attivo (PID: $SERVER_PID)"
    VERSION=$(curl -s http://localhost:3001/api/database | jq -r '.version')
    echo "   📊 Database version: $VERSION"
else
    echo "   ❌ Server API non risponde!"
    exit 1
fi
echo ""

# 4. Avvia Next.js (porta 3000)
echo "🌐 Avvio Next.js Dev Server (porta 3000)..."
PORT=3000 npm run dev > /dev/null 2>&1 &
NEXT_PID=$!
sleep 4

# Verifica Next.js
if lsof -i :3000 | grep -q LISTEN; then
    echo "   ✅ Next.js attivo (PID: $NEXT_PID)"
else
    echo "   ❌ Next.js non risponde!"
    exit 1
fi
echo ""

# 5. Riepilogo finale
echo "╔════════════════════════════════════════════════════════╗"
echo "║              ✅ APPLICAZIONE AVVIATA                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Server API:    http://localhost:3001/api/database"
echo "🌐 Applicazione:  http://localhost:3000"
echo ""
echo "🔧 PID Server API: $SERVER_PID"
echo "🔧 PID Next.js:    $NEXT_PID"
echo ""
echo "⚠️  Per fermare: pkill -9 node"
echo "⚠️  Per riavviare: ./START.sh"
echo ""
echo "🎯 COSA FARE ORA:"
echo "   1. Apri http://localhost:3000 nel browser"
echo "   2. Se necessario: Hard Refresh (Cmd+Shift+R)"
echo "   3. Vai su tab TAM/SAM/SOM"
echo ""
