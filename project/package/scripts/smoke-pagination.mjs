import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const render = (props) => renderToStaticMarkup(React.createElement(Pagination, props));
// Rótulos na ordem: números dos botões de página e '…' dos separadores.
const rotulos = (html) => [...html.matchAll(/>([^<]+)<\/(?:button|span)>/g)].map((m) => m[1]);
const desabilitados = (html) => (html.match(/disabled=""/g) || []).length;

// Algoritmo do ORIGINAL (Components.jsx) em Node puro, para derivar a expectativa.
function original({ page = 1, total = 10, siblings = 1 }) {
  const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  let pages = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return [...new Set(pages)].map(String);
}

// DEFEITO HERDADO (preservado de propósito — o lote não muda comportamento):
// o legado faz `pages = [...new Set(pages)]` para deduplicar, mas o Set também
// colapsa os DOIS '…' (mesma string) em um só. Com reticências dos dois lados
// (ex.: page=6, total=20) só a da esquerda aparece: 1 … 5 6 7 20. Corrigir isso
// é decisão de API/visual para a fase de endurecimento, não deste porte.
const casos = [
  // [props, rótulos esperados (comportamento REAL do legado), botões de seta desabilitados]
  [{ page: 1, total: 8 },   ['1', '2', '…', '8'],                 1], // demo START
  [{ page: 6, total: 20 },  ['1', '…', '5', '6', '7', '20'],      0], // demo MIDDLE (só um '…', ver acima)
  [{ page: 8, total: 8 },   ['1', '…', '7', '8'],                 1],
  [{ page: 1, total: 1 },   ['1'],                                2],
  [{ page: 1, total: 2 },   ['1', '2'],                           1],
  [{ page: 4, total: 9, siblings: 0 }, ['1', '…', '4', '9'],      0], // idem: um único '…'
  [{},                      ['1', '2', '…', '10'],                1], // padrões: page=1 total=10
];

for (const [props, esperado, desab] of casos) {
  const ref = original(props);
  if (ref.join('|') !== esperado.join('|')) fail(`expectativa diverge do algoritmo original para ${JSON.stringify(props)}`, { esperado, ref });
  const html = render(props);
  const obtido = rotulos(html);
  if (obtido.join('|') !== esperado.join('|')) fail(`rótulos para ${JSON.stringify(props)}`, { esperado, obtido });
  if (desabilitados(html) !== desab) fail(`setas desabilitadas para ${JSON.stringify(props)}: esperado ${desab}`, desabilitados(html));
}

// A página atual é o botão preenchido de azul (background:var(--ob-blue)).
const ativa = render({ page: 6, total: 20 });
const botoes = ativa.split('<button').slice(1);
const preenchidos = botoes.filter((b) => b.includes('background:var(--ob-blue)'));
if (preenchidos.length !== 1 || !preenchidos[0].includes('>6</button>')) fail('só a página 6 deveria estar preenchida', preenchidos);

// Setas usam os ícones caret-left / caret-right (16px).
if (!ativa.includes('ph-caret-left') || !ativa.includes('ph-caret-right') || !ativa.includes('font-size:16px')) fail('ícones das setas', ativa);

console.log('OK: Pagination (janela de páginas, reticências, setas desabilitadas, página ativa)');
