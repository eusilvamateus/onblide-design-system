import React from 'react';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { BREAKPOINTS, BREAKPOINT_ORDER, mediaQuery, useBreakpoint } from '../dist/index.js';

const pacote = join(dirname(fileURLToPath(import.meta.url)), '..');
const projeto = join(pacote, '..');

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};

igual(BREAKPOINTS, { sm: 768, md: 1024, lg: 1280, xl: 1440 }, 'escala de BREAKPOINTS');
igual(BREAKPOINT_ORDER, ['base', 'sm', 'md', 'lg', 'xl'], 'ordem das faixas');
igual(mediaQuery('md'), '(min-width: 1024px)', 'mediaQuery deveria ser mobile-first');

const tokens = readFileSync(join(pacote, 'src', 'tokens.css'), 'utf8');
const doCss = Object.fromEntries([...tokens.matchAll(/--ob-bp-([a-z0-9]+):\s*(\d+)px/g)].map((m) => [m[1], Number(m[2])]));
igual(doCss, BREAKPOINTS, '--ob-bp-* do tokens.css deveria ter os mesmos valores de BREAKPOINTS');
const containers = Object.fromEntries([...tokens.matchAll(/--ob-container-(sm|md|lg|xl):\s*(\d+)px/g)].map((m) => [m[1], Number(m[2])]));
igual(containers, BREAKPOINTS, '--ob-container-<nome> deveria valer o mesmo que o breakpoint de mesmo nome');
const antigos = tokens.match(/--ob-(bp-xs|max-w-[a-z0-9]+|grid-[a-z]+-(mobile|tablet|desktop))\b/g);
if (antigos) fail('tokens com nomes antigos no tokens.css', antigos);

function Sonda() {
  const { current, atLeast } = useBreakpoint();
  return React.createElement('span', null, `${current}|${atLeast('base')}|${atLeast('sm')}`);
}
igual(renderToStaticMarkup(React.createElement(Sonda)), '<span>base|true|false</span>', 'no servidor a faixa deveria ser base');

const permitidos = new Set(Object.values(BREAKPOINTS));
const arquivos = [];
const andar = (dir) => {
  for (const nome of readdirSync(dir)) {
    if (['node_modules', 'dist', 'ds-bundle', '.cache', '.ds-sync'].includes(nome)) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) andar(caminho);
    else if (/\.(css|html|ts|tsx)$/.test(nome)) arquivos.push(caminho);
  }
};
andar(join(pacote, 'src'));
if (existsSync(join(projeto, 'ds'))) andar(join(projeto, 'ds'));

const problemas = [];
for (const arquivo of arquivos) {
  const texto = readFileSync(arquivo, 'utf8');
  for (const m of texto.matchAll(/@media[^{;<]*/g)) {
    const consulta = m[0];
    const onde = `${relative(projeto, arquivo)}: ${consulta.trim()}`;
    if (/max-width|width\s*[<>]/.test(consulta)) problemas.push(`não é mobile-first (use só min-width): ${onde}`);
    for (const v of consulta.matchAll(/min-width\s*:\s*(\d+)px/g)) {
      if (!permitidos.has(Number(v[1]))) problemas.push(`valor fora da escala: ${onde}`);
    }
  }
}
if (problemas.length) fail(`${problemas.length} media queries fora da regra`, '\n' + problemas.join('\n'));

console.log(`OK: breakpoints (escala, tokens, containers, SSR do useBreakpoint, ${arquivos.length} arquivos sem @media fora da escala)`);
