import React, { useId, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { Kbd } from '../../data-display/Kbd/Kbd';
import { posicionarPainel } from '../../internal/floating';
import type { PosicaoFixa } from '../../internal/floating';
import type { Appearance } from '../../internal/appearance';

export type TooltipVariant = 'text' | 'image';
export type TooltipAppearance = Extract<Appearance, 'solid' | 'outline'>;
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Elemento que dispara o tooltip no hover ou foco. */
  children: React.ReactNode;
  /** Conteúdo do balão: `text` (rótulo e atalho) ou `image` (imagem com título e subtítulo). */
  variant?: TooltipVariant;
  /** Pintura do balão: `solid` (escuro, sem borda) ou `outline` (claro, com borda). */
  appearance?: TooltipAppearance;
  /** Lado do gatilho em que o balão aparece. */
  placement?: TooltipPlacement;
  /** Texto principal, usado na variante `text`. */
  label?: React.ReactNode;
  /** Atalho de teclado exibido ao lado do rótulo. */
  shortcut?: React.ReactNode;
  /** URL da imagem de preview, usada na variante `image`. */
  image?: string;
  /** Título exibido abaixo da imagem, na variante `image`. */
  title?: React.ReactNode;
  /** Subtítulo exibido abaixo do título, na variante `image`. */
  subtitle?: React.ReactNode;
  /** Tempo em ms de espera antes de exibir o tooltip. */
  delay?: number;
  /** Largura máxima do balão nas variantes de texto. */
  maxWidth?: number;
}

/** Dica contextual que aparece sobre um elemento ao passar o mouse ou focar nele. */
export const Tooltip: React.FC<TooltipProps> = ({
  children, variant = 'text', appearance = 'solid', placement = 'top', label, shortcut, image, title, subtitle, delay = 120, maxWidth = 240,
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PosicaoFixa | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) { setPos(null); return; }
    const place = () => {
      const t = trigRef.current, p = tipRef.current;
      if (!t || !p) return;
      const r = t.getBoundingClientRect();
      if (r.bottom < 0 || r.right < 0 || r.top > window.innerHeight || r.left > window.innerWidth) { setPos(null); return; }
      setPos(posicionarPainel(
        placement, 'center', r, { largura: p.offsetWidth, altura: p.offsetHeight },
        { largura: window.innerWidth, altura: window.innerHeight }, 8,
      ));
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
  }, [open, placement]);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  const claro = appearance === 'outline';
  const bg = claro ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = claro ? 'var(--ob-fg-strong)' : 'var(--ob-surface)';
  const subFg = claro ? 'var(--ob-fg-soft)' : 'color-mix(in srgb, var(--ob-surface) 70%, transparent)';
  const bordered = claro ? '1px solid var(--ob-border)' : 'none';

  const arrowBase: React.CSSProperties = { position: 'absolute', width: 8, height: 8, background: bg, transform: 'rotate(45deg)', border: bordered };
  const arrowPos: Record<TooltipPlacement, React.CSSProperties> = {
    top:    { bottom: -4, left: (pos?.ax ?? 0) - 4, borderTop: 'none', borderLeft: 'none' },
    bottom: { top: -4, left: (pos?.ax ?? 0) - 4, borderBottom: 'none', borderRight: 'none' },
    left:   { right: -4, top: (pos?.ay ?? 0) - 4, borderBottom: 'none', borderLeft: 'none' },
    right:  { left: -4, top: (pos?.ay ?? 0) - 4, borderTop: 'none', borderRight: 'none' },
  };

  return (
    <span ref={trigRef} style={{ display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { 'aria-describedby': open ? tipId : undefined }) : children}
      {open && typeof document !== 'undefined' && ReactDOM.createPortal(
        <span ref={tipRef} id={tipId} role="tooltip" style={{
          position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0, visibility: pos ? 'visible' : 'hidden',
          zIndex: 'var(--ob-z-tooltip)' as React.CSSProperties['zIndex'],
          background: bg, color: fg, border: bordered,
          borderRadius: variant === 'image' ? 'var(--ob-r-md)' : 'var(--ob-r-sm)',
          boxShadow: 'var(--ob-shadow-md)',
          padding: variant === 'image' ? 'var(--ob-space-6)' : 'var(--ob-space-8) var(--ob-space-12)',
          fontSize: 13, lineHeight: 1.4, fontWeight: 500, whiteSpace: 'normal', overflowWrap: 'anywhere',
          width: variant === 'image' ? undefined : 'max-content', maxWidth: variant === 'image' ? 200 : maxWidth, pointerEvents: 'none',
          animation: 'ob-tip var(--ob-dur-fast) var(--ob-ease-out)',
        }}>
          {variant === 'image' ? (
            <span style={{ display: 'block', width: 188 }}>
              <span style={{ display: 'block', width: '100%', height: 110, borderRadius: 'var(--ob-r-sm)', overflow: 'hidden', background: 'var(--ob-bg-alt)' }}>
                {image && <img src={image} alt={typeof title === 'string' ? title : ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              {title && <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: fg, marginTop: 'var(--ob-space-8)', padding: '0 var(--ob-space-4)', whiteSpace: 'normal' }}>{title}</span>}
              {subtitle && <span style={{ display: 'block', fontSize: 12, color: subFg, marginTop: 'var(--ob-space-2)', padding: '0 var(--ob-space-4) var(--ob-space-4)', whiteSpace: 'normal' }}>{subtitle}</span>}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-8)' }}>
              <span>{label}</span>
              {shortcut && <Kbd size="sm">{shortcut}</Kbd>}
            </span>
          )}
          {variant !== 'image' && pos && <span aria-hidden="true" style={{ ...arrowBase, ...arrowPos[pos.side] }} />}
        </span>, document.body)}
    </span>
  );
};

injectStyleOnce('ob-tip-kf', '@keyframes ob-tip { from { opacity: 0; } }');
