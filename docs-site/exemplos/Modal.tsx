import { Button, Modal } from '@onblide/ui';

export const Medio = () => (
  <Modal open onClose={() => {}} title="Convidar membro" size="md"
    footer={<><Button kind="secondary">Cancelar</Button><Button kind="primary">Enviar convite</Button></>}>
    Informe o e-mail da pessoa que você deseja adicionar à equipe.
  </Modal>
);

export const Grande = () => (
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
);
