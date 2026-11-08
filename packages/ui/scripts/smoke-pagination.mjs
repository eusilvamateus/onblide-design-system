import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const render = (props) => renderToStaticMarkup(React.createElement(Pagination, props));
const rotulos = (html) => [...html.matchAll(/>([^<]+)<\/button>/g)].map((m) => m[1]);
const desabilitados = (html) => (html.match(/disabled=""/g) || []).length;

const casos = [
  [{ page: 1, total: 8 }, ['1', '2', '…', '8'], 1],
  [{ page: 6, total: 20 }, ['1', '…', '5', '6', '7', '…', '20'], 0],
  [{ page: 8, total: 8 }, ['1', '…', '7', '8'], 1],
  [{ page: 1, total: 1 }, ['1'], 2],
  [{ page: 1, total: 2 }, ['1', '2'], 1],
  [{ page: 4, total: 9, siblings: 0 }, ['1', '…', '4', '…', '9'], 0],
  [{ page: 4, total: 7 }, ['1', '2', '3', '4', '5', '6', '7'], 0],
  [{ page: 3, total: 7 }, ['1', '2', '3', '4', '…', '7'], 0],
  [{ defaultPage: 3, total: 7 }, ['1', '2', '3', '4', '…', '7'], 0],
  [{ page: 50, total: 7 }, ['1', '…', '6', '7'], 1],
  [{ page: 1, total: 0 }, ['1'], 2],
  [{}, ['1', '2', '…', '10'], 1],
];
for (const [props, esperado, desab] of casos) {
  const html = render(props);
  const obtido = rotulos(html);
  if (obtido.join('|') !== esperado.join('|')) fail(`rótulos para ${JSON.stringify(props)}`, { esperado, obtido });
  if (desabilitados(html) !== desab) fail(`setas desabilitadas para ${JSON.stringify(props)}: esperado ${desab}`, desabilitados(html));
}

for (const total of [1, 2, 3, 5, 7, 10, 20, 50]) {
  for (const siblings of [0, 1, 2]) {
    for (let page = 1; page <= total; page++) {
      const itens = rotulos(render({ page, total, siblings }));
      const numeros = itens.filter((r) => r !== '…').map(Number);
      const contexto = `page=${page} total=${total} siblings=${siblings}`;
      if (numeros[0] !== 1 || numeros[numeros.length - 1] !== total || !numeros.includes(page)) fail(`primeira, última e atual sempre visíveis: ${contexto}`, itens);
      if (numeros.some((n, i) => i > 0 && n <= numeros[i - 1])) fail(`páginas em ordem crescente e sem repetição: ${contexto}`, itens);
      itens.forEach((r, i) => {
        if (r === '…' && Number(itens[i + 1]) - Number(itens[i - 1]) < 3) fail(`reticência nunca esconde uma página só: ${contexto}`, itens);
        if (r !== '…' && i > 0 && itens[i - 1] !== '…' && Number(r) !== Number(itens[i - 1]) + 1) fail(`páginas sem reticência entre elas são vizinhas: ${contexto}`, itens);
      });
      if (siblings >= 1 && [page - 1, page + 1].some((v) => v >= 1 && v <= total && !numeros.includes(v))) fail(`vizinhas da atual visíveis: ${contexto}`, itens);
    }
  }
}

const ativa = render({ page: 6, total: 20 });
const botoes = ativa.split('<button').slice(1);
const preenchidos = botoes.filter((b) => b.includes('background:var(--ob-blue)'));
if (preenchidos.length !== 1 || !preenchidos[0].includes('>6</button>')) fail('só a página 6 deveria estar preenchida', preenchidos);
if (botoes.some((b) => !b.startsWith(' type="button"'))) fail('todo botão deveria ter type="button"', ativa);
if (!ativa.includes('ph-caret-left') || !ativa.includes('ph-caret-right')) fail('ícones das setas', ativa);
if (!ativa.startsWith('<nav aria-label="Paginação"')) fail('a raiz deveria ser <nav aria-label="Paginação">', ativa);
if ((ativa.match(/aria-current="page"/g) || []).length !== 1) fail('só a página atual deveria ter aria-current', ativa);
if (!/aria-label="Página 6" aria-current="page"[^>]*>6<\/button>/.test(ativa)) fail('a página 6 deveria ter nome e aria-current', ativa);
if (!ativa.includes('aria-label="Página anterior"') || !ativa.includes('aria-label="Próxima página"')) fail('setas sem nome acessível', ativa);
if (!ativa.includes('aria-label="Voltar 5 páginas"') || !ativa.includes('aria-label="Avançar 5 páginas"')) fail('reticências deveriam ser botões que saltam 5 páginas', ativa);

console.log('OK: Pagination (janela de páginas, reticência nunca esconde uma página só, reticências que saltam, setas desabilitadas, página ativa, acessibilidade)');
