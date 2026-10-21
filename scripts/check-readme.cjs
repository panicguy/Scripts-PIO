// Validação automática da identidade visual oficial de Scripts-PIO.
// Execute com: node scripts/check-readme.cjs
const fs = require('node:fs');
const readme = fs.readFileSync('README.md', 'utf8');
const autodex = fs.readFileSync('autodex.user.js', 'utf8');

const mustInclude = [
  '<img src="assets/pio-scripts-logo.png" alt="PIO Scripts by KimJongDudu" width="900">',
  '## O que cada script faz',
  '## 📖 AutoDex',
  '## 🎯 Auto-Sniper',
  '## Como instalar',
  '## Testes e limitações',
  '## Encontrou um problema?',
  '## Créditos',
  'auto-sniper.user.js',
  'autodex.user.js',
  'PIO Scripts by KimJongDudu',
  'https://pokeidle.io/app'
];

const errors = [];
for (const item of mustInclude) {
  if (!readme.includes(item)) errors.push('Elemento visual/documental removido: ' + item);
}

const version = autodex.match(/^\/\/ @version\s+(\S+)/m)?.[1];
if (!version) errors.push('Não foi possível ler @version no AutoDex.');
if (version && !new RegExp('\\| \\[AutoDex\\]\\(autodex\\.user\\.js\\) \\|[^\\n]*\\|\\s*' +
  version.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g, '\\$&') + '\\s*\\|').test(readme)) {
  errors.push('A versão do AutoDex na tabela do README difere de @version: ' + version);
}

if (!fs.existsSync('assets/pio-scripts-logo.png')) {
  errors.push('Banner original ausente: assets/pio-scripts-logo.png');
}

if (errors.length) {
  console.error('❌ README Branding Guard falhou:\n' + errors.map(x => '- ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('✅ Identidade visual preservada. AutoDex ' + version + ' sincronizado com README.');
}
