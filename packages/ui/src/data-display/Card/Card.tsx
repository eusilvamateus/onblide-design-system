import React from 'react';

export interface CardProps {
  /** Conteúdo exibido dentro do card. */
  children?: React.ReactNode;
  /** Estilos inline adicionais aplicados ao container, mesclados por cima do padrão. */
  style?: React.CSSProperties;
  /** Espaçamento interno do card. */
  padding?: number | string;
  /** Forma de destaque: borda sutil (`border`) ou sombra (`shadow`). */
  elevation?: 'border' | 'shadow';
}

/** Container de superfície para agrupar conteúdo relacionado. */
export const Card: React.FC<CardProps> = ({ children, style = {}, padding = 'var(--ob-space-20)', elevation = 'border' }) => {
  const ev: React.CSSProperties = elevation === 'shadow'
    ? { boxShadow: 'var(--ob-shadow-md)' }
    : { border: '1px solid var(--ob-border)' };
  return (
    <div style={{ background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-surface)', padding, ...ev, ...style }}>{children}</div>
  );
};
