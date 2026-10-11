import React from 'react';

export type KbdVariant = 'key' | 'plain';
export type KbdSize = 'sm' | 'md';

export interface KbdProps {
  /** `key` desenha a tecla com contorno e relevo; `plain` mostra só o texto do atalho, para listas e menus. */
  variant?: KbdVariant;
  /** Tamanho do texto e do espaçamento interno. */
  size?: KbdSize;
  /** Tecla ou atalho, como `Ctrl`, `⌘K` ou `Shift`. */
  children?: React.ReactNode;
}

/** Tecla ou atalho de teclado, em fonte monoespaçada. Usa a cor do texto ao redor, então funciona em qualquer fundo. */
export const Kbd: React.FC<KbdProps> = ({ variant = 'key', size = 'md', children }) => {
  const base: React.CSSProperties = {
    fontFamily: 'var(--ob-font-mono)', fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap',
  };
  if (variant === 'plain') return <kbd style={base}>{children}</kbd>;
  return (
    <kbd style={{
      ...base,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: size === 'sm' ? 20 : 24,
      padding: size === 'sm' ? '3px 6px' : '4px 8px', borderRadius: 'var(--ob-r-xs)', boxSizing: 'border-box',
      background: 'color-mix(in srgb, currentColor 10%, transparent)',
      border: '1px solid color-mix(in srgb, currentColor 30%, transparent)',
      borderBottomWidth: 2,
    }}>{children}</kbd>
  );
};
