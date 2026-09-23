// project/package/scripts/smoke-injected-styles.mjs
//
// Guarda de regressão do CSS injetado pelos componentes (keyframes etc.):
// compara os <style> coletados de dist/index.js com o golden versionado em
// scripts/fixtures/injected-styles.json. Qualquer mudança no CSS ou nos ids
// de guarda precisa atualizar o golden de propósito:
//   node scripts/smoke-injected-styles.mjs --update
import { readFileSync, writeFileSync } from 'node:fs';
import { collectInjectedStyles } from './lib/injected-styles.mjs';

const goldenUrl = new URL('./fixtures/injected-styles.json', import.meta.url);
const atual = await collectInjectedStyles(new URL('../dist/index.js', import.meta.url));

if (process.argv.includes('--update')) {
  writeFileSync(goldenUrl, JSON.stringify(atual, null, 2) + '\n');
  console.log(`golden atualizado: ${Object.keys(atual).length} estilos`);
  process.exit(0);
}

const golden = JSON.parse(readFileSync(goldenUrl, 'utf8'));
let diffs = 0;
for (const id of [...new Set([...Object.keys(golden), ...Object.keys(atual)])].sort()) {
  if (golden[id] === undefined) {
    console.error(`FAIL: estilo novo não registrado no golden: ${id}`);
    diffs++;
  } else if (atual[id] === undefined) {
    console.error(`FAIL: estilo sumiu: ${id}`);
    diffs++;
  } else if (golden[id] !== atual[id]) {
    console.error(`FAIL: CSS diferente para ${id}\n  golden: ${golden[id]}\n  atual:  ${atual[id]}`);
    diffs++;
  }
}
if (diffs) process.exit(1);
console.log(`OK: ${Object.keys(atual).length} estilos injetados idênticos ao golden`);
