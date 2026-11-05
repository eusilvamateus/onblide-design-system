import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// O rótulo inteiro é o alvo do clique e do teclado, com a semântica de checkbox.
const a = renderToStaticMarkup(h(Checkbox, { checked: true, label: 'Aceito os termos' }));
if (!a.includes('role="checkbox"')) fail('role="checkbox" ausente', a);
if (!a.includes('aria-checked="true"')) fail('aria-checked="true" esperado', a);
if (!a.includes('tabindex="0"')) fail('deveria ser focável', a);
if (!a.includes('Aceito os termos')) fail('rótulo ausente', a);

const b = renderToStaticMarkup(h(Checkbox, { indeterminate: true, label: 'Todos' }));
if (!b.includes('aria-checked="mixed"')) fail('indeterminado deveria ser aria-checked="mixed"', b);

const c = renderToStaticMarkup(h(Checkbox, { disabled: true, label: 'Bloqueado' }));
if (!c.includes('aria-disabled="true"') || !c.includes('tabindex="-1"')) fail('desabilitado não deveria ser focável', c);

console.log('OK: Checkbox (role, aria-checked, indeterminado, desabilitado)');
