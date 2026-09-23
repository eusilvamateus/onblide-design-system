// project/package/scripts/smoke-injected-styles.mjs
//
// Guarda de regressão do CSS injetado pelos componentes (keyframes etc.):
// compara a SEQUÊNCIA de <style> coletada de dist/index.js (ordem, id e CSS,
// posição a posição) com o golden versionado em scripts/fixtures/injected-styles.json,
// e falha se algum id for injetado mais de uma vez. Qualquer mudança no CSS, nos
// ids de guarda ou na ordem de inserção precisa atualizar o golden de propósito:
//   node scripts/smoke-injected-styles.mjs --update
import { readFileSync, writeFileSync } from 'node:fs';
import { collectInjectedStyles } from './lib/injected-styles.mjs';

const goldenUrl = new URL('./fixtures/injected-styles.json', import.meta.url);
const atual = await collectInjectedStyles(new URL('../dist/index.js', import.meta.url));

if (process.argv.includes('--update')) {
  writeFileSync(goldenUrl, JSON.stringify(atual, null, 2) + '\n');
  console.log(`golden atualizado: ${atual.length} estilos`);
  process.exit(0);
}

const golden = JSON.parse(readFileSync(goldenUrl, 'utf8'));
// Guardas contra verde falso: golden no formato antigo (objeto) ou coleta vazia.
if (!Array.isArray(golden)) {
  console.error('FAIL: o golden não é um array [{ id, css }] (formato antigo?); rode --update de propósito');
  process.exit(1);
}
if (atual.length === 0) {
  console.error('FAIL: nenhum <style> coletado de dist/index.js (build faltando ou quebrado?)');
  process.exit(1);
}
let diffs = 0;

// 1) Nenhum id injetado mais de uma vez.
const vistos = new Set();
for (const { id } of atual) {
  if (vistos.has(id)) {
    console.error(`FAIL: injeção duplicada do id ${id}`);
    diffs++;
  }
  vistos.add(id);
}

// 2) Mesma sequência: ordem, id e CSS, posição a posição.
const total = Math.max(golden.length, atual.length);
for (let i = 0; i < total; i++) {
  const g = golden[i];
  const a = atual[i];
  if (!g) {
    console.error(`FAIL: estilo extra na posição ${i}: ${a.id}`);
    diffs++;
  } else if (!a) {
    console.error(`FAIL: estilo sumiu da posição ${i}: ${g.id}`);
    diffs++;
  } else if (g.id !== a.id) {
    console.error(`FAIL: ordem/id diferente na posição ${i}: golden ${g.id}, atual ${a.id}`);
    diffs++;
  } else if (g.css !== a.css) {
    console.error(`FAIL: CSS diferente para ${g.id}\n  golden: ${g.css}\n  atual:  ${a.css}`);
    diffs++;
  }
}
if (diffs) process.exit(1);
console.log(`OK: ${atual.length} estilos injetados idênticos ao golden (ordem, ids e CSS)`);
