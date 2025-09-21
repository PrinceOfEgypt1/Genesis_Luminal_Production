/**
 * @fileoverview Rate Limiting Granular - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 *
 * Rate limiting diferenciado por rota e tipo de usuário
 */
import rateLimit from 'express-rate-limit';
/**
 * Tipos de limite de rate
 */
export var RateLimitType;
(function (RateLimitType) {
    RateLimitType["HEALTH_CHECK"] = "health_check";
    RateLimitType["API_GENERAL"] = "api_general";
    RateLimitType["EMOTION_ANALYSIS"] = "emotion_analysis";
    RateLimitType["ADMIN"] = "admin";
    RateLimitType["DOCUMENTATION"] = "documentation";
})(RateLimitType || (RateLimitType = {}));
/**
 * Configurações de rate limit por tipo
 */
const rateLimitConfigs = {
    [RateLimitType.HEALTH_CHECK]: {
        windowMs: 1 * 60 * 1000, // 1 minuto
        maxRequests: 1000, // Muito alto para health checks
        message: 'Health check rate limit exceeded',
        skipSuccessfulRequests: true
    },
    [RateLimitType.API_GENERAL]: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 100, // 100 requests per 15min
        message: 'API rate limit exceeded. Please try again later.',
        skipSuccessfulRequests: false
    },
    [RateLimitType.EMOTION_ANALYSIS]: {
        windowMs: 1 * 60 * 1000, // 1 minuto
        maxRequests: 20, // 20 análises por minuto
        message: 'Emotion analysis rate limit exceeded. Please slow down.',
        skipSuccessfulRequests: false
    },
    [RateLimitType.ADMIN]: {
        windowMs: 1 * 60 * 1000, // 1 minuto
        maxRequests: 10, // Bem restritivo para admin
        message: 'Admin API rate limit exceeded',
        skipSuccessfulRequests: false
    },
    [RateLimitType.DOCUMENTATION]: {
        windowMs: 1 * 60 * 1000, // 1 minuto
        maxRequests: 50, // Docs podem ser acessadas mais frequentemente
        message: 'Documentation rate limit exceeded',
        skipSuccessfulRequests: true
    }
};
/**
 * Gerador de chave personalizado
 */
function customKeyGenerator(req) {
    // Usar IP + User-Agent para melhor identificação
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    // Hash simples para não expor dados sensíveis em logs
    const crypto = require('crypto');
    const identifier = crypto
        .createHash('sha256')
        .update(ip + userAgent)
        .digest('hex')
        .substring(0, 16);
    return identifier;
}
/**
 * Handler personalizado para rate limit exceeded
 */
function rateLimitHandler(req, res) {
    const limitType = req.rateLimit?.type || 'unknown';
    console.warn('🚨 RATE LIMIT: Limit exceeded', {
        ip: req.ip,
        path: req.path,
        limitType,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    res.status(429).json({
        error: 'Rate limit exceeded',
        type: limitType,
        retryAfter: req.rateLimit?.resetTime,
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    });
}
/**
 * Skip function para rate limiting
 */
function createSkipFunction(type) {
    return (req) => {
        // Nunca aplicar rate limit em health checks em desenvolvimento
        if (type === RateLimitType.HEALTH_CHECK && process.env.NODE_ENV === 'development') {
            return true;
        }
        // Skip para IPs internos em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            const isInternal = req.ip === '127.0.0.1' ||
                req.ip === '::1' ||
                req.ip?.startsWith('192.168.');
            if (isInternal) {
                return true;
            }
        }
        // Skip se rate limiting estiver desabilitado
        if (process.env.RATE_LIMIT_ENABLED === 'false') {
            return true;
        }
        return false;
    };
}
/**
 * Criar middleware de rate limit
 */
function createRateLimitMiddleware(type) {
    const config = rateLimitConfigs[type];
    return rateLimit({
        windowMs: config.windowMs,
        max: config.maxRequests,
        message: config.message,
        keyGenerator: customKeyGenerator,
        handler: rateLimitHandler,
        skip: createSkipFunction(type),
        skipSuccessfulRequests: config.skipSuccessfulRequests,
        skipFailedRequests: false,
        // Headers customizados
        standardHeaders: true,
        legacyHeaders: false,
        // Adicionar tipo ao request para logging
        onLimitReached: (req) => {
            req.rateLimit = {
                type,
                resetTime: Date.now() + config.windowMs
            };
        }
    });
}
/**
 * Middleware para logs de rate limiting
 */
export function rateLimitLoggingMiddleware(req, res, next) {
    // Log apenas requests próximos ao limite
    const remaining = parseInt(res.get('X-RateLimit-Remaining') || '999999');
    const limit = parseInt(res.get('X-RateLimit-Limit') || '999999');
    if (remaining <= limit * 0.1) { // 10% do limite restante
        console.warn('⚠️ RATE LIMIT: Approaching limit', {
            ip: req.ip,
            path: req.path,
            remaining,
            limit,
            timestamp: new Date().toISOString()
        });
    }
    next();
}
/**
 * Rate limiters por tipo
 */
export const rateLimiters = {
    healthCheck: createRateLimitMiddleware(RateLimitType.HEALTH_CHECK),
    apiGeneral: createRateLimitMiddleware(RateLimitType.API_GENERAL),
    emotionAnalysis: createRateLimitMiddleware(RateLimitType.EMOTION_ANALYSIS),
    admin: createRateLimitMiddleware(RateLimitType.ADMIN),
    documentation: createRateLimitMiddleware(RateLimitType.DOCUMENTATION)
};
/**
 * Configurar rate limiting no app
 */
export function setupRateLimiting(app) {
    // Rate limiting logging
    app.use(rateLimitLoggingMiddleware);
    // Rate limiters específicos por rota
    app.use('/api/health', rateLimiters.healthCheck);
    app.use('/api/analyze', rateLimiters.emotionAnalysis);
    app.use('/api/docs', rateLimiters.documentation);
    app.use('/api/admin', rateLimiters.admin);
    // Rate limiter geral para outras rotas da API
    app.use('/api', rateLimiters.apiGeneral);
    console.log('⏱️ Rate limiting granular configurado');
    // Log das configurações em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 Rate limit configurations:', {
            healthCheck: `${rateLimitConfigs[RateLimitType.HEALTH_CHECK].maxRequests}/min`,
            emotionAnalysis: `${rateLimitConfigs[RateLimitType.EMOTION_ANALYSIS].maxRequests}/min`,
            apiGeneral: `${rateLimitConfigs[RateLimitType.API_GENERAL].maxRequests}/15min`,
            admin: `${rateLimitConfigs[RateLimitType.ADMIN].maxRequests}/min`,
            documentation: `${rateLimitConfigs[RateLimitType.DOCUMENTATION].maxRequests}/min`
        });
    }
}
