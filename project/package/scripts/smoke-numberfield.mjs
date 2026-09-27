import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NumberField } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const basic = renderToStaticMarkup(h(NumberField, { value: 1234.5, decimals: 1 }));
if (!basic.includes('1.234,5')) fail('deveria formatar em pt-BR (ponto de milhar, vírgula decimal)', basic);
if (!basic.includes('role="spinbutton"')) fail('input deveria ser role=spinbutton', basic);

const split = renderToStaticMarkup(h(NumberField, { value: 5, controls: 'split' }));
if ((split.match(/<button/g) || []).length !== 2) fail('controls split deveria ter dois botões', split);
const stacked = renderToStaticMarkup(h(NumberField, { value: 5, controls: 'stacked' }));
if ((stacked.match(/<button/g) || []).length !== 2) fail('controls stacked deveria ter dois botões', stacked);
const none = renderToStaticMarkup(h(NumberField, { value: 5, controls: 'none' }));
if ((none.match(/<button/g) || []).length !== 0) fail('controls none não deveria ter botões', none);

const atMax = renderToStaticMarkup(h(NumberField, { value: 10, max: 10 }));
if (!atMax.includes('disabled')) fail('no máximo o botão de aumentar deveria desabilitar', atMax);

const outOfRange = renderToStaticMarkup(h(NumberField, { value: 20, max: 10 }));
if (!outOfRange.includes('var(--ob-danger)')) fail('valor fora do limite deveria mostrar erro', outOfRange);

const prefix = renderToStaticMarkup(h(NumberField, { value: 10, prefix: 'R$' }));
if (!prefix.includes('R$')) fail('deveria mostrar o prefixo', prefix);

console.log('OK: NumberField (formato pt-BR, controls split/stacked/none, limites, prefixo)');
