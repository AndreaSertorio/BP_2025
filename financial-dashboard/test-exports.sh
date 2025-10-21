#!/bin/bash

# ========================================
# TEST EXPORT SCRIPT - Eco 3D Dashboard
# ========================================
# Verifica che tutti gli export generino file in ~/Downloads/

echo "🧪 TEST EXPORT - Eco 3D Dashboard"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_csv_export() {
    local filename=$1
    local description=$2
    
    if [ -f ~/Downloads/"$filename" ]; then
        local size=$(du -h ~/Downloads/"$filename" | cut -f1)
        local lines=$(wc -l ~/Downloads/"$filename" | awk '{print $1}')
        echo -e "${GREEN}✅ PASS${NC} - $description"
        echo "   File: $filename ($size, $lines lines)"
    else
        echo -e "${RED}❌ FAIL${NC} - $description"
        echo "   File non trovato: $filename"
    fi
    echo ""
}

test_json_export() {
    local pattern=$1
    local description=$2
    
    local file=$(ls -t ~/Downloads/$pattern 2>/dev/null | head -1)
    if [ -n "$file" ]; then
        local size=$(du -h "$file" | cut -f1)
        # Test if valid JSON
        if jq empty "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ PASS${NC} - $description"
            echo "   File: $(basename "$file") ($size, valid JSON)"
        else
            echo -e "${YELLOW}⚠️  WARN${NC} - $description"
            echo "   File exists but invalid JSON: $(basename "$file")"
        fi
    else
        echo -e "${RED}❌ FAIL${NC} - $description"
        echo "   No file matching pattern: $pattern"
    fi
    echo ""
}

# Clear terminal
clear

echo "📂 Checking Downloads folder: ~/Downloads/"
echo "🕐 Timestamp: $(date)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count existing export files
echo "📊 Current export files in Downloads:"
ls -lht ~/Downloads/ | grep -E "(eco3d|monthly|annual|kpis|advanced|cashflow|growth|scenario)" | head -10
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# MANUAL TESTING INSTRUCTIONS
echo "🎯 MANUAL TESTING REQUIRED"
echo ""
echo "1. Open dashboard:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "2. Scroll to bottom → Export Panel"
echo ""
echo "3. Click each export button:"
echo "   • Export Monthly Data"
echo "   • Export Annual Data"
echo "   • Export Key KPIs"
echo "   • Export Advanced Metrics"
echo "   • Export Cash Flow"
echo "   • Export Growth Metrics"
echo "   • Export Complete Scenario"
echo ""
echo "4. After each export, file should appear in ~/Downloads/"
echo ""
echo "5. Run this script again to verify:"
echo "   ${YELLOW}./test-exports.sh${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prompt to continue
read -p "Press ENTER after you've exported some files to check results..."

echo ""
echo "🔍 CHECKING EXPORTED FILES..."
echo ""

# Get today's date for filename patterns
TODAY=$(date +%Y-%m-%d)

# Test CSV exports
echo "═══════════════════════════════════════════════"
echo "  CSV EXPORTS (Financial Dashboard)"
echo "═══════════════════════════════════════════════"
echo ""

test_csv_export "monthly-data-*-$TODAY.csv" "Monthly Data (60 months)"
test_csv_export "annual-data-*-$TODAY.csv" "Annual Data (5 years)"
test_csv_export "kpis-*-$TODAY.csv" "Key KPIs"
test_csv_export "advanced-metrics-*-$TODAY.csv" "Advanced Metrics (CAC, LTV, NPV)"
test_csv_export "cashflow-statements-*-$TODAY.csv" "Cash Flow Statements"
test_csv_export "growth-metrics-*-$TODAY.csv" "Growth Metrics (CAGR)"
test_csv_export "scenario-comparison-$TODAY.csv" "Scenario Comparison"
test_csv_export "eco3d-monthly-funnel.csv" "Monthly Funnel (GTM)"
test_csv_export "eco3d-quarterly-summary.csv" "Quarterly Summary (GTM)"
test_csv_export "eco3d-profit-loss.csv" "Profit & Loss"
test_csv_export "eco3d-cash-flow.csv" "Cash Flow"
test_csv_export "eco3d-balance-sheet.csv" "Balance Sheet"

# Test JSON exports
echo "═══════════════════════════════════════════════"
echo "  JSON EXPORTS"
echo "═══════════════════════════════════════════════"
echo ""

test_json_export "complete-scenario-*-$TODAY.json" "Complete Scenario"
test_json_export "database-export-*.json" "Database Export"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
TOTAL_EXPORTS=14
FOUND_EXPORTS=$(ls ~/Downloads/ 2>/dev/null | grep -E "(monthly-data|annual-data|kpis|advanced-metrics|cashflow-statements|growth-metrics|scenario-comparison|eco3d-monthly-funnel|eco3d-quarterly-summary|eco3d-profit-loss|eco3d-cash-flow|eco3d-balance-sheet|complete-scenario|database-export)" | wc -l)

echo "📊 SUMMARY"
echo "   Total expected exports: $TOTAL_EXPORTS"
echo "   Files found in Downloads: $FOUND_EXPORTS"
echo ""

if [ "$FOUND_EXPORTS" -eq "$TOTAL_EXPORTS" ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
elif [ "$FOUND_EXPORTS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS${NC}"
    echo "   Some exports are working. Continue testing remaining ones."
else
    echo -e "${RED}❌ NO EXPORTS FOUND${NC}"
    echo "   Please verify:"
    echo "   1. Server is running (http://localhost:3000)"
    echo "   2. You clicked export buttons"
    echo "   3. Browser didn't block downloads"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Offer to open latest export
if [ "$FOUND_EXPORTS" -gt 0 ]; then
    echo "🔗 QUICK ACTIONS:"
    echo ""
    echo "View latest CSV export:"
    echo "  ${YELLOW}open ~/Downloads/\$(ls -t ~/Downloads/*.csv | head -1)${NC}"
    echo ""
    echo "View latest JSON export:"
    echo "  ${YELLOW}open ~/Downloads/\$(ls -t ~/Downloads/*.json | head -1)${NC}"
    echo ""
    echo "List all today's exports:"
    echo "  ${YELLOW}ls -lht ~/Downloads/ | grep $TODAY${NC}"
    echo ""
fi

echo "Done! ✅"
echo ""
