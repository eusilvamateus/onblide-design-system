import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SideNav } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const items = [
  { id: 'acoes', label: 'Ações', children: [{ id: 'button', label: 'Botao-X' }] },
  { id: 'forms', label: 'Formulários', children: [{ id: 'input', label: 'Campo-Y' }] },
];

// O grupo que contém o item ativo começa aberto; os outros, fechados.
const a = renderToStaticMarkup(h(SideNav, { items, active: 'button', hideAccount: true }));
if (!a.includes('Botao-X')) fail('grupo com o item ativo deveria começar aberto', a);
if (a.includes('Campo-Y')) fail('grupo sem o item ativo deveria começar fechado', a);
if (!a.includes('aria-expanded="true"') || !a.includes('aria-expanded="false"')) fail('grupos deveriam expor aria-expanded', a);

// Sem children, o comportamento de antes continua.
const b = renderToStaticMarkup(h(SideNav, { items: [{ id: 'x', label: 'Simples' }], active: 'x' }));
if (!b.includes('Simples') || b.includes('aria-expanded')) fail('item simples não deveria virar grupo', b);

// Itens não encolhem numa coluna cheia (senão ficam esmagados), e o ativo não tem barra lateral sólida.
if ((b.match(/<button[^>]*flex:none/g) || []).length < 1) fail('itens deveriam ter flex:none', b);
if (b.includes('width:3px')) fail('item ativo não deveria ter barra lateral', b);
const c = renderToStaticMarkup(h(SideNav, { items: [{ id: 'x', label: 'Simples' }], flush: true }));
if (!c.includes('overflow-y:auto')) fail('no modo flush a lista deveria rolar', c);

const padrao = renderToStaticMarkup(h(SideNav, { items: [] }));
if (!padrao.includes('aria-label="Onblide"')) fail('sem brand, o topo deveria usar a logo da Onblide', padrao);
if (!padrao.includes('aria-label="Abrir menu de Conta"')) fail('o rodapé de conta deveria ser um gatilho de menu com aria-label', padrao);
if (padrao.includes('>Onblide<')) fail('o nome da marca não deveria aparecer como texto', padrao);

const marcaCustom = renderToStaticMarkup(h(SideNav, { items: [], brand: h('span', null, 'LogoAcme'), accountName: 'Equipe Acme', accountDetail: 'time@acme.com' }));
if (marcaCustom.includes('aria-label="Onblide"')) fail('brand customizado deveria substituir a logo da Onblide', marcaCustom);
if (!marcaCustom.includes('LogoAcme')) fail('brand deveria aparecer no topo', marcaCustom);
if (!marcaCustom.includes('aria-label="Abrir menu de Equipe Acme"')) fail('accountName deveria aparecer no aria-label do gatilho de conta', marcaCustom);
if (!marcaCustom.includes('time@acme.com') || !marcaCustom.includes('>EA<')) fail('accountDetail e as iniciais derivadas deveriam aparecer no rodapé', marcaCustom);

const semMarcaRecolhida = renderToStaticMarkup(h(SideNav, { items: [], collapsed: true, hideBrand: true, onToggle: () => {} }));
if (!semMarcaRecolhida.includes('aria-label="Abrir barra lateral"') || !semMarcaRecolhida.includes('ph-caret-right')) fail('recolhida sem marca, o botão de abrir deveria continuar existindo, com caret-right', semMarcaRecolhida);

const fechada = renderToStaticMarkup(h(SideNav, { items: [], onToggle: () => {} }));
if (!fechada.includes('aria-label="Fechar barra lateral"')) fail('com onToggle, a barra expandida deveria ter o botão de borda', fechada);
const semToggle = renderToStaticMarkup(h(SideNav, { items: [] }));
if (semToggle.includes('barra lateral')) fail('sem onToggle, não deveria haver botão de recolher', semToggle);
const recolhida = renderToStaticMarkup(h(SideNav, { items: [], collapsed: true, flush: true, onToggle: () => {} }));
if (!recolhida.includes('aria-label="Abrir barra lateral"')) fail('recolhida, a marca deveria virar o botão de abrir', recolhida);
if (!recolhida.includes('width:72px')) fail('recolhida mantém 72px mesmo com flush', recolhida);
if (recolhida.includes('Fechar barra lateral')) fail('recolhida não deveria ter o botão de borda', recolhida);

console.log('OK: SideNav (grupos recolhíveis, grupo ativo aberto, itens sem encolher, sem barra no ativo, logo e conta configuráveis, botão de borda e de abrir, reabrir sem marca)');
