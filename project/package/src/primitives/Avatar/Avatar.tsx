import React from 'react';

export interface AvatarProps {
  name?: string;
  size?: number;
  color?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'OB', size = 32, color = 'var(--ob-blue)' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: color,
    color: '#fff', fontSize: size * 0.4, fontWeight: 700, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flex: 'none',
  }}>{name.slice(0, 2).toUpperCase()}</div>
);
