/**
 * @fileoverview Structured Logger - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 *
 * Sistema de logging estruturado para observabilidade enterprise
 */
import { createWriteStream } from 'fs';
import { join } from 'path';
/**
 * Níveis de log
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (LogLevel = {}));
/**
 * Logger enterprise com estruturação JSON
 */
export class StructuredLogger {
    static instance;
    logStreams = new Map();
    service;
    version;
    environment;
    hostname;
    constructor() {
        this.service = 'genesis-luminal-backend';
        this.version = process.env.npm_package_version || '1.0.0';
        this.environment = process.env.NODE_ENV || 'development';
        this.hostname = process.env.HOSTNAME || require('os').hostname();
        this.initializeLogStreams();
    }
    /**
     * Singleton instance
     */
    static getInstance() {
        if (!StructuredLogger.instance) {
            StructuredLogger.instance = new StructuredLogger();
        }
        return StructuredLogger.instance;
    }
    /**
     * Inicializa streams de log por nível
     */
    initializeLogStreams() {
        const logDir = process.env.LOG_DIR || './logs';
        try {
            // Criar diretório de logs se não existir
            require('fs').mkdirSync(logDir, { recursive: true });
            // Stream para logs de erro
            this.logStreams.set(LogLevel.ERROR, createWriteStream(join(logDir, 'error.log'), { flags: 'a' }));
            // Stream para logs gerais
            this.logStreams.set(LogLevel.INFO, createWriteStream(join(logDir, 'application.log'), { flags: 'a' }));
            // Stream para debug (apenas em desenvolvimento)
            if (this.environment === 'development') {
                this.logStreams.set(LogLevel.DEBUG, createWriteStream(join(logDir, 'debug.log'), { flags: 'a' }));
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize log streams:', error);
        }
    }
    /**
     * Log genérico estruturado
     */
    log(level, message, context = {}) {
        const entry = {
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
        }
        else {
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
    sanitizeContext(context) {
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
    consoleOutput(entry) {
        const colors = {
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.INFO]: '\x1b[36m', // Cyan
            [LogLevel.DEBUG]: '\x1b[35m', // Magenta
            [LogLevel.TRACE]: '\x1b[37m' // White
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
    writeToFile(level, logLine) {
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
    incrementLogMetrics(level) {
        // TODO: Integrar com sistema de métricas (Prometheus, etc.)
        // Por enquanto, usar contador em memória
        const key = `log_${level}_total`;
        const current = global[key] || 0;
        global[key] = current + 1;
    }
    /**
     * Métodos de log por nível
     */
    error(message, context) {
        this.log(LogLevel.ERROR, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    debug(message, context) {
        if (this.environment === 'development' || process.env.LOG_LEVEL === 'debug') {
            this.log(LogLevel.DEBUG, message, context);
        }
    }
    trace(message, context) {
        if (process.env.LOG_LEVEL === 'trace') {
            this.log(LogLevel.TRACE, message, context);
        }
    }
    /**
     * Log de auditoria para compliance
     */
    audit(action, context) {
        this.info(`AUDIT: ${action}`, {
            ...context,
            auditLog: true,
            action
        });
    }
    /**
     * Log de performance
     */
    performance(operation, duration, context) {
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
    security(event, context) {
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
        return (req, res, next) => {
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
            res.send = function (body) {
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
    close() {
        this.logStreams.forEach(stream => {
            stream.end();
        });
    }
    /**
     * Obter métricas de log
     */
    getMetrics() {
        return {
            log_error_total: global.log_error_total || 0,
            log_warn_total: global.log_warn_total || 0,
            log_info_total: global.log_info_total || 0,
            log_debug_total: global.log_debug_total || 0,
            log_trace_total: global.log_trace_total || 0
        };
    }
}
// Export singleton instance
export const logger = StructuredLogger.getInstance();
