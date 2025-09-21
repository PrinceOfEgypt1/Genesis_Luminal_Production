#!/bin/bash

# ========================================
# GENESIS LUMINAL - QUALITY GATES SCRIPT
# Executa todas as verificações de qualidade
# ========================================

echo "🚀 Running Quality Gates for Genesis Luminal"

EXIT_CODE=0

# Function to run check and track result
run_check() {
    local name=$1
    local command=$2
    
    echo ""
    echo "🔍 Running: $name"
    echo "================================"
    
    if eval $command; then
        echo "✅ $name: PASSED"
    else
        echo "❌ $name: FAILED"
        EXIT_CODE=1
    fi
}

# Type checking
run_check "TypeScript Check (Backend)" "cd backend && npm run type-check"
run_check "TypeScript Check (Frontend)" "cd frontend && npm run type-check"

# Linting
run_check "Lint Check (Backend)" "cd backend && npm run lint"
run_check "Lint Check (Frontend)" "cd frontend && npm run lint"

# Tests with coverage
run_check "Backend Tests" "cd backend && npm run test:ci"
run_check "Frontend Tests" "cd frontend && npm run test:ci"

# Coverage validation
run_check "Backend Coverage" "./scripts/ci/coverage-check.sh 80 backend"
run_check "Frontend Coverage" "./scripts/ci/coverage-check.sh 80 frontend"

# Build validation
run_check "Build Validation" "./scripts/ci/build-check.sh"

# Security audit
run_check "Security Audit (Backend)" "cd backend && npm audit --audit-level=moderate"
run_check "Security Audit (Frontend)" "cd frontend && npm audit --audit-level=moderate"

echo ""
echo "================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 ALL QUALITY GATES PASSED!"
    echo "✅ Code is ready for deployment"
else
    echo "❌ SOME QUALITY GATES FAILED"
    echo "💡 Please fix the issues before proceeding"
fi

exit $EXIT_CODE
