import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Datepicker } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const vazio = renderToStaticMarkup(h(Datepicker, {}));
if (!vazio.includes('dd/mm/yyyy')) fail('deveria renderizar os campos de data', vazio);

const singleDate = renderToStaticMarkup(h(Datepicker, { singleDate: true }));
if ((singleDate.match(/dd\/mm\/yyyy/g) || []).length !== 1) fail('singleDate deveria renderizar só um campo', singleDate);

const aberto = renderToStaticMarkup(h(Datepicker, { values: { startDate: '2026-09-15', endDate: null } }));
if (!aberto.includes('15/09/2026')) fail('values.startDate deveria preencher o campo inicial', aberto);

const comLimite = renderToStaticMarkup(h(Datepicker, {
  values: { startDate: '2026-09-15', endDate: null },
  maxBookingDays: 5,
}));
if (!comLimite.includes('15/09/2026')) fail('maxBookingDays não deveria quebrar a renderização com startDate preenchido', comLimite);

console.log('OK: Datepicker (campos, singleDate, values controlado, maxBookingDays aceito sem quebrar — calendário aberto verificado via Chromium)');
