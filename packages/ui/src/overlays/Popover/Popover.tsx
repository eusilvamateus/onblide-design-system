import React from 'react';
import ReactDOM from 'react-dom';
import { FloatingPanel } from '../../internal/FloatingPanel';
import { Ph } from '../../iconography/Ph/Ph';
import { Button } from '../../actions/Button/Button';
import { posicionarPainel } from '../../internal/floating';
import type { PosicaoFixa } from '../../internal/floating';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const PopoverAncestorsContext = React.createContext<readonly string[]>([]);

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
  padding?: number | string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  ariaLabel?: string;
  closeButton?: boolean;
}

/** Conteúdo rico ancorado a um gatilho, não modal — cuida de posição, foco e fechamento. */
export const Popover: React.FC<PopoverProps> = ({
  trigger, children, title, footer, placement = 'bottom', align = 'start', arrow = false, interaction = 'click',
  width = 280, padding = 'var(--ob-space-16)', defaultOpen = false, onOpenChange, ariaLabel, closeButton = true,
}) => {
  const [open, setOpenState] = React.useState(defaultOpen);
  const [pos, setPos] = React.useState<PosicaoFixa | null>(null);
  const trigRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const hoverT = React.useRef<ReturnType<typeof setTimeout>>();
  const uid = React.useId();
  const ancestorIds = React.useContext(PopoverAncestorsContext);
  const hover = interaction === 'hover';
  const setOpen = (v: boolean) => { setOpenState(v); onOpenChange?.(v); };
  const focusTrigger = () => { const t = trigRef.current; const el = (t && (t.querySelector<HTMLElement>(FOCUSABLE) || t)); el?.focus({ preventScroll: true }); };
  const close = (returnFocus = true) => { setOpen(false); if (returnFocus) focusTrigger(); };
  const isInsideNestedPopover = (node: Node | null) => {
    if (typeof Element === 'undefined' || !(node instanceof Element)) return false;
    const nestedPanel = node.closest<HTMLElement>('[data-ob-popover-ancestors]');
    return nestedPanel?.dataset.obPopoverAncestors?.split(' ').includes(uid) ?? false;
  };

  const place = () => {
    const t = trigRef.current, p = panelRef.current;
    if (!t || !p) return;
    setPos(posicionarPainel(
      placement, align, t.getBoundingClientRect(), { largura: p.offsetWidth, altura: p.offsetHeight },
      { largura: window.innerWidth, altura: window.innerHeight }, arrow ? 10 : 6,
    ));
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
      const target = e.target as Node;
      const path = e.composedPath();
      const insideTrigger = !!trigRef.current && (trigRef.current.contains(target) || path.includes(trigRef.current));
      const insidePanel = !!panelRef.current && (panelRef.current.contains(target) || path.includes(panelRef.current));
      if (!insideTrigger && !insidePanel && !isInsideNestedPopover(target)) setOpen(false);
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
    if (!hover && n && panelRef.current && !panelRef.current.contains(n) && trigRef.current && !trigRef.current.contains(n) && !isInsideNestedPopover(n)) setOpen(false);
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
        <PopoverAncestorsContext.Provider value={[...ancestorIds, uid]}>
          <div ref={panelRef} id={uid} data-ob-popover-id={uid} data-ob-popover-ancestors={ancestorIds.join(' ') || undefined}
            role={hover ? 'tooltip' : 'dialog'} aria-label={title ? undefined : ariaLabel} aria-labelledby={title ? `${uid}-t` : undefined} tabIndex={-1}
            onKeyDown={onKey} onBlur={onPanelBlur} onMouseEnter={() => hover && clearTimeout(hoverT.current)} onMouseLeave={hoverOut}
            style={{ position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0, width, maxWidth: 'calc(100vw - 16px)', zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'], visibility: pos ? 'visible' : 'hidden', outline: 'none' }}>
            <FloatingPanel padding={0} style={{ position: 'relative', top: 0, left: 0, right: 'auto', overflow: 'visible' }}>
              {arrow && pos && <span aria-hidden="true" style={{ position: 'absolute', width: 10, height: 10, background: 'var(--ob-surface)', transform: 'rotate(45deg)', ...arrowStyle }} />}
              <div style={{ position: 'relative', padding, display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)', fontFamily: 'var(--ob-font)', fontSize: 14, lineHeight: '20px', color: 'var(--ob-fg)' }}>
                {title && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ob-space-8)', margin: 'calc(var(--ob-space-2) * -1) calc(var(--ob-space-4) * -1) calc(var(--ob-space-2) * -1) 0' }}>
                    <span id={`${uid}-t`} style={{ fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{title}</span>
                    {!hover && closeButton && (
                      <Button kind="neutral" iconOnly size="sm" aria-label="Fechar" onClick={() => close(true)} icon={<Ph n="x" size={14} c="currentColor" />} style={{ margin: 'calc(var(--ob-space-4) * -1)' }} />
                    )}
                  </div>
                )}
                <div ref={bodyRef} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)' }}>{render(children)}</div>
                {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--ob-space-8)', flexWrap: 'wrap' }}>{render(footer)}</div>}
              </div>
            </FloatingPanel>
          </div>
        </PopoverAncestorsContext.Provider>, document.body)}
    </>
  );
};
