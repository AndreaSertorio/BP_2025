#!/bin/bash
# ============================================================================
# SCRIPT DI VERIFICA ELECTRON
# Verifica che tutto sia pronto per l'esecuzione in Electron
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║       🧪 VERIFICA CONFIGURAZIONE ELECTRON             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Verifica file principali
echo "📋 Verifica file necessari..."
FILES=(
  "electron/main.js"
  "electron/preload.js"
  "electron-builder.yml"
  "package.json"
  "server.js"
  "src/data/database.json"
)

ALL_OK=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file - MANCANTE!"
    ALL_OK=false
  fi
done
echo ""

# Verifica dipendenze Electron
echo "📦 Verifica dipendenze npm..."
if [ -d "node_modules/electron" ]; then
  echo "   ✅ electron installato"
else
  echo "   ⚠️  electron non installato"
  echo "   📝 Esegui: npm install"
  ALL_OK=false
fi

if [ -d "node_modules/electron-builder" ]; then
  echo "   ✅ electron-builder installato"
else
  echo "   ⚠️  electron-builder non installato"
  echo "   📝 Esegui: npm install"
  ALL_OK=false
fi
echo ""

# Verifica script npm
echo "🔧 Verifica script npm..."
if grep -q "electron:dev" package.json; then
  echo "   ✅ npm run electron:dev"
else
  echo "   ❌ Script electron:dev mancante!"
  ALL_OK=false
fi

if grep -q "electron:build" package.json; then
  echo "   ✅ npm run electron:build"
else
  echo "   ❌ Script electron:build mancante!"
  ALL_OK=false
fi
echo ""

# Verifica porte libere
echo "🔌 Verifica porte disponibili..."
if lsof -i :3000 &> /dev/null; then
  echo "   ⚠️  Porta 3000 occupata - chiudi eventuali server"
else
  echo "   ✅ Porta 3000 libera"
fi

if lsof -i :3001 &> /dev/null; then
  echo "   ⚠️  Porta 3001 occupata - chiudi eventuali server"
else
  echo "   ✅ Porta 3001 libera"
fi
echo ""

# Riepilogo finale
if [ "$ALL_OK" = true ]; then
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║              ✅ TUTTO PRONTO PER ELECTRON              ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "🚀 Prossimo passo:"
  echo "   npm run electron:dev"
  echo ""
else
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║          ⚠️  CONFIGURAZIONE INCOMPLETA                ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "📝 Esegui prima:"
  echo "   npm install"
  echo ""
fi
