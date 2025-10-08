#!/bin/bash
# Script per riavviare i server puliti

echo "🧹 Chiusura processi esistenti..."
lsof -ti :3000 -ti :3001 -ti :3003 | xargs kill -9 2>/dev/null
sleep 1

echo "✅ Processi chiusi"
echo ""

echo "🚀 Avvio Server API (porta 3001)..."
npm run server &
SERVER_PID=$!
sleep 2

echo "🚀 Avvio Next.js Dev (porta 3000)..."
PORT=3000 npm run dev &
NEXT_PID=$!
sleep 3

echo ""
echo "================================================"
echo "✅ SERVER ATTIVI:"
echo "================================================"
lsof -i :3000 -i :3001 | grep LISTEN || echo "❌ Errore: Server non attivi!"
echo ""
echo "📊 Server API:    http://localhost:3001/api/database"
echo "🌐 Next.js:       http://localhost:3000"
echo ""
echo "⚠️  Per fermare i server: pkill -9 node"
echo "================================================"
