import React from 'react';
import type { Appearance } from '../../internal/appearance';

export type KbdAppearance = Extract<Appearance, 'outline' | 'ghost'>;
export type KbdSize = 'sm' | 'md';

export interface KbdProps {
  /** `outline` desenha a tecla com borda e relevo; `ghost` mostra só o texto do atalho, sem borda nem fundo, para listas e menus. */
  appearance?: KbdAppearance;
  /** Altura da tecla e tamanho do texto. */
  size?: KbdSize;
  /** Combinação de teclas, uma por item, como `['Ctrl', 'K']`: cada tecla ganha a própria caixa. Substitui `children`. */
  keys?: string[];
  /** Uma tecla, como `Ctrl`, `⌘` ou `Esc`. */
  children?: React.ReactNode;
}

const ESCALA: Record<KbdSize, { altura: number; fonte: string; recuo: string }> = {
  sm: { altura: 20, fonte: 'var(--ob-fs-11)', recuo: 'var(--ob-space-4)' },
  md: { altura: 24, fonte: 'var(--ob-fs-12)', recuo: 'var(--ob-space-6)' },
};

const Tecla: React.FC<{ appearance: KbdAppearance; size: KbdSize; children?: React.ReactNode }> = ({ appearance, size, children }) => {
  const escala = ESCALA[size];
  const base: React.CSSProperties = {
    fontFamily: 'var(--ob-font-mono)', fontSize: escala.fonte, fontWeight: 'var(--ob-w-medium)', lineHeight: 1, whiteSpace: 'nowrap', boxShadow: 'none',
  };
  if (appearance === 'ghost') return <kbd style={{ ...base, color: 'inherit', background: 'none', border: 'none', borderRadius: 0, padding: 0 }}>{children}</kbd>;
  return (
    <kbd style={{
      ...base,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', boxSizing: 'border-box',
      height: escala.altura, minWidth: escala.altura, padding: `0 ${escala.recuo}`, borderRadius: 'var(--ob-r-xs)',
      color: 'var(--ob-fg)', background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)', borderBottomWidth: 2, borderBottomColor: 'color-mix(in srgb, var(--ob-fg-mute) 45%, var(--ob-border))',
    }}>{children}</kbd>
  );
};

/** Tecla ou atalho de teclado, em fonte monoespaçada e com cores próprias, legível em qualquer fundo. */
export const Kbd: React.FC<KbdProps> = ({ appearance = 'outline', size = 'md', keys, children }) => {
  if (!keys) return <Tecla appearance={appearance} size={size}>{children}</Tecla>;
  return (
    <kbd style={{ display: 'inline-flex', alignItems: 'center', gap: appearance === 'ghost' ? 'var(--ob-space-2)' : 'var(--ob-space-4)', verticalAlign: 'middle', font: 'inherit', color: 'inherit', background: 'none', border: 'none', borderRadius: 0, padding: 0, boxShadow: 'none' }}>
      {keys.map((tecla, i) => <Tecla key={`${tecla}-${i}`} appearance={appearance} size={size}>{tecla}</Tecla>)}
    </kbd>
  );
};
