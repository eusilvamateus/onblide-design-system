// project/package/src/navigation/SideNav/SideNav.tsx
import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';

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
}

export interface SideNavProps {
  /** Itens e seções exibidos na lista de navegação. */
  items?: SideNavItem[];
  /** Id do item atualmente ativo. */
  active?: string;
  /** Chamado com o id do item clicado. */
  onNav?: (id?: string) => void;
  /** Exibe a navegação no modo recolhido, só com ícones. */
  collapsed?: boolean;
  /** Chamado ao clicar no botão de recolher/expandir; omitido, o botão some. */
  onToggle?: () => void;
  /** Ocupa 100% do espaço disponível, sem borda arredondada nem largura fixa. */
  flush?: boolean;
  /** Nome do workspace exibido no rodapé de conta. */
  workspaceName?: string;
  /** Iniciais exibidas no avatar do rodapé de conta. */
  userInitials?: string;
  /** Oculta o cabeçalho com a marca e o botão de recolher (útil quando a navegação é só uma lista). */
  hideBrand?: boolean;
  /** Oculta o rodapé com a conta do usuário. */
  hideAccount?: boolean;
  /** Rótulo acima da lista; `null` remove. Padrão: "Menu". */
  menuLabel?: string | null;
}

/** Navegação lateral com seções, itens ativos, badges e modo recolhido. */
export const SideNav: React.FC<SideNavProps> = ({ items = [], active, onNav, collapsed = false, onToggle, flush = false, workspaceName = 'Workspace', userInitials = 'OB', hideBrand = false, hideAccount = false, menuLabel = 'Menu' }) => (
  <div style={{ width: flush ? '100%' : (collapsed ? 72 : 240), minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', height: flush ? '100%' : undefined, background: 'var(--ob-surface)', border: flush ? 'none' : '1px solid var(--ob-border)', borderRight: flush ? '1px solid var(--ob-border)' : undefined, borderRadius: flush ? 0 : 'var(--ob-r-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
    {hideBrand ? null : collapsed
      ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <button onClick={onToggle} title="Expandir" style={{ width: 36, height: 36, borderRadius: 'var(--ob-r-md)', border: '1.5px solid var(--ob-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-blue)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-right" size={18}/>
          </button>
        </div>
      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 28, height: 28, borderRadius: 'var(--ob-r-sm)', background: 'var(--ob-blue)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>O</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Onblide</span>
          </div>
          {onToggle && <button onClick={onToggle} title="Recolher" style={{ width: 30, height: 30, borderRadius: 'var(--ob-r-md)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-fg-strong)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-left" size={18}/>
          </button>}
        </div>
    }
    {!collapsed && menuLabel !== null && <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '0 10px 6px' }}>{menuLabel}</p>}
    {items.map((it, i) => {
      if (it.section) return !collapsed ? <p key={i} style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '12px 10px 4px' }}>{it.section}</p> : null;
      const on = active === it.id;
      return (
        <button key={it.id || i} onClick={() => onNav?.(it.id)} title={collapsed ? (typeof it.label === 'string' ? it.label : undefined) : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start', height: 42, padding: collapsed ? 0 : '0 12px', borderRadius: 'var(--ob-r-md)', border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'var(--ob-blue-100)' : 'transparent', color: on ? 'var(--ob-blue-700)' : 'var(--ob-fg-soft)', fontFamily: 'var(--ob-font)', fontSize: 14, fontWeight: on ? 600 : 500, transition: 'background 0.12s' }}
          onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
          onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
          {on && <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 3, background: 'var(--ob-blue)' }} />}
          {it.icon && <Ph n={it.icon} size={20} />}
          {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>}
          {!collapsed && it.badge != null && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--ob-orange)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
          {collapsed && it.badge != null && <span style={{ position: 'absolute', top: 7, right: 9, width: 8, height: 8, borderRadius: 999, background: 'var(--ob-orange)', border: '2px solid var(--ob-surface)' }} />}
        </button>
      );
    })}
    {!hideAccount && <div style={{ marginTop: 'auto', borderTop: '1px solid var(--ob-line-soft)', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0 2px' : '10px 8px 2px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--ob-blue)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{userInitials}</span>
      {!collapsed && <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Onblide</div><div style={{ fontSize: 11, color: 'var(--ob-fg-mute)' }}>{workspaceName}</div></div>}
    </div>}
  </div>
);
