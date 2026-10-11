import React from 'react';
import { Avatar } from '../Avatar/Avatar';

export interface AvatarGroupProps {
  /** Quantos avatares aparecem; os demais viram um contador como "+3". Sem valor, todos aparecem. */
  max?: number;
  /** Diâmetro de cada avatar em px; sobrepõe o `size` dos avatares filhos. */
  size?: number;
  /** Os `Avatar` do grupo. */
  children?: React.ReactNode;
}

/** Empilha avatares sobrepostos, com contador de excedentes, para mostrar participantes ou responsáveis. */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({ max, size = 32, children }) => {
  const avatares = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ size?: number }>[];
  const visiveis = max !== undefined && max >= 0 ? avatares.slice(0, max) : avatares;
  const restantes = avatares.length - visiveis.length;
  const moldura = (indice: number): React.CSSProperties => ({
    display: 'inline-flex', marginLeft: indice === 0 ? 0 : -Math.round(size * 0.28), borderRadius: '50%',
    boxShadow: '0 0 0 2px var(--ob-surface)',
  });
  return (
    <div role="group" aria-label={`${avatares.length} pessoas`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {visiveis.map((avatar, i) => (
        <span key={avatar.key ?? i} style={moldura(i)}>{React.cloneElement(avatar, { size })}</span>
      ))}
      {restantes > 0 && (
        <span style={moldura(visiveis.length)} title={`mais ${restantes}`}>
          <Avatar initials={`+${restantes}`} size={size} />
        </span>
      )}
    </div>
  );
};
