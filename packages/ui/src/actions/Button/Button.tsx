import React from 'react';
import { Badge } from '../../data-display/Badge/Badge';
import type { BadgeTone } from '../../internal/badgeTones';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';

const ANEL_DE_FOCO = '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)';

/** Estilo visual do botão: define a hierarquia da ação (primária, secundária, terciária, suave, destrutiva, neutra ou silenciosa). */
export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'cream' | 'danger' | 'neutral' | 'quiet';
/** Cor que a ação ganha ao receber o mouse ou o foco no estilo `quiet`. */
export type ButtonTone = ActionTone;

const TOM_DO_CONTADOR: Partial<Record<ButtonKind, BadgeTone>> = { danger: 'primary' };
/** Tamanho do botão, que ajusta fonte e espaçamento interno. */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hierarquia visual da ação: use um único `primary` por contexto. */
  kind?: ButtonKind;
  /** Tamanho do botão. */
  size?: ButtonSize;
  /** Cor da ação no estilo `quiet`: em repouso o botão é neutro, sem borda nem fundo, e no hover, no foco e quando `pressed` o ícone e o texto assumem esta cor, com um fundo leve do mesmo tom. Ignorado nos outros estilos. */
  tone?: ButtonTone;
  /** Fundo leve do tom no hover, no foco e quando `pressed`, no estilo `quiet`. Com `false` o fundo some e só a cor do ícone e do texto muda; o anel de foco do teclado continua. Ignorado nos outros estilos. */
  fill?: boolean;
  /** Ícone exibido antes do conteúdo do botão. */
  icon?: React.ReactNode;
  /** Botão só com ícone: quadrado (32, 40 ou 48px conforme `size`), sem texto; exige `aria-label`. */
  iconOnly?: boolean;
  /** Estado pressionado (ex.: painel aberto): marca `aria-pressed` e, no estilo `neutral`, destaca o fundo. */
  pressed?: boolean;
  /** Contador exibido como badge numérico: no canto do botão só com ícone e em linha, depois do rótulo, nos demais. */
  count?: number;
  /** Tom do contador, entre os tons do `Badge`. Sem ele, o contador é vermelho, e azul no estilo `danger`, onde o vermelho se perderia no fundo. */
  countTone?: BadgeTone;
}

/** Botão de ação com variações de estilo, tamanho e suporte a ícone. */
export const Button: React.FC<ButtonProps> = ({
  kind = 'primary',
  size = 'md',
  tone = 'neutral',
  fill = true,
  icon,
  iconOnly = false,
  pressed,
  count,
  countTone,
  children,
  style = {},
  type = 'button',
  disabled,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}) => {
  const base: React.CSSProperties = {
    position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-8)', justifyContent: 'center',
    fontFamily: 'inherit', fontWeight: 'var(--ob-w-semibold)', border: 'none', borderRadius: 'var(--ob-r-control)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 'var(--ob-opacity-disabled)' : 1, transition: 'all var(--ob-dur-fast) var(--ob-ease)',
    fontSize: size === 'sm' ? 'var(--ob-fs-13)' : size === 'lg' ? 'var(--ob-fs-15)' : 'var(--ob-fs-14)',
    padding: size === 'sm' ? '0 var(--ob-space-12)' : size === 'lg' ? '0 var(--ob-space-24)' : '0 var(--ob-space-20)',
  };
  const tom = ACTION_TONES[tone];
  const tomDoContador = countTone ?? TOM_DO_CONTADOR[kind] ?? 'danger';
  const quadrado = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const alturaMinima: React.CSSProperties = { minHeight: quadrado };
  const soIcone: React.CSSProperties = iconOnly ? { width: quadrado, height: quadrado, padding: 0, gap: 0 } : {};
  const kinds: Record<ButtonKind, React.CSSProperties> = {
    primary:   { background: 'var(--ob-blue)', color: 'var(--ob-fg-on-color)' },
    secondary: { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', border: '1.5px solid var(--ob-border)' },
    ghost:     { background: 'transparent', color: 'var(--ob-blue)' },
    cream:     { background: 'var(--ob-bg-warm)', color: 'var(--ob-fg-strong)' },
    danger:    { background: 'var(--ob-danger)', color: 'var(--ob-fg-on-color)' },
    neutral:   { background: pressed ? 'var(--ob-surface-2)' : 'transparent', color: 'var(--ob-fg)' },
    quiet:     { background: pressed && fill ? tom.bg : 'transparent', color: pressed ? tom.fg : 'var(--ob-fg-soft)' },
  };
  const destacar = (el: HTMLButtonElement, ativo: boolean) => {
    if (kind !== 'quiet') return;
    const on = ativo || !!pressed;
    el.style.color = on ? tom.fg : 'var(--ob-fg-soft)';
    el.style.background = on && fill ? tom.bg : 'transparent';
  };
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-pressed={pressed}
      style={{ ...base, ...alturaMinima, ...kinds[kind], ...soIcone, ...style }}
      onMouseEnter={(e) => {
        if (kind === 'primary' && !disabled) e.currentTarget.style.boxShadow = 'var(--ob-shadow-pop)';
        if (kind === 'neutral' && !disabled) { e.currentTarget.style.background = 'var(--ob-surface-2)'; e.currentTarget.style.color = 'var(--ob-fg-strong)'; }
        if (!disabled) destacar(e.currentTarget, true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = e.currentTarget.matches(':focus-visible') ? ANEL_DE_FOCO : 'none';
        if (kind === 'neutral') { e.currentTarget.style.background = pressed ? 'var(--ob-surface-2)' : 'transparent'; e.currentTarget.style.color = 'var(--ob-fg)'; }
        destacar(e.currentTarget, e.currentTarget.matches(':focus-visible'));
        onMouseLeave?.(e);
      }}
      onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) { e.currentTarget.style.boxShadow = ANEL_DE_FOCO; destacar(e.currentTarget, true); } onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; destacar(e.currentTarget, false); onBlur?.(e); }}
    >
      {icon}{iconOnly ? null : children}
      {count ? (iconOnly
        ? <span style={{ position: 'absolute', top: 2, right: 0 }}><Badge tone={tomDoContador} variant="numeric" size="sm">{count}</Badge></span>
        : <Badge tone={tomDoContador} variant="numeric" size="sm">{count}</Badge>) : null}
    </button>
  );
};
