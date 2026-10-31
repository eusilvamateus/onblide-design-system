import React from 'react';

export interface FieldAddonProps {
  side: 'start' | 'end';
  focused: boolean;
  error: boolean;
  onFocusChange: (focused: boolean) => void;
  children: React.ReactNode;
}

const RAIO = 'calc(var(--ob-r-control) - 1.5px)';

export const FieldAddon: React.FC<FieldAddonProps> = ({ side, focused, error, onFocusChange, children }) => {
  const texto = typeof children === 'string' || typeof children === 'number';
  const cor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const divisoria = `1.5px solid ${cor}`;
  return (
    <span
      data-ob-addon=""
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
      style={{
        display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none',
        ...(side === 'end' ? { borderLeft: divisoria } : { borderRight: divisoria }),
        ...(texto ? {
          padding: '0 14px', fontSize: 14, color: 'var(--ob-fg-soft)', background: 'var(--ob-bg-alt)', whiteSpace: 'nowrap',
          borderRadius: side === 'end' ? `0 ${RAIO} ${RAIO} 0` : `${RAIO} 0 0 ${RAIO}`,
        } : null),
      }}>
      {children}
    </span>
  );
};

export const focoNoAddon = (alvo: EventTarget | null) => !(alvo instanceof Element && alvo.closest('[data-ob-addon]'));
