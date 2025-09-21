/**
 * @fileoverview Structured Logger - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Sistema de logging estruturado para observabilidade enterprise
 */

import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

/**
 * Níveis de log
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * Contexto de log estruturado
 */
interface LogContext {
  // Identificadores
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  
  // Request context
  method?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  
  // Performance
  duration?: number;
  responseTime?: number;
  
  // Business context
  action?: string;
  resource?: string;
  provider?: string;
  
  // Error context
  error?: Error | string;
  stack?: string;
  
  // Custom fields
  [key: string]: any;
}

/**
 * Estrutura de log entry
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  service: string;
  version: string;
  environment: string;
  hostname: string;
}

/**
 * Logger enterprise com estruturação JSON
 */
export class StructuredLogger {
  private static instance: StructuredLogger;
  private logStreams = new Map<LogLevel, WriteStream>();
  private service: string;
  private version: string;
  private environment: string;
  private hostname: string;
  
  private constructor() {
    this.service = 'genesis-luminal-backend';
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
    this.hostname = process.env.HOSTNAME || require('os').hostname();
    
    this.initializeLogStreams();
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }
  
  /**
   * Inicializa streams de log por nível
   */
  private initializeLogStreams(): void {
    const logDir = process.env.LOG_DIR || './logs';
    
    try {
      // Criar diretório de logs se não existir
      require('fs').mkdirSync(logDir, { recursive: true });
      
      // Stream para logs de erro
      this.logStreams.set(
        LogLevel.ERROR,
        createWriteStream(join(logDir, 'error.log'), { flags: 'a' })
      );
      
      // Stream para logs gerais
      this.logStreams.set(
        LogLevel.INFO,
        createWriteStream(join(logDir, 'application.log'), { flags: 'a' })
      );
      
      // Stream para debug (apenas em desenvolvimento)
      if (this.environment === 'development') {
        this.logStreams.set(
          LogLevel.DEBUG,
          createWriteStream(join(logDir, 'debug.log'), { flags: 'a' })
        );
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize log streams:', error);
    }
  }
  
  /**
   * Log genérico estruturado
   */
  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      service: this.service,
      version: this.version,
      environment: this.environment,
      hostname: this.hostname
    };
    
    const logLine = JSON.stringify(entry) + '\n';
    
    // Console output (com formatação em desenvolvimento)
    if (this.environment === 'development') {
      this.consoleOutput(entry);
    } else {
      console.log(logLine.trim());
    }
    
    // File output
    this.writeToFile(level, logLine);
    
    // Métricas (incrementar contadores)
    this.incrementLogMetrics(level);
  }
  
  /**
   * Sanitiza contexto removendo dados sensíveis
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    // Campos sensíveis para redação
    const sensitiveFields = [
      'password', 'apiKey', 'token', 'secret', 'authorization',
      'cookie', 'sessionId', 'creditCard', 'ssn'
    ];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    // Truncar campos muito longos
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...TRUNCATED';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Output formatado para console em desenvolvimento
   */
  private consoleOutput(entry: LogEntry): void {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.TRACE]: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    
    const timestamp = entry.timestamp.substring(11, 23); // HH:mm:ss.SSS
    const level = entry.level.toUpperCase().padEnd(5);
    const correlationId = entry.context.correlationId ? 
      `[${entry.context.correlationId.substring(0, 8)}]` : '';
    
    console.log(`${color}${timestamp} ${level}${reset} ${correlationId} ${entry.message}`);
    
    // Mostrar contexto se presente
    if (Object.keys(entry.context).length > 0) {
      console.log(`${color}  Context:${reset}`, JSON.stringify(entry.context, null, 2));
    }
  }
  
  /**
   * Escreve para arquivo
   */
  private writeToFile(level: LogLevel, logLine: string): void {
    // Escrever no stream específico do nível
    const stream = this.logStreams.get(level);
    if (stream) {
      stream.write(logLine);
    }
    
    // Sempre escrever logs de erro e warn no stream geral
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      const infoStream = this.logStreams.get(LogLevel.INFO);
      if (infoStream && infoStream !== stream) {
        infoStream.write(logLine);
      }
    }
  }
  
  /**
   * Incrementa métricas de log
   */
  private incrementLogMetrics(level: LogLevel): void {
    // TODO: Integrar com sistema de métricas (Prometheus, etc.)
    // Por enquanto, usar contador em memória
    const key = `log_${level}_total`;
    const current = (global as any)[key] || 0;
    (global as any)[key] = current + 1;
  }
  
  /**
   * Métodos de log por nível
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.environment === 'development' || process.env.LOG_LEVEL === 'debug') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }
  
  trace(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'trace') {
      this.log(LogLevel.TRACE, message, context);
    }
  }
  
  /**
   * Log de auditoria para compliance
   */
  audit(action: string, context: LogContext): void {
    this.info(`AUDIT: ${action}`, {
      ...context,
      auditLog: true,
      action
    });
  }
  
  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`PERFORMANCE: ${operation}`, {
      ...context,
      performanceLog: true,
      operation,
      duration,
      durationMs: `${duration}ms`
    });
  }
  
  /**
   * Log de security events
   */
  security(event: string, context: LogContext): void {
    this.warn(`SECURITY: ${event}`, {
      ...context,
      securityLog: true,
      securityEvent: event
    });
  }
  
  /**
   * Middleware Express para logging automático
   */
  static createExpressMiddleware() {
    const logger = StructuredLogger.getInstance();
    
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const correlationId = req.headers['x-correlation-id'] || 
                          `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Adicionar correlation ID ao request
      req.correlationId = correlationId;
      res.setHeader('X-Correlation-ID', correlationId);
      
      // Log da request
      logger.info('HTTP Request', {
        correlationId,
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        userId: req.body?.userId
      });
      
      // Interceptar response
      const originalSend = res.send;
      res.send = function(body: any) {
        const duration = Date.now() - startTime;
        
        logger.info('HTTP Response', {
          correlationId,
          method: req.method,
          url: req.originalUrl || req.url,
          statusCode: res.statusCode,
          duration,
          responseTime: `${duration}ms`
        });
        
        // Log performance se demorou muito
        if (duration > 1000) {
          logger.performance('Slow HTTP Request', duration, {
            correlationId,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode
          });
        }
        
        return originalSend.call(this, body);
      };
      
      next();
    };
  }
  
  /**
   * Fechar streams de log
   */
  close(): void {
    this.logStreams.forEach(stream => {
      stream.end();
    });
  }
  
  /**
   * Obter métricas de log
   */
  getMetrics(): Record<string, number> {
    return {
      log_error_total: (global as any).log_error_total || 0,
      log_warn_total: (global as any).log_warn_total || 0,
      log_info_total: (global as any).log_info_total || 0,
      log_debug_total: (global as any).log_debug_total || 0,
      log_trace_total: (global as any).log_trace_total || 0
    };
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance();
