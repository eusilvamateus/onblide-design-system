import React from 'react';
import { BADGE_TONES, BadgeTone } from '../../internal/badgeTones';

export interface StatusDotProps {
  tone?: BadgeTone;
}

// Decorativo; sempre usar junto de um rótulo visível.
export const StatusDot: React.FC<StatusDotProps> = ({ tone = 'blue' }) => {
  const color = (BADGE_TONES[tone] || BADGE_TONES.blue).dot;
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>;
};
