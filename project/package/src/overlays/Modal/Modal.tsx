import React, { useEffect, useId } from 'react';
import { Icons } from '../../iconography/Icons/Icons';
import { Button } from '../../actions/Button/Button';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

const MODAL_WIDTHS: Record<ModalSize, number | string> = { sm: 360, md: 440, lg: 720, full: '92vw' };

export interface ModalProps {
  /** Controla se o modal está visível. */
  open: boolean;
  /** Chamado ao clicar no backdrop, no botão de fechar ou pressionar Esc. */
  onClose?: () => void;
  /** Título exibido no cabeçalho. */
  title?: React.ReactNode;
  /** Conteúdo do corpo do modal. */
  children?: React.ReactNode;
  /** Conteúdo exibido no rodapé, geralmente botões de ação. */
  footer?: React.ReactNode;
  /** Largura explícita, que sobrepõe a derivada de `size`. */
  width?: number | string;
  /** Tamanho predefinido do modal. */
  size?: ModalSize;
  /** `alertdialog` marca o modal como uma decisão que exige resposta e liga o texto do corpo à descrição acessível. */
  role?: 'dialog' | 'alertdialog';
  /** Exibe o botão de fechar no cabeçalho. */
  closeButton?: boolean;
  /** Altura máxima do painel. Por padrão o painel nunca passa da janela; o corpo rola e o cabeçalho e o rodapé ficam fixos. */
  maxHeight?: number | string;
  /** `none` remove as animações internas de fade e pop, para o consumidor animar por fora. */
  motion?: 'default' | 'none';
  /** Referência da camada de fundo (backdrop). */
  backdropRef?: React.Ref<HTMLDivElement>;
  /** Referência do painel do modal. */
  contentRef?: React.Ref<HTMLDivElement>;
}

/** Diálogo que interrompe o fluxo, com backdrop escurecido, para uma decisão ou foco. */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, width, size = 'md', role = 'dialog', closeButton = true, maxHeight, motion = 'default', backdropRef, contentRef }) => {
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  const titleId = useId();
  const bodyId = useId();
  const animado = motion !== 'none';
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={backdropRef} data-ob-modal-motion={animado ? '' : undefined} onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 'var(--ob-z-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ob-scrim)', backdropFilter: 'blur(2px)', padding: 24,
      animation: animado ? 'ob-fade 160ms ease-out' : undefined,
    }}>
      <div ref={contentRef} data-ob-modal-motion={animado ? '' : undefined} onClick={(e) => e.stopPropagation()} role={role} aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-describedby={role === 'alertdialog' ? bodyId : undefined} style={{
        width: resolvedWidth, maxWidth: '100%', maxHeight: maxHeight ?? '100%', display: 'flex', flexDirection: 'column', background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-overlay)',
        boxShadow: 'var(--ob-shadow-lg)', overflow: 'hidden', animation: animado ? 'ob-pop 200ms var(--ob-ease-spring)' : undefined,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 24px 0', flex: 'none' }}>
          <h3 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</h3>
          {closeButton && <Button kind="neutral" iconOnly size="sm" onClick={onClose} aria-label="Fechar" icon={<Icons.x size={18} />} style={{ flex: 'none', margin: '-4px -8px 0 0' }} />}
        </div>
        <div id={bodyId} style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '12px 24px 20px', fontSize: 14, lineHeight: 1.6, color: 'var(--ob-fg)' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flex: 'none', padding: '16px 24px', borderTop: '1px solid var(--ob-border)', background: 'var(--ob-bg-alt)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
};

injectStyleOnce(
  'ob-modal-kf',
  '@keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes ob-pop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } } @media (prefers-reduced-motion: reduce) { [data-ob-modal-motion] { animation: none !important; } }',
);
