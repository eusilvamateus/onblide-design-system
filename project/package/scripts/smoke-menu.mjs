import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Menu, MenuPanel, ContextMenu, Menubar, Button } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// Fechado: nada de painel.
const closed = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }] }));
if (closed.includes('role="menu"')) fail('menu fechado não deveria renderizar o painel', closed);

// Itens: simples, checkbox, radio, toggle, submenu, separador, label.
const items = [
  { label: 'Editar', icon: 'pencil-simple', shortcut: 'Ctrl+E' },
  { type: 'separator' },
  { type: 'label', label: 'Visualização' },
  { type: 'checkbox', label: 'Grade', checked: true, onChange: () => {} },
  { type: 'radio', group: 'zoom', label: '100%', checked: true, onSelect: () => {} },
  { type: 'toggle', label: 'Tema escuro', checked: false, onChange: () => {} },
  { type: 'submenu', label: 'Mais', items: [{ label: 'Sub A' }] },
  { label: 'Excluir', tone: 'danger' },
];
// MenuPanel é exportado à parte: testamos a marcação de cada tipo de item diretamente nele.
const panel = renderToStaticMarkup(h(MenuPanel, { items }));
if (!panel.includes('role="menu"')) fail('MenuPanel deveria ter role=menu', panel);
if (!panel.includes('role="menuitemcheckbox"')) fail('checkbox/toggle deveriam ser menuitemcheckbox', panel);
if (!panel.includes('role="menuitemradio"')) fail('radio deveria ser menuitemradio', panel);
if (!panel.includes('aria-haspopup="menu"')) fail('submenu deveria marcar aria-haspopup', panel);
if (!panel.includes('Ctrl+E')) fail('shortcut deveria aparecer', panel);
if (!panel.includes('var(--ob-danger)')) fail('tone danger deveria destacar o item', panel);
if (!panel.includes('Visualização')) fail('label deveria virar um ListSubheader', panel);

const ctx = renderToStaticMarkup(h(ContextMenu, { items }, h('div', {}, 'área')));
if (!ctx.includes('aria-haspopup="menu"') || !ctx.includes('área')) fail('ContextMenu deveria renderizar a área com aria-haspopup', ctx);
if (ctx.includes('role="menu"')) fail('ContextMenu fechado não deveria renderizar o painel', ctx);

// Menubar: sempre visível (é uma barra, não um popover).
const menubar = renderToStaticMarkup(h(Menubar, { menus: [{ label: 'Arquivo', items: [{ label: 'Novo' }] }, { label: 'Editar', items: [{ label: 'Desfazer' }] }] }));
if (!menubar.includes('role="menubar"') || !menubar.includes('Arquivo') || !menubar.includes('Editar')) fail('Menubar deveria renderizar role=menubar com os gatilhos', menubar);
if ((menubar.match(/role="menuitem"/g) || []).length !== 2) fail('Menubar deveria ter um menuitem por gatilho', menubar);

console.log('OK: Menu/ContextMenu/Menubar (fechado sem painel, ContextMenu com aria-haspopup, Menubar com role=menubar)');
