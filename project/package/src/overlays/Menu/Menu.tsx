import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Checkbox } from '../../forms/Checkbox/Checkbox';
import { Radio } from '../../forms/Radio/Radio';
import { Switch } from '../../forms/Switch/Switch';
import { Avatar } from '../../data-display/Avatar/Avatar';
import { Badge } from '../../data-display/Badge/Badge';
import { SearchInput } from '../../forms/SearchInput/SearchInput';
import { List, ListItem, ListSubheader, ListDivider } from '../../data-display/List/List';

// Lista de comandos sobreposta à interface — três eixos independentes: variante de conteúdo (o que o item
// mostra), abertura (`Menu` ancorado ou `ContextMenu` por clique direito/Shift+F10) e densidade (`size`).
// Os componentes embutidos (Checkbox, Radio, Switch) ficam `inert` dentro do item: o item recebe clique e
// teclado, o componente só mostra o estado — um item, uma parada de foco.

export type MenuSize = 'md' | 'sm';

interface MenuSizeSpec { pad: string; fs: number; lh: string; gap: number; panelPad: number; min: number; sepM: string; labelPad: string; icon: number; avatar: number }
const MENU_SIZES: Record<MenuSize, MenuSizeSpec> = {
  md: { pad: '7px 10px', fs: 14, lh: '20px', gap: 10, panelPad: 6, min: 220, sepM: '5px -6px', labelPad: '8px 10px 4px', icon: 16, avatar: 32 },
  sm: { pad: '4px 8px', fs: 13, lh: '18px', gap: 8, panelPad: 4, min: 180, sepM: '3px -4px', labelPad: '6px 8px 2px', icon: 14, avatar: 24 },
};

export type MenuItem =
  | { type?: 'item'; label: string; icon?: string; shortcut?: string; description?: string; tone?: 'danger'; disabled?: boolean; onSelect?: () => void }
  | { type: 'option'; label: string; checked: boolean; disabled?: boolean; onSelect: () => void }
  | { type: 'radio'; group: string; label: string; description?: string; checked: boolean; disabled?: boolean; onSelect: () => void }
  | { type: 'checkbox'; label: string; checked: boolean; indeterminate?: boolean; disabled?: boolean; onChange: (v: boolean) => void }
  | { type: 'toggle'; label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }
  | { type: 'account'; name: string; email: string; current?: boolean; badge?: number; large?: boolean; disabled?: boolean; onSelect?: () => void }
  | { type: 'submenu'; label: string; icon?: string; disabled?: boolean; items: MenuItem[] }
  | { type: 'label'; label: string }
  | { type: 'separator' };

const isFocusable = (it: MenuItem | undefined) => !!it && it.type !== 'separator' && it.type !== 'label' && !('disabled' in it && it.disabled);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => { if (search) setActive(-1); }, [search?.value]);
  const hasLead = items.some((it) => (it.type !== 'separator' && it.type !== 'label' && 'icon' in it && it.icon) || it.type === 'checkbox' || it.type === 'radio' || it.type === 'account');
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
      style={{
        background: 'var(--ob-surface)', border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
        padding: z.panelPad, minWidth: z.min, zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'], outline: 'none',
        display: 'flex', flexDirection: 'column', gap: 1, boxSizing: 'border-box', ...style,
      }}>
      {search && (
        <div style={{ padding: `2px 2px ${z.panelPad}px`, borderBottom: '1px solid var(--ob-border)', margin: `0 -${z.panelPad}px ${z.panelPad}px`, paddingLeft: z.panelPad, paddingRight: z.panelPad }}>
          <SearchInput value={search.value} onChange={search.onChange} placeholder={search.placeholder} width="100%" />
        </div>
      )}
      {search && items.length === 0 && <div style={{ padding: z.pad, fontSize: z.fs, color: 'var(--ob-fg-soft)' }}>{empty}</div>}
      {items.map((it, i) => {
        if (it.type === 'separator') return <ListDivider key={i} style={{ margin: z.sepM }} />;
        if (it.type === 'label') return <ListSubheader key={i} size={size}>{it.label}</ListSubheader>;
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
        else if (t === 'account') { const ai = it as Extract<MenuItem, { type: 'account' }>; lead = <Embed><Avatar name={ai.name} size={ai.large ? z.avatar + 8 : z.avatar} /></Embed>; }
        else if ('icon' in it && it.icon) lead = <Ph n={it.icon} size={z.icon} c="currentColor" />;
        const centered = t === 'account' || t === 'toggle' || t === 'checkbox' || t === 'radio';
        const checkedMark = t === 'option' || (t === 'account' && (it as Extract<MenuItem, { type: 'account' }>).current)
          ? <span style={{ display: 'flex', width: z.icon, color: 'var(--ob-blue)' }}>{('checked' in it && it.checked) || (t === 'account' && (it as Extract<MenuItem, { type: 'account' }>).current) ? <Ph n="check" size={z.icon} c="currentColor" /> : null}</span>
          : null;
        const badge = 'badge' in it ? it.badge : undefined;
        const trail = badge != null || t === 'toggle' || checkedMark || isSub ? (
          <>
            {badge != null && <Embed><Badge tone="red" variant="numeric" size="sm">{badge}</Badge></Embed>}
            {t === 'toggle' && <Embed><Switch size="sm" checked={!!(it as Extract<MenuItem, { type: 'toggle' }>).checked} /></Embed>}
            {checkedMark}
            {isSub && <span style={{ display: 'flex', marginLeft: 2 }}><Ph n="caret-right" size={14} c="currentColor" /></span>}
          </>
        ) : null;
        const shortcut = 'shortcut' in it ? it.shortcut : undefined;
        return (
          <ListItem key={i} id={`${uid}-${i}`} role={role} aria-checked={selectable ? !!(it as { checked?: boolean }).checked : undefined}
            aria-haspopup={isSub ? 'menu' : undefined} aria-expanded={isSub ? subOpen : undefined}
            size={size} highlighted={hl} disabled={'disabled' in it ? it.disabled : undefined} tone={danger ? 'danger' : undefined}
            align={centered ? 'center' : 'start'} indent={hasLead}
            leading={lead} title={label} strong={t === 'account' ? (it as Extract<MenuItem, { type: 'account' }>).large : undefined}
            description={desc} wrap={t !== 'account'}
            meta={shortcut && <kbd style={{ fontFamily: 'var(--ob-font-mono)', marginLeft: 16 }}>{shortcut}</kbd>} trailing={trail}
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
                style={{ position: 'absolute', left: '100%', top: -(z.panelPad + 1), marginLeft: z.panelPad + 2, minWidth: 180 }} />
            )}
          </ListItem>
        );
      })}
    </div>
  );
};

function useOutside(ref: React.RefObject<HTMLElement | null>, active: boolean, onOut: () => void) {
  React.useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [active, onOut, ref]);
}

export interface MenuProps {
  trigger: React.ReactElement;
  items: MenuItem[];
  align?: 'left' | 'right';
  size?: MenuSize;
  search?: MenuSearchProps;
  ariaLabel?: string;
  /** Abre o painel já montado, sem esperar o clique — para demonstrações e capturas de tela. */
  defaultOpen?: boolean;
}

/** Menu de comandos aberto a partir de um gatilho: itens simples, com ícone/atalho/descrição, seleção
 * única, radio, checkbox, toggle, busca, contas e submenus — com teclado completo. */
export const Menu: React.FC<MenuProps> = ({ trigger, items, align = 'left', ariaLabel, defaultOpen = false, ...panel }) => {
  const [open, setOpen] = React.useState<{ kb: boolean } | null>(defaultOpen ? { kb: false } : null);
  const wrap = React.useRef<HTMLDivElement>(null);
  useOutside(wrap, !!open, () => setOpen(null));
  const close = () => { setOpen(null); const el = wrap.current?.querySelector<HTMLElement>('button, a, [tabindex="0"]'); el?.focus(); };
  return (
    <div ref={wrap} style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ display: 'inline-flex' }} onClick={(e) => setOpen(open ? null : { kb: e.detail === 0 })}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen({ kb: true }); } }}>{trigger}</span>
      {open && (
        <MenuPanel {...panel} items={items} keyboard={open.kb} onCloseTree={close} ariaLabel={ariaLabel}
          style={{ position: 'absolute', top: 'calc(100% + 6px)', [align === 'right' ? 'right' : 'left']: 0 }} />
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
  const [pos, setPos] = React.useState<{ x: number; y: number; kb: boolean; flip: boolean; w: number } | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  useOutside(box, !!pos, () => setPos(null));
  const openAt = (x: number, y: number, kb: boolean) => { const w = wrap.current!.offsetWidth; setPos({ x, y, kb, flip: x > w - 240, w }); };
  const close = () => { setPos(null); wrap.current?.focus({ preventScroll: true }); };
  return (
    <div ref={wrap} tabIndex={0} aria-haspopup="menu" style={{ position: 'relative', outline: 'none', ...style }}
      onContextMenu={(e) => { e.preventDefault(); if (box.current?.contains(e.target as Node)) return; const r = wrap.current!.getBoundingClientRect(); openAt(e.clientX - r.left, e.clientY - r.top, false); }}
      onKeyDown={(e) => { if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') { e.preventDefault(); openAt(16, 16, true); } }}>
      {children}
      {pos && (
        <div ref={box} style={{ position: 'absolute', top: pos.y, ...(pos.flip ? { right: pos.w - pos.x } : { left: pos.x }), zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'] }}>
          <MenuPanel {...panel} key={`${pos.x},${pos.y}`} items={items} keyboard={pos.kb} onCloseTree={close} ariaLabel={ariaLabel} />
        </div>
      )}
    </div>
  );
};
