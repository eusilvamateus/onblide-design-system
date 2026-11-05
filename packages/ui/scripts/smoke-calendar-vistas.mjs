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
const d = (a, m, dia) => new Date(a, m - 1, dia);

const logica = await carregarTs('src/internal/calendarLogic.ts');
const datas = await carregarTs('src/internal/dates.ts');

igual(logica.inicioDoBlocoDeAnos(2026), 2016, 'bloco de anos alinhado em múltiplos de 12');
igual(logica.inicioDoBlocoDeAnos(2016), 2016, 'o primeiro ano do bloco abre o próprio bloco');
igual(logica.inicioDoBlocoDeAnos(2027), 2016, 'o último ano do bloco continua no bloco');
igual(logica.inicioDoBlocoDeAnos(2028), 2028, 'o ano seguinte começa outro bloco');
igual(logica.inicioDoBlocoDeAnos(5), 0, 'bloco para anos pequenos');
igual(logica.moverNaGrade(0, 'ArrowRight', 3, 12), 1, 'grade: seta direita');
igual(logica.moverNaGrade(2, 'ArrowRight', 3, 12), 3, 'grade: seta direita passa para a linha seguinte');
igual(logica.moverNaGrade(0, 'ArrowLeft', 3, 12), 0, 'grade: seta esquerda no primeiro item fica');
igual(logica.moverNaGrade(11, 'ArrowRight', 3, 12), 11, 'grade: seta direita no último item fica');
igual(logica.moverNaGrade(4, 'ArrowDown', 3, 12), 7, 'grade: seta abaixo anda uma linha');
igual(logica.moverNaGrade(10, 'ArrowDown', 3, 12), 10, 'grade: seta abaixo na última linha fica');
igual(logica.moverNaGrade(4, 'ArrowUp', 3, 12), 1, 'grade: seta acima anda uma linha');
igual(logica.moverNaGrade(1, 'ArrowUp', 3, 12), 1, 'grade: seta acima na primeira linha fica');
igual(logica.moverNaGrade(4, 'Home', 3, 12), 3, 'grade: Home vai ao início da linha');
igual(logica.moverNaGrade(4, 'End', 3, 12), 5, 'grade: End vai ao fim da linha');
igual(logica.moverNaGrade(4, 'x', 3, 12), null, 'grade: outras teclas são ignoradas');

const limites = { min: d(2026, 4, 15), max: d(2026, 10, 10) };
igual(logica.mesForaDosLimites(2026, 1, limites), true, 'fevereiro antes do mínimo');
igual(logica.mesForaDosLimites(2026, 2, limites), true, 'março antes do mínimo');
igual(logica.mesForaDosLimites(2026, 3, limites), false, 'abril contém o mínimo');
igual(logica.mesForaDosLimites(2026, 8, limites), false, 'setembro está dentro');
igual(logica.mesForaDosLimites(2026, 9, limites), false, 'outubro contém o máximo');
igual(logica.mesForaDosLimites(2026, 10, limites), true, 'novembro depois do máximo');
igual(logica.mesForaDosLimites(2026, 0, {}), false, 'sem limites nada é bloqueado');
igual(logica.anoForaDosLimites(2025, limites), true, 'ano antes do mínimo');
igual(logica.anoForaDosLimites(2026, limites), false, 'ano do mínimo');
igual(logica.anoForaDosLimites(2027, limites), true, 'ano depois do máximo');
igual(datas.MESES_ABREVIADOS.length, 12, 'doze meses abreviados');

const dias = render({});
if (!dias.includes('aria-label="Escolher o mês, Outubro"') || !dias.includes('aria-label="Escolher o ano, 2026"')) fail('mês e ano do cabeçalho são botões', dias);
if (dias.includes('aria-label="Meses de')) fail('a vista padrão é a de dias', dias);

const meses = render({ openTo: 'months' });
if (!meses.includes('aria-label="Meses de 2026"')) fail('vista de meses', meses);
igual(contar(meses, 'aria-label="(?!Meses)[^"]+ de 2026"'), 12, 'doze meses na grade');
for (const abreviado of ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']) {
  if (!meses.includes(`>${abreviado}<`)) fail(`mês ${abreviado}`, meses);
}
igual(contar(meses, 'aria-selected="true"'), 1, 'o mês exibido fica marcado');
igual(contar(meses, 'tabindex="0"'), 1, 'um único mês na ordem de tab');
if (!meses.includes('aria-label="Ano anterior"') || !meses.includes('aria-label="Próximo ano"')) fail('setas passam de ano em ano na vista de meses', meses);
if (!meses.includes('aria-label="Escolher o ano, 2026"') || meses.includes('Escolher o mês')) fail('na vista de meses só o ano é botão', meses);
if (meses.includes('role="columnheader"')) fail('a vista de meses não tem dias da semana', meses);

const anos = render({ openTo: 'years' });
if (!anos.includes('aria-label="Anos de 2016 a 2027"')) fail('vista de anos', anos);
if (!anos.includes('2016 – 2027')) fail('título do bloco de anos', anos);
for (let a = 2016; a <= 2027; a++) if (!anos.includes(`>${a}<`)) fail(`ano ${a}`, anos);
igual(contar(anos, 'aria-selected="true"'), 1, 'o ano exibido fica marcado');
if (!anos.includes('aria-label="Anos anteriores"') || !anos.includes('aria-label="Próximos anos"')) fail('setas passam de 12 em 12 anos', anos);
if (!render({ openTo: 'years', month: new Date(2031, 0, 1) }).includes('aria-label="Anos de 2028 a 2039"')) fail('o bloco acompanha o ano exibido (2031 fica em 2028 a 2039)');

const mesesLimitados = render({ openTo: 'months', min: new Date(2026, 3, 15), max: new Date(2026, 8, 10) });
igual(contar(mesesLimitados, 'aria-disabled="true"'), 6, 'meses fora de min e max ficam desabilitados (jan a mar e out a dez)');
const anosLimitados = render({ openTo: 'years', min: new Date(2020, 5, 1), max: new Date(2030, 5, 1) });
igual(contar(anosLimitados, 'aria-disabled="true"'), 4, 'anos antes de 2020 ficam desabilitados');
igual(contar(render({ openTo: 'months', disabled: true }), 'aria-disabled="true"'), 12, 'disabled desabilita os meses');
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(meses + anos)) fail('nenhuma cor solta nas vistas de meses e anos');
const porMes = render({ precision: 'month', value: d(2026, 10, 1) });
if (!porMes.includes('aria-label="Meses de 2026"') || porMes.includes('role="columnheader"')) fail('precision month abre na grade de meses', porMes);
if (!/aria-label="Outubro de 2026"[^>]*>|aria-selected="true"[^>]*>\s*<button[^>]*aria-label="Outubro de 2026"/.test(porMes)) fail('precision month marca o mês selecionado', porMes);
const porMesOutroAno = render({ precision: 'month', value: d(2025, 10, 1), defaultMonth: d(2026, 1, 1) });
if (/aria-selected="true"[^>]*><button[^>]*aria-label="Outubro de 2026"/.test(porMesOutroAno)) fail('o mês selecionado só aparece marcado no ano dele', porMesOutroAno);
const porAno = render({ precision: 'year', value: d(2026, 1, 1) });
if (!porAno.includes('aria-label="Anos de 2016 a 2027"')) fail('precision year abre na grade de anos', porAno);
if (!/aria-selected="true"[^>]*><button[^>]*aria-label="2026"/.test(porAno)) fail('precision year marca o ano selecionado', porAno);
if (!render({ precision: 'month', openTo: 'days' }).includes('role="columnheader"')) fail('openTo explícito vence a vista da precisão');
if (!render({}).includes('aria-label="Outubro 2026"')) fail('sem precision a vista padrão continua sendo dias');

const fimDe = (data, precisao) => datas.fimPorPrecisao(data, precisao);
igual(fimDe(d(2026, 2, 10), 'month').getDate(), 28, 'fim do mês de fevereiro');
igual(fimDe(d(2028, 2, 10), 'month').getDate(), 29, 'fim do mês de fevereiro bissexto');
igual([fimDe(d(2026, 3, 10), 'year').getMonth(), fimDe(d(2026, 3, 10), 'year').getDate()], [11, 31], 'fim do ano é 31 de dezembro');
igual(fimDe(d(2026, 3, 10), 'day').getDate(), 10, 'fim do dia é o próprio dia');

const periodo = (atual, dia, precisao) => {
  const r = logica.cliqueNoPeriodo(atual, dia, precisao);
  const f = (x) => (x ? `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}` : null);
  return [f(r.start), f(r.end)];
};
const vazio = { start: null, end: null };
igual(periodo(vazio, d(2026, 8, 1), 'month'), ['2026-8-1', null], 'primeiro clique de mês define o início');
const primeiroMes = logica.cliqueNoPeriodo(vazio, d(2026, 8, 1), 'month');
igual(periodo(primeiroMes, d(2026, 10, 1), 'month'), ['2026-8-1', '2026-10-31'], 'segundo clique de mês fecha no último dia do mês');
igual(periodo(primeiroMes, d(2026, 6, 1), 'month'), ['2026-6-1', '2026-8-31'], 'clique anterior inverte e fecha o mês inicial');
igual(periodo(primeiroMes, d(2026, 8, 1), 'month'), ['2026-8-1', '2026-8-31'], 'um único mês vira o mês inteiro');
const primeiroAno = logica.cliqueNoPeriodo(vazio, d(2024, 1, 1), 'year');
igual(periodo(primeiroAno, d(2026, 1, 1), 'year'), ['2024-1-1', '2026-12-31'], 'intervalo de anos fecha em 31 de dezembro');
igual(periodo({ start: d(2026, 8, 1), end: d(2026, 10, 31) }, d(2026, 3, 1), 'month'), ['2026-3-1', null], 'com intervalo completo o clique recomeça');

const faixaDeMeses = render({ mode: 'range', precision: 'month', value: { start: d(2026, 8, 1), end: d(2026, 10, 31) } });
if (!faixaDeMeses.includes('aria-label="Meses de 2026"') || faixaDeMeses.includes('role="columnheader"')) fail('intervalo com precision month abre na grade de meses', faixaDeMeses);
if (contar(faixaDeMeses, 'aria-selected="true"') < 3) fail('o intervalo de meses marca os três meses', faixaDeMeses);
const faixaDeAnos = render({ mode: 'range', precision: 'year', value: { start: d(2024, 1, 1), end: d(2026, 12, 31) } });
if (!faixaDeAnos.includes('aria-label="Anos de 2016 a 2027"')) fail('intervalo com precision year abre na grade de anos', faixaDeAnos);
if (contar(faixaDeAnos, 'aria-selected="true"') < 3) fail('o intervalo de anos marca os três anos', faixaDeAnos);

console.log('OK: Calendar vistas (cabeçalho clicável, meses, anos em blocos de 12, limites, teclado em grade)');
