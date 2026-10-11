import React, { useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Logo, LogoMark } from '../../brand/Logo/Logo';
import { Menu, MenuItem } from '../../overlays/Menu/Menu';
import { Tooltip } from '../../overlays/Tooltip/Tooltip';
import { Button } from '../../actions/Button/Button';
import { Avatar } from '../../data-display/Avatar/Avatar';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

injectStyleOnce('ob-sidenav-scroll', '.ob-sidenav-lista::-webkit-scrollbar{width:6px}.ob-sidenav-lista::-webkit-scrollbar-button{display:none}.ob-sidenav-lista::-webkit-scrollbar-track{background:transparent}.ob-sidenav-lista::-webkit-scrollbar-thumb{background:transparent;border-radius:999px}.ob-sidenav-lista:hover::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--ob-fg-mute) 60%,transparent)}@supports not selector(::-webkit-scrollbar){.ob-sidenav-lista{scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--ob-fg-mute) 60%,transparent) transparent}}');

export interface SideNavItem {
  /** Identificador do item de navegação, usado em `active` e `onNav`. */
  id?: string;
  /** Quando definido, o item vira um cabeçalho de seção em vez de um link. */
  section?: string;
  /** Rótulo do item de navegação. */
  label?: React.ReactNode;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido ao lado do rótulo. */
  icon?: string;
  /** Conteúdo do badge exibido ao lado do rótulo, geralmente uma contagem. */
  badge?: React.ReactNode;
  /** Subitens: o item vira um grupo que abre e fecha (começa aberto se contiver o item ativo). */
  children?: SideNavItem[];
}

const contemAtivo = (it: SideNavItem, active?: string): boolean =>
  it.id === active || (it.children ?? []).some((c) => contemAtivo(c, active));

interface ItemProps {
  it: SideNavItem;
  active?: string;
  onNav?: (id?: string) => void;
  collapsed: boolean;
  nivel: number;
}

const Item: React.FC<ItemProps> = ({ it, active, onNav, collapsed, nivel }) => {
  const grupo = !!it.children?.length;
  const [aberto, setAberto] = useState(() => grupo && contemAtivo(it, active));
  const on = !grupo && active === it.id;
  const botao = (
    <button type="button" onClick={() => (grupo ? setAberto((a) => !a) : onNav?.(it.id))} aria-expanded={grupo ? aberto : undefined}
      title={collapsed ? (typeof it.label === 'string' ? it.label : undefined) : undefined}
      style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', height: nivel ? 36 : 42, padding: collapsed ? 0 : `0 12px 0 ${12 + nivel * 14}px`, borderRadius: 'var(--ob-r-md)', border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'var(--ob-blue-100)' : 'transparent', color: on ? 'var(--ob-blue-700)' : grupo ? 'var(--ob-fg-strong)' : 'var(--ob-fg-soft)', fontFamily: 'var(--ob-font)', fontSize: nivel ? 13 : 14, fontWeight: on || grupo ? 600 : 500, transition: 'background 0.12s' }}
      onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
      onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
      {it.icon && <Ph n={it.icon} size={20} weight={on ? 'fill' : 'regular'} />}
      {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>}
      {!collapsed && it.badge != null && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--ob-orange)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
      {!collapsed && grupo && <Ph n="caret-down" size={14} style={{ flex: 'none', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />}
      {collapsed && it.badge != null && <span style={{ position: 'absolute', top: 7, right: 9, width: 8, height: 8, borderRadius: 999, background: 'var(--ob-orange)', border: '2px solid var(--ob-surface)' }} />}
    </button>
  );
  if (!grupo) return botao;
  return (
    <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {botao}
      {aberto && !collapsed && it.children!.map((c, i) => <Item key={c.id || i} it={c} active={active} onNav={onNav} collapsed={collapsed} nivel={nivel + 1} />)}
    </div>
  );
};

const AJUSTE_ICONE: Record<string, string> = {
  'caret-left': 'translate(0.6px, -0.4px)',
  'caret-right': 'translate(-0.4px, -0.4px)',
  'caret-line-left': 'translate(-0.1px, -0.4px)',
  'caret-line-right': 'translate(0.4px, -0.4px)',
};

const IconeLateral: React.FC<{ n: string }> = ({ n }) => <Ph n={n} size={16} style={{ transform: AJUSTE_ICONE[n] }} />;

interface BotaoLateralProps {
  onClick: () => void;
  rotulo: string;
  repouso: React.ReactNode;
  iconeAtivo: string;
  contorno?: boolean;
}

const BotaoLateral: React.FC<BotaoLateralProps> = ({ onClick, rotulo, repouso, iconeAtivo, contorno = false }) => {
  const [ativo, setAtivo] = useState(false);
  return (
    <Tooltip label={rotulo} placement="right">
      <Button iconOnly size="sm" kind={contorno || ativo ? 'secondary' : 'ghost'} onClick={onClick} aria-label={rotulo}
        onMouseEnter={() => setAtivo(true)} onMouseLeave={() => setAtivo(false)}
        onFocus={() => setAtivo(true)} onBlur={() => setAtivo(false)}
        style={{ color: 'var(--ob-fg-soft)', borderRadius: 'var(--ob-r-md)' }}
        icon={ativo ? <IconeLateral n={iconeAtivo} /> : repouso} />
    </Tooltip>
  );
};

const CabecalhoRecolhido: React.FC<{ onToggle?: () => void; marca: React.ReactNode | null }> = ({ onToggle, marca }) => {
  if (!onToggle && marca === null) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
      {onToggle ? (
        <BotaoLateral onClick={onToggle} rotulo="Abrir barra lateral" repouso={marca ?? <IconeLateral n="caret-right" />} iconeAtivo="caret-line-right" contorno={marca === null} />
      ) : (
        <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{marca}</span>
      )}
    </div>
  );
};

const BotaoDeBorda: React.FC<{ onToggle: () => void }> = ({ onToggle }) => (
  <span style={{ position: 'absolute', top: 16, right: -17, zIndex: 2 }}>
    <BotaoLateral onClick={onToggle} rotulo="Fechar barra lateral" repouso={<IconeLateral n="caret-left" />} iconeAtivo="caret-line-left" contorno />
  </span>
);

export interface SideNavProps {
  /** Itens e seções exibidos na lista de navegação. */
  items?: SideNavItem[];
  /** Id do item atualmente ativo. */
  active?: string;
  /** Chamado com o id do item clicado. */
  onNav?: (id?: string) => void;
  /** Exibe a navegação no modo recolhido, só com ícones. */
  collapsed?: boolean;
  /** Chamado ao clicar no botão de recolher/expandir, que fica na borda da barra (e sobre a marca, quando recolhida); omitido, o botão some. */
  onToggle?: () => void;
  /** Ocupa 100% do espaço disponível, sem borda arredondada; recolhida, mantém a largura fixa de 72px. */
  flush?: boolean;
  /** Logo horizontal da marca, exibida no topo da barra expandida. Padrão: a logo da Onblide. */
  brand?: React.ReactNode;
  /** Símbolo da marca, exibido no topo da barra recolhida. Padrão: o símbolo da Onblide. */
  brandMark?: React.ReactNode;
  /** Nome da pessoa ou conta exibido no rodapé e no menu que ele abre. Padrão: "Conta". */
  accountName?: string;
  /** Linha secundária abaixo do nome no rodapé, como e-mail ou cargo; omitida, não aparece. */
  accountDetail?: string;
  /** Iniciais exibidas no avatar do rodapé; omitidas, saem do `accountName`. */
  userInitials?: string;
  /** URL da foto exibida no avatar do rodapé; sem ela, ou se falhar ao carregar, aparecem as iniciais. */
  accountImage?: string;
  /** Texto alternativo da foto do avatar; omitido, a foto é tratada como decorativa. */
  accountImageAlt?: string;
  /** Itens do menu aberto pelo rodapé de conta. Padrão: Perfil, Configurações e Sair. */
  accountMenu?: MenuItem[];
  /** Chamado ao escolher "Perfil" no menu padrão do rodapé de conta. */
  onProfile?: () => void;
  /** Chamado ao escolher "Configurações" no menu padrão do rodapé de conta. */
  onSettings?: () => void;
  /** Chamado ao escolher "Sair" no menu padrão do rodapé de conta. */
  onSignOut?: () => void;
  /** Oculta o cabeçalho com a marca e o botão de recolher (útil quando a navegação é só uma lista). */
  hideBrand?: boolean;
  /** Oculta o rodapé com a conta do usuário. */
  hideAccount?: boolean;
  /** Rótulo acima da lista; `null` remove. Padrão: "Menu". */
  menuLabel?: string | null;
}

/** Navegação lateral com seções, itens ativos, badges, modo recolhido e rodapé de conta com menu. */
export const SideNav: React.FC<SideNavProps> = ({
  items = [], active, onNav, collapsed = false, onToggle, flush = false,
  brand, brandMark, accountName = 'Conta', accountDetail, userInitials, accountImage, accountImageAlt, accountMenu, onProfile, onSettings, onSignOut,
  hideBrand = false, hideAccount = false, menuLabel = 'Menu',
}) => {
  const itensDaConta: MenuItem[] = accountMenu ?? [
    { label: 'Perfil', icon: 'user', onSelect: onProfile },
    { label: 'Configurações', icon: 'gear', onSelect: onSettings },
    { type: 'separator' },
    { label: 'Sair', icon: 'sign-out', tone: 'danger', onSelect: onSignOut },
  ];
  const conteudoConta = (
    <>
      <Avatar name={accountName} initials={userInitials} src={accountImage} alt={accountImageAlt} size={30} />
      {!collapsed && <div style={{ minWidth: 0, textAlign: 'left' }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{accountName}</div>{accountDetail && <div style={{ fontSize: 11, color: 'var(--ob-fg-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{accountDetail}</div>}</div>}
    </>
  );
  return (
    <div style={{ position: 'relative', flexShrink: flush && !collapsed ? 1 : 0, width: collapsed ? 72 : (flush ? '100%' : 240), minWidth: 0, boxSizing: 'border-box', height: flush ? '100%' : undefined, background: 'var(--ob-surface)', border: flush ? 'none' : '1px solid var(--ob-border)', borderRight: flush ? '1px solid var(--ob-border)' : undefined, borderRadius: flush ? 0 : 'var(--ob-r-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {collapsed
        ? <CabecalhoRecolhido onToggle={onToggle} marca={hideBrand ? null : (brandMark ?? <LogoMark size={22} />)} />
        : hideBrand ? null : <div style={{ display: 'flex', alignItems: 'center', padding: '4px 4px 14px 8px' }}>{brand ?? <Logo size={24} />}</div>
      }
      {!collapsed && onToggle && <BotaoDeBorda onToggle={onToggle} />}
      <div className="ob-sidenav-lista" style={{ flex: '1 1 auto', minHeight: 0, margin: -2, padding: 2, display: 'flex', flexDirection: 'column', gap: 4, overflowX: 'hidden', overflowY: 'auto' }}>
        {!collapsed && menuLabel !== null && <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '0 10px 6px' }}>{menuLabel}</p>}
        {items.map((it, i) => {
          if (it.section) return !collapsed ? <p key={i} style={{ flex: 'none', fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '12px 10px 4px' }}>{it.section}</p> : null;
          return <Item key={it.id || i} it={it} active={active} onNav={onNav} collapsed={collapsed} nivel={0} />;
        })}
      </div>
      {!hideAccount && (
        <div style={{ flex: 'none', margin: '0 -14px -14px' }}>
          <Menu
            block
            placement={collapsed ? 'right-end' : 'top'}
            align="left"
            ariaLabel={`Menu de ${accountName}`}
            items={itensDaConta}
            trigger={
              <button type="button" aria-label={`Abrir menu de ${accountName}`} style={{
                flex: 1, minWidth: 0, margin: '0 14px 14px', border: 'none', borderTop: '1px solid var(--ob-line-soft)',
                background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0 2px' : '10px 8px 2px', justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--ob-r-md)',
              }}>
                {conteudoConta}
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};
