import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';
import { Button } from '../../actions/Button/Button';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { navegarPeloLink } from '../../internal/navegacao';
import type { BadgeTone } from '../../internal/badgeTones';

export type NavbarSize = 'md' | 'sm';
export type NavbarLayout = 'links' | 'search' | 'context';

interface NavbarSizeSpec { h: number; pad: string; link: number; icon: number }
const NB_SIZE: Record<NavbarSize, NavbarSizeSpec> = {
  md: { h: 64, pad: 'var(--ob-space-24)', link: 36, icon: 20 },
  sm: { h: 48, pad: 'var(--ob-space-16)', link: 30, icon: 18 },
};

export interface NavbarItem {
  /** Identificador do link, usado em `active` e `onNav`. */
  id: string;
  /** Rótulo do link. */
  label: React.ReactNode;
  /** Endereço do link. Sem `href`, o item vira um botão que só chama `onNav`. */
  href?: string;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido antes do rótulo. */
  icon?: string;
  /** Contador exibido depois do rótulo. */
  badge?: React.ReactNode;
  /** Tom do contador, entre os tons do `Badge`. Padrão: `neutral`. */
  badgeTone?: BadgeTone;
}

injectStyleOnce(
  'ob-navbar',
  '.ob-navbar-link.ob-navbar-link{background:transparent;color:var(--ob-fg);transition:color var(--ob-dur-fast) var(--ob-ease),background var(--ob-dur-fast) var(--ob-ease)}.ob-navbar-link.ob-navbar-link:hover{color:var(--ob-fg-strong)}.ob-navbar-link.ob-navbar-link[data-fundo]:hover{background:var(--ob-surface-2)}.ob-navbar-link:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)}',
);

interface LinkDaNavbarProps {
  item: NavbarItem;
  active: boolean;
  size: NavbarSize;
  onNav?: (id: string) => void;
  underline: boolean;
}

const LinkDaNavbar: React.FC<LinkDaNavbarProps> = ({ item, active, size, onNav, underline }) => {
  const z = NB_SIZE[size];
  const comuns = {
    className: 'ob-navbar-link',
    'data-fundo': underline ? undefined : '',
    'aria-current': active ? ('page' as const) : undefined,
    style: {
      position: 'relative', height: underline ? '100%' : z.link, display: 'flex', alignItems: 'center', gap: 'var(--ob-space-6)', margin: 0, border: 0,
      padding: '0 var(--ob-space-12)', borderRadius: 'var(--ob-r-control)', textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ob-fs-14)',
      fontWeight: active ? 'var(--ob-w-semibold)' : 'var(--ob-w-medium)', whiteSpace: 'nowrap',
      ...(active ? { color: 'var(--ob-fg-strong)', ...(underline ? {} : { background: 'var(--ob-surface-2)' }) } : {}),
    } as React.CSSProperties,
  };
  const conteudo = (
    <>
      {item.icon && <Ph n={item.icon} size={16} c="currentColor" weight={active ? 'fill' : 'regular'} />}
      {item.label}
      {item.badge != null && <Badge tone={item.badgeTone ?? 'neutral'} size="sm">{item.badge}</Badge>}
      {underline && <span aria-hidden="true" style={{ position: 'absolute', left: 'var(--ob-space-12)', right: 'var(--ob-space-12)', bottom: -1, height: 2, borderRadius: 'var(--ob-r-2xs)', background: active ? 'var(--ob-blue)' : 'transparent', transition: 'background var(--ob-dur-fast) var(--ob-ease)' }} />}
    </>
  );
  return item.href
    ? <a href={item.href} onClick={(e) => navegarPeloLink(e, item.id, onNav)} {...comuns}>{conteudo}</a>
    : <button type="button" onClick={() => onNav?.(item.id)} {...comuns}>{conteudo}</button>;
};

export interface NavbarProps {
  /**
   * Variante de layout: `links` mostra a navegação principal ao lado da marca, `search` centraliza um
   * campo de busca e `context` cede o espaço central para uma trilha de navegação (par da `Sidebar`).
   */
  layout?: NavbarLayout;
  /** Links da navegação principal, usados no layout `links`. */
  items?: NavbarItem[];
  /** Id do link ativo; recebe `aria-current="page"`. */
  active?: string;
  /** Chamado com o id do link escolhido. Num link, só o clique simples é interceptado: Ctrl+clique e o botão do meio continuam abrindo em outra aba. */
  onNav?: (id: string) => void;
  /** Ações à direita da barra: botões (`Button` com `kind="neutral"` e `iconOnly`) e a conta da pessoa (um `Menu` com `Avatar`). */
  actions?: React.ReactNode;
  /** Campo de busca central, usado no layout `search` (geralmente um `SearchInput`). */
  search?: React.ReactNode;
  /** Trilha de navegação, usada no layout `context` (geralmente um `Breadcrumbs`). */
  crumbs?: React.ReactNode;
  /** Segundo nível abaixo da barra (geralmente um `Tabs` com `variant="line"` e `size="sm"`). */
  secondary?: React.ReactNode;
  /** Altura da barra: 64px (`md`) ou 48px (`sm`). */
  size?: NavbarSize;
  /** Fixa a barra no topo da janela (`position: sticky`). */
  sticky?: boolean;
  /** Aplica sombra, indicando que o conteúdo rolou por baixo da barra; controlado por quem usa. */
  elevated?: boolean;
  /** Chamado ao clicar no botão de menu; presente, mostra o botão, que abre a `Sidebar` em telas estreitas (`onMobileOpenChange`). */
  onMenuToggle?: () => void;
  /** Painel de navegação aberto; marca `aria-expanded` no botão de menu. */
  menuOpen?: boolean;
  /** Modo responsivo: esconde os links da navegação principal. */
  compact?: boolean;
  /** Marca exibida à esquerda, geralmente o `LogoMark` dentro de um link para o início. Fica oculta no layout `context`. */
  brand?: React.ReactNode;
  /** Estilos inline adicionais da barra, mesclados por último. */
  style?: React.CSSProperties;
}

/** Barra de navegação superior da aplicação, par da `Sidebar`: marca, navegação, busca ou contexto, e ações. */
export const Navbar: React.FC<NavbarProps> = ({ layout = 'links', items = [], active, onNav, actions, search, crumbs, secondary, size = 'md', elevated, sticky, onMenuToggle, menuOpen, compact, brand, style }) => {
  const z = NB_SIZE[size];
  const underline = layout === 'links' && !secondary;
  return (
    <header style={{ position: sticky ? 'sticky' : 'relative', top: 0, width: '100%', boxSizing: 'border-box', zIndex: 'var(--ob-z-raised)' as React.CSSProperties['zIndex'], background: 'var(--ob-surface)', borderBottom: '1px solid var(--ob-border)', boxShadow: elevated ? 'var(--ob-shadow-sm)' : 'none', transition: 'box-shadow var(--ob-dur-base) var(--ob-ease)', fontFamily: 'var(--ob-font)', ...style }}>
      <div style={{ height: z.h, display: 'flex', alignItems: 'center', gap: 'var(--ob-space-16)', padding: '0 ' + z.pad, minWidth: 0 }}>
        {onMenuToggle && <Button kind="neutral" iconOnly size={size === 'sm' ? 'sm' : 'md'} aria-label="Abrir navegação" aria-expanded={menuOpen} icon={<Ph n="list" size={z.icon} c="currentColor" />} onClick={onMenuToggle} />}
        {layout !== 'context' && brand != null && <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{brand}</div>}
        {layout === 'links' && !compact && (
          <nav aria-label="Principal" style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: underline ? 0 : 'var(--ob-space-2)', marginLeft: 'var(--ob-space-12)', flexShrink: 0 }}>
            {items.map((it) => <LinkDaNavbar key={it.id} item={it} active={it.id === active} size={size} onNav={onNav} underline={underline} />)}
          </nav>
        )}
        {layout === 'search' && <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}><div style={{ width: '100%', maxWidth: 480 }}>{search}</div></div>}
        {layout === 'context' && <div style={{ flex: 1, minWidth: 0 }}>{crumbs}</div>}
        {layout === 'links' && <div style={{ flex: 1 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)', flexShrink: 0 }}>{actions}</div>
      </div>
      {secondary && <div style={{ padding: '0 ' + z.pad }}>{secondary}</div>}
    </header>
  );
};
