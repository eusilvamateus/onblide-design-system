import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScrollArea } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const render = (props) => renderToStaticMarkup(h(ScrollArea, props, h('p', null, 'conteúdo')));

const padrao = render({});
if (!padrao.includes('data-visibilidade="hover"')) fail('visibilidade padrão deveria ser hover', padrao);
if (!padrao.includes('overflow-y:auto') || !padrao.includes('overflow-x:hidden')) fail('padrão deveria rolar só na vertical', padrao);
if (!padrao.includes('>conteúdo<')) fail('deveria renderizar o conteúdo', padrao);
if (padrao.includes('ob-sa-barra')) fail('sem conteúdo a rolar não deveria desenhar barra', padrao);
if (padrao.includes('tabindex')) fail('sem conteúdo a rolar a região não deveria entrar na ordem de tabulação', padrao);

const horizontal = render({ orientation: 'horizontal' });
if (!horizontal.includes('overflow-x:auto') || !horizontal.includes('overflow-y:hidden')) fail('horizontal deveria rolar só no eixo X', horizontal);
const ambos = render({ orientation: 'both' });
if (!ambos.includes('overflow-x:auto') || !ambos.includes('overflow-y:auto')) fail('both deveria rolar nos dois eixos', ambos);

const dimensionada = render({ maxHeight: 240, height: 100 });
if (!dimensionada.includes('max-height:240px') || !dimensionada.includes('height:100px')) fail('height e maxHeight deveriam ir para a raiz', dimensionada);

const rotulada = render({ ariaLabel: 'Lista de promoções' });
if (!rotulada.includes('role="region"') || !rotulada.includes('aria-label="Lista de promoções"')) fail('ariaLabel deveria nomear a região', rotulada);
if (padrao.includes('role="region"')) fail('sem ariaLabel não deveria haver role', padrao);

if (!render({ visibility: 'auto' }).includes('data-visibilidade="auto"')) fail('visibility auto');
if (!render({ visibility: 'always' }).includes('data-visibilidade="always"')) fail('visibility always');

console.log('OK: ScrollArea (eixos, visibilidade, dimensões, região nomeada)');
