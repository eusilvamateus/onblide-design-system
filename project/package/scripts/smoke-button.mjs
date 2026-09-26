import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// (0) variante primária renderiza o rótulo e o fundo da marca
const p = renderToStaticMarkup(h(Button, { kind: 'primary' }, 'Continuar'));
if (!p.includes('Continuar') || !p.includes('background:var(--ob-blue)')) fail('markup primário inesperado', p);

// (a) padrão: type="button", sem disabled, cursor de clique
const a = renderToStaticMarkup(h(Button, {}, 'Salvar'));
if (!a.includes('type="button"')) fail('type="button" esperado por padrão', a);
if (a.includes('disabled')) fail('não deveria estar desabilitado', a);
if (!a.includes('cursor:pointer')) fail('cursor pointer esperado', a);

// (b) desabilitado: atributo nativo, opacidade e cursor
const b = renderToStaticMarkup(h(Button, { disabled: true }, 'Enviar'));
if (!b.includes('disabled=""')) fail('atributo disabled ausente', b);
if (!b.includes('opacity:0.5')) fail('opacidade reduzida esperada', b);
if (!b.includes('cursor:not-allowed')) fail('cursor not-allowed esperado', b);

// (c) props nativas repassadas e type sobrescrevível
const c = renderToStaticMarkup(h(Button, { type: 'submit', 'aria-label': 'AL-X', name: 'nm' }, 'Ok'));
if (!c.includes('type="submit"')) fail('type não repassado', c);
if (!c.includes('aria-label="AL-X"')) fail('aria-label não repassado', c);
if (!c.includes('name="nm"')) fail('name não repassado', c);

console.log('OK: Button (type padrão, disabled, props nativas)');
