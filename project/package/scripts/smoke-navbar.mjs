import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar, NavbarIconButton, NavbarAccount } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const items = [
  { id: 'inicio', label: 'Início' },
  { id: 'projetos', label: 'Projetos', badge: 3 },
];

const links = renderToStaticMarkup(h(Navbar, { items, active: 'projetos', onNav: () => {} }));
if (!links.includes('<header')) fail('deveria renderizar um <header>', links);
if (!links.includes('aria-label="Principal"')) fail('layout links deveria ter <nav aria-label="Principal">', links);
if (!links.includes('aria-current="page"')) fail('item ativo deveria marcar aria-current="page"', links);

const compact = renderToStaticMarkup(h(Navbar, { items, compact: true }));
if (compact.includes('aria-label="Principal"')) fail('compact deveria esconder a navegação principal', compact);

const search = renderToStaticMarkup(h(Navbar, { layout: 'search', search: h('input', { 'data-marker': 'busca' }) }));
if (!search.includes('data-marker="busca"')) fail('layout search deveria renderizar o conteúdo de search', search);

const context = renderToStaticMarkup(h(Navbar, { layout: 'context', crumbs: h('span', { 'data-marker': 'trilha' }, 'Trilha') }));
if (!context.includes('data-marker="trilha"')) fail('layout context deveria renderizar o conteúdo de crumbs', context);

const secondary = renderToStaticMarkup(h(Navbar, { items, secondary: h('div', { 'data-marker': 'abas' }) }));
if (!secondary.includes('data-marker="abas"')) fail('secondary deveria renderizar abaixo da barra', secondary);

const menuToggle = renderToStaticMarkup(h(Navbar, { items, onMenuToggle: () => {} }));
if (!menuToggle.includes('aria-label="Abrir navega')) fail('onMenuToggle deveria mostrar o botão de menu', menuToggle);

const elevated = renderToStaticMarkup(h(Navbar, { items, elevated: true }));
if (!elevated.includes('var(--ob-shadow-sm)')) fail('elevated deveria aplicar sombra', elevated);

const iconBtn = renderToStaticMarkup(h(NavbarIconButton, { icon: 'bell', label: 'Notificações', count: 3 }));
if (!iconBtn.includes('aria-label="Notificações"')) fail('NavbarIconButton deveria exigir aria-label', iconBtn);
if (!iconBtn.includes('ph-bell')) fail('NavbarIconButton deveria renderizar o ícone Phosphor', iconBtn);

const account = renderToStaticMarkup(h(NavbarAccount, { name: 'Marina Souza', email: 'marina@aurora.studio' }));
if (!account.includes('aria-label="Conta de Marina Souza"')) fail('NavbarAccount deveria expor aria-label com o nome', account);

console.log('OK: Navbar (layouts, item ativo/compacto, secondary, menuToggle, elevated, NavbarIconButton, NavbarAccount)');
