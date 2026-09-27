import React from 'react';

export interface PhProps {
  /** Phosphor icon name suffix, e.g. "check" renders the ph-check glyph. */
  n: string;
  /** Tamanho do ícone em px. */
  size?: number;
  /** CSS color value; defaults to currentColor. */
  c?: string;
  /** Estilos inline adicionais aplicados ao ícone. */
  style?: React.CSSProperties;
}

/** Renderiza um glifo Phosphor via webfont, a partir do seu nome. */
export const Ph: React.FC<PhProps> = ({ n, size = 18, c, style }) => (
  <i
    className={`ph ph-${n}`}
    aria-hidden="true"
    style={{
      fontSize: size,
      color: c || 'currentColor',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  />
);
