import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { BADGE_TONES, BadgeTone } from '../../internal/badgeTones';
import type { Appearance } from '../../internal/appearance';

export type BadgeVariant = 'label' | 'numeric';
export type BadgeAppearance = Extract<Appearance, 'soft' | 'solid' | 'outline' | 'ghost'>;
/** Tamanho do badge, que ajusta texto, ícone e espaçamento interno. */
export type BadgeSize = 'sm' | 'md' | 'lg';

interface EscalaDoBadge { fonte: number; recuo: string; icone: number; ponto: number; contador: number; recuoDoContador: string }

const ESCALA_DO_BADGE: Record<BadgeSize, EscalaDoBadge> = {
  sm: { fonte: 11, recuo: 'var(--ob-space-2) var(--ob-space-8)', icone: 12, ponto: 6, contador: 18, recuoDoContador: 'var(--ob-space-6)' },
  md: { fonte: 12, recuo: 'var(--ob-space-4) var(--ob-space-10)', icone: 14, ponto: 6, contador: 18, recuoDoContador: 'var(--ob-space-6)' },
  lg: { fonte: 13, recuo: 'var(--ob-space-6) var(--ob-space-12)', icone: 16, ponto: 8, contador: 22, recuoDoContador: 'var(--ob-space-8)' },
};

export interface BadgeProps {
  /** Cor semântica do badge. */
  tone?: BadgeTone;
  /** Forma do badge: `label` é a pílula de rótulo; `numeric` é o contador compacto, sem ponto. */
  variant?: BadgeVariant;
  /** Pintura do badge: `soft` (fundo clarinho, sem borda), `solid` (cheio na cor forte), `outline` (com borda, sem fundo) ou `ghost` (só texto e ponto ou ícone, sem fundo, borda nem preenchimento). Padrão: `soft` em `label` e `solid` em `numeric`. */
  appearance?: BadgeAppearance;
  /** Exibe um ponto colorido antes do conteúdo (ignorado com `icon` e na variante `numeric`). */
  dot?: boolean;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido no lugar do ponto (ignorado na variante `numeric`). */
  icon?: string;
  /** Tamanho do texto e do espaçamento interno. */
  size?: BadgeSize;
  /** Conteúdo do badge, geralmente um rótulo curto ou número. */
  children?: React.ReactNode;
}

/** Rótulo curto e colorido para status, categorias ou contagens. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'primary', variant = 'label', appearance, dot = true, icon, size = 'md', children }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.primary;
  const numerico = variant === 'numeric';
  const pintura: BadgeAppearance = appearance ?? (numerico ? 'solid' : 'soft');
  const escala = ESCALA_DO_BADGE[size];
  const preenchimento = pintura === 'ghost' ? 0 : escala.recuo;

  const pinturas: Record<BadgeAppearance, React.CSSProperties> = {
    soft:    { background: t.bg, color: t.fg, border: 'none' },
    solid:   { background: t.solid, color: 'var(--ob-fg-on-color)', border: 'none' },
    outline: { background: 'transparent', color: t.fg, border: `1.5px solid ${t.border}` },
    ghost:   { background: 'transparent', color: t.fg, border: 'none' },
  };
  const forma: React.CSSProperties = numerico
    ? { minWidth: escala.contador, height: escala.contador, padding: `0 ${escala.recuoDoContador}`, justifyContent: 'center' }
    : { padding: preenchimento };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-6)',
      borderRadius: 'var(--ob-r-pill)', fontSize: escala.fonte, fontWeight: 700,
      lineHeight: 1, ...(pinturas[pintura] || pinturas.soft), ...forma,
    }}>
      {!numerico && icon && <Ph n={icon} size={escala.icone} weight="bold" />}
      {!numerico && !icon && dot && <span style={{ width: escala.ponto, height: escala.ponto, borderRadius: 'var(--ob-r-circle)', background: pintura === 'solid' ? 'color-mix(in srgb, var(--ob-fg-on-color) 70%, transparent)' : t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
};
