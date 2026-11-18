import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimePicker } from '../dist/index.js';
import { carregarTs } from './lib/carregar-ts.mjs';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(TimePicker, props));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;
const igual = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); };
const texto = (html) => html.replace(/<[^>]+>/g, '');

const vazio = render({ label: 'Enviar às' });
igual(contar(vazio, 'role="spinbutton"'), 2, 'hora e minuto são duas partes editáveis');
if (!vazio.includes('aria-label="Enviar às, horas"') || !vazio.includes('aria-label="Enviar às, minutos"')) fail('as partes levam o rótulo do campo', vazio);
if (!vazio.includes('role="group" aria-label="Enviar às"')) fail('as partes formam um grupo com o nome do campo', vazio);
if (!texto(vazio).includes('--:--')) fail('vazio mostra --:--', vazio);
if (!vazio.includes('aria-label="Abrir horários"') || !vazio.includes('aria-haspopup="dialog"')) fail('o gatilho abre o popover', vazio);
if (!vazio.includes('ph-clock')) fail('ícone Phosphor do relógio', vazio);
if (vazio.includes('role="listbox"') || vazio.includes('role="slider"')) fail('a escolha só aparece aberta', vazio);

const cheio = render({ value: '14:30' });
if (!texto(cheio).includes('14:30')) fail('value preenche as partes', cheio);
if (!cheio.includes('aria-valuenow="14"') || !cheio.includes('aria-valuenow="30"')) fail('as partes anunciam o valor', cheio);
if (!cheio.includes('aria-label="Horário, horas"')) fail('sem rótulo, o campo se chama Horário', cheio);
if (!render({ ariaLabel: 'Início do turno', value: '08:00' }).includes('aria-label="Início do turno, horas"')) fail('ariaLabel nomeia o campo');
if (!texto(render({ defaultValue: '07:05' })).includes('07:05')) fail('defaultValue preenche o campo');

const doze = render({ value: '16:07', hourCycle: 12 });
igual(contar(doze, 'role="spinbutton"'), 3, 'em 12 horas há a parte AM/PM');
if (!texto(doze).includes('04:07PM')) fail('16:07 aparece como 04:07 PM', texto(doze));
if (!texto(render({ value: '00:15', hourCycle: 12 })).includes('12:15AM')) fail('meia-noite aparece como 12 AM');

const segundos = render({ value: '07:05:32', precision: 'second' });
igual(contar(segundos, 'role="spinbutton"'), 3, 'com segundos há três partes');
if (!texto(segundos).includes('07:05:32')) fail('precision second mostra os segundos', segundos);

const fora = render({ label: 'Enviar às', value: '23:10', max: '22:00', hint: 'Até 22:00' });
if (!fora.includes('Horário indisponível') || fora.includes('Até 22:00')) fail('fora do limite avisa no lugar do hint', fora);
if (!fora.includes('aria-invalid="true"') || !fora.includes('var(--ob-danger)')) fail('fora do limite marca as partes e usa o token de perigo', fora);
if (render({ value: '21:00', max: '22:00' }).includes('Horário indisponível')) fail('dentro do limite não avisa');
if (!render({ value: '12:00', isTimeDisabled: (t) => t === '12:00' }).includes('Horário indisponível')) fail('isTimeDisabled vale para o valor');
const externo = render({ value: '10:00', error: 'Escolha outro', hint: 'Dica' });
if (!externo.includes('Escolha outro') || externo.includes('Dica')) fail('error substitui o hint', externo);

const desabilitado = render({ value: '10:00', disabled: true });
if (!/<button[^>]*disabled/.test(desabilitado) || !desabilitado.includes('tabindex="-1"') || !desabilitado.includes('aria-disabled="true"')) fail('disabled tira as partes do foco e desativa o gatilho', desabilitado);

const faixa = render({ mode: 'range', label: 'Atendimento', value: { start: '08:00', end: '17:48' } });
igual(contar(faixa, 'role="group"'), 2, 'o período tem início e fim');
if (!faixa.includes('aria-label="Atendimento, início"') || !faixa.includes('aria-label="Atendimento, fim"')) fail('início e fim levam o rótulo', faixa);
if (!texto(faixa).includes('9h48')) fail('o período mostra a duração', texto(faixa));
igual(contar(faixa, 'aria-label="Abrir horários"'), 1, 'um único gatilho no período');
const invertida = render({ mode: 'range', value: { start: '18:00', end: '09:00' } });
if (!invertida.includes('O fim deve ser depois do início')) fail('fim antes do início avisa', invertida);
if (!texto(render({ mode: 'range', defaultValue: { start: '09:15', end: null } })).includes('09:15')) fail('período parcial');

const larguras = ['sm', 'md', 'lg'].map((size) => Number(render({ size }).match(/width:(\d+)px;max-width:100%/)?.[1]));
if (!(larguras[0] < larguras[1] && larguras[1] < larguras[2])) fail('a largura do campo cresce com o tamanho', larguras);
if (!render({ width: '100%' }).includes('width:100%;max-width:100%')) fail('width substitui a largura do horário');

const h = await carregarTs('src/internal/horario.ts');
igual(h.lerHorario('9:05'), { h: 9, m: 5, s: 0 }, 'lê hora com um dígito');
igual(h.lerHorario('23:59:59'), { h: 23, m: 59, s: 59 }, 'lê segundos');
for (const invalido of ['', '24:00', '12:60', '12', 'aa:bb', null]) igual(h.lerHorario(invalido), null, `"${invalido}" não é horário`);
igual(h.exibirHorario('00:30', 12), '12:30 AM', 'meia-noite e meia em 12 horas');
igual(h.exibirHorario('12:00', 12), '12:00 PM', 'meio-dia em 12 horas');
igual(h.exibirHorario('07:05:09', 24, true), '07:05:09', 'exibe segundos');
igual(h.duracao('08:00', '17:48'), '9h48', 'duração com horas e minutos');
igual(h.duracao('08:00', '10:00'), '2h', 'duração redonda');
igual(h.duracao('08:00', '08:45'), '45 min', 'duração curta');
igual(h.duracao('10:00', '09:00'), null, 'fim antes do início não tem duração');
igual(h.para24(12, 'AM'), 0, '12 AM é 0h');
igual(h.para24(12, 'PM'), 12, '12 PM é 12h');
igual(h.agora(15, new Date(2026, 0, 1, 9, 53, 10)), { h: 10, m: 0, s: 0 }, 'agora arredonda para o passo e vira a hora');
const regras = h.regrasDe({ min: '08:00', max: '20:00' }, 15, false);
igual(regras.minutos, [0, 15, 30, 45], 'passo de 15 minutos');
igual([regras.horaLivre(7), regras.horaLivre(8), regras.horaLivre(20), regras.horaLivre(21)], [false, true, true, false], 'horas fora do limite ficam indisponíveis');
igual(regras.ajustar(20, 30, 0), { h: 20, m: 0, s: 0 }, 'trocar a hora leva o minuto para o primeiro livre');
igual(h.regrasDe({ depoisDe: '09:00' }, 1, false).minutoLivre(9, 0), false, 'o fim não pode ser igual ao início');

console.log('OK: TimePicker (partes editáveis, rótulos, 12 e 24 horas, segundos, limites, erro, desabilitado, período e duração, largura por tamanho) e a lógica de horários');
