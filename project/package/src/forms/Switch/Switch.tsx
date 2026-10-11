import React from 'react';

export interface SwitchProps {
  /** Estado atual do interruptor: `true` para ligado, `false` para desligado. */
  checked: boolean;
  /** Chamado com o novo valor sempre que o usuário alterna o interruptor. */
  onChange?: (checked: boolean) => void;
  /** Texto ou conteúdo exibido ao lado do interruptor, descrevendo o que é ligado. */
  label?: React.ReactNode;
  /** Impede a alternância e reduz a opacidade, indicando que o controle está bloqueado. */
  disabled?: boolean;
  /** Dimensão do trilho e do knob. */
  size?: 'sm' | 'md';
}

/** Interruptor binário que aplica uma configuração imediatamente, sem exigir confirmação. */
export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, knob = h - 4;
  const alternar = () => { if (!disabled) onChange?.(!checked); };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        aria-label={typeof label === 'string' ? label : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={alternar}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); } }}
        style={{
          width: w, height: h, borderRadius: 999, flex: 'none', position: 'relative',
          background: checked ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background 200ms var(--ob-ease)',
        }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? w - knob - 2 : 2, width: knob, height: knob,
          borderRadius: '50%', background: 'var(--ob-fg-on-color)', transition: 'left 200ms var(--ob-ease)',
          boxShadow: 'var(--ob-shadow-xs)',
        }} />
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
};
