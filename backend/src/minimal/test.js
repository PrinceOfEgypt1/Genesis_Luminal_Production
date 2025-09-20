/**
 * Teste básico do sistema mínimo
 */
const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('Iniciando testes do sistema mínimo...');
  
  try {
    // Teste 1: Health check
    const health = await testEndpoint('/health');
    console.log('✅ Health check:', health.status === 200 ? 'OK' : 'FALHOU');
    
    // Teste 2: API Health
    const apiHealth = await testEndpoint('/api/health');
    console.log('✅ API Health:', apiHealth.status === 200 ? 'OK' : 'FALHOU');
    
    // Teste 3: Análise emocional
    const analysis = await testEndpoint('/api/emotional/analyze', 'POST', {
      text: 'I am feeling wonderful today!'
    });
    console.log('✅ Análise emocional:', analysis.status === 200 ? 'OK' : 'FALHOU');
    
    // Teste 4: Erro esperado
    const error = await testEndpoint('/api/emotional/analyze', 'POST', {});
    console.log('✅ Validação de erro:', error.status === 400 ? 'OK' : 'FALHOU');
    
    console.log('🎉 Todos os testes básicos executados');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

runTests();
