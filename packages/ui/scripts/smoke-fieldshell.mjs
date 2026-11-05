import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FieldShell } from '../dist/index.js';

const html = renderToStaticMarkup(
  React.createElement(FieldShell, { focused: true }, React.createElement('input'))
);

if (!html.includes('border:1.5px solid var(--ob-blue)') || !html.includes('<input')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
