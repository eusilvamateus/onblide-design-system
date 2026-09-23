import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerTone = 'default' | 'success' | 'warning' | 'danger' | 'muted';

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
}

const SPINNER_SIZES: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 24, lg: 40, xl: 56 };

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

// injeta as keyframes ob-spin (usada aqui) e ob-pulse (não usada por
// Spinner nem ProgressCircle, mas presente no bloco original — mantida
// para paridade exata com Primitives.jsx:847-852)
if (typeof document !== 'undefined' && !document.getElementById('ob-prim-kf')) {
  const st = document.createElement('style'); st.id = 'ob-prim-kf';
  st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(st);
}
