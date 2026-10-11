import React from 'react';
import ReactDOM from 'react-dom';
import { FloatingPanel } from '../FloatingPanel/FloatingPanel';
import { Ph } from '../../iconography/Ph/Ph';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverInteraction = 'click' | 'hover';
type PopoverRenderable = React.ReactNode | ((close: () => void) => React.ReactNode);

export interface PopoverProps {
  /** Elemento que abre o popover; recebe `aria-expanded`/`aria-haspopup` (clique) ou `aria-describedby` (hover). */
  trigger: React.ReactElement;
  /** Conteúdo do popover; aceita `(close) => node` para fechar a partir de dentro. */
  children?: PopoverRenderable;
  /** Título, com botão de fechar (no modo clique). */
  title?: React.ReactNode;
  /** Rodapé de ações; mesma convenção de `children`. */
  footer?: PopoverRenderable;
  /** Lado preferido; troca para o oposto quando falta espaço. */
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  /** Seta apontando para o gatilho. */
  arrow?: boolean;
  /** `click` abre/fecha no gatilho (papel `dialog`); `hover` abre com atraso e fecha ao sair (papel `tooltip`). */
  interaction?: PopoverInteraction;
  width?: number | string;
  padding?: number;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  ariaLabel?: string;
  closeButton?: boolean;
}

interface Pos { top: number; left: number; side: PopoverPlacement; ax?: number; ay?: number }

/** Conteúdo rico ancorado a um gatilho, não modal — cuida de posição, foco e fechamento. */
export const Popover: React.FC<PopoverProps> = ({
  trigger, children, title, footer, placement = 'bottom', align = 'start', arrow = false, interaction = 'click',
  width = 280, padding = 16, defaultOpen = false, onOpenChange, ariaLabel, closeButton = true,
}) => {
  const [open, setOpenState] = React.useState(defaultOpen);
  const [pos, setPos] = React.useState<Pos | null>(null);
  const trigRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const hoverT = React.useRef<ReturnType<typeof setTimeout>>();
  const uid = React.useId();
  const hover = interaction === 'hover';
  const setOpen = (v: boolean) => { setOpenState(v); onOpenChange?.(v); };
  const focusTrigger = () => { const t = trigRef.current; const el = (t && (t.querySelector<HTMLElement>(FOCUSABLE) || t)); el?.focus({ preventScroll: true }); };
  const close = (returnFocus = true) => { setOpen(false); if (returnFocus) focusTrigger(); };

  const place = () => {
    const t = trigRef.current, p = panelRef.current;
    if (!t || !p) return;
    const r = t.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, g = arrow ? 10 : 6;
    const vw = window.innerWidth, vh = window.innerHeight, m = 8;
    let side = placement;
    if (side === 'bottom' && r.bottom + g + h > vh - m && r.top - g - h > m) side = 'top';
    else if (side === 'top' && r.top - g - h < m && r.bottom + g + h < vh - m) side = 'bottom';
    else if (side === 'right' && r.right + g + w > vw - m && r.left - g - w > m) side = 'left';
    else if (side === 'left' && r.left - g - w < m && r.right + g + w < vw - m) side = 'right';
    let top: number, left: number, ax: number | undefined, ay: number | undefined;
    if (side === 'top' || side === 'bottom') {
      top = side === 'bottom' ? r.bottom + g : r.top - g - h;
      left = clamp(align === 'center' ? r.left + r.width / 2 - w / 2 : align === 'end' ? r.right - w : r.left, m, vw - w - m);
      ax = clamp(r.left + r.width / 2 - left, 14, w - 14);
    } else {
      left = side === 'right' ? r.right + g : r.left - g - w;
      top = clamp(align === 'center' ? r.top + r.height / 2 - h / 2 : align === 'end' ? r.bottom - h : r.top, m, vh - h - m);
      ay = clamp(r.top + r.height / 2 - top, 14, h - 14);
    }
    setPos({ top, left, side, ax, ay });
  };
  React.useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    place();
    const h = () => place();
    window.addEventListener('scroll', h, true); window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h, true); window.removeEventListener('resize', h); };
  }, [open, placement, align]);
  React.useEffect(() => {
    if (!open || !pos || hover || !panelRef.current || panelRef.current.contains(document.activeElement)) return;
    const el = (bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE)) || panelRef.current;
    el.focus({ preventScroll: true });
  }, [open, !!pos]);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (trigRef.current && !trigRef.current.contains(e.target as Node) && panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  React.useEffect(() => () => clearTimeout(hoverT.current), []);

  const hoverIn = () => { if (!hover) return; clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setOpen(true), 300); };
  const hoverOut = () => { if (!hover) return; clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setOpen(false), 150); };
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape' && open) { e.stopPropagation(); close(true); } };
  const onPanelBlur = (e: React.FocusEvent) => {
    const n = e.relatedTarget as Node | null;
    if (!hover && n && panelRef.current && !panelRef.current.contains(n) && trigRef.current && !trigRef.current.contains(n)) setOpen(false);
  };

  const trig = React.isValidElement<{ onClick?: React.MouseEventHandler }>(trigger)
    ? React.cloneElement(trigger, hover
      ? { 'aria-describedby': open ? uid : undefined } as Record<string, unknown>
      : {
        'aria-expanded': open, 'aria-haspopup': 'dialog', 'aria-controls': open ? uid : undefined,
        onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setOpen(!open); },
      } as Record<string, unknown>)
    : trigger;
  const render = (n: PopoverRenderable | undefined) => (typeof n === 'function' ? n(close) : n);
  const arrowStyle: React.CSSProperties | undefined = pos ? ({
    bottom: { top: -6, left: (pos.ax ?? 0) - 5, borderLeft: '1px solid var(--ob-border)', borderTop: '1px solid var(--ob-border)' },
    top: { bottom: -6, left: (pos.ax ?? 0) - 5, borderRight: '1px solid var(--ob-border)', borderBottom: '1px solid var(--ob-border)' },
    right: { left: -6, top: (pos.ay ?? 0) - 5, borderLeft: '1px solid var(--ob-border)', borderBottom: '1px solid var(--ob-border)' },
    left: { right: -6, top: (pos.ay ?? 0) - 5, borderTop: '1px solid var(--ob-border)', borderRight: '1px solid var(--ob-border)' },
  } as Record<PopoverPlacement, React.CSSProperties>)[pos.side] : undefined;

  return (
    <>
      <span ref={trigRef} style={{ display: 'inline-flex' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
        onFocus={hover ? () => setOpen(true) : undefined} onBlur={hover ? hoverOut : undefined} onKeyDown={onKey}>{trig}</span>
      {open && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div ref={panelRef} id={uid} role={hover ? 'tooltip' : 'dialog'} aria-label={title ? undefined : ariaLabel} aria-labelledby={title ? `${uid}-t` : undefined} tabIndex={-1}
          onKeyDown={onKey} onBlur={onPanelBlur} onMouseEnter={() => hover && clearTimeout(hoverT.current)} onMouseLeave={hoverOut}
          style={{ position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0, width, maxWidth: 'calc(100vw - 16px)', zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'], visibility: pos ? 'visible' : 'hidden', outline: 'none' }}>
          <FloatingPanel padding={0} style={{ position: 'relative', top: 0, left: 0, right: 'auto', overflow: 'visible' }}>
            {arrow && pos && <span aria-hidden="true" style={{ position: 'absolute', width: 10, height: 10, background: 'var(--ob-surface)', transform: 'rotate(45deg)', ...arrowStyle }} />}
            <div style={{ position: 'relative', padding, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--ob-font)', fontSize: 14, lineHeight: '20px', color: 'var(--ob-fg)' }}>
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '-2px -4px -2px 0' }}>
                  <span id={`${uid}-t`} style={{ fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{title}</span>
                  {!hover && closeButton && (
                    <button type="button" aria-label="Fechar" onClick={() => close(true)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none',
                      background: 'transparent', borderRadius: 'var(--ob-r-sm)', color: 'var(--ob-fg-mute)', cursor: 'pointer', padding: 0,
                    }}><Ph n="x" size={14} c="currentColor" /></button>
                  )}
                </div>
              )}
              <div ref={bodyRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{render(children)}</div>
              {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>{render(footer)}</div>}
            </div>
          </FloatingPanel>
        </div>, document.body)}
    </>
  );
};
