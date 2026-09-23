import React, { useEffect } from 'react';
import { Icons } from '../../primitives/Icons/Icons';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

const MODAL_WIDTHS: Record<ModalSize, number | string> = { sm: 360, md: 440, lg: 720, full: '92vw' };

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  size?: ModalSize;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, width, size = 'md' }) => {
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 'var(--ob-z-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,20,20,var(--ob-opacity-scrim))', backdropFilter: 'blur(2px)', padding: 24,
      animation: 'ob-fade 160ms ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: resolvedWidth, maxWidth: '100%', background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-overlay)',
        boxShadow: 'var(--ob-shadow-lg)', overflow: 'hidden', animation: 'ob-pop 200ms var(--ob-ease-spring)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 24px 0' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</h3>
          <button onClick={onClose} style={{
            flex: 'none', width: 30, height: 30, borderRadius: 'var(--ob-r-sm)', border: 'none', background: 'transparent',
            color: 'var(--ob-fg-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <Icons.x size={18}/>
          </button>
        </div>
        <div style={{ padding: '12px 24px 20px', fontSize: 14, lineHeight: 1.6, color: 'var(--ob-fg)' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--ob-border)', background: 'var(--ob-bg-alt)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
};

// keyframes do modal (fade do backdrop + pop do painel), injetadas uma única vez
injectStyleOnce(
  'ob-modal-kf',
  '@keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes ob-pop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
);
