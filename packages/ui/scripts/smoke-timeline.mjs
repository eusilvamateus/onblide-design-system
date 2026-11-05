import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timeline } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const items = [
  { title: 'Pedido criado', status: 'done', time: '10:00' },
  { title: 'Em separação', status: 'current', time: '10:15' },
  { title: 'Entrega', status: 'pending' },
];
const vertical = renderToStaticMarkup(h(Timeline, { items }));
if (!vertical.includes('Pedido criado') || !vertical.includes('Em separação')) fail('deveria renderizar os títulos', vertical);
if ((vertical.match(/<ol/g) || []).length !== 1) fail('vertical deveria ser uma lista ordenada só', vertical);

const horizontal = renderToStaticMarkup(h(Timeline, { items, orientation: 'horizontal' }));
if (!horizontal.includes('overflow-x:auto') && !horizontal.includes('overflowX')) fail('horizontal deveria rolar lateralmente', horizontal);

const icon = renderToStaticMarkup(h(Timeline, { items: [{ title: 'X', icon: 'check', status: 'done' }], marker: 'icon' }));
if (!icon.includes('ph-check') && !icon.includes('ph check')) fail('marker icon deveria renderizar o ícone', icon);

const error = renderToStaticMarkup(h(Timeline, { items: [{ title: 'Falhou', status: 'error' }] }));
if (!error.includes('var(--ob-danger)')) fail('status error deveria destacar o título em vermelho', error);

console.log('OK: Timeline (vertical, horizontal, marker icon, status error)');
