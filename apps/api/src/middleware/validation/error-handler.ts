/**
 * Error Handler Padronizado Enterprise
 * IMPLEMENTADO: Tratamento consistente de erros com logs estruturados
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorResponseDto } from '../../contracts/v1/schemas';

// Tipos de erro padronizados
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BAD_REQUEST = 'BAD_REQUEST'
}

// Classe de erro customizada
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCodes,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Middleware de tratamento de erros global
 */
export function globalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log estruturado do erro
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code
    }
  };

  console.error('API Error:', JSON.stringify(errorLog, null, 2));

  // Tratamento específico por tipo de erro
  if (error instanceof ZodError) {
    handleZodError(error, res);
    return;
  }

  if (error instanceof ApiError) {
    handleApiError(error, res);
    return;
  }

  // Erros específicos do Express/Node
  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    handleJsonError(res);
    return;
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    handleFileSizeError(res);
    return;
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    handleConnectionError(res);
    return;
  }

  // Erro interno não tratado
  handleInternalError(error, res);
}

function handleZodError(zodError: ZodError, res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'Validation failed',
    message: 'Dados fornecidos são inválidos',
    timestamp: new Date().toISOString(),
    code: ErrorCodes.VALIDATION_ERROR,
    details: {
      errors: zodError.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    }
  };

  res.status(400).json(errorResponse);
}

function handleApiError(apiError: ApiError, res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: apiError.name,
    message: apiError.message,
    timestamp: new Date().toISOString(),
    code: apiError.code,
    details: apiError.details
  };

  res.status(apiError.statusCode).json(errorResponse);
}

function handleJsonError(res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'Invalid JSON',
    message: 'Formato JSON inválido no corpo da requisição',
    timestamp: new Date().toISOString(),
    code: ErrorCodes.BAD_REQUEST
  };

  res.status(400).json(errorResponse);
}

function handleFileSizeError(res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'File too large',
    message: 'Arquivo excede o tamanho máximo permitido',
    timestamp: new Date().toISOString(),
    code: ErrorCodes.BAD_REQUEST
  };

  res.status(413).json(errorResponse);
}

function handleConnectionError(res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'Service unavailable',
    message: 'Serviço temporariamente indisponível',
    timestamp: new Date().toISOString(),
    code: ErrorCodes.SERVICE_UNAVAILABLE
  };

  res.status(503).json(errorResponse);
}

function handleInternalError(error: any, res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'Internal server error',
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    code: ErrorCodes.INTERNAL_ERROR
  };

  res.status(500).json(errorResponse);
}

/**
 * Middleware para capturar 404s
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponseDto = {
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} não encontrado`,
    timestamp: new Date().toISOString(),
    code: ErrorCodes.NOT_FOUND,
    details: {
      method: req.method,
      path: req.path
    }
  };

  res.status(404).json(errorResponse);
}

/**
 * Helper para criar erros padronizados
 */
export function createApiError(
  statusCode: number,
  code: ErrorCodes,
  message: string,
  details?: any
): ApiError {
  return new ApiError(statusCode, code, message, details);
}
