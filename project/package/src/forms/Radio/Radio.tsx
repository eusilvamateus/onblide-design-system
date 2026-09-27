import React from 'react';

export interface RadioProps {
  /** Nome do grupo de radios (atributo `name` nativo); radios com o mesmo nome se excluem mutuamente. */
  name?: string;
  /** Valor associado a esta opção, enviado ao `onChange` quando ela é selecionada. */
  value: string;
  /** Define se esta opção está selecionada no momento. */
  checked: boolean;
  /** Chamado com o `value` da opção quando ela é selecionada pelo usuário. */
  onChange?: (value: string) => void;
  /** Texto ou conteúdo exibido ao lado do círculo de seleção. */
  label?: React.ReactNode;
  /** Desabilita a interação e reduz a opacidade da opção. */
  disabled?: boolean;
  /** Texto complementar exibido abaixo do label, explicando a opção. */
  description?: React.ReactNode;
}

/** Opção de escolha única (radio button) com label e descrição opcionais. */
export const Radio: React.FC<RadioProps> = ({
  name, value, checked, onChange, label, disabled = false, description,
}) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }}>
    <span style={{ position: 'relative', flex: 'none' }}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
        onChange={() => onChange?.(value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      {/* Contorno como sombra interna e ponto centrado por flex: sobram 5px exatos de cada lado do ponto (sem meio
          pixel). translateZ(0) alinha a caixa ao pixel mesmo em posição fracionada da página. */}
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%',
        boxShadow: `inset 0 0 0 1.5px ${checked ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        background: 'var(--ob-surface)', transform: 'translateZ(0)', transition: 'box-shadow 160ms',
      }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ob-blue)' }} />}
      </span>
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: '18px', display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
