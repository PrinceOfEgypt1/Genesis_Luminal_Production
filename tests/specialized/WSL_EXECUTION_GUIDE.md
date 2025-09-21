# Genesis Luminal - Guia de Execução em WSL

## 🐧 Comandos Específicos para WSL/Ubuntu

### ✅ Execução Recomendada (WSL-friendly)

```bash
# Executar todos os testes especializados (versão WSL)
npm run test:specialized:wsl

# Executar testes individuais (versão WSL)
npm run test:accessibility:wsl
npm run test:performance:wsl
npm run test:load:wsl
npm run test:security:wsl

# Analisar vulnerabilidades
npm run security:analyze

# Visualizar relatórios (WSL)
npm run open:report:wsl
```

### 🔧 Troubleshooting WSL

#### 1. Chrome/Lighthouse Issues
```bash
# Se Lighthouse falhar, usar configuração WSL
npm run test:performance:wsl

# Para debug do Chrome
export PWDEBUG=1
npm run test:accessibility:wsl
```

#### 2. Aplicações não iniciam
```bash
# Verificar se frontende/backend estão rodando
cd frontend && npm run dev &  # Porta 5173
cd backend && npm run dev &   # Porta 3001

# Verificar portas
netstat -tlnp | grep -E "(5173|3001)"
```

#### 3. Visualizar Relatórios
```bash
# No WSL, usar explorer.exe para abrir no Windows
explorer.exe test-results/specialized/index.html

# Ou copiar para área Windows
cp -r test-results /mnt/c/temp/genesis-reports
```

#### 4. Performance em WSL
```bash
# Se testes muito lentos, reduzir workers
export PLAYWRIGHT_WORKERS=1

# Aumentar timeouts
export PLAYWRIGHT_TIMEOUT=120000
```

## 📊 Critérios Adaptados para WSL

### Performance (Lighthouse)
- **FCP**: <4s (relaxado para WSL)
- **LCP**: <6s (relaxado para WSL)
- **Performance Score**: >0.7 (relaxado)

### Load Testing
- **Concorrência**: Reduzida para WSL
- **Timeouts**: Aumentados
- **Workers**: Sequencial (1 worker)

### Accessibility
- **Critérios**: Mantidos (WCAG 2.1 AA)
- **Timeouts**: Aumentados para WSL

## 🚨 Limitações Conhecidas em WSL

1. **Lighthouse**: Performance reduzida em ambiente virtualizado
2. **Chrome**: Requer flags especiais (--no-sandbox)
3. **Load Testing**: Capacidade reduzida vs ambiente nativo
4. **File Watching**: Pode ser mais lento

## ✅ Validação de Ambiente WSL

```bash
# Verificar dependências WSL
which google-chrome || echo "Chrome não instalado"
which firefox || echo "Firefox não instalado"
node --version
npm --version

# Testar Playwright
npx playwright install chromium
npx playwright --version

# Testar conectividade
curl http://localhost:5173 || echo "Frontend não rodando"
curl http://localhost:3001/health || echo "Backend não rodando"
```

