import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// (a) label, hint e props repassadas ao <input>
const a = renderToStaticMarkup(h(Input, { label: 'Nome', hint: 'DICA-X', placeholder: 'PH-X', defaultValue: 'abc', type: 'email', name: 'nm' }));
if (!a.includes('>Nome</span>')) fail('label ausente', a);
if (!a.includes('DICA-X')) fail('hint ausente', a);
if (!a.includes('var(--ob-fg-mute)')) fail('cor do hint esperada', a);
if (!a.includes('placeholder="PH-X"')) fail('placeholder não repassado', a);
if (!a.includes('value="abc"')) fail('value não repassado', a);
if (!a.includes('type="email"')) fail('type não repassado', a);
if (!a.includes('name="nm"')) fail('name não repassado', a);
if (!a.includes('var(--ob-border)')) fail('borda padrão esperada', a);

// (b) erro tem precedência sobre hint, com borda e cor de perigo
const b = renderToStaticMarkup(h(Input, { hint: 'DICA-X', error: 'ERRO-X' }));
if (!b.includes('ERRO-X')) fail('mensagem de erro ausente', b);
if (b.includes('DICA-X')) fail('hint não deveria aparecer com erro', b);
if (!b.includes('1.5px solid var(--ob-danger)')) fail('borda de erro ausente', b);
if (!b.includes('color:var(--ob-danger)')) fail('cor de erro ausente', b);

// (c) ícone
const c = renderToStaticMarkup(h(Input, { icon: h('i', { id: 'ic' }) }));
if (!c.includes('<i id="ic">')) fail('ícone ausente', c);
const d = renderToStaticMarkup(h(Input, {}));
if (d.includes('<i ') || d.includes('<span')) fail('sem label/hint/ícone não deveria haver span', d);

// (d) disabled repassado
const e = renderToStaticMarkup(h(Input, { disabled: true }));
if (!e.includes('disabled=""')) fail('disabled não repassado', e);

console.log('smoke-input ok');
