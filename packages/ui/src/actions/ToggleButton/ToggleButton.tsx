import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';

export type ToggleButtonAppearance = 'outline' | 'ghost';
export type ToggleButtonSize = 'sm' | 'md' | 'lg';
export type ToggleButtonTone = Exclude<ActionTone, 'neutral'>;

const PAD: Record<ToggleButtonSize, [number, number]> = { sm: [7, 12], md: [10, 18], lg: [14, 22] };
const FS: Record<ToggleButtonSize, string> = { sm: 'var(--ob-fs-13)', md: 'var(--ob-fs-14)', lg: 'var(--ob-fs-15)' };
const ICO: Record<ToggleButtonSize, number> = { sm: 14, md: 16, lg: 18 };

export interface ToggleButtonProps {
  /** Estado controlado: ligado ou desligado. */
  pressed?: boolean;
  /** Estado inicial quando não controlado. */
  defaultPressed?: boolean;
  onChange?: (pressed: boolean, value?: string) => void;
  /** `outline` (borda e fundo de superfície) ou `ghost` (sem borda, para barras densas). */
  appearance?: ToggleButtonAppearance;
  size?: ToggleButtonSize;
  /** Cor do estado pressionado: azul (`primary`, padrão), verde, laranja ou vermelho. */
  tone?: ToggleButtonTone;
  /** Nome de um ícone Phosphor. */
  icon?: string;
  /** Ícone alternativo mostrado só quando `pressed`. */
  pressedIcon?: string;
  /** Usa peso `fill` no ícone quando `pressed`. */
  fillWhenPressed?: boolean;
  /** Obrigatório quando o botão não tem `children` (só ícone). */
  ariaLabel?: string;
  /** Usado por `ButtonGroup` para identificar este botão dentro do grupo. */
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  /** @internal aplicado pelo `ButtonGroup` em `selection="single"` (roving tabindex). */
  _role?: 'radio';
  /** @internal idem. */
  _tabIndex?: number;
  /** @internal idem. */
  _btnRef?: (el: HTMLButtonElement | null) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

/** Botão com dois estados (pressionado / não pressionado) que aplica o efeito na hora, com `aria-pressed`. */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  pressed, defaultPressed = false, onChange, appearance = 'outline', size = 'md', tone = 'primary',
  icon, pressedIcon, fillWhenPressed, children, ariaLabel, disabled, value,
  _role, _tabIndex, _btnRef, style, onKeyDown,
}) => {
  const [inner, setInner] = React.useState(defaultPressed);
  const on = pressed ?? inner;
  const [hover, setHover] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const h = !disabled && hover;
  const iconOnly = children == null;

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (pressed === undefined) setInner(next);
    onChange?.(next, value);
  };

  const cor = ACTION_TONES[tone];
  const azul = tone === 'primary';
  let bg: string, fg: string, bc: string;
  if (appearance === 'outline') {
    bg = on ? (azul && h ? 'var(--ob-blue-100)' : cor.bg) : (h ? 'var(--ob-line-soft)' : 'var(--ob-surface)');
    fg = on ? cor.fg : 'var(--ob-fg-strong)';
    bc = on ? cor.fg : 'var(--ob-border)';
  } else {
    bg = on ? (azul ? 'var(--ob-blue-100)' : cor.bg) : (h ? 'var(--ob-line-soft)' : 'transparent');
    fg = on ? (azul ? 'var(--ob-blue-700)' : cor.fg) : 'var(--ob-fg-soft)';
    bc = 'transparent';
  }

  const [py, px] = PAD[size];
  const iname = on && pressedIcon ? pressedIcon : icon;
  const a11y = _role === 'radio' ? { role: 'radio' as const, 'aria-checked': on } : { 'aria-pressed': on };

  return (
    <button
      type="button"
      ref={_btnRef}
      {...a11y}
      aria-label={iconOnly ? ariaLabel : undefined}
      disabled={disabled}
      tabIndex={_tabIndex}
      onClick={toggle}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      style={{
        position: 'relative', zIndex: focused ? 2 : on ? 1 : 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ob-space-8)',
        fontFamily: 'inherit', fontWeight: 'var(--ob-w-semibold)', fontSize: FS[size], lineHeight: `${ICO[size]}px`,
        padding: iconOnly ? py : `${py}px ${px}px`, borderRadius: 'var(--ob-r-control)',
        border: `1.5px solid ${bc}`, background: bg, color: fg,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 'var(--ob-opacity-disabled)' : 1, outline: 'none',
        boxShadow: focused ? '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)' : 'none',
        transition: 'background var(--ob-dur-fast) var(--ob-ease), color var(--ob-dur-fast) var(--ob-ease), border-color var(--ob-dur-fast) var(--ob-ease)',
        ...style,
      }}
    >
      {iname && <Ph n={iname} size={ICO[size]} c="currentColor" weight={on && fillWhenPressed ? 'fill' : undefined} />}
      {children}
    </button>
  );
};
