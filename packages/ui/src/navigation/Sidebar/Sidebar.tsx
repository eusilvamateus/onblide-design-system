import React, { useEffect, useId, useRef, useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Menu, type MenuItem } from '../../overlays/Menu/Menu';
import { Tooltip } from '../../overlays/Tooltip/Tooltip';
import { Drawer } from '../../overlays/Drawer/Drawer';
import { Button } from '../../actions/Button/Button';
import { Badge } from '../../data-display/Badge/Badge';
import { Divider } from '../../data-display/Divider/Divider';
import { ScrollArea } from '../../data-display/ScrollArea/ScrollArea';
import { useBreakpoint } from '../../layout/useBreakpoint';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { navegarPeloLink } from '../../internal/navegacao';
import { BADGE_TONES, type BadgeTone } from '../../internal/badgeTones';

export interface SidebarItem {
  /** Identificador do item, usado em `active` e `onNav`. */
  id: string;
  /** Rótulo do item. Em texto, também aparece no Tooltip da barra recolhida. */
  label: React.ReactNode;
  /** Endereço do link. Sem `href`, o item vira um botão que só chama `onNav`. */
  href?: string;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido antes do rótulo. */
  icon?: string;
  /** Contador exibido depois do rótulo; na barra recolhida, vira um ponto sobre o ícone. */
  badge?: React.ReactNode;
  /** Tom do contador, entre os tons do `Badge`. Padrão: `neutral`. */
  badgeTone?: BadgeTone;
  /** Subitens: o item vira um grupo que abre e fecha e começa aberto se contiver o item ativo. Na barra recolhida, os subitens abrem num menu ao lado. */
  children?: SidebarItem[];
}

export interface SidebarGroup {
  /** Título do grupo; omitido, o grupo não tem título. Na barra recolhida, o título vira uma divisória. */
  label?: string;
  /** Itens do grupo. */
  items: SidebarItem[];
}

/** Forma da barra: `floating` tem borda e cantos arredondados; `flush` ocupa a coluna inteira, só com a divisória à direita. */
export type SidebarVariant = 'floating' | 'flush';

/** Estado recebido por `header` e `footer` quando são funções. */
export interface SidebarState {
  /** A barra está recolhida, só com ícones. */
  collapsed: boolean;
}

/** Conteúdo de `header` ou `footer`: um elemento, ou uma função que o monta a partir do estado da barra. */
export type SidebarSlot = React.ReactNode | ((state: SidebarState) => React.ReactNode);

export interface SidebarProps {
  /** Grupos de itens da navegação. */
  groups?: SidebarGroup[];
  /** Id do item ativo; recebe `aria-current="page"`. */
  active?: string;
  /** Chamado com o id do item escolhido. Num link, só o clique simples é interceptado: Ctrl+clique e o botão do meio continuam abrindo em outra aba. */
  onNav?: (id: string) => void;
  /** Nome acessível da navegação. */
  ariaLabel?: string;
  /** Conteúdo do topo, geralmente a marca. */
  header?: SidebarSlot;
  /** Conteúdo do rodapé, geralmente a conta da pessoa (um `Menu` com `Avatar`). */
  footer?: SidebarSlot;
  /** Permite recolher e expandir a barra. Aberta, um botão aparece sobre a borda direita quando o mouse passa pela barra; recolhida, o cabeçalho vira o botão de expandir, com o ícone no hover e no foco. */
  collapsible?: boolean;
  /** Tecla que, com Ctrl (⌘ no Mac), recolhe e expande a barra, como `b` para Ctrl+B. Aparece no Tooltip do botão. Só vale com `collapsible`. */
  toggleShortcut?: string;
  /** Barra recolhida, só com ícones, em modo controlado. */
  collapsed?: boolean;
  /** Barra recolhida no início, em modo não controlado. */
  defaultCollapsed?: boolean;
  /** Chamado quando a pessoa recolhe ou expande a barra. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Forma da barra. */
  variant?: SidebarVariant;
  /** Painel aberto em telas estreitas. Só vale com `onMobileOpenChange`. */
  mobileOpen?: boolean;
  /** Com ele, abaixo do breakpoint `sm` (768px) a barra sai da página e abre num `Drawer` controlado por `mobileOpen`. */
  onMobileOpenChange?: (open: boolean) => void;
}

const LARGURA = 240;
const ALTURA_DO_ITEM = 40;
const ALTURA_DO_SUBITEM = 32;
const ICONE = 20;
const RECUO = 'var(--ob-space-12)';
const ENTRE_ITENS = 'var(--ob-space-4)';
const LARGURA_RECOLHIDA = 72;
const LARGURA_NO_CELULAR = 300;

injectStyleOnce(
  'ob-sidebar',
  '.ob-sidebar-borda{position:absolute;top:50%;right:calc(var(--ob-space-16) * -1);transform:translate(50%,-50%);z-index:1;opacity:0;transition:opacity var(--ob-dur-fast) var(--ob-ease)}.ob-sidebar:hover .ob-sidebar-borda,.ob-sidebar-borda:focus-within{opacity:1}.ob-sidebar-abrir{display:grid;place-items:center;width:40px;height:40px;margin:0;padding:0;border:0;border-radius:var(--ob-r-control);background:transparent;color:var(--ob-fg-soft);cursor:pointer;transition:background var(--ob-dur-fast) var(--ob-ease)}.ob-sidebar-abrir>*{grid-area:1/1;display:flex;align-items:center;justify-content:center;transition:opacity var(--ob-dur-fast) var(--ob-ease)}.ob-sidebar-abrir__icone{opacity:0}.ob-sidebar-abrir[data-sem-marca] .ob-sidebar-abrir__icone{opacity:1}.ob-sidebar-abrir:hover,.ob-sidebar-abrir:focus-visible{background:var(--ob-bg-warm)}.ob-sidebar-abrir:hover .ob-sidebar-abrir__marca,.ob-sidebar-abrir:focus-visible .ob-sidebar-abrir__marca{opacity:0}.ob-sidebar-abrir:hover .ob-sidebar-abrir__icone,.ob-sidebar-abrir:focus-visible .ob-sidebar-abrir__icone{opacity:1}.ob-sidebar-abrir:focus-visible{outline:var(--ob-focus-ring-width) solid var(--ob-focus-ring);outline-offset:calc(var(--ob-focus-ring-width) * -1)}@media (hover: none){.ob-sidebar-borda{opacity:1}.ob-sidebar-abrir__marca{opacity:0}.ob-sidebar-abrir__icone{opacity:1}}.ob-sidebar-item.ob-sidebar-item{background:transparent;color:var(--ob-fg-soft);transition:background var(--ob-dur-fast) var(--ob-ease),color var(--ob-dur-fast) var(--ob-ease)}.ob-sidebar-item.ob-sidebar-item[data-grupo]{color:var(--ob-fg-strong)}.ob-sidebar-item.ob-sidebar-item:hover:not([data-ativo]){background:var(--ob-bg-warm);color:var(--ob-fg-strong)}.ob-sidebar-item:focus-visible{outline:var(--ob-focus-ring-width) solid var(--ob-focus-ring);outline-offset:calc(var(--ob-focus-ring-width) * -1)}',
);

const texto = (rotulo: React.ReactNode, reserva: string) => (typeof rotulo === 'string' || typeof rotulo === 'number' ? String(rotulo) : reserva);
const contemAtivo = (it: SidebarItem, active?: string): boolean => it.id === active || (it.children ?? []).some((c) => contemAtivo(c, active));

interface ItemProps {
  it: SidebarItem;
  active?: string;
  onNav?: (id: string) => void;
  collapsed: boolean;
  nivel: number;
  recuo?: string;
  aoEscolher?: () => void;
}

const Item: React.FC<ItemProps> = ({ it, active, onNav, collapsed, nivel, recuo = RECUO, aoEscolher }) => {
  const uid = useId();
  const grupo = !!it.children?.length;
  const recuoDosFilhos = it.icon ? `calc(${recuo} + var(--ob-space-20) + var(--ob-space-12))` : `calc(${recuo} + var(--ob-space-16))`;
  const [aberto, setAberto] = useState(() => grupo && contemAtivo(it, active));
  const atual = !grupo && active === it.id;
  const destacado = atual || (collapsed && grupo && contemAtivo(it, active));
  const rotulo = texto(it.label, it.id);
  const contador = it.badge != null ? `, ${texto(it.badge, '')}` : '';
  const estilo: React.CSSProperties = {
    flex: 'none', display: 'flex', alignItems: 'center', gap: 'var(--ob-space-12)', justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative', width: '100%', height: nivel ? ALTURA_DO_SUBITEM : ALTURA_DO_ITEM, boxSizing: 'border-box', margin: 0, border: 0, borderRadius: 'var(--ob-r-control)',
    padding: collapsed ? 0 : `0 ${RECUO} 0 ${recuo}`,
    fontFamily: 'var(--ob-font)', fontSize: nivel ? 'var(--ob-fs-13)' : 'var(--ob-fs-14)', fontWeight: destacado || grupo ? 'var(--ob-w-semibold)' : 'var(--ob-w-medium)',
    textDecoration: 'none', cursor: 'pointer', textAlign: 'left',
    ...(destacado ? { background: 'var(--ob-blue-100)', color: 'var(--ob-blue-700)' } : {}),
  };
  const comuns = {
    className: 'ob-sidebar-item',
    'data-ativo': destacado ? '' : undefined,
    'data-grupo': grupo ? '' : undefined,
    'aria-label': collapsed ? rotulo + contador : undefined,
    style: estilo,
  };
  const conteudo = (
    <>
      {it.icon && <Ph n={it.icon} size={ICONE} weight={destacado ? 'fill' : 'regular'} />}
      {!collapsed && <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>}
      {!collapsed && it.badge != null && <Badge tone={it.badgeTone ?? 'neutral'} variant="numeric">{it.badge}</Badge>}
      {!collapsed && grupo && <Ph n="caret-down" size={14} style={{ flex: 'none', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform var(--ob-dur-fast) var(--ob-ease)' }} />}
      {collapsed && it.badge != null && (
        <span aria-hidden="true" style={{ position: 'absolute', top: 'var(--ob-space-6)', right: 'var(--ob-space-12)', width: 8, height: 8, boxSizing: 'content-box', borderRadius: 'var(--ob-r-pill)', background: BADGE_TONES[it.badgeTone ?? 'neutral'].dot, border: '2px solid var(--ob-surface)' }} />
      )}
    </>
  );

  if (grupo && collapsed) {
    const paraMenu = (filhos: SidebarItem[]): MenuItem[] => filhos.map((c): MenuItem => (c.children?.length
      ? { type: 'submenu', label: texto(c.label, c.id), icon: c.icon, items: paraMenu(c.children) }
      : { label: texto(c.label, c.id), icon: c.icon, onSelect: () => { if (onNav) onNav(c.id); else if (c.href) window.location.assign(c.href); aoEscolher?.(); } }));
    return (
      <Menu block placement="right" ariaLabel={rotulo} items={[{ type: 'label', label: rotulo }, ...paraMenu(it.children!)]}
        trigger={<button type="button" aria-haspopup="menu" {...comuns}>{conteudo}</button>} />
    );
  }

  if (grupo) {
    return (
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: ENTRE_ITENS }}>
        <button type="button" aria-expanded={aberto} aria-controls={uid} onClick={() => setAberto((a) => !a)} {...comuns}>{conteudo}</button>
        {aberto && (
          <div id={uid} style={{ display: 'flex', flexDirection: 'column', gap: ENTRE_ITENS }}>
            {it.children!.map((c) => <Item key={c.id} it={c} active={active} onNav={onNav} collapsed={false} nivel={nivel + 1} recuo={recuoDosFilhos} aoEscolher={aoEscolher} />)}
          </div>
        )}
      </div>
    );
  }

  const elemento = it.href ? (
    <a href={it.href} aria-current={atual ? 'page' : undefined} onClick={(e) => { navegarPeloLink(e, it.id, onNav); aoEscolher?.(); }} {...comuns}>{conteudo}</a>
  ) : (
    <button type="button" aria-current={atual ? 'page' : undefined} onClick={() => { onNav?.(it.id); aoEscolher?.(); }} {...comuns}>{conteudo}</button>
  );
  return collapsed ? <Tooltip label={rotulo} placement="right">{elemento}</Tooltip> : elemento;
};

/** Barra lateral da aplicação: grupos de links com ícones e contadores, subitens, modo recolhido só com ícones, cabeçalho e rodapé livres e painel em telas estreitas. */
export const Sidebar: React.FC<SidebarProps> = ({
  groups = [], active, onNav, ariaLabel = 'Navegação principal', header, footer, collapsible = false, toggleShortcut,
  collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, variant = 'floating', mobileOpen = false, onMobileOpenChange,
}) => {
  const [recolhidaInterna, setRecolhidaInterna] = useState(defaultCollapsed);
  const { atLeast } = useBreakpoint();
  const noCelular = !!onMobileOpenChange && !atLeast('sm');
  const collapsed = !noCelular && (collapsedProp ?? recolhidaInterna);
  const flush = variant === 'flush';
  const resolver = (espaco: SidebarSlot) => (typeof espaco === 'function' ? espaco({ collapsed }) : espaco);
  const cabecalho = resolver(header);
  const rodape = resolver(footer);
  const fecharNoCelular = noCelular ? () => onMobileOpenChange!(false) : undefined;

  const alternar = () => {
    const proxima = !collapsed;
    if (collapsedProp === undefined) setRecolhidaInterna(proxima);
    onCollapsedChange?.(proxima);
  };
  const alternarAtual = useRef(alternar);
  alternarAtual.current = alternar;
  const idDaNavegacao = useId();
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  const atalhoAtivo = collapsible && !!toggleShortcut && !noCelular;
  useEffect(() => {
    if (!atalhoAtivo) return;
    const tecla = toggleShortcut!.toLowerCase();
    const aoTeclar = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== tecla) return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      alternarAtual.current();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [atalhoAtivo, toggleShortcut]);

  const navegacao = (
    <nav id={idDaNavegacao} aria-label={ariaLabel} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-16)' }}>
      {groups.map((g, i) => (
        <div key={g.label ?? i} role="group" aria-label={g.label} style={{ display: 'flex', flexDirection: 'column', gap: ENTRE_ITENS }}>
          {g.label && (collapsed
            ? i > 0 && <Divider decorative style={{ margin: '0 0 var(--ob-space-12)' }} />
            : <p style={{ margin: 0, padding: `0 ${RECUO}`, fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-medium)', color: 'var(--ob-fg-mute)' }}>{g.label}</p>)}
          {g.items.map((it) => <Item key={it.id} it={it} active={active} onNav={onNav} collapsed={collapsed} nivel={0} aoEscolher={fecharNoCelular} />)}
        </div>
      ))}
    </nav>
  );

  if (noCelular) {
    return (
      <Drawer open={mobileOpen} onClose={() => onMobileOpenChange!(false)} side="left" width={LARGURA_NO_CELULAR} title={cabecalho} footer={rodape}>
        {navegacao}
      </Drawer>
    );
  }

  const rotuloDoBotao = collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral';
  const tecla = toggleShortcut?.toUpperCase();
  const atalho = atalhoAtivo ? [mac ? '⌘' : 'Ctrl', tecla!] : undefined;
  const doBotao = {
    'aria-label': rotuloDoBotao,
    'aria-expanded': !collapsed,
    'aria-controls': idDaNavegacao,
    'aria-keyshortcuts': atalhoAtivo ? `${mac ? 'Meta' : 'Control'}+${tecla}` : undefined,
    onClick: alternar,
  };
  const botaoNaBorda = collapsible && !collapsed && (
    <span className="ob-sidebar-borda">
      <Tooltip label={rotuloDoBotao} shortcut={atalho} placement="right">
        <Button kind="secondary" size="sm" iconOnly icon={<Ph n="sidebar-simple" size={16} />} style={{ color: 'var(--ob-fg-soft)' }} {...doBotao} />
      </Tooltip>
    </span>
  );
  const botaoDeExpandir = collapsible && collapsed && (
    <Tooltip label={rotuloDoBotao} shortcut={atalho} placement="right">
      <button type="button" className="ob-sidebar-abrir" data-sem-marca={cabecalho == null ? '' : undefined} {...doBotao}>
        {cabecalho != null && <span className="ob-sidebar-abrir__marca">{cabecalho}</span>}
        <span className="ob-sidebar-abrir__icone"><Ph n="sidebar-simple" size={18} /></span>
      </button>
    </Tooltip>
  );

  return (
    <div className="ob-sidebar" style={{
      position: 'relative', flexShrink: flush && !collapsed ? 1 : 0, width: collapsed ? LARGURA_RECOLHIDA : flush ? '100%' : LARGURA, minWidth: 0,
      boxSizing: 'border-box', height: flush ? '100%' : undefined, background: 'var(--ob-surface)',
      border: flush ? 'none' : '1px solid var(--ob-border)', borderRight: flush ? '1px solid var(--ob-border)' : undefined,
      borderRadius: flush ? 0 : 'var(--ob-r-lg)', padding: 'var(--ob-space-16)', display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--ob-font)',
    }}>
      {(cabecalho != null || collapsible) && (
        <div style={{
          position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: ALTURA_DO_ITEM, padding: collapsed ? 0 : `0 0 0 ${RECUO}`, marginBottom: 'var(--ob-space-16)',
        }}>
          {botaoDeExpandir || (cabecalho != null && <div style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>{cabecalho}</div>)}
          {botaoNaBorda}
        </div>
      )}
      <ScrollArea style={{ flex: '1 1 auto' }}>{navegacao}</ScrollArea>
      {rodape != null && (
        <div style={{ flex: 'none', display: 'flex', justifyContent: collapsed ? 'center' : 'stretch', borderTop: '1px solid var(--ob-line-soft)', paddingTop: 'var(--ob-space-12)', marginTop: 'var(--ob-space-12)' }}>
          {rodape}
        </div>
      )}
    </div>
  );
};
