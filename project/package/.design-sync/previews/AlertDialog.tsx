import { AlertDialog } from '@onblide/ui';

const frame = { position: 'relative' as const, height: 360, transform: 'translateZ(0)', overflow: 'hidden' };

export const Confirmacao = () => (
  <div style={frame}>
    <AlertDialog open onClose={() => {}} onConfirm={() => {}} title="Publicar as alterações?" confirmLabel="Publicar">
      As alterações ficam visíveis para toda a equipe assim que forem publicadas.
    </AlertDialog>
  </div>
);

export const Destrutivo = () => (
  <div style={frame}>
    <AlertDialog open onClose={() => {}} onConfirm={() => {}} tone="danger" title="Excluir projeto?" confirmLabel="Excluir projeto">
      Esta ação não pode ser desfeita. Todas as tarefas do projeto Lançamento 2025 serão removidas.
    </AlertDialog>
  </div>
);
