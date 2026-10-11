import React from 'react';

export type FloatingPanelAlign = 'left' | 'right' | 'stretch';

export interface FloatingPanelProps {
  /** Lado ao qual o painel se alinha em relação ao elemento de referência. */
  align?: FloatingPanelAlign;
  /** Altura máxima; acima dela o conteúdo rola. */
  maxHeight?: number | string;
  /** Espaçamento interno do painel. */
  padding?: number | string;
  /** Largura mínima do painel. */
  minWidth?: number | string;
  /** Estilos inline adicionais, mesclados por último. */
  style?: React.CSSProperties;
  /** Conteúdo exibido dentro do painel. */
  children?: React.ReactNode;
}

/** Painel flutuante base usado por Dropdown e outros overlays ancorados a um elemento. */
export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  align = 'stretch', maxHeight, padding = 4, minWidth, style = {}, children,
}) => {
  const pos: React.CSSProperties =
    align === 'right' ? { right: 0 } : align === 'left' ? { left: 0 } : { left: 0, right: 0 };
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)',
      zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
      background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
      padding, overflow: maxHeight ? 'hidden auto' : 'hidden',
      ...pos,
      ...(maxHeight ? { maxHeight } : {}),
      ...(minWidth ? { minWidth } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
};
