import React from 'react';

export interface PhProps {
  /** Phosphor icon name suffix, e.g. "check" renders the ph-check glyph. */
  n: string;
  size?: number;
  /** CSS color value; defaults to currentColor. */
  c?: string;
  style?: React.CSSProperties;
}

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
