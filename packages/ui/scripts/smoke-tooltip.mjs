import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tooltip } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const html = renderToStaticMarkup(React.createElement(Tooltip, { label: 'Dica' }, React.createElement('button', null, 'Gatilho')));
if (!html.includes('>Gatilho</button>')) fail('gatilho não renderizado', html);
if (html.includes('role="tooltip"')) fail('tooltip fechado não deveria renderizar o balão', html);
if (html.includes('position:relative')) fail('wrapper não deveria ser relative (o balão é posicionado em portal)', html);
if (html.includes('aria-describedby')) fail('fechado não deveria ter aria-describedby', html);

const texto = renderToStaticMarkup(React.createElement(Tooltip, { label: 'Dica' }, 'só texto'));
if (!texto.includes('só texto')) fail('filho que não é elemento deveria renderizar', texto);

console.log('OK: Tooltip (fechado, gatilho, wrapper sem posição relativa, filho texto)');
