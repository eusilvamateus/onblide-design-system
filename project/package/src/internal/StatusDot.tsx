import React from 'react';
import { BADGE_TONES, BadgeTone } from './badgeTones';

export interface StatusDotProps {
  /** Tom que define a cor do ponto, compartilhado com o Badge. */
  tone?: BadgeTone;
}

/** Indicador decorativo compacto que reforça, ao lado de um rótulo, um estado já escrito. */
export const StatusDot: React.FC<StatusDotProps> = ({ tone = 'primary' }) => {
  const color = (BADGE_TONES[tone] || BADGE_TONES.primary).dot;
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>;
};
