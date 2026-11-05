import { Card, Badge } from '@onblide/ui';

export const Borda = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Card elevation="border" padding={20}>
      <Badge tone="primary">Projeto</Badge>
      <h3 style={{ margin: '12px 0 4px' }}>Redesign do portal</h3>
      <p style={{ margin: 0 }}>Entrega prevista para 15 de outubro.</p>
    </Card>
  </div>
);

export const Sombra = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Card elevation="shadow" padding={20}>
      <Badge tone="success">Concluído</Badge>
      <h3 style={{ margin: '12px 0 4px' }}>Campanha de lançamento</h3>
      <p style={{ margin: 0 }}>Todas as etapas foram aprovadas pelo cliente.</p>
    </Card>
  </div>
);

export const FundoQuente = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Card elevation="border" padding={20} style={{ background: 'var(--ob-bg-warm)' }}>
      <Badge tone="warning">Destaque</Badge>
      <h3 style={{ margin: '12px 0 4px' }}>Meta do trimestre</h3>
      <p style={{ margin: 0 }}>Overlay quente sobre a superfície padrão.</p>
    </Card>
  </div>
);
