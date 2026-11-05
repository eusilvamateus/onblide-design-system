import React from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { FloatingPanel } from '../../internal/FloatingPanel';
import { ScrollArea } from '../../data-display/ScrollArea/ScrollArea';
import { useLadoVertical } from '../../internal/useLadoVertical';
import { Chip } from '../../data-display/Chip/Chip';
import { Ph } from '../../iconography/Ph/Ph';
import { Avatar } from '../../data-display/Avatar/Avatar';
import { Spinner } from '../../feedback/Spinner/Spinner';
import { Checkbox } from '../Checkbox/Checkbox';
import { ListItem, ListSubheader, ListDivider } from '../../data-display/List/List';

const normalize = (s: string) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export type AutocompleteMode = 'restrict' | 'free' | 'creatable';
export type AutocompleteCompletion = 'list' | 'inline';

export interface AutocompleteOption {
  label: string;
  description?: string;
  /** Nome do ícone Phosphor. */
  icon?: string;
  /** Mostra um Avatar com as iniciais do label. */
  avatar?: boolean;
  group?: string;
  meta?: React.ReactNode;
  disabled?: boolean;
}
type OptionInput = string | AutocompleteOption;
const asOption = (o: OptionInput): AutocompleteOption => (typeof o === 'string' ? { label: o } : o);

export interface AutocompleteProps {
  options?: OptionInput[];
  /** `restrict`: só valores da lista. `free`: qualquer texto. `creatable`: lista + "Criar…". */
  mode?: AutocompleteMode;
  multiple?: boolean;
  groupBy?: string | ((o: AutocompleteOption) => string);
  /** `inline` completa com a primeira opção que bate, com o trecho sugerido selecionado. */
  completion?: AutocompleteCompletion;
  /** Busca remota; espera 250ms sem digitar. */
  loadOptions?: (query: string) => Promise<OptionInput[]>;
  /** Caracteres mínimos antes de acionar `loadOptions`. */
  minChars?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  icon?: string;
  width?: number | string;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  /** Chamado ao escolher "Criar “x”"" (modo `creatable`). */
  onCreate?: (label: string) => void;
  open?: boolean;
  defaultInputValue?: string;
  loading?: boolean;
  emptyText?: string;
  ariaLabel?: string;
}

function Match({ text, query }: { text: string; query: string }) {
  const q = normalize(query).trim();
  const i = q ? normalize(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark style={{ background: 'none', color: 'inherit', fontWeight: 'var(--ob-w-bold)' }}>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}
function Inert({ children }: { children: React.ReactNode }) {
  return <span ref={(el) => el?.setAttribute('inert', '')} aria-hidden="true" style={{ display: 'flex', flex: 'none', pointerEvents: 'none' }}>{children}</span>;
}
const iconBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 'var(--ob-r-sm)', color: 'var(--ob-fg-mute)', cursor: 'pointer', padding: 0, flex: 'none' };
const msgRow: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ob-space-8)', padding: 'var(--ob-space-12) var(--ob-space-16)', fontSize: 13, color: 'var(--ob-fg-mute)' };

type NavEntry = { o: AutocompleteOption } | { create: string };

/** Campo de texto com lista de sugestões (combobox WAI-ARIA): seleção única/múltipla, texto livre, criação,
 * agrupamento, conclusão inline e opções locais ou remotas. */
export const Autocomplete: React.FC<AutocompleteProps> = (props) => {
  const {
    options = [], mode = 'restrict', multiple = false, groupBy, completion = 'list', loadOptions, minChars = 0,
    label, hint, error, disabled = false, placeholder = 'Digite para buscar…', icon, width, value: valueProp,
    defaultValue, onChange, onCreate, open: openProp, defaultInputValue, loading: loadingProp,
    emptyText = 'Nenhuma opção encontrada', ariaLabel,
  } = props;
  const empty = multiple ? [] : null;
  const [val, setVal] = React.useState<string | string[] | null>(defaultValue ?? empty);
  const value = valueProp !== undefined ? valueProp : val;
  const [input, setInput] = React.useState(defaultInputValue ?? (!multiple && typeof value === 'string' ? value : ''));
  const [query, setQuery] = React.useState<string | null>(defaultInputValue ?? null);
  const [openState, setOpen] = React.useState(false);
  const open = openProp ?? openState;
  const [active, setActive] = React.useState(-1);
  const [focused, setFocused] = React.useState(false);
  const [created, setCreated] = React.useState<string[]>([]);
  const [remote, setRemote] = React.useState<AutocompleteOption[] | null>(null);
  const [busyState, setBusy] = React.useState(false);
  const busy = loadingProp ?? busyState;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const painelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const selRange = React.useRef<[number, number] | null>(null);
  const mounted = React.useRef(false);
  const uid = React.useId();
  const listId = `${uid}-list`;

  const q = query ?? '', nq = normalize(q).trim();
  const tooShort = !!loadOptions && nq.length < minChars;
  const base: AutocompleteOption[] = loadOptions ? (remote || []) : [...options.map(asOption), ...created.map((l) => ({ label: l }))];
  const filtered = loadOptions ? base : base.filter((o) => normalize(o.label).includes(nq));
  const selectedList = multiple ? ((value as string[]) ?? []) : value ? [value as string] : [];
  const showCreate = mode === 'creatable' && !!nq && !busy && !tooShort && !base.some((o) => normalize(o.label) === nq);
  const gKey = typeof groupBy === 'function' ? groupBy : groupBy ? (o: AutocompleteOption) => (o as unknown as Record<string, unknown>)[groupBy] as string : null;
  let groups: { name: string | null; items: AutocompleteOption[] }[] = [{ name: null, items: filtered }];
  if (gKey) {
    const m = new Map<string, AutocompleteOption[]>();
    filtered.forEach((o) => { const k = gKey(o) || 'Outros'; if (!m.has(k)) m.set(k, []); m.get(k)!.push(o); });
    groups = [...m].map(([name, items]) => ({ name, items }));
  }
  const nav: NavEntry[] = [];
  groups.forEach((g) => g.items.forEach((o) => nav.push({ o })));
  if (showCreate) nav.push({ create: q.trim() });
  const showPanel = open && !disabled && (busy || tooShort || nav.length > 0 || mode !== 'free');
  const lado = useLadoVertical(rootRef, painelRef, showPanel);
  const firstEnabled = () => nav.findIndex((n) => !('o' in n && n.o.disabled));

  React.useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (completion === 'inline' && nq) { setActive(nav.findIndex((n) => 'o' in n && !n.o.disabled && normalize(n.o.label).startsWith(nq))); return; }
    setActive(mode !== 'free' && nq ? firstEnabled() : -1);
  }, [query, open, remote]);
  React.useLayoutEffect(() => {
    if (selRange.current && inputRef.current) { inputRef.current.setSelectionRange(...selRange.current); selRange.current = null; }
  }, [input]);
  React.useEffect(() => {
    if (!loadOptions || !open || loadingProp !== undefined) return;
    if (tooShort) { setRemote(null); setBusy(false); return; }
    let alive = true;
    setBusy(true);
    const t = setTimeout(() => { Promise.resolve(loadOptions(q)).then((r) => { if (alive) { setRemote(r.map(asOption)); setBusy(false); } }); }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q, open]);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  React.useEffect(() => {
    const l = listRef.current;
    if (!l || active < 0) return;
    const el = l.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (!el) return;
    const folga = gKey ? 32 : 4, top = el.offsetTop, bot = top + el.offsetHeight;
    if (top < l.scrollTop + folga) l.scrollTop = top - folga;
    else if (bot > l.scrollTop + l.clientHeight - 4) l.scrollTop = bot - l.clientHeight + 4;
  }, [active, gKey]);

  const commit = (next: string | string[] | null) => { setVal(next); onChange?.(next); };
  const reset = (text: string) => { setInput(text); setQuery(null); };
  const pick = (l: string) => {
    if (multiple) { const cur = (value as string[]) ?? []; commit(cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]); reset(''); }
    else { commit(l); reset(l); setOpen(false); }
  };
  const choose = (n: NavEntry) => {
    if ('create' in n) { if (!loadOptions) setCreated((c) => [...c, n.create]); onCreate?.(n.create); pick(n.create); return; }
    if (!n.o.disabled) pick(n.o.label);
  };
  const addTag = (text?: string) => {
    const t = (text ?? input).trim(), cur = (value as string[]) ?? [];
    if (t && !cur.includes(t)) commit([...cur, t]);
    reset('');
  };
  const clear = () => { commit(empty); reset(''); };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value, del = (e.nativeEvent as InputEvent).inputType?.startsWith('delete');
    setQuery(v); setOpen(true);
    if (multiple && mode === 'free' && v.endsWith(',')) { addTag(v.slice(0, -1)); return; }
    if (completion === 'inline' && !del && v) {
      const m = base.find((o) => !o.disabled && normalize(o.label).startsWith(normalize(v)));
      if (m) { selRange.current = [v.length, m.label.length]; setInput(v + m.label.slice(v.length)); return; }
    }
    setInput(v);
    if (!multiple && !v && mode !== 'free') commit(null);
  };
  const stepActive = (dir: 1 | -1) => {
    const n = nav.length;
    let i = active;
    for (let c = 0; c < n; c++) { i = i < 0 ? (dir > 0 ? 0 : n - 1) : (i + dir + n) % n; const e = nav[i]; if (!('o' in e && e.o.disabled)) return i; }
    return -1;
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); else setActive(stepActive(k === 'ArrowDown' ? 1 : -1)); }
    else if (k === 'Enter') {
      if (showPanel && active >= 0 && nav[active]) { e.preventDefault(); choose(nav[active]); }
      else if (mode === 'free') { e.preventDefault(); if (multiple) addTag(); else { commit(input.trim() || null); setQuery(null); setOpen(false); } }
    }
    else if (k === 'Tab' && completion === 'inline' && !multiple && showPanel && active >= 0 && nav[active]) choose(nav[active]);
    else if (k === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false); if (!multiple) reset((value as string) || ''); }
      else if (input || selectedList.length) { e.preventDefault(); clear(); }
    }
    else if (k === 'Backspace' && multiple && !input && ((value as string[]) ?? []).length) commit(((value as string[]) ?? []).slice(0, -1));
  };
  const onFocus = () => { setFocused(true); if (!disabled) setOpen(true); };
  const onBlur = () => {
    setFocused(false); setOpen(false);
    if (multiple) { if (mode === 'free') addTag(); else reset(''); return; }
    if (mode === 'free') { const t = input.trim(); if (t !== ((value as string) || '')) commit(t || null); setQuery(null); return; }
    reset((value as string) || '');
  };
  const onShellDown = (e: React.MouseEvent) => {
    if (disabled) return;
    if (e.target === inputRef.current) { if (focused) setOpen(true); return; }
    e.preventDefault();
    if (document.activeElement !== inputRef.current) inputRef.current?.focus(); else setOpen(true);
  };
  const onCaret = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (disabled) return;
    if (document.activeElement !== inputRef.current) inputRef.current?.focus(); else setOpen((o) => !o);
  };
  const onClear = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); clear(); inputRef.current?.focus(); };

  const chips = multiple && ((value as string[]) ?? []).length > 0;
  const hasValue = multiple ? ((value as string[]) ?? []).length > 0 : !!value || !!input;
  let idx = -1;
  const renderOpt = (o: AutocompleteOption) => {
    idx += 1;
    const i = idx, sel = selectedList.includes(o.label);
    const lead = multiple || o.icon || o.avatar ? (
      <>
        {multiple && <Inert><Checkbox checked={sel} onChange={() => {}} disabled={o.disabled} /></Inert>}
        {o.icon && <Ph n={o.icon} size={16} c="currentColor" />}
        {o.avatar && <Avatar name={o.label} size={o.description ? 32 : 24} />}
      </>
    ) : null;
    return (
      <ListItem key={o.label} id={`${uid}-o${i}`} data-i={i} role="option" aria-selected={sel} highlighted={i === active} selected={sel}
        selectedStyle={multiple ? 'none' : 'fill'} disabled={o.disabled}
        onMouseDown={(e) => { e.preventDefault(); if (!o.disabled) choose({ o }); }} onMouseEnter={() => !o.disabled && setActive(i)}
        leading={lead} title={<Match text={o.label} query={q} />} description={o.description} meta={o.meta}
        trailing={!multiple && sel ? <Ph n="check" size={15} c="var(--ob-blue)" /> : null} />
    );
  };
  const ci = nav.length - 1;

  return (
    <div ref={rootRef} style={{ position: 'relative', width: width || '100%', fontFamily: 'var(--ob-font)' }}>
      {label && <label htmlFor={uid} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: 'var(--ob-space-6)' }}>{label}</label>}
      <div onMouseDown={onShellDown}>
        <FieldShell focused={focused || open} error={!!error} disabled={disabled} padding={chips ? 'var(--ob-space-6) var(--ob-space-8) var(--ob-space-6) var(--ob-space-10)' : '0 var(--ob-space-8) 0 var(--ob-space-12)'}
          style={{ flexWrap: 'wrap', gap: 'var(--ob-space-6)', cursor: disabled ? 'not-allowed' : 'text' }}>
          {icon && <Ph n={icon} size={16} c="var(--ob-fg-mute)" style={{ flex: 'none' }} />}
          {multiple && ((value as string[]) ?? []).map((v) => (
            <Chip key={v} label={v} size="sm" selected removable disabled={disabled} onToggle={() => {}} onRemove={() => commit(((value as string[]) ?? []).filter((x) => x !== v))} />
          ))}
          <input id={uid} ref={inputRef} role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete={completion === 'inline' ? 'both' : 'list'}
            aria-activedescendant={showPanel && active >= 0 ? `${uid}-o${active}` : undefined} aria-invalid={error ? true : undefined} aria-label={label ? undefined : ariaLabel}
            autoComplete="off" spellCheck={false} value={input} placeholder={chips ? '' : placeholder} disabled={disabled}
            onChange={onInput} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur}
            style={{ flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: 0, height: chips ? 26 : 40, cursor: disabled ? 'not-allowed' : 'text' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-2)', flex: 'none', marginLeft: 'auto' }}>
            {busy && <span style={{ display: 'flex', padding: '0 var(--ob-space-4)' }}><Spinner size="xs" label="Buscando" /></span>}
            {hasValue && !disabled && <button type="button" tabIndex={-1} aria-label="Limpar" onMouseDown={onClear} style={iconBtn}><Ph n="x" size={14} c="currentColor" /></button>}
            {(mode !== 'free' || options.length > 0) && !loadOptions && (
              <button type="button" tabIndex={-1} aria-label={open ? 'Fechar sugestões' : 'Abrir sugestões'} onMouseDown={onCaret} style={iconBtn}>
                <Ph n="caret-down" size={16} c="currentColor" style={{ transform: showPanel ? 'rotate(180deg)' : 'none', transition: 'transform var(--ob-dur-fast) var(--ob-ease)' }} />
              </button>
            )}
          </span>
        </FieldShell>
      </div>
      {showPanel && (
        <FloatingPanel ref={painelRef} side={lado} padding={0}>
          <ScrollArea maxHeight={280} viewportRef={listRef}>
          <div id={listId} role="listbox" aria-multiselectable={multiple || undefined} aria-label={typeof label === 'string' ? label : ariaLabel} style={{ padding: 'var(--ob-space-4)' }}>
            {busy ? <div role="status" style={msgRow}><Spinner size="xs" />Buscando…</div>
              : tooShort ? <div style={msgRow}>Digite ao menos {minChars} letras</div>
              : (
                <>
                  {groups.map((g, gi) => !g.items.length ? null : g.name ? (
                    <div key={g.name} role="group" aria-labelledby={`${uid}-g${gi}`}>
                      <ListSubheader id={`${uid}-g${gi}`} sticky>{g.name}</ListSubheader>
                      {g.items.map(renderOpt)}
                    </div>
                  ) : <React.Fragment key="flat">{g.items.map(renderOpt)}</React.Fragment>)}
                  {nav.length === 0 && <div style={msgRow}>{emptyText}</div>}
                  {showCreate && (
                    <>
                      {filtered.length > 0 && <ListDivider bleed={4} />}
                      <ListItem id={`${uid}-o${ci}`} data-i={ci} role="option" aria-selected="false" tone="primary" highlighted={active === ci}
                        onMouseDown={(e) => { e.preventDefault(); choose(nav[ci]); }} onMouseEnter={() => setActive(ci)}
                        leading={<Ph n="plus" size={16} c="currentColor" />}
                        title={<>Criar "<strong style={{ fontWeight: 'var(--ob-w-semibold)' }}>{'create' in nav[ci] ? nav[ci].create : ''}</strong>"</>} />
                    </>
                  )}
                </>
              )}
          </div>
          </ScrollArea>
        </FloatingPanel>
      )}
      {error ? <div style={{ fontSize: 12, color: 'var(--ob-danger)', marginTop: 'var(--ob-space-6)', display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)' }}><Ph n="warning-circle" size={13} c="var(--ob-danger)" weight="bold" />{error}</div>
        : hint ? <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-6)' }}>{hint}</div> : null}
    </div>
  );
};
