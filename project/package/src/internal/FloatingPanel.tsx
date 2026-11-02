import React from 'react';
import { ScrollArea } from '../data-display/ScrollArea/ScrollArea';

export type FloatingPanelAlign = 'left' | 'right' | 'stretch';

export type FloatingPanelSide = 'bottom' | 'top';

export interface FloatingPanelProps {
  /** Lado do elemento de referência em que o painel abre. */
  side?: FloatingPanelSide;
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

/** Painel flutuante base dos overlays ancorados a um elemento (Select, Autocomplete e Popover). */
export const FloatingPanel = React.forwardRef<HTMLDivElement, FloatingPanelProps>(({
  side = 'bottom', align = 'stretch', maxHeight, padding = 4, minWidth, style = {}, children,
}, ref) => {
  const pos: React.CSSProperties =
    align === 'right' ? { right: 0 } : align === 'left' ? { left: 0 } : { left: 0, right: 0 };
  return (
    <div ref={ref} style={{
      position: 'absolute', ...(side === 'top' ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
      zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
      background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
      padding: maxHeight ? 0 : padding, overflow: 'hidden',
      ...(maxHeight ? { display: 'flex', flexDirection: 'column' as const } : {}),
      ...pos,
      ...(maxHeight ? { maxHeight } : {}),
      ...(minWidth ? { minWidth } : {}),
      ...style,
    }}>
      {maxHeight ? <ScrollArea><div style={{ padding }}>{children}</div></ScrollArea> : children}
    </div>
  );
});

FloatingPanel.displayName = 'FloatingPanel';
