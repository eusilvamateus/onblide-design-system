import React, { useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo, explicando o formato esperado. Some quando `error` está presente. */
  hint?: React.ReactNode;
  /** Mensagem de erro exibida no lugar do hint e que deixa a borda do campo vermelha. */
  error?: React.ReactNode;
  /** Ícone exibido à esquerda do texto digitado. */
  icon?: React.ReactNode;
}

/** Campo de texto com label, hint e estado de erro, com borda e ring de foco nos tokens do design system. */
export const Input: React.FC<InputProps> = ({ label, hint, error, icon, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <FieldShell focused={focused} error={!!error}>
        {icon && <span style={{ display: 'flex', color: 'var(--ob-fg-mute)', flex: 'none' }}>{icon}</span>}
        <input
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
          }}
        />
      </FieldShell>
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
    </label>
  );
};
