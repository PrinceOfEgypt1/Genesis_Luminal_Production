/**
 * Shared API Types - Sistema Mínimo
 * Tipos JavaScript simples para máxima compatibilidade
 */

// Não usar TypeScript por enquanto para evitar problemas de compilação
// Documentação via JSDoc

/**
 * @typedef {Object} EmotionalAnalysisRequest
 * @property {string} text - Texto para análise
 * @property {string} [userId] - ID do usuário (opcional)
 */

/**
 * @typedef {Object} EmotionalAnalysisResponse
 * @property {number} intensity - Intensidade emocional (0-1)
 * @property {string} dominantAffect - Afeto dominante
 * @property {number} confidence - Confiança da análise (0-1)
 * @property {number} processingTime - Tempo de processamento (ms)
 * @property {string} provider - Provider usado
 * @property {string} recommendation - Recomendação
 * @property {string} timestamp - Timestamp ISO
 * @property {string} [userId] - ID do usuário (se fornecido)
 */

/**
 * @typedef {Object} HealthResponse
 * @property {string} status - Status do sistema
 * @property {string} timestamp - Timestamp ISO
 * @property {string} [system] - Nome do sistema
 * @property {string} [version] - Versão do sistema
 * @property {Object} [services] - Status dos serviços
 */

module.exports = {
  // Tipos exportados via JSDoc acima
};
