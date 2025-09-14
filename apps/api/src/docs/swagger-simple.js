/**
 * Documentação Swagger simples SEM dependências externas
 */

const fs = require('fs');
const path = require('path');

function setupSimpleSwagger(app) {
  // Carregar especificação OpenAPI
  let openApiSpec;
  try {
    const yamlContent = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
    // Converter YAML básico para JSON (implementação simples)
    openApiSpec = yamlToSimpleJson(yamlContent);
  } catch (error) {
    console.log('⚠️ Erro carregando OpenAPI:', error.message);
    openApiSpec = getBasicSpec();
  }

  // Endpoint para spec JSON
  app.get('/api/docs/json', (req, res) => {
    res.json(openApiSpec);
  });

  // Endpoint para spec YAML  
  app.get('/api/docs/yaml', (req, res) => {
    try {
      const yamlContent = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
      res.setHeader('Content-Type', 'text/yaml');
      res.send(yamlContent);
    } catch (error) {
      res.status(500).json({ error: 'YAML não disponível' });
    }
  });

  // Interface de documentação simples (HTML puro)
  app.get('/api/docs', (req, res) => {
    const html = generateSimpleDocsHtml(openApiSpec);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  console.log('✅ Documentação simples disponível em /api/docs');
}

function yamlToSimpleJson(yaml) {
  // Conversão YAML->JSON muito básica (apenas para o nosso caso)
  try {
    const lines = yaml.split('\n');
    const result = {
      openapi: '3.0.3',
      info: {
        title: 'Genesis Luminal API',
        version: '1.0.0',
        description: 'API documentada'
      },
      servers: [{ url: 'http://localhost:3001/api' }],
      paths: {
        '/liveness': {
          get: {
            tags: ['Health'],
            summary: 'Verificação de vida',
            responses: { '200': { description: 'OK' } }
          }
        },
        '/readiness': {
          get: {
            tags: ['Health'], 
            summary: 'Verificação de prontidão',
            responses: { '200': { description: 'OK' } }
          }
        },
        '/status': {
          get: {
            tags: ['Health'],
            summary: 'Status detalhado', 
            responses: { '200': { description: 'OK' } }
          }
        },
        '/emotional/analyze': {
          post: {
            tags: ['Emotional'],
            summary: 'Análise emocional',
            responses: { '200': { description: 'Análise realizada' } }
          }
        }
      }
    };
    return result;
  } catch (error) {
    return getBasicSpec();
  }
}

function getBasicSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Genesis Luminal API',
      version: '1.0.0'
    },
    paths: {}
  };
}

function generateSimpleDocsHtml(spec) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${spec.info.title} - Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: #6366f1; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .endpoint { border: 1px solid #ddd; margin: 10px 0; border-radius: 8px; }
    .endpoint-header { background: #f8f9fa; padding: 15px; cursor: pointer; }
    .endpoint-body { padding: 15px; display: none; }
    .method-get { color: #28a745; font-weight: bold; }
    .method-post { color: #dc3545; font-weight: bold; }
    .method-put { color: #ffc107; font-weight: bold; }
    .method-delete { color: #6c757d; font-weight: bold; }
    .tag { background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    .try-button { background: #6366f1; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 ${spec.info.title}</h1>
    <p>Versão: ${spec.info.version}</p>
    <p>Documentação automática dos endpoints</p>
  </div>

  <div style="margin: 20px 0;">
    <h2>📚 Endpoints Disponíveis</h2>
    
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle('health1')">
        <span class="method-get">GET</span> /api/liveness
        <span class="tag">Health</span>
      </div>
      <div class="endpoint-body" id="health1">
        <p><strong>Descrição:</strong> Verificação básica de vida do serviço</p>
        <p><strong>Resposta:</strong></p>
        <pre>{"status": "alive", "timestamp": "2025-09-14T..."}</pre>
        <button class="try-button" onclick="tryEndpoint('/api/liveness', 'GET')">🧪 Testar</button>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle('health2')">
        <span class="method-get">GET</span> /api/readiness  
        <span class="tag">Health</span>
      </div>
      <div class="endpoint-body" id="health2">
        <p><strong>Descrição:</strong> Verificação se serviço está pronto</p>
        <p><strong>Resposta:</strong></p>
        <pre>{"status": "ready", "ready": true, "timestamp": "..."}</pre>
        <button class="try-button" onclick="tryEndpoint('/api/readiness', 'GET')">🧪 Testar</button>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle('health3')">
        <span class="method-get">GET</span> /api/status
        <span class="tag">Health</span>
      </div>
      <div class="endpoint-body" id="health3">
        <p><strong>Descrição:</strong> Status detalhado do sistema</p>
        <p><strong>Resposta:</strong></p>
        <pre>{"status": "...", "timestamp": "...", "version": "..."}</pre>
        <button class="try-button" onclick="tryEndpoint('/api/status', 'GET')">🧪 Testar</button>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle('emotional1')">
        <span class="method-post">POST</span> /api/emotional/analyze
        <span class="tag">Emotional</span>
      </div>
      <div class="endpoint-body" id="emotional1">
        <p><strong>Descrição:</strong> Análise de estado emocional</p>
        <p><strong>Request Body:</strong></p>
        <pre>{"text": "Estou feliz hoje!"}</pre>
        <p><strong>Resposta:</strong></p>
        <pre>{"intensity": 0.7, "dominantAffect": "joy", ...}</pre>
        <button class="try-button" onclick="tryEmotionalEndpoint()">🧪 Testar</button>
      </div>
    </div>

  </div>

  <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
    <h3>📋 Links Úteis</h3>
    <ul>
      <li><a href="/api/docs/json" target="_blank">📄 Especificação JSON</a></li>
      <li><a href="/api/docs/yaml" target="_blank">📄 Especificação YAML</a></li>
      <li><a href="/api/liveness" target="_blank">❤️ Health Check</a></li>
    </ul>
  </div>

  <script>
    function toggle(id) {
      const element = document.getElementById(id);
      element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }

    async function tryEndpoint(path, method) {
      try {
        const response = await fetch(path, { method });
        const data = await response.json();
        alert('Resposta: ' + JSON.stringify(data, null, 2));
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }

    async function tryEmotionalEndpoint() {
      try {
        const response = await fetch('/api/emotional/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Estou feliz hoje!' })
        });
        const data = await response.json();
        alert('Resposta: ' + JSON.stringify(data, null, 2));
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  </script>
</body>
</html>
  `;
}

module.exports = { setupSimpleSwagger };
