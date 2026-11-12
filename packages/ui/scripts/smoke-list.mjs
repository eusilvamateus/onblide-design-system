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
if (/<ul style="[^"]*overflow:hidden/.test(dividers)) fail('dividers não pode recortar a lista: um Menu aberto num item ficaria cortado', dividers);
if (!dividers.includes('border-radius:var(--ob-r-surface) var(--ob-r-surface) 0 0') || !dividers.includes('border-radius:0 0 var(--ob-r-surface) var(--ob-r-surface)')) fail('dividers arredonda o topo do primeiro item e a base do último, no raio da lista', dividers);

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

const densidade = (size) => renderToStaticMarkup(h(List, size ? { size } : {}, h(ListItem, { key: 'a', title: 'A', description: 'B' })));
const conteudo = densidade();
if (!conteudo.includes('padding:var(--ob-space-12) var(--ob-space-16)') || !conteudo.includes('min-height:48px') || !conteudo.includes('gap:var(--ob-space-4)') || !conteudo.includes('font-size:var(--ob-fs-13)')) fail('o padrão (md) deveria ter a densidade de conteúdo: 12/16, 48px, 4px entre título e descrição e descrição em 13px', conteudo);
const opcoes = densidade('sm');
if (!opcoes.includes('padding:var(--ob-space-8) var(--ob-space-12)') || !opcoes.includes('min-height:36px')) fail('sm deveria ter a densidade de opções: 8/12 e 36px', opcoes);
const densa = densidade('xs');
if (!densa.includes('padding:var(--ob-space-4) var(--ob-space-8)') || !densa.includes('min-height:28px')) fail('xs deveria ter a densidade de painel denso: 4/8 e 28px', densa);

console.log('OK: List (as, dividers, selected/selectedStyle, disabled, densidades md/sm/xs, ListSubheader, ListDivider)');
