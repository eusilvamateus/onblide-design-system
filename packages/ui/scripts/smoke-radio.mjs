import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Radio } from '../dist/index.js';

const checkedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'a', checked: true, label: 'Opção A' }));
const uncheckedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'b', checked: false, label: 'Opção B' }));

if (!checkedHtml.includes('background:var(--ob-blue)') || uncheckedHtml.includes('background:var(--ob-blue)')) {
  console.error('FAIL: checked/unchecked dot color mismatch:', checkedHtml, uncheckedHtml);
  process.exit(1);
}
console.log('OK:', checkedHtml);
