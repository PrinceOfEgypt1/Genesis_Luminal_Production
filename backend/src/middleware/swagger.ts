/**
 * @fileoverview Swagger UI Middleware - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi';

/**
 * Configuração customizada do Swagger UI
 */
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb }
    .swagger-ui .info .description p { font-size: 14px }
    .swagger-ui .scheme-container { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0 }
  `,
  customSiteTitle: 'Genesis Luminal API Documentation',
  customfavIcon: '/favicon.ico'
};

/**
 * Configura Swagger UI no Express app
 */
export function setupSwagger(app: any): void {
  // Endpoint da especificação OpenAPI
  app.get('/api/docs/openapi.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });
  
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(openApiSpec, swaggerOptions));
  
  // Redirect para docs
  app.get('/docs', (req: any, res: any) => {
    res.redirect('/api/docs');
  });
  
  console.log('✅ Swagger UI configurado em http://localhost:3001/api/docs');
}
