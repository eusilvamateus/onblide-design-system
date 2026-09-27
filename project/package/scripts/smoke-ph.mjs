import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ph, Icons, Checkbox } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// Tamanho e cor chegam ao glifo.
const basico = renderToStaticMarkup(h(Ph, { n: 'check', size: 20, c: '#fff' }));
if (!basico.includes('ph ph-check') || !basico.includes('font-size:20px') || !basico.includes('color:#fff')) fail('tamanho/cor não aplicados', basico);

// Regular usa a classe base "ph"; os outros pesos usam "ph-<peso>" (classes do @phosphor-icons/web).
const regular = renderToStaticMarkup(h(Ph, { n: 'house' }));
if (!regular.includes('class="ph ph-house"')) fail('peso padrão deveria ser regular', regular);
for (const peso of ['thin', 'light', 'bold', 'fill', 'duotone']) {
  const html = renderToStaticMarkup(h(Ph, { n: 'house', weight: peso }));
  if (!html.includes(`class="ph-${peso} ph-house"`)) fail(`peso ${peso} com classe errada`, html);
}
// Caixa quadrada do tamanho do ícone, para o glifo centralizar.
if (!regular.includes('width:18px;height:18px')) fail('ícone deveria ocupar uma caixa quadrada do tamanho', regular);

// O registro Icons repassa o peso.
const reg = renderToStaticMarkup(Icons.star({ weight: 'fill' }));
if (!reg.includes('class="ph-fill ph-star"')) fail('Icons deveria repassar o peso', reg);

// Checkbox: check é o check-fat (fill) oficial do Phosphor em 12px; o traço é o minus bold com contorno extra
// para ter a mesma espessura (@phosphor-icons/core).
const marcado = renderToStaticMarkup(h(Checkbox, { checked: true, label: 'x' }));
const parcial = renderToStaticMarkup(h(Checkbox, { checked: false, indeterminate: true, label: 'x' }));
if (!marcado.includes('<svg width="12" height="12"') || !marcado.includes('M243.31,90.91')) fail('check deveria ser o check-fat fill do Phosphor em 12px', marcado);
if (marcado.includes('stroke-width')) fail('check-fat não deveria ter contorno extra', marcado);
if (!parcial.includes('<svg width="12" height="12"') || !parcial.includes('M228,128') || !parcial.includes('stroke-width="37"')) fail('traço deveria ser o minus bold do Phosphor em 12px com contorno 37', parcial);

console.log('OK: Ph (6 pesos, caixa quadrada), Icons repassa peso, Checkbox com check-fat e minus engrossado do Phosphor');
