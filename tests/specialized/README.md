# Genesis Luminal - Specialized Testing Suite

## 🎯 Visão Geral

Suite completa de testes especializados para garantir excelência em todos os aspectos não-funcionais da aplicação Genesis Luminal.

## 📋 Tipos de Teste Implementados

### 1. 🔍 Accessibility Tests
- **Ferramenta**: axe-core + Playwright
- **Compliance**: WCAG 2.1 AA
- **Cobertura**: Navegação por teclado, contraste, ARIA labels, estrutura semântica

### 2. ⚡ Performance Tests
- **Ferramenta**: Lighthouse CI + Custom metrics
- **Critérios**: Baseados na performance real (62 FPS, 5ms latência)
- **Métricas**: Core Web Vitals, FPS monitoring, memory usage

### 3. 🚀 Load Tests
- **Ferramenta**: Artillery + Custom scenarios
- **Cenários**: Warm-up, carga normal, picos, stress test
- **Validação**: Taxa de sucesso >95%, latência <100ms (p95)

### 4. 🛡️ Security Tests
- **Ferramentas**: npm audit + Custom security checks
- **Cobertura**: XSS, injection, headers, rate limiting, CORS

## 🚀 Execução

```bash
# Executar todos os testes especializados
npm run test:specialized

# Executar tipo específico
npm run test:accessibility
npm run test:performance
npm run test:load
npm run test:security

# Para CI/CD
npm run test:specialized:ci
```

## 📊 Critérios de Sucesso

### Performance Budgets (baseados na aplicação real)
- FPS médio: >55 (baseado nos 62 FPS reais)
- Latência mouse: <50ms (baseado nos 5ms reais + buffer)
- First Contentful Paint: <2s
- Largest Contentful Paint: <3s
- Cumulative Layout Shift: <0.1

### Accessibility Requirements
- WCAG 2.1 AA compliance: 100%
- Keyboard navigation: Completa
- Color contrast: Mínimo 4.5:1
- Screen reader support: Completo

### Load Testing Thresholds
- Success rate: >95%
- Response time p95: <100ms
- Response time p99: <250ms
- Error rate: <5%

### Security Standards
- Vulnerabilidades high/critical: 0
- Headers de segurança: Obrigatórios
- Input sanitization: 100%
- Rate limiting: Ativo

## 🔧 Configuração

### Lighthouse CI
Configurado em `performance/lighthouse.config.js` com budgets baseados na performance real da aplicação.

### Artillery Load Testing
Configurado em `load/artillery-config.yml` with realistic scenarios and thresholds.

### Axe-core Accessibility
Configurado com regras WCAG 2.1 AA completas.

## 📈 Relatórios

Todos os testes geram relatórios detalhados em:
- `test-results/specialized/` - Relatórios HTML
- `test-results/specialized-results.json` - Dados JSON
- `test-results/specialized-junit.xml` - Formato JUnit para CI

## 🎯 Integração com CI/CD

Os testes são configurados para executar automaticamente em:
- Pull requests
- Merges na branch main
- Releases
- Schedules noturnos

## 🚨 Troubleshooting

### Performance Tests Falhando
- Verificar se aplicação está rodando localmente
- Confirmar portas 3000 (API) e 5173 (Frontend) disponíveis
- Validar baseline de performance atual

### Load Tests com Erro
- Confirmar Artillery instalado: `npm install -g artillery`
- Verificar capacidade do sistema para testes de carga
- Ajustar thresholds se necessário

### Security Tests Falhando
- Executar `npm audit fix` para resolver vulnerabilidades
- Verificar configuração de headers no backend
- Validar configuração CORS

## 📝 Manutenção

Revisar e atualizar critérios baseados em:
- Performance real da aplicação em produção
- Feedback de usuários sobre acessibilidade
- Mudanças nos requisitos de segurança
- Evolução das métricas Core Web Vitals

