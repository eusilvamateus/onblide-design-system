// project/package/src/primitives/Icons/PhIcon.tsx
import React from 'react';

export interface PhIconProps {
  /** Nome do glifo Phosphor sem o prefixo, ex.: "house" renderiza ph-house. */
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

// Helper interno de `Icons` — no original (Primitives.jsx:28-30) não é
// exportado para `window`, então também não é reexportado em src/index.ts.
export const PhIcon: React.FC<PhIconProps> = ({ name, size = 20, style = {} }) => (
  <i className={`ph ph-${name}`} style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true"/>
);
