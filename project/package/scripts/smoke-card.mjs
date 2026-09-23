import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from '../dist/index.js';

const bordered = renderToStaticMarkup(React.createElement(Card, {}, 'Conteúdo'));
const shadowed = renderToStaticMarkup(React.createElement(Card, { elevation: 'shadow' }, 'Conteúdo'));

if (!bordered.includes('border:1px solid var(--ob-border)') || !shadowed.includes('box-shadow:var(--ob-shadow-md)')) {
  console.error('FAIL: elevation styles mismatch:', bordered, shadowed);
  process.exit(1);
}
console.log('OK:', bordered);
