import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
  elevation?: 'border' | 'shadow';
}

export const Card: React.FC<CardProps> = ({ children, style = {}, padding = 20, elevation = 'border' }) => {
  const ev: React.CSSProperties = elevation === 'shadow'
    ? { boxShadow: 'var(--ob-shadow-md)' }
    : { border: '1px solid var(--ob-border)' };
  return (
    <div style={{ background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-surface)', padding, ...ev, ...style }}>{children}</div>
  );
};
