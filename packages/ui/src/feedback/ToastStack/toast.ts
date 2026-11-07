import type { ReactNode } from 'react';
import type { OBTone } from '../../internal/obTones';
import type { ToastAppearance } from '../Toast/Toast';
import { dispensarToasts, entregarToast } from '../../internal/toastEvents';

export interface ToastOptions {
  /** Cor semântica do toast; o padrão é `info`. */
  tone?: OBTone;
  /** Pintura do toast; sobrepõe a `appearance` do `ToastStack`. */
  appearance?: ToastAppearance;
  /** Mensagem principal, curta e no passado: "Projeto salvo". */
  title: ReactNode;
  /** Detalhe opcional, em até duas linhas. */
  body?: ReactNode;
  /** Rótulo da ação exibida no toast, como "Desfazer". */
  action?: ReactNode;
  /** Chamado ao clicar na ação. */
  onAction?: () => void;
  /** Exibe o ícone do tom; `false` o remove. */
  icon?: boolean;
  /** Tempo em ms até o toast sumir sozinho; `0` o mantém até o usuário fechar. Sobrepõe a `duration` do `ToastStack`. */
  duration?: number;
  /** Nome do `ToastStack` que recebe o toast. Sem nome, o toast vai para o `ToastStack` sem `name`. */
  stack?: string;
}

export type ToastShortcutOptions = Omit<ToastOptions, 'title' | 'tone'>;

let contador = 0;

const mostrar = (opcoes: ToastOptions): string => {
  const id = `ob-toast-${++contador}`;
  entregarToast({ ...opcoes, id });
  return id;
};

const atalho = (tone: OBTone) => (title: ReactNode, opcoes?: ToastShortcutOptions): string => mostrar({ ...opcoes, title, tone });

const dispensar = (id?: string): void => dispensarToasts(id);

/**
 * Dispara um toast na fila do `ToastStack` montado na raiz do app (o último sem `name`, ou o de `name` igual a `stack`) e devolve o id dele. Os atalhos `toast.success`,
 * `toast.info`, `toast.warning` e `toast.danger` já definem o tom; `toast.dismiss(id)` fecha um toast, ou todos sem id.
 */
export const toast = Object.assign(mostrar, {
  success: atalho('success'),
  info: atalho('info'),
  warning: atalho('warning'),
  danger: atalho('danger'),
  dismiss: dispensar,
});
