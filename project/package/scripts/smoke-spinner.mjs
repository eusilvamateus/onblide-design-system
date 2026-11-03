import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Spinner } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Spinner, props));

const padrao = render({});
if (!padrao.includes('role="status"') || !padrao.includes('aria-live="polite"')) fail('semântica de status', padrao);
if (!render({ label: 'Carregando' }).includes('aria-label="Carregando"')) fail('rótulo acessível');
const tamanhos = new Set(['xs', 'sm', 'md', 'lg', 'xl'].map((size) => render({ size }).match(/width="(\d+)"/)?.[1]));
if (tamanhos.size !== 5) fail('cinco tamanhos distintos', [...tamanhos].join(','));
if (render({ tone: 'primary' }) === render({ tone: 'danger' })) fail('tom altera a cor');
for (const tone of ['default', 'success', 'warning', 'danger', 'muted']) if (!render({ tone }).includes('<svg')) fail(`tom ${tone}`);
console.log('OK: Spinner (role status, rótulo, tamanhos, tons)');
