import { Badge } from '@onblide/ui';

export const Tons = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' }}>
    <Badge tone="blue">Em andamento</Badge>
    <Badge tone="green">Concluído</Badge>
    <Badge tone="orange">Pendente</Badge>
    <Badge tone="red">Atrasado</Badge>
    <Badge tone="grey">Rascunho</Badge>
  </div>
);

export const SemPonto = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' }}>
    <Badge tone="blue" dot={false}>Em andamento</Badge>
    <Badge tone="green" dot={false}>Concluído</Badge>
    <Badge tone="orange" dot={false}>Pendente</Badge>
    <Badge tone="red" dot={false}>Atrasado</Badge>
    <Badge tone="grey" dot={false}>Rascunho</Badge>
  </div>
);

export const Variantes = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap', alignItems: 'center' }}>
    <Badge variant="subtle" tone="blue">Sutil</Badge>
    <Badge variant="solid" tone="green">Sólido</Badge>
    <Badge variant="outline" tone="orange">Contorno</Badge>
    <Badge variant="numeric" tone="red">12</Badge>
  </div>
);

export const ComPontoETamanhos = () => (
  <div style={{ display: 'flex', gap: 10, padding: 16, alignItems: 'center' }}>
    <Badge dot tone="green" size="sm">Online</Badge>
    <Badge dot tone="orange" size="md">Aguardando revisão</Badge>
  </div>
);
