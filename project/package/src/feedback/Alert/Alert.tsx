import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { OB_TONES, OBTone } from '../../internal/obTones';

export interface AlertProps {
  /** Tom do alerta, que define ícone e cores. */
  tone?: OBTone;
  /** Título curto exibido em destaque no topo do conteúdo. */
  title?: React.ReactNode;
  /** Corpo da mensagem, exibido abaixo do título. */
  children?: React.ReactNode;
  /** Exibe o botão de fechar quando `true`. */
  dismissible?: boolean;
  /** Chamado ao clicar no botão de fechar. */
  onClose?: () => void;
  /** Rótulo do link de ação exibido abaixo do conteúdo. */
  action?: React.ReactNode;
  /** Chamado ao clicar no link de ação. */
  onAction?: () => void;
}

/** Mensagem de feedback contextual e persistente exibida dentro do conteúdo da página. */
export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, dismissible = false, onClose, action, onAction }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="alert" style={{ display: 'flex', gap: 13, width: '100%', padding: '14px 16px', background: t.bg, border: `1px solid color-mix(in srgb, ${t.fg} 28%, transparent)`, borderRadius: 'var(--ob-r-md)', boxSizing: 'border-box' }}>
      <Ph n={t.icon} size={20} c={t.fg} weight="fill" />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13.5, color: 'var(--ob-fg)', lineHeight: 1.5 }}>{children}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action} →</button>}
      </div>
      {dismissible && onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-soft)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x" size={15} /></button>}
    </div>
  );
};
