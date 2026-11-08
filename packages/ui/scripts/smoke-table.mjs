import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html ?? ''); process.exit(1); };
const render = (props) => renderToStaticMarkup(h(Table, props));
const contar = (html, re) => (html.match(re) || []).length;

const columns = [{ key: 'a', label: 'Tarefa', sortable: true }, { key: 'b', label: 'Status', sortable: true }];
const rows = [{ a: 'Revisar', b: 'Ok' }, { a: 'Enviar', b: 'Pendente' }, { a: 'Fechar', b: 'Ok' }];

const linhasDo = (html) => (html.split('<tbody>')[1] ?? '').split('</tr>').filter((l) => l.includes('<td'));
const linhasDeDados = (html) => linhasDo(html).filter((l) => !l.includes('grid-template-rows'));

const casos = {
  normal: { columns, rows },
  selecionavel: { columns, rows, selectable: true },
  carregando: { columns, rows, loading: true },
  vazio: { columns, rows: [] },
  expansivel: { columns, rows, renderExpanded: (r) => r.a },
};

for (const [nome, props] of Object.entries(casos)) {
  const html = render(props);
  if (/border[^;"]*:\s*\d*\.\d+px/.test(html)) fail(`${nome}: borda com espessura fracionada`, html);
  const linhas = linhasDeDados(html);
  const ultima = linhas[linhas.length - 1];
  if (!ultima || ultima.includes('border-bottom:1px')) fail(`${nome}: última linha com borda de baixo`, ultima);
  for (const l of linhas.slice(0, -1)) if (!l.includes('border-bottom:1px solid var(--ob-line-soft)')) fail(`${nome}: linha sem separador`, l);
}

const ordemDe = (html) => linhasDeDados(html).map((l) => l.match(/<td[^>]*>([^<]*)</)?.[1]);

const semOrdenar = render({ columns, rows });
if (ordemDe(semOrdenar).join() !== 'Revisar,Enviar,Fechar') fail('sem sort, deveria manter a ordem original', semOrdenar);
if (/[↑↓↕]/.test(semOrdenar)) fail('as setas de ordenação deveriam ser ícones Phosphor, não caracteres', semOrdenar);
if (contar(semOrdenar, /<button type="button" class="ob-table-ordenar"/g) !== 2) fail('cada coluna ordenável deveria ter um botão no cabeçalho', semOrdenar);
if (!semOrdenar.includes('ph-arrows-down-up') || semOrdenar.includes('aria-sort')) fail('sem ordenação ativa, ícone neutro e nenhum aria-sort', semOrdenar);

const crescente = render({ columns, rows, sort: { key: 'a', dir: 'asc' } });
if (ordemDe(crescente).join() !== 'Enviar,Fechar,Revisar') fail('sort inicial crescente deveria ordenar por "a"', crescente);
if (!crescente.includes('ph-arrow-up') || !crescente.includes('aria-sort="ascending"')) fail('ordenação crescente: ícone e aria-sort', crescente);
if (contar(crescente, /aria-sort=/g) !== 1) fail('só a coluna ordenada tem aria-sort', crescente);

const decrescente = render({ columns, rows, sort: { key: 'b', dir: 'desc' } });
if (ordemDe(decrescente).join() !== 'Enviar,Revisar,Fechar') fail('sort inicial decrescente deveria ordenar por "b"', decrescente);
if (!decrescente.includes('ph-arrow-down') || !decrescente.includes('aria-sort="descending"')) fail('ordenação decrescente: ícone e aria-sort', decrescente);

const comDatas = [{ a: '02/01/2026', b: '' }, { a: '12/10/2025', b: '' }];
if (ordemDe(render({ columns, rows: comDatas, sort: { key: 'a', dir: 'asc' } })).join() !== '12/10/2025,02/01/2026') fail('data dd/mm/aaaa deveria ordenar cronologicamente');

const comOnSort = render({ columns, rows, sort: { key: 'a', dir: 'asc' }, onSort: () => {} });
if (ordemDe(comOnSort).join() !== ordemDe(semOrdenar).join()) fail('com onSort, a Table não deveria reordenar sozinha', comOnSort);
if (!comOnSort.includes('aria-sort="ascending"')) fail('com onSort, o cabeçalho ainda reflete o `sort` recebido', comOnSort);

const carregando = render({ columns, rows, loading: true, selectable: true });
if (!carregando.includes('ob-shimmer') || carregando.includes('ob-pulse')) fail('o carregamento deveria usar o Skeleton', carregando);
if (carregando !== render({ columns, rows, loading: true, selectable: true })) fail('o esqueleto deveria ter as mesmas larguras a cada renderização');

for (const [size, fonte] of [['sm', 13], ['md', 14], ['lg', 15]]) {
  if (!render({ columns, rows, size }).includes(`font-size:${fonte}px`)) fail(`size ${size}: texto de ${fonte}px`);
}

const alinhada = render({ columns: [{ key: 'a', label: 'Valor', align: 'right', sortable: true }], rows: [{ a: 10 }] });
if (contar(alinhada, /text-align:right/g) !== 2 || !alinhada.includes('flex-direction:row-reverse')) fail('align right no cabeçalho e na célula, com o ícone antes do rótulo', alinhada);

const comTitulo = render({ columns, rows, caption: 'Tarefas da semana', ariaLabel: 'ignorado' });
if (!comTitulo.includes('>Tarefas da semana</caption>') || comTitulo.includes('aria-label="ignorado"')) fail('caption visível dispensa o aria-label', comTitulo);
if (!render({ columns, rows, ariaLabel: 'Tarefas' }).includes('<table aria-label="Tarefas"')) fail('ariaLabel nomeia a tabela');

const fixa = render({ columns, rows, maxHeight: 200 });
if (contar(fixa, /position:sticky;top:0/g) !== 2) fail('com maxHeight, o cabeçalho fica fixo', fixa);
if (render({ columns, rows }).includes('position:sticky')) fail('sem maxHeight, o cabeçalho não é fixo');

const porId = [{ id: 7, a: 'Revisar' }, { id: 9, a: 'Enviar' }];
const marcadas = (html) => contar(html, /aria-checked="true"/g);
if (marcadas(render({ columns, rows: porId, selectable: true, defaultSelectedKeys: [9] })) !== 1) fail('defaultSelectedKeys marca pela chave `id`');
const reordenada = render({ columns, rows: porId, selectable: true, selectedKeys: [9], sort: { key: 'a', dir: 'asc' } });
if (marcadas(reordenada) !== 1 || !/<tr[^>]*background:var\(--ob-blue-100\)[^>]*>(?:(?!<\/tr>).)*Enviar/.test(reordenada)) fail('selectedKeys segue a linha mesmo reordenada', reordenada);
if (marcadas(render({ columns, rows: porId, selectable: true, rowKey: 'a', selectedKeys: ['Revisar', 'Enviar'] })) !== 3) fail('rowKey por campo; com todas marcadas, o cabeçalho também marca');

const clicavel = render({ columns, rows, onRowClick: () => {} });
if (contar(clicavel, /<tr class="ob-table-linha" tabindex="0"/g) !== 3) fail('com onRowClick, cada linha recebe foco', clicavel);
if (render({ columns, rows }).includes('tabindex')) fail('sem onRowClick, as linhas não recebem foco');

const detalhes = render({ columns, rows, renderExpanded: (r) => (r.a === 'Enviar' ? null : `Detalhe de ${r.a}`), defaultExpandedKeys: [0] });
if (contar(detalhes, /aria-expanded=/g) !== 2) fail('só as linhas com detalhe ganham o botão de abrir', detalhes);
if (!detalhes.includes('aria-expanded="true"') || !detalhes.includes('aria-expanded="false"')) fail('defaultExpandedKeys abre a primeira linha', detalhes);
if (!/grid-template-rows:1fr;visibility:visible(?:(?!<\/tr>).)*Detalhe de Revisar/.test(detalhes) || !/grid-template-rows:0fr;visibility:hidden(?:(?!<\/tr>).)*Detalhe de Fechar/.test(detalhes)) fail('detalhe aberto visível, fechado oculto', detalhes);
if (!/colSpan="4"/i.test(render({ columns, rows: [], selectable: true, renderExpanded: () => 'x' }))) fail('o estado vazio ocupa também as colunas de controle');

console.log('OK: Table (divisórias, ordenação acessível com ícones, Skeleton estável, tamanhos, alinhamento, caption, cabeçalho fixo, seleção por chave, linha clicável, linhas expansíveis)');
