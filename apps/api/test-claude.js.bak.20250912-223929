/**
 * Teste direto da API Claude
 * Execute: node test-claude.js
 */

require('dotenv').config();

async function testClaude() {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

  console.log('🧪 TESTE CLAUDE API');
  console.log('==================');
  console.log('API Key configurada:', CLAUDE_API_KEY ? '✅ SIM (primeira parte: ' + CLAUDE_API_KEY.substring(0, 10) + '...)' : '❌ NÃO');
  console.log('URL da API:', CLAUDE_API_URL);
  console.log('');

  if (!CLAUDE_API_KEY) {
    console.log('❌ ERRO: CLAUDE_API_KEY não está configurada no arquivo .env');
    console.log('');
    console.log('📋 Para corrigir:');
    console.log('1. Copie o arquivo .env.example para .env');
    console.log('2. Adicione sua chave Claude API no .env');
    console.log('   CLAUDE_API_KEY=sk-ant-api03-...');
    return;
  }

  console.log('🔄 Testando comunicação com Claude API...');

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Responda apenas "OK TESTE" se você está funcionando.'
          }
        ]
      })
    });

    console.log('📊 Status da resposta:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCESSO! Claude API está funcionando');
      console.log('📝 Resposta:', data.content?.[0]?.text || 'Resposta recebida');
      console.log('');
      console.log('🎉 Configuração perfeita! A aplicação pode se comunicar com Claude.');
    } else {
      const errorData = await response.text();
      console.log('❌ ERRO na API Claude:');
      console.log('Status:', response.status);
      console.log('Erro:', errorData);
      
      if (response.status === 401) {
        console.log('');
        console.log('🔑 Possível problema: API Key inválida ou expirada');
        console.log('Verifique se a chave está correta no arquivo .env');
      }
    }
  } catch (error) {
    console.log('❌ ERRO na conexão:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('');
      console.log('🌐 Possível problema de conectividade');
      console.log('Verifique sua conexão com a internet');
    }
  }
}

testClaude();