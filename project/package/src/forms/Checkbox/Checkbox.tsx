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
  /** Nome acessível quando não há `label` visível (ex.: seleção de linhas em tabela). */
  ariaLabel?: string;
}

/** Caixa de seleção para escolhas múltiplas ou confirmação, com suporte a estado indeterminado. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description, ariaLabel,
}) => {
  const ativo = checked || indeterminate;
  const temTexto = label != null || description != null;
  return (
    <label
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : !!checked}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => { e.preventDefault(); if (!disabled) onChange?.(!checked); }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!disabled) onChange?.(!checked); } }}
      style={{
        display: temTexto ? 'flex' : 'inline-flex', alignItems: 'flex-start', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      }}>
      {/* Check e traço são glifos do Phosphor no mesmo peso (bold: ícone pequeno sobre fundo sólido). */}
      <span style={{
        flex: 'none', marginTop: temTexto ? 1 : 0, width: 18, height: 18, boxSizing: 'border-box', borderRadius: 6,
        border: `1.5px solid ${ativo ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        background: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 160ms var(--ob-ease)',
      }}>
        {ativo && <Ph n={indeterminate ? 'minus' : 'check'} size={12} c="#fff" weight="bold" />}
      </span>
      {temTexto && (
        <span>
          {label != null && <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>}
          {description != null && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
        </span>
      )}
    </label>
  );
};
