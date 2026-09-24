import { Slider } from '@onblide/ui';

export const Simples = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Slider label="Orçamento mensal" value={60} min={0} max={100} showValue hint="Em milhares de reais" />
  </div>
);

export const Faixa = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Slider range label="Faixa de prazo (dias)" value={[10, 45]} min={0} max={90} step={5} marks showValue />
  </div>
);

export const Estados = () => (
  <div style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Slider label="Bloqueado" value={30} disabled showValue />
    <Slider label="Consumo" value={90} tone="danger" showValue error="Limite quase atingido" />
  </div>
);
