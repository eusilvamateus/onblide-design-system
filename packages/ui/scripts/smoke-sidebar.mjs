import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as pacote from '../dist/index.js';

const { Sidebar } = pacote;
const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html ?? ''); process.exit(1); };
const render = (props) => renderToStaticMarkup(h(Sidebar, props));

const groups = [
  { items: [
    { id: 'inicio', label: 'Início', icon: 'house', href: '/inicio' },
    { id: 'projetos', label: 'Projetos', icon: 'kanban', href: '/projetos', badge: 4 },
    { id: 'novo', label: 'Novo projeto', icon: 'plus' },
  ] },
  { label: 'Análise', items: [
    { id: 'relatorios', label: 'Relatórios', icon: 'chart-line', children: [{ id: 'vendas', label: 'Vendas-X', href: '/vendas' }] },
    { id: 'metas', label: 'Metas', icon: 'target', children: [{ id: 'trimestre', label: 'Trimestre-Y', href: '/trimestre' }] },
  ] },
];

if ('SideNav' in pacote) fail('o nome antigo SideNav não deveria existir');

const aberta = render({ groups, active: 'vendas' });
if (!/<nav id="[^"]+" aria-label="Navegação principal"/.test(aberta)) fail('a lista fica num <nav> com nome acessível', aberta);
if (!/<nav id="[^"]+" aria-label="Documentação"/.test(render({ groups, ariaLabel: 'Documentação' }))) fail('ariaLabel nomeia a navegação');
if (!/<a href="\/inicio"[^>]*class="ob-sidebar-item"/.test(aberta)) fail('item com href é um link de verdade', aberta);
if (!/<button type="button"[^>]*class="ob-sidebar-item"[^>]*>.*?Novo projeto/.test(aberta)) fail('item sem href é um botão', aberta);
if (!/<a href="\/vendas" aria-current="page"/.test(aberta)) fail('o item ativo recebe aria-current="page"', aberta);
if ((aberta.match(/aria-current=/g) || []).length !== 1) fail('só o item ativo tem aria-current', aberta);
if (!aberta.includes('Vendas-X') || aberta.includes('Trimestre-Y')) fail('o grupo com o item ativo começa aberto e os outros fechados', aberta);
if (!aberta.includes('aria-expanded="true"') || !aberta.includes('aria-expanded="false"')) fail('grupos expõem aria-expanded', aberta);
if (!aberta.includes('role="group" aria-label="Análise"') || !aberta.includes('>Análise</p>')) fail('o grupo tem título visível e nome acessível', aberta);
if (/>Menu</.test(aberta) || /Perfil|Sair/.test(aberta)) fail('sem rótulo "Menu" nem conta embutidos', aberta);
if (!aberta.includes('var(--ob-fg-mute)') || aberta.includes('var(--ob-orange)')) fail('contador neutro por padrão', aberta);
if (!render({ groups: [{ items: [{ id: 'a', label: 'A', badge: 2, badgeTone: 'danger' }] }] }).includes('var(--ob-danger')) fail('badgeTone muda o tom do contador');
if (aberta.includes('Recolher barra lateral')) fail('sem collapsible não há botão de recolher', aberta);
if (/<svg|logo/i.test(aberta)) fail('sem marca padrão', aberta);

const comBotao = render({ groups, collapsible: true });
if (!/<span class="ob-sidebar-borda">.*?aria-label="Recolher barra lateral" aria-expanded="true" aria-controls="[^"]+"[^>]*>.*?ph-sidebar-simple/.test(comBotao) || /ph-caret-left|r-circle/.test(comBotao)) fail('aberta, collapsible põe o botão de recolher sobre a borda', comBotao);
if (comBotao.includes('aria-keyshortcuts')) fail('sem toggleShortcut não há atalho', comBotao);
if (!render({ groups, collapsible: true, toggleShortcut: 'b' }).includes('aria-keyshortcuts="Control+B"')) fail('toggleShortcut anuncia o atalho no botão');
if (render({ groups, toggleShortcut: 'b' }).includes('aria-keyshortcuts')) fail('sem collapsible, o atalho não vale');

const recolhida = render({ groups, active: 'vendas', defaultCollapsed: true, collapsible: true });
if (!recolhida.includes('width:72px')) fail('recolhida tem 72px', recolhida);
if (recolhida.includes('>Análise</p>') || !recolhida.includes('role="separator"') && !recolhida.includes('border-top:1px')) fail('recolhida, o título do grupo vira divisória', recolhida);
if (!/<a href="\/inicio"[^>]*aria-label="Início"/.test(recolhida)) fail('recolhida, o link leva o rótulo como nome acessível', recolhida);
if (!recolhida.includes('aria-label="Projetos, 4"')) fail('recolhida, o contador entra no nome acessível', recolhida);
if (!/aria-haspopup="menu"[^>]*data-ativo=""[^>]*data-grupo=""[^>]*aria-label="Relatórios"/.test(recolhida)) fail('recolhida, o grupo abre um menu e fica destacado se contém o item ativo', recolhida);
if (recolhida.includes('Vendas-X')) fail('recolhida, os subitens não ficam na lista', recolhida);
if (!recolhida.includes('aria-label="Expandir barra lateral" aria-expanded="false"') || recolhida.includes('ob-sidebar-borda')) fail('recolhida, o botão vira "Expandir" e sai da borda', recolhida);
const marcaRecolhida = render({ groups, defaultCollapsed: true, collapsible: true, header: ({ collapsed }) => (collapsed ? 'Marca-curta' : 'Marca-longa') });
if (!/<button type="button" class="ob-sidebar-abrir"[^>]*aria-label="Expandir barra lateral"[^>]*><span class="ob-sidebar-abrir__marca">Marca-curta<\/span><span class="ob-sidebar-abrir__icone">.*?ph-sidebar-simple/.test(marcaRecolhida)) fail('recolhida, o cabeçalho vira o botão de expandir, com o ícone por cima', marcaRecolhida);
if (!/class="ob-sidebar-abrir" data-sem-marca=""/.test(recolhida)) fail('recolhida e sem cabeçalho, o botão mostra só o ícone', recolhida);
if (render({ groups, defaultCollapsed: true, header: 'Marca-curta' }).includes('ob-sidebar-abrir')) fail('sem collapsible, o cabeçalho continua sendo só conteúdo');

const espacos = render({ groups, header: ({ collapsed }) => h('span', null, collapsed ? 'Marca-curta' : 'Marca-longa'), footer: h('span', null, 'Rodape-Z') });
if (!espacos.includes('Marca-longa') || !espacos.includes('Rodape-Z')) fail('header e footer aparecem', espacos);
if (!render({ groups, collapsed: true, header: ({ collapsed }) => (collapsed ? 'Marca-curta' : 'Marca-longa') }).includes('Marca-curta')) fail('header como função recebe collapsed');

const flush = render({ groups, variant: 'flush' });
if (!flush.includes('width:100%') || !flush.includes('border-right:1px solid var(--ob-border)') || flush.includes('border-radius:var(--ob-r-lg)')) fail('variant flush ocupa a coluna, só com a divisória à direita', flush);
if (!render({ groups }).includes('width:240px')) fail('floating tem 240px');

console.log('OK: Sidebar (links de verdade em <nav> com aria-current, botões sem href, grupos com título, subitens abertos pelo ativo, recolhida com nomes acessíveis, menu de subitens e divisórias, botão de recolher, header e footer livres, variantes, sem marca nem conta embutidas)');
