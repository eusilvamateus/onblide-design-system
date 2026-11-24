import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Kbd } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, texto = 'Ctrl') => renderToStaticMarkup(React.createElement(Kbd, props, texto));

const tecla = render({});
if (!tecla.startsWith('<kbd') || !tecla.includes('>Ctrl</kbd>')) fail('usa o elemento semântico kbd', tecla);
if (!tecla.includes('font-family:var(--ob-font-mono)')) fail('fonte monoespaçada por token', tecla);
if (!tecla.includes('font-weight:var(--ob-w-medium)')) fail('peso médio', tecla);
if (!tecla.includes('height:24px') || !tecla.includes('min-width:24px')) fail('md tem altura fixa de 24px e é no mínimo quadrada', tecla);
if (!tecla.includes('border-bottom-width:2px')) fail('tecla com relevo embaixo', tecla);
if (!tecla.includes('color:var(--ob-fg)') || !tecla.includes('background:var(--ob-surface)') || !tecla.includes('border:1px solid var(--ob-border)')) fail('cores próprias, dos tokens, sem depender do texto ao redor', tecla);
if (tecla.includes('currentColor') || tecla.includes('color:inherit')) fail('a tecla não deriva a cor do contexto', tecla);
if (!tecla.includes('box-shadow:none')) fail('sem sombra, mesmo com estilo global de kbd na página', tecla);

const pequena = render({ size: 'sm' });
if (!pequena.includes('height:20px') || !pequena.includes('min-width:20px') || !pequena.includes('font-size:var(--ob-fs-11)')) fail('sm tem altura fixa de 20px e texto de 11px', pequena);

const plano = render({ appearance: 'ghost' });
if (!plano.includes('border:none') || !plano.includes('background:none') || !plano.includes('padding:0')) fail('ghost não tem caixa, mesmo com estilo global de kbd na página', plano);
if (!plano.includes('color:inherit') || !plano.includes('>Ctrl</kbd>')) fail('ghost mostra o texto na cor do contexto', plano);

const combinacao = renderToStaticMarkup(React.createElement(Kbd, { keys: ['Ctrl', 'Shift', 'P'] }));
const internas = combinacao.match(/<kbd style="[^"]*height:24px[^"]*">[^<]+<\/kbd>/g) ?? [];
if (!combinacao.startsWith('<kbd') || internas.length !== 3) fail('keys desenha uma tecla aninhada por item, dentro de um kbd externo', combinacao);
if (!['Ctrl', 'Shift', 'P'].every((t, i) => internas[i].endsWith(`>${t}</kbd>`))) fail('keys mantém a ordem das teclas', combinacao);
if (!/^<kbd style="[^"]*gap:var\(--ob-space-4\)/.test(combinacao)) fail('teclas da combinação separadas por espaço do token', combinacao);
const combinacaoPlana = renderToStaticMarkup(React.createElement(Kbd, { keys: ['⌘', 'N'], appearance: 'ghost', size: 'sm' }));
if ((combinacaoPlana.match(/padding:0/g) ?? []).length !== 3) fail('keys respeita ghost em todas as teclas', combinacaoPlana);
const soKeys = renderToStaticMarkup(React.createElement(Kbd, { keys: ['A'] }, 'ignorado'));
if (soKeys.includes('ignorado')) fail('keys substitui children', soKeys);

if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(tecla + plano + pequena + combinacao)) fail('nenhuma cor solta');
console.log('OK: Kbd (kbd semântico, cores próprias, altura fixa, outline e ghost, combinação em keys, sem cores soltas)');
