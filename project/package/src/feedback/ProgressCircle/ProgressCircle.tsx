import React from 'react';

export type ProgressCircleSize = 'sm' | 'md' | 'lg' | 'xl';
export type ProgressCircleTone = 'default' | 'success' | 'warning' | 'danger';

export interface ProgressCircleProps {
  /** Progresso atual, de 0 a 100. */
  value?: number;
  /** Diâmetro do círculo. */
  size?: ProgressCircleSize;
  /** Tom que define a cor do arco e do rótulo. */
  tone?: ProgressCircleTone;
  /** Exibe o rótulo centralizado no círculo. */
  showLabel?: boolean;
  /** Conteúdo do rótulo central; substitui a porcentagem padrão. */
  label?: React.ReactNode;
}

const PROGRESS_CIRCLE_SIZES: Record<ProgressCircleSize, number> = { sm: 32, md: 48, lg: 64, xl: 96 };

/** Indicador circular de progresso determinado, com rótulo central configurável. */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({ value = 0, size = 'md', tone = 'default', showLabel = true, label }) => {
  const px = PROGRESS_CIRCLE_SIZES[size] || 48;
  const sw = px <= 32 ? 3.5 : px <= 48 ? 4.5 : px <= 64 ? 5 : 7;
  const r = (px - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  const offset = circ - (v / 100) * circ;
  const color = tone === 'success' ? 'var(--ob-green)'
              : tone === 'warning' ? 'var(--ob-orange)'
              : tone === 'danger'  ? 'var(--ob-danger)'
              : 'var(--ob-blue)';
  const fs = px <= 32 ? 9 : px <= 48 ? 11 : px <= 64 ? 14 : 20;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={px / 2} cy={px / 2} r={r} stroke="var(--ob-bg-alt)" strokeWidth={sw} />
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      {showLabel && (
        <span style={{ position: 'absolute', fontSize: fs, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color, lineHeight: 1 }}>
          {label || `${Math.round(v)}%`}
        </span>
      )}
    </span>
  );
};
