// Lê project/package/src/tokens.css e gera src/data/tokens.json (tokens do tema claro e sobrescritas do escuro).
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../../project/package/src/tokens.css', import.meta.url), 'utf8');

const bloco = (inicio) => {
  const i = css.indexOf(inicio);
  if (i < 0) return '';
  let nivel = 0, j = css.indexOf('{', i);
  const ini = j + 1;
  for (; j < css.length; j++) {
    if (css[j] === '{') nivel++;
    else if (css[j] === '}' && --nivel === 0) break;
  }
  return css.slice(ini, j);
};

const extrair = (texto) => {
  const mapa = {};
  for (const m of texto.matchAll(/(--ob-[a-z0-9-]+)\s*:\s*([^;]+);/g)) mapa[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  return mapa;
};

const claro = {};
for (const m of css.matchAll(/:root\s*\{/g)) Object.assign(claro, extrair(bloco(css.slice(m.index))));
const escuro = extrair(bloco('[data-theme="dark"]'));

const tokens = Object.entries(claro).map(([nome, valor]) => ({ nome, valor, escuro: escuro[nome] ?? null }));
fs.mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../src/data/tokens.json', import.meta.url), JSON.stringify(tokens, null, 1));
console.log(`tokens: ${tokens.length} (${Object.keys(escuro).length} com valor no tema escuro)`);
