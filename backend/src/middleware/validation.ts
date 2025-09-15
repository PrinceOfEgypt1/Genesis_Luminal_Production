/**
 * GENESIS LUMINAL - MIDDLEWARE DE VALIDAÇÃO ROBUSTA
 * Validação de entrada em 100% dos endpoints usando Zod
 * Implementa práticas de segurança OWASP para input validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

/**
 * SCHEMAS DE VALIDAÇÃO ESPECÍFICOS
 */

// Schema para análise emocional
export const EmotionalAnalysisSchema = z.object({
  currentState: z.object({
    mouseX: z.number().min(-1000).max(3000).finite(),
    mouseY: z.number().min(-1000).max(2000).finite(),
    intensity: z.number().min(0).max(1).finite(),
    complexity: z.number().min(0).max(1).finite(),
    empathy: z.number().min(0).max(1).finite(),
    coherence: z.number().min(0).max(1).finite()
  }),
  mousePosition: z.object({
    x: z.number().min(-1000).max(3000).finite(),
    y: z.number().min(-1000).max(2000).finite()
  }),
  timestamp: z.number().positive().optional(),
  sessionId: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_-]+$/).optional()
});

// Schema para parâmetros de query genéricos
export const QueryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 1000).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_.,!?]+$/).optional()
});

// Schema para headers de API
export const ApiHeadersSchema = z.object({
  'content-type': z.string().regex(/^application\/json(;.*)?$/i).optional(),
  'user-agent': z.string().min(1).max(500).optional(),
  'x-api-key': z.string().min(16).max(256).optional(),
  'authorization': z.string().regex(/^Bearer [a-zA-Z0-9._-]+$/).optional()
}).passthrough(); // Permite outros headers

/**
 * FACTORY PARA CRIAR MIDDLEWARE DE VALIDAÇÃO
 * Cria middleware personalizado para cada tipo de validação
 */
export function createValidationMiddleware(options: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationErrors: string[] = [];

      // Validar body se schema fornecido
      if (options.body) {
        try {
          req.body = await options.body.parseAsync(req.body || {});
        } catch (error) {
          if (error instanceof z.ZodError) {
            validationErrors.push(`Body: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
          }
        }
      }

      // Validar query parameters se schema fornecido
      if (options.query) {
        try {
          req.query = await options.query.parseAsync(req.query || {});
        } catch (error) {
          if (error instanceof z.ZodError) {
            validationErrors.push(`Query: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
          }
        }
      }

      // Validar route parameters se schema fornecido
      if (options.params) {
        try {
          req.params = await options.params.parseAsync(req.params || {});
        } catch (error) {
          if (error instanceof z.ZodError) {
            validationErrors.push(`Params: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
          }
        }
      }

      // Validar headers se schema fornecido
      if (options.headers) {
        try {
          // Normalizar headers para lowercase (Express faz isso automaticamente)
          const normalizedHeaders: Record<string, any> = {};
          for (const [key, value] of Object.entries(req.headers)) {
            normalizedHeaders[key.toLowerCase()] = value;
          }
          await options.headers.parseAsync(normalizedHeaders);
        } catch (error) {
          if (error instanceof z.ZodError) {
            validationErrors.push(`Headers: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
          }
        }
      }

      // Se há erros de validação, retornar 400
      if (validationErrors.length > 0) {
        logger.warn('Validation failed', {
          type: 'validation_error',
          errors: validationErrors,
          url: req.url,
          method: req.method,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Request data does not meet security requirements',
          details: validationErrors,
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation process failed'
      });
    }
  };
}

/**
 * MIDDLEWARES PRÉ-CONFIGURADOS PARA ENDPOINTS ESPECÍFICOS
 */

// Validação para endpoints de análise emocional
export const validateEmotionalAnalysis = createValidationMiddleware({
  body: EmotionalAnalysisSchema,
  headers: ApiHeadersSchema
});

// Validação para endpoints com query parameters
export const validateQueryParams = createValidationMiddleware({
  query: QueryParamsSchema,
  headers: ApiHeadersSchema
});

// Validação genérica para APIs
export const validateApiHeaders = createValidationMiddleware({
  headers: ApiHeadersSchema
});

/**
 * MIDDLEWARE DE SANITIZAÇÃO AVANÇADA
 * Limpa e normaliza dados após validação
 */
export function advancedSanitization(req: Request, res: Response, next: NextFunction) {
  try {
    // Sanitizar strings no body
    if (req.body && typeof req.body === 'object') {
      sanitizeObjectStrings(req.body);
    }

    // Sanitizar query params  
    if (req.query && typeof req.query === 'object') {
      sanitizeObjectStrings(req.query);
    }

    // Sanitizar params
    if (req.params && typeof req.params === 'object') {
      sanitizeObjectStrings(req.params);
    }

    next();
  } catch (error) {
    logger.error('Advanced sanitization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
      method: req.method
    });

    res.status(400).json({
      error: 'Data Processing Error',
      message: 'Request data could not be safely processed'
    });
  }
}

/**
 * Função auxiliar para sanitização de strings em objetos
 */
function sanitizeObjectStrings(obj: any): void {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Trim whitespace
        obj[key] = obj[key].trim();
        
        // Remover caracteres de controle (exceto \n, \r, \t)
        obj[key] = obj[key].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Normalizar Unicode (previne ataques de homograph)
        obj[key] = obj[key].normalize('NFKC');
        
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObjectStrings(obj[key]);
      }
    }
  }
}

/**
 * MIDDLEWARE PARA LIMITAR TAMANHO DE PAYLOAD
 * Previne ataques de DoS via payloads grandes
 */
export function payloadSizeLimit(maxSizeBytes: number = 1024 * 1024) { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const payloadSize = parseInt(req.get('content-length') || '0', 10);
    
    if (payloadSize > maxSizeBytes) {
      logger.warn('Payload size limit exceeded', {
        type: 'security_violation',
        payloadSize,
        maxAllowed: maxSizeBytes,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size ${payloadSize} bytes exceeds limit of ${maxSizeBytes} bytes`
      });
    }

    next();
  };
}

/**
 * MIDDLEWARE CONSOLIDADO DE VALIDAÇÃO COMPLETA
 * Aplica todas as validações em ordem correta
 */
export function applyValidation() {
  return [
    payloadSizeLimit(1024 * 1024), // 1MB limit
    advancedSanitization
  ];
}
