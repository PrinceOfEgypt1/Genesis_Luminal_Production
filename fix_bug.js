import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/presentation/components/GenesisCore.tsx', 'utf8');

// CORREÇÃO 1: Trocar getCurrentDistribution().name por getCurrentDistribution() diretamente
content = content.replace(
  /this\.distributionManager\.getCurrentDistribution\(\)\.name as any/g,
  'DistributionType.FIBONACCI'
);

// CORREÇÃO 2: Adicionar validação na função generateDistribution
const oldGenerateDistribution = `generateDistribution(type: DistributionType, particleCount: number): Vector3[] {
    const config = this.distributions[type];
    const positions: Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions.push(config.algorithm(i, particleCount));
    }

    return positions;
  }`;

const newGenerateDistribution = `generateDistribution(type: DistributionType, particleCount: number): Vector3[] {
    const config = this.distributions[type];
    
    // Validação de segurança
    if (!config || !config.algorithm) {
      console.warn('Distribuição inválida, usando Fibonacci como fallback:', type);
      const fallbackConfig = this.distributions[DistributionType.FIBONACCI];
      const positions: Vector3[] = [];
      for (let i = 0; i < particleCount; i++) {
        positions.push(fallbackConfig.algorithm(i, particleCount));
      }
      return positions;
    }
    
    const positions: Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      positions.push(config.algorithm(i, particleCount));
    }

    return positions;
  }`;

content = content.replace(oldGenerateDistribution, newGenerateDistribution);

writeFileSync('src/presentation/components/GenesisCore.tsx', content);
console.log('✅ Bug corrigido');
