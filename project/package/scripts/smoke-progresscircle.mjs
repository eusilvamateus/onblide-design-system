import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressCircle } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(ProgressCircle, props));

const arcoVazio = (html) => {
  const total = Number(html.match(/stroke-dasharray="([\d.]+)"/)[1]);
  const deslocamento = Number(html.match(/stroke-dashoffset="([\d.]+)"/)[1]);
  return deslocamento / total;
};

const metade = render({ value: 50, showLabel: true });
if (!metade.includes('>50%<')) fail('rótulo percentual', metade);
if (Math.abs(arcoVazio(metade) - 0.5) > 0.001) fail('metade do arco', arcoVazio(metade));
if (Math.abs(arcoVazio(render({ value: 100 }))) > 0.001) fail('arco completo');
if (Math.abs(arcoVazio(render({ value: 0 })) - 1) > 0.001) fail('arco vazio');
if (!render({ value: 50 }).includes('>50%<')) fail('rótulo aparece por padrão');
if (render({ value: 50, showLabel: false }).includes('>50%<')) fail('showLabel={false} esconde o número');
if (!render({ value: 30, showLabel: true, label: 'Meta' }).includes('Meta')) fail('label personalizado');
if (render({ value: 10, tone: 'primary' }) === render({ value: 10, tone: 'danger' })) fail('tom altera a cor');
const tamanhos = new Set(['sm', 'md', 'lg', 'xl'].map((size) => render({ value: 10, size }).match(/width="(\d+)"/)?.[1]));
if (tamanhos.size !== 4) fail('quatro tamanhos distintos', [...tamanhos].join(','));
console.log('OK: ProgressCircle (arco proporcional, rótulo, label, tons, tamanhos)');
