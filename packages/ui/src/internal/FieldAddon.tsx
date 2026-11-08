import React from 'react';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from './tamanhoDeCampo';

export interface FieldAddonProps {
  side: 'start' | 'end';
  focused: boolean;
  error: boolean;
  size?: TamanhoDeCampo;
  onFocusChange: (focused: boolean) => void;
  children: React.ReactNode;
}

const RAIO = 'calc(var(--ob-r-control) - 1.5px)';

export const FieldAddon: React.FC<FieldAddonProps> = ({ side, focused, error, size = 'md', onFocusChange, children }) => {
  const escala = ESCALA_DE_CAMPO[size];
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
          padding: `0 ${escala.recuo}`, fontSize: escala.fonte, color: 'var(--ob-fg-soft)', background: 'var(--ob-bg-alt)', whiteSpace: 'nowrap',
          borderRadius: side === 'end' ? `0 ${RAIO} ${RAIO} 0` : `${RAIO} 0 0 ${RAIO}`,
        } : null),
      }}>
      {children}
    </span>
  );
};

export const focoNoAddon = (alvo: EventTarget | null) => !(alvo instanceof Element && alvo.closest('[data-ob-addon]'));
