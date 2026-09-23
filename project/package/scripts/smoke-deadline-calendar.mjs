import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DeadlineCalendar } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(DeadlineCalendar, {
  referenceDate: '2026-09-18',
  production: { startDate: '2026-09-21', endDate: '2026-09-23' },
  delivery: { startDate: '2026-09-24', endDate: '2026-09-29' },
  estimatedDate: '2026-09-29',
  holidays: [{ date: '2026-09-25', name: 'Feriado de demonstração' }],
}));

const checks = [
  ['mês/ano', /Setembro(<!-- -->)? de (<!-- -->)?2026/.test(html)],
  ['30 dias', html.includes('aria-label="30 de Setembro') && !html.includes('aria-label="31 de Setembro')],
  ['2 blanks (1/set/2026 = terça)', (html.match(/aria-hidden="true" style="min-height:28px"/g) || []).length === 2],
  ['feriado', html.includes('Feriado nacional: Feriado de demonstração')],
  ['estimada', html.includes('Data estimada de entrega') && html.includes('inset 0 0 0 2px var(--ob-green-700)')],
  ['produção', html.includes('background:var(--ob-blue-100);color:var(--ob-blue-700)')],
  ['entrega', html.includes('background:var(--ob-success-bg);color:var(--ob-green-700)')],
  ['mês anterior desabilitado', /aria-label="Mês anterior" disabled=""/.test(html)],
  ['próximo desabilitado (min=max)', /aria-label="Próximo mês" disabled=""/.test(html)],
  ['nota nacional', html.includes('Previsão considera fins de semana e feriados nacionais.')],
];

const pending = renderToStaticMarkup(React.createElement(DeadlineCalendar, { referenceDate: '2026-09-18', deliveryPending: true }));
checks.push(['deliveryPending', pending.includes('Selecione uma opção de frete')]);
const nonNat = renderToStaticMarkup(React.createElement(DeadlineCalendar, { referenceDate: '2026-09-18', estimatedDate: '2026-09-29', holidayCoverage: 'none' }));
checks.push(['cobertura não nacional', nonNat.includes('Feriados nacionais indisponíveis')]);

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) { console.error('FAIL:', failed.map(([n]) => n), html); process.exit(1); }
console.log('OK:', checks.length, 'checks');
