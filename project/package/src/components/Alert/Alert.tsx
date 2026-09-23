import React from 'react';
import { Ph } from '../Ph/Ph';
import { OB_TONES, OBTone } from '../obTones';

export interface AlertProps {
  tone?: OBTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  onAction?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, dismissible = false, onClose, action, onAction }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="alert" style={{ display: 'flex', gap: 13, width: '100%', padding: '14px 16px', background: t.bg, border: `1px solid color-mix(in srgb, ${t.fg} 28%, transparent)`, borderRadius: 'var(--ob-r-md)', boxSizing: 'border-box' }}>
      <Ph n={t.icon} size={20} c={t.fg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13.5, color: 'var(--ob-fg)', lineHeight: 1.5 }}>{children}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action} →</button>}
      </div>
      {dismissible && onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-soft)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x" size={15} /></button>}
    </div>
  );
};
