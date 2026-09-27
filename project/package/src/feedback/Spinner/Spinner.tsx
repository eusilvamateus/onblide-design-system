import React from 'react';
import { injectSpinKeyframes } from '../../internal/keyframes';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerTone = 'default' | 'success' | 'warning' | 'danger' | 'muted';

export interface SpinnerProps {
  /** Diâmetro do spinner. */
  size?: SpinnerSize;
  /** Tom que define a cor do arco. */
  tone?: SpinnerTone;
  /** Texto acessível (`aria-label`) descrevendo o que está carregando. */
  label?: string;
}

const SPINNER_SIZES: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 24, lg: 40, xl: 56 };

/** Indicador circular de carregamento indeterminado. */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', tone = 'default', label }) => {
  const px = SPINNER_SIZES[size] || 24;
  const sw = px <= 16 ? 2 : px <= 24 ? 2.5 : 3.5;
  const r = (px - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = tone === 'success' ? 'var(--ob-green)'
              : tone === 'warning' ? 'var(--ob-orange)'
              : tone === 'danger'  ? 'var(--ob-danger)'
              : tone === 'muted'   ? 'var(--ob-fg-mute)'
              : 'var(--ob-blue)';
  return (
    <span role="status" aria-label={label || 'Carregando…'} aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none"
        style={{ animation: 'ob-spin 0.75s linear infinite' }}>
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeOpacity={0.15} strokeWidth={sw} />
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${circ * 0.72} ${circ * 0.28}`}
          transform={`rotate(-90 ${px / 2} ${px / 2})`} />
      </svg>
    </span>
  );
};

injectSpinKeyframes();
