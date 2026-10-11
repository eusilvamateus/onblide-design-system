import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../actions/Button/Button';

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
  tone?: 'default' | 'danger';
}

/** Diálogo de confirmação que exige uma decisão: confirmar ou cancelar uma ação, em geral irreversível. */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  open, onClose, title, children, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, tone = 'default',
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm" role="alertdialog" closeButton={false} footer={
    <>
      <Button kind="secondary" autoFocus onClick={onClose}>{cancelLabel}</Button>
      <Button kind={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
    </>
  }>
    {children}
  </Modal>
);
