import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { List, ListItem, ListSubheader, ListDivider } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const basic = renderToStaticMarkup(h(List, {}, h(ListItem, { key: 'a', title: 'A' }), h(ListItem, { key: 'b', title: 'B' })));
if (!basic.includes('<ul') || !basic.includes('<li')) fail('List/ul deveria virar li nos itens', basic);

const asDiv = renderToStaticMarkup(h(List, { as: 'div' }, h(ListItem, { key: 'a', title: 'A' })));
if (!asDiv.includes('<div') || asDiv.includes('<li')) fail('List as="div" deveria virar div nos itens', asDiv);

const dividers = renderToStaticMarkup(h(List, { dividers: true }, h(ListItem, { key: 'a', title: 'A' }), h(ListItem, { key: 'b', title: 'B' })));
if ((dividers.match(/border-bottom:1px solid var\(--ob-border\)/g) || []).length !== 1) fail('dividers deveria separar só entre os itens (1 borda para 2 itens)', dividers);
if (!dividers.includes('border-radius:var(--ob-r-surface)') || !dividers.includes('overflow:hidden')) fail('dividers deveria recortar o destaque no raio da lista', dividers);

const sel = renderToStaticMarkup(h(ListItem, { title: 'X', selected: true }));
if (!sel.includes('var(--ob-blue-100)')) fail('selected (fill) deveria pintar o fundo', sel);
const selNone = renderToStaticMarkup(h(ListItem, { title: 'X', selected: true, selectedStyle: 'none' }));
if (selNone.includes('var(--ob-blue-100)')) fail('selectedStyle none não deveria pintar o fundo', selNone);
const selEmFoco = renderToStaticMarkup(h(ListItem, { title: 'X', selected: true, highlighted: true }));
if (!selEmFoco.includes('var(--ob-blue-100)') || selEmFoco.includes('var(--ob-bg-warm)')) fail('selecionado com o mouse em cima deveria continuar azul', selEmFoco);
const soEmFoco = renderToStaticMarkup(h(ListItem, { title: 'X', highlighted: true }));
if (!soEmFoco.includes('var(--ob-bg-warm)')) fail('item não selecionado deveria destacar no hover', soEmFoco);

const disabled = renderToStaticMarkup(h(ListItem, { title: 'X', disabled: true, href: '#' }));
if (!disabled.includes('aria-disabled="true"') || !disabled.includes('cursor:not-allowed')) fail('disabled deveria bloquear interação', disabled);

const sub = renderToStaticMarkup(h(ListSubheader, {}, 'Grupo'));
if (!sub.includes('role="presentation"') || !sub.includes('>Grupo<')) fail('ListSubheader deveria ser presentation com o rótulo', sub);

const div = renderToStaticMarkup(h(ListDivider, {}));
if (!div.includes('role="separator"')) fail('ListDivider deveria ser um Divider de verdade', div);

console.log('OK: List (as, dividers, selected/selectedStyle, disabled, ListSubheader, ListDivider)');
