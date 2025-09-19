/**
 * GENESIS LUMINAL - VALIDADOR DE SETUP
 * Script para validar se todos os testes especializados estão configurados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO SETUP DE TESTES ESPECIALIZADOS...\n');

// 1. Verificar estrutura de diretórios
const requiredDirs = [
  'tests/specialized/accessibility',
  'tests/specialized/performance', 
  'tests/specialized/load',
  'tests/specialized/security'
];

console.log('📁 Verificando estrutura de diretórios:');
let dirsOk = true;
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - AUSENTE`);
    dirsOk = false;
  }
});

// 2. Verificar arquivos de teste
const requiredFiles = [
  'tests/specialized/accessibility/axe-tests.spec.ts',
  'tests/specialized/performance/lighthouse.config.js',
  'tests/specialized/performance/performance-tests.spec.ts',
  'tests/specialized/load/artillery-config.yml',
  'tests/specialized/load/load-tests.spec.ts',
  'tests/specialized/security/security-tests.spec.ts',
  'tests/specialized/specialized-tests.config.ts'
];

console.log('\n📄 Verificando arquivos de teste:');
let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - AUSENTE`);
    filesOk = false;
  }
});

// 3. Verificar dependências no package.json
console.log('\n📦 Verificando dependências:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devDeps = pkg.devDependencies || {};
  
  const requiredDeps = ['@axe-core/playwright', '@lhci/cli', 'artillery'];
  let depsOk = true;
  
  requiredDeps.forEach(dep => {
    if (devDeps[dep]) {
      console.log(`✅ ${dep} - ${devDeps[dep]}`);
    } else {
      console.log(`❌ ${dep} - NÃO INSTALADO`);
      depsOk = false;
    }
  });
  
  // 4. Verificar scripts
  console.log('\n🔧 Verificando scripts npm:');
  const scripts = pkg.scripts || {};
  const requiredScripts = [
    'test:specialized',
    'test:accessibility', 
    'test:performance',
    'test:load',
    'test:security'
  ];
  
  let scriptsOk = true;
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} - AUSENTE`);
      scriptsOk = false;
    }
  });
  
  // 5. Resultado final
  console.log('\n🎯 RESULTADO DA VALIDAÇÃO:');
  if (dirsOk && filesOk && depsOk && scriptsOk) {
    console.log('✅ SETUP COMPLETO - Todos os testes especializados prontos!');
    console.log('\n🚀 Próximos passos:');
    console.log('   npm run test:specialized');
    console.log('   npm run open:report');
    process.exit(0);
  } else {
    console.log('❌ SETUP INCOMPLETO - Corrija os problemas acima');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Erro ao ler package.json:', error.message);
  process.exit(1);
}
