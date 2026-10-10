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

const soIcone = renderToStaticMarkup(h(Button, { iconOnly: true, kind: 'secondary', size: 'sm', 'aria-label': 'Recolher', icon: h('i', null, 'x') }, 'Texto ignorado'));
if (!soIcone.includes('width:32px') || !soIcone.includes('height:32px') || !soIcone.includes('padding:0')) fail('iconOnly sm deveria ser um quadrado de 32px sem padding', soIcone);
if (soIcone.includes('Texto ignorado')) fail('iconOnly não deveria renderizar o texto', soIcone);
if (!soIcone.includes('aria-label="Recolher"')) fail('iconOnly deveria repassar o aria-label', soIcone);

const neutro = renderToStaticMarkup(h(Button, { kind: 'neutral', iconOnly: true, pressed: true, count: 3, 'aria-label': 'Avisos', icon: h('i', null, 'x') }));
if (!neutro.includes('aria-pressed="true"')) fail('pressed deveria marcar aria-pressed', neutro);
if (!neutro.includes('background:var(--ob-surface-2)')) fail('neutral pressionado deveria destacar o fundo', neutro);
if (!neutro.includes('>3<')) fail('count deveria renderizar o contador em badge', neutro);
const neutroSolto = renderToStaticMarkup(h(Button, { kind: 'neutral' }, 'Ação'));
if (!neutroSolto.includes('background:transparent') || !neutroSolto.includes('color:var(--ob-fg)')) fail('neutral em repouso deveria ser transparente com a cor de texto padrão', neutroSolto);

console.log('OK: Button (type padrão, disabled, props nativas, iconOnly, neutral, pressed, count)');
