import { Button, Modal } from '@onblide/ui';

const frame = { position: 'relative' as const, height: 420, transform: 'translateZ(0)', overflow: 'hidden' };

export const Confirmacao = () => (
  <div style={frame}>
    <Modal open onClose={() => {}} title="Excluir projeto?" size="sm"
      footer={<><Button kind="secondary">Cancelar</Button><Button kind="danger">Excluir</Button></>}>
      Esta ação não pode ser desfeita. Todas as tarefas do projeto Lançamento 2025 serão removidas.
    </Modal>
  </div>
);

export const Medio = () => (
  <div style={frame}>
    <Modal open onClose={() => {}} title="Convidar membro" size="md"
      footer={<><Button kind="secondary">Cancelar</Button><Button kind="primary">Enviar convite</Button></>}>
      Informe o e-mail da pessoa que você deseja adicionar à equipe.
    </Modal>
  </div>
);
