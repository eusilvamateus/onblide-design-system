import React from 'react';

export interface FieldShellProps {
  focused?: boolean;
  error?: boolean;
  disabled?: boolean;
  minHeight?: number | string;
  padding?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

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
