import React from 'react';
import { Radio } from '../Radio/Radio';

export interface RadioGroupOption {
  /** Valor único que identifica esta opção dentro do grupo. */
  value: string;
  /** Texto ou conteúdo exibido como rótulo da opção. */
  label?: React.ReactNode;
  /** Texto complementar exibido abaixo do label, explicando a opção. */
  description?: React.ReactNode;
  /** Desabilita apenas esta opção dentro do grupo. */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Lista de opções mutuamente exclusivas exibidas verticalmente. */
  options: RadioGroupOption[];
  /** Valor da opção selecionada no momento. */
  value?: string;
  /** Chamado com o `value` da opção escolhida quando a seleção muda. */
  onChange?: (value: string) => void;
  /** Nome compartilhado pelos radios do grupo (atributo `name` nativo). */
  name?: string;
}

/** Conjunto de opções de escolha única (Radio) exibidas em coluna. */
export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name = 'radio-group' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {options.map(opt => (
      <Radio key={opt.value} name={name} value={opt.value} label={opt.label}
        description={opt.description} disabled={opt.disabled}
        checked={value === opt.value} onChange={onChange} />
    ))}
  </div>
);
