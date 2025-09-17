#!/bin/bash

# ========================================
# GENESIS LUMINAL - DEPENDENCY AUDIT SCRIPT
# Script para auditoria manual de dependências
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 GENESIS LUMINAL - DEPENDENCY AUDIT${NC}"
echo "========================================"

# Função para executar comando com log
run_command() {
    echo -e "${BLUE}[RUNNING]${NC} $1"
    eval "$1"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1"
    else
        echo -e "${RED}[FAILED]${NC} $1"
        return 1
    fi
}

# Função para verificar se comando existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} $1 is not installed"
        return 1
    fi
}

# Verificar dependências necessárias
echo -e "${YELLOW}📋 Checking required tools...${NC}"
check_command npm
check_command node

# Verificar se Snyk está instalado
if ! command -v snyk &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} Installing Snyk CLI..."
    npm install -g snyk
fi

# Criar diretório para relatórios
mkdir -p reports/security
REPORT_DIR="reports/security/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}📊 Reports will be saved to: $REPORT_DIR${NC}"

# 1. NPM AUDIT
echo -e "${YELLOW}1. Running NPM Audit...${NC}"

for workspace in backend frontend; do
    if [ -d "$workspace" ]; then
        echo -e "${BLUE}📦 Auditing $workspace...${NC}"
        cd "$workspace"
        
        # NPM Audit
        run_command "npm audit --json > ../$REPORT_DIR/npm-audit-$workspace.json 2>/dev/null || true"
        run_command "npm audit > ../$REPORT_DIR/npm-audit-$workspace.txt 2>/dev/null || true"
        
        # Verificar nível de vulnerabilidades
        if npm audit --audit-level high > /dev/null 2>&1; then
            echo -e "${GREEN}✅ No high/critical vulnerabilities in $workspace${NC}"
        else
            echo -e "${RED}⚠️ High/critical vulnerabilities found in $workspace${NC}"
        fi
        
        cd ..
    fi
done

# 2. SNYK ANALYSIS
echo -e "${YELLOW}2. Running Snyk Analysis...${NC}"

if [ -n "$SNYK_TOKEN" ]; then
    snyk auth "$SNYK_TOKEN"
    
    for workspace in backend frontend; do
        if [ -d "$workspace" ]; then
            echo -e "${BLUE}🔍 Snyk testing $workspace...${NC}"
            cd "$workspace"
            
            run_command "snyk test --json > ../$REPORT_DIR/snyk-test-$workspace.json 2>/dev/null || true"
            run_command "snyk test > ../$REPORT_DIR/snyk-test-$workspace.txt 2>/dev/null || true"
            
            cd ..
        fi
    done
else
    echo -e "${YELLOW}[WARNING]${NC} SNYK_TOKEN not set. Skipping Snyk analysis."
    echo -e "${BLUE}[INFO]${NC} Set SNYK_TOKEN environment variable to enable Snyk scanning."
fi

# 3. LICENSE CHECK
echo -e "${YELLOW}3. Checking Licenses...${NC}"

if ! command -v license-checker &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} Installing license-checker..."
    npm install -g license-checker
fi

for workspace in backend frontend; do
    if [ -d "$workspace" ]; then
        echo -e "${BLUE}📋 Checking licenses for $workspace...${NC}"
        cd "$workspace"
        
        run_command "license-checker --json --out ../$REPORT_DIR/licenses-$workspace.json"
        run_command "license-checker --summary > ../$REPORT_DIR/licenses-$workspace.txt"
        
        cd ..
    fi
done

# 4. OUTDATED DEPENDENCIES
echo -e "${YELLOW}4. Checking Outdated Dependencies...${NC}"

for workspace in backend frontend; do
    if [ -d "$workspace" ]; then
        echo -e "${BLUE}📈 Checking outdated dependencies for $workspace...${NC}"
        cd "$workspace"
        
        run_command "npm outdated --json > ../$REPORT_DIR/outdated-$workspace.json 2>/dev/null || true"
        run_command "npm outdated > ../$REPORT_DIR/outdated-$workspace.txt 2>/dev/null || true"
        
        cd ..
    fi
done

# 5. GENERATE SUMMARY REPORT
echo -e "${YELLOW}5. Generating Summary Report...${NC}"

cat > "$REPORT_DIR/audit-summary.md" << SUMMARY_EOF
# 🔒 Genesis Luminal - Security Audit Summary

**Generated:** $(date)
**Report Directory:** $REPORT_DIR

## 📋 Audit Results

### NPM Audit
SUMMARY_EOF

for workspace in backend frontend; do
    if [ -f "$REPORT_DIR/npm-audit-$workspace.json" ]; then
        echo "- **$workspace:** $(cat "$REPORT_DIR/npm-audit-$workspace.json" | node -e "
            const audit = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
            const vuln = audit.metadata?.vulnerabilities;
            if (vuln && vuln.total > 0) {
                console.log(\`\${vuln.total} vulnerabilities (Critical: \${vuln.critical}, High: \${vuln.high})\`);
            } else {
                console.log('No vulnerabilities found');
            }
        " 2>/dev/null || echo "No data available")" >> "$REPORT_DIR/audit-summary.md"
    fi
done

echo "" >> "$REPORT_DIR/audit-summary.md"
echo "### License Compliance" >> "$REPORT_DIR/audit-summary.md"

for workspace in backend frontend; do
    if [ -f "$REPORT_DIR/licenses-$workspace.txt" ]; then
        echo "- **$workspace:** $(cat "$REPORT_DIR/licenses-$workspace.txt" | head -1)" >> "$REPORT_DIR/audit-summary.md"
    fi
done

echo "" >> "$REPORT_DIR/audit-summary.md"
echo "## 📁 Generated Reports" >> "$REPORT_DIR/audit-summary.md"
echo "" >> "$REPORT_DIR/audit-summary.md"
ls -la "$REPORT_DIR"/*.{json,txt,md} 2>/dev/null | while read line; do
    filename=$(echo "$line" | awk '{print $NF}' | xargs basename)
    echo "- \`$filename\`" >> "$REPORT_DIR/audit-summary.md"
done

echo -e "${GREEN}✅ Audit completed successfully!${NC}"
echo -e "${BLUE}📊 Summary report: $REPORT_DIR/audit-summary.md${NC}"
echo -e "${BLUE}📁 All reports saved to: $REPORT_DIR${NC}"

# Abrir resumo se possível
if command -v cat &> /dev/null; then
    echo -e "${YELLOW}📋 AUDIT SUMMARY:${NC}"
    echo "=================="
    cat "$REPORT_DIR/audit-summary.md"
fi
