import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Button, { kind: 'primary' }, 'Continuar'));

if (!html.includes('Continuar') || !html.includes('background:var(--ob-blue)')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
