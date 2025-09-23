#!/bin/bash

echo "DIAGNÓSTICO SPRINT 5 - OBSERVABILIDADE"
echo "======================================"

cd backend

echo "Verificando implementações:"
echo ""

echo "1. Estrutura de diretórios:"
[ -d "src/telemetry" ] && echo "   ✅ telemetry/" || echo "   ❌ telemetry/"
[ -d "src/metrics" ] && echo "   ✅ metrics/" || echo "   ❌ metrics/"
[ -d "src/logging" ] && echo "   ✅ logging/" || echo "   ❌ logging/"
[ -d "src/monitoring" ] && echo "   ✅ monitoring/" || echo "   ❌ monitoring/"
[ -d "logs" ] && echo "   ✅ logs/" || echo "   ❌ logs/"

echo ""
echo "2. Arquivos implementados:"
[ -f "src/metrics/prometheus.ts" ] && echo "   ✅ Prometheus metrics" || echo "   ❌ Prometheus metrics"
[ -f "src/logging/logger.ts" ] && echo "   ✅ Structured logging" || echo "   ❌ Structured logging"

echo ""
echo "3. Dependências instaladas:"
npm list prom-client > /dev/null 2>&1 && echo "   ✅ prom-client" || echo "   ❌ prom-client"
npm list winston > /dev/null 2>&1 && echo "   ✅ winston" || echo "   ❌ winston"

echo ""
echo "4. Build status:"
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build limpo"
else
    echo "   ❌ Build com erros"
fi

echo ""
echo "5. Funcionalidades integradas no app.ts:"
grep -q "prometheusMetrics" src/app.ts && echo "   ✅ Métricas integradas" || echo "   ❌ Métricas não integradas"
grep -q "logger" src/app.ts && echo "   ✅ Logging integrado" || echo "   ❌ Logging não integrado"
grep -q "/metrics" src/app.ts && echo "   ✅ Endpoint /metrics" || echo "   ❌ Endpoint /metrics ausente"
grep -q "x-request-id" src/app.ts && echo "   ✅ Request tracking" || echo "   ❌ Request tracking ausente"

echo ""
echo "RESUMO SPRINT 5"
echo "==============="

# Calcular score aproximado
SCORE=15  # Base score

[ -f "src/metrics/prometheus.ts" ] && SCORE=$((SCORE + 20))
[ -f "src/logging/logger.ts" ] && SCORE=$((SCORE + 15))
grep -q "/metrics" src/app.ts && SCORE=$((SCORE + 20))
grep -q "x-request-id" src/app.ts && SCORE=$((SCORE + 15))
npm list winston > /dev/null 2>&1 && SCORE=$((SCORE + 10))
npm run build > /dev/null 2>&1 && SCORE=$((SCORE + 5))

echo "Score estimado: ${SCORE}% (era 15%)"

if [ $SCORE -ge 75 ]; then
    echo "Status: ✅ SPRINT 5 BEM-SUCEDIDA"
    echo "Próximo: Sprint 6 (Resiliência) ou Sprint 7 (Arquitetura)"
elif [ $SCORE -ge 60 ]; then
    echo "Status: 🟡 PARCIALMENTE IMPLEMENTADA"
    echo "Recomendação: Completar passos restantes"
else
    echo "Status: 🔴 NECESSITA MAIS IMPLEMENTAÇÃO"
    echo "Recomendação: Executar passos 1-3"
fi

echo ""
echo "Para testar a implementação:"
echo "npm run dev"
echo "# Em outro terminal:"
echo "curl http://localhost:3001/metrics"
echo "curl http://localhost:3001/"
