import React from 'react';
import { ESCALA_DE_ESCOLHA, TamanhoDeEscolha } from '../../internal/controlesDeEscolha';

export type RadioSize = TamanhoDeEscolha;

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
  /** Tamanho do círculo e do texto: `sm` (16px), `md` (18px) ou `lg` (20px). */
  size?: RadioSize;
}

const MARGEM_DO_PONTO = 5;

/** Opção de escolha única (radio button) com label e descrição opcionais. */
export const Radio: React.FC<RadioProps> = ({
  name, value, checked, onChange, label, disabled = false, description, size = 'md',
}) => {
  const { caixa, fonte, espaco } = ESCALA_DE_ESCOLHA[size];
  const ponto = caixa - MARGEM_DO_PONTO * 2;
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: espaco, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 'var(--ob-opacity-disabled)' : 1,
    }}>
      <span style={{ position: 'relative', flex: 'none' }}>
        <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
          onChange={() => onChange?.(value)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: caixa, height: caixa, borderRadius: 'var(--ob-r-circle)',
          boxShadow: `inset 0 0 0 1.5px ${checked ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
          background: 'var(--ob-surface)', transform: 'translateZ(0)', transition: 'box-shadow var(--ob-dur-fast) var(--ob-ease)',
        }}>
          {checked && <span style={{ width: ponto, height: ponto, borderRadius: 'var(--ob-r-circle)', background: 'var(--ob-blue)' }} />}
        </span>
      </span>
      <span>
        <span style={{ fontSize: fonte, color: 'var(--ob-fg-strong)', fontWeight: 'var(--ob-w-medium)', lineHeight: `${caixa}px`, display: 'block' }}>{label}</span>
        {description && <span style={{ fontSize: 'var(--ob-fs-12)', color: 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-2)', display: 'block' }}>{description}</span>}
      </span>
    </label>
  );
};
