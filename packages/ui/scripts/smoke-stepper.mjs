import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Stepper } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const steps = [{ label: 'Escopo' }, { label: 'Orçamento' }, { label: 'Aprovação' }];

const horizontal = renderToStaticMarkup(h(Stepper, { steps, current: 1 }));
if (!horizontal.includes('aria-current="step"')) fail('a etapa atual deveria ter aria-current=step', horizontal);
if (!horizontal.includes('Escopo') || !horizontal.includes('Orçamento') || !horizontal.includes('Aprovação')) fail('deveria renderizar os rótulos', horizontal);

for (const variant of ['vertical', 'bar', 'segmented', 'compact']) {
  const html = renderToStaticMarkup(h(Stepper, { steps, current: 1, variant }));
  if (!html.includes('Orçamento')) fail(`variant ${variant} deveria renderizar as etapas`, html);
}

const errorStep = renderToStaticMarkup(h(Stepper, { steps: [{ label: 'A' }, { label: 'B', status: 'error' }, { label: 'C' }], current: 2 }));
if (!errorStep.includes('var(--ob-danger)')) fail('status error deveria sobrepor o estado derivado', errorStep);

const clickable = renderToStaticMarkup(h(Stepper, { steps, current: 2, onStepClick: () => {} }));
if ((clickable.match(/<button/g) || []).length !== 2) fail('linear: só etapas concluídas (0 e 1) deveriam ser clicáveis', clickable);

const nonLinear = renderToStaticMarkup(h(Stepper, { steps, current: 0, linear: false, onStepClick: () => {} }));
if ((nonLinear.match(/<button/g) || []).length !== 2) fail('não linear: qualquer etapa não desabilitada deveria ser clicável', nonLinear);

{
  const etapas = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }];
  const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;
  for (const variante of ['horizontal', 'segmented', 'bar', 'vertical']) {
    for (const marcador of ['number', 'icon', 'dot']) {
      const html = renderToStaticMarkup(h(Stepper, { steps: etapas, current: 1, variant: variante, marker: marcador }));
      if (variante !== 'segmented' && contar(html, 'box-sizing:border-box') < etapas.length) fail('todo marcador usa box-sizing border-box para ter o mesmo tamanho em qualquer estado (' + variante + '/' + marcador + ')', html);
      if (variante !== 'bar' && contar(html, '<li[^>]*margin:0') !== etapas.length) fail('todo item da lista zera a margem, para o CSS de lista do host não deslocá-lo (' + variante + '/' + marcador + ')', html);
    }
  }
}
const comDica = [{ label: 'Escopo', hint: 'Entregáveis' }, { label: 'Orçamento' }, { label: 'Aprovação' }];
for (const [size, marcador, rotulo] of [['sm', 22, 'var(--ob-fs-12)'], ['md', 28, 'var(--ob-fs-14)'], ['lg', 34, 'var(--ob-fs-16)']]) {
  for (const variant of ['horizontal', 'vertical', 'bar']) {
    const html = renderToStaticMarkup(h(Stepper, { steps: comDica, current: 1, size, variant }));
    if (!html.includes('width:' + marcador + 'px;height:' + marcador + 'px')) fail('size ' + size + ' (' + variant + '): marcador de ' + marcador + 'px', html);
    if (!html.includes('font-size:' + rotulo)) fail('size ' + size + ' (' + variant + '): rótulo em ' + rotulo, html);
  }
}
if (renderToStaticMarkup(h(Stepper, { steps: comDica, current: 1, size: 'sm' })).includes('Entregáveis')) fail('sm esconde a dica');
if (!renderToStaticMarkup(h(Stepper, { steps: comDica, current: 1, size: 'lg' })).includes('Entregáveis')) fail('lg mostra a dica');
if (!renderToStaticMarkup(h(Stepper, { steps, current: 1, size: 'lg', variant: 'compact' })).includes('font-size:var(--ob-fs-18)')) fail('compact lg destaca a etapa em 18px');
console.log('OK: Stepper (aria-current, 5 variantes, status sobrepõe, linear/não-linear, tamanhos sm/md/lg)');
