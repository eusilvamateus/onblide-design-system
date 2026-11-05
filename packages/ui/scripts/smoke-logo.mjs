import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Logo } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

// Marcação congelada em scripts/fixtures/logo.json (gerada na Fase 4 renderizando
// o Logo original em Node, antes da remoção do UI kit antigo).
const esperado = JSON.parse(fs.readFileSync(new URL('./fixtures/logo.json', import.meta.url), 'utf8'));

if (typeof Logo !== 'function') fail('Logo não é exportado por dist/index.js');
const padrao = renderToStaticMarkup(React.createElement(Logo));
if (padrao !== esperado.padrao) fail('Logo sem props diverge da fixture', padrao.slice(0, 200));
const s24 = renderToStaticMarkup(React.createElement(Logo, { size: 24 }));
if (s24 !== esperado.size24) fail('Logo size=24 diverge da fixture', s24.slice(0, 200));

// Propriedades de que o app e o tema dependem (explícitas, além da comparação literal).
if (!padrao.startsWith('<svg height="28" viewBox="0 0 2048 313.44" role="img" aria-label="Onblide" style="display:block;width:auto">')) fail('cabeçalho do svg inesperado', padrao.slice(0, 160));
for (const token of ['var(--ob-orange)', 'var(--ob-fg-strong)', 'var(--ob-blue)']) {
  if (!padrao.includes(`fill="${token}"`)) fail(`preenchimento ${token} ausente`);
}
if ((padrao.match(/<path /g) || []).length !== 7 || (padrao.match(/<rect /g) || []).length !== 1) fail('o lockup deveria ter 7 paths e 1 rect');

console.log('OK: Logo (padrão 28px e size=24) idêntico à fixture');
