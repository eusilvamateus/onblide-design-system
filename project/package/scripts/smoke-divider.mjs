import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Divider } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const render = (props) => renderToStaticMarkup(h(Divider, props));

const horizontal = render({});
if (!horizontal.includes('role="separator"') || !horizontal.includes('aria-orientation="horizontal"')) fail('horizontal deveria ter role separator', horizontal);
const vertical = render({ orientation: 'vertical' });
if (!vertical.includes('aria-orientation="vertical"') || !vertical.includes('align-self:stretch')) fail('vertical deveria esticar e marcar a orientação', vertical);
const decorative = render({ decorative: true });
if (!decorative.includes('aria-hidden="true"') || decorative.includes('role="separator"')) fail('decorative deveria trocar role por aria-hidden', decorative);
const labeled = render({ label: 'ou' });
if (!labeled.includes('>ou<')) fail('deveria mostrar o rótulo', labeled);
if (!render({ variant: 'dashed' }).includes('dashed')) fail('variant dashed deveria tracejar a linha');

console.log('OK: Divider (role separator, vertical, decorative, rótulo, variant)');
