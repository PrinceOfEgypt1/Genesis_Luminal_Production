/**
 * TRILHO B AÇÃO 6 - Error Middleware (PATH CORRIGIDO)
 * 
 * Middleware de tratamento de erros
 * Correção: Path correto para logger
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Não expor detalhes de erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
}
