import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icons, Ph } from '../dist/index.js';

// Tabela independente (conferida contra o UI kit antigo na Fase 4, antes da remoção): chave da API -> glifo Phosphor.
const esperado = {
  search: 'magnifying-glass', house: 'house', user: 'user', chart: 'chart-line',
  gear: 'gear', bell: 'bell', plus: 'plus', check: 'check', x: 'x',
  arrowR: 'arrow-right', caretD: 'caret-down', caretL: 'caret-left', caretR: 'caret-right',
  folder: 'folder', file: 'file', calendar: 'calendar', kanban: 'kanban',
  bolt: 'lightning', chat: 'chat-text', logout: 'sign-out', star: 'star', heart: 'heart',
  more: 'dots-three', grid: 'squares-four', sync: 'arrows-clockwise', link: 'link',
  info: 'info', arrowSquareOut: 'arrow-square-out',
};

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const chaves = Object.keys(esperado).sort().join(',');
const reais = Object.keys(Icons).sort().join(',');
if (chaves !== reais) fail('conjunto de chaves de Icons difere da tabela', { esperado: chaves, reais });
if (Object.keys(esperado).length !== 28) fail('a tabela esperada deveria ter 28 ícones');

for (const [chave, glifo] of Object.entries(esperado)) {
  const html = renderToStaticMarkup(Icons[chave]({ size: 18 }));
  if (!html.includes(`class="ph ph-${glifo}"`)) fail(`Icons.${chave} deveria renderizar ph-${glifo}`, html);
  if (!html.includes('font-size:18px')) fail(`Icons.${chave} deveria respeitar size=18`, html);
  if (!html.includes('aria-hidden="true"')) fail(`Icons.${chave} deveria ser aria-hidden`, html);
}

// Uso como componente JSX (Icons.check com props vazias) -> tamanho padrão 20.
const padrao = renderToStaticMarkup(React.createElement(Icons.check));
if (!padrao.includes('font-size:20px')) fail('tamanho padrão deveria ser 20px', padrao);

// style repassado e mesclado depois dos estilos base.
const comStyle = renderToStaticMarkup(Icons.plus({ size: 12, style: { color: 'red' } }));
if (!comStyle.includes('color:red') || !comStyle.includes('font-size:12px')) fail('style/size não repassados', comStyle);

// Icons é construído sobre Ph: cada entrada renderiza exatamente o <Ph> do glifo,
// com o tamanho padrão 20 do registro (o padrão do Ph sozinho é 18).
for (const [chave, glifo] of Object.entries(esperado)) {
  const viaPh = renderToStaticMarkup(React.createElement(Ph, { n: glifo, size: 20 }));
  if (renderToStaticMarkup(Icons[chave]()) !== viaPh) fail(`Icons.${chave} deveria renderizar como <Ph n="${glifo}" size={20}/>`, renderToStaticMarkup(Icons[chave]()));
}

console.log('OK: 28 ícones mapeiam para os glifos Phosphor esperados');
