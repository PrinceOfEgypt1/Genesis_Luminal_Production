/**
 * GENESIS LUMINAL - MIDDLEWARE DE VALIDAÇÃO COMPLETA
 * Validação com Zod para 100% dos endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

// Schema para análise emocional
export const emotionalAnalysisSchema = z.object({
  body: z.object({
    currentState: z.object({
      joy: z.number().min(0).max(1).default(0),
      sadness: z.number().min(0).max(1).default(0),
      anger: z.number().min(0).max(1).default(0),
      fear: z.number().min(0).max(1).default(0),
      surprise: z.number().min(0).max(1).default(0),
      disgust: z.number().min(0).max(1).default(0),
      valence: z.number().min(-1).max(1).default(0),
      arousal: z.number().min(0).max(1).default(0),
      dominantAffect: z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral']).default('neutral'),
      intensity: z.number().min(0).max(1).default(0.5)
    }).optional(),
    mousePosition: z.object({
      x: z.number().min(0).default(0),
      y: z.number().min(0).default(0)
    }).optional(),
    sessionDuration: z.number().min(0).default(0),
    userId: z.string().uuid().optional(),
    text: z.string().max(5000).optional(),
    message: z.string().max(5000).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Schema para health endpoints
export const healthSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    detailed: z.enum(['true', 'false']).optional()
  }).optional(),
  params: z.object({}).optional()
});

// Schema genérico para endpoints que não precisam de dados específicos
export const basicSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// ========================================
// MIDDLEWARE DE VALIDAÇÃO
// ========================================

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Criar objeto de validação com corpo, query e params
      const validationData = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {}
      };

      // Validar dados
      const result = schema.safeParse(validationData);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Validação falhou', {
          url: req.url,
          method: req.method,
          errors: errors,
          receivedData: validationData
        });

        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      // Atualizar request com dados validados e limpos
      const validatedData = result.data;
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      logger.error('Erro na validação', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        error: 'Erro interno na validação',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// ========================================
// VALIDAÇÕES SANITIZADAS ESPECÍFICAS
// ========================================

// Sanitização para análise emocional (mantém compatibilidade)
export const sanitizedEmotionalValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const b: any = req.body ?? {};
    const dna: any = b.currentState ?? {};
    const mouse: any = b.mousePosition ?? {};

    // Função helper para números seguros
    const num = (v: any, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
    const str = (v: any, d = '') => (typeof v === 'string' && v.length ? v : d);

    // Normalizar estrutura
    req.body = {
      currentState: {
        joy: num(dna.joy, 0),
        sadness: num(dna.sadness, 0),
        anger: num(dna.anger, 0),
        fear: num(dna.fear, 0),
        surprise: num(dna.surprise, 0),
        disgust: num(dna.disgust, 0),
        valence: num(dna.valence, 0),
        arousal: num(dna.arousal, 0),
        dominantAffect: str(dna.dominantAffect, 'neutral'),
        intensity: num(dna.intensity, 0.5)
      },
      mousePosition: {
        x: num(mouse.x, 0),
        y: num(mouse.y, 0)
      },
      sessionDuration: num(b.sessionDuration, 0),
      userId: typeof b.userId === 'string' ? b.userId : undefined,
      text: str(b.text || b.message, '')
    };

    // Aplicar validação Zod após sanitização
    validate(emotionalAnalysisSchema)(req, res, next);
  } catch (error) {
    logger.error('Erro na sanitização emocional', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      body: req.body
    });

    res.status(400).json({
      error: 'Erro na sanitização dos dados emocionais',
      timestamp: new Date().toISOString()
    });
  }
};

// ========================================
// MIDDLEWARE DE VALIDAÇÃO ESPECÍFICO POR ROTA
// ========================================

export const validationMiddleware = {
  emotional: sanitizedEmotionalValidation,
  health: validate(healthSchema),
  basic: validate(basicSchema)
};

export default validationMiddleware;
