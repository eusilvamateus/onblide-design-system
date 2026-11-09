import React from 'react';
import ReactDOM from 'react-dom';
import { Ph } from '../../iconography/Ph/Ph';
import { Checkbox } from '../../forms/Checkbox/Checkbox';
import { Spinner } from '../../feedback/Spinner/Spinner';
import { StatusDot } from '../../internal/StatusDot';
import { Badge } from '../../data-display/Badge/Badge';
import { Button } from '../../actions/Button/Button';
import { List, ListItem } from '../List/List';
import { Menu, type MenuItem } from '../../overlays/Menu/Menu';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import type { BadgeTone } from '../../internal/badgeTones';

const normalize = (s: string) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const INDENT = { md: 16, sm: 12 } as const;
const BASE = { md: 8, sm: 6 } as const;
const PAD_Y = { md: 6, sm: 4 } as const;

injectStyleOnce('ob-treeview-kf', `
.ob-tv-row{outline:none}
.ob-tv-row:focus-visible{box-shadow:inset 0 0 0 2px var(--ob-blue)}
.ob-tv-row .ob-tv-act{opacity:0;transition:opacity var(--ob-dur-fast) var(--ob-ease)}
.ob-tv-row:hover .ob-tv-act,.ob-tv-row:focus-within .ob-tv-act{opacity:1}
.ob-tv-caret:hover,.ob-tv-handle:hover{background:var(--ob-bg-alt);color:var(--ob-fg-strong)}
.ob-tv-handle{cursor:grab;touch-action:none}
@keyframes ob-tv-lift{from{transform:scale(1) rotate(0);box-shadow:var(--ob-shadow-sm)}to{transform:scale(1.03) rotate(1.5deg);box-shadow:var(--ob-shadow-lg)}}
@keyframes ob-tv-flash{from{background:var(--ob-blue-100)}to{background:transparent}}
`);
const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  iconOpen?: string;
  meta?: React.ReactNode;
  status?: BadgeTone;
  statusLabel?: string;
  badge?: string | number;
  disabled?: boolean;
  /** Presente = pasta (pode estar vazia); ausente = folha. */
  children?: TreeNode[];
  /** Filhos sob demanda, carregados por `loadChildren`. */
  hasChildren?: boolean;
}
interface Located { node: TreeNode; parent: TreeNode | null }

const walk = (nodes: TreeNode[], fn: (n: TreeNode, parent: TreeNode | null) => void, parent: TreeNode | null = null) =>
  nodes.forEach((n) => { fn(n, parent); if (n.children) walk(n.children, fn, n); });
const indexOf = (nodes: TreeNode[]): Map<string, Located> => { const m = new Map<string, Located>(); walk(nodes, (n, p) => m.set(n.id, { node: n, parent: p })); return m; };
const mapNode = (nodes: TreeNode[], id: string, fn: (n: TreeNode) => TreeNode): TreeNode[] =>
  nodes.map((n) => (n.id === id ? fn(n) : n.children ? { ...n, children: mapNode(n.children, id, fn) } : n));
const removeNode = (nodes: TreeNode[], id: string): [TreeNode[], TreeNode | null] => {
  let out: TreeNode | null = null;
  const rec = (arr: TreeNode[]): TreeNode[] => arr.filter((n) => { if (n.id === id) { out = n; return false; } return true; }).map((n) => (n.children ? { ...n, children: rec(n.children) } : n));
  return [rec(nodes), out];
};
const insertNode = (nodes: TreeNode[], targetId: string, pos: 'before' | 'after' | 'inside', node: TreeNode): TreeNode[] => {
  if (pos === 'inside') return mapNode(nodes, targetId, (t) => ({ ...t, children: [...(t.children || []), node] }));
  const rec = (arr: TreeNode[]): TreeNode[] => {
    const i = arr.findIndex((n) => n.id === targetId);
    if (i >= 0) { const c = arr.slice(); c.splice(pos === 'before' ? i : i + 1, 0, node); return c; }
    return arr.map((n) => (n.children ? { ...n, children: rec(n.children) } : n));
  };
  return rec(nodes);
};
const isDescendant = (index: Map<string, Located>, id: string, ancestorId: string): boolean => {
  let e = index.get(id);
  while (e && e.parent) { if (e.parent.id === ancestorId) return true; e = index.get(e.parent.id); }
  return false;
};
const descendantIds = (n: TreeNode): string[] => { const r: string[] = []; walk(n.children || [], (c) => { if (!c.disabled) r.push(c.id); }); return r; };
const hasKids = (n: TreeNode) => !!(n.children || n.hasChildren);

function Match({ text, query }: { text: string; query: string }) {
  const q = normalize(query).trim();
  const i = q ? normalize(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark style={{ background: 'var(--ob-blue-100)', color: 'inherit', borderRadius: 'var(--ob-r-2xs)' }}>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}
function Inert({ children }: { children: React.ReactNode }) {
  return <span ref={(el) => el?.setAttribute('inert', '')} aria-hidden="true" style={{ display: 'flex', pointerEvents: 'none' }}>{children}</span>;
}

export type TreeViewSelection = 'none' | 'single' | 'multiple';
export type TreeViewSize = 'md' | 'sm';
type CheckState = boolean | 'mixed';

export interface TreeViewProps {
  items?: TreeNode[];
  defaultItems?: TreeNode[];
  onItemsChange?: (items: TreeNode[]) => void;
  selection?: TreeViewSelection;
  defaultSelected?: string | string[];
  onSelectionChange?: (selected: string | string[]) => void;
  onActivate?: (node: TreeNode) => void;
  defaultExpanded?: string[];
  size?: TreeViewSize;
  /** Linhas guia por nível. */
  guides?: boolean;
  icons?: boolean;
  /** Ícone que substitui o do nó desabilitado; `null` desliga. */
  disabledIcon?: string | null;
  /** Filtra mantendo os pais, abre os ramos e destaca o trecho — a busca em si fica fora (SearchInput). */
  query?: string;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  actions?: (node: TreeNode, api: { rename: () => void; createChild: () => void; remove: () => void }) => MenuItem[];
  /** Renomear (F2/duplo clique), nova pasta, excluir. */
  editable?: boolean;
  /** Alça de arrastar para reordenar/mover nós. */
  draggable?: boolean;
  canDrop?: (node: TreeNode, target: TreeNode, position: 'before' | 'after' | 'inside') => boolean;
  onMove?: (e: { node: TreeNode; target: TreeNode; position: 'before' | 'after' | 'inside'; previous: TreeNode[]; next: TreeNode[] }) => void;
  onRename?: (node: TreeNode, value: string) => void;
  onCreate?: (node: TreeNode, parent: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  ariaLabel?: string;
  emptyText?: string;
  createLabel?: string;
}

type Row =
  | { type: 'node'; node: TreeNode; level: number; parent: TreeNode | null; pos: number; setsize: number; open: boolean }
  | { type: 'loading' | 'error' | 'empty'; level: number; parent: TreeNode | null };

/** Hierarquia que abre e fecha, com seleção simples/múltipla, busca, carregamento sob demanda, edição e
 * arrastar-para-mover. Cada nó é um `ListItem` — mesma densidade e cores do `List`. */
export const TreeView: React.FC<TreeViewProps> = (props) => {
  const {
    items: itemsProp, defaultItems = [], onItemsChange, selection = 'none', defaultSelected, onSelectionChange,
    onActivate, defaultExpanded = [], size = 'md', guides = false, icons = true, disabledIcon = 'lock-simple',
    query = '', loadChildren, actions, editable = false, draggable = false, canDrop, onMove, onRename, onCreate,
    onDelete, ariaLabel = 'Árvore', emptyText = 'Nada aqui ainda', createLabel = 'Nova pasta',
  } = props;
  const [itemsState, setItemsState] = React.useState<TreeNode[]>(defaultItems);
  const items = itemsProp !== undefined ? itemsProp : itemsState;
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  const setItems = (next: TreeNode[]) => { itemsRef.current = next; setItemsState(next); onItemsChange?.(next); };
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpanded));
  const [sel, setSel] = React.useState<Set<string> | string | null>(() => (selection === 'multiple' ? new Set(defaultSelected as string[] | undefined) : ((defaultSelected as string | undefined) ?? null)));
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<Set<string>>(() => new Set());
  const [errors, setErrors] = React.useState<Set<string>>(() => new Set());
  const [editing, setEditing] = React.useState<{ id: string; value: string } | null>(null);
  const [drag, setDrag] = React.useState<{ id: string; node: TreeNode; w: number; ox: number; oy: number; count: number } | null>(null);
  const [drop, setDrop] = React.useState<{ id: string; pos: 'before' | 'after' | 'inside' } | null>(null);
  const [ghost, setGhost] = React.useState<{ x: number; y: number } | null>(null);
  const [blocked, setBlocked] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const rowsRef = React.useRef<Map<string, Row & { type: 'node' }>>(new Map());
  const flashT = React.useRef<ReturnType<typeof setTimeout>>();
  const [live, setLive] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const typed = React.useRef({ s: '', t: 0 });
  const hoverT = React.useRef<ReturnType<typeof setTimeout>>();
  const seq = React.useRef(0);
  const uid = React.useId();
  const index = React.useMemo(() => indexOf(items), [items]);
  const nq = normalize(query).trim();
  const ind = INDENT[size] ?? 16, base = BASE[size] ?? 8, padY = PAD_Y[size] ?? 6;

  let visible: Set<string> | null = null;
  if (nq) {
    visible = new Set();
    walk(items, (n) => {
      if (!normalize(n.label).includes(nq)) return;
      visible!.add(n.id);
      let e = index.get(n.id);
      while (e && e.parent) { visible!.add(e.parent.id); e = index.get(e.parent.id); }
    });
  }
  const rows: Row[] = [];
  const flatten = (nodes: TreeNode[], level: number, parent: TreeNode | null) => {
    const vis = visible ? nodes.filter((n) => visible!.has(n.id)) : nodes;
    vis.forEach((n, i) => {
      const open = hasKids(n) && (nq ? !!n.children && n.children.some((c) => visible!.has(c.id)) : expanded.has(n.id));
      rows.push({ type: 'node', node: n, level, parent, pos: i + 1, setsize: vis.length, open });
      if (!open) return;
      if (loading.has(n.id)) rows.push({ type: 'loading', level: level + 1, parent: n });
      else if (errors.has(n.id)) rows.push({ type: 'error', level: level + 1, parent: n });
      else if (n.children && n.children.length) flatten(n.children, level + 1, n);
      else if (n.children) rows.push({ type: 'empty', level: level + 1, parent: n });
    });
  };
  flatten(items, 1, null);
  const nodeRows = rows.filter((r): r is Row & { type: 'node' } => r.type === 'node');
  rowsRef.current = new Map(nodeRows.map((r) => [r.node.id, r]));

  const cstateCache = new Map<string, CheckState>();
  const cstate = (n: TreeNode): CheckState => {
    if (cstateCache.has(n.id)) return cstateCache.get(n.id)!;
    const kids = (n.children || []).filter((c) => !c.disabled);
    let r: CheckState;
    if (!kids.length) r = sel instanceof Set && sel.has(n.id);
    else { const st = kids.map(cstate); r = st.every((x) => x === true) ? true : st.some((x) => x !== false) ? 'mixed' : false; }
    cstateCache.set(n.id, r);
    return r;
  };

  const focusRow = (id: string) => {
    setFocusId(id);
    setTimeout(() => { const el = rootRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`); el?.focus({ preventScroll: false }); }, 0);
  };
  const load = (n: TreeNode) => {
    setErrors((s) => { const c = new Set(s); c.delete(n.id); return c; });
    setLoading((s) => new Set(s).add(n.id));
    Promise.resolve(loadChildren!(n)).then(
      (kids) => { setItems(mapNode(itemsRef.current, n.id, (x) => ({ ...x, children: kids }))); setLive(`${kids.length} itens em ${n.label}`); },
      () => { setErrors((s) => new Set(s).add(n.id)); setLive(`Não foi possível carregar ${n.label}`); },
    ).finally(() => setLoading((s) => { const c = new Set(s); c.delete(n.id); return c; }));
  };
  const expand = (n: TreeNode) => {
    if (!hasKids(n) || n.disabled) return;
    setExpanded((s) => new Set(s).add(n.id));
    if (!n.children && n.hasChildren && loadChildren && !loading.has(n.id)) load(n);
  };
  const collapse = (n: TreeNode) => setExpanded((s) => { const c = new Set(s); c.delete(n.id); return c; });
  const toggle = (n: TreeNode) => (expanded.has(n.id) ? collapse(n) : expand(n));
  const select = (n: TreeNode) => { setSel(n.id); onSelectionChange?.(n.id); };
  const toggleCheck = (n: TreeNode) => {
    const on = cstate(n) !== true;
    const ids = [n.id, ...descendantIds(n)];
    const next = new Set(sel as Set<string>);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    let e = index.get(n.id);
    while (e && e.parent) { next.delete(e.parent.id); e = index.get(e.parent.id); }
    setSel(next);
    onSelectionChange?.([...next]);
  };
  const startRename = (n: TreeNode) => setEditing({ id: n.id, value: n.label });
  const endRename = (save: boolean) => {
    if (!editing) return;
    const e = index.get(editing.id), v = editing.value.trim();
    const editingId = editing.id;
    setEditing(null);
    if (save && e && v && v !== e.node.label) { setItems(mapNode(itemsRef.current, e.node.id, (x) => ({ ...x, label: v }))); onRename?.(e.node, v); setLive(`Renomeado para ${v}`); }
    focusRow(editingId);
  };
  const createChild = (n: TreeNode) => {
    const id = `${uid}-new-${++seq.current}`;
    const node: TreeNode = { id, label: createLabel, icon: 'folder', iconOpen: 'folder-open', children: [] };
    setItems(mapNode(itemsRef.current, n.id, (x) => ({ ...x, children: [...(x.children || []), node] })));
    setExpanded((s) => new Set(s).add(n.id));
    setEditing({ id, value: createLabel });
    onCreate?.(node, n);
  };
  const removeAt = (n: TreeNode) => {
    const i = nodeRows.findIndex((r) => r.node.id === n.id);
    const near = nodeRows[i - 1] || nodeRows[i + 1];
    setItems(removeNode(itemsRef.current, n.id)[0]);
    onDelete?.(n);
    setLive(`${n.label} excluído`);
    if (near) focusRow(near.node.id);
  };
  const validDrop = (id: string, targetId: string, pos: 'before' | 'after' | 'inside'): { e: Located; t: Located } | null => {
    const idx = indexOf(itemsRef.current), e = idx.get(id), t = idx.get(targetId);
    if (!e || !t || id === targetId || isDescendant(idx, targetId, id) || t.node.disabled) return null;
    if (pos === 'inside' && !t.node.children) return null;
    if (canDrop && !canDrop(e.node, t.node, pos)) return null;
    return { e, t };
  };
  const doMove = (id: string, targetId: string, pos: 'before' | 'after' | 'inside') => {
    const ok = validDrop(id, targetId, pos);
    if (!ok) return false;
    const cur = itemsRef.current;
    const [without, node] = removeNode(cur, id);
    const next = insertNode(without, targetId, pos, node!);
    setItems(next);
    if (pos === 'inside') setExpanded((s) => new Set(s).add(targetId));
    setLive(`${ok.e.node.label} movido ${pos === 'inside' ? 'para dentro de' : pos === 'before' ? 'para antes de' : 'para depois de'} ${ok.t.node.label}`);
    onMove?.({ node: ok.e.node, target: ok.t.node, position: pos, previous: cur, next });
    clearTimeout(flashT.current); setFlash(id); flashT.current = setTimeout(() => setFlash(null), 900);
    return true;
  };
  const kbMove = (n: TreeNode, k: string) => {
    const e = index.get(n.id)!, sibs = e.parent ? e.parent.children! : items, i = sibs.findIndex((x) => x.id === n.id);
    let ok = false;
    if (k === 'ArrowUp' && i > 0) ok = doMove(n.id, sibs[i - 1].id, 'before');
    else if (k === 'ArrowDown' && i < sibs.length - 1) ok = doMove(n.id, sibs[i + 1].id, 'after');
    else if (k === 'ArrowLeft' && e.parent) ok = doMove(n.id, e.parent.id, 'after');
    else if (k === 'ArrowRight' && i > 0) ok = doMove(n.id, sibs[i - 1].id, 'inside');
    if (ok) focusRow(n.id); else setLive('Não é possível mover para lá');
  };
  const startDrag = (e: React.PointerEvent, n: TreeNode) => {
    if (e.button !== 0 || n.disabled) return;
    e.preventDefault(); e.stopPropagation();
    const rowEl = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-id]')!, rect = rowEl.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, w = Math.min(rect.width, 340), ox = Math.min(sx - rect.left, w - 24), oy = sy - rect.top;
    let started = false;
    const dropRefLocal: { current: { id: string; pos: 'before' | 'after' | 'inside' } | null } = { current: null };
    const clear = () => { dropRefLocal.current = null; setDrop(null); clearTimeout(hoverT.current); };
    const hit = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y), row = el?.closest<HTMLElement>('[data-id]');
      if (!row || !rootRef.current?.contains(row) || row.dataset.id === n.id) { clear(); setBlocked(false); return; }
      const r = rowsRef.current.get(row.dataset.id!);
      if (!r) return;
      const b = row.getBoundingClientRect(), ry = (y - b.top) / b.height, tn = r.node;
      const pos: 'before' | 'after' | 'inside' = tn.children
        ? (r.open ? (ry < 0.3 ? 'before' : 'inside') : (ry < 0.25 ? 'before' : ry > 0.75 ? 'after' : 'inside'))
        : (ry < 0.5 ? 'before' : 'after');
      if (!validDrop(n.id, tn.id, pos)) { clear(); setBlocked(true); return; }
      setBlocked(false);
      const cur = dropRefLocal.current;
      if (cur && cur.id === tn.id && cur.pos === pos) return;
      dropRefLocal.current = { id: tn.id, pos };
      setDrop(dropRefLocal.current);
      clearTimeout(hoverT.current);
      if (pos === 'inside' && !r.open) hoverT.current = setTimeout(() => expand(tn), 700);
    };
    const move = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        started = true;
        setDrag({ id: n.id, node: n, w, ox, oy, count: descendantIds(n).length });
        document.body.style.cursor = 'grabbing';
        setLive(`Arrastando ${n.label}`);
      }
      setGhost({ x: ev.clientX, y: ev.clientY });
      hit(ev.clientX, ev.clientY);
    };
    const end = (cancel: boolean) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('keydown', key, true);
      clearTimeout(hoverT.current); document.body.style.cursor = '';
      const d = dropRefLocal.current;
      dropRefLocal.current = null;
      setDrag(null); setDrop(null); setGhost(null); setBlocked(false);
      if (started && !cancel && d) doMove(n.id, d.id, d.pos);
      else if (started) setLive('Movimento cancelado');
    };
    const up = () => end(false);
    const key = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(true); } };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('keydown', key, true);
  };
  const actionsFor = (n: TreeNode): MenuItem[] | null => {
    if (n.disabled) return null;
    const api = { rename: () => startRename(n), createChild: () => createChild(n), remove: () => removeAt(n) };
    if (actions) return actions(n, api);
    if (!editable) return null;
    return ([{ label: 'Renomear', icon: 'pencil-simple', shortcut: 'F2', onSelect: api.rename }] as MenuItem[])
      .concat(n.children ? [{ label: createLabel, icon: 'folder-plus', onSelect: api.createChild }] as MenuItem[] : [])
      .concat([{ type: 'separator' }, { label: 'Excluir', icon: 'trash', tone: 'danger', onSelect: api.remove }] as MenuItem[]);
  };
  const onRowClick = (n: TreeNode) => {
    if (n.disabled) return;
    setFocusId(n.id);
    if (selection === 'multiple') toggleCheck(n);
    else if (selection === 'single') select(n);
    else if (hasKids(n)) toggle(n);
    if (selection !== 'multiple' && onActivate) onActivate(n);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    const row = (e.target as HTMLElement).closest?.('[data-id]') as HTMLElement | null;
    if (!row || !rootRef.current?.contains(row)) return;
    const i = nodeRows.findIndex((r) => r.node.id === row.dataset.id);
    if (i < 0) return;
    const r = nodeRows[i], n = r.node, k = e.key;
    const go = (j: number) => { const t = nodeRows[j]; if (t) focusRow(t.node.id); };
    if (draggable && e.altKey && e.shiftKey && k.startsWith('Arrow')) { e.preventDefault(); kbMove(n, k); }
    else if (k === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); go(i - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(nodeRows.length - 1); }
    else if (k === 'ArrowRight') { e.preventDefault(); if (hasKids(n) && !r.open) expand(n); else if (r.open && nodeRows[i + 1] && nodeRows[i + 1].level > r.level) go(i + 1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); if (r.open && !nq) collapse(n); else if (r.parent) focusRow(r.parent.id); }
    else if (k === 'Enter') { e.preventDefault(); if (n.disabled) return; if (selection === 'single') select(n); else if (selection === 'none' && hasKids(n)) toggle(n); onActivate?.(n); }
    else if (k === ' ') { e.preventDefault(); if (n.disabled) return; if (selection === 'multiple') toggleCheck(n); else if (selection === 'single') select(n); else if (hasKids(n)) toggle(n); }
    else if (k === '*') { e.preventDefault(); (r.parent ? r.parent.children! : items).forEach(expand); }
    else if (k === 'F2' && editable && !n.disabled) { e.preventDefault(); startRename(n); }
    else if (k === 'ContextMenu' || (e.shiftKey && k === 'F10')) { const b = row.querySelector<HTMLButtonElement>('.ob-tv-act button'); if (b) { e.preventDefault(); b.click(); } }
    else if (k.length === 1 && /\S/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : '') + normalize(k), t: now };
      for (let d = 1; d <= nodeRows.length; d++) {
        const t = nodeRows[(i + d) % nodeRows.length];
        if (normalize(t.node.label).startsWith(typed.current.s)) { focusRow(t.node.id); break; }
      }
    }
  };

  const tabId = nodeRows.some((r) => r.node.id === focusId) ? focusId
    : selection === 'single' && nodeRows.some((r) => r.node.id === sel) ? (sel as string)
    : nodeRows[0]?.node.id;
  const guideSpans = (level: number) => guides && Array.from({ length: level - 1 }, (_, l) => (
    <span key={`g${l}`} aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: base + l * ind + 7.5, borderLeft: '1px solid var(--ob-border)', pointerEvents: 'none' }} />
  ));
  const leftPad = (level: number) => base + (level - 1) * ind;
  const iconSize = size === 'sm' ? 14 : 16;

  const renderNode = (r: Row & { type: 'node' }) => {
    const n = r.node, kids = hasKids(n), isEditing = editing && editing.id === n.id;
    const cs = selection === 'multiple' ? cstate(n) : null;
    const dropHere = drop && drop.id === n.id ? drop.pos : null;
    const acts = actionsFor(n);
    const style: React.CSSProperties = { padding: `${padY}px var(--ob-space-8) ${padY}px ${leftPad(r.level)}px`, minHeight: size === 'sm' ? 28 : 32 };
    const lifted = drag && (drag.id === n.id || isDescendant(index, n.id, drag.id));
    if (lifted) style.opacity = 'var(--ob-opacity-muted)';
    if (drag && drag.id === n.id) { style.background = 'var(--ob-bg-alt)'; style.outline = '1.5px dashed var(--ob-border)'; style.outlineOffset = -2; }
    if (dropHere === 'inside') { style.background = 'var(--ob-blue-050)'; style.boxShadow = 'inset 0 0 0 1.5px var(--ob-blue)'; }
    if (flash === n.id) style.animation = 'ob-tv-flash calc(var(--ob-dur-slow) * 2) var(--ob-ease-out)';
    const lead = (
      <>
        <span className="ob-tv-caret" aria-hidden="true" onClick={(e) => { e.stopPropagation(); if (!n.disabled) { setFocusId(n.id); if (kids) toggle(n); } }}
          style={{ width: 16, height: 16, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--ob-r-xs)', color: 'var(--ob-fg-mute)', cursor: kids && !n.disabled ? 'pointer' : 'default', visibility: kids || loading.has(n.id) ? 'visible' : 'hidden' }}>
          {loading.has(n.id) ? <Spinner size="xs" /> : <Ph n="caret-right" size={12} weight="bold" c="currentColor" style={{ transform: r.open ? 'rotate(90deg)' : 'none', transition: 'transform var(--ob-dur-fast) var(--ob-ease)' }} />}
        </span>
        {draggable && (
          <span className="ob-tv-handle" aria-hidden="true" title="Arrastar para mover" onPointerDown={(e) => startDrag(e, n)} onClick={(e) => e.stopPropagation()}
            style={{ width: 16, height: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--ob-r-xs)', color: 'var(--ob-fg-mute)', visibility: n.disabled ? 'hidden' : 'visible' }}>
            <Ph n="dots-six-vertical" size={14} weight="bold" c="currentColor" />
          </span>
        )}
        {selection === 'multiple' && <Inert><Checkbox checked={cs === true} indeterminate={cs === 'mixed'} disabled={n.disabled} onChange={() => {}} /></Inert>}
        {icons && (n.disabled && disabledIcon ? <Ph n={disabledIcon} size={iconSize} c="currentColor" /> : n.icon && <Ph n={r.open && n.iconOpen ? n.iconOpen : n.icon} size={iconSize} c="currentColor" />)}
      </>
    );
    const title = isEditing ? (
      <input aria-label="Novo nome" value={editing.value}
        ref={(el) => { if (el && !el.dataset.f) { el.dataset.f = '1'; el.focus(); el.select(); } }}
        onChange={(e) => setEditing({ id: n.id, value: e.target.value })} onClick={(e) => e.stopPropagation()} onBlur={() => endRename(true)}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); endRename(true); } else if (e.key === 'Escape') { e.preventDefault(); endRename(false); } }}
        style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', color: 'var(--ob-fg-strong)', border: '1.5px solid var(--ob-blue)', borderRadius: 'var(--ob-r-xs)', padding: '0 var(--ob-space-6)', margin: 'calc(var(--ob-space-2) * -1) 0', height: size === 'sm' ? 22 : 24, outline: 'none', boxShadow: '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)', background: 'var(--ob-surface)' }} />
    ) : <Match text={n.label} query={query} />;
    const trail = (n.status || n.badge != null || acts) ? (
      <>
        {n.status && <><StatusDot tone={n.status} />{n.statusLabel && <span style={srOnly}>{n.statusLabel}</span>}</>}
        {n.badge != null && <Badge tone="neutral" size="sm">{n.badge}</Badge>}
        {acts && (
          <span className="ob-tv-act" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ display: 'flex' }}>
            <Menu align="right" size="sm" ariaLabel={`Ações de ${n.label}`} items={acts}
              trigger={<button type="button" tabIndex={-1} aria-label={`Ações de ${n.label}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', borderRadius: 'var(--ob-r-sm)', background: 'transparent', color: 'var(--ob-fg-soft)', cursor: 'pointer', padding: 0 }}><Ph n="dots-three" size={16} weight="bold" c="currentColor" /></button>} />
          </span>
        )}
      </>
    ) : null;
    return (
      <ListItem key={n.id} as="li" role="treeitem" data-id={n.id} className="ob-tv-row" tabIndex={n.id === tabId ? 0 : -1}
        aria-level={r.level} aria-setsize={r.setsize} aria-posinset={r.pos} aria-expanded={kids ? r.open : undefined} aria-busy={loading.has(n.id) || undefined}
        aria-selected={selection === 'single' ? sel === n.id : undefined} aria-checked={selection === 'multiple' ? (cs === 'mixed' ? 'mixed' : !!cs) : undefined}
        size={size} disabled={n.disabled} selected={selection === 'single' && sel === n.id}
        onClick={() => onRowClick(n)}
        onDoubleClick={(e) => { if (n.disabled || (e.target as HTMLElement).closest('.ob-tv-caret, .ob-tv-handle, .ob-tv-act')) return; if (editable) startRename(n); else if (selection !== 'none' && kids) toggle(n); }}
        onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(n.id); }}
        leading={lead} title={title} meta={n.meta} trailing={trail} style={style}>
        {guideSpans(r.level)}
        {(dropHere === 'before' || dropHere === 'after') && (
          <span aria-hidden="true" style={{ position: 'absolute', left: leftPad(r.level) + 4, right: 4, height: 2, borderRadius: 'var(--ob-r-2xs)', background: 'var(--ob-blue)', [dropHere === 'before' ? 'top' : 'bottom']: -1, pointerEvents: 'none', zIndex: 2 } as React.CSSProperties}>
            <span style={{ position: 'absolute', left: -6, top: -3, width: 8, height: 8, boxSizing: 'border-box', borderRadius: 'var(--ob-r-circle)', border: '2px solid var(--ob-blue)', background: 'var(--ob-surface)' }} />
          </span>
        )}
      </ListItem>
    );
  };
  const renderAux = (r: Row & { type: 'loading' | 'error' | 'empty' }, k: string) => (
    <li key={k} role="none" style={{ margin: 0, position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)', minHeight: size === 'sm' ? 28 : 32, padding: `${padY}px var(--ob-space-8) ${padY}px ${leftPad(r.level) + 26}px`, fontFamily: 'var(--ob-font)', fontSize: size === 'sm' ? 'var(--ob-fs-12)' : 'var(--ob-fs-13)', color: r.type === 'error' ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>
      {guideSpans(r.level)}
      {r.type === 'loading' && <><Spinner size="xs" />Carregando…</>}
      {r.type === 'empty' && 'Pasta vazia'}
      {r.type === 'error' && <><Ph n="warning-circle" size={14} c="currentColor" />Não foi possível carregar<Button kind="ghost" size="sm" onClick={() => load(r.parent!)}>Tentar de novo</Button></>}
    </li>
  );

  return (
    <div ref={rootRef} style={{ fontFamily: 'var(--ob-font)' }}>
      <List as="ul" role="tree" ariaLabel={ariaLabel} aria-multiselectable={selection === 'multiple' || undefined} size={size} onKeyDown={onKeyDown} style={{ gap: 0 }}>
        {rows.map((r, k) => (r.type === 'node' ? renderNode(r) : renderAux(r, `aux${k}`)))}
        {rows.length === 0 && <li role="none" style={{ margin: 0, padding: 'var(--ob-space-12) var(--ob-space-8)', fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-mute)' }}>{nq ? `Nenhum resultado para "${query.trim()}"` : emptyText}</li>}
      </List>
      <span aria-live="polite" style={srOnly}>{live}</span>
      {drag && ghost && ReactDOM.createPortal(
        <div aria-hidden="true" style={{ position: 'fixed', left: ghost.x - drag.ox, top: ghost.y - drag.oy, width: drag.w, zIndex: 'var(--ob-z-drag)', pointerEvents: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)', minHeight: 34, padding: 'var(--ob-space-6) var(--ob-space-10) var(--ob-space-6) var(--ob-space-8)', boxSizing: 'border-box', background: 'var(--ob-surface)',
            border: `1.5px solid ${blocked ? 'var(--ob-danger)' : 'var(--ob-blue)'}`, borderRadius: 'var(--ob-r-sm)', boxShadow: 'var(--ob-shadow-lg)',
            fontFamily: 'var(--ob-font)', fontSize: 'var(--ob-fs-14)', color: 'var(--ob-fg-strong)', transformOrigin: `${drag.ox}px ${drag.oy}px`, animation: 'ob-tv-lift var(--ob-dur-fast) var(--ob-ease-out) forwards',
          }}>
            <Ph n="dots-six-vertical" size={14} weight="bold" c={blocked ? 'var(--ob-danger)' : 'var(--ob-blue)'} />
            {icons && drag.node.icon && <Ph n={drag.node.icon} size={16} c="var(--ob-fg-soft)" />}
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drag.node.label}</span>
            {blocked ? <Ph n="prohibit" size={16} c="var(--ob-danger)" /> : drag.count > 0 && <Badge tone="primary" size="sm">+{drag.count}</Badge>}
          </div>
        </div>, document.body,
      )}
    </div>
  );
};
