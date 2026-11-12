import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../actions/Button/Button';
import type { Tone } from '../../internal/tone';

export interface AlertDialogProps {
  /** Controla se o diálogo está visível. */
  open: boolean;
  /** Chamado ao cancelar: botão de cancelar, backdrop ou Esc. */
  onClose?: () => void;
  /** Pergunta ou aviso, em uma frase. */
  title: React.ReactNode;
  /** Explicação das consequências da ação. */
  children?: React.ReactNode;
  /** Texto do botão que confirma a ação. */
  confirmLabel?: string;
  /** Texto do botão que cancela. */
  cancelLabel?: string;
  /** Chamado ao confirmar; fechar o diálogo continua sendo responsabilidade de quem usa. */
  onConfirm?: () => void;
  /** `danger` pinta o botão de confirmar de vermelho, para ações destrutivas. */
  tone?: Extract<Tone, 'primary' | 'danger'>;
  /** Confirmação em andamento: o botão de confirmar mostra o carregamento e ignora novos cliques, o de cancelar fica desabilitado, e Esc e o backdrop deixam de fechar. */
  loading?: boolean;
}

/** Diálogo de confirmação que exige uma decisão: confirmar ou cancelar uma ação, em geral irreversível. */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  open, onClose, title, children, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, tone = 'primary', loading = false,
}) => (
  <Modal open={open} onClose={loading ? undefined : onClose} title={title} size="sm" role="alertdialog" closeButton={false} footer={
    <>
      <Button kind="secondary" autoFocus disabled={loading} onClick={onClose}>{cancelLabel}</Button>
      <Button kind={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
    </>
  }>
    {children}
  </Modal>
);
