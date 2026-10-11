import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Dropdown } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const itens = [{ label: 'Editar' }, { divider: true }, { label: 'Excluir', danger: true }];
const render = (props) =>
  renderToStaticMarkup(React.createElement(Dropdown, { trigger: React.createElement('button', null, 'Abrir'), items: itens, ...props }));

const fechado = render({});
if (!fechado.includes('Abrir')) fail('mostra o gatilho', fechado);
if (fechado.includes('Editar') || fechado.includes('Excluir')) fail('itens só aparecem aberto', fechado);
if (!render({ align: 'right' }).includes('Abrir')) fail('align right');
if (!render({ items: [] }).includes('Abrir')) fail('sem itens ainda renderiza o gatilho');
console.log('OK: Dropdown (gatilho visível, itens só aberto, align)');
