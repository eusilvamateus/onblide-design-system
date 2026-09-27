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

console.log('OK: Stepper (aria-current, 5 variantes, status sobrepõe, linear/não-linear)');
