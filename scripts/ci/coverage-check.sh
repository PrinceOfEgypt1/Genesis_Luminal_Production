#!/bin/bash

# ========================================
# GENESIS LUMINAL - COVERAGE CHECK SCRIPT
# Verifica se a cobertura atende aos thresholds
# ========================================

THRESHOLD=${1:-80}
SERVICE=${2:-"backend"}

echo "🔍 Checking coverage for $SERVICE (threshold: $THRESHOLD%)"

if [ "$SERVICE" == "backend" ]; then
    cd backend
    COVERAGE_FILE="coverage/coverage-summary.json"
else
    cd frontend
    COVERAGE_FILE="coverage/coverage-summary.json"
fi

if [ ! -f "$COVERAGE_FILE" ]; then
    echo "❌ Coverage file not found: $COVERAGE_FILE"
    echo "💡 Run tests with coverage first: npm run test:coverage"
    exit 1
fi

# Extract coverage percentages
LINES_PCT=$(cat $COVERAGE_FILE | jq '.total.lines.pct')
FUNCTIONS_PCT=$(cat $COVERAGE_FILE | jq '.total.functions.pct')
BRANCHES_PCT=$(cat $COVERAGE_FILE | jq '.total.branches.pct')
STATEMENTS_PCT=$(cat $COVERAGE_FILE | jq '.total.statements.pct')

echo "📊 Coverage Report:"
echo "  Lines: ${LINES_PCT}%"
echo "  Functions: ${FUNCTIONS_PCT}%"
echo "  Branches: ${BRANCHES_PCT}%"
echo "  Statements: ${STATEMENTS_PCT}%"

# Check if all metrics meet threshold
PASS=true

check_threshold() {
    local metric=$1
    local value=$2
    
    if (( $(echo "$value < $THRESHOLD" | bc -l) )); then
        echo "❌ $metric coverage ${value}% is below threshold ${THRESHOLD}%"
        PASS=false
    else
        echo "✅ $metric coverage ${value}% meets threshold ${THRESHOLD}%"
    fi
}

check_threshold "Lines" "$LINES_PCT"
check_threshold "Functions" "$FUNCTIONS_PCT"
check_threshold "Branches" "$BRANCHES_PCT"
check_threshold "Statements" "$STATEMENTS_PCT"

if [ "$PASS" = true ]; then
    echo "🎉 All coverage thresholds met!"
    exit 0
else
    echo "💡 Increase test coverage to meet quality standards"
    exit 1
fi
