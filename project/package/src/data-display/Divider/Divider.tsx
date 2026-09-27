import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';
export type DividerEmphasis = 'subtle' | 'default' | 'strong';
export type DividerAlign = 'start' | 'center' | 'end';

const DIVIDER_COLOR: Record<DividerEmphasis, string> = {
  subtle: 'var(--ob-line-soft)',
  default: 'var(--ob-border)',
  strong: 'var(--ob-ink-mute)',
};

export interface DividerProps {
  /** Direção da linha; vertical estica até a altura do container (`align-self: stretch`). */
  orientation?: DividerOrientation;
  /** Rótulo no meio da linha; só na horizontal. */
  label?: React.ReactNode;
  /** Posição do rótulo em relação à linha. */
  align?: DividerAlign;
  /** Traço sólido ou tracejado. */
  variant?: DividerVariant;
  /** Intensidade da cor da linha. */
  emphasis?: DividerEmphasis;
  /** Margem no eixo da linha, em px. */
  spacing?: number;
  /** Estende a linha além do padding do container, em px. */
  bleed?: number;
  /** `aria-hidden` no lugar de `role="separator"`, para linhas puramente visuais. */
  decorative?: boolean;
  /** Estilos inline adicionais. */
  style?: React.CSSProperties;
}

/** Linha de separação entre blocos de conteúdo, com rótulo opcional. */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal', variant = 'solid', emphasis = 'default', label, align = 'center',
  spacing = 0, bleed = 0, decorative = false, style,
}) => {
  const line = `1px ${variant === 'dashed' ? 'dashed' : 'solid'} ${DIVIDER_COLOR[emphasis] ?? DIVIDER_COLOR.default}`;
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'separator' as const, 'aria-orientation': orientation };

  if (orientation === 'vertical') {
    return <div {...a11y} style={{ alignSelf: 'stretch', flex: 'none', width: 0, borderLeft: line, margin: `${-bleed}px ${spacing}px`, ...style }} />;
  }
  if (!label) {
    return <div {...a11y} style={{ height: 0, flex: 'none', borderTop: line, margin: `${spacing}px ${-bleed}px`, ...style }} />;
  }
  const seg = <span style={{ flex: 1, minWidth: 16, borderTop: line }} />;
  return (
    <div {...a11y} style={{
      display: 'flex', alignItems: 'center', gap: 12, flex: 'none', margin: `${spacing}px ${-bleed}px`,
      fontFamily: 'var(--ob-font)', fontSize: 'var(--ob-fs-xs)', lineHeight: 'var(--ob-lh-normal)',
      fontWeight: 'var(--ob-w-medium)', color: 'var(--ob-fg-soft)', ...style,
    }}>
      {align !== 'start' && seg}
      <span style={{ flex: 'none', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {align !== 'end' && seg}
    </div>
  );
};
