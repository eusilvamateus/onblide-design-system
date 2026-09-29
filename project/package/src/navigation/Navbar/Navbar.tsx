// project/package/src/navigation/Navbar/Navbar.tsx
import React, { useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';
import { Menu, MenuItem } from '../../overlays/Menu/Menu';
import { Avatar } from '../../data-display/Avatar/Avatar';
import { LogoMark } from '../../brand/Logo/Logo';

export type NavbarSize = 'md' | 'sm';
export type NavbarLayout = 'links' | 'search' | 'context';

interface NavbarSizeSpec { h: number; pad: string; link: number; icon: number; mark: number; avatar: number }
const NB_SIZE: Record<NavbarSize, NavbarSizeSpec> = {
  md: { h: 64, pad: 'var(--ob-s-5)', link: 36, icon: 20, mark: 30, avatar: 32 },
  sm: { h: 48, pad: 'var(--ob-s-4)', link: 30, icon: 18, mark: 25, avatar: 26 },
};

export interface NavbarItem {
  /** Identificador do link, usado em `active` e `onNav`. */
  id: string;
  /** Rótulo do link. */
  label: React.ReactNode;
  /** URL do link; sem `onNav`, segue normalmente. */
  href?: string;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido antes do rótulo. */
  icon?: string;
  /** Conteúdo do badge exibido depois do rótulo. */
  badge?: React.ReactNode;
}

export interface NavbarIconButtonProps {
  /** Nome do ícone Phosphor (sem o prefixo "ph-"). */
  icon: string;
  /** Rótulo acessível; obrigatório porque o botão só tem ícone. */
  label: string;
  /** Contador exibido como badge numérico sobre o ícone. */
  count?: number;
  /** Tamanho do botão, acompanhando o tamanho da Navbar. */
  size?: NavbarSize;
  onClick?: () => void;
  /** Estado pressionado (ex.: painel aberto). */
  pressed?: boolean;
}

/** Botão de ação só com ícone para a Navbar, com contador opcional em badge. */
export const NavbarIconButton: React.FC<NavbarIconButtonProps> = ({ icon, label, count, size = 'md', onClick, pressed }) => {
  const z = NB_SIZE[size];
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocus(e.target.matches(':focus-visible'))} onBlur={() => setFocus(false)}
      style={{ position: 'relative', width: z.link, height: z.link, display: 'grid', placeItems: 'center', border: 0, borderRadius: 'var(--ob-r-control)', cursor: 'pointer', color: hover ? 'var(--ob-fg-strong)' : 'var(--ob-fg)', background: hover || pressed ? 'var(--ob-surface-2)' : 'transparent', boxShadow: focus ? '0 0 0 3px var(--ob-focus-ring)' : 'none', outline: 'none', transition: 'background var(--ob-dur-fast) var(--ob-ease)' }}>
      <Ph n={icon} size={z.icon} c="currentColor" />
      {count ? <span style={{ position: 'absolute', top: 2, right: 0 }}><Badge tone="red" variant="numeric" size="sm">{count}</Badge></span> : null}
    </button>
  );
};

interface NavbarLinkProps {
  item: NavbarItem;
  active?: boolean;
  size: NavbarSize;
  onNav?: (id: string) => void;
  underline?: boolean;
}

/** Link individual da Navbar (uso interno; renderizado por `Navbar` a partir de `items`). */
export const NavbarLink: React.FC<NavbarLinkProps> = ({ item, active, size, onNav, underline }) => {
  const z = NB_SIZE[size];
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <a href={item.href || '#'} aria-current={active ? 'page' : undefined}
      onClick={(e) => { if (onNav) { e.preventDefault(); onNav(item.id); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocus(e.target.matches(':focus-visible'))} onBlur={() => setFocus(false)}
      style={{ position: 'relative', height: underline ? '100%' : z.link, display: 'flex', alignItems: 'center', gap: 6, padding: '0 var(--ob-s-3)', borderRadius: 'var(--ob-r-control)', textDecoration: 'none', fontSize: 'var(--ob-fs-sm)', fontWeight: active ? 'var(--ob-w-semibold)' : 'var(--ob-w-medium)', color: active ? 'var(--ob-fg-strong)' : hover ? 'var(--ob-fg-strong)' : 'var(--ob-fg)', background: !underline && (active || hover) ? 'var(--ob-surface-2)' : 'transparent', boxShadow: focus ? 'inset 0 0 0 2px var(--ob-focus-ring)' : 'none', outline: 'none', whiteSpace: 'nowrap', transition: 'color var(--ob-dur-fast) var(--ob-ease), background var(--ob-dur-fast) var(--ob-ease)' }}>
      {item.icon && <Ph n={item.icon} size={16} c="currentColor" weight={active ? 'fill' : 'regular'} />}
      {item.label}
      {item.badge != null && <Badge tone="blue" size="sm">{item.badge}</Badge>}
      {underline && <span aria-hidden="true" style={{ position: 'absolute', left: 'var(--ob-s-3)', right: 'var(--ob-s-3)', bottom: -1, height: 2, borderRadius: 2, background: active ? 'var(--ob-blue)' : 'transparent', transition: 'background var(--ob-dur-fast) var(--ob-ease)' }} />}
    </a>
  );
};

export interface NavbarAccountProps {
  /** Nome exibido no menu de conta. */
  name?: string;
  /** E-mail exibido no menu de conta. */
  email?: string;
  size?: NavbarSize;
  /** Chamado ao escolher "Perfil". */
  onProfile?: () => void;
  /** Chamado ao escolher "Configurações". */
  onSettings?: () => void;
  /** Chamado ao escolher "Sair". */
  onSignOut?: () => void;
}

/** Botão de conta pronto para a Navbar: avatar que abre um `Menu` com perfil, configurações e sair. */
export const NavbarAccount: React.FC<NavbarAccountProps> = ({ name = 'Marina Souza', email = 'marina@aurora.studio', size = 'md', onProfile, onSettings, onSignOut }) => {
  const z = NB_SIZE[size];
  const items: MenuItem[] = [
    { type: 'account', name, email, current: true, large: true },
    { type: 'separator' },
    { label: 'Perfil', icon: 'user', onSelect: onProfile },
    { label: 'Configurações', icon: 'gear', onSelect: onSettings },
    { type: 'separator' },
    { label: 'Sair', icon: 'sign-out', tone: 'danger', onSelect: onSignOut },
  ];
  return (
    <Menu align="right" size="sm" ariaLabel="Conta" items={items}
      trigger={<button type="button" aria-label={'Conta de ' + name} style={{ border: 0, padding: 2, background: 'transparent', borderRadius: 'var(--ob-r-pill)', cursor: 'pointer', display: 'grid' }}><Avatar name={name} size={z.avatar} /></button>} />
  );
};

export interface NavbarProps {
  /**
   * Variante de layout: `links` mostra a navegação principal ao lado da marca, `search` centraliza um
   * campo de busca e `context` cede o espaço central para uma trilha de navegação (par da `SideNav`).
   */
  layout?: NavbarLayout;
  /** Links da navegação principal, usados no layout `links`. */
  items?: NavbarItem[];
  /** Id do link atualmente ativo. */
  active?: string;
  /** Chamado com o id do link clicado. */
  onNav?: (id: string) => void;
  /** Ações à direita da barra: `NavbarIconButton`, `Button`, `NavbarAccount`. */
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
  /** Chamado ao clicar no botão de menu; presente, mostra o botão (para abrir uma `SideNav` em `Drawer`). */
  onMenuToggle?: () => void;
  /** Modo responsivo: esconde os links da navegação principal. */
  compact?: boolean;
  /** Marca exibida à esquerda; por padrão, o símbolo da Onblide (`LogoMark`), sem o wordmark. */
  brand?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Barra de navegação superior da aplicação, par da `SideNav`: marca, navegação, busca ou contexto, e ações. */
export const Navbar: React.FC<NavbarProps> = ({ layout = 'links', items = [], active, onNav, actions, search, crumbs, secondary, size = 'md', elevated, sticky, onMenuToggle, compact, brand, style }) => {
  const z = NB_SIZE[size];
  const underline = layout === 'links' && !secondary;
  return (
    <header style={{ position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 'var(--ob-z-raised)' as React.CSSProperties['zIndex'], background: 'var(--ob-surface)', borderBottom: '1px solid var(--ob-border)', boxShadow: elevated ? 'var(--ob-shadow-sm)' : 'none', transition: 'box-shadow var(--ob-dur-base) var(--ob-ease)', fontFamily: 'var(--ob-font)', ...style }}>
      <div style={{ height: z.h, display: 'flex', alignItems: 'center', gap: 'var(--ob-s-4)', padding: '0 ' + z.pad, minWidth: 0 }}>
        {onMenuToggle && <NavbarIconButton icon="list" label="Abrir navegação" size={size} onClick={onMenuToggle} />}
        {layout !== 'context' && (brand || <a href="#" aria-label="Início" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.preventDefault()}><LogoMark size={z.mark} /></a>)}
        {layout === 'links' && !compact && (
          <nav aria-label="Principal" style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: underline ? 0 : 2, marginLeft: 'var(--ob-s-3)', minWidth: 0 }}>
            {items.map((it) => <NavbarLink key={it.id} item={it} active={it.id === active} size={size} onNav={onNav} underline={underline} />)}
          </nav>
        )}
        {layout === 'search' && <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}><div style={{ width: '100%', maxWidth: 480 }}>{search}</div></div>}
        {layout === 'context' && <div style={{ flex: 1, minWidth: 0 }}>{crumbs}</div>}
        {layout === 'links' && <div style={{ flex: 1 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-s-1)', flexShrink: 0 }}>{actions}</div>
      </div>
      {secondary && <div style={{ padding: '0 ' + z.pad }}>{secondary}</div>}
    </header>
  );
};
