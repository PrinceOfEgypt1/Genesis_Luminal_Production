/**
 * @fileoverview Disclaimer middleware
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

interface FeatureMetadata {
  status: 'IMPLEMENTADO' | 'SIMULACAO' | 'PLANEJADO';
  description: string;
}

/**
 * Middleware de disclaimer
 */
export const disclaimerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Feature-Disclaimer', 'Algumas funcionalidades podem estar em simulação');
  next();
};

/**
 * Obter status das funcionalidades
 */
export const getFeatureStatus = () => {
  const features = new Map<string, FeatureMetadata>([
    ['emotionAnalysis', { status: 'IMPLEMENTADO', description: 'Análise de emoções' }],
    ['audioEngine', { status: 'SIMULACAO', description: 'Engine de áudio' }],
    ['metrics', { status: 'IMPLEMENTADO', description: 'Métricas' }]
  ]);

  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'IMPLEMENTADO': return '✅';
      case 'SIMULACAO': return '🎭';
      case 'PLANEJADO': return '📋';
      default: return '❓';
    }
  };

  return {
    summary: 'Status das funcionalidades',
    features: Array.from(features.entries()).map(([featureName, metadata]) => ({
      name: featureName, // Manter apenas UMA propriedade name
      status: metadata.status,
      description: metadata.description,
      statusEmoji: getStatusEmoji(metadata.status)
    })),
    recommendations: [
      'Funcionalidades SIMULACAO são para demonstração',
      'Funcionalidades IMPLEMENTADO são totalmente funcionais'
    ]
  };
};

export default disclaimerMiddleware;
