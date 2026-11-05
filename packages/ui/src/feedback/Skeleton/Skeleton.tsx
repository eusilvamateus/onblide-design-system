import React from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface SkeletonProps {
  /** Largura do placeholder. */
  width?: number | string;
  /** Altura do placeholder. */
  height?: number | string;
  /** Raio das bordas. */
  radius?: number | string;
  /** Renderiza como círculo (útil para avatares), ignorando `width`. */
  circle?: boolean;
  /** Estilos inline adicionais, mesclados por último. */
  style?: React.CSSProperties;
}

/** Placeholder animado com shimmer, exibido durante o carregamento de conteúdo. */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, radius = 'var(--ob-r-xs)', circle = false, style = {} }) => (
  <span style={{
    display: 'block',
    width: circle ? height : width,
    height,
    borderRadius: circle ? 'var(--ob-r-circle)' : radius,
    background: 'linear-gradient(90deg, var(--ob-bg-alt) 25%, var(--ob-border) 50%, var(--ob-bg-alt) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ob-shimmer var(--ob-dur-loop) var(--ob-ease-in-out) infinite',
    ...style,
  }} />
);

injectStyleOnce(
  'ob-skeleton-kf',
  '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }',
);
