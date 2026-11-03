import React from 'react';
import { OB_TONES } from '../../internal/obTones';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import type { Tone } from '../../internal/tone';

export type ProgressBarTone = Extract<Tone, 'primary' | 'success' | 'warning' | 'danger'>;

export interface ProgressBarProps {
  /** Progresso atual, de 0 a 100. */
  value?: number;
  /** Tom que define a cor do preenchimento. */
  tone?: ProgressBarTone;
  /** Espessura da barra. */
  size?: 'sm' | 'md' | 'lg';
  /** Exibe uma animação de carregamento em loop, sem valor definido. */
  indeterminate?: boolean;
  /** Exibe o rótulo de porcentagem ao lado da barra. */
  showLabel?: boolean;
  /** Número de etapas discretas; quando definido, renderiza a barra segmentada. */
  segments?: number;
  /** Índice da última etapa concluída no modo segmentado. */
  currentSegment?: number;
}

/** Barra que comunica progresso determinado, indeterminado ou por etapas. */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value = 0, tone = 'primary', size = 'md', indeterminate = false, showLabel = false, segments, currentSegment = 0 }) => {
  const t = OB_TONES[tone === 'primary' ? 'info' : tone] || OB_TONES.info;
  const limitado = Math.min(100, Math.max(0, value));
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
          : <div style={{ width: `${limitado}%`, height: '100%', background: t.fg, borderRadius: 999, transition: 'width 0.4s cubic-bezier(.4,0,.2,1)' }} />}
      </div>
      {showLabel && !indeterminate && <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)', width: 36, textAlign: 'right', flex: 'none' }}>{Math.round(limitado)}%</span>}
    </div>
  );
};

injectStyleOnce(
  'ob-indet-kf',
  '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}',
);
