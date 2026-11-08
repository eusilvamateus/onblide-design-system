import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Radio } from '../dist/index.js';

const checkedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'a', checked: true, label: 'Opção A' }));
const uncheckedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'b', checked: false, label: 'Opção B' }));

if (!checkedHtml.includes('background:var(--ob-blue)') || uncheckedHtml.includes('background:var(--ob-blue)')) {
  console.error('FAIL: checked/unchecked dot color mismatch:', checkedHtml, uncheckedHtml);
  process.exit(1);
}
for (const [size, px, ponto] of [['sm', 16, 6], ['md', 18, 8], ['lg', 20, 10]]) {
  const html = renderToStaticMarkup(React.createElement(Radio, { value: 'a', checked: true, label: 'A', size }));
  if (!html.includes(`width:${px}px;height:${px}px`) || !html.includes(`width:${ponto}px;height:${ponto}px`) || !html.includes(`line-height:${px}px`)) {
    console.error(`FAIL: size ${size} deveria ter círculo de ${px}px e ponto de ${ponto}px:`, html);
    process.exit(1);
  }
}
console.log('OK: Radio (marcado, desmarcado, tamanhos sm/md/lg)');
