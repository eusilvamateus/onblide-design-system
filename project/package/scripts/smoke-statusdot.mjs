import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatusDot } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(StatusDot, props));

for (const tone of ['blue', 'green', 'orange', 'red', 'grey']) {
  const html = render({ tone });
  if (!html.includes('aria-hidden="true"')) fail(`decorativo (${tone})`, html);
  if (!html.includes('border-radius:50%')) fail(`redondo (${tone})`, html);
}
if (render({ tone: 'green' }) === render({ tone: 'red' })) fail('tons diferentes devem ter cores diferentes');
if (!render({}).includes('aria-hidden="true"')) fail('tom padrão');
console.log('OK: StatusDot (decorativo, redondo, um estilo por tom)');
