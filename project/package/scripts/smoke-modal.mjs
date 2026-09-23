import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Modal } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, children) => renderToStaticMarkup(React.createElement(Modal, props, children));

// Importar o módulo sob Node não pode lançar (injeção de keyframes com guard de `document`).
if (render({ open: false, title: 'x' }, 'y') !== '') fail('open=false deveria renderizar vazio');

const aberto = render({ open: true, title: 'Título', footer: 'Rodapé' }, 'Corpo');
if (!aberto.includes('<h3') || !aberto.includes('>Título</h3>')) fail('título não renderizado', aberto);
if (!aberto.includes('Corpo') || !aberto.includes('Rodapé')) fail('corpo/rodapé não renderizados', aberto);
if (!aberto.includes('position:fixed') || !aberto.includes('animation:ob-fade 160ms ease-out')) fail('backdrop', aberto);
if (!aberto.includes('animation:ob-pop 200ms var(--ob-ease-spring)')) fail('animação do painel', aberto);
if (!aberto.includes('ph-x') || !aberto.includes('font-size:18px')) fail('ícone de fechar (Icons.x 18px)', aberto);
if (!aberto.includes('width:440px')) fail('largura padrão (md) deveria ser 440px', aberto);
if (!aberto.includes('border-top:1px solid var(--ob-border)')) fail('rodapé deveria ter borda superior', aberto);

const larguras = { sm: 'width:360px', md: 'width:440px', lg: 'width:720px', full: 'width:92vw' };
for (const [size, css] of Object.entries(larguras)) {
  const html = render({ open: true, size, title: 't' }, 'c');
  if (!html.includes(css)) fail(`size=${size} deveria gerar ${css}`, html);
}

const custom = render({ open: true, width: 500, title: 't' }, 'c');
if (!custom.includes('width:500px')) fail('width explícito deveria vencer o size', custom);

const semRodape = render({ open: true, title: 't' }, 'c');
if (semRodape.includes('border-top:1px solid var(--ob-border)')) fail('sem footer não deveria renderizar o rodapé', semRodape);

// Acessibilidade (Fase 3): role, aria-modal, título associado e botão de fechar com nome.
const a11y = render({ open: true, title: 'Título' }, 'c');
if (!a11y.includes('role="dialog"') || !a11y.includes('aria-modal="true"')) fail('role="dialog" / aria-modal', a11y);
const rotulado = a11y.match(/aria-labelledby="([^"]+)"/);
const idTitulo = a11y.match(/<h3 id="([^"]+)"/);
if (!rotulado || !idTitulo || rotulado[1] !== idTitulo[1]) fail('aria-labelledby deveria apontar para o id do <h3>', a11y);
if (!a11y.includes('aria-label="Fechar"')) fail('botão de fechar sem nome acessível', a11y);
if (render({ open: true }, 'c').includes('aria-labelledby')) fail('sem título não deveria ter aria-labelledby');
// Dois modais abertos na mesma página não podem compartilhar o id do título.
const dois = renderToStaticMarkup(React.createElement('div', null,
  React.createElement(Modal, { open: true, title: 'A' }, 'a'),
  React.createElement(Modal, { open: true, title: 'B' }, 'b')));
const ids = [...dois.matchAll(/<h3 id="([^"]+)"/g)].map((m) => m[1]);
if (ids.length !== 2 || ids[0] === ids[1]) fail('ids de título deveriam ser únicos por instância', ids);

console.log('OK: Modal (fechado, aberto, tamanhos, largura explícita, rodapé opcional, acessibilidade)');
