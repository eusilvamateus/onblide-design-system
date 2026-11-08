import { Stepper } from '@onblide/ui';

const etapas = [{ label: 'Escopo', hint: 'Entregáveis' }, { label: 'Orçamento' }, { label: 'Aprovação', optional: true }, { label: 'Entrega' }];

export const Horizontal = () => (
  <div style={{ padding: 16, width: 480 }}>
    <Stepper steps={etapas} current={1} />
  </div>
);

export const Vertical = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Stepper steps={etapas} current={1} variant="vertical" />
  </div>
);

export const Compacto = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Stepper steps={etapas} current={1} variant="compact" />
  </div>
);

export const ComErro = () => (
  <div style={{ padding: 16, width: 480 }}>
    <Stepper steps={[{ label: 'Escopo' }, { label: 'Orçamento', status: 'error', hint: 'Falta o valor' }, { label: 'Aprovação' }]} current={2} />
  </div>
);

export const Tamanhos = () => (
  <div style={{ padding: 16, width: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Stepper steps={etapas} current={1} size="sm" />
    <Stepper steps={etapas} current={1} size="md" />
    <Stepper steps={etapas} current={1} size="lg" />
  </div>
);
