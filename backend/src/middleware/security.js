/**
 * @fileoverview Security Middleware - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 *
 * Headers de segurança OWASP compliant
 */
import helmet from 'helmet';
/**
 * Configuração Helmet.js enterprise
 */
export const securityHeaders = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Necessário para Tailwind CSS
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            scriptSrc: [
                "'self'",
                // Adicionar domínios de analytics se necessário
            ],
            imgSrc: [
                "'self'",
                "data:", // Para imagens base64
                "https:"
            ],
            connectSrc: [
                "'self'",
                "https://api.anthropic.com", // Para API real
                "ws://localhost:*", // WebSocket dev
                "wss://*" // WebSocket prod
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            workerSrc: ["'self'"],
            childSrc: ["'none'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"]
        },
        reportOnly: process.env.NODE_ENV === 'development'
    },
    // Clickjacking protection
    frameguard: {
        action: 'deny'
    },
    // MIME type sniffing protection
    noSniff: true,
    // XSS protection
    xssFilter: true,
    // Referrer policy
    referrerPolicy: {
        policy: ['strict-origin-when-cross-origin']
    },
    // HTTPS enforcement (apenas em produção)
    hsts: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true
    },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // DNS prefetch control
    dnsPrefetchControl: {
        allow: false
    },
    // IE compatibility
    ieNoOpen: true,
    // Permissions Policy (Feature Policy)
    permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        accelerometer: []
    }
});
/**
 * Headers customizados adicionais
 */
export function additionalSecurityHeaders(req, res, next) {
    // Genesis Luminal custom headers
    res.setHeader('X-Genesis-Security', 'enabled');
    res.setHeader('X-Genesis-Version', '1.0.0');
    // Cache control para APIs
    if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    // Rate limiting info headers (serão populados pelo middleware de rate limit)
    res.setHeader('X-RateLimit-Policy', 'genesis-luminal-v1');
    // Security contact
    res.setHeader('Security-Contact', 'security@genesis-luminal.com');
    next();
}
/**
 * Middleware para log de tentativas suspeitas
 */
export function securityAuditMiddleware(req, res, next) {
    // Detectar tentativas de exploração comuns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
        /\.\.\/\.\.\//,
        /etc\/passwd/,
        /proc\/self\/environ/,
        /%2e%2e%2f/i,
        /%252e%252e%252f/i
    ];
    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    // Verificar URL
    const isSuspiciousUrl = suspiciousPatterns.some(pattern => pattern.test(url));
    // Verificar User-Agent suspeito
    const isSuspiciousUserAgent = [
        /sqlmap/i,
        /nikto/i,
        /nessus/i,
        /OpenVAS/i,
        /masscan/i,
        /zap/i
    ].some(pattern => pattern.test(userAgent));
    if (isSuspiciousUrl || isSuspiciousUserAgent) {
        console.warn('🚨 SECURITY: Suspicious request detected', {
            ip: req.ip,
            url,
            userAgent,
            referer,
            timestamp: new Date().toISOString(),
            suspiciousUrl: isSuspiciousUrl,
            suspiciousUserAgent: isSuspiciousUserAgent
        });
        // Log para auditoria
        // TODO: Integrar com sistema de logs centralizados
    }
    next();
}
/**
 * Middleware para proteção de endpoints sensíveis
 */
export function sensitiveEndpointProtection(req, res, next) {
    const sensitiveEndpoints = [
        '/api/admin',
        '/api/config',
        '/api/debug',
        '/api/internal'
    ];
    const isInternal = req.ip === '127.0.0.1' ||
        req.ip === '::1' ||
        req.ip?.startsWith('192.168.') ||
        req.ip?.startsWith('10.') ||
        req.ip?.startsWith('172.');
    if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        if (!isInternal && process.env.NODE_ENV === 'production') {
            console.warn('🚨 SECURITY: External access to sensitive endpoint blocked', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            return res.status(403).json({
                error: 'Access denied',
                code: 'FORBIDDEN_ENDPOINT'
            });
        }
    }
    next();
}
/**
 * Configuração completa de segurança
 */
export function setupSecurity(app) {
    // Headers de segurança principais
    app.use(securityHeaders);
    // Headers customizados
    app.use(additionalSecurityHeaders);
    // Auditoria de segurança
    app.use(securityAuditMiddleware);
    // Proteção de endpoints sensíveis
    app.use(sensitiveEndpointProtection);
    console.log('🛡️ Security headers e middleware configurados');
}
