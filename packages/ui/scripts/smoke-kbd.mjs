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
if (!tecla.includes('border-bottom-width:2px')) fail('tecla com relevo embaixo', tecla);
if (!tecla.includes('background:color-mix(in srgb, currentColor 10%, transparent)')) fail('fundo derivado da cor do texto ao redor', tecla);
if (!tecla.includes('border:1px solid color-mix(in srgb, currentColor 30%, transparent)')) fail('contorno derivado da cor do texto ao redor', tecla);
if (!tecla.includes('color:inherit') || !tecla.includes('box-shadow:none')) fail('cor e sombra vêm do contexto, mesmo com estilo global de kbd na página', tecla);
if (/color:(?!inherit)/.test(tecla.replace(/color-mix/g, '').replace(/background-color/g, ''))) fail('nenhuma cor própria: o texto herda do contexto', tecla);

const plano = render({ appearance: 'ghost' });
if (!plano.includes('border:none') || !plano.includes('background:none') || !plano.includes('padding:0')) fail('ghost não tem caixa, mesmo com estilo global de kbd na página', plano);
if (!plano.includes('>Ctrl</kbd>')) fail('ghost mostra o texto', plano);

if (render({ size: 'sm' }) === render({ size: 'md' })) fail('size altera o espaçamento');
if (render({ inverse: true }) !== tecla) fail('a prop inverse não existe mais: a cor vem do contexto');
const escuro = tecla;
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(tecla + plano + escuro)) fail('nenhuma cor solta');
console.log('OK: Kbd (kbd semântico, outline e ghost, tamanhos, cor herdada do contexto, sem cores soltas)');
