import React, { useRef, useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type TooltipVariant = 'text' | 'inverted' | 'image';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  variant?: TooltipVariant;
  placement?: TooltipPlacement;
  label?: React.ReactNode;
  shortcut?: React.ReactNode;
  image?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  delay?: number;
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children, variant = 'text', placement = 'top', label, shortcut, image, title, subtitle, delay = 120, maxWidth = 240,
}) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { timer.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  const inverted = variant === 'inverted';
  const bg = inverted ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = inverted ? 'var(--ob-fg-strong)' : '#fff';
  const subFg = inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.7)';
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
          boxShadow: inverted ? 'var(--ob-shadow-md)' : '0 4px 12px rgba(0,0,0,0.18)',
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
              {shortcut && (
                <kbd style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 11, fontWeight: 600,
                  padding: '2px 6px', borderRadius: 5,
                  background: inverted ? 'var(--ob-bg-alt)' : 'rgba(255,255,255,0.16)',
                  color: inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.9)',
                }}>{shortcut}</kbd>
              )}
            </span>
          )}
          {variant !== 'image' && <span style={{ ...arrowBase, ...arrowPos[placement] }} />}
        </span>
      )}
    </span>
  );
};

injectStyleOnce('ob-tip-kf', '@keyframes ob-tip { from { opacity: 0; } }');
