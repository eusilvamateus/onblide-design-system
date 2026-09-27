import React from 'react';
import { BADGE_TONES, BadgeTone } from '../../internal/badgeTones';

export type BadgeVariant = 'subtle' | 'solid' | 'outline' | 'numeric';

export interface BadgeProps {
  /** Cor semântica do badge. */
  tone?: BadgeTone;
  /** Estilo visual do badge. */
  variant?: BadgeVariant;
  /** Exibe um ponto colorido antes do conteúdo (ignorado na variante `numeric`). */
  dot?: boolean;
  /** Tamanho do texto e do espaçamento interno. */
  size?: 'sm' | 'md';
  /** Conteúdo do badge, geralmente um rótulo curto ou número. */
  children?: React.ReactNode;
}

/** Rótulo curto e colorido para status, categorias ou contagens. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'blue', variant = 'subtle', dot = true, size = 'md', children }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.blue;
  const fs = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? '2px 8px' : '4px 10px';

  const styles: Record<BadgeVariant, React.CSSProperties> = {
    subtle:  { background: t.bg, color: t.fg, border: 'none' },
    solid:   { background: t.solid, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: t.fg, border: `1.5px solid ${t.border}` },
    numeric: { background: t.solid, color: '#fff', border: 'none', minWidth: 18, height: 18, padding: '0 5px', justifyContent: 'center' },
  };
  const s = styles[variant] || styles.subtle;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: variant === 'numeric' ? s.padding : px,
      borderRadius: 999, fontSize: fs, fontWeight: 700,
      lineHeight: 1, ...s,
    }}>
      {variant !== 'numeric' && dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: variant === 'solid' ? 'rgba(255,255,255,0.7)' : t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
};
