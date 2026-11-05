import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressBar } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(ProgressBar, props));

const comRotulo = render({ value: 40, showLabel: true });
if (!comRotulo.includes('40%</span>')) fail('rótulo percentual', comRotulo);
if (!comRotulo.includes('width:40%')) fail('largura proporcional', comRotulo);
if (render({ value: 40 }).includes('</span>')) fail('sem showLabel não mostra o número');
if (!render({ value: 250, showLabel: true }).includes('100%</span>')) fail('valor acima de 100 é limitado');
if (!render({ value: -5, showLabel: true }).includes('0%</span>')) fail('valor negativo é limitado a 0');
const indeterminado = render({ indeterminate: true, showLabel: true });
if (!indeterminado.includes('animation')) fail('indeterminado anima', indeterminado);
if (indeterminado.includes('</span>')) fail('indeterminado não mostra porcentagem', indeterminado);
const segmentado = render({ segments: 4, currentSegment: 2 });
if ((segmentado.match(/<div/g) ?? []).length !== 5) fail('4 segmentos dentro de um contêiner', segmentado);
const cheios = segmentado.match(/background:(?!var\(--ob-border\))[^;"]+/g) ?? [];
if (cheios.length !== 2) fail('2 segmentos concluídos', cheios.join(' | '));
if (render({ value: 10, size: 'sm' }) === render({ value: 10, size: 'lg' })) fail('size altera a espessura');
if (render({ value: 10, tone: 'primary' }) === render({ value: 10, tone: 'danger' })) fail('tone altera a cor');
console.log('OK: ProgressBar (percentual, limites, indeterminado, segmentos, tamanhos, tons)');
