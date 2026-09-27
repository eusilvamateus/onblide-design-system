import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Breadcrumbs } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const items = [{ icon: 'house', ariaLabel: 'Início' }, { label: 'Clientes' }, { label: 'Padaria Estrela' }];
const basic = renderToStaticMarkup(h(Breadcrumbs, { items }));
if (!basic.includes('aria-current="page"')) fail('último item deveria ser aria-current=page', basic);
if ((basic.match(/<a /g) || []).length !== 2) fail('os dois primeiros itens deveriam ser links', basic);
if (!basic.includes('aria-label="Início"')) fail('item só com ícone deveria usar ariaLabel', basic);

const longTrail = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }, { label: 'E' }];
const collapsed = renderToStaticMarkup(h(Breadcrumbs, { items: longTrail, maxItems: 3 }));
if (!collapsed.includes('Mostrar mais')) fail('trilha maior que maxItems deveria recolher o meio num menu', collapsed);
if (!collapsed.includes('>A<') || !collapsed.includes('>E<')) fail('recolhido deveria manter o primeiro e o último item', collapsed);

const slash = renderToStaticMarkup(h(Breadcrumbs, { items, separator: 'slash' }));
if (!slash.includes('>/<')) fail('separator slash deveria trocar o ícone pela barra', slash);

console.log('OK: Breadcrumbs (aria-current, links, ícone só com ariaLabel, maxItems recolhe, separator)');
