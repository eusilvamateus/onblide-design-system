import { ProgressBar } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 16, padding: 16, maxWidth: 420 };

export const Tons = () => (
  <div style={col}>
    <ProgressBar value={40} tone="info" showLabel />
    <ProgressBar value={75} tone="success" showLabel />
    <ProgressBar value={60} tone="warning" showLabel />
    <ProgressBar value={90} tone="danger" showLabel />
  </div>
);

export const Tamanhos = () => (
  <div style={col}>
    <ProgressBar value={50} size="sm" />
    <ProgressBar value={50} size="md" />
    <ProgressBar value={50} size="lg" />
  </div>
);

export const IndeterminadoESegmentado = () => (
  <div style={col}>
    <ProgressBar indeterminate />
    <ProgressBar segments={4} currentSegment={2} />
  </div>
);
