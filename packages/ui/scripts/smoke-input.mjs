import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input, Select, Button } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// (a) label, hint e props repassadas ao <input>
const a = renderToStaticMarkup(h(Input, { label: 'Nome', hint: 'DICA-X', placeholder: 'PH-X', defaultValue: 'abc', type: 'email', name: 'nm' }));
if (!a.includes('>Nome</label>')) fail('label ausente', a);
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
if (d.includes('<i ') || d.includes('<span') || d.includes('<label')) fail('sem label/hint/ícone não deveria haver span', d);

// (d) disabled repassado
const e = renderToStaticMarkup(h(Input, { disabled: true }));
if (!e.includes('disabled=""')) fail('disabled não repassado', e);

const f = renderToStaticMarkup(h(Input, { label: 'Peso', defaultValue: '1', endAddon: 'kg' }));
if (!f.includes('data-ob-addon') || !f.includes('>kg</span>')) fail('endAddon de texto ausente', f);
if (!f.includes('border-left:1.5px solid var(--ob-border)')) fail('divisória do endAddon ausente', f);
if (!f.includes('padding:0 0 0 var(--ob-space-16)')) fail('padding do campo sem o lado do endAddon', f);
if (!f.includes('background:var(--ob-bg-alt)')) fail('addon de texto deveria ter fundo próprio', f);
if (f.indexOf('<input') > f.indexOf('data-ob-addon')) fail('endAddon deve vir depois do input', f);

const g = renderToStaticMarkup(h(Input, { startAddon: 'R$', error: 'x' }));
if (!g.includes('border-right:1.5px solid var(--ob-danger)')) fail('divisória do startAddon deveria acompanhar o erro', g);
if (g.indexOf('data-ob-addon') > g.indexOf('<input')) fail('startAddon deve vir antes do input', g);

const i = renderToStaticMarkup(h(Input, { label: 'Altura', endAddon: h(Select, { embedded: true, ariaLabel: 'Unidade', options: ['cm', 'mm'], value: 'cm' }) }));
if (!i.includes('aria-label="Unidade"') || i.includes('background:var(--ob-bg-alt)')) fail('addon com Select embutido não leva fundo de texto', i);
const rotulo = i.match(/<label for="([^"]+)"/);
if (!rotulo || !i.includes(`id="${rotulo[1]}"`)) fail('label deve apontar para o input do campo (e não para o Select)', i);

const j = renderToStaticMarkup(h(Input, { endAddon: false }));
if (j.includes('data-ob-addon')) fail('addon falso não renderiza', j);

const k = renderToStaticMarkup(h(Input, { endIcon: h('i', { id: 'fim' }) }));
if (!k.includes('data-ob-end-icon') || !k.includes('<i id="fim">')) fail('endIcon ausente', k);
if (k.includes('border-left') || k.includes('data-ob-addon')) fail('endIcon não leva divisória', k);
if (k.indexOf('<input') > k.indexOf('data-ob-end-icon')) fail('endIcon deve vir depois do input', k);
if (!k.includes('padding:0 var(--ob-space-6) 0 var(--ob-space-16)')) fail('com endIcon o recuo da direita é o da ação', k);
const l = renderToStaticMarkup(h(Input, { size: 'sm', endIcon: h(Button, { kind: 'neutral', size: 'sm', iconOnly: true, 'aria-label': 'Limpar', icon: h('i') }) }));
if (!l.includes('aria-label="Limpar"') || !l.includes('width:24px') || !l.includes('height:24px')) fail('Button no endIcon se ajusta ao campo sm', l);
const m = renderToStaticMarkup(h(Input, { endIcon: h('i', { id: 'fim' }), endAddon: 'kg' }));
if (m.indexOf('data-ob-end-icon') > m.indexOf('data-ob-addon') || !m.includes('padding:0 0 0 var(--ob-space-16)')) fail('endIcon vem antes do endAddon, que fica colado na borda', m);
if (renderToStaticMarkup(h(Input, { endIcon: false })).includes('data-ob-end-icon')) fail('endIcon falso não renderiza');

console.log('smoke-input ok');
