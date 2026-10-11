import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Calendar } from '../dist/index.js';
import { carregarTs } from './lib/carregar-ts.mjs';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};
const render = (props) => renderToStaticMarkup(React.createElement(Calendar, { defaultMonth: new Date(2026, 9, 1), ...props }));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;

const logica = await carregarTs('src/internal/calendarLogic.ts');
const datas = await carregarTs('src/internal/dates.ts');
const d = (a, m, dia) => new Date(a, m - 1, dia);

igual(datas.formatarData(d(2026, 10, 5)), '05/10/2026', 'formatarData');
igual(datas.interpretarData('31/02/2026'), null, 'interpretarData rejeita 31/02');
igual(datas.interpretarData('29/02/2028')?.getDate(), 29, 'interpretarData aceita ano bissexto');
igual(datas.interpretarData('5/10/2026'), null, 'interpretarData exige dois dígitos');
igual(datas.mascararData('05102026'), '05/10/2026', 'mascararData');
igual(datas.mascararData('0510'), '05/10', 'mascararData parcial');
igual(datas.mascararData('ab12cd'), '12', 'mascararData ignora letras');
igual(datas.paraIso(d(2026, 1, 9)), '2026-01-09', 'paraIso');
igual(datas.somarMeses(d(2026, 1, 31), 1).getDate(), 28, 'somarMeses limita ao último dia do mês');
igual(datas.somarMeses(d(2026, 12, 15), 1).getFullYear(), 2027, 'somarMeses vira o ano');
igual(datas.diasNoMes(2028, 1), 29, 'fevereiro bissexto');

const celulas = logica.celulasDoMes(d(2026, 10, 1), 0);
igual(celulas.filter(Boolean).length, 31, 'outubro tem 31 dias');
igual(celulas.findIndex(Boolean), 4, 'outubro de 2026 começa numa quinta-feira (4 vazios com semana no domingo)');
igual(logica.celulasDoMes(d(2026, 10, 1), 1).findIndex(Boolean), 3, 'semana na segunda: 3 vazios');

const inicial = { start: null, end: null };
const primeiro = logica.cliqueNoIntervalo(inicial, d(2026, 10, 10));
igual([primeiro.start?.getDate(), primeiro.end], [10, null], 'primeiro clique define o início');
const segundo = logica.cliqueNoIntervalo(primeiro, d(2026, 10, 15));
igual([segundo.start?.getDate(), segundo.end?.getDate()], [10, 15], 'segundo clique define o fim');
const anterior = logica.cliqueNoIntervalo(primeiro, d(2026, 10, 3));
igual([anterior.start?.getDate(), anterior.end?.getDate()], [3, 10], 'clique anterior ao início inverte o intervalo');
const terceiro = logica.cliqueNoIntervalo(segundo, d(2026, 10, 20));
igual([terceiro.start?.getDate(), terceiro.end], [20, null], 'clique com intervalo completo recomeça');
const mesmoDia = logica.cliqueNoIntervalo(primeiro, d(2026, 10, 10));
igual([mesmoDia.start?.getDate(), mesmoDia.end?.getDate()], [10, 10], 'mesmo dia vira intervalo de um dia');

igual(logica.dentroDoIntervalo(d(2026, 10, 12), segundo, null), true, 'dia dentro do intervalo');
igual(logica.dentroDoIntervalo(d(2026, 10, 10), segundo, null), false, 'extremos não contam como interior');
igual(logica.dentroDoIntervalo(d(2026, 10, 12), primeiro, d(2026, 10, 15)), true, 'prévia ao passar o mouse');
igual(logica.dentroDoIntervalo(d(2026, 10, 12), primeiro, null), false, 'sem prévia e sem fim, nada dentro');
igual(logica.dentroDoIntervalo(d(2026, 10, 5), primeiro, d(2026, 10, 3)), true, 'prévia para trás também');

igual([0, 1, 2, 3, 4, 5].map((i) => logica.posicaoNaFaixa(i, 1, 4, null)), [null, 'inicio', 'dentro', 'dentro', 'fim', null], 'faixa de meses ou anos confirmada');
igual([0, 1, 2, 3].map((i) => logica.posicaoNaFaixa(i, 1, null, 3)), [null, 'inicio', 'dentro', 'alvo'], 'prévia da faixa ao passar o mouse');
igual([0, 1, 2, 3].map((i) => logica.posicaoNaFaixa(i, 2, null, 0)), ['alvo', 'dentro', 'inicio', null], 'prévia da faixa para trás');
igual([0, 1].map((i) => logica.posicaoNaFaixa(i, 1, null, null)), [null, 'inicio'], 'só o início, sem prévia');
igual(logica.posicaoNaFaixa(3, null, null, 3), null, 'sem início não há faixa');

const sexta = d(2026, 10, 9);
igual(logica.moverFoco(sexta, 'ArrowRight', false, 0)?.getDate(), 10, 'seta direita');
igual(logica.moverFoco(sexta, 'ArrowLeft', false, 0)?.getDate(), 8, 'seta esquerda');
igual(logica.moverFoco(sexta, 'ArrowDown', false, 0)?.getDate(), 16, 'seta abaixo');
igual(logica.moverFoco(sexta, 'ArrowUp', false, 0)?.getDate(), 2, 'seta acima');
igual(logica.moverFoco(sexta, 'Home', false, 0)?.getDate(), 4, 'Home vai ao início da semana (domingo)');
igual(logica.moverFoco(sexta, 'End', false, 0)?.getDate(), 10, 'End vai ao fim da semana (sábado)');
igual(logica.moverFoco(sexta, 'Home', false, 1)?.getDate(), 5, 'Home com semana na segunda');
igual(logica.moverFoco(sexta, 'PageDown', false, 0)?.getMonth(), 10, 'PageDown avança um mês');
igual(logica.moverFoco(sexta, 'PageDown', true, 0)?.getFullYear(), 2027, 'Shift+PageDown avança um ano');
igual(logica.moverFoco(sexta, 'a', false, 0), null, 'outras teclas são ignoradas');

const limites = { min: d(2026, 10, 5), max: d(2026, 10, 20), isDateDisabled: (x) => x.getDay() === 0 };
igual(logica.diaDesabilitado(d(2026, 10, 4), limites), true, 'antes do mínimo');
igual(logica.diaDesabilitado(d(2026, 10, 21), limites), true, 'depois do máximo');
igual(logica.diaDesabilitado(d(2026, 10, 11), limites), true, 'domingo pela função');
igual(logica.diaDesabilitado(d(2026, 10, 12), limites), false, 'dia livre');
igual(logica.diaDoFoco(d(2026, 10, 1), null, null, d(2026, 9, 1)).getDate(), 1, 'sem referência, foca o dia 1');
igual(logica.diaDoFoco(d(2026, 10, 1), null, d(2026, 10, 14), d(2026, 10, 3)).getDate(), 14, 'foca a seleção do mês');
igual(logica.diaDoFoco(d(2026, 10, 1), null, null, d(2026, 10, 3)).getDate(), 3, 'foca hoje quando está no mês');

const mensal = render({});
if (!mensal.includes('Outubro 2026')) fail('título do mês', mensal);
if (!mensal.includes('role="grid"')) fail('grade acessível', mensal);
igual(contar(mensal, 'aria-label="\\d+ de outubro de 2026"'), 31, 'um botão por dia, com nome acessível');
if (!mensal.includes('aria-label="Mês anterior"') || !mensal.includes('aria-label="Próximo mês"')) fail('navegação de mês', mensal);
igual(contar(mensal, 'role="columnheader"'), 7, 'sete cabeçalhos de dia da semana');
igual(contar(mensal, 'tabindex="0"'), 1, 'um único dia na ordem de tab (roving tabindex)');
if (!/aria-label="Domingo"[^>]*>D</.test(mensal)) fail('cabeçalho começa no domingo por padrão', mensal);
const naSegunda = render({ weekStartsOn: 1 });
if (naSegunda.indexOf('aria-label="Segunda-feira"') > naSegunda.indexOf('aria-label="Domingo"')) fail('weekStartsOn=1 coloca segunda antes de domingo');

const unico = render({ value: new Date(2026, 9, 14) });
igual(contar(unico, 'aria-selected="true"'), 1, 'single marca um dia');
if (!/aria-label="14 de outubro de 2026"[^>]*style="[^"]*background:var\(--ob-blue\)/.test(unico)) fail('dia selecionado em destaque', unico);
if (unico.includes('aria-label="14 de outubro de 2026" tabindex="-1"')) fail('seleção deveria ser o dia focável');

const faixa = render({ mode: 'range', value: { start: new Date(2026, 9, 10), end: new Date(2026, 9, 14) } });
igual(contar(faixa, 'aria-selected="true"'), 5, 'range marca extremos e dias do meio');
igual(contar(faixa, 'background:var\\(--ob-blue-100\\)'), 3, 'três dias no meio do intervalo');
igual(contar(faixa, 'background:var\\(--ob-blue\\)'), 2, 'dois extremos');

const limitado = render({ min: new Date(2026, 9, 10), max: new Date(2026, 9, 20) });
igual(contar(limitado, 'aria-disabled="true"'), 9 + 11, 'dias fora de min/max ficam desabilitados');
const porFuncao = render({ isDateDisabled: (x) => x.getDay() === 0 });
igual(contar(porFuncao, 'aria-disabled="true"'), 4, 'domingos de outubro de 2026 desabilitados');
igual(contar(render({ disabled: true }), 'aria-disabled="true"'), 31, 'disabled desabilita todos os dias');
if (!render({ ariaLabel: 'Entrega' }).includes('aria-label="Entrega"')) fail('ariaLabel');
if (!render({ month: new Date(2027, 1, 1) }).includes('Fevereiro 2027')) fail('month controlado');
if (contar(render({ month: new Date(2028, 1, 1) }), 'aria-label="\\d+ de fevereiro de 2028"') !== 29) fail('fevereiro bissexto no calendário');
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(mensal)) fail('nenhuma cor solta', mensal);
console.log('OK: Calendar (datas, seleção única e intervalo, teclado, min/max, desabilitados, acessibilidade)');
