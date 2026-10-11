import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Skeleton, props));

const retangulo = render({ width: 120, height: 14 });
if (!retangulo.includes('width:120px') || !retangulo.includes('height:14px')) fail('dimensões', retangulo);
const circulo = render({ circle: true, width: 99, height: 40 });
if (!circulo.includes('border-radius:50%')) fail('circle é redondo', circulo);
if (!circulo.includes('width:40px') || !circulo.includes('height:40px')) fail('circle ignora width e usa a altura nos dois eixos', circulo);
if (!render({ width: '50%' }).includes('width:50%')) fail('largura em texto');
if (!render({ radius: 12 }).includes('border-radius:12px')) fail('radius');
if (!render({ style: { marginTop: 8 } }).includes('margin-top:8px')) fail('style adicional');
if (!render({}).includes('animation')) fail('anima por padrão');
console.log('OK: Skeleton (dimensões, circle, radius, style, animação)');
