import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Menu, MenuPanel, ContextMenu, Menubar, Button } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// Fechado: nada de painel.
const closed = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }] }));
if (closed.includes('role="menu"')) fail('menu fechado não deveria renderizar o painel', closed);

// defaultOpen: painel já montado, sem precisar de clique — para demos e capturas de tela.
const defaultOpen = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }], defaultOpen: true }));
if (!defaultOpen.includes('role="menu"') || !defaultOpen.includes('Editar')) fail('defaultOpen deveria montar o painel aberto', defaultOpen);

const placementTop = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }], defaultOpen: true, placement: 'top' }));
if (!placementTop.includes('bottom:calc(100% + 6px)')) fail('placement="top" deveria abrir o painel acima do gatilho', placementTop);

const placementRight = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }], defaultOpen: true, placement: 'right-end' }));
if (!placementRight.includes('left:calc(100% + 8px)') || !placementRight.includes('bottom:0')) fail('placement="right-end" deveria abrir ao lado, alinhado à base', placementRight);
const bloco = renderToStaticMarkup(h(Menu, { trigger: h(Button, {}, 'Ações'), items: [{ label: 'Editar' }], block: true }));
if (!bloco.includes('display:block')) fail('block deveria fazer o gatilho ocupar a largura toda', bloco);

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
const linhaMd = renderToStaticMarkup(h(MenuPanel, { items: [{ label: 'Editar' }] }));
if (!linhaMd.includes('padding:var(--ob-space-8) var(--ob-space-12)') || !linhaMd.includes('min-height:36px')) fail('o item do Menu md usa a densidade de opções do List (sm), não a de conteúdo', linhaMd);
const linhaSm = renderToStaticMarkup(h(MenuPanel, { items: [{ label: 'Editar' }], size: 'sm' }));
if (!linhaSm.includes('padding:var(--ob-space-4) var(--ob-space-8)') || !linhaSm.includes('min-height:28px')) fail('o item do Menu sm usa a densidade densa do List (xs)', linhaSm);
if (!panel.includes('Ctrl+E')) fail('shortcut deveria aparecer', panel);
if (!panel.includes('var(--ob-danger)')) fail('tone danger deveria destacar o item', panel);
if (!panel.includes('Visualização')) fail('label deveria virar um ListSubheader', panel);

const comCustom = renderToStaticMarkup(h(MenuPanel, { items: [
  { type: 'label', label: 'Aparência' },
  { type: 'custom', ariaLabel: 'Tema', content: h('span', {}, 'conteúdo livre') },
  { type: 'separator' },
  { label: 'Sair' },
] }));
if (!comCustom.includes('data-ob-menu-custom') || !comCustom.includes('role="group"') || !comCustom.includes('aria-label="Tema"')) fail('item custom deveria virar um grupo com o conteúdo livre', comCustom);
if (!comCustom.includes('conteúdo livre')) fail('item custom deveria renderizar o conteúdo', comCustom);
if ((comCustom.match(/role="menuitem"/g) || []).length !== 1) fail('item custom não deveria virar menuitem', comCustom);

const ctx = renderToStaticMarkup(h(ContextMenu, { items }, h('div', {}, 'área')));
if (!ctx.includes('aria-haspopup="menu"') || !ctx.includes('área')) fail('ContextMenu deveria renderizar a área com aria-haspopup', ctx);
if (ctx.includes('role="menu"')) fail('ContextMenu fechado não deveria renderizar o painel', ctx);

// Menubar: sempre visível (é uma barra, não um popover).
const menubar = renderToStaticMarkup(h(Menubar, { menus: [{ label: 'Arquivo', items: [{ label: 'Novo' }] }, { label: 'Editar', items: [{ label: 'Desfazer' }] }] }));
if (!menubar.includes('role="menubar"') || !menubar.includes('Arquivo') || !menubar.includes('Editar')) fail('Menubar deveria renderizar role=menubar com os gatilhos', menubar);
if ((menubar.match(/role="menuitem"/g) || []).length !== 2) fail('Menubar deveria ter um menuitem por gatilho', menubar);

const contaComFoto = renderToStaticMarkup(h(MenuPanel, { items: [{ type: 'account', name: 'Camila Duarte', email: 'camila@onblide.com', src: 'https://exemplo.com/camila.jpg' }] }));
if (!contaComFoto.includes('src="https://exemplo.com/camila.jpg"') || contaComFoto.includes('alt="Camila')) fail('item account mostra a foto, decorativa porque o nome já está ao lado', contaComFoto);
const contaSemFoto = renderToStaticMarkup(h(MenuPanel, { items: [{ type: 'account', name: 'Camila Duarte', email: 'camila@onblide.com', initials: 'CD2' }] }));
if (contaSemFoto.includes('<img') || !contaSemFoto.includes('>CD2<')) fail('item account sem foto mostra as iniciais, que podem ser trocadas por initials', contaSemFoto);
const contaNeutra = renderToStaticMarkup(h(MenuPanel, { items: [{ type: 'account', name: 'Workspace', email: 'Administrador', avatarColor: 'var(--ob-bg-alt)', avatarTextColor: 'var(--ob-fg-strong)' }] }));
if (!contaNeutra.includes('background:var(--ob-bg-alt)') || !contaNeutra.includes('color:var(--ob-fg-strong)')) fail('item account encaminha as cores do avatar', contaNeutra);

console.log('OK: Menu/ContextMenu/Menubar (densidade de opções, ContextMenu com aria-haspopup, Menubar com role=menubar, conta com foto ou iniciais)');
