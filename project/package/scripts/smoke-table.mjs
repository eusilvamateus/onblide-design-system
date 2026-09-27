import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const columns = [{ key: 'a', label: 'Tarefa', sortable: true }, { key: 'b', label: 'Status', sortable: true }];
const rows = [{ a: 'Revisar', b: 'Ok' }, { a: 'Enviar', b: 'Pendente' }, { a: 'Fechar', b: 'Ok' }];

// Linhas de <tr> do corpo, cada uma com o estilo das suas células.
const linhasDo = (html) => (html.split('<tbody>')[1] ?? '').split('</tr>').filter((l) => l.includes('<td'));

const casos = {
  normal: h(Table, { columns, rows }),
  selecionavel: h(Table, { columns, rows, selectable: true }),
  carregando: h(Table, { columns, rows, loading: true }),
  vazio: h(Table, { columns, rows: [] }),
};

for (const [nome, el] of Object.entries(casos)) {
  const html = renderToStaticMarkup(el);
  // Nenhuma borda com espessura fracionada: arredonda diferente em cada tela e parece mais grossa.
  if (/border[^;"]*:\s*\d*\.\d+px/.test(html)) fail(`${nome}: borda com espessura fracionada`, html);
  const linhas = linhasDo(html);
  const ultima = linhas[linhas.length - 1];
  // A borda do invólucro fecha a tabela: a última linha não pode ter borda de baixo (somaria 2px no rodapé).
  if (!ultima || ultima.includes('border-bottom:1px')) fail(`${nome}: última linha com borda de baixo`, ultima);
  // As outras linhas continuam separadas por 1px.
  for (const l of linhas.slice(0, -1)) if (!l.includes('border-bottom:1px solid var(--ob-line-soft)')) fail(`${nome}: linha sem separador`, l);
}

// Ordem das linhas: com um <td>/<tr> por linha, na ordem em que aparecem no HTML.
const ordemDe = (html) => linhasDo(html).map((l) => l.match(/<td[^>]*>([^<]*)</)?.[1]);

// Sem onSort, a Table ordena sozinha a partir do `sort` inicial — testável já na primeira renderização (SSR),
// sem precisar simular clique. O clique em si (ciclo crescente → decrescente → sem ordenação) é coberto pelo
// teste de interação em scripts/verificar-table.mjs (Playwright).
const semOrdenar = renderToStaticMarkup(h(Table, { columns, rows }));
if (ordemDe(semOrdenar).join() !== ['Revisar', 'Enviar', 'Fechar'].join()) fail('sem sort, deveria manter a ordem original', semOrdenar);

const crescente = renderToStaticMarkup(h(Table, { columns, rows, sort: { key: 'a', dir: 'asc' } }));
if (ordemDe(crescente).join() !== ['Enviar', 'Fechar', 'Revisar'].join()) fail('sort inicial crescente deveria ordenar por "a"', crescente);
if (!crescente.includes('↑')) fail('seta deveria indicar ordenação crescente', crescente);

const decrescente = renderToStaticMarkup(h(Table, { columns, rows, sort: { key: 'b', dir: 'desc' } }));
if (ordemDe(decrescente).join() !== ['Enviar', 'Revisar', 'Fechar'].join()) fail('sort inicial decrescente deveria ordenar por "b"', decrescente);
if (!decrescente.includes('↓')) fail('seta deveria indicar ordenação decrescente', decrescente);

// Datas dd/mm/aaaa ordenam como data, não como texto (o dia "02" não pode vir antes de "12" por comparação de string).
const comDatas = [{ a: '02/01/2026', b: '' }, { a: '12/10/2025', b: '' }];
const porData = renderToStaticMarkup(h(Table, { columns, rows: comDatas, sort: { key: 'a', dir: 'asc' } }));
if (ordemDe(porData).join() !== ['12/10/2025', '02/01/2026'].join()) fail('data dd/mm/aaaa deveria ordenar cronologicamente', porData);

// Com onSort, quem usa decide a ordem: a Table não reordena sozinha, só marca a seta pelo `sort` recebido.
const comOnSort = renderToStaticMarkup(h(Table, { columns, rows, sort: { key: 'a', dir: 'asc' }, onSort: () => {} }));
if (ordemDe(comOnSort).join() !== ordemDe(semOrdenar).join()) fail('com onSort, a Table não deveria reordenar sozinha', comOnSort);
if (!comOnSort.includes('↑')) fail('com onSort, a seta ainda deveria refletir o `sort` recebido', comOnSort);

console.log('OK: Table (sem borda dupla no rodapé, bordas de 1px inteiro, ordenação automática e controlada, em todos os estados)');
