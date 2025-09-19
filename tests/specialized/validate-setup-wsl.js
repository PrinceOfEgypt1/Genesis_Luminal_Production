/**
 * GENESIS LUMINAL - VALIDADOR WSL
 * Validação específica para ambiente WSL/Ubuntu
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 VALIDANDO SETUP PARA WSL/UBUNTU...\n');

// 1. Verificar estrutura correta
console.log('📁 Verificando estrutura monorepo:');
const expectedDirs = ['frontend', 'backend', 'shared'];
let structureOk = true;

expectedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - AUSENTE`);
    structureOk = false;
  }
});

// 2. Verificar package.json workspaces
console.log('\n🔧 Verificando workspaces:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const workspaces = pkg.workspaces || [];
  
  if (workspaces.includes('frontend') && workspaces.includes('backend')) {
    console.log('✅ Workspaces configurados corretamente');
  } else {
    console.log('❌ Workspaces incorretos:', workspaces);
    structureOk = false;
  }
} catch (e) {
  console.log('❌ Erro ao ler package.json');
  structureOk = false;
}

// 3. Verificar comandos WSL
console.log('\n💻 Verificando ambiente WSL:');
const commands = [
  { cmd: 'node --version', name: 'Node.js' },
  { cmd: 'npm --version', name: 'npm' },
  { cmd: 'npx playwright --version', name: 'Playwright' }
];

let envOk = true;
commands.forEach(({ cmd, name }) => {
  try {
    const version = execSync(cmd, { encoding: 'utf8' }).trim();
    console.log(`✅ ${name}: ${version}`);
  } catch (e) {
    console.log(`❌ ${name}: NÃO DISPONÍVEL`);
    envOk = false;
  }
});

// 4. Verificar scripts WSL
console.log('\n🚀 Verificando scripts WSL:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts || {};
  
  const wslScripts = [
    'test:specialized:wsl',
    'test:accessibility:wsl',
    'test:performance:wsl',
    'test:load:wsl',
    'test:security:wsl'
  ];
  
  let scriptsOk = true;
  wslScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} - AUSENTE`);
      scriptsOk = false;
    }
  });
  
  // 5. Testar conectividade (se apps estiverem rodando)
  console.log('\n🌐 Testando conectividade (opcional):');
  try {
    execSync('curl -s http://localhost:5173 > /dev/null', { timeout: 2000 });
    console.log('✅ Frontend (5173) - RESPONDENDO');
  } catch (e) {
    console.log('⚠️ Frontend (5173) - NÃO RESPONDENDO (rode: cd frontend && npm run dev)');
  }
  
  try {
    execSync('curl -s http://localhost:3001/health > /dev/null', { timeout: 2000 });
    console.log('✅ Backend (3001) - RESPONDENDO');
  } catch (e) {
    console.log('⚠️ Backend (3001) - NÃO RESPONDENDO (rode: cd backend && npm run dev)');
  }
  
  // 6. Resultado final
  console.log('\n🎯 RESULTADO DA VALIDAÇÃO WSL:');
  if (structureOk && envOk && scriptsOk) {
    console.log('✅ SETUP WSL COMPLETO - Pronto para testes especializados!');
    console.log('\n🚀 Para executar:');
    console.log('   npm run test:specialized:wsl');
    console.log('   npm run security:analyze');
    console.log('   npm run open:report:wsl');
    process.exit(0);
  } else {
    console.log('❌ SETUP INCOMPLETO - Corrija os problemas acima');
    console.log('\n📚 Consulte: tests/specialized/WSL_EXECUTION_GUIDE.md');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Erro na validação:', error.message);
  process.exit(1);
}
