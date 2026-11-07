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
if (!padrao.includes('class="ob-sa-alvo"') || !padrao.includes('resize:none')) fail('a barra e a alça nativas deveriam dar lugar às do design system', padrao);
if (!padrao.includes('data-alca="vertical"') || !padrao.includes('ph-arrows-vertical')) fail('a alça padrão redimensiona na vertical', padrao);
for (const resize of ['horizontal', 'both']) if (!renderToStaticMarkup(h(Textarea, { resize })).includes(`data-alca="${resize}"`)) fail(`resize ${resize} deveria mostrar a alça`);
for (const props of [{ resize: 'none' }, { autosize: true }, { disabled: true }, { readOnly: true }]) {
  if (renderToStaticMarkup(h(Textarea, props)).includes('data-alca')) fail('sem alça com ' + JSON.stringify(props));
}

console.log('OK: Textarea (valor, contador, limite, error, disabled, barra e alça do design system)');
