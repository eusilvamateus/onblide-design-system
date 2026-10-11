import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Button } from '../../actions/Button/Button';
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
        {action && <Button kind="ghost" size="sm" onClick={onAction} style={{ marginTop: 6, marginLeft: -12, color: t.strong }}>{action} →</Button>}
      </div>
      {dismissible && onClose && <Button kind="neutral" iconOnly size="sm" onClick={onClose} aria-label="Fechar" icon={<Ph n="x" size={16} />} style={{ flex: 'none', margin: '-8px -10px -8px 0' }} />}
    </div>
  );
};
