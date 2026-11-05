import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, texto = 'Ativo') => renderToStaticMarkup(React.createElement(Badge, props, texto));

const padrao = render({});
if (!padrao.includes('Ativo')) fail('conteúdo', padrao);
if ((padrao.match(/<span/g) ?? []).length !== 2) fail('soft com dot padrão deveria ter o ponto', padrao);
if ((render({ dot: false }).match(/<span/g) ?? []).length !== 1) fail('dot={false} remove o ponto');

const numerico = render({ variant: 'numeric' }, '4');
if ((numerico.match(/<span/g) ?? []).length !== 1) fail('numeric nunca mostra o ponto', numerico);
if (!numerico.includes('min-width:18px') || !numerico.includes('height:18px')) fail('numeric é compacto e redondo', numerico);
if (!numerico.includes('color:var(--ob-fg-on-color)')) fail('numeric é solid por padrão', numerico);
if (render({ variant: 'numeric', appearance: 'soft' }, '4').includes('color:var(--ob-fg-on-color)')) fail('numeric aceita outra appearance', numerico);
if (render({}).includes('color:var(--ob-fg-on-color)')) fail('label é soft por padrão');

const solido = render({ appearance: 'solid', tone: 'success' });
if (!solido.includes('color:var(--ob-fg-on-color)')) fail('solid usa o token de texto sobre cor', solido);
if (solido.includes('#fff')) fail('nenhuma cor solta', solido);

if (!render({ appearance: 'outline', tone: 'danger' }).includes('border:1.5px solid')) fail('outline tem contorno');
for (const tone of ['neutral', 'primary', 'success', 'warning', 'danger']) {
  if (!render({ tone }).includes('Ativo')) fail(`tom ${tone}`);
}
if (!render({ tone: 'inexistente' }).includes('Ativo')) fail('tom desconhecido cai no padrão');
if (!render({ size: 'sm' }).includes('font-size:11px')) fail('size sm');
console.log('OK: Badge (appearance soft/solid/outline, variant label/numeric, tons, dot, size)');
