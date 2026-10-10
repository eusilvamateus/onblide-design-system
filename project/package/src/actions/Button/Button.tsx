import React from 'react';

/** Estilo visual do botão: define a hierarquia da ação (primária, secundária, terciária, suave ou destrutiva). */
export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'cream' | 'danger';
/** Tamanho do botão, que ajusta fonte e espaçamento interno. */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hierarquia visual da ação: use um único `primary` por contexto. */
  kind?: ButtonKind;
  /** Tamanho do botão. */
  size?: ButtonSize;
  /** Ícone exibido antes do conteúdo do botão. */
  icon?: React.ReactNode;
  /** Botão só com ícone: quadrado (32, 40 ou 48px conforme `size`), sem texto; exige `aria-label`. */
  iconOnly?: boolean;
}

/** Botão de ação com variações de estilo, tamanho e suporte a ícone. */
export const Button: React.FC<ButtonProps> = ({
  kind = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  children,
  style = {},
  type = 'button',
  disabled,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
    fontFamily: 'inherit', fontWeight: 600, border: 'none', borderRadius: 'var(--ob-r-control)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all 160ms cubic-bezier(0.2,0.7,0.2,1)',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    padding: size === 'sm' ? '7px 12px' : size === 'lg' ? '14px 22px' : '10px 18px',
  };
  const quadrado = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const soIcone: React.CSSProperties = iconOnly ? { width: quadrado, height: quadrado, padding: 0, gap: 0 } : {};
  const kinds: Record<ButtonKind, React.CSSProperties> = {
    primary:   { background: 'var(--ob-blue)', color: '#fff' },
    secondary: { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', border: '1.5px solid var(--ob-border)' },
    ghost:     { background: 'transparent', color: 'var(--ob-blue)' },
    cream:     { background: 'var(--ob-bg-warm)', color: 'var(--ob-fg-strong)' },
    danger:    { background: 'var(--ob-danger)', color: '#fff' },
  };
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      style={{ ...base, ...kinds[kind], ...soIcone, ...style }}
      onMouseEnter={(e) => {
        if (kind === 'primary' && !disabled) e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,78,228,0.28)';
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; onMouseLeave?.(e); }}
    >
      {icon}{iconOnly ? null : children}
    </button>
  );
};
