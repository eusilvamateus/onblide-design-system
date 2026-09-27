import { Divider } from '@onblide/ui';

export const Horizontal = () => (
  <div style={{ padding: 16, width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span>Dados da conta</span>
    <Divider />
    <span>Preferências de notificação</span>
  </div>
);

export const ComRotulo = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Divider label="ou" />
  </div>
);

export const Vertical = () => (
  <div style={{ padding: 16, display: 'flex', height: 40, gap: 12, alignItems: 'center' }}>
    <span>Editar</span>
    <Divider orientation="vertical" />
    <span>Excluir</span>
  </div>
);

export const Tracejado = () => (
  <div style={{ padding: 16, width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span>Item pendente</span>
    <Divider variant="dashed" emphasis="subtle" />
    <span>Próximo item</span>
  </div>
);
