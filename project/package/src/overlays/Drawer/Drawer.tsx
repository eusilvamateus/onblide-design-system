import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  side?: 'left' | 'right';
  width?: number | string;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children, side = 'right', width = 400, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const transform = side === 'right'
    ? open ? 'translateX(0)' : 'translateX(100%)'
    : open ? 'translateX(0)' : 'translateX(-100%)';

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(20,20,20,var(--ob-opacity-scrim))',
        backdropFilter: 'blur(2px)', zIndex: 'var(--ob-z-overlay)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.22s ease',
      }}/>
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        [side]: 0,
        width, maxWidth: '100%',
        background: 'var(--ob-surface)',
        borderLeft: side === 'right' ? '1px solid var(--ob-border)' : 'none',
        borderRight: side === 'left' ? '1px solid var(--ob-border)' : 'none',
        zIndex: 'var(--ob-z-modal)', display: 'flex', flexDirection: 'column',
        transform, transition: 'transform 0.25s var(--ob-ease)',
      } as React.CSSProperties}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--ob-border)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 'var(--ob-r-sm)', border: 'none', background: 'none',
            color: 'var(--ob-fg-mute)', cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--ob-border)',
            background: 'var(--ob-bg-alt)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
