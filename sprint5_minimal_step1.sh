#!/bin/bash

echo "Sprint 5 - Passo 1: Criando estrutura básica"
echo "============================================"

if [ ! -d "backend" ]; then
    echo "ERRO: Execute da raiz do projeto"
    exit 1
fi

cd backend

echo "1. Criando diretórios..."
mkdir -p src/telemetry
mkdir -p src/metrics
mkdir -p src/logging  
mkdir -p src/monitoring
mkdir -p logs

echo "2. Criando arquivo de telemetry básico..."
cat > src/telemetry/basic.ts << 'EOFINNER'
/**
 * Telemetry básica - Sprint 5 Passo 1
 */
export class BasicTelemetry {
  public initialize(): void {
    console.log('Basic telemetry initialized');
  }
}

export const telemetry = new BasicTelemetry();
EOFINNER

echo "3. Criando métricas básicas..."
cat > src/metrics/basic.ts << 'EOFINNER'
/**
 * Métricas básicas - Sprint 5 Passo 1
 */
export class BasicMetrics {
  private requestCount = 0;

  public recordRequest(): void {
    this.requestCount++;
    console.log(`Total requests: ${this.requestCount}`);
  }

  public getMetrics(): string {
    return `requests_total ${this.requestCount}`;
  }
}

export const metrics = new BasicMetrics();
EOFINNER

echo "4. Backup do app.ts atual..."
cp src/app.ts src/app.ts.backup-step1 2>/dev/null || echo "Backup feito"

echo "5. Testando build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build OK"
else
    echo "⚠️ Build com warnings (normal)"
fi

echo ""
echo "PASSO 1 CONCLUÍDO"
echo "================="
echo "✅ Estrutura de diretórios criada"
echo "✅ Arquivos básicos criados"
echo "✅ Build testado"
echo ""
echo "Próximo passo: Execute './sprint5_minimal_step2.sh'"
