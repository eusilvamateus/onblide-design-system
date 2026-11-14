import React from 'react';
import { ScrollArea } from '../data-display/ScrollArea/ScrollArea';

export interface FloatingPanelProps {
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

/** Superfície dos painéis flutuantes (Select, Autocomplete e Popover). Quem posiciona é o `Ancorado` ou o próprio Popover. */
export const FloatingPanel = React.forwardRef<HTMLDivElement, FloatingPanelProps>(({
  maxHeight, padding = 'var(--ob-space-4)', minWidth, style = {}, children,
}, ref) => (
  <div ref={ref} style={{
    position: 'relative', boxSizing: 'border-box',
    background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
    borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
    padding: maxHeight ? 0 : padding, overflow: 'hidden',
    ...(maxHeight ? { display: 'flex', flexDirection: 'column' as const, maxHeight } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...style,
  }}>
    {maxHeight ? <ScrollArea><div style={{ padding }}>{children}</div></ScrollArea> : children}
  </div>
));

FloatingPanel.displayName = 'FloatingPanel';
