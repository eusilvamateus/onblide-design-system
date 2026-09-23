import React from 'react';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, radius = 6, circle = false, style = {} }) => (
  <span style={{
    display: 'block',
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : radius,
    background: 'linear-gradient(90deg, var(--ob-bg-alt) 25%, var(--ob-border) 50%, var(--ob-bg-alt) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ob-shimmer 1.4s ease-in-out infinite',
    ...style,
  }} />
);

// injeta a keyframe do shimmer uma única vez
if (typeof document !== 'undefined' && !document.getElementById('ob-skeleton-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-skeleton-kf';
  st.textContent = '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(st);
}
