import { Badge } from '@onblide/ui';

export const Tons = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' }}>
    <Badge tone="primary">Em andamento</Badge>
    <Badge tone="success">Concluído</Badge>
    <Badge tone="warning">Pendente</Badge>
    <Badge tone="danger">Atrasado</Badge>
    <Badge tone="neutral">Rascunho</Badge>
  </div>
);

export const SemPonto = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' }}>
    <Badge tone="primary" dot={false}>Em andamento</Badge>
    <Badge tone="success" dot={false}>Concluído</Badge>
    <Badge tone="warning" dot={false}>Pendente</Badge>
    <Badge tone="danger" dot={false}>Atrasado</Badge>
    <Badge tone="neutral" dot={false}>Rascunho</Badge>
  </div>
);

export const ComIcone = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap', alignItems: 'center' }}>
    <Badge tone="success" icon="check-circle">Elegível</Badge>
    <Badge tone="warning" icon="warning">Abaixo da meta</Badge>
    <Badge tone="primary" icon="clock" size="sm">Programado</Badge>
    <Badge tone="danger" appearance="solid" icon="x-circle">Recusado</Badge>
    <Badge tone="neutral" appearance="outline" icon="lock-simple">Bloqueado</Badge>
  </div>
);

export const Aparencias = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap', alignItems: 'center' }}>
    <Badge appearance="soft" tone="primary">Suave</Badge>
    <Badge appearance="solid" tone="success">Sólido</Badge>
    <Badge appearance="outline" tone="warning">Contorno</Badge>
    <Badge appearance="ghost" tone="primary">Sem fundo</Badge>
    <Badge variant="numeric" tone="danger">12</Badge>
  </div>
);

export const SemFundo = () => (
  <div style={{ display: 'flex', gap: 16, padding: 16, flexWrap: 'wrap', alignItems: 'center' }}>
    <Badge appearance="ghost" tone="success">Elegível</Badge>
    <Badge appearance="ghost" tone="warning" icon="warning">Abaixo da meta</Badge>
    <Badge appearance="ghost" tone="danger">Recusado</Badge>
    <Badge appearance="ghost" tone="neutral">Rascunho</Badge>
  </div>
);

export const ComPontoETamanhos = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, alignItems: 'center' }}>
    <Badge dot tone="success" size="sm">Online</Badge>
    <Badge dot tone="warning" size="md">Aguardando revisão</Badge>
  </div>
);
