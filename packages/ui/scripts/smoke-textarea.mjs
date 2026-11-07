import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Textarea } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const basic = renderToStaticMarkup(h(Textarea, { label: 'Bio', defaultValue: 'Olá' }));
if (!basic.includes('<textarea') || !basic.includes('Olá')) fail('deveria renderizar o valor inicial', basic);

const counter = renderToStaticMarkup(h(Textarea, { defaultValue: 'abc', maxLength: 10 }));
if (!counter.includes('3 / 10')) fail('com maxLength deveria mostrar o contador', counter);

const full = renderToStaticMarkup(h(Textarea, { defaultValue: '1234567890', maxLength: 10 }));
if (!full.includes('var(--ob-danger)')) fail('no limite o contador deveria ficar vermelho', full);

const err = renderToStaticMarkup(h(Textarea, { error: 'Obrigatório' }));
if (!err.includes('aria-invalid="true"') || !err.includes('Obrigatório')) fail('error deveria marcar aria-invalid e mostrar a mensagem', err);

const disabled = renderToStaticMarkup(h(Textarea, { disabled: true }));
if (!disabled.includes('disabled=""')) fail('disabled deveria desabilitar o textarea', disabled);

const padrao = renderToStaticMarkup(h(Textarea, { label: 'Bio' }));
if (!padrao.includes('resize:vertical') || !padrao.includes('scrollbar-width:thin') || !padrao.includes('scrollbar-color:var(--ob-scrollbar-thumb) transparent')) fail('o padrão redimensiona na vertical, com a barra nativa fina e pintada pelos tokens', padrao);
for (const resize of ['horizontal', 'both', 'none']) if (!renderToStaticMarkup(h(Textarea, { resize })).includes(`resize:${resize}`)) fail(`resize ${resize} deveria chegar ao textarea`);
for (const props of [{ autosize: true }, { disabled: true }, { readOnly: true }]) {
  if (!renderToStaticMarkup(h(Textarea, { resize: 'both', ...props })).includes('resize:none')) fail('sem redimensionar com ' + JSON.stringify(props));
}

console.log('OK: Textarea (valor, contador, limite, error, disabled, resize, barra nativa fina)');
