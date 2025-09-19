/**
 * GENESIS LUMINAL - LOAD TEST PROCESSOR
 * Processador customizado para métricas de carga
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

module.exports = {
  // Função executada antes de cada cenário
  beforeScenario: (userContext, events, done) => {
    userContext.vars.startTime = Date.now();
    return done();
  },

  // Função executada após cada resposta
  afterResponse: (requestParams, response, context, events, done) => {
    // Métricas customizadas
    if (response.body) {
      try {
        const body = JSON.parse(response.body);
        
        // Medir latência de processamento emocional
        if (body.processingTime) {
          events.emit('customStat', 'emotional_processing_time', body.processingTime);
        }
        
        // Contar tipos de resposta emocional
        if (body.emotionalProfile && body.emotionalProfile.dominant) {
          events.emit('customStat', 'emotion_' + body.emotionalProfile.dominant, 1);
        }
        
      } catch (e) {
        // Ignorar erros de parsing
      }
    }
    
    return done();
  },

  // Validação customizada de resposta
  validateResponse: (response, context, events, done) => {
    // Verificar se resposta tem estrutura esperada
    if (response.statusCode === 200) {
      try {
        const body = JSON.parse(response.body);
        
        // Para endpoint de análise emocional
        if (response.request.uri.pathname.includes('/analyze')) {
          if (!body.emotionalProfile || !body.emotionalProfile.dominant) {
            events.emit('customStat', 'validation_error', 1);
          } else {
            events.emit('customStat', 'validation_success', 1);
          }
        }
        
      } catch (e) {
        events.emit('customStat', 'parse_error', 1);
      }
    }
    
    return done();
  }
};
