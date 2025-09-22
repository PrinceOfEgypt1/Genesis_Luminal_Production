/**
 * @fileoverview Middleware de Disclaimer - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Adiciona headers de transparência em todas as responses
 */

import { Request, Response, NextFunction } from 'express';
import { FeatureRegistry } from '@/types/system-status';

/**
 * Middleware que adiciona headers de transparência técnica
 */
export function disclaimerMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // Headers de transparência
  res.setHeader('X-Genesis-Mode', 'DEVELOPMENT');
  res.setHeader('X-Genesis-Simulation', 'ACTIVE');
  res.setHeader('X-Genesis-Version', '1.0.0-alpha');
  res.setHeader('X-Genesis-Disclaimer', 'Contains simulated features - Not production ready');
  
  // Interceptar JSON responses para adicionar disclaimer
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    const honestyReport = FeatureRegistry.generateHonestyReport();
    
    // Adicionar metadados de transparência
    const responseWithDisclaimer = {
      ...obj,
      _disclaimer: {
        environment: 'DEVELOPMENT',
        simulatedFeatures: honestyReport.simulated,
        implementedFeatures: honestyReport.implemented,
        honestyScore: honestyReport.honestyScore,
        warning: 'Este sistema contém funcionalidades simuladas. Não usar em produção.',
        lastUpdated: new Date().toISOString(),
        documentation: 'https://genesis-luminal.dev/docs/disclaimer'
      }
    };
    
    return originalJson.call(this, responseWithDisclaimer);
  };
  
  next();
}

/**
 * Endpoint dedicado para disclaimer e transparência
 */
export function createDisclaimerRoutes(app: any): void {
  app.get('/api/disclaimer', (req: Request, res: Response) => {
    const honestyReport = FeatureRegistry.generateHonestyReport();
    
    res.json({
      title: 'Genesis Luminal - Disclaimer de Desenvolvimento',
      version: '1.0.0-alpha',
      environment: 'DEVELOPMENT',
      warnings: [
        '🔴 SISTEMA EM DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO',
        '🔴 CONTÉM FUNCIONALIDADES SIMULADAS',
        '🔴 DADOS PODEM SER BASEADOS EM HEURÍSTICAS',
        '🔴 PRECISÃO LIMITADA EM ANÁLISES'
      ],
      honestyReport,
      features: Array.from(FeatureRegistry.getAll().entries()).map(([name, metadata]) => ({
        name,
        status: metadata.status,
        confidence: metadata.confidence,
        limitations: metadata.limitations
      })),
      contact: {
        documentation: 'https://genesis-luminal.dev/docs',
        support: 'https://github.com/PrinceOfEgypt1/Genesis_Luminal_Production/issues',
        disclaimer: 'Este projeto é para fins de demonstração e desenvolvimento'
      },
      lastUpdated: new Date().toISOString()
    });
  });
  
  app.get('/api/system/honesty-report', (req: Request, res: Response) => {
    const report = FeatureRegistry.generateHonestyReport();
    const features = FeatureRegistry.getAll();
    
    res.json({
      summary: report,
      features: Array.from(features.entries()).map(([name, metadata]) => ({
        name,
        ...metadata,
        statusEmoji: getStatusEmoji(metadata.status)
      })),
      recommendations: [
        'Marcar claramente funcionalidades simuladas',
        'Implementar funcionalidades reais onde possível',
        'Documentar limitações conhecidas',
        'Manter transparência com usuários'
      ]
    });
  });
}

function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    'IMPLEMENTED': '✅',
    'SIMULATION': '🔴', 
    'PLANNED': '🟡',
    'IN_DEVELOPMENT': '🔵',
    'PARTIAL': '🟠',
    'DEPRECATED': '⚫'
  };
  
  return emojiMap[status] || '❓';
}
