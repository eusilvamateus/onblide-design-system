import React, { useId, useRef, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { FieldAddon, focoNoAddon } from '../../internal/FieldAddon';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type InputSize = TamanhoDeCampo;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'size'> {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo, explicando o formato esperado. Some quando `error` está presente. */
  hint?: React.ReactNode;
  /** Mensagem de erro exibida no lugar do hint e que deixa a borda do campo vermelha. */
  error?: React.ReactNode;
  /** Tamanho do campo, que ajusta altura, fonte e recuo lateral. */
  size?: InputSize;
  /** Ícone exibido à esquerda do texto digitado. */
  icon?: React.ReactNode;
  /** Conteúdo no início do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  startAddon?: React.ReactNode;
  /** Conteúdo no fim do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  endAddon?: React.ReactNode;
}

/** Campo de texto com label, hint e estado de erro, com borda e ring de foco nos tokens do design system. */
export const Input: React.FC<InputProps> = ({ label, hint, error, size = 'md', icon, startAddon, endAddon, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const [addonFocused, setAddonFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const id = rest.id ?? uid;
  const escala = ESCALA_DE_CAMPO[size];
  const temInicio = startAddon != null && startAddon !== false;
  const temFim = endAddon != null && endAddon !== false;
  const emFoco = focused || addonFocused;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>
      {label && <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell
        focused={emFoco} error={!!error} disabled={rest.disabled} size={size}
        padding={`0 ${temFim ? 0 : escala.recuo} 0 ${temInicio ? 0 : escala.recuo}`}
        onClick={(e) => { if (focoNoAddon(e.target)) inputRef.current?.focus(); }}>
        {temInicio && <FieldAddon side="start" size={size} focused={emFoco} error={!!error} onFocusChange={setAddonFocused}>{startAddon}</FieldAddon>}
        {icon && <span style={{ display: 'flex', color: 'var(--ob-fg-mute)', flex: 'none' }}>{icon}</span>}
        <input
          {...rest}
          id={id}
          ref={inputRef}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            flex: 1, minWidth: 0, alignSelf: 'stretch', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: escala.fonte, color: 'var(--ob-fg-strong)', padding: 0,
          }}
        />
        {temFim && <FieldAddon side="end" size={size} focused={emFoco} error={!!error} onFocusChange={setAddonFocused}>{endAddon}</FieldAddon>}
      </FieldShell>
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
    </div>
  );
};
