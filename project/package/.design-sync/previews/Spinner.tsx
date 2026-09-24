import { Spinner } from '@onblide/ui';

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 20, padding: 24, alignItems: 'center' }}>
    <Spinner size="xs" />
    <Spinner size="sm" />
    <Spinner size="md" />
    <Spinner size="lg" />
    <Spinner size="xl" />
  </div>
);

export const Tons = () => (
  <div style={{ display: 'flex', gap: 20, padding: 24, alignItems: 'center' }}>
    <Spinner size="lg" tone="default" />
    <Spinner size="lg" tone="success" />
    <Spinner size="lg" tone="warning" />
    <Spinner size="lg" tone="danger" />
    <Spinner size="lg" tone="muted" />
  </div>
);

export const ComRotulo = () => (
  <div style={{ padding: 24 }}>
    <Spinner size="md" label="Carregando projetos..." />
  </div>
);
