import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Datepicker } from '../dist/index.js';
import { carregarTs } from './lib/carregar-ts.mjs';

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
const d = (a, m, dia) => new Date(a, m - 1, dia);
const logica = await carregarTs('src/internal/calendarLogic.ts');
const hoje = d(2026, 10, 14);
const viz = (atual, unidade, sentido, limites = {}) => {
  const r = logica.vizinhaSelecionavel(atual, hoje, unidade, sentido, limites);
  return r ? `${r.getFullYear()}-${r.getMonth() + 1}-${r.getDate()}` : null;
};
const igual = (a, b, msg) => { if (a !== b) fail(msg, `esperado ${b}, veio ${a}`); };

igual(viz(d(2026, 10, 14), 'day', 1), '2026-10-15', 'seta para cima avança um dia');
igual(viz(d(2026, 10, 14), 'day', -1), '2026-10-13', 'seta para baixo volta um dia');
igual(viz(d(2026, 10, 31), 'day', 1), '2026-11-1', 'o dia vira o mês');
igual(viz(d(2026, 10, 14), 'month', 1), '2026-11-14', 'passo de mês avança um mês');
igual(viz(d(2026, 1, 31), 'month', 1), '2026-2-28', 'passo de mês limita ao último dia');
igual(viz(d(2026, 10, 14), 'year', -1), '2025-10-14', 'passo de ano volta um ano');
igual(viz(null, 'day', 1), '2026-10-14', 'campo vazio parte de hoje');
igual(viz(d(2026, 10, 14), 'day', 1, { isDateDisabled: (x) => x.getDay() === 0 || x.getDay() === 6 }), '2026-10-15', 'quarta para quinta sem pular');
igual(viz(d(2026, 10, 16), 'day', 1, { isDateDisabled: (x) => x.getDay() === 0 || x.getDay() === 6 }), '2026-10-19', 'pula o fim de semana');
igual(viz(d(2026, 10, 19), 'day', -1, { isDateDisabled: (x) => x.getDay() === 0 || x.getDay() === 6 }), '2026-10-16', 'pula o fim de semana para trás');
igual(viz(d(2026, 10, 5), 'day', -1, { min: d(2026, 10, 5) }), null, 'no mínimo não volta');
igual(viz(d(2026, 10, 20), 'day', 1, { max: d(2026, 10, 20) }), null, 'no máximo não avança');
igual(viz(d(2026, 10, 10), 'month', -1, { min: d(2026, 10, 5) }), '2026-10-5', 'passo de mês que ultrapassa o mínimo para no mínimo');
igual(viz(null, 'day', 1, { min: d(2026, 12, 1) }), '2026-12-1', 'campo vazio com mínimo futuro começa no mínimo');

const datas = await carregarTs('src/internal/dates.ts');
igual(datas.formatarPorPrecisao(d(2026, 10, 14), 'month'), '10/2026', 'precisão de mês mostra mm/aaaa');
igual(datas.formatarPorPrecisao(d(2026, 10, 14), 'year'), '2026', 'precisão de ano mostra aaaa');
igual(datas.formatarPorPrecisao(d(2026, 10, 14), 'day'), '14/10/2026', 'precisão de dia mostra dd/mm/aaaa');
igual(datas.mascararPorPrecisao('102026', 'month'), '10/2026', 'máscara de mês');
igual(datas.mascararPorPrecisao('1', 'month'), '1', 'máscara de mês parcial');
igual(datas.mascararPorPrecisao('20261', 'year'), '2026', 'máscara de ano limita a quatro dígitos');
igual(datas.interpretarPorPrecisao('10/2026', 'month')?.getDate(), 1, 'mês digitado vira o dia 1');
igual(datas.interpretarPorPrecisao('13/2026', 'month'), null, 'mês 13 é inválido');
igual(datas.interpretarPorPrecisao('2026', 'year')?.getMonth(), 0, 'ano digitado vira 1º de janeiro');
igual(datas.interpretarPorPrecisao('26', 'year'), null, 'ano exige quatro dígitos');
igual(datas.normalizarPorPrecisao(d(2026, 10, 14), 'month').getDate(), 1, 'normaliza para o primeiro dia do mês');
igual(datas.normalizarPorPrecisao(d(2026, 10, 14), 'year').getMonth(), 0, 'normaliza para janeiro');

const mesAMes = render({ stepper: 'month', value: d(2026, 10, 14) });
if (!mesAMes.includes('value="10/2026"') || !mesAMes.includes('maxLength="7"')) fail('stepper de mês mostra só mês e ano', mesAMes);
if (!render({ stepper: 'month' }).includes('placeholder="mm/aaaa"')) fail('placeholder de mês');
if (!mesAMes.includes('aria-label="Abrir calendário"')) fail('mês mantém o botão que abre a grade de meses', mesAMes);
const anoAAno = render({ stepper: 'year', value: d(2026, 10, 14) });
if (!anoAAno.includes('value="2026"') || !render({ stepper: 'year' }).includes('placeholder="aaaa"')) fail('stepper de ano mostra só o ano', anoAAno);
if (!render({ stepper: 'day', value: d(2026, 10, 14) }).includes('aria-label="Abrir calendário"')) fail('dia mantém o calendário');
if (!render({ stepper: 'day', value: d(2026, 10, 14) }).includes('text-align:center')) fail('o texto do campo é centralizado');
if (!render({ mode: 'range', value: { start: d(2026, 10, 5), end: d(2026, 10, 12) } }).includes('text-align:center')) fail('o texto dos campos do intervalo é centralizado');

const comStepper = render({ stepper: 'day', value: d(2026, 10, 14) });
if (!comStepper.includes('aria-label="Dia anterior"') || !comStepper.includes('aria-label="Próximo dia"')) fail('stepper de dia mostra as duas setas', comStepper);
const porMes = render({ stepper: 'month', value: d(2026, 10, 14) });
if (!porMes.includes('aria-label="Mês anterior"') || !porMes.includes('aria-label="Próximo mês"')) fail('stepper de mês nomeia as setas', porMes);
const porAno = render({ stepper: 'year', value: d(2026, 10, 14) });
if (!porAno.includes('aria-label="Ano anterior"') || !porAno.includes('aria-label="Próximo ano"')) fail('stepper de ano nomeia as setas', porAno);
if (render({}).includes('Dia anterior')) fail('sem stepper não há setas');
if (render({ mode: 'range', stepper: 'day' }).includes('Dia anterior')) fail('range ignora o stepper');
if (!/<button[^>]*disabled[^>]*aria-label="Próximo dia"|<button[^>]*aria-label="Próximo dia"[^>]*disabled/.test(render({ stepper: 'day', value: d(2026, 10, 20), max: d(2026, 10, 20) }))) fail('seta desabilita no máximo');
if (!/<button[^>]*disabled[^>]*aria-label="Dia anterior"|<button[^>]*aria-label="Dia anterior"[^>]*disabled/.test(render({ stepper: 'day', disabled: true }))) fail('disabled desativa as setas');

console.log('OK: Datepicker (single, range, inline, value/defaultValue, hint, erro, disabled, popover do Calendar)');
