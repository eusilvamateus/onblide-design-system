import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FloatingPanel } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(FloatingPanel, props, 'conteúdo'));

const basico = render({});
if (!basico.includes('conteúdo')) fail('renderiza os filhos', basico);
if (!basico.includes('box-shadow:var(--ob-shadow')) fail('sombra por token', basico);
if (!basico.includes('background:var(--ob-surface)')) fail('fundo por token', basico);
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(basico)) fail('nenhuma cor solta', basico);
if (render({ align: 'left' }) === render({ align: 'right' })) fail('align posiciona de forma diferente');
if (!render({ align: 'stretch' }).includes('left:0') || !render({ align: 'stretch' }).includes('right:0')) fail('stretch ocupa a largura do gatilho');
if (!render({ maxHeight: 200 }).includes('max-height:200px')) fail('maxHeight');
if (!render({ minWidth: 180 }).includes('min-width:180px')) fail('minWidth');
if (!render({ padding: 12 }).includes('padding:12px')) fail('padding');
console.log('OK: FloatingPanel (filhos, tokens, align, limites)');
