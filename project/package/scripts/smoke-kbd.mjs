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
if (!tecla.includes('background:var(--ob-bg-alt)')) fail('fundo por token', tecla);

const plano = render({ variant: 'plain' });
if (plano.includes('border') || plano.includes('background')) fail('plain não tem caixa', plano);
if (!plano.includes('>Ctrl</kbd>')) fail('plain mostra o texto', plano);

if (render({ size: 'sm' }) === render({ size: 'md' })) fail('size altera o espaçamento');
const escuro = render({ inverse: true });
if (escuro.includes('var(--ob-bg-alt)')) fail('inverse não usa o fundo claro', escuro);
if (!escuro.includes('color-mix(in srgb, var(--ob-surface) 16%, transparent)')) fail('inverse usa a superfície translúcida', escuro);
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(tecla + plano + escuro)) fail('nenhuma cor solta');
console.log('OK: Kbd (kbd semântico, key e plain, tamanhos, inverse, sem cores soltas)');
