import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as pacote from '../dist/index.js';

const { Navbar } = pacote;

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const items = [
  { id: 'inicio', label: 'Início', href: '/inicio' },
  { id: 'projetos', label: 'Projetos', href: '/projetos', badge: 3 },
  { id: 'ajuda', label: 'Ajuda' },
];

const links = renderToStaticMarkup(h(Navbar, { items, active: 'projetos', onNav: () => {} }));
if (!links.includes('<header')) fail('deveria renderizar um <header>', links);
if (!links.includes('aria-label="Principal"')) fail('layout links deveria ter <nav aria-label="Principal">', links);
if (!/<a href="\/projetos"[^>]*aria-current="page"/.test(links)) fail('item ativo deveria ser um link com aria-current="page"', links);
if (!/<button type="button" class="ob-navbar-link"[^>]*>Ajuda/.test(links)) fail('item sem href vira botão', links);
if (links.includes('href="#"')) fail('nenhum link falso com href="#"', links);
if (!links.includes('var(--ob-fg-mute)')) fail('contador neutro por padrão', links);
if (/<svg/.test(links)) fail('sem marca padrão', links);

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
if (!renderToStaticMarkup(h(Navbar, { items, onMenuToggle: () => {}, menuOpen: true })).includes('aria-expanded="true"')) fail('menuOpen marca aria-expanded no botão de menu');

const elevated = renderToStaticMarkup(h(Navbar, { items, elevated: true }));
if (!elevated.includes('var(--ob-shadow-sm)')) fail('elevated deveria aplicar sombra', elevated);

if ('NavbarAccount' in pacote || 'NavbarLink' in pacote) fail('a conta e o link interno não são API pública');

console.log('OK: Navbar (layouts, item ativo/compacto, secondary, menuToggle, elevated, links de verdade, botão sem href, sem marca nem conta embutidas)');
