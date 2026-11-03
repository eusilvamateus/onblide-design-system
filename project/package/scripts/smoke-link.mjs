import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, children = 'Texto') => renderToStaticMarkup(React.createElement(Link, props, children));

const padrao = render({});
if (!padrao.startsWith('<a href="#"') || padrao.includes('target=') || padrao.includes('rel=')) fail('link padrão: href="#" e sem target/rel', padrao);
if (!padrao.includes('color:var(--ob-blue)') || !padrao.includes('text-decoration:none')) fail('link padrão: cor azul sem sublinhado', padrao);
if (!padrao.includes('font-size:inherit') || !padrao.includes('font-family:inherit')) fail('link padrão: herda tamanho e fonte do texto ao redor', padrao);
if (padrao.includes('ph-arrow-square-out')) fail('link interno não deveria ter ícone externo', padrao);

const subtle = render({ variant: 'subtle' });
if (!subtle.includes('color:var(--ob-fg);') && !subtle.includes('color:var(--ob-fg)"')) fail('subtle: cor --ob-fg', subtle);
const quiet = render({ variant: 'quiet' });
if (!quiet.includes('color:var(--ob-fg-soft)')) fail('quiet: cor --ob-fg-soft', quiet);

const externo = render({ href: 'https://onblide.com', external: true });
if (!externo.startsWith('<a href="https://onblide.com"')) fail('externo: href repassado', externo);
if (!externo.includes('target="_blank"') || !externo.includes('rel="noopener noreferrer"')) fail('externo: target/rel', externo);
if (!externo.includes('ph-arrow-square-out') || !externo.includes('font-size:13px')) fail('externo: ícone arrow-square-out 13px', externo);

if (!render({}, 'Olá').includes('Olá')) fail('children não renderizados');

console.log('OK: Link (variantes, externo, ícone)');
