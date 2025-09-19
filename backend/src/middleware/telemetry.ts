/**
 * @fileoverview Middleware de Telemetria
 * 
 * Middleware Express para adicionar correlation IDs,
 * registrar métricas e criar spans automáticos
 * 
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */

import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId, setCorrelationId } from '../telemetry/tracing';
import { recordHttpRequestLatency } from '../telemetry/metrics';

/**
 * Interface estendida do Request com telemetria
 */
export interface TelemetryRequest extends Request {
  correlationId: string;
  startTime: number;
}

/**
 * Middleware principal de telemetria
 */
export function telemetryMiddleware(
  req: TelemetryRequest, 
  res: Response, 
  next: NextFunction
): void {
  // Gerar ou usar correlation ID existente
  const correlationId = req.headers['x-correlation-id'] as string || 
                       req.headers['x-request-id'] as string || 
                       generateCorrelationId();
  
  // Adicionar ao request
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  // Adicionar aos headers de resposta
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-trace-id', correlationId);
  
  // Configurar contexto de tracing
  setCorrelationId(correlationId);
  
  // Registrar métricas quando resposta for enviada
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const route = req.route?.path || req.path || 'unknown';
    
    recordHttpRequestLatency(
      duration,
      req.method,
      route,
      res.statusCode
    );
  });
  
  next();
}

/**
 * Middleware específico para endpoints de análise emocional
 */
export function emotionalAnalysisTelemetry(
  req: TelemetryRequest,
  res: Response,
  next: NextFunction
): void {
  // Adicionar contexto específico para análise emocional
  res.setHeader('x-analysis-type', 'emotional');
  res.setHeader('x-service', 'genesis-luminal');
  
  next();
}
