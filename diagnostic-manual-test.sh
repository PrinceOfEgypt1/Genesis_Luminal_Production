#!/bin/bash

echo "🔬 TESTE MANUAL - DIAGNÓSTICO CIENTÍFICO"
echo "Este script testa se a aplicação funciona sem Playwright"

# Verificar se aplicação está rodando
echo "📍 Verificando se aplicação está em http://localhost:3000..."

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Aplicação responde HTTP 200"
    
    # Capturar HTML real
    echo "📊 Capturando HTML da aplicação..."
    curl -s http://localhost:3000 > diagnostic-html-output.txt
    
    echo "📊 Primeiras 20 linhas do HTML:"
    head -20 diagnostic-html-output.txt
    
    echo -e "\n📊 Procurando por elementos principais no HTML..."
    
    if grep -q 'id="root"' diagnostic-html-output.txt; then
        echo "✅ Elemento #root encontrado no HTML"
    else
        echo "❌ Elemento #root NÃO encontrado no HTML"
    fi
    
    if grep -q 'id="main-content"' diagnostic-html-output.txt; then
        echo "✅ Elemento #main-content encontrado no HTML"
    else
        echo "❌ Elemento #main-content NÃO encontrado no HTML"
    fi
    
    if grep -q '<main' diagnostic-html-output.txt; then
        echo "✅ Tag <main> encontrada no HTML"
    else
        echo "❌ Tag <main> NÃO encontrada no HTML"
    fi
    
    echo -e "\n📊 Tamanho do HTML capturado: $(wc -c < diagnostic-html-output.txt) bytes"
    
else
    echo "❌ Aplicação NÃO responde em http://localhost:3000"
    echo "💡 Execute 'npm run dev' primeiro"
fi
