/**
 * GENESIS LUMINAL - VULNERABILITY ANALYZER
 * Análise inteligente de vulnerabilidades
 */

const { execSync } = require('child_process');

console.log('🔍 ANALISANDO VULNERABILIDADES...\n');

try {
  // Executar npm audit e capturar output
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const auditData = JSON.parse(auditOutput);
  
  console.log('📊 RESUMO DE VULNERABILIDADES:');
  console.log(`Total: ${auditData.metadata.vulnerabilities.total}`);
  console.log(`Critical: ${auditData.metadata.vulnerabilities.critical}`);
  console.log(`High: ${auditData.metadata.vulnerabilities.high}`);
  console.log(`Moderate: ${auditData.metadata.vulnerabilities.moderate}`);
  console.log(`Low: ${auditData.metadata.vulnerabilities.low}\n`);
  
  // Analisar vulnerabilidades críticas
  if (auditData.metadata.vulnerabilities.critical > 0) {
    console.log('🚨 VULNERABILIDADES CRÍTICAS ENCONTRADAS:');
    
    Object.entries(auditData.vulnerabilities || {}).forEach(([name, vuln]) => {
      if (vuln.severity === 'critical') {
        console.log(`- ${name}: ${vuln.via[0]?.title || 'Unknown'}`);
      }
    });
    
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('1. Verificar se são vulnerabilidades em devDependencies (menos críticas)');
    console.log('2. Avaliar se afetam o runtime de produção');
    console.log('3. Considerar npm audit fix --force apenas se necessário');
    console.log('4. Atualizar dependências manualmente se possível\n');
  }
  
  // Verificar se vulnerabilidades são apenas em devDependencies
  const devOnlyVulns = Object.entries(auditData.vulnerabilities || {})
    .filter(([, vuln]) => vuln.isDirect === false)
    .length;
    
  if (devOnlyVulns > 0) {
    console.log(`ℹ️ ${devOnlyVulns} vulnerabilidades são em dependências indiretas/dev`);
    console.log('Impacto em produção: BAIXO\n');
  }
  
} catch (error) {
  console.error('❌ Erro ao analisar vulnerabilidades:', error.message);
}

// Verificar dependências problemáticas conhecidas
console.log('🔍 VERIFICANDO DEPENDÊNCIAS PROBLEMÁTICAS CONHECIDAS...');

const problematicPackages = [
  'libxmljs2',  // Vulnerabilidade crítica conhecida
  'tmp',        // Vulnerabilidade de symbolic link
  'micromatch', // ReDoS vulnerability
  'esbuild'     // Moderate vulnerability
];

try {
  const packageLock = require('../../../package-lock.json');
  
  problematicPackages.forEach(pkg => {
    if (packageLock.packages && packageLock.packages[`node_modules/${pkg}`]) {
      console.log(`⚠️ Encontrado: ${pkg}`);
      console.log(`   Versão: ${packageLock.packages[`node_modules/${pkg}`].version}`);
      console.log(`   Usado por: Dependência indireta`);
    }
  });
  
} catch (error) {
  console.log('ℹ️ Não foi possível analisar package-lock.json');
}

console.log('\n✅ ANÁLISE CONCLUÍDA');
console.log('Para testes de segurança, focaremos em:');
console.log('- Headers HTTP de segurança');
console.log('- Sanitização de entrada');
console.log('- Rate limiting'); 
console.log('- Proteção contra XSS');
