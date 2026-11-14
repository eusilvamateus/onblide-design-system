import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Checkbox } from '../../forms/Checkbox/Checkbox';
import { Radio } from '../../forms/Radio/Radio';
import { Switch } from '../../forms/Switch/Switch';
import { Avatar } from '../../data-display/Avatar/Avatar';
import { Badge } from '../../data-display/Badge/Badge';
import { Kbd } from '../../data-display/Kbd/Kbd';
import { SearchInput } from '../../forms/SearchInput/SearchInput';
import { Ancorado, estaDentro, retanguloDe, useCamada } from '../../internal/camada';
import type { Camada } from '../../internal/camada';
import type { Lado } from '../../internal/floating';
import { List, ListItem, ListSubheader, ListDivider } from '../../data-display/List/List';

export type MenuSize = 'md' | 'sm';

interface MenuSizeSpec { pad: string; fs: string; lh: string; gap: string; panelPad: number; min: number; sepM: string; labelPad: string; icon: number; avatar: number }
const MENU_SIZES: Record<MenuSize, MenuSizeSpec> = {
  md: { pad: 'var(--ob-space-8) var(--ob-space-10)', fs: 'var(--ob-fs-14)', lh: '20px', gap: 'var(--ob-space-10)', panelPad: 6, min: 220, sepM: 'var(--ob-space-6) calc(var(--ob-space-6) * -1)', labelPad: 'var(--ob-space-8) var(--ob-space-10) var(--ob-space-4)', icon: 16, avatar: 32 },
  sm: { pad: 'var(--ob-space-4) var(--ob-space-8)', fs: 'var(--ob-fs-13)', lh: '18px', gap: 'var(--ob-space-8)', panelPad: 4, min: 180, sepM: 'var(--ob-space-4) calc(var(--ob-space-4) * -1)', labelPad: 'var(--ob-space-6) var(--ob-space-8) var(--ob-space-2)', icon: 14, avatar: 24 },
};

export type MenuItem =
  | { type?: 'item'; label: string; icon?: string; shortcut?: string; description?: string; tone?: 'danger'; disabled?: boolean; onSelect?: () => void }
  | { type: 'option'; label: string; checked: boolean; disabled?: boolean; onSelect: () => void }
  | { type: 'radio'; group: string; label: string; description?: string; checked: boolean; disabled?: boolean; onSelect: () => void }
  | { type: 'checkbox'; label: string; checked: boolean; indeterminate?: boolean; disabled?: boolean; onChange: (v: boolean) => void }
  | { type: 'toggle'; label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }
  | { type: 'account'; name: string; email: string; src?: string; initials?: string; avatarColor?: string; avatarTextColor?: string; current?: boolean; badge?: number; large?: boolean; disabled?: boolean; onSelect?: () => void }
  | { type: 'submenu'; label: string; icon?: string; disabled?: boolean; items: MenuItem[] }
  | { type: 'label'; label: string }
  | { type: 'custom'; content: React.ReactNode; ariaLabel?: string }
  | { type: 'separator' };

const isFocusable = (it: MenuItem | undefined) => !!it && it.type !== 'separator' && it.type !== 'label' && it.type !== 'custom' && !('disabled' in it && it.disabled);
function step(items: MenuItem[], from: number, dir: 1 | -1): number {
  const n = items.length;
  for (let k = 1; k <= n; k++) { const i = (((from + dir * k) % n) + n) % n; if (isFocusable(items[i])) return i; }
  return -1;
}

function Embed({ children }: { children: React.ReactNode }) {
  return (
    <span ref={(el) => el?.setAttribute('inert', '')} aria-hidden="true" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none', flex: 'none' }}>
      {children}
    </span>
  );
}

export interface MenuSearchProps { value: string; onChange: (value: string) => void; placeholder?: string }

interface MenuPanelProps {
  items: MenuItem[];
  size?: MenuSize;
  search?: MenuSearchProps;
  empty?: React.ReactNode;
  level?: number;
  keyboard?: boolean;
  autoFocus?: boolean;
  onClose?: () => void;
  onCloseTree?: () => void;
  onNavOut?: (dir: 1 | -1) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/** Painel de itens de um `Menu`/`ContextMenu`/`Menubar` — mesma anatomia e teclado nos três. */
export const MenuPanel: React.FC<MenuPanelProps> = ({ items, size = 'md', search, empty = 'Nada encontrado', level = 0, keyboard = false, onClose, onCloseTree, onNavOut, style, ariaLabel, autoFocus = true }) => {
  const densidade = size === 'sm' ? 'xs' : 'sm';
  const z = MENU_SIZES[size];
  const [active, setActive] = React.useState(keyboard ? step(items, -1, 1) : -1);
  const [sub, setSub] = React.useState<{ i: number; kb: boolean }>({ i: -1, kb: false });
  const ref = React.useRef<HTMLDivElement>(null);
  const typed = React.useRef({ s: '', t: 0 });
  const uid = React.useId();
  React.useEffect(() => {
    if (!autoFocus || !ref.current) return;
    const input = search && ref.current.querySelector<HTMLElement>('input');
    (input || ref.current).focus({ preventScroll: true });
  }, []);
  React.useEffect(() => { if (search) setActive(-1); }, [search?.value]);
  const hasLead = items.some((it) => (it.type !== 'separator' && it.type !== 'label' && it.type !== 'custom' && 'icon' in it && it.icon) || it.type === 'checkbox' || it.type === 'radio' || it.type === 'account');
  const closeTree = () => onCloseTree?.();
  const closeSub = () => { setSub({ i: -1, kb: false }); ref.current?.focus({ preventScroll: true }); };
  const activate = (i: number, kb: boolean) => {
    const it = items[i];
    if (!isFocusable(it)) return;
    if (it.type === 'submenu') { setActive(i); setSub({ i, kb }); return; }
    if (it.type === 'checkbox' || it.type === 'toggle') { it.onChange(!it.checked); return; }
    if (it.type === 'radio') { it.onSelect(); return; }
    if (it.type === 'option' || it.type === 'account' || !it.type || it.type === 'item') (it as { onSelect?: () => void }).onSelect?.();
    closeTree();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest('[data-ob-menu-custom]')) {
      if (e.key === 'Escape') { e.preventDefault(); if (level > 0) onClose?.(); else closeTree(); }
      return;
    }
    const k = e.key, it = items[active];
    const inInput = (e.target as HTMLElement).tagName === 'INPUT';
    if (inInput && !['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(k)) return;
    if (k === 'ArrowDown') { e.preventDefault(); setActive(step(items, active, 1)); }
    else if (k === 'ArrowUp') { e.preventDefault(); setActive(step(items, active < 0 ? items.length : active, -1)); }
    else if (k === 'Home') { e.preventDefault(); setActive(step(items, -1, 1)); }
    else if (k === 'End') { e.preventDefault(); setActive(step(items, items.length, -1)); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); const i = active >= 0 ? active : inInput ? step(items, -1, 1) : -1; if (i >= 0) activate(i, true); }
    else if (k === 'ArrowRight') { e.preventDefault(); if (it?.type === 'submenu' && !it.disabled) setSub({ i: active, kb: true }); else onNavOut?.(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); if (level > 0) onClose?.(); else onNavOut?.(-1); }
    else if (k === 'Escape') { e.preventDefault(); if (level > 0) onClose?.(); else closeTree(); }
    else if (k === 'Tab') { closeTree(); }
    else if (k.length === 1 && /\S/.test(k)) {
      const now = Date.now();
      typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : '') + k.toLowerCase(), t: now };
      const n = items.length;
      for (let d = 1; d <= n; d++) {
        const i = (((active < 0 ? -1 : active) + d) % n + n) % n;
        const label = 'label' in items[i] ? items[i].label : ('name' in items[i] ? (items[i] as { name: string }).name : '');
        if (isFocusable(items[i]) && String(label).toLowerCase().startsWith(typed.current.s)) { setActive(i); break; }
      }
    }
  };
  return (
    <div ref={ref} role="menu" aria-label={ariaLabel} tabIndex={-1} aria-activedescendant={active >= 0 ? `${uid}-${active}` : undefined} onKeyDown={onKeyDown} onClick={(e) => e.stopPropagation()}
      onBlur={items.some((x) => x.type === 'custom') && level === 0 ? (e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) closeTree(); } : undefined}
      style={{
        background: 'var(--ob-surface)', border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
        padding: z.panelPad, minWidth: z.min, zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'], outline: 'none',
        display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)', boxSizing: 'border-box', ...style,
      }}>
      {search && (
        <div style={{ padding: `var(--ob-space-2) var(--ob-space-2) ${z.panelPad}px`, borderBottom: '1px solid var(--ob-border)', margin: `0 -${z.panelPad}px ${z.panelPad}px`, paddingLeft: z.panelPad, paddingRight: z.panelPad }}>
          <SearchInput value={search.value} onChange={search.onChange} placeholder={search.placeholder} width="100%" />
        </div>
      )}
      {search && items.length === 0 && <div style={{ padding: z.pad, fontSize: z.fs, color: 'var(--ob-fg-soft)' }}>{empty}</div>}
      {items.map((it, i) => {
        if (it.type === 'separator') return <ListDivider key={i} style={{ margin: z.sepM }} />;
        if (it.type === 'label') return <ListSubheader key={i} size={densidade}>{it.label}</ListSubheader>;
        if (it.type === 'custom') {
          return (
            <div key={i} role="group" aria-label={it.ariaLabel} data-ob-menu-custom="" style={{ padding: 'var(--ob-space-4) var(--ob-space-2)' }}
              onMouseEnter={() => { setActive(-1); setSub({ i: -1, kb: false }); }}>
              {it.content}
            </div>
          );
        }
        const t = it.type ?? 'item';
        const danger = 'tone' in it && it.tone === 'danger';
        const isSub = t === 'submenu', subOpen = isSub && sub.i === i, hl = i === active || subOpen;
        const selectable = t === 'checkbox' || t === 'radio' || t === 'toggle' || t === 'option';
        const role = t === 'checkbox' || t === 'toggle' ? 'menuitemcheckbox' : t === 'radio' || t === 'option' ? 'menuitemradio' : 'menuitem';
        const label = t === 'account' ? (it as { name: string }).name : (it as { label: string }).label;
        const desc = t === 'account' ? (it as { email: string }).email : (it as { description?: string }).description;
        let lead: React.ReactNode = null;
        if (t === 'checkbox') { const ci = it as Extract<MenuItem, { type: 'checkbox' }>; lead = <Embed><Checkbox checked={!!ci.checked} indeterminate={ci.indeterminate} ariaLabel={label} onChange={() => {}} /></Embed>; }
        else if (t === 'radio') { const ri = it as Extract<MenuItem, { type: 'radio' }>; lead = <Embed><Radio name={ri.group} value={label} checked={!!ri.checked} /></Embed>; }
        else if (t === 'account') { const ai = it as Extract<MenuItem, { type: 'account' }>; lead = <Embed><Avatar name={ai.name} initials={ai.initials} src={ai.src} color={ai.avatarColor} textColor={ai.avatarTextColor} size={ai.large ? z.avatar + 8 : z.avatar} /></Embed>; }
        else if ('icon' in it && it.icon) lead = <Ph n={it.icon} size={z.icon} c="currentColor" />;
        const centered = t === 'account' || t === 'toggle' || t === 'checkbox' || t === 'radio';
        const checkedMark = t === 'option' || (t === 'account' && (it as Extract<MenuItem, { type: 'account' }>).current)
          ? <span style={{ display: 'flex', width: z.icon, color: 'var(--ob-blue)' }}>{('checked' in it && it.checked) || (t === 'account' && (it as Extract<MenuItem, { type: 'account' }>).current) ? <Ph n="check" size={z.icon} c="currentColor" /> : null}</span>
          : null;
        const badge = 'badge' in it ? it.badge : undefined;
        const trail = badge != null || t === 'toggle' || checkedMark || isSub ? (
          <>
            {badge != null && <Embed><Badge tone="danger" variant="numeric" size="sm">{badge}</Badge></Embed>}
            {t === 'toggle' && <Embed><Switch size="sm" checked={!!(it as Extract<MenuItem, { type: 'toggle' }>).checked} /></Embed>}
            {checkedMark}
            {isSub && <span style={{ display: 'flex', marginLeft: 'var(--ob-space-2)' }}><Ph n="caret-right" size={14} c="currentColor" /></span>}
          </>
        ) : null;
        const shortcut = 'shortcut' in it ? it.shortcut : undefined;
        return (
          <ListItem key={i} id={`${uid}-${i}`} role={role} aria-checked={selectable ? !!(it as { checked?: boolean }).checked : undefined}
            aria-haspopup={isSub ? 'menu' : undefined} aria-expanded={isSub ? subOpen : undefined}
            size={densidade} highlighted={hl} disabled={'disabled' in it ? it.disabled : undefined} tone={danger ? 'danger' : undefined}
            align={centered ? 'center' : 'start'} indent={hasLead}
            leading={lead} title={label} strong={t === 'account' ? (it as Extract<MenuItem, { type: 'account' }>).large : undefined}
            description={desc} wrap={t !== 'account'}
            meta={shortcut && <span style={{ marginLeft: 'var(--ob-space-16)' }}><Kbd appearance="ghost" size="sm">{shortcut}</Kbd></span>} trailing={trail}
            onMouseEnter={() => {
              if ('disabled' in it && it.disabled) { setActive(-1); setSub({ i: -1, kb: false }); return; }
              setActive(i);
              if (!subOpen) setSub(isSub ? { i, kb: false } : { i: -1, kb: false });
              if (!search) ref.current?.focus({ preventScroll: true });
            }}
            onMouseLeave={() => { if (!subOpen) setActive((a) => (a === i ? -1 : a)); }}
            onClick={() => activate(i, false)}>
            {subOpen && (
              <MenuPanel key={sub.kb ? 'k' : 'm'} items={(it as Extract<MenuItem, { type: 'submenu' }>).items} size={size} level={level + 1} keyboard={sub.kb} autoFocus={sub.kb}
                onClose={closeSub} onCloseTree={onCloseTree} onNavOut={onNavOut} ariaLabel={label}
                style={{ position: 'absolute', left: '100%', top: -(z.panelPad + 1), marginLeft: `calc(${z.panelPad}px + var(--ob-space-2))`, minWidth: 180 }} />
            )}
          </ListItem>
        );
      })}
    </div>
  );
};

function useForaDaCamada(ativo: boolean, camada: Camada, elementos: () => (Element | null)[], aoSair: () => void) {
  React.useEffect(() => {
    if (!ativo) return undefined;
    const h = (e: MouseEvent) => { if (!estaDentro(e.target, camada, ...elementos())) aoSair(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ativo]);
}

export interface MenuProps {
  trigger: React.ReactElement;
  items: MenuItem[];
  align?: 'left' | 'right';
  /** Lado em que o painel abre. `auto` mede o espaço disponível na janela e escolhe `bottom` ou `top`.
   * `right` abre ao lado do gatilho, alinhado ao topo; `right-end`, alinhado à base (útil para o rodapé de uma
   * barra lateral recolhida). */
  placement?: 'bottom' | 'top' | 'auto' | 'right' | 'right-end';
  /** Faz o gatilho ocupar toda a largura disponível em vez de só a do conteúdo. */
  block?: boolean;
  size?: MenuSize;
  search?: MenuSearchProps;
  ariaLabel?: string;
  /** Abre o painel já montado, sem esperar o clique — para demonstrações e capturas de tela. */
  defaultOpen?: boolean;
}

const ancoragem = (placement: NonNullable<MenuProps['placement']>, align: 'left' | 'right'): { lado: Lado; alinhamento: 'start' | 'end'; folga: number } => {
  if (placement === 'right') return { lado: 'right', alinhamento: 'start', folga: 8 };
  if (placement === 'right-end') return { lado: 'right', alinhamento: 'end', folga: 8 };
  return { lado: placement === 'top' ? 'top' : 'bottom', alinhamento: align === 'right' ? 'end' : 'start', folga: 6 };
};

/** Menu de comandos aberto a partir de um gatilho: itens simples, com ícone/atalho/descrição, seleção
 * única, radio, checkbox, toggle, busca, contas, submenus e blocos de conteúdo livre (`type: 'custom'`) — com
 * teclado completo. */
export const Menu: React.FC<MenuProps> = ({ trigger, items, align = 'left', placement = 'auto', block = false, ariaLabel, defaultOpen = false, ...panel }) => {
  const [open, setOpen] = React.useState<{ kb: boolean } | null>(defaultOpen ? { kb: false } : null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const gatilho = React.useRef<HTMLSpanElement>(null);
  const painel = React.useRef<HTMLDivElement>(null);
  const camada = useCamada();
  useForaDaCamada(!!open, camada, () => [wrap.current, painel.current], () => setOpen(null));
  const close = () => { setOpen(null); const el = wrap.current?.querySelector<HTMLElement>('button, a, [tabindex="0"]'); el?.focus(); };
  const abrir = (kb: boolean) => setOpen({ kb });
  return (
    <div ref={wrap} style={{ position: 'relative', display: block ? 'block' : 'inline-block' }}>
      <span ref={gatilho} style={{ display: block ? 'flex' : 'inline-flex' }} onClick={(e) => (open ? setOpen(null) : abrir(e.detail === 0))}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); abrir(true); } }}>{trigger}</span>
      {open && (
        <Ancorado ref={painel} camada={camada} ancora={() => retanguloDe(gatilho.current)} {...ancoragem(placement, align)}>
          <MenuPanel {...panel} items={items} keyboard={open.kb} onCloseTree={close} ariaLabel={ariaLabel} />
        </Ancorado>
      )}
    </div>
  );
};

export interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
  size?: MenuSize;
  search?: MenuSearchProps;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/** Menu de contexto: clique direito ou Shift+F10 dentro da área. Mesma anatomia e teclado do `Menu`. */
export const ContextMenu: React.FC<ContextMenuProps> = ({ items, children, style, ariaLabel, ...panel }) => {
  const [pos, setPos] = React.useState<{ x: number; y: number; kb: boolean } | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  const camada = useCamada();
  useForaDaCamada(!!pos, camada, () => [box.current], () => setPos(null));
  const openAt = (x: number, y: number, kb: boolean) => setPos({ x, y, kb });
  const ponto = () => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r || !pos) return null;
    const x = r.left + pos.x;
    const y = r.top + pos.y;
    return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
  };
  const close = () => { setPos(null); wrap.current?.focus({ preventScroll: true }); };
  return (
    <div ref={wrap} tabIndex={0} aria-haspopup="menu" style={{ position: 'relative', outline: 'none', ...style }}
      onContextMenu={(e) => { e.preventDefault(); if (box.current?.contains(e.target as Node)) return; const r = wrap.current!.getBoundingClientRect(); openAt(e.clientX - r.left, e.clientY - r.top, false); }}
      onKeyDown={(e) => { if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') { e.preventDefault(); openAt(16, 16, true); } }}>
      {children}
      {pos && (
        <Ancorado ref={box} camada={camada} ancora={ponto} folga={0}>
          <MenuPanel {...panel} key={`${pos.x},${pos.y}`} items={items} keyboard={pos.kb} onCloseTree={close} ariaLabel={ariaLabel} />
        </Ancorado>
      )}
    </div>
  );
};
