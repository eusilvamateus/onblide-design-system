import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Avatar, { name: 'Mateus Silva', size: 40 }));

if (!html.includes('>MA<') || !html.includes('width:40px')) {
  console.error('FAIL: unexpected markup (expected initials "MA", width 40px):', html);
  process.exit(1);
}
console.log('OK:', html);
