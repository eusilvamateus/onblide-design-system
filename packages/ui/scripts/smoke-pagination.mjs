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

const bordas = render({ page: 1, total: 20, showEdges: true });
if (!bordas.includes('aria-label="Primeira página"') || !bordas.includes('aria-label="Última página"')) fail('showEdges mostra primeira e última página', bordas);
if (!bordas.includes('ph-caret-line-left') || !bordas.includes('ph-caret-line-right')) fail('ícones de primeira e última página', bordas);
if (desabilitados(bordas) !== 2) fail('na página 1, primeira e anterior ficam desabilitadas', bordas);
if (render({ page: 1, total: 20 }).includes('Primeira página')) fail('sem showEdges não há primeira e última página');

const compacta = render({ page: 3, total: 20, variant: 'compact' });
if (!/Página <strong[^>]*>3<\/strong> de 20/.test(compacta)) fail('compact mostra "Página 3 de 20"', compacta);
if (compacta.includes('aria-label="Página 1"') || compacta.includes('Avançar')) fail('compact não mostra os números nem as reticências', compacta);
if (!compacta.includes('aria-live="polite"')) fail('compact anuncia a página nova', compacta);

const comItens = render({ page: 2, totalItems: 205, pageSize: 20 });
if (!comItens.includes('21–40 de 205')) fail('resumo com totalItems', comItens);
if (!comItens.includes('aria-label="Página 11"') || comItens.includes('aria-label="Página 12"')) fail('total de páginas vem de totalItems e pageSize', comItens);
if (!render({ totalItems: 0 }).includes('Nenhum item')) fail('resumo sem itens');
if (!render({ page: 11, totalItems: 205, pageSize: 20 }).includes('201–205 de 205')) fail('a última página termina no total de itens');

const seletor = render({ totalItems: 200, pageSizeOptions: [10, 20, 50] });
if (!seletor.includes('aria-label="Itens por página"') || !seletor.includes('value="10 por página"')) fail('pageSizeOptions mostra o seletor com a primeira opção', seletor);
if (!render({ totalItems: 200, pageSizeOptions: [10, 20, 50], defaultPageSize: 50 }).includes('1–50 de 200')) fail('defaultPageSize define os itens por página');

const salto = render({ total: 20, showJumper: true });
if (!salto.includes('Ir para') || !salto.includes('aria-label="Ir para a página"') || !salto.includes('role="spinbutton"')) fail('showJumper mostra o campo "Ir para"', salto);

for (const [size, lado, fonte] of [['sm', 32, 13], ['md', 40, 14], ['lg', 48, 15]]) {
  const html = render({ page: 2, total: 5, size });
  if (!html.includes(`min-width:${lado}px;height:${lado}px`) || !html.includes(`font-size:var(--ob-fs-${fonte})`)) fail(`size ${size}: botões de ${lado}px e texto de ${fonte}px`, html);
}

console.log('OK: Pagination (janela de páginas, reticências que saltam, setas, primeira e última, compacta, resumo de itens, itens por página, "Ir para", tamanhos, acessibilidade)');
