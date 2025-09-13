/* Teste simples da Anthropic (Claude) */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const model  = process.env.CLAUDE_MODEL  || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';

console.log('🧪 TESTE CLAUDE API');
console.log('==================');
console.log('API Key configurada:', apiKey ? '✅ SIM' : '❌ NÃO');
console.log('URL da API: https://api.anthropic.com/v1/messages');

if (!apiKey) {
  console.error('\n❌ ERRO: Nenhuma CLAUDE_API_KEY/ANTHROPIC_API_KEY encontrada em backend/.env');
  console.error('\n📋 Para corrigir:');
  console.error('1. Edite backend/.env');
  console.error('2. Defina: CLAUDE_API_KEY=sk-ant-... (ou ANTHROPIC_API_KEY)');
  process.exit(1);
}

(async () => {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8,
      messages: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }]
    })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(()=>'');
    console.error('❌ Chamada falhou:', resp.status, resp.statusText, text);
    process.exit(2);
  }
  console.log('✅ Chamada básica OK.');
})();
