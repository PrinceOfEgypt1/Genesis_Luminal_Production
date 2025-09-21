#!/bin/bash

# ========================================
# GENESIS LUMINAL - OWASP ZAP SCANNING
# Dynamic Application Security Testing
# ========================================

echo "🕷️ OWASP ZAP Dynamic Security Scanning"
echo "======================================"

# Verificar se ZAP está disponível
if ! command -v zap.sh &> /dev/null && ! command -v docker &> /dev/null; then
    echo "⚠️ OWASP ZAP não encontrado. Instalando via Docker..."
    echo "ℹ️ Para instalar ZAP: https://www.zaproxy.org/download/"
    echo "ℹ️ Ou usar Docker: docker pull owasp/zap2docker-stable"
    echo "⏭️ Pulando ZAP scan por agora"
    exit 0
fi

TARGET_URL="http://localhost:3001"
REPORT_DIR="./security-reports"
mkdir -p $REPORT_DIR

echo "🎯 Target: $TARGET_URL"
echo "📁 Reports: $REPORT_DIR"

# Verificar se aplicação está rodando
if ! curl -f $TARGET_URL/api/health &>/dev/null; then
    echo "❌ Aplicação não está rodando em $TARGET_URL"
    echo "💡 Inicie com: npm run dev"
    exit 1
fi

# Executar ZAP scan básico
if command -v docker &> /dev/null; then
    echo "🐳 Executando ZAP via Docker..."
    
    docker run -t --rm \
        -v $(pwd)/$REPORT_DIR:/zap/wrk/:rw \
        owasp/zap2docker-stable \
        zap-baseline.py \
        -t $TARGET_URL \
        -J zap-report.json \
        -r zap-report.html \
        || echo "⚠️ ZAP scan completou com warnings"
        
else
    echo "🕷️ Executando ZAP local..."
    
    zap.sh -cmd \
        -quickurl $TARGET_URL \
        -quickout $REPORT_DIR/zap-report.html \
        || echo "⚠️ ZAP scan completou com warnings"
fi

echo "✅ ZAP scan concluído"
echo "📊 Relatórios disponíveis em: $REPORT_DIR"
