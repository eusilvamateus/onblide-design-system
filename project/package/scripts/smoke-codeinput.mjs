import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CodeInput } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(CodeInput, props));
const celulas = (html) => (html.match(/<input/g) ?? []).length;
const valores = (html) => [...html.matchAll(/value="([^"]*)"/g)].map((m) => m[1]);

if (celulas(render({})) !== 6) fail('seis células por padrão');
if (celulas(render({ length: 4 })) !== 4) fail('length define a quantidade de células');
const preenchido = render({ length: 4, value: '12' });
if (valores(preenchido).join('|') !== '1|2||') fail('cada caractere vai para uma célula', valores(preenchido).join('|'));
if (!preenchido.includes('inputMode="numeric"') || !preenchido.includes('maxLength="1"')) fail('numérico e um caractere por célula', preenchido);
if (valores(render({ length: 3, value: '123456' })).join('|') !== '1|2|3') fail('valor maior que length é cortado');
if (!render({ length: 2, status: 'error' }).includes('var(--ob-danger)')) fail('status error usa o token de perigo');
if (!render({ length: 2, status: 'success' }).includes('var(--ob-green)')) fail('status success usa o token de sucesso');
if (render({ length: 2, status: 'error' }).includes('ob-shake') === false) fail('error balança');
if (render({ length: 2 }).includes('ob-shake')) fail('padrão não balança');
console.log('OK: CodeInput (células, valor, corte, status)');
