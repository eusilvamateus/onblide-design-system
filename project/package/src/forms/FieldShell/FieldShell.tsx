import React from 'react';

export interface FieldShellProps {
  /** Indica se o campo está em foco, destacando a borda e exibindo o anel de foco. */
  focused?: boolean;
  /** Marca o campo com o estado de erro, trocando a cor da borda e do anel de foco. */
  error?: boolean;
  /** Desabilita visualmente o campo, escurecendo o fundo e reduzindo a opacidade. */
  disabled?: boolean;
  /** Altura mínima do invólucro do campo. */
  minHeight?: number | string;
  /** Espaçamento interno do invólucro do campo. */
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
  focused = false, error = false, disabled = false, minHeight = 44, padding = '0 14px',
  onClick, style = {}, children,
}) => {
  const borderColor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const ring = !focused ? 'none'
    : error ? '0 0 0 4px color-mix(in srgb, var(--ob-danger) 22%, transparent)'
            : '0 0 0 4px var(--ob-focus-ring)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      minHeight, padding,
      background: disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--ob-r-control)',
      boxShadow: ring,
      transition: 'border-color .15s, box-shadow .15s',
      opacity: disabled ? 0.6 : 1,
      boxSizing: 'border-box',
      ...style,
    }}>
      {children}
    </div>
  );
};
