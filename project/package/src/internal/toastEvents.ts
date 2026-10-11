import type { ToastOptions } from '../feedback/ToastStack/toast';

export interface ToastEntregue extends ToastOptions {
  id: string;
}

export interface PilhaDeToasts {
  nome?: string;
  receber: (toast: ToastEntregue) => void;
  dispensar: (id?: string) => void;
}

const pilhas: PilhaDeToasts[] = [];

export const registrarPilha = (pilha: PilhaDeToasts): (() => void) => {
  pilhas.push(pilha);
  return () => {
    const indice = pilhas.indexOf(pilha);
    if (indice >= 0) pilhas.splice(indice, 1);
  };
};

export const entregarToast = (toast: ToastEntregue): boolean => {
  const alvo = [...pilhas].reverse().find((pilha) => pilha.nome === toast.stack);
  if (!alvo) return false;
  alvo.receber(toast);
  return true;
};

export const dispensarToasts = (id?: string): void => {
  pilhas.forEach((pilha) => pilha.dispensar(id));
};
