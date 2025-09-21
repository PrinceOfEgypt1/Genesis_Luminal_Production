#!/bin/bash

# ========================================
# GENESIS LUMINAL - PRE-COMMIT HOOKS
# Verificações antes de cada commit
# ========================================

echo "🪝 Running pre-commit checks..."

# Lint staged files
echo "🧹 Linting staged files..."
npx lint-staged

# Type check
echo "🔍 Type checking..."
cd backend && npm run type-check
cd ../frontend && npm run type-check

# Quick tests
echo "🧪 Running quick tests..."
cd backend && npm run test -- --passWithNoTests
cd ../frontend && npm run test -- --passWithNoTests

echo "✅ Pre-commit checks completed"
