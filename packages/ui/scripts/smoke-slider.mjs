import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slider } from '../dist/index.js';

// modo single
const single = renderToStaticMarkup(React.createElement(Slider, { value: 40, min: 0, max: 100 }));
if (!single.includes('left:40%')) {
  console.error('FAIL (single): thumb não está em 40%:', single);
  process.exit(1);
}

// modo range — dois thumbs, posições distintas
const rangeHtml = renderToStaticMarkup(React.createElement(Slider, { value: [20, 80], min: 0, max: 100, range: true }));
if (!rangeHtml.includes('left:20%') || !rangeHtml.includes('left:80%')) {
  console.error('FAIL (range): thumbs não estão em 20%/80%:', rangeHtml);
  process.exit(1);
}

// disabled — cursor deve indicar not-allowed, não grab
const disabledHtml = renderToStaticMarkup(React.createElement(Slider, { value: 50, disabled: true }));
if (!disabledHtml.includes('cursor:not-allowed')) {
  console.error('FAIL (disabled): cursor não é not-allowed:', disabledHtml);
  process.exit(1);
}

// min === max: sem NaN (a divisão por zero em pct() virava `left:NaN%` / `right:NaN%`)
for (const props of [
  { value: 5, min: 5, max: 5 },
  { value: [5, 5], min: 5, max: 5, range: true },
  { value: 5, min: 5, max: 5, marks: true },
]) {
  const html = renderToStaticMarkup(React.createElement(Slider, props));
  if (html.includes('NaN')) {
    console.error(`FAIL (min === max): NaN no markup para ${JSON.stringify(props)}:`, html);
    process.exit(1);
  }
}

console.log('OK: single, range, disabled e min === max renderizam corretamente');
