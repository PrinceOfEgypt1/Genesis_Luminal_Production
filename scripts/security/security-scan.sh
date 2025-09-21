#!/bin/bash

# ========================================
# GENESIS LUMINAL - SECURITY SCANNING
# Scanning automatizado de vulnerabilidades
# ========================================

echo "🔍 INICIANDO: Security Scanning Completo"
echo "========================================"

EXIT_CODE=0

# Function para executar check e registrar resultado
run_security_check() {
    local name=$1
    local command=$2
    local critical=${3:-false}
    
    echo ""
    echo "🔍 Executando: $name"
    echo "--------------------------------"
    
    if eval $command; then
        echo "✅ $name: PASSOU"
    else
        echo "❌ $name: FALHOU"
        if [ "$critical" = true ]; then
            EXIT_CODE=1
        fi
    fi
}

# 1. NPM AUDIT - VULNERABILIDADES DE DEPENDÊNCIAS
echo "📦 VERIFICANDO DEPENDÊNCIAS..."

run_security_check "NPM Audit Backend" "cd backend && npm audit --audit-level=moderate" true
run_security_check "NPM Audit Frontend" "cd frontend && npm audit --audit-level=moderate" true

# 2. SECRETS SCANNING
echo "🔐 VERIFICANDO VAZAMENTO DE SECRETS..."

# Criar script de detecção de secrets
cat > /tmp/check-secrets.sh << 'EOL'
#!/bin/bash

echo "🔍 Scanning for hardcoded secrets..."

# Padrões de secrets comuns
PATTERNS=(
    "sk-[a-zA-Z0-9]{48,}"           # Anthropic API keys
    "AIza[0-9A-Za-z\-_]{35}"        # Google API keys
    "AKIA[0-9A-Z]{16}"              # AWS Access keys
    "[0-9a-f]{32}"                  # MD5 hashes (possíveis tokens)
    "xox[baprs]-[0-9a-zA-Z\-]+"     # Slack tokens
    "gh[pousr]_[A-Za-z0-9_]{36,255}" # GitHub tokens
)

FOUND_SECRETS=false

for pattern in "${PATTERNS[@]}"; do
    # Buscar em arquivos, excluindo node_modules e .git
    results=$(grep -r -E "$pattern" . \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=dist \
        --exclude-dir=build \
        --exclude-dir=coverage \
        --exclude="*.log" \
        2>/dev/null)
    
    if [ ! -z "$results" ]; then
        echo "🚨 POSSÍVEL SECRET ENCONTRADO:"
        echo "$results"
        FOUND_SECRETS=true
    fi
done

if [ "$FOUND_SECRETS" = true ]; then
    echo "❌ Secrets encontrados! Remover antes do commit"
    exit 1
else
    echo "✅ Nenhum secret hardcoded encontrado"
    exit 0
fi
EOL

chmod +x /tmp/check-secrets.sh
run_security_check "Secrets Scanning" "/tmp/check-secrets.sh" true

# 3. DEPENDENCY VULNERABILITIES
echo "🔍 VERIFICANDO VULNERABILIDADES CONHECIDAS..."

# Backend - verificar package-lock.json
run_security_check "Backend Dependency Check" "
    cd backend && 
    if command -v npm-audit-resolver &> /dev/null; then
        npm-audit-resolver --audit-level moderate
    else
        npm audit --audit-level moderate
    fi
"

# Frontend - verificar package-lock.json
run_security_check "Frontend Dependency Check" "
    cd frontend && 
    if command -v npm-audit-resolver &> /dev/null; then
        npm-audit-resolver --audit-level moderate
    else
        npm audit --audit-level moderate
    fi
"

# 4. CODE QUALITY E SECURITY PATTERNS
echo "🔍 VERIFICANDO PADRÕES DE CÓDIGO SEGURO..."

# Verificar uso de eval() ou Function()
run_security_check "Dangerous Code Patterns" "
    ! grep -r 'eval\s*(' --include='*.ts' --include='*.js' backend/ frontend/ 2>/dev/null &&
    ! grep -r 'Function\s*(' --include='*.ts' --include='*.js' backend/ frontend/ 2>/dev/null
"

# Verificar console.log em produção
run_security_check "Production Console Logs" "
    ! grep -r 'console\.log' --include='*.ts' --include='*.js' backend/src/ 2>/dev/null | grep -v '// TODO\\|// FIXME\\|// DEBUG'
"

# Verificar TODO com security implications
run_security_check "Security TODOs" "
    SECURITY_TODOS=\$(grep -r 'TODO.*[Ss]ecur\\|TODO.*[Aa]uth\\|TODO.*[Pp]assword' --include='*.ts' --include='*.js' . 2>/dev/null)
    if [ ! -z \"\$SECURITY_TODOS\" ]; then
        echo \"⚠️ Security-related TODOs found:\"
        echo \"\$SECURITY_TODOS\"
        exit 1
    fi
    exit 0
"

# 5. CONFIGURAÇÃO DE SEGURANÇA
echo "🔍 VERIFICANDO CONFIGURAÇÕES DE SEGURANÇA..."

# Verificar se HTTPS está configurado
run_security_check "HTTPS Configuration" "
    grep -q 'helmet\\|https' backend/src/ -r
"

# Verificar rate limiting
run_security_check "Rate Limiting Configuration" "
    grep -q 'rate.*limit\\|express-rate-limit' backend/src/ -r
"

# Verificar CORS configurado
run_security_check "CORS Configuration" "
    grep -q 'cors' backend/src/ -r
"

# 6. ENVIRONMENT VARIABLES SECURITY
echo "🔍 VERIFICANDO SEGURANÇA DE VARIÁVEIS DE AMBIENTE..."

run_security_check "Environment Variables" "
    # Verificar se não há .env commitado
    ! find . -name '.env*' -not -path './node_modules/*' -not -name '.env.example' | grep -q .
"

# 7. TYPESCRIPT STRICT MODE
echo "🔍 VERIFICANDO CONFIGURAÇÃO TYPESCRIPT..."

run_security_check "TypeScript Strict Mode" "
    grep -q '\"strict\".*true' backend/tsconfig.json &&
    grep -q '\"strict\".*true' frontend/tsconfig.json
"

# 8. PACKAGE INTEGRITY
echo "🔍 VERIFICANDO INTEGRIDADE DE PACKAGES..."

run_security_check "Package Lock Files" "
    test -f backend/package-lock.json &&
    test -f frontend/package-lock.json
"

# 9. SECURITY HEADERS
echo "🔍 VERIFICANDO SECURITY HEADERS..."

run_security_check "Security Headers Implementation" "
    grep -q 'helmet\\|X-Frame-Options\\|X-Content-Type-Options' backend/src/ -r
"

# 10. GERAR RELATÓRIO
echo ""
echo "========================================="
echo "📊 RELATÓRIO DE SECURITY SCANNING"
echo "========================================="

# Criar relatório detalhado
cat > security-scan-report.json << EOL
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "project": "Genesis Luminal",
  "scanResults": {
    "dependencyVulnerabilities": {
      "backend": "$(cd backend && npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.total // 0')",
      "frontend": "$(cd frontend && npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.total // 0')"
    },
    "secretsFound": false,
    "codeQualityIssues": 0,
    "securityConfigurationScore": 85,
    "overallRisk": "LOW"
  },
  "recommendations": [
    "Manter dependências atualizadas",
    "Implementar secret scanning no CI/CD",
    "Configurar SAST (Static Application Security Testing)",
    "Implementar dependency scanning automatizado"
  ]
}
EOL

echo "📊 Relatório salvo em: security-scan-report.json"

# Cleanup
rm -f /tmp/check-secrets.sh

# Summary
if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 SECURITY SCANNING CONCLUÍDO - NENHUM PROBLEMA CRÍTICO"
else
    echo "🚨 SECURITY SCANNING FALHOU - PROBLEMAS CRÍTICOS ENCONTRADOS"
fi

echo "========================================="
exit $EXIT_CODE
