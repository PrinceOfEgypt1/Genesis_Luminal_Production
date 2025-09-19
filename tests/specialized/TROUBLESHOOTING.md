# Genesis Luminal - Troubleshooting de Testes Especializados

## 🚨 Problemas Comuns e Soluções

### 1. Script `npm run test:specialized` não encontrado

**Problema**: `npm error Missing script: "test:specialized"`

**Solução**:
```bash
# Verificar se scripts foram adicionados
npm run --silent

# Se não aparecerem scripts test:*, executar correção
node tests/specialized/validate-setup.js
```

### 2. Vulnerabilidades de Segurança

**Problema**: `11 vulnerabilities (4 low, 4 moderate, 3 critical)`

**Solução**:
```bash
# Corrigir automaticamente
npm audit fix

# Se persistirem vulnerabilidades críticas
npm audit fix --force

# Verificar vulnerabilidades restantes
npm audit
```

### 3. Dependências Ausentes

**Problema**: Módulos não encontrados (@axe-core/playwright, etc.)

**Solução**:
```bash
# Instalar dependências específicas
npm install --save-dev @axe-core/playwright @lhci/cli artillery

# Verificar instalação
npm list @axe-core/playwright
npm list @lhci/cli  
npm list artillery
```

### 4. Comando 'open' não funciona (Ubuntu/WSL)

**Problema**: `Command 'open' not found`

**Solução**:
```bash
# Usar comando correto para Ubuntu
npm run open:report

# Ou manualmente
xdg-open test-results/specialized/index.html
firefox test-results/specialized/index.html
```

### 5. Testes de Performance Falhando

**Problema**: Lighthouse CI não consegue conectar

**Solução**:
```bash
# Verificar se aplicações estão rodando
npm run dev --workspace=apps/web    # Porta 5173
npm run dev --workspace=apps/api    # Porta 3000

# Em terminais separados, depois executar testes
npm run test:performance
```

### 6. Artillery Load Tests com Erro

**Problema**: Artillery não encontrado ou timeouts

**Solução**:
```bash
# Instalar Artillery globalmente se necessário
npm install -g artillery

# Verificar configuração
artillery run tests/specialized/load/artillery-config.yml --dry-run

# Ajustar timeouts se necessário
```

### 7. Playwright Configuration Issues

**Problema**: Testes não encontram configuração

**Solução**:
```bash
# Verificar arquivo de configuração
ls -la tests/specialized/specialized-tests.config.ts

# Executar com configuração explícita
npx playwright test tests/specialized/accessibility/ --config=tests/specialized/specialized-tests.config.ts
```

## 🔧 Comandos de Diagnóstico

```bash
# Validar setup completo
node tests/specialized/validate-setup.js

# Verificar dependências
npm ls --depth=0 | grep -E "(axe-core|lhci|artillery)"

# Testar conexão com aplicações
curl http://localhost:5173  # Frontend
curl http://localhost:3000/health  # Backend API

# Verificar portas em uso
netstat -tlnp | grep -E "(5173|3000)"
```

## 📊 Métricas de Sucesso Esperadas

### Accessibility (axe-core)
- **Meta**: 0 violações WCAG 2.1 AA
- **Tolerância**: Warnings permitidos, violations = falha

### Performance (Lighthouse CI)  
- **FPS**: >55 (baseado nos 62 reais)
- **Latência**: <50ms (baseado nos 5ms + buffer)
- **Core Web Vitals**: FCP <2s, LCP <3s, CLS <0.1

### Load Testing (Artillery)
- **Success Rate**: >95%
- **Response Time p95**: <100ms
- **Error Rate**: <5%

### Security Testing
- **Vulnerabilities**: 0 high/critical
- **Headers**: Helmet security headers presentes
- **Rate Limiting**: Ativo e funcional

## 🆘 Se Nada Funcionar

1. **Reset completo**:
```bash
rm -rf node_modules package-lock.json
npm install
node tests/specialized/validate-setup.js
```

2. **Verificar versões**:
```bash
node --version  # >= 16
npm --version   # >= 8
npx playwright --version
```

3. **Logs detalhados**:
```bash
DEBUG=* npm run test:specialized
```
