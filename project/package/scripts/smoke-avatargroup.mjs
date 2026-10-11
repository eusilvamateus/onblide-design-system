import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, AvatarGroup } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const h = React.createElement;
const pessoas = ['Ana Lima', 'Bruno Dias', 'Carla Souza', 'Diego Reis', 'Eva Costa'];
const render = (props) => renderToStaticMarkup(h(AvatarGroup, props, ...pessoas.map((nome) => h(Avatar, { key: nome, name: nome }))));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;

const todos = render({});
if (!todos.includes('role="group"') || !todos.includes('aria-label="5 pessoas"')) fail('grupo acessível com a contagem', todos);
for (const iniciais of ['AL', 'BD', 'CS', 'DR', 'EC']) if (!todos.includes(`>${iniciais}<`)) fail(`avatar ${iniciais}`, todos);
if (todos.includes('>+')) fail('sem max não há contador', todos);

const limitado = render({ max: 3 });
if (!limitado.includes('>AL<') || !limitado.includes('>CS<')) fail('mostra os 3 primeiros', limitado);
if (limitado.includes('>DR<') || limitado.includes('>EC<')) fail('esconde os excedentes', limitado);
if (!limitado.includes('>+2<')) fail('contador com o total escondido', limitado);
if (!limitado.includes('title="mais 2"')) fail('contador com dica', limitado);

if (render({ max: 5 }).includes('>+')) fail('max igual ao total não mostra contador');
if (render({ max: 9 }).includes('>+')) fail('max maior que o total não mostra contador');
if (!render({ max: 0 }).includes('>+5<')) fail('max 0 mostra só o contador');

const grande = render({ size: 48, max: 2 });
if (contar(grande, 'width:48px') !== 3) fail('size vale para todos os avatares, inclusive o contador', grande);
if (!grande.includes('margin-left:-13px')) fail('sobreposição proporcional ao tamanho', grande);
if (!grande.includes('0 0 0 2px var(--ob-surface)')) fail('anel na cor da superfície separa os avatares', grande);
console.log('OK: AvatarGroup (grupo acessível, max, contador, size, sobreposição)');
