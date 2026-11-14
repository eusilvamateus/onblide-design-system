import { AlertDialog } from '@onblide/ui';

export const Confirmacao = () => (
  <AlertDialog open onClose={() => {}} onConfirm={() => {}} title="Publicar as alterações?" confirmLabel="Publicar">
    As alterações ficam visíveis para toda a equipe assim que forem publicadas.
  </AlertDialog>
);

export const Destrutivo = () => (
  <AlertDialog open onClose={() => {}} onConfirm={() => {}} tone="danger" title="Excluir projeto?" confirmLabel="Excluir projeto">
    Esta ação não pode ser desfeita. Todas as tarefas do projeto Lançamento 2025 serão removidas.
  </AlertDialog>
);

export const Carregando = () => (
  <AlertDialog open loading onClose={() => {}} onConfirm={() => {}} tone="danger" title="Excluir projeto?" confirmLabel="Excluir projeto">
    Esta ação não pode ser desfeita. Todas as tarefas do projeto Lançamento 2025 serão removidas.
  </AlertDialog>
);
