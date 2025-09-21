# Runbook: Production Deployment

## Visão Geral

Este runbook descreve o processo de deploy para produção do Genesis Luminal.

⚠️ **IMPORTANTE:** Atualmente o sistema contém simulações. Verificar disclaimer antes do deploy.

## Pré-requisitos

### Verificações Obrigatórias
- [ ] Todos os testes passando no CI/CD
- [ ] Coverage >= 80% em backend e frontend
- [ ] Security audit sem vulnerabilidades críticas
- [ ] Code review aprovado
- [ ] Staging deployment testado
- [ ] Disclaimer atualizado com funcionalidades reais vs simuladas

### Variáveis de Ambiente

```bash
# Obrigatórias
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000

# API Keys (configure se usando funcionalidades reais)
ANTHROPIC_API_KEY=sk-ant-api03-...  # Opcional, se não definida usa simulação
FORCE_REAL_ANTHROPIC=false          # true para habilitar API real

# Monitoramento
LOG_LEVEL=info
METRICS_ENABLED=true

# Segurança
CORS_ORIGIN=https://genesis-luminal.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
```

## Processo de Deploy

### 1. Verificação Pré-Deploy

```bash
# Verificar build local
cd backend && npm run build
cd ../frontend && npm run build

# Executar testes
npm run test:ci

# Verificar quality gates
./scripts/ci/quality-gates.sh

# Verificar disclaimer
curl http://localhost:3001/api/disclaimer
```

### 2. Deploy Backend

```bash
# Build production
cd backend
npm ci --only=production
npm run build

# Verificar saúde do build
node dist/server.js &
SERVER_PID=$!
sleep 5

# Health check
curl -f http://localhost:3001/api/health || exit 1

# Stop test server
kill $SERVER_PID

echo "✅ Backend ready for deploy"
```

### 3. Deploy Frontend

```bash
# Build production
cd frontend
npm ci --only=production
npm run build

# Verificar build artifacts
ls -la dist/

echo "✅ Frontend ready for deploy"
```

### 4. Deploy para Servidor

```bash
# Sync files (exemplo)
rsync -avz --delete dist/ user@server:/var/www/genesis-luminal/

# Restart services
ssh user@server "sudo systemctl restart genesis-luminal"
ssh user@server "sudo systemctl restart nginx"

# Verificar serviços
ssh user@server "sudo systemctl status genesis-luminal"
```

### 5. Verificação Pós-Deploy

```bash
# Health checks
curl -f https://api.genesis-luminal.com/api/health

# Verificar disclaimer em produção
curl https://api.genesis-luminal.com/api/disclaimer

# Smoke tests
curl -X POST https://api.genesis-luminal.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"test","userId":"deploy-test"}'

echo "✅ Production deployment verified"
```

## Rollback

### Em caso de problemas

```bash
# Rollback rápido (manter versão anterior)
ssh user@server "sudo systemctl stop genesis-luminal"
ssh user@server "cd /var/www && mv genesis-luminal genesis-luminal-failed"
ssh user@server "cd /var/www && mv genesis-luminal-backup genesis-luminal"
ssh user@server "sudo systemctl start genesis-luminal"

# Verificar rollback
curl -f https://api.genesis-luminal.com/api/health
```

## Monitoramento Pós-Deploy

### Métricas para observar (primeiras 24h)

- **Response Time:** < 200ms p95
- **Error Rate:** < 0.1%
- **CPU Usage:** < 70%
- **Memory Usage:** < 80%
- **Disk Usage:** < 90%

### Logs importantes

```bash
# Application logs
tail -f /var/log/genesis-luminal/application.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# System logs
journalctl -u genesis-luminal -f
```

## Contatos de Emergência

- **Tech Lead:** tech-lead@genesis-luminal.com
- **DevOps:** devops@genesis-luminal.com
- **On-call:** +1-555-0123

## Troubleshooting Rápido

### Serviço não inicia
```bash
# Verificar logs de startup
journalctl -u genesis-luminal --since "5 minutes ago"

# Verificar permissões
ls -la /var/www/genesis-luminal/

# Verificar portas
netstat -tlnp | grep :3001
```

### High Response Time
```bash
# Verificar CPU/Memory
top
htop

# Verificar conexões
netstat -an | grep :3001 | wc -l

# Restart se necessário
sudo systemctl restart genesis-luminal
```

### API Errors
```bash
# Verificar logs de aplicação
grep ERROR /var/log/genesis-luminal/application.log

# Verificar disclaimer
curl https://api.genesis-luminal.com/api/disclaimer

# Health check detalhado
curl -v https://api.genesis-luminal.com/api/health
```
