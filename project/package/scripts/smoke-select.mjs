import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Select } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const opts = ['Brasil', 'Chile', 'Peru'];

// (a) single com valor pré-selecionado: o rótulo aparece no input
const single = renderToStaticMarkup(h(Select, { options: opts, value: 'Chile', label: 'País' }));
if (!single.includes('value="Chile"')) fail('single deveria exibir value="Chile"', single);
if (!single.includes('País')) fail('label ausente', single);
if (single.includes('Nenhuma opção')) fail('dropdown não deveria estar aberto', single);

// (b) multi com 2 valores: chips renderizados, sem placeholder
const multi = renderToStaticMarkup(h(Select, { options: opts, value: ['Brasil', 'Peru'], multi: true, placeholder: 'PH-MULTI' }));
if (!multi.includes('Brasil') || !multi.includes('Peru')) fail('chips multi ausentes', multi);
if (multi.includes('Chile')) fail('opção não selecionada não deveria aparecer', multi);
if (multi.includes('placeholder="PH-MULTI"')) fail('placeholder deveria estar vazio com seleção', multi);
if (!multi.includes('placeholder=""')) fail('placeholder vazio esperado no multi com seleção', multi);

// (c) placeholder quando não há valor (single e multi)
const empty = renderToStaticMarkup(h(Select, { options: opts, placeholder: 'Escolha' }));
if (!empty.includes('placeholder="Escolha"')) fail('placeholder ausente', empty);
const emptyMulti = renderToStaticMarkup(h(Select, { options: opts, multi: true, placeholder: 'Escolha' }));
if (!emptyMulti.includes('placeholder="Escolha"')) fail('placeholder multi vazio ausente', emptyMulti);
const defPh = renderToStaticMarkup(h(Select, { options: opts }));
if (!defPh.includes('Selecione…')) fail('placeholder padrão ausente', defPh);

// (d) disabled e error
const dis = renderToStaticMarkup(h(Select, { options: opts, disabled: true }));
if (!/<input[^>]*disabled/.test(dis)) fail('input deveria estar disabled', dis);
const err = renderToStaticMarkup(h(Select, { options: opts, error: 'Campo obrigatório' }));
if (!err.includes('Campo obrigatório')) fail('mensagem de erro ausente', err);
const noErr = renderToStaticMarkup(h(Select, { options: opts }));
if (noErr.includes('Campo obrigatório')) fail('erro não deveria aparecer', noErr);

// opções em objeto e width numérico
const obj = renderToStaticMarkup(h(Select, { options: [{ label: 'Alfa' }], value: 'Alfa', width: 280 }));
if (!obj.includes('value="Alfa"') || !obj.includes('width:280px')) fail('opção objeto/width', obj);

const padrao = renderToStaticMarkup(h(Select, { options: opts, defaultValue: 'Peru' }));
if (!padrao.includes('value="Peru"')) fail('defaultValue single deveria preencher o campo', padrao);
const padraoMulti = renderToStaticMarkup(h(Select, { options: opts, multi: true, defaultValue: ['Brasil', 'Chile'] }));
if (!padraoMulti.includes('Brasil') || !padraoMulti.includes('Chile') || padraoMulti.includes('Peru')) fail('defaultValue multi deveria renderizar os chips', padraoMulti);
const controlado = renderToStaticMarkup(h(Select, { options: opts, value: 'Chile', defaultValue: 'Peru' }));
if (!controlado.includes('value="Chile"') || controlado.includes('value="Peru"')) fail('value vence defaultValue', controlado);
const arrayNoSingle = renderToStaticMarkup(h(Select, { options: opts, value: ['Brasil'] }));
if (arrayNoSingle.includes('value="Brasil"')) fail('single ignora um valor que não é texto', arrayNoSingle);

if (!single.includes('flex-wrap:nowrap')) fail('single não deve quebrar linha em larguras estreitas', single);
if (!multi.includes('flex-wrap:wrap')) fail('multi deve quebrar linha para acomodar os chips', multi);

console.log('OK: single, multi (chips), placeholder, disabled, error, width');
