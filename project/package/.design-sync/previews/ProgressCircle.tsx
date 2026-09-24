import { ProgressCircle } from '@onblide/ui';

export const Tons = () => (
  <div style={{ display: 'flex', gap: 20, padding: 16, alignItems: 'center' }}>
    <ProgressCircle value={85} tone="success" showLabel />
    <ProgressCircle value={55} tone="warning" showLabel />
    <ProgressCircle value={20} tone="danger" showLabel />
    <ProgressCircle value={40} tone="default" showLabel />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 20, padding: 16, alignItems: 'center' }}>
    <ProgressCircle value={60} size="sm" />
    <ProgressCircle value={60} size="md" showLabel />
    <ProgressCircle value={60} size="lg" showLabel />
    <ProgressCircle value={60} size="xl" showLabel label="Sprint" />
  </div>
);
