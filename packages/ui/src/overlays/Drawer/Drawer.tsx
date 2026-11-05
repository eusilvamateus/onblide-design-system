import React, { useEffect } from 'react';
import { ScrollArea } from '../../data-display/ScrollArea/ScrollArea';
import ReactDOM from 'react-dom';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';

export interface DrawerProps {
  /** Controla se o painel está visível. */
  open: boolean;
  /** Chamado ao clicar no backdrop, no botão de fechar ou pressionar Esc. */
  onClose: () => void;
  /** Título exibido no cabeçalho. */
  title?: React.ReactNode;
  /** Conteúdo do corpo, com rolagem própria. */
  children?: React.ReactNode;
  /** Borda da tela em que o painel desliza. */
  side?: 'left' | 'right';
  /** Largura do painel. */
  width?: number | string;
  /** Conteúdo fixo exibido no rodapé, geralmente botões de ação. */
  footer?: React.ReactNode;
}

/** Painel lateral que desliza sobre o conteúdo, mantendo o contexto da página por trás. */
export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children, side = 'right', width = 400, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const transform = side === 'right'
    ? open ? 'translateX(0)' : 'translateX(100%)'
    : open ? 'translateX(0)' : 'translateX(-100%)';

  return ReactDOM.createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'var(--ob-scrim)',
        backdropFilter: 'blur(2px)', zIndex: 'var(--ob-z-overlay)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transition: 'opacity var(--ob-dur-base) var(--ob-ease)',
      }}/>
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        [side]: 0,
        width, maxWidth: '100%',
        background: 'var(--ob-surface)',
        borderLeft: side === 'right' ? '1px solid var(--ob-border)' : 'none',
        borderRight: side === 'left' ? '1px solid var(--ob-border)' : 'none',
        zIndex: 'var(--ob-z-modal)', display: 'flex', flexDirection: 'column',
        transform, transition: 'transform var(--ob-dur-base) var(--ob-ease)',
      } as React.CSSProperties}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--ob-space-20) var(--ob-space-24)', borderBottom: '1px solid var(--ob-border)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</span>
          <Button kind="neutral" iconOnly size="sm" onClick={onClose} aria-label="Fechar" icon={<Ph n="x" size={18} />} />
        </div>
        <ScrollArea style={{ flex: 1 }}>
          <div style={{ padding: 'var(--ob-space-20) var(--ob-space-24)' }}>{children}</div>
        </ScrollArea>
        {footer && (
          <div style={{
            padding: 'var(--ob-space-16) var(--ob-space-24)', borderTop: '1px solid var(--ob-border)',
            background: 'var(--ob-bg-alt)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--ob-space-10)', flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
