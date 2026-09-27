import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SideNav } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const items = [
  { id: 'acoes', label: 'Ações', children: [{ id: 'button', label: 'Botao-X' }] },
  { id: 'forms', label: 'Formulários', children: [{ id: 'input', label: 'Campo-Y' }] },
];

// O grupo que contém o item ativo começa aberto; os outros, fechados.
const a = renderToStaticMarkup(h(SideNav, { items, active: 'button', hideAccount: true }));
if (!a.includes('Botao-X')) fail('grupo com o item ativo deveria começar aberto', a);
if (a.includes('Campo-Y')) fail('grupo sem o item ativo deveria começar fechado', a);
if (!a.includes('aria-expanded="true"') || !a.includes('aria-expanded="false"')) fail('grupos deveriam expor aria-expanded', a);

// Sem children, o comportamento de antes continua.
const b = renderToStaticMarkup(h(SideNav, { items: [{ id: 'x', label: 'Simples' }], active: 'x' }));
if (!b.includes('Simples') || b.includes('aria-expanded')) fail('item simples não deveria virar grupo', b);

console.log('OK: SideNav (grupos recolhíveis, grupo ativo aberto)');
