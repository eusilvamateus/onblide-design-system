import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';

export interface CheckboxProps {
  /** Define se a caixa está marcada. */
  checked: boolean;
  /** Chamado com o novo valor sempre que o usuário alterna a marcação. */
  onChange?: (checked: boolean) => void;
  /** Texto ou conteúdo exibido ao lado da caixa. */
  label?: React.ReactNode;
  /** Bloqueia a interação e reduz a opacidade do componente. */
  disabled?: boolean;
  /** Exibe o traço de estado parcial, usado em "selecionar tudo". */
  indeterminate?: boolean;
  /** Texto de apoio exibido abaixo do label. */
  description?: React.ReactNode;
}

/** Caixa de seleção para escolhas múltiplas ou confirmação, com suporte a estado indeterminado. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description,
}) => (
  <label
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : !!checked}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : 0}
    onClick={() => !disabled && onChange?.(!checked)}
    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!disabled) onChange?.(!checked); } }}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>
    <span style={{
      flex: 'none', marginTop: 1, width: 18, height: 18, borderRadius: 6,
      border: `1.5px solid ${checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      background: checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 160ms var(--ob-ease)',
    }}>
      {checked && !indeterminate && (
        <Ph n="check" size={12} c="#fff" style={{ lineHeight: 1 }} />
      )}
      {indeterminate && <span style={{ width: 9, height: 2, background: '#fff', borderRadius: 1 }} />}
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
