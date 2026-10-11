import React, { useRef, useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { Kbd } from '../../data-display/Kbd/Kbd';

export type TooltipVariant = 'text' | 'inverted' | 'image';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Elemento que dispara o tooltip no hover ou foco. */
  children: React.ReactNode;
  /** Estilo visual do balão. */
  variant?: TooltipVariant;
  /** Lado do gatilho em que o balão aparece. */
  placement?: TooltipPlacement;
  /** Texto principal, usado nas variantes `text` e `inverted`. */
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
  children, variant = 'text', placement = 'top', label, shortcut, image, title, subtitle, delay = 120, maxWidth = 240,
}) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  const inverted = variant === 'inverted';
  const bg = inverted ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = inverted ? 'var(--ob-fg-strong)' : 'var(--ob-surface)';
  const subFg = inverted ? 'var(--ob-fg-soft)' : 'color-mix(in srgb, var(--ob-surface) 70%, transparent)';
  const bordered = inverted ? '1px solid var(--ob-border)' : 'none';

  const pos: Record<TooltipPlacement, React.CSSProperties> = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  };

  const arrowBase: React.CSSProperties = { position: 'absolute', width: 8, height: 8, background: bg, transform: 'rotate(45deg)', border: bordered };
  const arrowPos: Record<TooltipPlacement, React.CSSProperties> = {
    top:    { bottom: -4, left: '50%', marginLeft: -4, borderTop: 'none', borderLeft: 'none' },
    bottom: { top: -4, left: '50%', marginLeft: -4, borderBottom: 'none', borderRight: 'none' },
    left:   { right: -4, top: '50%', marginTop: -4, borderBottom: 'none', borderLeft: 'none' },
    right:  { left: -4, top: '50%', marginTop: -4, borderTop: 'none', borderRight: 'none' },
  };

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <span role="tooltip" style={{
          position: 'absolute', zIndex: 'var(--ob-z-tooltip)' as React.CSSProperties['zIndex'], ...pos[placement],
          background: bg, color: fg, border: bordered,
          borderRadius: variant === 'image' ? 12 : 8,
          boxShadow: 'var(--ob-shadow-md)',
          padding: variant === 'image' ? 6 : '8px 11px',
          fontSize: 13, lineHeight: 1.4, fontWeight: 500, whiteSpace: variant === 'image' ? 'normal' : 'nowrap',
          maxWidth: variant === 'image' ? 200 : maxWidth, pointerEvents: 'none',
          animation: 'ob-tip 140ms var(--ob-ease-out)',
        }}>
          {variant === 'image' ? (
            <span style={{ display: 'block', width: 188 }}>
              <span style={{ display: 'block', width: '100%', height: 110, borderRadius: 8, overflow: 'hidden', background: 'var(--ob-bg-alt)' }}>
                {image && <img src={image} alt={typeof title === 'string' ? title : ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              {title && <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: fg, marginTop: 8, padding: '0 4px', whiteSpace: 'normal' }}>{title}</span>}
              {subtitle && <span style={{ display: 'block', fontSize: 12, color: subFg, marginTop: 2, padding: '0 4px 4px', whiteSpace: 'normal' }}>{subtitle}</span>}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>{label}</span>
              {shortcut && <Kbd size="sm">{shortcut}</Kbd>}
            </span>
          )}
          {variant !== 'image' && <span style={{ ...arrowBase, ...arrowPos[placement] }} />}
        </span>
      )}
    </span>
  );
};

injectStyleOnce('ob-tip-kf', '@keyframes ob-tip { from { opacity: 0; } }');
