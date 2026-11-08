import { NumberField, Select } from '@onblide/ui';

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

export const ComUnidade = () => (
  <div style={{ padding: 16, width: 280 }}>
    <NumberField label="Peso do pacote" value={1400} controls="none" align="left"
      endAddon={<Select embedded ariaLabel="Unidade" options={['g', 'kg']} defaultValue="g" />} />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, padding: 16, width: 220 }}>
    <NumberField size="sm" ariaLabel="Quantidade pequena" defaultValue={2} min={1} />
    <NumberField size="md" ariaLabel="Quantidade média" defaultValue={2} min={1} />
    <NumberField size="lg" ariaLabel="Quantidade grande" defaultValue={2} min={1} />
  </div>
);
