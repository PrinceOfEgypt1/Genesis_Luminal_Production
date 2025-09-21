import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Genesis Luminal Production API',
            version: '1.0.0',
            description: 'API enterprise para analise emocional'
        },
        servers: [
            { url: 'http://localhost:3001', description: 'Development' }
        ],
        components: {
            schemas: {
                EmotionalAnalysisRequest: {
                    type: 'object',
                    properties: {
                        currentState: { type: 'object' },
                        mousePosition: { type: 'object' },
                        sessionDuration: { type: 'number' }
                    }
                },
                EmotionalAnalysisResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        intensity: { type: 'number' },
                        dominantAffect: { type: 'string' },
                        confidence: { type: 'number' }
                    }
                }
            }
        }
    },
    apis: ['./src/index.ts'] // Corrigido para apontar para index.ts
};
export const specs = swaggerJsdoc(options);
export { swaggerUi };
