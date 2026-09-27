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

export const Grande = () => (
  <div style={frame}>
    <Modal open onClose={() => {}} title="Prévia — Métricas de Sessão" size="lg"
      footer={<><Button kind="secondary">Fechar</Button><Button kind="primary">Exportar</Button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--ob-bg-alt)', border: '1px solid var(--ob-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--ob-fg-mute)', marginBottom: 6 }}>Sessões</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ob-fg-strong)' }}>12.847</div>
        </div>
        <div style={{ background: 'var(--ob-bg-alt)', border: '1px solid var(--ob-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--ob-fg-mute)', marginBottom: 6 }}>Conversões</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ob-fg-strong)' }}>483</div>
        </div>
        <div style={{ background: 'var(--ob-bg-alt)', border: '1px solid var(--ob-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--ob-fg-mute)', marginBottom: 6 }}>Churn</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ob-fg-strong)' }}>3,2%</div>
        </div>
      </div>
    </Modal>
  </div>
);
