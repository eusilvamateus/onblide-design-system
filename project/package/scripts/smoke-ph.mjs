import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ph } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Ph, { n: 'check', size: 20, c: '#fff' }));

if (!html.includes('ph ph-check') || !html.includes('font-size:20px')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
