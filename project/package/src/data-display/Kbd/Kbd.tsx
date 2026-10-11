import React from 'react';

export type KbdVariant = 'key' | 'plain';
export type KbdSize = 'sm' | 'md';

export interface KbdProps {
  /** `key` desenha a tecla com contorno e relevo; `plain` mostra só o texto do atalho, para listas e menus. */
  variant?: KbdVariant;
  /** Tamanho do texto e do espaçamento interno. */
  size?: KbdSize;
  /** Cores para fundos escuros, como o Tooltip padrão. */
  inverse?: boolean;
  /** Tecla ou atalho, como `Ctrl`, `⌘K` ou `Shift`. */
  children?: React.ReactNode;
}

/** Tecla ou atalho de teclado, em fonte monoespaçada. */
export const Kbd: React.FC<KbdProps> = ({ variant = 'key', size = 'md', inverse = false, children }) => {
  const fonte = size === 'sm' ? 11 : 12;
  const cor = inverse ? 'color-mix(in srgb, var(--ob-surface) 90%, transparent)' : 'var(--ob-fg-soft)';
  const base: React.CSSProperties = {
    fontFamily: 'var(--ob-font-mono)', fontSize: fonte, fontWeight: 600, lineHeight: 1, color: cor, whiteSpace: 'nowrap',
  };
  if (variant === 'plain') return <kbd style={base}>{children}</kbd>;
  return (
    <kbd style={{
      ...base,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: size === 'sm' ? 20 : 24,
      padding: size === 'sm' ? '3px 6px' : '4px 8px', borderRadius: 'var(--ob-r-xs)', boxSizing: 'border-box',
      background: inverse ? 'color-mix(in srgb, var(--ob-surface) 16%, transparent)' : 'var(--ob-bg-alt)',
      border: `1px solid ${inverse ? 'color-mix(in srgb, var(--ob-surface) 24%, transparent)' : 'var(--ob-border)'}`,
      borderBottomWidth: 2,
    }}>{children}</kbd>
  );
};
