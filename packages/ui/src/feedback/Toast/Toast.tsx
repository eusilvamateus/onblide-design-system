import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Button } from '../../actions/Button/Button';
import { OB_TONES, OBTone } from '../../internal/obTones';
import type { Appearance } from '../../internal/appearance';

export type ToastAppearance = Extract<Appearance, 'plain' | 'outline' | 'soft'>;

export interface ToastProps {
  /** Tom da notificação, que define o ícone e a cor do chip. */
  tone?: OBTone;
  /** Pintura do toast: `plain` usa a superfície com borda neutra e só o ícone na cor do tom; `outline` usa o fundo clarinho do tom com uma borda na cor do tom; `soft` usa só o fundo clarinho do tom, sem borda. */
  appearance?: ToastAppearance;
  /** Título curto exibido em destaque. */
  title?: React.ReactNode;
  /** Detalhe opcional exibido abaixo do título. */
  body?: React.ReactNode;
  /** Rótulo do botão de ação, exibido abaixo do corpo. */
  action?: React.ReactNode;
  /** Chamado ao clicar no botão de ação. */
  onAction?: () => void;
  /** Chamado ao clicar no botão de fechar; quando ausente, o botão não é exibido. */
  onClose?: () => void;
  /** Exibe o chip com ícone tonal à esquerda. */
  icon?: boolean;
}

/** Notificação flutuante e efêmera que confirma ações ou informa eventos em segundo plano. */
export const Toast: React.FC<ToastProps> = ({ tone = 'info', appearance = 'plain', title, body, action, onAction, onClose, icon = true }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const pinturas: Record<ToastAppearance, React.CSSProperties> = {
    plain: { background: 'var(--ob-surface)', border: '1px solid var(--ob-border)' },
    outline: { background: t.tint, border: `1px solid ${t.border}` },
    soft: { background: t.tint, border: '1px solid transparent' },
  };
  const pintura = pinturas[appearance] ?? pinturas.plain;
  return (
    <div role="status" aria-live="polite" style={{
      display: 'flex', alignItems: 'center', gap: 'var(--ob-space-12)',
      width: '100%', maxWidth: 400, padding: 'var(--ob-space-16)', boxSizing: 'border-box',
      ...pintura,
      borderRadius: 'var(--ob-r-surface)',
      boxShadow: 'var(--ob-shadow-lg)',
    }}>
      {icon && (
        <span style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 'var(--ob-r-sm)',
          background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ph n={t.icon} size={17} c={t.fg} weight="fill" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--ob-fs-14)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)', lineHeight: 1.4 }}>{title}</div>
        {body && <div style={{ fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-4)', lineHeight: 1.5 }}>{body}</div>}
        {action && <Button kind="ghost" size="sm" onClick={onAction} style={{ marginTop: 'var(--ob-space-4)', marginLeft: 'calc(var(--ob-space-12) * -1)', color: t.strong }}>{action}</Button>}
      </div>
      {onClose && <Button kind="neutral" iconOnly size="sm" onClick={onClose} aria-label="Fechar" icon={<Ph n="x" size={16} />} style={{ flexShrink: 0, margin: 'calc(var(--ob-space-8) * -1) calc(var(--ob-space-6) * -1) calc(var(--ob-space-8) * -1) 0' }} />}
    </div>
  );
};
