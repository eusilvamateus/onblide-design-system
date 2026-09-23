import React from 'react';
import { Ph } from '../Ph/Ph';
import { OB_TONES, OBTone } from '../obTones';

export interface ToastProps {
  tone?: OBTone;
  title?: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  icon?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ tone = 'info', title, body, action, onAction, onClose, icon = true }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="status" aria-live="polite" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', maxWidth: 400, padding: 14, boxSizing: 'border-box',
      background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)',
      boxShadow: 'var(--ob-shadow-lg)',
    }}>
      {icon && (
        <span style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 'var(--ob-r-sm)',
          background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ph n={t.icon} size={17} c={t.fg} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.4 }}>{title}</div>
        {body && <div style={{ fontSize: 13, color: 'var(--ob-fg-soft)', marginTop: 3, lineHeight: 1.5 }}>{body}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 8, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action}</button>}
      </div>
      {onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2, flexShrink: 0 }}><Ph n="x" size={16} /></button>}
    </div>
  );
};
