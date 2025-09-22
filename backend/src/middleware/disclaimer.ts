/**
 * @fileoverview Disclaimer middleware para Genesis Luminal
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';

interface FeatureStatus {
  status: 'IMPLEMENTADO' | 'SIMULACAO' | 'PLANEJADO';
  description: string;
}

/**
 * Middleware de disclaimer para funcionalidades
 */
export const disclaimerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Adicionar headers de disclaimer
  res.setHeader('X-Feature-Disclaimer', 'Algumas funcionalidades podem estar em modo simulação');
  res.setHeader('X-Development-Status', 'Beta');
  
  next();
};

/**
 * Obter status das funcionalidades
 */
export const getFeatureStatus = (): Record<string, FeatureStatus> => {
  return {
    emotionAnalysis: {
      status: 'IMPLEMENTADO',
      description: 'Análise de emoções via providers'
    },
    audioEngine: {
      status: 'SIMULACAO',
      description: 'Engine de áudio emocional'
    },
    metrics: {
      status: 'IMPLEMENTADO',
      description: 'Coleta de métricas e observabilidade'
    }
  };
};

/**
 * Middleware para incluir status das funcionalidades na resposta
 */
export const includeFeatureStatus = (req: Request, res: Response, next: NextFunction) => {
  // Adicionar método para incluir disclaimer na resposta
  res.locals.addDisclaimer = () => {
    const features = getFeatureStatus();
    
    return {
      disclaimer: {
        message: 'Este sistema inclui funcionalidades em diferentes estágios de desenvolvimento',
        features: Object.entries(features).map(([featureName, metadata]) => ({
          name: featureName,
          status: metadata.status,
          description: metadata.description,
          statusEmoji: getStatusEmoji(metadata.status)
        })),
        recommendations: [
          'Funcionalidades SIMULACAO são para demonstração',
          'Funcionalidades IMPLEMENTADO são totalmente funcionais',
          'Funcionalidades PLANEJADO serão implementadas no futuro'
        ]
      }
    };
  };
  
  next();
};

/**
 * Obter emoji para status
 */
const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'IMPLEMENTADO':
      return '✅';
    case 'SIMULACAO':
      return '🎭';
    case 'PLANEJADO':
      return '📋';
    default:
      return '❓';
  }
};

/**
 * Endpoint para obter disclaimer completo
 */
export const getDisclaimerInfo = (req: Request, res: Response) => {
  const disclaimerInfo = res.locals.addDisclaimer ? res.locals.addDisclaimer() : {};
  
  res.json({
    ...disclaimerInfo,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

export default {
  disclaimerMiddleware,
  includeFeatureStatus,
  getFeatureStatus,
  getDisclaimerInfo
};
