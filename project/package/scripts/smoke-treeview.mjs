import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TreeView } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const items = [
  { id: '1', label: 'Documentos', icon: 'folder', children: [{ id: '1a', label: 'Contrato.pdf', icon: 'file-pdf' }] },
  { id: '2', label: 'Imagens', icon: 'folder', children: [] },
  { id: '3', label: 'Bloqueado', disabled: true },
];

const closed = renderToStaticMarkup(h(TreeView, { items }));
if (!closed.includes('role="tree"') || !closed.includes('role="treeitem"')) fail('deveria ter role tree/treeitem', closed);
if (closed.includes('Contrato.pdf')) fail('nó fechado não deveria mostrar os filhos', closed);
if (!closed.includes('Documentos') || !closed.includes('Imagens')) fail('deveria mostrar os nós de topo', closed);

const expanded = renderToStaticMarkup(h(TreeView, { items, defaultExpanded: ['1'] }));
if (!expanded.includes('Contrato.pdf')) fail('nó expandido deveria mostrar os filhos', expanded);
if (!expanded.includes('aria-expanded="true"')) fail('nó aberto deveria marcar aria-expanded', expanded);

const empty = renderToStaticMarkup(h(TreeView, { items, defaultExpanded: ['2'] }));
if (!empty.includes('Pasta vazia')) fail('pasta vazia expandida deveria avisar', empty);

const single = renderToStaticMarkup(h(TreeView, { items, selection: 'single', defaultSelected: '1' }));
if (!single.includes('aria-selected="true"')) fail('selection single deveria marcar aria-selected', single);

const multiple = renderToStaticMarkup(h(TreeView, { items, selection: 'multiple', defaultSelected: ['1a'], defaultExpanded: ['1'] }));
if (!multiple.includes('aria-checked="true"') && !multiple.includes('aria-checked="mixed"')) fail('selection multiple deveria marcar aria-checked (folha ou pai parcial)', multiple);

const disabled = renderToStaticMarkup(h(TreeView, { items }));
if (!disabled.includes('lock-simple')) fail('nó desabilitado deveria trocar o ícone pelo disabledIcon padrão', disabled);

// defaultExpanded só abre o nó; o carregamento sob demanda só dispara ao expandir por interação (igual à
// proposta original), então aqui só confirmamos que a árvore com loadChildren monta sem erro.
const lazy = renderToStaticMarkup(h(TreeView, {
  items: [{ id: 'r', label: 'Remoto', hasChildren: true }], defaultExpanded: ['r'],
  loadChildren: () => new Promise(() => {}),
}));
if (!lazy.includes('Remoto') || lazy.includes('aria-busy="true"')) fail('nó com hasChildren ainda não expandido por interação não deveria estar carregando', lazy);

const draggable = renderToStaticMarkup(h(TreeView, { items, draggable: true }));
if (!draggable.includes('Arrastar para mover')) fail('draggable deveria mostrar a alça de arrastar', draggable);

const query = renderToStaticMarkup(h(TreeView, { items, query: 'contrato' }));
if (!query.includes('<mark') || !query.includes('>Contrato<') || !query.includes('Documentos')) fail('query deveria destacar o trecho e manter o pai visível', query);
if (query.includes('Imagens')) fail('query deveria esconder ramos sem resultado', query);

console.log('OK: TreeView (fechado/expandido, vazio, selection single/multiple, disabled, loading, draggable, query)');
