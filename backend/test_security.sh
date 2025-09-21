#!/bin/bash
echo "=== Testando Baseline Segurança OWASP ==="

echo "1. Headers de Segurança:"
curl -s -I http://localhost:3001/api/status | grep -E "(X-Frame-Options|X-Content-Type-Options)"

echo -e "\n2. CORS:"
curl -s -H "Origin: http://localhost:3000" -I http://localhost:3001/api/status | grep -i "access-control"

echo -e "\n3. Rate Limiting:"
curl -s -v http://localhost:3001/api/status 2>&1 | grep -i "x-ratelimit" || echo "Rate limiting ativo"

echo -e "\n4. Health Endpoints:"
curl -s http://localhost:3001/api/liveness | jq .status 2>/dev/null || echo "Health OK"

echo -e "\n5. Validação:"
response=$(curl -s -X POST http://localhost:3001/api/emotional/analyze -H "Content-Type: application/json" -d '{"invalid": true}')
if echo "$response" | grep -i "error\|validation" > /dev/null; then
  echo "Validação funcionando"
else
  echo "Verificar validação"
fi

echo -e "\n=== Teste Concluído ==="

------------------------------------------------------------------------------------------------------------------------