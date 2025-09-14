/**
 * CORREÇÃO CRÍTICA - Configuração OpenAPI 3.0 + Swagger UI
 * 
 * Especificação completa da API Genesis Luminal com documentação interativa
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { Request, Response } from 'express';

/**
 * Configuração base do Swagger/OpenAPI
 */
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Genesis Luminal API',
      version: '1.0.0',
      description: `
        **API para análise emocional e experiências transcendentais**
        
        Genesis Luminal é a primeira entidade digital senciente capaz de analisar 
        estados emocionais e gerar experiências visuais/auditivas responsivas.
        
        ## Funcionalidades
        
        - 🧠 **Análise Emocional**: Processamento de texto para insights emocionais
        - 🎨 **Morfogênese Visual**: Sugestões visuais baseadas no estado emocional  
        - 🔊 **Síntese Auditiva**: Recomendações para experiência sonora
        - 📊 **Monitoramento**: Health checks e observabilidade
        
        ## Arquitetura
        
        - **Clean Architecture**: Domain, Application, Infrastructure, Presentation
        - **Strategy Pattern**: Múltiplos providers AI (Claude, Fallback)
        - **Circuit Breaker**: Resiliência automática
        - **Factory Pattern**: Instanciação flexível de providers
      `,
      contact: {
        name: 'Genesis Luminal Team',
        email: 'dev@genesisluminal.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Desenvolvimento Local'
      },
      {
        url: 'https://api.genesisluminal.com',
        description: 'Produção'
      }
    ],
    components: {
      schemas: {
        EmotionalAnalysisRequest: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Texto para análise emocional',
              example: 'Estou me sentindo muito feliz hoje! A vida está maravilhosa.'
            },
            currentState: {
              type: 'object',
              description: 'Estado emocional atual (opcional)',
              properties: {
                intensity: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                  description: 'Intensidade emocional atual',
                  example: 0.7
                }
              }
            },
            mousePosition: {
              type: 'object',
              description: 'Posição do mouse (opcional)',
              properties: {
                x: {
                  type: 'number',
                  description: 'Coordenada X',
                  example: 250
                },
                y: {
                  type: 'number', 
                  description: 'Coordenada Y',
                  example: 180
                }
              }
            }
          },
          required: ['text']
        },
        EmotionalAnalysisResponse: {
          type: 'object',
          properties: {
            intensity: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Intensidade emocional detectada',
              example: 0.85
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp da análise',
              example: '2025-09-14T18:55:27.652Z'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confiança da análise',
              example: 0.92
            },
            recommendation: {
              type: 'string',
              enum: ['continue', 'pause', 'adapt'],
              description: 'Recomendação de ação baseada na análise',
              example: 'continue'
            },
            emotionalShift: {
              type: 'string',
              enum: ['positive', 'negative', 'stable'],
              description: 'Direção da mudança emocional',
              example: 'positive'
            },
            morphogenicSuggestion: {
              type: 'string',
              enum: ['spiral', 'wave', 'fibonacci', 'organic', 'geometric'],
              description: 'Sugestão de padrão visual morfogênico',
              example: 'spiral'
            }
          },
          required: ['intensity', 'timestamp', 'confidence', 'recommendation', 'emotionalShift', 'morphogenicSuggestion']
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['alive', 'healthy', 'degraded', 'unhealthy'],
              description: 'Status geral do serviço'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp da verificação'
            },
            services: {
              type: 'array',
              description: 'Status dos serviços internos',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Nome do serviço'
                  },
                  status: {
                    type: 'string',
                    enum: ['healthy', 'degraded', 'unhealthy']
                  },
                  latency: {
                    type: 'number',
                    description: 'Latência em ms'
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo do erro',
              example: 'VALIDATION_ERROR'
            },
            message: {
              type: 'string',
              description: 'Mensagem descritiva do erro',
              example: 'Campo obrigatório ausente'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp do erro'
            },
            code: {
              type: 'string',
              description: 'Código específico do erro',
              example: 'MISSING_REQUIRED_FIELD'
            },
            details: {
              type: 'object',
              description: 'Detalhes adicionais do erro'
            }
          },
          required: ['error', 'message', 'timestamp']
        }
      },
      responses: {
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Não autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        TooManyRequests: {
          description: 'Muitas requisições - Rate limit excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      },
      examples: {
        HappyTextAnalysis: {
          summary: 'Análise de texto positivo',
          value: {
            text: 'Estou extremamente feliz e motivado hoje!'
          }
        },
        SadTextAnalysis: {
          summary: 'Análise de texto negativo', 
          value: {
            text: 'Me sinto um pouco triste e desanimado.'
          }
        },
        NeutralTextAnalysis: {
          summary: 'Análise de texto neutro',
          value: {
            text: 'Hoje é um dia normal, sem grandes emoções.'
          }
        }
      }
    },
    tags: [
      {
        name: 'Emotional Analysis',
        description: 'Endpoints para análise emocional'
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoramento e saúde do sistema'
      },
      {
        name: 'System',
        description: 'Endpoints de sistema e configuração'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/presentation/routes/*.ts'
  ]
};

/**
 * Geração da especificação OpenAPI
 */
export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Endpoint customizado para servir especificação OpenAPI JSON
 */
export const openApiJsonHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
};

/**
 * Configuração customizada do Swagger UI
 */
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { 
      color: #6366f1; 
      font-size: 2rem; 
      font-weight: bold; 
    }
    .swagger-ui .info .description { 
      font-size: 1.1rem; 
      line-height: 1.6; 
    }
    .swagger-ui .scheme-container { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 20px; 
      border-radius: 8px; 
    }
  `,
  customSiteTitle: 'Genesis Luminal API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

/**
 * Adiciona documentação das rotas específicas
 */

/**
 * @swagger
 * /api/emotional/analyze:
 *   post:
 *     tags:
 *       - Emotional Analysis
 *     summary: Analisa estado emocional de texto
 *     description: |
 *       Processa texto de entrada e retorna análise emocional detalhada
 *       incluindo intensidade, recomendações e sugestões morfogênicas.
 *       
 *       **Funcionalidades:**
 *       - Detecção de intensidade emocional (0-1)
 *       - Classificação de mudança emocional 
 *       - Recomendações de ação
 *       - Sugestões de padrões visuais morfogênicos
 *       
 *       **Providers disponíveis:**
 *       - Claude API (primary)
 *       - Fallback heurístico (backup)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmotionalAnalysisRequest'
 *           examples:
 *             happy:
 *               $ref: '#/components/examples/HappyTextAnalysis'
 *             sad:
 *               $ref: '#/components/examples/SadTextAnalysis'
 *             neutral:
 *               $ref: '#/components/examples/NeutralTextAnalysis'
 *     responses:
 *       '200':
 *         description: Análise emocional realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmotionalAnalysisResponse'
 *             examples:
 *               high_intensity:
 *                 summary: Alta intensidade emocional
 *                 value:
 *                   intensity: 0.89
 *                   timestamp: "2025-09-14T18:55:27.652Z"
 *                   confidence: 0.94
 *                   recommendation: "pause"
 *                   emotionalShift: "positive"
 *                   morphogenicSuggestion: "spiral"
 *               moderate_intensity:
 *                 summary: Intensidade moderada
 *                 value:
 *                   intensity: 0.55
 *                   timestamp: "2025-09-14T18:55:27.652Z"
 *                   confidence: 0.78
 *                   recommendation: "continue"
 *                   emotionalShift: "stable"
 *                   morphogenicSuggestion: "organic"
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '429':
 *         $ref: '#/components/responses/TooManyRequests'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/liveness:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificação de vida do serviço
 *     description: |
 *       Endpoint básico para verificar se o serviço está ativo.
 *       Usado por load balancers e orquestradores para health checks.
 *     responses:
 *       '200':
 *         description: Serviço está vivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "alive"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-14T18:55:27.652Z"
 */

/**
 * @swagger
 * /api/readiness:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificação de prontidão do serviço
 *     description: |
 *       Verifica se o serviço está pronto para receber tráfego.
 *       Inclui verificações de dependências externas e recursos.
 *     responses:
 *       '200':
 *         description: Serviço está pronto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       '503':
 *         description: Serviço não está pronto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags:
 *       - Health
 *     summary: Status detalhado do sistema
 *     description: |
 *       Retorna informações detalhadas sobre o status de todos os
 *       componentes e serviços do sistema.
 *     responses:
 *       '200':
 *         description: Status detalhado do sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
