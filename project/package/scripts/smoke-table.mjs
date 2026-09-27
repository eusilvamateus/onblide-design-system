import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const columns = [{ key: 'a', label: 'Tarefa' }, { key: 'b', label: 'Status' }];
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

console.log('OK: Table (sem borda dupla no rodapé, bordas de 1px inteiro, em todos os estados)');
