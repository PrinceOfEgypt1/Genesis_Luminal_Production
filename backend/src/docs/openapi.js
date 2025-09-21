/**
 * @fileoverview OpenAPI 3.0 Specification - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */
export const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Genesis Luminal API',
        version: '1.0.0',
        description: `
# Genesis Luminal - Emotion Analysis API

API para análise de emoções em texto usando tecnologias de IA.

## ⚠️ IMPORTANTE - DISCLAIMER DE DESENVOLVIMENTO

**🔴 SISTEMA EM DESENVOLVIMENTO - CONTÉM SIMULAÇÕES**

- Análise de emoções está em **modo simulação**
- Resultados baseados em heurísticas simples
- **NÃO usar em ambiente de produção**
- Apenas para fins de demonstração e desenvolvimento

## Funcionalidades

### ✅ Implementadas
- API REST completa
- Validação de entrada
- Tratamento de erros
- Documentação OpenAPI
- Testes automatizados

### 🔴 Simuladas  
- Análise de emoções (Anthropic Provider)
- Machine Learning (usa heurísticas)

### 🟡 Planejadas
- Autenticação JWT
- Histórico de análises
- WebSocket real-time
- Cache Redis

## Transparência Técnica

Este sistema implementa transparência total sobre suas capacidades:
- Headers \`X-Genesis-*\` em todas as respostas
- Metadados de simulação incluídos
- Endpoint \`/api/disclaimer\` com detalhes completos
- Classificação clara: [IMPLEMENTED/SIMULATION/PLANNED]
    `,
        contact: {
            name: 'Genesis Luminal Team',
            url: 'https://github.com/PrinceOfEgypt1/Genesis_Luminal_Production',
            email: 'dev@genesis-luminal.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Development server'
        },
        {
            url: 'https://api.genesis-luminal.dev',
            description: 'Staging server'
        },
        {
            url: 'https://api.genesis-luminal.com',
            description: 'Production server'
        }
    ],
    paths: {
        '/api/analyze': {
            post: {
                summary: '🔴 [SIMULATION] Analisar emoção em texto',
                description: `
Analisa as emoções presentes em um texto fornecido.

**⚠️ IMPORTANTE: Esta funcionalidade está em MODO SIMULAÇÃO**

- Não usa API real do Anthropic
- Baseado em heurísticas simples
- Precisão limitada (~60% em textos simples)
- Apenas para demonstração

### Como funciona (simulação):
1. Analisa palavras-chave predefinidas
2. Conta exclamações e letras maiúsculas
3. Aplica heurísticas de intensidade
4. Retorna resultado simulado

### Para implementação real:
- Configurar \`ANTHROPIC_API_KEY\` válida
- Definir \`FORCE_REAL_ANTHROPIC=true\`
- Implementar tratamento de erros robusto
        `,
                tags: ['Emotion Analysis'],
                operationId: 'analyzeEmotion',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/EmotionAnalysisRequest'
                            },
                            examples: {
                                happy: {
                                    summary: 'Texto feliz',
                                    value: {
                                        text: 'I am absolutely thrilled about this amazing opportunity!',
                                        userId: 'user-123'
                                    }
                                },
                                sad: {
                                    summary: 'Texto triste',
                                    value: {
                                        text: 'This is the worst day of my life.',
                                        userId: 'user-456'
                                    }
                                },
                                neutral: {
                                    summary: 'Texto neutro',
                                    value: {
                                        text: 'The meeting is scheduled for 3 PM.',
                                        userId: 'user-789'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Análise de emoção realizada com sucesso',
                        headers: {
                            'X-Genesis-Mode': {
                                description: 'Modo de operação (DEVELOPMENT/PRODUCTION)',
                                schema: { type: 'string' }
                            },
                            'X-Genesis-Simulation': {
                                description: 'Indica se contém simulações (ACTIVE/NONE)',
                                schema: { type: 'string' }
                            }
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/EmotionAnalysisResult' },
                                        { $ref: '#/components/schemas/DisclaimerWrapper' }
                                    ]
                                },
                                examples: {
                                    joyResult: {
                                        summary: 'Resultado de alegria',
                                        value: {
                                            intensity: 0.85,
                                            dominantAffect: 'joy',
                                            confidence: 0.92,
                                            timestamp: '2024-01-15T10:30:00Z',
                                            metadata: {
                                                model: 'simulation-heuristic-v1',
                                                processingTime: 150,
                                                isSimulated: true,
                                                simulationNote: 'Resultado baseado em heurísticas simples'
                                            },
                                            _disclaimer: {
                                                environment: 'DEVELOPMENT',
                                                warning: 'Este sistema contém funcionalidades simuladas'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Erro de validação na entrada',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    },
                    '500': {
                        description: 'Erro interno do servidor',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    },
                    '429': {
                        description: 'Rate limit excedido',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/health': {
            get: {
                summary: '✅ [IMPLEMENTED] Verificar saúde do sistema',
                description: 'Endpoint para verificação de saúde e status do sistema.',
                tags: ['System'],
                operationId: 'healthCheck',
                responses: {
                    '200': {
                        description: 'Sistema funcionando normalmente',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/HealthResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/disclaimer': {
            get: {
                summary: '📋 [IMPLEMENTED] Disclaimer e transparência',
                description: 'Retorna informações completas sobre simulações e limitações do sistema.',
                tags: ['System'],
                operationId: 'getDisclaimer',
                responses: {
                    '200': {
                        description: 'Disclaimer e informações de transparência',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/DisclaimerResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/system/honesty-report': {
            get: {
                summary: '📊 [IMPLEMENTED] Relatório de honestidade técnica',
                description: 'Retorna relatório detalhado sobre o status real de todas as funcionalidades.',
                tags: ['System'],
                operationId: 'getHonestyReport',
                responses: {
                    '200': {
                        description: 'Relatório de honestidade técnica',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/HonestyReportResponse'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            EmotionAnalysisRequest: {
                type: 'object',
                required: ['text', 'userId'],
                properties: {
                    text: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 10000,
                        description: 'Texto para análise de emoção',
                        example: 'I am feeling great today!'
                    },
                    userId: {
                        type: 'string',
                        pattern: '^[a-zA-Z0-9_-]+$',
                        minLength: 3,
                        maxLength: 50,
                        description: 'Identificador único do usuário',
                        example: 'user-123'
                    }
                }
            },
            EmotionAnalysisResult: {
                type: 'object',
                properties: {
                    intensity: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Intensidade da emoção (0-1)',
                        example: 0.85
                    },
                    dominantAffect: {
                        type: 'string',
                        enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'],
                        description: 'Emoção dominante detectada',
                        example: 'joy'
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Confiança na análise (0-1)',
                        example: 0.92
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp da análise',
                        example: '2024-01-15T10:30:00Z'
                    },
                    metadata: {
                        type: 'object',
                        properties: {
                            model: {
                                type: 'string',
                                description: 'Modelo usado para análise',
                                example: 'simulation-heuristic-v1'
                            },
                            processingTime: {
                                type: 'number',
                                description: 'Tempo de processamento em ms',
                                example: 150
                            },
                            isSimulated: {
                                type: 'boolean',
                                description: 'Indica se o resultado é simulado',
                                example: true
                            },
                            simulationNote: {
                                type: 'string',
                                description: 'Nota sobre a simulação',
                                example: 'Resultado baseado em heurísticas simples'
                            }
                        }
                    }
                }
            },
            DisclaimerWrapper: {
                type: 'object',
                properties: {
                    _disclaimer: {
                        type: 'object',
                        properties: {
                            environment: {
                                type: 'string',
                                example: 'DEVELOPMENT'
                            },
                            simulatedFeatures: {
                                type: 'number',
                                example: 1
                            },
                            implementedFeatures: {
                                type: 'number',
                                example: 4
                            },
                            honestyScore: {
                                type: 'number',
                                example: 75
                            },
                            warning: {
                                type: 'string',
                                example: 'Este sistema contém funcionalidades simuladas'
                            }
                        }
                    }
                }
            },
            HealthResponse: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'ok'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    },
                    service: {
                        type: 'string',
                        example: 'emotion-analysis'
                    },
                    version: {
                        type: 'string',
                        example: '1.0.0'
                    }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Mensagem de erro',
                        example: 'Validation failed: text is required'
                    },
                    code: {
                        type: 'string',
                        description: 'Código do erro',
                        example: 'VALIDATION_ERROR'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            }
        },
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key',
                description: '🟡 [PLANNED] Autenticação via API Key (não implementada)'
            },
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: '🟡 [PLANNED] Autenticação JWT (não implementada)'
            }
        }
    },
    tags: [
        {
            name: 'Emotion Analysis',
            description: '🔴 [SIMULATION] Endpoints para análise de emoções (simulado)'
        },
        {
            name: 'System',
            description: '✅ [IMPLEMENTED] Endpoints do sistema e monitoramento'
        }
    ]
};
