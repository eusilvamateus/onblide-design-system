import React from 'react';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type FieldShellSize = TamanhoDeCampo;

export interface FieldShellProps {
  /** Indica se o campo está em foco, destacando a borda e exibindo o anel de foco. */
  focused?: boolean;
  /** Marca o campo com o estado de erro, trocando a cor da borda e do anel de foco. */
  error?: boolean;
  /** Desabilita visualmente o campo, escurecendo o fundo e reduzindo a opacidade. */
  disabled?: boolean;
  /** Tamanho do campo, que define a altura mínima e o recuo lateral padrão. */
  size?: FieldShellSize;
  /** Altura mínima do invólucro do campo; sem ela, vale a altura do `size`. */
  minHeight?: number | string;
  /** Espaçamento interno do invólucro do campo; sem ele, vale o recuo lateral do `size`. */
  padding?: string;
  /** Handler de clique disparado ao clicar no invólucro do campo. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Estilos inline adicionais aplicados por cima dos estilos padrão do invólucro. */
  style?: React.CSSProperties;
  /** Conteúdo interno do campo, como o input, ícones ou ações. */
  children?: React.ReactNode;
}

/** Invólucro visual reutilizável para campos de formulário, cuidando de borda, foco, erro e estado desabilitado. */
export const FieldShell: React.FC<FieldShellProps> = ({
  focused = false, error = false, disabled = false, size = 'md', minHeight, padding,
  onClick, style = {}, children,
}) => {
  const escala = ESCALA_DE_CAMPO[size];
  const borderColor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const ring = !focused ? 'none'
    : error ? '0 0 0 var(--ob-focus-ring-width) color-mix(in srgb, var(--ob-danger) 22%, transparent)'
            : '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--ob-space-10)',
      minHeight: minHeight ?? escala.altura, padding: padding ?? `0 ${escala.recuo}`,
      background: disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--ob-r-control)',
      boxShadow: ring,
      transition: 'border-color var(--ob-dur-fast) var(--ob-ease), box-shadow var(--ob-dur-fast) var(--ob-ease)',
      opacity: disabled ? 'var(--ob-opacity-disabled)' : 1,
      boxSizing: 'border-box',
      fontSize: escala.fonte,
      ...style,
    }}>
      {children}
    </div>
  );
};
