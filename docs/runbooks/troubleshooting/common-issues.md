# Runbook: Troubleshooting Issues Comuns

## Build Failures

### TypeScript Errors

**Sintoma:** Build falha com erros de tipo
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

**Solução:**
1. Verificar tipos nos arquivos modificados
2. Executar `npm run type-check` localmente
3. Verificar imports e exports
4. Atualizar tipagens se necessário

### Jest/Vitest Failures

**Sintoma:** Testes falhando no CI mas passando localmente

**Possíveis causas:**
- Diferenças de timezone
- Dependências em ordem de execução
- Mocks não limpos entre testes

**Solução:**
```bash
# Limpar cache
npm run test -- --clearCache

# Executar testes em modo debug
npm run test -- --verbose --runInBand

# Verificar setup files
cat src/__tests__/setup.ts
```

## Runtime Issues

### Anthropic Provider Errors

**Sintoma:** Erro "ANTHROPIC_API_KEY not configured"

**Diagnóstico:**
```bash
# Verificar se está em modo simulação
grep "isSimulationMode" backend/src/providers/AnthropicProvider.ts

# Verificar variáveis de ambiente
echo $ANTHROPIC_API_KEY
echo $FORCE_REAL_ANTHROPIC
```

**Solução:**
1. **Para usar simulação (recomendado para dev):**
   ```bash
   # Não definir ANTHROPIC_API_KEY ou definir como test-key
   unset ANTHROPIC_API_KEY
   # ou
   export ANTHROPIC_API_KEY=test-key
   ```

2. **Para usar API real:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-api03-...
   export FORCE_REAL_ANTHROPIC=true
   ```

### CORS Errors

**Sintoma:** Frontend não consegue fazer requests para backend

**Diagnóstico:**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/health

# Verificar headers CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/analyze
```

**Solução:**
1. Verificar configuração CORS no backend
2. Confirmar que frontend está na porta correta
3. Verificar variável `CORS_ORIGIN`

### Rate Limiting Issues

**Sintoma:** Requests retornando 429 (Too Many Requests)

**Diagnóstico:**
```bash
# Verificar se rate limiting está habilitado
grep "RATE_LIMIT" backend/src/config/

# Testar endpoint de health (não deve ter rate limit)
curl http://localhost:3001/api/health
```

**Solução:**
```bash
# Para desenvolvimento, desabilitar temporariamente
export RATE_LIMIT_ENABLED=false

# Ou aumentar limite
export RATE_LIMIT_MAX=1000
```

## Frontend Issues

### Compilation Errors

**Sintoma:** Vite build falha

**Diagnóstico:**
```bash
# Build com verbose
npm run build -- --mode development

# Verificar dependências
npm ls

# Verificar imports
grep -r "import.*from" src/ | grep -v node_modules
```

### Component Render Issues

**Sintoma:** Componentes não renderizam ou crash

**Diagnóstico:**
```bash
# Verificar console do browser
# Verificar React DevTools

# Executar testes do componente
npm run test -- EmotionAnalyzer
```

## CI/CD Issues

### Pipeline Failures

**Sintoma:** GitHub Actions falhando

**Diagnóstico:**
1. Verificar logs do workflow
2. Executar steps localmente:
   ```bash
   # Type check
   npm run type-check
   
   # Tests
   npm run test:ci
   
   # Build
   npm run build
   
   # Quality gates
   ./scripts/ci/quality-gates.sh
   ```

### Coverage Failures

**Sintoma:** Coverage abaixo de 80%

**Solução:**
```bash
# Gerar relatório de coverage
npm run test:coverage

# Identificar arquivos sem cobertura
open coverage/lcov-report/index.html

# Adicionar testes para arquivos específicos
# Verificar threshold em jest.config.js ou vitest.config.ts
```

## Monitoramento e Logs

### Como investigar problemas

1. **Verificar health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verificar disclaimer:**
   ```bash
   curl http://localhost:3001/api/disclaimer
   ```

3. **Verificar logs estruturados:**
   ```bash
   # Backend logs
   tail -f backend/logs/application.log
   
   # Frontend console (browser)
   # Verificar Network tab e Console tab
   ```

4. **Verificar métricas de sistema:**
   ```bash
   # CPU e Memory
   top
   
   # Disk space
   df -h
   
   # Network connections
   netstat -tlnp
   ```

## Escalação

### Quando escalar para próximo nível

1. **Problemas de infraestrutura:** DevOps team
2. **Bugs críticos em produção:** Tech Lead
3. **Security issues:** Security team
4. **Performance degradation:** Performance team

### Informações para incluir no escalation

- Timestamp do problema
- Steps para reproduzir
- Logs relevantes
- Impact assessment
- Tentativas de resolução já feitas

### Contatos

- **Tech Lead:** tech-lead@genesis-luminal.com
- **DevOps:** devops@genesis-luminal.com  
- **Security:** security@genesis-luminal.com
- **Emergency:** +1-555-0123
