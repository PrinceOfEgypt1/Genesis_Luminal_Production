#!/bin/bash
# Script de limpeza compartilhado
echo "🧹 Limpando artefatos de build..."
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
echo "✅ Limpeza concluída"
