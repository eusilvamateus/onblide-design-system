import React from 'react';
import { OB_TONES, OBTone } from '../obTones';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface ProgressBarProps {
  value?: number;
  tone?: OBTone;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  showLabel?: boolean;
  segments?: number;
  currentSegment?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value = 0, tone = 'info', size = 'md', indeterminate = false, showLabel = false, segments, currentSegment = 0 }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;
  if (segments) return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      {Array.from({ length: segments }).map((_, i) => <div key={i} style={{ flex: 1, height: h, borderRadius: 999, background: i < currentSegment ? t.fg : 'var(--ob-border)' }} />)}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <div style={{ flex: 1, height: h, background: 'var(--ob-bg-warm)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        {indeterminate
          ? <div style={{ position: 'absolute', height: '100%', background: t.fg, borderRadius: 999, animation: 'ob-indet 1.4s ease-in-out infinite' }} />
          : <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', background: t.fg, borderRadius: 999, transition: 'width 0.4s cubic-bezier(.4,0,.2,1)' }} />}
      </div>
      {showLabel && !indeterminate && <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)', width: 36, textAlign: 'right', flex: 'none' }}>{Math.round(value)}%</span>}
    </div>
  );
};

// injeta a keyframe do modo indeterminado uma única vez
injectStyleOnce(
  'ob-indet-kf',
  '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}',
);
