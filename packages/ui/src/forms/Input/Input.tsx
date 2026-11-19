import React, { useId, useRef, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { FieldAddon, FieldIcon, focoNoAddon, recuoDoIcone, temConteudo } from '../../internal/FieldAddon';
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
  /** Ícone ou botão compacto no início do campo, antes do texto, dentro da mesma borda e sem divisória: a lupa de uma busca, um ícone do tipo de dado. Um `Button` com `iconOnly` e `size="sm"` se ajusta ao tamanho do campo. */
  startIcon?: React.ReactNode;
  /** Ícone ou botão compacto no fim do campo, dentro da mesma borda e sem divisória: um ícone de status, o botão de limpar ou o de mostrar a senha. Um `Button` com `iconOnly` e `size="sm"` se ajusta ao tamanho do campo. */
  endIcon?: React.ReactNode;
  /** Conteúdo no início do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  startAddon?: React.ReactNode;
  /** Conteúdo no fim do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  endAddon?: React.ReactNode;
}

/** Campo de texto com label, hint e estado de erro, com borda e ring de foco nos tokens do design system. */
export const Input: React.FC<InputProps> = ({ label, hint, error, size = 'md', startIcon, endIcon, startAddon, endAddon, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const [addonFocused, setAddonFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const id = rest.id ?? uid;
  const escala = ESCALA_DE_CAMPO[size];
  const temInicio = temConteudo(startAddon);
  const temFim = temConteudo(endAddon);
  const temIconeNoInicio = temConteudo(startIcon);
  const temIconeNoFim = temConteudo(endIcon);
  const emFoco = focused || addonFocused;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>
      {label && <label htmlFor={id} style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell
        focused={emFoco} error={!!error} disabled={rest.disabled} size={size}
        padding={`0 ${temFim ? 0 : temIconeNoFim ? recuoDoIcone(endIcon, size) : escala.recuo} 0 ${temInicio ? 0 : temIconeNoInicio ? recuoDoIcone(startIcon, size) : escala.recuo}`}
        onClick={(e) => { if (focoNoAddon(e.target)) inputRef.current?.focus(); }}>
        {temInicio && <FieldAddon side="start" size={size} focused={emFoco} error={!!error} onFocusChange={setAddonFocused}>{startAddon}</FieldAddon>}
        {temIconeNoInicio && <FieldIcon size={size}>{startIcon}</FieldIcon>}
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
        {temIconeNoFim && <FieldIcon size={size}>{endIcon}</FieldIcon>}
        {temFim && <FieldAddon side="end" size={size} focused={emFoco} error={!!error} onFocusChange={setAddonFocused}>{endAddon}</FieldAddon>}
      </FieldShell>
      {(hint || error) && <span style={{ fontSize: 'var(--ob-fs-11)', color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
    </div>
  );
};
