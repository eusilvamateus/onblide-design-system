import { Card, Badge } from '@onblide/ui';

export const Borda = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Card elevation="border" padding={20}>
      <Badge tone="blue">Projeto</Badge>
      <h3 style={{ margin: '12px 0 4px' }}>Redesign do portal</h3>
      <p style={{ margin: 0 }}>Entrega prevista para 15 de outubro.</p>
    </Card>
  </div>
);

export const Sombra = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Card elevation="shadow" padding={20}>
      <Badge tone="green">Concluído</Badge>
      <h3 style={{ margin: '12px 0 4px' }}>Campanha de lançamento</h3>
      <p style={{ margin: 0 }}>Todas as etapas foram aprovadas pelo cliente.</p>
    </Card>
  </div>
);
