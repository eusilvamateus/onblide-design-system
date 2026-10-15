import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Datepicker } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Datepicker, props));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;

const unico = render({});
if (contar(unico, '<input') !== 1) fail('modo single tem um campo', unico);
if (!unico.includes('placeholder="dd/mm/aaaa"')) fail('placeholder padrão', unico);
if (!unico.includes('aria-label="Abrir calendário"')) fail('botão do calendário acessível', unico);
if (!unico.includes('aria-haspopup="dialog"')) fail('o gatilho anuncia o popover', unico);
if (unico.includes('role="grid"')) fail('o calendário só aparece aberto', unico);
if (!unico.includes('ph-calendar-blank')) fail('ícone Phosphor do calendário', unico);
if (!render({ placeholder: 'Escolha' }).includes('placeholder="Escolha"')) fail('placeholder personalizado');

const preenchido = render({ value: new Date(2026, 8, 15) });
if (!preenchido.includes('value="15/09/2026"')) fail('value preenche o campo formatado', preenchido);
if (!render({ defaultValue: new Date(2026, 0, 2) }).includes('value="02/01/2026"')) fail('defaultValue preenche o campo');

const intervalo = render({ mode: 'range', value: { start: new Date(2026, 9, 5), end: new Date(2026, 9, 12) } });
if (contar(intervalo, '<input') !== 2) fail('modo range tem dois campos', intervalo);
if (!intervalo.includes('value="05/10/2026"') || !intervalo.includes('value="12/10/2026"')) fail('range preenche início e fim', intervalo);
if (!intervalo.includes('aria-label="Data inicial"') || !intervalo.includes('aria-label="Data final"')) fail('campos do intervalo acessíveis', intervalo);
if (contar(intervalo, 'aria-label="Abrir calendário"') !== 1) fail('um único botão de calendário no range', intervalo);
if (!render({ mode: 'range', defaultValue: { start: new Date(2026, 9, 5), end: null } }).includes('value="05/10/2026"')) fail('range parcial');

const intervaloInline = render({ calendarDisplay: 'inline', mode: 'range', value: { start: new Date(2026, 9, 5), end: new Date(2026, 9, 12) } });
if (contar(intervaloInline, '<input') !== 2) fail('modo inline preserva os dois campos', intervaloInline);
if (!intervaloInline.includes('role="grid"')) fail('modo inline mantém o calendário visível', intervaloInline);
if (intervaloInline.includes('aria-label="Abrir calendário"') || intervaloInline.includes('aria-haspopup="dialog"')) fail('modo inline não cria outro popover', intervaloInline);

const rotulado = render({ label: 'Entrega', hint: 'Dia útil' });
if (!rotulado.includes('Entrega') || !rotulado.includes('Dia útil')) fail('label e hint', rotulado);
const comErro = render({ label: 'Entrega', hint: 'Dia útil', error: 'Escolha uma data' });
if (!comErro.includes('Escolha uma data') || comErro.includes('Dia útil')) fail('erro substitui o hint', comErro);
if (!comErro.includes('aria-invalid="true"')) fail('erro marca o campo como inválido', comErro);
if (!comErro.includes('var(--ob-danger)')) fail('erro usa o token de perigo', comErro);

const desabilitado = render({ disabled: true });
if (!/<input[^>]*disabled/.test(desabilitado) || !/<button[^>]*disabled/.test(desabilitado)) fail('disabled desativa campo e botão', desabilitado);

for (const removida of ['singleDate', 'maxBookingDays', 'minBookingDate', 'showSubmitButton', 'resetOnSubmit', 'startDateLabel']) {
  const html = render({ [removida]: true });
  if (html.includes(removida)) fail(`prop de reserva ${removida} não deveria vazar para o HTML`, html);
}
if (!render({ min: new Date(2026, 0, 1), max: new Date(2026, 11, 31), isDateDisabled: () => false, weekStartsOn: 1 }).includes('<input')) fail('limites aceitos');
console.log('OK: Datepicker (single, range, inline, value/defaultValue, hint, erro, disabled, popover do Calendar)');
