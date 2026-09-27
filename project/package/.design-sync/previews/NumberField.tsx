import { NumberField } from '@onblide/ui';

export const Split = () => (
  <div style={{ padding: 16, width: 220 }}>
    <NumberField label="Quantidade" value={4} min={1} max={20} />
  </div>
);

export const Stacked = () => (
  <div style={{ padding: 16, width: 220 }}>
    <NumberField label="Andares" value={12} controls="stacked" align="left" />
  </div>
);

export const ComPrefixo = () => (
  <div style={{ padding: 16, width: 220 }}>
    <NumberField label="Valor" prefix="R$" value={1234.5} decimals={2} controls="none" align="left" />
  </div>
);

export const ForaDoLimite = () => (
  <div style={{ padding: 16, width: 220 }}>
    <NumberField label="Desconto (%)" value={120} max={100} />
  </div>
);
