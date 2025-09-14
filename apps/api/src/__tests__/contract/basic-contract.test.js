/**
 * Testes básicos de contrato - SEM dependências externas
 */

const http = require('http');
const { URL } = require('url');

// Função helper para fazer requests HTTP simples
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Testes básicos
async function runBasicTests() {
  console.log('🧪 Executando testes básicos de contrato...');
  
  const baseUrl = 'http://localhost:3001/api';
  let passed = 0;
  let failed = 0;

  // Teste 1: Liveness
  try {
    console.log('📝 Testando /liveness...');
    const result = await makeRequest(`${baseUrl}/liveness`);
    if (result.status === 200 && result.data.status === 'alive') {
      console.log('✅ Liveness: PASSOU');
      passed++;
    } else {
      console.log('❌ Liveness: FALHOU');
      failed++;
    }
  } catch (error) {
    console.log('❌ Liveness: ERRO -', error.message);
    failed++;
  }

  // Teste 2: Readiness
  try {
    console.log('📝 Testando /readiness...');
    const result = await makeRequest(`${baseUrl}/readiness`);
    if (result.status === 200 && typeof result.data.ready === 'boolean') {
      console.log('✅ Readiness: PASSOU');
      passed++;
    } else {
      console.log('❌ Readiness: FALHOU');
      failed++;
    }
  } catch (error) {
    console.log('❌ Readiness: ERRO -', error.message);
    failed++;
  }

  // Teste 3: Status
  try {
    console.log('📝 Testando /status...');
    const result = await makeRequest(`${baseUrl}/status`);
    if (result.status === 200 && result.data.status) {
      console.log('✅ Status: PASSOU');
      passed++;
    } else {
      console.log('❌ Status: FALHOU');
      failed++;
    }
  } catch (error) {
    console.log('❌ Status: ERRO -', error.message);
    failed++;
  }

  // Teste 4: Emotional Analysis
  try {
    console.log('📝 Testando /emotional/analyze...');
    const result = await makeRequest(
      `${baseUrl}/emotional/analyze`, 
      'POST', 
      { text: 'Teste básico' }
    );
    if (result.status === 200 && result.data.intensity !== undefined) {
      console.log('✅ Emotional Analysis: PASSOU');
      passed++;
    } else {
      console.log('❌ Emotional Analysis: FALHOU');
      failed++;
    }
  } catch (error) {
    console.log('❌ Emotional Analysis: ERRO -', error.message);
    failed++;
  }

  console.log(`\n📊 Resultados: ${passed} passou / ${failed} falhou`);
  return { passed, failed };
}

// Executar se chamado diretamente
if (require.main === module) {
  runBasicTests().catch(console.error);
}

module.exports = { runBasicTests };
