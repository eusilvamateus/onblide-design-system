import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Button } from '../../actions/Button/Button';
import { OB_TONES, OBTone } from '../../internal/obTones';
import type { Appearance } from '../../internal/appearance';

export type AlertAppearance = Extract<Appearance, 'outline' | 'soft'>;

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tom do alerta, que define ícone e cores. */
  tone?: OBTone;
  /** Pintura do alerta: `outline` usa o fundo clarinho do tom com uma borda na cor do tom; `soft` usa só o fundo clarinho, sem borda, para uma mensagem mais discreta. */
  appearance?: AlertAppearance;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") que substitui o ícone padrão do tom. */
  icon?: string;
  /** Título curto exibido em destaque no topo do conteúdo. */
  title?: React.ReactNode;
  /** Corpo da mensagem, exibido abaixo do título. */
  children?: React.ReactNode;
  /** Exibe o botão de fechar quando `true`. */
  dismissible?: boolean;
  /** Chamado ao clicar no botão de fechar. */
  onClose?: () => void;
  /** Rótulo do botão de ação, exibido à direita do conteúdo; desce para baixo do texto quando não cabe. */
  action?: React.ReactNode;
  /** Chamado ao clicar no botão de ação. */
  onAction?: () => void;
}

const PAPEL_DO_TOM: Record<OBTone, 'alert' | 'status'> = { info: 'status', success: 'status', warning: 'alert', danger: 'alert' };

/** Mensagem de feedback contextual e persistente exibida dentro do conteúdo da página. */
export const Alert: React.FC<AlertProps> = ({ tone = 'info', appearance = 'outline', icon, title, children, dismissible = false, onClose, action, onAction, role, style, ...rest }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const pintura: React.CSSProperties = appearance === 'soft'
    ? { background: t.tint, border: '1px solid transparent' }
    : { background: t.tint, border: `1px solid ${t.border}` };
  return (
    <div
      {...rest}
      role={role ?? PAPEL_DO_TOM[tone] ?? 'status'}
      style={{ display: 'flex', gap: 'var(--ob-space-12)', width: '100%', padding: 'var(--ob-space-12) var(--ob-space-16)', borderRadius: 'var(--ob-r-surface)', boxSizing: 'border-box', ...pintura, ...style }}
    >
      <Ph n={icon ?? t.icon} size={20} c={t.strong} weight="fill" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--ob-space-8) var(--ob-space-16)' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0, fontSize: 'var(--ob-fs-14)', lineHeight: 'var(--ob-lh-normal)' }}>
          {title && <div style={{ fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{title}</div>}
          {children && <div style={{ color: 'var(--ob-fg)' }}>{children}</div>}
        </div>
        {action && <Button kind="cream" size="sm" onClick={onAction} style={{ flex: 'none' }}>{action}<Ph n="arrow-right" size={14} /></Button>}
      </div>
      {dismissible && onClose && <Button kind="neutral" iconOnly size="sm" onClick={onClose} aria-label="Fechar" icon={<Ph n="x" size={16} />} style={{ flex: 'none', margin: 'calc(var(--ob-space-6) * -1) calc(var(--ob-space-8) * -1) calc(var(--ob-space-6) * -1) 0' }} />}
    </div>
  );
};
