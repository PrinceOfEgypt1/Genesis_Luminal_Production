/**
 * Middleware de validação Zod universal
 * IMPLEMENTADO: Validação runtime robusta com error handling padronizado
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ErrorResponseDto } from '../../contracts/v1/schemas';

// Tipos para configuração do middleware
interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  response?: ZodSchema;
}

interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  returnValidatedData?: boolean;
}

/**
 * Middleware factory para validação Zod
 */
export function validateSchema(
  config: ValidationConfig,
  options: ValidationOptions = {}
) {
  const {
    abortEarly = true,
    stripUnknown = true,
    returnValidatedData = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData: any = {};

      // Validar body
      if (config.body) {
        try {
          validatedData.body = await config.body.parseAsync(req.body);
          if (returnValidatedData) {
            req.body = validatedData.body;
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return handleValidationError(error, 'body', res);
          }
          throw error;
        }
      }

      // Validar query parameters
      if (config.query) {
        try {
          validatedData.query = await config.query.parseAsync(req.query);
          if (returnValidatedData) {
            req.query = validatedData.query;
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return handleValidationError(error, 'query', res);
          }
          throw error;
        }
      }

      // Validar route parameters
      if (config.params) {
        try {
          validatedData.params = await config.params.parseAsync(req.params);
          if (returnValidatedData) {
            req.params = validatedData.params;
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return handleValidationError(error, 'params', res);
          }
          throw error;
        }
      }

      // Armazenar dados validados para uso posterior
      req.validatedData = validatedData;

      next();
    } catch (error) {
      console.error('Erro inesperado na validação:', error);
      const errorResponse: ErrorResponseDto = {
        error: 'Internal validation error',
        message: 'Erro interno na validação dos dados',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_INTERNAL_ERROR'
      };
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Middleware para validação de resposta (opcional, para desenvolvimento)
 */
export function validateResponse(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function(body: any) {
      try {
        const validatedBody = schema.parse(body);
        return originalJson.call(this, validatedBody);
      } catch (error) {
        if (error instanceof ZodError) {
          console.error('Response validation failed:', error.errors);
          const errorResponse: ErrorResponseDto = {
            error: 'Invalid response format',
            message: 'Resposta do servidor não atende ao contrato definido',
            timestamp: new Date().toISOString(),
            code: 'RESPONSE_VALIDATION_ERROR',
            details: error.errors
          };
          return originalJson.call(this, errorResponse);
        }
        return originalJson.call(this, body);
      }
    };

    next();
  };
}

/**
 * Handler de erros de validação padronizado
 */
function handleValidationError(
  zodError: ZodError,
  location: string,
  res: Response
): void {
  const errors = zodError.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.received
  }));

  const errorResponse: ErrorResponseDto = {
    error: 'Validation failed',
    message: `Dados inválidos em ${location}`,
    timestamp: new Date().toISOString(),
    code: 'VALIDATION_ERROR',
    details: {
      location,
      errors,
      total: errors.length
    }
  };

  res.status(400).json(errorResponse);
}

/**
 * Middleware para sanitização de entrada
 */
export function sanitizeInput() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitização básica de strings
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  };
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Augmentar tipos do Express para incluir dados validados
declare global {
  namespace Express {
    interface Request {
      validatedData?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}
