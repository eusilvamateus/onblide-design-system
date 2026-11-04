import React from 'react';
import { BADGE_TONES, BadgeTone } from '../../internal/badgeTones';
import type { Appearance } from '../../internal/appearance';

export type BadgeVariant = 'label' | 'numeric';
export type BadgeAppearance = Extract<Appearance, 'soft' | 'solid' | 'outline'>;

export interface BadgeProps {
  /** Cor semântica do badge. */
  tone?: BadgeTone;
  /** Forma do badge: `label` é a pílula de rótulo; `numeric` é o contador compacto, sem ponto. */
  variant?: BadgeVariant;
  /** Pintura do badge: `soft` (fundo clarinho, sem borda), `solid` (cheio na cor forte) ou `outline` (com borda, sem fundo). Padrão: `soft` em `label` e `solid` em `numeric`. */
  appearance?: BadgeAppearance;
  /** Exibe um ponto colorido antes do conteúdo (ignorado na variante `numeric`). */
  dot?: boolean;
  /** Tamanho do texto e do espaçamento interno. */
  size?: 'sm' | 'md';
  /** Conteúdo do badge, geralmente um rótulo curto ou número. */
  children?: React.ReactNode;
}

/** Rótulo curto e colorido para status, categorias ou contagens. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'primary', variant = 'label', appearance, dot = true, size = 'md', children }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.primary;
  const numerico = variant === 'numeric';
  const pintura: BadgeAppearance = appearance ?? (numerico ? 'solid' : 'soft');
  const fs = size === 'sm' ? 11 : 12;
  const preenchimento = size === 'sm' ? 'var(--ob-space-2) var(--ob-space-8)' : 'var(--ob-space-4) var(--ob-space-10)';

  const pinturas: Record<BadgeAppearance, React.CSSProperties> = {
    soft:    { background: t.bg, color: t.fg, border: 'none' },
    solid:   { background: t.solid, color: 'var(--ob-fg-on-color)', border: 'none' },
    outline: { background: 'transparent', color: t.fg, border: `1.5px solid ${t.border}` },
  };
  const forma: React.CSSProperties = numerico
    ? { minWidth: 18, height: 18, padding: '0 var(--ob-space-6)', justifyContent: 'center' }
    : { padding: preenchimento };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-6)',
      borderRadius: 'var(--ob-r-pill)', fontSize: fs, fontWeight: 700,
      lineHeight: 1, ...(pinturas[pintura] || pinturas.soft), ...forma,
    }}>
      {!numerico && dot && <span style={{ width: 6, height: 6, borderRadius: 'var(--ob-r-circle)', background: pintura === 'solid' ? 'color-mix(in srgb, var(--ob-fg-on-color) 70%, transparent)' : t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
};
